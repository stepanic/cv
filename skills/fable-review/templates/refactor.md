# Mode: refactor (architecture and cleanup plan)

Path (COMMIT): `docs/refactor/<date>-code-review-and-refactor-plan.md`. LOCAL-ONLY: `OUT/<same name>`.

1. **State and attribution**: size, test and CI status, main architectural problems.
2. **Confirmed good, do not touch**: explicit list of files, formats, cryptographic or SQL latches and business rules
   that Opus must not change while cleaning up.
3. **Findings catalogue** (`R-01`...), grouped as (a) critical bugs and build/CI gaps, (b) security and data integrity,
   (c) architecture, duplication and oversized files, (d) test gaps and ops hygiene. Each: ID, priority P0/P1/P2,
   effort S/M/L, `file:line`, problem, proposed fix, done-when criterion.
4. **Decisions for the owner**: contradictions in copy, legal text, prices or business logic that a model must not guess.
5. **Execution plan in waves** (Wave 0 ... N), each leaving build and tests green (for example: Wave 0 CI and tests that
   catch existing bugs, Wave 1 mechanical file splits behind a barrel export, Wave 2 individual logic fixes with
   regression tests), plus a tracking table `| Step / finding | Status | Commit | Note |` that Opus updates.
