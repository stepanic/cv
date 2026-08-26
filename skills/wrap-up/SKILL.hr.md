---
name: wrap-up
description: Zatvaranje chata prije /clear — commitaj i pushaj sve iz ovog razgovora, osvježi memory fajlove, trajno zapiši znanje koje nije u codebaseu (markdown, po potrebi s mermaid dijagramima), pripremi handoff prompt u clipboard i daj sažetak. Pokreni kad korisnik kaže bilo koju varijantu "commitaj i pushaj / updejtaj memory / spremi znanje / pripremi chat za clear", ili /wrap-up.
---

# Wrap-up — zatvaranje chata

Korisnik ovo traži na kraju gotovo svakog razgovora (147 sesija, 119 varijanti
istog prompta). Cilj je da nakon `/clear` ništa ne ostane samo u kontekstu.

Radi **autonomno do kraja** — ne vraćaj se po odobrenje za pojedini korak. Iznimka
su nepovratni potezi koji nisu dio rutine (force-push, brisanje grana, deploy koji
korisnik nije tražio).

## Redoslijed

Koraci 1–4 idu redom. Preskoči korak samo ako u ovoj sesiji doista nema što raditi
— i to reci u sažetku, nemoj tiho preskočiti.

---

## 1. Commit + push

**Prvo utvrdi SVE repoe dirane u ovoj sesiji.** Rad često prelazi granice repoa
(`domovina-rag` → `domovina-stats` → `fetch.domovina.tv`). Prođi kroz razgovor i
popiši svaki repo u kojem si mijenjao fajlove, pa u svakom:

```bash
git -C <repo> status --short
git -C <repo> branch --show-current
```

### 🔴 Stageaj samo svoje

**Nikad `git add -A` ni `git add .`.** Radna kopija redovito sadrži nedovršeni rad
korisnika koji s tvojom sesijom nema veze — u jednoj sesiji su to bili `.gitignore`
i `tim-*.sh` skripte zatečene usred izrade. Da su ušle u commit, otišle bi na
`main` napola gotove.

Stageaj **poimence** fajlove koje si ti mijenjao. Za svaki fajl koji je izmijenjen,
a ti ga se ne sjećaš dirati — `git diff` pa ostavi na miru ako je tuđi.

Ne commitaj generirane podatke (`public/stats.json`, `public/vector-map*`,
`public/person-map*` u `domovina-stats` — piše ih cron), tajne, ni `.env`.

### Commit poruke

Semantički, `tip(opseg): sažetak` u imperativu, hrvatski. Tijelo objašnjava
**zašto**, ne što — dijelove koji se ne vide iz diffa: mjerenja, odbačene
alternative, zamke. Ako je popravak imao mjerljiv učinak, stavi brojku.

Više nepovezanih promjena → više commitova, ne jedan skupni.

Završi svaki commit s:

```
Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
```

### Push

Radi se na `main` (solo projekt, cijela povijest je direktno na main). Push svaki
repo i **provjeri izlaz**. Ako push padne (zaštita grane, konflikt, nema remotea),
reci to u sažetku — ne prijavljuj "pushano" ako nije.

---

## 2. Memory fajlovi

Memorija je u `~/.claude/projects/<projekt>/memory/`, jedan fakt po fajlu, indeks
u `MEMORY.md`.

Zapiši samo ono što vrijedi i za **buduće** sesije:

- `user` — tko je korisnik, kako radi, što preferira
- `feedback` — korekcija ili potvrđen pristup + **Why:** i **How to apply:**
- `project` — cilj/ograničenje koje se ne vidi iz koda; relativne datume pretvori
  u apsolutne
- `reference` — vanjski resursi, URL-ovi, ugovori

**Ne zapisuj** ono što repo već pamti (struktura koda, git povijest, CLAUDE.md) ni
ono što vrijedi samo za ovaj razgovor. Prije pisanja provjeri postoji li već fajl
koji to pokriva — **ažuriraj ga** umjesto da radiš duplikat. Povezuj `[[slug]]`.

Za svaki novi fajl dodaj red u `MEMORY.md`: `- [Naslov](fajl.md) — kuka`.

---

## 3. Trajno zapiši znanje koje nije u codebaseu

Ovo je korak koji se najlakše zaboravi, a najviše vrijedi. Pitanje nije „što smo
radili" (to je u git povijesti) nego **„što bi sljedeći prolaz morao ponovno
otkriti".**

Kandidati:

- mjerenja i brojke koje su odredile odluku (pragovi, benchmarci, profili memorije)
- alternative koje su razmotrene pa **odbačene** — i zašto, s brojkama
- zamke koje su koštale vremena (tihi kvarovi, okruženje, platformske razlike)
- otvorene stavke: što čeka odluku, test na uređaju, sljedeći ciklus

Piši u `docs/` repoa na koji se odnosi, ime `docs/YYYY-MM-DD-tema.md`. Ako
dokument o toj temi već postoji — **dopiši poglavlje**, ne radi drugi.

Granica repoa vrijedi i za dokumente: mjerenje baze ide u repo koji ima bazu.

Mermaid kad odnos ili tijek nisu očiti iz teksta (arhitektura, redoslijed pada,
tok podataka kroz korake). Ne crtaj dijagram za ono što je rečenica.

Povezi novi dokument iz postojećih („Vezani dokumenti") da ga se nađe.

---

## 4. Handoff prompt u clipboard

Napiši prompt za **prazan** Claude Code session — čitatelj nema ništa iz ovog
razgovora. Mora sadržavati: repoe i apsolutne putove, što je upravo napravljeno,
što je otvoreno, i konkretan sljedeći zadatak. Uputi na dokumente iz koraka 3
umjesto da prepričavaš.

```bash
cat <<'EOF' | pbcopy
<handoff prompt>
EOF
```

Potvrdi da je u clipboardu (`pbpaste | head -3`) i **ispiši ga i u odgovoru** —
clipboard se do `/clear` zna izgubiti.

---

## 5. Sažetak i predaja

Kratko, bez uljepšavanja:

- što je commitano i pushano, po repoima (hashevi)
- koji su memory fajlovi dodani/ažurirani
- koji su dokumenti napisani
- **što je ostalo otvoreno ili neprovjereno** — ovo je najvažniji dio
- zatim: *„Spremno za `/clear`."*

`/clear` **ne možeš pokrenuti sam** — to je ugrađena CLI komanda. Reci korisniku
da ga upiše.

## Provjera prije nego kažeš da je gotovo

- [ ] `git status` čist u svakom repou — ili je ostatak tuđi rad, i to je rečeno
- [ ] svaki push doista prošao (provjeren izlaz, ne pretpostavka)
- [ ] nijedan generirani snapshot ni tajna nisu commitani
- [ ] handoff prompt u clipboardu **i** u odgovoru
- [ ] otvorene stavke izrijekom navedene
