"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { VIEWPOINTS, type Pose, type ViewpointId } from "./spots"

/*
 * A small plan of the suite, sea at the top. It shows the places you can stand,
 * where you are and which way you are looking. The marker follows the camera
 * outside React, so the 3D view never re-renders for it.
 */
export function FloorPlan({
  pose,
  current,
  hasPool,
  className,
}: {
  pose: React.MutableRefObject<Pose>
  current: ViewpointId | null
  hasPool: boolean
  className?: string
}) {
  const you = React.useRef<SVGGElement>(null)

  React.useEffect(() => {
    let frame = 0
    const tick = () => {
      const p = pose.current
      you.current?.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.z.toFixed(2)}) rotate(${((p.heading * 180) / Math.PI).toFixed(1)})`)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [pose])

  return (
    <div aria-hidden className={cn("glass-smoke pointer-events-none rounded-2xl p-1.5", className)}>
      <svg viewBox="-5.6 -9.9 11.2 13.8" className="block h-[104px] w-[84px] lg:h-[138px] lg:w-[112px]">
        {/* terrace, then the room cut into the cliff, joined by the arch */}
        <rect x="-5.2" y="-9.45" width="10.4" height="5.45" rx="0.5" fill="rgb(255 255 255 / 0.16)" stroke="rgb(255 255 255 / 0.55)" strokeWidth="0.12" />
        <rect x="-2.5" y="-3.45" width="5" height="6.9" rx="0.9" fill="rgb(255 255 255 / 0.24)" stroke="rgb(255 255 255 / 0.7)" strokeWidth="0.12" />
        <rect x="-1.1" y="-4.1" width="2.2" height="0.8" fill="rgb(255 255 255 / 0.24)" />
        {/* bed, wardrobe, pergola, pool, shower */}
        <rect x="-2.4" y="-1.2" width="2.1" height="2" rx="0.25" fill="rgb(255 255 255 / 0.35)" />
        <rect x="1.9" y="-0.75" width="0.5" height="1.5" rx="0.15" fill="rgb(255 255 255 / 0.35)" />
        <rect x="-4.7" y="-8.6" width="3.1" height="3.7" rx="0.2" fill="none" stroke="rgb(255 255 255 / 0.5)" strokeWidth="0.1" strokeDasharray="0.3 0.25" />
        {hasPool && <rect x="0.75" y="-8.15" width="3.1" height="2.1" rx="0.3" fill="rgb(157 186 255 / 0.75)" />}
        <circle cx="3.95" cy="-4.6" r="0.5" fill="rgb(157 186 255 / 0.6)" />
        {(Object.keys(VIEWPOINTS) as ViewpointId[]).map((id) => {
          const v = VIEWPOINTS[id]
          return <circle key={id} cx={v.camera[0]} cy={v.camera[2]} r={id === current ? 0.42 : 0.3} fill={id === current ? "#ffffff" : "rgb(255 255 255 / 0.55)"} />
        })}
        {/* you: a dot with a view cone */}
        <g ref={you}>
          <path d="M0 0 L-1.5 -2.5 A2.9 2.9 0 0 1 1.5 -2.5 Z" fill="rgb(157 186 255 / 0.45)" />
          <circle r="0.55" fill="#9dbaff" stroke="#0a0c11" strokeWidth="0.16" />
        </g>
      </svg>
    </div>
  )
}
