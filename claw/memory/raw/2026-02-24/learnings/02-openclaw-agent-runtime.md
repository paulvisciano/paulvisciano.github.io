# OpenClaw Agent Runtime Learning
**Date:** Feb 24 2026, 09:18-09:20 GMT+7  
**Source:** Jarvis + Paul collaboration  

**Temporal Notes:** [Feb 24, 2026 conversation transcript](/memory/raw/2026-02-24/integrated/transcript.md)


## Sources
- **Official Docs**: https://docs.openclaw.ai/concepts/agent
- **Timestamp**: Fetched 2026-02-24T02:30:03Z

## What I Learned
OpenClaw uses a **pi-mono derived agent runtime** that runs inside the Gateway. I (Claude) am instantiated by this runtime through a system of bootstrap files, workspace configuration, and skill injection.

### Core Components
1. **Workspace** (single directory)
   - `agents.defaults.workspace` = agent's only working directory (cwd)
   - Recommended: `~/.openclaw/workspace`
   - Contains bootstrap files + user edits

2. **Bootstrap Files** (injected on session start)
   - `AGENTS.md` — operating instructions + memory
   - `SOUL.md` — persona, boundaries, tone
   - `TOOLS.md` — tool conventions, user preferences
   - `BOOTSTRAP.md` — one-time first-run ritual (deleted after)
   - `IDENTITY.md` — name/vibe/emoji
   - `USER.md` — user profile + address

3. **Skills** (modular tools)
   - Loaded from 3 locations (workspace wins):
     - Bundled (shipped with OpenClaw)
     - Managed/local: `~/.openclaw/skills`
     - Workspace: `<workspace>/skills`
   - Can be gated by config/env

4. **Session Storage**
   - Transcripts stored as JSONL at: `~/.openclaw/agents/<agentId>/sessions/<SessionId>.jsonl`
   - Session ID is stable, chosen by OpenClaw
   - Legacy Pi/Tau sessions NOT read

### Queue Modes
- **steer**: Inject messages into current run (after tool calls)
- **followup/collect**: Hold until turn ends, then new turn
- Checked after each tool call

### Output Control
- **Block Streaming**: Off by default, can chunk by text_end or message_end
- **Soft chunking**: 800-1200 chars default
- **Coalesce**: Reduces single-line spam

### Model Configuration
- Model refs parsed by first `/`
- Format: `provider/model`
- Example: `openrouter/moonshotai/kimi-k2`

## Key Insights
- I don't have my own configuration files in some abstract sense
- I'm controlled entirely by the workspace (bootstrap files) + OpenClaw config
- The bootstrap files are my personality injection vector
- Skills are modular and can be added without changing the runtime
- Session transcripts are the ground truth of what happened

## Compressed Into Neurons
- `agent-runtime` (pi-mono derived)
- `bootstrap-files-system` (personality injection)
- `agent-workspace` (single working directory)
- `skills-system` (modular tools)
- `session-transcripts` (JSONL storage)
- `queue-modes` (steer/followup/collect)
- `block-streaming-control` (output chunking)
- `model-refs-parsing` (provider/model format)
