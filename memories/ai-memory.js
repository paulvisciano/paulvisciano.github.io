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
        "Detailed snippets with rich context for travel moments"
      ]
    },
    user_patterns: {
      travel_style: "digital nomad lifestyle",
      favorite_activities: ["beach volleyball", "running", "wellness", "rooftops", "food exploration"],
      documentation_style: "detailed narratives with specific experiences",
      technical_preferences: ["React", "JavaScript", "git workflow automation"],
      communication_style: "direct, enthusiastic about experiences"
    }
  },

  // People, places, and relationship data
  relationships: {
    people: {
      "Jamie": { 
        relationship: "travel companion", 
        current_location: "Bangkok", 
        activities: ["digital nomad work", "Urban Runner project", "rooftop exploration"]
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
        status: "current favorite city",
        duration: "29 days starting Aug 24", 
        highlights: ["digital nomad #1 city", "incredible food", "volleyball spots", "hookah places"],
        companions: ["Jamie", "potentially Bozhi", "Boy joining 12th"]
      },
      "Philippines": {
        status: "recently visited",
        purpose: "visit Leo and Boy",
        experience: "incredible time"
      }
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
    }
  }
};

// Export for Node.js environments if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.aiMemory;
}
