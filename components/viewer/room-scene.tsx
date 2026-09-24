"use client"

import * as React from "react"
import { Canvas } from "@react-three/fiber"
import * as THREE from "three"
import { ModelViewer } from "./model-viewer"
import { LoadingOverlay } from "./loading-overlay"
import type { TouchpointId } from "./touchpoints-data"

type Props = {
  url: string
  onTouchpoint: (id: TouchpointId | null) => void
  activeTouchpoint: TouchpointId | null
  timeOfDay: number
}

export function RoomScene({ url, onTouchpoint, activeTouchpoint, timeOfDay }: Props) {
  const [loading, setLoading] = React.useState(true)
  const [progress, setProgress] = React.useState(0)

  const handleLoaded = React.useCallback(() => setLoading(false), [])
  const handleProgress = React.useCallback((pct: number) => setProgress(pct), [])

  return (
    <div className="relative h-full w-full">
      {/* Loading overlay */}
      <LoadingOverlay visible={loading} progress={progress} />

      <Canvas
        shadows="soft"
        camera={{ position: [5, 4, 5], fov: 45, near: 0.01, far: 1000, up: [0, 1, 0] }}
        gl={{
          antialias: false, // handled by SMAA post-process instead
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 2]}
        flat={false}
        style={{ background: "#ffffff" }}
      >
        <React.Suspense fallback={null}>
          <ModelViewer
            url={url}
            onLoaded={handleLoaded}
            onProgress={handleProgress}
            onTouchpoint={onTouchpoint}
            activeTouchpoint={activeTouchpoint}
            timeOfDay={timeOfDay}
          />
        </React.Suspense>
      </Canvas>
    </div>
  )
}
