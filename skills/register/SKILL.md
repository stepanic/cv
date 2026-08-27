---
name: register
description: Choose the prose register for anything written for a human audience — blog posts, docs, README bodies, LinkedIn drafts, reports. Engineering register is the default: conclusion first, no narrative arc, no reveals. Theatrical register is opt-in and must be asked for explicitly. Load when the user says any variant of "piši teatralno / dramatično / filmski / s pričom", "piši normalno / inženjerski / bez drame / suho / činjenično", "napiši obje verzije", "write it plainly", "no drama", "make it dramatic", or /register.
---

# Register — how the prose is built

Governs **structure and rhetoric**, not facts. Neither register may change a
number, soften a limitation, or drop a source. Both must remain reproducible by
someone holding the same data.

Two registers. **Engineering is the default and applies unless the user has asked
for the other in this session.** Theatrical is never chosen on your own initiative,
not for an "important" post, not for a launch, not because the material feels like
it deserves it.

---

## Engineering register — the default

**Order.** The most important finding goes in the first paragraph. Nothing is held
back to make a later sentence land. If the result contradicts the premise, say so
before presenting the evidence, then present the evidence.

**Headings name content, not narrative position.** `Check 3 — when the measuring
instrument changed`, never `The crack that proved fatal`. A reader scanning only the
headings must come away with the actual findings.

**Sentences are declarative.** No rhetorical questions. No one-sentence paragraphs
used as a drum beat. No sentence fragments for emphasis.

**Every number carries a unit, a date and a way to re-derive it.** A figure that
cannot be reproduced from stated data does not go in.

**Uncertainty is stated, not implied.** A `Limitations` section is mandatory in
anything that reports measurements, and it lists what the data cannot show, not
only what it shows weakly.

**Banned openers and connectives**, because each one exists to manufacture a beat:

> It turns out … / Here's the thing … / And that's when I realised … / The
> interesting part is … / But there was a problem … / What I found instead …

**Tables and code blocks carry data and commands.** Do not narrate a table in prose
next to the table.

**The ending is limitations, open questions or next steps.** Never a moral, never a
line engineered to resonate.

## Theatrical register — opt-in only

Permitted once asked for: a narrative arc, ordered reveals, one-sentence paragraphs,
metaphor, a closing line built to land.

Still binding, without exception:

- No invented facts, no adjusted numbers, no dropped caveat. Tension comes from the
  **order** in which true things are told, never from what is left out.
- The `Limitations` section stays, in full, even though it deflates the ending.
- If the arc requires a fact the data does not support, the arc is wrong.

## Both versions

When the user asks for both, write them as one set of facts in two builds. Same
measurements, same tables, same limitations, different assembly. Put the rejected
version in `docs/YYYY-MM-DD-topic.md` alongside the measurements, and the chosen one
where it is published, so the comparison survives the session.

## Bilingual work

When a text ships in English and Croatian, **write each one natively**. Do not
translate the first into the second. The Croatian version matches the English in
numbers, claims and section order, and differs freely in sentence construction.
Croatian: ijekavica, full diacritics, decimal comma, `6. svibnja 2026.` for dates.
Reach for the Croatian term where one is in ordinary developer use, keep the English
one where translating it would obscure the meaning.

A near-literal translation is detectable in the same way a narrative arc is, and it
fails the same test: it reads as generated rather than written.

## Relationship to CLAUDE.md

`CLAUDE.md` governs **voice** in anything sent as the user's own words — emails,
cover letters, messages, application answers: no em-dashes or en-dashes, no bold or
italic or inline links used as formatting, plain text with blank lines as the only
structure. That rule stands on its own and this skill does not relax it.

This skill governs **structure** in published prose — blog posts, docs, READMEs,
reports — where formatting is structural and dashes are ordinary. Where the two
overlap, `CLAUDE.md` wins.

## Making engineering the default stick

A skill only loads when it is triggered, so the default cannot live here alone. The
line that enforces it belongs in `CLAUDE.md`, where it is loaded in every session:

> **Prose register.** Anything written for a human audience uses the engineering
> register by default: conclusion first, headings that name content, no narrative
> arc, no withheld facts, limitations stated outright. The theatrical register is
> used only when asked for in that session. See `skills/register/SKILL.md`.

## Worked example

`docs/2026-08-27-colossus-hipoteza-dvije-verzije.md` in this repo holds the same
article in both registers, in both languages, with the measurements and the
reproduction commands beside them. The published version is the engineering one.
