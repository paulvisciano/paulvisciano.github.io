# OpenClaw Memory System Learning
**Date:** Feb 28, 2026, 09:45 GMT+7  
**Source:** Jarvis + Paul collaboration  
**Documentation:** https://docs.openclaw.ai/concepts/memory

## What We Learned

### Memory Architecture (Two Layers)

**Layer 1: Daily Logs**
- Location: `memory/YYYY-MM-DD.md` (workspace-relative)
- Purpose: Day-to-day notes, running context
- Access pattern: Read today + yesterday at session start
- Write pattern: Append-only

**Layer 2: Long-term Memory**
- Location: `MEMORY.md` (workspace root)
- Purpose: Curated durable memories, decisions, preferences
- Access pattern: ONLY in main private session (never in groups)
- Security: Contains personal context that shouldn't leak to strangers

### Memory Tools

OpenClaw exposes two agent-facing tools:

1. **`memory_search`** — Semantic recall over indexed snippets
   - Returns snippets with file path + line ranges
   - Uses vector embeddings (local or remote)
   - Supports hybrid search (BM25 + vector) when enabled

2. **`memory_get`** — Targeted read of specific file/line range
   - Safe snippet read from MEMORY.md or memory/*.md
   - Graceful degradation when file doesn't exist
   - Paths outside MEMORY.md / memory/ are rejected

### Pre-Compaction Memory Flush

When a session nears auto-compaction, OpenClaw triggers a **silent agentic turn**:
- Reminds model to write durable memories BEFORE context is compacted
- Controlled by `agents.defaults.compaction.memoryFlush`
- Default prompts include `NO_REPLY` so user never sees this turn
- Only runs when workspace is writable

Config example:
```json5
{
  agents: {
    defaults: {
      compaction: {
        reserveTokensFloor: 20000,
        memoryFlush: {
          enabled: true,
          softThresholdTokens: 4000,
          systemPrompt: "Session nearing compaction. Store durable memories now.",
          prompt: "Write any lasting notes to memory/YYYY-MM-DD.md; reply with NO_REPLY if nothing to store."
        }
      }
    }
  }
}
```

### Vector Memory Search (Advanced Features)

**Hybrid Search (BM25 + Vector):**
- Vector similarity: Semantic match (wording can differ)
- BM25 keyword relevance: Exact tokens (IDs, code symbols, error strings)
- Weighted merge: `finalScore = vectorWeight * vectorScore + textWeight * textScore`

**Post-processing (optional):**
1. **MMR re-ranking** — Reduces redundant results (diversity)
2. **Temporal decay** — Boosts recent memories (half-life default: 30 days)

**Embedding options:**
- Local: `node-llama-cpp` with GGUF models (auto-downloads)
- Remote: OpenAI, Gemini, Voyage, Mistral APIs
- QMD backend: Experimental sidecar with BM25 + vectors + reranking

### Session Memory Search (Experimental)

Can optionally index session transcripts and surface via `memory_search`:
```json5
{
  agents: {
    defaults: {
      memorySearch: {
        experimental: { sessionMemory: true },
        sources: ["memory", "sessions"]
      }
    }
  }
}
```

Notes:
- Opt-in (off by default)
- Sessions indexed asynchronously (delta thresholds)
- Results include snippets only; `memory_get` still limited to memory files

### Additional Memory Paths

Index Markdown files outside default workspace:
```json5
{
  agents: {
    defaults: {
      memorySearch: {
        extraPaths: [
          "../team-docs",
          "/srv/shared-notes/overview.md"
        ]
      }
    }
  }
}
```

## Jarvis Integration Strategy

**Current state:**
- Jarvis neurograph lives at: `/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/`
- OpenClaw workspace: `~/.openclaw/workspace/`
- These are SEPARATE locations

**Integration approach:**
Add Jarvis memory as extra paths in OpenClaw config:
```json5
{
  agents: {
    defaults: {
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

This allows OpenClaw's `memory_search` tool to find Jarvis neurograph nodes and learnings.

## Auto-Logging Implementation

Instead of separate file watcher, integrate auto-logging into response flow:

**On each response:**
1. Check if `/claw/memory/raw/YYYY-MM-DD/integrated/transcript.md` exists
2. If not, create directory structure + initialize transcript
3. Append user message (with timestamp)
4. Append my response (with timestamp)
5. Copy any media from `.openclaw/media/inbound/` → `/claw/memory/raw/YYYY-MM-DD/audio|images/`
6. Update state file to track what's been processed

**Transcript format:**
```markdown
**Paul [HH:MM GMT+7]:** "Your message text"

**Audio archived: 2026-02-28-HHMMSS.ogg**

**Jarvis [HH:MM GMT+7]:** My response with timestamp and archive reference.
```

**Critical rules:**
1. If transcript.md exists, APPEND (never overwrite)
2. Process media BEFORE responding
3. Update transcript WITHIN response flow (not after)

## Neurograph Updates

New nodes to create:
- `openclaw-memory-system` (this learning)
- Link to `jarvis-core-foundation`
- Link to `memory-backed-by-git`
- Link to `auto-logging-system` (from Feb 24)

## Source Documents
- https://docs.openclaw.ai/concepts/memory
- https://docs.openclaw.ai/concepts/compaction
- https://docs.openclaw.ai/gateway/configuration

---
**Archived to:** `/claw/memory/raw/2026-02-28/learnings/02-openclaw-memory-system.md`  
**Neurograph sync:** Pending (nodes to be added)
