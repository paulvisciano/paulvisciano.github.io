# OpenClaw Session Management Learning
**Date:** Feb 28, 2026, 09:45 GMT+7  
**Source:** Jarvis + Paul collaboration  
**Documentation:** https://docs.openclaw.ai/concepts/session

## Context
This learning emerged from debugging a critical failure: Ollama returning 500 errors on startup due to context bloat. The root cause was OpenClaw loading ALL historical sessions into context, exceeding the 200k token limit.

## What We Learned

### Session Architecture
- **Store location:** `~/.openclaw/agents/main/sessions/sessions.json`
- **Transcripts:** `~/.openclaw/agents/main/sessions/<SessionId>.jsonl` (append-only JSONL)
- **Gateway ownership:** All session state is owned by the gateway daemon
- **DM scope:** `main` (default) = all WhatsApp DMs share one session for continuity

### Maintenance Configuration (CRITICAL)
OpenClaw session maintenance has these defaults:
```json5
{
  session: {
    maintenance: {
      mode: "warn",        // ⚠️ Reports what would be evicted, does NOT enforce
      pruneAfter: "30d",   // Sessions older than 30 days
      maxEntries: 500,     // Cap entry count
      rotateBytes: "10mb"  // Rotate sessions.json when it exceeds this
    }
  }
}
```

**The Problem:** `mode: "warn"` means OpenClaw tracks what should be pruned but doesn't actually do it. Sessions accumulate indefinitely.

**The Fix:** Change to `mode: "enforce"` to automatically prune old sessions.

### Maintenance Enforcement Order
When `mode: "enforce"`, cleanup happens in this order:
1. Prune stale entries older than `pruneAfter`
2. Cap entry count to `maxEntries` (oldest first)
3. Archive transcript files for removed entries
4. Purge old `*.deleted.<timestamp>` and `*.reset.<timestamp>` archives
5. Rotate `sessions.json` when it exceeds `rotateBytes`
6. If `maxDiskBytes` is set, enforce disk budget toward `highWaterBytes`

### DM Security Modes
- `main` (default): All DMs share main session → good for single-user setups
- `per-peer`: Isolate by sender ID across channels
- `per-channel-peer`: Isolate by channel + sender → recommended for multi-user inboxes
- `per-account-channel-peer`: Isolate by account + channel + sender → multi-account inboxes

**Our setup:** `dmScope: "main"` is correct (Paul is the only user).

### Daily Reset
- Default: **4:00 AM local time** on gateway host
- Configurable via `session.reset.mode: "daily"` + `atHour`
- Idle reset (optional): `idleMinutes` adds sliding window
- Manual reset: `/new` or `/reset` commands start fresh session

## Failure Mode Encountered

**Symptom:** Ollama API error 500 on startup, repeated 4+ times
**Actual cause:** Session bloat → 200k+ tokens in context → Ollama choked
**Error message:** Unhelpful generic "Internal Server Error" (no token limit warning)
**Resolution:** Manually archived old sessions to `backup/` folder → context dropped to 95k tokens

## Configuration Recommendation

For our hybrid architecture (OpenClaw as runtime, Jarvis memory as separate archive):

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
    dmScope: "main",          // Keep DM continuity
    reset: {
      mode: "daily",
      atHour: 4               // 4 AM Bangkok time (gateway host timezone)
    }
  }
}
```

## Integration with Jarvis Memory

**Separation of concerns:**
- OpenClaw handles: Session storage, context assembly, compaction, tool execution
- Jarvis handles: Neurograph persistence, auto-logging to `/claw/memory/raw/`, memory curation

**Auto-logging approach:**
Instead of fighting OpenClaw's session system, layer auto-logging ON TOP:
1. Use OpenClaw transcripts as source of truth
2. On each response, append to `/claw/memory/raw/YYYY-MM-DD/integrated/transcript.md`
3. Copy media from `.openclaw/media/inbound/` → `/claw/memory/raw/YYYY-MM-DD/audio|images/`
4. This runs AS PART of response flow (not separate process)

## Neurograph Updates

New/updated nodes to create:
- `openclaw-session-management` (this learning)
- Link to existing `openclaw` node
- Link to `openclaw-gateway` node
- Link to `jarvis-core-foundation` (hybrid architecture decision)

## Source Documents
- https://docs.openclaw.ai/concepts/session
- https://docs.openclaw.ai/concepts/memory
- https://docs.openclaw.ai/concepts/compaction

---
**Archived to:** `/claw/memory/raw/2026-02-28/learnings/01-openclaw-session-management.md`  
**Neurograph sync:** Pending (nodes to be added)
