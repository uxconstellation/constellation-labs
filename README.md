# Constellation Labs

The products wing of Constellation, at constellationlabs.cc. One index page plus a page per product: Acre, Pinpoints, Prism and Nod.

Same stack as the main Constellation site (uxconstellation/cosmic-launchpad): Vite, React 18, TypeScript, React Router, Tailwind 3, Framer Motion, GSAP, Three.js.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # type check and production build
npm test         # content checks
```

## Where things live

| What | Where |
|---|---|
| Every product's copy, status, links and accent | `src/content/products.ts` |
| Colour tokens | `src/index.css` (`:root`) and `tailwind.config.ts` |
| Labs mark (colour, mono, small) | `src/components/brand/LabsMark.tsx` |
| Logo lockup | `src/components/brand/LabsLogo.tsx` |
| Header, footer, page transitions | `src/components/layout/` |
| Pages | `src/pages/` |
| IA and page outlines | `docs/01-IA-and-page-outlines.md` |
| Look and feel concept | `design/labs-look.html` |

## Brand rules

- White-first. Constellation CI dark is the text colour, CI cream the soft surfaces.
- Orange (#FE6E36) is for fills and buttons with ink text, never for text. Links use orange ink (#C2410C).
- Each product keeps its own accent, used only on its own card and page.
- No em dashes in copy. A test enforces this for product content.
- Every animation needs a reduced-motion version.

## Fonts

Satoshi loads from Fontshare. Noken is a licensed font: drop `noken-bold.woff2` into `public/fonts/` and headings switch to it automatically. Until then they fall back to Arial Black.

## Deploy

Any static host. `public/_redirects` handles client-side routes on Cloudflare Pages. Point `constellationlabs.cc` at the project, and `acre.constellationlabs.cc` at the Acre app, then update `LINKS.acre` in `src/content/products.ts`.
