export interface Configuration {
  scene: {
    backgroundColor: number
    ambientLightIntensity: number
    directionalLightIntensity: number
    shadowMapSize: number
  }
  camera: {
    fov: number
    near: number
    far: number
    initialPosition: [number, number, number]
  }
  controls: {
    rotateSpeed: number
    zoomSpeed: number
    minDistance: number
    maxDistance: number
    minTargetY: number
    minCameraY: number
  }
  room: {
    defaultWidth: number
    defaultHeight: number
    defaultWallHeight: number
    defaultWallThickness: number
  }
}

export const DEFAULT_CONFIG: Configuration = {
  scene: {
    backgroundColor: 0xf0f0f0,
    ambientLightIntensity: 0.6,
    directionalLightIntensity: 0.8,
    shadowMapSize: 2048
  },
  camera: {
    fov: 45,
    near: 1,
    far: 10000,
    initialPosition: [300, 400, 300]
  },
  controls: {
    rotateSpeed: 0.5,
    zoomSpeed: 1.0,
    minDistance: 0,
    maxDistance: 1500,
    minTargetY: 50,
    minCameraY: 50
  },
  room: {
    defaultWidth: 4,
    defaultHeight: 4,
    defaultWallHeight: 250,
    defaultWallThickness: 10
  }
}