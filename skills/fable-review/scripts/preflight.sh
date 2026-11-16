#!/usr/bin/env bash
# Deterministic pre-flight for /fable-review. Read-only: never writes to the repo and never fetches
# (the skill runs `git fetch origin --tags` before calling this).
# Usage: preflight.sh [repo_path] [--mode diff|refactor|security|full|forensic] [--base <ref>]
# Exit 2 on a usage error (missing flag value, unknown flag or mode, --base that is not a commit).
#
# Own-owner list (repos whose reviews may be committed and pushed):
#   $FABLE_REVIEW_OWN_OWNERS (space/comma separated) or ~/.config/fable-review/own-owners (one per line).
#   An entry is `host/owner` (e.g. gitlab.com/me) or a bare `owner`, which means `github.com/owner`.
#   Matching is literal and case-insensitive on the whole `host/owner`.
# Every other host/owner is EXTERNAL: the review stays local and uncommitted.

set -uo pipefail

usage_error() { echo "ERROR: $1" >&2; echo "Usage: preflight.sh [repo_path] [--mode diff|refactor|security|full|forensic] [--base <ref>]" >&2; exit 2; }

REPO=""
MODE=""
DIFF_BASE=""
BASE_GIVEN=0
while [ $# -gt 0 ]; do
  case "$1" in
    --mode)   [ $# -ge 2 ] || usage_error "--mode needs a value"; MODE="$2"; shift 2 ;;
    --mode=*) MODE="${1#--mode=}"; shift ;;
    --base)   [ $# -ge 2 ] || usage_error "--base needs a value"; DIFF_BASE="$2"; BASE_GIVEN=1; shift 2 ;;
    --base=*) DIFF_BASE="${1#--base=}"; BASE_GIVEN=1; shift ;;
    -*) usage_error "unknown flag '$1'" ;;
    *) [ -z "$REPO" ] || usage_error "more than one repo path ('$REPO', '$1')"; REPO="$1"; shift ;;
  esac
done
case "$MODE" in
  ""|diff|refactor|security|full|forensic) ;;
  *) usage_error "unknown mode '$MODE'" ;;
esac
[ "$BASE_GIVEN" -eq 1 ] && [ -z "$DIFF_BASE" ] && usage_error "--base needs a value"
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
GIT_DIR_ABS="$(git -C "$ROOT" rev-parse --absolute-git-dir)"
if [ -f "$GIT_DIR_ABS/FETCH_HEAD" ]; then
  LAST_FETCH="$(date -r "$GIT_DIR_ABS/FETCH_HEAD" '+%Y-%m-%d %H:%M' 2>/dev/null || echo unknown)"
else
  LAST_FETCH="never"
fi

