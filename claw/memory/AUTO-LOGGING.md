# Auto-Logging System — Simple Workflow

**Goal:** Every message, every voice note, every image gets timestamped and archived. The WhatsApp chat IS the transcript.

---

## On Every Fresh Session Start

Run these steps in order:

1. **Create today's folders (only if they don't exist):**
   ```bash
   mkdir -p /Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/YYYY-MM-DD/{audio,images,integrated}
   ```
   Replace `YYYY-MM-DD` with today's date (e.g., `2026-02-24`). The `-p` flag prevents errors if folders already exist.

2. **Check if transcript.md exists:**
   ```bash
   ls /Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/YYYY-MM-DD/integrated/transcript.md
   ```
   - If it exists → APPEND to it only (never create a new one)
   - If it doesn't exist → Create it with one line:
   ```markdown
   # WhatsApp transcript — Feb 24, 2026
   ```

Done. Now every incoming message follows the same pattern.

---

## For Every Incoming Message

**Step 1: Archive media**

```bash
# Find newest audio file in inbound
ls -t /Users/paulvisciano/.openclaw/media/inbound/*.ogg 2>/dev/null | head -1 | xargs -I {} sh -c 'stat -f "%Sm" -t "%H%M%S" "{}" && basename "{}"'
```

Get the timestamp (HHMMSS) and filename. Copy it:
```bash
cp /Users/paulvisciano/.openclaw/media/inbound/[UUID].ogg /Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/YYYY-MM-DD/audio/YYYY-MM-DD-HHMMSS.ogg
```

Do the same for images (*.jpg, *.png).

**Step 2: Update transcript**

Append to the transcript.md file (never overwrite):
```markdown
**Paul [HH:MM GMT+7]:** "message text from Paul"

**Audio archived: 2026-02-24-HHMMSS.ogg**

**Jarvis [HH:MM GMT+7]:** My response
```

**Step 3: Send to WhatsApp**

Copy that same block and send it back to Paul in WhatsApp. The chat becomes the visible transcript.

---

## File Locations

- **Archive folder:** `/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/YYYY-MM-DD/`
  - Audio: `audio/`
  - Images: `images/`
  - Transcript: `integrated/transcript.md`

- **Inbound cache:** `/Users/paulvisciano/.openclaw/media/inbound/` (where OpenClaw stores incoming media)

---

## One Rule

**APPEND, never overwrite.** If transcript.md exists, open it in append mode. If it doesn't, create it. Never replace the file.

---

## That's It

Repeat: archive media → update transcript → send to WhatsApp. On every message. Every session.
