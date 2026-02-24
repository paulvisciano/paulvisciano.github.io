# Git Timeline Algorithm — Memory State Reconstruction

**Status:** Implementation reference for Plan 07  
**Created:** Feb 24, 2026, 19:20 GMT+7  
**Purpose:** Document the refined algorithm for building accurate memory timelines from git history

---

## Problem

Fingerprint.json gets updated frequently (timestamps, manual refreshes) without actual memory changes. This creates false timeline entries.

**Example (flawed):**
```
Commit 1: fingerprint.json hash=abc123 (08:00)
Commit 2: fingerprint.json hash=abc123 (08:05) ← False commit, same data
Commit 3: fingerprint.json hash=abc123 (08:10) ← False commit, same data
```

Timeline shows 3 states, but memory never changed.

---

## Solution: Master Hash Filtering

Only commits where the master hash changed represent real memory evolution.

**Refined Algorithm:**

```bash
# Step 1: Find commits that changed neural data
git log --format="%H %ai" -- claw/memory/data/nodes.json claw/memory/data/synapses.json

# Step 2: For each commit, extract fingerprint
# Step 3: Compare master hashes — only include if different from previous
# Step 4: Build timeline with real changes only
```

---

## Implementation (TypeScript)

```typescript
interface TimelineEntry {
  commit: string;           // Git commit hash
  timestamp: string;        // ISO8601 timestamp
  hash: string;            // Master hash (SHA256 of nodes+synapses+boot)
  neurons: number;         // Count at this state
  synapses: number;        // Count at this state
}

async function buildMemoryTimeline(memoryId: string): Promise<TimelineEntry[]> {
  // Step 1: Query git log for commits affecting neural data
  const gitCommand = `git log --format="%H %ai" -- claw/memory/data/nodes.json claw/memory/data/synapses.json`;
  const output = await exec(gitCommand);
  const commits = output.trim().split('\n').filter(line => line);
  
  const timeline: TimelineEntry[] = [];
  let previousHash: string | null = null;
  
  // Step 2: Process each commit chronologically
  for (const line of commits) {
    const parts = line.split(' ');
    const commit = parts[0];
    const timestamp = parts.slice(1).join(' '); // Preserve full timestamp
    
    // Step 3: Extract fingerprint from this commit
    const fingerprintJson = await exec(
      `git show ${commit}:claw/memory/data/fingerprint.json`
    );
    const fingerprint = JSON.parse(fingerprintJson);
    const currentHash = fingerprint.hash;
    
    // Step 4: Only include if master hash changed (real memory evolution)
    if (currentHash !== previousHash) {
      timeline.push({
        commit,
        timestamp,
        hash: currentHash,
        neurons: fingerprint.neurons,
        synapses: fingerprint.synapses
      });
      previousHash = currentHash;
    }
    // If hash is same, skip (false commit from timestamp-only update)
  }
  
  return timeline;
}
```

---

## Result

**Clean Timeline (only real changes):**
```json
[
  {
    "commit": "798634e",
    "timestamp": "2026-02-24 08:00:00 +0700",
    "hash": "5c04cc4b6411e3fb14a58a71071d51a4e5ee188e2203e7bc74d83c1e5237e280",
    "neurons": 70,
    "synapses": 142
  },
  {
    "commit": "806bc64",
    "timestamp": "2026-02-24 09:15:00 +0700",
    "hash": "abc123def456ghi789jkl...",
    "neurons": 84,
    "synapses": 184
  },
  {
    "commit": "c9bb0e9",
    "timestamp": "2026-02-24 17:30:00 +0700",
    "hash": "xyz999aaa111bbb222ccc...",
    "neurons": 131,
    "synapses": 318
  }
]
```

Each entry represents an actual memory state change. No false entries.

---

## Why This Works

✅ **Tracks data changes:** Only nodes.json and synapses.json changes trigger timeline entries  
✅ **Validates coherence:** Master hash proves neurons and synapses work together  
✅ **Filters false commits:** Timestamp-only updates are skipped  
✅ **Accurate timeline:** Each point = real memory evolution  
✅ **Git-native:** Uses only git log (no external state files)  
✅ **Verifiable:** Anyone can run `git log` and verify the timeline  

---

## Integration into Plan 07

GitMemoryLoader.buildTimeline() uses this algorithm:

1. Parse git log for neural data commits
2. Extract fingerprint master hash from each
3. Filter by hash difference (real changes only)
4. Build timeline array
5. Return to visualization for time-travel UI

---

## Usage Example

```typescript
// Load Jarvis's complete memory evolution
const timeline = await gitMemoryLoader.listHistory('jarvis');

// User clicks on timeline position (e.g., 09:15)
const memoryAtTime = await gitMemoryLoader.load('jarvis', timeline[1].commit);

// Visualization renders that historical state
renderNeuralGraph(memoryAtTime.nodes, memoryAtTime.synapses);
```

---

**Ready for Cursor implementation in Plan 07.**
