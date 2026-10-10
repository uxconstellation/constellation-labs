# Direction A: Bug Hunt

A playable pixel-art test level for Six Peaks Games, with the complete site (the manual) under it. You climb the six peaks of the logo from base camp in George to the Launch flag. On the way you log 8 demo faults (one per service), read 9 partner signposts, open 13 released-title billboards and 4 boarded "underway" notices, and collect 6 power-ups (the pillars) and 6 team polaroids. Nothing on the page needs the game: every object is also a button, and the manual holds all the content at rest.

- Page: `page.html` (Artifact page contract; `index.html` is the wrapped standalone copy written by `qa/shoot.mjs`)
- Content model: `tools/a2-content.mjs`. Build: `node tools/a2-build.mjs` regenerates the manual, index, bestiary, platforms, title logo, post form and the `a2-data` / `a2-kit` JSON. It is idempotent.
- Engine: vanilla JS and canvas 2D, base 384x216, integer-scaled and pixelated, fixed 60 Hz step. GSAP 3.12.5 (cdnjs) is used for DOM UI only. No three.js.

## Routes

| Route | What it shows |
|---|---|
| `#home` | Title screen in attract mode. H1 "Beyond standard QA." with "QA" as a start control, Start the test run / Book a trial, sound gate (off), Read the manual |
| `#play` | The run (the rules and bestiary screen first when entered from the title) |
| `#manual` | The manual alone |
| `#log-<slug>` | Opens that title's card over the level (e.g. `#log-lost-skies`); closing returns to `#play` |

## Controls

- **Keyboard:**
  - ← → or A D: run.
  - Space, W or ↑: jump. Coyote time is 0.1 s and the jump buffer 0.12 s. The apex is about 34 px; releasing early gives a short hop.
  - E or Enter: inspect / log.
  - L: list every object.
  - Esc: back out.
- **Mouse:** the reticle locks onto bugs; click to log. Other objects take a click.
- **Touch:** on-screen left, right, inspect and jump buttons.
- **Without playing:** the List button, the reduced-motion level map, or the manual.

## Reference vs deviation, per element

| Element | Reference (brief / style frame / kit) | What shipped, and any deviation |
|---|---|---|
| Level | Data object; collisions from `peaks.json`; use `meadows` / `ledges` / `surface` / `sites` | A hand-authored layout keyed to meadows, peaks and kit sites, validated at build time (0 warnings). Collisions come from the kit ground plus the stairs' solid steps (`steps` / `missing`) |
| Look | `style-frame.png`: night sky, kit parallax, pines, white-logo signboards | Kit sky, far and mid layers, terrain and props. Pines on meadows; snow pines and snowy rocks higher up, from the `surface` string. The night holds for the whole climb |
| Dawn | Not in the style frame | **Addition:** a sunrise glow rises behind the far ridge only when the flag goes up at Launch, as the payoff. The faint dotted horizon that shows between ridges is the kit's own `sky.png` |
| Partner signs | `prop_signpost`, then `prop_signboard` at post x−14, y−6, logo centred in `signboardWindow` | As specified, using the kit's `sign-<studio>.png` logos |
| Billboards (13) | Pixel art resolves to full-res `key.webp`; logo, partner credit, one-liner, Key Testing Focus, platforms | Card resolution steps 24 → 12 → 6 → 3 px → full, at 150 ms each |
| Underway (4) | Boarded sign with the logo, "Project underway, further details on release.", no art | **Deviation:** the kit has no art for underway logos, so the real `logo.webp` is reduced at runtime to a 28x13 colour notice pinned over the kit's planks. Nothing is drawn as a substitute |
| Bugs (8) | Face left; 1px magenta outline pulse or 2-frame idle; faults swap in place (`faultSwap`); demo faults only in our own ground, never near partner art | Outline pulse plus the kit idle frames, with in-place fault swaps. Every bug, the Stutter zone included (−40…+20 px), keeps 34+ world px from any title or partner sign (34 to 92 px measured). Logging prints `BUG #SP-000n · DEMO · <Service> · Severity: Minor · Repro: 100%`, fixes the fault, bursts glyphs and opens the service card (verbatim text plus real titles: 32/32 links backed by `games.json` service categories or Key Testing Focus) |
| Power-ups (6) | Verbatim pillar banners; the time-zone banner has live George and London clocks | Clocks via `Intl`. No timed auto-hide (line-manager ruling m9): a banner stays until Close, or until the tester walks about one screen away |
| Final zone | Label "Launch" in the HUD and the run report; keep "Peak n/6" | A LAUNCH HUD chip and announcement; the report has a "Launch" kicker, a stamp and a "Flag raised" row |
| Summit report | Book a trial → post form; at 8/8 "You'd make a good tester. Apply now."; Replay; Read the manual | As specified; the form shows a preview confirmation and sends nothing |
| Hints and toasts | Use the ground band, not the sky | The ticket printer, banners and polaroids sit in the lower band |
| Copy edits | Verbatim | Pull quote dash changed to a colon; "best-in-class tech" dropped; IS0 corrected to ISO; underway line uses a comma. Signed off by the line manager (m8), matching the B precedent |

