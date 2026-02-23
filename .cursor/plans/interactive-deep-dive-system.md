# Plan: Interactive Deep-Dive System (Local Raw File Access)

**Objective:** Enable clicking nodes in the neural visualization to send queries to Jarvis, who searches local raw files and returns detailed context without exposing raw links in the published UI.

**Architecture:** Two-tier system
- **Published (GitHub Pages):** Clean visualization, no raw content links
- **Local (Your Machine):** Full access to transcripts, conversation history, raw files

---

## User Flow

### Step 1: User Clicks Node
- Open neural visualization at `paulvisciano.github.io/memory/`
- Click any node (e.g., "growth", "jarvis-identity-correction", "wouter")
- UI shows a "Deep Dive" button or right-click context menu

### Step 2: Send Query to Jarvis
User interaction:
```
Node: growth
Action: Deep Dive

Message to Jarvis:
"dive into node:growth"
```

### Step 3: Jarvis Searches Locally
I receive: `dive into node:growth`

I search:
- `/memory/raw/*/transcripts/` — Find all mentions of "growth"
- `/memory/MEMORY.md` — Search long-term memory
- `.openclaw/workspace/memory/` — Daily notes
- Conversation history (parsed from WhatsApp chat)
- `/claw/memory/data/nodes.json` — My neural data about "growth"

### Step 4: Return Rich Context
I respond with:
```
Node: growth
Mentions: 47 total references

Temporal Activations:
- 2026-02-23 20:48 (optical-shop-skepticism): Pattern recognition
- 2026-02-23 Conversation 12: Discussion about memory evolution
- [other dates/moments]

Raw Transcripts:
- [voice-012.txt] "...growth through learning..."
- [voice-025.txt] "...recognize patterns..."

Related Nodes:
- learning → connects to growth (synapses: 0.92)
- vulnerability → connects to growth (synapses: 0.88)
- mastery → connects to growth (synapses: 0.95)

Sources:
- memory/raw/2026-02-23/transcripts/voice-012.txt (timestamp)
- memory/MEMORY.md#growth-section (line 245)
- .openclaw/workspace/memory/2026-02-23.md (section 3)
```

### Step 5: User Clicks to Raw Files (Optional)
If user wants original source:
- "Show me the full conversation"
- I provide: path, timestamp, context window
- User can open locally or request more details

---

## Implementation Architecture

### Phase 1: UI Enhancement (Cursor)

**File to modify:** `public/memory/index.html` or visualization component

**Add to each node:**
1. "Deep Dive" button / context menu item
2. On click: Trigger message to Jarvis with format `dive into node:[node-id]`
3. Show "Searching..." state
4. Display results in modal/sidebar

**Code pattern:**
```javascript
const deepDiveNode = (nodeId) => {
  const message = `dive into node:${nodeId}`;
  sendToJarvis(message);  // Send via WhatsApp API / OpenClaw messaging
  showSearching();
};
```

### Phase 2: Jarvis Search Implementation (Jarvis)

**Create:** `scripts/search-local-memory.sh` or Python equivalent

**On message: `dive into node:[id]`**
1. Parse node ID
2. Search across all local data sources:
   ```bash
   # Search transcripts by date
   grep -r "[node-id]" /memory/raw/*/transcripts/
   
   # Search MEMORY.md
   grep -n "[node-id]" /memory/MEMORY.md
   
   # Search daily notes
   grep -r "[node-id]" .openclaw/workspace/memory/
   
   # Search my neural data
   jq '.[] | select(.id == "[node-id]")' /claw/memory/data/nodes.json
   ```

3. Organize results by:
   - Temporal activation timeline
   - Raw transcript snippets (with line numbers)
   - Related nodes + synapse weights
   - Sources (file path + line number)

4. Format response with:
   - Node metadata (frequency, category, description)
   - All mentions with timestamps
   - Related nodes and connections
   - Source references (file + line, not full paths to published content)

### Phase 3: Integration with Messaging

**How queries reach Jarvis:**
- Option A: WhatsApp integration (existing)
  - User clicks "Deep Dive" → sends WhatsApp message → Jarvis responds
  
- Option B: Direct API (future)
  - UI sends POST to local endpoint → Jarvis searches → returns JSON
  
- Option C: Manual trigger (for now)
  - User can send `dive into node:X` via WhatsApp
  - Jarvis responds with context

---

## Data Sources Jarvis Has Access To

