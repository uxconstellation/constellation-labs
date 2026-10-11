import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Nod's experiment, in your hand: you are checked in at a made-up workspace.
 * Set your status, send someone a nod, and if they nod back you're connected.
 */
const PEOPLE = [
  { id: "sam", name: "Sam", does: "Product designer", open: true, c: "#C8753A" },
  { id: "lee", name: "Lee", does: "Developer", open: false, c: "#173F3F" },
  { id: "ava", name: "Ava", does: "Founder, food startup", open: true, c: "#8B2252" },
];

export default function NodRoom() {
  const [open, setOpen] = useState(true);
  const [sent, setSent] = useState<string | null>(null);
  const [mutual, setMutual] = useState<string | null>(null);

  useEffect(() => {
    if (!sent) return;
    const t = window.setTimeout(() => setMutual(sent), 1600);
    return () => window.clearTimeout(t);
  }, [sent]);

  const reset = () => { setSent(null); setMutual(null); };
  const who = PEOPLE.find((p) => p.id === mutual);
  const today = new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long" });

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
      <ol className="order-2 grid gap-6 lg:order-1">
        {[
          ["Scan the table", "The code on your table checks you in."],
          ["Say how you're working", "Open to chat, or working quietly. Quiet means nobody can nod at you."],
          ["Send a nod", "A small signal, nothing more. If it's mutual, you're connected."],
        ].map(([t, b], i) => (
          <li key={t} className="grid grid-cols-[40px_1fr] gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-ink/20 text-[13px] font-bold">{i + 1}</span>
            <span><span className="block text-[19px] font-black tracking-[-0.02em]">{t}</span><span className="mt-1 block text-[15px] leading-relaxed text-ink/75">{b}</span></span>
          </li>
        ))}
      </ol>

      {/* The phone */}
      <div className="order-1 mx-auto w-[300px] rounded-[44px] bg-ink p-3 shadow-float lg:order-2">
        <div className="relative h-[580px] overflow-hidden rounded-[34px] bg-[#FCFAF6]">
          <div className="mx-auto mt-2 h-6 w-28 rounded-full bg-ink" aria-hidden="true" />
          <div className="px-5 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-ink-soft">Checked in</p>
            <p className="text-[24px] font-black tracking-[-0.04em]">The Workroom</p>
            <button
              type="button"
              role="switch"
              aria-checked={open}
              onClick={() => { setOpen((v) => !v); reset(); }}
              className={cn("mt-4 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors duration-500", open ? "bg-[#9A5526] text-paper" : "bg-mist text-ink")}
            >
              <span><span className="block text-[15px] font-bold">{open ? "Open to chat" : "Working quietly"}</span><span className="block text-[12px] opacity-90">Tap to change</span></span>
              <span className={cn("relative inline-block h-6 w-11 shrink-0 rounded-full transition-colors", open ? "bg-paper/40" : "bg-ink/20")}><span data-knob className={cn("absolute left-0 top-1 h-4 w-4 rounded-full bg-paper transition-transform duration-500 ease-lab", open ? "translate-x-6" : "translate-x-1")} /></span>
            </button>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[.18em] text-ink-soft">Here now</p>
            <ul className="mt-2 grid gap-2">
              {PEOPLE.map((p) => {
                const can = open && p.open && !sent;
                return (
                  <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper p-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[14px] font-bold text-paper" style={{ background: p.c }}>{p.name[0]}</span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block text-[15px] font-bold">{p.name}</span>
                      <span className="block truncate text-[12px] text-ink-soft">{p.open ? p.does : "Working quietly"}</span>
                    </span>
                    <button
                      type="button"
                      disabled={!can}
                      onClick={() => setSent(p.id)}
                      className={cn("rounded-full px-3 py-1.5 text-[12.5px] font-bold transition-colors", sent === p.id ? "bg-[#9A5526] text-paper" : "bg-ink text-paper disabled:bg-ink/10 disabled:text-ink/50")}
                    >
                      {sent === p.id ? "Nod sent" : "Nod"}
                    </button>
                  </li>
                );
              })}
            </ul>
            {!open && <p className="mt-3 text-[12.5px] text-ink-soft">You're working quietly, so nods are off both ways.</p>}
          </div>

          <AnimatePresence>
            {sent && !mutual && (
              <motion.span key="fly" aria-hidden="true" className="absolute left-[calc(50%-28px)] top-1/2 grid h-14 w-14 place-items-center rounded-full bg-[#9A5526] text-2xl text-paper shadow-lift"
                initial={{ y: 40, scale: 0.4, opacity: 0 }} animate={{ y: [40, -60, 40], scale: [0.4, 1.1, 1], opacity: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 1.4, ease: "easeInOut" }}>
                ✓
              </motion.span>
            )}
            {who && (
              <motion.div key="mutual" className="absolute inset-x-0 bottom-0 rounded-t-[30px] bg-ink p-6 text-paper" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} role="status">
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-paper/90">It's mutual</p>
                <p className="mt-1 text-[26px] font-black leading-tight tracking-[-0.04em]">You and {who.name}</p>
                <p className="mt-2 text-[13.5px] text-paper/90">The Workroom · {today}, saved</p>
                <button type="button" onClick={reset} className="btn btn-orange btn-sm mt-5 w-full">Nod again</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
