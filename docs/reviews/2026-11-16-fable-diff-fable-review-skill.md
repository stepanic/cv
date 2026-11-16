# Fable diff review: `skills/fable-review` (229618f..fb269d4)

- Date: 2026-11-16
- Reviewer: Fable 5.2 (`claude-fable-5-2`), Pass B. Pass A map by Opus 5.5.
- Code authors: both commits in the diff are Opus 5.5 (whole history: Opus 5 (1M) 23+10, Opus 4.8 18, Opus 5.5 15,
  Fable 5 6, Antigravity 2).
- Reviewed state: frozen SHA `fb269d4` (origin/main), branch `fable-review/2026-11-16-diff`, map committed on top as
  `cf0b724`. Diff base `229618f`, 2 commits, 14 files, +656/−492.
- Ground check (from the map): `bash -n preflight.sh` pass, `py_compile salvage.py` pass, `salvage.py` on a real
  transcript pass (31 calls, `finished=unknown`), live `preflight.sh --mode diff --base 229618f` pass. `shellcheck` not
  installed. Web build not run.
- Scope: `skills/fable-review/**` (scripts, SKILL.md, SKILL.hr.md, templates, README) and the changed strings in
  `web/content/blog.ts`. Not reviewed: the `web/` build, the agy copy of the skill outside the repo, and the
  finish/push path at runtime (it runs after this review; F-01 is derived from the documented commands, not from a run).
- Method: each script read once in full; failures marked "proven" were reproduced with scratch repositories and a
  synthetic transcript outside the repo. No code was changed.

## 1. Verdict

The delta is already on `origin/main` and is usable for the common path (own GitHub repo, review of `origin/<default>`),
which is the path this very review ran on. There is one blocker on a documented side path: SKILL.md tells the model to
base the worktree on an unpushed feature branch and then the finish step pushes that branch's commits to the default
branch (F-01). Six 🟡 items weaken guarantees the skill states as absolute: the COMMIT/LOCAL-ONLY decision ignores the
host (F-02), preflight can hang (F-03), and salvage cannot tell a finished agent from a dead one (F-04). Fix F-01 to
F-04 before the next review of a client repo or of a feature branch; the rest is cleanup.

## 2. Status of previous findings

No previous review of this skill exists (the base was given by the user with `--base`, no `audit-*` baseline in the
map), so there is nothing to track.

## 3. New findings

Counts: 🔴 1, 🟡 6, 🟢 8.

### F-01 🔴 Feature-branch `diff` review pushes the unreviewed feature commits to the default branch

- Where: `skills/fable-review/SKILL.md:71` together with `SKILL.md:99-102`.
- Scenario: the user asks for a `diff` review of an unpushed branch `feat/x` (5 commits ahead of `origin/main`). Line 71
  says "base the worktree on that branch instead", so `fable-review/<date>-diff` = `feat/x` + map + review. Step 4 then
  runs `rebase origin/main` and `push origin HEAD:main --follow-tags`. The 5 feature commits land on `main` together
  with the Markdown, before anyone acted on the review, and the audit tag goes with them. The inline comment "only
  Markdown files changed, rebase is safe" is false on this path. Where `main` deploys on push, this deploys the code
  under review.
- Fix for Opus: in step 4, guard the push: `git -C "$WT" diff --name-only "origin/$DEFAULT_BRANCH"...HEAD` must list
  only files under `$OUT`; otherwise do not push to the default branch, push `fable-review/<date>-<mode>` (or leave it
  local) and tell the user. State the feature-branch case explicitly in step 4, in both SKILL.md and SKILL.hr.md
  (SKILL.hr.md does not have line 71 at all, see F-13).
- Verify: scratch repo with a bare origin, branch with one code commit, follow steps 1 and 4 literally; today
  `git log origin/main` shows the code commit, after the fix it does not.

### F-02 🟡 Destination check ignores the host and treats the owner as a regex: foreign hosts get COMMIT (proven)

