# AI Memory System

A personal AI memory system that captures and stores context from AI interactions to provide better assistance over time.

## Structure

```
memories/
├── ai-memory.js              # Main memory data and utilities
├── memory-utils.js           # Helper functions for memory management
├── README.md                 # This file
├── sessions/                 # Individual AI session records
│   ├── session-template.json # Template for new sessions
│   └── YYYY-MM-DD-*.json    # Actual session files
├── contexts/                 # Project and user context
│   └── project-knowledge.json # Technical project information
└── relationships/            # People and places data
    ├── current-people.json   # Active relationships
    └── current-places.json   # Location context
```

## Features

- **Session Tracking**: Records AI interactions with context and changes
- **Relationship Management**: Tracks people, places, and connections
- **Project Context**: Maintains technical knowledge about the website
- **Search & Query**: Find relevant past interactions
- **Export/Import**: Backup and restore memory data

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
