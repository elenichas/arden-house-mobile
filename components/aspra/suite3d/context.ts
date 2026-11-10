import * as React from "react"
import * as THREE from "three"
import type { SuiteTextures } from "./textures"

/** Live lighting state, written once per frame by the light rig and read by everything that glows. */
export type Atmos = {
  /** 0 in daylight, 1 at night */
  night: number
  /** how lit the lamps and candles are, 0 to 1 */
  lamp: number
  sunDir: THREE.Vector3
  sunColor: THREE.Color
  skyTop: THREE.Color
  skyBottom: THREE.Color
  time: number
}

export function createAtmos(): Atmos {
  return {
    night: 0,
    lamp: 0,
    sunDir: new THREE.Vector3(0.3, 0.6, -0.7).normalize(),
    sunColor: new THREE.Color("#fff4e2"),
    skyTop: new THREE.Color("#6fb2df"),
    skyBottom: new THREE.Color("#e3f0f6"),
    time: 0,
  }
}

export const SuiteContext = React.createContext<{
  atmos: React.MutableRefObject<Atmos>
  tex: SuiteTextures
  reduced: boolean
} | null>(null)

export function useSuite() {
  const ctx = React.useContext(SuiteContext)
  if (!ctx) throw new Error("useSuite must be used inside the suite scene")
  return ctx
}
