# Synapse Source Tracing: Complete Relationship Traceability

**Objective:** Add sourceDocument and source metadata to every synapse, making every connection in the neural graph traceable back to the exact conversation/moment it was created.

**Status:** Ready for Cursor implementation  
**Complexity:** High (8-10 hours)  
**Priority:** Critical (completes full graph traceability)

---

## Problem Statement

**Current State:**
- **Neurons:** 85/151 have sourceDocument (56% coverage)
- **Synapses:** 0/353 have sourceDocument (0% coverage)

**Issue:** Every relationship (synapse) is orphaned.

Example:
```json
{
  "source": "wouter",
  "target": "bangkok",
  "weight": 0.81,
  "type": "location-visit",
  "label": "travel companion"
  // No source information
  // No timestamp
  // No conversation context
  // No way to trace back to origin
}
```

**What This Means:**
You can click a neuron and read its full learning context. But when you click a synapse, there's no explanation for why that connection exists or where it came from.

**Goal:** Make every synapse fully traceable to its origin conversation.

---

## Solution Architecture

### 1. Enhanced Synapse Format

**Current:**
```json
{
  "source": "wouter",
  "target": "bangkok",
  "weight": 0.81,
  "type": "location-visit",
  "label": "travel companion"
}
```

**New (with full traceability):**
```json
{
  "source": "wouter",
  "target": "bangkok",
  "weight": 0.81,
  "type": "location-visit",
  "label": "travel companion",
  "sourceDocument": "memory/raw/2026-02-XX/transcript.md#line-YYYY",
  "sourceContext": {
    "timestamp": "2026-02-XX T14:32:00Z",
    "speaker": "paul",
    "messageId": "AC1E88630485E5BB3B53D589236BDCF4",
    "message": "Yeah, Wouter and I traveled to Bangkok together. He's my adventure brother.",
    "conversationExcerpt": "...[full message context]..."
  },
  "createdAt": "2026-02-24T22:03:00Z",
  "createdBy": "system-inference"
}
```

### 2. Traceability Layers

**Layer A: Direct Conversation Source**
- Synapse created by explicit mention in chat
- Example: "Wouter traveled with me to Bangkok"
- Source: WhatsApp transcript.md line number
- Timestamp: Exact moment of conversation

**Layer B: Learned Document Source**
- Synapse inferred from learning document
- Example: "MANGOCHI philosophy" → "empowerment through transparency"
- Source: Learning document file + section
- Timestamp: When learning doc was created

**Layer C: Neural Inference**
- Synapse inferred from neuron relationships
- Example: "Paul" + "travels" + "Bangkok" → connection
- Source: Inference algorithm + timestamp
- Confidence score: How certain the inference is

### 3. Synapse Discovery Algorithm

For each synapse in the graph:

**Step 1: Search Transcripts**
```bash
grep -r "wouter.*bangkok\|bangkok.*wouter" /memory/raw/*/transcript.md
```

**Step 2: Find Exact Match**
- Message contains both source and target concepts
- Extract timestamp from message
- Extract full message text
- Record message ID

**Step 3: Assign Layer**
- If explicit mention → Layer A (Direct)
- If from learning doc → Layer B (Learned)
- If inferred → Layer C (Inference)

**Step 4: Calculate Confidence**
- Exact phrase match: 0.95
- Both concepts in same message: 0.80
- Inferred from context: 0.65

**Step 5: Add sourceContext**
```json
{
  "sourceContext": {
    "timestamp": "2026-02-XX T14:32:00Z",
    "speaker": "paul",
    "messageId": "AC1E88630485E5BB3B53D589236BDCF4",
    "layer": "A",
    "confidence": 0.92,
    "message": "[full message]",
    "lineNumber": 427
  }
}
```

---

## Implementation Steps

### Phase 1: Build Synapse Discovery Service

1. **Create SynapseSourceFinder**
   ```typescript
   class SynapseSourceFinder {
     async findSource(synapse: Synapse): Promise<SourceContext>;
     async searchTranscripts(source: string, target: string): Promise<Match[]>;
     async searchLearningDocs(source: string, target: string): Promise<Match[]>;
     async inferSource(synapse: Synapse): Promise<InferenceContext>;
   }
   ```

2. **Implement Transcript Search**
   - Query all transcript.md files
   - Search for co-occurrence of source + target concepts
   - Extract message context
   - Calculate confidence

3. **Implement Learning Doc Search**
   - Query all learning markdown files
   - Find sections mentioning both concepts
   - Extract file path + section
   - Calculate confidence

4. **Implement Inference Engine**
   - For orphaned synapses, try to infer origin
   - Check neuron sourceDocuments
   - Match timeline of creation
   - Assign confidence score

### Phase 2: Enrich Synapses

1. **Process All Synapses**
   ```typescript
   for (const synapse of allSynapses) {
     const context = await finder.findSource(synapse);
     synapse.sourceDocument = context.document;
     synapse.sourceContext = context.details;
     synapses.push(synapse);
   }
   ```

