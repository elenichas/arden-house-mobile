"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Moon } from "lucide-react"
import { Display, GoldRule, Kicker } from "./primitives"
import { usePrelude } from "./prelude-context"
import { useArdenOptional } from "@/components/arden/arden-context"
import {
  activityOptions,
  breakfastLocationOptions,
  breakfastStyleOptions,
  breakfastTimeOptions,
  coffeeOptions,
  dietaryOptions,
  diningOptions,
  duvetOptions,
  extraDuvetOptions,
  extraPillowsOptions,
  flowerOptions,
  guest,
  lightingOptions,
  linenFabricOptions,
  mattressOptions,
  minibarCollections,
  musicOptions,
  pillowFirmnessOptions,
  pillowTypeOptions,
  readingOptions,
  scentOptions,
  spaOptions,
  teaOptions,
  welcomeDrinkOptions,
} from "./data"
import type { Selections } from "./types"
import { cn } from "@/lib/utils"

function label<T extends { id: string; label: string }>(opts: readonly T[], id?: string) {
  if (!id) return undefined
  return opts.find((o) => o.id === id)?.label
}

function daysUntil(iso: string) {
  const target = new Date(iso).getTime()
  const now = Date.now()
  return Math.max(0, Math.round((target - now) / (1000 * 60 * 60 * 24)))
}

function buildNarrative(s: Selections) {
  const parts: string[] = []

  const scent = scentOptions.find((o) => o.id === s.scent)?.label
  if (scent) parts.push(`the scent of ${scent.toLowerCase()} in the air`)

  const lighting = lightingOptions.find((o) => o.id === s.lighting)?.label.toLowerCase()
  if (lighting) parts.push(`the light ${lighting}`)

  const music = musicOptions.find((o) => o.id === s.music)?.label.toLowerCase()
  if (music) {
    parts.push(
      music === "no music" ? "no music on arrival" : `${music} playing softly`,
    )
  }

  const welcome = welcomeDrinkOptions.find((o) => o.id === s.welcomeDrink)?.label.toLowerCase()
  if (welcome && welcome !== "nothing, thank you") {
    parts.push(`${welcome} waiting on the side table`)
  }

  const bed = mattressOptions.find((o) => o.id === s.mattress)?.label.toLowerCase()
  if (bed) parts.push(`the bed turned down, ${bed}`)

  if (!parts.length) return "we'll use our standard room setup."

  if (parts.length === 1) return parts[0] + "."
  const last = parts.pop()
  return parts.join(", ") + ", and " + last + "."
}

type TileProps = {
  heading: string
  value?: string
  image?: string
  span?: "1" | "2"
}

type TileDef = TileProps & { key: string }

function Tile({ heading, value, image, span = "1", index }: TileProps & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.9,
        delay: 0.15 + index * 0.06,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      className={cn(
        "relative overflow-hidden rounded-[18px] glass-card",
        span === "2" && "sm:col-span-2",
      )}
    >
      {image ? (
        <div className="relative aspect-[5/3] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-ink/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="font-sans text-[10px] uppercase tracking-[0.26em] text-cream/80">
              {heading}
            </div>
            <div className="mt-1 font-serif text-xl leading-tight text-cream">{value}</div>
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="font-sans text-[10px] uppercase tracking-[0.26em] text-ink-muted">
            {heading}
          </div>
          <div className="mt-1.5 font-serif text-lg leading-snug text-ink">{value}</div>
        </div>
      )}
    </motion.div>
  )
}

