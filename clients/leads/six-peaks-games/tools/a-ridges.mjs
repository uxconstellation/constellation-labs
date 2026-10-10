// Direction A (The Ascent): deterministic generator for the six ridgelines, the
// summit route, the six-peak glyph and the base-camp skyline.
// Everything is seeded, so the same SVG comes out on every build.
// Coordinate space: viewBox 0 0 2800 700. The summit sits at x=1400 (centre), so
// CSS can place the summit anywhere on screen by anchoring the SVG's centre.

export const VB = { w: 2800, h: 700 };
export const SUMMIT = { x: 1400, y: 84 };

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function noise1D(seed) {
  const rand = mulberry32(seed);
  const N = 512;
  const v = Array.from({ length: N }, () => rand() * 2 - 1);
  return (x) => {
    const i = Math.floor(x), f = x - i;
    const a = v[((i % N) + N) % N], b = v[(((i + 1) % N) + N) % N];
    const u = f * f * (3 - 2 * f);
    return a + (b - a) * u;
  };
}
// Ridged fbm: sharp crests, soft valleys (1 - |n|), the classic mountain profile.
function ridgedFbm(n, x, oct = 5) {
  let s = 0, amp = 1, freq = 1, norm = 0;
  for (let o = 0; o < oct; o++) {
    const r = 1 - Math.abs(n(x * freq));
    s += amp * (r * r);
    norm += amp; amp *= 0.52; freq *= 2.07;
  }
  return s / norm; // 0..1
}
// Catmull-Rom through control points, sampled as a function of x.
function spline(points) {
  const P = points;
  return (x) => {
    let i = 0;
    while (i < P.length - 2 && x > P[i + 1][0]) i++;
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    const t = (x - p1[0]) / (p2[0] - p1[0] || 1);
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
  };
}

// Six ridges, far (1) to near (6). Control points art-direct the composition:
// low dark foothills on the left (room for the copy), the massif rising to the
// summit at x=1400 on ridge 3 with a shoulder to the east, far ranges on the right.
// amp/freq = ridged mid-scale relief, crag = fine rock texture.
export const RIDGES = [
  { id: 1, seed: 11, amp: 24, freq: 1 / 160, crag: 4, pts: [[0, 560], [400, 548], [760, 522], [1000, 474], [1200, 404], [1420, 334], [1600, 266], [1760, 206], [1900, 158], [2000, 204], [2080, 192], [2200, 240], [2400, 168], [2600, 250], [2800, 300]] },
  { id: 2, seed: 23, amp: 28, freq: 1 / 140, crag: 6, pts: [[0, 566], [500, 548], [900, 506], [1150, 428], [1350, 336], [1560, 276], [1700, 230], [1780, 214], [1900, 272], [2100, 300], [2300, 278], [2550, 352], [2800, 382]] },
  { id: 3, seed: 37, amp: 36, freq: 1 / 118, crag: 9, pts: [[0, 594], [480, 570], [820, 506], [1000, 434], [1140, 334], [1250, 236], [1330, 152], [1400, SUMMIT.y], [1450, 126], [1500, 168], [1555, 178], [1600, 224], [1700, 302], [1880, 354], [2150, 394], [2500, 422], [2800, 448]] },
  { id: 4, seed: 41, amp: 28, freq: 1 / 108, crag: 8, pts: [[0, 604], [300, 590], [600, 564], [820, 524], [960, 474], [1030, 452], [1120, 474], [1280, 506], [1560, 504], [1800, 474], [2000, 466], [2250, 500], [2800, 514]] },
  { id: 5, seed: 53, amp: 22, freq: 1 / 100, crag: 7, pts: [[0, 628], [380, 614], [700, 604], [1050, 590], [1400, 578], [1650, 552], [1850, 516], [1960, 504], [2100, 534], [2400, 552], [2800, 564]] },
  { id: 6, seed: 67, amp: 16, freq: 1 / 90, crag: 6, pts: [[0, 644], [220, 622], [380, 610], [560, 636], [900, 660], [1200, 644], [1500, 668], [1800, 646], [2150, 656], [2450, 626], [2800, 650]] },
];

