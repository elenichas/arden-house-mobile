"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { AnimatePresence, motion } from "framer-motion"
import {
  Armchair,
  Ban,
  BedDouble,
  BedSingle,
  Blinds,
  Check,
  ChevronLeft,
  ChevronRight,
  Cookie,
  CupSoda,
  DoorOpen,
  Droplets,
  Fan,
  Flower2,
  GlassWater,
  Grape,
  Hand,
  Layers,
  Minus,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  Settings2,
  Shirt,
  Sparkles,
  Sun,
  Sunset,
  Thermometer,
  Waves,
  Wine,
  X,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  bedOptions,
  beddingFor,
  curtainOptions,
  defaultPrefs,
  flowerOptions,
  fridgeOptions,
  linenOptions,
  pillowOptions,
  scentOptions,
  suiteById,
  terraceOptions,
  welcomeOptions,
  type Light,
  type Prefs,
  type SuiteId,
} from "../data"
import { Button, EASE, IconButton } from "../ui"
import type { HotspotId } from "./scene"
import { VIEWPOINTS, type Pose, type ViewpointId } from "./spots"
import { FloorPlan } from "./floor-plan"

const SuiteScene = dynamic(() => import("./scene"), { ssr: false, loading: () => null })

type SettingId = Exclude<HotspotId, "view">

const SETTINGS: Array<{ id: SettingId; label: string; icon: LucideIcon; intro: string; value: (p: Prefs) => string }> = [
  {
    id: "bed",
    label: "Bed",
    icon: BedDouble,
    intro: "The bed is built into the rock in plaster. We make it up as one king or two singles.",
    value: (p) => (p.bed === "king" ? "King" : "Two singles"),
  },
  {
    id: "pillows",
    label: "Pillows",
    icon: Layers,
    intro: "Each bed gets a standing pillow and a sleeping pillow of the kind you pick.",
    value: (p) => pillowOptions.find((o) => o.id === p.pillow)?.label ?? "",
  },
  {
    id: "linen",
    label: "Linen",
    icon: Palette,
    intro: "The duvet cover and front pillows. All three are washed linen.",
    value: (p) => linenOptions.find((o) => o.id === p.linen)?.label ?? "",
  },
  {
    id: "temperature",
    label: "Temperature",
    icon: Thermometer,
    intro: "The rock keeps the suite near 22°C on its own. The fan and the bedding follow the temperature you set.",
    value: (p) => `${p.temperature}°C`,
  },
  {
    id: "curtains",
    label: "Curtains",
    icon: Blinds,
    intro: "Sheer linen across the sea arch. This is how you find them when you walk in.",
    value: (p) => (p.curtains === "open" ? "Open" : "Drawn"),
  },
  {
    id: "flowers",
    label: "Flowers",
    icon: Flower2,
    intro: "In a clay jug from Triovasalos, cut the morning you arrive.",
    value: (p) => flowerOptions.find((o) => o.id === p.flowers)?.label ?? "",
  },
  {
    id: "scent",
    label: "Scent",
    icon: Droplets,
    intro: "A reed diffuser in the wall niche, distilled on the island. Housekeeping removes it if you change your mind.",
    value: (p) => scentOptions.find((o) => o.id === p.scent)?.label ?? "",
  },
  {
    id: "welcome",
    label: "On the table",
    icon: Grape,
    intro: "Waiting on the low table when you arrive.",
    value: (p) => (p.welcome === "fruit" ? "Figs and grapes" : p.welcome === "sweets" ? "Sweets" : "Water"),
  },
  {
    id: "fridge",
    label: "Minibar",
    icon: Wine,
    intro: "Filled before you arrive. What stands on top is what is inside.",
    value: (p) => (p.fridge === "local-wine" ? "Island wine" : p.fridge === "no-alcohol" ? "No alcohol" : p.fridge === "kids" ? "For children" : "Empty"),
  },
  {
    id: "terrace",
    label: "Terrace",
    icon: Sunset,
    intro: "What stands under the reed pergola when you arrive. We can swap it any day.",
    value: (p) => ((p.terrace ?? "loungers") === "dining" ? "Table for two" : "Loungers"),
  },
]

const LABELS = Object.fromEntries([...SETTINGS.map((s) => [s.id, s.label]), ["view", "Step outside"]]) as Record<HotspotId, string>

