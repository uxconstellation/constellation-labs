# Direction A: The Ascent (visual plan)

**Thesis.** Every game is a climb from first build to launch day. Six Peaks is the rope team that climbs with you, from George, at the foot of the Outeniqua range. The page is that climb: scrolling gains altitude, the lifecycle is the route, the games are the summits, the contact form is base camp.
**IA axis:** the development lifecycle (when a studio needs which kind of QA). Direction B organises by title instead; keep these structurally different.
**References:** content-ref `awwwards-seasats`, craft-ref `igloo-inc` (see `DUPLICATION.md`).

## Tokens (write these as the `:root` block)
```
/* Layout: one vertical climb, fixed right-hand altimeter rail, full-bleed chapters, 12-col content grid */
--night:   #0A0F15   page ground (pre-dawn sky)
--ridge-1: #6B7A8C   far ridge (fog-lit)          --ridge-4: #263248
--ridge-2: #4E5D71                                --ridge-5: #18223A
--ridge-3: #37455C                                --ridge-6: #0E1626   nearest ridge
--fog:     #A6ABB5   (Igloo fog grey) haze bands, hairlines at low alpha
--snow:    #EEF1F4   primary text
--mist:    #9AA5B3   secondary text (≥ 4.5:1 on --night)
--route:   #E02B20   brand red: route line, summit flag, primary button fill (white text on it)
--route-hi:#FF5A4E   red for small text/icons on dark
--dawn:    #F3B47A   warm first light, used only in the summit/base-camp sky and the altitude highlight
--display: "Archivo", "Arial Narrow", Arial, sans-serif   (variable: wdth 62..125, wght 100..900)
--body:    "Archivo", Arial, sans-serif
--mono:    "IBM Plex Mono", ui-monospace, Menlo, monospace
```
Google Fonts: `Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900` and `IBM Plex Mono:wght@400;500;600`.
Type scale: display uses `font-stretch: 125%` (Archivo Expanded) weight 800, uppercase, tracking -0.01em, line-height 0.92. H1 `clamp(2.9rem, 7.2vw, 7.5rem)`, H2 `clamp(2.2rem, 4.8vw, 4.6rem)`, H3 `clamp(1.35rem, 2vw, 1.9rem)` at normal width 700. Body 1.125rem/1.6 at `font-stretch:100%`, max 62ch. Mono labels 0.75rem uppercase, letter-spacing 0.12em.

## Signature system: the six ridgelines
Generate six ridge silhouettes in JS (seeded value-noise, deterministic, ~120 points each) as SVG paths. Ridge 1 is far and fog-lit, ridge 6 is nearest and darkest. The highest point sits on ridge 3, right of centre: that is **the summit** and carries the red flag. The same six silhouettes are reused at small scale as the **six-peak glyph** (the pillars section and the rail) so the name is literally drawn. Fog bands are soft horizontal linear-gradients of `--fog` at 6-14% alpha between ridges (no CSS blur filters on large layers).
**Contours:** a second generator draws topographic contour lines (marching-squares or stacked offset noise rings) for the route map in section 2 and as a faint texture behind the logbook. Stroke `--fog` at 10-18% alpha, 1px.

