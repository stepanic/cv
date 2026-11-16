---
name: fable-review
description: Pregled jednog git repoa u dva prolaza, samo za čitanje. Prolaz A (Sonnet) pokreće provjere i mapira ulazne točke na datoteka:linija; Prolaz B (Fable) ih provjerava u kodu i piše Markdown pregled s planom izvedbe za Opus. Modovi - diff, refactor, security, full, forensic. Pokreće se samo kad korisnik utipka /fable-review, nikad automatski.
argument-hint: "[putanja-repoa] [--mode diff|refactor|security|full|forensic] [--base <ref>] [effort <razina>]"
disable-model-invocation: true
---

# Fable pregled: Fable pregledava, Opus izvodi

> Hrvatska inačica za čitanje. Claude Code učitava `SKILL.md`; ova datoteka opisuje isti postupak.

Opus brzo piše kod. Fable samo čita zamrznuti commit i piše Markdown nalaze i plan po fazama, koji Opus izvodi u
idućoj sesiji. Dva prolaza postoje jer je jedan Fable prolaz nad cijelim repoom narastao na 636k konteksta i stajao
6 do 14 $ po repou (postmortem `docs/2026-10-17-postmortem-fable-subagenti-tjedni-limit.md` u `stepanic/cv`).

Argumenti: `$ARGUMENTS` (prvi je putanja repoa, inače trenutni direktorij; `--mode <mod>`; `--base <ref>` izričito
zadaje bazu za `diff`, inače preflight uzima zadnji `audit-*` tag; za LOCAL-ONLY bez taga daje se SHA iz zaglavlja
prethodnog lokalnog izvještaja).

Uz skill stoje (subagentima se daju apsolutne putanje, jer oni ovu datoteku ne vide):
- `${CLAUDE_SKILL_DIR}/scripts/preflight.sh`: deterministička provjera opsega i odredišta, samo čita
- `${CLAUDE_SKILL_DIR}/templates/pass-a.md` i `pass-b.md`: upute za oba prolaza
- `${CLAUDE_SKILL_DIR}/templates/<mod>.md`: struktura izlaznog dokumenta po modu

## Tvrda pravila

- **Fable se pokreće samo na izričit zahtjev.** Skill ima `disable-model-invocation: true` i kreće tek kad korisnik
  utipka `/fable-review`. Agent s `model: "fable"` nikad se ne pokreće iz drugog skilla, plana, handoffa ni na vlastitu
  inicijativu. Ako bi Fable pomogao, reci to i pusti korisnika da sam utipka naredbu.
- **Svaki Fable poziv završava u datoteci, bez iznimke.** Odmah nakon što se Fable agent vrati (gotov, pao, limit ili
  prekinut), prije ičega drugog: `python3 -I "${CLAUDE_SKILL_DIR}/scripts/salvage.py" --session "${CLAUDE_SESSION_ID}"
  --agent <agentId> --out <Salvage dir iz preflighta> --label pass-b`. Skripta u jednu Markdown datoteku
  zapisuje završni izvještaj, sav tekst i svaki ulaz alata (cijeli sadržaj Write i Edit), potrošnju po pozivu,
  `cost_usd` i stanje agenta (`finished=yes` samo kad ga je Claude Code označio završenim; inače je zadnji tekst
  označen kao „nije završni izvještaj”).
  Thinking Claude Code sprema prazan pa se ne može spasiti; skripta ispisuje koliko je tokena to bilo. Transkripti
  ostaju lokalno. Fable agent bez salvage datoteke je nedovršen posao: javi to korisniku, ne nastavljaj.
- Jedan repo po pozivu. Više repoa ide jedan za drugim, svaki tek na korisnikovo „može”.
- Najviše jedan Fable agent istodobno, uvijek s eksplicitnim `effort`: `"medium"`, osim ako korisnik izričito traži
  drugu razinu.
- Kod, testovi i konfiguracija se ne diraju. Jedini izlaz je Markdown.
- Ništa se ne pokreće prema produkciji, stagingu, sandboxu ni vanjskim servisima.
- Vrijednost tajne nikad ne ide u dokument, samo datoteka:linija i vrsta tajne.
- Odredište određuje preflight, ne procjena modela.

