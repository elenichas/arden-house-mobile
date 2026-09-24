"use client"

import { motion } from "framer-motion"
import { ConciergeButton, Display, GoldRule, Kicker } from "./primitives"
import { guest } from "./data"
import { usePrelude } from "./prelude-context"
import { ArrowRight } from "lucide-react"

function daysUntil(iso: string) {
  const target = new Date(iso).getTime()
  const now = Date.now()
  const days = Math.max(0, Math.round((target - now) / (1000 * 60 * 60 * 24)))
  return days
}

function formatRange(a: string, b: string) {
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" })
  return `${fmt.format(new Date(a))} – ${fmt.format(new Date(b))}`
}

export function Welcome() {
  const { next } = usePrelude()
  const days = daysUntil(guest.checkIn)

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative w-full"
    >
      {/* Hero photograph — the suite, lit */}
      <div className="relative w-full h-[62svh] min-h-[440px] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.6, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/rebrand/room-suite.png"
            alt="Guest Room 21, lit by late afternoon sun"
            className="h-full w-full object-cover"
          />
        </motion.div>

        {/* Gentle bottom fade into cream so the copy flows out of the image */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--cream)] to-transparent" />

        {/* Brand mark floats over the photograph */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-[calc(56px+env(safe-area-inset-top))] sm:px-10"
        >
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl tracking-wide text-cream drop-shadow-[0_1px_8px_rgba(0,0,0,0.25)]">
              Arrival Profile
            </span>
            <span className="h-px w-8 bg-[color:color-mix(in_oklch,var(--gold)_85%,transparent)]" />
          </div>
          <span className="font-sans text-[10.5px] uppercase tracking-[0.28em] text-cream/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)]">
            Room preferences
          </span>
        </motion.div>

        {/* Suite name — whispered, low on the photograph */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-x-0 bottom-20 px-5 sm:px-10"
        >
          <div className="font-sans text-[10.5px] uppercase tracking-[0.32em] text-cream/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
            Your suite, this evening
          </div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl italic text-cream drop-shadow-[0_2px_14px_rgba(0,0,0,0.35)]">
            {guest.roomName}
          </div>
        </motion.div>
      </div>

      {/* The invitation copy, sitting below the photograph on warm cream */}
      <div className="relative mx-auto w-full max-w-2xl px-5 pt-4 pb-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <Kicker className="mb-5">Before you arrive</Kicker>
          <Display className="mb-6">
            {guest.title} {guest.lastName},
            <br />
            <span className="italic font-light text-ink-soft">your stay begins</span>
            <br />
            in {days} {days === 1 ? "day" : "days"}.
          </Display>
          <GoldRule className="mb-6" />
          <p className="max-w-lg text-ink-soft text-base sm:text-lg leading-relaxed font-serif italic">
            Your booking at {guest.roomName} is ready. Add a few room preferences now,
            and we will prepare the room before you arrive.
          </p>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.3, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 max-w-md glass-soft rounded-[20px] p-5"
        >
          <div>
            <dt className="font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
              Your dates
            </dt>
            <dd className="mt-1.5 font-serif text-lg text-ink">
              {formatRange(guest.checkIn, guest.checkOut)}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
              Nights
            </dt>
            <dd className="mt-1.5 font-serif text-lg text-ink">{guest.nights}</dd>
          </div>
          <div>
            <dt className="font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
              Concierge
            </dt>
            <dd className="mt-1.5 font-serif text-lg text-ink">Lucien</dd>
          </div>
          <div>
            <dt className="font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
              Reference
            </dt>
            <dd className="mt-1.5 font-serif text-lg text-ink tabular-nums">
              {guest.bookingRef}
            </dd>
          </div>
        </motion.dl>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-12 flex flex-col items-start gap-5"
        >
          <ConciergeButton onClick={next}>
            Begin profile
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </ConciergeButton>
          <p className="text-[12px] text-ink-muted italic">
            Takes about four minutes. You can save as you go and return later.
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}
