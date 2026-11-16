"use client";

// Toggle between the default dark "developer" theme and the light DOMOVINA
// branding (Croatian navy/red, tricolor stripe). The theme lives on
// html[data-theme]; an inline script in app/layout.tsx applies the persisted
// choice before first paint, and this component adopts it after hydration.

import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const THEME_STORAGE_KEY = "stepanic.theme";

type Theme = "dev" | "domovina";

export function ThemeToggle() {
  const { t } = useI18n();
  // SSR/export renders the default ("dev") to avoid a hydration mismatch.
  const [theme, setTheme] = useState<Theme>("dev");

  useEffect(() => {
    if (document.documentElement.dataset.theme === "domovina") {
      setTheme("domovina");
    }
  }, []);

  function toggle() {
    const next: Theme = theme === "domovina" ? "dev" : "domovina";
    setTheme(next);
    if (next === "domovina") {
      document.documentElement.dataset.theme = "domovina";
    } else {
      delete document.documentElement.dataset.theme;
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* private mode / storage disabled — keep in-memory only */
    }
  }

  const domovina = theme === "domovina";
  const label = domovina ? t("nav.themeToDev") : t("nav.themeToDomovina");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={domovina}
      aria-label={label}
      title={label}
      className="flex h-7 w-10 items-center justify-center rounded-md border border-line text-base leading-none transition-colors hover:border-accent-border hover:bg-surface"
    >
      {domovina ? (
        <Terminal className="h-4 w-4" aria-hidden />
      ) : (
        <TricolorIcon />
      )}
    </button>
  );
}

/**
 * Flag of Croatia, the Wikimedia Commons SVG (public domain,
 * commons.wikimedia.org/wiki/File:Flag_of_Croatia.svg) served from
 * public/flag-hr.svg as-is, with only a viewBox added so it scales.
 */
function TricolorIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/flag-hr.svg"
      alt=""
      width={24}
      height={12}
      className="h-3 w-6 rounded-[2px] ring-1 ring-black/20"
      aria-hidden
    />
  );
}
