"use client"

/*
 * Everything inside the suite. Each customisable object reads the guest's
 * preferences, so a choice in the panel changes the model itself.
 */

import * as React from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { Html, RoundedBox } from "@react-three/drei"
import { beddingFor, type Flowers, type Fridge, type Linen, type Pillow, type Prefs, type Scent, type Welcome } from "../data"
import { useSuite } from "./context"
import { W, WALL_H, beddingGeometry, lathe, pillowGeometry, rng, type Vec3 } from "./geometry"

const PLASTER = "#f6f2ea"
const LINEN: Record<Linen, string> = { white: "#f4f1ea", sand: "#d9c3a0", sea: "#6f97b3" }

/* ─── Instancing helper ─────────────────────────────────────── */

type Inst = { p: Vec3; r?: Vec3; s: Vec3; c: string }

function Instances({
  items,
  children,
  roughness = 0.85,
  castShadow = true,
}: {
  items: Inst[]
  children: React.ReactNode
  roughness?: number
  castShadow?: boolean
}) {
  const ref = React.useRef<THREE.InstancedMesh>(null)
  React.useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new THREE.Object3D()
    const col = new THREE.Color()
    items.forEach((it, i) => {
      o.position.set(...it.p)
      o.rotation.set(...(it.r ?? [0, 0, 0]))
      o.scale.set(...it.s)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, col.set(it.c))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
  }, [items])
  if (items.length === 0) return null
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow={castShadow} receiveShadow>
      {children}
      <meshStandardMaterial roughness={roughness} />
    </instancedMesh>
  )
}

function usePlaster() {
  const { tex } = useSuite()
  return React.useMemo(
    () => new THREE.MeshStandardMaterial({ color: PLASTER, map: tex.plasterTint, bumpMap: tex.plasterBump, bumpScale: 0.5, roughness: 0.94 }),
    [tex],
  )
}

function useWood(color = "#ffffff") {
  const { tex } = useSuite()
  return React.useMemo(
    () => new THREE.MeshStandardMaterial({ color, map: tex.wood, bumpMap: tex.wood, bumpScale: 0.25, roughness: 0.62 }),
    [tex, color],
  )
}

/* ─── Bed ───────────────────────────────────────────────────── */

const PILLOWS: Record<Pillow, { args: [number, number, number]; opts: Parameters<typeof pillowGeometry>[3]; color?: string }> = {
  feather: { args: [0.46, 0.74, 0.25], opts: { puff: 0.92, pinch: 0.1, wrinkle: 0.14, slump: 0.2 } },
  "no-feather": { args: [0.44, 0.72, 0.2], opts: { puff: 0.74, pinch: 0.07, wrinkle: 0.05 } },
  firm: { args: [0.4, 0.68, 0.13], opts: { puff: 0.22, pinch: 0.02, wrinkle: 0.02 } },
  buckwheat: { args: [0.34, 0.52, 0.14], opts: { puff: 0.55, pinch: 0.05, wrinkle: 0.22, slump: 0.3 }, color: "#cbb994" },
}

