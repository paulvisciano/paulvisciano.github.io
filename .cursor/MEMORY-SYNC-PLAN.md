# Memory Sync Script — Implementation Plan

**Goal:** Automatically extract nodes & synapses from daily narratives, update neural graph, maintain editorial control

**Status:** Phase 1 live (local-only). Phase 2+ optional (cloud/LLM if desired).

**Runtime:** 100% local — Bash + Node.js, no API calls, no token usage. Entity extraction is regex-based against existing nodes.

---

## 1. Problem Statement

**Current State:**
- You have a living neural graph (nodes.json + synapses.json)
- Daily narratives capture experiences (WORKING-narrative.md)
- Manual work to sync narrative → graph (error-prone, loses context)

**Solution:**
- Automated extraction: narrative → entities → graph updates
- Preserve editorial control: Paul reviews before commit
- Maintain history: backup old files, track changes

---

## 2. Script Responsibilities

### Input
- **Date:** `YYYY-MM-DD` (or current date if omitted)
- **Narrative:** First file found among:
  - `moments/bangkok/$DATE/narrative.md`
  - `moments/bangkok/$DATE/WORKING-narrative.md`
  - `claw/moments/Bangkok/$DATE/narrative.md`
  - `claw/moments/Bangkok/$DATE/WORKING-narrative.md`
- **Journal (same date):** All of:
  - `claw/memory/$DATE.md`
  - `claw/memory/$DATE-*.md`
  - `claw/thoughts/$DATE-*.md`
- **OpenClaw memory (optional):** If `~/.openclaw/workspace/memory` exists:
  - `$DATE.md`
  - `$DATE-*.md`
  - (Session recaps, architecture notes, episode summaries — merged into extraction.)
- **Raw (same date):** `memory/raw/$DATE/*.md`:
  - `transcript.md` — full transcribed voice/session text
  - `voice-notes.md` — voice-notes index/summary
  - Any other `*.md` — moment writeups (e.g. OPTICAL-SHOP-MOMENT-2026-02-23.md, HAVANA-RECONNECTION-2026-02-22.md)
  - (Audio `.ogg` files are not read; use their transcripts/summaries above.)
- **Current Graph:** `/memory/data/nodes.json` + `/memory/data/synapses.json`

### Output
- **Updated nodes.json** (frequencies bumped, temporal activations added; each sync moment can list `sources`: `[{ type, path, label, integrated_at }]`) — live site uses this file
- **Updated synapses.json** (weights adjusted based on mentions) — live site uses this file
- **sync-manifest.json** (per-date list of sources with `integrated: true/false`, `mtime`, `integrated_at` — single source of truth for “fully integrated or not”)
- **Backup files** (nodes.json.bak, synapses.json.bak)
- **Log/Summary** (entities extracted, which sources integrated this run vs already integrated)

### Source tracking & integration status
- **Original source:** Every integrated source is recorded in `memory/data/sync-manifest.json` under `by_date[YYYY-MM-DD].sources[]` with `path`, `type` (narrative | journal | openclaw | raw-transcript | raw-voice-notes | raw-moment), `label`, `mtime`, `integrated`, `integrated_at`.
- **Fully integrated:** A source is fully integrated when it appears in the manifest for that date with `integrated: true` and the file’s current `mtime` matches the stored `mtime`. Re-running sync skips such sources (no double-count).
- **Content hash:** Each integrated source stores `content_hash` (SHA-256 hex of file content) so you can verify the exact content that was absorbed.
- **Raw files moved:** After integration, raw sources (`memory/raw/YYYY-MM-DD/*.md`) are moved to `memory/raw/YYYY-MM-DD/integrated/` so you can see at a glance what's been absorbed; the manifest's `path` is updated to the new location. Narrative/journal/OpenClaw files are left in place.
- **On the graph:** Temporal activations for sync moments can include a `sources` array so the original source of a memory is visible on the node (same shape: `type`, `path`, `label`, `integrated_at`).

---

## 3. Extraction Logic

### Entity Types to Extract

| Type | Examples | Source |
|------|----------|--------|
| **People** | paul, wouter, khanh, boy, leo, mom | Known nodes + narrative mentions |
| **Activities** | volleyball, travel, urban-runner, work, yoga | Core activities + narrative context |
| **Locations** | bangkok, miami, chicago, vietnam | Geographic references |
| **Concepts** | wealth-redistribution, storytelling, authenticity | Thematic elements |

