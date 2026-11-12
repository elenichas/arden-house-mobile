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

export type ToastAction = { label: string; run: () => void }
type Toast = { id: number; text: string; action?: ToastAction }

const STORAGE_KEY = "aspra-state-v1"

/** What survives a page refresh: the guest, their booking and everything they planned. */
export type Saved = {
  kind: GuestKind
  guest: Guest
  booking: Booking | null
  prefs: Prefs
  plan: PlanItem[]
  pastStay: PastStay | null
  phase: Phase
  tab: TabId
  requests: ServiceRequest[]
  basket: string[]
}

export function readSaved(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Saved
    return saved && saved.kind && saved.guest && saved.prefs ? saved : null
  } catch {
    return null
  }
}

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
  stayOpen: boolean
  conciergeDraft: string | null

  begin: (kind: GuestKind) => void
  restore: (saved: Saved) => void
  reset: () => void
  setGuest: (g: Partial<Guest>) => void
  setBooking: (b: Booking | null) => void
  setPrefs: (p: Partial<Prefs>) => void
  setPhase: (p: Phase) => void
  setTab: (t: TabId) => void
  /** Adds an experience and returns the new plan item's id, so the caller can offer undo. */
  addToPlan: (id: ExperienceId, day: number, time?: string) => string
  removeFromPlan: (planId: string) => void
  restoreToPlan: (item: PlanItem) => void
  addRequest: (label: string) => void
  cancelRequest: (id: string) => void
  toggleBasket: (id: string) => void
  notify: (text: string, action?: ToastAction) => void
  dismissToast: () => void
  setProfileOpen: (open: boolean) => void
  setTourOpen: (open: boolean) => void
  setStayOpen: (open: boolean) => void
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
  const [stayOpen, setStayOpen] = React.useState(false)
  const [conciergeDraft, setConciergeDraft] = React.useState<string | null>(null)
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const notify = React.useCallback((text: string, action?: ToastAction) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), text, action })
    // A message with an action stays longer, so there is time to reach it.
    toastTimer.current = setTimeout(() => setToast(null), action ? 7000 : 3200)
  }, [])

  const dismissToast = React.useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(null)
  }, [])

  const restore = React.useCallback((saved: Saved) => {
    setKind(saved.kind)
    setGuestState(saved.guest)
    setBooking(saved.booking)
    setPrefsState(saved.prefs)
    setPlan(saved.plan ?? [])
    setPastStay(saved.pastStay)
    setPhase(saved.phase ?? "before")
    setTabState(saved.tab ?? "today")
    // A request that was still "sent" when the page closed has been picked up since.
    setRequests((saved.requests ?? []).map((r) => (r.status === "sent" ? { ...r, status: "on its way" } : r)))
    setBasket(saved.basket ?? [])
  }, [])

  // Keep the trip on this device so a refresh does not lose it.
  React.useEffect(() => {
    if (!kind) return
    const saved: Saved = { kind, guest, booking, prefs, plan, pastStay, phase, tab, requests, basket }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      // Private windows can refuse storage. The app still works for this visit.
    }
  }, [kind, guest, booking, prefs, plan, pastStay, phase, tab, requests, basket])

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
    setStayOpen(false)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Nothing to clear.
    }
    setTabState("today")
  }, [])

  const setTab = React.useCallback((t: TabId) => {
    setTabState(t)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }, [])

  const addToPlan = React.useCallback(
    (id: ExperienceId, day: number, time?: string) => {
      const exp = experienceById(id)
      const planId = nextId("plan")
      setPlan((prev) => [
        ...prev,
        {
          id: planId,
          experienceId: id,
          day,
          time: time ?? exp.defaultTime,
          status: exp.per === "included" ? "confirmed" : "requested",
        },
      ])
      return planId
    },
    [],
  )

  const restoreToPlan = React.useCallback((item: PlanItem) => {
    setPlan((prev) => (prev.some((p) => p.id === item.id) ? prev : [...prev, item]))
  }, [])

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
      notify(`${label}: sent to the team.`, {
        label: "Cancel",
        run: () => setRequests((prev) => prev.filter((r) => r.id !== id)),
      })
    },
    [notify],
  )

  const cancelRequest = React.useCallback((id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }, [])

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
    stayOpen,
    conciergeDraft,
    begin,
    restore,
    reset,
    setGuest: (g) => setGuestState((prev) => ({ ...prev, ...g })),
    setBooking,
    setPrefs: (p) => setPrefsState((prev) => ({ ...prev, ...p })),
    setPhase,
    setTab,
    addToPlan,
    removeFromPlan,
    restoreToPlan,
    addRequest,
    cancelRequest,
    toggleBasket,
    notify,
    dismissToast,
    setProfileOpen,
    setTourOpen,
    setStayOpen,
    askConcierge,
    consumeDraft,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
