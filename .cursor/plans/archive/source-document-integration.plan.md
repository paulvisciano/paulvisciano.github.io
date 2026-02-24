---
name: Source Document Integration for Neural Mind UI
overview: Add a deep-dive feature so users can click any neuron and see its Layer 2 source document—full context, references, and raw learning behind the compressed node.
status: archived
archived_at: "2026-02-24"
todos:
  - id: metadata-index
    content: Create metadata index of all learning documents (names, timestamps, related nodes)
    status: cancelled
  - id: local-file-access
    content: Serve Layer 2 markdown only when running locally (e.g. local API); no public copy
    status: completed
  - id: node-inspector-source
    content: Query node sourceDocument when selected; add "View Full Context" when present
    status: completed
  - id: fetch-render-markdown
    content: Fetch and parse markdown (summary, sources, full context); render with marked.js
    status: completed
  - id: ui-component
    content: Display source doc in side panel, modal, or breadcrumb (choose option)
    status: completed
  - id: related-neurons
    content: Show related neurons that reference the same source document
    status: cancelled
isProject: false
---

# Plan: Source Document Integration for Neural Mind UI

**Outcome:** Archived 2026-02-24. Full Context button shipped in memory/ and claw/memory/: shows file-on-disk path and Cursor tip; on localhost fetches and displays source doc when served from repo. sourceDocument passed through node mapping; music preference node linked. Future: metadata index, related-neurons, markdown rendering.

**Purpose:** Add a deep-dive feature to the neural mind visualization so users can click on any neuron and see its Layer 2 source document—the full context, references, and raw learning behind the compressed node.

---

## Current State

**Layer 1 (compressed):** Neurons in `/claw/memory/data/nodes.json`

- 106 neurons, 253 synapses
- Each neuron has optional `sourceDocument` field (relative path to markdown)
- 41 neurons have sourceDocument linked to Layer 2

**Layer 2 (raw context):** Learning documents in `/memory/raw/2026-02-24/learnings/`

- 8 markdown files with full context, sources, and references
- One file per learning session (infrastructure, agent runtime, agent loop, auto-logging, memory architecture, music preferences, bootstrap, relationships)
- NOT committed to git (ephemeral daily content)

---

## Feature Design

### 1. Node Inspector Panel

When a neuron is clicked in the 3D graph:

- Show neuron details (label, category, frequency, attributes)
- **NEW:** If `sourceDocument` exists, display a "View Full Context" button/link
- Button opens Layer 2 document in split-pane or modal

### 2. Fetch Source Document

- On click, read markdown from local file path: `memory/raw/YYYY-MM-DD/learnings/[filename].md`
- Parse markdown into:
  - **Summary** (first 200 chars)
  - **Sources** (URLs, external references)
  - **Full context** (entire document)
  - **Related neurons** (other nodes linked to same learning document)

### 3. UI Options


| Option               | Description                                                            |
| -------------------- | ---------------------------------------------------------------------- |
| **A: Side Panel**    | [3D Graph] [Node Inspector + Source Doc]; load markdown in right panel |
| **B: Modal Overlay** | Overlay modal on click; "Back to graph" to close                       |
| **C: Breadcrumb**    | Neuron → Temporal Learning Session → Source Document (markdown)        |


### 4. Technical Choices

**Local file access:** Layer 2 is local-only—learning docs in `/memory/raw/YYYY-MM-DD/learnings/` are not web-served and must not be copied to a public folder. Serve them only when running locally, e.g. via a local API or dev server that reads from the filesystem.

**Path resolution:** `sourceDocument` uses relative path (e.g. `memory/raw/2026-02-24/learnings/01-openclaw-architecture.md`). Resolve against repo root or serve via API.

**Rendering:** Markdown → HTML (e.g. marked.js), syntax highlighting, inline link icons, code blocks with language detection.

---

## Implementation Steps

### Step 1: Backend / Data

- ✓ Already done: `sourceDocument` field on 41 nodes
- TODO: Create metadata index of all learning documents (names, timestamps, related nodes)
- TODO: Ensure local markdown accessible when running locally (e.g. local API or dev server; no public copy)

### Step 2: Frontend

- Query node's `sourceDocument` when selected
- Fetch markdown content (local file or API)
- Parse and render markdown (marked.js or similar)
- Display in chosen UI (side panel, modal, or breadcrumb)

### Step 3: Navigation

- "View Full Context" visible only when `sourceDocument` exists
- On click, load and display source document
- Show related neurons that reference the same source document

### Step 4: Future (Search/Filter)

- Filter graph by learning session
- Search within source documents
- Timeline view of learning documents

---

## Success Criteria

- User clicks neuron in graph
- If `sourceDocument` exists, "View Full Context" is visible
- Click loads and displays markdown file
- Markdown readable: headings, lists, code blocks, clickable links, related neurons, "Back to graph"
- Layer 1 ↔ Layer 2 relationship is clear

---

## Files to Create/Modify


| File                                             | Change                                                        |
| ------------------------------------------------ | ------------------------------------------------------------- |
| `memory/index.js` (or graph visualization entry) | Wire node selection to inspector + source doc                 |
| `memory/components/NodeInspector.js`             | **Create** — neuron details + "View Full Context"             |
| `memory/components/SourceDocumentViewer.js`      | **Create** — render markdown                                  |
| `memory/utils/markdown-fetcher.js`               | **Create** — fetch/parse markdown                             |
| Local dev/API                                    | Serve learning docs from filesystem when running locally only |


---

## Notes

This feature bridges **compressed knowledge** (neurons) and **full understanding** (source documents). It makes memory transparent and traceable—anyone looking at the neural graph can ask "where did this node come from?" and find the answer. Layer 2 learning documents are written for human reading (sources, narrative context, key insights). Exposing them in the UI makes the neural mind's memory system visible and trustworthy.

---

**Created:** Feb 24, 2026 10:51 GMT+7  
**Status:** Archived (shipped MVP)
