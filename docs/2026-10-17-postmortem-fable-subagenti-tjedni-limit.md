# Postmortem: pet Fable 5.1 subagenata potrošilo zadnjih 7 % tjednog limita za 14 minuta

**Datum incidenta:** 2026-10-16, 22:06–22:22 CEST
**Zapisano:** 2026-10-17
**Sesija:** `~/.claude/projects/-Users-ms-git/8d40f90b-ad45-4198-9101-d5b7a1f28f58.jsonl` (glavna, Opus 5.5) + 5 subagenata u `…/8d40f90b-…/subagents/`
**Plan:** Claude Max 5x (`organizationRateLimitTier: default_claude_max_5x`), extra usage uključen, ali bez kredita
**Prethodni sličan incident:** [2026-09-30](2026-09-30-claude-session-limit-i-reduciranje-kvota.md) (monitor petlja, Opus)

## Sažetak

Iz Opus 5.5 sesije pokrenuli smo sigurnosne audite za 11 repoa na Claude Fable 5.1 subagentima, najviše tri paralelno. Za 14 minuta pet subagenata napravilo je 113 API poziva. Po cjeniku API-ja to je oko **30,5 $**, a s glavnom sesijom i jednom paralelnom Opus sesijom oko **32,3 $**. Tih 32 $ bilo je zadnjih 7 % tjednog limita. U 22:20 CEST stigao je `rateLimitType: "seven_day"`, `status: "rejected"`, `overageDisabledReason: "out_of_credits"`. 5-satni prozor bio je na 55 %, dakle nije on zaustavio rad.

Potrošnja je proporcionalna. Izgledala je neproporcionalno iz tri razloga:

1. **„600k konteksta“ nije potrošnja od 600k tokena.** Svaki API poziv ponovno šalje cijeli dotadašnji kontekst. Najveći agent (pay.domovina.ai) napravio je 44 poziva s prosječno oko 260k konteksta, ukupno **11 milijuna** ulaznih tokena za jedan audit.
2. **Fable 5.1 je 2,5× skuplji od Opusa 5.5 po tokenu** ($10/$50 naspram $4/$20 po MTok, cache write $12,50 naspram $5). Isti posao na Opusu bio bi oko 14 $, a na Sonnetu 5.5 oko 9 $.
3. **7 % tjednog limita je malo.** Iz omjera 45 bodova 5-satnog prozora prema 7 bodova tjednog slijedi da je tjedni limit oko 6,4 puna 5-satna prozora. Zadnjih 7 % tjednog vrijedi manje od pola jednog 5-satnog prozora, a pola 5-satnog prozora na tri paralelna Fable agenta traje oko četvrt sata.

Glavni krivac je planiranje, ne cijena po tokenu. Prije pokretanja 11 Fable audita nije bilo procjene troška, nije provjereno koliko tjednog limita je ostalo, a prompt je tražio čitanje cijelog koda u jedan kontekst. Pravilo iz `~/.claude/CLAUDE.md` („procijeni broj poziva, prijavi prije svega preko ~100 poziva“) prekršeno je: plan od 11 audita značio je oko 400–500 Fable poziva.

## Vremenska crta (CEST)

| Vrijeme | Događaj |
|---|---|
| 21:57 | Pregled tjedna u novoj sesiji (Opus 5.5). Prethodna aktivnost bila je u 14:53, pa je 5-satni prozor prazan. |
| 22:01 | Zahtjev: popis repoa za security audit; analize piše Fable 5.1. |
| 22:05 | „daj 1 i 2“: 11 repoa, dokument na main s današnjim datumom. |
| 22:06:10–22:06:41 | Pokrenuta tri subagenta, `model: "fable"`, `general-purpose`: **pay**, **pipeline**, **omm**. Ostalih 8 čeka u redu (najviše 3 paralelno). |
| 22:06–22:18 | Kontekst pay agenta raste s 40k na 418k (cat -n cijelih datoteka, čitanje spremljenih tool-resultova). |
| 22:14:24–22:15:26 | Pay agent ponovno čita četiri već viđena velika izlaza (~95k novih tokena dvaput): kontekst **418k → 609k u dvije minute**. |
| 22:18:34 | **omm** gotov (20 poziva, ~6 $). Pokreće se **energy**. |
| 22:19:34 | **pipeline** gotov (30 poziva, ~7,2 $). Pokreće se peti audit (repo izvan javne allow-liste, dalje „repo X“). |
| 22:20:36 | Repo X pada: `You've hit your weekly limit · resets 2am`, HTTP 429. |
| 22:20:51 | energy pada, isto. |
| 22:22:21 | Pay agent zapisuje dokument od 33 KB (posljednji poziv, kontekst 636k, 20.786 output tokena), a zatim pada prije commita. |
| 22:24 | Automatski nastavak u 2:00 otkazan. |

## Brojke po agentu

Izvor: polje `usage` u transkriptima, jedan zapis po `message.id` (transkript bilježi isti odgovor u više redaka, po jedan za svaki blok sadržaja). Cijene su s Anthropicova API cjenika (skill `claude-api`, keširano 2026-10-06):

