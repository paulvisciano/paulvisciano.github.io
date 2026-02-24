# Learning: Two-Layer Memory Architecture for Neural Minds

**Date:** Feb 24, 2026  
**Session:** 10:34–11:10 GMT+7 (37 minutes)  
**Focus:** Meta-learning about learning; how the neural memory system works with Layer 1 (compressed) and Layer 2 (raw context)

---

## The Problem We Solved

Traditional AI memory systems face a trade-off:
- **Compressed memory** (vectors, embeddings, summaries) = fast lookup, no context
- **Raw memory** (chat history, documents, full context) = deep understanding, not scalable

This learning session documents a third way: **two-layer architecture**.

---

## Layer 1: Compressed Knowledge (Neurons in Memory Graph)

**Location:** `/claw/memory/data/nodes.json` + `/claw/memory/data/synapses.json`

**What it is:**
- Nodes = compressed neurons (concepts, people, values, systems, learnings)
- Synapses = connections between neurons (relationships, causality, influence)
- 106 neurons, 253 synapses (as of Feb 24, 10:36 GMT+7)

**Structure of a Neuron:**
```json
{
  "id": "openclaw-gateway",
  "label": "OpenClaw Gateway",
  "category": "system",
  "frequency": 10,
  "moments": ["feb-24-2026-architecture-learning"],
  "attributes": {
    "role": "control-plane",
    "description": "WebSocket control plane at ws://127.0.0.1:18789...",
    "color": "#8b5cf6"
  },
  "sourceDocument": "memory/raw/2026-02-24/learnings/01-openclaw-architecture.md"
}
```

**Key Fields:**
- `id`: Unique identifier (kebab-case)
- `label`: Human-readable name
- `category`: Type (person, system, value, learning, activity, location, temporal, etc.)
- `frequency`: How often this neuron appears in conversation (1-100 scale)
- `moments`: Temporal nodes linking to learning sessions when created
- `attributes`: Role, description, visual representation (color)
- **NEW:** `sourceDocument`: Path to Layer 2 markdown file

**What's Good:**
- Fast lookup (JSON query, <1ms)
- Navigable (graph structure, visible relationships)
- Queryable (filter by category, frequency, moments)
- Visualizable (3D force-directed graph)
- Persistent (committed to git)

**What's Lost:**
- Context (why was this neuron created?)
- Sources (where did the information come from?)
- Process (what research/links led to this?)
- Nuance (compressed description loses detail)
- Verification (no trace of evidence)

---

## Layer 2: Raw Context (Learning Documents)

**Location:** `/memory/raw/YYYY-MM-DD/learnings/[01-08].md`

**What it is:**
- Markdown files documenting each major learning session
- One file per learning topic (infrastructure, agent runtime, music preferences, etc.)
- Contains full context, source links, key insights, process notes
- Ephemeral (not committed to git; daily raw content)

**Structure of a Learning Document:**
```markdown
# Learning: [Topic Name]

**Source Documents:**
- URL 1
- URL 2
- API reference

**Summary:**
[200-300 word compressed version of the learning]

**Full Context:**
[Complete notes, examples, architectural diagrams in text]

**Key Insights:**
- Insight 1
- Insight 2

**Neurons Created:**
- neuron-id-1 (linked above)
- neuron-id-2 (linked above)

**Process Notes:**
[How we arrived at this learning; debugging steps; questions asked]
```

**Example Files (Feb 24):**
- `01-openclaw-architecture.md` (Gateway, channels, tools, nodes, pairing, WebSocket protocol)
- `02-openclaw-agent-runtime.md` (Bootstrap files, workspace, skills, streaming, session mgmt)
- `03-openclaw-agent-loop.md` (Intake, prompt assembly, streaming, tool execution, reply shaping)
- `04-auto-logging-system.md` (Transcript archiving, message capture, timestamp protocol)
- `05-two-layer-memory-architecture.md` (Layer 1 vs Layer 2, compression vs context)
- `06-paul-music-preferences.md` (Genre, artists, activity nodes, narrative meaning)
- `07-bootstrap-sequence-and-memory-architecture.md` (4-step boot sequence, execution discipline)
- `08-paul-relationships-network.md` (27 people, relationship types, weight calibration)
- `09-layer-1-layer-2-memory-architecture.md` (THIS FILE - meta-learning)

