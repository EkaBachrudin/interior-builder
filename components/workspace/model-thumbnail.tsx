'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const thumbnailCache = new Map<string, string>()

interface ModelThumbnailProps {
  modelUrl: string
  name: string
}

export function ModelThumbnail({ modelUrl, name }: ModelThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cached = thumbnailCache.get(modelUrl)
    if (cached) {
      setSrc(cached)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const size = 200
    canvas.width = size
    canvas.height = size

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setSize(size, size)
    renderer.setPixelRatio(1)
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000)
    camera.position.set(3, 2.5, 4)
    camera.lookAt(0, 0.5, 0)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
    fillLight.position.set(-3, 4, -2)
    scene.add(fillLight)

    const loader = new GLTFLoader()

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene

        const box = new THREE.Box3().setFromObject(model)
        const center = new THREE.Vector3()
        box.getCenter(center)
        const size = new THREE.Vector3()
        box.getSize(size)

        model.position.sub(center)

        const maxDim = Math.max(size.x, size.y, size.z)
        const targetScale = 2.2 / maxDim
        model.scale.set(targetScale, targetScale, targetScale)

        scene.add(model)

        renderer.render(scene, camera)

        const dataUrl = canvas.toDataURL('image/png')
        thumbnailCache.set(modelUrl, dataUrl)
        setSrc(dataUrl)

        scene.remove(model)
        renderer.dispose()
      },
      undefined,
      () => {
        setError(true)
        renderer.dispose()
      }
    )

    return () => {
      renderer.dispose()
    }
  }, [modelUrl])

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-full h-full object-contain"
      />
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white text-[var(--muted)] text-xs text-center p-2">
        {name}
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white text-[var(--muted)] text-xs text-center p-2">
      <canvas ref={canvasRef} className="hidden" />
      <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--accent-blue-text)] rounded-full animate-spin mb-1" />
      <span>Loading...</span>
    </div>
  )
}
