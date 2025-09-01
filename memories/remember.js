#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const note = process.argv.slice(2).join(' ').trim();
  if (!note) {
    console.error('Usage: npm run remember -- "your note here"');
    process.exit(1);
  }
  const now = new Date();
  const date = now.toISOString().slice(0,10);
  const timestamp = now.toISOString();

  const sessionsDir = path.join(process.cwd(), 'memories', 'sessions');
  ensureDir(sessionsDir);

  const id = `${date}-remember-${Math.random().toString(36).slice(2,8)}`;
  const record = {
    id,
    timestamp,
    type: 'remember_note',
    summary: note.slice(0, 120),
    note,
    tags: ['remember', 'portable-memory']
  };

  const filename = path.join(sessionsDir, `${id}.json`);
  fs.writeFileSync(filename, JSON.stringify(record, null, 2));
  console.log('Saved memory:', filename);
}

main();
