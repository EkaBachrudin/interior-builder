'use client'

import { useInteriorStore } from '@/lib/store'
import { FLOOR_TEXTURES, WALL_TEXTURES } from '@/lib/constants'

export function RoomControls() {
  const room = useInteriorStore((state) => state.room)
  const updateRoom = useInteriorStore((state) => state.updateRoom)

  const handleDimensionChange = (field: 'width' | 'height' | 'wallHeight', value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      updateRoom({ [field]: numValue })
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Width (m)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="20"
              value={room.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Length (m)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="20"
              value={room.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Wall Height (cm)
          </label>
          <input
            type="number"
            step="10"
            min="200"
            max="400"
            value={room.wallHeight}
            onChange={(e) => handleDimensionChange('wallHeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Floor Texture */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Floor Texture
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => updateRoom({ floorTexture: '' })}
            className={`aspect-square rounded-lg border-2 transition-all ${
              !room.floorTexture
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-full h-full bg-gray-100 rounded" />
          </button>
          {FLOOR_TEXTURES.map((texture) => (
            <button
              key={texture.name}
              onClick={() => updateRoom({ floorTexture: texture.url })}
              className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                room.floorTexture === texture.url
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={texture.thumbnail}
                alt={texture.name}
                className="w-full h-full object-cover"
                title={texture.name}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Wall Texture */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Wall Texture
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => updateRoom({ wallTexture: '' })}
            className={`aspect-square rounded-lg border-2 transition-all ${
              !room.wallTexture
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-full h-full bg-gray-50 rounded" />
          </button>
          {WALL_TEXTURES.map((texture) => (
            <button
              key={texture.name}
              onClick={() => updateRoom({ wallTexture: texture.url })}
              className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                room.wallTexture === texture.url
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={texture.thumbnail}
                alt={texture.name}
                className="w-full h-full object-cover"
                title={texture.name}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Wireframe Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div>
          <span className="text-sm font-medium text-gray-700">Wireframe Mode</span>
          <p className="text-xs text-gray-500">Show scene as wireframe</p>
        </div>
        <button
          onClick={() => updateRoom({ wireframeMode: !room.wireframeMode })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            room.wireframeMode ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              room.wireframeMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

    </div>
  )
}
