---
name: todo-plan
description: Napravi plan implementacije kao linearni lanac Claude Code sesija (S1…SN) zapisan u codebase — TODO.md po fazama, docs/plan.md s tablicom sesija i uvjetima „gotovo kad”, docs/decisions.md s blokovima brojeva, i docs/handoffs/SN.md gdje je svaki handoff gotov prompt koji prethodna sesija dorađuje. Po uzoru na ~/git/pinkainc/open-banking i open-ledger. Pokreni kad korisnik kaže bilo koju varijantu „napravi TODO plan / plan po sesijama / lanac handoffa / plan da se u N sessiona implementira”, „kao open-banking / open-ledger”, ili /todo-plan.
---

# TODO plan — implementacija kao lanac sesija

Cilj: veću implementaciju razbiti na **N sesija koje se rade jedna za drugom**, a svaka
počinje iz praznog konteksta. Sve što sesija treba znati živi u repou, ne u chatu. Ova
sesija (S0) piše **samo plan, bez koda**.

Uzori koje korisnik smatra vrhunskima (pročitaj ih ako postoje na disku, samo ono što
treba, bez čitanja cijelih fajlova):

- `~/git/pinkainc/open-banking/`: `TODO.md`, `docs/2026-10-23-plan-do-paritete.md`,
  `docs/handoffs/README.md`, `docs/handoffs/S7d.md`
- `~/git/pinkainc/open-ledger/`: `TODO.md`, `docs/2026-10-10-plan-do-paritete.md`,
  `docs/handoffs/README.md`
- `~/git/domovinatv/domovina.ai/vijesti/`: isti oblik za samostalnu aplikaciju u
  poddirektoriju (plan 5.11.2026.)

## 1. Razumij cilj prije pisanja

- Pročitaj `CLAUDE.md` repoa i dokumente o području koje se mijenja. Pravila repoa
  (deploy, javnost repoa, trailer commita, testovi) ulaze u zajednička pravila lanca.
- Utvrdi: što je **gotovo** za cijeli projekt (mjerljivo), što je **izvor istine**
  (spec, sandbox, postojeći podaci), koje radnje su **nepovratne ili vanjske**
  (produkcija, plaćanje, mail, pravni upis) i gdje je **trošak** (LLM pozivi, API).
- Ako cilj nije jasan u jednoj točki koja mijenja cijeli plan, pitaj jednom. Inače
  odluči sam i zapiši kao odluku.

## 2. Gdje plan živi

- Novi samostalni dio u postojećem repou → poddirektorij (`<app>/TODO.md`,
  `<app>/docs/...`), sve putanje u planu relativne na njega.
- Cijeli repo je projekt → korijen (`TODO.md`, `docs/...`).
- Jezik: kakav repo već koristi za dokumente; ako nije jasno, hrvatski.
- Javni repo: plan smije biti javan ako korisnik tako kaže, ali pregovarački materijal
  (cijene, uvjeti partnera) nikad. Provjeri javnost kao u `wrap-up` koraku 0.

## 3. Razbij na pakete

Pravila za svaki paket (jedan paket = jedna sesija):

- **Stane u jednu sesiju**: orkestrator ~150k konteksta, posao rade 2 subagenta
  (implementacija, pa testovi i spajanje). Prevelik paket podijeli unaprijed (`S5`, `S5b`).
- **„Gotovo kad” je provjerljivo naredbom**: zeleni `check`, broj testova, `skipped 0`,
  izmjerena brojka, e2e. Nikad „implementirano”.
- **Rizik i mjerenje rano**: prvi paketi grade temelj i *mjere* pretpostavku od koje
  ovisi sve ostalo (faza F0, ništa javno). Ako mjerenje može ubiti projekt, iza njega
  idu vrata.
- **Ljudska vrata** na svakom paketu koji završava nepovratnom ili vanjskom radnjom,
  većim troškom ili odlukom koja je korisnikova. Sesija pripremi sve, upiše pitanje na
  vrh sljedećeg handoffa i lanac staje.
- **Blok brojeva odluka** po sesiji (S1 od 100, S2 od 200…), da se paralelni worktreeji
  ne sudare.
- **Paralelno** označi samo pakete koji stvarno ne dijele datoteke.
- Brojke ne izmišljaj. Procjena koju ne znaš ide u paket kao mjerenje.

Faze (F0, F1…) grupiraju pakete u `TODO.md`; sesije su redoslijed rada.

## 4. Datoteke

### `TODO.md`

```markdown
# TODO — <projekt>

Radna lista. Čuva se u repou da napredak preživi između sesija. Označene stavke su gotove
i provjerene (`<check naredba>` zelen). Odluke idu u [docs/decisions.md](docs/decisions.md).

Plan po sesijama: [docs/plan.md](docs/plan.md). Handoff po sesiji: [docs/handoffs/](docs/handoffs/).

Legenda: `[x]` gotovo · `[ ]` otvoreno · `[~]` u radu · `(!)` traži korisnika · `→ Sn` planirana sesija

## F0 — <naziv>

- [ ] <konkretna stavka, jedna provjerljiva stvar> → S1
```

Stavke su konkretne (datoteka, naredba, ponašanje), ne teme.

### `docs/plan.md`

