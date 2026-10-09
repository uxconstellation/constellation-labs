import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollTrigger } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Acre's experiment, run by scrolling: one deal advances from Listed to Sold and
 * every party's view of it changes in step. Names and the address are invented.
 */
const STEPS = [
  { name: "Listed", line: "12 Protea Lane goes live. Viewings book themselves." },
  { name: "Offer", line: "An offer lands. Everyone sees it at the same moment." },
  { name: "FICA", line: "Every party verifies in the app. No copies on email." },
  { name: "Transfer", line: "Signed documents go to the conveyancer, then the Deeds Office." },
  { name: "Sold", line: "Registered. Keys change hands. The room keeps the record." },
];

const PARTIES = [
  { i: "TM", name: "Thandi M.", role: "Agent", c: "#FE6E36", says: ["Listing published", "Offer received", "All parties verified", "Pack sent to conveyancer", "Deal closed"] },
  { i: "PV", name: "Pieter V.", role: "Owner", c: "#2F6B4F", says: ["Asking price set", "Reviewing the offer", "FICA verified", "Transfer signed", "Sold"] },
  { i: "AN", name: "Aisha N.", role: "Buyer", c: "#8C7B5E", says: ["Viewing booked, Sat 10:00", "Offer sent", "FICA verified", "Transfer signed", "Keys collected"] },
  { i: "LK", name: "Lerato K.", role: "Conveyancer", c: "#173F3F", says: ["Waiting for an offer", "Offer to purchase drafted", "FICA verified", "Lodged at the Deeds Office", "Registered"] },
];

export default function AcreDeal() {
  const track = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el, start: "top top", end: "bottom bottom",
      onUpdate: ({ progress: p }) => { setProgress(p); setStep(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length))); },
    });
    return () => st.kill();
  }, []);

  return (
    <div ref={track} className="relative" style={{ height: `${STEPS.length * 70 + 40}svh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center py-20">
        <div className="wrap grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">Scroll to run the deal</p>
            <div className="relative mt-4 h-[1em] overflow-hidden text-[clamp(56px,8vw,128px)] font-black leading-[.85] tracking-[-0.06em]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={step} className="absolute left-0 top-0" initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                  {STEPS[step].name}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="lede mt-2 min-h-[3.2em] max-w-[26rem]" aria-live="polite">{STEPS[step].line}</p>
            <ol className="mt-8 flex gap-1.5" aria-label="Deal progress">
              {STEPS.map((s, i) => (
                <li key={s.name} className="flex-1">
                  <span className="block h-1.5 overflow-hidden rounded-full bg-ink/10">
                    <span className="block h-full origin-left rounded-full bg-ink" style={{ transform: `scaleX(${Math.max(0, Math.min(1, progress * STEPS.length - i))})` }} />
                  </span>
                  <span className={cn("mt-2 block text-[12px] font-bold transition-colors", i <= step ? "text-ink" : "text-ink/40")}>{s.name}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-2 gap-2.5 md:gap-3">
            {PARTIES.map((p) => (
              <div key={p.role} className="rounded-[20px] border border-ink/10 bg-[#FCFAF6]/90 p-4 shadow-lift backdrop-blur md:p-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: p.c }}>{p.i}</span>
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[14px] font-bold">{p.name}</span>
                    <span className="block text-[12px] text-ink-soft">{p.role}</span>
                  </span>
                  {step >= 2 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto shrink-0 rounded-full bg-[#2F6B4F]/10 px-2 py-0.5 text-[11px] font-bold text-[#24563F]" aria-label="FICA verified"><span className="hidden sm:inline">FICA </span>✓</motion.span>
                  )}
                </div>
                <div className="relative mt-4 h-[2.8em] overflow-hidden text-[clamp(15px,1.4vw,19px)] font-bold leading-tight tracking-[-0.01em]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.p key={step} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                      {p.says[step]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            ))}
            <div className="col-span-2 flex items-center justify-between rounded-[20px] bg-ink px-5 py-4 text-paper">
              <span className="text-[14px]">12 Protea Lane, George</span>
              <span className={cn("rounded-full px-3 py-1 text-[12px] font-bold transition-colors duration-500", step === 4 ? "bg-orange text-ink" : "bg-paper/15")}>{step === 4 ? "Sold" : "In progress"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
