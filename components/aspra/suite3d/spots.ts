/*
 * Places to stand in the suite. Kept apart from the scene so the tour's interface
 * can list them without loading the 3D engine.
 */

import type { Vec3 } from "./geometry"

export type ViewpointId = "door" | "room" | "bed" | "window" | "terrace" | "pergola" | "rail" | "shower"

/**
 * Places to stand. `floor` puts a ring on the ground there that you can tap to walk to.
 * The bed is a place to lie down, so it has no ring.
 */
export const VIEWPOINTS: Record<ViewpointId, { label: string; camera: Vec3; target: Vec3; floor: boolean }> = {
  door: { label: "Door", camera: [1.85, 1.75, 2.8], target: [-0.35, 1.0, -1.6], floor: true },
  room: { label: "Wardrobe", camera: [0.1, 1.6, 0.4], target: [2.4, 1.15, -0.05], floor: true },
  bed: { label: "Bed", camera: [-1.55, 1.25, -0.2], target: [0.5, 1.2, -3.6], floor: false },
  window: { label: "Window", camera: [-0.25, 1.6, -1.55], target: [0.2, 1.25, -9.5], floor: true },
  terrace: { label: "Terrace", camera: [-1.5, 1.65, -5.4], target: [1.6, 1.0, -9.8], floor: true },
  pergola: { label: "Pergola", camera: [-3.15, 1.65, -5.15], target: [-3.15, 0.7, -7.6], floor: true },
  rail: { label: "Sea wall", camera: [0.7, 1.65, -8.75], target: [-6, -4, -60], floor: true },
  shower: { label: "Shower", camera: [1.25, 1.65, -5.25], target: [3.95, 1.05, -4.55], floor: true },
}

/** Where the camera is, for the floor plan. Written every frame, read by the plan outside React. */
export type Pose = { x: number; z: number; heading: number }
