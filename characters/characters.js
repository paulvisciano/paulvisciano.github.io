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
    id: "leo",
    name: "Leo aka Responsiblor",
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
    id: "hallie",
    name: "Hallie (Mighty Mouse)",
    role: "Friend",
    description: "Optimistic, social, warm presence. Part of the Bali friend trio.",
    bio: "Athletic, friendly, vibrant. Part of the Bali friend trio with Leigha and KJ.",
    avatar: "/characters/Hallie.png",
    pageImage: "/characters/Hallie.png",
    imageAlt: "Hallie - Mighty Mouse",
    tags: ["friend", "bali", "social"],
    relationship: "Supportive and joyful friend in Bali."
  },


  {
    id: "leigha",
    name: "Leigha",
    role: "Friend",
    description: "Warm, grounded, sociable. Part of the Bali friend trio.",
    bio: "Grounded, sweet, supportive. Part of the Bali friend trio with Hallie and KJ.",
    avatar: "/characters/Leigha.png",
    pageImage: "/characters/Leigha.png",
    imageAlt: "Leigha - Friend",
    tags: ["friend", "bali"],
    relationship: "Part of the Bali friend trio."
  },

  {
    id: "jamie",
    name: "Jamie",
    role: "Remote Collaborator",
    description: "Adventurous, playful remote collaborator.",
    bio: "Remote contributor to Urban Runner. Sends assets from abroad and appears in multiple episodes.",
    avatar: "/characters/Jamie.png",
    pageImage: "/characters/Jamie.png",
    imageAlt: "Jamie - Remote Collaborator",
    tags: ["collaborator", "remote"],
    relationship: "Remote collaborator helping expand the Urban Runner world."
  },

  {
    id: "tony",
    name: "Tony (Chelsea Fan)",
    role: "Recurring NPC",
    description: "Chill, observant, recurring ambient character at Amsterdam Café.",
    bio: "Chelsea fan. Recognizable recurring NPC in Bangkok. Cool, low-key presence.",
    avatar: "/characters/Tony.png",
    pageImage: "/characters/Tony.png",
    imageAlt: "Tony - Chelsea Fan",
    tags: ["npc", "recurring"],
    relationship: "Recurring ambient presence in Bangkok episodes."
  },

  {
    id: "zacharias-wellington",
    name: "Zacharias & Wellington",
    role: "Competitors / Friends",
    description: "Competitive, brotherhood energy. Weight-loss challenge, volleyball arcs.",
    bio: "Partners in the weight-loss challenge. Strong brotherhood energy and competitive drive.",
    avatar: "/characters/Zacharias.png",
    pageImage: "/characters/Zacharias.png",
    imageAlt: "Zacharias & Wellington",
    tags: ["competitors", "volleyball", "challenge"],
    relationship: "Partners in volleyball and life challenges."
  },

  {
    id: "aime",
    name: "Aime",
    role: "Romantic Interest",
    description: "Sweet, elegant, quirky (prefers sour mangos).",
    bio: "Romantic, thoughtful, graceful energy. Appears in the Chinatown stroll episode.",
    avatar: "/characters/Aime.png",
    pageImage: "/characters/Aime.png",
    imageAlt: "Aime - Romantic Interest",
    tags: ["romantic-interest"],
    relationship: "Romantic interest; memorable Chinatown stroll."
  },
  {
    id: "kj",
    name: "KJ",
    role: "Friend / Dance Partner",
    description: "Kind, confident, spiritually attuned. Met Paul in Ubud through a yoga retreat.",
    bio: "Born in Houston, raised in Austin. Travels globally for Ayurvedic retreats. Magical dancer with bold playful energy. Dreams of performing on stage.",
    avatar: "/characters/KJ.png",
    pageImage: "/characters/KJ.png",
    imageAlt: "KJ - Friend",
    tags: ["friend", "bali", "dance", "spiritual"],
    relationship: "Electric connection in Ubud. Powerful dance-floor chemistry."
  },

  
];

// Character comic book configuration
window.characterComicBook = {
  id: "characters-comic-book",
  title: "Character Bible",
  description: "Meet all the characters in Paul's life story",
  cover: "/characters/comic-book/cover.png",
  pages: window.characters.map((character, index) => ({
    number: index + 1,
    character: character.id,
    image: character.pageImage,
    alt: character.name
  })),
  isComic: true
};
