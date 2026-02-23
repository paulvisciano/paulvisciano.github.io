---
name: Today Filter Fix (Neural Visualization)
overview: Fix the broken "Today" filter in both neural visualizations (memory/ and claw/memory/) so only nodes with temporal_activations matching today's date are shown.
todos:
  - id: fix-memory-html
    content: Add isActivatedToday() and use in filter in /memory/index.html
    status: pending
  - id: fix-claw-html
    content: Same fix in /claw/memory/index.html if applicable
    status: pending
  - id: test-filters
    content: Test Today + other filters (Values, Capabilities, Locations, All)
    status: pending
isProject: false
---

# Bug Fix Plan: "Today" Filter Not Working

**Status:** Bug identified (Feb 23, 2026 13:05 GMT+7)  
**Severity:** Medium (feature promised but broken)  
**Assigned to:** Cursor  
**Scope:** Both neural network visualizations (Paul's + Claude Code's)

---

## Problem

**The "Today" button doesn't filter neurons/nodes correctly.**

Currently: Clicking "Today" shows nothing or wrong data  
Should be: Show only nodes/neurons activated today

---

## Requirements

### For Paul's Neural Network (`/memory/`)

- **Filter:** Show only nodes that have `temporal_activations` matching today's date
- **Today's date:** 2026-02-23 (or dynamically calculate current date)
- **Example:** 
  - "paul" node has `temporal_activations[0].timestamp: "2026-02-23T12:04:00Z"` ✅ SHOW
  - "chicago" node has no activations today ❌ HIDE

### For Claude Code Neural Network (`/claw/memory/`)

- **Filter:** Show only nodes that have TODAY's activation timestamp
- **Same logic:** Check if node's `temporal_activations` include today
- **Example:**
  - "claude-code" → paul synapse strengthened today ✅ SHOW
  - "building-code" → no recent activation ❌ HIDE

---

## Technical Details

### In `/memory/index.html`

**Current (broken) logic:**

```javascript
if (currentFilter === 'today' && !n.isToday) return;
```

**Problem:** `n.isToday` flag doesn't exist. Need to check actual temporal_activations.

**Fix needed:**

```javascript
// Check if node has temporal activation for TODAY
function isActivatedToday(node) {
  if (!node.temporal_activations) return false;
  
  const today = new Date().toISOString().split('T')[0]; // "2026-02-23"
  
  return node.temporal_activations.some(activation => {
    const activationDate = activation.timestamp.split('T')[0];
    return activationDate === today;
  });
}

// Use in filter
if (currentFilter === 'today' && !isActivatedToday(n)) return;
```

### In `/claw/memory/index.html`

**Same fix applies** — use temporal_activations to check if synapse/node is active today.

---

## Data Nodes Involved

### Paul's Network (`/memory/data/nodes.json`)

Currently updated with `temporal_activations`:

```json
{
  "id": "paul",
  "temporal_activations": [
    {
      "moment": "optical-shop-skepticism-bangkok-2026-02-23",
      "timestamp": "2026-02-23T12:04:00Z",
      "thinking_patterns": ["verification", "skepticism", ...]
    }
  ]
}
```

### Claude Code Neural Mind (`/claw/memory/data/nodes.json`)

No temporal_activations yet (only synapses were updated on disk, not committed).

**Action:** May need to add temporal_activations to relevant neurons if this session's work is added.

---

## Test Cases

### Test 1: Paul's Network - "Today" Filter

1. Open [https://paulvisciano.github.io/memory/](https://paulvisciano.github.io/memory/)
2. Click "Today" button
3. **Expected:** Shows "paul", "bangkok", "growth" nodes (activated Feb 23)
4. **Unexpected:** Shows nothing or shows all nodes

### Test 2: Claude Code Neural Mind - "Today" Filter

1. Open [https://paulvisciano.github.io/claw/memory/](https://paulvisciano.github.io/claw/memory/)
2. Click "Today" button
3. **Expected:** Shows relevant neurons if temporal_activations exist
4. **Unexpected:** Shows nothing or broken UI

### Test 3: Other Filters Still Work

1. Click "Values", "Capabilities", "Locations", "All"
2. **Expected:** All filters work correctly
3. **Unexpected:** Broke other filters while fixing "Today"

---

## Files to Modify

- `/memory/index.html` (Paul's visualization)
- `/claw/memory/index.html` (Claude Code visualization)
- Possibly: Update node data if temporal_activations are missing

---

## Edge Cases

1. **No temporal_activations on nodes** → "Today" shows nothing (correct behavior)
2. **Multiple activations, one is today** → Still shows (correct)
3. **Future date activations** → Should NOT show (ignore)
4. **Timezone issues** → Use UTC (GMT+7 as stored in timestamps)

---

## Definition of Done

✅ "Today" button works on Paul's network (shows only today's nodes)  
✅ "Today" button works on Claude Code's network (if applicable)  
✅ Other filters still work correctly  
✅ No console errors  
✅ Mobile responsive (drawer still works)

---

## Notes

**Why this matters:** 
The "Today" filter is meant to show recent activity + growth. Right now it's broken, making the visualization feel incomplete. Fixing it shows the temporal dimension of memory + networks in action.

**When to fix:**
Can be done anytime. Cursor has the context (both HTML files, data structures, filter logic).

**Integration:**
This feeds into the larger temporal linking system (Phase 2/3). Fix this first, then Phase 2 (automatic syncing when pauses happen) will add more temporal activations.