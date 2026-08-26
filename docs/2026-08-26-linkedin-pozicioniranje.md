# LinkedIn pozicioniranje — AI/LLM konzalting s nišom u obradi zvuka

Nacrti napisani 2026-08-26. Cilj profila: da se ljudi **jave sami** i traže
edukaciju o uvođenju AI-ja u svoje poslovne procese. Fokus niše je obrada zvuka,
jer je to ono na čemu se trenutno stvarno radi (ASR, dijarizacija, RAG nad
korpusom transkripata).

## Odakle je krenulo

Kao referenca poslužio je tuđi profil s headlineom:

> Lead AI Engineer, Agentic AI, Multi-agent systems, LLM, MCP⚡️ Senior
> Full-Stack Engineer 🔥 Shipping automations, SaaS, Distributed Systems &
> AI Agents + Web3 Architect

Ono što tamo **radi** nije emoji nego gustoća ključnih riječi: LinkedIn pretraga
jako teži headline, pa ljudi koji traže "AI consultant", "LLM", "MCP" upadaju
preko njega. Emoji i nabacani buzzwordi su tell da je tekst generiran. Nacrti
ispod zadržavaju gustoću, izbacuju emoji i dodaju jedan broj kao dokaz, jer broj
radi ono što emoji pokušava: zaustavi oko.

## Headline (LinkedIn limit 220 znakova)

**A. konzultant + niša (preporuka, 186 zn.)**

```
AI & LLM Consultant · Speech and Audio AI: ASR, diarization, RAG, MCP · I help teams put AI into the processes they already run · 20 years engineering, 200+ projects · Founder, ITalk
```

**B. dokaz brojem (187 zn.)**

```
I teach teams to put AI into the work they already do · LLM pipelines and audio AI: Whisper, diarization, RAG, MCP · 2,870 h of audio processed · 20 years engineering · Founder, ITalk
```

**C. inženjer prvo, edukacija eksplicitno (185 zn.)**

```
AI Engineer & LLM Consultant · Audio and speech AI: ASR, speaker diarization, RAG over 2,870 hours of audio · MCP servers · AI adoption workshops for teams · 20 years, 200+ projects
```

**HR varijanta (177 zn.)**

```
Konzultant za AI i LLM · Obrada zvuka i govora: ASR, dijarizacija, RAG, MCP · Uvodim AI u procese koje već imate · 20 godina inženjerstva, 200+ projekata · Osnivač ITalka
```

Preporuka je A. B je jači za hladno čitanje, ali sati zvuka u headlineu troše
prostor koji bolje radi kao ključna riječ, a broj svejedno stoji u Aboutu.

> **Brojka u nacrtima je zastarjela.** Napisani su s "2,870 h", a isti dan je
> korpus mjeren na **~2.990 sati** (3.157 epizoda, 48 kanala, 144.294 chunka).
> Prije objave provjeri aktualno stanje po `docs/data-sources.md` — brojka u
> headlineu ne osvježava se sama.

## About

```
I help teams put LLMs into the work they already do.

Most companies I talk to do not need a new AI product. They need someone to
look at the process they run every day, find the two or three steps where a
model actually earns its place, and build those. I do that as a hands-on
engineer, not as a slide deck.

My current focus is audio, because that is where most of a company's knowledge
is still stuck: calls, meetings, interviews, support recordings, shows. Over
the past year I built the full pipeline for it and ran it at scale. ASR with
Whisper.cpp on Apple Silicon and NVIDIA Canary on GPUs, speaker diarization
with pyannote, summarization through Vertex AI, then chunking and embedding
into a vector store. It has turned roughly 2,990 hours of audio, 3,157
episodes across 48 channels, into 144,294 searchable chunks in ClickHouse that
answer in 10 to 50 ms. The search is exposed as a public MCP server, so Claude,
ChatGPT, and Cursor query it as a native tool.

What that gives a client:

Audio to text to structure, with speaker labels and timestamps that hold up.
Retrieval that returns the right passage instead of a plausible one.
Cost and latency work: the right model per step, caching, and local GPUs where
they beat the cloud.
An MCP server, so your own data becomes a tool inside the assistant your team
already uses.
Agentic development, so a small team ships like a much larger one.

I also run workshops for teams that want to start but do not know where. Half a
day mapping where AI fits in your process, then a working prototype on your own
data instead of a demo on someone else's.

Background: 20 years of professional engineering since 2006, 200+ delivered
projects, MSc in Computer Science from FER in Zagreb, Toptal Verified Expert,
founder of ITalk. Last year: 4,465 GitHub contributions across 110 public
repositories and 21 billion tokens through Claude Code, documented publicly
with sources.

If you are wondering whether AI fits anywhere in your business, write to me.
The first conversation is free, and I will tell you honestly if the answer is
no.

stepanic.domovina.ai
stepanic.matija@gmail.com
```