## 0. Preflight i potvrda

1. `git -C <repo> fetch origin --tags` (preskoči za repo bez remotea), pa
   `bash "${CLAUDE_SKILL_DIR}/scripts/preflight.sh" <repo> --mode <mod> [--base <ref>]` (samo zastavice koje je
   korisnik dao). Izlazni kod 2 je greška u argumentima (zastavica bez vrijednosti, nepoznata zastavica ili mod,
   `--base` koji nije commit): pokaži je korisniku i stani. Preflight sam ne fetcha, pa fetch ide prvi, inače SHA baze,
   tag i ime grane nisu svježi.
2. Ako mod nije zadan: `diff` kad postoji raniji pregled i pitanje je što se promijenilo, `security` za auth, novac,
   tajne i napadnu površinu, `refactor` za strukturu i čišćenje, `full` za prvi dubinski prolaz kroz veći repo,
   `forensic` za atribuciju git povijesti po modelima.
3. Redak **DESTINATION**:
   - `COMMIT`: korisnikov repo. Dokumenti se commitaju u worktreeju, tagiraju i pushaju (korak 4).
   - `LOCAL-ONLY`: tuđi ili klijentski repo. Dokumenti idu samo u `<Report dir iz preflighta>/<datum>-<mod>/`
     (`~/.claude/fable-review/reports/<vlasnik>-<repo>/`).
     Bez commita, taga i pusha, bez ijedne datoteke unutar repoa i bez kopiranja u bilo koji drugi repo ili katalog.
   - `ASK`: prvo pitaj korisnika što od toga vrijedi.
4. Pokaži sažetak i procjenu, pitaj za preostali tjedni i 5-satni limit (`/usage`) i čekaj. Ispod ~15 % tjednog
   predloži samo Prolaz A ili `diff`.

## 1. Worktree

Nikad u živom radnom stablu, jer ga dijele paralelne sesije. Putanju i bazu (`$BASE`: `origin/<default>`, ili `HEAD`
za repo bez remotea) daje preflight:

```bash
# COMMIT (ime grane iz preflighta; dobije sufiks -2 kad je današnje ime zauzeto):
git -C "$REPO" worktree add -b "$BRANCH" "$WT" "$BASE"
# LOCAL-ONLY:
git -C "$REPO" worktree add --detach "$WT" "$BASE"
```

`$WT` je pod `~/.claude/fable-review/worktrees/`, ne u `/private/tmp`, da reboot ne obriše necommitan rad.
Za `diff` nad nepushanom feature granom worktree se temelji na toj grani. Tada nosi commitove koda kojih nema na
glavnoj grani, pa ga korak 4 ne smije pushati na glavnu granu (to hvata provjera u koraku 4; reci korisniku unaprijed).

Izlazni direktorij `$OUT`: za COMMIT putanja iz `templates/<mod>.md` unutar `$WT`; za LOCAL-ONLY lokalni Report dir.

## 2. Prolaz A: mapa i provjere

Ako handoff kaže da je Prolaz A gotov (npr. pripremljen u Antigravityju), provjeri da mapa, worktree i SHA postoje
pa idi na korak 3.

Repo (ili u `diff` modu sam diff) manji od ~5.000 linija mapiraj sam. Inače jedan subagent `model: "sonnet"`, `effort: "medium"`, s promptom koji
daje `$WT`, `$OUT`, mod, zamrznuti SHA i uputu da pročita i slijedi `${CLAUDE_SKILL_DIR}/templates/pass-a.md`
(apsolutna putanja). Rezultat je `$OUT/<datum>-00-map.md`. Za COMMIT subagent mapu commita u worktreeju, za
LOCAL-ONLY je samo zapiše.

## 3. Prolaz B: Fable provjera

