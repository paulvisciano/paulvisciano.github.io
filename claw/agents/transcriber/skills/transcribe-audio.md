# Skill: Transcribe Audio

**Purpose:** Convert audio files to text using Whisper CLI (local, no API key).

---

## Input

- `audioFile`: Path to .ogg file (from archive step)
- `languages`: ["en", "es", "bg"] — supported languages
- `outputFormat`: "text" or "json"

---

## Process

```bash
# Using whisper-cli (Homebrew's whisper-cpp - 10-50x faster than Python)
whisper-cli \
    -m ~/.openclaw/models/ggml-base.en.bin \
    -f "$AUDIO_FILE" \
    --output-txt \
    --no-timestamps

# Extract transcript
TRANSCRIPT=$(cat "$(dirname "$AUDIO_FILE")/$(basename "$AUDIO_FILE" .ogg).txt" | tr '\n' ' ')
```

**Alternative paths:**
```bash
# Direct path (Homebrew on Apple Silicon)
/opt/homebrew/bin/whisper-cli -m model.bin -f "$AUDIO_FILE" --output-txt

# Or if you built from source
~/whisper.cpp/main -m model.bin -f "$AUDIO_FILE" --output-txt
```

---

## Output

- `transcript`: Plain text of spoken words
- `confidence`: Whisper confidence score (optional)
- `language`: Detected language (en/es/bg)

---

## Error Handling

- If audio file missing → return error, skip transcription
- If whisper fails → log error, mark as "[Transcription failed]"
- If language unclear → auto-detect (Whisper handles this)

---

**Created:** Feb 27, 2026  
**Agent:** Transcriber  
**Next skill:** `update-transcript`
