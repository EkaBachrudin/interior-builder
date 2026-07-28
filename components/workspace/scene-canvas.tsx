'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Scene3D, ProceduralRoom } from '@/lib/blueprint3d'
import { useInteriorStore } from '@/lib/store'

interface SceneCanvasProps {
  className?: string
}

export function SceneCanvas({ className = '' }: SceneCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scene3DRef = useRef<Scene3D | null>(null)
  const roomRef = useRef<ProceduralRoom | null>(null)
  const initializationRef = useRef(false)
  
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use individual selectors to prevent unnecessary re-renders
  const roomWidth = useInteriorStore((state) => state.room.width)
  const roomHeight = useInteriorStore((state) => state.room.height)
  const roomWallHeight = useInteriorStore((state) => state.room.wallHeight)
  const floorTexture = useInteriorStore((state) => state.room.floorTexture)
  const wallTexture = useInteriorStore((state) => state.room.wallTexture)
  const wallsVisible = useInteriorStore((state) => state.room.wallsVisible)
  const smartWallsEnabled = useInteriorStore((state) => state.room.smartWallsEnabled)
  const smartWallsSensitivity = useInteriorStore((state) => state.room.smartWallsSensitivity)
  const smartWallsTransitionSpeed = useInteriorStore((state) => state.room.smartWallsTransitionSpeed)
  const placedItems = useInteriorStore((state) => state.placedItems)

  // Initialize scene only once
  useEffect(() => {
    if (initializationRef.current || !containerRef.current) return

    try {
      // Initialize Scene3D
      const scene3D = new Scene3D(containerRef.current)
      scene3DRef.current = scene3D

      // Create procedural room with initial config
      const proceduralRoom = new ProceduralRoom(scene3D.getScene(), {
        width: roomWidth,
        height: roomHeight,
        wallHeight: roomWallHeight,
        floorTexture: floorTexture || undefined,
        wallTexture: wallTexture || undefined
      })
      roomRef.current = proceduralRoom

      // Start animation
      scene3D.startAnimation()

      initializationRef.current = true
      setIsInitialized(true)
      
    } catch (error) {
      console.error('Failed to initialize 3D scene:', error)
    }

    // Cleanup function
    return () => {
      if (roomRef.current) {
        roomRef.current.dispose()
        roomRef.current = null
      }
      if (scene3DRef.current) {
        scene3DRef.current.dispose()
        scene3DRef.current = null
      }
      initializationRef.current = false
      setIsInitialized(false)
    }
  }, []) // Empty dependency array - run only once

  // Update room dimensions and textures
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
    } catch (error) {
      console.error('Failed to update room:', error)
    }
  }, [roomWidth, roomHeight, roomWallHeight, floorTexture, wallTexture, isInitialized])

  // Initialize smart walls system
  useEffect(() => {
    if (!roomRef.current || !scene3DRef.current || !isInitialized) return

    try {
      if (smartWallsEnabled && !roomRef.current.isSmartWallsEnabled()) {
        // Initialize smart walls with camera
        roomRef.current.initializeSmartWalls(scene3DRef.current.getCamera(), {
          enabled: true,
          sensitivity: smartWallsSensitivity,
          transitionSpeed: smartWallsTransitionSpeed,
          debugMode: false
        })
      } else if (!smartWallsEnabled && roomRef.current.isSmartWallsEnabled()) {
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
      roomRef.current.setSmartWallsConfig({
        sensitivity: smartWallsSensitivity,
        transitionSpeed: smartWallsTransitionSpeed
      })
    } catch (error) {
      console.error('Failed to update smart walls config:', error)
    }
  }, [smartWallsSensitivity, smartWallsTransitionSpeed, isInitialized, smartWallsEnabled])

  // Update wall visibility
  useEffect(() => {
    if (!roomRef.current || !isInitialized) return

    try {
      roomRef.current.setWallsVisibility(wallsVisible)
    } catch (error) {
      console.error('Failed to update wall visibility:', error)
    }
  }, [wallsVisible, isInitialized])

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

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  )
}