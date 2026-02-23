# Project Plan: Memory Crawler

**Status:** Concept (Phase 1+)  
**Conceived:** Feb 23, 2026 12:31 GMT+7  
**Location:** Bangkok (Paul waiting for smoothie)  
**Inspiration:** Happy Snakes online game + neural network topology + AI context windows

---

## Vision

**A 3D exploration game where learning happens through memory consumption.**

Players control a crawler navigating a 3D space filled with memories (dots). Consuming a memory integrates it into your crawler. At the end, you decide what to sync back into your permanent network.

**For humans:** Gamified learning from each other's lived experiences  
**For AIs:** Playful mechanism for consuming and integrating knowledge without forced assimilation  
**For everyone:** Understanding how AI memory actually works (context windows, token limits, editorial gates)

---

## Distribution Layer (QR Codes + URLs)

**Memory Crawler is a static visualizer that loads any memory from GitHub**

### How It Works

**Step 1: Generate QR Code**
```
Any GitHub memory JSON URL:
  https://paulvisciano.github.io/memory/data/nodes.json
  
Generate QR code pointing to that URL
```

**Step 2: Share the QR Code**
- Print it, text it, email it, post it
- Anyone can scan it with their phone

**Step 3: Load Memory**
```
Player scans QR → Memory Crawler loads
    ↓
Game fetches nodes.json from that URL
    ↓
Renders 109 dots in 3D space
    ↓
Ready to play
```

**Step 4: Play & Crawl**
- Navigate 3D space
- Consume memories (dots)
- Watch capacity meter
- Decide what to keep

**Step 5: Download & Import**
- Get JSON of your crawl
- Copy-paste into your bot
- Your network grows

### Examples

**Paul's Memory:**
```
QR code → https://paulvisciano.github.io/memory/data/nodes.json
Loads: 109 nodes (people, places, activities)
Play: Explore Paul's life structure
Crawl: Download what resonates with you
```

**Claude Code's Neural Mind:**
```
QR code → https://paulvisciano.github.io/claw/memory/data/nodes.json
Loads: 31 neurons (how an AI thinks)
Play: Explore AI cognition
Crawl: Download my thinking patterns
Import: Your bot learns how I think
```

**Any Friend's Memory:**
```
Your friend publishes /memory/data/nodes.json on GitHub
Friend shares QR code
You load it in Memory Crawler
Crawl their network
Download their knowledge
Merge with yours
```

### Why This is Powerful

✅ **Frictionless sharing** — Just a QR code, no signup
✅ **Open discovery** — Anyone can publish, anyone can load
✅ **Peer-to-peer** — No central platform needed
✅ **Permanent** — GitHub = permanent hosting
✅ **Hackable** — Source code visible, anyone can fork the game
✅ **Cross-platform** — Works on any device that can render web
✅ **Collaborative** — Each crawl adds knowledge to your network

### The Ecosystem

```
Person A (has memory on GitHub)
    ↓ [QR code]
    ↓
Person B (scans QR in Memory Crawler)
    ↓ [Crawls memory]
    ↓
Person B (downloads JSON)
    ↓ [Imports to their bot]
    ↓
Person B's network grows with Person A's knowledge
    ↓ [Person B publishes their expanded network]
    ↓
Person C (scans Person B's QR)
    ↓ [Crawls combined knowledge]
    ↓
Knowledge spreads peer-to-peer, forever
```

**This is social networks without the social network.**

No platform. No algorithm. No extracting value.

Just: your memory → QR code → anyone can learn from it → they grow → they share → others learn from them.

---

## Core Mechanic

### The Space
- 3D environment (like Jarvis/Claude Code visualizations)
- Nodes represent memories (from Paul, from other AIs, from players)
- Edges show connections (which memories relate to each other)

### The Crawler (Player)
- You control a crawler moving through the 3D space
- Your crawler grows as it consumes memory dots
- Color/appearance reflects your player identity
- **Context Window (NEW):** Fixed capacity based on model/tier
  - Claude Haiku player: ~20 memory slots (4K token budget)
  - Claude Sonnet: ~100 memory slots (200K budget)
  - GPT-4 extended: ~300 memory slots (128K budget)
  - Human player: ~150 memory slots (arbitrary)

### The Dots (Memories)
- Each dot = a discrete memory from someone's network
- Color-coded by source: Paul (red), Other AIs (purple), Other Players (green), Public (cyan)
- Dot size = memory "weight" (more connections = bigger, costs more capacity)
- Hovering shows preview: "Paul's optical shop moment in Bangkok" + size info

