# Portfolio project guide

## Identity and objectives

This repository is a Vite single-page portfolio for cybersecurity engineering, software development, and automation. Preserve its existing routes, verified content, project details, and interactive experiences. The project gallery source of truth is `portfolio-projects.json`; keep `portfolio-projects.pre-migration.json` intact unless explicitly asked otherwise.

## Architecture

- React + TypeScript + Vite; npm is indicated by `package-lock.json`.
- `src/main.tsx` mounts the app and imports global CSS. `src/App.tsx` composes the divisions; `src/app/routes.ts` maps paths.
- Profile, skill, experience, and service data live in `src/content.ts`.
- Shared navigation, theme, motion runtime, contact form, and error handling live in `src/components/`.
- Interactive experiences include `Playground.tsx`, `Terminal.tsx`, `GameArcade.tsx`, `CyberLab.tsx`, and `Automation.tsx`.

## Coding and component conventions

- Use TypeScript and React function components/hooks consistent with neighboring code. Keep state near its owner; use shared context only for genuinely global state such as theme.
- Make focused changes. Inspect the implementation and its data/styles before editing. Preserve existing props, section IDs, route behavior, and keyboard interactions unless the request explicitly changes them.
- Keep project catalog content in its JSON source. Do not invent profile, career, project, or integration facts.
- Keep page composition in `App.tsx` understandable; extract reusable UI/behavior when it materially improves ownership without replacing whole sections.
- Keep lazy imports behind `Suspense` boundaries with useful fallbacks. Current lazy `AnimationRuntime` use needs review; do not copy that pattern without a boundary.

## Routing and content

- `/` and `/portfolio` show the portfolio; `/projects` shows the project catalog; `/playground` shows local interactive experiences.
- Centralize route mapping in `src/app/routes.ts` and preserve direct navigation and in-page anchors.
- Static hosting must be configured to serve the SPA for division paths; the repository alone does not establish the deployed host behavior.

## Styling and animation

- Follow the existing charcoal/neutral, teal/cyan, selective purple visual identity, theme tokens, Manrope/DM Mono typography, responsive layouts, and restrained effects.
- Global CSS is imported in `src/main.tsx`; feature-specific styles are split across CSS files. Check cascade/selector ownership before changing shared rules.
- Assign one animation owner per element: GSAP/ScrollTrigger for coordinated page/reveal sequences, Motion for component interactions, CSS for lightweight decoration and transitions.
- `AnimationRuntime.tsx` is the current shared GSAP/ScrollTrigger runtime. Do not add a second ticker or competing scroll runtime. Lenis and Three.js are not current dependencies.
- Clean up listeners, observers, frames, timers, and animation contexts. Respect `prefers-reduced-motion`; content and controls must remain usable without animation.

## Performance

- Preserve lazy loading and viewport-deferred rendering of large interactive sections where appropriate.
- Measure before optimizing. Consider the ~2 MB profile image and remotely loaded Google Fonts when evaluating mobile loading.
- Prefer transform/opacity motion, reserved media dimensions, and minimal layout work. Avoid unnecessary dependencies and continuous work.

## Accessibility and responsive behavior

- Use semantic landmarks/headings, associated labels, accessible names, visible focus, readable contrast, and keyboard-operable controls.
- Support touch, narrow screens, and zoom without clipping or horizontal overflow. Hover effects must have focus/touch equivalents.
- Test light/dark themes and reduced-motion behavior when relevant. Dialogs and closed navigation must have correct focus and accessibility behavior.

## Security and privacy

- Keep playground JavaScript inside its sandboxed iframe and retain its restrictive CSP. Do not add network behavior to the terminal, cyber lab, arcade, or workflow simulations without an explicit requirement.
- Keep contact provider secrets server-side; never add secret values or `VITE_`-prefixed private credentials. Preserve input bounds, validation, escaping, and truthful success/error states.
- Do not log submitted contact content. Treat local synthetic data as synthetic.

## Verification expectations

- Do not run tests, builds, or other verification commands unless the user requests testing or verification.
- When verification is requested, use `npm run build` as the repository build check and report its actual result. No test or lint script is currently defined.
- Browser, deployment, accessibility, and performance results must be reported only when actually observed; distinguish source review from runtime verification.

## Documentation and project changes

- Keep durable project instructions, architecture, design-system notes, and audit findings in this repository. Do not store secrets or temporary progress here.
- Update existing documentation instead of creating redundant copies. Do not alter application code while performing documentation-only requests.
- Preserve existing behavior unless the user's current request explicitly authorizes a behavior change.
