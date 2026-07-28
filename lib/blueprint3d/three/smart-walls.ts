import * as THREE from 'three'

export interface EnhancedWall {
  mesh: THREE.Mesh
  normal: THREE.Vector3  // Points inward toward room center
  center: THREE.Vector3  // Wall center position
  plane: THREE.Plane     // Wall plane for calculations
  index: number          // Wall identifier (0-3)
  isHidden: boolean      // Current visibility state
}

export interface SmartWallsConfig {
  enabled: boolean
  sensitivity: number    // 0-1, higher = more aggressive hiding
  transitionSpeed: number // milliseconds
  debugMode: boolean
}

export class SmartWallsSystem {
  private walls: EnhancedWall[] = []
  private roomCenter: THREE.Vector3
  private camera: THREE.PerspectiveCamera
  private config: SmartWallsConfig
  private lastUpdateTime = 0
  private lastCameraPosition = new THREE.Vector3()
  private updateThreshold = 5 // units
  private throttleDelay = 100 // ms
  private transitionTimers = new Map<number, NodeJS.Timeout>()

  constructor(
    camera: THREE.PerspectiveCamera,
    roomWidth: number,
    roomHeight: number,
    config: Partial<SmartWallsConfig> = {}
  ) {
    this.camera = camera
    this.config = {
      enabled: true,
      sensitivity: 0.5,
      transitionSpeed: 300,
      debugMode: false,
      ...config
    }
    
    // Calculate room center (assuming room is centered at origin)
    this.roomCenter = new THREE.Vector3(0, 0, 0)
    
    this.initializeWalls(roomWidth, roomHeight)
    this.startTracking()
  }

  private initializeWalls(roomWidth: number, roomHeight: number): void {
    const width = roomWidth * 100
    const height = roomHeight * 100
    const wallHeight = 250 // Default wall height in cm

    // Wall configurations with inward-facing normals
    const wallConfigs = [
      {
        index: 0,
        position: new THREE.Vector3(0, wallHeight / 2, -height / 2),
        rotation: new THREE.Euler(0, 0, 0),
        normal: new THREE.Vector3(0, 0, 1),   // Points inward (+z)
        dimensions: { width: width, height: wallHeight }
      },
      {
        index: 1,
        position: new THREE.Vector3(0, wallHeight / 2, height / 2),
        rotation: new THREE.Euler(0, Math.PI, 0),
        normal: new THREE.Vector3(0, 0, -1),  // Points inward (-z)
        dimensions: { width: width, height: wallHeight }
      },
      {
        index: 2,
        position: new THREE.Vector3(-width / 2, wallHeight / 2, 0),
        rotation: new THREE.Euler(0, Math.PI / 2, 0),
        normal: new THREE.Vector3(1, 0, 0),   // Points inward (+x)
        dimensions: { width: height, height: wallHeight }
      },
      {
        index: 3,
        position: new THREE.Vector3(width / 2, wallHeight / 2, 0),
        rotation: new THREE.Euler(0, -Math.PI / 2, 0),
        normal: new THREE.Vector3(-1, 0, 0),  // Points inward (-x)
        dimensions: { width: height, height: wallHeight }
      }
    ]

    // Note: Walls will be created externally and registered here
    // This just sets up the configuration
  }

  public registerWall(mesh: THREE.Mesh, index: number, roomWidth: number, roomHeight: number): void {
    const width = roomWidth * 100
    const height = roomHeight * 100
    const wallHeight = 250

    // Calculate wall center and normal based on index
    let position: THREE.Vector3
    let normal: THREE.Vector3

    switch (index) {
      case 0: // Back wall
        position = new THREE.Vector3(0, wallHeight / 2, -height / 2)
        normal = new THREE.Vector3(0, 0, 1)
        break
      case 1: // Front wall
        position = new THREE.Vector3(0, wallHeight / 2, height / 2)
        normal = new THREE.Vector3(0, 0, -1)
        break
      case 2: // Left wall
        position = new THREE.Vector3(-width / 2, wallHeight / 2, 0)
        normal = new THREE.Vector3(1, 0, 0)
        break
      case 3: // Right wall
        position = new THREE.Vector3(width / 2, wallHeight / 2, 0)
        normal = new THREE.Vector3(-1, 0, 0)
        break
      default:
        position = new THREE.Vector3()
        normal = new THREE.Vector3()
    }

    // Create plane from point and normal
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, position)

    const enhancedWall: EnhancedWall = {
      mesh,
      normal: normal.clone(),
      center: position.clone(),
      plane,
      index,
      isHidden: false
    }

    this.walls[index] = enhancedWall

