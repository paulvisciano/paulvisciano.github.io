#!/usr/bin/env node

/**
 * OpenClaw Session Parser
 * 
 * Parses JSONL session files and extracts:
 * 1. Full transcript → /memory/raw/YYYY-MM-DD/transcript.md
 * 2. Significant moments → For moments.js integration
 * 3. Comic narrative structure → /moments/[location]/YYYY-MM-DD/
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SESSION_FILE = process.argv[2] || '/Users/paulvisciano/.openclaw/agents/main/sessions/backup/Feb-28/6195924f-2ffc-4eca-b589-52bdf5a64350.jsonl';
const MEMORY_BASE = '/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw';
const MOMENTS_BASE = '/Users/paulvisciano/Personal/paulvisciano.github.io/moments';

// Parse JSONL file
function parseSessionFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const messages = [];
  
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'message' && entry.message) {
        messages.push({
          role: entry.message.role,
          content: entry.message.content,
          timestamp: entry.timestamp,
          toolCalls: entry.message.content?.some(c => c.type === 'toolCall') ? entry.message.content : null,
          stopReason: entry.stopReason,
          usage: entry.usage
        });
      }
    } catch (e) {
      console.error('Error parsing line:', e.message);
    }
  }
  
  return messages;
}

// Format timestamp to readable date
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Extract text from content array
function extractText(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(c => {
      if (c.type === 'text') return c.text;
      if (c.type === 'toolCall') return `[Tool: ${c.name}(${JSON.stringify(c.arguments)})]`;
      if (c.type === 'toolResult') return `[Result: ${c.content?.[0]?.text?.substring(0, 100)}...]`;
      return '';
    }).join('\n');
  }
  return '';
}

// Group messages by date
function groupByDate(messages) {
  const grouped = {};
  
  for (const msg of messages) {
    const date = new Date(msg.timestamp);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    grouped[dateStr].push(msg);
  }
  
  return grouped;
}

// Generate transcript markdown
function generateTranscript(messages, date) {
  const lines = [
    `# ${formatTimestamp(messages[0].timestamp).split(',')[0]} — Session Transcript`,
    '',
    `**Date:** ${date}`,
    `**Source:** OpenClaw session log`,
    `**Parsed:** ${new Date().toISOString().split('T')[0]}`,
    '',
    '---',
    ''
  ];
  
  for (const msg of messages) {
    const time = new Date(msg.timestamp).toLocaleTimeString('en-US', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const role = msg.role === 'user' ? 'Paul' : 'Jarvis';
    const text = extractText(msg.content);
    
    if (text.trim()) {
      lines.push(`**${role} [${time} GMT+7]:** ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`);
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

// Identify significant moments (heuristic-based)
function extractMoments(messages, date) {
  const moments = [];
  let currentMoment = null;
  
  for (const msg of messages) {
    const text = extractText(msg.content);
    
    // Look for significant events
    if (msg.role === 'user') {
      // Check for location mentions
      const locationMatch = text.match(/(?:at|in|going to|heading to|arrived at)\s+([A-Z][a-zA-Z\s,]+)/i);
      
      // Check for decisions/insights
      const decisionKeywords = ['decided', 'realized', 'understood', 'learned', 'discovered', 'quit', 'started', 'built'];
      const isDecision = decisionKeywords.some(k => text.toLowerCase().includes(k));
      
      // Check for experiences
      const experienceKeywords = ['went', 'visited', 'explored', 'walked', 'ate', 'drank', 'met', 'talked'];
      const isExperience = experienceKeywords.some(k => text.toLowerCase().includes(k));
      
      if (locationMatch || isDecision || isExperience) {
        if (currentMoment) {
          moments.push(currentMoment);
        }
        
        currentMoment = {
          date: date,
          timestamp: msg.timestamp,
          type: locationMatch ? 'location' : isDecision ? 'decision' : 'experience',
          text: text.substring(0, 200),
          location: locationMatch ? locationMatch[1].trim() : null
        };
      }
    }
  }
  
  if (currentMoment) {
    moments.push(currentMoment);
  }
  
  return moments;
}

// Generate comic narrative structure
function generateComicNarrative(moments, date) {
  const narrative = [
    `# ${date} — Day in the Life`,
    '',
    `**Generated:** ${new Date().toISOString().split('T')[0]}`,
    `**Source:** OpenClaw session parsing`,
    '',
    '---',
    '',
    '## Timeline',
    ''
  ];
  
  for (const moment of moments) {
    const time = new Date(moment.timestamp).toLocaleTimeString('en-US', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    narrative.push(`### ${time} — ${moment.type.charAt(0).toUpperCase() + moment.type.slice(1)}`);
    narrative.push('');
    narrative.push(moment.text);
    narrative.push('');
    
    if (moment.location) {
      narrative.push(`**Location:** ${moment.location}`);
      narrative.push('');
    }
  }
  
  narrative.push('---');
  narrative.push('');
  narrative.push('## Comic Book Structure (Auto-Generated)');
  narrative.push('');
  narrative.push('**Suggested panels:**');
  narrative.push('');
  
  for (let i = 0; i < Math.min(moments.length, 8); i++) {
    const moment = moments[i];
    narrative.push(`**Panel ${i + 1}:** ${moment.type} at ${new Date(moment.timestamp).toLocaleTimeString('en-US', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false })}`);
    narrative.push(`- ${moment.text.substring(0, 100)}...`);
    narrative.push('');
  }
  
  return narrative.join('\n');
}

// Generate moments.js entry
function generateMomentsJSEntry(moment, index) {
  const date = new Date(moment.timestamp);
  const id = `openclaw-${date.toISOString().split('T')[0]}-${index}`;
  
  return `{
    id: "${id}",
    title: "${moment.type.charAt(0).toUpperCase() + moment.type.slice(1)} on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}",
    date: new Date('${moment.timestamp}'),
    timelineHighlight: "${moment.type}",
    tags: ["${moment.type}", "openclaw", "conversation"],
    snippet: "${moment.text.substring(0, 150)}...",
    fullLink: "/moments/bangkok/${date.toISOString().split('T')[0]}/",
    location: { lat: 13.7563, lng: 100.5018, name: "Bangkok, Thailand" },
    stayDuration: 1,
    formattedDuration: "1 day"
  }`;
}

// Main execution
function main() {
  console.log(`Parsing session file: ${SESSION_FILE}`);
  
  // Parse messages
  const messages = parseSessionFile(SESSION_FILE);
  console.log(`Extracted ${messages.length} messages`);
  
  // Group by date
  const grouped = groupByDate(messages);
  console.log(`Found messages across ${Object.keys(grouped).length} dates: ${Object.keys(grouped).join(', ')}`);
  
  // Process each date
  for (const [date, dayMessages] of Object.entries(grouped)) {
    console.log(`\nProcessing ${date} (${dayMessages.length} messages)...`);
    
    // Create date directory
    const dateDir = path.join(MEMORY_BASE, date);
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
      console.log(`  Created directory: ${dateDir}`);
    }
    
    // Generate and save transcript
    const transcript = generateTranscript(dayMessages, date);
    const transcriptPath = path.join(dateDir, 'transcript.md');
    
    // Append if exists, otherwise create
    if (fs.existsSync(transcriptPath)) {
      const existing = fs.readFileSync(transcriptPath, 'utf-8');
      fs.writeFileSync(transcriptPath, existing + '\n\n---\n\n' + transcript);
      console.log(`  Appended to transcript: ${transcriptPath}`);
    } else {
      fs.writeFileSync(transcriptPath, transcript);
      console.log(`  Created transcript: ${transcriptPath}`);
    }
    
    // Extract moments
    const moments = extractMoments(dayMessages, date);
    console.log(`  Extracted ${moments.length} significant moments`);
    
    // Generate comic narrative
    if (moments.length > 0) {
      const narrative = generateComicNarrative(moments, date);
      const narrativeDir = path.join(MOMENTS_BASE, 'bangkok', date);
      
      if (!fs.existsSync(narrativeDir)) {
        fs.mkdirSync(narrativeDir, { recursive: true });
        console.log(`  Created narrative directory: ${narrativeDir}`);
      }
      
      const narrativePath = path.join(narrativeDir, 'narrative.md');
      fs.writeFileSync(narrativePath, narrative);
      console.log(`  Created narrative: ${narrativePath}`);
      
      // Generate moments.js entries
      const momentsEntries = moments.map((m, i) => generateMomentsJSEntry(m, i));
      const momentsPath = path.join(narrativeDir, 'moments-entries.js');
      fs.writeFileSync(momentsPath, momentsEntries.join(',\n\n'));
      console.log(`  Created moments.js entries: ${momentsPath}`);
    }
  }
  
  console.log('\n✅ Parsing complete!');
  console.log('\nNext steps:');
  console.log('1. Review generated transcripts in /memory/raw/YYYY-MM-DD/');
  console.log('2. Review comic narratives in /moments/bangkok/YYYY-MM-DD/');
  console.log('3. Copy moments.js entries into /moments/moments.js');
  console.log('4. Generate comic book pages from narratives (manual or AI)');
}

// Run
main();
