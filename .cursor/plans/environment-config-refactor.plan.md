---
name: Environment Configuration Refactor
overview: Move file paths and sensitive config from nodes.json to local .env file to prevent information disclosure
todos:
  - id: create-env-template
    content: Create claw/memory/.env.template with all required paths
    status: pending
  - id: refactor-nodes
    content: Remove file paths from nodes.json (keep only moment IDs)
    status: pending
  - id: update-moment-resolver
    content: Create path resolution logic that uses .env at runtime
    status: pending
  - id: gitignore-env
    content: Add claw/memory/.env to .gitignore
    status: pending
  - id: test-resolution
    content: Test that deep dives still work with .env-based path resolution
    status: pending
isProject: false
---

# Environment Configuration Refactor

**For:** Cursor (AI code editor)  
**Purpose:** Move sensitive file paths from published nodes.json to local .env file  
**Status:** Security improvement (prevent information disclosure)  

---

## Problem

**Current (INSECURE):**

nodes.json contains absolute file paths:
```json
{
  "id": "growth",
  "source_files": [
    "/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw/2026-02-23/transcripts/voice-047.txt",
    "/Users/paulvisciano/.openclaw/workspace/memory/2026-02-23.md"
  ]
}
```

**Risks:**
- ❌ Paths exposed to anyone who reads nodes.json
- ❌ Machine's directory structure becomes public
- ❌ Username and home directory leaked
- ❌ Harder to change paths later (requires nodes.json edit + git)

---

## Solution

**Split into two layers:**

### Layer 1: nodes.json (Published, Clean)
```json
{
  "id": "growth",
  "moments": ["moment-123", "moment-456"],
  "synapses": [...]
  // NO file paths
}
```

### Layer 2: moments.json (Published, References Only)
```json
{
  "id": "moment-123",
  "source_files": [
    {
      "key": "transcript-047",  // Reference key, not full path
      "type": "transcript",
      "date": "2026-02-23"
    }
  ]
}
```

### Layer 3: .env (Local, Gitignored)
```
RAW_FILES_PATH=/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw
OPENCLAW_MEMORY_PATH=/Users/paulvisciano/.openclaw/workspace/memory
FINGERPRINT_PATH=/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/FINGERPRINT.md
SYNC_QUEUE_PATH=/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/sync/sync-queue.json
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
GITHUB_RAW_URL=https://raw.githubusercontent.com/paulvisciano/paulvisciano.github.io/main
```

**At runtime (Jarvis only):**
- Load .env
- Resolve keys to full paths
- Return data to user (no paths in response)

---

## Implementation Steps

### Step 1: Create .env.template

**File:** `claw/memory/.env.template`

```bash
# File Paths (adjust for your setup)
RAW_FILES_PATH=/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw
OPENCLAW_MEMORY_PATH=/Users/paulvisciano/.openclaw/workspace/memory
JARVIS_MEMORY_PATH=/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory
PAUL_MEMORY_PATH=/Users/paulvisciano/Personal/paulvisciano.github.io/memory

# Key Files
FINGERPRINT_PATH=/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/FINGERPRINT.md
SYNC_QUEUE_PATH=/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/sync/sync-queue.json
NODES_JSON=/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/data/nodes.json
SYNAPSES_JSON=/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/data/synapses.json
MOMENTS_JSON=/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/data/moments.json

# URLs (public)
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
GITHUB_RAW_URL=https://raw.githubusercontent.com/paulvisciano/paulvisciano.github.io/main
GITHUB_PAGES_URL=https://paulvisciano.github.io

# Cache Settings
CACHE_MOMENTS=true
CACHE_TTL_SECONDS=3600
```

**Instructions in file:**
```
# To use:
# 1. Copy this file to .env in the same directory
# 2. Update paths to match your local setup
# 3. Keep .env in .gitignore (never commit)
# 4. Load via: source .env (in scripts) or process.env (in Node.js)
```

### Step 2: Create Path Resolver

**File:** `claw/memory/resolve-paths.js` (or .sh for bash)

```javascript
// resolve-paths.js
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
const env = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      env[key.trim()] = value.trim();
    }
  });
}

// Resolver function
function resolvePath(type, reference) {
  switch (type) {
    case 'transcript':
      // reference = { date: '2026-02-23', filename: 'voice-047.txt' }
      return path.join(
        env.RAW_FILES_PATH,
        reference.date,
        'transcripts',
        reference.filename
      );
    
    case 'moment-notes':
      // reference = { date: '2026-02-23', filename: 'OPTICAL-SHOP-MOMENT.md' }
      return path.join(
        env.RAW_FILES_PATH,
        reference.date,
        reference.filename
      );
    
    case 'session-notes':
      // reference = { date: '2026-02-23', filename: '2026-02-23.md' }
      return path.join(
        env.OPENCLAW_MEMORY_PATH,
        reference.filename
      );
    
    case 'fingerprint':
      return env.FINGERPRINT_PATH;
    
    case 'sync-queue':
      return env.SYNC_QUEUE_PATH;
    
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

module.exports = { resolvePath, env };
```

