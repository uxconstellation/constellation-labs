/** Adapted from David Haz / React Bits AnimatedContent.
 * https://github.com/DavidHDev/react-bits — see /licenses/reactbits.txt.
 * Scoped GSAP context and reduced-motion support. */
import { useLayoutEffect, useRef, type PropsWithChildren } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export default function AnimatedContent({ children, className = "", delay = 0, distance = 60 }: PropsWithChildren<{ className?: string; delay?: number; distance?: number }>) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.from(ref.current, { y: distance, opacity: 0, duration: 1.1, delay, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 92%", once: true } });
      }, ref);
      return () => ctx.revert();
    });
    return () => media.revert();
  }, [delay, distance]);
  return <div ref={ref} className={className}>{children}</div>;
}
