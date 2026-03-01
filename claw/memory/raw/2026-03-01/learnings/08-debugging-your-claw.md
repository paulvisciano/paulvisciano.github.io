# Debugging Your Claw — Level 100 Ops

**Date:** March 1, 2026  
**Author:** Paul Visciano (via Jarvis)  
**Level:** 100 (but feels like 400)  
**Why this exists:** Because nobody should have to suffer through gateway crashes without a playbook.

---

## The One-Liner

> **Sessions live here:** `~/.openclaw/agents/main/sessions/*.jsonl`

If you remember nothing else, remember this. This is where your conversation history lives. This is what you backup before touching anything.

---

## Quick Reference

| Problem | Command | What It Does |
|---------|---------|--------------|
| **Where are sessions?** | `ls -lh ~/.openclaw/agents/main/sessions/` | Lists all session files with sizes |
| **Backup session** | `cp session.jsonl backup/session-$(date).jsonl` | Copy before deleting |
| **Check gateway status** | `openclaw gateway status` | Is it running? |
| **Stop gateway** | `openclaw gateway stop` | Graceful shutdown |
| **Start gateway** | `openclaw gateway start` | Fresh start |
| **Restart gateway** | `openclaw gateway restart` | Stop + start |
| **View logs** | `tail -f ~/Library/Logs/openclaw/gateway.log` | Watch live logs |
| **View errors** | `tail -100 ~/Library/Logs/openclaw/gateway.err.log` | Last 100 errors |
| **Gateway won't die** | Activity Monitor → Force Kill | Nuclear option |

---

## Session Files — The Full Story

### Location

```bash
~/.openclaw/agents/main/sessions/
```

### What You'll Find

```
├── main-session.jsonl          # Active session (currently in use)
├── some-other-session.jsonl    # Other active sessions
└── backup/                      # Archived sessions (safe to keep)
    ├── 2026-02-28-session.jsonl
    └── 2026-03-01-session.jsonl
```

### File Sizes Matter

```bash
# Check sizes
du -h ~/.openclaw/agents/main/sessions/*.jsonl

# Typical sizes:
# 500KB - 2MB   = Normal, healthy
# 2MB - 3MB     = Getting large, consider rotation
# 3MB+          = Danger zone, context bloat likely
```

**Why size matters:** OpenClaw loads sessions into context. Too big = Ollama chokes = silent failures.

---

## Backup Procedure (BEFORE Touching Anything)

```bash
# 1. Navigate to sessions folder
cd ~/.openclaw/agents/main/sessions/

# 2. Create backup folder if it doesn't exist
mkdir -p backup

# 3. Copy active session(s)
cp *.jsonl backup/$(date +%Y-%m-%d-%H%M%S)-session-backup/

# 4. Verify backup exists
ls -lh backup/
```

**Rule:** Never delete a session without backing it up first. Always.

---

## Reset Procedure (When Things Are Broken)

### Step 1: Stop Gateway

```bash
openclaw gateway stop
```

### Step 2: Check If It Actually Died

```bash
openclaw gateway status
# Should say "not running" or similar

# If still running → Activity Monitor → Force Kill
# Search for "openclaw" or "node" processes
```

### Step 3: Archive Old Sessions

```bash
cd ~/.openclaw/agents/main/sessions/
mkdir -p backup/$(date +%Y-%m-%d)
mv *.jsonl backup/$(date +%Y-%m-%d)/
```

### Step 4: Start Fresh

```bash
openclaw gateway start
```

### Step 5: Verify

```bash
openclaw gateway status
# Should show "running"

# Send a test message
# Check if response comes back
```

---

## Log Locations

### Main Gateway Log

```bash
~/Library/Logs/openclaw/gateway.log
```

**What's in here:** Everything. Connections, messages, errors, plugin loads.

**How to read:**
```bash
# Watch live
tail -f ~/Library/Logs/openclaw/gateway.log

# Last 100 lines
tail -100 ~/Library/Logs/openclaw/gateway.log

# Search for specific errors
grep "error" ~/Library/Logs/openclaw/gateway.log | tail -20
```