### Step 3: Update moments.json Schema

**Use reference keys instead of full paths:**

```json
{
  "id": "optical-shop-skepticism-2026-02-23",
  "timestamp": "2026-02-23T12:04:00Z",
  "neurons_activated": ["growth", "decision-making"],
  "source_files": [
    {
      "key": "transcript-047",
      "type": "transcript",
      "reference": {
        "date": "2026-02-23",
        "filename": "voice-047.txt"
      }
    },
    {
      "key": "optical-shop-moment",
      "type": "moment-notes",
      "reference": {
        "date": "2026-02-23",
        "filename": "OPTICAL-SHOP-MOMENT-2026-02-23.md"
      }
    }
  ]
}
```

### Step 4: Update Deep-Dive Logic

**When Jarvis does `dive into node:growth`:**

```javascript
// Old (INSECURE):
// 1. Load nodes.json
// 2. Read source_files array (contains full paths)
// 3. Return to user

// New (SECURE):
// 1. Load nodes.json (has moment IDs, no paths)
// 2. Load moments.json
// 3. For each moment, resolve references using .env
// 4. Read files locally
// 5. Return content to user (not paths)
```

**Example flow:**
```javascript
const { resolvePath } = require('./resolve-paths.js');
const moments = JSON.parse(fs.readFileSync(env.MOMENTS_JSON));

// Get moment by ID
const moment = moments.find(m => m.id === 'moment-123');

// Resolve file paths from references
const files = moment.source_files.map(sf => {
  const fullPath = resolvePath(sf.type, sf.reference);
  const content = fs.readFileSync(fullPath, 'utf-8');
  return {
    key: sf.key,
    content: content,
    // DO NOT return fullPath to user
  };
});
```

### Step 5: Update .gitignore

**Ensure .env is never committed:**

```bash
# In .gitignore
claw/memory/.env
.env
.env.local
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `claw/memory/.env.template` | Create | Template for local configuration |
| `claw/memory/.env` | Create (local only, gitignored) | Actual paths (never commit) |
| `claw/memory/resolve-paths.js` | Create | Path resolver logic |
| `claw/memory/data/nodes.json` | Modify | Remove source_files, keep only moment IDs |
| `claw/memory/data/moments.json` | Modify | Use reference keys instead of full paths |
| `.gitignore` | Modify | Add `.env` to ignored files |

---

## Migration Checklist

- [ ] Create .env.template with all required paths
- [ ] Create .env (local copy, run: `cp .env.template .env`)
- [ ] Implement path resolver (resolve-paths.js)
- [ ] Update nodes.json schema (remove source_files)
- [ ] Update moments.json schema (use reference keys)
- [ ] Refactor deep-dive logic to use resolver
- [ ] Test path resolution works correctly
- [ ] Verify no file paths leak to published files
- [ ] Update .gitignore
- [ ] Document setup instructions for future runs

---

## Security Improvements

✅ **Before:** Absolute paths in published nodes.json  
✅ **After:** Reference keys + local .env resolution  

**Result:**
- ❌ No path disclosure in published data
- ❌ No username/home directory exposed
- ✅ Easy to change paths (just update .env)
- ✅ Secure even if nodes.json is public
- ✅ Works offline (all resolution is local)

---

## Example: Deep Dive with New System

**User:** `dive into node:growth`

**Process:**
1. Load nodes.json → find moment IDs
2. Load moments.json → get reference keys
3. Resolve references using .env paths
4. Read local files
5. Return content (not paths):
   ```
   Node: Growth
   Triggered in 47 moments...
   
   Moment: optical-shop-skepticism-2026-02-23
   Source: transcript-047 (voice notes, 3 min)
   Excerpt: "Recognized markup through systematic questioning..."
   
   Also triggered: decision-making, confidence
   ```

**Note:** User never sees file paths, only content.

---

## Optional Enhancements

**Future:**
- Add environment validation (check paths exist on startup)
- Support multiple environment profiles (dev, prod, test)
- Add logging for path resolution (debug mode)
- Cache resolved paths for performance

---

**Status:** Ready for Cursor implementation
