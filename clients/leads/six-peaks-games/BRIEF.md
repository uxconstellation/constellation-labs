# BRIEF: Six Peaks Games website redesign (two directions)

**Home:** `clients/leads/six-peaks-games/` in `uxconstellation/constellation-labs` (unsigned prospect, speculative preview; taxonomy tier `clients/leads/<prospect>/`). Placement chosen by the line manager on Aldo's instruction of 2026-10-10 ("you have access to everything stop making excuses", i.e. proceed without the intake round). Move it if Aldo files it elsewhere.
**Branch:** `claude/six-peaks-redesign-v56889`
**Requested by:** Aldo, 2026-10-10, verbatim: "Can you look to redesign this website for me? I want to make it extremely cool, look at the ganes they have on it. Make it epic, and look at 2 directions for me please"

## Client
Six Peaks Games (https://sixpeaks.games): game QA studio in George, Western Cape, South Africa. Embedded QA teams for publishers and developers. Founder & CEO Jason Ried; founder & non-exec director Jason Avent. 17 titles on the site, 15 partner studios, 9 platforms. Full verbatim capture: `research/site-content.md`.

## Audience and job of the site
Producers, QA managers and heads of studio at publishers and developers (mostly UK and Western Europe) choosing an external or embedded QA partner. The site must make them (1) trust the team fast (titles, partners, named testimonials, retention, in-office, ISO 27001 adherence), (2) understand the embedded model, and (3) book a trial. Secondary: hiring testers in George.

## The literal asks (QA judges these first, decision 0045)
1. Redesign the website.
2. Extremely cool, epic.
3. Built around the games on the site.
4. Two directions. Per decision 0046 that means two IAs and two page trees, not two skins of one skeleton.

## Directions
- **A. The Ascent** (`direction-a-ascent/`, spec `DIRECTION-A.md`): journey IA. The brand name and George's Outeniqua range become an expedition; the page climbs through the development lifecycle; games are summits reached.
- **B. Press Start** (`direction-b-press-start/`, spec `DIRECTION-B.md`): catalogue IA. A console home screen where the games lead; each title opens a QA dossier; a tester's-view overlay is the signature.

## Guardrails (house law plus this client)
- Real content only: copy, quotes, names and numbers from the live site. Never invent titles, metrics, quotes or bugs.
- The games are partner IP. Credit the partner on every title. The four "project underway" titles never appear as hero art and carry no claims beyond "in progress".
- ISO 27001 is stated as adherence (the site says "Adherence to this benchmark"), never as certification.
- Keep the SEO terms in the page title: "Game QA Studio", "Embedded Game Testing".
- Delivery format: one prototype page per direction, authored to the Artifact page contract (private claude.ai link for review), plus a standalone `index.html` for the repo.
