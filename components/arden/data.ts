import type {
  ConfirmedBooking,
  MeetingRoom,
  PastBooking,
  RoomType,
  SpacePulse,
  WifiInfo,
} from "./types"

/* ——— Public demo hotel brand ——— */
export const hotel = {
  name: "Arden House",
  tagline: "A quiet business hotel in the centre of the city",
  address: "18 Wren Street",
  phone: "+1 (212) 555 0142",
  checkInTime: "15:00",
  checkOutTime: "12:00",
  conciergeName: "Lucien",
} as const

/* ——— Demo guest profile ——— */
export const guest = {
  firstName: "Noor",
  lastName: "Bennett",
  title: "Ms.",
  email: "noor.bennett@example.com",
  loyaltyTier: "House",
} as const

/* ——— Current confirmed booking ——— */
export const currentBooking: ConfirmedBooking = {
  id: "AH-48217",
  checkIn: "2027-04-06",
  checkOut: "2027-04-10",
  nights: 4,
  guests: 1,
  roomTypeId: "suite",
  roomName: "Cedar Suite",
}

/* ——— Guestroom catalogue ——— */
export const roomTypes: RoomType[] = [
  {
    id: "classic",
    name: "King Guestroom",
    tagline: "Everything needed for a short city stay.",
    description:
      "A calm room with a king bed, reading chair, blackout curtains, and a proper desk for one or two nights in the city.",
    image: "/images/rebrand/room-classic.png",
    size: "32 m²",
    pricePerNight: 420,
    highlights: ["King bed", "Linen blackout", "Silent minibar", "Pillow menu"],
    view: "Interior courtyard, planted with olive trees.",
    orientation: "North-facing · 4F",
    noise: "quiet",
    noiseHint: "Courtyard side, away from street traffic.",
    nearby: [
      { label: "Lobby & café", detail: "Two floors below, via the lift." },
      { label: "Fitness studio", detail: "Same floor, end of the corridor." },
      { label: "Valet desk", detail: "Lobby level, 24 hours." },
    ],
  },
  {
    id: "double",
    name: "Double Guestroom",
    tagline: "Two beds with room to work and unpack.",
    description:
      "Two double beds, a writing desk, and the same linen and pillow options as the suites. Practical for colleagues or a family stopover.",
    image: "/images/rebrand/room-classic.png",
    size: "38 m²",
    pricePerNight: 480,
    highlights: ["Two double beds", "Linen blackout", "Pillow menu", "Writing desk"],
    view: "Interior courtyard, planted with olive trees.",
    orientation: "North-facing · 5F",
    noise: "quiet",
    noiseHint: "Courtyard side, set back from the street.",
    nearby: [
      { label: "Lobby & café", detail: "Three floors below, via the lift." },
      { label: "Fitness studio", detail: "One floor down." },
      { label: "Valet desk", detail: "Lobby level, 24 hours." },
    ],
  },
  {
    id: "executive",
    name: "Studio Suite",
    tagline: "More space for workdays and longer stays.",
    description:
      "A dedicated work desk, generous wardrobe, reading chair, and space to settle in for a full working week.",
    image: "/images/rebrand/room-suite.png",
    size: "44 m²",
    pricePerNight: 640,
    highlights: [
      "King bed",
      "Dedicated desk",
      "Ergonomic chair",
      "Espresso machine",
    ],
    view: "The promenade and harbour, framed by linen drapes.",
    orientation: "East-facing · 6F",
    noise: "whisper",
    noiseHint: "Double-glazed, acoustically lined. Among our quietest rooms.",
    nearby: [
      { label: "Meeting rooms", detail: "Same floor, three doors away." },
      { label: "Business lounge", detail: "6F, shared with Suite guests." },
      { label: "Restaurant", detail: "Ground floor, short lift ride." },
    ],
  },
  {
    id: "suite",
    name: "Cedar Suite",
    tagline: "A separate sitting room with a skyline view.",
    description:
      "Our top-floor corner suite, with a separate sitting room, floor-to-ceiling windows, a corner writing desk, and a quiet bedroom.",
    image: "/images/rebrand/room-suite.png",
    size: "82 m²",
    pricePerNight: 1180,
    highlights: [
      "King bed",
      "Corner view",
      "Separate sitting room",
      "Butler on request",
    ],
    view: "Panoramic skyline and harbour, east and south exposure.",
    orientation: "South-east corner · 11F",
    noise: "whisper",
    noiseHint: "Top floor, corner-isolated. City sounds fall far below.",
    nearby: [
      { label: "Spa", detail: "One floor up, by private lift." },
      { label: "Business lounge", detail: "6F, butler on call if preferred." },
      { label: "Valet", detail: "Car brought to the porte-cochère on request." },
    ],
  },
]

