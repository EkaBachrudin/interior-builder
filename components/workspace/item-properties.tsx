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
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
          Properties
        </h3>
        <p className="text-sm text-gray-500 text-center py-8">
          Select an item to view its properties
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Properties
          </h3>
          <h4 className="text-lg font-medium text-gray-900 mt-1 truncate">
            {itemData.name}
          </h4>
          <p className="text-sm text-gray-500 capitalize mt-1">
            {itemData.category}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete item"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Description */}
      {itemData.description && (
        <p className="text-sm text-gray-600 leading-relaxed">
          {itemData.description}
        </p>
      )}

      {/* Position */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Position
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['X', 'Y', 'Z'].map((axis, index) => (
            <div key={axis}>
              <label className="block text-xs text-gray-500 mb-1">{axis}</label>
              <input
                type="number"
                step="1"
                value={localPosition[index]}
                onChange={(e) => handlePositionChange(index, e.target.value)}
                className="w-full px-2 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rotation */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Rotation (degrees)
        </label>
        <input
          type="number"
          step="15"
          value={localRotation}
          onChange={(e) => handleRotationChange(e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex space-x-2 mt-2">
          {[-90, -45, 0, 45, 90].map((angle) => (
            <button
              key={angle}
              onClick={() => handleRotationChange(angle.toString())}
              className="px-3 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              {angle}°
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}