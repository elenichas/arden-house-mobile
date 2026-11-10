"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Box, Plus, Sparkles, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAspra } from "../store"
import {
  addDays,
  bookingTotal,
  euro,
  experienceById,
  priceLabel,
  experiences,
  reasonFor,
  suggestFor,
  type ExtraId,
} from "../data"
import { Button, EASE, IconButton, Photo, SectionTitle, Sheet, TextLink } from "../ui"
import { ExtrasPicker } from "../shared"
import { StatusPill } from "./today"

export function PlanTab() {
  const store = useAspra()
  const { booking, plan, prefs } = store
  const [day, setDay] = React.useState(0)
  const [adding, setAdding] = React.useState(false)

  if (!booking) {
    return (
      <div className="pb-nav px-5 pt-4">
        <h1 className="font-display text-[38px]">Your plan</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
          Once you book, this is where you plan each day on Milos: boats, dinners, the spa and the walks Nefeli suggests.
        </p>
        <Button size="lg" className="mt-6" onClick={() => window.dispatchEvent(new Event("aspra:rebook"))}>
          Book a stay
        </Button>
      </div>
    )
  }

  const t = bookingTotal(booking)
  const days = Array.from({ length: t.nights + 1 }, (_, i) => i)
  const items = plan.filter((p) => p.day === day).sort((a, b) => a.time.localeCompare(b.time))
  const ranked = suggestFor(prefs, plan)
  const others = experiences.filter((e) => !ranked.includes(e) && !plan.some((p) => p.experienceId === e.id))
  const toggleExtra = (id: ExtraId) =>
    store.setBooking({
      ...booking,
      extras: booking.extras.includes(id) ? booking.extras.filter((x) => x !== id) : [...booking.extras, id],
    })

  const dayName = (i: number) =>
    new Date(addDays(booking.checkIn, i) + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div className="pb-nav">
      <div className="px-5 pt-2">
        <h1 className="font-display text-[38px]">Your plan</h1>
        <p className="mt-1 text-[15px] text-ink-2">
          {t.nights} nights. {plan.length} {plan.length === 1 ? "thing" : "things"} planned. Leave space for doing nothing.
        </p>
      </div>

      <div role="tablist" aria-label="Days of your stay" className="no-scrollbar sticky top-[60px] z-[var(--z-nav)] lg:top-0 lg:rounded-full mt-5 flex gap-2 overflow-x-auto bg-white/40 px-5 py-2 backdrop-blur-xl">
        {days.map((i) => {
          const d = new Date(addDays(booking.checkIn, i) + "T12:00:00")
          const active = i === day
          const count = plan.filter((p) => p.day === i).length
          return (
            <button
              key={i}
              role="tab"
              aria-selected={active}
              onClick={() => setDay(i)}
              className={cn(
                "flex h-[68px] w-[56px] shrink-0 flex-col items-center justify-center rounded-xl border transition-colors",
                active ? "border-ink bg-ink text-white" : "border-white/80 bg-white/60 text-ink backdrop-blur-md",
              )}
            >
              <span className={cn("text-[12px]", active ? "text-white/75" : "text-ink-3")}>
                {d.toLocaleDateString("en-GB", { weekday: "short" })}
              </span>
              <span className="text-[19px] font-semibold tabular-nums">{d.getDate()}</span>
              <span className={cn("mt-0.5 size-1.5 rounded-full", count ? (active ? "bg-sulphur" : "bg-sea") : "bg-transparent")} aria-hidden />
            </button>
          )
        })}
      </div>

      <div className="lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-start">
      <section className="px-5 pt-5" aria-live="polite">
        <h2 className="text-[17px] font-semibold">
          {dayName(day)}
          <span className="ml-2 font-normal text-ink-3">
            {day === 0 ? "Arrival" : day === t.nights ? "Departure" : `Day ${day + 1}`}
          </span>
        </h2>

        <ul className="mt-4 space-y-3">
          <AnimatePresence initial={false}>
            {items.map((p) => {
              const e = experienceById(p.experienceId)
              return (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="flex gap-3 rounded-2xl glass p-3"
                >
                  <Photo src={e.image} alt="" className="size-20 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-center gap-2 text-[13.5px] font-semibold tabular-nums text-sea">
                      {p.time} <StatusPill status={p.status} />
                    </div>
                    <div className="mt-1 text-[15px] font-medium leading-snug">{e.name}</div>
                    <div className="text-[13px] text-ink-3">{e.duration}</div>
                  </div>
                  <IconButton label={`Remove ${e.name}`} onClick={() => store.removeFromPlan(p.id)} className="self-center text-ink-3 hover:bg-ink/5">
                    <Trash2 className="size-[18px]" />
                  </IconButton>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>

        {items.length === 0 && (
          <p className="rounded-2xl glass p-4 text-[14.5px] leading-relaxed text-ink-2">
            {day === 0
              ? "An open first evening. Most guests swim, then eat at Thalami."
              : prefs.pace === "slow"
                ? "Nothing planned. That suits a slow pace."
                : "Nothing planned yet."}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden /> Add
          </Button>
          <Button variant="dark" className="flex-1" onClick={() => store.askConcierge(`Plan ${dayName(day)} for me`)}>
            <Sparkles className="size-4 text-sulphur" aria-hidden /> Plan it for me
          </Button>
        </div>
      </section>

      <section className="mt-12 px-5 lg:mt-5">
        <SectionTitle action={<TextLink onClick={() => store.setProfileOpen(true)}>Suite setup</TextLink>}>
          Your stay
        </SectionTitle>
        <p className="mb-4 text-[14.5px] leading-relaxed text-ink-2">
          Change extras until 48 hours before you arrive. Current total{" "}
          <strong className="font-semibold text-ink tabular-nums">{euro(t.total)}</strong>.
        </p>
        <Button variant="dark" block size="lg" className="mb-4" onClick={() => store.setTourOpen(true)}>
          <Box className="size-5 text-sulphur" aria-hidden /> Set up your suite in 3D
        </Button>
        <ExtrasPicker selected={booking.extras} onToggle={toggleExtra} />
      </section>
      </div>

      <Sheet
        open={adding}
        onClose={() => setAdding(false)}
        title={`Add to ${new Date(addDays(booking.checkIn, day) + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long" })}`}
      >
        <p className="mb-4 text-[14px] text-ink-2">Ordered by what you told us you like.</p>
        <ul className="space-y-3">
          {[...ranked, ...others].map((e) => (
            <li key={e.id} className="flex gap-3 rounded-2xl glass p-3">
              <Photo src={e.image} alt="" className="size-20 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium text-sea">{reasonFor(e, prefs)}</div>
                <div className="text-[15px] font-medium leading-snug">{e.name}</div>
                <div className="mt-0.5 text-[13px] text-ink-3">
                  {e.defaultTime}, {e.duration} · {priceLabel(e)}
                </div>
                {e.windSensitive && <div className="mt-1 text-[12.5px] text-clay">Runs only when the wind allows</div>}
              </div>
              <IconButton
                label={`Add ${e.name}`}
                onClick={() => {
                  store.addToPlan(e.id, day)
                  store.notify(e.per === "included" ? `${e.name} is confirmed.` : `${e.name} requested. We confirm within the hour.`)
                  setAdding(false)
                }}
                className="self-center bg-sea text-white hover:bg-sea-deep"
              >
                <Plus className="size-5" />
              </IconButton>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  )
}
