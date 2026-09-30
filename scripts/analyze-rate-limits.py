#!/usr/bin/env python3
"""
analyze-rate-limits.py

Reconstructs and analyzes token usage, multi-week trends, and rate-limit incidents
from Claude Code transcripts (~/.claude/projects).

Usage:
    python3 scripts/analyze-rate-limits.py [--update-json] [--session <uuid>]
"""

import os
import sys
import json
import argparse
from datetime import datetime, timedelta, timezone
from collections import defaultdict

DEFAULT_CLAUDE_DIR = os.path.expanduser("~/.claude")
DEFAULT_OUT_JSON = os.path.join(os.path.dirname(__file__), "../docs/data/rate-limits-2026-09.json")

# Approximate pricing per 1M tokens (Opus 5 / 5.5 baseline)
# Input: $15, Output: $75, Cache Creation: $18.75, Cache Read: $1.50
COST_INPUT = 15.0 / 1_000_000
COST_OUTPUT = 75.0 / 1_000_000
COST_CACHE_WRITE = 18.75 / 1_000_000
COST_CACHE_READ = 1.50 / 1_000_000

def calc_cost(inp, out, cc, cr):
    return (inp * COST_INPUT) + (out * COST_OUTPUT) + (cc * COST_CACHE_WRITE) + (cr * COST_CACHE_READ)

def parse_arguments():
    parser = argparse.ArgumentParser(description="Analyze Claude Code rate limits and token trends.")
    parser.add_argument("--claude-dir", default=DEFAULT_CLAUDE_DIR, help="Path to ~/.claude directory")
    parser.add_argument("--since", default="2026-08-01", help="Start date (YYYY-MM-DD), default 2026-08-01")
    parser.add_argument("--session", default=None, help="Specific session UUID to analyze in detail")
    parser.add_argument("--update-json", action="store_true", help="Update docs/data/rate-limits-2026-09.json")
    parser.add_argument("--out-json", default=DEFAULT_OUT_JSON, help="Target JSON path when updating")
    return parser.parse_args()

def analyze_all(claude_dir, since_date):
    projects_dir = os.path.join(claude_dir, "projects")
    if not os.path.exists(projects_dir):
        print(f"Error: projects directory not found at {projects_dir}", file=sys.stderr)
        sys.exit(1)

    assistant_turns = []
    rate_limits = []
    daily_stats = defaultdict(lambda: {"turns": 0, "in": 0, "out": 0, "cc": 0, "cr": 0, "models": defaultdict(int)})
    weekly_stats = defaultdict(lambda: {"turns": 0, "in": 0, "out": 0, "cc": 0, "cr": 0, "rate_limits": 0, "models": defaultdict(int)})

    for root, _, files in os.walk(projects_dir):
        for f in files:
            if not f.endswith(".jsonl"):
                continue
            path = os.path.join(root, f)
            proj_name = os.path.basename(root)
            with open(path, "r", encoding="utf-8", errors="ignore") as fp:
                for line in fp:
                    if '"type":"assistant"' in line:
                        try:
                            d = json.loads(line)
                            ts = d.get("timestamp")
                            if not ts or ts < since_date:
                                continue
                            
                            u = d.get("message", {}).get("usage")
                            m = d.get("message", {}).get("model")
                            
                            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                            day = ts[:10]
                            yr, wk, _ = dt.isocalendar()
                            week_key = f"{yr}-W{wk:02d}"
                            
                            if m and m != "<synthetic>":
                                daily_stats[day]["models"][m] += 1
                                weekly_stats[week_key]["models"][m] += 1
                                
                            if u:
                                inp = u.get("input_tokens", 0)
                                out = u.get("output_tokens", 0)
                                cc = u.get("cache_creation_input_tokens", 0)
                                cr = u.get("cache_read_input_tokens", 0)
                                
                                assistant_turns.append((ts, inp, out, cc, cr, m, proj_name, f))
                                
                                daily_stats[day]["turns"] += 1
                                daily_stats[day]["in"] += inp
                                daily_stats[day]["out"] += out
                                daily_stats[day]["cc"] += cc
                                daily_stats[day]["cr"] += cr
                                
                                weekly_stats[week_key]["turns"] += 1
                                weekly_stats[week_key]["in"] += inp
                                weekly_stats[week_key]["out"] += out
                                weekly_stats[week_key]["cc"] += cc
                                weekly_stats[week_key]["cr"] += cr
                                
                            if d.get("error") == "rate_limit" or "rateLimitType" in d.get("quotaLimits", {}):
                                ql = d.get("quotaLimits", {})
                                rl_type = ql.get("rateLimitType") or "five_hour"
                                resetsAt = ql.get("resetsAt")
                                weekly_stats[week_key]["rate_limits"] += 1
                                rate_limits.append({
                                    "timestamp": ts,
                                    "type": rl_type,
                                    "resetsAt": resetsAt,
                                    "project": proj_name,
                                    "file": f
                                })
                        except Exception:
                            pass

    assistant_turns.sort(key=lambda x: x[0])
    rate_limits.sort(key=lambda x: x["timestamp"])

    # Deduplicate rate limits (>3h apart)
    distinct_rl = []
    for r in rate_limits:
        if not distinct_rl:
            distinct_rl.append(r)
        else:
            t_curr = datetime.fromisoformat(r["timestamp"].replace("Z", "+00:00"))
            t_prev = datetime.fromisoformat(distinct_rl[-1]["timestamp"].replace("Z", "+00:00"))
            if (t_curr - t_prev).total_seconds() > 3600 * 3:
                distinct_rl.append(r)

    # Compute 5h window for each distinct rate limit
    enriched_rl = []
    for r in distinct_rl:
        ts_end = r["timestamp"]
        dt_end = datetime.fromisoformat(ts_end.replace("Z", "+00:00"))
        dt_start = dt_end - timedelta(hours=5)
        ts_start = dt_start.isoformat().replace("+00:00", "Z")
        
        w_turns, w_in, w_out, w_cc, w_cr = 0, 0, 0, 0, 0
        w_models = defaultdict(int)
        
        for t_ts, t_in, t_out, t_cc, t_cr, t_m, _, _ in assistant_turns:
            if ts_start <= t_ts <= ts_end:
                w_turns += 1
                w_in += t_in
                w_out += t_out
                w_cc += t_cc
                w_cr += t_cr
                if t_m:
                    w_models[t_m] += 1
            elif t_ts > ts_end:
                break
                
        cost = calc_cost(w_in, w_out, w_cc, w_cr)
        enriched_rl.append({
            "timestamp": ts_end,
            "type": r["type"],
            "resetsAt": r["resetsAt"],
            "project": r["project"],
            "file": r["file"],
            "window_5h_turns": w_turns,
            "window_5h_input_tokens": w_in,
            "window_5h_output_tokens": w_out,
            "window_5h_cache_create_tokens": w_cc,
            "window_5h_cache_read_tokens": w_cr,
            "window_5h_est_cost_usd": round(cost, 2),
            "dominant_models": dict(w_models)
        })

    return daily_stats, weekly_stats, enriched_rl

