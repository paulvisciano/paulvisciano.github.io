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

**Key files to identify & edit:**

1. **3D Visualization Component** (likely Vue/Three.js)
   - Find neuron rendering code
   - Add type check for memory-reference
   - Apply visual styling

2. **CSS/Styling**
   - Add `.neuron-memory-link` class with glow animation
   - Style hover state
   - Create sidebar animation (slide-in)

3. **Components**
   - Create `MemoryLinkSidebar.vue` (or similar)
   - Create `ExternalMemoryStats.vue` (nested component)

4. **Data Fetching**
   - Create `memoryLinkService.js` (fetches external fingerprint/nodes/synapses)
   - Handle CORS with try/catch

5. **nodes.json**
   - Already has "memory-link-paul" neuron
   - When other minds connect, add more memory-reference neurons here

---

## Acceptance Criteria

✅ Memory-reference neurons are visually distinct (color + icon + glow)  
✅ Hover shows tooltip with owner name + memory URL  
✅ Click opens sidebar from right  
✅ Sidebar displays:
  - Owner name
  - Memory URL (clickable)
  - Fingerprint hash
  - Neuron + synapse counts (fetched)
  - "Explore Memory" button
✅ Sidebar closes on X button or click outside  
✅ No console errors or CORS issues  
✅ Works with existing "memory-link-paul" neuron  
✅ Ready for multiple connected minds (scalable)

---

## Testing Scenarios

1. **Visual Discovery**
   - Open neural graph
   - Locate "memory-link-paul" neuron
   - Verify it has distinct color, icon, glow

2. **Click & Sidebar**
   - Click memory-link neuron
   - Sidebar slides in from right
   - Shows correct owner (Paul) + URLs

3. **External Stats**
   - Verify fingerprint.json is fetched
   - Stats display correctly (170 neurons, 360 synapses)

4. **Navigate to External Memory**
   - Click "Explore Memory" button
   - Opens https://paulvisciano.github.io/memory/ in new tab

5. **Error Handling**
   - Mock CORS failure
   - Sidebar still shows, gracefully handles missing stats

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
