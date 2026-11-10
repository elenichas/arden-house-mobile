import type { CSSProperties } from "react"
import {
  Bodoni_Moda,
  Bricolage_Grotesque,
  Cormorant_Garamond,
  DM_Sans,
  Figtree,
  Fraunces,
  Hanken_Grotesk,
  Instrument_Sans,
  Jost,
  Marcellus,
} from "next/font/google"
import { ArrowRight, BookOpen, Box, CalendarRange, MessageCircle, Ship, Sparkles, Sun } from "lucide-react"

/*
 * Five theme directions for Aspra, shown on the same screen so they can be compared.
 * This page is for choosing. Nothing here changes the app until one is applied.
 */

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--f-cormorant" })
const jost = Jost({ subsets: ["latin"], variable: "--f-jost" })
const fraunces = Fraunces({ subsets: ["latin"], variable: "--f-fraunces" })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--f-dm" })
const bodoni = Bodoni_Moda({ subsets: ["latin"], variable: "--f-bodoni" })
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--f-hanken" })
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--f-marcellus" })
const figtree = Figtree({ subsets: ["latin"], variable: "--f-figtree" })
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-bricolage" })
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--f-instrument" })

type Theme = {
  n: number
  name: string
  greek: string
  mood: string
  bestFor: string
  display: string
  ui: string
  fonts: [string, string]
  image: string
  c: {
    bg: string
    surface: string
    ink: string
    muted: string
    line: string
    primary: string
    onPrimary: string
    accent: string
    dark: string
    onDark: string
    chipOn: string
    onChipOn: string
  }
  radius: { card: number; button: number; chip: number }
  headline: CSSProperties
  label?: CSSProperties
  emphasis?: CSSProperties
}

