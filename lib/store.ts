import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Item } from './constants'
import { PlacedItem, RoomState, DesignState, ViewMode, InteractionMode } from '../types'

interface InteriorStore {
  // Room state
  room: RoomState
  updateRoom: (updates: Partial<RoomState>) => void
  
  // Items
  placedItems: PlacedItem[]
  addItem: (item: Item, position: [number, number, number], itemId?: string, placedOnItemId?: string) => void
  removeItem: (itemId: string) => void
  updateItem: (itemId: string, updates: Partial<PlacedItem>) => void
  clearItems: () => void
  
  // Selection
  selectedItemId: string | null
  selectItem: (itemId: string | null) => void
  
  // UI state
  currentViewMode: ViewMode['type']
  setViewMode: (mode: ViewMode['type']) => void
  
  currentInteractionMode: InteractionMode['type']
  setInteractionMode: (mode: InteractionMode['type']) => void
  
  // Design management
  savedDesigns: DesignState[]
  saveDesign: (name: string) => void
  loadDesign: (designId: string) => void
  deleteDesign: (designId: string) => void
  
  // History
  history: DesignState[]
  historyIndex: number
  undo: () => void
  redo: () => void
  addToHistory: () => void
  
  // Helpers
  reset: () => void
  getCurrentDesign: () => DesignState
}

const initialState = {
  room: {
    width: 4,
    height: 4,
    wallHeight: 250,
    floorTexture: '',
    wallTexture: '',
    wallsVisible: true,
    ceilingVisible: false,
    wireframeMode: false,
    smartWallsEnabled: true,
    smartWallsSensitivity: 0.5,
    smartWallsTransitionSpeed: 300,
    smartWallsDebugMode: false,
    presetName: 'Custom'
  },
  placedItems: [],
  selectedItemId: null,
  currentViewMode: '3d' as const,
  currentInteractionMode: 'select' as const,
  savedDesigns: [],
  history: [],
  historyIndex: -1
}

export const useInteriorStore = create<InteriorStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateRoom: (updates) => {
        set((state) => ({
          room: { ...state.room, ...updates }
        }))
        get().addToHistory()
      },

      addItem: (item, position, itemId?, placedOnItemId?) => {
        const id = itemId || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newItem: PlacedItem = {
          id,
          itemKey: item.key,
          position,
          rotation: 0,
          scale: 1,
          placedOnItemId
        }
        
        set((state) => ({
          placedItems: [...state.placedItems, newItem]
        }))
        get().addToHistory()
      },

      removeItem: (itemId) => {
        set((state) => ({
          placedItems: state.placedItems.filter(item => item.id !== itemId),
          selectedItemId: state.selectedItemId === itemId ? null : state.selectedItemId
        }))
        get().addToHistory()
      },

      updateItem: (itemId, updates) => {
        set((state) => ({
          placedItems: state.placedItems.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          )
        }))
      },

      clearItems: () => {
        set({ placedItems: [], selectedItemId: null })
        get().addToHistory()
      },

      selectItem: (itemId) => {
        set({ selectedItemId: itemId })
      },

      setViewMode: (mode) => {
        set({ currentViewMode: mode })
      },

      setInteractionMode: (mode) => {
        set({ currentInteractionMode: mode })
      },

      saveDesign: (name) => {
        const design = get().getCurrentDesign()
        design.name = name
        design.date = new Date().toISOString()
        
        set((state) => ({
          savedDesigns: [...state.savedDesigns, design]
        }))
      },

      loadDesign: (designId) => {
        const design = get().savedDesigns.find(d => d.id === designId)
        if (design) {
          set({
            room: { ...design.room },
            placedItems: [...design.items],
            selectedItemId: null
          })
        }
      },

      deleteDesign: (designId) => {
        set((state) => ({
          savedDesigns: state.savedDesigns.filter(d => d.id !== designId)
        }))
      },

      undo: () => {
        const state = get()
        if (state.historyIndex > 0) {
          const previousState = state.history[state.historyIndex - 1]
          state.historyIndex -= 1
          
          set({
            room: { ...previousState.room },
            placedItems: [...previousState.items],
            selectedItemId: null
          })
        }
      },

      redo: () => {
        const state = get()
        if (state.historyIndex < state.history.length - 1) {
          const nextState = state.history[state.historyIndex + 1]
          state.historyIndex += 1
          
          set({
            room: { ...nextState.room },
            placedItems: [...nextState.items],
            selectedItemId: null
          })
        }
      },

      addToHistory: () => {
        const state = get()
        const currentDesign = state.getCurrentDesign()
        
        // Remove any future history if we're not at the end
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        
        // Limit history to 50 states
        if (newHistory.length >= 50) {
          newHistory.shift()
        } else {
          state.historyIndex += 1
        }
        
        newHistory.push(currentDesign)
        
        set({
          history: newHistory
        })
      },

      reset: () => {
        set(initialState)
      },

      getCurrentDesign: () => {
        const state = get()
        return {
          id: 'current',
          name: 'Untitled Design',
          date: new Date().toISOString(),
          room: { ...state.room },
          items: [...state.placedItems]
        }
      }
    }),
    {
      name: 'interior-builder-storage',
      partialize: (state) => ({
        savedDesigns: state.savedDesigns
      })
    }
  )
)