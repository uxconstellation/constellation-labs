import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LabsMark from "@/components/brand/LabsMark";
import Liquid, { PALETTES } from "@/components/brand/Liquid";
import Patch from "@/components/patches/Patch";
import Cta from "@/components/ui/Cta";
import { products, statusDot } from "@/content/products";
import { gsap, prefersReduced, useMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const GlassMarkScene = lazy(() => import("@/components/three/GlassMarkScene"));
const hasWebGL = () => {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
};

const TILT = (-14 * Math.PI) / 180;
const PERIOD = 64; // seconds per orbit

/**
 * The approved comp: "Made in Labs." beside the glass mark, with the four product
 * patches orbiting it on the satin ring's ellipse. Patches in front pass over the glass,
 * patches behind pass under it. Hover one to stop the orbit and read it.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const patchEls = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hover;
  const webgl = useMemo(hasWebGL, []);
  const [glassReady, setGlassReady] = useState(false);
  const onGlass = useCallback(() => setGlassReady(true), []);
  const reduce = prefersReduced();

  // Orbit: one ticker drives all four patches.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let t = 0.18; // start with the comp's arrangement
    let speed = 1;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const place = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const rx = w * (w < 600 ? 0.38 : 0.47), ry = h * 0.29;
      const cx = w * 0.5, cy = h * 0.5;
      patchEls.current.forEach((p, i) => {
        if (!p) return;
        const th = t * Math.PI * 2 + (i * Math.PI * 2) / patchEls.current.length;
        const ex = Math.cos(th) * rx, ey = Math.sin(th) * ry;
        const x = cx + ex * Math.cos(TILT) - ey * Math.sin(TILT);
        const y = cy + ex * Math.sin(TILT) + ey * Math.cos(TILT);
        const depth = Math.sin(th); // 1 = nearest the viewer
        const s = 0.8 + 0.28 * ((depth + 1) / 2);
        p.style.setProperty("--x", `${x}px`);
        p.style.setProperty("--y", `${y}px`);
        p.style.setProperty("--s", `${s}`);
        p.style.zIndex = depth > -0.05 ? "4" : "1";
        p.dataset.flip = x > w * 0.7 ? "1" : "0"; // keep the label inside the stage
        p.dataset.back = depth > -0.05 ? "0" : "1"; // behind the glass: hide the label
      });
    };
    place();
    if (reduce) {
      const ro = new ResizeObserver(place);
      ro.observe(el);
      return () => { ro.disconnect(); io.disconnect(); };
    }
    const tick = (_: number, dt: number) => {
      if (!visible || document.hidden) return;
      const target = hoverRef.current === null ? 1 : 0;
      speed += (target - speed) * 0.06;
      t += (dt / 1000 / PERIOD) * speed;
      place();
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); io.disconnect(); };
  }, [reduce]);

  useMotion(root, (r) => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(r.querySelectorAll(".hero-line"), { yPercent: 110, duration: 1.4, stagger: 0.12 }, 0.1)
      .from(r.querySelectorAll(".hero-fade"), { y: 24, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.6)
      .from(r.querySelector(".hero-glass"), { scale: 0.86, opacity: 0, duration: 1.8 }, 0.2)
      .from(r.querySelector(".hero-ring"), { scale: 0.6, opacity: 0, duration: 1.8 }, 0.35)
      .from(r.querySelector(".hero-disc"), { scale: 0.2, opacity: 0, duration: 2.2 }, 0.1)
      .from(r.querySelectorAll(".hero-patch-in"), { scale: 0, rotate: -40, duration: 1.2, stagger: 0.1, ease: "back.out(1.6)" }, 0.75);
    gsap.to(r.querySelector(".hero-stage"), { yPercent: 10, ease: "none", scrollTrigger: { trigger: r, start: "top top", end: "bottom top", scrub: true } });
  });

  return (
    <section ref={root} className="relative overflow-hidden pb-14 pt-[96px] lg:min-h-[100svh] lg:pb-10" aria-labelledby="hero-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 55% at 70% 45%, #fff 0%, transparent 70%)" }} />
      <div className="wrap relative grid items-center gap-4 lg:min-h-[calc(100svh-136px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
        {/* Copy */}
        <div className="relative z-10 order-2 lg:order-1">
          <p className="eyebrow hero-fade">Constellation Labs</p>
          <h1 id="hero-title" className="mt-5" aria-label="Made in Labs.">
            <span className="block overflow-hidden pb-1" aria-hidden="true">
              <span className="hero-line d-l d-light block">Made in</span>
            </span>
            <span className="-mt-[0.06em] block overflow-hidden pb-[0.12em] pr-[0.08em]" aria-hidden="true">
              <span className="hero-line gradient-text block font-black leading-[.82] tracking-[-0.07em]" style={{ fontSize: "clamp(112px, 17vw, 268px)" }}>
                Labs.
              </span>
            </span>
          </h1>
          <p className="hero-fade lede mt-6 max-w-[30rem]">
            Constellation Labs is our studio's product bench. We build tools for the problems we keep hitting on client work, run them on our own projects, then open them up.
          </p>
          <div className="hero-fade mt-8 flex flex-wrap gap-3">
            <Cta href="/invest" variant="ink">Invest in Labs</Cta>
            <Cta href="/build">Have us build yours</Cta>
          </div>
        </div>

        {/* Orbit */}
        <div className="hero-stage relative order-1 mx-auto aspect-[1/0.86] w-full max-w-[760px] lg:order-2 lg:-mr-[2vw]">
          <div ref={stage} className="absolute inset-0">
            <svg className="hero-ring absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
              <ellipse cx="50%" cy="50%" rx="47%" ry="29%" fill="none" stroke="hsl(var(--sand))" strokeWidth="1.5" className="dash-ring" transform-origin="center" style={{ transform: "rotate(-14deg)", transformBox: "fill-box" }} />
            </svg>
            <div className="hero-disc absolute left-1/2 top-1/2 z-[1] aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2">
              <Liquid shape="disc" palette={PALETTES.day} className="h-full w-full" grain={0.14} speed={0.45} resolution={0.7} />
            </div>
            <div className="hero-glass absolute left-1/2 top-1/2 z-[2] aspect-square w-[64%] -translate-x-1/2 -translate-y-1/2">
              <div className="absolute inset-[8%] transition-opacity duration-700" style={{ opacity: glassReady ? 0 : 1 }}>
                <LabsMark className="h-full w-full" title="" />
              </div>
              {webgl && (
                <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: glassReady ? 1 : 0 }}>
                  <Suspense fallback={null}><GlassMarkScene onReady={onGlass} reduceMotion={reduce} /></Suspense>
                </div>
              )}
            </div>
            {products.map((p, i) => (
              <Link
                key={p.slug}
                to={`/${p.slug}`}
                ref={(el) => (patchEls.current[i] = el)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="group absolute left-0 top-0 w-[clamp(64px,17%,132px)]"
                style={{ transform: "translate(calc(var(--x) - 50%), calc(var(--y) - 50%)) scale(var(--s))" }}
                aria-label={`${p.name}, ${p.status}`}
              >
                <span className="hero-patch-in block">
                  <span className="patch patch-shadow block transition-transform duration-700 ease-lab group-hover:-translate-y-2 group-hover:rotate-[-6deg] group-focus-visible:-translate-y-2">
                    <Patch slug={p.slug} />
                  </span>
                </span>
                <span data-orbit-label className={cn("pointer-events-none absolute left-[88%] top-[18%] hidden w-max items-center gap-1.5 rounded-full border border-ink/10 bg-paper px-2.5 py-1 text-[12.5px] font-medium text-ink-soft shadow-[0_4px_14px_-6px_rgba(58,36,16,.35)] transition-[opacity,color] duration-500 ease-lab group-data-[back='1']:opacity-0 group-data-[flip='1']:left-auto group-data-[flip='1']:right-[88%] sm:flex", hover === i && "text-ink")}>
                  <i className="h-1.5 w-1.5 rounded-full" style={{ background: statusDot[p.status] }} />
                  {p.name}, {p.status.toLowerCase()}
                </span>
                <span className={cn("pointer-events-none absolute left-1/2 top-full mt-2 w-[200px] -translate-x-1/2 rounded-2xl bg-ink px-3.5 py-2.5 text-center text-[12.5px] leading-snug text-paper opacity-0 shadow-lift transition-all duration-500 ease-lab", hover === i && "translate-y-1 opacity-100")}>
                  {p.hook}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* On the bench index, as in the comp */}
      <nav aria-label="On the bench" className="hero-fade wrap relative z-10 mt-10 hidden justify-end lg:flex lg:absolute lg:inset-x-0 lg:bottom-10 lg:mt-0">
        <div className="text-right">
          <p className="eyebrow mb-3">On the bench</p>
          <ol className="grid gap-1.5">
            {products.map((p, i) => (
              <li key={p.slug}>
                <Link
                  to={`/${p.slug}`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  className={cn("inline-flex items-baseline gap-4 text-[17px] transition-colors", hover === i ? "text-ink" : "text-ink/75")}
                >
                  <span className="num text-[15px] text-ink-soft">0{i + 1}</span>
                  <span className={cn("transition-transform duration-500 ease-lab", hover === i && "-translate-x-1.5")}>{p.name}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </section>
  );
}
