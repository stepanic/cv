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
    slug: "three-years-of-revenuecat-manual-to-agentic",
    date: "2026-06-28",
    tags: ["RevenueCat", "In-App Purchases", "Flutter", "Claude Code", "AI-native"],
    title: {
      en: "Three years of RevenueCat, from docs-in-a-second-tab to an agent shipping the whole paywall",
      hr: "Tri godine RevenueCata, od dokumentacije-u-drugom-tabu do agenta koji isporuči cijeli paywall",
    },
    lead: {
      en: "I've shipped RevenueCat to production across three Flutter apps since 2023. The SDK barely changed; the way I integrate it changed completely — from reading every doc by hand to an agent wiring the entire monetization layer.",
      hr: "RevenueCat isporučujem u produkciju kroz tri Flutter aplikacije od 2023. SDK se jedva mijenjao; način na koji ga integriram promijenio se posve — od ručnog čitanja svake stranice dokumentacije do agenta koji ožiči cijeli sloj naplate.",
    },
    body: {
      en: `I've shipped RevenueCat to production for three years across three Flutter apps. The interesting part isn't the SDK — it's how the *way* I integrate it changed: from reading every doc by hand in 2023, to an agent wiring the entire monetization layer in 2026. \`purchases_flutter\` itself climbed 8.10 → 9.9 → 10.x across the three, but that's the least interesting number here.

## 2023 — the manual era (The Birth Deck)

My first RevenueCat commit is literally named "Setup RevenueCat", dated 15 February 2023, in [The Birth Deck](https://apps.apple.com/us/app/the-birth-deck/id1672044071) — a FlutterFlow app I built for a consulting client. Back then "integration" meant a hand-written wrapper around \`purchases_flutter\` (8.10.1), products configured by clicking around the dashboard, and the docs open in a second tab.

The paywall started granular — individual cards, videos, a birth packing list, two bundles — and over three years collapsed to a single monthly subscription. The last edit (March 2026) is the *only* hand-written commit among ~40 FlutterFlow codegen syncs on those files. That long, messy evolution is the honest shape of a real subscription product: you don't get the catalogue right on day one.

## 2025 — cross-platform, 100% agent-built (smpltsk)

[smpltsk](https://apps.apple.com/app/smpltsk/id6751039190) is a task app I built end-to-end as the sole engineer for a consulting client — and **83% of its commits (447 of 536) are co-authored by Claude Code**. RevenueCat is the system of record: a ~400-line service over \`purchases_flutter\` (9.9.0), a single \`premium_access\` entitlement, monthly / annual / a capped lifetime tier, [live on Google Play](https://play.google.com/store/apps/details?id=com.smpltsk) and the App Store through the full review gauntlet. The parts I'm proud of are the seams:

- **One paywall, two billing systems.** Mobile (iOS / Android / macOS) goes through RevenueCat; web and desktop fall back to Stripe in the same service, with a Cloud Functions webhook reconciling subscription state into Firestore. The app never has to care which rail a user came in on.
- **Provisioning as code.** A single \`config.json\` is the source of truth, and Node scripts drive App Store Connect (API key), Google Play (service account) and RevenueCat's REST API v2 to create the products — plus a TestStore setup so the whole flow is testable without waiting on store review.

## 2026 — the agentic era (Perfect Training)

The most recent integration — **Perfect Training**, a sports-training app — went in over a two-day Claude Code sprint. As I write this it's in review on both stores (Apple came back with a few details to fix; the Android build has been pending production review for nine days — that part is never fast), so there are no live numbers yet — but the architecture is the most interesting of the three. RevenueCat identity is linked to Firebase Auth (including already-signed-in sessions), and a RevenueCat webhook writes entitlement state into Firestore.

The detail I like most is a security one: the webhook validates the incoming \`app_user_id\` against a strict UID regex *before* it ever touches a Firestore path — so a malicious client can't smuggle a crafted user id to write into someone else's document. It also deep-merges only the subscription fields the server owns, deliberately leaving admin-owned fields (like a manual override) untouched, and gates SANDBOX vs PRODUCTION events. Webhooks act on the real world; the blast radius has to be bounded.

## The thing that closes the arc

This week I installed RevenueCat's own AI Toolkit — their Claude Code plugin plus a hosted MCP server — and went through it skill by skill. It configures the RevenueCat side (apps, products, entitlements, offerings) and reads store product state, but creating the actual products in App Store Connect, Play Console and Stripe still lands on a human. That's the same boundary I hit doing it by hand: the agent reaches a long way, and then there's a seam where the stores don't expose an API and a person steps in.

One security nuance worth knowing if you ship RevenueCat: the publishable SDK key in your app binary is *public* by design — anyone can pull it out of an APK. It identifies the app; it does **not** authorize reading the app's revenue. That's why features like Verified Metrics are explicitly opt-in: identity is not authorization. A good principle to carry into anything agent-facing.

Three apps, three years, one direction of travel: from me reading the docs to an agent writing the integration — with the human still owning the seams the machine can't reach yet.`,
      hr: `RevenueCat isporučujem u produkciju već tri godine, kroz tri Flutter aplikacije. Zanimljiv dio nije SDK — nego kako se *način* na koji ga integriram promijenio: od ručnog čitanja svake stranice dokumentacije 2023., do agenta koji 2026. ožiči cijeli sloj naplate. Sam \`purchases_flutter\` popeo se 8.10 → 9.9 → 10.x kroz te tri aplikacije, ali to je ovdje najmanje zanimljiva brojka.

## 2023. — ručna era (The Birth Deck)

Moj prvi RevenueCat commit doslovno se zove "Setup RevenueCat", datiran 15. veljače 2023., u [The Birth Decku](https://apps.apple.com/us/app/the-birth-deck/id1672044071) — FlutterFlow aplikaciji koju sam izradio za konzultantskog klijenta. Tada je "integracija" značila ručno napisan wrapper oko \`purchases_flutter\` (8.10.1), produkte konfigurirane klikanjem po dashboardu i dokumentaciju otvorenu u drugom tabu.

Paywall je krenuo granularno — pojedinačne kartice, videi, popis za bolnicu, dva bundlea — i kroz tri godine se sveo na jednu mjesečnu pretplatu. Zadnja izmjena (ožujak 2026.) *jedini* je ručno napisan commit među ~40 FlutterFlow codegen syncova na tim datotekama. Ta duga, neuredna evolucija pošten je oblik stvarnog pretplatničkog proizvoda: katalog ne pogodiš prvi dan.

## 2025. — cross-platform, 100% agentski (smpltsk)

[smpltsk](https://apps.apple.com/app/smpltsk/id6751039190) je task aplikacija koju sam izradio od početka do kraja kao jedini inženjer za konzultantskog klijenta — i **83% njezinih commitova (447 od 536) co-authored je s Claude Codeom**. RevenueCat je sustav istine: servis od ~400 linija nad \`purchases_flutter\` (9.9.0), jedan \`premium_access\` entitlement, mjesečna / godišnja / ograničena doživotna razina, [živo na Google Playu](https://play.google.com/store/apps/details?id=com.smpltsk) i App Storeu kroz cijeli review. Najponosniji sam na šavove:

- **Jedan paywall, dva sustava naplate.** Mobitel (iOS / Android / macOS) ide kroz RevenueCat; web i desktop padaju na Stripe u istom servisu, a Cloud Functions webhook usklađuje stanje pretplate u Firestore. Aplikaciju ne zanima kojom je prugom korisnik ušao.
- **Provisioning kao kod.** Jedan \`config.json\` je izvor istine, a Node skripte voze App Store Connect (API ključ), Google Play (service account) i RevenueCat REST API v2 da kreiraju produkte — plus TestStore setup da je cijeli tok testabilan bez čekanja na store review.

## 2026. — agentska era (Perfect Training)

Najnovija integracija — **Perfect Training**, aplikacija za sportski trening — ušla je u dvodnevnom Claude Code sprintu. Dok ovo pišem, u review je na obje trgovine (Apple je vratio par detalja za popraviti; Android build već devet dana čeka produkcijski review — taj dio nikad nije brz), pa još nema živih brojki — ali arhitektura je najzanimljivija od sve tri. RevenueCat identitet vezan je uz Firebase Auth (uključujući već prijavljene sesije), a RevenueCat webhook upisuje stanje entitlementa u Firestore.

Detalj koji najviše volim sigurnosni je: webhook validira dolazni \`app_user_id\` strogim UID regexom *prije* nego što dotakne ijednu Firestore putanju — pa zlonamjerni klijent ne može prokrijumčariti izmišljeni user id da piše u tuđi dokument. Uz to deep-merge dira samo polja pretplate u vlasništvu servera, namjerno ostavljajući polja u vlasništvu admina (poput ručnog override-a) netaknutima, i razdvaja SANDBOX od PRODUCTION događaja. Webhookovi djeluju na stvarni svijet; domet štete mora biti omeđen.

## Što zatvara luk

Ovaj tjedan sam instalirao RevenueCatov vlastiti AI Toolkit — njihov Claude Code plugin plus hostani MCP server — i prošao ga skill po skill. Konfigurira RevenueCat stranu (apps, produkte, entitlemente, offeringe) i čita stanje store produkata, ali kreiranje samih produkata na App Store Connectu, Play Consoleu i Stripeu i dalje pada na čovjeka. To je ista granica na koju sam naišao radeći ručno: agent doseže jako daleko, a onda dođe šav gdje trgovine ne nude API i čovjek uskoči.

Jedna sigurnosna nijansa koju vrijedi znati ako isporučuješ RevenueCat: publishable SDK ključ u binaryju aplikacije *javan* je po dizajnu — svatko ga može izvući iz APK-a. On identificira aplikaciju; **ne** ovlašćuje čitanje njezine zarade. Zato su značajke poput Verified Metrics izrijekom opt-in: identitet nije autorizacija. Dobar princip za sve što je okrenuto agentima.

Tri aplikacije, tri godine, jedan smjer kretanja: od mene koji čitam dokumentaciju do agenta koji piše integraciju — uz čovjeka koji i dalje drži šavove do kojih stroj još ne doseže.`,
    },
    sources: [
      {
        title: "RevenueCat AI Toolkit — Claude Code plugin + MCP server",
        url: "https://github.com/RevenueCat/ai-toolkit",
      },
      {
        title: "RevenueCat MCP server — docs",
        url: "https://www.revenuecat.com/docs/tools/mcp",
      },
      {
        title: "smpltsk — App Store",
        url: "https://apps.apple.com/app/smpltsk/id6751039190",
      },
      {
        title: "The Birth Deck — App Store",
        url: "https://apps.apple.com/us/app/the-birth-deck/id1672044071",
      },
      {
        title: "RevenueCat Verified Metrics — trustless live revenue proof",
        url: "https://www.revenuecat.com/verified",
      },
    ],
  },
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
