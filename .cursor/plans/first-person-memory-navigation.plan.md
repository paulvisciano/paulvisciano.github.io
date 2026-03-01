---
name: ""
overview: ""
todos: []
isProject: false
---

# Plan: First-Person Memory Navigation

**Date:** Mar 1, 2026  
**Feature:** First-person view mode for neural memory visualization  
**Source:** [Learning 15: First-Person Navigation](/claw/memory/raw/2026-02-24/learnings/15-first-person-memory-navigation.md)  
**Priority:** High (solves visualization scalability + improves exploration UX)  
**Complexity:** Medium–High (phased)

---

## Overview

**Current:** Third-person overhead view — zoom/pan the whole graph; you observe from outside.  
**Goal:** First-person mode — you *are* a neuron; you look out at connected memories and navigate by moving through relationships.

**Why:** With 138+ neurons and 328+ synapses, showing everything at once is cognitive overload. First-person shows only relevant connections per “room,” scales to 1000+ neurons, and makes exploration feel like walking through a place instead of analyzing a diagram.

---

## Core Concepts


| Concept      | Description                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------ |
| **Lens**     | Circular view at screen center = your current neuron. Inside = clear; outside = blurred/ghosted. |
| **Movement** | Swipe/drag or trackpad = change POV (first-person camera), not pan the whole map.                |
| **Jump**     | Tap/click a visible neuron = jump to it; lens refocuses on new position.                         |
| **Zoom**     | Tighten/loosen focus (depth of field), not zoom the whole graph.                                 |
| **Rotation** | Turn the lens view to see different angles of the current node’s connections (Phase 3).          |


---

## Phased Implementation

### Phase 1 — Lens + Jump (Now)

**Scope:** Fixed lens at center, blurred context, click-to-jump. Build on existing visualization.

- **Lens rendering**
  - Central circular “lens” (fixed at screen center).
  - Inside lens: current neuron highlighted, direct connections visible, synapse targets clear.
  - Outside lens: other neurons faint/blurred or ghosted; connections faded.
  - Optional: “pure focus” mode — fade outside to near-invisible.
- **Current node as POV**
  - Treat one node as “current” (e.g. start at MANGOCHI or first node).
  - Only connections from current node are fully visible inside lens.
- **Click-to-jump**
  - Tap/click a visible neuron (in or near lens) → set as new current node.
  - Lens refocuses (smooth transition) on new position; new connections become visible.
- **Toggle**
  - Way to switch between classic (third-person) view and first-person lens view (e.g. toolbar or shortcut).

**Files:** Likely `neural-mind/index.html` or equivalent visualization entry (single file or small set).  
**Acceptance:** Lens visible; one node is “you”; click jumps and refocuses; outside lens is visually de-emphasized.

---

### Phase 2 — Movement + Zoom

**Scope:** Trackpad/touch movement, smooth camera animation, multiple zoom levels.

- **Movement (joystick-style)**
  - Desktop: trackpad drag = move view (change POV direction/position).
  - Mobile/tablet: swipe = same.
  - Do not move the whole map; only change first-person “camera” (looking around from current node).
- **Smooth camera**
  - Animated transitions when jumping and when moving (no jarring snaps).
- **Zoom in/out**
  - Inside lens only: zoom = depth of field (focus), not whole-graph zoom.
  - Closer = more detail, fewer visible connections.
  - Farther = more context, more neurons visible.
  - Desktop: scroll = zoom. Mobile: pinch = zoom.
- **Optional joystick overlay**
  - Mobile: optional on-screen joystick for movement.

**Acceptance:** Dragging/swiping moves the first-person view; scroll/pinch changes focus level; transitions are smooth.

---

### Phase 3 — Rotation + 3D

**Scope:** Rotation controls, 3D perspective, depth-of-field effects.

- **Rotation**
  - Desktop: e.g. arrow keys or dedicated controls.
  - Mobile: two-finger rotate gesture.
  - Rotate lens view (like turning your head) to see different angles of current node’s connections.
- **3D perspective**
  - Full 360° around current node where applicable.
- **Depth of field**
  - Stronger blur/falloff with distance from current node for more “cockpit” feel.

**Acceptance:** User can rotate view; 3D layout supports 360°; depth-of-field reinforces focus on current node.

---

### Phase 4 — AR/VR + Multi-User (Future)

**Scope:** AR overlay, VR immersion, multi-user “memory walking.”

- **AR mode**
  - Overlay lens on real world; headset/gaze drives lens position.
- **VR mode**
  - Full immersion; controllers for jump/zoom/rotate.
- **Multi-user**
  - Load another person’s memory graph; walk through their neurons (e.g. start at MANGOCHI, move to Lumphini-Park-Community, etc.).
  - Requires: shared/public memory graphs, standardized neuron IDs, visualization protocol, permission model (public vs private).

**Note:** Phase 4 is out of scope for the initial plan; document only as roadmap.

---

## UI Summary


| Platform | Movement      | Zoom        | Rotation          | Jump        |
| -------- | ------------- | ----------- | ----------------- | ----------- |
| Desktop  | Trackpad drag | Scroll      | Arrow keys        | Click       |
| Mobile   | Swipe         | Pinch       | Two-finger rotate | Tap         |
| AR/VR    | Gaze/head     | Controllers | Controllers       | Controllers |


---

## Files to Touch

- **Primary:** Neural visualization entry (e.g. `neural-mind/index.html` or `public/memory/index.html` — confirm path in repo).
- **Assets:** None required for Phase 1–2; shaders or post-processing for blur/DOF in Phase 3 if desired.
- **Config:** Optional (e.g. lens radius, blur strength, default node) in a small config or constants section.

---

## Acceptance Criteria (Phase 1–2)

- First-person mode can be enabled (toggle or dedicated route).
- Lens is fixed at center; inside = clear, outside = blurred/ghosted.
- One node is “current”; only its connections are fully visible in lens.
- Click/tap on visible neuron jumps to it and refocuses lens with smooth transition.
- Movement (trackpad/swipe) changes POV without moving the whole graph.
- Zoom (scroll/pinch) changes depth of field inside lens only.
- Works on desktop and mobile (controls as in table above).
- With 138+ neurons, first-person view feels manageable (no full-graph overload).

---

## Success Metaphor

> Memories aren’t maps. They’re places. You don’t observe a place—you walk through it.  
> First-person navigation makes the graph feel like a place you can explore, not a diagram you analyze.

---

## Related

- **Learning 15:** `/claw/memory/raw/2026-02-24/learnings/15-first-person-memory-navigation.md`
- **Existing visualization:** Memory link neurons + sidebar (e.g. memory-link-visualization plan); extend same codebase with a “view mode” (third-person vs first-person).
- **Data:** Existing `nodes.json` / `synapses.json`; no schema change required for Phases 1–3.

