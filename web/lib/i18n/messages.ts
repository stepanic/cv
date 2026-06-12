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
    claudeCode: "Claude Code",
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
    subheading: "Pulled automatically from GitHub — regenerated on every build.",
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
    updated: "Updated {date}",
  },

  claude: {
    heading: "Claude Code — AI-native engineering",
    subheading:
      "Using Claude Code daily since {date} — telemetry mined from local transcripts and daily git snapshots, not self-reported.",
    tokens: "tokens processed",
    apiValue: "API-equivalent value",
    sessions: "sessions",
    sessionsSub: "across {projects} projects",
    messages: "messages",
    messagesSub: "{toolCalls} tool calls",
    launches: "Claude Code launches",
    launchesSub: "since {date}",
    longestSession: "longest session",
    longestSessionValue: "{hours}h",
    longestSessionSub: "{messages} messages · {toolCalls} tool calls",
    monthlyTitle: "Tokens per month",
    monthlyAria: "Bar chart of Claude Code tokens processed per month",
    gapLabelTop: "{from}–{to}",
    gapLabelBottom: "data lost",
    gapNote:
      "{from}–{to}: data lost (corrupted install) — real usage is higher than shown.",
    modelMix: "Model mix",
    modelMixSub: "Share of total tokens per model.",
    otherModels: "other",
    hourTitle: "When the work happens",
    hourSub: "Message events by local hour of day.",
    hourAria: "Histogram of Claude Code activity by hour of day",
    recursionTitle: "Recursion",
    recursionPre:
      "These numbers survive Claude Code's 30-day transcript retention only because of ",
    recursionMid:
      " — a backup tool for Claude Code's own state, built with Claude Code. Token counting borrows from ",
    recursionPost: ". Tools maintaining the telemetry of the tools that built them.",
    methodologyLabel: "Methodology",
    methodologyLink: "miner script",
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
    claudeCode: "Claude Code",
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
    subheading: "Automatski povučeno s GitHuba — regenerira se pri svakom buildu.",
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
    updated: "Ažurirano {date}",
  },

  claude: {
    heading: "Claude Code — AI-native inženjering",
    subheading:
      "Claude Code u svakodnevnoj upotrebi od {date} — telemetrija iskopana iz lokalnih transkripata i dnevnih git snapshotova, ne samoprocjena.",
    tokens: "tokena obrađeno",
    apiValue: "API-ekvivalentna vrijednost",
    sessions: "sessiona",
    sessionsSub: "kroz {projects} projekata",
    messages: "poruka",
    messagesSub: "{toolCalls} tool callova",
    launches: "pokretanja Claude Codea",
    launchesSub: "od {date}",
    longestSession: "najduži session",
    longestSessionValue: "{hours}h",
    longestSessionSub: "{messages} poruka · {toolCalls} tool callova",
    monthlyTitle: "Tokeni po mjesecu",
    monthlyAria: "Stupčasti graf tokena obrađenih u Claude Codeu po mjesecu",
    gapLabelTop: "{from}–{to}",
    gapLabelBottom: "podaci izgubljeni",
    gapNote:
      "{from}–{to}: podaci izgubljeni (korumpirana instalacija) — stvarna upotreba veća je od prikazane.",
    modelMix: "Omjer modela",
    modelMixSub: "Udio ukupnih tokena po modelu.",
    otherModels: "ostali",
    hourTitle: "Kada se radi",
    hourSub: "Eventi poruka po lokalnom satu u danu.",
    hourAria: "Histogram aktivnosti u Claude Codeu po satu u danu",
    recursionTitle: "Rekurzija",
    recursionPre:
      "Ove brojke preživljavaju Claude Codeovu 30-dnevnu retenciju transkripata samo zahvaljujući alatu ",
    recursionMid:
      " — backupu stanja samog Claude Codea, izgrađenom Claude Codeom. Brojanje tokena posuđuje od ",
    recursionPost: ". Alati koji održavaju telemetriju alata koji su ih izgradili.",
    methodologyLabel: "Metodologija",
    methodologyLink: "skripta za rudarenje",
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
