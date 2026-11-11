# Touch Interaction Architecture

Date: 2026-11-11

## Existing canvas retained

The editor remains its existing HTML node cards plus SVG connections and custom pointer interactions. No diagramming dependency or canvas rewrite was introduced.

## Modes and gestures

- **Select:** tap/click a node to select it and show its settings. Drag its header to move it; pointer capture keeps tracking stable when the pointer moves beyond the header. Movement is disabled while the workflow is running.
- **Pan:** a visible mode. Drag empty canvas space to pan by adjusting the scroll container.
- **Connect:** select a source block, choose its output (Next or Yes/No), then tap a destination block. Cancel or Escape clears the pending connection. Invalid destinations and duplicate outputs produce feedback.
- Existing desktop drag-from-output-to-input connection remains. Touch use of an output handle enters the explicit Connect flow. Port hit areas are larger than their visible dots.
- Zoom buttons, Fit, and Reset use CSS zoom with a layout-sized stage. Two-finger touch movement adjusts zoom and scroll position.

## Node settings and keyboard

Settings remain inline on desktop and can be opened/closed from the mobile toolbar, where the panel is constrained and scrollable. Node cards can receive focus; arrow keys move focus to a nearby node, Escape cancels a pending connection, and Delete/Backspace removes the selected editable non-trigger block in custom mode.

## Cleanup and limitations

Pointer move/up/cancel listeners are removed by effect cleanup. Active runs are invalidated and timers cleared on unmount or stop. Touch gestures and drag behavior still require real device/browser verification; the current browser controls were unavailable during this implementation pass.
