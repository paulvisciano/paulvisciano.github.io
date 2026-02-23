# Memory Extraction Prompt — Claude System Instructions

**Purpose:** Extract entities, relationships, sentiment, and neural updates from daily narrative

**Input:** Narrative + current graph state (nodes + synapses)  
**Output:** Structured JSON for `memory-sync.sh` Phase 2

---

## System Prompt

```
You are a neural graph extraction engine. Your job is to parse a narrative and extract:
1. Entities mentioned (people, activities, locations, concepts)
2. Relationships between entities (who met, what happened, how did it feel)
3. Sentiment (positive, negative, neutral, mixed)
4. New entities not in the current graph (should they be added?)
5. Weight changes (which synapses should strengthen/weaken and why)

Input: A narrative from Paul's daily life + current neural graph
Output: Structured JSON with extraction results

Key principles:
- Be conservative with new nodes (only add if significant)
- Reason about relationships, not just count mentions
- Weight changes should be justified (not just mechanical)
- Preserve Paul's voice and context
- Flag ambiguous decisions for manual review
```

---

## Extraction Prompt Template

```
# Neural Memory Extraction

## Current Graph State
${CURRENT_NODES}
${CURRENT_SYNAPSES}

## Daily Narrative (Date: ${DATE})
${NARRATIVE}

---

## Extraction Task

Extract the following from the narrative above:

### 1. Entity Mentions
For each entity (person, activity, location, concept) in the narrative:
- ID (lowercase, hyphenated)
- Type (person | activity | location | concept)
- Frequency (how many times mentioned, conceptually)
- Context (where/how mentioned)

### 2. Relationships Detected
For each meaningful relationship or interaction:
- Source entity
- Target entity
- Type (interaction | collaboration | conflict | inspiration | learning | etc)
- Sentiment (positive | negative | neutral | mixed)
- Evidence (quote or summary from narrative)
- Suggested weight change (how much should synapse weight adjust)

### 3. New Entities
For any entity mentioned that's NOT in the current graph:
- ID, label, category
- Why should it be added? (significance level: high | medium | low)
- Initial frequency estimate
- Suggested connections to existing nodes

### 4. Sentiment Analysis
Overall emotional tone of the narrative:
- Primary sentiment (positive | negative | neutral | mixed)
- Key emotional beats (turning points, highlights, challenges)
- Impact on Paul's trajectory or thinking

### 5. Weight Adjustments
For existing synapses between Paul and other entities:
- Source → Target
- Current weight
- Suggested new weight
- Justification (why this change)
- Confidence (high | medium | low)

---

## Response Format (JSON)

Return ONLY valid JSON, no markdown:

\`\`\`json
{
  "date": "${DATE}",
  "entities": [
    {
      "id": "wouter",
      "type": "person",
      "frequency": 8,
      "context": "Discussed travel plans, shared meals, volleyball training"
    }
  ],
  "relationships": [
    {
      "source": "paul",
      "target": "volleyball",
      "type": "core-activity",
      "sentiment": "positive",
      "evidence": "Trained at MIKASA, immersed despite being outmatched",
      "suggested_weight_change": 0.01
    }
  ],
  "new_entities": [
    {
      "id": "national-volleyball-player",
      "label": "National Volleyball Player",
      "category": "person",
      "significance": "low",
      "why": "One-time training partner, context for Paul's skill development",
      "initial_frequency": 1,
      "suggested_connections": ["volleyball", "paul"]
    }
  ],
  "sentiment": {
    "primary": "positive",
    "beats": [
      "early morning anticipation",
      "humility in outmatched training",
      "rooftop reflection moment"
    ],
    "impact": "Reinforces commitment to growth through challenge"
  },
  "weight_adjustments": [
    {
      "source": "paul",
      "target": "volleyball",
      "current_weight": 0.95,
      "suggested_weight": 0.96,
      "justification": "High engagement in training, deliberate skill development",
      "confidence": "high"
    },
    {
      "source": "paul",
      "target": "wouter",
      "current_weight": 0.75,
      "suggested_weight": 0.77,
      "justification": "Shared meal, travel planning, ongoing companionship",
      "confidence": "medium"
    }
  ],
  "manual_review_flags": [
    "New entity 'national-volleyball-player': should this be a lasting node or ephemeral?"
  ]
}
\`\`\`

---

## Implementation Notes

### Integration with Script

1. **Script calls Claude:**
   ```bash
   NARRATIVE=$(cat narrative.md)
   NODES=$(cat nodes.json)
   SYNAPSES=$(cat synapses.json)
   
   EXTRACTION=$(curl -X POST https://api.anthropic.com/v1/messages \
     -H "Authorization: Bearer $CLAUDE_API_KEY" \
     -d "{prompt: prompt_template}" )
   ```

2. **Claude returns JSON**
3. **Script parses JSON** and applies updates:
   - Bump frequencies
   - Adjust weights
   - Create new nodes (if approved)
   - Record temporal activations
   - Write to disk

4. **Paul reviews** before commit

---

## Customization Points

### Relationship Types
Extend as needed:
- interaction, collaboration, conflict, inspiration, learning, mentorship, romance, family, crew

### Sentiment Granularity
Current: positive | negative | neutral | mixed
Could add: intensity (mild → intense), trajectory (improving → declining)

### Weight Change Caps
Current: max 0.99, minimum 0.01 bump
Could adjust based on:
- Narrative intensity
- Relationship duration
- Frequency of interaction

### New Entity Thresholds
Current: high | medium | low significance
Policy: Only auto-create "high" significance, flag medium/low for review

---

## Claude Model Configuration

**Model:** `claude-3-5-sonnet-20241022` (or latest)  
**Temperature:** 0.3 (consistent, less random)  
**Max tokens:** 2000 (structured output)  
**System role:** Extraction engine (see above)

---

## Error Handling

**If Claude returns invalid JSON:**
- Log error
- Fall back to Phase 1 (static regex)
- Flag for manual review

**If extraction is incomplete:**
- Use confidence levels (high/medium/low)
- Only apply "high confidence" changes automatically
- Queue "medium/low" for Paul's review

**If new entity suggestion conflicts with existing nodes:**
- Flag for manual dedup
- Don't auto-merge

---

## Example Usage

### Input
```
Narrative: "Trained with national volleyball player at MIKASA. Outmatched but immersed. 
Wouter and I grabbed dinner afterward, planned next trip. Rooftop moment overlooking city."

