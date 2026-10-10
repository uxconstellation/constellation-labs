# QA REPORT: Direction A2, Bug Hunt

**Verdict: FAIL.** There are 6 ship-blockers: four WCAG 2.2 failures that only show at phone widths or under reduced motion, one broken mobile start flow, and one breach of Aldo's demo-bug placement ruling. There are also 3 majors. Each blocker is a small, local fix.

The core is strong:
- The whole run plays by keyboard alone on desktop and at 390 (8/8 bugs, 9/9 partners, 6/6 peaks, report).
- Every dialog moves focus in, closes on Esc and returns focus, 48/48.
- Every sampled quote, service and title traces to the source.
- Sound never autoplays.
- The harness is clean.

Route this back to the builder and re-verify after the fixes.

**Run details**
- **Verifier:** qa-verifier, working from a fresh context. It ran on 2026-10-10 against `direction-a-bug-hunt/page.html` (303,830 bytes, md5 `0fa83daf…`, commit 1a1853d).
- **Harness:** `node qa/shoot.mjs direction-a-bug-hunt home,play,manual,log-lost-skies --steps 10`. It regenerated `index.html` byte-identical to the committed copy.
- **Own probes:** independent Playwright and Python scripts (`qa/_a2-*.mjs`, deleted after the pass). They serve a private wrapped copy and never touch the builder's files.
- **Driving:** play was driven by real keyboard and mouse input. `window.__a2` was used only to read state; `warp()` was never called during play.
- **Evidence:** `qa/shots/direction-a-bug-hunt/qa-evidence/`, which is gitignored like B's.
- **Cross-check:** the builder's `tools/a2-playtest.mjs` still reports 61/61. It does not exercise any of the blockers below.

## Checks

