# Mode: security (security and money audit)

Path (COMMIT): `docs/security/<date>-security-audit-fable.md`. LOCAL-ONLY: `OUT/<same name>`.

1. **Summary** (5-10 lines) and counts by severity: Critical / High / Medium / Low / Info.
2. **Threat model**: attackers, assets (money, keys, personal data, availability, LLM/API budget), entry points.
3. **Confirmed findings** (`SEC-01`..., `MONEY-01`...), each with severity, `file:line`, step-by-step attack scenario,
   impact, concrete fix and how to verify the fix.
4. **To verify**: suspicions that depend on external configuration (WAF, auth provider, cloud dashboards) and could not
   be proven from code alone.
5. **What is well protected**, so Opus does not break existing controls.
6. **Tasks for Opus**: checklist `- [ ] SEC-01 ...` ordered by priority.