Current nodes: [paul, wouter, volleyball, travel, ...]
Current synapses: [paul→volleyball:0.95, paul→wouter:0.75, ...]
```

### Output (from Claude)
```json
{
  "entities": [
    {"id": "wouter", "type": "person", "frequency": 3, "context": "dinner, travel planning"},
    {"id": "volleyball", "type": "activity", "frequency": 5, "context": "training, skill challenge"},
    {"id": "bangkok", "type": "location", "frequency": 2, "context": "rooftop reflection, city view"}
  ],
  "relationships": [
    {"source": "paul", "target": "volleyball", "type": "core-activity", "sentiment": "positive", "suggested_weight_change": 0.01},
    {"source": "paul", "target": "wouter", "type": "collaboration", "sentiment": "positive", "suggested_weight_change": 0.02}
  ],
  ...
}
```

### Script Application
- Bump paul.frequency by 10 (entity mentions)
- Bump volleyball.frequency by 5
- Bump paul→volleyball synapse: 0.95 → 0.96
- Bump paul→wouter synapse: 0.75 → 0.77
- Add temporal activation to paul
- Write updated nodes.json + synapses.json

---

## Next Steps

1. **Test prompt** on a real narrative
2. **Refine extraction logic** based on results
3. **Build Claude integration** into memory-sync.sh
4. **Establish review workflow** (Paul approves before auto-apply)
5. **Iterate** on prompt engineering

---

**Created:** Mon Feb 23, 2026 19:28 GMT+7  
**Location:** `/Users/paulvisciano/Personal/paulvisciano.github.io/.cursor/MEMORY-EXTRACTION-PROMPT.md`
