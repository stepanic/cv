---
name: glasovne
description: Read someone's recent WhatsApp messages including voice notes. One command reads the local WhatsApp desktop database, finds the chat by contact name, lists the messages and transcribes the voice notes through agy (Antigravity CLI, Gemini), then summarise. Run it when the user says any variant of "read/listen to the new messages from X", "what did X send me", "transcribe X's voice notes", or /glasovne <name or number> [since date].
---

# glasovne — WhatsApp messages with voice-note transcripts

Argument: a contact name (or part of it), a phone number or a JID; optionally a start
date. Without a date the script takes the last 7 days. If the user asks for "new"
messages and last replied to this person earlier than that, pass the date of that
reply.

## 1. One command (first choice)

```bash
~/.claude/skills/glasovne/scripts/wa_glasovne.sh "<name or JID>" [YYYY-MM-DD] [--i-moje]
```

Run it in the foreground with `timeout: 600000`. It reads the local WhatsApp desktop
database (`ChatStorage.sqlite`, read-only), and:
- finds the chat by address-book name, including chats stored under a LID that a
  bridge cannot find by phone number,
- has voice notes older than ~30 days, for which the WhatsApp server returns 403 to
  a bridge,
- prints every message in order, then the transcripts.

Measured 2026-11-19: one chat since 1 October, 7 voice notes (258 s of audio) →
**28 s in total**. If it reports several matching chats, repeat with the JID. If it
reports a voice note "not available locally", the user has to open that chat in
WhatsApp desktop (or use step 2). `--i-moje` also transcribes the user's own voice
notes (when the replies make no sense without them).

Inside the Claude Code sandbox, agy must be allowed to write to `~/.gemini` and to
`~/git/.agy-glasovne` (`sandbox.filesystem.allowWrite`), otherwise it fails with
"operation not permitted".

## 2. Fallback: a WhatsApp MCP bridge

Only when the desktop database does not have the message. `list_messages(chat_jid=…,
after=…, include_context=false)`, `download_media` for the voice notes (works only
for ones younger than ~30 days), then
`~/.claude/skills/glasovne/scripts/agy_glasovna.sh --govornik "<Name>" <files…>`.
Bridges often keep chats under `<number>@lid`; the JID from step 1 works there too.
If agy fails twice on the same file, paste the file into gemini.google.com in a
browser.

## 3. Answer to the user

- In order: date/time, text messages verbatim (if short), voice notes as a **bullet
  summary** of what the person asks or reports; a verbatim transcript only when it is
  short or the user asks for it (files: `~/git/.agy-glasovne/<stem>.txt`).
- At the end: what is being asked of the user (decisions, deadlines, replies).
- Flag names that Gemini "recognised" from context if they are not verified.
- Never reply to the person on WhatsApp unless the user explicitly asks; if they do,
  show the draft before sending.