Redom: zašto projekt postoji (2–4 rečenice) · arhitektura (tablica ili mermaid, samo
ako pomaže) · tvrdi uvjeti koji vrijede u svakoj sesiji · **tablica sesija**
`| # | Faza | Paket | Odluke | Gotovo kad |` · procjena broja sesija, vrata, što je
paralelno, najrizičniji paketi i zašto · „Gdje smo” (S0: plan, koda nema).

### `docs/decisions.md`

Uvod (broj, datum, razlog, uvjet revizije; odluka se ne briše nego zamjenjuje) i
odluke S0 numerirane od 1: opseg, što se ne dira, izbor tehnologije, pravila testiranja.

### `docs/handoffs/README.md`

Kopiraj oblik iz uzora i prilagodi:

1. **Lanac**: sesija N počinje iz `SN.md`; na kraju označi red u „Stanje lanca” i
   stavke u TODO-u; ako je naučila nešto što mijenja kasnije pakete, uredi `S(N+1).md`
   (nedovršeno ide na **vrh**); upiše polazni commit i brojke u `S(N+1).md`; `/wrap-up`
   uzima **sadržaj `S(N+1).md`** kao handoff prompt. Bez konteksta usred paketa:
   nastavak je opet `SN`, broj se ne povećava. Vrata: lanac staje dok korisnik ne odluči.
   Handoff se mijenja samo prema naprijed.
2. **Stanje lanca**: `| Sesija | Paket | Stanje | Commit | Testovi | Napomena |`, red S0
   već gotov.
3. **Zajednička pravila**: polazak (`check` zelen, inače prvo popravi) · opseg (što se
   smije dirati) · orkestracija (Opus 5.5 subagenti, `effort` eksplicitno, `high` kod /
   `medium` čitanje, ≤ 2–3 paralelno, Fable samo uz korisnikov pristanak) · agentima
   zabranjeni TODO, plan i handoffi (orkestrator ih ažurira) · testovi bez mreže i
   `skipped 0` · trošak (procjena prije > ~100 poziva, nikad `claude -p` petlja) ·
   brojke s naredbom · autonomno (odluči i zapiši, commitaj svaki zeleni korak,
   nepovratno ostavi korisniku) · token budget (bez Monitora za napredak, ~150k
   zatvori sesiju) · istraživanja u `docs/research/YYYY-MM-DD-*.md` · pravila iz
   `CLAUDE.md` repoa koja se tiču ovog posla.

### `docs/handoffs/S1.md` … `SN.md`

Svaki je **gotov prompt za prazan session**:

```markdown
<1–2 rečenice: što je projekt.>

Repo: <apsolutni put> (<grana>, <javan/privatan>, wrap-up pusha <grana>).

Pročitaj prvo: docs/handoffs/README.md (lanac i pravila), docs/plan.md, docs/decisions.md, TODO.md (<faza>).

# SN: <paket>

Polazni commit: (upisuje S<N-1>). `<check>`: (upisuje S<N-1>). Odluke od **<blok>**.

<Ako iza vrata: „Prvo provjeri je li korisnik odlučio … Ako nije, ne radi ništa i to javi.”>

Paket:

1. **<dio>**: <što, gdje, koja pravila vrijede>.

<Testovi / rizik, ako ima.>

Gotovo kad: <provjerljivo>. Zatim po lancu, `/wrap-up` sa sadržajem `S<N+1>.md`.
```

`S1.md` piši detaljno (prvi dodir s kodom). Kasnije handoffe piši dovoljno da sesija
zna opseg i „gotovo kad”; prethodna sesija ih dorađuje. Dug skup handoffa piši jednom
bash naredbom s funkcijom i heredocima, ne trinaest odvojenih Write poziva.

### `docs/research/README.md`

Jedna rečenica o konvenciji imena, da direktorij postoji.

## 5. Zatvaranje S0

1. Ako repo ima provjeru dokumentacije (npr. `scripts/verify-doc-refs.sh`), pokreni je.
   Putanje koje tek nastaju omeđi oznakama za ignoriranje, ali ne usred tablice ili
   odlomka (pokvari prikaz). Bolje preformuliraj ili napravi direktorij.
2. Kratka sekcija u `CLAUDE.md` repoa: gdje je lanac i da „nastavi <tema>” znači prvi
   otvoreni red u „Stanje lanca”.
3. Commit (trailer po pravilima repoa) i push ako je repo za to (wrap-up korak 0).
4. Upiši polazni commit u `S1.md` i hash u red S0, commitaj.
5. Handoff: `S1.md` u `~/.claude/handoffs/<repo>/YYYY-MM-DD-HHMM-<tema>-S1.md` i u
   clipboard (`pbcopy`).
6. Memorija projekta: jedan zapis gdje je lanac i kako se nastavlja.
7. Odgovor korisniku: što je gdje, gdje su vrata, kako se nastavlja, što S1 radi i kada
   nastaje prvi stvarni trošak.

## Čega se čuvati

- Kod u S0. Plan je sam po sebi isporuka.
- Paket čiji je „gotovo kad” mišljenje, a ne naredba.
- Vrata koja agent može „preskočiti” jer pitanje nije upisano na vrh sljedećeg handoffa.
- Handoff koji upućuje na kontekst iz chata („kao što smo rekli”). Čitatelj nema chat.
- Izmišljene procjene trajanja, troška ili udjela. Ako nije izmjereno, mjeri se u paketu.
