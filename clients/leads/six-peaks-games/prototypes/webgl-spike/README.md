# WebGL spike: Six Peaks Games

**Owner:** motion-lead · **Date:** 2026-10-10 · **Branch:** `claude/six-peaks-redesign-v56889` (not committed)
**Why:** Aldo on the first directions: "This isn't giving award winning gaming." Award-winning game sites run real-time WebGL. This spike proves the WebGL mechanics a rebuild needs, with Six Peaks' real assets, inside the Artifact page contract.

**Scope (after the coordinator's mid-task change):** Direction B (Press Start) is approved and frozen; this spike feeds a new Direction A. So the **bug hunt is the star** (priority 1), the **particle Six Peaks mark** is priority 2, and the **key-art shader** is reduced to one small use: the bug hunt's reward reveal. There is no key-art carousel hero, and none of B's corner brackets, HUD chips, "✓ Covered" checkpoints or controller-hint bar.

## Files

| Path | What |
|---|---|
| `page.html` | The spike, authored to the Artifact page contract (no doctype/html/head/body; `<title>Six Peaks WebGL Spike</title>` first). 87 KB. |
| `index.html` | Standalone copy written by `qa/shoot.mjs`. Never edit by hand. |
| `assets` | Symlink to `../../assets/web`. The page uses 5 files (0.4 MB): `brand/logo-white.webp`, `brand/team-1.webp`, `brand/vert-9.webp`, `games/outrage-fight-fest/key.webp`, `games/outrage-fight-fest/logo.webp`. |
| `proof/` | 42 frames, `contact-sheet.jpg`, `contact-sheet-mobile.jpg`, `spike-run.webm` (14.9 s), `proof.json` (all measurements). |
| `../../tools/spike-proof.mjs` | Proof capture: frame sequences, rAF frame times, loop-pause checks, fallbacks, webm. |
| `../../tools/spike-probe.mjs` | One-off probe: open the page and evaluate a snippet (used for layout and timing checks). |
| `../../qa/shoot.mjs` | Harness extended: cdnjs route now also serves `three.js/r128/three.min.js` from `node_modules/three/build/three.min.js`. Only that exact path is vendored; any other three.js path or version 404s, so the negative control still bites. The gsap mapping is unchanged. |
| `../../package.json` | `three` `0.128.0` (== cdnjs r128) added to devDependencies, pinned exactly. |

Run: `node qa/shoot.mjs prototypes/webgl-spike home --steps 6 --no-axe`, then `node tools/spike-proof.mjs` (or `--only frames|perf|fallback|video`).

## Page structure

1. **Hero, the mark in particles** (WebGL view 1): a title-screen composition. The Six Peaks range assembles from a swirling cloud, the H1 decodes, two CTAs (Book a trial, Play the bug hunt). Scroll explodes the mark; scrolling back reforms it.
2. **The bug hunt** (DOM only): the panel under test, a score bar, a ticket printer, and a reward panel whose key art is WebGL view 2.
3. **Contact footer**: verbatim contact copy, selectable email and phone with copy buttons, Apply now.

## Mechanic 3 (the star): the bug hunt

A real playable loop, built in the DOM so it works the same with or without WebGL.

- **Level:** a panel made of Six Peaks' own content (the rooftop team photo, a tester portrait, "Small enough to care, big enough to deliver.", the George line, and the four team stats). Bugs are only ever planted in Six Peaks' own content, never in partner art.
- **Bug pool:** 6 bug types across 4 regions. The first run is fixed to the brief's three: a **flickering texture seam** across the team photo, a **misaligned letter** ("c**a**re" drops and rotates), and a **clipped label** ("Staff retention" cut by its card). Each replay plants 3 of 4 regions at random: **missing texture** (magenta and black checker on the portrait), **missing glyph** (a tofu box in "In-offi□e staff"), and **z-fighting** (the ISO 27001 card lifted over its neighbour, flickering in draw order). Bug states are CSS custom properties (`--seam-x`, `--kern-y`, `--clip-y`, `--ov-x`), so without JavaScript the first set renders statically, and GSAP tweens the same variables to fix them.
- **Aim:** on mouse and pen, a circular scope reticle (ring, crosshair and red dot with a dark keyline for contrast on photos) replaces the cursor inside the panel, plus a trailing ring. Over a bug it locks: it contracts, turns red and rotates into an X. Native `cursor: crosshair` is the fallback. Touch taps directly.
- **Report feedback:** red shockwave at the hit, a 0.3 s panel shake, a hand-drawn annotation ellipse that draws itself around the defect, the counter rolls to n/3 and a peak pip fills red. A paper ticket feeds out of the printer slot (clip-path feed, LED blinks) and a red **REPORTED** stamp slams on: `BUG #SP-xxxx REPORTED · Severity: Minor · Repro: 100%`, plus the bug name, where it was and the time it was found. Then the spot fixes itself (the seam slides into alignment and stops flickering, the letter drops into place, the label rises into its card, the checker tiles stream back in) and leaves a small "✓ SP-xxxx" tag. On phones the ticket also slides up as a toast, and the score bar is sticky.
- **Game layer:** a clock that starts on the first shot, shots, accuracy, a best time (per-viewer `localStorage`, wrapped in try/catch), misses ("No repro" plus a grey ring), and a **Hint** that adds 5 s and rings the rough area of a remaining bug.
- **Reward:** on 3/3 the strip reads "All clear", the page brings the reward panel into view, and it unlocks: "Level clear. Good eye. Imagine what our testers find." with the run summary ("3 of 3 reported in 00:21.4, 75% accuracy. New best."), the verbatim Dylan Harfoot (Hardball Games) testimonial, **Book a trial**, **Apply now** and **Play again**. The art reveal is mechanic 1 (below). Play again re-locks the reward and plants a fresh random set.
- **Keyboard and screen readers:** each live bug is a real `<button>` positioned over the defect with `aria-label="Report visual bug: …"`, in reading order. A real Tab press from Hint lands on the next bug with a visible focus ring (verified: `focusVisible: true`), and Enter files it. After a keyboard report, focus moves to the next live bug, and after the last one to the reward heading. An `aria-live` region announces each report, hints and the result. Reduced motion keeps the whole loop but makes the feedback instant.
- **Honesty guardrails:** the reward pairs OutRage: Fight Fest (credited "In partnership with Hardball · QA by Six Peaks Games") with a verbatim quote about Six Peaks' capability ("not just to hunt bugs…"). Nothing says a partner game had bugs. ISO 27001 is labelled "Security adherence".

## Mechanic 2: the Six Peaks mark in particles

- **Targets from the real logo:** `logo-white.webp` is drawn into a 932 px 2D canvas. Pixels with alpha > 140 in the mountain band (top 47%, above the wordmark) become targets: 78% sampled from the fill, 22% from edge pixels so the six-peak ridge stays crisp. Coordinates are normalised to x −1..1. If the canvas were ever tainted (a cross-origin host), a 17-point ridge polygon traced from the same logo takes over (`markSource` in `proof.json` reports `canvas`).
- **Points:** 24,000 on desktop and 15,000 on phones or coarse pointers (90% mark, 10% ambient dust). 6.5% of the mark is brand red `#E02B20`; red points twinkle in size. A single `THREE.Points` with a custom `ShaderMaterial`. All motion is in the vertex shader; the CPU only updates uniforms.
- **Assembly:** each point has a delay of left-to-right position plus jitter, cubic ease in and out along an arc (perpendicular offset), out of a cloud that slowly orbits the Y axis. GSAP tweens `uAssemble` 0→1 over 3.2 s (`power2.out`), so the range visibly sweeps in from the left within half a second.
- **Cursor repulsion:** done in clip space after projection, so it is exact under any camera or object rotation: an aspect-corrected radial push plus a small tangential swirl, with the strength tweened in and out on pointer enter and leave. The whole mark also tilts slightly toward the cursor.
- **Scroll explode and reform:** desktop pins the hero for +75% with `scrub: 0.7` (`gsap.matchMedia`, min-width 900px). `uExplode` drives an outward 3D burst with a small Y rotation while the hero copy lifts away; scrolling back reforms it. Mobile scrubs the same uniform without pinning.
- **Look:** round anti-aliased points with normal alpha blending (no additive blending, so no glow), perspective size with a clamp, and fading near the camera.
- **Layout-driven:** an invisible `.mark-slot` in the DOM sets the mark's size and position. WebGL reads its rect every frame, so CSS owns the composition at every breakpoint, and the static fallback (a CSS crop of the real logo) sits in the same slot.

## Mechanic 1 (one small use): the key-art reveal in the reward

- **Locked:** a 34-cell-wide mosaic of the OutRage key art, drawn once into a tiny 2D canvas and shown with `image-rendering: pixelated` at 50% over the panel. No WebGL runs while it is locked.
- **Unlock:** the DOM mosaic hands over to an identical WebGL mosaic, then a `ShaderMaterial` dissolve runs. The field is fbm noise mixed with a diagonal sweep. At the frontier, UVs are displaced along the noise angle, with block-quantised glitch offsets, an RGB split, and a crisp 1.5 px brand-red frontier line (`fwidth`, so it is a line, not a glow). GSAP tweens `uReveal` over 1.9 s, and a separate 6 s tween settles the zoom from 1.1 to 1.0.
- **Settled:** cover-fit with a focal point in the shader, a cursor lens, an RGB split driven by smoothed pointer velocity, and fine grain. Uniform branches skip the noise field entirely once settled (this cut the view from 39.6 to about 30 ms under SwiftShader).
- **Partner credit** sits on the art in every state.

## One renderer, many views

- One `THREE.WebGLRenderer` and one fixed, full-viewport canvas behind the DOM (`z-index: 0`, `pointer-events: none`, `aria-hidden`). Each view (hero, reward art) registers a DOM element. Every frame the canvas is cleared, then each visible view is drawn with `setViewport` and `setScissor` at that element's `getBoundingClientRect()`. Sections are transparent where WebGL shows through. Proof: `webglContextsCreated: 1` on desktop and mobile (counted by wrapping `getContext`).
- **Loop gating:** an IntersectionObserver per view plus `visibilitychange`. When nothing is visible or the tab is hidden, the rAF loop stops and the canvas is cleared once. Proof: 0 frames rendered while parked between views; the loop resumes when the reward scrolls in and stops when `document.hidden` flips.
- **DPR** is capped at 1.5 (mobile DPR 2 gives a 1.5 pixel ratio and a 585×1266 canvas at 390×844). The only texture is 1900×792 (≤ 1920). `antialias: false`, no stencil, no mipmaps.
- **three.js loads lazily:** it is injected only when motion is allowed and WebGL exists. Reduced motion never downloads it.

## Fallbacks

- A one-line inline script right after the `<style>` adds `js`, and `gl-pending` when motion is allowed and WebGL exists, before first paint. This is a deliberate deviation from "scripts at the end": it stops the static mark flashing before the particles take over.
- **Reduced motion:** no three.js and no canvas. The composed static hero is the real logo mountain plus type and CTAs. The hunt still plays with instant feedback, and the reward unlocks to the static key art. Proof: `14/15-fallback-reduced-*`.
- **No WebGL** (also covers the script failing, context loss, or a 9 s watchdog): the `gl-off` class gives the same static versions. Proof: `14/15-fallback-nowebgl-*`.
- **No JavaScript:** a readable page. The hero mark image, type and CTAs show; the panel shows the first three bugs statically with a note that the game needs JavaScript; the reward shows unlocked with the static key art. Proof: `17-nojs-*`.

## Proof (all runs: 0 console errors, 0 failed requests)

- **Harness:** `node qa/shoot.mjs prototypes/webgl-spike home --steps 6 --no-axe` gives desktop and mobile 0 errors, 0 failed, no horizontal overflow at 390 px. With axe on: 0 violations (27 rules passed, 201 nodes desktop, 195 mobile).
- **Frames** (`proof/`, see `contact-sheet.jpg`):
  - `01-mark-assemble-1…6`: live capture of the cloud condensing into the range while the H1 decodes.
  - `02-mark-repulsion(-crop)`: the repulsion field over the main peak.
  - `03-mark-explode-1…3`, `03-mark-reform`: scroll explode and reform.
  - `04` aim and lock-on, `05` miss, `06-hunt-hit-1a/b/c` (shockwave and annotation, ticket printing, fixed), `07-hunt-keyboard-focus` and `07-hunt-hit-2` (Tab and Enter), `08` 3/3.
  - `09-reward-reveal-1…7`: the dissolve stepped through `uReveal` 0, 0.2, 0.4, 0.55, 0.7, 0.85, 1. `10-reward-clear`, `10-reward-cursor`.
  - `11-13`: mobile hero, sticky score bar with the ticket toast, reward.
  - `14/15`: reduced-motion and no-WebGL fallbacks.
  - `16`: replay variants (missing texture and tofu, texture streaming back, z-fighting).
  - `17`: JavaScript off.
- **Video:** `proof/spike-run.webm`, VP8 1280×800, 14.9 s: assembly, repulsion, explode, the three reports, the reveal. Headless SwiftShader frame rate, so it plays slower than a real GPU.
- **Frame time:** rAF deltas over 3 s, headless Chromium 141 on SwiftShader (CPU rasteriser), 1440×900, DPR 1. Final run, with the range across the three runs after the shader optimisation:

| State | avg ms | fps | p50 / p95 ms | JS + GL submit per frame |
|---|---|---|---|---|
| Hero, 24k points idle | 27.6 (24.9 to 27.6) | 36 to 40 | 33.3 / 33.4 | 0.29 ms |
| Hero with cursor repulsion | 23.2 (23.2 to 27.2) | 37 to 43 | 16.7 / 33.4 | 0.17 ms |
| Hero exploding (scrubbed) | 23.0 (22.8 to 27.2) | 37 to 44 | 16.7 / 33.4 | 0.13 ms |
| Reward key-art view | 31.8 (29.3 to 35.1) | 28 to 34 | 33.3 / 50 | 0.17 ms |
| Neither view on screen | 16.7 (page idle) | 60 | 0 frames rendered | none |

  JavaScript per frame is about 0.2 ms. The rest is SwiftShader rasterising and the headless software compositor copying the full-viewport canvas every frame, which a real GPU does not pay. Expect a locked 60 fps on desktop GPUs, but this is unmeasured: see Risks.

## Risks for the full rebuild

1. **Scroll sync of a fixed canvas.** Views follow DOM rects read in rAF. During fast compositor scrolling the WebGL can trail the DOM by about a frame. This is invisible on the full-bleed hero, and could be noticeable on framed art like the reward panel. Options: keep WebGL to full-bleed or unframed areas, add virtual smooth scroll (GSAP ScrollSmoother is free from 3.13, but the rules pin 3.12.5), or re-parent the single canvas into whichever view is visible.
2. **Real-device performance is unmeasured.** These numbers are SwiftShader. Test on a mid-range Android, an iPhone (including Low Power Mode, which runs rAF at 30 fps) and an integrated-GPU laptop before committing to point counts. On mobile, also watch the fixed canvas resizing as the URL bar shows and hides (debounce, or use `visualViewport`).
3. **Origin on the Artifact host.** Particle sampling (`getImageData`) and texture upload need same-origin assets. Relative files published with the page should be same-origin. If not, the particles fall back to the polygon and the reward to the static image (both handled, no errors), but check this on the published page.
4. **Bundle weight.** `three.min.js` r128 is 603 KB (about 150 KB gzipped) and only loads when needed. A production build could use an ES-module tree-shaken three or OGL (about 25 KB).
5. **Content and law.** Confirm with QA that the reward (partner art next to "Imagine what our testers find" plus the verbatim Harfoot quote) is inside the "don't imply partners' games had bugs" rule. The bugs themselves are only in Six Peaks' own content.
6. **Playability.** Keyboard play reveals bug locations through focus rings (accepted: access over challenge). Some random sets are easier than others; the hint covers the hard ones. Get one non-team playtest.
7. **Debug global.** `window.__spike` exposes uniforms and perf counters for the proof scripts. Strip it in production.

## Going further

- **Depth for key art:** generate depth maps (MiDaS, or Magnific depth) for 2.5D parallax and occlusion-aware distortion in the same shader; the cover-fit and focal-point code carries over.
- **Video textures:** `THREE.VideoTexture` from muted, looping, autoplaying MP4/WebM trailer cuts (the client's own), with a poster-frame fallback. Needs a larger asset budget.
- **GPGPU particles:** ping-pong FBO or transform-feedback simulation for inertia, curl-noise flow and spring-back, instead of stateless repulsion. The mark could also morph into each game's wordmark.
- **Single post pass:** grain, vignette and chromatic aberration for the whole canvas. Basis/KTX2 textures to cut GPU memory and decode time.
- **Bug hunt as a system:** a level per section of the real site, a shared leaderboard and score card (the Artifact data capability can store runs), and opt-in sound.
