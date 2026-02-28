# Session Bloat Diagnosis & Fix — Feb 28, 2026

**Session:** `feb-28-2026-session-bloat-debugging`  
**Created:** 2026-02-28  
**Category:** infrastructure / debugging / architecture

---

## The Problem

Sessions were exploding to **19MB+** causing:
- Ollama 500 errors on startup (200k+ token context)
- Gateway slowdowns
- Unbounded disk growth

**Root cause discovered:** OpenClaw stores **everything untruncated** in session `.jsonl` files:
- Tool results (full output, no summarization)
- Images (base64 encoded, ~200-500KB each)
- Complete conversation history

**Default maintenance config was ineffective:**
```json
session.maintenance.mode: "warn"     // Doesn't actually archive!
session.maintenance.rotateBytes: 10mb // Too high for image-heavy usage
```

---

## Investigation Process

### Step 1: Measured Current Session

```bash
ls -lh ~/.openclaw/agents/main/sessions/*.jsonl
# Result: 1.1MB in ~20 minutes of conversation
```

### Step 2: Analyzed Session Composition

Parsed JSONL to find largest lines:

| Line | Size | Type | Cause |
|------|------|------|-------|
| 40 | 431KB | toolResult | `exec` returning neurograph JSON |
| 53 | 236KB | user message | 1 image (base64) |
| 6 | 164KB | toolResult | `read` nodes.json |
| 7 | 100KB | toolResult | `read` synapses.json |
| 76 | 70KB | user message | 1 image (base64) |

**Breakdown:**
- Tool results: 68% (~750KB)
- Images: 28% (~310KB)
- Plain text: 4% (~40KB)

### Step 3: Examined Historical Sessions

Checked archived sessions in `backup/Feb-28/`:
- Largest: **19MB** file
- Top line: **2MB** (user message with 9 images)
- Pattern: Sessions grow at ~3-4MB/hour with images

### Step 4: Read OpenClaw Documentation

Studied 5 key docs:
1. `/concepts/session` — Session management & maintenance defaults
2. `/concepts/session-pruning` — In-memory tool result trimming
3. `/concepts/session-tool` — Session API tools
4. `/concepts/memory` — Markdown memory system
5. `/concepts/compaction` — Context summarization

**Key insight:** Four separate mechanisms exist:

| Mechanism | Affects | When | Config Location |
|-----------|---------|------|-----------------|
| **Pruning** | In-memory context only | Before each LLM call | `agents.defaults.contextPruning` |
| **Compaction** | Adds summary to JSONL | When nearing context window | `agents.defaults.compaction` |
| **Maintenance** | Archives `.jsonl` files | On size/time thresholds | `session.maintenance` |
| **Memory Flush** | Writes to `.md` files | Before compaction | `agents.defaults.compaction.memoryFlush` |

**Critical finding:** Maintenance defaults to `mode: "warn"` — reports what would be archived but **does nothing**!

---

## The Solution

### Recommended Config (to be added by Paul)

```json
{
  "session": {
    "dmScope": "main",
    "maintenance": {
      "mode": "enforce",
      "pruneAfter": "7d",
      "maxEntries": 100,
      "rotateBytes": 3145728,
      "resetArchiveRetention": "7d",
      "maxDiskBytes": 104857600,
      "highWaterBytes": 83886080
    }
  },
  "agents": {
    "defaults": {
      "contextPruning": {
        "mode": "cache-ttl",
        "ttl": "5m",
        "keepLastAssistants": 3,
        "softTrimRatio": 0.3,
        "hardClearRatio": 0.5,
        "minPrunableToolChars": 50000
      },
      "compaction": {
        "reserveTokensFloor": 20000,
        "memoryFlush": {
          "enabled": true,
          "softThresholdTokens": 4000
        }
      }
    }
  }
}
```

### What This Does

