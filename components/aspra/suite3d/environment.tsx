"use client"

/*
 * Everything outside the room and the light that comes in from it:
 * sky with sun, moon, clouds and stars, an animated sea, the terrace,
 * pergola, pool, rocks, and the light rig that eases between times of day.
 */

import * as React from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { Environment, Lightformer, RoundedBox } from "@react-three/drei"
import type { Light, SuiteId } from "../data"
import { useSuite } from "./context"
import { HALF_D, W, WALL_H, WALL_T, archPath, rng, rockGeometry, roomSection, shellGeometry, type Vec3 } from "./geometry"
import { Lantern } from "./furniture"

/* ─── Time-of-day presets ───────────────────────────────────── */

type Preset = {
  skyTop: string
  skyBottom: string
  sun: string
  sunIntensity: number
  sunPos: Vec3
  hemiSky: string
  hemiGround: string
  hemi: number
  env: number
  lamp: number
  night: number
  seaDeep: string
  seaShallow: string
}

export const PRESETS: Record<Light, Preset> = {
  morning: {
    skyTop: "#3f8fd0",
    skyBottom: "#bcdcee",
    sun: "#fff1dc",
    sunIntensity: 3.4,
    sunPos: [5, 8.5, -12],
    hemiSky: "#f4f1ea",
    hemiGround: "#d9c3a3",
    hemi: 0.74,
    env: 0.5,
    lamp: 0,
    night: 0,
    seaDeep: "#0f4f7c",
    seaShallow: "#35b3c4",
  },
  sunset: {
    skyTop: "#34497a",
    skyBottom: "#f6a465",
    sun: "#ff9f5a",
    sunIntensity: 3.0,
    sunPos: [-6.5, 2.3, -14],
    hemiSky: "#f5c29a",
    hemiGround: "#9a7460",
    hemi: 0.4,
    env: 0.3,
    lamp: 0.55,
    night: 0.12,
    seaDeep: "#27395f",
    seaShallow: "#c97f62",
  },
  night: {
    skyTop: "#050a16",
    skyBottom: "#16233c",
    sun: "#a9bdff",
    sunIntensity: 0.55,
    sunPos: [4.5, 4.6, -14],
    hemiSky: "#3b4b70",
    hemiGround: "#4a3a2c",
    hemi: 0.2,
    env: 0.1,
    lamp: 1,
    night: 1,
    seaDeep: "#07101f",
    seaShallow: "#12283c",
  },
}

/* ─── Shaders ───────────────────────────────────────────────── */

const NOISE = /* glsl */ `
  float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; }
    return s;
  }
`
const OUT = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`
const WORLD_VERTEX = /* glsl */ `
  varying vec3 vWorld;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`

const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 top; uniform vec3 bottom; uniform vec3 sunDir; uniform vec3 sunColor;
  uniform float night; uniform float time;
  varying vec3 vWorld;
  ${NOISE}
  void main() {
    vec3 d = normalize(vWorld);
    vec3 col = mix(bottom, top, smoothstep(-0.02, 0.5, d.y));
    float sd = max(dot(d, normalize(sunDir)), 0.0);
    // glow around the sun or moon, then the disc itself
    col += sunColor * (pow(sd, 8.0) * 0.14 * (1.0 - night * 0.6) + pow(sd, 120.0) * 0.35);
    col += sunColor * smoothstep(0.99972, 0.99988, sd) * mix(14.0, 3.2, night);
    // thin high cloud, lit by the sun
    if (d.y > 0.0) {
      vec2 uv = d.xz / (d.y + 0.14) * 1.25 + vec2(time * 0.006, 0.0);
      float c = smoothstep(0.5, 0.86, fbm(uv));
      c *= smoothstep(0.0, 0.14, d.y) * (1.0 - smoothstep(0.4, 0.85, d.y));
      vec3 cc = mix(vec3(1.0), sunColor, 0.55) * mix(1.05, 0.1, night);
      col = mix(col, cc, c * 0.6);
    }
    // stars
    vec3 cell = floor(d * 240.0);
    float st = hash21(cell.xy + cell.z * 17.0);
    float star = step(0.9975, st) * night * smoothstep(0.03, 0.3, d.y);
    col += vec3(star) * (1.2 + 0.8 * sin(time * 2.0 + st * 120.0));
    gl_FragColor = vec4(col, 1.0);
    ${OUT}
  }
`

