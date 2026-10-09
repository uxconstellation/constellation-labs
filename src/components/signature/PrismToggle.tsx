import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Prism's experiment: the code on the left, the live page on the right.
 * Turn Prism on and the page becomes editable in place. Edit anything, and the
 * code panel does not change by a single line. The bakery is made up.
 */
const IMAGES = [
  { name: "Loaf", bg: "linear-gradient(150deg,#f3c9a8,#e9c39e)", shape: "rounded-[50%_50%_40%_40%] bg-[#C47A3A] w-[58%] h-[38%]" },
  { name: "Croissant", bg: "linear-gradient(150deg,#d8d1df,#f3c9a8)", shape: "rounded-[60%_60%_20%_20%] bg-[#D9902F] w-[62%] h-[30%] rotate-[-8deg]" },
  { name: "Tart", bg: "linear-gradient(150deg,#b3d3c6,#f3eee7)", shape: "rounded-full bg-[#8B2252] w-[46%] h-[46%] ring-[10px] ring-[#E9C39E]" },
];

const CODE = [
  ["k", "export default function"], ["f", " Hero"], ["p", "() {"],
  ["n", ""], ["p", "  const c = "], ["f", "usePrism"], ["p", '("hero");'],
  ["n", ""], ["p", "  return ("], ["n", ""],
  ["t", '    <section className="hero">'], ["n", ""],
  ["t", "      <h1>{c.title}</h1>"], ["n", ""],
  ["t", "      <p>{c.body}</p>"], ["n", ""],
  ["t", "      <img src={c.image} />"], ["n", ""],
  ["t", "    </section>"], ["n", ""], ["p", "  );"], ["n", ""], ["p", "}"],
] as const;

export default function PrismToggle() {
  const [on, setOn] = useState(false);
  const [img, setImg] = useState(0);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const edits = touched.size;
  const [published, setPublished] = useState(false);
  const bump = (what: string) => () => { setTouched((t) => new Set(t).add(what)); setPublished(false); };
  const editable = (extra = "") => cn("rounded-md outline-none transition-[box-shadow] duration-500", on && "shadow-[0_0_0_1.5px_#7C8CF0] focus:shadow-[0_0_0_2px_#5B4B8A]", extra);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => setOn((v) => !v)}
          className="inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-5 text-[15px] font-bold text-paper"
        >
          <span className={cn("relative inline-block h-7 w-12 shrink-0 rounded-full transition-colors duration-500", on ? "bg-[#7C8CF0]" : "bg-paper/25")}>
            <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-paper transition-transform duration-500 ease-lab", on ? "translate-x-6" : "translate-x-1")} />
          </span>
          Prism {on ? "on" : "off"}
        </button>
        <span className="text-[14.5px] text-ink/80">{on ? "Click the words to edit them. Swap the image. Then publish." : "Switch Prism on to edit the page."}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
        {/* Code: never changes */}
        <div className="flex flex-col overflow-hidden rounded-[22px] bg-ink text-paper shadow-float">
          <div className="flex items-center justify-between border-b border-paper/10 px-5 py-3 text-[12.5px]">
            <span className="font-bold">Hero.tsx</span>
            <span className="text-paper/90">commit a3f9c1</span>
          </div>
          <pre className="flex-1 overflow-x-auto px-5 py-5 font-mono text-[13px] leading-[1.75]">
            {CODE.map(([k, t], i) => k === "n" ? <br key={i} /> : (
              <span key={i} className={k === "k" ? "text-[#F3A27C]" : k === "f" ? "text-[#9EDCC6]" : k === "t" ? "text-[#C9C2F5]" : "text-paper/90"}>{t}</span>
            ))}
          </pre>
          <div className="flex items-center gap-2 border-t border-paper/10 px-5 py-3 text-[13px]" aria-live="polite">
            <span className="h-2 w-2 rounded-full bg-[#52B788]" />
            <span>{edits} of 3 things changed on the page · 0 lines changed in the code</span>
          </div>
        </div>

        {/* Live page */}
        <div className="overflow-hidden rounded-[22px] border border-ink/10 bg-[#FCFAF6] shadow-float">
          <div className="flex h-10 items-center gap-1.5 border-b border-ink/10 bg-mist px-4">
            <i className="h-2.5 w-2.5 rounded-full bg-sand/60" /><i className="h-2.5 w-2.5 rounded-full bg-sand/60" /><i className="h-2.5 w-2.5 rounded-full bg-sand/60" />
            <span className="ml-3 rounded-full bg-paper px-3 py-0.5 text-[12px] text-ink-soft">crumb-bakery.example</span>
            <button
              type="button"
              disabled={!on || !edits || published}
              onClick={() => setPublished(true)}
              className={cn("ml-auto rounded-full px-3 py-1 text-[12px] font-bold transition-colors", published ? "bg-[#2F6B4F] text-paper" : "bg-ink text-paper disabled:opacity-30")}
            >
              {published ? "Published ✓" : "Publish"}
            </button>
          </div>
          <div className="grid gap-6 p-7 md:grid-cols-[1.1fr_.9fr] md:p-10">
            <div className="flex flex-col justify-center">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-ink-soft">Crumb, a made-up bakery</p>
              <h3 contentEditable={on} suppressContentEditableWarning onInput={bump("headline")} aria-label="Headline" className={editable("mt-3 text-[clamp(30px,3.4vw,46px)] font-black leading-[1] tracking-[-0.04em]")}>
                Fresh bread, baked daily.
              </h3>
              <p contentEditable={on} suppressContentEditableWarning onInput={bump("intro")} aria-label="Intro" className={editable("mt-4 max-w-[22rem] text-[15px] leading-relaxed text-ink-soft")}>
                Open from six. Sourdough until it runs out.
              </p>
            </div>
            <div className="relative">
              <div className={cn("relative grid aspect-[4/3.4] place-items-center overflow-hidden rounded-2xl transition-[box-shadow] duration-500", on && "shadow-[0_0_0_1.5px_#7C8CF0]")} style={{ background: IMAGES[img].bg }} role="img" aria-label={`${IMAGES[img].name} illustration`}>
                <AnimatePresence mode="wait">
                  <motion.span key={img} className={cn("block shadow-lift", IMAGES[img].shape)} initial={{ scale: 0.6, opacity: 0, rotate: -12 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
                </AnimatePresence>
              </div>
              {on && (
                <button type="button" onClick={() => { setImg((i) => (i + 1) % IMAGES.length); bump("image")(); }} className="absolute bottom-3 right-3 rounded-full bg-ink px-3.5 py-1.5 text-[12.5px] font-bold text-paper">
                  Swap image
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
