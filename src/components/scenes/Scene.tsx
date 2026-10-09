import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

export type Beat = { at: number; label: string };

/**
 * Shared engine for the product motion pieces.
 * - `build` writes one looping GSAP timeline. It must add a "hold" label at the finished frame.
 * - Plays only while at least a third of it is on screen.
 * - Reduced motion: shows the finished frame, no movement.
 * - The beat captions follow the timeline, so the story reads without the motion too.
 */
export default function Scene({
  title,
  beats,
  build,
  children,
  className = "",
  showBeats = true,
  active,
  onBeat,
}: {
  title: string;
  beats: Beat[];
  build: (tl: gsap.core.Timeline) => void;
  children: ReactNode;
  className?: string;
  showBeats?: boolean;
  /** When set, the piece only plays while true, and restarts each time it becomes true. */
  active?: boolean;
  onBeat?: (index: number, label: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [beat, setBeatState] = useState(-1);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const inView = useRef(false);
  const activeRef = useRef(active);
  const reduceRef = useRef(false);
  const onBeatRef = useRef(onBeat);
  onBeatRef.current = onBeat;
  const setBeat = (i: number) => {
    setBeatState(i);
    onBeatRef.current?.(i, i >= 0 ? beats[i].label : "");
  };
  const sync = () => {
    const tl = tlRef.current;
    if (!tl || reduceRef.current) return;
    if (inView.current && activeRef.current !== false) tl.play();
    else tl.pause();
  };

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reduceRef.current = reduce;
    let io: IntersectionObserver | undefined;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.3, defaults: { ease: "power3.out" } });
      tl.call(() => setBeat(-1), undefined, 0);
      build(tl);
      beats.forEach((b, i) => tl.call(() => setBeat(i), undefined, b.at));
      tlRef.current = tl;

      if (reduce) {
        tl.seek("hold").pause();
        setBeat(beats.length - 1);
        return;
      }
      io = new IntersectionObserver(([entry]) => {
        inView.current = entry.isIntersecting;
        sync();
      }, { threshold: 0.33 });
      io.observe(el);
    }, el);

    return () => {
      io?.disconnect();
      tlRef.current = null;
      ctx.revert();
    };
    // build and beats are static per scene
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const was = activeRef.current;
    activeRef.current = active;
    if (active && was === false && tlRef.current && !reduceRef.current) tlRef.current.restart();
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <figure ref={root} className={`labs-scene ${className}`}>
      <div className="labs-scene-art" role="img" aria-label={`${title}: ${beats.map((b) => b.label).join(", ")}.`}>
        {children}
      </div>
      {showBeats && (
        <figcaption className="labs-scene-beats" aria-hidden="true">
          {beats.map((b, i) => (
            <span key={b.label} className={i === beat ? "is-active" : i < beat ? "is-done" : ""}>
              <i>0{i + 1}</i>
              {b.label}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}

/** Shared SVG bits */
export const INK = "#160C15";
export const SOFT = "#5E5660";
export const CREAM = "#F3EEE7";
export const MIST = "#F7F4EF";
export const PAPER = "#FCFAF6"; // card surface: warm paper, never pure white
export const LINE = "#E8E2D8";
export const ORANGE = "#FE6E36";
export const TEAL = "#173F3F";
export const GREEN = "#2F6B4F";
export const SAND = "#B7AA93";
export const FONT = "Satoshi, 'Helvetica Neue', Arial, sans-serif";

export function Shadow({ id, y = 16, blur = 16, opacity = 0.11 }: { id: string; y?: number; blur?: number; opacity?: number }) {
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="180%">
      <feDropShadow dx="0" dy={Math.round(y / 4)} stdDeviation={Math.max(1, blur / 6)} floodColor="#3A2410" floodOpacity={opacity * 0.6} />
      <feDropShadow dx="0" dy={y} stdDeviation={blur} floodColor="#3A2410" floodOpacity={opacity} />
    </filter>
  );
}

export function Check({ x, y, s = 1, color = "#fff" }: { x: number; y: number; s?: number; color?: string }) {
  return <path d={`M${x - 5 * s} ${y} l${3.5 * s} ${3.5 * s} l${7 * s} ${-7.5 * s}`} fill="none" stroke={color} strokeWidth={2.4 * s} strokeLinecap="round" strokeLinejoin="round" />;
}

/** Props each product piece forwards to Scene */
export type ScenePieceProps = { showBeats?: boolean; active?: boolean; onBeat?: (index: number, label: string) => void };
