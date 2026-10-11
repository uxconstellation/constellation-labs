# Direction B: Press Start (visual plan)

**Thesis.** The games are the proof. The site behaves like a console home screen: the titles Six Peaks helped ship are the hero, every tile opens a QA dossier, and a **tester's view** overlay shows the game the way a Six Peaks tester sees it: framed, checked, covered.
**IA axis:** the catalogue of titles (what we have worked on, then how). Direction A organises by lifecycle instead; keep these structurally different.
**References:** content-ref `dune-awakening`, craft-ref `craft-basement-studio` (see `DUPLICATION.md`).

## Tokens (write these as the `:root` block)
```
/* Layout: console home screen; full-bleed media hero, tile library, two-pane loadout, fixed controller-hint bar */
--void:     #08090C   page ground
--panel:    #12141A   tiles, panels
--panel-2:  #1A1D25   raised panel / hover fill
--line:     #2B303B   hairlines, tile outlines
--text:     #F3F4F6
--muted:    #A0A7B4   (≥ 4.5:1 on --void and --panel)
--signal:   #E02B20   brand red: REC dot, primary button fill (white text), active slot marker
--signal-hi:#FF5A4E   red for small text/icons on dark
--ok:       #57D38C   semantic "covered/checked" ticks only, small
--ambient:  dynamic   colour sampled from the active game's key art (canvas average, darkened); used only as a large soft radial wash behind the hero and library at ≤ 22% alpha
--display: "Big Shoulders Display", "Arial Narrow", Impact, sans-serif   (800/900, uppercase)
--ui:      "Geist", "Helvetica Neue", Arial, sans-serif                 (400/500/600)
--mono:    "Geist Mono", ui-monospace, Menlo, monospace                 (500)
```
Google Fonts: `Big Shoulders Display:wght@700;800;900`, `Geist:wght@400;500;600;700`, `Geist Mono:wght@400;500;600`.
Type scale: H1 `clamp(3.2rem, 8.4vw, 8.8rem)` line-height 0.86 tracking 0.005em; H2 `clamp(2.4rem, 5vw, 5rem)`; tile titles Big Shoulders 800 1.35rem; UI body Geist 1.0625rem/1.55; mono 0.75rem uppercase letter-spacing 0.08em.
**Section glyph (Dune's device):** every section title is prefixed with a small red peak chevron (an inline SVG of two peaks taken from the Six Peaks logo silhouette) and suffixed with a mono counter in parentheses where a count is true, basement-style: "Library (17)", "Loadout (8)", "Reviews (9)".

## Global chrome
- **Top bar**: logo left (`assets/brand/logo-white.webp`, height 38px); centre nav: Library, Services, Co-op, Crew, Contact; right: a mono status `● REC 17 TITLES · 9 PLATFORMS` (red dot, true counts) and the red **Book a trial** button. Mobile: logo, Book a trial, Menu.
- **Controller-hint bar** (Dune's fixed rail, basement's keyboard hints): fixed bottom-centre pill on desktop: `[Enter] Book a trial   [G] Library   [M] Menu   [T] Tester view`. The keys work when focus is not in a form field. Mobile: a fixed bottom bar with one full-width **Book a trial** button (respect safe-area inset).
- **Ambient colour**: when the hero slide or a focused library tile changes, sample the key art (draw the already-loaded image into a 24×24 canvas, average, darken to L≈18%) and tween `--ambient` with GSAP over 0.8s.

## Home route `#home`: sections in order
1. **Showcase hero** (Dune hero). ~94svh so the recent row peeks.
   - Full-bleed key art of a shipped title, auto-rotating every 7s through six released games with strong landscape art (pick from the contact sheet; default Lost Skies, Wild Blue Skies, Suzerain, Lil'Gator Game: In the Dark, OutRage: Fight Fest, Town of Zoz). Ken Burns 1.04 → 1.1 over the slide. A pause button and a 7s progress line (console auto-advance). Never the four underway titles.
   - Left column copy over a `--void` gradient from the left: mono eyebrow `GAME QA STUDIO · EMBEDDED GAME TESTING`; H1 **Beyond standard QA.**; sub (max 36ch): "Embedded test teams for PC, console and mobile games, from George, South Africa, on Western Europe's working hours." CTAs: primary **Book a trial** → `#start`, secondary **Browse the library** → `#library`.
   - Bottom-right lockup: the game's transparent logo, `with <Partner>` and the credit line `QA BY SIX PEAKS GAMES` in mono.
   - **Tester view overlay (signature)**, on by default with a labelled switch "Tester view" (also key T): four corner brackets inset 24px framing the art; top-right mono status `TEST PASS · <GAME> · <PLATFORMS>`; on each slide change a single scan line sweeps the art (1.1s, power2.inOut) and then three **checkpoint markers** appear in sequence on calm areas of the art (positions stored per game as % coordinates; pick them by looking at each key art so they never cover faces or logos). Each marker: a 14px square reticle, a 1px leader line, and a chip that types in the game's real Key Testing Focus item from the site plus a `✓ COVERED` tag in `--ok`. Under reduced motion the overlay is static.
   - **Recent row**: the six hero titles as 16:9 thumbnails along the bottom (console "recently played" row); the active one has a 2px white outline and a progress underline; click or arrow keys switch slides.
2. **Tested on**: the nine white platform icons in a row with names on hover/focus (visually hidden names for screen readers).
3. **Library (17)** (basement's project grid): filter buttons (click, `aria-pressed`): All · Shipped · In test, and a platform filter (PlayStation, Xbox, Nintendo Switch, PC/Steam, Mobile) only if `research/games.json` has platforms for most titles; otherwise skip it. Grid of portrait tiles (6 col desktop, 3 tablet, 2 mobile) using `poster.webp`; on hover/focus a tile scales to 1.04 with a 2px `--text` outline (no shadow), reveals the logo, one-liner and partner on a `--panel` plate, and drives `--ambient`. In-test tiles carry a mono `IN TEST` chip. Each tile links to `#game-<slug>`. Library filtering animates with GSAP Flip-like FLIP done by hand (record rects, reorder, tween), or a simple stagger fade-scale if that is too heavy.
4. **Loadout (8)** (Dune's feature carousel). Two panes: left, the eight services as equipment slots (button list; icon, name, mono slot tag); right, the selected service: H3 in display, the site's description verbatim, "Used on" chips (titles whose focus or services include it, from the data), and a paired shot from one of those games. Up/Down arrows move between slots when the list has focus. Selecting animates the panel (clip-path wipe left→right 0.5s) and the shot (scale 1.06 → 1). Mobile: an accordion.
5. **Co-op mode** (Dune's two-layer parallax). Background layer: the testers-at-desks photo (`assets/brand/hero-testers.webp`) darkened; foreground: HUD panels. H2 "Same squad, start to finish." with the site's embedded-approach paragraph verbatim. A **squad builder**: a − / + stepper (buttons, not drag) from 1 to 20+, filling a grid of tester icons and a caption with the site sentence "Whether you need one tester or 20+, short-term or long-term, Six Peaks scales to fit." Stat readouts (rendered at final values; count up once on enter): `99%` staff retention, `100%` in-office, `1–20+` team sizes, `ISO 27001` security adherence. Then the six pillars as compact "perks" (title + site sentence).
6. **Reviews (9)** (Dune's news hub). A featured quote (largest) plus a 3-up row of the rest with prev/next buttons; each card: studio logo (white), quote verbatim, name, role, studio. Keyboard operable.
7. **Credits** (signature 2). A framed window that rolls end credits upward, centred, like a game's closing credits: title card `QUALITY ASSURANCE` / `SIX PEAKS GAMES`, then each partner studio (logo + the titles Six Peaks tested with them, from the data), ending on `THANK YOU FOR PLAYING`. GSAP auto-roll with a Pause/Play button; reduced motion shows the static list. Height ~70vh desktop.
8. **Crew**: the group photo with mountains (see `assets/manifest.json`), the management four as portrait cards (headshot, name, role, LinkedIn), the AAA-roots line verbatim, and a careers card: "Join the crew" with the careers copy verbatim and **Apply now** (external, new tab).
9. **Press start** (contact). H2 **Press start.** Contact intro verbatim, the form (fields as the site), contact details with copy buttons, office address.
10. **Footer**: logo, nav, LinkedIn, © 2026 Six Peaks Games.

## Route `#library` (page tree: catalogue)
H1 "Library (17)", the site's projects intro, the same filters plus a sort (A–Z, Partner). Larger tiles with the one-liner always visible. Selecting a tile updates `--ambient`.

## Route `#game-<slug>` (page tree: QA dossier)
1. **Dossier hero**: key art full-bleed with the tester-view corner brackets, the transparent logo, status chip `SHIPPED` or `IN TEST`, `with <Partner>`, platform icons, credit `QA BY SIX PEAKS GAMES`.
2. **Mission brief**: the scope paragraph verbatim.
3. **Spec sheet**: a two-column table in mono labels: Publisher, Developer, Game mode, Genre, Platforms, QA engagement model, Key testing focus.
4. **Test run** (signature motion on this route): the "QA Services Provided" groups rendered as a console log. On enter, the run plays: each item flips from `QUEUED` to `✓ COVERED` in sequence (≈35ms apart), a counter climbs `0 / N → N / N`, and the group header ticks when its items finish. At rest (no JS, reduced motion, or after the run) every item already reads `✓ COVERED`.
5. **Capture reel**: the game's shots as a horizontal reel with prev/next buttons, plus a trailer link-out card if `trailerUrl` exists.
6. A partner review if one exists for that studio.
7. Shoulder navigation: `[Q] Previous` and `Next [E]` buttons (keys work), then the Book a trial band.
Underway titles: hero with logo only on a dark panel (no art), status `IN TEST`, the one-liner, partner, and "Project underway, further details on release."

## Six design bars check (state per section in README)
Reason to exist, real reference, motion, flow into the next section, intent. Cut anything that fails.
