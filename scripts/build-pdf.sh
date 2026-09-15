#!/usr/bin/env bash
# Build all PDF variants from data/ into dist/.
# Usage: scripts/build-pdf.sh [outdir]  (default: dist)
set -euo pipefail
cd "$(dirname "$0")/.."

OUT="${1:-dist}"
mkdir -p "$OUT"

command -v typst >/dev/null || { echo "typst not found — brew install typst" >&2; exit 1; }

# Reproducible output. Typst stamps the PDF creation date from the wall clock
# unless SOURCE_DATE_EPOCH is set, so an unchanged CV still produced six
# different binaries on every run — which is why the weekly CI job kept
# committing PDF churn while refreshing no actual data. Pin the stamp to the
# last commit that touched the inputs, so the bytes change only when the CV does.
if [ -z "${SOURCE_DATE_EPOCH:-}" ]; then
  SOURCE_DATE_EPOCH="$(git log -1 --format=%ct -- data typst 2>/dev/null || true)"
  : "${SOURCE_DATE_EPOCH:=0}"
fi
export SOURCE_DATE_EPOCH

for lang in en hr; do
  typst compile --root . --input lang=$lang typst/cv-full.typ    "$OUT/cv-matija-stepanic-$lang.pdf"
  typst compile --root . --input lang=$lang typst/cv-onepage.typ "$OUT/cv-matija-stepanic-onepage-$lang.pdf"
  typst compile --root . --input lang=$lang typst/cv-ats.typ     "$OUT/cv-matija-stepanic-ats-$lang.pdf"
done

ls -la "$OUT"/*.pdf
