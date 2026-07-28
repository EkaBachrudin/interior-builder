'use client'

import { SceneInteraction } from '@/components/workspace/scene-interaction'
import { FurnitureCatalog } from '@/components/workspace/furniture-catalog'
import { RoomControls } from '@/components/workspace/room-controls'
import { ControlBar } from '@/components/workspace/control-bar'
import { ItemProperties } from '@/components/workspace/item-properties'
import { useState } from 'react'
import { useInteriorStore } from '@/lib/store'

export default function WorkspacePage() {
  const [showCatalog, setShowCatalog] = useState(true)
  const [showProperties, setShowProperties] = useState(true)
  
  const selectItem = useInteriorStore((state) => state.selectItem)

  const handleObjectSelect = (objectId: string | null) => {
    selectItem(objectId)
  }

  const handleObjectTransform = (objectId: string, transform: { position: any, rotation: number, scale: any }) => {
    // Transform updates are handled by the store in the component
    console.log('Object transformed:', objectId, transform)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interior Builder</h1>
            <p className="text-sm text-gray-500 mt-1">Design your perfect space</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCatalog(!showCatalog)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showCatalog
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showCatalog ? 'Hide Catalog' : 'Show Catalog'}
            </button>
            
            <button
              onClick={() => setShowProperties(!showProperties)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showProperties
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            
            {/* Room Controls Overlay */}
            <div className="absolute top-4 left-4 z-10 w-72">
              <RoomControls />
            </div>
          </div>

          {/* Bottom Control Bar */}
          <ControlBar />
        </main>

        {/* Right Sidebar - Properties */}
        {showProperties && (
          <aside className="w-80 flex-shrink-0 overflow-y-auto p-4 border-l border-gray-200 bg-white">
            <ItemProperties />
          </aside>
        )}
      </div>
    </div>
  )
}