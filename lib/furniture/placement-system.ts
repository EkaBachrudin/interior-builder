import * as THREE from 'three'
import { Item, ItemCategory } from '../constants'

export interface PlacementResult {
  success: boolean
  position: THREE.Vector3
  rotation: number
  valid: boolean
  reason?: string
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
  public startPlacement(model: THREE.Group): void {
    this.currentModel = model
    
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

    // Raycast to find floor position
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = new THREE.Vector3()
    this.raycaster.ray.intersectPlane(this.floorPlane, intersects)

    if (!intersects) {
      this.previewMesh.visible = false
      return null
    }

    // Check if position is within room bounds
    const halfWidth = (roomWidth * 100) / 2
    const halfHeight = (roomHeight * 100) / 2

    let position = intersects.clone()
    
    // Snap to grid if enabled
    if (this.snapToGrid) {
      position.x = Math.round(position.x / this.gridSize) * this.gridSize
      position.z = Math.round(position.z / this.gridSize) * this.gridSize
    }

    // Constrain to room bounds
    position.x = Math.max(-halfWidth, Math.min(halfWidth, position.x))
    position.z = Math.max(-halfHeight, Math.min(halfHeight, position.z))
    position.y = 0 // Always place on floor

    // Check collision with other objects
    const isValid = this.checkCollision(position, this.currentModel)

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

  /**
   * Place the current model at the last valid position
   */
  public placeModel(itemId: string): PlacementResult | null {
    if (!this.previewMesh || !this.currentModel || !this.previewMesh.visible) {
      return null
    }

    const position = this.previewMesh.position.clone()
    const rotation = this.previewMesh.rotation.y
    const isValid = this.checkCollision(position, this.currentModel)

    if (!isValid) {
      return {
        success: false,
        position,
        rotation: THREE.MathUtils.radToDeg(rotation),
        valid: false,
        reason: 'Collision detected with another object'
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
      valid: true
    }
  }

  /**
   * Check collision between potential placement and existing objects
   */
  private checkCollision(position: THREE.Vector3, model: THREE.Group): boolean {
    if (this.collisionBoxes.length === 0) {
      return true
    }

    // Create bounding box for potential placement
    const tempBox = new THREE.Box3().setFromObject(model)
    const offset = position.clone().sub(tempBox.getCenter(new THREE.Vector3()))
    tempBox.translate(offset)

    // Check collision with all existing objects
    for (const collisionBox of this.collisionBoxes) {
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
  public isValidPlacement(position: THREE.Vector3, model: THREE.Group): boolean {
    return this.checkCollision(position, model)
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