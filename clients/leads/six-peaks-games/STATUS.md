# STATUS: Six Peaks Games redesign

**Updated:** 2026-10-10 · **Owner:** claude (cloud session) · **Branch:** `claude/six-peaks-redesign-v56889` (constellation-labs)
**Home:** `clients/leads/six-peaks-games/` (lead preview; placement by the line manager per Aldo's 2026-10-10 instruction to proceed without the intake round. Re-file on his word.)

## Stage ledger (OPERATING-MANUAL pipeline)
| # | Stage | Owner | Artifact | State |
|---|---|---|---|---|
| 0 | Frame | line manager | `BRIEF.md` | done |
| 1 | Research + capture | reference-scout | `research/site-content.md` (line manager, live capture), `research/games.json`, `assets/manifest.json` (150 files), contact sheets | done; line manager checked the asset sheet |
| 1.5 | Mood board | design-lead | the two direction prototypes stand in as the direction boards for Aldo's sign-off | pending |
| 3 | Visual plan | line manager | `DIRECTION-A.md`, `DIRECTION-B.md`, `DUPLICATION.md`, `BUILD-RULES.md` | done |
| 5 | Build | duplicate-builder ×2 | `direction-a-ascent/page.html`, `direction-b-press-start/page.html` + READMEs + proof frames | done; builder QA clean (0 errors, 0 failed requests, 0 overflow, 0 axe) |
| 6-7 | Design + copy review | impeccable + humanizer roles | review notes | pending |
| 8 | QA | qa-verifier ×2 | `qa/QA-REPORT-A.md`, `qa/QA-REPORT-B.md` | in progress |
| 9 | Close | line manager | review links + PR | pending |

## Facts established
- Live site captured through the connected Firecrawl browser (ChatCut). This container's egress blocks sixpeaks.games; screenshots come back via storage.googleapis.com.
- 17 titles (4 underway), 15 partner studios, 9 platforms, 8 services, 9 testimonials, 4 managers. ISO 27001 is stated as adherence.
- QA harness `qa/shoot.mjs` passed its negative control (caught overflow, console errors, a failed request, and axe contrast + alt violations on a deliberately broken page).

## Open decisions for Aldo
- Pick a direction (or a merge) after review.
- Confirm whether Six Peaks has engaged us; if so move this from `leads/` to `clients/six-peaks-games/`.

## Review links (private claude.ai artifacts, pre-QA preview, republished in place after fixes)
- Direction A, The Ascent: https://claude.ai/artifact/LTydSxnFdHQnKaFnRhYYm2
- Direction B, Press Start: https://claude.ai/artifact/WroJFLPLrd1KAXx77yAda4
Publish copies carry distinct titles ("Six Peaks Ascent", "Six Peaks Press Start"); the repo pages keep the SEO title. Files map: `node tools/publish-map.mjs <dir>`.

## Found on the live site (worth telling Six Peaks)
- Two homepage "View Game" links 404: God Breakers (/godbreakers-2/) and Boltgun 2 (/warhammer-40000-boltgun-2/).
- God Breakers and Cattle Country pages link to a staging host (dev1.stubblestudios.com).
- Media library holds unannounced material (a Clash of Clans poster, a "Devil Jam" set). Not used anywhere.

## Round 2 (2026-10-10): Aldo's verdict on v1
Verbatim: "This isn't giving award winning gaming"
Diagnosis (line manager): v1 used no real-time WebGL (current Awwwards games-category winners run Three.js/WebGL + GSAP, e.g. Ink Games SOTD 14 Oct 2025); the games sat in grids instead of being experienced; too much UI chrome; nothing playable. Root cause: stage 1.5 (mood board from real award-winning references) was skipped to move fast.
Plan:
1. reference-scout: capture 6-8 verified award-winning gaming sites, `research/references/*`, board at `research/reference-board/` (in progress).
2. motion-lead: WebGL tech spike with real assets (key-art shader transitions, particle Six Peaks mark, bug-hunt interaction) at `prototypes/webgl-spike/` (in progress).
3. Aldo picks from the board (Playable vs Cinematic, or both).
4. Rebuild on the chosen references; qa-verifier; republish to the same two links.

## Round 2 decision (2026-10-10)
- **Direction B, Press Start: APPROVED and FROZEN.** Aldo, verbatim: "press start is good, don't touch that". Frozen at commit `cfdbd65` (`direction-b-press-start/page.html`) and published at https://claude.ai/artifact/WroJFLPLrd1KAXx77yAda4. No agent edits it. Any QA findings on B are reported to Aldo, never applied without his word.
- **Direction A is replaced.** The Ascent (v1) is superseded; kept in git history and at its link until the new A ships. The new A must reach "award winning gaming" and stay structurally different from B (playable, not catalogue). qa-verifier on v1 A stopped (moot).
- Running: reference-scout (board re-scoped to one new Direction A, playable-led), motion-lead (spike re-scoped: bug hunt first, particle mark second, no key-art carousel).
- **Press Start QA (qa-verifier):** FAIL on 3 AA blockers (mobile reflow on 7 dossiers, focus hidden behind the fixed bars, HUD text contrast over art) + 3 majors + 8 minors. `qa/QA-REPORT-B.md`. Line manager reproduced B1 (Suzerain dossier overflows at 390px).
- **Aldo's decision:** "Fix blockers only". Scope: B1-B3 plus the hero time-zone wording (back to the site's "natural time zone overlap"). No other change to Press Start. Majors M1-M3 and minors stay open, recorded in the QA report. Fix routed to the Press Start builder; qa-verifier re-checks before republish.

## Round 2 build (2026-10-10)
- **Press Start fixes done** by its builder (B1 reflow, B2 focus clearance, B3 contrast incl. the top bar over the hero as named in the QA report's B3, hero wording). Builder gate: 38/38 runs clean (home, library, 17 dossiers × 2 devices), 0 axe violations (928 rules, 16,944 nodes), 0 overflow, 0 hidden tab stops at 390/720/1024/1280/1440, 0 of 418 text boxes under 4.5:1. Independent qa-verifier re-check requested before republish.
- **WebGL spike done** (`prototypes/webgl-spike/`): bug hunt, particle mark, key-art reveal; 0 errors; SwiftShader 36-44 fps. Not published (client branding; line manager's call).
- **Aldo's rulings on the board:** build Bug Hunt; demo bugs allowed when labelled DEMO and only in our own level; level style **pixel art** (Aldo chose it over the recommended lines-over-photos).
- **Direction A2 visual plan:** `DIRECTION-A2.md`. Folder: `direction-a-bug-hunt/`. Publishes to the existing Direction A link once QA passes.