def print_tables(weekly_stats, enriched_rl):
    print("\n" + "=" * 95)
    print("WEEKLY AGGREGATES (Tokens & Limits)")
    print("=" * 95)
    print(f"{'Week':10} | {'Turns':>8} | {'Output Tok':>12} | {'CacheWrite':>12} | {'CacheRead':>14} | {'Est Cost':>10} | {'Rate Limits':>11}")
    print("-" * 95)
    for wk in sorted(weekly_stats.keys()):
        w = weekly_stats[wk]
        cost = calc_cost(w["in"], w["out"], w["cc"], w["cr"])
        print(f"{wk:10} | {w['turns']:8,d} | {w['out']:12,d} | {w['cc']:12,d} | {w['cr']:14,d} | ${cost:9.2f} | {w['rate_limits']:11,d}")

    print("\n" + "=" * 95)
    print("HISTORICAL 5-HOUR CUTOFF THRESHOLDS (Preceding each block)")
    print("=" * 95)
    print(f"{'Incident Timestamp':20} | {'Type':9} | {'Turns':>7} | {'Out Tokens':>12} | {'CacheRead':>13} | {'Est Cost':>9}")
    print("-" * 95)
    for r in enriched_rl:
        print(f"{r['timestamp'][:19]:20} | {r['type'][:9]:9} | {r['window_5h_turns']:7,d} | {r['window_5h_output_tokens']:12,d} | {r['window_5h_cache_read_tokens']:13,d} | ${r['window_5h_est_cost_usd']:8.2f}")

def main():
    args = parse_arguments()
    daily_stats, weekly_stats, enriched_rl = analyze_all(args.claude_dir, args.since)
    print_tables(weekly_stats, enriched_rl)

    if args.update_json:
        out_path = os.path.abspath(args.out_json)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        
        # Prepare json structure
        daily_fmt = {
            d: {
                "turns": st["turns"], "input": st["in"], "output": st["out"],
                "cache_write": st["cc"], "cache_read": st["cr"],
                "est_cost_usd": round(calc_cost(st["in"], st["out"], st["cc"], st["cr"]), 2),
                "models": dict(st["models"])
            }
            for d, st in sorted(daily_stats.items())
        }
        weekly_fmt = {
            w: {
                "turns": st["turns"], "input": st["in"], "output": st["out"],
                "cache_write": st["cc"], "cache_read": st["cr"],
                "est_cost_usd": round(calc_cost(st["in"], st["out"], st["cc"], st["cr"]), 2),
                "rate_limits": st["rate_limits"],
                "models": dict(st["models"])
            }
            for w, st in sorted(weekly_stats.items())
        }
        payload = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "description": "Multi-week token consumption and rate-limit threshold analysis from ~/.claude/projects",
            "weekly_trends": weekly_fmt,
            "daily_trends": daily_fmt,
            "distinct_rate_limit_incidents": enriched_rl
        }
        with open(out_path, "w", encoding="utf-8") as fp:
            json.dump(payload, fp, indent=2)
        print(f"\n[OK] Updated JSON saved to: {out_path}")

if __name__ == "__main__":
    main()
