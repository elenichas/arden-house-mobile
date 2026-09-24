"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

export function LoadingOverlay({
  visible,
  progress,
}: {
  visible: boolean
  progress: number
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white"
        >
          {/* Subtle radial glow */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.05]"
            style={{
              background:
                "radial-gradient(ellipse 50% 40% at 50% 50%, var(--gold), transparent 70%)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Animated cube wireframe — a minimal 3D hint */}
            <div className="relative h-12 w-12">
              <motion.div
                animate={{ rotateY: 360, rotateX: 360 }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="h-full w-full border border-tan rounded-md"
                style={{ transformStyle: "preserve-3d" }}
              />
            </div>

            <div className="text-center">
              <p className="font-serif text-[15px] text-ink-soft italic">
                Preparing your room…
              </p>
              {progress > 0 && progress < 100 && (
                <p className="mt-1 text-[12px] text-ink-muted tabular-nums">
                  {progress}%
                </p>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-48 h-[2px] rounded-full bg-tan/50 overflow-hidden">
              <motion.div
                className="h-full bg-gold/50 rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: progress > 0 ? `${progress}%` : "30%",
                }}
                transition={{
                  duration: progress > 0 ? 0.3 : 2,
                  ease: progress > 0 ? "easeOut" : "easeInOut",
                  ...(progress === 0 && {
                    repeat: Infinity,
                    repeatType: "reverse" as const,
                  }),
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
