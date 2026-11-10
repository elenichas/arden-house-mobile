"use client"

import * as React from "react"
import {
  sampleProfiles,
  experienceById,
  type Booking,
  type ExperienceId,
  type Guest,
  type GuestKind,
  type PastStay,
  type Phase,
  type PlanItem,
  type Prefs,
  type ServiceRequest,
  type TabId,
} from "./data"

type Toast = { id: number; text: string }

type Store = {
  kind: GuestKind | null
  guest: Guest
  booking: Booking | null
  prefs: Prefs
  plan: PlanItem[]
  pastStay: PastStay | null
  phase: Phase
  tab: TabId
  requests: ServiceRequest[]
  basket: string[]
  toast: Toast | null
  profileOpen: boolean
  tourOpen: boolean
  conciergeDraft: string | null

  begin: (kind: GuestKind) => void
  reset: () => void
  setGuest: (g: Partial<Guest>) => void
  setBooking: (b: Booking | null) => void
  setPrefs: (p: Partial<Prefs>) => void
  setPhase: (p: Phase) => void
  setTab: (t: TabId) => void
  addToPlan: (id: ExperienceId, day: number, time?: string) => void
  removeFromPlan: (planId: string) => void
  addRequest: (label: string) => void
  toggleBasket: (id: string) => void
  notify: (text: string) => void
  setProfileOpen: (open: boolean) => void
  setTourOpen: (open: boolean) => void
  askConcierge: (text: string) => void
  consumeDraft: () => string | null
}

const Ctx = React.createContext<Store | null>(null)

export function useAspra() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("useAspra must be used inside AspraProvider")
  return ctx
}

let uid = 0
const nextId = (p: string) => `${p}-${Date.now().toString(36)}-${uid++}`

export function AspraProvider({ children }: { children: React.ReactNode }) {
  const [kind, setKind] = React.useState<GuestKind | null>(null)
  const [guest, setGuestState] = React.useState<Guest>(sampleProfiles.new.guest)
  const [booking, setBooking] = React.useState<Booking | null>(null)
  const [prefs, setPrefsState] = React.useState<Prefs>(sampleProfiles.new.prefs)
  const [plan, setPlan] = React.useState<PlanItem[]>([])
  const [pastStay, setPastStay] = React.useState<PastStay | null>(null)
  const [phase, setPhase] = React.useState<Phase>("before")
  const [tab, setTabState] = React.useState<TabId>("today")
  const [requests, setRequests] = React.useState<ServiceRequest[]>([])
  const [basket, setBasket] = React.useState<string[]>([])
  const [toast, setToast] = React.useState<Toast | null>(null)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [tourOpen, setTourOpen] = React.useState(false)
  const [conciergeDraft, setConciergeDraft] = React.useState<string | null>(null)
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const notify = React.useCallback((text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), text })
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const begin = React.useCallback((k: GuestKind) => {
    const p = sampleProfiles[k]
    setKind(k)
    setGuestState(p.guest)
    setBooking(p.booking)
    setPrefsState(p.prefs)
    setPlan(p.plan)
    setPastStay(p.pastStay)
    setPhase("before")
    setTabState("today")
    setRequests([])
    setBasket([])
  }, [])

  const reset = React.useCallback(() => {
    setKind(null)
    setProfileOpen(false)
    setTourOpen(false)
    setTabState("today")
  }, [])

  const setTab = React.useCallback((t: TabId) => {
    setTabState(t)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }, [])

  const addToPlan = React.useCallback(
    (id: ExperienceId, day: number, time?: string) => {
      const exp = experienceById(id)
      setPlan((prev) => [
        ...prev,
        {
          id: nextId("plan"),
          experienceId: id,
          day,
          time: time ?? exp.defaultTime,
          status: exp.per === "included" ? "confirmed" : "requested",
        },
      ])
    },
    [],
  )

  const removeFromPlan = React.useCallback((planId: string) => {
    setPlan((prev) => prev.filter((p) => p.id !== planId))
  }, [])

  const addRequest = React.useCallback(
    (label: string) => {
      const id = nextId("req")
      setRequests((prev) => [{ id, label, at: Date.now(), status: "sent" }, ...prev])
      // The team picks the request up shortly after it lands.
      setTimeout(() => {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "on its way" } : r)))
      }, 4000)
      notify("Sent to the team. You will see updates here.")
    },
    [notify],
  )

  const toggleBasket = React.useCallback((id: string) => {
    setBasket((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const askConcierge = React.useCallback(
    (text: string) => {
      setConciergeDraft(text)
      setTab("concierge")
    },
    [setTab],
  )

  const consumeDraft = React.useCallback(() => {
    const d = conciergeDraft
    setConciergeDraft(null)
    return d
  }, [conciergeDraft])

  const value: Store = {
    kind,
    guest,
    booking,
    prefs,
    plan,
    pastStay,
    phase,
    tab,
    requests,
    basket,
    toast,
    profileOpen,
    tourOpen,
    conciergeDraft,
    begin,
    reset,
    setGuest: (g) => setGuestState((prev) => ({ ...prev, ...g })),
    setBooking,
    setPrefs: (p) => setPrefsState((prev) => ({ ...prev, ...p })),
    setPhase,
    setTab,
    addToPlan,
    removeFromPlan,
    addRequest,
    toggleBasket,
    notify,
    setProfileOpen,
    setTourOpen,
    askConcierge,
    consumeDraft,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
