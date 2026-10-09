import { useRef } from "react";
import { Link } from "react-router-dom";
import Hero from "@/components/home/Hero";
import Shelf from "@/components/cards/Shelf";
import StageTrack from "@/components/home/StageTrack";
import Fork from "@/components/home/Fork";
import Patch from "@/components/patches/Patch";
import Sweep from "@/components/ui/Sweep";
import { useMotion } from "@/lib/motion";

/** Why the lab exists. Each reason points at the venture it produced. */
const WHY = [
  {
    t: "We see the problem first.",
    b: "A studio meets the same friction on project after project. Feedback lost in email threads. Sites clients can't edit. Deals nobody can track.",
    proof: [{ slug: "pinpoints", name: "Pinpoints" }, { slug: "prism", name: "Prism" }, { slug: "acre", name: "Acre" }],
  },
  {
    t: "We are the first customer.",
    b: "Every venture runs on our own studio work before anyone else touches it. If it doesn't earn its place on our projects, it doesn't leave the bench.",
    proof: [],
  },
  {
    t: "The good ones leave home.",
    b: "When a venture proves itself, it graduates into a company of its own, with its own name, team and backers.",
    proof: [],
  },
] as const;

export default function Index() {
  const root = useRef<HTMLDivElement>(null);
  useMotion(root);

  return (
    <div ref={root}>
      <Hero />

      <Shelf />

      <section aria-label="What Labs is" className="wrap py-28 md:py-44">
        <p className="eyebrow text-center" data-reveal>What Labs is</p>
        <Sweep
          className="mx-auto mt-8 max-w-[22ch] text-center text-[clamp(34px,5.2vw,80px)] font-black leading-[1.02] tracking-[-0.045em]"
          text="Labs is the part of Constellation that builds for itself. Every venture here started as a *problem* on client work. Some stay tools. Some become *companies.*"
        />
      </section>

      <section aria-labelledby="why-title" className="wrap pb-24 md:pb-36">
        <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
          <h2 id="why-title" className="d-l" data-reveal>Why we build.</h2>
          <p className="lede" data-reveal=".1">
            Client work pays for the studio. It also shows us, early and often, what tools are missing. Labs is where we make them.
          </p>
        </div>
        <ol className="mt-14 grid gap-3 md:mt-20 md:grid-cols-3">
          {WHY.map((w, i) => (
            <li key={w.t} className="grain sheet flex flex-col bg-cream p-8 md:min-h-[340px] md:p-10" data-reveal={String(i * 0.1)}>
              <span className="num text-[13px] text-ink-soft">0{i + 1}</span>
              <p className="d-s mt-6 max-w-[13ch] md:mt-auto md:pt-10">{w.t}</p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-ink/75">{w.b}</p>
              {w.proof.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2 border-t hairline pt-5">
                  {w.proof.map((x) => (
                    <Link key={x.slug} to={`/${x.slug}`} className="chip hover:border-ink">
                      <span className="patch -ml-1.5 w-5"><Patch slug={x.slug} /></span>
                      {x.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="stand-title" className="wrap pt-10 md:pt-16">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <h2 id="stand-title" className="d-l" data-reveal>How a venture grows.</h2>
          <p className="lede" data-reveal=".1">
            Five stages, and every venture is shown at the one it is really at. Graduation means a home and a company of its own.
          </p>
        </div>
        <div className="mt-16 md:mt-24">
          <StageTrack />
        </div>
      </section>

      <Fork />
    </div>
  );
}
