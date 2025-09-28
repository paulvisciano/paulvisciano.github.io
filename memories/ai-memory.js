// AI Memory System for Personal Website
// This system captures and stores AI interaction context for better assistance

window.aiMemory = {
  // Session records - individual AI interactions
  sessions: [
    {
      id: "2025-01-01-bangkok-updates",
      timestamp: "2025-01-01T15:00:00Z",
      type: "content_update",
      summary: "Updated Bangkok moment with Jamie adventures and group expansion",
      files_modified: ["moments/moments.js"],
      key_changes: [
        "Changed companion from Bozhi to Jamie",
        "Added Urban Runner donation project",
        "Included rooftop exploration and neighborhood running",
        "Added volleyball spot and hookah place discoveries", 
        "Updated group plans: Bozhi potentially joining, Boy joining on 12th",
        "Extended stay to 29 days, removed Japan and Maui"
      ],
      context: {
        current_location: "Bangkok, Thailand",
        project_focus: "travel moments website",
        user_mood: "excited about Bangkok experiences"
      },
      tags: ["travel", "content_update", "bangkok", "moments"]
    },
    {
      id: "2025-01-01-git-lfs-setup",
      timestamp: "2025-01-01T16:00:00Z",
      type: "technical_setup",
      summary: "Set up Git LFS for efficient binary file management",
      files_modified: [".gitattributes", "projects/urban-runner/memories/episode-4/images/"],
      key_changes: [
        "Configured Git LFS to track PNG, JPG, GIF, MP4, MOV, AVI, and PDF files",
        "Added 9 new urban-runner episode 4 image assets",
        "All existing images now properly tracked by Git LFS",
        "Repository optimized for large binary files while maintaining fast operations"
      ],
      context: {
        project_focus: "website optimization and urban-runner asset management",
        technical_improvement: "Git LFS implementation"
      },
      tags: ["technical", "git-lfs", "optimization", "urban-runner"]
    },
    {
      id: "2025-01-28-canonical-url-implementation",
      timestamp: "2025-01-28T04:45:00Z",
      type: "architecture_improvement",
      summary: "Implemented canonical URL pattern for moments with Episode 7 migration",
      files_modified: [
        "moments/bangkok/2025-09-03/index.html",
        "moments/bangkok/2025-09-03/content.html", 
        "moments/moments.js",
        "components/app.js",
        "components/globe.js"
      ],
      key_changes: [
        "Created new canonical URL structure: /moments/<city-slug>/<YYYY-MM-DD>/",
        "Migrated Episode 7 to /moments/bangkok/2025-09-03/ with clean file naming",
        "Implemented redirect system for direct URL navigation to globe interface",
        "Added support for deep linking with #page-<n> anchors",
        "Renamed files to cleaner convention: cover.png, page-01.png, page-02.png, etc.",
        "Updated moments.js and app.js routing to handle new URL patterns",
        "Preserved original horizontal scroll layout and K-FIT sections",
        "Removed old Episode 7 files from moments/2025/ directory"
      ],
      context: {
        project_focus: "URL structure optimization and episode migration",
        technical_improvement: "canonical URL implementation",
        user_feedback: "much cleaner file naming convention"
      },
      tags: ["architecture", "url-structure", "episode-migration", "file-organization", "deep-linking"]
    },
    {
      id: "2025-01-28-episode-migration-series",
      timestamp: "2025-01-28T06:30:00Z",
      type: "content_migration",
      summary: "Migrated Episodes 4-7 and 13 to canonical URL structure with smooth navigation",
      files_modified: [
        "moments/bangkok/2025-08-31/index.html",
        "moments/bangkok/2025-08-31/content.html",
        "moments/bangkok/2025-09-01/index.html", 
        "moments/bangkok/2025-09-01/content.html",
        "moments/bangkok/2025-09-02/index.html",
        "moments/bangkok/2025-09-02/content.html",
        "moments/bangkok/2025-09-09/index.html",
        "moments/bangkok/2025-09-09/data.json",
        "moments/moments.js",
        "components/app.js",
        "components/globe.js",
        "components/episodeNavigation.js"
      ],
      key_changes: [
        "Migrated Episodes 4-7 (traditional HTML episodes) to canonical URL structure",
        "Migrated Episode 13 (interactive episode) with special data.json handling",
        "Implemented smooth drawer transitions for episode navigation",
        "Fixed URL generation to use fullLink property instead of ID-based URLs",
        "Updated episodeNavigation.js with canonical URLs for all migrated episodes",
        "Added isInteractive flag for Episode 13 to trigger special loading logic",
        "Fixed cache-busting bug in globe.js for interactive episodes",
        "Removed all old episode files from moments/2025/ directory",
        "Standardized image naming to page-XX.png convention across all episodes"
      ],
      context: {
        project_focus: "complete episode migration to new URL structure",
        technical_improvement: "smooth navigation and interactive episode support",
        user_feedback: "transitions are super smooth, can navigate between different episode types"
      },
      tags: ["episode-migration", "navigation", "interactive-episodes", "url-structure", "smooth-transitions"]
    }
  ],

  // Project and user context knowledge
  contexts: {
    project_knowledge: {
      name: "Personal Travel Website",
      structure: "React components with interactive globe visualization",
      data_source: "moments/moments.js - JavaScript array of travel moments",
      publishing_workflow: "Git commit hooks auto-publish changes",
      key_components: ["globe.js", "app.js", "blogPostDrawer.js", "footer.js"],
      preferences: [
        "Prefer editing existing files over creating new ones",
        "No manual npm scripts needed - commit hooks handle publishing",
        "Detailed snippets with rich context for travel moments",
        "Use node http-server to serve files locally instead of python3 -m http.server",
        "Always add Open Graph and Twitter Card meta tags for future episodes or blogs"
      ],
      url_structure: {
        canonical_pattern: "/moments/<city-slug>/<YYYY-MM-DD>/",
        deep_linking: "supports #page-<n> anchors for individual comic pages",
        redirect_system: "direct URL access redirects to main app with path query parameter",
        file_naming: "cover.png, page-01.png, page-02.png, page-<special>.png convention",
        episode_types: {
          traditional: "HTML content files with content.html for episode content",
          interactive: "JSON data files with /components/interactive-episode.html component"
        },
        navigation: "smooth drawer transitions between episodes, no full page reloads"
      },
      urban_runner_integration: {
        status: "fully integrated",
        globe_pins: "running routes, checkpoints, spending patterns, episode maps",
        asset_management: "Git LFS optimized for image storage",
        episode_images: "9 high-quality PNG assets from Episode 4",
        migrated_episodes: ["Episode 4", "Episode 5", "Episode 6", "Episode 7", "Episode 13"],
        episode_migration_pattern: {
          traditional_episodes: "Copy HTML → content.html, update image paths, create redirect index.html",
          interactive_episodes: "Copy data.json, update image paths, create redirect index.html, set isInteractive flag"
        }
      }
    },
    urban_runner_project: {
      name: "Urban Runner",
      vision: "A global movement for wealth redistribution — one run at a time",
      type: "global movement + game universe",
      core_mechanics: [
        "Real-world runs documented as episodes",
        "Checkpoint card system with stylized game world aesthetic",
        "Wealth redistribution through donations and tips",
        "Gamified storytelling with photos, videos, and live updates"
      ],
      episode_structure: {
        format: "Each run = episode with checkpoints, fuel-ups, redistribution drops",
        checkpoints: "parks, gyms, activities, food stops",
        recovery: "massage, home, final rest point",
        side_events: "volleyball, wildlife encounters, bonus activities"
      },
      game_systems: {
        checkpoint_cards: "stylized cards with photos, activity tags, cash overlays",
        spend_types: "Item Purchase (Blue), Donation (Green), Tip (Gold)",
        effects: "stamina, focus, endurance boosts",
        maps: "Google Maps GPS timeline + game world overlay",
        cutscenes: "real footage with game-world render transitions"
      },
      community: "WhatsApp group for live updates and episode recaps",
      current_status: "System architecture complete, Episode 4 executed in Bangkok"
    },
    user_patterns: {
      travel_style: "digital nomad lifestyle",
      favorite_activities: ["beach volleyball", "running", "wellness", "rooftops", "food exploration"],
      documentation_style: "detailed narratives with specific experiences",
      technical_preferences: ["React", "JavaScript", "git workflow automation", "Git LFS"],
      communication_style: "direct, enthusiastic about experiences",
      project_approach: "gamified systems, community-driven, wealth redistribution focus"
    }
  },

  // People, places, and relationship data
  relationships: {
    people: {
      "Jamie": { 
        relationship: "travel companion and Urban Runner collaborator", 
        current_location: "Bangkok", 
        activities: ["digital nomad work", "Urban Runner project", "rooftop exploration"],
        urban_runner_role: "remote collaborator providing game assets, photos, and storyline continuity"
      },
      "Leo": { 
        relationship: "friend", 
        location: "Philippines",
        context: "visited Leo and his brother Boy in Philippines"
      },
      "Boy": { 
        relationship: "Leo's brother", 
        joining_date: "2025-09-12",
        joining_location: "Bangkok"
      },
      "Bozhi": {
        relationship: "potential travel companion",
        status: "might join next week in Bangkok"
      }
    },
    places: {
      "Bangkok": { 
        status: "current favorite city and Urban Runner Episode 4 location",
        duration: "29 days starting Aug 24", 
        highlights: ["digital nomad #1 city", "incredible food", "volleyball spots", "hookah places"],
        companions: ["Jamie", "potentially Bozhi", "Boy joining 12th"],
        urban_runner_episodes: ["Episode 4 - Bangkok Botanical Run (Aug 31, 2025)"],
        key_locations: ["Wachirabenchathat Park (Botanical Garden)", "Thai Cannabis Club", "Bekku Tonkatsu", "Anime-themed restaurant"]
      },
      "Philippines": {
        status: "recently visited",
        purpose: "visit Leo and Boy",
        experience: "incredible time"
      }
    }
  },

  // Urban Runner specific data
  urban_runner_episodes: {
    episode_4: {
      title: "Bangkok Botanical Run",
      date: "2025-08-31",
      duration: "11:29 AM - 9:22 PM (~10 hours)",
      distance: "12 miles walked, 4 hours walking time",
      checkpoints: [
        "Volleyball with locals",
        "Thai Cannabis Club (Weed Spot)", 
        "Wachirabenchathat Park (Botanical Garden)"
      ],
      wealth_redistribution: {
        tips: [
          { amount: 30, location: "Street Vendor" },
          { amount: 141, location: "Bekku Tonkatsu" }
        ],
        donations: [
          { amount: 100, to: "homeless man" },
          { amount: 100, to: "another homeless man" }
        ],
        total_given: 441
      },
      side_quests: [
        {
          title: "The Bangkok Hustle",
          description: "Scammed into buying overpriced herbs and honey by men posing as healers",
          loss: 6500,
          game_integration: "Real-world scams integrated as in-game side quests"
        }
      ],
      fuel_ups: [
        "Street food: 70 THB + 30 THB tip",
        "Bekku Tonkatsu: Excellent meal with dessert (Total: 745 THB incl. tip)",
        "Final sit-down at anime-themed restaurant near botanical garden"
      ],
      game_dynamics: [
        "Real-world scams like 'The Bangkok Hustle' integrated as side quests",
        "Jamie joins remotely via WhatsApp for game assets and storyline",
        "New checkpoint card system with stylized game world aesthetic"
      ],
      observations: [
        "Bangkok's side streets often don't connect — careful route planning required",
        "Serendipitous signs: volleyball on TV, temples hidden in alleys",
        "Decision-making and perseverance key — from refusing train to navigating scams"
      ],
      recovery: "Mission completed, grab home, planned massage session for full recovery",
      assets: "9 high-quality PNG images documenting the episode",
      runner: "Paul",
      collaborator: "Jamie (remote)"
    }
  },

  // Utility functions for memory management
  utils: {
    addSession: function(sessionData) {
      const session = {
        id: sessionData.id || `${new Date().toISOString().split('T')[0]}-${sessionData.type}`,
        timestamp: new Date().toISOString(),
        ...sessionData
      };
      this.sessions.push(session);
      return session;
    },

    findSessionsByTag: function(tag) {
      return this.sessions.filter(session => 
        session.tags && session.tags.includes(tag)
      );
    },

    updateContext: function(contextType, key, value) {
      if (!this.contexts[contextType]) {
        this.contexts[contextType] = {};
      }
      this.contexts[contextType][key] = value;
    },

    addRelationship: function(type, name, data) {
      if (!this.relationships[type]) {
        this.relationships[type] = {};
      }
      this.relationships[type][name] = data;
    },

    addUrbanRunnerEpisode: function(episodeData) {
      if (!this.urban_runner_episodes) {
        this.urban_runner_episodes = {};
      }
      this.urban_runner_episodes[`episode_${episodeData.episode}`] = episodeData;
    }
  }
};

// Export for Node.js environments if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.aiMemory;
}
