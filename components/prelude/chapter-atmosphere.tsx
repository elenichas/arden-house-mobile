"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChapterBlock, ChapterShell } from "./chapter-shell"
import { OptionCard, SelectionMark } from "./primitives"
import { flowerOptions, lightingOptions, musicOptions, scentOptions } from "./data"
import { usePrelude } from "./prelude-context"
import { cn } from "@/lib/utils"
import { TEMP_DEFAULT, TEMP_MAX, TEMP_MIN, TemperatureDial } from "./temperature-dial"

/* Subtle atmosphere shift driven by scent + lighting choices. */
function lightingAmbience(lighting?: string): {
  gradient: string
  opacity: number
  mixBlend: "normal" | "multiply" | "screen" | "soft-light"
} {
  switch (lighting) {
    case "warm-dim":
      return {
        gradient:
          "radial-gradient(ellipse 160% 120% at 50% 30%, oklch(0.82 0.1 60 / 0.6) 0%, oklch(0.35 0.07 48 / 0.4) 50%, oklch(0.18 0.04 42 / 0.5) 100%)",
        opacity: 1,
        mixBlend: "multiply",
      }
    case "bright-airy":
      return {
        gradient:
          "linear-gradient(175deg, oklch(0.99 0.015 90 / 0.7) 0%, oklch(0.97 0.02 85 / 0.5) 35%, oklch(0.96 0.01 80 / 0.15) 70%, transparent 100%)",
        opacity: 1,
        mixBlend: "screen",
      }
    case "candlelit":
      return {
        gradient:
          "radial-gradient(ellipse 70% 90% at 50% 65%, oklch(0.75 0.14 58 / 0.55) 0%, oklch(0.4 0.1 48 / 0.4) 35%, oklch(0.12 0.05 38 / 0.55) 100%)",
        opacity: 1,
        mixBlend: "multiply",
      }
    default:
      return { gradient: "none", opacity: 0, mixBlend: "normal" }
  }
}

function tintFor(scent?: string, dark = false) {
  if (dark) {
    switch (scent) {
      case "mediterranean":
        return { a: "oklch(0.20 0.03 90)", b: "oklch(0.16 0.015 78)" }
      case "library":
        return { a: "oklch(0.19 0.03 55)", b: "oklch(0.16 0.02 60)" }
      case "ocean":
        return { a: "oklch(0.20 0.015 85)", b: "oklch(0.16 0.01 80)" }
      case "lavender":
        return { a: "oklch(0.19 0.025 70)", b: "oklch(0.16 0.015 75)" }
      default:
        return { a: "oklch(0.17 0.012 55)", b: "oklch(0.16 0.012 55)" }
    }
  }
  switch (scent) {
    case "mediterranean":
      return { a: "oklch(0.93 0.04 90)", b: "oklch(0.96 0.015 78)" }
    case "library":
      return { a: "oklch(0.9 0.05 55)", b: "oklch(0.95 0.02 60)" }
    case "ocean":
      return { a: "oklch(0.94 0.018 85)", b: "oklch(0.97 0.01 80)" }
    case "lavender":
      return { a: "oklch(0.91 0.035 70)", b: "oklch(0.96 0.018 75)" }
    default:
      return { a: "oklch(0.955 0.018 78)", b: "oklch(0.965 0.015 78)" }
  }
}

/** The temperature preference is now a numeric Celsius value stored as a
 *  string on the selections object (kept as string for consistency with the
 *  rest of the selections map). Default sits in the middle of the range. */
function parseTemp(v: string | undefined): number {
  if (!v) return TEMP_DEFAULT
  const n = Number.parseInt(v, 10)
  if (Number.isNaN(n)) return TEMP_DEFAULT
  return Math.min(TEMP_MAX, Math.max(TEMP_MIN, n))
}

