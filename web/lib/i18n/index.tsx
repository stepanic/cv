"use client";

// i18n runtime adapted from pinka-finance/landing: React context, ?lang= query
// param, localStorage persistence, CLDR plural rules for Croatian, dot-path
// lookup. Here the DEFAULT locale is "en" (international audience) and missing
// hr keys fall back to "en".

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { messages, type Locale, type Plural } from "./messages";
import type { Bilingual } from "../types";

export type { Locale } from "./messages";

type Vars = Record<string, string | number>;

interface I18nState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Look up a dot-path key, interpolate {vars}, resolve plurals by `count`. */
  t: (key: string, vars?: Vars) => string;
  /** Resolve a bilingual data field ({ en, hr } or plain string). */
  lt: (value: Bilingual | undefined | null) => string;
  /** Locale-aware number formatting (29,447 vs 29.447). */
  n: (value: number) => string;
}

const I18nContext = createContext<I18nState | null>(null);
const STORAGE_KEY = "stepanic.lang";
const DEFAULT_LOCALE: Locale = "en";

// CLDR plural category. English: one/other. Croatian (and other Slavic langs):
// one/few/many — the standard rule used for genitive-plural agreement.
function pluralCategory(locale: Locale, n: number): keyof Plural {
  const abs = Math.abs(n);
  if (locale === "en") return abs === 1 ? "one" : "other";
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return "one";
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return "few";
  return "many";
}

function lookup(dict: unknown, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (o, k) =>
        o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined,
      dict,
    );
}

function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k: string) =>
    k in vars ? String(vars[k]) : m,
  );
}

function isPlural(v: unknown): v is Plural {
  return !!v && typeof v === "object" && "other" in (v as object);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Start at the SSR/export default ("en") to avoid a hydration mismatch, then
  // adopt the persisted choice on mount.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    // ?lang= wins (the hreflang alternate URL, e.g. /?lang=hr) and is persisted,
    // otherwise fall back to the previously chosen locale.
    const param = new URLSearchParams(window.location.search).get("lang");
    if (param === "hr" || param === "en") {
      setLocaleState(param);
      try {
        window.localStorage.setItem(STORAGE_KEY, param);
      } catch {
        /* ignore */
      }
      return;
    }
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "hr" || saved === "en") setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(l: Locale) {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* private mode / storage disabled — keep in-memory only */
    }
  }

  function t(key: string, vars?: Vars): string {
    let val = lookup(messages[locale], key);
    // Missing keys fall back to the default ("en") catalogue.
    if (val === undefined && locale !== DEFAULT_LOCALE) {
      val = lookup(messages[DEFAULT_LOCALE], key);
    }
    if (isPlural(val)) {
      const count = typeof vars?.count === "number" ? vars.count : 0;
      const cat = pluralCategory(locale, count);
      val = val[cat] ?? val.other;
    }
    if (typeof val !== "string") return key;
    return interpolate(val, vars);
  }

  function lt(value: Bilingual | undefined | null): string {
    if (value == null) return "";
    if (typeof value === "string") return value;
    return value[locale] ?? value.en;
  }

  function n(value: number): string {
    return value.toLocaleString(locale === "hr" ? "hr-HR" : "en-US");
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, lt, n }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nState {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

const MONTHS: Record<Locale, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  hr: ["sij", "velj", "ožu", "tra", "svi", "lip", "srp", "kol", "ruj", "lis", "stu", "pro"],
};

/** Format "YYYY-MM" → "Jun 2025" / "lip 2025."; plain "YYYY" passes through. */
export function formatYearMonth(value: string, locale: Locale): string {
  const [year, month] = value.split("-");
  if (!year) return value;
  const yearLabel = locale === "hr" ? `${year}.` : year;
  if (!month) return yearLabel;
  const m = MONTHS[locale][parseInt(month, 10) - 1];
  return m ? `${m} ${yearLabel}` : yearLabel;
}
