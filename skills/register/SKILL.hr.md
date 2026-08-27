---
name: register
description: Odabir registra za sve što se piše za ljudsku publiku — blog postovi, dokumentacija, README, nacrti za LinkedIn, izvještaji. Inženjerski registar je zadani: zaključak prvi, bez dramaturškog luka, bez obrata. Teatralni se koristi samo kad ga korisnik izrijekom zatraži. Učitaj kad korisnik kaže bilo koju varijantu "piši teatralno / dramatično / filmski / sa zapletom", "piši normalno / inženjerski / bez drame / suho / činjenično", "napiši obje verzije", ili /register.
---

# Registar — kako se tekst gradi

Uređuje **strukturu i retoriku**, ne činjenice. Nijedan registar ne smije promijeniti
brojku, ublažiti ogradu ni izostaviti izvor. Oba moraju ostati provjerljiva svakome
tko ima iste podatke.

Dva registra. **Inženjerski je zadani i vrijedi dok korisnik u toj sesiji ne zatraži
drugi.** Teatralni se nikad ne bira na vlastitu inicijativu, ni za važan tekst, ni za
objavu, ni zato što gradivo djeluje kao da ga zaslužuje.

---

## Inženjerski registar — zadani

**Redoslijed.** Najvažniji nalaz ide u prvi odlomak. Ništa se ne zadržava da bi
kasnija rečenica jače sjela. Ako rezultat pobija polazišnu tvrdnju, to se kaže prije
izlaganja dokaza, pa se onda izlažu dokazi.

**Naslovi imenuju sadržaj, a ne mjesto u priči.** `Treća provjera: kad se promijenio
mjerni instrument`, a nikako `Pukotina koja je sve srušila`. Tko pročita samo naslove
mora doći do stvarnih nalaza.

**Rečenice su izjavne.** Bez retoričkih pitanja. Bez jednorečeničnih odlomaka koji
služe kao udarac u bubanj. Bez krnjih rečenica radi naglaska.

**Svaka brojka nosi jedinicu, datum i način na koji se ponovno dobiva.** Podatak koji
se ne može izvesti iz navedenoga ne ulazi u tekst.

**Nesigurnost se izriče, ne nagovještava.** Odjeljak `Ograničenja` obavezan je u
svemu što donosi mjerenja, i u njemu stoji što podaci ne mogu pokazati, a ne samo
ono što pokazuju slabo.

**Zabranjeni uvodi i veznici**, jer svaki od njih postoji da proizvede napetost:

> Ispostavilo se … / Evo u čemu je stvar … / I tada sam shvatio … / Zanimljivo je
> to da … / Ali postojao je problem … / Umjesto toga našao sam …

**Tablice i blokovi koda nose podatke i naredbe.** Tablica se ne prepričava u tekstu
pokraj tablice.

**Kraj su ograničenja, otvorena pitanja ili sljedeći koraci.** Nikad pouka, nikad
rečenica složena da odjekne.

## Teatralni registar — samo na zahtjev

Kad se zatraži, dopušteni su dramaturški luk, odgođeni obrat, jednorečenični odlomci,
metafora i završna rečenica složena da sjedne.

I dalje obavezuje, bez iznimke:

- Nema izmišljenih činjenica, prilagođenih brojki ni ispuštene ograde. Napetost
  nastaje iz **redoslijeda** kojim se iznose istinite stvari, nikad iz onoga što je
  prešućeno.
- Odjeljak `Ograničenja` ostaje u cijelosti, i onda kad kvari završetak.
- Ako luk traži činjenicu koju podaci ne podupiru, luk je pogrešan.

## Obje verzije

Kad korisnik traži obje, piši ih kao jedan skup činjenica u dvije izvedbe. Ista
mjerenja, iste tablice, ista ograničenja, drukčiji sklop. Odbačenu verziju stavi u
`docs/GGGG-MM-DD-tema.md` uz mjerenja, a odabranu ondje gdje se objavljuje, da
usporedba preživi sesiju.

## Dvojezični tekstovi

Kad tekst izlazi na engleskom i hrvatskom, **piši svaki izvorno**. Ne prevodi prvi u
drugi. Hrvatska se inačica s engleskom poklapa u brojkama, tvrdnjama i redoslijedu
odjeljaka, a slobodno se razlikuje u građi rečenice. Hrvatski: ijekavica, puni
dijakritici, decimalni zarez, datumi u obliku `6. svibnja 2026.` Posegni za hrvatskim
nazivom gdje je u običnoj razvojnoj uporabi, a zadrži engleski ondje gdje bi
prevođenje zamaglilo značenje.

Gotovo doslovan prijevod prepoznaje se jednako kao i dramaturški luk i pada na istom
ispitu: čita se kao generiran, a ne kao napisan.

## Odnos prema CLAUDE.md

`CLAUDE.md` uređuje **glas** u svemu što ide kao korisnikove vlastite riječi, dakle u
e-porukama, zamolbama, porukama i odgovorima na prijave: bez dugih crtica, bez
podebljanja, kurziva i poveznica u ulozi formatiranja, čist tekst u kojem su prazni
redci jedina struktura. To pravilo stoji samo za sebe i ovaj ga skill ne popušta.

Ovaj skill uređuje **strukturu** u objavljenom tekstu, dakle u blog postovima,
dokumentaciji, README-ima i izvještajima, gdje je formatiranje strukturno, a crtice
uobičajene. Gdje se to dvoje preklapa, jači je `CLAUDE.md`.

## Kako zadani registar ostaje zadan

Skill se učitava tek kad se okine, pa zadana postavka ne može živjeti samo ovdje.
Redak koji je provodi ide u `CLAUDE.md`, koji se učitava u svakoj sesiji:

> **Registar teksta.** Sve što se piše za ljudsku publiku ide u inženjerskom
> registru: zaključak prvi, naslovi koji imenuju sadržaj, bez dramaturškog luka, bez
> prešućenih činjenica, ograničenja izrečena izravno. Teatralni registar samo na
> izričit zahtjev u toj sesiji. Vidi `skills/register/SKILL.md`.

## Razrađen primjer

`docs/2026-08-27-colossus-hipoteza-dvije-verzije.md` u ovom repozitoriju drži isti
članak u oba registra i na oba jezika, uz mjerenja i naredbe za njihovo ponavljanje.
Objavljena je inženjerska verzija.
