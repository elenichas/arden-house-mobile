"use client"

/*
 * The Aspra suite in 3D, modelled in code so it needs no asset download.
 *
 * Layout (metres, y up, the sea is towards -z):
 *   A hand-plastered barrel vault 5 m wide and 6.9 m deep, cut into the cliff.
 *   The sea wall has a deep arch onto a stone terrace 14 m above the water.
 *   Bed built into the left wall, banquette and minibar on the right.
 *
 * Every customisable object is driven by `prefs`, so a choice in the panel
 * changes the model on the next frame.
 */

import * as React from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, OrbitControls, PerformanceMonitor } from "@react-three/drei"
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing"
import { ToneMappingMode } from "postprocessing"
import type { Light, Prefs, SuiteId } from "../data"
import { SuiteContext, createAtmos, useSuite } from "./context"
import { HALF_D, W, type Vec3 } from "./geometry"
import { useSuiteTextures } from "./textures"
import { VIEWPOINTS, type Pose, type ViewpointId } from "./spots"

export type { Pose, ViewpointId }
import { DustMotes, LightRig, NICHES, Outside, Pop, Shell, SkyAndSea } from "./environment"
import {
  Banquette,
  Bed,
  BedsideLamp,
  Closet,
  CoffeeTable,
  Curtains,
  Diffuser,
  Fan,
  Lantern,
  Minibar,
  NightStand,
  Rug,
  StrawHat,
  Thermostat,
} from "./furniture"

/* ─── Hotspots and viewpoints ───────────────────────────────── */

export type HotspotId =
  | "bed"
  | "pillows"
  | "linen"
  | "temperature"
  | "curtains"
  | "flowers"
  | "scent"
  | "welcome"
  | "fridge"
  | "terrace"
  | "view"

export const HOTSPOTS: Record<HotspotId, { at: Vec3; camera: Vec3; target: Vec3 }> = {
  bed: { at: [-0.3, 0.72, -0.9], camera: [1.45, 2.05, 2.35], target: [-1.2, 0.55, -0.2] },
  pillows: { at: [-2.02, 1.2, -0.68], camera: [0.15, 1.6, 1.25], target: [-2.0, 0.85, -0.2] },
  linen: { at: [-1.0, 0.92, -0.2], camera: [1.0, 2.25, -1.7], target: [-1.25, 0.95, -0.15] },
  temperature: { at: [2.26, 1.38, 2.3], camera: [1.7, 2.3, 1.9], target: [-0.9, 0.95, -0.2] },
  curtains: { at: [-1.22, 1.75, -3.3], camera: [0.7, 1.75, 1.7], target: [-0.1, 1.75, -3.4] },
  flowers: { at: [0.85, 1.25, -1.4], camera: [-0.55, 1.4, 0.25], target: [0.85, 0.95, -1.4] },
  welcome: { at: [1.04, 0.66, -1.0], camera: [0.2, 1.2, 0.05], target: [1.0, 0.55, -1.05] },
  scent: { at: [1.82, 1.6, -3.52], camera: [1.15, 1.5, -1.9], target: [1.82, 1.4, -3.55] },
  fridge: { at: [2.1, 1.25, 1.25], camera: [0.55, 1.5, 1.95], target: [2.15, 1.3, 1.25] },
  terrace: { at: [-3.15, 1.15, -6.8], camera: [-0.7, 1.75, -4.9], target: [-3.15, 0.75, -6.9] },
  view: { at: [0.3, 1.25, -9.2], camera: [-1.5, 1.65, -5.4], target: [1.6, 1.0, -9.8] },
}

/** Hotspots that sit outside. Markers are not hidden by walls, so each side only shows its own. */
const OUTDOOR: ReadonlySet<HotspotId> = new Set<HotspotId>(["terrace"])

/** Inside the room or out on the terrace. */
const isOut = (z: number) => z < -3.7
/** The middle of the arch: every walk between the room and the terrace passes through here. */
const DOORWAY: Vec3 = [0, 1.6, -3.75]

/* ─── Camera: flies to hotspots, lets you look around, never leaves the suite ─ */

