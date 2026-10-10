# Ink Games: teardown

> **THIN LIVE CAPTURE. Do not cite the live site's hero, layout or motion from this folder.** The live hero rendered as a black frame in the line manager's first capture (`ink-games-3.jpg`), and two retries on 2026-10-10 with longer waits timed out (Firecrawl HTTP 408). Only the lower page rendered live (`ink-games-4.jpg`, `ink-games-5.jpg`). The hero and mobile frames on the board are **Awwwards' own curated images**, which are real pictures of the site but not our render, and carry no DOM.

Role on the board: **craft-ref (1 of 1) for type and the object burst**, and one of the two game-company references.

## Award (evidence)
- **Site of the Day, 14 Oct 2025.** https://www.awwwards.com/sites/ink-games (page H2 "Site of the Day - Oct 14, 2025", "SOTD / SCORE → 7.34/ 10"; a "DEV AWARD → 7.68/ 10" score block is shown on the page, but the Developer Award badge was not confirmed on a category card, so it is not claimed).
- Agency: **ToyFight** (Awwwards PRO profile `/ToyFight/`).
- Awwwards description: "A new home for Ink Games showcasing why they are one of the leading mobile games companies in the world."
- Awwwards elements: Fun scrolling blocks, About Us, Playful animations, Snappy CTAs, Layered Cards. Palette chips `#A1FF4F`, `#0A0E11`. Awwwards tags include GSAP, Three.js and Next.js (tags, not verified in a DOM read).

## Frames (`frames/`)
| File | Source | Shows |
|---|---|---|
| `ink-games-1.jpg` | Awwwards desktop thumbnail (`/awards/element/2025/09/68b709b989e2d767218604.jpg`) | Hero: "JOIN THE NEW ERA OF GAMING" in a heavy condensed sans, white on near-black, with a burst of 3D game objects (coins, gems, characters, a green INKPAY card) exploding through the type; mono nav GAMES, INKPAY, STUDIO, SUPPORT; LOGIN and SIGN UP. |
| `ink-games-2.jpg` | Awwwards mobile thumbnail (`68b709b99db57905886490.jpg`) | Three phone screens: "PLAY. WIN. EARN." over a purple "BUILD YOUR KINGDOM" card; the hero; "JOIN SHARE EARN" with the green card. |
| `ink-games-3.jpg` | live, line manager's capture | **THIN:** a near-uniform black hero frame (the WebGL hero did not render). |
| `ink-games-4.jpg` | live, line manager's capture | Lower page: a tilted video card (office footage) on black, then the white footer: INKGAMES, FOLLOW, CONTACT, FIND US (Austin, Texas address), LEGAL, the octopus mark, a cookie bar. |
| `ink-games-5.jpg` | live, line manager's capture | A second tilted video card above the same footer. |

## Section skeleton
Not read from the DOM (timeouts). Visible from the frames only: header with mono nav and two auth buttons; full-width hero statement with object burst; scrolling content blocks with tilted video cards (Awwwards "Fun scrolling blocks", "Layered Cards"); white footer with grouped link chips.

## Type, palette, motion, interaction (from Awwwards images and tags)
- Type: one heavy condensed display face at very large size for statements; small mono uppercase labels for nav and chips. Families not verified.
- Palette: near-black `#0A0E11` ground with an acid green `#A1FF4F` accent (Awwwards palette), white type, saturated object colours.
- Motion: Awwwards names playful animations, fun scrolling blocks, layered cards and snappy CTAs; tags name GSAP and Three.js. No durations or easing captured.

## Signature idea
**Type with a burst.** A single huge statement with a cloud of game objects exploding through and around the letters, so the hero feels like a loot drop.

## What to steal for Six Peaks (craft only)
- The burst as the reward moment: when a bug is logged, a short burst of 2D sprites (our own bug glyphs and the six-peak mark, drawn on canvas) through the counter, timed with GSAP. No 3D models are needed and none exist.
- One heavy condensed display face reserved for the few statements (title screen, rules, run report), with small mono labels for HUD and chrome.
- Layered cards that slide over each other for the in-game title cards, so a reached landmark stacks key art, logo and partner credit as layers.

## What this capture cannot support
- Anything about the live hero, its motion, or the page structure beyond what Awwwards' images show. Re-capture under a new slug if a build needs more, after this one closes.
