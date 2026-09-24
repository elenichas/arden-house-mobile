export type TabId = "stay" | "room" | "concierge" | "assistant"

/** The three prototype guest entry paths, chosen at the gate after splash. */
export type GuestType = "booked" | "new" | "returning"

export type RoomTypeId = "classic" | "double" | "executive" | "suite"

export type NoiseLevel = "whisper" | "quiet" | "lively"

export type RoomType = {
  id: RoomTypeId
  name: string
  tagline: string
  description: string
  image: string
  size: string
  pricePerNight: number
  highlights: string[]
  /** A short phrase describing what you see from the window. */
  view: string
  /** Compass direction the room faces. */
  orientation: string
  /** Indicative acoustic level of the floor and surrounds. */
  noise: NoiseLevel
  /** Short description of the noise context — surfaces as a one-liner. */
  noiseHint: string
  /** Hotel amenities closest to this room, with a walking cue. */
  nearby: Array<{ label: string; detail: string }>
}

export type BookingPath = "browse" | "rebook" | "recommend"

export type PastBooking = {
  id: string
  roomTypeId: RoomTypeId
  roomName: string
  checkIn: string
  checkOut: string
}

export type BookingDraft = {
  checkIn: string | null
  checkOut: string | null
  guests: number
  roomTypeId: RoomTypeId | null
  path: BookingPath | null
}

export type ConfirmedBooking = {
  id: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  roomTypeId: RoomTypeId
  roomName: string
}

export type ServiceId =
  | "reception"
  | "housekeeping"
  | "valet"
  | "bell"
  | "in-room-dining"
  | "spa"
  | "transport"

export type ServiceRequest = {
  id: string
  service: ServiceId
  note: string
  createdAt: number
  status: "sent" | "acknowledged" | "completed"
}

export type SpaceKey = "foyer" | "salons" | "retreat" | "emerald"

/** One of the discreet salon environments that together make up The Salons. */
export type SubSalon = {
  id: "gallery" | "grand-salon" | "bar-dining" | "music-room" | "reading-room"
  name: string
  hint: string
}

export type SpacePulse = {
  id: SpaceKey
  name: string
  /** Short editorial descriptor for the card header. */
  subtitle: string
  /** A longer, sensorial description used in the card body. */
  description: string
  occupancy: number // 0-100
  capacity: number
  current: number
  image: string
  /** Only present on The Salons — the five composed environments inside it. */
  subSalons?: SubSalon[]
}

export type MeetingRoom = {
  id: string
  name: string
  capacity: number
  floor: string
  amenities: string[]
  image: string
  /** Availability windows for today, 24h clock */
  availability: Array<{ start: string; end: string; booked: boolean }>
}

export type WifiInfo = {
  ssid: string
  password: string
  speed: string
  note: string
}
