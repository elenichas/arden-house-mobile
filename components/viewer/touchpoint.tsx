"use client"

import * as React from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import { cn } from "@/lib/utils"
import type { TouchpointId } from "./touchpoints-data"

type Props = {
  id: TouchpointId
  label: string
  position: [number, number, number]
  active: boolean
  onClick: () => void
}

/**
 * A pulsing gold dot in 3D space. On hover it shows a label.
 * On click it opens the touchpoint panel.
 *
 * Uses drei's <Html> to render a DOM element anchored to 3D coords,
 * so we get pixel-perfect typography and animations via CSS.
 */
export function Touchpoint({ id: _id, label, position, active, onClick }: Props) {
  const groupRef = React.useRef<THREE.Group>(null)
  const [hovered, setHovered] = React.useState(false)

  /* Gentle floating animation */
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(clock.elapsedTime * 1.8 + position[0]) * 0.04
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <Html
        center
        distanceFactor={8}
        zIndexRange={[50, 0]}
        style={{ pointerEvents: "auto" }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          className={cn(
            "group relative flex items-center justify-center outline-none",
            "transition-transform duration-300",
            (hovered || active) && "scale-110",
          )}
          aria-label={label}
        >
          {/* Outer pulse ring */}
          <span
            className="absolute h-10 w-10 rounded-full animate-ping opacity-30 bg-white"
            style={{ animationDuration: "2.2s" }}
          />

          {/* Middle glow ring */}
          <span
            className={cn(
              "absolute h-7 w-7 rounded-full transition-shadow duration-500 bg-white/30",
              active && "shadow-[0_0_20px_4px_rgba(255,255,255,0.4)]",
            )}
          />

          {/* Core dot */}
          <span
            className={cn(
              "relative h-3.5 w-3.5 rounded-full border-2 border-white/80 transition-all duration-500",
              "bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.35)]",
              active && "shadow-[0_0_14px_3px_rgba(255,255,255,0.5)]",
            )}
          />

          {/* Label tooltip */}
          <span
            className={cn(
              "absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap",
              "rounded-lg px-3 py-1.5",
              "font-serif text-[12px] tracking-wide text-ink",
              "glass-card",
              "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]",
              "transition-all duration-300",
              hovered || active
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1 pointer-events-none",
            )}
          >
            {label}
          </span>
        </button>
      </Html>
    </group>
  )
}
