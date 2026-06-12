#!/usr/bin/env bash
# Refresh data/generated/claude-code-stats.json from the local ~/.claude dir.
# PRIVACY: emits aggregate numbers only — counts, sizes and a monthly activity
# histogram. No transcript content, project names or paths ever leave the
# machine. Requires: jq.
set -euo pipefail
cd "$(dirname "$0")/.."

CLAUDE_DIR="${CLAUDE_DIR:-$HOME/.claude}"
PROJECTS_DIR="$CLAUDE_DIR/projects"
OUT="data/generated/claude-code-stats.json"

[ -d "$PROJECTS_DIR" ] || { echo "No $PROJECTS_DIR found" >&2; exit 1; }

session_files=$(find "$PROJECTS_DIR" -name '*.jsonl' -not -path '*/memory/*' | wc -l | tr -d ' ')
project_count=$(find "$PROJECTS_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
total_size_mb=$(du -sm "$PROJECTS_DIR" | cut -f1)
total_lines=$(find "$PROJECTS_DIR" -name '*.jsonl' -not -path '*/memory/*' -print0 \
  | xargs -0 cat 2>/dev/null | wc -l | tr -d ' ')

# Session start dates from the first event timestamp inside each transcript
# (file mtimes are unreliable — backup tooling touches them).
dates=$(find "$PROJECTS_DIR" -name '*.jsonl' -not -path '*/memory/*' -print0 \
  | while IFS= read -r -d '' f; do head -5 "$f"; done \
  | jq -r 'select(.timestamp) | .sessionId + " " + .timestamp[0:10]' 2>/dev/null \
  | sort -u -k1,1 | awk '{print $2}' | sort)

oldest=$(echo "$dates" | head -1)
newest=$(echo "$dates" | tail -1)

# Monthly histogram: sessions started per month.
monthly=$(echo "$dates" | cut -c1-7 | uniq -c \
  | awk '{printf "{\"month\":\"%s\",\"sessions\":%d}\n", $2, $1}' | jq -s '.')

# Optional richer aggregates from Claude Code's own stats cache.
cache_extra='null'
if [ -f "$CLAUDE_DIR/stats-cache.json" ]; then
  cache_extra=$(jq '{
    trackedSince: .firstSessionDate,
    computedAt: .lastComputedDate,
    totalMessages, totalSessions,
    longestSessionMessages: .longestSession.messageCount,
    models: (.modelUsage | keys)
  }' "$CLAUDE_DIR/stats-cache.json")
fi

jq -n \
  --arg updated "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --argjson sessionFiles "$session_files" \
  --argjson projects "$project_count" \
  --argjson sizeMb "$total_size_mb" \
  --argjson events "$total_lines" \
  --arg oldest "$oldest" \
  --arg newest "$newest" \
  --argjson monthly "$monthly" \
  --argjson statsCache "$cache_extra" \
  '{
    updated: $updated,
    note: "Aggregate counts from local Claude Code transcripts; no content is published. Transcript figures cover the local retention window (~30 days); statsCache tracks history since Dec 2025.",
    sessionFiles: $sessionFiles,
    retentionWindowDays: 30,
    projects: $projects,
    transcriptSizeMB: $sizeMb,
    transcriptEvents: $events,
    firstSession: $oldest,
    lastSession: $newest,
    monthlySessions: $monthly,
    statsCache: $statsCache
  }' > "$OUT"

echo "Wrote $OUT:"
jq '{sessionFiles, projects, transcriptEvents, firstSession, lastSession}' "$OUT"
