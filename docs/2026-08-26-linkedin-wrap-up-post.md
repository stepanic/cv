# LinkedIn objava — open source `/wrap-up` skill

Nacrt napisan 2026-08-26, uz objavu skilla u [`skills/wrap-up/`](../skills/wrap-up/)
i blog post
[`wrap-up-skill-mined-from-my-own-transcripts`](https://stepanic.domovina.ai/blog/wrap-up-skill-mined-from-my-own-transcripts).

Cilj objave je isti kao kod ostatka repozicioniranja iz
[`2026-08-26-linkedin-pozicioniranje.md`](2026-08-26-linkedin-pozicioniranje.md):
pokazati metodu, ne alat. Kuka nije "napravio sam skill" nego "dokazi o vlastitoj
navici već leže na disku, samo ih nitko ne broji".

Tekst je bez crtica i bez bolda, po konvenciji iz `CLAUDE.md` za sve što ide van
kao njegovo pismo. LinkedIn ionako ne renderira markdown.

## Brojke u nacrtu (provjerene 2026-08-26)

| brojka | izvor |
|---|---|
| 147 sesija, 119 varijanti | mjereno 2026-08-04 u sesiji `dbddef39`, repo `domovina-stats` |
| 88 / 70 / 41 / 12 % | isto mjerenje, udjeli koraka u 98 punih varijanti |
| 47 pokretanja kroz 11 radnih dana | `grep -rc "<command-name>/wrap-up</command-name>"` po `~/.claude/projects`, 2026-08-04 do 2026-08-26 |

Ako se objava odgodi za koji tjedan, ponovi zadnje brojanje prije objave, broj
pokretanja raste sam.

## Nacrt, engleski

```
I kept typing the same paragraph at the end of every Claude Code session.

Commit and push everything, update the memory files, and if this chat produced knowledge that is not yet in the codebase, write it into a markdown document, then prepare the chat for /clear.

So I asked for a shortcut. The part I did not expect was the method.

Claude Code stores every session as JSONL on your own disk. Instead of describing my habit from memory, I searched it. 147 sessions contained that request, in 119 distinct phrasings, typos included. Then I counted which steps actually show up.

Commit and push, 88 percent. Memory files, 70 percent. A markdown document, 41 percent. A mermaid diagram, 12 percent.

The counts corrected me twice.

I feel like I ask for diagrams constantly. It is 12 percent. Written from memory, the skill would have drawn one on every run, faithful to my self-image and wrong about my behavior.

And the most valuable step was missing from my own prompt. The longest variants ask for a handoff prompt in the clipboard, ready to paste into the next empty session. I had stopped saying it out loud because I assumed it. Mining put it back in.

One line in the skill is marked red: never git add -A. That is not a style preference, it is a near miss written down. During the very session that produced the skill, a neighboring repo held an unfinished .gitignore and a set of half-written scripts, untracked. git add -A would have pushed a half-done afternoon straight to main.

Since August 4 it has run 47 times across 11 working days, in every repo I touch, not just the one it was born in.

It is open source now, MIT, one markdown file:
github.com/stepanic/cv/tree/main/skills/wrap-up

The full story, with the mining script so you can run it on your own transcripts:
stepanic.domovina.ai/blog/wrap-up-skill-mined-from-my-own-transcripts

If you use Claude Code, the prompt you retype most often is already a skill. It is sitting in ~/.claude/projects, waiting for somebody to count it.
```

## Nacrt, hrvatski

```
Na kraju svakog Claude Code razgovora tipkao sam isti odlomak.

Sve commitaj i pushaj, updejtaj memory fajlove, i ako je u ovom chatu nastalo znanje koje nije trajno u codebaseu, zapiši ga u markdown dokument, pa pripremi chat za /clear.

Pa sam zatražio prečac. Ono što nisam očekivao je metoda.

Claude Code sprema svaku sesiju kao JSONL na tvoj disk. Umjesto da naviku opišem po sjećanju, pretražio sam je. 147 sesija sadržavalo je taj zahtjev, u 119 različitih formulacija, tipfeleri uključeni. Onda sam prebrojao koji se koraci doista pojavljuju.

Commit i push, 88 posto. Memory fajlovi, 70 posto. Markdown dokument, 41 posto. Mermaid dijagram, 12 posto.

Brojke su me ispravile dvaput.

Osjećam da dijagrame tražim stalno. Tražim ih u 12 posto slučajeva. Da sam skill pisao po sjećanju, crtao bi dijagram u svakom prolazu, vjeran mojoj slici o sebi i netočan o mom ponašanju.

A najvrjedniji korak nedostajao je u mom vlastitom promptu. Najduže varijante traže handoff prompt u clipboardu, spreman za lijepljenje u sljedeću praznu sesiju. Prestao sam ga izgovarati jer sam ga počeo podrazumijevati. Rudarenje ga je vratilo.

Jedna linija u skillu označena je crvenim: nikad git add -A. To nije stilska preferencija nego zapisan promašaj za dlaku. Baš u sesiji koja je proizvela skill, susjedni repo držao je nedovršen .gitignore i hrpu napola napisanih skripti, netrackanih. git add -A odnio bi napola gotovo poslijepodne ravno na main.

Od 4. kolovoza okinuo se 47 puta kroz 11 radnih dana, u svakom repou koji diram, ne samo u onom u kojem je nastao.

Sad je open source, MIT, jedna markdown datoteka:
github.com/stepanic/cv/tree/main/skills/wrap-up

Cijela priča, sa skriptom za rudarenje da je pokreneš nad svojim transkriptima:
stepanic.domovina.ai/blog/wrap-up-skill-mined-from-my-own-transcripts

Ako koristiš Claude Code, prompt koji najčešće pretipkavaš već je skill. Leži u ~/.claude/projects i čeka da ga netko prebroji.
```

## Prvi komentar (obje verzije)

Zamka koju vrijedi staviti u komentar, ne u tijelo objave, da tekst ostane kratak:

```
Two traps if you try this on your own transcripts.

Claude Code prunes ~/.claude after 30 days, so anything older is gone unless you back it up. Mine survives on a daily git snapshot.

And the skill contaminates its own evidence. Once the description field holds your trigger phrases, every session that loads the skill list contains them too, so a naive grep balloons. Mine went from 147 to 562. Filter to messages a human actually typed and it is 193.
```

```
Dvije zamke ako ovo probaš nad svojim transkriptima.

Claude Code briše ~/.claude nakon 30 dana, pa je sve starije nestalo ako nemaš backup. Moje preživljava na dnevnom git snapshotu.

I skill kontaminira vlastite dokaze. Čim polje description sadrži tvoje okidačke fraze, sadrži ih i svaka sesija koja učita popis skillova, pa naivni grep nabuja. Moj je otišao sa 147 na 562. Filtriraj na poruke koje je čovjek doista utipkao i ostane 193.
```

## Vezani dokumenti

- [`2026-08-26-linkedin-pozicioniranje.md`](2026-08-26-linkedin-pozicioniranje.md) — headline i About za isti profil
- [`../skills/wrap-up/README.md`](../skills/wrap-up/README.md) — puna dokumentacija skilla i metode