/* ——— Past bookings (for rebook flow) ——— */
export const pastBookings: PastBooking[] = [
  {
    id: "AH-31044",
    roomTypeId: "executive",
    roomName: "Studio Suite",
    checkIn: "2026-02-12",
    checkOut: "2026-02-15",
  },
  {
    id: "AH-27891",
    roomTypeId: "suite",
    roomName: "Cedar Suite",
    checkIn: "2025-10-20",
    checkOut: "2025-10-25",
  },
]

/* ——— WiFi ——— */
export const wifi: WifiInfo = {
  ssid: "Arden House",
  password: "wrenhouse2026",
  speed: "1 Gb · symmetrical",
  note: "Open network. Certificate auto-installs on arrival.",
}

/* ——— Space pulse (occupancy right now) ——— */
export const spaces: SpacePulse[] = [
  {
    id: "foyer",
    name: "Arrival Lounge",
    subtitle: "Check in, take a call, or pause after travel.",
    description:
      "A warm first room for check-in, coffee, and the quiet pause between travel and the day ahead.",
    occupancy: 32,
    capacity: 80,
    current: 26,
    image: "/images/rebrand/hotel-lobby.png",
  },
  {
    id: "salons",
    name: "The Drawing Rooms",
    subtitle: "Private rooms for meetings and informal drinks.",
    description:
      "A set of connected rooms for quiet meetings, private drinks, and conversations that need a little discretion.",
    occupancy: 48,
    capacity: 120,
    current: 57,
    image: "/images/rebrand/restaurant-lounge.png",
    subSalons: [
      {
        id: "gallery",
        name: "The Gallery",
        hint: "A quiet space for informal meetings.",
      },
      {
        id: "grand-salon",
        name: "The Long Room",
        hint: "A larger room for small groups.",
      },
      {
        id: "bar-dining",
        name: "The Bar & Dining",
        hint: "A private setting for dinner or drinks.",
      },
      {
        id: "music-room",
        name: "The Listening Room",
        hint: "Good acoustics for small events.",
      },
      {
        id: "reading-room",
        name: "The Reading Room",
        hint: "A softer room for calls or reading.",
      },
    ],
  },
  {
    id: "retreat",
    name: "The Recovery Floor",
    subtitle: "Pool, sauna, treatments, and time to reset.",
    description:
      "A quieter floor for swimming, sauna, massage, and recovery after a long flight or a long day.",
    occupancy: 18,
    capacity: 24,
    current: 4,
    image: "/images/rebrand/spa-recovery.png",
  },
  {
    id: "emerald",
    name: "The Garden Room",
    subtitle: "A quiet lounge for reading or private calls.",
    description:
      "A low-key lounge with soft lamps, comfortable seating, and enough quiet for private calls or a book.",
    occupancy: 22,
    capacity: 40,
    current: 9,
    image: "/images/rebrand/restaurant-lounge.png",
  },
]

