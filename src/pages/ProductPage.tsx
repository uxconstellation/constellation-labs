import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Patch from "@/components/patches/Patch";
import { SCENES } from "@/components/scenes";
import StageTrack from "@/components/home/StageTrack";
import Cta from "@/components/ui/Cta";
import StatusChip from "@/components/ui/StatusChip";
import Sweep from "@/components/ui/Sweep";
import { getProduct, nextProduct, products, type Product } from "@/content/products";
import { gsap, useMotion } from "@/lib/motion";
import acreShot from "@/assets/real/acre.webp";
import pinpointsShot from "@/assets/real/pinpoints.webp";
import NotFound from "./NotFound";

const REAL: Partial<Record<Product["slug"], { src: string; url: string; caption: string }>> = {
  acre: { src: acreShot, url: "acreprop.lovable.app", caption: "The real Acre, running in beta." },
  pinpoints: { src: pinpointsShot, url: "pinpoints review", caption: "The real Pinpoints widget, on a demo site." },
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
  const stage = p.color;

  useMotion(root, (r) => {
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .from(r.querySelectorAll(".pp-ch"), { yPercent: 105, duration: 1.3, stagger: 0.04 }, 0.15)
      .from(r.querySelectorAll(".pp-fade"), { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.5)
      .from(r.querySelector(".pp-patch"), { scale: 0.4, rotate: -30, opacity: 0, duration: 1.4, ease: "back.out(1.5)" }, 0.4);
    gsap.to(r.querySelector(".pp-patch"), { yPercent: 30, rotate: 16, ease: "none", scrollTrigger: { trigger: r.querySelector(".pp-hero"), start: "top top", end: "bottom top", scrub: true } });
    const caps = r.querySelector(".pp-caps");
    if (caps) {
      gsap.to(r.querySelector(".pp-caps-patch"), { rotate: 340, ease: "none", scrollTrigger: { trigger: caps, start: "top bottom", end: "bottom top", scrub: true } });
    }
    const shot = r.querySelector(".pp-shot");
    if (shot) gsap.fromTo(shot, { rotate: -4, yPercent: 8 }, { rotate: 1, yPercent: -6, ease: "none", scrollTrigger: { trigger: shot, start: "top bottom", end: "bottom top", scrub: true } });
  }, [p.slug]);

  return (
    <article ref={root as React.RefObject<HTMLElement>}>
      {/* Hero */}
      <header className="pp-hero grain relative overflow-hidden rounded-b-[clamp(28px,3vw,44px)] pb-14 pt-[104px] md:pb-20" style={{ background: stage }}>
        <div className="wrap">
          <div className="pp-fade flex flex-wrap items-center gap-3">
            <Link to="/#bench" className="eyebrow !text-ink/70 hover:!text-ink">Labs</Link>
            <span className="eyebrow !text-ink/40" aria-hidden="true">/</span>
            <span className="eyebrow !text-ink/70">Lab no. 0{index + 1}</span>
            <StatusChip status={p.status} className="ml-1" />
          </div>
          <h1 className="mt-6 overflow-hidden pb-[.08em] font-black leading-[.8] tracking-[-0.068em]" style={{ fontSize: `min(300px, calc((100vw - 2 * var(--gutter)) / ${(p.name.length * 0.58).toFixed(2)}))` }} aria-label={p.name}>
            {p.name.split("").map((c, k) => <span key={k} aria-hidden="true" className="pp-ch inline-block">{c}</span>)}
          </h1>
          <div className="mt-8 grid items-end gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <p className="pp-fade d-m max-w-[16ch]">{p.hook}</p>
              <div className="pp-fade mt-8 flex flex-wrap gap-3">
                <Cta href={p.cta.href} variant="ink">{p.cta.label}</Cta>
                <Cta href="#watch" variant="line" arrow={false}>Watch it work ↓</Cta>
              </div>
            </div>
            <div
              className="pp-patch patch patch-shadow relative mx-auto -mb-6 w-[clamp(150px,22vw,320px)] rotate-[8deg] md:mx-0 md:-mt-10"
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setSheen({ x: ((e.clientX - r.left) / r.width) * 400, y: ((e.clientY - r.top) / r.height) * 420 });
              }}
              onPointerLeave={() => setSheen(null)}
              aria-hidden="true"
            >
              <Patch slug={p.slug} sheen={sheen} />
            </div>
          </div>
        </div>
      </header>

      {/* Watch it work */}
      <section id="watch" aria-labelledby="watch-title" className="wrap scroll-mt-24 py-24 md:py-32">
        <div className="grid gap-6 md:grid-cols-[1fr_1.6fr] md:items-end">
          <h2 id="watch-title" className="d-l" data-reveal>Watch it work.</h2>
          <p className="lede md:justify-self-end md:text-right" data-reveal=".1">A short loop of {p.name} doing its job. The steps underneath follow along.</p>
        </div>
        <div className="grain sheet mt-12 px-4 pb-6 pt-8 md:px-14 md:pb-10 md:pt-14" style={{ background: stage }} data-reveal>
          <div className="mx-auto max-w-[980px]"><ScenePiece /></div>
        </div>
      </section>

      {/* Problem */}
      <section aria-labelledby="problem-title" className="bg-ink py-28 text-paper md:py-40">
        <div className="wrap">
          <h2 id="problem-title" className="eyebrow !text-paper/60">The problem</h2>
          <Sweep dark className="mt-8 max-w-[24ch] text-[clamp(30px,4.4vw,66px)] font-black leading-[1.04] tracking-[-0.04em]" text={p.problem} />
        </div>
      </section>

      {/* What it does */}
      <section aria-labelledby="caps-title" className="pp-caps wrap grid gap-14 py-24 md:grid-cols-[.8fr_1.2fr] md:py-36">
        <div className="md:sticky md:top-28 md:self-start">
          <h2 id="caps-title" className="d-l" data-reveal>What it does.</h2>
          <div className="pp-caps-patch patch patch-shadow mt-12 hidden w-[200px] md:block" aria-hidden="true"><Patch slug={p.slug} /></div>
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

      {/* Who it's for */}
      <section aria-labelledby="who-title" className="wrap pb-24 md:pb-36">
        <h2 id="who-title" className="d-m" data-reveal>Who it's for.</h2>
        <ul className={`mt-10 grid gap-3 ${p.audiences.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {p.audiences.map((a, i) => (
            <li key={a} className="grain sheet flex min-h-[200px] flex-col justify-between p-7 md:p-9" style={{ background: i === 0 ? stage : i === 1 ? "hsl(var(--cream))" : "hsl(var(--mist))" }} data-reveal={String(i * 0.08)}>
              <span className="num text-[13px] text-ink-soft">0{i + 1}</span>
              <span className="d-s max-w-[14ch]">{a}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* The real thing */}
      {real && (
        <section aria-labelledby="real-title" className="overflow-hidden bg-cream py-24 md:py-36">
          <div className="wrap grid items-center gap-14 md:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="eyebrow" data-reveal>Not a mock-up</p>
              <h2 id="real-title" className="d-m mt-5 max-w-[12ch]" data-reveal>It is live. Go and use it.</h2>
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

      {/* Where it's at */}
      <section aria-labelledby="status-title" className="wrap py-24 md:py-36">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <h2 id="status-title" className="d-l" data-reveal>Where it's at.</h2>
          <dl className="grid gap-6 self-end">
            <div className="border-t hairline pt-4" data-reveal><dt className="eyebrow">Now</dt><dd className="mt-2 text-[20px] font-bold">{p.now}</dd></div>
            <div className="border-t hairline pt-4" data-reveal><dt className="eyebrow">Next</dt><dd className="mt-2 text-[20px] font-bold">{p.next}</dd></div>
            <div className="border-t hairline pt-4" data-reveal>
              <dt className="eyebrow">Built with</dt>
              <dd className="mt-3 flex flex-wrap gap-2">{p.stack.map((s) => <span key={s} className="chip">{s}</span>)}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-16"><StageTrack compact highlight={p.slug} /></div>
      </section>

      {/* Use it or back it */}
      <section aria-label={`Use or back ${p.name}`} className="wrap grid gap-3 pb-24 md:grid-cols-2 md:pb-32">
        <a href={p.cta.href} {...(p.cta.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group grain sheet flex min-h-[300px] flex-col justify-between p-8 md:p-12" style={{ background: stage }} data-reveal>
          <p className="eyebrow !text-ink/70">Use it</p>
          <div>
            <p className="d-m">{p.cta.label}.</p>
            <span className="btn btn-ink mt-6">{p.cta.label} <span className="arrow" aria-hidden="true">→</span></span>
          </div>
        </a>
        <Link to="/invest" className="group grain sheet flex min-h-[300px] flex-col justify-between bg-ink p-8 text-paper md:p-12" data-reveal=".08">
          <p className="eyebrow !text-paper/60">Back it</p>
          <div>
            <p className="d-m max-w-[14ch]">Talk to us about {p.name}.</p>
            <span className="btn btn-orange mt-6">Invest in Labs <span className="arrow" aria-hidden="true">→</span></span>
          </div>
        </Link>
      </section>

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
