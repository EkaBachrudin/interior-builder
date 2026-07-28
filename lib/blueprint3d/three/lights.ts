import * as THREE from 'three'

export interface SceneConfig {
  backgroundColor: number
  ambientLightIntensity: number
  directionalLightIntensity: number
  shadowMapSize: number
}

export class Lighting {
  private ambientLight!: THREE.AmbientLight
  private directionalLight!: THREE.DirectionalLight
  private fillLights: THREE.PointLight[] = []

  constructor(scene: THREE.Scene, config: SceneConfig) {
    this.setupAmbientLight(scene, config.ambientLightIntensity)
    this.setupDirectionalLight(scene, config.directionalLightIntensity, config.shadowMapSize)
    this.setupFillLights(scene)
  }

  private setupAmbientLight(scene: THREE.Scene, intensity: number): void {
    this.ambientLight = new THREE.AmbientLight(0xffffff, intensity)
    scene.add(this.ambientLight)
  }

  private setupDirectionalLight(
    scene: THREE.Scene,
    intensity: number,
    shadowMapSize: number
  ): void {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, intensity)
    this.directionalLight.position.set(200, 400, 200)
    
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.width = shadowMapSize
    this.directionalLight.shadow.mapSize.height = shadowMapSize
    
    this.directionalLight.shadow.camera.near = 0.5
    this.directionalLight.shadow.camera.far = 1500
    
    const d = 500
    this.directionalLight.shadow.camera.left = -d
    this.directionalLight.shadow.camera.right = d
    this.directionalLight.shadow.camera.top = d
    this.directionalLight.shadow.camera.bottom = -d
    
    this.directionalLight.shadow.bias = -0.0001
    
    scene.add(this.directionalLight)
  }

  private setupFillLights(scene: THREE.Scene): void {
    const warmLight = new THREE.PointLight(0xfff5e6, 0.3, 1000)
    warmLight.position.set(-150, 200, -150)
    scene.add(warmLight)
    this.fillLights.push(warmLight)

    const coolLight = new THREE.PointLight(0xe6f5ff, 0.2, 1000)
    coolLight.position.set(150, 150, 150)
    scene.add(coolLight)
    this.fillLights.push(coolLight)
  }

  public setAmbientIntensity(intensity: number): void {
    this.ambientLight.intensity = intensity
  }

  public setDirectionalIntensity(intensity: number): void {
    this.directionalLight.intensity = intensity
  }

  public setDirectionalPosition(x: number, y: number, z: number): void {
    this.directionalLight.position.set(x, y, z)
  }

  public dispose(): void {
    if (this.ambientLight.parent) {
      this.ambientLight.parent.remove(this.ambientLight)
    }
    
    if (this.directionalLight.parent) {
      this.directionalLight.parent.remove(this.directionalLight)
    }
    
    this.fillLights.forEach(light => {
      if (light.parent) {
        light.parent.remove(light)
      }
    })
    
    this.ambientLight.dispose()
    this.directionalLight.dispose()
    this.fillLights.forEach(light => light.dispose())
  }
}