- Where: `scripts/preflight.sh:55` (owner = first path segment, host discarded) and `:76` (`grep -qi " $OWNER "`).
- Scenario, with `FABLE_REVIEW_OWN_OWNERS=stepanic`:
  - `https://gitlab.example.com/stepanic/x.git` → `COMMIT`
  - `git@bitbucket.org:stepanic/x.git` → `COMMIT`
  - `ssh://git@github.example:22/stepanic/x` → `COMMIT`
  - `https://evil.example/s.epanic/x` → `COMMIT (owner 's.epanic' is in the own-owner list)` (`.` matched as regex)
  A client's self-hosted GitLab group or Bitbucket workspace that shares a name with an own GitHub owner is classified
  as own, and the review (possibly security findings) is committed, tagged and pushed into the client's repository.
  This is the one decision the skill says is "never guesswork".
- Not a problem: `ssh://…:22/owner/repo` parses correctly (hotspot 3); scp-style URLs without `git@`
  (`org-1@github.com:stepanic/x.git`) and relative paths fail safe to `LOCAL-ONLY`.
- Fix for Opus: parse host and owner separately; compare `host/owner` literally and whole-string
  (`grep -qixF -- "$HOST/$OWNER"` over one entry per line). Own-owner entries without a host mean `github.com/<owner>`.
  Any host not in the list → `LOCAL-ONLY`. Accept `[^@]+@host:` in the scp form.
- Verify: the four URLs above must print `LOCAL-ONLY`; `git@github.com:stepanic/cv.git` and
  `https://github.com/Stepanic/cv` must still print `COMMIT`.

### F-03 🟡 `--base` or `--mode` as the last argument hangs preflight forever (proven)

- Where: `scripts/preflight.sh:16,18`.
- Scenario: `bash preflight.sh <repo> --base` (or `--mode`). `shift 2` with `$#`=1 fails without shifting, and with no
  `set -e` the `while` loop spins. Reproduced: killed by a 5 s alarm, exit 142, no output. In the skill this happens
  when `$ARGUMENTS` ends in a bare flag; the Bash tool call burns its full timeout and returns nothing.
- Fix for Opus: `--base) [ $# -ge 2 ] || { echo "ERROR: --base needs a value" >&2; exit 2; }; DIFF_BASE="$2"; shift 2 ;;`
  and the same for `--mode`.
- Verify: `perl -e 'alarm 5; exec @ARGV' bash preflight.sh . --base; echo $?` prints 142 today, 2 after the fix.

### F-04 🟡 Salvage cannot tell finished from dead: `Finished` is always `unknown`, "Final report" may be mid-run chatter (proven)

- Where: `scripts/salvage.py:109,121` (`meta.get('finished')`) and `:78-79,114` (last non-empty text block).
- Scenario: Claude Code's `.meta.json` has no `finished` key (map ground check: keys are `agentType, description,
  toolUseId, spawnDepth, requestShape, requestNonInteractive`), so every run prints `finished=unknown`. With a
  synthetic transcript whose last line is a `tool_use` (agent killed mid-run), the file still has a `## Final report`
  section containing "Now checking the second file.". SKILL.md:28-34 and the docstring promise the finished / failed /
  rate-limited / stopped cases are covered; the output gives the orchestrator no way to distinguish them, and a
  rate-limited agent's last remark is presented as its report.
- Fix for Opus: derive the state from the transcript. A real transcript carries `message.stop_reason` on the last line
  of each call (observed: `tool_use` on final lines, `None` on partial ones). Take the last assistant line with a
  non-null `stop_reason`: `end_turn` → `finished`; `tool_use` or anything else → `interrupted (<stop_reason>)`; model
  `<synthetic>` or `isApiErrorMessage` on the last line → `api-error` and print its text. Title the section
  "Final report" only for `finished`, otherwise "Last text before the agent stopped". Drop the `meta['finished']` read.
- Verify: the 4-line synthetic transcript (text, tool_use, text, tool_use) must print `finished=interrupted` and no
  "Final report" heading; a transcript ending with a text block and `stop_reason: end_turn` must print `finished`.

### F-05 🟡 `diff` mode without `--base` estimates on the whole repository; a bad `--base` is not an error (proven)

- Where: `scripts/preflight.sh:158-168`, `:184`; SKILL.md:14-15.
- Scenario 1: SKILL.md says the diff base defaults to the last `audit-*` tag, and preflight already computes `LAST_TAG`
  (`:145`), but the diff section runs only when `--base` is given. `--mode diff` on a tagged 60k-line repo prints the
  ">= 50000" band ("$5-9, use 'full' mode") for a 300-line delta, and the user decides on quota from that number.
