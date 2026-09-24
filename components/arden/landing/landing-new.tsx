"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Eye,
  MapPin,
  Sparkles,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, GoldRule, PrimaryButton, GhostButton } from "../primitives"
import { hotel, roomTypes } from "../data"
import type { NoiseLevel, RoomTypeId } from "../types"

/**
 * Landing: New Guest (no booking)
 *
 * A first-time guest who wants to explore and book. This page opens with
 * the hotel's editorial voice — the tagline, the elevation drawing — then
 * presents the four guestroom types as rich, browseable cards. The guest
 * can tap a room to select it, then proceed to reserve.
 */

function noiseIcon(n: NoiseLevel) {
  return n === "whisper" ? VolumeX : n === "quiet" ? Volume1 : Volume2
}

function noiseLabel(n: NoiseLevel) {
  return n === "whisper" ? "Whisper-quiet" : n === "quiet" ? "Quiet" : "Lively"
}

export function LandingNew({
  onEnterApp,
  onHome,
}: {
  onEnterApp: () => void
  onHome: () => void
}) {
  const [selectedRoom, setSelectedRoom] = React.useState<RoomTypeId>(
    roomTypes[0].id as RoomTypeId,
  )
  const selectedRoomName =
    roomTypes.find((r) => r.id === selectedRoom)?.name ?? "selected room"

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
      className="fixed inset-0 z-[90] flex flex-col bg-cream overflow-y-auto"
    >
      {/* Header — compact start control plus flow context */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
        className="flex items-center justify-between px-5 pt-[calc(16px+env(safe-area-inset-top))] pb-3 sm:px-8"
      >
        <button
          type="button"
          onClick={onHome}
          className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-[color:color-mix(in_oklch,var(--ink)_12%,transparent)] bg-[color:color-mix(in_oklch,var(--cream-soft)_82%,transparent)] px-3 font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft shadow-[0_4px_10px_-8px_color-mix(in_oklch,var(--ink)_45%,transparent)] backdrop-blur-md transition-colors duration-300 hover:text-ink"
          aria-label="Back to start"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
          Start
        </button>
        <span className="font-sans text-[10.5px] uppercase tracking-[0.28em] text-ink-muted">
          Book a guestroom
        </span>
      </motion.div>

      <div className="mx-auto w-full max-w-xl px-5 pt-6 pb-16 sm:px-8">
        {/* Hero introduction */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="mb-3 font-sans text-[10.5px] tracking-[0.28em] uppercase text-ink-muted">
            {hotel.tagline}
          </div>
          <h1 className="text-display text-ink text-[30px] sm:text-[38px] leading-[1.04] text-balance">
            Choose the room
            <br />
            <span className="italic font-light text-ink-soft">that fits your stay.</span>
          </h1>
          <GoldRule className="mt-5" />
          <p className="mt-5 max-w-md font-serif italic text-ink-soft text-[15px] leading-relaxed">
            Compare space, quiet, view, and nearby amenities. Select a room now;
            final payment details can be handled later.
          </p>
        </motion.div>

        {/* Room catalogue */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-10 flex flex-col gap-5"
        >
          {roomTypes.map((r, i) => {
            const selected = selectedRoom === r.id
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.5 + i * 0.1,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
              >
                <Card
                  interactive
                  onClick={() => setSelectedRoom(r.id as RoomTypeId)}
                  className={cn(
                    "overflow-hidden ring-1 ring-inset transition-all duration-500",
                    selected
                      ? "ring-[color:color-mix(in_oklch,var(--gold)_70%,transparent)]"
                      : "ring-transparent",
                  )}
                >
                  {/* Room image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.image || "/placeholder.svg"}
                      alt={r.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="glass-card absolute left-4 bottom-4 rounded-full px-3.5 py-1.5">
                      <span className="font-serif text-[15px] tabular-nums text-ink">
                        ${r.pricePerNight}
                      </span>
                      <span className="ml-1.5 font-sans text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                        / night
                      </span>
                    </div>
                    {selected && (
                      <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-cream shadow-lg">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-serif text-[22px] leading-tight text-ink">
                          {r.name}
                        </div>
                        <div className="mt-0.5 font-serif italic text-[14px] text-ink-soft">
                          {r.tagline}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full glass-pill px-2.5 py-1 text-[11px] font-sans text-ink-soft">
                        {r.size}
                      </span>
                    </div>

                    <p className="mt-3 font-serif italic text-[13.5px] text-ink-soft leading-snug">
                      {r.description}
                    </p>

                    {/* Context rows */}
                    <dl className="mt-4 space-y-2.5 border-t border-[color:color-mix(in_oklch,var(--ink)_7%,transparent)] pt-4 text-[13px]">
                      <div className="flex gap-3 leading-snug">
                        <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" strokeWidth={1.5} />
                        <div>
                          <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-muted">View</div>
                          <div className="mt-0.5 font-serif text-[14px] text-ink">{r.view}</div>
                        </div>
                      </div>
                      <div className="flex gap-3 leading-snug">
                        <Compass className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" strokeWidth={1.5} />
                        <div>
                          <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-muted">Orientation</div>
                          <div className="mt-0.5 font-serif text-[14px] text-ink">{r.orientation}</div>
                        </div>
                      </div>
                      <div className="flex gap-3 leading-snug">
                        {React.createElement(noiseIcon(r.noise), { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep", strokeWidth: 1.5 })}
                        <div>
                          <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-muted">Noise</div>
                          <div className="mt-0.5 font-serif text-[14px] text-ink">{noiseLabel(r.noise)}: {r.noiseHint}</div>
                        </div>
                      </div>
                    </dl>

                    {/* Nearby */}
                    <div className="mt-4 border-t border-[color:color-mix(in_oklch,var(--ink)_7%,transparent)] pt-4">
                      <div className="mb-2 flex items-center gap-1.5 font-sans text-[10px] tracking-[0.22em] uppercase text-ink-muted">
                        <MapPin className="h-3 w-3" strokeWidth={1.5} />
                        Closest amenities
                      </div>
                      <ul className="space-y-1.5 font-serif text-[13.5px] text-ink-soft">
                        {r.nearby.map((n) => (
                          <li key={n.label} className="flex gap-2 leading-snug">
                            <span aria-hidden className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-gold-deep" />
                            <span>
                              <span className="text-ink">{n.label}</span>
                              <span className="text-ink-muted"> · {n.detail}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Highlight chips */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      {r.highlights.map((h) => (
                        <span
                          key={h}
                          className="rounded-full glass-pill px-2.5 py-1 text-[11px] font-sans text-ink-soft"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom actions */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.0, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <PrimaryButton onClick={onEnterApp}>
            Reserve the {selectedRoomName}
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </PrimaryButton>

          <div className="flex items-center gap-3">
            <GhostButton onClick={onEnterApp}>
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              Let the assistant help me choose
            </GhostButton>
          </div>

          <p className="font-serif italic text-[12px] text-ink-muted text-center">
            This is a prototype. No card is charged.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
