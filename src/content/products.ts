/**
 * Single source of truth for every product on Labs.
 * Change a URL, status or line of copy here and every page follows.
 */

/**
 * Adding a venture: append one entry below. Cards, product page, stage track,
 * nav and footer all follow. A bespoke embroidered patch is optional; without
 * one the card uses the house patch with the venture's initial.
 */
export type ProductSlug = "acre" | "pinpoints" | "prism" | "nod";
export type ProductStatus = "Beta" | "Early access" | "In development";

export interface Product {
  slug: ProductSlug;
  name: string;
  status: ProductStatus;
  hook: string;
  /** CSS colour for accents; Prism also uses the spectrum utility. */
  accent: string;
  /** Card type line, e.g. "Property platform". */
  kind: string;
  /** Stage colour: card, sheets and page hero. */
  color: string;
  /** Index into STAGES: 0 Idea, 1 Prototype, 2 In use, 3 Beta, 4 Graduated. */
  stage: 0 | 1 | 2 | 3 | 4;
  cta: { label: string; href: string; external: boolean };
  problem: string;
  capabilities: string[];
  audiences: string[];
  stack: string[];
  now: string;
  next: string;
}

export const LINKS = {
  studio: "https://uxconstellation.com",
  studioContact: "https://uxconstellation.com/contact",
  email: "mailto:aldo@uxconstellation.com",
  /** Point acre.constellationlabs.cc at the Acre app, then switch this over. */
  acre: "https://acreprop.lovable.app",
  /** Swap the Pinpoints CTA to the live app URL once it is public. */
  pinpointsInvite: "mailto:aldo@uxconstellation.com?subject=Pinpoints%20invite",
  prismDemo: "https://uxconstellation.com/contact",
  nodPilot: "mailto:aldo@uxconstellation.com?subject=Nod%20pilot",
} as const;

export const products: Product[] = [
  {
    slug: "acre",
    name: "Acre",
    status: "Beta",
    hook: "Buy, sell, rent and manage property in one place.",
    accent: "hsl(var(--acre))",
    kind: "Property platform",
    color: "#d2d9c7",
    stage: 3,
    cta: { label: "Open Acre", href: LINKS.acre, external: true },
    problem:
      "Property transactions in South Africa run across email, WhatsApp, paper and separate verification steps. Nobody, not the buyer, seller, owner or agent, can see where a deal actually stands.",
    capabilities: [
      "Tracks every step of a sale or rental, from offer to transfer",
      "FICA and RICA verification inside the platform",
      "Messaging that stays with the deal",
      "Owners manage their own short-term and long-term rentals, with or without an agent",
      "Agencies run their whole operation from the same system",
    ],
    audiences: ["Buyers and sellers", "Property owners and landlords", "Agents and agencies"],
    stack: ["React", "TanStack Start", "Tailwind", "shadcn", "Supabase"],
    now: "Beta, live demo running.",
    next: "Agency onboarding.",
  },
  {
    slug: "pinpoints",
    name: "Pinpoints",
    status: "Beta",
    hook: "Feedback pinned to the exact spot.",
    accent: "hsl(var(--pinpoints))",
    kind: "Visual feedback",
    color: "#f0c0a1",
    stage: 3,
    cta: { label: "Ask for a Pinpoints invite", href: LINKS.pinpointsInvite, external: true },
    problem:
      "Review rounds die in email threads and screenshots. \"The button on the second page\" is not feedback anyone can act on.",
    capabilities: [
      "Pin comments on websites, PDFs, videos and images",
      "On live sites, comment on the exact element",
      "Suggest changes in place: edit the copy, change a colour, swap an image and see it on screen",
      "Suggestions never touch the real code; each becomes an approvable version on the comment",
      "Resolve, approve and keep sign-off with the work",
    ],
    audiences: ["Agencies and studios", "Clients reviewing work", "Product and marketing teams"],
    stack: ["React", "TypeScript", "Supabase"],
    now: "Beta.",
    next: "Paid plans.",
  },
  {
    slug: "prism",
    name: "Prism",
    status: "Early access",
    hook: "Your vibe-coded site, editable like Wix.",
    accent: "hsl(var(--prism))",
    kind: "Headless CMS",
    color: "#d8d1df",
    stage: 2,
    cta: { label: "Book a Prism demo", href: LINKS.prismDemo, external: true },
    problem:
      "Sites built with AI tools look great at handover. Then the client wants to change a headline and has to come back to the developer, or worse, open the code.",
    capabilities: [
      "Attaches to sites built on vibe-coding platforms",
      "Gives clients a visual editor for text, images and sections",
      "Keeps the developer's code and design intact",
      "Publishes changes without a rebuild request",
    ],
    audiences: [
      "Studios handing sites to clients",
      "Founders who built their own site with AI",
      "Clients who just want to change their opening hours",
    ],
    stack: ["Headless CMS", "React", "Supabase"],
    now: "Early access, running on our own studio work.",
    next: "Self-serve setup.",
  },
  {
    slug: "nod",
    name: "Nod",
    status: "In development",
    hook: "Give the nod. Start the conversation.",
    accent: "hsl(var(--nod))",
    kind: "In-person networking",
    color: "#b3d3c6",
    stage: 1,
    cta: { label: "Join the pilot", href: LINKS.nodPilot, external: true },
    problem:
      "Remote workers sit next to useful people every day in coffee shops and coworking spaces, and never meet them. Walking up cold feels awkward.",
    capabilities: [
      "Check in at a venue by scanning a table QR code",
      "Set your status: Open to chat or Working quietly",
      "See who else is here and what they do",
      "Send a nod, a low-pressure signal; if it's mutual, you connect",
      "Connections saved with the venue and date",
    ],
    audiences: ["Remote workers and digital nomads", "Coffee shops and coworking spaces"],
    stack: ["Progressive web app", "React", "Supabase", "Google sign-in"],
    now: "In development. Pilot planned at Plato Coffee, George.",
    next: "30-day venue pilot.",
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const nextProduct = (slug: ProductSlug) => {
  const i = products.findIndex((p) => p.slug === slug);
  return products[(i + 1) % products.length];
};

export const statusDot: Record<ProductStatus, string> = {
  Beta: "hsl(var(--acre))",
  "Early access": "hsl(var(--prism))",
  "In development": "hsl(var(--nod))",
};

export const STAGES = [
  { name: "Idea", line: "A problem we keep hitting on client work." },
  { name: "Prototype", line: "The smallest version that could fix it." },
  { name: "In use", line: "Running on our own studio work." },
  { name: "Beta", line: "Open to try, still being shaped." },
  { name: "Graduated", line: "Its own company and its own home." },
] as const;
