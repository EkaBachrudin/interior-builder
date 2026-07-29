import * as THREE from 'three'
import { FurniturePlacement } from '../constants'
import { clampPositionToRoom } from '../blueprint3d/core/utils'

export interface PlacementResult {
  success: boolean
  position: THREE.Vector3
  rotation: number
  valid: boolean
  reason?: string
  placedOnItemId?: string
}

export interface PlacementPreview {
  mesh: THREE.Mesh | null
  isValid: boolean
  position: THREE.Vector3
  rotation: number
}

export interface CollisionBox {
  box: THREE.Box3
  objectId: string
}

export class PlacementSystem {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private floorPlane: THREE.Plane
  private gridSize: number = 10 // Grid units in cm
  private snapToGrid: boolean = true
  
  private previewMesh: THREE.Mesh | null = null
  private previewMaterial: THREE.MeshBasicMaterial
  private currentModel: THREE.Group | null = null
  private currentPlacementType: FurniturePlacement = 'floor'
  private currentPlacedOnItemId: string | null = null
  private collisionBoxes: CollisionBox[] = []

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene
    this.camera = camera
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    
    // Create preview material (transparent green/red)
    this.previewMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    })
  }

  /**
   * Enable or disable grid snapping
   */
  public setSnapToGrid(enabled: boolean): void {
    this.snapToGrid = enabled
  }

  /**
   * Set grid size for snapping
   */
  public setGridSize(size: number): void {
    this.gridSize = size
  }

  /**
   * Start placement mode for a specific model
   */
  public startPlacement(model: THREE.Group, placementType: FurniturePlacement = 'floor'): void {
    this.currentModel = model
    this.currentPlacementType = placementType
    this.currentPlacedOnItemId = null
    
    // Create preview mesh from model bounding box
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    box.getSize(size)
    
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
    this.previewMesh = new THREE.Mesh(geometry, this.previewMaterial.clone())
    this.previewMesh.visible = false
    this.scene.add(this.previewMesh)
  }

  /**
   * Stop placement mode
   */
  public stopPlacement(): void {
    if (this.previewMesh) {
      this.scene.remove(this.previewMesh)
      this.previewMesh.geometry.dispose()
      
      const material = this.previewMesh.material
      if (Array.isArray(material)) {
        material.forEach(mat => mat.dispose())
      } else {
        material.dispose()
      }
      
      this.previewMesh = null
    }
    this.currentModel = null
  }

  /**
   * Update placement preview based on mouse position
   */
  public updatePlacement(mouseX: number, mouseY: number, roomWidth: number, roomHeight: number): PlacementPreview | null {
    if (!this.previewMesh || !this.currentModel) {
      return null
    }

    // Convert mouse coordinates to normalized device coordinates
    this.mouse.x = (mouseX / window.innerWidth) * 2 - 1
    this.mouse.y = -(mouseY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)

    let position: THREE.Vector3
    let placedOnItemId: string | null = null

    if (this.currentPlacementType === 'surface') {
      const surfaceResult = this.raycastFurnitureSurface()
      if (surfaceResult) {
        position = surfaceResult.position
        placedOnItemId = surfaceResult.objectId
      } else {
        // Fallback to floor
        const floorPoint = new THREE.Vector3()
        if (!this.raycaster.ray.intersectPlane(this.floorPlane, floorPoint)) {
          this.previewMesh.visible = false
          return null
        }
        position = floorPoint.clone()
      }
    } else {
      // Floor placement
      const floorPoint = new THREE.Vector3()
      if (!this.raycaster.ray.intersectPlane(this.floorPlane, floorPoint)) {
        this.previewMesh.visible = false
        return null
      }
      position = floorPoint.clone()
    }

    this.currentPlacedOnItemId = placedOnItemId
    
    // Snap to grid if enabled
    if (this.snapToGrid) {
      position.x = Math.round(position.x / this.gridSize) * this.gridSize
      position.z = Math.round(position.z / this.gridSize) * this.gridSize
    }

    // Constrain to room bounds (accounts for item size)
    const clampedPosition = clampPositionToRoom(position, this.currentModel, roomWidth, roomHeight)
    position.x = clampedPosition.x
    position.z = clampedPosition.z
    position.y = Math.max(position.y, 0)

    // Check collision with other objects (exclude supporting object for surface items)
    const isValid = this.isPositionValid(position, this.currentModel, placedOnItemId ? [placedOnItemId] : undefined)

    // Update preview mesh
    this.previewMesh.position.copy(position)
    this.previewMesh.visible = true
    this.previewMaterial.color.setHex(isValid ? 0x00ff00 : 0xff0000)
    this.previewMaterial.opacity = isValid ? 0.5 : 0.3

    return {
      mesh: this.previewMesh,
      isValid,
      position: position.clone(),
      rotation: 0 // Default rotation
    }
  }

  private raycastFurnitureSurface(): { position: THREE.Vector3, objectId: string } | null {
    const furnitureObjects: THREE.Object3D[] = []
    this.scene.traverse((object) => {
      if (object.userData.isFurniture) {
        furnitureObjects.push(object)
      }
    })

    if (furnitureObjects.length === 0) return null

    const intersects = this.raycaster.intersectObjects(furnitureObjects, true)
    if (intersects.length === 0) return null

    const hit = intersects[0]
    let furnitureRoot = hit.object
    while (furnitureRoot.parent && !furnitureRoot.userData.isFurniture) {
      furnitureRoot = furnitureRoot.parent
    }

    return {
      position: hit.point.clone(),
      objectId: furnitureRoot.userData.itemId || furnitureRoot.uuid
    }
  }

  /**
   * Place the current model at the last valid position
   */
  public placeModel(itemId: string): PlacementResult | null {
    if (!this.previewMesh || !this.currentModel || !this.previewMesh.visible) {
      return null
    }

    const position = this.previewMesh.position.clone()
    const rotation = this.previewMesh.rotation.y
    const placedOnItemId = this.currentPlacedOnItemId
    const isValid = this.isPositionValid(position, this.currentModel, placedOnItemId ? [placedOnItemId] : undefined)

    if (!isValid) {
      return {
        success: false,
        position,
        rotation: THREE.MathUtils.radToDeg(rotation),
        valid: false,
        reason: 'Collision detected with another object',
        placedOnItemId: placedOnItemId || undefined
      }
    }

    const placedModel = this.currentModel.clone(true)
    placedModel.position.copy(position)
    placedModel.rotation.y = rotation
    placedModel.userData.isFurniture = true
    placedModel.userData.itemId = itemId
    this.scene.add(placedModel)

    this.registerCollisionBox(itemId, placedModel)

    return {
      success: true,
      position,
      rotation: THREE.MathUtils.radToDeg(rotation),
      valid: true,
      placedOnItemId: placedOnItemId || undefined
    }
  }

  /**
   * Check collision between potential placement and existing objects
   */
  public isPositionValid(position: THREE.Vector3, model: THREE.Object3D, excludeObjectIds?: string[]): boolean {
    if (this.collisionBoxes.length === 0) {
      return true
    }

    const excludeSet = new Set(excludeObjectIds || [])

    // Create bounding box for potential placement
    const tempBox = new THREE.Box3().setFromObject(model)
    const offset = position.clone().sub(tempBox.getCenter(new THREE.Vector3()))
    tempBox.translate(offset)

    // Check collision with all existing objects
    for (const collisionBox of this.collisionBoxes) {
      if (excludeSet.has(collisionBox.objectId)) continue
      if (tempBox.intersectsBox(collisionBox.box)) {
        return false
      }
    }

    return true
  }

  /**
   * Register an object's collision box
   */
  public registerCollisionBox(objectId: string, object: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(object)
    
    // Remove existing collision box for this object
    this.collisionBoxes = this.collisionBoxes.filter(cb => cb.objectId !== objectId)
    
    // Add new collision box
    this.collisionBoxes.push({
      box,
      objectId
    })
  }

  /**
   * Remove an object's collision box
   */
  public unregisterCollisionBox(objectId: string): void {
    this.collisionBoxes = this.collisionBoxes.filter(cb => cb.objectId !== objectId)
  }

  /**
   * Update collision box for an existing object
   */
  public updateCollisionBox(objectId: string, object: THREE.Object3D): void {
    this.registerCollisionBox(objectId, object)
  }

  /**
   * Check if a specific position is valid for placement
   */
  public isValidPlacement(position: THREE.Vector3, model: THREE.Object3D): boolean {
    return this.isPositionValid(position, model)
  }

  /**
   * Get snap-to-grid position
   */
  public snapToGridPosition(position: THREE.Vector3): THREE.Vector3 {
    if (!this.snapToGrid) {
      return position.clone()
    }

    return new THREE.Vector3(
      Math.round(position.x / this.gridSize) * this.gridSize,
      position.y,
      Math.round(position.z / this.gridSize) * this.gridSize
    )
  }

  /**
   * Rotate the current preview model
   */
  public rotatePreview(degrees: number): void {
    if (this.previewMesh) {
      this.previewMesh.rotation.y += THREE.MathUtils.degToRad(degrees)
    }
  }

  /**
   * Set preview rotation
   */
  public setPreviewRotation(degrees: number): void {
    if (this.previewMesh) {
      this.previewMesh.rotation.y = THREE.MathUtils.degToRad(degrees)
    }
  }

  /**
   * Get current rotation of preview
   */
  public getPreviewRotation(): number {
    if (this.previewMesh) {
      return THREE.MathUtils.radToDeg(this.previewMesh.rotation.y)
    }
    return 0
  }

  /**
   * Clear all collision boxes
   */
  public clearCollisionBoxes(): void {
    this.collisionBoxes = []
  }

  /**
   * Get collision debug information
   */
  public getCollisionDebugInfo(): {
    totalCollisionBoxes: number
    collisionBoxPositions: THREE.Vector3[]
  } {
    return {
      totalCollisionBoxes: this.collisionBoxes.length,
      collisionBoxPositions: this.collisionBoxes.map(cb => 
        cb.box.getCenter(new THREE.Vector3())
      )
    }
  }

  /**
   * Dispose the placement system
   */
  public dispose(): void {
    this.stopPlacement()
    this.previewMaterial.dispose()
    this.clearCollisionBoxes()
  }
}