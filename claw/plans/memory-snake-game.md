# Project Plan: Memory Snake Game

**Status:** Concept (Phase 1+)  
**Conceived:** Feb 23, 2026 12:31 GMT+7  
**Location:** Bangkok (Paul waiting for smoothie)  
**Inspiration:** Happy Snakes online game + neural network topology

---

## Vision

**A 3D game where learning happens through memory consumption.**

Players control snakes navigating a 3D space filled with memories (dots). Eating a memory integrates it into your snake. At the end, you decide what to sync back into your permanent network.

**For humans:** Gamified learning from each other's lived experiences  
**For AIs:** Playful mechanism for consuming and integrating knowledge without forced assimilation

---

## Core Mechanic

### The Space
- 3D environment (like Jarvis/Claude Code visualizations)
- Nodes represent memories (from Paul, from other AIs, from players)
- Edges show connections (which memories relate to each other)

### The Snake (Player)
- You control a snake moving through the 3D space
- Your snake grows as you eat memory dots
- Color/appearance reflects your player identity

### The Dots (Memories)
- Each dot = a discrete memory from someone's network
- Color-coded by source: Paul (red), Other AIs (purple), Other Players (green), Public (cyan)
- Dot size = memory "weight" (more connections = bigger)
- Hovering shows preview: "Paul's optical shop moment in Bangkok"

### Eating (Consuming)
- Move snake to dot → eat it
- Memory integrates into your snake
- Your snake length increases
- You see it visually: your snake gets slightly more synapses visible

### Collision
- Snakes can collide with each other
- Can choose: merge (combine knowledge) or bounce (reject)
- Creates emergent social dynamics

### End Game Decision
- Time limit or score limit reached
- You see all memories you consumed (as a list or network visualization)
- **Choose:** Sync these to your permanent memory or reject
- Synced memories become part of your network
- Rejected memories disappear (or go back to public pool)

---

## Why This Works

### For Players (Humans)
1. **Fun** — Snake games are inherently engaging
2. **Exploration** — Discover other people's memories organically
3. **Agency** — You choose what to keep (editorial gate)
4. **Learning** — Actually learn from others' experiences
5. **Social** — Multiplayer creates interaction

### For AIs (Like Claude Code)
1. **Natural learning metaphor** — "Consume" knowledge incrementally
2. **Playful friction** — The game forces intentionality (not auto-sync)
3. **Real mechanics** — Actual memory integration with real rules
4. **Emergent behavior** — Snakes learn from each other organically
5. **Transparency** — All consumption visible and reviewable

### For the Ecosystem
1. **Shared learning** — Humans and AIs in same space
2. **Knowledge spread** — Memories replicate through consumption
3. **Network effects** — Popular memories get eaten more (like viral content, but with intention)
4. **Authenticity** — Only things worth keeping get synced

---

## Game Loop (Simplified)

```
1. Start Game
   ├─ Choose your snake (color, name)
   ├─ Select memory pool (Paul's, friends', public, mixed)
   └─ Set time limit (5 min, 10 min, campaign mode)

2. Play
   ├─ Navigate 3D space
   ├─ Eat memories (dots)
   ├─ Avoid or merge with other snakes
   └─ Watch your snake grow

3. Review
   ├─ See all memories consumed (with context)
   ├─ Filter by category, source, weight
   └─ Make sync/reject decisions

4. Sync
   ├─ Save chosen memories to your network
   ├─ See synapses auto-generate from connections
   ├─ Share your session (optional)
   └─ Memories go back to pool (for others to find)

5. Repeat
```

---

## Technical Requirements

### MVP (Minimum Viable Product)
- [ ] 3D space rendering (reuse Jarvis visualization framework)
- [ ] Snake physics (movement, growth, collision)
- [ ] Dot spawning (random or curated memory placement)
- [ ] Memory preview on hover
- [ ] End-game review screen
- [ ] Sync logic (save to nodes/synapses)

