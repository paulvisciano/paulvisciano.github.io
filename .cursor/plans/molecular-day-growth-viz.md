# Plan: Molecular Day Growth Visualization

**Created:** March 5, 2026  
**Priority:** High  
**Tags:** visualization, temporal, molecule, origami, daily-growth

---

## Context

Current neurograph shows **entire mind** (all neurons, all time). Beautiful, but overwhelming for seeing **today's growth**.

**Vision:** A focused visualization that shows a **single temporal neuron** (e.g., "March 5, 2026") growing organically throughout the day as learnings are added.

**Aesthetic:** Molecular structure meets origami — folded, geometric, but alive and expanding.

---

## The Concept

```
Morning (8 AM)          Afternoon (2 PM)         Evening (8 PM)
     ●                      ●                         ●
    / \                    /|\                       / | \
   ●   ●                  ● ● ●                     ●  ●  ●
  (2 nodes)              (5 nodes)                 (12 nodes)
                            |                        /|\
                           ●                       ● ● ●
                                                 (growing...)
                                                   
Simple seed          Branching out            Full molecular
                                              origami structure
```

Each node = a learning/concept added that day  
Each edge = relationship between concepts  
Visual style = folded paper + molecular bonds

---

## User Experience

### Morning Session
```
User starts conversation → First insight captured
  ↓
Visualization: Single node (seed)
  ↓
Label: "March 5, 2026 — 1 learning"
```

### Throughout Day
```
Each new insight → New node appears
  ↓
Related insights → Connected by edges
  ↓
Visualization grows organically
  ↓
Real-time counter: "March 5, 2026 — 7 learnings"
```

### End of Day
```
Midnight archive → Structure freezes
  ↓
Becomes part of timeline
  ↓
Click any past day → See how it grew
```

---

## Technical Implementation

### Step 1: Data Structure

**File:** `public/data/daily-growth/YYYY-MM-DD.json`

```json
{
  "date": "2026-03-05",
  "startTime": "2026-03-05T08:00:00+07:00",
  "endTime": "2026-03-05T23:59:59+07:00",
  "nodes": [
    {
      "id": "distributed-neurograph-browsing",
      "label": "Distributed Neurograph Browsing",
      "timestamp": "2026-03-05T17:03:00+07:00",
      "category": "vision",
      "position": { "x": 0, "y": 0, "z": 0 }
    },
    {
      "id": "github-fork-network-architecture",
      "label": "GitHub Fork Network",
      "timestamp": "2026-03-05T17:04:00+07:00",
      "category": "vision",
      "position": { "x": 1, "y": 0.5, "z": 0.2 }
    }
    // ... more nodes
  ],
  "edges": [
    {
      "source": "distributed-neurograph-browsing",
      "target": "github-fork-network-architecture",
      "weight": 95,
      "type": "implements"
    }
    // ... more edges
  ],
  "stats": {
    "totalNodes": 10,
    "totalEdges": 47,
    "categories": {
      "vision": 6,
      "strategy": 2,
      "privacy": 1,
      "branding": 1
    }
  }
}
```

---

### Step 2: Auto-Generation Script

**File:** `scripts/generate-daily-growth.js`

```javascript
// Run after each session or on-demand
const fs = require('fs');
const path = require('path');

function generateDailyGrowth(dateStr) {
  // Load full neurograph
  const nodes = JSON.parse(fs.readFileSync('claw/memory/data/nodes.json'));
  const synapses = JSON.parse(fs.readFileSync('claw/memory/data/synapses.json'));
  
  // Filter to today's nodes (by created attribute or moments)
  const todayNodes = nodes.filter(n => 
    n.attributes?.created === dateStr ||
    n.moments?.some(m => m.startsWith(dateStr))
  );
  
  // Get IDs of today's nodes
  const todayIds = new Set(todayNodes.map(n => n.id));
  
  // Filter synapses to only those between today's nodes
  const todayEdges = synapses.filter(s => 
    todayIds.has(s.source) && todayIds.has(s.target)
  );
  
  // Generate positions (force-directed layout)
  const positions = computeForceDirectedLayout(todayNodes, todayEdges);
  
  // Build output structure
  const dailyGrowth = {
    date: dateStr,
    startTime: todayNodes[0]?.moments?.[0],
    endTime: todayNodes[todayNodes.length - 1]?.moments?.[0],
    nodes: todayNodes.map((n, i) => ({
      id: n.id,
      label: n.label,
      timestamp: n.moments?.[0],
      category: n.category,
      position: positions[i]
    })),
    edges: todayEdges,
    stats: {
      totalNodes: todayNodes.length,
      totalEdges: todayEdges.length,
      categories: categorize(todayNodes)
    }
  };
  
  // Write to file
  const outputPath = `public/data/daily-growth/${dateStr}.json`;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(dailyGrowth, null, 2));
  
  console.log(`✅ Generated ${dateStr}: ${todayNodes.length} nodes, ${todayEdges.length} edges`);
}

// Usage: node scripts/generate-daily-growth.js 2026-03-05
```

