import type { ChapterMeta, Guest } from "./types"

export const guest: Guest = {
  firstName: "Noor",
  lastName: "Bennett",
  title: "Ms.",
  bookingRef: "AH-48217",
  roomName: "Cedar Suite",
  checkIn: "2027-04-06",
  checkOut: "2027-04-10",
  nights: 4,
}

export const chapters: ChapterMeta[] = [
  {
    id: "bed",
    index: 1,
    title: "The Bed",
    subtitle: "Mattress, pillows, and linen",
    kicker: "Chapter One",
  },
  {
    id: "bar",
    index: 2,
    title: "The Bar",
    subtitle: "Drinks and minibar",
    kicker: "Chapter Two",
  },
  {
    id: "atmosphere",
    index: 3,
    title: "Your Atmosphere",
    subtitle: "Lighting, scent, and temperature",
    kicker: "Chapter Three",
  },
  {
    id: "morning",
    index: 4,
    title: "The Morning",
    subtitle: "Breakfast and coffee",
    kicker: "Chapter Four",
  },
  {
    id: "moments",
    index: 5,
    title: "After Hours",
    subtitle: "Dining, spa, and useful extras",
    kicker: "Chapter Five",
  },
  {
    id: "words",
    index: 6,
    title: "Your Words",
    subtitle: "Anything else we should know",
    kicker: "Chapter Six",
  },
]

// Mood prompts for the emotional opening
export const moodOptions = [
  { id: "slow", label: "Restful", hint: "Lower light, slower service, no rush." },
  { id: "warm", label: "Warm and comfortable", hint: "Soft lighting and a relaxed evening setup." },
  { id: "bright", label: "Bright and fresh", hint: "Daylight, fresh air, and a lighter feel." },
  { id: "quiet", label: "Quiet and private", hint: "Minimal interruptions and a calm room." },
]

// ——— Bed ———
export const mattressOptions = [
  { id: "cloud", label: "Soft", hint: "Plush with gentle support." },
  { id: "poised", label: "Medium", hint: "Balanced support and comfort." },
  { id: "grounded", label: "Firm", hint: "More structured support." },
]

export const pillowTypeOptions = [
  { id: "down", label: "Down", hint: "Light, soft, and airy." },
  { id: "memory", label: "Memory foam", hint: "Contoured neck support." },
  { id: "hypo", label: "Hypoallergenic", hint: "Feather-free and gentle." },
]

export const pillowFirmnessOptions = [
  { id: "soft", label: "Soft" },
  { id: "medium", label: "Medium" },
  { id: "firm", label: "Firm" },
]

export const duvetOptions = [
  { id: "light", label: "Light", hint: "Cooler and less weight." },
  { id: "medium", label: "Medium", hint: "Balanced warmth." },
  { id: "cocoon", label: "Extra warm", hint: "A heavier duvet." },
]

export const extraPillowsOptions = [
  { id: "none", label: "None" },
  { id: "1", label: "+1" },
  { id: "2", label: "+2" },
  { id: "3", label: "+3" },
]

export const extraDuvetOptions = [
  { id: "none", label: "None" },
  { id: "light", label: "Light" },
  { id: "heavy", label: "Heavy" },
]

export const linenFabricOptions = [
  { id: "cotton", label: "Cotton" },
  { id: "linen", label: "Linen" },
  { id: "silk", label: "Silk" },
]

// ——— Bar ———
export const welcomeDrinkOptions = [
  { id: "champagne", label: "Champagne", hint: "Chilled on arrival." },
  { id: "signature", label: "Signature cocktail", hint: "Citrus, spice, and a little smoke." },
  { id: "juice", label: "Fresh juice", hint: "Cold-pressed and alcohol-free." },
  { id: "none", label: "Nothing, thank you" },
]

export const minibarCollections = [
  {
    id: "nightcap",
    label: "Nightcap",
    description: "Aged whisky, dark chocolate, dried figs, salted almonds.",
    image: "/images/rebrand/restaurant-lounge.png",
  },
  {
    id: "refresher",
    label: "Refresher",
    description: "Sparkling water, cold-pressed citrus, a basket of stone fruit.",
    image: "/images/rebrand/restaurant-lounge.png",
  },
  {
    id: "celebration",
    label: "Celebration",
    description: "Champagne, ripe strawberries, pastel macarons.",
    image: "/images/rebrand/restaurant-lounge.png",
  },
]

