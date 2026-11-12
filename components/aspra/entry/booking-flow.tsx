"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BedDouble, Box, Check, Maximize2, Ship, Plane, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAspra } from "../store"
import {
  addDays,
  bookingTotal,
  euro,
  extraById,
  formatDate,
  hotel,
  newRef,
  pillowOptions,
  scentOptions,
  stayIsFree,
  suiteById,
  suites,
  type Booking,
  type ExtraId,
  type Prefs,
  type SuiteId,
} from "../data"
import { Button, Counter, EASE, FlowHeader, FullScreen, Photo, Segmented, Sheet, Step, TextLink } from "../ui"
import { StayCalendar } from "./stay-calendar"
import { ExtrasPicker, SuitePrefs, TripPrefs } from "../shared"
import { SuiteTour } from "../suite3d/suite-tour"

type StepId = "suite" | "dates" | "extras" | "trip" | "room" | "review"

const NEW_STEPS: StepId[] = ["suite", "dates", "extras", "trip", "room", "review"]
const RETURN_STEPS: StepId[] = ["suite", "dates", "extras", "review"]

const titles: Record<StepId, string> = {
  suite: "Choose a suite",
  dates: "When are you coming?",
  extras: "Shape the stay",
  trip: "How do you like to travel?",
  room: "Set up your suite",
  review: "Check and confirm",
}

const intros: Record<StepId, string> = {
  suite: "Seven suites, all facing the sea: four cave suites, two with a plunge pool and one villa.",
  dates: "Tap the day you arrive, then the day you leave. The sea is calmest in June and late September.",
  extras: "Add what you need now. You can change any of it until 48 hours before arrival.",
  trip: "This shapes what Nefeli, our concierge, suggests each day.",
  room: "Three choices now. The rest can wait: change any of it until you arrive.",
  review: "Nothing is charged in this demo. A real booking takes a 30% deposit.",
}

