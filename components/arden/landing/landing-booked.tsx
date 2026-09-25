"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  MoonStar,
  Phone,
  Plane,
  Search,
} from "lucide-react"
import { Card, GoldRule, PrimaryButton } from "../primitives"
import { guest, hotel, roomById } from "../data"
import { useArden } from "../arden-context"

/**
 * Landing: Booked Guest
 *
 * The guest already has a confirmed reservation. We know who they are.
 * This page welcomes them by name, shows their booking summary, and
 * invites them to complete the Arrival Profile so the room can be prepared
 * around their practical preferences.
 */

function daysUntil(iso: string) {
  const target = new Date(iso).getTime()
  const now = Date.now()
  return Math.max(0, Math.round((target - now) / (1000 * 60 * 60 * 24)))
}

function formatRange(a: string, b: string) {
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" })
  return `${fmt.format(new Date(a))} – ${fmt.format(new Date(b))}`
}

function ReservationLookup({
  bookingReference,
  onFound,
  onHome,
}: {
  bookingReference: string
  onFound: () => void
  onHome: () => void
}) {
  const [reference, setReference] = React.useState("")
  const [identity, setIdentity] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const lookup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!reference.trim() || !identity.trim()) {
      setError("Enter both your booking reference and surname or email.")
      return
    }

    setLoading(true)
    setError("")
    timer.current = setTimeout(() => {
      const referenceMatches =
        reference.replace(/\s/g, "").toUpperCase() === bookingReference
      const identityValue = identity.trim().toLowerCase()
      const identityMatches =
        identityValue === guest.lastName.toLowerCase() ||
        identityValue === guest.email.toLowerCase()

      setLoading(false)
      if (referenceMatches && identityMatches) {
        onFound()
      } else {
        setError(
          "We couldn’t match those details. Check the reference and guest information, then try again.",
        )
      }
    }, 550)
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex flex-col overflow-y-auto bg-cream"
    >
      <header className="flex items-center justify-between px-5 pt-[calc(16px+env(safe-area-inset-top))] sm:px-8">
        <button
          type="button"
          onClick={onHome}
          className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-[color:color-mix(in_oklch,var(--ink)_14%,transparent)] px-3 font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
          aria-label="Back to start"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
          Start
        </button>
        <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink-muted">
          Find your stay
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-12 sm:px-8">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:color-mix(in_oklch,var(--gold)_12%,var(--cream-soft))]">
          <Search className="h-4.5 w-4.5 text-gold-deep" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 text-display text-[32px] leading-[1.04] text-ink sm:text-[40px] text-balance">
          Find your reservation.
        </h1>
        <p className="mt-4 max-w-md font-serif text-[16px] leading-relaxed text-ink-soft">
          Use the reference from your confirmation and the lead guest’s surname or email.
        </p>
        <GoldRule className="mt-6" />

        <form onSubmit={lookup} className="mt-8 space-y-5" noValidate>
          <label className="block">
            <span className="font-sans text-[11px] font-bold text-ink-soft">
              Booking reference
            </span>
            <input
              value={reference}
              onChange={(event) => {
                setReference(event.target.value.toUpperCase())
                setError("")
              }}
              autoComplete="off"
              placeholder={bookingReference}
              aria-describedby="lookup-demo"
              className="mt-2 h-12 w-full rounded-[12px] border border-[color:color-mix(in_oklch,var(--ink)_18%,transparent)] bg-cream-soft px-4 font-sans text-[15px] uppercase tracking-[0.08em] text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-gold-deep"
            />
          </label>

          <label className="block">
            <span className="font-sans text-[11px] font-bold text-ink-soft">
              Surname or email
            </span>
            <input
              value={identity}
              onChange={(event) => {
                setIdentity(event.target.value)
                setError("")
              }}
              autoComplete="email"
              placeholder="Bennett"
              className="mt-2 h-12 w-full rounded-[12px] border border-[color:color-mix(in_oklch,var(--ink)_18%,transparent)] bg-cream-soft px-4 font-sans text-[15px] text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-gold-deep"
            />
          </label>

          <p id="lookup-demo" className="font-serif italic text-[13px] text-ink-muted">
            Prototype details: {bookingReference} and Bennett.
          </p>

          {error ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-[12px] bg-[color:color-mix(in_oklch,var(--terracotta)_9%,var(--cream-soft))] p-4 text-ink"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" strokeWidth={1.7} />
              <p className="font-sans text-[13px] leading-relaxed">{error}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Search className="h-4 w-4" strokeWidth={1.5} />
              )}
              {loading ? "Finding your stay" : "Find reservation"}
            </PrimaryButton>
            <a
              href={`tel:${hotel.phone.replace(/[^+\d]/g, "")}`}
              className="inline-flex min-h-11 items-center gap-2 font-sans text-[12px] font-bold text-ink-soft transition-colors hover:text-ink"
            >
              <Phone className="h-4 w-4" strokeWidth={1.5} />
              Call the hotel
            </a>
          </div>
        </form>
      </main>
    </motion.div>
  )
}

