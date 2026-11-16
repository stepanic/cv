// Fails the build if any emoji ends up in the static export (out/).
// The site uses SVG icons (lucide-react, inline SVG); emoji render differently
// on every OS and are not allowed anywhere in the shipped HTML, RSC payloads or JS.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../out/", import.meta.url).pathname;
const EMOJI = /\p{Emoji_Presentation}|️/gu;
const EXT = /\.(html|txt|js|json|css|xml|webmanifest)$/;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (EXT.test(name)) yield p;
  }
}

let hits = 0;
for (const file of walk(ROOT)) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(EMOJI)) {
    hits++;
    const ctx = text.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, " ");
    console.error(`${file.slice(ROOT.length)}: U+${m[0].codePointAt(0).toString(16).toUpperCase()} …${ctx}…`);
  }
}
if (hits) {
  console.error(`\n${hits} emoji in out/. Replace them with an icon.`);
  process.exit(1);
}
console.log("check-no-emoji: out/ is clean");
