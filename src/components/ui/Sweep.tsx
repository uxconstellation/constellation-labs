import { useLayoutEffect, useRef, type ElementType } from "react";
import { ScrollTrigger } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Google Labs' about statement: words fill with ink one by one as you scroll.
 * Wrap a word in *asterisks* to give it the accent colour when it fills.
 */
export default function Sweep({ text, as: Tag = "p", className, dark = false }: { text: string; as?: ElementType; className?: string; dark?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(" ");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>(".w"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spans.forEach((s) => s.classList.add("on"));
      return;
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 82%",
      end: "bottom 45%",
      onUpdate: ({ progress }) => {
        const n = Math.round(progress * spans.length);
        spans.forEach((s, i) => s.classList.toggle("on", i < n));
      },
    });
    return () => st.kill();
  }, [text]);

  return (
    <Tag ref={ref} className={cn(dark ? "sweep-dark" : "sweep", className)} aria-label={text.replace(/\*/g, "")}>
      {words.map((w, i) => {
        const hl = w.startsWith("*");
        const clean = w.replace(/\*/g, "");
        return (
          <span key={i} aria-hidden="true">
            <span className={cn("w", hl && "hl")}>{clean}</span>{i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </Tag>
  );
}

