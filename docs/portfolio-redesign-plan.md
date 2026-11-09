# Portfolio Redesign Implementation Plan

**Status:** Planning reference; no implementation is authorized by this document alone.
**Audit basis:** Source-level audit of the repository on 2026-11-07. No fresh browser, build, or performance run was performed during that audit.
**Scope:** Improve the existing React/Vite portfolio while preserving its routes, verified content, project catalog, and working Playground interactions.

## 1. Existing Architecture

### Application and routes

- The application is a React + TypeScript single-page site built with Vite.
- `src/app/routes.ts` maps `/` and `/portfolio` to the portfolio, `/projects` to the project catalog, and `/playground` to the interactive playground. `src/App.tsx` selects the division from the current pathname; there is no React Router dependency.
- `src/App.tsx` composes the common navigation and section content. Some substantial sections and tools are lazy/deferred to reduce initial work.
- `src/components/navigation/DivisionNavigation.tsx` contains global division navigation, theme control, and the contextual section sidebar.
- `src/components/theme/ThemeProvider.tsx` owns the React theme state and persists it to local storage. `index.html` applies the saved theme before the app mounts to reduce theme flash.
- `src/components/ErrorBoundary.tsx` contains section-level recovery UI.

### Content and experiences

- `src/content.ts` contains profile links, skill groups, experience entries, and service content. Empty contact details are intentionally represented as empty values.
- `portfolio-projects.json` is the project gallery source of truth. `portfolio-projects.pre-migration.json` is a preserved migration snapshot and must remain intact.
- `src/ExperienceTimeline.tsx` renders verified job entries, expandable role details, and a separate planned “LOOKING AHEAD” block.
- `src/PortfolioShowcase.tsx` renders tool groups and the project gallery, including category filters and project detail dialogs.
- `src/Playground.tsx` hosts a CodeMirror editor, a sample selector, and a sandboxed preview iframe. `src/CodeEditor.tsx` configures CodeMirror languages, themes, accessibility attributes, and editor lifecycle cleanup.
- The other interactive tools are `src/Terminal.tsx` plus `src/terminal/portfolioFs.ts`, `src/GameArcade.tsx`, `src/CyberLab.tsx`, and `src/Automation.tsx`. Their examples use local synthetic data; preserve this behavior and do not add network calls to them.

### Styling

Global CSS is imported in `src/main.tsx`: `styles.css`, `extras.css`, `premium.css`, `theme.css`, `sidebar.css`, Playground styles, and `home-hero.css`. Tokens and theme overrides are spread across several files. `ambient-grid` has multiple declarations, and `.hero-grid` appears to have CSS rules without a current JSX element. Treat selector cleanup as a focused change: broad CSS consolidation could alter Playground, Cyber Lab, or Arcade appearance.

## 2. Existing Dependencies and Animation Audit

### Current dependencies

- React, React DOM, TypeScript, Vite, and the React Vite plugin.
- Motion for React for component-level interactions and transitions.
- GSAP and ScrollTrigger for the hero timeline and scroll progress.
- Lenis for smooth scrolling, synchronized through the shared GSAP ticker.
- CodeMirror packages for the embedded code editor.
- Three.js and React Three Fiber are not installed. Do not add them unless a later approved design requires a specific, justified 3D scene.

The available package scripts are `dev`, `build`, and `preview`; no lint or unit/UI test script is currently defined.

### Current animation ownership

- `src/components/motion/AnimationRuntime.tsx` owns Lenis, the shared GSAP ticker, the GSAP hero entrance, ScrollTrigger progress, and reveal observers. It also cleans up listeners, observers, ticker registrations, and triggers.
- `src/main.tsx` uses `MotionConfig` with the user's reduced-motion preference.
- Motion is also used in components such as project/tool filters and arcade interactions.
- CSS owns decorative background, card, hover, and responsive motion.

### Design rule for future motion

Assign one animation owner per element:

- GSAP/ScrollTrigger for a coordinated hero sequence or an approved scroll narrative.
- Motion for React for component-level state changes, hover, and tap feedback.
- CSS for light decoration and straightforward transitions.
- Lenis only for shared scrolling, synchronized with the existing runtime.

Do not introduce a second Lenis instance, another GSAP ticker, or overlapping transforms on the same element. Scope setup to component/app lifecycles, clean up listeners and frames, and keep essential content usable without animation. Honor `prefers-reduced-motion` across JS and CSS.

