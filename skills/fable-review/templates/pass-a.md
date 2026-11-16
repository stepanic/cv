# Pass A: map and ground check (Sonnet, effort medium)

You map the repository cheaply so that the Fable pass reads only targeted slices. Your prompt gives you `WT` (frozen
worktree), `OUT` (output directory), the mode, the frozen SHA, and the destination (`COMMIT` or `LOCAL-ONLY`).

## Rules

- Read with `grep -rn` and `sed -n 'A,Bp'`. Never `cat` whole files. Never read the same file twice.
- Change nothing in code, tests or configuration.
- Never run anything that writes to production, staging, sandboxes or external services.
- LOCAL-ONLY: write only into `OUT`, which is outside the repository. Never create a file inside `WT`. Never commit.
- COMMIT: write into `OUT` inside `WT` and commit the map as soon as it is written (`git -C "$WT" add <map> && git -C "$WT" commit`).

## 1. Ground check

Run the read-only checks that preflight listed: typecheck (`npx tsc --noEmit`, `astro check`), lint, unit tests
(`npx vitest run`, `flutter analyze`, `cargo check`, `forge test`).

- The worktree has no `node_modules` or build caches. Install with lifecycle scripts disabled (`npm ci --ignore-scripts`,
  `flutter pub get`). If install fails or needs secrets, record "ground check skipped: <reason>". Never invent results.
- Skip any test suite that needs `.env`, network credentials or a live database, and say so.
- Record each command with pass/fail and the failure count.

## 2. Context and intended invariants

Read `CLAUDE.md`, `AGENTS.md`, `README.md`, the `docs/` index and ADR titles and summaries. List the **intended
invariants** (decisions marked deliberate or empirical) so the Fable pass does not report them as false positives.
Collect `REVIEW(fable)` and `TODO` markers from preflight.

## 3. Map by mode

- `diff`: `git log --oneline <base>..HEAD` and `git diff --stat <base>..HEAD`, where base is the `--base` ref if the user gave one, else the last
  `audit-*` tag or, for LOCAL-ONLY, the SHA in the header of the previous local report. Read the previous review document. For each
  changed file give line ranges and its callers.
- `refactor`: module structure, the 10 largest files by lines, duplicated implementations, untested areas, dead code.
- `security`: every entry point (routes, webhooks, cron, admin, auth middleware, secrets handling, money and ledger
  flows, uploads) with `path:line` and one sentence on why it is sensitive. Run `npm audit --omit=dev` / `pip-audit` if
  available. Grep for secrets in the tree and with `git log -S`.
- `full`: split the repo into 2-4 subsystems and produce the `security` map for each.
- `forensic`: a table of all commits with `Co-Authored-By` trailers, lines added/removed per model, files touched by
  more than one model (candidates for `git show` comparison), and reverted commits.

## 4. Output

Write `OUT/<date>-00-map.md` (150-250 lines): header with SHA and ground-check results, invariants, and 15-30 hotspots
ordered by risk, each with `path:line` and why. End with "Not covered" listing what you did not map.
Return a five-line summary.
