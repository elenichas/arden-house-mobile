"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Pencil,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Card,
  GoldRule,
  PrimaryButton,
  GhostButton,
} from "../primitives"
import {
  guest,
  hotel,
  pastBookings,
  roomTypes,
  savedArrivalProfile,
  savedArrivalTiles,
} from "../data"
import type { RoomTypeId } from "../types"

function fmtShort(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

export function LandingReturning({
  onEnterApp,
  onHome,
}: {
  onEnterApp: () => void
  onHome: () => void
}) {
  const [selectedRoom, setSelectedRoom] = React.useState<RoomTypeId>(
    pastBookings[0].roomTypeId,
  )
  const [preludeAction, setPreludeAction] = React.useState<"keep" | "amend">("keep")

  const selectedRoomData = roomTypes.find((r) => r.id === selectedRoom)

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
      className="fixed inset-0 z-[90] flex flex-col bg-cream overflow-y-auto"
    >
      {/* Hero — a warm, familiar welcome */}
      <div className="relative w-full h-[40svh] min-h-[300px] overflow-hidden">
        <motion.div
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedRoomData?.image || "/images/rebrand/room-suite.png"}
            alt={selectedRoomData?.name || "Your room"}
            className="h-full w-full object-cover"
          />
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-cream to-transparent" />

        {/* Header over hero — compact start control plus guest context */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-[calc(16px+env(safe-area-inset-top))] sm:px-8"
        >
          <button
            type="button"
            onClick={onHome}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-cream/20 bg-ink/42 px-3 font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-cream shadow-[0_4px_10px_-8px_rgba(0,0,0,0.65)] backdrop-blur-md transition-colors duration-300 hover:bg-ink/58"
            aria-label="Back to start"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
            Start
          </button>
          <span className="font-sans text-[10.5px] uppercase tracking-[0.28em] text-cream/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)]">
            {guest.loyaltyTier} guest
          </span>
        </motion.div>

        {/* Returning badge on the hero */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-x-5 bottom-14 sm:inset-x-8"
        >
          <div className="glass-night inline-block rounded-[18px] px-5 py-3.5">
            <div className="font-sans text-[10px] uppercase tracking-[0.3em] text-cream">
              Welcome home
            </div>
            <div className="mt-1 font-serif text-2xl sm:text-3xl italic text-cream">
              {guest.title} {guest.lastName}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-xl px-5 pt-2 pb-16 sm:px-8">
        {/* Welcome heading */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="mb-4 font-sans text-[10.5px] uppercase tracking-[0.28em] text-ink-muted">
            It&apos;s good to see you again
          </div>
          <h1 className="text-display text-ink text-[30px] sm:text-[38px] leading-[1.04] text-balance">
            Rebook quickly, or make a few changes.
          </h1>
          <GoldRule className="mt-5" />
           
        </motion.div>

        {/* ─── Section 1: Your Room ─── */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-6"
        >
          <div className="mb-4 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
            Your room from last time
          </div>

          <div className="flex flex-col gap-3">
            {pastBookings.map((pb) => {
              const room = roomTypes.find((r) => r.id === pb.roomTypeId)
              if (!room) return null
              const isSelected = selectedRoom === pb.roomTypeId
              return (
                <Card
                  key={pb.id}
                  interactive
                  onClick={() => setSelectedRoom(pb.roomTypeId)}
                  className={cn(
                    "overflow-hidden ring-1 ring-inset transition-all duration-500",
                    isSelected
                      ? "ring-[color:color-mix(in_oklch,var(--gold)_70%,transparent)]"
                      : "ring-transparent",
                  )}
                >
                  <div className="flex items-stretch">
                    <div className="relative w-28 shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={room.image || "/placeholder.svg"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {isSelected && (
                        <span className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-cream shadow-lg">
                          <Check className="h-3 w-3" strokeWidth={2} />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="font-serif text-[18px] leading-tight text-ink">
                        {room.name}
                      </div>
                      <div className="mt-0.5 font-serif italic text-[13px] text-ink-soft">
                        {room.tagline}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 font-sans text-[11px] text-ink-muted">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        Last stayed {fmtShort(pb.checkIn)} – {fmtShort(pb.checkOut)}
                      </div>
                      <div className="mt-1 font-sans text-[10.5px] tabular-nums text-ink-muted">
                        Ref {pb.id} · ${room.pricePerNight}/night
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </motion.div>

        {/* ─── Section 2: Saved arrival preferences ─── */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-10"
        >
          <div className="mb-2 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
            Your saved Arrival Profile
          </div>
          <p className="mb-5 font-serif italic text-[14px] text-ink-soft leading-snug">
            These are the preferences saved from your last visit. Keep them as they are,
            or update the details for this trip.
          </p>

          {/* Arrival-profile action toggle */}
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-[16px] glass-soft p-1.5">
            <button
              type="button"
              onClick={() => setPreludeAction("keep")}
              className={cn(
                "rounded-[9px] px-3 py-3 text-center transition-all duration-500",
                "font-serif text-[15px] leading-tight",
                preludeAction === "keep"
                  ? "glass-card text-ink ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--gold)_60%,transparent)]"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              <RefreshCw
                className="mx-auto mb-1.5 h-4 w-4 text-gold-deep"
                strokeWidth={1.5}
              />
              Keep as is
            </button>
            <button
              type="button"
              onClick={() => setPreludeAction("amend")}
              className={cn(
                "rounded-[9px] px-3 py-3 text-center transition-all duration-500",
                "font-serif text-[15px] leading-tight",
                preludeAction === "amend"
                  ? "glass-card text-ink ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--gold)_60%,transparent)]"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              <Pencil
                className="mx-auto mb-1.5 h-4 w-4 text-gold-deep"
                strokeWidth={1.5}
              />
              Amend
            </button>
          </div>

          {/* Saved room preferences */}
          <div className="grid grid-cols-3 gap-2">
            {savedArrivalTiles.map((tile, i) => (
              <motion.div
                key={tile.label}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 1.2 + i * 0.04,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
                className="rounded-[14px] glass-soft p-3"
              >
                <div className="font-sans text-[9px] uppercase tracking-[0.22em] text-ink-muted">
                  {tile.label}
                </div>
                <div className="mt-1 font-serif text-[13px] leading-snug text-ink">
                  {tile.value}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Guest's saved words */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8, ease: [0.22, 0.61, 0.36, 1] }}
            className="mt-4 rounded-[16px] glass-card ring-gold p-5"
          >
            <div className="mb-2 font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
              Your words, from last time
            </div>
            <p className="font-serif italic text-[16px] leading-relaxed text-ink text-pretty">
              &ldquo;{savedArrivalProfile.words}&rdquo;
            </p>
          </motion.div>

          {preludeAction === "amend" && (
            <motion.p
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
              className="mt-4 font-serif italic text-[13px] text-gold-deep"
            >
            After booking, you&apos;ll review the Arrival Profile and update any room details.
            </motion.p>
          )}
        </motion.div>

        {/* ─── Actions ─── */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 2.0, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-10 flex flex-col items-center gap-4 border-t border-[color:color-mix(in_oklch,var(--ink)_8%,transparent)] pt-8"
        >
          <PrimaryButton onClick={onEnterApp}>
            {preludeAction === "keep"
              ? `Rebook the ${selectedRoomData?.name}`
              : `Rebook & amend your profile`}
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </PrimaryButton>

          <GhostButton onClick={onEnterApp}>
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            I&apos;d like something different this time
          </GhostButton>

          <p className="font-serif italic text-[12px] text-ink-muted text-center">
            {hotel.conciergeName}, your concierge, can help with changes at any time.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
