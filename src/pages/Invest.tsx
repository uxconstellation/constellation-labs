import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Patch from "@/components/patches/Patch";
import Liquid, { PALETTES } from "@/components/brand/Liquid";
import StageTrack from "@/components/home/StageTrack";
import Cta from "@/components/ui/Cta";
import Sweep from "@/components/ui/Sweep";
import LiquidSheet, { TONES } from "@/components/ui/LiquidSheet";
import { LINKS, products, STAGES } from "@/content/products";
import { gsap, useMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const INVEST_MAIL = "mailto:aldo@uxconstellation.com?subject=Investing%20in%20Constellation%20Labs";

const WHY = [
  { t: "The problems are real.", b: "Every product starts from friction we hit on paid client work, not from a whiteboard session." },
  { t: "The first users are already in the room.", b: "We run each product on our own studio work before anyone else touches it. What survives that gets opened up." },
  { t: "One team, one stack.", b: "The studio's designers and builders make every product on a shared stack, so each new one starts from what the last one proved." },
];

const STEPS = [
  { t: "A first call", b: "Aldo walks you through every product, live, and where each one stands today." },
  { t: "A closer look", b: "Pick the products you care about. We share what each one needs to reach its next stage." },
  { t: "Find the fit", b: "We work out together what backing looks like for you and for the product." },
];

export default function Invest() {
  const root = useRef<HTMLDivElement>(null);
  const [row, setRow] = useState<number | null>(null);

  useMotion(root, (r) => {
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .from(r.querySelectorAll(".iv-line"), { yPercent: 110, duration: 1.4, stagger: 0.1 }, 0.15)
      .from(r.querySelectorAll(".iv-fade"), { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.55)
      .from(r.querySelectorAll(".iv-patch"), { y: 120, rotate: (i) => (i - 1.5) * 30, opacity: 0, duration: 1.4, stagger: 0.08 }, 0.4);
    gsap.to(r.querySelector(".iv-hand"), { yPercent: 18, ease: "none", scrollTrigger: { trigger: r.querySelector(".iv-hero"), start: "top top", end: "bottom top", scrub: true } });
  });

  return (
    <div ref={root}>
      {/* Hero */}
      <section className="iv-hero grain relative overflow-hidden rounded-b-[clamp(28px,3vw,44px)] bg-ink pb-16 pt-[120px] text-paper md:pb-24 md:pt-[150px]" aria-labelledby="iv-title">
        <div className="wrap grid items-end gap-12 lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative z-10">
            <p className="eyebrow iv-fade !text-paper/60">For investors</p>
            <h1 id="iv-title" className="mt-6" aria-label="Back the next one.">
              <span className="block overflow-hidden pb-[.06em]" aria-hidden="true"><span className="iv-line d-hero block">Back the</span></span>
              <span className="block overflow-hidden pb-[.1em]" aria-hidden="true"><span className="iv-line d-hero block">next <span className="text-orange">one.</span></span></span>
            </h1>
            <p className="iv-fade lede mt-8 max-w-[34rem] !text-paper/75">
              Constellation Labs is where a working design and build studio turns the problems it keeps hitting into products. Four are on the bench today, and each is built to become a company of its own.
            </p>
            <div className="iv-fade mt-9 flex flex-wrap gap-3">
              <Cta href={INVEST_MAIL}>Talk to Aldo</Cta>
              <Cta href="#portfolio" variant="line-light" arrow={false}>See the portfolio ↓</Cta>
            </div>
          </div>
          <div className="iv-hand pointer-events-none relative z-0 mx-auto h-[300px] w-full max-w-[460px] md:h-[400px]" aria-hidden="true">
            <div className="absolute bottom-[8%] left-1/2 aspect-square w-[100%] -translate-x-1/2 lg:w-[118%]">
              <Liquid shape="disc" palette={PALETTES.night} bg="#160C15" grain={0.13} className="h-full w-full" />
            </div>
            {products.map((p, i) => (
              <span
                key={p.slug}
                className="iv-patch patch absolute bottom-0 left-1/2 w-[46%] origin-bottom"
                style={{ transform: `translateX(${-50 + (i - 1.5) * 38}%) rotate(${(i - 1.5) * 12}deg) translateY(${Math.abs(i - 1.5) * 8}%)`, filter: "drop-shadow(0 24px 30px rgba(0,0,0,.45))" }}
              >
                <Patch slug={p.slug} />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section aria-labelledby="why-title" className="wrap py-28 md:py-40">
        <p className="eyebrow" data-reveal>Why a studio lab</p>
        <Sweep as="h2" className="mt-6 max-w-[20ch] text-[clamp(34px,5vw,76px)] font-black leading-[1.02] tracking-[-0.045em]" text="A studio sees the same *problem* on ten projects before anyone else sees it once." />
        <ol className="mt-16 grid gap-3 md:mt-24 md:grid-cols-3">
          {WHY.map((w, i) => (
            <LiquidSheet as="li" key={w.t} tone={TONES[i]} className="flex min-h-[220px] flex-col justify-between p-8 md:min-h-[340px] md:p-10" data-reveal={String(i * 0.1)}>
              <span className={cn("num w-fit text-[13px]", i === 0 ? "rounded-full bg-ink px-2.5 py-1 text-paper" : "text-ink-soft")}>0{i + 1}</span>
              <div>
                <p className="d-s max-w-[14ch]">{w.t}</p>
                <p className={cn("mt-4 text-[15.5px] leading-relaxed", i === 0 ? "text-paper/80" : "text-ink/80")}>{w.b}</p>
              </div>
            </LiquidSheet>
          ))}
        </ol>
      </section>

      {/* Portfolio */}
      <section id="portfolio" aria-labelledby="pf-title" className="scroll-mt-20 pb-28 md:pb-40">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="pf-title" className="d-l" data-reveal>The portfolio.</h2>
            <p className="lede max-w-[24rem]" data-reveal=".1">Four products, shown at their real stage. Nothing here is a concept.</p>
          </div>
          <ul className="mt-14 border-t hairline" onMouseLeave={() => setRow(null)}>
            {products.map((p, i) => (
              <li key={p.slug} data-reveal={String(i * 0.06)}>
                <Link
                  to={`/${p.slug}`}
                  onMouseEnter={() => setRow(i)}
                  onFocus={() => setRow(i)}
                  className="relative isolate grid grid-cols-[64px_1fr] items-center gap-x-5 gap-y-3 overflow-hidden border-b hairline px-2 py-7 md:grid-cols-[96px_1.1fr_1.4fr_.9fr_40px] md:gap-8 md:px-6 md:py-9"
                >
                  <span aria-hidden="true" className={cn("absolute inset-0 -z-10 origin-bottom transition-transform duration-700 ease-lab", row === i ? "scale-y-100" : "scale-y-0")} style={{ background: p.color }} />
                  <span className={cn("patch patch-shadow w-[64px] transition-transform duration-700 ease-lab md:w-[84px]", row === i && "-rotate-6 scale-110")}><Patch slug={p.slug} /></span>
                  <span className="text-[clamp(30px,3.6vw,52px)] font-black leading-none tracking-[-0.045em]">{p.name}</span>
                  <span className="col-span-2 text-[16px] leading-snug text-ink/75 md:col-span-1">{p.hook}</span>
                  <span className="col-span-2 md:col-span-1">
                    <span className="block text-[13px] text-ink-soft">Stage {p.stage + 1} of 5</span>
                    <span className="block text-[17px] font-bold">{STAGES[p.stage].name}</span>
                    <span className="mt-1 block text-[13.5px] text-ink-soft">Next: {p.next}</span>
                  </span>
                  <span aria-hidden="true" className={cn("hidden text-2xl transition-transform duration-700 ease-lab md:block", row === i && "translate-x-2")}>→</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-20"><StageTrack compact /></div>
        </div>
      </section>

      {/* How */}
      <section aria-labelledby="how-title" className="relative overflow-hidden bg-cream py-28 md:py-40">
        <div className="wrap relative">
          <h2 id="how-title" className="d-l max-w-[14ch]" data-reveal>How a conversation goes.</h2>
          <ol className="mt-16 grid gap-12 md:mt-24 md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => (
              <li key={s.t} className="border-t-2 border-ink pt-6" data-reveal={String(i * 0.12)}>
                <span className="num text-[13px] text-ink-soft">Step 0{i + 1}</span>
                <p className="d-s mt-3">{s.t}</p>
                <p className="mt-3 max-w-[22rem] text-[16px] leading-relaxed text-ink/75">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Close */}
      <section aria-labelledby="close-title" className="wrap py-28 md:py-40">
        <LiquidSheet tone="ink" className="p-8 md:p-16">
          <p className="eyebrow !text-paper/60" data-reveal>Start here</p>
          <h2 id="close-title" className="d-hero mt-6" data-reveal>Talk to Aldo.</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
            <p className="lede max-w-[30rem] !text-paper/75" data-reveal>
              Aldo Calitz runs Constellation and Labs from George, South Africa. One email gets you a call and a live walk through every product.
            </p>
            <div className="flex flex-wrap gap-3" data-reveal>
              <Cta href={INVEST_MAIL}>Email Aldo</Cta>
              <Cta href={LINKS.studio} variant="line-light">Meet the studio</Cta>
            </div>
          </div>
        </LiquidSheet>
      </section>
    </div>
  );
}
