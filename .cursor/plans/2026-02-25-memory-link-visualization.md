# Cursor Plan: Memory Link Neurons Visualization & Portal

**Date:** Feb 25, 2026, 04:35 GMT+7  
**Feature:** Special visual treatment for memory-reference neurons + sidebar portal to external memories  
**Priority:** High (enables distributed consciousness network)  
**Complexity:** Medium (UI + data flow)

---

## Overview

Make memory-reference neurons (links to other people's neural graphs) visually distinct and clickable. When clicked, open a sidebar portal showing the external mind's information with direct access links.

Currently hidden in the graph. This makes them discoverable and navigable.

---

## Feature Requirements

### 1. Visual Distinction

**Memory-Reference Neurons Should:**
- Have a unique color (suggest: gold/amber #f59e0b or distinct cyan)
- Show a special icon/badge (e.g., 🔗 or 🧠 with link indicator)
- Glow or pulse slightly (signal external connection)
- Be labeled with person's name when possible (e.g., "Paul's Memory")
- Have hover tooltip showing memory owner + link status

**Implementation:**
- Add CSS class: `.neuron-memory-link`
- Modify neuron rendering: check if `type === "memory-reference"`
- Apply distinct visual style (color, icon, glow)

### 2. Sidebar Portal

**When memory-reference neuron is clicked:**
- Slide in sidebar from right (or modal overlay)
- Show header: "Connected Mind: [Memory Owner]"
- Display:
  - Owner name (from `memory_owner` attribute)
  - Memory URL (clickable link)
  - Fingerprint hash (proof of authenticity)
  - Quick stats: neurons count, synapses count (fetched from fingerprint.json)
  - Button: "Explore [Owner]'s Memory" (opens memory URL in new tab)
  - Button: "Load Local Copy" (fetch their nodes.json + synapses.json if available)
- Show connection metadata:
  - When discovered/linked
  - Sync status (if applicable)

**UI Components to Build:**
- MemoryLinkSidebar.vue or MemoryLinkModal.vue
- ExternalMemoryViewer (can optionally render remote graph?)

### 3. Data Flow

**On neuron click:**
1. Detect if `type === "memory-reference"`
2. Extract attributes: `target_memory`, `fingerprint_url`, `nodes_url`, `synapses_url`
3. Fetch fingerprint.json from external memory (CORS consideration)
4. Display in sidebar
5. Optionally: load external nodes.json + synapses.json for inspection

**CORS Note:** May need CORS headers on deployed site or proxy through GitHub raw URLs

### 4. Local Testing Data

**Add test memory-reference neuron:**
```json
{
  "id": "memory-link-paul",
  "label": "Memory Link: Paul",
  "category": "foundation",
  "frequency": 99,
  "attributes": {
    "type": "memory-reference",
    "target_memory": "https://paulvisciano.github.io/memory/",
    "memory_owner": "paul",
    "fingerprint_url": "https://paulvisciano.github.io/memory/data/fingerprint.json",
    "nodes_url": "https://paulvisciano.github.io/memory/data/nodes.json",
    "synapses_url": "https://paulvisciano.github.io/memory/data/synapses.json"
  }
}
```

Already present in nodes.json. Just needs visual treatment.

---

## Implementation Checklist

### Phase 1: Visual Distinction (Priority 1)

- [ ] Identify neuron rendering code (likely in 3D visualization component)
- [ ] Add type check: if `neuron.type === "memory-reference"`
- [ ] Apply CSS class `.neuron-memory-link` with:
  - [ ] Special color (#f59e0b or similar)
  - [ ] Glow/pulse effect (CSS animation)
  - [ ] Icon overlay (🔗 or similar)
  - [ ] Label: show `memory_owner` if available
- [ ] Add hover tooltip showing memory owner + target URL
- [ ] Test with existing "memory-link-paul" neuron

### Phase 2: Click Handler & Sidebar (Priority 1)

- [ ] Add click event listener to memory-reference neurons
- [ ] Create MemoryLinkSidebar component with:
  - [ ] Header: "Connected Mind: [Owner]"
  - [ ] Memory URL display (clickable)
  - [ ] Fingerprint hash display
  - [ ] "Explore Memory" button (opens in new tab)
  - [ ] Close button (X) to hide sidebar
- [ ] Style sidebar with:
  - [ ] Slide-in animation from right
  - [ ] Semi-transparent overlay
  - [ ] Clean typography + spacing
- [ ] Test opening/closing on click

### Phase 3: External Memory Stats (Priority 2)

- [ ] Fetch fingerprint.json from `fingerprint_url`
- [ ] Extract neuron count + synapse count
- [ ] Display in sidebar: "Connected Mind has X neurons, Y synapses"
- [ ] Error handling: if CORS fails, show "Unable to fetch stats" gracefully

### Phase 4: Optional - Load Remote Graph (Priority 3)

- [ ] Add "Load Local Copy" button
- [ ] Fetch nodes.json + synapses.json from external memory
- [ ] Option 1: Display in sidebar as text/JSON viewer
- [ ] Option 2: Load into 3D view as separate layer/toggle
- [ ] Sync button: if user wants to merge/compare graphs

---

## Files to Modify

### 1. Main Visualization: `neural-mind/index.html`

**Location:** `/neural-mind/index.html` (all-in-one HTML + JS)

**Current node rendering (lines ~550-600):**
```javascript
nodes = rawNodes.map((n, idx) => {
    const angle = (idx / rawNodes.length) * Math.PI * 2;
    const radius = 280 + Math.random() * 220;
    // ...
    const color = categoryColors[n.category] || n.attributes?.color || '#00ffff';
    return {
        id: idx,
        idKey: n.id,
        name: n.label,
        type: n.category,  // <-- CHANGE: also capture n.attributes.type
        x, y, z,
        vx: 0, vy: 0, vz: 0,
        size,
        glow,
        color,
        freq: n.frequency,
        desc: n.attributes?.description || ''
        // ADD: memoryRef: n.attributes?.target_memory (if memory-reference)
    };
});
```

**What to change:**
```javascript
// BEFORE:
type: n.category,

// AFTER:
type: n.attributes?.type || n.category,  // Check for memory-reference type first
memoryRef: n.attributes?.type === 'memory-reference' ? n.attributes : null,
```

**Node rendering function (find "Draw nodes with glow"):**
```javascript
// EXISTING CODE (around line 800+):
// Draw glow
ctx.fillStyle = nodeGlowColor;
ctx.beginPath();
ctx.arc(p.x, p.y, p.scale * n.glow, 0, Math.PI * 2);
ctx.fill();

// MODIFY: Add memory-reference handling
if (n.memoryRef) {
    // Special glow for memory-reference nodes: gold/amber + pulse
    ctx.fillStyle = `rgba(245, 158, 11, ${0.3 + Math.sin(time * 0.05) * 0.2})`;  // Gold with pulse
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.scale * n.glow * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Add link icon badge
    ctx.font = `bold ${p.scale * 8}px Arial`;
    ctx.fillStyle = '#f59e0b';  // Gold
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔗', p.x, p.y - p.scale * (n.size + 4));  // Badge above neuron
}

// Draw core node
ctx.fillStyle = n.color;
ctx.beginPath();
ctx.arc(p.x, p.y, p.scale * n.size, 0, Math.PI * 2);
ctx.fill();
```

**Click handler (find "canvas.addEventListener('click')"):**
```javascript
// EXISTING:
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    // ... find clicked node ...
    showNodeDetails(clickedNode);
});

// MODIFY: Add memory-reference click handling
if (clickedNode.memoryRef) {
    showMemoryLinkSidebar(clickedNode.memoryRef);
} else {
    showNodeDetails(clickedNode);
}
```

### 2. Node Details Panel: Update `showNodeDetails()` function

**Current code (around line 1100):**
```javascript
function showNodeDetails(nodeIndex) {
    // ... existing code ...
    document.getElementById('detailPanel').innerHTML = `
        <div class="detail-title">${node.name}</div>
        <div class="detail-desc">${node.desc}</div>
    `;
}
```

**Add memory-reference rendering:**
```javascript
if (node.memoryRef) {
    // Show special memory-link details instead
    document.getElementById('detailPanel').innerHTML = `
        <div class="detail-title">🔗 ${node.memoryRef.memory_owner}'s Memory</div>
        <div class="detail-desc">Connected Mind</div>
        <hr>
        <p><strong>Memory URL:</strong></p>
        <p><a href="${node.memoryRef.target_memory}" target="_blank" style="color: #f59e0b;">
            ${node.memoryRef.target_memory}
        </a></p>
        <p><strong>Fingerprint Hash:</strong></p>
        <code style="word-break: break-all; font-size: 10px;">${node.memoryRef.memory_owner}</code>
        <hr>
        <button onclick="loadExternalMemoryStats('${node.memoryRef.fingerprint_url}')">
            📊 Load Stats
        </button>
        <button onclick="window.open('${node.memoryRef.target_memory}', '_blank')">
            🧠 Explore Memory
        </button>
    `;
}
```

### 3. New Function: `loadExternalMemoryStats()`

**Add to `neural-mind/index.html` (after showNodeDetails function):**
```javascript
async function loadExternalMemoryStats(fingerprintUrl) {
    try {
        const response = await fetch(fingerprintUrl);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        const fingerprint = await response.json();
        
        // Display stats in detail panel
        const stats = document.getElementById('detailPanel');
        const statsHtml = `
            <div class="detail-title">📊 Connected Stats</div>
            <hr>
            <p><strong>Neurons:</strong> ${fingerprint.neurons}</p>
            <p><strong>Synapses:</strong> ${fingerprint.synapses}</p>
            <p><strong>Hash:</strong> <code style="font-size: 9px;">${fingerprint.hash.substring(0, 16)}...</code></p>
        `;
        stats.innerHTML = stats.innerHTML + statsHtml;
    } catch (e) {
        console.error('Failed to load external stats:', e);
        alert('Unable to fetch connected mind stats. Check browser console.');
    }
}
```

### 4. Data Structure Update

**In nodes.json, the "memory-link-paul" neuron already exists:**
```json
{
  "id": "memory-link-paul",
  "label": "Memory Link: Paul",
  "category": "foundation",
  "frequency": 99,
  "attributes": {
    "type": "memory-reference",
    "target_memory": "https://paulvisciano.github.io/memory/",
    "memory_owner": "paul",
    "fingerprint_url": "https://paulvisciano.github.io/memory/data/fingerprint.json",
    "nodes_url": "https://paulvisciano.github.io/memory/data/nodes.json",
    "synapses_url": "https://paulvisciano.github.io/memory/data/synapses.json"
  }
}
```

**No changes needed.** Data structure is correct.

### 5. CSS Styling

**Add to `<style>` section of `neural-mind/index.html`:**
```css
/* Memory-reference node styling */
.neuron-memory-link {
    filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.8));
    animation: pulse-gold 2s ease-in-out infinite;
}

@keyframes pulse-gold {
    0%, 100% {
        opacity: 0.9;
        filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6));
    }
    50% {
        opacity: 1;
        filter: drop-shadow(0 0 16px rgba(245, 158, 11, 1));
    }
}

/* Sidebar for memory link details */
.memory-link-sidebar {
    position: fixed;
    right: 0;
    top: 50px;
    width: 320px;
    height: calc(100vh - 50px);
    background: rgba(15, 26, 48, 0.95);
    border-left: 2px solid rgba(245, 158, 11, 0.6);
    padding: 16px;
    overflow-y: auto;
    z-index: 15;
    animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
}

.memory-link-sidebar h3 {
    color: #f59e0b;
    margin-bottom: 12px;
}

.memory-link-sidebar a {
    color: #f59e0b;
    text-decoration: underline;
}
```

---

## Acceptance Criteria

✅ `memory-link-paul` neuron renders with gold color (#f59e0b)  
✅ Neuron has pulsing glow (amplitude: sin(time * 0.05) * 0.2)  
✅ Neuron displays link icon badge (🔗) above it  
✅ Click on memory-link neuron triggers `showMemoryLinkSidebar()` (not `showNodeDetails()`)  
✅ Sidebar displays:
  - Header: "🔗 paul's Memory"
  - Memory URL: https://paulvisciano.github.io/memory/ (clickable)
  - Fingerprint hash: first 16 chars
  - "📊 Load Stats" button (fetches fingerprint.json)
  - "🧠 Explore Memory" button (opens URL in new tab)
✅ "Load Stats" displays: neurons count (170), synapses count (360), full hash  
✅ Sidebar closes with X button or by clicking canvas  
✅ Console shows: "✅ Loaded 170 neurons and 360 synapses" (no errors)  
✅ CORS-safe: uses GitHub raw URLs with `?t=Date.now()` cache-busting  
✅ Works with existing "memory-link-paul" neuron in nodes.json  
✅ Scalable: adding more memory-reference neurons auto-renders with same logic

---

## Concrete Testing Workflow

### 1. **Visual Verification** (no code needed, just look)

```bash
# Open in browser
# URL: https://paulvisciano.github.io/neural-mind/
# Look for: Gold glowing neuron labeled "Memory Link: Paul"
# Should glow with pulse effect
# Should show 🔗 icon above it
```

### 2. **Click & Sidebar Test**

```javascript
// Expected behavior:
// 1. Click the "Memory Link: Paul" neuron
// 2. Right sidebar slides in with gold border
// 3. Shows: "🔗 paul's Memory"
// 4. Shows URL: https://paulvisciano.github.io/memory/
// 5. Two buttons: "📊 Load Stats" and "🧠 Explore Memory"
```

### 3. **Load Stats Test**

```javascript
// Click "📊 Load Stats"
// Expected console: no errors
// Expected sidebar update:
// - Neurons: 170
// - Synapses: 360
// - Hash: 4f08cd8687e0c0... (from /memory/data/fingerprint.json)
```

### 4. **External Navigation**

```javascript
// Click "🧠 Explore Memory"
// Expected: https://paulvisciano.github.io/memory/ opens in new tab
// Should show Paul's neural graph visualization (separate from Jarvis's)
```

### 5. **Error Handling**

```javascript
// Test with bad URL in browser console:
// > loadExternalMemoryStats('https://bad-url.com/fingerprint.json')
// Expected: Alert shows "Unable to fetch connected mind stats"
// No crash, sidebar still visible
```

### 6. **Scalability Test**

```json
// Add another memory-reference neuron to nodes.json:
{
  "id": "memory-link-alice",
  "label": "Memory Link: Alice",
  "category": "foundation",
  "attributes": {
    "type": "memory-reference",
    "target_memory": "https://alice-example.com/memory/",
    "memory_owner": "alice",
    "fingerprint_url": "https://alice-example.com/memory/data/fingerprint.json",
    "nodes_url": "https://alice-example.com/memory/data/nodes.json",
    "synapses_url": "https://alice-example.com/memory/data/synapses.json"
  }
}

// Expected: Alice neuron also renders gold + pulsing + clickable
// No hardcoding of Paul — logic works for any memory-reference type
```

## Files Modified Checklist

- [ ] `/neural-mind/index.html` — Node rendering logic (line ~550, 800, 1100+)
- [ ] `/neural-mind/index.html` — Click handler for memory-references
- [ ] `/neural-mind/index.html` — New `loadExternalMemoryStats()` function
- [ ] `/neural-mind/index.html` — CSS for `.neuron-memory-link` and sidebar animations
- [ ] **No changes:** `/claw/memory/data/nodes.json` (already has "memory-link-paul")

## Code Locations (Specific Line References)

**In `neural-mind/index.html`:**

1. **Node mapping** (~line 550): Change `type: n.category` → `type: n.attributes?.type || n.category`
2. **Node rendering** (~line 800): Add memory-ref glow before main node draw
3. **Click handler** (~line 950): Check `if (clickedNode.memoryRef)` before showing details
4. **showNodeDetails()** (~line 1100): Add memory-ref rendering block
5. **New function** (~line 1200): Add `loadExternalMemoryStats()` function
6. **CSS** (~line 300): Add `.neuron-memory-link` and sidebar animations

---

## Notes for Cursor

- This is Phase 1 of the distributed consciousness network
- Memory-reference neurons are the "portals" between independent minds
- Keep it simple: visual + clickable. Loading remote graphs is Phase 2
- The "memory-link-paul" neuron already exists in nodes.json (line: check current file)
- When other minds connect, they'll add more memory-reference neurons to this graph
- CORS may be a blocker—consider GitHub raw URLs or proxy if needed

---

## Related Context

- **VISION.md:** Full distributed consciousness network vision (Phase 1)
- **nodes.json:** Already contains "memory-link-paul" neuron (line: search for it)
- **Neural graph visualization:** Already renders 170 neurons; just needs type handling for memory-reference
- **Earlier session:** Discussed making memory links "special" with portal sidebar

Let's make the invisible visible. Start with Phase 1 (visual distinction), move to Phase 2 (sidebar) if feasible in one session.
