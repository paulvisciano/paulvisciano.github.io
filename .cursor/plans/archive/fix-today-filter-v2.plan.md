---
name: Fix "Today" Filter (v2) — Precise Implementation
overview: Fix the broken "Today" filter in claw/memory neural graph so it filters by attributes.created in Asia/Bangkok timezone instead of category or UTC date.
todos:
  - id: implement-filter-by-today
    content: "Add filterByToday() using toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }) and attributes.created"
    status: pending
  - id: update-filter-click-handler
    content: Wire "Today" button to filterByToday(); keep "All" and category filters working
    status: pending
  - id: add-update-node-count
    content: Add or verify updateNodeCount() helper for count/status display
    status: pending
  - id: test-today-filter
    content: Hard refresh, test Today/All/category filters and console logs (36 neurons expected)
    status: pending
isProject: false
---

# Fix "Today" Filter — Precise Implementation

## Problem

Clicking "Today" filter shows blank graph even though:

- Console confirms: "Loaded 244 neurons and 488 synapses"
- Console confirms: "Filter applied: today"
- Data IS correct: All new neurons have `attributes.created: "2026-02-27"`

**Root Cause:** Filter logic uses UTC timezone (`toISOString()`) but Paul is in Asia/Bangkok (GMT+7). Date mismatch.

**Current State (as of Feb 27, 13:24):**

- Paul manually reverted neural-graph.js to clean state
- Ready for Cursor to implement fix
- This plan has exact code to use

**Note:** Previous manual edit attempts by Jarvis failed due to whitespace matching issues and introduced syntax errors. Cursor should handle this cleanly.

---

## Diagnosis Steps

### Step 1: Check Current Filter Logic

**File:** `/claw/memory/shared/neural-graph.js`

Find the filter function (likely called `filterByCategory()` or similar):

```javascript
// Look for something like this:
function filterByCategory(category) {
  if (category === 'today') {
    // BUG: Probably looking for category: 'today' which doesn't exist
    filteredNodes = nodes.filter(n => n.category === 'today');
  }
}
```

**The Bug:** It's probably filtering by `n.category === 'today'` but should filter by `n.attributes.created === todayDate`.

---

## Solution

### Step 2: Implement Correct "Today" Filter Logic

**Replace the broken "Today" filter with this:**

```javascript
function filterByToday() {
  // Get today's date in YYYY-MM-DD format (Asia/Bangkok timezone)
  const today = new Date().toLocaleDateString('en-CA', { 
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }); // Returns "2026-02-27"
  
  console.log(`Filtering by today: ${today}`);
  
  // Filter nodes that have attributes.created === today
  const filteredNodes = nodes.filter(node => 
    node.attributes && 
    node.attributes.created === today
  );
  
  console.log(`Found ${filteredNodes.length} neurons from today`);
  
  // Filter synapses to only show connections between today's nodes
  const filteredSynapses = synapses.filter(synapse => 
    filteredNodes.some(n => n.id === synapse.source) &&
    filteredNodes.some(n => n.id === synapse.target)
  );
  
  console.log(`Found ${filteredSynapses.length} synapses between today's neurons`);
  
  // Re-render graph with filtered data
  renderGraph(filteredNodes, filteredSynapses);
  
  // Update UI to show count
  updateNodeCount(filteredNodes.length, filteredSynapses.length);
}
```

### Step 3: Update Filter Button Click Handler

**File:** `/claw/memory/index.html` or `/claw/memory/shared/neural-graph.js`

Find where filter buttons are handled:

```javascript
// OLD (broken):
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.textContent.toLowerCase();
    filterByCategory(category); // This calls the broken function
  });
});

