"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { ArdenProvider, useArden } from "./arden-context"
import { BottomNav } from "./bottom-nav"
import { TopHeader } from "./top-header"
import { StayTab } from "./stay/stay-tab"
import { RoomTab } from "./room/room-tab"
import { ConciergeTab } from "./concierge/concierge-tab"
import { AssistantTab } from "./assistant/assistant-tab"
import { SplashScreen } from "./splash-screen"
import { GuestGate } from "./landing/guest-gate"
import { LandingBooked } from "./landing/landing-booked"
import { LandingReturning } from "./landing/landing-returning"
import { BookingFlow } from "./stay/booking-flow"
import type { BookingPath, GuestType, RoomTypeId, TabId } from "./types"

/**
 * All four tabs stay mounted so their state (arrival-profile selections,
 * booking draft, chat history, scroll position) survives tab switches.
 * Only the active one is visible.
 */
function Stage() {
  const { tab } = useArden()

  return (
    <>
      <TabFrame id="stay" active={tab === "stay"}>
        <StayTab />
      </TabFrame>
      <TabFrame id="room" active={tab === "room"}>
        <RoomTab />
      </TabFrame>
      <TabFrame id="concierge" active={tab === "concierge"}>
        <ConciergeTab />
      </TabFrame>
      <TabFrame id="assistant" active={tab === "assistant"} noBottomPad>
        <AssistantTab />
      </TabFrame>
    </>
  )
}

function TabFrame({
  id,
  active,
  children,
  noBottomPad,
}: {
  id: TabId
  active: boolean
  children: React.ReactNode
  noBottomPad?: boolean
}) {
  return (
    <motion.div
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      aria-hidden={!active}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        "w-full",
        active ? "block" : "hidden",
        !noBottomPad && "pb-[calc(84px+env(safe-area-inset-bottom))]",
      )}
    >
      {children}
    </motion.div>
  )
}

/*
 * ─── Entry Sequence ───────────────────────────────────────────────
 *
 *   Splash  →  Guest Gate  →  Landing (booked | new | returning)  →  App
 *
 *  The Guest Gate is the first interactive screen after the splash
 *  dissolves. It asks how the guest would like to begin, then shows
 *  the appropriate landing page before entering the main tabbed app.
 * ─────────────────────────────────────────────────────────────────── */

/** Inner shell — orchestrates the entry sequence and the main app. */
function AppShell({ initialGuestType }: { initialGuestType?: GuestType | null }) {
  const { jetLag, jumpTo } = useArden()
  const [splashDone, setSplashDone] = React.useState(false)
  const [guestType, setGuestType] = React.useState<GuestType | null>(
    initialGuestType ?? null,
  )
  const [landingDone, setLandingDone] = React.useState(false)
  const [entryBooking, setEntryBooking] = React.useState<{
    path: BookingPath
    roomTypeId?: RoomTypeId
    amendProfile?: boolean
  } | null>(null)

  const enterArrivalProfile = React.useCallback(() => {
    jumpTo("room")
    setLandingDone(true)
  }, [jumpTo])

  const returnToStart = React.useCallback(() => {
    jumpTo("stay")
    setEntryBooking(null)
    setLandingDone(false)
    setGuestType(null)
  }, [jumpTo])

  const finishEntryBooking = React.useCallback((destination: "stay" | "room") => {
    setEntryBooking(null)
    setLandingDone(true)
    jumpTo(destination)
  }, [jumpTo])

  return (
    <>
      {/* 1. Splash — the elevation drawing dissolves */}
      <AnimatePresence>
        {!splashDone && (
          <SplashScreen key="splash" onComplete={() => setSplashDone(true)} />
        )}
      </AnimatePresence>

      {/* 2. Guest Gate — choose your path */}
      <AnimatePresence>
        {splashDone && !guestType && (
          <GuestGate key="gate" onChoose={(type) => setGuestType(type)} />
        )}
      </AnimatePresence>

      {/* 3. Landing page — tailored to the guest type */}
      <AnimatePresence>
        {splashDone && guestType && !landingDone && (
          <React.Fragment key="landing">
            {guestType === "booked" && (
              <LandingBooked
                onEnterApp={() => setLandingDone(true)}
                onEnterPrelude={enterArrivalProfile}
                onHome={returnToStart}
              />
            )}
            {guestType === "new" && (
              <BookingFlow
                key="first-booking"
                initialPath="browse"
                onClose={returnToStart}
                onComplete={(destination) => {
                  setLandingDone(true)
                  jumpTo(destination)
                }}
              />
            )}
            {guestType === "returning" && (
              <LandingReturning
                onStartBooking={setEntryBooking}
                onHome={returnToStart}
              />
            )}
          </React.Fragment>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {entryBooking && !landingDone ? (
          <BookingFlow
            key={`${entryBooking.path}-${entryBooking.roomTypeId ?? "choose"}`}
            initialPath={entryBooking.path}
            initialRoomTypeId={entryBooking.roomTypeId}
            onClose={() => setEntryBooking(null)}
            onComplete={finishEntryBooking}
          />
        ) : null}
      </AnimatePresence>

      {/* 4. The main app — always mounted behind the overlays so state is warm */}
      <main
        className={cn(
          "relative min-h-[100svh] w-full bg-transparent overflow-x-hidden",
          "transition-[background-color] duration-[1.2s] ease-[cubic-bezier(0.22,0.61,0.36,1)]",
          jetLag && "jet-lag",
        )}
      >
        <TopHeader onHome={returnToStart} />
        <Stage />
        <BottomNav />
      </main>
    </>
  )
}

export function ArdenApp({
  initialGuestType = null,
}: {
  initialGuestType?: GuestType | null
}) {
  return (
    <ArdenProvider>
      <AppShell initialGuestType={initialGuestType} />
    </ArdenProvider>
  )
}
