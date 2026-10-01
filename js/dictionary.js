/**
 * Descriptive Text Vocabulary Dictionary & Scrabble Letter Rules
 * Standardized for Junior High School (SMP Kelas 7) English Curriculum
 */

const SCRABBLE_LETTER_SCORES = {
  'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1,
  'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
  'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
};

// Standard English Scrabble Tile Distribution for drawing tiles
const SCRABBLE_LETTER_DISTRIBUTION = [
  ...'AAAAAAAAA', ...'BB', ...'CC', ...'DDDD', ...'EEEEEEEEEEEE',
  ...'FF', ...'GGG', ...'HH', ...'IIIIIIIII', ...'J',
  ...'K', ...'LLLL', ...'MM', ...'NNNNNN', ...'OOOOOOOO',
  ...'PP', ...'Q', ...'RRRRRR', ...'SSSS', ...'TTTTTT',
  ...'UUUU', ...'VV', ...'WW', ...'X', ...'YY', ...'Z'
];

// Rich Vocabulary specifically for 7th Grade Descriptive Text
const DESCRIPTIVE_VOCABULARY = [
  // --- DESCRIBING PEOPLE ---
  {
    word: "KIND",
    category: "people",
    partOfSpeech: "Adjective",
    translation: "Baik hati / ramah",
    definition: "Having or showing a friendly, generous, and considerate nature.",
    example: "My English teacher is very kind and always helps students.",
    clue: "An adjective for a person who cares and is always nice to others."
  },
  {
    word: "SMART",
    category: "people",
    partOfSpeech: "Adjective",
    translation: "Pintar / cerdas",
    definition: "Having or showing a quick-witted intelligence.",
    example: "Rani is a smart student who loves solving math puzzles.",
    clue: "Having quick intelligence and bright thinking."
  },
  {
    word: "BRAVE",
    category: "people",
    partOfSpeech: "Adjective",
    translation: "Berani",
    definition: "Ready to face and endure danger or pain; showing courage.",
    example: "The brave firefighter saved the little kitten from the tree.",
    clue: "Showing courage when facing danger or challenges."
  },
  {
    word: "TALL",
    category: "people",
    partOfSpeech: "Adjective",
    translation: "Tinggi",
    definition: "Of great or more than average height.",
    example: "My older brother is tall and plays basketball every weekend.",
    clue: "Having greater height than average."
  },
  {
    word: "POLITE",
    category: "people",
    partOfSpeech: "Adjective",
    translation: "Sopan / santun",
    definition: "Having or showing behavior that is respectful and considerate of other people.",
    example: "He always greets his elders with a polite smile.",
    clue: "Showing good manners and respectful behavior."
  },
  {
    word: "HONEST",
    category: "people",
    partOfSpeech: "Adjective",
    translation: "Jujur",
    definition: "Free of deceit and untruthfulness; sincere.",
    example: "An honest person will always tell the real truth.",
    clue: "Always telling the truth and never cheating."
  },
  {
    word: "SLIM",
    category: "people",
    partOfSpeech: "Adjective",
    translation: "Ramping / langsing",
    definition: "Gracefully thin; slender body shape.",
    example: "She has a slim posture because of regular yoga practice.",
    clue: "Gracefully thin and slender in physical appearance."
  },
  {
    word: "YOUNG",
    category: "people",
    partOfSpeech: "Adjective",
    translation: "Muda",
    definition: "Having lived or existed for only a short time.",
    example: "The young boy is learning how to ride a bicycle.",
    clue: "In the early stage of life, not old."
  },
  {
    word: "FRIENDLY",
    category: "people",
    partOfSpeech: "Adjective",
    translation: "Ramah / bersahabat",
    definition: "Kind and pleasant; acting like a warm friend.",
    example: "Our new neighbor is extremely friendly and hospitable.",
    clue: "Pleasant, welcoming, and easy to talk with."
  },
  {
    word: "CHEERFUL",
    category: "people",
    partOfSpeech: "Adjective",
    translation: "Ceria / riang",
    definition: "Noticeably happy and optimistic.",
    example: "Her cheerful laughter made everyone in the room smile.",
    clue: "Noticeably full of joy, happiness, and high spirits."
  },

  // --- DESCRIBING ANIMALS ---
  {
    word: "FURRY",
    category: "animals",
    partOfSpeech: "Adjective",
    translation: "Berbulu lebat / lembut",
    definition: "Covered with soft and thick fur.",
    example: "My Persian rabbit is cute, white, and very furry.",
    clue: "Covered with thick, soft animal hair."
  },
  {
    word: "FIERCE",
    category: "animals",
    partOfSpeech: "Adjective",
    translation: "Ganas / garang",
    definition: "Having or displaying an intense or aggressive aggressiveness.",
    example: "The fierce tiger protected its territory in the jungle.",
    clue: "Intense, wild, and powerful predator behavior."
  },
  {
    word: "CUTE",
    category: "animals",
    partOfSpeech: "Adjective",
    translation: "Lucu / menggemaskan",
    definition: "Attractive in a pretty or endearing way.",
    example: "Look at that cute puppy sleeping on the rug!",
    clue: "Adorable, charming, and endearing to look at."
  },
  {
    word: "TAME",
    category: "animals",
    partOfSpeech: "Adjective",
    translation: "Jinak",
    definition: "Not dangerous or frightened of people; domesticated.",
    example: "The sheep in the petting zoo are completely tame.",
    clue: "Domesticated and gentle around humans; opposite of wild."
  },
  {
    word: "SHARP",
    category: "animals",
    partOfSpeech: "Adjective",
    translation: "Tajam",
    definition: "Having an edge or point that is able to cut or pierce.",
    example: "An eagle has sharp claws to catch fish from the river.",
    clue: "Able to pierce or cut easily, like claws or fangs."
  },
  {
    word: "TAIL",
    category: "animals",
    partOfSpeech: "Noun",
    translation: "Ekor",
    definition: "The hindmost part of an animal, especially when prolonged beyond the trunk.",
    example: "The excited dog wagged its tail rapidly.",
    clue: "The rear part extending from the body of a cat, dog, or monkey."
  },
  {
    word: "BEAK",
    category: "animals",
    partOfSpeech: "Noun",
    translation: "Paruh burung",
    definition: "A bird's horny projecting jaws; bill.",
    example: "The parrot uses its curved beak to crack hard sunflower seeds.",
    clue: "The hard, projecting mouthparts of a bird."
  },
  {
    word: "PAW",
    category: "animals",
    partOfSpeech: "Noun",
    translation: "Kaki / cakar binatang",
    definition: "An animal's foot having claws or pads.",
    example: "The kitten cleaned its front paw with its tongue.",
    clue: "The soft padded foot of a cat, dog, or bear."
  },
  {
    word: "GENTLE",
    category: "animals",
    partOfSpeech: "Adjective",
    translation: "Lembut / jinak",
    definition: "Having or showing a mild, kind, or tender temperament.",
    example: "Elephants are large but often remarkably gentle creatures.",
    clue: "Mild, calm, and peaceful in temper."
  },
  {
    word: "SWIFT",
    category: "animals",
    partOfSpeech: "Adjective",
    translation: "Cepat / gesit",
    definition: "Moving or capable of moving with great speed.",
    example: "Cheetahs are famous for their swift running ability.",
    clue: "Moving with incredible speed and agility."
  },

  // --- DESCRIBING PLACES ---
  {
    word: "CLEAN",
    category: "places",
    partOfSpeech: "Adjective",
    translation: "Bersih",
    definition: "Free from dirt, marks, or unwanted matter.",
    example: "Our classroom is always neat, shiny, and clean.",
    clue: "Free from dirt, trash, or dust."
  },
  {
    word: "COZY",
    category: "places",
    partOfSpeech: "Adjective",
    translation: "Nyaman / hangat",
    definition: "Giving a feeling of comfort, warmth, and relaxation.",
    example: "My bedroom is a cozy place to read books on rainy days.",
    clue: "Warm, comfortable, and pleasant to stay in."
  },
  {
    word: "CROWDED",
    category: "places",
    partOfSpeech: "Adjective",
    translation: "Ramai / padat",
    definition: "Full of people, leaving little or no room for movement.",
    example: "The traditional market is very crowded on Sunday mornings.",
    clue: "Full of many people with little empty space."
  },
  {
    word: "SPACIOUS",
    category: "places",
    partOfSpeech: "Adjective",
    translation: "Luas / lapang",
    definition: "Having ample space; roomy.",
    example: "The school hall is spacious enough for five hundred students.",
    clue: "Having large and generous room to move around."
  },
  {
    word: "HISTORIC",
    category: "places",
    partOfSpeech: "Adjective",
    translation: "Bersejarah",
    definition: "Famous or important in history.",
    example: "Borobudur is a historic monument in Central Java.",
    clue: "Having great importance in past events or heritage."
  },
  {
    word: "ANCIENT",
    category: "places",
    partOfSpeech: "Adjective",
    translation: "Kuno / purba",
    definition: "Belonging to the very distant past and no longer in existence.",
    example: "They explored the ancient temple ruins in the valley.",
    clue: "Very old, dating back hundreds or thousands of years."
  },
  {
    word: "QUIET",
    category: "places",
    partOfSpeech: "Adjective",
    translation: "Tenang / sunyi",
    definition: "Making little or no noise; peaceful.",
    example: "The public library is a quiet sanctuary for studying.",
    clue: "Peaceful with no loud noises or disturbances."
  },
  {
    word: "BREEZY",
    category: "places",
    partOfSpeech: "Adjective",
    translation: "Berangin sejuk",
    definition: "Pleasantly windy and fresh.",
    example: "We enjoyed the breezy atmosphere on Kuta Beach.",
    clue: "Having pleasant, cool, and gentle winds."
  },
  {
    word: "TIDY",
    category: "places",
    partOfSpeech: "Adjective",
    translation: "Rapi",
    definition: "Arranged neatly and in order.",
    example: "Keep your study desk tidy to concentrate better.",
    clue: "Neat, organized, and free of clutter."
  },
  {
    word: "MODERN",
    category: "places",
    partOfSpeech: "Adjective",
    translation: "Modern / canggih",
    definition: "Relating to the present or recent times as opposed to the remote past.",
    example: "The new city library has modern digital study booths.",
    clue: "Using present-day style, architecture, or technology."
  },

  // --- DESCRIBING THINGS ---
  {
    word: "SHINY",
    category: "things",
    partOfSpeech: "Adjective",
    translation: "Berkilau / mengkilap",
    definition: "Reflecting light, typically because clean or polished.",
    example: "He polished his silver watch until it was bright and shiny.",
    clue: "Reflecting light brightly like polished metal or glass."
  },
  {
    word: "WOODEN",
    category: "things",
    partOfSpeech: "Adjective",
    translation: "Terbuat dari kayu",
    definition: "Made of wood.",
    example: "My grandfather crafted a sturdy wooden dining table.",
    clue: "Manufactured from tree timber or logs."
  },
  {
    word: "ROUND",
    category: "things",
    partOfSpeech: "Adjective",
    translation: "Bulat / bundar",
    definition: "Shaped like a circle or cylinder.",
    example: "The soccer ball is round and made of leather.",
    clue: "Shaped like a sphere, circle, or ball."
  },
  {
    word: "HEAVY",
    category: "things",
    partOfSpeech: "Adjective",
    translation: "Berat",
    definition: "Of great weight; difficult to lift or move.",
    example: "The backpack was heavy because of all the textbooks inside.",
    clue: "Weighing a lot; difficult to lift easily."
  },
  {
    word: "LIGHT",
    category: "things",
    partOfSpeech: "Adjective",
    translation: "Ringan",
    definition: "Of little weight; not heavy.",
    example: "Aluminum is a light metal used for making airplanes.",
    clue: "Having little weight, easy to carry."
  },
  {
    word: "SOFT",
    category: "things",
    partOfSpeech: "Adjective",
    translation: "Lembut / empuk",
    definition: "Easy to mold, cut, or fold; not hard or firm to the touch.",
    example: "The pillow is soft and filled with down feathers.",
    clue: "Gentle and yielding to touch, like a velvet cushion."
  },
  {
    word: "HARD",
    category: "things",
    partOfSpeech: "Adjective",
    translation: "Keras",
    definition: "Solid, firm, and resistant to pressure; not easily broken or pierced.",
    example: "Diamond is the most hard natural mineral on Earth.",
    clue: "Solid, tough, and not easily dented or bent."
  },
  {
    word: "SMOOTH",
    category: "things",
    partOfSpeech: "Adjective",
    translation: "Halus / licin",
    definition: "Having an even and regular surface; free from perceptible projections, lumps, or roughness.",
    example: "The marble floor feels smooth under our bare feet.",
    clue: "Having an even surface with no roughness or bumps."
  },
  {
    word: "ROUGH",
    category: "things",
    partOfSpeech: "Adjective",
    translation: "Kasar",
    definition: "Having an uneven or irregular surface; not smooth.",
    example: "The bark of the banyan tree is thick and rough.",
    clue: "Uneven and coarse to touch; opposite of smooth."
  },
  {
    word: "BRIGHT",
    category: "things",
    partOfSpeech: "Adjective",
    translation: "Terang / cerah",
    definition: "Giving out or reflecting a lot of light; shining.",
    example: "The bright neon lamp illuminated the whole porch.",
    clue: "Radiating strong light or vivid colors."
  }
];

