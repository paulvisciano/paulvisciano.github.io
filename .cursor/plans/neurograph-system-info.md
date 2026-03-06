# Plan: Neurograph System Info Display

**Created:** March 5, 2026  
**Priority:** High  
**Tags:** feature, diagnostics, transparency

---

## Context

During a work session on March 5, 2026, we discovered confusion about which data source the visualization was loading. The neurograph showed 396 neurons / 827 synapses, but the actual files had been updated to 396 neurons / 840 synapses.

Root cause: No visibility into **where the data is coming from**, **when it was last updated**, or **what git commit it represents**.

This violates the core principle: **Transparency > Secrecy**. If the brain is going to be transparent about its contents, it should also be transparent about its own runtime state.

---

## Goal

Add a **System Info Panel** to the neurograph visualization that displays:

1. **Data Source Path** — Where is nodes.json/synapses.json loading from?
2. **Git Commit Hash** — What commit represents this state?
3. **Last Updated Timestamp** — When were the files last modified?
4. **Neuron/Synapse Counts** — Live counts (already exists, but make it explicit)
5. **Fingerprint Hash** — SHA-256 of combined data (if available)
6. **Brain Identity** — Which brain is loaded? (JARVIS, Paul, etc.)

---

## Implementation Steps

### Step 1: Create System Info Data File

**File:** `public/data/system-info.json`

**Auto-generated on each sync** via script that runs when copying from JARVIS repo:

```json
{
  "version": "1.0",
  "generated": "2026-03-05T16:45:00+07:00",
  "source": {
    "repo": "~/JARVIS/RAW/memories/",
    "gitCommit": "a802aef",
    "gitMessage": "HYBRID ARCHITECTURE: Graph + Git Integrated",
    "files": {
      "nodes": "nodes.json",
      "synapses": "synapses.json"
    }
  },
  "stats": {
    "neurons": 396,
    "synapses": 840,
    "milestoneCommits": 4
  },
  "integrity": {
    "hash": "c5d9db69f791bf7a...",
    "algorithm": "SHA-256"
  },
  "brain": "JARVIS"
}
```

---

### Step 2: Add Sync Script

**File:** `scripts/sync-neurograph.sh`

```bash
#!/bin/bash
# Sync neurograph from JARVIS repo and generate system-info.json

SOURCE_DIR="$HOME/JARVIS/RAW/memories/"
DEST_DIR="$HOME/Personal/paulvisciano.github.io/claw/memory/data/"

# Copy data files
cp "$SOURCE_DIR/nodes.json" "$DEST_DIR/nodes.json"
cp "$SOURCE_DIR/synapses.json" "$DEST_DIR/synapses.json"

# Generate system info
cd "$HOME/JARVIS"
COMMIT_HASH=$(git rev-parse HEAD)
COMMIT_MSG=$(git log -1 --pretty=%s)
NEURONS=$(python3 -c "import json; print(len(json.load(open('RAW/memories/nodes.json'))))")
SYNAPSES=$(python3 -c "import json; print(len(json.load(open('RAW/memories/synapses.json'))))")

cat > "$DEST_DIR/system-info.json" << EOF
{
  "version": "1.0",
  "generated": "$(date -Iseconds)",
  "source": {
    "repo": "$SOURCE_DIR",
    "gitCommit": "$COMMIT_HASH",
    "gitMessage": "$COMMIT_MSG",
    "files": {
      "nodes": "nodes.json",
      "synapses": "synapses.json"
    }
  },
  "stats": {
    "neurons": $NEURONS,
    "synapses": $SYNAPSES
  },
  "brain": "JARVIS"
}
EOF

echo "✅ Synced: $NEURONS neurons, $SYNAPSES synapses (commit: ${COMMIT_HASH:0:7})"
```

**Make executable:**
```bash
chmod +x scripts/sync-neurograph.sh
```

---

### Step 3: Load System Info in Visualization

**File:** `shared/neural-graph.js` (or wherever data loading happens)

