import * as THREE from 'three'
import { RoomConfig } from '../model/room'

export class Floor {
  private mesh: THREE.Mesh | null = null
  private textureLoader: THREE.TextureLoader

  constructor() {
    this.textureLoader = new THREE.TextureLoader()
  }

  public create(config: RoomConfig, scene: THREE.Scene): void {
    if (this.mesh) {
      scene.remove(this.mesh)
      this.mesh.geometry.dispose()
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose()
      }
    }

    const width = config.width * 100
    const height = config.height * 100

    const geometry = new THREE.PlaneGeometry(width, height)
    
    let material: THREE.Material
    
    if (config.floorTexture) {
      const texture = this.textureLoader.load(config.floorTexture)
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(width / 300, height / 300)
      
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.1
      })
    } else {
      material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.1
      })
    }

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.rotation.x = -Math.PI / 2
    this.mesh.receiveShadow = true
    
    scene.add(this.mesh)
  }

  public updateTexture(textureUrl: string, scene: THREE.Scene): void {
    if (!this.mesh) return

    const texture = this.textureLoader.load(textureUrl)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    
    const geometry = this.mesh.geometry as THREE.PlaneGeometry
    const width = geometry.parameters.width
    const height = geometry.parameters.height
    texture.repeat.set(width / 300, height / 300)

    if (this.mesh.material instanceof THREE.MeshStandardMaterial) {
      this.mesh.material.map = texture
      this.mesh.material.needsUpdate = true
    }
  }

  public dispose(scene: THREE.Scene): void {
    if (this.mesh) {
      scene.remove(this.mesh)
      this.mesh.geometry.dispose()
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose()
      }
      this.mesh = null
    }
  }
}