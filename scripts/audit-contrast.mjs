// WCAG 2.1 contrast audit for the  Pierpont palette.
// Converts OKLCH tokens from globals.css to sRGB, then computes contrast ratios.

// --- OKLCH -> linear sRGB -> sRGB (approximation of CSS Color 4) ---
function oklchToRgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  // OKLab -> LMS
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  // LMS -> linear sRGB
  let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  let bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  // gamma encode
  const enc = (u) => {
    const abs = Math.abs(u)
    const sign = u < 0 ? -1 : 1
    return abs <= 0.0031308 ? 12.92 * u : sign * (1.055 * abs ** (1 / 2.4) - 0.055)
  }
  const clamp = (u) => Math.min(1, Math.max(0, u))
  return [clamp(enc(r)), clamp(enc(g)), clamp(enc(bl))]
}

function relLuminance([r, g, b]) {
  const lin = (u) => (u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(fg, bg) {
  const L1 = relLuminance(fg)
  const L2 = relLuminance(bg)
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1]
  return (hi + 0.05) / (lo + 0.05)
}

function hex([r, g, b]) {
  const c = (u) => Math.round(u * 255).toString(16).padStart(2, "0")
  return "#" + c(r) + c(g) + c(b)
}

const tokens = {
  cream: oklchToRgb(0.965, 0.015, 78),
  "cream-soft": oklchToRgb(0.945, 0.02, 78),
  beige: oklchToRgb(0.9, 0.025, 75),
  tan: oklchToRgb(0.82, 0.04, 70),
  "tan-deep": oklchToRgb(0.7, 0.05, 60),
  ink: oklchToRgb(0.22, 0.015, 55),
  "ink-soft": oklchToRgb(0.38, 0.02, 55),
  "ink-muted": oklchToRgb(0.5, 0.025, 60),
  terracotta: oklchToRgb(0.5, 0.13, 38),
  "terracotta-soft": oklchToRgb(0.72, 0.08, 45),
  gold: oklchToRgb(0.72, 0.09, 78),
  "gold-deep": oklchToRgb(0.5, 0.12, 70),
}

console.log("\nRESOLVED TOKENS")
console.log("================")
for (const [name, rgb] of Object.entries(tokens)) {
  console.log(`${name.padEnd(16)} ${hex(rgb)}`)
}

const pairs = [
  // Body text on canvas
  ["ink", "cream"],
  ["ink", "cream-soft"],
  ["ink", "beige"],
  ["ink-soft", "cream"],
  ["ink-soft", "cream-soft"],
  ["ink-muted", "cream"],
  ["ink-muted", "cream-soft"],
  ["ink-muted", "beige"],
  // Inverted: cream text on dark backgrounds
  ["cream", "ink"],
  ["cream", "ink-soft"],
  // Gold text — often used as an accent label
  ["gold", "cream"],
  ["gold-deep", "cream"],
  ["gold-deep", "cream-soft"],
  // Terracotta (primary button)
  ["cream", "terracotta"],
  ["ink", "terracotta"],
  ["terracotta", "cream"],
  ["terracotta", "cream-soft"],
  // Chips / badges
  ["ink-muted", "tan"],
  ["ink", "tan"],
]

console.log("\nWCAG CONTRAST RATIOS (AA target: 4.5 body / 3.0 large/UI)")
console.log("=========================================================")
for (const [fg, bg] of pairs) {
  const ratio = contrast(tokens[fg], tokens[bg])
  const pass = ratio >= 4.5 ? "AA body" : ratio >= 3.0 ? "AA large only" : "FAIL"
  const mark = ratio >= 4.5 ? "PASS" : ratio >= 3.0 ? "WARN" : "FAIL"
  console.log(
    `${mark.padEnd(5)} ${ratio.toFixed(2).padStart(5)}:1  ${fg} on ${bg}  (${pass})`,
  )
}
