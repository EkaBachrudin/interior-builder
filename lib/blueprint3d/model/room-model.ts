import * as THREE from 'three'
import { RoomConfig, DEFAULT_ROOM_CONFIG } from './room'
import { Floor } from '../three/floor'
import { Walls } from '../three/edge'
import { SmartWallsConfig } from '../three/smart-walls'

export class ProceduralRoom {
  private scene: THREE.Scene
  private config: RoomConfig
  private floor: Floor
  private walls: Walls
  private camera: THREE.PerspectiveCamera | null = null
  private smartWallsEnabled = false

  constructor(scene: THREE.Scene, config: Partial<RoomConfig> = {}) {
    this.scene = scene
    this.config = { ...DEFAULT_ROOM_CONFIG, ...config }
    this.floor = new Floor()
    this.walls = new Walls()
    
    this.buildRoom()
  }

  private buildRoom(): void {
    this.floor.create(this.config, this.scene)
    this.walls.create(this.config, this.scene)
  }

  public updateConfig(newConfig: Partial<RoomConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.rebuild()
  }

  public updateFloorTexture(textureUrl: string): void {
    this.config.floorTexture = textureUrl
    this.floor.updateTexture(textureUrl, this.scene)
  }

  public updateWallTexture(textureUrl: string): void {
    this.config.wallTexture = textureUrl
    this.walls.updateTexture(textureUrl, this.scene)
  }

  public setWallsVisibility(visible: boolean): void {
    this.walls.setVisibility(visible, this.scene)
  }

  public setWallVisibility(wallIndex: number, visible: boolean): void {
    this.walls.setWallVisibility(wallIndex, visible)
  }

  public rebuild(): void {
    this.floor.create(this.config, this.scene)
    this.walls.create(this.config, this.scene)
    
    // Re-initialize smart walls if enabled
    if (this.smartWallsEnabled && this.camera) {
      this.initializeSmartWalls(this.camera)
    }
  }

  public getConfig(): RoomConfig {
    return { ...this.config }
  }

  // Smart Walls Methods
  public setCamera(camera: THREE.PerspectiveCamera): void {
    this.camera = camera
  }

  public initializeSmartWalls(
    camera: THREE.PerspectiveCamera,
    config?: Partial<SmartWallsConfig>
  ): void {
    this.camera = camera
    this.walls.initializeSmartWalls(
      camera,
      this.config.width,
      this.config.height,
      config
    )
    this.smartWallsEnabled = true
  }

  public setSmartWallsEnabled(enabled: boolean): void {
    this.walls.setSmartWallsEnabled(enabled)
    this.smartWallsEnabled = enabled
  }

  public isSmartWallsEnabled(): boolean {
    return this.walls.isSmartWallsEnabled()
  }

  public setSmartWallsConfig(config: Partial<SmartWallsConfig>): void {
    this.walls.setSmartWallsConfig(config)
  }

  public getSmartWallsConfig(): SmartWallsConfig | null {
    return this.walls.getSmartWallsConfig()
  }

  public getCurrentWallVisibility(): Map<number, boolean> {
    return this.walls.getCurrentWallVisibility()
  }

  public getSmartWallsDebugInfo() {
    return this.walls.getSmartWallsDebugInfo()
  }

  public dispose(): void {
    this.walls.disposeSmartWalls()
    this.floor.dispose(this.scene)
    this.walls.dispose(this.scene)
  }
}