# Direction B: Press Start

A console home screen for Six Peaks Games. The games lead, every title opens a QA dossier, and a **tester's view** overlay frames the key art the way a Six Peaks tester sees it: bracketed, scanned, checkpoints typed in with the game's real testing focus and "✓ Covered".

- **Deliverable:** `page.html` (Artifact page contract). `index.html` is the standalone copy written by `qa/shoot.mjs`; never edit it by hand.
- **References:** content-ref `dune-awakening`, craft-ref `craft-basement-studio` (see `../DUPLICATION.md`).
- **Stack:** one HTML file, GSAP 3.12.5 + ScrollTrigger from cdnjs, Google Fonts (Big Shoulders Display, Geist, Geist Mono). 270 KB of HTML. Images stay as files under `assets/`.

## Routes (hash tokens)

| Route | Page tree |
|---|---|
| `#home` (default) | Showcase hero, Tested on, Library (17), Loadout (8), Co-op mode, Reviews (9), Credits, Crew, Press start |
| `#showcase` `#tested` `#titles` `#loadout` `#coop` `#reviews` `#credits` `#crew` `#start` | Home, scrolled to that section (nav, CTAs and footer use these) |
| `#library` | Catalogue: H1 "Library (17)", projects intro, status + platform filters, sort (site order, A–Z, partner), large tiles with the one-liner visible |
| `#game-<slug>` (17) | QA dossier. 13 shipped titles get the full dossier; the 4 underway titles get the in-test variant |

Back/forward work (`hashchange`). A route change wipes the screen with a void curtain, renders the new tree, scrolls to top (or to the section), focuses the new H1, updates `document.title`, and refreshes ScrollTrigger. The home route is **prerendered** into `page.html` by `tools/b-build.mjs` with the page's own templates, so it is complete at first paint with no JS.

## Hero titles (rotation of six, 7 s each)

**Lost Skies, Godbreakers, Suzerain, Whimel Academy, Lil Gator Game: In the Dark, Town of Zoz.**

I chose them by simulating the real 1440×846 crop of all 13 shipped key arts (2.4:1, logo-free) with the copy column, lockup and recent row marked. The HUD needs a calm zone to the right of the copy where checkpoints never touch a face or a logo:

- Lost Skies: sky, peaks and clouds.
- Godbreakers: a large dark field on the right.
- Suzerain: the window and curtains beside the president.
- Whimel Academy: architecture.
- Lil Gator: the cave and tree, clear of the characters.
- Town of Zoz: landscape.

The set covers six genres and partners Powell/Balor, Thunderful, Torpor, Impossible Home and Playtonic Friends.

Dropped from the default list:
- **OutRage**: faces fill the whole frame.
- **Wild Blue Skies**: the pilot's face and the jets occupy both calm zones; one reticle landed on the face.

Both still appear in the library, the loadout lists, the credits and their own dossiers. The four underway titles are never hero art.

Each slide stores three checkpoint positions in image fractions plus a preferred chip side (`tools/b-content.mjs → heroes`). At runtime the positions are mapped through `object-fit: cover` and the Ken Burns scale every frame. A collision pass then keeps each chip off the copy, lockup, status line and the other chips; it flips the chip or, as a last resort, hides it. All 18 checkpoints were verified visible at 1440×900. On mobile the three chips stack in the art band.

## Section by section: reference, deviation, six design bars

Bars: **R** reason to exist · **Ref** real reference · **M** it moves · **F** flows into the next · **I** real intent · **C** creative.

