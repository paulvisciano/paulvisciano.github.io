# OpenClaw Agent Loop Learning
**Date:** Feb 24 2026, 09:28-09:30 GMT+7  
**Source:** Jarvis + Paul collaboration  

**Temporal Notes:** [Feb 24, 2026 conversation transcript](/memory/raw/2026-02-24/integrated/transcript.md)


## Sources
- **Official Docs**: https://docs.openclaw.ai/concepts/agent-loop
- **Timestamp**: Fetched 2026-02-24T02:30:03Z

## What I Learned
The **agent loop** is the full authentic run that turns a message into actions and replies: intake → context assembly → model inference → tool execution → streaming replies → persistence.

### Entry Points
- **Gateway RPC**: `agent` and `agent.wait`
- **CLI**: `agent` command
- Both validate params, resolve session, return `{runId, acceptedAt}`

### High-Level Flow
1. Gateway RPC validates params, resolves session, returns `{runId, acceptedAt}` immediately
2. `agentCommand` runs the agent:
   - Resolves model + thinking/verbose defaults
   - Loads skills snapshot
   - Calls `runEmbeddedPiAgent`
3. `runEmbeddedPiAgent`:
   - Serializes runs via per-session + global queues
   - Resolves model + auth profile, builds pi session
   - Subscribes to pi events, streams assistant/tool deltas
   - Enforces timeout → aborts if exceeded
4. `subscribeEmbeddedPiSession` bridges pi-agent-core events:
   - tool events → `stream: "tool"`
   - assistant deltas → `stream: "assistant"`
   - lifecycle events → `stream: "lifecycle"`
5. `agent.wait` waits for lifecycle end/error for runId

### Queueing & Concurrency
- Runs serialized per-session lane + optional global lane
- Prevents tool/session races, keeps history consistent
- Messaging channels choose queue modes (collect/steer/followup)

### Prompt Assembly
- Built from OpenClaw base + skills + bootstrap context + per-run overrides
- Model-specific limits + compaction reserve enforced
- Bootstrap files resolved + injected into system prompt

### Hook Points
**Gateway Hooks:**
- `agent:bootstrap` — modify bootstrap files before system prompt finalized
- Command hooks: `/new`, `/reset`, `/stop`, etc.

**Plugin Hooks:**
- `before_model_resolve` — override provider/model before resolution
- `before_prompt_build` — inject context before submission
- `before_tool_call` / `after_tool_call` — intercept tool params/results
- `tool_result_persist` — transform results before transcript write
- `message_received/sending/sent` — inbound + outbound message hooks
- `session_start/end` — session lifecycle
- `gateway_start/stop` — gateway lifecycle

### Streaming & Output
- Assistant deltas streamed as events
- Block streaming on text_end or message_end
- Chunking at 800-1200 chars (prefers para breaks)
- Soft chunking with coalesce to reduce spam

### Tool Execution
- Tool start/update/end events on tool stream
- Results sanitized for size + images
- Messaging tool sends tracked to suppress duplicates

### Reply Shaping
- Final payloads assembled from assistant + reasoning + tool summaries + errors
- NO_REPLY filtered from outgoing
- Duplicates removed
- Fallback error reply if no renderable payloads + tool error

### Compaction & Retries
- Auto-compaction emits events + can trigger retry
- On retry: in-memory buffers + tool summaries reset to avoid duplicates

### Event Streams
- `lifecycle`: phase start/end/error
- `assistant`: streamed deltas
- `tool`: tool events
- Emitted by subscribeEmbeddedPiSession

### Timeouts
- `agent.wait` default: 30s
- Runtime default: 600s (`agents.defaults.timeoutSeconds`)
- Can end early: timeout, abort, disconnect, RPC timeout, wait timeout

## Key Insights
- The loop is **serialized per-session** — not truly parallel
- Streaming happens as it happens — no final assembly before send
- Tool results flow through hooks, allowing transformation
- Timeouts are enforced at the runtime level
- Block streaming is off by default — messages arrive in full

## Compressed Into Neurons
- `agent-loop` (full run)
- `agent-loop-entry-points` (RPC/CLI)
- `queueing-concurrency` (serialization)
- `prompt-assembly-system` (system prompt)
- `hook-points-system` (extension points)
- `streaming-partial-replies` (output control)
- `tool-execution-messaging` (tool flow)
- `reply-shaping-suppression` (final payload)
- `compaction-retries` (resilience)
- `event-streams-lifecycle` (lifecycle events)
- `chat-channel-handling` (channel routing)
- `agent-loop-timeouts` (safety limits)
