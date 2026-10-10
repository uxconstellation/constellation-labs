# Direction A (round 2): Bug Hunt (visual plan)

**Status:** approved by Aldo on 2026-10-10 from the reference board (https://claude.ai/artifact/2qqg2VFWCcjLw9MUJRZ3pJ). His rulings: build Bug Hunt; planted bugs allowed **only as labelled demo faults in our own level**; level drawn in **pixel art**.
**Replaces:** The Ascent (`direction-a-ascent/`, kept for history). **Must stay structurally different from B** (Press Start: key-art hero, library grid, dossiers, frozen; never edit or copy its HUD/brackets/chips/hint bar).

## Thesis
The site is a test build you play. The visitor is the tester. You run and jump across the six peaks of the Six Peaks logo, log the eight bugs planted in our own level (one per service), meet the nine partners (their real quotes), pass the 13 shipped games as landmarks, and reach the summit for a run report next to Book a trial. A complete, readable manual (the traditional site) sits under the game, so playing is optional and nothing waits on play.

## References (duplicate, then deviate)
- **content-ref: `undead-fish-studio`** (`research/references/undead-fish-studio/teardown.md`, HM 4 Sep 2026). Duplicate its structure: title overlay with an ENTER control over the live world; a game layer with a goal counter (`MET 0/7`), HELP, and an always-visible "traditional site" exit; NPCs that open dialogue boxes with references; contact as a place (the post office) that opens an inline form; the traditional site rendered below the game in the DOM (`main > game div (h-screen) + traditional site div`). Help text pattern: "Arrow keys walk. Space talks... Escape steps back out."
- **craft-ref: `lepopee-steven-dieu`** (`research/references/lepopee-steven-dieu/teardown.md`, HM 16 Sep 2026). Duplicate its craft: canvas 2D + vanilla JS platformer (run, jump), HUD count `n / 9` + timer, each catch opens an in-game card, the villains are bugs, a cover with two doors (Play / See projects) and a sound toggle, an end screen that turns the run into contact, a non-game route to the same content, "Turn your phone" handling.
- **Single mechanics** (board): BEIGE FORCE!! (bug bestiary + attract mode behind the title), Lacoste Ace Breaker (the six pillars as six power-ups), The Tie-break (every logged bug reveals real content), SuperPlay (team photos as pickups; the "QA" of "Beyond standard QA" is a start control), Ink Games (a burst of glyphs through the headline on each log), Overworld Audio (the logo shaped into the world; a sound gate, off by default).
- **Spike** (`prototypes/webgl-spike/`): reuse the bug-hunt feel (reticle lock, report ticket printing with a REPORTED stamp, n/N counter, hint, replay) restyled in pixel art. Do NOT reuse its reward that pairs partner art with "Imagine what our testers find" (it could read as bugs in a partner game). No three.js in A: pixel art runs on canvas 2D.

## Pixel art direction (Aldo chose pixel art)
- **Render:** one canvas at an internal **384x216** (16:9), integer-scaled to fill the game viewport with `image-rendering: pixelated`; camera follows the tester; 3 parallax layers. Fixed-timestep loop (60 Hz), paused when hidden or off-screen.
- **Palette (tokens, 24 max):** night `#0B0E17`, deep `#141B2B`, ridge-far `#3A4A66`, ridge-mid `#2A3650`, ridge-near `#1B2436`, snow `#F2F5F8`, snow-shade `#B9C6D6`, rock `#59667A`, grass `#3E8E4E`, grass-dark `#245C35`, wood `#8A5A3B`, wood-dark `#4C3125`, paper `#F3E8D2`, ink `#1A1420`, **brand red `#E02B20`** (route, flag, hits, primary buttons with white text), red-light `#FF6A4D`, gold `#F2B33D`, sky-dawn `#F08A5D`, **missing-texture magenta `#FF2BD6`** with black (the universal "missing texture" checkerboard: the signal for every bug), cyan `#46D9FF` (UI focus/selection only), white `#FFFFFF`.
- **Type:** display `"Pixelify Sans"` (400-700), HUD/labels `"Silkscreen"` (400/700), body `"Atkinson Hyperlegible Next"` (a nod to their usability/accessibility testing). All from Google Fonts with fallbacks. Pixel fonts never below 12px; long text always in the body face.
- **The level is the logo:** sample the mountain silhouette of `assets/brand/logo-white.webp` (bright pixels of the peak part) into a heightmap, stretch it across a level about 10 screens wide with **six distinct peaks**, snow caps, rock, and grass at base camp. Parallax: far and mid ridges procedurally generated in palette colours (dithered, not blurred).
- **Sprites (hand-authored pixel art, PNG, never JPEG):** the tester (16x24: idle 2, run 6, jump 2, inspect 2; headset and a red cap; a generic avatar, not a real person); eight bugs (16x16, 2 frames each, one per service, see bestiary); six power-ups (16x16, one per pillar); props: signpost, billboard frame, boarded-up sign, polaroid pickup, summit flag (2 frames), base-camp tent, trees, rocks, ground tiles; the Six Peaks logo rebuilt in pixels for the title screen; a 16x16 reticle.
- **Real art inside pixel frames:** each shipped title's billboard shows a **pixelated** version of its real key art (`games/<slug>/key.webp` downscaled to about 72x30 and palette-reduced). Opening its card **resolves** the art from coarse pixels to the full-resolution image (stepped 24px → 12 → 6 → 3 → full, about 600 ms): the QA metaphor of a rough build becoming a release. Partner signs carry the partner's real logo reduced to 1-bit pixels; their card shows the real logo. Team photos are real photos inside pixel polaroid frames.
- **Never draw real people or real places as pixel art.** Base camp is a tent and a sign reading "Base camp · George, Western Cape", not their office. Partners are signposts with logos, not pixel people.

## The eight demo bugs (bestiary = services)
Every bug is a visible fault in **our own level**, labelled **DEMO** in its ticket, never on or near partner art. Logging one prints a ticket (`BUG #SP-0001 · DEMO · <Service> · Severity: Minor · Repro: 100%`), fixes the fault on screen, bursts glyphs through the HUD (Ink Games), and opens a service card with the site's service text verbatim and "Focus on titles like: <real titles from games.json whose focus/services match>".
1. **Functional QA: Clipper.** A beetle half sunk through the ground (collision clipping).
2. **Compliance QA: Wrong Glyph.** A save sign that shows the wrong platform's button prompt.
3. **Functional Localisation QA: Overflow.** A German sign whose text runs out of its box.
4. **Bug Reporting & Environment Management: Ghost.** A bug that only shows every few seconds (catch it while visible; the ticket notes "Repro: 3/3 with steps").
5. **Test Case Management: Missing Step.** A staircase with one step gone.
6. **Usability Testing: Tiny Text.** A sign with unreadably small text; inspecting magnifies it.
7. **Performance Testing: Stutter.** A zone where the tester's animation drops frames (no flashing; WCAG 2.3.1).
8. **Release Candidate Oversight: Last-minute Regression.** At the summit, the flag sign reads "SIX PAEKS"; logging it fixes the typo before launch.
Bugs are found by walking up and pressing Inspect, or by clicking when the reticle locks (mouse). Each is also a real `<button>` in an accessible overlay list ("Report demo bug: Overflow, near peak 2").

## The route (one run, title to summit)
- **Base camp:** tent, sign, the first partner signpost, controls hint.
- **Peaks 1 to 6:** each summit holds a pillar power-up (Ace Breaker): picking it shows the pillar title and the site's sentence verbatim as a banner; HUD `PEAK n/6`. Order: Technically Excellent, Competitively Priced, Native English Speaking, Western Europe Time Zone (banner also shows live George and London clocks), Culturally Aligned, Consistent Dedicated Teams.
- **Along the slopes:** the 13 shipped titles as billboards (pixelated art + logo); the 4 underway titles as boarded-up signs reading "Project underway, further details on release." with the logo only; nine partner signposts (one per testimonial; dialogue box with the quote verbatim and name, role, studio; HUD `MET n/9`); team-photo polaroids (pickups showing the real photo with a caption); the eight demo bugs spaced so one appears every screen or so.
- **Summit:** the flag (after the RC bug is logged) and the **run report** card: bugs logged n/8, partners met n/9, titles visited n/13, time. Two doors: **Book a trial** (opens the base-camp form, the post-office pattern) and, when 8/8 bugs were logged, **"You'd make a good tester. Apply now"** (careers link). Also Replay and Read the manual.
- **Mobile/touch:** on-screen controls (left, right, jump, inspect), large hit areas; portrait shows the game at the top with controls and suggests rotating for a wider view; the manual follows below.
- **Reduced motion:** no attract loop and no scrolling camera: the game area shows a static pixel **level map** with each landmark, partner, bug and peak as a button that opens the same card.

## Home route `#home`: page structure (differs from B by axis: a run you play, not a catalogue)
1. **Title screen** (overlay on the level in attract mode: a ghost tester runs and logs bugs on loop behind a dark scrim): the pixel Six Peaks logo assembling from pixel blocks; H1 **Beyond standard QA.** with "QA" as a pixel start control; the site's line "We live and breathe your games with you."; primary **Start the test run**, secondary **Book a trial**; sound toggle (off by default); "Read the manual" link; "Tested on" row of the nine platform icons. Keep "Game QA Studio" and "Embedded Game Testing" in visible text (SEO) and the `<title>`.
2. **Rules** (one screen, skippable): "Find the 8 bugs. Meet the 9 partners. Climb the 6 peaks." The bestiary (8 bug glyphs with service names), controls for keys, touch and mouse.
3. **The run** (game viewport ~100svh on desktop, clamped on mobile) with the DOM HUD: `BUGS 0/8 · MET 0/9 · PEAK 1/6 · 00:00`, Help, Sound, Book a trial, and Undead Fish's exit "Read the manual ↓". Cards, tickets and dialogues are DOM overlays (accessible, focus-managed, Esc closes).
4. **The manual** (the traditional site, directly under the game, complete at rest): intro (H1-level copy repeated as H2), why Six Peaks (six pillars), services (eight, each with its bug glyph), games (17 with poster, partner, one-liner, focus; underway marked), partners and quotes, team (stats, management, photos), careers, contact (form + details with copy buttons). Pixel display headings, Atkinson body, palette tokens.
5. **Footer.**

## Page tree (distinct from B)
- `#home`: title, then the run, then the manual.
- `#play`: skips the title and rules, starts the run.
- `#manual`: the manual on its own, scrolled to top.
- `#log-<slug>`: opens that title's landmark card over the level (manual entry under reduced motion).

## Truth and house law
All copy from `research/site-content.md` and `research/games.json`. Testimonials verbatim with name, role, studio. ISO 27001 = adherence. Underway titles: logo and "in progress" only. Every bug ticket says DEMO and sits in our level only. No em dashes, no buzzwords outside quotes, no drop shadows or glows, no bounce easing, no gradient text, headings max three lines, hero CTA pair, click controls (no drag), real logos and imagery only.

## Accessibility (ship blocker)
The game is an enhancement: the manual carries every fact. Canvas has `role="img"` and an aria-label summarising the run; HUD counts in an `aria-live="polite"` region; every interactive object reachable as a button in an overlay list; visible focus everywhere; dialogs trap focus and return it; no flashing; WCAG 2.2 AA contrast on every text layer including over pixel art; keyboard play without a mouse; prefers-reduced-motion honoured; sound never autoplays.
