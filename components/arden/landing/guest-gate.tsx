"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, CalendarCheck, PlusCircle, RotateCcw } from "lucide-react"
import { BrandMark, ElevationMark, GoldRule, Card } from "../primitives"
import { hotel } from "../data"
import type { GuestType } from "../types"

/**
 * Guest Gate — the first screen after the splash dissolves.
 *
 * Presents three paths into the hotel experience, each beginning a
 * different narrative arc for the prototype:
 *
 *  1. "booked"     — New guest with a confirmed reservation.
 *  2. "new"        — New guest, no booking yet.
 *  3. "returning"  — Returning guest with history.
 *
 * The gate carries the same warm, unhurried editorial tone as the rest
 * of the app — slow reveals, cream glass, Cormorant headings.
 */
export function GuestGate({ onChoose }: { onChoose: (type: GuestType) => void }) {
  const paths: {
    id: GuestType
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
    title: string
    hint: string
  }[] = [
    {
      id: "booked",
      icon: CalendarCheck,
      title: "I have a reservation",
      hint: "Review your stay and set a few room preferences before arrival.",
    },
    {
      id: "new",
      icon: PlusCircle,
      title: "I\u2019d like to book",
      hint: "Compare rooms, amenities, and rates for your dates.",
    },
    {
      id: "returning",
      icon: RotateCcw,
      title: "Welcome back",
      hint: "Rebook a previous room or reuse your saved preferences.",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
      className="fixed inset-0 z-[90] flex flex-col bg-cream overflow-y-auto"
    >
      {/* Header — Prelude style: serif label + gold rule, transparent */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
        className="flex items-center justify-between px-5 pt-[calc(16px+env(safe-area-inset-top))] pb-3 sm:px-8"
      >
        <div className="flex items-center gap-3">
          <BrandMark logo="signature" height="h-7" variant="dark" />
          <span className="h-px w-8 bg-[color:color-mix(in_oklch,var(--gold)_85%,transparent)]" />
        </div>
        <span className="font-sans text-[10.5px] uppercase tracking-[0.28em] text-ink-muted">
          Arden House
        </span>
      </motion.div>

      {/* Elevation drawing — quiet architectural detail */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        className="flex justify-center pt-4 pb-2"
      >
        <ElevationMark height="h-16" variant="dark" className="opacity-25" />
      </motion.div>

      {/* Body */}
      <div className="mx-auto w-full max-w-xl flex-1 px-5 pt-8 pb-16 sm:px-8">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="mb-3 font-sans text-[10.5px] tracking-[0.28em] uppercase text-ink-muted">
            {hotel.tagline}
          </div>
          <h1 className="text-display text-ink text-[30px] sm:text-[38px] leading-[1.04] text-balance">
            Welcome.
            <br />
            <span className="italic font-light text-ink-soft">How would you like to start?</span>
          </h1>
          <GoldRule className="mt-5" />
        </motion.div>

        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8 flex flex-col gap-3"
        >
          {paths.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.8 + i * 0.12,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
              >
                <Card interactive onClick={() => onChoose(p.id)} className="p-5">
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_oklch,var(--gold)_12%,var(--cream-soft))]">
                      <Icon className="h-4.5 w-4.5 text-gold-deep" strokeWidth={1.5} />
                    </span>
                    <div className="flex-1">
                      <div className="font-serif text-[18px] leading-tight text-ink">
                        {p.title}
                      </div>
                      <div className="mt-1 font-serif italic text-[13.5px] text-ink-soft leading-snug">
                        {p.hint}
                      </div>
                    </div>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-ink-muted"
                      strokeWidth={1.5}
                    />
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Quiet footer */}
        <motion.p
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, delay: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-10 text-center font-serif italic text-[13px] text-ink-muted"
        >
          {hotel.address} &middot; {hotel.phone}
        </motion.p>
      </div>
    </motion.div>
  )
}
