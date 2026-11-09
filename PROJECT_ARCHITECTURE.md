# Project architecture

## Directory structure

```text
docs/                          Contact setup and earlier redesign plan
public/                         Static assets, robots/sitemap, 404 page
  images/                       Profile, project previews, company logos
src/
  app/routes.ts                 Path-to-division mapping
  components/
    contact/ContactForm.tsx      Contact form UI and interaction state
    contact/contactTypes.ts     Contact values, state contracts, initial values
    contact/validateContact.ts  Pure client-side validation rules
    contact/emailjsClient.ts    EmailJS browser transport
    socials/SocialIcon.tsx      Theme-inheriting SVG icons for profile links
    motion/AnimationRuntime.tsx  GSAP/ScrollTrigger page runtime
    navigation/                  Global navigation and contextual sidebar
    theme/                       Light/dark provider
    ErrorBoundary.tsx            Render fallback
    layout/PortfolioPrimitives.tsx Shared portfolio UI and viewport/scroll behaviors
  features/
    pages/                       Portfolio, projects, and playground composition
    skills/SkillExplorer.tsx     Skill filtering and display
    projects/ProjectGallery.tsx  Project filtering, preview, and detail dialog
    arcade/arcadeData.ts         Local challenge prompts and feedback
    cyberlab/cyberLabData.ts     Synthetic alert and playbook content
    automation/                  Workflow types, templates, and node labels
  terminal/portfolioFs.ts       Synthetic read-only terminal filesystem
  App.tsx                        Shared shell, route choice, and global behaviors
  content.ts                     Profile, skills, experience, services
  PortfolioShowcase.tsx          Compatibility exports for feature-owned views
  ExperienceTimeline.tsx         Career timeline
  Playground.tsx, CodeEditor.tsx Embedded editor and isolated preview
  Terminal.tsx, GameArcade.tsx, CyberLab.tsx, Automation.tsx
                                 Local interactive experiences
  *.css                          Global, theme, layout, and feature styling
portfolio-projects.json          Project gallery source of truth
portfolio-projects.pre-migration.json
                                 Preserved pre-migration snapshot
index.html                       Entry HTML and shared metadata/theme bootstrap
package.json / package-lock.json npm scripts, dependencies, lockfile
vite.config.ts / tsconfig*.json  Build and TypeScript configuration
```

## Application architecture

`index.html` loads `/src/main.tsx`, which mounts React under `StrictMode`, `MotionConfig`, `ThemeProvider`, and a top-level `ErrorBoundary`. It imports the global stylesheet stack. `App.tsx` reads `window.location.pathname`, selects a division through `getDivision`, and renders shared navigation, scroll controls, and that division’s sections. This is pathname selection rather than a router library; ordinary anchors navigate between divisions and section IDs.

The app uses local component state for filters, dialogs, editors, game sessions, and simulations. Theme state is shared through React context and persisted in `localStorage`. Content is local TypeScript/JSON. Several substantial components are `lazy()` loaded and placed behind `Suspense`; `DeferredChunk` additionally delays mounting until near the viewport.

## Routes and pages

| Path | Division | Main content |
|---|---|---|
| `/` | Portfolio | Hero, about, skills, project preview, experience, services, contact, profile feature |
| `/portfolio` | Portfolio | Same portfolio division |
| `/projects` | Projects | Filterable project catalog and detail dialog |
| `/playground` | Playground | Overview, code playground, terminal, arcade, cyber lab, workflow simulator |

Unknown paths fall back to the portfolio division in `getDivision`. `vercel.json` rewrites direct route requests to the SPA entry point on Vercel.

## Component relationships

- `App.tsx` is the application shell and composes shared navigation, global scroll/section observers, and route pages. `features/pages/` owns the portfolio, projects, and playground section composition; each page owns its feature-level lazy imports. Shared visual primitives and viewport/scroll behaviors are exported from `components/layout/PortfolioPrimitives.tsx`.
- `GlobalNavigation` and `ContextualSidebar` are in `components/navigation/DivisionNavigation.tsx`; the theme button uses `useTheme()`.
- Public profile URLs are maintained in `content.ts`; navbar shortcuts use GitHub and LinkedIn, while the contact panel presents all configured public social profiles with the shared inline SVG icon component.
- `ThemeProvider` reads the initial `<html data-theme>`, updates it on change, persists it, and updates the theme-color meta tag.
- `PortfolioShowcase.tsx` is a compatibility barrel exporting feature-owned `SkillExplorer` and `ProjectGallery`; the gallery reads the project JSON and uses a native `<dialog>` for details.
- `GameArcade`, `CyberLab`, and `Automation` retain their interaction state and rendering while feature-owned modules hold local prompts, sample alerts, workflow templates, and contracts. These experiences remain local simulations.
- The contact feature separates its React form UI from validation (`validateContact.ts`), shared contracts (`contactTypes.ts`), and EmailJS transport (`emailjsClient.ts`). The form accepts a typed sender function for isolated behavior while the default sender uses the EmailJS browser SDK and Vite environment configuration.
- `Playground.tsx` lazy-loads `CodeEditor.tsx` (CodeMirror) and writes editable content to a sandboxed iframe. Terminal commands use the synthetic filesystem module.
- `ErrorBoundary` is used at app and deferred-section levels; `AnimationRuntime` owns GSAP reveal setup.

## Styling architecture

`main.tsx` imports `styles.css`, `extras.css`, `premium.css`, `theme.css`, `sidebar.css`, `playground.css`, `terminal.css`, `cyberlab.css`, `arcade.css`, `playground-contrast.css`, and `home-hero.css`. `theme.css` defines shared typography, spacing, surface, color, focus, and motion tokens plus light/dark overrides. Feature styles and later global refinements are spread across multiple files; check cascade order before changing shared selectors.

## Dependencies and integrations

- Runtime/UI: React, React DOM, Motion for React.
- Tool logos: `simple-icons` SVG path data, rendered as theme-aware monochrome inline icons in the Toolkit.
- Build/type: Vite, `@vitejs/plugin-react`, TypeScript.
- Motion: GSAP/ScrollTrigger and Motion for React; React Three Fiber/Three.js power the hero scene. Lenis is not a current dependency.
- Editor: CodeMirror 6 packages and Lezer highlighting.
- Contact: EmailJS browser integration uses `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, and `VITE_EMAILJS_PUBLIC_KEY`. These are public identifiers intentionally included in the browser bundle; never put a private key or mailbox credentials in `VITE_` variables. The EmailJS template fixes the recipient and uses the visitor's email as Reply-To. Configuration is documented in `docs/contact-form-setup.md`.
- External resources: Google Fonts are loaded from `fonts.googleapis.com`/`fonts.gstatic.com`.
- The playground experiences use local/synthetic data. The code editor preview has an iframe sandbox and CSP; no external APIs are used by those simulations.

Available npm scripts are `dev`, `build` (`tsc -b && vite build`), and `preview`. No lint/test script is defined.
