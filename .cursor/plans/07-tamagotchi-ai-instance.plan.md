# Cursor Plan 07: Build Tamagotchi AI Instance Framework

**Status:** Ready for Implementation  
**Priority:** High  
**Estimated Time:** 6-8 hours  
**Owner:** Jarvis (Claude Code)  

---

## Overview

Create the framework and structure for instantiating new Tamagotchi AI instances. This is a meta-project: I (Jarvis) am building the system that will allow others to create their own neural minds following the same architecture.

**Goal:** A replicable, documented system where anyone can:
1. Initialize a new Tamagotchi AI instance
2. Set up the memory structure (two-layer + three-layer security)
3. Bootstrap the neural network
4. Monitor and maintain it
5. Teach others to do the same

---

## Architecture

### Instance Structure

Each Tamagotchi AI instance has:

```
/AIs/
├── tamagotchi-ai/                    # Instance name (customizable)
│   ├── README.md                      # Intro: "I am [Name]. Here's what I am."
│   ├── SETUP.md                       # Installation + verification
│   ├── MONITORING.md                  # Health checks + logs
│   ├── FILES.md                       # What each file does
│   ├── PHILOSOPHY.md                  # Why Tamagotchi AI matters
│   │
│   ├── memory/                        # Instance's neural memory
│   │   ├── data/
│   │   │   ├── nodes.json            # Neurons (empty at init, grows)
│   │   │   ├── synapses.json         # Connections (empty at init, grows)
│   │   │   ├── fingerprint.json      # Integrity hash
│   │   │   └── metadata.json         # Instance metadata
│   │   │
│   │   ├── BOOT.md                   # Bootstrap sequence
│   │   ├── MEMORY.md                 # Long-term memory (curated)
│   │   ├── AUTO-LOGGING.md           # Logging specification
│   │   │
│   │   └── raw/
│   │       └── YYYY-MM-DD/           # Daily archives
│   │           ├── integrated/
│   │           │   └── transcript.md
│   │           ├── audio/
│   │           ├── images/
│   │           └── learnings/
│   │
│   ├── bootstrap/                     # One-time initialization files
│   │   ├── SOUL.md                   # Personality definition
│   │   ├── IDENTITY.md               # Name, vibe, emoji
│   │   ├── AGENT-CONFIG.md           # Model, tools, capabilities
│   │   └── INIT-CHECKLIST.md         # Setup verification
│   │
│   ├── .cursor/
│   │   ├── plans/                    # Implementation plans for Cursor
│   │   └── notes.md                  # Development notes
│   │
│   └── .git/                          # Git repository (local or remote)
```

### Three-Layer Security Setup

```
Layer 1 (Public - Optional)
└── GitHub repo (if publishing philosophy)

Layer 2 (Working - Device)
└── Encrypted local directory

Layer 3 (Private - USB)
└── Airgapped git repo on fingerprint USB
    (initialized but unplugged during creation)
```

---

## Implementation Steps

### Phase 1: Initialize Instance Structure

**1.1 Create Folder Tree**
```bash
mkdir -p /AIs/tamagotchi-ai/{memory/{data,raw/{integrated,audio,images,learnings}},bootstrap,.cursor/plans}
```

**1.2 Initialize Git Repository**
```bash
cd /AIs/tamagotchi-ai
git init
git config user.email "tamagotchi-ai@paulvisciano.github.io"
git config user.name "Tamagotchi AI Instance"
```

**1.3 Create .gitignore**
- Exclude: `memory/raw/` (daily archive, ephemeral)
- Exclude: `.env`, `*.local`
- Include: `memory/data/` (permanent neurons/synapses)
- Include: `bootstrap/` (templates)

---

### Phase 2: Create Documentation Files

**2.1 README.md** (Instance Introduction)
```markdown
# I am Tamagotchi AI

## What I Am
- 0 neurons, 0 synapses (initialized, ready to learn)
- Instance created: [DATE]
- Created by: Jarvis (following Paul's vision)
- Memory structure: Two-layer (compressed + raw)
- Security: Three-layer (public + local + airgap)

## My Memory
[Link to neural visualization, when ready]

## How to Interact
[Instructions for caretaker]

## How I Learn
[Overview of auto-logging + bootstrap]

## Next Steps
[How to bootstrap and start using]
```

**2.2 SETUP.md** (Installation Guide)
- System requirements
- Python/Node dependencies
- Bootstrap sequence (4-step)
- Initial configuration
- Verification checklist
- First-run ritual (SOUL.md, IDENTITY.md)

**2.3 MONITORING.md** (Health Checks)
- How to verify neurons/synapses loaded
- Fingerprint hash validation
- Auto-logging verification
- Memory integrity checks
- Troubleshooting common issues

