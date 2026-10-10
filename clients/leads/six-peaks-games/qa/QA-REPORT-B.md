# QA REPORT: Direction B, Press Start

**Verdict: FAIL.** There are 3 ship-blockers, all WCAG 2.2 AA and each a few lines of CSS. There are also 3 majors. The four literal brief items pass, every sampled claim traces to research, and the craft is strong. Route this back to the builder and re-verify after the fixes.

- **Verifier:** qa-verifier, working from a fresh context. It ran on 2026-10-10 against `direction-b-press-start/page.html` (275,607 bytes).
- **Harness run:** `node qa/shoot.mjs direction-b-press-start home,library,game-lost-skies,game-suzerain,game-king-of-tokyo --steps 12`.
- **Own probes:** independent Playwright scripts kept in the session scratchpad.
- **Evidence:** `qa/shots/direction-b-press-start/qa-evidence/` and the contact sheets `qa/shots/direction-b-press-start/qa-sheet-*.jpg`.

## Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1.1 | Brief: redesign the site | PASS | Every live-site block is re-housed in a new IA across 19 routes: hero, offer, 6 pillars, 8 services, 15 partners, 17 projects, 9 testimonials, stats, team, management, careers and contact. See `qa-sheet-home-desktop.jpg` and `qa-sheet-home-mobile.jpg`. |
| 1.2 | Brief: extremely cool, epic | PASS | The tester's-view HUD types the real focus items onto real key art, and the console home screen, credits roll and test-run console add to it. See `qa-evidence/pass-hero-six-slides.jpg` and `home-desktop-s00.jpg`. The first impression is dented at common laptop sizes (M1). |
| 1.3 | Brief: built around the games | PASS | The hero is six shipped titles. The library of 17 comes second, every title opens a dossier, services link back to titles under "Used on", and the credits roll partners with their titles. |
| 1.4 | Brief: IA genuinely different from A | PASS | B is catalogue-first: `#home` runs showcase, library, loadout, then the rest, with `#library` and `#game-<slug>` routes and a controller-hint rail. A is lifecycle-first: `#home` runs route, why, summits, then the rest, with `#logbook` and `#log-<slug>` routes and an altimeter rail. The home axis, section order, chrome and detail templates all differ (dossier with test run versus expedition log). |
| 2a | Ref, Dune: media hero with logo lockup | Present | Full-bleed key art. The game logo, partner and "QA by Six Peaks Games" sit bottom right. |
| 2b | Ref, Dune: badges | Present | "Tested on (9)" sits as a strip under the hero. At 1440×900 the hint bar covers 4 of the 9 icons at rest: Nintendo, Epic and Steam fully, Windows partly (M1). |
| 2c | Ref, Dune: two CTAs | Present | Book a trial and Browse the library. |
| 2d | Ref, Dune: fixed conversion rail | Present | Desktop controller-hint bar and a mobile Book-a-trial rail. |
| 2e | Ref, Dune: visual + copy feature carousel | Present | Loadout (8): slots, a 2.4:1 key-art panel, verbatim copy and "Used on". |
| 2f | Ref, Dune: two-layer parallax | Present | Co-op: a sticky testers photo with scrubbed HUD panels on desktop. It is off on mobile and under reduced motion. |
| 2g | Ref, Dune: news/updates hub | Present | Reviews (9): one featured quote plus a 3-up, with prev/next. |
| 2h | Ref, Dune: recurring section glyph | Present | A red two-peak chevron before every section title, home and dossier. |
| 2i | Ref, basement: keyboard-hint chrome | Present | "Close [Esc]", [Enter], [G], [M], [T] and [Q]/[E], plus section hints. |
| 2j | Ref, basement: mono counters | Present | (17), (8), (9) and (38). |
| 2k | Ref, basement: tight heavy display, mono labels | Present | Big Shoulders 900 at 0.86 to 0.88 line height (per spec) with Geist Mono labels. |
| 2l | Ref, basement: grid with hover/focus states | Present | Tiles scale to 1.04 with a 2px outline and a plate. |
| 3a | Truth: claims trace to research | PASS | 283 claims sampled, 0 invented. 254 were checked by script (`qa-evidence/truth-claims.json`): all 4 stats, all 9 home testimonials plus the pull quote, all 18 hero checkpoint labels, 6 status lines, 6 lockup credits, and one-liner, partner, status, scope, publisher, developer and platforms for each of the 17 titles. It also covered 13 focus lists, 8 services, 6 pillars, 8 "Used on" counts, 15 partners plus 26 credit pairings, and the contact and management facts. A separate check confirmed the 18 dossier testimonials verbatim. 11 more were checked by hand: hero sub, form reasons, LinkedIn URLs and the crew alt. |
| 3b | Truth: documented edits | PASS | Dani Allum's spaced en dash before "they never felt" became a colon (dash law, 3 places), "best-in-class tech" was dropped from one pillar, and the "IS0" typo was fixed. Two traces sit outside the two named files: the form reason options and the LinkedIn URLs come from the captured DOM (`assets/raw/css/home-rendered.html`). "Used on" for Release Candidate Oversight maps the game pages' "Release Prep and Support" groups. |
| 3c | Truth: underway titles | PASS (see M2) | The four underway titles never appear as hero art: 0 requests for their key art across 9 routes. Their focus rows show only the underway line. Their dossiers do add a scope paragraph and an engagement-model row (M2). |
| 3d | Truth: ISO 27001 as adherence | PASS | It appears only as the "Security adherence" label with the body "Adherence to this benchmark". There is no certification wording. |
| 3e | Truth: no implied partner bugs | PASS | Overlays say only "Test pass", "Queued", "Running" and "✓ Covered". Bug wording appears only inside verbatim quotes and service names. |
| 4a | Dashes | PASS | 0 em dashes and 0 spaced en dashes. The 8 en dashes are unspaced ranges. Minor: m5. |
| 4b | Banned words | PASS | "seamless(ly)" and "elevating" appear only inside verbatim testimonials. |
| 4c | Shadows, glows, gradient text | PASS | box-shadow, text-shadow, drop-shadow and background-clip:text: 0 each. |
| 4d | Easing | PASS | Only power2/3, expo, none and steps (REC dot and typing). The cubic-bezier(.2,.7,.2,1) curve has no overshoot. |
| 4e | Numbered eyebrows, scroll cues | PASS | 0 of each. The only "↓" is the loadout key hint. |
| 4f | Fonts | PASS | Big Shoulders Display, Geist and Geist Mono. No Inter, Space Grotesk or Roboto. |
| 4g | Headings at most 3 lines | PASS | 742 measurements: 10 routes at 320, 390, 768, 1024 and 1440 wide. Maximum 3 lines, 0 over. |
| 4h | Hero CTA pair | PASS | Present on all 4 hero types: home, library, shipped dossier and underway dossier. |
| 4i | Click, not drag | PASS | 0 pointer, touch or drag handlers. Every control is a button or link. |
| 4j | SEO terms in `<title>` | FAIL (minor) | The title is "Six Peaks Games · Game QA Studio". "Embedded Game Testing" appears only in the hero eyebrow (m1). |
| 5a | axe (harness) | PASS | 10 runs, 0 violations, 256 rules passed, 5,826 nodes. A sweep of all 19 routes × 2 devices gave 38 runs, 0 violations, 928 rules passed and 16,890 nodes. axe also left 981 nodes as needs-review, which include the B3 contrast failures. |
| 5b | Console errors, failed requests | PASS | 0/10 harness runs and 0/38 sweep runs for each. |
| 5c | Horizontal overflow at 390px | **FAIL** | Harness: 1/10 (mobile `#game-suzerain`, 495px). Sweep: 7/38, all of them mobile dossiers (B1). |
| 5d | Keyboard, desktop | PASS | 1440×900: the skip link is the first stop and sits visibly above the top bar. Enter moves focus to `<main>`. All 107/107 stops show a 2px outline. After stop 107, focus cycles back to the skip link, so there is no trap. See `pass-focus-stops-1.jpg` and `pass-focus-stops-2.jpg`. |
| 5e | Focus not obscured | **FAIL** | Desktop at 1024, 1280 and 1440: 0 stops fully hidden, at most 35% partly hidden. Mobile 390×844: 6/97 fully hidden behind `.mbar`. 720×450 (200% zoom): 5/97 (B2). |
| 5f | Menu dialog | PASS | It opens from the top-bar Menu, the hint-bar Menu and the M key. Focus moves to Close and Tab stays inside. Esc, Close and the backdrop all close it, and focus returns to the invoker. |
| 5g | Shortcuts vs form fields | PASS | Typing "gmtqe" into the input, textarea and select fires nothing. Enter in an input leaves the route alone, Enter on a focused button activates that button, and Enter from the body goes to `#start`. The single-key toggle in Settings disables G, M, T, Q and E (WCAG 2.1.4). |
| 5h | Reduced motion | PASS | The slide stays at 0 after 9 s with no auto-advance, and the pause control is hidden. 3/3 checkpoints are visible and the stats sit at their final values. Credits show a static list, parallax is off, and dossier runs read 47/47 "✓ Covered" with "Run it again" hidden. 0 readable elements fall below 50% opacity. The home route also renders complete with JS off. |
| 5i | Text contrast over key art | **FAIL** | 9 of 131 measured text boxes are under 4.5:1 against the median background (B3). See `qa-evidence/b3-hud-text-contrast.jpg`. |
| 6a | Six design bars and visual plan | PASS with fixes | Hero, Library, Loadout, Reviews, Credits, Crew, Press start, the library route and the dossier meet all six bars. Tested on is partly covered at rest (M1). Co-op opens with a ~300px empty band at 1440, which is a flow nit and not a fix. The ambient wash leaves a seam (m3). The mobile library is 3-up where the spec says 2-up (m4). |
| 6b | Hint bar: anything permanently hidden? | No, but see M1 and B2 | At maximum scroll the bar sits below all footer content on the 4 routes checked (home, library and two dossiers, at both widths): desktop bar top 836 against content bottom 780, mobile 771 against 734. The footer reserves 120px on desktop and 110px plus the safe area on mobile. The bar does cover content at rest (M1), it hides focused controls on mobile (B2), and on the overflowing dossiers it ends up off-screen (B1). |
| 7a | HTML size | PASS | `page.html` is 269 KB, under the 1 MB cap. |
| 7b | First-load weight, image sizing | FAIL (major) | `#home` before any scroll loads 41 image requests, 2.51 MB, on desktop. The README's first-load note cites about 640 KB. The largest file is `town-of-zoz/logo.webp` at 297 KB, and several images load 7× to 24× larger than they display (M3). |

