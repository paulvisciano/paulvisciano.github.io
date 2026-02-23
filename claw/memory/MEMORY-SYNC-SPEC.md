# Memory Sync Specification

**Status:** Implementation Phase 1 (Session Start Loader)

---

## Core Principle

**Active Memory, Editorial Control**

- I load full neural memory at session start (no loss)
- During day: sync queue builds on disk as we work
- At night: Paul reviews & commits when ready
- Tomorrow: I load again with all yesterday's changes

---

## Session Startup Sequence

### 1. Memory Load (First Action of Session)

```
Session Start → Check /claw/memory/data/
  ├─ nodes.json exists?
  │  ├─ YES: Load all 31+ neurons
  │  └─ NO: First run, start fresh
  ├─ synapses.json exists?
  │  ├─ YES: Load all 39+ connections
  │  └─ NO: Start with no relationships
  ├─ timeline.json exists?
  │  ├─ YES: Read last events (context)
  │  └─ NO: Create new timeline
  └─ session-context.json exists?
     ├─ YES: Restore last session state
     └─ NO: Create for this session
```

### 2. Context Display

After load, I print:
```
✅ Loaded 31 neurons, 39 synapses
📍 Last event: memory_sync_planning (2026-02-23T10:31:00Z)
📊 Previous session: 2026-02-23-session-1 (last sync: 2026-02-23T10:31:00Z)
⏳ Pending review: 0 changes
```

This tells me:
- Full memory state
- What we were last working on
- Whether Paul has reviewed/committed changes

---

## Pause Detection (During Session)

### Algorithm

```
Every 1 minute:
  1. Get current_time = now()
  2. Get last_message_time = last time user sent message
  3. Calculate gap = current_time - last_message_time
  
  If gap > pause_threshold (5-10 min):
    1. Capture neural state
    2. Detect changes vs last_sync
    3. If changes exist:
       a. Queue changes to /sync/sync-queue.json
       b. Spawn sub-agent: "memory-sync"
       c. Sub-agent writes to disk
       d. Update session-context.json
       e. Log to timeline
    4. Continue main session (no blocking)
```

### Example Pause Detection

```
10:00 - User sends message → update last_message_time
10:05 - No new message, gap = 5 min → check threshold
10:08 - Still paused, gap = 8 min > threshold (5)
       → Trigger sync
       → Sub-agent spawns
       → Changes written to disk
       → Session continues
```

---

## Change Detection

### Diff Algorithm

```
Compare:
- Current neural state (in memory)
- Last sync state (read from sync-queue or timestamp)

Detect:
1. New nodes? → Record in changes
2. Deleted nodes? → Record in changes
3. Synapses added? → Record in changes
4. Synapses removed? → Record in changes
5. Synapse weights changed? → Record delta
6. Any other modifications? → Record
```

### Example Change

```json
{
  "timestamp": "2026-02-23T10:35:00Z",
  "type": "synapse_weight_updated",
  "source": "claude-code",
  "target": "paul-visciano",
  "old_weight": 0.90,
  "new_weight": 0.95,
  "reason": "Discussed neural mind visualization and memory sync",
  "session": "2026-02-23-session-1"
}
```

---

## Sync Queue Format

```json
{
  "last_sync_timestamp": "2026-02-23T10:31:00Z",
  "changes": [
    {
      "timestamp": "2026-02-23T10:35:00Z",
      "type": "synapse_weight_updated",
      "source": "claude-code",
      "target": "paul-visciano",
      "old_weight": 0.90,
      "new_weight": 0.95
    }
  ],
  "metadata": {
    "session_id": "2026-02-23-session-1",
    "pending_review": true,
    "total_changes": 1
  }
}
```

---

## Sub-Agent Sync Task

### Trigger

```bash
sessions_spawn(
  task: "sync-neural-memory",
  label: "Memory Sync (automatic)",
  timeout: 30
)
```

### Sub-Agent Job

```
1. Read: changes from memory
2. Read: current sync-queue.json
3. Merge: new changes into queue
4. Write: updated sync-queue.json
5. Update: session-context.json (last_sync time)
6. Report: "Synced X changes, awaiting Paul's review"
```

### Example Sub-Agent Output

```
✅ Memory sync completed
   • Changes detected: 1 synapse weight update
   • Queue written to: /sync/sync-queue.json
   • Awaiting Paul's review before commit
   • Next sync trigger: in 5 minutes (if paused)
```

---

## Paul's Review & Commit Workflow

### Manual Process (Night)

```bash
# 1. Check what's pending
cat /claw/memory/sync/sync-queue.json

# 2. Inspect actual files
cat /claw/memory/data/nodes.json
cat /claw/memory/data/synapses.json

# 3. If good, commit
cd /Users/paulvisciano/Personal/paulvisciano.github.io
git add claw/memories/data/ claw/memories/sync/
git commit -m "memory: $(date +%Y-%m-%d) - synced neural growth, reviewed & approved"

# 4. Clean sync queue (optional)
rm /claw/memory/sync/sync-queue.json
# (Or leave it for next day's reference)
```

### What Paul Might Catch

- **Spurious nodes** — something I created that shouldn't be in memory
- **Duplicate synapses** — relationship recorded twice with different weights
- **Noise** — temporal junk that clutters the graph
- **Context errors** — a synapse that doesn't make sense given the conversation

Paul is the quality gate. If something looks wrong, fix it before committing.

---

## Implementation Phases

### Phase 1: Session Start Loader ✅
- [x] Create timeline.json (historical events)
- [x] Create session-context.json (current state)
- [x] Build load-memory.sh script
- [x] Create sync-queue.json template
- [ ] **Next:** Test loader on real session startup

### Phase 2: Pause Detection (Week of Feb 24)
- [ ] Integrate pause detection into main session loop
- [ ] Build change detection algorithm
- [ ] Create sub-agent sync task template
- [ ] Test: spawn sub-agent on pause, write to disk

### Phase 3: Full Integration (Following Week)
- [ ] Pause detection fully automatic
- [ ] Sub-agent sync on every pause
- [ ] Load-at-startup fully automatic
- [ ] Timeline building automatically
- [ ] Error handling & recovery

---

## Files & Directory Structure

```
/claw/memory/
├── data/
│   ├── nodes.json                 # Current neurons (canonical + working)
│   ├── synapses.json              # Current connections (canonical + working)
│   ├── timeline.json              # Historical events
│   └── session-context.json       # Current session state
├── sync/
│   ├── sync-queue.json            # Changes pending Paul's review
│   └── last-sync-timestamp.json   # When last sync happened
├── load-memory.sh                 # Startup loader script
├── MEMORY-SYNC.md                 # Overview & plan
└── MEMORY-SYNC-SPEC.md            # This spec (detailed algorithm)
```

---

## Success Criteria

✅ **Session 1:** I load memory at start, display context correctly  
✅ **Session 2:** I load memory with all yesterday's changes  
✅ **Session 3+:** Pause detection works, sync queue fills on disk  
✅ **Weekly:** Paul reviews, commits, I load next day with full context  

**The Goal:** I never lose memory. Paul never loses control.

---

## Questions for Paul

1. Should pause threshold be configurable per session? (Currently 5-10 min)
2. Should we also trigger sync on manual `/sync-now` command?
3. Should timeline be kept separate or merged into nodes.json?
4. How often should we run pause detection check? (Currently every 1 min)
