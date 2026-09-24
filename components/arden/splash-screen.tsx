"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Splash screen — the building's elevation drawing fades in over a deep
 * ink background. The guest taps anywhere to enter the app. The
 * signature wordmark sits beneath the drawing so the
 * guest's very first impression pairs architecture with name.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = React.useState(true)

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.button
          type="button"
          aria-label="Enter Arden House"
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-cream text-ink"
          onClick={() => setVisible(false)}
        >
          {/* Subtle radial glow behind the elevation — warm gold, very faint */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 48%, var(--gold), transparent 70%)",
            }}
          />

          {/* Elevation drawing — the building façade */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/arden-elevation.svg"
              alt="Arden House — building elevation"
              className="h-[28svh] max-h-[260px] w-auto object-contain brightness-0 opacity-70"
            />
          </motion.div>

          {/* Signature wordmark beneath the building */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative z-10 mt-8"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/arden-wordmark.svg"
              alt="Arden House"
              className="h-18 w-auto object-contain brightness-0"
            />
          </motion.div>

          {/* Tagline — whispered */}
          <motion.p
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative z-10 mt-4 max-w-[260px] text-center font-serif italic text-[16px] tracking-wide leading-relaxed text-ink-soft"
          >
            Quiet rooms, easy arrivals, thoughtful service.
          </motion.p>
          <motion.span
            initial={{ opacity: 0.65 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="relative z-10 mt-8 inline-flex min-h-11 items-center justify-center rounded-[10px] bg-ink px-6 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-cream"
          >
            Enter the hotel
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
