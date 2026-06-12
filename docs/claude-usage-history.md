# My Claude Usage History — A Personal Chronology

**Author:** Matija Stepanić
**Document generated:** 2026-06-12
**Status:** Living document (see [Changelog](#11-changelog))
**Purpose:** A factual, source-attributed reconstruction of my usage of Anthropic's
Claude products (Claude.ai / Claude Desktop and Claude Code), maintained as a
permanent public record.

> **Methodology note.** Every figure below is tagged with its verification status:
> **`[VERIFIED]`** = taken directly from a product screenshot or invoice;
> **`[ESTIMATED]`** = a reconstruction or approximation, with the method stated;
> **`[CONTEXT]`** = qualitative/illustrative, not a measured value.
> Where data is missing or unrecoverable, this is stated explicitly rather than
> filled in. This document deliberately avoids unsourced superlatives
> (e.g. percentile rankings) because no official Anthropic user-base benchmark
> is available to support them.

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Data Sources & Verification Status](#2-data-sources--verification-status)
3. [Timeline / Chronology](#3-timeline--chronology)
4. [Anthropic Billing — Full Ledger](#4-anthropic-billing--full-ledger)
5. [Claude.ai (Desktop / Web)](#5-claudeai-desktop--web)
6. [Claude Code](#6-claude-code)
7. [Combined Footprint](#7-combined-footprint)
8. [Usage Themes](#8-usage-themes)
9. [Derived / Efficiency Metrics](#9-derived--efficiency-metrics)
10. [Data Integrity, Gaps & Limitations](#10-data-integrity-gaps--limitations)
11. [Changelog](#11-changelog)

---

## 1. Purpose & Scope

This document reconstructs, as accurately as the surviving data allows, my history
of using Claude across two surfaces:

- **Claude.ai** (the web / desktop chat app, referred to here as *Claude Desktop*)
- **Claude Code** (the CLI / agentic coding tool)

It is intended as a transparent, self-authored record. It quantifies *usage*
(conversations, messages, sessions, tokens) and *spend* (Anthropic invoices). It
does **not** attempt to catalogue the content of private conversations, name third
parties, or publish personal/family details.

**Out of scope by design:** message contents, client data, third-party names,
private personal/health information, and project financials.

---

## 2. Data Sources & Verification Status

| # | Source | Captured | What it provides | Status |
|---|--------|----------|------------------|--------|
| S1 | Claude.ai "Chats" screen | Jan 2026 | Total conversation count (1,290) | `[VERIFIED]` |
| S2 | Anthropic Billing → Invoices | Jun 2026 | Full invoice ledger (38 invoices) | `[VERIFIED]` |
| S3 | Claude Code `/stats` dashboard | ~Jan 2026 | Tokens, sessions, streaks, model | `[VERIFIED]` |
| S4 | Claude Code model breakdown | ~Dec 2025 | Per-model token in/out split | `[VERIFIED]` |
| S5 | Personal log reconstruction | 2026 | Pre-Nov 2025 prompts/projects | `[ESTIMATED]` |
| S6 | Conversation sampling (this analysis) | Jun 2026 | Topic distribution | `[ESTIMATED]` |

> Screenshots S1–S4 are the primary evidence. S5 is my own reconstruction from
> local Claude Code history files (with known gaps, see §10). S6 is an
> approximate thematic breakdown derived from sampling, not an exact tally.

---

## 3. Timeline / Chronology

| Date / Period | Milestone | Source |
|---------------|-----------|--------|
| **2025-02-20** | First recorded Anthropic invoice (€18.00) | S2 `[VERIFIED]` |
| **2025-04** | Began using Claude Code (self-reported start of daily use) | S5 `[ESTIMATED]` |
| **2025-05 → 2025-07** | 18 projects, 481 reconstructed prompts, 59 app starts | S5 `[ESTIMATED]` |
| **2025-07** | Local history corruption event (5 corrupted files) | S5 `[ESTIMATED]` |
| **2025-07 → 2025-11** | Highest-tier plan period: €180/mo × 5 = €900 | S2 `[VERIFIED]` |
| **2025-12** | Claude Code session files begin (complete data from here) | S5 `[ESTIMATED]` |
| **2025-12-10** | Most active Claude Code day | S3 `[VERIFIED]` |
| **2026-01** | Claude.ai reaches 1,290 conversations | S1 `[VERIFIED]` |
| **2026-05-27** | Most recent invoice in this ledger (€90.00) | S2 `[VERIFIED]` |
| **2026-06** | Primary model upgraded to Opus 4.8 | self-reported |

---

## 4. Anthropic Billing — Full Ledger

> **All figures `[VERIFIED]` from source S2.** Amounts in EUR. "Total billed"
> is gross of the one partial refund noted below.

### 4.1 Summary

| Metric | Value |
|--------|-------|
| Total invoices | 38 |
| Paid | 37 |
| Partially refunded | 1 (2025-04-20, €22.50) |
| Zero-value (€0.00) invoices | 4 |
| **Total billed (gross)** | **€1,662.58** |
| Billing span | 2025-02-20 → 2026-05-27 (16 months) |
| Average per calendar month | €103.91 |
| Largest single invoice | €180.00 |
| Average billable invoice (>€0) | €48.90 |

### 4.2 Spend by year

| Year | Amount | Share |
|------|--------|-------|
| 2025 (Feb–Dec) | €1,267.92 | 76.3% |
| 2026 (Jan–May) | €394.66 | 23.7% |
| **Total** | **€1,662.58** | 100% |

### 4.3 Observed spending phases

> *Interpretation of the pattern; the amounts are verified, the phase labels are
> my own descriptive grouping `[CONTEXT]`.*

| Phase | Period | Pattern |
|-------|--------|---------|
| Ramp-up | Feb–Jun 2025 | €18 → €105, variable |
| Peak plan | Jul–Nov 2025 | €180/mo × 5 (€900 total) |
| Micro top-ups | Dec 2025 – Feb 2026 | many small €5–€18 charges |
| Stabilized | Mar–May 2026 | ~€88–€90/mo |

### 4.4 Full invoice ledger

| # | Date | Due | Total (€) | Status |
|---|------|-----|-----------|--------|
| 1 | 2026-05-27 | — | 90.00 | Paid |
| 2 | 2026-04-27 | — | 90.00 | Paid |
| 3 | 2026-03-27 | — | 88.66 | Paid |
| 4 | 2026-03-11 | — | 5.00 | Paid |
| 5 | 2026-03-02 | 2026-03-16 | 0.00 | Paid |
| 6 | 2026-02-28 | — | 18.00 | Paid |
| 7 | 2026-02-25 | — | 15.00 | Paid |
| 8 | 2026-02-25 | — | 10.00 | Paid |
| 9 | 2026-02-25 | — | 10.00 | Paid |
| 10 | 2026-02-20 | — | 5.00 | Paid |
| 11 | 2026-02-20 | — | 5.00 | Paid |
| 12 | 2026-02-17 | — | 5.00 | Paid |
| 13 | 2026-02-17 | — | 5.00 | Paid |
| 14 | 2026-02-17 | — | 5.00 | Paid |
| 15 | 2026-02-02 | 2026-02-16 | 0.00 | Paid |
| 16 | 2026-01-30 | — | 5.00 | Paid |
| 17 | 2026-01-29 | — | 18.00 | Paid |
| 18 | 2026-01-19 | — | 5.00 | Paid |
| 19 | 2026-01-15 | — | 5.00 | Paid |
| 20 | 2026-01-08 | — | 5.00 | Paid |
| 21 | 2026-01-07 | — | 5.00 | Paid |
| 22 | 2025-12-29 | — | 18.00 | Paid |
| 23 | 2025-12-01 | 2025-12-15 | 0.00 | Paid |
| 24 | 2025-11-13 | — | 5.00 | Paid |
| 25 | 2025-11-13 | — | 5.00 | Paid |
| 26 | 2025-11-11 | — | 180.00 | Paid |
| 27 | 2025-11-01 | 2025-11-15 | 0.00 | Paid |
| 28 | 2025-10-21 | — | 5.00 | Paid |
| 29 | 2025-10-11 | — | 180.00 | Paid |
| 30 | 2025-09-11 | — | 180.00 | Paid |
| 31 | 2025-08-11 | — | 180.00 | Paid |
| 32 | 2025-07-11 | — | 180.00 | Paid |
| 33 | 2025-06-11 | — | 104.97 | Paid |
| 34 | 2025-06-06 | — | 90.00 | Paid |
| 35 | 2025-05-06 | — | 81.45 | Paid |
| 36 | 2025-04-20 | — | 22.50 | Partially Refunded |
| 37 | 2025-03-20 | — | 18.00 | Paid |
| 38 | 2025-02-20 | — | 18.00 | Paid |

**Ledger total: €1,662.58** (sum verified programmatically).

---

## 5. Claude.ai (Desktop / Web)

### 5.1 Verified

| Metric | Value | Source |
|--------|-------|--------|
| Total conversations | **1,290** | S1 `[VERIFIED]` (as of Jan 2026) |
| Plan | Pro | S1 `[VERIFIED]` |

> The 1,290 figure is a point-in-time snapshot from January 2026; the current
> total is higher but has not been re-captured for this document.

### 5.2 Estimated context

> `[ESTIMATED]` — The start date of Claude.ai usage is **not** independently
> verified. The earliest *billed* activity is Feb 2025 (S2), but free-tier usage
> may predate the first invoice. Any "months of use" figure for Claude.ai should
> be treated as approximate.

---

## 6. Claude Code

### 6.1 Verified — `/stats` dashboard (Source S3)

| Metric | Value |
|--------|-------|
| Favorite model | Opus 4.5 |
| Total tokens | 4.3M |
| Anthropic's comparison | "~16× more tokens than Moby-Dick" |
| Sessions | 103 |
| Longest session | 2 days 14 hours 53 minutes |
| Active days | 30 / 67 |
| Longest streak | 5 days |
| Current streak (at capture) | 0 days |
| Most active day | December 10 |

### 6.2 Verified — Model token breakdown (Source S4)

| Model | Share | Input | Output |
|-------|-------|-------|--------|
| Opus 4.5 | 66.7% | 1.1M | 1.8M |
| Sonnet 4.5 | 33.3% | 58.6K | 1.4M |

Daily-token chart (S4) spans **Nov 10 → Dec 20 2025**, peaking at **~396K tokens**
in a single day.

> **Note on output ratio.** Sonnet shows ~58.6K input vs ~1.4M output, and Opus
> ~1.1M input vs ~1.8M output. The high output-to-input ratio is consistent with
> a code-generation workflow (short instructions, large generated output).
> `[CONTEXT]`

### 6.3 Reconstructed history (Source S5) — `[ESTIMATED]`

Pre-November 2025 data cannot be fully reconstructed. Reasons:

1. **Old history format** stored prompt text without timestamps.
2. **Corruption event (July 2025):** 5 corrupted files; data only partially readable.
3. **Session files exist only from December 2025** onward.

From the recoverable data I extracted:

| Period | Figure | Status |
|--------|--------|--------|
| May–Jul 2025 | 481 prompts across 18 projects | `[ESTIMATED]` |
| May–Jul 2025 | 59 application "starts" | `[ESTIMATED]` |
| May–Jul 2025 | ~9,600 messages (approx.) | `[ESTIMATED]` |
| From Nov 2025 | **18,286 messages, 101 sessions** (complete) | `[ESTIMATED]`* |

> *The post-Nov 2025 message/session counts come from my own complete local
> records. Note a minor discrepancy in session count between the local records
> (101) and the `/stats` dashboard (103); the ~2-session difference is attributed
> to capture timing.

### 6.4 Claude Code message total

| Component | Messages | Status |
|-----------|----------|--------|
| Documented (Nov 2025 →) | 18,286 | `[ESTIMATED]`* |
| Estimated (May–Jul 2025) | ~9,600 | `[ESTIMATED]` |
| **Accounted subtotal** | **~27,886** | — |
| Undocumented gaps (Apr 2025; Aug–Oct 2025) | unknown | not estimated |

> The true total is **at least ~27,900** and plausibly higher once the
> undocumented gaps are included. I intentionally do **not** invent a number for
> the gaps.

---

## 7. Combined Footprint

> Units differ between surfaces — Claude.ai is counted in **conversations**,
> Claude Code in **messages**. They are reported separately to avoid a misleading
> single total.

| Surface | Unit | Count | Status |
|---------|------|-------|--------|
| Claude.ai | conversations | 1,290 | `[VERIFIED]` |
| Claude Code | messages | ~27,900+ | `[ESTIMATED]` |
| Anthropic spend | EUR | €1,662.58 | `[VERIFIED]` |

```
┌──────────────────────────────────────────────────────────┐
│  CLAUDE FOOTPRINT (as documented in this record)         │
├──────────────────────────────────────────────────────────┤
│  Claude.ai conversations ......... 1,290      [VERIFIED]  │
│  Claude Code messages ............ ~27,900+   [ESTIMATED] │
│  Claude Code tokens .............. 4.3M       [VERIFIED]  │
│  Total Anthropic spend ........... €1,662.58  [VERIFIED]  │
│  Billing span .................... 16 months  [VERIFIED]  │
│  Avg spend / month ............... €103.91    [VERIFIED]  │
│  Primary model (Jun 2026) ........ Opus 4.8   self-report │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Usage Themes

> `[ESTIMATED]` — Approximate thematic breakdown derived from sampling
> conversation titles/topics, **not** an exact per-conversation classification.
> Percentages are indicative only and sum to ~100% by construction.

```
Blockchain projects                 ███████████░░░░░░░░  ~22%
Flutter development                 █████████░░░░░░░░░░  ~18%
Business strategy & documents       ████████░░░░░░░░░░░  ~16%
E-commerce                          ███████░░░░░░░░░░░░  ~14%
FlutterFlow & Dreamflow (low-code)  ██████░░░░░░░░░░░░░  ~12%
Firebase / backend                  █████░░░░░░░░░░░░░░  ~10%
Personal / general                  ██░░░░░░░░░░░░░░░░░   ~4%
Other tech (AI tooling, MCP, etc.)  ██░░░░░░░░░░░░░░░░░   ~4%
```

Representative project domains (names I have already made public elsewhere):
DOMOVINA, Croatisimo, Perfect Training, Pinka Finance, and ITalk client work.
Specifics of each are intentionally omitted from this public record.

---

## 9. Derived / Efficiency Metrics

> Arithmetic on the figures above. Where an input is estimated, the output is
> equally approximate.

| Metric | Value | Basis |
|--------|-------|-------|
| Avg spend / month | €103.91 | €1,662.58 ÷ 16 mo `[VERIFIED]` |
| Spend ÷ Claude.ai conversation | ≈ €1.29 | gross ÷ 1,290 `[CONTEXT]`† |
| Peak single-day tokens (Claude Code) | ~396K | S4 `[VERIFIED]` |
| Opus : Sonnet token ratio (Claude Code) | ~2 : 1 | S4 `[VERIFIED]` |

> †This is **not** a true per-conversation cost: the €1,662.58 covers *all*
> Anthropic products (Claude.ai subscription, Claude Code, any API usage), so it
> cannot be cleanly attributed to Claude.ai conversations alone. Shown for rough
> scale only.

---

## 10. Data Integrity, Gaps & Limitations

This record is honest about what it cannot show:

- **No verified Claude.ai start date.** First *billed* activity is Feb 2025;
  earlier free usage is plausible but unconfirmed.
- **Pre-Nov 2025 Claude Code data is partial** due to a timestamp-less legacy
  format and a July 2025 corruption event (5 files).
- **Undocumented gaps** (April 2025; Aug–Oct 2025) are left blank, not estimated.
- **Session-count discrepancy** (101 local vs 103 dashboard) is noted, not reconciled away.
- **Topic percentages are sampled estimates**, not exact counts.
- **No percentile / "top X%" claims** are made — Anthropic publishes no user-base
  distribution against which such a claim could be verified, so any earlier
  informal ranking has been deliberately removed.
- **The €1,662.58 total is gross**; one invoice (2025-04-20) was partially
  refunded, so net spend is marginally lower by an unspecified refund amount.
- **Snapshots age.** The 1,290 conversations and the `/stats` figures were true at
  capture and have grown since.

---

## 11. Changelog

| Date | Change |
|------|--------|
| 2026-06-12 | Initial public version. Full billing ledger through 2026-05-27 added; figures re-verified; unsourced percentile/comparison claims removed; verification tags introduced. |

---

*Maintained by Matija Stepanić as a personal, factual usage record. Corrections
welcome via the repository's issue tracker.*
