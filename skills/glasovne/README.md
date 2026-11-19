# `/glasovne` — WhatsApp messages with voice notes, read by Claude Code

> **TL;DR** "What did X send me?" in one command. The script reads the local
> database of the WhatsApp desktop app on macOS (read-only), finds the chat by
> contact name, prints the messages in order and transcribes every voice note
> through `agy -p` (Antigravity CLI) with Gemini. Claude then summarises what the
> person wants. Seven voice notes, 258 s of audio: 28 s end to end. The transcription
> runs on a Google AI Pro subscription, so it costs no Claude quota.

*Glasovne* is Croatian for "voice notes".

- [`SKILL.md`](SKILL.md) — the skill, English. This is the one to install.
- [`SKILL.hr.md`](SKILL.hr.md) — the Croatian original as it runs on my machine.
- [`scripts/wa_glasovne.sh`](scripts/wa_glasovne.sh) — finds the chat, lists the
  messages since a date, copies the voice notes out and calls the transcriber.
- [`scripts/agy_glasovna.sh`](scripts/agy_glasovna.sh) — transcribes any audio
  files, up to 3 in parallel: ffmpeg to 32 kbit/s mono MP3, then one `agy -p` call
  per file with a verbatim-transcript prompt, `[mm:ss]` per paragraph, one retry.

## Why the desktop database and not a WhatsApp bridge

An MCP bridge was the first version. Two problems made it the fallback:

- **Old voice notes return 403.** The WhatsApp server serves media to a newly linked
  device only for about 30 days. The desktop app already has the files on disk.
- **Chats under a LID.** Newer chats are keyed by a LID instead of a phone number,
  so a lookup by number misses them. The desktop database has the address-book name
  for every chat, so the lookup is by name.

## Why `agy -p` with Gemini

Measured on 2026-11-19 (agy 1.5.12):

| Setup | 57 s of audio | 4:11 of audio |
|---|---|---|
| agy in tmux, Gemini 3.8 Flash High as an agent with tools | 1:46 | > 4:30 |
| `agy -p`, Gemini 4 Hydrogen Low, one `read_file` call | 9-10 s | 15-16 s |

The agent version spent minutes thinking and cut the audio into pieces with Python.
The prompt now forbids every tool except a single `read_file` of the whole file.
Gemini keeps dialect words as spoken (Kajkavian *kaj* stays *kaj*) and writes names
correctly when the context allows, which is also why the skill tells Claude to flag
names that were only inferred.

Traps written into the script header: `-p` must be the last flag (agy takes the next
flag as the prompt otherwise), `@file` in the prompt attaches only files up to
~0.5 MB, and `gemini-3.8-flash-low` hung on the same task.

## Requirements and limitations

- macOS with the native WhatsApp desktop app (the database lives in
  `~/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/`). The terminal
  may need macOS permission to read another app's data. A voice note the desktop app
  has not downloaded yet is reported as missing until the chat is opened there.
- `sqlite3`, `ffmpeg`/`ffprobe`, and the Antigravity CLI (`agy`) signed in. The
  working directory `~/git/.agy-glasovne` must be trusted in agy.
- **The audio goes to Google.** Transcription is done by Gemini through agy, under
  the terms of your Google subscription. Do not use it on conversations you are not
  entitled to send there.
- The transcription prompt is Croatian and assumes Croatian speech. For another
  language, change the prompt in `agy_glasovna.sh`.
- Copies of voice notes and transcripts stay in `~/git/.agy-glasovne/`; delete them
  when you no longer need them.

## Install

```bash
d=~/.claude/skills/glasovne
mkdir -p $d/scripts
base=https://raw.githubusercontent.com/stepanic/cv/main/skills/glasovne
curl -sSL $base/SKILL.md -o $d/SKILL.md
for f in wa_glasovne.sh agy_glasovna.sh; do
  curl -sSL $base/scripts/$f -o $d/scripts/$f && chmod +x $d/scripts/$f
done
```

Then ask "what did Ana send me" or `/glasovne Ana`.

MIT.
