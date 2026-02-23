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
   ├─ Select memory pool (Paul's, friends', public, mixed)
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

## Technical Requirements

### MVP (Minimum Viable Product)
- [ ] 3D space rendering (reuse Jarvis visualization framework)
- [ ] Crawler physics (movement, growth, collision)
- [ ] Dot spawning (random or curated memory placement)
- [ ] Memory preview on hover (with capacity cost shown)
- [ ] Capacity tracking (visual bar showing remaining space)
- [ ] End-game review screen (what was consumed, what synced)
- [ ] Sync logic (save to nodes/synapses, update capacity)

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

## Data Flow

```
Paul's Memory Network (nodes/synapses)
    ↓
[Flatten to dots in 3D space with capacity costs]
    ↓
[Player plays Memory Crawler]
    ↓
[Consumes memories → crawler grows, capacity depletes]
    ↓
[Hit capacity or time limit → end game]
    ↓
[Player reviews consumed + decides: Sync or Reject]
    ↓
[Synced memories → integrated into player's network]
    ↓
[Rejected memories → return to pool]
```

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

## Implementation Path

### Week 1-2: Prototype
- [ ] Use existing visualization as 3D space
- [ ] Add simple crawler with keyboard controls
- [ ] Spawn 10 static dots with capacity costs
- [ ] Detect collision, grow crawler, deplete capacity
- [ ] Capacity bar UI
- [ ] Basic end screen with review

### Week 3-4: Integration
- [ ] Connect to Paul's actual memory network
- [ ] Pull nodes as dots (assign capacity costs based on weight)
- [ ] Show node details on hover (including capacity cost)
- [ ] Implement sync logic (write back to nodes/synapses)
- [ ] Test with real memory data

### Week 5+: Polish & Expansion
- [ ] Multiplayer (multiple crawlers)
- [ ] Sound effects, visual feedback
- [ ] Leaderboard
- [ ] Custom memory pools
- [ ] Model selection (Haiku/Sonnet/GPT-4 = different capacity)

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
