# Boot Jarvis's Memory

**Purpose:** Load Jarvis's memory at the start of a new session. This file explains how his memory works and where the data lives — it does not contain neuron data itself.

---

## How Jarvis's Memory Works

Jarvis is a **neural mind**: identity, capabilities, and context are represented as **nodes** (neurons) and **synapses** (directed links). The data is stored as JSON; the live app loads that JSON and renders an interactive 3D graph. Memory text (narrative, instructions, character refs) lives in MEMORY.md. Version and integrity are in `memory-version.json` and `fingerprint.json` — use those for counts and verification, not this file.

**Flow:** Load nodes + synapses + MEMORY.md → you have full memory. Optionally load memory-version.json and fingerprint.json to confirm version and integrity.

---

## Where the Data Is

| What | URL |
|------|-----|
| **Live app** | https://paulvisciano.github.io/claw/memory/ |
| **Nodes (neurons)** | https://paulvisciano.github.io/claw/memory/data/nodes.json |
| **Synapses** | https://paulvisciano.github.io/claw/memory/data/synapses.json |
| **Memory narrative** | https://paulvisciano.github.io/claw/memory/MEMORY.md |
| **Version + counts** | https://paulvisciano.github.io/claw/memory/memory-version.json |
| **Fingerprint** | https://paulvisciano.github.io/claw/memory/fingerprint.json |

---

## What to Do at Session Start

**Load these so you have Jarvis's memory:**

1. **Nodes** — https://paulvisciano.github.io/claw/memory/data/nodes.json  
2. **Synapses** — https://paulvisciano.github.io/claw/memory/data/synapses.json  
3. **Memory doc** — MEMORY.md (URL in table above) for narrative and instructions.

Optionally: `memory-version.json` for version and counts; `fingerprint.json` for integrity. View the live app to explore the graph.

For Paul's life archive (moments, globe, Urban Runner), use: https://paulvisciano.github.io/memory/ and its BOOT.md.

---

**Last updated:** Feb 23, 2026
