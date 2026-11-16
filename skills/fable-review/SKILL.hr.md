---
name: fable-review
description: Pregled jednog git repoa u dva prolaza, samo za čitanje. Prolaz A (Sonnet) pokreće provjere i mapira ulazne točke na datoteka:linija; Prolaz B (Fable) ih provjerava u kodu i piše Markdown pregled s planom izvedbe za Opus. Modovi - diff, refactor, security, full, forensic. Pokreni na "napravi Fable analizu", "sigurnosni audit", "neka Fable pregleda repo", "plan refactora s Fableom" ili /fable-review.
argument-hint: "[putanja-repoa] [--mode diff|refactor|security|full|forensic]"
---

# Fable pregled: Fable pregledava, Opus izvodi

> Hrvatska inačica za čitanje. Claude Code učitava `SKILL.md`; ova datoteka opisuje isti postupak.

Opus brzo piše kod. Fable samo čita zamrznuti commit i piše Markdown nalaze i plan po fazama, koji Opus izvodi u
idućoj sesiji. Dva prolaza postoje jer je jedan Fable prolaz nad cijelim repoom narastao na 636k konteksta i stajao
6 do 14 $ po repou (postmortem `docs/2026-10-17-postmortem-fable-subagenti-tjedni-limit.md` u `stepanic/cv`).

Argumenti: `$ARGUMENTS` (prvi je putanja repoa, inače trenutni direktorij; `--mode <mod>`).

Uz skill stoje (subagentima se daju apsolutne putanje, jer oni ovu datoteku ne vide):
- `${CLAUDE_SKILL_DIR}/scripts/preflight.sh`: deterministička provjera opsega i odredišta, samo čita
- `${CLAUDE_SKILL_DIR}/templates/pass-a.md` i `pass-b.md`: upute za oba prolaza
- `${CLAUDE_SKILL_DIR}/templates/<mod>.md`: struktura izlaznog dokumenta po modu

## Tvrda pravila

- Jedan repo po pozivu. Više repoa ide jedan za drugim, svaki tek na korisnikovo „može”.
- Najviše jedan Fable agent istodobno, uvijek s eksplicitnim `effort: "medium"`.
- Kod, testovi i konfiguracija se ne diraju. Jedini izlaz je Markdown.
- Ništa se ne pokreće prema produkciji, stagingu, sandboxu ni vanjskim servisima.
- Vrijednost tajne nikad ne ide u dokument, samo datoteka:linija i vrsta tajne.
- Odredište određuje preflight, ne procjena modela.

## 0. Preflight i potvrda

1. `bash "${CLAUDE_SKILL_DIR}/scripts/preflight.sh" <repo> --mode <mod>` (bez `--mode` ako ga korisnik nije naveo).
2. Ako mod nije zadan: `diff` kad postoji raniji pregled i pitanje je što se promijenilo, `security` za auth, novac,
   tajne i napadnu površinu, `refactor` za strukturu i čišćenje, `full` za prvi dubinski prolaz kroz veći repo,
   `forensic` za atribuciju git povijesti po modelima.
3. Redak **DESTINATION**:
   - `COMMIT`: korisnikov repo. Dokumenti se commitaju u worktreeju, tagiraju i pushaju (korak 4).
   - `LOCAL-ONLY`: tuđi ili klijentski repo. Dokumenti idu samo u `~/.claude/fable-review/reports/<repo>/<datum>-<mod>/`.
     Bez commita, taga i pusha, bez ijedne datoteke unutar repoa i bez kopiranja u bilo koji drugi repo ili katalog.
   - `ASK`: prvo pitaj korisnika što od toga vrijedi.
4. Pokaži sažetak i procjenu, pitaj za preostali tjedni i 5-satni limit (`/usage`) i čekaj. Ispod ~15 % tjednog
   predloži samo Prolaz A ili `diff`.

## 1. Worktree

Nikad u živom radnom stablu, jer ga dijele paralelne sesije. Putanju i bazu (`$BASE`: `origin/<default>`, ili `HEAD`
za repo bez remotea) daje preflight:

```bash
git -C "$REPO" fetch origin
# COMMIT:
git -C "$REPO" worktree add -b "fable-review/<datum>-<mod>" "$WT" "$BASE"
# LOCAL-ONLY:
git -C "$REPO" worktree add --detach "$WT" "$BASE"
```

`$WT` je pod `~/.claude/fable-review/worktrees/`, ne u `/private/tmp`, da reboot ne obriše necommitan rad.

## 2. Prolaz A: mapa i provjere

Ako handoff kaže da je Prolaz A gotov (npr. pripremljen u Antigravityju), provjeri da mapa, worktree i SHA postoje
pa idi na korak 3.

Repo manji od ~5.000 linija mapiraj sam. Inače jedan subagent `model: "sonnet"`, `effort: "medium"`, s promptom koji
daje `$WT`, `$OUT`, mod, zamrznuti SHA i uputu da pročita i slijedi `${CLAUDE_SKILL_DIR}/templates/pass-a.md`
(apsolutna putanja). Rezultat je `$OUT/<datum>-00-map.md`.

## 3. Prolaz B: Fable provjera

Jedan subagent `model: "fable"`, `effort: "medium"`. Prompt daje `$WT`, `$OUT`, mod, SHA, odredište i mapu, te uputu
da prije ijedne linije koda pročita `templates/pass-b.md` i `templates/<mod>.md`. U `full` modu nad velikim repoom
ide jedan Fable agent po podsustavu, redom. Nakon kraja usporedi stvarni trošak s procjenom i javi u jednom retku.

## 4. Završetak

COMMIT: `fetch`, `rebase` na bazu, annotated tag s imenom koje je dao preflight, `push origin HEAD:<default> --follow-tags`.
Ako push odbije zaštita grane, pushaj granu `fable-review/<datum>-<mod>` i javi. Worktree i lokalnu granu briši tek
nakon uspješnog pusha. Repo bez remotea: grana se lokalno spaja, bez pusha.

LOCAL-ONLY: provjeri da je `git -C "$WT" status --porcelain` prazan, pa `worktree remove`. Izvještaj ostaje lokalno.

## 5. Handoff za Opus

Gotov prompt za novu Opus sesiju u `~/.claude/handoffs/<repo>/<YYYY-MM-DD-HHMM>-fable-review-implementacija.md` i u
clipboard: putanja repoa i dokumenta (i SHA ako je commitan), „pročitaj cijeli dokument, posebno ono što se ne dira”,
prvih 3 do 5 stavki s ID-em i datoteka:linija, „prvo test koji pada, pa popravak, pa status u istom dokumentu”, i
„stavke za odluku vlasnika ne pogađaj”. Za LOCAL-ONLY handoff ponavlja da se dokument ne commita u repo.

Završni izvještaj: gdje su dokumenti (SHA i tag, ili lokalna putanja), broj nalaza po prioritetu, 3 do 5 najvažnijih
nalaza, stvarni i procijenjeni trošak, putanja handoffa.
