import { useRef } from "react";
import { Link } from "react-router-dom";
import Patch from "@/components/patches/Patch";
import { products, STAGES, type ProductSlug } from "@/content/products";
import { gsap, useMotion } from "@/lib/motion";


/** "Where everything stands." The track draws itself, then each patch is sewn on at its stage. */
export default function StageTrack({ compact = false, highlight }: { compact?: boolean; highlight?: ProductSlug }) {
  const root = useRef<HTMLDivElement>(null);

  useMotion(root, (r) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: r, start: "top 72%", once: true } });
    tl.from(r.querySelectorAll(".track-line"), { scaleX: 0, scaleY: 0, duration: 1.6, ease: "power3.inOut" })
      .from(r.querySelectorAll(".track-dot"), { scale: 0, duration: 0.5, stagger: 0.18, ease: "back.out(3)" }, 0.1)
      .from(r.querySelectorAll(".track-copy"), { y: 20, opacity: 0, duration: 0.8, stagger: 0.12, ease: "expo.out" }, 0.25)
      .from(r.querySelectorAll(".track-patch"), { y: -60, rotate: -25, opacity: 0, duration: 0.9, stagger: 0.1, ease: "bounce.out" }, 0.5)
      .from(r.querySelectorAll(".track-slot"), { scale: 0.6, opacity: 0, duration: 0.9, ease: "expo.out" }, 0.9);
  });

  return (
    <div ref={root} className="relative">
      <div className="track-line absolute left-[7px] top-2 h-[calc(100%-16px)] w-px origin-top bg-ink/25 md:left-0 md:right-0 md:top-[7px] md:h-px md:w-auto md:origin-left" aria-hidden="true" />
      <ol className="relative grid gap-10 md:grid-cols-5 md:gap-0">
        {STAGES.map((s, i) => {
          const here = products.filter((p) => p.stage === i);
          const last = i === STAGES.length - 1;
          return (
            <li key={s.name} className="relative pl-9 md:pl-0 md:pr-6 [&:not(:first-child)]:md:border-l md:border-ink/10 md:[&:not(:first-child)]:pl-6">
              <span className={`track-dot absolute left-0 top-0 block h-[15px] w-[15px] rounded-full md:-left-[7.5px] md:first:left-0 ${last ? "border-[1.5px] border-ink bg-paper" : "bg-ink"}`} style={i === 0 ? { left: 0 } : undefined} aria-hidden="true" />
              <div className="track-copy md:pt-10">
                <p className="num text-[13px] text-ink-soft">0{i + 1}</p>
                <p className="mt-1 text-[22px] font-black tracking-tight">{s.name}</p>
                {!compact && <p className="mt-2 max-w-[15rem] text-[14.5px] leading-snug text-ink-soft">{s.line}</p>}
              </div>
              <div className={`flex flex-wrap items-start gap-4 md:mt-6 md:min-h-[120px] ${here.length || last ? "mt-6" : ""}`}>
                {here.map((p) => (
                  <Link key={p.slug} to={`/${p.slug}`} className={`track-patch group flex flex-col items-center gap-2 ${highlight && highlight !== p.slug ? "opacity-40" : ""}`}>
                    <span className="patch patch-shadow block w-[92px] transition-transform duration-700 ease-lab group-hover:-translate-y-1.5 group-hover:-rotate-6">
                      <Patch slug={p.slug} />
                    </span>
                    <span className="text-[13px] font-bold">{p.name}</span>
                  </Link>
                ))}
                {last && (
                  <div className="track-slot grid h-[112px] w-[112px] place-items-center rounded-full border-[1.5px] border-dashed border-sand text-center text-[12.5px] leading-tight text-ink-soft">
                    Next to<br />graduate
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
