#!/usr/bin/env node
/**
 * Build memory timeline from git history (07b-git-timeline-algorithm).
 * Only commits where the master hash changed are included (filters timestamp-only updates).
 *
 * Usage: node build-memory-timeline.js [memoryId] [--output]
 *   memoryId: "jarvis" | "paul" (default: jarvis)
 *   --output: write timeline to memory's data dir (e.g. claw/memory/data/timeline.json)
 * Run from repo root.
 */

const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();

const MEMORY_PATHS = {
  jarvis: {
    nodes: 'claw/memory/data/nodes.json',
    synapses: 'claw/memory/data/synapses.json',
    fingerprint: 'claw/memory/fingerprint.json',
    dataDir: 'claw/memory/data',
  },
  paul: {
    nodes: 'memory/data/nodes.json',
    synapses: 'memory/data/synapses.json',
    fingerprint: 'memory/fingerprint.json',
    dataDir: 'memory/data',
  },
};

function exec(cmd, opts = {}) {
  return execSync(cmd, {
    cwd: repoRoot,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
    ...opts,
  });
}

function gitLog(nodesPath, synapsesPath) {
  try {
    const out = exec(
      `git log --format="%H %ai" -- "${nodesPath}" "${synapsesPath}"`
    );
    return out.trim().split('\n').filter(Boolean);
  } catch (e) {
    if (e.status === 128 || e.message.includes('does not have any commits')) {
      return [];
    }
    throw e;
  }
}

function gitShow(commit, filePath) {
  try {
    return execSync(`git show "${commit}:${filePath}"`, {
      cwd: repoRoot,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (_) {
    return null;
  }
}

function contentHash(nodesContent, synapsesContent) {
  return crypto.createHash('sha256').update(nodesContent + '\n' + synapsesContent).digest('hex');
}

/**
 * Build timeline from git. Uses fingerprint when present; for older commits without
 * fingerprint.json, derives state from nodes.json + synapses.json at that commit.
 * @returns {{ commit: string, timestamp: string, hash: string, neurons: number, synapses: number }[]}
 */
function buildMemoryTimeline(memoryId) {
  const paths = MEMORY_PATHS[memoryId];
  if (!paths) {
    throw new Error(`Unknown memoryId: ${memoryId}. Use "jarvis" or "paul".`);
  }

  const lines = gitLog(paths.nodes, paths.synapses);
  const timeline = [];
  let previousHash = null;

  for (const line of lines) {
    const parts = line.split(' ');
    const commit = parts[0];
    const timestamp = parts.slice(1).join(' ');

    const fingerprintJson = gitShow(commit, paths.fingerprint);
    let currentHash;
    let neurons = 0;
    let synapses = 0;

    if (fingerprintJson) {
      try {
        const fingerprint = JSON.parse(fingerprintJson);
        currentHash = fingerprint.masterHash || fingerprint.hash;
        neurons = fingerprint.neurons ?? 0;
        synapses = fingerprint.synapses ?? 0;
      } catch (_) {
        currentHash = null;
      }
    }

    if (!currentHash) {
      const nodesContent = gitShow(commit, paths.nodes);
      const synapsesContent = gitShow(commit, paths.synapses);
      if (!nodesContent || !synapsesContent) continue;
      try {
        const nodes = JSON.parse(nodesContent);
        const syn = JSON.parse(synapsesContent);
        neurons = Array.isArray(nodes) ? nodes.length : 0;
        synapses = Array.isArray(syn) ? syn.length : 0;
        currentHash = contentHash(nodesContent, synapsesContent);
      } catch (_) {
        continue;
      }
    }

    if (currentHash && currentHash !== previousHash) {
      timeline.push({
        commit,
        timestamp,
        hash: currentHash,
        neurons,
        synapses,
      });
      previousHash = currentHash;
    }
  }

  return timeline;
}

function main() {
  const args = process.argv.slice(2);
  const memoryId = (args.find(a => a === 'jarvis' || a === 'paul') || 'jarvis');
  const writeOutput = args.includes('--output');

  const timeline = buildMemoryTimeline(memoryId);

  if (writeOutput) {
    const paths = MEMORY_PATHS[memoryId];
    const outPath = path.join(repoRoot, paths.dataDir, 'timeline.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(timeline, null, 2), 'utf-8');
    console.log(`Wrote ${timeline.length} entries to ${outPath}`);
  } else {
    console.log(JSON.stringify(timeline, null, 2));
  }
}

main();
