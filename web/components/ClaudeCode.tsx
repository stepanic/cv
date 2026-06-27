"use client";

// Flagship "AI-native engineering" section: Claude Code telemetry mined from
// local transcripts + daily git snapshots (see scripts/mine-claude-history.mjs
// in the repo). All charts are hand-rolled inline SVG — no chart library.

import { EyeOff, Repeat2 } from "lucide-react";
import type { ClaudeCodeStats } from "@/lib/types";
import { useI18n, formatYearMonth } from "@/lib/i18n";
import { compactNumber } from "@/lib/format";
import { Section } from "./Section";

const DOTCLAUDE_SYNC_URL = "https://github.com/stepanic/dotclaude-sync";
const CODEXBAR_URL = "https://github.com/stepanic/CodexBar";
const MINER_URL =
  "https://github.com/stepanic/cv/blob/main/scripts/mine-claude-history.mjs";
const USAGE_RECORD_URL =
  "https://github.com/stepanic/cv/blob/main/docs/claude-usage-history.md";
const DAILY_RECON_URL =
  "https://github.com/stepanic/cv/blob/main/docs/claude-code-daily-reconstruction-2026.md";

function StatCard({
  value,
  label,
  sub,
  accent = false,
}: {
  value: string;
  label: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-5 transition-colors ${
        accent
          ? "border-accent-border bg-accent-soft"
          : "border-line bg-surface hover:bg-surfaceHover"
      }`}
    >
      <p
        className={`text-3xl font-bold tabular-nums sm:text-4xl ${
          accent ? "text-accent-bright" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-inkMuted">{label}</p>
      {sub ? <p className="mt-0.5 text-xs text-inkMuted/80">{sub}</p> : null}
    </div>
  );
}

/** Verification-status badge matching the public record's [VERIFIED]/[ESTIMATED] tags. */
function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const verified = status === "verified";
  return (
    <span
      className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
        verified ? "bg-accent-soft text-accent-bright" : "bg-surface text-inkMuted"
      }`}
    >
      {t(verified ? "claude.verified" : "claude.estimated")}
    </span>
  );
}

/** Facts local mining cannot see: Claude.ai, billing, pre-Dec-2025 era. */
function HistoryBlock({ history }: { history: NonNullable<ClaudeCodeStats["history"]> }) {
  const { t, n, locale } = useI18n();
  const hrLoc = locale === "hr" ? "hr-HR" : "en-US";
  const spend = history.billing.totalGross.value.toLocaleString(hrLoc, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const snap = history.claudeCode.earlyStatsSnapshot;
  const early = history.claudeCode.reconstructed;

  const rows = [
    {
      key: "convos",
      value: n(history.claudeAi.conversations.value),
      label: t("claude.histConvos"),
      sub: t("claude.histConvosSub", {
        date: formatYearMonth(history.claudeAi.conversations.capturedAt, locale),
      }),
      status: history.claudeAi.conversations.status,
    },
    {
      key: "spend",
      value: `€${spend}`,
      label: t("claude.histSpend"),
      sub: t("claude.histSpendSub", {
        invoices: history.billing.invoices,
        from: formatYearMonth(history.billing.span.from.slice(0, 7), locale),
        to: formatYearMonth(history.billing.span.to.slice(0, 7), locale),
        months: history.billing.span.months,
        avg: history.billing.averagePerMonth.toLocaleString(hrLoc, {
          maximumFractionDigits: 0,
        }),
      }),
      status: history.billing.totalGross.status,
    },
    {
      key: "early",
      value: n(early.prompts),
      label: t("claude.histEarly"),
      sub: t("claude.histEarlySub", {
        period: early.period,
        prompts: n(early.prompts),
        projects: early.projects,
        messages: n(early.approxMessages),
      }),
      status: early.status,
    },
    {
      key: "snapshot",
      value: n(snap.sessions),
      label: t("claude.histSnapshot", {
        date: formatYearMonth(snap.capturedAt, locale),
      }),
      sub: t("claude.histSnapshotSub", {
        sessions: n(snap.sessions),
        longest: snap.longestSession,
        streak: snap.longestStreakDays,
        mostActive: snap.mostActiveDay,
      }),
      status: snap.status,
    },
  ];

  return (
    <div className="mt-10">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-inkMuted">
        {t("claude.historyTitle")}
      </h3>
      <p className="mt-1 max-w-3xl text-xs text-inkMuted">{t("claude.historySub")}</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {rows.map((r) => (
          <li key={r.key} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-2xl font-bold tabular-nums text-ink">{r.value}</p>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-1 text-sm text-inkMuted">{r.label}</p>
            <p className="mt-0.5 text-xs text-inkMuted/80">{r.sub}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <a
          href={USAGE_RECORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inkMuted underline decoration-line underline-offset-2 hover:text-inkSoft"
        >
          {t("claude.historyDocLink")} →
        </a>
        <a
          href={DAILY_RECON_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inkMuted underline decoration-line underline-offset-2 hover:text-inkSoft"
        >
          {t("claude.dailyDocLink")} →
        </a>
      </p>
    </div>
  );
}

/** "claude-opus-4-7" → "opus-4-7", "claude-haiku-4-5-20251001" → "haiku-4-5". */
function cleanModelName(model: string): string {
  return model.replace(/^claude-/, "").replace(/-\d{8}$/, "");
}

/** Monthly token bars + a hatched placeholder for the known data gap. */
function MonthlyChart({
  monthly,
  gap,
  reconstructed,
}: {
  monthly: ClaudeCodeStats["monthly"];
  gap: ClaudeCodeStats["knownGap"];
  reconstructed?: { prompts: number; projects: number } | null;
}) {
  const { t, n, locale } = useI18n();

  const W = 720;
  const H = 196;
  const TOP = 18; // room for value labels above bars
  const BOTTOM = 18; // room for month labels
  const chartH = H - TOP - BOTTOM;
  const baseline = TOP + chartH;

  const GAP_W = 116; // hatched knownGap region
  const GAP_PAD = 14;
  const barGap = 10;
  const x0 = GAP_W + GAP_PAD;
  const barW = (W - x0 - barGap * (monthly.length - 1)) / monthly.length;

  // sqrt scale: early months are 3-5 orders of magnitude below the peak.
  const sqrtMax = Math.sqrt(Math.max(...monthly.map((m) => m.tokens), 1));

  const gapFrom = formatYearMonth(gap.from, locale);
  const gapTo = formatYearMonth(gap.to, locale);

  return (
    <figure className="mt-10">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-inkMuted">
        {t("claude.monthlyTitle")}
      </h3>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t("claude.monthlyAria")}
        className="mt-4 h-auto w-full"
      >
        <defs>
          <pattern
            id="cc-gap-hatch"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="7" className="stroke-inkMuted" strokeWidth="1" opacity="0.35" />
          </pattern>
        </defs>

        {/* knownGap placeholder — lost months before the first recorded one */}
        <rect
          x={0.75}
          y={TOP + 0.75}
          width={GAP_W - 1.5}
          height={chartH - 1.5}
          rx={5}
          fill="url(#cc-gap-hatch)"
          className="stroke-inkMuted"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.7"
        />
        <text
          x={GAP_W / 2}
          y={TOP + chartH / 2 - 4}
          textAnchor="middle"
          fontSize="10"
          className="fill-inkMuted"
        >
          {t("claude.gapLabelTop", { from: gapFrom, to: gapTo })}
        </text>
        <text
          x={GAP_W / 2}
          y={TOP + chartH / 2 + 10}
          textAnchor="middle"
          fontSize="10"
          className="fill-inkMuted"
        >
          {t("claude.gapLabelBottom")}
        </text>

        {monthly.map((m, i) => {
          const x = x0 + i * (barW + barGap);
          const h =
            m.tokens === 0 ? 1.5 : Math.max((Math.sqrt(m.tokens) / sqrtMax) * chartH, 3);
          const cx = x + barW / 2;
          return (
            <g key={m.month}>
              <rect
                x={x}
                y={baseline - h}
                width={barW}
                height={h}
                rx={3}
                className="fill-accent"
                opacity={0.45 + 0.55 * (Math.sqrt(m.tokens) / sqrtMax)}
              />
              <text
                x={cx}
                y={Math.max(baseline - h - 5, 11)}
                textAnchor="middle"
                fontSize="10"
                className="fill-inkSoft"
              >
                {compactNumber(m.tokens, locale)}
              </text>
              <text
                x={cx}
                y={H - 4}
                textAnchor="middle"
                fontSize="10"
                className="fill-inkMuted"
              >
                {formatYearMonth(m.month, locale)}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-inkMuted">
        {reconstructed
          ? t("claude.gapNoteFull", {
              from: gapFrom,
              to: gapTo,
              prompts: n(reconstructed.prompts),
              projects: reconstructed.projects,
            })
          : t("claude.gapNote", { from: gapFrom, to: gapTo })}
      </figcaption>
    </figure>
  );
}

/** Daily API-equivalent spend (USD) — sqrt-scaled inline-SVG bars, same hatched
 *  knownGap treatment as MonthlyChart; peak day labelled, every bar tooltipped. */
function DailyChart({
  daily,
  gap,
}: {
  daily: ClaudeCodeStats["daily"];
  gap: ClaudeCodeStats["knownGap"];
}) {
  const { t, n, locale } = useI18n();

  const W = 720;
  const H = 200;
  const TOP = 20; // room for the peak value label
  const BOTTOM = 18; // room for month labels
  const chartH = H - TOP - BOTTOM;
  const baseline = TOP + chartH;

  const GAP_W = 72; // hatched knownGap region (the lost pre-2026 era)
  const GAP_PAD = 12;
  const barGap = 1.5;
  const x0 = GAP_W + GAP_PAD;
  const count = daily.length || 1;
  const barW = (W - x0 - barGap * (count - 1)) / count;

  // sqrt scale: daily spend spans <$1 to >$500.
  const sqrtMax = Math.sqrt(Math.max(...daily.map((d) => d.usd), 1));
  const peakIdx = daily.reduce((best, d, i) => (d.usd > daily[best]!.usd ? i : best), 0);

  const gapFrom = formatYearMonth(gap.from, locale);
  const gapTo = formatYearMonth(gap.to, locale);
  const usd0 = (v: number) => `$${n(Math.round(v))}`;

  return (
    <figure className="mt-10">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-inkMuted">
        {t("claude.dailyTitle")}
      </h3>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t("claude.dailyAria")}
        className="mt-4 h-auto w-full"
      >
        <defs>
          <pattern
            id="cc-daily-gap-hatch"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="7" className="stroke-inkMuted" strokeWidth="1" opacity="0.35" />
          </pattern>
        </defs>

        {/* knownGap placeholder — the lost era before daily transcripts begin */}
        <rect
          x={0.75}
          y={TOP + 0.75}
          width={GAP_W - 1.5}
          height={chartH - 1.5}
          rx={5}
          fill="url(#cc-daily-gap-hatch)"
          className="stroke-inkMuted"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.7"
        />
        <text x={GAP_W / 2} y={TOP + chartH / 2 - 4} textAnchor="middle" fontSize="10" className="fill-inkMuted">
          {t("claude.gapLabelTop", { from: gapFrom, to: gapTo })}
        </text>
        <text x={GAP_W / 2} y={TOP + chartH / 2 + 10} textAnchor="middle" fontSize="10" className="fill-inkMuted">
          {t("claude.gapLabelBottom")}
        </text>

        {daily.map((d, i) => {
          const x = x0 + i * (barW + barGap);
          const h = d.usd <= 0 ? 1.5 : Math.max((Math.sqrt(d.usd) / sqrtMax) * chartH, 2);
          const monthStart = i === 0 || d.day.slice(5, 7) !== daily[i - 1]!.day.slice(5, 7);
          return (
            <g key={d.day}>
              <rect
                x={x}
                y={baseline - h}
                width={barW}
                height={h}
                rx={1}
                className="fill-accent"
                opacity={0.4 + 0.6 * (Math.sqrt(d.usd) / sqrtMax)}
              >
                <title>{`${d.day}: ${usd0(d.usd)}`}</title>
              </rect>
              {i === peakIdx ? (
                <text
                  x={x + barW / 2}
                  y={Math.max(baseline - h - 5, 11)}
                  textAnchor="middle"
                  fontSize="10"
                  className="fill-inkSoft"
                >
                  {usd0(d.usd)}
                </text>
              ) : null}
              {monthStart ? (
                <text x={x} y={H - 4} textAnchor="start" fontSize="9" className="fill-inkMuted">
                  {formatYearMonth(d.day.slice(0, 7), locale)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-inkMuted">
        {t("claude.dailyNote")}{" "}
        <a
          href={DAILY_RECON_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-line underline-offset-2 hover:text-inkSoft"
        >
          {t("claude.dailyDocLink")} →
        </a>
      </figcaption>
    </figure>
  );
}

/** The 30-day retention blind spot, in dollars — local window vs full record. */
function BlindSpot({ recovered }: { recovered: ClaudeCodeStats["recovered"] }) {
  const { t, n } = useI18n();
  const usd0 = (v: number) => `$${n(Math.round(v))}`;
  return (
    <aside className="mt-6 rounded-lg border border-accent-border bg-accent-soft p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-bright">
        <EyeOff className="h-4 w-4" aria-hidden />
        {t("claude.blindSpotTitle")}
      </h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-inkSoft">
        {t("claude.blindSpotBody", {
          local: usd0(recovered.localUSD),
          full: usd0(recovered.fullUSD),
          window: recovered.window,
          retention: recovered.retentionDays,
        })}
      </p>
      <p className="mt-2 text-sm font-semibold text-accent-bright">
        {t("claude.blindSpotRecovered", { delta: usd0(recovered.deltaUSD) })}
      </p>
    </aside>
  );
}

/** Horizontal share-of-tokens bars: top 5 models + "other". */
function ModelMix({ byModel }: { byModel: ClaudeCodeStats["byModel"] }) {
  const { t, locale } = useI18n();
  const total = byModel.reduce((s, m) => s + m.totalTokens, 0) || 1;

  const top = byModel.slice(0, 5).map((m) => ({
    name: cleanModelName(m.model),
    tokens: m.totalTokens,
  }));
  const restTokens = byModel.slice(5).reduce((s, m) => s + m.totalTokens, 0);
  const rows =
    restTokens > 0 ? [...top, { name: t("claude.otherModels"), tokens: restTokens }] : top;
  const maxShare = Math.max(...rows.map((r) => r.tokens / total), 0.01);

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-inkMuted">
        {t("claude.modelMix")}
      </h3>
      <p className="mt-1 text-xs text-inkMuted">{t("claude.modelMixSub")}</p>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => {
          const share = row.tokens / total;
          return (
            <li key={row.name} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate font-mono text-xs text-inkSoft">
                {row.name}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: `${Math.max((share / maxShare) * 100, 1.5)}%` }}
                />
              </span>
              <span className="w-24 shrink-0 text-right text-xs tabular-nums text-inkMuted">
                {(share * 100).toLocaleString(locale === "hr" ? "hr-HR" : "en-US", {
                  maximumFractionDigits: 1,
                  minimumFractionDigits: share >= 0.1 ? 0 : 1,
                })}
                % · {compactNumber(row.tokens, locale)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** 24 thin bars: message events by local hour of day. */
function HourHistogram({ hours }: { hours: number[] }) {
  const { t } = useI18n();
  const W = 360;
  const H = 120;
  const BOTTOM = 16;
  const chartH = H - BOTTOM;
  const gap = 4;
  const barW = (W - gap * (hours.length - 1)) / hours.length;
  const max = Math.max(...hours, 1);

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-inkMuted">
        {t("claude.hourTitle")}
      </h3>
      <p className="mt-1 text-xs text-inkMuted">{t("claude.hourSub")}</p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t("claude.hourAria")}
        className="mt-4 h-auto w-full"
      >
        {hours.map((v, hour) => {
          const x = hour * (barW + gap);
          const h = v === 0 ? 1.5 : Math.max((v / max) * chartH, 2);
          return (
            <g key={hour}>
              <rect
                x={x}
                y={chartH - h}
                width={barW}
                height={h}
                rx={2}
                className={v === 0 ? "fill-line" : "fill-accent"}
                opacity={v === 0 ? 1 : 0.45 + 0.55 * (v / max)}
              >
                <title>{`${String(hour).padStart(2, "0")}:00 — ${v}`}</title>
              </rect>
              {hour % 6 === 0 ? (
                <text
                  x={x + barW / 2}
                  y={H - 4}
                  textAnchor="middle"
                  fontSize="9"
                  className="fill-inkMuted"
                >
                  {String(hour).padStart(2, "0")}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ClaudeCode({ claude }: { claude: ClaudeCodeStats }) {
  const { t, n, locale } = useI18n();
  const totals = claude.totals;

  const dateFmt = { year: "numeric", month: "long" } as const;
  const sinceDate = new Date(claude.usingSince).toLocaleDateString(
    locale === "hr" ? "hr-HR" : "en-US",
    dateFmt,
  );
  // numStartups counts launches of the current install only — it post-dates
  // the corruption-era reinstalls, so it must not claim the earlier start date.
  const launchesSince = new Date(claude.installFirstStart ?? claude.usingSince).toLocaleDateString(
    locale === "hr" ? "hr-HR" : "en-US",
    dateFmt,
  );
  const updatedDate = new Date(claude.updated).toLocaleDateString(
    locale === "hr" ? "hr-HR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );
  const usd = `$${n(Math.round(totals.apiEquivalentUSD))}`;
  const longestHours = claude.longestSession.hours.toLocaleString(
    locale === "hr" ? "hr-HR" : "en-US",
    { maximumFractionDigits: 1 },
  );

  return (
    <Section
      id="claude-code"
      heading={t("claude.heading")}
      subheading={t("claude.subheading", { date: sinceDate })}
    >
      {/* Big numbers */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          accent
          value={compactNumber(totals.tokens, locale)}
          label={t("claude.tokens")}
        />
        <StatCard value={usd} label={t("claude.apiValue")} />
        <StatCard
          value={n(totals.sessions)}
          label={t("claude.sessions")}
          sub={t("claude.sessionsSub", { projects: n(totals.projects) })}
        />
        <StatCard
          value={n(totals.messages)}
          label={t("claude.messages")}
          sub={t("claude.messagesSub", { toolCalls: n(totals.toolCalls) })}
        />
        <StatCard
          value={n(claude.numStartups)}
          label={t("claude.launches")}
          sub={t("claude.launchesSub", { date: launchesSince })}
        />
        <StatCard
          value={t("claude.longestSessionValue", { hours: longestHours })}
          label={t("claude.longestSession")}
          sub={t("claude.longestSessionSub", {
            messages: n(claude.longestSession.messages),
            toolCalls: n(claude.longestSession.toolCalls),
          })}
        />
      </div>

      <MonthlyChart
        monthly={claude.monthly}
        gap={claude.knownGap}
        reconstructed={claude.history?.claudeCode.reconstructed ?? null}
      />

      <DailyChart daily={claude.daily} gap={claude.knownGap} />
      <BlindSpot recovered={claude.recovered} />

      {claude.history ? <HistoryBlock history={claude.history} /> : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <ModelMix byModel={claude.byModel} />
        <HourHistogram hours={claude.hourHistogram} />
      </div>

      {/* Recursion callout */}
      <aside className="mt-10 rounded-lg border border-accent-border bg-accent-soft p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-bright">
          <Repeat2 className="h-4 w-4" aria-hidden />
          {t("claude.recursionTitle")}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-inkSoft">
          {t("claude.recursionPre")}
          <a
            href={DOTCLAUDE_SYNC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-accent-bright underline decoration-accent-border underline-offset-2 hover:decoration-accent-bright"
          >
            dotclaude-sync
          </a>
          {t("claude.recursionMid")}
          <a
            href={CODEXBAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-accent-bright underline decoration-accent-border underline-offset-2 hover:decoration-accent-bright"
          >
            CodexBar
          </a>
          {t("claude.recursionPost")}
        </p>
      </aside>

      {/* Methodology */}
      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-inkMuted">
        <span className="font-semibold">{t("claude.methodologyLabel")}:</span>{" "}
        {claude.note}{" "}
        <a
          href={MINER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-line underline-offset-2 hover:text-inkSoft"
        >
          {t("claude.methodologyLink")} →
        </a>
      </p>
      <p className="mt-2 text-xs text-inkMuted">{t("claude.updated", { date: updatedDate })}</p>
    </Section>
  );
}
