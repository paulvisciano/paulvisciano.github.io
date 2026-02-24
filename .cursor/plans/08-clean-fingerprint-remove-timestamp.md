# Clean Fingerprint: Remove Timestamp Field

**Objective:** Remove the "lastSynced" timestamp from fingerprint.json so that fingerprint.json only changes when the master hash actually changes. Eliminates false git commits from timestamp-only updates.

**Status:** Ready for Cursor implementation  
**Complexity:** Low (1-2 hours)  
**Priority:** High (ensures git timeline integrity)

---

## Problem Statement

**Current fingerprint.json:**
```json
{
  "neurons": 138,
  "synapses": 328,
  "hash": "abc123def456...",
  "lastSynced": "2026-02-24T18:57:00Z"
}
```

**Issue:** `lastSynced` timestamp gets updated on every sync, even if `hash` doesn't change. This creates false git commits.

**Example:**
```
Commit 1: fingerprint.json (hash=abc123, lastSynced=08:00)
Commit 2: fingerprint.json (hash=abc123, lastSynced=08:05)  ← False commit
Commit 3: fingerprint.json (hash=abc123, lastSynced=08:10)  ← False commit
```

All three commits have the same hash, but git sees them as different (timestamp changed).

---

## Solution: Remove Timestamp from Fingerprint

**New fingerprint.json (clean):**
```json
{
  "neurons": 138,
  "synapses": 328,
  "hash": "abc123def456..."
}
```

**Result:**
- fingerprint.json only changes when hash changes
- No false commits
- Git history reflects real memory evolution only
- Timestamp can come from git commit metadata (git log shows timestamps)

---

## Implementation Steps

### Phase 1: Update Fingerprint Schema

1. **Define new schema**
   ```typescript
   interface Fingerprint {
     neurons: number;
     synapses: number;
     hash: string;
     // Remove: lastSynced, commit, etc.
   }
   ```

2. **Create migration script**
   - Read all existing fingerprint.json files (from git history)
   - Remove `lastSynced` field
   - Keep only: neurons, synapses, hash

### Phase 2: Update Sync Script

**Current logic:**
```typescript
async function syncMemory() {
  const newHash = computeHash(nodes, synapses, boot);
  
  // Always write fingerprint, even if hash unchanged
  writeFingerprint({
    neurons: nodes.length,
    synapses: synapses.length,
    hash: newHash,
    lastSynced: new Date().toISOString()  // ← REMOVE THIS
  });
  
  gitCommit("Memory sync");  // False commit if only timestamp changed
}
```

**New logic:**
```typescript
async function syncMemory() {
  const newHash = computeHash(nodes, synapses, boot);
  const oldFingerprint = readFingerprint();
  
  // Only write if hash actually changed
  if (newHash !== oldFingerprint.hash) {
    writeFingerprint({
      neurons: nodes.length,
      synapses: synapses.length,
      hash: newHash
      // Remove lastSynced entirely
    });
    
    gitCommit("Memory sync: neural state changed");
  }
  // If hash unchanged, skip entirely (no file write, no commit)
}
```

### Phase 3: Update All References

1. **Remove `lastSynced` from:**
   - fingerprint.json files (all historical versions)
   - sync scripts
   - bootstrap verification
   - memory loader code

2. **Replace with git metadata:**
   - Timestamp comes from `git log --format="%ai"`
   - Commit hash comes from `git rev-parse HEAD`
   - These are already available, no need to duplicate

### Phase 4: Migrate Existing Data

1. **Identify all fingerprint.json versions in git**
   ```bash
   git log --format="%H" -- claw/memory/data/fingerprint.json
   ```

2. **For each commit, remove `lastSynced`**
   ```bash
   # Create migration script that:
   # 1. Checks out each commit
   # 2. Removes lastSynced from fingerprint.json
   # 3. Commits the cleaned version
   # 4. Preserves all other data
   ```

3. **Clean up workspace**
   - Delete old fingerprint.json backups
   - Update documentation

---

## Files to Modify

### Remove `lastSynced` from:
1. `claw/memory/data/fingerprint.json` (current)
2. All historical versions (via migration script)
3. Sync scripts that generate fingerprint.json
4. Bootstrap verification code
5. Memory loader code

