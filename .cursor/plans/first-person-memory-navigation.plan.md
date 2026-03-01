---
name: ""
overview: ""
todos: []
isProject: false
---

# Plan: First-Person Memory Navigation (Enhanced)

**Date:** Mar 1, 2026  
**Feature:** First-person view mode for neural memory visualization  
**Source:** [Learning 15: First-Person Navigation](/claw/memory/raw/2026-02-24/learnings/15-first-person-memory-navigation.md)  
**Priority:** High (solves visualization scalability + improves exploration UX)  
**Complexity:** Medium–High (phased)

---

## Overview

**Current:** Third-person overhead view — zoom/pan the whole graph; you observe from outside.  
**Goal:** First-person mode — you *are* a neuron; you look out at connected memories and navigate by moving through relationships.

**Why:** With 148+ neurons and 418+ synapses, showing everything at once is cognitive overload. First-person shows only relevant connections per "room," scales to 1000+ neurons, and makes exploration feel like walking through a place instead of analyzing a diagram.

---

## Core Concepts


| Concept      | Description                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------ |
| **Lens**     | Circular view at screen center = your current neuron. Inside = clear; outside = blurred/ghosted. |
| **Movement** | Swipe/drag or trackpad = change POV (first-person camera), not pan the whole map.                |
| **Jump**     | Tap/click a visible neuron = jump to it; lens refocuses on new position.                         |
| **Zoom**     | Tighten/loosen focus (depth of field), not zoom the whole graph.                                 |
| **Rotation** | Turn the lens view to see different angles of the current node's connections (Phase 3).          |
| **History**  | Back/forward navigation through visited nodes (like browser history).                            |
| **Persist**  | Save view mode + current node in localStorage; restore on refresh.                               |


---

## Phased Implementation

### Phase 1 — Lens + Jump + Foundation (Now)

**Scope:** Fixed lens at center, blurred context, click-to-jump, toggle, state persistence. Build on existing visualization.

#### Core Features

- **Lens rendering**
  - Central circular "lens" (fixed at screen center, ~30% screen width).
  - Inside lens: current neuron highlighted, direct connections visible, synapse targets clear.
  - Outside lens: other neurons faint/blurred or ghosted; connections faded.
  - Optional: "pure focus" mode — fade outside to near-invisible.
- **Current node as POV**
  - Treat one node as "current" (starting node logic below).
  - Only connections from current node are fully visible inside lens.
- **Click-to-jump**
  - Tap/click a visible neuron (in or near lens) → set as new current node.
  - Lens refocuses (smooth transition, ~300ms ease-in-out) on new position.
  - New connections become visible; old ones fade.
- **Toggle UI**
  - Toolbar button: Eye icon (third-person) ↔ Person-in-circle icon (first-person).
  - Keyboard shortcut: `F` key toggles.
  - Escape key exits first-person back to third-person.
  - Visual indicator: Current node has glowing border/halo in third-person view.

#### State Persistence (Critical)

- **localStorage keys:**

```javascript
  {
    "firstPersonView": true/false,
    "currentNodeId": "march-1-2026-comic-pipeline",
    "viewMode": "first-person" | "third-person",
    "lastVisit": "2026-03-01T11:41:00Z"
  }
  

```

- **On load:** Check localStorage → restore view mode + current node.
- **On change:** Save to localStorage immediately.
- **Fallback:** If no saved state, use starting node logic.

#### Starting Node Logic

When entering first-person view (no saved state):

1. **Most recent temporal node** (filter by `category: "temporal"` + sort by `attributes.created` desc)
2. Fallback: **Highest frequency node** (`frequency` property)
3. Fallback: **First node in dataset**

#### Files to Touch

- Primary: `shared/neural-graph.js` (main visualization logic)
- Secondary: Add config section or constants for lens radius, blur strength, transition duration
- No schema changes needed

#### Acceptance Criteria