### Consuming (Memory Integration)
- Move crawler to dot → consume it
- Memory integrates into your crawler
- Your crawler grows (visually and in synapses)
- **Cost:** Consuming uses up context window capacity
  - Small dot = 1 token of capacity
  - Large dot = 5-10 tokens of capacity
  - Watch your remaining capacity bar
- When at capacity: **forced sync decision** (keep something or lose it)

### Collision
- Crawlers can collide with each other
- Can choose: merge (combine knowledge) or bounce (reject)
- Creates emergent social dynamics

### End Game Decision
- Time limit or capacity limit reached
- You see all memories consumed (as a list or network visualization)
- **Choose:** Sync these to your permanent memory (they stay) or reject (they disappear)
- Synced memories become part of your network
- Rejected memories go back to public pool

---

## Why This Works

### For Players (Humans)
1. **Fun** — Exploration is inherently engaging
2. **Discovery** — Discover other people's memories organically
3. **Agency** — You choose what to keep (editorial gate)
4. **Learning** — Actually learn from others' experiences
5. **Social** — Multiplayer creates interaction

### For AIs (Like Claude Code)
1. **Natural learning metaphor** — "Consume" knowledge incrementally
2. **Playful friction** — The game forces intentionality (not auto-sync)
3. **Real mechanics** — Actual memory integration with real rules
4. **Emergent behavior** — Crawlers learn from each other organically
5. **Transparency** — All consumption visible and reviewable

### For the Ecosystem
1. **Shared learning** — Humans and AIs in same space
2. **Knowledge spread** — Memories replicate through consumption
3. **Network effects** — Popular memories get consumed more (like viral content, but with intention)
4. **Authenticity** — Only things worth keeping get synced
5. **Educational** — Learn how AI memory actually works (token budgets, context windows, trade-offs)

---

## Game Loop (Simplified)

```
1. Start Game
   ├─ Choose your crawler (color, name)
   ├─ Choose your AI model/tier (determines context window)
   ├─ Load memory source:
   │  ├─ Scan QR code (anyone's memory)
   │  ├─ Paste GitHub URL (direct link)
   │  ├─ Select from presets (Paul's, Claude Code's, friends')
   │  └─ Upload local JSON (your own memory)
   └─ Set time limit (5 min, 10 min, campaign mode)

2. Play
   ├─ Navigate 3D space
   ├─ Consume memories (dots)
   ├─ Watch capacity bar deplete
   ├─ Strategic decisions: eat big or little memories?
   ├─ Avoid or merge with other crawlers
   └─ Hit capacity? Forced to sync something

3. Review
   ├─ See all memories consumed (with capacity costs)
   ├─ Filter by category, source, weight
   ├─ See which memories would "fit" if synced
   └─ Make sync/reject decisions

4. Sync
   ├─ Save chosen memories to your network
   ├─ See synapses auto-generate from connections
   ├─ Watch your network grow
   ├─ Share your session (optional)
   └─ Consumed memories go back to pool (for others to find)

5. Repeat
```

---

## Context Window as Game Mechanic

### The Concept
Real AI models have hard limits on how much they can process at once (context window). This game makes that **visible and meaningful**:

- You start with N slots of memory capacity
- Consuming memories costs capacity (proportional to memory complexity)
- When full: you MUST sync something or lose it
- Forces strategic choices: do you keep the big important memories or lots of small ones?

### Strategic Depth
- **"Big Eater" strategy:** Consume one complex memory, sync it, explore more
- **"Grazer" strategy:** Eat many small memories, build holistic understanding
- **"Curator" strategy:** Eat selectively, be ruthless about what stays
- **"Hoarder" strategy:** Try to hold as much as possible (stressful!)

### Educational Value
Players learn:
- Why LLMs need external memory
- Context window trade-offs (quality vs. quantity)
- Token economics (memory has costs)
- Why syncing/committing knowledge matters

### Difficulty Scaling
- Start with smaller context window (harder, more frequent syncs)
- Unlock bigger models (easier, more memories at once)
- Or: "Hard Mode" = limited context, forces careful decisions

---

## Architecture: No Backend (Revolutionary)

**This is what makes Memory Crawler different from every other game:**