export function Bed({ prefs }: { prefs: Prefs }) {
  const { tex } = useSuite()
  const plaster = usePlaster()
  const cz = -0.2
  const bedding = beddingFor(prefs.temperature).id
  const beds = prefs.bed === "king" ? [{ z: cz, w: 2.0 }] : [{ z: cz - 0.56, w: 0.94 }, { z: cz + 0.56, w: 0.94 }]
  const linen = LINEN[prefs.linen]

  const geoms = React.useMemo(() => {
    const w = prefs.bed === "king" ? 2.0 : 0.94
    return {
      cover:
        bedding === "sheet"
          ? beddingGeometry({ length: 1.2, width: w, loft: 0.006, wrinkle: 0.018, seed: 3 })
          : beddingGeometry({ length: 1.52, width: w, loft: 0.055, wrinkle: 0.055, seed: 5 }),
      blanket: beddingGeometry({ length: 0.5, width: w, loft: 0.02, wrinkle: 0.022, overhang: 0.2, seed: 9 }),
      sheetFold: beddingGeometry({ length: 0.34, width: w, loft: 0.012, wrinkle: 0.012, overhang: 0.02, seed: 4 }),
    }
  }, [prefs.bed, bedding])

  const pillow = PILLOWS[prefs.pillow]
  const pillowGeom = React.useMemo(() => pillowGeometry(...pillow.args, pillow.opts), [pillow])
  const top = 0.665

  return (
    <group>
      {/* plaster platform with a headboard ledge, built into the wall */}
      <RoundedBox args={[2.36, 0.42, 2.44]} radius={0.09} smoothness={5} position={[-1.3, 0.21, cz]} material={plaster} castShadow receiveShadow />
      <RoundedBox args={[0.26, 0.86, 2.44]} radius={0.1} smoothness={5} position={[-2.37, 0.43, cz]} material={plaster} castShadow receiveShadow />

      {beds.map((b, i) => (
        <group key={`${prefs.bed}-${i}`}>
          <RoundedBox args={[2.0, 0.24, b.w]} radius={0.07} smoothness={5} position={[-1.25, 0.54, b.z]} castShadow receiveShadow>
            <meshStandardMaterial color="#f8f6f1" roughness={1} bumpMap={tex.linen} bumpScale={0.15} />
          </RoundedBox>

          {/* cover: sheet, duvet, or duvet plus blanket, depending on the temperature chosen */}
          <mesh
            key={bedding}
            geometry={geoms.cover}
            position={[bedding === "sheet" ? -1.45 : -1.77, top, b.z]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={bedding === "sheet" ? "#f8f6f1" : linen} roughness={1} bumpMap={tex.linen} bumpScale={0.35} side={THREE.DoubleSide} />
          </mesh>
          {bedding === "sheet" && (
            <mesh geometry={geoms.sheetFold} position={[-1.52, top + 0.012, b.z]} castShadow>
              <meshStandardMaterial color={linen} roughness={1} bumpMap={tex.linen} bumpScale={0.35} side={THREE.DoubleSide} />
            </mesh>
          )}
          {bedding === "blanket" && (
            <mesh geometry={geoms.blanket} position={[-0.75, top + 0.085, b.z]} castShadow>
              <meshStandardMaterial color="#b9825a" roughness={1} bumpMap={tex.knit} bumpScale={1.2} side={THREE.DoubleSide} />
            </mesh>
          )}

          {/* pillows: a standing row against the headboard, a lying row in front */}
          {(prefs.bed === "king" ? [-0.48, 0.48] : [0]).map((dz) => (
            <group key={dz}>
              <mesh geometry={pillowGeom} position={[-2.08, top + 0.215, b.z + dz]} rotation-z={Math.PI / 2 + 0.34} castShadow receiveShadow>
                <meshStandardMaterial color={pillow.color ?? "#f8f6f1"} roughness={1} bumpMap={tex.linen} bumpScale={0.3} />
              </mesh>
              <mesh geometry={pillowGeom} position={[-1.74, top + 0.1 + pillow.args[2] * 0.3, b.z + dz * 0.98]} rotation-z={0.16} castShadow receiveShadow>
                <meshStandardMaterial color={pillow.color ?? linen} roughness={1} bumpMap={tex.linen} bumpScale={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ─── Banquette under the right wall ────────────────────────── */

export function Banquette() {
  const { tex } = useSuite()
  const plaster = usePlaster()
  const cushion = React.useMemo(() => pillowGeometry(0.44, 0.52, 0.17, { puff: 0.85, pinch: 0.09, wrinkle: 0.1, seed: 12 }), [])
  const colors = ["#b9683f", "#f1ebdf", "#4f7d93"]
  return (
    <group position={[2.17, 0, -1.8]}>
      <RoundedBox args={[0.66, 0.42, 2.2]} radius={0.09} smoothness={5} position={[0, 0.21, 0]} material={plaster} castShadow receiveShadow />
      <RoundedBox args={[0.58, 0.11, 2.1]} radius={0.05} smoothness={4} position={[-0.02, 0.47, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#e6dac4" roughness={1} bumpMap={tex.linen} bumpScale={0.3} />
      </RoundedBox>
      {[-0.68, 0, 0.68].map((z, i) => (
        <mesh key={z} geometry={cushion} position={[0.15, 0.75, z]} rotation-z={Math.PI / 2 - 0.3} rotation-y={(i - 1) * 0.08} castShadow>
          <meshStandardMaterial color={colors[i]} roughness={1} bumpMap={tex.linen} bumpScale={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/* ─── Low table with the flower jug and the welcome tray ────── */

function Jug() {
  const geom = React.useMemo(
    () => lathe([[0, 0], [0.075, 0], [0.11, 0.04], [0.135, 0.13], [0.13, 0.22], [0.095, 0.3], [0.052, 0.36], [0.05, 0.4], [0.066, 0.43], [0.058, 0.43], [0.042, 0.4]], 36),
    [],
  )
  return (
    <group>
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial color="#b46a42" roughness={0.82} side={THREE.DoubleSide} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 0.1, 0.3, 0]} rotation-z={s * -0.25} castShadow>
          <torusGeometry args={[0.055, 0.011, 8, 18, Math.PI]} />
          <meshStandardMaterial color="#aa6039" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function buildFlowers(kind: Flowers) {
  const stems: Inst[] = []
  const petals: Inst[] = []
  if (kind === "none") return { stems, petals }
  const r = rng(kind.length * 131)
  const up = new THREE.Vector3(0, 1, 0)
  const e = new THREE.Euler()
  const base = new THREE.Vector3(0, 0.4, 0)
  const count = kind === "olive" ? 6 : kind === "bougainvillea" ? 9 : 13

  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + r() * 0.6
    const lean = 0.1 + r() * (kind === "olive" ? 0.62 : 0.5)
    const dir = new THREE.Vector3(Math.sin(lean) * Math.cos(a), Math.cos(lean), Math.sin(lean) * Math.sin(a)).normalize()
    const len = (kind === "olive" ? 0.5 : kind === "bougainvillea" ? 0.36 : 0.3) + r() * 0.2
    const tip = base.clone().addScaledVector(dir, len)
    const mid = base.clone().addScaledVector(dir, len / 2)
    e.setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir))
    stems.push({ p: mid.toArray() as Vec3, r: [e.x, e.y, e.z], s: [0.0035, len, 0.0035], c: kind === "olive" ? "#6b5e48" : "#5f7a3e" })
    const along = (t: number) => base.clone().addScaledVector(dir, len * t)

    if (kind === "bougainvillea") {
      for (let c = 0; c < 6; c++) {
        const centre = along(0.55 + r() * 0.5).add(new THREE.Vector3((r() - 0.5) * 0.09, (r() - 0.5) * 0.05, (r() - 0.5) * 0.09))
        const col = ["#c2185b", "#d1357a", "#b0124f", "#e0569a"][Math.floor(r() * 4)]
        const spin = r() * Math.PI
        for (let b = 0; b < 3; b++) {
          const ang = spin + (b / 3) * Math.PI * 2
          petals.push({
            p: [centre.x + Math.cos(ang) * 0.014, centre.y, centre.z + Math.sin(ang) * 0.014],
            r: [0.5 * Math.sin(ang), -ang, 0.5 * Math.cos(ang)],
            s: [0.024, 0.004, 0.017],
            c: col,
          })
        }
        petals.push({ p: centre.toArray() as Vec3, s: [0.005, 0.005, 0.005], c: "#fff6d8" })
      }
      for (let l = 0; l < 3; l++) {
        const p = along(0.3 + r() * 0.4)
        petals.push({ p: [p.x + (r() - 0.5) * 0.04, p.y, p.z + (r() - 0.5) * 0.04], r: [r(), r() * 3, r()], s: [0.022, 0.003, 0.014], c: "#4f7a3a" })
      }
    } else if (kind === "olive") {
      for (let l = 0; l < 14; l++) {
        const p = along(0.22 + (l / 14) * 0.78)
        const side = l % 2 ? 1 : -1
        const ang = a + side * 1.2 + r() * 0.5
        petals.push({
          p: [p.x + Math.cos(ang) * 0.022, p.y + 0.008, p.z + Math.sin(ang) * 0.022],
          r: [0.5 + r() * 0.4, -ang + Math.PI / 2, 0],
          s: [0.0075, 0.0025, 0.034],
          c: r() > 0.45 ? "#7f9068" : "#aab594",
        })
      }
      if (i % 2 === 0) for (let o = 0; o < 3; o++) {
        const p = along(0.4 + r() * 0.5)
        petals.push({ p: [p.x + (r() - 0.5) * 0.02, p.y - 0.012, p.z + (r() - 0.5) * 0.02], s: [0.008, 0.011, 0.008], c: "#2b2a22" })
      }
    } else {
      const type = i % 3
      if (type === 0) {
        // chamomile daisy
        for (let k = 0; k < 11; k++) {
          const ang = (k / 11) * Math.PI * 2
          petals.push({ p: [tip.x + Math.cos(ang) * 0.02, tip.y, tip.z + Math.sin(ang) * 0.02], r: [0, -ang, 0.12], s: [0.014, 0.0022, 0.0055], c: "#fffdf5" })
        }
        petals.push({ p: [tip.x, tip.y + 0.004, tip.z], s: [0.01, 0.007, 0.01], c: "#f0c12e" })
      } else if (type === 1) {
        // poppy
        for (let k = 0; k < 4; k++) {
          const ang = (k / 4) * Math.PI * 2 + 0.4
          petals.push({ p: [tip.x + Math.cos(ang) * 0.02, tip.y + 0.006, tip.z + Math.sin(ang) * 0.02], r: [0, -ang, 0.55], s: [0.03, 0.004, 0.027], c: k % 2 ? "#d5342a" : "#c42a22" })
        }
        petals.push({ p: tip.toArray() as Vec3, s: [0.008, 0.008, 0.008], c: "#1c1a18" })
      } else {
        // thyme flower spike
        for (let k = 0; k < 9; k++) {
          const p = along(0.72 + (k / 9) * 0.28)
          petals.push({ p: [p.x + (r() - 0.5) * 0.012, p.y, p.z + (r() - 0.5) * 0.012], s: [0.009, 0.007, 0.009], c: k % 2 ? "#a487c9" : "#8f6fb8" })
        }
      }
    }
  }
  return { stems, petals }
}

export function FlowerJug({ kind }: { kind: Flowers }) {
  const parts = React.useMemo(() => buildFlowers(kind), [kind])
  return (
    <group>
      <Jug />
      <group key={kind}>
        <Instances items={parts.stems} castShadow={false}>
          <cylinderGeometry args={[1, 1, 1, 5]} />
        </Instances>
        <Instances items={parts.petals}>
          <sphereGeometry args={[1, 10, 8]} />
        </Instances>
      </group>
    </group>
  )
}

function buildWelcome(kind: Welcome) {
  const items: Inst[] = []
  const r = rng(77)
  if (kind === "fruit") {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      items.push({ p: [-0.06 + Math.cos(a) * 0.035, 0.062, Math.sin(a) * 0.035], r: [r() * 0.5, r() * 3, r() * 0.5], s: [0.021, 0.026, 0.021], c: i % 2 ? "#4a2a45" : "#5b3350" })
    }
    items.push({ p: [-0.06, 0.085, 0], s: [0.021, 0.026, 0.021], c: "#6a3d5a" })
    for (let i = 0; i < 22; i++) {
      const t = i / 22
      items.push({ p: [0.07 + (r() - 0.5) * 0.05 * (1 - t), 0.035 + r() * 0.025, -0.03 + t * 0.09 + (r() - 0.5) * 0.02], s: [0.0105, 0.012, 0.0105], c: r() > 0.5 ? "#9db34a" : "#b6c765" })
    }
  } else if (kind === "sweets") {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2
      items.push({ p: [-0.055 + Math.cos(a) * 0.04, 0.038, Math.sin(a) * 0.04], r: [0, r() * 3, 0], s: [0.014, 0.012, 0.014], c: ["#f3b6c2", "#fbf3ea", "#f7d58a"][i % 3] })
    }
    for (let i = 0; i < 5; i++) {
      items.push({ p: [0.06 + (i % 2) * 0.034 - 0.017, 0.036, -0.045 + Math.floor(i / 2) * 0.04], r: [0, 0.78, 0], s: [0.019, 0.011, 0.019], c: i % 2 ? "#b77a32" : "#c98d3e" })
    }
  }
  return items
}

export function WelcomeTray({ kind }: { kind: Welcome }) {
  const wood = useWood("#f2dcbd")
  const items = React.useMemo(() => buildWelcome(kind), [kind])
  const glass = React.useMemo(() => lathe([[0, 0], [0.026, 0], [0.03, 0.075], [0.028, 0.075], [0.024, 0.006], [0, 0.006]], 20), [])
  const carafe = React.useMemo(() => lathe([[0, 0], [0.045, 0], [0.055, 0.06], [0.05, 0.13], [0.024, 0.18], [0.026, 0.215], [0.022, 0.215], [0.02, 0.18], [0.046, 0.13], [0, 0.005]], 24), [])
  const bowl = React.useMemo(() => lathe([[0, 0], [0.03, 0], [0.06, 0.02], [0.075, 0.045], [0.07, 0.045], [0.055, 0.022], [0, 0.012]], 28), [])
  const cup = React.useMemo(() => lathe([[0, 0], [0.018, 0], [0.024, 0.034], [0.021, 0.034], [0.016, 0.006], [0, 0.006]], 18), [])
  return (
    <group>
      <RoundedBox args={[0.34, 0.016, 0.24]} radius={0.007} material={wood} position={[0, 0.008, 0]} castShadow receiveShadow />
      {kind === "fruit" && (
        <mesh geometry={bowl} position={[-0.06, 0.016, 0]} castShadow>
          <meshStandardMaterial color="#efe9df" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
      {kind === "sweets" && (
        <>
          <mesh position={[-0.055, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.008, 28]} />
            <meshStandardMaterial color="#efe9df" roughness={0.5} />
          </mesh>
          {[0.03, 0.09].map((x) => (
            <mesh key={x} geometry={cup} position={[x, 0.016, 0.075]} castShadow>
              <meshStandardMaterial color="#fbfaf6" roughness={0.35} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </>
      )}
      <group key={kind}>
        <Instances items={items} roughness={kind === "fruit" ? 0.45 : 0.8}>
          <sphereGeometry args={[1, 12, 10]} />
        </Instances>
      </group>
      {kind === "none" && (
        <>
          <mesh geometry={carafe} position={[-0.07, 0.016, 0]}>
            <meshStandardMaterial color="#e8f6f8" transparent opacity={0.42} roughness={0.02} side={THREE.DoubleSide} />
          </mesh>
          {[0.03, 0.1].map((x, i) => (
            <mesh key={x} geometry={glass} position={[x, 0.016, i ? 0.03 : -0.04]}>
              <meshStandardMaterial color="#ffffff" transparent opacity={0.35} roughness={0.02} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

export function CoffeeTable({ flowers, welcome }: { flowers: Flowers; welcome: Welcome }) {
  const wood = useWood("#e6caa6")
  return (
    <group>
      <mesh position={[0, 0.36, 0]} material={wood} castShadow receiveShadow>
        <cylinderGeometry args={[0.46, 0.44, 0.05, 48]} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.4
        return (
          <mesh key={i} position={[Math.cos(a) * 0.3, 0.17, Math.sin(a) * 0.3]} rotation={[Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.18]} material={wood} castShadow>
            <cylinderGeometry args={[0.022, 0.016, 0.35, 10]} />
          </mesh>
        )
      })}
      <group position={[-0.1, 0.385, -0.2]}>
        <FlowerJug kind={flowers} />
      </group>
      <group position={[0.07, 0.385, 0.17]} rotation-y={0.25}>
        <WelcomeTray kind={welcome} />
      </group>
    </group>
  )
}

/* ─── Scent diffuser in the niche ───────────────────────────── */

const SCENT_COLOR: Record<Exclude<Scent, "none">, string> = {
  "fig-leaf": "#8fb562",
  "sea-fennel": "#5fc0b8",
  "wild-thyme": "#b892e0",
}

export function Diffuser({ scent }: { scent: Scent }) {
  const { tex, reduced } = useSuite()
  const count = 44
  const geomRef = React.useRef<THREE.BufferGeometry>(null)
  const seeds = React.useMemo(() => {
    const r = rng(11)
    return Array.from({ length: count }, () => ({ a: r() * Math.PI * 2, s: 0.4 + r() * 0.6, o: r() }))
  }, [])
  const positions = React.useMemo(() => new Float32Array(count * 3), [])
  const bottle = React.useMemo(() => lathe([[0, 0], [0.045, 0], [0.052, 0.02], [0.052, 0.1], [0.03, 0.135], [0.018, 0.14], [0.018, 0.17], [0.022, 0.172]], 24), [])

  useFrame(({ clock }) => {
    if (!geomRef.current || scent === "none") return
    const t = reduced ? 3 : clock.elapsedTime
    seeds.forEach((sd, i) => {
      const life = (t * 0.1 * sd.s + sd.o) % 1
      const spread = 0.03 + life * 0.22
      positions[i * 3] = Math.cos(sd.a + t * 0.25) * spread
      positions[i * 3 + 1] = 0.34 + life * 0.55
      positions[i * 3 + 2] = Math.sin(sd.a + t * 0.25) * spread * 0.5 + life * 0.25
    })
    geomRef.current.attributes.position.needsUpdate = true
  })

  if (scent === "none") {
    return (
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.045, 0.06, 24]} />
        <meshStandardMaterial color="#e9e3d8" roughness={0.6} />
      </mesh>
    )
  }
  const color = SCENT_COLOR[scent]
  return (
    <group>
      <mesh geometry={bottle}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0.03} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.045, 0.04, 0.07, 20]} />
        <meshStandardMaterial color={color} transparent opacity={0.75} roughness={0.1} />
      </mesh>
      {[-0.5, -0.2, 0.1, 0.4, 0.7].map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 0.035, 0.27, Math.cos(a * 2) * 0.02]} rotation={[Math.cos(a * 2) * 0.12, 0, -Math.sin(a) * 0.22]}>
          <cylinderGeometry args={[0.0028, 0.0028, 0.34, 5]} />
          <meshStandardMaterial color="#4a3a2a" roughness={1} />
        </mesh>
      ))}
      <points>
        <bufferGeometry ref={geomRef}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} map={tex.dot} size={0.07} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
    </group>
  )
}

/* ─── Minibar: what stands on top shows what is inside ─────── */

export function Minibar({ fridge }: { fridge: Fridge }) {
  const { tex } = useSuite()
  const wood = useWood("#d8b78f")
  const bottle = React.useMemo(() => lathe([[0, 0], [0.036, 0], [0.038, 0.02], [0.038, 0.17], [0.03, 0.2], [0.014, 0.235], [0.013, 0.3], [0.016, 0.305]], 22), [])
  const wineGlass = React.useMemo(() => lathe([[0, 0], [0.03, 0], [0.004, 0.006], [0.004, 0.08], [0.03, 0.105], [0.036, 0.15], [0.03, 0.17], [0.028, 0.17], [0.033, 0.15], [0.027, 0.108], [0, 0.085]], 22), [])
  const carafe = React.useMemo(() => lathe([[0, 0], [0.05, 0], [0.062, 0.07], [0.056, 0.15], [0.028, 0.2], [0.03, 0.24], [0.026, 0.24], [0.024, 0.2], [0.05, 0.15], [0, 0.006]], 24), [])
  const tumbler = React.useMemo(() => lathe([[0, 0], [0.028, 0], [0.032, 0.085], [0.03, 0.085], [0.026, 0.006], [0, 0.006]], 20), [])
  const glassMat = <meshStandardMaterial color="#ffffff" transparent opacity={0.32} roughness={0.02} side={THREE.DoubleSide} />

  return (
    <group>
      <RoundedBox args={[0.52, 0.8, 0.9]} radius={0.025} position={[0, 0.42, 0]} material={wood} castShadow receiveShadow />
      {/* cane doors */}
      {[-0.22, 0.22].map((z) => (
        <mesh key={z} position={[-0.262, 0.44, z]} rotation-y={-Math.PI / 2}>
          <planeGeometry args={[0.4, 0.66]} />
          <meshStandardMaterial map={tex.cane} roughness={0.8} />
        </mesh>
      ))}
      {[-0.03, 0.03].map((z) => (
        <mesh key={z} position={[-0.275, 0.46, z]}>
          <sphereGeometry args={[0.012, 12, 10]} />
          <meshStandardMaterial color="#c9a46a" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
      {[[-0.2, -0.38], [-0.2, 0.38], [0.2, -0.38], [0.2, 0.38]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.01, z]} material={wood}>
          <cylinderGeometry args={[0.018, 0.012, 0.04, 8]} />
        </mesh>
      ))}

      <group position={[0, 0.82, 0]}>
        {fridge === "local-wine" && (
          <>
            <mesh geometry={bottle} position={[0.06, 0, -0.2]} castShadow>
              <meshStandardMaterial color="#27412a" roughness={0.12} />
            </mesh>
            <mesh position={[0.06, 0.1, -0.2]}>
              <cylinderGeometry args={[0.0385, 0.0385, 0.07, 20]} />
              <meshStandardMaterial color="#f3ead6" roughness={0.8} />
            </mesh>
            {[0.0, 0.14].map((z) => (
              <mesh key={z} geometry={wineGlass} position={[-0.06, 0, z]}>{glassMat}</mesh>
            ))}
            <mesh position={[0.08, 0.02, 0.24]} castShadow>
              <cylinderGeometry args={[0.05, 0.035, 0.04, 20]} />
              <meshStandardMaterial color="#e9e3d8" roughness={0.6} />
            </mesh>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[0.08 + Math.cos(i * 1.3) * 0.02, 0.045, 0.24 + Math.sin(i * 1.3) * 0.02]} scale={[0.01, 0.012, 0.01]}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshStandardMaterial color={i % 2 ? "#4c5a2a" : "#2f2a22"} roughness={0.4} />
              </mesh>
            ))}
          </>
        )}
        {fridge === "no-alcohol" && (
          <>
            <mesh geometry={carafe} position={[0.04, 0, -0.16]}>
              <meshStandardMaterial color="#dff3f5" transparent opacity={0.42} roughness={0.02} side={THREE.DoubleSide} />
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[0.04 + Math.cos(i * 2) * 0.02, 0.05 + i * 0.035, -0.16 + Math.sin(i * 2) * 0.02]} rotation={[0.6 * i, 0, 0.9]}>
                <cylinderGeometry args={[0.022, 0.022, 0.004, 16]} />
                <meshStandardMaterial color="#f4d94a" roughness={0.5} />
              </mesh>
            ))}
            {[0.02, 0.14].map((z) => (
              <mesh key={z} geometry={tumbler} position={[-0.08, 0, z]}>{glassMat}</mesh>
            ))}
            {[[0.1, 0.2], [0.04, 0.27], [0.11, 0.29]].map(([x, z], i) => (
              <mesh key={i} position={[x, 0.03, z]} scale={[0.036, 0.03, 0.03]} castShadow>
                <sphereGeometry args={[1, 14, 12]} />
                <meshStandardMaterial color="#f0cf35" roughness={0.55} />
              </mesh>
            ))}
          </>
        )}
        {fridge === "kids" && (
          <>
            {[[-0.02, -0.24, "#f39a2b"], [0.08, -0.14, "#e8453c"], [-0.06, -0.08, "#7bbf3f"]].map(([x, z, c], i) => (
              <group key={i} position={[x as number, 0, z as number]}>
                <mesh geometry={bottle} scale={[0.8, 0.55, 0.8]} castShadow>
                  <meshStandardMaterial color={c as string} roughness={0.25} />
                </mesh>
                <mesh position={[0.012, 0.2, 0]} rotation-z={-0.2}>
                  <cylinderGeometry args={[0.003, 0.003, 0.1, 6]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
              </group>
            ))}
            <mesh position={[0.04, 0.06, 0.2]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.12, 24]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0.03} />
            </mesh>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} position={[0.04 + (i % 2 ? 0.015 : -0.012), 0.02 + i * 0.022, 0.2]} rotation-z={0.2 * (i % 2 ? 1 : -1)}>
                <cylinderGeometry args={[0.04, 0.04, 0.012, 18]} />
                <meshStandardMaterial color="#c99a5b" roughness={0.9} />
              </mesh>
            ))}
          </>
        )}
        {fridge === "empty" && (
          <mesh position={[0, 0.03, 0]} rotation-y={0.3} castShadow>
            <coneGeometry args={[0.05, 0.06, 4, 1, true]} />
            <meshStandardMaterial color="#fbfaf6" roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </group>
  )
}

/* ─── Thermostat and ceiling fan ────────────────────────────── */

export function Thermostat({ temperature }: { temperature: number }) {
  const plaster = usePlaster()
  const tone = temperature <= 20 ? "#4aa3d1" : temperature >= 24 ? "#e58a45" : "#e9e2d2"
  return (
    <group>
      <RoundedBox args={[0.14, 0.34, 0.34]} radius={0.05} position={[0.05, 0, 0]} material={plaster} />
      <mesh rotation-z={Math.PI / 2} position={[-0.03, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.025, 40]} />
        <meshStandardMaterial color="#1f2630" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh rotation-y={-Math.PI / 2} position={[-0.0435, 0, 0]}>
        <ringGeometry args={[0.058, 0.068, 48, 1, Math.PI * 0.75, Math.PI * 2 * ((temperature - 16) / 12)]} />
        <meshStandardMaterial color={tone} emissive={tone} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <Html position={[-0.05, 0, 0]} center distanceFactor={1.3} zIndexRange={[10, 0]} pointerEvents="none">
        <div className="pointer-events-none select-none text-[12px] font-semibold tabular-nums text-white">{temperature}°</div>
      </Html>
    </group>
  )
}

export function Fan({ temperature }: { temperature: number }) {
  const { reduced } = useSuite()
  const wood = useWood("#dcc09c")
  const ref = React.useRef<THREE.Group>(null)
  const speed = React.useRef(1)
  useFrame((_, dt) => {
    if (!ref.current || reduced) return
    const target = THREE.MathUtils.mapLinear(temperature, 18, 26, 5.5, 0.5)
    speed.current += (target - speed.current) * Math.min(1, dt * 1.5)
    ref.current.rotation.y += dt * speed.current
  })
  return (
    <group position={[0.2, WALL_H + W - 0.82, 0.5]}>
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.78, 8]} />
        <meshStandardMaterial color="#b89a66" metalness={0.8} roughness={0.35} />
      </mesh>
      <group ref={ref}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.065, 0.07, 24]} />
          <meshStandardMaterial color="#b89a66" metalness={0.8} roughness={0.35} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation-y={(i * Math.PI) / 2}>
            <RoundedBox args={[0.62, 0.012, 0.15]} radius={0.005} position={[0.42, -0.01, 0]} rotation-x={0.18} material={wood} castShadow />
          </group>
        ))}
      </group>
    </group>
  )
}

