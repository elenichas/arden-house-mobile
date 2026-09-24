"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

/* ——— Kicker ——— */
export function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block text-[11px] tracking-[0.28em] uppercase text-ink-muted font-sans font-medium",
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ——— Display heading ——— */
export function Display({
  children,
  as: As = "h1",
  className,
}: {
  children: React.ReactNode
  as?: React.ElementType
  className?: string
}) {
  return React.createElement(
    As,
    {
      className: cn(
        "text-display text-ink text-balance",
        "text-4xl sm:text-5xl md:text-6xl",
        className,
      ),
    },
    children,
  )
}

/* ——— Gold hairline ——— */
export function GoldRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block h-px w-10 bg-[color:color-mix(in_oklch,var(--gold)_80%,transparent)]",
        className,
      )}
    />
  )
}

/* ——— Option Card — the reusable tactile selector ——— */
type OptionCardProps = {
  selected: boolean
  onSelect: () => void
  label: string
  hint?: string
  image?: string
  size?: "sm" | "md" | "lg"
  children?: React.ReactNode
  className?: string
  orientation?: "vertical" | "horizontal"
}

export function OptionCard({
  selected,
  onSelect,
  label,
  hint,
  image,
  size = "md",
  className,
  orientation = "vertical",
}: OptionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
      aria-pressed={selected}
      className={cn(
        "group relative w-full text-left rounded-[18px] overflow-hidden",
        "transition-all duration-700 ease-out",
        selected
          ? "glass-card ring-gold !border-[color:color-mix(in_oklch,var(--gold)_50%,transparent)]"
          : "glass-soft",
        orientation === "horizontal" ? "flex items-center gap-4 p-4" : "flex flex-col",
        className,
      )}
    >
      {image && orientation === "vertical" ? (
        <div
          className={cn(
            "relative w-full overflow-hidden",
            size === "sm" ? "aspect-[4/3]" : size === "lg" ? "aspect-[4/5]" : "aspect-[5/4]",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image || "/placeholder.svg"}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              "transition-transform duration-[1200ms] ease-out",
              "group-hover:scale-[1.03]",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
        </div>
      ) : null}

      {image && orientation === "horizontal" ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}

      <div className={cn(orientation === "vertical" ? "p-4" : "flex-1")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-serif text-base md:text-[17px] leading-tight text-ink">
              {label}
            </div>
            {hint ? (
              <div className="mt-1 text-[12px] leading-snug text-ink-muted">{hint}</div>
            ) : null}
          </div>
          <SelectionMark selected={selected} />
        </div>
      </div>
    </motion.button>
  )
}

/* ——— Segmented — a compact row for short, single-word choices ——— */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  columns,
}: {
  options: { id: T; label: string }[]
  value: T | undefined
  onChange: (id: T) => void
  columns?: number
}) {
  const cols = columns ?? options.length
  return (
    <div
      className={cn(
        "grid gap-2 rounded-[16px] glass-soft p-1.5",
      )}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      role="radiogroup"
    >
      {options.map((o) => {
        const selected = value === o.id
        return (
          <motion.button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.id)}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className={cn(
              "relative rounded-[9px] px-3 py-2.5 text-center transition-all duration-500",
              "font-serif text-[15px] leading-tight",
              selected
                ? "glass-card text-ink ring-1 ring-inset ring-[color:color-mix(in_oklch,var(--gold)_60%,transparent)]"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {o.label}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ——— Small selection indicator — muted gold, whispered ——— */
export function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <motion.span
      aria-hidden
      initial={false}
      animate={{
        scale: selected ? 1 : 0.85,
        opacity: selected ? 1 : 0.35,
      }}
      transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
        "border transition-colors duration-500",
        selected
          ? "border-[color:color-mix(in_oklch,var(--gold)_70%,transparent)] bg-[color:color-mix(in_oklch,var(--gold)_14%,var(--cream-soft))]"
          : "border-[color:color-mix(in_oklch,var(--ink)_15%,transparent)] bg-transparent",
      )}
    >
      <Check
        className={cn(
          "h-3.5 w-3.5 transition-opacity duration-500",
          selected ? "opacity-100 text-gold-deep" : "opacity-0",
        )}
        strokeWidth={1.75}
      />
    </motion.span>
  )
}

/* ——— Pill chip used for multi-select (dietary, activities) ——— */
export function Chip({
  selected,
  onToggle,
  children,
}: {
  selected: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "relative rounded-full px-4 py-2 text-sm font-sans",
        "transition-all duration-500 ease-out",
        selected
          ? "text-ink glass-pill !border-[color:color-mix(in_oklch,var(--gold)_60%,transparent)]"
          : "text-ink-soft glass-pill hover:!border-[color:color-mix(in_oklch,white_30%,var(--cream)_25%)]",
      )}
    >
      {children}
    </button>
  )
}

/* ——— Concierge primary button ———
   This is the primary CTA for the Prelude flow. It mirrors the arden
   `PrimaryButton` exactly (serif 17 gold-deep pill with the same shadow
   and padding), so the two halves of the product feel like one voice. The
   `ghost` variant is a quiet sibling: outlined, sans-13, for secondary
   actions. Both pick up the same tap animation. */
export function ConciergeButton({
  children,
  onClick,
  variant = "primary",
  className,
  disabled,
  type = "button",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "ghost"
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
}) {
  const isPrimary = variant === "primary"
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full",
        "transition-all duration-500 ease-out",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        isPrimary
          ? [
              // Matches arden PrimaryButton verbatim for visual consistency
              "px-6 py-3.5 font-serif text-[17px] leading-none",
              "bg-gold-deep text-cream",
              "shadow-[0_4px_10px_-8px_color-mix(in_oklch,var(--gold-deep)_50%,transparent)]",
              "hover:bg-[color:color-mix(in_oklch,var(--gold-deep)_82%,var(--ink)_18%)]",
            ]
          : [
              "px-5 py-2.5 font-sans text-[13px]",
              "glass-pill",
              "text-ink-soft hover:text-ink",
              "hover:!border-[color:color-mix(in_oklch,white_35%,var(--cream)_30%)]",
            ],
        className,
      )}
    >
      {children}
    </motion.button>
  )
}

/* ——— Slow, reveal-from-below animation ——— */
export const slowRise = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.9, ease: [0.22, 0.61, 0.36, 1] as const },
}

export const slowFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.9, ease: [0.22, 0.61, 0.36, 1] as const },
}
