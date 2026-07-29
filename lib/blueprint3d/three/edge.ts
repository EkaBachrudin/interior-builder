import * as THREE from 'three'
import { RoomConfig } from '../model/room'
import { SmartWallsSystem } from './smart-walls'

export class Walls {
  private meshes: THREE.Mesh[] = []
  private textureLoader: THREE.TextureLoader
  private smartWallsSystem: SmartWallsSystem | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null

  constructor() {
    this.textureLoader = new THREE.TextureLoader()
  }

  public create(config: RoomConfig, scene: THREE.Scene): void {
    this.clear(scene)
    this.scene = scene

    const width = config.width * 100
    const height = config.height * 100
    const wallHeight = config.wallHeight
    const wallThickness = config.wallThickness

    const wallConfigs = [
      {
        position: new THREE.Vector3(0, wallHeight / 2, -height / 2),
        rotation: new THREE.Euler(0, 0, 0),
        dimensions: { width: width, height: wallHeight }
      },
      {
        position: new THREE.Vector3(0, wallHeight / 2, height / 2),
        rotation: new THREE.Euler(0, Math.PI, 0),
        dimensions: { width: width, height: wallHeight }
      },
      {
        position: new THREE.Vector3(-width / 2, wallHeight / 2, 0),
        rotation: new THREE.Euler(0, Math.PI / 2, 0),
        dimensions: { width: height, height: wallHeight }
      },
      {
        position: new THREE.Vector3(width / 2, wallHeight / 2, 0),
        rotation: new THREE.Euler(0, -Math.PI / 2, 0),
        dimensions: { width: height, height: wallHeight }
      }
    ]

    wallConfigs.forEach((wallConfig, index) => {
      const wall = this.createWall(wallConfig, config, index)
      this.meshes.push(wall)
      scene.add(wall)
      
      // Register with smart walls system if already initialized
      if (this.smartWallsSystem) {
        console.log(`Registering wall ${index} with smart walls system`)
        this.smartWallsSystem.registerWall(wall, index, width, height)
      }
    })
  }

  private createWall(
    config: {
      position: THREE.Vector3
      rotation: THREE.Euler
      dimensions: { width: number; height: number }
    },
    roomConfig: RoomConfig,
    index: number
  ): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(
      config.dimensions.width,
      config.dimensions.height
    )

    let material: THREE.Material

    if (roomConfig.wallTexture) {
      const texture = this.textureLoader.load(roomConfig.wallTexture)
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(
        config.dimensions.width / 300,
        config.dimensions.height / 300
      )

      material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.9,
        metalness: 0.0
      })
    } else {
      material = new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        side: THREE.DoubleSide,
        roughness: 0.9,
        metalness: 0.0
      })
    }

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(config.position)
    mesh.rotation.copy(config.rotation)
    mesh.castShadow = false
    mesh.receiveShadow = false
    mesh.userData.wallIndex = index

    return mesh
  }

  public updateTexture(textureUrl: string, scene: THREE.Scene): void {
    const texture = this.textureLoader.load(textureUrl)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    this.meshes.forEach(mesh => {
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        const geometry = mesh.geometry as THREE.PlaneGeometry
        const width = geometry.parameters.width
        const height = geometry.parameters.height
        texture.repeat.set(width / 300, height / 300)

        mesh.material.map = texture
        mesh.material.needsUpdate = true
      }
    })
  }

  public setVisibility(visible: boolean, scene: THREE.Scene): void {
    this.meshes.forEach(mesh => {
      mesh.visible = visible
    })
  }

  public setWallVisibility(wallIndex: number, visible: boolean): void {
    if (wallIndex >= 0 && wallIndex < this.meshes.length) {
      this.meshes[wallIndex].visible = visible
    }
  }

  public clear(scene: THREE.Scene): void {
    this.meshes.forEach(mesh => {
      scene.remove(mesh)
      mesh.geometry.dispose()
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose()
      }
    })
    this.meshes = []
  }

  public dispose(scene: THREE.Scene): void {
    this.clear(scene)
  }

  // Smart Walls System Integration
  public initializeSmartWalls(
    camera: THREE.PerspectiveCamera,
    roomWidth: number,
    roomHeight: number
  ): void {
    this.camera = camera
    
    this.smartWallsSystem = new SmartWallsSystem(
      camera,
      roomWidth,
      roomHeight
    )

    this.meshes.forEach((mesh, index) => {
      if (this.smartWallsSystem) {
        this.smartWallsSystem.registerWall(mesh, index, roomWidth, roomHeight)
      }
    })
  }

  public updateSmartWallsDimensions(roomWidth: number, roomHeight: number): void {
    if (this.smartWallsSystem) {
      this.smartWallsSystem.updateRoomDimensions(roomWidth, roomHeight)
      
      // Re-register walls with new dimensions
      this.meshes.forEach((mesh, index) => {
        this.smartWallsSystem!.registerWall(mesh, index, roomWidth, roomHeight)
      })
    }
  }

  public disposeSmartWalls(): void {
    if (this.smartWallsSystem) {
      this.smartWallsSystem.dispose()
      this.smartWallsSystem = null
    }
  }
}