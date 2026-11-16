---
name: fable-review
description: Two-pass read-only review of one git repository. Pass A (Sonnet) runs ground checks and maps entry points to file:line targets; Pass B (Fable) verifies them against code and writes a Markdown review with an execution plan for Opus. Modes - diff, refactor, security, full, forensic. Runs only when the user types /fable-review; never invoked automatically.
argument-hint: "[repo-path] [--mode diff|refactor|security|full|forensic] [--base <ref>] [effort <level>]"
disable-model-invocation: true
---

# Fable review: Fable reviews, Opus executes

Opus writes code fast. Fable reviews a frozen commit read-only and writes Markdown findings plus a phased plan, which Opus
executes in a later session. The two-pass shape exists because a single Fable pass over a whole repository grew to 636k
context and cost $6-14 per repo (postmortem: `docs/2026-10-17-postmortem-fable-subagenti-tjedni-limit.md` in `stepanic/cv`).

Arguments: `$ARGUMENTS` (first positional = repo path, default the current directory; `--mode <m>`; `--base <ref>` sets
the `diff` base explicitly, otherwise preflight uses the last `audit-*` tag; for LOCAL-ONLY without a tag, pass the SHA
from the header of the previous local report).

Files next to this skill (pass absolute paths to subagents, they do not see this file):
- `${CLAUDE_SKILL_DIR}/scripts/preflight.sh`: deterministic, read-only scope and destination check
- `${CLAUDE_SKILL_DIR}/templates/pass-a.md`: Pass A instructions per mode
- `${CLAUDE_SKILL_DIR}/templates/pass-b.md`: Pass B reading rules and document header
- `${CLAUDE_SKILL_DIR}/templates/<mode>.md`: output structure for `diff`, `refactor`, `security`, `full`, `forensic`

## Hard rules

- **Fable runs only on explicit request.** This skill has `disable-model-invocation: true`, so it starts only when the
  user types `/fable-review`. Never spawn a `model: "fable"` agent from any other skill, plan, handoff or on your own
  initiative; if Fable seems useful, say so and let the user type the command.
- **Every Fable call ends in a file, without exception.** Right after each Fable agent returns (finished, failed,
  rate-limited or stopped), before anything else, run
  `python3 -I "${CLAUDE_SKILL_DIR}/scripts/salvage.py" --session "${CLAUDE_SESSION_ID}" --agent <agentId> --out <Salvage dir from preflight> --label pass-b`.
  It writes the final report, every text block and every tool input (full Write and Edit contents) to one Markdown
  file, with per-call usage, `cost_usd` and the agent state (`finished=yes` only when Claude Code marked it finished;
  otherwise the last text is labelled "not a final report"). Thinking is stored empty by Claude Code and cannot be saved; the script reports its token
  count. Transcripts stay local, also for own repositories. A Fable agent whose salvage file does not exist is an
  incomplete run: report that to the user instead of continuing.
- One repository per invocation. Several repos run strictly one after another, each on the user's go-ahead.
- At most one Fable agent at a time. Always pass `effort` explicitly: `"medium"` unless the user names another level.
- Read-only on code, tests and configuration. The only output is Markdown.
- Never run anything against production, staging, sandboxes or external services.
- Never copy a secret value into a document; name the file:line and the kind of secret.
- Destination comes from preflight, never from guesswork (next section).

## 0. Pre-flight and confirmation

1. Run `git -C <repo> fetch origin --tags` (skip for a repo without remote), then
   `bash "${CLAUDE_SKILL_DIR}/scripts/preflight.sh" <repo> --mode <mode> [--base <ref>]` (only the flags the user gave).
   Exit code 2 is a usage error (missing value, unknown flag or mode, `--base` that is not a commit): show it to the
   user and stop. Preflight itself never fetches, so the fetch must come first for the base SHA, tag and branch names
   to be current.
2. Pick the mode if not given: `diff` when a previous review exists and the question is "what changed since",
   `security` for auth, money, secrets and attack surface, `refactor` for structure and cleanup, `full` for a first deep
   pass over a large or multi-layer repo, `forensic` for per-model attribution of git history.
3. Read the **DESTINATION** line:
   - `COMMIT`: the user's own repository. Documents are committed in the worktree, tagged and pushed (step 4).
   - `LOCAL-ONLY`: external or client repository. Documents go to `<Report dir from preflight>/<date>-<mode>/`
     (`~/.claude/fable-review/reports/<owner>-<repo>/`)
     only. No commit, no tag, no push, no file written inside the repository, and nothing copied into any other repo
     or catalogue.
   - `ASK`: ask the user which of the two applies before anything else.
4. Show the preflight summary and the estimate, ask the user for remaining weekly and 5-hour quota (`/usage`), and wait.
   Below ~15% weekly, offer Pass A only, or `diff` mode.

## 1. Worktree

Never work in the live checkout; parallel sessions share it. Use the worktree path and review base (`$BASE`,
`origin/<default>` or `HEAD` for a repo without remote) that preflight printed:

