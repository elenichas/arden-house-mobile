"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePrelude } from "./prelude-context"
import { chapters } from "./data"
import type { ChapterId, Selections } from "./types"
import { GoldRule, Kicker } from "./primitives"

/* Build a short, graceful status line for each chapter, from its selections. */
function statusFor(id: ChapterId, s: Selections): string | null {
  const parts: (string | undefined)[] = []
  switch (id) {
    case "bed":
      parts.push(s.mattress, s.pillowType, s.duvetWeight)
      break
    case "bar":
      parts.push(s.welcomeDrink, s.minibar)
      if (s.dietary.length) parts.push(`${s.dietary.length} notes`)
      break
    case "atmosphere":
      parts.push(s.scent, s.lighting, s.music)
      break
    case "morning":
      parts.push(s.breakfastTime, s.breakfastLocation, s.coffee)
      break
    case "moments":
      parts.push(s.spa, s.dining, s.occasion)
      if (s.activities.length) parts.push(`${s.activities.length} experiences`)
      break
    case "words":
      if (s.words && s.words.trim().length > 0) return "A note for Lucien"
      return null
  }
  const filled = parts.filter((p): p is string => Boolean(p)).length
  if (!filled) return null
  return `${filled} ${filled === 1 ? "choice" : "choices"} made`
}

export function ChapterIndex({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { goTo, selections, step } = usePrelude()

  const handleJump = React.useCallback(
    (id: ChapterId) => {
      goTo(id)
      onClose()
    },
    [goTo, onClose],
  )

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* Backdrop — warm cream wash */}
          <motion.div
            key="index-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[color-mix(in_oklch,var(--ink)_30%,transparent)] backdrop-blur-[2px]"
            aria-hidden
          />

          {/* Sheet — slides up on mobile, from right on desktop */}
          <motion.div
            key="index-sheet"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Chapter index"
            className={cn(
              "fixed z-50",
              // mobile: bottom sheet, almost full height
              "inset-x-0 bottom-0 top-6 rounded-t-[24px]",
              // desktop: right drawer
              "sm:inset-y-0 sm:right-0 sm:left-auto sm:top-0 sm:w-[440px] sm:rounded-none sm:rounded-l-[24px]",
              "flex flex-col overflow-hidden",
              "bg-[var(--cream)] border border-[color:color-mix(in_oklch,var(--ink)_8%,transparent)]",
            )}
          >
            {/* Drag affordance */}
            <div className="flex justify-center pt-2 sm:hidden">
              <span className="h-1 w-10 rounded-full bg-[color:color-mix(in_oklch,var(--ink)_12%,transparent)]" />
            </div>

            <header className="flex items-start justify-between gap-4 px-6 pt-6 sm:pt-8">
              <div>
                <Kicker className="mb-2">Profile sections</Kicker>
                <h3 className="italic font-light text-ink-soft">Jump to any room preference.</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-cream-soft transition-colors duration-300"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </header>

            <GoldRule className="ml-6 mt-5" />

            {/* List */}
            <nav className="flex-1 overflow-y-auto px-2 py-4 sm:px-3">
              <IndexRow
                id="mood"
                index="00"
                title="Room feel"
                subtitle="The starting point for your preferences"
                status={selections.mood ? "set" : null}
                active={step === "mood"}
                onJump={() => handleJump("mood")}
              />
              {chapters.map((c) => (
                <IndexRow
                  key={c.id}
                  id={c.id}
                  index={String(c.index).padStart(2, "0")}
                  title={c.title}
                  subtitle={c.subtitle}
                  status={statusFor(c.id, selections)}
                  active={step === c.id}
                  onJump={() => handleJump(c.id)}
                />
              ))}
              <IndexRow
                id="summary"
                index="—"
                title="Summary"
                subtitle="Review your room setup"
                status={null}
                active={step === "summary"}
                onJump={() => handleJump("summary")}
                isFinal
              />
            </nav>

            <footer className="border-t border-[color:color-mix(in_oklch,var(--ink)_8%,transparent)] px-6 py-4">
              <p className="font-serif italic text-ink-soft text-[13px] leading-relaxed">
                Your choices are kept as you move between chapters.
              </p>
            </footer>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

function IndexRow({
  index,
  title,
  subtitle,
  status,
  active,
  onJump,
  isFinal,
}: {
  id: string
  index: string
  title: string
  subtitle: string
  status: string | null
  active: boolean
  onJump: () => void
  isFinal?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onJump}
      className={cn(
        "group w-full rounded-[14px] px-4 py-4 text-left transition-colors duration-500",
        "flex items-start gap-4",
        active
          ? "glass-soft !border-[color:color-mix(in_oklch,var(--gold)_40%,transparent)]"
          : "hover:bg-cream-soft/40",
      )}
    >
      <span
        className={cn(
          "mt-1 font-sans text-[11px] tracking-[0.24em] uppercase tabular-nums",
          active ? "text-gold-deep" : "text-ink-muted",
          isFinal && "italic tracking-normal",
        )}
      >
        {index}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-serif text-[19px] leading-tight text-ink">{title}</span>
        <span className="mt-0.5 block font-serif italic text-[13.5px] leading-snug text-ink-soft">
          {subtitle}
        </span>
        {status ? (
          <span
            className={cn(
              "mt-2 inline-flex items-center rounded-full px-2.5 py-0.5",
              "font-sans text-[10.5px] tracking-[0.18em] uppercase",
              "bg-[color:color-mix(in_oklch,var(--gold)_10%,var(--cream-soft))]",
              "text-gold-deep",
            )}
          >
            {status}
          </span>
        ) : null}
      </span>
      <ArrowUpRight
        className={cn(
          "mt-1.5 h-4 w-4 shrink-0 transition-all duration-500",
          active ? "text-gold-deep" : "text-ink-muted/60 group-hover:text-ink-soft",
          "group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
        )}
        strokeWidth={1.5}
      />
    </button>
  )
}
