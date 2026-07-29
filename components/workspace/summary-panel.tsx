'use client'

import { useState } from 'react'
import { useInteriorStore } from '@/lib/store'
import { ITEMS } from '@/lib/constants'
import { ModelThumbnail } from './model-thumbnail'

export function SummaryPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [rentClicked, setRentClicked] = useState(false)
  const room = useInteriorStore((state) => state.room)
  const placedItems = useInteriorStore((state) => state.placedItems)

  const itemsMap = new Map(ITEMS.map(i => [i.key, i]))
  const area = room.width * room.height
  const totalRent = placedItems.reduce((sum, pi) => {
    const item = itemsMap.get(pi.itemKey)
    return sum + (item?.weeklyRent ?? 0)
  }, 0)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 right-4 z-10 flex items-center h-11 px-4 bg-white border border-[var(--accent-blue-text)] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[var(--accent-blue-text)] transition-all"
        title="Rent Summary"
      >
        <svg className="w-5 h-5 text-[var(--accent-blue-text)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {placedItems.length > 0 && (
          <span className="ml-2 text-sm font-semibold text-[var(--accent-blue-text)]">${totalRent}/wk</span>
        )}
      </button>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] max-h-[80vh] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Rent Summary
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-[var(--muted)] flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {placedItems.length === 0 ? (
            <p className="text-sm text-[var(--muted)] text-center py-8">No items placed</p>
          ) : (
            <div className="space-y-2">
              {placedItems.map((pi) => {
                const item = itemsMap.get(pi.itemKey)
                if (!item) return null
                return (
                  <div
                    key={pi.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--border)] bg-white flex-shrink-0">
                      <ModelThumbnail modelUrl={item.model} name={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{item.name}</p>
                      <p className="text-xs text-[var(--muted)] capitalize">{item.category}</p>
                    </div>
                    <span className="text-sm font-medium text-[var(--accent-blue-text)] whitespace-nowrap">
                      ${item.weeklyRent}/wk
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[var(--border)] bg-white space-y-3">
          <button
            onClick={() => {
              setRentClicked(!rentClicked)
              if (!rentClicked) {
                setTimeout(() => setRentClicked(false), 2000)
              }
            }}
            className={`w-full py-2.5 rounded text-sm font-medium transition-all ${
              rentClicked
                ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border border-[var(--accent-green-text)]'
                : 'bg-[#111111] hover:bg-[#333333] text-white'
            }`}
          >
            {rentClicked ? '✓ Requested' : 'Rent Now'}
          </button>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[var(--foreground)]">{placedItems.length} items</span>
            <span className="font-semibold text-[var(--foreground)]">${totalRent}/wk</span>
          </div>
        </div>
      </div>
    </>
  )
}