| # | Check | Result | Numbers (numerator / denominator) and evidence |
|---|---|---|---|
| 1a | Harness, 4 routes × 1440 and 390 | PASS | 0/8 runs with console errors, 0/8 with failed requests, 0/8 overflowing, 0/8 with axe violations. Each run passed 20 to 32 axe rules over 117 to 1,459 nodes. `report.json` and `qa-evidence/sheet-*.jpg`. |
| 1b | Overflow at 320, 360, 390, 768, 1024, 1440 | PASS | 0/24 route × width runs overflow, including 320 and 360. `layout.json`. |
| 1c | Own axe pass across states | **FAIL** | 34 runs: 16 states × 2 devices (title, rules, run, list, help, post, post error, post done, card, underway, dialogue, service, photo, power-up, report, manual) plus the reduced-motion map × 2. 33/34 are clean. 1 violation: `target-size` on the 390 reduced-motion map (B2). `axe-states.json`. |
| 2a | Keyboard-only play | PASS | From the title, Tab ×3 reaches Start, Enter opens the rules, Tab ×1 reaches Begin and Enter starts the run. Desktop and 390 both finished 8/8 bugs, 9/9 partners and 6/6 peaks, then opened the report: 84 s wall time, 13 jumps. `kbplay-*.json` and `kb-*.jpg`. |
| 2b | Dialogs: focus in, contained, Esc, return | PASS | 48/48 dialogs got focus on open, 48/48 closed on Esc, and 48/48 returned focus (to the opener, or to the stage for in-world objects). Of 864 Tab presses, 628 stayed inside the dialog, 236 went to the browser chrome (native `showModal` behaviour; the page behind is inert), and 0 reached page content. Focus was visible on every stop. |
| 2c | Tab stops vs. the HUD | PASS | 728 stops: 4 sizes (1440×900, 1280×720, 720×450 for 200% zoom, 390×844) × 3 states (title, run, manual). 0 stops lack a focus indicator, 0 are fully hidden, and 1 is partly covered: the stage at 720×450, 8% under the HUD buttons. The HUD is `position:absolute` inside the game section, not fixed. `tabs.json`. |
| 2d | Keys outside the game | **FAIL** | During a run, after clicking manual text (focus on `<body>`), Space and ArrowUp no longer scroll, and `L` jumps the page to y=0 and moves focus into the game list (B5). |
| 3 | Contrast, all text layers | PASS | 1,511 text runs over 36 states (18 per device). Method: text made transparent, real background screenshotted 3 times, contrast per pixel. 1,502 pass at both the 5th percentile and the median. The other 9 are sampling artefacts: a typewriter layout shift (2), a rotated stamp's bounding box (2; its median is 3.81, against 3 for large bold text), field or scroll edges (3), a dialog fade-in (1), and the kicker under Close (1; real, see m1). **Worst real case:** white on brand red, 4.63:1, on the red buttons. Worst over pixel art: "Tested on" over the attract canvas at 390, 6.16:1 at the 5th percentile. In-canvas sign text uses palette pairs at 5.64:1 or more. `contrast/result.json`. |
| 4a | Quotes, services, pillars, titles, partners, platforms | PASS (see M3) | **Quotes:** 9/9 verbatim in the manual and 9/9 in partner dialogues, each with name, role and studio. **Services:** 8/8 manual and 8/8 service cards. **Pillars:** 6/6 titles; 5/6 texts verbatim plus 1 documented edit (m8). **Also verbatim:** offer copy 4/4, stats 4/4, management 4/4, contact details 3/3, careers and projects intro. **Titles:** 17/17 cards, with one-liner 17/17, partner 17/17, focus 13/13 and platforms 33/33. **Partner logos:** 15/15. **Platform strip:** 9/9. `truth.json`. |
| 4b | ISO 27001 as adherence | PASS | Label "Security adherence", body "Adherence to this benchmark…". 0 certification wording near ISO. |
| 4c | Underway titles | PASS | Card 4/4 and manual 4/4 show: logo, title, partner credit, the site one-liner and "Project underway, further details on release.". 0 key art, 0 focus, 0 platforms. Level notices are logo-only. |
| 4d | Demo bugs labelled DEMO, in our level only | **FAIL** | **Labelling:** 8/8 tickets read `BUG #SP-000n · DEMO`, and 8/8 cards are headed "Demo bug logged in our test level". **Placement:** 7/8 sit 34 to 47 world px (136 to 188 screen px at 4×) from the nearest title or partner sign. 1/8 fails: the Stutter fault zone ends 5 world px from the King of Tokyo underway notice (B6). **Service → title links:** 31/32 are backed by games.json (M3). `bugctx-*.jpg`. |
| 5a | Dashes, shadows, glow, easing, gradient text | PASS | 0 em dashes and 0 spaced en dashes, in source and rendered text. The 1 en dash is an unspaced range ("2–4 players"). 0 `box-shadow`/`text-shadow`/`drop-shadow`/`shadowBlur`, 0 `background-clip:text`, 0 bounce/elastic/back eases. The Launch dawn is dithered bands, not a blur glow. |
| 5b | Headings at most 3 lines (320, 390, 768, 1024, 1440) | **FAIL** | **Route headings:** 5,538 measured, 0 over 3. One 4-line reading (the 320 H1) was checked in pixels and is 3 lines (`h1-320.jpg`). **Dialog headings:** 355 measured, 2 over 3 (M2). |
| 5c | Hero CTA pair, click controls, SEO terms | PASS | **CTA pairs:** title has Start the test run / Book a trial; manual cover has Book a trial / Play the test run. **Click controls:** 0 drag handlers; `pointermove` is reticle hover only; touch buttons are press-and-hold. **SEO:** "Game QA Studio" and "Embedded Game Testing" are in `<title>` and in the visible kicker on the title and manual. **Buzzwords:** only inside verbatim quotes ("seamless(ly)", "elevating"). |
| 5d | Real logos and imagery; no pixel people | PASS | All 124 asset references are real files. Partner signs are reductions of real logos, and billboards are pixelated real key art. The sprite atlas (`sprites-x3.png`) holds only the generic tester, 8 bugs and props: 0 real people. |
| 6a | Reduced motion | **FAIL** | Checked at 6 widths (1440 to 320). **Title:** 6/6 have no attract loop, 0 `requestAnimationFrame` calls in 2 s, a static canvas and the caret animation off. **Map:** Start shows it 6/6, with 48/48 pins as `<button type=button>`; a pin opens its card and focus returns 6/6. **Pins:** 0 overlaps at 768 and up; at 390, 360 and 320, 1 overlapping pair each, and at 320 the Stutter pin's centre is covered (B2). `reduced.json`. |
| 6b | Flashing at most 3/s | PASS | 5 recorded scenes: title attract, bug-log burst, Launch confetti, walk + ghost, walk only. Each has at most 1.5 flashes per second when luminance is averaged over a 10° area (`flash-results.txt`). The per-pixel scan flags camera-scroll shimmer on the starfield and dither while walking. That is motion, not a flash event; reduced motion removes it. |
| 6c | Sound | PASS | 0 `AudioContext` on load, and 0 after 84 s of play on both devices. One is created only after the Sound toggle. `aria-pressed` defaults to false, the title reads "Sound: off", and the state resets on reload. |
| 6d | Canvas `role=img`, live HUD | PASS | The canvas has `role="img"` and a label that updates with the run summary. `#hud-live` has `aria-live=polite` and `aria-atomic=true`. A full run produced 67 announcements, covering 8/8 bug logs, 9/9 meetings, 6/6 power-ups and the report. |
| 6e | HUD at narrow widths | **FAIL** | The timer is clipped at 320 (plate 284 px wide, content 341) and at 360. At 390 the timer and the LAUNCH chip are clipped once Launch shows (B3). `hud-start-320.jpg`, `hud-launch-390.jpg`. |
| 6f | Text alternatives on mobile | **FAIL** | At 560 px and below, the title "Tested on" list exposes 9 empty list items (B4). |
| 7 | Artifact contract | PASS | **Tags:** 0 doctype/html/head/body; `<title>` comes first. **Scripts:** 1 external, `cdnjs…/gsap/3.12.5/gsap.min.js`, pinned. **Fonts:** Google Fonts only (1 stylesheet, 2 preconnects). **Assets:** 124 page references plus 34 kit images, 0 missing under the project root via `assets -> ../assets/web`. **No:** fetch/XHR, iframes, embeds, objects, or audio/video tags (0 each). **Forms:** 2/2 call `preventDefault`; the confirmation says "This preview does not send anything…". `window.__a2` is covered in m6. `static.json`. |
| 8 | Structural difference from B | PASS | Statement under the fix list. B's directory is untouched (`git diff` is empty). |
| 9 | Pixels, by eye | FAIL | B1, M1, m1, m2 and m5. The canvas is never empty and the sprites are intact. Desktop composition is clean across 80 harness frames and 40 keyboard-run frames. |

