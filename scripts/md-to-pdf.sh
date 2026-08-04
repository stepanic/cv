#!/usr/bin/env bash
# Markdown -> PDF, with ```mermaid fences pre-rendered to PNG.
#
# Used for long-form documents that are not CVs (interview prep, notes,
# analyses). The CV PDFs come from Typst templates instead — see build-pdf.sh.
#
#   scripts/md-to-pdf.sh input.md [output.pdf]
#
# Requires: pandoc, typst, node (mermaid-cli is fetched via npx on demand).
# See docs/2026-08-04-markdown-u-pdf-s-mermaidom.md for why this shape.
set -euo pipefail

SRC="${1:?usage: md-to-pdf.sh input.md [output.pdf]}"
OUT="${2:-${SRC%.md}.pdf}"
# pandoc runs from inside the temp dir so it can find the rendered PNGs, so the
# output path has to be absolute first — otherwise the PDF is written into the
# temp dir and deleted by the trap below.
case "$OUT" in /*) ;; *) OUT="$PWD/$OUT" ;; esac
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

for tool in pandoc typst npx; do
  command -v "$tool" >/dev/null || { echo "missing: $tool" >&2; exit 1; }
done

# Pull the mermaid fences out into .mmd files, leaving image references behind.
python3 - "$SRC" "$WORK" <<'PY'
import re, sys, pathlib
src, work = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
n = 0
def take(m):
    global n
    n += 1
    (work / f"diagram-{n}.mmd").write_text(m.group(1), encoding="utf-8")
    return f"![](diagram-{n}.png)\n"
out = re.sub(r"```mermaid\n(.*?)```\n", take, src.read_text(encoding="utf-8"), flags=re.S)
(work / "body.md").write_text(out, encoding="utf-8")
print(f"mermaid diagrams: {n}")
PY

echo '{ "theme": "neutral", "flowchart": { "useMaxWidth": true, "htmlLabels": true } }' \
  > "$WORK/mermaid-config.json"

shopt -s nullglob
for f in "$WORK"/diagram-*.mmd; do
  echo "rendering $(basename "$f")"
  npx -y @mermaid-js/mermaid-cli@11 \
    -i "$f" -o "${f%.mmd}.png" \
    -c "$WORK/mermaid-config.json" \
    -b white -s 3 --quiet
done

# Typst as the PDF engine: no LaTeX toolchain needed, and its default fonts
# cover Croatian diacritics without extra configuration.
( cd "$WORK" && pandoc body.md \
    -o "$OUT" \
    --pdf-engine=typst \
    --toc --toc-depth=2 \
    -V margin-x=2cm -V margin-y=2cm \
    -V fontsize=10pt \
    -V mainfont="Helvetica Neue" )

echo "wrote $OUT"
