---
name: Share Image via R2 (Download from Share Modal)
overview: Add a "Download Image" option to the existing Share modal that downloads a pre-generated PNG (neural snapshot + QR to BOOT) from Cloudflare R2. Requires generating the image, uploading to R2, then wiring the button in claw/memory and memory/index.html.
todos:
  - id: generate-image
    content: Generate share image (ChatGPT / SHARE-PROMPT.md), neural viz + QR to BOOT
    status: pending
  - id: upload-r2
    content: Upload PNG to R2 (e.g. shared/jarvis-memory-share-v1.0.0.png), get public URL
    status: pending
  - id: download-button-claw
    content: Add "Download Image" button + handler in claw/memory/index.html share modal
    status: pending
  - id: download-button-memory
    content: Add "Download Image" button + handler in memory/index.html (Paul image URL if different)
    status: pending
  - id: test-download-qr
    content: Test download and verify QR in image opens BOOT
    status: pending
isProject: false
---

# Share Image via R2

**Purpose:** Let users download a shareable PNG (memory snapshot + QR code) from the existing Share modal. Image is hosted on Cloudflare R2.

**Depends on:** Share button and modal already exist (see SHARE-BUTTON-PLAN.plan.md). This plan is only the R2 image + "Download Image" button.

---

## What the image is

- A **pre-made PNG**: neural mind (or Paul’s memory) snapshot with a **QR code** linking to the relevant BOOT.md.
- **Spec:** See `claw/memory/SHARE-PROMPT.md` (e.g. 1920×1080, layout, QR placement).
- **Generated** e.g. via ChatGPT or another tool; then **uploaded to R2** so the app can point to a stable public URL.

---

## Steps

### 1. Generate the image

- Use `claw/memory/SHARE-PROMPT.md` (or equivalent for Paul’s memory).
- Produce PNG(s): one for Claude Code neural mind, optionally one for Paul’s memory.
- Export final image(s) with no extra metadata if desired.

### 2. Upload to R2

- Upload to your R2 bucket under a path like `shared/jarvis-memory-share-v1.0.0.png` (and e.g. `shared/paul-memory-share.png` if separate).
- Ensure the object is **public** (or use a public bucket URL).
- Note the **public URL** (e.g. `https://pub-xxxx.r2.dev/shared/jarvis-memory-share-v1.0.0.png`).

### 3. Add "Download Image" to the Share modal

**In claw/memory/index.html and memory/index.html:**

- Inside the existing `.share-actions` div (e.g. before the Copy button), add:

```html
<button type="button" class="btn-download" id="share-modal-download">📷 Download Image</button>
```

- Add handler (inline with existing share logic):

```javascript
const SHARE_IMAGE_URL = 'https://pub-xxxx.r2.dev/shared/jarvis-memory-share-v1.0.0.png'; // replace with your R2 URL
document.getElementById('share-modal-download').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = SHARE_IMAGE_URL;
  a.download = 'claude-code-memory-share.png';
  a.rel = 'noopener';
  a.click();
});
```

- Style `.btn-download` like `.btn-copy` (or reuse the same class).
- In **memory/index.html**, use the Paul memory image URL and download filename if you use a separate image.

### 4. Test

- Open Share modal → click "Download Image" → file downloads.
- Open the PNG; scan QR → BOOT page (or correct target) opens.

---

## Files to touch


| File                            | Change                                                         |
| ------------------------------- | -------------------------------------------------------------- |
| **claw/memory/index.html**      | Add Download button in `.share-actions` + handler with R2 URL. |
| **memory/index.html**           | Same; use Paul memory R2 URL if different.                     |
| **R2 bucket**                   | Host PNG(s) at a stable public path (e.g. `shared/...`).       |
| **claw/memory/SHARE-PROMPT.md** | Reference for image spec (no change required).                 |


---

## Checklist

- Generate share image(s) per SHARE-PROMPT.md
- Upload to R2; confirm public URL
- Add "Download Image" button + handler in claw/memory/index.html
- Add "Download Image" button + handler in memory/index.html (if using separate image)
- Test download and QR scan

---

**Status:** Pending; Share modal already exists, only R2 image + button wiring needed.