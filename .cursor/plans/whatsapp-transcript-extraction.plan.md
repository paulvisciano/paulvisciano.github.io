---
name: WhatsApp Transcript Extraction & Archiving
overview: (1) Parse full WhatsApp chat export and split by day → one transcript.md per day in memory/raw/YYYY-MM-DD/. (2) Transcribe voice-note audio and fill gaps in the conversation where <Media omitted> appears.
todos:
  - id: full-chat-split
    content: Parse full chat export, split by day, write one transcript.md per day
    status: completed
  - id: validate-split
    content: Validate message counts and date range for split transcripts
    status: pending
  - id: commit-split
    content: (N/A — memory/raw/ is gitignored; transcript.md stays local)
    status: cancelled
  - id: transcribe-audio
    content: See batch-transcribe-all-audio.plan.md (transcribe + fill gaps)
    status: pending
isProject: false
---

# WhatsApp Transcript Extraction & Archiving

**Implementation:** `process-whatsapp-transcripts.sh` (repo root) — parses full chat export, splits by day, writes **one** `memory/raw/YYYY-MM-DD/transcript.md` per day. One transcript file per day; script removes any legacy `transcripts/` subfolder.

---

## Phase 1: Full chat split by day (done)

### Objective

Parse the full WhatsApp chat export and split it by date. Write one markdown transcript per day so each `memory/raw/YYYY-MM-DD/` has a single `transcript.md` with the full conversation for that day.

**Input:** `/Users/paulvisciano/.openclaw/media/inbound/WhatsApp Chat with +1 (813) 296-3635.txt`

**Output structure:**

```
memory/raw/
├── 2026-02-16/
│   └── transcript.md
├── 2026-02-17/
│   └── transcript.md
├── ...
└── 2026-02-23/
    └── transcript.md
```

### Parsing logic (current script)

- **Pattern:** WhatsApp export lines like `M/D/YY, H:MM AM/PM - Name: message`. Continuation lines (no leading date) are appended to the previous message.
- **Grouping:** All messages grouped by date (YYYY-MM-DD).
- **Output:** For each date, one `transcript.md` with header and each message as `### time — sender` + body. Voice messages appear as `<Media omitted>` (gaps to fill in Phase 2).

### Files


| Item                                  | Purpose                                                                                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `process-whatsapp-transcripts.sh`     | Parses full chat, writes `memory/raw/YYYY-MM-DD/transcript.md` per day. Removes legacy `transcripts/` subfolder so only one transcript per day. |
| `memory/raw/YYYY-MM-DD/transcript.md` | One file per day: full conversation with `### time — sender` blocks.                                                                            |


### Configuration

- Chat input: `/Users/paulvisciano/.openclaw/media/inbound/WhatsApp Chat with +1 (813) 296-3635.txt`
- Output base: `memory/raw/` (repo path in script)

---

## Phase 2: Transcribe audio and fill gaps

**See:** [batch-transcribe-all-audio.plan.md](batch-transcribe-all-audio.plan.md)

That plan covers: batch transcribe all voice-note audio with Whisper → match transcriptions to `<Media omitted>` gaps by order → update each day’s `transcript.md` in place so the full conversation is in one file per day.

---

## Edge cases (Phase 1)


| Case                        | Handling                                                              |
| --------------------------- | --------------------------------------------------------------------- |
| Multi-line messages         | Continuation lines (no leading timestamp) append to previous message. |
| Special characters / emojis | Preserve as-is.                                                       |
| Empty message body          | Still emit `### time — sender` with empty body.                       |


---

## Testing & validation

### Phase 1 (current)

1. Run `./process-whatsapp-transcripts.sh`; check message counts and dates.
2. Confirm one `transcript.md` per day under `memory/raw/YYYY-MM-DD/`.
3. Spot-check a day’s content against the WhatsApp export.

### Phase 2 (when implemented)

1. Verify each `<Media omitted>` in a sample day is filled with transcription (or marked).
2. Check that transcript.md remains single file per day and is readable as full conversation.

---

## Notes

- **One transcript per day** — No `transcripts/` subfolder; script removes it if present.
- **Voice = gaps** — Phase 1 leaves `<Media omitted>` as placeholders; Phase 2 fills them from audio transcription.
- **Gitignore** — `memory/raw/` is in `.gitignore`; transcript.md and audio stay local, not committed.

