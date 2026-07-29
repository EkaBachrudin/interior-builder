'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Scene3D, ProceduralRoom } from '@/lib/blueprint3d'
import { useInteriorStore } from '@/lib/store'
import { ItemFactory } from '@/lib/furniture/item-factory'
import { PlacementSystem } from '@/lib/furniture/placement-system'
import { ManipulationControls } from '@/lib/furniture/manipulation-controls'
import { DoorWindowSystem } from '@/lib/furniture/door-window-system'
import * as THREE from 'three'
import { Item, ITEMS } from '@/lib/constants'
import { clampPositionToRoom } from '@/lib/blueprint3d/core/utils'

interface SceneInteractionProps {
  className?: string
  onObjectSelect?: (objectId: string | null) => void
  onObjectTransform?: (objectId: string, transform: { position: THREE.Vector3, rotation: number, scale: THREE.Vector3 }) => void
}

export function SceneInteraction({ className = '', onObjectSelect, onObjectTransform }: SceneInteractionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scene3DRef = useRef<Scene3D | null>(null)
  const roomRef = useRef<ProceduralRoom | null>(null)
  const initializationRef = useRef(false)
  
  // Furniture systems
  const itemFactoryRef = useRef<ItemFactory | null>(null)
  const placementSystemRef = useRef<PlacementSystem | null>(null)
  const manipulationControlsRef = useRef<ManipulationControls | null>(null)
  const doorWindowSystemRef = useRef<DoorWindowSystem | null>(null)
  
  // State
  const [isInitialized, setIsInitialized] = useState(false)
  const [isPlacing, setIsPlacing] = useState(false)
  const [placingItem, setPlacingItem] = useState<Item | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  // Store selectors
  const roomWidth = useInteriorStore((state) => state.room.width)
  const roomHeight = useInteriorStore((state) => state.room.height)
  const roomWallHeight = useInteriorStore((state) => state.room.wallHeight)
  const floorTexture = useInteriorStore((state) => state.room.floorTexture)
  const wallTexture = useInteriorStore((state) => state.room.wallTexture)
  const smartWallsEnabled = useInteriorStore((state) => state.room.smartWallsEnabled)
  const smartWallsSensitivity = useInteriorStore((state) => state.room.smartWallsSensitivity)
  const smartWallsTransitionSpeed = useInteriorStore((state) => state.room.smartWallsTransitionSpeed)
  const wireframeMode = useInteriorStore((state) => state.room.wireframeMode)
  const placedItems = useInteriorStore((state) => state.placedItems)
  const addItem = useInteriorStore((state) => state.addItem)
  const updateItem = useInteriorStore((state) => state.updateItem)
  const removeItem = useInteriorStore((state) => state.removeItem)
  const selectItem = useInteriorStore((state) => state.selectItem)
  const selectedItemId = useInteriorStore((state) => state.selectedItemId)

  // Initialize scene only once when container has proper dimensions
  useEffect(() => {
    if (initializationRef.current || !containerRef.current) return

    const container = containerRef.current
    
    // Function to initialize scene
    const initializeScene = () => {
      if (initializationRef.current || !containerRef.current) return

      try {
        // Check if container has valid dimensions
        const width = container.clientWidth
        const height = container.clientHeight
        
        if (width === 0 || height === 0) {
          console.warn('Container has invalid dimensions, waiting for resize...')
          return
        }

        // Initialize Scene3D
        const scene3D = new Scene3D(container)
        scene3DRef.current = scene3D

        // Create procedural room
        const proceduralRoom = new ProceduralRoom(scene3D.getScene(), {
          width: roomWidth,
          height: roomHeight,
          wallHeight: roomWallHeight,
          floorTexture: floorTexture || undefined,
          wallTexture: wallTexture || undefined
        })
        roomRef.current = proceduralRoom

        // Initialize furniture systems
        itemFactoryRef.current = new ItemFactory()
        placementSystemRef.current = new PlacementSystem(
          scene3D.getScene(),
          scene3D.getCamera()
        )
        
        manipulationControlsRef.current = new ManipulationControls(
          scene3D.getScene(),
          scene3D.getCamera(),
          scene3D.getRenderer(),
          scene3D.getRenderer().domElement
        )

        const placementSystem = placementSystemRef.current!
        const manipulationControls = manipulationControlsRef.current

        manipulationControls.setBoundsConstraint((pos, obj) => {
          const { width, height } = useInteriorStore.getState().room
          return clampPositionToRoom(pos, obj, width, height)
        })

        manipulationControls.setCollisionCheck((pos, obj) => {
          const objectId = obj.userData.itemId
          const excludeIds: string[] = [objectId]
          const placed = useInteriorStore.getState().placedItems.find(pi => pi.id === objectId)
          if (placed?.placedOnItemId) {
            excludeIds.push(placed.placedOnItemId)
          }
          return placementSystem.isPositionValid(pos, obj, excludeIds)
        })

        manipulationControls.setSnapToGrid(true, 10)

        doorWindowSystemRef.current = new DoorWindowSystem(
          scene3D.getScene(),
          scene3D.getCamera()
        )
        doorWindowSystemRef.current.registerWalls(roomWidth, roomHeight, roomWallHeight)

        // Setup manipulation callbacks
        manipulationControlsRef.current.onSelect((object) => {
          const objectId = object?.userData.itemId || null
          onObjectSelect?.(objectId)
          selectItem(objectId)
        })

        manipulationControlsRef.current.onTransform((object) => {
          const objectId = object.userData.itemId
          if (objectId && onObjectTransform) {
            onObjectTransform(objectId, {
              position: object.position.clone(),
              rotation: THREE.MathUtils.radToDeg(object.rotation.y),
              scale: object.scale.clone()
            })
            
            // Update store
            updateItem(objectId, {
              position: [object.position.x, object.position.y, object.position.z],
              rotation: THREE.MathUtils.radToDeg(object.rotation.y),
              scale: object.scale.x
            })

            // Update collision box while dragging
            if (placementSystemRef.current && !object.userData.isDoorWindow) {
              placementSystemRef.current.updateCollisionBox(objectId, object)
            }
          }
        })

        manipulationControlsRef.current.onDragStart(() => {
          scene3D.controls.enabled = false
        })

        manipulationControlsRef.current.onDragEnd(() => {
          scene3D.controls.enabled = true

          const obj = manipulationControlsRef.current?.getSelectedObject()
          if (obj?.userData.itemId && placementSystemRef.current && !obj.userData.isDoorWindow) {
            placementSystemRef.current.updateCollisionBox(obj.userData.itemId, obj)
          }
        })

        // Start animation
        scene3D.startAnimation()

        initializationRef.current = true
        setIsInitialized(true)
        
      } catch (error) {
        console.error('Failed to initialize scene interaction:', error)
      }
    }

    // Set up ResizeObserver to detect when container has proper dimensions
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0 && !initializationRef.current) {
          initializeScene()
        }
      }
    })

    // Start observing the container
    resizeObserver.observe(container)

    // Try immediate initialization if container already has dimensions
    initializeScene()

    return () => {
      resizeObserver.disconnect()
      
      if (manipulationControlsRef.current) {
        manipulationControlsRef.current.dispose()
      }
      if (doorWindowSystemRef.current) {
        doorWindowSystemRef.current.dispose()
      }
      if (placementSystemRef.current) {
        placementSystemRef.current.dispose()
      }
      if (itemFactoryRef.current) {
        itemFactoryRef.current.dispose()
      }
      if (roomRef.current) {
        roomRef.current.dispose()
      }
      if (scene3DRef.current) {
        scene3DRef.current.dispose()
      }
      initializationRef.current = false
      setIsInitialized(false)
    }
  }, []) // Empty dependency array - run only once

  // Preload models for any placedItems not yet cached (e.g. from saved designs)
  useEffect(() => {
    if (!isInitialized || !itemFactoryRef.current || placedItems.length === 0) return

    const ITEMS_MAP = new Map(ITEMS.map(item => [item.key, item]))
    const modelsToPreload = placedItems
      .map(pi => ITEMS_MAP.get(pi.itemKey))
      .filter((item): item is Item => item !== undefined && !itemFactoryRef.current!.isModelCached(item.model))

    if (modelsToPreload.length > 0) {
      Promise.all(modelsToPreload.map(item => itemFactoryRef.current!.loadModel(item)))
    }
  }, [isInitialized, placedItems.length])

  // Handle item placement from catalog
  const startItemPlacement = useCallback(async (item: Item) => {
    if (!itemFactoryRef.current) return

    setIsLoading(true)
    setLoadingProgress(0)

    try {
      const isDoorWindow = item.type === '7' || item.type === '3'

      if (isDoorWindow && doorWindowSystemRef.current) {
        const loadedModel = await itemFactoryRef.current.loadModel(item)
        const modelClone = itemFactoryRef.current.createModelClone(item.model)
        if (!modelClone) {
          throw new Error('Failed to create model clone')
        }
        doorWindowSystemRef.current.startPlacement(modelClone, 0, 0)
        setPlacingItem(item)
        setIsPlacing(true)
      } else if (placementSystemRef.current) {
        const loadedModel = await itemFactoryRef.current.loadModel(item)
        const modelClone = itemFactoryRef.current.createModelClone(item.model)
        if (!modelClone) {
          throw new Error('Failed to create model clone')
        }
        placementSystemRef.current.startPlacement(modelClone, item.placementType || 'floor')
        setPlacingItem(item)
        setIsPlacing(true)
      }

    } catch (error) {
      console.error('Failed to start item placement:', error)
    } finally {
      setIsLoading(false)
      setLoadingProgress(0)
    }
  }, [])

  // Cancel item placement
  const cancelItemPlacement = useCallback(() => {
    if (placementSystemRef.current) {
      placementSystemRef.current.stopPlacement()
    }
    if (doorWindowSystemRef.current) {
      doorWindowSystemRef.current.stopPlacementPreview()
    }
    setIsPlacing(false)
    setPlacingItem(null)
  }, [])

  // Confirm item placement
  const confirmItemPlacement = useCallback(() => {
    if (!placingItem) return

    const isDoorWindow = placingItem.type === '7' || placingItem.type === '3'
    const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    if (isDoorWindow && doorWindowSystemRef.current) {
      const factory = itemFactoryRef.current
      if (!factory) return
      const modelClone = factory.createModelClone(placingItem.model)
      if (!modelClone) return

      const result = doorWindowSystemRef.current.placeItem(
        modelClone,
        typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
        typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
        itemId
      )

      if (result && result.success) {
        addItem(placingItem, [
          result.position.x,
          result.position.y,
          result.position.z
        ], itemId)
      }
    } else if (placementSystemRef.current) {
      const result = placementSystemRef.current.placeModel(itemId)
      if (result && result.success && result.valid) {
        addItem(placingItem, [
          result.position.x,
          result.position.y,
          result.position.z
        ], itemId, result.placedOnItemId)
      }
    }

    cancelItemPlacement()
  }, [placingItem, addItem, cancelItemPlacement])

  // Handle mouse movement for placement preview
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isPlacing) return

    const isDoorWindow = placingItem?.type === '7' || placingItem?.type === '3'

    if (isDoorWindow && doorWindowSystemRef.current) {
      doorWindowSystemRef.current.updatePlacement(event.clientX, event.clientY)
    } else if (placementSystemRef.current) {
      placementSystemRef.current.updatePlacement(
        event.clientX,
        event.clientY,
        roomWidth,
        roomHeight
      )
    }
  }, [isPlacing, roomWidth, roomHeight, placingItem])

  // Handle mouse click for placement
  const handleClick = useCallback((event: MouseEvent) => {
    if (!isPlacing) return

    // Left click to place
    if (event.button === 0) {
      confirmItemPlacement()
    }
    // Right click to cancel
    else if (event.button === 2) {
      cancelItemPlacement()
    }
  }, [isPlacing, confirmItemPlacement, cancelItemPlacement])

  // Setup event listeners for placement
  useEffect(() => {
    if (!isPlacing) return

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleClick)
    window.addEventListener('contextmenu', (e) => e.preventDefault())

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleClick)
    }
  }, [isPlacing, handleMouseMove, handleClick])

  // Update room configuration
  useEffect(() => {
    if (!roomRef.current || !isInitialized) return

    try {
      roomRef.current.updateConfig({
        width: roomWidth,
        height: roomHeight,
        wallHeight: roomWallHeight,
        floorTexture: floorTexture || undefined,
        wallTexture: wallTexture || undefined
      })

      if (doorWindowSystemRef.current) {
        doorWindowSystemRef.current.registerWalls(roomWidth, roomHeight, roomWallHeight)
      }
    } catch (error) {
      console.error('Failed to update room:', error)
    }
  }, [roomWidth, roomHeight, roomWallHeight, floorTexture, wallTexture, isInitialized])

  // Initialize smart walls system
  useEffect(() => {
    if (!roomRef.current || !scene3DRef.current || !isInitialized) return

    try {
      console.log('Smart walls check - enabled:', smartWallsEnabled, 'initialized:', roomRef.current.isSmartWallsEnabled())
      
      if (smartWallsEnabled && !roomRef.current.isSmartWallsEnabled()) {
        console.log('Initializing smart walls with camera')
        // Initialize smart walls with camera
        roomRef.current.initializeSmartWalls(scene3DRef.current.getCamera(), {
          enabled: true,
          sensitivity: smartWallsSensitivity,
          transitionSpeed: smartWallsTransitionSpeed,
          debugMode: false
        })
        console.log('Smart walls initialized successfully')
      } else if (!smartWallsEnabled && roomRef.current.isSmartWallsEnabled()) {
        console.log('Disabling smart walls')
        // Disable smart walls
        roomRef.current.setSmartWallsEnabled(false)
      }
    } catch (error) {
      console.error('Failed to initialize smart walls:', error)
    }
  }, [smartWallsEnabled, isInitialized])

  // Update smart walls configuration
  useEffect(() => {
    if (!roomRef.current || !isInitialized || !smartWallsEnabled) return

    try {
      console.log('Updating smart walls config - sensitivity:', smartWallsSensitivity, 'speed:', smartWallsTransitionSpeed)
      roomRef.current.setSmartWallsConfig({
        sensitivity: smartWallsSensitivity,
        transitionSpeed: smartWallsTransitionSpeed
      })
    } catch (error) {
      console.error('Failed to update smart walls config:', error)
    }
  }, [smartWallsSensitivity, smartWallsTransitionSpeed, isInitialized, smartWallsEnabled])

  // Wireframe mode sync
  useEffect(() => {
    if (!scene3DRef.current || !isInitialized) return
    scene3DRef.current.setWireframeMode(wireframeMode)
  }, [wireframeMode, isInitialized])

  // Sync placed items from store to scene
  useEffect(() => {
    if (!isInitialized || !scene3DRef.current || !itemFactoryRef.current) return

    const scene = scene3DRef.current.getScene()
    const ITEMS_MAP = new Map(ITEMS.map(item => [item.key, item]))

    // Build map of existing furniture objects in scene
    const existingObjects = new Map<string, THREE.Object3D>()
    scene.traverse((object) => {
      if (object.userData.isFurniture && object.userData.itemId) {
        existingObjects.set(object.userData.itemId, object)
      }
    })

    const newIds = new Set<string>()

    placedItems.forEach((placedItem) => {
      const item = ITEMS_MAP.get(placedItem.itemKey)
      if (!item) return

      newIds.add(placedItem.id)

      if (existingObjects.has(placedItem.id)) {
        const obj = existingObjects.get(placedItem.id)!
        obj.position.set(...placedItem.position)
        obj.rotation.y = THREE.MathUtils.degToRad(placedItem.rotation)
      } else {
        const clone = itemFactoryRef.current!.createModelClone(item.model)
        if (clone) {
          clone.position.set(...placedItem.position)
          clone.rotation.y = THREE.MathUtils.degToRad(placedItem.rotation)
          clone.userData.isFurniture = true
          clone.userData.isDoorWindow = (item.type === '7' || item.type === '3')
          clone.userData.itemId = placedItem.id
          clone.userData.wallIndex = null
          scene.add(clone)

          if (placementSystemRef.current && !clone.userData.isDoorWindow) {
            placementSystemRef.current.registerCollisionBox(placedItem.id, clone)
          }

          if (clone.userData.isDoorWindow && doorWindowSystemRef.current) {
            doorWindowSystemRef.current.createOpeningForItem(
              new THREE.Vector3(...placedItem.position),
              THREE.MathUtils.degToRad(placedItem.rotation),
              placedItem.id
            )
          }
        }
      }
    })

    // Remove objects that are no longer in placedItems
    existingObjects.forEach((obj, id) => {
      if (!newIds.has(id)) {
        scene.remove(obj)
        if (placementSystemRef.current) {
          placementSystemRef.current.unregisterCollisionBox(id)
        }
        if (doorWindowSystemRef.current) {
          doorWindowSystemRef.current.removeWallOpening(id)
        }
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose()
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose())
            } else {
              child.material?.dispose()
            }
          }
        })
      }
    })

  }, [placedItems, isInitialized])

  // Handle selection from store
  useEffect(() => {
    if (!manipulationControlsRef.current || !scene3DRef.current) return

    const scene = scene3DRef.current.getScene()
    
    if (selectedItemId) {
      // Find the object with matching ID
      let selectedObject: THREE.Object3D | null = null
      scene.traverse((object) => {
        if (object.userData.itemId === selectedItemId) {
          selectedObject = object
        }
      })

      if (selectedObject) {
        manipulationControlsRef.current.selectObject(selectedObject)
      }
    } else {
      manipulationControlsRef.current.deselectObject()
    }
  }, [selectedItemId])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (scene3DRef.current) {
        scene3DRef.current.resize()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Expose placement functions and wall visibility to window object for catalog integration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).startItemPlacement = (item: Item) => {
        startItemPlacement(item)
      }
      (window as any).cancelItemPlacement = () => {
        cancelItemPlacement()
      }
      (window as any).confirmItemPlacement = () => {
        confirmItemPlacement()
      }
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).startItemPlacement
        delete (window as any).cancelItemPlacement
        delete (window as any).confirmItemPlacement
      }
    }
  }, [startItemPlacement, cancelItemPlacement, confirmItemPlacement])

  return (
    <div className="relative h-full">
      <div 
        ref={containerRef} 
        className={`w-full h-full ${className}`}
      />
      
      {/* Placement UI Overlay */}
      {isPlacing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-6 py-4 z-10">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {placingItem && placingItem.image ? (
                  <img src={placingItem.image} alt={placingItem.name} className="w-6 h-6 object-cover rounded" />
                ) : (
                  <span className="text-xs text-blue-600 font-medium">{placingItem?.name?.charAt(0) || '?'}</span>
                )}
              </div>
              <span className="font-medium text-gray-900">{placingItem?.name}</span>
            </div>
            
            <div className="h-6 w-px bg-gray-200" />
            
            <div className="text-sm text-gray-600">
              <span className="font-medium">Click</span> to place
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Right-click</span> to cancel
            </div>
            
            <div className="h-6 w-px bg-gray-200" />
            
            <button
              onClick={cancelItemPlacement}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Model</h3>
              <p className="text-sm text-gray-600">Please wait while we load the furniture model...</p>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${loadingProgress * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{Math.round(loadingProgress * 100)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}