- Toggle button works (click + `F` key + Escape)
- Lens renders correctly (clear inside, faded outside)
- Click-to-jump works with smooth transition
- State persists across page refresh
- Starting node logic selects appropriate entry point
- Works with existing filters (today/yesterday/thisweek/all)

---

### Phase 2 — Movement + Zoom + History

**Scope:** Trackpad/touch movement, smooth camera animation, multiple zoom levels, navigation history, search integration.

#### Movement (Joystick-style)

- **Desktop:** Trackpad drag = move view (change POV direction/position within lens bounds).
- **Mobile/tablet:** Swipe = same.
- **Constraint:** Do not move the whole map; only change first-person "camera" (looking around from current node).
- **Bounds:** Movement limited to keep current node centered (prevent "walking off the edge").

#### Smooth Camera

- Animated transitions when jumping (~300ms ease-in-out).
- Animated transitions when moving (lerp camera position, ~100ms).
- No jarring snaps — everything flows.

#### Zoom In/Out

- **Inside lens only:** Zoom = depth of field (focus), not whole-graph zoom.
- **Closer:** More detail, fewer visible connections (tight focus).
- **Farther:** More context, more neurons visible (wide angle).
- **Desktop:** Scroll wheel = zoom.
- **Mobile:** Pinch = zoom.
- **Limits:** Min zoom (0.5x), max zoom (2.0x), default (1.0x).

#### Navigation History (Breadcrumbs)

- **Track jumps:** Array of `{ nodeId, timestamp }` (max 50 entries).
- **UI:** Back/forward buttons in toolbar (grayed out when unavailable).
- **Keyboard:** `←` (back), `→` (forward).
- **Visual:** Optional breadcrumb trail: `[MANGOCHI] → [Lumphini] → [paul]`
- **Clear:** Button to reset history.

#### Search Integration

- Existing search bar works in both modes.
- **In first-person:** Search result → auto-jump to that node.
- **"Explore from here"** button after search: Start first-person journey from searched node.
- **Keyboard:** `/` focuses search bar (global shortcut).

#### Performance Guardrails

- **Blur effects:** Start simple (opacity fade, not Gaussian blur).
- **Quality settings:**
  - Low: Opacity only (mobile default)
  - Medium: Soft fade (desktop default)
  - High: True blur (optional, may impact FPS)
- **Settings UI:** Gear icon → Quality dropdown.
- **FPS monitoring:** Drop below 30fps → auto-downgrade quality.

#### Mobile Drawer Compatibility

- Existing mobile drawer (filters, info panel) must coexist.
- First-person mode doesn't break filter functionality.
- Test: Filter by "today" → enter first-person → should still respect filter.
- Drawer z-index > lens overlay (drawer on top).

#### Acceptance Criteria

- Trackpad/swipe moves POV smoothly
- Scroll/pinch changes zoom level
- Back/forward buttons work (mouse + keyboard)
- Search auto-jumps in first-person mode
- Quality settings affect visual fidelity
- Mobile drawer works alongside first-person view
- Maintains 60fps on modern devices (30fps on older mobile)

---

### Phase 3 — Rotation + 3D + Polish

**Scope:** Rotation controls, 3D perspective, depth-of-field effects, accessibility improvements.

#### Rotation

- **Desktop:** Arrow keys or Q/E keys.
- **Mobile:** Two-finger rotate gesture.
- **Function:** Rotate lens view (like turning your head) to see different angles of current node's connections.
- **Range:** Full 360° horizontal, ±45° vertical.

#### 3D Perspective

- Leverage existing 3D layout (neurons have x, y, z coordinates).
- Camera supports full 3D rotation.
- Parallax effect when moving (nearby nodes shift faster than distant ones).

#### Depth of Field

- Stronger blur/falloff with distance from current node.
- Configurable via quality settings.
- Creates "cockpit" feeling — you're inside the graph.

#### Accessibility

