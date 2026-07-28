import * as THREE from 'three'

export interface WallInfo {
  index: number
  position: THREE.Vector3
  normal: THREE.Vector3
  width: number
  height: number
}

export interface DoorWindowPlacement {
  success: boolean
  position: THREE.Vector3
  rotation: number
  wallIndex: number
}

export interface WallOpening {
  mesh: THREE.Mesh
  wallIndex: number
  itemId: string
}

export class DoorWindowSystem {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private walls: Map<number, WallInfo> = new Map()
  private openings: Map<string, WallOpening> = new Map()
  private floorPlane: THREE.Plane
  private gridSize: number = 10

  private previewMesh: THREE.Group | null = null
  private ghostMaterial: THREE.MeshBasicMaterial

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene
    this.camera = camera
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

    this.ghostMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    })
  }

  public registerWalls(roomWidth: number, roomHeight: number, wallHeight: number): void {
    this.walls.clear()

    const width = roomWidth * 100
    const height = roomHeight * 100

    const wallConfigs: WallInfo[] = [
      {
        index: 0,
        position: new THREE.Vector3(0, wallHeight / 2, -height / 2),
        normal: new THREE.Vector3(0, 0, -1),
        width,
        height
      },
      {
        index: 1,
        position: new THREE.Vector3(0, wallHeight / 2, height / 2),
        normal: new THREE.Vector3(0, 0, 1),
        width,
        height
      },
      {
        index: 2,
        position: new THREE.Vector3(-width / 2, wallHeight / 2, 0),
        normal: new THREE.Vector3(1, 0, 0),
        width: height,
        height
      },
      {
        index: 3,
        position: new THREE.Vector3(width / 2, wallHeight / 2, 0),
        normal: new THREE.Vector3(-1, 0, 0),
        width: height,
        height
      }
    ]

    wallConfigs.forEach(wall => {
      this.walls.set(wall.index, wall)
    })
  }

  public findNearestWall(mouseX: number, mouseY: number): WallInfo | null {
    this.mouse.x = (mouseX / window.innerWidth) * 2 - 1
    this.mouse.y = -(mouseY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)

    let bestWall: WallInfo | null = null
    let bestDist = Infinity

    this.walls.forEach(wall => {
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        wall.normal, wall.position
      )
      const intersects = new THREE.Vector3()
      const didHit = this.raycaster.ray.intersectPlane(plane, intersects)

      if (didHit) {
        const halfW = wall.width / 2
        const halfH = wall.height / 2

        const localPoint = intersects.clone().sub(wall.position)
        const wallRight = new THREE.Vector3()
        const wallUp = new THREE.Vector3(0, 1, 0)
        wallRight.crossVectors(wallUp, wall.normal).normalize()

        const dotRight = localPoint.dot(wallRight)
        const dotUp = localPoint.dot(wallUp)

        if (Math.abs(dotRight) <= halfW && Math.abs(dotUp) <= halfH) {
          const dist = this.camera.position.distanceTo(intersects)
          if (dist < bestDist) {
            bestDist = dist
            bestWall = wall
          }
        }
      }
    })

    return bestWall
  }

  public getSnapPosition(mouseX: number, mouseY: number): DoorWindowPlacement | null {
    const nearestWall = this.findNearestWall(mouseX, mouseY)
    if (!nearestWall) return null

    this.mouse.x = (mouseX / window.innerWidth) * 2 - 1
    this.mouse.y = -(mouseY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)

    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      nearestWall.normal, nearestWall.position
    )
    const intersects = new THREE.Vector3()
    this.raycaster.ray.intersectPlane(plane, intersects)

    const wallRight = new THREE.Vector3()
    const wallUp = new THREE.Vector3(0, 1, 0)
    wallRight.crossVectors(wallUp, nearestWall.normal).normalize()

    const localPoint = intersects.clone().sub(nearestWall.position)
    const dotRight = localPoint.dot(wallRight)

    const clampedRight = Math.max(-nearestWall.width / 2 + 25, Math.min(nearestWall.width / 2 - 25, dotRight))
    const snappedRight = Math.round(clampedRight / this.gridSize) * this.gridSize

    const snappedPosition = nearestWall.position.clone().add(
      wallRight.clone().multiplyScalar(snappedRight)
    )

    snappedPosition.y = 0

    const angle = Math.atan2(wallRight.x, wallRight.z)
    const rotation = angle

    return {
      success: true,
      position: snappedPosition,
      rotation,
      wallIndex: nearestWall.index
    }
  }

  public startPlacement(model: THREE.Group, mouseX: number, mouseY: number): void {
    this.stopPlacementPreview()

    const clone = model.clone(true)
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
            mat.transparent = true
            mat.opacity = 0.5
            mat.depthWrite = false
          }
        })
      }
    })

    const snap = this.getSnapPosition(mouseX, mouseY)
    if (snap) {
      clone.position.copy(snap.position)
      clone.rotation.y = snap.rotation
    }

    clone.userData.isDoorWindowPreview = true
    this.scene.add(clone)
    this.previewMesh = clone
  }

  public updatePlacement(mouseX: number, mouseY: number): DoorWindowPlacement | null {
    if (!this.previewMesh) return null

    const snap = this.getSnapPosition(mouseX, mouseY)
    if (!snap) {
      this.previewMesh.visible = false
      return null
    }

    this.previewMesh.position.copy(snap.position)
    this.previewMesh.rotation.y = snap.rotation
    this.previewMesh.visible = true

    return snap
  }

  public stopPlacementPreview(): void {
    if (this.previewMesh) {
      this.previewMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach(mat => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
              mat.dispose()
            }
          })
        }
      })
      this.scene.remove(this.previewMesh)
      this.previewMesh = null
    }
  }

  public placeItem(model: THREE.Group, mouseX: number, mouseY: number, itemId: string): DoorWindowPlacement | null {
    const snap = this.getSnapPosition(mouseX, mouseY)
    if (!snap) return null

    const placedModel = model.clone(true)
    placedModel.position.copy(snap.position)
    placedModel.rotation.y = snap.rotation
    placedModel.userData.isFurniture = true
    placedModel.userData.isDoorWindow = true
    placedModel.userData.itemId = itemId
    placedModel.userData.wallIndex = snap.wallIndex
    this.scene.add(placedModel)

    this.createWallOpening(snap.position, snap.rotation, snap.wallIndex, itemId)

    return snap
  }

  private createWallOpening(
    position: THREE.Vector3,
    rotation: number,
    wallIndex: number,
    itemId: string
  ): void {
    const wall = this.walls.get(wallIndex)
    if (!wall) return

    const geometry = new THREE.PlaneGeometry(90, 220)
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      side: THREE.DoubleSide,
      roughness: 0.9,
      depthWrite: false
    })

    const opening = new THREE.Mesh(geometry, material)
    opening.position.copy(position)
    opening.position.y = 110

    const wallNormal = wall.normal.clone()
    const offset = wallNormal.clone().multiplyScalar(0.5)
    opening.position.add(offset)

    opening.rotation.y = rotation

    this.scene.add(opening)

    if (this.openings.has(itemId)) {
      this.removeWallOpening(itemId)
    }

    this.openings.set(itemId, { mesh: opening, wallIndex, itemId })
  }

  public removeWallOpening(itemId: string): void {
    const opening = this.openings.get(itemId)
    if (opening) {
      this.scene.remove(opening.mesh)
      opening.mesh.geometry.dispose()
      if (opening.mesh.material instanceof THREE.Material) {
        opening.mesh.material.dispose()
      }
      this.openings.delete(itemId)
    }
  }

  public createOpeningForItem(
    position: THREE.Vector3,
    rotation: number,
    itemId: string
  ): void {
    this.removeWallOpening(itemId)

    if (this.walls.size === 0) return

    let bestWallIndex = 0
    let bestDist = Infinity
    const pos2D = new THREE.Vector2(position.x, position.z)

    this.walls.forEach((wall) => {
      const wallCenter = new THREE.Vector2(wall.position.x, wall.position.z)
      const dist = pos2D.distanceTo(wallCenter)
      if (dist < bestDist) {
        bestDist = dist
        bestWallIndex = wall.index
      }
    })

    this.createWallOpening(position, rotation, bestWallIndex, itemId)
  }

  public setGridSize(size: number): void {
    this.gridSize = size
  }

  public dispose(): void {
    this.stopPlacementPreview()
    this.openings.forEach((opening, itemId) => {
      this.removeWallOpening(itemId)
    })
    this.walls.clear()
    this.ghostMaterial.dispose()
  }
}