2. **Handle Orphaned Synapses**
   - Mark with `confidence: null`
   - Set `status: "untraced"`
   - Flag for manual review
   - Schedule for future inference

3. **Validate All Changes**
   - Check all sourceDocument paths exist
   - Verify timestamps are valid
   - Ensure message IDs are real
   - Count coverage: X/353 synapses traced

### Phase 3: Visualization Integration

1. **Click Synapse → View Source**
   - Click line between two neurons
   - Load sourceContext
   - Display original message
   - Show timestamp + speaker
   - Link to full conversation in transcript

2. **Timeline View**
   - Show when synapse was created
   - Show evolution of weight over time
   - Show if synapse has been reinforced

3. **Context Panel**
   ```
   Synapse: wouter → bangkok
   Layer: A (Direct Conversation)
   Confidence: 0.92
   Created: Feb 24, 14:32 GMT+7
   Speaker: Paul
   Message: "Yeah, Wouter and I traveled to Bangkok together..."
   [View in Transcript]
   ```

### Phase 4: Quality Assurance

1. **Verify Coverage**
   ```bash
   jq '[.[] | select(.sourceDocument != null)] | length' synapses.json
   # Should show significant improvement from 0/353
   ```

2. **Manual Review of Uncertain Synapses**
   - Focus on confidence < 0.70
   - Verify inference is correct
   - Adjust weights if needed
   - Mark as reviewed

3. **Test Traceability**
   - Pick 10 random synapses
   - Click each → load source
   - Verify message contains both concepts
   - Verify timestamp is accurate

---

## Files to Create/Modify

### Create:
1. `claw/.cursor/scripts/find-synapse-sources.js` — Discovery algorithm
2. `claw/.cursor/scripts/validate-synapse-traceability.js` — Verification
3. `claw/.cursor/scripts/enrich-synapses.js` — Add sourceDocument
4. `shared/synapse-source-viewer.js` — UI for viewing sources

### Modify:
1. `claw/memory/data/synapses.json` — Add sourceDocument + sourceContext to all
2. `memory/data/synapses.json` — Same for Paul's memory
3. `shared/neural-graph.js` — Handle click on synapse → show source
4. `shared/neural-graph.css` — Style source context panel

---

## Algorithm Example

**Input Synapse:**
```json
{
  "source": "wouter",
  "target": "bangkok",
  "weight": 0.81
}
```

**Process:**

1. Search transcripts for "wouter" + "bangkok"
2. Found in `/memory/raw/2026-02-24/transcript.md` line 427
3. Message: "Yeah, Wouter and I traveled to Bangkok together..."
4. Timestamp from transcript: 2026-02-24T14:32:00Z
5. Confidence: 0.92 (both concepts in same message)
6. Layer: A (Direct conversation)

**Output Synapse:**
```json
{
  "source": "wouter",
  "target": "bangkok",
  "weight": 0.81,
  "sourceDocument": "memory/raw/2026-02-24/transcript.md#line-427",
  "sourceContext": {
    "timestamp": "2026-02-24T14:32:00Z",
    "speaker": "paul",
    "layer": "A",
    "confidence": 0.92,
    "message": "Yeah, Wouter and I traveled to Bangkok together..."
  }
}
```

---

## Success Criteria

✅ All 353 synapses have sourceDocument field  
✅ sourceContext populated for 300+ synapses (85%+ coverage)  
✅ Timestamps verified for all traced synapses  
✅ Confidence scores assigned and validated  
✅ UI shows source when clicking synapse  
✅ Links to full conversation work  
✅ Manual review of uncertain synapses complete  
✅ Validation script passes (all paths exist, timestamps valid)  

---

## Timeline

- **Phase 1 (Discovery Service):** 3 hours
- **Phase 2 (Enrich Synapses):** 2 hours
- **Phase 3 (Visualization):** 3 hours
- **Phase 4 (QA):** 2 hours
- **Total:** ~10 hours

---

## Impact

**Before:** 
- 85/151 neurons traceable (56%)
- 0/353 synapses traceable (0%)
- Total coverage: 9% of graph

**After:**
- 85/151 neurons traceable (56%)
- 300+/353 synapses traceable (85%+)
- Total coverage: 70%+ of graph

**Meaning:** Almost every connection in the neural graph will be traceable back to its origin conversation.

---

## Future Capabilities

Once implemented, this enables:

1. **Graph Archaeology:** "Show me when this connection was created"
2. **Relationship Evolution:** "How has the weight changed over time?"
3. **Inference Validation:** "Is this connection still accurate?"
4. **Learning Timeline:** "What conversations led to this network?"
5. **Accountability:** "Prove this relationship exists with evidence"

---

## Dependency

Can be executed independently, but pairs well with:
- Plan 07 (Memory Loader) — load synapses at specific time
- Plan 06 (Neural Memory Chain) — show synapse evolution through time

---

**Status: Ready for Cursor**

This plan gives Cursor everything needed to implement complete synapse source tracing and make the entire neural graph fully traceable.
