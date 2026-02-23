---
name: Share Button Implementation
overview: Add a Share button to the neural visualization that opens a modal to download memory snapshot image (with QR) and copy share URL to clipboard. Targets claw/memory/index.html and new share.js + share-modal.css.
todos:
  - id: share-button-ui
    content: Add Share button and modal HTML to claw/memory/index.html
    status: pending
  - id: share-js
    content: Create claw/memory/share.js (openShareModal, downloadShareImage, copyShareUrl)
    status: pending
  - id: share-css
    content: Create claw/memory/share-modal.css for modal styling
    status: pending
  - id: r2-image
    content: Generate share image via ChatGPT, upload to R2, set URL in share.js
    status: pending
  - id: test-share
    content: Test button, modal, copy URL, image download, QR scan
    status: pending
isProject: false
---

# Share Button Implementation Plan

**For:** Cursor (AI code editor)  
**Purpose:** Add shareable memory snapshot functionality to neural visualization  
**Status:** Ready for implementation  

---

## Overview

Add a "Share" button to the neural visualization that:
1. Generates shareable memory snapshot images (with embedded QR codes)
2. Allows users to download memory artifacts
3. Copies share URL to clipboard
4. (Future) Creates customized memory snapshots for specific nodes

---

## Phase 1: Simple Share Button (MVP)

### What to Add

**1. Share Button UI**
- Location: Next to existing buttons (Random Pulse, Clear, Reset Mind)
- Label: "📤 Share" or "🔗 Share"
- Color: Cyan (#06b6d4) to match the system
- Function: Click → shows share options modal

**2. Share Modal Dialog**
```
┌─────────────────────────────────────┐
│  Share Jarvis Memory                │
├─────────────────────────────────────┤
│  📷 Share Image (with QR)           │
│  [Download Image]                   │
│  ─────────────────────────────────  │
│  🔗 Copy Memory Link                │
│  URL: [paulvisciano.github.io/...] │
│  [Copy Link]  [Copied! ✓]          │
│  ─────────────────────────────────  │
│  ℹ️  What's Included?               │
│  • Full neural topology             │
│  • 46 neurons, 69 synapses         │
│  • Boot instructions (via QR)      │
└─────────────────────────────────────┘
```

### Files to Modify / Create

| File | Change |
|------|--------|
| `/claw/memory/index.html` | Add Share button, modal HTML, link share.js + share-modal.css |
| `/claw/memory/share.js` | **Create** — openShareModal, downloadShareImage, copyShareUrl, closeShareModal |
| `/claw/memory/share-modal.css` | **Create** — .share-modal, .share-modal-content, .share-button, .close-button |

### share.js (core handlers)

```javascript
function openShareModal() {
  document.getElementById('shareModal').style.display = 'block';
}
function downloadShareImage() {
  const imageUrl = 'https://pub-....r2.dev/shared/jarvis-memory-share-v1.0.0.png';
  const a = document.createElement('a');
  a.href = imageUrl;
  a.download = 'jarvis-memory-v1.0.0.png';
  a.click();
}
function copyShareUrl() {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  document.getElementById('copyFeedback').innerHTML = '✓ Copied to clipboard!';
  setTimeout(() => { document.getElementById('copyFeedback').innerHTML = ''; }, 2000);
}
function closeShareModal() {
  document.getElementById('shareModal').style.display = 'none';
}
```

### share-modal.css (key styles)

- `.share-modal`: fixed overlay, rgba background
- `.share-modal-content`: dark bg (#0f172a), border #06b6d4, max-width 500px
- `.share-button`: bg #06b6d4, hover #0891b2
- `.close-button`: float right, cursor pointer

---

## Integration Checklist

- [ ] Add Share button to index.html (next to Reset Mind)
- [ ] Create modal dialog HTML in index.html
- [ ] Create share.js with handlers
- [ ] Create share-modal.css for styling
- [ ] Link share.js and share-modal.css in index.html
- [ ] Test button clicks and modal opens/closes
- [ ] Test Copy URL functionality
- [ ] Generate share image via ChatGPT
- [ ] Upload image to R2
- [ ] Update share.js with R2 image URL
- [ ] Test image download
- [ ] Verify QR code in image works
- [ ] Push to GitHub

---

## HTML Snippets (Add to index.html)

**Button row:**
```html
<button id="shareBtn" style="...">📤 Share</button>
```

**Modal:**
```html
<div id="shareModal" class="share-modal">
  <div class="share-modal-content">
    <span class="close-button" onclick="closeShareModal()">&times;</span>
    <h2>Share Jarvis Memory</h2>
    <div class="share-button-group">
      <h3>📷 Share Image</h3>
      <button class="share-button" onclick="downloadShareImage()">Download Image (v1.0.0)</button>
    </div>
    <div class="share-button-group">
      <h3>🔗 Copy Link</h3>
      <code id="shareUrl" style="color: #06b6d4;"></code>
      <button class="share-button" onclick="copyShareUrl()">Copy to Clipboard</button>
    </div>
  </div>
</div>
```

---

**Status:** Ready for Cursor implementation