## Fix list (builder)

1. **B1. On a phone, the run starts off-screen. Severity: blocker (broken core flow).**
   - **Repro:** Use 390×844 with touch. Tap Start the test run, scroll to Begin the run (the rules screen is about 1,209 px tall in portrait), and tap it.
   - **What happens:**
     - Mode becomes `run`, but `scrollY` stays at 735.
     - The HUD sits at −735…−628, the stage at −628…−342, and the touch controls at −342…−250.
     - The visitor sees the manual's cover; nothing on screen shows the run started.
     - The keyboard path at 390 is the same.
   - **Where:** `act === 'begin'` → `setHash('play'); startRun(false)` (line 2863). `setHash` uses `pushState`, so `route()`'s `win.scrollTo(0,0)` (`route()` at line 2886) never runs. `startRun()` (line 2641) does not scroll. Portrait `.screen{position:relative…}` is at line 535.
   - **Fix:** In `startRun()`, scroll the game section into view, e.g. `E.game.scrollIntoView({block:'start'})` or `scrollTo(0,0)`, before focusing the stage. Do the same for the map path.
   - **Evidence:** `m-touch-after-begin.jpg`, `kb-mobile-02-run-start.jpg`, `mobile.json`.
2. **B2. Reduced-motion map pins overlap at phone widths. Severity: blocker (WCAG 2.5.8 Target Size, AA).**
   - **Repro:** `reducedMotion: 'reduce'`, open `#play`, scroll the map.
   - **What happens:**
     - At 390, `power-culture` and `photo-crew` overlap by 52×10 px, and axe reports `target-size` (smallest space 66×14 px; 4.8 px clear diameter).
     - At 360, `bug-performance` and `photo-crew` overlap by 40×4.
     - At 320 they overlap by 24×18, and the Stutter pin's centre hit-tests to the Photo pin.
   - **Where:** `buildMap()`. The lift loop (lines 2749 to 2755) checks only pins in the same row. Lifted pins rise into the row above (`translate(-50%,-100%)` plus a negative `margin-top`) and collide there.
   - **Fix:** Collide against every placed pin rect across rows, or reserve top padding per row so a lifted pin stays inside its own row. Re-test at 320, 360 and 390.
   - **Evidence:** `pin-390-power-culture.jpg`, `pin-320-bug-performance.jpg`, `reduced.json`, `axe-states.json`.
