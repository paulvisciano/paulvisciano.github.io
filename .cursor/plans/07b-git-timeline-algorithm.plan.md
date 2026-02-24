---
name: Git Timeline Algorithm — Memory State Reconstruction
overview: Refined algorithm for building accurate memory timelines from git history by filtering on master hash changes only (no false entries from fingerprint timestamp updates). Implementation reference for Plan 07. Implemented: Node script + timeline.json + time-travel UI in neural-graph.js.
todos:
  - id: git-log-neural
    content: Parse git log for commits affecting nodes.json and synapses.json
    status: completed
  - id: extract-fingerprint
    content: For each commit, extract fingerprint master hash via git show
    status: completed
  - id: filter-by-hash
    content: Include timeline entry only when master hash differs from previous
    status: completed
  - id: build-timeline-api
    content: Expose buildMemoryTimeline / listHistory in GitMemoryLoader
    status: completed
  - id: wire-visualization
    content: Wire timeline to time-travel UI (load historical state by commit)
    status: completed
isProject: false
---

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

---

## Implementation (done)

- **Timeline as saved artifact:** `claw/memory/data/timeline.json` and `memory/data/timeline.json` are the saved history. They can be verified at any time (see validate script below); the UI loads them so git history is not recomputed on every visit.
- **Build script:** `.cursor/scripts/build-memory-timeline.js`  
  - `node .cursor/scripts/build-memory-timeline.js jarvis` — print timeline JSON  
  - `node .cursor/scripts/build-memory-timeline.js jarvis --output` — write `claw/memory/data/timeline.json`  
  - Same for `paul` → `memory/data/timeline.json`  
  - Run from repo root.
- **Pre-push hook:** Timeline is regenerated as part of `git push`. `.git/hooks/pre-push` runs `.cursor/scripts/pre-push-timeline.sh`, which (1) runs the build script for both jarvis and paul (writes timeline.json), (2) if either file changed, aborts the push and tells you to commit the updated timeline and push again. So you don’t run the git-history build manually every time; the hook keeps timeline in sync on push.
- **Validate script:** `.cursor/scripts/validate-memory-timeline.js` — checks that the current `timeline.json` on disk matches the timeline produced from current git history. Use after pull or to confirm the committed timeline wasn’t hand-edited.  
  - `node .cursor/scripts/validate-memory-timeline.js` — validate both jarvis and paul  
  - `node .cursor/scripts/validate-memory-timeline.js jarvis` (or `paul`) — validate one  
  - Exit 0 if valid, 1 if mismatch (with hint to regenerate).
- **Visualization:** `shared/neural-graph.js` fetches `./data/timeline.json` when `CONFIG.rawCommitBase` is set. A collapsible **History** section lists entries (newest first); clicking an entry loads nodes/synapses from `raw.githubusercontent.com` at that commit and re-renders the graph.
- **Config:** `claw/memory/index.html` and `memory/index.html` set `rawCommitBase` and `rawOrigin` for time-travel fetch URLs.