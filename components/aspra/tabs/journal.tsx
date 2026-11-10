"use client"

import * as React from "react"
import { Check, Mail, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAspra } from "../store"
import {
  IMG,
  bookingTotal,
  dayLabel,
  euro,
  experienceById,
  formatDate,
  islandShop,
  recipe,
  suiteById,
} from "../data"
import { Button, Photo, SectionTitle } from "../ui"

export function JournalTab() {
  const { booking, pastStay, phase, plan } = useAspra()
  const [note, setNote] = React.useState("")
  const [saved, setSaved] = React.useState<string[]>([])

  const nights = booking ? bookingTotal(booking).nights : 0
  const upTo = phase === "before" ? -1 : phase === "during" ? Math.min(2, nights - 1) : nights
  const lived = booking
    ? [...plan].filter((p) => p.day <= upTo).sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))
    : []

  return (
    <div className="pb-nav">
      <div className="px-5 pt-2">
        <h1 className="font-display text-[38px]">Journal</h1>
        <p className="mt-1 text-[15px] leading-relaxed text-ink-2">
          Each evening we add your day. You can add your own notes. It stays yours after you leave.
        </p>
      </div>

      {booking && (
        <section className="mt-8 px-5">
          <SectionTitle>
            {suiteById(booking.suiteId).name}, {formatDate(booking.checkIn, { month: "long", year: "numeric" })}
          </SectionTitle>

          {phase === "before" ? (
            <div className="rounded-2xl border border-dashed border-ink/25 p-5 md:max-w-[560px]">
              <p className="text-[15px] leading-relaxed text-ink-2">
                This page fills from {formatDate(booking.checkIn, { weekday: "long", day: "numeric", month: "long" })}. Switch Today to "On Milos" or "After" to see how it looks.
              </p>
            </div>
          ) : (
            <ol className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
              <JournalEntry
                day={dayLabel(booking.checkIn, 0)}
                title="Arrived on Milos"
                note={booking.extras.includes("boat-transfer") ? "Came in by boat from Adamas, along the white cliffs of the south coast." : "Landed and drove across the island to Agia Kyriaki."}
                image={IMG.harbour}
              />
              {lived.map((p) => {
                const e = experienceById(p.experienceId)
                return <JournalEntry key={p.id} day={dayLabel(booking.checkIn, p.day)} title={e.name} note={e.short} image={e.image} />
              })}
              {saved.map((n, i) => (
                <li key={i} className="rounded-2xl glass p-4 text-[15px] leading-relaxed">
                  <div className="mb-1 text-[13px] font-medium text-sea">Your note</div>
                  {n}
                </li>
              ))}
            </ol>
          )}

          {phase !== "before" && (
            <form
              className="mt-6 md:max-w-[560px]"
              onSubmit={(e) => {
                e.preventDefault()
                if (!note.trim()) return
                setSaved((s) => [...s, note.trim()])
                setNote("")
              }}
            >
              <label htmlFor="journal-note" className="mb-2 block text-[15px] font-medium">
                Add to today
              </label>
              <textarea
                id="journal-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="The name of that wine, the taverna owner, the swim..."
                className="w-full resize-none rounded-xl glass px-4 py-3 text-[15px] placeholder:text-ink-3 focus:border-sea focus:outline-none"
              />
              <div className="mt-2 flex gap-2">
                <Button type="submit" size="sm" disabled={!note.trim()}>
                  Save note
                </Button>
              </div>
            </form>
          )}
        </section>
      )}

      {pastStay && (
        <section className="mt-12 px-5">
          <SectionTitle>
            {pastStay.suiteNumber}, {formatDate(pastStay.checkIn, { month: "long", year: "numeric" })}
          </SectionTitle>
          <ol className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
            {pastStay.moments.map((m) => (
              <JournalEntry key={m.title} day={m.day} title={m.title} note={m.note} image={m.image} />
            ))}
          </ol>
        </section>
      )}

      <div className="mt-12">
        <Keepsakes />
      </div>
    </div>
  )
}

