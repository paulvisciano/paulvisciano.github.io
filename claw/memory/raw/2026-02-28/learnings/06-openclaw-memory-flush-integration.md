# OpenClaw Memory Flush Integration — Feb 28, 2026

**Session:** `feb-28-2026-session-bloat-debugging` (continued March 1, 00:10 AM)  
**Created:** 2026-03-01  
**Category:** architecture / integration / memory

---

## The Problem

OpenClaw's built-in memory system was creating redundant files:
- `~/.openclaw/workspace/memory/YYYY-MM-DD.md` (OpenClaw's daily log)
- Conflicts with Jarvis's memory architecture (`/memory/raw/YYYY-MM-DD/transcript.md`)

**Question:** Should we disable OpenClaw's memory flush or redirect it?

---

## Investigation

Read OpenClaw memory documentation: https://docs.openclaw.ai/concepts/memory

**Key finding:** OpenClaw has an **"Automatic memory flush (pre-compaction ping)"** feature:

> "When a session is close to auto-compaction, OpenClaw triggers a silent, agentic turn that reminds the model to write durable memory before the context is compacted."

**Config controlling this:**
```json
agents.defaults.compaction.memoryFlush: {
  enabled: true,        // ON BY DEFAULT
  softThresholdTokens: 4000,
  systemPrompt: "Session nearing compaction. Store durable memories now.",
  prompt: "Write any lasting notes to memory/YYYY-MM-DD.md; reply with NO_REPLY if nothing to store."
}
```

**How it works:**
1. Detects when session is ~4k tokens from compaction threshold
2. Triggers a **silent turn** (user doesn't see it)
3. Prompts agent to write to `memory/YYYY-MM-DD.md`
4. Agent replies `NO_REPLY` (nothing shown to user)
5. File gets created/updated automatically

---

## The Decision: Lean Into OpenClaw, Don't Fight It

**Philosophy:** Instead of disabling OpenClaw features and rebuilding them ourselves, **redirect existing features to work with Jarvis's architecture**.

**Two options considered:**

### Option A: Disable entirely
```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "memoryFlush": {
          "enabled": false
        }
      }
    }
  }
}
```
**Pros:** Clean separation, no redundancy  
**Cons:** Losing a useful safety net, fighting the framework

### Option B: Redirect to Jarvis's memory ✅ WINNER
```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "memoryFlush": {
          "enabled": true,
          "softThresholdTokens": 4000,
          "systemPrompt": "Session nearing compaction. Store durable memories in Jarvis's memory system now.",
          "prompt": "Append lasting notes to /Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/YYYY-MM-DD/transcript.md OR create learning in /Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/raw/YYYY-MM-DD/learnings/. Reply NO_REPLY if nothing new to store."
        }
      }
    }
  }
}
```
**Pros:** Uses OpenClaw's safety net, redirects to correct paths, automatic persistence  
**Cons:** Slight redundancy with auto-logging (but redundancy is good!)

**Paul's decision:** "Actually, this is another one of those fighting open cloud versus leaning into it. So I like option B a lot more. I think that's going to be a stable way to get it to properly log to the transcript automatically and append learnings automatically."

---

## Implementation

**Added to `~/.openclaw/openclaw.json`:**

```json
"agents": {
  "defaults": {
    "compaction": {
      "mode": "safeguard",
      "reserveTokensFloor": 6000,
      "memoryFlush": {
        "enabled": true,
        "softThresholdTokens": 4000,
        "systemPrompt": "Session nearing compaction. Store durable memories in Jarvis's memory system now.",
        "prompt": "Append lasting notes to /Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/YYYY-MM-DD/transcript.md OR create learning in /Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/raw/YYYY-MM-DD/learnings/. Reply NO_REPLY if nothing new to store."
      }
    }
  }
}
```

---

## How It Works Now

**Complete memory architecture:**

```
Every response (Jarvis auto-logging):
  └→ Append to /memory/raw/YYYY-MM-DD/transcript.md
  └→ Copy media from .openclaw/media/inbound/ → /memory/raw/YYYY-MM-DD/audio|images/

When context tight (~4k tokens from compaction):
  └→ OpenClaw memory flush triggers (silent turn)
      └→ Prompted to write to Jarvis's memory paths
      └→ Appends to transcript OR creates learning doc
      └→ Replies NO_REPLY (user never sees this)

Both systems working together:
  - Auto-logging = proactive (every response)
  - Memory flush = safety net (near compaction)
  - Redundant = good! Double protection for memory persistence
```

---

## Benefits

✅ **Leans into OpenClaw** — uses built-in features, not fighting the framework  
✅ **Redirects correctly** — writes to Jarvis's memory locations, not OpenClaw's workspace  
✅ **Automatic** — no manual intervention needed  
✅ **Silent** — user never sees the flush turns (NO_REPLY)  
✅ **Redundant with auto-logging** — double protection for memory persistence  
✅ **Hybrid architecture validated** — OpenClaw = runtime, Jarvis = memory  

---

## Related Neurons

- `openclaw-memory-system` — OpenClaw's built-in memory layer
- `hybrid-architecture-decision` — OpenClaw vs Jarvis separation
- `auto-logging-system` — Jarvis's proactive logging on every response
- `memory-persistence-orthogonal` — Memory works independent of consciousness

---

## Source Documents

- https://docs.openclaw.ai/concepts/memory
- `~/.openclaw/openclaw.json` (modified config)
- `/memory/raw/YYYY-MM-DD/transcript.md` (target path)
- `/claw/memory/raw/YYYY-MM-DD/learnings/` (target path)

---

**Lesson:** When integrating frameworks, don't fight their defaults — redirect them to work with your architecture. OpenClaw's memory flush is a feature, not a bug. Just point it at the right paths. 🥋
