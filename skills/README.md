# Skills

Claude Code skills I use daily and publish here. MIT-licensed — copy, rename,
change the steps.

| Skill | What it does | Install |
|---|---|---|
| [`wrap-up`](wrap-up/) | Closes a session before `/clear`: commit and push every repo touched, refresh memory files, write down what is not yet in the codebase, put a handoff prompt in the clipboard, report what is still open. | `~/.claude/skills/wrap-up/SKILL.md` |

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
