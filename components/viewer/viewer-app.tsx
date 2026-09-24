"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { UploadZone } from "./upload-zone"
import { RoomScene } from "./room-scene"
import { ViewerHeader } from "./viewer-header"
import { TouchpointPanel } from "./touchpoint-panel"
import { TimeOfDaySlider } from "./time-of-day"
import type { TouchpointId } from "./touchpoints-data"

export type ViewerState =
  | { phase: "upload" }
  | { phase: "loading"; file: File; progress: number }
  | { phase: "scene"; objectUrl: string; fileName: string }

export function ViewerApp() {
  const [state, setState] = React.useState<ViewerState>({ phase: "upload" })
  const [activeTouchpoint, setActiveTouchpoint] = React.useState<TouchpointId | null>(null)
  const [timeOfDay, setTimeOfDay] = React.useState(0.3)

  /* When a file is picked (via drop or click) we create an object URL and move
     to the loading phase. The actual Three.js GLTFLoader fires its own
     progress events — we surface those back here via onProgress. */
  const handleFile = React.useCallback((file: File) => {
    const objectUrl = URL.createObjectURL(file)
    setState({ phase: "loading", file, progress: 0 })

    // Small delay so the loading UI mounts before we flip to scene
    // — the actual heavy lifting is in <RoomScene>'s loader.
    requestAnimationFrame(() => {
      setState({ phase: "scene", objectUrl, fileName: file.name })
    })
  }, [])

  const handleReset = React.useCallback(() => {
    if (state.phase === "scene") {
      URL.revokeObjectURL(state.objectUrl)
    }
    setState({ phase: "upload" })
    setActiveTouchpoint(null)
  }, [state])

  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-background">
      {/* ── Header ──────────────────────────────────── */}
      <ViewerHeader
        fileName={state.phase === "scene" ? state.fileName : undefined}
        onReset={state.phase !== "upload" ? handleReset : undefined}
      />

      {/* ── Upload zone ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        {state.phase === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <UploadZone onFile={handleFile} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3D Scene ────────────────────────────────── */}
      <AnimatePresence>
        {state.phase === "scene" && (
          <motion.div
            key="scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute inset-0 z-0"
          >
            <RoomScene
              url={state.objectUrl}
              onTouchpoint={setActiveTouchpoint}
              activeTouchpoint={activeTouchpoint}
              timeOfDay={timeOfDay}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Touchpoint panel ────────────────────────── */}
      <TouchpointPanel
        touchpointId={activeTouchpoint}
        onClose={() => setActiveTouchpoint(null)}
      />

      {/* ── Time-of-day slider ──────────────────────── */}
      {state.phase === "scene" && (
        <TimeOfDaySlider value={timeOfDay} onChange={setTimeOfDay} />
      )}
    </main>
  )
}