const SEA_FRAGMENT = /* glsl */ `
  uniform vec3 deep; uniform vec3 shallow; uniform vec3 horizon; uniform vec3 skyTop;
  uniform vec3 sunDir; uniform vec3 sunColor; uniform float time; uniform float night;
  varying vec3 vWorld;
  ${NOISE}
  float waves(vec2 p, float t) {
    return fbm(p * 0.32 + vec2(t * 0.22, t * 0.15)) + 0.45 * fbm(p * 1.25 - vec2(t * 0.4, 0.0));
  }
  void main() {
    vec3 V = normalize(cameraPosition - vWorld);
    float dist = length(cameraPosition.xz - vWorld.xz);
    vec2 p = vWorld.xz;
    float t = time * 0.7;
    float e = 0.4;
    float h0 = waves(p, t);
    float hx = waves(p + vec2(e, 0.0), t);
    float hz = waves(p + vec2(0.0, e), t);
    float amp = mix(1.1, 0.1, smoothstep(15.0, 420.0, dist));
    vec3 N = normalize(vec3(-(hx - h0) * amp, e, -(hz - h0) * amp));
    float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);
    // clear turquoise over the white rock near the cliff, deep blue further out
    float shore = smoothstep(95.0, 16.0, dist);
    vec3 base = mix(deep, shallow, shore * 0.9);
    vec3 R = reflect(-V, N);
    vec3 skyRef = mix(horizon, skyTop, clamp(R.y * 1.6, 0.0, 1.0));
    vec3 col = mix(base, skyRef, clamp(fres * 0.6 + 0.04, 0.0, 1.0));
    // the sun or moon path on the water
    vec3 L = normalize(sunDir);
    float spec = max(dot(reflect(-L, N), V), 0.0);
    col += sunColor * (pow(spec, 260.0) * mix(4.0, 3.0, night) + pow(spec, 18.0) * mix(0.07, 0.08, night));
    col = mix(col, horizon, smoothstep(220.0, 1200.0, dist));
    gl_FragColor = vec4(col, 1.0);
    ${OUT}
  }
`

const POOL_FRAGMENT = /* glsl */ `
  uniform vec3 skyTop; uniform float time; uniform float night;
  varying vec3 vWorld; varying vec2 vUv;
  void main() {
    vec2 p = vWorld.xz * 3.2;
    float t = time * 0.8;
    float c1 = sin(p.x * 2.1 + sin(p.y * 1.7 + t) * 1.5 + t * 0.6);
    float c2 = sin(p.y * 2.3 + sin(p.x * 1.9 - t * 0.8) * 1.5 - t * 0.5);
    float ca = pow(1.0 - pow(abs(c1 * c2), 0.35), 3.0);
    vec2 e = min(vUv, 1.0 - vUv);
    float edge = smoothstep(0.0, 0.14, min(e.x, e.y));
    vec3 col = mix(vec3(0.10, 0.52, 0.60), vec3(0.36, 0.84, 0.86), edge * 0.6 + 0.2);
    col += vec3(0.9, 1.0, 0.95) * ca * 0.5 * (1.0 - night * 0.5);
    vec3 V = normalize(cameraPosition - vWorld);
    col = mix(col, skyTop, pow(1.0 - max(V.y, 0.0), 3.0) * 0.45);
    // underwater lights at night
    col = mix(col, vec3(0.05, 0.75, 0.85) * (1.3 + ca * 0.9), night * 0.85);
    gl_FragColor = vec4(col, 1.0);
    ${OUT}
  }
`

/* ─── Light rig ─────────────────────────────────────────────── */

