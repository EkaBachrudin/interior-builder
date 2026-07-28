import * as THREE from 'three'

export interface TextureConfig {
  repeatX: number
  repeatY: number
  wrapS: 'repeat' | 'clamp' | 'mirror'
  wrapT: 'repeat' | 'clamp' | 'mirror'
  roughness: number
  metalness: number
}

export const DEFAULT_TEXTURE_CONFIG: TextureConfig = {
  repeatX: 1,
  repeatY: 1,
  wrapS: 'repeat',
  wrapT: 'repeat',
  roughness: 0.8,
  metalness: 0.1
}

export interface TextureEntry {
  texture: THREE.Texture
  url: string
  loadedAt: number
}

export class TextureManager {
  private cache: Map<string, TextureEntry> = new Map()
  private loader: THREE.TextureLoader
  private loadingPromises: Map<string, Promise<THREE.Texture>> = new Map()

  constructor() {
    this.loader = new THREE.TextureLoader()
  }

  public isCached(url: string): boolean {
    return this.cache.has(url)
  }

  public getCached(url: string): THREE.Texture | null {
    const entry = this.cache.get(url)
    return entry ? entry.texture.clone() : null
  }

  public load(url: string, onProgress?: (progress: number) => void): Promise<THREE.Texture> {
    if (this.cache.has(url)) {
      return Promise.resolve(this.cache.get(url)!.texture.clone())
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!.then(t => t.clone())
    }

    const promise = new Promise<THREE.Texture>((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          this.cache.set(url, {
            texture: texture.clone(),
            url,
            loadedAt: Date.now()
          })
          this.loadingPromises.delete(url)
          resolve(texture)
        },
        (progressEvent) => {
          if (progressEvent.lengthComputable && onProgress) {
            onProgress(progressEvent.loaded / progressEvent.total)
          }
        },
        (error) => {
          this.loadingPromises.delete(url)
          reject(error)
        }
      )
    })

    this.loadingPromises.set(url, promise)
    return promise
  }

  public applyToMaterial(
    url: string,
    material: THREE.MeshStandardMaterial,
    config: Partial<TextureConfig> = {}
  ): Promise<void> {
    const merged = { ...DEFAULT_TEXTURE_CONFIG, ...config }

    return this.load(url).then((texture) => {
      texture.wrapS = this.getWrapMode(merged.wrapS)
      texture.wrapT = this.getWrapMode(merged.wrapT)
      texture.repeat.set(merged.repeatX, merged.repeatY)

      material.map = texture
      material.roughness = merged.roughness
      material.metalness = merged.metalness
      material.needsUpdate = true
    })
  }

  public applyToFloor(
    url: string,
    floorMesh: THREE.Mesh,
    config: Partial<TextureConfig> = {}
  ): Promise<void> {
    if (!(floorMesh.material instanceof THREE.MeshStandardMaterial)) {
      return Promise.reject(new Error('Floor mesh material is not MeshStandardMaterial'))
    }

    const geometry = floorMesh.geometry as THREE.PlaneGeometry
    const w = geometry.parameters.width
    const h = geometry.parameters.height
    const merged = {
      ...DEFAULT_TEXTURE_CONFIG,
      repeatX: w / 300,
      repeatY: h / 300,
      roughness: 0.8,
      metalness: 0.1,
      ...config
    }

    return this.applyToMaterial(url, floorMesh.material, merged)
  }

  public applyToWall(
    url: string,
    wallMesh: THREE.Mesh,
    config: Partial<TextureConfig> = {}
  ): Promise<void> {
    if (!(wallMesh.material instanceof THREE.MeshStandardMaterial)) {
      return Promise.reject(new Error('Wall mesh material is not MeshStandardMaterial'))
    }

    const geometry = wallMesh.geometry as THREE.PlaneGeometry
    const w = geometry.parameters.width
    const h = geometry.parameters.height
    const merged = {
      ...DEFAULT_TEXTURE_CONFIG,
      repeatX: w / 300,
      repeatY: h / 300,
      roughness: 0.9,
      metalness: 0.0,
      ...config
    }

    return this.applyToMaterial(url, wallMesh.material, merged)
  }

  public generatePreview(
    url: string,
    size: number = 64
  ): Promise<string> {
    return this.load(url).then((texture) => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!

      const image = texture.image as HTMLImageElement | HTMLCanvasElement | null
      if (image) {
        ctx.drawImage(image, 0, 0, size, size)
      } else {
        ctx.fillStyle = '#cccccc'
        ctx.fillRect(0, 0, size, size)
      }

      return canvas.toDataURL('image/png')
    })
  }

  public preload(urls: string[], onProgress?: (completed: number, total: number) => void): Promise<THREE.Texture[]> {
    let completed = 0
    const total = urls.length

    const promises = urls.map(url =>
      this.load(url).then(texture => {
        completed++
        onProgress?.(completed, total)
        return texture
      })
    )

    return Promise.all(promises)
  }

  public clearCache(): void {
    this.cache.forEach(entry => entry.texture.dispose())
    this.cache.clear()
    this.loadingPromises.clear()
  }

  public getCacheSize(): number {
    return this.cache.size
  }

  public dispose(): void {
    this.clearCache()
    this.loader = null as any
  }

  private getWrapMode(mode: 'repeat' | 'clamp' | 'mirror'): THREE.Wrapping {
    switch (mode) {
      case 'clamp': return THREE.ClampToEdgeWrapping as THREE.Wrapping
      case 'mirror': return THREE.MirroredRepeatWrapping as THREE.Wrapping
      case 'repeat':
      default: return THREE.RepeatWrapping as THREE.Wrapping
    }
  }
}
