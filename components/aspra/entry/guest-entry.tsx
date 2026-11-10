"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Box, CalendarDays, Ship } from "lucide-react"
import { useAspra } from "../store"
import { IMG, daysUntil, formatDate, suiteById } from "../data"
import { Button, EASE, FlowHeader, FullScreen, Photo, Step } from "../ui"
import { SuitePrefs, TripPrefs } from "../shared"
import { SuiteTour } from "../suite3d/suite-tour"

/* ─── Guest with an existing booking ────────────────────────── */

export function BookedEntry({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const store = useAspra()
  const [stage, setStage] = React.useState<"find" | "welcome" | "trip" | "room">("find")
  const [ref, setRef] = React.useState("ASP-2614")
  const [last, setLast] = React.useState("Weiss")
  const [error, setError] = React.useState("")
  const [tour, setTour] = React.useState(false)
  const booking = store.booking

  function find(e: React.FormEvent) {
    e.preventDefault()
    if (ref.trim().toUpperCase() !== "ASP-2614" || last.trim().toLowerCase() !== "weiss") {
      setError("We could not find that booking. Check the reference in your confirmation email, or use ASP-2614 and Weiss for this demo.")
      return
    }
    setError("")
    setStage("welcome")
  }

  if (stage === "find") {
    return (
      <FullScreen>
        <FlowHeader onBack={onClose} title="Find your booking" />
        <form onSubmit={find} className="px-5 pt-4">
          <h1 className="font-display text-[36px]">Welcome. Let us find your stay.</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
            Your reference starts with ASP and is in your confirmation email.
          </p>
          <label className="mt-7 block">
            <span className="mb-2 block text-[15px] font-medium">Booking reference</span>
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              autoCapitalize="characters"
              className="h-12 w-full rounded-xl glass px-4 text-[16px] uppercase tracking-wide focus:border-sea focus:outline-none"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-[15px] font-medium">Last name</span>
            <input
              value={last}
              onChange={(e) => setLast(e.target.value)}
              autoComplete="family-name"
              className="h-12 w-full rounded-xl glass px-4 text-[16px] focus:border-sea focus:outline-none"
            />
          </label>
          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-clay-wash px-4 py-3 text-[14px] text-clay">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" block className="mt-8">
            Find booking
          </Button>
          <p className="mt-4 text-center text-[13px] text-ink-3">Demo values are filled in for you.</p>
        </form>
      </FullScreen>
    )
  }

  if (!booking) return null
  const s = suiteById(booking.suiteId)
  const days = daysUntil(booking.checkIn)

  if (stage === "welcome") {
    return (
      <FullScreen className="on-dark bg-obsidian text-white">
        <div className="relative h-[46svh]">
          <Photo src={s.image} alt={`${s.name} at Aspra`} className="absolute inset-0 size-full" priority />
          <div className="photo-fade absolute inset-0" />
          <div className="absolute inset-x-0 top-0">
            <FlowHeader tone="dark" onBack={() => setStage("find")} onClose={onClose} />
          </div>
        </div>
        <div className="relative -mt-16 px-6 pb-[max(env(safe-area-inset-bottom),24px)]">
          <p className="text-[15px] text-sulphur">{days} days to go</p>
          <h1 className="mt-1 font-display text-[36px] leading-[1.02]">
            Clara, your {s.name.toLowerCase()} is waiting.
          </h1>
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-white/15 py-5 text-[14px]">
            <div>
              <dt className="text-white/65">Arrive</dt>
              <dd className="mt-0.5 text-[16px] font-medium">{formatDate(booking.checkIn, { weekday: "short", day: "numeric", month: "short" })}</dd>
            </div>
            <div>
              <dt className="text-white/65">Leave</dt>
              <dd className="mt-0.5 text-[16px] font-medium">{formatDate(booking.checkOut, { weekday: "short", day: "numeric", month: "short" })}</dd>
            </div>
            <div>
              <dt className="text-white/65">Getting here</dt>
              <dd className="mt-0.5 text-[16px] font-medium">Our boat from Adamas</dd>
            </div>
            <div>
              <dt className="text-white/65">Occasion</dt>
              <dd className="mt-0.5 text-[16px] font-medium">Your anniversary</dd>
            </div>
          </dl>
          <p className="mt-5 text-[15px] leading-relaxed text-white/85">
            Take two minutes to tell us how you like your days and your suite. We will have it ready, and Nefeli will plan around it.
          </p>
          <Button variant="sulphur" size="lg" block className="mt-6" onClick={() => setStage("trip")}>
            Prepare my stay
          </Button>
          <Button variant="ghost" size="lg" block className="mt-2 text-white hover:bg-white/10" onClick={onDone}>
            Skip, go to my trip
          </Button>
        </div>
      </FullScreen>
    )
  }

  return (
    <FullScreen className="flex flex-col overflow-hidden">
      <FlowHeader
        onBack={() => setStage(stage === "room" ? "trip" : "welcome")}
        onClose={onClose}
        step={stage === "trip" ? 0 : 1}
        steps={2}
        title="Prepare your stay"
      />
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <Step id={stage}>
            <div className="px-5 pb-8 pt-3">
              <h1 className="font-display text-[34px]">{stage === "trip" ? "Your days on Milos" : "Your suite"}</h1>
              <p className="mb-6 mt-2 text-[15px] leading-relaxed text-ink-2">
                {stage === "trip"
                  ? "We filled this in from your booking. Adjust anything that is not right."
                  : "Housekeeping sets this up the morning you arrive."}
              </p>
              {stage === "trip" ? (
                <TripPrefs prefs={store.prefs} onChange={store.setPrefs} />
              ) : (
                <>
                  <Button variant="dark" block size="lg" className="mb-7" onClick={() => setTour(true)}>
                    <Box className="size-5 text-sulphur" aria-hidden /> Set it up in 3D
                  </Button>
                  <SuitePrefs prefs={store.prefs} onChange={store.setPrefs} />
                </>
              )}
            </div>
          </Step>
        </AnimatePresence>
      </div>
      <div className="border-t border-white/70 bg-white/55 px-5 backdrop-blur-xl pb-[max(env(safe-area-inset-bottom),14px)] pt-3">
        <Button
          size="lg"
          block
          onClick={() => {
            if (stage === "trip") {
              setStage("room")
              return
            }
            store.notify("Saved. Your suite will be ready this way.")
            onDone()
          }}
        >
          {stage === "trip" ? "Continue" : "Save and open my trip"}
        </Button>
      </div>
      <AnimatePresence>
        {tour && (
          <SuiteTour
            suiteId={booking.suiteId}
            prefs={store.prefs}
            onChange={store.setPrefs}
            saveLabel="Keep these choices"
            onClose={() => setTour(false)}
          />
        )}
      </AnimatePresence>
    </FullScreen>
  )
}

/* ─── Returning guest ───────────────────────────────────────── */

export function ReturningEntry({
  onClose,
  onRebook,
  onBrowse,
}: {
  onClose: () => void
  onRebook: () => void
  onBrowse: () => void
}) {
  const { pastStay, guest } = useAspra()
  if (!pastStay) return null

  return (
    <FullScreen>
      <div className="relative h-[40svh]">
        <Photo src={IMG.hero} alt="Aspra from the sea" className="absolute inset-0 size-full" priority />
        <div className="photo-scrim absolute inset-0" />
        <div className="absolute inset-x-0 top-0">
          <FlowHeader tone="dark" onBack={onClose} />
        </div>
        <div className="on-dark absolute inset-x-0 bottom-0 px-6 pb-6 text-white">
          <p className="text-[15px] text-sulphur">
            Last here {formatDate(pastStay.checkIn, { month: "long", year: "numeric" })}
          </p>
          <h1 className="mt-1 font-display text-[38px] leading-[1.0]">Welcome back, {guest.firstName}.</h1>
        </div>
      </div>

      <div className="px-5 pb-[max(env(safe-area-inset-bottom),28px)] pt-6">
        <p className="text-[15.5px] leading-relaxed text-ink-2">
          {pastStay.suiteNumber} is free from 17 to 23 September 2027, the same week as your last stay. We kept everything you told us.
        </p>

        <div className="mt-5 flex gap-3">
          <Button size="lg" className="flex-1" onClick={onRebook}>
            <CalendarDays className="size-5" aria-hidden /> Book {pastStay.suiteNumber} again
          </Button>
        </div>
        <Button variant="outline" size="lg" block className="mt-3" onClick={onBrowse}>
          Look through my last trip
        </Button>

        <h2 className="mb-3 mt-9 font-display text-[26px]">From your last stay</h2>
        <ol className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
          {pastStay.moments.map((m, i) => (
            <motion.li
              key={m.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: EASE }}
              className="w-[74%] shrink-0 snap-start"
            >
              <Photo src={m.image} alt="" className="aspect-[4/5] w-full rounded-2xl" />
              <p className="mt-3 text-[13px] font-medium text-sea">{m.day}</p>
              <h3 className="text-[16px] font-semibold">{m.title}</h3>
              <p className="mt-1 text-[14px] leading-snug text-ink-2">{m.note}</p>
            </motion.li>
          ))}
        </ol>

        <h2 className="mb-3 mt-9 font-display text-[26px]">What we remember</h2>
        <ul className="flex flex-wrap gap-2">
          {pastStay.remembered.map((r) => (
            <li key={r} className="rounded-full glass px-3.5 py-2 text-[14px]">
              {r}
            </li>
          ))}
        </ul>

        <button
          onClick={onRebook}
          className="mt-9 flex w-full items-center gap-4 rounded-2xl bg-obsidian p-4 text-left text-white"
        >
          <Ship className="size-6 shrink-0 text-sulphur" aria-hidden />
          <span className="flex-1 text-[14.5px] leading-snug">
            Book again and the Malagousia you liked last time will be cold in your suite when you arrive.
          </span>
          <ArrowRight className="size-5 shrink-0" aria-hidden />
        </button>
      </div>
    </FullScreen>
  )
}