/* ─── Lamps, lantern and small things ───────────────────────── */

export function BedsideLamp() {
  const { atmos } = useSuite()
  const wood = useWood("#d4b48c")
  const shade = React.useRef<THREE.MeshStandardMaterial>(null)
  const light = React.useRef<THREE.PointLight>(null)
  const base = React.useMemo(() => lathe([[0, 0], [0.07, 0], [0.085, 0.02], [0.1, 0.1], [0.085, 0.19], [0.04, 0.25], [0.018, 0.27], [0.018, 0.3]], 28), [])
  useFrame(() => {
    const l = atmos.current.lamp
    if (shade.current) shade.current.emissiveIntensity = l * 1.6
    if (light.current) light.current.intensity = l * 5.5
  })
  return (
    <group>
      {/* tree-stump side table */}
      <mesh position={[0, 0.23, 0]} material={wood} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.22, 0.46, 24]} />
      </mesh>
      <mesh geometry={base} position={[0, 0.46, 0]} castShadow>
        <meshStandardMaterial color="#ebe5d9" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.1, 0.17, 0.22, 32, 1, true]} />
        <meshStandardMaterial ref={shade} color="#f3e8d3" emissive="#ffb35c" emissiveIntensity={0} side={THREE.DoubleSide} roughness={1} transparent opacity={0.96} />
      </mesh>
      <pointLight ref={light} position={[0, 0.9, 0.05]} color="#ffb768" intensity={0} distance={7} decay={1.7} />
    </group>
  )
}

