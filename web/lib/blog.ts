// Build-time blog loader. Renders the bilingual markdown bodies (content/blog.ts)
// to HTML with marked, so the client component only swaps pre-rendered strings
// by locale. Server-only — imported from server components in app/blog.

import { marked } from "marked";
import { posts, type BlogPost } from "@/content/blog";

marked.setOptions({ gfm: true, breaks: false });

// Wide tables scroll inside their own box instead of widening the page.
marked.use({
  renderer: {
    table(header: string, body: string) {
      return `<div class="table-wrap"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>\n`;
    },
  },
});

// The fable-review severity scale (🔴 blocks merge, 🟡 important, 🟢 cleanup) is
// written with emoji in the sources; on the site it renders as an SVG dot.
const SEVERITY: Record<string, { cls: string; en: string; hr: string }> = {
  "\u{1F534}": { cls: "sev-red", en: "blocking", hr: "blokirajuće" },
  "\u{1F7E1}": { cls: "sev-yellow", en: "important", hr: "važno" },
  "\u{1F7E2}": { cls: "sev-green", en: "cleanup", hr: "čišćenje" },
};

// Anything a browser draws as a colour emoji by default, or forced to via VS16.
// Arrows and other typographic symbols are fine in prose.
const EMOJI = /\p{Emoji_Presentation}|\uFE0F/u;

function iconize(html: string, locale: "en" | "hr"): string {
  const out = html.replace(/\u{1F534}|\u{1F7E1}|\u{1F7E2}/gu, (m) => {
    const s = SEVERITY[m]!;
    return `<svg class="sev ${s.cls}" viewBox="0 0 10 10" role="img" aria-label="${s[locale]}"><circle cx="5" cy="5" r="5"/></svg>`;
  });
  const left = out.match(EMOJI);
  if (left) throw new Error(`Emoji "${left[0]}" in a blog post; use an icon instead.`);
  return out;
}

export interface PostMeta {
  slug: string;
  date: string;
  tags: string[];
  title: { en: string; hr: string };
  lead: { en: string; hr: string };
}

export interface RenderedPost extends PostMeta {
  html: { en: string; hr: string };
  sources: BlogPost["sources"];
}

const render = (md: string, locale: "en" | "hr"): string =>
  iconize(marked.parse(md) as string, locale);

const byNewest = (a: BlogPost, b: BlogPost) => b.date.localeCompare(a.date);

export function getPostsMeta(): PostMeta[] {
  return [...posts].sort(byNewest).map(({ slug, date, tags, title, lead }) => ({
    slug,
    date,
    tags,
    title,
    lead,
  }));
}

export function getRenderedPost(slug: string): RenderedPost | undefined {
  const p = posts.find((x) => x.slug === slug);
  if (!p) return undefined;
  const { body, ...rest } = p;
  return { ...rest, html: { en: render(body.en, "en"), hr: render(body.hr, "hr") } };
}

/** Most recent post date — used for the footer's "last updated" on /blog. */
export function latestPostDate(): string {
  return [...posts].sort(byNewest)[0]?.date ?? new Date(0).toISOString();
}