### Update Documentation:
1. `claw/memory/BOOT.md` — remove lastSynced references
2. `claw/.cursor/plans/07b-git-timeline-algorithm.md` — clarify timestamp comes from git
3. Implementation guides

---

## Migration Script (Cursor Implementation)

```bash
#!/bin/bash
# migrate-fingerprint.sh

echo "Migrating fingerprint.json: removing lastSynced field"

# Get all commits that modified fingerprint.json
git log --format="%H" -- claw/memory/data/fingerprint.json | while read commit; do
  echo "Processing commit $commit..."
  
  # Checkout that commit
  git checkout $commit -- claw/memory/data/fingerprint.json 2>/dev/null
  
  # Remove lastSynced field using jq
  jq 'del(.lastSynced)' claw/memory/data/fingerprint.json > fingerprint.tmp
  mv fingerprint.tmp claw/memory/data/fingerprint.json
  
  # Stage the cleaned version
  git add claw/memory/data/fingerprint.json
  
  # Amend the commit with cleaned data
  git commit --amend --no-edit 2>/dev/null || true
done

echo "Migration complete"
```

---

## New Sync Logic (TypeScript)

```typescript
async function syncMemory() {
  // Compute new master hash
  const nodes = loadNodes();
  const synapses = loadSynapses();
  const boot = loadBootData();
  
  const newHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(nodes))
    .update(JSON.stringify(synapses))
    .update(JSON.stringify(boot))
    .digest('hex');
  
  // Read old fingerprint
  const oldFingerprint = readFingerprint();
  
  // Only write if hash changed
  if (newHash !== oldFingerprint?.hash) {
    const fingerprint = {
      neurons: nodes.length,
      synapses: synapses.length,
      hash: newHash
      // No lastSynced field
    };
    
    writeFingerprint(fingerprint);
    
    // Commit only if file actually changed
    const hasChanges = await gitHasChanges('claw/memory/data/fingerprint.json');
    if (hasChanges) {
      await gitCommit(`Memory sync: ${fingerprint.neurons} neurons, ${fingerprint.synapses} synapses`);
    }
  } else {
    console.log('No memory changes, skipping fingerprint update');
  }
}
```

---

## Verification

After migration, verify:

```bash
# All fingerprints should match this schema
git show HEAD:claw/memory/data/fingerprint.json | jq 'keys'
# Should output: ["hash", "neurons", "synapses"]
# NOT: ["hash", "neurons", "synapses", "lastSynced", ...]

# No false commits
git log --format="%H %ai" -- claw/memory/data/fingerprint.json | wc -l
# Count should match number of actual memory changes (not timestamp updates)
```

---

## Timeline Impact

**Before (with timestamps):**
```
08:00:00 - hash: abc123
08:05:00 - hash: abc123  (false commit)
08:10:00 - hash: abc123  (false commit)
09:15:00 - hash: def456  (real change)
```

**After (clean):**
```
08:00:00 - hash: abc123
09:15:00 - hash: def456
```

Timeline is now accurate and clean.

---

## Success Criteria

✅ `lastSynced` removed from fingerprint.json  
✅ Sync script only writes on hash change  
✅ No false git commits from timestamp-only updates  
✅ All historical fingerprints migrated  
✅ Git timeline shows only real memory changes  
✅ Cursor can build accurate git timeline (Plan 07)  

---

## Timeline

- **Phase 1 (Schema update):** 15 min
- **Phase 2 (Sync script):** 30 min
- **Phase 3 (References):** 15 min
- **Phase 4 (Migration):** 30 min
- **Testing & Verification:** 15 min
- **Total:** ~2 hours

---

## Dependency

This plan should be executed **before** Plan 07 (Memory Loader). Clean fingerprint.json means Plan 07's git timeline will be accurate from the start.

**Execution Order:**
1. **Plan 08** (this) — Clean fingerprint.json
2. **Plan 07** — Build memory loader with clean timeline

---

**Status: Ready for Cursor**

This plan gives Cursor everything needed to clean the fingerprint schema and eliminate false git commits.