export function Lantern({ withLight = false }: { withLight?: boolean }) {
  const { atmos, reduced } = useSuite()
  const flame = React.useRef<THREE.MeshStandardMaterial>(null)
  const light = React.useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    const flicker = reduced ? 1 : 0.85 + Math.sin(clock.elapsedTime * 11) * 0.07 + Math.sin(clock.elapsedTime * 23.7) * 0.05
    const l = atmos.current.lamp * flicker
    if (flame.current) flame.current.emissiveIntensity = 0.4 + l * 5
    if (light.current) light.current.intensity = l * 2.4
  })
  return (
    <group>
      <mesh position={[0, 0.015, 0]} castShadow>
        <boxGeometry args={[0.18, 0.03, 0.18]} />
        <meshStandardMaterial color="#2a2623" roughness={0.6} metalness={0.4} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <mesh key={i} position={[x * 0.082, 0.17, z * 0.082]}>
          <boxGeometry args={[0.012, 0.3, 0.012]} />
          <meshStandardMaterial color="#2a2623" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.33, 0]} castShadow>
        <coneGeometry args={[0.14, 0.07, 4]} />
        <meshStandardMaterial color="#2a2623" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[0.16, 0.28, 0.16]} />
        <meshStandardMaterial color="#fff6e6" transparent opacity={0.12} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.12, 16]} />
        <meshStandardMaterial color="#f6efe2" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.175, 0]} scale={[0.012, 0.026, 0.012]}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial ref={flame} color="#ffd9a0" emissive="#ff9a3c" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
      {withLight && <pointLight ref={light} position={[0, 0.2, 0]} color="#ff9d4a" intensity={0} distance={4.5} decay={1.8} />}
    </group>
  )
}

