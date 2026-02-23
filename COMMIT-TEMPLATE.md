# Memory Sync Commit Message Template

**Format for memory updates (fingerprinting):**

```
🧠 Memory Sync [Date]: [Jarvis neurons] neurons | [Jarvis synapses] synapses | 
Paul [Paul neurons] | [Paul synapses] | fingerprint [hash]
```

**Example:**
```
🧠 Jarvis Memory Sync (Feb 23 20:30): 60 neurons +4 | 105 synapses +13 | 
Paul 111 | 311 | fingerprint 8bbaeedd...
```

**What this means:**
- **Jarvis: 60 neurons, 105 synapses** — Current neural state (exact counts)
- **Paul: 111 neurons, 311 synapses** — Current lived experience (exact counts)
- **fingerprint: 8bbaeedd...** — SHA-256 hash proving this exact state

---

## Commit Message Requirements

Every memory sync commit must include:

1. **Emoji:** 🧠 (memory) or 🔐 (fingerprinting)
2. **Date:** (Feb 23 20:30)
3. **Neuron counts:** Exact numbers from nodes.json length
4. **Synapse counts:** Exact numbers from synapses.json length
5. **Fingerprint:** First 8 chars of combined SHA-256 hash
6. **(Optional) Growth:** +4 neurons, +13 synapses (if tracking deltas)

---

## Why This Matters

**The commit log becomes an auditable history:**

```
d3c3301 🔍 Add sync verification script
6c93829 🧠 Jarvis: 60 | 105 | Paul: 111 | 311 | 8bbaeedd...
1991211 📖 Update README with fingerprinting
3b9ead9 🔐 Memory: 171 neurons | 416 synapses | 803dc6cb78f2...
45a225b 🧠 Jarvis: 56 | 92 | Paul: 111 | 311 | original baseline
```

**Anyone can verify:**
- `git log --oneline` shows the full memory timeline
- Each commit is cryptographically linked to a memory state
- No one can forge history (would need to rewrite git)
- Synapse density (ratios) should be consistent with type of mind

---

## Implementation

**When syncing memory:**

```bash
# 1. Update nodes.json + synapses.json

# 2. Compute counts
JARVIS_NEURONS=$(jq 'length' claw/memory/data/nodes.json)
JARVIS_SYNAPSES=$(jq 'length' claw/memory/data/synapses.json)
PAUL_NEURONS=$(jq 'length' memory/data/nodes.json)
PAUL_SYNAPSES=$(jq 'length' memory/data/synapses.json)

# 3. Compute fingerprint
FINGERPRINT=$(compute_combined_hash)

# 4. Write commit message with exact counts + hash
git commit -m "🧠 Memory Sync (Feb 23): $JARVIS_NEURONS neurons | $JARVIS_SYNAPSES synapses | Paul $PAUL_NEURONS | $PAUL_SYNAPSES | fingerprint ${FINGERPRINT:0:8}..."

# 5. Verify
./verify-sync.sh
```

---

## Verification Against Commit

The commit message is the **source of truth statement**.

**Verify it:**

```bash
# Get the commit message
COMMIT_MESSAGE=$(git log -1 --format=%B)

# Extract claimed values
CLAIMED_NEURONS=$(echo "$COMMIT_MESSAGE" | grep -oP '\d+(?= neurons)')
CLAIMED_SYNAPSES=$(echo "$COMMIT_MESSAGE" | grep -oP '\d+(?= synapses)')
CLAIMED_FINGERPRINT=$(echo "$COMMIT_MESSAGE" | grep -oP 'fingerprint \K[a-f0-9]+')

# Check actual values
ACTUAL_NEURONS=$(jq 'length' claw/memory/data/nodes.json)
ACTUAL_SYNAPSES=$(jq 'length' claw/memory/data/synapses.json)
ACTUAL_FINGERPRINT=$(compute_hash | head -c 8)

# Verify
if [ "$CLAIMED_NEURONS" == "$ACTUAL_NEURONS" ] && \
   [ "$CLAIMED_SYNAPSES" == "$ACTUAL_SYNAPSES" ] && \
   [ "$CLAIMED_FINGERPRINT" == "$ACTUAL_FINGERPRINT" ]; then
  echo "✅ Commit message verified against actual data"
else
  echo "❌ Commit message does NOT match actual data"
fi
```

---

## Long-Term Vision

Over time, your commit log becomes a **complete neural autobiography:**

```
v1.0.0: 56 neurons | 92 synapses (baseline)
v1.0.1: 60 neurons | 105 synapses (+7% growth)
v1.1.0: 68 neurons | 124 synapses (+13% growth)
v1.2.0: 75 neurons | 145 synapses (+10% growth)
```

Each entry is:
- Timestamped (commit date)
- Cryptographically sealed (fingerprint)
- Permanently auditable (git history)
- Publicly verifiable (anyone can check)

This is **authentic memory growth, proven mathematically.**