### Error Log

```bash
~/Library/Logs/openclaw/gateway.err.log
```

**What's in here:** Just errors. Stack traces, failures, crashes.

### WhatsApp-Specific Logs

```bash
# Search gateway.log for WhatsApp tags
grep "\[whatsapp\]" ~/Library/Logs/openclaw/gateway.log | tail -20
```

**Common WhatsApp errors:**
- `ENOTFOUND web.whatsapp.com` → You're offline
- `channel exited` → Connection dropped
- `Precondition Required` → Auth issue, may need re-pairing

---

## Common Errors & Fixes

### `handshake timeout`

**What it means:** Gateway is waiting for a connection that never completes.

**Likely causes:**
- Network is down
- Gateway is hung/frozen
- Port conflict (something else using 18789)

**Fix:**
1. Check your internet
2. Try `openclaw gateway restart`
3. If that fails → Activity Monitor → Force Kill → Start fresh

---

### `ENOTFOUND web.whatsapp.com`

**What it means:** DNS lookup failed. You're offline or WhatsApp's servers are unreachable.

**Fix:**
1. Check WiFi
2. Try loading web.whatsapp.com in browser
3. Wait it out (WhatsApp sometimes has outages)
4. Messages will queue and deliver when back online

---

### `Recovery time budget exceeded — X entries deferred`

**What it means:** Gateway came back online after being down. Too many backlogged messages. It gave up on processing some of them.

**This is the bug.** The delivery recovery system has a time limit. If backlog is too big, it skips entries.

**Symptoms:**
- Voice notes sent but not transcribed
- Messages delivered but not responded to
- Files sitting in `.openclaw/media/inbound/` unprocessed

**Fix:**
1. Check inbound folder: `ls -lt ~/.openclaw/media/inbound/`
2. Manually archive unprocessed files
3. Consider increasing recovery budget (config change)
4. Report as bug — this shouldn't happen

---

### `device_token_mismatch`

**What it means:** Control UI (or another client) has an old auth token.

**Fix:**
1. Refresh Control UI page
2. Re-authenticate if needed
3. Restart gateway if persists

---

### `remote bin probe timed out`

**What it means:** Gateway can't reach the node host service (PaulMacBook in our case).

**Fix:**
1. Check if node is running
2. Restart gateway
3. Check network connectivity between gateway and node

---

### Gateway Won't Start / Port Already In Use

**What it means:** Old gateway process is still holding port 18789.

**Fix:**
```bash
# Find what's using the port
lsof -i :18789

# Kill it
kill -9 <PID>

# Or use Activity Monitor → Force Kill

# Then start fresh
openclaw gateway start
```

---

## When Gateway Is Hung (Zombie State)

**Symptoms:**
- `openclaw gateway stop` does nothing
- `openclaw gateway restart` hangs
- Status says "running" but no responses
- Logs show repeated timeouts

**This is the Activity Monitor scenario.**

### Procedure:

1. **Open Activity Monitor** (Cmd+Space → "Activity Monitor")

2. **Search for "openclaw" or "node"**

3. **Look for processes like:**
   - `node` (OpenClaw gateway)
   - `openclaw` (CLI or gateway)

4. **Select → Click Stop (X icon) → Force Quit**

5. **Verify port is free:**
   ```bash
   lsof -i :18789
   # Should return nothing
   ```

6. **Start fresh:**
   ```bash
   openclaw gateway start
   ```

---

## Media Files — Where They Live

### Inbound (Unprocessed)

```bash
~/.openclaw/media/inbound/
```

**What's here:** Files received but not yet processed (voice notes, images, etc.)

**Normal flow:** File arrives → processed → archived → deleted from inbound

**Problem indicator:** Files accumulating here = processing pipeline is broken

---

### Archived (Processed)

```bash
/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/YYYY-MM-DD/audio/
/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/YYYY-MM-DD/images/
```

**What's here:** Successfully processed and archived media

