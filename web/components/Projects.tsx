"use client";

import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { Section } from "./Section";

function periodLabel(period: Project["period"], locale: Locale, present: string): string {
  const year = (y: string) => (locale === "hr" ? `${y}.` : y);
  const start = year(period.start);
  if (!period.end) return `${start} — ${present}`;
  if (period.end === period.start) return start;
  return `${start} — ${year(period.end)}`;
}

function TechChips({ tech }: { tech: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-1.5">
      {tech.map((item) => (
        <li
          key={item}
          className="rounded border border-line bg-bg px-2 py-0.5 font-mono text-[11px] text-inkMuted"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function FeaturedCard({ project }: { project: Project }) {
  const { t, lt, locale } = useI18n();
  return (
    <article className="flex flex-col rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent-border">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-ink">{project.name}</h3>
        <span className="shrink-0 font-mono text-xs text-inkMuted">
          {periodLabel(project.period, locale, t("experience.present"))}
        </span>
      </div>
      <p className="mt-1 text-sm font-medium text-accent-bright">{lt(project.role)}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-inkSoft">{lt(project.summary)}</p>

      {project.highlights?.length ? (
        <ul className="mt-4 space-y-2">
          {project.highlights.map((h, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-inkMuted">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
              <span>{lt(h)}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <TechChips tech={project.tech} />

      {project.links.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-3 border-t border-line pt-4">
          {project.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-accent-bright transition-colors hover:text-ink"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function CompactRow({ project }: { project: Project }) {
  const { t, lt, locale } = useI18n();
  const firstLink = project.links[0];
  return (
    <li className="rounded-md border border-line bg-surface px-5 py-4 transition-colors hover:border-accent-border">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="font-semibold text-ink">
          {firstLink ? (
            <a
              href={firstLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-accent-bright"
            >
              {project.name}
              <ArrowUpRight className="h-3.5 w-3.5 text-inkMuted" aria-hidden />
            </a>
          ) : (
            project.name
          )}
        </h4>
        <span className="font-mono text-xs text-inkMuted">
          {periodLabel(project.period, locale, t("experience.present"))}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-inkMuted">{lt(project.summary)}</p>
      <p className="mt-2 font-mono text-[11px] text-inkMuted">{project.tech.join(" · ")}</p>
    </li>
  );
}

export function Projects({ projects }: { projects: Project[] }) {
  const { t } = useI18n();
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Section id="projects" heading={t("projects.heading")} subheading={t("projects.subheading")}>
      <div className="grid gap-5 md:grid-cols-2">
        {featured.map((project) => (
          <FeaturedCard key={project.id} project={project} />
        ))}
      </div>

      {rest.length > 0 ? (
        <>
          <h3 className="mt-14 text-sm font-semibold uppercase tracking-wider text-inkMuted">
            {t("projects.more")}
          </h3>
          <ul className="mt-4 grid gap-3 lg:grid-cols-2">
            {rest.map((project) => (
              <CompactRow key={project.id} project={project} />
            ))}
          </ul>
        </>
      ) : null}
    </Section>
  );
}
