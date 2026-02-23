---
name: WhatsApp Transcript Extraction & Archiving
overview: Parse the WhatsApp chat export, extract all voice note transcripts (paired with [openclaw] responses), and organize them into memory/raw/[date]/transcripts/ with a manifest. One-time archive; ~1443 voice messages.
todos:
  - id: parse-script
    content: Create scripts/parse_whatsapp_transcripts.py (parse chat → JSON by date)
    status: completed
  - id: validate
    content: Validate extraction (counts, date range, sample transcripts)
    status: pending
  - id: archive-disk
    content: Write transcript files to memory/raw/[YYYY-MM-DD]/transcripts/
    status: completed
  - id: manifest
    content: Generate memory/raw/TRANSCRIPT-ARCHIVE-MANIFEST.md
    status: completed
  - id: commit
    content: Git add and commit transcript archive + manifest
    status: pending
isProject: false
---

# WhatsApp Transcript Extraction & Archiving

**Existing implementation:** `process-whatsapp-transcripts.sh` (repo root) — runs the full pipeline: parse chat → write `memory/raw/[date]/transcripts/transcript-*.txt` → generate `memory/raw/TRANSCRIPT-ARCHIVE-MANIFEST.md`. Run it, then validate and commit.

## Objective

Parse the WhatsApp chat export, extract all voice note transcripts (from `[openclaw]` responses following `<Media omitted>` lines), and organize them into `**/memory/raw/[date]/transcripts/**` with metadata headers and a manifest.

**Input:** `/Users/paulvisciano/.openclaw/media/inbound/WhatsApp Chat with +1 (REDACTED.txt`

**Output structure:**

```
memory/raw/
├── 2026-02-16/transcripts/
│   ├── transcript-001.txt
│   ├── transcript-002.txt
│   └── ...
├── 2026-02-17/transcripts/
│   └── ...
└── TRANSCRIPT-ARCHIVE-MANIFEST.md
```

---

## Architecture

```mermaid
flowchart LR
  A[WhatsApp Chat .txt] --> B[Parse script]
  B --> C[JSON by date]
  C --> D[Validate]
  D --> E[Write to disk]
  E --> F[transcript-*.txt]
  E --> G[TRANSCRIPT-ARCHIVE-MANIFEST.md]
  F --> H[git commit]
  G --> H
```



**Pipeline (left → right):** Chat export → parse (`<Media omitted>` + `[openclaw]`) → JSON keyed by date → validate counts/range → write `memory/raw/[date]/transcripts/` and manifest → commit.

**Data flow (one-time run):**

1. **Input** — WhatsApp export (one `.txt` file).
2. **Parse** — Script finds voice lines (`<Media omitted>`) and paired `[openclaw]` responses; outputs JSON keyed by `YYYY-MM-DD` with `{ timestamp, time, transcript, sequence }` per entry.
3. **Validate** — Verify total counts (~1443), date range, and sample transcripts.
4. **Archive** — For each date: create `transcripts/` dir; write `transcript-NNN.txt` with metadata header + body; generate manifest.
5. **Commit** — Add transcript files and manifest to git.

---

## Parsing Logic

### Pattern recognition

1. **Voice message indicator**
  - Line example: `2/23/26, 8:50 PM - Paul: <Media omitted>`
  - Key: `<Media omitted>` = voice message; extract date (e.g. `2/23/26` → `2026-02-23`) and time.
2. **Transcript response**
  - Example: `2/16/26, 11:28 AM - Paul: [openclaw] Hey! You made it to WhatsApp! 🎉`
  - Transcript is everything after `[openclaw]`  (same line or following lines).
  - Multi-line: continue until a line that starts with a timestamp pattern or blank/next message.
3. **Output shape**
  - Per date: list of `{ timestamp, time, transcript, sequence }`.
  - JSON key: `YYYY-MM-DD`; value: array of transcript objects.

---

## Implementation Plan

### 1. Parse chat file

**Script:** `scripts/parse_whatsapp_transcripts.py`

- Read file line by line.
- When a line contains `<Media omitted>` and starts with a timestamp:
  - Extract date (e.g. `2/23/26` → `2026-02-23`) and time.
  - Find next `[openclaw]` on same line or following lines; capture text after `[openclaw]`  until next timestamp or empty block.
  - Append to dict: `{ date: [ { timestamp, time, transcript_text, sequence } ] }`.
- Emit JSON in the format below.

**Output JSON format:**

```json
{
  "2026-02-16": [
    {
      "timestamp": "2/16/26",
      "time": "11:28 AM",
      "transcript": "Hey! You made it to WhatsApp! 🎉",
      "sequence": 1
    }
  ],
  "2026-02-17": [ ... ]
}
```

### 2. Validate extraction

- Total voice messages found (~1443).
- Total transcripts extracted (close to voice message count).
- Date range: Feb 16–Feb 23, 2026.
- Spot-check 5–10 transcripts against the chat file.

### 3. Archive to disk

For each date in the parsed JSON:

1. Create `memory/raw/[YYYY-MM-DD]/transcripts/`.
2. For each transcript: write `transcript-NNN.txt` with header:
  ```
   Timestamp: 2/16/26, 11:28 AM
   Sequence: 1
   ---
   [transcript text]
  ```

### 4. Generate manifest

