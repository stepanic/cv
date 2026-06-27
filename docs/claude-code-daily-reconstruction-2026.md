# Claude Code — Daily Spend Reconstruction (2026)

**Author:** Matija Stepanić  
**Document generated:** 2026-06-27 15:05:53 CEST (CEST)  
**Scope:** Claude Code only (CLI/agentic). Claude.ai and Anthropic billing are covered in [`claude-usage-history.md`](./claude-usage-history.md).  
**Status:** One-off reconstruction (regenerable — see §6).

> **Why this document exists.** CodexBar (the menu-bar usage monitor) reads only the
> *local* `~/.claude` transcripts, and Claude Code prunes those after
> `cleanupPeriodDays` (default **30**). So any "last 90 days" figure in CodexBar is
> silently truncated to whatever survives locally. The daily git snapshots in
> `~/git/stepanic/dotclaude-backup` predate that pruning, so stitching their history
> back together recovers the **full** record. This document is that recovery, with
> CodexBar-faithful per-model API pricing.

---

## 1. Headline

| Metric | Value | Status |
|--------|-------|--------|
| Coverage span | **2026-01-21 → 2026-06-27** | `[RECONSTRUCTED]` |
| Active days | 79 | `[RECONSTRUCTED]` |
| Total API-equivalent spend | **$9,412.47** | `[ESTIMATED]` |
| Total tokens (in+out+cache) | **10.765B** (10,765,431,033) | `[ESTIMATED]` |
| Priced assistant messages | 62,695 | `[RECONSTRUCTED]` |
| Unique transcript blobs stitched | 3,077 | `[RECONSTRUCTED]` |

> **`[ESTIMATED]`** spend is an *API-list-price equivalent*, not money actually
> charged — these sessions ran under a Claude subscription (Max), so the real
> invoice is far lower. The figure answers "what would this have cost at
> pay-as-you-go API rates," which is how CodexBar reports it.

### The 30-day blind spot, quantified

| Window ending 2026-06-27 | CodexBar (local only) | This reconstruction (backup-stitched) | Recovered |
|---|---|---|---|
| Last 90 days | ≈ $6,044 | **$9,376** | **+$3,332** |

> CodexBar's local data only reached back to ~2026-05-14, so roughly six weeks of
> spend (≈ end-Mar → mid-May) had already been pruned and was invisible to it.

---

## 2. By model (full span)

| Model | API-equiv. USD | Tokens | Priced messages |
|-------|---------------:|-------:|----------------:|
| `claude-opus-4-8` | $4,707.73 | 5.334B | 30,204 |
| `claude-opus-4-7` | $3,602.99 | 4.539B | 22,690 |
| `claude-fable-5` | $868.80 | 0.494B | 2,933 |
| `claude-opus-4-6` | $126.77 | 0.154B | 1,495 |
| `claude-haiku-4-5` | $57.29 | 0.188B | 4,316 |
| `claude-sonnet-4-6` | $48.25 | 0.055B | 1,040 |
| `claude-opus-4-5` | $0.63 | 0.001B | 17 |
| **Total** | **$9,412.47** | **10.765B** | **62,695** |

---

## 3. By month

| Month | Active days | API-equiv. USD | Tokens | Top model (by cost) |
|-------|------------:|---------------:|-------:|---------------------|
| 2026-01 | 2 | $0.81 | 0.002B | `claude-haiku-4-5` |
| 2026-02 | 4 | $2.80 | 0.005B | `claude-opus-4-6` |
| 2026-03 | 5 | $32.78 | 0.031B | `claude-opus-4-6` |
| 2026-04 | 14 | $767.03 | 1.023B | `claude-opus-4-7` |
| 2026-05 | 28 | $3,244.79 | 3.908B | `claude-opus-4-7` |
| 2026-06 | 26 | $5,364.26 | 5.795B | `claude-opus-4-8` |

