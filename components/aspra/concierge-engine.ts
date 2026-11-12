/*
 * Nefeli's local brain. Used when no model is configured, and always used
 * to attach actions (add to plan, send a request) to a reply.
 * Answers read the guest's stage, preferences, booking and plan.
 */

import {
  addDays,
  bookingTotal,
  conditions,
  experienceById,
  hotel,
  recipe,
  suggestFor,
  suiteById,
  type Booking,
  type ExperienceId,
  type Guest,
  type PastStay,
  type Phase,
  type PlanItem,
  type Prefs,
  type TabId,
} from "./data"

export type ConciergeAction =
  | { kind: "add"; label: string; experienceId: ExperienceId; day: number; time?: string }
  | { kind: "request"; label: string; request: string }
  | { kind: "tab"; label: string; tab: TabId }
  | { kind: "rebook"; label: string }

export type ConciergeContext = {
  guest: Guest
  phase: Phase
  booking: Booking | null
  prefs: Prefs
  plan: PlanItem[]
  pastStay: PastStay | null
}

export type ConciergeReply = { text: string; actions: ConciergeAction[] }

export function contextSummary(c: ConciergeContext) {
  const lines = [
    `Guest: ${c.guest.firstName || "Guest"} ${c.guest.lastName}`.trim(),
    `Trip stage: ${c.phase === "before" ? "before arrival" : c.phase === "during" ? "staying at the hotel now" : "back home after the stay"}`,
    `Preferences: pace ${c.prefs.pace}, ${c.prefs.rhythm} mornings, likes ${c.prefs.interests.join(", ") || "not set"}, diet ${c.prefs.diet.join(", ") || "none"}, occasion ${c.prefs.occasion}.`,
  ]
  if (c.booking) {
    const n = bookingTotal(c.booking).nights
    lines.push(
      `Booking ${c.booking.ref}: ${suiteById(c.booking.suiteId).name}, ${c.booking.checkIn} to ${c.booking.checkOut} (${n} nights), ${c.booking.adults} adults, ${c.booking.children} children. Arriving by ${c.booking.arrival.by}, ${c.booking.arrival.detail} at ${c.booking.arrival.time}. Extras: ${c.booking.extras.join(", ") || "none"}.`,
    )
    if (c.plan.length)
      lines.push(
        `Plan: ${c.plan.map((p) => `${experienceById(p.experienceId).name} on day ${p.day + 1} at ${p.time} (${p.status})`).join("; ")}.`,
      )
  }
  if (c.pastStay) lines.push(`Past stay: ${c.pastStay.suiteNumber}, ${c.pastStay.checkIn}. Remembered: ${c.pastStay.remembered.join(", ")}.`)
  lines.push(`Conditions today: air ${conditions.air}C, sea ${conditions.sea}C, wind ${conditions.wind}, sunset ${conditions.sunset}.`)
  return lines.join("\n")
}

const has = (t: string, re: RegExp) => re.test(t)