# Host / owner. Forms understood: scheme://[user@]host[:port]/owner/repo and user@host:owner/repo.
# Anything else leaves HOST and OWNER empty, which yields ASK.
HOST=""; OWNER=""; URL_PATH=""
if [ -n "$REMOTE_URL" ]; then
  if [[ "$REMOTE_URL" =~ ^[a-zA-Z][a-zA-Z0-9+.-]*://([^@/]+@)?([^/:]+)(:[0-9]*)?/(.+)$ ]]; then
    HOST="${BASH_REMATCH[2]}"; URL_PATH="${BASH_REMATCH[4]}"
  elif [[ "$REMOTE_URL" =~ ^[^@/:]+@([^/:]+):(.+)$ ]]; then
    HOST="${BASH_REMATCH[1]}"; URL_PATH="${BASH_REMATCH[2]}"
  fi
  URL_PATH="${URL_PATH#/}"
  OWNER="${URL_PATH%%/*}"
  [ "$OWNER" = "$URL_PATH" ] && OWNER=""   # no owner/repo split
fi
HOST_LC="$(printf '%s' "$HOST" | tr '[:upper:]' '[:lower:]')"

VISIBILITY="unknown"
if [ -n "$OWNER" ] && [ "$HOST_LC" = "github.com" ] && command -v gh >/dev/null 2>&1; then
  REPO_SLUG="${URL_PATH%.git}"
  VISIBILITY="$(gh repo view "$REPO_SLUG" --json visibility -q .visibility 2>/dev/null || echo unknown)"
fi

OWN_LIST="${FABLE_REVIEW_OWN_OWNERS:-}"
OWN_FILE="$HOME/.config/fable-review/own-owners"
if [ -z "$OWN_LIST" ] && [ -f "$OWN_FILE" ]; then
  OWN_LIST="$(grep -vE '^[[:space:]]*(#|$)' "$OWN_FILE")"
fi
# One entry per line; a bare owner means github.com/<owner>.
OWN_ENTRIES="$(printf '%s\n' "$OWN_LIST" | tr ', \t' '\n\n\n' | sed '/^$/d' | awk '{ print (index($0, "/") ? $0 : "github.com/" $0) }')"

if [ -z "$REMOTE_URL" ]; then
  DEST="ASK"; DEST_WHY="no origin remote: ask the user whether this is their own repo"
elif [ -z "$HOST" ] || [ -z "$OWNER" ]; then
  DEST="ASK"; DEST_WHY="could not parse host and owner from the origin URL"
elif [ -z "$OWN_ENTRIES" ]; then
  DEST="ASK"; DEST_WHY="no own-owner list configured ($OWN_FILE)"
elif printf '%s\n' "$OWN_ENTRIES" | grep -qixF -- "$HOST/$OWNER"; then
  DEST="COMMIT"; DEST_WHY="'$HOST/$OWNER' is in the own-owner list"
else
  DEST="LOCAL-ONLY"; DEST_WHY="'$HOST/$OWNER' is not in the own-owner list (external / client)"
fi

# Local state is keyed on <owner>-<name> so two repos with the same basename do not share it.
KEY="${OWNER:-no-remote}-$NAME"
[ -n "$HOST_LC" ] && [ "$HOST_LC" != "github.com" ] && KEY="$HOST_LC-$KEY"
STATE_DIR="$HOME/.claude/fable-review"
TS="$(date +%Y%m%d-%H%M%S)"
WT_SUGGEST="$STATE_DIR/worktrees/$KEY-$TS"
LOCAL_OUT="$STATE_DIR/reports/$KEY"
TRANSCRIPT_DIR="$STATE_DIR/transcripts/$KEY"

# Next free audit tag and review branch for today (local and remote-tracking refs as of the last fetch)
TAG_BASE="audit-fable-$TODAY${MODE:+-$MODE}"
TAG="$TAG_BASE"; n=2
while git -C "$ROOT" rev-parse -q --verify "refs/tags/$TAG" >/dev/null; do TAG="$TAG_BASE-$n"; n=$((n+1)); done
BRANCH_BASE="fable-review/$TODAY${MODE:+-$MODE}"
BRANCH="$BRANCH_BASE"; n=2
while git -C "$ROOT" show-ref --quiet --verify "refs/heads/$BRANCH" \
   || git -C "$ROOT" show-ref --quiet --verify "refs/remotes/origin/$BRANCH"; do BRANCH="$BRANCH_BASE-$n"; n=$((n+1)); done

echo "=================================================================="
echo "FABLE REVIEW PRE-FLIGHT: $NAME"
echo "=================================================================="
echo "Root:            $ROOT"
echo "Live checkout:   $HEAD_REF ($HEAD_SHA)  [review base: $BASE_REF ($(git -C "$ROOT" rev-parse --short "$BASE_REF")), not this checkout]"
echo "Origin:          ${REMOTE_URL:-none}   (last fetched: $LAST_FETCH)"
echo "Default branch:  $DEFAULT_BRANCH"
echo "Review base:     $BASE_REF"
echo "Host / owner:    ${HOST:-none} / ${OWNER:-none}   Visibility: $VISIBILITY"
echo "Mode (arg):      ${MODE:-not given}"
echo ""
echo "--- DESTINATION ---"
echo "  $DEST  ($DEST_WHY)"
case "$DEST" in
  COMMIT)     echo "  Worktree: $WT_SUGGEST  from $BASE_REF  (branch $BRANCH)"
              echo "  Tag after push: $TAG" ;;
  LOCAL-ONLY) echo "  Worktree: $WT_SUGGEST  from $BASE_REF  (--detach, no commits)"
              echo "  Report dir: $LOCAL_OUT/  (outside the repo; no commit, no tag, no push)" ;;
  ASK)        echo "  Ask the user: COMMIT into the repo, or LOCAL-ONLY in $LOCAL_OUT/ ?" ;;
