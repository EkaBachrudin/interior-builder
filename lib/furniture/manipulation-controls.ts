import * as THREE from 'three'

export type TransformMode = 'translate' | 'rotate' | 'scale'

export interface ManipulationState {
  isManipulating: boolean
  currentMode: TransformMode
  selectedObject: THREE.Object3D | null
  startPosition: THREE.Vector3
  startRotation: number
  startScale: THREE.Vector3
}

export class ManipulationControls {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private domElement: HTMLElement
  
  private state: ManipulationState
  private onSelectCallback: ((object: THREE.Object3D | null) => void) | null = null
  private onTransformCallback: ((object: THREE.Object3D) => void) | null = null
  private onDragStartCallback: (() => void) | null = null
  private onDragEndCallback: (() => void) | null = null
  
  private onBoundsConstraint: ((position: THREE.Vector3, object: THREE.Object3D) => THREE.Vector3) | null = null
  private onCollisionCheck: ((position: THREE.Vector3, object: THREE.Object3D) => boolean) | null = null
  private snapEnabled: boolean = false
  private gridSize: number = 10
  
  // Selection highlighting
  private selectionBox: any = null
  private originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]> = new Map()
  
  // Manual manipulation state
  private isDragging = false
  private dragStartMouse = new THREE.Vector2()
  private dragStartPosition = new THREE.Vector3()
  private plane: THREE.Plane = new THREE.Plane()
  private intersectionPoint = new THREE.Vector3()

  constructor(
    scene: THREE.Scene, 
    camera: THREE.PerspectiveCamera, 
    renderer: THREE.WebGLRenderer,
    domElement: HTMLElement
  ) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.domElement = domElement
    
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    
    // Initialize manipulation state
    this.state = {
      isManipulating: false,
      currentMode: 'translate',
      selectedObject: null,
      startPosition: new THREE.Vector3(),
      startRotation: 0,
      startScale: new THREE.Vector3(1, 1, 1)
    }

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    this.renderer.domElement.style.touchAction = 'none'
    this.domElement.style.touchAction = 'none'

    this.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this))
    this.domElement.addEventListener('pointermove', this.onPointerMove.bind(this))
    this.domElement.addEventListener('pointerup', this.onPointerUp.bind(this))
    window.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  private onPointerDown(event: PointerEvent): void {
    if (this.state.isManipulating || event.button !== 0) return
    event.preventDefault()

    // Calculate mouse position
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Raycast for object selection
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    // Get all furniture objects
    const furnitureObjects: THREE.Object3D[] = []
    this.scene.traverse((object) => {
      if (object.userData.isFurniture) {
        furnitureObjects.push(object)
      }
    })

    const intersects = this.raycaster.intersectObjects(furnitureObjects, true)
    
    if (intersects.length > 0) {
      let selectedObject = intersects[0].object
      while (selectedObject.parent && !selectedObject.userData.isFurniture) {
        selectedObject = selectedObject.parent
      }
      
      if (selectedObject.userData.isFurniture) {
        this.selectObject(selectedObject)
        
        // Start dragging for translation
        if (this.state.currentMode === 'translate') {
          this.isDragging = true
          this.state.isManipulating = true
          this.dragStartMouse.set(event.clientX, event.clientY)
          this.dragStartPosition.copy(selectedObject.position)
          
          this.plane.setFromNormalAndCoplanarPoint(
            new THREE.Vector3(0, 1, 0),
            selectedObject.position
          )

          if (this.onDragStartCallback) {
            this.onDragStartCallback()
          }
        }
      }
    } else {
      this.deselectObject()
    }
  }

  private onPointerMove(event: PointerEvent): void {
    if (!this.isDragging || !this.state.selectedObject || this.state.currentMode !== 'translate') return
    event.preventDefault()

    // Calculate mouse position
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Raycast against the drag plane
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    if (this.raycaster.ray.intersectPlane(this.plane, this.intersectionPoint)) {
      let targetPosition = this.intersectionPoint.clone()

      if (this.onBoundsConstraint && this.state.selectedObject) {
        targetPosition = this.onBoundsConstraint(targetPosition, this.state.selectedObject)
      }

      if (this.snapEnabled) {
        targetPosition.x = Math.round(targetPosition.x / this.gridSize) * this.gridSize
        targetPosition.z = Math.round(targetPosition.z / this.gridSize) * this.gridSize
      }

      if (this.onCollisionCheck && this.state.selectedObject) {
        if (!this.onCollisionCheck(targetPosition, this.state.selectedObject)) {
          return
        }
      }

      this.state.selectedObject.position.copy(targetPosition)
      
      if (this.onTransformCallback) {
        this.onTransformCallback(this.state.selectedObject)
      }
    }
  }

  private onPointerUp(): void {
    if (this.isDragging) {
      this.isDragging = false
      this.state.isManipulating = false

      if (this.onDragEndCallback) {
        this.onDragEndCallback()
      }
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.state.selectedObject) return

    switch (event.key.toLowerCase()) {
      case 'g':
        this.setMode('translate')
        break
      case 'r':
        this.setMode('rotate')
        break
      case 's':
        this.setMode('scale')
        break
      case 'delete':
      case 'backspace':
        this.deleteSelected()
        break
      case 'escape':
        this.deselectObject()
        break
      case '[':
        this.rotateSelection(-15)
        break
      case ']':
        this.rotateSelection(15)
        break
      case '+':
      case '=':
        this.scaleSelection(1.1)
        break
      case '-':
      case '_':
        this.scaleSelection(0.9)
        break
    }
  }

  /**
   * Select an object for manipulation
   */
  public selectObject(object: THREE.Object3D): void {
    if (this.state.selectedObject) {
      this.deselectObject()
    }

    this.state.selectedObject = object
    this.state.startPosition.copy(object.position)
    this.state.startRotation = object.rotation.y
    this.state.startScale.copy(object.scale)

    this.addSelectionHighlight(object)

    if (this.onSelectCallback) {
      this.onSelectCallback(object)
    }
  }

  /**
   * Deselect current object
   */
  public deselectObject(): void {
    if (this.state.selectedObject) {
      this.removeSelectionHighlight(this.state.selectedObject)
    }
    
    const wasDragging = this.isDragging
    this.isDragging = false
    this.state.selectedObject = null
    this.state.isManipulating = false
    
    if (wasDragging && this.onDragEndCallback) {
      this.onDragEndCallback()
    }

    if (this.onSelectCallback) {
      this.onSelectCallback(null)
    }
  }

  /**
   * Set transformation mode
   */
  public setMode(mode: TransformMode): void {
    this.state.currentMode = mode
  }

  /**
   * Get current transformation mode
   */
  public getMode(): TransformMode {
    return this.state.currentMode
  }

  /**
   * Delete the selected object
   */
  public deleteSelected(): void {
    if (!this.state.selectedObject) return

    const object = this.state.selectedObject
    this.scene.remove(object)
    
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose())
          } else {
            child.material.dispose()
          }
        }
      }
    })

    this.deselectObject()
  }

  /**
   * Rotate selected object by specified degrees
   */
  public rotateSelection(degrees: number): void {
    if (!this.state.selectedObject) return
    
    this.state.selectedObject.rotation.y += THREE.MathUtils.degToRad(degrees)
    
    if (this.onTransformCallback) {
      this.onTransformCallback(this.state.selectedObject)
    }
  }

  /**
   * Set rotation of selected object
   */
  public setRotation(degrees: number): void {
    if (!this.state.selectedObject) return
    
    this.state.selectedObject.rotation.y = THREE.MathUtils.degToRad(degrees)
    
    if (this.onTransformCallback) {
      this.onTransformCallback(this.state.selectedObject)
    }
  }

  /**
   * Scale selected object by factor
   */
  public scaleSelection(factor: number): void {
    if (!this.state.selectedObject) return
    
    this.state.selectedObject.scale.multiplyScalar(factor)
    
    if (this.onTransformCallback) {
      this.onTransformCallback(this.state.selectedObject)
    }
  }

  /**
   * Set scale of selected object
   */
  public setScale(scale: number | THREE.Vector3): void {
    if (!this.state.selectedObject) return
    
    if (typeof scale === 'number') {
      this.state.selectedObject.scale.set(scale, scale, scale)
    } else {
      this.state.selectedObject.scale.copy(scale)
    }
    
    if (this.onTransformCallback) {
      this.onTransformCallback(this.state.selectedObject)
    }
  }

  /**
   * Set position of selected object
   */
  public setPosition(position: THREE.Vector3): void {
    if (!this.state.selectedObject) return
    
    let targetPosition = position.clone()

    if (this.onBoundsConstraint && this.state.selectedObject) {
      targetPosition = this.onBoundsConstraint(targetPosition, this.state.selectedObject)
    }

    if (this.snapEnabled) {
      targetPosition.x = Math.round(targetPosition.x / this.gridSize) * this.gridSize
      targetPosition.z = Math.round(targetPosition.z / this.gridSize) * this.gridSize
    }

    if (this.onCollisionCheck && this.state.selectedObject) {
      if (!this.onCollisionCheck(targetPosition, this.state.selectedObject)) {
        return
      }
    }
    
    this.state.selectedObject.position.copy(targetPosition)
    
    if (this.onTransformCallback) {
      this.onTransformCallback(this.state.selectedObject)
    }
  }

  public setBoundsConstraint(callback: (position: THREE.Vector3, object: THREE.Object3D) => THREE.Vector3): void {
    this.onBoundsConstraint = callback
  }

  public setCollisionCheck(callback: (position: THREE.Vector3, object: THREE.Object3D) => boolean): void {
    this.onCollisionCheck = callback
  }

  public setSnapToGrid(enabled: boolean, gridSize: number = 10): void {
    this.snapEnabled = enabled
    this.gridSize = gridSize
  }

  /**
   * Get current selected object
   */
  public getSelectedObject(): THREE.Object3D | null {
    return this.state.selectedObject
  }

  /**
   * Check if currently manipulating
   */
  public isManipulating(): boolean {
    return this.state.isManipulating
  }

  /**
   * Set callback for selection changes
   */
  public onSelect(callback: (object: THREE.Object3D | null) => void): void {
    this.onSelectCallback = callback
  }

  /**
   * Set callback for transformation changes
   */
  public onTransform(callback: (object: THREE.Object3D) => void): void {
    this.onTransformCallback = callback
  }

  public onDragStart(callback: () => void): void {
    this.onDragStartCallback = callback
  }

  public onDragEnd(callback: () => void): void {
    this.onDragEndCallback = callback
  }

  /**
   * Add visual highlight to selected object
   */
  private addSelectionHighlight(object: THREE.Object3D): void {
    // Create simple bounding box wireframe
    const box = new THREE.Box3().setFromObject(object)
    const size = new THREE.Vector3()
    box.getSize(size)
    const center = new THREE.Vector3()
    box.getCenter(center)
    
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
    const edges = new THREE.EdgesGeometry(geometry)
    this.selectionBox = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })
    )
    this.selectionBox.position.copy(center)
    this.scene.add(this.selectionBox)

    // Store original materials and apply highlight
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.originalMaterials.set(child, child.material)
        
        const highlightMaterial = child.material.clone()
        if (highlightMaterial instanceof THREE.MeshStandardMaterial) {
          highlightMaterial.emissive = new THREE.Color(0x00ff00)
          highlightMaterial.emissiveIntensity = 0.3
        }
        child.material = highlightMaterial
      }
    })
  }

  /**
   * Remove visual highlight from object
   */
  private removeSelectionHighlight(object: THREE.Object3D): void {
    if (this.selectionBox) {
      this.scene.remove(this.selectionBox)
      this.selectionBox.geometry.dispose()
      if (this.selectionBox.material instanceof THREE.Material) {
        this.selectionBox.material.dispose()
      }
      this.selectionBox = null
    }

    object.traverse((child) => {
      if (child instanceof THREE.Mesh && this.originalMaterials.has(child)) {
        const originalMaterial = this.originalMaterials.get(child)!
        child.material = originalMaterial
        this.originalMaterials.delete(child)
      }
    })
  }

  /**
   * Update selection box position
   */
  public updateSelectionBox(): void {
    if (!this.selectionBox || !this.state.selectedObject) return
    
    const box = new THREE.Box3().setFromObject(this.state.selectedObject)
    const size = new THREE.Vector3()
    box.getSize(size)
    const center = new THREE.Vector3()
    box.getCenter(center)
    
    this.selectionBox.position.copy(center)
    
    // Update geometry
    this.selectionBox.geometry.dispose()
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
    this.selectionBox.geometry = new THREE.EdgesGeometry(geometry)
    geometry.dispose()
  }

  /**
   * Get manipulation state
   */
  public getState(): ManipulationState {
    return { ...this.state }
  }

  /**
   * Enable/disable controls
   */
  public setEnabled(enabled: boolean): void {
    // Implementation for enabling/disabling controls
  }

  /**
   * Dispose the manipulation controls
   */
  public dispose(): void {
    this.deselectObject()
    
    this.domElement.removeEventListener('pointerdown', this.onPointerDown.bind(this))
    this.domElement.removeEventListener('pointermove', this.onPointerMove.bind(this))
    this.domElement.removeEventListener('pointerup', this.onPointerUp.bind(this))
    window.removeEventListener('keydown', this.onKeyDown.bind(this))
    
    this.originalMaterials.forEach((material) => {
      if (Array.isArray(material)) {
        material.forEach(mat => mat.dispose())
      } else {
        material.dispose()
      }
    })
    this.originalMaterials.clear()
  }
}