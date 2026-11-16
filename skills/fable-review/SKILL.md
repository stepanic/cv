---
name: fable-review
description: Independent two-pass Fable 5.1 codebase review across 5 modes (diff, refactor, security, full, forensic). Pass A (Sonnet/Opus) runs read-only ground checks and maps entry points and file:line targets; Pass B (Fable 5.1) verifies claims against code and writes structured Markdown review and execution plans for Opus, with an isolated git worktree, annotated audit tag, and handoff prompt. Run when the user asks for a "Fable review", "Fable analysis", "have Fable check the repo", "refactor plan with Fable", "weekly Fable audit", or /fable-review [repo] [--mode diff|refactor|security|full|forensic].
---

# Fable Review — Independent two-model codebase audit (Fable analyzes, Opus executes)

This skill encodes a two-model workflow refined across 28 sessions (June – October 2026):
**one model (Opus) builds and iterates quickly; a second model (Fable 5.1) reviews a frozen commit read-only and writes structured Markdown documents into the repository that Opus subsequently executes step by step.**

It incorporates the quota and context safeguards from the 2026-10-16 incident postmortem (`docs/2026-10-17-postmortem-fable-subagenti-tjedni-limit.md`):
- **Never run a single-pass Fable review over a whole repository** (a single Fable pass reading whole files grows to ~600k context and costs $6–14 per repo).
- **Always run two passes (Pass A: Map + Ground Check → Pass B: Targeted Fable verification)** so Fable's context stays below ~150k tokens and costs ~$3–6.
- **At most one Fable agent at a time**, with explicit `effort: "medium"`.
- **Strictly read-only on code** (no production or test files are modified; only Markdown review documents are written).
- **Commit the review document as soon as it is written**, so a rate-limit 429 never leaves work stranded in `/private/tmp`.

