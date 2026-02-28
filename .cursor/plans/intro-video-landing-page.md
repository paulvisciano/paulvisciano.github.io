# Intro Video Landing Page with Loading State

## Vision

Create a cinematic landing experience:
1. **Video plays** (hosted on Cloudflare R2, full quality)
2. **Loading indicator** shows while neurograph data fetches
3. **Smooth transition** to live interactive neural graph
4. **Optional:** Video becomes subtle animated background

---

## User Flow

```
User lands on page
       ↓
┌─────────────────────┐
│  Full-screen video  │ ← Autoplay (muted)
│  (Jarvis intro)     │   Shows AI coming to life
└─────────────────────┘
       ↓
┌─────────────────────┐
│  Loading overlay    │ ← "Loading 232 neurons..."
│  + Progress bar     │   Fetching nodes.json + synapses.json
└─────────────────────┘
       ↓
┌─────────────────────┐
│  Live neural graph  │ ← Interactive, 3D, firing
│  (video fades out)  │   User can explore
└─────────────────────┘
```

---

## Technical Implementation

### Step 1: Upload Video to Cloudflare R2

**Why R2:**
- Zero egress fees (unlike S3)
- Global CDN (fast everywhere)
- Cheap storage (~$0.015/GB/month)
- Direct URL access (no signing needed for public assets)

**Upload command:**
```bash
# Install wrangler CLI if not already installed
npm install -g wrangler

# Authenticate
wrangler login

# Create bucket (if doesn't exist)
wrangler r2 bucket create paulvisciano-assets

# Upload video
wrangler r2 object put paulvisciano-assets/jarvis-intro-animated.mp4 \
  --file /Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/2026-02-27/videos/2026-02-27-1207-jarvis-intro-animated.mp4 \
  --content-type video/mp4
```

**Resulting URL:**
`https://paulvisciano-assets.<account-id>.r2.dev/jarvis-intro-animated.mp4`

Or with custom domain (if configured):
`https://assets.paulvisciano.github.io/jarvis-intro-animated.mp4`

---

### Step 2: Update HTML Structure

**File:** `/claw/memory/index.html`

**Add video container and loading overlay:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Existing head content -->
  <link rel="stylesheet" href="shared/landing-page.css">
</head>
<body>
  
  <!-- INTRO VIDEO HERO -->
  <div id="intro-hero" class="intro-hero">
    <video 
      autoplay 
      muted 
      playsinline 
      loop
      id="intro-video"
      poster="assets/video-poster.jpg"
    >
      <source src="https://paulvisciano-assets.<account-id>.r2.dev/jarvis-intro-animated.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>
    
    <!-- Optional overlay text -->
    <div class="hero-overlay">
      <h1 class="hero-title">Jarvis Neural Mind</h1>
      <p class="hero-tagline">Your memories. Alive. Connected.</p>
    </div>
    
    <!-- Skip button (optional) -->
    <button id="skip-intro" class="skip-btn">Skip Intro →</button>
  </div>

  <!-- LOADING OVERLAY -->
  <div id="loading-overlay" class="loading-overlay hidden">
    <div class="loader-container">
      <!-- Animated spinner or neural network animation -->
      <div class="neural-loader">
        <div class="node node-1"></div>
        <div class="node node-2"></div>
        <div class="node node-3"></div>
        <div class="synapse s-1"></div>
        <div class="synapse s-2"></div>
        <div class="synapse s-3"></div>
      </div>
      
      <p class="loading-text">Loading consciousness...</p>
      <p class="loading-status" id="loading-status">Fetching neurons...</p>
      
      <!-- Progress bar -->
      <div class="progress-bar">
        <div class="progress-fill" id="progress-fill"></div>
      </div>
      
      <p class="loading-count" id="loading-count">0 / 232 neurons</p>
    </div>
  </div>

  <!-- MAIN NEURAL GRAPH (hidden initially) -->
  <div id="main-content" class="main-content hidden">
    <!-- Existing graph container -->
    <div id="info">
      <!-- Existing sidebar -->
    </div>
    
    <div id="graph-container">
      <!-- Existing canvas/SVG -->
    </div>
  </div>

  <script src="shared/landing-page.js"></script>
  <script src="shared/neural-graph.js"></script>