- Scenario 2: `--base nope` prints `ERROR: 'nope' is not a commit` on stdout, exits 0 and falls back to the repo-size
  estimate. `--bsae HEAD` (typo, `:20` drops unknown flags) prints no diff section and no warning (both reproduced).
- Scenario 3: preflight never fetches, so `DIFF_BASE..origin/<default>` and the printed base SHA are those of the last
  fetch; SKILL step 1 fetches afterwards and the worktree may be at a newer commit than the one that was estimated.
- Fix for Opus: when `MODE=diff` and `DIFF_BASE` is empty, set `DIFF_BASE="$LAST_TAG"` (say so in the output); exit 2
  on an invalid base and on unknown flags; move the `git fetch origin` (with tags) in SKILL step 0 before preflight, or
  print "origin last fetched: <mtime of FETCH_HEAD>".
- Verify: in a repo with an `audit-*` tag, `preflight.sh . --mode diff` must print a `DIFF BASE` section;
  `preflight.sh . --base nope; echo $?` must print non-zero.

### F-06 🟡 Pass A install step contradicts the LOCAL-ONLY rule, and the cleanup check cannot see it (proven)

- Where: `templates/pass-a.md:11` ("Never create a file inside `WT`") vs `:19` (`npm ci --ignore-scripts`,
  `flutter pub get` in the worktree); `SKILL.md:108`.
- Scenario: for an external repo Pass A either skips every ground check (to obey line 11) or writes `node_modules`
  into the worktree (to obey line 19). In the second case `git status --porcelain` is still empty because the
  directory is gitignored (reproduced: `porcelain=[]`, `worktree remove` succeeds), so the check "nothing was written
  into the repo" passes without proving it. `flutter pub get` can also rewrite a tracked `pubspec.lock`, which makes
  the check fail with no instruction for what to do. Separately, `npx vitest run` / `forge test` execute the external
  repository's own code and config on this machine; `--ignore-scripts` covers only the install.
- Fix for Opus: reword line 11 to "never create or modify a tracked or untracked-unignored file inside `WT`; installs
  into gitignored paths are allowed"; in SKILL.md:108 say what the check proves, and that a non-empty result is listed
  to the user and the worktree is removed with `--force` only on their go-ahead. For LOCAL-ONLY, limit the ground check
  to static commands (typecheck, lint, analyze) unless the user allows running the test suite.
- Verify: read-through; plus the scratch reproduction above documented in the template as the expected behaviour.

### F-07 🟡 "Compare the actual cost" has no cost to compare

- Where: `SKILL.md:92-93`, `SKILL.md:120-121`; `scripts/salvage.py:111-113,120`.
- Scenario: preflight estimates in dollars and calls; salvage prints tokens and calls, no dollars and no price table.
  The orchestrator must convert four token classes with prices it recalls from memory (README.md:33 lists Fable 5.1
  prices; this review ran on a different Fable version). The "actual vs estimated cost" line in the final report is
  then a model guess, which is the failure the global rule "check the actual cost against the estimate" exists to
  prevent.
- Fix for Opus: add a small per-model price table to salvage.py (input, 5-minute cache write, cache read, output per
  MTok, keyed by model-id prefix, with a `--prices in,cw,cr,out` override), print `cost_usd=` and "unknown model, no
  price" when there is no match. Until then, change SKILL.md:92 to "compare calls and output tokens".
- Verify: `salvage.py --jsonl <real transcript>` prints a `cost_usd=` figure that matches a hand calculation from the
  usage table.

### F-08 🟢 A truncated `.meta.json` aborts salvage before anything is written (proven)

- Where: `scripts/salvage.py:52`.
- Scenario: meta file containing `{"descr` → `json.decoder.JSONDecodeError`, no output directory, no file. The hard
  rule is "without exception".
- Fix: wrap the load in `try/except (OSError, ValueError)` and continue with `{}`. Same for a transcript line that is
  valid JSON but not an object (`isinstance(o, dict)`).
- Verify: the command above writes a file and exits 0.

### F-09 🟢 Four preflight sections read the live checkout, not the review base

