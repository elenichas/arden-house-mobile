"use client"

import { ChapterShell } from "./chapter-shell"
import { usePrelude } from "./prelude-context"

export function ChapterWords() {
  const { selections, setSelection } = usePrelude()

  return (
    <ChapterShell
      kicker="Chapter Six"
      title={
        <>
          Your Words,
          <br />
          <span className="italic font-light text-ink-soft">anything else we should know.</span>
        </>
      }
      subtitle="Add practical notes for the team: arrival time, allergies, work needs, or anything you want prepared."
      nextLabel="See your stay"
    >
      <div>
        <label
          htmlFor="prelude-words"
          className="mb-4 block font-sans text-[11px] tracking-[0.26em] uppercase text-ink-muted"
        >
          In your own words
        </label>
        <textarea
          id="prelude-words"
          value={selections.words ?? ""}
          onChange={(e) => setSelection("words", e.target.value)}
          placeholder="I arrive late and would like the room quiet, cool, and set for sleep..."
          rows={8}
          className="w-full resize-none rounded-[18px] border-0 glass-soft p-6 font-serif text-xl leading-relaxed text-ink placeholder:text-ink-muted/60 placeholder:italic focus:outline-none"
        />
        <p className="mt-4 font-serif italic text-ink-soft text-[15px]">
          Your concierge, Lucien, will add this to your arrival notes.
        </p>
      </div>
    </ChapterShell>
  )
}
