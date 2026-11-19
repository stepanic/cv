#!/usr/bin/env bash
# WhatsApp poruke jedne osobe + transkripcija glasovnih, jednom naredbom.
#
#   wa_glasovne.sh "<ime ili dio imena ili JID>" [YYYY-MM-DD od] [--i-moje]
#
# Čita LOKALNU bazu WhatsApp desktop aplikacije (samo za čitanje), ne bridge:
# - chat se nađe po imenu iz imenika (radi i za chatove pod LID-om),
# - glasovne su već na disku, i one starije od ~30 dana za koje WhatsApp
#   server bridgeu vraća 403.
# Ispis: kronološki popis poruka (tekst doslovno, glasovne kao [GLASOVNA stem]),
# zatim transkripti iz agy_glasovna.sh. Bez datuma: zadnjih 7 dana.
# Bez --i-moje transkribiraju se samo njegove glasovne.
#
# Mjereno 19.11.2026.: 7 glasovnih (258 s zvuka) transkribirano za 35 s.
set -uo pipefail

WA="$HOME/Library/Group Containers/group.net.whatsapp.WhatsApp.shared"
DB="$WA/ChatStorage.sqlite"
OUT="${AGY_GLASOVNE_DIR:-$HOME/git/.agy-glasovne}/wa"
mkdir -p "$OUT"

[[ $# -ge 1 ]] || { sed -n 2,13p "$0"; exit 2; }
TKO="$1"; OD="${2:-$(date -v-7d +%F)}"; MOJE=0
[[ "${3:-}" == "--i-moje" || "${2:-}" == "--i-moje" ]] && MOJE=1
[[ "$OD" == "--i-moje" ]] && OD="$(date -v-7d +%F)"

# Separator je US (\x1f), ne tab: tab je za bash `read` razmak, pa se prazna
# polja (poruka bez priloga) stope i tekst poruke se izgubi.
US=$'\x1f'
q() { sqlite3 -readonly -separator "$US" "file:$DB?mode=ro" "$1"; }
esc() { printf "%s" "$1" | sed "s/'/''/g"; }

T="$(esc "$TKO")"
chats="$(q "select Z_PK, ZCONTACTJID, ZPARTNERNAME from ZWACHATSESSION
  where ZCONTACTJID = '$T' or ZPARTNERNAME like '%$T%' or ZCONTACTJID like '$T%'
  order by ZLASTMESSAGEDATE desc")"
n=$(grep -c . <<<"$chats")
if (( n == 0 )); then echo "Nema chata za: $TKO" >&2; exit 1; fi
if (( n > 1 )); then
    echo "Više chatova odgovara „$TKO” — ponovi s JID-om:" >&2
    tr "$US" '\t' <<<"$chats" | cut -f2,3 >&2; exit 1
fi
IFS="$US" read -r PK JID IME <<<"$chats"
echo "# $IME ($JID), od $OD"

# 2001-01-01 je Core Data epoha.
od_s=$(( $(date -j -f %F "$OD" +%s) - 978307200 ))
poruke="$(q "select datetime(m.ZMESSAGEDATE+978307200,'unixepoch','localtime'),
    m.ZISFROMME, coalesce(mi.ZMEDIALOCALPATH,''), coalesce(mi.ZMOVIEDURATION,0),
    replace(replace(coalesce(m.ZTEXT,''),char(10),' ⏎ '),char(31),' ')
  from ZWAMESSAGE m left join ZWAMEDIAITEM mi on mi.ZMESSAGE = m.Z_PK
  where m.ZCHATSESSION = $PK and m.ZMESSAGEDATE >= $od_s
  order by m.ZMESSAGEDATE")"

audio=()
while IFS="$US" read -r kad ja put traj tekst; do
    [[ -z "$kad" ]] && continue
    tko="${IME%% *}"; (( ja == 1 )) && tko="Ja"
    if [[ "$put" =~ \.(opus|ogg|m4a|mp3|aac)$ ]]; then
        stem="${JID%%@*}_$(tr -d ' :-' <<<"$kad" | cut -c1-12)"
        if [[ -f "$WA/Message/$put" ]] && { (( ja == 0 )) || (( MOJE == 1 )); }; then
            cp "$WA/Message/$put" "$OUT/$stem.${put##*.}"
            audio+=("$OUT/$stem.${put##*.}")
            echo "[$kad] $tko: [GLASOVNA $stem, ${traj} s]"
        elif [[ -f "$WA/Message/$put" ]]; then
            echo "[$kad] $tko: [glasovna, ${traj} s, nije transkribirana]"
        else
            echo "[$kad] $tko: [glasovna, ${traj} s — nema je lokalno; otvori chat u WhatsApp desktopu ili skini bridgeom]"
        fi
    elif [[ -n "$put" ]]; then
        echo "[$kad] $tko: [prilog ${put##*/}] $tekst"
    elif [[ -n "$tekst" ]]; then
        echo "[$kad] $tko: $tekst"
    fi
done <<<"$poruke"

if (( ${#audio[@]} )); then
    echo; echo "# Transkripti (${#audio[@]})"
    S=$SECONDS
    "$(dirname "$0")/agy_glasovna.sh" --govornik "$IME" "${audio[@]}"
    echo "# transkripcija: $((SECONDS - S)) s"
fi
