# Build rules (both directions)

Read with `BRIEF.md`, `DUPLICATION.md`, your `DIRECTION-*.md`, `research/site-content.md`, `research/games.json`, `assets/manifest.json`.

## File contract
- Author `<direction-dir>/page.html` to the **Artifact page contract**: no `<!doctype>`, `<html>`, `<head>` or `<body>` tags. Start with `<title>`, then the Google Fonts `<link>`, then one `<style>`, then the markup, then scripts at the end. The host wraps it in a skeleton with a charset, viewport (`viewport-fit=cover`), a small reset (`body{margin:0}`, `img{max-width:100%}`, `[hidden]{display:none!important}`, `:root` safe-area padding). `qa/shoot.mjs` reproduces that skeleton and writes `<dir>/index.html` as the standalone copy. Never edit `index.html` by hand.
- `<title>`: `Six Peaks Games · Game QA Studio`-style name, keeping the SEO terms "Game QA Studio" and "Embedded Game Testing" somewhere in the title or the H1/meta copy.
- **Scripts**: only from cdnjs, pinned: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js` and `.../gsap/3.12.5/ScrollTrigger.min.js` (the harness serves these locally because cdnjs is blocked in this container). No other libraries. All other JS inline.
- **Fonts**: Google Fonts only, with real fallback stacks.
- **Images**: relative paths `assets/...` (each direction dir has a symlink `assets -> ../assets/web`). Use `loading="lazy"` and `decoding="async"` below the fold, and `width`/`height` attributes. No external image hosts (CSP blocks them).
- **Data**: embed the game data you need as an inline JSON `<script type="application/json" id="games">` generated from `research/games.json` by a small script (keep text verbatim). No fetch at runtime.
- **Routing**: hash tokens only (letters, digits, `-`): e.g. `#home`, `#logbook`, `#log-lost-skies`. Each route renders its own page tree. Back/forward must work (`hashchange`). Scroll to top on route change; restore ScrollTriggers (`ScrollTrigger.refresh()`) after rendering.
- **No iframes or embeds** (YouTube is blocked): trailers are a link-out card using one of our own shots as the image.
- **Forms**: handle `submit` with `preventDefault()`; show an inline confirmation that says this preview does not send anything and that on the live site the request goes to the Six Peaks team. Show email and phone as selectable text with a copy button (`navigator.clipboard.writeText` inside the click handler, catch rejection, fall back to selecting the text). Never claim a message was sent.
- **Theme**: single deliberate dark world. `:root{color-scheme:dark}`, every colour a token on `:root`, explicit `body` background. No light/dark media blocks needed.
- **Size**: keep the page under 1 MB of HTML; images stay as files.

## Motion
- GSAP 3.12.5 + ScrollTrigger for every non-trivial animation (decision 0013). CSS transitions only for hovers/focus.
- **Complete at rest**: everything meant to be read is visible on first paint without scrolling or JS having run. Never leave content at `opacity:0` waiting for a ScrollTrigger. Reveal with transforms, clip-path or masks from a visible state, or set the from-state only inside an `onEnter` callback. A thumbnail of the page must show real content.
- `prefers-reduced-motion: reduce`: no scrubbed camera moves, no auto-advancing carousels, no parallax; everything rendered in its final state.
- Easing: `power2/3/4`, `expo`, `sine`. No bounce, no elastic, no back overshoot.
- Pin only on desktop (`gsap.matchMedia()` at `(min-width: 900px)`); mobile gets a stacked, unpinned version of every pinned section.

## House law (slop gate items; QA will check each)
- No em dashes (—) and no spaced en dashes ( – ) anywhere in copy. Use commas, colons, full stops.
- No scroll-prompt microcopy ("scroll", "scroll to explore", chevrons that say scroll).
- Every hero has a primary and a secondary CTA.
- Headings never wrap past three lines at any width (test 390px).
- No drop shadows (`box-shadow`/`text-shadow`/`filter: drop-shadow`) and no glows. Separate layers with fills, hairlines or outlines.
- No gradient text. No side-border accent bars on cards. No 01/02/03 numbered eyebrows (a real sequence may be named, e.g. camps).
- No marketing buzzwords (seamless, cutting-edge, world-class, unleash, elevate, next-level, game-changer, revolutionise, supercharge, best-in-class unless quoting the site verbatim inside a quote).
- Fonts: not Inter, not Space Grotesk, not Roboto as display.
- Click controls, not drag, for carousels and sliders. Every control keyboard operable with a visible focus state (2px outline, offset 3px).
- Real logos and real imagery only. Never draw a fake logo or a fake game.
- Claims: only what the site says. ISO 27001 = "adherence". The four underway titles (Warhammer Survivors, Warhammer 40,000: Boltgun 2, The Witch's Bakery, King Of Tokyo) never as hero art, never with focus claims.
- Partner credit on every game appearance. Testimonials verbatim with name, role and studio as on the site.
- Do not imply the partners' games had bugs. Overlays show coverage and checks ("Covered", "Checked"), not defects found in their games.

## Accessibility (ship blocker, L4)
WCAG 2.2 AA: contrast via tokens (small text ≥ 4.5:1, large ≥ 3:1), skip link, landmarks, one H1 per route, ordered headings, alt text on every content image (game art alt = "<Game> key art", logos = "<Studio> logo"), `aria-current` on active nav/rail items, buttons are `<button>`, links are `<a>`, carousels pausable, no keyboard traps.

## Verification (stage-5 hygiene; qa-verifier still closes)
1. `node qa/shoot.mjs <dir> home,<listing-hash>,<detail-hash> --steps 10`
2. `python3 qa/sheet.py qa/shots/<dir>/sheet-desktop.jpg qa/shots/<dir>/home-desktop-s*.jpg --cols 4 --w 420` (and mobile, and the other routes), then OPEN each sheet with the Read tool and judge it against your spec and the six design bars. Fix and re-run until: 0 console errors, 0 failed requests, no horizontal overflow at 390px, axe violations 0 (report rules passed + nodes as the denominator), every section visible and composed at both widths.
3. Copy 6 to 8 representative frames into `<dir>/proof/` (JPEG, max 1440 wide).
4. Write `<dir>/README.md`: route list, section-by-section reference vs deviation, motion list, the final QA numbers, known gaps.
Do not commit or push; the line manager does.