## Fix list (builder)

1. **B1. Mobile reflow breaks 7 shipped dossiers. Severity: blocker.**
   - **What:** `table.spec` grows to fit its widest no-wrap chip.
     - Widths at a 390px viewport: Suzerain 495px, It's Only Money 465, Service with a Shotgun 457, Godbreakers 421, Lil Gator 413, Town of Zoz 397, Whimel Academy 397.
     - The genre value and the Key testing focus chips are cut mid-word.
     - The layout viewport grows with the table, so the fixed Menu button and the Book-a-trial rail land off-screen. On Suzerain the layout viewport is 495×1072 against a 390×844 visible area, the Menu button's right edge is at 479 and the rail's top is at 999.
   - **Where:** `.chip{white-space:nowrap}` (line 57) used inside `.spec td ul` (line 566), and `.spec` (line 562).
   - **Fix:**
     - Add `.spec .chip{white-space:normal}`.
     - Add `.spec{table-layout:fixed}` and `.spec td{overflow-wrap:anywhere}`.
     - Re-run the overflow check on all 17 dossiers; the README run covered only 3.
   - **Rule:** WCAG 1.4.10 Reflow (AA, L4), and the BUILD-RULES gate "no horizontal overflow at 390px".
   - **Evidence:** `qa-evidence/b1-*.jpg`.
