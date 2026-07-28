export interface RoomConfig {
  width: number
  height: number
  wallHeight: number
  wallThickness: number
  floorTexture?: string
  wallTexture?: string
}

export interface RoomState {
  config: RoomConfig
  wallsVisible: boolean
  ceilingVisible: boolean
}

export const DEFAULT_ROOM_CONFIG: RoomConfig = {
  width: 4,
  height: 4,
  wallHeight: 250,
  wallThickness: 10
}