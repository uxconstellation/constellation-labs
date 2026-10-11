# Direction A: The Ascent (build notes)

The page is the climb. Scrolling gains altitude (the rail climbs from 0 to 1,578 m, the height of Cradock Peak above George), the development lifecycle is the route, the games are the summits reached, and the contact form is base camp. References: content-ref `awwwards-seasats`, craft-ref `igloo-inc` (see `../DUPLICATION.md`).

- Deliverable: `page.html` (Artifact page contract: `<title>`, one Google Fonts `<link>`, one `<style>`, markup, scripts at the end; about 297 KB). `index.html` is written by `qa/shoot.mjs`; do not edit it.
- Fonts: Archivo (variable, `wdth` 62 to 125, display set at 125% / 800) and IBM Plex Mono. Scripts: GSAP 3.12.5 + ScrollTrigger from cdnjs, everything else inline.
- Tokens: the `:root` block from `DIRECTION-A.md`, plus `--night-2/3`, `--sky-1/2/3`, `--route-deep` (button hover), `--white` (button text on red: 4.63:1), hairline and scrim alphas.

## Routes

| Hash | Page tree |
|---|---|
| `#home` (default) | The full climb. Section tokens `#route`, `#why`, `#summits`, `#team`, `#reports`, `#careers`, `#basecamp` scroll within home (smooth unless reduced motion). |
| `#logbook` | All 17 titles: "Summits reached" (13) and "Climbing now" (4), with filters All · Multiplayer · Certification · Narrative · Cozy (tags derived from the verbatim game mode, genre, one-liner and focus fields). |
| `#log-<slug>` | Expedition log for each of the 13 released titles; a short log for the 4 underway titles (logo, one-liner, partner, "Project underway, further details on release." and nothing else). |

Back/forward work (`hashchange`), every route change scrolls to top, moves focus to the new H1, updates `document.title`, rebuilds the rail and refreshes ScrollTrigger. Route changes use the Igloo ring as a wipe (a thin concentric ring leading a night iris); instant under reduced motion.

## Featured summits (home chapters) and why

