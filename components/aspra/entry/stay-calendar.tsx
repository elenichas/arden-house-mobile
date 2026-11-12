"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { SEASON, addDays, formatDate, isSoldNight, nightsBetween, stayIsFree, type SuiteId } from "../data"

const MIN_NIGHTS = 2
const MAX_NIGHTS = 14
const CALM_MONTHS = new Set(["06", "09"])
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const monthOf = (iso: string) => iso.slice(0, 7)
const shiftMonth = (ym: string, by: number) => {
  const [y, m] = ym.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1 + by, 1)).toISOString().slice(0, 7)
}

/** The longest free stay from an arrival day, up to the nights the guest already wanted. */
function nightsFrom(checkIn: string, wanted: number, suiteId: SuiteId) {
  for (let n = Math.min(Math.max(wanted, MIN_NIGHTS), MAX_NIGHTS); n >= MIN_NIGHTS; n--) {
    if (stayIsFree(checkIn, addDays(checkIn, n), suiteId)) return n
  }
  return 0
}

/**
 * A month calendar for picking arrival and departure.
 * Tap a day to arrive, then a later day to leave. Nights with no free suite are struck through.
 */
export function StayCalendar({
  checkIn,
  checkOut,
  suiteId,
  onChange,
}: {
  checkIn: string
  checkOut: string
  suiteId: SuiteId
  onChange: (checkIn: string, checkOut: string) => void
}) {
  const [month, setMonth] = React.useState(monthOf(checkIn))
  /** Set after the guest taps an arrival day, until they tap the day they leave. */
  const [pendingIn, setPendingIn] = React.useState<string | null>(null)

  const [y, m] = month.split("-").map(Number)
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7
  const cells: Array<string | null> = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ]
  const nights = nightsBetween(checkIn, checkOut)
  const title = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })

  const canArrive = (iso: string) => nightsFrom(iso, MIN_NIGHTS, suiteId) > 0
  const canLeave = (iso: string) => {
    if (!pendingIn || iso <= pendingIn) return false
    const n = nightsBetween(pendingIn, iso)
    return n >= MIN_NIGHTS && n <= MAX_NIGHTS && stayIsFree(pendingIn, iso, suiteId)
  }

  function pick(iso: string) {
    if (canLeave(iso) && pendingIn) {
      onChange(pendingIn, iso)
      setPendingIn(null)
      return
    }
    const n = nightsFrom(iso, nights, suiteId)
    if (n === 0) return
    setPendingIn(iso)
    onChange(iso, addDays(iso, n))
  }

  const fmt = (iso: string) => formatDate(iso, { weekday: "short", day: "numeric", month: "short" })

  return (
    <div className="rounded-2xl glass p-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          disabled={month <= monthOf(SEASON.first)}
          onClick={() => setMonth((v) => shiftMonth(v, -1))}
          className="grid size-11 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <div className="text-center">
          <div className="text-[16px] font-semibold" aria-live="polite">{title}</div>
          <div className={cn("text-[12.5px]", CALM_MONTHS.has(month.slice(5)) ? "font-medium text-sea-deep" : "text-ink-3")}>
            {CALM_MONTHS.has(month.slice(5)) ? "Calm sea this month" : month.slice(5) === "07" || month.slice(5) === "08" ? "Meltemi wind likely" : "Quiet season"}
          </div>
        </div>
        <button
          type="button"
          aria-label="Next month"
          disabled={month >= monthOf(SEASON.last)}
          onClick={() => setMonth((v) => shiftMonth(v, 1))}
          className="grid size-11 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 text-center text-[12px] text-ink-3" aria-hidden>
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((iso, i) => {
          if (!iso) return <span key={`blank-${i}`} />
          const inSeason = iso >= SEASON.first && iso <= SEASON.last
          const sold = inSeason && isSoldNight(iso, suiteId)
          const isIn = iso === checkIn
          const isOut = iso === checkOut
          const inRange = iso > checkIn && iso < checkOut
          const enabled = inSeason && (canLeave(iso) || canArrive(iso))
          const state = isIn ? "arrival" : isOut ? "departure" : inRange ? "during your stay" : sold ? "no suite free" : !inSeason ? "hotel closed" : ""
          return (
            <div
              key={iso}
              className={cn(
                "relative",
                (inRange || (isOut && !pendingIn)) && "bg-sea-wash",
                isIn && nights > 0 && "rounded-l-full bg-sea-wash",
                isOut && "rounded-r-full",
              )}
            >
              <button
                type="button"
                disabled={!enabled}
                aria-pressed={isIn || isOut}
                aria-label={`${formatDate(iso, { weekday: "long", day: "numeric", month: "long" })}${state ? `, ${state}` : ""}`}
                onClick={() => pick(iso)}
                className={cn(
                  "mx-auto grid h-11 w-full max-w-11 place-items-center rounded-full text-[15px] tabular-nums transition-colors",
                  isIn || isOut ? "bg-sea font-semibold text-white" : enabled ? "text-ink hover:bg-ink/10" : "text-ink-3/70",
                  sold && !isOut && "line-through",
                )}
              >
                {Number(iso.slice(8))}
              </button>
            </div>
          )
        })}
      </div>

      <p className="mt-3 px-1 text-[14px] leading-snug text-ink-2" aria-live="polite">
        {pendingIn ? (
          <>
            Arriving <strong className="font-semibold text-ink">{fmt(checkIn)}</strong>. Now tap the day you leave, or keep {nights} nights.
          </>
        ) : (
          <>
            <strong className="font-semibold text-ink">{fmt(checkIn)}</strong> to <strong className="font-semibold text-ink">{fmt(checkOut)}</strong>, {nights} nights. Tap a day to change your arrival.
          </>
        )}
      </p>
      <p className="mt-1 px-1 text-[13px] text-ink-3">
        <span className="line-through">12</span> means no suite of this kind is free that night.
      </p>
    </div>
  )
}
