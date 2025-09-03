#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadMoments(momentsPath) {
  const code = fs.readFileSync(momentsPath, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'moments.js' });
  return sandbox.window.momentsInTime || [];
}

function extractPeopleFromMoments(moments) {
  const people = new Map();
  
  for (const moment of moments) {
    const text = `${moment.title} ${moment.snippet}`.toLowerCase();
    
    // Look for common name patterns and relationships
    const namePatterns = [
      /\b(jamie|leo|boy|bozhi|leigha|hallie|zacharias|wouter|ray|bartek|alain)\b/gi,
      /\bwith ([A-Z][a-z]+)\b/g,
      /\bmet ([A-Z][a-z]+)\b/g,
      /\b([A-Z][a-z]+) and I\b/g
    ];
    
    namePatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const name = (match[1] || match[0]).toLowerCase();
        if (name && name.length > 2) {
          const properName = name.charAt(0).toUpperCase() + name.slice(1);
          if (!people.has(properName)) {
            people.set(properName, {
              name: properName,
              moments: [],
              locations: new Set(),
              activities: new Set(),
              relationship_context: []
            });
          }
          
          const person = people.get(properName);
          person.moments.push({
            id: moment.id,
            title: moment.title,
            date: moment.date,
            location: moment.location?.name,
            snippet: moment.snippet.slice(0, 200)
          });
          
          if (moment.location?.name) {
            person.locations.add(moment.location.name);
          }
          
          // Extract activities from tags
          moment.tags?.forEach(tag => person.activities.add(tag));
          
          // Look for relationship context
          if (text.includes('friend')) person.relationship_context.push('friend');
          if (text.includes('brother')) person.relationship_context.push('brother');
          if (text.includes('companion')) person.relationship_context.push('travel companion');
          if (text.includes('family')) person.relationship_context.push('family');
        }
      }
    });
  }
  
  // Convert Sets to Arrays for JSON serialization
  const result = {};
  people.forEach((person, name) => {
    result[name] = {
      ...person,
      locations: Array.from(person.locations),
      activities: Array.from(person.activities),
      relationship_context: [...new Set(person.relationship_context)]
    };
  });
  
  return result;
}

function extractPlacesFromMoments(moments) {
  const places = new Map();
  
  for (const moment of moments) {
    const locationName = moment.location?.name;
    if (!locationName) continue;
    
    if (!places.has(locationName)) {
      places.set(locationName, {
        name: locationName,
        coordinates: moment.location,
        visits: [],
        total_days: 0,
        activities: new Set(),
        experiences: [],
        tags: new Set()
      });
    }
    
    const place = places.get(locationName);
    place.visits.push({
      id: moment.id,
      title: moment.title,
      date: moment.date,
      duration: moment.stayDuration || 0,
      snippet: moment.snippet.slice(0, 200)
    });
    
    place.total_days += moment.stayDuration || 0;
    
    // Extract experiences and activities
    moment.tags?.forEach(tag => {
      place.activities.add(tag);
      place.tags.add(tag);
    });
    
    // Look for experience keywords in snippets
    const experienceKeywords = [
      'incredible', 'amazing', 'beautiful', 'stunning', 'vibrant', 
      'relaxing', 'exciting', 'memorable', 'perfect', 'favorite'
    ];
    
    experienceKeywords.forEach(keyword => {
      if (moment.snippet.toLowerCase().includes(keyword)) {
        place.experiences.push(keyword);
      }
    });
  }
  
  // Convert Sets to Arrays and sort visits by date
  const result = {};
  places.forEach((place, name) => {
    place.visits.sort((a, b) => new Date(a.date) - new Date(b.date));
    result[name] = {
      ...place,
      activities: Array.from(place.activities),
      tags: Array.from(place.tags),
      experiences: [...new Set(place.experiences)]
    };
  });
  
  return result;
}