export function NightStand() {
  const wood = useWood("#d4b48c")
  return (
    <group>
      <mesh position={[0, 0.2, 0]} material={wood} castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.19, 0.4, 24]} />
      </mesh>
      {[["#4f7d93", 0], ["#e9e0cf", 0.028], ["#b9683f", 0.052]].map(([c, y], i) => (
        <mesh key={i} position={[0.01 * i, 0.413 + (y as number), -0.02]} rotation-y={0.2 * i} castShadow>
          <boxGeometry args={[0.2 - i * 0.015, 0.024, 0.14]} />
          <meshStandardMaterial color={c as string} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function StrawHat() {
  const geom = React.useMemo(() => lathe([[0, 0.1], [0.07, 0.1], [0.095, 0.085], [0.1, 0.02], [0.2, 0.004], [0.21, 0], [0.1, 0.005], [0.09, 0.07], [0, 0.085]], 40), [])
  return (
    <group rotation-x={-Math.PI / 2 + 0.15}>
      <mesh geometry={geom} castShadow>
        <meshStandardMaterial color="#d9bd84" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.102, 0.102, 0.025, 32, 1, true]} />
        <meshStandardMaterial color="#2c3a48" roughness={0.9} />
      </mesh>
    </group>
  )
}

/* ─── Sheer curtains that open, close and move in the breeze ─ */

export function Curtains({ drawn, breeze }: { drawn: boolean; breeze: number }) {
  const { tex, reduced, atmos } = useSuite()
  const H = 2.96, EDGE = 1.36
  const left = React.useRef<THREE.Mesh>(null)
  const right = React.useRef<THREE.Mesh>(null)
    const open = React.useRef(drawn ? 0 : 1)
  const geoms = React.useMemo(() => [new THREE.PlaneGeometry(1, H, 28, 10), new THREE.PlaneGeometry(1, H, 28, 10)], [])
  const wood = useWood("#c9a67e")
  const material = React.useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#fbf8f1",
        emissive: "#fff0d6",
        emissiveIntensity: 0.2,
        bumpMap: tex.linen,
        bumpScale: 0.3,
        roughness: 1,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [tex],
  )

  useFrame(({ clock }, dt) => {
    open.current += ((drawn ? 0 : 1) - open.current) * Math.min(1, dt * 2.4)
    const t = reduced ? 0 : clock.elapsedTime
    const width = THREE.MathUtils.lerp(EDGE + 0.02, 0.24, open.current)
    const depth = THREE.MathUtils.lerp(0.05, 0.065, open.current)
    ;[left.current, right.current].forEach((m, k) => {
      if (!m) return
      const side = k === 0 ? -1 : 1
      const pos = m.geometry.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const u = (i % 29) / 28
        const v = 1 - Math.floor(i / 29) / 10 // 1 at the rod, 0 at the floor
        const hang = 1 - v
        const sway = Math.sin(t * 1.25 + u * 3.2 + k) * 0.03 * breeze * hang * (1 - open.current * 0.6)
        const x = side * (EDGE - u * width) + sway * 0.4
        const z = Math.sin(u * Math.PI * 13 + k * 1.3) * depth * (0.5 + hang * 0.5) + sway + hang * hang * 0.05 * breeze * Math.sin(t * 0.7 + k)
        pos.setXYZ(i, x, v * H, z)
      }
      pos.needsUpdate = true
      m.geometry.computeVertexNormals()
    })
    material.emissiveIntensity = 0.22 * (1 - atmos.current.night)
  })

  return (
    <group>
      <mesh position={[0, H + 0.03, 0]} rotation-z={Math.PI / 2} material={wood}>
        <cylinderGeometry args={[0.017, 0.017, 2.95, 12]} />
      </mesh>
      <mesh ref={left} geometry={geoms[0]} material={material} frustumCulled={false} />
      <mesh ref={right} geometry={geoms[1]} material={material} frustumCulled={false} />
    </group>
  )
}

