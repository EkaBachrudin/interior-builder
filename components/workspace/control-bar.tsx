'use client'

import { useInteriorStore } from '@/lib/store'
import { VIEW_MODES, INTERACTION_MODES } from '@/types'

export function ControlBar() {
  const currentViewMode = useInteriorStore((state) => state.currentViewMode)
  const currentInteractionMode = useInteriorStore((state) => state.currentInteractionMode)
  const setViewMode = useInteriorStore((state) => state.setViewMode)
  const setInteractionMode = useInteriorStore((state) => state.setInteractionMode)
  const undo = useInteriorStore((state) => state.undo)
  const redo = useInteriorStore((state) => state.redo)

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: History Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={undo}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={redo}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>

        {/* Center: View Modes */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.type}
              onClick={() => setViewMode(mode.type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currentViewMode === mode.type
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Right: Interaction Modes */}
        <div className="flex items-center space-x-1">
          {INTERACTION_MODES.map((mode) => (
            <button
              key={mode.type}
              onClick={() => setInteractionMode(mode.type)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                currentInteractionMode === mode.type
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title={mode.label}
            >
              {getInteractionIcon(mode.type)}
              <span className="text-sm font-medium">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function getInteractionIcon(mode: string) {
  switch (mode) {
    case 'select':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )
    case 'move':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      )
    case 'rotate':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    case 'scale':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      )
    default:
      return null
  }
}