export function BookingFlow({
  mode,
  onClose,
  onDone,
}: {
  mode: "new" | "return"
  onClose: () => void
  onDone: () => void
}) {
  const store = useAspra()
  const steps = mode === "new" ? NEW_STEPS : RETURN_STEPS
  const [dir, setDir] = React.useState(1)
  const [confirmed, setConfirmed] = React.useState<Booking | null>(null)

  // Choices are kept on this device, so closing the flow or refreshing does not lose them.
  const draftKey = `aspra-draft-v1:${mode}`
  const [start] = React.useState(() => {
    const defaultIn = mode === "return" ? "2027-09-17" : "2027-06-11"
    const fresh = {
      restored: false,
      i: 0,
      draft: {
        ref: "",
        suiteId: mode === "return" ? store.pastStay?.suiteId ?? "cave" : "pool",
        checkIn: defaultIn,
        checkOut: addDays(defaultIn, mode === "return" ? 6 : 5),
        adults: 2,
        children: 0,
        extras: mode === "return" ? ["car-transfer"] : [],
        arrival: { by: "air", detail: "Sky Express from Athens", time: "12:35" },
      } as Booking,
      prefs: store.prefs,
      name: { first: store.guest.firstName, last: store.guest.lastName, email: store.guest.email },
    }
    try {
      const raw = window.localStorage.getItem(draftKey)
      if (!raw) return fresh
      const saved = JSON.parse(raw) as Partial<typeof fresh>
      if (!saved.draft || !saved.prefs || !saved.name) return fresh
      return { restored: true, i: Math.min(steps.length - 1, Math.max(0, saved.i ?? 0)), draft: saved.draft, prefs: saved.prefs, name: saved.name }
    } catch {
      return fresh
    }
  })
  const [i, setI] = React.useState(start.i)
  const [draft, setDraft] = React.useState<Booking>(start.draft)
  const [prefs, setPrefs] = React.useState<Prefs>(start.prefs)
  const [tourSuite, setTourSuite] = React.useState<SuiteId | null>(null)
  const [name, setName] = React.useState(start.name)
  const [keptNotice, setKeptNotice] = React.useState(start.restored)
  const [leaving, setLeaving] = React.useState(false)
  /** True after the guest jumps back from the review to change one thing. */
  const [returnToReview, setReturnToReview] = React.useState(false)
  const [attempted, setAttempted] = React.useState(false)

  const dirty = i > 0 || start.restored || draft !== start.draft || prefs !== start.prefs || name !== start.name

  React.useEffect(() => {
    if (!dirty || confirmed) return
    try {
      window.localStorage.setItem(draftKey, JSON.stringify({ i, draft, prefs, name }))
    } catch {
      // Storage can be refused in private windows. The flow still works.
    }
  }, [dirty, confirmed, draftKey, i, draft, prefs, name])

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(draftKey)
    } catch {
      // Nothing to clear.
    }
  }

  const step = steps[i]
  const nights = bookingTotal(draft).nights
  const scrollTop = () => {
    if (typeof document !== "undefined") document.getElementById("flow-scroll")?.scrollTo({ top: 0 })
  }
  const go = (d: number) => {
    setDir(d)
    setI((n) => Math.min(steps.length - 1, Math.max(0, n + d)))
    scrollTop()
  }
  const jump = (to: StepId) => {
    const at = steps.indexOf(to)
    if (at < 0) return
    setDir(at < i ? -1 : 1)
    setReturnToReview(to !== "review")
    setI(at)
    scrollTop()
  }

  const datesFree = stayIsFree(draft.checkIn, draft.checkOut, draft.suiteId)
  const errors = {
    dates: datesFree ? "" : `The ${suiteById(draft.suiteId).name.toLowerCase()} is not free for all of those nights. Choose other dates or another suite.`,
    first: mode === "return" || name.first.trim() ? "" : "Enter your first name.",
    email: mode === "return" || /.+@.+\..+/.test(name.email.trim()) ? "" : "Enter an email address, such as name@example.com.",
  }

  function confirm() {
    if (errors.dates || errors.first || errors.email) {
      setAttempted(true)
      // Take the guest to the first thing that needs fixing.
      const target = errors.dates ? "review-dates-error" : errors.first ? "booking-first-name" : "booking-email"
      requestAnimationFrame(() => {
        const el = document.getElementById(target)
        el?.scrollIntoView({ block: "center", behavior: "smooth" })
        el?.focus({ preventScroll: true })
      })
      return
    }
    const b = { ...draft, ref: newRef() }
    store.setBooking(b)
    store.setPrefs(prefs)
    if (mode === "new") store.setGuest({ firstName: name.first.trim(), lastName: name.last.trim(), email: name.email.trim() })
    store.setPhase("before")
    clearDraft()
    setConfirmed(b)
  }

  const startOver = () => {
    clearDraft()
    setDraft({ ...start.draft, suiteId: mode === "return" ? store.pastStay?.suiteId ?? "cave" : "pool", checkIn: mode === "return" ? "2027-09-17" : "2027-06-11", checkOut: mode === "return" ? "2027-09-23" : "2027-06-16", adults: 2, children: 0, extras: mode === "return" ? ["car-transfer"] : [] })
    setPrefs(store.prefs)
    setName({ first: store.guest.firstName, last: store.guest.lastName, email: store.guest.email })
    setKeptNotice(false)
    setAttempted(false)
    setReturnToReview(false)
    setDir(-1)
    setI(0)
    scrollTop()
  }

  const requestClose = () => (dirty ? setLeaving(true) : onClose())

  if (confirmed) {
    return <Confirmed booking={confirmed} firstName={mode === "new" ? name.first : store.guest.firstName} onOpen={onDone} />
  }

  const toggleExtra = (id: ExtraId) =>
    setDraft((d) => ({ ...d, extras: d.extras.includes(id) ? d.extras.filter((x) => x !== id) : [...d.extras, id] }))

  return (
    <FullScreen className="flex flex-col overflow-hidden">
      <FlowHeader
        onBack={i === 0 ? requestClose : () => go(-1)}
        onClose={requestClose}
        step={i}
        steps={steps.length}
        title={mode === "return" ? "Book again" : "New booking"}
      />
      <div id="flow-scroll" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <Step id={step} dir={dir}>
            <div className="px-5 pb-8 pt-3">
              <h1 className="font-display text-[34px]">{titles[step]}</h1>
              <p className="mb-6 mt-2 text-[15px] leading-relaxed text-ink-2">{intros[step]}</p>

              {keptNotice && (
                <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-sea-wash px-4 py-3 text-[14px] text-ink">
                  <span>We kept your choices from last time.</span>
                  <TextLink onClick={startOver}>Start over</TextLink>
                </div>
              )}

              {step === "suite" && (
                <SuitePicker
                  value={draft.suiteId}
                  lastSuite={mode === "return" ? store.pastStay?.suiteNumber : undefined}
                  onChange={(suiteId) => setDraft((d) => ({ ...d, suiteId }))}
                  onTour={(id) => {
                    setDraft((d) => ({ ...d, suiteId: id }))
                    setTourSuite(id)
                  }}
                />
              )}

              {step === "dates" && (
                <DatesStep draft={draft} setDraft={setDraft} nights={nights} error={errors.dates} />
              )}

              {step === "extras" && (
                <div>
                  <h2 className="mb-3 text-[16px] font-semibold">How you are arriving</h2>
                  <Segmented
                    label="How you are arriving"
                    value={draft.arrival.by}
                    onChange={(by) =>
                      setDraft((d) => ({
                        ...d,
                        arrival:
                          by === "air"
                            ? { by, detail: "Sky Express from Athens", time: "12:35" }
                            : { by, detail: "Seajets from Piraeus", time: "13:40" },
                      }))
                    }
                    options={[
                      { id: "air", label: "Flight to Milos" },
                      { id: "ferry", label: "Ferry to Adamas" },
                    ]}
                  />
                  <p className="mb-7 mt-3 flex items-center gap-2 text-[14px] text-ink-2">
                    {draft.arrival.by === "air" ? <Plane className="size-4" aria-hidden /> : <Ship className="size-4" aria-hidden />}
                    {draft.arrival.by === "air"
                      ? `Milos airport is ${hotel.airportMinutes} minutes away. We ask for your flight number a week before.`
                      : `Adamas port is ${hotel.portMinutes} minutes by car, or 35 by our boat.`}
                  </p>
                  <h2 className="mb-3 text-[16px] font-semibold">Extras</h2>
                  <ExtrasPicker selected={draft.extras} onToggle={toggleExtra} />
                </div>
              )}

              {step === "trip" && <TripPrefs prefs={prefs} onChange={(p) => setPrefs((x) => ({ ...x, ...p }))} />}
              {step === "room" && (
                <>
                  <Button variant="dark" block size="lg" className="mb-7" onClick={() => setTourSuite(draft.suiteId)}>
                    <Box className="size-5 text-sulphur" aria-hidden /> Set it up in 3D
                  </Button>
                  <SuitePrefs compact prefs={prefs} onChange={(p) => setPrefs((x) => ({ ...x, ...p }))} />
                </>
              )}

              {step === "review" && (
                <Review
                  draft={draft}
                  prefs={prefs}
                  mode={mode}
                  name={name}
                  setName={setName}
                  remembered={store.pastStay?.remembered}
                  errors={errors}
                  attempted={attempted}
                  onEdit={jump}
                  canEdit={(id) => steps.includes(id)}
                />
              )}
            </div>
          </Step>
        </AnimatePresence>
      </div>

      <FlowFooter
        nights={nights}
        draft={draft}
        label={step === "review" ? "Confirm booking" : returnToReview ? "Back to review" : "Continue"}
        blocked={step === "dates" && !datesFree}
        onNext={() => (step === "review" ? confirm() : returnToReview ? jump("review") : go(1))}
      />
      <Sheet
        open={leaving}
        onClose={() => setLeaving(false)}
        title="Leave this booking?"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Leave
            </Button>
            <Button className="flex-1" onClick={() => setLeaving(false)}>
              Keep booking
            </Button>
          </div>
        }
      >
        <p className="text-[15px] leading-relaxed text-ink-2">
          Nothing is booked yet. Your choices stay on this device, so you can pick up where you stopped.
        </p>
        <div className="mt-4">
          <TextLink
            onClick={() => {
              clearDraft()
              onClose()
            }}
          >
            Leave and clear my choices
          </TextLink>
        </div>
      </Sheet>
      <AnimatePresence>
        {tourSuite && (
          <SuiteTour
            suiteId={tourSuite}
            prefs={prefs}
            onChange={(p) => setPrefs((x) => ({ ...x, ...p }))}
            saveLabel="Keep these choices"
            onClose={() => setTourSuite(null)}
          />
        )}
      </AnimatePresence>
    </FullScreen>
  )
}