> **Completeness boundary.** Daily backup snapshots began **2026-05-12**. From
> roughly **mid-April 2026** onward the record is effectively complete (every
> session active inside Claude Code's 30-day window was captured by a snapshot).
> Pre-April months are **fragmentary** — they only retain messages from
> long-running sessions that stayed alive (by file mtime) long enough to appear in
> the first snapshots. So Jan–Mar 2026 here is a *floor*, not those months' true
> totals, and the sharp month-over-month ramp is partly a survivorship artefact.

---

## 4. Daily ledger

> Full machine-readable export: [`data/claude-code-daily-2026.csv`](./data/claude-code-daily-2026.csv)
> and [`data/claude-code-daily-2026.json`](./data/claude-code-daily-2026.json) (per-day, per-model).

| Date | API-equiv. USD | Tokens | Top model |
|------|---------------:|-------:|-----------|
| 2026-01-21 | $0.04 | 0.000B | `claude-haiku-4-5` |
| 2026-01-30 | $0.77 | 0.002B | `claude-haiku-4-5` |
| 2026-02-03 | $0.82 | 0.001B | `claude-opus-4-5` |
| 2026-02-10 | $0.97 | 0.003B | `claude-opus-4-6` |
| 2026-02-19 | $0.15 | 0.000B | `claude-opus-4-6` |
| 2026-02-20 | $0.87 | 0.001B | `claude-opus-4-6` |
| 2026-03-02 | $0.22 | 0.001B | `claude-haiku-4-5` |
| 2026-03-03 | $0.97 | 0.000B | `claude-opus-4-6` |
| 2026-03-09 | $1.53 | 0.003B | `claude-opus-4-6` |
| 2026-03-10 | $15.95 | 0.017B | `claude-opus-4-6` |
| 2026-03-11 | $14.11 | 0.011B | `claude-opus-4-6` |
| 2026-04-10 | $1.72 | 0.002B | `claude-opus-4-6` |
| 2026-04-11 | $19.37 | 0.028B | `claude-opus-4-6` |
| 2026-04-13 | $19.53 | 0.026B | `claude-opus-4-6` |
| 2026-04-14 | $21.41 | 0.022B | `claude-opus-4-6` |
| 2026-04-15 | $21.45 | 0.032B | `claude-opus-4-6` |
| 2026-04-16 | $8.85 | 0.014B | `claude-opus-4-6` |
| 2026-04-17 | $50.18 | 0.076B | `claude-opus-4-7` |
| 2026-04-19 | $64.90 | 0.086B | `claude-opus-4-7` |
| 2026-04-20 | $155.88 | 0.217B | `claude-opus-4-7` |
| 2026-04-21 | $91.70 | 0.119B | `claude-opus-4-7` |
| 2026-04-22 | $68.20 | 0.090B | `claude-opus-4-7` |
| 2026-04-23 | $8.53 | 0.007B | `claude-opus-4-7` |
| 2026-04-29 | $170.85 | 0.241B | `claude-opus-4-7` |
| 2026-04-30 | $64.47 | 0.062B | `claude-opus-4-7` |
| 2026-05-02 | $9.75 | 0.010B | `claude-opus-4-7` |
| 2026-05-04 | $37.69 | 0.047B | `claude-opus-4-7` |
| 2026-05-05 | $47.69 | 0.052B | `claude-opus-4-7` |
| 2026-05-06 | $69.57 | 0.068B | `claude-opus-4-7` |
| 2026-05-07 | $50.26 | 0.062B | `claude-opus-4-7` |
| 2026-05-08 | $105.00 | 0.142B | `claude-opus-4-7` |
| 2026-05-09 | $12.80 | 0.012B | `claude-opus-4-7` |
| 2026-05-10 | $6.09 | 0.006B | `claude-opus-4-7` |
| 2026-05-11 | $46.59 | 0.055B | `claude-opus-4-7` |
| 2026-05-12 | $199.11 | 0.271B | `claude-opus-4-7` |
| 2026-05-13 | $37.96 | 0.049B | `claude-opus-4-7` |
| 2026-05-14 | $44.01 | 0.048B | `claude-opus-4-7` |
| 2026-05-15 | $98.14 | 0.118B | `claude-opus-4-7` |
| 2026-05-16 | $108.60 | 0.129B | `claude-opus-4-7` |
| 2026-05-17 | $222.89 | 0.265B | `claude-opus-4-7` |
| 2026-05-18 | $72.67 | 0.078B | `claude-opus-4-7` |
| 2026-05-19 | $13.73 | 0.007B | `claude-opus-4-7` |
| 2026-05-20 | $249.10 | 0.353B | `claude-opus-4-7` |
| 2026-05-21 | $145.09 | 0.185B | `claude-opus-4-7` |
| 2026-05-22 | $139.39 | 0.181B | `claude-opus-4-7` |
| 2026-05-23 | $61.22 | 0.080B | `claude-opus-4-7` |
| 2026-05-24 | $10.19 | 0.008B | `claude-opus-4-7` |
| 2026-05-25 | $118.57 | 0.127B | `claude-opus-4-7` |
| 2026-05-26 | $386.51 | 0.485B | `claude-opus-4-7` |
| 2026-05-27 | $175.32 | 0.210B | `claude-opus-4-7` |
| 2026-05-28 | $266.71 | 0.343B | `claude-opus-4-7` |
| 2026-05-29 | $246.08 | 0.329B | `claude-opus-4-7` |
| 2026-05-30 | $264.04 | 0.185B | `claude-opus-4-8` |
| 2026-06-01 | $320.25 | 0.383B | `claude-opus-4-8` |
| 2026-06-02 | $224.20 | 0.268B | `claude-opus-4-8` |
| 2026-06-03 | $149.14 | 0.176B | `claude-opus-4-8` |
| 2026-06-05 | $115.05 | 0.144B | `claude-opus-4-8` |
| 2026-06-06 | $113.01 | 0.125B | `claude-opus-4-8` |
| 2026-06-07 | $57.54 | 0.076B | `claude-opus-4-8` |
| 2026-06-08 | $329.03 | 0.452B | `claude-opus-4-8` |
| 2026-06-09 | $350.78 | 0.440B | `claude-opus-4-8` |
| 2026-06-10 | $524.57 | 0.409B | `claude-fable-5` |
| 2026-06-11 | $326.72 | 0.198B | `claude-fable-5` |
| 2026-06-12 | $229.95 | 0.163B | `claude-fable-5` |
| 2026-06-13 | $271.38 | 0.337B | `claude-opus-4-8` |
| 2026-06-14 | $41.50 | 0.048B | `claude-opus-4-8` |
| 2026-06-15 | $254.90 | 0.277B | `claude-opus-4-8` |
| 2026-06-16 | $544.51 | 0.620B | `claude-opus-4-8` |
| 2026-06-17 | $383.08 | 0.457B | `claude-opus-4-8` |
| 2026-06-18 | $167.49 | 0.204B | `claude-opus-4-8` |
| 2026-06-19 | $199.04 | 0.219B | `claude-opus-4-8` |
| 2026-06-20 | $243.65 | 0.249B | `claude-opus-4-8` |
| 2026-06-21 | $1.59 | 0.001B | `claude-opus-4-8` |
| 2026-06-22 | $84.40 | 0.093B | `claude-opus-4-8` |
| 2026-06-23 | $79.47 | 0.083B | `claude-opus-4-8` |
| 2026-06-24 | $11.18 | 0.009B | `claude-opus-4-8` |
| 2026-06-25 | $74.61 | 0.083B | `claude-opus-4-8` |
| 2026-06-26 | $41.70 | 0.042B | `claude-opus-4-8` |
| 2026-06-27 | $225.54 | 0.238B | `claude-opus-4-8` |

> Last day (2026-06-27) is partial — it reflects only transcripts written
> up to generation time, and the most recent backup snapshot may lag live usage.

---

## 5. Relationship to `data/generated/claude-code-stats.json`

That file is the canonical, automated telemetry produced by
`scripts/mine-claude-history.mjs`. This document is a **narrower, independent**
cross-check focused on *daily spend* and reconciled against CodexBar's own
on-screen numbers.

**1-hour cache-creation pricing — now fixed.** CodexBar prices `ephemeral_1h`
cache-creation tokens at **2× the input rate** (only 5-minute cache-creation uses
the flat cache-write rate). The mining script previously priced *all*
cache-creation at the flat rate, which under-counted spend on `opus[1m]` usage
where 1-hour cache dominates. As of this change the script applies the 2× rule,
which moved its canonical total from **~$8,238 → ~$9,294** — in line with this
reconstruction and with CodexBar.

Residual differences are expected and benign:

- **Freshness.** This run merged the backup history with live logs at generation
  time; the canonical job may have run earlier, so per-day totals near "today"
  differ slightly.
- **Coverage.** The canonical job also folds in Claude Code's own
  `stats-cache.json` (which reaches back to Dec 2025), so it reports one extra
  month and a marginally larger session count.

Token totals agree to within ~0.1% (this: 10.765B vs canonical 10.767B);
spend agrees to within ~1% (this: $9,412.47 vs canonical ~$9,294).

---

## 6. How to regenerate

```
# 1. unique transcript blobs across the whole backup history
cd ~/git/stepanic/dotclaude-backup
for sha in $(git rev-list HEAD); do git ls-tree -r "$sha" -- data/projects; done \
  | grep '\.jsonl' | awk '{print $3}' | sort -u > /tmp/blobs.txt
# 2. stream them through CodexBar-faithful pricing, merge with live ~/.claude logs,
#    aggregate per day & per model  (engine.py + reconstruct.py — see session notes)
```

Pricing tables are parsed directly from CodexBar's
`Sources/CodexBarCore/Vendored/CostUsage/CostUsagePricing.swift`, so they track
the app. Day boundaries use the local timezone, matching CodexBar.

---

## 7. Limitations

- **Subscription, not API spend.** USD figures are list-price equivalents (§1).
- **Floor, not ceiling.** The backup begins 2025-05-12; transcripts older than the
  retention window before the *first* snapshot are unrecoverable. The earliest
  data point here (2026-01-21) is the oldest message still present in any snapshot,
  not necessarily the first ever Claude Code use (see `usingSince: 2025-04`).
- **Aggregates only.** No prompt or completion content is read or published.
- **Cache-read dominates tokens.** Most "tokens" are cache reads (cheap); raw
  output tokens are a small fraction. Token counts are not comparable to
  message counts.

*Generated as a one-off analysis; not wired into the automated stats pipeline.*
