# Odluke — migracija na Astro

Svaka odluka ima broj, datum, razlog i uvjet pod kojim se revidira. Odluka se ne briše,
nego se nova odluka navede kao zamjena („zamjenjuje N”). Blokovi brojeva po sesiji su u
[plan.md](plan.md).

## S0 (2026-11-17)

**1. Opseg.** Migrira se samo web (`web/` → `site/`). `data/`, `schema/`, `typst/`,
`dist/`, `scripts/` (osim `package.json` skripti u S6) i `applications/` se ne diraju.
Sadržaj i izgled ostaju isti; redizajn nije dio posla. Revizija: ako korisnik zatraži
promjenu dizajna, to je zaseban projekt nakon S6.

**2. Nova aplikacija u `site/`, ne preimenovanje `web/`.** Stari i novi site žive jedan
pored drugoga do S6, pa se baseline i parity mogu raditi bilo kad, a produkcija se ne dira.
`site/` ostaje trajno ime; `web/` se briše u S6. Revizija: nema.

**3. URL shema.** Engleski ostaje na postojećim putanjama (`/`, `/blog`, `/blog/<slug>`),
hrvatski dobiva prefiks `/hr/` (`/hr/`, `/hr/blog`, `/hr/blog/<slug>`). Tako postojeći
engleski linkovi ostaju valjani. Linkovi s `?lang=hr` preusmjeravaju se na `/hr/…` (način
odlučuje S5; assets-only Worker ne čita query u `_redirects`). Revizija: ako se pokaže da
treba Worker skripta, to je odluka u S5.

**4. Otoci.** React ostaje samo gdje postoji stanje ili handler: `ThemeToggle`,
`OtsVerify`, copy gumb u `Stats`. Jezični prekidač postaje običan link. `ClaudeCode` nema
stanja i postaje statičan. Revizija: kad port otkrije još interakcije, sesija dopisuje
odluku.

**5. Paritet kao test.** Baseline je `innerText` svake stranice starog sitea u EN i HR
(nakon hidracije, iz lokalnog `web/out`), a parity skripta uspoređuje ga s novim siteom
nakon normalizacije razmaka. Prihvaćena razlika je dopuštena samo kao odluka s brojem.
Testovi ne idu na mrežu (oba sitea poslužuju se lokalno). Revizija: nema.

**6. Hosting.** Isti Worker `stepanic-cv`, assets-only, isti custom domain. Nema prelaska
na Pages ni dodavanja Worker skripte bez odluke. Revizija: odluka 3.

**7. Produkcija je iza vrata.** Do S6 nijedan commit ne mijenja `web/`, `web/wrangler.jsonc`
ni deploy korak u CI-ju, jer svaki push na `main` deploya. Prebacivanje se pusha tek kad
korisnik odobri. Revizija: nema.

**8. Verzije.** Astro i integracije: zadnja stabilna verzija u trenutku S1, zapisana kao
odluka S1 s točnim brojevima. Tailwind ostaje na v3 dok parity ne prođe (manje promjena
odjednom). Revizija: nadogradnja na Tailwind 4 je zaseban posao nakon S6.
