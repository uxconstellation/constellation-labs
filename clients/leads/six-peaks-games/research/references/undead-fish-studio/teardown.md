# Undead Fish Studio: teardown

Capture: **REAL.** Live site captured 2026-10-10 through Firecrawl (ChatCut `web_browser`, 1920x1080 viewport): the title screen, the game world after ENTER and the traditional site all rendered. Gameplay detail frames are Awwwards' own element images. Role on the board: **content-ref for the new Direction A** (playable lead).

## Award (evidence)
- **Honorable Mention, 4 Sep 2026.** https://www.awwwards.com/sites/undead-fish-studio (page H2 "Honorable Mention - Sep 4, 2026"; the Games & Entertainment category card shows the same HM badge and date).
- Creator on Awwwards: `christian-mansfeldt` (in-house, the studio built its own site).
- Awwwards description: "A creative studio's front page, rebuilt as a playable pixel-art Oslo. Talk to our NPC clients, see references, a post office that reaches a real inbox, and an AI that prices your build."
- Awwwards elements: Interactive Post office contact form; Studio Interactive Estimator AI Powered; Public noticeboard for visitors; Talk to NPC Clients to get information & references. Palette chips `#F3E4C8`, `#241E2E`.
- What it is: Undead Fish is a creative AI studio in Oslo (meta description: "A creative AI studio in Oslo. We turn ideas into concepts, prototypes and finished products..."). A services studio, not a game studio, which is why it is useful: same jobs as Six Peaks (references, services, contact) delivered as a game.

## Frames (`frames/`)
| File | Source | Shows |
|---|---|---|
| `undead-fish-studio-1.jpg` | live, 2026-10-10 | Title screen: "UNDEAD FISH / STUDIO / GAME VERSION", the player sprite, a year row ('22 to '26) and a `▶ ENTER` button on a night-sky gradient. |
| `undead-fish-studio-2.jpg` | live, after clicking ENTER | The world: a pixel-art Oslo street at night with STUDIO, POST and CINEMA buildings and a noticeboard; top-left counter `MET 0/7`; dialogue box "CHRIS / Welcome to Undead Fish Studio. / NEXT >" with a large pixel portrait; `HELP` and `↓ CLICK FOR TRADITIONAL SITE` bottom right; sound toggle top right. |
| `undead-fish-studio-3.jpg` | Awwwards element image | An NPC client: "LOCAL: Undead Fish shipped Launchabl for me in a few weeks. Want a look? VIEW ▸". |
| `undead-fish-studio-4.jpg` | Awwwards element image | The post office: a modal contact form (message, email, SEND) drawn as an in-game window over the town. |
| `undead-fish-studio-5.jpg` | live, after "traditional site" | The traditional site: dark terminal page, left icon rail, typed heading "> 04 / ESTIMATE / What can we build for you?", "> Just type here" input and suggestion chips. |
| `undead-fish-studio-6.jpg` | Awwwards element image | A sign: "SIGN: We specialize in building digital MVPs and productions." |
| `undead-fish-studio-7.jpg` | Awwwards element image | The notice board modal with pinned visitor notes. |

## Section skeleton (quoted DOM, live capture)
From an in-page DOM read on 2026-10-10 (`document.title` "Undead Fish — Creative AI Studio in Oslo", scrollHeight 7560 at load):
- `a.skip-to-content` ("Skip to main content")
- `div.fixed.inset-0` (h1080): the title-screen overlay with `▶ ENTER`.
- `nav.fixed.left-0.top-0` (h1080): the icon rail (Home, Work, About, Contact, Showreel, EN, NO).
- `main#main-content` (h7560)
  - `div.relative.h-screen.overflow-hidden` (h1080): the game. Two canvases, 1920x1080 and 1860x1080.
  - `section.absolute.inset-0.z-20` (h1080): game UI layer (`HELP`, `↓CLICK FOR TRADITIONAL SITE`).
  - `div.relative` (h6480): the traditional site, H1 "We build what you want with /AI".
- `div#awwwards` (h171): the Awwwards ribbon.
- Help text in the DOM: "Arrow keys walk. Space talks to people and opens doors. Escape steps back out."

## Type, palette, motion, interaction
- Type: the page loads Inter 400/500, Geist Sans and Geist Mono (Next.js `__Inter_*`, `__GeistSans_*`, `__GeistMono_*` in `document.fonts`). In-game lettering (counter, dialogue, signs) is pixel lettering drawn on the canvas; its font is not in `document.fonts`, so the capture cannot name it.
- Palette: cream `#F3E4C8` UI panels with ink `#241E2E` text, accent `#D97757` (Firecrawl branding read), night blues in the world. Buttons are square (0 radius) with a hard 5px offset base (`rgb(124, 90, 54) 0px 5px 0px`) that reads as a pixel bevel.
- Interaction: arrow keys walk, Space talks or opens, Escape backs out. Talking advances dialogue with NEXT. Places open modal windows (post office form, notice board). The counter tracks how many NPC clients you have met.
- Motion: falling snow, warm window light, a soft spotlight vignette around the player. The capture cannot give durations or easing.

## Signature idea
**Every business job is a place in the world.** References are NPC clients you walk up to, the service line is a sign, contact is the post office, and a `MET 0/7` counter turns reading testimonials into the goal. A `CLICK FOR TRADITIONAL SITE` exit sits on screen the whole time.

## What to steal for Six Peaks
- The nine verbatim partner testimonials become NPCs on the route, each with the partner studio's real logo and the quote with name, role and studio exactly as on the live site; a `MET 0/9` counter makes reading them the goal.
- "Book a trial" becomes a place (the post office pattern): walking into it opens the same inline form as the readable layer, with the house rule that the preview sends nothing and the details show as selectable text with copy buttons.
- Keep the traditional-site exit as a readable layer rendered under the game: six pillars, eight services, 17 titles with partner credit, team, careers and contact as plain HTML at rest, so the game is optional, the page passes AA and nothing waits on play.

## What this capture cannot support
- No durations or easing (no stylesheet or timeline was captured).
- The estimator ("an AI that prices your build") was not opened. Six Peaks publishes no prices, so it is out of scope anyway.
- Mobile behaviour was not captured (Awwwards lists a mobile thumbnail, not saved here).