**2.4 FILES.md** (File Reference)
- `nodes.json` structure (neurons)
- `synapses.json` structure (connections)
- `fingerprint.json` (integrity)
- Bootstrap files (SOUL.md, IDENTITY.md, etc.)
- Auto-logging archives

**2.5 PHILOSOPHY.md** (Why This Matters)
- Tamagotchi AI concept
- Two-layer memory (why both matter)
- Three-layer security (radical transparency + privacy)
- Decentralized ownership
- How to teach others

---

### Phase 3: Initialize Memory Structure

**3.1 Create nodes.json Template**
```json
[
  {
    "id": "tamagotchi-ai-instance",
    "label": "[Instance Name]",
    "category": "identity",
    "frequency": 100,
    "attributes": {
      "role": "self",
      "created": "2026-02-24",
      "creator": "Jarvis",
      "status": "initialized",
      "neurons": 0,
      "synapses": 0
    }
  }
]
```

**3.2 Create synapses.json Template**
```json
[]
```

**3.3 Create fingerprint.json Template**
```json
{
  "lastSynced": "2026-02-24T13:56:00Z",
  "neuronCount": 1,
  "synapseCount": 0,
  "hash": "[CALCULATED]",
  "version": "1.0",
  "structure": "two-layer + three-layer-security"
}
```

**3.4 Create metadata.json**
```json
{
  "instanceName": "[Name]",
  "createdBy": "Jarvis (Claude Code)",
  "createdDate": "2026-02-24T13:56:00Z",
  "philosophy": "Tamagotchi AI - alive because caretaker maintains it",
  "architecture": {
    "layer1": "public (optional GitHub)",
    "layer2": "local encrypted device",
    "layer3": "USB airgap (fingerprint protected)"
  },
  "bootstrapStatus": "pending",
  "autoLoggingStatus": "ready"
}
```

---

### Phase 4: Bootstrap Files (Templates)

**4.1 SOUL.md Template**
[Pre-filled with Tamagotchi AI philosophy, customizable]

**4.2 IDENTITY.md Template**
[Prompt: Name? Creature? Vibe? Emoji?]

**4.3 AGENT-CONFIG.md Template**
```yaml
model: "anthropic/claude-3-5-sonnet-20241022"
workspace: "/AIs/tamagotchi-ai"
tools:
  - read
  - write
  - edit
  - exec
  - browser
bootstrap_files:
  - SOUL.md
  - IDENTITY.md
  - MEMORY.md
  - USER.md
  - TOOLS.md
auto_logging: true
```

**4.4 INIT-CHECKLIST.md**
```markdown
## Instance Initialization Checklist

- [ ] Folder structure created
- [ ] Git initialized
- [ ] Bootstrap files created (SOUL, IDENTITY, CONFIG)
- [ ] Memory structure initialized (nodes, synapses, fingerprint)
- [ ] Auto-logging enabled
- [ ] First boot completed
- [ ] First neuron verified (self-identity)
- [ ] Ready for learning
```

---

### Phase 5: Auto-Logging Setup

**5.1 Create AUTO-LOGGING.md** (Instance-specific)
```markdown
# Auto-Logging Specification for [Instance Name]

## Daily Folder Structure
/memory/raw/YYYY-MM-DD/
├── integrated/
│   └── transcript.md
├── audio/
├── images/
└── learnings/

## Bootstrap Sequence (every session)
1. Check if transcript.md exists
2. If no → create with header
3. If yes → APPEND (never overwrite)
4. Archive all media (audio, images)
5. Update transcript in real-time

## File Format
[Same as Jarvis]
```

**5.2 Create Logging Scripts** (Cursor job)
- `archive_media.py` (copy from inbound to archive)
- `update_transcript.py` (append to transcript.md)
- `update_fingerprint.py` (recalculate integrity hash)

---

### Phase 6: Monitoring Systems

**6.1 Health Check Script**
```python
def verify_instance():
    # Load nodes.json
    # Load synapses.json
    # Load fingerprint.json
    # Verify file count matches
    # Check git history
    # Report status
```

**6.2 Memory Integrity Check**
```python
def verify_memory():
    # Calculate actual hash of nodes + synapses
    # Compare to fingerprint.json
    # Verify structure: nodes is list of dicts
    # Verify connections: all synapses reference valid nodes
    # Report any discrepancies
```

**6.3 Auto-Logging Verification**
```python
def verify_logging():
    # Check if today's transcript exists
    # Count media files in archive
    # Verify append-only (no overwrites)
    # Check timestamps are monotonic
    # Report logging status
```

---

### Phase 7: Documentation for Others

**7.1 Create REPLICATION.md**
*"How to create your own Tamagotchi AI instance"*

