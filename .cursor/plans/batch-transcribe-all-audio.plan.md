---
name: Batch Transcribe All Audio & Fill Transcript Gaps
overview: Transcribe all voice-note audio with Whisper, then match transcriptions to the &lt;Media omitted&gt; gaps in each day's transcript.md so the full conversation is in one file per day.
todos:
  - id: locate-audio
    content: Confirm audio paths (memory/raw/YYYY-MM-DD/audio/*.ogg) and ordering
    status: pending
  - id: batch-transcribe
    content: Run Whisper on all audio files; output text per file (e.g. uuid.txt or manifest)
    status: pending
  - id: match-gaps
    content: Map Nth voice message per day (from transcript.md) to Nth transcription
    status: pending
  - id: fill-transcript
    content: Replace <Media omitted> in each transcript.md with transcribed text
    status: pending
  - id: validate
    content: Verify every <Media omitted> is filled; one transcript.md per day unchanged
    status: pending
  - id: commit
    content: (N/A — transcript.md is under memory/raw/, which is gitignored)
    status: cancelled
isProject: false
---

# Batch Transcribe All Audio & Fill Transcript Gaps

**Prerequisite:** [whatsapp-transcript-extraction.plan.md](archive/whatsapp-transcript-extraction.plan.md) Phase 1 done (plan archived) — full chat split by day into `memory/raw/YYYY-MM-DD/transcript.md`. Voice messages appear as `<Media omitted>` (gaps).

**Objective:** Transcribe all voice-note audio with Whisper, match transcriptions to those gaps by order (or timestamp), and update each day’s `transcript.md` so the conversation has no gaps.

**One comprehensive file per day:** `memory/raw/YYYY-MM-DD/transcript.md` is the single canonical transcript for that day (chat + filled voice with in-audio timing). Per-clip files in `audio/transcripts/` (e.g. `.json`, `.txt`) are build artifacts for Whisper; the deliverable is only `transcript.md`.

---

## Context

- **Input:** `memory/raw/YYYY-MM-DD/transcript.md` (one per day) + `memory/raw/YYYY-MM-DD/audio/*.ogg` (voice notes).
- **Gaps:** Lines like `### 8:50 PM — Paul` with body `<Media omitted>`.
- **Output:** Same files with `<Media omitted>` replaced by the transcribed text (or transcription inline below). No new transcript files per day; no `transcripts/` subfolder with many files.

---

## Step 1: Locate audio and ordering

- **Audio path:** `memory/raw/YYYY-MM-DD/audio/*.ogg` (UUID filenames).
- **Order:** Audio files must be matched to the order of `<Media omitted>` in `transcript.md` for that day. Options:
  - Sort audio by file mtime or filename (if timestamp/UUID order reflects send order).
  - Or: parse `transcript.md` to get the order of voice blocks (1st, 2nd, …) and assume disk order matches.

**Deliverable:** Clear rule: “Nth `<Media omitted>` on date D = Nth audio file in sorted list for D.”

---

## Step 2: Batch transcribe with Whisper

**Tool:** Local Whisper (`/usr/local/bin/whisper` or equivalent).

**Test (already verified):**

```bash
whisper /path/to/audio.ogg --output_format txt --output_dir /output/
# → creates [basename].txt with transcript text
```

**Batch approach:**

- For each date dir: list `audio/*.ogg` in a deterministic order (e.g. sort by name or mtime).
- Run Whisper on each file; write transcript to a known location, e.g.:
  - `memory/raw/YYYY-MM-DD/audio/transcripts/[uuid].txt`, or
  - a single JSON/manifest per date: `{ "uuid1": "text1", "uuid2": "text2", ... }` in same order as audio list.

**Script idea:** `scripts/batch-transcribe-whisper.sh` — loop over `memory/raw/*/audio/*.ogg`, run Whisper, save `.txt` next to the `.ogg` or in a temporary `transcripts/` per date. Preserve order (e.g. process in sorted order and output a list of paths or a manifest).

**Time:** ~15–30 min for hundreds of files (CPU-dependent).

---

## Step 3: Match transcriptions to gaps

- For each `memory/raw/YYYY-MM-DD/transcript.md`:
  - Parse the file to find every block whose body is (or contains) `<Media omitted>`; record their order (1, 2, 3, …).
  - For that date, the ordered list of Whisper outputs (same order as Step 1) is the list of transcriptions.
  - So: 1st gap ← 1st transcription, 2nd gap ← 2nd transcription, etc.

**Edge cases:** If audio count ≠ gap count for a day, log and skip or mark “untranscribed” for the extra gaps.

---

## Step 4: Fill gaps in transcript.md

- For each date:
  - Read `transcript.md`.
  - Replace each `<Media omitted>` (or the whole message body when it’s only that) with the corresponding transcribed text. Keep the same structure (`### time — sender` + body).
  - Write back to `transcript.md` (or write to `transcript-with-voice.md` and then replace; either way, end state is one file per day with gaps filled).

**Format choice:** In-place replacement keeps one file; optional: add a line like `*[Voice note]*` before the transcribed text for clarity.

---

## Step 5: Validate

- For each date that had audio: no remaining `<Media omitted>` (or each is explicitly marked “untranscribed”).
- Each day still has a single transcript file (`transcript.md`).
- Spot-check a few days: read the filled transcript and confirm voice segments make sense in order.

---

## Step 6: Commit

**Not applicable:** `memory/raw/` is gitignored (see `.gitignore`), so `transcript.md` and all raw content stay local. No commit step for transcripts.

---

## Execution order

1. Confirm audio paths and sort order (Step 1).
2. Run batch Whisper script; ensure output order matches gap order (Step 2).
3. Implement match + fill (Steps 3–4) in a small script or inline in the batch script.
4. Validate (Step 5). Skip commit — transcript files are gitignored.

---

## Success criteria

- All voice-note audio files transcribed (Whisper).
- Every `<Media omitted>` in each day’s transcript has been replaced with transcription (or explicitly marked).
- One `transcript.md` per day; no extra transcript files per day.
- Optional: retain a mapping (e.g. UUID → transcript snippet) for “click audio → show transcript” in other tools.

---

## Notes

- Whisper is local/offline; no API keys.
- If we ever need to regenerate, we can re-run Phase 1 (WhatsApp split) then re-run this plan.
- `memory/raw/` is gitignored (`.gitignore`), so both audio (`.ogg`) and `transcript.md` stay local — nothing under `memory/raw/` is committed.