### Extraction Algorithm

```
1. Read narrative file
2. For each entity type:
   a. Search narrative for mentions (case-insensitive regex)
   b. Count occurrences
   c. Flag new entities not in existing nodes
3. Return: {entity_id: mention_count, ...}
```

### Weight Updates

**Node Frequency:**
- Increment by number of mentions
- Formula: `frequency_new = frequency_old + mention_count`

**Synapse Weight:**
- Bump relationships based on co-mention
- Formula: `weight_new = min(weight_old + 0.01, 0.99)`
- Only update if both entities mentioned

**Temporal Activation:**
- Record moment of narrative sync
- Add thinking patterns (["memory-sync", "narrative-integration"])
- Reason: "Synced narrative from [DATE]: X entities mentioned"

---

## 4. Implementation Phases

### Phase 1: Basic Extraction (Now) ✅
- [x] Parse narrative file
- [x] Count entity mentions
- [x] Update frequencies + weights
- [x] Save to disk
- [x] **Multi-path narrative:** `moments/bangkok` or `claw/moments/Bangkok`, `narrative.md` or `WORKING-narrative.md`
- [x] **Journal integration:** `claw/memory/YYYY-MM-DD.md`, `claw/memory/YYYY-MM-DD-*.md`, `claw/thoughts/YYYY-MM-DD-*.md` merged into extraction
- [x] **Dynamic entity list:** All node IDs from `nodes.json` (regex: id with hyphens as spaces), no hardcoded lists
- [x] **Co-mention bumps:** Paul→entity and entity↔entity synapse weight bumps; new paul→entity synapse if missing
- [x] **Temporal activations:** Paul + Bangkok get sync moment with source list (narrative + journal filenames)

### Phase 2: Smart Extraction (This Week)
- [ ] Detect **new entities** (people, concepts not yet in graph)
- [ ] Create new nodes for significant mentions
- [ ] Extract **temporal context** (which moment, how long)
- [ ] Handle **ambiguous mentions** (same word, different meanings)

### Phase 3: Semantic Understanding (Next Week)
- [ ] NLP-based relationship detection (who met whom, what happened)
- [ ] Sentiment analysis (positive/negative encounters)
- [ ] Context windows (understand paragraph-level meaning)
- [ ] Automatic reason strings (why did weight change)

### Phase 4: Full Automation (Following Week)
- [ ] Cron trigger on pause detection
- [ ] Auto-commit with Paul's review gate
- [ ] Real-time graph visualization updates
- [ ] Rollback on conflicts

---

## 5. Technical Approach

### Language
**Bash + Node.js (embedded)**
- Bash handles file I/O, validation, backups
- Node.js handles JSON parsing, complex logic
- Keep as single executable script

### Dependencies
- `jq` (optional, for JSON inspection)
- `node` (required, for extraction logic)
- Standard Unix tools (date, cp, mv)

### Error Handling
- Validate date format
- Check narrative file exists
- Verify data files valid JSON
- Backup before write
- Report errors clearly

---

## 6. Script Structure

```bash
#!/bin/bash
# memory-sync.sh [YYYY-MM-DD]

1. Validate input
2. Load files (narrative, nodes, synapses)
3. Backup old data
4. Call Node.js extraction
5. Save updated data
6. Report summary
```

### Node.js Embedded Logic
```javascript
// 1. Parse narrative
// 2. Count entity mentions
// 3. Update nodes (frequency)
// 4. Update synapses (weights)
// 5. Add temporal activations
// 6. Write JSON files
```

---

## 7. Testing Strategy

### Test Case 1: Basic Extraction
**Input:** Simple narrative mentioning paul, wouter, volleyball
**Expected:**
- paul.frequency increases by mention count
- wouter.frequency increases
- paul→wouter synapse weight bumps
- Temporal activation added

### Test Case 2: New Entity Detection
**Input:** Narrative mentions "someone new" (not in nodes)
**Expected:**
- New node created with low frequency
- New synapses to paul + relevant entities

### Test Case 3: Multiple Mentions
**Input:** paul mentioned 50 times, volleyball 20 times
**Expected:**
- Frequencies reflect accurate counts
- Weights properly capped at 0.99

### Test Case 4: Backup + Recovery
**Input:** Run script, then corrupted data
**Expected:**
- `nodes.json.bak` restores old state
- No data loss

