# BEIGE FORCE!!: teardown

Capture: **REAL.** Live site captured 2026-10-10 through Firecrawl (1920x1080): the landing page and, after clicking `Play!`, the arcade attract screen both rendered. Live play (ship moving, shots) was not captured. Role on the board: playable reference for **a services studio pitching itself through an arcade game**.

## Award (evidence)
- **Honorable Mention, 4 Sep 2026.** https://www.awwwards.com/sites/beige-force (page H2 "Honorable Mention - Sep 4, 2026"; same badge on the Games & Entertainment category card).
- Submitted by `brandondurham`. On-site credits: "Based on an idea by Andrew Alford Creative and Brandon Durham, and created by Small Parade". Client: Andrew Alford Creative, a hospitality design studio ("Designer of hotels. Self-declared enemy of neutral mediocrity.").
- Awwwards description: "BEIGE FORCE!! is a retro arcade game that satirizes bland hotel design, turning the fight against safe, beige mediocrity into a colorful Space Invaders-style battle."
- Meta description: "Beige is winning. Entire neighborhoods are now described as “timeless.” A game about mediocrity, by a hospitality design studio that refuses it."

## Frames (`frames/`)
| File | Source | Shows |
|---|---|---|
| `beige-force-1.jpg` | live | Landing on mustard yellow: header "Andrew Alford Creative Presents… / BEIGE FORCE!! / “Beige deserves this.” / What is this?", two mono text columns (the studio, the game), a `PLAY!` button, and a grid of enemy cards, each a black pixel glyph with a name (Ledger, Mykenzie, Kash, Hayleigh and more). |
| `beige-force-2.jpg` | live, after `Play!` | Attract screen: an arcade cabinet window over a magenta pixel landscape, chrome title "BEIGE FORCE", a points table (B = 50, E = 35, I = 25, G = 20, E = 10 POINTS), "PRESS SPACE TO PLAY" and "KEYBOARD ARROWS MOVE PLAYER. SPACE FIRES BULLET." |

## Section skeleton (quoted DOM, live capture)
`document.title` "BEIGE FORCE!!", one screen (scrollHeight 1080):
- `section.arcade` (h1080) holding `section#stage.stage.ready` (h940) with one canvas (1440x1152)
- `section.landing` (h1080, H2 "Andrew Alford Creative", H2 "The Game") with `header.landing-header` and `footer.landing-footer`
- `div.info-drawer-scrim` and `aside#info-drawer.info-drawer` (h2354, H2 "Want your own custom game?", H2 "BEIGE FORCE!! Credits")
- `div.unsupported` (H2 "Access Denied", the unsupported-device state)
- Buttons/links: "What is this?", "Play!" (twice), studio links, font credits for Monaspace Neon and Kongtext.

## Type, palette, motion, interaction
- Type (`document.fonts`): Monaspace Neon 200 to 800 for all running text and labels (14px body); Kongtext 400 for the arcade pixel lettering.
- Palette: body background `rgb(237, 182, 18)` mustard, text `rgba(0, 0, 0, 0.8)`; inside the cabinet, magenta and violet pixel landscape, chrome yellow title.
- Interaction: classic shooter controls (arrows move, Space fires). The enemies are letters of the word BEIGE, each worth points. An info drawer carries the studio pitch and a "Want your own custom game?" call to action.
- Motion: CRT-style attract screen; letters drift behind the score table.

## Signature idea
**The studio's enemy is the game's enemy.** A hospitality design studio ships an arcade game about the thing it fights, introduces the enemies as a named roster on the landing page, and gives each enemy a point value on the attract screen.

## What to steal for Six Peaks
- The positioning move, word for word in spirit: a game about bugs, by the studio that hunts them. It says more about a QA studio than any claim line.
- A bug bestiary in place of the enemy roster: eight bug types, one per service named on the live site (Functional QA, Compliance QA, Functional Localisation QA, Bug Reporting & Environment Management, Test Case Management, Usability Testing, Performance Testing, Release Candidate Oversight), each card quoting that service's description verbatim. The glyphs are drawn by us; no fake game art.
- The attract screen as the rules beat: what each bug type is worth, "Press Space to start", and a one-line controls note that also names the touch controls.

## What this capture cannot support
- No in-play frames, so no data on enemy motion, difficulty or the end state.
- No durations or easing.
