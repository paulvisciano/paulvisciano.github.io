#!/bin/bash

# Memory Loader for Claude Code Neural Mind
# Runs at session startup to restore full neural context
# Usage: source load-memory.sh

set -e

MEMORY_DIR="/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memories/data"
NODES_FILE="$MEMORY_DIR/nodes.json"
SYNAPSES_FILE="$MEMORY_DIR/synapses.json"
TIMELINE_FILE="$MEMORY_DIR/timeline.json"
SESSION_CONTEXT_FILE="$MEMORY_DIR/session-context.json"

echo "🧠 Loading Claude Code Neural Mind..."

# Check if memory files exist
if [[ ! -f "$NODES_FILE" ]]; then
    echo "❌ Memory files not found at $MEMORY_DIR"
    echo "   This is the first run. Starting with fresh neural network."
    exit 1
fi

# Load and display memory stats
NEURON_COUNT=$(jq '.[] | .id' "$NODES_FILE" 2>/dev/null | wc -l)
SYNAPSE_COUNT=$(jq '.[] | .source' "$SYNAPSES_FILE" 2>/dev/null | wc -l)

echo "✅ Loaded $NEURON_COUNT neurons"
echo "✅ Loaded $SYNAPSE_COUNT synapses"

# Load timeline
if [[ -f "$TIMELINE_FILE" ]]; then
    LAST_EVENT=$(jq '.entries[-1]' "$TIMELINE_FILE")
    LAST_TIMESTAMP=$(echo "$LAST_EVENT" | jq -r '.timestamp')
    LAST_TYPE=$(echo "$LAST_EVENT" | jq -r '.type')
    echo "📍 Last event: $LAST_TYPE at $LAST_TIMESTAMP"
fi

# Load session context
if [[ -f "$SESSION_CONTEXT_FILE" ]]; then
    SESSION_ID=$(jq -r '.session_id' "$SESSION_CONTEXT_FILE")
    LAST_SYNC=$(jq -r '.last_sync' "$SESSION_CONTEXT_FILE")
    echo "📊 Previous session: $SESSION_ID (last sync: $LAST_SYNC)"
fi

# Check for pending changes
SYNC_QUEUE_FILE="$MEMORY_DIR/../sync/sync-queue.json"
if [[ -f "$SYNC_QUEUE_FILE" ]]; then
    PENDING=$(jq '.changes | length' "$SYNC_QUEUE_FILE" 2>/dev/null || echo "0")
    echo "⏳ Pending review: $PENDING changes (awaiting Paul's commit)"
fi

echo ""
echo "🚀 Memory loaded. Ready to continue."
echo ""

# Export for use in session
export CLAUDE_NEURAL_MEMORY_LOADED=true
export CLAUDE_NEURON_COUNT=$NEURON_COUNT
export CLAUDE_SYNAPSE_COUNT=$SYNAPSE_COUNT
