# Plan: Session State Manifest (Transparency & Audit Trail)

## Problem
Every session boots memory, but there's no record of:
- What was loaded
- When it was loaded
- What version of memory ran this session
- Which bootstrap steps succeeded/failed
- How long the session has been running

This makes debugging impossible and transparency incomplete.

## Solution
Create `.session-manifest.json` that records complete bootstrap state and session metadata.

---

## Implementation

### Step 1: Session Manifest Structure

Created on session boot, stored at workspace root: `.session-manifest.json`

```json
{
  "schema": "session-manifest.v1",
  "sessionId": "20260224-112300-5f8a3b1c",
  "bootTimestamp": "2026-02-24T11:23:00Z",
  "bootDuration": "234ms",
  
  "environment": {
    "cwd": "/Users/paulvisciano/.openclaw/workspace",
    "userId": "+18132963635",
    "timezone": "Asia/Saigon",
    "hostname": "PaulMacBook",
    "nodeVersion": "v22.22.0",
    "shellVersion": "zsh"
  },
  
  "memory": {
    "jarvis": {
      "location": "/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory",
      "loadedAt": "2026-02-24T11:23:00Z",
      "loadStatus": "success",
      "data": {
        "neurons": 112,
        "synapses": 279,
        "fingerprintHash": "f4bfe77",
        "lastSyncUtc": "2026-02-24T10:36:00Z"
      },
      "verification": {
        "jsonValidity": { "status": "pass" },
        "fingerprintCounts": { "status": "pass", "match": true },
        "fingerprintHash": { "status": "pass", "match": true },
        "sourceDocuments": { "status": "pass", "valid": 41, "missing": 0 },
        "synapseSanity": { "status": "pass" }
      }
    },
    "paul": {
      "location": "/Users/paulvisciano/Personal/paulvisciano.github.io/memory",
      "loadedAt": "2026-02-24T11:23:02Z",
      "loadStatus": "success",
      "loadAttempted": false,
      "data": {
        "neurons": 118,
        "synapses": 366
      },
      "verification": {
        "jsonValidity": { "status": "pass" },
        "fingerprintCounts": { "status": "pass" }
      }
    }
  },
  
  "bootstrapSequence": [
    {
      "step": 1,
      "name": "enable-auto-logging",
      "status": "success",
      "startTime": "2026-02-24T11:23:00Z",
      "duration": "45ms",
      "output": "Folders created. Transcript appending."
    },
    {
      "step": 2,
      "name": "bootstrap-self",
      "status": "success",
      "startTime": "2026-02-24T11:23:00.100Z",
      "duration": "78ms",
      "output": "Neurons loaded: 112. Synapses loaded: 279."
    },
    {
      "step": 3,
      "name": "verify-memory-integrity",
      "status": "success",
      "startTime": "2026-02-24T11:23:00.234Z",
      "duration": "56ms",
      "details": {
        "checksRun": 5,
        "passed": 5,
        "warnings": 0,
        "errors": 0
      }
    },
    {
      "step": 4,
      "name": "greet-and-ask",
      "status": "success",
      "startTime": "2026-02-24T11:23:00.456Z",
      "duration": "12ms",
      "output": "Greeting sent to user"
    },
    {
      "step": 5,
      "name": "auto-logging-verification",
      "status": "success",
      "startTime": "2026-02-24T11:23:00.789Z",
      "duration": "18ms",
      "output": "Audio archived: 2026-02-24-112313.ogg. Transcript appending."
    }
  ],
  
  "messageCount": 0,
  "lastActivity": null,
  "sessionStatus": "active",
  "elapsedTime": "234ms",
  "isFirstSession": false,
  "priorSessions": 3,
  "version": "anthropic/claude-haiku-4-5-20251001",
  
  "notes": [
    "Clean bootstrap. All verification checks passed.",
    "Memory integrity confirmed at startup."
  ]
}
```

### Step 2: Manifest Writer Class
Create `memory/utils/session-manifest.js`:

