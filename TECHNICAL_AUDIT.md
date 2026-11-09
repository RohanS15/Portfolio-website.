# Technical audit

> **Contact integration update — 2026-11-10:** The contact form has since been migrated from the Resend Vercel Function to the EmailJS browser SDK. Earlier audit entries below describe the implementation as it existed on their recorded dates; the current setup is documented in `docs/contact-form-setup.md`.

## Baseline verification — 2026-11-08

- `package.json` scripts: `npm run dev` (Vite dev server), `npm run build` (`tsc -b && vite build`), and `npm run preview` (Vite preview). No lint script is defined.
- Dependencies: `node_modules` was present before verification; no packages were installed.
- Production build: `npm run build` **passed**. Vite 8.3.5 transformed 491 modules. Output sizes (raw / gzip): CSS 259.83 / 48.63 kB; app entry JS 414.63 / 129.97 kB; animation runtime 114.94 / 45.13 kB; CodeMirror editor 482.32 / 169.07 kB. The remaining feature chunks are separately emitted (about 4.79–22.56 kB raw each). Build finished in 1.23 s.
- Standalone type-check: `npx tsc -b --pretty false` **passed** with no diagnostics. The build command also includes `tsc -b`.
- Lint: `npm run lint` **could not run** because no such script exists. Exact npm message: `npm error Missing script: "lint"`.
- Runtime: the already-running local portfolio at `http://localhost:5173/` rendered its home page. At the observed viewport (926 × 913 CSS px), document scroll width equaled client width (911 px), so no horizontal overflow was observed. Captured browser logs contained no errors and one warning from Motion: `You have Reduced Motion enabled on your device. Animations may not appear as expected.` This was a device preference warning, not an app exception. Runtime inspection covered only the currently open home route.
- Responsive widths requested (320, 375, 768, 1024, 1440, 1920 px): only the current ~926 px viewport could be observed. The computer-use session stopped because it could not verify the active browser URL for further desktop control. The other widths remain **untested**; CSS source contains many feature-specific breakpoints, which is not a substitute for viewport verification.
- Performance: no Lighthouse, Core Web Vitals, CPU profile, network waterfall, or route-by-route trace was collected. Bundle output confirms code splitting for features and the editor, but the app entry is 129.97 kB gzip and the CodeMirror chunk is 169.07 kB gzip. The profile image remains approximately 2.03 MB. Their actual user-perceived impact is unmeasured.

This baseline replaces earlier unverified observations where runtime evidence is now available. No application source changes were made as part of the baseline.

## Architecture refactor verification — 2026-11-08

- Extracted shared page primitives from `src/App.tsx`, contact types/validation/transport from `src/components/contact/ContactForm.tsx`, and skills/projects feature modules. The source JSX and class names were retained; route IDs, CSS import order, lazy import boundary, contact endpoint/payload, validation rules/messages, and form status flow were preserved.
- `npm run build` passed after each extraction. Final build transformed 512 modules; the existing 905.22 kB raw Three.js hero chunk warning remains. No dependencies were added.
- Browser inspection rendered the homepage at the existing desktop viewport and successfully opened `/projects` and `/playground`; all 12 project cards and their existing filter controls were present. A screenshot from before refactoring at the same viewport/scroll position was not captured, so pixel-diff equivalence is unverified. The 320, 375, 768, 1024, 1440, and 1920 px responsive checks were not repeated in this refactor.
- During intermediate hot reload, the browser briefly recorded `ReferenceError: PointerGlow is not defined` while the extracted helper import had not yet been added. The import was restored, the app refreshed, and the homepage rendered afterward. This was a transient refactor error and is not present in the final build; the browser log also retains the existing Motion reduced-motion device-preference warning.
- No automated test or lint scripts are configured. The contact request was not submitted, so external contact delivery was not exercised.
- Remaining debt at that phase: `App.tsx` owned route composition and some cross-section behavior; `CyberLab`, `GameArcade`, `Automation`, and the 3D hero remained large feature modules. The later route extraction is recorded below.

## Route composition extraction — 2026-11-09

- Moved each route's existing section JSX into `src/features/pages/PortfolioPage.tsx`, `ProjectsPage.tsx`, and `PlaygroundPage.tsx`. `App.tsx` now owns the global shell, division lookup, navigation, section observer, and shared profile parallax effect. The page modules own their lazy feature imports; section IDs and JSX content were carried forward unchanged. Removed the unused `menu` constant after source search found no code references.
- `npm run build` passed with TypeScript and Vite; Vite transformed 515 modules. Skill and project modules now build as separate lazy chunks. The pre-existing 905.22 kB hero chunk warning remains. No dependencies were added.
- Runtime verification after this phase could not be completed: the previously used browser tab was gone, the existing localhost port was not reachable, and the replacement browser tab timed out connecting. The successful build establishes compile-time validity, not rendered equivalence. Route visuals, responsive breakpoints, and interactive behavior still need a live-browser regression check after this extraction.
- The prior refactor phase did inspect `/portfolio`, `/projects`, and `/playground` in the browser before route-page extraction; that evidence does not cover the latest page move.
- `App.tsx` still owns global division selection and cross-section observers/parallax; page section composition is now separated. `CyberLab`, `GameArcade`, `Automation`, and the 3D hero remain larger feature modules. The plan's deeper feature-boundary review and automated test setup remain outstanding. There is no test or lint script in `package.json`.

