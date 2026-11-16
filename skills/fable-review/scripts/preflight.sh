#!/usr/bin/env bash
# Deterministic pre-flight and scope analyzer for /fable-review on any git repository.
# Usage: ~/.claude/skills/fable-review/scripts/preflight.sh [repo_path]

set -euo pipefail

REPO="${1:-$(pwd)}"
if ! git -C "$REPO" rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "ERROR: '$REPO' is not a git repository." >&2
  exit 1
fi

ROOT="$(git -C "$REPO" rev-parse --show-toplevel)"
NAME="$(basename "$ROOT")"
BRANCH="$(git -C "$ROOT" symbolic-ref --short HEAD 2>/dev/null || git -C "$ROOT" rev-parse --short HEAD)"
HEAD_SHA="$(git -C "$ROOT" rev-parse --short HEAD)"
REMOTE_URL="$(git -C "$ROOT" remote get-url origin 2>/dev/null || echo "no-origin")"

echo "=================================================================="
echo "FABLE REVIEW PRE-FLIGHT: $NAME"
echo "=================================================================="
echo "Root:        $ROOT"
echo "Branch/HEAD: $BRANCH ($HEAD_SHA)"
echo "Origin:      $REMOTE_URL"

# 1. Count tracked text source lines in a single pass (excluding lockfiles, build outputs, vendor)
LOC_INFO="$({ git -C "$ROOT" grep -I -c '' -- . \
  ':!package-lock.json' ':!**/package-lock.json' \
  ':!yarn.lock' ':!**/yarn.lock' \
  ':!pnpm-lock.yaml' ':!**/pnpm-lock.yaml' \
  ':!pubspec.lock' ':!**/pubspec.lock' \
  ':!Cargo.lock' ':!**/Cargo.lock' \
  ':!*.min.js' ':!*.min.css' ':!*.svg' ':!*.map' \
  ':!dist/**' ':!**/dist/**' ':!build/**' ':!**/build/**' \
  ':!node_modules/**' ':!.next/**' 2>/dev/null || true; } | awk -F: '{files++; lines+=$NF} END {printf "%d files, %d lines", files+0, lines+0}')"
TOTAL_LINES="$(echo "$LOC_INFO" | awk '{print $3}')"
echo "Size:        $LOC_INFO (tracked text files)"

# 2. Detect tech stack & read-only ground-check oracles
echo ""
echo "--- DETECTED STACK & GROUND-CHECK ORACLES ---"
FOUND_STACK=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  rel="${f#$ROOT/}"
  dir="$(dirname "$rel")"
  case "$(basename "$f")" in
    package.json)
      FOUND_STACK=1
      echo "  [Node/TS] $rel -> cd \"$ROOT/$dir\" && npm test / npx tsc --noEmit"
      ;;
    pubspec.yaml)
      FOUND_STACK=1
      echo "  [Flutter/Dart] $rel -> cd \"$ROOT/$dir\" && flutter analyze && flutter test"
      ;;
    Cargo.toml)
      FOUND_STACK=1
      echo "  [Rust] $rel -> cd \"$ROOT/$dir\" && cargo check && cargo test"
      ;;
    pyproject.toml)
      FOUND_STACK=1
      echo "  [Python] $rel -> cd \"$ROOT/$dir\" && pytest / ruff check"
      ;;
    foundry.toml)
      FOUND_STACK=1
      echo "  [Solidity/Foundry] $rel -> cd \"$ROOT/$dir\" && forge build && forge test"
      ;;
    wrangler.jsonc|wrangler.toml)
      FOUND_STACK=1
      echo "  [Cloudflare Worker] $rel"
      ;;
  esac
done < <(find "$ROOT" -maxdepth 3 \( -name "package.json" -o -name "pubspec.yaml" -o -name "Cargo.toml" -o -name "pyproject.toml" -o -name "foundry.toml" -o -name "wrangler.jsonc" -o -name "wrangler.toml" \) -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | sort)
if [ "$FOUND_STACK" -eq 0 ]; then
  echo "  (No standard manifest detected at depth <= 3)"
