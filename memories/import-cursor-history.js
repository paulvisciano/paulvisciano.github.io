#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const HISTORY_DIR = path.join(process.env.HOME || process.env.USERPROFILE, 'Library', 'Application Support', 'Cursor', 'User', 'History');
const OUT_DIR = path.join(process.cwd(), 'memories', 'sessions');

const TEXT_EXTS = new Set(['.json', '.md', '.txt', '.log']);
const MAX_SNIPPET = 4000; // chars

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXTS.has(ext);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    try {
      if (e.isDirectory()) {
        files.push(...walk(full));
      } else if (e.isFile()) {
        files.push(full);
      }
    } catch (_) {}
  }
  return files;
}

function summarizeHistory() {
  if (!fs.existsSync(HISTORY_DIR)) {
    throw new Error(`Cursor history not found at ${HISTORY_DIR}`);
  }
  const files = walk(HISTORY_DIR);

  const items = files.map(fp => {
    const st = fs.statSync(fp);
    const record = {
      path: path.relative(HISTORY_DIR, fp), // relative to history dir, not absolute
      size: st.size,
      modified: st.mtime.toISOString(),
      ext: path.extname(fp).toLowerCase()
    };
    if (isTextFile(fp) && st.size > 0 && st.size < 5 * 1024 * 1024) {
      try {
        const content = fs.readFileSync(fp, 'utf8');
        record.snippet = content.slice(0, MAX_SNIPPET);
      } catch (_) {}
    }
    return record;
  });

  items.sort((a,b) => new Date(b.modified) - new Date(a.modified));

  const byMonth = {};
  for (const it of items) {
    const d = new Date(it.modified);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;
    if (!byMonth[key]) byMonth[key] = { count: 0, totalBytes: 0, files: [] };
    byMonth[key].count += 1;
    byMonth[key].totalBytes += it.size;
    // keep only top 50 recent per month with snippets for portability
    if (byMonth[key].files.length < 50) byMonth[key].files.push(it);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    source: "Cursor/User/History", // generic path, not user-specific
    totals: {
      files: items.length,
      bytes: items.reduce((s, i) => s + i.size, 0)
    },
    months: byMonth
  };
  return { items, summary };
}

function main() {
  const { summary } = summarizeHistory();
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const outPath = path.join(OUT_DIR, `${new Date().toISOString().slice(0,10)}-cursor-history-summary.json`);
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));

  const sessionPath = path.join(OUT_DIR, `${new Date().toISOString().slice(0,10)}-cursor-history-import.json`);
  const months = Object.keys(summary.months).length;
  const session = {
    id: path.basename(sessionPath, '.json'),
    timestamp: new Date().toISOString(),
    type: 'cursor_history_import',
    summary: `Imported Cursor history: ${summary.totals.files} files across ${months} months`,
    files_modified: [ path.relative(process.cwd(), outPath) ],
    context: { source: summary.source, months, totals: summary.totals },
    tags: ['cursor', 'history', 'import']
  };
  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));

  console.log('Wrote summary:', outPath);
  console.log('Wrote session:', sessionPath);
}

main();
