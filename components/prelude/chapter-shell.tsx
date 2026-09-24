"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, LayoutGrid, Moon } from "lucide-react"
import { ConciergeButton, Display, GoldRule, Kicker } from "./primitives"
import { usePrelude } from "./prelude-context"
import { chapters } from "./data"
import { ChapterIndex } from "./chapter-index"
import { cn } from "@/lib/utils"
import type { ChapterId, Selections } from "./types"

/* Per-chapter "filled" check — used to color the progress dots */
function isFilled(id: ChapterId, s: Selections) {
  switch (id) {
          case "bed":
        return Boolean(s.mattress || s.pillowType || s.duvetWeight || s.extraPillows || s.extraDuvet || s.linenFabric || s.pillowFirmness)
    case "bar":
      return Boolean(s.welcomeDrink || s.minibar || s.dietary.length || s.specialAdditions)
    case "atmosphere":
      return Boolean(s.scent || s.lighting || s.temperature || s.music || s.flowers)
    case "morning":
      return Boolean(
        s.breakfastTime || s.breakfastLocation || s.breakfastStyle || s.coffee || s.tea || s.reading,
      )
    case "moments":
      return Boolean(s.spa || s.dining || s.occasion || s.activities.length)
    case "words":
      return Boolean(s.words && s.words.trim().length > 0)
    default:
      return false
  }
}

export function ChapterShell({
  kicker,
  title,
  subtitle,
  children,
  footerHint,
  nextLabel = "Continue",
  heroImage,
  heroImageAlt = "",
}: {
  kicker: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  children: React.ReactNode
  footerHint?: string
  nextLabel?: string
  /** When supplied, the kicker + title are overlaid on top of this photograph
   *  (instead of sitting above it as a separate block). Reduces vertical
   *  space so the first decision is in the viewport sooner.
   *  A bottom-weighted ink gradient guarantees WCAG AA on the overlaid text. */
  heroImage?: string
  heroImageAlt?: string
}) {
  const { back, next, step, selections, goTo, jetLag } = usePrelude()
  const [indexOpen, setIndexOpen] = React.useState(false)

  const currentIdx = chapters.findIndex((c) => c.id === step)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative mx-auto w-full max-w-2xl px-5 pt-[calc(84px+env(safe-area-inset-top))] pb-10 sm:px-8"
    >
      {/* Top bar: back  |  progress dots  |  Chapters */}
      <div className="mb-7 flex items-center gap-3">
        <button
          type="button"
          onClick={back}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-cream-soft transition-colors duration-500"
          aria-label="Previous chapter"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div className="flex flex-1 items-center justify-center gap-1.5" role="tablist">
          {chapters.map((c) => {
            const isCurrent = c.id === step
            const filled = isFilled(c.id, selections)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => goTo(c.id)}
                aria-label={`Go to ${c.title}`}
                aria-current={isCurrent ? "step" : undefined}
                className="group relative inline-flex h-6 w-6 items-center justify-center"
              >
                <motion.span
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1 : 0.85,
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                  className={cn(
                    "block rounded-full transition-colors duration-500",
                    isCurrent
                      ? "h-2.5 w-2.5 bg-gold"
                      : filled
                      ? "h-1.5 w-1.5 bg-[color:color-mix(in_oklch,var(--gold)_55%,transparent)]"
                      : "h-1.5 w-1.5 bg-[color:color-mix(in_oklch,var(--ink)_14%,transparent)]",
                  )}
                />
                {isCurrent ? (
                  <motion.span
                    aria-hidden
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.18 }}
                    transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
                    className="absolute h-5 w-5 rounded-full bg-gold"
                  />
                ) : null}
              </button>
            )
          })}
          <span className="ml-2 font-sans text-[10.5px] tracking-[0.24em] uppercase text-ink-muted tabular-nums">
            {String(currentIdx + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIndexOpen(true)}
          aria-label="Open chapter index"
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-3",
            "text-[11px] font-sans font-medium tracking-[0.16em] uppercase",
            "text-ink-muted hover:text-ink hover:bg-cream-soft transition-colors duration-500",
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="hidden sm:inline">Chapters</span>
        </button>
      </div>

      {heroImage ? (
        /* Compact hero: image + title merged into one block.
           The dark gradient at the lower third is dense enough (ink/80) that
           cream text on it is >10:1 — well clear of WCAG AA. */
        <header className="mb-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative -mx-5 overflow-hidden sm:mx-0 sm:rounded-[22px]"
          >
            <div className="relative aspect-[16/10] sm:aspect-[21/10] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage || "/placeholder.svg"}
                alt={heroImageAlt}
                className="h-full w-full object-cover"
              />
              {/* Readability gradient — heavy at the bottom, feathered above.
                  Cream text on this reads cleanly even over pale imagery. */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/35 to-transparent" />

              {/* Title overlay — flex-end on inset-0 puts content at the
                  bottom of the hero regardless of aspect ratio, without
                  depending on `bottom-N` classes (which occasionally don't
                  resolve reliably inside aspect-ratio containers). */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
                <div className="mb-2 font-sans text-[10.5px] tracking-[0.28em] uppercase text-cream/90">
                  {kicker}
                </div>
                <h1 className="text-display text-cream text-balance text-[30px] sm:text-4xl leading-[1.05] drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)]">
                  {title}
                </h1>
              </div>
            </div>
          </motion.div>

          {subtitle ? (
            <p className="mt-5 max-w-lg text-ink-soft text-[15px] sm:text-base leading-relaxed font-serif italic">
              {subtitle}
            </p>
          ) : null}
          <GoldRule className="mt-5" />
        </header>
      ) : (
        <header className="mb-8 max-w-xl">
          <Kicker className="mb-3">{kicker}</Kicker>
          <Display className="mb-3 text-3xl sm:text-4xl md:text-5xl">{title}</Display>
          {subtitle ? (
            <p className="mt-2 text-ink-soft text-[15px] sm:text-base leading-relaxed font-serif italic">
              {subtitle}
            </p>
          ) : null}
          <GoldRule className="mt-5" />
        </header>
      )}

      {/* Jet-lag hint banner — appears at the top of every chapter when
          jet-lag mode has pre-filled recovery defaults. */}
      {jetLag && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          className="mb-6 flex items-center gap-2.5 rounded-[14px] px-4 py-3 glass-soft !border-[color:color-mix(in_oklch,var(--gold)_30%,transparent)]"
        >
          <Moon className="h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.4} />
          <p className="font-serif italic text-[13px] leading-snug text-ink-soft">
            Tuned for rest. Adjust anything that doesn&apos;t feel right.
          </p>
        </motion.div>
      )}

      <div className="space-y-6">{children}</div>

      {/* Footer — single forward action, back is in the top bar */}
      <div className="mt-6 flex items-center justify-end">
        <ConciergeButton onClick={next}>
          {nextLabel}
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </ConciergeButton>
      </div>

      {footerHint ? (
        <p className={cn("mt-5 text-right text-[12px] text-ink-muted/80 italic")}>
          {footerHint}
        </p>
      ) : null}

      <ChapterIndex open={indexOpen} onClose={() => setIndexOpen(false)} />
    </motion.section>
  )
}

export function ChapterBlock({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="mb-3 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
        {label}
      </h3>
      {children}
    </div>
  )
}
