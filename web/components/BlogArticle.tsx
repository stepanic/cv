"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { RenderedPost } from "@/lib/blog";

export function BlogArticle({ post }: { post: RenderedPost }) {
  const { t, lt, locale } = useI18n();
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(locale === "hr" ? "hr-HR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="container py-16 sm:py-20">
      <div className="mx-auto max-w-[680px]">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-inkMuted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("blog.allPosts")}
        </Link>

        <article className="mt-6">
          <header className="border-b border-line pb-8">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-inkMuted">
              <time dateTime={post.date}>{fmt(post.date)}</time>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-surface px-1.5 py-0.5 text-inkSoft"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mt-4 text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[42px]">
              {lt(post.title)}
            </h1>
            <p className="mt-4 font-serif text-lg leading-relaxed text-inkSoft sm:text-[22px] sm:leading-[1.45]">
              {lt(post.lead)}
            </p>
          </header>

          {/* Trusted, build-time-rendered markdown from content/blog.ts. */}
          <div
            className="prose-cv mt-10"
            dangerouslySetInnerHTML={{
              __html: locale === "hr" ? post.html.hr : post.html.en,
            }}
          />

          <section className="mt-14 border-t border-line pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-inkMuted">
              {t("blog.sources")}
            </h2>
            <ul className="mt-3 space-y-2">
              {post.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent-bright underline decoration-accent-border underline-offset-4 hover:text-ink"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
