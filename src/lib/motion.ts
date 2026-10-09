import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scoped GSAP setup. `fn` runs only when motion is allowed; everything it creates
 * is reverted on unmount. Elements marked [data-reveal] rise in as they enter.
 */
export function useMotion(scope: RefObject<HTMLElement>, fn?: (root: HTMLElement) => void, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = scope.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    const bound: HTMLElement[] = [];
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        // Nested components share this hook; whoever binds an element first owns it,
        // or two from() tweens would stack and leave it invisible.
        gsap.utils.toArray<HTMLElement>("[data-reveal]:not([data-reveal-bound])", root).forEach((el) => {
          el.setAttribute("data-reveal-bound", "");
          bound.push(el);
          const d = Number(el.dataset.reveal) || 0;
          gsap.from(el, {
            y: 48, opacity: 0, duration: 1.1, delay: d, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
        fn?.(root);
      }, root);
      return () => { ctx.revert(); bound.forEach((el) => el.removeAttribute("data-reveal-bound")); bound.length = 0; };
    });
    // Fonts and images shift layout after first paint; re-measure once settled.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => { mm.revert(); window.removeEventListener("load", refresh); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