const THEMES: Theme[] = [
  {
    n: 1,
    name: "Limewash",
    greek: "Asvestis",
    mood: "Bright Cycladic noon. Whitewash, deep Aegean blue and a touch of bougainvillea.",
    bestFor: "The classic Greek island look, light and romantic.",
    display: "var(--f-cormorant)",
    ui: "var(--f-jost)",
    fonts: ["Cormorant Garamond", "Jost"],
    image: "/images/aspra/suite-pool.jpg",
    c: {
      bg: "#fbfbf8", surface: "#ffffff", ink: "#13233c", muted: "#55647d", line: "#dfe5ec",
      primary: "#1d4f9e", onPrimary: "#ffffff", accent: "#bf1f5c",
      dark: "#13233c", onDark: "#ffffff", chipOn: "#13233c", onChipOn: "#ffffff",
    },
    radius: { card: 18, button: 999, chip: 999 },
    headline: { fontWeight: 500, fontSize: 35, lineHeight: 1.02, letterSpacing: "-0.01em" },
    emphasis: { fontStyle: "italic" },
  },
  {
    n: 2,
    name: "Terracotta",
    greek: "Keramos",
    mood: "Late afternoon on a clay terrace. Fired earth, sand and olive.",
    bestFor: "Warm, earthy and handmade. Feels like a family-run estate.",
    display: "var(--f-fraunces)",
    ui: "var(--f-dm)",
    fonts: ["Fraunces", "DM Sans"],
    image: "/images/aspra/taverna-sunset.jpg",
    c: {
      bg: "#f3e6d6", surface: "#fff9f1", ink: "#3b1f13", muted: "#7b5a47", line: "#e3cfb9",
      primary: "#ad4f27", onPrimary: "#ffffff", accent: "#5c6a2e",
      dark: "#ad4f27", onDark: "#fff6ea", chipOn: "#3b1f13", onChipOn: "#fff6ea",
    },
    radius: { card: 14, button: 14, chip: 12 },
    headline: { fontWeight: 400, fontSize: 31, lineHeight: 1.06, letterSpacing: "-0.015em" },
  },
  {
    n: 3,
    name: "Night sea",
    greek: "Nychta",
    mood: "The terrace after dark. Deep navy, brass and ivory, with fine lines.",
    bestFor: "The most formal and exclusive. Reads as a five-star evening.",
    display: "var(--f-bodoni)",
    ui: "var(--f-hanken)",
    fonts: ["Bodoni Moda", "Hanken Grotesk"],
    image: "/images/aspra/hero-cliffs.jpg",
    c: {
      bg: "#0c131f", surface: "#151e2d", ink: "#f4eee1", muted: "#a7afbd", line: "#2a3547",
      primary: "#c8a35a", onPrimary: "#0c131f", accent: "#8fc3d3",
      dark: "#1b2638", onDark: "#f4eee1", chipOn: "#c8a35a", onChipOn: "#0c131f",
    },
    radius: { card: 4, button: 2, chip: 2 },
    headline: { fontWeight: 400, fontSize: 31, lineHeight: 1.08, letterSpacing: "0" },
    label: { textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 10.5 },
    emphasis: { fontStyle: "italic" },
  },
  {
    n: 4,
    name: "Olive grove",
    greek: "Elaia",
    mood: "Shade under old trees. Deep olive, pale stone and lemon.",
    bestFor: "Calm, natural and wellness-led. Slower than the others.",
    display: "var(--f-marcellus)",
    ui: "var(--f-figtree)",
    fonts: ["Marcellus", "Figtree"],
    image: "/images/aspra/breakfast-terrace.jpg",
    c: {
      bg: "#eef0e5", surface: "#ffffff", ink: "#1e2919", muted: "#59664f", line: "#d7dcc9",
      primary: "#3d5829", onPrimary: "#ffffff", accent: "#b8930f",
      dark: "#1e2919", onDark: "#f3f5ea", chipOn: "#3d5829", onChipOn: "#ffffff",
    },
    radius: { card: 10, button: 10, chip: 8 },
    headline: { fontWeight: 400, fontSize: 30, lineHeight: 1.1, letterSpacing: "0.005em" },
  },
  {
    n: 5,
    name: "Meltemi",
    greek: "Modern Riviera",
    mood: "Clean, confident and current. Black on white with one electric sea blue.",
    bestFor: "A design-hotel feel for a younger guest. The boldest of the five.",
    display: "var(--f-bricolage)",
    ui: "var(--f-instrument)",
    fonts: ["Bricolage Grotesque", "Instrument Sans"],
    image: "/images/aspra/boat-sail.jpg",
    c: {
      bg: "#f4f5f7", surface: "#ffffff", ink: "#0a0c11", muted: "#5a6170", line: "#e2e4e9",
      primary: "#0a0c11", onPrimary: "#ffffff", accent: "#1c57f5",
      dark: "#1c57f5", onDark: "#ffffff", chipOn: "#1c57f5", onChipOn: "#ffffff",
    },
    radius: { card: 24, button: 999, chip: 999 },
    headline: { fontWeight: 700, fontSize: 31, lineHeight: 1.0, letterSpacing: "-0.03em" },
  },
]

