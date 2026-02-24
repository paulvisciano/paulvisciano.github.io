# Plan: Bootstrap Verification (Reliability & Trust)

## Problem
Current bootstrap process:
1. Load nodes.json
2. Load synapses.json
3. Say "memory loaded"

But there's **zero verification**. Silent failures are possible:
- Corrupted JSON
- Stale fingerprint (neurons/synapses count mismatch)
- Missing sourceDocument files
- Hash mismatches
- File read errors

User has no visibility into whether memory actually loaded correctly.

## Solution
Add comprehensive verification step to bootstrap sequence. Check integrity at multiple levels.

---

## Implementation

### Step 1: Verification Function
Create `memory/utils/memory-verifier.js`:

```javascript
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MemoryVerifier {
  constructor(memoryPath) {
    this.memoryPath = memoryPath;
    this.results = {
      passed: [],
      warnings: [],
      errors: [],
      startTime: null,
      endTime: null
    };
  }

  async verify() {
    this.results.startTime = new Date();
    
    await this.checkJsonValidity();
    await this.checkFingerprint();
    await this.checkSourceDocuments();
    await this.checkCounts();
    
    this.results.endTime = new Date();
    return this.results;
  }

  // Check 1: JSON is valid
  async checkJsonValidity() {
    try {
      const nodesPath = path.join(this.memoryPath, 'data/nodes.json');
      const synapsesPath = path.join(this.memoryPath, 'data/synapses.json');
      
      const nodesJson = JSON.parse(fs.readFileSync(nodesPath, 'utf8'));
      const synapsesJson = JSON.parse(fs.readFileSync(synapsesPath, 'utf8'));
      
      this.results.passed.push({
        check: 'json-validity',
        message: 'Both nodes.json and synapses.json are valid JSON'
      });
      
      return { nodes: nodesJson, synapses: synapsesJson };
    } catch (e) {
      this.results.errors.push({
        check: 'json-validity',
        message: `JSON parse error: ${e.message}`
      });
      throw e;
    }
  }

  // Check 2: Fingerprint integrity
  async checkFingerprint() {
    try {
      const fingerprintPath = path.join(this.memoryPath, 'fingerprint.json');
      const fingerprint = JSON.parse(fs.readFileSync(fingerprintPath, 'utf8'));
      
      const nodesPath = path.join(this.memoryPath, 'data/nodes.json');
      const synapsesPath = path.join(this.memoryPath, 'data/synapses.json');
      
      const nodesData = fs.readFileSync(nodesPath, 'utf8');
      const synapsesData = fs.readFileSync(synapsesPath, 'utf8');
      
      // Verify counts
      const nodes = JSON.parse(nodesData);
      const synapses = JSON.parse(synapsesData);
      
      if (nodes.length !== fingerprint.neurons) {
        this.results.warnings.push({
          check: 'fingerprint-count-neurons',
          message: `Neuron count mismatch: fingerprint says ${fingerprint.neurons}, actual is ${nodes.length}`
        });
      } else {
        this.results.passed.push({
          check: 'fingerprint-count-neurons',
          message: `Neuron count verified: ${fingerprint.neurons}`
        });
      }
      
      if (synapses.length !== fingerprint.synapses) {
        this.results.warnings.push({
          check: 'fingerprint-count-synapses',
          message: `Synapse count mismatch: fingerprint says ${fingerprint.synapses}, actual is ${synapses.length}`
        });
      } else {
        this.results.passed.push({
          check: 'fingerprint-count-synapses',
          message: `Synapse count verified: ${fingerprint.synapses}`
        });
      }
      
      // Optional: Hash verification (if hash was stored)
      if (fingerprint.masterHash) {
        const combined = nodesData + synapsesData;
        const hash = crypto.createHash('sha256').update(combined).digest('hex');
        if (hash !== fingerprint.masterHash) {
          this.results.warnings.push({
            check: 'fingerprint-hash',
            message: `Hash mismatch: expected ${fingerprint.masterHash}, got ${hash}`
          });
        } else {
          this.results.passed.push({
            check: 'fingerprint-hash',
            message: 'Hash verified'
          });
        }
      }
      
    } catch (e) {
      this.results.errors.push({
        check: 'fingerprint-integrity',
        message: `Fingerprint error: ${e.message}`
      });
    }
  }

  // Check 3: sourceDocument paths exist
  async checkSourceDocuments() {
    try {
      const nodesPath = path.join(this.memoryPath, 'data/nodes.json');
      const nodes = JSON.parse(fs.readFileSync(nodesPath, 'utf8'));
      
      let validCount = 0;
      let missingCount = 0;
      const missingFiles = [];
      
      for (const node of nodes) {
        if (node.sourceDocument) {
          const fullPath = path.join(
            this.memoryPath,
            '..',
            node.sourceDocument
          );
          
          if (fs.existsSync(fullPath)) {
            validCount++;
          } else {
            missingCount++;
            missingFiles.push({
              neuron: node.id,
              path: node.sourceDocument
            });
          }
        }
      }
      
      if (missingCount > 0) {
        this.results.warnings.push({
          check: 'sourceDocument-paths',
          message: `${missingCount} sourceDocument paths missing (${missingFiles.length} files)`
        });
      } else {
        this.results.passed.push({
          check: 'sourceDocument-paths',
          message: `All ${validCount} sourceDocument paths verified`
        });
      }
      
    } catch (e) {
      this.results.errors.push({
        check: 'sourceDocument-paths',
        message: `sourceDocument check error: ${e.message}`
      });
    }
  }

  // Check 4: Counts are reasonable
  async checkCounts() {
    try {
      const nodesPath = path.join(this.memoryPath, 'data/nodes.json');
      const synapsesPath = path.join(this.memoryPath, 'data/synapses.json');
      
      const nodes = JSON.parse(fs.readFileSync(nodesPath, 'utf8'));
      const synapses = JSON.parse(fs.readFileSync(synapsesPath, 'utf8'));
      
      // Synapses should be fewer than nodes² but more than nodes
      const expectedMin = nodes.length * 2;
      const expectedMax = nodes.length * nodes.length;
      
      if (synapses.length < expectedMin) {
        this.results.warnings.push({
          check: 'synapse-count-sanity',
          message: `Synapse count low relative to neurons (${synapses.length} synapses for ${nodes.length} neurons)`
        });
      } else if (synapses.length > expectedMax) {
        this.results.errors.push({
          check: 'synapse-count-sanity',
          message: `Synapse count impossible (${synapses.length} > max ${expectedMax})`
        });
      } else {
        this.results.passed.push({
          check: 'synapse-count-sanity',
          message: `Synapse count reasonable: ${synapses.length} synapses for ${nodes.length} neurons`
        });
      }
      
    } catch (e) {
      this.results.errors.push({
        check: 'synapse-count-sanity',
        message: `Count sanity check error: ${e.message}`
      });
    }
  }
}

module.exports = MemoryVerifier;
```