- Where: `scripts/preflight.sh:174` (`git log` = live `HEAD`), `:178` (`git grep` = working tree, including
  uncommitted edits of parallel sessions), `:139` and `:151` (`find "$ROOT"`).
- Scenario: live checkout is on a feature branch or behind `origin/main`: attribution, markers, stack and "review
  documents in repo" describe a different tree than the one the worktree will contain.
- Fix: `git log "$BASE_REF"`, `git grep … "$BASE_REF" -- …`, and `git ls-tree -r --name-only "$BASE_REF"` filtered
  with grep instead of `find` (keep `find` only for the `node_modules: present` hint).
- Verify: check out an old commit in a scratch clone; the Co-Authored-By counts must not change.

### F-10 🟢 `--mode` is not validated and flows into branch, tag and path names

- Where: `scripts/preflight.sh:16-17`, `:88`, `:106`.
- Scenario: `--mode securty` yields tag `audit-fable-<date>-securty` and a `templates/securty.md` that does not exist;
  a value with a space or `/` yields an invalid or nested ref name.
- Fix: `case "$MODE" in ""|diff|refactor|security|full|forensic) ;; *) echo "ERROR: unknown mode" >&2; exit 2 ;; esac`.
- Verify: `preflight.sh . --mode securty; echo $?` prints 2.

### F-11 🟢 Usage dedupe falls back to the per-line `uuid` (proven on synthetic input)

- Where: `scripts/salvage.py:68`.
- Scenario: two lines of one API call without `requestId` are counted as two calls and their input and cache tokens
  are summed twice (synthetic: 2 messages reported as `calls=3`). Real transcripts sampled today carry `requestId` on
  all assistant lines, so this is latent. The `>=` rule at `:74` is correct for lines that share a `requestId`.
- Fix: `req = o.get("requestId") or m.get("id") or o.get("uuid")`.
- Verify: the synthetic transcript prints `calls=2`.

### F-12 🟢 Local report, transcript and worktree paths are keyed on the repo basename only

- Where: `scripts/preflight.sh:31,84,85`; `SKILL.md:30,50`.
- Scenario: two client repos both named `api` or `web` share `~/.claude/fable-review/reports/api/` and
  `transcripts/api/`. Preflight then reports the other client's files as "Local (uncommitted) reports", suggests `diff`
  mode (`:190`), and Pass A takes "the SHA in the header of the previous local report" from the wrong repository.
- Fix: use `<owner>-<name>` (or `no-remote-<name>`) for `LOCAL_OUT`, the transcript dir and the worktree name.
- Verify: two scratch repos with the same basename and different owners print different `Report dir` lines.

### F-13 🟢 SKILL.hr.md is out of sync; two SKILL.md rules have no room for the user's choice

- `SKILL.md:71` (feature-branch base) has no counterpart in SKILL.hr.md §1. Resolve together with F-01.
- `SKILL.md:83` (COMMIT commits the map, LOCAL-ONLY only writes it) and `:89-90` ("each continuing from the previous
  one's progress file") are missing in SKILL.hr.md §2 and §3. SKILL.hr.md §4 has prose where SKILL.md has the command
  block; the remove-worktree command is not in the HR text.
- `SKILL.md:36` and `:87` say "Always pass `effort: "medium"`"; this review was run at a user-chosen `low` (map
  header). Add "unless the user names another effort" in both languages, and let preflight's `:187-188` not hard-code
  "effort medium".
- `SKILL.md:4` `argument-hint` omits `--base`, which `:14` documents.
- `templates/pass-b.md` "Return:" omits the commit SHA that the orchestrator needs for the final report.
- `templates/diff.md` item 2: add "write 'none, first review' when no previous review exists".

### F-14 🟢 Text that no longer matches the code or the other language

- `web/content/blog.ts:142` (HR body) still says "pet paralelnih Fable 5.1 subagenata"; the HR lead (`:26`) and EN
  body (`:29`, `:100`) say five subagents, at most three at a time. Change to "pet Fable 5.1 subagenata (najviše tri
  istodobno)".
- `README.md:41`: "`diff` … (or last 7 days)" is not implemented anywhere; preflight only counts commits of the last 7
  days. Remove the parenthesis or implement it in F-05's default.
