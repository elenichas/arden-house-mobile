"use client"

import * as React from "react"
import { Minus, Plus, Thermometer } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  dietOptions,
  extras,
  fridgeOptions,
  bedOptions,
  linenOptions,
  curtainOptions,
  welcomeOptions,
  flowerOptions,
  interests,
  occasionOptions,
  paceOptions,
  pillowOptions,
  scentOptions,
  euro,
  type ExtraId,
  type Prefs,
} from "./data"
import { Chip, IconButton, OptionRow, Segmented } from "./ui"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="mb-7">
      <legend className="mb-1 text-[16px] font-semibold text-ink">{label}</legend>
      {hint && <p className="mb-3 text-[14px] leading-snug text-ink-3">{hint}</p>}
      {!hint && <div className="mb-3" />}
      {children}
    </fieldset>
  )
}

/** How the guest likes to spend their days. Feeds Nefeli and Today. */
export function TripPrefs({ prefs, onChange }: { prefs: Prefs; onChange: (p: Partial<Prefs>) => void }) {
  return (
    <div>
      <Field label="Your pace" hint="Nefeli plans around this. You can change it any day.">
        <div className="space-y-2" role="radiogroup" aria-label="Your pace">
          {paceOptions.map((o) => (
            <OptionRow
              key={o.id}
              selected={prefs.pace === o.id}
              onClick={() => onChange({ pace: o.id })}
              title={o.label}
              detail={o.detail}
            />
          ))}
        </div>
      </Field>

      <Field label="Mornings">
        <Segmented
          label="Mornings"
          value={prefs.rhythm}
          onChange={(rhythm) => onChange({ rhythm })}
          options={[
            { id: "early", label: "Up with the sun" },
            { id: "late", label: "Slow mornings" },
          ]}
        />
      </Field>

      <Field label="What you would like more of" hint="Pick any. We use it to suggest experiences.">
        <div className="flex flex-wrap gap-2">
          {interests.map((i) => {
            const on = prefs.interests.includes(i.id)
            return (
              <Chip
                key={i.id}
                selected={on}
                onClick={() =>
                  onChange({
                    interests: on ? prefs.interests.filter((x) => x !== i.id) : [...prefs.interests, i.id],
                  })
                }
              >
                {i.label}
              </Chip>
            )
          })}
        </div>
      </Field>

      <Field label="Is it a special trip?">
        <div className="flex flex-wrap gap-2">
          {occasionOptions.map((o) => (
            <Chip key={o.id} selected={prefs.occasion === o.id} onClick={() => onChange({ occasion: o.id })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Food we should know about" hint="Shared with Thalami and the boat crew.">
        <div className="flex flex-wrap gap-2">
          {dietOptions.map((d) => {
            const on = prefs.diet.includes(d.id)
            return (
              <Chip
                key={d.id}
                selected={on}
                onClick={() => onChange({ diet: on ? prefs.diet.filter((x) => x !== d.id) : [...prefs.diet, d.id] })}
              >
                {d.label}
              </Chip>
            )
          })}
        </div>
      </Field>
    </div>
  )
}

/** How the suite is set up before arrival. */
export function SuitePrefs({ prefs, onChange }: { prefs: Prefs; onChange: (p: Partial<Prefs>) => void }) {
  return (
    <div>
      <Field label="Bed">
        <div className="flex flex-wrap gap-2">
          {bedOptions.map((o) => (
            <Chip key={o.id} selected={prefs.bed === o.id} onClick={() => onChange({ bed: o.id })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Bed linen">
        <div className="flex flex-wrap gap-2">
          {linenOptions.map((o) => (
            <Chip key={o.id} selected={prefs.linen === o.id} onClick={() => onChange({ linen: o.id })}>
              <span className="size-3.5 rounded-full border border-ink/20" style={{ background: o.swatch }} aria-hidden />
              {o.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Pillows">
        <div className="flex flex-wrap gap-2">
          {pillowOptions.map((o) => (
            <Chip key={o.id} selected={prefs.pillow === o.id} onClick={() => onChange({ pillow: o.id })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Room scent" hint="Distilled on the island by Mélissa in Pollonia.">
        <div className="flex flex-wrap gap-2">
          {scentOptions.map((o) => (
            <Chip key={o.id} selected={prefs.scent === o.id} onClick={() => onChange({ scent: o.id })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Flowers">
        <div className="flex flex-wrap gap-2">
          {flowerOptions.map((o) => (
            <Chip key={o.id} selected={prefs.flowers === o.id} onClick={() => onChange({ flowers: o.id })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Curtains when you arrive">
        <div className="flex flex-wrap gap-2">
          {curtainOptions.map((o) => (
            <Chip key={o.id} selected={prefs.curtains === o.id} onClick={() => onChange({ curtains: o.id })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="On the table">
        <div className="flex flex-wrap gap-2">
          {welcomeOptions.map((o) => (
            <Chip key={o.id} selected={prefs.welcome === o.id} onClick={() => onChange({ welcome: o.id })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Fridge">
        <div className="flex flex-wrap gap-2">
          {fridgeOptions.map((o) => (
            <Chip key={o.id} selected={prefs.fridge === o.id} onClick={() => onChange({ fridge: o.id })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Room temperature on arrival">
        <div className="flex items-center justify-between rounded-xl glass px-4 py-2">
          <span className="flex items-center gap-2 text-[15px] text-ink-2">
            <Thermometer className="size-4" aria-hidden /> Set to
          </span>
          <div className="flex items-center gap-3">
            <IconButton
              label="Cooler"
              disabled={prefs.temperature <= 18}
              onClick={() => onChange({ temperature: prefs.temperature - 1 })}
              className="size-10 border border-ink/15 disabled:opacity-35"
            >
              <Minus className="size-4" />
            </IconButton>
            <output aria-live="polite" className="w-12 text-center text-[18px] font-semibold tabular-nums">
              {prefs.temperature}°C
            </output>
            <IconButton
              label="Warmer"
              disabled={prefs.temperature >= 26}
              onClick={() => onChange({ temperature: prefs.temperature + 1 })}
              className="size-10 border border-ink/15 disabled:opacity-35"
            >
              <Plus className="size-4" />
            </IconButton>
          </div>
        </div>
      </Field>

      <Field label="Anything else" hint="Allergies, a surprise, a habit we should know.">
        <textarea
          value={prefs.note}
          onChange={(e) => onChange({ note: e.target.value })}
          rows={3}
          placeholder="For example, oat milk with coffee"
          className="w-full resize-none rounded-xl glass px-4 py-3 text-[15px] text-ink placeholder:text-ink-3 focus:border-sea focus:outline-none"
        />
      </Field>
    </div>
  )
}

/** Paid and free additions to the booking. */
export function ExtrasPicker({
  selected,
  onToggle,
}: {
  selected: ExtraId[]
  onToggle: (id: ExtraId) => void
}) {
  return (
    <div className="space-y-2">
      {extras.map((x) => {
        const on = selected.includes(x.id)
        return (
          <OptionRow
            key={x.id}
            role="checkbox"
            selected={on}
            onClick={() => onToggle(x.id)}
            title={x.name}
            detail={x.detail}
            aside={<span className={cn(x.price === 0 && "text-olive")}>{x.price === 0 ? "Free" : euro(x.price)}</span>}
          />
        )
      })}
    </div>
  )
}
