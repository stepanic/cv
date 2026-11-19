---
name: glasovne
description: Pročitaj nove WhatsApp poruke neke osobe zajedno s glasovnima — jednom naredbom iz lokalne baze WhatsApp desktopa nađe chat po imenu, izvuče poruke i transkribira glasovne kroz agy (Gemini 4 Hydrogen Low), pa daj sažetak. Pokreni kad korisnik kaže bilo koju varijantu „pročitaj/poslušaj nove poruke od X”, „što mi je X poslao”, „transkribiraj glasovne od X”, ili /glasovne <ime ili broj> [od datuma].
---

# Glasovne — WhatsApp poruke s transkripcijom

Argument: ime (ili dio imena iz imenika), broj ili JID; opcionalno od kad.
Bez datuma skripta uzima zadnjih 7 dana. Ako je korisnik osobi zadnji put
odgovorio ranije, a pita za „nove” poruke, daj datum svog zadnjeg odgovora.

## 1. Jedna naredba (prvi izbor)

```bash
~/.claude/skills/glasovne/scripts/wa_glasovne.sh "<ime ili JID>" [YYYY-MM-DD] [--i-moje]
```

U prvom planu, `timeout: 600000`. Čita lokalnu bazu WhatsApp desktopa
(`ChatStorage.sqlite`, samo za čitanje), pa:
- nađe chat po imenu iz imenika — i one pod LID-om koje bridge ne vidi po broju,
- ima glasovne starije od ~30 dana, za koje WhatsApp server bridgeu vraća 403,
- ispiše kronološki sve poruke pa transkripte.

Mjereno 19.11.2026.: jedan chat od 1.10., 7 glasovnih (258 s zvuka) → **28 s
ukupno**. Kad prijavi više chatova, ponovi s JID-om. Kad prijavi „nema je lokalno”,
korisnik treba otvoriti chat u WhatsApp desktopu (ili ide korak 2).
`--i-moje` transkribira i korisnikove glasovne (kad bez njih odgovori nemaju smisla).

U Claude Code sandboxu agy mora smjeti pisati u `~/.gemini` i u
`~/git/.agy-glasovne` (`sandbox.filesystem.allowWrite`); inače pada s
„operation not permitted”.

## 2. Rezerva: bridge (MCP)

Samo ako desktop baza nema poruku. `list_messages(chat_jid=…, after=…, include_context=false)`,
`download_media` za glasovne (radi samo za mlađe od ~30 dana), pa
`~/.claude/skills/glasovne/scripts/agy_glasovna.sh --govornik "<Ime>" <datoteke…>`.
Bridge chatove često vodi pod `<broj>@lid`; JID iz koraka 1 vrijedi i ovdje.
Ako agy dvaput padne za istu datoteku: gemini.google.com u pregledniku, datoteku
zalijepiti u chat.

## 3. Odgovor korisniku

- Kronološki: datum/vrijeme, tekstualne poruke doslovno (kratke), glasovne kao
  **sažetak u natuknicama** što osoba traži/javlja; doslovan transkript samo
  ako je kratak ili ga korisnik traži (datoteke: `~/git/.agy-glasovne/<stem>.txt`).
- Na kraju: što se od korisnika traži (odluke, rokovi, odgovori).
- Imena koja je Gemini „prepoznao” označi ako nisu provjerena.
- Ne odgovaraj osobi na WhatsAppu bez izričitog korisnikovog zahtjeva; ako ga
  ima, pokaži nacrt prije slanja.