1. **Showcase hero** (Dune media hero → tester's view).
   - R: the games are the proof.
   - Ref: Dune's full-viewport media hero with logo lockup and two CTAs.
   - M: lock-on brackets, a scan line that is also the wipe edge revealing the next key art, three checkpoints typing in with "✓ Covered", Ken Burns 1.04 → 1.1, a 7 s progress line, and the lockup swap.
   - F: the recent row sits on the hero floor; Tested on peeks below it.
   - I: Book a trial and Browse the library.
   - C: the tester's view itself.
   - Deviation: the H1 stacks on three lines in a narrow column so the art carries the HUD. The status line lists up to three platforms, else "N platforms". A pause button is provided, and rotation pauses offscreen and on a hidden tab.
2. **Tested on (9)**.
   - R: platform coverage.
   - Ref: Dune's store badges, turned into "tested on" icons.
   - M: stagger in.
   - F: a hairline band under the hero.
   - Deviation: names are always visible under the icons instead of focus-only tooltips, so no extra tab stops.
3. **Library (17)** (basement project grid).
   - Official posters (logo baked in) in 6/4/3 columns, an "In test" chip on the 4 underway titles, title and partner under every tile.
   - M: hover/focus scales to 1.04 with a 2px outline and a plate (one-liner and "Open dossier"); a hand-built FLIP animates filtering; the ambient colour is sampled from the focused poster.
   - Deviation: no second logo on the plate (the posters already carry it). An 18th "Your game / Press start" slot closes the grid as a CTA. The platform filter is on (all 17 titles list platforms); the engagement model is not used as a filter, since 16/17 share it.
4. **Loadout (8)** (Dune feature carousel → equipment slots).
   - The eight services verbatim, each with a "(n)" mono counter and a "Used on" list built from `servicesProvided`, with partner credit.
   - M: clip-path wipe and image settle on select; ↑/↓/Home/End move between slots; a single-open accordion on mobile.
   - Deviation: each slot pairs the 1900 px key art (shown uncropped at 2.4:1) of a title **not** in the hero rotation (seven of the eight slots), so more of the catalogue is seen.
5. **Co-op mode** (Dune two-layer parallax).
   - Desktop: a sticky testers-at-desks photo layer with HUD panels scrolling over it (scrubbed). Mobile: a static photo band, no pin.
   - The embedded-approach paragraph verbatim, Dani Allum's pull quote, and a squad builder (− / + buttons, 1 to 20+, "Dedicated QA Lead" and "In-studio QA Manager" lifted from the site sentence).
   - Stats 99% / 100% / 1–20+ / ISO 27001 adherence, which count up once on enter; the six pillars as perks.
6. **Reviews (9)** (Dune news hub).
   - A featured quote plus the next three. Prev/next, ←/→, or clicking a card features it.
   - Every quote is verbatim with name, role and studio, and the studio's white logo.
7. **Credits** (signature 2).
   - A framed window rolls end credits: Quality assurance / Six Peaks Games, then all 15 partners with their logo and the titles Six Peaks tested with them (from the data, "In test" tags), the management four, platforms, and "Thank you for playing".
   - Plays only while on screen; a Pause/Play control sits in the section head. Reduced motion shows the static list.
8. **Crew**.
   - `team-1.webp` (core team on the rooftop with the Outeniqua range behind), the George paragraph, the AAA-roots line, and Management (4) with real LinkedIn links from the captured DOM.
   - "Join the crew" uses the careers copy verbatim, with Apply now opening in a new tab.
   - M: photo clip reveal and card stagger.
9. **Press start** (contact).
   - The H2 types in once.
   - The site's form fields and reason options, with native validation.
   - Submitting shows an inline confirmation: "This preview does not send anything. On the live site, your request goes to the Six Peaks team…". Nothing is ever claimed as sent.
   - Email and phone are selectable, with copy buttons (Clipboard API, falling back to text selection) and a polite live region.
10. **Footer**: logo, nav, LinkedIn, © 2026 Six Peaks Games.

**Dossier `#game-<slug>`** (shipped):
- Key-art hero: tester-view brackets lock on, a scan sweep, the logo as H1, the one-liner, partner, platform icons, "QA by Six Peaks Games", and the focus list flipping Queued → ✓ Covered.
- Mission brief (scope verbatim) beside a spec sheet table.
- **Test run**: "QA services provided" as a console log, where every item flips Queued → ✓ Covered about 35 ms apart, the counter climbs 0/N → N/N, and group ticks land. At rest every item already reads ✓ Covered, and "Run it again" replays.
- Capture reel: square gallery filmstrip with prev/next, plus a trailer link-out card on our key art.
- Partner reviews from that game's own page.
- Shoulder navigation ([Q] Previous / Next [E]) and a red Book a trial band.

Wild Blue Skies and Grave Dodgers have no gallery shots, so they get a standalone trailer card instead of a reel.

**Underway dossier**:
- No art: a tester-view frame with "In test · <title>", the logo, the one-liner and partner.
- A partner card with the partner's real logo and the site's line "Project underway, further details on release.".
- Spec sheet; no focus claims.

**Global chrome**:
- Top bar: logo, nav with `aria-current` (route plus scrollspy), "● REC 17 titles · 9 platforms", Book a trial, Menu.
- Desktop controller-hint rail (Dune's always-on rail with basement's key hints): [Enter] Book a trial, [G] Library, [M] Menu, [T] Tester view, plus [Q]/[E] on dossiers.
- Mobile: a full-width Book a trial rail with safe-area inset, hidden while the form is on screen.
- Menu: a console-guide `<dialog>` with the nav, all 17 titles with partner credit, settings (Tester view, single-key shortcuts on/off, which meets WCAG 2.1.4), and contact. Esc closes it ("Close [Esc]").
- Section glyph: a red two-peak chevron before every section title, which draws in on enter, and mono counters "(n)" where the count is true.

## Motion list (GSAP 3.12.5 + ScrollTrigger)

Easing is power2/3, expo and sine; "steps" is used only for the REC blink and typing. No bounce, elastic or back. CSS transitions are used for hover/focus only.

- **Hero**: bracket lock-on, scan-line wipe tied to `clip-path` reveal, checkpoint reticle pop, leader line, chip clip and character typing, ✓ snap, Ken Burns with per-frame checkpoint re-projection, 7 s progress bar, lockup swap, ambient colour tween (24×24 canvas average → `--ambient`).
- **Elsewhere**:
  - Route curtain wipe.
  - Glyph stroke draw and hairline extend per section head.
  - Tested-on stagger; library entrance stagger and hand-built FLIP filter/sort.
  - Loadout clip wipe and image settle.
  - Co-op scrubbed two-layer parallax (desktop only), squad cell pops, stat count-up.
  - Reviews swap; credits roll; crew photo clip reveal; Press start type-on; form confirmation reveal.
  - Dossier lock-on, scan and focus flips; test-run sequence; reel slide; menu panel slide.
- **Reduced motion**: everything renders in its final state. No rotation, no Ken Burns, no parallax, no roll (static credits list), no typing.
- **Complete at rest**: no content waits at opacity 0 for a ScrollTrigger. From-states are set only inside `onEnter`.

## Data and build

- `tools/b-content.mjs`: site copy. Every claim is wrapped in `V()` and checked against `research/site-content.md`, `research/games/*.md` and `research/games.json` (58/58 found). It also holds the hero picks and checkpoint coordinates.
- `tools/b-build.mjs` (`node tools/b-build.mjs`):
  - Reads `research/games.json` and `assets/manifest.json`, resolves every image with its real pixel size (0 gaps), and maps platforms, partners and services.
  - Normalises dashes for house law and writes `<script type="application/json" id="games">` and `id="site"`.
  - Prerenders `#home` with the page's own template block (`/*B:T*/ … /*/B:T*/`).
  - Lints for em dashes, spaced en dashes and banned words.
- `tools/b-probe.mjs`: QA helper (overflow finder, all-hero-slides capture, scripted states).
- `tools/b-a11y.mjs`: fix-round checks. `reflow` (all 19 routes at 390), `occlusion` (tab through every stop at 390×844, 720×450, 1024×768, 1280×720, 1440×900 and report coverage by the fixed bars), `contrast` (median background luminance inside each text rect, text hidden, on 6 hero slides + 13 shipped dossiers) and `snap` (full-page reduced-motion shots for before/after diffs). Every mode takes `--src <page.html>` to re-check a frozen baseline.

**House-law copy edits** (no new claims):
- Dani Allum's pull quote and her Wild Blue Skies / Town of Zoz testimonials: the spaced en dash before "they never felt" became a colon ("teams: they never felt").
- Pillar "Technically Excellent": dropped "and best-in-class tech" (buzzword outside a quote).
- Stat label "IS0 27001 Security Compliance" → "ISO 27001 security adherence" (site typo; claim measured as adherence).
- Grave Dodgers' game mode: the spaced range became "2–4 Player".
- The only banned-word hits left ("seamless", "elevating") are inside verbatim partner testimonials, which the house-law exception allows.

## Deviations from DIRECTION-B.md (with reasons)

- Hero set: Godbreakers and Whimel Academy replace OutRage and Wild Blue Skies (faces fill their calm zones).
- Three-line H1 in a narrow column (frees the art for the HUD).
- Mobile top bar is logo + Menu only; Book a trial lives in the fixed bottom rail (avoids two identical CTAs on one screen).
- Ambient colour is darkened to L≈26% (the alpha cap stays at 22%). At L≈18% the wash was invisible on the void.
- Checkpoints are positioned on the art only for the six hero titles. Dossier heroes show the same three focus items as a HUD list, which works for every shipped title.

## Fix round: WCAG 2.2 AA blockers from `qa/QA-REPORT-B.md` (B1, B2, B3) and one approved wording change

Aldo froze the approved design and cleared only these four items, so nothing else changed: no other visual or content edits, no refactors, no minors (m1 to m8), no performance work (M3). The before/after desktop diff below proves the scope.

**B1, reflow (WCAG 1.4.10)**
- Below 900px only, the spec table now uses `table-layout:fixed`, its cells take `min-width:0` and `overflow-wrap:anywhere`, and its chips wrap (`white-space:normal`, `line-height:1.3`). Desktop CSS is untouched.
- At 390px the seven dossiers that overflowed now measure 390/390: Suzerain (was 495), It's Only Money (465), Service with a Shotgun (457), Godbreakers (421), Lil Gator (413), Town of Zoz (397), Whimel Academy (397).

**B2, focus not obscured (WCAG 2.4.11)**
- `html{scroll-padding-bottom:80px}` on desktop (the hint bar is 48px tall, 16px off the bottom).
- `calc(84px + env(safe-area-inset-bottom,0px))` below 900px (the mobile rail is 73px plus the safe area).
- The existing `scroll-padding-top:calc(var(--top) + 12px)` keeps focus clear of the fixed top bar.

**B3, contrast of small HUD text over key art (WCAG 1.4.3)**
- **Status line** (hero and dossier): sits on the same `--veil` fill plate the checkpoint chips use. Its offsets moved by the plate padding, so the text stays in place.
- **Lockup lines** ("with …" and "QA by Six Peaks Games"): sit on the same plate, with negative margins equal to the padding, so the layout and glyph positions are unchanged.
- **Header band** of the existing hero and dossier top scrims: held at ≥0.85 behind the nav and the REC readout (0.88 → 0.86 over 58px), then the same fade out as before.
- These are fills only: no shadow, no glow.

**Wording (approved)**: the hero sub is now "Embedded test teams for PC, console and mobile games, from George, South Africa, with natural time zone overlap with Western Europe."

## QA (fix-round gate: `node qa/shoot.mjs direction-b-press-start home,library,<all 17 game-<slug> routes> --steps 2`)

38 runs (19 routes × desktop 1440×900 and mobile 390×844): 0 console errors, 0 failed requests, 0 horizontal overflow (max mobile scrollWidth 390), 0 axe violations. axe rules passed 928, nodes 16,944.

| Route | Desktop: errors / failed / overflow / axe viol. (rules / nodes) | Mobile: errors / failed / overflow / axe viol. (rules / nodes) |
|---|---|---|
| #home | 0 / 0 / no / 0 (29 / 1231) | 0 / 0 / no / 0 (29 / 1197) |
| #library | 0 / 0 / no / 0 (27 / 533) | 0 / 0 / no / 0 (27 / 491) |
| #game-warhammer-survivors | 0 / 0 / no / 0 (24 / 241) | 0 / 0 / no / 0 (24 / 177) |
| #game-yooka-replaylee | 0 / 0 / no / 0 (24 / 473) | 0 / 0 / no / 0 (24 / 409) |
| #game-boltgun-2 | 0 / 0 / no / 0 (24 / 249) | 0 / 0 / no / 0 (24 / 185) |
| #game-god-breakers | 0 / 0 / no / 0 (24 / 506) | 0 / 0 / no / 0 (24 / 440) |
| #game-lost-skies | 0 / 0 / no / 0 (24 / 520) | 0 / 0 / no / 0 (24 / 456) |
| #game-wild-blue-skies | 0 / 0 / no / 0 (24 / 492) | 0 / 0 / no / 0 (24 / 428) |
| #game-lil-gator | 0 / 0 / no / 0 (24 / 516) | 0 / 0 / no / 0 (24 / 452) |
| #game-town-of-zoz | 0 / 0 / no / 0 (24 / 512) | 0 / 0 / no / 0 (24 / 448) |
| #game-witchs-bakery | 0 / 0 / no / 0 (24 / 245) | 0 / 0 / no / 0 (24 / 181) |
| #game-suzerain | 0 / 0 / no / 0 (24 / 491) | 0 / 0 / no / 0 (24 / 427) |
| #game-king-of-tokyo | 0 / 0 / no / 0 (24 / 253) | 0 / 0 / no / 0 (24 / 189) |
| #game-cattle-country | 0 / 0 / no / 0 (24 / 510) | 0 / 0 / no / 0 (24 / 446) |
| #game-whimel-academy | 0 / 0 / no / 0 (24 / 457) | 0 / 0 / no / 0 (24 / 393) |
| #game-outrage-fight-fest | 0 / 0 / no / 0 (24 / 513) | 0 / 0 / no / 0 (24 / 449) |
| #game-service-with-a-shotgun | 0 / 0 / no / 0 (24 / 455) | 0 / 0 / no / 0 (24 / 391) |
| #game-grave-dodgers | 0 / 0 / no / 0 (24 / 392) | 0 / 0 / no / 0 (24 / 328) |
| #game-its-only-money | 0 / 0 / no / 0 (24 / 466) | 0 / 0 / no / 0 (24 / 402) |

**B2, tab-stop occlusion** (`node tools/b-a11y.mjs occlusion`, every focus stop on `#home`, coverage of the focused box by `.top`, `.mbar` or `.hints`):

| Viewport | Stops | Fully hidden, before → after | Partly hidden (max), before → after |
|---|---|---|---|
| 390×844 | 93 | 4 → **0** | 13 (82%) → 0 |
| 720×450 (1440×900 at 200%) | 93 | 5 → **0** | 37 (83%) → 18 (13%) |
| 1024×768 | 103 | 0 → 0 | 12 (19%) → 1 (19%) |
| 1280×720 | 103 | 0 → 0 | 16 (88%) → 1 (16%) |
| 1440×900 | 103 | 0 → 0 | 5 (12%) → 0 |

Residual partial overlaps are allowed under 2.4.11 AA:
- At 720×450 the library tiles are 408px tall, taller than the 286px clear band, so 12% sits under the top bar.
- At 1024 and 1280 the comment textarea is up to 19% under the hint bar, because Chrome scrolls an editable field only to its caret.

**B3, contrast** (`node tools/b-a11y.mjs contrast`): 418 text boxes over key art, 6 hero slides + 13 shipped dossiers.
- **Before**: 19 below threshold. My numbers match the verifier's: hero status 3.76 Lost Skies / 2.53 Town of Zoz, "QA by Six Peaks Games" 2.78 / 2.97, dossier status 2.72 Yooka / 3.01 It's Only Money / 3.13 Town of Zoz / 3.51 Cattle Country, nav "Crew" 4.21. The same states also failed for the REC readout (to 2.84), nav "Contact" (to 3.58) and "with The Powell Group…" (4.33).
- **After**: **0** below threshold. Minimums: status line 16.77, "with …" 16.86, credit 7.81, nav 6.66, REC 6.16.
- **Tightest margin**: the untouched dossier meta "QA by Six Peaks Games" on Lost Skies at 4.58:1. It is unchanged from before and passes.

**Scope proof** (`node tools/b-a11y.mjs snap`, full-page reduced-motion shots at 1440 wide; two baseline runs are pixel-identical for home and dossier):
- **`#home`**: 12,786px tall before and after. Only two hero bands differ: y 0–165 (header scrim and status plate) and y 520–645 (new sub wording and lockup plates). Everything below y 645 is pixel-identical.
- **`#library`**: 0 differing pixels.
- **`#game-lost-skies`**: only y 6–183 differs (header scrim and status plate). The desktop spec table is pixel-identical (B1 changes mobile only).
- **Source**:
  - The authored `page.html` changed in 10 CSS lines (7 edited, 3 added).
  - The generated home and site JSON changed only in the hero sub.
  - `tools/b-content.mjs` changed one string.

Earlier checks, unaffected by this round:
- All 18 hero checkpoints visible.
- Navigation session: titles, H1 focus, scroll and ScrollTrigger reset correct.
- The menu is a true modal.
- Form confirmation, tester view off, reduced motion.
- Greps: 0 em dashes, 0 spaced en dashes.

**Proof frames** (`proof/`):
- `01-home-hero-lost-skies-desktop.jpg`
- `02-home-hero-suzerain-desktop.jpg`
- `03-home-library-focus-desktop.jpg`
- `04-home-loadout-desktop.jpg`
- `05-home-coop-desktop.jpg`
- `06-dossier-lost-skies-hero-desktop.jpg`
- `07-dossier-lost-skies-test-run-desktop.jpg`
- `08-home-hero-mobile.jpg`

## Known gaps

- **Source image resolution**: posters (405×687), gallery shots (680×680) and platform icons (59×63) are the site's own files. They are sharp at 1x but soft on 2x screens at the largest library tiles and reel squares. Production should get originals or SVG platform marks.
- **Missing gallery shots**: Wild Blue Skies and Grave Dodgers have none, so their dossiers show a trailer card only. The underway titles have no shots by design.
- **Section glyph**: a hand-drawn two-peak chevron in the spirit of the logo's range silhouette, not traced from the logo file.
- **Coloured partner icons**: three partner "white" logos (Powell, Chuhai, Impossible Home) keep coloured icons; those are the official files.
- **Inconsistent attributions**: dossier testimonial attributions are printed as on each game page, and the site formats them inconsistently (for example "Dani Allum-Lead Producer").
- **Checkpoint tuning**: positions were tuned and verified at 1440×900. At other desktop sizes the collision pass may hide a chip rather than overlap copy (never overlaps).
- **First-load weight** (corrected figure; the fix is deferred): the verifier measured `#home` at 2.51 MB of images before any scroll on desktop (41 requests). My earlier "about 640 KB" counted only the six hero keys. The fix (QA-REPORT-B M3: thumbnail and logo derivatives, preloading only the next logo) was out of scope for the WCAG fix round.
- **Preview-only behaviour**: trailers link out to YouTube (no embeds, per rules), and the form never sends (preview, per rules).
