// Item categories
export type ItemCategory =  
  | 'drawer'
  | 'light'
  | 'table'
  | 'chair'
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
  weeklyRent: number
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
    targetMaxDimension: 50,
    weeklyRent: 5
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
    targetMaxDimension: 30,
    weeklyRent: 3
  },
  // Chairs
  {
    key: 'chairOne',
    name: 'Modern Chair',
    image: '',
    model: '/assets/chair-1.glb',
    type: '1',
    category: 'chair',
    weeklyRent: 12
  },
  {
    key: 'chairTwo',
    name: 'Accent Chair',
    image: '',
    model: '/assets/chair-2.glb',
    type: '1',
    category: 'chair',
    weeklyRent: 15
  },
  // Drawers
  {
    key: 'drawerOne',
    name: 'Minimalist Drawer',
    image: '',
    model: '/assets/furniture-1.glb',
    type: '1',
    category: 'drawer',
    weeklyRent: 20
  },
  // Tables
  {
    key: 'lTableOne',
    name: 'L-Shaped Desk',
    image: '',
    model: '/assets/L-table-1.glb',
    type: '1',
    category: 'table',
    weeklyRent: 35
  },
  {
    key: 'lTableTwo',
    name: 'Corner Table',
    image: '',
    model: '/assets/L-table-2.glb',
    type: '1',
    category: 'table',
    weeklyRent: 25
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
    targetMaxDimension: 120,
    weeklyRent: 18
  },
  {
    key: 'monitorUltrawide',
    name: 'Ultrawide Monitor',
    image: '',
    model: '/assets/ultrawide_monitor.glb',
    type: '1',
    category: 'electronics',
    placementType: 'surface',
    targetMaxDimension: 120,
    weeklyRent: 25
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
  },
    {
    name: 'Wooden Floor',
    thumbnail: '/assets/floor-textures/floor2.jpg',
    url: '/assets/floor-textures/floor2.jpg',
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
  },
   {
    name: 'Wall 4',
    thumbnail: '/assets/wall-textures/wall4.jpg',
    url: '/assets/wall-textures/wall4.jpg',
    stretch: false,
    scale: 300
  }
]