## 3. Design Decisions

### Shared direction

- Preserve the charcoal/neutral surfaces, teal/cyan signal color, selective purple accent, typography, and theme tokens already established by the site.
- Make each section distinct through composition, spacing, and hierarchy, not through unrelated effects or a repeated generic card pattern.
- Keep the portfolio hero portrait-free, consistent with the earlier explicit design decision. Preserve the separate profile feature before the footer and the existing profile image there.
- Favor transform/opacity motion, restrained lighting, fine borders, and readable surfaces. Do not add random floating shapes, excessive glass blur, or decorative movement that competes with content.
- Reuse the existing theme provider and tokens; do not create a second theme state system.

### Section decisions

- **Hero:** Replace the current conventional left-copy/right-graphic balance with a more deliberate signature composition. Retain the cybersecurity, software/development, and freelance identity, clear CTAs, and no hero portrait/avatar. Build on the current systems-map graphic if it serves the new composition; do not add 3D by default.
- **01 / A Little Context:** Reduce vertical gaps, align the intro and principles, and keep the current factual copy. Use a short, low-distance reveal.
- **02 / Tools & Practice:** Remove experience/reference links and their footer area from each tool card. Keep categories, filter behavior, and all existing technology information. Give cards a consistent hierarchy and a modest hover/focus highlight.
- **Projects:** Keep the catalog JSON and project detail content. Refine card scale and layout without dropping projects, statuses, or links. Keep category filters, preview fallback, and the native details dialog.
- **Experience:** Remove the entire “LOOKING AHEAD / AUTOMATION LAB” panel from the experience section. Keep all verified employment entries, company links/logos, expandable details, and source note. Check whether `careerTimeline` has other references before removing its data.
- **Contact:** Add Name, Email, Subject, and Message with a submit action, client-side validation, accessible errors, disabled/loading state, server-confirmed success, and truthful failure state. The repository has no backend/provider. Do not represent a `mailto:` draft as an actual website submission and never show success without a successful service response.
- **Playground:** Preserve its existing editor tabs, sample selector, run/reset/copy/fullscreen controls, sandboxing, and light/dark CodeMirror palettes. The contact redesign must not alter the playground iframe CSP or its isolation.

### Contact integration prerequisite

No form backend or endpoint appears in the repository. Before building a real submit path, select a provider or supply an HTTPS endpoint that accepts the four fields, supports the deployed origin via CORS, and returns an unambiguous success/error response. Public client configuration can be stored as a Vite environment variable such as `VITE_CONTACT_ENDPOINT`; never put private API secrets in client-side environment variables. A provider that requires a private key must be called through a server-side function. Include a privacy statement appropriate to the selected service. Until this configuration exists, retain a clearly unavailable state or an explicitly labeled email-draft fallback; do not fake delivery.

## 4. Components and Files to Modify

