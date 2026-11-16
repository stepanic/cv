# TODO — migracija weba s Next.js na Astro

Radna lista. Čuva se u repou da napredak preživi između sesija. Označene stavke su gotove
i provjerene (`npm --prefix site run check` zelen). Odluke idu u [docs/decisions.md](docs/decisions.md).

Plan po sesijama: [docs/plan.md](docs/plan.md). Handoff po sesiji: [docs/handoffs/](docs/handoffs/).

Legenda: `[x]` gotovo · `[ ]` otvoreno · `[~]` u radu · `(!)` traži korisnika · `→ Sn` planirana sesija

## F0 — temelj i polazno mjerenje

- [ ] Baseline postojećeg Next sitea: tekst svake stranice (EN i `?lang=hr`, nakon hidracije) u `site/test/baseline/` → S1
- [ ] Baseline težine: JS i HTML bajtovi po stranici iz `web/out/` u `site/test/baseline/next-weight.json` → S1
- [ ] Astro projekt u `site/` (static output, Tailwind, React integracija), verzije zapisane kao odluka → S1
- [ ] Učitavanje `../data` na build: port `web/lib/data.ts`, `types.ts`, `format.ts` → S1
- [ ] i18n na buildu: `t`, `lt`, `n` i plural pravila iz `web/lib/i18n/` bez React contexta → S1
- [ ] Layout: `<head>`, theme skripta prije prvog painta, `public/_headers` i ostali statički fajlovi → S1
- [ ] Rute `/` (EN) i `/hr/` s portanim Hero dijelom, 0 KB JS na tim stranicama → S1
- [ ] `npm --prefix site run check`: `astro check` + build + parity + mjerenje težine → S1

## F1 — naslovnica

- [ ] Header s jezičnim prekidačem kao linkom (`/` ↔ `/hr/`), ThemeToggle kao otok → S2
- [ ] Hero, Experience, Projects, Skills, Education, Footer kao `.astro` → S2
- [ ] Stats (copy gumb kao otok), OtsVerify kao otok, OpenSource → S3
- [ ] ClaudeCode kao statički `.astro` (u Nextu nema stanja ni handlera) → S3
- [ ] Parity naslovnice EN i HR prema baselineu: 0 razlika ili svaka razlika kao odluka → S3

## F2 — blog

- [ ] `web/content/blog.ts` → content collection, po jedan Markdown fajl po postu i jeziku → S4
- [ ] Rute `/blog`, `/blog/<slug>`, `/hr/blog`, `/hr/blog/<slug>` za svih 9 postova → S4
- [ ] Parity bloga EN i HR prema baselineu → S4

## F3 — SEO, kompatibilnost, mjerenje

- [ ] `hreflang`, canonical, Open Graph po jeziku i stranici, `html[lang]` po ruti → S5
- [ ] Stari linkovi s `?lang=hr` preusmjeravaju na `/hr/...` → S5
- [ ] Svaki URL iz `web/out/` postoji u `site/dist/` ili ima preusmjeravanje (skripta, 0 nedostaje) → S5
- [ ] CI builda i `site/` (bez deploya iz njega) → S5
- [ ] Usporedba težine i sadržaja Next vs Astro u `docs/research/` → S5
- [ ] (!) Korisnik odobrava prebacivanje produkcije → vrata prije S6

## F4 — prebacivanje (iza vrata)

- [ ] `web/wrangler.jsonc` → `site/wrangler.jsonc` s `assets.directory: ./dist`, isti Worker `stepanic-cv` → S6
- [ ] Root `package.json` (`web:*`, `deploy`, `build`) i `.github/workflows/ci.yml` na `site/` → S6
- [ ] `CLAUDE.md` (Layout, Routine maintenance) i `README.md` na `site/` → S6
- [ ] `web/` uklonjen iz repoa → S6
- [ ] Produkcija provjerena `curl`-om: HR tekst u HTML-u `/hr/`, težina JS-a kao u lokalnom mjerenju → S6
