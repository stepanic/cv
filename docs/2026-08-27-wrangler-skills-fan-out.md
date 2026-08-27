# Wrangler raspršuje Cloudflare skillove u 30 direktorija

Mjereno 27. kolovoza 2026., nakon što je `wrangler` ponudio i proveo update
Cloudflare skillova za 33 imenovana AI alata.

## Nalaz

`wrangler` pri updateu kopira Cloudflare skillove u `~/.<alat>/skills/` za svaki
alat s popisa, bez provjere je li alat uopće instaliran, i to punom kopijom umjesto
poveznicom.

| mjerenje | vrijednost |
|---|---|
| direktorija `~/.*/skills/` ukupno | 30 |
| kopija svakoga skilla | 28 (različiti inodei, identičan sadržaj) |
| zauzeto na disku | 73 MB |
| jedinstvenoga sadržaja | ~2,5 MB |
| direktorija čije je jedino dijete `skills/` | ~23 |

Direktoriji poput `~/.kode`, `~/.pochi`, `~/.adal`, `~/.mux`, `~/.neovate`,
`~/.qoder` i `~/.mcpjam` nastali su 30. ožujka 2026. ranijim wrangler runom i ne
sadrže ništa osim Cloudflareovih skillova. Ti alati nikad nisu bili instalirani.

Provjera drifta 27. kolovoza: svih 28 kopija `cloudflare/SKILL.md` i
`agents-sdk/SKILL.md` ima isti MD5, dakle update je toga dana pogodio sve mete.
Drift je ipak strukturno moguć, jer svaki budući update mora pogoditi 28 mjesta.

## Usporedba: Firecrawl radi isto, drukčije

U istim tim direktorijima Firecrawl svoje skillove postavlja kao **simboličke
poveznice** na `~/.agents/skills/firecrawl*`. Jedan izvor istine, 0 B po meti,
nemoguć drift. Isti problem, dva rješenja.

## Nema izlaza

`wrangler skills` ne postoji kao naredba (`Unknown argument: skills`, wrangler
4.96.0). Nema `list`, nema `uninstall`, nema `--only <alat>`. Upit se pojavljuje
unutar drugih naredbi i nudi samo pristanak ili odbijanje.

## Kvaliteta popisa od 33 imena

Popis nije kuriran. Uz stvarno raširene alate (Claude Code, Cursor, Cline,
Windsurf, Continue, Roo, Kilo Code, Augment, Gemini CLI, Antigravity, Goose,
OpenHands, Junie, Kiro, Droid) i vendorske odnosno regionalne (Qwen Code, Qoder,
Trae i Trae CN kao isti proizvod brojen dvaput, CodeBuddy, iFlow, Mistral Vibe,
Crush, Zencoder), na popisu su i stavke koje nisu coding agenti. MCPJam je
inspektor MCP servera, OpenClaw je osobni asistent. Trošak dodavanja imena je jedan
redak u mapi, pa se popis širi bez kriterija.

## Otvoreno

Čišćenje fantomskih direktorija nije napravljeno. Popis kandidata:

```bash
cd ~ && for d in .*/; do
  [ -d "$d/skills" ] && [ "$(ls -A "$d" | wc -l)" -eq 1 ] && echo "$d"
done
```

Uvjet `-eq 1` znači da direktorij nema ništa osim `skills/`, pa stvarno korišteni
alati (Cursor, Gemini, Windsurf, Trae, Antigravity, Claude Code) ostaju izvan
popisa. Brisanje je privremeno: bez opt-outa se sve vraća pri sljedećem updateu.

## Vezani dokumenti

- `docs/data-sources.md` — odakle dolaze vanjske brojke i kako se ponovno provjeravaju
