# Automation QA Report

Date: 2026-11-11

## Executed

- `npm run build` — passed (includes `tsc -b` and Vite production build). Vite reports the existing `HeroIdentityExperience` chunk above 500 kB; this feature work does not change it.
- `git diff --check` — passed.
- Direct engine scenario checks against the compiled TypeScript module — passed for the bundled preset Yes route, actual No route, both exhaustive branches, nested decisions, non-conditional flow, disconnected nodes, cycles, empty workflow, missing branch, invalid output port, invalid condition, and the 128-path limit.
- The engine checks are ad hoc Node assertions; the repository has no test script or test framework configured.

## Not executed

- Browser interaction and screenshots: unavailable because browser use is disabled in the current Work settings.
- Responsive matrix: 320, 360, 375, 390, 414, 430, 600, 768, 820, 1024, 1280, 1440, 1920px; tablet orientations; short mobile landscape.
- Touch device movement, panning, pinch, connection creation/cancel, node settings, keyboard flows, dark/light runtime behavior, console errors, and browser overflow/performance.
- UI regression runs for both preset flows and other Playground sections. Portfolio and Projects files were not edited in this task; the repo build succeeded.

## Remaining verification

Use a resizable browser and touch-capable device/emulator to complete the unrun interaction/theme/responsive checks. In particular, verify the run/simulate buttons stay separated from 320px through desktop widths and that zoomed pointer coordinates align with visible node positions.