## Remaining source and metadata findings

The following issues are source-based observations; they have not all been reproduced in a browser. Priorities describe risk, not confirmed user impact.

| Priority | Affected file / component | Finding | Recommended solution |
|---|---|---|---|
| **High** | `public/sitemap.xml`, `public/robots.txt` | Both use `YOUR-DOMAIN.example`, so deployed crawler metadata points to a placeholder domain. | Replace with the deployed canonical host and include actual public division URLs. |
| **High** | `public/images/rohan-profile.png`, `src/components/navigation/DivisionNavigation.tsx` — `GlobalNavigation` | Profile PNG is about 2.03 MB and is referenced in shared navigation on all divisions. This is a likely avoidable mobile transfer cost; actual LCP impact is unmeasured. | Produce a responsive compressed derivative and compare quality and transfer before replacing references. |
| **High** | `src/components/navigation/DivisionNavigation.tsx` — `ContextualSidebar` | Sidebar remains mounted while closed, with no `inert`/hidden state in JSX. CSS visually moves it, but focusability and screen-reader exposure require browser/accessibility verification. | Ensure the closed panel cannot receive focus and is hidden appropriately; test open/close focus behavior. |
| **High** | `api/contact.js` — `contactHandler` | Origin check is conditional on both Origin and host being present; no persistent rate limiter is implemented. This leaves an abuse-control gap on a public email endpoint; no exploit was demonstrated. | Add deployment-level/persistent rate limiting and define a policy for requests without Origin. Preserve server-side secrets and current validation. |
| **Medium** | `index.html`, `src/App.tsx` | Title and description are shared; no canonical link or route-specific metadata updates are present. | Add route-appropriate metadata/canonical behavior and assess static-rendering needs for search previews. |
| **Medium** | `src/Tutorial.tsx` — `Tutorial` | A tutorial modal opens automatically when its trigger intersects the viewport unless previously marked seen. This may interrupt first-time visitors. | Consider explicit opt-in or a less interruptive first-visit presentation while retaining access to the guide. |
| **Medium** | `src/main.tsx`, `src/*.css` | Eleven CSS files are globally imported; tokens and feature overrides are distributed across the stack. This raises cascade/maintenance complexity; confirmed duplicate declarations were not systematically measured. | Map selector ownership and consolidate only proven overlaps with theme/route regression review. |
| **Resolved by refactor** | `src/App.tsx` | Route page composition has moved to `src/features/pages/`; the shell retains division selection, global navigation, section observation, and profile parallax ownership. | Keep remaining shell responsibilities cohesive or extract only with lifecycle-aware regression coverage. |
| **Low** | `docs/portfolio-redesign-plan.md` | The plan describes Lenis as installed/current, but current `package.json` and `AnimationRuntime.tsx` do not show Lenis. Documentation is stale on this point. | Update plan when it is next maintained; treat source and lockfile as current implementation evidence. |

## Areas reviewed without confirmed defects

- **Sandboxing:** `src/Playground.tsx` uses an iframe with `sandbox="allow-scripts"` and a restrictive CSP. Preserve these controls.
- **Synthetic simulations:** terminal, arcade, cyber lab, and workflow are implemented as local experiences; no external API calls were found in their source during review.
- **Contact handling:** client and server validation, size limits, HTML escaping, honeypot, server-only Resend credentials, and truthful success/error responses are present.
- **Cleanup:** inspected effects generally clean up observers, listeners, timers, intervals, frames, CodeMirror views, and GSAP contexts. This is source review, not proof of leak-free runtime behavior.
- **Responsive/reduced motion:** extensive feature breakpoints and reduced-motion rules exist; actual viewport, contrast, touch, and assistive-technology QA remains outstanding.
- **Lazy animation runtime:** source review initially raised a possible missing `Suspense` boundary. The homepage rendered successfully in the available runtime, so this is not retained as a confirmed issue. Other routes and failure conditions were not tested.
- **Build/type/lint:** production build and standalone TypeScript check passed; lint is unavailable because no lint script is defined. No test suite or unused dependency analysis was run.

## Architecture refactor continuation — 2026-11-09

- Extracted unchanged Cyber Lab sample alerts/playbook data, arcade challenge datasets, and workflow templates/types into `src/features/{cyberlab,arcade,automation}/`. Feature components retain state, effects, timers, and rendering.
- Reviewed `HeroIdentityExperience.tsx` and retained its cohesive React Three Fiber scene boundary: texture/geometry/material cleanup shares ownership with the scene and its render lifecycle.
- Final `npm run build` passed, including TypeScript. Vite transformed 517 modules. The existing 905.22 kB raw hero chunk warning remains. A static import graph scan of 34 TypeScript modules found no cycles.
- Browser verification of the latest page extraction could not be completed: local browser use is disabled in current Work settings. The prior observed browser state preceded the page split; do not treat it as visual/runtime verification of these latest route files.
- No test runner or lint script is configured, so automated behavior tests and lint were unavailable. Build/type verification does not prove runtime or responsive equivalence.
