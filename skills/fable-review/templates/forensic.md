# Mode: forensic (model side-by-side over git history)

Path (COMMIT): `docs/research/<date>-model-forensics.md`. LOCAL-ONLY: `OUT/<same name>`.

1. **Chronology by model**: `Co-Authored-By` statistics (commits, lines added/removed, areas worked on).
2. **Same-file comparisons**: cases where two models touched the same file or solved the same problem, with
   `git show <sha>` evidence of who introduced a bug or missed an edge case and who fixed it.
3. **Rubric scored 0-100** on: edge-case coverage, security by default, trust-boundary reasoning, blast-radius
   awareness, architectural discipline and churn.
4. **Fair counterexamples**: where the more expensive model did worse or overcomplicated, and the cheaper one did better.
5. Check the premise of the request against `git log` before scoring; say so if it does not hold.
