# The Tie-break: teardown

Capture: **REAL hero and court (live); rallies and reveals from Awwwards images.** Live site captured 2026-10-10 through Firecrawl (1920x1080): the hero rendered with its WebGL background, and `Start` opened the court with "OPPONENT" and "YOU" labels. The rally itself (ball, paddles, score) did not start under capture, so rally frames are Awwwards' curated images. Role on the board: playable reference for **play that reveals content point by point**.

## Award (evidence)
- **Site of the Day, 25 Sep 2026, plus Developer Award.** https://www.awwwards.com/sites/the-tie-break (page H2 "Site of the Day - Sep 25, 2026", "SOTD / SCORE → 7.28/ 10", "DEV AWARD → 7.38/ 10"; the Games & Entertainment category card shows both the DEV and SOTD badges).
- Agency: **Merci Michel** (Awwwards PRO profile `/Merci-Michel/`). Client: New Balance x Miu Miu, with Coco Gauff.
- Awwwards description: "Play and explore the new New Balance x Miu Miu collection with Coco Gauff."
- Awwwards elements: Gameplay (x2), Transition, Shoes reveal.

## Frames (`frames/`)
| File | Source | Shows |
|---|---|---|
| `the-tie-break-1.jpg` | live | Hero: a blurred motion photo of the player, a tennis court drawn in thin blue and white lines over it, New Balance and Miu Miu marks, serif italic H1 "The Tie-break!", one line of copy and a small `Start` button. |
| `the-tie-break-2.jpg` | Awwwards image | A rally: paddles at the left and right edges, the ball, huge serif score numerals ("01", "04") and the brand marks on the court. |
| `the-tie-break-3.jpg` | Awwwards image | Between points: a full-bleed shoe close-up with the round number "03" on the court lines. |
| `the-tie-break-4.jpg` | live, after `Start` | The empty court with "OPPONENT" (top) and "YOU" (bottom) labels, waiting for play. |
| `the-tie-break-5.jpg` | Awwwards image | Late game, score "05" / "05", blurred player photo behind the court. |

## Section skeleton (quoted DOM, live capture)
`document.title` "The Tie-break!" (redirects to `/eu/en/`; og:url on `miumiu-wimbledon.web.app`), one screen:
- `div#app` holding `section.view.view-home` (h1080, H1 "The Tie-break!")
- one canvas (1920x1080); no `<video>` elements
- one button: "Start"
- Body text: "Play the game and discover the latest New Balance X Miu Miu collection with Coco Gauff."

## Type, palette, motion, interaction
- Type (`document.fonts`): Instrument 400 (the serif italic display), Work Sans 300/500 for UI.
- Palette: deep blues `#142A48` and `#05152D` with white hairlines (Firecrawl branding read), warm skin and red tones from the blurred photo.
- Interaction: a Pong-style rally on a tennis court; points scored step through numbered rounds, and the breaks between points show the product.
- Motion: heavy motion blur on photography, numerals that scale with the score, transitions between rally and product shot (an Awwwards element named "Transition").

## Signature idea
**Every point reveals the product.** A tiny, readable game (Pong on a court) where the reward for each point is the next look at the collection, so playing and browsing are the same act.

## What to steal for Six Peaks
- Reward each logged bug with a reveal of real content, the way each point reveals a shoe: one of the eight services, one of the six pillars, or a team photo.
- Draw the play field as thin lines over a blurred real photo: the rooftop team photo with the mountains behind it (`assets/web/brand/team-1.webp`) blurred as the backdrop of the test level, the six peaks traced in line on top.
- Big serif-weight numerals for the run counters (bugs logged, partners met) set in the display face with tabular figures, so the score reads like a scoreboard and not a widget.

## What this capture cannot support
- No live rally frames; no easing, physics or difficulty values.
- The WebGL library is not identified (one canvas, no global probed).
