"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BookOpen, CalendarRange, MessageCircle, Sun, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { AspraProvider, useAspra } from "./store"
import type { GuestKind, TabId } from "./data"
import { EASE, Sheet, Wordmark, Button, Segmented } from "./ui"
import { Splash, Gate } from "./entry/gate"
import { BookingFlow } from "./entry/booking-flow"
import { BookedEntry, ReturningEntry } from "./entry/guest-entry"
import { TodayTab } from "./tabs/today"
import { PlanTab } from "./tabs/plan"
import { ConciergeTab } from "./tabs/concierge"
import { JournalTab } from "./tabs/journal"
import { SuitePrefs, TripPrefs } from "./shared"
import { SuiteTour } from "./suite3d/suite-tour"

type Entry = "splash" | "gate" | "new" | "booked" | "returning" | "rebook" | "app"

function Shell({ initialKind }: { initialKind: GuestKind | null }) {
  const store = useAspra()
  const [entry, setEntry] = React.useState<Entry>("splash")
  const startedFromUrl = React.useRef(false)

  const choose = React.useCallback(
    (k: GuestKind) => {
      store.begin(k)
      setEntry(k)
    },
    [store],
  )

  const afterSplash = React.useCallback(() => {
    if (initialKind && !startedFromUrl.current) {
      startedFromUrl.current = true
      choose(initialKind)
    } else setEntry("gate")
  }, [initialKind, choose])

  const toStart = React.useCallback(() => {
    store.reset()
    setEntry("gate")
  }, [store])

  const enterApp = React.useCallback(() => setEntry("app"), [])

  // The app asks to rebook from inside (Journal, Today after-stay).
  React.useEffect(() => {
    const onRebook = () => setEntry("rebook")
    window.addEventListener("aspra:rebook", onRebook)
    return () => window.removeEventListener("aspra:rebook", onRebook)
  }, [])

  return (
    <>
      <AnimatePresence>{entry === "splash" && <Splash key="splash" onDone={afterSplash} />}</AnimatePresence>
      <AnimatePresence mode="wait">
        {entry === "gate" && <Gate key="gate" onChoose={choose} />}
        {entry === "new" && <BookingFlow key="new" mode="new" onClose={toStart} onDone={enterApp} />}
        {entry === "booked" && <BookedEntry key="booked" onClose={toStart} onDone={enterApp} />}
        {entry === "returning" && (
          <ReturningEntry
            key="returning"
            onClose={toStart}
            onRebook={() => setEntry("rebook")}
            onBrowse={() => {
              store.setPhase("after")
              store.setTab("journal")
              setEntry("app")
            }}
          />
        )}
        {entry === "rebook" && (
          <BookingFlow
            key="rebook"
            mode="return"
            onClose={() => setEntry(store.booking ? "app" : "returning")}
            onDone={() => {
              store.setTab("today")
              setEntry("app")
            }}
          />
        )}
      </AnimatePresence>

      {store.kind && <MainApp onSwitchGuest={toStart} hidden={entry !== "app"} />}
    </>
  )
}

const tabs: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: "today", label: "Today", icon: Sun },
  { id: "plan", label: "Plan", icon: CalendarRange },
  { id: "concierge", label: "Nefeli", icon: MessageCircle },
  { id: "journal", label: "Journal", icon: BookOpen },
]

