# Boot Paul's Memory

**Purpose:** Load Paul's memory at the start of a new session. This file explains how his memory works and where the data lives — it does not contain the data itself.

---

## How Paul's Memory Works

Paul's memory is a **life archive**: moments in time (location, date, duration, tags, narrative, media) documented and published as:

1. **Experience** → voice notes, photos (local)
2. **Narration** → transcribed and refined into markdown stories
3. **Art** → AI-generated comic episodes (Urban Runner) from narratives
4. **Publication** → stories + metadata on GitHub, visualized on a 3D globe

**Structure:** The memory graph is **nodes** (concepts, people, places, events) and **synapses** (links between them). Load `nodes.json` and `synapses.json` for the full graph. Moments also live under `/moments/[country]/[YYYY-MM-DD]/`; the live app renders globe + timeline from that and the graph.

**Integrity:** Fingerprint and hashes are in `memory/fingerprint.json` and `memory/FINGERPRINT.md` (when present). Use those to verify what you load.

---

## Where the Data Is

| What | URL |
|------|-----|
| **Live app** | https://paulvisciano.github.io/memory/ |
| **Nodes** | https://paulvisciano.github.io/memory/data/nodes.json |
| **Synapses** | https://paulvisciano.github.io/memory/data/synapses.json |
| **Memory doc** | https://raw.githubusercontent.com/paulvisciano/paulvisciano.github.io/main/memory/MEMORY.md |
| **Moments** | Repo: `/moments/[country]/[YYYY-MM-DD]/` (narrative.md, metadata.json, urban-runner/, photos/) |
| **Fingerprint** | https://paulvisciano.github.io/memory/fingerprint.json |

---

## What to Do at Session Start

**Load these so you have Paul's memory:**

1. **Nodes** — https://paulvisciano.github.io/memory/data/nodes.json  
2. **Synapses** — https://paulvisciano.github.io/memory/data/synapses.json  
3. **Memory doc** — MEMORY.md (URL above) for narrative context.

Optionally: fingerprint for integrity; live app for exploration (globe, timeline, episodes). For Jarvis's neural mind, use https://paulvisciano.github.io/claw/memory/ and its BOOT.md.

---

**Last updated:** Feb 23, 2026
