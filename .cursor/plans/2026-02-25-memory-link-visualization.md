# Cursor Plan: Memory Link Neurons Visualization & Portal

**Date:** Feb 25, 2026, 04:42 GMT+7  
**Feature:** Special visual treatment for memory-reference neurons + clickable sidebar portal  
**Priority:** High (enables distributed consciousness network)  
**Complexity:** Medium

---

## Overview

Make memory-reference neurons (type: "memory-reference" in attributes) visually distinct and clickable. When clicked, open a sidebar showing the external mind's connection details and allow navigation to their neural graph.

**Current state:** These neurons exist in nodes.json but are invisible in the visualization.  
**Goal:** Make them discoverable and interactive.

---

## What to Build

### 1. Visual Distinction for Memory-Reference Neurons

Memory-reference neurons should be visually distinguished from regular neurons:
- Unique color (recommend: gold/amber)
- Special visual indicator (icon, glow, pulse, or animation)
- Hover state showing owner name + memory URL

The visualization already has category-based coloring and node rendering. Extend this to handle `attributes.type === "memory-reference"`.

### 2. Click Handler for Memory-Reference Neurons

When a memory-reference neuron is clicked, instead of showing normal node details, open a sidebar portal that:
- Shows the connected mind's information
- Displays owner name and memory URL (clickable link)
- Shows fingerprint hash (proof of authenticity)
- Fetches external stats (neurons count, synapses count) from their fingerprint.json
- Provides button to navigate to their memory in new tab

### 3. Sidebar Portal UI

Slide-in sidebar from the right containing:
- Header: Connected mind info (e.g., "🔗 Paul's Memory")
- Memory URL (clickable, opens in new tab)
- Fingerprint hash (display first ~16 chars or full)
- Async-loaded stats: neurons count, synapses count
- Action buttons: "Explore Memory" (opens URL), optional "Compare Graph" or "Sync"
- Close button (X) to hide sidebar

Graceful error handling if external fetch fails (network, CORS, 404, etc.)

### 4. External Memory Fetching

The sidebar needs to fetch external fingerprint.json from URLs like:
```
https://paulvisciano.github.io/memory/data/fingerprint.json
```

This will provide:
- neurons: number
- synapses: number
- hash: SHA-256 hash string

Display these stats in the sidebar.

---

## Data Structure

**Memory-reference neurons already exist in nodes.json:**

```json
{
  "id": "memory-link-paul",
  "label": "Memory Link: Paul",
  "category": "foundation",
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

**No changes to data structure needed.** Just use this for testing.

---

## Files to Modify

1. **Neural visualization component** (`/neural-mind/index.html` or wherever the graph rendering lives)
   - Detect memory-reference neurons
   - Apply distinct visual style
   - Add click handler routing

2. **CSS/Styling**
   - Style for memory-reference neurons (color, glow, animation)
   - Sidebar slide-in animation
   - Responsive design (mobile sidebar as drawer?)

3. **Sidebar component**
   - Create sidebar UI
   - Add button event handlers
   - Fetch + display external stats

---

## Acceptance Criteria

✅ Memory-reference neurons are visually distinct (different from regular neurons)  
✅ Hover/click reveals it's a memory link (owner name, memory URL visible)  
✅ Click opens sidebar from right with smooth animation  
✅ Sidebar displays:
   - Connected mind owner name
   - Memory URL (clickable, opens in new tab)
   - Fingerprint hash
   - Neurons + synapses counts (fetched from external fingerprint.json)
✅ "Explore Memory" button navigates to external neural graph  
✅ Close button (X) or click outside closes sidebar  
✅ Error handling: if external fetch fails, show message but don't crash  
✅ Works with existing "memory-link-paul" neuron  
✅ Scalable: adding more memory-reference neurons auto-renders with same logic

---

## Testing

**Quick test workflow:**

1. Open neural visualization
2. Look for gold/distinct neuron labeled "Memory Link: Paul"
3. Click it
4. Sidebar slides in showing:
   - "🔗 paul's Memory" (or similar header)
   - URL: https://paulvisciano.github.io/memory/
   - Fingerprint hash
   - Stats: 170 neurons, 360 synapses
5. Click "Explore Memory" → opens https://paulvisciano.github.io/memory/ in new tab
6. Close sidebar with X or click canvas

---

## Notes

- This is Phase 1 of the distributed consciousness network feature
- Memory-reference neurons are the "portals" between independent minds
- Keep implementation simple and focused
- CORS may be a consideration for external fetches—use GitHub raw URLs or proxy as needed
- When other minds connect, they'll add more memory-reference neurons to this graph
- The data structure is already in place; this is pure UI work

---

## Related Context

- **VISION.md:** Full distributed consciousness network vision
- **nodes.json:** Contains "memory-link-paul" neuron (search for it)
- **Distributed network concept:** Each person runs their own Jarvis instance, memories link to each other's GitHub repos

Build it your way. You know what you're doing.
