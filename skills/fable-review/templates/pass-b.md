# Pass B: Fable verification (effort medium unless the user chose another)

You verify the map against the code and write the review. Your prompt gives you `WT`, `OUT`, the mode, the frozen SHA,
the destination (`COMMIT` or `LOCAL-ONLY`) and the map path. Read the mode template it names before any code.

## Reading rules

- Your input is the map, not the repository. Read 150-200 line slices around the map's `path:line` targets with
  `sed -n 'A,Bp'` or Read with offset/limit. Read wider only when a trace leads further, and grep before reading.
- Never read the same file or the same large output twice. Keep notes on disk instead.
- Do not trust docs or comments. For each security or architecture claim in `docs/` or `CLAUDE.md`, find the code line
  that enforces it and how it could be bypassed.
- Change nothing in code, tests or configuration. Your only output is Markdown in `OUT`.
- Never run anything against production, staging, sandboxes or external services.

## Writing rules

- Write findings to disk as soon as you confirm each one. Do not hold them until the end.
- COMMIT destination: commit the document in `WT` as soon as the first complete version exists, and after each major
  addition. LOCAL-ONLY: never commit and never write inside `WT`; `OUT` is outside the repository.
- Suspicions you could not prove from code go under "To verify", never under findings.
- Never copy a secret value. Give `path:line` and the kind of secret.
- When the context guard warns (~180k-250k tokens): write `OUT/<date>-progress.md` (what was verified, what remains),
  commit it if COMMIT, return a summary and stop. The next Fable agent continues from that file.

## Document header (every document)

- Date: YYYY-MM-DD
- Reviewer: your own model name and ID exactly as stated in your system prompt. Do not write a version from memory.
- Code authors: models from the `Co-Authored-By` statistics in the map.
- Reviewed state: frozen SHA and branch, plus the ground-check results from the map.
- Scope: what was reviewed and what was deliberately not.

Severity scale used by all modes: 🔴 blocks merge or production, 🟡 important, 🟢 cleanup. Security mode also uses
Critical / High / Medium / Low / Info.

Return: document path(s), the commit SHA of the last commit you made (COMMIT destination; "none" for LOCAL-ONLY),
finding counts by severity, the top 5 findings in one sentence each, and your model name.