Jedan subagent `model: "fable"` s effortom iz tvrdih pravila (zadano `"medium"`). Prompt daje `$WT`, `$OUT`, mod,
SHA, odredište i mapu, te uputu da prije ijedne linije koda pročita `templates/pass-b.md` i `templates/<mod>.md`.
U `full` modu nad velikim repoom ide jedan Fable agent po podsustavu, redom, i svaki nastavlja od progress datoteke
prethodnoga.

Kad se vrati, prvo `salvage.py` (tvrdo pravilo gore), pa njegov `cost_usd` i broj poziva usporedi s procjenom iz
preflighta i javi u jednom retku. Ako salvage kaže `finished=no`, agent nije dovršio posao: javi to korisniku i
njegov zadnji tekst ne smatraj pregledom. Zatim provjeri da svaki dokument koji je Fable prijavio stvarno postoji na
disku.

## 4. Završetak

COMMIT (repo bez remotea: bez fetcha, rebasea i pusha, grana se lokalno spaja):
```bash
git -C "$WT" fetch origin
# Provjera: na glavnu granu smije samo grana u kojoj je svaka promjena dokument pregleda pod $OUT.
OUT_REL="${OUT#$WT/}"
OTHER="$(git -C "$WT" diff --name-only "origin/$DEFAULT_BRANCH"...HEAD | grep -v "^$OUT_REL/")"
```
- `OTHER` prazan: grana nosi samo dokumente pregleda. Nastavi:
  ```bash
  git -C "$WT" rebase "origin/$DEFAULT_BRANCH"
  git -C "$WT" tag -a "<tag iz preflighta>" -m "Fable <mod> review (<datum>)"
  git -C "$WT" push origin HEAD:"$DEFAULT_BRANCH" --follow-tags
  ```
- `OTHER` nije prazan (npr. `diff` pregled na feature grani): **nikad push na glavnu granu**, jer bi to isporučilo
  upravo kod koji se pregledava. Bez taga. Pushaj samo granu pregleda (`git -C "$WT" push origin "$BRANCH"`) ili je
  ostavi lokalno ako korisnik tako želi, i korisniku nabroji datoteke iz `OTHER`. Commitove pregleda kasnije se može
  cherry-pickati na glavnu granu.

Ako push na glavnu granu odbije zaštita grane, pushaj `$BRANCH` s `--follow-tags` i javi. Worktree i lokalnu granu
briši tek nakon uspješnog pusha (bilo koje od dviju grana):
`git -C "$REPO" worktree remove "$WT" && git -C "$REPO" branch -D "$BRANCH"`. Ako grana pregleda ostaje lokalno, ne
briši ni jedno ni drugo.

LOCAL-ONLY: `git -C "$WT" status --porcelain`. To dokazuje da nijedna praćena datoteka nije mijenjana i da nije
nastala nova nepraćena datoteka izvan `.gitignore`; gitignorirane putanje ne vidi, a tamo završavaju instalacije iz
provjere (`node_modules`, cache buildova), što predložak dopušta. Prazno: `git -C "$REPO" worktree remove "$WT"`.
Nije prazno (npr. `flutter pub get` je prepisao `pubspec.lock`): nabroji stavke korisniku i worktree briši s
`--force` tek na njegovo „može”. Izvještaj ostaje u Report diru iz preflighta.

## 5. Handoff za Opus

Gotov prompt za novu Opus sesiju u `~/.claude/handoffs/<repo>/<YYYY-MM-DD-HHMM>-fable-review-implementacija.md` i u
clipboard: putanja repoa i dokumenta (i SHA ako je commitan), „pročitaj cijeli dokument, posebno ono što se ne dira”,
prvih 3 do 5 stavki s ID-em i datoteka:linija, „prvo test koji pada, pa popravak, pa status u istom dokumentu”, i
„stavke za odluku vlasnika ne pogađaj”. Za LOCAL-ONLY handoff ponavlja da se dokument ne commita u repo.

Završni izvještaj: gdje su dokumenti (SHA i tag, ili lokalna putanja), putanja salvage datoteke, broj nalaza po prioritetu, 3 do 5 najvažnijih
nalaza, stvarni i procijenjeni trošak, putanja handoffa.
