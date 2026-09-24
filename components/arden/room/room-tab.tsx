"use client"

import * as React from "react"
import { AnimatePresence } from "framer-motion"
import { PreludeProvider, usePrelude } from "@/components/prelude/prelude-context"
import { cn } from "@/lib/utils"
import { Mood } from "@/components/prelude/mood"
import { ChapterBed } from "@/components/prelude/chapter-bed"
import { ChapterBar } from "@/components/prelude/chapter-bar"
import { ChapterAtmosphere } from "@/components/prelude/chapter-atmosphere"
import { ChapterMorning } from "@/components/prelude/chapter-morning"
import { ChapterMoments } from "@/components/prelude/chapter-moments"
import { ChapterWords } from "@/components/prelude/chapter-words"
import { Summary } from "@/components/prelude/summary"

function PreludeStage() {
  const { step } = usePrelude()

  return (
    <AnimatePresence mode="wait">
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

/** Wraps Prelude content so the .jet-lag class (and its CSS
 *  custom-property overrides) scope correctly to this subtree. */
function PreludeShell({ children }: { children: React.ReactNode }) {
  const { jetLag } = usePrelude()

  return (
    <div
      className={cn(
        "relative w-full",
        "transition-[background-color] duration-[1.2s] ease-[cubic-bezier(0.22,0.61,0.36,1)]",
        jetLag && "jet-lag",
      )}
    >
      {children}
    </div>
  )
}

export function RoomTab() {
  return (
    <PreludeProvider skipWelcome>
      <PreludeShell>
        <PreludeStage />
      </PreludeShell>
    </PreludeProvider>
  )
}
