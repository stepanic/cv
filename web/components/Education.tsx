"use client";

import { Award, ExternalLink, GraduationCap } from "lucide-react";
import type { Certification, EducationItem } from "@/lib/types";
import { useI18n, formatYearMonth } from "@/lib/i18n";
import { Section } from "./Section";

export function Education({
  education,
  certifications,
}: {
  education: EducationItem[];
  certifications: Certification[];
}) {
  const { t, lt, locale } = useI18n();
  const year = (y: string) => (locale === "hr" ? `${y}.` : y);

  return (
    <Section id="education" heading={t("education.heading")}>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {education.map((item, i) => (
            <article
              key={i}
              className="rounded-lg border border-line bg-surface p-5"
            >
              <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-accent-bright" aria-hidden />
                <div>
                  <h3 className="font-bold text-ink">{lt(item.degree)}</h3>
                  <p className="mt-1 text-sm text-inkSoft">{lt(item.school)}</p>
                  <p className="mt-1 font-mono text-xs text-inkMuted">
                    {year(item.start)} — {year(item.end)}
                    {item.location ? ` · ${lt(item.location)}` : null}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-inkMuted">
            {t("education.certifications")}
          </h3>
          <ul className="mt-4 space-y-4">
            {certifications.map((cert, i) => (
              <li key={i} className="rounded-lg border border-line bg-surface p-5">
                <div className="flex items-start gap-3">
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-accent-bright" aria-hidden />
                  <div>
                    <p className="font-bold text-ink">
                      {cert.url ? (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-accent-bright"
                        >
                          {lt(cert.name)}
                          <ExternalLink className="h-3.5 w-3.5 text-inkMuted" aria-hidden />
                        </a>
                      ) : (
                        lt(cert.name)
                      )}
                    </p>
                    <p className="mt-1 font-mono text-xs text-inkMuted">
                      {cert.issuer} · {formatYearMonth(cert.date, locale)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