function JournalEntry({ day, title, note, image }: { day: string; title: string; note: string; image: string }) {
  return (
    <li className="list-none">
      <Photo src={image} alt="" className="aspect-[16/10] w-full rounded-2xl" />
      <div className="mt-3 text-[13px] font-medium text-sea">{day}</div>
      <h3 className="font-display text-[24px] leading-tight">{title}</h3>
      <p className="mt-1 text-[14.5px] leading-relaxed text-ink-2">{note}</p>
    </li>
  )
}

/** What stays with the guest after the stay: a recipe, the island pantry, letters. */
export function Keepsakes() {
  const { basket, toggleBasket, notify } = useAspra()
  const [letters, setLetters] = React.useState(false)
  const [showRecipe, setShowRecipe] = React.useState(false)
  const total = islandShop.filter((i) => basket.includes(i.id)).reduce((s, i) => s + i.price, 0)

  return (
    <div className="space-y-10 lg:col-span-2 lg:grid lg:grid-cols-3 lg:items-start lg:space-y-0">
      <section className="px-5">
        <SectionTitle>Cook it at home</SectionTitle>
        <div className="rounded-2xl glass p-5">
          <p className="text-[13px] font-medium text-sea">{recipe.from}</p>
          <h3 className="mt-1 font-display text-[26px] leading-tight">{recipe.title}</h3>
          <p className="mt-1 text-[14px] text-ink-3">Serves {recipe.serves}. The dish guests ask about most.</p>
          {showRecipe ? (
            <ol className="mt-4 space-y-3">
              {recipe.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sea-wash text-[13px] font-semibold text-sea-deep">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          ) : (
            <Button size="sm" variant="outline" className="mt-4" onClick={() => setShowRecipe(true)}>
              Show the recipe
            </Button>
          )}
        </div>
      </section>

      <section className="px-5">
        <SectionTitle>The island pantry</SectionTitle>
        <p className="mb-4 text-[14.5px] leading-relaxed text-ink-2">
          Made by the people who supply our kitchen. Shipped to the EU, UK and US in 5 to 8 days.
        </p>
        <ul className="divide-y divide-border rounded-2xl glass">
          {islandShop.map((item) => {
            const on = basket.includes(item.id)
            return (
              <li key={item.id}>
                <button
                  aria-pressed={on}
                  onClick={() => toggleBasket(item.id)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-medium">{item.name}</div>
                    <div className="text-[13.5px] text-ink-3">{item.detail}</div>
                  </div>
                  <span className="text-[15px] font-medium tabular-nums">{euro(item.price)}</span>
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full border transition-colors",
                      on ? "border-sea bg-sea text-white" : "border-ink/20 text-ink",
                    )}
                    aria-hidden
                  >
                    {on ? <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <Button
          block
          size="lg"
          className="mt-4"
          disabled={basket.length === 0}
          onClick={() => notify(`Order sent (demo). ${euro(total)} plus shipping, charged to your saved card.`)}
        >
          {basket.length === 0 ? "Choose something to send home" : `Send home, ${euro(total)}`}
        </Button>
      </section>

      <section className="px-5">
        <div className="flex items-start gap-4 rounded-2xl bg-sea-wash p-5">
          <Mail className="mt-0.5 size-5 shrink-0 text-sea" aria-hidden />
          <div className="flex-1">
            <h3 className="text-[16px] font-semibold">A letter from Milos, once a month</h3>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-2">
              What is in season, a recipe, and dates that open up before we publish them.
            </p>
            <Button size="sm" variant={letters ? "outline" : "primary"} className="mt-3" onClick={() => setLetters((l) => !l)}>
              {letters ? (
                <>
                  <Check className="size-4" aria-hidden /> Subscribed
                </>
              ) : (
                "Send me the letter"
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
