# Commit message style (OpenClaw-readable)

**Purpose:** Write commit messages so OpenClaw (and humans) can read `git log` and understand what changed and why without opening every file.

---

## Format

```
<Subject line: imperative, ~50 chars, no period>

FOR OPENCLAW: <One sentence: what this commit does and why it matters.>

WHAT CHANGED
- <Bullet: file or area and what changed.>
- <Repeat as needed.>

WHERE / HOW TO USE
- <Optional: paths, commands, or links that matter.>
```

- **Subject:** Start with a verb (Add, Fix, Archive, Convert). No "Fixed" or "Updates" — use present imperative.
- **FOR OPENCLAW:** Always include. One clear sentence so an agent reading the log knows the gist.
- **WHAT CHANGED:** Bullet list of concrete changes (paths, feature names, not "updated stuff").
- **WHERE / HOW TO USE:** Only if relevant (e.g. "To archive plans: see .cursor/plans/PLAN-ARCHIVING-STRATEGY.md").

---

## Examples

### Example 1: Feature + docs

```
Add plan archiving strategy and archive executed plans

FOR OPENCLAW: We now archive completed plans under .cursor/plans/archive/
so the active plans folder stays focused; strategy doc explains when and how.

WHAT CHANGED
- .cursor/plans/PLAN-ARCHIVING-STRATEGY.md — when a plan is "executed",
  where to move it (archive/), optional frontmatter (status, archived_at).
- .cursor/plans/archive/README.md — explains archive folder.
- today-filter-fix.plan.md moved to archive/ — plan executed (Today +
  Temporal filters, setActiveFilter); todos completed, outcome noted.

WHERE / HOW TO USE
- To archive more plans: follow PLAN-ARCHIVING-STRATEGY.md.
- Re-open: move file from archive/ back to .cursor/plans/.
```

### Example 2: Bug fix

```
Fix Today and Temporal filters in memory visualization

FOR OPENCLAW: The "Today" filter now shows only nodes with
temporal_activations for today; "Temporal" filter and bar/drawer sync added.

WHAT CHANGED
- memory/index.html — nodes get isToday from temporal_activations (date
  match); Today filter uses it; new Temporal filter (type === 'temporal');
  setActiveFilter() keeps desktop bar and mobile drawer in sync.
- Filter buttons: Temporal added to bar and drawer; all filter clicks
  go through setActiveFilter().
```

### Example 3: Data / config only

```
Unify neural graph on nodes.json + synapses.json

FOR OPENCLAW: Canonical graph is now memory/data/nodes.json and
synapses.json only; -100pct files removed; archive holds previous set.

WHAT CHANGED
- memory/data/nodes.json, synapses.json — canonical live graph.
- memory/data/archive/ — previous nodes/synapses kept for reference.
- memory/data/nodes-100pct.json, synapses-100pct.json — removed.
- memory/index.html, memory/test.html, neural-mind/index.html,
  claw/memory/index.html, claw/memory/MEMORY.md — all load nodes.json
  and synapses.json (no -100pct).
```

---

## Rules of thumb

- **One logical change per commit** — easier to describe and to revert.
- **Paths and names** — Include file or directory paths and feature names so OpenClaw can jump to the right place.
- **No vague lines** — Avoid "Various fixes" or "Update docs"; say what files and what changed.
- **FOR OPENCLAW first** — If the body is short, at least keep the FOR OPENCLAW line after the subject.

Use this style for all commits in this repo so git log stays readable by both humans and OpenClaw.
