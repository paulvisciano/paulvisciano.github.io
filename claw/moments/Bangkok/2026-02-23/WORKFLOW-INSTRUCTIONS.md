# Jarvis Comic Workflow — Chapter 15: Rolling Narrative Publishing
**Version:** 1.0  
**Date:** February 23, 2026  
**Purpose:** Complete guide to daily narrative publishing, real-time image generation, and live comic book production

---

## Overview: The Rolling Narrative Model

This workflow enables **live comic book generation throughout a single day** using a persistent narrative document that grows as events unfold.

**Key principle:** One permanent URL feeds ChatGPT all day. As narrative updates, ChatGPT regenerates pages. No new URLs needed.

---

## Part 1: Daily Narrative Structure

### Where It Lives
```
/Users/paulvisciano/Personal/paulvisciano.github.io/claw/moments/Bangkok/2026-02-23/WORKING-narrative.md
```

### Permanent GitHub Raw URL
```
https://raw.githubusercontent.com/paulvisciano/paulvisciano.github.io/main/claw/moments/Bangkok/2026-02-23/WORKING-narrative.md
```

**This URL is constant throughout the entire day.** Paste it into ChatGPT once. It always pulls the latest version.

### File Structure

The narrative is organized as **continuous storytelling**, not discrete sections:

```markdown
# Bangkok Episode: [Title]
**Date:** YYYY-MM-DD
**Location:** Bangkok, Thailand

## [Hour/Period]: [Section Name]
Narrative text describing events, observations, sensory details.

## [Next Hour/Period]: [Next Section]
Continues the story...

---

## Generated Pages
- `day-YYYY-MM-DD-cover.png` → [R2 URL] (when generated)
- `day-YYYY-MM-DD-page-1.png` → [R2 URL] (when generated)
- `day-YYYY-MM-DD-page-2.png` → [R2 URL] (when generated)
```

---

## Part 2: How ChatGPT Pulls Live Data

### Setup (One Time Per Day)

1. **Paste the system prompt** into ChatGPT:
   ```
   https://raw.githubusercontent.com/paulvisciano/paulvisciano.github.io/main/claw/moments/Bangkok/2026-02-23/chatgpt-image-prompt.md
   ```

2. **Paste the instructions** into ChatGPT:
   ```
   https://raw.githubusercontent.com/paulvisciano/paulvisciano.github.io/main/claw/moments/Bangkok/2026-02-23/JARVIS-COMIC-INSTRUCTIONS.md
   ```

3. **Paste the working narrative URL** into ChatGPT:
   ```
   https://raw.githubusercontent.com/paulvisciano/paulvisciano.github.io/main/claw/moments/Bangkok/2026-02-23/WORKING-narrative.md
   ```

4. **Ask ChatGPT:**
   > "Generate sequential comic panels for today following these instructions. Use the narrative as your content source. Start with the cover, then story pages 1-N."

### Throughout the Day

**When you add new moments to the narrative:**
1. I append the moment to WORKING-narrative.md
2. I commit to GitHub (1-2 seconds)
3. GitHub CDN updates (immediate)
4. You paste the same URL back into ChatGPT (or just refresh the conversation)
5. ChatGPT pulls fresh narrative → regenerates panels from new material

**No new links. No copy-paste hell. Same URL all day.**

---

## Part 3: Image Generation & Publishing Pipeline

### Your Role (Generate)
1. Ask ChatGPT to generate cover + pages
2. Download `.png` files from ChatGPT
3. Send files to me (WhatsApp/message)

### My Role (Publish)
1. Receive `.png` files
2. Upload to R2 via MCP (`upload_to_r2` or `upload_folder_to_r2`)
3. Get public R2 URLs (format: `https://pub-9466bb5132e74aeba333004ad0c21f21.r2.dev/moments/Bangkok/2026-02-23/day-2026-02-23-page-1.png`)
4. Insert URLs into WORKING-narrative.md under "Generated Pages" section
5. Commit to GitHub

### Published Links in Narrative

As images are published, narrative updates to show:

```markdown
## Generated Pages
- `day-2026-02-23-cover.png` → https://pub-9466bb5132e74aeba333004ad0c21f21.r2.dev/moments/Bangkok/2026-02-23/day-2026-02-23-cover.png
- `day-2026-02-23-page-1.png` → https://pub-9466bb5132e74aeba333004ad0c21f21.r2.dev/moments/Bangkok/2026-02-23/day-2026-02-23-page-1.png
```

These links are live immediately on GitHub Pages.

---

## Part 4: Real-Time Tracking & Updates

### How to Follow Along Today

