"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, RotateCcw, Box } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  fileName?: string
  onReset?: () => void
}

export function ViewerHeader({ fileName, onReset }: Props) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40",
        "flex items-center justify-between px-5 py-4",
        "pointer-events-none",
      )}
    >
      {/* Left — back / brand */}
      <motion.a
        href="/"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
        className={cn(
          "pointer-events-auto flex items-center gap-2.5",
          "rounded-full px-3 py-2",
          "glass-warm",
          "text-ink-soft hover:text-ink transition-colors duration-300",
        )}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        <span className="font-serif text-[13px] tracking-wide">Arden House</span>
      </motion.a>

      {/* Centre — file name */}
      {fileName && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={cn(
            "pointer-events-auto flex items-center gap-2",
            "rounded-full px-4 py-2",
            "glass-warm",
          )}
        >
          <Box className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
          <span className="font-serif text-[12px] text-ink-muted truncate max-w-[180px]">
            {fileName}
          </span>
        </motion.div>
      )}

      {/* Right — reset */}
      {onReset && (
        <motion.button
          type="button"
          onClick={onReset}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={cn(
            "pointer-events-auto flex items-center gap-2",
            "rounded-full px-3 py-2",
            "glass-warm",
            "text-ink-muted hover:text-ink-soft transition-colors duration-300",
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="font-serif text-[12px] tracking-wide">New model</span>
        </motion.button>
      )}
    </header>
  )
}
