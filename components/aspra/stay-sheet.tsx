"use client"

import * as React from "react"
import { Box, SlidersHorizontal } from "lucide-react"
import { useAspra } from "./store"
import { bookingTotal, euro, extraById, formatDate, planCost, suiteById, type ExtraId } from "./data"
import { Button, Sheet } from "./ui"
import { ExtrasPicker } from "./shared"

/** One place for the booking itself: dates, cost, extras and how the suite is set up. */
export function StaySheet() {
  const store = useAspra()
  const { booking, plan, phase } = store
  if (!booking) return null

  const s = suiteById(booking.suiteId)
  const t = bookingTotal(booking)
  const experiences = planCost(plan, booking)
  const toggleExtra = (id: ExtraId) =>
    store.setBooking({
      ...booking,
      extras: booking.extras.includes(id) ? booking.extras.filter((x) => x !== id) : [...booking.extras, id],
    })
  const close = () => store.setStayOpen(false)

  return (
    <Sheet open={store.stayOpen} onClose={close} title="Your stay">
      <p className="text-[15px] leading-relaxed text-ink-2">
        {s.name}, {formatDate(booking.checkIn, { weekday: "short", day: "numeric", month: "long" })} to{" "}
        {formatDate(booking.checkOut, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}. Reference {booking.ref}.
      </p>

      <h3 className="mb-2 mt-6 text-[16px] font-semibold">Cost so far</h3>
      <dl className="divide-y divide-border rounded-2xl glass px-4 text-[14.5px]">
        <Line label={`${t.nights} nights at ${euro(s.nightly)}`} value={euro(t.room)} />
        {t.extras > 0 && <Line label="Extras" value={euro(t.extras)} />}
        {experiences > 0 && <Line label={`Planned experiences (${plan.length})`} value={euro(experiences)} />}
        <Line label="Total" value={euro(t.total + experiences)} strong />
      </dl>
      <p className="mt-2 text-[13px] text-ink-3">Experiences are added to your suite bill. Dinner at Thalami is charged for what you order.</p>

      <h3 className="mb-2 mt-7 text-[16px] font-semibold">Your suite</h3>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="dark"
          className="flex-1"
          onClick={() => {
            close()
            store.setTourOpen(true)
          }}
        >
          <Box className="size-5 text-sulphur" aria-hidden /> Set it up in 3D
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            close()
            store.setProfileOpen(true)
          }}
        >
          <SlidersHorizontal className="size-4" aria-hidden /> Preferences
        </Button>
      </div>

      <h3 className="mb-1 mt-7 text-[16px] font-semibold">Extras</h3>
      {phase === "before" ? (
        <>
          <p className="mb-3 text-[14px] leading-snug text-ink-3">Add or remove these until 48 hours before you arrive.</p>
          <ExtrasPicker selected={booking.extras} onToggle={toggleExtra} />
        </>
      ) : (
        <>
          <p className="mb-3 text-[14px] leading-snug text-ink-3">
            {phase === "during" ? "These were set before you arrived. Ask Nefeli if you need something added." : "What you had on this stay."}
          </p>
          {booking.extras.length === 0 ? (
            <p className="rounded-2xl glass p-4 text-[14.5px] text-ink-2">No extras on this stay.</p>
          ) : (
            <ul className="divide-y divide-border rounded-2xl glass px-4 text-[14.5px]">
              {booking.extras.map((id) => {
                const x = extraById(id)
                return (
                  <li key={id} className="flex items-baseline justify-between gap-4 py-3">
                    <span>{x.name}</span>
                    <span className="tabular-nums text-ink-2">{x.price === 0 ? "Free" : euro(x.price)}</span>
                  </li>
                )
              })}
            </ul>
          )}
          {phase === "during" && (
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => {
                close()
                store.askConcierge("Can I add a late check out?")
              }}
            >
              Ask Nefeli
            </Button>
          )}
        </>
      )}
    </Sheet>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex items-baseline justify-between gap-4 py-3 text-[16px] font-semibold" : "flex items-baseline justify-between gap-4 py-3"}>
      <dt className={strong ? "" : "text-ink-2"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}
