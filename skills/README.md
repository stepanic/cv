# Skills

Claude Code skills I use daily and publish here. MIT-licensed — copy, rename,
change the steps.

| Skill | What it does | Install |
|---|---|---|
| [`wrap-up`](wrap-up/) | Closes a session before `/clear`: commit and push every repo touched, refresh memory files, write down what is not yet in the codebase, put a handoff prompt in the clipboard, report what is still open. | `~/.claude/skills/wrap-up/SKILL.md` |
| [`register`](register/) | Picks the prose register for anything written for a human audience. Engineering by default — conclusion first, no narrative arc, limitations stated outright. Theatrical only when asked for. Bilingual texts written natively, never translated. | `~/.claude/skills/register/SKILL.md` |
| [`todo-plan`](todo-plan/) | Plans a larger implementation as a chain of sessions written into the repo: `TODO.md` by phase, a session table with a "done when" checkable by a command, numbered decisions, and one handoff file per session that is the next empty session's prompt. Works with `wrap-up`. | `~/.claude/skills/todo-plan/SKILL.md` |
| [`fable-review`](fable-review/) | Runs an independent two-pass Fable review on any git codebase in five modes (`diff`, `refactor`, `security`, `full`, `forensic`): Pass A (Sonnet/Opus) runs read-only checks and maps `file:line` hotspots; Pass B (Fable) writes Markdown findings, "do not touch" invariants, and a phased execution plan for Opus. | `~/.claude/skills/fable-review/SKILL.md` |
| [`todo-plan-exec`](todo-plan-exec/) | Runs a `todo-plan` chain from two iTerm2 panes: this session orchestrates, each handoff gets a fresh executor session in the right pane, results are checked with commands, decisions fall back to a recommendation after 60 s, and gates stop the chain until you answer. macOS + iTerm2. | `~/.claude/skills/todo-plan-exec/` (SKILL.md, preamble.md, scripts/) |
| [`glasovne`](glasovne/) | "What did X send me?" Reads the local WhatsApp desktop database on macOS, finds the chat by contact name, lists the messages and transcribes voice notes through `agy -p` with Gemini (no Claude quota), then summarises what is being asked. | `~/.claude/skills/glasovne/` (SKILL.md, scripts/) |

## Installing any of them

User-level, available in every project:

```bash
mkdir -p ~/.claude/skills/<name>
cp skills/<name>/SKILL.md ~/.claude/skills/<name>/SKILL.md
```

Project-level, checked into a repo so a team shares it:

```bash
mkdir -p .claude/skills/<name>
cp skills/<name>/SKILL.md .claude/skills/<name>/SKILL.md
```

A skill is one markdown file with YAML frontmatter (`name`, `description`). The
`description` is what the model matches against, so it should contain the phrases
you actually type — then the skill fires on its own and you never have to remember
the slash command.