**File:** `memory/raw/TRANSCRIPT-ARCHIVE-MANIFEST.md`

- Summary stats (total transcripts, date range).
- Table of contents by date (count per day).
- Short file-structure example and integration notes (e.g. sync script can ingest these as raw).

### 5. Commit

```bash
git add memory/raw/*/transcripts/
git add memory/raw/TRANSCRIPT-ARCHIVE-MANIFEST.md
git commit -m "📝 Archive: Extract WhatsApp transcripts (voice notes → transcripts by date)"
```

---

## Edge cases


| Case                                         | Handling                                                    |
| -------------------------------------------- | ----------------------------------------------------------- |
| Multi-line `[openclaw]`                      | Consume until next timestamp line (not just first line).    |
| Special characters / emojis                  | Preserve as-is.                                             |
| Timestamps inside message body               | Use clear pattern: `HH:MM AM/PM - Paul:` for message start. |
| Empty transcript                             | Skip; log which were skipped.                               |
| Orphaned `<Media omitted>` (no `[openclaw]`) | Log for review.                                             |


---

## Files (implementation)


| File / script                                    | Purpose                                                                                                                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `**process-whatsapp-transcripts.sh**`            | Main implementation: parses chat (embedded Python), writes `memory/raw/[date]/transcripts/transcript-*.txt`, generates `memory/raw/TRANSCRIPT-ARCHIVE-MANIFEST.md`. |
| `memory/raw/[date]/transcripts/transcript-*.txt` | One file per transcript with metadata header (Timestamp, Sequence, ---, body).                                                                                      |
| `memory/raw/TRANSCRIPT-ARCHIVE-MANIFEST.md`      | Summary stats, by-date index, file-structure example.                                                                                                               |


---

## Success criteria

- All ~1443 voice messages have corresponding transcript files.
- Transcripts organized by date (folders for each date present, e.g. Feb 16, 17, 20, 21, 22, 23).
- Each file has metadata header + clean transcript text.
- Manifest documents the archive.
- Changes committed to git.
- No data loss or corruption.

---

## Configuration

**File paths (hardcoded in script):**

- Chat input: `/Users/paulvisciano/.openclaw/media/inbound/WhatsApp Chat with +1 (REDACTED.txt`
- Output base: `/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/`

**Output format:**
Each transcript file includes metadata header:

```
Timestamp: 2/23/26, 8:50 PM
Sequence: 1
---
[transcript body text]
```

---

## Testing & Validation

### During execution:

1. Run script; watch output for counts and date range.
2. Script should report:
  - Total voice messages found (~1443)
  - Total transcripts extracted (~1443)
  - Date range (Feb 16 – Feb 23, 2026)
  - Folders created (6 total: one per date)

### After execution:

1. Spot-check 5–10 transcripts against the source chat (compare text)
2. Verify folder structure:
  ```
   memory/raw/2026-02-16/transcripts/
   memory/raw/2026-02-17/transcripts/
   memory/raw/2026-02-20/transcripts/
   memory/raw/2026-02-21/transcripts/
   memory/raw/2026-02-22/transcripts/
   memory/raw/2026-02-23/transcripts/
  ```
3. Verify filenames are sequential: `transcript-001.txt` through `transcript-NNN.txt` per date
4. Confirm manifest file exists and lists dates + counts
5. Run `./verify-sync.sh` to ensure git history is clean
6. Commit results with: `git add memory/raw/*/transcripts && git commit -m "📝 Archive: Extract all WhatsApp transcripts (1443 voice notes)"`

---

## Important Notes

### Existing Transcripts (Feb 23)

- **Status:** 13 transcripts already manually archived for Feb 23 (voice-001.txt through voice-013.txt)
- **Handling:** WhatsApp extraction will produce many more transcripts for Feb 23 (184 audio files total)
- **Action:** Script should backup existing voice-*.txt files to archive/feb23-manual-backup/ before overwriting
- **Result:** Full set of Feb 23 transcripts will be available after extraction

### Audio-Transcript Mapping Gap

- **Current:** 184 audio files (.ogg UUID-based) but only 13 transcripts archived
- **After extraction:** 184 transcripts will be created, but they won't be directly linked to audio UUIDs
- **Future step (post-extraction):** Create `memory/raw/2026-02-23/audio-transcript-map.json` linking:
  ```json
  {
    "uuid-1": "transcript-001.txt",
    "uuid-2": "transcript-002.txt",
    ...
  }
  ```
- **Benefit:** Enables "click audio file → get transcript" in deep-dive system

### Transcript Sequencing

- Extracted transcripts use sequential naming (transcript-001.txt, transcript-002.txt, etc.)
- Sequence reflects chronological order within each date
- When reviewing, sequence number = order during the day

### One-Time Execution

- This is a one-time archive creation (won't be repeated)
- After extraction, future voice notes should be added incrementally
- Raw audio files (.ogg) are gitignored; transcript text files stay local

### Next Steps (After Extraction)

1. Validate transcript counts match 930 expected (Feb 16-23)
2. Create audio-transcript-map.json for each date with transcripts
3. Update TRANSCRIPT-INDEX.md to reflect full coverage
4. Extract key moments from transcripts → feed into memory sync
5. Backfill moments.json with temporal data from transcripts