const STEP = 10;
const SUMMIT_FADE = 70;
export function crestPoints(r) {
  const base = spline(r.pts);
  const n = noise1D(r.seed);
  const c = noise1D(r.seed * 7 + 3);
  const out = [];
  for (let x = 0; x <= VB.w; x += STEP) {
    // Detail fades out right at the summit so the flag sits on a clean point.
    const k = r.id === 3 ? Math.min(1, Math.abs(x - SUMMIT.x) / SUMMIT_FADE) : 1;
    let y = base(x) - (ridgedFbm(n, x * r.freq) - 0.45) * r.amp * k + c(x / 22) * r.crag * k;
    out.push([x, Math.round(y * 10) / 10]);
  }
  if (r.id === 3) {
    const i = Math.round(SUMMIT.x / STEP);
    out[i] = [SUMMIT.x, SUMMIT.y];
    // Keep the summit the single highest point of the whole range.
    for (const p of out) if (p[0] !== SUMMIT.x && p[1] < SUMMIT.y + 6) p[1] = SUMMIT.y + 6 + Math.abs(p[0] - SUMMIT.x) * 0.15;
  }
  return out;
}
let _cache = null;
export function allCrests() { return _cache || (_cache = RIDGES.map(crestPoints)); }
export function crestAt(ridgeIndex, x) {
  const pts = allCrests()[ridgeIndex];
  const i = Math.max(0, Math.min(pts.length - 2, Math.floor(x / STEP)));
  const a = pts[i], b = pts[i + 1], t = (x - a[0]) / (b[0] - a[0]);
  return a[1] + (b[1] - a[1]) * t;
}
export function meanCrest(ridgeIndex, x0 = 0, x1 = VB.w) {
  const pts = allCrests()[ridgeIndex].filter((p) => p[0] >= x0 && p[0] <= x1);
  return pts.reduce((s, p) => s + p[1], 0) / pts.length;
}
const f1 = (v) => (Math.round(v * 10) / 10).toString();
export function crestD(pts) { return 'M' + pts.map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L'); }
export function fillD(pts, bottom = VB.h + 260) {
  // The fill runs well below the viewBox so a sinking layer never shows a gap.
  return crestD(pts) + `L${VB.w} ${bottom}L0 ${bottom}Z`;
}

// The route: switchbacks up the massif's west face, always inside the mountain
// (below ridge 3's crest), tightening as it nears the summit.
function buildRoute() {
  const legs = 13;
  const pts = [[610, 780]];
  for (let k = 0; k <= legs; k++) {
    const t = k / legs;
    const e = Math.pow(t, 0.92);
    const y = 690 - (690 - SUMMIT.y) * e;
    const cx = 760 + (SUMMIT.x - 760) * Math.pow(t, 0.8);
    const w = (1 - t) * 104 + 8;
    let x = cx + (k % 2 ? w : -w);
    if (k === legs) x = SUMMIT.x;
    // stay below the summit ridge's crest (inside the face) except at the top
    const crest = crestAt(2, x);
    const yy = k === legs ? SUMMIT.y : Math.max(y, crest + 14 + (1 - t) * 10);
    pts.push([Math.round(x), Math.round(k === legs ? SUMMIT.y : yy)]);
  }
  return pts;
}
export const ROUTE = buildRoute();
// Camps marked along the hero route (turning points): a foreshadow of the seven camps.
export const ROUTE_CAMPS = [2, 4, 6, 8, 10, 12];
export function routeD() { return 'M' + ROUTE.map((p) => p[0] + ' ' + p[1]).join('L'); }
// The faint line onward to the next peak (ridge 1's far summit).
export function nextPeak() {
  const r1 = allCrests()[0];
  let best = r1[0];
  for (const p of r1) if (p[0] > 1700 && p[0] < 2050 && p[1] < best[1]) best = p;
  return best;
}

// Six-peak glyph: the six crest lines, cropped around the massif, at small scale.
// Each crest takes its stroke from a CSS custom property so one <use> instance can
// light a single ridge (style="--g3: var(--route-hi)").
export const GLYPH_VB = { x: 520, y: 40, w: 1880, h: 640 };
export function glyphMarkup() {
  const lines = RIDGES.map((r, ri) => {
    const pts = allCrests()[ri].filter((p, i) => i % 3 === 0 && p[0] >= GLYPH_VB.x - 20 && p[0] <= GLYPH_VB.x + GLYPH_VB.w + 20);
    let peak = pts[0];
    for (const p of pts) if (p[1] < peak[1]) peak = p;
    return { r, d: crestD(pts), peak };
  });
  const paths = lines.map(({ r, d }) =>
    `<path d="${d}" fill="none" style="stroke:var(--g${r.id},var(--glyph-line));stroke-width:var(--gw${r.id},1.25px)" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`).join('');
  const peaks = lines.map(({ r, peak }) =>
    `<g style="opacity:var(--f${r.id},0)" transform="translate(${f1(peak[0])} ${f1(peak[1])})"><path d="M0 0V-92" style="stroke:var(--snow)" stroke-width="2" vector-effect="non-scaling-stroke"/><path d="M0 -92L74 -72L0 -52Z" style="fill:var(--route)"/></g>`).join('');
  return { paths, peaks, vb: `${GLYPH_VB.x} ${GLYPH_VB.y} ${GLYPH_VB.w} ${GLYPH_VB.h}` };
}
