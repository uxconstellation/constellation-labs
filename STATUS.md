# Constellation Labs: status

## Current truth (2026-10-11)
- Stage: LAUNCH PENDING. Aldo approved ("I love it, please launch it!", 2026-10-11). Waiting on slop-review round 9 (contact page + switch fix), then publish with wrangler from this folder.
- Production home: https://labs.constellationlab.cc (Workers custom domain on the studio zone, route in wrangler.toml). constellationlabs.cc is NOT registered (NXDOMAIN 2026-10-11); buying it or using labs.uxconstellation.com is Aldo's call.
- Review link: https://constellation-labs-review.aldo-144.workers.dev (same Worker; noindex set by worker/index.ts on workers.dev hosts only). Last published version 1404705e-a2f1-4c5f-ae49-9525935d76aa (2026-10-09, pre contact page).
- Worker: worker/index.ts serves dist and POST /api/contact (Cloudflare Email Sending, from labs@send.constellationlab.cc to CONTACT_TO = aldo@uxconstellation.com in wrangler.toml). Account pinned in wrangler.toml.
- Contact funnel (Aldo 2026-10-11: "contact form stays on the labs side, so we can track the funnel"): /contact page (src/pages/Contact.tsx); every enquiry CTA routes to /contact?intent=invest|build|prism|pinpoints|nod. Each lead email carries intent, from page, landing, referrer, UTM, page path (src/lib/journey.ts, sessionStorage). scripts/probe-contact.mjs 8/8 under wrangler dev.
- Prism and Nod switch knobs fixed (no left anchor, slid off track). scripts/probe-switch.mjs OK.
- Home: C:\Dev\products\constellation-labs (git, not pushed; target uxconstellation/constellation-labs). Dev: `labs-dev` in C:\Dev\.claude\launch.json (port 5191, Vite only, no /api); full stack: build then `npx wrangler dev --port 8799 --local`.
- Site: index (hero, trading-card shelf, what Labs is, why we build, stage track, two doors, patch-pile footer), /acre /pinpoints /prism /nod (hero loop + Try it experiment + lab notes, per-venture section order), /invest, /build, /contact, 404. Brand liquid (main-site RadialLiquid as grained shader) throughout.
- Checks: tsc clean, vitest 4/4, build OK. Probes in scripts/: shots, walk-live, probe-signatures, probe-titles, probe-labels, probe-liquid, probe-switch, probe-contact.

## Next
1. Round 9 PASS, then build and publish; walk https://labs.constellationlab.cc (scripts/walk-live.mjs), run scripts/probe-contact.mjs live with one clearly labelled test lead, ask Aldo to confirm it arrived.
2. Update REGISTRY row and _helm/projects/constellation-labs.md with the production URL and version id.
3. Main-site "switch to Labs" hero button: queued as a separate task (cosmic-launchpad, Lovable-synced; no push or publish without Aldo).

## Open decisions (Aldo)
- Domain: buy constellationlabs.cc, or labs.uxconstellation.com once that zone moves to Cloudflare, or keep labs.constellationlab.cc.
- Pinpoints live URL (CTA is the invite form until then). Plato Coffee named on /nod; Acre screenshot shows dashboard figures (24 listings, 92% compliance).
- GitHub remote uxconstellation/constellation-labs: push?

## Log
- 2026-10-09: rebuilt from the co-work baseline (c5d86ec): cards, liquid, distinct product pages; review link published; slop review PASS round 8.
- 2026-10-11: switch fix, Labs contact page and Worker, production route; files: src/pages/Contact.tsx, src/lib/journey.ts, worker/index.ts, wrangler.toml, src/App.tsx, src/content/products.ts (+test), src/pages/Invest.tsx, src/pages/Build.tsx, src/components/build/PatchMaker.tsx, src/components/layout/Footer.tsx, src/components/signature/PrismToggle.tsx, NodRoom.tsx, index.html, scripts/probe-*.mjs.
