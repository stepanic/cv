#!/usr/bin/env python3
"""Write every output token of a subagent that can be recovered into one Markdown file.

Usage:
  salvage.py --session <CLAUDE_SESSION_ID> --agent <agentId> --out <dir> [--label pass-b]
  salvage.py --jsonl <path/to/agent-<id>.jsonl> --out <dir> [--label pass-b]

Runs after every Fable subagent, whether it finished, failed, hit a rate limit or was stopped.
Recovered: every text block, every tool call input in full (Write content, Edit old/new strings,
Bash commands, Read/Grep arguments), the final report, model, and per-call usage.
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
    a = ap.parse_args()

    path = a.jsonl or (find_jsonl(a.session, a.agent) if a.session and a.agent else None)
    if not path:
        sys.exit("ERROR: give --jsonl, or --session and --agent")
    agent_id = os.path.basename(path).removeprefix("agent-").removesuffix(".jsonl")
    meta_path = path[: -len(".jsonl")] + ".meta.json"
    meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {}

    per_request, body, models = {}, [], set()
    tot = {"input": 0, "cache_write": 0, "cache_read": 0, "output": 0, "thinking": 0}
    empty_thinking = 0
    last_text = ""

    for line in open(path, encoding="utf-8"):
        try:
            o = json.loads(line)
        except json.JSONDecodeError:
            continue
        if o.get("type") != "assistant":
            continue
        m = o.get("message", {})
        models.add(m.get("model", "?"))
        req = o.get("requestId") or o.get("uuid")
        u = m.get("usage") or {}
        th = (u.get("output_tokens_details") or {}).get("thinking_tokens", 0)
        row = (o.get("timestamp", "")[:19], u.get("input_tokens", 0), u.get("cache_creation_input_tokens", 0),
               u.get("cache_read_input_tokens", 0), u.get("output_tokens", 0), th)
        # One API call spans several transcript lines; the last line carries the final usage.
        if req not in per_request or row[4] >= per_request[req][4]:
            per_request[req] = row
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

    calls = sorted(per_request.values())
    for row in calls:
        for k, v in zip(tot, row[1:]):
            tot[k] += v

    os.makedirs(a.out, exist_ok=True)
    stamp = datetime.now().strftime("%Y-%m-%d-%H%M")
    out = os.path.join(a.out, f"{stamp}-{a.label}-transcript-{agent_id}.md")
    with open(out, "w", encoding="utf-8") as f:
        f.write(f"# Subagent output: {a.label}\n\n")
        f.write(f"- Transcript: `{path}`\n- Models: {', '.join(sorted(models))}\n")
        f.write(f"- Description: {meta.get('description', '?')}\n- Finished: {meta.get('finished', 'unknown')}\n")
        f.write(f"- Saved: {datetime.now(timezone.utc).isoformat(timespec='seconds')}\n")
        f.write(f"- API calls: {len(calls)}; output tokens {tot['output']:,} of which thinking {tot['thinking']:,} "
                f"(not recoverable, {empty_thinking} empty thinking blocks); input {tot['input']:,}, "
                f"cache write {tot['cache_write']:,}, cache read {tot['cache_read']:,}\n\n")
        f.write("## Final report\n\n" + (last_text or "(no text: the agent stopped before a final message)") + "\n\n")
        f.write("## Usage per call\n\n| time (UTC) | input | cache write | cache read | output | thinking |\n|---|---|---|---|---|---|\n")
        for r in calls:
            f.write("| " + " | ".join(str(x) for x in r) + " |\n")
        f.write("\n## Every recoverable output, in order\n\n" + "\n".join(body))
    print(out)
    print(f"calls={len(calls)} output={tot['output']} thinking={tot['thinking']} (not recoverable) "
          f"recovered_blocks={len(body)} finished={meta.get('finished', 'unknown')}")


if __name__ == "__main__":
    main()