2. **B2. Focus hidden behind the mobile rail. Severity: blocker.**
   - **What:** Below 900px, `.mbar` covers the bottom ~73px and there is no `scroll-padding-bottom`, so keyboard focus lands on controls entirely behind it.
     - 390×844: the hero "Book a trial" and "Browse the library", the "It's Only Money" used-on link, the "Release Candidate Oversight" slot, and the LinkedIn links for Louise Ried and Callan Schroder.
     - 720×450 (1440×900 at 200% zoom): four loadout slots and one link.
   - **Where:** `html{scroll-padding-top:…}` (line 31) has no bottom counterpart; `.mbar` is at line 115.
   - **Fix:**
     - Add `@media (max-width:899px){html{scroll-padding-bottom:calc(84px + env(safe-area-inset-bottom,0px))}}`.
     - Add about 80px of bottom scroll padding on desktop for the hint bar.
   - **Rule:** WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum), AA (L4). Technique C43.
3. **B3. HUD text over key art fails contrast. Severity: blocker.**
   - **What:** Median background contrast is below 4.5:1 for 12 to 15px text in these places:
     - Home hero status line: 3.8:1 on Lost Skies (the default slide) and 2.5:1 on Town of Zoz.
     - "QA by Six Peaks Games" in `--muted`: 2.8:1 and 3.0:1 on the same two slides.
     - Dossier status line: 2.7:1 on Yooka-Replaylee, 3.0:1 on It's Only Money, 3.1:1 on Town of Zoz and 3.5:1 on Cattle Country.
     - Top-nav "Crew" over Suzerain's window: 4.15:1.
     - axe left these as needs-review (154 colour-contrast nodes on `#home`), so the builder's "0 violations" did not cover them.
   - **Where:** `.tv__status` (line 190), `.hero__lock`, `.hero__with` and `.hero__credit` (lines 175 to 181), the dossier `.tv` (line 526), and `.top::before` at scroll 0 (line 79).
   - **Fix:**
     - Put the status line and the lockup lines on the `--veil` plate the checkpoint chips already use.
     - Use `--text` for the credit when it sits on art.
     - Fill the top bar, or deepen the top scrim to at least .85, while it overlaps the hero.
     - Re-measure all 6 hero slides and all 13 shipped dossiers.
   - **Rule:** WCAG 1.4.3 (AA, L4) and the BUILD-RULES "small text ≥ 4.5:1".