export function LightRig({ light, dim, highQuality }: { light: Light; dim: number; highQuality: boolean }) {
  const { atmos } = useSuite()
  const { scene } = useThree()
  const sun = React.useRef<THREE.DirectionalLight>(null)
  const hemi = React.useRef<THREE.HemisphereLight>(null)
  const state = React.useRef({ night: PRESETS[light].night, lamp: PRESETS[light].lamp, env: PRESETS[light].env, dim })
  const tmp = React.useMemo(() => ({ c: new THREE.Color(), v: new THREE.Vector3() }), [])

  React.useEffect(() => {
    scene.fog = new THREE.Fog(PRESETS[light].skyBottom, 60, 520)
    return () => {
      scene.fog = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])

  useFrame(({ clock }, dt) => {
    const p = PRESETS[light]
    const a = atmos.current
    const k = 1 - Math.exp(-dt * 2.2)
    const s = state.current
    s.night += (p.night - s.night) * k
    s.lamp += (p.lamp - s.lamp) * k
    s.env += (p.env - s.env) * k
    s.dim += (dim - s.dim) * k
    a.night = s.night
    a.lamp = s.lamp
    a.time = clock.elapsedTime
    a.skyTop.lerp(tmp.c.set(p.skyTop), k)
    a.skyBottom.lerp(tmp.c.set(p.skyBottom), k)
    a.sunColor.lerp(tmp.c.set(p.sun), k)
    if (sun.current) {
      sun.current.position.lerp(tmp.v.set(...p.sunPos), k)
      sun.current.color.copy(a.sunColor)
      sun.current.intensity += (p.sunIntensity * s.dim - sun.current.intensity) * k
      a.sunDir.copy(sun.current.position).normalize()
    }
    if (hemi.current) {
      hemi.current.color.lerp(tmp.c.set(p.hemiSky), k)
      hemi.current.groundColor.lerp(tmp.c.set(p.hemiGround), k)
      hemi.current.intensity += (p.hemi * (0.7 + 0.3 * s.dim) - hemi.current.intensity) * k
    }
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(a.skyBottom)
    scene.environmentIntensity = s.env
  })

  const p = PRESETS[light]
  return (
    <>
      <hemisphereLight ref={hemi} args={[p.hemiSky, p.hemiGround, p.hemi]} />
      <directionalLight
        ref={sun}
        position={p.sunPos}
        intensity={p.sunIntensity}
        color={p.sun}
        castShadow
        shadow-mapSize={highQuality ? [2048, 2048] : [1024, 1024]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.035}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />
      {/* soft image-based light so materials pick up the sky and the warm bounce off the floor */}
      <Environment resolution={64} frames={1} key={light}>
        <mesh scale={60}>
          <sphereGeometry args={[1, 24, 12]} />
          <meshBasicMaterial color={p.skyBottom} side={THREE.BackSide} />
        </mesh>
        <Lightformer form="rect" intensity={1.0} color={p.hemiSky} position={[0, 30, 0]} rotation-x={Math.PI / 2} scale={[80, 80, 1]} />
        <Lightformer form="rect" intensity={p.night ? 0.6 : 3} color={p.sun} position={[0, 4, -30]} scale={[26, 14, 1]} />
        <Lightformer form="rect" intensity={0.9} color={p.hemiGround} position={[0, -20, 0]} rotation-x={-Math.PI / 2} scale={[80, 80, 1]} />
      </Environment>
    </>
  )
}

/* ─── Sky and sea ───────────────────────────────────────────── */

export function SkyAndSea() {
  const { atmos } = useSuite()
  const sky = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          top: { value: new THREE.Color() },
          bottom: { value: new THREE.Color() },
          sunDir: { value: new THREE.Vector3(0, 1, 0) },
          sunColor: { value: new THREE.Color() },
          night: { value: 0 },
          time: { value: 0 },
        },
        vertexShader: WORLD_VERTEX,
        fragmentShader: SKY_FRAGMENT,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  )
  const sea = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          deep: { value: new THREE.Color(PRESETS.morning.seaDeep) },
          shallow: { value: new THREE.Color(PRESETS.morning.seaShallow) },
          horizon: { value: new THREE.Color() },
          skyTop: { value: new THREE.Color() },
          sunDir: { value: new THREE.Vector3(0, 1, 0) },
          sunColor: { value: new THREE.Color() },
          night: { value: 0 },
          time: { value: 0 },
        },
        vertexShader: WORLD_VERTEX,
        fragmentShader: SEA_FRAGMENT,
        fog: false,
      }),
    [],
  )
  const tmp = React.useMemo(() => new THREE.Color(), [])

  useFrame((_, dt) => {
    const a = atmos.current
    const k = 1 - Math.exp(-dt * 2.2)
    const target = a.night > 0.6 ? PRESETS.night : a.night > 0.06 ? PRESETS.sunset : PRESETS.morning
    sky.uniforms.top.value.copy(a.skyTop)
    sky.uniforms.bottom.value.copy(a.skyBottom)
    sky.uniforms.sunDir.value.copy(a.sunDir)
    sky.uniforms.sunColor.value.copy(a.sunColor)
    sky.uniforms.night.value = a.night
    sky.uniforms.time.value = a.time
    sea.uniforms.deep.value.lerp(tmp.set(target.seaDeep), k)
    sea.uniforms.shallow.value.lerp(tmp.set(target.seaShallow), k)
    sea.uniforms.horizon.value.copy(a.skyBottom)
    sea.uniforms.skyTop.value.copy(a.skyTop)
    sea.uniforms.sunDir.value.copy(a.sunDir)
    sea.uniforms.sunColor.value.copy(a.sunColor)
    sea.uniforms.night.value = a.night
    sea.uniforms.time.value = a.time
  })

  return (
    <>
      <mesh material={sky} renderOrder={-10}>
        <sphereGeometry args={[600, 48, 24]} />
      </mesh>
      <mesh material={sea} rotation-x={-Math.PI / 2} position={[0, -14, -705]}>
        <planeGeometry args={[3200, 1400]} />
      </mesh>
    </>
  )
}

