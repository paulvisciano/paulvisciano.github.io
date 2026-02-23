---
name: Memory Versioning & Verification
overview: Track memory versions and verify integrity—Phase 1 (version badge) is live; Phase 2 (memory.lock), Phase 3 (selective publishing), Phase 4 (diff-based updates) are future. Foundation in place.
todos:
  - id: memory-lock
    content: Generate memory.lock with hashes for nodes, synapses, MEMORY.md (Phase 2)
    status: pending
  - id: boot-verify
    content: Boot verification against lock; show status in badge
    status: pending
  - id: selective-publish
    content: Optional visibility field + commit hook for private/public (Phase 3)
    status: pending
  - id: diff-updates
    content: Optional diff-based updates and audit trail (Phase 4)
    status: pending
isProject: false
---

# Memory Versioning & Verification Plan

**For:** Cursor (future enhancements)  
**Purpose:** Track memory versions, verify integrity, selective publishing  
**Status:** Foundation in place, enhancement-ready  

---

## Current Implementation (v1.0.0)

✅ **What exists:**
- `memory-version.json` with version metadata
- Version badge on visualization (v1.0.0 | 46 neurons, 69 synapses)
- GitHub commit hashes for verification
- BOOT.md files for portable memory sharing
- `.gitignore` for raw file privacy

---

## Phase 1: Version Badge (Live)

**Location:** Bottom-left corner of neural visualization

**Displays:**
- Version: v1.0.0
- Neuron count: 46
- Synapse count: 69
- Commit hash: 15bd89f
- Last updated: Feb 23, 2026 18:22 GMT+7
- Clickable "Source" link → GitHub MEMORY.md

**How it works:**
1. Visualization loads
2. Fetches `memory-version.json` from GitHub
3. Populates badge with current values
4. Shows version confirmation

---

## Phase 2: npm-Style .lock File (Future)

### Concept

Like `package-lock.json` in npm, create `memory.lock` for integrity verification.

### Structure

```json
{
  "version": "1.0.0",
  "lockfileVersion": 1,
  "timestamp": "2026-02-23T18:22:00Z",
  "entries": {
    "nodes": {
      "count": 46,
      "hash": "abc123def456...",
      "path": "claw/memory/data/nodes.json",
      "size": "12456 bytes"
    },
    "synapses": {
      "count": 69,
      "hash": "xyz789uvw012...",
      "path": "claw/memory/data/synapses.json",
      "size": "8901 bytes"
    },
    "memory.md": {
      "hash": "memory-md-checksum",
      "path": "claw/memory/MEMORY.md",
      "size": "24567 bytes"
    }
  },
  "checksum": "complete-hash-of-all-entries"
}
```

### Boot Verification

When Jarvis boots:
1. Load memory.lock
2. Download actual files from GitHub
3. Compute hashes
4. Compare with lock file
5. **Status:** "✓ Verified" or "⚠ Mismatch"

If mismatch:
- Warn user (local version differs from published)
- Show diff (what's different)
- Option to refresh/sync

---

## Phase 3: Selective Publishing (Future)

**Privacy tiers:** Public / Private / Selective. Add `visibility` (and optionally `published`) to nodes/synapses; filter on commit/push. See GIT-BRANCHING-MEMORY-STRATEGY.plan.md for branch-based workflow.

---

## Phase 4: Diff-Based Updates (Future)

Track deltas in `/claw/memory/updates/` (e.g. 2026-02-23-update-01.json). Boot: load base + apply updates in order for audit trail.

---

## Memory.lock Benefits

1. **Integrity checking:** Verify memory hasn't corrupted
2. **Version awareness:** Know exactly what version you're running
3. **Diff capability:** See what changed between versions
4. **Rollback potential:** Could revert to previous lock state
5. **Collaboration:** Multiple people can sync from lock file

---

## Implementation Priorities

**High (do soon):** memory.lock generation; boot verification against lock; show verification status in badge.

**Medium:** Selective publishing; diff-based updates; CLI (jarvis verify / diff / sync).

**Low:** Image steganography; advanced rollback; multi-user collaboration.

---

## Current Files

- `memory-version.json` - Metadata manifest
- `nodes.json` - 46 core neurons
- `synapses.json` - 69 architectural connections
- `memory.lock` - TO BE CREATED (integrity checksum)
- `memory.md` - Curated narrative (long-term memory)
- `.gitignore` - Privacy boundaries (raw files excluded)

---

**Status:** Foundation complete, enhancements ready when needed  
**Next:** Generate memory.lock for v1.0.0 (if desired)