**Add:**
```javascript
// Load system info alongside nodes/synapses
async function loadSystemInfo() {
  try {
    const response = await fetch('data/system-info.json');
    const info = await response.json();
    
    // Display in UI
    updateSystemInfoPanel(info);
    
    return info;
  } catch (error) {
    console.warn('System info not available:', error);
    return null;
  }
}

function updateSystemInfoPanel(info) {
  const panel = document.getElementById('system-info-panel');
  if (!panel || !info) return;
  
  panel.innerHTML = `
    <div class="info-row">
      <span class="label">Source:</span>
      <span class="value">${info.source.repo}</span>
    </div>
    <div class="info-row">
      <span class="label">Git Commit:</span>
      <span class="value code">${info.source.gitCommit.slice(0, 7)}</span>
    </div>
    <div class="info-row">
      <span class="label">Updated:</span>
      <span class="value">${new Date(info.generated).toLocaleString()}</span>
    </div>
    <div class="info-row">
      <span class="label">Stats:</span>
      <span class="value">${info.stats.neurons} neurons · ${info.stats.synapses} synapses</span>
    </div>
    ${info.integrity?.hash ? `
    <div class="info-row">
      <span class="label">Fingerprint:</span>
      <span class="value code">${info.integrity.hash.slice(0, 16)}...</span>
    </div>
    ` : ''}
  `;
}

// Call during initialization
loadSystemInfo();
```

---

### Step 4: Add UI Panel

**File:** `claw/memory/index.html` (or wherever the sidebar is defined)

**Add HTML:**
```html
<div id="system-info-panel" class="info-panel">
  <h3>🔍 System Info</h3>
  <div class="info-content">
    <!-- Populated by JS -->
    <p class="loading">Loading system info...</p>
  </div>
</div>
```

**Add CSS:**
```css
.info-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  font-size: 12px;
}

.info-panel h3 {
  margin: 0 0 12px 0;
  color: #06b6d4;
  font-size: 14px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 12px;
}

.info-row .label {
  color: #94a3b8;
  white-space: nowrap;
}

.info-row .value {
  color: #e2e8f0;
  text-align: right;
  word-break: break-all;
}

.info-row .value.code {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  color: #a78bfa;
}
```

---

### Step 5: Add Refresh Indicator

When data is reloaded, show a brief flash/animation indicating the system info has updated.

**Optional enhancement:** Add a "Last refreshed: X seconds ago" live counter.

---

## Testing

1. **Run sync script:** `./scripts/sync-neurograph.sh`
2. **Verify system-info.json created** with correct data
3. **Reload visualization** — panel should show all info
4. **Update neurograph** — re-run sync, verify panel updates
5. **Test without file** — delete system-info.json, verify graceful fallback (no crash, just shows "System info unavailable")

---

## Future Enhancements

- **Auto-refresh button** — manually trigger reload without full page refresh
- **Version comparison** — show if local files differ from GitHub Pages version
- **Git diff view** — what changed since last sync?
- **Multiple brain support** — dropdown to switch between JARVIS, Paul, etc.
- **Export system info** — download as JSON for debugging

---

## Files to Modify

1. ✏️ `scripts/sync-neurograph.sh` (NEW)
2. ✏️ `claw/memory/data/system-info.json` (GENERATED)
3. ✏️ `shared/neural-graph.js` (ADD loadSystemInfo function)
4. ✏️ `claw/memory/index.html` (ADD system info panel HTML)
5. ✏️ `claw/memory/styles.css` or equivalent (ADD panel styles)

---

## Acceptance Criteria

- [ ] System info panel visible in sidebar or footer
- [ ] Shows data source path
- [ ] Shows git commit hash (clickable to GitHub?)
- [ ] Shows last updated timestamp
- [ ] Shows neuron/synapse counts
- [ ] Updates automatically when data reloads
- [ ] Graceful fallback if system-info.json missing
- [ ] Sync script generates system-info.json automatically

---

**Notes for Cursor:** This is a straightforward feature addition. Focus on:
1. Clean, minimal UI that doesn't distract from the graph
2. Robust error handling (missing file = no crash)
3. Make the sync script idempotent and safe to run multiple times

The goal is **radical transparency** — anyone looking at the brain should immediately know exactly what they're seeing and where it came from.