function FlowFooter({
  draft,
  nights,
  label,
  blocked,
  onNext,
}: {
  draft: Booking
  nights: number
  label: string
  /** The step cannot be passed yet. The reason is shown on the step itself. */
  blocked: boolean
  onNext: () => void
}) {
  const t = bookingTotal(draft)
  return (
    <div className="flex items-center gap-4 border-t border-white/70 bg-white/55 px-5 backdrop-blur-xl pb-[max(env(safe-area-inset-bottom),14px)] pt-3">
      <div className="min-w-0 flex-1">
        <div className="text-[18px] font-semibold tabular-nums">{euro(t.total)}</div>
        <div className="truncate text-[13px] text-ink-3">
          {suiteById(draft.suiteId).name}, {nights} {nights === 1 ? "night" : "nights"}
        </div>
      </div>
      <Button onClick={onNext} disabled={blocked} size="lg" className="min-w-[150px]">
        {label}
      </Button>
    </div>
  )
}

function SuitePicker({
  value,
  onChange,
  onTour,
  lastSuite,
}: {
  value: SuiteId
  onChange: (id: SuiteId) => void
  onTour: (id: SuiteId) => void
  lastSuite?: string
}) {
  return (
    <div className="space-y-5" role="radiogroup" aria-label="Suites">
      {suites.map((s) => {
        const on = value === s.id
        return (
          <div key={s.id} className="relative">
          <button
            role="radio"
            aria-checked={on}
            onClick={() => onChange(s.id)}
            className={cn(
              "block w-full overflow-hidden rounded-3xl bg-white/70 text-left ring-1 backdrop-blur-xl transition-shadow",
              on ? "ring-2 ring-sea" : "ring-white/80 hover:ring-ink/20",
            )}
          >
            <div className="relative aspect-[4/3]">
              <Photo src={s.image} alt={`${s.name} at Aspra`} className="absolute inset-0 size-full" />
              {lastSuite && s.id === "cave" && (
                <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-[12.5px] font-medium text-ink">
                  You stayed in {lastSuite}
                </span>
              )}
              <span
                className={cn(
                  "absolute right-3 top-3 grid size-8 place-items-center rounded-full border-2 transition-colors",
                  on ? "border-sea bg-sea text-white" : "border-white bg-black/20",
                )}
                aria-hidden
              >
                {on && <Check className="size-4" strokeWidth={3} />}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[25px]">{s.name}</h3>
                <span className="shrink-0 text-[15px] font-semibold tabular-nums">
                  {euro(s.nightly)}
                  <span className="font-normal text-ink-3"> / night</span>
                </span>
              </div>
              <p className="mt-1 text-[14.5px] leading-snug text-ink-2">{s.line}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-3">
                <span className="inline-flex items-center gap-1.5"><Maximize2 className="size-3.5" aria-hidden />{s.size} m²</span>
                <span className="inline-flex items-center gap-1.5"><Users className="size-3.5" aria-hidden />Up to {s.sleeps}</span>
                <span className="inline-flex items-center gap-1.5"><BedDouble className="size-3.5" aria-hidden />{s.view}</span>
              </div>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="overflow-hidden"
                  >
                    {s.facts.map((f) => (
                      <li key={f} className="mt-2 flex gap-2 text-[14px] text-ink first:mt-3">
                        <Check className="mt-0.5 size-4 shrink-0 text-sea" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </button>
          <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[4/3]">
            <button
              onClick={() => onTour(s.id)}
              className="pointer-events-auto absolute bottom-3 left-3 inline-flex h-10 items-center gap-2 rounded-full glass-smoke px-4 text-[14px] font-medium text-white hover:bg-obsidian/70"
            >
              <Box className="size-4 text-sulphur" aria-hidden /> {s.id === "villa" ? "See the bedroom in 3D" : "See it in 3D"}
            </button>
          </div>
          </div>
        )
      })}
    </div>
  )
}

function DatesStep({
  draft,
  setDraft,
  nights,
  error,
}: {
  draft: Booking
  setDraft: React.Dispatch<React.SetStateAction<Booking>>
  nights: number
  error: string
}) {
  // The longest stay from this arrival day before a sold night or the end of the season.
  let maxNights = 2
  while (maxNights < 14 && stayIsFree(draft.checkIn, addDays(draft.checkIn, maxNights + 1), draft.suiteId)) maxNights++

  return (
    <div>
      <StayCalendar
        checkIn={draft.checkIn}
        checkOut={draft.checkOut}
        suiteId={draft.suiteId}
        onChange={(checkIn, checkOut) => setDraft((d) => ({ ...d, checkIn, checkOut }))}
      />
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-clay-wash px-4 py-3 text-[14px] text-clay">
          {error}
        </p>
      )}

      <div className="mt-6 divide-y divide-border rounded-xl glass px-4">
        <Counter
          label="Nights"
          hint={`${formatDate(draft.checkIn, { weekday: "short", day: "numeric", month: "short" })} to ${formatDate(draft.checkOut, { weekday: "short", day: "numeric", month: "short" })}`}
          value={nights}
          min={2}
          max={Math.max(nights, maxNights)}
          onChange={(n) => setDraft((d) => ({ ...d, checkOut: addDays(d.checkIn, n) }))}
        />
        <Counter
          label="Adults"
          value={draft.adults}
          min={1}
          max={suiteById(draft.suiteId).sleeps}
          onChange={(adults) => setDraft((d) => ({ ...d, adults, children: Math.min(d.children, suiteById(d.suiteId).sleeps - adults) }))}
        />
        <Counter
          label="Children"
          hint="Under 12. Cots are free."
          value={draft.children}
          min={0}
          max={suiteById(draft.suiteId).sleeps - draft.adults}
          onChange={(children) => setDraft((d) => ({ ...d, children }))}
        />
      </div>
      <p className="mt-3 text-[13.5px] text-ink-3">
        {suiteById(draft.suiteId).name} sleeps up to {suiteById(draft.suiteId).sleeps}. Minimum stay is 2 nights.
      </p>
    </div>
  )
}

function Review({
  draft,
  prefs,
  mode,
  name,
  setName,
  remembered,
  errors,
  attempted,
  onEdit,
  canEdit,
}: {
  draft: Booking
  prefs: Prefs
  mode: "new" | "return"
  name: { first: string; last: string; email: string }
  setName: React.Dispatch<React.SetStateAction<{ first: string; last: string; email: string }>>
  remembered?: string[]
  errors: { dates: string; first: string; email: string }
  /** True once the guest has tried to confirm, so missing fields are pointed out. */
  attempted: boolean
  onEdit: (step: StepId) => void
  canEdit: (step: StepId) => boolean
}) {
  const s = suiteById(draft.suiteId)
  const t = bookingTotal(draft)
  const fieldClass =
    "h-12 w-full rounded-xl glass px-4 text-[16px] placeholder:text-ink-3 focus:border-sea focus:outline-none"

  return (
    <div className="space-y-6">
      <div className="flex gap-4 rounded-2xl glass p-3">
        <Photo src={s.image} alt="" className="size-24 shrink-0 rounded-xl" />
        <div className="min-w-0 py-1">
          <div className="font-display text-[22px]">{s.name}</div>
          <div className="mt-1 text-[14px] text-ink-2">
            {formatDate(draft.checkIn, { day: "numeric", month: "long" })} to {formatDate(draft.checkOut, { day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div className="text-[14px] text-ink-2">
            {draft.adults} {draft.adults === 1 ? "adult" : "adults"}
            {draft.children > 0 && `, ${draft.children} ${draft.children === 1 ? "child" : "children"}`}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            <TextLink onClick={() => onEdit("suite")}>Change suite</TextLink>
            <TextLink onClick={() => onEdit("dates")}>Change dates</TextLink>
          </div>
        </div>
      </div>

      {errors.dates && (
        <p id="review-dates-error" tabIndex={-1} role="alert" className="rounded-xl bg-clay-wash px-4 py-3 text-[14px] text-clay">
          {errors.dates}
        </p>
      )}

      <dl className="divide-y divide-border rounded-2xl glass px-4">
        <Row label={`${t.nights} nights at ${euro(s.nightly)}`} value={euro(t.room)} />
        {draft.extras.map((id) => (
          <Row key={id} label={extraById(id).name} value={extraById(id).price === 0 ? "Free" : euro(extraById(id).price)} />
        ))}
        <Row label="Breakfast, yoga, local calls" value="Included" />
        <Row label="Total" value={euro(t.total)} strong />
      </dl>
      <div className="-mt-3 px-1">
        <TextLink onClick={() => onEdit("extras")}>{draft.extras.length ? "Change extras" : "Add a transfer or other extras"}</TextLink>
      </div>

      {mode === "return" && remembered ? (
        <div className="rounded-2xl bg-sea-wash p-4">
          <h2 className="text-[16px] font-semibold">We kept these from your last stay</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {remembered.map((r) => (
              <li key={r} className="rounded-full bg-white/80 px-3 py-1.5 text-[13.5px] text-ink">
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13.5px] text-ink-2">Change any of them later from your profile.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-sea-wash p-4 text-[14px] leading-relaxed text-ink">
          <h2 className="mb-1 text-[16px] font-semibold">Your suite on arrival</h2>
          {pillowOptions.find((p) => p.id === prefs.pillow)?.label} pillows,{" "}
          {scentOptions.find((p) => p.id === prefs.scent)?.label.toLowerCase()}, set to {prefs.temperature}°C.
          {canEdit("room") && (
            <div className="mt-1.5">
              <TextLink onClick={() => onEdit("room")}>Change suite setup</TextLink>
            </div>
          )}
        </div>
      )}

      {mode === "new" && (
        <fieldset className="space-y-3">
          <legend className="mb-1 text-[16px] font-semibold">Who is the booking for?</legend>
          <p className="text-[13.5px] text-ink-3">A sample guest is filled in for you. Change it if you like.</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[14px] font-medium text-ink">First name</span>
              <input
                id="booking-first-name"
                autoComplete="given-name"
                value={name.first}
                aria-invalid={attempted && !!errors.first}
                aria-describedby={attempted && errors.first ? "booking-first-name-error" : undefined}
                onChange={(e) => setName((n) => ({ ...n, first: e.target.value }))}
                className={cn(fieldClass, attempted && errors.first && "border-clay")}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[14px] font-medium text-ink">
                Last name <span className="font-normal text-ink-3">(optional)</span>
              </span>
              <input
                autoComplete="family-name"
                value={name.last}
                onChange={(e) => setName((n) => ({ ...n, last: e.target.value }))}
                className={fieldClass}
              />
            </label>
          </div>
          {attempted && errors.first && (
            <p id="booking-first-name-error" role="alert" className="text-[13.5px] text-clay">
              {errors.first}
            </p>
          )}
          <label className="block">
            <span className="mb-1.5 block text-[14px] font-medium text-ink">Email</span>
            <input
              id="booking-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={name.email}
              aria-invalid={attempted && !!errors.email}
              aria-describedby={attempted && errors.email ? "booking-email-error" : "booking-email-hint"}
              onChange={(e) => setName((n) => ({ ...n, email: e.target.value }))}
              className={cn(fieldClass, attempted && errors.email && "border-clay")}
            />
          </label>
          {attempted && errors.email ? (
            <p id="booking-email-error" role="alert" className="text-[13.5px] text-clay">
              {errors.email}
            </p>
          ) : (
            <p id="booking-email-hint" className="text-[13px] text-ink-3">
              We send your confirmation here.
            </p>
          )}
          <p className="text-[13px] text-ink-3">Free cancellation until 30 days before arrival.</p>
        </fieldset>
      )}
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-3 text-[14.5px]", strong && "text-[16px] font-semibold")}>
      <dt className={strong ? "" : "text-ink-2"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}

function Confirmed({ booking, firstName, onOpen }: { booking: Booking; firstName: string; onOpen: () => void }) {
  const s = suiteById(booking.suiteId)
  return (
    <FullScreen className="on-dark bg-obsidian text-white">
      <div className="relative h-[52svh]">
        <Photo src={s.image} alt={`${s.name} at Aspra`} className="absolute inset-0 size-full" priority />
        <div className="photo-fade absolute inset-0" />
      </div>
      <div className="-mt-20 relative px-6 pb-[max(env(safe-area-inset-bottom),24px)]">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="grid size-14 place-items-center rounded-full bg-sea text-white"
        >
          <Check className="size-7" strokeWidth={2.6} aria-hidden />
        </motion.div>
        <h1 className="mt-5 font-display text-[36px] leading-[1.02]">
          Efharisto{firstName ? `, ${firstName}` : ""}. See you on Milos.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/80">
          {s.name}, {formatDate(booking.checkIn, { day: "numeric", month: "long" })} to{" "}
          {formatDate(booking.checkOut, { day: "numeric", month: "long" })}. Reference {booking.ref}. A copy is on its way to your email.
        </p>
        <ul className="mt-6 space-y-3 text-[15px] text-white/90">
          <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-sulphur" />Nefeli, our concierge, can answer questions now, at any hour.</li>
          <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-sulphur" />Plan your days and book the boat before it fills in spring.</li>
          <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-sulphur" />Your suite is set up from the choices you made.</li>
        </ul>
        <Button variant="sulphur" size="lg" block className="mt-8" onClick={onOpen}>
          Open my trip
        </Button>
      </div>
    </FullScreen>
  )
}
