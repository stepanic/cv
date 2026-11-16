// Blog content — bilingual, markdown bodies rendered at build time by
// lib/blog.ts (marked). Newest post first is enforced by date sorting there.

export interface BlogPost {
  slug: string;
  /** ISO date "YYYY-MM-DD". */
  date: string;
  tags: string[];
  title: { en: string; hr: string };
  lead: { en: string; hr: string };
  body: { en: string; hr: string }; // markdown
  sources: { title: string; url: string }[];
}

export const posts: BlogPost[] = [
  {
    slug: "fable-review-skill-two-model-code-audits",
    date: "2026-11-16",
    tags: ["Claude Code", "Skills", "Security", "Architecture", "Open source"],
    title: {
      en: "Two-model code reviews across 28 sessions: Fable reviews, Opus executes",
      hr: "Pregledi koda s dva modela kroz 28 sesija: Fable pregledava, Opus izvodi",
    },
    lead: {
      en: "Across 28 Claude Code sessions between June and October 2026, I used Claude Fable (5 and 5.1) as a read-only reviewer of code written by Claude Opus (4.8, 5 and 5.5). After five Fable subagents, at most three at a time, used up the last 7% of a weekly Max 5x limit ($30.46 API-equivalent) in 14 minutes by reading whole repositories into 636k-token contexts, I turned the transcripts into /fable-review, a two-pass skill with five modes. Its first measured run cost $2.51 and found a blocker in the skill itself.",
      hr: "Kroz 28 Claude Code sesija od lipnja do listopada 2026. Claude Fable (5 i 5.1) služio mi je kao recenzent koji samo čita kod što ga je napisao Claude Opus (4.8, 5 i 5.5). Nakon što je pet Fable subagenata, najviše tri istodobno, za 14 minuta potrošilo zadnjih 7 % tjednog Max 5x limita (30,46 $ po API cjeniku) čitajući cijele repozitorije u kontekst od 636k tokena, iz transkripata sam napravio /fable-review, skill u dva prolaza s pet modova. Prvo izmjereno pokretanje stajalo je 2,51 $ i našlo blokirajući propust u samom skillu.",
    },
    body: {
      en: `Between 10 June and 16 October 2026, 28 Claude Code sessions on my machine followed the same division of labour: Claude Opus (4.8, 5 and 5.5) wrote the implementation, and Claude Fable (5 and 5.1) reviewed a frozen commit without changing any source file, writing Markdown findings and phased refactor plans into the repository for Opus to execute in later sessions. On 16 October 2026, five Fable 5.1 subagents running single-pass security audits, at most three at a time, used up the remaining 7% of a Claude Max 5x weekly quota ($30.46 API-equivalent across 113 API calls) in 14 minutes, because each agent read whole files into a context that grew to 636k tokens. From those 28 sessions and the token telemetry of 16 October I built [\`/fable-review\`](https://github.com/stepanic/cv/tree/main/skills/fable-review), a two-pass skill: a deterministic pre-flight script and a cheap mapping pass hand Fable 15 to 30 targeted \`file:line\` ranges instead of the whole repository. The first measured run, a \`diff\` review of the skill's own rewrite on Fable 5.2 on 16 November 2026, took 7 API calls, a 102k peak context and $2.51, inside the pre-flight estimate of $1.50–3.50. It found one blocker and 14 other issues in the skill, all fixed the next day. The cost figures for whole repositories and for the other modes are still estimates.

## Why the implementing model's own audit is not enough

A model auditing its own implementation checks the invariants it thought of while writing the code. Two public repositories show what changes when a second model reviews a frozen commit read-only:

1. **Public voting on Gnosis Chain with Semaphore ZK proofs ([\`stepanic/stadion-maksimir-natjecaj-2026\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026)).** On 26 September 2026, Opus 5.5 built the off-chain and on-chain voting pipeline and wrote its own security audit under \`docs/blockchain/audit/\`. Reviewing frozen commit \`faaaa5f\` read-only ([tag \`audit-fable-2026-09-26\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026/blob/main/docs/review/2026-09-26-neovisni-review-glasanje.md)), Fable 5.1 found no errors in the Poseidon hashes or the SNARK proof verification that Opus had audited, and five vulnerabilities in the surrounding system that lay outside Opus's threat model:
   - \`F-01\`: registering an identity and casting the first ballot in one flow linked the voter's identity to the ballot through the Merkle root timestamp, contradicting the privacy claim in the contract's NatSpec.
   - \`F-02\`: the \`maksimir_zk_share\` edge function accepted unauthenticated writes without verifying the SNARK proof, which allowed arbitrary database growth and forged Open Graph share cards.
   - \`F-04\`: zero-knowledge circuit artifacts were fetched from an external CDN without SHA-256 verification.
   - \`F-05\`: the hourly GitHub Actions checkpoint cron skipped runs under load (verified with \`gh run list --workflow maksimir-checkpoint.yml --json event,createdAt\`).
   - \`F-06\`: the WebAuthn \`user.id\` was derived from the public commitment.
2. **Non-custodial EURe payment rail and passkey Safe wallet ([\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai)).** On 10 and 11 June 2026, both models worked on the same files, with authorship recorded in \`Co-Authored-By\` trailers. Two forensic reports were written over that git history: a [Fable 5 self-evaluation (\`557dfc9\`)](https://github.com/domovinatv/pay.domovina.ai/blob/main/docs/research/fable5-vs-opus48-side-by-side.md) and a [blind Opus 4.8 counter-audit (\`8addcbf\`)](https://github.com/domovinatv/pay.domovina.ai/blob/main/docs/research/opus48-independent-forensic-fable5-vs-opus48.md). In \`wallet/src/pages/Embed.tsx\`, a \`parentOrigin\` spoofing vulnerability introduced in commit \`f3399ed\` survived two separate Opus 4.8 security passes over that file and was caught in Fable 5's first pass (\`cdda3bc\`). In \`wallet/functions/api/relay.ts\`, the endpoint that moves money, Opus 4.8 validated 2 of 10 fields (the \`getCode\` pre-flight and \`to === safe\` on the cold path), and Fable 5 added 8 checks (\`operation === 0\` blocking \`delegatecall\`, a selector whitelist, recipient address format, a positive amount bound and gas caps). In the other direction, the blind Opus 4.8 pass showed that Fable's self-score of 86 vs 67 used weights that gave only 12% to blast-radius discipline, the one dimension where Opus scored higher (82 vs 68), after Fable shipped an unverified WebAuthn Signal API call in \`fceab4d\` that had to be reverted in \`6c83f51\`. With equal weights across all nine dimensions, the scores were 77 (Fable 5) and 75 (Opus 4.8).

## Chronology of Fable reviews on public repositories

Of the 28 Fable review sessions mined from \`~/.claude/projects/**/*.jsonl\`, 18 ran on public repositories under \`domovinatv\` and \`stepanic\`. The other 10 ran on private or client repositories and are left out under this repository's publication policy.

| Date (CEST) | Public repository | Model | Mode | Deliverable committed to repository |
|---|---|---|---|---|
| 2026-06-10 00:22 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai) | Fable 5 | \`security\` + \`refactor\` | \`wallet/docs/{security-custody-model,relayer-architecture,relayer-threat-model,user-flows,passkey-onboarding-industry-standards,safe-client-compatibility}.md\` |
| 2026-06-10 08:07 | [\`domovinatv/domovina.ai\`](https://github.com/domovinatv/domovina.ai) | Fable 5 | \`refactor\` | \`docs/backend-prompts/10-account-management.md\` |
| 2026-06-10 23:35 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai) | Fable 5 | \`forensic\` | [\`docs/research/fable5-vs-opus48-side-by-side.md\`](https://github.com/domovinatv/pay.domovina.ai/blob/main/docs/research/fable5-vs-opus48-side-by-side.md) |
| 2026-06-11 10:26 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai) | Opus 4.8 (blind check) | \`forensic\` | [\`docs/research/opus48-independent-forensic-fable5-vs-opus48.md\`](https://github.com/domovinatv/pay.domovina.ai/blob/main/docs/research/opus48-independent-forensic-fable5-vs-opus48.md) |
| 2026-07-07 20:05 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai) | Fable 5 + Opus 4.8 | \`full\` | [\`docs/reviews/2026-07-fable5/\`](https://github.com/domovinatv/pay.domovina.ai/tree/main/docs/reviews/2026-07-fable5) (9 files, 46 consolidated findings, F0–F3 plan) |
| 2026-07-10 21:58 | [\`domovinatv/domovina-api\`](https://github.com/domovinatv/domovina-api) | Fable 5 | \`full\` | \`docs/review-2026-07/{README,01-fixes-security-correctness,02-ops-hardening,03-consistency-refactor,04-docs-hygiene,05-roadmap-features}.md\` |
| 2026-07-19 22:31 | [\`domovinatv/izbori.domovina.ai\`](https://github.com/domovinatv/izbori.domovina.ai) | Fable 5 | \`refactor\` | \`PLAN_POBOLJSANJA.md\`, \`PLAN_UI.md\`, \`docs/STANJE_I_NASTAVAK.md\` |
| 2026-09-26 00:47 | [\`stepanic/stadion-maksimir-natjecaj-2026\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026) | Fable 5.1 | \`security\` | [\`docs/review/2026-09-26-neovisni-review-glasanje.md\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026/blob/main/docs/review/2026-09-26-neovisni-review-glasanje.md) (F-01…F-12, tag \`audit-fable-2026-09-26\`) |
| 2026-09-26 01:39 | [\`stepanic/stadion-maksimir-natjecaj-2026\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026) | Fable 5.1 | \`diff\` | [\`docs/review/2026-09-26-neovisni-review-wiring.md\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026/blob/main/docs/review/2026-09-26-neovisni-review-wiring.md) (F-13…F-22, tags \`…-wiring\`, \`…-wiring-2\`) |
| 2026-10-02 17:05 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai) | Fable 5.1 | \`full\` | [\`docs/reviews/2026-10-fable51/\`](https://github.com/domovinatv/pay.domovina.ai/tree/main/docs/reviews/2026-10-fable51) (5 files, 35 findings + P0–P2 plan for Opus 5.5) |
| 2026-10-02 17:08 | [\`domovinatv/energy.domovina.ai\`](https://github.com/domovinatv/energy.domovina.ai) | Fable 5.1 | \`refactor\` | [\`docs/refactor/00-pregled.md\`](https://github.com/domovinatv/energy.domovina.ai/blob/main/docs/refactor/00-pregled.md) … \`05-alati-testovi-docs.md\` (30 items in 6 waves) |
| 2026-10-02 17:13 | [\`domovinatv/domovina-fiskal\`](https://github.com/domovinatv/domovina-fiskal) | Fable 5.1 | \`refactor\` + \`forensic\` | [\`docs/handoff/2026-10-02-pregled-koda-i-plan-refactora.md\`](https://github.com/domovinatv/domovina-fiskal/blob/main/docs/handoff/2026-10-02-pregled-koda-i-plan-refactora.md) (K1–K24 + 9-step plan) |
| 2026-10-09 22:47 | [\`stepanic/stadion-maksimir-natjecaj-2026\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026) | Fable 5.1 | \`diff\` | [\`2026-10-09-neovisni-review-tjedan-glasaj.md\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026/blob/main/docs/review/2026-10-09-neovisni-review-tjedan-glasaj.md) (F-23…F-37) + [\`2026-10-09-neovisni-review-opci-model-i-v2.md\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026/blob/main/docs/review/2026-10-09-neovisni-review-opci-model-i-v2.md) (E-01…E-15), tag \`audit-fable-2026-10-09\` |
| 2026-10-09 22:57 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai) | Fable 5.1 | \`diff\` | [\`docs/reviews/2026-10-fable51-r2/\`](https://github.com/domovinatv/pay.domovina.ai/tree/main/docs/reviews/2026-10-fable51-r2) (5 files, 32 findings over 40 Opus 5.5 commits) |
| 2026-10-16 22:06 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai), [\`domovinatv/pipeline.domovina.ai\`](https://github.com/domovinatv/pipeline.domovina.ai), [\`domovinatv/omm.domovina.ai\`](https://github.com/domovinatv/omm.domovina.ai) | Fable 5.1 subagents | \`security\` | \`docs/security/2026-10-16-security-audit-fable.md\` in all three repos (plus [postmortem in \`stepanic/cv\`](https://github.com/stepanic/cv/blob/main/docs/2026-10-17-postmortem-fable-subagenti-tjedni-limit.md)) |

## What the prompts asked for

In October 2026 the prompt settled into a Friday routine before the weekly subscription reset on Saturday at 02:00 CEST. Four verbatim examples from 2 and 9 October 2026, typos included:

\`\`\`text
# pay.domovina.ai (2026-10-02 17:05 CEST)
zelim da mi analziras sto je napravleno trenutno u codebaseu ti kao model Fable 5.1
mislim da ces pronaci stavri koje bi trebalo popraviti nemoj kodiratinego pisis
markdown dokumenete s uputama sto bi trebalo eventualnons prijedlogom implememtacije
a onda ce Opus 5.5 proci po tvojem review i raditi implememtaciju u skladu s naalziom

# energy.domovina.ai (2026-10-02 17:08 CEST)
ovako mene ti zanima sljedece development je ovdje radjen sa Opus modelima zelim da
ti kao Fable 5.1 napravis analizu i ne radis refactor nego pises u codebase amrkdown
dokumente s prijedlozima za refactor na temlju tvoje analize se Opus modeli proci i
refactorati sve sto ima smisla

# domovina-fiskal (2026-10-02 17:13 CEST)
ovako implemetaciju u ocom codebaseu je vecinom radio OPus model, daj pregledaj po
git history je li Fable 5.1 ili Fable 5 radio i daj napravi analizu postojece
implemmetacije i nemoj raditi modifikacije nego pisis markdown dokument s prijedlogom
implemetacije ponasaj se kao revieeer na temelju tvoje analize ce Opus 5.5. proci i
napraviti refactor ali zelim analizu tebe kao superornijeg modela

# stadion-maksimir-natjecaj-2026 (2026-10-09 22:47 CEST)
ovaj tjedan smo radili neke izmjene sa opus 5.5 zelim da to sve pregledas nista
nemojnrefactorsti nego prodji kroz sve i napravi markdown dokumente koji su analiza
sa projedlozima poboljsanja osobito briga za edga caseove koje opus je preskocio ali
pisi prijedloge implementacije
\`\`\`

In \`domovina-fiskal\`, Fable 5.1 first checked the premise of the prompt against \`git log\` and disproved it: Fable 5 had written about 6,700 of the roughly 10,300 lines in \`backend/\` (phases 0–3), and Opus 5.5 about 2,700 (phase 4 and the test suite). Of the 24 findings (\`K1\`–\`K24\`), six were in Fable 5's own earlier code (\`K1\`, \`K3\`, \`K4\`, \`K13\`, \`K15\`, \`K16\`) and four in Opus 5.5's code (\`K7\`, \`K10\`, \`K11\`, \`K12\`). For \`K1\`, \`git check-ignore\` proved that the \`*.pem\` rule in \`.gitignore\` also ignored \`backend/src/fiskal/ca/*.pem\`, so a fresh clone could not build at all. Opus 5.5 executed steps 0–8 of that plan on 12 and 13 November 2026, grew the test suite from 49 to 222 tests and deployed v0.5.0 to production.

## Why five Fable subagents used 7% of the weekly limit in 14 minutes

On Friday 16 October 2026 at 22:06 CEST, an Opus 5.5 orchestrator session (\`8d40f90b\`) queued 11 security audits on \`model: "fable"\` subagents, up to three in parallel. At 22:20 CEST the fifth subagent was rejected with \`rateLimitType: "seven_day"\` (\`status: "rejected"\`). Deduplicating the transcript \`usage\` blocks by \`message.id\` and pricing them at API list prices (Fable 5.1: $10/MTok input, $12.50/MTok 5-minute cache write, $0.25/MTok cache read, $50/MTok output; Opus 5.5: $4 / $5 / $0.20 / $20; Sonnet 5.5: $2 / $2.50 / $0.20 / $10) gives:

| Subagent target | Calls | Max context | Cache write | Cache read | Output (thinking) | Fable 5.1 $ | Same on Opus 5.5 | Same on Sonnet 5.5 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| \`pay.domovina.ai\` | 44 | 636k | 636,105 | 10,984,242 | 65,057 (31,370) | $13.96 | $6.68 | $4.44 |
| \`pipeline.domovina.ai\` | 30 | 289k | 270,718 | 4,580,598 | 52,400 (23,457) | $7.16 | $3.32 | $2.12 |
| \`omm.domovina.ai\` | 20 | 249k | 231,616 | 2,689,143 | 48,340 (19,679) | $5.99 | $2.67 | $1.60 |
| \`energy.domovina.ai\` *(aborted on 429)* | 13 | 175k | 156,725 | 999,220 | 6,714 (1,209) | $2.55 | $1.12 | $0.66 |
| repo X *(outside public allow-list, aborted)* | 6 | 68k | 50,040 | 257,786 | 2,196 (588) | $0.80 | $0.35 | $0.20 |
| **Subagents total** | **113** | | **1,345,204** | **19,510,989** | **174,707** | **$30.46** | **$14.14** | **$9.02** |

Three mechanisms produced the $30.46:
1. **Cache writes were 55% of the total ($16.82).** The \`pay.domovina.ai\` agent ran \`for f in ...; do cat -n "$f"; done\` over batches of 4 to 7 files. Claude Code spills outputs over 30 KB to \`tool-results/*.txt\`, and the agent then read those files with \`Read\` (more than 25 reads of 5–15k tokens each). At 22:14 it read four 55 KB spilled outputs a second time and paid the $12.50/MTok cache-write price for the same code twice.
2. **A 600k context is resent on every call.** Across 44 calls, the \`pay.domovina.ai\` agent sent **11.6M input tokens**.
3. **Splitting one Fable session into several 200k sessions does not lower the API cost.** Replaying the exact \`pay.domovina.ai\` call sequence with a 200k context cap raises the cost from $13.95 (1 session) to $14.76 (5 sessions): cache reads on Fable cost $0.25/MTok, while each new session pays $12.50/MTok to write the base context again. The saving comes only from keeping bulk file reading out of Fable's context.

## How \`/fable-review\` works

The skill starts only when I type \`/fable-review\`. Its frontmatter sets \`disable-model-invocation: true\`, so no other skill, plan or handoff can start a Fable agent. One invocation reviews one repository in five steps:

1. **Deterministic pre-flight (\`scripts/preflight.sh\`).** Before any LLM call, a shell script works on the review base (\`origin/<default>\`): it counts tracked text files and lines with \`git grep -I -c ''\`, lists the stack and the read-only ground-check commands (\`tsc --noEmit\`, \`vitest\`, \`flutter analyze\`, \`cargo check\`, \`forge test\`), finds the last \`audit-*\` tag, tallies \`Co-Authored-By\` trailers and prints a cost estimate. It also decides where the review goes. It parses host and owner from the \`origin\` URL and compares \`host/owner\` literally with my allow-list: a match gives \`COMMIT\`, anything else gives \`LOCAL-ONLY\`, and a repository without a remote gives \`ASK\`. For \`LOCAL-ONLY\` the review is written to \`~/.claude/fable-review/reports/<owner>-<repo>/\` and nothing is committed, tagged or pushed. Invalid arguments stop the script with exit code 2.
2. **Isolated git worktree.** Parallel sessions often share one working tree, so the review runs in a worktree under \`~/.claude/fable-review/worktrees/\`, on a named branch for \`COMMIT\` and detached for \`LOCAL-ONLY\`.
3. **Pass A: map and ground check.** Sonnet 5.5 (\`effort: "medium"\`) runs the read-only checks, reads \`CLAUDE.md\`, \`README.md\` and ADR summaries, lists the intentional invariants that must not be reported as bugs, and writes \`00-map.md\` with 15 to 30 prioritized \`path:line\` hotspots. When the repository, or the diff in \`diff\` mode, is under about 5,000 lines, the orchestrating session writes the map itself. For an external repository only static checks run unless I allow its test suite, because tests execute that repository's code on my machine.
4. **Pass B: targeted Fable verification.** One Fable agent (\`effort: "medium"\` unless I name another level) gets the map and reads 150 to 200-line slices around each target with \`sed -n 'A,Bp'\`. It checks documentation claims against the code, writes each finding to disk as soon as it is confirmed, and puts suspicions it cannot prove under "To verify". Every document has a "What holds up" section that the executing Opus session must not touch, and a phased plan. Right after the agent returns, \`scripts/salvage.py\` writes everything recoverable from its transcript into one local Markdown file: all text, full Write and Edit contents, usage per call, the cost in USD, and whether the agent finished. Claude Code stores thinking blocks empty, so thinking cannot be saved; the script reports its token count.
5. **Finish and handoff.** For \`COMMIT\`, the review branch is pushed to the default branch only if it differs from it in review documents alone. A \`diff\` review based on an unpushed feature branch fails that check, so only the review branch is pushed and the code under review is not shipped as a side effect. The pushed commit gets an annotated tag \`audit-fable-YYYY-MM-DD-<mode>\`, which is the base of the next \`diff\` run. A ready prompt for a fresh Opus session goes to \`~/.claude/handoffs/<repo>/\` and to the clipboard.

| Mode | Scope | Estimated cost (Pass A + B) |
|---|---|---|
| \`diff\` | Commits since the last \`audit-*\` tag, or since \`--base <ref>\` | $2–5 (measured once: $2.51) |
| \`refactor\` | Module boundaries, duplication, oversized files, a wave-by-wave refactor plan | $4–7 |
| \`security\` | Threat model, entry points, money, auth and secret flows, a \`- [ ] SEC-xx\` checklist | $4–7 |
| \`full\` | Subsystem-by-subsystem audit with a coverage matrix in \`INDEX.md\` and \`implementation-plan.md\` | $8–15 |
| \`forensic\` | \`Co-Authored-By\` attribution, shared-file diffs, 0–100 rubric scores | $3–5 |

Apart from the one \`diff\` measurement, the figures come from Fable 5.1 prices and the 16 October transcripts.

## First measured run: the skill reviewed its own rewrite

On 16 November 2026 at about 23:00 CET, \`/fable-review ~/git/stepanic/cv --mode diff --base 229618f\` reviewed the two commits that had rewritten the skill: 14 files, +656/−492, 1,148 changed lines. The orchestrating Opus 5.5 session did Pass A itself, because the diff was under 5,000 lines. Pass B ran on Fable 5.2 (\`claude-fable-5-2\`) at effort \`low\`, which I chose for a first run.

| Pass B | Pre-flight estimate | Measured |
|---|---:|---:|
| API calls | 10–18 | 7 |
| Peak context | under 150k | 102k |
| Cache write / cache read | | 102,423 / 434,637 |
| Output (of which thinking) | | 22,358 (9,145) |
| Cost at API prices | $1.50–3.50 | $2.51 |
| Duration | | about 4 min |

The run used about 1% of the weekly Fable limit. The review ([\`docs/reviews/2026-11-16-fable-diff-fable-review-skill.md\`](https://github.com/stepanic/cv/blob/main/docs/reviews/2026-11-16-fable-diff-fable-review-skill.md), tag \`audit-fable-2026-11-16-diff\`) has 1 🔴, 6 🟡 and 8 🟢 findings:

- \`F-01\` 🔴: on the documented path for reviewing an unpushed feature branch, the finish step would have pushed the unreviewed feature commits to \`main\` together with the review.
- \`F-02\` 🟡, proven with scratch repositories: the destination check ignored the host and matched the owner as a regular expression, so \`https://gitlab.example.com/stepanic/x.git\` counted as my own repository, and a client's review would have been committed and pushed into the client's repository.
- \`F-03\` 🟡, proven: \`preflight.sh <repo> --base\` with no value looped forever.
- \`F-07\` 🟡: \`salvage.py\` reported tokens but no cost, so the "actual vs estimated cost" line was the orchestrator's own arithmetic.
- \`F-04\` 🟡 was partly wrong. Fable concluded from a sampled \`.meta.json\` that Claude Code never marks a subagent as finished; that sample belonged to an agent that had not finished, and Pass B's own meta file did contain \`"finished": true\`. The orchestrator recorded the correction in the document.

An Opus 5.5 session fixed all 15 findings on 17 November 2026 in [\`36a8cf9\`](https://github.com/stepanic/cv/commit/36a8cf9). For each one it ran the check from the document before the fix, where it failed, and after it, and added a status table to the same document. \`salvage.py\` now prints \`cost_usd=2.51\` for this run, matching the figure above.

## Limitations

- **One measured run.** The table above is a single \`diff\` review of 1,148 changed lines at effort \`low\`. Runs at \`medium\`, on whole repositories and in the other modes have not been measured yet, so those figures remain estimates.
- **Subscription quota weights are inferred, not published by Anthropic.** The 45 : 7 ratio between the 5-hour window (0% → 55%) and the weekly window (93% → 100%) comes from one $32.30 window on 16 October 2026, compared with a $369 Opus 5.5 window on 30 September 2026. Two data points cannot show whether subscription limits weigh cache reads differently from API list prices.
- **Two-pass mapping trades recall for bounded context.** Pass B reads only the \`file:line\` ranges in \`00-map.md\` and the code it reaches by following traces from them. A bug in a file the map left out, with no trace leading to it from a listed entry point, can be missed unless \`full\` mode is used.
- **A read-only code review cannot see live configuration.** Cloudflare WAF rules, Supabase GoTrue settings (such as \`mailer_autoconfirm\` in \`domovina-fiskal\` finding \`K5\`) and production database state live outside the git tree and stay under "To verify" until someone checks them against the live infrastructure.
- **Ten of the 28 sessions are not in the public table.** They ran on private or client repositories. The design of the skill draws on all 28 sessions; every example and commit hash cited here comes from the 18 public ones.

## Source

The skill in English and Croatian, the \`preflight.sh\` and \`salvage.py\` scripts, the templates and the documentation: [github.com/stepanic/cv/tree/main/skills/fable-review](https://github.com/stepanic/cv/tree/main/skills/fable-review). MIT.`,
      hr: `Od 10. lipnja do 16. listopada 2026. 28 Claude Code sesija na mom računalu dijelilo je posao na isti način: Claude Opus (4.8, 5 i 5.5) pisao je implementaciju, a Claude Fable (5 i 5.1) pregledavao je zamrznuti commit, bez izmjene ijedne izvorne datoteke, i u repozitorij zapisivao Markdown nalaze i planove refactora po fazama, koje je Opus zatim izvodio u idućim sesijama. Dana 16. listopada 2026. pet Fable 5.1 subagenata, od kojih su najviše tri radila istodobno, u jednofaznom je sigurnosnom auditu za 14 minuta potrošilo preostalih 7 % tjednog limita na planu Claude Max 5x (30,46 $ po API cjeniku, 113 poziva), jer je svaki agent čitao cijele datoteke u kontekst koji je narastao do 636k tokena. Iz tih 28 sesija i telemetrije tokena od 16. listopada nastao je [\`/fable-review\`](https://github.com/stepanic/cv/tree/main/skills/fable-review), skill u dva prolaza: deterministička pre-flight skripta i jeftin prolaz za mapiranje Fableu predaju 15 do 30 ciljanih raspona \`datoteka:linija\` umjesto cijelog repozitorija. Prvo izmjereno pokretanje, \`diff\` pregled prepisanog skilla na Fableu 5.2 od 16. studenoga 2026., potrošilo je 7 API poziva, najviše 102k tokena konteksta i 2,51 $, unutar pre-flight procjene od 1,50 do 3,50 $. U samom skillu našlo je jedan blokirajući propust i još 14 problema, a svi su ispravljeni idući dan. Troškovi za cijele repozitorije i za ostale modove i dalje su procjene.

## Zašto nije dovoljno da model pregleda vlastiti kod

Model koji pregledava vlastitu implementaciju provjerava invarijante kojih se sjetio dok je pisao kod. Dva javna repozitorija pokazuju što se promijeni kad zamrznuti commit samo za čitanje pregleda drugi model:

1. **Javno glasanje na Gnosis Chainu sa Semaphore ZK dokazima ([\`stepanic/stadion-maksimir-natjecaj-2026\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026)).** Opus 5.5 je 26. rujna 2026. izgradio off-chain i on-chain dio glasanja i napisao vlastiti sigurnosni audit u \`docs/blockchain/audit/\`. Fable 5.1 pregledao je zamrznuti commit \`faaaa5f\` samo za čitanje ([tag \`audit-fable-2026-09-26\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026/blob/main/docs/review/2026-09-26-neovisni-review-glasanje.md)). U Poseidon hashevima i provjeri SNARK dokaza, koje je Opus već auditirao, nije našao nijednu grešku, ali je u sustavu oko njih našao pet propusta koji su bili izvan Opusova modela prijetnji:
   - \`F-01\`: registracija identiteta i prvi glas u istom koraku povezivali su identitet glasača s listićem preko vremenske oznake korijena Merkleova stabla, protivno tvrdnji o privatnosti u NatSpecu ugovora.
   - \`F-02\`: edge funkcija \`maksimir_zk_share\` primala je upise bez autentikacije i bez provjere SNARK dokaza, pa se baza mogla proizvoljno puniti, a Open Graph kartice za dijeljenje krivotvoriti.
   - \`F-04\`: artefakti ZK sklopova dohvaćali su se s vanjskog CDN-a bez provjere SHA-256 sažetka.
   - \`F-05\`: satni GitHub Actions cron za checkpoint pod opterećenjem je preskakao pokretanja (provjereno naredbom \`gh run list --workflow maksimir-checkpoint.yml --json event,createdAt\`).
   - \`F-06\`: WebAuthn \`user.id\` izvodio se iz javnog commitmenta.
2. **Nekustodijalni platni sustav za EURe i Safe novčanik s passkeyjem ([\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai)).** Oba su modela 10. i 11. lipnja 2026. radila na istim datotekama, a autora svakog commita bilježio je \`Co-Authored-By\` trailer. Nad tom git poviješću nastala su dva forenzička izvještaja: [Fable 5 ocjenjuje sam sebe (\`557dfc9\`)](https://github.com/domovinatv/pay.domovina.ai/blob/main/docs/research/fable5-vs-opus48-side-by-side.md) i [slijepa protuanaliza Opusa 4.8 (\`8addcbf\`)](https://github.com/domovinatv/pay.domovina.ai/blob/main/docs/research/opus48-independent-forensic-fable5-vs-opus48.md). U \`wallet/src/pages/Embed.tsx\` ranjivost s lažnim \`parentOrigin\`, uvedena commitom \`f3399ed\`, prošla je kroz dva zasebna sigurnosna prolaza Opusa 4.8 nad tom datotekom, a Fable 5 našao ju je već u prvom prolazu (\`cdda3bc\`). U \`wallet/functions/api/relay.ts\`, endpointu koji pokreće novac, Opus 4.8 provjeravao je 2 od 10 polja (\`getCode\` prije slanja i \`to === safe\` na hladnoj grani), a Fable 5 dodao je 8 provjera: \`operation === 0\`, koja blokira \`delegatecall\`, popis dopuštenih selektora, format adrese primatelja, pozitivan iznos i gornje granice gasa. U suprotnom smjeru, slijepi prolaz Opusa 4.8 pokazao je da je Fable sam sebi dao 86 : 67 uz težine koje su ograničavanju štete (blast radius) dale samo 12 %. To je jedina dimenzija u kojoj je Opus bio bolji (82 : 68), jer je Fable u \`fceab4d\` isporučio neprovjeren poziv WebAuthn Signal API-ja koji je trebalo poništiti u \`6c83f51\`. Uz jednake težine svih devet dimenzija rezultat je 77 (Fable 5) prema 75 (Opus 4.8).

## Kronologija Fable pregleda na javnim repozitorijima

Od 28 Fable sesija izvučenih iz \`~/.claude/projects/**/*.jsonl\` njih 18 radilo je na javnim repozitorijima vlasnika \`domovinatv\` i \`stepanic\`. Ostalih 10 radilo je na privatnim ili klijentskim repozitorijima i izostavljeno je prema pravilima objave ovog repozitorija.

| Datum (CEST) | Javni repozitorij | Model | Mod | Zapisani dokumenti u repozitoriju |
|---|---|---|---|---|
| 10. 6. 2026. 00:22 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai) | Fable 5 | \`security\` + \`refactor\` | \`wallet/docs/{security-custody-model,relayer-architecture,relayer-threat-model,user-flows,passkey-onboarding-industry-standards,safe-client-compatibility}.md\` |
| 10. 6. 2026. 08:07 | [\`domovinatv/domovina.ai\`](https://github.com/domovinatv/domovina.ai) | Fable 5 | \`refactor\` | \`docs/backend-prompts/10-account-management.md\` |
| 10. 6. 2026. 23:35 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai) | Fable 5 | \`forensic\` | [\`docs/research/fable5-vs-opus48-side-by-side.md\`](https://github.com/domovinatv/pay.domovina.ai/blob/main/docs/research/fable5-vs-opus48-side-by-side.md) |
| 11. 6. 2026. 10:26 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai) | Opus 4.8 (slijepa provjera) | \`forensic\` | [\`docs/research/opus48-independent-forensic-fable5-vs-opus48.md\`](https://github.com/domovinatv/pay.domovina.ai/blob/main/docs/research/opus48-independent-forensic-fable5-vs-opus48.md) |
| 7. 7. 2026. 20:05 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai) | Fable 5 + Opus 4.8 | \`full\` | [\`docs/reviews/2026-07-fable5/\`](https://github.com/domovinatv/pay.domovina.ai/tree/main/docs/reviews/2026-07-fable5) (9 datoteka, 46 nalaza, plan F0–F3) |
| 10. 7. 2026. 21:58 | [\`domovinatv/domovina-api\`](https://github.com/domovinatv/domovina-api) | Fable 5 | \`full\` | \`docs/review-2026-07/{README,01-fixes-security-correctness,02-ops-hardening,03-consistency-refactor,04-docs-hygiene,05-roadmap-features}.md\` |
| 19. 7. 2026. 22:31 | [\`domovinatv/izbori.domovina.ai\`](https://github.com/domovinatv/izbori.domovina.ai) | Fable 5 | \`refactor\` | \`PLAN_POBOLJSANJA.md\`, \`PLAN_UI.md\`, \`docs/STANJE_I_NASTAVAK.md\` |
| 26. 9. 2026. 00:47 | [\`stepanic/stadion-maksimir-natjecaj-2026\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026) | Fable 5.1 | \`security\` | [\`docs/review/2026-09-26-neovisni-review-glasanje.md\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026/blob/main/docs/review/2026-09-26-neovisni-review-glasanje.md) (F-01…F-12, tag \`audit-fable-2026-09-26\`) |
| 26. 9. 2026. 01:39 | [\`stepanic/stadion-maksimir-natjecaj-2026\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026) | Fable 5.1 | \`diff\` | [\`docs/review/2026-09-26-neovisni-review-wiring.md\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026/blob/main/docs/review/2026-09-26-neovisni-review-wiring.md) (F-13…F-22, tagovi \`…-wiring\`, \`…-wiring-2\`) |
| 2. 10. 2026. 17:05 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai) | Fable 5.1 | \`full\` | [\`docs/reviews/2026-10-fable51/\`](https://github.com/domovinatv/pay.domovina.ai/tree/main/docs/reviews/2026-10-fable51) (5 datoteka, 35 nalaza + plan P0–P2 za Opus 5.5) |
| 2. 10. 2026. 17:08 | [\`domovinatv/energy.domovina.ai\`](https://github.com/domovinatv/energy.domovina.ai) | Fable 5.1 | \`refactor\` | [\`docs/refactor/00-pregled.md\`](https://github.com/domovinatv/energy.domovina.ai/blob/main/docs/refactor/00-pregled.md) … \`05-alati-testovi-docs.md\` (30 stavki u 6 valova) |
| 2. 10. 2026. 17:13 | [\`domovinatv/domovina-fiskal\`](https://github.com/domovinatv/domovina-fiskal) | Fable 5.1 | \`refactor\` + \`forensic\` | [\`docs/handoff/2026-10-02-pregled-koda-i-plan-refactora.md\`](https://github.com/domovinatv/domovina-fiskal/blob/main/docs/handoff/2026-10-02-pregled-koda-i-plan-refactora.md) (K1–K24 + plan u 9 koraka) |
| 9. 10. 2026. 22:47 | [\`stepanic/stadion-maksimir-natjecaj-2026\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026) | Fable 5.1 | \`diff\` | [\`2026-10-09-neovisni-review-tjedan-glasaj.md\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026/blob/main/docs/review/2026-10-09-neovisni-review-tjedan-glasaj.md) (F-23…F-37) + [\`2026-10-09-neovisni-review-opci-model-i-v2.md\`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026/blob/main/docs/review/2026-10-09-neovisni-review-opci-model-i-v2.md) (E-01…E-15), tag \`audit-fable-2026-10-09\` |
| 9. 10. 2026. 22:57 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai) | Fable 5.1 | \`diff\` | [\`docs/reviews/2026-10-fable51-r2/\`](https://github.com/domovinatv/pay.domovina.ai/tree/main/docs/reviews/2026-10-fable51-r2) (5 datoteka, 32 nalaza nad 40 Opus 5.5 commitova) |
| 16. 10. 2026. 22:06 | [\`domovinatv/pay.domovina.ai\`](https://github.com/domovinatv/pay.domovina.ai), [\`domovinatv/pipeline.domovina.ai\`](https://github.com/domovinatv/pipeline.domovina.ai), [\`domovinatv/omm.domovina.ai\`](https://github.com/domovinatv/omm.domovina.ai) | Fable 5.1 subagenti | \`security\` | \`docs/security/2026-10-16-security-audit-fable.md\` u sva tri repoa (uz [postmortem u \`stepanic/cv\`](https://github.com/stepanic/cv/blob/main/docs/2026-10-17-postmortem-fable-subagenti-tjedni-limit.md)) |

## Što su promptovi tražili

U listopadu 2026. prompt je postao petkova rutina prije subotnjeg resetiranja tjednog limita u 02:00 CEST. Četiri doslovna primjera od 2. i 9. listopada 2026., s tipfelerima kakvi su bili:

\`\`\`text
# pay.domovina.ai (2. 10. 2026. 17:05 CEST)
zelim da mi analziras sto je napravleno trenutno u codebaseu ti kao model Fable 5.1
mislim da ces pronaci stavri koje bi trebalo popraviti nemoj kodiratinego pisis
markdown dokumenete s uputama sto bi trebalo eventualnons prijedlogom implememtacije
a onda ce Opus 5.5 proci po tvojem review i raditi implememtaciju u skladu s naalziom

# energy.domovina.ai (2. 10. 2026. 17:08 CEST)
ovako mene ti zanima sljedece development je ovdje radjen sa Opus modelima zelim da
ti kao Fable 5.1 napravis analizu i ne radis refactor nego pises u codebase amrkdown
dokumente s prijedlozima za refactor na temlju tvoje analize se Opus modeli proci i
refactorati sve sto ima smisla

# domovina-fiskal (2. 10. 2026. 17:13 CEST)
ovako implemetaciju u ocom codebaseu je vecinom radio OPus model, daj pregledaj po
git history je li Fable 5.1 ili Fable 5 radio i daj napravi analizu postojece
implemmetacije i nemoj raditi modifikacije nego pisis markdown dokument s prijedlogom
implemetacije ponasaj se kao revieeer na temelju tvoje analize ce Opus 5.5. proci i
napraviti refactor ali zelim analizu tebe kao superornijeg modela

# stadion-maksimir-natjecaj-2026 (9. 10. 2026. 22:47 CEST)
ovaj tjedan smo radili neke izmjene sa opus 5.5 zelim da to sve pregledas nista
nemojnrefactorsti nego prodji kroz sve i napravi markdown dokumente koji su analiza
sa projedlozima poboljsanja osobito briga za edga caseove koje opus je preskocio ali
pisi prijedloge implementacije
\`\`\`

U \`domovina-fiskal\` Fable 5.1 najprije je premisu iz prompta provjerio u \`git log\` i opovrgnuo je: Fable 5 napisao je oko 6700 od otprilike 10.300 redaka u \`backend/\` (faze 0–3), a Opus 5.5 oko 2700 (faza 4 i testovi). Od 24 nalaza (\`K1\`–\`K24\`) šest se odnosilo na raniji kod samog Fablea 5 (\`K1\`, \`K3\`, \`K4\`, \`K13\`, \`K15\`, \`K16\`), a četiri na kod Opusa 5.5 (\`K7\`, \`K10\`, \`K11\`, \`K12\`). Za \`K1\` naredba \`git check-ignore\` dokazala je da pravilo \`*.pem\` u \`.gitignore\` ignorira i \`backend/src/fiskal/ca/*.pem\`, pa se svježi klon nije mogao ni izgraditi. Opus 5.5 izveo je korake 0–8 tog plana 12. i 13. studenoga 2026., povećao broj testova sa 49 na 222 i isporučio verziju 0.5.0 na produkciju.

## Zašto je pet Fable subagenata potrošilo 7 % tjednog limita za 14 minuta

U petak 16. listopada 2026. u 22:06 CEST glavna sesija na Opusu 5.5 (\`8d40f90b\`) stavila je u red 11 sigurnosnih audita na subagentima s \`model: "fable"\`, najviše tri istodobno. U 22:20 CEST peti je subagent odbijen s \`rateLimitType: "seven_day"\` (\`status: "rejected"\`). Kad se \`usage\` zapisi iz transkripata dedupliciraju po \`message.id\` i obračunaju po API cjeniku (Fable 5.1: 10 $/MTok ulaz, 12,50 $/MTok 5-minutni upis u cache, 0,25 $/MTok čitanje iz cachea, 50 $/MTok izlaz; Opus 5.5: 4 / 5 / 0,20 / 20 $; Sonnet 5.5: 2 / 2,50 / 0,20 / 10 $), dobije se:

| Subagent | Poziva | Max kontekst | Cache write | Cache read | Output (thinking) | Fable 5.1 $ | Isto na Opusu 5.5 | Isto na Sonnetu 5.5 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| \`pay.domovina.ai\` | 44 | 636k | 636.105 | 10.984.242 | 65.057 (31.370) | 13,96 $ | 6,68 $ | 4,44 $ |
| \`pipeline.domovina.ai\` | 30 | 289k | 270.718 | 4.580.598 | 52.400 (23.457) | 7,16 $ | 3,32 $ | 2,12 $ |
| \`omm.domovina.ai\` | 20 | 249k | 231.616 | 2.689.143 | 48.340 (19.679) | 5,99 $ | 2,67 $ | 1,60 $ |
| \`energy.domovina.ai\` *(prekinut na 429)* | 13 | 175k | 156.725 | 999.220 | 6.714 (1.209) | 2,55 $ | 1,12 $ | 0,66 $ |
| repo X *(izvan javne allow-liste, prekinut)* | 6 | 68k | 50.040 | 257.786 | 2.196 (588) | 0,80 $ | 0,35 $ | 0,20 $ |
| **Subagenti ukupno** | **113** | | **1.345.204** | **19.510.989** | **174.707** | **30,46 $** | **14,14 $** | **9,02 $** |

Trošak od 30,46 $ nastao je kroz tri mehanizma:
1. **Upis u cache bio je 55 % ukupnog troška (16,82 $).** Agent za \`pay.domovina.ai\` pokretao je \`for f in ...; do cat -n "$f"; done\` nad skupinama od 4 do 7 datoteka. Claude Code izlaze veće od 30 KB sprema u \`tool-results/*.txt\`, a agent ih je zatim čitao alatom \`Read\` (više od 25 čitanja po 5–15k tokena). U 22:14 ponovno je pročitao četiri spremljena izlaza od po 55 KB i isti kod drugi put platio po cijeni upisa u cache od 12,50 $/MTok.
2. **Kontekst od 600k tokena šalje se u svakom pozivu.** Kroz 44 poziva agent za \`pay.domovina.ai\` poslao je **11,6 milijuna ulaznih tokena**.
3. **Dijeljenje jedne Fable sesije na više sesija od 200k ne smanjuje API trošak.** Kad se točan niz poziva iz \`pay.domovina.ai\` ponovi s granicom konteksta od 200k, trošak raste s 13,95 $ (1 sesija) na 14,76 $ (5 sesija): čitanje iz cachea na Fableu stoji 0,25 $/MTok, a svaka nova sesija ponovno plaća upis osnovnog konteksta po 12,50 $/MTok. Ušteda dolazi tek kad se masovno čitanje datoteka makne iz Fableova konteksta.

## Kako radi \`/fable-review\`

Skill se pokreće samo kad sam utipkam \`/fable-review\`. U frontmatteru ima \`disable-model-invocation: true\`, pa Fable agenta ne može pokrenuti nijedan drugi skill, plan ni handoff. Jedno pokretanje pregledava jedan repozitorij u pet koraka:

1. **Deterministički pre-flight (\`scripts/preflight.sh\`).** Prije ijednog LLM poziva shell skripta radi nad bazom pregleda (\`origin/<default>\`): broji praćene tekstualne datoteke i retke naredbom \`git grep -I -c ''\`, prepoznaje tehnologije i naredbe za provjeru koje samo čitaju (\`tsc --noEmit\`, \`vitest\`, \`flutter analyze\`, \`cargo check\`, \`forge test\`), nalazi zadnji \`audit-*\` tag, zbraja \`Co-Authored-By\` trailere i ispisuje procjenu troška. Usto odlučuje kamo pregled ide. Iz URL-a remotea \`origin\` izdvaja host i vlasnika i par \`host/vlasnik\` doslovno uspoređuje s mojim popisom vlastitih računa: podudaranje daje \`COMMIT\`, sve ostalo \`LOCAL-ONLY\`, a repozitorij bez remotea \`ASK\`. Kod \`LOCAL-ONLY\` pregled se zapisuje u \`~/.claude/fable-review/reports/<vlasnik>-<repo>/\` i ništa se ne commita, ne tagira i ne pusha. Na neispravne argumente skripta staje s izlaznim kodom 2.
2. **Izdvojeni git worktree.** Paralelne sesije često dijele isto radno stablo, pa pregled radi u worktreeju pod \`~/.claude/fable-review/worktrees/\`, na imenovanoj grani za \`COMMIT\` i odvojen od grane (detached) za \`LOCAL-ONLY\`.
3. **Prolaz A: mapa i provjere.** Sonnet 5.5 (\`effort: "medium"\`) pokreće provjere koje samo čitaju, čita \`CLAUDE.md\`, \`README.md\` i sažetke ADR-ova, popisuje namjerne invarijante koje se ne smiju prijaviti kao greške i zapisuje \`00-map.md\` s 15 do 30 žarišta \`putanja:linija\` poredanih po riziku. Kad repozitorij, ili u \`diff\` modu sam diff, ima manje od oko 5000 redaka, mapu piše sama glavna sesija. Za tuđi repozitorij pokreću se samo statičke provjere, osim ako dopustim i testove, jer testovi na mom računalu izvršavaju kod tog repozitorija.
4. **Prolaz B: ciljana Fable provjera.** Jedan Fable agent (\`effort: "medium"\`, osim ako izričito zadam drugu razinu) dobiva mapu i oko svakog žarišta čita odsječke od 150 do 200 redaka naredbom \`sed -n 'A,Bp'\`. Tvrdnje iz dokumentacije provjerava u kodu, svaki nalaz zapisuje na disk čim ga potvrdi, a sumnje koje ne može dokazati stavlja pod „Za provjeru”. Svaki dokument ima odjeljak „Što je dobro”, koji Opus u izvedbi ne smije dirati, i plan po fazama. Odmah nakon što se agent vrati, \`scripts/salvage.py\` sve što se iz njegova transkripta može spasiti zapisuje u jednu lokalnu Markdown datoteku: sav tekst, cijeli sadržaj svakog Write i Edit poziva, potrošnju po pozivu, trošak u dolarima i podatak je li agent završio. Claude Code thinking blokove sprema prazne, pa se thinking ne može spasiti; skripta ispisuje koliko je tokena to bilo.
5. **Završetak i handoff.** Kod \`COMMIT\` grana pregleda pusha se na glavnu granu samo ako se od nje razlikuje isključivo u dokumentima pregleda. \`diff\` pregled nepushane feature grane tu provjeru ne prolazi, pa se pusha samo grana pregleda i kod koji se pregledava ne završi na produkciji usput. Pushani commit dobiva annotated tag \`audit-fable-GGGG-MM-DD-<mod>\`, koji je baza idućeg \`diff\` pregleda. Gotov prompt za novu Opus sesiju ide u \`~/.claude/handoffs/<repo>/\` i u clipboard.

| Mod | Opseg | Procijenjeni trošak (Prolaz A + B) |
|---|---|---|
| \`diff\` | Commitovi od zadnjeg \`audit-*\` taga ili od \`--base <ref>\` | 2–5 $ (jednom izmjereno: 2,51 $) |
| \`refactor\` | Granice modula, dupliciranje, prevelike datoteke, plan refactora u valovima | 4–7 $ |
| \`security\` | Model prijetnji, ulazne točke, tokovi novca, autentikacije i tajni, popis \`- [ ] SEC-xx\` | 4–7 $ |
| \`full\` | Pregled po podsustavima s matricom pokrivenosti u \`INDEX.md\` i \`implementation-plan.md\` | 8–15 $ |
| \`forensic\` | Autorstvo po \`Co-Authored-By\`, diffovi zajedničkih datoteka, bodovanje 0–100 | 3–5 $ |

Osim jednog mjerenja za \`diff\`, brojke su izvedene iz cijena Fablea 5.1 i transkripata od 16. listopada.

## Prvo izmjereno pokretanje: skill je pregledao vlastiti kod

Dana 16. studenoga 2026. oko 23:00 CET naredba \`/fable-review ~/git/stepanic/cv --mode diff --base 229618f\` pregledala je dva commita kojima je skill bio prepisan: 14 datoteka, +656/−492, ukupno 1148 promijenjenih redaka. Prolaz A napravila je sama glavna sesija na Opusu 5.5, jer je diff bio manji od 5000 redaka. Prolaz B radio je na Fableu 5.2 (\`claude-fable-5-2\`) s effortom \`low\`, koji sam odabrao za prvo pokretanje.

| Prolaz B | Pre-flight procjena | Izmjereno |
|---|---:|---:|
| API poziva | 10–18 | 7 |
| Najveći kontekst | ispod 150k | 102k |
| Upis u cache / čitanje iz cachea | | 102.423 / 434.637 |
| Izlaz (od toga thinking) | | 22.358 (9.145) |
| Trošak po API cjeniku | 1,50–3,50 $ | 2,51 $ |
| Trajanje | | oko 4 min |

Pokretanje je potrošilo oko 1 % tjednog Fable limita. Pregled ([\`docs/reviews/2026-11-16-fable-diff-fable-review-skill.md\`](https://github.com/stepanic/cv/blob/main/docs/reviews/2026-11-16-fable-diff-fable-review-skill.md), tag \`audit-fable-2026-11-16-diff\`) ima 1 🔴, 6 🟡 i 8 🟢 nalaza:

- \`F-01\` 🔴: na opisanom putu za pregled nepushane feature grane završni bi korak zajedno s pregledom pushao na \`main\` i nepregledane commitove te grane.
- \`F-02\` 🟡, dokazano na probnim repozitorijima: provjera odredišta zanemarivala je host, a vlasnika uspoređivala kao regularni izraz, pa se \`https://gitlab.example.com/stepanic/x.git\` računao kao moj repozitorij i pregled klijentskog koda bio bi commitan i pushan u klijentov repozitorij.
- \`F-03\` 🟡, dokazano: \`preflight.sh <repo> --base\` bez vrijednosti vrtio se u beskonačnoj petlji.
- \`F-07\` 🟡: \`salvage.py\` je ispisivao tokene, ali ne i trošak, pa je redak „stvarni naspram procijenjenog troška” bio računica same glavne sesije.
- \`F-04\` 🟡 bio je djelomično pogrešan. Fable je iz uzorka \`.meta.json\` zaključio da Claude Code subagenta nikad ne označava završenim, ali taj je uzorak bio od agenta koji nije završio, a meta datoteka samog Prolaza B sadržavala je \`"finished": true\`. Ispravak je glavna sesija upisala u dokument.

Sesija na Opusu 5.5 ispravila je svih 15 nalaza 17. studenoga 2026. u commitu [\`36a8cf9\`](https://github.com/stepanic/cv/commit/36a8cf9). Za svaki je provjeru iz dokumenta pokrenula prije ispravka, kad je padala, i nakon njega, a u isti je dokument dodala tablicu statusa. \`salvage.py\` za ovo pokretanje sada ispisuje \`cost_usd=2.51\`, isto kao u tablici gore.

## Ograničenja

- **Izmjereno je samo jedno pokretanje.** Tablica gore jedan je \`diff\` pregled od 1148 promijenjenih redaka s effortom \`low\`. Pokretanja s \`medium\`, nad cijelim repozitorijima i u ostalim modovima još nisu izmjerena, pa su te brojke i dalje procjene.
- **Težine u pretplatničkim limitima izvedene su, Anthropic ih ne objavljuje.** Omjer 45 : 7 između 5-satnog prozora (0 % → 55 %) i tjednog prozora (93 % → 100 %) potječe iz jednog prozora od 32,30 $ 16. listopada 2026., uspoređenog s prozorom od 369 $ rada na Opusu 5.5 30. rujna 2026. Iz dviju točaka ne može se zaključiti broje li pretplatnički limiti čitanje iz cachea drukčije od API cjenika.
- **Mapiranje u dva prolaza žrtvuje dio pokrivenosti za ograničen kontekst.** Prolaz B čita samo raspone \`datoteka:linija\` iz \`00-map.md\` i kod do kojeg iz njih vodi trag. Greška u datoteci koju mapa nije obuhvatila, a do koje ne vodi trag ni iz jedne navedene ulazne točke, može ostati neotkrivena ako se ne pokrene \`full\` mod.
- **Pregled koda koji samo čita ne vidi živu konfiguraciju.** Cloudflare WAF pravila, postavke Supabase GoTruea (npr. \`mailer_autoconfirm\` u nalazu \`K5\` za \`domovina-fiskal\`) i stanje produkcijske baze nisu u git stablu, pa ostaju pod „Za provjeru” dok ih netko ne provjeri na živoj infrastrukturi.
- **Deset od 28 sesija nije u javnoj tablici.** Radile su na privatnim ili klijentskim repozitorijima. Skill je oblikovan na temelju svih 28 sesija, a svi primjeri i commit hashevi navedeni ovdje potječu iz 18 javnih.

## Izvor

Skill na engleskom i hrvatskom, skripte \`preflight.sh\` i \`salvage.py\`, predlošci i dokumentacija: [github.com/stepanic/cv/tree/main/skills/fable-review](https://github.com/stepanic/cv/tree/main/skills/fable-review). MIT.`,
    },
    sources: [
      {
        title: "The skill itself: SKILL.md, SKILL.hr.md, preflight.sh, salvage.py, templates and README",
        url: "https://github.com/stepanic/cv/tree/main/skills/fable-review",
      },
      {
        title: "First measured run (2026-11-16): Fable 5.2 diff review of the skill, with the status of all 15 fixes",
        url: "https://github.com/stepanic/cv/blob/main/docs/reviews/2026-11-16-fable-diff-fable-review-skill.md",
      },
      {
        title: "Postmortem (2026-10-17) — five Fable 5.1 subagents and the weekly subscription limit",
        url: "https://github.com/stepanic/cv/blob/main/docs/2026-10-17-postmortem-fable-subagenti-tjedni-limit.md",
      },
      {
        title: "pay.domovina.ai — Fable 5 vs Opus 4.8 forensic git history reports and codebase reviews",
        url: "https://github.com/domovinatv/pay.domovina.ai/tree/main/docs/reviews",
      },
      {
        title: "stadion-maksimir-natjecaj-2026 — tagged independent Fable 5.1 security reviews (docs/review/)",
        url: "https://github.com/stepanic/stadion-maksimir-natjecaj-2026/tree/main/docs/review",
      },
    ],
  },
  {
    slug: "gis-domovina-pages-to-workers",
    date: "2026-10-30",
    tags: ["Cloudflare", "Workers", "Pages", "React", "SEO"],
    title: {
      en: "Moving gis.domovina.ai from Cloudflare Pages to Workers without moving the domain",
      hr: "Prijelaz gis.domovina.ai s Cloudflare Pagesa na Workers bez premještanja domene",
    },
    lead: {
      en: "The map now runs on a Worker with static assets. A Worker route in front of the Pages custom domain made the switch without downtime, the same worker file runs on both platforms, and three behavioural differences were handled in it. Crawler-readable content went into the same worker instead of an Astro rewrite.",
      hr: "Karta sada radi na Workeru sa static assets. Worker route ispred Pages custom domene omogućio je prijelaz bez prekida, ista datoteka workera radi na obje platforme, a u njoj su riješene tri razlike u ponašanju. Sadržaj čitljiv crawlerima otišao je u isti worker umjesto prepisivanja u Astro.",
    },
    body: {
      en: `On 30 October 2026 gis.domovina.ai moved from Cloudflare Pages to a Worker with static assets. The domain was not moved: a Worker route on the zone takes the traffic before it reaches the Pages custom domain, so the switch had no downtime and rollback is one deleted line and a redeploy. The worker file is the same on both platforms. Three behavioural differences between Pages and Workers showed up, all handled in that file. In the same change the worker started writing readable content into the page for crawlers that do not run JavaScript, which was the only real argument for rewriting the site in Astro.

## The site

[gis.domovina.ai](https://gis.domovina.ai) is an interactive map of Croatia: counties, 556 cities and municipalities, 6,759 settlements, football clubs and open-data layers.

| part | what it is |
|---|---|
| frontend | React 18, Vite 5, MapLibre GL 4, Tailwind; about 11,300 lines of TS/TSX |
| build | 969 static files, 81 MB; the largest is \`naselja.geojson\` at 21.9 MB |
| edge code | one \`_worker.js\`, 199 lines before this change, 326 after |
| data | GeoJSON produced by a Python pipeline in the same monorepo |

On Pages the worker ran in Advanced Mode and handled every request: SPA fallback, Open Graph tags per entity route via \`HTMLRewriter\`, and Cache-Control headers, because \`_headers\` is not applied while a worker handles the request.

## Why the stack stayed React, not Astro

| | React SPA (kept) | Astro |
|---|---|---|
| the map | the whole app | one \`client:only\` React island; no gain |
| navigation between routes | map stays mounted | full page load unless View Transitions with \`transition:persist\` |
| Open Graph tags | already injected by the worker | built in |
| readable HTML for crawlers without JS | missing | built in |
| PWA, URL state, Playwright suite | working | to be rebuilt |

The only row where Astro wins outright is readable HTML. The worker already parses the same lookup files it needs for that, so the content was added there instead of rewriting about 11,300 lines.

## Content in #root for crawlers

On \`/\`, \`/klub/:slug\`, \`/jls/:slug\`, \`/zupanija/:slug\` and \`/poster/:slug\` the worker writes a heading, a description and links into the empty \`<div id="root">\`:

\`\`\`js
new HTMLRewriter()
  .on("head", new OgInjector(meta, canonical))
  .on("div#root", { element: (el) => el.setInnerContent(bodyHtml, { html: true }) })
  .transform(indexRes);
\`\`\`

React 18 \`createRoot\` clears the container on its first commit, so a browser shows the map and a crawler gets text. The links form a graph: a county lists all of its cities and municipalities (54 for Split-Dalmatia), a municipality links to its county, a club to its stadium and its municipality, and the home page to all 21 counties and 18 posters. A club gets the municipality link only when its \`city\` field is itself a municipality, which holds for 437 of 1,014 clubs; the rest are in settlements.

A Playwright script checked four routes on the local worker, on workers.dev and on production: the injected \`<main>\` is gone after load, the map canvas is present and the console has no errors.

## One worker file, two runtimes

\`\`\`toml
name = "gis-domovina"
main = "public/_worker.js"
compatibility_date = "2025-10-01"
routes = [{ pattern = "gis.domovina.ai/*", zone_name = "domovina.ai" }]

[assets]
directory = "./dist"
binding = "ASSETS"
run_worker_first = true
not_found_handling = "single-page-application"
\`\`\`

Vite copies \`public/_worker.js\` into \`dist/\`, where Pages runs it. Wrangler bundles the same file as \`main\`. \`public/.assetsignore\` keeps it out of the public assets on Workers; without it the worker source would be downloadable. \`run_worker_first\` reproduces Advanced Mode, where the worker sees every request. \`wrangler pages deploy\` ran without error with this Workers config in place, so both targets deploy from the same directory, selected by \`DEPLOY_TARGET\` in \`scripts/deploy.sh\`.

## Cutover with a route instead of a domain move

Moving the custom domain from Pages to the Worker means removing it from Pages and attaching it to the Worker, which leaves a gap and needs DNS write access. The OAuth token from \`wrangler login\` has \`zone (read)\` only. A Worker route on a proxied hostname runs before the request reaches the Pages origin behind it, so the route was added and the Pages domain left in place.

The worker sets \`X-Runtime: worker\` from a \`[vars]\` entry that exists only in \`wrangler.toml\`, which shows which platform answered:

\`\`\`bash
curl -sI https://gis.domovina.ai/ | grep -i x-runtime   # x-runtime: worker
\`\`\`

Rollback: remove \`routes\` and run \`npx wrangler deploy\`. Pages serves the domain again with its last deployment.

## Differences between Pages and Workers

| | Pages | Workers static assets | handled by |
|---|---|---|---|
| \`GET /index.html\` | 308 to \`/\` (measured) | 307 to \`/\` (per \`html_handling\` docs) | worker returns the bare shell with 200 |
| \`Access-Control-Allow-Origin: *\` on assets | added by the platform | not added | worker sets it |
| \`_worker.js\` in the asset directory | executed, never served | would be a public file | \`.assetsignore\` |
| \`/sw.js\` Cache-Control on the domain | \`max-age=14400\`, noted in August 2026 | \`no-cache, must-revalidate\`, as the worker sets it | nothing; the override is gone |

The \`/index.html\` row was wrong on Pages as well. vite-plugin-pwa precaches \`/index.html\` as the \`navigateFallback\` shell, and the request returned a redirect instead of the document. The worker now answers that path with the bare shell, without the home-page content, so the service worker does not show home-page text on other routes.

The CORS header has no known consumer. A search of the sibling repositories found nothing that fetches \`gis.domovina.ai/data\` from another origin. It is set to keep behaviour identical.

## Limitations

- No latency or time-to-first-byte measurement was taken before or after the move.
- The crawler content is unmeasured. There is no data yet on whether search or AI crawlers index the entity pages differently.
- On a slow connection the injected text can be visible before the JavaScript bundle runs. The duration was not measured.
- The Pages custom domain is still attached. If the route is removed by mistake, Pages serves the domain silently, and a \`DEPLOY_TARGET=pages\` deploy is not visible while the route exists.
- Whether Workbox stored the old redirect response correctly was not tested before the change.
- The cause of the 14,400 s override on Pages was not identified. It disappeared with the move.
- Pricing and request quotas of the two products were not compared for this traffic.

## Next steps

After a week or two without problems: detach the domain from Pages, replace the route with \`{ pattern = "gis.domovina.ai", custom_domain = true }\`, and remove \`X-Runtime\` and the \`RUNTIME\` variable.`,
      hr: `gis.domovina.ai je 30. listopada 2026. prešao s Cloudflare Pagesa na Worker sa static assets. Domena se pritom nije premještala. Worker route na zoni preuzima promet prije nego što stigne do Pages custom domene, pa prijelaz nije imao prekida, a povratak je jedan obrisani redak i ponovni deploy. Datoteka workera ista je na obje platforme. Pokazale su se tri razlike u ponašanju između Pagesa i Workersa i sve su riješene u toj datoteci. U istoj promjeni worker je počeo upisivati čitljiv sadržaj u stranicu za crawlere koji ne izvršavaju JavaScript. To je bio jedini stvarni argument za prepisivanje stranice u Astro.

## Stranica

[gis.domovina.ai](https://gis.domovina.ai) je interaktivna karta Hrvatske: županije, 556 gradova i općina, 6759 naselja, nogometni klubovi i slojevi otvorenih podataka.

| dio | što je |
|---|---|
| frontend | React 18, Vite 5, MapLibre GL 4, Tailwind; oko 11 300 redaka TS/TSX-a |
| build | 969 statičkih datoteka, 81 MB; najveća je \`naselja.geojson\` s 21,9 MB |
| kod na rubu mreže | jedan \`_worker.js\`, 199 redaka prije promjene, 326 poslije |
| podaci | GeoJSON iz Python pipelinea u istom monorepou |

Na Pagesu je worker radio u Advanced Modeu i obrađivao svaki zahtjev: SPA fallback, Open Graph tagove po ruti entiteta preko \`HTMLRewriter\`a i Cache-Control headere, jer se \`_headers\` ne primjenjuje dok zahtjev obrađuje worker.

## Zašto je ostao React, a ne Astro

| | React SPA (zadržan) | Astro |
|---|---|---|
| karta | cijela aplikacija | jedan \`client:only\` React otok, bez dobitka |
| navigacija između ruta | karta ostaje montirana | puno učitavanje stranice, osim uz View Transitions i \`transition:persist\` |
| Open Graph tagovi | worker ih već ubacuje | ugrađeno |
| čitljiv HTML za crawlere bez JS-a | nema ga | ugrađeno |
| PWA, stanje u URL-u, Playwright testovi | rade | treba ih složiti ponovno |

Astro jasno pobjeđuje samo u retku s čitljivim HTML-om. Worker već čita iste lookup datoteke koje za to trebaju, pa je sadržaj dodan ondje, umjesto da se prepiše oko 11 300 redaka.

## Sadržaj u #root za crawlere

Na \`/\`, \`/klub/:slug\`, \`/jls/:slug\`, \`/zupanija/:slug\` i \`/poster/:slug\` worker u prazni \`<div id="root">\` upisuje naslov, opis i poveznice:

\`\`\`js
new HTMLRewriter()
  .on("head", new OgInjector(meta, canonical))
  .on("div#root", { element: (el) => el.setInnerContent(bodyHtml, { html: true }) })
  .transform(indexRes);
\`\`\`

React 18 \`createRoot\` prazni kontejner pri prvom commitu, pa preglednik prikaže kartu, a crawler dobije tekst. Poveznice čine graf: županija navodi sve svoje gradove i općine (Splitsko-dalmatinska ih ima 54), JLS vodi na svoju županiju, klub na stadion i svoj JLS, a početna na svih 21 županiju i 18 plakata. Klub dobiva poveznicu na JLS samo kad je njegovo polje \`city\` ujedno JLS. To vrijedi za 437 od 1014 klubova; ostali su u naseljima.

Playwright skripta provjerila je četiri rute na lokalnom workeru, na workers.dev i na produkciji: ubačeni \`<main>\` nakon učitavanja nestane, canvas karte postoji, a u konzoli nema grešaka.

## Jedna datoteka workera, dva runtimea

\`\`\`toml
name = "gis-domovina"
main = "public/_worker.js"
compatibility_date = "2025-10-01"
routes = [{ pattern = "gis.domovina.ai/*", zone_name = "domovina.ai" }]

[assets]
directory = "./dist"
binding = "ASSETS"
run_worker_first = true
not_found_handling = "single-page-application"
\`\`\`

Vite kopira \`public/_worker.js\` u \`dist/\`, gdje ga pokreće Pages. Wrangler istu datoteku bundla kao \`main\`. \`public/.assetsignore\` je na Workersu drži izvan javnih asseta; bez njega bi se izvorni kod workera mogao preuzeti. \`run_worker_first\` reproducira Advanced Mode, u kojem worker vidi svaki zahtjev. \`wrangler pages deploy\` prošao je bez greške uz ovaj Workers config, pa oba cilja deployaju iz istog direktorija, a bira se varijablom \`DEPLOY_TARGET\` u \`scripts/deploy.sh\`.

## Prijelaz routeom umjesto premještanja domene

Premještanje custom domene s Pagesa na Worker znači maknuti je s Pagesa i spojiti na Worker. Između toga stranica ne radi, a za sam korak treba pravo pisanja u DNS. OAuth token iz \`wrangler login\` ima samo \`zone (read)\`. Worker route na proxiranom hostnameu izvršava se prije nego što zahtjev stigne do Pages origina iza njega, pa je dodan route, a Pages domena je ostala gdje jest.

Worker postavlja \`X-Runtime: worker\` iz unosa u \`[vars]\` koji postoji samo u \`wrangler.toml\`. Po tome se vidi koja je platforma odgovorila:

\`\`\`bash
curl -sI https://gis.domovina.ai/ | grep -i x-runtime   # x-runtime: worker
\`\`\`

Povratak: maknuti \`routes\` i pokrenuti \`npx wrangler deploy\`. Pages tada opet poslužuje domenu sa svojim zadnjim deployem.

## Razlike između Pagesa i Workersa

| | Pages | Workers static assets | rješava |
|---|---|---|---|
| \`GET /index.html\` | 308 na \`/\` (izmjereno) | 307 na \`/\` (prema dokumentaciji za \`html_handling\`) | worker vraća čisti shell s 200 |
| \`Access-Control-Allow-Origin: *\` na assetima | dodaje platforma | ne dodaje | postavlja worker |
| \`_worker.js\` u direktoriju asseta | izvršava se, nikad se ne poslužuje | bio bi javna datoteka | \`.assetsignore\` |
| Cache-Control za \`/sw.js\` na domeni | \`max-age=14400\`, zabilježeno u kolovozu 2026. | \`no-cache, must-revalidate\`, kako ga worker postavlja | ništa; prepisivanja više nema |

Redak za \`/index.html\` bio je pogrešan i na Pagesu. vite-plugin-pwa precachira \`/index.html\` kao shell za \`navigateFallback\`, a zahtjev je vraćao redirect umjesto dokumenta. Worker sada na tu putanju vraća čisti shell, bez sadržaja početne stranice, pa service worker na drugim rutama ne prikazuje tekst početne.

CORS header nema poznatog korisnika. Pretraga sestrinskih repozitorija nije našla ništa što dohvaća \`gis.domovina.ai/data\` s drugog origina. Postavljen je da ponašanje ostane jednako.

## Ograničenja

- Latencija i vrijeme do prvog bajta nisu mjereni ni prije ni poslije prijelaza.
- Učinak sadržaja za crawlere nije izmjeren. Još nema podataka indeksiraju li tražilice i AI crawleri stranice entiteta drukčije.
- Na sporoj vezi ubačeni tekst može biti vidljiv prije nego što se izvrši JavaScript bundle. Koliko dugo, nije mjereno.
- Pages custom domena i dalje je spojena. Ako se route greškom makne, Pages bez upozorenja preuzima domenu, a deploy s \`DEPLOY_TARGET=pages\` ne vidi se dok route postoji.
- Prije promjene nije provjereno je li Workbox stari redirect spremio ispravno.
- Uzrok prepisivanja na 14 400 s na Pagesu nije utvrđen. Nestao je s prijelazom.
- Cijene i kvote zahtjeva dvaju proizvoda nisu uspoređene za ovaj promet.

## Sljedeći koraci

Nakon tjedan-dva bez problema: odspojiti domenu s Pagesa, zamijeniti route s \`{ pattern = "gis.domovina.ai", custom_domain = true }\` te maknuti \`X-Runtime\` i varijablu \`RUNTIME\`.`,
    },
    sources: [
      {
        title: "Migration notes in the repo — differences, rollback, open items",
        url: "https://github.com/domovinatv/karta-hrvatske/blob/main/apps/karta-web/docs/2026-10-30-pages-u-workers.md",
      },
      {
        title: "The worker — public/_worker.js",
        url: "https://github.com/domovinatv/karta-hrvatske/blob/main/apps/karta-web/public/_worker.js",
      },
      {
        title: "Commit 1839035 — crawler content in #root and the Workers config",
        url: "https://github.com/domovinatv/karta-hrvatske/commit/1839035",
      },
      {
        title: "Commit 22ca824 — route in front of Pages",
        url: "https://github.com/domovinatv/karta-hrvatske/commit/22ca824",
      },
      {
        title: "Cloudflare — Migrate from Pages to Workers",
        url: "https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/",
      },
      {
        title: "Cloudflare — Static assets HTML handling (index.html redirects)",
        url: "https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/",
      },
      {
        title: "Cloudflare — Workers routes",
        url: "https://developers.cloudflare.com/workers/configuration/routing/routes/",
      },
    ],
  },
  {
    slug: "two-registers-and-the-limitations-one-dropped",
    date: "2026-08-27",
    tags: ["Claude Code", "Skills", "Writing", "AI-native", "Open source"],
    title: {
      en: "I had the same post written in two registers. The theatrical one dropped all three limitations.",
      hr: "Dao sam isti tekst napisati u dva registra. Teatralni je ispustio sva tri ograničenja.",
    },
    lead: {
      en: "LLM prose defaults to a three-act arc: setup, complication, reveal, lesson. I wanted the option turned off by default, so I built a skill for it. The measurement that justified the default came from writing one technical article twice.",
      hr: "Tekst iz jezičnog modela zadano pada u dramaturški luk: uvod, zaplet, obrat, pouka. Htio sam to isključiti kao zadano, pa sam napravio skill. Mjerenje koje opravdava tu zadanu postavku došlo je iz jednog članka napisanog dvaput.",
    },
    body: {
      en: `I published a Claude Code skill that makes the engineering register the default for anything written for a human audience, and puts the theatrical register behind an explicit request. The evidence for making that the default, rather than a preference I state each time: the same technical article written twice, once in each register, from one set of measurements. The theatrical version dropped all three limitations the engineering version carried, and I did not notice until I counted.

## The tell

Setup, complication, reveal, lesson. Model-written prose falls into that shape by default, and it is recognisable at a glance, which is reason enough to avoid it when publishing under my own name. But the specific cost in a technical write-up is structural rather than stylistic: an arc puts the conclusion at the bottom, because a conclusion stated early ruins the build. A reader who scans the headings of an arc gets narrative positions, not findings.

## The comparison

Both versions describe the same investigation: whether Anthropic's lease of xAI's Colossus 1 shows up in my own Claude Code telemetry. Same data, same tables, same conclusion. Both are published, so the comparison can be read rather than taken on trust — the [engineering version](/blog/colossus-lease-in-my-own-usage-data) and the [theatrical one](/blog/colossus-lease-theatrical-version), the latter unedited apart from a framing note that is excluded from the counts below. English versions, measured on 27 August 2026:

| | theatrical | engineering |
|---|---|---|
| words | 498 | 789 |
| sentences | 43 | 34 |
| average sentence | 12 words | 23 words |
| headings | 0 | 9 |
| limitations stated | 0 of 3 | 3 of 3 |

Two of these surprised me.

The theatrical version is **shorter**, not longer, and its sentences are half the length. Punchiness is the mechanism of the arc, not padding. Some of the word gap is structural rather than rhetorical — the engineering version carries tables and two sections the theatrical one folds into prose — but the sentence length difference is the register itself.

The limitations row is the one that settled it. The engineering version lists three: that coverage before 12 May 2026 is reconstructed and the April baseline is therefore unreliable in both directions; that session counts are not comparable across the series (May shows 170, June 2,016); and that overload errors rise with my own concurrency, not only with service load. The theatrical version contains none of them, and has no section where they would go. Nothing was falsified. The facts that made the finding weaker simply had nowhere to sit in a structure built to land an ending.

## What the skill says

Engineering register, the default: conclusion in the first paragraph; headings that name content rather than narrative position; declarative sentences; every number with a unit, a date and a way to re-derive it; a mandatory limitations section wherever measurements are reported; the ending is open questions, never a moral. It also bans a short list of openers — *it turns out*, *here's the thing*, *and that's when I realised* — because each exists only to manufacture a beat.

Theatrical register, on request: arc, ordered reveals, metaphor, a closing line built to land. One rule makes it safe to use at all: **tension may come only from the order in which true things are told, never from what is left out.** The limitations section survives into it intact, even where it deflates the ending. Had that rule existed when the theatrical version above was written, the row that reads 0 of 3 would read 3 of 3.

## A skill cannot hold a default

This is the part worth copying regardless of what you think about registers. A skill loads when it is triggered. A default that only exists inside a skill is not a default, because the situation where it matters most is the one where nothing triggered it.

So the enforcing line lives in \`CLAUDE.md\`, which is read every session, and the skill holds the detail:

> **Prose register.** Anything written for a human audience uses the engineering register by default: conclusion first, headings that name content, no narrative arc, no withheld facts, limitations stated outright. The theatrical register is used only when asked for in that session.

The same split applies to any behaviour you want on by default: the trigger phrases and the long form go in the skill, the one-line invariant goes where it is always loaded.

## Bilingual texts are written twice, not translated

Every post here ships in English and Croatian. The rule in the skill is that each language is written natively from the same facts, matching in numbers, claims and section order, and differing freely in sentence construction. A near-literal translation is detectable in exactly the way a narrative arc is, and fails the same test: it reads as generated rather than written.

## Limitations

- **n = 1.** One article, one author, one pair of versions. Nothing here shows that readers prefer the engineering register, only that one theatrical rendering lost information that the engineering one kept.
- **The author of both versions later wrote the rule.** The theatrical version was not produced by someone trying to obey a limitations requirement and failing; the requirement did not exist yet. That is weaker evidence than a controlled comparison, and it is the honest description of what happened.
- **One metric was rejected.** I counted single-sentence paragraphs expecting the theatrical version to be full of them. It has none, and the engineering version has five. The rule bans a single-sentence paragraph used as a drum beat, and the count cannot tell that apart from a short factual statement under a heading, so it measures nothing useful.
- Word and sentence counts come from a script over the two texts and are sensitive to how tables and lists are excluded. The relative difference is robust; the absolute figures are not precise.

## Source

The skill, in English and in the Croatian original, plus the README: [github.com/stepanic/cv/tree/main/skills/register](https://github.com/stepanic/cv/tree/main/skills/register). MIT. Install it user-level and it applies in every project:

\`\`\`bash
mkdir -p ~/.claude/skills/register
cp skills/register/SKILL.md ~/.claude/skills/register/SKILL.md
\`\`\`

Both versions of the article, in both languages, with the measurements and the commands that reproduce them: [docs/2026-08-27-colossus-hipoteza-dvije-verzije.md](https://github.com/stepanic/cv/blob/main/docs/2026-08-27-colossus-hipoteza-dvije-verzije.md).`,
      hr: `Objavio sam Claude Code skill koji za sve što se piše za ljudsku publiku propisuje inženjerski registar kao zadani, a teatralni stavlja iza izričitog zahtjeva. Dokaz da to treba biti zadana postavka, a ne želja koju izgovaram svaki put: isti tehnički članak napisan dvaput, po jednom u svakom registru, iz istog skupa mjerenja. Teatralna je verzija ispustila sva tri ograničenja koja inženjerska nosi, a primijetio sam tek kad sam ih prebrojao.

## Prepoznatljiv obrazac

Uvod, zaplet, obrat, pouka. Tekst iz jezičnog modela zadano poprima taj oblik i prepoznaje se na prvi pogled, što je samo po sebi dovoljan razlog da ga izbjegavam u onome što objavljujem pod svojim imenom. Ali u tehničkom tekstu šteta nije stilska nego strukturna: luk gura zaključak na dno, jer rano izrečen zaključak kvari gradnju. Tko preleti međunaslove takva teksta, dobije mjesta u priči, a ne nalaze.

## Usporedba

Obje verzije opisuju isto istraživanje, dakle pitanje vidi li se Anthropicov zakup xAI-jeva Colossusa 1 u mojoj telemetriji Claude Codea. Isti podaci, iste tablice, isti zaključak. Obje su objavljene, pa se usporedba može pročitati umjesto da se uzme na riječ: [inženjerska](/blog/colossus-lease-in-my-own-usage-data) i [teatralna](/blog/colossus-lease-theatrical-version), pri čemu je druga neizmijenjena osim uokvirujuće napomene koja se ne broji u donjim brojkama. Mjereno nad engleskim verzijama 27. kolovoza 2026.:

| | teatralna | inženjerska |
|---|---|---|
| riječi | 498 | 789 |
| rečenica | 43 | 34 |
| prosječna rečenica | 12 riječi | 23 riječi |
| međunaslova | 0 | 9 |
| navedenih ograničenja | 0 od 3 | 3 od 3 |

Dvoje me iznenadilo.

Teatralna je verzija **kraća**, ne duža, a rečenice su joj upola kratke. Sažetost je sredstvo dramaturškog luka, a ne njegov višak. Dio razlike u broju riječi je strukturan, ne retorički, jer inženjerska verzija nosi tablice i dva odjeljka koje teatralna sažima u tekst, ali razlika u duljini rečenice dolazi iz samog registra.

Presudio je redak s ograničenjima. Inženjerska verzija navodi tri: da je pokrivenost prije 12. svibnja 2026. rekonstruirana, pa travanjska osnovica nije pouzdana ni u jednom smjeru; da broj sesija nije usporediv kroz niz, jer svibanj pokazuje 170, a lipanj 2016; i da greške preopterećenja rastu i s mojom vlastitom paralelizacijom, ne samo s opterećenjem usluge. U teatralnoj verziji nema nijednog, ni odjeljka u koji bi stali. Ništa nije iskrivljeno. Činjenice koje nalaz slabe naprosto nisu imale gdje sjesti u građi složenoj da dovede do završetka.

## Što skill propisuje

Inženjerski registar, zadani: zaključak u prvom odlomku; naslovi koji imenuju sadržaj, a ne mjesto u priči; izjavne rečenice; svaka brojka s jedinicom, datumom i načinom na koji se ponovno dobiva; obavezan odjeljak s ograničenjima svugdje gdje se donose mjerenja; na kraju otvorena pitanja, nikad pouka. Zabranjuje i kratak popis uvodnih fraza, poput *ispostavilo se*, *evo u čemu je stvar* i *i tada sam shvatio*, jer svaka od njih postoji samo da proizvede napetost.

Teatralni registar, na zahtjev: luk, odgođeni obrat, metafora, završna rečenica složena da sjedne. Jedno ga pravilo čini upotrebljivim: **napetost smije doći isključivo iz redoslijeda kojim se iznose istinite stvari, nikad iz onoga što je prešućeno.** Odjeljak s ograničenjima ulazi i u njega, u cijelosti, i onda kad kvari završetak. Da je to pravilo postojalo dok je gornja teatralna verzija nastajala, redak koji sada glasi 0 od 3 glasio bi 3 od 3.

## Zadana postavka ne može živjeti u skillu

Ovo vrijedi prenijeti bez obzira na to što mislite o registrima. Skill se učitava tek kad se okine. Zadana postavka koja postoji samo unutar skilla nije zadana postavka, jer je slučaj u kojem najviše znači upravo onaj u kojem ništa nije okinulo skill.

Zato redak koji je provodi stoji u \`CLAUDE.md\`, koji se čita u svakoj sesiji, a skill drži razradu:

> **Registar teksta.** Sve što se piše za ljudsku publiku ide u inženjerskom registru: zaključak prvi, naslovi koji imenuju sadržaj, bez dramaturškog luka, bez prešućenih činjenica, ograničenja izrečena izravno. Teatralni registar samo na izričit zahtjev u toj sesiji.

Ista podjela vrijedi za svako ponašanje koje želite uključeno po zadanom: okidači i razrada idu u skill, a jednoredno pravilo ondje gdje se uvijek učitava.

## Dvojezični tekstovi pišu se dvaput, ne prevode

Svaki tekst ovdje izlazi na engleskom i hrvatskom. Pravilo u skillu kaže da se svaki jezik piše izvorno iz istih činjenica, da se verzije poklapaju u brojkama, tvrdnjama i redoslijedu odjeljaka, a slobodno razlikuju u građi rečenice. Gotovo doslovan prijevod prepoznaje se točno onako kako se prepoznaje i dramaturški luk, i pada na istom ispitu: čita se kao generiran, a ne kao napisan.

## Ograničenja

- **n = 1.** Jedan članak, jedan autor, jedan par verzija. Ništa ovdje ne pokazuje da čitatelji više vole inženjerski registar, nego samo da je jedna teatralna izvedba izgubila podatke koje je inženjerska zadržala.
- **Pravilo je napisano nakon primjera.** Teatralna verzija nije nastala tako da je netko pokušao poštovati zahtjev za ograničenjima i u tome podbacio; zahtjev tada još nije postojao. To je slabiji dokaz od kontrolirane usporedbe i tako ga treba čitati.
- **Jednu sam mjeru odbacio.** Brojio sam jednorečenične odlomke očekujući da će ih teatralna verzija biti puna. Nema ih nijedan, a inženjerska ih ima pet. Pravilo zabranjuje jednorečenični odlomak u ulozi udarca u bubanj, a brojanje to ne razlikuje od kratke činjenične tvrdnje pod naslovom, pa ne mjeri ništa korisno.
- Broj riječi i rečenica dolazi iz skripte nad dvama tekstovima i ovisi o tome kako se isključuju tablice i popisi. Odnos među brojkama je stabilan, same brojke nisu precizne.

## Izvor

Skill, na engleskom i u hrvatskom izvorniku, zajedno s uputama: [github.com/stepanic/cv/tree/main/skills/register](https://github.com/stepanic/cv/tree/main/skills/register). MIT. Instalira se na razini korisnika i onda vrijedi u svakom projektu:

\`\`\`bash
mkdir -p ~/.claude/skills/register
cp skills/register/SKILL.md ~/.claude/skills/register/SKILL.md
\`\`\`

Obje verzije članka, na oba jezika, s mjerenjima i naredbama za njihovo ponavljanje: [docs/2026-08-27-colossus-hipoteza-dvije-verzije.md](https://github.com/stepanic/cv/blob/main/docs/2026-08-27-colossus-hipoteza-dvije-verzije.md).`,
    },
    sources: [
      {
        title: "The skill itself — SKILL.md, the Croatian original and the README",
        url: "https://github.com/stepanic/cv/tree/main/skills/register",
      },
      {
        title: "Both versions of the article, with the measurements and reproduction commands",
        url: "https://github.com/stepanic/cv/blob/main/docs/2026-08-27-colossus-hipoteza-dvije-verzije.md",
      },
      {
        title: "Claude Code — Agent Skills documentation",
        url: "https://docs.claude.com/en/docs/claude-code/skills",
      },
    ],
  },
  {
    slug: "colossus-lease-in-my-own-usage-data",
    date: "2026-08-27",
    tags: ["Claude Code", "Telemetry", "Measurement", "Anthropic", "Data analysis"],
    title: {
      en: "Four checks on whether a datacenter lease shows up in my own usage data",
      hr: "Četiri provjere: vidi li se najam podatkovnog centra u mojim podacima o korištenju",
    },
    lead: {
      en: "In May 2026 Anthropic leased the whole of xAI's Colossus 1 for $1.25 billion a month. I assumed the effect was visible in my own Claude Code telemetry. It is not. Three checks contradict the assumption and a fourth explains where the apparent jump came from.",
      hr: "Anthropic je u svibnju 2026. unajmio cijeli xAI-jev Colossus 1 za 1,25 milijardi dolara mjesečno. Pretpostavio sam da se to vidi u mojoj telemetriji Claude Codea. Ne vidi se. Tri provjere govore protiv pretpostavke, a četvrta objašnjava odakle prividni skok.",
    },
    body: {
      en: `I assumed a compute deal signed in Tennessee was measurable in my own Claude Code usage. Below are the four checks I ran against my own telemetry, and the result: the assumption does not survive any of them.

## The claim being tested

On 6 May 2026 xAI granted Anthropic exclusive access to all of Colossus 1 near Memphis — more than 220,000 Nvidia GPUs (H100, H200, GB200) and 300 MW. The price became public on 20 May in SpaceX's S-1 filing: $1.25 billion a month through May 2029, terminable by either side on 90 days' notice. Separately, Google leases roughly 110,000 GPUs at Memphis and Southaven for $920 million a month from October 2026.

My claim was narrower than the deal: that the added capacity was visible in how Claude Code behaved for me, and specifically that my usage stepped up at the start of May because of it.

## The data

Claude Code writes every session to \`~/.claude/projects/**/*.jsonl\`. The script \`scripts/mine-claude-history.mjs\` in this repo aggregates those transcripts together with daily git snapshots from [dotclaude-sync](https://github.com/stepanic/dotclaude-sync) and Claude Code's own stats cache. Token counts are deduplicated by \`message.id:requestId\` and priced from public per-model API rates. Totals as of 26 August 2026: 4,157 sessions, 195 projects, 444,234 messages, 21.27 billion tokens.

## Check 1 — when the step actually occurs

Daily token averages over the days that have data:

| period | average | days with data |
|---|---|---|
| 15–30 April | 94M/day | 10 |
| 1–11 May | 51M/day | 9 |
| 12–31 May | 182M/day | 19 |
| June | 218M/day | 29 |

The first eleven days of May are the quietest stretch in the window, below the second half of April. The step is at 12 May, six days after the contract date and eight days before it was public. The strongest single day in May is 26 May at 483M tokens.

## Check 2 — which model was running

First appearance of each model in my transcripts, taken as the earliest \`timestamp\` on an assistant event carrying \`message.usage\`:

| model | first seen |
|---|---|
| opus-4-6 | 10 Feb 2026 |
| opus-4-7 | 17 Apr 2026 |
| sonnet-4-6 | 28 May 2026 |
| opus-4-8 | 29 May 2026 |
| fable-5 | 9 Jun 2026 |
| sonnet-5 | 30 Jun 2026 |
| opus-5 | 24 Jul 2026 |

Every session in May ran \`opus-4-7\`. The model did not change at any point during the month, so a model swap cannot account for the step. Opus 5 — the model I had named as the cause — does not appear until 24 July, eleven weeks later.

## Check 3 — when the measuring instrument changed

Claude Code prunes local transcripts after 30 days by default. My history survives that only because dotclaude-backup commits a daily snapshot of \`~/.claude\`. Its first commit is **12 May 2026**, the same date as the step.

Coverage on either side of that date:

| window | days missing from the daily series |
|---|---|
| 1 Mar – 11 May | 45 of 72 |
| 12 May – 31 Jul | 2 of 81 |

Before the backup existed, 63% of days are absent; after it, 2%. The apparent tripling in daily tokens sits exactly on the boundary where the record stopped being lossy. That is sufficient to explain a large part of the step without any change in the world.

## Check 4 — a metric that measures supply rather than demand

Token counts measure how much I asked for. They say nothing about how much capacity was available. The nearest supply-side signal in the transcripts is the rate of overload and limit errors, normalized by assistant messages:

| month | errors per 1,000 assistant messages |
|---|---|
| May | 0.33 |
| June | 1.85 |
| July | 1.36 |
| August | 1.22 |

The rate rises after May. If the lease had relieved capacity pressure on my sessions, this is the series that should fall.

## Result

Checks 1, 2 and 4 contradict the hypothesis. Check 3 offers a sufficient alternative explanation for the observation that produced it. The correct statement is that my usage data cannot detect the lease, not that the lease had no effect.

The general error is worth naming precisely, because it is easy to repeat: a consumption metric collected by the consumer measures demand. Attributing a change in it to a supplier-side event requires either a supplier-side metric or a controlled comparison, and I had neither.

## Limitations

- Coverage before 12 May 2026 is reconstructed from the union of older snapshots and \`stats-cache.json\`. The April baseline is therefore unreliable in both directions; actual April usage may well have been higher than recorded.
- Session counts are not comparable across the whole series — May shows 170 and June 2,016, a difference too large to be real. Something changed in what counts as a session, so this analysis uses tokens throughout.
- Overload errors also rise with my own concurrency, not only with service load. Their increase is not evidence that capacity got worse, only an absence of evidence that it got better.

## What would actually test the claim

Serving-side measurements, collected before the question is asked: time to first token, tokens per second, and the share of 5xx responses, each segmented by model and hour of day, with a baseline predating the event. Claude Code transcripts contain some of this, but I had defined no baseline, and a baseline chosen after you know what you are looking for is not a baseline.

The measurements, the reproducible commands and the full limitations are in [docs/2026-08-27-colossus-hipoteza-dvije-verzije.md](https://github.com/stepanic/cv/blob/main/docs/2026-08-27-colossus-hipoteza-dvije-verzije.md).`,
      hr: `Pretpostavio sam da se ugovor o zakupu računalnih kapaciteta, potpisan u Tennesseeju, dade izmjeriti u mom korištenju Claude Codea. Slijede četiri provjere nad vlastitom telemetrijom i njihov ishod: pretpostavka ne preživljava nijednu.

## Tvrdnja koja se provjerava

xAI je 6. svibnja 2026. Anthropicu dao isključiv pristup cijelom Colossusu 1 kraj Memphisa, dakle više od 220.000 Nvidijinih grafičkih procesora (H100, H200, GB200) i 300 megavata. Cijena je objavljena 20. svibnja u SpaceX-ovu prospektu S-1: 1,25 milijardi dolara mjesečno do svibnja 2029., uz otkazni rok od 90 dana za obje strane. Google zasebno zakupljuje oko 110.000 procesora u Memphisu i Southavenu za 920 milijuna dolara mjesečno, od listopada 2026.

Moja je tvrdnja bila uža od samog ugovora: da se dodani kapacitet vidi u tome kako se Claude Code kod mene ponaša, i to tako da mi je potrošnja porasla početkom svibnja upravo zbog njega.

## Podaci

Claude Code svaku sesiju zapisuje u \`~/.claude/projects/**/*.jsonl\`. Skripta \`scripts/mine-claude-history.mjs\` u ovom repozitoriju te transkripte spaja s dnevnim git snimkama alata [dotclaude-sync](https://github.com/stepanic/dotclaude-sync) i s međuspremnikom statistike samoga Claude Codea. Tokeni se razdvajaju po ključu \`message.id:requestId\` i vrednuju po javnom cjeniku sučelja za svaki model. Stanje na 26. kolovoza 2026.: 4157 sesija, 195 projekata, 444.234 poruke, 21,27 milijardi tokena.

## Prva provjera: kad se stepenica doista događa

Dnevni prosjeci tokena, računati nad danima za koje podaci postoje:

| razdoblje | prosjek | dana s podacima |
|---|---|---|
| 15. – 30. travnja | 94 mln/dan | 10 |
| 1. – 11. svibnja | 51 mln/dan | 9 |
| 12. – 31. svibnja | 182 mln/dan | 19 |
| lipanj | 218 mln/dan | 29 |

Prvih jedanaest dana svibnja najmirniji su dio promatranog razdoblja i slabiji od druge polovice travnja. Stepenica je 12. svibnja, dakle šest dana nakon potpisa i osam dana prije nego što je ugovor postao javan. Najjači pojedinačni dan u svibnju jest 26. svibnja s 483 milijuna tokena.

## Druga provjera: koji je model radio

Prva pojava svakog modela u transkriptima, uzeta kao najraniji \`timestamp\` na asistentskom događaju koji nosi \`message.usage\`:

| model | prvi put |
|---|---|
| opus-4-6 | 10. veljače 2026. |
| opus-4-7 | 17. travnja 2026. |
| sonnet-4-6 | 28. svibnja 2026. |
| opus-4-8 | 29. svibnja 2026. |
| fable-5 | 9. lipnja 2026. |
| sonnet-5 | 30. lipnja 2026. |
| opus-5 | 24. srpnja 2026. |

Sve svibanjske sesije vrtjele su \`opus-4-7\`. Model se tijekom mjeseca nije mijenjao ni jednom, pa promjena modela ne može objasniti stepenicu. Opus 5, koji sam prozvao uzrokom, javlja se tek 24. srpnja, jedanaest tjedana poslije.

## Treća provjera: kad se promijenio mjerni instrument

Claude Code zadano briše lokalne transkripte nakon 30 dana. Moja povijest to preživljava samo zato što dotclaude-backup svakodnevno commita snimku direktorija \`~/.claude\`. Njegov je prvi commit **12. svibnja 2026.**, dakle istoga dana kad i stepenica.

Pokrivenost s obje strane toga datuma:

| razdoblje | dana koji nedostaju u dnevnom nizu |
|---|---|
| 1. 3. – 11. 5. | 45 od 72 |
| 12. 5. – 31. 7. | 2 od 81 |

Prije nego što je sigurnosna kopija postojala nedostaje 63 posto dana, poslije nje dva posto. Utrostručenje dnevne potrošnje leži točno na granici na kojoj zapis prestaje gubiti podatke. To je dovoljno da objasni velik dio stepenice bez ijedne promjene u vanjskom svijetu.

## Četvrta provjera: mjera koja opisuje ponudu, a ne potražnju

Broj tokena mjeri koliko sam tražio. O raspoloživom kapacitetu ne govori ništa. Najbliži pokazatelj sa strane posluživanja koji u transkriptima postoji jest učestalost grešaka preopterećenja i ograničenja, svedena na broj asistentskih poruka:

| mjesec | grešaka na 1000 asistentskih poruka |
|---|---|
| svibanj | 0,33 |
| lipanj | 1,85 |
| srpanj | 1,36 |
| kolovoz | 1,22 |

Nakon svibnja učestalost raste. Da je zakup olakšao pristup kapacitetu u mojim sesijama, upravo bi taj niz morao padati.

## Ishod

Prva, druga i četvrta provjera govore protiv hipoteze. Treća nudi dovoljno objašnjenje za samo opažanje koje ju je izazvalo. Ispravno je reći da moji podaci o korištenju ne mogu otkriti taj zakup, a ne da zakup nije imao učinka.

Pogrešku vrijedi imenovati točno, jer se lako ponavlja: mjera potrošnje koju prikuplja sam potrošač opisuje potražnju. Da bi se promjena u njoj pripisala događaju na strani dobavljača, treba ili mjera sa strane dobavljača ili kontrolirana usporedba. Nisam imao ni jedno ni drugo.

## Ograničenja

- Pokrivenost prije 12. svibnja 2026. rekonstruirana je iz unije starijih snimaka i datoteke \`stats-cache.json\`. Travanjska osnovica zato nije pouzdana ni u jednom smjeru; stvarna je potrošnja mogla biti i viša od zabilježene.
- Broj sesija nije usporediv kroz cijeli niz. Svibanj pokazuje 170, a lipanj 2016, što je prevelika razlika da bi bila stvarna. Nešto se promijenilo u tome što se broji kao sesija, pa se u ovoj analizi svugdje koriste tokeni.
- Greške preopterećenja rastu i s mojom vlastitom paralelizacijom, ne samo s opterećenjem usluge. Njihov porast nije dokaz da je kapacitet lošiji, nego samo izostanak dokaza da je bolji.

## Čime bi se tvrdnja doista provjerila

Mjerenjima sa strane posluživanja, i to prikupljenima prije nego što se pitanje postavi: vrijeme do prvoga tokena, broj tokena u sekundi i udio odgovora s greškom 5xx, sve razvrstano po modelu i satu u danu, uz osnovicu koja prethodi događaju. Transkripti Claude Codea dio toga sadrže, ali osnovicu nisam bio definirao, a osnovica odabrana nakon što već znaš što tražiš nije osnovica.

Mjerenja, naredbe kojima se ponavljaju i potpun popis ograničenja stoje u [docs/2026-08-27-colossus-hipoteza-dvije-verzije.md](https://github.com/stepanic/cv/blob/main/docs/2026-08-27-colossus-hipoteza-dvije-verzije.md).`,
    },
    sources: [
      {
        title: "Anthropic will pay xAI $1.25B per month for compute — TechCrunch, 20 May 2026",
        url: "https://techcrunch.com/2026/05/20/anthropic-will-pay-xai-1-25-billion-per-month-for-compute/",
      },
      {
        title: "SpaceX IPO filing reveals the Colossus 1 lease terms — Data Center Dynamics",
        url: "https://www.datacenterdynamics.com/en/news/spacex-ipo-filing-reveals-anthropic-set-to-pay-musks-firm-125bn-a-month-to-rent-xai-data-center-space/",
      },
      {
        title: "Google to pay $920 million monthly for Memphis and Southaven capacity — Data Center Dynamics",
        url: "https://www.datacenterdynamics.com/en/news/google-to-pay-920-million-to-spacex-monthly-for-ai-capacity/",
      },
      {
        title: "dotclaude-sync — daily git snapshots of ~/.claude, the reason this history exists at all",
        url: "https://github.com/stepanic/dotclaude-sync",
      },
    ],
  },
  {
    slug: "colossus-lease-theatrical-version",
    date: "2026-08-27",
    tags: ["Writing", "Specimen", "Claude Code", "Telemetry"],
    title: {
      en: "I was certain I had felt a $15 billion datacenter deal. My own telemetry says I felt my backup script.",
      hr: "Bio sam siguran da sam osjetio ugovor od 15 milijardi dolara. Vlastita telemetrija kaže da sam osjetio svoju skriptu za sigurnosnu kopiju.",
    },
    lead: {
      en: "A specimen, published unedited. This is the same investigation as the engineering-register version, written in the register a language model reaches for by default. It states three fewer limitations than the version next to it, and that is the point of publishing it.",
      hr: "Primjerak, objavljen neizmijenjen. Ovo je isto istraživanje kao i verzija u inženjerskom registru, napisano u registru za kojim jezični model poseže po zadanom. Navodi tri ograničenja manje od verzije pokraj sebe, i upravo je zato objavljen.",
    },
    body: {
      en: `> **Read this as an exhibit, not as the finished article.** It is the theatrical rendering of the same investigation as [Four checks on whether a datacenter lease shows up in my own usage data](/blog/colossus-lease-in-my-own-usage-data), written from the same measurements. The facts and figures below are accurate. What is missing is the limitations section: this version states **none** of the three caveats the engineering version carries, which is the finding reported in [the comparison post](/blog/two-registers-and-the-limitations-one-dropped). The text is unedited so that the word and sentence counts quoted there still describe it.

---

On 6 May 2026, xAI handed Anthropic the entire Colossus 1 facility outside Memphis: over 220,000 Nvidia GPUs, 300 megawatts, $1.25 billion a month through May 2029. I did not learn this from a press release. I learned it the way I learn most things now, by asking Claude, and the number stopped me: fifteen billion dollars a year, for one cluster, so that a terminal window can answer me.

And I was sure I had felt it. Somewhere around the start of May something changed in how Claude Code behaved for me. Sessions got longer. Work that used to stall stopped stalling. I had the receipts, too, or thought I did: 21.3 billion tokens across 4,157 sessions, all of it mined out of my own transcripts. April, one billion tokens. May, four. June, six.

So I went looking for the moment. What I found instead was my own instrument.

The first crack was the date. The jump is not at the start of May at all. The first eleven days of May average 51 million tokens a day, *below* the second half of April at 94 million. The break is 12 May, and everything after it lives in a different regime: 182 million a day for the rest of the month, 218 in June.

The second crack was the model. Through all of May I ran exactly one model, \`opus-4-7\`. Opus 4.8 does not appear in my transcripts until 29 May. Fable 5 until 9 June. And Opus 5, the model I had named as the cause, until **24 July**. Whatever I felt in May, it was not the thing I thought I felt it from.

The third crack was fatal. \`dotclaude-backup\`, the tool that snapshots \`~/.claude\` into a daily git commit, has its first commit on **12 May 2026**. The same day as the break. Before it, 45 of 72 days are missing from my own history, lost to the 30-day transcript retention. After it, 2 of 81. The step I had been reading as a change in the world was, in large part, the day I started recording the world properly.

The fourth check was the one that should have settled it in my favour, and did the opposite. Overload and limit errors, per thousand assistant messages: 0.33 in May, 1.85 in June, 1.36 in July. If Colossus 1 had loosened anything for me, that line should fall. It rises.

Here is what I actually learned, and it is worth more than the story I wanted to tell. My token counts measure *my demand*. They say nothing about anyone's supply. To claim that a lease in Tennessee reached my terminal I would need serving-side numbers — latency per token, time to first token, the rate of 529s, normalized by model and hour — and a baseline collected before I went looking. I had none of that. I had a curve that bent on the day I bought a better ruler.

The deal is real. The feeling was real. The causal line between them was something I drew myself.

---

> **What this version left out.** Three limitations, all of them in the [engineering version](/blog/colossus-lease-in-my-own-usage-data): coverage before 12 May 2026 is reconstructed, so the April baseline is unreliable in *both* directions and April may well have been busier than recorded; session counts are not comparable across the series, since May shows 170 and June 2,016; and overload errors rise with my own concurrency, not only with service load, so their increase is an absence of evidence rather than evidence of the opposite. None of these contradict the conclusion. Each one weakens it, and each one had nowhere to sit in a structure built to land an ending.`,
      hr: `> **Čitajte ovo kao izložak, ne kao gotov članak.** Ovo je teatralna izvedba istog istraživanja kao i [Četiri provjere: vidi li se najam podatkovnog centra u mojim podacima o korištenju](/blog/colossus-lease-in-my-own-usage-data), pisana iz istih mjerenja. Činjenice i brojke koje slijede točne su. Nedostaje odjeljak s ograničenjima: ova verzija ne navodi **nijedno** od tri koja inženjerska nosi, što je nalaz iznesen u [postu s usporedbom](/blog/two-registers-and-the-limitations-one-dropped). Tekst je neizmijenjen da bi brojke o riječima i rečenicama iz toga posta i dalje opisivale upravo njega.

---

Šestoga svibnja 2026. xAI je Anthropicu ustupio cijeli Colossus 1 kraj Memphisa: više od 220.000 Nvidijinih grafičkih procesora, 300 megavata, 1,25 milijardi dolara mjesečno do svibnja 2029. Za to nisam saznao iz priopćenja za javnost nego onako kako danas saznajem gotovo sve, pitao sam Claudea, i brojka me zaustavila. Petnaest milijardi godišnje, za jedan klaster, da bi mi prozor terminala odgovorio.

I bio sam siguran da sam to osjetio. Negdje na početku svibnja nešto se promijenilo u tome kako se Claude Code kod mene ponaša. Sesije su se produljile. Poslovi koji bi prije zapeli prestali su zapinjati. Imao sam i dokaze, mislio sam: 21,3 milijarde tokena kroz 4157 sesija, sve izrudareno iz vlastitih transkripata. Travanj, milijarda tokena. Svibanj, četiri. Lipanj, šest.

Krenuo sam tražiti trenutak. Umjesto njega našao sam vlastiti mjerni instrument.

Prva je pukotina bio datum. Skoka na početku svibnja naprosto nema. Prvih jedanaest svibanjskih dana prosječno daju 51 milijun tokena dnevno, dakle *manje* od druge polovice travnja s 94 milijuna. Prijelom je 12. svibnja, a sve poslije njega živi u drugom režimu: 182 milijuna dnevno do kraja mjeseca, 218 u lipnju.

Druga je pukotina bio model. Kroz cijeli svibanj vozio sam točno jedan model, \`opus-4-7\`. Opus 4.8 u mojim se transkriptima ne pojavljuje prije 29. svibnja. Fable 5 prije 9. lipnja. A Opus 5, model koji sam prozvao uzrokom, tek **24. srpnja**. Što god da sam u svibnju osjetio, nije došlo odande odakle sam mislio.

Treća je pukotina bila kobna. \`dotclaude-backup\`, alat koji \`~/.claude\` svakodnevno sprema u git, ima prvi commit **12. svibnja 2026.** Istoga dana kad i prijelom. Prije njega u mojoj povijesti nedostaje 45 od 72 dana, progutala ih je tridesetodnevna retencija transkripata. Poslije njega nedostaju dva od 81. Stepenicu koju sam čitao kao promjenu u svijetu dobrim je dijelom bio dan kad sam svijet počeo uredno bilježiti.

Četvrta je provjera trebala presuditi u moju korist, a presudila je obrnuto. Greške preopterećenja i ograničenja, na tisuću asistentskih poruka: 0,33 u svibnju, 1,85 u lipnju, 1,36 u srpnju. Da mi je Colossus 1 išta olabavio, ta bi krivulja padala. Ona raste.

Evo što sam zapravo naučio, i to vrijedi više od priče koju sam htio ispričati. Moje brojke o tokenima mjere *moju potražnju*. O tuđim kapacitetima ne govore ništa. Da bih tvrdio kako je najam u Tennesseeju stigao do mog terminala, trebale bi mi brojke sa strane posluživanja, kašnjenje po tokenu, vrijeme do prvoga tokena, udio grešaka 529, sve to razvrstano po modelu i satu, i mjereno prije nego što sam počeo tražiti. Ništa od toga nisam imao. Imao sam krivulju koja se prelomila onoga dana kad sam kupio bolje ravnalo.

Ugovor je stvaran. Osjećaj je bio stvaran. Uzročnu crtu među njima povukao sam sâm.

---

> **Što je ova verzija izostavila.** Tri ograničenja, sva iz [inženjerske verzije](/blog/colossus-lease-in-my-own-usage-data): pokrivenost prije 12. svibnja 2026. je rekonstruirana, pa travanjska osnovica nije pouzdana ni u jednom smjeru i travanj je mogao biti i prometniji nego što je zabilježeno; broj sesija nije usporediv kroz niz, jer svibanj pokazuje 170, a lipanj 2016; i greške preopterećenja rastu i s mojom vlastitom paralelizacijom, ne samo s opterećenjem usluge, pa je njihov porast izostanak dokaza, a ne dokaz suprotnoga. Nijedno od toga ne pobija zaključak. Svako ga slabi, i nijedno nije imalo gdje sjesti u građi složenoj da dovede do završetka.`,
    },
    sources: [
      {
        title: "The engineering-register version of the same investigation",
        url: "https://stepanic.domovina.ai/blog/colossus-lease-in-my-own-usage-data",
      },
      {
        title: "The comparison, with the structural measurements of both versions",
        url: "https://stepanic.domovina.ai/blog/two-registers-and-the-limitations-one-dropped",
      },
      {
        title: "Both versions and the underlying measurements in the repo",
        url: "https://github.com/stepanic/cv/blob/main/docs/2026-08-27-colossus-hipoteza-dvije-verzije.md",
      },
    ],
  },
  {
    slug: "wrap-up-skill-mined-from-my-own-transcripts",
    date: "2026-08-26",
    tags: ["Claude Code", "Skills", "AI-native", "Developer tooling", "Open source"],
    title: {
      en: "I mined a Claude Code skill out of 147 of my own sessions — and the data corrected me twice",
      hr: "Izmajnirao sam Claude Code skill iz 147 vlastitih sesija — i podaci su me ispravili dvaput",
    },
    lead: {
      en: "I kept retyping the same end-of-session paragraph. Instead of writing the shortcut from memory, I counted what I actually asked for across 145 projects of local transcripts. The counts disagreed with my self-image in two useful places.",
      hr: "Stalno sam pretipkavao isti odlomak na kraju sesije. Umjesto da prečac napišem po sjećanju, prebrojao sam što doista tražim kroz 145 projekata lokalnih transkripata. Brojke se na dva korisna mjesta nisu složile s mojom slikom o sebi.",
    },
    body: {
      en: `At the end of almost every Claude Code session I was typing a variation of the same paragraph:

> super, daj sve commitaj i pushaj, update memory fajlova i ako u ovom chatu postoji neko znanje koje nije trajno u codebaseu trajno ga spremi u markdown dokument ako i treba s mermaidjs vizualizacijama i nakon toga pripremi chat za clear

Roughly: *commit and push everything, update the memory files, and if this chat produced knowledge that is not permanently in the codebase, write it into a markdown document, with mermaid diagrams if it needs them, then prepare the chat for \`/clear\`.*

So on 4 August 2026 I asked for a shortcut. The interesting part is what happened next: the skill was not written from my description of my habit. It was **mined out of my own transcripts**, and the counts corrected me twice.

## The evidence was already on disk

Claude Code stores every session as JSONL under \`~/.claude/projects/\`. At that moment: 145 project directories, 2.5 GB. So the first step was not writing a file, it was counting one:

\`\`\`bash
cd ~/.claude/projects
grep -rliE "pripremi.{0,30}chat za clear" --include=*.jsonl . | wc -l
# 147
\`\`\`

**147 sessions** contained the phrase. Deduplicating the messages I had actually typed gave **119 distinct phrasings** of the same request — "sve commitaj i pushaj i preimremi chat za clear", "ok, updejtaj memory fajlove i pripremi chat za clear", typos and all. That is the honest shape of a habit: not one prompt, a cloud of near-identical ones.

Then the part that actually shaped the skill — counting which steps show up in the fullest variants:

| step I asked for | share of variants |
|---|---|
| "prepare the chat for clear" | **100%** |
| commit + push | 88% |
| update memory files | 70% |
| write a markdown document | 41% |
| mermaid diagram | 12% |
| touch \`docs/\` or \`CLAUDE.md\` explicitly | 0% |

## The two things I had wrong about myself

**Mermaid is not a default.** I *feel* like I ask for diagrams constantly. I ask for them 12% of the time. Had I written the skill from memory it would have drawn a diagram on every run — faithful to my self-image, wrong about my behaviour. What went into the file instead: *use mermaid when a relationship or a flow is not obvious from prose; do not draw a diagram for something that is one sentence.*

**The most valuable step was missing from my own prompt.** The longest variants ask for a handoff prompt in the clipboard, ready to paste into a fresh session after \`/clear\`. It was even recorded in a memory file. But it had dropped out of the sentence I type, because I had started assuming it. Mining surfaced a step my habit had gone silent about, and it became step 4.

## The rule in red

One line in the skill is marked with a red dot: **never \`git add -A\`.**

That is not a style preference, it is a near-miss written down. During the very session that produced the skill, a neighbouring repo's working copy held an unfinished \`.gitignore\` and a set of half-written shell scripts, untracked, while unrelated work was being committed. \`git add -A\` would have pushed somebody's half-done afternoon to \`main\`.

So the skill stages **by name**, and for any modified file the agent does not remember touching, it runs \`git diff\` and leaves it alone if it is not its own. Same paragraph forbids committing cron-written snapshots and \`.env\`, and forbids reporting "pushed" without checking the output of the push.

I think that is the general shape of a rule worth putting in a skill: not a preference, a thing that almost went wrong once.

## What it actually does

Five steps, in order, autonomously to the end:

1. **Commit + push across every repo touched in the session.** Work crosses repo boundaries constantly — a backend change, the dashboard that reads it, the fetcher that feeds it — and the last one is the one you forget. Staged by name, semantic commit messages whose body explains *why*, push verified from its output.
2. **Memory files.** One fact per file, update the existing file rather than creating a duplicate, only what still holds for future sessions.
3. **Knowledge that is not in the codebase**, into \`docs/YYYY-MM-DD-topic.md\`. The framing that makes this step work: not "what did we do" — git already knows that — but **"what would the next pass have to rediscover"**. Rejected alternatives and why. The measurement that decided a threshold. The silent failure that cost an afternoon.
4. **A handoff prompt into the clipboard** *and* printed in the reply, because the clipboard has a habit of getting lost before \`/clear\`.
5. **A summary whose most important section is what is still open or unverified.**

It cannot run \`/clear\` itself. That is a built-in CLI command, so the last line tells me to type it.

## Two entry points, on purpose

You can invoke it as \`/wrap-up\`. You can also just keep typing your usual sentence: the \`description:\` field contains the real phrases from those 119 variants, so the skill triggers on its own. A shortcut you have to remember is a shortcut you will forget — the whole point was to automate a habit, not to replace it with a new one to maintain.

## Does it hold up

Between 4 and 26 August 2026 it fired **47 times across 11 working days**, in every repo I touched, not just the one it was born in.

The failure mode it removes is not typing effort. It is the session that ends with a good measurement, a rejected approach and the reason for it, all of it alive only in a context window that is about to be cleared.

## Mine your own

The method transfers to any prompt you keep retyping. Count the occurrences, dedupe the variants, count which steps appear, then write the skill against the counts instead of your recollection, and put the real phrasings into \`description:\`.

Two caveats, both of which bit me:

- **The 30-day pruning is a default, not a law.** Claude Code deletes local transcripts after 30 days, but \`cleanupPeriodDays\` in \`~/.claude/settings.json\` sets that window — I run \`365\`. Raise it *before* you need the history, because the setting cannot bring back what has already gone. And for a durable copy, back the directory up too: [dotclaude-sync](https://github.com/stepanic/dotclaude-sync) mirrors all of \`~/.claude\` — transcripts, settings **and the memory files** — into a daily git snapshot and pushes it to a private remote (Google Drive, in my case). That archive is the same one that powers the [usage stats](/#claude-code) on this site.
- **The skill contaminates its own evidence.** Once \`description:\` contains your trigger phrases, every session that loads the skill list contains them too, and a naive grep balloons. Re-running that first count today returns 562 sessions; filtered to messages a human actually typed it is 193. Filter to \`type == "user"\`.

The skill, in English and in the Croatian original, plus the mining script: [github.com/stepanic/cv/tree/main/skills/wrap-up](https://github.com/stepanic/cv/tree/main/skills/wrap-up). MIT. The part worth copying is the method, not my five steps.`,
      hr: `Na kraju gotovo svakog Claude Code razgovora tipkao sam varijaciju istog odlomka:

> super, daj sve commitaj i pushaj, update memory fajlova i ako u ovom chatu postoji neko znanje koje nije trajno u codebaseu trajno ga spremi u markdown dokument ako i treba s mermaidjs vizualizacijama i nakon toga pripremi chat za clear

Pa sam 4. kolovoza 2026. zatražio prečac. Zanimljiv je dio ono što se dogodilo poslije: skill nije napisan prema mom opisu vlastite navike. **Izmajniran je iz mojih transkripata**, a brojke su me ispravile dvaput.

## Dokazi su već bili na disku

Claude Code sprema svaku sesiju kao JSONL u \`~/.claude/projects/\`. U tom trenutku: 145 mapa projekata, 2,5 GB. Prvi korak zato nije bio pisanje datoteke nego brojanje:

\`\`\`bash
cd ~/.claude/projects
grep -rliE "pripremi.{0,30}chat za clear" --include=*.jsonl . | wc -l
# 147
\`\`\`

**147 sesija** sadržavalo je tu frazu. Nakon dedupliciranja poruka koje sam doista utipkao ostalo je **119 jedinstvenih formulacija** istog zahtjeva: "sve commitaj i pushaj i preimremi chat za clear", "ok, updejtaj memory fajlove i pripremi chat za clear", tipfeleri uključeni. To je pošten oblik navike: ne jedan prompt, nego oblak gotovo istih.

Onda dio koji je stvarno oblikovao skill — brojanje koji se koraci pojavljuju u najpotpunijim varijantama:

| korak koji sam tražio | udio varijanti |
|---|---|
| "pripremi chat za clear" | **100%** |
| commit + push | 88% |
| update memory fajlova | 70% |
| markdown dokument | 41% |
| mermaid dijagram | 12% |
| izrijekom \`docs/\` ili \`CLAUDE.md\` | 0% |

## Dvije stvari koje sam o sebi krivo mislio

**Mermaid nije zadano.** *Osjećam* da dijagrame tražim stalno. Tražim ih u 12% slučajeva. Da sam skill pisao po sjećanju, crtao bi dijagram u svakom prolazu — vjeran mojoj slici o sebi, netočan o mom ponašanju. U datoteku je umjesto toga otišlo: *mermaid kad odnos ili tijek nisu očiti iz teksta; ne crtaj dijagram za ono što je rečenica.*

**Najvrjedniji korak nedostajao je u mom vlastitom promptu.** Najduže varijante traže handoff prompt u clipboardu, spreman za lijepljenje u svježu sesiju nakon \`/clear\`. Bio je čak zapisan i u memory fajlu. Ali je ispao iz rečenice koju tipkam, jer sam ga počeo podrazumijevati. Rudarenje je izvuklo korak o kojem je moja navika zašutjela, i postao je korak 4.

## Pravilo crvenom

Jedna linija u skillu označena je crvenom točkom: **nikad \`git add -A\`.**

To nije stilska preferencija nego zapisan promašaj za dlaku. Baš tijekom sesije koja je proizvela skill, radna kopija susjednog repoa držala je nedovršen \`.gitignore\` i hrpu napola napisanih shell skripti, netrackanih, dok se commitao nepovezan rad. \`git add -A\` odnio bi tuđe napola gotovo poslijepodne na \`main\`.

Zato skill stageira **poimence**, a za svaki izmijenjen fajl kojeg se agent ne sjeća dirati pokreće \`git diff\` i ostavlja ga na miru ako nije njegov. Isti odlomak zabranjuje commitanje snapshota koje piše cron i \`.env\`, i zabranjuje javljanje "pushano" bez provjere izlaza pusha.

Mislim da je to opći oblik pravila koje vrijedi staviti u skill: ne preferencija, nego ono što je jednom umalo pošlo po zlu.

## Što zapravo radi

Pet koraka, redom, autonomno do kraja:

1. **Commit + push kroz svaki repo dirnut u sesiji.** Rad stalno prelazi granice repoa — promjena na backendu, dashboard koji je čita, fetcher koji je hrani — a zadnji je onaj koji zaboraviš. Stageano poimence, semantičke commit poruke čije tijelo objašnjava *zašto*, push provjeren iz izlaza.
2. **Memory fajlovi.** Jedan fakt po fajlu, ažuriraj postojeći umjesto duplikata, samo ono što vrijedi i za buduće sesije.
3. **Znanje koje nije u codebaseu**, u \`docs/YYYY-MM-DD-tema.md\`. Okvir koji taj korak čini upotrebljivim: ne "što smo radili" — to git već zna — nego **"što bi sljedeći prolaz morao ponovno otkriti"**. Odbačene alternative i zašto. Mjerenje koje je odredilo prag. Tihi kvar koji je pojeo poslijepodne.
4. **Handoff prompt u clipboard** *i* ispisan u odgovoru, jer se clipboard do \`/clear\` zna izgubiti.
5. **Sažetak čiji je najvažniji dio ono što je ostalo otvoreno ili neprovjereno.**

\`/clear\` ne može pokrenuti sam. To je ugrađena CLI komanda, pa mi zadnja linija kaže da je utipkam.

## Dva ulaza, namjerno

Možeš ga pozvati kao \`/wrap-up\`. A možeš i dalje tipkati svoju uobičajenu rečenicu: polje \`description:\` sadrži stvarne fraze iz tih 119 varijanti, pa se skill okida sam. Prečac kojeg se moraš sjetiti je prečac koji ćeš zaboraviti — poanta je bila automatizirati naviku, a ne zamijeniti je novom koju treba održavati.

## Drži li vodu

Između 4. i 26. kolovoza 2026. okinuo se **47 puta kroz 11 radnih dana**, u svakom repou koji sam dirao, ne samo u onom u kojem je nastao.

Ono što uklanja nije trud tipkanja. Nego sesija koja završi s dobrim mjerenjem, odbačenim pristupom i razlogom za to, a sve to živi jedino u kontekstu koji se sprema obrisati.

## Izmajniraj svoj

Metoda se prenosi na bilo koji prompt koji stalno pretipkavaš. Prebroji pojavljivanja, dedupliciraj varijante, prebroji koji se koraci javljaju, pa piši skill prema brojkama umjesto prema sjećanju, i stavi stvarne formulacije u \`description:\`.

Dvije zamke, obje su me ugrizle:

- **30-dnevno brisanje je zadano, nije zakon.** Claude Code briše lokalne transkripte nakon 30 dana, ali taj prozor postavlja \`cleanupPeriodDays\` u \`~/.claude/settings.json\` — kod mene stoji \`365\`. Podigni ga *prije* nego što ti povijest zatreba, jer postavka ne vraća ono što je već otišlo. I napravi trajnu kopiju: [dotclaude-sync](https://github.com/stepanic/dotclaude-sync) zrcali cijeli \`~/.claude\` — transkripte, postavke **i memory fajlove** — u dnevni git snapshot i gura ga na privatni remote (kod mene Google Drive). Isti taj arhiv pokreće [statistiku korištenja](/#claude-code) na ovoj stranici.
- **Skill kontaminira vlastite dokaze.** Čim \`description:\` sadrži tvoje okidačke fraze, sadrži ih i svaka sesija koja učita popis skillova, pa naivni grep nabuja. Isto brojanje danas vraća 562 sesije; filtrirano na poruke koje je čovjek doista utipkao, 193. Filtriraj na \`type == "user"\`.

Skill, na engleskom i u hrvatskom originalu, plus skripta za rudarenje: [github.com/stepanic/cv/tree/main/skills/wrap-up](https://github.com/stepanic/cv/tree/main/skills/wrap-up). MIT. Vrijedi kopirati metodu, ne mojih pet koraka.`,
    },
    sources: [
      {
        title: "The skill itself — SKILL.md, the Croatian original and the mining script",
        url: "https://github.com/stepanic/cv/tree/main/skills/wrap-up",
      },
      {
        title: "Claude Code — Agent Skills documentation",
        url: "https://docs.claude.com/en/docs/claude-code/skills",
      },
      {
        title: "dotclaude-sync — daily git snapshots of ~/.claude (transcripts, settings, memory) to a private remote",
        url: "https://github.com/stepanic/dotclaude-sync",
      },
    ],
  },
  {
    slug: "three-years-of-revenuecat-manual-to-agentic",
    date: "2026-06-28",
    tags: ["RevenueCat", "In-App Purchases", "Flutter", "Claude Code", "AI-native"],
    title: {
      en: "Three years of RevenueCat, from docs-in-a-second-tab to an agent shipping the whole paywall",
      hr: "Tri godine RevenueCata, od dokumentacije-u-drugom-tabu do agenta koji isporuči cijeli paywall",
    },
    lead: {
      en: "I've shipped RevenueCat to production across three Flutter apps since 2023. The SDK barely changed; the way I integrate it changed completely — from reading every doc by hand to an agent wiring the entire monetization layer.",
      hr: "RevenueCat isporučujem u produkciju kroz tri Flutter aplikacije od 2023. SDK se jedva mijenjao; način na koji ga integriram promijenio se posve — od ručnog čitanja svake stranice dokumentacije do agenta koji ožiči cijeli sloj naplate.",
    },
    body: {
      en: `I've shipped RevenueCat to production for three years across three Flutter apps. The interesting part isn't the SDK — it's how the *way* I integrate it changed: from reading every doc by hand in 2023, to an agent wiring the entire monetization layer in 2026. \`purchases_flutter\` itself climbed 8.10 → 9.9 → 10.x across the three, but that's the least interesting number here.

## 2023 — the manual era (The Birth Deck)

My first RevenueCat commit is literally named "Setup RevenueCat", dated 15 February 2023, in [The Birth Deck](https://apps.apple.com/us/app/the-birth-deck/id1672044071) — a FlutterFlow app I built for a consulting client. Back then "integration" meant a hand-written wrapper around \`purchases_flutter\` (8.10.1), products configured by clicking around the dashboard, and the docs open in a second tab.

The paywall started granular — individual cards, videos, a birth packing list, two bundles — and over three years collapsed to a single monthly subscription. The last edit (March 2026) is the *only* hand-written commit among ~40 FlutterFlow codegen syncs on those files. That long, messy evolution is the honest shape of a real subscription product: you don't get the catalogue right on day one.

## 2025 — cross-platform, 100% agent-built (smpltsk)

[smpltsk](https://apps.apple.com/app/smpltsk/id6751039190) is a task app I built end-to-end as the sole engineer for a consulting client — and **83% of its commits (447 of 536) are co-authored by Claude Code**. RevenueCat is the system of record: a ~400-line service over \`purchases_flutter\` (9.9.0), a single \`premium_access\` entitlement, monthly / annual / a capped lifetime tier, [live on Google Play](https://play.google.com/store/apps/details?id=com.smpltsk) and the App Store through the full review gauntlet. The parts I'm proud of are the seams:

- **One paywall, two billing systems.** Mobile (iOS / Android / macOS) goes through RevenueCat; web and desktop fall back to Stripe in the same service, with a Cloud Functions webhook reconciling subscription state into Firestore. The app never has to care which rail a user came in on.
- **Provisioning as code.** A single \`config.json\` is the source of truth, and Node scripts drive App Store Connect (API key), Google Play (service account) and RevenueCat's REST API v2 to create the products — plus a TestStore setup so the whole flow is testable without waiting on store review.

## 2026 — the agentic era (Perfect Training)

The most recent integration — **Perfect Training**, a sports-training app — went in over a two-day Claude Code sprint. As I write this it's in review on both stores (Apple came back with a few details to fix; the Android build has been pending production review for nine days — that part is never fast), so there are no live numbers yet — but the architecture is the most interesting of the three. RevenueCat identity is linked to Firebase Auth (including already-signed-in sessions), and a RevenueCat webhook writes entitlement state into Firestore.

The detail I like most is a security one: the webhook validates the incoming \`app_user_id\` against a strict UID regex *before* it ever touches a Firestore path — so a malicious client can't smuggle a crafted user id to write into someone else's document. It also deep-merges only the subscription fields the server owns, deliberately leaving admin-owned fields (like a manual override) untouched, and gates SANDBOX vs PRODUCTION events. Webhooks act on the real world; the blast radius has to be bounded.

## The thing that closes the arc

This week I installed RevenueCat's own AI Toolkit — their Claude Code plugin plus a hosted MCP server — and went through it skill by skill. It configures the RevenueCat side (apps, products, entitlements, offerings) and reads store product state, but creating the actual products in App Store Connect, Play Console and Stripe still lands on a human. That's the same boundary I hit doing it by hand: the agent reaches a long way, and then there's a seam where the stores don't expose an API and a person steps in.

One security nuance worth knowing if you ship RevenueCat: the publishable SDK key in your app binary is *public* by design — anyone can pull it out of an APK. It identifies the app; it does **not** authorize reading the app's revenue. That's why features like Verified Metrics are explicitly opt-in: identity is not authorization. A good principle to carry into anything agent-facing.

Three apps, three years, one direction of travel: from me reading the docs to an agent writing the integration — with the human still owning the seams the machine can't reach yet.`,
      hr: `RevenueCat isporučujem u produkciju već tri godine, kroz tri Flutter aplikacije. Zanimljiv dio nije SDK — nego kako se *način* na koji ga integriram promijenio: od ručnog čitanja svake stranice dokumentacije 2023., do agenta koji 2026. ožiči cijeli sloj naplate. Sam \`purchases_flutter\` popeo se 8.10 → 9.9 → 10.x kroz te tri aplikacije, ali to je ovdje najmanje zanimljiva brojka.

## 2023. — ručna era (The Birth Deck)

Moj prvi RevenueCat commit doslovno se zove "Setup RevenueCat", datiran 15. veljače 2023., u [The Birth Decku](https://apps.apple.com/us/app/the-birth-deck/id1672044071) — FlutterFlow aplikaciji koju sam izradio za konzultantskog klijenta. Tada je "integracija" značila ručno napisan wrapper oko \`purchases_flutter\` (8.10.1), produkte konfigurirane klikanjem po dashboardu i dokumentaciju otvorenu u drugom tabu.

Paywall je krenuo granularno — pojedinačne kartice, videi, popis za bolnicu, dva bundlea — i kroz tri godine se sveo na jednu mjesečnu pretplatu. Zadnja izmjena (ožujak 2026.) *jedini* je ručno napisan commit među ~40 FlutterFlow codegen syncova na tim datotekama. Ta duga, neuredna evolucija pošten je oblik stvarnog pretplatničkog proizvoda: katalog ne pogodiš prvi dan.

## 2025. — cross-platform, 100% agentski (smpltsk)

[smpltsk](https://apps.apple.com/app/smpltsk/id6751039190) je task aplikacija koju sam izradio od početka do kraja kao jedini inženjer za konzultantskog klijenta — i **83% njezinih commitova (447 od 536) co-authored je s Claude Codeom**. RevenueCat je sustav istine: servis od ~400 linija nad \`purchases_flutter\` (9.9.0), jedan \`premium_access\` entitlement, mjesečna / godišnja / ograničena doživotna razina, [živo na Google Playu](https://play.google.com/store/apps/details?id=com.smpltsk) i App Storeu kroz cijeli review. Najponosniji sam na šavove:

- **Jedan paywall, dva sustava naplate.** Mobitel (iOS / Android / macOS) ide kroz RevenueCat; web i desktop padaju na Stripe u istom servisu, a Cloud Functions webhook usklađuje stanje pretplate u Firestore. Aplikaciju ne zanima kojom je prugom korisnik ušao.
- **Provisioning kao kod.** Jedan \`config.json\` je izvor istine, a Node skripte voze App Store Connect (API ključ), Google Play (service account) i RevenueCat REST API v2 da kreiraju produkte — plus TestStore setup da je cijeli tok testabilan bez čekanja na store review.

## 2026. — agentska era (Perfect Training)

Najnovija integracija — **Perfect Training**, aplikacija za sportski trening — ušla je u dvodnevnom Claude Code sprintu. Dok ovo pišem, u review je na obje trgovine (Apple je vratio par detalja za popraviti; Android build već devet dana čeka produkcijski review — taj dio nikad nije brz), pa još nema živih brojki — ali arhitektura je najzanimljivija od sve tri. RevenueCat identitet vezan je uz Firebase Auth (uključujući već prijavljene sesije), a RevenueCat webhook upisuje stanje entitlementa u Firestore.

Detalj koji najviše volim sigurnosni je: webhook validira dolazni \`app_user_id\` strogim UID regexom *prije* nego što dotakne ijednu Firestore putanju — pa zlonamjerni klijent ne može prokrijumčariti izmišljeni user id da piše u tuđi dokument. Uz to deep-merge dira samo polja pretplate u vlasništvu servera, namjerno ostavljajući polja u vlasništvu admina (poput ručnog override-a) netaknutima, i razdvaja SANDBOX od PRODUCTION događaja. Webhookovi djeluju na stvarni svijet; domet štete mora biti omeđen.

## Što zatvara luk

Ovaj tjedan sam instalirao RevenueCatov vlastiti AI Toolkit — njihov Claude Code plugin plus hostani MCP server — i prošao ga skill po skill. Konfigurira RevenueCat stranu (apps, produkte, entitlemente, offeringe) i čita stanje store produkata, ali kreiranje samih produkata na App Store Connectu, Play Consoleu i Stripeu i dalje pada na čovjeka. To je ista granica na koju sam naišao radeći ručno: agent doseže jako daleko, a onda dođe šav gdje trgovine ne nude API i čovjek uskoči.

Jedna sigurnosna nijansa koju vrijedi znati ako isporučuješ RevenueCat: publishable SDK ključ u binaryju aplikacije *javan* je po dizajnu — svatko ga može izvući iz APK-a. On identificira aplikaciju; **ne** ovlašćuje čitanje njezine zarade. Zato su značajke poput Verified Metrics izrijekom opt-in: identitet nije autorizacija. Dobar princip za sve što je okrenuto agentima.

Tri aplikacije, tri godine, jedan smjer kretanja: od mene koji čitam dokumentaciju do agenta koji piše integraciju — uz čovjeka koji i dalje drži šavove do kojih stroj još ne doseže.`,
    },
    sources: [
      {
        title: "RevenueCat AI Toolkit — Claude Code plugin + MCP server",
        url: "https://github.com/RevenueCat/ai-toolkit",
      },
      {
        title: "RevenueCat MCP server — docs",
        url: "https://www.revenuecat.com/docs/tools/mcp",
      },
      {
        title: "smpltsk — App Store",
        url: "https://apps.apple.com/app/smpltsk/id6751039190",
      },
      {
        title: "The Birth Deck — App Store",
        url: "https://apps.apple.com/us/app/the-birth-deck/id1672044071",
      },
      {
        title: "RevenueCat Verified Metrics — trustless live revenue proof",
        url: "https://www.revenuecat.com/verified",
      },
    ],
  },
  {
    slug: "claude-code-limit-increases-2026",
    date: "2026-06-27",
    tags: ["Claude Code", "Anthropic", "AI-native"],
    title: {
      en: "Why my Claude Code token count exploded in 2026 — and what Anthropic changed",
      hr: "Zašto mi je broj Claude Code tokena eksplodirao 2026. — i što je Anthropic promijenio",
    },
    lead: {
      en: "Of 10.8B tokens processed with Claude Code, almost all landed in the last three months. It looks like a late start. It isn't — here's what actually happened.",
      hr: "Od 10,8 milijardi tokena obrađenih Claude Codeom, gotovo svi su pali u zadnja tri mjeseca. Izgleda kao kasni početak. Nije — evo što se stvarno dogodilo.",
    },
    body: {
      en: `My public [usage stats](/#claude-code) show something that looks suspicious at first glance: of **10.8B tokens** processed with Claude Code, the overwhelming majority landed in the last three months. May 2026 alone was 3.9B tokens; June, 5.9B. Before April 2026 the bars are slivers.

I have used Claude Code daily since April 2025, and spent real money on Anthropic the whole time — **€1,662 across 16 months** of invoices, peaking at €180/mo from July to November 2025. So why does the telemetry look like I only just started?

Three reasons, and one of them is a genuine product shift worth writing down.

## 1. Anthropic massively raised Claude Code limits in May 2026

This is the headline. In a few weeks Anthropic roughly doubled what a paying user can run:

- **6 May 2026** — the 5-hour usage caps were **doubled** for Pro, Max, Team and seat-based Enterprise, and the peak-hour reductions were removed entirely.
- **13 May 2026** — **weekly** limits were raised by a further **50%**, in effect through 13 July 2026.
- For Max specifically, the weekly Opus budget moved from ~50h to ~75h (Max 5×) and ~200h to ~300h (Max 20×).

The extra capacity came from Anthropic's compute agreement with SpaceX — the Colossus 1 data center, 300+ MW and 220,000+ GPUs.

The effect on my own numbers is unmistakable: the May→June jump lines up exactly with these changes. A higher ceiling simply lets me burn far more per week than was ever possible before.

## 2. "Tokens" is 97% cache reads

A token count is not a measure of effort. Of my 10.8B, **96.9% are cache-read tokens** — the context Claude Code re-reads on every agentic turn. Actual input is 0.1%, output 0.5%. So the number tracks *agentic intensity* — long sessions, large contexts, thousands of tool calls — which is exactly what scaled up once the limits did.

## 3. The early years are simply missing

The deeper reason the chart skews recent: most of my 2025 telemetry is **gone**. A timestamp-less legacy history format, a July 2025 corruption event, and automated backups that only began in 2026. My *spend* from that era is documented; my *tokens* are not. The chart cannot show what was never saved.

And the pruning is not just history — it is live. Reconstructing daily spend from the backup shows **~$9.3k** of API-equivalent usage over the last 90 days, but a local-only monitor (CodexBar reads only \`~/.claude\`, which Claude Code prunes after 30 days) would see just **~$6.0k** of it. The other **~$3.3k** survives only because the [dotclaude-sync](https://github.com/stepanic/dotclaude-sync) backup stitched the pruned transcripts back together — the same reconstruction that now drives the [daily-spend chart](/#claude-code).

So the recency is real ramp **+** raised limits **+** an accounting quirk **+** lost history — not a late start. The full, sourced breakdown lives on the [stats page](/#claude-code).`,
      hr: `Moja javna [statistika korištenja](/#claude-code) na prvi pogled izgleda sumnjivo: od **10,8 milijardi tokena** obrađenih Claude Codeom, ogromna većina pala je u zadnja tri mjeseca. Samo svibanj 2026. bio je 3,9 milijardi tokena; lipanj 5,9 milijardi. Prije travnja 2026. stupci su tek mrvice.

Claude Code koristim svakodnevno od travnja 2025. i cijelo vrijeme trošim stvaran novac na Anthropic — **€1.662 kroz 16 mjeseci** računa, s vrhuncem od €180/mj od srpnja do studenoga 2025. Pa zašto telemetrija izgleda kao da sam tek počeo?

Tri razloga, a jedan od njih je stvarna promjena proizvoda koju vrijedi zapisati.

## 1. Anthropic je u svibnju 2026. drastično podigao Claude Code limite

To je glavna vijest. U nekoliko tjedana Anthropic je otprilike udvostručio ono što plaćeni korisnik može pokrenuti:

- **6. svibnja 2026.** — 5-satni capovi **udvostručeni** za Pro, Max, Team i seat-based Enterprise, a peak-hour smanjenja potpuno maknuta.
- **13. svibnja 2026.** — **tjedni** limiti podignuti za dodatnih **50%**, na snazi do 13. srpnja 2026.
- Konkretno za Max, tjedni Opus budžet pomaknuo se s ~50h na ~75h (Max 5×) i s ~200h na ~300h (Max 20×).

Dodatni kapacitet došao je iz Anthropicovog compute dogovora sa SpaceX-om — data centar Colossus 1, 300+ MW i 220.000+ GPU-ova.

Učinak na moje brojke je nedvojben: skok svibanj→lipanj poklapa se točno s ovim promjenama. Viši strop jednostavno mi omogućuje da potrošim daleko više tjedno nego ikad prije.

## 2. "Tokeni" su 97% cache readova

Broj tokena nije mjera truda. Od mojih 10,8 milijardi, **96,9% su cache-read tokeni** — kontekst koji Claude Code iznova čita u svakom agentic koraku. Stvarni input je 0,1%, output 0,5%. Dakle brojka prati *agentic intenzitet* — duge sessije, velike kontekste, tisuće tool callova — što je upravo ono što je naraslo čim su narasli limiti.

## 3. Ranije godine jednostavno nedostaju

Dublji razlog zašto graf naginje recentnom: većina moje telemetrije iz 2025. je **nestala**. Legacy format povijesti bez timestampova, korupcija datoteka u srpnju 2025. i automatski backupi koji su krenuli tek 2026. Moja *potrošnja* iz te ere je dokumentirana; moji *tokeni* nisu. Graf ne može prikazati ono što nikad nije spremljeno.

A pruniranje nije samo povijest — događa se i uživo. Rekonstrukcija dnevne potrošnje iz backupa pokazuje **~$9,3k** API-ekvivalentne potrošnje u zadnjih 90 dana, ali lokalni monitor (CodexBar čita samo \`~/.claude\`, koji Claude Code briše nakon 30 dana) vidio bi tek **~$6,0k** toga. Preostalih **~$3,3k** preživi jedino zato što je [dotclaude-sync](https://github.com/stepanic/dotclaude-sync) backup spojio izbrisane transkripte — ista rekonstrukcija koja sad pokreće [graf dnevne potrošnje](/#claude-code).

Dakle recentnost je stvarni rast **+** podignuti limiti **+** računovodstveni artefakt **+** izgubljena povijest — a ne kasni početak. Potpuna, izvorima potkrijepljena razrada je na [stranici statistike](/#claude-code).`,
    },
    sources: [
      {
        title: "Anthropic — Higher usage limits & a compute deal with SpaceX",
        url: "https://www.anthropic.com/news/higher-limits-spacex",
      },
      {
        title: "9to5Google — Claude Code usage limits doubled (6 May 2026)",
        url: "https://9to5google.com/2026/05/06/claude-code-is-getting-higher-usage-limits-doubled-for-most-users/",
      },
      {
        title: "Apidog — Claude Code weekly limits +50% through July 2026",
        url: "https://apidog.com/blog/claude-code-weekly-limits-50-percent-increase-july-2026/",
      },
      {
        title: "morphllm — Claude Code usage limits (2026)",
        url: "https://www.morphllm.com/claude-code-usage-limits",
      },
      {
        title: "Daily spend reconstruction & the 30-day blind spot (this repo)",
        url: "https://github.com/stepanic/cv/blob/main/docs/claude-code-daily-reconstruction-2026.md",
      },
    ],
  },
];
