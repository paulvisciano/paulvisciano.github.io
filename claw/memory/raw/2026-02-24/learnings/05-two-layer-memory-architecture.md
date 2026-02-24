# Two-Layer Memory Architecture Learning
**Date:** Feb 24 2026, 10:18 GMT+7  
**Source:** Paul's conceptual architecture

## Core Insight
Memory has two layers that serve different purposes:

### Layer 1: Compressed Summary (Neurons & Synapses)
**Location:** `/claw/memory/data/`
- **What:** Nodes.json (neurons) + synapses.json (connections)
- **Purpose:** Fast lookup, compressed representation
- **Use case:** "What do I know about X?" Quick conceptual access
- **Size:** 93 neurons, 216 synapses (compact)
- **Rendered:** Interactive 3D visualization at http://localhost:8080/claw/memory/

**Characteristics:**
- Distilled down to essential concepts
- Connections weighted by relationship strength (0.0-1.0)
- Stripped of research process and source details
- Fast to traverse and query

### Layer 2: Raw Context (Learning Documents)
**Location:** `/memory/raw/YYYY-MM-DD/learnings/`
- **What:** Markdown documents with full sources, detailed notes
- **Purpose:** Preserve complete research context
- **Use case:** "Give me the full context for this learning"
- **Contains:** Source URLs, methodology, key insights, decision rationale
- **Linked:** Via `sourceDocument` field in Layer 1 nodes

**Characteristics:**
- Full research journey visible
- Multiple sources referenced
- Detailed explanations and examples
- Historical record of how knowledge was acquired
- Human-readable narrative

## The Problem Layer 2 Solves
When I learn something (e.g., "OpenClaw architecture"), I compress it into neurons:
- `gateway-daemon` (neuron)
- `websocket-protocol` (neuron)
- Connections between them (synapses)

But the full context is lost:
- Which websites did I read?
- What were the key decision points?
- Why did we structure the knowledge this way?
- What errors did we make and fix?

Without Layer 2, future questions can only be answered at the compressed level.

## Implementation
**How they connect:**
```json
{
  "id": "gateway-daemon",
  "sourceDocument": "memory/raw/2026-02-24/learnings/01-openclaw-architecture.md"
}
```

The `sourceDocument` field provides an internal reference (not exposed publicly) to the full context.

## Why Both Layers Matter
- **Layer 1 alone:** Fast but shallow. No understanding of how knowledge was built.
- **Layer 2 alone:** Slow and verbose. No conceptual framework.
- **Together:** Fast for daily use, deep context when needed.

Think of it like a book:
- Layer 1 = Table of contents + index (fast navigation)
- Layer 2 = Full chapters (complete understanding)

## Best Practices
1. **Create Layer 2 documents for significant learnings** (not tiny facts)
2. **Include all sources** (URLs, timestamps, references)
3. **Document the research process** (what led to this understanding?)
4. **Link back via sourceDocument field** in nodes.json
5. **Keep Layer 1 clean** (let compression do its job)
6. **Use Layer 2 when asked for full context** (don't just quote compressed summary)