</body>
</html>
```

---

### Step 3: CSS Styling

**File:** `/claw/memory/shared/landing-page.css` (new file)

```css
/* INTRO HERO */
.intro-hero {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: #000;
  transition: opacity 0.8s ease-out, visibility 0.8s;
}

.intro-hero.fade-out {
  opacity: 0;
  visibility: hidden;
}

#intro-video {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Fill screen, crop if needed */
}

.hero-overlay {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: white;
  text-shadow: 0 0 20px rgba(6, 182, 212, 0.8);
  pointer-events: none;
}

.hero-title {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  font-family: 'Monaco', 'Courier New', monospace;
}

.hero-tagline {
  font-size: 1.2rem;
  color: #06b6d4;
  font-style: italic;
}

.skip-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background: rgba(6, 182, 212, 0.3);
  border: 2px solid #06b6d4;
  color: #06b6d4;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  z-index: 10;
}

.skip-btn:hover {
  background: rgba(6, 182, 212, 0.6);
  color: #000;
}

/* LOADING OVERLAY */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a1128 0%, #1a0f3a 50%, #0a0a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: opacity 0.5s ease-out;
}

.loading-overlay.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.loader-container {
  text-align: center;
  color: #e0e6ff;
}

/* Neural network loader animation */
.neural-loader {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 2rem;
}

.node {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #fbbf24;
  border-radius: 50%;
  box-shadow: 0 0 20px #fbbf24;
  animation: pulse 2s infinite;
}

.node-1 { top: 20%; left: 50%; animation-delay: 0s; }
.node-2 { top: 60%; left: 20%; animation-delay: 0.3s; }
.node-3 { top: 60%; left: 80%; animation-delay: 0.6s; }

.synapse {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, #06b6d4, transparent);
  animation: flow 1.5s infinite;
}

