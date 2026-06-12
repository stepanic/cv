"use client";

import { ExternalLink, MapPin } from "lucide-react";
import type { ExperienceItem } from "@/lib/types";
import { formatYearMonth, useI18n } from "@/lib/i18n";
import { Section } from "./Section";

function Entry({ item }: { item: ExperienceItem }) {
  const { t, lt, locale } = useI18n();

  const start = formatYearMonth(item.start, locale);
  const end = item.end ? formatYearMonth(item.end, locale) : t("experience.present");

  return (
    <li className="relative pb-12 pl-8 last:pb-0 sm:pl-10">
      {/* Timeline rail + node */}
      <span
        aria-hidden
        className="absolute left-[5px] top-2 bottom-0 w-px bg-line"
      />
      <span
        aria-hidden
        className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-accent bg-bg"
      />

      <p className="font-mono text-xs uppercase tracking-wider text-accent-bright">
        {start} — {end}
      </p>
      <h3 className="mt-2 text-xl font-bold text-ink">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-accent-bright"
          >
            {lt(item.company)}
            <ExternalLink className="h-4 w-4 text-inkMuted" aria-hidden />
          </a>
        ) : (
          lt(item.company)
        )}
      </h3>
      <p className="mt-1 text-base font-medium text-inkSoft">{lt(item.role)}</p>
      {item.location ? (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-inkMuted">
          <MapPin className="h-3 w-3" aria-hidden />
          {lt(item.location)}
        </p>
      ) : null}

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-inkSoft">{lt(item.summary)}</p>

      <ul className="mt-4 max-w-3xl space-y-2.5">
        {item.bullets.map((bullet, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-inkMuted">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
            <span>{lt(bullet.text)}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function Experience({ items }: { items: ExperienceItem[] }) {
  const { t } = useI18n();
  return (
    <Section
      id="experience"
      heading={t("experience.heading")}
      subheading={t("experience.subheading")}
    >
      <ol className="ml-1">
        {items.map((item) => (
          <Entry key={item.id} item={item} />
        ))}
      </ol>
    </Section>
  );
}
