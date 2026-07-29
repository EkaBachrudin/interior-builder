import * as THREE from 'three'

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

export function createBoundingBox(object: THREE.Object3D): THREE.Box3 {
  const box = new THREE.Box3()
  box.setFromObject(object)
  return box
}

export function getObjectSize(object: THREE.Object3D): THREE.Vector3 {
  const box = createBoundingBox(object)
  const size = new THREE.Vector3()
  box.getSize(size)
  return size
}

export function isObjectIntersecting(
  object1: THREE.Object3D,
  object2: THREE.Object3D
): boolean {
  const box1 = createBoundingBox(object1)
  const box2 = createBoundingBox(object2)
  return box1.intersectsBox(box2)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function clampPositionToRoom(
  position: THREE.Vector3,
  object: THREE.Object3D,
  roomWidth: number,
  roomHeight: number
): THREE.Vector3 {
  const box = new THREE.Box3().setFromObject(object)
  const size = new THREE.Vector3()
  box.getSize(size)

  const halfRoomW = (roomWidth * 100) / 2
  const halfRoomH = (roomHeight * 100) / 2
  const halfItemW = size.x / 2
  const halfItemD = size.z / 2

  const minX = -halfRoomW + halfItemW
  const maxX = halfRoomW - halfItemW
  const minZ = -halfRoomH + halfItemD
  const maxZ = halfRoomH - halfItemD

  const clamped = position.clone()
  if (minX < maxX) {
    clamped.x = clamp(position.x, minX, maxX)
  } else {
    clamped.x = 0
  }
  if (minZ < maxZ) {
    clamped.z = clamp(position.z, minZ, maxZ)
  } else {
    clamped.z = 0
  }

  return clamped
}

export function snapPositionToGrid(
  position: THREE.Vector3,
  gridSize: number
): THREE.Vector3 {
  const snapped = position.clone()
  snapped.x = Math.round(snapped.x / gridSize) * gridSize
  snapped.z = Math.round(snapped.z / gridSize) * gridSize
  return snapped
}

export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t
}

export function distance2D(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function disposeObject(object: THREE.Object3D): void {
  if (object instanceof THREE.Mesh) {
    if (object.geometry) {
      object.geometry.dispose()
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose())
      } else {
        object.material.dispose()
      }
    }
  }
  
  object.children.forEach(child => disposeObject(child))
}

export function disposeMaterial(material: THREE.Material): void {
  if (Array.isArray(material)) {
    material.forEach(m => m.dispose())
  } else {
    material.dispose()
  }
}

export function disposeGeometry(geometry: THREE.BufferGeometry): void {
  geometry.dispose()
}