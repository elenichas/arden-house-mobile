"use client"

import * as React from "react"
import { AnimatePresence } from "framer-motion"
import { PreludeProvider, usePrelude } from "./prelude-context"
import { cn } from "@/lib/utils"
import { Welcome } from "./welcome"
import { Mood } from "./mood"
import { ChapterBed } from "./chapter-bed"
import { ChapterBar } from "./chapter-bar"
import { ChapterAtmosphere } from "./chapter-atmosphere"
import { ChapterMorning } from "./chapter-morning"
import { ChapterMoments } from "./chapter-moments"
import { ChapterWords } from "./chapter-words"
import { Summary } from "./summary"

function Stage() {
  const { step } = usePrelude()

  return (
    <AnimatePresence mode="wait">
      {step === "welcome" && <Welcome key="welcome" />}
      {step === "mood" && <Mood key="mood" />}
      {step === "bed" && <ChapterBed key="bed" />}
      {step === "bar" && <ChapterBar key="bar" />}
      {step === "atmosphere" && <ChapterAtmosphere key="atmosphere" />}
      {step === "morning" && <ChapterMorning key="morning" />}
      {step === "moments" && <ChapterMoments key="moments" />}
      {step === "words" && <ChapterWords key="words" />}
      {step === "summary" && <Summary key="summary" />}
    </AnimatePresence>
  )
}

function PreludeShell({ children }: { children: React.ReactNode }) {
  const { jetLag } = usePrelude()

  return (
    <main
      className={cn(
        "relative min-h-[100svh] w-full bg-background overflow-x-hidden",
        "transition-[background-color] duration-[1.2s] ease-[cubic-bezier(0.22,0.61,0.36,1)]",
        jetLag && "jet-lag",
      )}
    >
      {children}
    </main>
  )
}

export function PreludeApp() {
  return (
    <PreludeProvider>
      <PreludeShell>
        <Stage />
      </PreludeShell>
    </PreludeProvider>
  )
}
