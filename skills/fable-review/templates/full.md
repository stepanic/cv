# Mode: full (subsystem-by-subsystem audit)

Path (COMMIT): `docs/reviews/<date>-fable/`. LOCAL-ONLY: `OUT/` as a directory with the same files.

- `INDEX.md`: executive summary, findings table per subsystem and severity, a coverage matrix
  (subsystem x `MONEY-BUG`, `SEC`, `BUG`, `RISK`, `REFACTOR`, `TEST-GAP`), top 10 priorities, open questions for the owner.
- `<subsystem>.md` per subsystem: findings in the security format plus refactor findings in the refactor format.
- `implementation-plan.md`: the operating document for Opus, phases P0 -> P1 -> P2 with S/M/L effort, dependencies,
  do-not-touch warnings and an implementation status table.

On a large repository, one Fable agent per subsystem, sequentially; each appends to `INDEX.md` and the plan.
