"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Cloud, Feather, Layers3, Leaf, Mountain, Scale } from "lucide-react"
/* motion is retained for the IconPicker tap animations below. */
import { ChapterBlock, ChapterShell } from "./chapter-shell"
import { Segmented } from "./primitives"
import {
  duvetOptions,
  extraDuvetOptions,
  extraPillowsOptions,
  linenFabricOptions,
  mattressOptions,
  pillowFirmnessOptions,
  pillowTypeOptions,
} from "./data"
import { usePrelude } from "./prelude-context"
import { cn } from "@/lib/utils"

/**
 * The mattress and pillow rows share the same tactile IconPicker: three square
 * tiles, icon-led, collapsed into a single horizontal row so the chapter scans
 * in one glance and scrolls less. An icon carries the feel of each option at
 * a glance (a cloud for soft, a feather for down, a mountain for grounded)
 * while the label sits beneath for reading clarity.
 */

type IconComp = React.ComponentType<{ className?: string; strokeWidth?: number }>

const mattressIcons: Record<string, IconComp> = {
  cloud: Cloud,
  poised: Scale,
  grounded: Mountain,
}

const pillowIcons: Record<string, IconComp> = {
  down: Feather,
  memory: Layers3,
  hypo: Leaf,
}

export function ChapterBed() {
  const { selections, setSelection } = usePrelude()

  return (
    <ChapterShell
      kicker="Chapter One"
      title={
        <>
          The Bed,
          <br />
          <span className="italic font-light text-cream/85">set for sleep.</span>
        </>
      }
      subtitle="Choose the mattress, pillows, duvet, and linen you prefer."
      heroImage="/images/rebrand/room-classic.png"
    >
      <ChapterBlock label="Mattress">
        <IconPicker
          options={mattressOptions.map((o) => ({
            id: o.id,
            label: o.label,
            icon: mattressIcons[o.id] ?? Cloud,
          }))}
          value={selections.mattress}
          onChange={(id) => setSelection("mattress", id)}
          hint={mattressOptions.find((o) => o.id === selections.mattress)?.hint}
        />
      </ChapterBlock>

      <ChapterBlock label="Pillow">
        <IconPicker
          options={pillowTypeOptions.map((o) => ({
            id: o.id,
            label: o.label,
            icon: pillowIcons[o.id] ?? Feather,
          }))}
          value={selections.pillowType}
          onChange={(id) => setSelection("pillowType", id)}
          hint={pillowTypeOptions.find((o) => o.id === selections.pillowType)?.hint}
        />
        <div className="mt-3">
          <Segmented
            options={pillowFirmnessOptions}
            value={selections.pillowFirmness}
            onChange={(id) => setSelection("pillowFirmness", id)}
          />
        </div>
      </ChapterBlock>

      <ChapterBlock label="Duvet">
        <Segmented
          options={duvetOptions}
          value={selections.duvetWeight}
          onChange={(id) => setSelection("duvetWeight", id)}
        />
      </ChapterBlock>

      <ChapterBlock label="Extra pillows">
        <Segmented
          options={extraPillowsOptions}
          value={selections.extraPillows}
          onChange={(id) => setSelection("extraPillows", id)}
        />
      </ChapterBlock>

      <ChapterBlock label="Extra duvet">
        <Segmented
          options={extraDuvetOptions}
          value={selections.extraDuvet}
          onChange={(id) => setSelection("extraDuvet", id)}
        />
      </ChapterBlock>

      <ChapterBlock label="Linen fabric">
        <Segmented
          options={linenFabricOptions}
          value={selections.linenFabric}
          onChange={(id) => setSelection("linenFabric", id)}
        />
      </ChapterBlock>
    </ChapterShell>
  )
}

/* ——— IconPicker ———
   A three-up horizontal row of large tap targets. When an option is selected
   it lifts, warms to cream with a gold hairline, and its icon brightens to
   gold-deep. The selected option's hint appears below the row in a single
   reserved line so the layout does not shift between states. */
function IconPicker({
  options,
  value,
  onChange,
  hint,
}: {
  options: Array<{ id: string; label: string; icon: IconComp }>
  value: string | undefined
  onChange: (id: string) => void
  hint?: string
}) {
  return (
    <div>
      <div
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        role="radiogroup"
      >
        {options.map((o) => {
          const Icon = o.icon
          const selected = value === o.id
          return (
            <motion.button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.id)}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              className={cn(
                "group relative flex aspect-[5/4] flex-col items-center justify-center gap-2 rounded-[18px] p-2",
                "transition-all duration-500 ease-out",
                selected
                  ? "glass-card !border-[color:color-mix(in_oklch,var(--gold)_60%,transparent)] shadow-[0_4px_10px_-8px_color-mix(in_oklch,var(--ink)_35%,transparent)]"
                  : "glass-soft hover:!border-[color:color-mix(in_oklch,white_35%,var(--cream)_30%)]",
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-colors duration-500",
                  selected ? "text-gold-deep" : "text-ink-soft",
                )}
                strokeWidth={1.3}
              />
              <span className="px-1 text-center font-serif text-[13px] leading-tight text-ink line-clamp-2">
                {o.label}
              </span>
            </motion.button>
          )
        })}
      </div>
      {hint ? (
        <div className="mt-1.5 px-1 text-center font-serif italic text-[12.5px] text-ink-muted">
          {hint}
        </div>
      ) : null}
    </div>
  )
}
