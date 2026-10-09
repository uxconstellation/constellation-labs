# Constellation Labs: brief and handoff

Read this whole file before writing any code. It is the brief, the rules, what exists, and every piece of feedback Aldo has given so far.

---

## 1. What this is

**Constellation Labs** lives at **constellationlabs.cc**. It is the products wing of Constellation (uxconstellation.com), Aldo Calitz's creative and build studio in George, South Africa.

- **Index page:** in the spirit of Google Labs. It shows the products on the bench.
- **Product pages:** `/acre`, `/pinpoints`, `/prism`, `/nod`. Each describes the product and links out to it. Prism needs a proper landing page because it has no site of its own yet.
- **Audience: investors land here.** The bar is an award-winning site (Awwwards and FWA level). Aldo's words: "I don't want AI slop here."
- Fully motion-driven ("these are 100% moving pages").

## 2. The products (facts only, do not invent features)

| Product | What it is | Status | Link |
|---|---|---|---|
| **Acre** | End-to-end South African property platform: buy, sell and rent through an agent, FICA and RICA checks in the app, agency management. Owners can also manage their own short and long-term rentals. Five roles in one deal room: agent, owner, buyer, renter and conveyancer. Live site says "Built for SA · POPIA · FICA · PPRA · Deeds e-lodgement". | Beta | https://acreprop.lovable.app |
| **Pinpoints** | Visual feedback. Pin comments on websites, PDFs, videos and images. On HTML a client can comment on an element and suggest copy, colour or image changes in place, front-end only. Those become suggestions you approve, and the code never changes. | Beta | placeholder in `LINKS.pinpoints` |
| **Prism** | Headless CMS for sites built on vibe-coding platforms. Gives clients a Wix-like editor for their words, images and sections, while the code stays untouched. | Early access | demo request goes to the studio contact |
| **Nod** | In-person networking. Scan the QR code on your coffee-shop or coworking table, say whether you're open to chat or working quietly, then send a nod. If it's mutual you're connected, with the venue and date saved. | In development | pilot by email |

All product copy lives in `src/content/products.ts`, which is the single source of truth. Its tests forbid em dashes.

## 3. Hard rules

1. **Duplicate, then deviate.**
   - The stack and system come from the main site: repo `uxconstellation/cosmic-launchpad`, built with Vite, React 18, TS, React Router, Tailwind 3, shadcn, Framer Motion, GSAP and Three.js.
   - Reuse its components, layout and motion. Change only what makes it Labs.
   - `src/landing.css` is an exact copy of the main site's file. Labs changes go in `src/labs.css`.
2. **No recycled content or art.** Copy, illustrations and imagery must feel NET new compared with the main site.
3. **No client names and no usage claims.** For example, never say "used by X". Demo content inside illustrations must be obviously invented.
4. **Brand: the Constellation CI, white-first.**
   - Ink `#160C15`, cream `#F3EEE7`, mist `#F7F4EF`, line `#E8E2D8`.
   - Orange `#FE6E36`, for fills only, never body text. Orange for links: `#C2410C`.
   - Teal `#173F3F`, sand `#B7AA93`.
   - Product accents: Acre green `#2F6B4F`, Nod `#C8753A`, Prism spectrum.
   - **Grain** comes from the main site's `fine-grain.webp`, applied through `.card-grain` (multiply, around 0.1). Surfaces are warm paper, never pure white.
