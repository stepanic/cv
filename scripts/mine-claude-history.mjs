#!/usr/bin/env node
// Mine full Claude Code usage history into data/generated/claude-code-stats.json.
//
// Sources, stitched together (newest wins per session):
//   1. Live transcripts   ~/.claude/projects/**/*.jsonl   (~30-day retention)
//   2. Backup repo        git history of dotclaude-backup — daily snapshots of
//      ~/.claude since 2026-05-12; the union of all commits extends coverage
//      back to ~April 2026 (each snapshot held the 30-day window of its day)
//   3. stats-cache.json   Claude Code's own daily aggregates since 2025-12-20
//   4. ~/.claude.json     firstStartTime + numStartups (since May 2025)
//
// PRIVACY: only aggregate numbers are emitted — token counts, session counts,
// histograms. No transcript content, prompts, project names or paths.
//
// Token counting mirrors CodexBar/ccusage: assistant events' message.usage,
// deduplicated by message.id:requestId; API-equivalent cost from public
// per-model pricing.
import { createInterface } from "node:readline";
import { createReadStream, readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync, spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLAUDE_DIR = process.env.CLAUDE_DIR ?? join(homedir(), ".claude");
const BACKUP_REPO = process.env.DOTCLAUDE_BACKUP ?? join(homedir(), "git/stepanic/dotclaude-backup");
const OUT = join(root, "data/generated/claude-code-stats.json");

// USD per token (API list prices; matches CodexBar's tables).
const PRICING = [
  [/fable/, { in: 1e-5, out: 5e-5, cw: 1.25e-5, cr: 1e-6 }],
  [/opus/, { in: 5e-6, out: 2.5e-5, cw: 6.25e-6, cr: 5e-7 }],
  [/sonnet/, { in: 3e-6, out: 1.5e-5, cw: 3.75e-6, cr: 3e-7 }],
  [/haiku/, { in: 1e-6, out: 5e-6, cw: 1.25e-6, cr: 1e-7 }],
];
const priceFor = (model) => PRICING.find(([re]) => re.test(model))?.[1];

// ── Aggregation state ────────────────────────────────────────────────────────
const seenMsg = new Set(); // message.id:requestId — dedup across snapshots
const sessions = new Map(); // sessionId → {first, last, messages, toolCalls}
const byModel = new Map(); // model → {in, out, cr, cw, usd}
const monthly = new Map(); // YYYY-MM → {sessions:Set, messages, toolCalls, tokens, usd}
const hourCounts = new Array(24).fill(0);
let events = 0;

const monthOf = (ts) => ts.slice(0, 7);
const bump = (map, key, init) => map.get(key) ?? map.set(key, init).get(key);

function ingestLine(line, sessionIdHint) {
  let e;
  try {
    e = JSON.parse(line);
  } catch {
    return;
  }
  if (!e.timestamp || (e.type !== "user" && e.type !== "assistant")) return;
  events++;
  const ts = e.timestamp;
  const sid = e.sessionId ?? sessionIdHint;
  const m = bump(monthly, monthOf(ts), { sessions: new Set(), messages: 0, toolCalls: 0, tokens: 0, usd: 0 });
  m.sessions.add(sid);
  m.messages++;
  const s = bump(sessions, sid, { first: ts, last: ts, messages: 0, toolCalls: 0 });
  s.messages++;
  if (ts < s.first) s.first = ts;
  if (ts > s.last) s.last = ts;
  hourCounts[new Date(ts).getHours()]++;

  if (e.type !== "assistant" || !e.message) return;
  const content = e.message.content;
  if (Array.isArray(content)) {
    const tools = content.filter((c) => c.type === "tool_use").length;
    s.toolCalls += tools;
    m.toolCalls += tools;
  }
  const u = e.message.usage;
  if (!u) return;
  const key = `${e.message.id}:${e.requestId}`;
  if (seenMsg.has(key)) return;
  seenMsg.add(key);
  const model = e.message.model ?? "unknown";
  if (model === "<synthetic>") return;
  const inT = u.input_tokens ?? 0;
  const outT = u.output_tokens ?? 0;
  const crT = u.cache_read_input_tokens ?? 0;
  const cwT = u.cache_creation_input_tokens ?? 0;
  const p = priceFor(model);
  const usd = p ? inT * p.in + outT * p.out + crT * p.cr + cwT * p.cw : 0;
  const mm = bump(byModel, model, { in: 0, out: 0, cr: 0, cw: 0, usd: 0 });
  mm.in += inT;
  mm.out += outT;
  mm.cr += crT;
  mm.cw += cwT;
  mm.usd += usd;
  m.tokens += inT + outT + crT + cwT;
  m.usd += usd;
}

// ── 1. Live transcripts ──────────────────────────────────────────────────────
async function ingestFile(stream, sessionIdHint) {
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) ingestLine(line, sessionIdHint);
}

