"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { PostMeta } from "@/lib/blog";

export function BlogIndex({ posts }: { posts: PostMeta[] }) {
  const { t, lt, locale } = useI18n();
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(locale === "hr" ? "hr-HR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="container py-16 sm:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-inkMuted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t("blog.backToCv")}
      </Link>

      <h1 className="mt-6 text-display-md font-bold text-ink">
        <span className="mr-3 text-accent-bright" aria-hidden>
          #
        </span>
        {t("blog.title")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-inkMuted">{t("blog.subtitle")}</p>

      <ul className="mt-10 space-y-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="group block rounded-lg border border-line bg-surface p-5 transition-colors hover:border-accent-border hover:bg-surfaceHover"
            >
              <p className="font-mono text-xs text-inkMuted">{fmt(p.date)}</p>
              <h2 className="mt-1 text-lg font-semibold text-ink group-hover:text-accent-bright">
                {lt(p.title)}
              </h2>
              <p className="mt-1 text-sm text-inkSoft">{lt(p.lead)}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-bright">
                {t("blog.readPost")}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
