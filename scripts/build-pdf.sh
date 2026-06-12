#!/usr/bin/env bash
# Build all PDF variants from data/ into dist/.
# Usage: scripts/build-pdf.sh [outdir]  (default: dist)
set -euo pipefail
cd "$(dirname "$0")/.."

OUT="${1:-dist}"
mkdir -p "$OUT"

command -v typst >/dev/null || { echo "typst not found — brew install typst" >&2; exit 1; }

for lang in en hr; do
  typst compile --root . --input lang=$lang typst/cv-full.typ    "$OUT/cv-matija-stepanic-$lang.pdf"
  typst compile --root . --input lang=$lang typst/cv-onepage.typ "$OUT/cv-matija-stepanic-onepage-$lang.pdf"
  typst compile --root . --input lang=$lang typst/cv-ats.typ     "$OUT/cv-matija-stepanic-ats-$lang.pdf"
done

ls -la "$OUT"/*.pdf
