#!/bin/bash
# Memory Sync Phase 2 — Claude-powered extraction
# Usage: ./memory-sync-phase2.sh [YYYY-MM-DD]

set -e

REPO="/Users/paulvisciano/Personal/paulvisciano.github.io"
MEMORY_DIR="$REPO/memory"
DATA_DIR="$MEMORY_DIR/data"
CURSOR_DIR="$REPO/.cursor"
DATE="${1:-$(date +%Y-%m-%d)}"

# Check for API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY not set"
    exit 1
fi

echo "🧠 Memory Sync Phase 2 for $DATE"
echo "=================================="

# 1. Load narrative
NARRATIVE_FILE="$REPO/claw/moments/Bangkok/$DATE/WORKING-narrative.md"
if [ ! -f "$NARRATIVE_FILE" ]; then
    echo "❌ No narrative at $NARRATIVE_FILE"
    exit 1
fi

NARRATIVE=$(cat "$NARRATIVE_FILE")
echo "📖 Loaded narrative"

# 2. Load current graph
NODES=$(cat "$DATA_DIR/nodes.json")
SYNAPSES=$(cat "$DATA_DIR/synapses.json")
echo "📊 Loaded current graph"

# 3. Build Claude prompt
PROMPT_TEMPLATE=$(cat "$CURSOR_DIR/MEMORY-EXTRACTION-PROMPT.md")

# Simple template replacement (in production, use proper templating)
PROMPT="${PROMPT_TEMPLATE//\${DATE}/$DATE}"
PROMPT="${PROMPT//\${NARRATIVE}/$NARRATIVE}"
PROMPT="${PROMPT//\${CURRENT_NODES}/$NODES}"
PROMPT="${PROMPT//\${CURRENT_SYNAPSES}/$SYNAPSES}"

echo "🤖 Calling Claude API..."

# 4. Call Claude
EXTRACTION=$(curl -s -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-3-5-sonnet-20241022\",
    \"max_tokens\": 2000,
    \"temperature\": 0.3,
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"$(echo "$PROMPT" | sed 's/"/\\"/g')\n\nRespond with ONLY valid JSON, no markdown wrapping.\"
    }]
  }")

echo "✅ Got extraction from Claude"

# 5. Parse response
EXTRACTION_JSON=$(echo "$EXTRACTION" | jq -r '.content[0].text' 2>/dev/null)

if [ -z "$EXTRACTION_JSON" ]; then
    echo "❌ Failed to parse Claude response"
    echo "$EXTRACTION" | jq .
    exit 1
fi

# 6. Save extraction for review
REVIEW_FILE="$DATA_DIR/extraction-$DATE.json"
echo "$EXTRACTION_JSON" > "$REVIEW_FILE"
echo "📝 Extraction saved to: $REVIEW_FILE"

# 7. Apply updates (Phase 2 logic)
echo ""
echo "📌 Review extraction:"
echo "   cat $REVIEW_FILE"
echo ""
echo "Then apply with Phase 1 script (static approach):"
echo "   ./memory-sync.sh $DATE"
echo ""
echo "Or implement Phase 2 applier that uses Claude output."
