'use client'

import { useInteriorStore } from '@/lib/store'
import { FLOOR_TEXTURES, WALL_TEXTURES, ROOM_PRESETS } from '@/lib/constants'

const WALL_LABELS = ['Back Wall', 'Front Wall', 'Left Wall', 'Right Wall']

export function RoomControls() {
  const room = useInteriorStore((state) => state.room)
  const updateRoom = useInteriorStore((state) => state.updateRoom)

  const handleDimensionChange = (field: 'width' | 'height' | 'wallHeight', value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      updateRoom({ [field]: numValue })
    }
  }

  const handlePresetSelect = (presetName: string) => {
    const preset = ROOM_PRESETS.find(p => p.name === presetName)
    if (!preset) return
    updateRoom({
      width: preset.width,
      height: preset.height,
      wallHeight: preset.wallHeight,
      floorTexture: preset.floorTexture,
      wallTexture: preset.wallTexture,
      presetName: preset.name
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        Room Settings
      </h3>

      {/* Room Presets */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Room Preset
        </label>
        <select
          value={room.presetName}
          onChange={(e) => handlePresetSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {ROOM_PRESETS.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name} ({preset.width}m &times; {preset.height}m)
            </option>
          ))}
        </select>
      </div>

      {/* Dimensions */}
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

      {/* Wall Visibility Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <span className="text-sm font-medium text-gray-700">Show Walls</span>
        <button
          onClick={() => updateRoom({ wallsVisible: !room.wallsVisible })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            room.wallsVisible ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              room.wallsVisible ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Individual Wall Visibility */}
      {room.wallsVisible && (
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <span className="text-xs font-medium text-gray-500 uppercase">Individual Walls</span>
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-600">{WALL_LABELS[index]}</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).setWallVisibility) {
                      (window as any).setWallVisibility(index, true)
                    }
                  }}
                  className="px-2 py-0.5 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100"
                >
                  Show
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).setWallVisibility) {
                      (window as any).setWallVisibility(index, false)
                    }
                  }}
                  className="px-2 py-0.5 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Hide
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Smart Walls Section */}
      {room.wallsVisible && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Smart Wall Hide</span>
              <p className="text-xs text-gray-500 mt-1">
                Automatically hide walls that block your view
              </p>
            </div>
            <button
              onClick={() => updateRoom({ smartWallsEnabled: !room.smartWallsEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                room.smartWallsEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  room.smartWallsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {room.smartWallsEnabled && (
            <div className="space-y-3 pl-2 border-l-2 border-blue-200">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-700">
                    Sensitivity
                  </label>
                  <span className="text-xs text-gray-500">
                    {Math.round(room.smartWallsSensitivity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={room.smartWallsSensitivity}
                  onChange={(e) => updateRoom({ smartWallsSensitivity: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Higher = walls hide more easily
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-700">
                    Transition Speed
                  </label>
                  <span className="text-xs text-gray-500">
                    {room.smartWallsTransitionSpeed}ms
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="100"
                  value={room.smartWallsTransitionSpeed}
                  onChange={(e) => updateRoom({ smartWallsTransitionSpeed: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-gray-400 mt-1">
                  How fast walls fade in/out
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