/* ─── Room shell ────────────────────────────────────────────── */

/** Centre x, half width, sill height and spring height of the two wall niches. */
export const NICHES: Array<{ x: number; hw: number; sill: number; spring: number }> = [
  { x: -1.82, hw: 0.27, sill: 0.95, spring: 1.38 },
  { x: 1.82, hw: 0.27, sill: 0.95, spring: 1.38 },
]

export function Shell() {
  const { tex } = useSuite()
  const plaster = React.useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f7f3ec",
        map: tex.plasterTint,
        bumpMap: tex.plasterBump,
        bumpScale: 0.7,
        roughness: 0.95,
        side: THREE.DoubleSide,
        shadowSide: THREE.DoubleSide,
      }),
    [tex],
  )
  const shell = React.useMemo(() => shellGeometry(), [])
  const backWall = React.useMemo(() => {
    const s = roomSection(W + 0.15, WALL_H)
    s.holes.push(archPath(0, 1.15, 0.05, 1.75))
    NICHES.forEach((n) => s.holes.push(archPath(n.x, n.hw, n.sill, n.spring)))
    return new THREE.ExtrudeGeometry(s, { depth: WALL_T, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 4, curveSegments: 40 })
  }, [])
  const frontWall = React.useMemo(() => {
    const s = roomSection(W + 0.15, WALL_H)
    s.holes.push(archPath(0, 0.52, 0.05, 1.95))
    return new THREE.ExtrudeGeometry(s, { depth: 0.4, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4, curveSegments: 32 })
  }, [])
  const door = React.useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.52, 0)
    s.lineTo(0.52, 0)
    s.lineTo(0.52, 1.95)
    s.absarc(0, 1.95, 0.52, 0, Math.PI, false)
    s.lineTo(-0.52, 0)
    return new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false, curveSegments: 24 })
  }, [])

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[W * 2 + 0.4, HALF_D * 2 + 0.4]} />
        <meshStandardMaterial map={tex.floor} roughness={0.42} bumpMap={tex.plasterBump} bumpScale={0.08} />
      </mesh>
      <mesh geometry={shell} material={plaster} receiveShadow castShadow />
      <mesh geometry={backWall} material={plaster} position={[0, 0, -HALF_D - WALL_T]} receiveShadow castShadow />
      {/* the back of each niche, 30 cm into the wall */}
      {NICHES.map((n) => (
        <mesh key={n.x} position={[n.x, n.sill + 0.42, -HALF_D - 0.36]} material={plaster} castShadow receiveShadow>
          <boxGeometry args={[n.hw * 2 + 0.2, 1.1, 0.1]} />
        </mesh>
      ))}
      <mesh geometry={frontWall} material={plaster} position={[0, 0, HALF_D]} receiveShadow castShadow />
      {/* plank door with an iron ring */}
      <group position={[0, 0.02, HALF_D + 0.22]}>
        <mesh geometry={door} castShadow>
          <meshStandardMaterial map={tex.wood} color="#c9b396" roughness={0.7} bumpMap={tex.wood} bumpScale={0.4} />
        </mesh>
        <mesh position={[0.34, 1.05, -0.02]}>
          <torusGeometry args={[0.045, 0.008, 8, 20]} />
          <meshStandardMaterial color="#26221f" metalness={0.7} roughness={0.45} />
        </mesh>
      </group>
      {/* stone threshold of the sea arch */}
      <mesh position={[0, 0.025, -HALF_D - WALL_T / 2]} receiveShadow>
        <boxGeometry args={[2.4, 0.05, WALL_T + 0.2]} />
        <meshStandardMaterial map={tex.pavers} roughness={0.8} />
      </mesh>
    </group>
  )
}

