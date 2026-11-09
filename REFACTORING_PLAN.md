# Behavior-preserving architecture refactor

## Status — 2026-11-09

The planned behavior-preserving boundaries have been applied to shared page primitives, contact concerns, skills/projects, route composition, and local playground datasets. The final production build and TypeScript check pass; a source import scan found no cycles. The final browser regression and six viewport comparisons remain unverified because local browser use is disabled in the current Work settings. No test/lint runner is configured.

## Current architecture and findings

This is a client-rendered React + TypeScript app built with Vite. `src/main.tsx` owns application bootstrapping and the global CSS import stack; `src/app/routes.ts` maps pathname to one of three divisions. `src/App.tsx` is the shared shell and each division's section composition lives in `src/features/pages/`. Theme is shared through context, while most feature state remains local. Large interactive features are lazy-loaded. The homepage also has viewport-deferred chunks.

The remaining responsibility hot spots are `App.tsx` (division selection and cross-section behaviors), `ContactForm.tsx` (view state and form lifecycle), and `HeroIdentityExperience.tsx` (cohesive scene ownership). The 3D hero is deliberately left intact because its rendering, resource cleanup, and interactions are tightly coupled and changes risk altering accepted behavior. Data for the cyber lab, arcade, and workflow now has feature-owned modules.

## Target boundaries

- Keep `App.tsx` as the composition root and keep route selection in `app/routes.ts`.
- Put shared portfolio presentation and scroll/viewport behavior in `components/layout/PortfolioPrimitives.tsx`.
- Keep contact view state and markup in `ContactForm.tsx`; place contact contracts, pure validation, and fetch transport in separate contact modules.
- Keep feature-specific rendering, data, styles, and existing lazy boundaries together until a behavior-preserving extraction has clear ownership and verification.
- Do not add a router, state library, service framework, or other dependency for this structure.

## Migration completed

1. Extracted the eight shared portfolio primitives from `App.tsx` without changing their JSX, selectors, handlers, effect setup, or timing.
2. Extracted contact data types and defaults, validation, and `/api/contact` request handling from `ContactForm.tsx`; retained the same validation text, limits, request shape, endpoint, and status transitions. The form depends on a typed sender contract, defaulted to the existing HTTP implementation.
3. Moved skill filtering/display and project catalog/dialog UI into `features/skills/SkillExplorer.tsx` and `features/projects/ProjectGallery.tsx`. Kept `PortfolioShowcase.tsx` as a compatibility barrel.
4. Extracted route composition into `features/pages/PortfolioPage.tsx`, `ProjectsPage.tsx`, and `PlaygroundPage.tsx`. The app shell still owns global navigation, route selection, and cross-section observers. Removed the unused `menu` constant after confirming it had no code references.
5. Moved Cyber Lab sample alerts, arcade prompts, and workflow templates into feature data modules; moved workflow types to `automationTypes.ts`. Interaction state and rendering remain in their components.
6. Reviewed the R3F hero scene boundaries. Kept texture, geometry/material lifecycle, scene, camera, labels, pointer input, and frame updates together because they share scene ownership and disposal lifetimes.
7. Preserved page IDs, route behavior, visual markup, CSS import order, source data, animation libraries, and 3D scene code. Skill and project feature code can load independently.

## Dependency and regression strategy

Use only existing dependencies. Keep the dependency direction from app composition to shared UI/features and from form UI to its validation/transport modules. Keep the contact endpoint as the only client transport for the form. Build/type-check after each extraction. Inspect the live homepage and console after changes. A screenshot from before the refactor at matching viewport and scroll position was not captured, so a pixel-diff claim is not available; the extracted JSX and styles were preserved verbatim. Other routes, breakpoints, and interaction states need a dedicated follow-up regression pass before further broad decomposition.

## Remaining architectural work

- The 3D hero remains a cohesive R3F scene module; its rendering, texture generation, interaction state, and animation lifecycle should only be split around pure helpers with direct ownership.
- Add automated behavior tests only after selecting a test framework and defining stable component/service contracts. No test runner is currently configured.
