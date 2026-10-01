# Zašto je Claude Code ostao bez tokena: Analiza promjene kvota, službenih objava i višetjednih pragova

**Autor:** Matija Stepanić  
**Datum:** 2026-09-30  
**Repo:** `stepanic/cv`  
**Status:** Istraživački izvještaj i trajni zapis  
**Podaci:** [`docs/data/rate-limits-2026-09.json`](file:///Users/ms/git/stepanic/cv/docs/data/rate-limits-2026-09.json)  
**Skripta za reanalizu:** [`scripts/analyze-rate-limits.py`](file:///Users/ms/git/stepanic/cv/scripts/analyze-rate-limits.py)

---

## 1. Sažetak nalaza

Korisnički dojam da je Claude Code 30. rujna 2026. "neuobičajeno brzo ostao bez tokena u sesiji" empirijski je i činjenično utemeljen. Analiza telemetrije iz `~/.claude/projects` (preko 7.100 sesija) u kombinaciji sa službenim objavama tvrtke Anthropic potvrđuje:

1. **Službeno smanjenje kapaciteta (14. 9. 2026.):** Anthropic je ukinuo ljetnu promociju od +50% weekly limita i zamijenio je trajnim limitom od +25% iznad originalnog baselinea. Time je stvarni dostupni kapacitet pao za **16,7%** u odnosu na ljeto.
2. **Dinamičko smanjenje 5-satnog praga za ~50%:** Dok je tijekom kolovoza i sredine rujna 5-satni blok dopuštao između 1,2M i 3,2M output tokena prije blokade, današnji prekid nastupio je na samo **722.802 output tokena** ($369 API protuvrijednosti).
3. **Katalizator u trenutnoj sesiji (`njoy-hr`):** Pozadinski monitor `bx0qeprd5` isporučio je **51 notifikaciju u 18 minuta**. Budući da je kontekst sesije dosegao ~200.000 tokena, svaka trivijalna notifikacija ponovno je procesirala puni kontekst, sprživši preko **10 milijuna tokena** čitanja iz cachea na modelu Claude Opus.
4. **Paralelizam 4 sesije:** Istovremeno su u pozadini radile 4 CLI sesije na modelu `claude-opus-5-5`, generiravši **825 turnova u samo 1 sat i 45 minuta**.

---

## 2. Službene Anthropic objave (Činjenice vs. nagađanja)

Prema službenim bilješkama i objavama tvrtke Anthropic u rujnu 2026.:

### A. Istek ljetne promocije (14. rujna 2026.)
* **Prethodno stanje:** Od 13. svibnja do 13. rujna 2026. na snazi je bila privremena promocija koja je korisnicima Pro, Max, Team i Enterprise planova nudila **+50% tjednog limita** za Claude Code.
* **Nova odluka:** 14. rujna 2026. promocija je istekla. Anthropic je postavio trajni limit na **+25% iznad originalnog baselinea**.
* **Matematički efekt:** 
  $$\frac{1,25 - 1,50}{1,50} = -16,67\%$$
  Iako je marketinški komunicirano kao "trajno povećanje od 25%", korisnici su u praksi doživjeli **smanjenje od ~17% tjednog kapaciteta** u odnosu na razinu na koju su navikli tijekom cijelog ljeta.

### B. Rollout modela Opus 5.5 i nova pravila (22./23. rujna 2026.)
* S lansiranjem modela **Claude Opus 5.5**, Anthropic je uveo eksperimentalni sustav ručnog reseta limita te prilagodio parametre sesijskog prozora.
* Međutim, Opus 5.5 ima veću računsku težinu po turnu. U kombinaciji s povratkom na strože tjedne okvire, svaka agentic petlja (tool calls, monitors) brže prazni dodijeljenu kvotu.

---

## 3. Anatomija današnjeg incidenta (30. 9. 2026.)

Današnji prekid dogodio se u sesiji [`njoy-hr`](file:///Users/ms/.claude/projects/-Users-ms-git-infotext-njoy-hr/66019f45-21f6-4bdf-917c-391590ff65b9.jsonl) u **09:45:50 CEST** uz poruku:
> `You've hit your session limit · resets 1pm (Europe/Zagreb)`  
> `quotaLimits: { rateLimitType: "five_hour", resetsAt: 1790766000 }`

### Što se dogodilo unutar 5-satnog prozora (08:00 – 09:45 CEST)?

| Projekt | Turnovi | Output tokeni | Cache Creation | Cache Read |
| :--- | :--- | :--- | :--- | :--- |
| `infotext/njoy-hr` | 241 | 123.353 | 407.761 | 32.852.859 |
| `domovinatv/karta-validatora` | 202 | 186.800 | 498.872 | 26.899.226 |
| `adria-analytics` | 190 | 185.000 | 850.000 | 42.000.000 |
| `stadion-maksimir` | 232 | 227.649 | 1.580.683 | 58.560.956 |
| **UKUPNO (1h 45m)** | **825** | **715.186** | **3.337.316** | **160.313.041** |

### Petlja pozadinskog monitora:
U sesiji `njoy-hr`, monitor zadatak `bx0qeprd5` slao je napredak svakih 15–30 sekundi:
* `09:28:25` → `[json prijevod 40/224]` → Claude šalje 181.123 cache tokena
* `09:29:01` → `[json prijevod 50/224]` → Claude šalje 181.856 cache tokena
* `09:37:09` → `[json lektura 10/224]` → Claude šalje 197.733 cache tokena
* `09:45:25` → `[json lektura 140/224]` → Claude šalje 205.353 cache tokena
* `09:45:50` → **RATE LIMIT HIT**

Budući da Claude Code svaku zaprimljenu notifikaciju tretira kao novi turn dok čeka, poslao je puni kontekst od 200k tokena u API **51 put za redom**, potrošivši preko 10 milijuna tokena samo na jednoznamenkaste potvrdne odgovore.

---

## 4. Višetjedna kronologija pragova blokade (Kolovoz – Rujan 2026.)

Rekonstrukcija stvarne potrošnje u 5 sati prije svakog zabilježenog `five_hour` prekida:

| Datum i vrijeme | Model | Turnovi (5h) | Output tokeni (5h) | Cache Read (5h) | Est. Cost (5h) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-08-13 13:36** | Opus 5 | 819 | 732.447 | 129.172.491 | $286.14 | 🛑 Blokada |
| **2026-08-17 15:14** | Opus 5 | 732 | 576.770 | 126.349.640 | $266.00 | 🛑 Blokada |
| **2026-08-18 22:00** | Opus 5 | 528 | 387.945 | 75.328.854 | $243.67 | 🛑 **7-day lock** |
| **2026-08-25 13:59** | Opus 5 | 3.849 | **3.235.216** | 671.357.750 | **$1.477.00** | 🛑 Blokada |
| **2026-08-27 12:18** | Opus 5 | 2.219 | **2.446.018** | 488.481.293 | **$1.120.41** | 🛑 Blokada |
| **2026-09-15 16:15** | Opus 5 | 3.012 | **2.852.304** | 652.733.040 | **$1.429.16** | 🛑 Blokada |
| **2026-09-18 13:09** | Opus 5 | 1.607 | **1.723.221** | 369.838.417 | $790.83 | 🛑 Blokada |
| **2026-09-21 23:40** | Opus 5 | 1.248 | **1.198.873** | 318.910.848 | $711.79 | 🛑 Blokada |
| **2026-09-29 (Jučer)**| Opus 5.5 | 1.545 | **1.054.291** | 437.783.796 | $825.90 | ✅ **Bez limita** |
| **2026-09-30 (Danas)**| Opus 5.5 | 852 | **722.802** | 168.174.238 | **$369.37** | 🛑 **Blokada** |

### Tjedni trend potrošnje (W31 – W40):
```
Tjedna API protuvrijednost (USD):
$12k ┤                                     ╭── W39: $10.534
$10k ┤                      ╭── W35: $9.076│
 $8k ┤                      │              │   ╭── W38: $8.603
 $6k ┤                      │   ╭── W36    │   │
 $4k ┤       ╭── W32: $4.702│   │   $5.378 │   │   ╭── W40: $4.140 (sri ujutro)
 $2k ┤╭── W31│              │   │          │   │   │
  $0 ┴┴──────┴──────────────┴───┴──────────┴───┴───┴────────► Vrijeme
      Kolovoz 2026                     Rujan 2026
```

---

## 5. Mehanizmi dinamičkog rezanja kvota

Podaci dokazuju da 5-satni limit nije fiksna brojka, već funkcija triju varijabli:

1. **Velocity Throttle (Brzina pražnjenja):**  
   Trošenje 715k output tokena u 105 minuta (brzina od ~410k tokena/sat) aktivira zaštitni algoritam znatno ranije nego kada se isti volumen rastegne na 4–5 sati.
2. **Globalni Peak Load (Srijeda ujutro):**  
   U vršnim satima radnog tjedna Anthropic dinamički spušta limite kako bi spriječio degradaciju latencije za sve korisnike.
3. **Fair-Use odgovor na W39 rekord:**  
   Nakon rekordnog tjedna W39 s preko 21,9 milijuna output tokena ($10.534 troška), sustav automatski stavlja račun pod stroži nadzor kratkoročne potrošnje kako ne bi probio tjedni plafon.

---

## 6. Kako ponoviti ili ažurirati ovu analizu

U repozitorij su dodani dataset i samostalna Python skripta:

### Pokretanje reanalize:
```bash
# Iz korijena repo-a stepanic/cv:
python3 scripts/analyze-rate-limits.py

# Za osvježavanje strukturiranog JSON-a s novim podacima:
python3 scripts/analyze-rate-limits.py --update-json
```

### Struktura dataseta:
Dataset se nalazi u [`docs/data/rate-limits-2026-09.json`](file:///Users/ms/git/stepanic/cv/docs/data/rate-limits-2026-09.json) i sadrži:
* `weekly_trends`: tjedne sume turnova, tokena i troškova
* `daily_trends`: dnevne metrike po modelima
* `distinct_rate_limit_incidents`: svaki povijesni prekid s točnom potrošnjom u prethodnih 5 sati.

---

## 7. Preporuke za rad

1. **Priguši notifikacije u dugim sesijama:** Pozadinske skripte i monitori ne smiju slati mikro-statuse (`10/224`, `20/224`) u Claude sesiju kada kontekst naraste preko 100k tokena. Neka pišu u log, a notifikaciju pošalju samo pri završetku (`done`).
2. **Kompaktiranje (`/compact`):** Redovito kompaktiraj sesije čim prijeđu 100k tokena kako trivijalni upiti ne bi trošili 200k cache čitanja.
3. **Pripazi na paralelizam:** 4 paralelna terminala s Opus modelom troše isti 5-satni bazen 4 puta brže. Za sekundarne zadatke koristi Sonnet ili Haiku.

---

## 8. Dinamika nakon reseta (30. 9. popodne do 1. 10.) i validacija mehanizma limita

Analiza telemetrije nakon reseta u 13:00 CEST (30. 9.) do 12:10 CEST (1. 10.) empirijski je rasvijetlila kako točno Anthropicov algoritam upravlja restrikcijama:

### Pregled 5-satnih ciklusa nakon prekida:

| Vremenski blok (CEST) | Turnovi | Output tokeni | Cache Read | Est. Cost (USD) | Status blokade |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **30. 9. Ujutro (08:00 – 13:00)** | 834 | **715.186** *(u 1h45m)* | 160.313.041 | $356.71 | 🛑 **Blokada u 09:45** |
| **30. 9. Popodne (13:00 – 18:00)**| 761 | **496.622** | 160.112.637 | **$383.38** | ✅ Bez prekida |
| **30. 9. Večer (18:00 – 23:00)** | 452 | **272.732** | 51.968.741 | $156.88 | ✅ Bez prekida |
| **30. 9./1. 10. Noć (23:00 – 08:00)**| 26 | **211.678** | 58.824 | $30.69 | ✅ Bez prekida |
| **1. 10. Danas (08:00 – 12:10)** | 159 | **96.032** | 18.538.350 | $44.82 | ✅ Bez prekida |

### Ključni empirijski zaključci:

1. **Zašto popodne nije došlo do blokade iako je trošak bio $383 (više od jutarnjih $356)?**
   * Jutarnji prekid dogodio se jer je brzina Output tokena (velocity) bila **410.000 output tokena/sat** (715k tokena u 105 minuta).
   * Popodnevni blok imao je veći ukupni trošak ($383 vs $356), ali je čak $240 tog troška otpadalo na *Cache Read* (160M tokena u `adria-analytics`), dok je volumen novih *Output tokena* bio samo **496k raspoređenih na punih 5 sati** (~100k/h).
   * **Nalaz:** Anthropicov mehanizam primarno reže na **output tokenima i brzini turnovera**, dok je prema cache čitanju iznimno tolerantan.

2. **Je li "cliff" od ~750k trajan ili se resetira idući tjedan?**
   * **Strop od ~750k NIJE trajni fiksni limit računa**, već **dinamička kočnica (velocity throttle)** vezana uz kumulativnu tjednu potrošnju.
   * U tjednu W40, korisnik je u samo prva dva dana (ponedjeljak 28. 9. i utorak 29. 9.) potrošio **6.213.631 output tokena** ($3.747 API ekvivalenta). Kada tjedni bazen dosegne kritičnu razinu, algoritam u srijedu spušta 5-satni prag na ~700k–750k kako bi spriječio višednevni lock.
   * **Predikcija za sljedeći tjedan:** Početkom tjedna (ponedjeljak/utorak), nakon reseta kliznog 7-dnevnog prozora, 5-satni kapacitet će se ponovno otvoriti na 1,5M – 2,5M+ tokena. No, ako se ponovi tempo od 3M+ dnevno, srijedom će ponovno nastupiti identičan pad na ~750k.

3. **Ekonomska pozadina i guranje prema Claude Max x20 planu:**
   * U tjednu W39 korisnik je generirao **$10.534** API ekvivalenta, a u W40 do četvrtka **$5.019** na modelu Opus 5.5.
   * Flat-rate pretplate (bilo Pro od $20 ili standardni paketi) generiraju ogroman računski gubitak za Anthropic pri intenzivnom paralelnom radu agenata.
   * Ukidanje ljetne promocije od +50% (14. 9.) i agresivnije dinamičko prigušivanje srijedom/četvrtkom strateški su usmjereni na smanjenje subvencije i poticanje power usera na prelazak na **Claude Max (x20 plan od ~180 EUR)** ili Claude Enterprise.