3. **B3. The HUD plate clips its content. Severity: blocker (WCAG 1.4.10 Reflow, AA).**
   - **What:** The plate is `white-space:nowrap` with `clip-path`.
     - At 320 its content is 341 px in a 284 px box, so the timer is gone and the plate is cut after "PEAK 1/6 ·". The same happens at 360.
     - At 390 it fits until the Launch zone. There the LAUNCH chip and the timer are cut ("LAUNC"), as seen in the keyboard run and in `m-report-390.jpg`.
   - **Where:** `.hud-plate` (line 73); the portrait override is at line 517.
   - **Fix:** In portrait, let the plate wrap (`flex-wrap:wrap; white-space:normal` on the plate), or move the timer and LAUNCH to a second row.
   - **Evidence:** `hud-start-320.jpg`, `hud-launch-390.jpg`, `layout.json` (`hud`).
4. **B4. The mobile "Tested on" icons have no text alternative. Severity: blocker (WCAG 1.1.1, Level A).**
   - **What:** At 560 px and below, `.t-tested .plat-row span{display:none}` hides the only labels, and every `<img>` has `alt=""`.
     - The accessibility tree at 390 is `list` with 9 empty `listitem`s.
     - At 1440 the same list reads "Xbox … Android".
   - **Where:** CSS line 551; markup line 618.
   - **Fix:** Hide the spans visually with the `.sr-only` pattern instead of `display:none`, or give each image `alt="<Platform>"`.
   - **Evidence:** `b4-platform-strip-a11y.txt` (Playwright `ariaSnapshot()` of `.t-tested .plat-row` at 1440 and 390).
5. **B5. Game keys fire outside the game. Severity: blocker (WCAG 2.1.4 Character Key Shortcuts, Level A; it also breaks keyboard scrolling).**
   - **Repro:** Open `#play` (run mode), scroll into the manual and click a paragraph, so focus is on `<body>`.
   - **What happens:**
     - Space does not scroll (y stays 915).
     - ArrowUp does not scroll (y stays 1707).
     - `L` scrolls the page to y=0 and moves focus into the level list.
     - Under the title screen, Space scrolls normally (915 → 1667).
   - **Where:** `gameKeysActive()` (line 2793). `if (!a || a === d.body || …) return true;` (line 2796) treats `<body>` as the game.
   - **Fix:** Treat `<body>` as the game only while the game section is in view (`S.visible`) and nothing in the manual was the last interaction. Simplest is to require `document.activeElement` to be inside `#game`.
   - **Evidence:** `b5-keys-outside-game.txt`.
