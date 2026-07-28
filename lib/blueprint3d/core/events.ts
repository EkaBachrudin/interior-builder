type EventHandler = (...args: any[]) => void

export class EventEmitter {
  private events: Record<string, EventHandler[]> = {}

  on(event: string, handler: EventHandler): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(handler)
  }

  off(event: string, handler: EventHandler): void {
    if (!this.events[event]) return
    
    const index = this.events[event].indexOf(handler)
    if (index > -1) {
      this.events[event].splice(index, 1)
    }
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return
    
    this.events[event].forEach(handler => {
      try {
        handler(...args)
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error)
      }
    })
  }

  clear(): void {
    this.events = {}
  }
}