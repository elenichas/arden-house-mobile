/*
 * Aspra, Milos. Fictional hotel, guests and bookings for a public demo.
 * Copy rules: sentence case, plain words, no em dashes, say what it does.
 */

export type GuestKind = "new" | "booked" | "returning"
export type Phase = "before" | "during" | "after"
export type TabId = "today" | "plan" | "concierge" | "journal"

export const IMG = {
  hero: "/images/aspra/hero-cliffs.jpg",
  cave: "/images/aspra/suite-cave.jpg",
  pool: "/images/aspra/suite-pool.jpg",
  villa: "/images/aspra/villa-cliff.jpg",
  dinner: "/images/aspra/taverna-sunset.jpg",
  boat: "/images/aspra/boat-sail.jpg",
  spa: "/images/aspra/spa-grotto.jpg",
  breakfast: "/images/aspra/breakfast-terrace.jpg",
  plaka: "/images/aspra/plaka-dusk.jpg",
  yoga: "/images/aspra/yoga-dawn.jpg",
  keepsake: "/images/aspra/keepsake-home.jpg",
  harbour: "/images/aspra/arrival-harbour.jpg",
} as const

export const hotel = {
  name: "Aspra",
  place: "Milos, Greece",
  location: "Above Agia Kyriaki bay, south coast of Milos",
  suites: 7,
  checkIn: "15:00",
  checkOut: "12:00",
  airportMinutes: 20,
  portMinutes: 25,
  receptionPhone: "+30 22870 41 200",
  concierge: "Nefeli",
  humanConcierge: "Stavros",
  season: "Open 24 April to 26 October",
}

/* ─── Suites ─────────────────────────────────────────────────── */

export type SuiteId = "cave" | "pool" | "villa"

export type Suite = {
  id: SuiteId
  name: string
  line: string
  image: string
  size: number
  sleeps: number
  nightly: number
  facts: string[]
  view: string
}

export const suites: Suite[] = [
  {
    id: "cave",
    name: "Cave suite",
    line: "Cut into the rock, with one arched window onto the bay.",
    image: IMG.cave,
    size: 38,
    sleeps: 2,
    nightly: 640,
    facts: ["Plaster bed, linen sheets", "Outdoor rain shower", "Stays 22°C with no air conditioning"],
    view: "South over Agia Kyriaki bay",
  },
  {
    id: "pool",
    name: "Plunge pool suite",
    line: "A rock terrace with a heated plunge pool, 14 metres above the water.",
    image: IMG.pool,
    size: 52,
    sleeps: 3,
    nightly: 890,
    facts: ["Heated 3 m plunge pool", "Terrace daybed for two", "Sunset side of the hotel"],
    view: "South west, sunset over the sea",
  },
  {
    id: "villa",
    name: "Cliff villa",
    line: "Two bedrooms on two levels, an 11 m pool and a host for your stay.",
    image: IMG.villa,
    size: 140,
    sleeps: 5,
    nightly: 2150,
    facts: ["Two bedrooms, two bathrooms", "11 m infinity pool", "Private host 08:00 to 23:00"],
    view: "Open sea on three sides",
  },
]

export const suiteById = (id: SuiteId) => suites.find((s) => s.id === id) ?? suites[0]

/* ─── Experiences (bookable into the plan) ───────────────────── */

export type InterestId = "sea" | "food" | "wellness" | "history" | "walking" | "art"

export type ExperienceId =
  | "kleftiko"
  | "sunrise-yoga"
  | "grotto-ritual"
  | "thalami"
  | "plaka-walk"
  | "terrace-breakfast"
  | "chef-terrace"
  | "pottery"
  | "sarakiniko"

export type Experience = {
  id: ExperienceId
  name: string
  short: string
  image: string
  duration: string
  defaultTime: string
  price: number
  per: "person" | "group" | "included"
  interests: InterestId[]
  windSensitive?: boolean
}

