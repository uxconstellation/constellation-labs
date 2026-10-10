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

## QA (final run: `node qa/shoot.mjs direction-b-press-start home,library,game-wild-blue-skies,game-lost-skies,game-king-of-tokyo --steps 12`)

| Route | Device | Console errors | Failed requests | Overflow @390 | Axe violations | Axe rules passed / nodes |
|---|---|---|---|---|---|---|
| #home | desktop | 0 | 0 | no | 0 | 29 / 1251 |
| #library | desktop | 0 | 0 | no | 0 | 27 / 533 |
| #game-wild-blue-skies | desktop | 0 | 0 | no | 0 | 24 / 494 |
| #game-lost-skies | desktop | 0 | 0 | no | 0 | 24 / 522 |
| #game-king-of-tokyo | desktop | 0 | 0 | no | 0 | 24 / 253 |
| #home | mobile | 0 | 0 | no | 0 | 29 / 1212 |
| #library | mobile | 0 | 0 | no | 0 | 27 / 491 |
| #game-wild-blue-skies | mobile | 0 | 0 | no | 0 | 24 / 430 |
| #game-lost-skies | mobile | 0 | 0 | no | 0 | 24 / 458 |
| #game-king-of-tokyo | mobile | 0 | 0 | no | 0 | 24 / 189 |

Also verified with probes:
- All 18 hero checkpoints visible with none on a face or logo.
- An eight-step navigation session (tile → dossier → E/Q → G → back/back/forward → #start): titles, H1 focus and scroll correct, and ScrollTriggers reset per route.
- The menu is a true modal. GSAP measures `position: fixed` elements by re-parenting them, which drops a modal dialog out of the top layer, so the dialog stays static and its inner panel animates.
- Form confirmation, tester view off, reduced motion.
- Greps: 0 em dashes, 0 spaced en dashes, no Inter/Space Grotesk/Roboto, no shadows, no bounce/elastic/back.

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
- **First-load weight**: the six hero keys (about 640 KB together) all load on first visit, because the recent-row thumbnails reuse them.
- **Preview-only behaviour**: trailers link out to YouTube (no embeds, per rules), and the form never sends (preview, per rules).
