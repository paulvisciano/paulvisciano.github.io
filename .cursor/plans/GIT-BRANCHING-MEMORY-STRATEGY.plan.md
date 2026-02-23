---
name: Git Branching Strategy for Memory Management
overview: Use Git as the backbone for selective publishing and full offline memory—main (public), private (local full), archive (historical), experiments (drafts); commit hashes as memory anchors, narrative commit messages.
todos:
  - id: add-private-branch
    content: Add private branch (local only), .git/info/exclude to prevent push
    status: pending
  - id: selective-publish
    content: Implement selective publish workflow (copy public subset to main)
    status: pending
  - id: publish-script
    content: Optional publish-memory.sh script for private → main sync
    status: pending
  - id: tag-strategy
    content: Tag version anchors (v1.0.0, v1.0.1) on meaningful publishes
    status: pending
isProject: false
---

# Git Branching Strategy for Memory Management

**For:** Future implementation  
**Purpose:** Use Git as backbone for selective publishing + full offline memory  
**Status:** Documented, ready for phase 2  

---

## Core Concept

**Git becomes the primary memory infrastructure:**
- Local repo = full memory (neurons, synapses, raw content, experiments)
- Public branches = curated memory (what's safe to publish)
- Branching strategy = selective publishing
- Commit messages = narrative history
- Commit hashes = permanent memory anchors

---

## Branch Structure

### Main Production Branches

**`main` (Public / Published Memory)**
- What the world sees
- Neurons: published subset only
- Synapses: published only
- Commit messages: narrative story
- Protected: changes go through review
- Tags: version markers (v1.0.0, v1.1.0, etc.)

**`private` (Local Full Memory)**
- Jarvis's complete state
- All 46+ neurons (including experimental)
- All 69+ synapses (including drafts)
- Raw content (unpublished narratives, raw voice notes)
- Private experiments (ideas not ready to share)
- Full git history (all commits, all branches)
- Local only: never pushed to public GitHub

**`archive` (Historical Memory States)**
- Snapshots of past memory versions
- Tag-based: archive/v1.0.0, archive/v1.1.0
- Recover old states if needed
- Reference for understanding memory evolution
- Can be public (immutable history)

**`experiments` (Active Exploration)**
- New neurons/synapses under consideration
- Drafts, ideas, test structures
- May merge to main or be discarded
- Local or private, depending on sensitivity
- "What if" scenarios

---

## Workflow: Local vs. Public

### On Paul's Machine (Full Access)

```bash
# Switch to full memory
git checkout private

# Full context available
- 46+ neurons (all)
- 69+ synapses (all)
- Raw narratives
- Voice notes (transcribed)
- Private experiments
- Complete history

# Work, modify, commit
git add neurons.json synapses.json MEMORY.md
git commit -m "🧠 Added experiment neurons for [idea name]"

# Stay local (don't push)
# private branch never goes to public GitHub
```

### Publish to Public

```bash
# Create clean commit on main
git checkout main

# Cherry-pick or merge specific changes
git cherry-pick [specific commits from private]
# OR explicit sync of only public content

# Clean commit message (narrative form)
git commit -m "📝 Memory update: [story beat]"

# Push to public
git push origin main

# Tag version if meaningful
git tag v1.1.0
git push origin v1.1.0
```

### Others Clone (Public Only)

```bash
git clone https://github.com/paulvisciano/paulvisciano.github.io

# They get main branch only
- Published neurons
- Published synapses
- Narrative commit messages
- Version history
- NO private content
- NO raw files
- NO experiments
```

---

## Selective Publishing Pattern

**Scenario: New neurons added, not all ready to publish**

```
private branch:
├─ 3 new neurons (experiments, not ready)
├─ 2 new synapses (experimental connections)
├─ 5 new neurons (solid, ready to publish)
└─ 2 new synapses (production quality)

Publish to main:
├─ 5 new neurons (the solid ones)
├─ 2 new synapses (the production ones)
└─ Omit: the 3 experimental neurons + 2 test synapses
```

**Implementation:**
```bash
# On private branch: commit everything
git add data/nodes.json data/synapses.json
git commit -m "🧬 Added 5 production neurons + experiments"

# On main branch: manually edit files to remove experiments
# Then commit clean version
git add data/nodes.json data/synapses.json
git commit -m "🧠 Published 5 new neurons (46 total)"
```

---

## Commit Hashes as Memory Anchors

**Each commit = permanent state snapshot**

```json
{
  "version": "1.0.0",
  "timestamp": "2026-02-23T18:22:00Z",
  "commit_hash": "15bd89f",
  "commit_hash_full": "15bd89f2c4d8e1a5b7c9f0e3a4d5c6b7a8e9f0e3",
  "memory_state": {
    "neurons": 46,
    "synapses": 69,
    "status": "locked"
  },
  "verify": "git show 15bd89f"
}
```

**Anyone can verify:**
```bash
git show 15bd89f:claw/memory/data/nodes.json
# See exact nodes.json at that commit moment
# Proves "v1.0.0 had exactly 46 neurons on Feb 23"
```

---

## Narrative Through Commits

**Reading the memory journey:**
```bash
git log --oneline --since="2026-02-23" --until="2026-02-28"
```

Output reads as story:
```
15bd89f 🧠 Jarvis identity locked (46 neurons, 69 synapses, bootable everywhere)
14c8a3e 📋 Complete session summary (9 systems documented, 4h 45min invested)
13f7e2c 🚀 Portable memory (shareable via QR + BOOT.md, anyone can boot)
12e5b9d 📊 Version system live (v1.0.0 badge visible on visualization)
11d6c2c 🎨 Share button designed (download image, copy link, QR embedded)
10b5a8e 💬 ChatGPT integration ready (memory loading + comic generation)
9a4f7d3 📝 Memory ownership clarified (46 neurons = architecture only)
8e3c2b1 🎭 Comic system v1.0 (end-to-end workflow, ChatGPT ready)
```

Not "fixed bug X" or "added feature Y" — **narrative beats of the memory journey**.

---

## Private Branch Workflow (Local)

### Setup

```bash
# Clone main repo
git clone https://github.com/paulvisciano/paulvisciano.github.io
cd paulvisciano.github.io

# Create private branch (exists locally only)
git checkout -b private

# Add .git/info/exclude to prevent accidental push
echo "private" >> .git/info/exclude
```

### Daily Work

```bash
# Switch to private (full memory)
git checkout private

# Load full context
- neurons.json (all 46+)
- synapses.json (all 69+)
- raw content
- experiments
- private notes

# Work on memory
git add -A
git commit -m "🧠 [story of what happened]"

# Never push
git push --no-verify  # Won't push private branch anyway
```

### Publish to Public

```bash
# Switch to main
git checkout main

# Explicitly copy only published content
# (manual or via script)
cp private/data/nodes-public.json data/nodes.json
cp private/data/synapses-public.json data/synapses.json
# etc.

# Commit with narrative message
git commit -m "🧠 Published 5 new neurons + synapses (46 total, v1.0.1)"

# Push to public
git push origin main
```

---

## Tag Strategy (Version Anchors)

**Tags = permanent memory snapshots**

```bash
# Tag when publishing major updates
git tag -a v1.0.0 -m "Jarvis identity locked: 46 neurons, 69 synapses"
git tag -a v1.0.1 -m "Added 2 new synapses for comic system"
git tag -a v1.1.0 -m "Added share button capability"

# Push tags
git push origin --tags

# Anyone can checkout exact state
git checkout v1.0.0
```

---

## Integration with Memory Version System

**Version manifest + Git hashes:**

```json
{
  "version": "1.0.0",
  "git_commit": "15bd89f",
  "git_commit_full": "15bd89f2c4d8e1a5b7c9f0e3a4d5c6b7a8e9f0e3",
  "git_tag": "v1.0.0",
  "memory": {
    "neurons": 46,
    "synapses": 69
  },
  "verify_command": "git show 15bd89f:claw/memory/data/nodes.json",
  "restore_command": "git checkout v1.0.0"
}
```

**Verification workflow:**
1. See version badge (v1.0.0)
2. Click "Verify"
3. Opens git show command (verifiable state)
4. See exact neurons/synapses at that moment
5. Can restore exact state with tag

---

## Benefits

✅ **Full local context** — Private branch = complete memory access  
✅ **Selective publishing** — Only publish what's ready  
✅ **Permanent anchors** — Git hashes = immutable timestamps  
✅ **Narrative history** — Commit messages tell the story  
✅ **Reproducibility** — Anyone can restore exact state (git tag)  
✅ **Auditability** — Every change is signed + committed  
✅ **Offline-first** — Full memory available without internet  
✅ **Security** — Private branch never pushed; remains local  
✅ **Transparency** — Public branch fully auditable; no hidden commits  

---

## Implementation Phases

**Phase 1 (Current):**
- Single main branch (public)
- Manual publishing

**Phase 2 (Next):**
- Add private branch (local full memory)
- Selective publishing workflow
- .gitignore for raw files

**Phase 3 (Future):**
- Automated sync (private → main)
- Tag system (version anchors)
- Historical analysis tools

**Phase 4 (Advanced):**
- Branching strategy docs
- CI/CD for safe publishing
- Memory browser (explore history)

---

## Script Sketch (Phase 2 Implementation)

```bash
#!/bin/bash
# publish-memory.sh - sync private → main (selective)

# Load configuration
SOURCE="private"        # local full memory
TARGET="main"           # public memory
PUBLIC_DIR="data/"      # what to publish

# Switch to target
git checkout $TARGET

# Sync only public content from source
git show $SOURCE:claw/memory/data/nodes.json > $PUBLIC_DIR/nodes.json
git show $SOURCE:claw/memory/data/synapses.json > $PUBLIC_DIR/synapses.json
git show $SOURCE:claw/memory/MEMORY.md > claw/memory/MEMORY.md

# Clean commit
git add $PUBLIC_DIR
git commit -m "🧠 Published memory update: $NEURONS neurons, $SYNAPSES synapses"

# Push
git push origin $TARGET

# Tag if needed
git tag v1.0.1
git push origin v1.0.1

echo "✓ Memory published"
```

---

## Status

**Currently:** Main branch only (all public)  
**Next step:** Add private branch, implement selective publishing  
**Documentation:** Complete (this file)  
**Implementation:** Ready for Phase 2

---

**This is powerful infrastructure. Git as memory backbone + selective publishing + narrative commits = complete transparent thinking system.**