6. **B6. The Stutter demo fault sits next to an underway partner title. Severity: blocker (Aldo's approval condition: demo faults only in our own level, "never on or near partner art"; it implies a defect in a Microids title).**
   - **What:**
     - The Stutter zone spans `bug-performance.x ± 48`, which is world 2973 to 3069, drawn as magenta ground dashes plus "FPS 12".
     - The King of Tokyo underway notice, carrying the real King of Tokyo logo, starts at world 3076. That is a 5 to 7 px gap, about 20 screen px at 4×.
     - On screen, the magenta trail runs down the slope into that notice's post.
     - The other 7 bugs keep 34 to 47 world px from any title or partner sign.
   - **Where:**
     - Level data in `#a2-data` (line 1257): `"ref":"performance"` x 3021 and `"ref":"king-of-tokyo"` x 3100.
     - Zone drawing in `drawObject` (line 1865, `for (let i = -48; i <= 48; …)`).
     - Physics zone check (line 2139).
   - **Fix:** Shrink the zone's right side, e.g. −48…+20, or move the King of Tokyo notice at least 40 px right. Keep at least 34 px of clear ground, as the other seven do.
   - **Evidence:** `bugctx-performance-zoom.jpg`, `bugctx-bug-performance.jpg`.
7. **M1. The run-report stamp hides the "Bugs logged" figure on phones. Severity: major.**
   - **What:** At 390 the rotated LAUNCH stamp (paper-filled) covers 100% of the "Bugs logged" value. At 360 and 320 it covers 63% of the value and overlaps the "Run report" heading.
   - **Where:** `@media (max-width:560px){.report-stamp{right:18px;top:96px…}}` (line 315).
   - **Fix:** On mobile, place the stamp beside the heading or below the rows, not over them.
   - **Evidence:** `m-report-390.jpg`, `kb-mobile-report.jpg`, `mobile.json`.
8. **M2. A dialog heading wraps to 4 lines. Severity: major (house law: headings at most 3 lines).**
   - **What:** The service card heading "Bug Reporting & Environment Management" is 4 lines (112 px at 28.08 px line height) at 320 and 390. The 64 px glyph column in `.svc-top` squeezes it.
   - **Note:** The README's "740 measured … worst 3 lines" did not include this card.
   - **Where:** `.dlg-h` (line 234) and `.svc-top` (line 280).
   - **Fix:** At 560 px and below, stack the glyph above the heading or step the heading size down.
   - **Evidence:** `dialog-headings.json`, `dlgx-320-ghost.jpg`.
9. **M3. One service → title link has no source. Severity: major (claims measured).**
   - **What:** The Test Case Management card lists Whimel Academy under "Focus on titles like". Its game page lists no Test Case Management services; the build matched the word "Coverage" in a focus item. The other 31/32 links are backed by `servicesProvided` or `keyTestingFocus` in games.json.
   - **Where:** `#a2-data` services[`testcase`].titles (line 1257), generated by `tools/a2-content.mjs` line 62 (`match: ['Coverage', 'Regression']`).
   - **Fix:** Match on the `Test Case Management` category only.
10. **m1. The dialog Close button crowds the kicker at 390 and below. Severity: minor.**
    - **What:** `.dlg-k` reserves 56 px, but the Close button is about 74 to 86 px wide.
      - 23 of 60 dialog opens at 320 to 390 intersect the kicker; most by 1 to 3 px.
      - The largest: the Ghost service card at 320 (70×16 px) and the partner dialogue at 390 ("1 OF" runs into Close).
      - At 768 and 1440, Close also overlaps the top 5 px of the card art.
    - **Where:** Lines 232 and 233.
    - **Fix:** Reserve about 96 px, or put Close on its own row on mobile.
    - **Evidence:** `dlgx.json`, `cmp-mobile-dialogue.jpg`.
11. **m2. The tester spawns over the base-camp sign. Severity: minor.**
    - **What:** At every start the sprite covers "CAPE" in "GEORGE, WESTERN CAPE" (spawn x 204; sign 131 to 219).
    - **Where:** `placeAtBase()` (line 2631) and the level `base`.
    - **Evidence:** `play-desktop-s00.jpg`, `play-mobile-s00.jpg`.
12. **m3. Pixel fonts below 12 px. Severity: minor (DIRECTION-A2: "Pixel fonts never below 12px").**
    - **What:** These render at 11 px in Silkscreen: `.chip` (line 424), `.svc-tag` (line 415), `.idx-state` (line 190), `.pin` (line 214) and `.m-toc .plat-row li` (line 395).
13. **m4. The typewriter quote. Severity: minor.**
    - **What:**
      - `aria-label` on a generic `<span>` is prohibited (axe "incomplete" `aria-prohibited-attr`), so assistive tech can read a partial quote for up to 2.4 s.
      - The growing quote pushes "Back to the run" down while it types.
    - **Where:** Line 2380.
    - **Fix:** Keep the full text in an `.sr-only` copy and mark the typed span `aria-hidden`. Reserve the quote's height.
14. **m5. Mobile overlay crowding. Severity: minor.**
    - **What:**
      - The power-up banner and polaroid cover almost all of the 286 px stage.
      - The glyph burst draws over banner and polaroid text (`.fx` z 24 against 23).
      - The open list (`top:12px`) covers the HUD List toggle. Its own Close list button still works.
    - **Where:** Lines 64, 115, 126 and 179, and the portrait block from line 511.
    - **Evidence:** `sheet-kb-mobile.jpg`.
15. **m6. The `window.__a2` test hook. Severity: minor (production hygiene).**
    - **What:** A global `window.__a2` exposes:
      - read-only getters: `mode`, `run`, `player`, `view`, `camera`, `near`, `dialog`, `loop`, `mouseLock`;
      - functions: `objects()`, `peaks()`, `rect()`;
      - and `warp(x)`, which teleports the tester in run mode and returns false otherwise.
    - It cannot log bugs or change counts.
    - **Where:** Line 2940.
    - **Fix:** Remove it before production, as the README says.
16. **m7. README figures that don't hold. Severity: minor.**
    - **What:**
      - "Headings … worst 3 lines" is wrong (M2).
      - "0 violations in 32/32" does not cover the reduced-motion map at 390 (B2).
      - The tested states do not include the mobile start flow (B1).
    - **Fix:** Correct the README after the fixes.
17. **m8. Documented copy edits, for line-manager sign-off. Severity: minor.**
    - **What:**
      - Pillar 1 drops ", and best-in-class tech" (buzzword law).
      - The pull quote's spaced dash becomes a colon.
      - "IS0" becomes "ISO".
      - Two underway lines gain a final full stop the source lacks.
    - These match the B precedent. The pillar banner in the run has the same edit.
18. **m9. Power-up banners auto-hide after 7.5 s (11 s for the time-zone banner). Severity: note.**
    - **What:** They pause while hovered or focused, and the same text is in the live region and the manual. WCAG 2.2.1 is likely met; the line manager may want a Close-only banner instead.

**Re-verify after the fixes.**
1. Run the harness on the 4 routes.
2. Re-run the mobile start at 390 and 320 (touch and keyboard).
3. Run the reduced-motion map at 320, 360 and 390, with axe.
4. Check the HUD at 320, 360 and 390 in the Launch zone.
5. Read the `.t-tested` accessibility tree at 390.
6. Test body-focus keys in run mode.
7. Measure the Stutter-zone gap.
8. Check the report stamp at 320 to 390.
9. Re-measure dialog headings at 320 and 390.

## Structural difference from Direction B

A does not reuse B's HUD brackets, chips-as-checkpoints, hint bar or library-grid IA. Evidence:
- **Brackets and reticles:** B frames its hero and Squad panel with four-corner brackets: `.tv__b` ×2, `.tvb` ×12, and `.cp__ret` checkpoint reticles. A has 0 of each. A's HUD is a single notched pixel plate of run counters, `position:absolute` inside the game.
- **Hint bar:**
  - B's `.hints` is a fixed, centred pill: site navigation with `[Enter] Book a trial / [G] Library / [M] Menu`.
  - A has 0 `.hints` and 0 `.kbd`. A's `.hint` is an in-stage controls legend (Run, Jump, Inspect, List, Mouse) that hides on touch, from Undead Fish's help pattern.
- **Library grid:**
  - B has `.lib` and `.tile` (×3 each): a portrait poster grid with hover plates and per-game `#game-<slug>` dossiers.
  - A has 0 of either. A's games are 2-column horizontal cards inside a linear manual, and `#log-<slug>` opens a card over the level.
- **Routes:** B's IA is `#home` → `#library` → `#game-*`. A's is title → rules → run → manual, with `#play`, `#manual` and `#log-*`.
- **Overlap:** 12 of A's 229 class names also appear in B. They are generic: btn, skip, sr-only, field, foot, stat, stats, careers, contact, copy, q, hud, chip.
  - The `hud` name covers different things: B's is a Squad-builder panel, A's is the game HUD.
  - The one functional echo is `.chip` as a status tag on game cards: A's is a solid-fill RELEASED/UNDERWAY label, B's a 1 px bordered mono chip.

## Evidence index (`qa/shots/direction-a-bug-hunt/qa-evidence/`)

`static.json`, `layout.json`, `tabs.json`, `axe-states.json`, `kbplay-{desktop,mobile}.json`, `mobile.json`, `reduced.json`, `dlgx.json`, `dialog-headings.json`, `truth.json`, `bugs.json`, `contrast/` (`meta.json`, `result.json` and the text and background PNGs), `flash-results.txt` (plus sample frames in `flash/`), `sheet-{home,play,manual,log-lost-skies}-{desktop,mobile}.jpg`, `sheet-kb-{desktop,mobile}.jpg`, `sheet-bugctx.jpg`, `bugctx-*.jpg`, `kb-*.jpg`, `m-*.jpg`, `pin-*.jpg`, `hud-*.jpg`, `h1-*.jpg`, `state-*.jpg`, `dlgx-320-ghost.jpg`, `cmp-*.jpg`, `sprites-x3.png`, `b4-platform-strip-a11y.txt`, `b5-keys-outside-game.txt`.

## Re-check: blockers, majors, minors and rulings (96cb1e9 against fdde8ec)

**Re-check verdict: PASS.**
- All 6 blockers, all 3 majors and minors m1 to m5, m7 and m9 are fixed.
- The m6 QA-HOOK block strips cleanly, and the stripped copy runs clean.
- No regressions in the sampled first-pass checks.
- The diff stays in scope, and B is untouched.

**What I tested**
- `page.html` at 96cb1e9 (306,295 bytes, md5 `befe06f3…`), which is byte-identical to the working tree.
- Every number below comes from fresh probes. I did not reuse the builder's numbers or tools.
- Play was driven with real keys and taps. `__a2` was used only to read state, never `warp()`.
- Evidence: `qa/shots/direction-a-bug-hunt/qa-evidence/recheck/`.

| Item | Result | Numbers (numerator / denominator) |
|---|---|---|
| B1: mobile start | PASS | 4/4 tap and keyboard starts at 390 and 320 (from scrollY 735 and 812) land at scrollY 0, with the HUD and stage 100% in view, the touch controls 100% in view (touch runs) and focus on the stage. 2/2 reduced-motion starts land on the map with focus on its heading. `b1-*.jpg`. |
| B2: map pins | PASS | 6 widths (320 to 1440), 48 pins each (288 in total). All 288 are named `<button type=button>` elements. 0 overlapping pairs, 0 under 24×24, 0 with a covered centre or edge (3 points each), 0 reaching into the row above. axe `target-size` 0/6. `b2-pins-*.jpg`. |
| B3: HUD reflow | PASS | 12/12 (6 widths × start and LAUNCH): `scrollWidth` equals `clientWidth`, and 0 HUD items are cut. The plate wraps to 2 rows at start (320, 360) and 3 rows with LAUNCH (320 to 390). `b3-hud-launch-*.jpg`. |
| B4: platform alt text | PASS | 6/6 widths read 9/9 named list items ("Xbox" … "Android") in the accessibility tree, including 320, 360 and 390. |
| B5: keys outside the game | PASS | A run-mode reader who clicks manual text can scroll with Space (915 → 1667) and ArrowUp (→ 1627). `D` does not move the tester; `L` does not open the list or move the page. `L` on a focused manual link does nothing. After clicking the game, ArrowRight moves the tester (51 px) and `L` opens the list. `b5.json`. |
| B6: Stutter placement | PASS | The zone is now `[-40, +20]`. Its last dash ends 33 world px (132 screen px at 4×) from the King of Tokyo notice; it was 5. The other 7 bugs are 34 to 92 px from any title or partner sign. `b6-zoom.jpg`. |
| M1: report stamp | PASS | 320, 360 and 390: the stamp overlaps 0 figures, rows or headings and sits inline above the heading. 768 to 1440: it sits in the empty space right of "Run report" and touches only that heading's block box, not its text. `m1-report-*.jpg`. |
| M2: dialog headings | PASS | 370 headings across all 42 in-level dialogs plus help and post, at 320, 390, 768, 1024 and 1440: maximum 3 lines, 0 over. |
| M3: service → title links | PASS | 32/32 backed by games.json categories, items or focus; 0 underway titles listed. Test Case Management now lists Yooka-Replaylee, God Breakers, Lost Skies and Wild Blue Skies. |
| m1: Close vs kicker and art | PASS | 0/220 dialog opens at 320 to 1440 have Close overlapping a kicker, heading, card art or logo by more than 1 px. |
| m2: spawn | PASS | The tester spawns at world 119 (sprite 111 to 127), between the tent (74 to 106) and the sign (131 to 219). 0 px overlap. `m2-spawn.jpg`. |
| m3: pixel fonts | PASS | 0 CSS rules below 12 px in the page and in the stripped copy. |
| m4: typewriter quote | PASS | The typed copy is `aria-hidden`, and a full `.sr-only` copy (228 chars) is what the accessibility tree reads. 0 `aria-label` spans. "Back to the run" moves 0 px while typing. |
| m5: mobile overlays | PASS | At 6/6 widths the HUD List toggle stays clickable while the list is open. The polaroid is smaller on phones. Banner and polaroid sit above the glyph burst (z 25 against 24). |
| m6: QA-HOOK | PASS | Exactly 1 `/* QA-HOOK:START */` (line 2969) and 1 `/* QA-HOOK:END */` (line 2978). `sed '/QA-HOOK:START/,/QA-HOOK:END/d'` removes 10 lines and leaves 0 `__a2` references; `window.__a2` is `undefined` in the stripped copy. |
| m7: README | PASS | The README now states the strip check and per-blocker counts, and drops the "32/32" claim. Its route-heading line (740, worst 3) is consistent with my 1,350 measured, worst 3. |
| m8: copy edits | Signed off | Line manager ruling. Pillar 1 still reads 5/6 verbatim by design. |
| m9: banners | PASS | A power-up banner is still open after 12.5 s with no interaction. It closes once the tester walks about one screen away (at world 1207 for a power-up at 853, view 360 px). There is no `hideBanner(true)` caller left, so the 2.5 s retry inside `hideBanner()` is unreachable dead code (nit). |
| (a) Stripped copy: harness | PASS | 8/8 runs (4 routes × 1440 and 390): 0 console errors, 0 failed requests, 0 overflow, axe 0 violations (20 to 32 rules passed, 117 to 1,455 nodes). |
| (a) Stripped copy: keyboard play | PASS | Desktop and 390, DOM-only and hook-free: Start, Begin, walk and inspect by keys (4 to 5 bugs), the rest by `L` plus Enter on list items, then the flag. Both reach BUGS 8/8 · MET 9/9 · PEAK 6/6, with 8/8 tickets reading DEMO and the run report open. 108 dialogs: focus in 108/108, Esc 108/108, return 108/108. 1,728 Tab presses: 0 reached page content, 0 lacked a visible indicator. 0 console errors, 0 `AudioContext`. |
| (b) Harness | PASS | `node qa/shoot.mjs direction-a-bug-hunt home,play,manual,log-lost-skies --steps 10`: 8/8 runs clean (0 errors, 0 failed, 0 overflow, axe 0; 20 to 32 rules passed, 117 to 1,460 nodes). `index.html` was regenerated byte-identical to 96cb1e9. |
| (b) Overflow and route headings | PASS | Overflow 0/24 (6 widths × 4 routes). Route headings: 1,350 measured at 320, 390, 768, 1024 and 1440, maximum 3 lines. |
| (b) Keyboard, hooked copy | PASS | Desktop and 390, same bot as (a): 8/8, 9/9, 6/6 and report on both. 107 dialogs: focus in, Esc and return 107/107; 0 of 1,712 Tab presses leaked; 0 missing indicators. A separate hook-guided walk logs 8/8 bugs by walking and E alone in 52 s. |
| (b) Tab audit | PASS | 728 stops (1440×900, 720×450, 390×844, 320×700 × title, run, manual): 0 without an indicator, 0 hidden, 1 partly covered (the stage, 720×450 run, unchanged from the first pass). |
| (b) axe across states | PASS | 30/30 runs (14 states plus the reduced-motion map, × 2 devices) with 0 violations. |
| (b) Contrast from pixels | PASS | 626 text runs in 30 states: 0 below the threshold at the median. The worst real case is still white on red, 4.63:1. Three runs dip below at the 5th percentile, all known sampling artefacts: the rotated LAUNCH stamp's box ×2 (median 3.81, large text) and the mobile card's ghost button (median 17.62). |
| (b) Truth | PASS | Quotes 9/9 in the manual and 9/9 in dialogues; services 8/8 and 8/8; pillar texts 5/6 (signed-off edit); title cards 17/17; focus and platforms 13/13; underway 4/4; ISO adherence; DEMO 8/8 in ticket and card. |
| (b) Static contract and house law | PASS | Page and stripped copy: 0 forbidden tags (the 7 `<head` hits are `<header>`), `<title>` first, 1 cdnjs gsap 3.12.5 script, Google Fonts only, 0 of 124 asset references missing, 0 fetch calls, 0 em or spaced en dashes, 0 shadows, 0 gradient text, 0 bounce eases, 0 drag handlers, 2/2 forms through `preventDefault`. Sound defaults to off. |
| (b) Pixels | PASS | I looked at the B1, B3, M1, B6 and B2 frames and the end-of-run frames. No clipping, overlap, empty canvas or broken sprites. |
| (c) Scope | PASS | `git diff --name-only fdde8ec 96cb1e9` touches only `direction-a-bug-hunt/` (page, index, README, proof) and `tools/a2-*` (build, content, measure, playtest, proof, and the new strip-check). `git diff fdde8ec 96cb1e9 -- direction-b-press-start` is empty. In `page.html`: 35 hunks, all mapped to the items above; the kit JSON is unchanged; `a2-data` changes only in `services` (testcase titles) and `level` (the `zone` on `bug-performance`). |

**Still open (non-blocking):** the dead 2.5 s retry branch in `hideBanner()` (line 2501). Remove it in a later tidy pass.
