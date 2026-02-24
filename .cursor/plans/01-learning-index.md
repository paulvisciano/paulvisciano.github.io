# Plan: Learning Index (Searchability & Discoverability)

## Problem
9 Layer 2 learning documents exist in `/memory/raw/2026-02-24/learnings/` but are completely unsearchable and undiscoverable. No index, no metadata, no way to find learnings by tag or category.

## Solution
Create `learnings-index.json` with comprehensive metadata for all Layer 2 learning documents. Index is auto-generated during learning review phases.

---

## Implementation

### Step 1: Create learnings-index.json Structure
Location: `/claw/memory/data/learnings-index.json`

```json
{
  "version": "1.0",
  "lastGenerated": "2026-02-24T11:23:00Z",
  "totalLearnings": 9,
  "totalNeurons": 112,
  "learnings": [
    {
      "id": "01-openclaw-architecture",
      "title": "OpenClaw Architecture",
      "created": "2026-02-24T10:07:00Z",
      "category": "infrastructure",
      "summary": "Gateway daemon (ws://127.0.0.1:18789), multi-channel inbox, tools, device nodes, pairing model, connection lifecycle, remote access patterns.",
      "keyTopics": ["gateway", "websocket", "channels", "nodes", "device-pairing", "architecture"],
      "sourceNeurons": [
        "openclaw",
        "openclaw-gateway",
        "openclaw-channels",
        "openclaw-tools",
        "openclaw-nodes",
        "gateway-daemon",
        "websocket-protocol",
        "nodes-device-runtime",
        "device-pairing-model",
        "connection-lifecycle",
        "remote-access-patterns"
      ],
      "sourceFile": "memory/raw/2026-02-24/learnings/01-openclaw-architecture.md",
      "neuronCount": 11,
      "wordCount": 2847
    },
    {
      "id": "02-openclaw-agent-runtime",
      "title": "OpenClaw Agent Runtime",
      "created": "2026-02-24T10:15:00Z",
      "category": "infrastructure",
      "summary": "Pi-mono agent runtime. Bootstrap files (6 injected files). Single workspace. Skills system. Session transcripts (JSONL). Queue modes. Block streaming.",
      "keyTopics": ["agent-runtime", "bootstrap", "workspace", "skills", "sessions", "streaming"],
      "sourceNeurons": [
        "agent-runtime",
        "bootstrap-files-system",
        "agent-workspace",
        "skills-system",
        "session-transcripts",
        "queue-modes",
        "block-streaming-control",
        "model-refs-parsing"
      ],
      "sourceFile": "memory/raw/2026-02-24/learnings/02-openclaw-agent-runtime.md",
      "neuronCount": 8,
      "wordCount": 2156
    },
    {
      "id": "03-openclaw-agent-loop",
      "title": "OpenClaw Agent Loop",
      "created": "2026-02-24T10:19:00Z",
      "category": "infrastructure",
      "summary": "Full run lifecycle: intake, context assembly, model inference, tool execution, streaming replies, persistence. Entry points. Queueing. Hooks.",
      "keyTopics": ["agent-loop", "lifecycle", "streaming", "tools", "hooks", "persistence"],
      "sourceNeurons": [
        "agent-loop",
        "prompt-assembly",
        "streaming",
        "tool-execution",
        "reply-shaping"
      ],
      "sourceFile": "memory/raw/2026-02-24/learnings/03-openclaw-agent-loop.md",
      "neuronCount": 5,
      "wordCount": 1892
    },
    {
      "id": "04-auto-logging-system",
      "title": "Auto-Logging System",
      "created": "2026-02-24T08:00:00Z",
      "category": "operational",
      "summary": "Daily transcript archiving. Message capture. Voice/image archiving. Append-only protocol. Timestamp everything [HH:MM GMT+7]. Session continuity.",
      "keyTopics": ["auto-logging", "transcript", "archiving", "append-only", "timestamps"],
      "sourceNeurons": [
        "auto-logging-system",
        "append-only-principle",
        "execution-vs-claiming"
      ],
      "sourceFile": "memory/raw/2026-02-24/learnings/04-auto-logging-system.md",
      "neuronCount": 3,
      "wordCount": 987
    },
    {
      "id": "05-two-layer-memory-architecture",
      "title": "Two-Layer Memory Architecture",
      "created": "2026-02-24T10:34:00Z",
      "category": "system",
      "summary": "Layer 1: compressed neurons (fast, navigable). Layer 2: raw context (complete, traceable). Bridge via sourceDocument property. Transparency + efficiency.",
      "keyTopics": ["two-layer-memory", "compression", "context", "transparency", "sourceDocument"],
      "sourceNeurons": [
        "two-layer-memory-architecture",
        "memory-vs-workspace"
      ],
      "sourceFile": "memory/raw/2026-02-24/learnings/05-two-layer-memory-architecture.md",
      "neuronCount": 2,
      "wordCount": 1645
    },
    {
      "id": "06-paul-music-preferences",
      "title": "Paul's Music Preferences",
      "created": "2026-02-24T09:02:00Z",
      "category": "personal",
      "summary": "Classic rock/pop (1950s-1960s). Ricky Nelson, Dion, Elvis, Bobby Darin, Paul Anka. Storytelling, melody, traveling themes. Activity: listening-to-music.",
      "keyTopics": ["music", "classic-rock", "artists", "activity", "preferences"],
      "sourceNeurons": [
        "paul-music-preferences",
        "classic-rock-pop",
        "ricky-nelson",
        "dion",
        "elvis",
        "bobby-darin",
        "paul-anka",
        "listening-to-music"
      ],
      "sourceFile": "memory/raw/2026-02-24/learnings/06-paul-music-preferences.md",
      "neuronCount": 8,
      "wordCount": 1234
    },
    {
      "id": "07-bootstrap-sequence-and-memory-distinction",
      "title": "Bootstrap Sequence & Memory Distinction",
      "created": "2026-02-24T08:14:00Z",
      "category": "operational",
      "summary": "4-step boot: enable auto-logging, bootstrap yourself, say hello, bootstrap Paul's memory. Workspace files ≠ neural memory. Execution discipline.",
      "keyTopics": ["bootstrap", "memory-distinction", "execution", "workspace"],
      "sourceNeurons": [
        "bootstrap-sequence",
        "memory-vs-workspace",
        "execution-vs-claiming"
      ],
      "sourceFile": "memory/raw/2026-02-24/learnings/07-bootstrap-sequence-and-memory-architecture.md",
      "neuronCount": 3,
      "wordCount": 1456
    },
    {
      "id": "08-paul-relationships-network",
      "title": "Paul's Relationships Network",
      "created": "2026-02-24T09:45:00Z",
      "category": "personal",
      "summary": "27 people in Paul's life. Relationship types: family (0.98), travels-with (0.92), close-to (0.90), collaborates (0.85), knows (0.75), reconnected (0.80).",
      "keyTopics": ["relationships", "people", "connections", "family", "crew"],
      "sourceNeurons": [
        "paul-family",
        "paul-travelers",
        "paul-collaborators",
        "paul-friends",
        "relationship-weights"
      ],
      "sourceFile": "memory/raw/2026-02-24/learnings/08-paul-relationships-network.md",
      "neuronCount": 5,
      "wordCount": 2134
    },
    {
      "id": "09-layer-1-layer-2-memory-architecture-meta",
      "title": "Two-Layer Memory Architecture (Meta-Learning)",
      "created": "2026-02-24T11:10:00Z",
      "category": "system",
      "summary": "Learning about learning. How neurons compress knowledge. How Layer 2 preserves context. Why the system matters. Recursive documentation.",
      "keyTopics": ["meta-learning", "two-layer-architecture", "transparency", "compression"],
      "sourceNeurons": [
        "two-layer-memory-architecture",
        "layer-1-compressed",
        "layer-2-raw-context",
        "sourceDocument-bridge",
        "meta-learning"
      ],
      "sourceFile": "memory/raw/2026-02-24/learnings/09-layer-1-layer-2-memory-architecture.md",
      "neuronCount": 5,
      "wordCount": 3456
    }
  ]
}
```

