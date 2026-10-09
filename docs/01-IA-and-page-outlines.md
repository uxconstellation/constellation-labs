# Constellation Labs: IA and page outlines

Step 2 of the Labs build. Domain: constellationlabs.cc. Same stack as the live Constellation site (Vite, React 18, TypeScript, React Router, Tailwind 3, shadcn, Framer Motion, GSAP, Three.js).

## Decisions made (change any of these and the rest follows)

| Decision | Call | Why |
|---|---|---|
| Product names | Acre, Pinpoints, Prism, Nod | "Pinpoints" matches the live Constellation site and task lists |
| Status labels | Acre: Beta. Pinpoints: Beta. Prism: Early access. Nod: In development | Google Labs pattern; stops early products overpromising |
| Primary action | Acre and Pinpoints: "Open [product]". Prism: "Book a demo". Nod: "Join the pilot" | Only send people to products they can actually use |
| Acre destination | acre.constellationlabs.cc, falling back to acreprop.lovable.app until DNS is pointed | Its own subdomain, own branding |
| Outbound URLs | Live in one config file (`src/content/products.ts`) | One place to swap a URL, no hunting through pages |
| Nav | Logo, four product links, "Studio" link out to uxconstellation.com | Labs is one page plus four; anything more is noise |
| Demo credentials | Never shown on the site | Acre demo logins stay private |

## Sitemap

```
constellationlabs.cc
├── /            Labs index
├── /acre        Acre
├── /pinpoints   Pinpoints
├── /prism       Prism
├── /nod         Nod
└── *            404, styled as an "experiment not found" page
```

Outbound:
- Acre → acre.constellationlabs.cc
- Pinpoints → live Pinpoints app (set in config)
- Prism → Constellation contact, preset to a Prism demo brief
- Nod → pilot waitlist
- Studio → uxconstellation.com

## Labs index `/`

1. **Hero.** The glass mark, rendered live (star suspended in glass, satin ring turning on its diagonal, slow and reactive to the cursor). Headline: "Products we built because we needed them." Sub: "Constellation Labs is where our studio builds its own tools, tests them on real work, then opens them up."
2. **Manifesto.** Three lines revealed on scroll, one at a time:
   - Every product here started as a problem inside our own studio.
   - We build it, use it on live work, and only then show it to anyone.
   - Some stay internal. Some become companies.
3. **The products.** Four cards, the centrepiece. Each card: product mark, name, status chip, one-line hook, accent colour of that product. Hover lifts the card in depth (reuses the DepthCard language). Click opens the product page with a shared-element transition.
4. **How Labs works.** A four-step strip that draws itself on scroll: Spot the problem, Prototype, Use it ourselves, Open it up.
5. **Studio bridge.** "Like what we build? We build it for clients too." Link to uxconstellation.com.
6. **Footer.** Products, Studio, contact email, © Constellation.

## Product page spine

Same order on every page so the Labs feels like one place. Each page carries its own accent, imagery and signature interaction, so they don't feel templated.

1. **Hero.** Name, status chip, one-line hook, primary action, product visual.
2. **The problem.** One short paragraph, plain language.
3. **What it does.** Three or four capabilities, each with a small motion demo.
4. **Who it's for.** Two or three audiences.
5. **Signature moment.** One interactive section unique to the product (detailed below).
6. **Built with.** Stack chips.
7. **Where it's at.** Status and the next milestone, one line each.
8. **Close.** Primary action again, plus "Next experiment" link to the following product.

## Acre `/acre`

- **Hook:** Buy, sell, rent and manage property in one place.
- **Problem:** Property transactions in South Africa run across email, WhatsApp, paper and separate verification steps. Nobody, not the buyer, seller, owner or agent, can see where a deal actually stands.
- **What it does:**
  - Tracks every step of a sale or rental from offer to transfer
  - FICA and RICA verification inside the platform
  - Messaging that stays with the deal
  - Owners manage their own short-term and long-term rentals, with or without an agent
  - Agencies run their whole operation from the same system
- **For:** Buyers and sellers. Property owners and landlords. Agents and agencies.
- **Signature moment:** A deal timeline that advances as you scroll, from listing to offer to verification to transfer, with each party's view switching beside it.
- **Built with:** React, TanStack Start, Tailwind, shadcn, Supabase.
- **Where it's at:** Beta, live demo running. Next: agency onboarding.

## Pinpoints `/pinpoints`

- **Hook:** Feedback pinned to the exact spot.
- **Problem:** Review rounds die in email threads and screenshots. "The button on the second page" is not feedback anyone can act on.
- **What it does:**
  - Pin comments on websites, PDFs, videos and images
  - On live sites, comment on the exact element
  - Suggest changes in place: edit the copy, change a colour, swap an image and see it on screen
  - Suggestions never touch the real code; each becomes an approvable version on the comment
  - Resolve, approve and keep sign-off with the work
- **For:** Agencies and studios. Clients reviewing work. Product and marketing teams.
- **Signature moment:** A live mini page inside the Labs page. The visitor drops a pin, rewrites a headline, recolours a button, then hits "Suggest" to see it turn into an approval card. This is the strongest demo on the site.
- **Built with:** React, TypeScript, Supabase. Existing Pinpoints demo imagery reused.
- **Where it's at:** Beta. Next: paid plans.

## Prism `/prism`

This page doubles as Prism's landing page until it has its own.

- **Hook:** Your vibe-coded site, editable like Wix.
- **Problem:** Sites built with AI tools look great at handover. Then the client wants to change a headline and has to come back to the developer, or worse, open the code.
- **What it does:**
  - Attaches to sites built on vibe-coding platforms
  - Gives clients a visual editor for text, images and sections
  - Keeps the developer's code and design intact
  - Publishes changes without a rebuild request
- **For:** Studios handing sites to clients. Founders who built their own site with AI. Clients who just want to change their opening hours.
- **Signature moment:** A split view. One side is the code, the other the live page. Toggle "Prism on" and the page becomes editable in place while the code side stays untouched.
- **Built with:** Headless CMS architecture, React, Supabase.
- **Where it's at:** Early access, in use on client work. Next: self-serve setup.

## Nod `/nod`

- **Hook:** Give the nod. Start the conversation.
- **Problem:** Remote workers sit next to useful people every day in coffee shops and coworking spaces, and never meet them. Walking up cold feels awkward.
- **What it does:**
  - Check in at a venue by scanning a table QR code
  - Set your status: Open to chat or Working quietly
  - See who else is here and what they do
  - Send a nod, a low-pressure signal; if it's mutual, you connect
  - Connections saved with the venue and date
- **For:** Remote workers and digital nomads. Coffee shops and coworking spaces.
- **Signature moment:** A phone in the page. Scroll and it scans a QR code, flips to "Open to chat", shows the room, then two people nod at each other and connect.
- **Built with:** Progressive web app, React, Supabase, Google sign-in.
- **Where it's at:** In development. Pilot planned at Plato Coffee, George. Next: 30-day venue pilot.

## Motion rules (all pages)

- Scroll-driven reveals with GSAP, page and card transitions with Framer Motion, the glass mark in Three.js.
- One signature interaction per page; everything else stays calm so it lands.
- Every animation has a reduced-motion version showing the final state.
- Target: no layout shift, mobile at 60fps, hero interactive within 2.5s.

## Copy rules

- No em dashes.
- Short sentences, plain language, no hype words.
- Claims stay factual: no user numbers or results that aren't real.

## Assumptions to correct if wrong

- The Pinpoints live URL goes in config at step 4; the button points at a placeholder until then.
- Acre's next milestone is written as "agency onboarding".
- Prism's stack is described at a general level.
