"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

/* A quiet section heading — shared across tab screens. */
export function SectionHead({
  kicker,
  title,
  subtitle,
  className,
}: {
  kicker?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("mb-6", className)}>
      {kicker ? (
        <div className="mb-3 font-sans text-[10px] font-bold tracking-[0.24em] uppercase text-ink-muted">
          {kicker}
        </div>
      ) : null}
      <h2 className="text-display text-ink text-balance text-[26px] sm:text-[32px] leading-[1.1]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 max-w-prose font-sans text-ink-soft text-[14px] sm:text-[15px] leading-relaxed">
          {subtitle}
        </p>
      ) : null}
    </header>
  )
}

/* The golden hairline used across the app. */
export function GoldRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block h-px w-10 bg-[color:color-mix(in_oklch,var(--gold)_75%,transparent)]",
        className,
      )}
    />
  )
}

/* A warm, tactile frosted-glass card. */
export function Card({
  children,
  className,
  interactive,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  onClick?: () => void
}) {
  const Component: React.ElementType = interactive ? "button" : "div"
  return (
    <Component
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "block w-full rounded-[12px] glass-card text-left",
        "transition-all duration-500",
        interactive &&
          "hover:shadow-[0_4px_10px_-8px_color-mix(in_oklch,var(--ink)_44%,transparent)] hover:border-[color:color-mix(in_oklch,var(--gold)_46%,var(--ink)_14%)] active:scale-[0.992]",
        className,
      )}
    >
      {children}
    </Component>
  )
}

/* Gold-deep primary action button — the hotel's signature CTA.
   Gold-deep (oklch 0.5 0.12 70) carries the warm editorial tone of the
   brand; cream text on it clears WCAG AA (4.7 : 1). The hover deepens
   by mixing a touch of ink for weight. */
export const PrimaryButton = React.forwardRef<
  HTMLButtonElement,
  {
    children: React.ReactNode
    className?: string
    disabled?: boolean
    onClick?: () => void
    type?: "button" | "submit"
  }
>(function PrimaryButton({ children, className, disabled, onClick, type = "button" }, ref) {
  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
      disabled={disabled}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-[12px]",
        "min-h-12 px-5 py-3 font-sans text-[11px] font-bold uppercase tracking-[0.18em] leading-none",
        "bg-ink text-cream",
        "shadow-[0_18px_34px_-24px_color-mix(in_oklch,var(--ink)_72%,transparent)]",
        "transition-all duration-500 hover:bg-[color:color-mix(in_oklch,var(--ink)_80%,var(--terracotta)_20%)]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className,
      )}
    >
      {children}
    </motion.button>
  )
})

/* Subtle glass outline button for secondary actions. */
export function GhostButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-[10px] px-4 py-2.5",
        "font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft",
        "glass-pill",
        "hover:border-[color:color-mix(in_oklch,white_35%,var(--cream)_30%)] hover:text-ink",
        "transition-all duration-500",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}





/* Arden House brand marks. */
export function BrandMark({
  className,
  height = "h-7",
  variant = "dark",
  logo = "signature",
}: {
  className?: string
  /** Tailwind height class, e.g. "h-7", "h-10", "h-14" */
  height?: string
  /** "dark" for cream/light backgrounds, "light" for overlaying images */
  variant?: "dark" | "light"
  /** "signature" = script wordmark, "formal" = bold capitals */
  logo?: "signature" | "formal"
}) {
  const src =
    logo === "formal" ? "/brand/arden-formal.svg" : "/brand/arden-wordmark.svg"
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img


      src={src}
      alt="Arden House"
      className={cn(
        height,
        "w-auto object-contain",
        variant === "dark" ? "brightness-0 opacity-80" : "drop-shadow-[0_1px_8px_rgba(0,0,0,0.3)]",
        className,
      )}
    />
  )
}

/* The building elevation — architectural storytelling asset. */
export function ElevationMark({
  className,
  height = "h-24",
  variant = "dark",
}: {
  className?: string
  height?: string
  variant?: "dark" | "light"
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/arden-elevation.svg"
      alt="Arden House — building elevation"
      className={cn(
        height,
        "w-auto object-contain",
        variant === "dark"
          ? "brightness-0"
          : "brightness-0 invert opacity-40",
        className,
      )}
    />
  )
}

/* A gentle inline meter for occupancy % */
export function OccupancyMeter({ value }: { value: number }) {
  const tone = value > 80 ? "high" : value > 50 ? "med" : "low"
  const color =
    tone === "high"
      ? "color-mix(in oklch, var(--terracotta) 70%, transparent)"
      : tone === "med"
        ? "color-mix(in oklch, var(--gold) 80%, transparent)"
        : "color-mix(in oklch, var(--gold-deep) 55%, transparent)"
  return (
    <div
      className="relative h-1 w-full overflow-hidden rounded-full bg-[color:color-mix(in_oklch,var(--ink)_8%,transparent)]"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  )
}
