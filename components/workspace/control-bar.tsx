'use client'

import { useInteriorStore } from '@/lib/store'

export function ControlBar() {
  const undo = useInteriorStore((state) => state.undo)
  const redo = useInteriorStore((state) => state.redo)

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
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
      </div>
    </div>
  )
}
