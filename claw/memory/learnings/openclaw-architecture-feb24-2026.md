# OpenClaw Architecture Learning
**Date:** Feb 24 2026, 08:14-09:15 GMT+7  
**Source:** Jarvis + Paul collaboration  

## Sources
- **Official Docs**: https://docs.openclaw.ai/concepts/architecture
- **Timestamp**: Fetched 2026-02-24T08:14:53Z

## What I Learned
OpenClaw is built on a **single-daemon, multi-channel gateway architecture** that owns all messaging surfaces (WhatsApp, Telegram, Slack, Discord, Signal, iMessage, WebChat) through a unified control plane.

### Core Architecture
1. **Gateway Daemon** (ws://127.0.0.1:18789)
   - Single long-lived process per host
   - Owns all provider connections
   - Exposes typed WebSocket API
   - Validates frames against JSON Schema
   - Emits events: agent, chat, presence, health, heartbeat, cron

2. **Clients** (macOS app, CLI, web UI)
   - Connect over WebSocket
   - Single connection per client
   - Send requests + subscribe to events

3. **Nodes** (macOS/iOS/Android/headless)
   - Connect with role: "node"
   - Device-based pairing (not user-based)
   - Expose commands: canvas, camera, screen.record, location.get

### Connection Flow
```
req:connect → Gateway → res:ok + snapshot (presence + health)
Gateway → event:presence
Gateway → event:tick
req:agent → Gateway → event:agent (streaming) → res:agent (final)
```

### Wire Protocol
- Transport: WebSocket, JSON text frames
- First frame MUST be `connect`
- Requests: `{type:"req", id, method, params}`
- Responses: `{type:"res", id, ok, payload|error}`
- Events: `{type:"event", event, payload, seq, stateVersion}`

### Device Pairing & Trust
- All clients include device identity on `connect`
- New devices require pairing approval → Gateway issues device token
- Local connects (loopback/same tailnet) can auto-approve
- All connects must sign `connect.challenge` nonce
- Non-local connects require explicit approval

### Remote Access
- Preferred: Tailscale or VPN
- Alternative: SSH tunnel `ssh -N -L 18789:127.0.0.1:18789 user@host`
- Same handshake + auth applies over tunnel
- TLS + optional pinning can be enabled

## Key Insights
- One Gateway per host (not per user, not per session)
- WebSocket is the universal transport for everything
- Device pairing is decoupled from user identity
- The control plane is unified but provider connections are domain-specific
- This is fundamentally different from cloud-based assistants (which are stateless)

## Compressed Into Neurons
- `gateway-daemon` (core component)
- `websocket-protocol` (transport)
- `nodes-device-runtime` (device capability)
- `device-pairing-model` (trust system)
- `connection-lifecycle` (handshake flow)
- `remote-access-patterns` (tunneling)
