---
name: fable-review
description: Neovisna Fable 5.1 analiza bilo kojeg git codebasea u 5 modova (diff, refactor, security, full, forensic) kroz dvofazni postupak (Prolaz A: Sonnet/Opus mapa i ground-check → Prolaz B: Fable 5.1 dubinska analiza i Markdown plan za Opus) uz strogu zaštitu tjednog limita, izolirani git worktree, annotated audit tag i automatski handoff prompt. Pokreni kad korisnik kaže "napravi Fable analizu", "neka Fable pregleda repo", "Fable review", "plan refactora s Fableom", "Fable revizija tjedna", ili /fable-review [repo] [--mode diff|refactor|security|full|forensic].
---

# Fable Review — Neovisna analiza git codebasea (Fable analizira, Opus izvodi)

Ovaj skill kodificira radni tok iz 28 Fable sesija (lipanj – listopad 2026.):
**jedan model (Opus) gradi brzo, a drugi model (Fable 5.1) neovisno pregledava zamrznuto stanje i piše strukturirane Markdown dokumente u repo prema kojima Opus naknadno izvodi popravke ili refactor.**

Skill ugrađuje sve lekcije iz postmortema `~/git/stepanic/cv/docs/2026-10-17-postmortem-fable-subagenti-tjedni-limit.md`:
- **Nikad jednofazni Fable nad cijelim repoom** (Fable u jednom prolazu drži 600k tokena i troši 6–14 $ po repou).
- **Uvijek dvofazno (Prolaz A: Mapa + Ground Check → Prolaz B: Ciljana Fable provjera)** čime kontekst ostaje ispod ~150k, a trošak pada na ~3–6 $.
- **Najviše jedan Fable agent u isto vrijeme**, s eksplicitnim `effort: "medium"`.
- **Strogo Read-Only nad kodom** (nijedna produkcijska ni testna datoteka se ne mijenja; pišu se isključivo Markdown dokumenti analize).
- **Commit odmah po zapisivanju dokumenta**, da nijedan HTTP 429 ne ostavi rad u `/private/tmp`.