const liveFiles = execSync(
  `find "${CLAUDE_DIR}/projects" -name '*.jsonl' -not -path '*/memory/*'`,
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
).trim().split("\n").filter(Boolean);

console.error(`live transcripts: ${liveFiles.length}`);
for (const f of liveFiles) {
  await ingestFile(createReadStream(f, "utf8"), f.split("/").pop().replace(".jsonl", ""));
}

// ── 2. Backup repo git history (union of daily snapshots) ───────────────────
if (existsSync(join(BACKUP_REPO, ".git"))) {
  const git = (args) =>
    execSync(`git -C "${BACKUP_REPO}" ${args}`, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  const commits = git("rev-list main").trim().split("\n"); // newest → oldest
  const latestBlobFor = new Map(); // path → {commit}
  for (const c of commits) {
    for (const path of git(`ls-tree -r --name-only ${c} -- data/projects`).trim().split("\n")) {
      if (path.endsWith(".jsonl") && !path.includes("/memory/") && !latestBlobFor.has(path)) {
        latestBlobFor.set(path, c);
      }
    }
  }
  // Skip files whose basename (sessionId) is already fully ingested live.
  const liveBase = new Set(liveFiles.map((f) => f.split("/").pop()));
  const toRead = [...latestBlobFor].filter(([p]) => !liveBase.has(p.split("/").pop()));
  console.error(`backup-only transcripts: ${toRead.length} (of ${latestBlobFor.size} unique)`);
  for (const [path, commit] of toRead) {
    const child = spawn("git", ["-C", BACKUP_REPO, "show", `${commit}:${path}`]);
    await ingestFile(child.stdout, path.split("/").pop().replace(".jsonl", ""));
  }
}

// ── 3 + 4. stats-cache and claude.json ───────────────────────────────────────
let statsCache = null;
const scPath = join(CLAUDE_DIR, "stats-cache.json");
if (existsSync(scPath)) {
  const sc = JSON.parse(readFileSync(scPath, "utf8"));
  statsCache = {
    trackedSince: sc.firstSessionDate,
    computedAt: sc.lastComputedDate,
    totalMessages: sc.totalMessages,
    totalSessions: sc.totalSessions,
    models: Object.keys(sc.modelUsage ?? {}),
  };
  // Fill months that predate transcript coverage from Claude Code's own
  // daily aggregates (tokens from dailyModelTokens, activity from
  // dailyActivity). Where both sources cover a month, keep the larger
  // (both undercount; this is a best-effort reconstruction).
  const scMonthly = new Map();
  for (const d of sc.dailyActivity ?? []) {
    const m = bump(scMonthly, monthOf(d.date), { messages: 0, toolCalls: 0, sessions: 0, tokens: 0 });
    m.messages += d.messageCount;
    m.toolCalls += d.toolCallCount;
    m.sessions += d.sessionCount;
  }
  for (const d of sc.dailyModelTokens ?? []) {
    const m = scMonthly.get(monthOf(d.date));
    if (m) m.tokens += Object.values(d.tokensByModel ?? {}).reduce((a, b) => a + b, 0);
  }
  for (const [month, scm] of scMonthly) {
    const mined = monthly.get(month);
    if (!mined) {
      monthly.set(month, {
        sessions: { size: scm.sessions }, // duck-typed: only .size is read below
        messages: scm.messages,
        toolCalls: scm.toolCalls,
        tokens: scm.tokens,
        usd: 0,
        source: "stats-cache",
      });
    } else if (scm.messages > mined.messages) {
      mined.messages = scm.messages;
      if (scm.sessions > mined.sessions.size) mined.sessions = { size: scm.sessions };
    }
  }
}

let meta = {};
const cj = join(homedir(), ".claude.json");
if (existsSync(cj)) {
  const j = JSON.parse(readFileSync(cj, "utf8"));
  meta = { firstStartTime: j.firstStartTime, numStartups: j.numStartups };
}

// ── Emit ─────────────────────────────────────────────────────────────────────
const projects = new Set(
  liveFiles.map((f) => f.split("/projects/")[1].split("/")[0]),
).size;

const totalsByModel = [...byModel]
  .map(([model, t]) => ({
    model,
    inputTokens: t.in,
    outputTokens: t.out,
    cacheReadTokens: t.cr,
    cacheWriteTokens: t.cw,
    totalTokens: t.in + t.out + t.cr + t.cw,
    apiEquivalentUSD: Math.round(t.usd * 100) / 100,
  }))
  .sort((a, b) => b.totalTokens - a.totalTokens);

const longest = [...sessions.values()].sort((a, b) => b.messages - a.messages)[0];

const out = {
  updated: new Date().toISOString(),
  note:
    "Aggregate telemetry mined from local Claude Code transcripts, daily git snapshots (dotclaude-sync) and Claude Code's own stats cache. Best-effort reconstruction — real usage is higher (see knownGap). No conversation content is published.",
  usingSince: meta.firstStartTime ?? null,
  numStartups: meta.numStartups ?? null,
  knownGap: {
    from: meta.firstStartTime?.slice(0, 7) ?? "2025-05",
    to: "2025-12",
    reason:
      "A corrupted installation forced a fresh reinstall; transcripts and stats from the first months are lost. Counts below therefore UNDERSTATE total usage.",
  },
  totals: {
    sessions: sessions.size,
    projects,
    messages: [...monthly.values()].reduce((a, m) => a + m.messages, 0),
    toolCalls: [...monthly.values()].reduce((a, m) => a + m.toolCalls, 0),
    transcriptEvents: events,
    tokens: totalsByModel.reduce((a, m) => a + m.totalTokens, 0),
    outputTokens: totalsByModel.reduce((a, m) => a + m.outputTokens, 0),
    apiEquivalentUSD:
      Math.round(totalsByModel.reduce((a, m) => a + m.apiEquivalentUSD, 0) * 100) / 100,
  },
  byModel: totalsByModel,
  monthly: [...monthly]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, m]) => ({
      month,
      sessions: m.sessions.size,
      messages: m.messages,
      toolCalls: m.toolCalls,
      tokens: m.tokens,
      apiEquivalentUSD: Math.round(m.usd * 100) / 100,
      ...(m.source ? { source: m.source } : {}),
    })),
  hourHistogram: hourCounts,
  longestSession: longest
    ? {
        messages: longest.messages,
        toolCalls: longest.toolCalls,
        hours:
          Math.round(((new Date(longest.last) - new Date(longest.first)) / 3.6e6) * 10) / 10,
      }
    : null,
  statsCache,
  recursion:
    "These numbers survive Claude Code's 30-day transcript retention because of dotclaude-sync — a backup tool for Claude Code's own state, built with Claude Code (github.com/stepanic/dotclaude-sync).",
};

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.error(`Wrote ${OUT}`);
console.log(
  JSON.stringify(
    { sessions: out.totals.sessions, tokens: out.totals.tokens, usd: out.totals.apiEquivalentUSD, months: out.monthly.length },
    null,
    2,
  ),
);