/* ─── Terrace and the world beyond ──────────────────────────── */

const Z_FACE = -HALF_D - WALL_T // outer face of the sea wall

function Bougainvillea() {
  const ref = React.useRef<THREE.InstancedMesh>(null)
  const items = React.useMemo(() => {
    const r = rng(404)
    const out: Array<{ p: Vec3; s: number; c: string; r: Vec3 }> = []
    for (let i = 0; i < 1100; i++) {
      // a vine that climbs right of the arch and trails over its crown
      const t = r()
      let x: number, y: number
      if (t < 0.6) {
        x = 1.35 + r() * 1.5 + Math.sin(r() * 6) * 0.2
        y = 0.25 + r() * 3.4
        x -= Math.max(0, y - 2.4) * 0.5
      } else {
        const a = r() * Math.PI * 0.75
        x = Math.cos(a) * (1.32 + r() * 0.5)
        y = 1.75 + Math.sin(a) * (1.32 + r() * 0.55)
      }
      const leaf = r() < 0.3
      out.push({
        p: [x, y, Z_FACE - 0.03 - r() * 0.2],
        s: leaf ? 0.04 + r() * 0.035 : 0.024 + r() * 0.03,
        c: leaf ? (r() > 0.5 ? "#3f6b34" : "#56803f") : ["#c2185b", "#d1357a", "#b0124f", "#e0569a"][Math.floor(r() * 4)],
        r: [r() * 3, r() * 3, r() * 3],
      })
    }
    return out
  }, [])
  React.useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new THREE.Object3D()
    const col = new THREE.Color()
    items.forEach((it, i) => {
      o.position.set(...it.p)
      o.rotation.set(...it.r)
      o.scale.set(it.s, it.s * 0.3, it.s * 0.75)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, col.set(it.c))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
  }, [items])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow>
      <sphereGeometry args={[1, 7, 5]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  )
}