fi

# 3. Previous Fable audits / tags / review docs
echo ""
echo "--- PRIOR REVIEWS IN THIS REPO ---"
LAST_TAG="$(git -C "$ROOT" tag -l 'audit-*' --sort=-creatordate | head -n 1 || true)"
if [ -n "$LAST_TAG" ]; then
  TAG_SHA="$(git -C "$ROOT" rev-list -n 1 "$LAST_TAG" | cut -c1-7)"
  COMMITS_SINCE="$(git -C "$ROOT" rev-list --count "${LAST_TAG}..HEAD")"
  echo "  Last audit tag: $LAST_TAG ($TAG_SHA) -> $COMMITS_SINCE new commits since tag"
else
  echo "  Last audit tag: (none)"
fi

EXISTING_DOCS="$(find "$ROOT" -maxdepth 4 -type f -name "*.md" \( -path "*/docs/review*" -o -path "*/docs/refactor*" -o -path "*/docs/security*" -o -path "*/docs/codebase-audit*" -o -iname "*fable*" -o -iname "*pregled-koda*" \) -not -path "*/node_modules/*" 2>/dev/null | sed "s|^$ROOT/||" | sort || true)"
if [ -n "$EXISTING_DOCS" ]; then
  echo "  Existing review documents:"
  echo "$EXISTING_DOCS" | sed 's/^/    - /'
else
  echo "  Existing review documents: (none)"
fi

# 4. Commits in last 7 days & Co-Authored-By model attribution
echo ""
echo "--- GIT ACTIVITY & MODEL ATTRIBUTION ---"
RECENT_7D="$(git -C "$ROOT" rev-list --count --since="7 days ago" HEAD 2>/dev/null || echo 0)"
echo "  Commits in last 7 days: $RECENT_7D"
echo "  Top Co-Authored-By trailers (full history):"
{ git -C "$ROOT" log --format='%(trailers:key=Co-Authored-By,valueonly)' 2>/dev/null || true; } | sed '/^$/d' | sed 's/ <.*//' | sort | uniq -c | sort -nr | head -n 6 | sed 's/^/    /'

# 5. REVIEW(fable) markers in code
echo ""
echo "--- REVIEW MARKERS IN CODE ---"
MARKERS="$(git -C "$ROOT" grep -nI -E 'REVIEW\(fable\)|TODO\(fable\)|⚠️ REVIEW' -- . ':!docs/' 2>/dev/null | head -n 20 || true)"
if [ -n "$MARKERS" ]; then
  echo "$MARKERS" | sed 's/^/    /'
else
  echo "  (No explicit REVIEW(fable) markers in source files)"
fi

# 6. Cost estimation & Mode recommendation
echo ""
echo "--- COST ESTIMATE (Two-Pass: Sonnet 5.5 Map -> Fable 5.1 Verification) ---"
if [ "${TOTAL_LINES:-0}" -lt 10000 ]; then
  EST_SONNET="\$0.50 - \$1.50"
  EST_FABLE="\$1.50 - \$3.50"
  EST_CALLS="10 - 18"
elif [ "${TOTAL_LINES:-0}" -lt 50000 ]; then
  EST_SONNET="\$1.50 - \$3.00"
  EST_FABLE="\$3.00 - \$6.00"
  EST_CALLS="15 - 25"
else
  EST_SONNET="\$2.50 - \$4.50"
  EST_FABLE="\$5.00 - \$9.00 (split by subsystem in 'full' mode)"
  EST_CALLS="20 - 35"
fi
echo "  Pass A (Sonnet 5.5, effort medium, map):    ~$EST_SONNET"
echo "  Pass B (Fable 5.1, effort medium, verify):  ~$EST_FABLE ($EST_CALLS calls, context <150k)"
if [ -n "$LAST_TAG" ] || [ -n "$EXISTING_DOCS" ]; then
  echo "  Recommended default mode: 'diff' (for recent changes) or 'security' / 'refactor'"
else
  echo "  Recommended default mode: 'refactor' or 'full' (first Fable pass on this repo)"
fi
echo "=================================================================="