function CameraRig({
  focus,
  viewpoint,
  reduced,
  onZone,
  pose,
}: {
  focus: HotspotId | null
  viewpoint: { id: ViewpointId; n: number }
  reduced: boolean
  onZone: (outside: boolean) => void
  pose?: React.MutableRefObject<Pose>
}) {
  const controls = React.useRef<React.ComponentRef<typeof OrbitControls>>(null)
  const { camera, size } = useThree()
  const flying = React.useRef(true)
  const outside = React.useRef(false)
  const goal = React.useRef({ cam: new THREE.Vector3(...VIEWPOINTS.door.camera), target: new THREE.Vector3(...VIEWPOINTS.door.target) })
  /** Set while the walk still has to pass through the arch before heading to the goal. */
  const via = React.useRef<THREE.Vector3 | null>(null)
  const look = React.useRef(new THREE.Vector3())

  // Portrait phones need a taller field of view to show the room, not a slice of it.
  React.useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const aspect = size.width / size.height
    cam.fov = aspect < 0.6 ? 78 : aspect < 1 ? 68 : 56
    cam.updateProjectionMatrix()
  }, [camera, size])

  React.useEffect(() => {
    const g = goal.current
    if (focus) {
      const h = HOTSPOTS[focus]
      g.cam.set(...h.camera)
      g.target.set(...h.target)
      // The panel covers the lower half of the screen, so aim below the object.
      if (focus !== "view") g.target.y -= size.width < 1024 ? 0.42 : 0.1
    } else {
      const v = VIEWPOINTS[viewpoint.id]
      g.cam.set(...v.camera)
      // Keep the pivot close to the eye so dragging feels like turning your head.
      g.target.set(...v.target).sub(g.cam).normalize().multiplyScalar(1.4).add(g.cam)
    }
    flying.current = true
    // Walk through the arch instead of through the cliff wall.
    via.current = isOut(camera.position.z) !== isOut(g.cam.z) ? new THREE.Vector3(...DOORWAY) : null
    if (reduced && controls.current) {
      camera.position.copy(g.cam)
      controls.current.target.copy(g.target)
      flying.current = false
    }
  }, [focus, viewpoint, reduced, camera, size.width])

  useFrame((_, dt) => {
    const c = controls.current
    if (!c) return
    const p = camera.position
    if (flying.current) {
      if (via.current) {
        // first leg: head for the arch, looking the way you are walking
        const k = 1 - Math.exp(-dt * 3.4)
        look.current.copy(via.current).sub(p).setY(0).normalize().multiplyScalar(1.4).add(via.current)
        p.lerp(via.current, k)
        c.target.lerp(look.current, k)
        if (p.distanceTo(via.current) < 0.55) via.current = null
      } else {
        const k = 1 - Math.exp(-dt * 2.8)
        p.lerp(goal.current.cam, k)
        c.target.lerp(goal.current.target, k)
        if (p.distanceTo(goal.current.cam) < 0.012) flying.current = false
      }
    } else {
      // three zones: the room, the passage through the sea wall, the terrace
      p.z = THREE.MathUtils.clamp(p.z, -9.0, 2.85)
      if (p.z > -2.95) {
        p.x = THREE.MathUtils.clamp(p.x, -2.15, 2.15)
        p.y = THREE.MathUtils.clamp(p.y, 0.45, 2.9)
      } else if (p.z > -4.2) {
        p.x = THREE.MathUtils.clamp(p.x, -0.9, 0.9)
        p.y = THREE.MathUtils.clamp(p.y, 0.5, 2.3)
      } else {
        p.x = THREE.MathUtils.clamp(p.x, -4.6, 4.6)
        p.y = THREE.MathUtils.clamp(p.y, 0.7, 2.4)
      }
    }
    c.update()
    if (pose) {
      pose.current.x = p.x
      pose.current.z = p.z
      pose.current.heading = Math.atan2(c.target.x - p.x, -(c.target.z - p.z))
    }
    const out = isOut(p.z)
    if (out !== outside.current) {
      outside.current = out
      onZone(out)
    }
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={-0.42}
      zoomSpeed={0.6}
      minDistance={0.5}
      maxDistance={4.2}
      minPolarAngle={0.3}
      maxPolarAngle={2.0}
      target={[0.2, 1.3, 2]}
      onStart={() => {
        flying.current = false
      }}
    />
  )
}