esac
echo "  Salvage dir: $TRANSCRIPT_DIR/"

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

# Tree of the review base (not the live checkout), for stack and document lookups
TREE="$(git -C "$ROOT" ls-tree -r --name-only "$BASE_REF" 2>/dev/null)"

echo ""
echo "--- STACK & GROUND-CHECK CANDIDATES ($BASE_REF, depth <= 3) ---"
FOUND=0
while IFS= read -r rel; do
  [ -z "$rel" ] && continue
  dir="$(dirname "$rel")"
  case "$(basename "$rel")" in
    package.json)   FOUND=1; echo "  [Node/TS]   $rel  (node_modules in live checkout: $([ -d "$ROOT/$dir/node_modules" ] && echo present || echo MISSING))" ;;
    pubspec.yaml)   FOUND=1; echo "  [Flutter]   $rel  -> flutter analyze" ;;
    Cargo.toml)     FOUND=1; echo "  [Rust]      $rel  -> cargo check" ;;
    pyproject.toml) FOUND=1; echo "  [Python]    $rel  -> ruff check / pytest" ;;
    foundry.toml)   FOUND=1; echo "  [Foundry]   $rel  -> forge build && forge test" ;;
    wrangler.jsonc|wrangler.toml) FOUND=1; echo "  [CF Worker] $rel" ;;
  esac
done < <(printf '%s\n' "$TREE" \
  | grep -E '^([^/]+/){0,2}(package\.json|pubspec\.yaml|Cargo\.toml|pyproject\.toml|foundry\.toml|wrangler\.jsonc|wrangler\.toml)$' \
  | grep -vE '(^|/)(node_modules|\.claude|\.next|dist|build)/' | sort)
[ "$FOUND" -eq 0 ] && echo "  (no standard manifest found)"

echo ""
echo "--- PREVIOUS REVIEWS ---"
LAST_TAG="$(git -C "$ROOT" tag -l 'audit-*' --sort=-creatordate 2>/dev/null | sed -n 1p)"
if [ -n "$LAST_TAG" ]; then
  echo "  Last audit tag: $LAST_TAG ($(git -C "$ROOT" rev-list -n 1 "$LAST_TAG" | cut -c1-7)), $(git -C "$ROOT" rev-list --count "$LAST_TAG..$BASE_REF" 2>/dev/null || echo '?') commits since"
else
  echo "  Last audit tag: none"
fi
DOCS="$(printf '%s\n' "$TREE" | grep -E '^([^/]+/){0,3}[^/]+\.md$' \
  | grep -iE '(^|/)docs/(review|refactor|security|research)|fable[^/]*\.md$' \
  | grep -vE '(^|/)(node_modules|skills|\.claude)/' | sort | head -n 25)"
[ -n "$DOCS" ] && { echo "  Review documents in repo:"; echo "$DOCS" | sed 's/^/    - /'; } || echo "  Review documents in repo: none"
if [ -d "$LOCAL_OUT" ]; then
  echo "  Local (uncommitted) reports:"; ls -1 "$LOCAL_OUT" | sed 's/^/    - /'
fi

if [ "$MODE" = "diff" ] && [ -z "$DIFF_BASE" ]; then
  if [ -n "$LAST_TAG" ]; then
    DIFF_BASE="$LAST_TAG"; DIFF_BASE_WHY="last audit tag (no --base given)"
  else
    echo ""
    echo "--- DIFF BASE ---"
    echo "  WARNING: --mode diff without --base and no audit-* tag. Pass --base <sha> (for LOCAL-ONLY, the SHA in the"
    echo "  header of the previous local report). The estimate below uses the whole repository."
  fi