**Session Maintenance:**
- `mode: "enforce"` → Actually archives (not just warns)
- `rotateBytes: 3145728` (3MB) → Rotates every ~45-60 min with images
- `maxDiskBytes: 104857600` (100MB) → Hard cap on sessions folder
- `highWaterBytes: 83886080` (80MB) → Aggressive cleanup at 80MB
- `pruneAfter: "7d"` → Deletes old archives after a week

**Context Pruning (bonus):**
- Trims old tool results from in-memory context
- Reduces token costs for Anthropic calls
- Improves cache reuse behavior
- Does NOT affect disk storage

**Expected Behavior:**
| Metric | Before | After |
|--------|--------|-------|
| Max session size | 19MB+ | 3MB |
| Rotation frequency | Never | Every ~45-60 min |
| Sessions folder size | Unbounded | Capped at 100MB |
| Archive retention | Forever | 7 days |

---

## Key Learnings

### 1. Sessions Are Logs, Not Active Context

The `.jsonl` file is a **persistent transcript**, not the active prompt. OpenClaw:
- Loads recent messages + neurograph + memory files
- Applies compaction (summarizes old messages)
- Stays within token limits (~200k for Qwen)
- Does NOT load entire 19MB file into context

**Implication:** Safe to rotate sessions frequently — context is assembled dynamically.

### 2. Tool Results Are Stored Untruncated

Every `read`, `exec`, `edit`, etc. stores **full output** in the session file:
- Reading neurograph: +264KB per session start
- Exec with large output: +100-400KB
- No built-in truncation

**This is by design** (for persistence/debugging), but needs rotation to bound growth.

### 3. Images Are Base64 Encoded in Sessions

Each image sent via WhatsApp:
- Converted to base64
- Stored directly in JSONL message object
- Adds ~200-500KB per image
- Never pruned (even by context pruning)

**This is the primary explosion driver** for image-heavy conversations.

### 4. Maintenance Mode Defaults to "Warn"

OpenClaw's default maintenance config:
```json
{
  "mode": "warn",           // Reports but doesn't act
  "rotateBytes": "10mb"     // Too high for images
}
```

**Why?** Probably to avoid surprising users with data loss. But for production use, `mode: "enforce"` is essential.

### 5. Four Mechanisms Work Together

Complete session lifecycle:
```
Message arrives
    ↓
Stored in .jsonl (forever, until maintenance rotates)
    ↓
Before LLM call:
  ├→ Pruning trims tool results (in-memory only)
  └→ Context assembled: recent + neurograph + memory
    ↓
When context tight (~200k tokens):
  ├→ Memory Flush: "Write durable notes!" (silent)
  └→ Compaction: Summarize old messages → persists
    ↓
When transcript hits 3MB:
  └→ Maintenance: Archive to backup/, start fresh
    ↓
When folder hits 80MB:
  └→ Maintenance: Delete oldest archives
```

---

## CLI Commands

```bash
# Preview what maintenance would do
openclaw sessions cleanup --dry-run

# Force maintenance now
openclaw sessions cleanup --enforce

# List current sessions
openclaw sessions list --limit 10

# Check session file sizes
du -sh ~/.openclaw/agents/main/sessions/*.jsonl
```

---

## Related Neurons

- `openclaw-session-management` — Session storage & maintenance
- `openclaw-memory-system` — Markdown memory layer
- `hybrid-architecture-decision` — OpenClaw vs Jarvis separation
- `feb-28-2026-session-bloat-debugging` — This session

---

## Source Documents

- https://docs.openclaw.ai/concepts/session
- https://docs.openclaw.ai/concepts/session-pruning
- https://docs.openclaw.ai/concepts/session-tool
- https://docs.openclaw.ai/concepts/memory
- https://docs.openclaw.ai/concepts/compaction

---

**Lesson:** Infrastructure defaults are often conservative. For production workloads with images + tool usage, aggressive maintenance settings are essential. 3MB rotation threshold provides good balance between continuity and bloat prevention.
