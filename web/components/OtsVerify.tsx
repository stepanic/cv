"use client";

// Zero-dependency, in-browser OpenTimestamps verifier. On click it:
//   1. fetches the image, computes its SHA-256 with Web Crypto,
//   2. fetches the .ots proof and walks the timestamp tree to the Bitcoin
//      block-header attestation (height + block merkle root),
//   3. queries a public Bitcoin block explorer for that block's real merkle
//      root and confirms it matches.
// No libraries, no calendar trust — the only external call is to a Bitcoin
// block explorer (mempool.space, with blockstream.info as fallback).

import { useState } from "react";
import { BadgeCheck, Loader2, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// \x00OpenTimestamps\x00\x00Proof\x00\xbf\x89\xe2\xe8\x84\xe8\x92\x94
const HEADER_MAGIC = hexToBytes(
  "004f70656e54696d657374616d7073000050726f6f6600bf89e2e884e89294",
);
const BITCOIN_TAG = "0588960d73d71901";
const EXPLORERS = ["https://mempool.space/api", "https://blockstream.info/api"];

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
function toHex(b: Uint8Array): string {
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}
function reverseHex(hex: string): string {
  return (hex.match(/../g) ?? []).reverse().join("");
}
function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}
async function sha256(b: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", b as BufferSource));
}
async function sha1(b: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-1", b as BufferSource));
}

class Reader {
  i = 0;
  constructor(readonly buf: Uint8Array) {}
  byte(): number {
    return this.buf[this.i++]!;
  }
  bytes(n: number) {
    const b = this.buf.subarray(this.i, this.i + n);
    this.i += n;
    return b;
  }
  varuint() {
    let value = 0,
      shift = 0;
    for (;;) {
      const b = this.byte();
      value += (b & 0x7f) * 2 ** shift;
      if ((b & 0x80) === 0) break;
      shift += 7;
    }
    return value;
  }
  varbytes() {
    return this.bytes(this.varuint());
  }
}

type Att = { height: number; merkleRoot: string };

// Walk the timestamp tree (mirrors python-opentimestamps Timestamp.deserialize),
// collecting every Bitcoin block-header attestation found along every branch.
async function walk(r: Reader, msg: Uint8Array, out: Att[]): Promise<void> {
  let tag = r.byte();
  while (tag === 0xff) {
    await step(r, msg, r.byte(), out);
    tag = r.byte();
  }
  await step(r, msg, tag, out);
}

async function step(r: Reader, msg: Uint8Array, tag: number, out: Att[]): Promise<void> {
  if (tag === 0x00) {
    const attTag = toHex(r.bytes(8));
    const payload = r.varbytes();
    if (attTag === BITCOIN_TAG) {
      const height = new Reader(payload).varuint();
      out.push({ height, merkleRoot: toHex(msg) });
    }
    return;
  }
  let next: Uint8Array;
  if (tag === 0xf0) next = concat(msg, r.varbytes()); // append
  else if (tag === 0xf1) next = concat(r.varbytes(), msg); // prepend
  else if (tag === 0x08) next = await sha256(msg); // sha256
  else if (tag === 0x02) next = await sha1(msg); // sha1
  else throw new Error(`unsupported op 0x${tag.toString(16)}`);
  await walk(r, next, out);
}

async function parseOts(buf: Uint8Array): Promise<{ fileHash: string; atts: Att[] }> {
  const r = new Reader(buf);
  for (let i = 0; i < HEADER_MAGIC.length; i++)
    if (r.byte() !== HEADER_MAGIC[i]) throw new Error("not an .ots file");
  r.varuint(); // version
  const op = r.byte(); // file-hash op (0x08 sha256)
  const fileHash = r.bytes(op === 0x02 || op === 0x03 ? 20 : 32);
  const atts: Att[] = [];
  await walk(r, new Uint8Array(fileHash), atts);
  return { fileHash: toHex(fileHash), atts };
}

