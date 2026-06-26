# committers.top Croatia ranking — Bitcoin timestamp proofs

Two screenshots of the [committers.top](https://committers.top/croatia_public)
"most active GitHub users in Croatia" board, captured 2026-06-25, each anchored
in the **Bitcoin blockchain** via [OpenTimestamps](https://opentimestamps.org/).
The `.ots` files are the cryptographic proof that the image existed at (or
before) the stamped time — independently verifiable, no trust in me required.

## The two shots

| | Raw board | My fork (exclusion fix deployed) |
|---|---|---|
| Source | [committers.top/croatia_public](https://committers.top/croatia_public) | [stepanic.github.io/committers.top/croatia_public](https://stepanic.github.io/committers.top/croatia_public) |
| My rank | **#1** · 28,611 contributions | **#13** · 2,022 genuine (~27,604 excluded) |
| Captured (CET) | 2026-06-25 17:14:24 | 2026-06-25 17:36:48 |
| Image | [`committers-top-croatia-2026-06-25.png`](../web/public/committers-top-croatia-2026-06-25.png) | [`committers-top-croatia-corrected-2026-06-25.png`](../web/public/committers-top-croatia-corrected-2026-06-25.png) |
| Proof | [`…2026-06-25.png.ots`](../web/public/committers-top-croatia-2026-06-25.png.ots) | [`…corrected-2026-06-25.png.ots`](../web/public/committers-top-croatia-corrected-2026-06-25.png.ots) |
| SHA-256 | `3b31569f8363d8053159516fdb7e6a4d211e2d80fc34591bfca09bf0a50ad01c` | `eed9cd32cac122eeea74fd8f11634ba1b022545857395901e08cbc3c255d8054` |

The raw #1 is an **anomaly**: committers.top counts the bulk commits from the
[`domovinatv/dataset.domovina.tv`](https://github.com/domovinatv/dataset.domovina.tv)
dataset repo. My fork applies an exclusion fix (also up for review upstream as
PRs [ashkulz/committers.top#131](https://github.com/ashkulz/committers.top/pull/131)
and [#132](https://github.com/ashkulz/committers.top/pull/132)), which drops me
to a genuine **#13 with 2,022 real contributions**. The corrected shot — taken
*after* the fix — is the realistic indicator.

The point of timestamping both: prove the #1 screenshot existed *before* the
dataset repo gets excluded from the public board, so the anomaly is on record
rather than a deniable claim.

## Verify it yourself

```sh
pip install opentimestamps-client

# the .ots and .png must sit side by side
ots verify web/public/committers-top-croatia-2026-06-25.png.ots
ots verify web/public/committers-top-croatia-corrected-2026-06-25.png.ots

# inspect the calendar attestations / Bitcoin anchor
ots info web/public/committers-top-croatia-2026-06-25.png.ots
```

Or drag the `.png` + `.ots` pair into <https://opentimestamps.org/>.

## Status — confirmed on-chain ✅

Both proofs are now **permanently anchored in the Bitcoin blockchain**.

- Submitted to OpenTimestamps: 2026-06-25 **15:21 UTC** (raw) / **15:37 UTC**
  (corrected) — i.e. 17:21 / 17:37 CEST.
- First permanent Bitcoin confirmation: block **955363**, mined 2026-06-25
  **17:15:14 UTC** (merkle root `5501939a981545541076d55b0f8307ef0631702844719185d7834639d6cbd772`).
- Elapsed submission → permanent record: **~1h 54m** (raw) / **~1h 38m**
  (corrected).
- Both commitments additionally landed in blocks 955367, 955390 and 955417 via
  the other calendars.

`ots upgrade` has been run and the on-chain `.ots` files committed; `ots verify`
now resolves to the Bitcoin block header attestation with no calendar trust
required.

## Live

Both screenshots and downloadable `.ots` proofs are surfaced in the **Croatia
ranking** block at <https://stepanic.domovina.ai/#stats>.