Public repositories demonstrating the outputs of each mode:
- [`domovinatv/pay.domovina.ai`](https://github.com/domovinatv/pay.domovina.ai): `docs/reviews/2026-07-fable5/` (`full`), `docs/reviews/2026-10-fable51/` (`full`), `docs/reviews/2026-10-fable51-r2/` (`diff`), `docs/security/2026-10-16-security-audit-fable.md` (`security`), `docs/research/fable5-vs-opus48-side-by-side.md` (`forensic`)
- [`stepanic/stadion-maksimir-natjecaj-2026`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026): `docs/review/README.md`, `docs/review/2026-09-26-neovisni-review-glasanje.md`, `docs/review/2026-09-26-neovisni-review-wiring.md`, `docs/review/2026-10-09-neovisni-review-tjedan-glasaj.md` (tags `audit-fable-2026-09-26`, `audit-fable-2026-10-09`)
- [`domovinatv/energy.domovina.ai`](https://github.com/domovinatv/energy.domovina.ai): `docs/refactor/00-pregled.md` … `05-alati-testovi-docs.md` (`refactor`)
- [`domovinatv/domovina-fiskal`](https://github.com/domovinatv/domovina-fiskal): `docs/handoff/2026-10-02-pregled-koda-i-plan-refactora.md` (`refactor` + `forensic`)
- [`domovinatv/pipeline.domovina.ai`](https://github.com/domovinatv/pipeline.domovina.ai) and [`domovinatv/omm.domovina.ai`](https://github.com/domovinatv/omm.domovina.ai): `docs/security/2026-10-16-security-audit-fable.md` (`security`)

---

## 0. Pre-flight, mode selection, and `/usage` confirmation (REQUIRED FIRST)

1. **One repository per invocation.** If the user asks for multiple repositories, process them strictly **one after another**, never in parallel.
2. **Run the deterministic pre-flight script** on the target repository:
   ```bash
   ~/.claude/skills/fable-review/scripts/preflight.sh "<repo-path>"
   ```
3. **Select the mode (`mode`)** — if not specified by the user, recommend one based on `preflight.sh`:
   - **`diff`** *(weekly / PR / delta)* — the repo already has a prior Fable review or an `audit-fable-*` tag, or the user wants to review what Opus built this week / on the current branch before merging or deploying.
   - **`refactor`** *(architecture & cleanup plan)* — the user wants an architectural review and a phased refactor plan for Opus without changing behaviour.
   - **`security`** *(security & money audit)* — focused on threat modeling, auth boundaries, money/ledger flows, secrets, IDOR, race conditions, and edge cases.
   - **`full`** *(complete subsystem audit)* — first deep pass over a larger multi-package repo (combines `security` + `refactor` across subsystems with an `INDEX.md` and `implementation-plan.md`).
   - **`forensic`** *(model side-by-side)* — forensic comparison of git history by `Co-Authored-By` trailers with 0–100 scoring across dimensions.
4. **Check repository ownership** (same rule as `/wrap-up` step 0):
   - If the repository belongs to the user, output goes into `docs/` on `main` (or branch `docs/fable-review-<date>` if branch protection rejects direct push).
   - If the repository belongs to a third party or employer, write the review into the user's own notes/catalogue directory rather than the upstream tree, unless explicitly instructed otherwise.
5. **Ask the user for `/usage` (remaining weekly and 5-hour quota)** and show the `preflight.sh` summary (repo size, mode, estimated cost for Pass A + Pass B). Wait for confirmation. If the weekly quota is below ~15%, suggest running only Pass A or `diff` mode.

---

## 1. Isolated Git Worktree (never work in the live tree)

Parallel sessions often share the main working copy. Always create a detached worktree:

```bash
REPO="<absolute-repo-path>"
DEFAULT_BRANCH="$(git -C "$REPO" symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo main)"
WT="/private/tmp/fable-review-$(basename "$REPO")-$(date +%Y%m%d-%H%M%S)"
git -C "$REPO" fetch origin
git -C "$REPO" worktree add --detach "$WT" "origin/$DEFAULT_BRANCH"
```

---

## 2. Pass A: Map, Ground Check, and Invariants (`model: "sonnet"`, `effort: "medium"`)

Spawn a subagent with `model: "sonnet"`, `effort: "medium"` (or run inline if the repo is under 5,000 lines). Pass A reads broadly and cheaply so Fable does not have to:

1. **Ground Check (Read-Only Oracle):**
   - Run the existing static checks and test suites identified by `preflight.sh` (`npx tsc --noEmit`, `npm test` / `vitest run`, `flutter analyze`, `astro check`, `cargo check`, `forge test`).
   - Check whether `.gitignore` ignores any files required for a clean clone to build (e.g. `*.pem`, `*.sql`, generated types).
   - **Never** run commands that mutate production, staging, or external services.
2. **Context and intentional invariants:**
   - Read `CLAUDE.md`, `AGENTS.md`, `README.md`, `docs/` indexes, and ADRs (titles and summaries).
   - List **intentional invariants** (design choices documented as empirical or deliberate) so Pass B does not flag them as false positives.
   - Extract any `⚠️ REVIEW(fable)` or `TODO` markers in the code.
3. **Mode-specific mapping:**
   - **For `diff`:** Extract `git log --oneline <base>..HEAD` and `git diff --stat <base>..HEAD`, read the previous Fable review document, and map every changed file with line ranges and callers.
   - **For `refactor`:** Map module boundaries, the 10 largest files by line count, duplicated logic across packages, untested modules, and unreachable/dead code.
   - **For `security`:** List all entry points (routes, webhooks, cron jobs, admin endpoints, auth middleware, secret handling, money/token flows, uploads) with `path:line` and one sentence on why each is sensitive; run `npm audit --omit=dev` / `pip-audit` and secret greps.
   - **For `full`:** Partition the repository into **2 to 4 logical subsystems** (e.g. `1. Backend & DB`, `2. Web / UI`, `3. Mobile / SDK`, `4. Infra & Tests`) and map entry points and `path:line` hotspots for each.
   - **For `forensic`:** Extract the full commit table by `Co-Authored-By` trailer, lines added/removed per model, files touched by both models with the same goal, and reverted commits.
4. **Write the map to disk:**
   - Save `<output-dir>/<date>-00-map.md` (150–250 lines max, with exact `path:line` pointers and 15–30 prioritized hotspots).

---

## 3. Pass B: Fable 5.1 Deep Verification (`model: "fable"`, `effort: "medium"`)

Spawn **one** subagent with `model: "fable"`, `effort: "medium"` (in `full` mode on a large repo, run one subsystem at a time sequentially).

### Reading rules to include verbatim in the Fable prompt:
- **Your input is `<date>-00-map.md`**, not the whole repository.
- **Read selectively:** use `sed -n 'A,Bp' <file>` or `Read` with `offset`/`limit` (~150–200 lines at a time) around the `path:line` targets from the map. Read wider only when a trace in code leads further, and `Grep` before reading.
- **Never read the same file or large tool output twice.**
- **Do not trust documentation or comments blindly:** for every security or architectural claim in `docs/`, `CLAUDE.md`, or NatSpec, verify *which exact line of code enforces it* and *how it can be bypassed*.
- **Modify zero code, tests, or configuration.** Your only output is Markdown documentation.
- **Write findings to disk as you confirm them** (`Write` / `Edit`); do not hold the entire report in memory until the final turn.
- **Commit the document immediately after writing the first complete draft**, then amend/commit after major additions.
- If `context-guard.py` warns at ~180k–250k tokens: record progress, commit, and return.

---

## 4. Deliverable structure by mode

Every document starts with a metadata header:
- **Date:** `YYYY-MM-DD`
- **Reviewer:** `Claude Fable 5.1` (noting the primary implementing model from git history, e.g. `Claude Opus 5.5`)
- **Reviewed state (Commit SHA / Branch):** `<short-sha>` (plus Pass A ground-check results)
- **Scope:** what was inspected and what was excluded.

### Mode A: `diff` (`docs/reviews/<YYYY-MM-DD>-fable-diff-<topic>.md`)
1. **Verdict in 3–5 sentences** (ready for production vs blocked by 🔴 findings).
2. **Status of prior Fable findings** (table: ID, summary, status `✅ Fixed in <sha>` / `⚠️ Partial` / `❌ Open`).
3. **New findings on recent changes (`F-01` / `B-01`…):**
   - Severity badge: **🔴 Blocks merge/deploy** | **🟡 Important follow-up** | **🟢 Cleanup**.
   - `path:line` (in the frozen commit).
   - **Failure scenario** (concrete input/state → wrong runtime outcome).
   - **Proposed fix** (exact change for Opus).
   - **How to verify** (a test or command that fails today and passes after the fix).
4. **Rollout / Pre-deploy checklist** (migrations, fallback when external APIs fail, post-deploy verification query).
5. **What is well-built in this diff and should be kept.**

### Mode B: `refactor` (`docs/refactor/<YYYY-MM-DD>-code-review-and-refactor-plan.md`)
1. **State summary and model attribution** (size, test/CI baseline, main structural issues).
2. **Confirmed GOOD — DO NOT TOUCH (§ Invariants):**
   - Explicit list of files, wire formats, cryptographic/SQL latches, and business rules that Opus **must not** alter while refactoring.
3. **Catalogue of findings (`K1`..`Kn` or `R-01`..`R-nn`):**
   - Grouped by: *(a) Critical bugs & build/CI gaps*, *(b) Security & data integrity*, *(c) Architecture, duplication & oversized files ("single source of truth")*, *(d) Test gaps & ops hygiene*.
   - Each finding carries: **ID**, **Priority (`P0/P1/P2`)**, **Effort (`S/M/L`)**, **`path:line`**, **Problem**, **Proposed change**, **Acceptance criterion**.
4. **Items requiring a human decision:**
   - Contradictions in copy, legal text, pricing, or product rules that an agent must not guess.
5. **Phased execution plan for Opus (Wave 0 → Wave N):**
   - Ordered so every wave leaves the build and tests green (e.g. *Wave 0: CI + failing regression tests → Wave 1: Mechanical file split with barrel exports and zero behaviour change → Wave 2: Targeted logic fixes*).
   - Status tracking table (`| Step / ID | Status | Commit | Note |`) at the top for Opus to update in place.

### Mode C: `security` (`docs/security/<YYYY-MM-DD>-security-audit-fable.md`)
1. **Executive summary (5–10 lines)** and finding counts by severity (`Critical / High / Medium / Low / Info`).
2. **Threat model:** attackers, assets (funds, keys, PII, availability, API/LLM quota), entry points.
3. **Confirmed findings (`SEC-01`… / `MONEY-01`…):**
   - Severity, `path:line`, **step-by-step attack scenario**, impact, concrete fix, and verification test.
   - *Never copy a real secret or token value into the document* — record only `path:line` and key type.
4. **Unverified / For human check:** items that depend on external dashboard configuration (WAF, OAuth provider, cloud IAM) rather than repo code.
5. **Confirmed good controls** (so Opus does not weaken existing defenses).
6. **Checklist for Opus 5.5:** `- [ ] SEC-01 …` ordered by priority.

### Mode D: `full` (`docs/reviews/<YYYY-MM-DD>-fable51/`)
Writes a directory of linked documents:
- `INDEX.md` — executive summary, severity table across subsystems, **Coverage matrix (subsystem × dimension: `MONEY-BUG`, `SEC`, `BUG`, `RISK`, `REFACTOR`, `TEST-GAP`)**, top-10 priorities, and open questions for the owner.
- `<subsystem-1>.md`, `<subsystem-2>.md`… — detailed findings per subsystem.
- `implementation-plan.md` — master execution plan for Opus (`P0` → `P1` → `P2`, effort `S/M/L`, dependencies, "do not touch" warnings, and status table).

### Mode E: `forensic` (`docs/research/<YYYY-MM-DD>-model-forensics.md`)
1. **Chronological commit map by model** (`Co-Authored-By` counts, `+/-` lines, subsystems touched).
2. **Same-file comparisons ("controlled experiments"):** cases where both models touched the same file or bug (`git show <sha>` evidence of who introduced a bug or missed an edge case and who fixed it).
3. **0–100 rubric and scoring across dimensions:** *Edge-case coverage*, *Security-by-default*, *Trust-boundary reasoning*, *Blast-radius discipline*, *Churn / self-reverting commits*.
4. **Counterexamples:** where the heavier model over-engineered or regressed and the faster model was cleaner.

---

## 5. Commit, Tag, Cleanup, and Opus Handoff

1. **Commit and push only the Markdown review files** (remove the temporary `00-map.md` or fold its summary into the index):
   ```bash
   git -C "$WT" add <new-markdown-paths>
   git -C "$WT" commit -m "docs(review): Fable 5.1 <mode> review (<date>)" \
     -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
   ```
2. **Create an annotated audit tag** (used as the baseline by future `diff` runs):
   ```bash
   git -C "$WT" tag -a "audit-fable-$(date +%Y-%m-%d)" -m "Fable 5.1 <mode> review ($(date +%Y-%m-%d))"
   git -C "$WT" push origin HEAD:"$DEFAULT_BRANCH" --follow-tags
   ```
3. **Remove the temporary worktree:**
   ```bash
   git -C "$REPO" worktree remove "$WT"
   ```
4. **Write the Opus 5.5 handoff prompt to `~/.claude/handoffs/<repo>/` and clipboard:**
   ```bash
   dir="$HOME/.claude/handoffs/$(basename "$REPO")"; mkdir -p "$dir"
   f="$dir/$(date +%Y-%m-%d-%H%M)-fable-review-implementation.md"
   cat <<'EOF' | tee "$f" | pbcopy
   # Handoff — implement Fable 5.1 review findings (<repo-name>)

   Repo: <absolute-repo-path>
   Review & plan: <relative-path-to-review-md> (commit <sha>)

   ## Task (run on Opus 5.5)
   1. Read <relative-path-to-review-md> in full, especially "Confirmed GOOD — DO NOT TOUCH" and the execution plan.
   2. Execute in order starting from the first wave / P0 items:
      - <top 3-5 items with IDs and path:line>
   3. For each fix, write or extend a regression test first, verify all existing tests and typechecks pass, make an atomic semantic commit, and update the status table inside the review document itself (do not create a new status file).
   4. Stop and ask the owner before touching any item marked "For human decision".
   EOF
   ```
5. **Report to the user (concise):**
   - Commit SHA, branch, and `audit-fable-<date>` tag pushed.
   - Finding counts by severity and **top 3–5 findings** in one sentence each.
   - Actual subagent token cost vs the pre-flight estimate.
   - Path to the saved Opus handoff prompt (already in clipboard).
