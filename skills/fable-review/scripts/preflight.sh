#!/usr/bin/env bash
# Deterministic pre-flight for /fable-review. Read-only: never writes to the repo.
# Usage: preflight.sh [repo_path] [--mode diff|refactor|security|full|forensic]
#
# Own-owner list (repos whose reviews may be committed and pushed):
#   $FABLE_REVIEW_OWN_OWNERS (space/comma separated) or ~/.config/fable-review/own-owners (one per line).
# Every other owner is EXTERNAL: the review stays local and uncommitted.

set -uo pipefail

REPO=""
MODE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --mode) MODE="${2:-}"; shift 2 ;;
    --mode=*) MODE="${1#--mode=}"; shift ;;
    -*) shift ;;
    *) [ -z "$REPO" ] && REPO="$1"; shift ;;
  esac
done
REPO="${REPO:-$(pwd)}"
REPO="${REPO/#\~/$HOME}"

if ! ROOT="$(git -C "$REPO" rev-parse --show-toplevel 2>/dev/null)"; then
  echo "ERROR: '$REPO' is not a git repository." >&2
  exit 1
fi
NAME="$(basename "$ROOT")"
TODAY="$(date +%Y-%m-%d)"
HEAD_REF="$(git -C "$ROOT" symbolic-ref --short HEAD 2>/dev/null || echo detached)"
HEAD_SHA="$(git -C "$ROOT" rev-parse --short HEAD)"
REMOTE_URL="$(git -C "$ROOT" remote get-url origin 2>/dev/null || true)"

# Default branch: origin/HEAD, else main/master if present on origin, else current branch.
DEFAULT_BRANCH="$(git -C "$ROOT" symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's@^origin/@@')"
if [ -z "$DEFAULT_BRANCH" ]; then
  for b in main master; do
    if git -C "$ROOT" show-ref --verify --quiet "refs/remotes/origin/$b"; then DEFAULT_BRANCH="$b"; break; fi
  done
fi
: "${DEFAULT_BRANCH:=$HEAD_REF}"
# Ref the review is based on: origin/<default> when it exists, else local HEAD (repo without remote).
if git -C "$ROOT" show-ref --verify --quiet "refs/remotes/origin/$DEFAULT_BRANCH"; then
  BASE_REF="origin/$DEFAULT_BRANCH"
else
  BASE_REF="HEAD"
fi

# Owner / visibility / destination
OWNER=""
if [ -n "$REMOTE_URL" ]; then
  OWNER="$(printf '%s' "$REMOTE_URL" | sed -E 's#^(git@[^:]+:|[a-z+]+://([^@/]+@)?[^/]+/)##; s#/.*##')"
fi
VISIBILITY="unknown"
if [ -n "$OWNER" ] && command -v gh >/dev/null 2>&1 && printf '%s' "$REMOTE_URL" | grep -q 'github.com'; then
  REPO_SLUG="$(printf '%s' "$REMOTE_URL" | sed -E 's#^(git@[^:]+:|[a-z+]+://([^@/]+@)?[^/]+/)##; s#\.git$##')"
  VISIBILITY="$(gh repo view "$REPO_SLUG" --json visibility -q .visibility 2>/dev/null || echo unknown)"
fi

OWN_LIST="${FABLE_REVIEW_OWN_OWNERS:-}"
OWN_FILE="$HOME/.config/fable-review/own-owners"
if [ -z "$OWN_LIST" ] && [ -f "$OWN_FILE" ]; then
  OWN_LIST="$(grep -vE '^\s*(#|$)' "$OWN_FILE" | tr '\n' ' ')"
fi
OWN_LIST="$(printf '%s' "$OWN_LIST" | tr ',' ' ')"

if [ -z "$REMOTE_URL" ]; then
  DEST="ASK"; DEST_WHY="no origin remote: ask the user whether this is their own repo"
elif [ -z "$OWNER" ]; then
  DEST="ASK"; DEST_WHY="could not parse an owner from the origin URL"
elif [ -z "$OWN_LIST" ]; then
  DEST="ASK"; DEST_WHY="no own-owner list configured ($OWN_FILE)"