else
  DIFF_BASE_WHY="--base"
fi
if [ -n "$DIFF_BASE" ]; then
  if ! git -C "$ROOT" rev-parse -q --verify "$DIFF_BASE^{commit}" >/dev/null; then
    echo "ERROR: diff base '$DIFF_BASE' is not a commit in this repo." >&2
    exit 2
  fi
  echo ""
  echo "--- DIFF BASE ($DIFF_BASE_WHY) ---"
  echo "  $DIFF_BASE ($(git -C "$ROOT" rev-parse --short "$DIFF_BASE^{commit}"))..$BASE_REF: $(git -C "$ROOT" rev-list --count "$DIFF_BASE..$BASE_REF") commits,$(git -C "$ROOT" diff --shortstat "$DIFF_BASE" "$BASE_REF")"
  TOTAL_LINES="$(git -C "$ROOT" diff --numstat "$DIFF_BASE" "$BASE_REF" | awk '{s+=$1+$2} END {print s+0}')"
  echo "  Cost estimate below uses the diff size ($TOTAL_LINES changed lines), not the repo size."
fi

echo ""
echo "--- ACTIVITY & MODEL ATTRIBUTION ($BASE_REF) ---"
echo "  Commits in last 7 days: $(git -C "$ROOT" rev-list --count --since='7 days ago' "$BASE_REF" 2>/dev/null || echo '?')"
echo "  Co-Authored-By (whole history):"
git -C "$ROOT" log --format='%(trailers:key=Co-Authored-By,valueonly)' "$BASE_REF" 2>/dev/null | sed '/^$/d; s/ <.*//' | sort | uniq -c | sort -nr | sed -n '1,6s/^/    /p'

echo ""
echo "--- REVIEW MARKERS IN CODE ($BASE_REF, excluding docs and Markdown) ---"
MARKERS="$(git -C "$ROOT" grep -nI -E '(//|#|/\*|\*|--|<!--)[[:space:]]*(REVIEW|TODO)\(fable\)' "$BASE_REF" -- . ':!docs/' ':!*.md' ':!skills/' 2>/dev/null | sed "s|^$BASE_REF:||" | head -n 20)"
[ -n "$MARKERS" ] && echo "$MARKERS" | sed 's/^/    /' || echo "  none"

echo ""
echo "--- COST ESTIMATE (two-pass) ---"
echo "  ESTIMATE: Fable prices \$10 in / \$12.50 cache write / \$50 out per MTok. Measured once: diff of ~1,150 changed"
echo "  lines at effort low, 7 calls, \$2.51 (2026-11-16). The other bands are not yet measured with this skill."
if [ "${TOTAL_LINES:-0}" -lt 10000 ]; then A="0.5-1.5"; B="1.5-3.5"; C="7-18"
elif [ "${TOTAL_LINES:-0}" -lt 50000 ]; then A="1.5-3"; B="3-6"; C="15-25"
else A="2.5-4.5"; B="5-9 (use 'full' mode, one subsystem per Fable agent)"; C="20-35"; fi
if [ "${TOTAL_LINES:-0}" -lt 5000 ]; then
  echo "  Pass A: done by the orchestrator itself (under ~5,000 lines), no Sonnet agent"
else
  echo "  Pass A (Sonnet, effort medium): ~\$$A"
fi
echo "  Pass B (Fable, effort medium unless the user chooses another): ~\$$B, $C calls, context < 150k"
if [ -z "$MODE" ]; then
  if [ -n "$LAST_TAG" ] || [ -n "$DOCS" ] || [ -d "$LOCAL_OUT" ]; then
    echo "  Suggested mode: diff (previous review exists), else security / refactor"
  else
    echo "  Suggested mode: refactor or full (first review of this repo)"
  fi
fi
echo "=================================================================="
