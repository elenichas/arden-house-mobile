"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ConciergeButton, Display, GoldRule, OptionCard } from "./primitives"
import { moodOptions } from "./data"
import { usePrelude } from "./prelude-context"
import { ArrowRight, LayoutGrid, Moon } from "lucide-react"
import { ChapterIndex } from "./chapter-index"
import { cn } from "@/lib/utils"

export function Mood() {
  const { selections, setSelection, next, jetLag, setJetLag } = usePrelude()
  const [indexOpen, setIndexOpen] = React.useState(false)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 1.0, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative w-full overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/rebrand/hotel-lobby.png"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--cream)] via-[color-mix(in_oklch,var(--cream)_85%,transparent)] to-[var(--cream)]" />
      </div>

      {/* Chapters button — always available from the first step. */}
      <button
        type="button"
        onClick={() => setIndexOpen(true)}
        aria-label="Open chapter index"
        className="absolute right-5 top-[calc(86px+env(safe-area-inset-top))] z-20 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-sans font-medium tracking-[0.16em] uppercase text-ink-muted hover:text-ink hover:bg-cream-soft transition-colors duration-500"
      >
        <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="hidden sm:inline">Chapters</span>
      </button>

      <div className="mx-auto flex w-full max-w-2xl flex-col px-5 pt-[calc(84px+env(safe-area-inset-top))] pb-[calc(150px+env(safe-area-inset-bottom))] sm:px-8">
        <p className="mb-3 max-w-md font-sans text-sm leading-relaxed text-ink-soft">
          Start with the room atmosphere.
        </p>
        <Display className="mb-5">
          How should your room feel when you arrive?
        </Display>
        <GoldRule className="mb-6" />
        {/* <p className="max-w-md text-ink-soft text-base leading-relaxed font-serif italic">
          There are no wrong answers. This is only to help us understand the shape of your stay.
        </p> */}


        {/* Jet Lag recovery toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-6"
        >
          <button
            type="button"
            onClick={() => setJetLag(!jetLag)}
            className={cn(
              "group flex w-full items-start gap-4 rounded-[20px] p-5 text-left",
              "transition-all duration-700 ease-out",
              jetLag
                ? "glass-card !border-[color:color-mix(in_oklch,var(--gold)_50%,transparent)] ring-gold"
                : "glass-soft hover:!border-[color:color-mix(in_oklch,white_30%,var(--cream)_25%)]",
            )}
          >
            <span
              className={cn(
                "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                "transition-all duration-700",
                jetLag
                  ? "bg-[color:color-mix(in_oklch,var(--ink)_88%,var(--gold-deep)_12%)] text-gold shadow-[0_4px_10px_-8px_color-mix(in_oklch,var(--ink)_50%,transparent)]"
                  : "bg-[color:color-mix(in_oklch,var(--ink)_8%,transparent)] text-ink-muted",
              )}
            >
              <Moon className="h-5 w-5" strokeWidth={1.4} />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-serif text-[17px] leading-tight text-ink">
                  Arriving jet-lagged?
                </span>
                {/* Custom toggle indicator */}
                <span
                  aria-hidden
                  className={cn(
                    "relative inline-flex h-[22px] w-9 shrink-0 items-center rounded-full",
                    "transition-colors duration-500",
                    jetLag
                      ? "bg-[color:color-mix(in_oklch,var(--gold-deep)_85%,var(--ink)_15%)]"
                      : "bg-[color:color-mix(in_oklch,var(--ink)_12%,transparent)]",
                  )}
                >
                  <span
                    className={cn(
                      "block h-4 w-4 rounded-full bg-cream shadow-sm",
                      "transition-transform duration-500 ease-out",
                      jetLag ? "translate-x-[18px]" : "translate-x-[3px]",
                    )}
                  />
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-snug text-ink-muted font-serif italic">
                {jetLag
                  ? "We\u2019ll suggest cooler sheets, lower light, quieter service, and a slower morning. You can change anything."
                  : "Turn this on for room settings that support rest after a long flight."}
              </p>
            </div>
          </button>
        </motion.div>
        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          {moodOptions.map((m) => (
            <OptionCard
              key={m.id}
              orientation="horizontal"
              className="p-3 sm:p-4"
              selected={selections.mood === m.id}
              onSelect={() => setSelection("mood", m.id)}
              label={m.label}
              hint={m.hint}
            />
          ))}
        </div>


        <div className="mt-28 flex items-center gap-4">
          <ConciergeButton onClick={next} disabled={!selections.mood}>
            Begin
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </ConciergeButton>
          <button
            type="button"
            onClick={next}
            className="font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-500 underline-offset-4 hover:underline"
          >
            Skip this
          </button>
        </div>
      </div>

      <ChapterIndex open={indexOpen} onClose={() => setIndexOpen(false)} />
    </motion.section>
  )
}
