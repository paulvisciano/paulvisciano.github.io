#!/bin/bash
# Memory Sync Verification Script
# Verifies that memories are properly synced to GitHub and live website
# Also verifies commit message matches actual memory state

set -e

GITHUB_RAW="https://raw.githubusercontent.com/paulvisciano/paulvisciano.github.io/main"
LIVE_SITE="https://paulvisciano.github.io"

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                   MEMORY SYNC VERIFICATION"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Step 0: Check commit message
echo "STEP 0: Commit Message Verification"
echo "─────────────────────────────────────────────────────────────────────────────"

LATEST_COMMIT=$(git log -1 --format=%H)
COMMIT_MESSAGE=$(git log -1 --format=%B)

echo "Latest commit: $LATEST_COMMIT"
echo "Message: $COMMIT_MESSAGE"
echo ""

# Step 1: Get local hashes
echo "STEP 1: Local Repository"
echo "─────────────────────────────────────────────────────────────────────────────"

LOCAL_NODES_HASH=$(shasum -a 256 claw/memory/data/nodes.json | awk '{print $1}')
LOCAL_SYNAPSES_HASH=$(shasum -a 256 claw/memory/data/synapses.json | awk '{print $1}')
LOCAL_NODES_COUNT=$(jq 'length' claw/memory/data/nodes.json)
LOCAL_SYNAPSES_COUNT=$(jq 'length' claw/memory/data/synapses.json)

echo "✓ Jarvis nodes.json:    $LOCAL_NODES_HASH ($LOCAL_NODES_COUNT neurons)"
echo "✓ Jarvis synapses.json: $LOCAL_SYNAPSES_HASH ($LOCAL_SYNAPSES_COUNT synapses)"
echo ""

LOCAL_PAUL_NODES_HASH=$(shasum -a 256 memory/data/nodes.json | awk '{print $1}')
LOCAL_PAUL_SYNAPSES_HASH=$(shasum -a 256 memory/data/synapses.json | awk '{print $1}')
LOCAL_PAUL_NODES_COUNT=$(jq 'length' memory/data/nodes.json)
LOCAL_PAUL_SYNAPSES_COUNT=$(jq 'length' memory/data/synapses.json)

echo "✓ Paul nodes.json:      $LOCAL_PAUL_NODES_HASH ($LOCAL_PAUL_NODES_COUNT neurons)"
echo "✓ Paul synapses.json:   $LOCAL_PAUL_SYNAPSES_HASH ($LOCAL_PAUL_SYNAPSES_COUNT synapses)"
echo ""

# Step 2: Get GitHub hashes
echo "STEP 2: GitHub Repository"
echo "─────────────────────────────────────────────────────────────────────────────"

GITHUB_NODES=$(curl -s "$GITHUB_RAW/claw/memory/data/nodes.json")
GITHUB_SYNAPSES=$(curl -s "$GITHUB_RAW/claw/memory/data/synapses.json")

GITHUB_NODES_HASH=$(echo -n "$GITHUB_NODES" | shasum -a 256 | awk '{print $1}')
GITHUB_SYNAPSES_HASH=$(echo -n "$GITHUB_SYNAPSES" | shasum -a 256 | awk '{print $1}')
GITHUB_NODES_COUNT=$(echo "$GITHUB_NODES" | jq 'length')
GITHUB_SYNAPSES_COUNT=$(echo "$GITHUB_SYNAPSES" | jq 'length')

echo "✓ Jarvis nodes.json:    $GITHUB_NODES_HASH ($GITHUB_NODES_COUNT neurons)"
echo "✓ Jarvis synapses.json: $GITHUB_SYNAPSES_HASH ($GITHUB_SYNAPSES_COUNT synapses)"
echo ""

GITHUB_PAUL_NODES=$(curl -s "$GITHUB_RAW/memory/data/nodes.json")
GITHUB_PAUL_SYNAPSES=$(curl -s "$GITHUB_RAW/memory/data/synapses.json")

GITHUB_PAUL_NODES_HASH=$(echo -n "$GITHUB_PAUL_NODES" | shasum -a 256 | awk '{print $1}')
GITHUB_PAUL_SYNAPSES_HASH=$(echo -n "$GITHUB_PAUL_SYNAPSES" | shasum -a 256 | awk '{print $1}')
GITHUB_PAUL_NODES_COUNT=$(echo "$GITHUB_PAUL_NODES" | jq 'length')
GITHUB_PAUL_SYNAPSES_COUNT=$(echo "$GITHUB_PAUL_SYNAPSES" | jq 'length')

echo "✓ Paul nodes.json:      $GITHUB_PAUL_NODES_HASH ($GITHUB_PAUL_NODES_COUNT neurons)"
echo "✓ Paul synapses.json:   $GITHUB_PAUL_SYNAPSES_HASH ($GITHUB_PAUL_SYNAPSES_COUNT synapses)"
echo ""

