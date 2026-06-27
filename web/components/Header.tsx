"use client";

import Link from "next/link";
import { useI18n, type Locale } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";

// Root-relative hashes so the section links also work from /blog (they navigate
// home, then scroll). /blog is a real route, not an in-page anchor.
const NAV_ITEMS = [
  { href: "/#stats", key: "nav.stats" },
  { href: "/#claude-code", key: "nav.claudeCode" },
  { href: "/#experience", key: "nav.experience" },
  { href: "/#projects", key: "nav.projects" },
  { href: "/#skills", key: "nav.skills" },
  { href: "/#education", key: "nav.education" },
  { href: "/blog", key: "nav.blog" },
] as const;

function LangButton({ target }: { target: Locale }) {
  const { locale, setLocale } = useI18n();
  const active = locale === target;
  return (
    <button
      type="button"
      onClick={() => setLocale(target)}
      aria-pressed={active}
      className={`rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
        active
          ? "bg-accent text-white"
          : "text-inkMuted hover:text-ink"
      }`}
    >
      {target}
    </button>
  );
}

export function Header() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          aria-label={t("nav.homeAria")}
          className="font-mono text-sm font-bold tracking-tight text-ink"
        >
          <span className="text-accent-bright">~/</span>stepanic
        </Link>

        <nav aria-label={t("nav.ariaLabel")} className="hidden items-center gap-5 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-inkSoft transition-colors hover:text-ink"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div
            role="group"
            aria-label={t("nav.langSwitchAria")}
            className="flex items-center gap-1 rounded-md border border-line p-0.5"
          >
            <LangButton target="hr" />
            <LangButton target="en" />
          </div>
        </div>
      </div>
    </header>
  );
}
