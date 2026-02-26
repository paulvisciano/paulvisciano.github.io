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
| `update-transcript` | `skills/update-transcript.md` | Append to transcript.md (append-only) |
| `prepare-response-block` | `skills/prepare-response-block.md` | Output formatted block for main agent's natural response |

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

**Automatic via file watcher:**

```bash
# Start the watcher (runs in background)
./watcher.sh &

# Or run as launchd service (macOS)
# See: launcher.plist for systemd/launchd config
```

The watcher:
- Monitors inbound folder every 3 seconds
- Skips files that existed at startup
- Triggers agent on new files only
- Logs to `watcher.log`

**Alternative triggers:**
- **Cron job:** Run every 5 minutes
- **OpenClaw hook:** Triggered by gateway on message receive

---

## Files

- `AGENT.md` — This file (agent spec)
- `config.json` — Configuration values
- `skills/*.md` — Skill definitions
- `transcriber.sh` — Main execution script
- `watcher.sh` — File watcher (auto-triggers agent)
- `launcher.plist` — macOS launchd config (optional, for auto-start)
- `.env` — Environment variables (gitignored)
- `.env.example` — Template (safe to commit)

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
