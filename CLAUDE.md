# CV — single source of truth

This repo is Matija Stepanić's CV **as an application**: structured data in,
website + PDFs + tailored job-application packages out. It is maintained
through Claude Code sessions. Public repo — never commit secrets, client
names under NDA, or real job applications (those live in `applications/*`,
which is gitignored and synced to the private repo `stepanic/cv-private`).

## Layout

- `data/` — **the only place CV content is edited.** Bilingual fields are
  `{en:, hr:}`. Validated by `schema/cv.schema.json` (`npm run validate`).
- `data/generated/` — machine-written by `scripts/update-*-stats.sh`. Never
  edit by hand.
- `typst/` — PDF templates (full / onepage / ats × en / hr). `npm run pdf`
  writes to `dist/` (committed, so the PDFs are always downloadable from
  GitHub raw links).
- `web/` — Next.js 14 static export, deployed to https://stepanic.domovina.ai
  (Cloudflare Worker `stepanic-cv`, zone `domovina.ai`). `npm run deploy`.
- `applications/` — job-application pipeline (see below).

## Routine maintenance (any session)

1. Edit `data/*.yaml` (e.g. new project, new bullet — bullets carry `tags`
   and `priority` 1–3; priority 1 appears in the one-page variant).
2. `npm run validate && npm run stats && npm run pdf`
3. `npm run deploy` (builds web from the same data)
4. Commit everything including `dist/` and `data/generated/`.

CI (`.github/workflows/ci.yml`) re-validates and rebuilds on every push;
`stats.yml` refreshes GitHub stats weekly. Claude Code stats can only be
updated locally: `npm run stats:claude` runs
`scripts/mine-claude-history.mjs`, which stitches live `~/.claude`
transcripts, the git history of `~/git/stepanic/dotclaude-backup` (daily
snapshots — extends past the 30-day retention) and `stats-cache.json`, with
CodexBar-style token counting and per-model API pricing. Aggregates only —
never publish transcript content.

## Job application workflow ("ubaci proposal, dobij sve")

When the user drops a job proposal/posting into a session:

1. Create `applications/<yyyy-mm>-<company>-<role>/` from
   `applications/_template/`.
2. Save the raw posting as `proposal.md` (verbatim + source URL).
3. Write `analysis.md`: requirements extracted from the posting, mapped
   against `data/` — which experience bullets/projects/skills match, which
   gaps exist, honest fit score, suggested angle.
4. Generate a tailored CV: pick the bullet subset whose `tags` match the
   posting's keywords, reorder featured projects accordingly, then build with
   Typst (copy `typst/cv-full.typ` usage; a per-application `.typ` override
   or a filtered data copy inside the application folder is fine — never
   modify `data/` to tailor).
5. Write `cover-letter.md` (language of the posting; concrete, references
   real projects from `data/`, no fluff) and `email-draft.md` (short,
   links to stepanic.domovina.ai and the tailored PDF).
6. Everything stays inside the application folder (gitignored). Sync to the
   private repo with `scripts/sync-private.sh`.
7. Never invent experience. Every claim must trace back to `data/`.

## Conventions

- Croatian text: ijekavica, proper diacritics. English: concise, quantified.
- New project files in `data/projects/` need a unique `id` and `order`;
  `featured: true` puts them on the PDF and the top grid of the site.
- After adding a project file, add its basename to the `files` list in
  `typst/lib.typ` (Typst can't glob directories).
- Keep numbers honest and sourced: GitHub numbers come from
  `data/generated/github-stats.json`, Claude Code numbers from
  `data/generated/claude-code-stats.json` — don't hardcode them in prose
  except in `profile.summary` (update that when the order of magnitude
  changes).
