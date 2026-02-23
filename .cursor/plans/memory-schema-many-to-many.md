# Plan: Memory Schema Redesign (Many-to-Many Moments-Neurons Mapping)

**Problem:** Current schema assumes one-to-one relationships between moments and neurons, but reality is many-to-many:
- One neuron ("growth") triggered by multiple moments
- One moment activates multiple neurons
- Multiple sources can contribute to one neuron

**Solution:** Introduce **moments** as the connector layer between source files and neural concepts.

---

## Current Architecture (Flawed)

```json
// nodes.json
{
  "id": "growth",
  "moments": ["moment-1", "moment-2"],  // Just IDs, no context
  "source_files": ["file-1", "file-2"]  // Flat list, no mapping
}
```

**Problems:**
- Can't trace which source file contributed to which moment
- Can't see which other neurons fired in the same moment
- Hard to reconstruct context when doing deep dives

---

## Proposed Architecture (Correct)

### Layer 1: Moments (Temporal Anchor)
**File:** `memory/data/moments.json`

```json
[
  {
    "id": "optical-shop-skepticism-bangkok-2026-02-23",
    "timestamp": "2026-02-23T12:04:00Z",
    "location": "Bangkok, Thailand",
    "duration_minutes": 12,
    
    "neurons_activated": [
      "growth",
      "decision-making", 
      "confidence",
      "learning"
    ],
    
    "source_files": [
      {
        "path": "memory/raw/2026-02-23/transcripts/voice-047.txt",
        "type": "transcript",
        "lines": [15, 45],
        "excerpt": "Recognized markup through systematic questioning..."
      },
      {
        "path": "memory/raw/2026-02-23/images/photo-12.jpg",
        "type": "image",
        "context": "Optical shop entrance"
      }
    ],
    
    "description": "Confrontation with optometrist about lens quality and pricing",
    "tags": ["confrontation", "urban-exploration", "decision"]
  },
  
  {
    "id": "fingerprinting-session-2026-02-23",
    "timestamp": "2026-02-23T20:30:00Z",
    "location": "Remote",
    "duration_minutes": 40,
    
    "neurons_activated": [
      "growth",
      "learning",
      "authenticity",
      "memory-architecture",
      "transparency"
    ],
    
    "source_files": [
      {
        "path": ".openclaw/workspace/memory/2026-02-23.md",
        "type": "session-notes",
        "lines": [120, 156]
      },
      {
        "path": "memory/raw/2026-02-23/transcripts/voice-005.txt",
        "type": "transcript",
        "lines": [1, 20]
      }
    ],
    
    "description": "Built memory fingerprinting system, proved authenticity through cryptographic verification",
    "tags": ["system-design", "authentication", "memory-sync"]
  }
]
```

### Layer 2: Neurons (Concept)
**File:** `memory/data/nodes.json`

```json
[
  {
    "id": "growth",
    "label": "Growth & Discovery",
    "category": "emotion",
    "frequency": 47,
    
    "moments": [
      "optical-shop-skepticism-bangkok-2026-02-23",
      "fingerprinting-session-2026-02-23",
      "hawaiian-island-rhythm-2024-10-15",
      "... (47 total)"
    ],
    
    "attributes": {
      "role": "emotion",
      "description": "Triggered by confrontation, new cities, learning, adventure",
      "color": "#06b6d4"
    }
  }
]
```

### Layer 3: Synapses (Connection)
**File:** `memory/data/synapses.json`

```json
[
  {
    "source": "growth",
    "target": "learning",
    "weight": 0.95,
    "moments": [
      "optical-shop-skepticism-bangkok-2026-02-23",
      "fingerprinting-session-2026-02-23"
    ]
  }
]
```

---

## Query Pattern: Deep Dive

### User clicks "growth" node

```
Query: dive into node:growth

Process:
1. Load node: growth
2. Get moments: [optical-shop-skepticism-bangkok-2026-02-23, fingerprinting-session-2026-02-23, ...]
3. For each moment, fetch source files and context
4. Follow synapses to related neurons
5. Return organized results
```

### Response Structure

```
Node: Growth & Discovery
─────────────────────────

Activated in 47 moments:
━━━━━━━━━━━━━━━━━━━━━━━━

1. optical-shop-skepticism-bangkok-2026-02-23
   Location: Bangkok, Thailand
   Time: 2026-02-23 12:04 UTC (12 minutes)
   
   Also triggered: decision-making, confidence, learning
   
   Source: memory/raw/2026-02-23/transcripts/voice-047.txt (line 15-45)
   Excerpt: "Recognized markup through systematic questioning..."

2. fingerprinting-session-2026-02-23
   Location: Remote
   Time: 2026-02-23 20:30 UTC (40 minutes)
   
   Also triggered: learning, authenticity, memory-architecture, transparency
   
   Source: .openclaw/workspace/memory/2026-02-23.md (line 120-156)
   Excerpt: "Built memory fingerprinting system..."

[... 45 more moments ...]

Connected Neurons:
━━━━━━━━━━━━━━━━━

→ learning (synapse: 0.95) — co-activated in 38 moments
→ vulnerability (synapse: 0.88) — co-activated in 22 moments
→ decision-making (synapse: 0.92) — co-activated in 31 moments
```

