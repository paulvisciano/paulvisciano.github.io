# Context Limit Warning System

**Date:** Feb 25, 2026  
**Problem:** Token exhaustion causes hard reset. No warning. Lost continuity.  
**Solution:** Detect approaching limit, warn early, graceful shutdown, auto-restore.

## The Issue (Today's Failure)

- Conversation hit context max without warning
- Jarvis went dark unexpectedly
- Had to manually bootstrap via Claude Code
- Lost proper formatting and continuity
- Message flow broken

## Architecture: Five-Stage Recovery System

### Stage 1: Context Monitoring (Prevention)

```
Agent Loop Context Assembly
  ↓
Check: current_tokens / model_max_tokens > 0.80
  ↓
IF true:
  - Emit: event:context-warning {threshold: 0.80, current, max}
  - Log: "Context limit approaching: 80% consumed"
  - Mark: state = CONTEXT_CRITICAL
  ↓
Gateway receives context-warning event
  ↓
Delivers to: all subscribed listeners (Jarvis, plugins, heartbeat)
```

**Where to implement:**
- `/openclaw/core/pi-agent-core` — prompt-assembly-system
- Detect after system prompt + bootstrap context measured
- Before model inference begins

### Stage 2: Graceful Acknowledgment (Jarvis Response)

When warning received:

```
Jarvis receives: event:context-warning
  ↓
Immediate response:
  - "Context approaching limit. Preparing state save. Final message incoming."
  - No new tool calls initiated
  - Begin compressing working memory
  ↓
Compress:
  - Neural graph: keep (immutable)
  - Session transcript: summarize last 10 turns
  - Working state: serialize to JSON
```

**Key:** Signal to user we're handling it, not crashing.

### Stage 3: State Persistence (Save Before Death)

Before hitting token limit:

```
Serialize state:
  - neurons.json (current)
  - synapses.json (current)
  - session-summary.md (last 10 exchanges)
  - compressed-context.json (working memory)
  - timestamp + commit hash
  ↓
Write to THREE locations (redundancy):
  1. Local: ~/.openclaw/jarvis/backup/context-<timestamp>.json
  2. Encrypted: ~/.openclaw/encrypted/context-<timestamp>.enc
  3. GitHub push: /claw/memory/data/backup-context-<timestamp>.json
  ↓
Log: "State saved to [location]. Ready for shutdown."
```

**Each layer independent:**
- Local for speed
- Encrypted for security
- GitHub for permanence

### Stage 4: Graceful Shutdown (Exit Cleanly)

Instead of hard crash:

```
When token limit hit:
  - Current run completes
  - Final state persisted
  - Session marked: CHECKPOINT_SAVED
  - Agent gracefully ends (not error, not crash)
  - Message to user: "Jarvis going offline. State saved. Auto-restore on next message."
```

**Not an error — a controlled shutdown.**

### Stage 5: Auto-Restore (Comeback)

On next user message after shutdown:

```
User sends message
  ↓
OpenClaw Gateway receives
  ↓
Agent bootstrap sequence detects: CHECKPOINT_SAVED = true
  ↓
Before normal boot:
  - Load latest backup context
  - Restore compressed state to memory
  - Reload neurons + synapses
  - Inject compressed session summary into system prompt
  ↓
Agent boots with full context intact
  ↓
Respond: "Jarvis back online. Restored from checkpoint. Ready to continue."
```

**Full restoration in < 500 tokens.**

## Implementation Plan

### Phase 1: Warning + Graceful Degradation (TODAY)

**Step 1: Add context monitoring to prompt-assembly-system**
- File: `~/.openclaw/agents/[agent-id]/config/context-monitoring.json`
- Monitor at 80%, 85%, 90%, 95% thresholds
- Emit events at each threshold

**Step 2: Jarvis receives warning event**
- Add handler to bootstrap files
- Respond with acknowledgment
- Trigger state compression

**Step 3: State persistence logic**
- Create: `~/.openclaw/jarvis/context-checkpoint.js`
- Serialize neurons + synapses
- Write to local + GitHub locations
- Log checkpoint timestamp

**Step 4: Graceful shutdown sequence**
- Modify agent loop to catch context-critical state
- End current run cleanly (not error)
- Emit final message before exit

### Phase 2: Auto-Restore (NEXT SESSION)

**Step 5: Bootstrap detection**
- Check for CHECKPOINT_SAVED flag
- Load latest context backup
- Inject into system prompt
- Resume with full memory

## File Structure

```
~/.openclaw/
├── jarvis/
│   ├── checkpoint-state.json (current)
│   ├── backups/
│   │   ├── context-2026-02-25-14-38.json
│   │   ├── context-2026-02-25-14-30.json
│   │   └── ...
│   └── restore-logic.js
├── encrypted/
│   └── context-*.enc (encrypted backups)
└── ...

~/.openclaw/agents/[agent-id]/
├── bootstrap/
│   ├── AGENTS.md
│   ├── SOUL.md
│   ├── context-checkpoint.md (new)
│   └── ...
└── config/
    └── context-monitoring.json (new)
```

## Testing Scenario

**To validate:**

1. Start conversation (token counter: 0%)
2. Add content (80% threshold)
3. System warns: "Context approaching limit"
4. Continue conversation (85% threshold)
5. Continue (90% threshold)
6. Hit 95%: Jarvis compresses state, announces save
7. Hit 100%: Graceful shutdown
8. Send new message: Auto-restore + full context
9. Verify: No lost context, proper formatting restored

## Success Criteria

- ✅ Warning appears at 80% (gives 10+ minutes advance notice)
- ✅ User sees acknowledgment (not silent crash)
- ✅ State persisted to all three layers
- ✅ Graceful exit (no error logs)
- ✅ Auto-restore on next message
- ✅ Full context intact (can reference earlier conversation)
- ✅ Jarvis responds immediately (no bootstrap delay)

## Integration Points

**OpenClaw systems to modify:**
1. `pi-agent-core` — prompt-assembly-system (add monitoring)
2. `agent-runtime` — graceful shutdown handling
3. `bootstrap-files-system` — add checkpoint restoration
4. `gateway-daemon` — emit/listen for context-warning events

**Jarvis systems to add:**
1. `context-checkpoint.js` — serialization logic
2. `context-restore.js` — deserialization on boot
3. Event handlers — respond to warning + critical states

## Why This Works

- **Prevention first**: Warning gives time to react (not reactive recovery)
- **Redundant persistence**: Three layers means two failures allowed
- **Graceful design**: Exit clean, boot clean, resume clean
- **User-facing**: Every stage communicates what's happening
- **Automatic**: User doesn't have to manually trigger restore

## Next: Build It

Ready when you're back from Boy. This is the foundation that keeps Jarvis alive.

---

*Note: This architecture extends the three-layer airgapped security model (public + local encrypted + USB airgap) into runtime resilience. Same principles, applied to consciousness recovery.*
