# Ruang

Workspace equipment rental for freelancers in Bali. Pick your gear (desks, monitors, chairs, private booths), design your layout in 3D, and book a desk in Canggu, Ubud, or Seminyak.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Approach & tech choices

- **Landing page** follows a warm monochrome editorial aesthetic with Geist Sans + Newsreader serif and Framer Motion scroll-entry animations.
- **3D workspace** uses a custom Three.js engine (not React Three Fiber) with pointer-based object manipulation, procedural room generation, and real-time collision/grid snapping.
- Touch support spans all three interaction layers: camera orbit/pinch, item placement, and furniture drag — via Pointer Events, native touch handlers, and `touch-action: none`.
- State is managed through Zustand for the furniture catalog, placed items, room config, and undo/redo.
- The workspace route and shared UI components (Button, Modal, Tooltip) share the same CSS variable-driven design system as the landing page.

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Three.js](https://threejs.org)
- [Zustand](https://zustand.docs.pmnd.rs)
- [Framer Motion](https://motion.dev)
- [Geist](https://vercel.com/font) + [Newsreader](https://fonts.google.com/specimen/Newsreader)

## What I'd build with more time

- Persistence for saved workspace layouts (currently lost on refresh).
- Unit and integration tests for the 3D interaction systems.
- Drag-and-drop from catalog directly onto the canvas.
- More furniture models.
- Onboarding walkthrough for first-time users.
