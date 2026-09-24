"use client"

import { motion } from "framer-motion"
import { BedDouble, ConciergeBell, KeyRound, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useArden } from "./arden-context"
import type { TabId } from "./types"

const tabs: Array<{
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}> = [
  { id: "stay", label: "Stay", icon: KeyRound },
  { id: "room", label: "Room", icon: BedDouble },
  { id: "concierge", label: "Service", icon: ConciergeBell },
  { id: "assistant", label: "Assistant", icon: Sparkles },
]

/**
 * The bottom navigation uses a frosted glass treatment — a translucent
 * backdrop that lets the page content breathe beneath it. The active tab
 * is marked by a short gold pill on the top edge.
 */
export function BottomNav() {
  const { tab, setTab } = useArden()

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed z-30",
        "left-4 right-4 bottom-[calc(10px+env(safe-area-inset-bottom))]",
        "mx-auto max-w-md",
        "rounded-[14px] border border-cream/12 bg-ink/88 shadow-[0_5px_12px_-9px_rgba(0,0,0,0.82)] backdrop-blur-xl",
      )}
    >
      <ul className="grid grid-cols-4">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <li key={id} className="relative">
              <button
                type="button"
                onClick={() => setTab(id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex w-full flex-col items-center justify-center gap-1.5 py-3",
                  "transition-colors duration-300",
                  active ? "text-white" : "text-white/60 hover:text-white/85",
                )}
              >
                {/* Active mark — short gold pill that sits on top of the
                    hairline divider so it punctuates rather than competes
                    with it. Animated between tabs with a shared layoutId. */}
                {active ? (
                  <motion.span
                    layoutId="tab-indicator"
                    transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
                    aria-hidden
                    className="absolute -top-px h-[2px] w-9 rounded-full bg-terracotta-soft"
                  />
                ) : null}

                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={active ? 2 : 1.6}
                />
                <span
                  className={cn(
                    "font-sans text-[9px] font-bold uppercase leading-none tracking-[0.14em]",
                    active ? "text-cream" : "",
                  )}
                >
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
