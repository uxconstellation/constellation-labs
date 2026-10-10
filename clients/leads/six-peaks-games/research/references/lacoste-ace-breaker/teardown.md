# Lacoste Ace Breaker: teardown

Capture: **REAL hero and rules screen (live); gameplay from Awwwards images.** Live site captured 2026-10-10 through Firecrawl (1920x1080): the hero and, after `Play`, the "6 bonuses" rules screen rendered. The 3D game itself was not started under capture, so gameplay frames are Awwwards' curated element images. Role on the board: playable reference for **a classic arcade game reskinned for a brand, with a rules screen that sells the bonuses**.

## Award (evidence)
- **Site of the Day, 3 Aug 2026, plus Developer Award and Product Honors (Jun 2026).** https://www.awwwards.com/sites/lacoste-ace-breaker (page H2 "Site of the Day - Aug 3, 2026", "SOTD / SCORE → 7.46/ 10", "DEV AWARD → 7.81/ 10"; the Games & Entertainment category card shows Product Honors Jun 2026, Developer Award and SOTD Aug 03, 2026).
- Agency: **Merci Michel**. Client: Lacoste (Roland Garros activation).
- Awwwards description: "Play and break as many bricks as you can to win tickets to Roland Garros and Lacoste polo shirts."
- Awwwards elements: Logo, Game (x3), In Game (x2). Palette chips `#082415`, `#FCD757`.

## Frames (`frames/`)
| File | Source | Shows |
|---|---|---|
| `lacoste-ace-breaker-1.jpg` | live | Hero on deep green: "LACOSTE" in the brand serif over "ACE BREAKER" in yellow sans, a line drawing of a racket hitting a ball, a hairline rule and a yellow `PLAY` pill; crocodile logo and menu in the header. |
| `lacoste-ace-breaker-2.jpg` | live, after `Play` | Rules screen: "6 BONUSES TO BOOST YOUR GAME" with six round icons and names (Defensive Wall, Multiball, Smash, Heavy Ball, Racket XL, Power Shot) and a `START GAME` pill. |
| `lacoste-ace-breaker-3.jpg` | Awwwards image | In game: a 3D clay court seen from behind the paddle, green brick walls, a glowing ball, HUD "VIES ●●● / 70" and stadium hoardings. |
| `lacoste-ace-breaker-4.jpg` | Awwwards image | Close-up of the 3D green bricks and the ball on clay, the crocodile painted on the court. |
| `lacoste-ace-breaker-5.jpg` | Awwwards image | In game with a different brick layout, HUD "VIES ●●● / 3". |

## Section skeleton (quoted DOM, live capture)
`document.title` "Lacoste - Ace breaker" (redirects to `/ace-breaker-rg/gb/en/`), one screen:
- `div#app` (H1 "Lacoste Ace Breaker")
- `header.app-header.visible` (h88), `aside.menucontainer`, `aside.transition-overlay` (h1080)
- `div.bg.app-background` (h1080) with one canvas (1536x864)
- `section.page.page-home` (h1080)
- Buttons: "Play", "Cookies Settings"; links to LACOSTE.COM and a country switch (UNITED KINGDOM (EN)).

## Type, palette, motion, interaction
- Type (`document.fonts`): Mona Sans 400/500 for UI and the "ACE BREAKER" line; the "LACOSTE" serif is the brand lettering.
- Palette: greens `#00503C` and `#082415`, yellow `#FCD757`, cream `#F3F2E1`, plus terracotta clay in the 3D scene. Pills are fully rounded (126px radius).
- Interaction: Breakout rules with power-ups; three lives ("VIES"); score; prize draw at the end.
- Motion: a transition overlay between pages (`aside.transition-overlay`); real-time 3D court with lighting and particles.

## Signature idea
**A classic game in brand clothes, sold by its bonuses.** Before you play, a rules screen names six power-ups as the reasons to care, so the brand's message arrives as game rules.

## What to steal for Six Peaks
- The six pillars as six power-ups on a rules screen before the run: Technically Excellent, Competitively Priced, Native English Speaking, Western Europe Time Zone, Culturally Aligned, Consistent Dedicated Teams, with their bodies verbatim. The name Six Peaks already promises six.
- The rules screen as the second beat after the title: what you do, what you collect, how the run ends, then a single start control. It doubles as the page's plain-language summary of the offer.
- A sparse HUD and the brand mark on the play surface: the Six Peaks mountain silhouette (`assets/web/brand/logo-white.png`) drawn into the level, with the counters reduced to two numbers.

## What this capture cannot support
- No live gameplay frames; no physics, easing or difficulty values.
- No 3D models exist for Six Peaks, so the 3D court itself is not a model to copy; the screen structure is.
