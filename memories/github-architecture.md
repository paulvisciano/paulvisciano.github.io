# GitHub-Centric AI Memory Architecture

## Overview
Use GitHub as the backbone for all AI context, creating a scalable, portable memory system across multiple projects.

## Repository Structure

```
paulvisciano/
├── ai-memory/                    # 🧠 Overarching AI context repo
│   ├── global-context.json       # Cross-project knowledge
│   ├── user-preferences.json     # Your patterns, style, preferences  
│   ├── relationships.json        # People, places, connections
│   ├── project-index.json        # Links to all project repos
│   ├── schemas/                  # Standardized memory formats
│   └── README.md                 # Architecture documentation
├── paulvisciano.github.io/       # 🌍 Travel website (current)
├── urban-runner/                 # 🏃‍♂️ New project repo
├── other-project/                # 🚀 Future projects
└── project-template/              # 📋 Standardized project structure
```

## Memory Schemas

### Global Context (`global-context.json`)
```json
{
  "user_profile": {
    "name": "Paul",
    "travel_style": "digital nomad",
    "coding_preferences": ["React", "JavaScript", "git workflow automation"],
    "communication_style": "direct, enthusiastic about experiences"
  },
  "cross_project_patterns": {
    "architecture_preferences": ["React", "JavaScript", "git hooks"],
    "workflow_patterns": ["commit hooks", "auto-publishing", "detailed documentation"],
    "learning_patterns": ["hands-on", "community-driven", "iterative improvement"]
  }
}
```

### Project Index (`project-index.json`)
```json
{
  "projects": [
    {
      "name": "paulvisciano.github.io",
      "repo": "paulvisciano/paulvisciano.github.io",
      "type": "personal-website",
      "tech_stack": ["React", "D3.js", "Globe.GL"],
      "memory_path": "memories/",
      "last_updated": "2025-01-01T00:00:00Z"
    },
    {
      "name": "urban-runner",
      "repo": "paulvisciano/urban-runner", 
      "type": "mobile-app",
      "tech_stack": ["React Native", "Node.js"],
      "memory_path": "memories/",
      "last_updated": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Project Memory Schema (`schemas/project-memory.json`)
```json
{
  "project_info": {
    "name": "string",
    "description": "string",
    "tech_stack": ["string"],
    "architecture_decisions": ["string"],
    "key_learnings": ["string"]
  },
  "development_context": {
    "current_focus": "string",
    "recent_changes": ["string"],
    "challenges": ["string"],
    "solutions": ["string"]
  },
  "ai_context": {
    "conversation_summaries": ["string"],
    "decision_rationale": ["string"],
    "future_plans": ["string"]
  }
}
```

## Integration Patterns

### 1. Global Context Loading
Each project loads global context on startup:
```javascript
// In each project's memory system
async function loadGlobalContext() {
  const globalContext = await fetch('https://raw.githubusercontent.com/paulvisciano/ai-memory/main/global-context.json');
  return globalContext.json();
}
```

### 2. Project Memory Updates
Projects update their memory and sync to GitHub:
```javascript
// After significant changes
function updateProjectMemory(update) {
  const memory = loadProjectMemory();
  memory.development_context.recent_changes.push(update);
  memory.last_updated = new Date().toISOString();
  
  // Commit and push to GitHub
  gitCommitAndPush('Update AI memory', memory);
}
```

### 3. Cross-Project Learning
Global context learns from all projects:
```javascript
// In ai-memory repo
function aggregateProjectLearnings() {
  const projects = loadProjectIndex();
  const learnings = [];
  
  projects.forEach(project => {
    const projectMemory = fetchProjectMemory(project.repo);
    learnings.push(...projectMemory.key_learnings);
  });
  
  return learnings;
}
```

## Setup Steps

### Phase 1: Create ai-memory Repository
1. Create new GitHub repo: `paulvisciano/ai-memory`
2. Set up standardized schemas and global context
3. Configure project index

### Phase 2: Update Current Project
1. Refactor `memories/` to follow new schema
2. Add global context loading
3. Update memory update patterns

### Phase 3: Create Urban Runner Project
1. Create new repo with standardized memory structure
2. Integrate with global AI memory system
3. Test cross-project context sharing

## Benefits

✅ **Single source of truth** - GitHub handles versioning, sync, access
✅ **Project isolation** - Each project has its own memory context  
✅ **Cross-project learning** - AI can see patterns across all your work
✅ **Portable** - Works on any machine, any IDE
✅ **Collaborative** - Others can contribute to your AI context
✅ **Standardized** - Same memory structure across all projects
✅ **Scalable** - Easy to add new projects and contexts

## Next Steps

1. Create the `ai-memory` repository
2. Set up standardized schemas
3. Refactor current project to use new architecture
4. Create Urban Runner project with integrated memory
5. Test cross-project context sharing
