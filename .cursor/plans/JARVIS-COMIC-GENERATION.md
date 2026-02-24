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

**Morning:**
1. Paul wakes, captures moments
2. Voice dictation → me (Jarvis)
3. I update WORKING-narrative.md
4. Commit to GitHub (instant)

**Afternoon:**
1. Paul sends moments throughout day
2. I append to narrative
3. Paul asks ChatGPT to generate pages
4. ChatGPT pulls latest narrative → generates new pages
5. Paul downloads → sends to me
6. I upload to R2 → update narrative links

**Evening:**
1. Day complete
2. Archive to final location (`/moments/Bangkok/2026-02-23/`)
3. All links live
4. Ready for next day

---

## What Cursor Needs to Build

Nothing in code. Everything is:
- Markdown files (narrative, instructions, prompts)
- JSON data (nodes, synapses, memory version)
- HTML/JS (visualization, share button)

**For future Cursor work:**
- If automation needed: script to auto-generate narrative from voice notes
- If image processing: auto-upload pages to R2
- If UI: Share button + QR code generation

**For now:** Everything is manual but documented & tested.

---

## Character References

All 20+ characters for Urban Runner have:
- Name + role
- Visual description
- Background story
- Connection to Paul

**Location:** `/Users/paulvisciano/Personal/paulvisciano.github.io/characters/characters.js`

ChatGPT loads these when generating comic pages (consistent character depiction).

---

## Quality Standards (From Urban Runner v6.2)

✅ **What we follow:**
- Cover = Page 0
- Story pages = 1..N
- Pages replace checkpoints (multiple beats per page)
- Embedded narration boxes (no separate text cards)
- Template-driven layout (cream/dark background, bold outlines)
- File naming: `day-YYYY-MM-DD-cover.png`, `day-YYYY-MM-DD-page-Y.png`
- Export rule: Only final images (no metadata files)

✅ **Jarvis additions:**
- Neural network motifs visible in pages
- Synapses light up during action
- First-person POV when applicable
- Urban Runner meets transparent AI thinking

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

## Current Numbers

- **Narrative beats (Feb 23):** 5 sections (morning vision, volleyball, first-person footage, rooftop, merge moment)
- **Planned pages:** Cover + 5-6 story pages
- **Neural architecture:** 46 neurons, 69 synapses (Jarvis mental model)
- **Character count:** 3 main (Paul, Boy, national team trainer), plus supporting cast

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