Javni primjeri rezultata po modovima:
- [`domovinatv/pay.domovina.ai`](https://github.com/domovinatv/pay.domovina.ai): `docs/reviews/2026-07-fable5/` (`full`), `docs/reviews/2026-10-fable51/` (`full`), `docs/reviews/2026-10-fable51-r2/` (`diff`), `docs/security/2026-10-16-security-audit-fable.md` (`security`), `docs/research/fable5-vs-opus48-side-by-side.md` (`forensic`)
- [`stepanic/stadion-maksimir-natjecaj-2026`](https://github.com/stepanic/stadion-maksimir-natjecaj-2026): `docs/review/README.md`, `docs/review/2026-09-26-neovisni-review-glasanje.md`, `docs/review/2026-09-26-neovisni-review-wiring.md`, `docs/review/2026-10-09-neovisni-review-tjedan-glasaj.md` (tagovi `audit-fable-2026-09-26`, `audit-fable-2026-10-09`)
- [`domovinatv/energy.domovina.ai`](https://github.com/domovinatv/energy.domovina.ai): `docs/refactor/00-pregled.md` … `05-alati-testovi-docs.md` (`refactor`)
- [`domovinatv/domovina-fiskal`](https://github.com/domovinatv/domovina-fiskal): `docs/handoff/2026-10-02-pregled-koda-i-plan-refactora.md` (`refactor` + `forensic`)
- [`domovinatv/pipeline.domovina.ai`](https://github.com/domovinatv/pipeline.domovina.ai) i [`domovinatv/omm.domovina.ai`](https://github.com/domovinatv/omm.domovina.ai): `docs/security/2026-10-16-security-audit-fable.md` (`security`)

---

## 0. Pre-flight, izbor moda i `/usage` potvrda (OBAVEZNO PRIJE SVEGA)

1. **Jedan repo po pozivu.** Ako korisnik traži više repoa, obrađuju se strogo **jedan za drugim**, nikad paralelno.
2. **Pokreni determinističku pre-flight skriptu** nad ciljanim repoom:
   ```bash
   ~/.claude/skills/fable-review/scripts/preflight.sh "<putanja-do-repoa>"
   ```
3. **Odaberi mod (`mode`)** — ako ga korisnik nije izrijekom naveo, predloži ga prema izlazu `preflight.sh`:
   - **`diff`** *(weekly / PR / delta)* — u repou već postoji raniji Fable review ili tag `audit-fable-*`, ili korisnik traži pregled onoga što je Opus radio ovaj tjedan / na trenutnoj grani.
   - **`refactor`** *(architecture & cleanup plan)* — korisnik traži pregled koda i plan refactora u valovima/koracima za Opus.
   - **`security`** *(security & money audit)* — fokus na sigurnost, auth, tok novca, tajne, IDOR, race conditione i rubne slučajeve.
   - **`full`** *(complete subsystem audit)* — prvi dubinski prolaz kroz veći ili višeslojni repo (kombinira `security` + `refactor` po podsustavima uz glavni `INDEX.md` i `implementation-plan.md`).
   - **`forensic`** *(model side-by-side)* — forenzička usporedba git povijesti po `Co-Authored-By` modelima s bodovanjem 0–100.
4. **Provjeri čiji je repo** (pravilo iz `/wrap-up` koraka 0):
   - Ako je repo korisnikov (`domovinatv/*`, `stepanic/*`), dokumenti idu u `docs/` tog repoa (na `main` ili granu `docs/fable-review-<datum>` ako ruleset brani direktan push).
   - Ako repo nije korisnikov, dokumenti ne idu u tuđe stablo nego u korisnikov lokalni katalog bilješki.
5. **Pitaj korisnika za `/usage` (preostali tjedni i 5-satni limit)** i prikaži mu sažetak iz `preflight.sh` (veličina repoa, odabrani mod, procjena za Prolaz A + Prolaz B). Čekaj potvrdu. Ako je tjedni limit ispod ~15 %, predloži da se sada odradi samo Prolaz A (Sonnet mapa) ili samo `diff` mod.

---

## 1. Izolirani Git Worktree (nikad u živom radnom stablu)

Paralelne sesije često dijele radno stablo. Zato svaki review radi u odvojenom worktreeju:

```bash
REPO="<apsolutna-putanja-repoa>"
DEFAULT_BRANCH="$(git -C "$REPO" symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo main)"
WT="/private/tmp/fable-review-$(basename "$REPO")-$(date +%Y%m%d-%H%M%S)"
git -C "$REPO" fetch origin
git -C "$REPO" worktree add --detach "$WT" "origin/$DEFAULT_BRANCH"
```

---

## 2. Prolaz A: Mapa, Ground Check i Invarijante (`model: "sonnet"`, `effort: "medium"`)

Pokreni subagenta `model: "sonnet"`, `effort: "medium"` (ili izvrši izravno ako je repo <5.000 linija). Zadatak Prolaza A je **jeftino pročitati širinu** kako Fable u Prolazu B ne bi punio kontekst:

1. **Ground Check (Read-Only Orakl):**
   - Pokreni postojeće statičke provjere i testove koje je `preflight.sh` detektirao (`npx tsc --noEmit`, `npm test` / `vitest run`, `flutter analyze`, `astro check`, `cargo check`, `forge test`).
   - Provjeri postoji li u `.gitignore` pravilo koje ignorira datoteke nužne za čist build (npr. `*.pem`, `*.sql`, generirani tipovi).
   - **Nikad** ne pokreći ništa što piše po produkciji, stagingu ili vanjskim servisima.
2. **Kontekst i postojeće odluke:**
   - Pročitaj `CLAUDE.md`, `AGENTS.md`, `README.md`, indekse u `docs/` i ADR-ove (naslove i sažetke).
   - Popiši **namjerne invarijante** (stvari koje su u docsima ili komentarima označene kao namjerne/empirijske odluke) kako ih Fable ne bi prijavio kao lažne pozitive.
   - Izvuci sve `⚠️ REVIEW(fable)` ili `TODO` markere u kodu.
3. **Mapiranje prema odabranom modu:**
   - **Za `diff`:** Izvuci `git log --oneline <baza>..HEAD` i `git diff --stat <baza>..HEAD`, pročitaj prethodni Fable review dokument i mapiraj svaku promijenjenu datoteku s rasponima linija i tko je poziva.
   - **Za `refactor`:** Popiši strukturu modula, 10 najvećih datoteka po broju linija, mjesta duplikacije koda, nepokrivene dijelove bez testova i nedohvatljivi/mrtvi kod.
   - **Za `security`:** Popiši sve ulazne točke (rute, webhookove, cron jobove, admin sučelja, auth middleware, rukovanje tajnama, novčane/knjižne tokove, uploade) s `putanja:linija` i 1 rečenicom zašto je točka osjetljiva + pokreni `npm audit --omit=dev` / `pip-audit` i grep tajni.
   - **Za `full`:** Podijeli repo na **2 do 4 logička podsustava** (npr. `1. Backend & DB`, `2. Frontend / Web`, `3. Mobile / SDK`, `4. Infra & Testovi`) i za svaki izradi mapu ulaznih točaka i sumnjivih `putanja:linija`.
   - **Za `forensic`:** Skriptom izvuci kompletnu tablicu svih commitova s `Co-Authored-By` trailerima, broj dodanih/obrisanih linija po modelu, popis datoteka koje su dirala oba modela i sve revertane commitove.
4. **Zapiši mapu na disk:**
   - Zapiši mapu u `<izlazni-dir>/<datum>-00-map.md` (do ~150–250 redaka, s točnim `putanja:linija` pokazivačima i popisom 15–30 žarišnih točaka poredanih po riziku).

---

## 3. Prolaz B: Fable 5.1 Dubinska Analiza (`model: "fable"`, `effort: "medium"`)

Pokreni **jednog** subagenta `model: "fable"`, `effort: "medium"` (ili u `full` modu nad velikim repoom pokreći jednog po jednog po podsustavu).

### Pravila čitanja u promptu za Fable (DOSLOVNO UKLJUČITI U PROMPT):
- **Ulaz ti je `<datum>-00-map.md`**, ne cijeli repo.
- **Čitaj ciljano:** koristi `sed -n 'A,Bp' <datoteka>` ili `Read` s `offset`/`limit` (najviše ~150–200 linija odjednom) oko `putanja:linija` iz mape. Šire čitaj samo kad trag u kodu vodi dalje, i tada prvo napravi `Grep` prije čitanja.
- **Nikad ne čitaj istu datoteku ili isti veliki izlaz drugi put.**
- **Ne vjeruj slijepo dokumentaciji ni komentarima:** za svaku bitnu sigurnosnu ili arhitekturnu tvrdnju u `docs/` ili `CLAUDE.md` provjeri *koji točno redak stvarnog koda je jamči* i *tko/kako je može zaobići*.
- **Ništa u kodu, testovima ni konfiguraciji ne mijenjaj.** Tvoj jedini izlaz je Markdown dokument.
- **Nalaze zapisuj na disk čim ih potvrdiš** (`Write` / `Edit`), nemoj ih skupljati u glavi do zadnjeg poziva.
- **Čim napišeš prvu cjelovitu verziju dokumenta, odmah je commitaj** u worktreeju (da nijedan prekid ili 429 ne ostavi dokument necommitan).
- Ako `context-guard.py` javi granicu (~180k–250k tokena): zapiši što je pregledano a što ostaje, commitaj i završi.

---

## 4. Struktura izlaznih Markdown dokumenata po modovima

Svaki dokument počinje standardnim zaglavljem:
- **Datum:** `YYYY-MM-DD`
- **Autor pregleda:** `Claude Fable 5.1` (uz navođenje modela koji je pisao kod prema git povijesti, npr. `Claude Opus 5.5`)
- **Pregledano stanje (Commit SHA / Grana):** `<kratki-sha>` (i status ground-checkova iz Prolaza A)
- **Opseg:** što je pregledano, a što svjesno nije.

### Mode A: `diff` (`docs/reviews/<YYYY-MM-DD>-fable-revizija-<tema>.md`)
1. **Presuda u 3–5 rečenica** (smije li ovo u produkciju odmah ili postoje 🔴 blokeri).
2. **Status prethodnih Fable nalaza** (tablica: ID, kratki opis, stanje `✅ Riješeno u <sha>` / `⚠️ Djelomično` / `❌ Otvoreno`).
3. **Novi nalazi nad promjenama (`F-01` / `B-01`…):**
   - Oznaka težine: **🔴 Blokira merge/produkciju** | **🟡 Važno (prije ili odmah nakon deploya)** | **🟢 Čišćenje / Prijedlog**.
   - `datoteka:linija` (u zamrznutom commitu).
   - **Scenarij u kojem puca** (konkretan ulaz / stanje → pogrešan ishod u runtimeu).
   - **Konkretan prijedlog popravka** (točno što Opus treba promijeniti).
   - **Kako provjeriti** (test ili naredba koja danas pada, a nakon popravka prolazi).
4. **Rollout / Pre-deploy checklista** (migracije, fallback ako vanjski API padne, SQL upit za provjeru produkcije nakon deploya).
5. **Što je u ovom tjednu/PR-u dobro napravljeno i drži vodu.**

### Mode B: `refactor` (`docs/refactor/<YYYY-MM-DD>-pregled-koda-i-plan-refactora.md`)
1. **Sažetak stanja i atribucija koda** (veličina, stanje testova/CI-ja, glavni problemi arhitekture).
2. **Potvrđeno DOBRO — NE DIRATI u refactoru (§ Nepromjenjive invarijante):**
   - Eksplicitan popis datoteka, formata, kriptografskih/SQL zasuna i poslovnih pravila koje Opus **ne smije** mijenjati dok čisti kod.
3. **Katalog nalaza (`K1`..`Kn` ili `R-01`..`R-nn`):**
   - Grupirano po: *(a) Kritični bugovi i build/CI rupe*, *(b) Sigurnost i podatkovni integritet*, *(c) Arhitektura, duplikacija i prevelike datoteke („jedno mjesto istine”)*, *(d) Test-gap i ops higijena*.
   - Svaki nalaz nosi: **ID**, **Prioritet (`P0/P1/P2`)**, **Trud (`S/M/L`)**, **`datoteka:linija`**, **Problem**, **Prijedlog rješenja**, **Kriterij dovršenosti**.
4. **Stavke za odluku čovjeka (vlasnika):**
   - Proturječnosti u copyju, pravnim tekstovima, cijenama ili poslovnoj logici koje model ne smije sam pogađati.
5. **Plan izvedbe za Opus u koracima / valovima (Val 0 → Val N):**
   - Svaki korak mora ostaviti build i testove zelenima.
   - Tablica praćenja stanja na vrhu ili dnu (`| Korak / Nalaz | Status | Commit | Napomena |`) koju će Opus ažurirati kako rješava stavke.

### Mode C: `security` (`docs/security/<YYYY-MM-DD>-security-audit-fable.md`)
1. **Sažetak (5–10 redaka)** i broj nalaza po težini (`Kritično / Visoko / Srednje / Nisko / Info`).
2. **Model prijetnji:** tko su napadači, što je imovina (novac, ključevi, OIB/PII, dostupnost, LLM/API budžet), koje su ulazne točke.
3. **Potvrđeni nalazi (`SEC-01`… / `MONEY-01`…):**
   - Težina, `datoteka:linija`, **konkretan scenarij napada korak-po-korak**, utjecaj, konkretan popravak i kako provjeriti popravak.
   - *Nikad ne prepisuj vrijednost stvarne tajne/tokena u dokument* — navedi samo `datoteka:linija` i vrstu ključa.
4. **„Za provjeru” (Neverificirano):** sumnje koje ovise o vanjskoj konfiguraciji (Cloudflare WAF, GoTrue, AWS/Supabase dashboard) i nisu se mogle dokazati samo iz koda.
5. **Što je dobro zaštićeno** (da Opus ne pokvari postojeće kontrole).
6. **Zadaci za Opus 5.5:** checklista `- [ ] SEC-01 …` poredana po prioritetu.

### Mode D: `full` (`docs/reviews/<YYYY-MM-DD>-fable51/`)
Kreira direktorij s više povezanih dokumenata:
- `INDEX.md` — izvršni sažetak, tablica broja nalaza po podsustavu i težini, **Coverage mapa (podsustav × dimenzija: `MONEY-BUG`, `SEC`, `BUG`, `RISK`, `REFACTOR`, `TEST-GAP`)**, top-10 prioriteta i otvorena pitanja za vlasnika.
- `<podsustav-1>.md`, `<podsustav-2>.md`… — detaljni nalazi po podsustavu.
- `implementation-plan.md` — glavni operativni dokument za Opus (faze `P0` → `P1` → `P2`, procjena `S/M/L`, ovisnosti, „ne diraj” upozorenja i tablica stanja implementacije).

### Mode E: `forensic` (`docs/research/<YYYY-MM-DD>-model-forensics.md`)
1. **Kronološka mapa commitova po modelu** (`Co-Authored-By` statistika: broj commitova, `+/-` linija, područja rada).
2. **Analiza istih datoteka („kontrolirani eksperimenti”):** slučajevi gdje su dva modela dirala isti fajl ili rješavala isti problem (s točnim `git show <sha>` dokazima).
3. **Rubrika i bodovanje `0–100` po dimenzijama:** *Edge-case coverage*, *Security-by-default*, *Trust-boundary reasoning*, *Blast-radius svijest*, *Arhitekturna disciplina / churn*.
4. **Pošteni protuprimjeri:** gdje je skuplji model podbacio ili zakomplicirao, a brži model bio bolji.

---

## 5. Commit, Tagiranje, Čišćenje i Handoff za Opus

1. **Commit i Push samo Markdown dokumenata:**
   ```bash
   git -C "$WT" add <putanje-novih-md-dokumenata>
   git -C "$WT" commit -m "docs(review): Fable 5.1 <mode> analiza (<datum>)" \
     -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
   ```
2. **Annotated Git Tag (za praćenje delta revizija u budućim `diff` prolazima):**
   ```bash
   git -C "$WT" tag -a "audit-fable-$(date +%Y-%m-%d)" -m "Fable 5.1 <mode> review ($(date +%Y-%m-%d))"
   git -C "$WT" push origin HEAD:"$DEFAULT_BRANCH" --follow-tags
   ```
3. **Ukloni privremeni worktree:**
   ```bash
   git -C "$REPO" worktree remove "$WT"
   ```
4. **Pripremi Handoff prompt za Opus 5.5 (u `~/.claude/handoffs/<repo>/` i u clipboard):**
   ```bash
   dir="$HOME/.claude/handoffs/$(basename "$REPO")"; mkdir -p "$dir"
   f="$dir/$(date +%Y-%m-%d-%H%M)-fable-review-implementacija.md"
   cat <<'EOF' | tee "$f" | pbcopy
   # Handoff — implementacija po Fable 5.1 analizi (<ime-repoa>)

   Repo: <apsolutna-putanja-repoa>
   Dokument analize i plana: <relativna-putanja-do-novog-md-dokumenta> (commit <sha>)

   ## Zadatak (izvodi Opus 5.5)
   1. Pročitaj u cijelosti <relativna-putanja-do-novog-md-dokumenta>, posebno odjeljak „Što je DOBRO i NE DIRATI" te plan izvedbe.
   2. Kreni redom od prvog koraka / P0 nalaza:
      - <prvih 3-5 najvažnijih stavki s ID-evima i datoteka:linija>
   3. Za svaki popravak prvo napiši ili proširi test koji reproducira nalaz, potvrdi da prolazi zajedno s postojećim testovima i typecheckom, semantički commitaj i ažuriraj status stavke u samom dokumentu pregleda (ne otvaraj novi dokument).
   4. Stavke označene „Za odluku čovjeka" ne pogađaj sam — pitaj vlasnika prije izmjene.
   EOF
   ```
5. **Završni izvještaj korisniku (kratko):**
   - Gdje su dokumenti zapisani i pushani (SHA + tag).
   - Broj nalaza po prioritetu i **Top 3–5 najvažnijih nalaza** u jednoj rečenici svaki.
   - Stvarni trošak (iz transkripta subagenta) u usporedbi s procjenom.
   - Putanja do spremljenog handoff prompta za Opus 5.5 (koji je već u clipboardu).