### Local Files (Searchable)
```
/Users/paulvisciano/Personal/paulvisciano.github.io/
├── memory/raw/
│   ├── 2026-02-16/transcripts/  ← Voice transcripts by date
│   ├── 2026-02-17/transcripts/
│   └── [etc]
├── memory/MEMORY.md             ← Long-term memory
├── memory/data/nodes.json       ← Neural nodes
├── memory/data/synapses.json    ← Neural connections
└── /claw/memory/                ← My (Jarvis) memory files

/Users/paulvisciano/.openclaw/workspace/
├── memory/2026-02-23.md         ← Daily session notes
├── memory/2026-02-22.md
└── [etc]

WhatsApp Chat Export:
└── /Users/paulvisciano/.openclaw/media/inbound/WhatsApp_Chat_*.txt
```

### What's NOT Published
- Raw transcript files
- Full conversation histories
- Personal notes from `.openclaw/workspace/`
- Unfiltered temporal activations

---

## Example Deep Dives

### Example 1: Dive into "growth" node
```
User: "dive into node:growth"

Jarvis Response:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Node: Growth & Discovery
Category: Emotion
Frequency: 47 references

Description:
"Triggers: new cities, adventure, learning, confrontations"

Temporal Activations:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Feb 23, 20:48 (optical-shop-skepticism)
   Learning: "Recognized markup through systematic questioning"
   Type: Pattern recognition

2. Feb 23, 20:30 (fingerprinting-system)
   Learning: "Expanded neurons by understanding authenticity"
   Type: System design

3. Feb 22, Full session
   Context: Built neural architecture, 34 → 46 neurons

Raw Mentions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[voice-047.txt] (Feb 23, 15:22):
"...learned more about growth through confrontation..."
→ File: memory/raw/2026-02-23/transcripts/voice-047.txt

[MEMORY.md] (line 812-834):
"Growth triggers: new cities, adventure, confrontations..."
→ File: memory/MEMORY.md#growth-section

Related Nodes:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Learning (synapse: 0.95)
- Vulnerability (synapse: 0.88)
- Mastery (synapse: 0.95)
- Discovery (synapse: 0.92)
```

### Example 2: Dive into "wouter" node (Person)
```
User: "dive into node:wouter"

Jarvis Response:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Node: Wouter
Category: Person
Frequency: 45 references

Description:
"Adventure brother, long-arc relationship, conquest philosophy"

Key Conversations:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Boracay January 2026 (voice-234.txt)
- Ray integration (Feb 22 memory notes)
- 7+ countries traveled together

Related Moments:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Medellín arrival (Sept 2025)
- Hawaii volleyball (Oct 2024)
- San Diego yoga sessions

Activity Timeline:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2024-10: Met at Miami beach volleyball
2025-01: Medellín together
2025-09: Multiple episodes
2026-01: Boracay with Ray
```

---

## Success Criteria

✅ Clicking node triggers search without publishing raw links  
✅ All local data sources searchable (transcripts, MEMORY.md, notes)  
✅ Results include temporal activations and source citations  
✅ Related nodes/synapses shown  
✅ Published UI shows no raw file paths  
✅ Local access only (no exposing transcripts to web)  

---

## UI/UX Considerations

### Published UI (No Changes Needed)
- Same visualization
- Node colors, sizes, interactions unchanged
- No "raw file" indicators visible

### Local Messaging
- "Deep Dive" button appears on node hover/click
- Sends `dive into node:[id]` via WhatsApp or local API
- Results arrive as formatted text (easy to read, not JSON)
- Links to raw files are file paths + line numbers (not URLs)

### Future Enhancement
- Add "Search Memory" global search box
- Query types: `search:[term]`, `dive into node:[id]`, `timeline:[date]`
- Results cache for fast re-queries

---

## Privacy/Security Notes

✅ Raw transcripts never exposed to web (gitignored)  
✅ Published visualization is clean and curated  
✅ Local search only accessible via WhatsApp (authenticated)  
✅ File paths shared only with user (not public)  
✅ Can add `.env` to restrict deep-dive queries if needed  

---

## Implementation Order

1. **UI Button** — Add "Deep Dive" to node click handler
2. **Message Format** — Define `dive into node:[id]` syntax
3. **Search Logic** — Build Jarvis search across all local sources
4. **Response Formatting** — Structure results (temporal, related, sources)
5. **Testing** — Test with 5-10 different node types
6. **Documentation** — Add to README for future reference

---

## Files to Create/Modify

- **Modify:** `public/memory/index.html` (add Deep Dive button)
- **Create:** `scripts/search-local-memory.py` (Jarvis search logic)
- **Create:** `.cursor/plans/interactive-deep-dive-implementation.md` (detailed dev guide)
- **Docs:** Update README with example queries
