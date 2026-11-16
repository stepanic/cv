# Handoffi za sesije S1–S6

Plan je u [../plan.md](../plan.md). Svaka sesija ima svoj handoff `SN.md`. Korisnik nakon
`/clear` kaže „nastavi astro” ili „nastavi zadnji handoff”, ili zalijepi prompt iz
clipboarda. „Nastavi astro” znači: prvi red u „Stanje lanca” koji nije gotov.

## Lanac

1. Sesija N počinje iz `site/docs/handoffs/SN.md`.
2. Sesija N radi svoj paket po pravilima ispod.
3. Na kraju sesija N:
   - označi `SN` kao gotov u tablici „Stanje lanca” (commit, check, kratka napomena) i
     stavke u `site/TODO.md`;
   - **ako je naučila nešto što mijenja neki od sljedećih paketa, uredi `S(N+1).md`**, a po
     potrebi i kasnije handoffe i plan. Nedovršeni dio paketa N ide na **vrh** `S(N+1).md`;
   - u `S(N+1).md` upiše polazni commit i stanje checka;
   - pozove `/wrap-up`. Handoff prompt za clipboard i `~/.claude/handoffs/cv/` je sadržaj
     `site/docs/handoffs/S(N+1).md`.
4. Ako sesija ostane bez konteksta usred paketa, nastavak je opet `SN` s popisom onoga što
   je ostalo na vrhu datoteke. Broj se ne povećava.
5. **Vrata prije S6:** S5 upisuje pitanje na vrh `S6.md`. S6 ne radi ništa dok korisnik ne
   odobri prebacivanje produkcije.

Handoff se smije mijenjati samo prema naprijed: gotovi `SN` se ne prepisuju, služe kao
povijest.

## Stanje lanca

| Sesija | Paket | Stanje | Commit | Check | Napomena |
| --- | --- | --- | --- | --- | --- |
| S0 | Plan | gotovo | d450622 | — | plan, TODO, odluke 1–8, handoffi S1–S6 |
| S1 | Baseline + Astro temelj | otvoreno | | | |
| S2 | Naslovnica I | otvoreno | | | |
| S3 | Naslovnica II | otvoreno | | | |
| S4 | Blog | otvoreno | | | |
| S5 | SEO, kompatibilnost, mjerenje | otvoreno | | | završava pitanjem za vrata |
| S6 | Prebacivanje produkcije | vrata | | | čeka korisnikovo odobrenje |

## Zajednička pravila (vrijede u svakoj sesiji)

- **Polazak:** naredba provjere je `npm --prefix site run check`, i potvrda u jednoj
  rečenici da je zeleno. Ako nije zeleno, prvo to popravi. **Iznimka S1:** check još ne
  postoji (S1 ga stvara), pa je polazak za S1 samo čist `git status --porcelain`;
  orkestrator (`todo-plan-exec`) prije S1 ne pokreće check. Repo `stepanic/cv` je
  **javan**, grana `main`, wrap-up pusha `main`.
- **Push je deploy:** svaki push na `main` pokreće CI koji deploya `web/` u produkciju. Do
  S6 nijedan commit ne smije mijenjati `web/`, `web/wrangler.jsonc` ni deploy korak u
  `.github/workflows/ci.yml` (odluka 7).
- **`web/` se može mijenjati izvan lanca** (druge sesije, npr. blog postovi). Na polasku svake sesije `git log <commit iz S1 baselinea>..HEAD -- web/`: ako ima commitova, ponovno snimi baseline (`site/scripts/baseline.mjs`) i portaj razliku u `site/` prije novog posla. Novi blog postovi nakon S4 idu u oba mjesta dok se `web/` ne obriše.
- **Opseg:** mijenja se `site/` i dokumenti lanca. `data/` je jedini izvor sadržaja i ne
  mijenja se radi migracije; ako je podatak u `data/` pogrešan, zapiši to u TODO kao
  zasebnu stavku.
- **Orkestracija:** posao rade Opus 5.5 subagenti (`model: "opus"`), glavna sesija
  orkestrira. Paket razbij na dva agenta: (a) port/implementacija, (b) parity, testovi i
  mjerenje. `effort` uvijek eksplicitno: `high` za kod, `medium` za čitanje. Najviše 2–3
  agenta paralelno. Fable samo kad korisnik to izričito traži.
- **Agentima zabrani** `site/TODO.md`, `site/docs/plan.md` i handoffe. Orkestrator ih
  ažurira nakon spajanja. Odluke agenti smiju dopisivati u svoj blok brojeva.
- **Testovi:** parity i mjerenje idu nad lokalno posluženim buildovima, bez mreže,
  bez tiho preskočenih provjera. Svaka prihvaćena razlika u parityju je odluka s brojem.
- **Trošak:** nema `claude -p` petlji. Prije posla s više od ~100 poziva daj procjenu.
- **Brojke s naredbom:** svaka brojka u dokumentima (KB JS-a, broj ruta, razlike) ima
  naredbu kojom je dobivena.
- **Autonomno:** ne pitaj korisnika, odluči sam i zapiši odluku. Svaki zeleni korak
  commitaj na `main` (imenovane datoteke, nikad `git add -A`). Produkcijski deploy i
  brisanje `web/` ostavi za S6 iza vrata.
- **Token budget:** bez Monitora koji javlja napredak; duge jobove s `run_in_background`.
  Oko 150k konteksta orkestratora zatvori sesiju po koraku 3.
- Svako istraživanje i mjerenje zapiši u `site/docs/research/YYYY-MM-DD-*.md`.
- **Pravila repoa** iz `CLAUDE.md`: allow-lista za objavu (nikad klijentska imena),
  brojke iz `data/generated/`, ne citirati `lastYear.totalContributions`, blog post o
  RevenueCatu ostaje kakav jest. Commit trailer po sistemskim uputama sesije.
