/**
 * MockChatTransport — a drop-in replacement for DefaultChatTransport
 * that pattern-matches user messages to canned Lucien responses.
 *
 * Streams each response character-by-character with a short delay so the
 * typing-dots animation and progressive reveal feel natural.
 *
 * Multi-turn flows (e.g. restaurant booking) are handled by inspecting
 * the full conversation history, not just the last message.
 */

import type { ChatTransport, UIMessage, UIMessageChunk } from "ai"

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

type MockResponse = {
  keywords: RegExp
  reply: string
}

/** Callback the assistant-tab registers so the transport can create
 *  real service-requests that appear in the Concierge "In progress" list. */
export type OnRestaurantBooked = (note: string) => void

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */

type MsgLike = {
  role: string
  parts?: Array<{ type: string; text?: string }>
}

/** Returns the concatenated text of all text-parts in a message. */
function textOf(m: MsgLike): string {
  return (
    m.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? ""
  )
}

/** True when any assistant message in the history contains `needle`. */
function assistantSaid(msgs: MsgLike[], needle: string): boolean {
  return msgs.some(
    (m) => m.role === "assistant" && textOf(m).toLowerCase().includes(needle.toLowerCase()),
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Response catalogue  (flat, single-turn matches)
   ═══════════════════════════════════════════════════════════════════ */

const RESPONSES: MockResponse[] = [
  /* ── Meeting room booking ─────────────────────────────────────── */
  {
    keywords:
      /meeting\s?room|book.*room.*tomorrow|reserve.*room.*tomorrow|need.*room.*meeting|conference/i,
    reply: `Of course. I have checked tomorrow's availability across all three meeting rooms. Here is what is open:

The Atelier  ·  3F  ·  seats 4
Round marble table, soft pendant lighting, whisper-quiet.
Available: 09:00 – 11:00, 14:00 – 16:00, and 16:00 – 18:00.

The Promenade  ·  2F  ·  seats 8
Warm walnut boardroom table, east-facing daylight, silent AC.
Available: 10:30 – 12:00 and 13:00 – 15:00.

The Harbour  ·  4F  ·  seats 14
Long linen-topped table, harbour view, presentation screen on request.
Available: 14:00 – 17:00.

For a small group of two to four, The Atelier at 09:00 would be my suggestion — it is the most acoustically private room we have, and you would have it for a full two hours.

If you are expecting more guests or need a screen, The Harbour's afternoon window gives you three uninterrupted hours with a view.

Which room and time would you like? I can also arrange coffee, water, or pastries to be set before you arrive.`,
  },
  {
    keywords:
      /atelier|book.*atelier|pencil.*atelier|yes.*09|yes.*9.*am|go.*atelier|let.*do.*atelier|confirm.*atelier/i,
    reply: `Done. The Atelier is booked for you tomorrow from 09:00 to 11:00.

Here is what I have arranged:

  Room: The Atelier, 3F
  Time: 09:00 – 11:00
  Capacity: up to 4 guests
  Setup: notepads, water, and a small pot of coffee

The room will be unlocked and ready from 08:50. If you would like anything else — pastries, a different coffee, a screen — just let me know and I will have it there.

Is there anything else I can help with for tomorrow?`,
  },
  {
    keywords: /promenade|book.*promenade|harbour|book.*harbour/i,
    reply: `Noted. I have reserved the room for you. Notepads and water will be set, and the room will be unlocked ten minutes before your session. If the group size changes or you need any catering, just let me know.

Is there anything else you need for the meeting?`,
  },

  /* ── Fine dining in New York ──────────────────────────────────── */
  {
    keywords:
      /fine\s?din|restaurant.*new\s?york|dinner.*recommend|recommend.*din|best.*restaurant|where.*eat.*tonight|upscale.*din|nice.*dinner/i,
    reply: `New York has no shortage of memorable tables. Here are three I would suggest, each a different mood:

Le Bernardin  ·  Midtown West
Eric Ripert's seafood temple — three Michelin stars. The tasting menu is focused, disciplined, and extraordinary. Jackets are expected. Ask for a banquette if you prefer privacy. A short cab from the hotel.

Eleven Madison Park  ·  Flatiron
Plant-based fine dining reimagined by Daniel Humm. The room is grand and the service choreographed to the last detail. Expect ten to twelve courses, roughly three hours. Reserve well in advance — I can check availability for you.

Atomix  ·  Gramercy
Korean fine dining, counter-style. Two Michelin stars, fourteen courses, each presented with a written card. Intimate and deeply personal — seats about fourteen. This one books out weeks ahead, but we sometimes have access through the concierge network.

If you would like something less formal but still excellent, I am also happy to suggest neighbourhood spots — bistros, omakase counters, trattorias with character.

Would you like me to make a reservation at any of these, or narrow things down by cuisine or neighbourhood?`,
  },
  {
    keywords: /le\s?bernardin|bernardin/i,
    reply: `Excellent choice. Le Bernardin is a truly special evening.

I will reach out to their reservations team now. What date, time, and party size should I request? If you have a seating preference — banquette, window, or the main dining room — I will include that as well.

One note: jackets are required for gentlemen. If you need anything pressed beforehand, housekeeping can have it ready within ninety minutes.`,
  },
  {
    keywords: /eleven\s?madison|madison\s?park|atomix|omakase|korean/i,
    reply: `A wonderful choice. I will contact the restaurant directly — as an Arden House guest we can occasionally secure tables that are otherwise unavailable online.

Let me know your preferred date, time, and party size, and I will do my best. I will follow up as soon as I hear back.

Is there anything else I can help arrange for the evening — a car, a particular wine you would like waiting?`,
  },
  {
    keywords: /bistro|trattoria|casual|neighbourhood|less formal|informal|something simpler/i,
    reply: `For something with warmth and character, three favourites of our guests:

I Sodi  ·  West Village
Tuscan cooking, candlelit, no reservations — the wait is part of the charm. The cacio e pepe is legendary.

Oda House  ·  East Village
Georgian cuisine — walnut-stuffed aubergine, khachapuri, a surprising wine list. Quiet and personal.

Sugarfish  ·  Multiple locations
Omakase-style sushi, no decisions required. The "Trust Me" menu is fast, impeccable, and about a third of the price of a formal omakase counter.

Shall I arrange a car to any of these, or would you like more options?`,
  },

  /* ── Housekeeping / room cleaning ─────────────────────────────── */
  {
    keywords:
      /clean.*room|tidy.*room|housekeeping.*clean|send.*housekeeping|room.*clean|make.*bed|fresh.*towel|turn.?down/i,
    reply: `Of course, Ms. Bennett. Your housekeeping request has been submitted.

Here is what to expect:

  Request: Full room cleaning
  Suite: Cedar Suite, 11F
  Estimated arrival: within 25 – 35 minutes
  Duration: approximately 20 minutes

The team will knock gently and announce themselves. If you would prefer to step out, they can begin immediately — otherwise they are happy to work around you.

Fresh linens, towels, and a light re-stock of the minibar are included. If there is anything specific you would like — extra pillows, a particular amenity replaced, turndown prepared early — just let me know and I will add it to the request.

Is there anything else I can help with while you wait?`,
  },
  {
    keywords: /no.*that.*all|that.*everything|nothing.*else|all.*good|all.*set|perfect.*thank/i,
    reply: `Wonderful. Housekeeping is on the way. I will be here if you need anything at all — enjoy your afternoon, Ms. Bennett.`,
  },

  /* ── General fallbacks & courtesies ──────────────────────────── */
  {
    keywords: /wi-?fi|internet|connect|network|password/i,
    reply: `The network is called "Arden House" — no password needed. It runs at one gigabit symmetrical, so video calls and large file transfers should feel effortless.

A security certificate installs automatically when you first connect. If your device asks you to trust it, please accept — it is ours.

If anything drops or feels slow, let me know and I will have the connectivity team look into it immediately.`,
  },
  {
    keywords: /spa|massage|facial|relax|treatment/i,
    reply: `The Recovery Floor is one level above your suite, reached by the private lift at the end of the corridor. It is quiet right now, with four guests checked in.

For a post-flight recovery I would suggest the deep tissue massage, fifty minutes, focused on the neck and shoulders. If you would prefer something lighter, the aromatherapy session uses warm oils and long strokes — good for easing into sleep.

Shall I reserve a slot for this evening, or would tomorrow morning suit better?`,
  },
  {
    keywords: /check.?in|check.?out|arrive|departure|early|late/i,
    reply: `Check-in begins at 15:00 and check-out is at noon. If you are arriving earlier, we are usually able to have your suite ready from 13:00 — I will confirm with housekeeping closer to the date.

For a late departure, we can often extend to 14:00 on request. Beyond that it depends on the day's arrivals, but I will do my best.

Is there anything specific about your arrival timing I should prepare for?`,
  },
  {
    keywords: /help|what can you|can you do|who are you/i,
    reply: `I can help with room choices, meeting room bookings, pressing, spa appointments, jet-lag support, transport, or a restaurant recommendation for this evening.

If something needs a human touch, Lucien is on duty and you can reach him through the Concierge tab.

What can I help you with?`,
  },
  {
    keywords: /thank|thanks|merci|cheers/i,
    reply: `You are very welcome. I am here whenever you need help during your stay.`,
  },
]

const FALLBACK_REPLY = `Let me look into that for you.

If this needs direct help from the hotel team, Lucien is available through the Concierge tab.

Is there anything else I can help you with?`

/* ═══════════════════════════════════════════════════════════════════
   Restaurant booking — multi-turn conversation
   ═══════════════════════════════════════════════════════════════════

   The conversation proceeds through stages, detected by inspecting the
   assistant's own previous messages:

     1. User asks to book the hotel restaurant / a table / dinner here.
        → Lucien asks for date, time & party size.
     2. User provides details (in one message or across follow-ups).
        → Lucien "checks availability", confirms, and mentions Concierge.
     3. User asks about wine pairing or dietary needs.
        → Lucien offers to add it.

   We parse date/time/guests from the user's text with loose regex.
   ═══════════════════════════════════════════════════════════════════ */

const RE_DATE =
  /\b(today|tonight|tomorrow|this evening|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next\s+\w+day|\d{1,2}(?:st|nd|rd|th)?(?:\s+(?:of\s+)?(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*)?)\b/i

const RE_TIME =
  /\b(\d{1,2}(?::\d{2})?\s*(?:pm|am|o'?clock|in the evening)?|(?:six|seven|eight|nine|ten)(?:\s*(?:thirty|fifteen))?(?:\s*(?:pm|o'?clock|in the evening))?)\b/i

const RE_GUESTS =
  /\b(?:(?:for\s+)?(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:people|guests|of us|persons|covers|pax)?|(?:just\s+)?(?:me|myself|us\s+two))\b/i

const WORD_NUMS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
}

function parseDate(text: string): string | null {
  const m = text.match(RE_DATE)
  if (!m) return null
  const raw = m[1].trim()
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function parseTime(text: string): string | null {
  const m = text.match(RE_TIME)
  return m ? m[1].trim() : null
}

function parseGuests(text: string): number | null {
  if (/just\s+(?:me|myself)\b/i.test(text)) return 1
  if (/us\s+two\b/i.test(text)) return 2
  const m = text.match(RE_GUESTS)
  if (!m) return null
  const raw = m[1]?.toLowerCase()
  if (!raw) return null
  if (WORD_NUMS[raw]) return WORD_NUMS[raw]
  const n = parseInt(raw, 10)
  return isNaN(n) ? null : n
}

function normaliseTime(raw: string): string {
  const wordTimes: Record<string, string> = {
    six: "6 pm", seven: "7 pm", eight: "8 pm", nine: "9 pm", ten: "10 pm",
    "six thirty": "6:30 pm", "seven thirty": "7:30 pm", "eight thirty": "8:30 pm",
  }
  const lower = raw.toLowerCase().trim()
  if (wordTimes[lower]) return wordTimes[lower]
  if (/pm|am/i.test(raw)) return raw.replace(/\s+/g, " ")
  const num = parseInt(raw, 10)
  if (!isNaN(num)) return `${num} pm`
  return raw
}

/* ═══════════════════════════════════════════════════════════════════
   Core reply resolver — multi-turn aware
   ═══════════════════════════════════════════════════════════════════ */

type ReplyResult = {
  text: string
  isBookingConfirmation: boolean
  bookingNote: string
}

function findReply(userText: string, allMessages: MsgLike[]): ReplyResult {
  /* ── Is the user asking to book the hotel restaurant? ─────────── */
  const wantsRestaurant =
    /book.*(?:restaurant|table|dinner)|(?:restaurant|table|dinner).*(?:book|reserv)|reserv.*table|table.*(?:tonight|tomorrow|this evening)|dinner.*(?:here|hotel|tonight|at the)|(?:can i|i'?d like|could.*(?:we|i)).*(?:eat|dine).*(?:here|hotel|downstairs|ground)/i.test(
      userText,
    )

  /* Are we already mid-conversation about the restaurant? */
  const inRestaurantFlow =
    assistantSaid(allMessages, "dinner is served from 6 pm until 10 pm") ||
    assistantSaid(allMessages, "how many will be dining") ||
    assistantSaid(allMessages, "which evening")

  /* ── STAGE 1 — Opening request ───────────────────────────────── */
  if (wantsRestaurant && !inRestaurantFlow) {
    const date = parseDate(userText)
    const time = parseTime(userText)
    const guests = parseGuests(userText)

    if (date && time && guests) {
      return buildConfirmation(date, normaliseTime(time), guests)
    }

    return {
      text: `Of course, Ms. Bennett. The restaurant is on the ground floor and dinner is served from 6 pm until 10 pm.

To hold the right table for you, I just need a few details:

  1. Date — which evening?
  2. Time — any preference between 6 pm and 9:30 pm?
  3. Guests — how many will be dining?

If you already have all three in mind, go ahead and I will check availability straight away.`,
      isBookingConfirmation: false,
      bookingNote: "",
    }
  }

  /* ── STAGES 2+ — Inside the restaurant flow ──────────────────── */
  if (inRestaurantFlow) {
    const allUserText = allMessages
      .filter((m) => m.role === "user")
      .map(textOf)
      .join(" ")
    const combined = allUserText + " " + userText

    const date = parseDate(combined)
    const time = parseTime(combined)
    const guests = parseGuests(combined)

    /* Wine pairing follow-up after booking is confirmed */
    if (
      assistantSaid(allMessages, "your reservation is confirmed") &&
      /wine|pair|sommelier/i.test(userText)
    ) {
      return {
        text: `Our sommelier, Clara, is excellent at this. For the seasonal menu she tends to recommend a crisp Chablis to begin, then a structured Burgundy with the main courses — but she will read the table and adjust.

If you prefer, I can ask her to prepare a full pairing for the table — four glasses matched to whatever the kitchen sends out. It is one of the more memorable parts of the evening.

Shall I add that to your reservation?`,
        isBookingConfirmation: false,
        bookingNote: "",
      }
    }

    /* "Yes" after sommelier offer */
    if (
      assistantSaid(allMessages, "sommelier") &&
      /yes|please|add|go ahead|sounds|do that|perfect|lovely/i.test(userText)
    ) {
      return {
        text: `Done. I have added the wine pairing to your reservation. Clara will have everything prepared when you arrive.

You can view your updated reservation anytime in the Concierge tab. Enjoy the evening, Ms. Bennett.`,
        isBookingConfirmation: false,
        bookingNote: "",
      }
    }

    /* All three pieces — confirm! */
    if (date && time && guests) {
      return buildConfirmation(date, normaliseTime(time), guests)
    }

    /* Date + time, missing guests */
    if (date && time) {
      return {
        text: `${date} at ${normaliseTime(time)} — lovely. And how many will be dining? Just so I can hold the right table for you.`,
        isBookingConfirmation: false,
        bookingNote: "",
      }
    }

    /* Date + guests, missing time */
    if (date && guests) {
      return {
        text: `${date}, party of ${guests} — noted. What time would suit you best? We have tables available at 6 pm, 7 pm, 7:30 pm, 8 pm, and 9 pm.`,
        isBookingConfirmation: false,
        bookingNote: "",
      }
    }

    /* Time + guests, missing date */
    if (time && guests) {
      return {
        text: `${normaliseTime(time)}, party of ${guests} — perfect. And which evening shall I book this for?`,
        isBookingConfirmation: false,
        bookingNote: "",
      }
    }

    /* Only date */
    if (date) {
      return {
        text: `${date} — wonderful. What time would you prefer, and how many guests? We have availability across most of the evening.`,
        isBookingConfirmation: false,
        bookingNote: "",
      }
    }

    /* Only time */
    if (time) {
      return {
        text: `${normaliseTime(time)} — a beautiful hour for dinner. Which evening, and how many guests?`,
        isBookingConfirmation: false,
        bookingNote: "",
      }
    }

    /* Only guests */
    if (guests) {
      return {
        text: `A party of ${guests} — noted. Which evening were you thinking, and do you have a preferred time?`,
        isBookingConfirmation: false,
        bookingNote: "",
      }
    }

    /* Couldn't parse anything — gentle re-ask */
    return {
      text: `I want to make sure I get this right. Could you let me know the date, the time you would prefer, and how many guests? I will check our availability straight away.`,
      isBookingConfirmation: false,
      bookingNote: "",
    }
  }

  /* ── Not a restaurant flow — flat catalogue ──────────────────── */
  for (const r of RESPONSES) {
    if (r.keywords.test(userText)) {
      return { text: r.reply, isBookingConfirmation: false, bookingNote: "" }
    }
  }

  return { text: FALLBACK_REPLY, isBookingConfirmation: false, bookingNote: "" }
}

/** Build the confirmation reply once we have date + time + guests. */
function buildConfirmation(date: string, time: string, guests: number): ReplyResult {
  const guestLabel = guests === 1 ? "1 guest" : `${guests} guests`
  const note = `Restaurant · ${date}, ${time}, ${guestLabel}`

  return {
    text: `Let me check that for you now.

One moment — I am looking at the table plan.

Wonderful news. I have a table available and your reservation is confirmed:

  Restaurant:  Arden House, Ground Floor
  Date:        ${date}
  Time:        ${time}
  Guests:      ${guestLabel}
  Table:       By the harbour windows

The kitchen will be expecting you. If you have any dietary needs or preferences — or if you would like a wine pairing prepared — just let me know ahead of time and I will pass it along.

You can view and manage your reservation in the Concierge tab, under "In progress."

Is there anything else I can help arrange for the evening, Ms. Bennett?`,
    isBookingConfirmation: true,
    bookingNote: note,
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Transport implementation
   ═══════════════════════════════════════════════════════════════════
   Implements the ChatTransport interface from the AI SDK:
     sendMessages      → returns ReadableStream<UIMessageChunk>
     reconnectToStream → returns null (no server-side stream to resume)
   ═══════════════════════════════════════════════════════════════════ */

type AnyUIMessage = UIMessage
type AnyChunk = UIMessageChunk

export class MockChatTransport implements ChatTransport<AnyUIMessage> {
  /** Callback fired when a restaurant booking is confirmed via chat. */
  onRestaurantBooked?: OnRestaurantBooked

  async sendMessages(
    options: Parameters<ChatTransport<AnyUIMessage>["sendMessages"]>[0],
  ): Promise<ReadableStream<AnyChunk>> {
    const messages = options.messages ?? []

    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    let userText = ""
    if (lastUser?.parts) {
      userText = lastUser.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("")
    }

    const result = findReply(userText, messages as MsgLike[])
    const partId = `mock-${Date.now()}`
    const onBooked = this.onRestaurantBooked
    const { text, isBookingConfirmation, bookingNote } = result

    return new ReadableStream<AnyChunk>({
      async start(controller) {
        await delay(600)

        controller.enqueue({ type: "text-start", id: partId } as AnyChunk)

        const chunkSize = 3
        for (let i = 0; i < text.length; i += chunkSize) {
          const delta = text.slice(i, i + chunkSize)
          controller.enqueue({ type: "text-delta", id: partId, delta } as AnyChunk)
          await delay(15 + Math.random() * 20)
        }

        controller.enqueue({ type: "text-end", id: partId } as AnyChunk)

        // Fire the booking callback so the concierge tab sees the request
        if (isBookingConfirmation && onBooked && bookingNote) {
          onBooked(bookingNote)
        }

        controller.close()
      },
    })
  }

  async reconnectToStream(): Promise<ReadableStream<AnyChunk> | null> {
    return null
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
