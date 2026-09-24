"use client"

/**
 * TemperatureDial — a compact arc dial reading in Celsius.
 *
 * Visual language (matching the agreed reference sketch):
 *   • A thin 270° arc sweeping from 7-o'clock to 5-o'clock, drawn in SVG.
 *   • The elapsed portion of the arc is painted in warm amber; the
 *     remaining portion sits in a muted neutral.
 *   • A small row of radial tick marks sits just inside the arc, one per
 *     integer degree, giving the instrument a measured, mechanical quality.
 *   • A round amber thumb knob sits at the tip of the progress arc — this
 *     is the drag handle.
 *   • The centre stacks the numeric value, "°C", and a quiet "ROOM TEMP"
 *     label.
 *   • Min/max markers (17°, 26°) sit at the two ends of the arc.
 *   • Beneath the dial, a minus / descriptor / plus row offers a discreet
 *     stepper affordance that never requires precision pointing.
 *
 * Interaction:
 *   • Drag the thumb (or press-and-drag anywhere on the dial) to rotate.
 *   • Keyboard ←/↓ and →/↑ nudge by 1°C; Home/End jump to the range ends.
 *   • The − and + buttons step by 1°C.
 */

import * as React from "react"
import { motion } from "framer-motion"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export const TEMP_MIN = 17
export const TEMP_MAX = 26
export const TEMP_DEFAULT = 21

/* ——— Arc geometry ——— */
/** Dial viewBox square. */
const SIZE = 200
const CENTER = SIZE / 2
/** Arc radius. Chosen so ticks fit inside and min/max labels can hang outside. */
const RADIUS = 76
/** Total sweep — 270°, leaving a 90° dead zone at the bottom. */
const SWEEP = 270
/** Angle of the minimum value, measured from 12-o'clock, clockwise positive.
 *  -135° puts the start at the 7-o'clock position. */
const START_ANGLE = -135
const END_ANGLE = START_ANGLE + SWEEP
const DEG_PER_UNIT = SWEEP / (TEMP_MAX - TEMP_MIN)

function valueToAngle(v: number) {
  const clamped = Math.min(TEMP_MAX, Math.max(TEMP_MIN, v))
  return START_ANGLE + (clamped - TEMP_MIN) * DEG_PER_UNIT
}

/** Convert an angle (measured from 12-o'clock, clockwise) into an SVG (x, y).
 *  SVG's own 0° points at 3-o'clock and increases clockwise, so we subtract
 *  90° to align our "0 is up" convention with SVG space. */
function polar(angleDeg: number, radius = RADIUS) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

/** Build an SVG arc path string between two angles at a given radius.
 *  Always swept clockwise (`sweepFlag = 1`) so the progress ring draws in
 *  the same direction a right-handed person would rotate a physical dial. */