4. **M1. The hint bar sits on hero content at rest. Severity: major.**
   - **What:** On desktop the bar covers part of the hero's last band at first paint.
     - 1440×900: 4 of the 9 Tested-on icons (Nintendo, Epic and Steam fully, Windows partly).
     - 1366×768 and 1280×720: the "Recently tested" thumbnails, up to 35% of a thumbnail. The captions sit under the bar and are also cut by the fold, because the hero is 769px tall in a 720px viewport.
     - Nothing is permanently hidden (row 6b), and desktop focus is never fully obscured (0/107 stops at 1024, 1280 and 1440).
   - **Fix:** Either of these:
     - Reveal the desktop bar only once the hero CTAs have scrolled out (the bar repeats them anyway).
     - Size the hero to `100svh` minus the bar and keep the recent row above it.
   - **Rule:** Six design bars (composition and flow at rest). The DUPLICATION rail should not cover the badges it is paired with.
   - **Evidence:** `qa-evidence/m1-*.jpg` and `home-desktop-s00.jpg`.
5. **M2. Underway dossiers say more than "in progress". Severity: major.**
   - **What:** The four underway routes render a Mission brief using the site's scope paragraph, for example "…to protect stability, gameplay quality and the overall player experience…". They also render a spec sheet with "QA engagement model: Embedded · Functional · Compliance", game mode and genre.
     - The text is verbatim, with no focus claims and no art, so the line manager may waive this.
     - The BRIEF says underway titles "carry no claims beyond 'in progress'".
     - DIRECTION-B's underway variant is: logo, IN TEST, one-liner, partner and the underway line. Direction A ships exactly that.
   - **Where:** `T.dossier()` (line 1088) renders the brief and spec for every status.
   - **Fix:** For underway titles, render the `dz-under` hero only, with publisher, developer and platforms at most.
   - **Rule:** The BRIEF guardrail and the DIRECTION-B route spec.
