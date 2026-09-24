"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Upload, FileBox, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_SIZE_MB = 800
const ACCEPTED = ".glb,.gltf"

export function UploadZone({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const validate = React.useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase()
      if (ext !== "glb" && ext !== "gltf") {
        setError("Only .glb and .gltf files are supported.")
        return
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File exceeds ${MAX_SIZE_MB} MB limit.`)
        return
      }
      setError(null)
      onFile(file)
    },
    [onFile],
  )

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) validate(file)
    },
    [validate],
  )

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) validate(file)
    },
    [validate],
  )

  return (
    <div className="flex flex-col items-center gap-8 px-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
        className="text-center"
      >
        <h1 className="font-serif text-[28px] leading-tight tracking-tight text-ink">
          Room Viewer
        </h1>
        <p className="mt-2 max-w-xs font-serif italic text-[15px] text-ink-muted leading-relaxed">
          Upload a .glb model of your hotel room to explore it in 3D with interactive touchpoints.
        </p>
      </motion.div>

      {/* Drop zone */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "group relative flex flex-col items-center justify-center gap-5",
          "w-full max-w-sm aspect-[4/3] rounded-[22px] cursor-pointer",
          "transition-all duration-500 ease-out",
          dragging
            ? "border-2 border-dashed border-gold/60 bg-gold/[0.08]"
            : "border border-dashed border-tan bg-cream-soft hover:border-gold/40 hover:bg-beige/50",
        )}
      >
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-500",
            dragging ? "bg-gold/15 text-gold-deep" : "bg-beige text-ink-muted group-hover:text-ink-soft",
          )}
        >
          {dragging ? (
            <FileBox className="h-7 w-7" strokeWidth={1.3} />
          ) : (
            <Upload className="h-7 w-7" strokeWidth={1.3} />
          )}
        </div>

        <div className="text-center px-6">
          <p className="font-serif text-[15px] text-ink-soft">
            {dragging ? "Drop your model here" : "Drag & drop a .glb file"}
          </p>
          <p className="mt-1 text-[12px] text-ink-muted">
            or click to browse · up to {MAX_SIZE_MB} MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleChange}
          className="hidden"
        />
      </motion.button>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-[13px] text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="max-w-xs text-center space-y-1"
      >
        <p className="text-[11.5px] text-ink-muted/70 leading-relaxed">
          For best results, optimise your Rhino model through Blender and export
          as a Draco-compressed .glb — target under 50 MB and 300K triangles.
        </p>
      </motion.div>
    </div>
  )
}
