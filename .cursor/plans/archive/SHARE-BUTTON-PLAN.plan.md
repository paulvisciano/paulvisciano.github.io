---
name: Share Button Implementation
overview: Share button and modal (Copy + native Share) already exist in claw/memory and memory/. Download Image (R2 PNG) is in a separate plan: SHARE-IMAGE-R2.plan.md.
todos:
  - id: share-button-ui
    content: Share button and modal in claw/memory/index.html and memory/index.html
    status: completed
  - id: test-share
    content: Test Copy and native Share in Share modal
    status: completed
isProject: false
status: archived
archived_at: "2026-02-23"
---

# Share Button Implementation Plan

**Outcome:** Archived 2026-02-23. Share button and modal (Copy + Share…) are implemented in both claw/memory and memory/. Download Image work moved to SHARE-IMAGE-R2.plan.md.

**For:** Cursor (AI code editor)  
**Purpose:** Shareable memory snapshot (text) from neural visualization  
**Status:** Core Share done  

---

## Current status (implemented)

**Share button and modal exist** in both:

- **claw/memory/index.html** — "⎘ Share" next to Random Pulse, Clear, Reset Mind. Modal: "Share — Claude Code Neural Mind" with preview, Copy, Share…, Close.
- **memory/index.html** — Same pattern; modal title "Share — Paul's Neural Mind".

**Behavior:** Click Share → modal shows text preview (title, last synced, neuron/synapse counts, short boot blurb, URL). **Copy** writes that full text to clipboard. **Share…** uses `navigator.share` when available, else clipboard. All logic is inline. IDs: `share-memory-btn`, `share-modal-overlay`, `share-modal`, `share-preview`, `share-modal-copy`, `share-modal-native`, `share-modal-close`.

---

## Overview

1. ~~Copy share URL / text~~ ✅ Done (Copy + Share… in modal)
2. **Download memory snapshot image (R2)** → See **[SHARE-IMAGE-R2.plan.md](../SHARE-IMAGE-R2.plan.md)**
3. (Future) Customized snapshots per node

---

## Checklist (this plan only)

- [x] Share button in index.html (next to Reset Mind)
- [x] Modal with Copy and Share…
- [x] Test Copy and Share… flows

---

**Status:** Share button plan complete; archived. For "Download Image" from R2, use SHARE-IMAGE-R2.plan.md.
