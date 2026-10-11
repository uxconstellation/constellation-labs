# SuperPlay: teardown

Capture: **REAL.** Live site captured 2026-10-10 through Firecrawl (1920x1080): the hero and three states of the pinned home animation rendered. The "interactive challenges" named in the Awwwards description were not triggered by programmatic scrolling, so they are not shown. One extra frame is Awwwards' desktop thumbnail. Role on the board: **game company** reference for a scroll page where words and photos behave like game pieces.

## Award (evidence)
- **Honorable Mention, 16 Aug 2026.** https://www.awwwards.com/sites/superplay (page H2 "Honorable Mention - Aug 16, 2026"; same badge on the Games & Entertainment category card).
- Submitted by `AwesomeDeloitte`; the site footer reads "An Awesome Website | Powered by Group107".
- Awwwards description: "Guiding users through the brand manifesto via interactive challenges, bold typography, and direct graphics that capture its playful essence."
- Awwwards elements: Home Page Scrollytelling, Button Behavior, Careers Page, Mobile, Menu, 404. Palette chips `#E61A66`, `#AA33FF`.
- What it is: SuperPlay is a mobile games company (meta: "SuperPlay is set out to create a billion-dollar gaming company that delivers world-class, delightful games and has fun making them.").

## Frames (`frames/`)
| File | Source | Shows |
|---|---|---|
| `superplay-1.jpg` | live | Hero on hot pink: H1 "IT'S ONLY FUN IF YOU'RE WINNING" in a heavy condensed face, spinning gold coins, a 3D orange mascot peeking from the bottom edge, a `Play` pill and menu in the header. |
| `superplay-2.jpg` | live, mid-scroll | "BEING SUPER MEANS [About] LOVE TO PUSH OUR LIMITS": the word WE has become a yellow `About` pill (a headline word turned into a nav control). |
| `superplay-3.jpg` | live, further | Purple scene: "AND WE AIM TO FIND PEOPLE WHO FEEL THE SAME WAY" with team photos floating among dice and coins like pickups. |
| `superplay-4.jpg` | live | "BEING SUPER MEANS WE LOVE TO PUSH OUR LIMITS" with WE in yellow. |
| `superplay-5.jpg` | Awwwards desktop thumbnail | The hero framed on yellow: the mascot reaching over the headline. |

## Section skeleton (quoted DOM, live capture)
`document.title` "SuperPlay | Gold-standard Gaming Company", scrollHeight 9160, WordPress (ACF block `block-acf-block-home-page-animation-js`, `lottie.min-js`, jQuery):
- `aside#vplugin._vp_pos_left_side` (the Vee accessibility toolbar: text size, contrast, Stop Animations, Reading Guide and more)
- `div#wrapper.wrapper` (h9160) > `header#site-header.site-header.js-site-header` (h101), `nav.main-menu__nav`
- `section.block-home-page-animation.hp-container` (h9160): the whole home page is one pinned animation with scenes
  - `section.hp-scene__section.hp-scene__section--0` (H1 "It’s only fun if you’re winning")
  - `section.hp-scene__section--1` (H2 "BEING SUPER means welove to PUSH OUR LIMITS")
  - `section.hp-scene__section--2` (H2 "And we aim to find people who feel the same way")
  - `section.hp-scene__section--3` (H2 "Because it takes winners to build winning games")
  - H3 "Get exploring!", H2 "Good luck Raz! We’re behind you!"
- `footer#site-footer.home-site-footer` with `nav.footer-content-menu`
- Links: About, Careers, Games.

## Type, palette, motion, interaction
- Type (`document.fonts`): amsiproopt-headline 400 for display (H1 computed 137.28px), amsipro 400/900 for UI.
- Palette: hot pink `#E61A66`, purple `#AA33FF`, yellow highlights, off-white `rgb(255, 255, 245)` body.
- Motion: the page is a scroll-scrubbed scene sequence (Lottie plus a custom block script); coins spin, photos float, words recolour and morph into buttons.
- Interaction: per Awwwards, small challenges sit inside the scroll; the capture confirms the word-to-button behaviour only.

## Signature idea
**The manifesto is the level.** One pinned scroll scene where headline words turn into controls and team photos float like collectibles, so a company page feels like a mobile game without leaving the scroll.

## What to steal for Six Peaks
- Team photos as pickups in the world: the four manager headshots and the team photos (`team-1`, `team-3`, `team-4`, `team-5`, `vert-4`, `vert-9`, `vert-10`) collected along the route open the Team and Careers content.
- One headline word that turns into the control: in "Beyond Standard QA" (the live H1), the word QA becomes the "Start the test run" button.
- Ship the reduced-motion and accessibility path from day one, as SuperPlay does with its toolbar, but natively: a Stop animations control and a full static path, not a third-party plugin.

## What this capture cannot support
- The interactive challenges themselves (not triggered), so their mechanics are unknown.
- No easing values; the scene script was not captured.
