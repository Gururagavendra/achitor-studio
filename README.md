# Achitor — Studio Website

Production static website for **Achitor**, a design/engineering studio. Built as a pixel-faithful recreation of the studio's UI/UX design — no frameworks, no build step, no dependencies.

## Tech stack

- **HTML5** — semantic, accessible markup
- **CSS3** — one stylesheet, organised by section, driven entirely by CSS custom properties (colour, type, spacing, radius, shadow, motion)
- **Vanilla JavaScript (ES6)** — no libraries; progressive enhancement only

No React/Vue/Angular, no Tailwind/Bootstrap, no npm, no bundler. Open `index.html` in a browser and the whole site works.

## Project structure

```
/
├── index.html          Home page (hero, work, services, studio, process, testimonials, CTA)
├── contact.html         "Start a project" page
├── style.css            All styles: variables → reset → utilities → components → animations → responsive
├── script.js            All behaviour: scroll reveals, parallax, cursor, magnetic buttons, tilt, page transitions
├── .gitignore
└── assets/
    ├── icons/
    │   └── favicon.svg
    └── images/
        └── *-desktop.jpg / *-mobile.jpg   Case-study screenshots (see Case studies below)
```

## Running locally

No build step. Either:

- Open `index.html` directly in a browser, **or**
- Serve the folder with any static file server, e.g. `npx serve .` or the VS Code "Live Server" extension.

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. Repo → **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` / `(root)`.
3. Site goes live at `https://<username>.github.io/<repo>/`.

No CI, no build artifacts required — it's already the deployable output.

## Features

- Fluid, mobile-first responsive layout (CSS `clamp()` throughout, no fixed breakpoints for typography/spacing)
- Scroll-triggered reveals, staggered grid/list entrances, hero intro sequence
- Parallax drift on hero orbs and case-study mockups
- Magnetic buttons, 3D tilt on browser-frame mockups, cursor-tracked service-card glow
- Custom cursor (dot + trailing ring) on desktop/fine-pointer devices only
- Soft fade transition between Home ↔ Contact
- Back-to-top button with a scroll-progress ring
- Subtle film-grain texture overlay
- Every animation respects `prefers-reduced-motion: reduce` and degrades to an instant, fully-visible state
- Pointer-driven effects (tilt, magnet, cursor, glow) are gated behind `(hover: hover) and (pointer: fine)` so touch devices aren't penalised

## Accessibility

- Landmark elements (`header`, `nav`, `main`, `footer`), one `h1` per page, logical heading order
- Skip-to-content link, visible focus states on all interactive elements
- Decorative elements (orbs, grain, browser-chrome dots, mobile screenshot duplicates) marked `aria-hidden="true"`
- Meaningful `alt` text on the primary (desktop) case-study screenshots
- Reduced-motion and higher-contrast media queries

## Case studies

The four portfolio pieces use real screenshots of live client sites, each linked from its case study card:

| Project | Live site |
|---|---|
| Hamorge | https://hamorge.com |
| OurArtworks | https://ourartworks.store |
| KidsCorp | https://kidscorp.in |
| Dhanajeeva ML Labs | https://dhanajeevamlabs.com |

## Browser support

Latest Chrome, Safari, Firefox, Edge. Uses modern CSS (`clamp()`, `aspect-ratio`, custom properties, `backdrop-filter`) — no fallbacks for legacy browsers.

## License / usage

© 2026 Achitor Studio. All rights reserved. This repository is private and intended for internal/client use, not for public redistribution.
