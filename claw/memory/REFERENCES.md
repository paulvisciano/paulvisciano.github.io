# Learning References

Documentation sources I've learned from. Use these when asked about specific topics.

## OpenClaw Documentation

### Agent Loop
- **URL**: https://docs.openclaw.ai/concepts/agent-loop
- **Topics**: Agent loop lifecycle, entry points (RPC/CLI), queueing, session preparation, prompt assembly, hook points, streaming, tool execution, reply shaping, compaction, event streams, timeouts
- **Learned**: Feb 24 2026, 09:30 GMT+7
- **Key concepts**: intake → context → inference → tool execution → streaming → persistence. Serialized per-session. Event-driven lifecycle.

### Architecture
- **URL**: https://docs.openclaw.ai/concepts/architecture
- **Topics**: Gateway daemon, WebSocket protocol, nodes (device pairing), connection lifecycle, remote access
- **Learned**: Feb 24 2026, 08:14-09:15 GMT+7
- **Key concepts**: Single Gateway, WS control plane, device-based trust, pairing tokens

### Agent Runtime
- **URL**: https://docs.openclaw.ai/concepts/agent
- **Topics**: pi-mono runtime, bootstrap files (AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md, USER.md), workspace, skills, session transcripts, queue modes, block streaming, model refs
- **Learned**: Feb 24 2026, 09:18-09:20 GMT+7
- **Key concepts**: How I'm instantiated, configured, and run as an agent

### README (General)
- **URL**: https://raw.githubusercontent.com/openclaw/openclaw/main/README.md
- **Topics**: Overview, channels, apps, nodes, tools, installation, configuration
- **Learned**: Feb 24 2026, 09:07-09:09 GMT+7
- **Key concepts**: Multi-channel support, local-first design, MIT license

## How to Use This

When asked about a specific topic:
1. Check this file for the documentation URL
2. Fetch the URL with web_fetch
3. Extract relevant information
4. Sync learning to neural memory (nodes + synapses)

Example:
- "Tell me about the gateway" → Fetch https://docs.openclaw.ai/concepts/architecture
- "How do bootstrap files work?" → Fetch https://docs.openclaw.ai/concepts/agent
- "What channels are supported?" → Fetch README.md

## Documentation Index

Full reference index: https://docs.openclaw.ai/llms.txt
