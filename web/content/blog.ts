// Blog content — bilingual, markdown bodies rendered at build time by
// lib/blog.ts (marked). Newest post first is enforced by date sorting there.

export interface BlogPost {
  slug: string;
  /** ISO date "YYYY-MM-DD". */
  date: string;
  tags: string[];
  title: { en: string; hr: string };
  lead: { en: string; hr: string };
  body: { en: string; hr: string }; // markdown
  sources: { title: string; url: string }[];
}

export const posts: BlogPost[] = [
  {
    slug: "claude-code-limit-increases-2026",
    date: "2026-06-27",
    tags: ["Claude Code", "Anthropic", "AI-native"],
    title: {
      en: "Why my Claude Code token count exploded in 2026 — and what Anthropic changed",
      hr: "Zašto mi je broj Claude Code tokena eksplodirao 2026. — i što je Anthropic promijenio",
    },
    lead: {
      en: "Of 10.8B tokens processed with Claude Code, almost all landed in the last three months. It looks like a late start. It isn't — here's what actually happened.",
      hr: "Od 10,8 milijardi tokena obrađenih Claude Codeom, gotovo svi su pali u zadnja tri mjeseca. Izgleda kao kasni početak. Nije — evo što se stvarno dogodilo.",
    },
    body: {
      en: `My public [usage stats](/#claude-code) show something that looks suspicious at first glance: of **10.8B tokens** processed with Claude Code, the overwhelming majority landed in the last three months. May 2026 alone was 3.9B tokens; June, 5.9B. Before April 2026 the bars are slivers.

I have used Claude Code daily since April 2025, and spent real money on Anthropic the whole time — **€1,662 across 16 months** of invoices, peaking at €180/mo from July to November 2025. So why does the telemetry look like I only just started?

Three reasons, and one of them is a genuine product shift worth writing down.

## 1. Anthropic massively raised Claude Code limits in May 2026

This is the headline. In a few weeks Anthropic roughly doubled what a paying user can run:

- **6 May 2026** — the 5-hour usage caps were **doubled** for Pro, Max, Team and seat-based Enterprise, and the peak-hour reductions were removed entirely.
- **13 May 2026** — **weekly** limits were raised by a further **50%**, in effect through 13 July 2026.
- For Max specifically, the weekly Opus budget moved from ~50h to ~75h (Max 5×) and ~200h to ~300h (Max 20×).

The extra capacity came from Anthropic's compute agreement with SpaceX — the Colossus 1 data center, 300+ MW and 220,000+ GPUs.

The effect on my own numbers is unmistakable: the May→June jump lines up exactly with these changes. A higher ceiling simply lets me burn far more per week than was ever possible before.

## 2. "Tokens" is 97% cache reads

A token count is not a measure of effort. Of my 10.8B, **96.9% are cache-read tokens** — the context Claude Code re-reads on every agentic turn. Actual input is 0.1%, output 0.5%. So the number tracks *agentic intensity* — long sessions, large contexts, thousands of tool calls — which is exactly what scaled up once the limits did.

## 3. The early years are simply missing

The deeper reason the chart skews recent: most of my 2025 telemetry is **gone**. A timestamp-less legacy history format, a July 2025 corruption event, and automated backups that only began in 2026. My *spend* from that era is documented; my *tokens* are not. The chart cannot show what was never saved.

And the pruning is not just history — it is live. Reconstructing daily spend from the backup shows **~$9.3k** of API-equivalent usage over the last 90 days, but a local-only monitor (CodexBar reads only \`~/.claude\`, which Claude Code prunes after 30 days) would see just **~$6.0k** of it. The other **~$3.3k** survives only because the [dotclaude-sync](https://github.com/stepanic/dotclaude-sync) backup stitched the pruned transcripts back together — the same reconstruction that now drives the [daily-spend chart](/#claude-code).

So the recency is real ramp **+** raised limits **+** an accounting quirk **+** lost history — not a late start. The full, sourced breakdown lives on the [stats page](/#claude-code).`,
      hr: `Moja javna [statistika korištenja](/#claude-code) na prvi pogled izgleda sumnjivo: od **10,8 milijardi tokena** obrađenih Claude Codeom, ogromna većina pala je u zadnja tri mjeseca. Samo svibanj 2026. bio je 3,9 milijardi tokena; lipanj 5,9 milijardi. Prije travnja 2026. stupci su tek mrvice.

Claude Code koristim svakodnevno od travnja 2025. i cijelo vrijeme trošim stvaran novac na Anthropic — **€1.662 kroz 16 mjeseci** računa, s vrhuncem od €180/mj od srpnja do studenoga 2025. Pa zašto telemetrija izgleda kao da sam tek počeo?

Tri razloga, a jedan od njih je stvarna promjena proizvoda koju vrijedi zapisati.

## 1. Anthropic je u svibnju 2026. drastično podigao Claude Code limite

To je glavna vijest. U nekoliko tjedana Anthropic je otprilike udvostručio ono što plaćeni korisnik može pokrenuti:

- **6. svibnja 2026.** — 5-satni capovi **udvostručeni** za Pro, Max, Team i seat-based Enterprise, a peak-hour smanjenja potpuno maknuta.
- **13. svibnja 2026.** — **tjedni** limiti podignuti za dodatnih **50%**, na snazi do 13. srpnja 2026.
- Konkretno za Max, tjedni Opus budžet pomaknuo se s ~50h na ~75h (Max 5×) i s ~200h na ~300h (Max 20×).

Dodatni kapacitet došao je iz Anthropicovog compute dogovora sa SpaceX-om — data centar Colossus 1, 300+ MW i 220.000+ GPU-ova.

Učinak na moje brojke je nedvojben: skok svibanj→lipanj poklapa se točno s ovim promjenama. Viši strop jednostavno mi omogućuje da potrošim daleko više tjedno nego ikad prije.

## 2. "Tokeni" su 97% cache readova

Broj tokena nije mjera truda. Od mojih 10,8 milijardi, **96,9% su cache-read tokeni** — kontekst koji Claude Code iznova čita u svakom agentic koraku. Stvarni input je 0,1%, output 0,5%. Dakle brojka prati *agentic intenzitet* — duge sessije, velike kontekste, tisuće tool callova — što je upravo ono što je naraslo čim su narasli limiti.

## 3. Ranije godine jednostavno nedostaju

Dublji razlog zašto graf naginje recentnom: većina moje telemetrije iz 2025. je **nestala**. Legacy format povijesti bez timestampova, korupcija datoteka u srpnju 2025. i automatski backupi koji su krenuli tek 2026. Moja *potrošnja* iz te ere je dokumentirana; moji *tokeni* nisu. Graf ne može prikazati ono što nikad nije spremljeno.

A pruniranje nije samo povijest — događa se i uživo. Rekonstrukcija dnevne potrošnje iz backupa pokazuje **~$9,3k** API-ekvivalentne potrošnje u zadnjih 90 dana, ali lokalni monitor (CodexBar čita samo \`~/.claude\`, koji Claude Code briše nakon 30 dana) vidio bi tek **~$6,0k** toga. Preostalih **~$3,3k** preživi jedino zato što je [dotclaude-sync](https://github.com/stepanic/dotclaude-sync) backup spojio izbrisane transkripte — ista rekonstrukcija koja sad pokreće [graf dnevne potrošnje](/#claude-code).

Dakle recentnost je stvarni rast **+** podignuti limiti **+** računovodstveni artefakt **+** izgubljena povijest — a ne kasni početak. Potpuna, izvorima potkrijepljena razrada je na [stranici statistike](/#claude-code).`,
    },
    sources: [
      {
        title: "Anthropic — Higher usage limits & a compute deal with SpaceX",
        url: "https://www.anthropic.com/news/higher-limits-spacex",
      },
      {
        title: "9to5Google — Claude Code usage limits doubled (6 May 2026)",
        url: "https://9to5google.com/2026/05/06/claude-code-is-getting-higher-usage-limits-doubled-for-most-users/",
      },
      {
        title: "Apidog — Claude Code weekly limits +50% through July 2026",
        url: "https://apidog.com/blog/claude-code-weekly-limits-50-percent-increase-july-2026/",
      },
      {
        title: "morphllm — Claude Code usage limits (2026)",
        url: "https://www.morphllm.com/claude-code-usage-limits",
      },
      {
        title: "Daily spend reconstruction & the 30-day blind spot (this repo)",
        url: "https://github.com/stepanic/cv/blob/main/docs/claude-code-daily-reconstruction-2026.md",
      },
    ],
  },
];
