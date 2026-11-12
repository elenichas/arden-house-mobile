"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { IMG, hotel, type GuestKind } from "../data"
import { ArchMark, EASE, Photo, Wordmark } from "../ui"

export function Splash({ onDone }: { onDone: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 1900)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.button
      aria-label="Skip intro"
      onClick={onDone}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="on-dark fixed inset-0 z-[var(--z-toast)] grid place-items-center bg-obsidian text-white"
    >
      <div className="flex flex-col items-center gap-5">
        <motion.svg viewBox="0 0 40 40" className="size-16" aria-hidden>
          <motion.path
            d="M10 33V18a10 10 0 0 1 20 0v15"
            fill="none"
            stroke="white"
            strokeWidth="1.6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: EASE }}
          />
          <motion.path
            d="M5 33h30"
            stroke="var(--sulphur)"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
          />
        </motion.svg>
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          className="font-display text-[40px]"
        >
          Aspra
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-[13px] text-white/70"
        >
          Milos, Greece
        </motion.span>
      </div>
    </motion.button>
  )
}

const paths: Array<{ kind: GuestKind; title: string; detail: string }> = [
  { kind: "new", title: "Plan a stay", detail: "See the suites, pick dates and shape the trip" },
  { kind: "booked", title: "I have a booking", detail: "Prepare your suite and arrival" },
  { kind: "returning", title: "I have stayed before", detail: "Your preferences and last trip are saved" },
]

export function Gate({ onChoose }: { onChoose: (k: GuestKind) => void }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="on-dark fixed inset-0 z-[var(--z-overlay)] flex w-full flex-col overflow-y-auto bg-obsidian text-white"
    >
      <Photo src={IMG.hero} alt="Aspra's white suites cut into the cliffs above a turquoise cove at sunset" className="absolute inset-0 size-full" priority />
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/35 via-transparent to-obsidian/85 lg:bg-gradient-to-r lg:from-obsidian/80 lg:via-obsidian/35 lg:to-transparent" />

      <div className="relative mx-auto flex min-h-full w-full max-w-[1200px] flex-1 flex-col px-4 pb-[max(env(safe-area-inset-bottom),18px)] pt-[max(env(safe-area-inset-top),20px)] md:px-10 md:pb-12 md:pt-8">
        <Wordmark tone="light" className="px-2" />
        <div className="flex-1" />
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          className="max-w-[560px] px-2 font-display text-[40px] leading-[0.98] md:text-[56px] lg:text-[64px]"
        >
          Seven suites in the white rock of Milos.
        </motion.h1>
        <p className="mt-3 max-w-[32ch] px-2 text-[15px] leading-relaxed text-white/90 md:max-w-[40ch] md:text-[17px]">
          This app looks after you from the day you book to long after you fly home.
        </p>

        <nav aria-label="How would you like to start?" className="mt-6 md:max-w-[480px]">
          <ul className="glass-dark divide-y divide-white/15 overflow-hidden rounded-3xl">
            {paths.map((p, i) => (
              <motion.li
                key={p.kind}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: EASE }}
              >
                <button
                  onClick={() => onChoose(p.kind)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/10"
                >
                  <span className="flex-1">
                    <span className="block text-[17px] font-semibold">{p.title}</span>
                    <span className="mt-0.5 block text-[14px] text-white/80">{p.detail}</span>
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-obsidian">
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
          <p className="mt-4 flex items-center justify-center gap-2 text-center md:justify-start md:px-2 text-[12.5px] text-white/75">
            <ArchMark className="size-4" /> {hotel.season}. Sample guests, no real bookings.
          </p>
        </nav>
      </div>
    </motion.section>
  )
}
