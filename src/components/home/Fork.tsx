import { useState } from "react";
import { Link } from "react-router-dom";
import Patch from "@/components/patches/Patch";
import Liquid, { PALETTES } from "@/components/brand/Liquid";
import { products } from "@/content/products";
import { cn } from "@/lib/utils";

/**
 * Two doors, from the approved comp. On desktop the door you lean towards opens wider.
 * Invest shows the four patches fanned like a hand of cards; Build shows an empty
 * patch outline that sews itself in when you hover.
 */
export default function Fork({ title = "Two ways in." }: { title?: string }) {
  const [lean, setLean] = useState<"invest" | "build" | null>(null);

  return (
    <section aria-labelledby="fork-title" className="wrap py-24 md:py-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 id="fork-title" className="d-l" data-reveal>{title}</h2>
        <p className="lede max-w-[24rem]" data-reveal=".1">Back what we make next, or have the same team make yours.</p>
      </div>

      <div className="mt-12 flex flex-col gap-3 md:mt-16 lg:h-[600px] lg:flex-row" onMouseLeave={() => setLean(null)}>
        <Link
          to="/invest"
          onMouseEnter={() => setLean("invest")}
          onFocus={() => setLean("invest")}
          className={cn(
            "group grain sheet relative flex min-h-[460px] flex-col overflow-hidden bg-ink p-7 text-paper transition-[flex-grow] duration-[900ms] ease-lab md:p-12 lg:min-h-0",
            lean === "build" ? "lg:flex-[0.8]" : lean === "invest" ? "lg:flex-[1.35]" : "lg:flex-1",
          )}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-[18%] -top-[28%] aspect-square w-[95%] opacity-90 transition-transform duration-[1200ms] ease-lab group-hover:scale-110">
            <Liquid shape="disc" palette={PALETTES.night} bg="#160C15" grain={0.12} className="h-full w-full" />
          </div>
          <p className="eyebrow relative !text-paper/60">For investors</p>
          <p className="d-m relative mt-5 max-w-[9ch]">Back the next one.</p>
          <p className="relative mt-5 max-w-[22rem] text-[16px] leading-relaxed text-paper/75">
            Each product is a company in waiting. See what is on the bench, what each one needs, and what comes next.
          </p>
          <span className="btn btn-orange relative mt-auto w-fit">
            Invest in Labs <span className="arrow" aria-hidden="true">→</span>
          </span>
          <div className="pointer-events-none absolute -bottom-16 right-[-2%] h-[60%] w-[60%]" aria-hidden="true">
            {products.map((p, i) => (
              <span
                key={p.slug}
                className="patch patch-shadow absolute bottom-0 left-1/2 w-[44%] origin-bottom transition-transform duration-[900ms] ease-lab"
                style={{
                  transform: `translateX(-50%) rotate(${(i - 1.5) * (lean === "invest" ? 19 : 12)}deg) translateY(${lean === "invest" ? -24 : 0}px)`,
                  transitionDelay: `${i * 40}ms`,
                }}
              >
                <Patch slug={p.slug} />
              </span>
            ))}
          </div>
        </Link>

        <Link
          to="/build"
          onMouseEnter={() => setLean("build")}
          onFocus={() => setLean("build")}
          className={cn(
            "group grain sheet relative flex min-h-[460px] flex-col overflow-hidden bg-cream p-7 transition-[flex-grow] duration-[900ms] ease-lab md:p-12 lg:min-h-0",
            lean === "invest" ? "lg:flex-[0.8]" : lean === "build" ? "lg:flex-[1.35]" : "lg:flex-1",
          )}
        >
          <Liquid palette={PALETTES.ember} bg="#F3EEE7" wash={0.6} grain={0.11} speed={0.3} scale={2} resolution={0.5} className="absolute inset-0 h-full w-full" />
          <p className="eyebrow relative">For teams</p>
          <p className="d-m relative mt-5 max-w-[11ch]">Have the studio build yours.</p>
          <p className="relative mt-5 max-w-[22rem] text-[16px] leading-relaxed text-ink/80">
            Labs is what Constellation makes for itself. The same people design and build websites, apps and products for clients.
          </p>
          <span className="btn btn-ink relative mt-auto w-fit">
            Start a build <span className="arrow" aria-hidden="true">→</span>
          </span>
          <div className="pointer-events-none absolute bottom-8 right-8 w-[clamp(130px,30%,220px)] md:bottom-12 md:right-12" aria-hidden="true">
            <svg viewBox="0 0 200 200" className="w-full overflow-visible">
              <circle cx="100" cy="100" r="92" fill="none" stroke="hsl(var(--sand))" strokeWidth="1.6" strokeDasharray="5 6" />
              <circle
                cx="100" cy="100" r="92" fill="none" stroke="hsl(var(--orange))" strokeWidth="5" strokeLinecap="round"
                pathLength={1} strokeDasharray="1" transform="rotate(-90 100 100)"
                className="transition-[stroke-dashoffset] duration-[1400ms] ease-lab"
                style={{ strokeDashoffset: lean === "build" ? 0 : 1 }}
              />
              <text x="100" y="96" textAnchor="middle" fontFamily="Satoshi" fontSize="15" fontWeight="500" fill="hsl(var(--ink-soft))">Your patch</text>
              <text x="100" y="116" textAnchor="middle" fontFamily="Satoshi" fontSize="15" fontWeight="500" fill="hsl(var(--ink-soft))">goes here</text>
            </svg>
          </div>
        </Link>
      </div>
    </section>
  );
}
