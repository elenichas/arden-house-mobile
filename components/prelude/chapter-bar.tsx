"use client"

import { motion } from "framer-motion"
import { ChapterBlock, ChapterShell } from "./chapter-shell"
import { Chip, OptionCard } from "./primitives"
import { dietaryOptions, minibarCollections, welcomeDrinkOptions } from "./data"
import { usePrelude } from "./prelude-context"

export function ChapterBar() {
  const { selections, setSelection, toggleInSet } = usePrelude()

  return (
    <ChapterShell
      kicker="Chapter Two"
      title={
        <>
          Your Bar,
          <br />
          <span className="italic font-light text-cream/85">stocked for your stay.</span>
        </>
      }
      subtitle="Choose a welcome drink, minibar selection, and any dietary notes."
      heroImage="/images/rebrand/restaurant-lounge.png"
    >
      <ChapterBlock label="A welcome drink">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {welcomeDrinkOptions.map((o) => (
            <OptionCard
              key={o.id}
              orientation="horizontal"
              selected={selections.welcomeDrink === o.id}
              onSelect={() => setSelection("welcomeDrink", o.id)}
              label={o.label}
              hint={o.hint}
            />
          ))}
        </div>
      </ChapterBlock>

      <ChapterBlock label="Minibar selection">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {minibarCollections.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <OptionCard
                selected={selections.minibar === c.id}
                onSelect={() => setSelection("minibar", c.id)}
                label={c.label}
                hint={c.description}
                image={c.image}
                size="sm"
              />
            </motion.div>
          ))}
        </div>
      </ChapterBlock>

      <ChapterBlock label="Dietary notes">
        <p className="mb-4 font-serif italic text-ink-soft text-[15px]">
          Every dietary need is noted and honoured across all menus.
        </p>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((o) => (
            <Chip
              key={o.id}
              selected={selections.dietary.includes(o.id)}
              onToggle={() => toggleInSet("dietary", o.id)}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </ChapterBlock>

      <ChapterBlock label="A special addition">
        <p className="mb-3 font-serif italic text-ink-soft text-[15px]">
          Add a bottle, cake, flowers, or any other request you would like in the room.
        </p>
        <textarea
          value={selections.specialAdditions ?? ""}
          onChange={(e) => setSelection("specialAdditions", e.target.value)}
          placeholder="Add a room request..."
          rows={3}
          className="w-full resize-none rounded-[16px] border-0 glass-soft p-4 font-serif text-lg text-ink placeholder:text-ink-muted/60 placeholder:italic focus:outline-none"
        />
      </ChapterBlock>
    </ChapterShell>
  )
}
