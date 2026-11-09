# Rohan portfolio

A single-page React + TypeScript portfolio with an intentionally small dependency footprint. `src/App.tsx` composes the site, `src/content.ts` holds editable identity, skills, and timeline content, and `portfolio-projects.json` is the source of truth for the project gallery. The four existing projects are preserved in that catalog and the complete pre-migration snapshot is `portfolio-projects.pre-migration.json`. The interactive areas are isolated in `src/PortfolioShowcase.tsx`, `src/Playground.tsx`, `src/GameArcade.tsx`, and `src/CyberLab.tsx`.

## Local development

1. Install Node.js 20+.
2. Run `npm ci` to install the exact dependency versions in the lockfile.
3. Run `npm run dev` and open the local URL printed by Vite.
4. Run `npm run build` to create the static site in `dist/`.

## Site experiences

- `/portfolio` contains professional identity, skills, experience, services, and contact information. `/` opens this experience.
- `/projects` contains the project catalog defined by `portfolio-projects.json`.
- `/playground` contains the coding playground, simulated terminal, arcade, cyber lab, and workflow experiment.

The global glass navigation and shared theme control live in `src/components/navigation/DivisionNavigation.tsx`. Route selection is centralized in `src/app/routes.ts`; native links preserve browser history and support direct URLs through Vite's SPA fallback. Experience specific sidebars link only to sections present in that view.

## Before publishing

- Update `src/content.ts` with the verified public name, email, resume, GitHub, and LinkedIn URLs.
- Replace `YOUR-DOMAIN.example` in `public/robots.txt` and `public/sitemap.xml` only if a custom domain is added.
- Add only verified experience, project outcomes, certifications, and testimonials.
- Vercel uses `vercel.json` to route direct visits to the SPA. Unknown app paths currently fall back to the portfolio division.

The contact form sends through the EmailJS browser SDK to a service and template configured in the EmailJS dashboard. To set it up, follow [docs/contact-form-setup.md](docs/contact-form-setup.md). Copy `.env.example` to `.env.local` and fill in `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, and `VITE_EMAILJS_PUBLIC_KEY` for local development. The same values must be added to Vercel before deployment. These are EmailJS public identifiers; never put an EmailJS private key, mailbox password, OAuth token, or other secret in a `VITE_` variable. The free EmailJS plan currently allows 200 requests per month. The editor runs sample JavaScript only in an iframe with `sandbox="allow-scripts"` and a restrictive content security policy. The security lab, workflow, and terminal use local synthetic data and make no network requests.

The hero uses a lightweight Canvas particle field and a CSS 3D object so the page remains usable without WebGL. The editor is a lightweight custom textarea with token coloring rather than Monaco; it avoids loading a large editor bundle for two small examples.

## Deployment

The app builds to static assets and is configured for Vercel. Import the GitHub repository, use `npm ci` as the install command, `npm run build` as the build command, and `dist` as the output directory. `vercel.json` provides the SPA fallback for direct route visits. EmailJS sends contact messages directly from the browser, so no Vercel Function or custom domain is required for the form.
