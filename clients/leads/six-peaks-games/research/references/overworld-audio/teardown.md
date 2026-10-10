# Overworld Audio: teardown

> **THIN LIVE CAPTURE (no render).** Four live attempts on 2026-10-10 timed out (Firecrawl HTTP 408), including a screenshot-only request. One plain-text scrape succeeded and is quoted below. Both frames are **Awwwards' own curated images** of the site; they are real pictures of it, not our render, and carry no DOM.

Role on the board: **the B2B services analog**: a studio that sells a service to game developers, presented as a world to explore.

## Award (evidence)
- **Honorable Mention, 6 Sep 2026, plus Developer Award.** https://www.awwwards.com/sites/overworld-audio (page H2 "Honorable Mention - Sep 6, 2026"). The Developer Award badge is shown on the Games & Entertainment category card (https://www.awwwards.com/websites/games-entertainment/, read 2026-10-10).
- Creator: **Rogier de Boevé**.
- Awwwards description: "Portfolio website for Overworld Audio, a studio crafting sonic branding and immersive sound experiences, presented as an explorable map of their work." Palette chips `#13151f`, `#e9ecee`.
- Site meta description: "Audio co-development for games and interactive experiences, from prototype to final mix."

## Frames (`frames/`)
| File | Source | Shows |
|---|---|---|
| `overworld-audio-1.jpg` | Awwwards submission image (`/awards/submissions/2026/08/6a8c557533755369748961.jpg`) | Home: a dark 3D terrain whose ridges form the Overworld logo (concentric rings around a chevron), glowing coloured markers on the ridges, serif headline "Building unforgettable sonic experiences", nav PROJECTS, STUDIO, CONTACT, an `EXPLORE OUR WORK` button, and the hint "Drag or scroll to navigate. Click markers to explore." |
| `overworld-audio-2.jpg` | Awwwards desktop thumbnail (`/awards/element/2026/08/6a8c555265698135618125.jpg`) | A collage of screens: the glowing logo intro with "ENTER WITH SOUND" (and a small "ENTER WITHOUT SOUND" link), a "NEXT PROJECT" panel titled "Star Wars Jedi: Fallen Order", a second Star Wars Jedi project panel cut off at the frame edge with a "TO OVERVIEW" button, a studio page, and a project scene with a figure in red light. |

## Section skeleton (from the text scrape, no selectors)
Text returned by a plain Firecrawl markdown scrape of https://overworldaudio.com/ on 2026-10-10, in order:
- Gate: "Enter with sound", "100%", "Enter without sound"
- Chrome: "Overworld Audio", nav "Projects" (`/`), "Studio" (`/studio`), "Contact" (`/contact`), "SOUND OFF/ON", "Menu"
- H1 "Building unforgettable sonic experiences"
- Link "Explore our work" (`/work`)
- Hints: "Drag or scroll to navigate. Click markers to explore." and, for touch, "Drag to navigate. Tap markers to explore."

## Type, palette, motion, interaction (from images and text)
- Type: a book serif for the headline and project titles; small spaced uppercase sans for nav and buttons. Families not verified.
- Palette: night blue `#13151f` ground, cool white `#e9ecee` type, coloured marker glows.
- Interaction: drag or scroll to move over the map; click or tap markers to open projects; a sound gate with a loading percentage before entry.
- Motion: fog, glowing markers, camera moves over the terrain (from images; no timings).

## Signature idea
**The logo is the world.** The studio's mark is sculpted into the terrain, and the work sits on it as markers you fly to, so the portfolio is a place.

## What to steal for Six Peaks
- Build the level from the Six Peaks mark: the six peaks of the logo silhouette (`assets/web/brand/logo-white.png`) become the route's skyline and checkpoints, and each landmark on it is a title with its partner credited.
- The two-door gate: "Enter with sound" and "Enter without sound", with no sound by default and a visible loading state, on the title screen.
- The B2B tone: one plain statement and "Explore our work", then the work. Overworld shows real game credits (Star Wars Jedi: Fallen Order) the way Six Peaks can show its 13 shipped titles, always with the partner named.

## What this capture cannot support
- Any DOM selector, motion timing or stack claim. Re-capture in a GPU-capable browser under a new slug if a build needs it.
