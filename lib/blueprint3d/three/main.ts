import * as THREE from 'three'
import { EventEmitter } from '../core/events'
import { Configuration, DEFAULT_CONFIG } from '../core/configuration'
import { Lighting } from './lights'
import { CameraControls } from './controls'

export class Scene3D extends EventEmitter {
  public scene!: THREE.Scene
  public camera!: THREE.PerspectiveCamera
  public renderer!: THREE.WebGLRenderer
  public controls!: CameraControls
  
  private container: HTMLElement
  private config: Configuration
  private animationId: number | null = null
  private lighting!: Lighting

  constructor(container: HTMLElement, config: Partial<Configuration> = {}) {
    super()
    
    this.container = container
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    this.initScene()
    this.initCamera()
    this.initRenderer()
    this.initLighting()
    this.initControls()
    
    this.setupEventListeners()
  }

  private initScene(): void {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(this.config.scene.backgroundColor)
  }

  private initCamera(): void {
    const aspect = this.container.clientWidth / this.container.clientHeight
    this.camera = new THREE.PerspectiveCamera(
      this.config.camera.fov,
      aspect,
      this.config.camera.near,
      this.config.camera.far
    )
    this.camera.position.set(...this.config.camera.initialPosition)
  }

  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    )
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    
    this.container.appendChild(this.renderer.domElement)
  }

  private initLighting(): void {
    this.lighting = new Lighting(this.scene, this.config.scene)
  }

  private initControls(): void {
    this.controls = new CameraControls(
      this.camera,
      this.renderer.domElement,
      this.config.controls
    )
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  private handleResize(): void {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
    
    this.emit('resize', { width, height })
  }

  public startAnimation(): void {
    if (this.animationId !== null) return
    
    const animate = () => {
      this.animationId = requestAnimationFrame(animate)
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    }
    
    animate()
  }

  public stopAnimation(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  public render(): void {
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  public resize(): void {
    this.handleResize()
  }

  public dispose(): void {
    this.stopAnimation()
    window.removeEventListener('resize', this.handleResize.bind(this))
    
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
    
    this.renderer.dispose()
    this.controls.dispose()
    this.lighting.dispose()
    
    this.clear()
  }

  public getScene(): THREE.Scene {
    return this.scene
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }
}