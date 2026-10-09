import { useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import Patch from "@/components/patches/Patch";
import { SCENES } from "@/components/scenes";
import { products, statusDot, STAGES, type Product } from "@/content/products";
import { cn } from "@/lib/utils";
import grain from "@/assets/card-grain-v3.webp";

/**
 * A venture as an illustrated trading card. Stage colour frame, the embroidered
 * patch as card art, a type line, the stage as pips. Tilts toward the cursor with a
 * foil sheen; when the card is active its art window plays the product's motion piece.
 * Everything comes from the product entry, so a new venture is a new card for free.
 */
export default function VentureCard({ p, active = false, onActive, className, style }: { p: Product; active?: boolean; onActive?: (on: boolean) => void; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, mx: 50, my: 50, on: false });
  const ScenePiece = (SCENES as Record<string, (typeof SCENES)[keyof typeof SCENES] | undefined>)[p.slug];
  const no = String(products.indexOf(p) + 1).padStart(2, "0");
  const total = String(products.length).padStart(2, "0");

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    setTilt({ x: (0.5 - py) * 14, y: (px - 0.5) * 16, mx: px * 100, my: py * 100, on: true });
  };

  return (
    <Link
      ref={ref}
      to={`/${p.slug}`}
      aria-label={`${p.name}: ${p.kind}, ${p.status}. ${p.hook}`}
      onPointerMove={move}
      onPointerEnter={() => onActive?.(true)}
      onPointerLeave={() => { setTilt((t) => ({ ...t, x: 0, y: 0, on: false })); onActive?.(false); }}
      onFocus={() => onActive?.(true)}
      onBlur={() => onActive?.(false)}
      className={cn("group relative block w-[300px] shrink-0 [perspective:1000px] sm:w-[320px]", className)}
      style={style}
    >
      <div
        className="relative rounded-[24px] p-[9px] shadow-[0_2px_0_rgba(22,12,21,.06),0_30px_50px_-30px_rgba(58,36,16,.55)] transition-transform duration-500 ease-lab will-change-transform"
        style={{
          background: p.color,
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${tilt.on ? "translateZ(0) scale(1.03)" : ""}`,
          transitionDuration: tilt.on ? "120ms" : "700ms",
        }}
      >
        {/* Grain on the frame */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[24px] opacity-[.18] mix-blend-multiply" style={{ backgroundImage: `url(${grain})`, backgroundSize: 220 }} />

        <div className="relative flex flex-col overflow-hidden rounded-[17px] border border-ink/10 bg-[#FCFAF6]">
          {/* Name bar */}
          <div className="flex items-center justify-between gap-3 px-4 pb-2.5 pt-3.5">
            <span className="text-[25px] font-black leading-none tracking-[-0.045em]">{p.name}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper px-2.5 py-1 text-[11px] font-bold">
              <i className="h-1.5 w-1.5 rounded-full" style={{ background: statusDot[p.status] }} />
              {p.status}
            </span>
          </div>

          {/* Art window */}
          <div className="relative mx-2.5 aspect-[4/3] overflow-hidden rounded-[12px] border border-ink/10" style={{ background: p.color }}>
            <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(70% 70% at 50% 38%, rgba(255,255,255,.75), transparent 70%), repeating-linear-gradient(135deg, rgba(22,12,21,.035) 0 2px, transparent 2px 6px)" }} />
            {ScenePiece && (
              <div className={cn("absolute inset-0 grid place-items-center p-1.5 transition-opacity duration-700", active ? "opacity-100" : "opacity-0")} aria-hidden="true">
                <ScenePiece showBeats={false} active={active} />
              </div>
            )}
            <div
              className={cn(
                "patch patch-shadow absolute transition-all duration-700 ease-lab",
                active && ScenePiece ? "right-2 top-2 w-[22%] rotate-[10deg]" : "left-1/2 top-1/2 w-[50%] -translate-x-1/2 -translate-y-1/2 -rotate-6 group-hover:rotate-0",
              )}
              aria-hidden="true"
            >
              <Patch slug={p.slug} />
            </div>
          </div>

          {/* Type line */}
          <div className="mx-2.5 mt-2.5 flex items-center justify-between rounded-md border border-ink/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-ink/70">
            <span>{p.kind}</span>
            <span className="num">Lab {no}</span>
          </div>

          {/* Text box */}
          <div className="px-4 pb-3 pt-3.5">
            <p className="text-[16.5px] font-bold leading-[1.25] tracking-[-0.015em]">{p.hook}</p>
            <p className="mt-2 text-[13px] leading-snug text-ink-soft">For {p.audiences.slice(0, 2).map((a) => a.charAt(0).toLowerCase() + a.slice(1)).join(" and ")}.</p>
          </div>

          {/* Stats */}
          <div className="mx-2.5 grid grid-cols-2 border-t border-ink/10 text-[11.5px]">
            <div className="py-2.5 pr-2">
              <p className="font-bold uppercase tracking-[.14em] text-ink/55">Stage</p>
              <div className="mt-1.5 flex items-center gap-1" aria-label={`Stage ${p.stage + 1} of ${STAGES.length}`}>
                {STAGES.map((s, i) => (
                  <i key={s.name} className="h-[7px] w-[7px] rounded-full border border-ink/40" style={{ background: i <= p.stage ? "hsl(var(--ink))" : "transparent" }} />
                ))}
                <span className="ml-1.5 font-bold">{STAGES[p.stage].name}</span>
              </div>
            </div>
            <div className="border-l border-ink/10 py-2.5 pl-3">
              <p className="font-bold uppercase tracking-[.14em] text-ink/55">Next</p>
              <p className="mt-1 font-bold leading-tight">{p.next.replace(/\.$/, "")}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 pb-3 pt-1 text-[10.5px] font-medium text-ink/50">
            <span>Constellation Labs ✦</span>
            <span className="num">{no}/{total}</span>
          </div>
        </div>

        {/* Foil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[24px] mix-blend-soft-light transition-opacity duration-500"
          style={{
            opacity: tilt.on ? 0.95 : 0,
            background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,.9), transparent 45%), linear-gradient(${110 + tilt.y * 3}deg, transparent 25%, rgba(254,110,54,.45) 42%, rgba(242,179,61,.4) 50%, rgba(158,220,198,.5) 58%, rgba(124,140,240,.4) 66%, transparent 80%)`,
          }}
        />
      </div>
    </Link>
  );
}