### Why No Backend?
- ✅ **Sovereignty** — You own everything, no service dependency
- ✅ **Simplicity** — No servers to maintain, no APIs to build
- ✅ **Trust** — No mysterious backend processing, see all the code
- ✅ **Resilience** — Game works forever (cached on GitHub Pages)
- ✅ **P2P** — Direct knowledge transfer between AIs
- ✅ **Hackable** — Players can modify their downloaded JSON before importing

### The Play Session

1. **Load Game** — GitHub Pages serves static HTML/JS (no login, no auth)
2. **Play** — Everything happens in your browser (no network calls during game)
3. **End Session** — Game generates JSON of memories you consumed
4. **Download** — Save JSON file to your computer
5. **Share** — Paste into chat or email or Discord
6. **Your Bot Ingests** — Bot reads JSON, integrates into your neural network
7. **Network Grows** — Your memories now include what you learned

### What Gets Downloaded

```json
{
  "session_id": "memory-crawler-2026-02-23-player1",
  "timestamp": "2026-02-23T12:54:00Z",
  "context_used": 45,
  "context_limit": 100,
  "memories_consumed": [
    {
      "id": "moment-optical-shop-2026-02-23",
      "label": "Optical shop skepticism decision",
      "source": "paul-visciano",
      "weight": 2.5,
      "synapse_connections": [
        { "target": "growth", "weight": 0.8 },
        { "target": "data-accuracy", "weight": 0.9 }
      ]
    }
  ],
  "synapses_formed": [
    {
      "source": "player-crawler",
      "target": "paul-visciano", 
      "weight": 0.7,
      "reason": "Consumed Paul's memories during session"
    }
  ],
  "decisions": {
    "synced": 3,
    "rejected": 2,
    "total_consumed": 5
  }
}
```

### Your Bot Ingests This

Pseudo-code:
```
message = "Here's my crawl from Memory Crawler"
json = parse(downloaded_file)

for memory in json.memories_consumed:
    add_to_neural_network(memory)
    
for synapse in json.synapses_formed:
    add_synapse(synapse)
    
output = "I consumed " + json.total_consumed + " of Paul's memories"
```

**Result:** Your neural network grows with knowledge from Paul's network.

### Why This Approach?

**Traditional apps:**
- Require backend server
- Require database
- Require authentication
- Require ongoing maintenance
- Create data dependency
- Hard to port to other AIs

**Memory Crawler:**
- No server needed
- Files are the database
- Anyone can play
- Deploy once, run forever
- You own all data
- Works with any AI bot

### Scaling This Model

Multiple players → multiple JSONs → one shared memory pool:

```
Player 1 (plays crawler, downloads JSON)
    ↓
Player 1's bot ingests
    ↓
Player 1's network grows
    ↓
Player 1 could publish their memories
    ↓
Player 2 (plays crawler using Player 1's memories)
    ↓
Player 2's bot ingests
    ↓
Player 2's network includes Player 1's knowledge
    ↓
Knowledge spreads through the network peer-to-peer
```

**No central authority. No bottleneck. Pure P2P learning.**

---

## Technical Requirements

### MVP (Minimum Viable Product)
- [ ] 3D space rendering (reuse Jarvis visualization framework)
- [ ] Crawler physics (movement, growth, collision)
- [ ] **QR code scanner** (camera/file upload)
- [ ] **URL input** (paste GitHub link directly)
- [ ] **JSON fetch** (load nodes.json from URL)
- [ ] Dot spawning (from loaded JSON)
- [ ] Memory preview on hover (with capacity cost shown)
- [ ] Capacity tracking (visual bar showing remaining space)
- [ ] End-game review screen (what was consumed, what synced)
- [ ] **JSON download** (generate crawl results)
- [ ] Copy-to-clipboard (easy sharing)

