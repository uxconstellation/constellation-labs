# Constellation Labs: status

## Current truth (2026-10-09)
- REVIEW LINK: https://constellation-labs-review.aldo-144.workers.dev (Cloudflare Workers, Aldo@uxconstellation.com's Account, version 1404705e-a2f1-4c5f-ae49-9525935d76aa, X-Robots-Tag noindex). Publish: `npm run build`, then wrangler from this folder (account pinned in wrangler.toml). Live walk scripts/walk-live.mjs: 8/8 routes, 0 console errors, images 2/2. Stage: Aldo review.
- Home: C:\Dev\products\constellation-labs (git, not pushed; target uxconstellation/constellation-labs). Baseline import c5d86ec.
- Built: index, /acre /pinpoints /prism /nod, /invest, /build, 404. Dev: `labs-dev` in C:\Dev\.claude\launch.json (port 5191).
- Index order: hero (Made in Labs., glass mark, patch orbit) > trading-card venture shelf (Google Labs shelf) > What Labs is (colour sweep) > Why we build > How a venture grows (stage track) > Two ways in (invest/build doors) > patch-pile footer.
- Aldo 2026-10-09 rejected one-sheet-per-product chapters ("not scalable, no info on what Labs is and why we build"). Replaced with data-driven trading cards: adding a venture = one entry in src/content/products.ts (kind, color, stage); house patch fallback if no bespoke art.
- Product pages (2026-10-09, Aldo: "make the product pages distinct", likes the liquid, "feel like experiments"): Try it per venture in src/components/signature (AcreDeal scroll-run deal, PinpointsPlayground, PrismToggle, NodRoom), Lab notes with products.ts `hypothesis`, per-venture hero gesture. scripts/probe-signatures.mjs drives all four at 1440 and 390: PASS.
- Toolchain: SWC native binding blocked by a cache-dir ACL on this machine, switched to @vitejs/plugin-react (Babel). Lockfile regenerated on Windows.
- Checks: tsc clean, vitest 4/4, build OK (main chunk 196 KB gzip, Three chunk lazy). Screenshots via scripts/shots.mjs (Playwright).
- SLOP-REVIEW.md: PASS round 8 (2026-10-09, distinct product pages). Remaining taste flags in SLOP-REVIEW.md; Aldo to see renders before "done".
- Not done: Pinpoints live URL (CTA is an invite mailto until then), production host for constellationlabs.cc, GitHub remote, route code-splitting.
