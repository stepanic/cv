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
    blog: "Blog",
    ariaLabel: "Main navigation",
    homeAria: "Matija Stepanić — top of page",
    langSwitchAria: "Choose language",
    themeToDomovina: "Switch to DOMOVINA theme (light, Croatian colors)",
    themeToDev: "Switch to developer theme (dark)",
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
    ranking: {
      heading: "Croatia ranking — the honest version",
      rawLabel: "Raw committers.top",
      rawCaption: "#1 · 28,611 — inflated, captured 17:14 CET",
      rawAlt: "Raw committers.top ranking of the most active GitHub users in Croatia, Matija Stepanić listed first with 28,611 contributions",
      fixedLabel: "My fork, exclusion fix deployed",
      fixedCaption: "#13 · 2,022 genuine · ~27,604 excluded, 17:36 CET",
      fixedAlt: "Corrected committers.top ranking on my fork — Matija Stepanić at #13 with 2,022 genuine contributions and ~27,604 excluded",
      caveatPre: "The raw committers.top board ranks me #1, but that is an anomaly: it counts the bulk commits from the ",
      caveatMid1: " dataset repo. I deployed a fork with the exclusion fix — ",
      forkLink: "stepanic.github.io/committers.top",
      caveatMid2: " — which drops me to a genuine #13 with 2,022 real contributions (~27,604 excluded). The same fix is up for review as PRs ",
      caveatMid3: " and ",
      caveatPost: " on committers.top. Fair to ask how 'real' anyone's contribution count on the board is.",
      proof: "Both screenshots are anchored in the Bitcoin blockchain via OpenTimestamps:",
      proofRaw: "raw .ots",
      proofFixed: "corrected .ots",
      proofDoc: "how to verify",
      verify: {
        button: "Verify in your browser",
        running: "Verifying — hashing, reading proof, querying Bitcoin…",
        okPrefix: "Verified against the Bitcoin blockchain",
        okBlock: "Block {height} · {date} UTC.",
        okDetail:
          "Image SHA-256 matches the proof, and the proof's merkle root matches the on-chain block header. No trust in this site or the calendar servers required.",
        viewBlock: "view block ↗",
        failHash: "Image does not match the proof — the file changed.",
        failNoBtc: "No Bitcoin attestation in the proof yet (still pending).",
        failNet: "Could not reach a Bitcoin block explorer — try again.",
        failMerkle: "Merkle root does not match the block header.",
        manualPre: "By hand: download ",
        manualImage: "image",
        manualOts: "proof",
        manualMid: ", drop both into ",
        manualPost: ".",
        sha256: "Image SHA-256",
        copy: "Copy SHA-256",
        copied: "Copied!",
      },
    },
  },

  claude: {
    heading: "Claude Code — AI-native engineering",
    subheading:
      "Using Claude Code daily since {date} — telemetry mined from local transcripts, daily git snapshots and a sourced public usage record.",
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
      "{from}–{to}: partial data — timestamp-less legacy history format, a July 2025 corruption event (5 files) and undocumented gaps (Apr 2025; Aug–Oct 2025). Real usage is higher than shown.",
    gapNoteFull:
      "Daily use began {from} — but the {from}–{to} stretch is only partially recorded: a timestamp-less legacy format, a July 2025 corruption event (5 files), and automated backups that began only in 2026. The reconstructed May–Jul 2025 slice alone holds ~{prompts} prompts across {projects} projects; the bars understate the early period, not the usage.",
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
    historyTitle: "History & spend — the wider record",
    historySub:
      "Figures the local mining cannot see, taken from a sourced public usage record (invoices and product screenshots). Each carries its verification status.",
    verified: "verified",
    estimated: "estimated",
    histConvos: "Claude.ai conversations",
    histConvosSub: "point-in-time snapshot, {date} · Pro plan",
    histSpend: "total Anthropic spend",
    histSpendSub: "{invoices} invoices · {from} → {to} ({months} months) · avg €{avg}/mo",
    histPeak: "peak plan period",
    histPeakSub: "€{monthly}/mo × 5 = €{total} ({period})",
    histEarly: "reconstructed early era",
    histEarlySub:
      "{period}: {prompts} prompts · {projects} projects · ~{messages} messages (July 2025 corruption event)",
    histSnapshot: "/stats snapshot ({date})",
    histSnapshotSub:
      "{sessions} sessions · longest {longest} · {streak}-day streak · most active day {mostActive}",
    historyDocLink: "Full sourced record",
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

  blog: {
    title: "Blog",
    subtitle: "Occasional notes on AI-native engineering.",
    backToCv: "Back to CV",
    allPosts: "All posts",
    readPost: "Read",
    sources: "Sources",
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
    blog: "Blog",
    ariaLabel: "Glavna navigacija",
    homeAria: "Matija Stepanić — vrh stranice",
    langSwitchAria: "Odaberi jezik",
    themeToDomovina: "Prebaci na DOMOVINA temu (svijetla, hrvatske boje)",
    themeToDev: "Prebaci na developersku temu (tamna)",
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
    ranking: {
      heading: "Poredak u Hrvatskoj — poštena verzija",
      rawLabel: "Sirovi committers.top",
      rawCaption: "#1 · 28.611 — napuhano, snimljeno 17:14 CET",
      rawAlt: "Sirovi committers.top poredak najaktivnijih GitHub korisnika u Hrvatskoj, Matija Stepanić na prvom mjestu s 28.611 contributiona",
      fixedLabel: "Moj fork, popravak deployan",
      fixedCaption: "#13 · 2.022 stvarna · ~27.604 isključeno, 17:36 CET",
      fixedAlt: "Ispravljen committers.top poredak na mom forku — Matija Stepanić na 13. mjestu s 2.022 stvarna contributiona i ~27.604 isključeno",
      caveatPre: "Sirovi committers.top poredak stavlja me na #1, ali to je anomalija: broji bulk commitove iz repozitorija ",
      caveatMid1: ". Deployao sam fork s popravkom koji ih isključuje — ",
      forkLink: "stepanic.github.io/committers.top",
      caveatMid2: " — što me spušta na stvarno 13. mjesto s 2.022 stvarna contributiona (~27.604 isključeno). Isti popravak je na reviewu kao PR-ovi ",
      caveatMid3: " i ",
      caveatPost: " na committers.top. Pošteno je pitati koliko su 'stvarni' contributioni bilo koga na ljestvici.",
      proof: "Oba screenshota zapisana su u Bitcoin blockchainu putem OpenTimestampsa:",
      proofRaw: "sirovi .ots",
      proofFixed: "ispravljeni .ots",
      proofDoc: "kako provjeriti",
      verify: {
        button: "Provjeri u svom browseru",
        running: "Provjeravam — hashiram, čitam proof, pitam Bitcoin…",
        okPrefix: "Provjereno na Bitcoin blockchainu",
        okBlock: "Blok {height} · {date} UTC.",
        okDetail:
          "SHA-256 slike odgovara proofu, a merkle root proofa odgovara block headeru na lancu. Bez povjerenja u ovaj site ili kalendar servere.",
        viewBlock: "vidi blok ↗",
        failHash: "Slika ne odgovara proofu — datoteka je promijenjena.",
        failNoBtc: "Proof još nema Bitcoin atestaciju (još je pending).",
        failNet: "Bitcoin block explorer nedostupan — pokušaj ponovno.",
        failMerkle: "Merkle root ne odgovara block headeru.",
        manualPre: "Ručno: preuzmi ",
        manualImage: "sliku",
        manualOts: "proof",
        manualMid: ", ubaci oboje na ",
        manualPost: ".",
        sha256: "SHA-256 slike",
        copy: "Kopiraj SHA-256",
        copied: "Kopirano!",
      },
    },
  },

  claude: {
    heading: "Claude Code — AI-native inženjering",
    subheading:
      "Claude Code u svakodnevnoj upotrebi od {date} — telemetrija iskopana iz lokalnih transkripata, dnevnih git snapshotova i izvorima potkrijepljenog javnog zapisa.",
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
      "{from}–{to}: djelomični podaci — legacy format povijesti bez timestampova, korupcija datoteka u srpnju 2025. (5 datoteka) i nedokumentirane rupe (tra 2025.; kol–lis 2025.). Stvarna upotreba veća je od prikazane.",
    gapNoteFull:
      "Svakodnevna upotreba počela je {from} — no razdoblje {from}–{to} samo je djelomično zabilježeno: legacy format bez timestampova, korupcija datoteka u srpnju 2025. (5 datoteka) i automatski backupi koji su krenuli tek 2026. Samo rekonstruirani isječak svi–srp 2025. sadrži ~{prompts} promptova kroz {projects} projekata; stupci podcjenjuju rano razdoblje, ne upotrebu.",
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
    historyTitle: "Povijest i potrošnja — širi zapis",
    historySub:
      "Brojke koje lokalno rudarenje ne vidi, preuzete iz izvorima potkrijepljenog javnog zapisa (računi i snimke zaslona proizvoda). Svaka nosi status verifikacije.",
    verified: "verificirano",
    estimated: "procjena",
    histConvos: "Claude.ai razgovora",
    histConvosSub: "snimka stanja, {date} · Pro plan",
    histSpend: "ukupna potrošnja na Anthropic",
    histSpendSub: "{invoices} računa · {from} → {to} ({months} mjeseci) · prosjek €{avg}/mj",
    histPeak: "razdoblje najvišeg plana",
    histPeakSub: "€{monthly}/mj × 5 = €{total} ({period})",
    histEarly: "rekonstruirana rana era",
    histEarlySub:
      "{period}: {prompts} promptova · {projects} projekata · ~{messages} poruka (korupcija datoteka, srpanj 2025.)",
    histSnapshot: "/stats snimka ({date})",
    histSnapshotSub:
      "{sessions} sessiona · najduži {longest} · streak {streak} dana · najaktivniji dan {mostActive}",
    historyDocLink: "Cijeli potkrijepljeni zapis",
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

  blog: {
    title: "Blog",
    subtitle: "Povremene bilješke o AI-native inženjeringu.",
    backToCv: "Natrag na CV",
    allPosts: "Svi članci",
    readPost: "Pročitaj",
    sources: "Izvori",
  },
};

export const messages: Record<Locale, Messages> = { en, hr };
