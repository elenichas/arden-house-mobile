"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  BedDouble,
  Wine,
  Sun,
  Coffee,
  Sparkles,
  Bath,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { touchpoints, type TouchpointId } from "./touchpoints-data"

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  "bed-double": BedDouble,
  wine: Wine,
  sun: Sun,
  coffee: Coffee,
  sparkles: Sparkles,
  bath: Bath,
}

type Props = {
  touchpointId: TouchpointId | null
  onClose: () => void
}

/**
 * A slide-up panel that shows the touchpoint details + a preview of the
 * Prelude chapter options. For now it renders a rich placeholder that
 * mirrors the structure of the mobile chapter screens. Once connected,
 * this will embed the actual <ChapterBed>, <ChapterBar>, etc.
 */
export function TouchpointPanel({ touchpointId, onClose }: Props) {
  const tp = touchpoints.find((t) => t.id === touchpointId) ?? null

  return (
    <AnimatePresence>
      {tp && (
        <>
          {/* Panel — no backdrop, the 3D scene stays fully interactive */}
          <motion.div
            key="panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 32,
              stiffness: 380,
              mass: 0.8,
            }}
            className={cn(
              "fixed bottom-0 inset-x-0 sm:inset-x-auto sm:right-4 z-50",
              "w-full sm:max-w-sm",
              "rounded-t-[24px] overflow-hidden",
              "glass-card backdrop-blur-2xl",
              "shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.12)]",
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-tan" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-2 pb-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = iconMap[tp.icon] ?? Sparkles
                  return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                      <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.4} />
                    </div>
                  )
                })()}
                <div>
                  <h2 className="font-serif text-[18px] text-ink">
                    {tp.label}
                  </h2>
                  <p className="mt-0.5 text-[12px] text-ink-muted leading-relaxed max-w-[260px]">
                    {tp.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  "bg-beige hover:bg-tan transition-colors duration-300",
                )}
              >
                <X className="h-4 w-4 text-ink-soft" />
              </button>
            </div>

            {/* Body — chapter option preview */}
            <div className="px-6 pb-8 space-y-3">
              {getPreviewItems(tp.id).map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-[14px]",
                    "glass-soft",
                    "hover:bg-beige/60 transition-colors duration-300",
                    "cursor-pointer group",
                  )}
                >
                  <div>
                    <p className="font-serif text-[14px] text-ink">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">
                      {item.hint}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 text-ink-muted/40 group-hover:text-ink-soft transition-colors"
                    strokeWidth={1.5}
                  />
                </div>
              ))}

              {/* CTA */}
              <button
                type="button"
                className={cn(
                  "w-full mt-4 py-3.5 rounded-[14px]",
                  "bg-terracotta hover:bg-terracotta/90 transition-colors duration-300",
                  "font-serif text-[14px] tracking-wide text-cream",
                )}
              >
                Customise in Prelude
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Preview items per touchpoint ────────────────────────────────────── */
type PreviewItem = { label: string; hint: string }

function getPreviewItems(id: TouchpointId): PreviewItem[] {
  const map: Record<TouchpointId, PreviewItem[]> = {
    bed: [
      { label: "Mattress", hint: "Cloud-soft · Perfectly poised · Grounded" },
      { label: "Pillows", hint: "Hungarian down · Memory foam · Hypoallergenic" },
      { label: "Duvet weight", hint: "Light · Medium · Cocoon" },
      { label: "Linen fabric", hint: "Cotton · Linen · Silk" },
    ],
    bar: [
      { label: "Welcome drink", hint: "Champagne · Signature cocktail · Fresh juice" },
      { label: "Minibar collection", hint: "The Nightcap · The Refresher · The Celebration" },
      { label: "Dietary needs", hint: "Alcohol-free · Dairy-free · Vegan · Gluten-free" },
    ],
    atmosphere: [
      { label: "Scent", hint: "Mediterranean Garden · Warm Library · Ocean Mist" },
      { label: "Lighting", hint: "Warm and dim · Bright and airy · Candlelit" },
      { label: "Temperature", hint: "Cool · Neutral · Warm" },
      { label: "Music", hint: "Soft jazz · Classical calm · Bossa nova · Silence" },
    ],
    morning: [
      { label: "Breakfast time", hint: "Early · Unhurried · Coffee first" },
      { label: "Location", hint: "In your suite · The restaurant · The terrace" },
      { label: "Style", hint: "Continental · Full · Light" },
      { label: "Coffee", hint: "Espresso · Flat white · Americano · Cappuccino" },
    ],
    moments: [
      { label: "Spa", hint: "Deep tissue · Aromatherapy · Stretch & release" },
      { label: "Dining", hint: "In your suite · Restaurant · Late-night bites" },
      { label: "Activities", hint: "Gym · Pool · Meditation · Running route" },
    ],
    bathroom: [
      { label: "Towels", hint: "Heated towel rail · Extra bath sheets" },
      { label: "Bath amenities", hint: "Luxury toiletries · Bath salts · Essential oils" },
      { label: "Robes", hint: "Cotton waffle · Silk · Terry cloth" },
    ],
  }
  return map[id] ?? []
}
