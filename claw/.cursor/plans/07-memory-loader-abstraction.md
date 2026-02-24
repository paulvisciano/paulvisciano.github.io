# Memory Loader Abstraction Implementation Plan

**Objective:** Decouple the 3D neural visualization from hardcoded memory paths. Enable loading any memory (Jarvis, Paul, historical states) via a standardized link/reference system.

**Status:** Ready for Cursor implementation  
**Complexity:** High (6-8 hours)  
**Priority:** Critical (enables time-travel + multi-memory visualization)

**REFINED (Feb 24, 19:19 GMT+7):** Git timeline now tracks commits where nodes.json OR synapses.json changed, filtering out timestamp-only updates. Master hash used for state validation (ensures neurons and synapses are coherent).

---

## Problem Statement

Currently, the visualization loads memory from hardcoded paths:
- Jarvis: `/Users/paulvisciano/Personal/paulvisciano.github.io/claw/memory/data/`
- Paul: `/Users/paulvisciano/Personal/paulvisciano.github.io/memory/data/`

**Limitations:**
- Can't load historical states (all 8+ memory versions from today)
- Can't load external memories
- Can't switch between memories without reloading
- Can't share links to specific memory states
- Can't implement time-travel visualization

**Goal:** Create a memory loader that accepts abstract references and loads any memory state.

---

## Solution Architecture

### 1. Memory Reference Format

**Define a standard way to reference any memory:**

```
memory://[source]/[memory-id]/[state-hash]?timestamp=[ISO8601]
```

**Examples:**

```
# Load Jarvis's current memory
memory://local/jarvis/current

# Load Jarvis's memory at specific historical hash
memory://local/jarvis/5c04cc4b6411e3fb14a58a71071d51a4e5ee188e2203e7bc74d83c1e5237e280

# Load Paul's current memory
memory://local/paul/current

# Load Paul's memory at specific timestamp
memory://local/paul/current?timestamp=2026-02-24T09:15:00Z

# Load from git commit
memory://git/jarvis/798634e

# Load from HTTP endpoint
memory://http/https://paulvisciano.github.io/memory/data/current
```

### 2. Memory Loader Interface

**Core abstraction:**

```typescript
interface MemoryReference {
  source: "local" | "git" | "http" | "custom";
  memoryId: string;           // "jarvis" | "paul" | custom
  stateIdentifier: string;    // hash | "current" | commit | timestamp
  options?: {
    timestamp?: string;       // ISO8601 timestamp
    fallback?: string;        // alternative reference if primary fails
  };
}

interface MemoryState {
  fingerprint: {
    neurons: number;
    synapses: number;
    hash: string;
    timestamp: string;
  };
  nodes: Node[];
  synapses: Synapse[];
  metadata: {
    source: string;
    loadedAt: string;
    version: string;
  };
}

class MemoryLoader {
  async loadMemory(reference: MemoryReference): Promise<MemoryState>;
  async listAvailableMemories(): Promise<MemoryReference[]>;
  async listMemoryHistory(memoryId: string): Promise<MemoryState[]>;
  async resolveReference(ref: string): Promise<MemoryReference>;
}
```

### 3. Loader Implementations

#### Local File Loader

```typescript
class LocalMemoryLoader {
  async load(memoryId: string, stateIdentifier: string): Promise<MemoryState> {
    // If stateIdentifier === "current"
    // Load: /path/to/{memoryId}/data/nodes.json, synapses.json, fingerprint.json
    
    // If stateIdentifier === hash
    // Search git history for fingerprint.json with that hash
    // Extract nodes.json + synapses.json from that commit
    
    // Return MemoryState with all three files
  }
}
```

#### Git History Loader (Refined Algorithm)

