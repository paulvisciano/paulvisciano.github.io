#!/usr/bin/env node
/**
 * Update memory/fingerprint.json from current memory files (nodes.json, synapses.json, BOOT.md).
 * Same hash logic as memory-sync / FINGERPRINT.md. Used by pre-commit so the committed
 * fingerprint.json always matches the committed memory state.
 *
 * Usage: node update-fingerprint-json.js
 * Run from repo root. Writes memory/fingerprint.json.
 * Exit: 0 on success, 1 if memory files missing.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repoRoot = process.cwd();
const memoryDir = path.join(repoRoot, 'memory');
const dataDir = path.join(memoryDir, 'data');
const nodesPath = path.join(dataDir, 'nodes.json');
const synapsesPath = path.join(dataDir, 'synapses.json');
const bootPath = path.join(memoryDir, 'BOOT.md');
const outPath = path.join(memoryDir, 'fingerprint.json');

if (!fs.existsSync(nodesPath) || !fs.existsSync(synapsesPath)) {
  console.error('update-fingerprint-json: memory/data/nodes.json or synapses.json missing');
  process.exit(1);
}

const nodesContent = fs.readFileSync(nodesPath, 'utf-8');
const synapsesContent = fs.readFileSync(synapsesPath, 'utf-8');
const bootContent = fs.existsSync(bootPath) ? fs.readFileSync(bootPath, 'utf-8') : '';

const nodesHash = crypto.createHash('sha256').update(nodesContent).digest('hex');
const synapsesHash = crypto.createHash('sha256').update(synapsesContent).digest('hex');
const bootHash = bootContent
  ? crypto.createHash('sha256').update(bootContent).digest('hex')
  : '';
const masterHash = crypto
  .createHash('sha256')
  .update(nodesHash + synapsesHash + bootHash)
  .digest('hex');

const nodes = JSON.parse(nodesContent);
const synapses = JSON.parse(synapsesContent);
const neuronCount = nodes.length;
const synapseCount = synapses.length;

const stateDate = new Date().toLocaleString('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).replace(',', '');

const payload = {
  lastSynced: stateDate + ' GMT+7',
  masterHash,
  neurons: neuronCount,
  synapses: synapseCount,
  verifyUrl: 'paulvisciano.github.io/memory/FINGERPRINT.md',
};

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
console.log('Updated memory/fingerprint.json');