```bash
# COMMIT (branch name from preflight; it gets a -2 suffix when today's name is taken):
git -C "$REPO" worktree add -b "$BRANCH" "$WT" "$BASE"
# LOCAL-ONLY:
git -C "$REPO" worktree add --detach "$WT" "$BASE"
```

`$WT` is under `~/.claude/fable-review/worktrees/`, not `/private/tmp`, so a reboot cannot delete uncommitted work.
For `diff` over an unpushed feature branch, base the worktree on that branch instead. The worktree then carries code
commits that are not on the default branch, so step 4 must not push it to the default branch (the guard there catches
this; say so to the user up front).

Output directory `$OUT`: for COMMIT, the path from `templates/<mode>.md` inside `$WT`; for LOCAL-ONLY, the local report dir.

## 2. Pass A: map and ground check

If a handoff says Pass A is done (for example prepared in Antigravity), check that the map, worktree and SHA exist,
then go to step 3.

If the repository (or, in `diff` mode, the diff) is under ~5,000 lines, do Pass A yourself. Otherwise spawn one subagent with `model: "sonnet"`,
`effort: "medium"`, and a prompt that gives: `$WT`, `$OUT`, the mode, the frozen SHA, and the instruction to read and
follow `${CLAUDE_SKILL_DIR}/templates/pass-a.md` (write the absolute path). It writes `$OUT/<date>-00-map.md`.
For COMMIT it commits the map in the worktree; for LOCAL-ONLY it only writes the file.

## 3. Pass B: Fable verification

Spawn one subagent with `model: "fable"` and the effort from the hard rules (default `"medium"`). Its prompt gives `$WT`, `$OUT`, the mode, the frozen SHA,
the destination, the map path, and the instruction to read and follow `${CLAUDE_SKILL_DIR}/templates/pass-b.md` and
`${CLAUDE_SKILL_DIR}/templates/<mode>.md` before reading any code. In `full` mode on a large repo, run one Fable agent per
subsystem, sequentially, each continuing from the previous one's progress file.

When it returns, run `salvage.py` first (hard rule above), then compare its `cost_usd` and call count with the
preflight estimate and tell the user in one line. If salvage says `finished=no`, the agent did not complete: tell the
user and do not treat its last text as the review. Then check that every document Fable reported actually exists on disk.

## 4. Finish

COMMIT (for a repo without remote: skip fetch, rebase and push; merge the branch locally instead):
```bash
git -C "$WT" fetch origin
# Guard: the branch may reach the default branch only if every change in it is a review document under $OUT.
OUT_REL="${OUT#$WT/}"
OTHER="$(git -C "$WT" diff --name-only "origin/$DEFAULT_BRANCH"...HEAD | grep -v "^$OUT_REL/")"
```
- `OTHER` empty: the branch holds only review documents. Continue:
  ```bash
  git -C "$WT" rebase "origin/$DEFAULT_BRANCH"
  git -C "$WT" tag -a "<tag from preflight>" -m "Fable <mode> review (<date>)"
  git -C "$WT" push origin HEAD:"$DEFAULT_BRANCH" --follow-tags
  ```
- `OTHER` not empty (for example a `diff` review based on a feature branch): **never push to the default branch**,
  because that would ship the code under review. Do not tag. Push only the review branch
  (`git -C "$WT" push origin "$BRANCH"`), or leave it local if the user prefers, and list the files in `OTHER` to the
  user. The review commits can later be cherry-picked onto the default branch.

If the push to the default branch is rejected (branch protection), push `$BRANCH` with `--follow-tags` and tell the
user. Remove the worktree and delete the local branch **only after a successful push** (of either branch):
`git -C "$REPO" worktree remove "$WT" && git -C "$REPO" branch -D "$BRANCH"`. If the review branch stays local, keep both.

LOCAL-ONLY: run `git -C "$WT" status --porcelain`. It proves that no tracked file was modified and no untracked,
unignored file was created; it does not see gitignored paths, which is where the ground-check installs
(`node_modules`, build caches) land and which the template allows. Empty: `git -C "$REPO" worktree remove "$WT"`.
Not empty (for example `flutter pub get` rewrote `pubspec.lock`): list the entries to the user and remove the worktree
with `--force` only on their go-ahead. The report stays in the Report dir from preflight.

## 5. Handoff for Opus

Write a ready prompt for a fresh Opus session to `~/.claude/handoffs/<repo>/<YYYY-MM-DD-HHMM>-fable-review-implementacija.md`
and copy it to the clipboard (`pbcopy`). It contains: repo path, document path (and commit SHA if committed), the
instruction to read the document fully including "Confirmed good, do not touch", the first 3-5 items by ID and file:line,
"write a failing test first, then fix, then update the status table in the same document", and "ask the owner about
items marked for human decision". For LOCAL-ONLY, the handoff names the local report path and repeats that the
document must not be committed to the repository.

Final report to the user: where the documents are (SHA and tag, or local path), the salvage file path, finding counts by priority, the top 3-5
findings in one sentence each, actual vs estimated cost, and the handoff path.
