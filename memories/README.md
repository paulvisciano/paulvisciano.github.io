# AI Memory System

A personal AI memory system that captures and stores context from AI interactions to provide better assistance over time.

## At a glance

- Purpose: Portable, versioned AI context that travels with this repo
- Scope: Does not impact runtime; lives entirely under `memories/`
- Inputs: Manual "remember" notes and automatic aggregation of `moments/moments.js`
- Outputs: JSON summaries, session records, and relationship/context docs
- Inspired by: Cursor's local memory/checkpoint model (credit below)

## Structure

```
memories/
├── README.md                          # This file
├── ai-memory.js                       # Main memory data and utilities
├── memory-utils.js                    # Helper functions for memory management
├── aggregate-moments.js               # Node script: aggregates moments → summary + session
├── remember.js                        # CLI: save portable "remember" notes into sessions
├── sessions/                          # Individual AI session records
│   ├── session-template.json          # Template for new sessions
│   ├── YYYY-MM-DD-*.json              # Actual session files (e.g., remember notes)
│   └── 2025-09-01-moments-integration.json
├── contexts/                          # Project and user context
│   ├── project-knowledge.json         # Technical project information
│   └── moments-aggregate.json         # Auto-generated summary from moments.js
└── relationships/                     # People and places data
    ├── current-people.json            # Active relationships
    └── current-places.json            # Location context
```

## Features

- **Session Tracking**: Records AI interactions with context and changes
- **Relationship Management**: Tracks people, places, and connections
- **Project Context**: Maintains technical knowledge about the website
- **Search & Query**: Find relevant past interactions
- **Export/Import**: Backup and restore memory data

## Commands

- Save a portable memory note (saved under `memories/sessions/`):
```bash
npm run remember -- "Your note to remember"
```

- Aggregate existing moments into AI memory summaries and record a session:
```bash
node memories/aggregate-moments.js
```

## Usage

### Loading the Memory System
```javascript
// In browser - load the script
<script src="memories/ai-memory.js"></script>
<script src="memories/memory-utils.js"></script>

// Access memory data
console.log(window.aiMemory.sessions);
```

### Adding a New Session
```javascript
AIMemoryUtils.captureSession({
  type: "content_update",
  summary: "Updated travel moment with new details",
  files_modified: ["moments/moments.js"],
  key_changes: ["Added new location", "Updated timeline"],
  tags: ["travel", "content"]
});
```

### Searching Memories
```javascript
// Search by keyword
const results = AIMemoryUtils.searchSessions("bangkok");

// Get recent sessions
const recent = AIMemoryUtils.getSessionsByTimeframe(30);

// Build context for AI
const context = AIMemoryUtils.buildContextSummary();
```

## Integration

This memory system is designed to:
- **Not interfere** with the main website functionality
- **Complement** the existing `moments/moments.js` data structure
- **Work alongside** the current git workflow and auto-publishing
- **Provide context** for future AI interactions

## Privacy

All memory data is stored locally in your git repository. Nothing is sent to external services beyond what's needed for AI interactions during active conversations.

## Credit & model

This project’s memory system is modeled after how Cursor stores local AI context (e.g., checkpoints with snapshots, diffs, and metadata). Credit to the Cursor team for the approach. This implementation is portable and repo-based, and can be re-done or evolved later without affecting the runtime site.
