/**
 * Touchpoint definitions — each maps to a chapter / feature from the
 * Prelude experience. Positions are in world-space units (after auto-
 * centering and scaling). Adjust these once you load your actual room
 * model to place them on the bed, minibar, window, etc.
 *
 * The `chapter` field links to the matching Prelude chapter so the
 * panel can show the same preference controls the mobile app uses.
 */
export type TouchpointId =
  | "bed"
  | "bar"
  | "atmosphere"
  | "morning"
  | "moments"
  | "bathroom"

export type TouchpointDef = {
  id: TouchpointId
  label: string
  /** World-space position [x, y, z]. Adjust to your model. */
  position: [number, number, number]
  /** Which Prelude chapter (or section) this touchpoint opens. */
  chapter: string
  /** Short description shown in the panel header. */
  description: string
  /** Icon name from lucide-react. */
  icon: string
}

export const touchpoints: TouchpointDef[] = [
  {
    id: "bed",
    label: "Sleep",
    position: [-1.85, -0.29, 1.21],
    chapter: "bed",
    description:
      "Mattress firmness, pillow type, duvet weight, linen fabric — everything about how you'll sleep.",
    icon: "bed-double",
  },
  {
    id: "bar",
    label: "Minibar",
    position: [-2.21, -0.06, 0.88],
    chapter: "bar",
    description:
      "Welcome drink, minibar selection, and dietary notes for the room.",
    icon: "wine",
  },
  {
    id: "atmosphere",
    label: "Atmosphere",
    position: [-0.37, 0.86, 2.56],
    chapter: "atmosphere",
    description:
      "Scent, lighting, temperature, music, and flowers for arrival.",
    icon: "sun",
  },
  {
    id: "morning",
    label: "Breakfast",
    position: [0.81, -0.27, 2.41],
    chapter: "morning",
    description:
      "Breakfast time, location, style, coffee, and tea.",
    icon: "coffee",
  },
  {
    id: "moments",
    label: "Experiences",
    position: [-1.73, -0.19, 2.23],
    chapter: "moments",
    description:
      "Spa, dining, transport, and other useful extras.",
    icon: "sparkles",
  },
  {
    id: "bathroom",
    label: "Bathroom",
    position: [-2.15, -0.01, -1.3],
    chapter: "atmosphere",
    description:
      "Towel warming, bath amenities, robes — the details that matter.",
    icon: "bath",
  },
]
