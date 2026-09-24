"use client"

import * as React from "react"
import type {
  BookingDraft,
  ConfirmedBooking,
  ServiceRequest,
  TabId,
} from "./types"
import { currentBooking as initialBooking } from "./data"

type ArdenState = {
  tab: TabId
  setTab: (t: TabId) => void

  booking: ConfirmedBooking
  setBooking: (b: ConfirmedBooking) => void

  bookingDraft: BookingDraft
  updateDraft: (patch: Partial<BookingDraft>) => void
  resetDraft: () => void

  requests: ServiceRequest[]
  addRequest: (req: Omit<ServiceRequest, "id" | "createdAt" | "status">) => void

  /** Imperative helper used by the assistant & home cards */
  jumpTo: (tab: TabId) => void

  /** Jet-lag recovery mode — drives dark mode for the entire app */
  jetLag: boolean
  setJetLag: (on: boolean) => void
}

const emptyDraft: BookingDraft = {
  checkIn: null,
  checkOut: null,
  guests: 1,
  roomTypeId: null,
  path: null,
}

const ArdenContext = React.createContext<ArdenState | null>(null)

export function ArdenProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = React.useState<TabId>("stay")
  const [booking, setBooking] = React.useState<ConfirmedBooking>(initialBooking)
  const [bookingDraft, setBookingDraft] = React.useState<BookingDraft>(emptyDraft)
  const [requests, setRequests] = React.useState<ServiceRequest[]>([])
  const [jetLag, setJetLag] = React.useState(false)

  const updateDraft = React.useCallback((patch: Partial<BookingDraft>) => {
    setBookingDraft((d) => ({ ...d, ...patch }))
  }, [])

  const resetDraft = React.useCallback(() => setBookingDraft(emptyDraft), [])

  const addRequest = React.useCallback(
    (req: Omit<ServiceRequest, "id" | "createdAt" | "status">) => {
      setRequests((r) => [
        {
          ...req,
          id: `req-${Date.now()}`,
          createdAt: Date.now(),
          status: "sent",
        },
        ...r,
      ])
    },
    [],
  )

  const jumpTo = React.useCallback((t: TabId) => {
    setTab(t)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  const value: ArdenState = {
    tab,
    setTab: jumpTo,
    booking,
    setBooking,
    bookingDraft,
    updateDraft,
    resetDraft,
    requests,
    addRequest,
    jumpTo,
    jetLag,
    setJetLag,
  }

  return <ArdenContext.Provider value={value}>{children}</ArdenContext.Provider>
}

export function useArden() {
  const ctx = React.useContext(ArdenContext)
  if (!ctx) throw new Error("useArden must be used inside ArdenProvider")
  return ctx
}

/** Returns the Arden context or `null` when no provider exists above. */
export function useArdenOptional() {
  return React.useContext(ArdenContext)
}