export function ChapterAtmosphere() {
  const { selections, setSelection, jetLag } = usePrelude()
  const tint = tintFor(selections.scent, jetLag)
  const ambience = lightingAmbience(selections.lighting)
  const temperature = parseTemp(selections.temperature)

  return (
    <div className="relative">
      <AnimatePresence>
        <motion.div
          key={`${selections.scent ?? "base"}-${selections.lighting ?? "base"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background: `radial-gradient(1200px 800px at 70% -10%, ${tint.a}, ${tint.b} 65%)`,
          }}
        />
      </AnimatePresence>

      {/* Lighting ambience overlay — a second layer that simulates the
          chosen lighting mood across the whole viewport. */}
      <AnimatePresence mode="wait">
        {selections.lighting && (
          <motion.div
            key={selections.lighting}
            initial={{ opacity: 0 }}
            animate={{ opacity: ambience.opacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 0.61, 0.36, 1] }}
            className="pointer-events-none fixed inset-0 -z-[5]"
            style={{
              background: ambience.gradient,
              mixBlendMode: ambience.mixBlend,
            }}
          />
        )}
      </AnimatePresence>

      <ChapterShell
        kicker="Chapter Three"
        title={
          <>
            Your Atmosphere,
            <br />
            <span className="italic font-light text-ink-soft">ready when you arrive.</span>
          </>
        }
        subtitle="Set the scent, lighting, temperature, music, and flowers for arrival."
      >
        <ChapterBlock label="Room scent">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {scentOptions.map((s) => (
              <OptionCard
                key={s.id}
                selected={selections.scent === s.id}
                onSelect={() => setSelection("scent", s.id)}
                label={s.label}
                hint={s.description}
                image={s.image}
                size="sm"
              />
            ))}
          </div>
        </ChapterBlock>

        <ChapterBlock label="Lighting on arrival">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {lightingOptions.map((o) => (
              <LightingCard
                key={o.id}
                id={o.id}
                label={o.label}
                hint={o.hint}
                selected={selections.lighting === o.id}
                onSelect={() => setSelection("lighting", o.id)}
              />
            ))}
          </div>
        </ChapterBlock>

        <ChapterBlock label="Temperature">
          <div className="relative flex flex-col items-center rounded-[18px] py-6">
            <TemperatureDial
              value={temperature}
              onChange={(v) => setSelection("temperature", String(v))}
            />
            <p className="mt-5 max-w-xs text-center font-serif italic text-[13.5px] leading-snug text-ink-soft">
              Set your preferred room temperature. We will prepare the room before you arrive
              and keep it close to this setting overnight.
            </p>
          </div>
        </ChapterBlock>

        <ChapterBlock label="Music on arrival">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3">
            {musicOptions.map((o) => (
              <OptionCard
                key={o.id}
                orientation="horizontal"
                selected={selections.music === o.id}
                onSelect={() => setSelection("music", o.id)}
                label={o.label}
                hint={o.hint}
              />
            ))}
          </div>
        </ChapterBlock>

        <ChapterBlock label="Flowers">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {flowerOptions.map((o) => (
              <OptionCard
                key={o.id}
                orientation="horizontal"
                selected={selections.flowers === o.id}
                onSelect={() => setSelection("flowers", o.id)}
                label={o.label}
                hint={o.hint}
              />
            ))}
          </div>
        </ChapterBlock>
      </ChapterShell>
    </div>
  )
}

/* Lighting card — uses the same selection language as OptionCard
 * (ring-gold border, gold-tinted bg, SelectionMark circle) so the
 * whole Atmosphere chapter feels visually consistent. */
function LightingCard({
  id,
  label,
  hint,
  selected,
  onSelect,
}: {
  id: string
  label: string
  hint?: string
  selected: boolean
  onSelect: () => void
}) {
  const sceneClass =
    id === "warm-dim"
      ? "from-[oklch(0.5_0.07_55)] via-[oklch(0.7_0.08_55)] to-[oklch(0.88_0.04_70)]"
      : id === "bright-airy"
        ? "from-[oklch(0.95_0.02_85)] via-[oklch(0.92_0.02_80)] to-[oklch(0.85_0.03_75)]"
        : "from-[oklch(0.35_0.05_45)] via-[oklch(0.55_0.1_50)] to-[oklch(0.75_0.09_60)]"

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
      aria-pressed={selected}
      className={cn(
        "group relative w-full flex flex-col text-left rounded-[18px] overflow-hidden",
        "transition-all duration-700 ease-out",
        selected ? "glass-card ring-gold" : "glass-soft",
      )}
    >
      {/* Scene gradient preview */}
      <div className={cn("relative aspect-[5/4] w-full bg-gradient-to-br", sceneClass)}>
        {id === "candlelit" && (
          <>
            <span
              className={cn(
                "absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.9_0.1_70)] blur-2xl",
                selected ? "opacity-95" : "opacity-70",
              )}
            />
            <span className="absolute left-1/2 top-1/2 h-3 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.95_0.09_75)]" />
          </>
        )}
        {id === "warm-dim" && (
          <span
            className={cn(
              "absolute right-1/4 top-1/4 h-28 w-28 rounded-full bg-[oklch(0.9_0.08_70)] blur-3xl transition-opacity duration-700",
              selected ? "opacity-90" : "opacity-55",
            )}
          />
        )}
        {id === "bright-airy" && (
          <span
            className={cn(
              "absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-[oklch(0.98_0.01_85)] to-transparent transition-opacity duration-700",
              selected ? "opacity-95" : "opacity-70",
            )}
          />
        )}
      </div>

      {/* Label area — matches OptionCard layout */}
      <div className={cn("p-3 transition-colors duration-700",
        selected
          ? ""
          : "",
      )}>
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <div className="font-serif text-[15px] leading-tight text-ink">{label}</div>
            {hint ? (
              <div className="mt-0.5 text-[11px] leading-snug text-ink-muted line-clamp-2">
                {hint}
              </div>
            ) : null}
          </div>
          <SelectionMark selected={selected} />
        </div>
      </div>
    </motion.button>
  )
}