async function blockInfo(
  height: number,
): Promise<{ merkleRoot: string; timestamp: number; base: string }> {
  let lastErr: unknown;
  for (const base of EXPLORERS) {
    try {
      const hash = (await (await fetch(`${base}/block-height/${height}`)).text()).trim();
      const blk = await (await fetch(`${base}/block/${hash}`)).json();
      return { merkleRoot: blk.merkle_root, timestamp: blk.timestamp, base };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("no explorer reachable");
}

type State =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "ok"; height: number; date: string }
  | { kind: "fail"; reason: string };

export function OtsVerify({ pngUrl, otsUrl }: { pngUrl: string; otsUrl: string }) {
  const { t } = useI18n();
  const [state, setState] = useState<State>({ kind: "idle" });

  async function verify() {
    setState({ kind: "running" });
    try {
      const [pngBuf, otsBuf] = await Promise.all([
        fetch(pngUrl).then((r) => r.arrayBuffer()),
        fetch(otsUrl).then((r) => r.arrayBuffer()),
      ]);
      const fileHash = toHex(await sha256(new Uint8Array(pngBuf)));
      const { fileHash: proofHash, atts } = await parseOts(new Uint8Array(otsBuf));
      if (fileHash !== proofHash) {
        setState({ kind: "fail", reason: t("stats.ranking.verify.failHash") });
        return;
      }
      if (atts.length === 0) {
        setState({ kind: "fail", reason: t("stats.ranking.verify.failNoBtc") });
        return;
      }
      const att = atts.sort((a, b) => a.height - b.height)[0]!;
      const blk = await blockInfo(att.height).catch(() => null);
      if (!blk) {
        setState({ kind: "fail", reason: t("stats.ranking.verify.failNet") });
        return;
      }
      if (reverseHex(att.merkleRoot) !== blk.merkleRoot) {
        setState({ kind: "fail", reason: t("stats.ranking.verify.failMerkle") });
        return;
      }
      const date = new Date(blk.timestamp * 1000)
        .toISOString()
        .replace("T", " ")
        .slice(0, 16);
      setState({ kind: "ok", height: att.height, date });
    } catch (e) {
      setState({
        kind: "fail",
        reason: e instanceof Error ? e.message : t("stats.ranking.verify.failNet"),
      });
    }
  }

  if (state.kind === "ok") {
    return (
      <div className="mt-3 rounded-md border border-accent-border bg-accent-soft p-3 text-xs">
        <p className="flex items-center gap-1.5 font-semibold text-accent-bright">
          <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
          {t("stats.ranking.verify.okPrefix")}
        </p>
        <p className="mt-1 text-inkSoft">
          {t("stats.ranking.verify.okBlock", { height: state.height, date: state.date })}{" "}
          <a
            href={`https://mempool.space/block/${state.height}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-bright underline-offset-2 hover:underline"
          >
            {t("stats.ranking.verify.viewBlock")}
          </a>
        </p>
        <p className="mt-1 text-inkMuted">{t("stats.ranking.verify.okDetail")}</p>
      </div>
    );
  }

  if (state.kind === "fail") {
    return (
      <div className="mt-3 rounded-md border border-line bg-surface p-3 text-xs">
        <p className="flex items-center gap-1.5 font-semibold text-ink">
          <ShieldAlert className="h-4 w-4 shrink-0 text-inkMuted" aria-hidden />
          {state.reason}
        </p>
        <button
          type="button"
          onClick={verify}
          className="mt-1 text-accent-bright underline-offset-2 hover:underline"
        >
          {t("stats.ranking.verify.button")}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={verify}
      disabled={state.kind === "running"}
      className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-inkSoft transition-colors hover:border-accent-border disabled:opacity-70"
    >
      {state.kind === "running" ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          {t("stats.ranking.verify.running")}
        </>
      ) : (
        <>
          <BadgeCheck className="h-3.5 w-3.5 text-accent-bright" aria-hidden />
          {t("stats.ranking.verify.button")}
        </>
      )}
    </button>
  );
}