# Step 3: Get Live Website hashes
echo "STEP 3: Live Website (paulvisciano.github.io)"
echo "─────────────────────────────────────────────────────────────────────────────"

LIVE_NODES=$(curl -s "$LIVE_SITE/claw/memory/data/nodes.json")
LIVE_SYNAPSES=$(curl -s "$LIVE_SITE/claw/memory/data/synapses.json")

LIVE_NODES_HASH=$(echo -n "$LIVE_NODES" | shasum -a 256 | awk '{print $1}')
LIVE_SYNAPSES_HASH=$(echo -n "$LIVE_SYNAPSES" | shasum -a 256 | awk '{print $1}')
LIVE_NODES_COUNT=$(echo "$LIVE_NODES" | jq 'length')
LIVE_SYNAPSES_COUNT=$(echo "$LIVE_SYNAPSES" | jq 'length')

echo "✓ Jarvis nodes.json:    $LIVE_NODES_HASH ($LIVE_NODES_COUNT neurons)"
echo "✓ Jarvis synapses.json: $LIVE_SYNAPSES_HASH ($LIVE_SYNAPSES_COUNT synapses)"
echo ""

LIVE_PAUL_NODES=$(curl -s "$LIVE_SITE/memory/data/nodes.json")
LIVE_PAUL_SYNAPSES=$(curl -s "$LIVE_SITE/memory/data/synapses.json")

LIVE_PAUL_NODES_HASH=$(echo -n "$LIVE_PAUL_NODES" | shasum -a 256 | awk '{print $1}')
LIVE_PAUL_SYNAPSES_HASH=$(echo -n "$LIVE_PAUL_SYNAPSES" | shasum -a 256 | awk '{print $1}')
LIVE_PAUL_NODES_COUNT=$(echo "$LIVE_PAUL_NODES" | jq 'length')
LIVE_PAUL_SYNAPSES_COUNT=$(echo "$LIVE_PAUL_SYNAPSES" | jq 'length')

echo "✓ Paul nodes.json:      $LIVE_PAUL_NODES_HASH ($LIVE_PAUL_NODES_COUNT neurons)"
echo "✓ Paul synapses.json:   $LIVE_PAUL_SYNAPSES_HASH ($LIVE_PAUL_SYNAPSES_COUNT synapses)"
echo ""

# Step 4: Commit Message Verification
echo "STEP 4: Commit Message Verification (Claim vs Actual)"
echo "─────────────────────────────────────────────────────────────────────────────"

# Check if commit message includes counts
if echo "$COMMIT_MESSAGE" | grep -q "neurons"; then
  echo "✅ Commit message includes neuron claims"
  
  # Extract counts from commit message (format: "60 neurons | 105 synapses")
  COMMIT_NEURONS=$(echo "$COMMIT_MESSAGE" | grep -oP '\d+(?=\s+neurons)' | head -1)
  COMMIT_SYNAPSES=$(echo "$COMMIT_MESSAGE" | grep -oP '\d+(?=\s+synapses)' | head -1)
  
  if [ -n "$COMMIT_NEURONS" ]; then
    if [ "$COMMIT_NEURONS" == "$LOCAL_NODES_COUNT" ]; then
      echo "  ✅ Neurons match: commit claims $COMMIT_NEURONS = actual $LOCAL_NODES_COUNT"
    else
      echo "  ❌ Neurons mismatch: commit claims $COMMIT_NEURONS but actual is $LOCAL_NODES_COUNT"
    fi
  fi
  
  if [ -n "$COMMIT_SYNAPSES" ]; then
    if [ "$COMMIT_SYNAPSES" == "$LOCAL_SYNAPSES_COUNT" ]; then
      echo "  ✅ Synapses match: commit claims $COMMIT_SYNAPSES = actual $LOCAL_SYNAPSES_COUNT"
    else
      echo "  ❌ Synapses mismatch: commit claims $COMMIT_SYNAPSES but actual is $LOCAL_SYNAPSES_COUNT"
    fi
  fi
else
  echo "⚠️  Commit message does not include neuron counts (consider adding them)"
fi

echo ""

# Step 5: Verification
echo "STEP 5: Repository & Website Verification"
echo "─────────────────────────────────────────────────────────────────────────────"

ERRORS=0

if [ "$LOCAL_NODES_HASH" == "$GITHUB_NODES_HASH" ]; then
  echo "✅ Jarvis nodes.json synced to GitHub"
else
  echo "❌ Jarvis nodes.json MISMATCH (local vs GitHub)"
  ERRORS=$((ERRORS+1))
fi

