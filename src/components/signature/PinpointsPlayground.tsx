import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Pinpoints' experiment, run by hand: drop a pin on a (made-up) website, rewrite
 * its headline, recolour its button, and send it. The suggestion becomes an
 * approval card; the site's code is never touched.
 */
const ORIGINAL = "Welcome to our website.";
const SWATCHES = [
  { name: "Ink", v: "#160C15", text: "#FBF8F3" },
  { name: "Orange", v: "#FE6E36", text: "#160C15" },
  { name: "Teal", v: "#173F3F", text: "#FBF8F3" },
  { name: "Green", v: "#2F6B4F", text: "#FBF8F3" },
];

type Phase = "pin" | "edit" | "sent" | "approved";

export default function PinpointsPlayground() {
  const site = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const [phase, setPhase] = useState<Phase>("pin");
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [copy, setCopy] = useState(ORIGINAL);
  const [swatch, setSwatch] = useState(0);

  const drop = (e: React.MouseEvent) => {
    if (phase !== "pin") return;
    const r = site.current!.getBoundingClientRect();
    setPin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    setPhase("edit");
    window.setTimeout(() => headline.current?.focus(), 350);
  };
  const reset = () => { setPhase("pin"); setPin(null); setCopy(ORIGINAL); setSwatch(0); if (headline.current) headline.current.textContent = ORIGINAL; };
  const edits = [copy.trim() !== ORIGINAL && "Headline rewritten", swatch !== 0 && `Button made ${SWATCHES[swatch].name.toLowerCase()}`].filter(Boolean) as string[];
  const sw = SWATCHES[swatch];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
      {/* The made-up website under review */}
      <div className="overflow-hidden rounded-[22px] border border-ink/10 bg-[#FCFAF6] shadow-float">
        <div className="flex h-10 items-center gap-1.5 border-b border-ink/10 bg-mist px-4">
          <i className="h-2.5 w-2.5 rounded-full bg-sand/60" /><i className="h-2.5 w-2.5 rounded-full bg-sand/60" /><i className="h-2.5 w-2.5 rounded-full bg-sand/60" />
          <span className="ml-3 rounded-full bg-paper px-3 py-0.5 text-[12px] text-ink-soft">tablefor2.example</span>
          <span className="ml-auto rounded-full bg-orange px-2.5 py-0.5 text-[11px] font-bold">Pinpoints on</span>
        </div>
        <div
          ref={site}
          onClick={drop}
          className={cn("relative grid min-h-[380px] gap-6 p-7 md:min-h-[420px] md:grid-cols-[1.1fr_.9fr] md:p-10", phase === "pin" && "cursor-crosshair")}
          role={phase === "pin" ? "button" : undefined}
          tabIndex={phase === "pin" ? 0 : undefined}
          aria-label={phase === "pin" ? "Drop a pin on the website" : undefined}
          onKeyDown={(e) => { if (phase === "pin" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setPin({ x: 30, y: 30 }); setPhase("edit"); window.setTimeout(() => headline.current?.focus(), 350); } }}
        >
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-ink-soft">Table for Two, a made-up bistro</p>
            <h3
              ref={headline}
              contentEditable={phase === "edit"}
              suppressContentEditableWarning
              onInput={(e) => setCopy(e.currentTarget.textContent ?? "")}
              aria-label="Headline, editable after you drop a pin"
              className={cn("mt-3 rounded-lg font-serif text-[clamp(30px,3.6vw,48px)] font-bold leading-[1.02] tracking-[-0.02em] outline-none transition-[box-shadow] duration-500", phase === "edit" && "shadow-[0_0_0_2px_#FE6E36]")}
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {ORIGINAL}
            </h3>
            <p className="mt-4 max-w-[22rem] text-[15px] leading-relaxed text-ink-soft">Seasonal plates, a short wine list, and a table by the window.</p>
            <span className="mt-6 inline-flex w-fit rounded-full px-5 py-2.5 text-[14px] font-bold transition-colors duration-500" style={{ background: sw.v, color: sw.text }}>Book a table</span>
          </div>
          <div className="relative hidden overflow-hidden rounded-2xl md:block" style={{ background: "linear-gradient(160deg,#f0c0a1,#e9c39e 55%,#d2d9c7)" }} aria-hidden="true">
            <div className="absolute bottom-[18%] left-1/2 h-[42%] w-[62%] -translate-x-1/2 rounded-[50%] bg-[#FCFAF6] shadow-lift" />
            <div className="absolute bottom-[30%] left-1/2 h-[18%] w-[30%] -translate-x-1/2 rounded-[50%] bg-[#C43E1A]/80" />
          </div>

          <AnimatePresence>
            {pin && (
              <motion.span
                className="pointer-events-none absolute z-10 -ml-4 -mt-10 block h-10 w-8"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 14 }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 32 40"><path d="M16 39 C9 29 2 22 2 14 A14 14 0 1 1 30 14 C30 22 23 29 16 39Z" fill="#FE6E36" stroke="#160C15" strokeWidth="2" /><circle cx="16" cy="14" r="5" fill="#FBF8F3" /></svg>
              </motion.span>
            )}
          </AnimatePresence>
          {phase === "pin" && (
            <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 animate-pulse rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-paper">Click anywhere to drop a pin</span>
          )}
        </div>
      </div>

      {/* The Pinpoints panel */}
      <div className="flex flex-col rounded-[22px] bg-ink p-6 text-paper shadow-float md:p-7">
        <p className="text-[12px] font-bold uppercase tracking-[.2em] text-paper/90">Your feedback</p>
        <AnimatePresence mode="wait">
          {phase === "pin" && (
            <motion.p key="a" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 text-[22px] font-black leading-tight tracking-[-0.03em]">
              Drop a pin on the thing you want changed.
            </motion.p>
          )}
          {phase === "edit" && (
            <motion.div key="b" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 flex flex-1 flex-col">
              <p className="text-[22px] font-black leading-tight tracking-[-0.03em]">Now show it. Rewrite the headline, recolour the button.</p>
              <fieldset className="mt-6">
                <legend className="text-[12px] font-bold uppercase tracking-[.16em] text-paper/90">Button colour</legend>
                <div className="mt-3 flex gap-2.5">
                  {SWATCHES.map((s, i) => (
                    <button key={s.name} type="button" aria-label={s.name} aria-pressed={swatch === i} onClick={() => setSwatch(i)} className={cn("h-10 w-10 rounded-full border-2 transition-transform hover:scale-110", swatch === i ? "scale-110 border-paper" : "border-paper/20")} style={{ background: s.v }} />
                  ))}
                </div>
              </fieldset>
              <button type="button" disabled={!edits.length} onClick={() => setPhase("sent")} className="btn btn-orange mt-auto w-full disabled:opacity-40">Send suggestion <span className="arrow" aria-hidden="true">→</span></button>
            </motion.div>
          )}
          {(phase === "sent" || phase === "approved") && (
            <motion.div key="c" initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="mt-5 flex flex-1 flex-col">
              <div className="rounded-2xl bg-paper p-4 text-ink">
                <p className="text-[12px] font-bold uppercase tracking-[.16em] text-ink-soft">Suggestion · {edits.length} edit{edits.length > 1 ? "s" : ""}</p>
                <ul className="mt-3 grid gap-2 text-[14.5px] font-bold">{edits.map((e) => <li key={e} className="flex items-center gap-2"><i className="h-1.5 w-1.5 rounded-full bg-orange" />{e}</li>)}</ul>
                <button type="button" onClick={() => setPhase("approved")} disabled={phase === "approved"} className={cn("btn btn-sm mt-4 w-full", phase === "approved" ? "bg-[#2F6B4F] text-paper" : "btn-ink")}>
                  {phase === "approved" ? "Approved ✓" : "Approve"}
                </button>
              </div>
              <p className="mt-4 text-[14px] text-paper/90" aria-live="polite">{phase === "approved" ? "Approved. The site's code was never touched." : "Waiting for the developer to approve."}</p>
              <button type="button" onClick={reset} className="mt-auto pt-6 text-left text-[13px] font-bold text-paper/90 underline-offset-4 hover:underline">Run it again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
