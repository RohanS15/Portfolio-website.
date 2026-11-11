# Tutorial System Architecture

Date: 2026-11-11

## Ownership and data flow

- `src/tutorials/playgroundTutorials.ts` owns the `TutorialId` union, typed card shape, and the per-tool tutorial map.
- `src/Tutorial.tsx` is the shared accessible flashcard dialog. It receives only a tool ID, resolves that tool's title/content centrally, and owns open state, current card, progress, swipe navigation, and close behavior.
- `src/features/pages/PlaygroundPage.tsx` places one tutorial trigger with its corresponding tool. There is no global tutorial state, cross-tool tutorial selection, or observer-based opening.
- `src/playground.css` owns the tutorial's Playground glass treatment, responsive layout, landscape sizing, and reduced-motion override.

## Interaction model

- A tutorial is initially closed and opens only from its own How to use button. Scrolling, entry, reload, and hover do not open one.
- Previous/Next and Finish are explicit buttons. Left/Right arrow keys navigate while the modal is open; Escape closes it.
- Touch swipes on the card move between cards. `touch-action: pan-y` and horizontal distance threshold preserve vertical card scrolling while recognizing deliberate horizontal gestures.
- Native `<dialog>.showModal()` provides modal focus behavior and background inertness. Opening moves focus to Close; closing restores focus to the triggering button. Root overflow is locked while open and restored during cleanup.
- The progress bar exposes `progressbar` semantics and the current position. Long content can scroll inside the card; dialog height adapts to narrow, short, and landscape viewports.
- Reduced-motion users do not receive the dialog entrance animation or progress transition.

## Extension

Add an entry to `TutorialId` and `playgroundTutorials`, then place `<Tutorial id="..." />` next to that tool's existing UI. Keep instructional claims grounded in the tool implementation and its local/synthetic boundaries. Do not duplicate dialog/navigation markup per tool.
