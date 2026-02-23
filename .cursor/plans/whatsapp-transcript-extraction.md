# Plan: WhatsApp Transcript Extraction & Archiving

**Objective:** Parse the WhatsApp chat export, extract all voice note transcripts, and organize them into `/memory/raw/[date]/transcripts/` folders.

**Input File:** `/Users/paulvisciano/.openclaw/media/inbound/WhatsApp Chat with +1 (813) 296-3635.txt`

**Output Structure:** 
```
/memory/raw/
├── 2026-02-16/transcripts/
│   ├── transcript-001.txt
│   ├── transcript-002.txt
│   └── ...
├── 2026-02-17/transcripts/
│   ├── transcript-001.txt
│   └── ...
└── [etc for each date]
```

---

## Parsing Logic

### Pattern Recognition

1. **Voice Message Indicator:**
   ```
   2/23/26, 8:50 PM - Paul: <Media omitted>
   ```
   - Timestamp: `2/23/26, 8:50 PM`
   - Key: `<Media omitted>` = voice message

2. **Transcript Response (Same Line as Timestamp):**
   ```
   2/16/26, 11:28 AM - Paul: [openclaw] Hey! You made it to WhatsApp! 🎉
   ```
   - The `[openclaw]` response is on the SAME line
   - Extract everything after `[openclaw] `
   - May span multiple lines (multi-line messages)

3. **Multi-line Messages:**
   - Some `[openclaw]` responses span multiple lines
   - Continue reading until you hit a line starting with a timestamp pattern
   - Stop at blank lines or next message

---

## Implementation Steps

### Step 1: Parse Chat File

Create a Python script: `scripts/parse_whatsapp_transcripts.py`

**Input:** WhatsApp chat file  
**Output:** JSON with all transcripts indexed by date

**Logic:**
```python
- Read file line by line
- For each line:
  - If line contains "<Media omitted>" AND starts with timestamp:
    - Extract date (e.g., 2/23/26 → 2026-02-23)
    - Extract time
    - Look for next occurrence of "[openclaw]" on same line or next few lines
    - Capture everything after "[openclaw]" until next timestamp or empty block
    - Store in dict: { date: [{ timestamp, time, transcript_text }] }
- Return organized dict
```

**Output JSON format:**
```json
{
  "2026-02-16": [
    {
      "timestamp": "2/16/26",
      "time": "11:28 AM",
      "transcript": "Hey! You made it to WhatsApp! 🎉",
      "sequence": 1
    },
    ...
  ],
  "2026-02-17": [ ... ],
  ...
}
```

---

### Step 2: Validate Extraction

Check:
- [ ] Total voice messages found (~1443)
- [ ] Total transcripts extracted (should be close to voice message count)
- [ ] Date range coverage (Feb 16 - Feb 23, 2026)
- [ ] Sample transcripts look reasonable

---

### Step 3: Archive to Disk

For each date in parsed JSON:
1. Create folder: `/memory/raw/[YYYY-MM-DD]/transcripts/`
2. For each transcript in that date:
   - Create file: `transcript-NNN.txt` (sequence number)
   - Write header with metadata:
     ```
     Timestamp: 2/16/26, 11:28 AM
     Sequence: 1
     ---
     [transcript text]
     ```

---

### Step 4: Generate Manifest

Create: `/memory/raw/TRANSCRIPT-ARCHIVE-MANIFEST.md`

Content:
- Summary stats (total transcripts, date range, etc.)
- Table of contents by date (count per day)
- File structure example
- Integration notes

---

### Step 5: Commit to Git

```bash
git add memory/raw/*/transcripts/
git add memory/raw/TRANSCRIPT-ARCHIVE-MANIFEST.md
git commit -m "📝 Archive: Extract all WhatsApp transcripts (1443 voice notes → transcripts by date)"
```

---

## Success Criteria

✅ All 1443 voice messages have corresponding transcript files  
✅ Transcripts organized by date (6 date folders: Feb 16, 17, 20, 21, 22, 23)  
✅ Each transcript file has metadata header + clean text  
✅ Manifest file documents the archive  
✅ All changes committed to git  
✅ No data loss or corruption  

---

## Edge Cases to Handle

1. **Multi-line [openclaw] responses**
   - Some transcripts span 2+ lines
   - Continue reading until next timestamp (not just first line)

2. **Special characters in transcripts**
   - Emojis, quotes, code blocks
   - Should all be preserved as-is

3. **Timestamps at end of messages**
   - Some messages may have timestamps embedded
   - Look for clear pattern: `HH:MM AM/PM - Paul:`

4. **Empty transcripts**
   - If [openclaw] response exists but is empty, skip it
   - Log which ones were skipped

5. **Orphaned <Media omitted> lines**
   - Voice messages without [openclaw] response
   - Log them for review (should be rare)

---

## Files to Create/Modify

- **Create:** `scripts/parse_whatsapp_transcripts.py` (main script)
- **Create:** `/memory/raw/[date]/transcripts/transcript-*.txt` (archive files)
- **Create:** `/memory/raw/TRANSCRIPT-ARCHIVE-MANIFEST.md` (index)
- **Modify:** None (no existing files affected)

---

## Testing

1. Run script and check output counts
2. Spot-check 5-10 transcripts (verify they match chat file)
3. Verify folder structure created correctly
4. Check manifest file for accuracy
5. Run `./verify-sync.sh` to ensure nothing broke

---

## Notes

- This is one-time execution (archive creation)
- Preserve raw transcripts locally (don't commit to git)
- Manifest provides searchable index
- Next step: Extract key moments from transcripts and distill into memory neurons
