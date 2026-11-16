# Mode: diff (weekly / PR / delta)

Path (COMMIT): `docs/reviews/<date>-fable-diff-<topic>.md`. LOCAL-ONLY: `OUT/<date>-fable-diff-<topic>.md`.

1. **Verdict** in 3-5 sentences: can this ship now, or are there 🔴 blockers.
2. **Status of previous findings**: table `ID | short description | ✅ fixed in <sha> / ⚠️ partial / ❌ open`.
3. **New findings** over the changes (`F-01`...), each with: severity, `file:line` at the frozen SHA, the failure
   scenario (concrete input or state, wrong outcome), the concrete fix for Opus, and how to verify (a test or command
   that fails today and passes after the fix).
4. **Rollout checklist**: migrations, fallback if an external API is down, post-deploy query or check.
5. **What holds up** in this delta.