export const experiences: Experience[] = [
  {
    id: "kleftiko",
    name: "Sail to Kleftiko",
    short: "Our caique to the sea caves of the south west. Swim stops, lunch on board.",
    image: IMG.boat,
    duration: "7 hours",
    defaultTime: "09:30",
    price: 260,
    per: "person",
    interests: ["sea", "food"],
    windSensitive: true,
  },
  {
    id: "sunrise-yoga",
    name: "Sunrise yoga on the rock",
    short: "An hour on the flat rock below the hotel. Mats and water provided.",
    image: IMG.yoga,
    duration: "60 min",
    defaultTime: "06:45",
    price: 0,
    per: "included",
    interests: ["wellness"],
  },
  {
    id: "grotto-ritual",
    name: "Sea salt ritual in the grotto",
    short: "Milos sea salt scrub, olive oil massage and a rinse in sea water.",
    image: IMG.spa,
    duration: "75 min",
    defaultTime: "17:00",
    price: 180,
    per: "person",
    interests: ["wellness"],
  },
  {
    id: "thalami",
    name: "Dinner at Thalami",
    short: "Our sea terrace. Fish from the Pollonia boats, vegetables from the hotel garden.",
    image: IMG.dinner,
    duration: "2 hours",
    defaultTime: "20:30",
    price: 0,
    per: "group",
    interests: ["food"],
  },
  {
    id: "plaka-walk",
    name: "Plaka at dusk with Eirini",
    short: "A local guide walks you up to the Kastro for sunset, then to dinner in the village.",
    image: IMG.plaka,
    duration: "3 hours",
    defaultTime: "18:30",
    price: 90,
    per: "person",
    interests: ["history", "walking", "art"],
  },
  {
    id: "terrace-breakfast",
    name: "Breakfast on your terrace",
    short: "Yogurt with thyme honey, figs, koulouri and Greek coffee, brought to your suite.",
    image: IMG.breakfast,
    duration: "Any time 07:30 to 11:30",
    defaultTime: "09:00",
    price: 0,
    per: "included",
    interests: ["food"],
  },
  {
    id: "chef-terrace",
    name: "Chef's table on your terrace",
    short: "Chef Yannis cooks five courses on your terrace. Menu agreed with you the day before.",
    image: IMG.dinner,
    duration: "3 hours",
    defaultTime: "20:00",
    price: 320,
    per: "person",
    interests: ["food"],
  },
  {
    id: "pottery",
    name: "Clay workshop in Triovasalos",
    short: "Throw a small bowl with Anna in her studio. We ship it to you after firing.",
    image: IMG.plaka,
    duration: "2 hours",
    defaultTime: "11:00",
    price: 75,
    per: "person",
    interests: ["art"],
  },
  {
    id: "sarakiniko",
    name: "Early swim at Sarakiniko",
    short: "Driver at 07:15, two hours on the white rocks before the day crowd, coffee in a flask.",
    image: IMG.hero,
    duration: "2.5 hours",
    defaultTime: "07:15",
    price: 60,
    per: "group",
    interests: ["sea", "walking"],
  },
]

export const experienceById = (id: ExperienceId) =>
  experiences.find((e) => e.id === id) ?? experiences[0]

export const interests: Array<{ id: InterestId; label: string }> = [
  { id: "sea", label: "Swimming and boats" },
  { id: "food", label: "Food and wine" },
  { id: "wellness", label: "Spa and yoga" },
  { id: "history", label: "History and villages" },
  { id: "walking", label: "Walking" },
  { id: "art", label: "Craft and art" },
]

/* ─── Stay extras (customise the stay) ───────────────────────── */

export type ExtraId =
  | "boat-transfer"
  | "car-transfer"
  | "early-in"
  | "late-out"
  | "celebration"
  | "crib"
  | "stocked-fridge"

export type Extra = {
  id: ExtraId
  name: string
  detail: string
  price: number
}

export const extras: Extra[] = [
  { id: "car-transfer", name: "Car from the airport or port", detail: "Driver waits with your name. 20 minutes to the hotel.", price: 60 },
  { id: "boat-transfer", name: "Arrive by our boat", detail: "From Adamas port to the hotel jetty. 35 minutes along the coast.", price: 180 },
  { id: "early-in", name: "Suite ready at 11:00", detail: "Instead of 15:00. Subject to the night before; we confirm 48 hours out.", price: 120 },
  { id: "late-out", name: "Leave at 17:00", detail: "Instead of 12:00. Useful for the evening ferry.", price: 150 },
  { id: "celebration", name: "A celebration on arrival", detail: "Flowers, a bottle of Assyrtiko and a cake from Plaka.", price: 95 },
  { id: "stocked-fridge", name: "Fridge stocked before you arrive", detail: "Choose what goes in. Charged at shop prices plus 10%.", price: 0 },
  { id: "crib", name: "Baby cot and bath", detail: "Set up before you arrive.", price: 0 },
]

