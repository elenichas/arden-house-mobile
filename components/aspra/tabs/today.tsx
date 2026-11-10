"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BedDouble,
  Box,
  Car,
  ChevronDown,
  Coffee,
  Phone,
  Plane,
  Plus,
  Ship,
  Sparkles,
  Sunset,
  Waves,
  Wind,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAspra } from "../store"
import {
  IMG,
  bookingTotal,
  conditions,
  dayLabel,
  daysUntil,
  experienceById,
  flowerOptions,
  priceLabel,
  formatDate,
  greekPhrases,
  hotel,
  packingList,
  pillowOptions,
  reasonFor,
  scentOptions,
  suggestFor,
  suiteById,
  type Phase,
} from "../data"
import { Button, EASE, Photo, Segmented, SectionTitle, TextLink } from "../ui"
import { Keepsakes } from "./journal"

export function TodayTab() {
  const { booking, phase, setPhase } = useAspra()

  return (
    <div className="pb-nav">
      {booking && (
        <div className="px-5 pb-4 pt-1 md:max-w-[460px]">
          <p id="phase-label" className="mb-2 text-[13px] text-ink-3">
            The app changes with your trip. Preview each stage:
          </p>
          <Segmented<Phase>
            label="Trip stage"
            value={phase}
            onChange={setPhase}
            options={[
              { id: "before", label: "Before" },
              { id: "during", label: "On Milos" },
              { id: "after", label: "After" },
            ]}
          />
        </div>
      )}
      <motion.div key={booking ? phase : "none"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
        {!booking ? <AfterStay /> : phase === "before" ? <BeforeStay /> : phase === "during" ? <DuringStay /> : <AfterStay />}
      </motion.div>
    </div>
  )
}

/* ─── Before ────────────────────────────────────────────────── */

function BeforeStay() {
  const { booking, guest, prefs, plan, setProfileOpen, setTourOpen, setTab, addRequest, askConcierge } = useAspra()
  const [packOpen, setPackOpen] = React.useState(false)
  if (!booking) return null
  const s = suiteById(booking.suiteId)
  const days = daysUntil(booking.checkIn)
  const nights = bookingTotal(booking).nights
  const boat = booking.extras.includes("boat-transfer")
  const car = booking.extras.includes("car-transfer")

  return (
    <div className="space-y-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-2 lg:gap-y-10 lg:space-y-0">
      <section className="px-5 lg:row-span-3">
        <div className="relative overflow-hidden rounded-2xl">
          <Photo src={s.image} alt={`${s.name} at Aspra`} className="aspect-[4/5.2] w-full md:aspect-[16/10] lg:aspect-auto lg:h-[620px]" priority />
          <div className="on-dark glass-smoke absolute inset-x-3 bottom-3 rounded-[20px] p-4 text-white md:right-auto md:max-w-[440px]">
            <p className="text-[14px] font-medium text-white/85">
              {days} {days === 1 ? "day" : "days"} to Milos
            </p>
            <h1 className="mt-1 font-display text-[30px] leading-[1.03]">
              {guest.firstName ? `${guest.firstName}, your` : "Your"} {s.name.toLowerCase()} is booked.
            </h1>
            <p className="mt-2 text-[14.5px] text-white/85">
              {formatDate(booking.checkIn, { weekday: "short", day: "numeric", month: "short" })} to{" "}
              {formatDate(booking.checkOut, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}, {nights} nights. Ref {booking.ref}
            </p>
          </div>
        </div>
      </section>

      <section className="px-5">
        <SectionTitle>Getting here</SectionTitle>
        <div className="divide-y divide-border rounded-2xl glass">
          <div className="flex items-start gap-4 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sea-wash text-sea">
              {booking.arrival.by === "air" ? <Plane className="size-5" aria-hidden /> : <Ship className="size-5" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-medium">{booking.arrival.detail}</div>
              <div className="text-[14px] text-ink-3">
                Lands {formatDate(booking.checkIn, { weekday: "short", day: "numeric", month: "short" })} at {booking.arrival.time}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sea-wash text-sea">
              {boat ? <Ship className="size-5" aria-hidden /> : <Car className="size-5" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-medium">
                {boat ? "Our boat meets you at Adamas" : car ? "A driver meets you" : "No transfer booked yet"}
              </div>
              <div className="text-[14px] leading-snug text-ink-3">
                {boat
                  ? "Captain Manolis waits at the west quay. 35 minutes along the coast to our jetty."
                  : car
                    ? `Your name on a board in arrivals. ${hotel.airportMinutes} minutes to the hotel.`
                    : "Taxis on Milos are few in summer. We can book a car for €60."}
              </div>
              {!boat && !car && (
                <Button size="sm" variant="outline" className="mt-3" onClick={() => addRequest("Car transfer on arrival")}>
                  Book a car
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5">
        <SectionTitle action={<TextLink onClick={() => setProfileOpen(true)}>Change</TextLink>}>Your suite on arrival</SectionTitle>
        <div className="overflow-hidden rounded-2xl bg-sea-wash">
          <div className="flex gap-4 p-4">
            <BedDouble className="mt-0.5 size-5 shrink-0 text-sea" aria-hidden />
            <p className="text-[15px] leading-relaxed">
              {prefs.bed === "king" ? "One king bed" : "Two single beds"},{" "}
              {pillowOptions.find((p) => p.id === prefs.pillow)?.label.toLowerCase()} pillows,{" "}
              {flowerOptions.find((f) => f.id === prefs.flowers)?.label.toLowerCase()} on the ledge,{" "}
              {scentOptions.find((p) => p.id === prefs.scent)?.label.toLowerCase()}, {prefs.temperature}°C.
              {prefs.occasion === "anniversary" && " A note and Assyrtiko for your anniversary."}
              {prefs.note && ` ${prefs.note}`}
            </p>
          </div>
          <button
            onClick={() => setTourOpen(true)}
            className="flex w-full items-center gap-3 border-t border-sea/15 px-4 py-3.5 text-left text-[15px] font-medium text-sea-deep hover:bg-sea/5"
          >
            <Box className="size-5" aria-hidden />
            <span className="flex-1">Walk through your suite in 3D</span>
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </section>

      <section className="px-5">
        <SectionTitle action={<TextLink onClick={() => setTab("plan")}>Open plan</TextLink>}>Planned so far</SectionTitle>
        {plan.length === 0 ? (
          <button
            onClick={() => setTab("plan")}
            className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-ink/25 p-4 text-left"
          >
            <Plus className="size-5 text-sea" aria-hidden />
            <span className="flex-1 text-[15px]">
              Nothing yet. The boat to Kleftiko fills by May, so book it early.
            </span>
          </button>
        ) : (
          <ul className="space-y-2">
            {[...plan].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time)).slice(0, 4).map((p) => {
              const e = experienceById(p.experienceId)
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-xl glass p-2 pr-4">
                  <Photo src={e.image} alt="" className="size-14 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-medium">{e.name}</div>
                    <div className="text-[13.5px] text-ink-3">
                      {dayLabel(booking.checkIn, p.day)}, {p.time}
                    </div>
                  </div>
                  <StatusPill status={p.status} />
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="px-5">
        <SectionTitle>Before you pack</SectionTitle>
        <div className="rounded-2xl glass">
          <button
            aria-expanded={packOpen}
            onClick={() => setPackOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-4 p-4 text-left"
          >
            <span className="text-[15px] font-medium">What to bring to Milos in {formatDate(booking.checkIn, { month: "long" })}</span>
            <ChevronDown className={cn("size-5 shrink-0 transition-transform", packOpen && "rotate-180")} aria-hidden />
          </button>
          {packOpen && (
            <ul className="space-y-3 border-t border-white/70 p-4">
              {packingList.map((item) => (
                <li key={item} className="flex gap-3 text-[14.5px] leading-snug">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-sea" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <h3 className="mb-3 mt-6 text-[16px] font-semibold">Five words of Greek</h3>
        <ul className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {greekPhrases.map((p) => (
            <li key={p.greek} className="w-[150px] shrink-0 rounded-2xl bg-obsidian p-4 text-white">
              <div className="font-display text-[22px] leading-tight">{p.greek}</div>
              <div className="mt-2 text-[13px] leading-snug text-white/75">{p.english}</div>
            </li>
          ))}
        </ul>
      </section>

      <AskNefeli
        title="Questions before you travel?"
        prompts={["Plan my first day", "Which ferry should I take?", "Is the sea warm in June?"]}
        onAsk={askConcierge}
      />
    </div>
  )
}

/* ─── During ────────────────────────────────────────────────── */

const quickServices = [
  { label: "Fresh towels", icon: Waves, request: "Fresh beach towels to the suite" },
  { label: "Breakfast now", icon: Coffee, request: "Breakfast on the terrace, now" },
  { label: "Car to Plaka", icon: Car, request: "Car to Plaka at 18:30" },
  { label: "Call reception", icon: Phone, request: "" },
]

function DuringStay() {
  const { booking, guest, prefs, plan, requests, addRequest, addToPlan, askConcierge, setTab, notify } = useAspra()
  if (!booking) return null
  const nights = bookingTotal(booking).nights
  const today = Math.min(2, nights - 1)
  const todays = plan.filter((p) => p.day === today).sort((a, b) => a.time.localeCompare(b.time))
  const picks = suggestFor(prefs, plan).slice(0, 4)
  const greeting = prefs.rhythm === "early" ? "Kalimera" : "Kalimera, no rush"

  return (
    <div className="space-y-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-2 lg:gap-y-10 lg:space-y-0">
      <section className="px-5 lg:col-span-2">
        <p className="text-[14px] text-ink-3">
          {dayLabel(booking.checkIn, today)}, day {today + 1} of {nights}
        </p>
        <h1 className="mt-1 font-display text-[38px] leading-[1.02]">
          {greeting}{guest.firstName ? `, ${guest.firstName}` : ""}.
        </h1>

        <dl className="mt-5 grid grid-cols-4 gap-2 text-center md:max-w-[520px]">
          {[
            { k: "Air", v: `${conditions.air}°` },
            { k: "Sea", v: `${conditions.sea}°` },
            { k: "Wind", v: "NW 5" },
            { k: "Sunset", v: conditions.sunset },
          ].map((c) => (
            <div key={c.k} className="rounded-xl glass py-3">
              <dt className="text-[12.5px] text-ink-3">{c.k}</dt>
              <dd className="mt-0.5 text-[17px] font-semibold tabular-nums">{c.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 flex gap-3 rounded-2xl bg-sulphur/35 p-4">
          <Wind className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-[14.5px] leading-relaxed">
            The meltemi is blowing from the north west. Sarakiniko will be rough. Tsigrado and Firiplaka on the south coast are sheltered and calm until 16:00.
          </p>
        </div>
      </section>

      <section className="px-5">
        <SectionTitle action={<TextLink onClick={() => setTab("plan")}>Full plan</TextLink>}>Today</SectionTitle>
        <ol className="relative space-y-1 border-l border-ink/15 pl-5">
          <TimelineItem time="09:00" title="Breakfast on your terrace" detail="Brought to your suite. Change the time with Nefeli." />
          {todays.map((p) => {
            const e = experienceById(p.experienceId)
            return <TimelineItem key={p.id} time={p.time} title={e.name} detail={e.short} status={p.status} />
          })}
          <TimelineItem time={conditions.sunset} title="Sunset" detail="Best seen from the Thalami terrace or your own." icon={<Sunset className="size-4" aria-hidden />} />
        </ol>
      </section>

      <section className="px-5">
        <SectionTitle>Ask for anything</SectionTitle>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {quickServices.map((q) => {
            const Icon = q.icon
            return (
              <button
                key={q.label}
                onClick={() => (q.request ? addRequest(q.request) : notify(`Reception, 24 hours: ${hotel.receptionPhone}`))}
                className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-obsidian px-4 text-[14px] font-medium text-white active:scale-[0.98]"
              >
                <Icon className="size-4 text-sulphur" aria-hidden /> {q.label}
              </button>
            )
          })}
        </div>
        {requests.length > 0 && (
          <ul className="mt-4 divide-y divide-border rounded-2xl glass" aria-live="polite">
            {requests.slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[14.5px]">
                <span className="min-w-0 truncate">{r.label}</span>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[12.5px] font-medium", r.status === "sent" ? "bg-chalk-2 text-ink-2" : "bg-sea-wash text-sea-deep")}>
                  {r.status === "sent" ? "Sent" : "On its way"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="lg:col-span-2">
        <SectionTitle className="px-5">Picked for you</SectionTitle>
        <ul className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {picks.map((e) => (
            <li key={e.id} className="w-[68%] shrink-0 snap-start md:w-[280px] lg:w-auto">
              <div className="relative overflow-hidden rounded-2xl">
                <Photo src={e.image} alt="" className="aspect-[4/5] w-full" />
                <span className="glass absolute left-3 top-3 rounded-full px-2.5 py-1 text-[12.5px] font-medium">
                  {reasonFor(e, prefs)}
                </span>
              </div>
              <h3 className="mt-3 text-[16px] font-semibold leading-snug">{e.name}</h3>
              <p className="mt-0.5 text-[13.5px] text-ink-3">
                {e.duration} · {priceLabel(e)}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => {
                  addToPlan(e.id, Math.min(today + 1, nights - 1))
                  notify(`${e.name} added for ${dayLabel(booking.checkIn, Math.min(today + 1, nights - 1))}.`)
                }}
              >
                <Plus className="size-4" aria-hidden /> Add to tomorrow
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <AskNefeli
        className="lg:col-span-2"
        title="Nefeli is here all night too"
        prompts={["Where should we swim today?", "Book dinner for two at 21:00", "We need a pharmacy"]}
        onAsk={askConcierge}
      />
    </div>
  )
}

function TimelineItem({
  time,
  title,
  detail,
  status,
  icon,
}: {
  time: string
  title: string
  detail: string
  status?: "confirmed" | "requested"
  icon?: React.ReactNode
}) {
  return (
    <li className="relative pb-4">
      <span className="absolute -left-[27px] top-1 grid size-3.5 place-items-center rounded-full border-2 border-chalk bg-sea" aria-hidden />
      <div className="flex items-baseline gap-3">
        <span className="w-12 shrink-0 text-[14px] font-semibold tabular-nums">{time}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[15px] font-medium">
            {icon}
            {title}
            {status && <StatusPill status={status} />}
          </div>
          <p className="mt-0.5 text-[14px] leading-snug text-ink-3">{detail}</p>
        </div>
      </div>
    </li>
  )
}

export function StatusPill({ status }: { status: "confirmed" | "requested" }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium",
        status === "confirmed" ? "bg-sea-wash text-sea-deep" : "bg-sulphur/40 text-ink",
      )}
    >
      {status === "confirmed" ? "Confirmed" : "Requested"}
    </span>
  )
}

/* ─── After ─────────────────────────────────────────────────── */

function AfterStay() {
  const { booking, pastStay, guest, plan, setTab, askConcierge } = useAspra()
  const suiteName = booking ? suiteById(booking.suiteId).name : pastStay?.suiteNumber ?? "your suite"
  const nights = booking ? bookingTotal(booking).nights : 6

  return (
    <div className="space-y-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-2 lg:gap-y-10 lg:space-y-0">
      <section className="px-5 lg:col-span-2">
        <div className="relative overflow-hidden rounded-2xl">
          <Photo src={IMG.keepsake} alt="Olive oil, thyme honey and oregano from Milos on a kitchen table" className="aspect-[4/5.2] w-full md:aspect-[16/8] lg:aspect-[16/6]" priority />
          <div className="on-dark glass-smoke absolute inset-x-3 bottom-3 rounded-[20px] p-4 text-white md:right-auto md:max-w-[440px]">
            <p className="text-[14px] font-medium text-white/85">Home again</p>
            <h1 className="mt-1 font-display text-[30px] leading-[1.03]">
              Welcome home{guest.firstName ? `, ${guest.firstName}` : ""}.
            </h1>
            <p className="mt-2 text-[14.5px] text-white/85">
              {nights} nights in {suiteName}
              {booking && plan.length > 0 && `, ${plan.length} experiences`}. Your journal, recipes and island pantry are here.
            </p>
          </div>
        </div>
        <Button variant="dark" size="lg" block className="mt-4" onClick={() => setTab("journal")}>
          Open your journal <ArrowRight className="size-4" aria-hidden />
        </Button>
      </section>

      <Keepsakes />

      <section className="px-5">
        <div className="on-dark rounded-3xl bg-obsidian p-5 text-white">
          <h2 className="font-display text-[28px] leading-tight">The same week next year</h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-white/85">
            We hold your suite and dates for 14 days after you leave. Your preferences come with you.
          </p>
          <Button
            variant="sulphur"
            className="mt-4"
            onClick={() => window.dispatchEvent(new Event("aspra:rebook"))}
          >
            Book the same week again
          </Button>
        </div>
      </section>

      <AskNefeli
        title="Nefeli still answers"
        prompts={["How do I make the fava?", "Send olive oil to my home", "What was the wine we liked?"]}
        onAsk={askConcierge}
      />
    </div>
  )
}

/* ─── Shared ────────────────────────────────────────────────── */

function AskNefeli({ title, prompts, onAsk, className }: { title: string; prompts: string[]; onAsk: (t: string) => void; className?: string }) {
  return (
    <section className={cn("px-5", className)}>
      <div className="on-dark rounded-3xl bg-sea p-5 text-white">
        <div className="flex items-center gap-2 text-[13.5px] text-white/70">
          <Sparkles className="size-4" aria-hidden /> Nefeli, concierge, 24 hours
        </div>
        <h2 className="mt-2 font-display text-[28px] leading-tight">{title}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => onAsk(p)}
              className="min-h-11 rounded-full border border-white/25 bg-white/15 px-4 text-left text-[14px] backdrop-blur-md transition-colors hover:bg-white/25"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
