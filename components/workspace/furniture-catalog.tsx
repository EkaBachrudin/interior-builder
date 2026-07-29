'use client'

import { useState, useMemo } from 'react'
import { ITEMS, Item, ItemCategory } from '@/lib/constants'
import { useInteriorStore } from '@/lib/store'

const CATEGORIES: ItemCategory[] = [
  'bed',
  'drawer', 
  'wardrobe',
  'light',
  'storage',
  'table',
  'chair',
  'sofa',
  'armchair',
  'stool',
  'door',
  'window',
  'electronics',
  'decor'
]

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  bed: 'Beds',
  drawer: 'Drawers',
  wardrobe: 'Wardrobes',
  light: 'Lighting',
  storage: 'Storage',
  table: 'Tables',
  chair: 'Chairs',
  sofa: 'Sofas',
  armchair: 'Armchairs',
  stool: 'Stools',
  door: 'Doors',
  window: 'Windows',
  electronics: 'Electronics',
  decor: 'Decor'
}

export function FurnitureCatalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all')
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const addItem = useInteriorStore((state) => state.addItem)

  const filteredItems = useMemo(() => {
    return ITEMS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const categoriesWithCounts = useMemo(() => {
    return CATEGORIES.map(category => ({
      category,
      count: ITEMS.filter(item => item.category === category).length
    }))
  }, [])

  const handleItemClick = (item: Item) => {
    // Start placement mode for this item
    if (typeof window !== 'undefined' && (window as any).startItemPlacement) {
      (window as any).startItemPlacement(item)
    }
  }

  return (
    <div className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900">Furniture</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isCollapsed ? 'Expand catalog' : 'Collapse catalog'}
          >
            {isCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        {!isCollapsed && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Categories */}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                All Items ({ITEMS.length})
              </button>
              {categoriesWithCounts.map(({ category, count }) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {CATEGORY_LABELS[category]} ({count})
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Items Grid */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items found
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleItemClick(item)}
                  className="group relative bg-gray-50 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all"
                >
                  <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden border border-gray-200">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center p-2">
                        {item.name}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 capitalize">
                    {item.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}