function Lounger({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  const { tex } = useSuite()
  return (
    <group position={position} rotation-y={rotation}>
      <RoundedBox args={[0.72, 0.22, 1.95]} radius={0.06} position={[0, 0.11, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f1ebe1" roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[0.66, 0.1, 1.5]} radius={0.045} position={[0, 0.27, 0.2]} castShadow>
        <meshStandardMaterial color="#e6dac4" roughness={1} bumpMap={tex.linen} bumpScale={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.66, 0.1, 0.6]} radius={0.045} position={[0, 0.42, -0.72]} rotation-x={-0.75} castShadow>
        <meshStandardMaterial color="#e6dac4" roughness={1} bumpMap={tex.linen} bumpScale={0.3} />
      </RoundedBox>
    </group>
  )
}

function Boat() {
  const { atmos, reduced } = useSuite()
  const ref = React.useRef<THREE.Group>(null)
  const lamp = React.useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = reduced ? 0 : clock.elapsedTime
    ref.current.position.set(-34 + t * 0.12, -13.75 + Math.sin(t * 0.9) * 0.08, -72)
    ref.current.rotation.z = Math.sin(t * 0.7) * 0.03
    if (lamp.current) lamp.current.emissiveIntensity = atmos.current.lamp * 6
  })
  return (
    <group ref={ref} scale={1.6}>
      <mesh scale={[2.6, 0.55, 0.85]} castShadow>
        <sphereGeometry args={[1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#f4efe6" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.02, 0]} scale={[2.62, 0.08, 0.87]}>
        <cylinderGeometry args={[1, 1, 1, 20]} />
        <meshStandardMaterial color="#2f6f8f" roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 1.3, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 2.6, 6]} />
        <meshStandardMaterial color="#7a5a40" />
      </mesh>
      <mesh position={[-0.55, 1.35, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array([0.7, 1.15, 0, 0.7, -0.9, 0, -1.3, -0.9, 0]), 3]} />
        </bufferGeometry>
        <meshStandardMaterial color="#f6efe0" side={THREE.DoubleSide} roughness={1} />
      </mesh>
      <mesh position={[0.2, 2.65, 0]} scale={0.07}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial ref={lamp} color="#ffd9a0" emissive="#ffb35c" emissiveIntensity={0} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function Outside({ suiteId }: { suiteId: SuiteId }) {
  const { tex, atmos } = useSuite()
  const pool = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { skyTop: { value: new THREE.Color() }, time: { value: 0 }, night: { value: 0 } },
        vertexShader: WORLD_VERTEX,
        fragmentShader: POOL_FRAGMENT,
        fog: false,
      }),
    [],
  )
  useFrame(() => {
    pool.uniforms.skyTop.value.copy(atmos.current.skyTop)
    pool.uniforms.time.value = atmos.current.time
    pool.uniforms.night.value = atmos.current.night
  })

  const rock = React.useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#efe9dd", roughness: 1, bumpMap: tex.plasterBump, bumpScale: 1.4 }),
    [tex],
  )
  const white = React.useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#f6f2ea", roughness: 0.95, map: tex.plasterTint, bumpMap: tex.plasterBump, bumpScale: 0.6 }),
    [tex],
  )
  const wood = React.useMemo(() => new THREE.MeshStandardMaterial({ map: tex.wood, color: "#e2c9a8", roughness: 0.8 }), [tex])
  const rocks = React.useMemo(() => [rockGeometry(1, 4, 0.3), rockGeometry(5, 3, 0.4), rockGeometry(9, 3, 0.45)], [])

  // the cliff face the suite is cut into, with the arch opening through it
  const facade = React.useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-16, -1)
    s.lineTo(16, -1)
    s.lineTo(16, 5.4)
    s.bezierCurveTo(9, 7.4, 4, 5.2, 0, 6.3)
    s.bezierCurveTo(-5, 7.5, -10, 5.6, -16, 6.6)
    s.lineTo(-16, -1)
    s.holes.push(archPath(0, 1.2, 0.02, 1.75))
    return new THREE.ShapeGeometry(s, 32)
  }, [])

  const hasPool = suiteId !== "cave"
  const slats = React.useMemo(() => Array.from({ length: 17 }, (_, i) => -8.75 + i * 0.22), [])

  return (
    <group>
      <mesh geometry={facade} material={white} position={[0, 0, Z_FACE - 0.012]} rotation-y={Math.PI} castShadow receiveShadow />
      {/* rounded rock above and beside the facade so it reads as cliff, not wall */}
      <mesh geometry={rocks[0]} material={rock} position={[0, 8.2, -1.5]} scale={[19, 4.2, 6]} />
      <mesh geometry={rocks[1]} material={rock} position={[-9.5, 2.2, -5.2]} scale={[4.2, 4.8, 2.6]} castShadow />
      <mesh geometry={rocks[2]} material={rock} position={[9.2, 1.8, -5.6]} scale={[3.8, 4.2, 2.4]} castShadow />

      {/* terrace */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, Z_FACE - 2.7]} receiveShadow>
        <planeGeometry args={[10.4, 5.5]} />
        <meshStandardMaterial map={tex.pavers} roughness={0.85} bumpMap={tex.plasterBump} bumpScale={0.25} />
      </mesh>
      <RoundedBox args={[10.4, 0.5, 0.36]} radius={0.14} smoothness={5} position={[0, 0.25, Z_FACE - 5.4]} material={white} castShadow receiveShadow />
      <mesh geometry={rocks[0]} material={rock} position={[0, -7.6, Z_FACE - 3.2]} scale={[13, 7.8, 5.2]} />

      {/* pergola with reed slats: striped shade over the loungers */}
      <group>
        {[[-4.6, Z_FACE - 0.9], [-1.7, Z_FACE - 0.9], [-4.6, Z_FACE - 4.6], [-1.7, Z_FACE - 4.6]].map(([x, z], i) => (
          <RoundedBox key={i} args={[0.24, 2.5, 0.24]} radius={0.08} position={[x, 1.25, z]} material={white} castShadow receiveShadow />
        ))}
        {[-4.6, -1.7].map((x) => (
          <mesh key={x} position={[x, 2.56, Z_FACE - 2.75]} material={wood} castShadow>
            <boxGeometry args={[0.1, 0.12, 4.2]} />
          </mesh>
        ))}
        {slats.map((z) => (
          <mesh key={z} position={[-3.15, 2.66, z + (Z_FACE + 4)]} rotation-z={Math.PI / 2} material={wood} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 3.4, 6]} />
          </mesh>
        ))}
      </group>
      <Lounger position={[-3.75, 0, Z_FACE - 2.8]} rotation={Math.PI} />
      <Lounger position={[-2.6, 0, Z_FACE - 2.8]} rotation={Math.PI} />

      {hasPool && (
        <group position={[2.3, 0, Z_FACE - 3.1]}>
          <RoundedBox args={[3.5, 0.16, 2.5]} radius={0.06} position={[0, 0.03, 0]} material={white} receiveShadow castShadow />
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.115, 0]} material={pool}>
            <planeGeometry args={[3.1, 2.1]} />
          </mesh>
        </group>
      )}

      {/* potted olive by the arch */}
      <group position={[-1.75, 0, Z_FACE - 0.55]}>
        <mesh position={[0, 0.24, 0]} castShadow>
          <cylinderGeometry args={[0.27, 0.2, 0.48, 24]} />
          <meshStandardMaterial color="#b0653f" roughness={0.9} />
        </mesh>
        <mesh position={[0.02, 0.9, 0]} rotation-z={0.12} castShadow>
          <cylinderGeometry args={[0.035, 0.06, 0.95, 8]} />
          <meshStandardMaterial color="#6b5a45" roughness={1} />
        </mesh>
        {[[0.1, 1.5, 0, 0.42], [-0.26, 1.34, 0.12, 0.33], [0.32, 1.3, -0.1, 0.3], [0, 1.74, -0.08, 0.3], [-0.05, 1.45, -0.25, 0.28]].map(([x, y, z, s], i) => (
          <mesh key={i} geometry={rocks[2]} position={[x, y, z]} scale={[s, s * 0.75, s * 0.9]} castShadow>
            <meshStandardMaterial color={i % 2 ? "#7f8f68" : "#93a27a"} roughness={1} />
          </mesh>
        ))}
      </group>
      <Bougainvillea />

      <group position={[1.6, 0, Z_FACE - 0.6]}>
        <Lantern withLight />
      </group>
      <group position={[-0.9, 0.5, Z_FACE - 5.4]}>
        <Lantern />
      </group>

      {/* the bay: headlands, rocks at the water line, and the hotel caique */}
      <mesh geometry={rocks[1]} position={[-150, -14, -330]} scale={[150, 26, 50]}>
        <meshStandardMaterial color="#b9b3a6" roughness={1} />
      </mesh>
      <mesh geometry={rocks[2]} position={[150, -14, -290]} scale={[110, 18, 40]}>
        <meshStandardMaterial color="#c2bcae" roughness={1} />
      </mesh>
      {[[-22, -13.4, -32, 5], [16, -13.8, -40, 4], [-6, -13.9, -52, 3], [34, -13.6, -64, 6]].map(([x, y, z, s], i) => (
        <mesh key={i} geometry={rocks[i % 3]} material={rock} position={[x, y, z]} scale={[s * 1.5, s * 0.6, s]} />
      ))}
      <Boat />
    </group>
  )
}