export const dietaryOptions = [
  { id: "alcohol-free", label: "Alcohol-free" },
   { id: "dairy-free", label: "Dairy-free" },
  { id: "vegan", label: "Vegan" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "nut-allergy", label: "Nut allergy" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
]

// ——— Atmosphere ———
export const scentOptions = [
  {
    id: "mediterranean",
    label: "Rosemary & olive leaf",
    description: "Green, herbal, and clean.",
    image: "/images/rebrand/spa-recovery.png",
    tint: "garden",
  },
  {
    id: "library",
    label: "Cedar & vanilla",
    description: "Warm, soft, and lightly woody.",
    image: "/images/rebrand/hotel-lobby.png",
    tint: "library",
  },
  {
    id: "ocean",
    label: "Sea salt & linen",
    description: "Cool, fresh, and unobtrusive.",
    image: "/images/rebrand/spa-recovery.png",
    tint: "ocean",
  },
  {
    id: "lavender",
    label: "Lavender & cedar",
    description: "Calm, dry, and restful.",
    image: "/images/rebrand/spa-recovery.png",
    tint: "lavender",
  },
] as const

export const lightingOptions = [
  { id: "warm-dim", label: "Warm and dim", hint: "Soft evening light." },
  { id: "bright-airy", label: "Bright and airy", hint: "A lighter room on arrival." },
  { id: "candlelit", label: "Low and warm", hint: "Very soft, low-level light." },
]

export const temperatureOptions = [
  { id: "cool", label: "Cool", hint: "Fresh and comfortable." },
  { id: "neutral", label: "Neutral", hint: "Neither hot nor cool." },
  { id: "warm", label: "Warm", hint: "A little more heat." },
]

export const musicOptions = [
  { id: "jazz", label: "Soft jazz", hint: "Bill Evans at low volume." },
  { id: "classical", label: "Classical calm", hint: "Erik Satie, Debussy." },
  { id: "bossa", label: "Bossa nova", hint: "Rio in the 60s." },
  { id: "silence", label: "No music", hint: "A quiet room on arrival." },
]

export const flowerOptions = [
  { id: "peonies", label: "Peonies", hint: "Full, fragrant, pale pink." },
  { id: "wildflowers", label: "Seasonal flowers", hint: "Fresh, informal stems." },
  { id: "orchids", label: "White orchids", hint: "Simple and long-lasting." },
  { id: "surprise", label: "Surprise me" },
]

// ——— Morning ———
export const breakfastTimeOptions = [
  { id: "early", label: "Early", hint: "7 – 8 AM." },
  { id: "mid", label: "Unhurried", hint: "8:30 – 9:30 AM." },
  { id: "coffee-first", label: "Coffee first", hint: "Coffee before breakfast." },
]

export const breakfastLocationOptions = [
  { id: "in-room", label: "In your suite", hint: "Served at the room table." },
  { id: "restaurant", label: "The restaurant", hint: "A reserved table downstairs." },
  { id: "terrace", label: "The terrace", hint: "Outside, weather permitting." },
]

export const breakfastStyleOptions = [
  { id: "continental", label: "Continental", hint: "Pastries, fruit, preserves." },
  { id: "full", label: "Full", hint: "Eggs, sides, and toast." },
  { id: "light", label: "Light", hint: "Yoghurt, granola, seasonal fruit." },
]

export const coffeeOptions = [
  { id: "espresso", label: "Espresso" },
  { id: "flat-white", label: "Flat white" },
  { id: "americano", label: "Americano" },
  { id: "cappuccino", label: "Cappuccino" },
]

export const teaOptions = [
  { id: "english-breakfast", label: "English breakfast" },
  { id: "earl-grey", label: "Earl Grey" },
  { id: "green", label: "Green tea" },
  { id: "herbal", label: "Herbal" },
]

export const readingOptions = [
  { id: "ft", label: "Financial Times", hint: "Physical copy." },
  { id: "digital", label: "Digital", hint: "On your device." },
  { id: "none", label: "No reading", hint: "Nothing needed." },
]

// ——— Moments ———
export const spaOptions = [
  { id: "deep-tissue", label: "Deep tissue", hint: "Firm, restorative. Good after a long flight." },
  { id: "aromatherapy", label: "Aromatherapy", hint: "Warm oils, long strokes." },
  { id: "stretch", label: "Stretch & release", hint: "For the desk-weary neck and shoulders." },
  { id: "facial", label: "Signature facial", hint: "Light, refreshing. Before an evening meeting." },
]

export const diningOptions = [
  { id: "in-room", label: "Dinner in your suite", hint: "Private, unhurried. Ready when you are." },
  { id: "restaurant", label: "At the restaurant", hint: "Reserve a table downstairs." },
  { id: "late-bites", label: "Late-night bites", hint: "A small plate after a late-finishing call." },
]

export const activityOptions = [
  { id: "gym", label: "Early gym slot" },
  { id: "lap-pool", label: "Lap-pool lane" },
  { id: "meditation", label: "Guided meditation" },
  { id: "running", label: "Running route map" },
  { id: "car", label: "Driver standby" },
  { id: "service", label: "Room service" },
]