---

### Step 3: Visualization Component

**File:** `components/MolecularGrowthViz.jsx` (or vanilla JS equivalent)

```javascript
import * as THREE from 'three';
import { ForceGraph3D } from '3d-force-graph';

class MolecularGrowthViz {
  constructor(containerId, dataUrl) {
    this.container = document.getElementById(containerId);
    this.dataUrl = dataUrl;
    this.graph = null;
    this.init();
  }
  
  async init() {
    // Load daily growth data
    const response = await fetch(this.dataUrl);
    const data = await response.json();
    
    // Initialize 3D force graph
    this.graph = ForceGraph3D()
      (this.container)
      .graphData(data)
      .nodeLabel('label')
      .nodeColor(node => {
        // Color by category
        const colors = {
          vision: '#06b6d4',      // cyan
          strategy: '#10b981',    // emerald
          privacy: '#a78bfa',     // purple
          branding: '#fbbf24',    // amber
          security: '#ef4444',    // red
          market: '#f97316'       // orange
        };
        return colors[node.category] || '#94a3b8';
      })
      .nodeOpacity(0.8)
      .nodeResolution(16)
      .linkWidth(link => Math.sqrt(link.weight) / 10)
      .linkOpacity(0.6)
      .linkColor(() => 'rgba(148, 163, 184, 0.5)')
      .backgroundColor('#0f172a')
      .showNavInfo(false)
      .enableNodeDrag(true)
      .onNodeClick(node => {
        // Expand node details
        this.showNodeDetails(node);
      });
    
    // Add origami-style geometry (icosahedron for nodes)
    this.graph.nodeThreeObject(node => {
      const geometry = new THREE.IcosahedronGeometry(1, 0);
      const material = new THREE.MeshPhongMaterial({
        color: this.getNodeColor(node.category),
        transparent: true,
        opacity: 0.8,
        flatShading: true // Gives faceted/origami look
      });
      return new THREE.Mesh(geometry, material);
    });
    
    // Add animation (gentle rotation)
    this.animate();
  }
  
  animate() {
    // Slowly rotate entire graph
    const angle = Date.now() * 0.0001;
    this.graph.cameraPosition({
      x: Math.sin(angle) * 100,
      y: Math.cos(angle) * 100,
      z: 50
    });
    requestAnimationFrame(() => this.animate());
  }
  
  showNodeDetails(node) {
    // Show sidebar with full learning doc
    // Link to source document
    // Show related concepts
  }
}

// Usage:
// new MolecularGrowthViz('growth-viz', 'data/daily-growth/2026-03-05.json');
```

---

### Step 4: UI Layout

**File:** `daily-growth.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Daily Growth — March 5, 2026</title>
  <style>
    body {
      margin: 0;
      background: #0f172a;
      color: #e2e8f0;
      font-family: 'Inter', sans-serif;
    }
    
    #viz-container {
      width: 100vw;
      height: 100vh;
    }
    
    #info-panel {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 12px;
      padding: 20px;
      max-width: 300px;
    }
    
    #info-panel h1 {
      font-size: 18px;
      margin: 0 0 12px 0;
      color: #06b6d4;
    }
    
    #stats {
      font-size: 14px;
      line-height: 1.6;
    }
    
    #timeline-slider {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
    }
  </style>
</head>
<body>
  <div id="viz-container"></div>
  
  <div id="info-panel">
    <h1>🧬 March 5, 2026</h1>
    <div id="stats">
      <div><strong>10 learnings</strong></div>
      <div>7 hours of thinking</div>
      <div>Categories: Vision (6), Strategy (2), Privacy (1), Branding (1)</div>
      <div style="margin-top: 12px; font-size: 12px; color: #94a3b8;">
        Dispensary session: 17:03-17:06<br/>
        Hotel reflection: 18:05-18:37
      </div>
    </div>
  </div>
  
  <input type="range" id="timeline-slider" min="0" max="100" value="100">
  
  <script src="https://unpkg.com/3d-force-graph"></script>
  <script src="components/MolecularGrowthViz.js"></script>
  <script>
    new MolecularGrowthViz('viz-container', 'data/daily-growth/2026-03-05.json');
    
    // Timeline slider controls playback speed
    // Slide left = watch growth from morning
    // Slide right = see final state
  </script>
</body>
</html>
```