5. **Logo.** An experimental glass test tube containing the Constellation star, with a satin ring around it on the diagonal. It exists as an SVG (`src/components/brand`) and as a Three.js scene (`src/components/three/GlassMarkScene.tsx`).
6. **Product patches.** Each product has an illustrative embroidered patch (Aldo's request). See `src/components/patches`.
7. **Never use em dashes** anywhere. Use commas.
8. **Never write "Legend"** in content. Use "Aldo Calitz" or "Aldo".
9. **Acre safety.**
   - Never show the Acre demo logins.
   - Never drive the live Acre site signed in as aldo@uxconstellation.com.
10. **Do not copy the ReactBits token** from cosmic-launchpad's `.npmrc`.
11. **Working style.** Aldo wants the plan laid out in full, then one step at a time until he says "next". Don't ask questions the context already answers. Challenge his logic when it's weak.

## 4. Feedback history (why things changed)

- **First pass.** "There is no design involved", "looks like a basic template". This came from building custom templates instead of duplicating the main site.
- **Main site.** "Look at how the rest of our website looks, the motion, and Google Labs." That led to patches per product, with an illustrative feel.
- **Recycled art.** "Please don't recycle content, this needs to feel NET new." The main-site clouds, flight icons and copy were reused, and some still remain (see section 7).
- **Client claims.** "Why are we adding clients here?" A client gallery implied usage, and it has been removed.
- **Quality.** "Investors land here. Same quality as an award-winning site." That led to the high-fidelity mockups in `design/comp-v1*`.
- **Motion over screenshots.** "Make motion graphics for each section that describe what it's about. Pinpoints: a pin drops, commenting, edits. Acre: a property sold and rented, and the bills that come with it. Rather than just displaying screens." That led to the four motion pieces (section 5).
- **Acre and Nod quality.** "Nod and Acre look low quality compared to the other two." The cartoon style was rebuilt as product-surface UI.
- **Cards and grain.** "The cards are not on brand and lack grain. The animations are good though." The cards became warm paper with hairline borders and CI-only colours, plus the main-site grain.
- **Latest.** After the pieces went into the index chapters: "this looks shit". Assume the integration and overall page design are the problem, not the animation content.
  - Likely culprits:
    - The big headings render in Arial Black caps, because the Noken font is not actually loaded anywhere.
    - The chapter layout is still the main site's journey layout with cramped stage panels.
    - Leftover recycled sections remain.
    - The real-product thumbnails look tacked on.

## 5. The four motion pieces (keep the animations, Aldo approved them)

**Code**
- Each piece is in `src/components/scenes/`: `AcreScene.tsx`, `PinpointsScene.tsx`, `PrismScene.tsx` and `NodScene.tsx`.
- The shared engine is `Scene.tsx`, and the registry is `index.ts`.
- Each piece is a hand-built SVG with an 800×600 viewBox, driven by one looping GSAP timeline that uses `MotionPathPlugin`.

**Scene engine (`Scene.tsx`)**
- `build(tl)` writes the timeline, which must include a `"hold"` label at the finished frame.
- It plays only while at least a third of it is on screen.
- `active` lets a parent play just one piece and restart it on arrival.
- `onBeat(index, label)` reports the current story beat.
- With reduced motion, it shows the "hold" frame and no movement.
- The beat captions render below the art (`showBeats`).

**Storyboards**

| Piece | Beats (seconds) |
|---|---|
| **Pinpoints** | 1.2 a pin drops onto a generic headline "Welcome to our website." with a bounce · 2.4 a client comment types "Can this feel warmer?" · 4.4 the headline is struck out and rewritten as "Book a table tonight.", then a colour swatch turns the button orange and the image swaps · 8.2 a suggestion card shows "3 edits", **Approve** turns green, and "code untouched" appears · 10.6 Website / PDF / Video / Image tabs cycle. Loop is about 15s. |
| **Acre** | 0.3 a listing card for 12 Protea Lane, George (an illustrated modern house against a mountain ridge, R 2 450 000) · 1.8 a deal room with agent, owner, buyer and conveyancer · 3.4 a FICA ✓ badge on every party, documents signed and lodged, and the progress bar runs from Listed to **Sold** · 6.2 rental mode: tag "To let", R 14 500/month, the buyer is replaced by a renter, and a bookings strip fills with short stays and a long lease · 8.4 a "This month" card where levies, rates, and water and lights tick to **Paid**. Loop is about 12s. |
| **Prism** | 0.3 an AI-built bakery site · 1.6 a light beam hits a prism and splits into spectrum rays, which land as dashed edit outlines · 3.8 a cursor rewrites the headline "Fresh bread, baked daily." as "Sourdough, at sunrise." · 5.8 the image swaps and the quote section is dragged above the cards · 8.6 Publish turns to Published, with a lock on "Your code: untouched". Loop is about 12s. |
| **Nod** | Two phones, yours (Alex) and Sam's. 0.4 a camera view scans the table QR · 2.4 checked in at "The Workroom", the "Open to chat" toggle turns on, and "Here now" lists Sam, Lee (working quietly) and Ava · 4.2 a nod is sent to Sam and flies across to his phone · 5.8 Sam taps "Nod back" and it flies back · 7.4 an "It's mutual" sheet appears on both phones with the venue and date saved. Loop is about 11s. |

**Open questions for Aldo**
- Do levies, rates, and water and lights match Acre's real bills list?
- Is he OK showing rand figures in Acre?
- Is a restaurant fine as the Pinpoints demo site?

**Preview**
- Run `npm run dev` and open `/scenes` (not linked).
- Recordings: `design/motion-scenes-v3.mp4` and its still.

## 6. Approved direction for the index (mockups in `design/comp-v1*.png`, source `design/comp-v1.html`)

Art direction: "the lab's specimen catalogue". The sections are:

1. **Hero**
   - "Made in" in Satoshi 300, with "Labs." huge in Satoshi 900 and a coral, peach and mint gradient.
   - The 3D glass mark sits on the right, with the four patches orbiting it on a dashed satin-ring ellipse. Each patch has a status tag.
   - An "On the bench" index list sits bottom right.
2. **Product chapters**
   - Full-bleed, one per product, each with its stage colour: Acre `#d2d9c7`, Pinpoints `#f0c0a1`, Prism `#d8d1df`, Nod `#b3d3c6`.
   - A giant product word, the motion piece as the hero visual, numbered beat captions, then the title, body and CTAs.
   - A small real-product proof for Acre and Pinpoints only.
3. **"Where everything stands."**
   - A five-stage track: Idea, Prototype, In use, Beta, Graduated.
   - Patches are pinned at their real stage: Nod at Prototype, Prism at In use, Acre and Pinpoints at Beta.
   - The Graduated stage shows an empty dashed "Next to graduate" slot.
4. **Two doors**
   - "Back the next one." for investors, on a dark panel with a "Talk to Aldo" mailto.
   - "Have the studio build yours." for teams, linking to uxconstellation.com.

## 7. Current state of the code

| Area | State |
|---|---|
| `src/pages/Index.tsx` | Still built from duplicated main-site sections: `HeroSection`, `ProductJourney` (now with the motion pieces), `DeliveryProcess`, `PracticalQuestions` and `ContactClose`. |
| Still recycled, must go | Cloud art and flight icons (`src/assets/*-v4/v5.webp`, `cloud-layer-v3.webp`), the "Before you ask" FAQ, the NextConversation card, and the process section copy. |
| Not built yet | Hero patch orbit, the "Where everything stands" track, the two doors, and real product pages (`ProductPage.tsx` is a scaffold). |
| Typography bug | Noken is only referenced via `local()`, so visitors see Arial Black caps. Either self-host Noken (if licensed) or use Satoshi 900 for display everywhere. |
| 3D | `GlassMarkScene` is lazy-loaded, with an SVG fallback and a reduced-motion still. A retina canvas-size bug is fixed. |
| Tests | `npm test` (vitest). The tests check the product content and that there are no em dashes. |
| Git | Local repo with full history. It hasn't been pushed; the target is `uxconstellation/constellation-labs`. |

## 8. How to run

```bash
npm install
npm run dev        # http://localhost:5173 , motion pieces at /scenes
npm test
npm run build && npx vite preview --host 127.0.0.1
```

## 9. Suggested first prompt for Claude Code

> Read HANDOFF.md fully. Then study the live main site (uxconstellation.com) and the mockups in design/comp-v1*.png.
> Rebuild the Labs index to award level, keeping the four motion pieces in src/components/scenes exactly as animated.
> Start with a full plan, then do one step at a time and wait for my "next".
> Fix the display typography first, and remove every recycled main-site asset and copy.
> Before showing me anything, screenshot each section at 1440 and 390 wide and critique it against the brief.