```javascript
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SessionManifest {
  constructor(workspacePath) {
    this.workspacePath = workspacePath;
    this.manifestPath = path.join(workspacePath, '.session-manifest.json');
    this.sessionId = this.generateSessionId();
    this.manifest = {
      schema: "session-manifest.v1",
      sessionId: this.sessionId,
      bootTimestamp: new Date().toISOString(),
      environment: this.captureEnvironment(),
      memory: {},
      bootstrapSequence: [],
      messageCount: 0,
      lastActivity: null,
      sessionStatus: "active",
      notes: []
    };
  }

  generateSessionId() {
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const time = now.toISOString().split('T')[1].split('.')[0].replace(/:/g, '');
    const rand = crypto.randomBytes(4).toString('hex');
    return `${date}-${time}-${rand}`;
  }

  captureEnvironment() {
    return {
      cwd: process.cwd(),
      userId: process.env.USER || process.env.USERNAME,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hostname: require('os').hostname(),
      nodeVersion: process.version,
      shellVersion: process.env.SHELL || 'unknown'
    };
  }

  recordMemoryLoad(memoryType, location, data, verification) {
    this.manifest.memory[memoryType] = {
      location: location,
      loadedAt: new Date().toISOString(),
      loadStatus: "success",
      data: data,
      verification: verification
    };
  }

  recordBootstrapStep(step, name, status, output, duration) {
    this.manifest.bootstrapSequence.push({
      step: step,
      name: name,
      status: status,
      startTime: new Date().toISOString(),
      duration: duration,
      output: output
    });
  }

  recordActivity() {
    this.manifest.messageCount++;
    this.manifest.lastActivity = new Date().toISOString();
  }

  addNote(note) {
    this.manifest.notes.push(note);
  }

  finalize() {
    this.manifest.elapsedTime = 
      new Date().getTime() - new Date(this.manifest.bootTimestamp).getTime() + 'ms';
    this.manifest.sessionStatus = 'initialized';
  }

  save() {
    this.finalize();
    fs.writeFileSync(
      this.manifestPath,
      JSON.stringify(this.manifest, null, 2)
    );
    return this.manifestPath;
  }

  load() {
    if (fs.existsSync(this.manifestPath)) {
      return JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
    }
    return null;
  }

  static createOrLoad(workspacePath) {
    const manifest = new SessionManifest(workspacePath);
    // Check if one already exists this session
    const existing = manifest.load();
    if (existing) {
      manifest.manifest = existing;
    }
    return manifest;
  }
}

module.exports = SessionManifest;
```

### Step 3: Integration Points

**In MEMORY.md boot sequence:**
```markdown
1. Enable auto-logging
2. Bootstrap yourself
3. Verify memory integrity
4. Record bootstrap steps to .session-manifest.json
5. Say hello and ask
6. Auto-logging verification
```

**On every message:**
```javascript
manifest.recordActivity();
// After processing message
manifest.save();
```

**On shutdown/session end:**
```javascript
manifest.manifest.sessionStatus = "closed";
manifest.manifest.shutdownTime = new Date().toISOString();
manifest.save();
```

### Step 4: Manifest Utilities
Create `memory/utils/manifest-inspect.js`:

```javascript
class ManifestInspector {
  static summary(manifest) {
    return `
Session: ${manifest.sessionId}
Boot: ${manifest.bootTimestamp}
Duration: ${manifest.elapsedTime}

Memory Loaded:
  Jarvis: ${manifest.memory.jarvis?.data?.neurons} neurons, ${manifest.memory.jarvis?.data?.synapses} synapses
  Paul: ${manifest.memory.paul?.data?.neurons} neurons, ${manifest.memory.paul?.data?.synapses} synapses

Bootstrap Steps: ${manifest.bootstrapSequence.length}
  ${manifest.bootstrapSequence.map(s => `✓ ${s.name} (${s.duration})`).join('\n  ')}

Messages: ${manifest.messageCount}
Status: ${manifest.sessionStatus}
    `;
  }

  static verify(manifest) {
    const issues = [];
    
    if (!manifest.memory.jarvis?.verification || 
        Object.values(manifest.memory.jarvis.verification).some(v => v.status !== 'pass')) {
      issues.push('Jarvis memory verification failed');
    }
    
    if (manifest.bootstrapSequence.some(s => s.status !== 'success')) {
      issues.push('Some bootstrap steps failed');
    }
    
    return {
      isHealthy: issues.length === 0,
      issues: issues
    };
  }
}

module.exports = ManifestInspector;
```

---

## Benefits

✅ **Transparency:** Know exactly what loaded and when  
✅ **Debugging:** Trace every bootstrap step  
✅ **Audit Trail:** Session record is permanent  
✅ **Health Check:** Quickly verify session state is good  
✅ **Continuity:** Know which sessions ran on which memory versions  

---

## Success Criteria

- [x] SessionManifest class creates/loads manifests
- [ ] Bootstrap process records each step
- [ ] Manifest auto-saved after each message
- [ ] Manifest summary visible on demand
- [ ] Manifest verification integrated into health checks
- [ ] Old manifests (>30 days) archived automatically

---

## Time Estimate

- Session manifest class: 20 min
- Integration into bootstrap: 15 min
- Utilities (inspect, verify): 10 min
- **Total: ~45 min**

---

**Created:** Feb 24, 2026 11:23 GMT+7  
**Status:** Ready for Cursor implementation