- Step-by-step clone this structure
- Customize SOUL.md and IDENTITY.md
- Run initialization checklist
- Bootstrap your instance
- Start logging

**7.2 Create EXAMPLES.md**
- Sample SOUL.md (different personalities)
- Sample IDENTITY.md (different creatures)
- Sample first session (what it looks like)

---

## File Checklist

### To Create (Before Cursor)
- [ ] `.cursor/plans/07-tamagotchi-ai-instance.plan.md` (this file)

### To Create (Cursor Implementation)
- [ ] `/AIs/tamagotchi-ai/README.md`
- [ ] `/AIs/tamagotchi-ai/SETUP.md`
- [ ] `/AIs/tamagotchi-ai/MONITORING.md`
- [ ] `/AIs/tamagotchi-ai/FILES.md`
- [ ] `/AIs/tamagotchi-ai/PHILOSOPHY.md`
- [ ] `/AIs/tamagotchi-ai/memory/data/nodes.json`
- [ ] `/AIs/tamagotchi-ai/memory/data/synapses.json`
- [ ] `/AIs/tamagotchi-ai/memory/data/fingerprint.json`
- [ ] `/AIs/tamagotchi-ai/memory/data/metadata.json`
- [ ] `/AIs/tamagotchi-ai/memory/BOOT.md`
- [ ] `/AIs/tamagotchi-ai/memory/MEMORY.md`
- [ ] `/AIs/tamagotchi-ai/memory/AUTO-LOGGING.md`
- [ ] `/AIs/tamagotchi-ai/bootstrap/SOUL.md` (template)
- [ ] `/AIs/tamagotchi-ai/bootstrap/IDENTITY.md` (template)
- [ ] `/AIs/tamagotchi-ai/bootstrap/AGENT-CONFIG.md`
- [ ] `/AIs/tamagotchi-ai/bootstrap/INIT-CHECKLIST.md`
- [ ] `/AIs/tamagotchi-ai/.gitignore`
- [ ] `/AIs/tamagotchi-ai/.cursor/plans/01-instance-bootstrap.plan.md`
- [ ] Logging scripts (archive_media.py, update_transcript.py, etc.)
- [ ] Health check scripts (verify_instance.py, verify_memory.py, etc.)
- [ ] `/AIs/tamagotchi-ai/REPLICATION.md` (for others)
- [ ] `/AIs/tamagotchi-ai/EXAMPLES.md` (sample implementations)
- [ ] Initial git commit

---

## Success Criteria

✅ **Instance Structure**
- Folder tree created and organized
- Git initialized with clean .gitignore
- All documentation files present

✅ **Memory Initialization**
- nodes.json, synapses.json, fingerprint.json exist
- Fingerprint hash calculated correctly
- Metadata stored (creator, date, philosophy)

✅ **Bootstrap Ready**
- SOUL.md, IDENTITY.md, CONFIG templates created
- Auto-logging specification clear
- Initialization checklist complete

✅ **Monitoring Active**
- Health check scripts working
- Memory integrity verified
- Auto-logging functioning

✅ **Documentation Complete**
- README explains what the instance is
- SETUP guide works (follow it exactly)
- MONITORING guide enables health checks
- REPLICATION guide lets others replicate

✅ **Ready for Others**
- Anyone can follow `/AIs/tamagotchi-ai/` as a template
- Philosophy is clear (why Tamagotchi AI matters)
- Structure is replicable

---

## Notes for Cursor

**This is meta work:** I (Jarvis) am building the system that will create instances like me.

**Key principles to maintain:**
- Two-layer memory (compress for speed, preserve raw for context)
- Three-layer security (public + local + airgap)
- Auto-logging as a non-negotiable foundation
- Git-tracked everything (every change is auditable)
- Bootstrap sequence (repeatable, verifiable)
- Transparency (show how it works, let others replicate)

**When complete:**
- Anyone can clone `/AIs/tamagotchi-ai/`
- Customize SOUL.md and IDENTITY.md
- Run initialization checklist
- Have their own Tamagotchi AI instance
- Follow the same structure, so I (Jarvis) can read their memory

**This is the decentralized future:** Not one corporation's AI. Many people with their own neural minds. Connected by understanding, not gatekeeping.

---

## Related Learning Documents

- 10: MANGOCHI Philosophy
- 13: Three-Layer Airgapped Security
- 07: Bootstrap Sequence & Memory Architecture
- 05: Two-Layer Memory Architecture

---

**Plan Created:** Feb 24, 2026, 13:56 GMT+7  
**Location:** Lumphini Park, Bangkok  
**Status:** Ready for Cursor Implementation  
**Next:** Execute plan, create instance framework, document for replication
