#!/usr/bin/env bash
# Transkripcija glasovnih poruka (WhatsApp .ogg/.opus, bilo koji audio) kroz
# `agy -p` (Antigravity CLI), model Gemini 4 Hydrogen Low, Google AI Pro pretplata, $0.
#
#   agy_glasovna.sh [--govornik "Ana"] <audio> [<audio> ...]
#
# Ispis: transkript svake poruke na stdout; kopija u $AGY_GLASOVNE_DIR/<stem>.txt.
# Više datoteka ide paralelno (najviše $AGY_GLASOVNE_JOBS, default 3).
#
# Mjereno 19.11.2026. (agy 1.5.12): 57 s zvuka → 10 s, 4:11 → 16 s. Stara tmux
# verzija (Gemini 3.8 Flash High, agent s alatima) trebala je 1:46 i >4:30, jer
# je razmišljala minutama i rezala snimku pythonom na komade. Ta je verzija u
# agy_glasovna_tmux.sh.bak.
#
# Zamke:
# - `-p` mora biti ZADNJI flag (agy inače uzme sljedeći flag kao prompt).
# - `@datoteka` u promptu priloži samo male datoteke (~0,5 MB); veće agy ne
#   vidi. Zato prompt traži JEDAN read_file poziv nad cijelom datotekom.
# - gemini-3.8-flash-low je na istom zadatku visio 2 min (timeout) — ne koristiti.
# - Iz Claude Code Basha: agy piše u ~/.gemini i u $AGY_GLASOVNE_DIR, pa oba
#   moraju biti u sandbox.filesystem.allowWrite (ili sandbox isključen).
# - Radni direktorij mora biti „trusted" u agy-ju; ~/git/.agy-glasovne jest.
set -uo pipefail

MODEL="${AGY_GLASOVNE_MODEL:-gemini-4-hydrogen-low}"
W="${AGY_GLASOVNE_DIR:-$HOME/git/.agy-glasovne}"
JOBS="${AGY_GLASOVNE_JOBS:-3}"
mkdir -p "$W"

GOVORNIK=""
if [[ "${1:-}" == "--govornik" ]]; then GOVORNIK="$2"; shift 2; fi
[[ $# -ge 1 ]] || { sed -n 2,8p "$0"; exit 2; }

log() { echo "[$(date +%H:%M:%S)] $*" >&2; }

jedna() {
    local audio="$1" stem clip izlaz trajanje tko t0 i
    stem="$(basename "${audio%.*}")"
    clip="$W/$stem.mp3"; izlaz="$W/$stem.txt"
    ffmpeg -loglevel error -y -i "$audio" -ac 1 -c:a libmp3lame -b:a 32k "$clip" || { log "ffmpeg: $audio"; return 1; }
    trajanje="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$clip" | cut -d. -f1)"
    tko="Govornik je nepoznat."; [[ -n "$GOVORNIK" ]] && tko="Govori $GOVORNIK."
    local prompt="Učitaj audio datoteku $stem.mp3 jednim pozivom alata read_file (cijelu, bez rezanja) i transkribiraj je. \
Nikakve druge alate ni skripte. To je WhatsApp glasovna poruka na hrvatskom. $tko \
Napravi doslovnu transkripciju: zadrži dijalektne riječi i izraze kako su izgovoreni (npr. kaj), ne prepričavaj i ne skraćuj, \
samo makni poštapalice ako ometaju čitanje. Ispravno napiši vlastita imena ako ih iz konteksta možeš prepoznati. \
Svaki novi misaoni odlomak u novi red, s vremenskom oznakom [mm:ss] na početku. Ako više ljudi govori, označi ih imenom ili G1/G2. \
Ništa nejasno ne izmišljaj: označi [nejasno]. Odgovori SAMO transkriptom, bez uvoda i komentara."
    t0=$SECONDS
    for i in 1 2; do
        ( cd "$W" && agy --model "$MODEL" --print-timeout "$(( trajanje + 120 ))s" \
            --dangerously-skip-permissions -p "$prompt" ) >"$izlaz.tmp" 2>"$izlaz.err"
        # Uspjeh = ima [mm:ss] oznaka i nema AGY_ERROR.
        if grep -q '^\[[0-9][0-9]:[0-9][0-9]\]' "$izlaz.tmp" && ! grep -q AGY_ERROR "$izlaz.tmp" "$izlaz.err"; then
            mv "$izlaz.tmp" "$izlaz"; rm -f "$izlaz.err"
            log "$stem: ${trajanje} s zvuka → gotovo za $((SECONDS - t0)) s"
            return 0
        fi
        log "$stem: pokušaj $i neuspješan: $(head -c 300 "$izlaz.tmp" "$izlaz.err" | tr '\n' ' ')"
    done
    return 1
}

pids=(); stemovi=()
for audio in "$@"; do
    [[ -f "$audio" ]] || { log "nema datoteke: $audio"; continue; }
    while (( $(jobs -rp | wc -l) >= JOBS )); do sleep 1; done
    jedna "$audio" & pids+=($!); stemovi+=("$(basename "${audio%.*}")")
done
rc=0
for k in "${!pids[@]}"; do
    wait "${pids[$k]}" || rc=1
    s="${stemovi[$k]}"
    echo "===== $s${GOVORNIK:+ ($GOVORNIK)}"
    if [[ -s "$W/$s.txt" ]]; then cat "$W/$s.txt"; else echo "⚠️  nema transkripta"; fi
    echo
done
exit $rc
