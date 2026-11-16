#!/usr/bin/env python3
"""Write every output token of a subagent that can be recovered into one Markdown file.

Usage:
  salvage.py --session <CLAUDE_SESSION_ID> --agent <agentId> --out <dir> [--label pass-b]
  salvage.py --jsonl <path/to/agent-<id>.jsonl> --out <dir> [--label pass-b]

Runs after every Fable subagent, whether it finished, failed, hit a rate limit or was stopped.
Recovered: every text block, every tool call input in full (Write content, Edit old/new strings,
Bash commands, Read/Grep arguments), the final report, model, per-call usage and the cost in USD.
State: `finished` when Claude Code set `"finished": true` in the agent's .meta.json; otherwise
`not finished` (stopped, killed, rate-limited or still running). The last text is titled "Final report"
only when the agent finished and its last call ended with stop_reason `end_turn`.
Not recoverable: thinking. Claude Code stores thinking blocks empty (signature only); their token
count is reported so the loss is visible.
Read-only on the transcript; writes a single file into --out.
"""
import argparse
import glob
import json
import os
import sys
from datetime import datetime, timezone


# USD per million tokens: input, 5-minute cache write, cache read, output. A 1-hour cache write costs 2x input.
# Keyed by model-id prefix; the longest matching prefix wins. Override with --prices in,cw,cr,out.
PRICES = {
    "claude-fable-5": (10.00, 12.50, 0.25, 50.00),
    "claude-opus-5-5": (4.00, 5.00, 0.20, 20.00),
    "claude-sonnet-5-5": (2.00, 2.50, 0.20, 10.00),
}


def price_for(model: str):
    hits = [k for k in PRICES if model.startswith(k)]
    return PRICES[max(hits, key=len)] if hits else None


def find_jsonl(session: str, agent: str) -> str:
    pattern = os.path.expanduser(f"~/.claude/projects/*/{session}/subagents/agent-{agent}.jsonl")
    hits = glob.glob(pattern)
    if not hits:
        sys.exit(f"ERROR: no transcript matches {pattern}")
    return hits[0]


