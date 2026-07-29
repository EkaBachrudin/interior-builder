# Fix: Canvas 3D Mouse Controls Not Working

## Root Cause

In `lib/furniture/manipulation-controls.ts:83`, `event.preventDefault()` is called **unconditionally** on every `pointerdown` event (left-click). This prevents the browser from firing the subsequent `mousedown` event, so `CameraControls.onMouseDown()` in `lib/blueprint3d/three/controls.ts` never receives the event → `isDragging` never becomes `true` → camera orbit with mouse never works.

Touch controls are unaffected because `CameraControls` listens to native `touchstart/touchmove/touchend` events directly, which are not suppressed by `preventDefault()` on Pointer Events.

## Fix

**File:** `lib/furniture/manipulation-controls.ts`

Move `event.preventDefault()` from the top of `onPointerDown` (unconditional) into the `if (intersects.length > 0)` block, so it only suppresses mouse events when a furniture item is actually hit. When clicking on empty space, let mouse events pass through to `CameraControls`.

**Location: lines 81-110**

### Before:
```typescript
private onPointerDown(event: PointerEvent): void {
    if (this.state.isManipulating || event.button !== 0) return
    event.preventDefault()  // ← DELETED from here

    const rect = this.renderer.domElement.getBoundingClientRect()
    ...
    const intersects = this.raycaster.intersectObjects(furnitureObjects, true)
    
    if (intersects.length > 0) {
      let selectedObject = intersects[0].object
      ...
```

### After:
```typescript
private onPointerDown(event: PointerEvent): void {
    if (this.state.isManipulating || event.button !== 0) return

    const rect = this.renderer.domElement.getBoundingClientRect()
    ...
    const intersects = this.raycaster.intersectObjects(furnitureObjects, true)
    
    if (intersects.length > 0) {
      event.preventDefault()  // ← MOVED here
      let selectedObject = intersects[0].object
      ...
```

## Steps

1. Edit `lib/furniture/manipulation-controls.ts` — move `event.preventDefault()` into the `intersects.length > 0` block
2. Verify with `npm run dev` — test mouse orbit (left-click drag), mouse pan (right-click drag), scroll zoom