function MainApp({ onSwitchGuest, hidden }: { onSwitchGuest: () => void; hidden: boolean }) {
  const store = useAspra()
  const { tab } = store

  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "relative min-h-[100svh] w-full lg:pl-[272px]",
        tab === "concierge" ? "ambient-dark" : "ambient",
        hidden && "invisible",
      )}
    >
      <SideNav dark={tab === "concierge"} />
      {tab !== "concierge" && <TopBar />}
      <main className="mx-auto w-full max-w-[440px] md:max-w-[760px] lg:max-w-[1120px] lg:px-4 lg:pt-6">
        {/* All tabs stay mounted so chat history and scroll survive switches. */}
        <TabPanel active={tab === "today"}><TodayTab /></TabPanel>
        <TabPanel active={tab === "plan"}><PlanTab /></TabPanel>
        <TabPanel active={tab === "concierge"}><ConciergeTab /></TabPanel>
        <TabPanel active={tab === "journal"}><JournalTab /></TabPanel>
      </main>
      <TabBar dark={tab === "concierge"} />
      <ProfileSheet onSwitchGuest={onSwitchGuest} />
      <AnimatePresence>
        {store.tourOpen && !hidden && (
          <SuiteTour
            suiteId={store.booking?.suiteId ?? store.pastStay?.suiteId ?? "cave"}
            prefs={store.prefs}
            onChange={store.setPrefs}
            onClose={(saved) => {
              store.setTourOpen(false)
              if (saved) store.notify("Saved. Housekeeping will set up your suite this way.")
            }}
          />
        )}
      </AnimatePresence>
      <Toast />
    </div>
  )
}

function TabPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      role="tabpanel"
      hidden={!active}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function TopBar() {
  const { guest, setProfileOpen } = useAspra()
  const initials = (guest.firstName[0] ?? "G") + (guest.lastName[0] ?? "")
  return (
    <header className="sticky top-0 z-[var(--z-nav)] bg-white/40 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex w-full max-w-[440px] items-center justify-between px-5 pb-2 pt-[max(env(safe-area-inset-top),10px)] md:max-w-[760px]">
        <Wordmark />
        <button
          onClick={() => setProfileOpen(true)}
          aria-label="Your profile and preferences"
          className="grid size-11 place-items-center rounded-full bg-sea text-[14px] font-semibold uppercase text-white"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}

/** Desktop navigation: a glass rail on the left that replaces the top bar and tab bar. */
function SideNav({ dark }: { dark: boolean }) {
  const { tab, setTab, plan, guest, setProfileOpen } = useAspra()
  const initials = (guest.firstName[0] ?? "G") + (guest.lastName[0] ?? "")
  const name = [guest.firstName, guest.lastName].filter(Boolean).join(" ") || "Guest"
  return (
    <aside className={cn("fixed inset-y-0 left-0 z-[var(--z-nav)] hidden w-[272px] p-4 lg:block", dark && "on-dark")}>
      <div className={cn("flex h-full flex-col rounded-[28px] p-4 transition-colors duration-500", dark ? "glass-smoke text-white" : "glass-strong")}>
        <Wordmark tone={dark ? "light" : "dark"} className="px-2 py-2" />
        <nav aria-label="Main" className="mt-6">
          <ul className="space-y-1">
            {tabs.map((t) => {
              const active = t.id === tab
              const Icon = t.icon
              return (
                <li key={t.id}>
                  <button
                    aria-current={active ? "page" : undefined}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex h-12 w-full items-center gap-3 rounded-full px-4 text-[15px] font-medium transition-colors",
                      active
                        ? dark
                          ? "bg-white text-obsidian"
                          : "bg-ink text-white"
                        : dark
                          ? "text-white/75 hover:bg-white/10"
                          : "text-ink-2 hover:bg-ink/5",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                    <span className="flex-1 text-left">{t.label}</span>
                    {t.id === "plan" && plan.length > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-sea px-1.5 text-[11px] font-semibold text-white">{plan.length}</span>
                    )}
                    {t.id === "concierge" && <span className="size-2 rounded-full bg-[oklch(0.75_0.15_150)]" aria-label="Online" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="flex-1" />
        <button
          onClick={() => setProfileOpen(true)}
          className={cn("flex items-center gap-3 rounded-full p-1.5 pr-4 text-left transition-colors", dark ? "hover:bg-white/10" : "hover:bg-ink/5")}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sea text-[13px] font-semibold uppercase text-white">{initials}</span>
          <span className="min-w-0">
            <span className="block truncate text-[14.5px] font-medium">{name}</span>
            <span className={cn("block text-[12.5px]", dark ? "text-white/70" : "text-ink-3")}>Preferences</span>
          </span>
        </button>
      </div>
    </aside>
  )
}

function TabBar({ dark }: { dark: boolean }) {
  const { tab, setTab, plan } = useAspra()
  return (
    <nav
      aria-label="Main"
      className={cn(
        "fixed bottom-0 left-1/2 z-[var(--z-nav)] w-full max-w-[440px] -translate-x-1/2 px-3 pb-[max(env(safe-area-inset-bottom),10px)] lg:hidden",
        dark && "on-dark",
      )}
    >
      <ul role="tablist" className={cn("grid grid-cols-4 rounded-full px-2 transition-colors duration-500", dark ? "glass-smoke" : "glass-strong shadow-[0_6px_8px_-4px_rgb(10_12_17/0.14)]")}>
        {tabs.map((t) => {
          const active = t.id === tab
          const Icon = t.icon
          return (
            <li key={t.id}>
              <button
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex h-[60px] w-full flex-col items-center justify-center gap-0.5 pb-1.5 text-[11.5px] font-medium transition-colors",
                  dark ? (active ? "text-white" : "text-white/60") : active ? "text-ink" : "text-ink-3",
                )}
              >
                <span className="relative">
                  <Icon className="size-[22px]" strokeWidth={active ? 2.2 : 1.7} aria-hidden />
                  {t.id === "concierge" && (
                    <span className="absolute -right-1 -top-0.5 size-2 rounded-full bg-olive ring-2 ring-white" aria-hidden />
                  )}
                  {t.id === "plan" && plan.length > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-sea px-1 text-[10px] font-semibold text-white">
                      {plan.length}
                    </span>
                  )}
                </span>
                {t.label}
                {active && (
                  <motion.span
                    layoutId="tab-dot"
                    className={cn("absolute bottom-1.5 size-1 rounded-full", dark ? "bg-sulphur" : "bg-sea")}
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function ProfileSheet({ onSwitchGuest }: { onSwitchGuest: () => void }) {
  const store = useAspra()
  const [section, setSection] = React.useState<"trip" | "suite">("trip")
  const name = [store.guest.firstName, store.guest.lastName].filter(Boolean).join(" ") || "Guest"

  return (
    <Sheet
      open={store.profileOpen}
      onClose={() => store.setProfileOpen(false)}
      title={name}
      footer={
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onSwitchGuest}>
            Switch sample guest
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              store.setProfileOpen(false)
              store.notify("Preferences saved. Nefeli and the team can see them.")
            }}
          >
            Save
          </Button>
        </div>
      }
    >
      <p className="mb-5 text-[14.5px] leading-relaxed text-ink-2">
        Your preferences travel with you to every stay. Nefeli uses them to plan your days, and housekeeping uses them to set up your suite.
      </p>
      <div className="mb-6">
        <Segmented<"trip" | "suite">
          label="Preference section"
          value={section}
          onChange={setSection}
          options={[
            { id: "trip", label: "Your days" },
            { id: "suite", label: "Your suite" },
          ]}
        />
      </div>
      {section === "trip" ? (
        <TripPrefs prefs={store.prefs} onChange={store.setPrefs} />
      ) : (
        <SuitePrefs prefs={store.prefs} onChange={store.setPrefs} />
      )}
    </Sheet>
  )
}

function Toast() {
  const { toast, tab } = useAspra()
  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[var(--z-toast)] flex justify-center px-5",
        tab === "concierge"
          ? "bottom-[calc(200px+env(safe-area-inset-bottom))] lg:bottom-28 lg:pl-[272px]"
          : "bottom-[calc(92px+env(safe-area-inset-bottom))] lg:bottom-8 lg:pl-[272px]",
      )}
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="max-w-[400px] rounded-2xl border border-white/15 bg-obsidian/80 px-4 py-3 text-[14px] text-white backdrop-blur-xl"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AspraApp({ initialKind }: { initialKind: GuestKind | null }) {
  return (
    <AspraProvider>
      <Shell initialKind={initialKind} />
    </AspraProvider>
  )
}