elif printf ' %s ' "$OWN_LIST" | grep -qi " $OWNER "; then
  DEST="COMMIT"; DEST_WHY="owner '$OWNER' is in the own-owner list"
else
  DEST="LOCAL-ONLY"; DEST_WHY="owner '$OWNER' is not in the own-owner list (external / client)"
fi

STATE_DIR="$HOME/.claude/fable-review"
TS="$(date +%Y%m%d-%H%M%S)"
WT_SUGGEST="$STATE_DIR/worktrees/$NAME-$TS"
LOCAL_OUT="$STATE_DIR/reports/$NAME"

# Next free audit tag for today
TAG_BASE="audit-fable-$TODAY${MODE:+-$MODE}"
TAG="$TAG_BASE"; n=2
while git -C "$ROOT" rev-parse -q --verify "refs/tags/$TAG" >/dev/null; do TAG="$TAG_BASE-$n"; n=$((n+1)); done

echo "=================================================================="
echo "FABLE REVIEW PRE-FLIGHT: $NAME"
echo "=================================================================="
echo "Root:            $ROOT"
echo "Live checkout:   $HEAD_REF ($HEAD_SHA)  [review base: $BASE_REF ($(git -C "$ROOT" rev-parse --short "$BASE_REF")), not this checkout]"
echo "Origin:          ${REMOTE_URL:-none}"
echo "Default branch:  $DEFAULT_BRANCH"
echo "Review base:     $BASE_REF"
echo "Owner:           ${OWNER:-none}   Visibility: $VISIBILITY"
echo "Mode (arg):      ${MODE:-not given}"
echo ""
echo "--- DESTINATION ---"
echo "  $DEST  ($DEST_WHY)"
case "$DEST" in
  COMMIT)     echo "  Worktree: $WT_SUGGEST  from $BASE_REF  (branch fable-review/$TODAY${MODE:+-$MODE})"
              echo "  Tag after push: $TAG" ;;
  LOCAL-ONLY) echo "  Worktree: $WT_SUGGEST  from $BASE_REF  (--detach, no commits)"
              echo "  Report dir: $LOCAL_OUT/  (outside the repo; no commit, no tag, no push)" ;;
  ASK)        echo "  Ask the user: COMMIT into the repo, or LOCAL-ONLY in $LOCAL_OUT/ ?" ;;
esac

# Size (tracked text files, excluding lockfiles, build output and Markdown)
LOC_INFO="$({ git -C "$ROOT" grep -I -c '' "$BASE_REF" -- . \
  ':!*package-lock.json' ':!*yarn.lock' ':!*pnpm-lock.yaml' ':!*pubspec.lock' ':!*Cargo.lock' ':!*poetry.lock' \
  ':!*.min.js' ':!*.min.css' ':!*.svg' ':!*.map' ':!*.md' \
  ':!dist/**' ':!**/dist/**' ':!build/**' ':!**/build/**' ':!.next/**' 2>/dev/null \
  ; } \
  | awk -F: '{files++; lines+=$NF} END {printf "%d %d", files+0, lines+0}')"
FILES="${LOC_INFO% *}"; TOTAL_LINES="${LOC_INFO#* }"
echo ""
echo "--- SIZE ($BASE_REF, excluding Markdown and lockfiles) ---"
echo "  $FILES files, $TOTAL_LINES lines"

echo ""
echo "--- STACK & GROUND-CHECK CANDIDATES (depth <= 3) ---"
FOUND=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  rel="${f#$ROOT/}"; dir="$(dirname "$rel")"
  case "$(basename "$f")" in
    package.json)   FOUND=1; echo "  [Node/TS]   $rel  (node_modules: $([ -d "$ROOT/$dir/node_modules" ] && echo present || echo MISSING))" ;;
    pubspec.yaml)   FOUND=1; echo "  [Flutter]   $rel  -> flutter analyze" ;;
    Cargo.toml)     FOUND=1; echo "  [Rust]      $rel  -> cargo check" ;;
    pyproject.toml) FOUND=1; echo "  [Python]    $rel  -> ruff check / pytest" ;;
    foundry.toml)   FOUND=1; echo "  [Foundry]   $rel  -> forge build && forge test" ;;
    wrangler.jsonc|wrangler.toml) FOUND=1; echo "  [CF Worker] $rel" ;;
  esac
