"use client";

import { useState } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import type { RepoEntry, RepoIndex } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Section } from "./Section";

// How many repositories to show before the "show all" toggle. The index is
// generated from the GitHub API (scripts/update-repos.mjs) and runs to ~110
// entries, which is far too long to dump on the page unprompted.
const PREVIEW_COUNT = 24;

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <div className="font-mono text-2xl font-bold text-accent-bright">{value}</div>
      <div className="mt-0.5 text-xs text-inkMuted">{label}</div>
    </div>
  );
}

function RepoRow({ repo, ownerLabel }: { repo: RepoEntry; ownerLabel: string }) {
  const { t } = useI18n();
  return (
    <li className="flex flex-col rounded-md border border-line bg-surface px-4 py-3 transition-colors hover:border-accent-border">
      <div className="flex items-baseline justify-between gap-3">
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-w-0 items-center gap-1.5 font-semibold text-ink transition-colors hover:text-accent-bright"
        >
          <span className="truncate">{repo.name}</span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-inkMuted" aria-hidden />
        </a>
        {repo.stars > 0 ? (
          <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-inkMuted">
            <Star className="h-3 w-3" aria-hidden />
            {repo.stars}
          </span>
        ) : null}
      </div>

      {repo.description ? (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-inkMuted">
          {repo.description}
        </p>
      ) : null}

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-inkMuted">
        <span className="rounded border border-line px-1.5 py-0.5">{ownerLabel}</span>
        {repo.language ? <span>{repo.language}</span> : null}
        {repo.license ? <span>· {repo.license}</span> : null}
        <span>· {t("openSource.updatedOn", { date: repo.pushed })}</span>
        {repo.archived ? (
          <span className="rounded border border-line px-1.5 py-0.5 uppercase">
            {t("openSource.archived")}
          </span>
        ) : null}
      </p>
    </li>
  );
}

export function OpenSource({ repos }: { repos: RepoIndex }) {
  const { t, n } = useI18n();
  const [expanded, setExpanded] = useState(false);

  // Dot-path lookup returns the key itself when a label is missing — fall back
  // to the raw GitHub org name in that case.
  const ownerLabel = (owner: string) => {
    const key = `openSource.owners.${owner}`;
    const label = t(key);
    return label === key ? owner : label;
  };

  const shown = expanded ? repos.repos : repos.repos.slice(0, PREVIEW_COUNT);
  const hidden = repos.repos.length - shown.length;

  return (
    <Section
      id="open-source"
      heading={t("openSource.heading")}
      subheading={t("openSource.subheading")}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile value={n(repos.totals.repos)} label={t("openSource.repos")} />
        <StatTile value={n(repos.totals.stars)} label={t("openSource.stars")} />
        <StatTile value={n(repos.totals.languages)} label={t("openSource.languages")} />
        <StatTile value={n(repos.totals.activeLast90Days)} label={t("openSource.active")} />
      </div>

      <h3 className="mt-12 text-sm font-semibold uppercase tracking-wider text-inkMuted">
        {t("openSource.allRepos")}
      </h3>
      <p className="mt-1 text-xs text-inkMuted">{t("openSource.sortNote")}</p>

      <ul className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {shown.map((repo) => (
          <RepoRow key={repo.full_name} repo={repo} ownerLabel={ownerLabel(repo.owner)} />
        ))}
      </ul>

      {repos.repos.length > PREVIEW_COUNT ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-6 rounded-md border border-line bg-surface px-4 py-2 text-sm text-accent-bright transition-colors hover:border-accent-border"
        >
          {expanded
            ? t("openSource.showLess")
            : t("openSource.showAll", { count: String(hidden + shown.length) })}
        </button>
      ) : null}
    </Section>
  );
}
