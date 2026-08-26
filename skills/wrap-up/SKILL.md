---
name: wrap-up
description: Close a Claude Code session before /clear — commit and push everything from this conversation, refresh the memory files, write down knowledge that is not yet in the codebase (markdown, mermaid where a diagram earns its place), put a handoff prompt in the clipboard, and report what is still open. Run it when the user says any variant of "commit and push / update memory / save what we learned / prepare the chat for clear", or /wrap-up.
---

# Wrap-up — closing a session

The user asks for this at the end of almost every conversation. The goal is that
after `/clear`, nothing valuable exists only in the context window.

Work **autonomously to the end** — do not come back for approval on individual
steps. The exception is irreversible moves that are not part of the routine
(force-push, deleting branches, a deploy the user did not ask for).

## Order

Steps 1–4 run in order. Skip a step only when this session genuinely has nothing
to do there — and say so in the summary rather than skipping silently.

---

## 1. Commit + push

**First establish EVERY repository touched in this session.** Work routinely
crosses repo boundaries (a backend change, then the dashboard that reads it, then
the fetcher that feeds it). Walk back through the conversation, list every repo in
which you changed files, then in each:

```bash
git -C <repo> status --short
git -C <repo> branch --show-current
```

### 🔴 Stage only what is yours

**Never `git add -A` or `git add .`.** The working copy regularly contains the
user's unfinished work that has nothing to do with your session. In the session
that produced this skill, an in-progress `.gitignore` and a set of half-written
shell scripts were sitting there untracked. `git add -A` would have pushed them to
`main` half-done.

Stage the files you changed **by name**. For any modified file you do not remember
touching, run `git diff` and leave it alone if it is not yours.

Do not commit generated artefacts (snapshots written by cron or CI), secrets, or
`.env`.

### Commit messages

Semantic, `type(scope): summary`, imperative mood. The body explains **why**, not
what — the parts that are not visible from the diff: measurements, alternatives
that were rejected, traps. If a fix had a measurable effect, put the number in.

Several unrelated changes mean several commits, not one bundle.

End every commit with the co-author trailer for the model you are:

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Push

Push every repo and **check the output**. If a push fails (branch protection,
conflict, no remote), say so in the summary — never report "pushed" on an
assumption.

---

## 2. Memory files

Memory lives in `~/.claude/projects/<project>/memory/`, one fact per file, with an
index in `MEMORY.md`.

Write down only what still holds for **future** sessions:

- `user` — who the user is, how they work, what they prefer
- `feedback` — a correction or a confirmed approach, plus **Why:** and
  **How to apply:**
- `project` — a goal or constraint that is not visible from the code; convert
  relative dates to absolute ones
- `reference` — external resources, URLs, contracts

**Do not write down** what the repo already remembers (code structure, git
history, CLAUDE.md), or what only mattered inside this conversation. Before
writing, check whether a file already covers it — **update that one** instead of
creating a duplicate. Link related memories with `[[slug]]`.

For every new file add a line to `MEMORY.md`: `- [Title](file.md) — hook`.

---

## 3. Write down knowledge that is not in the codebase

This is the step that is easiest to skip and worth the most. The question is not
"what did we do" (that is in the git history) but **"what would the next pass have
to rediscover".**

Candidates:

- measurements and numbers that decided something (thresholds, benchmarks, memory
  profiles)
- alternatives that were considered and **rejected** — and why, with numbers
- traps that cost time (silent failures, environment quirks, platform differences)
- open items: what is waiting on a decision, a device test, the next cycle

Write into the `docs/` folder of the repo it concerns, named
`docs/YYYY-MM-DD-topic.md`. If a document on that topic already exists, **append a
section** rather than starting a second one.

The repo boundary applies to documents too: a measurement of the database belongs
in the repo that has the database.

Use mermaid when a relationship or a flow is not obvious from prose (architecture,
failure order, data moving through steps). Do not draw a diagram for something
that is one sentence.

Link the new document from existing ones ("Related documents") so it can be found.

---

## 4. Handoff prompt in the clipboard

Write a prompt for an **empty** Claude Code session — the reader has nothing from
this conversation. It must contain: the repos and absolute paths, what was just
done, what is still open, and a concrete next task. Point at the documents from
step 3 instead of retelling them.

```bash
cat <<'EOF' | pbcopy   # Linux: xclip -selection clipboard / wl-copy
<handoff prompt>
EOF
```

Confirm it is in the clipboard (`pbpaste | head -3`) and **print it in the reply as
well** — the clipboard has a habit of getting lost before `/clear`.

---

## 5. Summary and handover

Short, no varnish:

- what was committed and pushed, per repo, with hashes
- which memory files were added or updated
- which documents were written
- **what is still open or unverified** — this is the most important part
- then: *"Ready for `/clear`."*

You **cannot run `/clear` yourself** — it is a built-in CLI command. Tell the user
to type it.

## Check before you say it is done

- [ ] `git status` clean in every repo — or the remainder is someone else's work,
      and you said so
- [ ] every push actually went through (output checked, not assumed)
- [ ] no generated snapshot and no secret was committed
- [ ] handoff prompt in the clipboard **and** in the reply
- [ ] open items stated explicitly
