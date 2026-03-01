# Cursor Brief: Build the Memory Browser (Phase 1)

**Date:** March 1, 2026  
**Project:** First-Person Neural Memory Navigation  
**Priority:** Critical (core product identity shift: **Memory Browser**, not graph viewer)  
**Timeline:** Target completion within 1 week  

---

## The Vision

**We are not building a graph visualization tool.** We are building a **Memory Browser** — like Chrome/Firefox, but for navigating your own memories instead of web pages.

**Key insight:** Memories aren't maps. They're places. You don't observe a place — you walk through it.

---

## Visual Target

**Reference image:** See attached mockup (`2026-03-01-120700-memory-browser-vision-final.jpg`)

**What you're seeing:**
- **Central golden orb** = current neuron (where "you" are)
- **Cyan circular lens** = viewport boundary (~30% screen width)
- **Orbiting thumbnails** = actual memory assets (photos, voice notes, transcripts, comics)
- **Connected nodes** = related memories (visible inside lens, faded outside)
- **Deep space background** = rest of the graph (atmospheric context)
- **Minimal HUD** = node name (top), filter pills (bottom-left), toggle icons (bottom-right)

**This is the exact target.** Build toward this visual.

---

## What Makes This a "Browser"

| Web Browser | Memory Browser | Implementation Priority |
|-------------|----------------|------------------------|
| Web pages | Neurons (memories) | ✅ Core data structure exists |
| Hyperlinks | Synapses (connections) | ✅ Already in data |
| Click link → navigate | Click neuron → jump | **Phase 1** |
| Back/Forward buttons | Visit history stack | **Phase 1** |
| Embedded media (images/video) | Asset badges (audio/images/docs) | **Phase 1** |
| Bookmarks | Saved neurons | Phase 2 |
| Address bar search | Neuron search/jump | Phase 2 |
| Tabs | Multiple memory paths | Phase 4 |
| Restore last session | localStorage persistence | **Phase 1** |

---

## Phase 1 Scope (Build This Now)

### 1. Lens Rendering
- Circular viewport at screen center (30% screen width)
- Inside lens: current neuron + direct connections = crystal clear
- Outside lens: everything else = faded/blurred (opacity 0.15-0.3)
- Cyan glowing border (`rgba(77, 208, 225, 0.3)`)
- Smooth fade-in on enter (300ms)

### 2. Current Node as POV
- One node = "current" (where user is)
- Starting node logic:
  1. Most recent temporal node (by `attributes.created`)
  2. Fallback: highest frequency node
  3. Fallback: first node in dataset
- Only connections FROM current node are fully visible

### 3. Asset Badges (CRITICAL — This is the game-changer)
- Small circular thumbnails orbit current neuron (inside lens, near edge)
- **Badge types:**
  -  **Audio** — count of voice notes (click → play most recent or open playlist)
  - 🖼️ **Images** — count of photos (click → open lightbox gallery)
  - 📄 **Transcript** — indicates transcript exists (click → open modal)
  - 📚 **Comic/Learning** — derived content (click → open comic reader or learning doc)
- **Badge styling:**
  - Show actual thumbnail previews (not just icons) when possible
  - Semi-transparent background (`rgba(255,255,255,0.2)`)
  - Rounded corners (8px radius)
  - Hover: glow + scale to 1.1x
  - Click: smooth modal fade-in OR open in new tab