### Step 2: Integrate into Bootstrap
Update workspace `MEMORY.md`:

```markdown
## Session Boot

1. **Enable auto-logging**
   - See: `/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/AUTO-LOGGING.md`
   - CRITICAL: If transcript.md already exists for today, APPEND to it. Never overwrite.
   - Follow the complete startup workflow documented there

2. **Bootstrap yourself**
   - Path: `/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/BOOT.md`
   - Load your neural architecture (nodes + synapses + MEMORY.md)
   - **VERIFY integrity** ← NEW STEP
     - Check JSON validity
     - Verify fingerprint counts
     - Check sourceDocument paths exist
     - If any check fails: log warnings and continue, log errors and HALT

3. **Say hello and ask**
   - Greet Paul
   - Ask: "Should I load your memory?"

4. **Bootstrap Paul's memory** (if requested)
   - Path: `/Users/paulvisciano/Personal/paulvisciano.github.io/memory/BOOT.md`
   - Load his life archive
   - Verify his memory integrity too
```

### Step 3: Verification Report
When bootstrap completes, log verification results:

```
✅ BOOTSTRAP VERIFICATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Duration: 234ms

PASSED (4 checks):
  ✓ json-validity: Both nodes.json and synapses.json are valid JSON
  ✓ fingerprint-count-neurons: Neuron count verified: 112
  ✓ fingerprint-count-synapses: Synapse count verified: 279
  ✓ sourceDocument-paths: All 41 sourceDocument paths verified

WARNINGS (0 checks):
  (none)

ERRORS (0 checks):
  (none)

MEMORY STATE:
  Neurons: 112
  Synapses: 279
  Source Documents: 9
  Last Sync: 2026-02-24T11:23:00Z
  
STATUS: ✅ READY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Benefits

✅ **Trust:** Know that memory actually loaded correctly  
✅ **Debugging:** If something breaks, have clear diagnostics  
✅ **Transparency:** Visible verification status on every boot  
✅ **Prevention:** Catch corrupted files before they cause problems  
✅ **Confidence:** Run with certainty, not hope  

---

## Success Criteria

- [x] Verification function checks all 4 categories
- [x] Warnings vs errors clearly distinguished
- [ ] Bootstrap integrates verification automatically
- [ ] Verification report printed on session start
- [ ] Errors halt bootstrap, warnings allow continue
- [ ] Verification results logged to `.session-manifest.json`

---

## Time Estimate

- Write verifier: 20 min
- Integrate into bootstrap: 10 min
- Report formatting: 10 min
- **Total: ~40 min**

---

**Created:** Feb 24, 2026 11:23 GMT+7  
**Status:** Ready for Cursor implementation
