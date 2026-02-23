# Memory Sync Guide — Quick Reference

**Two-Phase Approach to Neural Graph Updates**

---

## Phase 1: Static Extraction (No API)

**Script:** `memory-sync.sh`  
**Speed:** Instant  
**Cost:** Free  
**Quality:** Basic (mention counts + math)

```bash
./memory-sync.sh 2026-02-23
```

**What it does:**
1. Counts entity mentions in narrative
2. Bumps frequencies
3. Adjusts synapse weights
4. Records temporal activations
5. Saves to disk

**Output:**
- `nodes.json` (updated)
- `synapses.json` (updated)
- `nodes.json.bak` (backup)
- `synapses.json.bak` (backup)

**When to use:** Daily baseline updates, no reasoning needed

---

## Phase 2: Claude-Powered Extraction (With API)

**Script:** `memory-sync-phase2.sh`  
**Requires:** `ANTHROPIC_API_KEY` env var  
**Speed:** 2-5 seconds  
**Cost:** ~$0.05 per narrative  
**Quality:** Intelligent (relationships, sentiment, new entities)

```bash
export ANTHROPIC_API_KEY="sk-..."
./memory-sync-phase2.sh 2026-02-23
```

**What it does:**
1. Loads narrative + current graph
2. Calls Claude with extraction prompt
3. Claude extracts:
   - Entities and frequencies
   - Relationships and sentiment
   - New entity suggestions
   - Weight change justifications
4. Saves extraction JSON for review

**Output:**
- `extraction-2026-02-23.json` (Claude's analysis)
- (Manual review before applying)

**When to use:** Weekly deep analysis, new entity detection, relationship discovery

---

## Workflow: Daily + Weekly

### Daily (Phase 1, 5 seconds)
```bash
./memory-sync.sh 2026-02-23
# Quick baseline update
git add memory/data/
git commit -m "memory: 2026-02-23 - daily sync"
```

### Weekly (Phase 2, 10 seconds)
```bash
export ANTHROPIC_API_KEY="sk-..."
./memory-sync-phase2.sh 2026-02-23
# Get detailed extraction
cat memory/data/extraction-2026-02-23.json
# Review relationships, sentiment, new entities
# Then decide: auto-apply or manual edits
```

---

## File Locations

```
/Users/paulvisciano/Personal/paulvisciano.github.io/
├── .cursor/
│   ├── memory-sync.sh                      # Phase 1
│   ├── memory-sync-phase2.sh               # Phase 2
│   ├── MEMORY-EXTRACTION-PROMPT.md         # Claude prompt template
│   └── MEMORY-SYNC-PLAN.md                 # Implementation plan
├── memory/
│   └── data/
│       ├── nodes.json                      # Current
│       ├── nodes.json.bak                  # Backup
│       ├── synapses.json                   # Current
│       ├── synapses.json.bak               # Backup
│       └── extraction-YYYY-MM-DD.json      # Phase 2 output
└── claw/
    └── moments/
        └── Bangkok/
            └── [YYYY-MM-DD]/
                └── WORKING-narrative.md    # Source
```

---

## Phase 1 Output Example

```
🧠 Memory Sync for 2026-02-23
==========================
📖 Reading: /claw/moments/Bangkok/2026-02-23/WORKING-narrative.md
📊 Extracting entities from narrative...
📝 Mentions found: ['paul', 'wouter', 'volleyball', 'bangkok']
✅ Updated 4 entities
✅ Saved: nodes.json, synapses.json
```

---

## Phase 2 Output Example

Claude returns JSON like:

```json
{
  "date": "2026-02-23",
  "entities": [
    {"id": "wouter", "type": "person", "frequency": 8},
    {"id": "volleyball", "type": "activity", "frequency": 5}
  ],
  "relationships": [
    {
      "source": "paul",
      "target": "wouter",
      "type": "collaboration",
      "sentiment": "positive",
      "suggested_weight_change": 0.02
    }
  ],
  "new_entities": [
    {
      "id": "national-volleyball-player",
      "significance": "low",
      "why": "One-time training partner"
    }
  ],
  "weight_adjustments": [
    {
      "source": "paul",
      "target": "volleyball",
      "current_weight": 0.95,
      "suggested_weight": 0.96,
      "justification": "High engagement in training"
    }
  ],
  "manual_review_flags": [
    "New entity 'national-volleyball-player': ephemeral or lasting?"
  ]
}
```

**You review, then decide:**
- Apply all changes ✅
- Apply high-confidence only
- Manual edits first
- Reject and retry

---

## Setup

### Phase 1 (No Setup Required)
Just run:
```bash
cd /Users/paulvisciano/Personal/paulvisciano.github.io
./.cursor/memory-sync.sh 2026-02-23
```

### Phase 2 (One-Time Setup)

1. **Get API key:** https://console.anthropic.com/
2. **Save to env:**
   ```bash
   export ANTHROPIC_API_KEY="sk-..."
   # Or add to ~/.zshrc for permanent
   ```
3. **Run:**
   ```bash
   ./.cursor/memory-sync-phase2.sh 2026-02-23
   ```

---

## Error Handling

**Phase 1 errors:**
- Narrative not found → Check date format
- JSON write failed → Check permissions
- Backup missing → Restore from git

**Phase 2 errors:**
- API key missing → `export ANTHROPIC_API_KEY="..."`
- Invalid response → Check Claude API status
- JSON parse error → Claude returned malformed output (fallback to Phase 1)

---

## Performance

| Task | Phase 1 | Phase 2 |
|------|---------|---------|
| Daily sync | 0.5s | N/A |
| Weekly deep | N/A | 3s |
| Cost | Free | ~$0.05 |
| Quality | Basic | Advanced |
| Manual review | No | Yes |

---

## Customization

### Mention Weights (Phase 1)
Edit `memory-sync.sh`, change frequency bump:
```bash
node.frequency = frequency_old + (mention_count * 1.5)  # Emphasize more
```

### Synapse Cap (Phase 1)
Currently capped at 0.99. Change in script:
```bash
weight_new = Math.min(weight_old + 0.01, 0.95)  # Lower cap
```

### Claude Temperature (Phase 2)
Currently 0.3 (consistent). Change in script:
```bash
"temperature": 0.5  # More creative
```

---

## Next Steps

1. **Test Phase 1** on a real narrative (today)
2. **Set up Phase 2** (get API key)
3. **Test Phase 2** on same narrative
4. **Compare outputs** (static vs intelligent)
5. **Decide:** Daily Phase 1 + Weekly Phase 2?

---

**Location:** `/Users/paulvisciano/Personal/paulvisciano.github.io/.cursor/MEMORY-SYNC-GUIDE.md`

**Questions?** Edit this file, add notes, share with me.
