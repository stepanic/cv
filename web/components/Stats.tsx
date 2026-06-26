"use client";

import { GitCommitHorizontal, Github, Trophy } from "lucide-react";
import type { GithubStats } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Section } from "./Section";
import { OtsVerify } from "./OtsVerify";

// committers.top — most active GitHub users in Croatia. Two screenshots,
// 2026-06-25: the raw list ranks me #1 (an anomaly inflated by a bulk dataset
// repo), and my fork with the exclusion fix deployed shows the genuine #13.
// Both screenshots are timestamped to the Bitcoin blockchain (.ots proofs).
const COMMITTERS_TOP_URL = "https://committers.top/croatia_public";
const FORK_URL = "https://stepanic.github.io/committers.top/croatia_public";
const DATASET_REPO_URL = "https://github.com/domovinatv/dataset.domovina.tv";
const PR_131_URL = "https://github.com/ashkulz/committers.top/pull/131";
const PR_132_URL = "https://github.com/ashkulz/committers.top/pull/132";
const RAW_SHOT = "/committers-top-croatia-2026-06-25.png";
const RAW_OTS = "/committers-top-croatia-2026-06-25.png.ots";
const FIXED_SHOT = "/committers-top-croatia-corrected-2026-06-25.png";
const FIXED_OTS = "/committers-top-croatia-corrected-2026-06-25.png.ots";
const PROOF_DOC_URL =
  "https://github.com/stepanic/cv/blob/main/docs/committers-top-timestamps.md";
const OTS_SITE_URL = "https://opentimestamps.org/";
// GitHub raw, so anyone can download the exact bytes of image + proof and
// verify the pair by hand on opentimestamps.org.
const GH_RAW = "https://raw.githubusercontent.com/stepanic/cv/main/web/public";
const ghRaw = (localPath: string) => `${GH_RAW}${localPath}`;

function RankShot({
  href,
  src,
  ots,
  alt,
  label,
  caption,
}: {
  href: string;
  src: string;
  ots: string;
  alt: string;
  label: string;
  caption: string;
}) {
  const { t } = useI18n();
  return (
    <figure>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-md border border-line bg-surface"
      >
        {/* Plain <img>: the site is a static export with no image optimizer. */}
        <img src={src} alt={alt} width={1790} height={1836} loading="lazy" className="h-auto w-full" />
      </a>
      <figcaption className="mt-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-inkMuted">{label}</span>
        <span className="mt-0.5 block text-sm font-medium text-ink">{caption}</span>
      </figcaption>
      {/* In-browser, trustless verification straight against the Bitcoin chain. */}
      <OtsVerify pngUrl={src} otsUrl={ots} />
      {/* Or download both files and verify the pair by hand on opentimestamps.org. */}
      <p className="mt-2 text-xs text-inkMuted">
        {t("stats.ranking.verify.manualPre")}
        <a href={ghRaw(src)} target="_blank" rel="noopener noreferrer" className="text-accent-bright underline-offset-2 hover:underline">
          {t("stats.ranking.verify.manualImage")}
        </a>
        {" + "}
        <a href={ghRaw(ots)} target="_blank" rel="noopener noreferrer" className="text-accent-bright underline-offset-2 hover:underline">
          {t("stats.ranking.verify.manualOts")}
        </a>
        {t("stats.ranking.verify.manualMid")}
        <a href={OTS_SITE_URL} target="_blank" rel="noopener noreferrer" className="text-accent-bright underline-offset-2 hover:underline">
          opentimestamps.org
        </a>
        {t("stats.ranking.verify.manualPost")}
      </p>
    </figure>
  );
}

/**
 * Croatia ranking callout — the honest before/after. Raw committers.top lists
 * me #1 (anomaly), my fork with the fix deployed shows the genuine #13. Both
 * shots are anchored in Bitcoin via OpenTimestamps.
 */
function CommittersRank() {
  const { t } = useI18n();
  return (
    <div className="mt-10">
      <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-inkMuted">
        <Trophy className="h-4 w-4 text-accent-bright" aria-hidden />
        {t("stats.ranking.heading")}
      </h4>
      <div className="mt-4 rounded-lg border border-accent-border bg-accent-soft p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <RankShot
            href={COMMITTERS_TOP_URL}
            src={RAW_SHOT}
            ots={RAW_OTS}
            alt={t("stats.ranking.rawAlt")}
            label={t("stats.ranking.rawLabel")}
            caption={t("stats.ranking.rawCaption")}
          />
          <RankShot
            href={FORK_URL}
            src={FIXED_SHOT}
            ots={FIXED_OTS}
            alt={t("stats.ranking.fixedAlt")}
            label={t("stats.ranking.fixedLabel")}
            caption={t("stats.ranking.fixedCaption")}
          />
        </div>
        <p className="mt-5 rounded-md border border-line bg-surface p-4 text-sm leading-relaxed text-inkSoft">
          {t("stats.ranking.caveatPre")}
          <a href={DATASET_REPO_URL} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-accent-bright underline-offset-2 hover:underline">
            domovinatv/dataset.domovina.tv
          </a>
          {t("stats.ranking.caveatMid1")}
          <a href={FORK_URL} target="_blank" rel="noopener noreferrer" className="text-accent-bright underline-offset-2 hover:underline">
            {t("stats.ranking.forkLink")}
          </a>
          {t("stats.ranking.caveatMid2")}
          <a href={PR_131_URL} target="_blank" rel="noopener noreferrer" className="text-accent-bright underline-offset-2 hover:underline">
            #131
          </a>
          {t("stats.ranking.caveatMid3")}
          <a href={PR_132_URL} target="_blank" rel="noopener noreferrer" className="text-accent-bright underline-offset-2 hover:underline">
            #132
          </a>
          {t("stats.ranking.caveatPost")}
        </p>
        <p className="mt-3 text-xs text-inkMuted">
          {t("stats.ranking.proof")}{" "}
          <a href={RAW_OTS} className="text-accent-bright underline-offset-2 hover:underline">
            {t("stats.ranking.proofRaw")}
          </a>
          {" · "}
          <a href={FIXED_OTS} className="text-accent-bright underline-offset-2 hover:underline">
            {t("stats.ranking.proofFixed")}
          </a>
          {" · "}
          <a href={PROOF_DOC_URL} target="_blank" rel="noopener noreferrer" className="text-accent-bright underline-offset-2 hover:underline">
            {t("stats.ranking.proofDoc")}
          </a>
        </p>
      </div>
    </div>
  );
}

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

export function Stats({ github }: { github: GithubStats }) {
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
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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

      <CommittersRank />

      <p className="mt-6 text-xs text-inkMuted">{t("stats.updated", { date: updatedDate })}</p>
    </Section>
  );
}
