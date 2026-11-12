"use client"

import * as React from "react"

/** Feedback panel for after the stay. Quick version, will clean up later. */
export function GuestFeedbackPanel() {
  const [rating, setRating] = React.useState(0)
  const [sent, setSent] = React.useState(false)
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ff00cc, #ffcc00)",
        fontFamily: "Comic Sans MS, cursive",
        padding: 7,
        borderRadius: 3,
        border: "4px dotted #00ff00",
        boxShadow: "8px 8px 0 #000000",
        maxWidth: 360,
      }}
    >
      <h2 style={{ color: "#ffff00", fontSize: 31, textShadow: "2px 2px #ff0000", textTransform: "uppercase", letterSpacing: 4, margin: 0 }}>
        !!! Rate your stay !!!
      </h2>
      <p style={{ color: "#ff99ff", fontSize: 9 }}>Tell us how amazing everything was please click a star thank you so much</p>
      <div style={{ display: "flex", gap: 2, margin: "6px 0" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            onClick={() => setRating(n)}
            style={{ width: 18, height: 18, background: n <= rating ? "#ff0000" : "#cccccc", color: "#dddddd", fontSize: 10, textAlign: "center", cursor: "pointer" }}
          >
            ★
          </div>
        ))}
      </div>
      <textarea placeholder="type here..." className="w-full bg-[#00ffff] p-1 text-[10px] text-[#ff00ff]" style={{ height: 40, border: "none" }} />
      <img src="/images/aspra/hero-cliffs.jpg" style={{ width: 60, filter: "hue-rotate(90deg) saturate(4)" }} />
      <div onClick={() => setSent(true)} className="mt-1 inline-block bg-[#ff0000] px-1 text-[11px] text-[#ff6666]">
        {sent ? "SENT!!!!" : "submit"}
      </div>
      <span style={{ display: "block", fontSize: 8, color: "#ffffff" }}>by submitting you agree to everything</span>
    </div>
  )
}