// Expanded Valid English Word List for Scrabble board lookup
const VALID_SCRABBLE_WORDS = new Set([
  // Core Descriptive Text Words
  "KIND", "SMART", "BRAVE", "TALL", "POLITE", "HONEST", "SLIM", "YOUNG", "FRIENDLY", "CHEERFUL",
  "FURRY", "FIERCE", "CUTE", "TAME", "SHARP", "TAIL", "BEAK", "PAW", "GENTLE", "SWIFT",
  "CLEAN", "COZY", "CROWDED", "SPACIOUS", "HISTORIC", "ANCIENT", "QUIET", "BREEZY", "TIDY", "MODERN",
  "SHINY", "WOODEN", "ROUND", "HEAVY", "LIGHT", "SOFT", "HARD", "SMOOTH", "ROUGH", "BRIGHT",
  // Common English action & state words
  "TRY", "CRY", "DRY", "FLY", "FRY", "SKY", "SPY", "PLY", "SLY", "SHY", "WHY",
  "RUN", "SEE", "SAY", "GO", "DO", "BE", "ME", "HE", "WE", "UP", "ON", "IN", "AT", "TO", "IT", "IS", "AS", "BY", "MY", "NO", "SO", "IF", "OR", "OF",
  "BIG", "SMALL", "FAST", "SLOW", "HOT", "COLD", "WARM", "COOL", "SWEET", "SOUR", "DARK", "DEEP",
  "NICE", "GOOD", "BAD", "RED", "BLUE", "PINK", "GREEN", "WHITE", "BLACK", "BROWN", "GREY", "GRAY",
  "CAT", "DOG", "BIRD", "FISH", "LION", "BEAR", "DUCK", "FROG", "WOLF", "DEER", "HORSE", "TIGER",
  "ROOM", "PARK", "BEACH", "HOUSE", "CITY", "TOWN", "LAKE", "RIVER", "HILL", "FARM", "GARDEN",
  "BOOK", "DESK", "BAG", "PEN", "DOLL", "BALL", "CAR", "BIKE", "RING", "SHIRT", "SHOE", "TREE",
  "HAIR", "NOSE", "EYE", "EAR", "FACE", "HEAD", "FOOT", "HAND", "SKIN", "LEG", "ARM", "SMILE",
  "TRUE", "FAIR", "CALM", "BOLD", "RICH", "POOR", "WIDE", "LONG", "SHORT", "NEAT", "PURE", "FINE",
  "FLUFFY", "LOVELY", "FAMOUS", "PRETTY", "STRONG", "LITTLE", "YELLOW", "ORANGE", "PURPLE", "GOLDEN",
  "PLAY", "GAME", "TIME", "YEAR", "NAME", "DAY", "SUN", "MOON", "STAR", "SEA", "RAIN", "WIND", "FIRE",
  "LOOK", "FEEL", "HEAR", "EAT", "DRINK", "WALK", "JUMP", "TALK", "READ", "WRITE", "SING", "DANCE",
  "OPEN", "SHUT", "HIGH", "LOW", "NEW", "OLD", "EASY", "BUSY", "FREE", "FULL", "REAL", "SURE", "GLAD",
  // Grammatical linking words used in descriptive text
  "ARE", "HAS", "HAVE", "HAD", "WAS", "WERE", "CAN", "WILL", "WOULD", "COULD", "SHOULD", "MUST",
  "THE", "THIS", "THAT", "THESE", "THOSE", "HIS", "HER", "ITS", "OUR", "THEIR", "WITH", "LIKE", "FROM"
]);

// Helper to calculate score of a word
function calculateWordBaseScore(word) {
  if (!word) return 0;
  return word.toUpperCase().split('').reduce((sum, letter) => {
    return sum + (SCRABBLE_LETTER_SCORES[letter] || 1);
  }, 0);
}

// Find vocabulary entry
function getVocabEntry(word) {
  if (!word) return null;
  return DESCRIPTIVE_VOCABULARY.find(item => item.word.toUpperCase() === word.toUpperCase()) || null;
}

// Open Word Validator for Scrabble board (accepts any valid word)
function isAcceptableScrabbleWord(word) {
  if (!word || typeof word !== 'string') return false;
  const clean = word.trim().toUpperCase();
  return clean.length >= 2;
}