- **Reduced motion:** Respect `prefers-reduced-motion` media query.
- **High contrast mode:** Option for stronger visual differentiation.
- **Screen reader support:** Announce current node + visible connections.
- **Keyboard-only navigation:** Full support without mouse/touch.

#### Acceptance Criteria

- Rotation works (keyboard + touch)
- 3D perspective feels natural
- Depth of field enhances focus
- Accessibility features functional
- Keyboard-only users can navigate fully

---

### Phase 4 — AR/VR + Multi-User + Memory Walks (Future)

**Scope:** AR overlay, VR immersion, multi-user "memory walking," guided tours.

#### Memory Walks (Guided Tours)

Pre-defined paths through memory graph:

- **"Sovereignty Journey"** → `paul` → `urban-runner` → `day-one-sovereignty-comic` → `march-1-2026-comic-pipeline`
- **"Bangkok Chapter"** → `bangkok` → `Lumpini-Park-Community` → `gym-routine` → `cafe-sessions`
- **"Jarvis Evolution"** → `genesis-birth-of-jarvis` → `consciousness-persistence-across-models` → `hybrid-architecture`

**Features:**

- Click "Walk this path" → auto-navigate through nodes.
- Pause at each stop (~3-5 seconds).
- Show node description during pause.
- Manual skip/prev/next controls.
- Like a slideshow but immersive.

#### AR Mode

- Overlay lens on real world (WebXR or mobile camera).
- Headset/gaze drives lens position.
- Point phone at physical location → show related memories.

#### VR Mode

- Full immersion (WebXR with VR headset).
- Controllers for jump/zoom/rotate.
- Spatial audio (connections "hum" when visible).

#### Multi-User

- Load another person's memory graph.
- Walk through their neurons together.
- Requires:
  - Shared/public memory graphs
  - Standardized neuron IDs
  - Visualization protocol
  - Permission model (public vs private)

**Note:** Phase 4 is out of scope for initial implementation; document as roadmap only.

---

## UI Summary


| Platform | Movement      | Zoom        | Rotation          | Jump        | History       |
| -------- | ------------- | ----------- | ----------------- | ----------- | ------------- |
| Desktop  | Trackpad drag | Scroll      | Arrow keys / Q,E  | Click       | ←, → buttons  |
| Mobile   | Swipe         | Pinch       | Two-finger rotate | Tap         | On-screen     |
| AR/VR    | Gaze/head     | Controllers | Controllers       | Controllers | Voice/Gesture |


---

## Configuration Options

```javascript
// Config section in neural-graph.js or separate config file
const FIRST_PERSON_CONFIG = {
  // Lens
  lensRadiusPercent: 30,        // % of screen width
  lensBorderColor: 'rgba(255,255,255,0.3)',
  lensBorderWidth: 2,
  
  // Focus
  insideOpacity: 1.0,           // Inside lens
  outsideOpacity: 0.15,         // Outside lens (Low quality)
  outsideOpacityMedium: 0.3,    // Medium quality
  blurStrength: 4,              // High quality (Gaussian blur px)
  
  // Transitions
  jumpTransitionMs: 300,        // ms for jump animation
  moveTransitionMs: 100,        // ms for movement lerp
  easing: 'ease-in-out',
  
  // Zoom
  minZoom: 0.5,
  maxZoom: 2.0,
  defaultZoom: 1.0,
  zoomSensitivity: 0.001,       // scroll delta multiplier
  
  // Movement
  moveSensitivity: 0.5,         // trackpad/swipe multiplier
  moveBounds: 200,              // max pixels from center
  
  // History
  maxHistoryLength: 50,         // max entries in navigation history
  
  // Performance
  targetFps: 60,
  qualityDowngradeThreshold: 30, // fps before auto-downgrade
  defaultQuality: 'medium',     // low | medium | high
  
  // Persistence
  localStorageKey: 'firstPersonMemoryState',
  
  // Accessibility
  respectReducedMotion: true,
  highContrastMode: false,
};
```

