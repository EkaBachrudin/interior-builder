# 🏗️ Panduan Komprehensif Membuat 3D Scene dengan Kontrol POV di Next.js/React.js

## 📋 Table of Contents
- [Dependencies](#-dependencies-yang-diperlukan)
- [Arsitektur](#-arsitektur-blueprint)
- [Langkah-Langkah Implementasi](#-langkah-langkah-implementasi)
- [Best Practices](#-best-practices)
- [Advanced Features](#-advanced-features)

---

## 📦 Dependencies yang Diperlukan

### Core 3D Libraries
```bash
npm install three @types/three
# atau
yarn add three @types/three
```

### Untuk React Integration (Opsional tapi disarankan)
```bash
npm install @react-three/fiber @react-three/drei
# atau
yarn add @react-three/fiber @react-three/drei
```

### Utilities Tambahan
```bash
npm install animejs uuid
# atau
yarn add animejs uuid
```

---

## 🏗️ Arsitektur Blueprint

```
your-project/
├── lib/
│   ├── blueprint3d/
│   │   ├── core/
│   │   │   ├── events.ts       # Event system
│   │   │   ├── utils.ts        # Helper functions
│   │   │   └── configuration.ts # App configuration
│   │   ├── model/
│   │   │   ├── room.ts         # Room data structure
│   │   │   ├── wall.ts         # Wall data structure
│   │   │   ├── corner.ts       # Corner/vertex
│   │   │   └── model.ts        # Main model class
│   │   ├── three/
│   │   │   ├── main.ts         # Main scene orchestration
│   │   │   ├── controls.ts     # Camera controls (OrbitControls custom)
│   │   │   ├── controller.ts   # Object interaction controller
│   │   │   ├── floor.ts        # Floor rendering
│   │   │   ├── edge.ts         # Wall rendering
│   │   │   ├── lights.ts       # Lighting setup
│   │   │   └── skybox.ts       # Background
│   │   ├── items/
│   │   │   ├── item.ts         # Base item class
│   │   │   └── factory.ts      # Item factory
│   │   ├── loaders/
│   │   │   ├── GLBLoader.ts    # 3D model loader
│   │   │   └── JSONLoader.ts   # Legacy loader
│   │   └── index.ts            # Export Blueprint3d class
│   └── 3d-models/              # Host your .glb files
└── components/
    └── workspace/
        ├── scene.tsx           # React component wrapper
        └── types.ts            # TypeScript types
```

---

## 📝 Langkah-Langkah Implementasi

### STEP 1: Setup Basic Three.js Scene

```typescript
// lib/blueprint3d/three/main.ts
import * as THREE from 'three'

export class Scene3D {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container

    // Scene setup
    this.scene = new THREE.Scene()

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      45,  // FOV
      container.clientWidth / container.clientHeight,  // Aspect ratio
      1,    // Near plane
      10000 // Far plane
    )

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.shadowMap.enabled = true

    container.appendChild(this.renderer.domElement)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  getScene() {
    return this.scene
  }

  getCamera() {
    return this.camera
  }
}
```

### STEP 2: Implement Camera Controls

```typescript
// lib/blueprint3d/three/controls.ts
import * as THREE from 'three'

export class CameraControls {
  public enabled = true
  public rotateSpeed = 0.5
  public zoomSpeed = 1.0
  public minDistance = 0
  public maxDistance = 1500

  private camera: THREE.PerspectiveCamera
  private target: THREE.Vector3
  private isDragging = false
  private previousMousePosition = { x: 0, y: 0 }

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera
    this.target = new THREE.Vector3(0, 0, 0)

    this.setupEventListeners(domElement)
  }

  private setupEventListeners(domElement: HTMLElement) {
    domElement.addEventListener('mousedown', this.onMouseDown.bind(this))
    domElement.addEventListener('mousemove', this.onMouseMove.bind(this))
    domElement.addEventListener('mouseup', this.onMouseUp.bind(this))
    domElement.addEventListener('wheel', this.onWheel.bind(this))
  }

  private onMouseDown(event: MouseEvent) {
    if (!this.enabled) return
    this.isDragging = true
    this.previousMousePosition = { x: event.clientX, y: event.clientY }
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isDragging || !this.enabled) return

    const deltaX = event.clientX - this.previousMousePosition.x
    const deltaY = event.clientY - this.previousMousePosition.y

    // Rotate camera around target
    this.rotate(deltaX, deltaY)

    this.previousMousePosition = { x: event.clientX, y: event.clientY }
  }

  private onMouseUp() {
    this.isDragging = false
  }

  private onWheel(event: WheelEvent) {
    if (!this.enabled) return
    event.preventDefault()

    const zoomSpeed = this.zoomSpeed * 0.001
    const direction = event.deltaY > 0 ? 1 : -1

    this.zoom(direction * zoomSpeed)
  }

  private rotate(deltaX: number, deltaY: number) {
    // Implement rotation logic using spherical coordinates
    const sensitivity = this.rotateSpeed * 0.01

    // Get current camera position relative to target
    const offset = this.camera.position.clone().sub(this.target)

    // Convert to spherical coordinates
    const radius = offset.length()
    let theta = Math.atan2(offset.x, offset.z)
    let phi = Math.acos(offset.y / radius)

    // Update angles
    theta -= deltaX * sensitivity
    phi += deltaY * sensitivity

    // Clamp phi to prevent flipping
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi))

    // Convert back to Cartesian
    offset.x = radius * Math.sin(phi) * Math.sin(theta)
    offset.y = radius * Math.cos(phi)
    offset.z = radius * Math.sin(phi) * Math.cos(theta)

    // Update camera position
    this.camera.position.copy(this.target).add(offset)
    this.camera.lookAt(this.target)
  }

  private zoom(delta: number) {
    const direction = this.camera.position.clone().sub(this.target)
    const newDistance = direction.length() * (1 + delta)

    // Clamp zoom
    const clampedDistance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, newDistance)
    )

    direction.normalize().multiplyScalar(clampedDistance)
    this.camera.position.copy(this.target).add(direction)
  }

  update() {
    this.camera.lookAt(this.target)
  }
}
```

### STEP 3: Create Procedural Room

```typescript
// lib/blueprint3d/model/room.ts
import * as THREE from 'three'

export interface RoomConfig {
  width: number   // in meters
  height: number  // in meters
  wallHeight: number // in cm (default: 250)
  wallThickness: number // in cm (default: 10)
}

export class ProceduralRoom {
  private scene: THREE.Scene
  private config: RoomConfig

  constructor(scene: THREE.Scene, config: RoomConfig) {
    this.scene = scene
    this.config = config
    this.buildRoom()
  }

  private buildRoom() {
    this.createFloor()
    this.createWalls()
  }

  private createFloor() {
    // Convert to cm for Three.js
    const width = this.config.width * 100
    const height = this.config.height * 100

    // Create floor geometry
    const geometry = new THREE.PlaneGeometry(width, height)
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    })

    const floor = new THREE.Mesh(geometry, material)
    floor.rotation.x = -Math.PI / 2 // Lay flat
    floor.receiveShadow = true

    this.scene.add(floor)
  }

  private createWalls() {
    const width = this.config.width * 100
    const height = this.config.height * 100
    const wallH = this.config.wallHeight
    const wallT = this.config.wallThickness

    // Wall positions (4 walls)
    const wallConfigs = [
      { pos: [0, wallH/2, -height/2], rot: [0, 0, 0], size: [width, wallH] },     // Back
      { pos: [0, wallH/2, height/2], rot: [0, Math.PI, 0], size: [width, wallH] },   // Front
      { pos: [-width/2, wallH/2, 0], rot: [0, Math.PI/2, 0], size: [height, wallH] }, // Left
      { pos: [width/2, wallH/2, 0], rot: [0, -Math.PI/2, 0], size: [height, wallH] }  // Right
    ]

    wallConfigs.forEach(config => {
      const geometry = new THREE.PlaneGeometry(config.size[0], config.size[1])
      const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
      })

      const wall = new THREE.Mesh(geometry, material)
      wall.position.set(...config.pos)
      wall.rotation.set(...config.rot)
      wall.castShadow = true
      wall.receiveShadow = true

      this.scene.add(wall)
    })
  }
}
```

### STEP 4: Setup Lighting

```typescript
// lib/blueprint3d/three/lights.ts
import * as THREE from 'three'

export class Lighting {
  constructor(scene: THREE.Scene) {
    this.setupAmbientLight(scene)
    this.setupDirectionalLight(scene)
    this.setupPointLights(scene)
  }

  private setupAmbientLight(scene: THREE.Scene) {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
  }

  private setupDirectionalLight(scene: THREE.Scene) {
    const directional = new THREE.DirectionalLight(0xffffff, 0.8)
    directional.position.set(200, 300, 200)
    directional.castShadow = true
    directional.shadow.mapSize.width = 2048
    directional.shadow.mapSize.height = 2048
    scene.add(directional)
  }

  private setupPointLights(scene: THREE.Scene) {
    // Add warm fill light
    const pointLight1 = new THREE.PointLight(0xfff5e6, 0.3, 1000)
    pointLight1.position.set(-100, 200, -100)
    scene.add(pointLight1)

    // Add cool fill light
    const pointLight2 = new THREE.PointLight(0xe6f5ff, 0.2, 1000)
    pointLight2.position.set(100, 150, 100)
    scene.add(pointLight2)
  }
}
```

### STEP 5: React Component Wrapper

```typescript
// components/workspace/scene.tsx
'use client'

import { useEffect, useRef } from 'react'
import { Scene3D } from '@/lib/blueprint3d/three/main'
import { CameraControls } from '@/lib/blueprint3d/three/controls'
import { ProceduralRoom, RoomConfig } from '@/lib/blueprint3d/model/room'
import { Lighting } from '@/lib/blueprint3d/three/lights'

interface Scene3DProps {
  roomConfig: RoomConfig
  onObjectSelect?: (objectId: string | null) => void
}

export function Scene3DComponent({ roomConfig, onObjectSelect }: Scene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene3D | null>(null)
  const controlsRef = useRef<CameraControls | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Three.js scene
    const scene3D = new Scene3D(containerRef.current)
    sceneRef.current = scene3D

    // Setup lighting
    new Lighting(scene3D.getScene())

    // Create procedural room
    new ProceduralRoom(scene3D.getScene(), roomConfig)

    // Setup camera controls
    const controls = new CameraControls(scene3D.getCamera(), containerRef.current)
    controlsRef.current = controls

    // Position camera
    scene3D.getCamera().position.set(300, 400, 300)
    controls.update()

    // Animation loop
    let animationId: number
    function animate() {
      animationId = requestAnimationFrame(animate)
      scene3D.render()
    }
    animate()

    // Handle resize
    const handleResize = () => {
      scene3D.resize()
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [roomConfig])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '500px' }}
    />
  )
}
```

### STEP 6: Usage in Next.js Page

```typescript
// app/workspace/page.tsx
'use client'

import { useState } from 'react'
import { Scene3DComponent } from '@/components/workspace/scene'
import type { RoomConfig } from '@/lib/blueprint3d/model/room'

export default function WorkspacePage() {
  const [room, setRoom] = useState<RoomConfig>({
    width: 4,
    height: 4,
    wallHeight: 250,
    wallThickness: 10
  })

  return (
    <main className="min-h-screen bg-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">3D Workspace</h1>

        {/* Room Configuration */}
        <div className="mb-4 space-y-2">
          <label>
            Width (m):
            <input
              type="number"
              value={room.width}
              onChange={(e) => setRoom({...room, width: Number(e.target.value)})}
              className="ml-2 border rounded px-2"
            />
          </label>

          <label className="ml-4">
            Height (m):
            <input
              type="number"
              value={room.height}
              onChange={(e) => setRoom({...room, height: Number(e.target.value)})}
              className="ml-2 border rounded px-2"
            />
          </label>
        </div>

        {/* 3D Scene */}
        <div className="border rounded-lg overflow-hidden bg-gray-900">
          <Scene3DComponent
            roomConfig={room}
            onObjectSelect={(id) => console.log('Selected:', id)}
          />
        </div>
      </div>
    </main>
  )
}
```

---

## 🎯 Best Practices

1. **Use TypeScript** untuk type safety
2. **Implement proper cleanup** di useEffect untuk memory leaks
3. **Use dynamic imports** untuk Three.js components (SSR issues)
4. **Add loading states** untuk 3D model loading
5. **Implement error boundaries** untuk 3D errors
6. **Optimize performance** dengan instancing untuk banyak objek
7. **Use requestAnimationFrame** untuk smooth animations
8. **Handle window resize** properly
9. **Add accessibility features** (keyboard controls, screen reader support)
10. **Implement proper shadows** untuk realistic rendering

---

## 🚀 Advanced Features

- **Object interaction** (drag, drop, rotate)
- **Texture mapping** untuk realistic materials
- **Physics simulation** (optional: cannon.js)
- **Multiplayer support** (optional: websockets)
- **Save/load functionality** dengan JSON serialization
- **Export ke images/videos**
- **VR/AR support** (optional: WebXR)

---

## 📚 Resources Tambahan

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Catatan:** File ini berisi panduan lengkap untuk membuat 3D scene dengan kontrol POV di Next.js/React.js.