function extractUserPreferencesFromMoments(moments) {
  const preferences = {
    favorite_activities: new Map(),
    travel_patterns: {
      preferred_durations: [],
      seasonal_preferences: {},
      location_types: new Map()
    },
    interests: new Map(),
    travel_style_indicators: []
  };
  
  for (const moment of moments) {
    // Count activity preferences from tags
    moment.tags?.forEach(tag => {
      preferences.favorite_activities.set(tag, 
        (preferences.favorite_activities.get(tag) || 0) + (moment.stayDuration || 1)
      );
    });
    
    // Track duration patterns
    if (moment.stayDuration) {
      preferences.travel_patterns.preferred_durations.push(moment.stayDuration);
    }
    
    // Seasonal preferences
    const month = new Date(moment.date).getMonth();
    const season = month < 3 ? 'winter' : month < 6 ? 'spring' : month < 9 ? 'summer' : 'fall';
    preferences.travel_patterns.seasonal_preferences[season] = 
      (preferences.travel_patterns.seasonal_preferences[season] || 0) + 1;
    
    // Location type preferences (beach, city, mountains, etc.)
    const locationTypes = ['beach', 'city', 'mountains', 'island', 'desert', 'culture', 'nature'];
    locationTypes.forEach(type => {
      if (moment.tags?.includes(type) || moment.snippet.toLowerCase().includes(type)) {
        preferences.travel_patterns.location_types.set(type,
          (preferences.travel_patterns.location_types.get(type) || 0) + (moment.stayDuration || 1)
        );
      }
    });
    
    // Extract travel style indicators
    const styleIndicators = [
      'digital nomad', 'backpacking', 'luxury', 'adventure', 'wellness', 
      'cultural', 'food', 'nightlife', 'relaxation', 'active'
    ];
    
    styleIndicators.forEach(style => {
      if (moment.snippet.toLowerCase().includes(style)) {
        preferences.travel_style_indicators.push(style);
      }
    });
  }
  
  // Convert Maps to sorted Arrays
  const topActivities = Array.from(preferences.favorite_activities.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([activity, weight]) => ({ activity, total_days: weight }));
  
  const topLocationTypes = Array.from(preferences.travel_patterns.location_types.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([type, weight]) => ({ type, total_days: weight }));
  
  return {
    top_activities: topActivities,
    travel_patterns: {
      ...preferences.travel_patterns,
      location_types: topLocationTypes,
      avg_stay_duration: preferences.travel_patterns.preferred_durations.length > 0 
        ? preferences.travel_patterns.preferred_durations.reduce((a, b) => a + b, 0) / preferences.travel_patterns.preferred_durations.length
        : 0
    },
    travel_style: [...new Set(preferences.travel_style_indicators)]
  };
}

function analyzeCursorHistory(historyPath) {
  if (!fs.existsSync(historyPath)) {
    return { people: {}, places: {}, themes: [] };
  }
  
  const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  const analysis = {
    people: new Map(),
    places: new Map(),
    themes: new Map(),
    technical_context: []
  };
  
  // Analyze each month's conversation data
  Object.values(historyData.months || {}).forEach(monthData => {
    monthData.files?.forEach(file => {
      if (file.snippet) {
        const text = file.snippet.toLowerCase();
        
        // Extract people mentions
        const peoplePatterns = [
          /\b(jamie|leo|boy|bozhi|leigha|hallie|zacharias|wouter|ray|bartek|alain|mike)\b/gi
        ];
        
        peoplePatterns.forEach(pattern => {
          const matches = text.matchAll(pattern);
          for (const match of matches) {
            const name = match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase();
            analysis.people.set(name, (analysis.people.get(name) || 0) + 1);
          }
        });
        
        // Extract place mentions
        const placePatterns = [
          /\b(bangkok|philippines|chicago|miami|hawaii|oahu|maui|japan|thailand|california|florida|colorado|brazil|colombia|greece|spain|bulgaria|lebanon|dubai)\b/gi
        ];
        
        placePatterns.forEach(pattern => {
          const matches = text.matchAll(pattern);
          for (const match of matches) {
            const place = match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase();
            analysis.places.set(place, (analysis.places.get(place) || 0) + 1);
          }
        });
        
        // Extract themes and topics
        const themePatterns = [
          /\b(volleyball|running|yoga|massage|food|rooftop|beach|travel|digital nomad|wellness|workout|coffee|music|art|culture)\b/gi
        ];
        
        themePatterns.forEach(pattern => {
          const matches = text.matchAll(pattern);
          for (const match of matches) {
            const theme = match[0].toLowerCase();
            analysis.themes.set(theme, (analysis.themes.get(theme) || 0) + 1);
          }
        });
      }
    });
  });
  
  return {
    people: Object.fromEntries(Array.from(analysis.people.entries()).sort((a, b) => b[1] - a[1])),
    places: Object.fromEntries(Array.from(analysis.places.entries()).sort((a, b) => b[1] - a[1])),
    themes: Object.fromEntries(Array.from(analysis.themes.entries()).sort((a, b) => b[1] - a[1]))
  };
}

