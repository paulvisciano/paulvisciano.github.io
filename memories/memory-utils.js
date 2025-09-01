// Memory System Utilities
// Helper functions for managing and querying AI memories

class AIMemoryUtils {
  
  // Session Management
  static captureSession(sessionData) {
    const session = {
      id: sessionData.id || this.generateSessionId(sessionData.type),
      timestamp: new Date().toISOString(),
      ...sessionData
    };
    
    // Add to memory system
    if (typeof window !== 'undefined' && window.aiMemory) {
      window.aiMemory.sessions.push(session);
    }
    
    return session;
  }

  static generateSessionId(type) {
    const date = new Date().toISOString().split('T')[0];
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${date}-${type}-${randomSuffix}`;
  }

  // Context Extraction
  static extractProjectContext(conversation) {
    const context = {
      files_mentioned: [],
      technologies: [],
      preferences: [],
      patterns: []
    };

    // Simple keyword extraction (could be enhanced with NLP)
    const text = conversation.toLowerCase();
    
    // Extract file mentions
    const fileMatches = text.match(/[\w-]+\.(js|html|css|json|md)/g);
    if (fileMatches) {
      context.files_mentioned = [...new Set(fileMatches)];
    }

    // Extract technology mentions
    const techKeywords = ['react', 'javascript', 'git', 'node', 'npm', 'babel', 'd3', 'globe.gl'];
    context.technologies = techKeywords.filter(tech => text.includes(tech));

    return context;
  }

  // Search and Query
  static searchSessions(query) {
    if (!window.aiMemory) return [];
    
    const searchTerm = query.toLowerCase();
    return window.aiMemory.sessions.filter(session => {
      return (
        session.summary.toLowerCase().includes(searchTerm) ||
        session.key_changes.some(change => change.toLowerCase().includes(searchTerm)) ||
        (session.tags && session.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    });
  }

  static getSessionsByTimeframe(days = 30) {
    if (!window.aiMemory) return [];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return window.aiMemory.sessions.filter(session => {
      return new Date(session.timestamp) >= cutoffDate;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  static getRelatedSessions(sessionId) {
    if (!window.aiMemory) return [];
    
    const targetSession = window.aiMemory.sessions.find(s => s.id === sessionId);
    if (!targetSession) return [];

    return window.aiMemory.sessions.filter(session => {
      if (session.id === sessionId) return false;
      
      // Check for shared files
      const sharedFiles = session.files_modified?.some(file => 
        targetSession.files_modified?.includes(file)
      );
      
      // Check for shared tags
      const sharedTags = session.tags?.some(tag => 
        targetSession.tags?.includes(tag)
      );
      
      return sharedFiles || sharedTags;
    });
  }

  // Context Building for AI
  static buildContextSummary(maxSessions = 5) {
    if (!window.aiMemory) return null;
    
    const recentSessions = this.getSessionsByTimeframe(30).slice(0, maxSessions);
    const projectContext = window.aiMemory.contexts.project_knowledge;
    const userPatterns = window.aiMemory.contexts.user_patterns;
    
    return {
      recent_activity: recentSessions.map(session => ({
        type: session.type,
        summary: session.summary,
        key_changes: session.key_changes?.slice(0, 3) // Top 3 changes
      })),
      project_info: {
        structure: projectContext?.structure,
        workflow: projectContext?.publishing_workflow,
        preferences: projectContext?.preferences?.slice(0, 3)
      },
      user_preferences: {
        style: userPatterns?.travel_style,
        activities: userPatterns?.favorite_activities?.slice(0, 5),
        technical: userPatterns?.technical_preferences
      },
      current_relationships: Object.keys(window.aiMemory.relationships.people || {}),
      current_locations: Object.keys(window.aiMemory.relationships.places || {})
    };
  }

  // Export/Import for backup
  static exportMemories() {
    if (!window.aiMemory) return null;
    
    return {
      exported_at: new Date().toISOString(),
      version: "1.0",
      data: window.aiMemory
    };
  }

  static importMemories(exportedData) {
    if (typeof window !== 'undefined' && exportedData.data) {
      window.aiMemory = exportedData.data;
      return true;
    }
    return false;
  }
}

// Export for both browser and Node.js
if (typeof window !== 'undefined') {
  window.AIMemoryUtils = AIMemoryUtils;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIMemoryUtils;
}
