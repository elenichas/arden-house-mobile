"use client"

import { motion } from "framer-motion"
import { Coffee, Leaf } from "lucide-react"
import { ChapterBlock, ChapterShell } from "./chapter-shell"
import { OptionCard, Segmented } from "./primitives"
import {
  breakfastLocationOptions,
  breakfastStyleOptions,
  breakfastTimeOptions,
  coffeeOptions,
  teaOptions,
  readingOptions,
} from "./data"
import { usePrelude } from "./prelude-context"

/** A reserved one-line hint that prints the selected option's description
 *  below a segmented row, so the user keeps the nuance that used to live
 *  inside each card without the extra vertical real estate. */
function HintLine({ text }: { text?: string }) {
  return (
    <div className="mt-2 min-h-[18px] px-1 font-serif italic text-[12.5px] text-ink-muted">
      {text ?? "\u00A0"}
    </div>
  )
}

export function ChapterMorning() {
  const { selections, setSelection } = usePrelude()

  return (
    <ChapterShell
      kicker="Chapter Four"
      title={
        <>
          The Morning,
          <br />
          <span className="italic font-light text-cream/85">planned around you.</span>
        </>
      }
      subtitle="Tell us when and where you would like breakfast, coffee, and reading material."
      heroImage="/images/rebrand/restaurant-lounge.png"
    >
      {/* Each of When, Where, Style is a single tight row — segmented so the
          user can scan all three decisions without scrolling. The selected
          hint shows below so context isn't lost. */}
      <ChapterBlock label="When">
        <Segmented
          options={breakfastTimeOptions}
          value={selections.breakfastTime}
          onChange={(id) => setSelection("breakfastTime", id)}
        />
        <HintLine
          text={breakfastTimeOptions.find((o) => o.id === selections.breakfastTime)?.hint}
        />
      </ChapterBlock>

      <ChapterBlock label="Where">
        <Segmented
          options={breakfastLocationOptions}
          value={selections.breakfastLocation}
          onChange={(id) => setSelection("breakfastLocation", id)}
        />
        <HintLine
          text={
            breakfastLocationOptions.find((o) => o.id === selections.breakfastLocation)?.hint
          }
        />
      </ChapterBlock>

      <ChapterBlock label="Style">
        <Segmented
          options={breakfastStyleOptions}
          value={selections.breakfastStyle}
          onChange={(id) => setSelection("breakfastStyle", id)}
        />
        <HintLine
          text={breakfastStyleOptions.find((o) => o.id === selections.breakfastStyle)?.hint}
        />
      </ChapterBlock>

      <ChapterBlock label="Coffee">
        <div className="mb-3 flex items-center gap-2.5">
          <motion.span
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Coffee className="h-5 w-5 text-gold-deep" strokeWidth={1.4} />
          </motion.span>
          <span className="font-serif italic text-[14px] text-ink-soft">Choose your coffee order.</span>
        </div>
        <Segmented
          options={coffeeOptions}
          value={selections.coffee}
          onChange={(id) => setSelection("coffee", id)}
          columns={2}
        />
      </ChapterBlock>

      <ChapterBlock label="Tea">
        <div className="mb-3 flex items-center gap-2.5">
          <motion.span
            animate={{ rotate: [0, 6, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Leaf className="h-5 w-5 text-gold-deep" strokeWidth={1.4} />
          </motion.span>
          <span className="font-serif italic text-[14px] text-ink-soft">Or choose tea instead.</span>
        </div>
        <Segmented
          options={teaOptions}
          value={selections.tea}
          onChange={(id) => setSelection("tea", id)}
          columns={2}
        />
      </ChapterBlock>

      <ChapterBlock label="Morning reading">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          {readingOptions.map((o) => (
            <OptionCard
              key={o.id}
              orientation="horizontal"
              selected={selections.reading === o.id}
              onSelect={() => setSelection("reading", o.id)}
              label={o.label}
              hint={o.hint}
            />
          ))}
        </div>
      </ChapterBlock>
    </ChapterShell>
  )
}
