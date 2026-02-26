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
# Using whisper.cpp (C version - 10-50x faster than Python)
whisper-cpp/main \
    -m ~/.openclaw/models/ggml-base.en.bin \
    -f "$AUDIO_FILE" \
    -l auto \
    --output-txt \
    --no-timestamps

# Extract transcript
TRANSCRIPT=$(cat "$(basename "$AUDIO_FILE" .ogg).txt")
```

**Alternative paths for whisper-cpp:**
```bash
# Homebrew installation
/opt/homebrew/bin/whisper-cpp -m model.bin -f "$AUDIO_FILE" --output-txt

# Or build from source
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