| Model | Input | Cache write (5 min) | Cache read | Output |
|---|---|---|---|---|
| Fable 5.1 | $10 | $12,50 | $0,25 | $50 |
| Opus 5.5 | $4 | $5 | $0,20 | $20 |
| Sonnet 5.5 | $2 | $2,50 | $0,20 | $10 |

(po milijunu tokena; cache write = 1,25× input za 5-minutni TTL)

| Agent | Poziva | Max kontekst | Cache write | Cache read | Output (od toga thinking) | Fable $ | Isto na Opusu | Isto na Sonnetu |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| pay.domovina.ai | 44 | 636k | 636.105 | 10.984.242 | 65.057 (31.370) | 13,96 | 6,68 | 4,44 |
| pipeline.domovina.ai | 30 | 289k | 270.718 | 4.580.598 | 52.400 (23.457) | 7,16 | 3,32 | 2,12 |
| omm.domovina.ai | 20 | 249k | 231.616 | 2.689.143 | 48.340 (19.679) | 5,99 | 2,67 | 1,60 |
| energy.domovina.ai | 13 | 175k | 156.725 | 999.220 | 6.714 (1.209) | 2,55 | 1,12 | 0,66 |
| repo X | 6 | 68k | 50.040 | 257.786 | 2.196 (588) | 0,80 | 0,35 | 0,20 |
| **Subagenti ukupno** | **113** | | **1.345.204** | **19.510.989** | **174.707** | **30,46** | **14,1** | **9,0** |
| Glavna sesija (Opus 5.5) | 14 | ~100k | 81.789 | 1.091.770 | 20.786 | 1,04 | | |
| Paralelna Opus 5.5 sesija u drugom repou | 18 | | 74.277 | 1.355.779 | 7.968 | 0,80 | | |
| **Sve u 5-satnom prozoru** | | | | | | **~32,3** | | |

Struktura troška Fable subagenata (API cjenik):

- cache write: 1,35M × $12,50 = **16,8 $ (55 %)**. Svaki novi tool result (datoteka, grep, izlaz) prvi put ulazi u kontekst po 1,25× ulazne cijene.
- output: 175k × $50 = **8,7 $ (29 %)**, od toga oko 76k thinking tokena.
- cache read: 19,5M × $0,25 = **4,9 $ (16 %)**. Ponovno slanje istog konteksta je jeftino po tokenu, ali ga ima puno.
- svježi input: 3.466 tokena, zanemarivo.

## Zašto je kontekst rastao tako brzo

Prompt je tražio da agent pročita CLAUDE.md, README, docs i ADR-ove, pa zatim „stvarni kod“, i da svaki nalaz potvrdi s `datoteka:linija`. Pay repo ima oko 59k linija koda. Agent je to napravio najskupljim mogućim putem:

- `for f in …; do cat -n "$f"; done` nad 4–7 datoteka odjednom. Izlazi od 30–60 KB prelazili su prag, pa ih je Claude Code spremio u `tool-results/*.txt` i vratio samo 2 KB pregleda. Agent je zatim te datoteke čitao `Read`-om u cijelosti, a to je **25+ čitanja po 5–15k tokena**.
- U 22:14 ponovno je pročitao četiri ista spremljena izlaza (`b0k7lzubq`, `bpf63aa8c`, `bgxc3ipd2`, `byq989k51`, oko 55 KB svaki), a u 22:15 dva od njih još jednom djelomično. Isti kod je tako dvaput plaćen kao cache write.
- Zadnji poziv pisao je dokument od 33 KB (20.786 output tokena) nad kontekstom od 636k.

Ništa od toga nije greška alata. Fable je pedantan i uz 1M konteksta nema razloga štedjeti. Bez eksplicitnog ograničenja („grep prije čitanja“, „ne čitaj datoteku drugi put“, budžet) agent drži cijeli repo u kontekstu.

## Effort

Agent alat pozvan je bez parametra `effort`, a `~/.claude/settings.json` ima `"effortLevel": "high"`, pa su subagenti najvjerojatnije radili na **high**. Transkript ne bilježi effort, pa to nije dokazano. Na trošak nije bitno utjecao: thinking je bio oko 76k od 175k output tokena, dakle oko 3,8 $. `medium` bi uštedio dio toga, ali glavni trošak su cache write i dužina konteksta, ne razmišljanje.

## Odnos tjednog i 5-satnog limita

Anthropic ne objavljuje kako se pretplatnički limiti preračunavaju u tokene ni kolika je težina pojedinog modela. Ovo je zaključak iz vlastitih brojki, ne službeni podatak:

- Isti posao (~32 $ po API cjeniku) pomaknuo je 5-satni prozor za oko 45 bodova (0 → 55 %; ako je prije bilo nešto malo, pomak je manji) i tjedni za 7 bodova (93 → 100 %).
- Omjer 45 : 7 znači da je **tjedni limit ≈ 6,4 puna 5-satna prozora**. To je očekivana konstrukcija: tjedni limit je manji od zbroja svih 5-satnih prozora u tjednu (33,6), da se ne može cijeli tjedan raditi punom brzinom.
- Ako se limit troši proporcionalno API cijeni, 5-satni prozor na ovom planu vrijedi **oko 70 $** Fable rada, a tjedni oko **460 $**.
- 30.09. 5-satni prozor pukao je na oko **369 $** API protuvrijednosti Opus rada. Ako su obje brojke točne, Fable se u limit broji primjetno teže od svoje API cijene, ili se cache read ne broji po API cijeni. Iz ovih podataka se to ne može razlučiti. Za planiranje je sigurnije pretpostaviti da **Fable troši limit barem 2,5× brže od Opusa** za isti posao, vjerojatno i više.

Odgovor na „nije mi proporcionalno“: unutar ovog incidenta potrošnja jest proporcionalna. Nije bio u pitanju skok ni greška u brojanju, nego 113 poziva s rastućim kontekstom na najskupljem modelu. Kad je ostalo samo 7 % tjednog, toliko je bilo dovoljno za četvrt sata.

## Što bi cijeli plan koštao

Pet agenata u prosjeku je trebalo oko 6–14 $ po repou za koji su stigli dovršiti posao. Plan je imao 11 repoa, uključujući jedan od 106k linija, `domovina.ai` i `flutter_moja_mreza`. Gruba procjena je **100–150 $ API protuvrijednosti na Fableu**, što je otprilike **20–35 % tjednog limita** Max 5x plana. Ni s punim tjednim limitom to nije bila jeftina noć, a sa 7 % nije imalo šanse.

## Što je ostalo nedovršeno

- **pay.domovina.ai:** dokument (33 KB) postoji samo u privremenom worktreeu
  `/private/tmp/claude-501/-Users-ms-git/8d40f90b-ad45-4198-9101-d5b7a1f28f58/scratchpad/audit-pay.domovina.ai/docs/security/2026-10-16-security-audit-fable.md`.
  Nije commitan. Na restart Maca `/private/tmp` se briše.
- **energy.domovina.ai i repo X:** pali na početku, bez dokumenta. Prazni worktreeji su ostali.
- **omm.domovina.ai** (`afd49d5`) i **pipeline.domovina.ai** (`cbce659`) su na mainu.
- Preostalih 6 repoa nije ni pokrenuto.

## Pravila (prenesena u `~/.claude/CLAUDE.md`)

1. **Prije svakog Fable subagenta, ili bilo kojeg posla preko ~20 $ API protuvrijednosti, pitati koliko je ostalo tjednog i 5-satnog limita** (`/usage`) i dati procjenu: broj agenata × očekivani pozivi × prosječni kontekst. Referentne brojke iz ovog incidenta: **audit srednjeg repoa na Fableu ≈ 6–14 $, 20–45 poziva, kontekst do 300–650k**.
2. **Fable samo tamo gdje treba Fable.** Široko čitanje i prvi prolaz radi Sonnet 5.5 (oko 3× jeftiniji) ili Opus 5.5 (oko 2× jeftiniji). Fable dobiva sažetak i sumnjive točke na provjeru, ne cijeli repo.
3. **Jedan Fable agent u isto vrijeme**, ne tri. Kad prvi završi, usporediti stvarni trošak s procjenom, pa tek onda pokrenuti sljedećeg.
4. **Eksplicitno postaviti `effort`** pri pokretanju subagenta (`medium` za audit i čitanje, `high` samo za uži zadatak), umjesto da se naslijedi `high` iz postavki.
5. **U promptu za čitački posao ograničiti kontekst:** grep i ciljani `sed -n` umjesto `cat -n` cijelih datoteka, nikad isto čitati dvaput, nalaze odmah zapisivati u datoteku umjesto da se drže u kontekstu, a pri oko 250k konteksta zapisati i završiti.
6. **Dokument commitati čim je napisan**, ne na kraju, da ga 429 ne ostavi u `/private/tmp`.

## Kako je izračunato

```bash
cd ~/.claude/projects/-Users-ms-git/8d40f90b-ad45-4198-9101-d5b7a1f28f58/subagents
python3 - <<'EOF'
import json, glob
P = {'fable': (10, 12.5, 0.25, 50), 'opus': (4, 5, 0.2, 20), 'sonnet': (2, 2.5, 0.2, 10)}
for f in sorted(glob.glob('agent-*.jsonl')):
    seen = {}
    for l in open(f):
        d = json.loads(l)
        if d.get('type') == 'assistant' and d['message'].get('model') != '<synthetic>':
            seen[d['message']['id']] = d['message']['usage']   # dedup po message.id
    s = [sum(u.get(k, 0) for u in seen.values()) for k in
         ['input_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens', 'output_tokens']]
    print(f, len(seen), s, {m: round(sum(a * b for a, b in zip(s, p)) / 1e6, 2) for m, p in P.items()})
EOF
```

Podaci o limitu nalaze se u istom transkriptu (`quotaLimits.rateLimitType = "seven_day"`, `resetsAt = 1792195200` = 2026-10-17 02:00 CEST).
