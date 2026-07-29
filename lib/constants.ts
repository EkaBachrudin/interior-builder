// Item categories
export type ItemCategory =
  | 'bed'
  | 'drawer'
  | 'wardrobe'
  | 'light'
  | 'storage'
  | 'table'
  | 'chair'
  | 'sofa'
  | 'armchair'
  | 'stool'
  | 'door'
  | 'window'
  | 'electronics'
  | 'decor'

export type FurniturePlacement = 'floor' | 'surface'

export interface Item {
  key: string
  name: string
  image: string
  model: string
  type: string
  category: ItemCategory
  description?: string
  placementType?: FurniturePlacement
  targetMaxDimension?: number
}

// Items data
export const ITEMS: Item[] = [
  // Lighting
  {
    key: 'lampOne',
    name: 'Desk Lamp',
    image: '',
    model: '/assets/accessories-lamp-1.glb',
    type: '1',
    category: 'light',
    placementType: 'surface',
    targetMaxDimension: 50
  },
  // Decor
  {
    key: 'plantOne',
    name: 'Potted Plant',
    image: '',
    model: '/assets/accessories-plant-1.glb',
    type: '1',
    category: 'decor',
    placementType: 'surface',
    targetMaxDimension: 30
  },
  // Chairs
  {
    key: 'chairOne',
    name: 'Modern Chair',
    image: '',
    model: '/assets/chair-1.glb',
    type: '1',
    category: 'chair'
  },
  {
    key: 'chairTwo',
    name: 'Accent Chair',
    image: '',
    model: '/assets/chair-2.glb',
    type: '1',
    category: 'chair'
  },
  // Drawers
  {
    key: 'drawerOne',
    name: 'Minimalist Drawer',
    image: '',
    model: '/assets/furniture-1.glb',
    type: '1',
    category: 'drawer'
  },
  // Tables
  {
    key: 'lTableOne',
    name: 'L-Shaped Desk',
    image: '',
    model: '/assets/L-table-1.glb',
    type: '1',
    category: 'table'
  },
  {
    key: 'lTableTwo',
    name: 'Corner Table',
    image: '',
    model: '/assets/L-table-2.glb',
    type: '1',
    category: 'table'
  },
  // Electronics
  {
    key: 'monitorOne',
    name: 'Monitor',
    image: '',
    model: '/assets/monitor-1.glb',
    type: '1',
    category: 'electronics',
    placementType: 'surface',
    targetMaxDimension: 120
  },
  {
    key: 'monitorUltrawide',
    name: 'Ultrawide Monitor',
    image: '',
    model: '/assets/ultrawide_monitor.glb',
    type: '1',
    category: 'electronics',
    placementType: 'surface',
    targetMaxDimension: 120
  }
]

// Floor textures
export const FLOOR_TEXTURES = [
  {
    name: 'Default Floor',
    thumbnail: '/assets/floor-textures/floor1.jpg',
    url: '/assets/floor-textures/floor1.jpg',
    stretch: false,
    scale: 300
  }
]

// Wall textures
export const WALL_TEXTURES = [
  {
    name: 'Wall 1',
    thumbnail: '/assets/wall-textures/wall1.jpg',
    url: '/assets/wall-textures/wall1.jpg',
    stretch: false,
    scale: 300
  },
  {
    name: 'Wall 2',
    thumbnail: '/assets/wall-textures/wall2.png',
    url: '/assets/wall-textures/wall2.png',
    stretch: false,
    scale: 300
  },
  {
    name: 'Wall 3',
    thumbnail: '/assets/wall-textures/wall3.jpg',
    url: '/assets/wall-textures/wall3.jpg',
    stretch: false,
    scale: 300
  }
]

export interface RoomPreset {
  name: string
  width: number
  height: number
  wallHeight: number
  floorTexture: string
  wallTexture: string
}

export const ROOM_PRESETS: RoomPreset[] = [
  {
    name: 'Custom',
    width: 4,
    height: 4,
    wallHeight: 250,
    floorTexture: '',
    wallTexture: ''
  },
  {
    name: 'Small Bedroom',
    width: 3,
    height: 3,
    wallHeight: 250,
    floorTexture: '',
    wallTexture: ''
  },
  {
    name: 'Master Bedroom',
    width: 4,
    height: 5,
    wallHeight: 260,
    floorTexture: FLOOR_TEXTURES[0]?.url || '',
    wallTexture: ''
  },
  {
    name: 'Living Room',
    width: 5,
    height: 6,
    wallHeight: 250,
    floorTexture: FLOOR_TEXTURES[0]?.url || '',
    wallTexture: ''
  },
  {
    name: 'Studio Apartment',
    width: 6,
    height: 6,
    wallHeight: 260,
    floorTexture: FLOOR_TEXTURES[0]?.url || '',
    wallTexture: WALL_TEXTURES[0]?.url || ''
  },
  {
    name: 'Kitchen',
    width: 3,
    height: 4,
    wallHeight: 250,
    floorTexture: '',
    wallTexture: WALL_TEXTURES[2]?.url || ''
  },
  {
    name: 'Home Office',
    width: 3,
    height: 3.5,
    wallHeight: 250,
    floorTexture: '',
    wallTexture: ''
  },
  {
    name: 'Kids Room',
    width: 3.5,
    height: 4,
    wallHeight: 250,
    floorTexture: '',
    wallTexture: WALL_TEXTURES[1]?.url || ''
  }
]