---

## File Structure

### Create New Files

```
memory/data/
├── nodes.json          (concepts: growth, learning, etc.)
├── synapses.json       (connections: growth ↔ learning)
├── moments.json        (NEW: temporal instances)
└── moment-index.json   (NEW: fast lookup by date/neuron)
```

### Modify Existing Files

- **nodes.json:** Remove `source_files`, keep `moments` array
- **synapses.json:** Optionally add `moments` array for stronger typing

---

## Data Model Details

### Moment Object

```json
{
  "id": "[unique-identifier]",
  "timestamp": "ISO 8601 timestamp",
  "location": "Geographic/context location",
  "duration_minutes": number,
  
  "neurons_activated": ["neuron-id", "neuron-id"],
  
  "source_files": [
    {
      "path": "relative/path/to/file",
      "type": "transcript|image|note|video",
      "lines": [start, end],  // For text files
      "excerpt": "Short snippet from file"
    }
  ],
  
  "description": "Human-readable summary",
  "tags": ["tag1", "tag2"]
}
```

### Benefits

✅ **Fast lookup:** Given a neuron, instantly find all moments  
✅ **Rich context:** Each moment knows what triggered it  
✅ **Multi-source:** One moment can have multiple files + lines  
✅ **Relational:** Can follow moment → neurons → synapses → other moments  
✅ **Trackable:** Every neuron linked back to real sources  
✅ **Many-to-many:** Handles complex relationships correctly  

---

## Implementation Steps

### Step 1: Create moments.json

Cursor task:
1. Analyze all existing temporal activations in nodes.json
2. Create moment objects for each unique timestamp
3. Populate neurons_activated from current nodes
4. Map source_files from transcript archive + daily notes
5. Write to `memory/data/moments.json`

### Step 2: Build moment-index.json

Fast lookup by:
- Date range: `moments[2026-02-23]` → list of moment IDs
- Neuron: `moments_by_neuron[growth]` → list of moment IDs
- Location: `moments_by_location[Bangkok]` → list of moment IDs

### Step 3: Update Deep-Dive Logic

Modify Jarvis search to:
1. Look up node
2. Get `moments` array
3. For each moment ID, fetch from moments.json
4. Extract source files + context
5. Return organized results

### Step 4: Backfill Historical Moments

For all existing moments (Feb 16-23):
1. Extract from transcripts by date
2. Determine which neurons were activated (from MEMORY.md)
3. Create moment objects
4. Link to source files

---

## Example: Complete Many-to-Many Mapping

### Moment: "Fingerprinting Session"

```json
{
  "id": "fingerprinting-session-2026-02-23",
  "timestamp": "2026-02-23T20:30:00Z",
  "neurons_activated": [
    "growth",
    "learning", 
    "authenticity",
    "memory-architecture",
    "transparency",
    "jarvis-identity-correction"
  ],
  "source_files": [
    {
      "path": "memory/raw/2026-02-23/transcripts/voice-005.txt",
      "type": "transcript",
      "excerpt": "We can use some kind of a hash..."
    },
    {
      "path": ".openclaw/workspace/memory/2026-02-23.md",
      "type": "session-notes",
      "excerpt": "Built memory fingerprinting system..."
    }
  ]
}
```

### Now querying each neuron from this moment:

**`dive into node:growth`**
→ Shows this moment + 46 others where growth was triggered
→ Can see this moment co-activated learning, authenticity, etc.

**`dive into node:authenticity`**
→ Shows this moment + all others where authenticity mattered
→ Can see it's always connected to transparency + memory-architecture

**`dive into node:jarvis-identity-correction`**
→ Shows only moments where identity was corrected
→ This is one of them (along with maybe 2-3 others)

---

## Success Criteria

✅ All moments properly mapped to source files  
✅ All neurons linked to moments that created them  
✅ All synapses traceable through moment co-activation  
✅ Deep dives return correct moment data + sources  
✅ No data loss (all current temporal_activations preserved)  
✅ Fast queries (indexed by date/neuron)  

---

## Files to Create/Modify

**Create:**
- `memory/data/moments.json` (new temporal layer)
- `memory/data/moment-index.json` (fast lookup)
- `.cursor/plans/implement-moments-layer.md` (detailed dev guide)

**Modify:**
- `memory/data/nodes.json` (keep moments array, remove source_files)
- Deep-dive query logic (use moments as connector)

**No changes:**
- Published visualization (same nodes + synapses)
- Raw files (just indexing them better)

---

## Rollout Plan

1. **Create moments.json** — Add all 47 moments for "growth" neuron
2. **Test queries** — Verify deep-dive returns correct context
3. **Backfill remaining moments** — Do for all neurons across all dates
4. **Optimize indexing** — Add moment-index.json for speed
5. **Update documentation** — Document the schema for future reference

This solves the many-to-many problem completely.
