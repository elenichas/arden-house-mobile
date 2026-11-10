"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { defaultPrefs, type Prefs, type SuiteId } from "@/components/aspra/data"
import { SuiteTour } from "@/components/aspra/suite3d/suite-tour"

const ids = new Set<SuiteId>(["cave", "pool", "villa"])

/** The 3D suite on its own, for example /suite?suite=pool. Choices are not saved here. */
function Preview() {
  const router = useRouter()
  const param = useSearchParams().get("suite") as SuiteId | null
  const [prefs, setPrefs] = React.useState<Prefs>(defaultPrefs)
  return (
    <SuiteTour
      suiteId={param && ids.has(param) ? param : "pool"}
      prefs={prefs}
      onChange={(p) => setPrefs((x) => ({ ...x, ...p }))}
      saveLabel="Back to the app"
      onClose={() => router.push("/")}
    />
  )
}

export default function SuitePage() {
  return (
    <React.Suspense fallback={null}>
      <Preview />
    </React.Suspense>
  )
}