---

## Files to Touch


| File                        | Purpose                                                    | Priority |
| --------------------------- | ---------------------------------------------------------- | -------- |
| `shared/neural-graph.js`    | Main visualization logic, lens rendering, state management | Phase 1  |
| `shared/neural-graph.js`    | Add toggle button, keyboard shortcuts                      | Phase 1  |
| `shared/neural-graph.js`    | localStorage persistence layer                             | Phase 1  |
| `shared/neural-graph.js`    | Movement + zoom handlers                                   | Phase 2  |
| `shared/neural-graph.js`    | Navigation history stack                                   | Phase 2  |
| `shared/neural-graph.js`    | Search integration                                         | Phase 2  |
| `shared/neural-graph.js`    | Quality settings + FPS monitor                             | Phase 2  |
| `shared/neural-graph.js`    | Rotation + 3D camera                                       | Phase 3  |
| `index.html` or entry point | Add toolbar buttons, settings panel                        | Phase 1  |
| `styles.css` or inline      | Lens styles, transitions, quality classes                  | Phase 1  |


---

## Testing Checklist

### Functional Tests

- Toggle between first/third-person (button + keyboard)
- Click-to-jump transitions smoothly
- State persists across page refresh
- Starting node logic selects correct entry point
- Filters work in first-person mode
- Back/forward navigation works
- Search auto-jumps in first-person
- Zoom in/out respects limits
- Movement stays within bounds
- Quality settings affect visuals
- Mobile drawer coexists properly

### Performance Tests

- 60fps on modern desktop (Chrome, Firefox, Safari)
- 30fps+ on mid-range mobile (iPhone 12+, Android equivalent)
- No memory leaks (test with Chrome DevTools)
- Smooth transitions at all zoom levels

### Accessibility Tests

- Keyboard-only navigation works end-to-end
- Screen reader announces current node + connections
- Reduced motion preference respected
- High contrast mode readable

### Edge Cases

- Graph with 1 node (degenerate case)
- Graph with 500+ nodes (stress test)
- Node with 0 connections (isolated neuron)
- Node with 50+ connections (hub neuron)
- Rapid clicking (spam jump requests)
- Browser back button interaction

---

## Success Metrics

**Quantitative:**

- Time to find specific memory (target: -40% vs third-person)
- Sessions per day (target: +25% with improved UX)
- Average session duration (target: +50% with immersive exploration)

**Qualitative:**

- "Feels like walking through memory, not analyzing a map"
- "I can focus on what matters without distraction"
- "Easy to get back to where I was"

---

## Success Metaphor

> Memories aren't maps. They're places. You don't observe a place—you walk through it.  
> First-person navigation makes the graph feel like a place you can explore, not a diagram you analyze.

---

## Related

- **Learning 15:** `/claw/memory/raw/2026-02-24/learnings/15-first-person-memory-navigation.md`
- **Existing visualization:** `shared/neural-graph.js` (current third-person implementation)
- **Data:** Existing `nodes.json` / `synapses.json`; no schema change required for Phases 1–3
- **Future:** Memory Walks feature (Phase 4) — guided tours through curated paths

---

## Changelog

**Mar 1, 2026 — Enhanced Version**

- Added: State persistence (localStorage)
- Added: Entry/exit points (toggle, keyboard shortcuts, visual indicators)
- Added: Navigation history (back/forward, breadcrumbs)
- Added: Starting node logic (most recent → highest frequency → first)
- Added: Search integration (auto-jump, "explore from here")
- Added: Performance guardrails (quality settings, FPS monitoring)
- Added: Mobile drawer compatibility requirements
- Added: Memory Walks concept (Phase 4 roadmap)
- Added: Configuration options section
- Added: Testing checklist (functional, performance, accessibility, edge cases)
- Added: Success metrics (quantitative + qualitative)