| File | Planned change | Expected result | Risk / dependency |
|---|---|---|---|
| `src/App.tsx` | Refine hero and About composition; add the quick contact form; preserve route composition, profile feature, and tool wrappers. | Stronger hero, tighter About, contact form in the existing design system. | Central composition file: protect section order, anchors, navigation, and existing conditional links. |
| `src/home-hero.css` | Hero typography/layout, compact About rules, section-specific responsive styling, and restrained focus/hover details. | Original, coherent hero and consistent portfolio layout. | High specificity and shared selectors can override other styles. |
| `src/PortfolioShowcase.tsx` | Remove skill-card related experience/project links; retain filters and project catalog behavior; refine project layout only where needed. | Cleaner tools section and more legible project cards without lost data. | Preserve filter counts, project links, modal focus/close behavior, and JSON as source of truth. |
| `src/ExperienceTimeline.tsx` | Remove the `direction-card` / “LOOKING AHEAD” block. | Experience contains only the existing role timeline and factual source note. | Preserve all employment entries and details. |
| `src/content.ts` | Remove `careerTimeline` only if no longer referenced; do not fabricate contact details or employment facts. | No dead planned-panel data; existing profile/skills/services remain authoritative. | Search all references before deletion. Contact endpoint configuration is separate from this content module. |
| `src/components/motion/AnimationRuntime.tsx` | Refine hero/reveal choreography only after profiling; preserve shared Lenis/GSAP ownership and cleanup. | Faster, simpler, predictable motion and scroll. | Do not duplicate ticker, Lenis, ScrollTrigger, or component-owned Motion. |
| `src/theme.css`, `src/styles.css`, `src/premium.css`, `src/sidebar.css` | Make only required token, spacing, responsive, or stale-selector adjustments; avoid broad rewrite. | Better consistency with fewer conflicting declarations. | Global files affect every division, especially the Playground tools. |
| `src/components/theme/ThemeProvider.tsx`, `src/components/navigation/DivisionNavigation.tsx`, `src/main.tsx`, `index.html` | Modify only if needed for a shared theme/focus/motion fix. | Theme, navigation, and first-paint behavior stay consistent. | These are shared app foundations; protect persisted theme and direct routes. |
| `public/images/rohan-profile.png` | Reuse; consider a generated responsive/compressed derivative only after measuring and visually comparing it. | Lower image transfer without reducing portrait quality. | Original image must remain intact; verify crop and sharpness at target sizes. |
| `portfolio-projects.json`, `portfolio-projects.pre-migration.json` | No content rewrite planned. | Gallery content and migration provenance remain preserved. | Do not silently alter project claims or snapshots. |
| `README.md` | Correct stale implementation notes after code decisions are finalized (e.g. current CodeMirror editor and contact behavior). | Documentation matches the shipped app. | Keep doc updates aligned with actual implementation. |
| New contact client module (only if appropriate) | Isolate submission, response validation, and error mapping from the presentational form. | Testable, maintainable integration boundary. | Requires endpoint/provider choice; do not expose private keys. |

No dependency addition is recommended at planning time. Use the installed Motion, GSAP, Lenis, and CodeMirror capabilities. Any proposal to add a library should include a demonstrated gap, bundle impact, and maintenance cost before adoption.

## 5. Performance and Reliability Risks

1. **Large images:** `public/images/rohan-profile.png` is approximately 1.98 MB. Measure transfer and LCP contribution before deciding on an optimized derivative. Reserve intrinsic dimensions/aspect ratio to avoid layout shift.
2. **Code splitting:** The editor and interactive sections are split/deferred. Confirm that off-screen sections are not requested at first paint, that route anchors trigger loading, and that placeholders reserve realistic height. The prior work's bundle snapshot is not a substitute for measuring the approved final build.
3. **Global CSS:** Several global stylesheets override the same shared surface and background selectors. A broad cleanup can regress tool color schemes; change selectors narrowly and retest each division in both themes.
4. **Motion systems:** Lenis, GSAP/ScrollTrigger, Motion, and CSS coexist. Double ownership can produce jumps, sluggish scroll, or stuck transforms. Keep the existing shared runtime and remove redundant animation owners if they are found.
5. **Dynamic content and scroll:** Deferred sections change `main` height. Ensure ScrollTrigger refresh is coalesced, anchors still land correctly, and resize observers/listeners do not refresh on every scroll frame.
6. **Fonts:** Google Fonts is requested remotely. Measure its effect and confirm a legible local/system fallback. Avoid adding font packages without a measured need.
7. **Contact delivery:** CORS, endpoint availability, rate limits, provider privacy, and duplicate submissions are integration concerns. Only a real response can produce a success state.
8. **Static hosting:** The host must serve the SPA entry point for `/portfolio`, `/projects`, and `/playground`. Verify direct loads and refreshes on the actual deployment host; the presence of `public/404.html` is not itself proof of rewrites.
9. **Reduced motion and touch:** CSS and JS preferences must agree. Hover-only information must have focus/tap equivalents.

## 6. Eight-Stage Implementation Sequence

Each stage ends with a verification checkpoint before the next begins. Preserve the project architecture and keep the working Playground intact.

### Stage 1 — Hero signature

- Inspect existing hero markup, tokens, and `AnimationRuntime` selectors.
- Design a distinctive, asymmetric text/graphic composition that communicates cybersecurity, development, and freelance work.
- Keep the hero portrait-free; preserve semantic heading text, accessible CTAs, theme support, and reduced-motion presentation.
- Verify hero at desktop, tablet, and narrow mobile widths. Confirm the animation is cleaned up and does not block first paint.

### Stage 2 — 01 / A Little Context

- Tighten vertical spacing and improve alignment between introduction and principle content.
- Keep factual copy and existing anchor/navigation behavior.
- Verify reveal behavior, no hidden text under reduced motion, and no overlap at mobile widths.

