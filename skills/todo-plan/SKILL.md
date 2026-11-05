---
name: todo-plan
description: Plan an implementation as a linear chain of Claude Code sessions (S1…SN) written into the codebase — TODO.md by phase, docs/plan.md with a session table and "done when" conditions, docs/decisions.md with numbered decision blocks, and docs/handoffs/SN.md where every handoff is a ready-made prompt that the previous session refines. Run it when the user says any variant of "make a TODO plan / plan it by sessions / chain of handoffs / plan this so it gets implemented in N sessions", or /todo-plan.
---

# TODO plan — an implementation as a chain of sessions

Goal: break a larger implementation into **N sessions that run one after another**,
each starting from an empty context. Everything a session needs to know lives in the
repo, not in the chat. This session (S0) writes **only the plan, no code**.

Public examples of the shape (read only what you need, never whole files):

- [`pinkainc/open-banking`](https://github.com/pinkainc/open-banking): `TODO.md`,
  `docs/2026-10-23-plan-do-paritete.md`, `docs/handoffs/README.md`, `docs/handoffs/S7d.md`
- [`pinkainc/open-ledger`](https://github.com/pinkainc/open-ledger): `TODO.md`,
  `docs/2026-10-10-plan-do-paritete.md`, `docs/handoffs/README.md`
- [`domovinatv/domovina.ai/vijesti`](https://github.com/domovinatv/domovina.ai/tree/main/vijesti):
  the same shape for a self-contained app in a subdirectory

If the user keeps their own reference plans on disk, read those first.

## 1. Understand the goal before writing

- Read the repo's `CLAUDE.md` and the documents about the area being changed. Repo
  rules (deploy, repo visibility, commit trailer, tests) become shared chain rules.
- Establish: what **done** means for the whole project (measurably), what the
  **source of truth** is (spec, sandbox, existing data), which actions are
  **irreversible or external** (production, payments, email, legal filings) and where
  the **cost** is (LLM calls, APIs).
- If the goal is unclear on one point that changes the whole plan, ask once.
  Otherwise decide yourself and record it as a decision.

## 2. Where the plan lives

- A new self-contained part of an existing repo → a subdirectory (`<app>/TODO.md`,
  `<app>/docs/...`), every path in the plan relative to it.
- The whole repo is the project → the root (`TODO.md`, `docs/...`).
- Language: whatever the repo already uses for documents.
- Public repo: the plan may be public if the user says so, but negotiating material
  (prices, partner terms) never is. Check visibility as in `wrap-up` step 0.

## 3. Break it into packages

Rules for every package (one package = one session):

- **Fits in one session**: orchestrator at ~150k context, the work done by 2
  subagents (implementation, then tests and merging). Split an oversized package up
  front (`S5`, `S5b`).
- **"Done when" is checkable by a command**: a green `check`, a test count,
  `skipped 0`, a measured number, an e2e run. Never "implemented".
- **Risk and measurement early**: the first packages build the foundation and
  *measure* the assumption everything else depends on (phase F0, nothing public). If
  the measurement can kill the project, a gate follows it.
- **Human gates** on every package that ends in an irreversible or external action, a
  larger cost, or a decision that belongs to the user. The session prepares
  everything, writes the question at the top of the next handoff, and the chain stops.
- **A block of decision numbers** per session (S1 from 100, S2 from 200…), so parallel
  worktrees do not collide.
- **Parallel**: mark only packages that genuinely share no files.
- Do not invent numbers. An estimate you do not know goes into a package as a
  measurement.

Phases (F0, F1…) group packages in `TODO.md`; sessions are the order of work.

## 4. Files

### `TODO.md`

```markdown
# TODO — <project>

Working list, kept in the repo so progress survives between sessions. Checked items are
done and verified (`<check command>` green). Decisions go in [docs/decisions.md](docs/decisions.md).

Plan by session: [docs/plan.md](docs/plan.md). Handoff per session: [docs/handoffs/](docs/handoffs/).

Legend: `[x]` done · `[ ]` open · `[~]` in progress · `(!)` needs the user · `→ Sn` planned session

## F0 — <name>

- [ ] <one concrete, checkable item> → S1
```

Items are concrete (a file, a command, a behaviour), not topics.

### `docs/plan.md`

In order: why the project exists (2–4 sentences) · architecture (a table or mermaid,
only if it helps) · hard constraints that hold in every session · **the session
table** `| # | Phase | Package | Decisions | Done when |` · estimated number of
sessions, gates, what runs in parallel, the riskiest packages and why · "Where we
are" (S0: plan, no code yet).

### `docs/decisions.md`

An introduction (number, date, reason, revision condition; a decision is never
deleted, only superseded) and the S0 decisions numbered from 1: scope, what is not
touched, technology choices, testing rules.

### `docs/handoffs/README.md`

Copy the shape from an example and adapt it:

1. **The chain**: session N starts from `SN.md`; at the end it marks its row in
   "Chain status" and the items in the TODO; if it learned something that changes
   later packages, it edits `S(N+1).md` (unfinished work goes at the **top**); it
   writes the starting commit and the numbers into `S(N+1).md`; `/wrap-up` takes
   **the content of `S(N+1).md`** as the handoff prompt. Out of context mid-package:
   the continuation is `SN` again, the number does not increase. Gates: the chain
   stops until the user decides. A handoff is only ever edited forwards.
2. **Chain status**: `| Session | Package | State | Commit | Tests | Note |`, with the
   S0 row already done.
3. **Shared rules**: starting point (`check` green, otherwise fix that first) · scope
   (what may be touched) · orchestration (subagents, `effort` set explicitly, `high`
   for code / `medium` for reading, ≤ 2–3 in parallel, the expensive model only with
   the user's consent) · agents may not touch the TODO, the plan or the handoffs (the
   orchestrator updates them) · tests without network and with `skipped 0` · cost (an
   estimate before anything over ~100 calls, never a `claude -p` loop) · numbers come
   with the command that reproduces them · autonomy (decide and record, commit every
   green step, leave irreversible actions to the user) · token budget (no Monitor for
   progress, close the session around ~150k) · research in
   `docs/research/YYYY-MM-DD-*.md` · the repo's `CLAUDE.md` rules that concern this work.

### `docs/handoffs/S1.md` … `SN.md`

Each one is **a finished prompt for an empty session**:

```markdown
<1–2 sentences: what the project is.>

Repo: <absolute path> (<branch>, <public/private>, wrap-up pushes <branch>).

Read first: docs/handoffs/README.md (the chain and its rules), docs/plan.md, docs/decisions.md, TODO.md (<phase>).

# SN: <package>

Starting commit: (filled in by S<N-1>). `<check>`: (filled in by S<N-1>). Decisions from **<block>**.

<If behind a gate: "First check whether the user has decided … If not, do nothing and say so.">

Package:

1. **<part>**: <what, where, which rules apply>.

<Tests / risk, if any.>

Done when: <checkable>. Then per the chain, `/wrap-up` with the content of `S<N+1>.md`.
```

Write `S1.md` in detail (the first contact with code). Write later handoffs well
enough that the session knows its scope and "done when"; the previous session refines
them. Write a long set of handoffs with one bash command using a function and
heredocs, not thirteen separate Write calls.

### `docs/research/README.md`

One sentence on the naming convention, so the directory exists.

## 5. Closing S0

1. If the repo has a documentation check (for example a script that verifies cited
   paths exist), run it. Fence off paths that do not exist yet with its ignore
   markers, but not in the middle of a table or paragraph (it breaks rendering).
   Better to rephrase or create the directory.
2. A short section in the repo's `CLAUDE.md`: where the chain is, and that "continue
   <topic>" means the first open row in "Chain status".
3. Commit (trailer per the repo's rules) and push if the repo is meant for it
   (`wrap-up` step 0).
4. Write the starting commit into `S1.md` and the hash into the S0 row, commit.
5. Handoff: `S1.md` into `~/.claude/handoffs/<repo>/YYYY-MM-DD-HHMM-<topic>-S1.md` and
   into the clipboard (`pbcopy`).
6. Project memory: one entry saying where the chain is and how it continues.
7. Answer the user: what is where, where the gates are, how it continues, what S1
   does and when the first real cost is incurred.

## What to guard against

- Code in S0. The plan is the deliverable.
- A package whose "done when" is an opinion rather than a command.
- Gates an agent can "skip" because the question was not written at the top of the
  next handoff.
- A handoff that points at chat context ("as we said"). The reader has no chat.
- Invented estimates of duration, cost or share. If it was not measured, it gets
  measured in a package.
