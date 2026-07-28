import { ItemCategory } from '../lib/constants'

export interface PlacedItem {
  id: string
  itemKey: string
  position: [number, number, number]
  rotation: number
  scale: number
}

export interface RoomState {
  width: number
  height: number
  wallHeight: number
  floorTexture: string
  wallTexture: string
  wallsVisible: boolean
  smartWallsEnabled: boolean
  smartWallsSensitivity: number
  smartWallsTransitionSpeed: number
  smartWallsDebugMode: boolean
}

export interface DesignState {
  id: string
  name: string
  date: string
  room: RoomState
  items: PlacedItem[]
}

export interface ViewMode {
  type: '3d' | 'top-down' | 'isometric'
  label: string
}

export const VIEW_MODES: ViewMode[] = [
  { type: '3d', label: '3D View' },
  { type: 'top-down', label: 'Top Down' },
  { type: 'isometric', label: 'Isometric' }
]

export interface InteractionMode {
  type: 'select' | 'move' | 'rotate' | 'scale'
  label: string
}

export const INTERACTION_MODES: InteractionMode[] = [
  { type: 'select', label: 'Select' },
  { type: 'move', label: 'Move' },
  { type: 'rotate', label: 'Rotate' },
  { type: 'scale', label: 'Scale' }
]