function addMinutes(hhmm: string, mins: number) {
  const [h, m] = hhmm.split(":").map(Number)
  const total = Math.min(23 * 60 + 59, h * 60 + m + mins)
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

function targetDay(c: ConciergeContext, text: string) {
  if (!c.booking) return 0
  const nights = bookingTotal(c.booking).nights
  for (let i = 0; i <= nights; i++) {
    const long = new Date(c.booking.checkIn + "T12:00:00")
    long.setDate(long.getDate() + i)
    const label = long.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    if (text.toLowerCase().includes(label.toLowerCase())) return i
  }
  if (/first day|arriv/i.test(text)) return 0
  if (c.phase === "during") return Math.min(3, nights - 1)
  return 1
}

/** Replies check the plan first, so Nefeli never offers to book what is already booked. */
export function localReply(input: string, c: ConciergeContext): ConciergeReply {
  const reply = baseReply(input, c)
  const b = c.booking
  if (!b) return reply
  const notes: string[] = []
  let linked = false
  const actions: ConciergeAction[] = []
  for (const a of reply.actions) {
    const planned = a.kind === "add" ? c.plan.find((p) => p.experienceId === a.experienceId) : undefined
    if (!planned) {
      actions.push(a)
      continue
    }
    const when = new Date(addDays(b.checkIn, planned.day) + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    const name = experienceById(planned.experienceId).name
    notes.push(`${name} is already in your plan for ${when} at ${planned.time}${planned.status === "requested" ? ", waiting for us to confirm" : ""}.`)
    if (!linked) {
      actions.push({ kind: "tab", label: "See it in your plan", tab: "plan" })
      linked = true
    }
  }
  return notes.length ? { text: `${notes.join(" ")}\n\n${reply.text}`, actions } : reply
}

function baseReply(input: string, c: ConciergeContext): ConciergeReply {
  const t = input.toLowerCase()
  const name = c.guest.firstName
  const b = c.booking
  const dayOf = (d: number) =>
    b ? new Date(addDays(b.checkIn, d) + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : "that day"

  // Plan a day
  if (has(t, /plan|itinerar|what should (we|i) do|first day|ideas for/)) {
    const day = targetDay(c, input)
    const arrival = day === 0 && b
    const latest = arrival ? addMinutes(b.arrival.time, 180) : "00:00"
    const pool = suggestFor(c.prefs, c.plan).filter((e) => e.defaultTime >= latest)
    const picks = pool.slice(0, arrival ? 2 : c.prefs.pace === "full" ? 3 : 2).sort((x, y) => x.defaultTime.localeCompare(y.defaultTime))
    const opening = arrival
      ? `You land at ${b.arrival.time} and your suite is ready at ${hotel.checkIn}. Have lunch on the terrace, swim from our rocks, and keep the evening easy.`
      : c.prefs.rhythm === "early"
        ? "Start early, before 09:00, when the coves are empty."
        : "Take a slow breakfast on your terrace. It comes whenever you call for it."
    const lines = picks.map((e) => `${e.defaultTime}  ${e.name}. ${e.short}`)
    const diet = c.prefs.diet.length ? ` I have told the kitchen: ${c.prefs.diet.join(", ").replace(/-/g, " ")}.` : ""
    const evening = picks.some((e) => e.id === "thalami" || e.id === "chef-terrace")
      ? `Sunset is at ${conditions.sunset}.`
      : `Sunset is at ${conditions.sunset}. Thalami has tables from 19:30 if you want dinner close by.`
    return {
      text: `Here is a ${c.prefs.pace} plan for ${dayOf(day)}.\n\n${opening}\n\n${lines.join("\n\n")}\n\n${evening}${diet}\n\nTap to add any of these to your plan.`,
      actions: picks.map((e) => ({ kind: "add" as const, label: `Add ${e.name}`, experienceId: e.id, day })),
    }
  }

  // Swimming and beaches
  if (has(t, /swim|beach|cove|sarakiniko|tsigrado|firiplaka/)) {
    return {
      text: conditions.windy
        ? `The meltemi is up today, ${conditions.wind}. The north coast, Sarakiniko included, will have waves and wind.\n\nGo south. Tsigrado is a small sandy cove reached by a rope ladder, best before 11:00. Firiplaka has red cliffs, soft sand and a canteen. Both are 15 minutes by car and calm until the afternoon.\n\nThe sea is ${conditions.sea}°C.`
        : `The wind is light, so the whole island is open. Sarakiniko is best before 09:00, before the day crowds. Tsigrado and Firiplaka on the south coast are good all day.`,
      actions: [
        { kind: "request", label: "Car to Firiplaka, 10:00", request: "Car to Firiplaka at 10:00, pick up 15:00" },
        { kind: "add", label: "Add the early Sarakiniko swim", experienceId: "sarakiniko", day: targetDay(c, input) },
      ],
    }
  }

  // Getting here
  if (has(t, /ferry|flight|fly|plane|airport|port|getting here|how do i get|transfer/)) {
    return {
      text: `Two ways to reach Milos.\n\nBy air: Sky Express and Olympic fly from Athens in about 45 minutes. Milos airport is ${hotel.airportMinutes} minutes from us.\n\nBy sea: Seajets from Piraeus takes about 3 hours to Adamas. The slower conventional ferry takes 5 to 7 hours and runs even when the wind is strong.\n\nIn July and August the meltemi can delay small planes and fast ferries. If your connection is tight, the conventional ferry is the safer choice.${b?.extras.includes("boat-transfer") ? "\n\nYour boat transfer is booked. Captain Manolis will meet you at the west quay." : ""}`,
      actions: b?.extras.includes("boat-transfer")
        ? [{ kind: "request", label: "Send my arrival time", request: "Arrival details for the boat transfer" }]
        : [{ kind: "request", label: "Book the boat from Adamas", request: "Boat transfer from Adamas on arrival" }],
    }
  }

  // Dinner
  if (has(t, /dinner|table|restaurant|eat|thalami|taverna/)) {
    const time = (input.match(/\b(\d{1,2}[:.]\d{2})\b/)?.[1] ?? "21:00").replace(".", ":")
    const people = input.match(/for (two|2|three|3|four|4)/i)?.[1] ?? "two"
    const day = c.phase === "during" && b ? Math.min(2, bookingTotal(b).nights - 1) : targetDay(c, input)
    const diet = c.prefs.diet.length ? ` The kitchen knows: ${c.prefs.diet.join(", ").replace(/-/g, " ")}.` : ""
    const edge = c.pastStay?.remembered.some((r) => r.includes("terrace edge")) ? " I have asked for the table at the edge, like last time." : ""
    return {
      text: `I can hold a table for ${people} at Thalami at ${time}.${edge}${diet}\n\nTonight the boats from Pollonia brought red mullet and sea bream. Ask for the fava with caper leaves.\n\nIf you would rather eat in a village, Medusa in Mandrakia sits on the water. I can book a car there too.`,
      actions: [
        { kind: "add", label: `Book Thalami, ${time}`, experienceId: "thalami", day, time },
        { kind: "request", label: "Car to Mandrakia", request: "Car to Mandrakia for dinner, 20:30" },
      ],
    }
  }

  // Boat
  if (has(t, /boat|kleftiko|sail|caique/)) {
    return {
      text: `The caique leaves our jetty at 09:30 and goes round the south west to Kleftiko, the old pirate caves. You swim twice, and Captain Manolis grills lunch on board. Back by 16:30. €260 each.\n\nIt runs only when the wind is under 6 Beaufort. If it cannot go, we move you to the next calm day at no charge.`,
      actions: [{ kind: "add", label: "Book the Kleftiko sail", experienceId: "kleftiko", day: targetDay(c, input) }],
    }
  }

  // Spa
  if (has(t, /spa|massage|treatment|relax|grotto/)) {
    return {
      text: `The grotto is our spa, cut into the rock under the hotel. The sea salt ritual is 75 minutes: a scrub with salt from Alyki, an olive oil massage, then a rinse in sea water. €180.\n\nThe 17:00 slot leaves you on the terrace for sunset.`,
      actions: [{ kind: "add", label: "Book the 17:00 ritual", experienceId: "grotto-ritual", day: targetDay(c, input) }],
    }
  }

  // Weather and sea temperature
  if (has(t, /weather|warm|temperature|wind|meltemi|rain|hot/)) {
    return {
      text: `On Milos the sea is about 21°C in early June, 24°C in August and still 23°C in late September. Air is 26 to 30°C in summer, with almost no rain from May to October.\n\nThe meltemi is a dry north wind, strongest in July and August. It keeps the heat down but makes the north beaches rough. The south coast, where we are, stays sheltered.`,
      actions: [],
    }
  }

  // Health
  if (has(t, /pharmac|doctor|sick|ill|medic|hurt|sting|hospital/)) {
    return {
      text: `The pharmacy in Adamas is open until 22:00. There is a health centre in Plaka with a doctor on call at night.\n\nIf it is urgent, call 112. Otherwise reception can bring a doctor to your suite, usually within an hour. Stavros is on the desk now.`,
      actions: [{ kind: "request", label: "Ask reception to call me", request: "Please call me about a doctor" }],
    }
  }

  // Housekeeping
  if (has(t, /towel|clean|housekeep|pillow|sheets|turndown/)) {
    return {
      text: `I have the request ready for housekeeping. They are on until 23:00 and usually arrive within 20 minutes.`,
      actions: [{ kind: "request", label: "Send to housekeeping", request: input }],
    }
  }

  // Recipe
  if (has(t, /recipe|fava|cook|make the/)) {
    return {
      text: `${recipe.title}, from ${recipe.from}.\n\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nThe full card is in your journal.`,
      actions: [{ kind: "tab", label: "Open the journal", tab: "journal" }],
    }
  }

  // Shop and send home
  if (has(t, /olive oil|honey|send .* home|ship|buy|shop|salt/)) {
    return {
      text: `Our olive oil comes from the trees around Zefyria and is pressed each November. The thyme honey is from Giorgos's hives above Provatas. We ship to the EU, UK and US in 5 to 8 days.\n\nYou can order from the island pantry in your journal.`,
      actions: [{ kind: "tab", label: "Open the island pantry", tab: "journal" }],
    }
  }

  // Wine
  if (has(t, /wine|bottle|drink/)) {
    const liked = c.pastStay?.remembered.find((r) => /malagousia/i.test(r))
    return {
      text: liked
        ? `Last September you liked a Malagousia from Tinos, the 2024. We still have it, and I can have a bottle cold in your suite.`
        : `For the sea terrace I would start with an Assyrtiko from Santorini, dry and salty, or a Malagousia from Tinos if you like more fruit. The fridge in your suite is stocked with island wine unless you asked otherwise.`,
      actions: [{ kind: "request", label: "A bottle to the suite", request: liked ? "Malagousia Tinos 2024, chilled, to the suite" : "Bottle of Assyrtiko to the suite" }],
    }
  }

  // Celebrations
  if (has(t, /anniversar|birthday|honeymoon|propos|surprise|romantic/)) {
    return {
      text: `For a celebration I would book the chef's table on your terrace. Chef Yannis cooks five courses for the two of you and the team leaves between courses. €320 each.\n\nI can also put flowers and a cake from Plaka in the suite while you are out. Tell me the day and I will keep it quiet.`,
      actions: [
        { kind: "add", label: "Book the chef's table", experienceId: "chef-terrace", day: targetDay(c, input) },
        { kind: "request", label: "Flowers and cake, quietly", request: "Surprise: flowers and cake in the suite" },
      ],
    }
  }

  // Children
  if (has(t, /kid|child|baby|family/)) {
    return {
      text: `Children are welcome. Cots and baby baths are free, and the fridge can be stocked with juice and snacks. Firiplaka is the best beach for children: soft sand and shallow water. The cliff villa has a pool fence on request.`,
      actions: [],
    }
  }

  // Rebook
  if (has(t, /next year|again|come back|return|rebook/)) {
    return {
      text: `${c.pastStay ? `${c.pastStay.suiteNumber} is free from 17 to 23 September 2027, the same week as last time.` : "We hold your suite and dates for 14 days after you leave."} Your preferences come with you.`,
      actions: [{ kind: "rebook", label: "See 2027 dates" }],
    }
  }

  // Late checkout
  if (has(t, /late check|check ?out|leave late/)) {
    return {
      text: `Check out is at ${hotel.checkOut}. You can stay in the suite until 17:00 for €150, which suits the evening ferry. After that, the grotto has showers and a lounge you can use until you leave.`,
      actions: [{ kind: "request", label: "Request 17:00 check out", request: "Late check out until 17:00" }],
    }
  }

  // A person
  if (has(t, /human|person|someone|reception|call me|phone|stavros/)) {
    return {
      text: `${hotel.humanConcierge} is at reception now, and the desk is staffed all night. You can call ${hotel.receptionPhone}, or I can ask him to call you.`,
      actions: [{ kind: "request", label: `Ask ${hotel.humanConcierge} to call me`, request: "Please call me" }],
    }
  }

  // Greetings
  if (has(t, /^(hi|hello|hey|kalimera|yassou|good (morning|evening))/)) {
    return {
      text: `Kalimera${name ? `, ${name}` : ""}. I can plan a day, book a table or the boat, sort out your arrival, or send something to your suite. What do you need?`,
      actions: [],
    }
  }

  if (has(t, /thank|efharisto|great|perfect/)) {
    return { text: `Parakalo. I am here whenever you need me, day or night.`, actions: [] }
  }

  return {
    text: `I do not have a good answer to that yet, so I will not guess. I can pass it to ${hotel.humanConcierge} at reception, who will reply here within 10 minutes.`,
    actions: [{ kind: "request", label: `Pass it to ${hotel.humanConcierge}`, request: `Question for reception: ${input}` }],
  }
}

export function phasePrompts(phase: Phase, hasBooking: boolean): string[] {
  if (!hasBooking) return ["What was the wine we liked?", "Is our suite free next September?", "How do I make the fava?"]
  if (phase === "before") return ["Plan my first day", "Which ferry should I take?", "It is our anniversary", "Is the sea warm in June?"]
  if (phase === "during") return ["Where should we swim today?", "Book dinner for two at 21:00", "Fresh towels, please", "Can we sail tomorrow?"]
  return ["How do I make the fava?", "Send olive oil to my home", "Can we come back next year?"]
}
