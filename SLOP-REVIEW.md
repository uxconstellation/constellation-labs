## 2026-10-09 FAIL
artefact: C:\Dev\products\constellation-labs (commit 0d3b7cb, served at http://localhost:5191)  sha256: src/pages/ProductPage.tsx a7eb725393b0a8e7210f2dda8dee09feb303e0a12fff854690536a42ef97ba13
medium: web (product pages)  client-facing: yes  stage: final: BRIEF.md
builder: claude  reviewer: claude-opus-5-5 (same-model, fresh context)
render: shots.mjs on /acre /pinpoints /prism /nod at 1440 and 390 (scratchpad r7/, heroes1440.png, heroes390.png); h1 line-box probe at 360/375/390/414 over 8 s (p/h1.mjs)
craft-ref: C:\Dev\_refs\design-library\reference-sites\uxconstellation-current
ring 2: not re-run
relative: round 6 FAIL (Nod switch AA) -> fixed: yes. The switch, Nod sent and the fly bubble are now #9A5526 (paper on it about 5.1:1 by my calculation; builder reports 5.36). The distinctness flag is mostly fixed: Watch it work is gone and the loop sits in each hero on a paper card with the patch sewn on; ORDER differs per venture (ProductPage.tsx:31-37). The heroes now read as four different products at 1440 (heroes1440.png).
similar prompt: unchanged (partly)
scores: originality 7/10, design quality 7/10, reference fidelity 8/10, craft 6/10
hard blockers:
- H4 | /nod hero title breaks mid-word on mobile: "Nod" renders as "N" / "od" across two lines at 360, 375, 390 and 414 (r7/nod-390-00.png; probe: 4 line boxes, font-size about 204px at 390). The per-letter inline-block spans (.pp-ch) allow a break between letters, and the fit formula min(220px, (100vw - 2*gutter)/1.74) is too large for Nod's wide glyphs. Acre, Prism and Pinpoints stay on one line. | Add white-space: nowrap to .pp-title and fit the size per word (measure scrollWidth and scale), or give Nod its own divisor (about 2.0)
taste flags:
- Pinpoints hero at 390: the title is set much smaller (68px) than the other three (123-153px), so the series loses rhythm on mobile | Accept two lines ("Pin-" is not allowed; use "Pin / points" as two spans) or scale the others to match
- Sam's avatar initial is still paper on #C8753A (NodRoom.tsx:10), about 3.1:1; decorative next to the name | Use #9A5526 for consistency
- prior flags stand: liquid on most sections, WEB-08 gradient text twice, small eyebrows on liquid, Plato Coffee in Nod lab notes, Acre dashboard figures in the proof shot

## 2026-10-09 FAIL
artefact: C:\Dev\products\constellation-labs (commit d2a2879, served at http://localhost:5191)  sha256: src/pages/ProductPage.tsx 5f8fdeb4ffbe6f708a69680d735b2c6612712bc20cf26f1dee3254885c9301ee
medium: web (product pages /acre /pinpoints /prism /nod)  client-facing: yes  stage: final: BRIEF.md
builder: claude  reviewer: claude-opus-5-5 (same-model, fresh context)
render: shots.mjs on the four product pages at 1440 and 390 (scratchpad r6/, sheets r6/sheet-*.png); keyboard-only runs of the Pinpoints, Prism and Nod experiments (p/kb2.mjs, p/kb3.mjs); pixel AA over liquid (p/liqaa.mjs); horizontal overflow probe (p/ovf.mjs); 2x crops r6/c-*.png
craft-ref: C:\Dev\_refs\design-library\reference-sites\uxconstellation-current
ring 2: not re-run
relative: round 1 flag "product pages are one template" -> fixed: partly. Each page now has one real hands-on experiment, and they differ in mechanic (scroll-run deal, pin and edit, code-vs-page switch, phone room). The hero gestures differ too. The rest of the page is still the same skeleton in the same order: hero, Watch it work, The problem, Try it, What it does, proof, Lab notes, stage track, two doors, Next. Watch it work and Try it now tell the same story twice in a row.
keyboard: Pinpoints works end to end by keyboard (drop target is role=button/Enter; headline focuses and is editable; swatches, Send and Approve are reachable), with visible focus rings. Prism: switch by Space, headline and intro editable, Swap image reachable; Publish sits before the headline in DOM and visual order, so after editing it is a Shift+Tab back, which works. Nod: switch and Nod buttons reachable, and Enter reaches the mutual sheet. Acre is scroll-driven, so keyboard scrolling runs it. No keyboard blocker.
overflow: 0 px horizontal overflow and 0 text boxes outside the viewport on all four pages at 390 and 1440.
claims: hypotheses are framed as beliefs; demo people, bistro, bakery and commit hash are invented and labelled made-up. No invented metrics.
similar prompt: "interactive product demo section per product, grainy gradient background" -> lands here: partly
scores: originality 7/10, design quality 7/10, reference fidelity 8/10, craft 7/10
hard blockers:
- H4 | /nod experiment: the main switch label fails AA. "Open to chat" (15px bold) and "Tap to change" (12px at 90% opacity) are paper on #C8753A, about 3.1:1 (needs 4.5:1; 15px bold is not large text). The same pair is used for the "Nod sent" pill (12.5px) and the flying nod. NodRoom.tsx:57-58 and :82. This is the control the whole experiment hinges on. | Darken the fill to about #9A5526 (paper on it ≥ 4.6:1), or keep #C8753A and set the label in ink
taste flags:
- relative / consistency | The skeleton around the experiment is still identical on all four pages, and Watch it work + Try it duplicate the story | Cut Watch it work where Try it covers it (Pinpoints, Prism and Nod clearly do), or fold the loop into the hero; vary the section order per product
- AA small print and state labels (not key copy): Acre progress inactive steps "Offer/FICA/Transfer/Sold" at ink/40, about 2.4:1 (AcreDeal.tsx:60); party initials white on #FE6E36, about 2.8:1 (AcreDeal.tsx:70); "Try it · Experiment no. 0X" and "Lab no. 0X" eyebrows 3.6-4.4:1 on liquid; "Use it/Back it" 4.0-4.45:1 | Use ink/60 for inactive steps, ink text on the orange avatar, and darker eyebrows on liquid
- Pinpoints playground at rest: the dark "Your feedback" panel is a large near-empty slab until a pin drops (r6/sheet-pinpoints.png, row 2) | Show a ghost of the first suggestion card, or shrink the panel until it has content
- prior flags stand: liquid on most sections, WEB-08 gradient text twice, WEB-05/06 eyebrows and numbering, mobile scene legibility, Plato Coffee named in Nod lab notes, Acre dashboard figures in the proof shot
- note: scripts/probe-signatures.mjs proves the flows run but does not measure contrast; add the Nod switch pair to probe-liquid.mjs

## 2026-10-09 PASS
artefact: C:\Dev\products\constellation-labs (commit 2003fcd, served at http://localhost:5191)  sha256: src/pages/Invest.tsx 6329b3c4f667e1ef387ce294da3b9cc5c48579119fb992c4ea09125b890e34c4
medium: web (8 routes)  client-facing: yes  stage: final: BRIEF.md
builder: claude  reviewer: claude-opus-5-5 (same-model, fresh context)
render: /invest hero at 390 (r5-inv390.png) and the home ink why-card at 390 (r5-cardhome.png); elementFromPoint on both /invest CTAs at 375/390/768/1440; pixel AA probe p/liqaa.mjs on / and /invest at 1440 and 390
craft-ref: C:\Dev\_refs\design-library\reference-sites\uxconstellation-current
ring 2: not re-run (no copy change)
relative: round 4 FAIL (2 x H4) -> fixed: yes. Both CTAs are the topmost element at all 4 widths, and the disc sits below the buttons on mobile. No text at or above 14px fails AA over liquid on / or /invest (/invest: 1 fail in 30 at 1440 and 1 in 11 at 390, both the 12px "Start here" eyebrow). Why-card 01 body copy no longer fails.
similar prompt: unchanged (partly)
scores: originality 6/10, design quality 7/10, reference fidelity 8/10, craft 7/10
hard blockers:
none
taste flags:
- AA small print on liquid (not key copy): "Start here" eyebrow on Talk to Aldo 3.84:1 (1440) and 3.16:1 (390); home shelf small labels as in round 4 (eyebrow, Stage/Next, card footer) | Darken to ink/80 or white/80
- round 4 flags otherwise stand, partly eased (grain 0.085 to 0.05; liquid removed from the conversation band and the patch maker): liquid still carries most sections, WEB-08 gradient text twice, pastel product fields
- round 1 flags stand: product-page template, WEB-14, WEB-05/06, WEB-20, mobile scene legibility, Plato Coffee and Acre dashboard figures
- gate note: PASS with 3 or more taste flags, so show Aldo the render before calling it done

## 2026-10-09 FAIL
artefact: C:\Dev\products\constellation-labs (commit 4e9b4a6, served at http://localhost:5191)  sha256: src/components/brand/Liquid.tsx 0fddc292964a2de24f42dfe85f7fc3434e0ab08369f0c0dd9f7b909a5f72c7d3
medium: web (8 routes)  client-facing: yes  stage: final: BRIEF.md
builder: claude  reviewer: claude-opus-5-5 (same-model, fresh context)
render: shots.mjs on / /acre /pinpoints /invest /build at 1440 and 390 (scratchpad r4/), a pixel AA probe for text over Liquid canvases (p/liqaa.mjs: text hidden, box screenshotted, p10 contrast against the real pixels), a WebGL context census (p/gl.mjs, p/spa.mjs), and an elementFromPoint check on the CTAs
craft-ref: C:\Dev\_refs\design-library\reference-sites\uxconstellation-current (desktop-hero.png astronaut disc)
ring 2: not re-run (copy unchanged apart from the shelf subhead)
relative: Aldo: "more award winning and on brand, random shapes not on brand, more gradient and noise" -> fixed: mostly. The blobs are gone. The hero disc behind the glass mark now reads as the main site's astronaut disc in its own palette, the ink panels carry the night liquid, and the grain is everywhere. Brand fidelity is clearly up.
perf: index 10 WebGL contexts (9 Liquid + Three glass), /invest 7, /acre and /prism 6, /build 4; under Chrome's 16 cap. Off-screen fields pause (IntersectionObserver), and contexts are released on unmount (loseContext). 10 SPA navigations: 68 created, 0 lost while mounted, no "too many contexts" warnings. Not a blocker. Watch the index if more fields are added.
similar prompt: "Google Labs style showcase, grainy gradient mesh, rounded cards" -> lands here: partly (the grainy gradient is now a 2024-25 default, rescued only because it is the studio's own liquid)
scores: originality 6/10, design quality 7/10, reference fidelity 8/10, craft 6/10
hard blockers:
- H4 | /invest hero at 390 and 768: the night-disc wrapper div paints over both hero CTAs. r4/invest-390-00.png and r4/inv-cta.png show "Talk [to Aldo]" and "[See the portfo]lio" swallowed by the disc. elementFromPoint at 75% of each button returns the wrapper DIV, so taps are intercepted too (375: the portfolio CTA is covered). | Make the Liquid wrapper pointer-events-none and put the CTA row on z-10 above it, or push the disc below the CTAs on narrow widths
- H4 | Key body copy below AA on the night liquid: /invest why-card 01 "Every product starts from friction..." is white 15.5px at 4.07:1 (1440) and 3.74:1 (390), and home why-card 01 "A studio meets the same friction..." is 3.81:1 at 390. The copy crosses the bright orange band (r4/invest-1440-01.png). | Keep the disc out of the text column (mask it to the top-right), or put an ink scrim under the body copy
taste flags:
- liquid everywhere | Hero disc, shelf field, product heroes, scene stages, why cards, doors, the conversation band, Talk to Aldo and the footer wordmark all run the same liquid, so no section owns it. The main site uses it once, as the hero disc. | Keep the hero disc, the ink doors and the footer wordmark; return the shelf, product heroes and peach cards to grained paper with one accent
- grain density | The page-wide film grain makes the cream paper read mottled and dusty at 1440 (r4/home-1440-00.png, top band). The main site's grain lives on cards, not the page. | Halve the overlay opacity or limit it to liquid and cards
- WEB-08 | Gradient text now appears in the hero "Labs." and the liquid-filled footer wordmark on every route | Keep one
- AA small print on liquid (not key copy): shelf eyebrow "The ventures" 3.11:1, card Stage/Next 4.06:1, "Constellation Labs ✦" 3.47:1, product-door eyebrows "Back it" 2.84:1, /build "For teams" 3.41:1, "Opens an email..." 3.73:1, invest "Step 0x" 3.65-4.12:1 | Darken to ink/80 on liquid grounds
- reference drift | The Acre hero and stage use a green/peach liquid that is not in the stated #8B2252/#C43E1A/#1A3A3A ramp (r4/acre-1440-00.png). That is fine as a product accent, but the shelf and Pinpoints pink fields read closer to a generic pastel mesh than to the studio liquid | Tie each product field to its patch colours, darker and less pastel
- round 1 flags still stand: product-page template, WEB-14 three-card rows, WEB-05/06, WEB-20, mobile scene legibility, Plato Coffee and Acre dashboard figures
- peach/pink cards and product hero body copy: measured, they pass (invest cards 02 and 03, Acre/Pinpoints hero hooks and CTAs not flagged)

## 2026-10-09 PASS
artefact: C:\Dev\products\constellation-labs (commit 9c3b882, served at http://localhost:5191)  sha256: src/components/home/Hero.tsx 2ee0fe697e6ef9df03824d35258d7398dd56a1ec9085be49c94a12f7ec626a7a
medium: web (8 routes)  client-facing: yes  stage: final: BRIEF.md
builder: claude  reviewer: claude-opus-5-5 (same-model, fresh context)
render: home hero orbit sampled every 4 s over a full orbit at 1440x900 and 1280x900, 16 frames each (scratchpad r3/sheet1440.png, sheet1280.png, native o*.png)
craft-ref: C:\Dev\_refs\design-library\reference-sites\uxconstellation-current
ring 2: unchanged (5 findings, all non-blocking)
relative: round 2 FAIL (H4, the ring crossed the flipped labels) -> fixed: yes. The labels sit on solid paper chips in front of the ring in all 32 frames. 67 visible label samples, 0 off-screen. Labels hide while their patch is behind the glass.
similar prompt: unchanged (partly)
scores: originality 6/10, design quality 7/10, reference fidelity 7/10, craft 7/10
hard blockers:
none
taste flags:
- craft | At 1280 two chips can sit edge to edge mid-orbit ("Nod, in development" touching "Prism, early access", r3/o1280-04.png). Both stay legible, so this is not a blocker. | Hide the trailing label when two chip boxes come within 8px
- round 1 flags still stand (see below): product-page template stamped four times, WEB-14 three-card rows, WEB-05/06 numbering and eyebrows, WEB-20 accent word, mobile scene legibility, card micro-label AA (3.56-4.19:1), Plato Coffee and Acre dashboard figures, footer pile on every route
- gate note: PASS with 3 or more taste flags, so show Aldo the render before calling it done

## 2026-10-09 FAIL
artefact: C:\Dev\products\constellation-labs (commit a9de9af, served at http://localhost:5191)  sha256: src/components/home/Hero.tsx a1a30e60d77eab8c38b376407f16736f8d5d55c29f72daae7e8ae3494d8ef77f
medium: web (8 routes)  client-facing: yes  stage: final: BRIEF.md
builder: claude  reviewer: claude-opus-5-5 (same-model, fresh context)
render: re-verify pass on /pinpoints, /prism and the home hero at 1440 (scratchpad p/: pinpoints-proof, prism-now, hero-t20, flips.png), a 68-sample viewport probe at 1440 and 1280, and /build and /404 at 390 (scratchpad shots2/)
craft-ref: C:\Dev\_refs\design-library\reference-sites\uxconstellation-current
ring 2: unchanged from the round below (5 findings, all non-blocking)
relative: round 1 FAIL (3 blockers) -> fixed: partly. Pinpoints claim fixed: the page reads "Built, and in beta.", the CTA is a mailto invite, and the services-page placeholder link is gone from rendered anchors. Prism usage claim fixed: "Early access, running on our own studio work." Orbit labels no longer leave the viewport (0 of 68 samples), but flipping them left now runs them through the glass mark's ring.
similar prompt: unchanged (partly)
scores: originality 6/10, design quality 7/10, reference fidelity 7/10, craft 6/10
hard blockers:
- H4 | Home hero at 1440: when a status label flips left (data-flip=1 at x > 70% of the stage, Hero.tsx:61/151), it sits on the 3D ring and the ring stroke crosses the text. Seen in p/hero-t20.png ("Nod, in development" struck through at about x 1115-1245, y 523, last letter touching the Nod patch stitching) and in p/flips.png frames 3 and 6 (Nod, Prism). Flipped in 18 of 52 label samples. The builder's probe checks only the viewport, so it passes. | Give the label a solid paper chip (bg-cream, px-2, rounded-full) so the ring passes behind it, or flip the label above or below the patch instead of towards the mark, then add a label-vs-mark overlap check to probe-labels.mjs
taste flags:
- unchanged from round 1 below (product-page template, WEB-14, WEB-05/06, WEB-20, mobile scene legibility, card micro-label AA, Plato Coffee and Acre dashboard figures, footer pile on every route)
- /build and /404 at 390: no new issues. The /build hero "Your patch goes here" ring repeats twice down the page (shots2/build-390-00, -01).

## 2026-10-09 FAIL
artefact: C:\Dev\products\constellation-labs (commit 905c1df, served at http://localhost:5191)  sha256: src/pages/Index.tsx 5f097ef7302b89695e97fc2ad3b21f966ae57a87b45c1626c95904dafe34cf37; dist/index.html ebe8e81d191e202578eb0cbc1e3412accac93c86cbc3d524a8b1538c4134725f (dist may predate HEAD; review is of the dev server)
medium: web (8 routes)  client-facing: yes (investors and clients)  stage: final: BRIEF.md deliverable constellationlabs.cc
builder: claude  reviewer: claude-opus-5-5 (same-model, fresh context)
render: scripts/shots.mjs on / /acre /pinpoints /prism /nod /invest /build /nope at 1440x900 and 390x844, scrolled with motion settled (scratchpad shots/ 1440 all routes; 390 for home, acre, pinpoints, prism, nod, invest; build and 404 mobile not captured), card hover frame, plus a 14 s hero probe (p/hero-late.png) and a computed-colour AA sweep of the home page
craft-ref: C:\Dev\_refs\design-library\reference-sites\uxconstellation-current (+ content-ref google-labs, comps design/comp-v1-*.png)
ring 2: slop-scan src --medium web: 31 files / 520 text lines / 3568 style lines, 5 findings: regex:emoji 3 (the ↗ glyph in Nav.tsx:28, :96, Footer.tsx:36, false positive), regex:middot-meta 2 (inside scene illustrations AcreScene.tsx:91, PinpointsScene.tsx:181, illustrative UI). side-border 0, em-dash 0, banned phrases 0.
relative: Aldo 2026-10-09 rejected one-sheet-per-product chapters ("not scalable, no info on what Labs is and why we build"; earlier "design, layout and consistency aren't on par") -> fixed: yes, mostly. The trading-card shelf is data-driven, and the What Labs is, Why we build and stage track sections exist. Product pages still reuse one template with only the colour changed (see flags).
similar prompt: "Google Labs style product showcase for a design studio, cream, rounded cards, big bold sans" -> lands here: partly (the hero and patches do not; the product-page template and three-card sections do)
scores: originality 6/10, design quality 7/10, reference fidelity 7/10, craft 6/10
hard blockers:
- H3 | /pinpoints "Not a mock-up / It is live. Go and use it." (src/pages/ProductPage.tsx:140-141) and its "Open Pinpoints" CTAs go to LINKS.pinpoints = https://uxconstellation.com/services/custom-project (src/content/products.ts:43, commented "Replace with the live Pinpoints app URL"). The claim is unsupported and the CTA does not open the product. The same placeholder URL is also an H1. | Put in the real Pinpoints URL, or drop the "live, go and use it" block and CTA on /pinpoints until it exists
- H5 + H3 | /prism "Where it's at: Early access, in use on client work." (products.ts:121, sheet-prism frame 6). This is a usage claim, which the BRIEF Never line bans, and it contradicts the stage track's "In use: Running on our own studio work." (home-1440-05) | Change it to "Early access, running on our own studio work."
- H4 | The home hero orbit status labels clip at the 1440 viewport edge as the orbit turns: "Noc[,in development]" in home-1440-00.png at the top right, and "Prism, early[ access]" in p/hero-late.png at x≈1440. This is the first screen investors see. | Inset the orbit ellipse or flip the label side when the patch sits right of centre, and check at 1280 and 1440
taste flags:
- relative / consistency | The four product pages (/acre /pinpoints /prism /nod) are one template with the colour changed: hero sheet, Watch it work, dark Problem slab, What it does numbered list, three equal Who it's for tiles, stage track, two door cards, Next experiment. Aldo's last rejection named "consistency/layout not on par"; this is consistent but stamped. | Give each page one bespoke section of its own (Acre's deal-room timeline, Nod's two-phone moment full bleed), not a shared skeleton
- WEB-14 | Three equal rounded beige cards in a row: Why we build (home-1440-04), Invest "The problems are real" trio, and every product page's "Who it's for" trio | Break the row: one large plus two small, or set it as running type with the patches
- WEB-05 / WEB-06 | 01/02/03 numbering on non-sequences (Why we build cards, Who it's for tiles, "Lab 01", "01/04" on cards, hero bench list) and a tracked caps eyebrow on nearly every section (THE VENTURES, WHAT LABS IS, FOR INVESTORS, THE PROBLEM, NOT A MOCK-UP, NEXT EXPERIMENT) | Keep numbers on the stage track and Lab No. only, and cut most eyebrows
- WEB-20 | The accent word is the only typographic idea, repeated: "problem" orange (home, invest), "one." (invest), "yours." (build), "designed/built" (build), "Labs" (footer wordmark) | Pick one place for it
- craft / mobile | At 390 the motion pieces render at about 330 px wide, so scene UI text is about 5 px and unreadable (strip-acre-0, Watch it work). Card copy says "Hover one to watch it work" on touch. | Crop the scene to the active beat on mobile and change the copy to tap
- WEB-24 | Trading-card micro labels fail AA: "Stage"/"Next" 4.19:1 at 11.5px, and "Constellation Labs ✦" and "0x/04" 3.56:1 at 10.5px (home AA sweep, 16 nodes). These are not key copy, so this is not a blocker. | Darken them to ink/70
- claim risk | /nod "Pilot planned at Plato Coffee, George." names a third-party business (products.ts:145, carried from the co-work baseline). /acre's proof shot shows dashboard figures (24 listings, 92% compliance) and an em dash inside the live site's copy under "Not a mock-up". | Aldo to confirm the venue may be named and that the Acre shot's figures are acceptable
- content-ref drift | The Google Labs physics pile footer repeats in full on all 8 routes, including the 404. That is three patch piles on one page counting the hero orbit, the investor door pile and the footer. | Keep the pile on the index only; use the wordmark footer elsewhere
