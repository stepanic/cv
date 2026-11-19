# `/todo-plan-exec` — run a session chain from a second pane

> **TL;DR** [`/todo-plan`](../todo-plan/) writes a larger implementation into the repo
> as a chain of handoffs, one per session. This skill runs that chain: the current
> Claude Code session becomes an orchestrator in the left iTerm2 pane and starts a
> fresh executor session in the right pane for each handoff, then checks the result
> with commands and starts the next one. Questions reach the user through the
> orchestrator, decisions fall back to a recommendation after 60 s, and irreversible
> steps (production, sending, cost) always stop the chain until the user answers.
> macOS + iTerm2 only.

- [`SKILL.md`](SKILL.md) — the skill, English. This is the one to install.
- [`SKILL.hr.md`](SKILL.hr.md) — the Croatian original as it runs on my machine.
- [`preamble.md`](preamble.md) / [`preambula.md`](preambula.md) — what the executor
  reads above its handoff: how to ask, when to stop, and the mandatory final report.
- [`scripts/iterm_worker.py`](scripts/iterm_worker.py) — opens the right pane, exits
  the previous `claude` there and starts a new one with preamble + handoff as its
  prompt. iTerm2 Python API.

## How a round works

```mermaid
sequenceDiagram
    participant U as User
    participant O as Orchestrator (left pane)
    participant E as Executor SN (right pane)
    O->>O: next row in "Chain status", check command green
    O->>E: iterm_worker.py start (fresh claude, preamble + SN.md)
    O-->>U: "SN is running", end of turn
    E->>O: QUESTION SN (decision) … recommendation: b
    O-->>U: question, "b in 60 s unless you answer"
    O->>E: ANSWER SN: b (user | auto)
    E->>E: work, commit, update S(N+1).md, /wrap-up
    E->>O: REPORT SN: DONE; commit; tests
    O->>O: git log, clean tree, check command, chain status, push
    O->>E: next round: start S(N+1)
```

The executor never waits at a gate. It finishes what does not depend on the answer,
writes the question at the top of the next handoff and reports `AWAITING ANSWER`.
The user answers whenever, and the next session starts with the answer above its
handoff. A fresh session is cheaper than resuming a 100k-token context after the
prompt cache has expired.

## Design choices

- **The orchestrator reads no code.** It checks a round with `git log`,
  `git status`, the chain's check command and the "Chain status" table. Its own
  context stays small enough to run a long chain.
- **No polling.** No `sleep` loop, no Monitor, no reading the right pane. The
  orchestrator wakes up on a SendMessage from the executor, on the 60 s answer
  timer, or on an idle notification if the executor dies without reporting.
- **One executor at a time**, and `--max` defaults to 1 session per run. Every round
  is a full session, so the user raises it on purpose.
- **Three question levels.** A small technical choice is made by the executor and
  marked "(to confirm)" in `decisions.md`. A decision goes to the user with a
  recommendation and a 60 s auto-pick. A gate stops the chain.

## Limitations

- macOS and iTerm2 only (the pane control is iTerm2's Python API). The orchestrator
  must itself run inside an iTerm2 pane.
- The executor runs with `--permission-mode bypassPermissions`, because nobody is
  watching its permission prompts. The safety net is the preamble and the gates
  written into the handoffs, not the permission system. Use it only on repos where
  you would accept that.
- It relies on `SendMessage` between local Claude Code sessions and on
  `notify_when_idle`. Without those there is no channel back to the orchestrator.
- Run so far on a two-session test chain (Sonnet) and on one real chain of four
  sessions (S2-S5), both on 2026-11-16. That is little mileage; expect rough edges.

## Install

```bash
d=~/.claude/skills/todo-plan-exec
mkdir -p $d/scripts
base=https://raw.githubusercontent.com/stepanic/cv/main/skills/todo-plan-exec
curl -sSL $base/SKILL.md -o $d/SKILL.md
curl -sSL $base/preamble.md -o $d/preamble.md
curl -sSL $base/scripts/iterm_worker.py -o $d/scripts/iterm_worker.py
pip install iterm2
```

Then enable iTerm2 → Settings → General → Magic → Enable Python API, make a plan with
`/todo-plan`, and say "run the chain" or `/todo-plan-exec`.

MIT.