export const extraById = (id: ExtraId) => extras.find((e) => e.id === id) ?? extras[0]

/* ─── Personal preferences ──────────────────────────────────── */

export type Pace = "slow" | "balanced" | "full"
export type Pillow = "feather" | "no-feather" | "firm" | "buckwheat"
export type Scent = "none" | "fig-leaf" | "sea-fennel" | "wild-thyme"
export type Fridge = "local-wine" | "no-alcohol" | "kids" | "empty"
export type Diet = "vegetarian" | "vegan" | "no-gluten" | "no-shellfish" | "no-dairy"
export type Occasion = "none" | "honeymoon" | "anniversary" | "birthday" | "rest"
export type BedSetup = "king" | "twin"
export type Flowers = "bougainvillea" | "olive" | "wildflowers" | "none"
export type Light = "morning" | "sunset" | "night"
export type Linen = "white" | "sand" | "sea"
export type Curtains = "open" | "sheer"
export type Welcome = "fruit" | "sweets" | "none"
export type TerraceSetup = "loungers" | "dining"

export type Prefs = {
  pace: Pace
  rhythm: "early" | "late"
  interests: InterestId[]
  diet: Diet[]
  pillow: Pillow
  bed: BedSetup
  linen: Linen
  curtains: Curtains
  welcome: Welcome
  terrace: TerraceSetup
  flowers: Flowers
  scent: Scent
  fridge: Fridge
  temperature: number
  occasion: Occasion
  note: string
}

export const defaultPrefs: Prefs = {
  pace: "balanced",
  rhythm: "early",
  interests: ["sea", "food"],
  diet: [],
  pillow: "feather",
  bed: "king",
  linen: "white",
  curtains: "open",
  welcome: "fruit",
  terrace: "loungers",
  flowers: "bougainvillea",
  scent: "none",
  fridge: "local-wine",
  temperature: 22,
  occasion: "none",
  note: "",
}

export const paceOptions: Array<{ id: Pace; label: string; detail: string }> = [
  { id: "slow", label: "Slow", detail: "One plan a day, the rest by the water" },
  { id: "balanced", label: "Balanced", detail: "A morning or an evening out, most days" },
  { id: "full", label: "Full", detail: "See as much of the island as we can fit" },
]

export const pillowOptions: Array<{ id: Pillow; label: string }> = [
  { id: "feather", label: "Goose feather" },
  { id: "no-feather", label: "Feather free" },
  { id: "firm", label: "Firm latex" },
  { id: "buckwheat", label: "Buckwheat" },
]

export const bedOptions: Array<{ id: BedSetup; label: string; detail: string }> = [
  { id: "king", label: "One king bed", detail: "200 x 200 cm, made up as one" },
  { id: "twin", label: "Two single beds", detail: "Two 100 x 200 cm beds with a gap between" },
]

export const linenOptions: Array<{ id: Linen; label: string; detail: string; swatch: string }> = [
  { id: "white", label: "Chalk white", detail: "Washed linen, undyed", swatch: "#f4f1ea" },
  { id: "sand", label: "Sand", detail: "Linen dyed with onion skins", swatch: "#d9c3a0" },
  { id: "sea", label: "Sea blue", detail: "Indigo-dyed linen from Sifnos", swatch: "#6f97b3" },
]

export const curtainOptions: Array<{ id: Curtains; label: string; detail: string }> = [
  { id: "open", label: "Open to the sea", detail: "You walk in to the view and the light" },
  { id: "sheer", label: "Sheers drawn", detail: "Soft light, more privacy, they move in the breeze" },
]

export const terraceOptions: Array<{ id: TerraceSetup; label: string; detail: string }> = [
  { id: "loungers", label: "Two loungers", detail: "Under the reed pergola, facing the bay" },
  { id: "dining", label: "Table for two", detail: "Breakfast and dinner outside, in the shade" },
]

