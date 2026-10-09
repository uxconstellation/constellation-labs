import { useRef, useState } from "react";
import VentureCard from "@/components/cards/VentureCard";
import PatchMaker from "@/components/build/PatchMaker";
import Cta from "@/components/ui/Cta";
import Sweep from "@/components/ui/Sweep";
import { LINKS, products } from "@/content/products";
import { gsap, useMotion } from "@/lib/motion";

const MAKE = [
  { t: "Websites", b: "Marketing sites that move, load fast and stay editable after handover." },
  { t: "Web apps", b: "Platforms with real roles, data and workflows, like the deal room inside Acre." },
  { t: "Products", b: "From the first prototype to a launched product people pay for." },
];

const METHOD = [
  { t: "Find the problem", b: "We start with the friction, not the feature list." },
  { t: "Prototype the fix", b: "The smallest version that proves it works, in front of real people early." },
  { t: "Put it to work", b: "It runs on real work before it ships, the way every Labs product did." },
  { t: "Launch and grow", b: "Live, measured, and handed over in a state you can keep running." },
];

export default function Build() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useMotion(root, (r) => {
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .from(r.querySelectorAll(".bd-line"), { yPercent: 110, duration: 1.4, stagger: 0.1 }, 0.15)
      .from(r.querySelectorAll(".bd-fade"), { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.55)
      .from(r.querySelector(".bd-stitch"), { strokeDashoffset: 1, duration: 2.4, ease: "power2.inOut" }, 0.5);
    const method = r.querySelector(".bd-method");
    if (method) {
      gsap.from(method.querySelector(".bd-rail"), { scaleX: 0, ease: "none", scrollTrigger: { trigger: method, start: "top 70%", end: "bottom 60%", scrub: true } });
    }
  });

  return (
    <div ref={root}>
      {/* Hero */}
      <section className="grain relative overflow-hidden rounded-b-[clamp(28px,3vw,44px)] bg-cream pb-16 pt-[120px] md:pb-24 md:pt-[150px]" aria-labelledby="bd-title">
        <div className="wrap grid items-end gap-12 lg:grid-cols-[1.25fr_.75fr]">
          <div>
            <p className="eyebrow bd-fade">For teams</p>
            <h1 id="bd-title" className="mt-6" aria-label="Have the studio build yours.">
              <span className="block overflow-hidden pb-[.06em]" aria-hidden="true"><span className="bd-line d-hero block">Have us</span></span>
              <span className="block overflow-hidden pb-[.1em]" aria-hidden="true"><span className="bd-line d-hero block">build <span className="text-orange-ink">yours.</span></span></span>
            </h1>
            <p className="bd-fade lede mt-8 max-w-[34rem]">
              Labs is what Constellation makes for itself. The same designers and builders take client work from the first sketch to launch.
            </p>
            <div className="bd-fade mt-9 flex flex-wrap gap-3">
              <Cta href={LINKS.studioContact}>Start a project</Cta>
              <Cta href="#patch" variant="line" arrow={false}>Sew your patch ↓</Cta>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[360px]" aria-hidden="true">
            <svg viewBox="0 0 400 400" className="w-full overflow-visible">
              <circle cx="200" cy="200" r="172" fill="none" stroke="hsl(var(--sand))" strokeWidth="2" strokeDasharray="6 8" />
              <circle className="bd-stitch" cx="200" cy="200" r="172" fill="none" stroke="hsl(var(--orange))" strokeWidth="8" strokeLinecap="round" pathLength={1} strokeDasharray="1" transform="rotate(-90 200 200)" style={{ strokeDashoffset: 0.25 }} />
              <text x="200" y="192" textAnchor="middle" fontFamily="Satoshi" fontWeight="500" fontSize="24" fill="hsl(var(--ink-soft))">Your patch</text>
              <text x="200" y="224" textAnchor="middle" fontFamily="Satoshi" fontWeight="500" fontSize="24" fill="hsl(var(--ink-soft))">goes here</text>
            </svg>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section aria-labelledby="proof-title" className="wrap py-28 md:py-40">
        <p className="eyebrow" data-reveal>The proof is on the bench</p>
        <Sweep as="h2" className="mt-6 max-w-[21ch] text-[clamp(34px,5vw,76px)] font-black leading-[1.02] tracking-[-0.045em]" text="Every product on this site was *designed* and *built* by the team that would build yours." />
        <div className="no-scrollbar -mx-[var(--gutter)] mt-16 flex snap-x gap-6 overflow-x-auto px-[var(--gutter)] pb-10 pt-4 md:mt-20">
          {products.map((p, i) => (
            <div key={p.slug} className="snap-center" style={{ rotate: `${i % 2 ? 1.5 : -1.5}deg` }} data-reveal={String(i * 0.08)}>
              <VentureCard p={p} active={active === p.slug} onActive={(on) => setActive((a) => (on ? p.slug : a === p.slug ? null : a))} />
            </div>
          ))}
        </div>
      </section>

      {/* What we make */}
      <section aria-labelledby="make-title" className="bg-ink py-28 text-paper md:py-40">
        <div className="wrap">
          <h2 id="make-title" className="d-l" data-reveal>What we make.</h2>
          <ul className="mt-14 border-t border-paper/15">
            {MAKE.map((m, i) => (
              <li key={m.t} className="grid gap-3 border-b border-paper/15 py-8 md:grid-cols-[96px_1fr_1fr] md:items-baseline md:gap-8 md:py-10" data-reveal={String(i * 0.08)}>
                <span className="num text-[13px] text-paper/50">0{i + 1}</span>
                <span className="text-[clamp(34px,4.4vw,64px)] font-black leading-none tracking-[-0.045em]">{m.t}</span>
                <span className="max-w-[26rem] text-[17px] leading-relaxed text-paper/70">{m.b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Method */}
      <section aria-labelledby="method-title" className="bd-method wrap py-28 md:py-40">
        <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
          <h2 id="method-title" className="d-l" data-reveal>The lab method, on your project.</h2>
          <p className="lede" data-reveal=".1">The same four steps every Labs product went through, applied to yours.</p>
        </div>
        <div className="relative mt-16 md:mt-24">
          <div className="bd-rail absolute left-0 right-0 top-0 hidden h-[2px] origin-left bg-ink md:block" aria-hidden="true" />
          <ol className="grid gap-10 md:grid-cols-4 md:gap-8">
            {METHOD.map((m, i) => (
              <li key={m.t} className="border-t-2 border-ink pt-6 md:border-t-0 md:pt-8" data-reveal={String(i * 0.1)}>
                <span className="num text-[13px] text-ink-soft">0{i + 1}</span>
                <p className="d-s mt-3">{m.t}</p>
                <p className="mt-3 text-[15.5px] leading-relaxed text-ink/75">{m.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Patch maker */}
      <section id="patch" aria-labelledby="patch-title" className="scroll-mt-20 px-2 pb-24 md:px-4 md:pb-32">
        <div className="grain sheet bg-cream px-5 py-14 md:px-16 md:py-20">
          <div className="wrap !px-0">
            <h2 id="patch-title" className="d-l max-w-[14ch]" data-reveal>Every build gets a patch.</h2>
            <p className="lede mt-5 max-w-[30rem]" data-reveal=".1">Name the thing you want built. We will sew it on the board next to ours.</p>
            <div className="mt-14"><PatchMaker emailTo="mailto:aldo@uxconstellation.com" /></div>
          </div>
        </div>
      </section>

      {/* Close */}
      <section aria-labelledby="bd-close" className="wrap pb-28 md:pb-40">
        <div className="flex flex-col items-start justify-between gap-10 border-t hairline pt-14 md:flex-row md:items-end">
          <h2 id="bd-close" className="d-l max-w-[12ch]" data-reveal>Tell us what you keep hitting.</h2>
          <div className="flex flex-wrap gap-3" data-reveal>
            <Cta href={LINKS.studioContact}>Start a project</Cta>
            <Cta href={LINKS.studio} variant="line">Visit the studio</Cta>
          </div>
        </div>
      </section>
    </div>
  );
}