function Phone({ t }: { t: Theme }) {
  const c = t.c
  const label: CSSProperties = { fontSize: 12, color: c.muted, ...t.label }
  const card: CSSProperties = { background: c.surface, borderRadius: t.radius.card, border: `1px solid ${c.line}` }
  return (
    <div
      className="w-[320px] shrink-0 overflow-hidden rounded-[36px] border-[6px] border-[#1b1d22] shadow-[0_10px_8px_rgb(0_0_0/0.12)]"
      style={{ background: c.bg, color: c.ink, fontFamily: t.ui }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <span className="flex items-center gap-2">
          <svg viewBox="0 0 40 40" className="size-5" aria-hidden>
            <path d="M10 33V18a10 10 0 0 1 20 0v15" fill="none" stroke={c.ink} strokeWidth="2.4" />
            <path d="M5 33h30" stroke={c.accent} strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: t.display, fontSize: 21, fontWeight: t.headline.fontWeight, letterSpacing: t.n === 3 ? "0.12em" : t.headline.letterSpacing, textTransform: t.n === 3 ? "uppercase" : undefined }}>
            Aspra
          </span>
        </span>
        <span className="grid size-9 place-items-center text-[12px] font-semibold" style={{ background: c.chipOn, color: c.onChipOn, borderRadius: t.radius.chip }}>
          CW
        </span>
      </div>

      {/* hero */}
      <div className="px-4">
        <div className="relative overflow-hidden" style={{ borderRadius: t.radius.card }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.image} alt="" className="aspect-[4/4.4] w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(0 0 0 / 0) 35%, rgb(8 12 20 / 0.82) 100%)" }} />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p style={{ ...t.label, fontSize: t.label ? 10.5 : 13, color: t.n === 3 ? c.primary : "#ffffff", opacity: t.n === 3 ? 1 : 0.9 }}>207 days to Milos</p>
            <h3 className="mt-1" style={{ fontFamily: t.display, ...t.headline }}>
              Clara, your plunge pool suite is <span style={t.emphasis}>booked.</span>
            </h3>
          </div>
        </div>
      </div>

      {/* section + row */}
      <div className="px-4 pt-5">
        <h4 style={{ fontFamily: t.display, fontSize: 22, fontWeight: t.headline.fontWeight, letterSpacing: t.headline.letterSpacing }}>Getting here</h4>
        <div className="mt-2 flex items-center gap-3 p-3" style={card}>
          <span className="grid size-9 shrink-0 place-items-center" style={{ background: `color-mix(in srgb, ${c.accent} 16%, ${c.surface})`, color: c.accent, borderRadius: t.radius.chip }}>
            <Ship className="size-[18px]" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-medium">Our boat meets you at Adamas</span>
            <span className="block" style={{ fontSize: 12.5, color: c.muted }}>Fri 4 June, 13:40. 35 minutes by sea.</span>
          </span>
        </div>
      </div>

      {/* chips */}
      <div className="px-4 pt-4">
        <p style={label}>Your pace</p>
        <div className="mt-1.5 flex gap-1.5">
          {["Slow", "Balanced", "Full"].map((x, i) => (
            <span
              key={x}
              className="px-3.5 py-2 text-[13px] font-medium"
              style={{
                borderRadius: t.radius.chip,
                background: i === 0 ? c.chipOn : "transparent",
                color: i === 0 ? c.onChipOn : c.ink,
                border: `1px solid ${i === 0 ? c.chipOn : c.line}`,
              }}
            >
              {x}
            </span>
          ))}
        </div>
      </div>

      {/* buttons */}
      <div className="space-y-2 px-4 pt-4">
        <div className="flex h-12 items-center justify-center gap-2 text-[14.5px] font-medium" style={{ background: c.primary, color: c.onPrimary, borderRadius: t.radius.button, ...(t.n === 3 ? { textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 12 } : {}) }}>
          <Box className="size-[18px]" aria-hidden /> Walk through your suite
        </div>
        <div className="flex h-12 items-center justify-center gap-2 text-[14.5px] font-medium" style={{ border: `1px solid ${t.n === 3 ? c.primary : c.ink}`, color: t.n === 3 ? c.primary : c.ink, borderRadius: t.radius.button, ...(t.n === 3 ? { textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 12 } : {}) }}>
          Open my plan <ArrowRight className="size-4" aria-hidden />
        </div>
      </div>

      {/* concierge */}
      <div className="px-4 pt-4">
        <div className="p-4" style={{ background: c.dark, color: c.onDark, borderRadius: t.radius.card, border: t.n === 3 ? `1px solid ${c.primary}55` : undefined }}>
          <p className="flex items-center gap-1.5" style={{ ...t.label, fontSize: t.label ? 10.5 : 12.5, opacity: 0.8 }}>
            <Sparkles className="size-3.5" aria-hidden /> Nefeli, concierge, 24 hours
          </p>
          <p className="mt-1.5" style={{ fontFamily: t.display, fontSize: 21, fontWeight: t.headline.fontWeight, lineHeight: 1.12, letterSpacing: t.headline.letterSpacing }}>
            Questions before you travel?
          </p>
          <span className="mt-3 inline-block px-3 py-1.5 text-[12.5px]" style={{ border: `1px solid ${c.onDark}55`, borderRadius: t.radius.chip }}>
            Plan my first day
          </span>
        </div>
      </div>

      {/* tab bar */}
      <div className="mt-4 grid grid-cols-4 px-2 pb-3 pt-2" style={{ background: c.surface, borderTop: `1px solid ${c.line}` }}>
        {[
          { l: "Today", I: Sun },
          { l: "Plan", I: CalendarRange },
          { l: "Nefeli", I: MessageCircle },
          { l: "Journal", I: BookOpen },
        ].map(({ l, I }, i) => (
          <span key={l} className="flex flex-col items-center gap-1 text-[11px] font-medium" style={{ color: i === 0 ? (t.n === 3 ? c.primary : c.ink) : c.muted }}>
            <I className="size-5" strokeWidth={i === 0 ? 2.2 : 1.7} aria-hidden />
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

export const metadata = { title: "Aspra theme options" }

export default function ThemesPage() {
  const fontVars = [cormorant, jost, fraunces, dmSans, bodoni, hanken, marcellus, figtree, bricolage, instrument].map((f) => f.variable).join(" ")
  return (
    <main className={`${fontVars} min-h-[100svh] bg-[#e8e9ec] px-5 py-10 text-[#14161b]`} style={{ fontFamily: "var(--f-instrument)" }}>
      <header className="mx-auto max-w-[1100px]">
        <h1 className="text-[34px] font-semibold tracking-[-0.02em]" style={{ fontFamily: "var(--f-bricolage)" }}>
          Five directions for Aspra
        </h1>
        <p className="mt-2 max-w-[62ch] text-[15.5px] leading-relaxed text-[#4a4f5a]">
          The same screen in five themes. Each has its own colours, typefaces and corner shapes. Scroll sideways to compare, then tell me the number you want across the whole app.
        </p>
      </header>

      <div className="mt-8 flex gap-8 overflow-x-auto px-1 pb-8 [scrollbar-width:thin]">
        {THEMES.map((t) => (
          <section key={t.n} className="w-[320px] shrink-0" aria-label={`Option ${t.n}: ${t.name}`}>
            <div className="mb-4 h-[196px]">
              <p className="text-[13px] font-medium text-[#5a6170]">Option {t.n}</p>
              <h2 style={{ fontFamily: t.display, fontSize: 32, fontWeight: t.headline.fontWeight, lineHeight: 1.1, letterSpacing: t.headline.letterSpacing }}>
                {t.name} <span className="text-[#7a808c]" style={{ fontSize: 18 }}>{t.greek}</span>
              </h2>
              <p className="mt-2 text-[14px] leading-snug text-[#3a3f49]">{t.mood}</p>
              <p className="mt-1.5 text-[13.5px] leading-snug text-[#5a6170]">{t.bestFor}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex">
                  {[t.c.bg, t.c.ink, t.c.primary, t.c.accent, t.c.dark].map((x, i) => (
                    <span key={i} className="-ml-1.5 size-6 rounded-full border-2 border-white first:ml-0" style={{ background: x }} />
                  ))}
                </span>
                <span className="text-[12.5px] text-[#3a3f49]">
                  {t.fonts[0]} + {t.fonts[1]}
                </span>
              </div>
            </div>
            <Phone t={t} />
          </section>
        ))}
      </div>
    </main>
  )
}
