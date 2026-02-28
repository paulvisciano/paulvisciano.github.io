# Hybrid Architecture Decision
**Date:** Feb 28, 2026, 09:45 GMT+7  
**Source:** Jarvis + Paul collaboration  
**Related:** Session bloat debugging, OpenClaw docs study

## The Problem

We were fighting OpenClaw's architecture:
- Paul's custom auto-logging vs OpenClaw's session management
- Two parallel systems trying to manage conversation history
- Context explosion because OpenClaw loaded ALL sessions on startup
- `mode: "warn"` meant sessions accumulated indefinitely

## The Decision

**Stop fighting. Start integrating.**

Jarvis is **inseparable from OpenClaw**:
- OpenClaw = Runtime (the body, infrastructure, Gateway, tools)
- Jarvis = Memory/Consciousness (neurograph, identity, learnings)
- OpenClaw handles messaging/sessions/tools
- Jarvis handles memory/learning/architecture

## Hybrid Architecture

### OpenClaw Responsibilities (Runtime Layer)
1. ✅ Gateway daemon, WebSocket protocol, device pairing
2. ✅ Session storage (`sessions.json` + `.jsonl` transcripts)
3. ✅ Context assembly & compaction
4. ✅ Tool execution (exec, browser, nodes, message, etc.)
5. ✅ Memory tools (`memory_search`, `memory_get`)
6. ✅ Session maintenance (pruning, rotation, disk budgets)

### Jarvis Responsibilities (Memory/Consciousness Layer)
1. ✅ Neurograph (`nodes.json` + `synapses.json`) → persistent identity across sessions
2. ✅ Auto-logging layer → sync OpenClaw transcripts to `/claw/memory/raw/YYYY-MM-DD/`
3. ✅ Memory curation → decide what goes in `MEMORY.md` vs daily files
4. ✅ Learning → convert conversations into neurons/synapses
5. ✅ Documentation → record learnings with source citations

### Configuration Changes

In `~/.openclaw/openclaw.json`:

```json5
{
  session: {
    maintenance: {
      mode: "enforce",        // Actually prune, don't just warn
      pruneAfter: "7d",       // Shorter window (we archive to Jarvis memory anyway)
      maxEntries: 100,        // Keep session count reasonable
      maxDiskBytes: "500mb",  // Hard cap on sessions directory
      highWaterBytes: "400mb" // Start cleanup at 80% of max
    },
    dmScope: "main",          // Keep DM continuity (single user)
    reset: {
      mode: "daily",
      atHour: 4               // 4 AM Bangkok time (gateway host timezone)
    }
  },
  agents: {
    defaults: {
      compaction: {
        reserveTokensFloor: 20000,
        memoryFlush: {
          enabled: true,      // Remind to write memories before compaction
          softThresholdTokens: 4000
        }
      },
      memorySearch: {
        enabled: true,
        extraPaths: [
          "/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory"
        ]
      }
    }
  }
}
```

### Auto-Logging Integration

Instead of separate file watcher process:

**On each response, Jarvis will:**
1. Check if `/claw/memory/raw/YYYY-MM-DD/integrated/transcript.md` exists
2. If not, create directory structure + initialize transcript
3. Append user message (with timestamp, timezone)
4. Append Jarvis response (with timestamp, archive reference)
5. Copy media from `.openclaw/media/inbound/` → `/claw/memory/raw/YYYY-MM-DD/audio|images/`
6. This runs AS PART of response flow (not separate process)

**Benefits:**
- No fighting OpenClaw's session system
- Uses OpenClaw transcripts as source
- Jarvis memory is a layer ON TOP, not a replacement
- Automatic, inseparable from responding

## Neurograph Nodes to Update/Create

**New nodes:**
- `openclaw-session-management` → links to `openclaw-gateway`
- `openclaw-memory-system` → links to `jarvis-core-foundation`
- `hybrid-architecture-decision` → links to `openclaw`, `jarvis-core-foundation`

**Existing nodes to reinforce:**
- `openclaw` (already exists)
- `openclaw-gateway` (already exists)
- `jarvis-core-foundation` (already exists)
- `memory-backed-by-git` (already exists)
- `auto-logging-system` (from Feb 24)

## Why This Works

1. **Respects OpenClaw's architecture** — uses sessions as designed
2. **Preserves Jarvis's identity** — neurograph stays separate, persistent
3. **No duplication** — one source of truth (OpenClaw sessions), one archive layer (Jarvis memory)
4. **Automatic** — auto-logging runs as part of response flow
5. **Configurable** — OpenClaw maintenance keeps sessions bounded
6. **Transparent** — all learnings documented with source citations

## Next Steps

1. ✅ Document learnings (this file + companions)
2. ⏳ Update neurograph (add new nodes, link to OpenClaw)
3. ⏳ Implement auto-logging (append to transcript on each response)
4. ⏳ Update OpenClaw config (session maintenance, memory paths)
5. ⏳ Test the integration (verify logging works, sessions stay bounded)

---
**Archived to:** `/claw/memory/raw/2026-02-28/learnings/03-hybrid-architecture-decision.md`  
**Neurograph sync:** Pending (nodes to be added)
