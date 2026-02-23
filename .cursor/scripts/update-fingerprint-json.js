#!/usr/bin/env node
/**
 * Update fingerprint.json for both Paul (memory/) and Jarvis (claw/memory/).
 * Same hash logic as FINGERPRINT.md. Used by pre-commit so committed fingerprint.json
 * always matches the committed memory state. Both are generated every time so we can
 * verify neither memory has been tampered with.
 *
 * Paul: memory/data/nodes.json + synapses.json + BOOT.md → memory/fingerprint.json
 * Jarvis: claw/memory/data/nodes.json + synapses.json + BOOT.md → claw/memory/fingerprint.json
 *
 * Usage: node update-fingerprint-json.js
 * Run from repo root. Exit: 0 on success, 1 if either memory data is missing.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repoRoot = process.cwd();

function stateDateString() {
  return new Date().toLocaleString('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(',', '') + ' GMT+7';
}

function writeFingerprint(nodesPath, synapsesPath, thirdPath, outPath, verifyUrl) {
  const nodesContent = fs.readFileSync(nodesPath, 'utf-8');
  const synapsesContent = fs.readFileSync(synapsesPath, 'utf-8');
  const thirdContent = fs.existsSync(thirdPath) ? fs.readFileSync(thirdPath, 'utf-8') : '';

  const nodesHash = crypto.createHash('sha256').update(nodesContent).digest('hex');
  const synapsesHash = crypto.createHash('sha256').update(synapsesContent).digest('hex');
  const thirdHash = thirdContent
    ? crypto.createHash('sha256').update(thirdContent).digest('hex')
    : '';
  const masterHash = crypto
    .createHash('sha256')
    .update(nodesHash + synapsesHash + thirdHash)
    .digest('hex');

  const nodes = JSON.parse(nodesContent);
  const synapses = JSON.parse(synapsesContent);

  const payload = {
    lastSynced: stateDateString(),
    masterHash,
    neurons: nodes.length,
    synapses: synapses.length,
    verifyUrl,
  };

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
}

// Paul's memory
const memoryDir = path.join(repoRoot, 'memory');
const memoryDataDir = path.join(memoryDir, 'data');
const memoryNodesPath = path.join(memoryDataDir, 'nodes.json');
const memorySynapsesPath = path.join(memoryDataDir, 'synapses.json');
const memoryBootPath = path.join(memoryDir, 'BOOT.md');
const memoryOutPath = path.join(memoryDir, 'fingerprint.json');

if (!fs.existsSync(memoryNodesPath) || !fs.existsSync(memorySynapsesPath)) {
  console.error('update-fingerprint-json: memory/data/nodes.json or synapses.json missing');
  process.exit(1);
}

const clawDir = path.join(repoRoot, 'claw', 'memory');
const clawDataDir = path.join(clawDir, 'data');
const clawNodesPath = path.join(clawDataDir, 'nodes.json');
const clawSynapsesPath = path.join(clawDataDir, 'synapses.json');
const clawBootPath = path.join(clawDir, 'BOOT.md');
const clawOutPath = path.join(clawDir, 'fingerprint.json');

if (!fs.existsSync(clawNodesPath) || !fs.existsSync(clawSynapsesPath)) {
  console.error('update-fingerprint-json: claw/memory/data/nodes.json or synapses.json missing');
  process.exit(1);
}

// Generate both every time so we know neither memory has been tampered with
writeFingerprint(
  memoryNodesPath,
  memorySynapsesPath,
  memoryBootPath,
  memoryOutPath,
  'paulvisciano.github.io/memory/BOOT.md'
);
console.log('Updated memory/fingerprint.json');

writeFingerprint(
  clawNodesPath,
  clawSynapsesPath,
  clawBootPath,
  clawOutPath,
  'paulvisciano.github.io/claw/memory/BOOT.md'
);
console.log('Updated claw/memory/fingerprint.json');
