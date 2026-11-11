# Website Audit Scorecard

Baseline assessment before any improvements. Each score is evidence-based from the audits conducted.

| Category | Score | Evidence |
|----------|-------|----------|
| **Code Quality** | 7/10 | Build passes (`npm run build` ✓), TypeScript strict mode on, no lint/test scripts defined. Dead CSS selectors (`.topbar`, `.nav`, `.hero-grid`, `.particles`) present in 3+ files. Duplicate `:root` theme blocks across `theme.css`, `styles.css`, `sidebar.css`, `premium.css`. Unused imports in `HeroIdentityExperience.tsx` (`css` from `@codemirror/lang-css`, `html` from `@codemirror/lang-html`). No automated tests. |
| **UI/UX Quality** | 8/10 | Cohesive dark/light theme with CSS custom properties. Premium glassmorphism surfaces on playground tools. Good visual hierarchy in hero and sections. Consistent iconography (Simple Icons + monogram fallbacks). Some responsive breakpoints are feature-specific rather than centralized (17+ distinct breakpoints). |
| **Performance** | 6/10 | Build output: 3 chunks >500KB (`HeroIdentityExperience` 905KB, `CodeEditor` 482KB, `index` 422KB). ~2MB profile image (`rohan-profile.png`). Google Fonts loaded remotely (no preload/fallback). No image optimization pipeline. Lazy loading via `DeferredChunk` + `IntersectionObserver` on playground tools. No service worker. Lenis + GSAP + Motion + CSS animations coexist — potential for redundant work. |
| **Responsive Design** | 7/10 | Mobile-first CSS with extensive breakpoint coverage (320px–1920px). Sidebar converts to drawer <700px. Hero reflows at 960px/600px. Playground/terminal/arcade/cyberlab have dedicated mobile layouts. Some components (filter bars, project grid) stack to single column. No horizontal overflow observed in source. |
| **Animation Quality** | 7/10 | Clear ownership split: GSAP/ScrollTrigger for hero/reveals (`AnimationRuntime.tsx`), Motion for component interactions, CSS for ambient/transitions. `MotionConfig reducedMotion="user"` respects OS preference. Cleanup of observers, timers, contexts in `AnimationRuntime` and components. **Risk**: `.hero-grid` rules exist in 4 CSS files but no `.hero-grid` element in current JSX — stale selectors may conflict. |
| **3D Implementation** | 7/10 | `@react-three/fiber` scene in `HeroIdentityExperience.tsx` with interactive cube, orbit tracks, label projection, responsive camera, theme-aware materials/textures. Proper disposal of geometries, materials, textures, environments in `useEffect` cleanup. Fallback for reduced-motion/unsupported clients. **Issue**: Import uses `three/addons/geometries/RoundedBoxGeometry` — Three.js 0.182 moved this to `three/examples/jsm/geometries/`. Build succeeds (Vite resolves via `examples/jsm` export) but import path is technically incorrect for this version. |
| **Accessibility** | 7/10 | Semantic landmarks (`header`, `main`, `section`, `footer`, `nav`, `aside`). Skip links on each division. `aria-label`, `aria-pressed`, `aria-current`, `aria-live` on interactive elements. Focus-visible rings (3px accent). Reduced-motion honored in JS and CSS. **Gaps**: Some `img` lack meaningful `alt` (profile photo `alt=""`), dialog focus trapping relies on native `<dialog>`, color contrast not programmatically verified. |
| **Security** | 8/10 | EmailJS public keys only (no private keys in repo). `.env.local` gitignored. Honeypot field on contact form. Client validation + server-side EmailJS validation. CSP on playground iframe (`sandbox="allow-scripts"`, nonce-based script-src). No `dangerouslySetInnerHTML`. No external script injection. **Note**: EmailJS free tier = 200 req/mo; no rate-limit UI. |
| **SEO** | 5/10 | `index.html` has title, description, OG tags, theme-color, favicon. `vercel.json` SPA rewrite. `public/sitemap.xml` and `robots.txt` contain placeholder `YOUR-DOMAIN.example`. No structured data (JSON-LD). No canonical URLs. No `robots` meta. Social images not configured. |
| **Test Coverage** | 2/10 | No test script in `package.json`. No unit, integration, or E2E tests. No lint script. Type checking only via `tsc -b` during build. Manual verification only. |

## Overall Baseline Score: **6.4 / 10**

## Post-Improvement Target (after Phase A–E)

| Category | Target | Key Drivers |
|----------|--------|-------------|
| Code Quality | 9/10 | Remove dead CSS, consolidate theme tokens, add lint + unit tests |
| UI/UX Quality | 9/10 | Centralize breakpoints, verify contrast, refine mobile polish |
| Performance | 8/10 | Code-split hero/editor chunks, optimize profile image, add font preload, SW |
| Responsive Design | 8/10 | Centralized breakpoint tokens, visual regression testing |
| Animation Quality | 8/10 | Remove stale `.hero-grid` rules, verify no dual-ownership |
| 3D Implementation | 8/10 | Fix Three.js import path, add WebGL context loss handling |
| Accessibility | 9/10 | Add meaningful alt, focus trapping, contrast audit, reduced-motion parity |
| Security | 9/10 | Add rate-limit UI, CSP headers, dependency audit |
| SEO | 8/10 | Real domain in sitemap/robots, JSON-LD, canonical, social cards |
| Test Coverage | 7/10 | Vitest unit tests, Playwright E2E for critical paths, CI integration |

---

**Scoring Methodology**: Each category scored 1–10 based on observable evidence in source, build output, and configuration. 10 = production-best-practice with automated verification; 1 = critical gaps with user-facing failures. Scores are not subjective preferences — they reflect measurable criteria (build warnings, bundle sizes, missing files, spec compliance).