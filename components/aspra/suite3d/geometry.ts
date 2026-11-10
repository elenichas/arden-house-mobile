/*
 * Geometry for the Aspra suite, built in code.
 * Dimensions are in metres, y is up, the sea is towards -z.
 */

import * as THREE from "three"
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js"

export type Vec3 = [number, number, number]

/** Half width of the room, height where the vault springs, half depth. */
export const W = 2.5
export const WALL_H = 1.2
export const HALF_D = 3.45
/** Thickness of the sea wall the arch is cut through. */
export const WALL_T = 0.55

/* ─── Deterministic noise ───────────────────────────────────── */

export function rng(seed: number) {
  let t = seed
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return s - Math.floor(s)
}

export function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = x - xi, yf = y - yi, zf = z - zi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf)
  const l = (a: number, b: number, t: number) => a + (b - a) * t
  return l(
    l(l(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), l(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
    l(l(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), l(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v),
    w,
  )
}

export function fbm(x: number, y: number, z: number, octaves = 3) {
  let a = 0.5, sum = 0, norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += a * noise3(x, y, z)
    norm += a
    x *= 2.03; y *= 2.03; z *= 2.03
    a *= 0.5
  }
  return sum / norm
}

/* ─── Room section shapes ───────────────────────────────────── */

export function roomSection(w: number, h: number) {
  const s = new THREE.Shape()
  s.moveTo(-w, 0)
  s.lineTo(w, 0)
  s.lineTo(w, h)
  s.absarc(0, h, w, 0, Math.PI, false)
  s.lineTo(-w, 0)
  return s
}

export function archPath(cx: number, halfW: number, bottom: number, springY: number) {
  const p = new THREE.Path()
  p.moveTo(cx - halfW, bottom)
  p.lineTo(cx + halfW, bottom)
  p.lineTo(cx + halfW, springY)
  p.absarc(cx, springY, halfW, 0, Math.PI, false)
  p.lineTo(cx - halfW, bottom)
  return p
}

/**
 * The walls and vault as one hand-plastered surface. Each vertex is pushed in
 * or out by a few centimetres so the room reads as carved, not extruded.
 */
export function shellGeometry() {
  const wallSeg = 6, arcSeg = 48, zSeg = 34
  type P = { x: number; y: number; nx: number; ny: number; s: number }
  const profile: P[] = []
  for (let i = 0; i <= wallSeg; i++) {
    const y = (i / wallSeg) * WALL_H
    profile.push({ x: -W, y, nx: -1, ny: 0, s: y })
  }
  let s = WALL_H
  for (let k = 1; k <= arcSeg; k++) {
    const a = Math.PI - (k / arcSeg) * Math.PI
    s += (Math.PI * W) / arcSeg
    profile.push({ x: W * Math.cos(a), y: WALL_H + W * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a), s })
  }
  for (let i = 1; i <= wallSeg; i++) {
    const y = WALL_H - (i / wallSeg) * WALL_H
    profile.push({ x: W, y, nx: 1, ny: 0, s: s + (WALL_H - y) })
  }

  const z0 = -HALF_D - 0.25, z1 = HALF_D + 0.25
  const pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (let j = 0; j <= zSeg; j++) {
    const z = z0 + (j / zSeg) * (z1 - z0)
    for (const p of profile) {
      const big = (fbm(p.x * 0.7 + 3, p.y * 0.7, z * 0.7) - 0.5) * 0.16
      const fine = (fbm(p.x * 2.6, p.y * 2.6 + 9, z * 2.6, 2) - 0.5) * 0.035
      const settle = Math.min(1, p.y / 0.25) // keep the foot of the wall straight
      const d = (big + fine) * settle
      pos.push(p.x - p.nx * d, p.y - p.ny * d, z)
      uv.push(p.s / 1.6, z / 1.6)
    }
  }
  const n = profile.length
  for (let j = 0; j < zSeg; j++) {
    for (let i = 0; i < n - 1; i++) {
      const a = j * n + i, b = a + 1, c = a + n, d = c + 1
      idx.push(a, c, b, b, c, d)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** A weathered rock: an icosphere pushed around by noise. */
export function rockGeometry(seed: number, detail = 3, rough = 0.35) {
  const base = new THREE.IcosahedronGeometry(1, detail)
  base.deleteAttribute("uv")
  base.deleteAttribute("normal")
  const g = mergeVertices(base)
  const p = g.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const d = 1 + (fbm(v.x * 1.3 + seed, v.y * 1.3, v.z * 1.3, 4) - 0.5) * 2 * rough
    v.multiplyScalar(d)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

/**
 * A pillow: two quilted surfaces meeting at a seam.
 * `puff` near 1 is a plump feather pillow, near 0.2 is a flat firm slab.
 */
export function pillowGeometry(
  depth: number,
  width: number,
  height: number,
  { puff = 0.6, pinch = 0.08, wrinkle = 0.1, slump = 0, seed = 1 } = {},
) {
  const N = 22
  const pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (const side of [1, -1]) {
    const base = pos.length / 3
    for (let j = 0; j <= N; j++) {
      for (let i = 0; i <= N; i++) {
        const u = (i / N) * 2 - 1, v = (j / N) * 2 - 1
        const x = u * (depth / 2) * (1 - pinch * (1 - v * v) * u * u)
        const z = v * (width / 2) * (1 - pinch * (1 - u * u) * v * v)
        const body = Math.max(0, (1 - Math.abs(u) ** 2.4) * (1 - Math.abs(v) ** 2.4))
        let t = (height / 2) * Math.pow(body, 1 - puff * 0.75)
        t *= 1 + (fbm(u * 2.2 + seed, v * 2.2, side * 3, 2) - 0.5) * wrinkle * 2
        // a feather pillow sinks a little in the middle
        t *= 1 - slump * Math.exp(-(u * u + v * v) * 3)
        pos.push(x, side * t, z)
        uv.push(i / N, j / N)
      }
    }
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const a = base + j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1
        if (side > 0) idx.push(a, c, b, b, c, d)
        else idx.push(a, b, c, b, d, c)
      }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/**
 * Bedding laid over a mattress: wrinkled on top, falling over the sides and foot.
 * Local origin is the head end, centred on the mattress, at mattress-top height.
 */
export function beddingGeometry({
  length,
  width,
  loft,
  wrinkle,
  overhang = 0.26,
  seed = 1,
}: {
  length: number
  width: number
  loft: number
  wrinkle: number
  overhang?: number
  seed?: number
}) {
  const nx = 46, nz = 34
  const totalL = length + overhang, totalW = width + overhang * 2
  const pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (let i = 0; i <= nx; i++) {
    for (let j = 0; j <= nz; j++) {
      let x = (i / nx) * totalL
      let z = (j / nz - 0.5) * totalW
      let y = loft
      y += (fbm(x * 2.8 + seed, 1.7, z * 2.8, 3) - 0.5) * wrinkle
      y += Math.sin(x * 6.5 + fbm(x, seed, z * 2) * 5) * wrinkle * 0.12
      // the turned-down fold at the head end
      if (x < 0.26) y += loft * 0.9 * (1 - x / 0.26) ** 2 + 0.012
      const az = Math.abs(z) - width / 2
      if (az > 0) {
        const k = Math.min(az / 0.07, 1)
        z = Math.sign(z) * (width / 2 + 0.04 * Math.sin((k * Math.PI) / 2) + (fbm(x * 5, seed, 0.5, 2) - 0.5) * 0.02)
        y = y * (1 - k) - Math.max(0, az - 0.035) * 0.92
      }
      const ax = x - length
      if (ax > 0) {
        const k = Math.min(ax / 0.07, 1)
        x = length + 0.04 * Math.sin((k * Math.PI) / 2)
        y = Math.min(y, y * (1 - k) - Math.max(0, ax - 0.035) * 0.92)
      }
      pos.push(x, y, z)
      uv.push((i / nx) * 3, (j / nz) * 3)
    }
  }
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      const a = i * (nz + 1) + j, b = a + 1, c = a + nz + 1, d = c + 1
      idx.push(a, b, c, b, d, c)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** Solid of revolution from [radius, height] pairs. */
export function lathe(points: Array<[number, number]>, segments = 32) {
  return new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), segments)
}
