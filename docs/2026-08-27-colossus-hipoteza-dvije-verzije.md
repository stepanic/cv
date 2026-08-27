# Colossus hipoteza — dvije verzije istog članka

Isti sadržaj, ista mjerenja, dva registra. Verzija B je ona koja ide na blog.

Mjerenja su napravljena 27. kolovoza 2026. nad `data/generated/claude-code-stats.json`
i lokalnim transkriptima u `~/.claude/projects/`. Reproducibilne naredbe su na dnu.

---

## Verzija A — dramaturški registar (odbačena)

> Registar koji LLM-ovi zadano pišu: uvod, zaplet, obrat, pouka. Ovdje je zapisan
> zato da se vidi razlika, ne zato da se objavi.

### EN

**I was certain I had felt a $15 billion datacenter deal. My own telemetry says I felt my backup script.**

On 6 May 2026, xAI handed Anthropic the entire Colossus 1 facility outside Memphis: over
220,000 Nvidia GPUs, 300 megawatts, $1.25 billion a month through May 2029. I did not learn
this from a press release. I learned it the way I learn most things now, by asking Claude, and
the number stopped me: fifteen billion dollars a year, for one cluster, so that a terminal
window can answer me.

And I was sure I had felt it. Somewhere around the start of May something changed in how
Claude Code behaved for me. Sessions got longer. Work that used to stall stopped stalling. I
had the receipts, too, or thought I did: 21.3 billion tokens across 4,157 sessions, all of it
mined out of my own transcripts. April, one billion tokens. May, four. June, six.

So I went looking for the moment. What I found instead was my own instrument.

The first crack was the date. The jump is not at the start of May at all. The first eleven days
of May average 51 million tokens a day, *below* the second half of April at 94 million. The
break is 12 May, and everything after it lives in a different regime: 182 million a day for the
rest of the month, 218 in June.

The second crack was the model. Through all of May I ran exactly one model, `opus-4-7`. Opus
4.8 does not appear in my transcripts until 29 May. Fable 5 until 9 June. And Opus 5, the model
I had named as the cause, until **24 July**. Whatever I felt in May, it was not the thing I
thought I felt it from.

The third crack was fatal. `dotclaude-backup`, the tool that snapshots `~/.claude` into a daily
git commit, has its first commit on **12 May 2026**. The same day as the break. Before it, 45 of
72 days are missing from my own history, lost to the 30-day transcript retention. After it, 2 of
81. The step I had been reading as a change in the world was, in large part, the day I started
recording the world properly.

The fourth check was the one that should have settled it in my favour, and did the opposite.
Overload and limit errors, per thousand assistant messages: 0.33 in May, 1.85 in June, 1.36 in
July. If Colossus 1 had loosened anything for me, that line should fall. It rises.

Here is what I actually learned, and it is worth more than the story I wanted to tell. My token
counts measure *my demand*. They say nothing about anyone's supply. To claim that a lease in
Tennessee reached my terminal I would need serving-side numbers — latency per token, time to
first token, the rate of 529s, normalized by model and hour — and a baseline collected before I
went looking. I had none of that. I had a curve that bent on the day I bought a better ruler.

The deal is real. The feeling was real. The causal line between them was something I drew myself.

### HR

**Bio sam siguran da sam osjetio ugovor od 15 milijardi dolara. Vlastita telemetrija kaže da sam osjetio svoju skriptu za sigurnosnu kopiju.**

Šestoga svibnja 2026. xAI je Anthropicu ustupio cijeli Colossus 1 kraj Memphisa: više od
220.000 Nvidijinih grafičkih procesora, 300 megavata, 1,25 milijardi dolara mjesečno do svibnja
2029. Za to nisam saznao iz priopćenja za javnost nego onako kako danas saznajem gotovo sve,
pitao sam Claudea, i brojka me zaustavila. Petnaest milijardi godišnje, za jedan klaster, da bi
mi prozor terminala odgovorio.

I bio sam siguran da sam to osjetio. Negdje na početku svibnja nešto se promijenilo u tome kako
se Claude Code kod mene ponaša. Sesije su se produljile. Poslovi koji bi prije zapeli prestali su
zapinjati. Imao sam i dokaze, mislio sam: 21,3 milijarde tokena kroz 4157 sesija, sve izrudareno
iz vlastitih transkripata. Travanj, milijarda tokena. Svibanj, četiri. Lipanj, šest.

Krenuo sam tražiti trenutak. Umjesto njega našao sam vlastiti mjerni instrument.

Prva je pukotina bio datum. Skoka na početku svibnja naprosto nema. Prvih jedanaest svibanjskih
dana prosječno daju 51 milijun tokena dnevno, dakle *manje* od druge polovice travnja s 94
milijuna. Prijelom je 12. svibnja, a sve poslije njega živi u drugom režimu: 182 milijuna dnevno
do kraja mjeseca, 218 u lipnju.

Druga je pukotina bio model. Kroz cijeli svibanj vozio sam točno jedan model, `opus-4-7`. Opus
4.8 u mojim se transkriptima ne pojavljuje prije 29. svibnja. Fable 5 prije 9. lipnja. A Opus 5,
model koji sam prozvao uzrokom, tek **24. srpnja**. Što god da sam u svibnju osjetio, nije došlo
odande odakle sam mislio.

Treća je pukotina bila kobna. `dotclaude-backup`, alat koji `~/.claude` svakodnevno sprema u git,
ima prvi commit **12. svibnja 2026.** Istoga dana kad i prijelom. Prije njega u mojoj povijesti
nedostaje 45 od 72 dana, progutala ih je tridesetodnevna retencija transkripata. Poslije njega
nedostaju dva od 81. Stepenicu koju sam čitao kao promjenu u svijetu dobrim je dijelom bio dan
kad sam svijet počeo uredno bilježiti.

