# Skill: Archive Media

**Purpose:** Copy new media from inbound folder to dated archive folders.

---

## Input

- `inboundFolder`: `~/.openclaw/media/inbound/`
- `archiveBase`: `~/Personal/paulvisciano.github.io/memory/raw/YYYY-MM-DD/`
- New file(s) in inbound (audio *.ogg, images *.jpg/*.png)

---

## Process

```bash
# 1. Get today's date
TODAY=$(date +%Y-%m-%d)

# 2. Create archive folders if they don't exist
mkdir -p ~/Personal/paulvisciano.github.io/memory/raw/$TODAY/{audio,images,integrated}

# 3. Find newest audio file
LATEST_AUDIO=$(ls -t ~/.openclaw/media/inbound/*.ogg 2>/dev/null | head -1)

if [ -n "$LATEST_AUDIO" ]; then
    # Extract timestamp from file metadata
    TIMESTAMP=$(stat -f "%Sm" -t "%H%M%S" "$LATEST_AUDIO")
    FILENAME=$(basename "$LATEST_AUDIO")
    
    # Copy to archive
    cp "$LATEST_AUDIO" ~/Personal/paulvisciano.github.io/memory/raw/$TODAY/audio/$TODAY-$TIMESTAMP.ogg
fi

# 4. Same for images
for IMG in ~/.openclaw/media/inbound/*.jpg ~/.openclaw/media/inbound/*.png; do
    if [ -f "$IMG" ]; then
        TIMESTAMP=$(stat -f "%Sm" -t "%H%M%S" "$IMG")
        FILENAME=$(basename "$IMG")
        cp "$IMG" ~/Personal/paulvisciano.github.io/memory/raw/$TODAY/images/$TODAY-$TIMESTAMP-${FILENAME%.*}.jpg
    fi
done
```

---

## Output

- Media files copied to `/memory/raw/YYYY-MM-DD/audio/` and `/memory/raw/YYYY-MM-DD/images/`
- Returns: List of archived files with timestamps

---

## Error Handling

- If inbound folder is empty → skip, no error
- If archive folders don't exist → create them
- If copy fails → log error, continue with next file

---

**Created:** Feb 27, 2026  
**Agent:** Transcriber  
**Next skill:** `transcribe-audio`
