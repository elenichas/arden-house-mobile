"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  BellRing,
  Bus,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Copy,
  Droplets,
  Eye,
  EyeOff,
  Flame,
  Gem,
  Layers,
  Leaf,
  Luggage,
  Minus,
  Plus,
  Snowflake,
  UtensilsCrossed,
  Waves,
  Wifi,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useArden } from "../arden-context"
import { guest, hotel, meetingRooms, services, spaces, wifi } from "../data"
import type { ServiceId, SpaceKey } from "../types"
import { Card, ElevationMark, GoldRule, OccupancyMeter, PrimaryButton, SectionHead } from "../primitives"

const serviceIconMap: Record<ServiceId, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  reception: BellRing,
  housekeeping: BedDouble,
  valet: Car,
  bell: Luggage,
  "in-room-dining": UtensilsCrossed,
  spa: Leaf,
  transport: Bus,
}

const spaceIconMap: Record<SpaceKey, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  foyer: Columns3,
  salons: Layers,
  retreat: Droplets,
  emerald: Gem,
}

type View = "home" | "service" | "meetings" | "salons" | "restaurant" | "retreat" | "massage" | "bookings"

export function ConciergeTab() {
  const [view, setView] = React.useState<View>("home")
  const [activeService, setActiveService] = React.useState<ServiceId | null>(null)

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        {view === "home" && (
          <ConciergeHome
            key="home"
            onOpenService={(id) => {
              setActiveService(id)
              setView("service")
            }}
            onOpenMeetings={() => setView("meetings")}
            onOpenSalons={() => setView("salons")}
            onOpenRestaurant={() => setView("restaurant")}
            onOpenRetreat={() => setView("retreat")}
          />
        )}
        {view === "service" && activeService ? (
          <ServiceRequestSheet
            key="service"
            service={activeService}
            onBack={() => {
              setView("home")
              setActiveService(null)
            }}
          />
        ) : null}
        {view === "meetings" && (
          <MeetingRoomsSheet key="meetings" onBack={() => setView("home")} />
        )}
        {view === "salons" && (
          <SalonsSheet key="salons" onBack={() => setView("home")} />
        )}
        {view === "restaurant" && (
          <RestaurantBookingSheet key="restaurant" onBack={() => setView("home")} />
        )}
        {view === "retreat" && (
          <RetreatBookingSheet key="retreat" onBack={() => setView("home")} onOpenMassage={() => setView("massage")} />
        )}
        {view === "massage" && (
          <MassageBookingSheet key="massage" onBack={() => setView("retreat")} onConfirm={() => setView("bookings")} />
        )}
        {view === "bookings" && (
          <BookingsOverviewSheet key="bookings" onBack={() => setView("home")} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ——— Home ——— */
function ConciergeHome({
  onOpenService,
  onOpenMeetings,
  onOpenSalons,
  onOpenRestaurant,
  onOpenRetreat,
}: {
  onOpenService: (id: ServiceId) => void
  onOpenMeetings: () => void
  onOpenSalons: () => void
  onOpenRestaurant: () => void
  onOpenRetreat: () => void
}) {
  const { requests, jumpTo } = useArden()

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl px-5 pt-[calc(84px+env(safe-area-inset-top))] pb-10 sm:px-8"
    >
      <SectionHead
        kicker="In the hotel, now"
        title={
          <>
            {hotel.conciergeName} is here,
            <br />
            <span className="italic font-light text-ink-soft">for practical help.</span>
          </>
        }
        subtitle="Reception, housekeeping, valet, dining, spa, and meeting-room support."
      />
      <GoldRule />

      {/* Active requests (if any) */}
      {requests.length > 0 ? (
        <div className="mt-7">
          <div className="mb-3 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
            In progress
          </div>
          <div className="flex flex-col gap-2">
            {requests.slice(0, 3).map((r) => {
              const svc = services.find((s) => s.id === r.service)
              return (
                <div
                  key={r.id}
                  className="flex items-start gap-3 rounded-2xl glass-card px-4 py-3"
                >
                  <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-gold animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-[15px] text-ink">{svc?.label}</div>
                    <div className="mt-0.5 font-serif italic text-[13px] text-ink-soft line-clamp-1">
                      {r.note || "Sent."}
                    </div>
                  </div>
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold-deep">
                    {r.status === "sent" ? "Sent" : r.status === "acknowledged" ? "On its way" : "Done"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Space pulse — The hotel, right now */}
      <div className="mt-9">
        <div className="mb-3 flex items-end justify-between">
          <div className="font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
            The hotel, right now
          </div>
          <span className="font-serif italic text-[12px] text-ink-muted">live</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {spaces.map((s) => {
            const Icon = spaceIconMap[s.id]
            const isSalons = s.id === "salons"
            const isRetreat = s.id === "retreat"
            const isInteractive = isSalons || isRetreat
            return (
              <Card
                key={s.id}
                interactive={isInteractive}
                onClick={isSalons ? onOpenSalons : isRetreat ? onOpenRetreat : undefined}
                className="overflow-hidden"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image || "/placeholder.svg"}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {/* Subtle bottom gradient so the occupancy meter below reads
                      cleanly even when the photograph's lower edge is bright. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
                  {/* Space mark — a small cream disc with the architectural glyph */}
                  <span className="glass-card absolute left-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-gold-deep">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </span>
                  {/* Count badge for The Salons — signals its composite nature */}
                  {isSalons && s.subSalons ? (
                    <span className="glass-card absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 font-sans text-[10px] tracking-[0.18em] uppercase text-ink">
                      {s.subSalons.length} salons
                    </span>
                  ) : null}
                </div>
                <div className="p-3.5">
                  <div className="font-serif text-[15.5px] leading-tight text-ink">
                    {s.name}
                  </div>
                  <div className="mt-0.5 font-serif italic text-[12px] text-ink-soft line-clamp-2 min-h-[30px]">
                    {s.subtitle}
                  </div>
                  <div className="mt-2.5">
                    <OccupancyMeter value={s.occupancy} />
                    <div className="mt-1.5 flex items-center justify-between font-sans text-[10px] text-ink-muted">
                      <span className="uppercase tracking-[0.18em]">{s.occupancy}%</span>
                      <span className="tabular-nums">
                        {s.current} / {s.capacity}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Meeting rooms CTA */}
      <div className="mt-5">
        <Card interactive onClick={onOpenMeetings} className="overflow-hidden">
          <div className="flex items-stretch">
            <div className="relative w-28 shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/rebrand/meeting-room.png"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 p-5">
              <div className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
                Meeting rooms
              </div>
              <div className="mt-1 font-serif text-[18px] leading-tight text-ink">
                Three rooms free today.
              </div>
              <div className="mt-0.5 font-serif italic text-[13px] text-ink-soft line-clamp-2">
                Walnut tables, daylight, silent AC.
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1.5 font-sans text-[12px] text-gold-deep">
                Reserve one
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Restaurant CTA */}
      <div className="mt-3">
        <Card interactive onClick={onOpenRestaurant} className="overflow-hidden">
          <div className="flex items-stretch">
            <div className="relative w-28 shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/rebrand/restaurant-lounge.png"
                alt="The Restaurant"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 p-5">
              <div className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
                The Restaurant
              </div>
              <div className="mt-1 font-serif text-[18px] leading-tight text-ink">
                Reserve a table.
              </div>
              <div className="mt-0.5 font-serif italic text-[13px] text-ink-soft line-clamp-2">
                Choose a time, party size, and dining notes.
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1.5 font-sans text-[12px] text-gold-deep">
                Reserve a table
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Services */}
      <div className="mt-9">
        <div className="mb-2 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
          Services
        </div>
        <div className="grid grid-cols-3 gap-2">
          {services.map((s) => {
            const Icon = serviceIconMap[s.id]
            return (
              <Card
                key={s.id}
                interactive
                onClick={() => onOpenService(s.id)}
                className="p-3 flex flex-col items-center text-center"
              >
                <Icon className="h-4.5 w-4.5 text-gold-deep" strokeWidth={1.5} />
                <div className="mt-2 font-serif text-[13px] leading-tight text-ink">
                  {s.label}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Wi-Fi */}
      <div className="mt-7">
        <div className="mb-2 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
          Connectivity
        </div>
        <WifiCardCompact />
      </div>

      {/* Footer link to assistant */}
      <div className="mt-10 flex flex-col items-start gap-2 border-t border-[color:color-mix(in_oklch,var(--ink)_8%,transparent)] pt-6">
        <p className="font-serif italic text-[14.5px] text-ink-soft leading-relaxed">
          Prefer a quiet chat? {hotel.conciergeName} and the assistant both listen.
        </p>
        <button
          type="button"
          onClick={() => jumpTo("assistant")}
          className="inline-flex items-center gap-1.5 font-sans text-[13px] text-ink hover:text-gold-deep transition-colors"
        >
          Open the assistant
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* About the House — the elevation drawing as architectural storytelling */}
      <div className="mt-12 flex flex-col items-center gap-4 border-t border-[color:color-mix(in_oklch,var(--ink)_1%,transparent)] pt-10">
        <ElevationMark height="h-28" />
        <div className="text-center">
          <div className="font-sans text-[10px] tracking-[0.28em] uppercase text-ink-muted">
           Vision
          </div>
          <p className="mt-2 max-w-xs mx-auto font-serif italic text-[13.5px] leading-relaxed text-ink-soft">
            Arden House is built for the rhythm of the modern business stay: composed rooms,
            quiet service, and enough warmth to make a working trip feel considered.

          </p>
          <p className="mt-3 font-sans text-[10.5px] tracking-[0.18em] text-ink-muted">
            {hotel.address}
          </p>
        </div>
      </div>
    </motion.section>
  )
}

/* ——— Wi-Fi card — reveal password + copy ——— */
function WifiCardInternal() {
  const [shown, setShown] = React.useState(false)
  const [copied, setCopied] = React.useState<"ssid" | "pass" | null>(null)

  const copy = (v: string, k: "ssid" | "pass") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(v).catch(() => { })
    }
    setCopied(k)
    setTimeout(() => setCopied(null), 1400)
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:color-mix(in_oklch,var(--gold)_15%,var(--cream))]">
          <Wifi className="h-4 w-4 text-gold-deep" strokeWidth={1.5} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
            Network
          </div>
          <button
            type="button"
            onClick={() => copy(wifi.ssid, "ssid")}
            className="mt-1 flex items-center gap-2 font-serif text-[18px] text-ink"
          >
            {wifi.ssid}
            {copied === "ssid" ? (
              <Check className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
            ) : (
              <Copy className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-[color:color-mix(in_oklch,var(--ink)_7%,transparent)] pt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
              Password
            </div>
            <div className="mt-1 font-serif text-[18px] tabular-nums text-ink">
              {shown ? wifi.password : "•".repeat(wifi.password.length)}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShown((s) => !s)}
              aria-label={shown ? "Hide password" : "Show password"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-cream hover:text-ink transition-colors"
            >
              {shown ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
            <button
              type="button"
              onClick={() => copy(wifi.password, "pass")}
              aria-label="Copy password"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-cream hover:text-ink transition-colors"
            >
              {copied === "pass" ? (
                <Check className="h-4 w-4 text-gold-deep" strokeWidth={1.5} />
              ) : (
                <Copy className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[color:color-mix(in_oklch,var(--ink)_7%,transparent)] pt-4">
        <span className="font-serif italic text-[13px] text-ink-soft">{wifi.note}</span>
        <span className="font-sans text-[10.5px] tabular-nums uppercase tracking-[0.18em] text-gold-deep">
          {wifi.speed}
        </span>
      </div>
    </Card>
  )
}

/* ——— Compact Wi-Fi card ——— */
function WifiCardCompact() {
  const [shown, setShown] = React.useState(false)
  const [copied, setCopied] = React.useState<"ssid" | "pass" | null>(null)

  const copy = (v: string, k: "ssid" | "pass") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(v).catch(() => { })
    }
    setCopied(k)
    setTimeout(() => setCopied(null), 1400)
  }

  return (
    <Card className="px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:color-mix(in_oklch,var(--gold)_15%,var(--cream))]">
          <Wifi className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copy(wifi.ssid, "ssid")}
              className="flex items-center gap-1.5 font-serif text-[15px] text-ink"
            >
              {wifi.ssid}
              {copied === "ssid" ? (
                <Check className="h-3 w-3 text-gold-deep" strokeWidth={1.5} />
              ) : (
                <Copy className="h-3 w-3 text-ink-muted" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
        <span className="font-sans text-[10px] tabular-nums uppercase tracking-[0.18em] text-gold-deep">
          {wifi.speed}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-3 border-t border-[color:color-mix(in_oklch,var(--ink)_7%,transparent)] pt-2.5">
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-ink-muted">Pass</span>
          <span className="font-serif text-[14px] tabular-nums text-ink">
            {shown ? wifi.password : "\u2022".repeat(wifi.password.length)}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? "Hide password" : "Show password"}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-cream hover:text-ink transition-colors"
          >
            {shown ? (
              <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
          </button>
          <button
            type="button"
            onClick={() => copy(wifi.password, "pass")}
            aria-label="Copy password"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-cream hover:text-ink transition-colors"
          >
            {copied === "pass" ? (
              <Check className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </Card>
  )
}

/* ——— Service request sheet ——— */
function ServiceRequestSheet({
  service,
  onBack,
}: {
  service: ServiceId
  onBack: () => void
}) {
  const { addRequest } = useArden()
  const svc = services.find((s) => s.id === service)!
  const [note, setNote] = React.useState("")
  const [sent, setSent] = React.useState(false)

  const quickOptions: Record<ServiceId, string[]> = {
    reception: ["Late check-out, please", "Extend my stay by one night", "A quiet word"],
    housekeeping: ["Turn-down, please", "Extra towels", "Fresh linens tomorrow", "Press a suit"],
    valet: ["Bring the car at 09:00", "Arrange an airport transfer", "A driver in 30 min"],
    bell: ["Collect luggage", "Deliver a package to my suite"],
    "in-room-dining": ["The dinner menu", "A bottle of still water", "Late-night bites"],
    spa: ["A massage this evening", "Availability tomorrow morning"],
    transport: ["Airport shuttle tomorrow", "A car to Midtown", "Train station transfer"],
  }

  const submit = () => {
    addRequest({ service, note: note.trim() || svc.label })
    setSent(true)
    setTimeout(() => {
      setSent(false)
      onBack()
    }, 1400)
  }

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl px-5 pt-[calc(84px+env(safe-area-inset-top))] pb-10 sm:px-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-sans text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Concierge
      </button>

      <SectionHead
        kicker={`Service · ${svc.label}`}
        title={<>How may we help, {guest.title} {guest.lastName}?</>}
        subtitle={svc.hint}
      />
      <GoldRule />

      <div className="mt-7">
        <div className="mb-3 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
          Common requests
        </div>
        <div className="flex flex-wrap gap-2">
          {quickOptions[service].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setNote(q)}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-sans text-[12.5px] transition-all duration-400",
                note === q
                  ? "glass-pill !border-[color:color-mix(in_oklch,var(--gold)_60%,transparent)] text-ink"
                  : "glass-pill text-ink-soft hover:text-ink",
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <label className="block">
          <span className="font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
            Anything to add?
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="A word or two…"
            className="mt-2 w-full rounded-[18px] glass-soft p-4 font-serif text-[16px] leading-relaxed text-ink placeholder:text-ink-muted/60 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <PrimaryButton onClick={submit} disabled={sent}>
          {sent ? (
            <>
              <Check className="h-4 w-4" strokeWidth={1.5} />
              Sent
            </>
          ) : (
            <>
              Send to {hotel.conciergeName}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </>
          )}
        </PrimaryButton>
      </div>

      <p className="mt-4 font-serif italic text-[12.5px] text-ink-muted">
        Typical response within a few minutes.
      </p>
    </motion.section>
  )
}

/* ——— Meeting rooms sheet ——— */
function MeetingRoomsSheet({ onBack }: { onBack: () => void }) {
  const { addRequest } = useArden()
  const [selectedRoom, setSelectedRoom] = React.useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null)
  const [confirmed, setConfirmed] = React.useState(false)

  const room = meetingRooms.find((r) => r.id === selectedRoom)

  const book = () => {
    if (!room || !selectedSlot) return
    addRequest({
      service: "reception",
      note: `Meeting room · ${room.name}, ${selectedSlot}`,
    })
    setConfirmed(true)
    setTimeout(() => {
      setConfirmed(false)
      onBack()
    }, 1800)
  }

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl px-5 pt-[calc(84px+env(safe-area-inset-top))] pb-10 sm:px-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-sans text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Concierge
      </button>

      <SectionHead
        kicker="Meeting rooms"
        title={
          <>
            A quiet place
            <br />
            <span className="italic font-light text-ink-soft">for a meeting.</span>
          </>
        }
        subtitle="Choose a room, check availability, and reserve a time."
      />
      <GoldRule />

      <div className="mt-7 flex flex-col gap-4">
        {meetingRooms.map((r) => (
          <Card
            key={r.id}
            className={cn(
              "overflow-hidden ring-1 ring-inset transition-all",
              selectedRoom === r.id
                ? "ring-[color:color-mix(in_oklch,var(--gold)_60%,transparent)]"
                : "ring-transparent",
            )}
          >
            <div className="flex flex-col sm:flex-row">
              <div className="relative h-32 w-full sm:h-auto sm:w-40 shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.image || "/placeholder.svg"}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-serif text-[18px] leading-tight text-ink">
                      {r.name}
                    </div>
                    <div className="mt-0.5 font-serif italic text-[13px] text-ink-soft">
                      {r.floor} · seats {r.capacity}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full glass-pill px-2.5 py-1 text-[11px] font-sans text-ink-soft"
                    >
                      {a}
                    </span>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="mb-2 font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted">
                    Today
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.availability.map((slot) => {
                      const label = `${slot.start}–${slot.end}`
                      const slotKey = `${r.id}:${label}`
                      const active = selectedRoom === r.id && selectedSlot === label
                      return (
                        <button
                          key={slotKey}
                          type="button"
                          disabled={slot.booked}
                          onClick={() => {
                            setSelectedRoom(r.id)
                            setSelectedSlot(label)
                          }}
                          className={cn(
                            "rounded-full px-3 py-1.5 font-sans text-[11.5px] tabular-nums ring-1 ring-inset transition-all duration-300",
                            slot.booked
                              ? "bg-[color:color-mix(in_oklch,var(--ink)_5%,var(--cream))] text-ink-muted/50 ring-[color:color-mix(in_oklch,var(--ink)_6%,transparent)] line-through cursor-not-allowed"
                              : active
                                ? "bg-ink text-cream ring-ink"
                                : "bg-cream text-ink-soft ring-[color:color-mix(in_oklch,var(--ink)_10%,transparent)] hover:text-ink",
                          )}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <PrimaryButton onClick={book} disabled={!selectedRoom || !selectedSlot || confirmed}>
          {confirmed ? (
            <>
              <Check className="h-4 w-4" strokeWidth={1.5} />
              Reserved
            </>
          ) : (
            <>
              {room && selectedSlot
                ? `Reserve ${room.name}, ${selectedSlot}`
                : "Choose a slot"}
              {!confirmed ? <ArrowRight className="h-4 w-4" strokeWidth={1.5} /> : null}
            </>
          )}
        </PrimaryButton>
      </div>
    </motion.section>
  )
}

/* ——— Salons sheet ———
   The Salons is a composite space — five layered environments within one
   public floor. Tapping its card brings the guest here, where each salon
   is given its own short editorial card. No booking required; the
   concierge handles access in person. */
/* ——— Restaurant booking sheet ———
   A self-contained flow where the guest picks a date, a time slot, the
   number of guests, and optionally adds a note. Confirming sends a
   service request and shows a brief confirmation before returning to
   the concierge home. */

const dinnerSlots = [
  { time: "18:00", label: "6 pm", available: true },
  { time: "18:30", label: "6:30 pm", available: true },
  { time: "19:00", label: "7 pm", available: true },
  { time: "19:30", label: "7:30 pm", available: false },
  { time: "20:00", label: "8 pm", available: true },
  { time: "20:30", label: "8:30 pm", available: true },
  { time: "21:00", label: "9 pm", available: true },
  { time: "21:30", label: "9:30 pm", available: false },
]

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d)
}

function RestaurantBookingSheet({ onBack }: { onBack: () => void }) {
  const { addRequest } = useArden()
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [time, setTime] = React.useState<string | null>(null)
  const [guests, setGuests] = React.useState(2)
  const [note, setNote] = React.useState("")
  const [confirmed, setConfirmed] = React.useState(false)

  /* Simple inline month calendar */
  const today = React.useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [viewMonth, setViewMonth] = React.useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const daysInMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0,
  ).getDate()
  const firstDow = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth(),
    1,
  ).getDay()

  const monthLabel = viewMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })

  const prevMonth = () =>
    setViewMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
    )
  const nextMonth = () =>
    setViewMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
    )

  const canBook = date && time

  const book = () => {
    if (!date || !time) return
    const slot = dinnerSlots.find((s) => s.time === time)
    addRequest({
      service: "reception",
      note: `Restaurant · ${fmtDate(date)}, ${slot?.label ?? time}, ${guests} ${guests === 1 ? "guest" : "guests"}${note ? " — " + note : ""}`,
    })
    setConfirmed(true)
    setTimeout(() => {
      setConfirmed(false)
      onBack()
    }, 2200)
  }

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl px-5 pt-[calc(84px+env(safe-area-inset-top))] pb-10 sm:px-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-sans text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Concierge
      </button>

      <SectionHead
        kicker="The Restaurant"
        title={
          <>
            A table,
            <br />
            <span className="italic font-light text-ink-soft">when you need it.</span>
          </>
        }
        subtitle="Choose an evening, party size, and any dining notes."
      />
      <GoldRule />

      {/* ─── Hero image ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        className="mt-7 overflow-hidden rounded-[18px] ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--ink)_6%,transparent)]"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/rebrand/restaurant-lounge.png"
            alt={`The Restaurant at ${hotel.name}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
          <div className="glass-card absolute left-4 bottom-4 rounded-[14px] px-3.5 py-2">
            <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-muted">
             Bar & Dining
            </div>
            <div className="mt-0.5 font-serif text-[14.5px] text-ink">
              Dinner service · 6 pm – 10 pm
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Date picker ─── */}
      <div className="mt-8">
        <div className="mb-3 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
          Choose a date
        </div>

        <div className="rounded-[18px] glass-soft p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:text-ink transition-colors"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <span className="font-serif text-[16px] text-ink">{monthLabel}</span>
            <button
              type="button"
              onClick={nextMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:text-ink transition-colors"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="text-center font-sans text-[10px] uppercase tracking-[0.18em] text-ink-muted py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank cells before the 1st */}
            {Array.from({ length: firstDow }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const d = new Date(
                viewMonth.getFullYear(),
                viewMonth.getMonth(),
                day,
              )
              const isPast = d < today
              const isSelected =
                date &&
                d.getFullYear() === date.getFullYear() &&
                d.getMonth() === date.getMonth() &&
                d.getDate() === date.getDate()
              const isToday =
                d.getFullYear() === today.getFullYear() &&
                d.getMonth() === today.getMonth() &&
                d.getDate() === today.getDate()

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => setDate(d)}
                  className={cn(
                    "relative aspect-square flex items-center justify-center rounded-full font-sans text-[13px] tabular-nums transition-all duration-300",
                    isPast
                      ? "text-ink-muted/40 cursor-not-allowed"
                      : isSelected
                        ? "bg-ink text-cream"
                        : isToday
                          ? "ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--gold)_50%,transparent)] text-ink hover:bg-[color:color-mix(in_oklch,var(--gold)_10%,var(--cream))]"
                          : "text-ink-soft hover:text-ink hover:bg-[color:color-mix(in_oklch,var(--ink)_4%,var(--cream))]",
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {date && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
            className="mt-3 flex items-center gap-2"
          >
            <CalendarDays className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
            <span className="font-serif text-[14px] text-ink">{fmtDate(date)}</span>
          </motion.div>
        )}
      </div>

      {/* ─── Time slots ─── */}
      <div className="mt-8">
        <div className="mb-3 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
          Choose a time
        </div>
        <div className="flex flex-wrap gap-2">
          {dinnerSlots.map((slot) => {
            const active = time === slot.time
            return (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => setTime(slot.time)}
                className={cn(
                  "rounded-full px-4 py-2 font-sans text-[13px] tabular-nums ring-1 ring-inset transition-all duration-300",
                  !slot.available
                    ? "bg-[color:color-mix(in_oklch,var(--ink)_5%,var(--cream))] text-ink-muted/40 ring-[color:color-mix(in_oklch,var(--ink)_6%,transparent)] line-through cursor-not-allowed"
                    : active
                      ? "bg-ink text-cream ring-ink"
                      : "bg-cream text-ink-soft ring-[color:color-mix(in_oklch,var(--ink)_10%,transparent)] hover:text-ink",
                )}
              >
                {slot.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Guest count ─── */}
      <div className="mt-8">
        <div className="mb-3 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
          Guests
        </div>
        <div className="inline-flex items-center gap-4 rounded-[16px] glass-soft px-4 py-2.5">
          <button
            type="button"
            disabled={guests <= 1}
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <span className="min-w-[2ch] text-center font-serif text-[20px] tabular-nums text-ink">
            {guests}
          </span>
          <button
            type="button"
            disabled={guests >= 12}
            onClick={() => setGuests((g) => Math.min(12, g + 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ─── Optional note ─── */}
      <div className="mt-8">
        <label className="block">
          <span className="font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
            Anything we should know?
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Window table, birthday, dietary needs…"
            className="mt-2 w-full rounded-[18px] glass-soft p-4 font-serif text-[16px] leading-relaxed text-ink placeholder:text-ink-muted/60 focus:outline-none"
          />
        </label>
      </div>

      {/* ─── Summary + confirm ─── */}
      {canBook && !confirmed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8 rounded-[18px] glass-card p-5"
        >
          <div className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted mb-3">
            Your reservation
          </div>
          <dl className="grid grid-cols-3 gap-y-3 gap-x-4">
            <div>
              <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Date</dt>
              <dd className="mt-0.5 font-serif text-[14px] text-ink">{fmtDate(date!)}</dd>
            </div>
            <div>
              <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Time</dt>
              <dd className="mt-0.5 font-serif text-[14px] text-ink">
                {dinnerSlots.find((s) => s.time === time)?.label}
              </dd>
            </div>
            <div>
              <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Guests</dt>
              <dd className="mt-0.5 font-serif text-[14px] text-ink">{guests}</dd>
            </div>
          </dl>
        </motion.div>
      )}

      <div className="mt-8">
        <PrimaryButton onClick={book} disabled={!canBook || confirmed}>
          {confirmed ? (
            <>
              <Check className="h-4 w-4" strokeWidth={1.5} />
              Table reserved
            </>
          ) : (
            <>
              {canBook ? "Confirm reservation" : "Choose a date and time"}
              {!confirmed && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
            </>
          )}
        </PrimaryButton>
      </div>

      <p className="mt-4 font-serif italic text-[12.5px] text-ink-muted">
        {hotel.conciergeName} will confirm your table within moments.
      </p>
    </motion.section>
  )
}

/* ——— Salons sheet ———
   The Salons is a composite space — five layered environments within one
   public floor. Tapping its card brings the guest here, where each salon
   is given its own short editorial card. No booking required; the
   concierge handles access in person. */
function SalonsSheet({ onBack }: { onBack: () => void }) {
  const salons = spaces.find((s) => s.id === "salons")
  if (!salons || !salons.subSalons) return null

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl px-5 pt-[calc(84px+env(safe-area-inset-top))] pb-24 sm:px-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-sans text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Concierge
      </button>

      <SectionHead
        kicker="The Salons"
        title={
          <>
            Privacy,
            <br />
            <span className="italic font-light text-ink-soft">in five keys.</span>
          </>
        }
        subtitle={salons.description}
      />
      <GoldRule />

      {/* Cover image, held in a soft rounded frame. */}
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        className="mt-7 overflow-hidden rounded-[18px] ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--ink)_6%,transparent)]"
      >
        <div className="relative aspect-[16/10] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={salons.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-ink/25 to-transparent" />
          <div className="glass-card absolute left-4 bottom-4 rounded-[14px] px-3.5 py-2">
            <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              Right now
            </div>
            <div className="mt-0.5 font-serif text-[14.5px] text-ink tabular-nums">
              {salons.current} of {salons.capacity} seated
            </div>
          </div>
        </div>
      </motion.div>

      <ul className="mt-8 flex flex-col gap-3">
        {salons.subSalons.map((sub, i) => (
          <motion.li
            key={sub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 + i * 0.07, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Card className="p-5">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_oklch,var(--gold)_14%,var(--cream))] font-sans text-[11px] tabular-nums text-gold-deep"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-[18px] leading-tight text-ink">
                    {sub.name}
                  </div>
                  <div className="mt-1 font-serif italic text-[13.5px] leading-snug text-ink-soft">
                    {sub.hint}
                  </div>
                </div>
              </div>
            </Card>
          </motion.li>
        ))}
      </ul>

      <p className="mt-8 font-serif italic text-[13.5px] text-ink-muted leading-relaxed">
        {hotel.conciergeName} handles access in person. Let reception know the
        room you have in mind, and we will open the right threshold for you.
      </p>
    </motion.section>
  )
}

/* ——— Retreat booking sheet ———
   A spa/wellness booking flow where the guest chooses from retreat
   experiences (massage, pool, cold plunge, sauna), picks a date and
   time, then confirms. */

type RetreatExperienceId = "massage" | "pool" | "cold-plunge" | "sauna"

const retreatExperiences: {
  id: RetreatExperienceId
  name: string
  hint: string
  duration: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  image: string
}[] = [
  {
    id: "massage",
    name: "Massage",
    hint: "Choose from deep tissue, aromatherapy, or hot stone. Fifty minutes of quiet restoration.",
    duration: "50 min",
    icon: Leaf,
    image: "/images/rebrand/spa-recovery.png",
  },
  {
    id: "pool",
    name: "Heated Pool",
    hint: "A private lane in warmed mineral water, lit from below. Swim or float.",
    duration: "60 min",
    icon: Waves,
    image: "/images/rebrand/spa-recovery.png",
  },
  {
    id: "cold-plunge",
    name: "Cold Plunge",
    hint: "Eight degrees. Two minutes of stillness. A sharp clarity follows.",
    duration: "30 min session",
    icon: Snowflake,
    image: "/images/rebrand/spa-recovery.png",
  },
  {
    id: "sauna",
    name: "Cedar Sauna",
    hint: "Dry heat in a cedar-lined room. Towels, water, silence.",
    duration: "45 min",
    icon: Flame,
    image: "/images/rebrand/spa-recovery.png",
  },
]

const retreatTimeSlots = [
  { time: "08:00", label: "8 am", available: true },
  { time: "09:00", label: "9 am", available: true },
  { time: "10:00", label: "10 am", available: false },
  { time: "11:00", label: "11 am", available: true },
  { time: "12:00", label: "12 pm", available: true },
  { time: "14:00", label: "2 pm", available: true },
  { time: "15:00", label: "3 pm", available: true },
  { time: "16:00", label: "4 pm", available: false },
  { time: "17:00", label: "5 pm", available: true },
  { time: "18:00", label: "6 pm", available: true },
]

type MassageTypeId = "deep-tissue" | "aromatherapy" | "hot-stone"

const massageTypes: {
  id: MassageTypeId
  name: string
  hint: string
  duration: string
}[] = [
  {
    id: "deep-tissue",
    name: "Deep Tissue",
    hint: "Firm, focused pressure on shoulders, neck, and lower back. Ideal after travel.",
    duration: "50 min",
  },
  {
    id: "aromatherapy",
    name: "Aromatherapy",
    hint: "Warm oils and long, rhythmic strokes. Calming, restorative, good for easing into sleep.",
    duration: "55 min",
  },
  {
    id: "hot-stone",
    name: "Hot Stone",
    hint: "Heated basalt stones placed along the spine and shoulders. Deep warmth, slow release.",
    duration: "60 min",
  },
]

function RetreatBookingSheet({ onBack, onOpenMassage }: { onBack: () => void; onOpenMassage: () => void }) {
  const { addRequest } = useArden()
  const retreat = spaces.find((s) => s.id === "retreat")!

  const [selectedExperience, setSelectedExperience] = React.useState<RetreatExperienceId | null>(null)
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [time, setTime] = React.useState<string | null>(null)
  const [note, setNote] = React.useState("")
  const [confirmed, setConfirmed] = React.useState(false)

  /* Calendar state */
  const today = React.useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [viewMonth, setViewMonth] = React.useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const daysInMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0,
  ).getDate()
  const firstDow = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth(),
    1,
  ).getDay()

  const monthLabel = viewMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })

  const prevMonth = () =>
    setViewMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
    )
  const nextMonth = () =>
    setViewMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
    )

  const experience = retreatExperiences.find((e) => e.id === selectedExperience)
  const canBook = selectedExperience && date && time

  const book = () => {
    if (!experience || !date || !time) return
    const slot = retreatTimeSlots.find((s) => s.time === time)
    addRequest({
      service: "spa",
      note: `The Retreat · ${experience.name}, ${fmtDate(date)}, ${slot?.label ?? time}${note ? " — " + note : ""}`,
    })
    setConfirmed(true)
    setTimeout(() => {
      setConfirmed(false)
      onBack()
    }, 2200)
  }

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl px-5 pt-[calc(84px+env(safe-area-inset-top))] pb-10 sm:px-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-sans text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Concierge
      </button>

      <SectionHead
        kicker="The Retreat"
        title={
          <>
            Recovery,
            <br />
            <span className="italic font-light text-ink-soft">when you have time.</span>
          </>
        }
        subtitle="Book massage, sauna, cold plunge, or pool time around your schedule."
      />
      <GoldRule />

      {/* ─── Hero image ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        className="mt-7 overflow-hidden rounded-[18px] ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--ink)_6%,transparent)]"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/rebrand/spa-recovery.png"
            alt={`The Recovery Floor at ${hotel.name}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
          <div className="glass-card absolute left-4 bottom-4 rounded-[14px] px-3.5 py-2">
            <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              Right now
            </div>
            <div className="mt-0.5 font-serif text-[14.5px] text-ink tabular-nums">
              {retreat.current} of {retreat.capacity} guests
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Experience selection ─── */}
      <div className="mt-8">
        <div className="mb-3 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
          Choose an experience
        </div>
        <div className="flex flex-col gap-2.5">
          {retreatExperiences.map((exp, i) => {
            const Icon = exp.icon
            const isActive = selectedExperience === exp.id
            const isMassage = exp.id === "massage"
            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 + i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <Card
                  interactive
                  onClick={() => {
                    if (isMassage) {
                      onOpenMassage()
                    } else {
                      setSelectedExperience(exp.id)
                    }
                  }}
                  className={cn(
                    "overflow-hidden ring-1 ring-inset transition-all",
                    isActive
                      ? "ring-[color:color-mix(in_oklch,var(--gold)_60%,transparent)]"
                      : "ring-transparent",
                  )}
                >
                  <div className="flex items-stretch">
                    <div className="relative w-24 shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={exp.image}
                        alt={exp.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/10" />
                      <span
                        className={cn(
                          "absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                          isActive
                            ? "bg-[color:color-mix(in_oklch,var(--gold)_30%,var(--cream))] text-gold-deep"
                            : "glass-card text-ink-muted",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </span>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-serif text-[16px] leading-tight text-ink">
                          {exp.name}
                        </div>
                        <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink-muted shrink-0">
                          {exp.duration}
                        </span>
                      </div>
                      <div className="mt-1 font-serif italic text-[13px] leading-snug text-ink-soft">
                        {exp.hint}
                      </div>
                      {isMassage && (
                        <div className="mt-2 inline-flex items-center gap-1 font-sans text-[11px] text-gold-deep">
                          Choose type
                          <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ─── Date picker ─── */}
      {selectedExperience && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8"
        >
          <div className="mb-3 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
            Choose a date
          </div>

          <div className="rounded-[18px] glass-soft p-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:text-ink transition-colors"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <span className="font-serif text-[16px] text-ink">{monthLabel}</span>
              <button
                type="button"
                onClick={nextMonth}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:text-ink transition-colors"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div
                  key={d}
                  className="text-center font-sans text-[10px] uppercase tracking-[0.18em] text-ink-muted py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDow }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const d = new Date(
                  viewMonth.getFullYear(),
                  viewMonth.getMonth(),
                  day,
                )
                const isPast = d < today
                const isSelected =
                  date &&
                  d.getFullYear() === date.getFullYear() &&
                  d.getMonth() === date.getMonth() &&
                  d.getDate() === date.getDate()
                const isToday =
                  d.getFullYear() === today.getFullYear() &&
                  d.getMonth() === today.getMonth() &&
                  d.getDate() === today.getDate()

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isPast}
                    onClick={() => setDate(d)}
                    className={cn(
                      "relative aspect-square flex items-center justify-center rounded-full font-sans text-[13px] tabular-nums transition-all duration-300",
                      isPast
                        ? "text-ink-muted/40 cursor-not-allowed"
                        : isSelected
                          ? "bg-ink text-cream"
                          : isToday
                            ? "ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--gold)_50%,transparent)] text-ink hover:bg-[color:color-mix(in_oklch,var(--gold)_10%,var(--cream))]"
                            : "text-ink-soft hover:text-ink hover:bg-[color:color-mix(in_oklch,var(--ink)_4%,var(--cream))]",
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {date && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
              className="mt-3 flex items-center gap-2"
            >
              <CalendarDays className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
              <span className="font-serif text-[14px] text-ink">{fmtDate(date)}</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ─── Time slots ─── */}
      {selectedExperience && date && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8"
        >
          <div className="mb-3 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
            Choose a time
          </div>
          <div className="flex flex-wrap gap-2">
            {retreatTimeSlots.map((slot) => {
              const active = time === slot.time
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setTime(slot.time)}
                  className={cn(
                    "rounded-full px-4 py-2 font-sans text-[13px] tabular-nums ring-1 ring-inset transition-all duration-300",
                    !slot.available
                      ? "bg-[color:color-mix(in_oklch,var(--ink)_5%,var(--cream))] text-ink-muted/40 ring-[color:color-mix(in_oklch,var(--ink)_6%,transparent)] line-through cursor-not-allowed"
                      : active
                        ? "bg-ink text-cream ring-ink"
                        : "bg-cream text-ink-soft ring-[color:color-mix(in_oklch,var(--ink)_10%,transparent)] hover:text-ink",
                  )}
                >
                  {slot.label}
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ─── Optional note ─── */}
      {selectedExperience && date && time && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8"
        >
          <label className="block">
            <span className="font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
              Anything we should know?
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Pressure preference, injury to note, quiet room preferred..."
              className="mt-2 w-full rounded-[18px] glass-soft p-4 font-serif text-[16px] leading-relaxed text-ink placeholder:text-ink-muted/60 focus:outline-none"
            />
          </label>
        </motion.div>
      )}

      {/* ─── Summary + confirm ─── */}
      {canBook && !confirmed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8 rounded-[18px] glass-card p-5"
        >
          <div className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted mb-3">
            Your session
          </div>
          <dl className="grid grid-cols-3 gap-y-3 gap-x-4">
            <div>
              <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Experience</dt>
              <dd className="mt-0.5 font-serif text-[14px] text-ink">{experience?.name}</dd>
            </div>
            <div>
              <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Date</dt>
              <dd className="mt-0.5 font-serif text-[14px] text-ink">{fmtDate(date!)}</dd>
            </div>
            <div>
              <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Time</dt>
              <dd className="mt-0.5 font-serif text-[14px] text-ink">
                {retreatTimeSlots.find((s) => s.time === time)?.label}
              </dd>
            </div>
          </dl>
        </motion.div>
      )}

      <div className="mt-8">
        <PrimaryButton onClick={book} disabled={!canBook || confirmed}>
          {confirmed ? (
            <>
              <Check className="h-4 w-4" strokeWidth={1.5} />
              Session booked
            </>
          ) : (
            <>
              {canBook ? "Confirm session" : "Choose experience, date & time"}
              {!confirmed && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
            </>
          )}
        </PrimaryButton>
      </div>

      <p className="mt-4 font-serif italic text-[12.5px] text-ink-muted">
        {hotel.conciergeName} will confirm your session within moments. Arrive five minutes early; robes and towels are provided.
      </p>
    </motion.section>
  )
}

/* ——— Massage booking sheet ———
   A dedicated screen reached from the Retreat. The guest picks a massage
   type, a date, and a time, then confirms. */
function MassageBookingSheet({ onBack, onConfirm }: { onBack: () => void; onConfirm: () => void }) {
  const { addRequest } = useArden()

  const [selectedType, setSelectedType] = React.useState<MassageTypeId | null>(null)
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [time, setTime] = React.useState<string | null>(null)
  const [note, setNote] = React.useState("")
  const [confirmed, setConfirmed] = React.useState(false)

  const today = React.useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [viewMonth, setViewMonth] = React.useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const daysInMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0,
  ).getDate()
  const firstDow = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth(),
    1,
  ).getDay()

  const monthLabel = viewMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })

  const prevMonth = () =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  const nextMonth = () =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))

  const mt = massageTypes.find((m) => m.id === selectedType)
  const canBook = selectedType && date && time

  const book = () => {
    if (!mt || !date || !time) return
    const slot = retreatTimeSlots.find((s) => s.time === time)
    addRequest({
      service: "spa",
      note: `The Retreat · ${mt.name} Massage, ${fmtDate(date)}, ${slot?.label ?? time}${note ? " — " + note : ""}`,
    })
    setConfirmed(true)
    setTimeout(() => {
      setConfirmed(false)
      onConfirm()
    }, 1800)
  }

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl pb-10"
    >
      {/* ─── Full-width hero with text overlay ─── */}
      <div className="relative w-full">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/rebrand/spa-recovery.png"
            alt="Massage at The Retreat"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/30 to-ink/10" />
        </div>
        {/* Back button overlaid on image */}
        <button
          type="button"
          onClick={onBack}
          className="absolute top-[calc(env(safe-area-inset-top)+84px+8px)] left-5 sm:left-8 inline-flex items-center gap-2 text-sm font-sans text-cream/80 hover:text-cream transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          The Retreat
        </button>
        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 sm:px-8">
        
          <h2 className="mt-2 font-serif text-[28px] leading-[1.1] text-cream">
            Restoration<br />
            <span className="italic font-light text-cream/80">with water and sound.</span>
          </h2>
         
        </div>
      </div>

      <div className="px-5 sm:px-8 pt-6">
      <div className="mt-8">
        <div className="mb-3 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
          Choose your massage
        </div>
        <div className="flex flex-col gap-2.5">
          {massageTypes.map((massage, i) => {
            const isActive = selectedType === massage.id
            return (
              <motion.div
                key={massage.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 + i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <Card
                  interactive
                  onClick={() => setSelectedType(massage.id)}
                  className={cn(
                    "p-4 ring-1 ring-inset transition-all",
                    isActive
                      ? "ring-[color:color-mix(in_oklch,var(--gold)_60%,transparent)]"
                      : "ring-transparent",
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
                        isActive
                          ? "bg-ink text-cream"
                          : "bg-[color:color-mix(in_oklch,var(--ink)_5%,var(--cream))] text-ink-muted",
                      )}
                    >
                      {isActive ? (
                        <Check className="h-4 w-4" strokeWidth={1.5} />
                      ) : (
                        <Leaf className="h-4 w-4" strokeWidth={1.5} />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-serif text-[16px] leading-tight text-ink">
                          {massage.name}
                        </div>
                        <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink-muted shrink-0">
                          {massage.duration}
                        </span>
                      </div>
                      <div className="mt-1 font-serif italic text-[13px] leading-snug text-ink-soft">
                        {massage.hint}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ─── Date picker ─── */}
      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8"
        >
          <div className="mb-3 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
            Choose a date
          </div>

          <div className="rounded-[18px] glass-soft p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:text-ink transition-colors"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <span className="font-serif text-[16px] text-ink">{monthLabel}</span>
              <button
                type="button"
                onClick={nextMonth}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:text-ink transition-colors"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div
                  key={d}
                  className="text-center font-sans text-[10px] uppercase tracking-[0.18em] text-ink-muted py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDow }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day)
                const isPast = d < today
                const isSelected =
                  date &&
                  d.getFullYear() === date.getFullYear() &&
                  d.getMonth() === date.getMonth() &&
                  d.getDate() === date.getDate()
                const isToday =
                  d.getFullYear() === today.getFullYear() &&
                  d.getMonth() === today.getMonth() &&
                  d.getDate() === today.getDate()

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isPast}
                    onClick={() => setDate(d)}
                    className={cn(
                      "relative aspect-square flex items-center justify-center rounded-full font-sans text-[13px] tabular-nums transition-all duration-300",
                      isPast
                        ? "text-ink-muted/40 cursor-not-allowed"
                        : isSelected
                          ? "bg-ink text-cream"
                          : isToday
                            ? "ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--gold)_50%,transparent)] text-ink hover:bg-[color:color-mix(in_oklch,var(--gold)_10%,var(--cream))]"
                            : "text-ink-soft hover:text-ink hover:bg-[color:color-mix(in_oklch,var(--ink)_4%,var(--cream))]",
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {date && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
              className="mt-3 flex items-center gap-2"
            >
              <CalendarDays className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
              <span className="font-serif text-[14px] text-ink">{fmtDate(date)}</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ─── Time slots ─── */}
      {selectedType && date && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8"
        >
          <div className="mb-3 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
            Choose a time
          </div>
          <div className="flex flex-wrap gap-2">
            {retreatTimeSlots.map((slot) => {
              const active = time === slot.time
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setTime(slot.time)}
                  className={cn(
                    "rounded-full px-4 py-2 font-sans text-[13px] tabular-nums ring-1 ring-inset transition-all duration-300",
                    !slot.available
                      ? "bg-[color:color-mix(in_oklch,var(--ink)_5%,var(--cream))] text-ink-muted/40 ring-[color:color-mix(in_oklch,var(--ink)_6%,transparent)] line-through cursor-not-allowed"
                      : active
                        ? "bg-ink text-cream ring-ink"
                        : "bg-cream text-ink-soft ring-[color:color-mix(in_oklch,var(--ink)_10%,transparent)] hover:text-ink",
                  )}
                >
                  {slot.label}
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ─── Optional note ─── */}
      {selectedType && date && time && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8"
        >
          <label className="block">
            <span className="font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
              Anything we should know?
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Pressure preference, injury to note, quiet room preferred..."
              className="mt-2 w-full rounded-[18px] glass-soft p-4 font-serif text-[16px] leading-relaxed text-ink placeholder:text-ink-muted/60 focus:outline-none"
            />
          </label>
        </motion.div>
      )}

      {/* ─── Summary + confirm ─── */}
      {canBook && !confirmed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8 rounded-[18px] glass-card p-5"
        >
          <div className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted mb-3">
            Your massage
          </div>
          <dl className="grid grid-cols-3 gap-y-3 gap-x-4">
            <div>
              <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Type</dt>
              <dd className="mt-0.5 font-serif text-[14px] text-ink">{mt?.name}</dd>
            </div>
            <div>
              <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Date</dt>
              <dd className="mt-0.5 font-serif text-[14px] text-ink">{fmtDate(date!)}</dd>
            </div>
            <div>
              <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Time</dt>
              <dd className="mt-0.5 font-serif text-[14px] text-ink">
                {retreatTimeSlots.find((s) => s.time === time)?.label}
              </dd>
            </div>
          </dl>
        </motion.div>
      )}

      <div className="mt-8">
        <PrimaryButton onClick={book} disabled={!canBook || confirmed}>
          {confirmed ? (
            <>
              <Check className="h-4 w-4" strokeWidth={1.5} />
              Massage booked
            </>
          ) : (
            <>
              {canBook ? "Confirm massage" : "Choose type, date & time"}
              {!confirmed && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
            </>
          )}
        </PrimaryButton>
      </div>

      <p className="mt-4 font-serif italic text-[12.5px] text-ink-muted">
        {hotel.conciergeName} will confirm within moments. Arrive five minutes early; robes and towels are provided.
      </p>
      </div>
    </motion.section>
  )
}

/* ——— Bookings overview sheet ———
   Shows the guest’s upcoming reservations: the just-booked massage and
   a pre-existing dinner reservation. A confirmation + summary view. */
function BookingsOverviewSheet({ onBack }: { onBack: () => void }) {
  const { requests } = useArden()

  // Find the most recent spa request (the massage just booked)
  const latestSpa = [...requests].reverse().find((r) => r.service === "spa")

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto w-full max-w-xl px-5 pt-[calc(84px+env(safe-area-inset-top))] pb-10 sm:px-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-sans text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Concierge
      </button>

      <SectionHead
        kicker="Your bookings"
        title={
          <>
            Everything’s arranged,
            <br />
            <span className="italic font-light text-ink-soft">{guest.title} {guest.lastName}.</span>
          </>
        }
        subtitle="Your upcoming reservations at a glance. We’ll remind you closer to the time."
      />
      <GoldRule />

      {/* Confirmed massage */}
      {latestSpa && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-7"
        >
          <Card className="overflow-hidden">
            <div className="flex items-stretch">
              <div className="relative w-24 shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/rebrand/spa-recovery.png"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/10" />
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-gold animate-pulse" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold-deep">
                    Just booked
                  </span>
                </div>
                <div className="mt-2 font-serif text-[16px] leading-tight text-ink">
                  Massage
                </div>
                <div className="mt-1 font-serif italic text-[13px] leading-snug text-ink-soft line-clamp-2">
                  {latestSpa.note.replace("The Retreat · ", "")}
                </div>
                <div className="mt-2 font-sans text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  The Retreat
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Pre-existing dinner reservation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
        className="mt-3"
      >
        <Card className="overflow-hidden">
          <div className="flex items-stretch">
            <div className="relative w-24 shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/rebrand/restaurant-lounge.png"
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/10" />
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-[color:color-mix(in_oklch,var(--gold)_60%,var(--cream))]" />
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                  Confirmed
                </span>
              </div>
              <div className="mt-2 font-serif text-[16px] leading-tight text-ink">
                Dinner for two
              </div>
              <div className="mt-1 font-serif italic text-[13px] leading-snug text-ink-soft">
                Friday 7 pm · Window table
              </div>
              <div className="mt-2 font-sans text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                The Restaurant
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stay summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        className="mt-8 rounded-[18px] glass-soft p-5"
      >
        <div className="font-sans text-[10px] tracking-[0.24em] uppercase text-ink-muted mb-3">
          Your stay
        </div>
        <dl className="grid grid-cols-2 gap-y-4 gap-x-6">
          <div>
            <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Check-in</dt>
            <dd className="mt-0.5 font-serif text-[15px] text-ink">Monday, 5 May</dd>
          </div>
          <div>
            <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Check-out</dt>
            <dd className="mt-0.5 font-serif text-[15px] text-ink">Friday, 9 May</dd>
          </div>
          <div>
            <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Room</dt>
            <dd className="mt-0.5 font-serif text-[15px] text-ink">Guest Room 21</dd>
          </div>
          <div>
            <dt className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink-muted">Nights</dt>
            <dd className="mt-0.5 font-serif text-[15px] text-ink">4</dd>
          </div>
        </dl>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        className="mt-6 font-serif italic text-[13.5px] text-ink-muted leading-relaxed"
      >
        {hotel.conciergeName} has everything in hand. If anything changes, just let us know.
      </motion.p>
    </motion.section>
  )
}
