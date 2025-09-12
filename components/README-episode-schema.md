# Urban Runner Episode Data Schema

This document defines the standardized JSON schema for Urban Runner episodes exported from ChatGPT.

## Schema Structure

```json
{
  "episode": 15,
  "title": "Dinner Date",
  "date": "2025-09-11",
  "checkpoints": [
    {
      "id": 0,
      "episode": 15,
      "title": "Episode Cover",
      "backstory": "Episode description...",
      "image": "2025/episode-15/cover.png"
    },
    {
      "id": 1,
      "episode": 15,
      "title": "Checkpoint Title",
      "backstory": "Checkpoint backstory...",
      "image": "2025/episode-15/cp-1.png"
    }
  ]
}
```

## Field Requirements

### Root Level
- **`episode`** (number): Episode number (e.g., 15)
- **`title`** (string): Episode title (e.g., "Dinner Date")
- **`date`** (string): Date in YYYY-MM-DD format (e.g., "2025-09-11")
- **`checkpoints`** (array): Array of checkpoint objects

### Checkpoint Objects
- **`id`** (number): Sequential ID starting from 0 (0 = cover, 1+ = checkpoints)
- **`episode`** (number): Episode number (same as root episode number)
- **`title`** (string): Checkpoint title
- **`backstory`** (string): Detailed backstory text (supports markdown)
- **`image`** (string): Image path relative to moments folder (e.g., "2025/episode-15/cp-1.png") - the template will automatically add "../moments/" prefix

## Image Naming Convention
- Cover image: `cover.png`
- Checkpoint images: `cp-1.png`, `cp-2.png`, `cp-3.png`, etc.
- All images should be placed in `moments/2025/episode-{NUMBER}/` folder

## Example for ChatGPT Export

When exporting an episode from ChatGPT, use this exact structure:

```json
{
  "episode": 16,
  "title": "Your Episode Title",
  "date": "2025-09-12",
  "checkpoints": [
    {
      "id": 0,
      "episode": 16,
      "title": "Episode Cover",
      "backstory": "Your episode overview and description...",
      "image": "2025/episode-16/cover.png"
    },
    {
      "id": 1,
      "episode": 16,
      "title": "First Checkpoint",
      "backstory": "Your first checkpoint story...",
      "image": "2025/episode-16/cp-1.png"
    }
  ]
}
```

## Notes
- The cover checkpoint (id: 0) should contain the overall episode description
- Image paths must include the full relative path from the moments folder
- Backstory text supports markdown formatting for **bold** and *italic* text
- All checkpoint IDs must be sequential starting from 0
