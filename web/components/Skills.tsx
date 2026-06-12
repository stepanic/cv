"use client";

import type { SkillGroup } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Section } from "./Section";

export function Skills({ groups }: { groups: SkillGroup[] }) {
  const { t, lt } = useI18n();

  return (
    <Section id="skills" heading={t("skills.heading")} subheading={t("skills.subheading")}>
      <div className="grid gap-8 md:grid-cols-2">
        {groups.map((group) => (
          <div key={lt(group.group)}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-inkMuted">
              {lt(group.group)}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.items.map((skill) => (
                <li
                  key={skill.name}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    skill.core
                      ? "border-accent-border bg-accent-soft text-ink"
                      : "border-line bg-surface text-inkSoft"
                  }`}
                >
                  {skill.name}
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] tabular-nums ${
                      skill.core ? "bg-accent/25 text-accent-bright" : "bg-bg text-inkMuted"
                    }`}
                  >
                    {t("skills.years", { count: skill.years })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