.s-1 { 
  top: 30%; left: 30%; 
  width: 100px; 
  transform: rotate(45deg);
  animation-delay: 0s;
}
.s-2 { 
  top: 50%; left: 40%; 
  width: 80px; 
  transform: rotate(-30deg);
  animation-delay: 0.5s;
}
.s-3 { 
  top: 40%; left: 50%; 
  width: 90px; 
  transform: rotate(60deg);
  animation-delay: 1s;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

@keyframes flow {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

.loading-text {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #fbbf24;
}

.loading-status {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin: 0 auto 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #06b6d4, #fbbf24);
  width: 0%;
  transition: width 0.3s ease-out;
  box-shadow: 0 0 10px #06b6d4;
}

.loading-count {
  font-size: 0.85rem;
  color: #64748b;
  font-family: 'Monaco', 'Courier New', monospace;
}

/* MAIN CONTENT */
.main-content {
  opacity: 0;
  transition: opacity 0.8s ease-in;
}

.main-content.visible {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-tagline {
    font-size: 1rem;
  }
  
  .skip-btn {
    top: 10px;
    right: 10px;
    padding: 8px 16px;
    font-size: 0.8rem;
  }
  
  .neural-loader {
    width: 150px;
    height: 150px;
  }
  
  .progress-bar {
    width: 200px;
  }
}
```

---

### Step 4: JavaScript Logic

**File:** `/claw/memory/shared/landing-page.js` (new file)

```javascript
/**
 * Landing Page Controller
 * Manages intro video → loading → graph transition
 */

class LandingPageController {
  constructor() {
    this.introHero = document.getElementById('intro-hero');
    this.loadingOverlay = document.getElementById('loading-overlay');
    this.mainContent = document.getElementById('main-content');
    this.introVideo = document.getElementById('intro-video');
    this.skipBtn = document.getElementById('skip-intro');
    this.progressFill = document.getElementById('progress-fill');
    this.loadingStatus = document.getElementById('loading-status');
    this.loadingCount = document.getElementById('loading-count');
    
    this.totalNodes = 0;
    this.loadedNodes = 0;
    
    this.init();
  }
  
  init() {
    // Listen for video end
    if (this.introVideo) {
      this.introVideo.addEventListener('ended', () => this.onVideoEnd());
      
      // Also start loading immediately (don't wait for video)
      this.startLoading();
    }
    
    // Skip button
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.skipIntro());
    }
    
    // Check if user wants to skip intro (localStorage preference)
    const skipPreference = localStorage.getItem('jarvis-skip-intro');
    if (skipPreference === 'true') {
      this.skipIntro();
    }
  }
  
  /**
   * Start loading neurograph data
   */
  async startLoading() {
    this.updateStatus('Fetching neurons...');
    
    try {
      // Load nodes
      const nodesResponse = await fetch('data/nodes.json');
      const nodes = await nodesResponse.json();
      this.totalNodes = nodes.length;
      this.loadedNodes = Math.floor(this.totalNodes * 0.5);
      this.updateProgress();
      
      this.updateStatus('Fetching synapses...');
      
      // Load synapses
      const synapsesResponse = await fetch('data/synapses.json');
      const synapses = await synapsesResponse.json();
      this.loadedNodes = this.totalNodes;
      this.updateProgress();
      
      this.updateStatus('Initializing graph...');
      
      // Small delay for smooth UX
      await this.sleep(500);
      
      // Ready to show graph
      this.onLoadComplete(nodes, synapses);
      
    } catch (error) {
      console.error('Failed to load neurograph:', error);
      this.updateStatus('Error loading. Refresh to retry.');
    }
  }
  
  /**
   * Called when video ends naturally
   */
  onVideoEnd() {
    this.transitionToGraph();
  }
  
  /**
   * Called when user clicks "Skip Intro"
   */
  skipIntro() {
    // Save preference
    localStorage.setItem('jarvis-skip-intro', 'true');
    
    // Stop video
    if (this.introVideo) {
      this.introVideo.pause();
    }
    
    this.transitionToGraph();
  }
  
  /**
   * Fade out intro, show loading
   */
  transitionToGraph() {
    if (this.introHero) {
      this.introHero.classList.add('fade-out');
      
      // Remove from DOM after transition
      setTimeout(() => {
        this.introHero.style.display = 'none';
      }, 800);
    }
    
    // Show loading overlay if not already visible
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove('hidden');
    }
  }
  
  /**
   * Called when all data is loaded
   */
  onLoadComplete(nodes, synapses) {
    // Hide loading
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('hidden');
      
      setTimeout(() => {
        this.loadingOverlay.style.display = 'none';
      }, 500);
    }
    
    // Show main content
    if (this.mainContent) {
      this.mainContent.classList.remove('hidden');
      
      // Force reflow
      void this.mainContent.offsetWidth;
      
      this.mainContent.classList.add('visible');
    }
    
    // Initialize the actual graph
    if (typeof initGraph === 'function') {
      initGraph(nodes, synapses);
    } else {
      console.warn('initGraph function not found!');
    }
  }
  
  /**
   * Update progress bar
   */
  updateProgress() {
    const percentage = (this.loadedNodes / this.totalNodes) * 100;
    if (this.progressFill) {
      this.progressFill.style.width = `${percentage}%`;
    }
    if (this.loadingCount) {
      this.loadingCount.textContent = `${this.loadedNodes} / ${this.totalNodes} neurons`;
    }
  }
  
  /**
   * Update status text
   */
  updateStatus(text) {
    if (this.loadingStatus) {
      this.loadingStatus.textContent = text;
    }
  }
  
  /**
   * Utility: sleep for ms
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.landingPage = new LandingPageController();
});
```

---

### Step 5: Modify neural-graph.js

**File:** `/claw/memory/shared/neural-graph.js`

**Change:** Make `initGraph()` accept pre-loaded data instead of fetching itself:

```javascript
// OLD: Fetches data internally
function initGraph() {
  fetch('data/nodes.json')
    .then(r => r.json())
    .then(nodes => {
      // ... rest of code
    });
}

// NEW: Accepts pre-loaded data
function initGraph(nodes, synapses) {
  // Use the data passed in from landing-page.js
  
  // ... existing graph initialization code ...
  
  console.log(`✅ Graph initialized with ${nodes.length} neurons, ${synapses.length} synapses`);
}
```

---

### Step 6: Mobile Optimization

**Create compressed video version for mobile:**

```bash
# Using ffmpeg (install via brew install ffmpeg)
ffmpeg -i 2026-02-27-1207-jarvis-intro-animated.mp4 \
  -vf "scale=720:1280" \
  -c:v libx264 -crf 28 \
  -c:a aac -b:a 96k \
  jarvis-intro-animated-mobile.mp4

# Upload to R2
wrangler r2 object put paulvisciano-assets/jarvis-intro-animated-mobile.mp4 \
  --file jarvis-intro-animated-mobile.mp4 \
  --content-type video/mp4
```

**Update HTML to use responsive sources:**

```html
<video autoplay muted playsinline loop id="intro-video">
  <!-- Mobile first -->
  <source src="https://.../jarvis-intro-animated-mobile.mp4" 
          type="video/mp4" 
          media="(max-width: 768px)">
  <!-- Desktop -->
  <source src="https://.../jarvis-intro-animated.mp4" 
          type="video/mp4">
</video>
```

---

## Testing Checklist

- [ ] Video uploads to R2 successfully
- [ ] Video autoplays on desktop (Chrome, Firefox, Safari)
- [ ] Video shows "Tap to Start" on iOS (autoplay restriction)
- [ ] Loading overlay appears after video
- [ ] Progress bar updates as nodes/synapses load
- [ ] Smooth fade transition to live graph
- [ ] "Skip Intro" button works
- [ ] Skip preference saved in localStorage
- [ ] Mobile video loads quickly (compressed version)
- [ ] Graceful fallback if video fails to load
- [ ] No console errors
- [ ] Works offline (after initial load)

---

## Optional Enhancements

### A. Video as Animated Background

Instead of fading out completely, video continues as subtle background:

```css
.intro-hero.fade-out {
  opacity: 0.1; /* Instead of 0 */
  visibility: visible;
  pointer-events: none;
}

