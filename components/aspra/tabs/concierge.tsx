"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, CalendarPlus, Check, ChevronRight, Phone, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAspra } from "../store"
import { experienceById, hotel } from "../data"
import { ArchMark, EASE } from "../ui"
import {
  contextSummary,
  localReply,
  phasePrompts,
  type ConciergeAction,
  type ConciergeContext,
} from "../concierge-engine"

type Message = {
  id: string
  role: "user" | "assistant"
  text: string
  actions?: ConciergeAction[]
  done?: Set<number>
}

let mid = 0
const msgId = () => `m${mid++}`

/** Reveal text word by word so a local reply reads like a live one. */
async function reveal(text: string, onChunk: (t: string) => void, signal: { cancelled: boolean }) {
  const parts = text.split(/(\s+)/)
  let out = ""
  for (const p of parts) {
    if (signal.cancelled) return
    out += p
    onChunk(out)
    if (p.trim()) await new Promise((r) => setTimeout(r, 14))
  }
}

export function ConciergeTab() {
  const store = useAspra()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const endRef = React.useRef<HTMLDivElement>(null)
  const signal = React.useRef({ cancelled: false })

  const ctx: ConciergeContext = {
    guest: store.guest,
    phase: store.booking ? store.phase : "after",
    booking: store.booking,
    prefs: store.prefs,
    plan: store.plan,
    pastStay: store.pastStay,
  }
  const ctxRef = React.useRef(ctx)
  ctxRef.current = ctx

  // New guest, new conversation.
  React.useEffect(() => {
    signal.current.cancelled = true
    setMessages([])
    setBusy(false)
  }, [store.kind])

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  const send = React.useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || busy) return
      setInput("")
      setBusy(true)
      signal.current = { cancelled: false }
      const sig = signal.current
      const history = [...messages, { id: msgId(), role: "user" as const, text }]
      const replyId = msgId()
      setMessages([...history, { id: replyId, role: "assistant", text: "" }])

      const local = localReply(text, ctxRef.current)
      const update = (t: string) =>
        setMessages((m) => m.map((x) => (x.id === replyId ? { ...x, text: t } : x)))

      let usedModel = false
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: contextSummary(ctxRef.current),
            messages: history.map((m) => ({ role: m.role, content: m.text })),
          }),
        })
        if (res.ok && res.body) {
          usedModel = true
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let acc = ""
          for (;;) {
            const { value, done } = await reader.read()
            if (done || sig.cancelled) break
            acc += decoder.decode(value, { stream: true })
            update(acc)
          }
          if (!acc.trim()) usedModel = false
        }
      } catch {
        usedModel = false
      }

      if (!usedModel) {
        await new Promise((r) => setTimeout(r, 450))
        await reveal(local.text, update, sig)
      }
      if (!sig.cancelled) {
        setMessages((m) => m.map((x) => (x.id === replyId ? { ...x, actions: local.actions, done: new Set() } : x)))
        setBusy(false)
      }
    },
    [busy, messages],
  )

  // Questions sent from other tabs land here.
  React.useEffect(() => {
    if (store.tab !== "concierge" || !store.conciergeDraft || busy) return
    const draft = store.consumeDraft()
    if (draft) send(draft)
  }, [store.tab, store.conciergeDraft, busy, send, store])

  function runAction(msg: Message, index: number, a: ConciergeAction) {
    if (msg.done?.has(index)) return
    if (a.kind === "add") {
      if (!store.booking) {
        store.notify("Book a stay first, then I can add this to your plan.")
        return
      }
      store.addToPlan(a.experienceId, a.day, a.time)
      store.notify(`${experienceById(a.experienceId).name} added to your plan.`)
    } else if (a.kind === "request") {
      store.addRequest(a.request)
    } else if (a.kind === "tab") {
      store.setTab(a.tab)
      return
    } else if (a.kind === "rebook") {
      window.dispatchEvent(new Event("aspra:rebook"))
      return
    }
    setMessages((m) =>
      m.map((x) => (x.id === msg.id ? { ...x, done: new Set([...(x.done ?? []), index]) } : x)),
    )
  }

  const prompts = phasePrompts(ctx.phase, !!store.booking)
  const empty = messages.length === 0

  return (
    <div className="on-dark mx-auto flex min-h-[100svh] w-full max-w-[760px] flex-col text-white lg:min-h-[calc(100svh-24px)]">
      <header className="sticky top-0 z-[var(--z-nav)] flex items-center gap-3 border-b border-white/10 bg-obsidian/30 px-5 pb-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-xl lg:rounded-[28px] lg:border lg:border-white/10">
        <span className="grid size-11 place-items-center rounded-full bg-white text-obsidian">
          <ArchMark className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-[17px] font-semibold">Nefeli</h1>
          <p className="flex items-center gap-1.5 text-[13px] text-white/70">
            <span className="size-2 rounded-full bg-[oklch(0.75_0.15_150)]" aria-hidden />
            Concierge, any hour
          </p>
        </div>
        <a
          href={`tel:${hotel.receptionPhone.replace(/\s/g, "")}`}
          aria-label={`Call reception, ${hotel.receptionPhone}`}
          className="grid size-11 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10"
        >
          <Phone className="size-[18px]" />
        </a>
      </header>

      <div className="flex-1 px-5 pb-[calc(220px+env(safe-area-inset-bottom))] pt-6 lg:pb-40" aria-live="polite">
        {empty && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <h2 className="font-display text-[34px] leading-[1.02]">
              {greeting(ctx)}
            </h2>
            <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-white/80">
              I know your booking and what you like. Ask me to plan a day, book a table or the boat, or send something to your suite. {hotel.humanConcierge} and the reception team are here all night if you would rather talk to a person.
            </p>
            <ul className="mt-7 space-y-2">
              {prompts.map((p) => (
                <li key={p}>
                  <button
                    onClick={() => send(p)}
                    className="glass-dark flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-[15px] transition-colors hover:bg-white/15"
                  >
                    {p}
                    <ChevronRight className="size-4 shrink-0 text-sulphur" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <ol className="space-y-5">
          {messages.map((m) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}
            >
              {m.role === "user" ? (
                <div className="max-w-[82%] md:max-w-[70%] rounded-3xl rounded-br-lg bg-sea px-4 py-2.5 text-[15px] text-white">
                  {m.text}
                </div>
              ) : (
                <div className="w-full max-w-[94%] md:max-w-[80%]">
                  {m.text ? (
                    <div className="glass-dark whitespace-pre-line rounded-3xl rounded-bl-lg px-4 py-3 text-[15.5px] leading-relaxed text-white">{m.text}</div>
                  ) : (
                    <div className="flex h-6 items-center gap-1.5" aria-label="Nefeli is writing">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="animate-typing size-1.5 rounded-full bg-white/70" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                  <AnimatePresence>
                    {m.actions && m.actions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="mt-3 flex flex-wrap gap-2"
                      >
                        {m.actions.map((a, i) => {
                          const done = m.done?.has(i)
                          return (
                            <button
                              key={i}
                              disabled={done}
                              onClick={() => runAction(m, i, a)}
                              className={cn(
                                "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors",
                                done ? "bg-white/10 text-white/80" : "bg-white text-obsidian hover:bg-chalk-2",
                              )}
                            >
                              {done ? (
                                <Check className="size-4 text-sulphur" aria-hidden />
                              ) : a.kind === "add" ? (
                                <CalendarPlus className="size-4 text-sea" aria-hidden />
                              ) : a.kind === "request" ? (
                                <Send className="size-4 text-sea" aria-hidden />
                              ) : (
                                <ChevronRight className="size-4 text-sea" aria-hidden />
                              )}
                              {done ? (a.kind === "add" ? "Added to your plan" : "Sent") : a.label}
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.li>
          ))}
        </ol>
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="fixed bottom-[calc(64px+max(env(safe-area-inset-bottom),10px))] left-1/2 z-[var(--z-nav)] w-full max-w-[440px] -translate-x-1/2 px-4 pb-3 pt-2 md:max-w-[760px] lg:bottom-3 lg:left-[calc(50%+136px)]"
      >
        {!empty && (
          <div className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4">
            {prompts.slice(0, 3).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => send(p)}
                disabled={busy}
                className="glass-smoke h-9 shrink-0 rounded-full px-3.5 text-[13px] text-white/90 disabled:opacity-40"
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <div className="glass-smoke flex items-end gap-2 rounded-[26px] p-1.5 pl-4 focus-within:border-white/50">
          <label htmlFor="concierge-input" className="sr-only">
            Message Nefeli
          </label>
          <textarea
            id="concierge-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            placeholder="Message Nefeli"
            className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-[16px] text-white placeholder:text-white/55 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!input.trim() || busy}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-obsidian transition-opacity disabled:opacity-35"
          >
            <ArrowUp className="size-5" strokeWidth={2.4} />
          </button>
        </div>
      </form>
    </div>
  )
}

function greeting(c: ConciergeContext) {
  const n = c.guest.firstName ? `, ${c.guest.firstName}` : ""
  if (!c.booking) return `Welcome back${n}. What can I do?`
  if (c.phase === "before") return `Yassou${n}. How can I help before you travel?`
  if (c.phase === "during") return `Kalimera${n}. What would you like today?`
  return `Hello again${n}. What can I help with from home?`
}
