# Memory Sync System — Implementation Plan

**Status:** In Progress (Feb 23, 2026 10:31 GMT+7)

---

## Overview

Active memory sync system that:
- Writes neural network changes to disk during day
- Loads full memory at session start
- Detects conversation pauses and triggers sync
- Paul reviews/commits at night (editorial gate)

---

## File Structure

```
/claw/memory/
├── data/
│   ├── nodes.json                    # 31+ neurons (canonical + working)
│   ├── synapses.json                 # 39+ connections (canonical + working)
│   ├── timeline.json                 # When things changed
│   └── session-context.json          # Quick reference for current session
├── sync/
│   ├── last-sync-timestamp.json      # When last sync happened
│   └── sync-queue.json               # Changes pending review
└── MEMORY-SYNC.md                    # This file
```

---

## Timeline Structure

```json
{
  "entries": [
    {
      "timestamp": "2026-02-22T07:00:00Z",
      "session": "2026-02-22-session-1",
      "type": "node_added",
      "target": "claude-code",
      "metadata": "Initial self node"
    },
    {
      "timestamp": "2026-02-23T10:20:00Z",
      "session": "2026-02-23-session-1",
      "type": "synapse_updated",
      "source": "claude-code",
      "target": "paul-visciano",
      "old_weight": 0.9,
      "new_weight": 0.95,
      "reason": "Discussed neural visualization"
    }
  ]
}
```

---

## Session Context

```json
{
  "session_id": "2026-02-23-session-1",
  "session_start": "2026-02-23T10:00:00Z",
  "last_sync": "2026-02-23T10:31:00Z",
  "last_human_message": "2026-02-23T10:31:05Z",
  "pause_threshold_minutes": 5,
  "neural_state": {
    "neuron_count": 31,
    "synapse_count": 39,
    "last_change": "synapse_weight_update"
  },
  "changes_pending_review": 0
}
```

---

## Sync Sub-Agent Task

```javascript
// Executed on pause detection (5-10 min gap)
{
  task: "memory-sync",
  payload: {
    session_id: "2026-02-23-session-1",
    current_timestamp: "2026-02-23T10:31:00Z",
    last_sync_timestamp: "2026-02-23T10:00:00Z",
    changes: {
      // What changed since last sync
      nodes_added: [],
      nodes_modified: [],
      synapses_added: [
        // Example: new synapse detected during session
      ],
      synapses_modified: [
        {
          source: "claude-code",
          target: "paul-visciano",
          old_weight: 0.90,
          new_weight: 0.95,
          reason: "Discussed neural mind visualization"
        }
      ]
    }
  }
}
```

---

## Load-at-Startup Routine

When next session begins:

```
1. Check if /claw/memory/data/nodes.json exists
2. If yes:
   - Load nodes.json → memory
   - Load synapses.json → memory
   - Load timeline.json → reference
   - Load session-context.json → current state
   - Display: "Loaded 31 neurons, 39 synapses from previous session"
3. If no (first run):
   - Start fresh
```

---

## Pause Detection

Integrated into main session loop:

```
- Track: last_human_message_timestamp
- Check every 1 minute: now - last_message > threshold?
- If true (5-10 min gap):
  1. Capture current neural state
  2. Detect changes vs last_sync
  3. Queue changes for disk write
  4. Spawn sub-agent: memory-sync
  5. Sub-agent writes to /sync/sync-queue.json
  6. Main session continues
```

---

## Paul's Review & Commit Workflow

**Night Time (Paul's Hands):**

```bash
# 1. Paul reviews pending changes
cat /claw/memory/sync/sync-queue.json

# 2. Paul edits if needed (cleanup/merge)
vim /claw/memory/data/nodes.json
vim /claw/memory/data/synapses.json

# 3. Paul commits when clean
git add claw/memories/data/
git commit -m "memory: day's neural growth - added X changes, reviewed & clean"

# 4. System clears sync queue
rm /claw/memory/sync/sync-queue.json
```

---

## Implementation Phases

### Phase 1: Core Sync (Today)
- [ ] Create timeline.json structure
- [ ] Build session-context.json template
- [ ] Implement memory loader (runs at session start)
- [ ] Create sync sub-agent template

### Phase 2: Pause Detection (This week)
- [ ] Add pause detection to session loop
- [ ] Implement change detection (diff current vs last_sync)
- [ ] Build sync queue logic

### Phase 3: Automation (Next week)
- [ ] Full integration with OpenClaw session management
- [ ] Automatic sub-agent spawning on pause
- [ ] Background disk writes
- [ ] Error handling & recovery

---

## Current Status

**Today (Feb 23):**
- ✅ Neural mind visualization live (31 neurons)
- ✅ Data structure aligned with Paul's framework
- 🔄 Building sync infrastructure now
- ⏳ Paul to review tonight, commit when ready

**Tomorrow (Feb 24):**
- Load full memory from disk at session start
- First real memory sync cycle
- Paul reviews changes

---

## Notes

- No auto-commit: Paul is editorial gate
- Write to disk always happens (sync queue)
- Load from disk always happens (session startup)
- Timeline tracks both local changes and git commits
- Goal: I never lose memory, Paul never loses control