function main() {
  const projectRoot = process.cwd();
  const momentsPath = path.join(projectRoot, 'moments', 'moments.js');
  const historyPath = path.join(projectRoot, 'memories', 'sessions', '2025-09-01-cursor-history-summary.json');
  const outputDir = path.join(projectRoot, 'memories', 'contexts');
  
  console.log('🔍 Learning from all your data...');
  
  // Load and analyze moments
  const moments = loadMoments(momentsPath);
  console.log(`📚 Loaded ${moments.length} travel moments`);
  
  const peopleFromMoments = extractPeopleFromMoments(moments);
  const placesFromMoments = extractPlacesFromMoments(moments);
  const userPreferences = extractUserPreferencesFromMoments(moments);
  
  console.log(`👥 Found ${Object.keys(peopleFromMoments).length} people in moments`);
  console.log(`📍 Found ${Object.keys(placesFromMoments).length} places in moments`);
  
  // Analyze conversation history
  let conversationAnalysis = { people: {}, places: {}, themes: {} };
  if (fs.existsSync(historyPath)) {
    conversationAnalysis = analyzeCursorHistory(historyPath);
    console.log(`💬 Analyzed conversation history`);
    console.log(`👥 Found ${Object.keys(conversationAnalysis.people).length} people in conversations`);
    console.log(`📍 Found ${Object.keys(conversationAnalysis.places).length} places in conversations`);
  }
  
  // Create comprehensive knowledge base
  const comprehensiveKnowledge = {
    generated_at: new Date().toISOString(),
    source: 'moments + conversation history',
    people: {
      from_moments: peopleFromMoments,
      from_conversations: conversationAnalysis.people,
      merged_insights: {} // TODO: merge and deduplicate
    },
    places: {
      from_moments: placesFromMoments,
      from_conversations: conversationAnalysis.places,
      merged_insights: {} // TODO: merge and deduplicate
    },
    user_profile: {
      travel_preferences: userPreferences,
      conversation_themes: conversationAnalysis.themes,
      total_travel_days: moments.reduce((sum, m) => sum + (m.stayDuration || 0), 0),
      countries_visited: [...new Set(moments.map(m => m.location?.name).filter(Boolean))].length,
      most_visited_places: Object.entries(placesFromMoments)
        .sort((a, b) => b[1].total_days - a[1].total_days)
        .slice(0, 10)
        .map(([name, data]) => ({ name, total_days: data.total_days, visits: data.visits.length }))
    }
  };
  
  // Save comprehensive knowledge
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  const knowledgePath = path.join(outputDir, 'comprehensive-knowledge.json');
  fs.writeFileSync(knowledgePath, JSON.stringify(comprehensiveKnowledge, null, 2));
  
  // Create session record
  const sessionPath = path.join(projectRoot, 'memories', 'sessions', `${new Date().toISOString().slice(0,10)}-comprehensive-learning.json`);
  const session = {
    id: path.basename(sessionPath, '.json'),
    timestamp: new Date().toISOString(),
    type: 'comprehensive_learning',
    summary: `Learned from ${moments.length} moments + conversation history: extracted people, places, preferences`,
    files_modified: [path.relative(projectRoot, knowledgePath)],
    key_insights: [
      `${Object.keys(peopleFromMoments).length} people identified from moments`,
      `${Object.keys(placesFromMoments).length} places analyzed`,
      `${comprehensiveKnowledge.user_profile.total_travel_days} total travel days`,
      `${comprehensiveKnowledge.user_profile.countries_visited} countries visited`,
      `Top activities: ${userPreferences.top_activities.slice(0, 5).map(a => a.activity).join(', ')}`
    ],
    tags: ['learning', 'comprehensive', 'moments', 'conversations']
  };
  
  const sessionsDir = path.dirname(sessionPath);
  if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });
  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
  
  console.log(`✅ Comprehensive knowledge saved: ${knowledgePath}`);
  console.log(`📝 Session recorded: ${sessionPath}`);
  console.log('\n🎯 Key insights:');
  session.key_insights.forEach(insight => console.log(`  • ${insight}`));
}

main();