- **Positioning:**
  - Orbit evenly spaced around current neuron (~1.5x neuron radius)
  - Fade in after 500ms delay (don't overwhelm on jump)
  - Fade out when leaving node
- **Data source:** Scan `/memory/raw/YYYY-MM-DD/` folders for files linked to current node

### 4. Click-to-Jump Navigation
- Click/tap any visible neuron → set as new current node
- Smooth transition (300ms ease-in-out):
  - Camera moves to new node
  - Old connections fade out
  - New connections fade in
  - Asset badges update to show new node's assets
- Keyboard: `Enter` on focused node = jump

### 5. Toggle First/Third Person
- Toolbar button: 👁️ (third-person) ↔️ 🧍 (first-person)
- Keyboard shortcut: `F` key toggles
- Escape key: exit first-person → return to third-person
- Visual indicator: current node has glowing halo in third-person view
- State persists across page refresh (localStorage)

### 6. Navigation History (Browser Back/Forward)
- Track visited nodes: array of `{ nodeId, timestamp }` (max 50 entries)
- Toolbar buttons: ← (back), → (forward)
- Keyboard: `←` (back), `→` (forward)
- Gray out buttons when unavailable (start/end of history)
- Clear history button (optional)

### 7. State Persistence (localStorage)
```javascript
{
  "firstPersonView": true/false,
  "currentNodeId": "march-1-2026-comic-pipeline",
  "viewMode": "first-person" | "third-person",
  "navigationHistory": [...],
  "bookmarks": [], // Phase 2
  "lastVisit": "2026-03-01T12:00:00Z"
}
```
- Save on every change (jump, toggle, etc.)
- Restore on page load
- Fallback: use starting node logic if no saved state

---

## Files to Touch

**Primary:**
- `shared/neural-graph.js` — Main visualization logic, lens rendering, state management

**Secondary:**
- `index.html` — Add toolbar buttons (lens toggle, back/forward, asset modal container)
- `styles.css` (or inline styles) — Lens styles, transitions, badge styling, modal styles
- No schema changes needed (nodes.json/synapses.json already have what we need)

**Asset badge data:**
- Scan existing `/memory/raw/YYYY-MM-DD/` folder structure
- Match files to nodes by:
  - Date (temporal nodes)
  - Tags/keywords
  - Explicit links in narrative.md files
- Start simple: show ALL assets from same date as current node

---

## Acceptance Criteria (Must-Have for Phase 1)

- [ ] Toggle button works (click + `F` key + Escape)
- [ ] Lens renders correctly (clear inside, faded outside)
- [ ] Asset badges appear around current node (with actual thumbnails)
- [ ] Clicking asset badge opens media (audio plays, images show, etc.)
- [ ] Click-to-jump works with smooth transition
- [ ] Navigation history works (back/forward buttons + keyboard)
- [ ] State persists across page refresh
- [ ] Starting node logic selects appropriate entry point
- [ ] Works with existing filters (today/yesterday/thisweek/all)
- [ ] Maintains 60fps on modern desktop, 30fps+ on mobile

---

## Design Principles

### 1. Browser Conventions Over Graph Conventions
If Safari does it well, adapt it for memories. Examples:
- Back/forward buttons → navigation history
- Bookmarks → saved neurons
- Reader mode → pure focus mode (fade everything except current node)

### 2. Thumbnails Over Icons
Don't just show "🎤 Audio" — show a waveform preview or the actual photo from that voice note. Make it **recognizable**, not just categorical.

### 3. Smooth Transitions Always
No jarring snaps. Everything flows:
- Jump transitions: 300ms ease-in-out
- Badge fade-in: 500ms delay + 200ms fade
- Modal open: 150ms fade-in

### 4. Progressive Enhancement
- Low quality: opacity fade only (mobile default)
- Medium quality: soft blur (desktop default)
- High quality: true Gaussian blur + particle effects (optional)

---

## Performance Guardrails

- **Target FPS:** 60 on desktop, 30+ on mobile
- **Monitor:** Drop below threshold → auto-downgrade quality
- **Badge loading:** Lazy-load thumbnails (don't fetch all at once)
- **Modal optimization:** Reuse single modal DOM element (don't create/destroy)
- **Transition optimization:** Use CSS transforms + opacity (GPU-accelerated)

---

## Testing Checklist

### Functional Tests
- [ ] Toggle first/third person (all methods: button, F key, Escape)
- [ ] Click-to-jump transitions smoothly
- [ ] Asset badges appear with correct thumbnails
- [ ] Clicking audio badge plays sound
- [ ] Clicking image badge opens gallery
- [ ] Back/forward navigation works
- [ ] State persists across refresh
- [ ] Filters work in first-person mode

### Performance Tests
- [ ] 60fps on Chrome/Firefox/Safari (desktop)
- [ ] 30fps+ on iPhone 12+ / Android equivalent
- [ ] No memory leaks (test with DevTools)
- [ ] Smooth transitions at all zoom levels

### Edge Cases
- [ ] Node with 0 assets (no badges shown)
- [ ] Node with 50+ assets (badge overflow handling)
- [ ] Rapid clicking (spam jump requests)
- [ ] Browser back button interaction

---

## Success Metrics

**Quantitative:**
- Time to find specific memory: target -40% vs third-person
- Sessions per day: target +25% with improved UX
- Average session duration: target +50% with immersive exploration

**Qualitative:**
- "Feels like walking through memory, not analyzing a map"
- "I can access my actual memories without leaving the interface"
- "The thumbnails make it feel real — I recognize those moments"

---

## Related Files & Context

**Plan doc:** `.cursor/plans/first-person-memory-navigation.plan.md` (full spec with Phases 2-4)

**Existing codebase:**
- Visualization: `shared/neural-graph.js` (current third-person implementation)
- Data: `claw/memory/data/nodes.json` + `synapses.json`
- Live site: https://paulvisciano.github.io/claw/memory/

**Memory archive:**
- Location: `/memory/raw/YYYY-MM-DD/`
- Structure: `audio/`, `images/`, `transcript.md`, `narrative.md`
- Scan this folder to populate asset badges

**Vision mockups:**
- Final version: `memory/raw/2026-03-01/images/2026-03-01-120700-memory-browser-vision-final.jpg`
- Earlier iteration: `memory/raw/2026-03-01/images/2026-03-01-120200-first-person-vision-mockup.jpg`

---

## What NOT to Build (Yet)

**Phase 2+ features (do NOT implement now):**
- ❌ Rotation controls (arrow keys / two-finger rotate)
- ❌ 3D perspective / parallax effects
- ❌ Advanced zoom (depth of field)
- ❌ Search integration (auto-jump from search bar)
- ❌ Bookmarks UI
- ❌ Multi-user / shared graphs
- ❌ AR/VR modes

**Focus:** Nail Phase 1. Make the core loop (jump → see assets → click → relive) feel magical. Then expand.

---

## Getting Started Steps

1. **Read the full plan:** `.cursor/plans/first-person-memory-navigation.plan.md`
2. **Review existing code:** `shared/neural-graph.js` (understand current third-person implementation)
3. **Look at the vision mockup:** Attached image — this is the target
4. **Start with lens rendering:** Get the circular viewport working
5. **Add asset badges:** This is the critical differentiator — make it work early
6. **Implement jump navigation:** Click → smooth transition → new node
7. **Add persistence:** localStorage save/restore
8. **Test thoroughly:** All acceptance criteria above

---

## Questions?

If anything is unclear:
1. Check the full plan doc (`.cursor/plans/first-person-memory-navigation.plan.md`)
2. Review the vision mockup (attached)
3. Ask for clarification before implementing

**Remember:** We're building a **Memory Browser**, not a graph viewer. Every design decision should serve that identity.

---

**Let's build sci-fi.** 🧠✨
