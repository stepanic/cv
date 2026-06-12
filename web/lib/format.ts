// Tiny compact-number formatter (7.75B / 31.4M / 52.1k) shared by the
// Claude Code section. Locale only affects the decimal separator — the
// B/M/k suffixes are kept for both languages to stay terse.

import type { Locale } from "./i18n/messages";

function trim(v: number): string {
  const s = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  return s.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}

export function compactNumber(value: number, locale: Locale = "en"): string {
  let out: string;
  if (value >= 1e9) out = `${trim(value / 1e9)}B`;
  else if (value >= 1e6) out = `${trim(value / 1e6)}M`;
  else if (value >= 1e3) out = `${trim(value / 1e3)}k`;
  else out = String(value);
  return locale === "hr" ? out.replace(".", ",") : out;
}