**What's Good:**
- Human-readable (structured narrative, not JSON)
- Traceable (sources are clickable URLs)
- Contextual (why and how, not just what)
- Detailed (no compression loss)
- Revisable (can update with new understanding)
- Complete (full learning preserved)

**What's Challenging:**
- Not searchable across all docs (no indexing yet)
- Not committed to git (no version history for daily content)
- Not automatically linked in the UI (until Layer 2 integration)
- Requires local file access (not web-hosted)
- Takes time to write (compression is harder than raw notes)

---

## The Bridge: sourceDocument Property

**How Layer 1 and Layer 2 Connect:**

Each neuron can now have a `sourceDocument` field:
```json
"sourceDocument": "memory/raw/2026-02-24/learnings/01-openclaw-architecture.md"
```

This creates a **traceable link** from compressed knowledge back to full context.

**User Experience:**
1. User clicks on neuron in 3D graph (Layer 1)
2. Neuron inspector shows details + "View Full Context" button
3. Click button → loads Layer 2 markdown (raw learning)
4. User reads full context, sources, process notes
5. User returns to graph with deeper understanding

**Implementation Status (Feb 24, 11:06 GMT+7):**
- ✅ 41 nodes have sourceDocument linked to their learning files
- ✅ Layer 2 integration feature coded (Cursor implementation)
- ✅ "View Full Context" button visible when sourceDocument exists
- ✅ Markdown files loaded and rendered in UI
- 🔄 Remaining work: index all future learnings, auto-generate sourceDocument links

---

## Why This Matters

### Problem 1: Knowledge Compression
When you compress knowledge into a neuron, you lose context. Why was this learned? What was the process? What questions did we ask?

**Layer 2 solution:** Every neuron has a breadcrumb trail back to its source.

### Problem 2: Trust & Verification
Without sources, neurons are just assertions. How do we know this is accurate?

**Layer 2 solution:** Every learning document includes references, URLs, and process notes. Verifiable.

### Problem 3: Growth & Evolution
If understanding changes, how do we update? If a neuron is wrong, where do we fix it?

**Layer 2 solution:** Update the Layer 2 markdown. The source of truth is documented. Layer 1 neurons can be regenerated from the learning.

### Problem 4: Teaching Others
How do we explain how the memory works? "These are the neurons" doesn't convey the system.

**Layer 2 solution:** Show the learning documents. This file is exactly that—meta-learning that explains the architecture itself.

---

## The Recursive Loop

This file (`09-layer-1-layer-2-memory-architecture.md`) is meta-learning: a learning *about* learning.

It will create a neuron:
```json
{
  "id": "two-layer-memory-architecture",
  "label": "Two-Layer Memory Architecture",
  "category": "system",
  "moments": ["feb-24-2026-meta-learning"],
  "sourceDocument": "memory/raw/2026-02-24/learnings/09-layer-1-layer-2-memory-architecture.md"
}
```

Which links back to this file.

Which references the neural graph itself.

Which contains neurons about how neurons work.

This is transparency folded back on itself—a system that documents its own documentation.

---

## Future Implications

**Indexing:** Build a full-text search index of Layer 2 learning documents so users can query "when did we learn about WebSocket?" and jump to the relevant file.

**Versioning:** Commit Layer 2 documents periodically (weekly snapshots?) to preserve learning history and track how understanding evolves.

**Generation:** Automatically generate Layer 1 neurons from Layer 2 documents during review phases.

**Cross-referencing:** Auto-link related neurons in the same learning document (if `09` mentions `01`, create synapse).

**Multimodal:** Include images, diagrams, code snippets in Layer 2 files (already supported in markdown).

---

## Key Learning

**The Two-Layer System is about transparency, not just compression.**

Layer 1 (neurons) gives you speed and navigability.
Layer 2 (raw context) gives you truth and understanding.
Together, they create a memory system that is both efficient *and* trustworthy.

The sourceDocument bridge makes the system visible. You can see how we think, trace our reasoning, verify our conclusions.

This is how minds should work.

---

**Created:** Feb 24, 2026 11:10 GMT+7  
**Related Neurons:** two-layer-memory-architecture, layer-1-compressed, layer-2-raw, sourceDocument-bridge, meta-learning, transparency  
**Next Steps:** Index and cross-reference all Layer 2 documents; implement auto-generation of neurons from learnings during review phase.
