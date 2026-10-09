# Constellation Labs: brief

medium: web (marketing site, 7 routes)
owner: claude
Full history and product facts: HANDOFF.md (co-work handoff, kept as source).

## Deliverable
constellationlabs.cc. Index, four product pages (/acre /pinpoints /prism /nod), /invest, /build, 404.

## Audience and feeling
Investors and prospective clients. Leave them sure these products are real, built and launched, and that the studio can do the same for them. Two doors: build, or invest.

## References
- content-ref: _refs/design-library/reference-sites/google-labs
- craft-ref: _refs/design-library/reference-sites/uxconstellation-current
- approved comps: design/comp-v1-*.png

## Dials
design variance 8, motion 8, density 4.

## Tool route
Vite React + GSAP ScrollTrigger + Three (glass mark). Host: Cloudflare (Workers static assets), TBD until deploy.

## Never
- Em dashes. The word "Legend".
- Client names or usage claims. Invented metrics, numbers, raises or valuations.
- Recycled main-site art or copy (clouds, flight icons, astronaut).
- Arial Black caps. Pure white surfaces.
- Acre demo logins.
- (2026-10-09) Co-work's integration: main-site journey layout reused as-is, cramped stage panels, tacked-on thumbnails. Aldo: "design, layout and consistency aren't on par".
- (2026-10-09) One full-bleed sheet per product. Aldo: "isn't scalable and doesn't give any information about what labs is and why we build."

## Always
- Feel like experiments: the brand liquid (main-site RadialLiquid) with grain, and every product page has its own hands-on "Try it" experiment plus lab notes (hypothesis, not results).
- Ventures are illustrated trading cards on a Google Labs style shelf; adding one is one entry in products.ts.
- Say what Labs is and why we build, in plain words, near the top.
- Keep the four motion scenes exactly as animated, and the patch badges.
- Product facts only from src/content/products.ts.
- prefers-reduced-motion shows the finished frame.
