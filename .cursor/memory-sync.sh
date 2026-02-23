#!/bin/bash
# Memory Sync — Narrative + journal + OpenClaw + raw (transcripts, voice-notes, moments) → nodes/synapses
# Usage: ./memory-sync.sh [YYYY-MM-DD] [--dry-run]
# Runs 100% locally (Bash + Node.js, no API calls, no token usage).
# Sources (all for the given date):
#   - Narrative: moments/bangkok or claw/moments/Bangkok (narrative.md / WORKING-narrative.md)
#   - Journal: claw/memory, claw/thoughts
#   - OpenClaw memory: ~/.openclaw/workspace/memory (if present)
#   - Raw: memory/raw/YYYY-MM-DD/*.md (transcript.md, voice-notes.md, moment .md files)
# Extracts entity mentions, updates nodes.json and synapses.json (live site data).

set -e

REPO="/Users/paulvisciano/Personal/paulvisciano.github.io"
MEMORY_DIR="$REPO/memory"
DATA_DIR="$MEMORY_DIR/data"
RAW_BASE="$MEMORY_DIR/raw"
OPENCLAW_MEMORY="${HOME}/.openclaw/workspace/memory"
DATE="${1:-$(date +%Y-%m-%d)}"
DRY_RUN=""
[[ "${2:-}" == "--dry-run" ]] && DRY_RUN="1"

# Validate date (macOS)
if ! date -j -f "%Y-%m-%d" "$DATE" >/dev/null 2>&1; then
    echo "❌ Invalid date: $DATE"
    exit 1
fi

echo "🧠 Memory Sync for $DATE"
echo "======================="

# 1. Find narrative (try multiple paths)
NARRATIVE_FILE=""
for path in \
    "$REPO/moments/bangkok/$DATE/narrative.md" \
    "$REPO/moments/bangkok/$DATE/WORKING-narrative.md" \
    "$REPO/claw/moments/Bangkok/$DATE/narrative.md" \
    "$REPO/claw/moments/Bangkok/$DATE/WORKING-narrative.md"; do
    if [ -f "$path" ]; then
        NARRATIVE_FILE="$path"
        break
    fi
done

if [ -n "$NARRATIVE_FILE" ]; then
    echo "📖 Narrative: $NARRATIVE_FILE"
else
    echo "📖 Narrative: (none for this date — will use journal + raw only)"
fi

# 2. Gather journal entries for this date (repo + OpenClaw if present)
JOURNAL_FILES=()
[ -f "$REPO/claw/memory/$DATE.md" ] && JOURNAL_FILES+=("$REPO/claw/memory/$DATE.md")
for f in "$REPO/claw/memory/$DATE"-*.md; do
    [ -f "$f" ] && JOURNAL_FILES+=("$f")
done
for f in "$REPO/claw/thoughts/$DATE"-*.md; do
    [ -f "$f" ] && JOURNAL_FILES+=("$f")
done
if [ -d "$OPENCLAW_MEMORY" ]; then
    [ -f "$OPENCLAW_MEMORY/$DATE.md" ] && JOURNAL_FILES+=("$OPENCLAW_MEMORY/$DATE.md")
    for f in "$OPENCLAW_MEMORY/$DATE"-*.md; do
        [ -f "$f" ] && JOURNAL_FILES+=("$f")
    done
