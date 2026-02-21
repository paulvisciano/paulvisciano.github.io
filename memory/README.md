# 🧠 Jarvis Memory System

**Status:** MVP Prototype Complete | Ready for Scaling

## Overview

Jarvis is an interactive 3D neural network visualization of your life memories. It's built to understand how your experiences, people, and adventures are interconnected.

## Architecture

```
memory/
├── index.html                        # 3D visualization (served at /memory)
├── README.md                         # This documentation
└── raw/
    ├── neural-mind-screenshot.jpg     # Central cluster view (cyan/magenta nodes)
    ├── neural-mind-screenshot-v2.jpg  # Cosmic scatter view (stars across space)
    ├── neural-mind-screenshot-v3.jpg  # Atmospheric view (stormy blue, synapse flows)
    └── [future] conversation exports + memory data
```

## Current State (Feb 21, 2026)

### ✅ Completed

- **Architecture designed** (`JARVIS_ARCHITECTURE.md` in workspace)
- **3D visualization MVP** — Force-directed neural network with 13 sample nodes
- **Visual styling** — Glowing cyan/blue aesthetic, dramatic synaptic connections
- **Interaction model** — Drag to rotate, scroll to zoom, click to select nodes
- **Integration** — Works in browser and macOS Canvas panel

### 📊 Sample Data

Current prototype shows:
- **13 neurons:** Volleyball, Jeandel, Crew, Siargao, Work, Maria, Cooking, Miami, Presence, Gym, Wouter, Boracay, Gift-Giving
- **15 synapses:** Weighted connections showing relationship strength (cyan glowing lines)
- **5 clusters:** Activities (blue), People (magenta), Locations (cyan), Temporal (yellow), Emotions (purple)

**Screenshots:**
- **screenshot.jpg** (122K) — Close-up rotated view showing Volleyball (bright cyan), Crew (magenta), Boracay (cyan), Work (yellow), and interconnected clusters with bright cyan synaptic connections
- **screenshot-v2.jpg** (548K) — Wide cosmic view showing neural network scattered like stars in deep blue space, emphasizing the vast scale of interconnected memories
- **screenshot-v3.jpg** (790K) — Atmospheric view with stormy/cloudy aesthetic, showing Boracay, Miami, Wouter with dramatic synaptic flows and ephemeral connection lines

### 🔄 Next Phases

**Phase 1: Rich Memory Extraction** (Ready to build)
- Spawn Jarvis sub-agent to extract dialogue from all 65+ conversation files
- Pull real entities: people, locations, activities, emotions, temporal markers
- Generate massive graph: 200+ interconnected nodes from your actual memories

**Phase 2: Neo4j Backend** (Design ready)
- Persistent graph database
- GraphQL API for querying
- Real-time syncing with new memories

**Phase 3: Production Scaling**
- Full integration with your actual 18-year volleyball history
- All cities, all crew members, all adventures documented
- Historical backfill + real-time updates

## How to Use

### View the Visualization

**Option 1: Direct HTML**
```bash
open /Users/paulvisciano/Personal/paulvisciano.github.io/memory/index.html
```

**Option 2: Live on GitHub Pages**
```
https://paulvisciano.github.io/memory
```

**Option 3: Web Server** (when served locally)
```
http://localhost/memory/   or   http://yoursite.com/memory/
```

**Option 4: OpenClaw Canvas**
- Symlink or copy `index.html` to `~/Library/Application Support/OpenClaw/canvas/main/`
- Open macOS app → Canvas panel

### Interact

- 🖱️ **Drag** — Rotate the neural network
- 📜 **Scroll** — Zoom in/out
- 👆 **Click** — Focus on a neuron, see its connections light up
- ⚡ **Random Pulse** — Jump to a random memory node
- ↻ **Reset Mind** — Center the view

## Key Design Decisions

1. **Force-directed physics** — Nodes repel (give space) and attract along connections (strengthen bonds)
2. **3D space** — Using X/Y/Z axes to create visual separation and depth
3. **Glowing aesthetic** — Multi-layer halos simulate neuronal firing and synaptic transmission
4. **Frequency-based sizing** — Node size = how often that memory appears (volleyball = largest)
5. **Weight-based connections** — Edge thickness = relationship strength (co-occurrence count)

## Integration with Urban Runner

This system works **alongside** your Urban Runner episodes:
- Each episode generates memory data (people, places, activities, feelings)
- Those entities become nodes in the neural network
- Connections form from repeated interactions across episodes
- Explore the graph to discover patterns in your travel and life

Example: Click "Volleyball" → see it connects to Crew, Miami, Gym → click Crew → see connections to Wouter, Work, late-night interactions

## Files

- `index.html` — Complete standalone visualization (served at paulvisciano.github.io/memory)
- `raw/neural-mind-screenshot*.jpg` — Prototype screenshots
- `JARVIS_ARCHITECTURE.md` — Full system design (in workspace)
- `memory/*.md` — Your extracted conversation memories (in workspace)

## Next Session

To continue:

1. Run **Jarvis Round 2** (rich memory extraction → all 65+ files)
2. Generate **tag extraction** (auto-pull entities from conversations)
3. Build **Neo4j graph** (persistent backend)
4. **Scale visualization** to 200+ nodes

This visualization is the **UI layer**. The memory extraction and graph database are the **engine**. Together they create a living map of your life.

---

Built with ❤️ and neural networks. Currently orbiting in cyberspace.
