import { useEffect, useRef } from "react";
import Patch from "@/components/patches/Patch";
import type { ProductSlug } from "@/content/products";

/**
 * Google Labs ends on a pile of brand shapes. Ours is a pile of product patches:
 * they drop in when the footer arrives, roll, settle, and can be picked up and thrown.
 * A tiny circle solver, no physics library. Sleeps when everything is still.
 */
const ORDER: ProductSlug[] = ["acre", "pinpoints", "prism", "nod", "pinpoints", "acre", "nod", "prism", "acre", "nod", "prism", "pinpoints"];
const SIZE = [1, 0.82, 1.08, 0.9, 1.12, 0.76, 0.98, 0.86, 0.9, 1.04, 0.8, 0.94];

type Body = { x: number; y: number; px: number; py: number; r: number; a: number; pa: number };

export default function PatchPile({ count = 12, height = 360 }: { count?: number; height?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const host = box.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = host.clientWidth;
    const H = host.clientHeight;
    const n = W < 640 ? Math.min(count, 8) : count;
    const base = Math.max(38, Math.min(84, W / 15));
    const bodies: Body[] = Array.from({ length: n }, (_, i) => {
      const r = base * SIZE[i % SIZE.length];
      const x = r + ((i * 0.618 * W) % Math.max(1, W - 2 * r));
      const y = -r - i * r * 0.9 - 40;
      const a = (i * 47) % 360 * (Math.PI / 180) * 0.4 - 0.4;
      return { x, y, px: x + (i % 2 ? 0.6 : -0.6), py: y, r, a, pa: a };
    });
    els.current.forEach((el, i) => {
      if (!el) return;
      el.style.display = i < n ? "block" : "none";
      if (i < n) el.style.width = `${bodies[i].r * 2}px`;
    });

    let drag: { i: number; ox: number; oy: number; x: number; y: number } | null = null;
    let raf = 0;
    let running = false;
    let started = false;
    let still = 0;

    const step = () => {
      const g = 0.55;
      for (const b of bodies) {
        const vx = (b.x - b.px) * 0.985;
        const vy = (b.y - b.py) * 0.985;
        b.px = b.x; b.py = b.y;
        b.x += vx; b.y += vy + g;
        const va = (b.a - b.pa) * 0.96;
        b.pa = b.a; b.a += va;
      }
      if (drag) {
        const b = bodies[drag.i];
        b.x = drag.x - drag.ox; b.y = drag.y - drag.oy;
      }
      for (let k = 0; k < 4; k++) {
        for (let i = 0; i < n; i++) {
          const a = bodies[i];
          for (let j = i + 1; j < n; j++) {
            const b = bodies[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const min = (a.r + b.r) * 0.92;
            const d2 = dx * dx + dy * dy;
            if (d2 < min * min && d2 > 0.0001) {
              const d = Math.sqrt(d2);
              const push = (min - d) / d / 2;
              const ax = dx * push, ay = dy * push;
              const wa = drag?.i === i ? 0 : 1, wb = drag?.i === j ? 0 : 1;
              a.x -= ax * wa * (wb ? 1 : 2); a.y -= ay * wa * (wb ? 1 : 2);
              b.x += ax * wb * (wa ? 1 : 2); b.y += ay * wb * (wa ? 1 : 2);
            }
          }
          if (a.y > H - a.r) {
            const vx = a.x - a.px, vy = a.y - a.py;
            a.y = H - a.r;
            a.py = a.y + vy * 0.28; // a little bounce
            a.a += (vx / a.r) * 0.6; // roll along the floor
            a.px = a.x - vx * 0.9; // friction
          }
          if (a.x < a.r) { a.x = a.r; a.px = a.x + (a.x - a.px) * 0.4; }
          if (a.x > W - a.r) { a.x = W - a.r; a.px = a.x + (a.x - a.px) * 0.4; }
        }
      }
    };

    const paint = () => {
      for (let i = 0; i < n; i++) {
        const b = bodies[i], el = els.current[i];
        if (el) el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0) rotate(${b.a}rad)`;
      }
    };

    const energy = () => bodies.reduce((s, b) => s + Math.abs(b.x - b.px) + Math.abs(b.y - b.py), 0);

    const loop = () => {
      step();
      paint();
      still = energy() < 0.08 * n && !drag ? still + 1 : 0;
      if (still > 40) { running = false; return; }
      raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (running) return;
      running = true; still = 0;
      raf = requestAnimationFrame(loop);
    };

    if (reduce) {
      for (let i = 0; i < 900; i++) step();
      paint();
    } else {
      paint();
    }

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started && !reduce) { started = true; wake(); }
    }, { threshold: 0.25 });
    io.observe(host);

    const local = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      const i = els.current.indexOf((e.target as HTMLElement).closest("[data-body]") as HTMLDivElement);
      if (i < 0 || i >= n || reduce) return;
      const p = local(e);
      drag = { i, ox: p.x - bodies[i].x, oy: p.y - bodies[i].y, x: p.x, y: p.y };
      host.setPointerCapture(e.pointerId);
      host.style.cursor = "grabbing";
      started = true;
      wake();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const p = local(e);
      drag.x = p.x; drag.y = Math.min(p.y, H - bodies[drag.i].r);
    };
    const onUp = () => {
      if (!drag) return;
      drag = null;
      host.style.cursor = "";
      wake();
    };
    const onResize = () => { W = host.clientWidth; wake(); };
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", onResize);
    };
  }, [count]);

  return (
    <div ref={box} className="relative w-full touch-pan-y select-none overflow-hidden" style={{ height }} aria-hidden="true">
      {ORDER.slice(0, count).map((slug, i) => {
        return (
          <div
            key={i}
            data-body
            ref={(el) => (els.current[i] = el)}
            className="patch patch-shadow absolute left-0 top-0 cursor-grab will-change-transform"
            style={{ transform: "translate3d(-999px,-999px,0)" }}
          >
            <Patch slug={slug} />
          </div>
        );
      })}
    </div>
  );
}