export const welcomeOptions: Array<{ id: Welcome; label: string; detail: string }> = [
  { id: "fruit", label: "Figs and grapes", detail: "From the hotel garden, with cold water" },
  { id: "sweets", label: "Loukoumi and baklava", detail: "From the bakery in Plaka, with Greek coffee cups" },
  { id: "none", label: "Just water", detail: "A carafe and two glasses" },
]

/** What the temperature choice changes on the bed. */
export function beddingFor(temperature: number): { id: "sheet" | "duvet" | "blanket"; label: string } {
  if (temperature >= 24) return { id: "sheet", label: "A light cotton sheet instead of the duvet" }
  if (temperature <= 20) return { id: "blanket", label: "The duvet, plus a wool blanket at the foot" }
  return { id: "duvet", label: "A summer-weight linen duvet" }
}

export const flowerOptions: Array<{ id: Flowers; label: string; detail: string }> = [
  { id: "bougainvillea", label: "Bougainvillea", detail: "Cut from the terrace walls" },
  { id: "olive", label: "Olive branch", detail: "From the trees above the hotel" },
  { id: "wildflowers", label: "Wild flowers", detail: "Chamomile, poppy and thyme flower, in season" },
  { id: "none", label: "No flowers", detail: "Good for allergies" },
]

export const scentOptions: Array<{ id: Scent; label: string }> = [
  { id: "none", label: "No scent" },
  { id: "fig-leaf", label: "Fig leaf" },
  { id: "sea-fennel", label: "Sea fennel" },
  { id: "wild-thyme", label: "Wild thyme" },
]

export const fridgeOptions: Array<{ id: Fridge; label: string }> = [
  { id: "local-wine", label: "Island wine and beer" },
  { id: "no-alcohol", label: "No alcohol" },
  { id: "kids", label: "Juice and snacks for children" },
  { id: "empty", label: "Leave it empty" },
]

export const dietOptions: Array<{ id: Diet; label: string }> = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "no-gluten", label: "No gluten" },
  { id: "no-shellfish", label: "No shellfish" },
  { id: "no-dairy", label: "No dairy" },
]

export const occasionOptions: Array<{ id: Occasion; label: string }> = [
  { id: "none", label: "Just a holiday" },
  { id: "rest", label: "We need rest" },
  { id: "honeymoon", label: "Honeymoon" },
  { id: "anniversary", label: "Anniversary" },
  { id: "birthday", label: "Birthday" },
]

/* ─── Booking and plan ──────────────────────────────────────── */

export type Booking = {
  ref: string
  suiteId: SuiteId
  checkIn: string // ISO date
  checkOut: string
  adults: number
  children: number
  extras: ExtraId[]
  arrival: { by: "air" | "ferry"; detail: string; time: string }
}

export type PlanItem = {
  id: string
  experienceId: ExperienceId
  day: number // 0 = arrival day
  time: string
  status: "confirmed" | "requested"
}

export type ServiceRequest = {
  id: string
  label: string
  at: number
  status: "sent" | "on its way" | "done"
}

export type Guest = { firstName: string; lastName: string; email: string }

export type PastStay = {
  suiteId: SuiteId
  suiteNumber: string
  checkIn: string
  checkOut: string
  moments: Array<{ day: string; title: string; note: string; image: string }>
  remembered: string[]
}

export type Profile = {
  guest: Guest
  booking: Booking | null
  prefs: Prefs
  plan: PlanItem[]
  pastStay: PastStay | null
}