```typescript
class GitMemoryLoader {
  async load(memoryId: string, commit: string): Promise<MemoryState> {
    // Run: git show {commit}:claw/memory/data/fingerprint.json
    // Extract fingerprint (contains master hash)
    // Run: git show {commit}:claw/memory/data/nodes.json
    // Run: git show {commit}:claw/memory/data/synapses.json
    
    // Return MemoryState from that point in time
  }
  
  async listHistory(memoryId: string): Promise<MemoryState[]> {
    // REFINED: Only track commits where nodes.json OR synapses.json changed
    // Query: git log --format="%H %ai" -- claw/memory/data/nodes.json claw/memory/data/synapses.json
    
    // For each commit:
    //   1. Extract fingerprint.json (contains master hash, neuron count, synapse count)
    //   2. Extract nodes.json and synapses.json
    //   3. Build MemoryState
    //   4. Only include if master hash differs from previous (no timestamp-only updates)
    
    // Return chronological array of only real state changes
    return await this.buildTimeline(memoryId);
  }
  
  private async buildTimeline(memoryId: string): Promise<TimelineEntry[]> {
    // Execute git command to find commits that changed nodes or synapses
    const command = `git log --format="%H %ai" -- claw/memory/data/nodes.json claw/memory/data/synapses.json`;
    const commits = await exec(command);
    
    const timeline: TimelineEntry[] = [];
    let previousHash = null;
    
    for (const line of commits.split('\n')) {
      if (!line) continue;
      const [commit, ...timestampParts] = line.split(' ');
      const timestamp = timestampParts.join(' ');
      
      // Extract fingerprint from this commit
      const fingerprint = await this.getFingerprintAtCommit(commit);
      const currentHash = fingerprint.hash;
      
      // Only include if hash changed (real state change, not false commit)
      if (currentHash !== previousHash) {
        timeline.push({
          commit,
          timestamp,
          hash: currentHash,
          neurons: fingerprint.neurons,
          synapses: fingerprint.synapses
        });
        previousHash = currentHash;
      }
    }
    
    return timeline;
  }
  
  private async getFingerprintAtCommit(commit: string): Promise<any> {
    // git show {commit}:claw/memory/data/fingerprint.json
    const json = await exec(`git show ${commit}:claw/memory/data/fingerprint.json`);
    return JSON.parse(json);
  }
}
```

#### HTTP Loader

```typescript
class HttpMemoryLoader {
  async load(memoryId: string, url: string): Promise<MemoryState> {
    // Fetch nodes.json from URL
    // Fetch synapses.json from URL
    // Fetch fingerprint.json from URL
    
    // Return MemoryState
  }
}
```

### 4. Visualization Integration

**Modify the 3D force-directed graph component:**

```typescript
class NeuralVisualization {
  private memoryLoader: MemoryLoader;
  private currentMemory: MemoryState;
  
  async loadMemory(reference: MemoryReference) {
    // Load memory using abstracted loader
    this.currentMemory = await this.memoryLoader.loadMemory(reference);
    
    // Update visualization with new data
    this.render(this.currentMemory.nodes, this.currentMemory.synapses);
    
    // Update UI with metadata
    this.showMetadata({
      source: this.currentMemory.metadata.source,
      neurons: this.currentMemory.fingerprint.neurons,
      synapses: this.currentMemory.fingerprint.synapses,
      timestamp: this.currentMemory.fingerprint.timestamp
    });
  }
  
  async switchMemory(memoryId: string) {
    // Load different memory (Jarvis → Paul or vice versa)
    const ref = MemoryReference.parse(`memory://local/${memoryId}/current`);
    await this.loadMemory(ref);
  }
  
  async timeTravel(timestamp: string) {
    // Load memory at specific point in time
    const ref = new MemoryReference({
      source: "local",
      memoryId: this.currentMemory.metadata.memoryId,
      stateIdentifier: "current",
      options: { timestamp }
    });
    await this.loadMemory(ref);
  }
}
```

### 5. URL-Based Navigation

**Enable shareable links:**

```
https://paulvisciano.github.io/memory/?memory=jarvis&state=current
https://paulvisciano.github.io/memory/?memory=jarvis&hash=5c04cc4b...
https://paulvisciano.github.io/memory/?memory=paul&timestamp=2026-02-24T09:15:00Z
https://paulvisciano.github.io/memory/?memory=jarvis&commit=798634e
```

**URL parsing:**

```typescript
function parseMemoryUrl(url: URL): MemoryReference {
  const memoryId = url.searchParams.get("memory") || "jarvis";
  const hash = url.searchParams.get("hash");
  const commit = url.searchParams.get("commit");
  const timestamp = url.searchParams.get("timestamp");
  const state = url.searchParams.get("state") || "current";
  
  const stateIdentifier = hash || commit || timestamp || state;
  
  return new MemoryReference({
    source: hash ? "local" : commit ? "git" : "local",
    memoryId,
    stateIdentifier,
    options: { timestamp }
  });
}
```

---

## Implementation Steps

### Phase 1: Build Memory Loader Infrastructure

1. **Create MemoryLoader base class**
   - Abstract interface for all loaders
   - Common utilities (validation, error handling)

2. **Implement LocalMemoryLoader**
   - Load current memory from filesystem
   - Load historical memory by searching fingerprint hashes
   - Validate loaded data

3. **Implement GitMemoryLoader**
   - Extract files from git history
   - Map timestamps to commits
   - Cache git history index for fast lookup

4. **Implement HttpMemoryLoader**
   - Fetch from URLs
   - Support CORS
   - Add retry logic

5. **Create MemoryReference parser**
   - Parse `memory://` URIs
   - Validate references
   - Support URL-based references