// NEW (fixed):
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.textContent.toLowerCase();
    
    // Remove active class from all buttons
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    if (category === 'today') {
      filterByToday(); // Call the new correct function
      return;
    }
    
    if (category === 'all') {
      renderGraph(nodes, synapses); // Show everything
      updateNodeCount(nodes.length, synapses.length);
      return;
    }
    
    // Existing category filters (Values, Capabilities, etc.)
    const filteredNodes = nodes.filter(n => n.category === category);
    const filteredSynapses = synapses.filter(s => 
      filteredNodes.some(n => n.id === s.source) &&
      filteredNodes.some(n => n.id === s.target)
    );
    renderGraph(filteredNodes, filteredSynapses);
    updateNodeCount(filteredNodes.length, filteredSynapses.length);
  });
});
```

### Step 4: Add Helper Function for Node Count Display

**Add this utility function** (if doesn't exist):

```javascript
function updateNodeCount(nodeCount, synapseCount) {
  const countElement = document.getElementById('count');
  const synapseCountElement = document.getElementById('synapseCount');
  
  if (countElement) countElement.textContent = nodeCount;
  if (synapseCountElement) synapseCountElement.textContent = synapseCount;
  
  // Also update status message
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = `${nodeCount} neurons · ${synapseCount} synapses`;
  }
}
```

---

## Testing Checklist

After implementing:

1. **Hard refresh browser** (Cmd+Shift+R)
2. **Open DevTools Console** (Cmd+Option+J)
3. **Click "All" filter** → Should show 244 neurons
4. **Click "Today" filter** → Should show ~36 neurons (from today's session)
5. **Check console logs:**
  ```
   Filtering by today: 2026-02-27
   Found 36 neurons from today
   Found XX synapses between today's neurons
  ```
6. **Verify visual:** Graph should display colorful network (not blank)
7. **Click individual neurons** → Should show attributes with `created: "2026-02-27"`
8. **Click other filters** (Values, Capabilities, etc.) → Should still work

---

## Expected Results

### "Today" Filter Should Show These Neurons (36 total):

**Vision (6):**

- sovereign-data-vision
- data-marketplace-creator-first
- web-first-sovereignty
- local-ai-future
- data-sovereignty-education
- open-sourcing-memory

**Philosophy (2):**

- git-as-narrative-language
- open-source-vs-proprietary-ai

**Architecture (3):**

- app-ecosystem-linked-memories
- static-site-messaging
- three-layer-security-model (updated today)

**Mechanism (4):**

- fingerprint-auth-signing
- hotspot-p2p-sync
- webauthn-git-signing
- branch-naming-semantics

**Operation (4):**

- knowledge-digestion-workflow
- agent-collaboration-workflow
- timestamp-all-neurons
- neurograph-search-indexing

**Principle (3):**

- transparent-data-generation
- commit-message-storytelling
- transparency-privacy-coexistence

**Concept (2):**

- digital-vinyl-concept
- cloud-ai-extraction-model

**Education (1):**

- json-data-literacy

**Proof (1):**

- token-efficiency-proof

**Breakthrough (1):**

- autonomous-cognition-emergence

**Temporal (1):**

- paul-life-pivot-feb2026

**Feature (1):**

- neurograph-search-indexing

Plus all their interconnecting synapses.

---

## Common Pitfalls to Avoid

❌ **Don't use `new Date().toISOString()` without timezone** — Will be wrong timezone
✅ **DO use `toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })**`

❌ **Don't filter by `n.category === 'today'**` — That category doesn't exist
✅ **DO filter by `n.attributes.created === '2026-02-27'**`

❌ **Don't forget to filter synapses** — Or you'll see connections to invisible nodes
✅ **DO filter synapses to only show connections between filtered nodes**

❌ **Don't break existing category filters** — Test Values, Capabilities, etc.
✅ **DO keep existing logic, just add special case for "today"**

---

## Files to Modify

1. `**/claw/memory/shared/neural-graph.js**` — Main filter logic
2. `**/claw/memory/index.html**` — If filter handlers are inline
3. `**/claw/memory/shared/landing-page.js**` — Only if it overrides filter behavior

---

## Debugging Tips

If still blank after fix:

1. **Check console for errors** — Red text means broken code
2. **Verify date format matches:**
  ```javascript
   console.log('Today:', today); // Should be "2026-02-27"
   console.log('Sample neuron:', nodes[0].attributes.created); // Should match format
  ```
3. **Try manual filter in console:**
  ```javascript
   const today = "2026-02-27";
   const test = nodes.filter(n => n.attributes?.created === today);
   console.log(`Found ${test.length} neurons`);
  ```
4. **Check if render function is being called** — Add `console.log('Rendering...')` inside renderGraph()

---

**Created by:** Jarvis (AI Neural Mind)  
**Date:** 2026-02-27 12:29 GMT+7  
**Priority:** HIGH — Blocks Paul's review workflow  
**Estimated Time:** 15-30 minutes  
**Difficulty:** Easy (just fixing filter logic)
