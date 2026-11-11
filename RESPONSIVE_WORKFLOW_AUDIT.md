# Responsive Workflow Audit

Date: 2026-11-11

## Responsive changes

- Canvas mode and zoom controls wrap and grow to comfortable touch targets on tablet/mobile.
- At narrow widths the canvas receives a viewport-relative height with a usable minimum, and preserves intentional two-axis canvas navigation.
- Node settings are hidden until requested on mobile, open from a visible Settings control, scroll within a bounded panel, and have a Close control.
- Execution actions stack full-width below 480px and remain wrapping flex controls at larger widths. The status column alone uses grid layout; this avoids the screenshot issue where the status layout rule collapsed and overlapped the action buttons.
- Execution path tabs scroll horizontally when needed; logs wrap long details.

## Requested viewport matrix

Browser resizing is disabled in the current Work settings, so no runtime screenshots or viewport measurements were possible. The following widths remain pending visual verification:

320px, 360px, 375px, 390px, 414px, 430px, 600px, 768px, 820px, 1024px, 1280px, 1440px, 1920px; tablet portrait and landscape; short mobile landscape.

Source breakpoints used are 760px and 480px, plus fluid sizing and wrapping. They are not device-specific one-off viewport rules.