**Access current narrative:**
```
https://raw.githubusercontent.com/paulvisciano/paulvisciano.github.io/main/claw/moments/Bangkok/2026-02-23/WORKING-narrative.md
```

**Access published pages (as they're generated):**
```
https://pub-9466bb5132e74aeba333004ad0c21f21.r2.dev/moments/Bangkok/2026-02-23/
```

### Timeline Example (Feb 23)

| Time | Event | Action |
|------|-------|--------|
| 14:00 | Volleyball starts | I add initial moment to narrative |
| 14:30 | Rooftop moment | I update narrative |
| 15:00 | Coffee with Boy | I append to narrative |
| 15:15 | You ask for images | You paste URL into ChatGPT |
| 15:20 | ChatGPT generates cover | You download, send to me |
| 15:25 | I upload cover to R2 | I add R2 link to narrative |
| 15:30 | You ask for story pages 1-3 | ChatGPT regenerates with fresh narrative |
| 15:40 | Pages 1-3 published | R2 links in narrative |
| Evening | More moments added | Narrative grows, pages regenerate |

**The narrative is always the single source of truth. Everything cascades from it.**

---

## Part 5: Day Completion & Archiving

### End of Day (Evening)

1. Final narrative is locked
2. All comic pages are published to R2
3. Narrative moved from `claw/moments/Bangkok/2026-02-23/` to `moments/Bangkok/2026-02-23/`
4. All links verified
5. Committed to Git with clean history

### Final Structure
```
moments/Bangkok/2026-02-23/
├── narrative.md (final, archived)
├── day-2026-02-23-cover.png (optional: link only, images stay on R2)
├── day-2026-02-23-page-1.png (optional: link only)
└── [other assets]
```

### Next Day
```
claw/moments/Bangkok/2026-02-24/
├── WORKING-narrative.md (fresh start, same structure)
├── chatgpt-image-prompt.md
├── JARVIS-COMIC-INSTRUCTIONS.md
└── [repeat workflow]
```

---

## Part 6: Technical Details

### GitHub Raw URL Behavior
- Updates every time file is committed
- CDN caches briefly (usually <5 seconds)
- ChatGPT can refresh by re-pasting URL
- Safe to share publicly (read-only access)

### R2 URL Structure
- Format: `https://pub-[BUCKET-ID].r2.dev/moments/Bangkok/2026-02-23/day-2026-02-23-page-1.png`
- Permanent (doesn't change)
- Public (shareable link)
- CDN-backed (fast globally)

### File Naming Convention
```
day-YYYY-MM-DD-cover.png        (Page 0)
day-YYYY-MM-DD-page-1.png       (Story page 1)
day-YYYY-MM-DD-page-2.png       (Story page 2)
... and so on
```

---

## Part 7: Troubleshooting

### "ChatGPT is pulling old narrative"
- Verify GitHub commit went through
- Paste URL again (forces refresh)
- Check raw URL directly in browser to confirm update

### "R2 link returns 404"
- Verify filename matches convention exactly
- Check bucket name: `urban-runner`
- Verify public access enabled in R2 bucket settings

### "Narrative getting too long"
- Normal and expected
- Later sections don't affect earlier image generation
- ChatGPT can be asked to "focus on section X" if needed

### "Lost track of which pages are published"
- Check narrative's "Generated Pages" section
- All R2 links listed there
- That section is the source of truth for published images

---

## Part 8: Daily Cadence

### Suggested Workflow

**Morning (Setup):**
- Paste all three files into ChatGPT once
- Narrative grows as events happen

**Throughout Day:**
- Add moments to narrative (voice notes → me → narrative update)
- Request image generation as you go
- I publish to R2 + update links
- Narrative accumulates

**Evening (Wrap):**
- Final narrative locked
- All pages published
- Archive to moments folder
- Reset for next day

**No daily decision fatigue.** Same three files, same URL, everything else cascades automatically.

---

## Summary

| Component | Purpose | Updates |
|-----------|---------|---------|
| WORKING-narrative.md | Story content, lives throughout day | Grows continuously |
| chatgpt-image-prompt.md | ChatGPT system prompt | Set once, reuse |
| JARVIS-COMIC-INSTRUCTIONS.md | Technical specs | Set once, reuse |
| GitHub Raw URL | ChatGPT's content feed | Refreshes every commit |
| R2 Public URLs | Image hosting | Added as pages publish |

**One narrative. Constant URL. Live generation. Rolling comic book.**

---

**Status:** Workflow ready for Feb 23 and beyond.  
**Next:** Execute daily until patterns emerge and refinements are needed.