function arcPath(fromDeg: number, toDeg: number, radius = RADIUS) {
  const a = polar(fromDeg, radius)
  const b = polar(toDeg, radius)
  const largeArc = toDeg - fromDeg > 180 ? 1 : 0
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${largeArc} 1 ${b.x} ${b.y}`
}

/** Convert a pointer position relative to the dial centre into a snapped
 *  integer temperature value. */
function pointerToValue(dx: number, dy: number): number {
  const rad = Math.atan2(dx, -dy)
  let deg = (rad * 180) / Math.PI
  // Clamp to the usable arc. Points in the bottom 90° dead zone get pinned
  // to whichever end of the arc they're closer to.
  if (deg < START_ANGLE) {
    // In the lower-left quadrant below the arc's 7-o'clock end
    deg = deg < (START_ANGLE + END_ANGLE) / 2 - 180 ? END_ANGLE : START_ANGLE
  } else if (deg > END_ANGLE) {
    deg = END_ANGLE
  }
  const value = TEMP_MIN + (deg - START_ANGLE) / DEG_PER_UNIT
  return Math.round(Math.min(TEMP_MAX, Math.max(TEMP_MIN, value)))
}

export function TemperatureDial({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = React.useState(false)

  const commit = React.useCallback(
    (clientX: number, clientY: number) => {
      const el = wrapRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const next = pointerToValue(clientX - cx, clientY - cy)
      if (next !== value) onChange(next)
    },
    [onChange, value],
  )

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setDragging(true)
    commit(e.clientX, e.clientY)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    commit(e.clientX, e.clientY)
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
    setDragging(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next: number
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = Math.min(TEMP_MAX, value + 1)
        break
      case "ArrowLeft":
      case "ArrowDown":
        next = Math.max(TEMP_MIN, value - 1)
        break
      case "Home":
        next = TEMP_MIN
        break
      case "End":
        next = TEMP_MAX
        break
      default:
        return
    }
    e.preventDefault()
    if (next !== value) onChange(next)
  }

  const valueAngle = valueToAngle(value)
  const thumb = polar(valueAngle)
  const minLabel = polar(START_ANGLE, RADIUS + 16)
  const maxLabel = polar(END_ANGLE, RADIUS + 16)
  const descriptor = temperatureDescriptor(value)

  const stepDown = () => {
    if (value > TEMP_MIN) onChange(value - 1)
  }
  const stepUp = () => {
    if (value < TEMP_MAX) onChange(value + 1)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Dial */}
      <div
        ref={wrapRef}
        role="slider"
        tabIndex={0}
        aria-label="Room temperature"
        aria-valuemin={TEMP_MIN}
        aria-valuemax={TEMP_MAX}
        aria-valuenow={value}
        aria-valuetext={`${value} degrees Celsius, ${descriptor.toLowerCase()}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={cn(
          "relative select-none touch-none outline-none",
          // Focus ring pattern consistent with the rest of the app
          "focus-visible:[&_.dial-focus]:opacity-100",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{ width: 200, height: 200 }}
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          className="absolute inset-0"
          aria-hidden
        >
          {/* Background track — the full 270° arc in a muted neutral. */}
          <path
            d={arcPath(START_ANGLE, END_ANGLE)}
            fill="none"
            stroke="color-mix(in oklch, var(--ink) 12%, transparent)"
            strokeWidth={7}
            strokeLinecap="round"
          />

          {/* Progress — from start to current value, painted warm. */}
          <path
            d={arcPath(START_ANGLE, valueAngle)}
            fill="none"
            stroke="url(#dialProgress)"
            strokeWidth={7}
            strokeLinecap="round"
          />

          {/* Gradient for the progress arc — warm gold deepening into terracotta. */}
          <defs>
            <linearGradient id="dialProgress" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="var(--gold-deep)" />
            </linearGradient>
          </defs>

          {/* Tick ring — one small radial mark per integer, sitting just
              inside the track. Each tick is 4px long and aligned to its
              value's angle. The tick under the current value fades in with
              the progress colour, giving a subtle "you are here" cue. */}
          {Array.from({ length: TEMP_MAX - TEMP_MIN + 1 }).map((_, i) => {
            const v = TEMP_MIN + i
            const a = valueToAngle(v)
            const inner = polar(a, RADIUS - 12)
            const outer = polar(a, RADIUS - 6)
            const active = v <= value
            return (
              <line
                key={v}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={
                  active
                    ? "color-mix(in oklch, var(--gold-deep) 70%, transparent)"
                    : "color-mix(in oklch, var(--ink) 22%, transparent)"
                }
                strokeWidth={1.25}
                strokeLinecap="round"
              />
            )
          })}

          {/* Min / max numerals, hanging just outside the arc ends. */}
          <text
            x={minLabel.x}
            y={minLabel.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-muted"
            style={{
              fontSize: 11,
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.08em",
            }}
          >
            {TEMP_MIN}°
          </text>
          <text
            x={maxLabel.x}
            y={maxLabel.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-muted"
            style={{
              fontSize: 11,
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.08em",
            }}
          >
            {TEMP_MAX}°
          </text>
        </svg>

        {/* Thumb — animated round knob at the tip of the progress arc. A
            motion component so it eases between values rather than jumping. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0"
          animate={{ x: thumb.x - 11, y: thumb.y - 11 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          style={{ width: 22, height: 22 }}
        >
          <span
            className={cn(
              "block h-full w-full rounded-full",
              "bg-gold",
              "shadow-[0_2px_6px_-1px_color-mix(in_oklch,var(--ink)_30%,transparent)]",
              "ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--gold-deep)_25%,transparent)]",
            )}
          />
        </motion.div>

        {/* Centre read-out — sits in the "hole" of the dial. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <span className="font-serif text-[44px] leading-none text-ink tabular-nums">
              {value}
            </span>
            <span className="ml-1 font-serif text-[15px] leading-none text-ink-soft">
              °C
            </span>
          </div>
          <span className="mt-1.5 font-sans text-[9.5px] uppercase tracking-[0.28em] text-ink-muted">
            Room temp
          </span>
        </div>
      </div>

      {/* Stepper row — minus, descriptor, plus. The two circular buttons are
          quiet outlined pills that echo the thumb; between them, the
          descriptor reads as a cursive label. */}
      <div className="flex items-center gap-4">
        <StepButton label="Decrease temperature" onClick={stepDown} disabled={value <= TEMP_MIN}>
          <Minus className="h-3.5 w-3.5" strokeWidth={1.75} />
        </StepButton>
        <span className="min-w-[84px] text-center font-serif italic text-[15px] text-ink">
          {descriptor}
        </span>
        <StepButton label="Increase temperature" onClick={stepUp} disabled={value >= TEMP_MAX}>
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
        </StepButton>
      </div>
    </div>
  )
}

/** Quiet outlined circular button used for the ± stepper. Shares the same
 *  ring-and-ink language as other ghost affordances in the app. */
function StepButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.92 }}
      transition={{ duration: 0.2 }}
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-ink",
        "bg-transparent ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--ink)_18%,transparent)]",
        "transition-colors duration-300 hover:ring-[color:color-mix(in_oklch,var(--ink)_32%,transparent)] hover:text-ink",
        "disabled:opacity-35 disabled:cursor-not-allowed",
      )}
    >
      {children}
    </motion.button>
  )
}

function temperatureDescriptor(v: number): string {
  if (v <= 18) return "Crisp"
  if (v <= 20) return "Cool"
  if (v <= 22) return "Neutral"
  if (v <= 24) return "Warm"
  return "Enveloping"
}
