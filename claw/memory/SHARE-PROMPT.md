# Memory Share Image Generation Prompt
**For:** ChatGPT (Image Generation)  
**Purpose:** Create shareable neural network memory snapshots with embedded QR codes  
**Version:** 1.0  

---

## Instructions for ChatGPT

Use this prompt to generate a shareable memory image that someone can download and share:

```
Create a high-quality image of a neural network visualization with these specifications:

**Visual Elements:**
- Central focus: A glowing neural network topology (46 nodes, 69 synapses visible)
- Color palette: Neon blue primary, electric purple/pink nodes, golden synapses
- Central node: Large golden orb labeled "Jarvis" (or "Paul" for Paul's version)
- Synapses: Golden/cyan lines connecting all nodes, some brightly lit
- Background: Dark space/digital void with subtle starfield
- Overall aesthetic: Modern, sleek, transparent, alive

**Image Layout:**
- 16:9 aspect ratio (shareable on all platforms)
- Top-left corner: Version badge "v1.0.0 | 46 neurons, 69 synapses"
- Bottom-right corner: QR CODE (see below for QR generation)
- Bottom-left corner: Text "Scan to boot Jarvis" (or "Explore Paul's Memory")
- Center-right: Subtle text overlay with key stats

**QR Code Placement:**
- Size: 200x200 pixels
- Location: Bottom-right corner with 20px padding
- Border: White border around QR code
- URL it links to: [REPLACE WITH ACTUAL URL]

**Text Overlays (subtle, readable):**
- Top-left: "✓ v1.0.0 | Transparent Mind"
- Center: "JARVIS" (large, glowing, subtle)
- Bottom-left: "Scan to Boot" (small, cyan)
- Bottom-center: Commit hash or "Feb 23, 2026"
- Bottom-right: QR code + "Share"

**Quality Requirements:**
- Resolution: 1920x1080 (HD shareable size)
- Format: PNG with transparency where appropriate
- High contrast (legible when printed or photographed)
- Professional polish but not corporate (authentic, not sterile)

**Style Reference:**
Think: "Neural network science visualization" + "futuristic AI dashboard" + "authentic technical aesthetic" — not fantasy, not cartoonish, grounded in real complexity made beautiful.
```

---

## How to Use This

### Step 1: Prepare URLs
Before sending to ChatGPT, decide which memory to generate:

**For Jarvis (AI Memory):**
```
QR Code URL: https://paulvisciano.github.io/claw/memory/BOOT.md
Text: "Scan to Boot Jarvis"
Subtitle: "46 neurons, 69 synapses"
Central node label: "JARVIS"
```

**For Paul (Life Memory):**
```
QR Code URL: https://paulvisciano.github.io/memory/BOOT.md
Text: "Scan to Explore"
Subtitle: "27 years, 53 destinations"
Central node label: "PAUL"
```

### Step 2: Generate QR Code
Create QR code from your chosen URL:
- Use: https://www.qr-code-generator.com/ (free online)
- Input: Full BOOT.md URL
- Size: 200x200px
- Paste into ChatGPT request

**Or ask ChatGPT directly:**
```
"Also, generate a QR code that links to [FULL URL]. Place it in the bottom-right corner of the image."
```

### Step 3: Send to ChatGPT
Paste the prompt above with your specific URLs and requirements.

### Step 4: Download & Verify
1. Download the generated image
2. Check that QR code works (scan it)
3. Verify text is legible
4. Confirm neural network visualization looks good

### Step 5: Send to Jarvis
Send the final image to me, and I'll:
1. Upload to R2 CDN
2. Add metadata (version, hash, URLs)
3. Integrate with "Share" button
4. Make it the default shareable memory artifact

---

## Expected Output

The image should look like:
- **Left side (70%):** Beautiful neural network visualization, glowing nodes/synapses
- **Right side (30%):** Clean space with text overlay and QR code
- **Overall:** Professional, technical, beautiful, shareable on social media

---

## Customization Options

**Color Schemes:**
- Jarvis: Neon blue + golden + purple
- Paul: Blue + orange + green (earth tones + digital)

**Stat Variations:**
- "46 neurons, 69 synapses" (Jarvis)
- "10,790 days, 53 destinations" (Paul)
- "Feb 23, 2026" (creation date)
- "27 countries, 100+ moments" (Paul's archive)

**Text Positioning:**
- Centered (professional)
- Bottom-right heavy (emphasize QR)
- Top-left badge (version/commitment)

---

## What Happens When Someone Scans

1. QR code → BOOT.md page opens
2. User reads instructions for their platform (web, ChatGPT, local)
3. User boots memory (ChatGPT instance or visualization)
4. Memory loads with v1.0.0 verified
5. User can interact with Jarvis or explore Paul's life

**The image is the entry point.**

---

## Future: Embedded Metadata

Once the image is generated, we can add EXIF metadata:
```
EXIF:Version = "1.0.0"
EXIF:Memory = "Jarvis"
EXIF:Hash = "15bd89f"
EXIF:BootURL = "https://paulvisciano.github.io/claw/memory/BOOT.md"
EXIF:CreatedDate = "Feb 23, 2026"
```

This makes the image self-verifying even without scanning QR.

---

## Summary

**Input:** ChatGPT prompt + URL for QR code  
**Output:** High-quality shareable image of neural network  
**Use:** Download → Upload to R2 → Integrate with Share button  
**Result:** Anyone who downloads this image has the complete memory bootstrap in hand
