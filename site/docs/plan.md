# Plan: migracija weba s Next.js na Astro

## Zašto

Web na stepanic.domovina.ai (`web/`, Next.js 14 static export) cijeli je klijentska React
aplikacija: svih 15 komponenti ima `"use client"`, a naslovnica učitava 524 KB JS-a
(izmjereno 2026-11-17 zbrojem skripti iz `web/out/index.html`, nekomprimirano). Uzrok je
i18n preko React contexta i `?lang=hr`, zbog čega statički HTML sadrži samo engleski, pa
hrvatsku verziju ne vide tražilice ni link previewi. Cilj je isti sadržaj kao statički
HTML na dvije rute po jeziku, s JS-om samo za interaktivne otoke, na istom Cloudflare
Workeru.

## Arhitektura

| | Sada (`web/`) | Cilj (`site/`) |
| --- | --- | --- |
| Okvir | Next.js 14, `output: "export"` | Astro, static output |
| Jezik | `?lang=hr`, React context, localStorage | rute `/…` (EN) i `/hr/…` (HR), oba jezika u HTML-u |
| Komponente | 15 klijentskih React komponenti | `.astro`; React otoci samo za ThemeToggle, OtsVerify, copy gumb u Stats |
| Blog | `content/blog.ts` (TS stringovi, `marked`) | content collection, Markdown po postu i jeziku |
| Podaci | `../data` YAML i JSON na buildu | isto, port `lib/data.ts` |
| Hosting | Worker `stepanic-cv`, assets-only, `web/out` | isti Worker, `site/dist` |

`data/`, `typst/`, `dist/` (PDF-ovi) i skripte za statistiku se ne mijenjaju.

## Tvrdi uvjeti (svaka sesija)

- Repo je **javan**. Nikad tajne ni klijentska imena (pravilo allow-liste iz `CLAUDE.md`).
- **Svaki push na `main` deploya `web/` u produkciju** (`.github/workflows/ci.yml`, ako je
  postavljen `CLOUDFLARE_API_TOKEN`). Do S6 push smije mijenjati samo `site/` i dokumente,
  nikad `web/`, `wrangler.jsonc` ni CI deploy korak.
- `data/` je jedini izvor sadržaja. Tekst se ne prepisuje ručno u komponente.
- Paritet sadržaja mjeri se skriptom prema baselineu iz S1, ne okom.

## Sesije

| # | Faza | Paket | Odluke | Gotovo kad |
| --- | --- | --- | --- | --- |
| S0 | — | Plan | 1–99 | ovaj plan, TODO, odluke i handoffi u repou |
| S1 | F0 | Baseline Next sitea, Astro temelj, data/i18n port, Layout, Hero na `/` i `/hr/` | 100–199 | `npm --prefix site run check` zelen; baseline za sve rute u `site/test/baseline/`; `/` i `/hr/` imaju Hero tekst iz baselinea i 0 B JS-a |
| S2 | F1 | Header, Hero, Experience, Projects, Skills, Education, Footer, ThemeToggle otok | 200–299 | check zelen; parity tih sekcija EN i HR 0 razlika |
| S3 | F1 | Stats, OtsVerify, OpenSource, ClaudeCode | 300–399 | check zelen; parity cijele naslovnice EN i HR 0 razlika (ili svaka kao odluka); JS na `/` izmjeren i zapisan |
| S4 | F2 | Blog kao content collection, 4 rute | 400–499 | check zelen; parity `/blog` i svih 9 postova EN i HR |
| S5 | F3 | SEO, `?lang=` preusmjeravanje, kompatibilnost URL-ova, CI builda `site/`, izvještaj | 500–599 | URL skripta 0 nedostaje; izvještaj u `docs/research/`; pitanje za vrata na vrhu `S6.md` |
| S6 | F4 | **Vrata**, pa prebacivanje Workera, skripti, CI-ja i dokumenata; brisanje `web/` | 600–699 | produkcija provjerena `curl`-om; `web/` ne postoji; root `npm run build` zelen |

## Procjena i rizici

- Šest sesija nakon S0, linearno. S4 (blog) dira samo blog rute i mogao bi ići paralelno
  sa S2/S3 u worktreeju, ali dijeli Layout i i18n, pa je zadano linearno.
- **Vrata** su samo jedna, prije S6: push prebacivanja je produkcijski deploy.
- Najrizičniji paketi:
  - **S1**, jer baseline HR verzije postoji tek nakon hidracije u pregledniku (Playwright
    nad lokalnim `web/out`). Ako baseline ne uspije, parity se ne može mjeriti i lanac
    staje dok se ne nađe drugi način.
  - **S3**, `ClaudeCode.tsx` (731 linija) i `Stats.tsx` (359) su najveće komponente.
  - **S4**, Markdown renderer Astra nije `marked`; razlike u HTML-u treba vidjeti u parityju.
- Nije izmjereno: koliko će JS-a ostati na naslovnici i kolika je ušteda u HTML-u. Mjeri
  se u S3 i S5, ne procjenjuje unaprijed.
- Trošak: nema LLM ni plaćenih API poziva osim subagenata sesija.

## Gdje smo

S0 (2026-11-17): plan napisan, koda nema. Sljedeća je S1.
