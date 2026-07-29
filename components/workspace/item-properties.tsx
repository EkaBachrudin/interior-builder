'use client'

import { useInteriorStore } from '@/lib/store'
import { ITEMS } from '@/lib/constants'
import { useState, useEffect, useMemo } from 'react'

export function ItemProperties() {
  const selectedItemId = useInteriorStore((state) => state.selectedItemId)
  const placedItems = useInteriorStore((state) => state.placedItems)
  const updateItem = useInteriorStore((state) => state.updateItem)
  const removeItem = useInteriorStore((state) => state.removeItem)

  // Use useMemo to prevent unnecessary recalculations
  const selectedItem = useMemo(() => {
    return placedItems.find(item => item.id === selectedItemId) || null
  }, [placedItems, selectedItemId])
  
  const itemData = useMemo(() => {
    return selectedItem ? ITEMS.find(item => item.key === selectedItem.itemKey) || null : null
  }, [selectedItem])

  const [localPosition, setLocalPosition] = useState([0, 0, 0])
  const [localRotation, setLocalRotation] = useState(0)

  useEffect(() => {
    if (selectedItem) {
      setLocalPosition(selectedItem.position)
      setLocalRotation(selectedItem.rotation)
    } else {
      setLocalPosition([0, 0, 0])
      setLocalRotation(0)
    }
  }, [selectedItemId, selectedItem?.position, selectedItem?.rotation])

  const handlePositionChange = (index: number, value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      const newPosition = [...localPosition] as [number, number, number]
      newPosition[index] = numValue
      setLocalPosition(newPosition)
      updateItem(selectedItemId!, { position: newPosition })
    }
  }

  const handleRotationChange = (value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      setLocalRotation(numValue)
      updateItem(selectedItemId!, { rotation: numValue })
    }
  }

  const handleDelete = () => {
    if (selectedItemId && confirm('Are you sure you want to remove this item?')) {
      removeItem(selectedItemId)
    }
  }

  if (!selectedItem || !itemData) {
    return (
      <div className="bg-white border border-[var(--border)] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide mb-3">
          Properties
        </h3>
        <p className="text-sm text-[var(--muted)] text-center py-8">
          Select an item to view its properties
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[var(--border)] rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">
            Properties
          </h3>
          <h4 className="text-lg font-medium text-[var(--foreground)] mt-1 truncate">
            {itemData.name}
          </h4>
          <p className="text-sm text-[var(--muted)] capitalize mt-1">
            {itemData.category}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="ml-2 p-2 text-[var(--accent-red-text)] hover:bg-[var(--accent-red-bg)] rounded-lg transition-colors"
          title="Delete item"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Description */}
      {itemData.description && (
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          {itemData.description}
        </p>
      )}

      {/* Position */}
      <div>
        <label className="block text-xs font-medium text-[var(--foreground)] mb-2">
          Position
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['X', 'Y', 'Z'].map((axis, index) => (
            <div key={axis}>
              <label className="block text-xs text-[var(--muted)] mb-1">{axis}</label>
              <input
                type="number"
                step="1"
                value={localPosition[index]}
                onChange={(e) => handlePositionChange(index, e.target.value)}
                className="w-full px-2 py-1.5 text-sm text-[var(--foreground)] bg-white border border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--accent-blue-text)] focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rotation */}
      <div>
        <label className="block text-xs font-medium text-[var(--foreground)] mb-2">
          Rotation (degrees)
        </label>
        <input
          type="number"
          step="15"
          value={localRotation}
          onChange={(e) => handleRotationChange(e.target.value)}
          className="w-full px-3 py-2 text-sm text-[var(--foreground)] bg-white border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-blue-text)] focus:border-transparent"
        />
        <div className="flex space-x-2 mt-2">
          {[-90, -45, 0, 45, 90].map((angle) => (
            <button
              key={angle}
              onClick={() => handleRotationChange(angle.toString())}
              className="px-3 py-1 text-sm text-[var(--muted)] bg-white hover:bg-[var(--canvas)] border border-[var(--border)] rounded transition-colors"
            >
              {angle}°
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}