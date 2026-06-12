"use client";

import { Bot, GitCommitHorizontal, Github } from "lucide-react";
import type { ClaudeCodeStats, GithubStats } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Section } from "./Section";

function StatCard({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-5 transition-colors ${
        accent
          ? "border-accent-border bg-accent-soft"
          : "border-line bg-surface hover:bg-surfaceHover"
      }`}
    >
      <p className={`text-3xl font-bold tabular-nums sm:text-4xl ${accent ? "text-accent-bright" : "text-ink"}`}>
        {value}
      </p>
      <p className="mt-1 text-sm text-inkMuted">{label}</p>
    </div>
  );
}

/** Inline SVG bar chart of weekly contributions — no chart library. */
function WeeklyChart({ weekly }: { weekly: GithubStats["lastYear"]["weekly"] }) {
  const { t, n } = useI18n();
  const W = 720;
  const H = 120;
  const gap = 2;
  const barW = (W - gap * (weekly.length - 1)) / weekly.length;
  // sqrt scale: contribution volume spans 0 → ~8k per week, a linear scale
  // would flatten most of the year into invisible slivers.
  const max = Math.max(...weekly.map((w) => w.count), 1);
  const sqrtMax = Math.sqrt(max);

  return (
    <figure className="mt-6">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t("stats.weeklyChartAria")}
        className="h-auto w-full"
        preserveAspectRatio="none"
      >
        {weekly.map((week, i) => {
          const h =
            week.count === 0 ? 1.5 : Math.max((Math.sqrt(week.count) / sqrtMax) * H, 3);
          return (
            <rect
              key={week.weekStart}
              x={i * (barW + gap)}
              y={H - h}
              width={barW}
              height={h}
              rx={1.5}
              className={week.count === 0 ? "fill-line" : "fill-accent"}
              opacity={week.count === 0 ? 1 : 0.4 + 0.6 * (Math.sqrt(week.count) / sqrtMax)}
            >
              <title>{`${week.weekStart}: ${n(week.count)}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-inkMuted">
        {t("stats.weeklyChartTitle")}
      </figcaption>
    </figure>
  );
}

export function Stats({ github, claude }: { github: GithubStats; claude: ClaudeCodeStats }) {
  const { t, n, locale } = useI18n();
  const ly = github.lastYear;

  const updatedDate = new Date(github.updated).toLocaleDateString(
    locale === "hr" ? "hr-HR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <Section id="stats" heading={t("stats.heading")} subheading={t("stats.subheading")}>
      {/* GitHub */}
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-inkMuted">
        <Github className="h-4 w-4" aria-hidden />
        {t("stats.github")}
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard accent value={n(ly.totalContributions)} label={t("stats.contributions")} />
        <StatCard value={n(ly.commits)} label={t("stats.commits")} />
        <StatCard value={n(ly.pullRequests)} label={t("stats.pullRequests")} />
        <StatCard value={n(github.profile.public_repos)} label={t("stats.publicRepos")} />
      </div>

      <WeeklyChart weekly={ly.weekly} />

      <h4 className="mt-10 text-sm font-semibold uppercase tracking-wider text-inkMuted">
        {t("stats.topRepos")}
      </h4>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ly.topRepositories.slice(0, 6).map((repo) => (
          <li key={repo.repo}>
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-4 py-3 text-sm transition-colors hover:border-accent-border"
            >
              <span className="flex min-w-0 items-center gap-2 text-inkSoft">
                <GitCommitHorizontal className="h-4 w-4 shrink-0 text-accent-bright" aria-hidden />
                <span className="truncate font-mono text-xs">{repo.repo}</span>
              </span>
              <span className="shrink-0 tabular-nums text-inkMuted">
                {t("stats.commitsShort", { count: repo.commits, countFmt: n(repo.commits) })}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {/* Claude Code / AI-native development */}
      <h3 className="mt-14 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-inkMuted">
        <Bot className="h-4 w-4" aria-hidden />
        {t("stats.aiNative")}
      </h3>
      <p className="mt-2 max-w-2xl text-sm text-inkMuted">{t("stats.aiNativeBlurb")}</p>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          accent
          value={n(claude.sessionFiles)}
          label={t("stats.ccSessions", { days: claude.retentionWindowDays })}
        />
        <StatCard value={n(claude.projects)} label={t("stats.ccProjects")} />
        <StatCard value={n(claude.transcriptEvents)} label={t("stats.ccEvents")} />
        <StatCard value={n(claude.statsCache.totalMessages)} label={t("stats.ccMessages")} />
      </div>

      <p className="mt-6 text-xs text-inkMuted">{t("stats.updated", { date: updatedDate })}</p>
    </Section>
  );
}
