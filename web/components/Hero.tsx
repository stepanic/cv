"use client";

import {
  Download,
  ExternalLink,
  FileText,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import type { Profile } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const PDF_BASE = "https://github.com/stepanic/cv/raw/main/dist";

function linkIcon(label: string) {
  const cls = "h-4 w-4";
  switch (label.toLowerCase()) {
    case "github":
      return <Github className={cls} aria-hidden />;
    case "linkedin":
      return <Linkedin className={cls} aria-hidden />;
    case "domovina.ai":
      return <Globe className={cls} aria-hidden />;
    default:
      return <ExternalLink className={cls} aria-hidden />;
  }
}

export function Hero({ profile }: { profile: Profile }) {
  const { t, lt, locale } = useI18n();

  const fullPdf = `${PDF_BASE}/cv-matija-stepanic-${locale}.pdf`;
  const otherPdf =
    locale === "en"
      ? { href: `${PDF_BASE}/cv-matija-stepanic-hr.pdf`, label: t("hero.downloadCvHr") }
      : { href: `${PDF_BASE}/cv-matija-stepanic-en.pdf`, label: t("hero.downloadCvEn") };
  const onePagePdf = `${PDF_BASE}/cv-matija-stepanic-onepage-${locale}.pdf`;

  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* Subtle accent glow, pure CSS — no images needed. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl"
      />
      <div className="container relative py-16 sm:py-24">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3 py-1 text-xs font-medium text-accent-bright">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-bright" aria-hidden />
          {t("hero.availability")}
        </p>

        <h1 className="text-display-xl font-bold text-ink">{profile.name}</h1>
        <p className="mt-3 max-w-3xl text-display-md font-medium text-inkSoft">
          {lt(profile.title)}
        </p>
        <p className="mt-4 flex items-center gap-2 text-sm text-inkMuted">
          <MapPin className="h-4 w-4 text-accent-bright" aria-hidden />
          {lt(profile.location)}
        </p>

        <p className="mt-8 max-w-3xl text-base leading-relaxed text-inkSoft">
          {lt(profile.summary)}
        </p>

        {/* Contact / profile links */}
        <ul className="mt-8 flex flex-wrap items-center gap-3">
          {profile.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm text-inkSoft transition-colors hover:border-accent-border hover:text-ink"
              >
                {linkIcon(link.label)}
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm text-inkSoft transition-colors hover:border-accent-border hover:text-ink"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {t("hero.emailMe")}
            </a>
          </li>
        </ul>

        {/* CV downloads */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={fullPdf}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-bright"
          >
            <Download className="h-4 w-4" aria-hidden />
            {t("hero.downloadCv")}
          </a>
          <a
            href={otherPdf.href}
            className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm text-inkSoft transition-colors hover:border-accent-border hover:text-ink"
          >
            <FileText className="h-4 w-4" aria-hidden />
            {otherPdf.label}
          </a>
          <a
            href={onePagePdf}
            className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm text-inkSoft transition-colors hover:border-accent-border hover:text-ink"
          >
            <FileText className="h-4 w-4" aria-hidden />
            {t("hero.downloadOnePage")}
          </a>
        </div>
      </div>
    </section>
  );
}
