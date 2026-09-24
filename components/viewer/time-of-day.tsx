"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Time-of-day slider — controls lighting from bright morning through
 * golden hour to a warm candlelit night. Value is 0–1 where:
 *
 *   0.0  = early morning (cool bright)
 *   0.3  = midday (warm neutral)
 *   0.55 = golden hour (rich amber)
 *   0.75 = dusk (deep warm)
 *   1.0  = night (candlelit)
 */
export function TimeOfDaySlider({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const label =
    value < 0.15
      ? "Morning"
      : value < 0.4
        ? "Midday"
        : value < 0.65
          ? "Golden hour"
          : value < 0.85
            ? "Dusk"
            : "Night"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-40",
        "flex items-center gap-3 px-5 py-3",
        "rounded-full",
        "glass-warm",
        "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)]",
      )}
    >
      <Sun className="h-4 w-4 text-gold-deep shrink-0" strokeWidth={1.5} />

      <div className="flex flex-col items-center gap-1.5">
        <input
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-36 sm:w-48 accent-gold-deep h-1 cursor-pointer appearance-none rounded-full bg-tan/40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-deep [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(180,140,60,0.4)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
          aria-label="Time of day"
        />
        <span className="text-[10.5px] font-serif tracking-wider text-ink-muted">
          {label}
        </span>
      </div>

      <Moon className="h-4 w-4 text-ink-muted shrink-0" strokeWidth={1.5} />
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   Lighting presets — interpolated by the ModelViewer based on slider
   value. Each stop defines every light property. Values between stops
   are linearly blended.
   ═══════════════════════════════════════════════════════════════════════ */
export type LightingPreset = {
  /** Slider position 0–1 */
  t: number
  /** Scene background colour */
  bg: [number, number, number]
  /** Ambient light */
  ambient: { color: [number, number, number]; intensity: number }
  /** Main directional (sun) */
  sun: {
    color: [number, number, number]
    intensity: number
    position: [number, number, number]
  }
  /** Fill directional */
  fill: { color: [number, number, number]; intensity: number }
  /** HDRI environment intensity */
  envIntensity: number
}

export const lightingStops: LightingPreset[] = [
  {
    // Morning — sun low in the west, cool crisp light
    t: 0,
    bg: [1, 1, 1],
    ambient: { color: [0.92, 0.94, 1.0], intensity: 0.6 },
    sun: { color: [1.0, 0.95, 0.85], intensity: 1.3, position: [-12, 5, -4] },
    fill: { color: [0.85, 0.88, 0.95], intensity: 0.35 },
    envIntensity: 0.8,
  },
  {
    // Midday — sun nearly overhead, strong and neutral-warm
    t: 0.3,
    bg: [1, 1, 1],
    ambient: { color: [0.96, 0.94, 0.88], intensity: 0.5 },
    sun: { color: [1.0, 0.97, 0.9], intensity: 1.6, position: [-3, 16, -3] },
    fill: { color: [0.9, 0.87, 0.82], intensity: 0.3 },
    envIntensity: 0.7,
  },
  {
    // Golden hour — sun low in the east, deep amber, long shadows
    t: 0.55,
    bg: [0.99, 0.97, 0.92],
    ambient: { color: [0.95, 0.85, 0.65], intensity: 0.45 },
    sun: { color: [1.0, 0.78, 0.42], intensity: 1.8, position: [12, 4, 2] },
    fill: { color: [0.85, 0.7, 0.5], intensity: 0.3 },
    envIntensity: 0.5,
  },
  {
    // Dusk — sun at eastern horizon, almost no direct light
    t: 0.75,
    bg: [0.22, 0.18, 0.16],
    ambient: { color: [0.55, 0.4, 0.3], intensity: 0.3 },
    sun: { color: [0.95, 0.55, 0.25], intensity: 0.5, position: [12, 1, 4] },
    fill: { color: [0.4, 0.3, 0.25], intensity: 0.25 },
    envIntensity: 0.25,
  },
  {
    // Night — sun gone (below eastern horizon), only warm interior fill
    t: 1.0,
    bg: [0.08, 0.06, 0.06],
    ambient: { color: [0.4, 0.28, 0.18], intensity: 0.2 },
    sun: { color: [1.0, 0.7, 0.35], intensity: 0.0, position: [12, -4, 6] },
    fill: { color: [0.35, 0.22, 0.14], intensity: 0.15 },
    envIntensity: 0.1,
  },
]

/** Lerp between two lighting presets */
function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function interpolateLighting(t: number): LightingPreset {
  const clamped = Math.max(0, Math.min(1, t))

  // Find the two surrounding stops
  let lo = lightingStops[0]
  let hi = lightingStops[lightingStops.length - 1]
  for (let i = 0; i < lightingStops.length - 1; i++) {
    if (clamped >= lightingStops[i].t && clamped <= lightingStops[i + 1].t) {
      lo = lightingStops[i]
      hi = lightingStops[i + 1]
      break
    }
  }

  const range = hi.t - lo.t
  const local = range > 0 ? (clamped - lo.t) / range : 0

  return {
    t: clamped,
    bg: lerpColor(lo.bg, hi.bg, local),
    ambient: {
      color: lerpColor(lo.ambient.color, hi.ambient.color, local),
      intensity: lerp(lo.ambient.intensity, hi.ambient.intensity, local),
    },
    sun: {
      color: lerpColor(lo.sun.color, hi.sun.color, local),
      intensity: lerp(lo.sun.intensity, hi.sun.intensity, local),
      position: lerpColor(lo.sun.position, hi.sun.position, local),
    },
    fill: {
      color: lerpColor(lo.fill.color, hi.fill.color, local),
      intensity: lerp(lo.fill.intensity, hi.fill.intensity, local),
    },
    envIntensity: lerp(lo.envIntensity, hi.envIntensity, local),
  }
}