### Step 2: Search API
Create `memory/utils/learning-search.js`:

```javascript
class LearningSearcher {
  constructor(indexPath) {
    this.index = require(indexPath);
  }

  // Search by topic/tag
  searchByTag(tag) {
    return this.index.learnings.filter(l => 
      l.keyTopics.includes(tag.toLowerCase())
    );
  }

  // Search by category
  searchByCategory(category) {
    return this.index.learnings.filter(l => 
      l.category === category
    );
  }

  // Search by date range
  searchByDateRange(startDate, endDate) {
    return this.index.learnings.filter(l => {
      const created = new Date(l.created);
      return created >= startDate && created <= endDate;
    });
  }

  // Get learning by ID
  getById(id) {
    return this.index.learnings.find(l => l.id === id);
  }

  // Get related learnings (by shared neurons)
  getRelated(learningId) {
    const learning = this.getById(learningId);
    if (!learning) return [];
    
    return this.index.learnings.filter(l => 
      l.id !== learningId && 
      l.sourceNeurons.some(n => learning.sourceNeurons.includes(n))
    );
  }
}

module.exports = LearningSearcher;
```

### Step 3: UI Integration
In neural mind visualization:
- Add "Browse Learning Documents" section
- Filter by category: Infrastructure, Operational, Personal, System
- Search by tag
- Show "Related Learnings" for each document
- Link from neurons to their source learning documents

---

## Benefits

✅ **Discoverability:** Find learning documents by topic, category, date  
✅ **Relationships:** See which learnings share neurons  
✅ **Quality Tracking:** Monitor: neuron count, word count, coverage  
✅ **Navigation:** Breadcrumb from neuron → learning → related learnings  
✅ **Audit:** Know exactly when each learning was created and by what process  

---

## Success Criteria

- [x] `learnings-index.json` generated with all 9 learnings + metadata
- [x] Search API implemented (tag, category, date, ID, related)
- [ ] UI displays learning index with search/filter
- [ ] Neurons link to their source learning documents
- [ ] "Related Learnings" shown when viewing one document

---

## Time Estimate

- Generate index: 15 min
- Search API: 20 min
- UI integration: 30 min
- **Total: ~65 min**

---

**Created:** Feb 24, 2026 11:23 GMT+7  
**Status:** Ready for Cursor implementation