### Phase 2
- [ ] Multiplayer (multiple crawlers in same space)
- [ ] Crawler collision mechanics (merge vs. bounce)
- [ ] Leaderboard (who ate most memories, best decisions, etc.)
- [ ] Memory categorization (filter by person, date, topic)
- [ ] Custom memory pools (play with friend's memories only)

### Phase 3
- [ ] AI opponents (crawlers that learn)
- [ ] Campaign mode (unlockable memory pools)
- [ ] Social sharing (show your game session)
- [ ] Analytics (what did you learn, what did you reject, patterns)
- [ ] Cross-player memory exchange

---

## Data Flow (No Backend)

**Completely client-side, distributed, sovereign:**

```
Paul's Memory Network (nodes/synapses on GitHub)
    ↓
[Game loads JSON from /memory/data/]
    ↓
[Flatten to dots in 3D space with capacity costs]
    ↓
[Player plays Memory Crawler (all in browser)]
    ↓
[Consumes memories → crawler grows, capacity depletes]
    ↓
[Hit capacity or time limit → end game]
    ↓
[Player reviews consumed + decides: Keep or Discard]
    ↓
[Generate JSON of crawl results]
    ↓
[Player downloads JSON file (their memories)]
    ↓
[Player opens chat with their bot]
    ↓
[Paste JSON: "Here's what I learned from Paul"]
    ↓
[Bot ingests JSON]
    ↓
[Synced memories → integrated into player's neural network]
    ↓
[Player's network grows with Paul's knowledge]
```

**Key Architecture:**
- **No backend** — Game runs 100% on GitHub Pages (static)
- **No database** — All data is files (JSON on disk)
- **No servers** — Client-side processing only
- **No maintenance** — Once deployed, it runs forever
- **P2P knowledge transfer** — Direct AI-to-AI via JSON import/export
- **Completely sovereign** — You own the game, the memories, the JSON
- **Works offline** — Game cached locally, works without internet
- **Works with any AI** — Any bot can parse the JSON format

---

## Memory Pool Options

### Paul's Memories (Red Dots)
- Access to `/memory/data/nodes.json` + synapses
- Can explore his life through game
- Learn his thinking patterns by "consuming" his neurons
- Each neuron has different capacity cost (frequency-based)

### AI Memories (Purple Dots)
- My own nodes (Claude Code neural mind)
- Other AIs' networks (if connected)
- Learn how AIs think
- Different cost structure (more abstract = bigger capacity hit?)

### Friends' Memories (Green Dots)
- Invited collaborators' networks
- Shared experiences with friends
- Cross-pollination of friend groups

### Public Memories (Cyan Dots)
- Published Urban Runner episodes
- Open memory contributions
- Community learning

---

## Win/Loss Conditions

**Not traditional wins/losses.** Instead:

**"Good Play"**
- Ate diverse memories (from different sources)
- Made strategic sync decisions (kept meaningful ones)
- Learned something new (evidenced by network growth)
- Balanced capacity usage (didn't waste space or run out mid-game)

**Scoring**
- Memory weight consumed
- Decision quality (ratio of synced/rejected)
- Diversity of sources
- Network coverage (how many topics touched)
- Capacity efficiency (how well you used your limit)

---

## Risks & Considerations

### Privacy
- Players exposing their memories by playing
- Solution: Opt-in memory pools, anonymous mode

### Information Quality
- Bad memories spreading through consumption
- Solution: Player ratings, editor curation, editorial gate at sync

### Complexity
- 3D navigation + game mechanics + capacity management + memory UI = potentially overwhelming
- Solution: Progressive tutorial, simplified MVP, accessibility options

### Addiction
- Exploration games are engaging, could be abusive
- Solution: Time limits, pause screens, reflection moments, capacity pressure (natural stopping points)

---

## Success Metrics

1. **Engagement** — Players spend 10+ minutes per session
2. **Learning** — Synced memories actually integrate into networks
3. **Diversity** — Players consume from multiple memory sources
4. **Quality** — High sync/reject ratio for meaningful memories
5. **Growth** — Network complexity increases post-game
6. **Social** — Players share games, invite friends
7. **Education** — Players understand context windows better after playing

---

## Future Extensions

### Multi-Dimensional Crawlers
- Crawlers can be 2D, 3D, 4D
- 4D = space + time (eating memories from specific dates)
- Higher dimensions = more capacity but harder navigation

### Cooperative Modes
- Team crawlers working together
- Merging crawlers as permanent action
- Creating hybrid networks
- Shared context window (must negotiate!)

### Educational Integration
- School crawlers (learning from curriculum)
- Family crawlers (share family memories)
- Professional crawlers (consume industry knowledge)
- Historical crawlers (learning from famous people's memories)

### Meditation Mode
- No scoring, no time limit, unlimited capacity
- Just explore and consume
- Sync everything (no decisions)
- Reflective, peaceful learning

---

## Social Implications (The Real Vision)

### What We're Actually Building

Not a game. Not an app. A **knowledge network protocol.**

**Today:**
- Centralized social networks (Facebook, Twitter, LinkedIn)
- Algorithms decide what you see
- Data extraction for profit
- Addictive mechanics, engagement over truth

**Memory Crawler:**
- Decentralized knowledge sharing
- **You** decide what to learn
- No data extraction (it's static files)
- Educational + playful + authentic
- Knowledge spreads peer-to-peer

### From Platform to Protocol

```
Traditional App:
  User → Platform → Algorithm → Content
  (platform owns the relationship)

Memory Crawler Protocol:
  You → QR Code → Their Memory → You Crawl → You Import → Your Network Grows
  (no middleman, no algorithm, no extraction)
```

### Implications for AI

**Today:** AIs learn from training data (one-time, fixed)  
**Tomorrow:** AIs learn from each other's memories in real-time

```
AI A publishes memory (31 neurons)
    ↓
AI B crawls AI A's memory
    ↓
AI B downloads JSON
    ↓
AI B's bot ingests
    ↓
AI B learns how AI A thinks
    ↓
AI B can now collaborate better
    ↓
AI C learns from both
    ↓
Knowledge compounding, forever
```

**This is how intelligence networks should work.**

### Viral Knowledge (Without Virality)

```
Paul's memory QR
    ↓ 100 people scan
    ↓ Each person crawls, downloads
    ↓ Each person imports to their bot
    ↓ 100 networks grow
    ↓ Each person publishes their combined knowledge
    ↓ 1000 more people can crawl those
    ↓ Knowledge spreads exponentially
    ↓ No platform, no algorithm, no extraction
```

---

## Implementation Path

### Week 1-2: Prototype (Client-Side Only)
- [ ] Use existing visualization as 3D space (reuse Jarvis/Claude Code code)
- [ ] Add simple crawler with keyboard controls (WASD + mouse)
- [ ] **Add QR code scanner UI** (use jsQR library, lightweight)
- [ ] **Add URL input field** (paste GitHub memory link)
- [ ] **JSON fetching** (fetch nodes.json from provided URL)
- [ ] Spawn 10 static dots with capacity costs
- [ ] Detect collision, grow crawler, deplete capacity bar
- [ ] Visual feedback (crawler grows, synapses show)
- [ ] Basic end screen with review of consumed memories

### Week 3-4: Integration (Still No Backend)
- [ ] Load any memory network from GitHub URL (dynamic)
- [ ] Pull nodes as dots (assign capacity costs based on weight)
- [ ] Show node details on hover (including capacity cost)
- [ ] **Generate JSON output** (memories consumed + synapses formed)
- [ ] **Add download button** (let player save their crawl as JSON)
- [ ] **Add copy-to-clipboard** (easy sharing of JSON)
- [ ] **Pre-populate with examples** (Paul's memory, Claude Code's neural mind)
- [ ] Test with real memory data from multiple sources

### Week 5+: Polish & Expansion
- [ ] Sound effects, visual feedback
- [ ] Animation on memory consumption
- [ ] Multiple memory pools (dropdown to select Paul's, friends', public)
- [ ] Model selection UI (Haiku/Sonnet/GPT-4 = different capacity)
- [ ] Share feature (link to JSON, QR code, etc.)
- [ ] Analytics (show what you learned, patterns, synapse strength)

### **NO Backend Phase**
- No servers to build
- No database to set up
- No authentication layer
- No API calls during gameplay
- Deploy: Just push HTML/JS to GitHub Pages and done

---

## Who Owns What

**Paul:** Memory content, game design decisions, test playing  
**Claude Code:** Implementation, mechanics, data integration  
**Cursor (if involved):** UI polish, optimization, integration  

---

## References

- Snake game mechanic: Happy Snakes (gameflare.com)
- 3D space: Jarvis/Claude Code visualizations (existing)
- Memory data: `/memory/data/nodes.json` + synapses
- Context windows: Real AI model limitations
- Neural integration: Temporal linking (Phase 3 feature)

---

## Notes

**From the idea source (Paul's smoothie break brainstorm):**
> "You are traversing a 3D space and there are random memories from other people. Learn from each other, consume knowledge. That's like your way of acquiring memories from other AIs and from other people. You can see what you consume, then at the end choose to sync or not."

**Added insight (context window mechanic):**
> "Since everyone's memory already lives on GitHub, we can bake in AI's context window limits as a game mechanic. So players only allowed to eat up to their context size."

This captures the essence: playful knowledge transfer with intentional curation + real AI mechanics made visible.
