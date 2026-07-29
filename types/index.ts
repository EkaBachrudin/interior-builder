import { ItemCategory } from '../lib/constants'

export interface PlacedItem {
  id: string
  itemKey: string
  position: [number, number, number]
  rotation: number
  scale: number
  placedOnItemId?: string
}

export interface RoomState {
  width: number
  height: number
  wallHeight: number
  floorTexture: string
  wallTexture: string
  ceilingVisible: boolean
  wireframeMode: boolean
}

export interface DesignState {
  id: string
  name: string
  date: string
  room: RoomState
  items: PlacedItem[]
}

