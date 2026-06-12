// Translation catalogue for all user-visible UI strings (CV content itself
// comes from the bilingual fields in ../data). English (en) is the source of
// truth and the default locale; Croatian (hr) is typed against it (`Messages`)
// so every key must exist in both. Leaf values are plain strings with optional
// {var} interpolation; plural leaves are { one, few?, many?, other } resolved
// with CLDR rules in lib/i18n/index.tsx.

export type Plural = { one: string; few?: string; many?: string; other: string };

export type Locale = "en" | "hr";

const en = {
  seo: {
    title: "Matija Stepanić — Senior Software Engineer",
  },

  nav: {
    stats: "Stats",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    education: "Education",
    ariaLabel: "Main navigation",
    homeAria: "Matija Stepanić — top of page",
    langSwitchAria: "Choose language",
  },

  hero: {
    downloadCv: "Download CV (PDF)",
    downloadCvHr: "CV in Croatian (PDF)",
    downloadCvEn: "CV in English (PDF)",
    downloadOnePage: "One-page CV (PDF)",
    emailMe: "Email me",
    availability: "Open to senior engineering & AI-native product work",
  },

  stats: {
    heading: "Live stats",
    subheading:
      "Pulled automatically from GitHub and local Claude Code transcripts — regenerated on every build.",
    github: "GitHub — last 12 months",
    contributions: "Contributions",
    commits: "Commits",
    pullRequests: "Pull requests",
    publicRepos: "Public repos",
    topRepos: "Most active repositories",
    // `count` selects the plural form; `countFmt` is the locale-formatted number.
    commitsShort: {
      one: "{countFmt} commit",
      other: "{countFmt} commits",
    } satisfies Plural as Plural,
    weeklyChartTitle: "Weekly contributions, last 12 months",
    weeklyChartAria: "Bar chart of weekly GitHub contributions over the last year",
    aiNative: "AI-native development",
    aiNativeBlurb:
      "Daily agentic development with Claude Code — measured from local session transcripts, not self-reported.",
    ccSessions: "Sessions (last {days} days)",
    ccProjects: "Projects worked on",
    ccEvents: "Transcript events",
    ccMessages: "Messages since Dec 2025",
    updated: "Updated {date}",
  },

  experience: {
    heading: "Experience",
    subheading: "20 years of shipping software — 2006 to present.",
    present: "Present",
  },

  projects: {
    heading: "Projects",
    subheading: "Products, open source and consulting work.",
    featured: "Featured",
    more: "More projects",
    visit: "Visit",
  },

  skills: {
    heading: "Skills",
    subheading: "Years of professional use, as of 2026.",
    years: { one: "{count} yr", other: "{count} yrs" } satisfies Plural as Plural,
  },

  education: {
    heading: "Education & certifications",
    certifications: "Certifications",
  },

  footer: {
    builtFrom: "Built from a single source of truth —",
    lastUpdated: "Data last updated {date}",
    repo: "View the repo",
  },
};

export type Messages = typeof en;

const hr: Messages = {
  seo: {
    title: "Matija Stepanić — Senior softverski inženjer",
  },

  nav: {
    stats: "Statistika",
    experience: "Iskustvo",
    projects: "Projekti",
    skills: "Vještine",
    education: "Obrazovanje",
    ariaLabel: "Glavna navigacija",
    homeAria: "Matija Stepanić — vrh stranice",
    langSwitchAria: "Odaberi jezik",
  },

  hero: {
    downloadCv: "Preuzmi CV (PDF)",
    downloadCvHr: "Životopis na hrvatskom (PDF)",
    downloadCvEn: "CV na engleskom (PDF)",
    downloadOnePage: "CV na jednoj stranici (PDF)",
    emailMe: "Pošalji e-mail",
    availability: "Otvoren za senior inženjerske i AI-native projekte",
  },

  stats: {
    heading: "Statistika uživo",
    subheading:
      "Automatski povučeno s GitHuba i iz lokalnih Claude Code transkripata — regenerira se pri svakom buildu.",
    github: "GitHub — zadnjih 12 mjeseci",
    contributions: "Contributiona",
    commits: "Commitova",
    pullRequests: "Pull requestova",
    publicRepos: "Javnih repozitorija",
    topRepos: "Najaktivniji repozitoriji",
    commitsShort: {
      one: "{countFmt} commit",
      few: "{countFmt} commita",
      many: "{countFmt} commitova",
      other: "{countFmt} commitova",
    },
    weeklyChartTitle: "Tjedni contributioni, zadnjih 12 mjeseci",
    weeklyChartAria: "Stupčasti graf tjednih GitHub contributiona u zadnjih godinu dana",
    aiNative: "AI-native razvoj",
    aiNativeBlurb:
      "Svakodnevni agentni razvoj s Claude Codeom — mjereno iz lokalnih transkripata sessiona, ne samoprocjena.",
    ccSessions: "Sessiona (zadnjih {days} dana)",
    ccProjects: "Projekata u radu",
    ccEvents: "Eventa u transkriptima",
    ccMessages: "Poruka od prosinca 2025.",
    updated: "Ažurirano {date}",
  },

  experience: {
    heading: "Iskustvo",
    subheading: "20 godina isporuke softvera — od 2006. do danas.",
    present: "danas",
  },

  projects: {
    heading: "Projekti",
    subheading: "Proizvodi, open source i konzultantski rad.",
    featured: "Istaknuto",
    more: "Ostali projekti",
    visit: "Posjeti",
  },

  skills: {
    heading: "Vještine",
    subheading: "Godine profesionalnog korištenja, zaključno s 2026.",
    years: {
      one: "{count} god.",
      few: "{count} god.",
      many: "{count} god.",
      other: "{count} god.",
    },
  },

  education: {
    heading: "Obrazovanje i certifikati",
    certifications: "Certifikati",
  },

  footer: {
    builtFrom: "Izgrađeno iz jednog izvora istine —",
    lastUpdated: "Podaci zadnji put ažurirani {date}",
    repo: "Pogledaj repozitorij",
  },
};

export const messages: Record<Locale, Messages> = { en, hr };