## Accessibility (WCAG 2.2 AA)

- Every object is a real button in the List overlay and in the reduced-motion level map (48 pins for 48 objects). Map pins are at least 24x24 with a 4 px gap in 2D, across rows too (2.5.8).
- Native `<dialog>` with `showModal`; focus moves in, Esc closes, focus returns to the opener (or the stage for in-world objects).
- Entrances animate opacity only, so focus is never dropped while a dialog, the list or the rules animate in.
- Game keys drive the level only from the stage or game controls, or from `<body>` while the stage is at least half in view and the last press was not outside the game. In the manual, Space and the arrows scroll and `L` does nothing (2.1.4).
- HUD announcements go to an `aria-live="polite" aria-atomic` region. The canvas is `role="img"` with a debounced run summary. The partner quote is typed visually in an `aria-hidden` span; a full `.sr-only` copy is what is read, and an invisible full copy reserves the height.
- The HUD plate wraps on narrow portrait screens instead of clipping (1.4.10). The "Tested on" platform names stay in the accessibility tree at every width (1.1.1).
- No flashing above 3/s. Sound is off by default and never autoplays. The game is never required to read anything. Reduced motion swaps the level for a static map with no animation loop.

## QA numbers (after the QA-REPORT-A2 fixes)

| Check | Result |
|---|---|
| `node qa/shoot.mjs direction-a-bug-hunt home,play,manual,log-lost-skies --steps 10` | 8/8 route × device runs clean (80 shots): 0 console errors, 0 failed requests, 0 horizontal overflow (390 and 1440), 0 axe violations (20–32 rules passed per run, 117–1,460 nodes) |
| Same harness on the **stripped publish copy** (QA-HOOK block removed, `tools/a2-strip-check.mjs`) | 8/8 runs clean; a hook-free keyboard run (start, walk, log a bug, summit → flag → report, reduced-motion map) passes 5/5 with 0 console errors |
| Axe with states open (`tools/a2-measure.mjs`) | 36/36 states with 0 violations: 16 desktop + 16 mobile (title, rules, help, post form and error state, title card, underway card, partner dialogue, service card, polaroid, power-up banner, open list, run report, HUD over the canvas, manual top and form) plus the reduced-motion level map at 320, 360, 390 and 1440 |
| Contrast where axe says "incomplete" (`tools/a2-contrast.mjs`, real pixels) | 495/495 drawn nodes pass, of 575 incomplete. Worst: white on brand red, 4.63:1 (needs 4.5); the LAUNCH stamp is 3.81:1 at 19–20 px bold (large text, needs 3). Not drawn: 29 covered by another layer, 38 off-screen, 9 "check by eye" (the aria-hidden "·" HUD separators) |
| Play-test (`tools/a2-playtest.mjs`) | **84/84** (the original run plus one regression check per blocker; list below) |
| Route headings | 740 measured at 320 / 390 / 768 / 1024 / 1440; worst 3 lines |
| Dialog headings | 74/74 at 3 lines or fewer in 40 dialogs at 320, and 74/74 at 390 (the base-camp post plus 17 title, 9 partner, 6 polaroid and 7 service dialogs, opened from the list; the eighth service card, Release Candidate Oversight, opens in the report flow) |
| Images before interaction (home) | 124 KB in 43 requests on desktop, 125 KB on mobile (budget 1.5 MB) |
| HTML | 299 KB (budget 600 KB) |

Regression checks added for QA-REPORT-A2 (all pass):
- **B1:** Begin the run on a phone shows the HUD and the whole stage: 390 by touch, 320 by keyboard (2/2).
- **B2:** 48/48 map pins at 320, 360 and 390: 0 overlapping pairs, 0 under 24x24, 0 centres covered, axe `target-size` 0 (3/3).
- **B3:** the HUD plate holds every item at 320, 360 and 390, at the start and with LAUNCH showing (3/3).
- **B4:** the 390 "Tested on" accessibility tree names 9/9 platforms.
- **B5:** with `<body>` focus in the manual, Space and ArrowUp scroll, `L` opens nothing and the tester stays put; with the level in view, `<body>` focus still plays (2/2).
- **B6:** 8/8 demo bugs at 34+ px from title and partner art (34, 35, 36, 37, 39, 42, 47, 92).
- **M1:** the report stamp covers no figure, row or heading at 320 and 390 (2/2).
- **M2:** dialog headings at most 3 lines at 320 and 390 (74/74 each).
- **m1:** Close clear of every kicker and heading in 40/40 dialogs at 320 and 390, and clear of the card art at 768 and 1440 (4/4).
- **m4:** the typed quote is `aria-hidden` with a full sr-only copy, 9/9 at each width.
- **m5:** on a phone the open list leaves the HUD List toggle reachable, and banners and polaroids sit above the glyph layer.

