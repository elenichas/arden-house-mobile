"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Check, Minus, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

export const EASE = [0.22, 1, 0.36, 1] as const

/* ─── Wordmark ──────────────────────────────────────────────── */

export function ArchMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("size-7", className)}>
      <path d="M10 33V18a10 10 0 0 1 20 0v15" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M5 33h30" stroke="var(--sea)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M15 28h10" stroke="var(--sea-light)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function Wordmark({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2",
        tone === "light" ? "text-white" : "text-ink",
        className,
      )}
    >
      <ArchMark className="size-6" />
      <span className="font-display text-[22px] leading-none">Aspra</span>
    </span>
  )
}

/* ─── Buttons ───────────────────────────────────────────────── */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "dark" | "light" | "outline" | "ghost" | "sulphur"
  size?: "md" | "lg" | "sm"
  block?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", block, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,transform,opacity] duration-200 active:scale-[0.98] disabled:opacity-45 disabled:active:scale-100",
        size === "lg" && "h-14 px-7 text-[16px]",
        size === "md" && "h-12 px-5 text-[15px]",
        size === "sm" && "h-9 px-4 text-[14px]",
        block && "w-full",
        variant === "primary" && "bg-ink text-white hover:bg-obsidian-3",
        variant === "dark" && "bg-obsidian text-white hover:bg-obsidian-2",
        variant === "light" && "bg-white text-ink hover:bg-chalk-2",
        variant === "sulphur" && "bg-sea text-white hover:bg-sea-deep",
        variant === "outline" && "border border-white/80 bg-white/55 text-ink backdrop-blur-md hover:bg-white/85",
        variant === "ghost" && "bg-transparent text-ink hover:bg-ink/5",
        className,
      )}
      {...props}
    />
  )
})

export function IconButton({
  label,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full transition-colors active:scale-95",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* ─── Photo ─────────────────────────────────────────────────── */

export function Photo({
  src,
  alt,
  className,
  priority,
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("bg-sea-wash object-cover", className)}
    />
  )
}

/* ─── Choice chip (multi or single select) ──────────────────── */

export function Chip({
  selected,
  onClick,
  children,
  tone = "light",
  className,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  tone?: "light" | "dark"
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[14px] font-medium transition-colors",
        tone === "light" &&
          (selected
            ? "border-sea bg-sea text-white"
            : "border-white/80 bg-white/60 text-ink backdrop-blur-md hover:bg-white/90"),
        tone === "dark" &&
          (selected
            ? "border-sulphur bg-sulphur text-obsidian"
            : "border-white/20 bg-transparent text-white hover:border-white/50"),
        className,
      )}
    >
      {selected && <Check className="size-3.5" strokeWidth={2.6} aria-hidden />}
      {children}
    </button>
  )
}

/* ─── Option row (radio-like, larger) ───────────────────────── */

export function OptionRow({
  selected,
  onClick,
  title,
  detail,
  aside,
  role = "radio",
}: {
  selected: boolean
  onClick: () => void
  title: string
  detail?: string
  aside?: React.ReactNode
  role?: "radio" | "checkbox"
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors",
        selected ? "border border-sea bg-sea-wash" : "glass hover:bg-white/80",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center border-2 transition-colors",
          role === "radio" ? "rounded-full" : "rounded-[5px]",
          selected ? "border-sea bg-sea text-white" : "border-ink/25",
        )}
      >
        {selected && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium text-ink">{title}</span>
        {detail && <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-3">{detail}</span>}
      </span>
      {aside && <span className="shrink-0 text-[14px] font-medium text-ink-2">{aside}</span>}
    </button>
  )
}

/* ─── Counter ───────────────────────────────────────────────── */

