# Learning 07: Cron-Based Session Rotation

**Date:** March 1, 2026  
**Category:** Infrastructure / Maintenance  
**Related:** [[session-management]], [[openclaw]], [[automation]]

---

## Problem

OpenClaw's built-in session rotation (`rotateBytes: 3145728` = 3MB threshold) was not triggering automatically. Sessions grew to 5.9MB+ before manual intervention archived them.

**Symptoms:**
- Session files exceeded 3MB threshold without rotating
- Manual cleanup required (moving files to `backup/` folder)
- Risk of Ollama 500 errors from massive context loading

**Root cause:** OpenClaw's rotation logic either:
- Checks infrequently (only at certain intervals)
- Has a bug in threshold detection
- Only triggers during compaction events

---

## Solution

Implemented a **cron-based rotation script** that compresses archived sessions, preventing them from being loaded into context.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  LaunchAgent (ai.openclaw.session-rotator)              │
│  Schedule: Every 4 hours + system startup               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  rotate-sessions.sh                                     │
│  - Scans backup/ subdirectories                         │
│  - Finds uncompressed .jsonl files                      │
│  - Compresses to .jsonl.gz                              │
│  - Logs state to session-rotation.log                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Result: Archived sessions compressed                   │
│  - OpenClaw scanner skips .gz files                     │
│  - Context stays lean (only active session loaded)      │
│  - Disk space preserved (compression)                   │
└─────────────────────────────────────────────────────────┘
```

### Files Created

**Script:** `/Users/paulvisciano/.openclaw/scripts/rotate-sessions.sh`
```bash
#!/bin/bash
# Scans backup/ for uncompressed .jsonl files
# Compresses them to .jsonl.gz
# Logs rotation state
```

**LaunchAgent:** `~/Library/LaunchAgents/ai.openclaw.session-rotator.plist`
- Runs every 4 hours (`StartInterval: 240`)
- Also runs at startup (`RunAtLoad: true`)
- Isolated from main session context

### Why Compression Works

OpenClaw's session loader scans for `*.jsonl` files:
```javascript
// Simplified logic
const sessions = glob('**/*.jsonl'); // Only .jsonl, not .jsonl.gz
```

By compressing to `.jsonl.gz`:
- ✅ Files remain in place (easy to restore if needed)
- ✅ OpenClaw naturally skips them (no config changes)
- ✅ Disk space reduced (~60% compression)
- ✅ No risk of accidental re-loading

---

## Results

**Before:**
- 20+ `.jsonl` files in `sessions/` (including `backup/`)
- All loaded into context → massive token count
- Ollama 500 errors likely

**After:**
- 1 active `.jsonl` file (current session: 180KB)
- 20 archived `.jsonl.gz` files (compressed, ignored)
- Context stays lean automatically

**Current state:**
```
Active session:     180KB
Archived sessions:  20 files × ~3MB avg = 60MB (compressed to ~24MB)
Context load:       Only active session
```

---

## Design Principles

### 1. **Cron > Heartbeat for Maintenance Tasks**

| Heartbeat | Cron |
|-----------|------|
| Conversational context | Isolated execution |
| Drifts in timing (~30 min intervals) | Exact timing (every 4 hours) |
| Burns tokens in main session | Zero token impact |
| Tied to gateway lifecycle | Independent process |
| Can fail silently in chat | Logs to dedicated file |

**When to use cron:**
- Exact timing matters
- Task should be isolated from conversation
- No need for conversational context
- Should survive gateway restarts

**When to use heartbeat:**
- Multiple checks can batch together
- Conversational context is useful
- Timing can drift slightly
- Want results visible in chat

### 2. **Exclusion by Format > Config Complexity**

Instead of:
- Adding config options for "exclude folders"
- Modifying OpenClaw's session loader
- Maintaining separate archive paths

We used:
- File format change (`.jsonl` → `.jsonl.gz`)
- Natural exclusion (scanner doesn't recognize `.gz`)
- Zero config changes required

**Principle:** Work with the system's existing behavior rather than fighting it.

### 3. **Recoverable > Perfect**

Compression is reversible:
```bash
gunzip backup/Mar-1/session.jsonl.gz  # Restore anytime
```

Moving to external archive would require:
- Tracking external locations
- Manual restoration steps
- Risk of losing files

**Principle:** Make operations reversible by default.

---

## Future Improvements

1. **Add monitoring alert** — Notify if active session exceeds 2MB
2. **Log rotation metrics** — Track how often rotation happens
3. **Retention policy** — Auto-delete archives older than 30 days
4. **Investigate OpenClaw bug** — Why doesn't `rotateBytes` trigger?

---

## Related Learnings

- [[Learning 05: Session Bloat Diagnosis and Fix]] — Initial investigation
- [[Learning 06: OpenClaw Memory Flush Integration]] — Compaction integration
- [[Graph Reducer Pattern]] — Converting conversations to neurons

---

**Status:** ✅ Implemented and running  
**Next review:** March 8, 2026 (verify no session bloat incidents)