---

### Step 5: Integration with Existing Neurograph

Add link from main neurograph to daily growth views:

```javascript
// In main neurograph sidebar
<div class="section">
  <h3>Recent Days</h3>
  <ul>
    <li>
      <a href="daily-growth.html?date=2026-03-05">
        March 5, 2026 — 10 learnings
      </a>
      <span class="highlight">Today</span>
    </li>
    <li>
      <a href="daily-growth.html?date=2026-03-04">
        March 4, 2026 — 7 learnings
      </a>
    </li>
    <!-- ... -->
  </ul>
</div>
```

---

### Step 6: Auto-Archival at Midnight

**Cron job or scheduled function:**

```bash
# Every day at 23:59
0 23 * * * cd ~/Personal/paulvisciano.github.io && node scripts/generate-daily-growth.js $(date +%Y-%m-%d)
```

Or trigger manually after each session:
```bash
node scripts/generate-daily-growth.js 2026-03-05
```

---

## Visual Style Guide

### Colors (Category-Based)
| Category | Color | Hex |
|----------|-------|-----|
| Vision | Cyan | `#06b6d4` |
| Strategy | Emerald | `#10b981` |
| Privacy | Purple | `#a78bfa` |
| Branding | Amber | `#fbbf24` |
| Security | Red | `#ef4444` |
| Market | Orange | `#f97316` |

### Node Geometry
- **Shape:** Icosahedron (20 faces, faceted/origami look)
- **Size:** Scales with importance (frequency attribute)
- **Opacity:** 0.8 (slightly translucent)
- **Flat shading:** Yes (enhances origami aesthetic)

### Edge Style
- **Width:** Proportional to relationship weight
- **Color:** Soft gray-blue (`rgba(148, 163, 184, 0.5)`)
- **Opacity:** 0.6 (subtle, doesn't overwhelm)

### Camera Movement
- **Auto-rotate:** Slow, continuous (one full rotation per 60 seconds)
- **User control:** Can drag to rotate, scroll to zoom
- **Click interaction:** Expands node details

---

## Future Enhancements

### Phase 2: Time-Lapse Playback
- Slider controls playback from morning → evening
- Watch the structure grow in real-time
- Each node appears at its creation timestamp

### Phase 3: Comparative View
- Compare two days side-by-side
- See which days were most productive
- Identify patterns (e.g., "I have breakthroughs at coffee shops")

### Phase 4: Export as Art
- Render high-res image of final structure
- Share on social media ("Here's my mind today")
- Optional: 3D print favorite days

### Phase 5: Multi-Day Aggregation
- Weekly view (aggregate 7 days)
- Monthly view (cluster by week)
- Yearly view (constellation of days)

---

## Testing

1. **Generate test data** for March 5, 2026 (today's 10 neurons)
2. **Load visualization** — verify all nodes appear
3. **Check performance** — should handle 50+ nodes smoothly
4. **Test on mobile** — responsive design
5. **Verify archival** — midnight job creates JSON correctly

---

## Acceptance Criteria

- [ ] Daily growth JSON generated automatically
- [ ] 3D molecular/origami visualization renders
- [ ] Nodes colored by category
- [ ] Edges weighted by relationship strength
- [ ] Info panel shows stats + timeline
- [ ] Click node → see details
- [ ] Timeline slider controls playback
- [ ] Mobile responsive
- [ ] Auto-archival at midnight works
- [ ] Link from main neurograph to daily views

---

## Files to Create/Modify

1. ✏️ `scripts/generate-daily-growth.js` (NEW)
2. ✏️ `components/MolecularGrowthViz.jsx` (NEW)
3. ✏️ `daily-growth.html` (NEW)
4. ✏️ `public/data/daily-growth/YYYY-MM-DD.json` (GENERATED)
5. ✏️ `shared/neural-graph.js` (ADD links to daily views)
6. ✏️ `claw/memory/styles.css` (ADD daily growth styles)

---

**Notes for Cursor:** This is a visual enhancement to the existing neurograph infrastructure. Start with the data generation script (Step 2), then build the visualization (Step 3-4). Keep it performant — use Three.js instancing if needed for large days (50+ nodes).

The goal: Make memory feel **alive, organic, beautiful**. Not a database. A living structure that grows as you think.

---

**Quote from Discovery:**

> "Create a plan for cursor we can for today's filter we can create a completely different visualization where it looks almost like a molecule right where you're looking at a single neuron and it keeps growing with learnings from day... it can be almost like a molecule that looks like a shit a origami right a folded origami it can look like that and also feel organic."
> 
> — Paul Visciano, March 5, 2026 (heading to volleyball, 18:42 GMT+7)