The original checks still run: title, attract and keyboard start; HUD and live region; a title card with focus in and returned; two partner signs; three bugs plus the summit; a power-up banner; PEAK 2/6 and 3/6; the list; report, post form and confirmation; 8/8 unlocking "Apply now."; the routes; the reduced-motion map; no console errors.

## Fixes from QA-REPORT-A2

| Item | Fix |
|---|---|
| B1 mobile start off-screen | `startRun()` and `showMap()` scroll the game section into view after the mode change |
| B2 map pins overlap | The in-row lift is kept (cap raised), and each row is then pushed down by however far its pins rise above it, so no pin can reach the row above |
| B3 HUD clipping | Portrait plate wraps (`flex-wrap`, items `nowrap`, decorative separators hidden) |
| B4 platform names | Labels use the sr-only pattern at 560 px and below instead of `display:none` |
| B5 keys outside the game | `gameKeysActive()` accepts `<body>` only while the stage is at least half in view and the last pointer press was inside the game |
| B6 Stutter near King of Tokyo | The zone is now asymmetric (−40…+20 px) in level data, used by drawing, physics and the build validation, which now checks every bug's full extent against 34 px |
| M1 report stamp | On phones the stamp sits inline above the heading |
| M2 4-line heading | At 560 px and below the service glyph stacks above the heading, and headings use the full width (Close sits beside the kicker) |
| M3 Whimel Academy | Test Case Management matches on the service category only; its titles are Yooka-Replaylee, God Breakers, Lost Skies and Wild Blue Skies, all listing that category in `games.json` |
| m1 Close crowding | The kicker reserves 96 px; the card art starts below Close |
| m2 spawn over the sign | The tester and the attract ghost spawn between the tent and the base-camp sign |
| m3 pixel fonts below 12 px | `.chip`, `.svc-tag`, `.idx-state`, `.pin` and the manual's platform row are 12 px |
| m4 typewriter | Typed span `aria-hidden`; full `.sr-only` copy; an invisible full copy reserves the height, so the buttons do not move |
| m5 overlays | Banner and polaroid z 25 above the glyph layer (24); the phone list opens below the HUD; compact polaroid on phones |
| m6 test hook | `window.__a2` sits between `/* QA-HOOK:START */` and `/* QA-HOOK:END */`; the stripped copy runs clean (see QA numbers) |
| m7 README | This revision |
| m9 banners | No timed auto-hide; Close, or walk about one screen away |

## Proof

`proof/`:
- Desktop frames `01-title-attract.jpg` … `16-reduced-motion-map.jpg`: title, rules and bestiary, three peaks, ticket printing, service card, card resolving and resolved, partner dialogue, time-zone power-up, summit report, three manual views, and the reduced-motion map.
- Phone frames:
  - `17-mobile-title.jpg` and `18-mobile-run.jpg`;
  - `19-mobile-report.jpg`: the stamp above the heading;
  - `20-mobile-320-launch-hud.jpg`: the wrapped HUD with LAUNCH;
  - `21-mobile-320-map-pins.jpg`: separated pins.
- `run.webm` (19.7 s).
- `contact-sheet.jpg` and `contact-sheet-mobile.jpg`.

## Tools

- `tools/a2-serve.mjs`: serve and wrap.
- `tools/a2-probe.mjs`: screenshot plus state dump.
- `tools/a2-playtest.mjs`
- `tools/a2-proof.mjs`
- `tools/a2-measure.mjs`: run `[--axe-only]` to skip the heading and image-byte passes.
- `tools/a2-contrast.mjs`
- `tools/a2-strip-check.mjs`
- `tools/a2-build.mjs`: prints the layout warnings and every bug's clearance.
- `tools/a2-content.mjs`

`tools/a2-pixel-kit.py` belongs to the pixel artist.

## Known gaps

- `window.__a2` stays in `page.html` for the tests, between the QA-HOOK markers. The publish copy must strip that block; it runs clean without it.
- Underway logos are runtime colour reductions of the real logos, because the kit has no pixel art for them. At 28x13 they read as colour marks, and the card shows the full logo.
- The internal resolution adapts to the viewport: 360x225 at 4x on desktop, 195x143 at 2x on a portrait phone. Framing therefore differs slightly from the 384x216 style frame.
- On a portrait phone the time-zone banner still takes most of the 286 px stage (233 px). It now fits entirely and stays until closed or walked away from.
- Sound is WebAudio synth only, off by default, and was not judged by ear in headless runs.
