# Job application pipeline

Drop a job posting in, get back everything needed to apply. Real
applications are **gitignored** (only this README and `_template/` are
public) and synced to the private repo `stepanic/cv-private` via
`scripts/sync-private.sh`.

## Flow

1. `cp -r _template "<yyyy-mm>-<company>-<role>"`
2. Paste the posting into `proposal.md` (verbatim + source URL + contact).
3. Open a Claude Code session in the repo root and ask it to process the
   application — the recipe lives in [`CLAUDE.md`](../CLAUDE.md). It produces:
   - `analysis.md` — requirements vs. my actual experience (`data/`),
     honest fit assessment, suggested angle
   - `cv-tailored.pdf` — bullets and projects re-weighted by the posting's
     keywords (via tags in `data/experience.yaml`)
   - `cover-letter.md` + `email-draft.md` — ready to send
4. Review, send, log the outcome in `status.md`.

Nothing in here is ever generated from imagination: every claim in a
tailored CV traces back to `data/`.
