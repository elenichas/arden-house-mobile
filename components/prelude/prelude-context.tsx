"use client"

import * as React from "react"
import { emptySelections, type ChapterId, type Selections } from "./types"
import { chapters } from "./data"
import { useArdenOptional } from "@/components/arden/arden-context"

type PreludeState = {
  selections: Selections
  setSelection: <K extends keyof Selections>(key: K, value: Selections[K]) => void
  toggleInSet: (key: "dietary" | "activities", value: string) => void

  step: ChapterId
  goTo: (id: ChapterId) => void
  next: () => void
  back: () => void

  /** 0-1 progress through the personalisation chapters */
  progress: number

  /** Jet-lag recovery mode */
  jetLag: boolean
  setJetLag: (on: boolean) => void
}

const PreludeContext = React.createContext<PreludeState | null>(null)

const fullOrder: ChapterId[] = [
  "welcome",
  "mood",
  "bed",
  "bar",
  "atmosphere",
  "morning",
  "moments",
  "words",
  "summary",
]

const embeddedOrder: ChapterId[] = fullOrder.filter((s) => s !== "welcome")

export function PreludeProvider({
  children,
  skipWelcome = false,
}: {
  children: React.ReactNode
  skipWelcome?: boolean
}) {
  /* Try to read jet-lag state from the top-level Arden context so
     the dark-mode class can be applied to the entire app shell.  When
     PreludeProvider is used standalone (outside ArdenProvider) we
     fall back to local state so nothing breaks. */
  const arden = useArdenOptional()

  const [selections, setSelections] = React.useState<Selections>(emptySelections)
  const [step, setStep] = React.useState<ChapterId>(skipWelcome ? "mood" : "welcome")
  const [localJetLag, setLocalJetLag] = React.useState(false)
  const order = skipWelcome ? embeddedOrder : fullOrder

  /* If Arden context is available, use its jetLag state;
     otherwise use our own local state. */
  const jetLag = arden ? arden.jetLag : localJetLag
  const setJetLagRaw = arden ? arden.setJetLag : setLocalJetLag

  const setSelection = React.useCallback(
    <K extends keyof Selections>(key: K, value: Selections[K]) => {
      setSelections((s) => ({ ...s, [key]: value }))
    },
    [],
  )

  const toggleInSet = React.useCallback((key: "dietary" | "activities", value: string) => {
    setSelections((s) => {
      const list = s[key]
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
      return { ...s, [key]: next }
    })
  }, [])

  /* Jet-lag defaults — only fills fields the guest hasn't touched yet.
     Each value maps to an existing option id from data.ts. */
  const setJetLag = React.useCallback((on: boolean) => {
    setJetLagRaw(on)
    if (on) {
      setSelections((s) => ({
        ...s,
        jetLag: true,
        mood: s.mood ?? "slow",
        // Bed
        mattress: s.mattress ?? "cloud",
        pillowType: s.pillowType ?? "memory",
        pillowFirmness: s.pillowFirmness ?? "soft",
        duvetWeight: s.duvetWeight ?? "cocoon",
        extraPillows: s.extraPillows ?? "2",
        linenFabric: s.linenFabric ?? "silk",
        // Bar
        welcomeDrink: s.welcomeDrink ?? "juice",
        minibar: s.minibar ?? "refresher",
        // Atmosphere
        scent: s.scent ?? "lavender",
        lighting: s.lighting ?? "warm-dim",
        temperature: s.temperature ?? "19",
        music: s.music ?? "classical",
        flowers: s.flowers ?? "wildflowers",
        // Morning
        breakfastTime: s.breakfastTime ?? "coffee-first",
        breakfastLocation: s.breakfastLocation ?? "in-room",
        breakfastStyle: s.breakfastStyle ?? "light",
        coffee: s.coffee ?? "flat-white",
        tea: s.tea ?? "herbal",
        // Moments
        spa: s.spa ?? "deep-tissue",
        dining: s.dining ?? "in-room",
        activities: s.activities.length ? s.activities : ["meditation", "lap-pool"],
        // Words
        words: s.words ?? "I'll be arriving after a long flight. Anything to help me settle in would be wonderful.",
      }))
    } else {
      setSelections((s) => ({ ...s, jetLag: false }))
    }
  }, [setJetLagRaw])

  const goTo = React.useCallback((id: ChapterId) => {
    setStep(id)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  const next = React.useCallback(() => {
    setStep((cur) => {
      const i = order.indexOf(cur)
      const n = order[Math.min(i + 1, order.length - 1)]
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
      return n
    })
  }, [order])

  const back = React.useCallback(() => {
    setStep((cur) => {
      const i = order.indexOf(cur)
      const n = order[Math.max(i - 1, 0)]
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
      return n
    })
  }, [order])

  const progress = React.useMemo(() => {
    const chapterIds = chapters.map((c) => c.id) as ChapterId[]
    const i = chapterIds.indexOf(step as ChapterId)
    if (step === "welcome" || step === "mood") return 0
    if (step === "summary") return 1
    return (i + 1) / chapterIds.length
  }, [step])

  const value: PreludeState = {
    selections,
    setSelection,
    toggleInSet,
    step,
    goTo,
    next,
    back,
    progress,
    jetLag,
    setJetLag,
  }

  return <PreludeContext.Provider value={value}>{children}</PreludeContext.Provider>
}

export function usePrelude() {
  const ctx = React.useContext(PreludeContext)
  if (!ctx) throw new Error("usePrelude must be used inside PreludeProvider")
  return ctx
}
