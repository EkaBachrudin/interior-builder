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

  // Initialize smart walls (always enabled)
  useEffect(() => {
    if (!roomRef.current || !scene3DRef.current || !isInitialized) return

    try {
      roomRef.current.initializeSmartWalls(scene3DRef.current.getCamera())
    } catch (error) {
      console.error('Failed to initialize smart walls:', error)
    }
  }, [isInitialized])

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