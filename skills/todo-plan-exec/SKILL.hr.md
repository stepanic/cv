---
name: todo-plan-exec
description: Izvedi lanac sesija koji je napravio todo-plan — ova sesija je orkestrator (lijevi iTerm2 pane), a u desnom paneu za svaki handoff SN.md pokreće novu Claude Code sesiju izvršitelja, čeka njegov izvještaj preko SendMessage, provjerava ga naredbama i pokreće sljedeći, linearno do kraja ili do vrata. Pokreni kad korisnik kaže „izvedi plan / vrti lanac / pokreni handoffe jedan za drugim / orkestriraj lanac”, „nastavi <tema> u dva panea”, ili /todo-plan-exec [putanja do handoffs/] [--max N] [--model M].
---

# todo-plan-exec — orkestrator lanca u dva panea

Par uz `todo-plan`. Ova sesija **ne piše kod**: pokreće izvršitelje, prosljeđuje pitanja i
provjerava rezultate. Izvršitelj je svaki put **nova** `claude` sesija u desnom paneu (čišće od
`/clear`). Korisnik gleda oba panea.

Skripta: `~/.claude/skills/todo-plan-exec/scripts/iterm_worker.py` (iTerm2 Python API, mora biti
uključen: Settings → General → Magic → Enable Python API). Preambula izvršitelja:
`~/.claude/skills/todo-plan-exec/preambula.md`. Pokreće se s `python3` (treba modul `iterm2`).

## Argumenti

- putanja do `handoffs/` (zadano: jedini `docs/**/handoffs/README.md` ispod trenutnog repoa; ako
  ih je više, pitaj),
- `--max N` sesija u ovom pokretanju (zadano 1; korisnik ga diže svjesno, svaka sesija je puna
  Opus sesija sa subagentima),
- `--model` za izvršitelja (zadano: korisnikov zadani; `sonnet` za testove).

## 0. Priprema (jednom)

1. `ListAgents` → zapamti **svoje ime** („This session is …”). Izvršitelj ti piše na to ime.
2. Repo: `git -C <repo> rev-parse --show-toplevel`; iz `handoffs/README.md` pročitaj samo „Stanje
   lanca” i redak „Polazak” iz zajedničkih pravila (naredba provjere).
3. Ako je kontekst ove sesije već velik (> 100k), reci to i predloži novu sesiju za orkestratora.

## 1. Krug (za svaku sesiju SN)

1. **Sljedeća sesija** = prvi red u „Stanje lanca” koji nije `gotovo`. Nema ga → lanac je gotov (korak 3).
2. **Polazak:** `git -C <repo> status --porcelain` prazan i naredba provjere zelena (pokreni je u
   pozadini samo ako traje dugo; inače izravno, ispis skrati na zbroj). Nije zeleno → stani, javi.
3. **Vrata unaprijed:** ako `SN.md` na vrhu traži korisnikov „go” *prije bilo kakvog rada*, pitaj
   korisnika sad. Vrata usred paketa (npr. „koraci 1–2 odmah, prije 3 pitaj”) prepusti
   izvršitelju: on će poslati `PITANJE`.
4. **Pokreni:**
   ```bash
   python3 ~/.claude/skills/todo-plan-exec/scripts/iterm_worker.py split --cwd <repo>
   python3 ~/.claude/skills/todo-plan-exec/scripts/iterm_worker.py start --cwd <repo> \
     --handoff <handoffs>/SN.md --session SN --orchestrator <tvoje ime> --preamble preambula.md [--model M]
   ```
   Zapamti `HEAD` prije pokretanja (polazni commit kruga).
5. **Osigurač za pad:** `ListAgents` → nova sesija čije ime počinje imenom direktorija repoa
   (npr. `lanac-test-a5`); `SendMessage` bez poruke s `notify_when_idle: true`. Stiže jedna
   obavijest kad izvršitelj stane ili izađe. Ako je u međuvremenu stigao `IZVJEŠTAJ`, obavijest
   zanemari; ako nije, izvršitelj je stao bez izvještaja (pitanje bez alata, pad, limit):
   `iterm_worker.py status`, zadnji commit, javi korisniku.
6. Javi korisniku jednom rečenicom („S2 radi u desnom paneu, javit ću se kad stigne izvještaj”)
   i **završi turn**. Ne prati napredak: bez Monitora, bez `sleep`, bez čitanja panea.

## 2. Poruke izvršitelja

- **Na vratima nitko ne čeka.** Izvršitelj sitne odluke donosi sam („(potvrditi)” u decisions),
  odluke pita s preporukom i 60 s auto-izbora (ispod), a na vratima uredno završi s
  `IZVJEŠTAJ SN: ČEKA ODGOVOR`. Razlog: čekanje ne troši ništa, ali
  izvršitelj s 100k+ konteksta nakon > 1 h (TTL cachea) plaća ponovno pisanje cijelog konteksta;
  nova sesija s odgovorom u preambuli je jeftinija.