### Stage 3 — 02 / Tools & Practice

- Remove the tool-card related-experience/reference footer and any now-unused helper logic.
- Preserve tool metadata, all technology tags, category filters, and counts.
- Add a restrained hover and visible keyboard-focus state using the existing theme tokens.
- Verify filtering and theme contrast in both modes.

### Stage 4 — Projects

- Adjust card proportions, text hierarchy, and responsive grid behavior.
- Preserve the project JSON source, all current projects, migration statuses, and truthful labels.
- Retain filtering, detail dialog, image failure fallback, and external-link behavior.
- Verify dialog keyboard close/focus, filters, and direct `/projects` access.

### Stage 5 — Experience

- Remove the complete “LOOKING AHEAD / AUTOMATION LAB” aside.
- Keep the four role entries, logos, company links, expandable details, and source note.
- Rebalance section spacing and remove only data proven unused elsewhere.
- Verify all `careerExperiences` render and the timeline scroll indicator cleans up listeners/frames.

### Stage 6 — Contact

- Confirm provider/endpoint and privacy requirements before implementing transmission.
- Add Name, Email, Subject, and Message; associate labels and validation feedback; block duplicate submits.
- Implement loading and error from actual request state and success only from a valid success response.
- If no endpoint/provider is available, show an honest unavailable or explicitly email-draft state and do not pretend to submit.
- Verify keyboard path, invalid data, success/error responses using a safe test endpoint, and theme contrast.

### Stage 7 — Global motion, theme, and performance

- Review shared tokens and only remove demonstrably unused/conflicting CSS.
- Keep one owner per animated element and a single Lenis/GSAP runtime.
- Profile profile-image loading, font behavior, deferred chunks, initial network requests, and layout stability.
- Test light/dark theme toggles across all three divisions. Keep the synthetic Playground tools local-only.

### Stage 8 — Responsive and accessibility QA

- Inspect 320, 375, 425, 768, 1024, 1440, and 1920 px widths.
- Test `/`, `/portfolio`, `/projects`, and `/playground` via direct navigation and refresh.
- Exercise nav/sidebar, theme control, tool filters, project dialog, CodeMirror tabs/run/reset/copy/fullscreen, terminal commands/history/completion, all arcade modes, Cyber Lab tabs/playbook, and workflow controls.
- Check browser console/network for app errors and failed assets; test keyboard-only navigation, visible focus, touch interaction, and reduced motion.
- Measure LCP, INP, and CLS on mobile and desktop. Report actual values; do not state targets as results.
- Fix and recheck any regression before final report.

## 7. Testing Requirements and Acceptance Criteria

### Build and code checks

- Run the existing `npm run build`, which includes `tsc -b` and `vite build`.
- There are currently no `lint` or `test` scripts. Do not describe either as passed. If automated tests are later proposed, add them only after approval and justify the dependency.
- Inspect the production build output for large chunks and confirm the editor and below-the-fold tools remain deferred as intended.

### Browser and interaction checks

- Load and refresh each supported route directly; verify navigation, browser history, and section anchors.
- Test every listed interaction above, including error states and disabled/loading states; preserve the sandbox and synthetic data isolation.
- Inspect console errors, failed requests, image/font failures, focus handling, theme color contrast, and reduced-motion behavior.
- Verify contact success only against a real test response from the configured backend/provider.

### Responsive and performance checks

- At 320, 375, 425, 768, 1024, 1440, and 1920 CSS pixels, verify no horizontal overflow, clipping, overlap, or unusable touch controls.
- Measure Core Web Vitals in representative mobile and desktop browser runs: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 are targets, not presumed outcomes.
- Confirm image dimensions/space are reserved, initial requests exclude noncritical off-screen chunks where expected, and theme changes do not cause layout shifts.

### Completion definition

A stage is complete only when its implementation is reviewed, the affected route and interactions are actually tested, observed issues are fixed, and the results are recorded accurately. Do not advance past a failed checkpoint. The overall task is complete only after all eight stages have passed their applicable checks or any external blocker—especially contact service configuration—is clearly recorded.

## 8. Decisions Required Before Implementation

1. Approve this staged implementation plan.
2. Before Stage 6, provide or choose the contact submission provider/endpoint and the required configuration. No credentials should be committed to this repository.
3. Keep the hero portrait-free and preserve the separate profile feature unless you explicitly revise that earlier decision.