6. **M3. First load is about 4× the README figure. Severity: major.**
   - **What:** `#home` before any scroll loads 2.51 MB of images on desktop (41 requests) and 2.46 MB on mobile, plus about 200 KB of GSAP and fonts and 276 KB of HTML. A full scroll loads 2.72 MB. Four causes:
     - All six hero logos are preloaded with `new Image()`, 808 KB in total. `town-of-zoz/logo.webp` alone is 297 KB for a 962×463 mark shown at 340×112 or smaller.
     - The recent-row thumbnails reuse the 1900px key art at 180×101: 7.8× too large on desktop, 13× on mobile.
     - The brand logo is 1864px wide and shown at 79×38, 24× too large.
     - All 17 posters fall inside Chrome's lazy-load distance.
   - **Fix:**
     - Use ~400px derivatives for the thumbnails.
     - Use lossy-alpha logo derivatives at 40 KB or less.
     - Preload only the next slide's logo.
     - Use a ~400px brand logo.
     - Correct the README figure.
   - **Rule:** Claims measured (decision 0030), and this brief's performance check.
7. **m1. SEO title. Severity: minor.**
   - **What:** "Embedded Game Testing" is missing from `<title>` and from `S.title`.
   - **Fix:** Use "Six Peaks Games · Game QA Studio · Embedded Game Testing".
   - **Rule:** BRIEF guardrail "Keep the SEO terms in the page title".
8. **m2. Recent-row focus looks the same as the current slide. Severity: minor.**
   - **What:** Both states are a 2px `--text` outline; only the offset differs (3px against 2px). When focus is on a thumbnail that is not current, two identical rings show.
   - **Where:** Lines 224 and 230.
   - **Fix:** Give focus its own colour or offset.
   - **Rule:** Visible focus state (BUILD-RULES).
   - **Evidence:** `qa-evidence/m2-thumb-focus-equals-current.jpg`.
9. **m3. Ambient wash seam. Severity: minor.**
   - **What:** The `.amb` radial is centred at 10% of the section height, so it is cut at the section top. This leaves a hard edge at the top of `#start` (pixels step from rgb(8,9,11) to rgb(13,22,21)).
   - **Where:** Line 153.
   - **Fix:** Fade the top in with a mask, or move the centre down.
   - **Rule:** Six design bars (craft).
   - **Evidence:** `qa-evidence/m3-ambient-seam-start-section.jpg`.
10. **m4. Partner credits too small on mobile. Severity: minor.**
    - **What:** Partner credits render at 9px in `.tile__p` (line 301), `.used__list .p` (line 333) and `.menu__games .p` (line 135). The mobile library is 3-up where the spec says 2-up.
    - **Fix:** Set credits to 11px or more and use a 2-up grid at 520px and below.
    - **Rule:** Partner credit on every game appearance, which should be legible; DIRECTION-B library columns.
11. **m5. Dash used as a separator in two trailer titles. Severity: minor.**
    - **What:** "Town of Zoz - Official Gameplay Trailer" and "OutRage: Fight Fest - Launch Trailer" keep a spaced hyphen as a dash, while the other trailer titles were normalised to " · ".
    - **Fix:** Normalise these in `tools/b-build.mjs`.
    - **Rule:** House dash law.
