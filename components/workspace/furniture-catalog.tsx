'use client'

import { useState, useMemo } from 'react'
import { ITEMS, Item, ItemCategory } from '@/lib/constants'
import { useInteriorStore } from '@/lib/store'
import { ModelThumbnail } from './model-thumbnail'

const CATEGORIES: ItemCategory[] = [
  'drawer', 
  'light',
  'table',
  'chair',
  'electronics',
  'decor'
]

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  drawer: 'Drawers',
  light: 'Lighting',
  table: 'Tables',
  chair: 'Chairs',
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
    <div className={`flex flex-col h-full bg-white border-r border-[var(--border)] transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Furniture</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
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
                className="w-full pl-10 pr-4 py-2 text-sm text-[var(--foreground)] bg-white border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-blue-text)] focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--muted)]"
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
                    ? 'bg-[var(--accent-blue-bg)] text-[var(--accent-blue-text)] font-medium'
                    : 'hover:bg-white text-[var(--muted)]'
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
                      ? 'bg-[var(--accent-blue-bg)] text-[var(--accent-blue-text)] font-medium'
                      : 'hover:bg-white text-[var(--muted)]'
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
            <div className="text-center py-8 text-[var(--muted)]">
              No items found
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleItemClick(item)}
                  className="group relative bg-white rounded-lg p-3 border border-[var(--border)] hover:bg-[var(--accent-blue-bg)] hover:border-[var(--accent-blue-text)] transition-all"
                >
                  <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden border border-[var(--border)]">
                    <ModelThumbnail modelUrl={item.model} name={item.name} />
                  </div>
                  <div className="text-sm font-medium text-[var(--foreground)] line-clamp-2">
                    {item.name}
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1 capitalize">
                    {item.category}
                  </div>
                  <div className="text-xs font-medium text-[var(--accent-blue-text)] mt-0.5">
                    ${item.weeklyRent}/wk
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