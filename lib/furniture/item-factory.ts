import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Item } from '../constants'

export interface LoadedModel {
  scene: THREE.Group
  originalBoundingBox: THREE.Box3
  originalSize: THREE.Vector3
}

export interface LoadingState {
  isLoading: boolean
  progress: number
  error: string | null
}

export class ItemFactory {
  private loader: GLTFLoader
  private modelCache: Map<string, LoadedModel> = new Map()
  private loadingStates: Map<string, LoadingState> = new Map()
  private loadPromises: Map<string, Promise<LoadedModel>> = new Map()

  constructor() {
    this.loader = new GLTFLoader()
  }

  /**
   * Load a 3D model for a given item
   * @param item The item configuration
   * @returns Promise that resolves to the loaded model
   */
  public async loadModel(item: Item): Promise<LoadedModel> {
    // Check cache first
    if (this.modelCache.has(item.model)) {
      return this.modelCache.get(item.model)!
    }

    // Check if already loading
    if (this.loadPromises.has(item.model)) {
      return this.loadPromises.get(item.model)!
    }

    // Start loading
    const loadingState: LoadingState = {
      isLoading: true,
      progress: 0,
      error: null
    }
    this.loadingStates.set(item.model, loadingState)

    const loadPromise = new Promise<LoadedModel>((resolve, reject) => {
      this.loader.load(
        item.model,
        (gltf) => {
          const scene = gltf.scene
          
          // Enable shadows for all meshes
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true
              child.receiveShadow = true
              
              // Optimize materials
              if (child.material) {
                child.material.side = THREE.DoubleSide
              }
            }
          })

          // Calculate original bounding box and size
          const boundingBox = new THREE.Box3().setFromObject(scene)
          const size = new THREE.Vector3()
          boundingBox.getSize(size)

          // Normalize to centimeters if model is authored in meters
          const maxDimension = Math.max(size.x, size.y, size.z)
          if (maxDimension > 0 && maxDimension < 20) {
            scene.scale.set(100, 100, 100)
            boundingBox.setFromObject(scene)
            boundingBox.getSize(size)
          }

          const loadedModel: LoadedModel = {
            scene,
            originalBoundingBox: boundingBox,
            originalSize: size
          }

          // Cache the model
          this.modelCache.set(item.model, loadedModel)
          
          // Update loading state
          loadingState.isLoading = false
          loadingState.progress = 1
          this.loadingStates.set(item.model, loadingState)

          resolve(loadedModel)
        },
        (progress) => {
          // Update progress
          if (progress.lengthComputable) {
            loadingState.progress = progress.loaded / progress.total
            this.loadingStates.set(item.model, loadingState)
          }
        },
        (error) => {
          // Handle error
          console.error(`Failed to load model for ${item.name}:`, error)
          loadingState.isLoading = false
          loadingState.error = error instanceof Error ? error.message : 'Unknown error'
          this.loadingStates.set(item.model, loadingState)
          this.loadPromises.delete(item.model)
          reject(error)
        }
      )
    })

    this.loadPromises.set(item.model, loadPromise)
    return loadPromise
  }

  /**
   * Create a clone of a loaded model for placement in the scene
   * @param modelUrl The URL of the model to clone
   * @returns Cloned scene ready for placement
   */
  public createModelClone(modelUrl: string): THREE.Group | null {
    const loadedModel = this.modelCache.get(modelUrl)
    if (!loadedModel) {
      return null
    }

    // Deep clone the scene
    const clone = loadedModel.scene.clone(true)
    
    // Clone materials to avoid shared state
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map(mat => mat.clone())
        } else {
          child.material = child.material.clone()
        }
      }
    })

    return clone
  }

  /**
   * Get loading state for a specific model
   * @param modelUrl The URL of the model
   * @returns Current loading state
   */
  public getLoadingState(modelUrl: string): LoadingState {
    return this.loadingStates.get(modelUrl) || {
      isLoading: false,
      progress: 0,
      error: null
    }
  }

  /**
   * Check if a model is cached
   * @param modelUrl The URL of the model
   * @returns True if model is cached
   */
  public isModelCached(modelUrl: string): boolean {
    return this.modelCache.has(modelUrl)
  }

  /**
   * Preload models for better performance
   * @param items Array of items to preload
   * @returns Promise that resolves when all models are loaded
   */
  public async preloadModels(items: Item[]): Promise<void> {
    const loadPromises = items.map(item => this.loadModel(item))
    await Promise.allSettled(loadPromises)
  }

  /**
   * Clear cached models to free memory
   */
  public clearCache(): void {
    // Dispose all cached models
    this.modelCache.forEach((loadedModel) => {
      loadedModel.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) {
            child.geometry.dispose()
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose())
            } else {
              child.material.dispose()
            }
          }
        }
      })
    })

    // Clear caches
    this.modelCache.clear()
    this.loadingStates.clear()
    this.loadPromises.clear()
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    cachedModels: number
    loadingModels: number
    totalMemoryEstimate: string
  } {
    let totalVertices = 0
    let totalTriangles = 0

    this.modelCache.forEach((loadedModel) => {
      loadedModel.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const geometry = child.geometry
          totalVertices += geometry.attributes.position?.count || 0
          totalTriangles += geometry.index?.count / 3 || (geometry.attributes.position?.count || 0) / 3
        }
      })
    })

    // Rough memory estimate (simplified)
    const memoryEstimate = (totalVertices * 12 + totalTriangles * 6) / (1024 * 1024) // in MB

    return {
      cachedModels: this.modelCache.size,
      loadingModels: this.loadPromises.size - this.modelCache.size,
      totalMemoryEstimate: `${memoryEstimate.toFixed(2)} MB`
    }
  }

  /**
   * Dispose the factory and clean up resources
   */
  public dispose(): void {
    this.clearCache()
  }
}