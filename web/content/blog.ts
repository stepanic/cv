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
    slug: "colossus-lease-in-my-own-usage-data",
    date: "2026-08-27",
    tags: ["Claude Code", "Telemetry", "Measurement", "Anthropic", "Data analysis"],
    title: {
      en: "Four checks on whether a datacenter lease shows up in my own usage data",
      hr: "Četiri provjere: vidi li se najam podatkovnog centra u mojim podacima o korištenju",
    },
    lead: {
      en: "In May 2026 Anthropic leased the whole of xAI's Colossus 1 for $1.25 billion a month. I assumed the effect was visible in my own Claude Code telemetry. It is not. Three checks contradict the assumption and a fourth explains where the apparent jump came from.",
      hr: "Anthropic je u svibnju 2026. unajmio cijeli xAI-jev Colossus 1 za 1,25 milijardi dolara mjesečno. Pretpostavio sam da se to vidi u mojoj telemetriji Claude Codea. Ne vidi se. Tri provjere govore protiv pretpostavke, a četvrta objašnjava odakle prividni skok.",
    },
    body: {
      en: `I assumed a compute deal signed in Tennessee was measurable in my own Claude Code usage. Below are the four checks I ran against my own telemetry, and the result: the assumption does not survive any of them.

## The claim being tested

On 6 May 2026 xAI granted Anthropic exclusive access to all of Colossus 1 near Memphis — more than 220,000 Nvidia GPUs (H100, H200, GB200) and 300 MW. The price became public on 20 May in SpaceX's S-1 filing: $1.25 billion a month through May 2029, terminable by either side on 90 days' notice. Separately, Google leases roughly 110,000 GPUs at Memphis and Southaven for $920 million a month from October 2026.

My claim was narrower than the deal: that the added capacity was visible in how Claude Code behaved for me, and specifically that my usage stepped up at the start of May because of it.

## The data

Claude Code writes every session to \`~/.claude/projects/**/*.jsonl\`. The script \`scripts/mine-claude-history.mjs\` in this repo aggregates those transcripts together with daily git snapshots from [dotclaude-sync](https://github.com/stepanic/dotclaude-sync) and Claude Code's own stats cache. Token counts are deduplicated by \`message.id:requestId\` and priced from public per-model API rates. Totals as of 26 August 2026: 4,157 sessions, 195 projects, 444,234 messages, 21.27 billion tokens.

## Check 1 — when the step actually occurs

Daily token averages over the days that have data:

| period | average | days with data |
|---|---|---|
| 15–30 April | 94M/day | 10 |
| 1–11 May | 51M/day | 9 |
| 12–31 May | 182M/day | 19 |
| June | 218M/day | 29 |

The first eleven days of May are the quietest stretch in the window, below the second half of April. The step is at 12 May, six days after the contract date and eight days before it was public. The strongest single day in May is 26 May at 483M tokens.

## Check 2 — which model was running

First appearance of each model in my transcripts, taken as the earliest \`timestamp\` on an assistant event carrying \`message.usage\`:

| model | first seen |
|---|---|
| opus-4-6 | 10 Feb 2026 |
| opus-4-7 | 17 Apr 2026 |
| sonnet-4-6 | 28 May 2026 |
| opus-4-8 | 29 May 2026 |
| fable-5 | 9 Jun 2026 |
| sonnet-5 | 30 Jun 2026 |
| opus-5 | 24 Jul 2026 |

Every session in May ran \`opus-4-7\`. The model did not change at any point during the month, so a model swap cannot account for the step. Opus 5 — the model I had named as the cause — does not appear until 24 July, eleven weeks later.

## Check 3 — when the measuring instrument changed

Claude Code prunes local transcripts after 30 days by default. My history survives that only because dotclaude-backup commits a daily snapshot of \`~/.claude\`. Its first commit is **12 May 2026**, the same date as the step.

Coverage on either side of that date:

| window | days missing from the daily series |
|---|---|
| 1 Mar – 11 May | 45 of 72 |
| 12 May – 31 Jul | 2 of 81 |

Before the backup existed, 63% of days are absent; after it, 2%. The apparent tripling in daily tokens sits exactly on the boundary where the record stopped being lossy. That is sufficient to explain a large part of the step without any change in the world.

## Check 4 — a metric that measures supply rather than demand

Token counts measure how much I asked for. They say nothing about how much capacity was available. The nearest supply-side signal in the transcripts is the rate of overload and limit errors, normalized by assistant messages:

| month | errors per 1,000 assistant messages |
|---|---|
| May | 0.33 |
| June | 1.85 |
| July | 1.36 |
| August | 1.22 |

The rate rises after May. If the lease had relieved capacity pressure on my sessions, this is the series that should fall.

## Result

Checks 1, 2 and 4 contradict the hypothesis. Check 3 offers a sufficient alternative explanation for the observation that produced it. The correct statement is that my usage data cannot detect the lease, not that the lease had no effect.

The general error is worth naming precisely, because it is easy to repeat: a consumption metric collected by the consumer measures demand. Attributing a change in it to a supplier-side event requires either a supplier-side metric or a controlled comparison, and I had neither.

## Limitations

- Coverage before 12 May 2026 is reconstructed from the union of older snapshots and \`stats-cache.json\`. The April baseline is therefore unreliable in both directions; actual April usage may well have been higher than recorded.
- Session counts are not comparable across the whole series — May shows 170 and June 2,016, a difference too large to be real. Something changed in what counts as a session, so this analysis uses tokens throughout.
- Overload errors also rise with my own concurrency, not only with service load. Their increase is not evidence that capacity got worse, only an absence of evidence that it got better.

## What would actually test the claim

Serving-side measurements, collected before the question is asked: time to first token, tokens per second, and the share of 5xx responses, each segmented by model and hour of day, with a baseline predating the event. Claude Code transcripts contain some of this, but I had defined no baseline, and a baseline chosen after you know what you are looking for is not a baseline.

The measurements, the reproducible commands and the full limitations are in [docs/2026-08-27-colossus-hipoteza-dvije-verzije.md](https://github.com/stepanic/cv/blob/main/docs/2026-08-27-colossus-hipoteza-dvije-verzije.md).`,
      hr: `Pretpostavio sam da se ugovor o zakupu računalnih kapaciteta, potpisan u Tennesseeju, dade izmjeriti u mom korištenju Claude Codea. Slijede četiri provjere nad vlastitom telemetrijom i njihov ishod: pretpostavka ne preživljava nijednu.

## Tvrdnja koja se provjerava

xAI je 6. svibnja 2026. Anthropicu dao isključiv pristup cijelom Colossusu 1 kraj Memphisa, dakle više od 220.000 Nvidijinih grafičkih procesora (H100, H200, GB200) i 300 megavata. Cijena je objavljena 20. svibnja u SpaceX-ovu prospektu S-1: 1,25 milijardi dolara mjesečno do svibnja 2029., uz otkazni rok od 90 dana za obje strane. Google zasebno zakupljuje oko 110.000 procesora u Memphisu i Southavenu za 920 milijuna dolara mjesečno, od listopada 2026.

Moja je tvrdnja bila uža od samog ugovora: da se dodani kapacitet vidi u tome kako se Claude Code kod mene ponaša, i to tako da mi je potrošnja porasla početkom svibnja upravo zbog njega.

## Podaci

Claude Code svaku sesiju zapisuje u \`~/.claude/projects/**/*.jsonl\`. Skripta \`scripts/mine-claude-history.mjs\` u ovom repozitoriju te transkripte spaja s dnevnim git snimkama alata [dotclaude-sync](https://github.com/stepanic/dotclaude-sync) i s međuspremnikom statistike samoga Claude Codea. Tokeni se razdvajaju po ključu \`message.id:requestId\` i vrednuju po javnom cjeniku sučelja za svaki model. Stanje na 26. kolovoza 2026.: 4157 sesija, 195 projekata, 444.234 poruke, 21,27 milijardi tokena.

## Prva provjera: kad se stepenica doista događa

Dnevni prosjeci tokena, računati nad danima za koje podaci postoje:

| razdoblje | prosjek | dana s podacima |
|---|---|---|
| 15. – 30. travnja | 94 mln/dan | 10 |
| 1. – 11. svibnja | 51 mln/dan | 9 |
| 12. – 31. svibnja | 182 mln/dan | 19 |
| lipanj | 218 mln/dan | 29 |

Prvih jedanaest dana svibnja najmirniji su dio promatranog razdoblja i slabiji od druge polovice travnja. Stepenica je 12. svibnja, dakle šest dana nakon potpisa i osam dana prije nego što je ugovor postao javan. Najjači pojedinačni dan u svibnju jest 26. svibnja s 483 milijuna tokena.

## Druga provjera: koji je model radio

Prva pojava svakog modela u transkriptima, uzeta kao najraniji \`timestamp\` na asistentskom događaju koji nosi \`message.usage\`:

| model | prvi put |
|---|---|
| opus-4-6 | 10. veljače 2026. |
| opus-4-7 | 17. travnja 2026. |
| sonnet-4-6 | 28. svibnja 2026. |
| opus-4-8 | 29. svibnja 2026. |
| fable-5 | 9. lipnja 2026. |
| sonnet-5 | 30. lipnja 2026. |
| opus-5 | 24. srpnja 2026. |

Sve svibanjske sesije vrtjele su \`opus-4-7\`. Model se tijekom mjeseca nije mijenjao ni jednom, pa promjena modela ne može objasniti stepenicu. Opus 5, koji sam prozvao uzrokom, javlja se tek 24. srpnja, jedanaest tjedana poslije.

## Treća provjera: kad se promijenio mjerni instrument

Claude Code zadano briše lokalne transkripte nakon 30 dana. Moja povijest to preživljava samo zato što dotclaude-backup svakodnevno commita snimku direktorija \`~/.claude\`. Njegov je prvi commit **12. svibnja 2026.**, dakle istoga dana kad i stepenica.

Pokrivenost s obje strane toga datuma:

| razdoblje | dana koji nedostaju u dnevnom nizu |
|---|---|
| 1. 3. – 11. 5. | 45 od 72 |
| 12. 5. – 31. 7. | 2 od 81 |

Prije nego što je sigurnosna kopija postojala nedostaje 63 posto dana, poslije nje dva posto. Utrostručenje dnevne potrošnje leži točno na granici na kojoj zapis prestaje gubiti podatke. To je dovoljno da objasni velik dio stepenice bez ijedne promjene u vanjskom svijetu.

## Četvrta provjera: mjera koja opisuje ponudu, a ne potražnju

Broj tokena mjeri koliko sam tražio. O raspoloživom kapacitetu ne govori ništa. Najbliži pokazatelj sa strane posluživanja koji u transkriptima postoji jest učestalost grešaka preopterećenja i ograničenja, svedena na broj asistentskih poruka:

| mjesec | grešaka na 1000 asistentskih poruka |
|---|---|
| svibanj | 0,33 |
| lipanj | 1,85 |
| srpanj | 1,36 |
| kolovoz | 1,22 |

Nakon svibnja učestalost raste. Da je zakup olakšao pristup kapacitetu u mojim sesijama, upravo bi taj niz morao padati.

## Ishod

Prva, druga i četvrta provjera govore protiv hipoteze. Treća nudi dovoljno objašnjenje za samo opažanje koje ju je izazvalo. Ispravno je reći da moji podaci o korištenju ne mogu otkriti taj zakup, a ne da zakup nije imao učinka.

Pogrešku vrijedi imenovati točno, jer se lako ponavlja: mjera potrošnje koju prikuplja sam potrošač opisuje potražnju. Da bi se promjena u njoj pripisala događaju na strani dobavljača, treba ili mjera sa strane dobavljača ili kontrolirana usporedba. Nisam imao ni jedno ni drugo.

## Ograničenja

- Pokrivenost prije 12. svibnja 2026. rekonstruirana je iz unije starijih snimaka i datoteke \`stats-cache.json\`. Travanjska osnovica zato nije pouzdana ni u jednom smjeru; stvarna je potrošnja mogla biti i viša od zabilježene.
- Broj sesija nije usporediv kroz cijeli niz. Svibanj pokazuje 170, a lipanj 2016, što je prevelika razlika da bi bila stvarna. Nešto se promijenilo u tome što se broji kao sesija, pa se u ovoj analizi svugdje koriste tokeni.
- Greške preopterećenja rastu i s mojom vlastitom paralelizacijom, ne samo s opterećenjem usluge. Njihov porast nije dokaz da je kapacitet lošiji, nego samo izostanak dokaza da je bolji.

## Čime bi se tvrdnja doista provjerila

Mjerenjima sa strane posluživanja, i to prikupljenima prije nego što se pitanje postavi: vrijeme do prvoga tokena, broj tokena u sekundi i udio odgovora s greškom 5xx, sve razvrstano po modelu i satu u danu, uz osnovicu koja prethodi događaju. Transkripti Claude Codea dio toga sadrže, ali osnovicu nisam bio definirao, a osnovica odabrana nakon što već znaš što tražiš nije osnovica.

Mjerenja, naredbe kojima se ponavljaju i potpun popis ograničenja stoje u [docs/2026-08-27-colossus-hipoteza-dvije-verzije.md](https://github.com/stepanic/cv/blob/main/docs/2026-08-27-colossus-hipoteza-dvije-verzije.md).`,
    },
    sources: [
      {
        title: "Anthropic will pay xAI $1.25B per month for compute — TechCrunch, 20 May 2026",
        url: "https://techcrunch.com/2026/05/20/anthropic-will-pay-xai-1-25-billion-per-month-for-compute/",
      },
      {
        title: "SpaceX IPO filing reveals the Colossus 1 lease terms — Data Center Dynamics",
        url: "https://www.datacenterdynamics.com/en/news/spacex-ipo-filing-reveals-anthropic-set-to-pay-musks-firm-125bn-a-month-to-rent-xai-data-center-space/",
      },
      {
        title: "Google to pay $920 million monthly for Memphis and Southaven capacity — Data Center Dynamics",
        url: "https://www.datacenterdynamics.com/en/news/google-to-pay-920-million-to-spacex-monthly-for-ai-capacity/",
      },
      {
        title: "dotclaude-sync — daily git snapshots of ~/.claude, the reason this history exists at all",
        url: "https://github.com/stepanic/dotclaude-sync",
      },
    ],
  },
  {
    slug: "wrap-up-skill-mined-from-my-own-transcripts",
    date: "2026-08-26",
    tags: ["Claude Code", "Skills", "AI-native", "Developer tooling", "Open source"],
    title: {
      en: "I mined a Claude Code skill out of 147 of my own sessions — and the data corrected me twice",
      hr: "Izmajnirao sam Claude Code skill iz 147 vlastitih sesija — i podaci su me ispravili dvaput",
    },
    lead: {
      en: "I kept retyping the same end-of-session paragraph. Instead of writing the shortcut from memory, I counted what I actually asked for across 145 projects of local transcripts. The counts disagreed with my self-image in two useful places.",
      hr: "Stalno sam pretipkavao isti odlomak na kraju sesije. Umjesto da prečac napišem po sjećanju, prebrojao sam što doista tražim kroz 145 projekata lokalnih transkripata. Brojke se na dva korisna mjesta nisu složile s mojom slikom o sebi.",
    },
    body: {
      en: `At the end of almost every Claude Code session I was typing a variation of the same paragraph:

> super, daj sve commitaj i pushaj, update memory fajlova i ako u ovom chatu postoji neko znanje koje nije trajno u codebaseu trajno ga spremi u markdown dokument ako i treba s mermaidjs vizualizacijama i nakon toga pripremi chat za clear

Roughly: *commit and push everything, update the memory files, and if this chat produced knowledge that is not permanently in the codebase, write it into a markdown document, with mermaid diagrams if it needs them, then prepare the chat for \`/clear\`.*

So on 4 August 2026 I asked for a shortcut. The interesting part is what happened next: the skill was not written from my description of my habit. It was **mined out of my own transcripts**, and the counts corrected me twice.

## The evidence was already on disk

Claude Code stores every session as JSONL under \`~/.claude/projects/\`. At that moment: 145 project directories, 2.5 GB. So the first step was not writing a file, it was counting one:

\`\`\`bash
cd ~/.claude/projects
grep -rliE "pripremi.{0,30}chat za clear" --include=*.jsonl . | wc -l
# 147
\`\`\`

**147 sessions** contained the phrase. Deduplicating the messages I had actually typed gave **119 distinct phrasings** of the same request — "sve commitaj i pushaj i preimremi chat za clear", "ok, updejtaj memory fajlove i pripremi chat za clear", typos and all. That is the honest shape of a habit: not one prompt, a cloud of near-identical ones.

Then the part that actually shaped the skill — counting which steps show up in the fullest variants:

| step I asked for | share of variants |
|---|---|
| "prepare the chat for clear" | **100%** |
| commit + push | 88% |
| update memory files | 70% |
| write a markdown document | 41% |
| mermaid diagram | 12% |
| touch \`docs/\` or \`CLAUDE.md\` explicitly | 0% |

## The two things I had wrong about myself

**Mermaid is not a default.** I *feel* like I ask for diagrams constantly. I ask for them 12% of the time. Had I written the skill from memory it would have drawn a diagram on every run — faithful to my self-image, wrong about my behaviour. What went into the file instead: *use mermaid when a relationship or a flow is not obvious from prose; do not draw a diagram for something that is one sentence.*

**The most valuable step was missing from my own prompt.** The longest variants ask for a handoff prompt in the clipboard, ready to paste into a fresh session after \`/clear\`. It was even recorded in a memory file. But it had dropped out of the sentence I type, because I had started assuming it. Mining surfaced a step my habit had gone silent about, and it became step 4.

## The rule in red

One line in the skill is marked with a red dot: **never \`git add -A\`.**

That is not a style preference, it is a near-miss written down. During the very session that produced the skill, a neighbouring repo's working copy held an unfinished \`.gitignore\` and a set of half-written shell scripts, untracked, while unrelated work was being committed. \`git add -A\` would have pushed somebody's half-done afternoon to \`main\`.

So the skill stages **by name**, and for any modified file the agent does not remember touching, it runs \`git diff\` and leaves it alone if it is not its own. Same paragraph forbids committing cron-written snapshots and \`.env\`, and forbids reporting "pushed" without checking the output of the push.

I think that is the general shape of a rule worth putting in a skill: not a preference, a thing that almost went wrong once.

## What it actually does

Five steps, in order, autonomously to the end:

1. **Commit + push across every repo touched in the session.** Work crosses repo boundaries constantly — a backend change, the dashboard that reads it, the fetcher that feeds it — and the last one is the one you forget. Staged by name, semantic commit messages whose body explains *why*, push verified from its output.
2. **Memory files.** One fact per file, update the existing file rather than creating a duplicate, only what still holds for future sessions.
3. **Knowledge that is not in the codebase**, into \`docs/YYYY-MM-DD-topic.md\`. The framing that makes this step work: not "what did we do" — git already knows that — but **"what would the next pass have to rediscover"**. Rejected alternatives and why. The measurement that decided a threshold. The silent failure that cost an afternoon.
4. **A handoff prompt into the clipboard** *and* printed in the reply, because the clipboard has a habit of getting lost before \`/clear\`.
5. **A summary whose most important section is what is still open or unverified.**

It cannot run \`/clear\` itself. That is a built-in CLI command, so the last line tells me to type it.

## Two entry points, on purpose

You can invoke it as \`/wrap-up\`. You can also just keep typing your usual sentence: the \`description:\` field contains the real phrases from those 119 variants, so the skill triggers on its own. A shortcut you have to remember is a shortcut you will forget — the whole point was to automate a habit, not to replace it with a new one to maintain.

## Does it hold up

Between 4 and 26 August 2026 it fired **47 times across 11 working days**, in every repo I touched, not just the one it was born in.

The failure mode it removes is not typing effort. It is the session that ends with a good measurement, a rejected approach and the reason for it, all of it alive only in a context window that is about to be cleared.

## Mine your own

The method transfers to any prompt you keep retyping. Count the occurrences, dedupe the variants, count which steps appear, then write the skill against the counts instead of your recollection, and put the real phrasings into \`description:\`.

Two caveats, both of which bit me:

- **The 30-day pruning is a default, not a law.** Claude Code deletes local transcripts after 30 days, but \`cleanupPeriodDays\` in \`~/.claude/settings.json\` sets that window — I run \`365\`. Raise it *before* you need the history, because the setting cannot bring back what has already gone. And for a durable copy, back the directory up too: [dotclaude-sync](https://github.com/stepanic/dotclaude-sync) mirrors all of \`~/.claude\` — transcripts, settings **and the memory files** — into a daily git snapshot and pushes it to a private remote (Google Drive, in my case). That archive is the same one that powers the [usage stats](/#claude-code) on this site.
- **The skill contaminates its own evidence.** Once \`description:\` contains your trigger phrases, every session that loads the skill list contains them too, and a naive grep balloons. Re-running that first count today returns 562 sessions; filtered to messages a human actually typed it is 193. Filter to \`type == "user"\`.

The skill, in English and in the Croatian original, plus the mining script: [github.com/stepanic/cv/tree/main/skills/wrap-up](https://github.com/stepanic/cv/tree/main/skills/wrap-up). MIT. The part worth copying is the method, not my five steps.`,
      hr: `Na kraju gotovo svakog Claude Code razgovora tipkao sam varijaciju istog odlomka:

> super, daj sve commitaj i pushaj, update memory fajlova i ako u ovom chatu postoji neko znanje koje nije trajno u codebaseu trajno ga spremi u markdown dokument ako i treba s mermaidjs vizualizacijama i nakon toga pripremi chat za clear

Pa sam 4. kolovoza 2026. zatražio prečac. Zanimljiv je dio ono što se dogodilo poslije: skill nije napisan prema mom opisu vlastite navike. **Izmajniran je iz mojih transkripata**, a brojke su me ispravile dvaput.

## Dokazi su već bili na disku

Claude Code sprema svaku sesiju kao JSONL u \`~/.claude/projects/\`. U tom trenutku: 145 mapa projekata, 2,5 GB. Prvi korak zato nije bio pisanje datoteke nego brojanje:

\`\`\`bash
cd ~/.claude/projects
grep -rliE "pripremi.{0,30}chat za clear" --include=*.jsonl . | wc -l
# 147
\`\`\`

**147 sesija** sadržavalo je tu frazu. Nakon dedupliciranja poruka koje sam doista utipkao ostalo je **119 jedinstvenih formulacija** istog zahtjeva: "sve commitaj i pushaj i preimremi chat za clear", "ok, updejtaj memory fajlove i pripremi chat za clear", tipfeleri uključeni. To je pošten oblik navike: ne jedan prompt, nego oblak gotovo istih.

Onda dio koji je stvarno oblikovao skill — brojanje koji se koraci pojavljuju u najpotpunijim varijantama:

| korak koji sam tražio | udio varijanti |
|---|---|
| "pripremi chat za clear" | **100%** |
| commit + push | 88% |
| update memory fajlova | 70% |
| markdown dokument | 41% |
| mermaid dijagram | 12% |
| izrijekom \`docs/\` ili \`CLAUDE.md\` | 0% |

## Dvije stvari koje sam o sebi krivo mislio

**Mermaid nije zadano.** *Osjećam* da dijagrame tražim stalno. Tražim ih u 12% slučajeva. Da sam skill pisao po sjećanju, crtao bi dijagram u svakom prolazu — vjeran mojoj slici o sebi, netočan o mom ponašanju. U datoteku je umjesto toga otišlo: *mermaid kad odnos ili tijek nisu očiti iz teksta; ne crtaj dijagram za ono što je rečenica.*

**Najvrjedniji korak nedostajao je u mom vlastitom promptu.** Najduže varijante traže handoff prompt u clipboardu, spreman za lijepljenje u svježu sesiju nakon \`/clear\`. Bio je čak zapisan i u memory fajlu. Ali je ispao iz rečenice koju tipkam, jer sam ga počeo podrazumijevati. Rudarenje je izvuklo korak o kojem je moja navika zašutjela, i postao je korak 4.

## Pravilo crvenom

Jedna linija u skillu označena je crvenom točkom: **nikad \`git add -A\`.**

To nije stilska preferencija nego zapisan promašaj za dlaku. Baš tijekom sesije koja je proizvela skill, radna kopija susjednog repoa držala je nedovršen \`.gitignore\` i hrpu napola napisanih shell skripti, netrackanih, dok se commitao nepovezan rad. \`git add -A\` odnio bi tuđe napola gotovo poslijepodne na \`main\`.

Zato skill stageira **poimence**, a za svaki izmijenjen fajl kojeg se agent ne sjeća dirati pokreće \`git diff\` i ostavlja ga na miru ako nije njegov. Isti odlomak zabranjuje commitanje snapshota koje piše cron i \`.env\`, i zabranjuje javljanje "pushano" bez provjere izlaza pusha.

Mislim da je to opći oblik pravila koje vrijedi staviti u skill: ne preferencija, nego ono što je jednom umalo pošlo po zlu.

## Što zapravo radi

Pet koraka, redom, autonomno do kraja:

1. **Commit + push kroz svaki repo dirnut u sesiji.** Rad stalno prelazi granice repoa — promjena na backendu, dashboard koji je čita, fetcher koji je hrani — a zadnji je onaj koji zaboraviš. Stageano poimence, semantičke commit poruke čije tijelo objašnjava *zašto*, push provjeren iz izlaza.
2. **Memory fajlovi.** Jedan fakt po fajlu, ažuriraj postojeći umjesto duplikata, samo ono što vrijedi i za buduće sesije.
3. **Znanje koje nije u codebaseu**, u \`docs/YYYY-MM-DD-tema.md\`. Okvir koji taj korak čini upotrebljivim: ne "što smo radili" — to git već zna — nego **"što bi sljedeći prolaz morao ponovno otkriti"**. Odbačene alternative i zašto. Mjerenje koje je odredilo prag. Tihi kvar koji je pojeo poslijepodne.
4. **Handoff prompt u clipboard** *i* ispisan u odgovoru, jer se clipboard do \`/clear\` zna izgubiti.
5. **Sažetak čiji je najvažniji dio ono što je ostalo otvoreno ili neprovjereno.**

\`/clear\` ne može pokrenuti sam. To je ugrađena CLI komanda, pa mi zadnja linija kaže da je utipkam.

## Dva ulaza, namjerno

Možeš ga pozvati kao \`/wrap-up\`. A možeš i dalje tipkati svoju uobičajenu rečenicu: polje \`description:\` sadrži stvarne fraze iz tih 119 varijanti, pa se skill okida sam. Prečac kojeg se moraš sjetiti je prečac koji ćeš zaboraviti — poanta je bila automatizirati naviku, a ne zamijeniti je novom koju treba održavati.

## Drži li vodu

Između 4. i 26. kolovoza 2026. okinuo se **47 puta kroz 11 radnih dana**, u svakom repou koji sam dirao, ne samo u onom u kojem je nastao.

Ono što uklanja nije trud tipkanja. Nego sesija koja završi s dobrim mjerenjem, odbačenim pristupom i razlogom za to, a sve to živi jedino u kontekstu koji se sprema obrisati.

## Izmajniraj svoj

Metoda se prenosi na bilo koji prompt koji stalno pretipkavaš. Prebroji pojavljivanja, dedupliciraj varijante, prebroji koji se koraci javljaju, pa piši skill prema brojkama umjesto prema sjećanju, i stavi stvarne formulacije u \`description:\`.

Dvije zamke, obje su me ugrizle:

- **30-dnevno brisanje je zadano, nije zakon.** Claude Code briše lokalne transkripte nakon 30 dana, ali taj prozor postavlja \`cleanupPeriodDays\` u \`~/.claude/settings.json\` — kod mene stoji \`365\`. Podigni ga *prije* nego što ti povijest zatreba, jer postavka ne vraća ono što je već otišlo. I napravi trajnu kopiju: [dotclaude-sync](https://github.com/stepanic/dotclaude-sync) zrcali cijeli \`~/.claude\` — transkripte, postavke **i memory fajlove** — u dnevni git snapshot i gura ga na privatni remote (kod mene Google Drive). Isti taj arhiv pokreće [statistiku korištenja](/#claude-code) na ovoj stranici.
- **Skill kontaminira vlastite dokaze.** Čim \`description:\` sadrži tvoje okidačke fraze, sadrži ih i svaka sesija koja učita popis skillova, pa naivni grep nabuja. Isto brojanje danas vraća 562 sesije; filtrirano na poruke koje je čovjek doista utipkao, 193. Filtriraj na \`type == "user"\`.

Skill, na engleskom i u hrvatskom originalu, plus skripta za rudarenje: [github.com/stepanic/cv/tree/main/skills/wrap-up](https://github.com/stepanic/cv/tree/main/skills/wrap-up). MIT. Vrijedi kopirati metodu, ne mojih pet koraka.`,
    },
    sources: [
      {
        title: "The skill itself — SKILL.md, the Croatian original and the mining script",
        url: "https://github.com/stepanic/cv/tree/main/skills/wrap-up",
      },
      {
        title: "Claude Code — Agent Skills documentation",
        url: "https://docs.claude.com/en/docs/claude-code/skills",
      },
      {
        title: "dotclaude-sync — daily git snapshots of ~/.claude (transcripts, settings, memory) to a private remote",
        url: "https://github.com/stepanic/dotclaude-sync",
      },
    ],
  },
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