const SUITE_KEYS = ["bed", "pillow", "linen", "temperature", "curtains", "flowers", "scent", "welcome", "fridge", "terrace"] as const

const SPOT_ICONS: Record<ViewpointId, LucideIcon> = {
  door: DoorOpen,
  room: Shirt,
  bed: Armchair,
  window: Sun,
  terrace: Waves,
  pergola: Sunset,
  rail: Waves,
  shower: Droplets,
}

type QualityMode = "auto" | "high" | "light"

export function SuiteTour({
  suiteId,
  prefs,
  onChange,
  onClose,
  saveLabel = "Save my suite",
}: {
  suiteId: SuiteId
  prefs: Prefs
  onChange: (p: Partial<Prefs>) => void
  onClose: (saved: boolean) => void
  saveLabel?: string
}) {
  const suite = suiteById(suiteId)
  const [focus, setFocus] = React.useState<HotspotId | null>(null)
  const [light, setLight] = React.useState<Light>("morning")
  const [viewpoint, setViewpoint] = React.useState<{ id: ViewpointId; n: number }>({ id: "door", n: 0 })
  const [ready, setReady] = React.useState(false)
  const [hint, setHint] = React.useState(true)
  const [webgl, setWebgl] = React.useState(true)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [mode, setMode] = React.useState<QualityMode>("auto")
  const [autoQuality, setAutoQuality] = React.useState<"high" | "light">("high")
  const pose = React.useRef<Pose>({ x: VIEWPOINTS.door.camera[0], z: VIEWPOINTS.door.camera[2], heading: 0 })
  const quality = mode === "auto" ? autoQuality : mode

  React.useEffect(() => {
    try {
      const c = document.createElement("canvas")
      setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl")))
    } catch {
      setWebgl(false)
    }
    const nav = navigator as Navigator & { deviceMemory?: number }
    if ((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 3) setAutoQuality("light")
  }, [])

  React.useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (settingsOpen) setSettingsOpen(false)
      else if (focus) setFocus(null)
      else onClose(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [focus, settingsOpen, onClose])

  React.useEffect(() => {
    const t = setTimeout(() => setHint(false), 6000)
    return () => clearTimeout(t)
  }, [])

  const select = React.useCallback((id: HotspotId) => {
    setHint(false)
    setSettingsOpen(false)
    if (id === "view") {
      setFocus(null)
      setViewpoint((v) => ({ id: "terrace", n: v.n + 1 }))
      return
    }
    setFocus((f) => (f === id ? null : id))
  }, [])

  const go = (id: ViewpointId) => {
    setHint(false)
    setFocus(null)
    setViewpoint((v) => ({ id, n: v.n + 1 }))
  }

  const changed = SUITE_KEYS.filter((k) => prefs[k] !== defaultPrefs[k]).length
  const reset = () => onChange(Object.fromEntries(SUITE_KEYS.map((k) => [k, defaultPrefs[k]])) as Partial<Prefs>)

  const index = focus ? SETTINGS.findIndex((s) => s.id === focus) : -1
  const setting = index >= 0 ? SETTINGS[index] : null
  const next = index >= 0 && index < SETTINGS.length - 1 ? SETTINGS[index + 1] : null
  const prev = index > 0 ? SETTINGS[index - 1] : null

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${suite.name} in 3D`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="on-dark fixed inset-0 z-[var(--z-sheet)] flex w-full flex-col overflow-hidden bg-obsidian text-white"
    >
      {/* 3D view */}
      <div className="absolute inset-0" inert={webgl && !ready} onPointerDown={() => setHint(false)}>
        {webgl ? (
          <SuiteScene
            key={quality}
            suiteId={suiteId}
            prefs={prefs}
            light={light}
            focus={focus}
            viewpoint={viewpoint}
            quality={quality}
            labels={LABELS}
            onSelect={select}
            onWalk={go}
            pose={pose}
            onReady={() => setTimeout(() => setReady(true), 350)}
            onSlow={() => setAutoQuality("light")}
          />
        ) : (
          <div className="grid h-full place-items-center px-8 text-center text-[15px] text-white/80">
            This device cannot show 3D. You can still set up your suite with the buttons below.
          </div>
        )}
      </div>

      {/* building overlay */}
      <AnimatePresence>
        {webgl && !ready && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="absolute inset-0 z-40 grid place-items-center bg-obsidian">
            <IconButton
              label="Close 3D view"
              onClick={() => onClose(false)}
              className="absolute left-4 top-[max(env(safe-area-inset-top),12px)] border border-white/20 text-white hover:bg-white/10"
            >
              <X className="size-5" />
            </IconButton>
            <div role="status" className="flex flex-col items-center gap-4 px-8 text-center">
              <svg viewBox="0 0 40 40" className="size-12" aria-hidden>
                <motion.path
                  d="M10 33V18a10 10 0 0 1 20 0v15"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: EASE, repeat: Infinity, repeatType: "reverse" }}
                />
                <path d="M5 33h30" stroke="var(--sulphur)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <p className="text-[15px] text-white/85">Building your suite</p>
              <p className="max-w-[26ch] text-[13px] leading-snug text-white/60">This takes a few seconds the first time. Your choices are ready as soon as the room appears.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* top bar */}
      <div
        inert={webgl && !ready}
        className="pointer-events-none relative z-30 bg-gradient-to-b from-obsidian/75 via-obsidian/35 to-transparent px-4 pb-10 pt-[max(env(safe-area-inset-top),12px)]"
      >
        <div className="flex items-center gap-2">
          <IconButton label="Close 3D view" onClick={() => onClose(false)} className="glass-smoke pointer-events-auto text-white hover:bg-obsidian/60">
            <X className="size-5" />
          </IconButton>
          <div className="min-w-0 flex-1 px-1">
            <h2 className="truncate font-display text-[23px] leading-tight">{suite.name}</h2>
            <p className="truncate text-[12.5px] text-white/75">
              {suiteId === "villa" ? "Main bedroom" : `${suite.size} m²`}. {suite.view}
            </p>
          </div>
          <IconButton
            label="View settings"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((o) => !o)}
            className={cn("pointer-events-auto backdrop-blur-md", settingsOpen ? "bg-white text-obsidian" : "glass-smoke text-white hover:bg-obsidian/60")}
          >
            <Settings2 className="size-5" />
          </IconButton>
        </div>

        {/* time of day */}
        <div role="radiogroup" aria-label="Light in the suite" className="glass-smoke pointer-events-auto mt-3 inline-flex rounded-full p-1">
          {([
            { id: "morning", label: "Morning", icon: Sun },
            { id: "sunset", label: "Sunset", icon: Sunset },
            { id: "night", label: "Night", icon: Moon },
          ] as Array<{ id: Light; label: string; icon: LucideIcon }>).map((o) => {
            const on = light === o.id
            const Icon = o.icon
            return (
              <button
                key={o.id}
                role="radio"
                aria-checked={on}
                onClick={() => setLight(o.id)}
                className={cn("relative flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors", on ? "text-obsidian" : "text-white/80")}
              >
                {on && <motion.span layoutId="tod" transition={{ duration: 0.35, ease: EASE }} className="absolute inset-0 rounded-full bg-white" />}
                <Icon className="relative size-4" aria-hidden />
                <span className="relative">{o.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* floor plan: where you are and which way you face */}
      {webgl && ready && !settingsOpen && (
        <FloorPlan
          pose={pose}
          current={focus ? null : viewpoint.id}
          hasPool={suiteId !== "cave"}
          className="absolute right-4 top-[calc(max(env(safe-area-inset-top),12px)+108px)] z-30 md:top-[calc(max(env(safe-area-inset-top),12px)+56px)]"
        />
      )}

      {/* view settings popover */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute right-4 top-[calc(max(env(safe-area-inset-top),12px)+52px)] z-40 w-[270px] origin-top-right rounded-3xl glass-strong p-4 text-ink shadow-[0_8px_8px_rgb(0_0_0/0.25)]"
          >
            <h3 className="text-[15px] font-semibold">Graphics</h3>
            <p className="mt-0.5 text-[13px] leading-snug text-ink-3">
              High adds soft shading, glow and sharper shadows. Light is smoother on older phones.
            </p>
            <div role="radiogroup" aria-label="Graphics quality" className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-ink/[0.06] p-1">
              {(["auto", "high", "light"] as QualityMode[]).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => {
                    setReady(false)
                    setMode(m)
                  }}
                  className={cn("h-9 rounded-full text-[13.5px] font-medium capitalize transition-colors", mode === m ? "bg-white text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12)]" : "text-ink-3")}
                >
                  {m}
                </button>
              ))}
            </div>
            {mode === "auto" && <p className="mt-2 text-[12.5px] text-ink-3">Auto is using {autoQuality} on this device.</p>}

            <h3 className="mt-5 text-[15px] font-semibold">Your choices</h3>
            <button
              onClick={() => {
                reset()
                setSettingsOpen(false)
              }}
              disabled={changed === 0}
              className="mt-2 flex h-11 w-full items-center gap-2 rounded-xl glass px-3.5 text-[14px] font-medium disabled:opacity-45"
            >
              <RotateCcw className="size-4" aria-hidden /> Reset to the hotel standard
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* first-time hint */}
      <AnimatePresence>
        {hint && ready && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 top-[52%] z-30 flex justify-center px-6"
          >
            <p className="glass-smoke flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px]">
              <Hand className="size-4 shrink-0 text-sulphur" aria-hidden /> Drag to look. Tap a dot to change it, a ring to walk.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1" />

      {/* bottom: setting panel, or the dock. On wide screens the panel sits at the right. */}
      <div
        // Nothing below can be reached, by touch or keyboard, until the room is on screen.
        inert={webgl && !ready}
        className={cn("relative z-30", setting && "lg:absolute lg:bottom-6 lg:right-6 lg:top-[140px] lg:w-[420px]")}
      >
        <AnimatePresence mode="wait" initial={false}>
          {setting ? (
            <motion.section
              key="panel"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              aria-label={setting.label}
              className="glass-strong flex max-h-[50svh] flex-col rounded-t-[28px] text-ink lg:h-full lg:max-h-none lg:rounded-[28px]"
            >
              <div className="flex items-center gap-3 px-5 pt-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sea-wash text-sea-deep">
                  <setting.icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-[24px] leading-none">{setting.label}</h3>
                  <p className="mt-1 text-[12.5px] text-ink-3">
                    {index + 1} of {SETTINGS.length}
                  </p>
                </div>
                <IconButton label="Close panel" onClick={() => setFocus(null)} className="-mr-2 hover:bg-ink/5">
                  <X className="size-5" />
                </IconButton>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3 pt-3">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={setting.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
                    <p className="mb-3 text-[14px] leading-relaxed text-ink-2">{setting.intro}</p>
                    <Options id={setting.id} prefs={prefs} onChange={onChange} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 border-t border-white/70 px-5 pb-[max(env(safe-area-inset-bottom),14px)] pt-3">
                <IconButton
                  label={prev ? `Back to ${prev.label}` : "Back"}
                  disabled={!prev}
                  onClick={() => prev && setFocus(prev.id)}
                  className="border border-ink/15 disabled:opacity-35"
                >
                  <ChevronLeft className="size-5" />
                </IconButton>
                <Button className="flex-1" onClick={() => setFocus(next ? next.id : null)}>
                  {next ? (
                    <>
                      Next: {next.label} <ChevronRight className="size-4" aria-hidden />
                    </>
                  ) : (
                    <>
                      <Check className="size-4" aria-hidden /> Done
                    </>
                  )}
                </Button>
              </div>
            </motion.section>
          ) : (
            <motion.div
              key="dock"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="bg-gradient-to-t from-obsidian via-obsidian/85 to-transparent px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-14"
            >
              <div className="mx-auto w-full max-w-[760px]">
              <div role="group" aria-label="Stand somewhere else" className="no-scrollbar -mx-4 mb-4 flex items-center gap-1.5 overflow-x-auto px-4">
                <span className="mr-1 shrink-0 text-[12.5px] text-white/75">Stand at</span>
                {(Object.keys(VIEWPOINTS) as ViewpointId[]).map((id) => ({ id, label: VIEWPOINTS[id].label, icon: SPOT_ICONS[id] })).map((v) => {
                  const on = viewpoint.id === v.id
                  const Icon = v.icon
                  return (
                    <button
                      key={v.id}
                      onClick={() => go(v.id)}
                      aria-pressed={on}
                      className={cn(
                        "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors",
                        on ? "bg-white text-obsidian" : "glass-smoke text-white hover:bg-obsidian/60",
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                      {v.label}
                    </button>
                  )
                })}
              </div>
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-[14px] font-medium">Set up your suite</p>
                <p className="text-[12.5px] text-white/70">
                  {changed === 0 ? "Hotel standard" : `${changed} ${changed === 1 ? "change" : "changes"} from standard`}
                </p>
              </div>
              <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 pb-1">
                {SETTINGS.map((s) => {
                  const Icon = s.icon
                  return (
                    <button
                      key={s.id}
                      onClick={() => select(s.id)}
                      className="glass-smoke flex w-[104px] shrink-0 snap-start flex-col items-start gap-1.5 rounded-2xl p-3 text-left transition-colors hover:bg-obsidian/50"
                    >
                      <Icon className="size-5 text-sulphur" aria-hidden />
                      <span className="text-[12px] text-white/70">{s.label}</span>
                      <span className="line-clamp-1 text-[13.5px] font-medium leading-tight">{s.value(prefs)}</span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="sulphur" size="lg" className="flex-1" onClick={() => onClose(true)}>
                  {saveLabel}
                </Button>
                <Button
                  size="lg"
                  className="glass-smoke px-5 text-white hover:bg-obsidian/60"
                  onClick={() => select("bed")}
                >
                  <Sparkles className="size-4 text-sulphur" aria-hidden /> Guide me
                </Button>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ─── Options for each setting ──────────────────────────────── */

function Choice({
  selected,
  onClick,
  title,
  detail,
  visual,
}: {
  selected: boolean
  onClick: () => void
  title: string
  detail?: string
  visual: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border p-2.5 pr-3.5 text-left transition-colors",
        selected ? "border-sea bg-sea-wash" : "border-white/80 bg-white/65 hover:bg-white/90",
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-chalk-2 text-ink-2">{visual}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium leading-tight">{title}</span>
        {detail && <span className="mt-0.5 block text-[13px] leading-snug text-ink-3">{detail}</span>}
      </span>
      <span
        aria-hidden
        className={cn("grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors", selected ? "border-sea bg-sea text-white" : "border-ink/20")}
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  )
}

function PillowShape({ h, w = 30, color = "#ffffff" }: { h: number; w?: number; color?: string }) {
  return (
    <svg viewBox="0 0 40 28" className="w-9" aria-hidden>
      <path
        d={`M${20 - w / 2} 22 Q${20 - w / 2 - 2} ${22 - h / 2} ${20 - w / 2 + 2} ${22 - h} Q20 ${22 - h - h * 0.35} ${20 + w / 2 - 2} ${22 - h} Q${20 + w / 2 + 2} ${22 - h / 2} ${20 + w / 2} 22 Z`}
        fill={color}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Dots({ colors }: { colors: string[] }) {
  const spots = [[14, 12], [26, 10], [20, 18], [11, 22], [29, 21], [20, 8]]
  return (
    <svg viewBox="0 0 40 32" className="w-9" aria-hidden>
      {spots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 4.2 : 5} fill={colors[i % colors.length]} />
      ))}
    </svg>
  )
}

const PILLOW_NOTES: Record<Prefs["pillow"], string> = {
  feather: "Soft and high. Sinks around your head.",
  "no-feather": "Microfibre. Medium height, keeps its shape.",
  firm: "Low and flat. For back and stomach sleepers.",
  buckwheat: "Small and heavy. Moulds to your neck and stays cool.",
}

const SCENT_TINT: Record<Prefs["scent"], string> = {
  none: "#c9c9c9",
  "fig-leaf": "#8fb562",
  "sea-fennel": "#5fc0b8",
  "wild-thyme": "#b892e0",
}

function Options({ id, prefs, onChange }: { id: SettingId; prefs: Prefs; onChange: (p: Partial<Prefs>) => void }) {
  const list = "space-y-2"

  if (id === "bed")
    return (
      <div className={list} role="radiogroup" aria-label="Bed">
        {bedOptions.map((o) => (
          <Choice
            key={o.id}
            selected={prefs.bed === o.id}
            onClick={() => onChange({ bed: o.id })}
            title={o.label}
            detail={o.detail}
            visual={o.id === "king" ? <BedDouble className="size-6" /> : <span className="flex"><BedSingle className="size-5" /><BedSingle className="size-5" /></span>}
          />
        ))}
      </div>
    )

  if (id === "pillows")
    return (
      <div className={list} role="radiogroup" aria-label="Pillows">
        {pillowOptions.map((o) => (
          <Choice
            key={o.id}
            selected={prefs.pillow === o.id}
            onClick={() => onChange({ pillow: o.id })}
            title={o.label}
            detail={PILLOW_NOTES[o.id]}
            visual={
              o.id === "feather" ? <PillowShape h={15} /> : o.id === "no-feather" ? <PillowShape h={12} /> : o.id === "firm" ? <PillowShape h={7} /> : <PillowShape h={9} w={22} color="#d8cbb2" />
            }
          />
        ))}
      </div>
    )

  if (id === "linen")
    return (
      <div className={list} role="radiogroup" aria-label="Bed linen">
        {linenOptions.map((o) => (
          <Choice
            key={o.id}
            selected={prefs.linen === o.id}
            onClick={() => onChange({ linen: o.id })}
            title={o.label}
            detail={o.detail}
            visual={<span className="size-full" style={{ background: `repeating-conic-gradient(${o.swatch} 0 25%, color-mix(in oklch, ${o.swatch} 92%, black) 0 50%) 0 0 / 6px 6px` }} />}
          />
        ))}
      </div>
    )

  if (id === "temperature") {
    const bedding = beddingFor(prefs.temperature)
    const pct = ((prefs.temperature - 18) / 8) * 100
    return (
      <div>
        <div className="rounded-2xl glass p-4">
          <div className="flex items-center justify-between">
            <IconButton label="Cooler" disabled={prefs.temperature <= 18} onClick={() => onChange({ temperature: prefs.temperature - 1 })} className="border border-ink/15 disabled:opacity-35">
              <Minus className="size-4" />
            </IconButton>
            <output aria-live="polite" className="font-display text-[44px] leading-none tabular-nums">
              {prefs.temperature}
              <span className="text-[22px] text-ink-3">°C</span>
            </output>
            <IconButton label="Warmer" disabled={prefs.temperature >= 26} onClick={() => onChange({ temperature: prefs.temperature + 1 })} className="border border-ink/15 disabled:opacity-35">
              <Plus className="size-4" />
            </IconButton>
          </div>
          <div className="relative mt-4 h-8">
            <div className="absolute inset-x-0 top-3 h-2 rounded-full" style={{ background: "linear-gradient(90deg, #4aa3d1, #e9e2d2 50%, #e58a45)" }} />
            <span className="pointer-events-none absolute top-1.5 size-5 -translate-x-1/2 rounded-full border-[3px] border-white bg-ink shadow-[0_1px_4px_rgb(0_0_0/0.35)]" style={{ left: `calc(${pct}% * 0.94 + 3%)` }} />
            <input
              type="range"
              min={18}
              max={26}
              step={1}
              value={prefs.temperature}
              onChange={(e) => onChange({ temperature: Number(e.target.value) })}
              aria-label="Temperature on arrival"
              className="absolute inset-0 h-8 w-full cursor-pointer opacity-0"
            />
          </div>
          <div className="flex justify-between text-[12px] text-ink-3">
            <span>18° cool</span>
            <span>26° warm</span>
          </div>
        </div>
        <ul className="mt-3 space-y-2 text-[14px]">
          <li className="flex items-center gap-2.5">
            <Layers className="size-4 shrink-0 text-sea" aria-hidden /> {bedding.label}
          </li>
          <li className="flex items-center gap-2.5">
            <Fan className="size-4 shrink-0 text-sea" aria-hidden />
            {prefs.temperature <= 20 ? "The ceiling fan runs fast" : prefs.temperature >= 24 ? "The ceiling fan barely turns" : "The ceiling fan turns slowly"}
          </li>
        </ul>
      </div>
    )
  }

  if (id === "terrace")
    return (
      <div className={list} role="radiogroup" aria-label="Terrace">
        {terraceOptions.map((o) => (
          <Choice
            key={o.id}
            selected={(prefs.terrace ?? "loungers") === o.id}
            onClick={() => onChange({ terrace: o.id })}
            title={o.label}
            detail={o.detail}
            visual={
              <svg viewBox="0 0 40 40" className="w-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                <path d="M5 9h30M8 9v6M32 9v6" />
                {o.id === "dining" ? (
                  <path d="M12 24h16M20 24v9M9 33v-6h4M31 33v-6h-4" />
                ) : (
                  <path d="M7 31l6-7h9M7 33h12M21 31l6-7h7M21 33h12" />
                )}
              </svg>
            }
          />
        ))}
      </div>
    )

  if (id === "curtains")
    return (
      <div className={list} role="radiogroup" aria-label="Curtains">
        {curtainOptions.map((o) => (
          <Choice
            key={o.id}
            selected={prefs.curtains === o.id}
            onClick={() => onChange({ curtains: o.id })}
            title={o.label}
            detail={o.detail}
            visual={
              <svg viewBox="0 0 40 40" className="w-9" aria-hidden>
                <path d="M8 36V18a12 12 0 0 1 24 0v18Z" fill="#9fd0e0" stroke="currentColor" strokeWidth="1.4" />
                {o.id === "sheer" ? (
                  <path d="M8 36V18a12 12 0 0 1 24 0v18Z" fill="#ffffff" fillOpacity="0.8" />
                ) : (
                  <path d="M8 36V16c2 1 4 6 3 20Zm24 0V16c-2 1-4 6-3 20Z" fill="#ffffff" stroke="currentColor" strokeWidth="1" />
                )}
              </svg>
            }
          />
        ))}
      </div>
    )

  if (id === "flowers")
    return (
      <div className={list} role="radiogroup" aria-label="Flowers">
        {flowerOptions.map((o) => (
          <Choice
            key={o.id}
            selected={prefs.flowers === o.id}
            onClick={() => onChange({ flowers: o.id })}
            title={o.label}
            detail={o.detail}
            visual={
              o.id === "bougainvillea" ? <Dots colors={["#c2185b", "#d1357a", "#e0569a"]} /> : o.id === "olive" ? <Dots colors={["#7f9068", "#aab594", "#6b7d55"]} /> : o.id === "wildflowers" ? <Dots colors={["#ffffff", "#d5342a", "#a487c9", "#f0c12e"]} /> : <Ban className="size-5" />
            }
          />
        ))}
      </div>
    )

  if (id === "scent")
    return (
      <div className={list} role="radiogroup" aria-label="Scent">
        {scentOptions.map((o) => (
          <Choice
            key={o.id}
            selected={prefs.scent === o.id}
            onClick={() => onChange({ scent: o.id })}
            title={o.label}
            detail={o.id === "none" ? "An empty niche" : o.id === "fig-leaf" ? "Green and milky" : o.id === "sea-fennel" ? "Salty and herbal" : "Warm and dry, like the hillside"}
            visual={o.id === "none" ? <Ban className="size-5" /> : <Droplets className="size-6" style={{ color: SCENT_TINT[o.id] }} />}
          />
        ))}
      </div>
    )

  if (id === "welcome")
    return (
      <div className={list} role="radiogroup" aria-label="On the table">
        {welcomeOptions.map((o) => (
          <Choice
            key={o.id}
            selected={prefs.welcome === o.id}
            onClick={() => onChange({ welcome: o.id })}
            title={o.label}
            detail={o.detail}
            visual={o.id === "fruit" ? <Grape className="size-6 text-[#6a3d5a]" /> : o.id === "sweets" ? <Cookie className="size-6 text-[#b77a32]" /> : <GlassWater className="size-6 text-sea" />}
          />
        ))}
      </div>
    )

  return (
    <div className={list} role="radiogroup" aria-label="Minibar">
      {fridgeOptions.map((o) => (
        <Choice
          key={o.id}
          selected={prefs.fridge === o.id}
          onClick={() => onChange({ fridge: o.id })}
          title={o.label}
          detail={o.id === "local-wine" ? "A bottle and two glasses are set out" : o.id === "no-alcohol" ? "Lemon water, sodas and juices" : o.id === "kids" ? "Juice bottles and a jar of biscuits" : "A card on top says so"}
          visual={o.id === "local-wine" ? <Wine className="size-6 text-[#7a2f45]" /> : o.id === "no-alcohol" ? <GlassWater className="size-6 text-sea" /> : o.id === "kids" ? <CupSoda className="size-6 text-[#e8453c]" /> : <Ban className="size-5" />}
        />
      ))}
    </div>
  )
}