/* ─── Dust in the sunbeam ───────────────────────────────────── */

export function DustMotes() {
  const { tex, atmos, reduced } = useSuite()
  const count = 46
  const geom = React.useRef<THREE.BufferGeometry>(null)
  const mat = React.useRef<THREE.PointsMaterial>(null)
  const seeds = React.useMemo(() => {
    const r = rng(303)
    return Array.from({ length: count }, () => ({ x: (r() - 0.5) * 2.4, y: 0.25 + r() * 2.2, z: -3.1 + r() * 3, s: 0.3 + r() * 0.7, o: r() * 10 }))
  }, [])
  const positions = React.useMemo(() => new Float32Array(count * 3), [])
  useFrame(({ clock }) => {
    if (!geom.current) return
    const t = reduced ? 0 : clock.elapsedTime
    seeds.forEach((s, i) => {
      positions[i * 3] = s.x + Math.sin(t * 0.12 * s.s + s.o) * 0.25
      positions[i * 3 + 1] = s.y + Math.sin(t * 0.09 * s.s + s.o * 2) * 0.2
      positions[i * 3 + 2] = s.z + Math.cos(t * 0.1 * s.s + s.o) * 0.25
    })
    geom.current.attributes.position.needsUpdate = true
    if (mat.current) mat.current.opacity = 0.22 * (1 - atmos.current.night)
  })
  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geom}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={mat} map={tex.dot} color="#fff3d6" size={0.014} transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  )
}
