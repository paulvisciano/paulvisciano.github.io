# Paul's Relationships Network Learning
**Date:** Feb 24 2026, 09:35-09:49 GMT+7  
**Source:** Paul's neural graph audit + real-time fixes

## The Problem
Paul's neural graph had 28 person nodes but almost no synapses connecting them back to him. The people existed in isolation—not connected to their subject (Paul himself).

This was the same error as the temporal nodes: good data structure, but missing the semantic link showing "these people are related TO Paul."

## The Fix: 27 Relationship Synapses
We created synapses from Paul to each person with appropriate relationship types and weights:

### Family (weight 0.98) — Closest Relationships
- **Mom** — Biological mother
- **Dad** — Biological father  
- **Brother** — Sibling

**Weight 0.98 = highest possible closeness. These relationships are foundational.**

### Travels-With (weight 0.92) — Journey Companions
- **Wouter** — Long-term travel companion
- **Khanh** — Travel partner
- **Mo** — Travel companion
- **Sandro** — Travel partner
- **Zacharias** — Travel companion

**Weight 0.92 = deep connection through shared movement and exploration.**

### Close-To (weight 0.90) — Deep Friends
- **Leo** — Close personal friend

**Weight 0.90 = friendships deeper than casual but not family.**

### Collaborates-With (weight 0.85) — Work & Project Partners
- **Boy** — Collaborator
- **Bartek** — Project partner
- **Sean** — Work partner
- **Ray** — Collaborator
- **Danie** — Volleyball/activity partner
- **Ash** — Crew member
- **Cat** — Volleyball crew
- **KJ** — Volleyball crew

**Weight 0.85 = strong connection through shared activity/work.**

### Knows (weight 0.75) — Friends & Acquaintances
- **Jeandel** — Friend
- **Irina** — Acquaintance
- **Maria** — Friend
- **Welli/Wellington** — *Actually should be 0.90* (close friend, data was initially underweighted)
- **Leigha** — Friend
- **Divine** — Acquaintance
- **Hallie** — Friend
- **Fairy** — Acquaintance

**Weight 0.75 = genuine relationships but less interaction frequency.**

### Reconnected-With (weight 0.80) — Former Connections
- **Bai** — Reunion relationship (met in Havana Aug 2025, attempted reconnection Feb 21 2026)

**Weight 0.80 = meaningful connection with complexity (history of disconnect).**

## Weight System Reasoning
Weights reflect:
- **Frequency of contact** — Higher weight = more regular interaction
- **Depth of relationship** — Family > close friends > collaborators > casual
- **Shared history** — Travel companions have deeper bonds than acquaintances
- **Emotional significance** — Not captured in frequency, but in weight

Example: Welli initially had weight 0.75 (knows), but Paul clarified he's a close friend. Updated to 0.90 because the relationship *quality* is high even if Paul hasn't shared detailed stories yet. The weight should reflect reality, not documentation completeness.

## Structural Insight
**This taught us:** Graph weight should map to relationship strength in real life, not frequency of discussion. A best friend you see rarely can still be 0.95 weight if the bond is deep.

## Current State
- **Total people nodes:** 27 (after merging duplicate Bai)
- **New synapses created:** 27 (Paul → each person)
- **Graph now shows:** Paul's complete social network as a connected system
- **Visualization:** Can filter by relationship type (family, travels-with, etc.)

## Future Extensions
Paul's people network could expand to show:
- **Connections between people** (e.g., "Wouter and Khanh are both travel-with relationships")
- **Activities shared with people** (e.g., "Danie, Ash, Cat, KJ → volleyball-crew activity")
- **Timeline of relationships** (when each connection started)
- **Frequency metrics** (how often in contact)
- **Geographic distribution** (where each person is now)
