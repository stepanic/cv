"use client";

import { Github } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const REPO_URL = "https://github.com/stepanic/cv";

export function Footer({ updated }: { updated: string }) {
  const { t, locale } = useI18n();

  const updatedDate = new Date(updated).toLocaleDateString(
    locale === "hr" ? "hr-HR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <footer className="py-10">
      <div className="container flex flex-col items-start justify-between gap-4 text-sm text-inkMuted sm:flex-row sm:items-center">
        <p>
          {t("footer.builtFrom")}{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent font-mono"
          >
            github.com/stepanic/cv
          </a>
        </p>
        <div className="flex items-center gap-4">
          <p className="text-xs">{t("footer.lastUpdated", { date: updatedDate })}</p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("footer.repo")}
            className="text-inkMuted transition-colors hover:text-ink"
          >
            <Github className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
