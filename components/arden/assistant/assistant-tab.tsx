"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp, Sparkles } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { type UIMessage } from "ai"
import { MockChatTransport } from "./mock-transport"
import { cn } from "@/lib/utils"
import { useArden } from "../arden-context"
import { guest, hotel } from "../data"
import { GoldRule } from "../primitives"

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  const raw = msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
  // Strip stray markdown emphasis — we render plain prose in serif.
  return raw.replace(/\*\*(.+?)\*\*/g, "$1").replace(/(^|\s)_(.+?)_(?=\s|[.,!?;:]|$)/g, "$1$2")
}

const SUGGESTIONS = [
  "I'd like to book a table at the restaurant for tomorrow.",
  "I need a meeting room for tomorrow morning.",
  "Can you send housekeeping to clean my room?",
]

export function AssistantTab() {
  const { booking, jumpTo, addRequest } = useArden()
  const [input, setInput] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const context = React.useMemo(
    () =>
      [
        `Guest: ${guest.title} ${guest.firstName} ${guest.lastName} (${guest.loyaltyTier})`,
        `Current booking: ${booking.roomName} (${booking.roomTypeId}), ${booking.nights} nights from ${booking.checkIn} to ${booking.checkOut}. Reference ${booking.id}.`,
        `Hotel check-in ${hotel.checkInTime}, check-out ${hotel.checkOutTime}.`,
        `Human concierge on duty: ${hotel.conciergeName}.`,
      ].join("\n"),
    [booking],
  )

  const mockTransport = React.useMemo(() => {
    const t = new MockChatTransport()
    return t
  }, [])

  // Wire up the restaurant booking callback so confirmed bookings
  // appear in the Concierge "In progress" list.
  React.useEffect(() => {
    mockTransport.onRestaurantBooked = (note: string) => {
      addRequest({ service: "reception", note })
    }
    return () => { mockTransport.onRestaurantBooked = undefined }
  }, [mockTransport, addRequest])

  const { messages, sendMessage, status, error } = useChat({
    transport: mockTransport,
  })

  // Ref-based send so the auto-reply effect can call it without
  // re-triggering itself when `status` changes.
  const sendRef = React.useRef<(text: string) => void>(() => {})

  const send = React.useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || status === "streaming" || status === "submitted") return
      sendMessage({ text: trimmed }, { body: { context } })
      setInput("")
    },
    [status, sendMessage, context],
  )

  // Keep ref in sync
  React.useEffect(() => {
    sendRef.current = send
  }, [send])

  /* ── Auto-reply for restaurant booking demo ────────────────────
   *  When the assistant just finished its restaurant prompt
   *  ("Dinner is served from 6 pm until 10 pm"), wait 2 s then
   *  inject a mock user response so the full booking round-trip
   *  plays out without manual typing.
   * ───────────────────────────────────────────────────────────── */
  const autoRepliedRef = React.useRef(false)

  React.useEffect(() => {
    // Only fire when the stream has finished
    if (status !== "ready" || messages.length === 0) return

    const last = messages[messages.length - 1]
    if (last.role !== "assistant") return

    const text = getUIMessageText(last)

    // Stage 1 → auto-reply with date, time, guests
    if (
      text.includes("Dinner is served from 6 pm until 10 pm") &&
      !autoRepliedRef.current
    ) {
      autoRepliedRef.current = true
      const timer = setTimeout(() => {
        sendRef.current("Tomorrow evening at 7:30 pm, for 2 people please.")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [messages, status])

  // Auto-scroll on new messages
  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages])

  const isBusy = status === "streaming" || status === "submitted"
  const isEmpty = messages.length === 0

  return (
    <section className="relative flex h-svh w-full flex-col">
      {/* Header */}
      <header className="shrink-0 px-5 pt-[calc(84px+env(safe-area-inset-top))] pb-4 sm:px-8">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-2 flex items-center gap-2 font-sans text-[10.5px] tracking-[0.28em] uppercase text-ink-muted">
            <Sparkles className="h-3 w-3 text-gold-deep" strokeWidth={1.5} />
            Assistant
          </div>
          <h2 className="text-display text-ink text-[26px] sm:text-[30px] leading-[1.05] text-balance">
            {isEmpty ? (
              <>
                Ask the hotel
                <br />
                <span className="italic font-light text-ink-soft">for what you need.</span>
              </>
            ) : (
              <>
                {hotel.conciergeName}{" "}
                <span className="italic font-light text-ink-soft">can help.</span>
              </>
            )}
          </h2>
          {isEmpty ? <GoldRule className="mt-4" /> : null}
        </div>
      </header>

      {/* Body — messages or suggestions */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 sm:px-8 pb-4"
      >
        <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-2"
            >
              <p className="max-w-prose font-serif italic text-ink-soft text-[16px] leading-relaxed">
                Ask about your room, arrival time, meeting rooms, dining, transport,
                or jet-lag support. We&apos;ll keep the answer practical.
              </p>

              <div className="mt-7 flex flex-col gap-2">
                <div className="mb-1 font-sans text-[10.5px] tracking-[0.26em] uppercase text-ink-muted">
                  Try
                </div>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className={cn(
                      "group rounded-[18px] glass-soft px-4 py-3.5 text-left",
                      "transition-all duration-500 hover:border-[color-mix(in_oklch,white_40%,var(--cream)_30%)]!",
                    )}
                  >
                    <span className="font-serif italic text-[15.5px] leading-relaxed text-ink-soft group-hover:text-ink transition-colors duration-500">
                      {s}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-2 font-serif italic text-[13px] text-ink-muted">
                <span className="inline-block h-1 w-1 rounded-full bg-gold" />
                Need a human? Tap{" "}
                <button
                  type="button"
                  onClick={() => jumpTo("concierge")}
                  className="underline-offset-2 hover:underline hover:text-ink"
                >
                  Concierge
                </button>
                .
              </div>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </AnimatePresence>
          )}

          {isBusy ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="self-start"
            >
              <TypingDots />
            </motion.div>
          ) : null}

          {error ? (
            <div className="rounded-[18px] glass-card p-4 font-serif italic text-[14px] text-ink-soft">
              The assistant couldn&apos;t be reached just now. Please try again in a moment.
            </div>
          ) : null}
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 glass-warm px-5 pb-[calc(84px+env(safe-area-inset-bottom))] pt-3 sm:px-8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="mx-auto flex w-full max-w-xl items-end gap-2"
        >
          <div className="flex-1 rounded-[20px] glass-soft px-4 py-2.5 focus-within:border-[color-mix(in_oklch,var(--gold)_50%,transparent)]! transition-all duration-500">
            <TextareaInput
              value={input}
              onChange={setInput}
              onSubmit={() => send(input)}
              placeholder="Ask for anything…"
            />
          </div>
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            aria-label="Send"
            className={cn(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
              "bg-ink text-cream shadow-[0_20px_40px_-22px_color-mix(in_oklch,var(--ink)_60%,transparent)]",
              "transition-all duration-400",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "hover:bg-[color-mix(in_oklch,var(--ink)_92%,var(--terracotta)_8%)]",
            )}
          >
            <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </section>
  )
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text = getUIMessageText(message)
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-[20px] px-4 py-3",
          isUser
            ? "bg-ink text-cream rounded-br-[6px]"
            : "glass-card text-ink rounded-bl-[6px]",
        )}
      >
        <p
          className={cn(
            "font-serif leading-relaxed text-pretty whitespace-pre-wrap",
            isUser ? "text-[15px]" : "text-[15.5px]",
          )}
        >
          {text}
        </p>
      </div>
    </motion.div>
  )
}

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 rounded-[20px] glass-card px-4 py-3 rounded-bl-[6px]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-ink-muted"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.18,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

function TextareaInput({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder?: string
}) {
  const ref = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          onSubmit()
        }
      }}
      placeholder={placeholder}
      className="block w-full resize-none bg-transparent font-serif text-[15.5px] leading-relaxed text-ink placeholder:text-ink-muted/60 focus:outline-none"
    />
  )
}
