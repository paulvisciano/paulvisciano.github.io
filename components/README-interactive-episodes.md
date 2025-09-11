# Interactive Episode Architecture

This document describes the new architecture for interactive card-style episodes in the blog.

## Overview

Interactive episodes use a Tinder-like card interface where users can swipe between cards, with each card flipping to reveal backstory content. This provides a more engaging, mobile-friendly experience compared to traditional blog posts.

## Architecture Components

### 1. Reusable Interactive Episode File
- **File**: `components/interactive-episode.html`
- **Purpose**: Single HTML file that works for all interactive episodes
- **Features**: 
  - Dynamically loads episode data via URL parameter
  - Card wrapper with uniform dimensions
  - Enhanced navigation with swipe instructions
  - Progress bar and card counter
  - Mobile responsive design
  - Touch, mouse, and keyboard navigation

### 2. InteractiveEpisodeDrawer Component
- **File**: `components/interactiveEpisodeDrawer.js`
- **Purpose**: Dedicated React component for rendering interactive episodes
- **Features**: 
  - Clean, minimal interface without automatic cover generation
  - Full control over content rendering
  - Optimized for card-based interactions

### 3. Detection Logic
- **File**: `components/globe.js`
- **Function**: `isInteractiveEpisode(postId, title)`
- **Logic**: 
  - Currently detects Episode 13 specifically
  - Future episodes with "Episode" + "Urban Runner" in title
  - Automatically routes to appropriate drawer component

### 4. Script Execution
- **File**: `components/globe.js`
- **Purpose**: Extracts and executes JavaScript from interactive episode HTML
- **Process**:
  1. Parse HTML content
  2. Extract `<script>` tags
  3. Execute scripts after DOM insertion
  4. Handles errors gracefully

### 5. Styling
- **File**: `components/interactiveEpisodeDrawer.css`
- **Purpose**: Clean styling for interactive episodes
- **Features**:
  - Overrides default blog post styles
  - Ensures full-space card interface
  - Hides unwanted elements

## Usage

### Creating a New Interactive Episode

1. **Create JSON File**: Create your episode data file (e.g., `2025/episode-14/data.json`) with your episode data
2. **Add to moments.js**: Add your episode to the `momentsInTime` array with `fullLink: "components/interactive-episode.html?data=YOUR_DATA_PATH"`
3. **Update Detection**: Ensure the `isInteractiveEpisode()` function detects your episode
4. **Add Images**: Place your episode images in the appropriate directory

**Example moments.js entry:**
```javascript
{
  id: "urban-runner-episode-14-2025-09-15",
  title: "Urban Runner Episode 14: Your Episode Title",
  // ... other metadata ...
  fullLink: "components/interactive-episode.html?data=2025/episode-14/data.json",
  // ... rest of entry ...
}
```
5. **Update Navigation**: Add to `components/episodeNavigation.js` if needed

### Episode Data Structure

Episode data is stored in separate JSON files and loaded dynamically. The JSON structure should be:

```json
{
    "episode": 13,
    "title": "Episode Title",
    "checkpoints": [
        {
            "id": 0,
            "title": "Episode Cover",
            "backstory": "Cover description",
            "image": "path/to/image.jpg"
        },
        {
            "id": 1,
            "title": "Checkpoint Title",
            "backstory": "Detailed backstory content",
            "image": "path/to/image.jpg"
        }
    ]
}
```

### Data Loading

The system automatically loads episode data from JSON files using the `loadEpisodeData()` function:

```javascript
async function loadEpisodeData() {
    try {
        const response = await fetch('09-15-episode14.json'); // JSON file matches HTML naming
        episodeData = await response.json();
        return episodeData;
    } catch (error) {
        // Fallback error state
        console.error('Error loading episode data:', error);
    }
}
```

### Detection Rules

The system automatically detects interactive episodes based on:
- **Post ID**: Specific IDs like `urban-runner-episode-13-2025-09-03`
- **Title Pattern**: Contains "Episode" AND "Urban Runner"

## Benefits

1. **Separation of Concerns**: Interactive episodes don't interfere with standard blog posts
2. **Reusability**: Template and components can be used for future episodes
3. **Maintainability**: Changes to card interface only need to be made in one place
4. **Consistency**: All interactive episodes use the same component and styling
5. **Future-Proof**: Easy to retrofit existing episodes or create new ones

## File Structure

```
components/
├── interactiveEpisodeDrawer.js      # React component for interactive episodes
├── interactiveEpisodeDrawer.css     # Styling for interactive episodes
├── interactiveEpisodeTemplate.html  # Template for new episodes
├── README-interactive-episodes.md   # This documentation
├── blogPostDrawer.js               # Standard blog post component (unchanged)
└── globe.js                        # Updated with detection and routing logic
```

## Migration Path

### For New Episodes
- Use the template and follow the usage guide above

### For Existing Episodes
- Copy the episode HTML structure
- Replace content with card-based interface
- Update the detection logic if needed
- Test thoroughly

## Technical Notes

- JavaScript execution happens after DOM insertion with a 100ms delay
- Cards use CSS transforms for smooth animations
- Responsive design works on mobile and desktop
- Error handling includes fallback images and graceful degradation