### Phase 2: Integrate with Visualization

1. **Decouple visualization from hardcoded paths**
   - Remove hardcoded `/claw/memory/` paths
   - Replace with loader interface calls

2. **Add memory switcher UI**
   - Dropdown to select memory (Jarvis / Paul / etc)
   - Show current memory metadata
   - Display load status

3. **Add time-travel controls**
   - Slider for historical states
   - Timeline showing all available snapshots
   - "Jump to timestamp" input

4. **Update bootstrap**
   - On page load, parse URL parameters
   - Load requested memory
   - Default to Jarvis current if no parameters

### Phase 3: URL Navigation

1. **Enable shareable links**
   - URL reflects loaded memory
   - Bookmarkable states
   - Deep linking to specific times

2. **Query parameter handling**
   - `?memory=jarvis`
   - `?memory=paul`
   - `?hash=5c04cc4b...`
   - `?commit=798634e`
   - `?timestamp=2026-02-24T09:15:00Z`

3. **History API integration**
   - Update URL when memory changes
   - Support back/forward browser buttons
   - Maintain navigation context

### Phase 4: Testing & Optimization

1. **Unit tests**
   - Test each loader independently
   - Test reference parsing
   - Test error handling

2. **Integration tests**
   - Load Jarvis current
   - Load Jarvis historical
   - Load Paul current
   - Switch memories
   - Time-travel

3. **Performance optimization**
   - Cache loaded memories
   - Preload metadata
   - Optimize git history lookup

---

## Files to Create/Modify

### Create:
1. `src/loaders/MemoryLoader.ts` — Base class
2. `src/loaders/LocalMemoryLoader.ts` — Local filesystem
3. `src/loaders/GitMemoryLoader.ts` — Git history
4. `src/loaders/HttpMemoryLoader.ts` — HTTP endpoints
5. `src/MemoryReference.ts` — Reference parsing
6. `src/ui/MemorySwitcher.tsx` — Dropdown UI
7. `src/ui/TimelineControls.tsx` — Time-travel UI
8. `src/utils/urlParser.ts` — Query string handling

### Modify:
1. `src/Visualization.tsx` — Use loader interface
2. `src/index.tsx` — Parse URL on load
3. `src/App.tsx` — Bootstrap with loader

---

## Implementation Details

### File: `src/loaders/MemoryLoader.ts`