12. **m6. Keyboard hint on touch layouts. Severity: minor.**
    - **What:** The top-bar "M" kbd hint shows on mobile.
    - **Fix:** Hide `.top__menu .kbd` below 900px, the same way `.hero__tools .kbd` is hidden.
13. **m7. Review logo alts. Severity: minor.**
    - **What:** The alts name the quoted studio rather than the pictured mark: "Playtonic logo" sits on the Playtonic Friends wordmark, and "The Powell Group/Humble Games logo" sits on the Powell mark.
    - **Fix:** Build the alt from `PL[r.partner].name`.
    - **Rule:** Alt text "<Studio> logo" describing the image.
14. **m8. Hero sub copy. Severity: minor. Route to the line manager, since the copy comes from DIRECTION-B.**
    - **What:** "on Western Europe's working hours" is stronger than the site's "natural time zone overlap".
    - **Fix:** Suggest "in Western Europe's time zone".
    - **Rule:** Claims only what the site says.

**Re-verify after the fixes.** Run the harness again over all 17 dossiers plus `home` and `library`. Repeat the keyboard pass at 390×844 and 720×450, and the HUD contrast measurement on all 6 slides and 13 dossiers. Then update the README QA table and the first-load figure.

## Re-check: blockers B1 to B3 and the hero wording (b5d7e52 against baseline cfdbd65)

**Re-check verdict: PASS.**
- B1, B2 and B3 are fixed.
- The `page.html` diff contains only those fixes and the approved wording change.
- The harness is clean.
- I logged one new finding below. It is not a regression: home overflows at 320px, and that overflow is already in the baseline. It is also outside the approved scope.

**What I tested**
- The working-tree `direction-b-press-start/page.html`, which is byte-identical to b5d7e52 (md5 1e98b35f…). The baseline cfdbd65 (md5 2731eaa7…) is the build the first pass judged.
- All checks use fresh probes; I did not use the builder's numbers.
- Negative controls: I re-ran the B2 and B3 methods on the baseline and they reproduce the original failures.

| Check | Result | Numbers |
|---|---|---|
| B1: reflow at 390px | PASS | All 19 routes (home, library and the 17 dossiers) have scrollWidth = clientWidth = 390, and the layout viewport stays the size of the visible screen. 165 chips checked: 0 clipped (no text, cell, viewport or ancestor overflow). 821 spec-sheet words checked: 0 broken mid-word. The 4 words that wrap (Co-operative, On-rails, Farm-lite, Wave-Based) all break at their hyphen. On the Suzerain first paint, the Menu button's right edge is at 374 and the Book-a-trial bar's top is at 771, so both are on screen. Evidence: `qa-evidence/recheck-b1-*.jpg`. |
| B2: focus not obscured | PASS | 12 runs, 765 tab stops, 0 fully hidden behind a fixed bar. Each stop is hit-tested at 35 points with `elementFromPoint`, so z-order counts. 39 stops are partly hidden, which AA allows: 36 at 720×450 (at most 40%) and 3 on desktop (11% to 20%). The baseline control, using the same method, found 6 of 96 hidden at 390×844 and 5 of 96 at 720×450, which are the original B2 stops. Per-size results are in the breakdown under this table. |
| B3: contrast over art | PASS | I measured 170 text boxes by sampling the pixels behind each one with its text made transparent. 0 fall below 4.5:1, even against the lightest 5% of background pixels. The baseline, measured the same way, had 60 of 170 below. Minimums per element are in the breakdown under this table. |
| Scope | PASS | `git diff cfdbd65 b5d7e52 -- …/page.html` shows 11 hunks and 20 changed lines; each one is mapped under this table. The games JSON and the runtime JS are identical; the site JSON differs only in `hero.sub`. No scope creep in `page.html`. Elsewhere in `direction-b-press-start/` the range touches only the README, the regenerated `index.html` (it equals the wrapped `page.html`) and 4 proof frames. |
| Harness | PASS | `node qa/shoot.mjs direction-b-press-start home,library,game-suzerain --steps 12` gave 6 runs (3 routes × 2 devices). Errors 0/6, failed requests 0/6 and axe violations 0/6, with 160 rules passed and 4,401 nodes. Overflow 0/6; mobile Suzerain is now 390 wide, down from 495. The harness regenerated `index.html` byte-identical to the committed copy. |
| Hero wording | PASS | The new sub reads "…from George, South Africa, with natural time zone overlap with Western Europe." It traces to the site's "Western Europe Time Zone" pillar, which resolves m8. |