---

## 8. Success Criteria

✅ **Phase 1:**
- Script runs without errors
- nodes.json + synapses.json updated correctly
- Backups created and valid

✅ **Phase 2:**
- New entities detected and added
- Temporal activations accurate
- Weights reflect narrative

✅ **Phase 3:**
- NLP extracts relationships (not just counts)
- Sentiment captured in synapse metadata
- Context-aware weight adjustments

✅ **Full System:**
- Can run `./memory-sync.sh` on any date
- Graph stays accurate + consistent
- Paul controls final commit

---

## 9. Usage Examples

### Daily Sync
```bash
./.cursor/memory-sync.sh 2026-02-23
# → Finds narrative (e.g. moments/bangkok/2026-02-23/narrative.md)
# → Merges journal: claw/memory/2026-02-23.md, claw/memory/2026-02-23-*.md, claw/thoughts/2026-02-23-*.md
# → Updates memory/data/nodes.json + synapses.json from all node IDs mentioned in combined text
# → Reports entities and sources
```

### Review Before Commit
```bash
cd /Users/paulvisciano/Personal/paulvisciano.github.io
git diff memory/data/nodes.json       # See what changed
git diff memory/data/synapses.json    # See weight updates
git add memory/data/
git commit -m "memory: 2026-02-23 - synced narrative"
```

### Rollback if Needed
```bash
cp memory/data/nodes.json.bak memory/data/nodes.json
cp memory/data/synapses.json.bak memory/data/synapses.json
# Graph restored to previous state
```

---

## 10. Questions for Paul

1. **New entity creation:** Should script auto-create new nodes, or flag for review?
2. **Weight ceiling:** Is 0.99 the right cap, or should it be higher (0.95, 0.98)?
3. **Frequency scaling:** Should mentions be 1:1, or weighted (title mentions > body mentions)?
4. **Temporal retention:** How many temporal_activations per node before archiving old ones?
5. **Cron trigger:** When should sync run? (End of day? On pause detection? Manual only?)

---

## 11. File Locations

```
/Users/paulvisciano/Personal/paulvisciano.github.io/
├── .cursor/
│   ├── memory-sync.sh                # ← Script (executable)
│   └── MEMORY-SYNC-PLAN.md           # ← This plan
├── memory/
│   └── data/
│       ├── nodes.json
│       ├── nodes.json.bak            # ← Auto-backup
│       ├── synapses.json
│       └── synapses.json.bak         # ← Auto-backup
├── moments/
│   └── bangkok/
│       └── [YYYY-MM-DD]/
│           └── narrative.md          # ← Preferred narrative path
├── claw/
│   ├── moments/
│   │   └── Bangkok/
│   │       └── [YYYY-MM-DD]/
│   │           ├── narrative.md      # ← Alt narrative
│   │           └── WORKING-narrative.md
│   ├── memory/
│   │   ├── YYYY-MM-DD.md             # ← Daily journal
│   │   └── YYYY-MM-DD-*.md           # ← Date-prefixed journal
│   └── thoughts/
│       └── YYYY-MM-DD-*.md           # ← Date-prefixed thoughts
│
│  ~/.openclaw/workspace/memory/      # ← OpenClaw daily memory (optional)
│       ├── YYYY-MM-DD.md             # Session/recap for that day
│       └── YYYY-MM-DD-*.md           # Date-prefixed (e.g. session-recap, plans)
│
│  memory/raw/                        # ← Raw transcripts, voice-notes, moments
│       └── YYYY-MM-DD/
│           ├── transcript.md         # Full session/voice transcript
│           ├── voice-notes.md        # Voice-notes index
│           ├── *.md                  # Moment writeups (e.g. HAVANA-RECONNECTION, OPTICAL-SHOP-MOMENT)
│           └── audio/                # .ogg files (not read; use transcript.md)
```

---

## 12. Next Steps

1. **Review this plan** — feedback on approach, questions?
2. **Approve Phase 1** — basic extraction (done)
3. **Test on real narrative** — run script, inspect results
4. **Iterate** — refine based on output quality
5. **Move to Phase 2** — new entity detection, NLP

---

**Created:** Mon Feb 23, 2026 19:27 GMT+7  
**Script Location:** `/Users/paulvisciano/Personal/paulvisciano.github.io/.cursor/memory-sync.sh`