export function LandingBooked({
  onEnterApp,
  onEnterPrelude,
  onHome,
}: {
  onEnterApp: () => void
  onEnterPrelude: () => void
  onHome: () => void
}) {
  const [bookingFound, setBookingFound] = React.useState(false)
  const { booking } = useArden()
  const days = daysUntil(booking.checkIn)
  const room = roomById(booking.roomTypeId)

  if (!bookingFound) {
    return (
      <ReservationLookup
        bookingReference={booking.id}
        onFound={() => setBookingFound(true)}
        onHome={onHome}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
      className="fixed inset-0 z-[90] flex flex-col bg-cream overflow-y-auto"
    >
      {/* Hero photograph — the reserved suite */}
      <div className="relative w-full h-[46svh] min-h-[340px] overflow-hidden">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={room?.image || "/images/rebrand/room-suite.png"}
            alt={room?.name || "Suite"}
            className="h-full w-full object-cover"
          />
        </motion.div>

        {/* Gradient fade */}
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

        {/* Room name glass lozenge */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-x-5 bottom-14 sm:inset-x-8"
        >
          <div className="glass-night inline-block rounded-[18px] px-5 py-3.5">
            <div className="font-sans text-[10px] uppercase tracking-[0.3em] text-cream">
              Reserved for you
            </div>
            <div className="mt-1 font-serif text-2xl sm:text-3xl italic text-cream">
              {booking.roomName}
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
          transition={{ duration: 1.1, delay: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="mb-4 font-sans text-[10.5px] uppercase tracking-[0.28em] text-ink-muted">
            Welcome, {guest.title} {guest.lastName}
          </div>
          <h1 className="text-display text-ink text-[32px] sm:text-[40px] leading-[1.04] text-balance">
            We&apos;ll see you
            <br />
            <span className="italic font-light text-ink-soft">
              in {days} {days === 1 ? "day" : "days"}.
            </span>
          </h1>
          <GoldRule className="mt-6" />
        </motion.div>

        {/* Booking details */}
        <motion.dl
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.0, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 glass-soft rounded-[20px] p-5"
        >
          <div>
            <dt className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
              Dates
            </dt>
            <dd className="mt-1 font-serif text-[17px] leading-snug text-ink">
              {formatRange(booking.checkIn, booking.checkOut)}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
              Nights
            </dt>
            <dd className="mt-1 font-serif text-[17px] leading-snug text-ink">
              {booking.nights}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
              Reference
            </dt>
            <dd className="mt-1 font-serif text-[17px] leading-snug text-ink tabular-nums">
              {booking.id}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
              Concierge
            </dt>
            <dd className="mt-1 font-serif text-[17px] leading-snug text-ink">
              {hotel.conciergeName}
            </dd>
          </div>
        </motion.dl>

        {/* Invitation paragraph */}
        <motion.p
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8 max-w-prose font-serif italic text-ink-soft text-[16px] leading-relaxed"
        >
          Before you arrive, set the room preferences that matter most: bed, lighting,
          temperature, refreshments, and breakfast.
        </motion.p>

        {/* Primary CTA — begin the Prelude */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-10"
        >
          <Card interactive onClick={onEnterPrelude} className="overflow-hidden">
            <div className="flex items-stretch">
              <div className="relative w-28 shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/rebrand/room-classic.png"
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 p-5">
                <div className="font-sans text-[10px] tracking-[0.26em] uppercase text-ink-muted">
                  Arrival Profile
                </div>
                <div className="mt-1 font-serif text-[19px] leading-tight text-ink">
                  Set up your room.
                </div>
                <div className="mt-1.5 font-serif italic text-[13px] text-ink-soft leading-snug">
                  Choose the bed, lighting, minibar, and morning details before you arrive.
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 font-sans text-[12px] text-gold-deep">
                  Begin profile
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Secondary cards */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.6, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-3 grid grid-cols-2 gap-3"
        >
          <Card interactive onClick={onEnterApp} className="p-4">
            <div className="flex items-center gap-2 font-sans text-[9.5px] tracking-[0.22em] uppercase text-ink-muted">
              <MoonStar className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
              Late arrival?
            </div>
            <div className="mt-2 font-serif text-[16px] leading-snug text-ink">
              Ask us to prepare the room for rest after a late flight.
            </div>
          </Card>
          <Card interactive onClick={onEnterApp} className="p-4">
            <div className="flex items-center gap-2 font-sans text-[9.5px] tracking-[0.22em] uppercase text-ink-muted">
              <Plane className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
              Before you land
            </div>
            <div className="mt-2 font-serif text-[16px] leading-snug text-ink">
              Transfers, meeting rooms, Wi-Fi, and arrival details.
            </div>
          </Card>
        </motion.div>

        {/* Enter app */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.8, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <PrimaryButton onClick={onEnterApp}>
            Enter the hotel
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </PrimaryButton>
          <p className="font-serif italic text-[12px] text-ink-muted">
            You can return to your Arrival Profile at any time.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
