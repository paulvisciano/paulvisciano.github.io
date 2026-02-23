# Strategy: Archiving Executed Plans

**Purpose:** Keep `.cursor/plans/` focused on active work by moving completed plans into an archive. Preserve history and context without clutter.

---

## When is a plan "executed"?

A plan is ready to archive when **one** of the following is true:

1. **All todos done** — Every todo in the plan’s frontmatter is `status: completed` (or equivalent), and you’ve verified the outcome.
2. **Shipped** — The feature/fix is live, merged, or released; no open work remains.
3. **Superseded** — The plan is replaced by another (e.g. a new plan or a different approach); the old one is only reference.
4. **Cancelled / won’t do** — You’ve decided not to execute it; archiving keeps a record without treating it as active.

**Optional:** Before archiving, set all relevant todos to `completed` and add a short **Outcome** section at the top of the plan (e.g. “Done 2026-02-23; Today filter works in memory/ and claw/memory/.”).

---

## Where do archived plans live?

```
.cursor/plans/
├── PLAN-ARCHIVING-STRATEGY.md   ← this doc
├── archive/                     ← executed plans go here
│   ├── README.md                ← explains the folder
│   ├── 2026/                    ← optional: by year
│   │   ├── 02/                  ← optional: by month
│   │   │   ├── today-filter-fix.plan.md
│   │   │   └── whatsapp-transcript-extraction.plan.md
│   │   └── ...
│   └── today-filter-fix.plan.md ← or flat: all in archive/
├── memory-crawler.plan.md       ← active plans stay here
├── moment-neuron-linking.plan.md
└── ...
```

**Recommended:** Start **flat** (all archived plans directly in `archive/`). Add `archive/YYYY/` or `archive/YYYY/MM/` later if the list grows and you want to browse by date.

---

## How to archive (steps)

1. **Confirm the plan is executed** (all todos done, shipped, superseded, or cancelled).
2. **Optionally update the plan:**
   - Set todos to `status: completed` where appropriate.
   - Add frontmatter: `status: archived` and `archived_at: YYYY-MM-DD`.
   - Add a one-line **Outcome** or **Archived** note at the top of the body (e.g. “Archived 2026-02-23. Today filter fixed in memory/index.html and claw/memory/index.html.”).
3. **Move the file** into `archive/` (or `archive/YYYY/MM/` if you use date subfolders):
   ```bash
   mv .cursor/plans/today-filter-fix.plan.md .cursor/plans/archive/
   ```
4. **Commit** with a clear message:
   ```bash
   git add .cursor/plans/
   git commit -m "Archive executed plan: today-filter-fix (Today filter shipped)"
   ```

**Re-opening a plan:** Move the file back from `archive/` to `.cursor/plans/`, update frontmatter (e.g. `status: active`), and commit.

---

## Frontmatter for archived plans (optional)

You can add or adjust YAML so archived plans are easy to filter and search:

```yaml
---
name: Today Filter Fix (Neural Visualization)
overview: ...
todos: [ ... ]
isProject: false
status: archived              # optional
archived_at: "2026-02-23"     # optional
executed_commit: "abc1234"    # optional: commit where work landed
---
```

- **status: archived** — Distinguishes from active plans if you ever list them together.
- **archived_at** — When you moved it to the archive.
- **executed_commit** — Git commit (or tag) that delivered the work; helps trace from plan → code.

---

## Finding and reusing archived plans

- **Browse:** Open `.cursor/plans/archive/` (and subfolders if you use them).
- **Search:** `grep -r "Today filter" .cursor/plans/archive/` or use Cursor/IDE search under `plans/archive`.
- **Git history:** Old locations and renames are in history; `git log --follow -- .cursor/plans/archive/today-filter-fix.plan.md` shows when it was archived and where it lived before.
- **Re-open:** Move back to `.cursor/plans/`, fix frontmatter, and continue or adapt.

---

## Checklist (quick reference)

- [ ] Plan is executed (todos done / shipped / superseded / cancelled).
- [ ] Optionally: todos → completed, add `status: archived`, `archived_at`, Outcome note.
- [ ] Move file to `.cursor/plans/archive/` (or `archive/YYYY/MM/`).
- [ ] Commit with message like: `Archive executed plan: <name> (<short reason>)`.

---

## Notes

- **SESSION-SUMMARY** and similar **reference docs** (no actionable todos) can stay in `.cursor/plans/` or move to `archive/` if you prefer to treat “read-only” docs as archived.
- **Large / evergreen plans** (e.g. memory-crawler, GIT-BRANCHING) may stay active until you explicitly mark them “done” or “parked”; then archive when you no longer work from them.
- Archiving is **manual** by design: you decide when something is truly executed and when to move it.
