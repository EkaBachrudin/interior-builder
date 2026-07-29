import * as THREE from 'three'

export interface ControlsConfig {
  rotateSpeed: number
  zoomSpeed: number
  minDistance: number
  maxDistance: number
  minTargetY: number
  minCameraY: number
}

export class CameraControls {
  public enabled = true
  public rotateSpeed: number
  public zoomSpeed: number
  public minDistance: number
  public maxDistance: number
  public minTargetY: number
  public minCameraY: number

  private camera: THREE.PerspectiveCamera
  private domElement: HTMLElement
  private target: THREE.Vector3

  private isDragging = false
  private isPanning = false
  private previousMousePosition = { x: 0, y: 0 }
  private spherical = new THREE.Spherical()
  private sphericalDelta = new THREE.Spherical()

  private touches = {
    ONE: -1,
    TWO: -1,
  }
  private touchPreviousPositions: { x: number; y: number }[] = []
  private touchPreviousPinchDistance = 0

  private boundOnMouseDown: (e: MouseEvent) => void
  private boundOnMouseMove: (e: MouseEvent) => void
  private boundOnMouseUp: (e: MouseEvent) => void
  private boundOnMouseLeave: (e: MouseEvent) => void
  private boundOnWheel: (e: WheelEvent) => void
  private boundOnTouchStart: (e: TouchEvent) => void
  private boundOnTouchMove: (e: TouchEvent) => void
  private boundOnTouchEnd: (e: TouchEvent) => void
  private boundOnResize: () => void

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    config: ControlsConfig,
  ) {
    this.camera = camera
    this.domElement = domElement
    this.target = new THREE.Vector3(0, 0, 0)

    this.rotateSpeed = config.rotateSpeed
    this.zoomSpeed = config.zoomSpeed
    this.minDistance = config.minDistance
    this.maxDistance = config.maxDistance
    this.minTargetY = config.minTargetY
    this.minCameraY = config.minCameraY

    this.boundOnMouseDown = this.onMouseDown.bind(this)
    this.boundOnMouseMove = this.onMouseMove.bind(this)
    this.boundOnMouseUp = this.onMouseUp.bind(this)
    this.boundOnMouseLeave = this.onMouseUp.bind(this)
    this.boundOnWheel = this.onWheel.bind(this)
    this.boundOnTouchStart = this.onTouchStart.bind(this)
    this.boundOnTouchMove = this.onTouchMove.bind(this)
    this.boundOnTouchEnd = this.onTouchEnd.bind(this)
    this.boundOnResize = () => {}

    this.setupEventListeners()
    this.updateSphericalFromCamera()
  }

  private setupEventListeners(): void {
    this.domElement.addEventListener('mousedown', this.boundOnMouseDown)
    this.domElement.addEventListener('mousemove', this.boundOnMouseMove)
    this.domElement.addEventListener('mouseup', this.boundOnMouseUp)
    this.domElement.addEventListener('mouseleave', this.boundOnMouseLeave)
    this.domElement.addEventListener('wheel', this.boundOnWheel, { passive: false })
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault())

    this.domElement.addEventListener('touchstart', this.boundOnTouchStart, { passive: false })
    this.domElement.addEventListener('touchmove', this.boundOnTouchMove, { passive: false })
    this.domElement.addEventListener('touchend', this.boundOnTouchEnd)
  }

  private updateSphericalFromCamera(): void {
    const offset = this.camera.position.clone().sub(this.target)
    this.spherical.setFromVector3(offset)
  }

  private onMouseDown(event: MouseEvent): void {
    if (!this.enabled) return

    if (event.button === 0) {
      this.isDragging = true
    } else if (event.button === 2) {
      this.isPanning = true
    }

    this.previousMousePosition = { x: event.clientX, y: event.clientY }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.enabled) return

    const deltaX = event.clientX - this.previousMousePosition.x
    const deltaY = event.clientY - this.previousMousePosition.y

    if (this.isDragging) {
      this.rotate(deltaX, deltaY)
    } else if (this.isPanning) {
      this.pan(deltaX, deltaY)
    }

    this.previousMousePosition = { x: event.clientX, y: event.clientY }
  }

  private onMouseUp(): void {
    this.isDragging = false
    this.isPanning = false
  }

  private onWheel(event: WheelEvent): void {
    if (!this.enabled) return
    event.preventDefault()

    const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9
    this.zoom(zoomFactor)
  }

  private onTouchStart(event: TouchEvent): void {
    if (!this.enabled) return
    event.preventDefault()

    const touches = event.touches

    if (touches.length === 1) {
      this.touches.ONE = touches[0].identifier
      this.touches.TWO = -1
      this.touchPreviousPositions = [{ x: touches[0].clientX, y: touches[0].clientY }]
      this.isDragging = true
    } else if (touches.length === 2) {
      this.touches.ONE = touches[0].identifier
      this.touches.TWO = touches[1].identifier
      this.isDragging = false
      this.isPanning = true
      this.touchPreviousPositions = [
        { x: touches[0].clientX, y: touches[0].clientY },
        { x: touches[1].clientX, y: touches[1].clientY },
      ]
      this.touchPreviousPinchDistance = Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY,
      )
    }
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.enabled) return
    event.preventDefault()

    const touches = event.touches

    if (touches.length === 1 && this.isDragging) {
      const deltaX = touches[0].clientX - this.touchPreviousPositions[0].x
      const deltaY = touches[0].clientY - this.touchPreviousPositions[0].y
      this.rotate(deltaX, deltaY)
      this.touchPreviousPositions = [{ x: touches[0].clientX, y: touches[0].clientY }]
    } else if (touches.length === 2 && this.isPanning) {
      const dx1 = touches[0].clientX - this.touchPreviousPositions[0].x
      const dy1 = touches[0].clientY - this.touchPreviousPositions[0].y
      const dx2 = touches[1].clientX - this.touchPreviousPositions[1].x
      const dy2 = touches[1].clientY - this.touchPreviousPositions[1].y

      const panDeltaX = (dx1 + dx2) / 2
      const panDeltaY = (dy1 + dy2) / 2
      this.pan(panDeltaX, panDeltaY)

      const currentPinchDistance = Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY,
      )

      if (this.touchPreviousPinchDistance > 0) {
        const pinchRatio = this.touchPreviousPinchDistance / currentPinchDistance
        this.zoom(pinchRatio)
      }

      this.touchPreviousPinchDistance = currentPinchDistance
      this.touchPreviousPositions = [
        { x: touches[0].clientX, y: touches[0].clientY },
        { x: touches[1].clientX, y: touches[1].clientY },
      ]
    }
  }

  private onTouchEnd(event: TouchEvent): void {
    this.isDragging = false
    this.isPanning = false
    this.touches.ONE = -1
    this.touches.TWO = -1
    this.touchPreviousPinchDistance = 0
    this.touchPreviousPositions = []
  }

  private rotate(deltaX: number, deltaY: number): void {
    const sensitivity = this.rotateSpeed * 0.005

    this.sphericalDelta.theta -= deltaX * sensitivity
    this.sphericalDelta.phi -= deltaY * sensitivity
  }

  private pan(deltaX: number, deltaY: number): void {
    const offset = this.camera.position.clone().sub(this.target)
    let targetDistance = offset.length()
    targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0)

    const panLeft = new THREE.Vector3()
    panLeft.setFromMatrixColumn(this.camera.matrix, 0)
    panLeft.multiplyScalar(-2 * deltaX * targetDistance / this.domElement.clientHeight)
    this.target.add(panLeft)

    const panUp = new THREE.Vector3()
    panUp.setFromMatrixColumn(this.camera.matrix, 1)
    panUp.multiplyScalar(2 * deltaY * targetDistance / this.domElement.clientHeight)
    this.target.add(panUp)

    this.target.y = Math.max(this.target.y, this.minTargetY)
  }

  private zoom(zoomFactor: number): void {
    this.spherical.radius *= zoomFactor
    this.spherical.radius = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.spherical.radius),
    )
  }

  public update(): void {
    this.spherical.theta += this.sphericalDelta.theta
    this.spherical.phi += this.sphericalDelta.phi

    this.spherical.phi = Math.max(
      0.1,
      Math.min(Math.PI - 0.1, this.spherical.phi),
    )

    this.sphericalDelta.theta *= 0.85
    this.sphericalDelta.phi *= 0.85

    const offset = new THREE.Vector3()
    offset.setFromSpherical(this.spherical)
    this.camera.position.copy(this.target).add(offset)

    this.clampCameraY()

    this.camera.lookAt(this.target)
  }

  private clampCameraY(): void {
    if (this.camera.position.y < this.minCameraY) {
      this.camera.position.y = this.minCameraY
      const newOffset = this.camera.position.clone().sub(this.target)
      this.spherical.setFromVector3(newOffset)
    }
  }

  public dispose(): void {
    this.domElement.removeEventListener('mousedown', this.boundOnMouseDown)
    this.domElement.removeEventListener('mousemove', this.boundOnMouseMove)
    this.domElement.removeEventListener('mouseup', this.boundOnMouseUp)
    this.domElement.removeEventListener('mouseleave', this.boundOnMouseLeave)
    this.domElement.removeEventListener('wheel', this.boundOnWheel)
    this.domElement.removeEventListener('touchstart', this.boundOnTouchStart)
    this.domElement.removeEventListener('touchmove', this.boundOnTouchMove)
    this.domElement.removeEventListener('touchend', this.boundOnTouchEnd)
  }

  public getTarget(): THREE.Vector3 {
    return this.target.clone()
  }

  public setTarget(target: THREE.Vector3): void {
    this.target.copy(target)
    this.target.y = Math.max(this.target.y, this.minTargetY)
    this.updateSphericalFromCamera()
  }
}
