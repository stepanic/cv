# `/register` — engineering prose by default, theatrical on request

> **TL;DR** LLM prose defaults to a three-act arc: setup, complication, reveal,
> lesson. It is recognisable and, in a technical write-up, it costs you the
> conclusion — the finding ends up at the bottom, held back for effect. This skill
> makes the engineering register the default and puts the theatrical one behind an
> explicit request.

- [`SKILL.md`](SKILL.md) — the skill, English, generic. This is the one to install.
- [`SKILL.hr.md`](SKILL.hr.md) — the Croatian original as it runs on my machine.

## What it changes

| | engineering (default) | theatrical (on request) |
|---|---|---|
| conclusion | first paragraph | withheld for the ending |
| headings | name the content | name the narrative position |
| sentences | declarative | fragments and beats allowed |
| ending | limitations, open questions | a line built to land |
| facts, numbers, caveats | **identical in both** | **identical in both** |

The rule that makes it safe: drama may come only from the **order** in which true
things are told, never from what is left out. The limitations section survives into
the theatrical version intact.

## Install

```bash
mkdir -p ~/.claude/skills/register
cp skills/register/SKILL.md ~/.claude/skills/register/SKILL.md
```

A skill only loads when it is triggered, so the default cannot live in the skill
alone. Put the enforcing line in `CLAUDE.md` (or `~/.claude/CLAUDE.md`), where it is
read every session — the exact wording is in the skill under *Making engineering the
default stick*.

## Worked example

[`docs/2026-08-27-colossus-hipoteza-dvije-verzije.md`](../../docs/2026-08-27-colossus-hipoteza-dvije-verzije.md)
holds one article written in both registers, in both languages, with the underlying
measurements and the commands that reproduce them. The published version is the
engineering one:
[stepanic.domovina.ai/blog/colossus-lease-in-my-own-usage-data](https://stepanic.domovina.ai/blog/colossus-lease-in-my-own-usage-data).

MIT.
