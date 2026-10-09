import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The main site's RadialLiquid (cosmic-launchpad/src/components/effects/RadialLiquid.tsx),
 * duplicated: same warp, same three-colour ramp, same edge fade. Deviated for Labs:
 * it runs as a WebGL shader so it can fill a whole section, it carries film grain,
 * and `wash` lifts it toward the paper for daylight pages.
 *
 * shape="disc"  the main site's liquid disc, for heroes
 * shape="field" full-bleed, for section grounds
 */

export const PALETTES = {
  /** The main site's hero disc. */
  night: ["#8B2252", "#C43E1A", "#1A3A3A"],
  /** Daylight Labs: wine into Constellation orange into the mint end of "Labs." */
  day: ["#8B2252", "#FE6E36", "#9EDCC6"],
  /** Warm only: rust, orange, sand. */
  ember: ["#C43E1A", "#FE6E36", "#E9C39E"],
} as const;

type Hex = string;

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision mediump float;
uniform vec2 uRes; uniform float uTime, uDisc, uWash, uGrain, uScale;
uniform vec3 c1, c2, c3, bg;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 d = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * min(uRes.x, uRes.y));
  float dist = length(d);
  float t = uTime;
  float px = d.x * uScale, py = d.y * uScale, value = 0.0;
  for (int i = 0; i < 4; i++) {
    px += (sin(px * 1.5 + t * 0.8) + sin(py * 1.3 - t * 0.6)) * 0.3;
    py += (cos(py * 1.7 + t * 0.5) + cos(px * 1.1 + t * 0.9)) * 0.3;
    value += sin(px + py + t) * 0.5;
  }
  value = (sin(value * 2.0) + 1.0) / 2.0;
  float af = (sin((atan(d.y, d.x) + t * 0.2) * 2.0) + 1.0) / 2.0;
  vec3 col;
  if (value < 0.4) col = mix(c1, c2, value / 0.4);
  else { float f = (value - 0.4) / 0.6; col = c2 * (1.0 - f) + c3 * f * af + c1 * f * (1.0 - af); }
  col = min(col * 1.1, vec3(1.0));
  col = mix(col, bg, uWash);
  float a = uDisc > 0.5 ? clamp(1.0 - (dist - 0.85) / 0.2, 0.0, 1.0) : 1.0;
  col += (hash(gl_FragCoord.xy + fract(t * 7.0) * 113.0) - 0.5) * uGrain;
  gl_FragColor = vec4(col * a, a);
}`;

const rgb = (h: Hex) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export default function Liquid({
  palette = PALETTES.day,
  bg = "#FBF8F3",
  shape = "field",
  wash = 0,
  grain = 0.09,
  speed = 0.5,
  scale = 3,
  resolution = 0.6,
  className,
}: {
  palette?: readonly [Hex, Hex, Hex] | readonly Hex[];
  bg?: Hex;
  shape?: "disc" | "field";
  wash?: number;
  grain?: number;
  speed?: number;
  scale?: number;
  /** Buffer scale. Lower is cheaper and makes the grain coarser. */
  resolution?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
    if (!gl) { canvas.style.background = `radial-gradient(closest-side, ${palette[1]}, ${palette[0]} 60%, transparent)`; return; }

    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    gl.uniform3fv(u("c1"), rgb(palette[0]));
    gl.uniform3fv(u("c2"), rgb(palette[1]));
    gl.uniform3fv(u("c3"), rgb(palette[2]));
    gl.uniform3fv(u("bg"), rgb(bg));
    gl.uniform1f(u("uDisc"), shape === "disc" ? 1 : 0);
    gl.uniform1f(u("uWash"), wash);
    gl.uniform1f(u("uGrain"), grain);
    gl.uniform1f(u("uScale"), scale);
    const uRes = u("uRes"), uTime = u("uTime");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t = 7.3; // start mid-flow, not on the symmetric first frame
    let raf = 0, visible = false, last = performance.now();

    const size = () => {
      const r = Math.min(window.devicePixelRatio || 1, 1.5) * resolution;
      canvas.width = Math.max(2, Math.round(canvas.clientWidth * r));
      canvas.height = Math.max(2, Math.round(canvas.clientHeight * r));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    const draw = () => { gl.uniform1f(uTime, t); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    const loop = (now: number) => {
      t += Math.min(0.05, (now - last) / 1000) * speed;
      last = now;
      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const start = () => { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    size(); draw();
    const ro = new ResizeObserver(() => { size(); draw(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
    io.observe(canvas);
    const onVis = () => !document.hidden && visible && start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [palette, bg, shape, wash, grain, speed, scale, resolution]);

  return <canvas ref={ref} aria-hidden="true" className={cn("pointer-events-none block", shape === "disc" && "rounded-full", className)} />;
}
