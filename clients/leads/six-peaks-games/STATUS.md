# STATUS: Six Peaks Games redesign

**Updated:** 2026-10-10 · **Owner:** claude (cloud session) · **Branch:** `claude/six-peaks-redesign-v56889` (constellation-labs)
**Home:** `clients/leads/six-peaks-games/` (lead preview; placement by the line manager per Aldo's 2026-10-10 instruction to proceed without the intake round. Re-file on his word.)

## Stage ledger (OPERATING-MANUAL pipeline)
| # | Stage | Owner | Artifact | State |
|---|---|---|---|---|
| 0 | Frame | line manager | `BRIEF.md` | done |
| 1 | Research + capture | reference-scout | `research/site-content.md` (line manager, live capture), `research/games.json`, `assets/manifest.json` | in progress |
| 1.5 | Mood board | design-lead | the two direction prototypes stand in as the direction boards for Aldo's sign-off | pending |
| 3 | Visual plan | line manager | `DIRECTION-A.md`, `DIRECTION-B.md`, `DUPLICATION.md`, `BUILD-RULES.md` | done |
| 5 | Build | duplicate-builder ×2 | `direction-a-ascent/page.html`, `direction-b-press-start/page.html` | queued (waits on stage 1 assets) |
| 6-7 | Design + copy review | impeccable + humanizer roles | review notes | pending |
| 8 | QA | qa-verifier | `qa/QA-REPORT.md` | pending |
| 9 | Close | line manager | review links + PR | pending |

## Facts established
- Live site captured through the connected Firecrawl browser (ChatCut). This container's egress blocks sixpeaks.games; screenshots come back via storage.googleapis.com.
- 17 titles (4 underway), 15 partner studios, 9 platforms, 8 services, 9 testimonials, 4 managers. ISO 27001 is stated as adherence.
- QA harness `qa/shoot.mjs` passed its negative control (caught overflow, console errors, a failed request, and axe contrast + alt violations on a deliberately broken page).

## Open decisions for Aldo
- Pick a direction (or a merge) after review.
- Confirm whether Six Peaks has engaged us; if so move this from `leads/` to `clients/six-peaks-games/`.