/* ─── Floor rings: tap one to walk there ────────────────────── */

function FloorRing({ id, onWalk }: { id: ViewpointId; onWalk: (id: ViewpointId) => void }) {
  const { reduced } = useSuite()
  const ring = React.useRef<THREE.Mesh>(null)
  const [hover, setHover] = React.useState(false)
  const v = VIEWPOINTS[id]
  useFrame(({ clock }) => {
    if (!ring.current || reduced) return
    const s = 1 + Math.sin(clock.elapsedTime * 2.2 + v.camera[0]) * 0.06
    ring.current.scale.set(s, s, 1)
  })
  React.useEffect(() => {
    if (!hover) return
    document.body.style.cursor = "pointer"
    return () => {
      document.body.style.cursor = ""
    }
  }, [hover])
  return (
    <group position={[v.camera[0], 0.045, v.camera[2]]} rotation-x={-Math.PI / 2}>
      {/* a generous invisible disc so the ring is easy to tap on a phone */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onWalk(id)
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <circleGeometry args={[0.5, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={ring} renderOrder={2}>
        <ringGeometry args={[0.2, 0.27, 40]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={hover ? 1 : 0.8} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh renderOrder={2}>
        <circleGeometry args={[0.07, 20]} />
        <meshBasicMaterial color="#9dbaff" transparent opacity={0.95} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ─── Hotspot markers ───────────────────────────────────────── */

function Marker({
  id,
  label,
  active,
  hidden,
  onSelect,
}: {
  id: HotspotId
  label: string
  active: boolean
  hidden: boolean
  onSelect: (id: HotspotId) => void
}) {
  return (
    <Html position={HOTSPOTS[id].at} center zIndexRange={[20, 0]}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onSelect(id)
        }}
        tabIndex={hidden ? -1 : 0}
        aria-label={`${label}: change it`}
        className={`group relative grid size-11 place-items-center transition-[opacity,transform] duration-300 ${hidden ? "pointer-events-none scale-75 opacity-0" : "opacity-100"}`}
      >
        {!active && <span className="absolute size-6 animate-ping rounded-full bg-white/45 [animation-duration:2.4s]" aria-hidden />}
        <span
          className={`relative grid size-[26px] place-items-center rounded-full border-[1.5px] shadow-[0_2px_8px_rgb(0_0_0/0.4)] backdrop-blur-sm transition-colors ${active ? "border-obsidian bg-sulphur" : "border-white bg-obsidian/55"}`}
        >
          <span className={`size-[7px] rounded-full ${active ? "bg-obsidian" : "bg-white"}`} />
        </span>
        <span
          className={`pointer-events-none absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors ${active ? "bg-sulphur text-obsidian" : "bg-obsidian/75 text-white"}`}
        >
          {label}
        </span>
      </button>
    </Html>
  )
}

/* ─── Renderer setup and post-processing ────────────────────── */

function Renderer({ high }: { high: boolean }) {
  const gl = useThree((s) => s.gl)
  React.useEffect(() => {
    // With the effect chain, tone mapping happens there. Without it, the renderer does it.
    gl.toneMapping = high ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.15
  }, [gl, high])
  return null
}

function Effects() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <N8AO aoRadius={0.9} distanceFalloff={0.8} intensity={3.4} quality="medium" halfRes color="#3a2a1a" />
      <Bloom intensity={0.55} luminanceThreshold={1.0} luminanceSmoothing={0.25} mipmapBlur />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette eskil={false} offset={0.22} darkness={0.5} />
    </EffectComposer>
  )
}

/* ─── The room ──────────────────────────────────────────────── */

export type SuiteSceneProps = {
  suiteId: SuiteId
  prefs: Prefs
  light: Light
  focus: HotspotId | null
  viewpoint: { id: ViewpointId; n: number }
  quality: "high" | "light"
  labels: Record<HotspotId, string>
  onSelect: (id: HotspotId) => void
  onWalk: (id: ViewpointId) => void
  pose?: React.MutableRefObject<Pose>
  onReady?: () => void
  onSlow?: () => void
}

function Room({ suiteId, prefs, light, focus, viewpoint, quality, labels, onSelect, onWalk, pose, onReady }: SuiteSceneProps) {
  const tex = useSuiteTextures()
  const atmos = React.useRef(createAtmos())
  const reduced = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )
  const [outside, setOutside] = React.useState(false)
  const ctx = React.useMemo(() => ({ atmos, tex, reduced }), [tex, reduced])

  React.useEffect(() => {
    onReady?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sheer = prefs.curtains === "sheer"
  // cooler rooms run the fan faster, which moves the sheers more
  const breeze = THREE.MathUtils.mapLinear(prefs.temperature, 18, 26, 1.5, 0.45)

  return (
    <SuiteContext.Provider value={ctx}>
      <Renderer high={quality === "high"} />
      <LightRig light={light} dim={sheer ? 0.6 : 1} highQuality={quality === "high"} />
      <CameraRig focus={focus} viewpoint={viewpoint} reduced={reduced} onZone={setOutside} pose={pose} />
      <SkyAndSea />
      <Shell />
      <Outside suiteId={suiteId} terrace={prefs.terrace ?? "loungers"} />

      <Rug />
      <Pop k={`${prefs.bed}-${prefs.pillow}-${prefs.linen}`} origin={[-1.3, 0, -0.2]}>
        <Bed prefs={prefs} />
      </Pop>
      <Banquette />
      <group position={[0.95, 0, -1.2]}>
        <Pop k={`${prefs.flowers}-${prefs.welcome}`}>
          <CoffeeTable flowers={prefs.flowers} welcome={prefs.welcome} />
        </Pop>
      </group>
      <group position={[NICHES[1].x, NICHES[1].sill, -HALF_D - 0.17]} scale={1.5}>
        <Pop k={prefs.scent}>
          <Diffuser scent={prefs.scent} />
        </Pop>
      </group>
      <group position={[NICHES[0].x, NICHES[0].sill, -HALF_D - 0.17]} scale={0.8}>
        <Lantern />
      </group>
      <group position={[2.2, 0, 1.25]}>
        <Pop k={prefs.fridge}>
          <Minibar fridge={prefs.fridge} />
        </Pop>
      </group>
      <group position={[W - 0.6, 0, -0.02]} rotation-y={-Math.PI / 2}>
        <Closet />
      </group>
      <group position={[W - 0.16, 1.38, 2.3]}>
        <Thermostat temperature={prefs.temperature} />
      </group>
      <Fan temperature={prefs.temperature} />
      <group position={[-2.1, 0, -1.72]}>
        <BedsideLamp />
      </group>
      <group position={[-2.12, 0, 1.32]}>
        <NightStand />
      </group>
      <group position={[1.55, 1.8, HALF_D - 0.02]}>
        <StrawHat />
      </group>
      <group position={[0, 0, -HALF_D + 0.1]}>
        <Curtains drawn={sheer} breeze={breeze} />
      </group>
      <DustMotes />

      {(Object.keys(HOTSPOTS) as HotspotId[]).map((id) => (
        <Marker
          key={id}
          id={id}
          label={labels[id]}
          active={focus === id}
          hidden={focus !== null || (outside ? !OUTDOOR.has(id) : OUTDOOR.has(id))}
          onSelect={onSelect}
        />
      ))}

      {focus === null &&
        (Object.keys(VIEWPOINTS) as ViewpointId[])
          .filter((id) => VIEWPOINTS[id].floor && id !== viewpoint.id)
          .map((id) => <FloorRing key={id} id={id} onWalk={onWalk} />)}

      {quality === "high" && <Effects />}
    </SuiteContext.Provider>
  )
}

export default function SuiteScene(props: SuiteSceneProps) {
  return (
    <Canvas
      shadows="soft"
      dpr={props.quality === "high" ? [1, 2] : [1, 1.5]}
      camera={{ position: [0.3, 1.5, -1.8], fov: 70, near: 0.05, far: 1600 }}
      gl={{ antialias: props.quality !== "high", powerPreference: "high-performance" }}
      className="touch-none"
    >
      <PerformanceMonitor ms={300} iterations={6} threshold={0.6} onDecline={() => props.onSlow?.()} />
      <Room {...props} />
    </Canvas>
  )
}
