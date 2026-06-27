// Build-time blog loader. Renders the bilingual markdown bodies (content/blog.ts)
// to HTML with marked, so the client component only swaps pre-rendered strings
// by locale. Server-only — imported from server components in app/blog.

import { marked } from "marked";
import { posts, type BlogPost } from "@/content/blog";

marked.setOptions({ gfm: true, breaks: false });

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

const render = (md: string): string => marked.parse(md) as string;

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
  return { ...rest, html: { en: render(body.en), hr: render(body.hr) } };
}

/** Most recent post date — used for the footer's "last updated" on /blog. */
export function latestPostDate(): string {
  return [...posts].sort(byNewest)[0]?.date ?? new Date(0).toISOString();
}
