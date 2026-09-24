"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Compass,
  Eye,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useArden } from "../arden-context"
import { hotel, pastBookings, roomTypes } from "../data"
import type { BookingPath, NoiseLevel, RoomTypeId } from "../types"
import { BrandMark, Card, ElevationMark, GoldRule, PrimaryButton } from "../primitives"

type Step = "path" | "dates" | "rebook" | "room" | "review" | "confirmed"

function addDays(iso: string, n: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function nightsBetween(a: string, b: string) {
  return Math.max(
    1,
    Math.round(
      (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24),
    ),
  )
}

function fmt(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso))
}

function fmtShort(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

export function BookingFlow({ onClose }: { onClose: () => void }) {
  const { bookingDraft, updateDraft, resetDraft, setBooking, jumpTo } = useArden()
  const [step, setStep] = React.useState<Step>("path")

  // Seed dates when entering the dates step
  React.useEffect(() => {
    if (step === "dates" && !bookingDraft.checkIn) {
      const ci = addDays(todayISO(), 14)
      updateDraft({ checkIn: ci, checkOut: addDays(ci, 2) })
    }
  }, [step, bookingDraft.checkIn, updateDraft])

  const canContinueDates =
    !!bookingDraft.checkIn && !!bookingDraft.checkOut && bookingDraft.guests >= 1
  const canContinueRoom = !!bookingDraft.roomTypeId

  const choosePath = (path: BookingPath) => {
    updateDraft({ path })
    if (path === "recommend") {
      resetDraft()
      onClose()
      jumpTo("assistant")
      return
    }
    if (path === "rebook") {
      setStep("rebook")
      return
    }
    setStep("dates")
  }

  const goToRoom = () => setStep("room")
  const goToReview = () => setStep("review")

  const goBack = () => {
    if (step === "rebook") setStep("path")
    else if (step === "dates") setStep(bookingDraft.path === "rebook" ? "rebook" : "path")
    else if (step === "room") setStep("dates")
    else if (step === "review") setStep(bookingDraft.path === "rebook" ? "dates" : "room")
  }

  const confirm = () => {
    if (
      !bookingDraft.checkIn ||
      !bookingDraft.checkOut ||
      !bookingDraft.roomTypeId
    )
      return
    const room = roomTypes.find((r) => r.id === bookingDraft.roomTypeId)!
    setBooking({
      id: `AH-${Math.floor(100000 + Math.random() * 900000)}`,
      checkIn: bookingDraft.checkIn,
      checkOut: bookingDraft.checkOut,
      nights: nightsBetween(bookingDraft.checkIn, bookingDraft.checkOut),
      guests: bookingDraft.guests,
      roomTypeId: room.id,
      roomName: room.name,
    })
    setStep("confirmed")
  }

  const finish = () => {
    resetDraft()
    onClose()
  }

  const showBack = step !== "path" && step !== "confirmed"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col bg-cream"
    >
      {/* Header */}
      <header className="glass-warm sticky top-0 z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-cream-soft transition-colors duration-300"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
          ) : (
            <span className="h-8 w-8" />
          )}
          {/* Formal (bold capitals) logo — booking is an official context */}
          <BrandMark logo="formal" height="h-5" />
        </div>
        <button
          type="button"
          onClick={finish}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-cream-soft transition-colors duration-300"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === "path" && <StepPath key="path" onChoose={choosePath} />}
          {step === "rebook" && (
            <StepRebook
              key="rebook"
              onSelect={(roomTypeId) => {
                updateDraft({ roomTypeId })
                setStep("dates")
              }}
            />
          )}
          {step === "dates" && (
            <StepDates
              key="dates"
              onContinue={bookingDraft.path === "rebook" ? goToReview : goToRoom}
              canContinue={canContinueDates}
            />
          )}
          {step === "room" && (
            <StepRoom key="room" onContinue={goToReview} canContinue={canContinueRoom} />
          )}
          {step === "review" && <StepReview key="review" onConfirm={confirm} />}
          {step === "confirmed" && <StepConfirmed key="confirmed" onDone={finish} />}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ——— Step 0: choose your path ——— */