def fence(text: str, lang: str = "") -> str:
    ticks = "```"
    while ticks in text:
        ticks += "`"
    return f"{ticks}{lang}\n{text}\n{ticks}"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--session")
    ap.add_argument("--agent")
    ap.add_argument("--jsonl")
    ap.add_argument("--out", required=True)
    ap.add_argument("--label", default="fable")
    ap.add_argument("--prices", help="override: input,cache_write_5m,cache_read,output in USD per MTok")
    a = ap.parse_args()
    override = None
    if a.prices:
        try:
            override = tuple(float(x) for x in a.prices.split(","))
            assert len(override) == 4
        except (ValueError, AssertionError):
            sys.exit("ERROR: --prices needs four numbers: input,cache_write_5m,cache_read,output")

    path = a.jsonl or (find_jsonl(a.session, a.agent) if a.session and a.agent else None)
    if not path:
        sys.exit("ERROR: give --jsonl, or --session and --agent")
    agent_id = os.path.basename(path).removeprefix("agent-").removesuffix(".jsonl")
    meta_path = path[: -len(".jsonl")] + ".meta.json"
    meta = {}
    try:
        with open(meta_path, encoding="utf-8") as mf:
            loaded = json.load(mf)
        meta = loaded if isinstance(loaded, dict) else {}
    except (OSError, ValueError):
        pass  # missing or truncated meta must not stop the salvage
    finished = meta.get("finished") is True

    per_request, body, models = {}, [], set()
    tot = {"input": 0, "cache_write": 0, "cache_read": 0, "output": 0, "thinking": 0}
    empty_thinking = 0
    last_text = ""
    last_stop = None  # stop_reason of the last assistant line that carries one
    cost, unpriced = 0.0, set()
    req_model = {}

    for line in open(path, encoding="utf-8"):
        try:
            o = json.loads(line)
        except json.JSONDecodeError:
            continue
        if not isinstance(o, dict) or o.get("type") != "assistant":
            continue
        m = o.get("message") or {}
        if not isinstance(m, dict):
            continue
        model = m.get("model", "?")
        models.add(model)
        if m.get("stop_reason"):
            last_stop = m["stop_reason"]
        req = o.get("requestId") or m.get("id") or o.get("uuid")
        u = m.get("usage") or {}
        th = (u.get("output_tokens_details") or {}).get("thinking_tokens", 0)
        cw1h = (u.get("cache_creation") or {}).get("ephemeral_1h_input_tokens", 0) or 0
        row = (o.get("timestamp", "")[:19], u.get("input_tokens", 0), u.get("cache_creation_input_tokens", 0),
               u.get("cache_read_input_tokens", 0), u.get("output_tokens", 0), th, cw1h)
        # One API call spans several transcript lines; the last line carries the final usage.
        if req not in per_request or row[4] >= per_request[req][4]:
            per_request[req] = row
            req_model[req] = model
        for b in m.get("content", []):
            t = b.get("type")
            if t == "text" and b.get("text", "").strip():
                last_text = b["text"]
                body.append(f"### Text ({o.get('timestamp', '')[:19]})\n\n{b['text']}\n")
            elif t == "thinking":
                if b.get("thinking"):
                    body.append(f"### Thinking\n\n{fence(b['thinking'])}\n")
                else:
                    empty_thinking += 1
            elif t == "tool_use":
                name, inp = b.get("name", "?"), b.get("input", {})
                if name == "Write":
                    body.append(f"### Write `{inp.get('file_path')}`\n\n{fence(inp.get('content', ''))}\n")
                elif name == "Edit":
                    body.append(f"### Edit `{inp.get('file_path')}`\n\nold:\n{fence(inp.get('old_string', ''))}\n\n"
                                f"new:\n{fence(inp.get('new_string', ''))}\n")
                elif name == "Bash":
                    body.append(f"### Bash\n\n{fence(inp.get('command', ''), 'bash')}\n")
                else:
                    body.append(f"### {name}\n\n{fence(json.dumps(inp, ensure_ascii=False, indent=1), 'json')}\n")

    for req, row in per_request.items():
        for k, v in zip(tot, row[1:6]):
            tot[k] += v
        p = override or price_for(req_model[req])
        if p is None:
            unpriced.add(req_model[req])
            continue
        _, inp, cw, cr, out_t, _, cw1h = row
        cost += (inp * p[0] + (cw - cw1h) * p[1] + cw1h * 2 * p[0] + cr * p[2] + out_t * p[3]) / 1e6
    calls = sorted(r[:6] for r in per_request.values())
    cost_txt = f"{cost:.2f}" if not unpriced else f"unknown (no price for {', '.join(sorted(unpriced))})"
    state = "finished" if finished else "not finished (no finished flag in .meta.json: stopped, killed, rate-limited or running)"
    is_report = finished and last_stop == "end_turn"

    os.makedirs(a.out, exist_ok=True)
    stamp = datetime.now().strftime("%Y-%m-%d-%H%M")
    out = os.path.join(a.out, f"{stamp}-{a.label}-transcript-{agent_id}.md")
    with open(out, "w", encoding="utf-8") as f:
        f.write(f"# Subagent output: {a.label}\n\n")
        f.write(f"- Transcript: `{path}`\n- Models: {', '.join(sorted(models))}\n")
        f.write(f"- Description: {meta.get('description', '?')}\n- State: {state}; last stop_reason: {last_stop}\n")
        f.write(f"- Saved: {datetime.now(timezone.utc).isoformat(timespec='seconds')}\n")
        f.write(f"- API calls: {len(calls)}; output tokens {tot['output']:,} of which thinking {tot['thinking']:,} "
                f"(not recoverable, {empty_thinking} empty thinking blocks); input {tot['input']:,}, "
                f"cache write {tot['cache_write']:,}, cache read {tot['cache_read']:,}\n")
        f.write(f"- Cost (USD, API prices): {cost_txt}\n\n")
        heading = "## Final report" if is_report else "## Last text before the agent stopped (not a final report)"
        f.write(heading + "\n\n" + (last_text or "(no text: the agent stopped before a final message)") + "\n\n")
        f.write("## Usage per call\n\n| time (UTC) | input | cache write | cache read | output | thinking |\n|---|---|---|---|---|---|\n")
        for r in calls:
            f.write("| " + " | ".join(str(x) for x in r) + " |\n")
        f.write("\n## Every recoverable output, in order\n\n" + "\n".join(body))
    print(out)
    print(f"calls={len(calls)} output={tot['output']} thinking={tot['thinking']} (not recoverable) "
          f"recovered_blocks={len(body)} cost_usd={cost_txt} finished={'yes' if finished else 'no'} last_stop={last_stop}")


if __name__ == "__main__":
    main()
