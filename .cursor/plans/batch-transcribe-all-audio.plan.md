---
name: Batch Transcribe All Audio Files with Whisper
overview: Use local Whisper to transcribe all 930 audio files (Feb 16-23) and organize by date
todos:
  - id: transcribe-all
    content: Run Whisper on memory/raw/[date]/audio/*.ogg for each date
    status: pending
  - id: organize
    content: Rename transcript files to sequential naming (transcript-001.txt, etc) per date
    status: pending
  - id: validate
    content: Verify all 930 audio files have corresponding transcripts
    status: pending
  - id: manifest
    content: Update TRANSCRIPT-ARCHIVE-MANIFEST.md with final counts
    status: pending
  - id: commit
    content: Commit all transcripts to git
    status: pending
isProject: false
---

# Batch Transcribe All Audio Files with Whisper

**Objective:** Use locally-installed Whisper to transcribe all 930 audio files (.ogg) from Feb 16-23, organize transcripts by date with sequential naming, and create manifest.

**Status:** Whisper is installed and verified working (`/usr/local/bin/whisper`)

**Approach:** Direct audio-to-text (better than WhatsApp parsing because it avoids regex issues)

---

## Test Results

**Test file:** `/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/2026-02-23/audio/00b3deed-f436-4b19-bf44-7467887723fd.ogg`

**Command:**
```bash
whisper /path/to/audio.ogg --output_format txt --output_dir /output/
```

**Output:**
```
So technically Jarvis, like you're Jarvis, you live under Claw, that's your memory.
What I just posted is my memory.
```

✅ Works perfectly. Creates `[uuid].txt` with clean transcript text.

---

## Implementation

### Step 1: Batch Transcribe All Audio Files

**Script:** Create `scripts/batch-transcribe-whisper.sh`

```bash
#!/bin/bash
# Batch transcribe all audio files using Whisper

BASE_PATH="/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw"
TOTAL_FILES=0
TRANSCRIBED=0
FAILED=0

echo "Starting batch transcription of all audio files..."
echo ""

# For each date directory
for DATE_DIR in "$BASE_PATH"/*/audio/; do
  DATE=$(basename $(dirname "$DATE_DIR"))
  TRANSCRIPT_DIR="$(dirname "$DATE_DIR")/transcripts"
  
  echo "Processing: $DATE"
  
  # Create transcripts directory if it doesn't exist
  mkdir -p "$TRANSCRIPT_DIR"
  
  # Count audio files
  AUDIO_COUNT=$(ls "$DATE_DIR"*.ogg 2>/dev/null | wc -l)
  TOTAL_FILES=$((TOTAL_FILES + AUDIO_COUNT))
  
  if [ $AUDIO_COUNT -eq 0 ]; then
    echo "  ✗ No audio files found"
    continue
  fi
  
  echo "  Found $AUDIO_COUNT audio files"
  
  # Transcribe all files in this date directory
  whisper "$DATE_DIR"*.ogg \
    --output_format txt \
    --output_dir "$TRANSCRIPT_DIR" \
    2>&1 | grep -E "Transcribed|error" || true
  
  # Count successful transcriptions
  TRANSCRIPT_COUNT=$(ls "$TRANSCRIPT_DIR"/*.txt 2>/dev/null | wc -l)
  TRANSCRIBED=$((TRANSCRIBED + TRANSCRIPT_COUNT))
  
  echo "  ✓ Transcribed $TRANSCRIPT_COUNT files"
  echo ""
done

echo "============================================"
echo "Batch Transcription Complete"
echo "Total audio files: $TOTAL_FILES"
echo "Successfully transcribed: $TRANSCRIBED"
echo "============================================"
```

**Run it:**
```bash
chmod +x scripts/batch-transcribe-whisper.sh
./scripts/batch-transcribe-whisper.sh
```

**Time estimate:** 15-30 minutes for 930 files (depends on CPU)

### Step 2: Rename Transcripts to Sequential Naming

**Why:** Whisper creates `[uuid].txt` files; we want `transcript-001.txt`, `transcript-002.txt` for consistency.

**Script:** Create `scripts/rename-transcripts-sequential.sh`

```bash
#!/bin/bash
# Rename Whisper output files to sequential naming per date

BASE_PATH="/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw"

for DATE_DIR in "$BASE_PATH"/*/transcripts/; do
  DATE=$(basename $(dirname "$DATE_DIR"))
  
  echo "Renaming transcripts for: $DATE"
  
  # Get all txt files, sort them, rename to sequential
  cd "$DATE_DIR"
  
  COUNTER=1
  for FILE in $(ls *.txt 2>/dev/null | sort); do
    # Skip TRANSCRIPT-MANIFEST.md if it exists
    if [[ "$FILE" == "TRANSCRIPT-MANIFEST"* ]]; then
      continue
    fi
    
    NEW_NAME=$(printf "transcript-%03d.txt" $COUNTER)
    
    if [ "$FILE" != "$NEW_NAME" ]; then
      mv "$FILE" "$NEW_NAME"
      echo "  $FILE → $NEW_NAME"
    fi
    
    COUNTER=$((COUNTER + 1))
  done
  
  echo "  ✓ Renamed $(($COUNTER - 1)) transcripts"
  echo ""
done
```

**Run it:**
```bash
chmod +x scripts/rename-transcripts-sequential.sh
./scripts/rename-transcripts-sequential.sh
```

### Step 3: Add Metadata Headers to Transcripts

**Optional:** Add timestamp + sequence header to each transcript (like we did for Feb 23 manual transcripts)

This requires parsing the filename (UUID) and matching to audio metadata, which is complex. For now, clean transcripts without headers are fine.

### Step 4: Validate Transcription Coverage

**Script:** Create `scripts/validate-transcripts.sh`

```bash
#!/bin/bash
# Validate that all audio files have corresponding transcripts

BASE_PATH="/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw"
TOTAL_AUDIO=0
TOTAL_TRANSCRIPTS=0
MISSING=0

echo "Validating transcript coverage..."
echo ""

for DATE_DIR in "$BASE_PATH"/*/audio/; do
  DATE=$(basename $(dirname "$DATE_DIR"))
  TRANSCRIPT_DIR="$(dirname "$DATE_DIR")/transcripts"
  
  AUDIO_COUNT=$(ls "$DATE_DIR"*.ogg 2>/dev/null | wc -l)
  TRANSCRIPT_COUNT=$(ls "$TRANSCRIPT_DIR"/transcript-*.txt 2>/dev/null | wc -l)
  
  TOTAL_AUDIO=$((TOTAL_AUDIO + AUDIO_COUNT))
  TOTAL_TRANSCRIPTS=$((TOTAL_TRANSCRIPTS + TRANSCRIPT_COUNT))
  
  if [ $AUDIO_COUNT -eq $TRANSCRIPT_COUNT ]; then
    echo "✓ $DATE: $AUDIO_COUNT audio = $TRANSCRIPT_COUNT transcripts"
  else
    DIFF=$((AUDIO_COUNT - TRANSCRIPT_COUNT))
    echo "✗ $DATE: $AUDIO_COUNT audio vs $TRANSCRIPT_COUNT transcripts (missing: $DIFF)"
    MISSING=$((MISSING + DIFF))
  fi
done

echo ""
echo "============================================"
echo "Total audio files: $TOTAL_AUDIO"
echo "Total transcripts: $TOTAL_TRANSCRIPTS"
echo "Missing transcripts: $MISSING"
echo "============================================"

if [ $MISSING -eq 0 ]; then
  echo "✓ All audio files have transcripts!"
else
  echo "✗ $MISSING transcripts are missing"
fi
```

**Run it:**
```bash
chmod +x scripts/validate-transcripts.sh
./scripts/validate-transcripts.sh
```

### Step 5: Update Manifest

**File:** `memory/raw/TRANSCRIPT-ARCHIVE-MANIFEST.md`

Update with final counts:
- Total audio files: 930
- Total transcripts: 930
- Date range: Feb 16 – Feb 23, 2026
- Method: Whisper (local, offline)

### Step 6: Commit

```bash
git add memory/raw/*/transcripts/
git add memory/raw/TRANSCRIPT-ARCHIVE-MANIFEST.md
git commit -m "📝 Archive: Batch transcribe all 930 audio files (Feb 16-23) using Whisper"
```

---

## Key Differences from WhatsApp Parsing

| Aspect | WhatsApp Parsing | Whisper Transcription |
|--------|------------------|----------------------|
| **Source** | Chat export text | Raw audio files |
| **Regex complexity** | High (pattern matching) | None (direct transcription) |
| **Accuracy** | Depends on export format | Whisper ML model (high accuracy) |
| **Coverage** | Only files with [openclaw] responses | All 930 audio files |
| **Speed** | Fast | 15-30 min for 930 files |
| **Reliability** | Fragile (format changes break it) | Robust (same input = same output) |
| **Cost** | Free (local) | Free (local) |

---

## Audio-Transcript Mapping

**After transcription:**
- 930 audio files (.ogg, UUID-based names)
- 930 transcripts (.txt, sequential names)

**Optional next step:** Create mapping file to link UUIDs to sequential transcripts:
```json
{
  "00b3deed-f436-4b19-bf44-7467887723fd": "transcript-001.txt",
  "0304c767-d507-4a8a-8ef6-16b6b730a8fb": "transcript-002.txt",
  ...
}
```

This enables "click audio UUID → get transcript" in the deep-dive system.

---

## Execution Order

1. ✅ Test: Single file transcription (already done)
2. ⏳ Run: `batch-transcribe-whisper.sh`
3. ⏳ Run: `rename-transcripts-sequential.sh`
4. ⏳ Run: `validate-transcripts.sh`
5. ⏳ Update manifest
6. ⏳ Commit all changes

**Total time:** ~45 min (30 min transcription + 15 min validation + commit)

---

## Success Criteria

✅ All 930 audio files transcribed  
✅ All transcripts in correct folders (one per date)  
✅ Sequential naming: transcript-001.txt through transcript-NNN.txt  
✅ Manifest updated with final counts  
✅ All changes committed to git  
✅ No data loss or corruption  

---

## Notes

- Whisper runs offline (no API calls, no rate limits)
- Output files are plain text (no special formatting needed)
- Can rerun on any subset of files without affecting others
- Previous Feb 23 manual transcripts (13 files) will be overwritten by this batch job (they'll be recreated from audio)

**Status:** Ready for Cursor execution