export const sampleProfiles: Record<GuestKind, Profile> = {
  new: {
    guest: { firstName: "Maya", lastName: "Sorensen", email: "maya.sorensen@example.com" },
    booking: null,
    prefs: defaultPrefs,
    plan: [],
    pastStay: null,
  },
  booked: {
    guest: { firstName: "Clara", lastName: "Weiss", email: "clara.weiss@example.com" },
    booking: {
      ref: "ASP-2614",
      suiteId: "pool",
      checkIn: "2027-06-04",
      checkOut: "2027-06-10",
      adults: 2,
      children: 0,
      extras: ["boat-transfer", "celebration"],
      arrival: { by: "ferry", detail: "Seajets from Piraeus", time: "13:40" },
    },
    prefs: {
      ...defaultPrefs,
      pace: "slow",
      interests: ["sea", "wellness", "food"],
      occasion: "anniversary",
      scent: "fig-leaf",
    },
    plan: [
      { id: "p1", experienceId: "thalami", day: 0, time: "20:30", status: "confirmed" },
      { id: "p2", experienceId: "kleftiko", day: 2, time: "09:30", status: "confirmed" },
      { id: "p3", experienceId: "grotto-ritual", day: 3, time: "17:00", status: "requested" },
    ],
    pastStay: null,
  },
  returning: {
    guest: { firstName: "Jonas", lastName: "Hale", email: "jonas.hale@example.com" },
    booking: null,
    prefs: {
      ...defaultPrefs,
      pace: "balanced",
      rhythm: "late",
      interests: ["food", "history", "sea"],
      diet: ["no-shellfish"],
      pillow: "no-feather",
      scent: "wild-thyme",
      temperature: 21,
      note: "Oat milk with coffee. Table at the edge of the terrace if possible.",
    },
    plan: [],
    pastStay: {
      suiteId: "cave",
      suiteNumber: "Cave 3",
      checkIn: "2026-09-12",
      checkOut: "2026-09-18",
      moments: [
        { day: "Day 2", title: "Kleftiko by caique", note: "Swam into the second cave. Captain Manolis grilled octopus on board.", image: IMG.boat },
        { day: "Day 3", title: "Sunset from the Kastro", note: "Eirini showed you the chapel of Thalassitra. Dinner at the taverna below.", image: IMG.plaka },
        { day: "Day 5", title: "Your last dinner at Thalami", note: "Sea bream, fava from Santorini, a Malagousia from Tinos you asked us to remember.", image: IMG.dinner },
      ],
      remembered: [
        "Feather free pillows",
        "Oat milk with coffee",
        "No shellfish",
        "Wild thyme in the room",
        "Malagousia, Tinos, 2024",
        "Table at the terrace edge",
      ],
    },
  },
}

/* ─── After the stay ────────────────────────────────────────── */

export type ShopItem = { id: string; name: string; detail: string; price: number }

export const islandShop: ShopItem[] = [
  { id: "oil", name: "Olive oil from our trees", detail: "500 ml, pressed in November in Zefyria", price: 28 },
  { id: "honey", name: "Thyme honey", detail: "250 g, from Giorgos's hives above Provatas", price: 16 },
  { id: "salt", name: "Milos sea salt", detail: "Hand collected at Alyki, 200 g", price: 12 },
  { id: "bowl", name: "Triovasalos clay bowl", detail: "Made by Anna, glaze of your choice", price: 55 },
]

export const recipe = {
  title: "Fava with caper leaves and onion",
  from: "Chef Yannis, Thalami",
  serves: 4,
  steps: [
    "Rinse 250 g yellow split peas. Cover with water by 3 cm and simmer with one red onion, quartered.",
    "Skim the foam. Cook 45 minutes, until the peas fall apart. Add water if it gets thick.",
    "Blend with 80 ml olive oil, the juice of one lemon and salt.",
    "Top with thin raw onion, caper leaves and more oil. Serve warm.",
  ],
}

export const greekPhrases = [
  { greek: "Kalimera", english: "Good morning" },
  { greek: "Efharisto", english: "Thank you" },
  { greek: "Yamas", english: "Cheers" },
  { greek: "Ena nero, parakalo", english: "A water, please" },
  { greek: "Siga siga", english: "Slowly, no rush. You will hear it often." },
]

export const packingList = [
  "Water shoes for the rocks at Sarakiniko and Tsigrado",
  "A light layer for the boat. The meltemi wind is cool after 18:00",
  "Reef safe sun cream. We also leave some in your suite",
  "Cash for village tavernas in Plaka and Klima",
  "Nothing formal. Thalami has no dress code",
]

/* ─── Island conditions (demo) ──────────────────────────────── */

export const conditions = {
  air: 27,
  sea: 23,
  wind: "North west, 5 Beaufort",
  windy: true,
  sunset: "20:41",
  sunrise: "06:12",
}

/* ─── Helpers ───────────────────────────────────────────────── */

export const euro = (n: number) =>
  n === 0 ? "Included" : `€${n.toLocaleString("en-GB")}`

