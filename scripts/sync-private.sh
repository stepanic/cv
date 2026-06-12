#!/usr/bin/env bash
# Sync gitignored job applications to the private repo stepanic/cv-private.
# The private repo is cloned (once) next to this repo as ../cv-private.
set -euo pipefail
cd "$(dirname "$0")/.."

PRIVATE_DIR="${PRIVATE_DIR:-../cv-private}"

if [ ! -d "$PRIVATE_DIR/.git" ]; then
  echo "Cloning stepanic/cv-private into $PRIVATE_DIR ..."
  gh repo clone stepanic/cv-private "$PRIVATE_DIR"
fi

rsync -av --delete \
  --exclude README.md --exclude _template \
  applications/ "$PRIVATE_DIR/applications/"

cd "$PRIVATE_DIR"
git add -A
if git diff --cached --quiet; then
  echo "Nothing to sync."
else
  git commit -m "Sync applications $(date +%Y-%m-%d)"
  git push
  echo "Synced to stepanic/cv-private."
fi
