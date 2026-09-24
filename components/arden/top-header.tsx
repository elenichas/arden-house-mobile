"use client"

import * as React from "react"
import { House } from "lucide-react"
import { cn } from "@/lib/utils"
import { useArden } from "./arden-context"
import { hotel } from "./data"
import type { TabId } from "./types"

const tabLabels: Record<TabId, string> = {
  stay: "Stay",
  room: "Room",
  concierge: "Service",
  assistant: "Help",
}

/**
 * Persistent top header — a compact hotel identity bar with section context.
 */
export function TopHeader({ onHome }: { onHome?: () => void }) {
  const { tab } = useArden()
  const overImage = tab === "stay"

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-30",
        "px-4 pt-[calc(10px+env(safe-area-inset-top))] pb-2.5 sm:px-6",
        "transition-all duration-500",
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-14 w-full max-w-xl items-center justify-between gap-2 rounded-[14px] px-2.5 sm:gap-3 sm:px-3",
          "border transition-all duration-500",
          overImage
            ? "border-white/18 bg-ink/72 text-cream shadow-[0_4px_10px_-8px_rgba(0,0,0,0.75)] backdrop-blur-xl"
            : "border-[color:color-mix(in_oklch,var(--ink)_12%,transparent)] bg-[color:color-mix(in_oklch,var(--cream-soft)_88%,transparent)] text-ink shadow-[0_4px_10px_-8px_color-mix(in_oklch,var(--ink)_42%,transparent)] backdrop-blur-xl",
        )}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span
            aria-hidden
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border font-serif text-[13px] font-bold leading-none sm:h-9 sm:w-9 sm:rounded-[10px] sm:text-[15px]",
              overImage
                ? "border-cream/28 bg-cream/10 text-cream"
                : "border-[color:color-mix(in_oklch,var(--ink)_14%,transparent)] bg-ink text-cream",
            )}
          >
            AH
          </span>
          <div className="min-w-0">
            <div
              className={cn(
                "truncate font-sans text-[12px] font-bold uppercase leading-none tracking-[0.1em] min-[361px]:text-[14px] min-[361px]:tracking-[0.14em] sm:text-[15px] sm:tracking-[0.16em]",
                overImage ? "text-cream" : "text-ink",
              )}
            >
              {hotel.name}
            </div>
            <div
              className={cn(
                "mt-1 hidden truncate font-sans text-[9px] font-semibold uppercase leading-none tracking-[0.18em] min-[361px]:block sm:text-[9.5px] sm:tracking-[0.22em]",
                overImage ? "text-cream/58" : "text-ink-muted",
              )}
            >
              City hotel
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {onHome ? (
            <button
              type="button"
              onClick={onHome}
              aria-label="Return to start"
              title="Return to start"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-[9px] border transition-all duration-300 sm:h-11 sm:w-11 sm:rounded-[10px]",
                overImage
                  ? "border-cream/18 bg-cream/8 text-cream/82 hover:bg-cream/16 hover:text-cream"
                  : "border-[color:color-mix(in_oklch,var(--ink)_12%,transparent)] bg-[color:color-mix(in_oklch,var(--cream-soft)_82%,transparent)] text-ink-soft hover:text-ink",
              )}
            >
              <House className="h-4 w-4" strokeWidth={1.6} />
            </button>
          ) : null}

          <div
            className={cn(
              "rounded-[9px] border px-2.5 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.18em]",
              overImage
                ? "border-cream/18 bg-cream/8 text-cream/82"
                : "border-[color:color-mix(in_oklch,var(--gold)_45%,transparent)] bg-[color:color-mix(in_oklch,var(--gold)_13%,var(--cream-soft))] text-gold-deep",
            )}
          >
            {tabLabels[tab]}
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * The height the TopHeader occupies so tab content can pad itself below
 * it. Exported as a CSS-compatible value string for use in className or
 * inline styles. Accounts for safe-area insets on notched devices.
 */
export const TOP_HEADER_HEIGHT = "calc(86px + env(safe-area-inset-top))"
