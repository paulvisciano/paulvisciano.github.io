// characters.js - Full Character Bible for the comic book

window.characters = [
  {
    id: "paul",
    name: "Paul",
    role: "Main Character / Protagonist",
    description: "Urban Runner founder. Embodies the 4D life-documentation philosophy.",
    bio: "Confident minimalist traveler with a 'world in 60 lbs.' aesthetic. Explorer, digital nomad, intuitive decision-maker, trusted advisor to strangers, emotionally aware, disciplined yet spontaneous.",
    avatar: "/characters/Paul.png",
    pageImage: "/characters/Paul.png",
    imageAlt: "Paul - Urban Runner",
    tags: ["protagonist", "explorer", "digital-nomad"],
    relationship: "Protagonist and narrator"
  },
  {
    id: "greta",
    name: "Mom",
    role: "Mother / Matriarch",
    description: "Engineer, massage therapist, caregiver. A total badass who raised Paul and David.",
    bio: "Born in 1956. Has endured immense hardship yet remains a shining light. Stylish, strong, nurturing, endlessly supportive. Lives in Clearwater, FL.",
    avatar: "/characters/Mom.png",
    pageImage: "/characters/Mom.png",
    imageAlt: "Greta - Mom",
    tags: ["family", "mother", "anchor"],
    relationship: "The matriarchal anchor in Paul's life. Source of strength, love, and resilience."
  },
  {
    id: "brother",
    name: "Brother",
    role: "Family",
    description: "Paul’s older brother and one of the most important foundational relationships in his life.",
    bio: "Steady, grounded, and always supportive. Paul’s older brother has been a constant presence throughout every chapter of life. Protective but chill, logical yet funny, he brings a strong family anchor to Paul’s journey. Shares roots in Bulgaria and Chicago before life paths diverged. Represents the importance of family threads that stay intact across time and distance.",
    avatar: "/characters/Brother.png",
    pageImage: "/characters/Brother.png",
    imageAlt: "Paul’s Brother",
    tags: ["family", "brother", "roots"],
    relationship: "Older brother — lifelong anchor, shared childhood, shared history."
  },
  {
    id: "wellington",
    name: "Welli",
    role: "Friend / Business Leader",
    description: "Dominican entrepreneur, bar/restaurant operator, future St. Pete mayor energy.",
    bio: "Multi-business owner in St. Pete. Rose from Ubering to operating multiple venues. Dog dad to Duke. Direct, sharp eye for detail, inspiring growth.",
    avatar: "/characters/Welli.png",
    pageImage: "/characters/Welli.png",
    imageAlt: "Welli",
    tags: ["friend", "entrepreneur", "volleyball"],
    relationship: "Lifelong friend; part of the brotherhood with Zacharias."
  },
  {
    id: "leo",
    name: "Leo",
    nickname: "Responsiblor",
    role: "Lifelong Friend / Mentor Figure",
    description: "Older, mature, driven, tech-loving friend. Met through volleyball in Chicago.",
    bio: "Filipino. Organizer of the Mafia volleyball group. Splits time between St. Pete and the Philippines. Giving, caring, methodical. Deeply influential in Paul's life.",
    avatar: "/characters/Leo.png",
    pageImage: "/characters/Leo.png",
    imageAlt: "Leo - Responsiblor",
    tags: ["friend", "volleyball", "mentor", "philippines"],
    relationship: "Lifelong friend who helped shape Paul's adult years."
  },
  {
    id: "mo",
    name: "Mo",
    role: "Close Friend / Brother",
    description: "One of Paul's closest long-term friends. Met in St. Pete through volleyball.",
    bio: "Born in Pakistan. Ex-professional rugby player. Calm, grounded aesthetic. Kind, forgiving, patient. Devoted father of two. Represents loyalty, brotherhood, and depth.",
    avatar: "/characters/Mo.png",
    pageImage: "/characters/Mo.png",
    imageAlt: "Mo - Close Friend",
    tags: ["friend", "volleyball", "father", "loyalty"],
    relationship: "Recurring anchor across cities and life chapters."
  },
  {
    id: "zacharias",
    name: "Zacharias",
    role: "Close Friend / Brother-In-Arms",
    description: "Programmer, volleyball player, charismatic thinker, lifelong friend of Welli.",
    bio: "Funny, charming, logical, and ambitious. Zacharias is a lifelong friend of Wellington and an essential part of Paul's Florida chapter. Originally from New York, he chose to relocate to St. Pete after falling in love with the community. A talented programmer and explosive volleyball player, he invited Paul to play the Mexico Tournament two years in a row. Known for his sharp humor, strategic mind, and smooth charisma. Currently dating Victoria. Comes from a political lineage and carries that part-politician charm.",
    avatar: "/characters/Zacharias.png",
    pageImage: "/characters/Zacharias.png",
    imageAlt: "Zacharias - Close Friend",
    origin: "New York, USA",
    currentHome: "St. Petersburg, Florida",
    tags: ["friend", "volleyball", "programmer", "thinker", "charming"],
    relationship: "Close friend of Paul. Volleyball partner for multiple Mexico tournaments; lifelong brotherhood with Wellington."
  },
  {
    id: "sandro",
    name: "Sandro",
    role: "Friend / Volleyball Brother",
    description: "High-energy, joyful presence on and off the sand.",
    bio: "Volleyball brother from the St. Pete crew. Known for big smiles, big swings, and big heart energy when the squad links up.",
    avatar: "/characters/Sandro.png",
    pageImage: "/characters/Sandro.png",
    imageAlt: "Sandro - Volleyball Brother",
    tags: ["friend", "volleyball", "st-pete"],
    relationship: "Part of the extended volleyball family that shows up across chapters."
  },
  {
    id: "hallie",
    name: "Hallie",
    nickname: "Mighty Mouse",
    role: "Friend",
    description: "Optimistic, social, warm presence. Fairy energy. Part of the Bali friend trio.",
    bio: "Yoga teacher turned studio manager overseeing 100+ people. Sweet, kind, grounded, recently engaged. Dreams of owning a studio and being a mom.",
    avatar: "/characters/Hallie.png",
    pageImage: "/characters/Hallie.png",
    imageAlt: "Hallie - Mighty Mouse",
    tags: ["friend", "bali", "yoga"],
    relationship: "Supportive and joyful friend; Bali reunion during Leigha's retreat."
  },
  {
    id: "leigha",
    name: "Leigha",
    role: "Friend",
    description: "Warm, magnetic, and grounded — equal parts nurturer and free spirit.",
    bio: "Yoga teacher, nurse, photographer, and community builder. Organizer and host of the Bali Yoga Retreat. Deeply rooted in beach-town energy, with a bohemian aesthetic and a natural ability to bring people together.",
    avatar: "/characters/Leigha.png",
    pageImage: "/characters/Leigha.png",
    imageAlt: "Leigha - Friend",
    tags: ["friend", "bali", "yoga", "boho", "retreats", "beach-town"],
    relationship: "Retreat host and close friend; part of the Bali friend trio with Hallie.",
    traits: [
      "bubbly",
      "empathetic",
      "confident",
      "expressive",
      "community-oriented"
    ],
    archetype: "The Connector"
  },
  {
    id: "jamie",
    name: "Jamie",
    role: "Remote Collaborator",
    description: "Adventurous, playful remote collaborator.",
    bio: "Remote contributor to Urban Runner. Sends assets from abroad and appears in multiple episodes.",
    // avatar/pageImage will be added once artwork is ready
    tags: ["collaborator", "remote"],
    relationship: "Remote collaborator expanding the UR world."
  },
  {
    id: "tony",
    name: "Tony (Chelsea Fan)",
    role: "Recurring NPC",
    description: "Chill, observant, recurring ambient character at Amsterdam Café.",
    bio: "Chelsea fan. Recognizable recurring NPC in Bangkok. Cool, low-key presence.",
    // avatar/pageImage will be added once artwork is ready
    tags: ["npc", "recurring"],
    relationship: "Recurring ambient presence in Bangkok episodes."
  },
  {
    id: "aime",
    name: "Aime",
    role: "Romantic Interest",
    description: "Sweet, elegant, quirky (prefers sour mangos).",
    bio: "Romantic, thoughtful, graceful energy. Appears in the Chinatown stroll episode.",
    // avatar/pageImage will be added once artwork is ready
    tags: ["romantic-interest"],
    relationship: "Romantic interest; memorable Chinatown stroll."
  },
  {
    id: "kj",
    name: "KJ",
    role: "Friend / Dance Partner",
    description: "Kind, confident, spiritually attuned. Magnetic dancer with bold energy.",
    bio: "Born in Houston, raised in Austin. Works in Ayurvedic retreats. Spiritual, artistic, expressive. Known for the 'twerk moment' in Ubud.",
    avatar: "/characters/KJ.png",
    pageImage: "/characters/KJ.png",
    imageAlt: "KJ - Friend",
    tags: ["friend", "bali", "dance", "spiritual"],
    relationship: "Electric connection in Ubud. Powerful dance-floor chemistry."
  },
  {
    id: "thai-dragon",
    name: "Thai Dragon",
    role: "Friend / Thailand Arc Character",
    description: "Mysterious, calm, elegant presence from Thailand.",
    bio: "Follower of the Urban Runner comic. Sleek look, confident energy, iconic black dress and gold pendant. Requested her own comic entry.",
    avatar: "/characters/ThaiDragon.png",
    pageImage: "/characters/ThaiDragon.png",
    imageAlt: "Thai Dragon",
    tags: ["friend", "thailand", "dragon"],
    relationship: "Symbolic character of the Thailand arc."
  }
];

window.characterComicBook = {
  id: "characters-comic-book",
  title: "Character Bible",
  description: "Meet all the characters in Paul's life story",
  cover: "/characters/cover.png",
  pages: window.characters
    .filter(c => !!c.pageImage) // Only include characters with a defined image
    .map((c, i) => ({
    number: i + 1,
    character: c.id,
    image: c.pageImage,
    alt: c.name
  })),
  isComic: true
};
