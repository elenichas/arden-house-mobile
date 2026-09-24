"use client"

import * as React from "react"
import * as THREE from "three"
import { useThree, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
} from "@react-three/drei"
import {
  EffectComposer,
  Bloom,
  Vignette,
  SMAA,
} from "@react-three/postprocessing"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { Touchpoint } from "./touchpoint"
import { touchpoints, type TouchpointId } from "./touchpoints-data"
import { interpolateLighting } from "./time-of-day"

type Props = {
  url: string
  onLoaded: () => void
  onProgress: (pct: number) => void
  onTouchpoint: (id: TouchpointId | null) => void
  activeTouchpoint: TouchpointId | null
  timeOfDay: number
}

export function ModelViewer({
  url,
  onLoaded,
  onProgress,
  onTouchpoint,
  activeTouchpoint,
  timeOfDay,
}: Props) {
  const { scene: rootScene, camera, gl } = useThree()
  const [model, setModel] = React.useState<THREE.Group | null>(null)
  const controlsRef = React.useRef<any>(null)

  // Light refs for per-frame updates
  const ambientRef = React.useRef<THREE.AmbientLight>(null)
  const sunRef = React.useRef<THREE.DirectionalLight>(null)
  const fillRef = React.useRef<THREE.DirectionalLight>(null)
  const lampRef = React.useRef<THREE.PointLight>(null)
  const bgRef = React.useRef<THREE.Color>(new THREE.Color("#ffffff"))

  // Stable refs for callbacks — prevents the load effect from re-firing
  // when parent re-renders (e.g. touchpoint selection, time-of-day change)
  const onLoadedRef = React.useRef(onLoaded)
  const onProgressRef = React.useRef(onProgress)
  React.useEffect(() => { onLoadedRef.current = onLoaded }, [onLoaded])
  React.useEffect(() => { onProgressRef.current = onProgress }, [onProgress])

  const raycaster = React.useRef(new THREE.Raycaster())
  const pointer = React.useRef(new THREE.Vector2())
  const markerRef = React.useRef<THREE.Mesh | null>(null)
  const markerFade = React.useRef(0)

  /* ── Create the click marker once ─────────────────────────────────── */
  React.useEffect(() => {
    const ring = new THREE.RingGeometry(0.06, 0.1, 32)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff2222,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthTest: false,
    })
    const mesh = new THREE.Mesh(ring, mat)
    mesh.renderOrder = 9999
    mesh.visible = false
    rootScene.add(mesh)
    markerRef.current = mesh

    return () => {
      rootScene.remove(mesh)
      ring.dispose()
      mat.dispose()
    }
  }, [rootScene])

  /* ── Fade the marker out over time ─────────────────────────────── */
  useFrame((_, delta) => {
    if (markerRef.current && markerFade.current > 0) {
      markerFade.current = Math.max(0, markerFade.current - delta * 0.4)
      const mat = markerRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = markerFade.current
      if (markerFade.current <= 0) markerRef.current.visible = false
    }
  })

  /* ── Click-to-log: raycast against the model and log world position ── */
  React.useEffect(() => {
    const canvas = gl.domElement

    const handleClick = (e: MouseEvent) => {
      if (!model) return

      // Normalise mouse coords to [-1, 1]
      const rect = canvas.getBoundingClientRect()
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.current.setFromCamera(pointer.current, camera)
      const hits = raycaster.current.intersectObject(model, true)

      if (hits.length > 0) {
        const hit = hits[0]
        const p = hit.point
        const n = hit.face?.normal ?? new THREE.Vector3(0, 1, 0)
        const meshName = hit.object.name || "(unnamed mesh)"

        // Round to 2 decimal places for readability
        const x = Math.round(p.x * 100) / 100
        const y = Math.round(p.y * 100) / 100
        const z = Math.round(p.z * 100) / 100

        // Place red circle marker at hit point, oriented to surface
        if (markerRef.current) {
          markerRef.current.position.copy(p)
          // Offset slightly along normal so it sits on top of the surface
          const worldNormal = n.clone()
            .applyMatrix3(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld))
            .normalize()
          markerRef.current.position.addScaledVector(worldNormal, 0.005)
          markerRef.current.lookAt(
            p.x + worldNormal.x,
            p.y + worldNormal.y,
            p.z + worldNormal.z,
          )
          markerRef.current.visible = true
          markerFade.current = 1
          const mat = markerRef.current.material as THREE.MeshBasicMaterial
          mat.opacity = 1
        }

        console.log(
          `%c● Touchpoint position %c[${x}, ${y}, ${z}]%c  —  mesh: "${meshName}"`,
          "color: #b8860b; font-weight: bold",
          "color: #e8e0d0; background: #2a2420; padding: 2px 8px; border-radius: 4px; font-family: monospace",
          "color: #888",
        )
        console.log(`  position: [${x}, ${y}, ${z}],`)
      }
    }

    canvas.addEventListener("click", handleClick)
    return () => canvas.removeEventListener("click", handleClick)
  }, [model, camera, gl])

  /* ── Configure renderer for quality ──────────────────────────────── */
  React.useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.1
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFShadowMap
  }, [gl])

  /* ── Update lighting every frame based on timeOfDay ──────────────── */
  useFrame(() => {
    const p = interpolateLighting(timeOfDay)

    // Background
    rootScene.background = bgRef.current.setRGB(p.bg[0], p.bg[1], p.bg[2])

    // Ambient
    if (ambientRef.current) {
      ambientRef.current.color.setRGB(...p.ambient.color)
      ambientRef.current.intensity = p.ambient.intensity
    }

    // Sun
    if (sunRef.current) {
      sunRef.current.color.setRGB(...p.sun.color)
      sunRef.current.intensity = p.sun.intensity
      sunRef.current.position.set(...p.sun.position)
    }

    // Fill
    if (fillRef.current) {
      fillRef.current.color.setRGB(...p.fill.color)
      fillRef.current.intensity = p.fill.intensity
    }

    // Interior lamp — fades in from golden hour onward
    // 0 at t≤0.4, ramps to full by t=0.8
    if (lampRef.current) {
      const lampFade = Math.max(0, Math.min(1, (timeOfDay - 0.4) / 0.4))
      lampRef.current.intensity = lampFade * 2.5
    }
  })

  /* ── Load the GLB ────────────────────────────────────────────────── */
  React.useEffect(() => {
    let cancelled = false

    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/")
    dracoLoader.setDecoderConfig({ type: "js" })
    loader.setDRACOLoader(dracoLoader)

    loader.load(
      url,
      (gltf) => {
        if (cancelled) return

        const root = gltf.scene

        // ── Auto-centre and scale to fit ──
        const box = new THREE.Box3().setFromObject(root)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = maxDim > 0 ? 6 / maxDim : 1
        root.scale.setScalar(scale)

        // Recompute bounds after scaling
        box.setFromObject(root)
        box.getCenter(center)

        // Shift the model so its center sits exactly at the world origin
        root.position.sub(center)

        // Enhance materials + enable shadows
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.castShadow = true
            mesh.receiveShadow = true

            const mat = mesh.material as THREE.MeshStandardMaterial
            if (mat?.isMeshStandardMaterial) {
              mat.envMapIntensity = 0.8
              mat.needsUpdate = true
            }
          }
        })

        setModel(root)
        onLoadedRef.current()

        // Fit camera to the centered model
        const sphere = new THREE.Sphere()
        box.setFromObject(root)
        box.getBoundingSphere(sphere)

        // The model is now centered at origin; use its post-shift center
        // as the orbit target (should be ~0,0,0 but recompute for safety)
        const modelCenter = new THREE.Vector3()
        box.getCenter(modelCenter)

        const dist = sphere.radius * 2.5
        camera.position.set(
          modelCenter.x + dist * 0.7,
          modelCenter.y + dist * 0.5,
          modelCenter.z + dist * 0.7,
        )
        camera.lookAt(modelCenter)

        if (controlsRef.current) {
          controlsRef.current.target.copy(modelCenter)
          controlsRef.current.update()
        }
      },
      (event) => {
        if (cancelled) return
        if (event.lengthComputable) {
          onProgressRef.current(Math.round((event.loaded / event.total) * 100))
        }
      },
      (err) => {
        if (cancelled) return
        console.error("GLB load error:", err)
        onLoadedRef.current()
      },
    )

    return () => {
      cancelled = true
      dracoLoader.dispose()
    }
  // Only depend on `url` — callback refs keep us from re-loading
  // the model when unrelated props change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  /* ── Add / remove model from scene ──────────────────────────────── */
  React.useEffect(() => {
    if (model) {
      rootScene.add(model)
      return () => {
        rootScene.remove(model)
      }
    }
  }, [model, rootScene])

  // Derive env intensity from timeOfDay for the Environment component
  const envIntensity = interpolateLighting(timeOfDay).envIntensity

  return (
    <>
      {/* ── Lighting ─────────────────────────────────────────────── */}
      <ambientLight ref={ambientRef} />
      <directionalLight
        ref={sunRef}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />
      <directionalLight ref={fillRef} position={[-5, 6, -4]} />

      {/* Interior warm lamp — simulates room lights coming on at dusk */}
      <pointLight
        ref={lampRef}
        position={[0, 3, 0]}
        color="#ffcea0"
        intensity={0}
        distance={20}
        decay={2}
        castShadow={false}
      />

      {/* Subtle hemisphere light for natural sky/ground bounce */}
      <hemisphereLight
        args={["#f5efe4", "#3d2b1f", 0.15]}
      />

      {/* HDRI environment for reflections */}
      <Environment
        preset="apartment"
        background={false}
        environmentIntensity={envIntensity}
      />

      {/* ── Post-processing ──────────────────────────────────────── */}
      <EffectComposer multisampling={0}>
        <SMAA />
        <Bloom
          intensity={0.15}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.15} darkness={0.25} />
      </EffectComposer>

      {/* ── Orbit controls ───────────────────────────────────────── */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.5}
        panSpeed={0.5}
        zoomSpeed={0.8}
        minDistance={0.5}
        maxDistance={40}
        maxPolarAngle={Math.PI * 0.85}
        /* Touch: one finger = rotate, two fingers = pan, pinch = zoom */
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.PAN }}
        mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
      />

      {/* ── Touchpoints ──────────────────────────────────────────── */}
      {model &&
        touchpoints.map((tp) => (
          <Touchpoint
            key={tp.id}
            id={tp.id}
            label={tp.label}
            position={tp.position}
            active={activeTouchpoint === tp.id}
            onClick={() =>
              onTouchpoint(activeTouchpoint === tp.id ? null : tp.id)
            }
          />
        ))}
    </>
  )
}
