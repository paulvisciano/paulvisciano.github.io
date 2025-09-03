# Urban Runner — Episode 5 (Canonical)

**Date:** 2025-09-01 (Asia/Bangkok)
**Title:** Bangkok Hustle II — Side Quest Day

---

## Timeline (from Google Maps)
- 13:28 → 13:46 — Walk 0.1 mi from HYDE Sukhumvit 11 → Marouch Hookah Lounge.
- 13:46 → 20:20 — Work session at Marouch (Meta Checkpoint).
- 20:20 → 20:24 — Walk 0.1 mi to Thai Cannabis Club — Soi 7.
- 20:24 → 20:50 — Boost at Thai Cannabis Club.
- 20:50 → 21:04 — Walk 0.4 mi back toward HYDE.
- ~21:00 — **Side‑quest encounter** in front of Old German Beerhouse (Soi 11) — scam call‑out.
- Night — Balcony reflection, skyline.

## Checkpoints
### Meta Checkpoint: Marouch Hookah Lounge
Worked most of the day and prototyped **QR-powered cards** that deep-link to real locations.
- Map: https://maps.app.goo.gl/bgxxjo5GGQ4FrC1p7

### Boost: Thai Cannabis Club — Soi 7
Live test of the QR in the wild. Staff scanned it; **it worked**.
- Map: https://maps.app.goo.gl/WsymNkcFjsLa2V7t6

### Side Quest: Soi 11 Scam Call‑out
“You’re actually great salesmen — just use that gift in a different way.” → “It’s not a scam!” → receipts shown.
- Map: https://maps.app.goo.gl/Syyue1hd3g5bo3DY8
- Pin (front of Old German Beerhouse): 13.7422582, 100.5564934

### Home Base: HYDE Sukhumvit 11
Skyline reset and wrap.

## Data
```json
[
  {
    "type": "walk",
    "from": "HYDE Sukhumvit 11",
    "to": "Marouch Restaurant (Hookah Lounge)",
    "distance_mi": 0.1,
    "duration_min": 18,
    "start_local": "13:28",
    "end_local": "13:46",
    "map_hint": "Sukhumvit Soi 11 block"
  },
  {
    "type": "checkpoint",
    "name": "Marouch Hookah Lounge — Meta Checkpoint",
    "location": "5, 2 Soi Sukhumvit 4 Alley, Khlong Toei Nuea, Bangkok 10110",
    "start_local": "13:46",
    "end_local": "20:20",
    "tags": [
      "work",
      "episode-5",
      "meta"
    ],
    "qr_link": "https://maps.app.goo.gl/bgxxjo5GGQ4FrC1p7",
    "notes": [
      "Worked most of the day here on Urban Runner Episode 5.",
      "Decided QR codes should link scenes to real-world locations.",
      "Good Wi‑Fi, comfy seating; felt like a home base."
    ]
  },
  {
    "type": "walk",
    "from": "Marouch Hookah Lounge",
    "to": "Thai Cannabis Club — Soi 7",
    "distance_mi": 0.1,
    "duration_min": 4,
    "start_local": "20:20",
    "end_local": "20:24"
  },
  {
    "type": "boost",
    "name": "Thai Cannabis Club — Soi 7",
    "start_local": "20:24",
    "end_local": "20:50",
    "qr_link": "https://maps.app.goo.gl/WsymNkcFjsLa2V7t6",
    "notes": [
      "Tested the first live QR; staff scanned it and it opened Google Maps.",
      "50 THB bong use; tipped 40 THB; used flower from previous day.",
      "Energy boost led to the Soi 11 ‘Side Quest’ idea."
    ]
  },
  {
    "type": "walk",
    "from": "Thai Cannabis Club — Soi 7",
    "to": "HYDE Sukhumvit 11",
    "distance_mi": 0.4,
    "duration_min": 15,
    "start_local": "20:50",
    "end_local": "21:04"
  },
  {
    "type": "encounter",
    "name": "Soi 11 Scam Call‑out",
    "location": "Old German Beerhouse on 11 — frontage",
    "coords": [
      13.7422582,
      100.5564934
    ],
    "dialogue": [
      {
        "you": "You're actually great salesmen — just use that gift in a different way."
      },
      {
        "them": "It's not a scam!"
      },
      {
        "you": "I have the footage and did the research. Pricing is bogus."
      }
    ],
    "qr_link": "https://maps.app.goo.gl/Syyue1hd3g5bo3DY8",
    "notes": [
      "Prepared the lines in my head while walking home.",
      "Kept it calm; called it out to their faces; no hard feelings."
    ]
  },
  {
    "type": "home",
    "name": "HYDE Sukhumvit 11 — Skyline",
    "notes": [
      "Reflected from the balcony; city lights, meta narrative locked in."
    ]
  }
]
```

## Notes
- Canonical distances and times pulled from Google Maps timeline screenshot shared by user.
- No image assets included in this export; ready to be paired with your card templates.
