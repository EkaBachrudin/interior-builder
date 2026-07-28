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