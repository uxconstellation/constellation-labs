# Constellation Labs: status

## Current truth (2026-10-09)
- Home: C:\Dev\products\constellation-labs (git, not pushed; target uxconstellation/constellation-labs). Baseline import c5d86ec.
- Built: index, /acre /pinpoints /prism /nod, /invest, /build, 404. Dev: `labs-dev` in C:\Dev\.claude\launch.json (port 5191).
- Index order: hero (Made in Labs., glass mark, patch orbit) > trading-card venture shelf (Google Labs shelf) > What Labs is (colour sweep) > Why we build > How a venture grows (stage track) > Two ways in (invest/build doors) > patch-pile footer.
- Aldo 2026-10-09 rejected one-sheet-per-product chapters ("not scalable, no info on what Labs is and why we build"). Replaced with data-driven trading cards: adding a venture = one entry in src/content/products.ts (kind, color, stage); house patch fallback if no bespoke art.
- Toolchain: SWC native binding blocked by a cache-dir ACL on this machine, switched to @vitejs/plugin-react (Babel). Lockfile regenerated on Windows.
- Checks: tsc clean, vitest 4/4, build OK (main chunk 196 KB gzip, Three chunk lazy). Screenshots via scripts/shots.mjs (Playwright).
- SLOP-REVIEW.md: PASS (round 3, 2026-10-09) with taste flags awaiting Aldo: product pages share one template, repeated 3-card rows and 01/02/03 numbering, scene text ~5px at 390, confirm Plato Coffee and Acre dashboard figures.
- Not done: Pinpoints live URL (LINKS.pinpoints placeholder), deploy host, route code-splitting.
