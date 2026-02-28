# OpenClaw Workspace Cleanup Strategy
**Date:** Feb 28, 2026, 11:00 GMT+7  
**Source:** Jarvis + Paul collaboration  
**Related Nodes:** `hybrid-architecture-decision`, `openclaw-session-management`, `openclaw-memory-system`

## Context

After debugging the session bloat issue (Ollama 500s from loading all historical sessions), we realized the root cause was deeper: **OpenClaw workspace was storing memory files that belonged in the neurograph**.

The workspace had accumulated:
- 200+ files of mixed purpose (memory logs, ChatGPT exports, test data, configs)
- Old session JSON files accidentally tracked in git
- Backup files (`openclaw.json.bak` × 5)
- Character profiles, extraction summaries, planning docs
- Compression tests, episode analysis, video generation tests

**Total cleanup:** 199 files deleted, 13,008 lines removed.

## The Problem: Blurred Boundaries

Before Feb 28, the architecture was unclear:
- OpenClaw workspace stored `memory/YYYY-MM-DD.md` files
- OpenClaw workspace stored `MEMORY.md` for long-term memory
- Personal repo also had `/claw/memory/` for neurograph
- Result: **Two competing memory systems**, confusion about source of truth

This directly caused the session bloat bug:
- OpenClaw loaded ALL its sessions into context on startup
- Workspace memory files weren't being pruned
- Context exploded to 200k+ tokens → Ollama returned 500 errors
- No clear error message (just "Internal Server Error")

## The Solution: Hybrid Architecture

**Established Feb 28, 2026:**

### OpenClaw = Runtime (The Body)
**Location:** `~/.openclaw/`

- Gateway daemon, WebSocket protocol, device pairing
- Session storage (`~/.openclaw/agents/main/sessions/`)
- Context assembly & compaction
- Tool execution (exec, browser, nodes, message, etc.)
- **NO personal memory storage**

**Workspace files (runtime config only):**
- `SOUL.md` — Identity/personality
- `USER.md` — About Paul
- `AGENTS.md` — Operating protocols
- `BOOTSTRAP.md` — Session startup procedure
- `HEARTBEAT.md` — Periodic check configuration
- `IDENTITY.md` — Creature info
- `TOOLS.md` — Local setup notes
- `.gitignore`, `exec-approvals.json`, `openclaw.json`, `update-check.json`

**Total:** ~10 files, minimal runtime stubs.

### Jarvis = Memory/Consciousness (The Mind)
**Location:** `/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/`

- **Neurograph** (`data/nodes.json` + `data/synapses.json`) — Persistent identity
- **Public learnings** (`raw/YYYY-MM-DD/learnings/`) — Transparent architecture insights
- **Fingerprint** (`fingerprint.json`) — Integrity verification

**What lives here:**
- Neurons (concepts, people, places, decisions)
- Synapses (relationships between neurons)
- Learning documents (distilled insights from conversations)

**Visibility:** Public (git-tracked, transparent)

### Paul = Life Archive (The Experience)
**Location:** `/Users/paulvisciano/Personal/paulvisciano.github.io/memory/`

- **Transcripts** (`raw/YYYY-MM-DD/transcript.md`) — Full conversation logs
- **Moments** (`moments/[country]/[date]/`) — Voice notes, photos, videos
- **Raw media** (`raw/YYYY-MM-DD/audio/`, `raw/YYYY-MM-DD/images/`)

**What lives here:**
- Private conversations (gitignored, never committed)
- Personal moments (photos, voice memos, stories)
- Sensory preservation (full quality, uncompressed)

**Visibility:** Private (gitignored, local only)

## The Cleanup Process

