"use client"

import { motion } from "framer-motion"
import { ArrowRight, MoonStar, Plane, Sparkles } from "lucide-react"
import { useArden } from "../arden-context"
import { guest, hotel, roomById } from "../data"
import { Card, GoldRule, GhostButton, PrimaryButton } from "../primitives"

function daysUntil(iso: string) {
  const target = new Date(iso).getTime()
  const now = Date.now()
  return Math.max(0, Math.round((target - now) / (1000 * 60 * 60 * 24)))
}

function formatRange(a: string, b: string) {
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" })
  return `${fmt.format(new Date(a))} – ${fmt.format(new Date(b))}`
}

export function StayHome({ onOpenBooking }: { onOpenBooking: () => void }) {
  const { booking, jumpTo } = useArden()
  const days = daysUntil(booking.checkIn)
  const room = roomById(booking.roomTypeId)

  return (
    <motion.section
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.0, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative w-full"
    >
      {/* Hero photograph — current suite. Kept tall enough to hold the brand
          mark, suite name, and gradient fade, but trimmed so the action cards
          below begin to reveal themselves without a full scroll. */}
      <div className="relative w-full h-[44svh] min-h-[320px] overflow-hidden">
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

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cream to-transparent" />

        {/* Loyalty tier badge — sits where the old brand mark was.
            The persistent TopHeader now carries the logo; this area just
            shows the guest’s tier on wider screens. */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-x-0 top-0 flex items-center justify-end px-5 pt-[calc(56px+env(safe-area-inset-top))] sm:px-8"
        >
          <span className="font-sans text-[10.5px] uppercase tracking-[0.28em] text-cream/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)]">
            {guest.loyaltyTier} guest
          </span>
        </motion.div>

        {/* Room name overlaid — seated inside a warm glass lozenge so the
            copy keeps its contrast against any image behind it. */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-x-5 bottom-12 sm:inset-x-8"
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

      {/* Copy + details */}
      <div className="mx-auto w-full max-w-xl px-5 pt-2 pb-10 sm:px-8">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="mb-3 font-sans text-sm leading-relaxed text-ink-soft">
            Welcome back, {guest.title} {guest.lastName}
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

        {/* Key details grid */}
        <motion.dl
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
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

        {/* Primary CTA — enter the Prelude */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.3, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-10"
        >
          <Card interactive onClick={() => jumpTo("room")} className="overflow-hidden">
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
                  Begin
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Jet-lag support */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-3 grid grid-cols-2 gap-3"
        >
          <Card interactive onClick={() => jumpTo("assistant")} className="p-4">
            <div className="flex items-center gap-2 font-sans text-[9.5px] tracking-[0.22em] uppercase text-ink-muted">
              <MoonStar className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
              Arrival at 02:00
            </div>
            <div className="mt-2 font-serif text-[16px] leading-snug text-ink">
              Prepare the room for rest after a late flight.
            </div>
            <div className="mt-2 font-sans text-[11.5px] text-gold-deep">Ask the assistant</div>
          </Card>
          <Card interactive onClick={() => jumpTo("concierge")} className="p-4">
            <div className="flex items-center gap-2 font-sans text-[9.5px] tracking-[0.22em] uppercase text-ink-muted">
              <Plane className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
              Before you land
            </div>
            <div className="mt-2 font-serif text-[16px] leading-snug text-ink">
              Transfers, meeting rooms, Wi-Fi, and arrival details.
            </div>
            <div className="mt-2 font-sans text-[11.5px] text-gold-deep">Concierge</div>
          </Card>
        </motion.div>

        {/* Change booking */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.7, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-10 flex flex-col gap-3 border-t border-[color:color-mix(in_oklch,var(--ink)_8%,transparent)] pt-6"
        >
          <div className="font-sans text-[10.5px] uppercase tracking-[0.26em] text-ink-muted">
            Planning another stay?
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={onOpenBooking}>
              Book a guestroom
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </PrimaryButton>
            <GhostButton onClick={() => jumpTo("assistant")}>
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              Let the assistant help
            </GhostButton>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