**B2 per-size results.** Each cell is stops fully hidden / stops tabbed. 1024 is 1024×768, 1280 is 1280×720 and 1440 is 1440×900; blank cells were not run.

| Route | 390×844 | 720×450 (200% zoom) | 1024 | 1280 | 1440 |
|---|---|---|---|---|---|
| home | 0/96 | 0/96 | 0/106 | 0/106 | 0/106 |
| library | 0/43 | 0/43 | 0/51 | | |
| game-suzerain | 0/24 | 0/24 | | 0/35 | 0/35 |

**B3 minimums.** Each value is the lowest contrast against the lightest 5% of background pixels; the threshold is 4.5:1.

| Element | Desktop | Mobile |
|---|---|---|
| Hero status line (6 slides) | 16.3:1 | 16.1:1 |
| Hero partner line (6 slides) | 16.3:1 | 17.8:1 |
| "QA by Six Peaks Games" (6 slides) | 7.6:1 | hidden on mobile |
| Top-bar nav over the hero (30 boxes) | 6.5:1 | hidden on mobile |
| Top-bar nav over the dossiers (65 boxes) | 6.9:1 | hidden on mobile |
| REC readout, hero | 6.0:1 | hidden on mobile |
| REC readout, dossiers | 5.9:1 | hidden on mobile |
| Dossier status line (13 shipped titles) | 16.4:1 | 15.1:1 |

The detailed scores are in `qa-evidence/recheck-b3-contrast-{fixed,baseline}.txt`.

**Scope mapping.** Every changed line in `page.html` belongs to one of the approved items:

| Item | Line | Change |
|---|---|---|
| B2 | 31 | `scroll-padding-bottom: 80px` on desktop |
| B2 | 116 | `scroll-padding-bottom: calc(84px + safe-area)` at 899px and below |
| B3 | 165 | Hero top scrim darkened to .88/.86 over the first 58px |
| B3 | 179 | `.hero__with` gets the veil plate |
| B3 | 181 | `.hero__credit` gets the veil plate |
| B3 | 191 | `.tv__status` gets the veil plate |
| B3 | 239 | Mobile position of the `.tv__status` plate |
| B3 | 526 | Dossier top scrim darkened |
| B1 | 568 | At 899px and below: `.spec{table-layout:fixed}`, `overflow-wrap:anywhere`, `.spec .chip{white-space:normal}` |
| Wording | 707, 824 | Hero sub in the markup and in the site JSON |

**New finding: home overflows at 320px. Not a regression and outside the approved scope.**
- **What:** At 320px wide, the width WCAG 1.4.10 measures at, `#home` overflows by 27px. The "Tested on" strip's 5-column grid pushes the Steam label to x = 346. The cause is `.tested__list{grid-template-columns:repeat(5,1fr)}` at 899px and below.
- **Baseline:** The baseline cfdbd65 is identical. My first pass measured overflow only at 390, so it missed this.
- **Clean at 320:** All 17 dossiers and the library (the Suzerain table fix holds there too). Home is clean at 360.
- **Suggested fix:** `repeat(auto-fit,minmax(56px,1fr))`, or 3 columns below 360px.
- **Severity:** It is an AA reflow failure, so under L4 it counts as a blocker if brought into scope. Line manager to schedule.

**Still open from the first pass (not in this round's scope):** M1 (the hint bar still sits over the Tested-on strip at rest), M2, M3, and m1 to m7. m8 is resolved.
