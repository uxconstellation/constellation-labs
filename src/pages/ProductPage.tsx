import { Fragment, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import Patch from "@/components/patches/Patch";
import Liquid, { PALETTES } from "@/components/brand/Liquid";
import { SCENES } from "@/components/scenes";
import { SIGNATURES } from "@/components/signature";
import StageTrack from "@/components/home/StageTrack";
import Cta from "@/components/ui/Cta";
import StatusChip from "@/components/ui/StatusChip";
import Sweep from "@/components/ui/Sweep";
import { getProduct, nextProduct, products, type Product } from "@/content/products";
import { gsap, useMotion } from "@/lib/motion";
import acreShot from "@/assets/real/acre.webp";
import pinpointsShot from "@/assets/real/pinpoints.webp";
import NotFound from "./NotFound";

/** Each venture's liquid: its own colour run through the brand's wine and orange. */
const LIQUID: Partial<Record<Product["slug"], [string, string, string]>> = {
  acre: ["#2F6B4F", "#FE6E36", "#E9C39E"],
  pinpoints: ["#8B2252", "#FE6E36", "#F3C9A8"],
  prism: ["#5B4B8A", "#FE6E36", "#9EDCC6"],
  nod: ["#173F3F", "#C8753A", "#9EDCC6"],
};

const REAL: Partial<Record<Product["slug"], { src: string; url: string; caption: string; title: string; eyebrow: string }>> = {
  acre: { src: acreShot, url: "acreprop.lovable.app", eyebrow: "Not a mock-up", title: "It is live. Go and use it.", caption: "The real Acre, running in beta." },
  pinpoints: { src: pinpointsShot, url: "pinpoints review", eyebrow: "The real widget", title: "Built, and in beta.", caption: "The real Pinpoints widget, on an invented demo site." },
};

/** Section order per venture, so no two pages walk the same path. Lead with the strongest moment. */
const ORDER: Record<string, string[]> = {
  default: ["problem", "try", "what", "real", "notes", "useback"],
  acre: ["problem", "try", "what", "real", "notes", "useback"],
  pinpoints: ["try", "problem", "real", "what", "notes", "useback"],
  prism: ["problem", "try", "notes", "what", "useback"],
  nod: ["try", "what", "problem", "notes", "useback"],
};

export default function ProductPage() {
  const { slug = "" } = useParams();
  const p = getProduct(slug);
  if (!p) return <NotFound />;
  return <Product p={p} key={p.slug} />;
}

function Product({ p }: { p: Product }) {
  const root = useRef<HTMLElement>(null);
  const [sheen, setSheen] = useState<{ x: number; y: number } | null>(null);
  const ScenePiece = SCENES[p.slug];
  const next = nextProduct(p.slug);
  const index = products.findIndex((x) => x.slug === p.slug);
  const real = REAL[p.slug];
  const sig = SIGNATURES[p.slug];
  const stage = p.color;

  useMotion(root, (r) => {
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .from(r.querySelectorAll(".pp-ch"), { yPercent: 105, duration: 1.3, stagger: 0.04 }, 0.15)
      .from(r.querySelectorAll(".pp-fade"), { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.5)
      .from(r.querySelector(".pp-patch"), p.slug === "pinpoints"
        ? { yPercent: -260, rotate: 0, opacity: 0, duration: 1.3, ease: "bounce.out" } // dropped like a pin
        : { scale: 0.4, rotate: -30, opacity: 0, duration: 1.4, ease: "back.out(1.5)" }, 0.4);
    // One small gesture per venture, so no two heroes behave alike
    const hp = r.querySelector(".pp-patch-inner");
    if (p.slug === "nod" && hp) gsap.to(hp, { rotate: -12, duration: 0.35, ease: "power2.inOut", yoyo: true, repeat: 3, repeatDelay: 0.05, delay: 2.2, onComplete() { this.delay(3).restart(true); } });
    if (p.slug === "acre" && hp) gsap.to(hp, { y: -14, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    if (p.slug === "prism") r.querySelector(".pp-title")?.classList.add("prism-split");
    gsap.to(r.querySelector(".pp-patch"), { yPercent: 30, rotate: 16, ease: "none", scrollTrigger: { trigger: r.querySelector(".pp-hero"), start: "top top", end: "bottom top", scrub: true } });
    const caps = r.querySelector(".pp-caps");
    if (caps) {
      gsap.to(r.querySelector(".pp-caps-patch"), { rotate: 340, ease: "none", scrollTrigger: { trigger: caps, start: "top bottom", end: "bottom top", scrub: true } });
    }
    const shot = r.querySelector(".pp-shot");
    if (shot) gsap.fromTo(shot, { rotate: -4, yPercent: 8 }, { rotate: 1, yPercent: -6, ease: "none", scrollTrigger: { trigger: shot, start: "top bottom", end: "bottom top", scrub: true } });
  }, [p.slug]);

  const sections: Record<string, ReactNode> = {
    problem: (
      <>
      {/* Problem */}
      <section aria-labelledby="problem-title" className="relative overflow-hidden bg-ink py-28 text-paper md:py-40">
        <Liquid palette={PALETTES.night} bg="#160C15" wash={0.62} grain={0.12} speed={0.25} scale={2} resolution={0.5} className="absolute inset-0 h-full w-full" />
        <div className="wrap relative">
          <h2 id="problem-title" className="eyebrow !text-paper/90">The problem</h2>
          <Sweep dark className="mt-8 max-w-[24ch] text-[clamp(30px,4.4vw,66px)] font-black leading-[1.04] tracking-[-0.04em]" text={p.problem} />
        </div>
      </section>
      </>
    ),
    try: (
      <>
      {/* Try it: each venture's own experiment */}
      {sig && (
        <section id="try" aria-labelledby="try-title" className="relative scroll-mt-16 overflow-clip">
          <Liquid palette={LIQUID[p.slug] ?? PALETTES.day} bg="#F3EEE7" wash={0.7} grain={0.11} speed={0.25} scale={1.8} resolution={0.45} className="absolute inset-0 h-full w-full" />
          <div className="wrap relative pt-24 md:pt-32">
            <p className="eyebrow" data-reveal>Try it · Experiment no. 0{index + 1}</p>
            <div className="mt-4 grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
              <h2 id="try-title" className="d-l" data-reveal>{sig.title}</h2>
              <p className="lede" data-reveal=".1">{sig.line}</p>
            </div>
          </div>
          {sig.fullBleed ? <div className="relative"><sig.Component /></div> : <div className="wrap relative pb-24 pt-12 md:pb-32 md:pt-16"><sig.Component /></div>}
        </section>
      )}
      </>
    ),
    what: (
      <>
      {/* What it does, and who for */}
      <section aria-labelledby="caps-title" className="pp-caps wrap grid gap-14 py-24 md:grid-cols-[.8fr_1.2fr] md:py-36">
        <div className="md:sticky md:top-28 md:self-start">
          <h2 id="caps-title" className="d-l" data-reveal>What it does.</h2>
          <p className="lede mt-6 max-w-[22rem]" data-reveal>
            Made for {p.audiences.map((a, i) => (
              <span key={a}>{i > 0 && (i === p.audiences.length - 1 ? " and " : ", ")}<strong className="font-bold text-ink">{a.charAt(0).toLowerCase() + a.slice(1)}</strong></span>
            ))}.
          </p>
          <div className="pp-caps-patch patch patch-shadow mt-12 hidden w-[180px] md:block" aria-hidden="true"><Patch slug={p.slug} /></div>
        </div>
        <ol className="border-t hairline">
          {p.capabilities.map((c, i) => (
            <li key={c} className="grid grid-cols-[48px_1fr] gap-4 border-b hairline py-7 md:grid-cols-[72px_1fr] md:py-9" data-reveal>
              <span className="num pt-1 text-[14px] text-ink-soft">0{i + 1}</span>
              <span className="text-[clamp(20px,2vw,28px)] font-bold leading-snug tracking-[-0.02em]">{c}</span>
            </li>
          ))}
        </ol>
      </section>
      </>
    ),
    real: (
      <>
      {/* The real thing */}
      {real && (
        <section aria-labelledby="real-title" className="overflow-hidden bg-cream py-24 md:py-36">
          <div className="wrap grid items-center gap-14 md:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="eyebrow" data-reveal>{real.eyebrow}</p>
              <h2 id="real-title" className="d-m mt-5 max-w-[12ch]" data-reveal>{real.title}</h2>
              <p className="lede mt-5 max-w-[26rem]" data-reveal>{real.caption}</p>
              <div className="mt-8" data-reveal><Cta href={p.cta.href} variant="ink">{p.cta.label}</Cta></div>
            </div>
            <figure className="pp-shot overflow-hidden rounded-2xl border hairline bg-paper shadow-float">
              <div className="flex h-9 items-center gap-1.5 border-b hairline bg-mist px-4" aria-hidden="true">
                <i className="h-2.5 w-2.5 rounded-full bg-sand/60" /><i className="h-2.5 w-2.5 rounded-full bg-sand/60" /><i className="h-2.5 w-2.5 rounded-full bg-sand/60" />
                <span className="ml-3 rounded-full bg-paper px-3 py-0.5 text-[12px] text-ink-soft">{real.url}</span>
              </div>
              <img src={real.src} alt={`Screenshot of ${p.name}`} width={960} height={600} loading="lazy" className="block h-auto w-full" />
            </figure>
          </div>
        </section>
      )}
      </>
    ),
    notes: (
      <>
      {/* Lab notes */}
      <section aria-labelledby="notes-title" className="wrap py-24 md:py-36">
        <div className="sheet relative isolate overflow-hidden p-7 md:p-14" style={{ background: stage }} data-reveal>
          <Liquid palette={LIQUID[p.slug] ?? PALETTES.day} bg={p.color} wash={0.66} grain={0.12} speed={0.22} scale={1.8} resolution={0.45} className="absolute inset-0 -z-10 h-full w-full" />
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-5">
            <h2 id="notes-title" className="text-[13px] font-bold uppercase tracking-[.2em]">Lab notes · Experiment no. 0{index + 1} · {p.name}</h2>
            <StatusChip status={p.status} />
          </div>
          <div className="grid gap-10 pt-8 md:grid-cols-[1.4fr_1fr] md:gap-16 md:pt-12">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[.2em] text-ink/75">Hypothesis</p>
              <p className="mt-4 text-[clamp(26px,3.2vw,46px)] font-black leading-[1.05] tracking-[-0.035em]">{p.hypothesis}</p>
            </div>
            <dl className="grid content-end gap-6">
              <div className="border-t border-ink/15 pt-4"><dt className="text-[12px] font-bold uppercase tracking-[.2em] text-ink/75">Where it's at</dt><dd className="mt-2 text-[19px] font-bold">{p.now}</dd></div>
              <div className="border-t border-ink/15 pt-4"><dt className="text-[12px] font-bold uppercase tracking-[.2em] text-ink/75">Next</dt><dd className="mt-2 text-[19px] font-bold">{p.next}</dd></div>
              <div className="border-t border-ink/15 pt-4">
                <dt className="text-[12px] font-bold uppercase tracking-[.2em] text-ink/75">Built with</dt>
                <dd className="mt-3 flex flex-wrap gap-2">{p.stack.map((x) => <span key={x} className="chip">{x}</span>)}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="mt-16"><StageTrack compact highlight={p.slug} /></div>
      </section>
      </>
    ),
    useback: (
      <>
      {/* Use it or back it */}
      <section aria-label={`Use or back ${p.name}`} className="wrap grid gap-3 pb-24 md:grid-cols-2 md:pb-32">
        <a href={p.cta.href} {...(p.cta.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group sheet relative isolate flex min-h-[300px] flex-col justify-between overflow-hidden p-8 md:p-12" style={{ background: stage }} data-reveal>
          <Liquid palette={LIQUID[p.slug] ?? PALETTES.day} bg={p.color} wash={0.6} grain={0.12} speed={0.3} scale={2} resolution={0.45} className="absolute inset-0 -z-10 h-full w-full" />
          <p className="eyebrow !text-ink/70">Use it</p>
          <div>
            <p className="d-m">{p.cta.label}.</p>
            <span className="btn btn-ink mt-6">{p.cta.label} <span className="arrow" aria-hidden="true">→</span></span>
          </div>
        </a>
        <Link to="/invest" className="group sheet relative isolate flex min-h-[300px] flex-col justify-between overflow-hidden bg-ink p-8 text-paper md:p-12" data-reveal=".08">
          <div aria-hidden="true" className="absolute -right-[25%] -top-[40%] -z-10 aspect-square w-[90%] transition-transform duration-[1200ms] ease-lab group-hover:scale-110">
            <Liquid shape="disc" palette={PALETTES.night} bg="#160C15" grain={0.12} className="h-full w-full" />
          </div>
          <p className="eyebrow !text-paper/90">Back it</p>
          <div>
            <p className="d-m max-w-[14ch]">Talk to us about {p.name}.</p>
            <span className="btn btn-orange mt-6">Invest in Labs <span className="arrow" aria-hidden="true">→</span></span>
          </div>
        </Link>
      </section>
      </>
    ),
  };

  return (
    <article ref={root as React.RefObject<HTMLElement>}>
      {/* Hero */}
      <header className="pp-hero relative overflow-hidden rounded-b-[clamp(28px,3vw,44px)] pb-14 pt-[104px] md:pb-20" style={{ background: stage }}>
        <Liquid palette={LIQUID[p.slug] ?? PALETTES.day} bg={p.color} wash={0.58} grain={0.12} speed={0.3} scale={2.2} resolution={0.5} className="absolute inset-0 h-full w-full" />
        <div className="wrap relative">
          <div className="pp-fade flex flex-wrap items-center gap-3">
            <Link to="/#bench" className="eyebrow !text-ink/70 hover:!text-ink">Labs</Link>
            <span className="eyebrow !text-ink/40" aria-hidden="true">/</span>
            <span className="eyebrow !text-ink/70">Lab no. 0{index + 1}</span>
            <StatusChip status={p.status} className="ml-1" />
          </div>
          <h1 className="pp-title mt-6 overflow-hidden whitespace-nowrap pb-[.08em] font-black leading-[.8] tracking-[-0.068em]" style={{ fontSize: `min(220px, calc((100vw - 2 * var(--gutter)) / ${(p.name.length * 0.62 + 0.3).toFixed(2)}))` }} aria-label={p.name}>
            {p.name.split("").map((c, k) => <span key={k} aria-hidden="true" className="pp-ch inline-block">{c}</span>)}
          </h1>
          <div className="mt-6 grid items-start gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-14">
            <div className="lg:pt-6">
              <p className="pp-fade d-m max-w-[16ch]">{p.hook}</p>
              <div className="pp-fade mt-8 flex flex-wrap gap-3">
                <Cta href={p.cta.href} variant="ink">{p.cta.label}</Cta>
                {sig && <Cta href="#try" variant="line" arrow={false}>Try it yourself ↓</Cta>}
              </div>
            </div>
            <div className="pp-fade relative">
              {/* The motion loop, with the venture's patch sewn onto its corner */}
              <div className="mx-auto max-w-[min(100%,calc((100svh-330px)*1.36))] rounded-[26px] border border-ink/10 bg-[#FCFAF6]/85 px-4 pb-4 pt-6 shadow-float backdrop-blur md:px-7 md:pb-5 md:pt-7 lg:mr-0">
                <ScenePiece />
              </div>
              <div
                className="pp-patch patch patch-shadow absolute -left-4 -top-10 w-[clamp(96px,11vw,160px)] rotate-[-10deg] md:-left-12 md:-top-14"
                onPointerMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setSheen({ x: ((e.clientX - r.left) / r.width) * 400, y: ((e.clientY - r.top) / r.height) * 420 });
                }}
                onPointerLeave={() => setSheen(null)}
                aria-hidden="true"
              >
                <div className="pp-patch-inner"><Patch slug={p.slug} sheen={sheen} /></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {(ORDER[p.slug] ?? ORDER.default).map((k) => <Fragment key={k}>{sections[k]}</Fragment>)}

      {/* Next experiment */}
      <Link to={`/${next.slug}`} className="group block overflow-hidden border-t hairline" aria-label={`Next experiment: ${next.name}`}>
        <div className="wrap flex items-center justify-between gap-6 py-14 md:py-20">
          <div>
            <p className="eyebrow">Next experiment</p>
            <p className="mt-3 font-black leading-[.8] tracking-[-0.065em] transition-transform duration-700 ease-lab group-hover:translate-x-3" style={{ fontSize: "clamp(64px, 12vw, 190px)" }}>
              {next.name} <span className="inline-block text-[.5em] transition-transform duration-700 ease-lab group-hover:translate-x-4" aria-hidden="true">→</span>
            </p>
          </div>
          <span className="patch patch-shadow hidden w-[clamp(110px,13vw,190px)] rotate-[-8deg] transition-transform duration-700 ease-lab group-hover:rotate-[4deg] group-hover:scale-110 sm:block" aria-hidden="true">
            <Patch slug={next.slug} />
          </span>
        </div>
      </Link>
    </article>
  );
}
