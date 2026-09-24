"use client"

import { ChapterBlock, ChapterShell } from "./chapter-shell"
import { Chip, OptionCard } from "./primitives"
import { activityOptions, diningOptions, spaOptions } from "./data"
import { usePrelude } from "./prelude-context"

/**
 * Chapter Five — "After the day's work".
 *  Arden House is a business hotel first, so this chapter is framed as a
 * restorative interval between meetings rather than a services catalogue.
 * The special-occasion selector has been removed to keep the tone professional.
 */
export function ChapterMoments() {
  const { selections, setSelection, toggleInSet } = usePrelude()

  return (
    <ChapterShell
      kicker="Chapter Five"
      title={
        <>
          After the day&apos;s work,
          <br />
          <span className="italic font-light text-cream/85">useful extras for the evening.</span>
        </>
      }
      subtitle="Add spa, dining, transport, or fitness plans if they would make the stay easier."
      heroImage="/images/rebrand/spa-recovery.png"
    >
      <ChapterBlock label="Decompression">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {spaOptions.map((o) => (
            <OptionCard
              key={o.id}
              orientation="horizontal"
              selected={selections.spa === o.id}
              onSelect={() => setSelection("spa", o.id)}
              label={o.label}
              hint={o.hint}
            />
          ))}
        </div>
      </ChapterBlock>

      <ChapterBlock label="Dinner">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          {diningOptions.map((o) => (
            <OptionCard
              key={o.id}
              orientation="horizontal"
              selected={selections.dining === o.id}
              onSelect={() => setSelection("dining", o.id)}
              label={o.label}
              hint={o.hint}
            />
          ))}
        </div>
      </ChapterBlock>

      <ChapterBlock label="Beyond the meeting room">
        <p className="mb-4 font-serif italic text-ink-soft text-[15px]">
          Optional services we can keep ready if your schedule changes.
        </p>
        <div className="flex flex-wrap gap-2">
          {activityOptions.map((o) => (
            <Chip
              key={o.id}
              selected={selections.activities.includes(o.id)}
              onToggle={() => toggleInSet("activities", o.id)}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </ChapterBlock>
    </ChapterShell>
  )
}