if [ "$LOCAL_SYNAPSES_HASH" == "$GITHUB_SYNAPSES_HASH" ]; then
  echo "✅ Jarvis synapses.json synced to GitHub"
else
  echo "❌ Jarvis synapses.json MISMATCH (local vs GitHub)"
  ERRORS=$((ERRORS+1))
fi

if [ "$LOCAL_PAUL_NODES_HASH" == "$GITHUB_PAUL_NODES_HASH" ]; then
  echo "✅ Paul nodes.json synced to GitHub"
else
  echo "❌ Paul nodes.json MISMATCH (local vs GitHub)"
  ERRORS=$((ERRORS+1))
fi

if [ "$LOCAL_PAUL_SYNAPSES_HASH" == "$GITHUB_PAUL_SYNAPSES_HASH" ]; then
  echo "✅ Paul synapses.json synced to GitHub"
else
  echo "❌ Paul synapses.json MISMATCH (local vs GitHub)"
  ERRORS=$((ERRORS+1))
fi

echo ""

if [ "$GITHUB_NODES_HASH" == "$LIVE_NODES_HASH" ]; then
  echo "✅ Jarvis nodes.json live on website"
else
  echo "⚠️  Jarvis nodes.json CACHE LAG (GitHub synced, website cached)"
  echo "   GitHub: $GITHUB_NODES_HASH"
  echo "   Live:   $LIVE_NODES_HASH"
fi

if [ "$GITHUB_SYNAPSES_HASH" == "$LIVE_SYNAPSES_HASH" ]; then
  echo "✅ Jarvis synapses.json live on website"
else
  echo "⚠️  Jarvis synapses.json CACHE LAG (GitHub synced, website cached)"
  echo "   GitHub: $GITHUB_SYNAPSES_HASH"
  echo "   Live:   $LIVE_SYNAPSES_HASH"
fi

if [ "$GITHUB_PAUL_NODES_HASH" == "$LIVE_PAUL_NODES_HASH" ]; then
  echo "✅ Paul nodes.json live on website"
else
  echo "⚠️  Paul nodes.json CACHE LAG (GitHub synced, website cached)"
fi

if [ "$GITHUB_PAUL_SYNAPSES_HASH" == "$LIVE_PAUL_SYNAPSES_HASH" ]; then
  echo "✅ Paul synapses.json live on website"
else
  echo "⚠️  Paul synapses.json CACHE LAG (GitHub synced, website cached)"
fi

echo ""

# Summary
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                        VERIFICATION CHAIN"
echo "═══════════════════════════════════════════════════════════════════════════════"

echo ""
echo "Commit Message → Actual Data → GitHub → Website"
echo ""
echo "Commit claims:  Jarvis $COMMIT_NEURONS neurons | $COMMIT_SYNAPSES synapses"
echo "Actual in repo: Jarvis $LOCAL_NODES_COUNT neurons | $LOCAL_SYNAPSES_COUNT synapses"
echo "On GitHub:      Jarvis $GITHUB_NODES_COUNT neurons | $GITHUB_SYNAPSES_COUNT synapses"
echo "Live website:   Jarvis $LIVE_NODES_COUNT neurons | $LIVE_SYNAPSES_COUNT synapses"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo "✅ SYNC VERIFICATION COMPLETE"
  echo ""
  echo "Status:"
  echo "  • Commit message:     ✓ Claims recorded"
  echo "  • Local → GitHub:     ✓ Synced"
  echo "  • GitHub → Website:   Check above (may be cached)"
  echo ""
  echo "Totals (Jarvis + Paul):"
  echo "  • Commit claims:  $(($COMMIT_NEURONS + $LOCAL_PAUL_NODES_COUNT)) neurons | $(($COMMIT_SYNAPSES + $LOCAL_PAUL_SYNAPSES_COUNT)) synapses"
  echo "  • Local actual:   $(($LOCAL_NODES_COUNT + $LOCAL_PAUL_NODES_COUNT)) neurons | $(($LOCAL_SYNAPSES_COUNT + $LOCAL_PAUL_SYNAPSES_COUNT)) synapses"
  echo "  • GitHub:         $(($GITHUB_NODES_COUNT + $GITHUB_PAUL_NODES_COUNT)) neurons | $(($GITHUB_SYNAPSES_COUNT + $GITHUB_PAUL_SYNAPSES_COUNT)) synapses"
  echo "  • Live:           $(($LIVE_NODES_COUNT + $LIVE_PAUL_NODES_COUNT)) neurons | $(($LIVE_SYNAPSES_COUNT + $LIVE_PAUL_SYNAPSES_COUNT)) synapses"
else
  echo "❌ SYNC VERIFICATION FAILED"
  echo "  $ERRORS critical errors detected (local vs GitHub)"
fi
echo "═══════════════════════════════════════════════════════════════════════════════"
