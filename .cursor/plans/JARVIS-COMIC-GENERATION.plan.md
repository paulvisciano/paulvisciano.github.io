---
name: Jarvis Comic Book Generation
overview: Automated real-time comic generation from live narratives—WORKING-narrative.md (GitHub URL) → ChatGPT → comic images → R2 → published. Architecture complete; first pages and Share button in progress.
todos:
  - id: first-pages
    content: Generate first set of pages from Feb 23 narrative via ChatGPT
    status: pending
  - id: share-images
    content: Create share images with embedded QR (ChatGPT + R2)
    status: pending
  - id: share-button-ui
    content: Add Share button UI (see SHARE-BUTTON-PLAN.plan.md)
    status: pending
  - id: e2e-test
    content: End-to-end test moment → narrative → ChatGPT → pages → published
    status: pending
isProject: false
---

# Jarvis Comic Book Generation Plan

**For:** Cursor (when implementing Jarvis Comic System)  
**Purpose:** Automated real-time comic generation from live narratives  
**Status:** Architecture complete, implementation ready  

---

## System Overview

**Goal:** Transform daily narrative document into sequential comic book pages automatically.

**Flow:** Paul's moment → narrative.md → ChatGPT → comic images → R2 → published

---

## Current Status

✅ **Completed:**
- WORKING-narrative.md (lives at permanent GitHub URL)
- System prompts (chatgpt-image-prompt.md)
- Comic instructions (JARVIS-COMIC-INSTRUCTIONS.md)
- ChatGPT boot sequence
- R2 upload pipeline
- Memory versioning (v1.0.0)

⏳ **In Progress:**
- Generate first set of pages from Feb 23 narrative
- Create share images (with embedded QR)
- Add Share button UI

---

## Key Files Created

- **WORKING-narrative.md** → Permanent GitHub URL (ChatGPT pulls from here)
- **chatgpt-image-prompt.md** → System prompt for ChatGPT
- **JARVIS-COMIC-INSTRUCTIONS.md** → Technical specs (naming, composition)
- **memory-version.json** → Version manifest (v1.0.0, 46 neurons, 69 synapses)
- **BOOT.md** (Jarvis + Paul) → Portable boot instructions with QR links

---

## How ChatGPT Generates Pages

**1. Paste these into ChatGPT Project:**
- System prompt (chatgpt-image-prompt.md)
- Comic instructions (JARVIS-COMIC-INSTRUCTIONS.md)
- WORKING-narrative.md link

**2. ChatGPT reads narrative and generates:**
- `day-2026-02-23-cover.png` (Page 0)
- `day-2026-02-23-page-1.png` (Story page 1)
- `day-2026-02-23-page-2.png` (Story page 2)
- etc.

**3. Paul downloads and sends to Jarvis**
- I upload to R2 CDN
- Insert R2 links into narrative
- Narrative updates live on GitHub

**4. ChatGPT regenerates from updated narrative**
- Same URL pulls fresh content
- New pages generated based on latest beats
- Continuous throughout the day

---

## Daily Workflow

**Morning:** Paul captures moments → voice dictation → update WORKING-narrative.md → commit.

**Afternoon:** Moments → append narrative → ChatGPT generates pages → Paul downloads → upload to R2 → update narrative links.

**Evening:** Archive to `/moments/Bangkok/YYYY-MM-DD/`; all links live; ready for next day.

---

## What Cursor Needs to Build

Nothing in code for core comic flow. Everything is Markdown, JSON, and existing HTML/JS.

**For future Cursor work:**
- Script to auto-generate narrative from voice notes (if automation needed)
- Auto-upload pages to R2 (if image pipeline needed)
- Share button + QR code generation (see SHARE-BUTTON-PLAN.plan.md)

**For now:** Manual but documented & tested.

---

## Character References

All 20+ characters in `characters/characters.js` (name, role, visual description, background). ChatGPT loads these for consistent character depiction.

---

## Quality Standards (From Urban Runner v6.2)

- Cover = Page 0; story pages = 1..N
- File naming: `day-YYYY-MM-DD-cover.png`, `day-YYYY-MM-DD-page-Y.png`
- Template-driven layout (cream/dark, bold outlines); embedded narration boxes
- Jarvis additions: neural motifs, synapses in action, first-person POV where applicable

---

## Testing Checklist

- [ ] Narrative updates → GitHub commits successfully
- [ ] ChatGPT reads permanent URL (no new links needed)
- [ ] Pages generate with correct naming convention
- [ ] Pages match technical specs (sizing, composition)
- [ ] R2 upload works (images are public)
- [ ] Links in narrative point to correct R2 URLs
- [ ] QR code in share image works (links to BOOT.md)
- [ ] End-to-end: moment → narrative → ChatGPT → pages → published

---

## What Makes This Work

1. **Single source of truth:** WORKING-narrative.md on GitHub
2. **Consistent prompts:** ChatGPT always gets same instructions
3. **Permanent URL:** No manual link management
4. **Automatic updates:** Commit → GitHub → ChatGPT pulls latest
5. **Quality control:** Paul reviews + uploads pages manually (oversight)
6. **Version tracking:** memory-version.json tracks architecture state

---

**Status:** Ready for first full day of comic generation  
**Next step:** Paul generates first pages via ChatGPT (using Feb 23 narrative)