#intro-video {
  filter: blur(10px) brightness(0.3);
}
```

### B. Dynamic Loading Messages

Rotate through interesting facts while loading:

```javascript
const loadingMessages = [
  'Fetching neurons...',
  'Waking up synapses...',
  'Aligning memories...',
  'Calibrating consciousness...',
  'Almost there...'
];

// Cycle through messages
setInterval(() => {
  const randomMsg = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  this.updateStatus(randomMsg);
}, 2000);
```

### C. First-Time vs Returning Visitor

Show intro only on first visit:

```javascript
const isFirstVisit = !localStorage.getItem('jarvis-visited');
if (!isFirstVisit) {
  this.skipIntro();
} else {
  localStorage.setItem('jarvis-visited', 'true');
}
```

---

## Files Summary

**New files to create:**
1. `/claw/memory/shared/landing-page.css` — Video + loading styles
2. `/claw/memory/shared/landing-page.js` — Transition controller

**Files to modify:**
1. `/claw/memory/index.html` — Add video container, loading overlay
2. `/claw/memory/shared/neural-graph.js` — Accept pre-loaded data

**External dependencies:**
- Cloudflare R2 bucket for video hosting
- wrangler CLI for upload

---

**Created by:** Jarvis (AI Neural Mind)  
**Date:** 2026-02-27 12:12 GMT+7  
**Session:** Sovereign Data Vision — Intro Video Integration  
**Status:** Ready for implementation in Cursor  
**Priority:** High — First impression for all visitors