export function Counter({
  label,
  hint,
  value,
  min = 0,
  max = 6,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  min?: number
  max?: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <div className="text-[15px] font-medium">{label}</div>
        {hint && <div className="text-[13px] text-ink-3">{hint}</div>}
      </div>
      <div className="flex items-center gap-3">
        <IconButton
          label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="size-10 border border-ink/15 disabled:opacity-35"
        >
          <Minus className="size-4" />
        </IconButton>
        <output aria-live="polite" className="w-5 text-center text-[16px] font-semibold tabular-nums">
          {value}
        </output>
        <IconButton
          label={`More ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="size-10 border border-ink/15 disabled:opacity-35"
        >
          <Plus className="size-4" />
        </IconButton>
      </div>
    </div>
  )
}

/* ─── Segmented control ─────────────────────────────────────── */

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  tone = "light",
}: {
  value: T
  options: Array<{ id: T; label: string }>
  onChange: (v: T) => void
  label: string
  tone?: "light" | "dark"
}) {
  const groupId = React.useId()
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "relative grid rounded-full p-1",
        tone === "light" ? "border border-white/70 bg-white/45 backdrop-blur-md" : "bg-white/10 backdrop-blur-md",
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={cn(
              "relative h-9 rounded-full text-[13.5px] font-medium transition-colors",
              tone === "light" ? (active ? "text-ink" : "text-ink-3") : active ? "text-obsidian" : "text-white/75",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${groupId}`}
                transition={{ duration: 0.35, ease: EASE }}
                className={cn(
                  "absolute inset-0 rounded-full",
                  tone === "light" ? "bg-white shadow-[0_1px_3px_rgb(0_0_0/0.12)]" : "bg-sulphur",
                )}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ─── Screen header for full-screen flows ───────────────────── */

export function FlowHeader({
  onBack,
  step,
  steps,
  title,
  onClose,
  tone = "light",
}: {
  onBack?: () => void
  step?: number
  steps?: number
  title?: string
  onClose?: () => void
  tone?: "light" | "dark"
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-[var(--z-nav)] px-2 pt-[max(env(safe-area-inset-top),8px)]",
        tone === "light" ? "bg-white/40 backdrop-blur-xl" : "",
      )}
    >
      <div className="flex h-14 items-center gap-1">
        {onBack ? (
          <IconButton label="Back" onClick={onBack} className={tone === "light" ? "hover:bg-ink/5" : "text-white hover:bg-white/10"}>
            <ArrowLeft className="size-5" />
          </IconButton>
        ) : (
          <span className="size-11" />
        )}
        <div className={cn("flex-1 text-center text-[14px] font-medium", tone === "light" ? "text-ink-2" : "text-white/80")}>
          {title}
        </div>
        {onClose ? (
          <IconButton label="Close" onClick={onClose} className={tone === "light" ? "hover:bg-ink/5" : "text-white hover:bg-white/10"}>
            <X className="size-5" />
          </IconButton>
        ) : (
          <span className="size-11" />
        )}
      </div>
      {steps && step !== undefined && (
        <div className="flex gap-1 px-3 pb-2" aria-label={`Step ${step + 1} of ${steps}`} role="progressbar" aria-valuemin={1} aria-valuemax={steps} aria-valuenow={step + 1}>
          {Array.from({ length: steps }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-[3px] flex-1 rounded-full transition-colors duration-500",
                i <= step ? (tone === "light" ? "bg-sea" : "bg-sulphur") : tone === "light" ? "bg-ink/10" : "bg-white/15",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Bottom sheet ──────────────────────────────────────────── */

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-sheet)] flex items-end justify-center md:items-center md:p-6">
          <motion.button
            aria-label="Close"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-obsidian/35 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="glass-strong relative flex max-h-[90svh] w-full max-w-[440px] flex-col rounded-t-[28px] md:max-h-[84svh] md:max-w-[560px] md:rounded-[28px]"
          >
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <h2 className="font-display text-[26px]">{title}</h2>
              <IconButton label="Close" onClick={onClose} className="-mr-2 hover:bg-ink/5">
                <X className="size-5" />
              </IconButton>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">{children}</div>
            {footer && (
              <div className="border-t border-white/70 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ─── Section heading ───────────────────────────────────────── */

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-4", className)}>
      <h2 className="font-display text-[26px] text-ink">{children}</h2>
      {action}
    </div>
  )
}

export function TextLink({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "min-h-11 shrink-0 text-[14px] font-medium text-sea underline-offset-4 hover:underline",
        className,
      )}
    >
      {children}
    </button>
  )
}

/* ─── Screen fade for full-screen overlays ──────────────────── */

export function FullScreen({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const dark = !!className?.includes("bg-obsidian")
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className={cn(
        "fixed inset-0 z-[var(--z-overlay)] md:grid md:place-items-center md:p-6",
        dark ? "ambient-dark" : "ambient",
      )}
    >
      {/* Phone: the flow fills the screen. Tablet and desktop: it sits in a centred window.
          No backdrop blur or transform here, so fixed children such as the 3D tour can still cover the viewport. */}
      <div
        className={cn(
          "h-full w-full overflow-y-auto md:h-[min(900px,calc(100svh-48px))] md:w-[640px] md:rounded-[32px] md:shadow-[0_8px_8px_-4px_rgb(10_12_17/0.18)]",
          dark ? "" : "md:border md:border-white/80 md:bg-white/60",
          className,
        )}
      >
        {children}
      </div>
    </motion.div>
  )
}

/* Animate between steps of a flow */
export function Step({ id, children, dir = 1 }: { id: string | number; children: React.ReactNode; dir?: number }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, x: 24 * dir }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 * dir }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