export function Summary() {
  const { selections, back, goTo, jetLag } = usePrelude()
  const arden = useArdenOptional()
  const [sent, setSent] = React.useState(false)
  const days = daysUntil(guest.checkIn)

  const scentImg = scentOptions.find((s) => s.id === selections.scent)?.image
  const minibarImg = minibarCollections.find((m) => m.id === selections.minibar)?.image
  const minibarLabel = minibarCollections.find((m) => m.id === selections.minibar)?.label

  const dietaryLabels = selections.dietary
    .map((id) => dietaryOptions.find((d) => d.id === id)?.label)
    .filter(Boolean) as string[]

  const activitiesLabels = selections.activities
    .map((id) => activityOptions.find((d) => d.id === id)?.label)
    .filter(Boolean) as string[]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative mx-auto w-full max-w-3xl px-5 pt-[calc(68px+env(safe-area-inset-top))] pb-14 sm:px-8"
    >
      <button
        type="button"
        onClick={back}
        className="mb-4 mt-2 inline-flex items-center gap-2 text-sm font-sans text-ink-muted hover:text-ink transition-colors duration-500"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Adjust something
      </button>

      <header className="mb-12">
        <Kicker className="mb-5">Review</Kicker>
        <Display className="mb-5">
          Your room preferences
          <br />
          <span className="italic font-light text-ink-soft">are ready to send.</span>
        </Display>
        <GoldRule className="mb-6" />

        {/* Jet-lag recovery badge */}
        {jetLag && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full glass-soft !border-[color:color-mix(in_oklch,var(--gold)_30%,transparent)] px-4 py-2"
          >
            <Moon className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.4} />
            <span className="font-sans text-[11px] tracking-[0.18em] uppercase text-ink-soft">
              Your recovery plan
            </span>
          </motion.div>
        )}

        <p className="max-w-xl font-serif italic text-ink-soft text-lg sm:text-xl leading-relaxed">
          In {days} {days === 1 ? "day" : "days"}, your room at {guest.roomName} will be waiting.{" "}
          {buildNarrative(selections)}
        </p>
      </header>

      {/* The mood board — worth screenshotting */}
      {(() => {
        const tiles: TileDef[] = [
          { key: "scent", heading: "Your scent", value: label(scentOptions, selections.scent), image: scentImg, span: "2" as const },
          { key: "light", heading: "Your light", value: label(lightingOptions, selections.lighting) },
          {
            key: "temp",
            heading: "Temperature",
            value: selections.temperature ? `${selections.temperature}°C` : undefined,
          },
          { key: "music", heading: "Music", value: label(musicOptions, selections.music) },
          { key: "flowers", heading: "Flowers", value: label(flowerOptions, selections.flowers) },
          { key: "welcome", heading: "A welcome drink", value: label(welcomeDrinkOptions, selections.welcomeDrink) },
          { key: "minibar", heading: "Minibar", value: minibarLabel, image: minibarImg, span: "2" as const },
          { key: "mattress", heading: "Mattress", value: label(mattressOptions, selections.mattress) },
          { key: "pillow", heading: "Pillow", value: label(pillowTypeOptions, selections.pillowType) },
          { key: "firm", heading: "Pillow firmness", value: label(pillowFirmnessOptions, selections.pillowFirmness) },
          { key: "duvet", heading: "Duvet", value: label(duvetOptions, selections.duvetWeight) },
          { key: "extraPillows", heading: "Extra pillows", value: label(extraPillowsOptions, selections.extraPillows) },
          { key: "extraDuvet", heading: "Extra duvet", value: label(extraDuvetOptions, selections.extraDuvet) },
          { key: "linenFabric", heading: "Linen", value: label(linenFabricOptions, selections.linenFabric) },
          { key: "time", heading: "Breakfast at", value: label(breakfastTimeOptions, selections.breakfastTime) },
          { key: "location", heading: "Served", value: label(breakfastLocationOptions, selections.breakfastLocation) },
          { key: "style", heading: "Style", value: label(breakfastStyleOptions, selections.breakfastStyle) },
          { key: "coffee", heading: "Coffee", value: label(coffeeOptions, selections.coffee) },
          { key: "tea", heading: "Tea", value: label(teaOptions, selections.tea) },
          { key: "reading", heading: "To read", value: label(readingOptions, selections.reading) },
          { key: "spa", heading: "Spa", value: label(spaOptions, selections.spa) },
          { key: "dining", heading: "Dining", value: label(diningOptions, selections.dining) },
        ].filter((t) => t.value || t.image)

        if (tiles.length === 0) {
                      return (
            <div className="rounded-[18px] glass-card p-10 text-center">
              <p className="font-serif italic text-ink-soft text-lg">
                You haven&apos;t added any preferences yet. We&apos;ll prepare the room to our standard setup.
              </p>
            </div>
          )
        }

        return (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {tiles.map(({ key, ...rest }, i) => (
              <Tile key={key} index={i} {...rest} />
            ))}
          </div>
        )
      })()}

      {dietaryLabels.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 font-sans text-[11px] tracking-[0.26em] uppercase text-ink-muted">
            We&apos;ll remember
          </h3>
          <div className="flex flex-wrap gap-2">
            {dietaryLabels.map((l) => (
              <span
                key={l}
                className="rounded-full glass-pill px-3.5 py-1.5 text-sm font-sans text-ink"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {activitiesLabels.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 font-sans text-[11px] tracking-[0.26em] uppercase text-ink-muted">
            Optional services
          </h3>
          <div className="flex flex-wrap gap-2">
            {activitiesLabels.map((l) => (
              <span
                key={l}
                className="rounded-full glass-pill px-3.5 py-1.5 text-sm font-sans text-ink-soft"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {selections.words ? (
        <div className="mt-10 rounded-[18px] glass-card p-6 ring-gold">
          <h3 className="mb-3 font-sans text-[11px] tracking-[0.26em] uppercase text-ink-muted">
            In your words
          </h3>
          <p className="font-serif italic text-xl leading-relaxed text-ink text-pretty">
            &ldquo;{selections.words}&rdquo;
          </p>
        </div>
      ) : null}

      <div className="mt-14 border-t border-[color:color-mix(in_oklch,var(--ink)_10%,transparent)] pt-8">
        <p className="font-serif italic text-ink text-xl sm:text-2xl leading-relaxed max-w-xl text-balance">
          Safe travels, {guest.title} {guest.lastName}. We&apos;ll prepare the room from these notes.
        </p>
        <p className="mt-3 font-serif text-base text-ink-muted">Lucien, your concierge</p>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
            className="mt-8 flex items-start gap-3 rounded-[16px] glass-soft p-4"
          >
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_oklch,var(--gold)_18%,var(--cream-soft))] text-gold-deep">
              <Check className="h-4 w-4" strokeWidth={1.7} />
            </span>
            <div>
              <div className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
                Preferences sent
              </div>
              <p className="mt-1 font-serif italic text-[13.5px] leading-snug text-ink-soft">
                Your Arrival Profile has been added to the mock itinerary for this stay.
              </p>
            </div>
          </motion.div>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSent(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-ink px-5 py-2.5 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-cream shadow-[0_18px_34px_-24px_color-mix(in_oklch,var(--ink)_72%,transparent)] transition-colors duration-500 hover:bg-[color:color-mix(in_oklch,var(--ink)_80%,var(--terracotta)_20%)]"
          >
            {sent ? (
              <Check className="h-4 w-4" strokeWidth={1.6} />
            ) : (
              <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            )}
            {sent ? "Sent" : "Send preferences"}
          </button>
          {arden ? (
            <button
              type="button"
              onClick={() => arden.jumpTo("stay")}
              className="rounded-full px-5 py-2.5 text-sm font-sans text-ink-soft ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--ink)_15%,transparent)] transition-all duration-500 hover:text-ink hover:ring-[color:color-mix(in_oklch,var(--ink)_28%,transparent)]"
            >
              Return to stay
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => goTo("bed")}
            className="rounded-full px-5 py-2.5 text-sm font-sans text-ink-soft ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--ink)_15%,transparent)] hover:ring-[color:color-mix(in_oklch,var(--ink)_28%,transparent)] hover:text-ink transition-all duration-500"
          >
            Adjust a chapter
          </button>
          <button
            type="button"
            onClick={() => goTo("mood")}
            className="rounded-full px-5 py-2.5 text-sm font-sans text-ink-muted hover:text-ink transition-colors duration-500"
          >
            Start again
          </button>
        </div>
      </div>
    </motion.section>
  )
}
