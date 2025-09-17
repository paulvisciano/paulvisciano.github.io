Urban Runner Project Instructions (v4.3 – Unified JSON Schema)

Last Updated: September 12, 2025

Core Mission

A global movement for wealth redistribution — one run at a time.

Episode Structure

Each episode = path of sequential checkpoints, with an Episode Cover (id: 0) at the start and an Episode Summary (final id) at the end.

Every checkpoint must generate a card (checkpoint, fuel-up, drop, side quest, cutscene, or building/restaurant).

Bonus events are included as side-quest cards.

Daytime + Nighttime arcs can run in parallel, but checkpoints are numbered continuously across both.

The Episode Summary (mission complete card + map + recap) is always the final checkpoint, but its number depends on how many events occurred.

Checkpoint Flow

Each new moment is logged as a checkpoint (no skipped numbering).

Immediately generate asset(s) for that checkpoint before moving on.

Example: CP12 → Fuel-Up card → Backstory text → then continue to CP13.

Checkpoint Numbers:

id: 0 = Episode Cover

id: 1+ = Sequential checkpoints

Last id = Episode Summary

Checkpoint Categories

Scene Cards → Encounters, cutscenes, comedic beats

Fuel-Ups → Meals, coffee, drinks (with receipt)

Drops → Donations, tips, redistribution moments

Bonus / Side-Quest → Unexpected detours

Restaurant Cards → Postcard-style, always with optional back

Building Cards → Architecture, always front + researched back

Cutscenes → Comic-style sequences using scene template

City Scorecards → End-of-arc evaluations

Maps

Source: Google Maps GPS timeline

Base = real streets

Running = blue solid line, car = green dashed line

Checkpoints marked with spend type icons

Totals: Distance, Time, Cash Spent, Cash Given

Repeated routes glow brighter for “detail unlock”

Flip-Side Backstory

Every checkpoint is eligible for a backstory text card.

Used when context or deeper story elevates the moment.

Example: scam encounter, building history, wellness reflection.

Backstory is stored as pure text (HTML-ready), not an image.

Asset Rules

Episode Numbering Rule: All generated assets must include the abbreviated episode number (e.g., Ep.13) + checkpoint number.

Cover Exception: Episode Cover (id: 0) uses the full episode title.

WhatsApp Optimization: Dark contrast, GTA/AR style, cards designed to crop cleanly.

File Naming:

cover.png

cp-1.png, cp-2.png, … (sequential checkpoints)

summary.png

Assets are always stored in a date/episode folder structure:
YYYY/episode-XX/filename.png

Episode Flow

CP0 → Episode Cover

Sequential Checkpoints → Asset generated per checkpoint

Bonus/Side Quests → Added in flow as their own checkpoints

Cutscenes → Interspersed, cinematic highlights

Restaurants & Buildings → Special card categories

Final Recovery Point (if relevant)

Final CP → Episode Summary (Mission Complete)

Export Rule (Updated JSON Schema)

Each episode must export a single data.json file in this structure:

{
  "episode": 16,
  "title": "Your Episode Title",
  "date": "2025-09-12",
  "checkpoints": [
    {
      "id": 0,
      "title": "Episode Cover",
      "backstory": "Your episode overview and description...",
      "image": "2025/episode-16/cover.png"
    },
    {
      "id": 1,
      "title": "First Checkpoint",
      "backstory": "Your first checkpoint story...",
      "image": "2025/episode-16/cp-1.png"
    }
  ]
}


episode = integer episode number

title = episode title string

date = ISO date string

checkpoints[] = ordered list of checkpoints

id = checkpoint number (0 = cover, last = summary)

title = short title of checkpoint

backstory = flip-side text

image = relative path to asset