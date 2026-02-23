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
│                                     │
│  📷 Share Image (with QR)           │
│  Download the neural visualization │
│  with embedded QR code              │
│                                     │
│  [Download Image]                   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🔗 Copy Memory Link                │
│  Share the live visualization       │
│                                     │
│  URL: [paulvisciano.github.io/...] │
│  [Copy Link]  [Copied! ✓]          │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ℹ️  What's Included?               │
│  • Full neural topology             │
│  • 46 neurons, 69 synapses         │
│  • Boot instructions (via QR)      │
│  • Verification hash               │
│                                     │
└─────────────────────────────────────┘
```

### Files to Modify

**1. `/claw/memory/index.html`**
- Add Share button next to existing controls
- Add modal dialog HTML structure
- Link to modal CSS + JavaScript

**2. Create `/claw/memory/share.js`**
New file with:
```javascript
// Share button click handler
function openShareModal() {
  // Show modal
  document.getElementById('shareModal').style.display = 'block';
}

// Download image
function downloadShareImage() {
  // URL to pre-generated image on R2
  const imageUrl = 'https://pub-9466bb5132e74aeba333004ad0c21f21.r2.dev/shared/jarvis-memory-share-v1.0.0.png';
  // Trigger download
  const a = document.createElement('a');
  a.href = imageUrl;
  a.download = 'jarvis-memory-v1.0.0.png';
  a.click();
}

// Copy share URL
function copyShareUrl() {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  // Show "Copied!" feedback
  document.getElementById('copyFeedback').innerHTML = '✓ Copied to clipboard!';
  setTimeout(() => {
    document.getElementById('copyFeedback').innerHTML = '';
  }, 2000);
}

// Close modal
function closeShareModal() {
  document.getElementById('shareModal').style.display = 'none';
}
```

**3. Create `/claw/memory/share-modal.css`**
New file with styling for modal:
```css
.share-modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
}

.share-modal-content {
  background-color: #0f172a;
  margin: 5% auto;
  padding: 20px;
  border: 1px solid #06b6d4;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  color: #e0e7ff;
  font-family: monospace;
}

.share-button-group {
  margin: 15px 0;
  padding: 12px;
  background: rgba(6, 182, 212, 0.1);
  border-radius: 4px;
}

.share-button {
  background-color: #06b6d4;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
}

.share-button:hover {
  background-color: #0891b2;
}

.close-button {
  color: #999;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close-button:hover {
  color: #06b6d4;
}
```

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

**Add to button row (find existing buttons):**
```html
<button id="shareBtn" style="...">📤 Share</button>
```

**Add modal HTML (somewhere in body):**
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

**Status:** Ready for Cursor implementation