## Global chrome
- **Top bar** (transparent over hero, `--night` at 86% once scrolled): logo (`assets/brand/logo-white.webp`, height 40px) left; right: text links "The route", "Games", "Team", "Careers" and a red **Book a trial** button. Mobile: logo + Book a trial + a Menu button opening a full-screen route map menu.
- **Altimeter rail** (Seasats' fixed right menu, desktop ≥ 1100px): fixed right edge, vertically centred, 1px `--fog` line 46vh tall with ticks for each home section: Base (hero), The route, Why us, Summits, The team, Field reports, Careers, Base camp. Active tick fills red and its label (mono) shows; the readout above shows altitude in metres, rising from 0 to **1,578 m** as the page scrolls (the summit height of Cradock Peak, the highest point of the Outeniqua range; cite it in the base-camp footnote). Click a tick to jump (smooth, respects reduced motion). `aria-label="Page altitude"`; ticks are buttons with `aria-current`.
  Mobile: a 3px top progress line in red plus the current section name in the top bar.
- **Four-corner micro-UI** on the hero (Igloo): tiny mono labels pinned to the hero corners: top-left under the logo `GAME QA STUDIO`, bottom-left `GEORGE · WESTERN CAPE`, bottom-right a live clock `GEORGE 10:42 · LONDON 09:42` (Intl.DateTimeFormat with `Africa/Johannesburg` and `Europe/London`, updates each minute).

## Home route `#home`: sections in order
1. **The range (hero)**. Seasats hero + Igloo assembling object. Height ~92svh so the platform strip peeks.
   - Sky: vertical gradient `--night` → `#132036` → faint `--dawn` at 8% just above the far ridge.
   - Six ridges across the lower 62%. The red route line (2px dashed, `--route`) zig-zags from the bottom-left ridge up to the summit flag.
   - Copy (left column, over sky): mono eyebrow `GAME QA STUDIO · GEORGE, SOUTH AFRICA`; H1 **Beyond standard QA.**; sub (max 34ch): "Embedded game testing for PC, console and mobile. The same testers stay with your game from first build to launch day." CTAs: primary **Book a trial** (→ `#basecamp`), secondary **See the games** (→ `#summits`).
   - Rotating hero quote (the three site quotes, 6s each, pausable button) bottom-centre in small italic with attribution.
   - Below the hero, a **Tested on** strip: the nine white platform icons from `assets/platforms/` with visually hidden names.
   - Motion (load timeline ≈2.4s): ridges rise from +40% in stagger (far first, power3.out), fog bands drift in, the route draws (stroke-dashoffset), the flag scales from 0 at its pole base (power4.out), H1 lines rise inside masks. Scroll (scrub, desktop): ridges parallax (far 0.15 → near 0.6 of scroll), the whole range scales 1 → 1.18 and sinks, as if the camera climbs past it. Pointer parallax ±10px per layer (desktop only).
2. **The route** (Seasats pinned flythrough with waypoint captions). Pinned ~420vh desktop.
   - A large contour map with the red route climbing through seven waypoints. As you scroll, the route draws, the map pans so the active waypoint stays centre-left, and the waypoint caption card swaps (crossfade + 24px rise). A ring (thin 1px `--fog` circle that expands, Igloo's concentric ring, no glow) marks each arrival.
   - Waypoints (a real sequence; name them, do not number them 01/02):
     - **Base camp · Pre-production**: Test Case Management (site copy). 
     - **Camp I · Alpha**: Functional QA + Bug Reporting & Environment Management.
     - **Camp II · Beta**: Performance Testing + Usability Testing; multiplayer and soak work.
     - **Camp III · Localisation**: Functional Localisation QA.
     - **Camp IV · Certification**: Compliance QA (TRCs, TCRs, Lotchecks).
     - **Summit · Launch**: Release Candidate Oversight.
     - **The next peak · Post-launch and DLC**: DLC, editions and community bug investigation.
   - Each caption: mono stage label, service name (H3), the site's description of that service (verbatim, trimmed only at sentence ends), and "Climbed with" chips naming titles whose site "Key Testing Focus" or page services match that stage (derive from `research/games.json`, released titles only; e.g. Certification → Wild Blue Skies, Lil'Gator Game: In the Dark, Town of Zoz, Cattle Country). Chips link to the game's log.
   - Mobile: the map becomes a static strip at the top of each waypoint; the waypoints stack vertically with the route drawn down the left edge.
3. **Why teams rope up with us** (Seasats virtues: one sentence per beat). Pinned ~300vh desktop.
   - The six pillars from the site, one per peak. Left: the six-peak glyph large; the peak for the current pillar lights red. Right: one huge statement (display, H3-size up to `clamp(2rem,4.5vw,4.2rem)`) with the site's body copy under it. Statements, in order: "Technically excellent." · "Competitively priced." · "Native English speakers." · "On Western Europe's clock." · "Culturally aligned." · "The same team, start to finish." Body text verbatim from the site. Pillar 4 also shows the live London/George clock pair.
   - Scrubbed crossfade between statements; at rest (no JS, reduced motion, mobile) all six render as a stacked list with the small glyph per item.
4. **Summits** (Seasats repeated product chapters). H2 "Summits reached", intro paragraph verbatim from "Our Projects".
   - Five featured chapters for released titles with the strongest art (check the contact sheet; default order: Lost Skies, Wild Blue Skies, Suzerain, Lil'Gator Game: In the Dark, OutRage: Fight Fest). Template per chapter: full-bleed key art band (21:9 desktop, 4:5 mobile) with a fog gradient into `--night` at the bottom; the transparent game logo bottom-left; a spec grid (mono labels): Partner, Genre, Platforms (icons), Key testing focus (three lines); a link **Read the expedition log** → `#log-<slug>`. Motion: the art is revealed by a mist-lift clip-path (bottom inset 35% → 0, scrubbed) with a slow inner parallax; the logo rises 20px.
   - Then **The full logbook**: a compact 4-col grid (2-col mobile) of all 17 titles: poster thumbnail, logo or title, partner. The four underway titles sit in a separate row headed "Climbing now" with an "In progress" mono chip and no focus claims. Link **Open the logbook** → `#logbook`.
5. **The rope team** (Seasats leaders). Full-bleed team photo in front of the mountains (see `assets/manifest.json` note for which file). Caption: "The Six Peaks team in George, with the Outeniqua range behind." Stats as altimeter readouts in a row (mono labels, display numerals): `1–20+` Team sizes · `100%` In-office staff · `99%` Staff retention · `ISO 27001` Security adherence, each with the site's sentence. Then the management four (headshots, name, role, LinkedIn link) and the AAA-roots line verbatim.
6. **Field reports** (testimonials). One large dispatch at a time with prev/next buttons and a count `3 / 9`; each card has a mono header `FIELD REPORT · <STUDIO>`, the quote verbatim, name and role, studio logo (white). Pausable auto-advance off by default.
7. **Studios we've climbed with**: the 15 partner logos in white, in a slow two-row marquee (static wrapped grid under reduced motion), with a pause button.
8. **Join the expedition** (Seasats careers). Careers copy verbatim, **Apply now** (external, `https://wkf.ms/4s5yyRp`, new tab), one vertical team photo.
9. **Base camp** (Seasats CTA). The sky warms to `--dawn` at the horizon; the summit flag sits top-right on the ridge. H2 **Book a trial.** Contact intro verbatim, the contact form (fields as the site: Name, Surname, Call number, Email address, Reason for contact select, Comment), contact details (address, phone, email with copy buttons). Footnote: "Altitude on this page climbs to 1,578 m, the height of Cradock Peak, the highest point of the Outeniqua range above George."
10. **Footer**: logo, nav, LinkedIn, © 2026 Six Peaks Games.

## Route `#logbook` (page tree: all games)
Header band with contour texture, H1 "The logbook", the site's projects intro. Two groups: "Summits reached" (13 released) and "Climbing now" (4 underway). Each entry is a row on desktop (thumbnail, title, one-liner, partner, focus chips, chevron to the log) and a card on mobile. A small filter set (buttons): All · Multiplayer · Certification · Narrative · Cozy (only if the data supports it; otherwise just All / Released / In progress).

## Route `#log-<slug>` (page tree: expedition log)
1. Hero: key art full-bleed with fog, transparent logo, breadcrumb "Logbook / <Game>", mono status `SUMMIT REACHED` or `CLIMBING NOW`.
2. **Route summary**: the site's scope paragraph verbatim, set large (1.35rem) at 60ch.
3. **Conditions**: a data card in mono: In partnership with (logo), Publisher, Developer, Game mode, Genre, Platforms (icons + names), QA engagement model.
4. **Pitches climbed**: the "QA Services Provided" groups drawn as a vertical route; each group is a pitch with a ring marker and its items; the red route draws down as you scroll (scrubbed stroke-dashoffset; at rest fully drawn).
5. **From the field**: gallery of the game's shots (2-col masonry desktop, 1-col mobile) and a trailer link-out card if `trailerUrl` exists ("Watch the trailer on YouTube", opens a new tab).
6. A partner testimonial if one exists for that studio.
7. Prev / next summit, then the Book a trial band.
Underway titles get a short version: logo, one-liner, partner, "Project underway, further details on release." and nothing else.

## Six design bars check (state per section in README)
Reason to exist, real reference, motion, flow into the next section, intent. Cut anything that fails.
