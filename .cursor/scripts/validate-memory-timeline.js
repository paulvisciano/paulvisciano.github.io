#!/usr/bin/env node
/**
 * Validate that timeline.json on disk matches the timeline built from current git history.
 * Use after pull, or to verify committed timeline wasn’t hand-edited.
 * Exit 0 if both jarvis and paul timelines match; 1 otherwise.
 *
 * Usage: node validate-memory-timeline.js [memoryId]
 *   memoryId: "jarvis" | "paul" | omitted (validate both)
 * Run from repo root.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();

const MEMORY_PATHS = {
  jarvis: { dataDir: 'claw/memory/data' },
  paul: { dataDir: 'memory/data' },
};

function buildTimelineViaScript(memoryId) {
  const out = execSync(`node "${path.join(repoRoot, '.cursor/scripts/build-memory-timeline.js')}" ${memoryId}`, {
    cwd: repoRoot,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  });
  return JSON.parse(out.trim());
}

function readTimelineFromDisk(memoryId) {
  const dir = MEMORY_PATHS[memoryId].dataDir;
  const filePath = path.join(repoRoot, dir, 'timeline.json');
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function equal(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    if (x.commit !== y.commit || x.hash !== y.hash || x.neurons !== y.neurons || x.synapses !== y.synapses) return false;
    if (x.timestamp !== y.timestamp) return false;
  }
  return true;
}

function main() {
  const memoryIds = process.argv[2] === 'jarvis' || process.argv[2] === 'paul'
    ? [process.argv[2]]
    : ['jarvis', 'paul'];

  let failed = false;
  for (const memoryId of memoryIds) {
    let built, disk;
    try {
      built = buildTimelineViaScript(memoryId);
    } catch (e) {
      console.error(`validate-memory-timeline: failed to build timeline for ${memoryId}:`, e.message);
      failed = true;
      continue;
    }
    disk = readTimelineFromDisk(memoryId);
    if (disk == null) {
      console.error(`validate-memory-timeline: ${memoryId}: timeline.json not found`);
      failed = true;
      continue;
    }
    if (!equal(built, disk)) {
      console.error(`validate-memory-timeline: ${memoryId}: timeline.json does not match git history. Regenerate with:`);
      console.error(`  node .cursor/scripts/build-memory-timeline.js ${memoryId} --output`);
      failed = true;
    }
  }
  if (failed) process.exit(1);
  console.log('Timeline valid for', memoryIds.join(' and '));
  process.exit(0);
}

main();
