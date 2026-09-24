export type Guest = {
  firstName: string
  lastName: string
  title: string
  bookingRef: string
  roomName: string
  checkIn: string // ISO date
  checkOut: string
  nights: number
}

export type Selections = {
  mood?: string
  jetLag?: boolean

  // Bed
  mattress?: string
  pillowType?: string
  pillowFirmness?: string
  duvetWeight?: string
  extraPillows?: string
  extraDuvet?: string
  linenFabric?: string

  // Bar
  welcomeDrink?: string
  minibar?: string
  dietary: string[]
  specialAdditions?: string

  // Atmosphere
  scent?: string
  lighting?: string
  temperature?: string
  music?: string
  flowers?: string

  // Morning
  breakfastTime?: string
  breakfastLocation?: string
  breakfastStyle?: string
  coffee?: string
  tea?: string
  reading?: string

  // Moments
  spa?: string
  dining?: string
  activities: string[]
  occasion?: string

  // Words
  words?: string
}

export const emptySelections: Selections = {
  dietary: [],
  activities: [],
}

export type ChapterId =
  | "welcome"
  | "mood"
  | "bed"
  | "bar"
  | "atmosphere"
  | "morning"
  | "moments"
  | "words"
  | "summary"

export type ChapterMeta = {
  id: ChapterId
  index: number
  title: string
  subtitle: string
  kicker: string
}