function StepPath({ onChoose }: { onChoose: (path: BookingPath) => void }) {
  const paths: { id: BookingPath; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; hint: string }[] = [
    {
      id: "browse",
      icon: Search,
      title: "Browse available rooms",
      hint: "Compare rooms, rates, and quietness before choosing.",
    },
    {
      id: "rebook",
      icon: RotateCcw,
      title: "Rebook a previous room",
      hint: "Return to a room you already know.",
    },
    {
      id: "recommend",
      icon: MessageCircle,
      title: "Help me choose",
      hint: "Tell us your schedule and preferences; we\u2019ll suggest a room.",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl px-5 pt-10 pb-32 sm:px-8 sm:pt-14"
    >
      <div className="mb-3 font-sans text-[10.5px] tracking-[0.28em] uppercase text-ink-muted">
        Book a guestroom
      </div>
      <h2 className="text-display text-ink text-[30px] sm:text-[36px] leading-[1.04] text-balance">
        How would you like
        <br />
        <span className="italic font-light text-ink-soft">to begin?</span>
      </h2>
      <GoldRule className="mt-5" />

      <div className="mt-8 flex flex-col gap-3">
        {paths.map((p) => {
          const Icon = p.icon
          return (
            <Card
              key={p.id}
              interactive
              onClick={() => onChoose(p.id)}
              className="p-5"
            >
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
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.5} />
              </div>
            </Card>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ——— Rebook: pick a past room ——— */
function StepRebook({ onSelect }: { onSelect: (id: RoomTypeId) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl px-5 pt-10 pb-32 sm:px-8 sm:pt-14"
    >
      <div className="mb-3 font-sans text-[10.5px] tracking-[0.28em] uppercase text-ink-muted">
        Rebook a previous room
      </div>
      <h2 className="text-display text-ink text-[30px] sm:text-[36px] leading-[1.04] text-balance">
        A room you
        <br />
        <span className="italic font-light text-ink-soft">already know.</span>
      </h2>
      <GoldRule className="mt-5" />

      <div className="mt-8 flex flex-col gap-3">
        {pastBookings.map((pb) => {
          const room = roomTypes.find((r) => r.id === pb.roomTypeId)
          if (!room) return null
          return (
            <Card
              key={pb.id}
              interactive
              onClick={() => onSelect(pb.roomTypeId)}
              className="overflow-hidden"
            >
              <div className="flex items-stretch">
                <div className="relative w-28 shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={room.image || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
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
                    {fmtShort(pb.checkIn)} – {fmtShort(pb.checkOut)}
                  </div>
                  <div className="mt-1 font-sans text-[10.5px] tabular-nums text-ink-muted">
                    Ref {pb.id}
                  </div>
                </div>
                <div className="flex items-center pr-4">
                  <ArrowRight className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ——— Step 1: dates ——— */
function StepDates({
  onContinue,
  canContinue,
}: {
  onContinue: () => void
  canContinue: boolean
}) {
  const { bookingDraft, updateDraft } = useArden()
  const nights =
    bookingDraft.checkIn && bookingDraft.checkOut
      ? nightsBetween(bookingDraft.checkIn, bookingDraft.checkOut)
      : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl px-5 pt-10 pb-32 sm:px-8 sm:pt-14"
    >
      <div className="mb-3 font-sans text-[10.5px] tracking-[0.28em] uppercase text-ink-muted">
        Book a guestroom · Dates
      </div>
      <h2 className="text-display text-ink text-[30px] sm:text-[36px] leading-[1.04] text-balance">
        When will you
        <br />
        <span className="italic font-light text-ink-soft">be with us?</span>
      </h2>
      <GoldRule className="mt-5" />

      <div className="mt-8 space-y-5">
        <Card className="p-5">
          <div className="grid grid-cols-2 gap-5">
            <label className="block">
              <span className="block font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
                Arrival
              </span>
              <input
                type="date"
                value={bookingDraft.checkIn ?? ""}
                min={todayISO()}
                onChange={(e) => {
                  const ci = e.target.value
                  const co =
                    bookingDraft.checkOut &&
                    new Date(bookingDraft.checkOut) > new Date(ci)
                      ? bookingDraft.checkOut
                      : addDays(ci, 2)
                  updateDraft({ checkIn: ci, checkOut: co })
                }}
                className="mt-1.5 w-full bg-transparent font-serif text-[18px] text-ink leading-tight focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="block font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
                Departure
              </span>
              <input
                type="date"
                value={bookingDraft.checkOut ?? ""}
                min={bookingDraft.checkIn ?? todayISO()}
                onChange={(e) => updateDraft({ checkOut: e.target.value })}
                className="mt-1.5 w-full bg-transparent font-serif text-[18px] text-ink leading-tight focus:outline-none"
              />
            </label>
          </div>
          <div className="mt-5 border-t border-[color:color-mix(in_oklch,var(--ink)_7%,transparent)] pt-4 font-serif italic text-[14px] text-ink-soft">
            {nights > 0
              ? `${nights} ${nights === 1 ? "night" : "nights"}, check-in from ${hotel.checkInTime}`
              : "Choose your dates"}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
                Guests
              </div>
              <div className="mt-1 font-serif text-[18px] leading-tight text-ink">
                {bookingDraft.guests} {bookingDraft.guests === 1 ? "traveller" : "travellers"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Stepper
                onDec={() =>
                  updateDraft({ guests: Math.max(1, bookingDraft.guests - 1) })
                }
                onInc={() =>
                  updateDraft({ guests: Math.min(4, bookingDraft.guests + 1) })
                }
                value={bookingDraft.guests}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-10">
        <PrimaryButton onClick={onContinue} disabled={!canContinue}>
          Continue
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </PrimaryButton>
      </div>
    </motion.div>
  )
}

function Stepper({
  value,
  onDec,
  onInc,
}: {
  value: number
  onDec: () => void
  onInc: () => void
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full glass-pill p-1">
      <button
        type="button"
        aria-label="Decrease"
        onClick={onDec}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-cream-soft hover:text-ink transition-colors"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
      <span className="min-w-6 text-center font-serif text-[16px] tabular-nums text-ink">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        onClick={onInc}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-cream-soft hover:text-ink transition-colors"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </div>
  )
}

/* ——— Step 2: room ——— */
function StepRoom({
  onContinue,
  canContinue,
}: {
  onContinue: () => void
  canContinue: boolean
}) {
  const { bookingDraft, updateDraft } = useArden()

  const nights =
    bookingDraft.checkIn && bookingDraft.checkOut
      ? nightsBetween(bookingDraft.checkIn, bookingDraft.checkOut)
      : 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl px-5 pt-10 pb-32 sm:px-8 sm:pt-14"
    >
      <div className="mb-3 font-sans text-[10.5px] tracking-[0.28em] uppercase text-ink-muted">
        Book a guestroom · Choose your room
      </div>
      <h2 className="text-display text-ink text-[30px] sm:text-[36px] leading-[1.04] text-balance">
        Four ways
        <br />
        <span className="italic font-light text-ink-soft">to rest.</span>
      </h2>
      <GoldRule className="mt-5" />

      <div className="mt-7 flex flex-col gap-5">
        {roomTypes.map((r) => {
          const selected = bookingDraft.roomTypeId === r.id
          return (
            <Card
              key={r.id}
              interactive
              onClick={() => updateDraft({ roomTypeId: r.id as RoomTypeId })}
              className={cn(
                "overflow-hidden ring-1 ring-inset",
                selected
                  ? "ring-[color:color-mix(in_oklch,var(--gold)_70%,transparent)]"
                  : "ring-transparent",
              )}
            >
              <div className="relative h-48 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.image || "/placeholder.svg"}
                  alt={r.name}
                  className="h-full w-full object-cover"
                />
                {/* Price chip floating on the image, in a glass pill */}
                <div className="glass-card absolute left-4 bottom-4 rounded-full px-3.5 py-1.5">
                  <span className="font-serif text-[15px] tabular-nums text-ink">
                    ${r.pricePerNight}
                  </span>
                  <span className="ml-1.5 font-sans text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                    / night
                  </span>
                </div>
                {selected ? (
                  <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-cream shadow-[0_8px_24px_-10px_color-mix(in_oklch,var(--ink)_60%,transparent)]">
                    <Check className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                ) : null}
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

                {/* Context — view, orientation, noise. Presented as quiet rows so the
                    guest can imagine the room before choosing it. */}
                <dl className="mt-4 space-y-2.5 border-t border-[color:color-mix(in_oklch,var(--ink)_7%,transparent)] pt-4 text-[13px]">
                  <InfoRow
                    icon={Eye}
                    label="View"
                    value={r.view}
                  />
                  <InfoRow
                    icon={Compass}
                    label="Orientation"
                    value={r.orientation}
                  />
                  <InfoRow
                    icon={noiseIcon(r.noise)}
                    label="Noise"
                    value={`${noiseLabel(r.noise)}: ${r.noiseHint}`}
                  />
                </dl>

                {/* Nearby amenities — helps business travellers judge logistics. */}
                <div className="mt-4 border-t border-[color:color-mix(in_oklch,var(--ink)_7%,transparent)] pt-4">
                  <div className="mb-2 flex items-center gap-1.5 font-sans text-[10px] tracking-[0.22em] uppercase text-ink-muted">
                    <MapPin className="h-3 w-3" strokeWidth={1.5} />
                    Closest amenities
                  </div>
                  <ul className="space-y-1.5 font-serif text-[13.5px] text-ink-soft">
                    {r.nearby.map((n) => (
                      <li key={n.label} className="flex gap-2 leading-snug">
                        <span
                          aria-hidden
                          className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-gold-deep"
                        />
                        <span>
                          <span className="text-ink">{n.label}</span>
                          <span className="text-ink-muted"> · {n.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Amenity chips, plus the running total */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {r.highlights.slice(0, 3).map((h) => (
                    <span
                      key={h}
                      className="rounded-full glass-pill px-2.5 py-1 text-[11px] font-sans text-ink-soft"
                    >
                      {h}
                    </span>
                  ))}
                </div>
                <div className="mt-3 font-sans text-[10.5px] tabular-nums text-ink-muted">
                  ${r.pricePerNight * nights} total for {nights}{" "}
                  {nights === 1 ? "night" : "nights"}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mt-10">
        <PrimaryButton onClick={onContinue} disabled={!canContinue}>
          Review
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </PrimaryButton>
      </div>
    </motion.div>
  )
}

/* ——— Step 3: review ——— */
function StepReview({ onConfirm }: { onConfirm: () => void }) {
  const { bookingDraft } = useArden()
  const room = roomTypes.find((r) => r.id === bookingDraft.roomTypeId)
  if (!room || !bookingDraft.checkIn || !bookingDraft.checkOut) return null

  const nights = nightsBetween(bookingDraft.checkIn, bookingDraft.checkOut)
  const subtotal = room.pricePerNight * nights
  const taxes = Math.round(subtotal * 0.12)
  const total = subtotal + taxes

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl px-5 pt-10 pb-32 sm:px-8 sm:pt-14"
    >
      <div className="mb-3 font-sans text-[10.5px] tracking-[0.28em] uppercase text-ink-muted">
        Book a guestroom · Review
      </div>
      <h2 className="text-display text-ink text-[30px] sm:text-[36px] leading-[1.04] text-balance">
        Review your
        <br />
        <span className="italic font-light text-ink-soft">room and dates.</span>
      </h2>
      <GoldRule className="mt-5" />

      <Card className="mt-7 overflow-hidden">
        <div className="relative h-36 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={room.image || "/placeholder.svg"}
            alt={room.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-5">
          <div className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
            Your stay
          </div>
          <div className="mt-1 font-serif text-[22px] leading-tight text-ink">
            {room.name}
          </div>
          <div className="mt-0.5 font-serif italic text-[14px] text-ink-soft">
            {room.tagline}
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[color:color-mix(in_oklch,var(--ink)_7%,transparent)] pt-5">
            <div>
              <dt className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
                Arrival
              </dt>
              <dd className="mt-1 font-serif text-[15px] text-ink">
                {fmt(bookingDraft.checkIn)}
              </dd>
            </div>
            <div>
              <dt className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
                Departure
              </dt>
              <dd className="mt-1 font-serif text-[15px] text-ink">
                {fmt(bookingDraft.checkOut)}
              </dd>
            </div>
            <div>
              <dt className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
                Nights
              </dt>
              <dd className="mt-1 font-serif text-[15px] text-ink">{nights}</dd>
            </div>
            <div>
              <dt className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
                Travellers
              </dt>
              <dd className="mt-1 font-serif text-[15px] text-ink">
                {bookingDraft.guests}
              </dd>
            </div>
          </dl>

          <dl className="mt-5 space-y-2 border-t border-[color:color-mix(in_oklch,var(--ink)_7%,transparent)] pt-5 font-sans text-[13px]">
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">
                Guestroom · {nights} × ${room.pricePerNight}
              </dt>
              <dd className="text-ink tabular-nums">${subtotal}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Taxes & fees</dt>
              <dd className="text-ink tabular-nums">${taxes}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-[color:color-mix(in_oklch,var(--ink)_7%,transparent)] pt-3">
              <dt className="font-serif text-[15px] text-ink">Total</dt>
              <dd className="font-serif text-[18px] text-ink tabular-nums">${total}</dd>
            </div>
          </dl>
        </div>
      </Card>

      <div className="mt-8">
        <PrimaryButton onClick={onConfirm}>
          Confirm booking
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </PrimaryButton>
        <p className="mt-3 font-serif italic text-[12.5px] text-ink-muted">
          This is a prototype. No card is charged.
        </p>
      </div>
    </motion.div>
  )
}

/* ——— Step 4: confirmed ——— */
function StepConfirmed({ onDone }: { onDone: () => void }) {
  const { booking, jumpTo } = useArden()
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto flex min-h-full w-full max-w-xl flex-col items-start justify-center px-5 pt-10 pb-32 sm:px-8"
    >
      {/* Formal logo crowns the confirmation — like a letterhead */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
        className="mb-6"
      >
        <BrandMark logo="formal" height="h-6" />
      </motion.div>

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
        className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color:color-mix(in_oklch,var(--gold)_15%,var(--cream-soft))]"
      >
        <Check className="h-6 w-6 text-gold-deep" strokeWidth={1.5} />
      </motion.div>

      <div className="font-sans text-[10.5px] tracking-[0.28em] uppercase text-ink-muted">
        Your room is reserved
      </div>
      <h2 className="mt-2 text-display text-ink text-[30px] sm:text-[36px] leading-[1.04] text-balance">
        We&apos;ll be ready
        <br />
        <span className="italic font-light text-ink-soft">
          when you arrive, {booking.roomName}.
        </span>
      </h2>
      <GoldRule className="mt-5" />

      <p className="mt-6 max-w-prose font-serif italic text-ink-soft text-[16px] leading-relaxed">
        A confirmation has been sent. Reference {booking.id}. You can now add room
        preferences in your Arrival Profile.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <PrimaryButton
          onClick={() => {
            onDone()
            jumpTo("room")
          }}
        >
          Enter profile
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </PrimaryButton>
        <button
          type="button"
          onClick={onDone}
          className="font-sans text-[13px] text-ink-muted hover:text-ink transition-colors duration-500"
        >
          Back to your stay
        </button>
      </div>

      {/* Elevation drawing as a quiet architectural detail */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
        className="mt-16 flex justify-center"
      >
        <ElevationMark height="h-20" />
      </motion.div>
    </motion.div>
  )
}

/* ——— Small inline row used in the room card ——— */
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3 leading-snug">
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center text-gold-deep"
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
      </span>
      <div>
        <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          {label}
        </div>
        <div className="mt-0.5 font-serif text-[14px] text-ink">{value}</div>
      </div>
    </div>
  )
}

function noiseLabel(n: NoiseLevel) {
  switch (n) {
    case "whisper":
      return "Whisper-quiet"
    case "quiet":
      return "Quiet"
    case "lively":
      return "Lively"
  }
}

function noiseIcon(n: NoiseLevel) {
  return n === "whisper" ? VolumeX : n === "quiet" ? Volume1 : Volume2
}