fi
# Raw: transcripts, voice-notes, moment .md files for this date
if [ -d "$RAW_BASE/$DATE" ]; then
    for f in "$RAW_BASE/$DATE"/*.md; do
        [ -f "$f" ] && JOURNAL_FILES+=("$f")
    done
fi
if [ ${#JOURNAL_FILES[@]} -gt 0 ]; then
    echo "📓 Journal + OpenClaw + Raw: ${#JOURNAL_FILES[@]} file(s)"
    for f in "${JOURNAL_FILES[@]}"; do
        if [[ "$f" == "$OPENCLAW_MEMORY"* ]]; then
            echo "   └ OpenClaw: $(basename "$f")"
        elif [[ "$f" == "$RAW_BASE"* ]]; then
            echo "   └ Raw: $(basename "$f")"
        else
            echo "   └ Repo: $(basename "$f")"
        fi
    done
fi

# 3. Backup existing data (skip in dry-run)
if [ -z "$DRY_RUN" ]; then
if [ ! -f "$DATA_DIR/nodes.json" ] || [ ! -f "$DATA_DIR/synapses.json" ]; then
    echo "❌ Missing $DATA_DIR/nodes.json or synapses.json"
    exit 1
fi
cp "$DATA_DIR/nodes.json" "$DATA_DIR/nodes.json.bak"
cp "$DATA_DIR/synapses.json" "$DATA_DIR/synapses.json.bak"
echo "💾 Backed up nodes.json and synapses.json"
fi

# 4. Run extraction (Node.js) — uses sync-manifest to track source and integration status
node - "$NARRATIVE_FILE" "$DATE" "$DATA_DIR" "$(printf '%s\n' "${JOURNAL_FILES[@]}" | tr '\n' '|')" "$DRY_RUN" << 'NODEJS_SCRIPT'
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const narrativePath = process.argv[2] || '';
const date = process.argv[3];
const dataDir = process.argv[4];
const journalPathsStr = process.argv[5] || '';
const dryRun = process.argv[6] === '1';
const journalPaths = journalPathsStr ? journalPathsStr.split('|').filter(Boolean) : [];

const manifestPath = path.join(dataDir, 'sync-manifest.json');
let manifest = { version: 1, by_date: {}, updated_at: null };
if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    if (!manifest.by_date) manifest.by_date = {};
  } catch (_) {}
}
if (!manifest.by_date[date]) manifest.by_date[date] = { sources: [] };

function sourceType(p) {
  if (p.includes('.openclaw' + path.sep + 'workspace' + path.sep + 'memory')) return 'openclaw';
  const raw = path.sep + 'raw' + path.sep;
  if (p.includes(raw)) {
    const base = path.basename(p);
    if (base === 'transcript.md') return 'raw-transcript';
    if (base === 'voice-notes.md') return 'raw-voice-notes';
    return 'raw-moment';
  }
  return 'journal';
}
function isIntegrated(entry, mtime) {
  return entry && entry.integrated === true && entry.mtime === mtime;
}
function findEntry(sources, p) {
  return (manifest.by_date[date].sources || []).find(s => s.path === p);
}

// Build list of all current sources with mtime; determine which are not yet integrated
const allSources = [];
if (narrativePath && fs.existsSync(narrativePath)) {
  try {
    const mtime = fs.statSync(narrativePath).mtimeMs;
    allSources.push({ path: narrativePath, mtime, type: 'narrative', label: path.basename(narrativePath) });
  } catch (_) {}
}
journalPaths.forEach(p => {
  if (!fs.existsSync(p)) return;
  try {
    mtime = fs.statSync(p).mtimeMs;
    const st = sourceType(p);
const labelSuffix = st === 'openclaw' ? ' (OpenClaw)' : (st.startsWith('raw-') ? ' (raw)' : '');
allSources.push({ path: p, mtime, type: st, label: path.basename(p) + labelSuffix });
  } catch (_) {}
});

const toProcess = allSources.filter(s => !isIntegrated(findEntry(manifest.by_date[date].sources, s.path), s.mtime));
const alreadyIntegrated = allSources.filter(s => isIntegrated(findEntry(manifest.by_date[date].sources, s.path), s.mtime));

if (alreadyIntegrated.length) {
  console.log('✅ Already integrated:', alreadyIntegrated.map(s => s.label).join(', '));
}
if (toProcess.length === 0) {
  console.log('📋 All sources for this date are fully integrated. Nothing to do.');
  if (!dryRun) {
    manifest.updated_at = new Date().toISOString();
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }
  process.exit(2); // nothing to integrate
}
console.log('📥 To integrate (' + toProcess.length + '):', toProcess.map(s => s.label).join(', '));

// Load only content from sources we're integrating; compute content hash per file
let narrative = '';
toProcess.forEach(s => {
  const content = fs.readFileSync(s.path, 'utf-8');
  s.content_hash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  narrative += content + '\n\n---\n\n';
});

// Load graph
const nodes = JSON.parse(fs.readFileSync(path.join(dataDir, 'nodes.json'), 'utf-8'));
const synapses = JSON.parse(fs.readFileSync(path.join(dataDir, 'synapses.json'), 'utf-8'));

// Backfill manifest from existing temporal_activation for this date (avoids re-applying)
const paulNodeForBackfill = nodes.find(n => n.id === 'paul');
const existingSync = paulNodeForBackfill && (paulNodeForBackfill.temporal_activations || []).find(t => t.moment === `memory-sync-${date}`);
if (existingSync && manifest.by_date[date].sources.length === 0 && allSources.length > 0) {
  const integratedAt = existingSync.timestamp || new Date().toISOString();
  // Only backfill sources that were in the pre-manifest sync (narrative + repo journal), not openclaw or raw
  allSources.filter(s => s.type !== 'openclaw' && !s.type.startsWith('raw-')).forEach(s => {
    manifest.by_date[date].sources.push({
      path: s.path,
      type: s.type,
      label: s.label,
      mtime: s.mtime,
      integrated: true,
      integrated_at: integratedAt
    });
  });
  manifest.updated_at = integratedAt;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('📋 Backfilled manifest from existing sync for', date + '; repo sources marked integrated. OpenClaw and raw (transcripts/voice-notes/moments) will integrate on next run.');
  process.exit(2);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function patternForNode(node) {
  const idPattern = escapeRe(node.id).replace(/-/g, '[-\\s]+');
  return new RegExp('\\b' + idPattern + '\\b', 'gi');
}

const mentions = {};
const mentionedIds = new Set();
nodes.forEach(node => {
  const re = patternForNode(node);
  const m = narrative.match(re);
  const count = m ? m.length : 0;
  if (count > 0) {
    mentions[node.id] = Math.min(count, 50);
    mentionedIds.add(node.id);
  }
});

const sourceLabels = toProcess.map(s => s.label);
console.log('📝 Entities mentioned:', [...mentionedIds].sort().join(', ') || '(none)');
console.log('📂 Sources for this run:', sourceLabels.join(', '));

const syncMoment = `memory-sync-${date}`;
const now = new Date().toISOString();
const paulNode = nodes.find(n => n.id === 'paul');
const paulAlreadySynced = paulNode && (paulNode.temporal_activations || []).some(t => t.moment === syncMoment);
const sourcesForActivation = toProcess.map(s => ({ type: s.type, path: s.path, label: s.label, integrated_at: now }));

if (paulNode && mentionedIds.size > 0) {
  if (!paulNode.temporal_activations) paulNode.temporal_activations = [];
  const existing = paulNode.temporal_activations.find(t => t.moment === syncMoment);
  if (!existing) {
    paulNode.temporal_activations.push({
      moment: syncMoment,
      timestamp: now,
      duration_minutes: 0,
      thinking_patterns: ['memory-sync', 'narrative-integration', 'journal-integration'],
      reason: `Synced from ${date}: ${mentionedIds.size} entities`,
      sources: sourcesForActivation
    });
  } else {
    if (!existing.sources) existing.sources = [];
    sourcesForActivation.forEach(s => {
      if (!existing.sources.some(x => x.path === s.path)) existing.sources.push(s);
    });
  }
}

const bangkokNode = nodes.find(n => n.id === 'bangkok');
const bangkokAlreadySynced = bangkokNode && (bangkokNode.temporal_activations || []).some(t => t.moment === syncMoment);
if (bangkokNode && mentionedIds.has('bangkok')) {
  if (!bangkokNode.temporal_activations) bangkokNode.temporal_activations = [];
  const existingB = bangkokNode.temporal_activations.find(t => t.moment === syncMoment);
  if (!existingB) {
    bangkokNode.temporal_activations.push({
      moment: syncMoment,
      timestamp: now,
      activity: 'Narrative + journal sync',
      context: `Day narrative and journal entries integrated for ${date}`,
      sources: sourcesForActivation
    });
  } else {
    if (!existingB.sources) existingB.sources = [];
    sourcesForActivation.forEach(s => {
      if (!existingB.sources.some(x => x.path === s.path)) existingB.sources.push(s);
    });
  }
}

Object.entries(mentions).forEach(([id, count]) => {
  const node = nodes.find(n => n.id === id);
  if (node && count > 0) node.frequency = (node.frequency || 0) + count;
});

const bump = 0.01, cap = 0.99, round = (w) => Math.round(w * 100) / 100;
mentionedIds.forEach(id => {
  if (id === 'paul') return;
  let s = synapses.find(x => x.source === 'paul' && x.target === id);
  if (s) s.weight = round(Math.min((s.weight || 0.5) + bump, cap));
  else synapses.push({ source: 'paul', target: id, weight: round(0.5 + bump), type: 'memory-sync', label: `synced ${date}` });
});
const mentionedList = [...mentionedIds];
for (let i = 0; i < mentionedList.length; i++) {
  for (let j = i + 1; j < mentionedList.length; j++) {
    const a = mentionedList[i], b = mentionedList[j];
    let s = synapses.find(x => (x.source === a && x.target === b) || (x.source === b && x.target === a));
    if (s) s.weight = round(Math.min((s.weight || 0.5) + bump * 0.5, cap));
  }
}

if (dryRun) {
  console.log('🔍 [DRY RUN] Would update', mentionedIds.size, 'entities; would mark', toProcess.length, 'source(s) integrated');
  console.log('🔍 [DRY RUN] No files written.');
} else {
  fs.writeFileSync(path.join(dataDir, 'nodes.json'), JSON.stringify(nodes, null, 2));
  fs.writeFileSync(path.join(dataDir, 'synapses.json'), JSON.stringify(synapses, null, 2));
  const rawPrefix = path.sep + 'raw' + path.sep;
  toProcess.forEach(s => {
    let integratedPath = s.path;
    if (s.path.includes(rawPrefix) && fs.existsSync(s.path)) {
      const dir = path.dirname(s.path);
      const base = path.basename(s.path);
      const integratedDir = path.join(dir, 'integrated');
      const dest = path.join(integratedDir, base);
      try {
        fs.mkdirSync(integratedDir, { recursive: true });
        fs.renameSync(s.path, dest);
        integratedPath = dest;
        console.log('   📁 Moved to integrated:', base);
      } catch (err) {
        console.warn('   ⚠ Could not move', base, err.message);
      }
    }
    const record = { path: integratedPath, type: s.type, label: s.label, mtime: s.mtime, integrated: true, integrated_at: now, content_hash: s.content_hash || null };
    const existing = manifest.by_date[date].sources.find(x => x.path === s.path || x.path === integratedPath);
    if (existing) Object.assign(existing, record);
    else manifest.by_date[date].sources.push(record);
  });
  manifest.updated_at = now;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Updated', mentionedIds.size, 'entities; synapses adjusted');
  console.log('✅ Marked integrated:', toProcess.map(s => s.label).join(', '));
  if (toProcess.some(s => s.path.includes(rawPrefix))) console.log('✅ Raw files moved to raw/YYYY-MM-DD/integrated/');
  console.log('✅ Saved: nodes.json, synapses.json, sync-manifest.json');
}
NODEJS_SCRIPT
NODE_EXIT=$?
if [ "$NODE_EXIT" = "2" ]; then
    echo ""
    echo "📋 No new sources to integrate. Sync manifest unchanged."
    exit 0
fi
if [ "$NODE_EXIT" -ne 0 ]; then
    exit "$NODE_EXIT"
fi

# 5. Verify (skip message in dry-run)
if [ -n "$DRY_RUN" ]; then
    echo ""
    echo "🔍 Dry run complete — no changes written. Run without --dry-run to apply."
elif [ -f "$DATA_DIR/nodes.json" ]; then
    echo ""
    echo "✅ Sync complete"
    echo "Next: Review changes, then commit:"
    echo "  cd $REPO && git add memory/data/ && git commit -m 'memory: $DATE - synced narrative + journal (see sync-manifest.json)'"
else
    echo "❌ Failed to write data"
    exit 1
fi