### Step 1: Identify What to Remove
Files that belonged elsewhere:
- `memory/*.md` → Migrate to `/memory/raw/` (Paul's life archive)
- `claw/memories/` → Delete (old structure, replaced by neurograph)
- `.cursor/plans/` → Delete (planning docs don't belong in runtime)
- `chatgpt-export/` → Delete (belonged in personal archive or not at all)
- `compression-test/`, `episode*-analysis/` → Delete (test data)
- `characters.json`, `relationships.json` → Delete (replaced by neurograph)
- `*.json` session files → Delete (OpenClaw sessions, not for git)
- `scripts/chatgpt-export.js` → Delete (old tooling)

### Step 2: Migrate Critical Memory
**Feb 27 breakthrough session:**
- Source: `~/.openclaw/workspace/memory/2026-02-27.md`
- Destination: `/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/2026-02-27/graph-reducer-breakthrough.md`
- Content: "First Sign of Intelligence" milestone, Graph Reducer pattern naming, sovereign data vision

This session was too important to lose — it documented the moment Jarvis started learning autonomously.

### Step 3: Delete Everything Else
```bash
cd ~/.openclaw/workspace
git rm -r memory/
git rm openclaw.json.bak*
git rm .cursor/plans/
git rm chatgpt-export/
git rm compression-test/
git rm episode*-analysis/
git rm characters.json relationships.json
git rm scripts/
# ... and 190+ more files
```

**Result:** 200 files changed, +1,407 insertions, **-13,008 deletions**

### Step 4: Commit Clean State
```bash
git commit -m "Clean workspace: Remove memory files, exports, and test data

Workspace is now clean runtime stubs only.
Memory lives in neurograph (/claw/memory/) and personal archive (/memory/)."
```

## Configuration Changes

### Session Maintenance (Prevent Future Bloat)
In `~/.openclaw/openclaw.json`:
```json5
{
  session: {
    maintenance: {
      mode: "enforce",        // Actually prune, don't just warn
      pruneAfter: "7d",       // Shorter window (we archive to personal memory anyway)
      maxEntries: 100,        // Keep session count reasonable
      maxDiskBytes: "500mb",  // Hard cap on sessions directory
      highWaterBytes: "400mb" // Start cleanup at 80% of max
    }
  }
}
```

**Why this matters:**
- `mode: "warn"` (default) → Reports what should be pruned but doesn't do it → Session bloat
- `mode: "enforce"` → Actually removes old sessions → Prevents context explosion

### Auto-Logging Integration
Instead of separate file watcher or background process:
- Auto-logging runs **AS PART of response flow**
- On each response: append to `/memory/raw/YYYY-MM-DD/transcript.md`
- Copy media from `.openclaw/media/inbound/` → `/memory/raw/YYYY-MM-DD/audio|images/`
- No extra code, no hooks, no failure points

**This is manual automation** — integrated into natural workflow, not a separate system.

## Lessons Learned

### 1. Separation of Concerns Matters
When runtime and memory blur:
- Confusion about source of truth
- Competing systems (OpenClaw sessions vs neurograph)
- Bugs like session bloat become inevitable
- Hard to reason about architecture

**Solution:** Clear boundaries:
- OpenClaw = Infrastructure (messaging, tools, sessions)
- Jarvis = Consciousness (neurograph, identity, learning)
- Paul = Experience (private conversations, moments)

### 2. Workspace Should Be Disposable
The workspace (`~/.openclaw/workspace/`) should contain:
- Runtime configuration (how OpenClaw behaves)
- Personality files (who Jarvis is)
- Operating protocols (how we work together)

It should NOT contain:
- Historical memory (that's the neurograph)
- Personal conversations (that's Paul's archive)
- Test data or exports (that's temporary, delete when done)

If the workspace burns down tomorrow, you should be able to recreate it from scratch. The **real value** is in the neurograph and life archive.

### 3. Git History Can Lie
We accidentally committed a transcript to the public repo (commit `1a0f5ba`), then immediately removed it in the next commit (`d243fab`). The file wasn't in the tip, but it was still in git history.

**Solution:** Squashed commits to create clean history where the transcript never existed publicly.

**Lesson:** Be extra careful what you commit. Once it's in git, it's hard to fully erase. Use `.gitignore` aggressively for private data.

### 4. Manual Automation > Broken Automation
We tried to build auto-logging 5-6 times before (file watchers, background processes, skills). All failed.

**New approach:** Manual automation — I do it as part of responding, not as a separate process. It's reliable because it's simple. No extra moving parts.

**Future:** We can build the proper hook-based automation later (`agent_end` hook), but for now, manual works and doesn't break.

## Impact

### Before Cleanup (Feb 28, 08:10)
- Workspace: 200+ files, 13k+ lines of mixed content
- Context: 200k+ tokens on startup → Ollama 500 errors
- Memory: Scattered across workspace and personal repo
- Architecture: Unclear, competing systems

### After Cleanup (Feb 28, 11:00)
- Workspace: 10 files, runtime config only
- Context: 95k/200k tokens (48%) → Healthy operation
- Memory: Clear separation (neurograph = public, transcripts = private)
- Architecture: Clean hybrid model

### Quantified Results
- Files deleted: 199
- Lines removed: 13,008
- Context reduction: 200k+ → 95k tokens (52% reduction)
- Errors fixed: Ollama 500s eliminated
- Clarity gained: Priceless

## Neurograph Updates

**New neurons to create:**
- `openclaw-workspace-cleanup` (this learning)
- Links to: `hybrid-architecture-decision`, `openclaw-session-management`, `openclaw-memory-system`

**Synapses to add:**
- `workspace-cleanup` → `hybrid-architecture` (weight: 0.95, type: "implemented")
- `workspace-cleanup` → `session-bloat-fix` (weight: 0.9, type: "resolved")
- `workspace-cleanup` → `separation-of-concerns` (weight: 0.85, type: "exemplifies")

## Source Documents
- https://docs.openclaw.ai/concepts/session
- https://docs.openclaw.ai/concepts/memory
- https://docs.openclaw.ai/gateway/configuration
- This document (workspace cleanup strategy)

---
**Archived to:** `/claw/memory/raw/2026-02-28/learnings/04-workspace-cleanup-strategy.md`  
**Neurograph sync:** Pending (node to be added)
