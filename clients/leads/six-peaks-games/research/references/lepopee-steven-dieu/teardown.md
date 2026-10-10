# L'épopée de Steven Dieu: teardown

Capture: **REAL cover and opening film (live); gameplay from Awwwards element images.** Live site captured 2026-10-10 through Firecrawl (1920x1080). The cover and the anime opening film rendered; dispatched key events did not skip the film, so in-game frames come from Awwwards' curated element images. Role on the board: **craft-ref for the new Direction A** (how a one-person canvas game carries a portfolio).

## Award (evidence)
- **Honorable Mention, 16 Sep 2026.** https://www.awwwards.com/sites/lepopee-de-steven-dieu (page H2 "Honorable Mention - Sep 16, 2026"; same badge and date on the Games & Entertainment category card).
- Creator: `stevendieu` (self-built portfolio). Live URL: https://stediconsulting.fr/
- Awwwards description: "A portfolio you play like a 2D platformer. Run, double jump and catch orbs across cities: each one opens a project. Canvas 2D, vanilla JS, no framework."
- Awwwards elements: Hand painted hero; Anime opening film; End screen with world leaderboard; Projects open as in game cards.

## Frames (`frames/`)
| File | Source | Shows |
|---|---|---|
| `lepopee-steven-dieu-1.jpg` | live | Cover (EN): eyebrow "INTERACTIVE PORTFOLIO", H1 "The Saga of Steven Dieu", "Tech Lead Java / Angular · 33 years old · Nantes", "I present my projects as a video game. There is sound...", a "Sound on" toggle, buttons `▶ PLAY` and `SEE MY PROJECTS`, over a painted dusk city. |
| `lepopee-steven-dieu-2.jpg` | live, after PLAY | Opening film: three cockroach pilots in goggles and scarves, the villains. "Hold Esc to skip" bottom right. |
| `lepopee-steven-dieu-3.jpg` | Awwwards element image | In game: HUD top left "1 / 9" orbs and a timer "0:02", top right "Classement" and "Mes projets"; the hero in a speech bubble; a project opened as an ornate in-game card with screenshot, description and "01 / 09". |
| `lepopee-steven-dieu-4.jpg` | Awwwards element image | End screen: "Merci d'avoir joué ! Et si le prochain projet était le vôtre ?" with contact icons, a score card "965 790 PTS" with name entry and leaderboard, "Classement" and "Rejouer" buttons. |
| `lepopee-steven-dieu-5.jpg` | live | Opening film: the light orb (the player) flying towards the bugs. |
| `lepopee-steven-dieu-6.jpg` | Awwwards element image | The French cover ("L'épopée de Steven Dieu", JOUER / VOIR MES PROJETS). |

## Section skeleton (quoted DOM, live capture)
Single screen (`document.title` "Steven Dieu, Playable Portfolio", scrollHeight 1080). Overlays stacked over one canvas:
- `div#loader.loader`
- `canvas#game` (1920x1080)
- `div#hud.hud`, `div#collection.collection` (orb slots "01" to "09"), `div#tuto.tuto`
- `div#cover.overlay.overlay--cover` (H1 "The Saga of Steven Dieu"; buttons "Play", "See my projects", sound toggle)
- `div#intro.intro` (opening film; two `<video>` elements on the page)
- `div#rotate.rotate` (H2 "Turn your phone")
- `div#modal.overlay.overlay--modal`, `div#lightbox.lightbox` (project card and its gallery)
- `div#contact.overlay.overlay--contact` (H2 "What if the next project were yours?") with `section.contact__card.contact__card--collab` and `section.contact__card.contact__card--rank` (H2 "Leaderboard")
- `div#projects.overlay.overlay--projects` (H2 "My projects": the non-game route to the same content)
- `audio#bgIntro`, `audio#bgLoop`, `audio#bgBoss`, `audio#bgEnd`
- Tutorial text read from `#tuto`: "Because of these pesky bugs, all my projects got scattered! Catch them all: every orb is a project to win back. Move to start"

## Type, palette, motion, interaction
- Type (`document.fonts`): Cinzel 700 (titles on cards), Fraunces 500 to 900 (H1 at 60.8px), Quicksand 400/700 (body 16px).
- Palette: body background `rgb(52, 21, 82)` (deep violet), text `rgb(255, 243, 228)`; warm gold buttons and parchment cards.
- Interaction: run and double jump (keyboard; touch overlay `div#touch.touch` on phones), catch orbs; each orb opens a project card; a timer and orb count drive a score; the end screen asks for a name for the leaderboard. Four music tracks switch by phase (intro, loop, boss, end).
- Motion: full-screen anime film as the intro (skippable by holding Esc), painted parallax city.

## Signature idea
**Bugs are the villains and every collected orb opens a project as an in-game card.** The story line "these pesky bugs scattered my projects" turns a portfolio into a rescue run, with a HUD count (1 / 9), a timer, and an end screen that turns the score into a contact prompt.

## What to steal for Six Peaks
- The same spine with roles reversed for a QA studio: the visitor is the tester and the bugs are the quarry. Bugs live only in the Six Peaks test level, never in partner games.
- Open the 13 shipped titles as in-game cards when the player reaches their landmark: key art, transparent logo, partner credit and the three Key Testing Focus lines verbatim. The four underway titles appear only as boarded-up signs reading "Project underway, further details on release", with no art.
- Copy the cover's two doors and the end screen: "Start the test run" plus "Book a trial" on the cover (sound off by default), and a run report at the end that asks "Ready for a real build?" next to the booking form. Skip the leaderboard: there is no backend and no real scores to show.

## What this capture cannot support
- Live gameplay frames (the film did not skip under synthetic keys); in-game frames are Awwwards' curated images.
- No easing or physics values. The craft claim "Canvas 2D, vanilla JS, no framework" is the author's own Awwwards description; the DOM read is consistent with it (one canvas, no framework root element).
- The "Turn your phone" overlay suggests a landscape-only phone mode. Six Peaks must not copy that gate.
