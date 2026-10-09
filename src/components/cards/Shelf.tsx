import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import VentureCard from "./VentureCard";
import { products, type ProductStatus } from "@/content/products";
import { gsap, useMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Google Labs' experiments shelf, dealt as trading cards. Filter by status, scroll
 * or step through; the last card is always an empty one with your name on it.
 * Scales to any number of ventures.
 */
export default function Shelf() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<ProductStatus | "All">("All");
  const [active, setActive] = useState<string | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const statuses = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.status)))] as const, []);
  const shown = products.filter((p) => filter === "All" || p.status === filter);

  // Touch screens have no hover: the card centred in the row is the active one.
  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(hover: hover)").matches) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && setActive((e.target as HTMLElement).dataset.slug ?? null));
    }, { root: el, threshold: 0.85 });
    el.querySelectorAll("[data-slug]").forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [filter]);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };
  useEffect(onScroll, [filter]);
  const step = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * 340, behavior: "smooth" });

  useMotion(root, (r) => {
    gsap.from(r.querySelectorAll(".deal"), {
      y: 140, rotate: (i) => (i % 2 ? 14 : -14), opacity: 0, duration: 1.2, stagger: 0.09, ease: "expo.out",
      scrollTrigger: { trigger: r.querySelector(".deal-row"), start: "top 85%", once: true },
    });
    r.querySelectorAll<HTMLElement>(".blob").forEach((b, i) => {
      gsap.to(b, { x: i % 2 ? -60 : 70, y: i % 2 ? 40 : -50, rotate: i % 2 ? -25 : 30, duration: 9 + i * 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });
  });

  return (
    <section ref={root} id="bench" aria-labelledby="shelf-title" className="relative scroll-mt-10 overflow-hidden bg-cream py-24 md:py-32">
      {/* Google Labs' floating shapes, in our stage colours */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="blob absolute -left-[8%] top-[34%] h-[46vw] max-h-[620px] w-[46vw] max-w-[620px] rounded-full" style={{ background: "#d2d9c7" }} />
        <span className="blob absolute -right-[6%] top-[4%] h-[34vw] max-h-[480px] w-[34vw] max-w-[480px] rounded-[38%]" style={{ background: "#f0c0a1" }} />
        <span className="blob absolute bottom-[-10%] right-[22%] h-[22vw] max-h-[320px] w-[22vw] max-w-[320px] rounded-[30%]" style={{ background: "#d8d1df" }} />
      </div>

      <div className="wrap relative">
        <p className="eyebrow text-center" data-reveal>The ventures</p>
        <h2 id="shelf-title" className="d-l mt-4 text-center" data-reveal>On the bench.</h2>
        <p className="lede mx-auto mt-5 max-w-[34rem] text-center" data-reveal>
          Every venture gets a card. Each one plays a short loop of the product at work. Open a card for the whole story.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter ventures by stage" data-reveal>
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
              className={cn("h-11 rounded-full px-5 text-[14px] font-bold transition-colors", filter === s ? "bg-ink text-paper" : "bg-paper/70 text-ink hover:bg-paper")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={track}
        onScroll={onScroll}
        className="deal-row no-scrollbar relative mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(16px,calc((100vw-1280px)/2))] pb-16 pt-8 md:gap-8"
      >
        {shown.map((p, i) => (
          <div key={p.slug} data-slug={p.slug} className="deal snap-center" style={{ rotate: `${i % 2 ? 2 : -2.5}deg` }}>
            <VentureCard p={p} active={active === p.slug} onActive={(on) => setActive((a) => (on ? p.slug : a === p.slug ? null : a))} />
          </div>
        ))}
        <div className="deal snap-center" style={{ rotate: `${shown.length % 2 ? 2 : -2.5}deg` }}>
          <Link to="/build" className="group grid aspect-[5/7.05] w-[300px] place-items-center rounded-[24px] border-2 border-dashed border-ink/25 bg-paper/50 p-8 text-center transition-colors hover:border-ink hover:bg-paper sm:w-[320px]">
            <span>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-dashed border-ink/30 text-3xl transition-transform duration-700 ease-lab group-hover:rotate-90" aria-hidden="true">+</span>
              <span className="mt-6 block text-[26px] font-black leading-none tracking-[-0.04em]">Your card here.</span>
              <span className="mt-3 block text-[14px] leading-snug text-ink-soft">Bring us the problem. The studio builds the product.</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="wrap relative flex justify-center gap-3">
        <button type="button" aria-label="Previous cards" disabled={edges.start} onClick={() => step(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-ink/20 bg-paper/70 transition hover:border-ink disabled:opacity-30">←</button>
        <button type="button" aria-label="Next cards" disabled={edges.end} onClick={() => step(1)} className="grid h-12 w-12 place-items-center rounded-full border border-ink/20 bg-paper/70 transition hover:border-ink disabled:opacity-30">→</button>
      </div>
    </section>
  );
}