- **`ČEKA ODGOVOR`** → provjeri kao i inače (commit, stablo, pitanje je na vrhu handoffa), zatim
  obavijesti korisnika: `osascript` notifikacija **i** `PushNotification` (učitaj kroz ToolSearch)
  s jednom rečenicom pitanja. Pitanje mu napiši kao običan tekst (ne `AskUserQuestion`) i završi
  turn. Kad odgovori (bilo kad), pokreni sljedeći handoff s `--answers "<odgovor>"`: skripta ga
  stavlja iznad handoffa kao „ODGOVORI KORISNIKA”. Odluke ne donosi umjesto korisnika.
- **`PITANJE SN (odluka): …; preporuka: X`** → izvršitelj čeka (≤ 2 min, cache je topao).
  1. Napiši korisniku pitanje kao tekst: opcije, **preporuka označena**, i „ako ne odgovoriš u
     60 s, ide preporuka”. Ne `AskUserQuestion` (nema timeout).
  2. Pokreni timer u pozadini (Bash, `run_in_background: true`):
     `sleep ${CEKAJ:-60}; echo "ISTEKLO SN <kratki id pitanja>"` i završi turn.
  3. Što stigne prvo:
     - korisnikov odgovor → `SendMessage` na `from` iz pitanja: `ODGOVOR SN: <odgovor> (korisnik)`;
       kasniji `ISTEKLO` s tim id-em zanemari;
     - `ISTEKLO` za pitanje koje još nema odgovor → `ODGOVOR SN: <preporuka> (auto, korisnik nije
       odgovorio u 60 s)`, i korisniku jedna rečenica što je odabrano.
  4. Uz `ODGOVOR` uvijek `notify_when_idle: true` (osigurač).
  Pitanje bez preporuke ili ono koje je zapravo vrata ne ide u auto: odgovori „ovo su vrata,
  završi s ČEKA ODGOVOR”.
- **`PITANJE SN` bez oznake razine** (stari oblik): tretiraj kao vrata ako spominje produkciju,
  deploy, slanje, brisanje ili trošak; inače kao odluku, a ako nema preporuke, nema ni auto.
- **`IZVJEŠTAJ SN: …`** → provjeri samo naredbama, bez čitanja koda:
  - `git -C <repo> log --oneline <polazni>..HEAD` ima commitove; `status --porcelain` prazan;
  - naredba provjere zelena (brojke usporedi s izvještajem);
  - red SN u „Stanje lanca” je `gotovo` s commitom; `S(N+1).md` ima upisan polazni commit
    (nema „(upisuje”);
  - push: `git -C <repo> status -sb` nije `ahead` (ako repo ima remote).

  Sve uredu → sljedeći krug (ako `--max` dopušta). `NIJE GOTOVO` → po pravilu lanca opet SN
  (najviše jednom zaredom; drugi put stani i pitaj korisnika). Provjera pala → stani.
- Bez `IZVJEŠTAJA` i bez idle obavijesti ne budi se sam (nema `sleep`, Monitora ni petlje
  `ListAgents`).

Provjereno 16. 11. 2026. na testnom lancu (S1 commit + S2 pitanje kroz orkestratora, Sonnet):
split, `/exit` + novi `claude` u istom paneu, `IZVJEŠTAJ` i `PITANJE`/`ODGOVOR` rade. iTerm2
`jobName` za claude vraća verziju (npr. `2.1.325`), ne „claude”: skripta zato gleda je li u
paneu ljuska. U privremenoj mapi nije bilo pitanja „trust this folder”; ako se u novoj mapi
pojavi, korisnik ga potvrdi jednom.

## 3. Kraj ili stop

- Izvršitelja ostavi otvorenog (korisnik može pogledati); `iterm_worker.py close` samo na traženje.
- Obavijest: `osascript -e 'display notification "<poruka>" with title "todo-plan-exec"'`.
- Sažetak korisniku: koje sesije su prošle (commit, testovi), gdje je stalo i zašto, što je sljedeće.

## Pravila

- Orkestrator ne mijenja kod ni handoffe; ako izvještaj traži izmjenu plana, to radi izvršitelj
  sljedeće sesije (handoff se mijenja samo prema naprijed).
- Jedan izvršitelj u isto vrijeme. Nikad paralelno.
- Trošak: prije `--max` > 2 reci korisniku koliko sesija slijedi.
- Produkcija, slanje poruka i ostale vanjske radnje uvijek idu kroz `PITANJE` i korisnikov odgovor.