    // Enable transparency for smooth transitions
    if (mesh.material instanceof THREE.Material) {
      mesh.material.transparent = true
      mesh.material.opacity = 1
      mesh.material.depthWrite = true
    }
  }

  public updateRoomDimensions(roomWidth: number, roomHeight: number): void {
    // Recalculate wall positions and normals when room dimensions change
    this.walls = [] // Clear and re-register walls
    // Walls will be re-registered by the caller
  }

  private shouldUpdateVisibility(): boolean {
    if (!this.config.enabled) return false

    const now = Date.now()
    const timeSinceLastUpdate = now - this.lastUpdateTime
    const currentCameraPos = this.camera.position.clone()
    const distanceMoved = currentCameraPos.distanceTo(this.lastCameraPosition)

    if (timeSinceLastUpdate < this.throttleDelay && distanceMoved < this.updateThreshold) {
      return false
    }

    this.lastCameraPosition.copy(currentCameraPos)
    this.lastUpdateTime = now
    return true
  }

  private calculateWallVisibility(): Map<number, boolean> {
    const visibilityMap = new Map<number, boolean>()
    
    if (this.walls.length === 0) {
      return visibilityMap
    }

    // Calculate vector from camera to room center
    const cameraToCenter = this.roomCenter.clone().sub(this.camera.position).normalize()

    this.walls.forEach(wall => {
      // Dot product: positive = wall faces away from camera direction (should hide)
      // Negative = wall faces toward camera (should keep visible)
      const dotProduct = wall.normal.dot(cameraToCenter)
      
      // Use sensitivity threshold - higher sensitivity = easier to hide walls
      const threshold = 0.1 + (1 - this.config.sensitivity) * 0.3
      const shouldHide = dotProduct > threshold
      
      visibilityMap.set(wall.index, !shouldHide)
    })

    return visibilityMap
  }

  private setWallVisibility(wallIndex: number, visible: boolean): void {
    const wall = this.walls[wallIndex]
    if (!wall || wall.isHidden === !visible) {
      console.log('[SmartWalls] Wall', wallIndex, 'already in desired state, skipping')
      return
    }

    console.log('[SmartWalls] Changing wall', wallIndex, 'visibility to:', visible, 'current hidden:', wall.isHidden)

    wall.isHidden = !visible

    // Clear any existing transition
    if (this.transitionTimers.has(wallIndex)) {
      clearTimeout(this.transitionTimers.get(wallIndex)!)
    }

    const mesh = wall.mesh
    if (!mesh.material) {
      console.log('[SmartWalls] Wall', wallIndex, 'has no material')
      return
    }

    const material = mesh.material as THREE.MeshStandardMaterial
    const startOpacity = material.opacity || 1
    const targetOpacity = visible ? 1 : 0
    const duration = this.config.transitionSpeed
    const startTime = performance.now()

    console.log('[SmartWalls] Starting transition for wall', wallIndex, '- from opacity:', startOpacity, 'to:', targetOpacity, 'duration:', duration)

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease out quad)
      const easedProgress = 1 - (1 - progress) * (1 - progress)
      
      material.opacity = startOpacity + (targetOpacity - startOpacity) * easedProgress

      if (progress < 1) {
        this.transitionTimers.set(wallIndex, setTimeout(() => {
          requestAnimationFrame(animate)
        }, 16))
      } else {
        // Final state
        material.opacity = targetOpacity
        console.log('[SmartWalls] Transition complete for wall', wallIndex, '- final opacity:', targetOpacity)
        if (!visible) {
          mesh.visible = false
          console.log('[SmartWalls] Wall', wallIndex, 'set to invisible')
        } else {
          mesh.visible = true
          material.depthWrite = true
          console.log('[SmartWalls] Wall', wallIndex, 'set to visible')
        }
        this.transitionTimers.delete(wallIndex)
      }
    }

    if (visible) {
      mesh.visible = true
    }
    
    requestAnimationFrame(animate)
  }

  public update(): void {
    if (!this.shouldUpdateVisibility()) return
    
    console.log('[SmartWalls] Updating visibility - walls count:', this.walls.length, 'camera pos:', this.camera.position)

    const visibilityMap = this.calculateWallVisibility()
    
    console.log('[SmartWalls] Visibility map:', visibilityMap)

    visibilityMap.forEach((visible, wallIndex) => {
      console.log('[SmartWalls] Setting wall', wallIndex, 'visibility:', visible)
      this.setWallVisibility(wallIndex, visible)
    })
  }

  public startTracking(): void {
    // Start the update loop
    const updateLoop = () => {
      this.update()
      requestAnimationFrame(updateLoop)
    }
    requestAnimationFrame(updateLoop)
  }

  public stopTracking(): void {
    // Clear all transition timers
    this.transitionTimers.forEach(timer => clearTimeout(timer))
    this.transitionTimers.clear()
  }

  public setConfig(newConfig: Partial<SmartWallsConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  public getConfig(): SmartWallsConfig {
    return { ...this.config }
  }

  public getCurrentVisibility(): Map<number, boolean> {
    const visibilityMap = new Map<number, boolean>()
    this.walls.forEach(wall => {
      visibilityMap.set(wall.index, !wall.isHidden)
    })
    return visibilityMap
  }

  public getWallData(): EnhancedWall[] {
    return [...this.walls]
  }

  public dispose(): void {
    this.stopTracking()
    this.walls = []
  }

  public isCameraInsideRoom(): boolean {
    const pos = this.camera.position
    // This is a simplified check - assumes room is centered at origin
    // Real implementation should use actual room dimensions
    return Math.abs(pos.x) < 200 && Math.abs(pos.z) < 200 && pos.y > 0 && pos.y < 250
  }

  public getDebugInfo(): {
    cameraPosition: THREE.Vector3
    cameraInsideRoom: boolean
    wallStates: Array<{
      index: number
      normal: THREE.Vector3
      dotProduct: number
      isHidden: boolean
    }>
  } {
    const cameraToCenter = this.roomCenter.clone().sub(this.camera.position).normalize()
    
    const wallStates = this.walls.map(wall => ({
      index: wall.index,
      normal: wall.normal.clone(),
      dotProduct: wall.normal.dot(cameraToCenter),
      isHidden: wall.isHidden
    }))

    return {
      cameraPosition: this.camera.position.clone(),
      cameraInsideRoom: this.isCameraInsideRoom(),
      wallStates
    }
  }
}