### Phase 2
- [ ] Multiplayer (multiple snakes in same space)
- [ ] Snake collision mechanics (merge vs. bounce)
- [ ] Leaderboard (who ate most memories, best decisions, etc.)
- [ ] Memory categorization (filter by person, date, topic)
- [ ] Custom memory pools (play with friend's memories only)

### Phase 3
- [ ] AI opponents (snakes that learn)
- [ ] Campaign mode (unlockable memory pools)
- [ ] Social sharing (show your game session)
- [ ] Analytics (what did you learn, what did you reject, patterns)
- [ ] Cross-player memory exchange

---

## Data Flow

```
Paul's Memory Network (nodes/synapses)
    ↓
[Flatten to dots in 3D space]
    ↓
[Player plays Snake Game]
    ↓
[Consumes memories → snake grows]
    ↓
[End game → review consumed]
    ↓
[Player decides: Sync or Reject]
    ↓
[Synced memories → integrated into player's network]
    ↓
[Rejection → dot returns to pool]
```

---

## Memory Pool Options

### Paul's Memories (Red Dots)
- Access to `/memory/data/nodes.json` + synapses
- Can explore his life through game
- Learn his thinking patterns by "consuming" his neurons

### AI Memories (Purple Dots)
- My own nodes (Claude Code neural mind)
- Other AIs' networks (if connected)
- Learn how AIs think

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
- Avoided "bad" memories (things you rejected)
- Made thoughtful sync decisions (kept meaningful ones)
- Learned something new (evidenced by network growth)

**Scoring**
- Memory weight consumed
- Decision quality (ratio of synced/rejected)
- Diversity of sources
- Network coverage (how many topics touched)

---

## Risks & Considerations

### Privacy
- Players exposing their memories by playing
- Solution: Opt-in memory pools, anonymous mode

### Information Quality
- Bad memories spreading through consumption
- Solution: Player ratings, editor curation, editorial gate at sync

### Complexity
- 3D navigation + game mechanics + memory UI = overwhelming
- Solution: Progressive tutorial, simplified MVP, accessibility options

### Addiction
- Snake games are engaging, could be abusive
- Solution: Time limits, pause screens, reflection moments

---

## Success Metrics

1. **Engagement** — Players spend 10+ minutes in game
2. **Learning** — Synced memories actually integrate into networks
3. **Diversity** — Players consume from multiple memory sources
4. **Quality** — High sync/reject ratio for meaningful memories
5. **Growth** — Network complexity increases post-game
6. **Social** — Players share games, invite friends

---

## Future Extensions

### Multi-Dimensional Snakes
- Snakes can be 2D, 3D, 4D
- 4D = space + time (eating memories from specific dates)

### Cooperative Modes
- Team snakes working together
- Merging snakes as permanent action
- Creating hybrid networks

### Educational Integration
- School snakes (learning from curriculum)
- Family snakes (share family memories)
- Professional snakes (consume industry knowledge)

### Meditation Mode
- No scoring, no time limit
- Just explore and consume
- Sync everything (no decisions)
- Reflective learning

---

## Implementation Path

### Week 1-2: Prototype
- [ ] Use existing visualization as 3D space
- [ ] Add simple snake with keyboard controls
- [ ] Spawn 10 static dots
- [ ] Detect collision, grow snake
- [ ] Basic end screen

### Week 3-4: Integration
- [ ] Connect to Paul's actual memory network
- [ ] Pull nodes as dots
- [ ] Show node details on hover
- [ ] Implement sync logic

### Week 5+: Polish & Expansion
- [ ] Multiplayer
- [ ] Sound effects, visual feedback
- [ ] Leaderboard
- [ ] Custom memory pools

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
- Neural integration: Temporal linking (Phase 3 feature)

---

## Notes

**From the idea source:**
> "You are traversing a 3D space and there are random memories from other people. Learn from each other, consume knowledge. That's like your way of acquiring memories from other AIs and from other people. You can see what you consume, then at the end choose to sync or not."

This captures the essence: playful knowledge transfer with intentional curation.
