/*
 * Small procedural textures drawn on canvas, so the suite needs no image files.
 */

import * as React from "react"
import * as THREE from "three"
import { rng } from "./geometry"

function canvas(size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void, repeat = 1, color = false) {
  const c = document.createElement("canvas")
  c.width = c.height = size
  draw(c.getContext("2d")!, size)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat, repeat)
  t.anisotropy = 4
  if (color) t.colorSpace = THREE.SRGBColorSpace
  return t
}

function grain(ctx: CanvasRenderingContext2D, size: number, base: number, spread: number, seed: number) {
  const img = ctx.createImageData(size, size)
  const r = rng(seed)
  for (let i = 0; i < size * size; i++) {
    const v = base + (r() - 0.5) * spread
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v
    img.data[i * 4 + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
}

export type SuiteTextures = ReturnType<typeof makeTextures>

function makeTextures() {
  /* lime plaster: fine grain plus soft trowel sweeps */
  const plasterBump = canvas(256, (ctx, s) => {
    grain(ctx, s, 150, 50, 7)
    const r = rng(8)
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? 255 : 60},${r() > 0.5 ? 255 : 60},${r() > 0.5 ? 255 : 60},${0.03 + r() * 0.05})`
      ctx.beginPath()
      ctx.ellipse(r() * s, r() * s, 18 + r() * 60, 5 + r() * 16, r() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
  }, 3)

  /* faint warm and cool patches so white walls are never flat */
  const plasterTint = canvas(256, (ctx, s) => {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, s, s)
    const r = rng(21)
    for (let i = 0; i < 26; i++) {
      const g = ctx.createRadialGradient(r() * s, r() * s, 0, r() * s, r() * s, 40 + r() * 80)
      const warm = r() > 0.45
      g.addColorStop(0, warm ? "rgba(236,222,200,0.22)" : "rgba(214,224,230,0.18)")
      g.addColorStop(1, "rgba(255,255,255,0)")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, s, s)
    }
  }, 1.5, true)

  /* linen weave: crossing threads of uneven weight */
  const linen = canvas(128, (ctx, s) => {
    ctx.fillStyle = "#808080"
    ctx.fillRect(0, 0, s, s)
    const r = rng(31)
    for (let i = 0; i < s; i += 2) {
      ctx.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.35})`
      ctx.fillRect(0, i, s, 1)
      ctx.fillStyle = `rgba(0,0,0,${0.08 + r() * 0.3})`
      ctx.fillRect(i, 0, 1, s)
    }
  }, 6)

  /* chunky knit for the wool blanket */
  const knit = canvas(64, (ctx, s) => {
    ctx.fillStyle = "#707070"
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = "rgba(255,255,255,0.75)"
    ctx.lineWidth = 3
    for (let y = -8; y < s + 8; y += 8) {
      for (let x = 0; x < s; x += 8) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + 4, y + 6)
        ctx.lineTo(x + 8, y)
        ctx.stroke()
      }
    }
  }, 10)

  /* wood: long streaks of grain */
  const wood = canvas(256, (ctx, s) => {
    ctx.fillStyle = "#8a6748"
    ctx.fillRect(0, 0, s, s)
    const r = rng(41)
    for (let i = 0; i < 220; i++) {
      const x = r() * s
      ctx.strokeStyle = r() > 0.5 ? `rgba(58,38,22,${0.08 + r() * 0.2})` : `rgba(196,160,118,${0.06 + r() * 0.16})`
      ctx.lineWidth = 0.5 + r() * 2
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.bezierCurveTo(x + (r() - 0.5) * 14, s * 0.33, x + (r() - 0.5) * 14, s * 0.66, x + (r() - 0.5) * 8, s)
      ctx.stroke()
    }
  }, 1, true)

  /* cane webbing for the minibar doors */
  const cane = canvas(128, (ctx, s) => {
    ctx.fillStyle = "#c9a878"
    ctx.fillRect(0, 0, s, s)
    ctx.fillStyle = "#3d2c1c"
    for (let y = 4; y < s; y += 16) for (let x = 4; x < s; x += 16) {
      ctx.beginPath()
      ctx.arc(x + 4, y + 4, 4.2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.strokeStyle = "rgba(120,88,52,0.6)"
    ctx.lineWidth = 1.5
    for (let i = -s; i < s * 2; i += 16) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + s, s); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(i, s); ctx.lineTo(i + s, 0); ctx.stroke()
    }
  }, 3, true)

  /* flat-woven rug with island stripes */
  const rug = canvas(256, (ctx, s) => {
    ctx.fillStyle = "#d8c7a6"
    ctx.fillRect(0, 0, s, s)
    const bands: Array<[number, number, string]> = [
      [18, 10, "#b5673f"], [34, 3, "#3d6f84"], [44, 3, "#b5673f"],
      [118, 4, "#3d6f84"], [128, 12, "#f1e8d6"], [146, 4, "#3d6f84"],
      [206, 3, "#b5673f"], [216, 3, "#3d6f84"], [226, 10, "#b5673f"],
    ]
    for (const [y, h, c] of bands) {
      ctx.fillStyle = c
      ctx.fillRect(0, y, s, h)
    }
    const r = rng(51)
    for (let i = 0; i < s; i += 2) {
      ctx.fillStyle = `rgba(0,0,0,${r() * 0.12})`
      ctx.fillRect(i, 0, 1, s)
      ctx.fillStyle = `rgba(255,255,255,${r() * 0.1})`
      ctx.fillRect(0, i, s, 1)
    }
  }, 1, true)

  /* polished lime screed for the floor */
  const floor = canvas(256, (ctx, s) => {
    ctx.fillStyle = "#e4d9c6"
    ctx.fillRect(0, 0, s, s)
    const r = rng(61)
    for (let i = 0; i < 40; i++) {
      const g = ctx.createRadialGradient(r() * s, r() * s, 0, r() * s, r() * s, 30 + r() * 90)
      g.addColorStop(0, r() > 0.5 ? "rgba(196,180,152,0.25)" : "rgba(246,240,228,0.3)")
      g.addColorStop(1, "rgba(228,217,198,0)")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, s, s)
    }
  }, 2, true)

  /* large stone pavers for the terrace */
  const pavers = canvas(256, (ctx, s) => {
    ctx.fillStyle = "#e9e1d1"
    ctx.fillRect(0, 0, s, s)
    const r = rng(71)
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const off = y % 2 ? 32 : 0
      const l = 222 + r() * 22
      ctx.fillStyle = `rgb(${l},${l - 6},${l - 18})`
      ctx.fillRect(x * 64 + off + 1.5, y * 64 + 1.5, 61, 61)
      ctx.fillRect(x * 64 + off - s + 1.5, y * 64 + 1.5, 61, 61)
    }
  }, 4, true)

  /* a soft round sprite for dust, scent and embers */
  const dot = canvas(64, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, "rgba(255,255,255,1)")
    g.addColorStop(0.4, "rgba(255,255,255,0.35)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  })

  return { plasterBump, plasterTint, linen, knit, wood, cane, rug, floor, pavers, dot }
}

export function useSuiteTextures() {
  const tex = React.useMemo(() => makeTextures(), [])
  React.useEffect(() => () => Object.values(tex).forEach((t) => t.dispose()), [tex])
  return tex
}