Lost Skies, Godbreakers, Suzerain, Lil Gator Game: In the Dark, OutRage: Fight Fest. Chosen from `qa/asset-contact-sheet.jpg`: five different partners (Powell Group, Thunderful, Torpor Games, Playtonic Friends, Hardball), five genres, key art that holds a 21:9 band, and the strongest stories (Lost Skies key art is literally a climber; OutRage is the embedded-team story: Six Peaks built and led Hardball's QA department). Deviation from the plan's default: Godbreakers replaces Wild Blue Skies because Wild Blue Skies shares a partner with Lost Skies and has no gallery; it still appears in three camps and the logbook. No underway title is used as hero or chapter art.

## Section by section (reference, deviation, the six bars)

Bars: R = reason to exist, Ref = real reference, M = it moves, F = flows into the next, I = intent, C = creative.

| Section | Reference (duplicated) | Deviation (ours) | Bars |
|---|---|---|---|
| Chrome | Seasats fixed right-hand vertical menu; Igloo four-corner mono micro-UI | Altimeter rail (≥1100px): ticks bottom-to-top, red fill and a live readout climbing to 1,578 m, the six-peak glyph on top; ticks are buttons with `aria-current`. Below 1100px: 3px red progress line plus a sub-bar with the current section and altitude. Mobile menu is a full-screen route map with ring markers. | R: wayfinding through a long page. Ref: Seasats rail. M: fill and readout track scroll. F: present on every route. I/C: altitude replaces page numbers. |
| 1. The range (hero) | Seasats hero media + rail; Igloo assembling hero object, fog depth, corner micro-UI | Six procedurally drawn ridgelines (`tools/a-ridges.mjs`, seeded), summit on ridge 3 right of centre, red dashed route with six camps, flag, a dotted line to "the next peak", clipped fog bands. H1 "Beyond standard QA." in Archivo expanded, CTA pair, corners (EMBEDDED GAME TESTING / SUMMIT 1,578 M / OUTENIQUA RANGE · WESTERN CAPE / live George and London clock), rotating site quotes (pausable), Tested on strip. | R: thesis in one frame. Ref: Seasats + Igloo. M: load assembly, camera climb, pointer parallax, ambient fog. F: pinned exit fades to night into the route. I/C: the brand name drawn as terrain. |
| 2. The route | Seasats pinned flythrough with waypoint captions; Igloo concentric ring | A generated contour map (marching squares over a seeded heightfield) with the red route drawn through seven camps: Base camp · Pre-production, Camp I · Alpha, Camp II · Beta, Camp III · Localisation, Camp IV · Certification, Summit · Launch, The next peak · Post-launch and DLC. The map pans to keep the active camp centre-left, the caption card swaps, a ring marks each arrival, a camp strip tracks progress. Service names and descriptions are verbatim; "Climbed with" chips cite each game's own focus or service item ("Covered · …") with partner credit, and the build fails if a citation is not in that game's data. Mobile: stacked camps with a contour strip per camp and the route down the left edge. | R: explains when a studio needs which QA (the IA axis). Ref: Seasats flythrough. M: pinned 420vh scrub. F: steps into the six peaks. I/C: the lifecycle as a climb with real evidence. |
| 3. Why teams rope up with us | Seasats pinned virtue statements | The six site pillars as one-line statements (copy verbatim beneath), one per peak: the large six-peak glyph lights the matching ridge red and plants its flag. Pillar 4 shows the live George and London clocks. Static stacked list at rest, on mobile and under reduced motion. | R: the six selling points. Ref: Seasats virtues. M: pinned 300vh crossfade + glyph. F: hands over to the summits. I/C: "six peaks" made literal. |
| 4. Summits | Seasats repeated product chapters (name, brief, spec grid) | Five chapters: full-bleed 21:9 key art (4:5 on mobile with per-game focal points), transparent game logo, one-liner, "Read the expedition log", spec grid (Partner, Genre, Platforms, Key testing focus from the homepage card). Then "The full logbook": the 17 official portrait posters (logos baked in, titles below, never overlaid) in a 7-column grid that fills exactly (13 + a booking tile; 4 underway + a heading cell). | R: the games are the proof. Ref: Seasats chapters. M: mist-lift mask, slow inner parallax, logo rise. F: the logbook closes the chapter run. I/C: summits as the unit of proof. |
| 5. The rope team | Seasats leaders | `brand/team-1.webp` (core team on the rooftop, Outeniqua range behind, per the manifest) with the caption; four stats as altimeter readouts with the site's sentences (ISO 27001 stated as adherence); dedicated-team copy; the four managers with LinkedIn links from the captured DOM; the AAA roots line. | R: trust in people. Ref: Seasats leaders. M: photo settles, readout hairlines draw. F: leads to what partners say. I/C: the rope team metaphor. |
| 6. Field reports | Seasats press / testimonial blocks | One dispatch at a time: mono header `FIELD REPORT · <STUDIO>`, quote verbatim, name, role and studio, white studio logo; large position count, Prev / Next buttons, auto-advance off by default (toggle). Faint contour texture. | R: third-party proof. Ref: Seasats. M: crossfade on change. F: into the partner logos. I/C: dispatches from the field. |
| 7. Studios we've climbed with | Seasats logo rows | 15 white partner logos in two slow opposing marquee rows with soft edges and a Pause control; static wrapped grid under reduced motion or without JS. | R: breadth. Ref: logo wall. M: GSAP marquee. F: closes the proof run. |
| 8. Join the expedition | Seasats "Join the crew" | Careers copy verbatim, Apply now (new tab), one vertical studio photo. | R: hiring in George. Ref: Seasats careers. M: mist-lift on the photo. F: up to base camp. |
| 9. Base camp | Seasats call to action | The sky warms to dawn behind a wider 8:1 copy of the same skyline with the summit flag top-right (planted on entry, one ring). H2 "Book a trial.", contact intro verbatim, the site's form fields and reasons, address, phone and email as selectable text with Copy buttons, the altitude footnote. Submitting shows "Request ready, not sent" and says nothing leaves the preview. | R: conversion. Ref: Seasats CTA. M: dawn warms, flag, ring. F: footer. I/C: pre-dawn hero to dawn base camp. |
| Logbook route | Plan section "Route #logbook" | Contour header band, H1, projects intro, CTA pair, filters with a live count, rows (key art thumb, title, one-liner, partner, focus chips) and an underway group with posters and "In progress" only. | R: the full catalogue. M: filter, ring wipe. F: rows open logs; trial band. |
| Log route | Plan section "Route #log-<slug>" | Key art hero with fog and a left reading column, breadcrumb, status, logo H1, partner credit, CTA pair (Book a trial + Watch the trailer). Route summary (scope verbatim, 1.35rem), Conditions card (partner logo, publisher, developer, mode, genre, platforms with icons, engagement model, focus), Pitches climbed (service groups on a red route that draws as you scroll, fully drawn at rest), From the field (the site's square/wide gallery as equal-height pairs, trailer link-out card using our own image), From the partner (the game page's testimonials), previous/next summit with partner credit, trial band. Wild Blue Skies and Grave Dodgers have no gallery, so only the trailer card shows. | R: the dossier a producer needs. M: hero zoom, route draw, gallery lift. F: prev/next keeps the climb going. |

## Motion list (GSAP 3.12.5 + ScrollTrigger; pins only at ≥900px via `gsap.matchMedia`)

1. Hero load (first visit, about 2.8s): ridges rise far to near (power3), crest lines draw, fog bands fade in, H1 lines rise in masks (power4), the route draws through a mask, camps appear, the flag plants (power4) and one thin ring expands from the summit. A boot script hides only these layers before first paint; a 2.8s failsafe reveals them if scripts fail; no-JS and reduced motion render the final state.
2. Hero exit (pinned +70%): ridges sink with depth parallax (0.15 far to 0.6 near), the range scales 1 to 1.18, corners and quote leave first, copy rises and fades, night fog rises. Pointer parallax up to ±11px per layer.
3. Ambient: fog bands drift (16s+ sine yoyo); summit flag cloth stirs.
4. Route flythrough (pinned +420%, scrub 1.2): map pan, route draw, sequential caption swap (no double exposure), arrival rings, camp strip.
5. Pillars (pinned +300%, scrub 1): sequential statement swap, glyph ridge colour and flag tween.
6. Summits: mist-lift gradient mask (72% to 130%), inner parallax, logo rise from a visible state.
7. Team photo settle; stat hairlines draw on entry (from-state set inside `onEnter`).
8. Field reports and hero quotes crossfade (power2/3).
9. Partner marquee (two rows, 70s and 82s loops, pausable).
10. Careers photo mist-lift; base camp dawn warm-up, flag and ring on entry.
11. Log pages: hero slow zoom, pitch route draw, gallery lift. Route changes: concentric ring wipe.
Easing only power2/3/4, expo, sine and linear scrubs. Hover/focus are the only CSS transitions. Reduced motion: no pins, no scrubbed camera, no parallax, no marquee, quotes paused, everything in final state.

## QA (final run, `node qa/shoot.mjs direction-a-ascent home,logbook,log-lost-skies --steps 12`)

| Route | Device | Console errors | Failed requests | Horizontal overflow | axe violations | axe rules passed / nodes |
|---|---|---|---|---|---|---|
| `#home` | desktop 1440 | 0 | 0 | no | 0 | 31 / 963 |
| `#logbook` | desktop 1440 | 0 | 0 | no | 0 | 25 / 602 |
| `#log-lost-skies` | desktop 1440 | 0 | 0 | no | 0 | 24 / 505 |
| `#home` | mobile 390 | 0 | 0 | no | 0 | 31 / 989 |
| `#logbook` | mobile 390 | 0 | 0 | no | 0 | 25 / 556 |
| `#log-lost-skies` | mobile 390 | 0 | 0 | no | 0 | 24 / 448 |

Extra checks (tools in `../tools/a-*.mjs`):
- `a-interact.mjs`: 31 of 31 pass (nav to logbook with `aria-current`, filters, row to log, focus on H1, scroll to top, back/back/forward, underway guard, trial band to base camp, form note, copy button, report prev/next and wrap, rail ticks and jump, mobile menu open/focus/Esc/focus return, menu jump, mobile marquee, reduced motion (no pins, all pillars and camps visible, marquee static, quotes paused), no-JS (hero, 9 reports, 5 chapters, 6 pillars visible)).
- `a-contrast.mjs` (text over imagery and SVG, which axe reports as incomplete; 95th-percentile background behind each text run): 1,113 text runs checked, 0 below threshold (home desktop 314 and mobile 163 across all 17 sections; logbook 91 + 35; log pages for Lost Skies, Wild Blue Skies, Suzerain, Cattle Country and The Witch's Bakery 457 + 93; every other released log hero also checked during fixes).
- `a-probe.mjs`: no heading wraps past three lines at 390px (home max 3, logbook 2, logs 2); no horizontal overflow at 390, 768, 1024, 1100, 1440 or 1920.
- House-law grep: 0 em dashes, 0 spaced en dashes (en dashes only in ranges such as 1–20+); banned words appear only inside verbatim partner quotes ("seamless", "seamlessly", "elevating"), which the rule allows; no shadows, glows, gradient text, numbered eyebrows or scroll prompts.

Proof frames: `proof/01-hero-range-desktop.jpg`, `02-route-flythrough-camp-iv-desktop.jpg`, `03-pillars-western-europe-clock-desktop.jpg`, `04-summit-chapter-lost-skies-desktop.jpg`, `05-full-logbook-grid-desktop.jpg`, `06-base-camp-dawn-desktop.jpg`, `07-expedition-log-lost-skies-desktop.jpg`, `08-mobile-hero-route-summit.jpg`.

## Copy decisions (all from `research/site-content.md` and `research/games.json`)

- Pillar 1 ends "…strengthened by AAA leadership and ongoing training." The site's "and best-in-class tech" is cut because the phrase is on the banned list outside quotes.
- Spaced en dashes inside two verbatim quotes are set as colons (house law); the underway note uses the plan's comma form.
- Game titles use each game page's own title (Godbreakers, Yooka-Replaylee, Lil Gator Game: In the Dark, King of Tokyo, It's Only Money); homepage card copy is used for one-liners, partner credits and focus lines (so Wild Blue Skies reads "Stability & Polish", not the page's "Polishe").
- Attributions get a comma after the name where the site omits one; a trailer title's emoji is stripped; duplicate service items are de-duplicated.
- Structural headings written for this direction (not claims): "From first build to launch day.", "Why teams rope up with us", "Summits reached", "The rope team", "Field reports", "Join the expedition", "Book a trial.", "Next summit: your game.", "The next peak" camp line "DLC, editions and community bug investigation." (from the plan, backed by the cited Lil Gator, Whimel Academy and Suzerain focus lines).

## Known gaps and deviations

- Hero quote sits bottom-right, not bottom-centre: the route's lower switchbacks occupy the centre. The top-left corner label reads EMBEDDED GAME TESTING (second SEO term) instead of repeating GAME QA STUDIO, which is already the eyebrow; bottom-left reads OUTENIQUA RANGE · WESTERN CAPE so George is not stated three times.
- The home logbook grid is 7 columns on desktop (4 on tablet, 2 on mobile), not 4: the official posters are portrait (405x687) and 7 columns fill exactly.
- Platform icons are the site's tiny rasters (59x63); SVGs are advised for production. Three "white" partner logos keep coloured icons as supplied (Powell, Chuhai, Impossible Home). Supercell appears only in the marquee (no title in the logbook), as on the site.
- Igloo's WebGL is reinterpreted with SVG/DOM layers (no WebGL, no 3D); the contour map is generated at runtime.
- A three-line boot script sits before the markup (sets `.js` and the first-load `.intro` class) to avoid a flash of the final hero state; it is the only deviation from "scripts at the end".
- The altitude readout maps scroll progress to 0 to 1,578 m; it is decorative and footnoted in base camp.
- Performance was not profiled (no Lighthouse in this container). The pinned map is a large SVG plane moved with transforms.
- The Seasats and Igloo screenshots are not available in this session; structure follows the committed teardown and blueprint text.
- Not committed or pushed (line manager's step).
