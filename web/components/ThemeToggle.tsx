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
 * Croatian flag as a 24x16 icon: red, white and blue stripes with the
 * checkerboard shield (šahovnica). Without the shield the stripes read as the
 * Dutch flag.
 */
function TricolorIcon() {
  return (
    <svg viewBox="0 0 24 16" className="h-4 w-6" aria-hidden>
      <defs>
        <clipPath id="hr-flag">
          <rect width="24" height="16" rx="2" />
        </clipPath>
        <clipPath id="hr-shield">
          <path d="M9.5 4h6v4.6a3 3 0 0 1-3 3.4 3 3 0 0 1-3-3.4z" />
        </clipPath>
      </defs>
      <g clipPath="url(#hr-flag)">
        <rect width="24" height="5.34" fill="#ff0000" />
        <rect y="5.33" width="24" height="5.34" fill="#ffffff" />
        <rect y="10.66" width="24" height="5.34" fill="#171796" />
      </g>
      <path d="M9.5 4h6v4.6a3 3 0 0 1-3 3.4 3 3 0 0 1-3-3.4z" fill="#ffffff" />
      <g clipPath="url(#hr-shield)" fill="#ff0000">
        <rect x="9.5" y="4.0" width="1.2" height="1.2" />
        <rect x="11.9" y="4.0" width="1.2" height="1.2" />
        <rect x="14.3" y="4.0" width="1.2" height="1.2" />
        <rect x="10.7" y="5.2" width="1.2" height="1.2" />
        <rect x="13.1" y="5.2" width="1.2" height="1.2" />
        <rect x="9.5" y="6.4" width="1.2" height="1.2" />
        <rect x="11.9" y="6.4" width="1.2" height="1.2" />
        <rect x="14.3" y="6.4" width="1.2" height="1.2" />
        <rect x="10.7" y="7.6" width="1.2" height="1.2" />
        <rect x="13.1" y="7.6" width="1.2" height="1.2" />
        <rect x="9.5" y="8.8" width="1.2" height="1.2" />
        <rect x="11.9" y="8.8" width="1.2" height="1.2" />
        <rect x="14.3" y="8.8" width="1.2" height="1.2" />
      </g>
      <path d="M9.5 4h6v4.6a3 3 0 0 1-3 3.4 3 3 0 0 1-3-3.4z" fill="none" stroke="#ff0000" strokeWidth="0.4" />
      <rect x="0.25" y="0.25" width="23.5" height="15.5" rx="1.75" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" />
    </svg>
  );
}