- `README.md:41` estimates `diff` at $2-4; preflight's smallest band adds up to $2-5 (`:184`, 0.5-1.5 + 1.5-3.5) and
  always prints a Sonnet Pass A line even when SKILL.md:80 makes the orchestrator do Pass A itself (under ~5,000 lines).
- `README.md:67-69` installs via `/tmp`; harmless, but the repo's own rule is not to rely on `/tmp`.

### F-15 🟢 Branch name has no free-name logic, and the tag check sees local tags only

- Where: `scripts/preflight.sh:88-90,106`.
- Scenario: the tag gets a `-2` suffix when taken, the branch `fable-review/<date>-<mode>` does not. A second run on
  the same day after a rejected push (branch kept by design, SKILL.md:105) fails at `worktree add -b`. Tags created on
  another machine are unknown until a fetch, so the "next free tag" can collide at push time.
- Fix: apply the same loop to the branch name and print it once; check tags after `git fetch origin --tags` (F-05) or
  with `git ls-remote --tags origin "audit-fable-$TODAY*"`.
- Verify: create the branch by hand, run preflight, the printed branch must end in `-2`.

## 4. Rollout checklist

- No migrations. The skill is a symlink to this repo, so a fix is live on the next `/fable-review` after the commit
  lands in the live checkout.
- Order: F-01 and F-03 (text and two lines of bash), then F-02 with the own-owners format; the existing
  `~/.config/fable-review/own-owners` (bare owners) must keep working as `github.com/<owner>`.
- After the F-02 change, run preflight on one own repo (expect `COMMIT`) and one client repo (expect `LOCAL-ONLY`)
  before the next real review.
- External dependency: `gh repo view` at `preflight.sh:60` already degrades to `Visibility: unknown` when `gh` is
  missing or offline, and visibility does not affect the destination. Nothing to add.
- Post-change check for salvage (F-04, F-07): run it on this review's own Pass B transcript and confirm it prints
  `finished` and a cost.
- Update SKILL.hr.md in the same commit as every SKILL.md change, and the agy copy outside the repo by hand.

## 5. What holds up

- `disable-model-invocation: true` (SKILL.md:5) is in the frontmatter, and the hard rule text matches it in both
  languages and in the README.
- Preflight is read-only as claimed: no write, no fetch, the only network call is `gh repo view`. The destination
  fails safe (`ASK`) for no remote, unparsable owner and missing own-owner list, and URL forms it does not understand
  fall to `LOCAL-ONLY`.
- Tag is created after the rebase (SKILL.md:100-101), so it points at the pushed commit; cleanup happens only after a
  successful push; worktrees are outside `/private/tmp`.
- LOCAL-ONLY cleanup works with gitignored install artefacts present (hotspot 22): `worktree remove` succeeds.
- salvage.py: read-only on the transcript, `-I` in the documented command, adaptive code fences, full Write/Edit
  contents, usage dedupe correct for lines sharing a `requestId` (hotspot 15), thinking count read from
  `output_tokens_details.thinking_tokens`. The `--session`/`--agent` glob matches the real layout
  (`projects/<project>/<session>/subagents/agent-<id>.jsonl`); a session UUID in two projects is not a realistic
  collision (hotspot 13).
- `${CLAUDE_SESSION_ID}` was substituted in this run (hotspot 19, per the map).
- The size and diff counters treat binary files (`-` in numstat) as 0 without error; counting Markdown in the diff
  size (hotspot 7) is reasonable for a repo whose reviewed content is Markdown.

## To verify (not proven from code)

- Whether Claude Code marks a rate-limited or API-failed subagent turn in the transcript with `isApiErrorMessage` or a
  `<synthetic>` model line. Not present in the sampled transcript; F-04's `api-error` branch depends on it.
- `templates/pass-b.md` says the context guard warns at ~180k-250k; the hook value is machine configuration outside
  this repo (hotspot 24).
- Last `audit-*` tag by `creatordate` rather than by reachability from the review base (`preflight.sh:145`,
  hotspot 8): wrong only if a newer tag sits on an unmerged branch; no such tag exists in this repo today.
- Fallback push of the review branch with `--follow-tags` (SKILL.md:104) leaves the audit tag on a commit that is not
  on the default branch; whether later `diff` runs handle a squash-merged review branch was not tested.
