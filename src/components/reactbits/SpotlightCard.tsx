/** Adapted from ReactBits SpotlightCard, David Haz (2026), MIT + Commons Clause.
 * Source commit c49d6978d2496660f0f0c5a3b3ca77a059566a93. See /licenses/reactbits.txt.
 * Retains bounded pointer-relative radial light. Semantic colour, GSAP fade and focus parity added. */
import { useEffect, useRef, type PropsWithChildren } from "react";
import gsap from "gsap";
export interface SpotlightCardProps extends PropsWithChildren { className?: string; spotlightColor?: string }
export default function SpotlightCard({children,className="",spotlightColor="hsl(var(--primary) / 0.2)"}:SpotlightCardProps) {
  const root=useRef<HTMLDivElement>(null),light=useRef<HTMLDivElement>(null);
  const focused=useRef(false);
  const fade=(visible:boolean)=>gsap.to(light.current,{opacity:visible?1:0,duration:matchMedia("(prefers-reduced-motion: reduce)").matches?0:.3,ease:"power3.out",overwrite:true});
  useEffect(()=>()=>{gsap.killTweensOf(light.current);},[]);
  return <div ref={root} className={`relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-card-foreground ${className}`}
    onPointerMove={event=>{if(focused.current || matchMedia("(prefers-reduced-motion: reduce)").matches)return;const box=event.currentTarget.getBoundingClientRect();light.current!.style.background=`radial-gradient(circle at ${event.clientX-box.left}px ${event.clientY-box.top}px, ${spotlightColor}, transparent 80%)`;}}
    onPointerEnter={()=>fade(true)} onPointerLeave={()=>{if(!focused.current)fade(false);}}
    onFocusCapture={()=>{focused.current=true;light.current!.style.background=`radial-gradient(circle at 50% 50%, ${spotlightColor}, transparent 80%)`;fade(true);}}
    onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){focused.current=false;fade(false);}}}>
    <div ref={light} aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0" style={{background:`radial-gradient(circle at 50% 50%, ${spotlightColor}, transparent 80%)`}} />
    <div className="relative">{children}</div>
  </div>;
}

