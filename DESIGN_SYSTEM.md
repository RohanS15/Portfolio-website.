# Design system

This guide records current source-defined values and patterns; it does not prescribe a redesign.

## Colors and themes

Shared values are defined in `src/theme.css`; feature styles add local tokens.

| Token | Light | Dark |
|---|---|---|
| Page `--paper` | `#f5f6f8` | `#121318` |
| Text `--ink` | `#191b25` | `#f1f1f4` |
| Muted text `--muted` | `#666b7b` | `#b1b2bd` |
| Border `--line` | `rgba(83,95,145,.2)` | `#363740` |
| Accent `--accent` | `#6358dc` | `#a39cff` |
| Signal `--signal` | `#278b82` | `#6ce6d2` |
| Action background | `#1e7069` | `#6ce6d2` |

Dark mode uses charcoal surfaces and teal signal highlights; light mode uses cool white/gray surfaces, purple accent, and teal signal. Feature components may define their own tokens and theme overrides, particularly playground, terminal, arcade, cyber lab, and workflow views.

## Typography

- Body and display: Manrope, with Inter/Arial fallbacks.
- Monospaced interface text: DM Mono, with system monospace fallbacks.
- Fonts are requested from Google Fonts in `index.html`.
- Token scale: caption `0.75rem`, label `0.6875rem`, body `1rem`, lead `1.125rem`, section `clamp(2.25rem, 5vw, 4rem)`, display `clamp(3rem, 8vw, 7rem)`.
- Tight/heading/body line heights are `0.96`, `1.08`, and `1.62`; display letter spacing is `-0.055em`, label tracking is `0.12em`.

## Spacing and layout

Shared spacing tokens run from `0.5rem` through `5.5rem`; section spacing is `clamp(3.25rem, 7vw, 6.5rem)`. Content max width is `85rem`; side gutters use `clamp(1.25rem, 5vw, 4.5rem)`. Root scroll padding is `112px` for anchored navigation. Cards and sections use a mix of editorial grids and specialized tool panels; feature CSS may add local spacing rules.

## Buttons and interaction

Primary and quiet/secondary buttons use theme-aware colors. Controls are implemented with semantic buttons/links, active filter states use `aria-pressed`, and theme/menu controls have accessible labels. Shared focus styling uses a 3px color-mixed ring. Existing interaction patterns include modest card lifts, filter feedback, dialogs, scroll controls, and sidebar navigation. Preserve keyboard and touch access when changing them.

## Responsive breakpoints

The CSS uses feature-specific breakpoints rather than one centralized scale. Common thresholds in the source include `1100px`, `1000px`, `980px`, `900px`, `860px`, `800px`, `760px`, `700px`, `680px`, `580px`, `480px`, `430px`, `420px`, `390px`, `380px`, `360px`, and `340px`. Check the affected feature stylesheet before choosing a breakpoint; do not assume every feature shares the same behavior.

## Animation principles

- GSAP/ScrollTrigger: shared hero sequence and `.reveal` behavior in `AnimationRuntime.tsx`.
- Motion for React: component feedback and transitions.
- CSS: ambient grid, light decoration, and simple transitions.
- `MotionConfig` follows the user reduced-motion setting; preserve reduced-motion fallbacks and keep all essential information available without motion.
- Do not let multiple systems animate the same element. Clean up observers, event handlers, timers, animation contexts, and frames.

## Visual identity

The source combines cinematic dark surfaces, understated grids/lighting, teal/cyan signal accents, selective purple, uppercase mono labels, generous section spacing, and refined cards. Maintain readable contrast and restrained effects in both themes. Toolkit brand SVGs inherit the theme accent as monochrome marks so their color stays consistent with the glass surfaces.