/* ——— Meeting rooms ——— */
export const meetingRooms: MeetingRoom[] = [
  {
    id: "promenade",
    name: "The Promenade",
    capacity: 8,
    floor: "2F",
    amenities: ["Warm walnut boardroom table", "Daylight, east-facing", "Silent AC"],
    image: "/images/rebrand/meeting-room.png",
    availability: [
      { start: "09:00", end: "10:30", booked: true },
      { start: "10:30", end: "12:00", booked: false },
      { start: "13:00", end: "15:00", booked: false },
      { start: "15:00", end: "17:00", booked: true },
    ],
  },
  {
    id: "atelier",
    name: "The Atelier",
    capacity: 4,
    floor: "3F",
    amenities: ["Round marble table", "Soft pendant lighting", "Whisper-quiet"],
    image: "/images/rebrand/meeting-room.png",
    availability: [
      { start: "09:00", end: "11:00", booked: false },
      { start: "11:00", end: "12:30", booked: true },
      { start: "14:00", end: "16:00", booked: false },
      { start: "16:00", end: "18:00", booked: false },
    ],
  },
  {
    id: "harbour",
    name: "The Harbour",
    capacity: 14,
    floor: "4F",
    amenities: ["Long linen-topped table", "Harbour view", "Screen on request"],
    image: "/images/rebrand/meeting-room.png",
    availability: [
      { start: "08:30", end: "10:00", booked: true },
      { start: "10:00", end: "12:00", booked: true },
      { start: "14:00", end: "17:00", booked: false },
    ],
  },
]

/* ——— Concierge services catalogue ——— */
export const services = [
  {
    id: "reception" as const,
    label: "Reception",
    hint: "A message to the front desk.",
  },
  {
    id: "housekeeping" as const,
    label: "Housekeeping",
    hint: "Turn-down, fresh linens, ironing.",
  },
  {
    id: "valet" as const,
    label: "Valet & car",
    hint: "Bring the car, or arrange a driver.",
  },
  {
    id: "bell" as const,
    label: "Bell service",
    hint: "Luggage, a delivery to your suite.",
  },
  {
    id: "in-room-dining" as const,
    label: "In-room dining",
    hint: "A menu, a bottle, a quiet supper.",
  },
  {
    id: "spa" as const,
    label: "Spa",
    hint: "Massage, sauna, pool, and recovery.",
  },
]

/* ——— Returning-guest saved preferences ——— */
export const savedArrivalProfile = {
  mattress: "Cloud-soft",
  pillow: "Memory foam, soft",
  duvet: "Cocoon",
  linen: "Cotton sateen",
  scent: "Cedar leaf & neroli",
  lighting: "Warm and dim",
  temperature: "19°C",
  music: "Classical calm",
  flowers: "White orchids",
  welcomeDrink: "Fresh juice",
  minibar: "The Refresher",
  breakfast: "Light, in-suite, coffee first",
  coffee: "Flat white",
  spa: "Deep tissue",
  dining: "Dinner in your suite",
  words:
    "I'll be arriving after a long flight. Anything to help me settle in would be wonderful.",
} as const

export const savedArrivalTiles = [
  { label: "Scent", value: savedArrivalProfile.scent },
  { label: "Lighting", value: savedArrivalProfile.lighting },
  { label: "Temperature", value: savedArrivalProfile.temperature },
  { label: "Music", value: savedArrivalProfile.music },
  { label: "Bed", value: savedArrivalProfile.mattress },
  { label: "Pillow", value: savedArrivalProfile.pillow },
  { label: "Duvet", value: savedArrivalProfile.duvet },
  { label: "Linen", value: savedArrivalProfile.linen },
  { label: "Flowers", value: savedArrivalProfile.flowers },
  { label: "Welcome drink", value: savedArrivalProfile.welcomeDrink },
  { label: "Minibar", value: savedArrivalProfile.minibar },
  { label: "Breakfast", value: savedArrivalProfile.breakfast },
  { label: "Coffee", value: savedArrivalProfile.coffee },
  { label: "Spa", value: savedArrivalProfile.spa },
  { label: "Dining", value: savedArrivalProfile.dining },
]

/* ——— Helpers ——— */
export function roomById(id: string) {
  return roomTypes.find((r) => r.id === id)
}

export function fullName() {
  return `${guest.firstName} ${guest.lastName}`
}
