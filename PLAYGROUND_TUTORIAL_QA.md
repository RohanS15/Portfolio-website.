# Playground Tutorial QA

Date: 2026-11-11

## Scope and status

`npm run build` (TypeScript build plus Vite production build) passed on 2026-11-11. `git diff --check` also completed without whitespace errors. No lint or test script is defined in `package.json`. Browser controls are disabled by the current Work settings, so no browser interaction or viewport run was performed; items below are not claimed as runtime-passed.

## Intended matrix

Widths requested: 320, 360, 375, 390, 414, 430, 600, 768, 820, 1024, 1280, 1440, and 1920px; also check tablet portrait/landscape and a short mobile landscape viewport.

| Check | Source review | Runtime result |
| --- | --- | --- |
| Every tool opens only its own content | Five IDs and colocated triggers map to distinct typed data. Static search found no observer in `Tutorial.tsx`. | Not run |
| Entry, reload, scroll, hover never auto-open | Open state initializes false; static search found the open transition only in the explicit click handler. | Not run |
| Next, Previous, progress, Finish | Shared card index, bounded navigation, and ARIA progress values are implemented. | Not run |
| Touch swipe left/right | Touch start/end handlers with 48px threshold; card uses `touch-action: pan-y`. | Not run |
| Keyboard and close | Arrow keys move; native dialog cancel handles Escape; Close and Finish close. | Not run |
| Focus and page scroll | Native modal dialog; focus moves to Close and returns to trigger; document overflow restored in effect cleanup. | Not run |
| Readability, orientation, overflow | Dialog/card have constrained dimensions, internal vertical scrolling, phone and short-landscape rules. | Not run |
| Existing Playground tools and other divisions | Tool implementations and Portfolio/Projects files were not edited as part of this tutorial change. | Not run |
| Browser console/performance | No runtime session inspected. | Not run |

## Verification commands

Run `npm run build` and browser QA before reporting a pass. The repository currently defines no lint or test script in `package.json`.
