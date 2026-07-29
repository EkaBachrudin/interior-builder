'use client'

import { SceneInteraction } from '@/components/workspace/scene-interaction'
import { FurnitureCatalog } from '@/components/workspace/furniture-catalog'
import { RoomControls } from '@/components/workspace/room-controls'
import { ItemProperties } from '@/components/workspace/item-properties'
import { SummaryPanel } from '@/components/workspace/summary-panel'
import { useState } from 'react'
import { useInteriorStore } from '@/lib/store'

export default function WorkspacePage() {
  const [showCatalog, setShowCatalog] = useState(true)
  const [showProperties, setShowProperties] = useState(true)
  const [showRoomSettings, setShowRoomSettings] = useState(false)
  
  const selectItem = useInteriorStore((state) => state.selectItem)
  const undo = useInteriorStore((state) => state.undo)
  const redo = useInteriorStore((state) => state.redo)

  const handleObjectSelect = (objectId: string | null) => {
    selectItem(objectId)
  }

  const handleObjectTransform = (objectId: string, transform: { position: any, rotation: number, scale: any }) => {
    // Transform updates are handled by the store in the component
    console.log('Object transformed:', objectId, transform)
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Ruang</h1>
            <p className="text-sm text-[var(--muted)] mt-1">Design your workspace</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCatalog(!showCatalog)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                showCatalog
                  ? 'bg-[var(--accent-blue-bg)] text-[var(--accent-blue-text)] border border-[var(--accent-blue-text)]'
                  : 'bg-white text-[var(--muted)] hover:bg-[var(--canvas)] border border-[var(--border)]'
              }`}
            >
              {showCatalog ? 'Hide Catalog' : 'Show Catalog'}
            </button>
            
            <button
              onClick={() => setShowProperties(!showProperties)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                showProperties
                  ? 'bg-[var(--accent-blue-bg)] text-[var(--accent-blue-text)] border border-[var(--accent-blue-text)]'
                  : 'bg-white text-[var(--muted)] hover:bg-[var(--canvas)] border border-[var(--border)]'
              }`}
            >
              {showProperties ? 'Hide Properties' : 'Show Properties'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar - Furniture Catalog */}
        {showCatalog && (
          <aside className="flex-shrink-0 z-10">
            <FurnitureCatalog />
          </aside>
        )}

        {/* Center - 3D Canvas */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 relative min-h-0">
            <SceneInteraction 
              className="absolute inset-0"
              onObjectSelect={handleObjectSelect}
              onObjectTransform={handleObjectTransform}
            />
            
            {/* Room Settings Toggle */}
            {showRoomSettings ? (
              <div className="absolute top-4 left-4 z-10 w-72 bg-white border border-[var(--border)] rounded-lg p-4 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">
                    Room Settings
                  </h3>
                  <button
                    onClick={() => setShowRoomSettings(false)}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-white text-[var(--muted)]"
                  >
                    ✕
                  </button>
                </div>
                <RoomControls />
              </div>
            ) : (
              <button
                onClick={() => setShowRoomSettings(true)}
                className="absolute top-4 left-4 z-10 w-10 h-10 bg-white border border-[var(--border)] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center hover:bg-white transition-colors"
                title="Room Settings"
              >
                <svg className="w-5 h-5 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            )}
            {/* Undo / Redo */}
            <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
              <button
                onClick={undo}
                className="w-10 h-10 bg-white border border-[var(--border)] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center hover:bg-white transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={redo}
                className="w-10 h-10 bg-white border border-[var(--border)] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center hover:bg-white transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>

            {/* Summary Panel */}
            <SummaryPanel />

          </div>

        </main>

        {/* Right Sidebar - Properties */}
        {showProperties && (
          <aside className="w-80 flex-shrink-0 overflow-y-auto p-4 border-l border-[var(--border)] bg-white">
            <ItemProperties />
          </aside>
        )}
      </div>
    </div>
  )
}