Četvrta je provjera trebala presuditi u moju korist, a presudila je obrnuto. Greške preopterećenja
i ograničenja, na tisuću asistentskih poruka: 0,33 u svibnju, 1,85 u lipnju, 1,36 u srpnju. Da mi
je Colossus 1 išta olabavio, ta bi krivulja padala. Ona raste.

Evo što sam zapravo naučio, i to vrijedi više od priče koju sam htio ispričati. Moje brojke o
tokenima mjere *moju potražnju*. O tuđim kapacitetima ne govore ništa. Da bih tvrdio kako je
najam u Tennesseeju stigao do mog terminala, trebale bi mi brojke sa strane posluživanja,
kašnjenje po tokenu, vrijeme do prvoga tokena, udio grešaka 529, sve to razvrstano po modelu i
satu, i mjereno prije nego što sam počeo tražiti. Ništa od toga nisam imao. Imao sam krivulju
koja se prelomila onoga dana kad sam kupio bolje ravnalo.

Ugovor je stvaran. Osjećaj je bio stvaran. Uzročnu crtu među njima povukao sam sâm.

---

## Verzija B — inženjerski registar (objavljena)

Tekst je u `web/content/blog.ts`, slug `colossus-lease-in-my-own-usage-data`.

---

## Reproducibilnost

Sva su mjerenja iz ovoga članka ponovljiva ovim naredbama.

Dnevni i mjesečni tokeni:

```bash
node -e "const d=require('./data/generated/claude-code-stats.json');console.table(d.monthly)"
```

Prva pojava svakoga modela u lokalnim transkriptima:

```bash
cd ~/.claude/projects
grep -rhoE '"model":"claude-[a-z0-9.-]+"' --include=*.jsonl . | sort -u
```

Za datume prve pojave treba proći JSONL redak po redak i uzeti `min(timestamp)` po
`message.model` uz uvjet da redak ima `message.usage` (inače se hvataju i spomeni modela
u tekstu poruke).

Početak pokrivenosti sigurnosnom kopijom:

```bash
git -C ~/git/stepanic/dotclaude-backup log --reverse --format='%ad %s' --date=short | head -1
```

Praznine u pokrivenosti prije i poslije toga datuma:

```bash
node -e "
const d=require('./data/generated/claude-code-stats.json').daily;
const has=new Set(d.map(x=>x.day));
const gaps=(a,b)=>{let m=0,t=0;for(let x=new Date(a);x<=new Date(b);x.setDate(x.getDate()+1)){t++;if(!has.has(x.toISOString().slice(0,10)))m++}return m+'/'+t};
console.log('prije:',gaps('2026-03-01','2026-05-11'));
console.log('poslije:',gaps('2026-05-12','2026-07-31'));
"
```

Greške preopterećenja po mjesecu, normalizirane na broj asistentskih poruka: brojati retke koji
odgovaraju `/Overloaded|overloaded_error|usage limit reached|API Error: 5\d\d/i` i dijeliti ih
brojem redaka gdje je `type === "assistant"` i postoji `message.usage`.

## Izmjerene vrijednosti, 27. kolovoza 2026.

| mjerenje | vrijednost |
|---|---|
| ukupno sesija / projekata | 4157 / 195 |
| ukupno tokena | 21,27 mlrd |
| travanj 15.–30., prosjek | 94 mln/dan (10 dana s podacima) |
| svibanj 1.–11., prosjek | 51 mln/dan (9 dana) |
| svibanj 12.–31., prosjek | 182 mln/dan (19 dana) |
| lipanj, prosjek | 218 mln/dan (29 dana) |
| najjači dan u svibnju | 26. svibnja, 483 mln |
| praznine 1. 3. – 11. 5. | 45 od 72 dana |
| praznine 12. 5. – 31. 7. | 2 od 81 dana |
| prvi commit dotclaude-backupa | 12. svibnja 2026. |
| `opus-4-7` prvi put | 17. travnja 2026. |
| `opus-4-8` prvi put | 29. svibnja 2026. |
| `fable-5` prvi put | 9. lipnja 2026. |
| `opus-5` prvi put | 24. srpnja 2026. |
| greške / 1000 poruka, svibanj | 0,33 |
| greške / 1000 poruka, lipanj | 1,85 |
| greške / 1000 poruka, srpanj | 1,36 |

## Ograničenja koja treba navesti uz svaku ponovnu uporabu ovih brojki

1. Pokrivenost prije 12. svibnja 2026. rekonstruirana je iz unije starijih snimaka i
   `stats-cache.json`. Travanjska osnovica zato nije pouzdana ni u jednom smjeru; jednako je
   moguće da je stvarna potrošnja bila viša od zabilježene.
2. Broj sesija po mjesecu nije usporediv kroz cijeli niz. Svibanj pokazuje 170, lipanj 2016, a
   razlika je prevelika da bi bila stvarna; vjerojatno se mijenjalo što se broji kao sesija.
   Zato se u članku koriste tokeni, ne sesije.
3. Greške preopterećenja rastu i s vlastitom paralelizacijom, ne samo s opterećenjem usluge.
   Rast te krivulje ne dokazuje da je kapacitet lošiji, nego samo da nema dokaza da je bolji.
4. Ništa od ovoga ne opovrgava da je najam Colossusa 1 povećao Anthropicov kapacitet. Opovrgava
   samo tvrdnju da se to vidi u ovim podacima.