HR verzija:

```
Pomažem timovima da LLM-ove stave u posao koji ionako rade.

Većini firmi s kojima pričam ne treba novi AI proizvod. Treba im netko tko će
pogledati proces koji voze svaki dan, naći dva ili tri koraka gdje model
stvarno nosi svoju težinu, i to izgraditi. To radim kao inženjer, ne kao
prezentacija.

Trenutni fokus mi je zvuk, jer je ondje zaglavljeno najviše znanja jedne firme:
pozivi, sastanci, intervjui, snimke podrške, emisije. Zadnjih godinu dana
gradio sam cijeli pipeline za to i vozio ga u mjerilu. ASR kroz Whisper.cpp na
Apple Siliconu i NVIDIA Canary na GPU-ima, dijarizacija govornika s pyannoteom,
sažimanje kroz Vertex AI, pa chunkanje i embeddanje u vektorsku bazu. Kroz njega
je prošlo oko 2.990 sati zvuka, 3.157 epizoda u 48 kanala, pretvoreno u 144.294
pretraživa chunka u ClickHouseu s odzivom od 10 do 50 ms. Pretraga je izložena
kao javni MCP server, pa je Claude, ChatGPT i Cursor koriste kao nativni alat.

Što od toga dobiva klijent:

Zvuk u tekst pa u strukturu, s oznakama govornika i vremenskim kodovima koji
drže vodu.
Pretragu koja vraća točan odlomak, a ne uvjerljiv.
Rad na cijeni i latenciji: pravi model po koraku, keširanje, lokalni GPU ondje
gdje je jeftiniji od clouda.
MCP server, da vaši podaci postanu alat unutar asistenta koji tim ionako
koristi.
Agentni razvoj, da mali tim isporučuje kao znatno veći.

Držim i radionice za timove koji žele krenuti, ali ne znaju odakle. Pola dana
mapiranja gdje AI sjeda u vaš proces, pa prototip koji radi na vašim podacima
umjesto demo na tuđima.

Pozadina: 20 godina profesionalnog inženjerstva od 2006., 200+ isporučenih
projekata, magisterij računarstva na FER-u, Toptal Verified Expert, osnivač
ITalka. Zadnjih godinu dana: 4.465 GitHub contributiona kroz 110 javnih
repozitorija i 21 milijarda tokena kroz Claude Code, javno dokumentirano s
izvorima.

Ako se pitate sjeda li AI igdje u vaš posao, javite se. Prvi razgovor je
besplatan i pošteno ću reći ako je odgovor ne.
```

## Pravila kojih se tekst drži

- Piše se kao njegov glas: bez em-crtica, bez bolda, kurziva i inline linkova
  kao "korisnog" formatiranja. Vidi konvencije u `CLAUDE.md`.
- Američki engleski, Oxford zarez (Grammarly mu je tako postavljen).
- Nijedna klijentska firma se ne imenuje. Sve brojke u tekstu vuku na vlastiti
  rad iz `data/`.
- **GitHub brojka je ispravljena, ne sirova.** 4.465, ne 37.098 — razlika je
  automatska arhiva korpusa. Vidi `docs/data-sources.md`.

## Što nije napravljeno

- Tekst **nije objavljen** na LinkedIn; ovo je nacrt.
- Predloženo, ali neodrađeno: dodati "AI Consulting" i "Audio & Speech AI" kao
  Services na profilu (LinkedIn ih indeksira zasebno i pali gumb za upite), te
  staviti `stepanic.domovina.ai` i javni MCP endpoint u Featured.

## Vezani dokumenti

- `docs/data-sources.md` — odakle dolazi svaka brojka i kako je provjeriti
- `docs/committers-top-timestamps.md` — zašto GitHub brojka nije sirova