/* ─── Rug ───────────────────────────────────────────────────── */

export function Rug() {
  const { tex } = useSuite()
  return (
    <mesh rotation-x={-Math.PI / 2} rotation-z={0.12} position={[0.75, 0.008, -0.75]} receiveShadow>
      <planeGeometry args={[2.3, 1.7]} />
      <meshStandardMaterial map={tex.rug} roughness={1} bumpMap={tex.linen} bumpScale={0.6} />
    </mesh>
  )
}

/* ─── Built-in wardrobe ─────────────────────────────────────── */

/**
 * A plaster wardrobe built into the wall, as in old island houses: two arched
 * bays, one open with a hanging rail, one closed with cane doors.
 * Local space: the front faces +z, the back sits against the wall at z = -0.6.
 */
export function Closet() {
  const { tex } = useSuite()
  const plaster = usePlaster()
  const wood = useWood("#d8b78f")
  const Wd = 1.3, H = 2.16, D = 0.6, HW = 0.26, SPRING = 1.5, SILL = 0.12
  const bays = [-0.325, 0.325]

  const front = React.useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-Wd / 2, 0)
    s.lineTo(Wd / 2, 0)
    s.lineTo(Wd / 2, H)
    s.lineTo(-Wd / 2, H)
    s.lineTo(-Wd / 2, 0)
    for (const cx of [-0.325, 0.325]) {
      const p = new THREE.Path()
      p.moveTo(cx - HW, SILL)
      p.lineTo(cx + HW, SILL)
      p.lineTo(cx + HW, SPRING)
      p.absarc(cx, SPRING, HW, 0, Math.PI, false)
      p.lineTo(cx - HW, SILL)
      s.holes.push(p)
    }
    return new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 3, curveSegments: 28 })
  }, [])

  const doorShape = React.useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-HW, SILL)
    s.lineTo(HW, SILL)
    s.lineTo(HW, SPRING)
    s.absarc(0, SPRING, HW, 0, Math.PI, false)
    s.lineTo(-HW, SILL)
    const g = new THREE.ShapeGeometry(s, 24)
    // map the cane texture by position so the weave is even across the arch
    const pos = g.attributes.position, uv = g.attributes.uv
    for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) * 2.2, pos.getY(i) * 2.2)
    return g
  }, [])

  const basket = React.useMemo(() => lathe([[0, 0], [0.13, 0], [0.17, 0.1], [0.18, 0.22], [0.165, 0.24], [0.155, 0.11], [0, 0.02]], 28), [])
  const robes: Array<{ x: number; color: string; len: number; tilt: number }> = [
    { x: -0.46, color: "#f8f6f1", len: 1.0, tilt: 0.05 },
    { x: -0.33, color: "#f8f6f1", len: 1.0, tilt: -0.04 },
    { x: -0.19, color: "#d9c3a0", len: 0.78, tilt: 0.07 },
  ]

  return (
    <group>
      {/* carcass */}
      <mesh position={[0, H / 2, -D + 0.03]} material={plaster} castShadow receiveShadow>
        <boxGeometry args={[Wd, H, 0.06]} />
      </mesh>
      {[-Wd / 2 + 0.03, 0, Wd / 2 - 0.03].map((x) => (
        <mesh key={x} position={[x, H / 2, -D / 2]} material={plaster} castShadow receiveShadow>
          <boxGeometry args={[x === 0 ? 0.1 : 0.06, H, D]} />
        </mesh>
      ))}
      <RoundedBox args={[Wd + 0.06, 0.12, D + 0.04]} radius={0.05} position={[0, H + 0.02, -D / 2]} material={plaster} castShadow receiveShadow />
      <mesh position={[0, SILL / 2, -D / 2]} material={plaster} receiveShadow>
        <boxGeometry args={[Wd, SILL, D]} />
      </mesh>
      <mesh geometry={front} material={plaster} position={[0, 0, -0.07]} castShadow receiveShadow />

      {/* open bay: rail, robes, basket and slippers */}
      <group position={[bays[0], 0, 0]}>
        <mesh position={[0, 1.62, -0.3]} rotation-z={Math.PI / 2} material={wood}>
          <cylinderGeometry args={[0.014, 0.014, 0.56, 10]} />
        </mesh>
        {robes.map((r) => (
          <group key={r.x} position={[r.x - bays[0], 1.62, -0.3]} rotation-y={r.tilt}>
            <mesh position={[0, 0.02, 0]} rotation-y={Math.PI / 2}>
              <torusGeometry args={[0.02, 0.004, 6, 14, Math.PI * 1.4]} />
              <meshStandardMaterial color="#b89a66" metalness={0.8} roughness={0.35} />
            </mesh>
            <mesh position={[0, -0.04, 0]} material={wood}>
              <boxGeometry args={[0.014, 0.02, 0.4]} />
            </mesh>
            <RoundedBox args={[0.055, r.len, 0.4]} radius={0.025} smoothness={3} position={[0, -0.05 - r.len / 2, 0]} castShadow>
              <meshStandardMaterial color={r.color} roughness={1} bumpMap={tex.linen} bumpScale={0.35} />
            </RoundedBox>
          </group>
        ))}
        <mesh geometry={basket} position={[0.05, SILL, -0.3]} castShadow>
          <meshStandardMaterial color="#c9a878" roughness={0.95} map={tex.cane} side={THREE.DoubleSide} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <RoundedBox key={i} args={[0.22, 0.05, 0.22]} radius={0.02} position={[0.05, SILL + 0.14 + i * 0.052, -0.3]} rotation-y={i * 0.12}>
            <meshStandardMaterial color={i === 1 ? "#6f97b3" : "#f8f6f1"} roughness={1} bumpMap={tex.linen} bumpScale={0.3} />
          </RoundedBox>
        ))}
        {[-0.16, -0.07].map((x) => (
          <RoundedBox key={x} args={[0.07, 0.03, 0.2]} radius={0.014} position={[x, SILL + 0.015, -0.1]} rotation-y={0.12}>
            <meshStandardMaterial color="#c7a777" roughness={0.9} />
          </RoundedBox>
        ))}
      </group>

      {/* closed bay: arched cane doors */}
      <group position={[bays[1], 0, -0.045]}>
        <mesh geometry={doorShape} position={[0, 0, -0.006]} scale={[1.06, 1.02, 1]} material={wood} />
        <mesh geometry={doorShape} scale={[0.9, 0.955, 1]} position={[0, 0.035, 0]}>
          <meshStandardMaterial map={tex.cane} roughness={0.85} />
        </mesh>
        <mesh position={[0, (SPRING + HW + SILL) / 2, 0.004]} material={wood}>
          <boxGeometry args={[0.018, SPRING + HW - SILL, 0.012]} />
        </mesh>
        {[-0.035, 0.035].map((x) => (
          <mesh key={x} position={[x, 1.0, 0.018]}>
            <sphereGeometry args={[0.013, 12, 10]} />
            <meshStandardMaterial color="#c9a46a" metalness={0.85} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* on top: a woven basket and a folded spare blanket */}
      <mesh geometry={basket} position={[-0.3, H + 0.08, -0.3]} scale={1.1} castShadow>
        <meshStandardMaterial color="#c9a878" roughness={0.95} map={tex.cane} side={THREE.DoubleSide} />
      </mesh>
      <RoundedBox args={[0.42, 0.12, 0.34]} radius={0.04} position={[0.28, H + 0.14, -0.3]} castShadow>
        <meshStandardMaterial color="#b9825a" roughness={1} bumpMap={tex.knit} bumpScale={1} />
      </RoundedBox>
    </group>
  )
}
