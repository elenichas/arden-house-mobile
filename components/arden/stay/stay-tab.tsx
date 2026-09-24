"use client"

import * as React from "react"
import { AnimatePresence } from "framer-motion"
import { StayHome } from "./stay-home"
import { BookingFlow } from "./booking-flow"

export function StayTab() {
  const [booking, setBooking] = React.useState(false)

  return (
    <>
      <StayHome onOpenBooking={() => setBooking(true)} />
      <AnimatePresence>
        {booking ? <BookingFlow key="booking" onClose={() => setBooking(false)} /> : null}
      </AnimatePresence>
    </>
  )
}