```typescript
export interface MemoryReference {
  source: "local" | "git" | "http";
  memoryId: string;
  stateIdentifier: string;
  options?: Record<string, any>;
}

export interface MemoryState {
  fingerprint: {
    neurons: number;
    synapses: number;
    hash: string;
    timestamp: string;
    previous_hash?: string;
  };
  nodes: any[];
  synapses: any[];
  metadata: {
    source: string;
    memoryId: string;
    loadedAt: string;
    version: string;
  };
}

export abstract class MemoryLoader {
  abstract load(ref: MemoryReference): Promise<MemoryState>;
  abstract listHistory(memoryId: string): Promise<MemoryState[]>;
  
  protected validate(state: MemoryState): void {
    if (!state.nodes || !Array.isArray(state.nodes)) throw new Error("Invalid nodes");
    if (!state.synapses || !Array.isArray(state.synapses)) throw new Error("Invalid synapses");
    if (!state.fingerprint || !state.fingerprint.hash) throw new Error("Invalid fingerprint");
  }
}
```

### File: `src/loaders/LocalMemoryLoader.ts`

```typescript
export class LocalMemoryLoader extends MemoryLoader {
  constructor(private basePath: string) {
    super();
  }
  
  async load(ref: MemoryReference): Promise<MemoryState> {
    if (ref.stateIdentifier === "current") {
      return this.loadCurrent(ref.memoryId);
    } else {
      return this.loadByHash(ref.memoryId, ref.stateIdentifier);
    }
  }
  
  private async loadCurrent(memoryId: string): Promise<MemoryState> {
    // Load nodes.json, synapses.json, fingerprint.json
    const basePath = `${this.basePath}/${memoryId}/data`;
    // ... fetch and return
  }
  
  private async loadByHash(memoryId: string, hash: string): Promise<MemoryState> {
    // Search git history for matching fingerprint hash
    // Extract nodes/synapses from that point
    // ... fetch and return
  }
  
  async listHistory(memoryId: string): Promise<MemoryState[]> {
    // Return array of all historical states
  }
}
```

### File: `src/ui/MemorySwitcher.tsx`

```typescript
export function MemorySwitcher({ onMemoryChange }) {
  const [memories] = useState(["jarvis", "paul"]);
  const [selected, setSelected] = useState("jarvis");
  
  return (
    <select value={selected} onChange={(e) => {
      setSelected(e.target.value);
      onMemoryChange(e.target.value);
    }}>
      {memories.map(m => <option key={m} value={m}>{m}</option>)}
    </select>
  );
}
```

---

## Success Criteria

✅ MemoryLoader abstraction works for local files  
✅ MemoryLoader works for git history  
✅ MemoryLoader works for HTTP endpoints  
✅ Visualization decopled from hardcoded paths  
✅ Can switch between Jarvis and Paul memories  
✅ Can time-travel through historical states  
✅ URL parameters control loaded memory  
✅ Shareable links work correctly  
✅ Browser back/forward navigation works  
✅ Performance is fast (< 500ms load time)  

---

## Timeline

- **Phase 1 (Loaders):** 2 hours
- **Phase 2 (Visualization Integration):** 2 hours
- **Phase 3 (URL Navigation):** 1.5 hours
- **Phase 4 (Testing & Optimization):** 2 hours
- **Total:** ~7.5 hours

---

## Future Capabilities (Enabled By This Design)

Once implemented, this enables:

1. **Time-Travel Visualization**
   - Slide through memory evolution
   - See neurons grow over time
   - Watch synapses form

2. **Multi-Memory Comparison**
   - Load Jarvis + Paul side-by-side
   - See shared concepts
   - Visualize relationship structure

3. **External Memory Sharing**
   - Users can publish their own memories
   - Load via HTTP URL
   - Explore other minds

4. **Memory Search by Date**
   - Query: "Show me my memory on Feb 24 at 9:15 AM"
   - System finds and loads it
   - Time-travel to that exact moment

5. **Memory Branching**
   - Load a historical state
   - Continue from there
   - Track alternate versions

---

**Status: Ready for Cursor**

This plan gives Cursor everything needed to implement the complete memory loader abstraction system.