done < <(find "$ROOT" -maxdepth 3 \( -name package.json -o -name pubspec.yaml -o -name Cargo.toml -o -name pyproject.toml -o -name foundry.toml -o -name wrangler.jsonc -o -name wrangler.toml \) \
  -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/.claude/*' -not -path '*/.next/*' -not -path '*/dist/*' -not -path '*/build/*' 2>/dev/null | sort)
[ "$FOUND" -eq 0 ] && echo "  (no standard manifest found)"

echo ""
echo "--- PREVIOUS REVIEWS ---"
LAST_TAG="$(git -C "$ROOT" tag -l 'audit-*' --sort=-creatordate 2>/dev/null | sed -n 1p)"
if [ -n "$LAST_TAG" ]; then
  echo "  Last audit tag: $LAST_TAG ($(git -C "$ROOT" rev-list -n 1 "$LAST_TAG" | cut -c1-7)), $(git -C "$ROOT" rev-list --count "$LAST_TAG..$BASE_REF" 2>/dev/null || echo '?') commits since"
else
  echo "  Last audit tag: none"
fi
DOCS="$(find "$ROOT" -maxdepth 4 -type f -name '*.md' \( -path '*/docs/review*' -o -path '*/docs/refactor*' -o -path '*/docs/security*' -o -path '*/docs/research*' -o -iname '*fable*' \) \
  -not -path '*/node_modules/*' -not -path '*/skills/*' -not -path '*/.claude/*' 2>/dev/null | sed "s|^$ROOT/||" | sort | head -n 25)"
[ -n "$DOCS" ] && { echo "  Review documents in repo:"; echo "$DOCS" | sed 's/^/    - /'; } || echo "  Review documents in repo: none"
if [ -d "$LOCAL_OUT" ]; then
  echo "  Local (uncommitted) reports:"; ls -1 "$LOCAL_OUT" | sed 's/^/    - /'
fi

echo ""
echo "--- ACTIVITY & MODEL ATTRIBUTION ---"
echo "  Commits in last 7 days: $(git -C "$ROOT" rev-list --count --since='7 days ago' "$BASE_REF" 2>/dev/null || echo '?')"
echo "  Co-Authored-By (whole history):"
git -C "$ROOT" log --format='%(trailers:key=Co-Authored-By,valueonly)' 2>/dev/null | sed '/^$/d; s/ <.*//' | sort | uniq -c | sort -nr | sed -n '1,6s/^/    /p'

echo ""
echo "--- REVIEW MARKERS IN CODE (excluding docs and Markdown) ---"
MARKERS="$(git -C "$ROOT" grep -nI -E 'REVIEW\(fable\)|TODO\(fable\)' -- . ':!docs/' ':!*.md' ':!skills/' 2>/dev/null | head -n 20)"
[ -n "$MARKERS" ] && echo "$MARKERS" | sed 's/^/    /' || echo "  none"

echo ""
echo "--- COST ESTIMATE (two-pass) ---"
echo "  ESTIMATE ONLY: derived from Fable 5.1 prices and the 2026-10-16 single-pass incident, not yet measured with this skill."
if [ "${TOTAL_LINES:-0}" -lt 10000 ]; then A="0.5-1.5"; B="1.5-3.5"; C="10-18"
elif [ "${TOTAL_LINES:-0}" -lt 50000 ]; then A="1.5-3"; B="3-6"; C="15-25"
else A="2.5-4.5"; B="5-9 (use 'full' mode, one subsystem per Fable agent)"; C="20-35"; fi
echo "  Pass A (Sonnet, effort medium): ~\$$A"
echo "  Pass B (Fable, effort medium):  ~\$$B, $C calls, context < 150k"
if [ -z "$MODE" ]; then
  if [ -n "$LAST_TAG" ] || [ -n "$DOCS" ] || [ -d "$LOCAL_OUT" ]; then
    echo "  Suggested mode: diff (previous review exists), else security / refactor"
  else
    echo "  Suggested mode: refactor or full (first review of this repo)"
  fi
fi
echo "=================================================================="
