# Transcriber Agent

**Purpose:** Auto-log all WhatsApp messages — archive media, update transcripts, send formatted blocks back to chat.

**Status:** Building (Feb 27, 2026)

---

## What This Agent Does

1. **Watches** `~/.openclaw/media/inbound/` for new audio/images
2. **Archives** media to dated folders (`/memory/raw/YYYY-MM-DD/{audio,images}/`)
3. **Transcribes** audio notes (Whisper CLI or Ollama)
4. **Updates** transcript.md (append-only, never overwrite)
5. **Prepares** formatted block for inclusion in natural response (Step C)

---

## Skills

| Skill | File | Description |
|-------|------|-------------|
| `archive-media` | `skills/archive-media.md` | Copy inbound → dated archive folders |
| `transcribe-audio` | `skills/transcribe-audio.md` | Whisper CLI transcription |
| `update-transcript` | `skills/update-transcript.md` | Append to transcript.md |
| `prepare-response-block` | `skills/send-to-whatsapp.md` | Prepare formatted block for natural response |

---

## Configuration

```json
{
  "inboundFolder": "~/.openclaw/media/inbound/",
  "archiveBase": "~/Personal/paulvisciano.github.io/memory/raw/",
  "transcriptPath": "integrated/transcript.md",
  "timezone": "Asia/Bangkok",
  "languages": ["en", "es", "bg"],
  "whatsappChannel": "whatsapp",
  "whatsappTarget": "${WHATSAPP_TARGET}"
}
```

---

## Workflow

```
New message arrives
  ↓
Skill: archive-media
  - Copy audio to /YYYY-MM-DD/audio/YYYY-MM-DD-HHMMSS.ogg
  - Copy images to /YYYY-MM-DD/images/YYYY-MM-DD-HHMMSS.jpg
  ↓
Skill: transcribe-audio (if audio)
  - Run whisper CLI
  - Extract transcript text
  ↓
Skill: update-transcript
  - Format: **Paul [HH:MM GMT+7]:** (audio) "transcript"
  - Append to transcript.md
  ↓
Skill: prepare-response-block (Step C)
  - Output formatted block for main agent
  - Main agent includes in natural response
  - Chat becomes the visible transcript
```

---

## Trigger

Runs on every new inbound message. Can be:
- **Event-driven:** Watch folder with `fswatch` or `chokidar`
- **Polling:** Check every 5 seconds for new files
- **OpenClaw hook:** Triggered by gateway on message receive

---

## Files

- `AGENT.md` — This file (agent spec)
- `config.json` — Configuration values
- `skills/*.md` — Skill definitions
- `transcriber.js` or `transcriber.sh` — Main execution script

---

## Testing

1. Send audio note via WhatsApp
2. Agent should archive + transcribe + update + send
3. Verify transcript.md has new entry
4. Verify WhatsApp received formatted block

---

**Created:** Feb 27, 2026  
**Creator:** Paul + Jarvis  
**Purpose:** Fix auto-logging Step C (the missing piece since genesis)
