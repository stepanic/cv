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
      className="flex h-7 w-9 items-center justify-center rounded-md border border-line text-base leading-none transition-colors hover:border-accent-border hover:bg-surface"
    >
      {domovina ? (
        <Terminal className="h-4 w-4" aria-hidden />
      ) : (
        <TricolorIcon />
      )}
    </button>
  );
}

/** Croatian tricolor (red, white, blue) as a 16px icon; matches the DOMOVINA brand stripe. */
function TricolorIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <rect x="1" y="2.5" width="14" height="11" rx="2" fill="#002f6c" />
      <path
        d="M3 2.5h10a2 2 0 0 1 2 2v1.17H1V4.5a2 2 0 0 1 2-2z"
        fill="#ff0000"
      />
      <rect x="1" y="5.67" width="14" height="3.67" fill="#ffffff" />
      <rect
        x="1.25"
        y="2.75"
        width="13.5"
        height="10.5"
        rx="1.75"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="0.5"
      />
    </svg>
  );
}
