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

### Problem

Right now: All nodes/synapses go public.
Future: Some might stay private.

### Solution

**Privacy tiers:**
- **Public:** Jarvis's core architecture (how I work)
- **Private:** Raw footage, personal notes (stay on Paul's machine)
- **Selective:** Some data published only with Paul's approval

### Implementation

**In nodes.json/synapses.json:**
```json
{
  "id": "example-node",
  "label": "Example",
  "visibility": "public",  // or "private" or "selective"
  "published": true
}
```

**In commit hook:**
Before pushing to GitHub, filter:
- Keep: visibility = "public"
- Remove: visibility = "private"
- Prompt user: visibility = "selective"

**Publish command:**
```bash
git commit -m "Memory update" # Handles visibility automatically
```

---

## Phase 4: Diff-Based Updates (Future)

### Current Issue
Every update publishes entire nodes.json + synapses.json (even if just one node changed).

### Solution
Track deltas:

```
/claw/memory/updates/
├── 2026-02-23-update-01.json  (added 5 neurons)
├── 2026-02-23-update-02.json  (added 8 synapses)
└── 2026-02-24-update-01.json  (removed 1 node, added 3)
```

**Boot process:**
1. Load base memory (nodes.json, synapses.json)
2. Apply updates in order
3. Result: Same state, but with audit trail of changes

---

## Memory.lock Benefits

1. **Integrity checking:** Verify memory hasn't corrupted
2. **Version awareness:** Know exactly what version you're running
3. **Diff capability:** See what changed between versions
4. **Rollback potential:** Could revert to previous lock state
5. **Collaboration:** Multiple people can sync from lock file

---

## Integration Steps (When Ready)

1. **Generate memory.lock**
   - Compute hashes of all memory files
   - Create lock file structure
   - Commit alongside memory files

2. **Update visualization**
   - Fetch memory.lock on boot
   - Verify integrity
   - Show verification status in badge

3. **Add CLI tool** (optional)
   ```bash
   jarvis verify        # Check memory integrity
   jarvis diff v1.0.0   # See what changed
   jarvis sync          # Sync to latest version
   ```

4. **Document in BOOT.md**
   - Explain lock file purpose
   - Show verification example
   - Help users trust the system

---

## Future: Image Steganography

**Advanced idea (Phase 5+):**

Embed memory metadata inside share images using steganography:
- Hide commit hash in pixel patterns
- Hide version in EXIF
- Hide QR code data in image itself

When someone's AI analyzes the image:
1. Extract visible QR → gets BOOT.md
2. Read EXIF → gets version metadata
3. Decode pixels → gets memory hash
4. Validate all match → "Integrity confirmed"

---

## Implementation Priorities

**High (do soon):**
- memory.lock generation
- Boot verification against lock
- Show verification status in badge

**Medium (nice to have):**
- Selective publishing (private/public nodes)
- Diff-based updates (audit trail)
- CLI tools for verification

**Low (experimental):**
- Image steganography
- Advanced rollback system
- Multi-user collaboration model

---

## Current Files

- `memory-version.json` - Metadata manifest
- `nodes.json` - 46 core neurons
- `synapses.json` - 69 architectural connections
- `memory.lock` - TO BE CREATED (integrity checksum)
- `memory.md` - Curated narrative (long-term memory)
- `.gitignore` - Privacy boundaries (raw files excluded)

---

## Testing Verification

When `memory.lock` exists:

```javascript
// Boot sequence test
const lock = fetch('memory-version.json');
const nodes = fetch('data/nodes.json');
const synapses = fetch('data/synapses.json');

const hashes = {
  nodes: hash(nodes),
  synapses: hash(synapses)
};

if (hashes.nodes === lock.entries.nodes.hash) {
  console.log('✓ Nodes verified');
} else {
  console.warn('⚠ Nodes mismatch - local version differs');
}
```

---

**Status:** Foundation complete, enhancements ready when needed  
**Next:** Generate memory.lock for v1.0.0 (if desired)