export function nightsBetween(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(1, Math.round(ms / 86_400_000))
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T12:00:00")
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", opts)
}

export function dayLabel(checkIn: string, day: number) {
  return new Date(addDays(checkIn, day) + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
  })
}

export function daysUntil(iso: string) {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Math.max(0, Math.round((new Date(iso + "T12:00:00").getTime() - today.getTime()) / 86_400_000))
}

export function bookingTotal(b: Booking) {
  const suite = suiteById(b.suiteId)
  const nights = nightsBetween(b.checkIn, b.checkOut)
  const extrasCost = b.extras.reduce((sum, id) => sum + extraById(id).price, 0)
  return { nights, room: suite.nightly * nights, extras: extrasCost, total: suite.nightly * nights + extrasCost }
}

/** The demo's "today" while the guest is on Milos: the third day, or the last night of a short stay. */
export function currentDay(nights: number) {
  return Math.min(2, Math.max(0, nights - 1))
}

/** What one experience costs this booking: per person prices count every guest. */
export function experienceCost(e: Experience, b: Booking) {
  return e.per === "person" ? e.price * (b.adults + b.children) : e.price
}

export function planCost(plan: PlanItem[], b: Booking) {
  return plan.reduce((sum, p) => sum + experienceCost(experienceById(p.experienceId), b), 0)
}

/* With seven suites, some nights are already taken. These are the demo's sold nights. */
const soldNights: Record<SuiteId, Array<[string, string]>> = {
  cave: [["2027-05-20", "2027-05-23"], ["2027-06-24", "2027-06-29"], ["2027-07-15", "2027-07-21"], ["2027-08-05", "2027-08-16"], ["2027-09-03", "2027-09-08"]],
  pool: [["2027-05-06", "2027-05-10"], ["2027-06-18", "2027-06-23"], ["2027-07-02", "2027-07-12"], ["2027-08-01", "2027-08-20"], ["2027-09-24", "2027-09-28"]],
  villa: [["2027-06-01", "2027-06-07"], ["2027-07-20", "2027-08-03"], ["2027-08-12", "2027-08-26"], ["2027-09-10", "2027-09-15"]],
}

export const SEASON = { first: "2027-04-24", last: "2027-10-26" }

/** True when the suite type has no free suite on that night. */
export function isSoldNight(iso: string, suiteId: SuiteId) {
  return soldNights[suiteId].some(([from, to]) => iso >= from && iso <= to)
}

/** A stay is free when every night from arrival to the night before departure is free and in season. */
export function stayIsFree(checkIn: string, checkOut: string, suiteId: SuiteId) {
  if (checkIn < SEASON.first || checkOut > SEASON.last) return false
  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) if (isSoldNight(d, suiteId)) return false
  return true
}

export function newRef() {
  return `ASP-${Math.floor(1000 + Math.random() * 9000)}`
}

/** Experiences ranked by how well they match the guest's interests and pace. */
export function suggestFor(prefs: Prefs, plan: PlanItem[], windy = conditions.windy) {
  const planned = new Set(plan.map((p) => p.experienceId))
  return experiences
    .filter((e) => !planned.has(e.id) && e.id !== "terrace-breakfast")
    .map((e) => {
      let score = e.interests.filter((i) => prefs.interests.includes(i)).length * 2
      if (prefs.rhythm === "late" && e.defaultTime < "08:00") score -= 3
      if (prefs.pace === "slow" && e.duration.includes("7 hours")) score -= 1
      if (windy && e.windSensitive) score -= 1
      return { e, score }
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.e)
}

export function reasonFor(e: Experience, prefs: Prefs) {
  const match = interests.find((i) => e.interests.includes(i.id) && prefs.interests.includes(i.id))
  if (prefs.occasion === "anniversary" && (e.id === "chef-terrace" || e.id === "grotto-ritual")) return "For your anniversary"
  if (prefs.occasion === "honeymoon" && e.id === "chef-terrace") return "For your honeymoon"
  if (match) return `You like ${match.label.toLowerCase()}`
  return "Guests love this"
}

export function priceLabel(e: Experience) {
  if (e.id === "thalami") return "Pay for what you order"
  if (e.price === 0) return "Included"
  return `${euro(e.price)}${e.per === "person" ? " each" : ""}`
}
