---
name: todo-plan-exec
description: Run a session chain made by todo-plan. This session is the orchestrator (left iTerm2 pane); for every handoff SN.md it starts a fresh Claude Code executor session in the right pane, waits for its report over SendMessage, checks it with commands and starts the next one, linearly until the chain ends or hits a gate. Run it when the user says "run the plan / run the chain / run the handoffs one after another / orchestrate the chain", "continue <topic> in two panes", or /todo-plan-exec [path to handoffs/] [--max N] [--model M].
---

# todo-plan-exec — chain orchestrator in two panes

The companion to `todo-plan`. This session **writes no code**: it starts executors, relays
questions and checks results. Each executor is a **fresh** `claude` session in the right pane
(cleaner than `/clear`). The user watches both panes.

Script: `~/.claude/skills/todo-plan-exec/scripts/iterm_worker.py` (iTerm2 Python API, which must
be enabled: Settings → General → Magic → Enable Python API). Executor preamble:
`~/.claude/skills/todo-plan-exec/preamble.md`. Run it with a `python3` that has the `iterm2`
module (`pip install iterm2`).

## Arguments

- path to `handoffs/` (default: the only `docs/**/handoffs/README.md` under the current repo; if
  there are several, ask),
- `--max N` sessions in this run (default 1; the user raises it deliberately, every session is a
  full session with subagents),
- `--model` for the executor (default: the user's default; `sonnet` for test runs).

## 0. Setup (once)

1. `ListAgents` → remember **your own name** ("This session is …"). The executor writes to it.
2. Repo: `git -C <repo> rev-parse --show-toplevel`; from `handoffs/README.md` read only "Chain
   status" and the "Starting point" line of the shared rules (the check command).
3. If this session's context is already large (> 100k), say so and suggest a fresh session for
   the orchestrator.

## 1. Round (for each session SN)

1. **Next session** = the first row in "Chain status" that is not `done`. None → the chain is
   finished (step 3).
2. **Starting point:** `git -C <repo> status --porcelain` is empty and the check command is green
   (run it in the background only if it takes long; otherwise directly, output cut down to the
   totals). Not green → stop and report.
3. **Gate up front:** if the top of `SN.md` asks for the user's "go" *before any work*, ask the
   user now. A gate in the middle of a package ("steps 1-2 now, ask before 3") is left to the
   executor: it will send a `QUESTION`.
4. **Start:**
   ```bash
   python3 ~/.claude/skills/todo-plan-exec/scripts/iterm_worker.py split --cwd <repo>
   python3 ~/.claude/skills/todo-plan-exec/scripts/iterm_worker.py start --cwd <repo> \
     --handoff <handoffs>/SN.md --session SN --orchestrator <your name> [--model M]
   ```
   Remember `HEAD` before starting (the round's starting commit).
5. **Crash fuse:** `ListAgents` → the new session whose name starts with the repo directory name
   (e.g. `chain-test-a5`); `SendMessage` with no message and `notify_when_idle: true`. One
   notification arrives when the executor stops or exits. If a `REPORT` has arrived in the
   meantime, ignore the notification; if not, the executor stopped without a report (a question
   without the tool, a crash, a usage limit): `iterm_worker.py status`, last commit, tell the user.
6. Tell the user in one sentence ("S2 is running in the right pane, I will be back when the
   report arrives") and **end the turn**. Do not follow progress: no Monitor, no `sleep`, no
   reading the pane.

## 2. Executor messages

- **Nobody waits at a gate.** The executor makes small choices itself ("(to confirm)" in
  decisions), asks decisions with a recommendation and a 60 s auto-pick (below), and at a gate
  finishes cleanly with `REPORT SN: AWAITING ANSWER`. Reason: waiting costs nothing, but an
  executor with 100k+ context that resumes after > 1 h (the cache TTL) pays to rewrite its whole
  context; a fresh session with the answer in its preamble is cheaper.
- **`AWAITING ANSWER`** → check as usual (commit, clean tree, the question is at the top of the
  handoff), then notify the user: an `osascript` notification **and** `PushNotification` (load
  it through ToolSearch) with the question in one sentence. Write the question as plain text
  (not `AskUserQuestion`) and end the turn. When the user answers (whenever), start the next
  handoff with `--answers "<answer>"`: the script puts it above the handoff as "USER ANSWERS".
  Do not decide on the user's behalf.
- **`QUESTION SN (decision): …; recommendation: X`** → the executor is waiting (≤ 2 min, its
  cache is warm).
  1. Write the question to the user as text: options, **recommendation marked**, and "if you do
     not answer within 60 s, the recommendation goes". Not `AskUserQuestion` (it has no timeout).
  2. Start a background timer (Bash, `run_in_background: true`):
     `sleep ${WAIT:-60}; echo "EXPIRED SN <short question id>"` and end the turn.
  3. Whichever arrives first:
     - the user's answer → `SendMessage` to the `from` of the question:
       `ANSWER SN: <answer> (user)`; ignore a later `EXPIRED` with that id;
     - `EXPIRED` for a question that has no answer yet → `ANSWER SN: <recommendation> (auto, the
       user did not answer within 60 s)`, and one sentence to the user saying what was picked.
  4. Always send `ANSWER` with `notify_when_idle: true` (the fuse).
  A question without a recommendation, or one that is really a gate, gets no auto-pick: answer
  "this is a gate, finish with AWAITING ANSWER".
- **`QUESTION SN` without a level** (old form): treat it as a gate if it mentions production,
  deploy, sending, deleting or cost; otherwise as a decision, and with no recommendation there
  is no auto-pick.
- **`REPORT SN: …`** → check with commands only, without reading code:
  - `git -C <repo> log --oneline <start>..HEAD` has commits; `status --porcelain` is empty;
  - the check command is green (compare the numbers with the report);
  - row SN in "Chain status" is `done` with a commit; `S(N+1).md` has its starting commit filled
    in (no "(filled in by" placeholder left);
  - push: `git -C <repo> status -sb` is not `ahead` (if the repo has a remote).

  All fine → next round (if `--max` allows). `NOT DONE` → by the chain rule SN again (at most
  once in a row; the second time stop and ask the user). Check failed → stop.
- Without a `REPORT` and without an idle notification, do not wake yourself up (no `sleep`, no
  Monitor, no `ListAgents` loop).

Verified on 2026-11-16 on a test chain (S1 commit + S2 question through the orchestrator,
Sonnet): split, `/exit` + a new `claude` in the same pane, `REPORT` and `QUESTION`/`ANSWER`
work. iTerm2 reports claude's `jobName` as its version (e.g. `2.1.325`), not "claude", so the
script checks whether the pane is back at a shell. A temporary directory did not raise the
"trust this folder" prompt; if a new directory does, the user confirms it once.

## 3. End or stop

- Leave the executor open (the user may want to look); `iterm_worker.py close` only on request.
- Notification: `osascript -e 'display notification "<message>" with title "todo-plan-exec"'`.
- Summary for the user: which sessions passed (commit, tests), where it stopped and why, what is
  next.

## Rules

- The orchestrator changes neither code nor handoffs; if a report asks for a change to the plan,
  the executor of the next session makes it (handoffs only change forward).
- One executor at a time. Never in parallel.
- Cost: before `--max` > 2, tell the user how many sessions follow.
- Production, sending messages and other external actions always go through a `QUESTION` and
  the user's answer.
