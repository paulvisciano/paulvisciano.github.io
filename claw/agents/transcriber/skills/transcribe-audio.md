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
# Using OpenClaw's whisper skill
whisper "$AUDIO_FILE" \
    --model medium \
    --language auto \
    --output_dir /tmp/transcriptions \
    --output_format txt

# Extract transcript
TRANSCRIPT=$(cat /tmp/transcriptions/$(basename $AUDIO_FILE .ogg).txt)
```

Or via Ollama (if whisper not available):
```bash
ollama run whisper:medium "$AUDIO_FILE"
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
