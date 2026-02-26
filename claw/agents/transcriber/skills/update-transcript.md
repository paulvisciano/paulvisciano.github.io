# Skill: Update Transcript

**Purpose:** Append formatted message block to transcript.md (append-only).

---

## Input

- `transcriptPath`: `/memory/raw/YYYY-MM-DD/integrated/transcript.md`
- `speaker`: "Paul" or "Jarvis"
- `timestamp`: "HH:MM GMT+7"
- `mediaType`: "audio" | "image" | "text"
- `mediaRef`: "2026-02-27-HHMMSS.ogg" (archived filename)
- `content`: Transcript text or message text

---

## Process

```bash
TRANSCRIPT_FILE=~/Personal/paulvisciano.github.io/memory/raw/$TODAY/integrated/transcript.md

# Check if file exists, create header if not
if [ ! -f "$TRANSCRIPT_FILE" ]; then
    echo "# WhatsApp transcript — $(date +%B\ %d,\ %Y)" > "$TRANSCRIPT_FILE"
    echo "" >> "$TRANSCRIPT_FILE"
fi

# Format the entry
if [ "$MEDIA_TYPE" = "audio" ]; then
    BLOCK="**$SPEAKER [$TIMESTAMP]:** (audio) \"$CONTENT\"

**Audio archived: $MEDIA_REF**
"
elif [ "$MEDIA_TYPE" = "image" ]; then
    BLOCK="**$SPEAKER [$TIMESTAMP]:** (image) [Image attached]

**Image archived: $MEDIA_REF**
"
else
    BLOCK="**$SPEAKER [$TIMESTAMP]:** $CONTENT
"
fi

# Append (NEVER overwrite)
echo "$BLOCK" >> "$TRANSCRIPT_FILE"
echo "---" >> "$TRANSCRIPT_FILE"
```

---

## Output

- Transcript file updated with new entry
- Returns: Success/failure status

---

## Critical Rule

**APPEND, NEVER OVERWRITE.**

If transcript.md exists → open in append mode.
If it doesn't exist → create with header, then append.

---

**Created:** Feb 27, 2026  
**Agent:** Transcriber  
**Next skill:** `send-to-whatsapp`
