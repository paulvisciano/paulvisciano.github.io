#!/usr/bin/env node
/**
 * Verify that memory/FINGERPRINT.md matches the memory files in a given git ref.
 * Used by pre-push hook: if the computed fingerprint doesn't match, memory was
 * tampered with or FINGERPRINT.md is stale — push is aborted.
 *
 * Usage: node verify-memory-fingerprint.js <git-ref>
 *   (run from repo root)
 * Exit: 0 if match or no memory in ref; 1 if mismatch.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ref = process.argv[2] || 'HEAD';
const repoRoot = process.cwd();

function gitShow(ref, filePath) {
  try {
    return execSync(`git show "${ref}:${filePath}"`, {
      cwd: repoRoot,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (_) {
    return null;
  }
}

function computeMasterHash(nodesContent, synapsesContent, bootMdContent) {
  const nodesHash = crypto.createHash('sha256').update(nodesContent).digest('hex');
  const synapsesHash = crypto.createHash('sha256').update(synapsesContent).digest('hex');
  const bootMdHash = bootMdContent != null
    ? crypto.createHash('sha256').update(bootMdContent).digest('hex')
    : '';
  const combined = nodesHash + synapsesHash + bootMdHash;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

function parseMasterHashFromFingerprint(content) {
  // Match the first code block after "Master Hash:" under Paul's section (so we don't grab Unified section's hash)
  const section = content.match(/## Combined Fingerprint \(Paul's Memory Only\)([\s\S]*?)(?=## |$)/);
  if (!section) return null;
  const block = section[1].match(/\*\*Master Hash:\*\*\s*```\s*\n([a-f0-9]+)\s*\n```/);
  const hash = block ? block[1].trim() : null;
  return hash && hash.length === 64 ? hash : null;
}

// Check if this ref has memory data (skip verification for branches without it)
const nodesContent = gitShow(ref, 'memory/data/nodes.json');
if (nodesContent == null) {
  process.exit(0); // no memory in this ref, nothing to verify
}

const synapsesContent = gitShow(ref, 'memory/data/synapses.json');
if (synapsesContent == null) {
  console.error('verify-memory-fingerprint: memory/data/nodes.json exists but synapses.json missing in ref', ref);
  process.exit(1);
}

const bootMdContent = gitShow(ref, 'memory/BOOT.md');
const fingerprintContent = gitShow(ref, 'memory/FINGERPRINT.md');
if (fingerprintContent == null) {
  console.error('verify-memory-fingerprint: memory/FINGERPRINT.md missing in ref', ref);
  console.error('Run memory sync and commit, then push.');
  process.exit(1);
}

const computedMaster = computeMasterHash(nodesContent, synapsesContent, bootMdContent);
const recordedMaster = parseMasterHashFromFingerprint(fingerprintContent);
if (recordedMaster == null) {
  console.error('verify-memory-fingerprint: could not parse Master Hash from memory/FINGERPRINT.md (need 64-char SHA-256).');
  console.error('Run memory sync, commit memory/data/ and memory/FINGERPRINT.md, then push.');
  process.exit(1);
}

if (computedMaster !== recordedMaster) {
  console.error('');
  console.error('🔒 Memory fingerprint mismatch (ref: ' + ref + ')');
  console.error('   Computed from memory files: ' + computedMaster);
  console.error('   Recorded in FINGERPRINT.md: ' + recordedMaster);
  console.error('');
  console.error('   Memory may have been tampered with, or FINGERPRINT.md is out of date.');
  console.error('   Run memory sync, commit memory/data/ and memory/FINGERPRINT.md, then push.');
  console.error('');
  process.exit(1);
}

process.exit(0);
