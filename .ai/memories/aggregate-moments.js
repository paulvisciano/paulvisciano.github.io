#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadMoments(momentsPath) {
  const code = fs.readFileSync(momentsPath, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  // Execute the moments code to populate sandbox.window.momentsInTime
  vm.runInContext(code, sandbox, { filename: 'moments.js' });
  if (!sandbox.window || !Array.isArray(sandbox.window.momentsInTime)) {
    throw new Error('momentsInTime not found in sandboxed context');
  }
  return sandbox.window.momentsInTime;
}

function summarizeMoments(moments) {
  const byYear = {};
  const byTag = {};
  const byLocation = {};

  for (const m of moments) {
    const year = new Date(m.date).getUTCFullYear();
    byYear[year] = byYear[year] || { count: 0, totalStayDays: 0, ids: [] };
    byYear[year].count += 1;
    byYear[year].totalStayDays += Number(m.stayDuration || 0);
    byYear[year].ids.push(m.id);

    for (const tag of m.tags || []) {
      byTag[tag] = byTag[tag] || { count: 0, totalStayDays: 0, ids: [] };
      byTag[tag].count += 1;
      byTag[tag].totalStayDays += Number(m.stayDuration || 0);
      byTag[tag].ids.push(m.id);
    }

    const locName = m.location?.name || 'Unknown';
    byLocation[locName] = byLocation[locName] || { count: 0, totalStayDays: 0, coords: m.location, ids: [] };
    byLocation[locName].count += 1;
    byLocation[locName].totalStayDays += Number(m.stayDuration || 0);
    byLocation[locName].ids.push(m.id);
  }

  // Top tags and locations by totalStayDays
  const topTags = Object.entries(byTag)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.totalStayDays - a.totalStayDays)
    .slice(0, 20);

  const topLocations = Object.entries(byLocation)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.totalStayDays - a.totalStayDays)
    .slice(0, 20);

  // Recent 10 moments
  const recent = [...moments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
    .map(m => ({ id: m.id, title: m.title, date: m.date, location: m.location?.name, stayDuration: m.stayDuration, tags: m.tags }));

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      momentsCount: moments.length,
      totalStayDays: moments.reduce((sum, m) => sum + Number(m.stayDuration || 0), 0)
    },
    byYear,
    topTags,
    topLocations,
    recent,
  };
}

function main() {
  const projectRoot = process.cwd();
  const momentsPath = path.join(projectRoot, 'moments', 'moments.js');
  const outDir = path.join(projectRoot, 'memories', 'contexts');
  const outPath = path.join(outDir, 'moments-aggregate.json');

  const sessionsDir = path.join(projectRoot, 'memories', 'sessions');
  const sessionPath = path.join(sessionsDir, `${new Date().toISOString().slice(0,10)}-moments-integration.json`);

  const moments = loadMoments(momentsPath);
  const summary = summarizeMoments(moments);

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));

  const sessionRecord = {
    id: `${new Date().toISOString().slice(0,10)}-moments-integration`,
    timestamp: new Date().toISOString(),
    type: 'moments_integration',
    summary: 'Integrated moments into AI memory summary',
    files_modified: ['memories/contexts/moments-aggregate.json'],
    key_changes: ['Parsed moments/moments.js', 'Generated aggregated summaries by year/tag/location', 'Recorded recent moments'],
    context: { source: 'moments/moments.js' },
    tags: ['integration', 'moments', 'summary']
  };
  if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });
  fs.writeFileSync(sessionPath, JSON.stringify(sessionRecord, null, 2));

  console.log('Wrote:', outPath);
  console.log('Wrote session:', sessionPath);
}

main();