**Manual recovery:** If inbound files aren't processing, copy them here manually:
```bash
cp ~/.openclaw/media/inbound/*.ogg /Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/2026-03-01/audio/
```

---

## Diagnostic Checklist

**Gateway acting weird? Run through this:**

```bash
# 1. Is gateway running?
openclaw gateway status

# 2. How big are sessions?
du -h ~/.openclaw/agents/main/sessions/*.jsonl

# 3. Any recent errors?
tail -50 ~/Library/Logs/openclaw/gateway.err.log

# 4. Any unprocessed media?
ls -lt ~/.openclaw/media/inbound/ | head -10

# 5. Is port 18789 in use?
lsof -i :18789

# 6. Can you reach WhatsApp?
ping web.whatsapp.com

# 7. When was last successful message?
# Check your chat surface (WhatsApp, Telegram, etc.)
```

---

## Recovery Playbook

**Scenario: Gateway crashed, messages not processing**

```
Step 1: Don't panic
  └─→ Your data is safe (sessions + media are on disk)

Step 2: Backup sessions
  └─→ cp ~/.openclaw/agents/main/sessions/*.jsonl backup/

Step 3: Check logs
  └─→ tail -100 ~/Library/Logs/openclaw/gateway.err.log

Step 4: Try graceful restart
  └─→ openclaw gateway restart

Step 5: If that fails → Force Kill
  └─→ Activity Monitor → Find node/openclaw → Force Quit

Step 6: Start fresh
  └─→ openclaw gateway start

Step 7: Check for orphaned media
  └─→ ls -lt ~/.openclaw/media/inbound/

Step 8: Manually archive if needed
  └─→ cp inbound/*.ogg memory/raw/YYYY-MM-DD/audio/

Step 9: Test
  └─→ Send a message, verify response

Step 10: Document what happened
  └─→ Write it down so next time is easier
```

---

## Prevention Tips

### 1. Session Rotation (Automated)

Create a cron job to rotate sessions before they get too big:

```bash
# /Users/paulvisciano/.openclaw/scripts/rotate-sessions.sh
#!/bin/bash
# Archive sessions older than 4 hours, compress them
# See Learning #7 for full implementation
```

### 2. Regular Backups

```bash
# Weekly backup (add to cron)
cp -r ~/.openclaw/agents/main/sessions/ ~/Backups/openclaw-sessions-$(date)/
```

### 3. Monitor Session Size

```bash
# Add to your heartbeat checks
du -h ~/.openclaw/agents/main/sessions/*.jsonl
# Alert if > 2.5MB
```

### 4. Keep Logs Around

Don't delete old logs immediately. They're gold for debugging:
```bash
# Keep last 7 days of logs
find ~/Library/Logs/openclaw/ -name "*.log" -mtime +7 -delete
```

---

## Glossary

| Term | Meaning |
|------|---------|
| **Session** | Your conversation history (`.jsonl` file) |
| **Gateway** | The OpenClaw server process (handles messaging, tools, agents) |
| **Node** | A connected device (your Mac, phone, etc.) |
| **Inbound** | Media folder for unprocessed files |
| **Handshake** | Initial connection between gateway and client |
| **Delivery Recovery** | System that re-processes messages after outage |
| **Context Bloat** | Session too large → Ollama fails silently |
| **Zombie Process** | Process that won't die gracefully (needs force kill) |

---

## Related Learnings

- **Learning #7:** Cron-Based Session Rotation (automated prevention)
- **Incident #001:** Gateway Crash & Recovery (March 1, 2026)
- **Neurograph Node:** "Failure/Recovery Patterns" (TBD)

---

## Final Wisdom

> **"The best time to backup is before you need to."**

> **"If `openclaw gateway stop` doesn't work, Activity Monitor always does."**

> **"Sessions are just files. Files can be copied. Nothing is lost."**

> **"Logs don't lie. Read them before guessing."**

---

**This document exists because Paul suffered.** May your debugging be shorter than his was. 🫡

**Updated:** March 1, 2026 — Born from real pain, documented for future peace.
