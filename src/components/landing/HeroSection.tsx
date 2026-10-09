import { lazy, Suspense, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PrimaryButton from "@/components/landing/PrimaryButton";
import BlurText from "@/components/reactbits/BlurText";
import LabsMark from "@/components/brand/LabsMark";
import clouds from "@/assets/cloud-layer-v3.webp";
import { LINKS } from "@/content/products";

gsap.registerPlugin(ScrollTrigger);
const GlassMarkScene = lazy(() => import("@/components/three/GlassMarkScene"));
const hasWebGL = () => {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
};

/**
 * Duplicated from the Constellation hero: same campaign title, cloud layers and scroll parallax.
 * Deviation: daylight instead of night, and the 3D Labs glass floats where the astronaut does.
 */
export default function HeroSection({ ready = true }: { ready?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const webgl = useMemo(hasWebGL, []);
  const [glassReady, setGlassReady] = useState(false);
  const onGlass = useCallback(() => setGlassReady(true), []);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useLayoutEffect(() => {
    const el = root.current;
    let visible = true;
    const update = () => el?.classList.toggle("hero-motion-paused", !visible || document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    if (el) observer.observe(el);
    document.addEventListener("visibilitychange", update);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.to(".hero-astronaut-motion", { yPercent: 16, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1 } });
        gsap.to(".hero-cloud-back", { yPercent: 18, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1.5 } });
        gsap.to(".hero-cloud-front", { yPercent: -8, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1 } });
      }, root);
      return () => ctx.revert();
    });
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); media.revert(); };
  }, []);

  const scrollToProducts = () => document.getElementById("products")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });

  return (
    <section ref={root} className={`landing-hero labs-hero ${ready ? "hero-ready" : ""}`}>
      <div className="hero-atmosphere" aria-hidden="true" />
      <div className="hero-cloud-back hero-cloud-layer" aria-hidden="true"><img src={clouds} alt="" width="2048" height="768" /></div>
      <div className="hero-astronaut-motion labs-glass" aria-hidden="true">
        <div className="hero-astronaut-float labs-glass-float">
          <div className="labs-glass-fallback" style={{ opacity: glassReady ? 0 : 1 }}><LabsMark className="h-full w-full" title="" /></div>
          {webgl && (
            <div className="labs-glass-canvas" style={{ opacity: glassReady ? 1 : 0 }}>
              <Suspense fallback={null}><GlassMarkScene onReady={onGlass} reduceMotion={reduce} /></Suspense>
            </div>
          )}
        </div>
      </div>
      <div className="hero-cloud-front hero-cloud-layer" aria-hidden="true"><img src={clouds} alt="" width="2048" height="768" /></div>
      <div className="landing-container relative z-20">
        <div className="hero-copy">
          <p className="landing-eyebrow">Constellation Labs</p>
          <h1 className="campaign-title" aria-label="Made in Labs.">
            <BlurText text="Made in" ready={ready} className="campaign-title-lead" />
            <span className="campaign-title-yours">Labs.</span>
          </h1>
          <p className="hero-description">
            The products our studio built for itself. Tested on real client work first, then opened up to everyone.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <PrimaryButton onClick={scrollToProducts}>Explore the products</PrimaryButton>
            <a className="landing-pill" href={LINKS.studio} target="_blank" rel="noopener noreferrer">Visit the studio</a>
          </div>
        </div>
      </div>
    </section>
  );
}
