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
| Bugs (8) | Face left; 1px magenta outline pulse or 2-frame idle; faults swap in place (`faultSwap`) | Outline pulse plus the kit idle frames, with in-place fault swaps. Logging prints `BUG #SP-000n · DEMO · <Service> · Severity: Minor · Repro: 100%`, fixes the fault, bursts glyphs and opens the service card (verbatim text plus matching real titles) |
| Power-ups (6) | Verbatim pillar banners; the time-zone banner has live George and London clocks | Clocks via `Intl`. Banners pause their auto-hide while hovered or focused |
| Final zone | Label "Launch" in the HUD and the run report; keep "Peak n/6" | A LAUNCH HUD chip and announcement; the report has a "Launch" kicker, a stamp and a "Flag raised" row |
| Summit report | Book a trial → post form; at 8/8 "You'd make a good tester. Apply now."; Replay; Read the manual | As specified; the form shows a preview confirmation and sends nothing |
| Hints and toasts | Use the ground band, not the sky | The ticket printer, banners and polaroids sit in the lower band |
| Copy edits | Verbatim | Pull quote dash changed to a colon; "best-in-class tech" dropped; IS0 corrected to ISO; underway line uses a comma |

## Accessibility (WCAG 2.2 AA)

- Every object is a real button in the List overlay and in the reduced-motion level map (48 pins for 48 objects).
- Native `<dialog>` with `showModal`; Esc closes and focus returns to the opener.
- **Fixed in this pass:** dialog, list and rules entrances animated `autoAlpha`, which set `visibility:hidden` and dropped focus to `<body>`. They now animate opacity only, and the play-test guards it.
- HUD announcements go to an `aria-live="polite" aria-atomic` region. The canvas is `role="img"` with a debounced run summary.
- No flashing above 3/s. The game is never required to read anything.
- Reduced motion swaps the level for a static map with no animation loop.

## QA numbers

| Check | Result |
|---|---|
| `node qa/shoot.mjs direction-a-bug-hunt home,play,manual,log-lost-skies --steps 10` | 8/8 route x device runs clean (80 shots): 0 errors, 0 failed requests, no horizontal overflow at 390 and 1440, 0 axe violations (rules passed per run: 20–32; nodes 117–1459) |
| Axe with every state open (`tools/a2-measure.mjs`) | 32 states (16 desktop, 16 mobile; title, rules, help, post form and error state, title card, underway card, partner dialogue, service card, polaroid, power-up banner, open list, run report, HUD over canvas, manual): 0 violations in 32/32 |
| Contrast where axe says "incomplete" (`tools/a2-contrast.mjs`) | 496/496 drawn nodes pass, of 587 incomplete. Worst is the red button text at 4.63:1 against a 4.5 bar. Not drawn: 40 covered by another layer, 38 off-screen, 9 "check by eye" (all the aria-hidden "·" HUD separators) |
| Play-test (`tools/a2-playtest.mjs`) | **61/61** |
| Headings | 740 measured at 320 / 390 / 768 / 1024 / 1440; worst 3 lines (limit 3) |
| Images before interaction (home) | 124 KB in 43 requests, on desktop and on mobile (budget 1.5 MB) |
| HTML | 300 KB (budget 600 KB) |

The contrast sampler hides all text and screenshots the background (A). It then draws the audited nodes' own text in pure black, then pure white, with border colours locked; nodes whose boxes overlap go into separate shots. Only real glyph pixels flip between the two key shots, and A at those pixels is the true background, whether scrim, live canvas, dither or an overlapping layer. Motion is frozen meanwhile: rAF, GSAP, CSS animations and the game loop.

The play-test covers:
- title, attract and keyboard start; rules heading focus; route `#play`; stage focus;
- the HUD at 0/8 · 0/9 · 1/6; the live region's start announcement and its polite/atomic attributes;
- a title card with focus inside, the verbatim Key Testing Focus, partner credit, key-art resolve, and focus returned on Esc;
- two partner signs with name, role and studio, MET 1/9 and 2/9, and aria-live "Met …";
- bug 1 (Clipper): ticket text, BUGS 1/8, aria-live, the canvas `role=img` summary, a service card with verbatim text and real titles;
- jumping the ledge to bug 2; the power-up with its verbatim pillar banner; PEAK 2/6;
- bug 3 over peak 2; PEAK 3/6;
- L opening the list with focus inside; logging the summit bug from the list;
- the run report with counts and no Apply door below 8/8; Book a trial → post form → preview confirmation;
- 8/8 through the list unlocking "You'd make a good tester. Apply now.";
- `#log-lost-skies` and `#manual`;
- reduced motion: the map shows, 48/48 pins, no loop, a pin opens a card, focus returns to the pin;
- no console errors anywhere.

## Proof

`proof/`:
- Frames `01-title-attract.jpg` … `18-mobile-run.jpg`: title, rules and bestiary, three peaks, ticket printing, service card, card resolving and resolved, partner dialogue, time-zone power-up, summit report, three manual views, the reduced-motion map, and mobile title and run.
- `run.webm` (19.9 s).
- `contact-sheet.jpg` and `contact-sheet-mobile.jpg`.

## Tools

- `tools/a2-serve.mjs`: serve and wrap.
- `tools/a2-probe.mjs`: screenshot plus state dump.
- `tools/a2-playtest.mjs`
- `tools/a2-proof.mjs`
- `tools/a2-measure.mjs`: run `[--axe-only]` to skip the heading and image-byte passes.
- `tools/a2-contrast.mjs`
- `tools/a2-build.mjs`
- `tools/a2-content.mjs`

`tools/a2-pixel-kit.py` belongs to the pixel artist.

## Known gaps

- `window.__a2` is a test probe (mode, run, objects, `warp`, `deco` …) left in the page for the harness. Remove it before production.
- Underway logos are runtime colour reductions of the real logos, because the kit has no pixel art for them. At 28x13 they read as colour marks, and the card shows the full logo. Ask the pixel artist for four notice logos if you want them crisper.
- The internal resolution adapts to the viewport: 360x225 at 4x on desktop, 195x143 at 2x on a portrait phone. Framing therefore differs slightly from the 384x216 style frame.
- The summit power-up is lifted above the summit sign so the two don't overlap. The Clipper sits on the kit's `clipGround` site.
- Fixed in this pass, recorded for review:
  - `hash()` overflowed past 2^53 in plain JS multiplication, so no pines were ever planted; it now uses `Math.imul`.
  - The mobile power-up banner overlapped and clipped; it now fits the 286 px stage.
- The arrow keys in the rules and hint use 5x5 pixel SVG glyphs (Silkscreen has no arrows); screen readers hear "Left arrow" and so on.
- Sound is WebAudio synth only, off by default, and was not judged by ear in headless runs.
