// Direction A2 (Bug Hunt) build step.
// page.html is the hand-authored source. This script regenerates only the marked regions:
//   <!--a2:NAME-->...<!--/a2:NAME-->   generated markup (manual, index list, bestiary, platforms, forms)
//   <script type="application/json" id="a2-data">   content + level layout (from research + peaks.json)
//   <script type="application/json" id="a2-kit">    the pixel kit's JSON (sprites, peaks, palette, title blocks)
// Usage: node tools/a2-build.mjs   (from the project root; idempotent)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from './a2-content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'direction-a-bug-hunt');
const PAGE = path.join(DIR, 'page.html');
const PIX = path.join(ROOT, 'assets', 'web', 'pixel');
const PLACEHOLDER_PEAKS = process.env.A2_PEAKS || '';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const exists = (f) => fs.existsSync(f);

// ---------- kit ----------
const kit = { ready: false, files: {}, sprites: null, peaks: null, palette: null, titleBlocks: null, placeholder: false };
if (exists(path.join(PIX, 'sprites.json'))) { kit.sprites = readJSON(path.join(PIX, 'sprites.json')); }
if (exists(path.join(PIX, 'peaks.json'))) { kit.peaks = readJSON(path.join(PIX, 'peaks.json')); }
else if (PLACEHOLDER_PEAKS && exists(PLACEHOLDER_PEAKS)) { kit.peaks = readJSON(PLACEHOLDER_PEAKS); kit.placeholder = true; }
if (exists(path.join(PIX, 'palette.json'))) kit.palette = readJSON(path.join(PIX, 'palette.json'));
if (exists(path.join(PIX, 'title-logo-blocks.json'))) kit.titleBlocks = readJSON(path.join(PIX, 'title-logo-blocks.json'));
for (const f of ['sprites.png', 'sky.png', 'bg-far.png', 'bg-mid.png', 'title-logo.png']) {
  if (exists(path.join(PIX, f))) kit.files[f] = 'assets/pixel/' + f;
}
const pngSize = (f) => { const b = fs.readFileSync(f); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
const kitImg = {};
if (exists(PIX)) for (const f of fs.readdirSync(PIX)) {
  if (/^(billboard|sign)-[a-z0-9-]+\.png$/.test(f) || ['sprites.png', 'sky.png', 'bg-far.png', 'bg-mid.png', 'title-logo.png', 'level-terrain.png'].includes(f)) {
    kitImg[f] = { src: 'assets/pixel/' + f, ...pngSize(path.join(PIX, f)) };
  }
}
kit.ready = !!(kit.sprites && kit.files['sprites.png']);

// Normalise sprites.json into { frames: { name: {x,y,w,h, ax?, ay?, ...} }, atlas: {w,h}, meta }.
// The kit keeps anchors in a separate map ("anchors": the pixel that sits on the ground point) and
// windows/legs as top-level keys; all of it is carried through.
function normSprites(js) {
  if (!js) return null;
  const frames = js.frames || js.sprites || js;
  const anchors = js.anchors || {};
  const out = {};
  const add = (name, f) => {
    if (!f || !name) return;
    const r = f.frame || f.rect || f;
    const x = r.x ?? r[0], y = r.y ?? r[1], w = r.w ?? r.width ?? r[2], h = r.h ?? r.height ?? r[3];
    if ([x, y, w, h].some((v) => typeof v !== 'number')) return;
    const o = { x, y, w, h };
    const piv = anchors[name] || f.anchor || f.pivot || f.origin;
    if (piv && typeof piv.x === 'number') { o.ax = piv.x; o.ay = piv.y; if (piv.steps) { o.steps = piv.steps; o.missing = piv.missing; } }
    out[name] = o;
  };
  if (Array.isArray(frames)) frames.forEach((f) => add(f.name || f.filename || f.id, f));
  else for (const [k, v] of Object.entries(frames)) { if (k === 'meta') continue; add(k.replace(/\.png$/, ''), v); }
  let atlas = js.size || (js.meta && js.meta.size) || null;
  if (kitImg['sprites.png']) atlas = { w: kitImg['sprites.png'].w, h: kitImg['sprites.png'].h };
  const meta = {};
  for (const k of ['anims', 'animFps', 'billboardWindow', 'billboardLegs', 'signboardWindow', 'boardedWindow', 'signpostMount', 'faultSwap', 'facing', 'saveKey', 'tiles']) if (js[k] !== undefined) meta[k] = js[k];
  return { frames: out, atlas, meta };
}
const SPR = normSprites(kit.sprites);
function normPeaks(pk) {
  if (!pk) return null;
  const g = pk.ground, at = (x) => g[Math.max(0, Math.min(g.length - 1, Math.round(x)))];
  const pt = (v, d) => (typeof v === 'number' ? { x: v, y: at(v) } : v && typeof v.x === 'number' ? { x: v.x, y: v.y ?? at(v.x) } : d);
  const peaks = (pk.peaks || []).map((p) => ({ x: p.x, y: p.y ?? at(p.x) }));
  return { ...pk, peaks, baseCamp: pt(pk.baseCamp, { x: 96, y: at(96) }), summit: pt(pk.summit, peaks[peaks.length - 1]) };
}
kit.peaks = normPeaks(kit.peaks);
const F = SPR ? SPR.frames : {};

// ---------- games ----------
const gamesRaw = readJSON(path.join(ROOT, 'research', 'games.json'));
const partnerName = Object.fromEntries(C.PARTNERS.map((p) => [p.slug, p.name]));
const web = (p) => String(p).replace(/^assets\/web\//, 'assets/');
const tidy = (s) => String(s).replace(/\s+[–—]\s+/g, ', ').replace(/\s+/g, ' ').trim();
const games = gamesRaw.map((g, i) => {
  const released = g.status !== 'underway';
  const ids = C.PARTNER_IDS[g.card.partner] || C.PARTNER_IDS[g.partner] || [];
  const plats = [];
  for (const p of g.platforms) {
    const m = C.PLATFORM_MAP[p];
    if (m && !plats.find((q) => q.name === m[1])) plats.push({ icon: 'assets/platforms/' + m[0] + '.webp', name: m[1] });
  }
  const cats = (g.servicesProvided || []).map((s) => s.category);
  const items = (g.servicesProvided || []).flatMap((s) => s.items);
  const bb = 'billboard-' + g.slug + '.png';
  return {
    i, slug: g.slug, title: C.TITLE_FIX[g.slug] || g.card.title || g.title, released,
    oneLiner: tidy(g.card.oneLiner || g.oneLiner),
    partner: tidy(g.card.partner || g.partner), partnerIds: ids,
    focus: released ? g.card.keyTestingFocus.map(tidy) : [],
    platforms: plats, cats, items,
    logo: { src: web(g.assets.logo), alt: (C.TITLE_FIX[g.slug] || g.title) + ' logo' },
    poster: { src: web(g.assets.poster), w: 405, h: 687 },
    key: released ? { src: web(g.assets.key), w: 1900, h: 792 } : null,
    billboard: released && kitImg[bb] ? kitImg[bb] : null,
  };
});
const gameBySlug = Object.fromEntries(games.map((g) => [g.slug, g]));

// service -> up to 4 shipped titles (focus keyword first, then category), site order
const services = C.SERVICES.map((s) => {
  const shipped = games.filter((g) => g.released);
  const hit = new Set();
  for (const g of shipped) if (s.match.some((k) => g.focus.some((f) => f.toLowerCase().includes(k.toLowerCase())))) hit.add(g.slug);
  if (s.key === 'performance') for (const g of shipped) if (g.items.includes('Performance Testing') && hit.size < 4) hit.add(g.slug);
  for (const g of shipped) { if (hit.size >= 4) break; if (s.cats.some((c) => g.cats.includes(c))) hit.add(g.slug); }
  const titles = shipped.filter((g) => hit.has(g.slug)).slice(0, 4).map((g) => g.slug);
  return { key: s.key, name: s.name, text: s.text, bug: s.bug, fault: s.fault, titles };
});

const partnerLogo = (slug, colour) => ({ src: 'assets/partners/' + slug + (colour ? '-colour' : '') + '.webp', w: slug === 'supercell' ? 500 : 363, h: slug === 'supercell' ? 500 : 141, alt: partnerName[slug] + ' logo' });
const quotes = C.QUOTES.map((q) => ({ ...q, logo: partnerLogo(q.partner, false), logoColour: partnerLogo(q.partner, true), sign: kitImg['sign-' + q.partner + '.png'] || null }));

// ---------- level layout ----------
// Ordered route, base camp to summit (DIRECTION-A2 "The route"). Positions are solved against peaks.json.
const ROUTE = [
  { kind: 'partner', ref: 'allum' }, { kind: 'photo', ref: 'rooftop' }, { kind: 'bug', ref: 'functional' },
  { kind: 'billboard', ref: 'yooka-replaylee' }, { kind: 'billboard', ref: 'god-breakers' }, { kind: 'partner', ref: 'scott' },
  { kind: 'boarded', ref: 'warhammer-survivors' },
  { kind: 'power', ref: 0 },
  { kind: 'bug', ref: 'compliance' }, { kind: 'billboard', ref: 'lost-skies' }, { kind: 'billboard', ref: 'wild-blue-skies' },
  { kind: 'partner', ref: 'aikman' }, { kind: 'photo', ref: 'desk' },
  { kind: 'power', ref: 1 },
  { kind: 'bug', ref: 'localisation' }, { kind: 'billboard', ref: 'lil-gator' }, { kind: 'partner', ref: 'wales' },
  { kind: 'billboard', ref: 'town-of-zoz' }, { kind: 'boarded', ref: 'boltgun-2' },
  { kind: 'power', ref: 2 },
  { kind: 'bug', ref: 'reporting' }, { kind: 'billboard', ref: 'suzerain' }, { kind: 'partner', ref: 'kyne' },
  { kind: 'billboard', ref: 'cattle-country' }, { kind: 'photo', ref: 'pair' }, { kind: 'boarded', ref: 'witchs-bakery' },
  { kind: 'power', ref: 3 },
  { kind: 'bug', ref: 'testcase' }, { kind: 'billboard', ref: 'whimel-academy' }, { kind: 'billboard', ref: 'outrage-fight-fest' },
  { kind: 'partner', ref: 'harfoot' }, { kind: 'partner', ref: 'avent' }, { kind: 'boarded', ref: 'king-of-tokyo' }, { kind: 'bug', ref: 'usability' },
  { kind: 'power', ref: 4 },
  { kind: 'bug', ref: 'performance' }, { kind: 'billboard', ref: 'service-with-a-shotgun' }, { kind: 'partner', ref: 'fraser' },
  { kind: 'photo', ref: 'company' }, { kind: 'billboard', ref: 'grave-dodgers' }, { kind: 'billboard', ref: 'its-only-money' },
  { kind: 'partner', ref: 'watson' }, { kind: 'photo', ref: 'screens' }, { kind: 'photo', ref: 'crew' },
  { kind: 'power', ref: 5 },
];
// Footprint widths (world px) used for spacing; the engine reads real sprite sizes for drawing.
const fw = (name, d) => (F[name] ? F[name].w : d);
const FOOT = {
  partner: () => fw('prop_signboard', 40), photo: () => 14, billboard: () => fw('prop_billboard', 80), boarded: () => fw('prop_boarded', 48),
  bug: (k) => ({ functional: fw('fault_clip_ground', 24), compliance: fw('fault_wrong_glyph_sign', 32), localisation: fw('fault_overflow_sign', 48), reporting: 20,
    testcase: fw('fault_stairs_missing', 40) + 8, usability: fw('fault_tiny_text_sign', 32), performance: 72, rc: fw('fault_typo_flag_sign', 48) }[k] || 28),
};
const STATS = {};
function solveLevel(pk) {
  const W = pk.width, H = pk.height || 216, ground = pk.ground;
  const gy = (x) => ground[Math.max(0, Math.min(W - 1, Math.round(x)))];
  const peaks = pk.peaks.map((p, i) => ({ i, x: p.x, y: p.y ?? gy(p.x) }));
  const base = pk.baseCamp || { x: 96, y: gy(96) };
  const summit = pk.summit || peaks[peaks.length - 1];
  if (pk.sites && pk.sites.stairs) return finishLevel(pk, handLevel(pk), peaks, base, summit, gy);
  const start = base.x + 84, end = summit.x - 56;
  // Global placement in route order along a "free track" that skips the peak tops (+-PK px), so the
  // order of the narrative holds whatever the peak spacing is. Bugs keep a wider berth from partner art.
  const PK = 20;
  const zones = peaks.filter((p) => p.x > start && p.x < end).map((p) => [p.x - PK, p.x + PK]).sort((a, b) => a[0] - b[0]);
  const free = []; let s0 = start;
  for (const [a, b] of zones) { if (a > s0) free.push([s0, a]); s0 = Math.max(s0, b); }
  if (end > s0) free.push([s0, end]);
  const freeLen = free.reduce((s, [a, b]) => s + (b - a), 0);
  const list = ROUTE.filter((r) => r.kind !== 'power');
  const isArt = (k) => k === 'billboard' || k === 'partner' || k === 'boarded';
  const pad = (p, q) => (p && q && ((p.kind === 'bug' && isArt(q.kind)) || (q.kind === 'bug' && isArt(p.kind))) ? 30 : 0);
  const total = list.reduce((s, r) => s + FOOT[r.kind](r.ref), 0) + list.reduce((s, r, i) => s + pad(list[i - 1], r), 0);
  // even gaps; negative when the level is too short (objects then overlap evenly instead of piling up)
  const gapBase = (freeLen - total) / (list.length + 1);
  // map a distance along the free track to a world x
  const trackX = (dist) => { for (const [a, b] of free) { if (dist <= b - a) return a + dist; dist -= (b - a); } return end; };
  const slopeAt = (x0, w) => { let mn = 1e9, mx = -1e9; for (let x = Math.round(x0 - w / 2); x <= Math.round(x0 + w / 2); x++) { const v = gy(x); mn = Math.min(mn, v); mx = Math.max(mx, v); } return mx - mn; };
  const inZone = (c, w) => zones.find(([a, b]) => c + w / 2 > a && c - w / 2 < b);
  const objs = [];
  let dist = Math.max(0, gapBase);
  list.forEach((r, i) => {
    const w = FOOT[r.kind](r.ref);
    dist += pad(list[i - 1], r);
    let cx = trackX(dist + w / 2);
    // keep the footprint off a reserved peak top: slide to the nearer side (local, does not accumulate)
    const z = inZone(cx, w);
    if (z) cx = (cx < (z[0] + z[1]) / 2) ? z[0] - w / 2 - 1 : z[1] + w / 2 + 1;
    // nudge toward flatter ground (+-8 px)
    let best = cx, bs = slopeAt(cx, w);
    for (let dd = -8; dd <= 8; dd += 2) { const c = cx + dd; if (inZone(c, w)) continue; const sl = slopeAt(c, w) + Math.abs(dd) * 0.1; if (sl < bs) { bs = sl; best = c; } }
    objs.push({ kind: r.kind, ref: r.ref, x: Math.round(best), w });
    dist += w + gapBase;
  });
  STATS.gap = Math.round(gapBase * 10) / 10; STATS.freeLen = Math.round(freeLen); STATS.need = Math.round(total);
  for (const p of peaks) objs.push({ kind: 'power', ref: p.i, x: p.x, w: 16, py: p.y - 22 });
  objs.push({ kind: 'bug', ref: 'rc', x: Math.round(summit.x - 30), w: 30, summit: true });
  objs.push({ kind: 'flag', ref: 'summit', x: Math.round(summit.x), w: 16 });
  objs.push({ kind: 'camp', ref: 'tent', x: Math.round(base.x), w: 40 });
  objs.push({ kind: 'campsign', ref: 'basecamp', x: Math.round(base.x + 44), w: 30 });
  return finishLevel(pk, objs, peaks, base, summit, gy);
}
function finishLevel(pk, objs, peaks, base, summit, gy) {
  const W = pk.width, H = pk.height || 216;
  objs.sort((p, q) => p.x - q.x);
  // ids + nearest peak label (for button names such as "near peak 2")
  const near = (x) => { let bi = 0, bd = 1e9; peaks.forEach((p, i) => { const d = Math.abs(p.x - x); if (d < bd) { bd = d; bi = i; } }); return bi + 1; };
  const idOf = (o) => o.kind === 'power' ? 'power-' + C.PILLARS[o.ref].key : o.kind + '-' + o.ref;
  for (const o of objs) { o.id = idOf(o); o.y = gy(o.x); o.near = near(o.x); }
  const sites = pk.sites || {};
  return { width: W, height: H, base: { x: base.x, y: base.y ?? gy(base.x) }, summit: { x: summit.x, y: summit.y ?? gy(summit.x) }, peaks, objects: objs,
    stairs: sites.stairs || null, parallax: pk.parallax || null, ledges: pk.ledges || [] };
}
// Hand-authored route for the artist's level (peaks.json with "sites"): billboards and boarded signs on the
// meadow flats, signposts (one centre post) on the slopes, bugs on our own props only, and the kit's sites for
// the clip-ground beetle, the staircase, the summit sign and the six power-ups. Validated below.
const HAND = [
  ['camp', 'tent', 90], ['campsign', 'basecamp', 175], ['billboard', 'its-only-money', 266], ['billboard', 'yooka-replaylee', 350], ['partner', 'watson', 425], ['photo', 'rooftop', 455],
  ['billboard', 'god-breakers', 'm1+56'], ['partner', 'scott', 'm1+130'], ['bug', 'functional', 'site:clipGround'], ['photo', 'screens', 'm1+254'],
  ['bug', 'compliance', 'p1+55'],
  ['boarded', 'warhammer-survivors', 'm2+26'], ['billboard', 'lost-skies', 'm2+100'], ['billboard', 'wild-blue-skies', 'm2+188'], ['partner', 'allum', 'm2+260'], ['photo', 'desk', 'm2+316'],
  ['bug', 'localisation', 'p2+70'],
  ['billboard', 'lil-gator', 'm3+44'], ['partner', 'wales', 'm3+118'], ['billboard', 'town-of-zoz', 'm3+192'], ['boarded', 'boltgun-2', 'm3+266'], ['photo', 'pair', 'm3+324'],
  ['bug', 'reporting', 'p3+70'],
  ['billboard', 'suzerain', 'm4+43'], ['partner', 'kyne', 'm4+117'], ['billboard', 'cattle-country', 'm4+191'], ['photo', 'company', 'm4+267'], ['bug', 'testcase', 'site:stairs'],
  ['bug', 'usability', 'p4+56'],
  ['boarded', 'witchs-bakery', 'm5+26'], ['billboard', 'whimel-academy', 'm5+98'], ['billboard', 'outrage-fight-fest', 'm5+186'], ['partner', 'harfoot', 'm5+260'], ['partner', 'avent', 'm5+322'],
  ['bug', 'performance', 'p5+50'],
  ['boarded', 'king-of-tokyo', 'm6+25'], ['billboard', 'service-with-a-shotgun', 'm6+93'], ['partner', 'fraser', 'm6+165'], ['billboard', 'grave-dodgers', 'm6+237'], ['partner', 'aikman', 'm6+311'],
  ['bug', 'rc', 'site:summitSign'], ['flag', 'summit', 'site:summitFlag'], ['photo', 'crew', 'site:summitFlag+19'],
];
const W_ = { billboard: 80, boarded: 48, partner: 52, photo: 12, camp: 32, campsign: 88, flag: 16 };
const BUGW = { functional: 24, compliance: 32, localisation: 48, reporting: 16, testcase: 40, usability: 32, performance: 16, rc: 48 };
function handLevel(pk) {
  const g = pk.ground, W = pk.width, at = (x) => g[Math.max(0, Math.min(W - 1, Math.round(x)))];
  const sites = pk.sites || {};
  const objs = [];
  for (const [kind, ref, xs] of HAND) {
    // positions: absolute (base camp), meadow-relative (m<n>+dx), peak-relative (p<n>+dx) or a kit site
    let x = xs;
    const mm = typeof xs === 'string' && xs.match(/^([mp])(\d)\+(-?\d+)$/);
    const ss = typeof xs === 'string' && xs.match(/^site:(\w+)(?:\+(-?\d+))?$/);
    if (mm) x = (mm[1] === 'm' ? pk.meadows[+mm[2] - 1].x0 : pk.peaks[+mm[2] - 1].x) + +mm[3];
    else if (ss) {
      const k = ss[1], dx = +(ss[2] || 0);
      if (k === 'stairs') x = sites.stairs.x + 20;
      else if (k === 'summitFlag') x = (sites.summitFlag ? sites.summitFlag.x : pk.summit.x + 14) + dx;
      else x = sites[k].x + dx;
    }
    const o = { kind, ref, x, w: kind === 'bug' ? BUGW[ref] : W_[kind] };
    if (kind === 'bug' && ref === 'performance') o.zone = [-40, 20];   // the stutter zone, kept 34+ px clear of any art
    if (kind === 'bug' && ref === 'testcase' && sites.stairs) { o.x0 = sites.stairs.x; o.foot = sites.stairs.y; }
    objs.push(o);
  }
  pk.peaks.forEach((p, i) => { const s = (sites.powerUps || [])[i]; objs.push({ kind: 'power', ref: i, x: s ? s.x : p.x, w: 16, py: s ? s.y : at(p.x) - 22 }); });
  // validation: wide frames need gentle ground; bugs keep 40 px from partner art; nothing overlaps
  const warn = [];
  const span = (x0, w) => { let mn = 1e9, mx = -1e9; for (let x = Math.round(x0); x < x0 + w; x++) { const v = at(x); mn = Math.min(mn, v); mx = Math.max(mx, v); } return mx - mn; };
  for (const o of objs) if ((o.kind === 'billboard' || o.kind === 'boarded') && span(o.x - o.w / 2, o.w) > 6) warn.push(`${o.kind} ${o.ref} on ${span(o.x - o.w / 2, o.w)} px of slope`);
  const solid = objs.filter((o) => o.kind !== 'power' && o.kind !== 'photo').sort((a, b) => a.x - b.x);
  for (let i = 1; i < solid.length; i++) { const a = solid[i - 1], b = solid[i]; const gap = (b.x - b.w / 2) - (a.x + a.w / 2); if (gap < 4) warn.push(`tight: ${a.ref} | ${b.ref} gap ${gap}`); }
  const art = objs.filter((o) => ['billboard', 'boarded', 'partner'].includes(o.kind));
  // demo faults stay in our own ground: every bug (its stutter zone included) keeps 34+ px from titles and partner signs
  const ext = (b) => { const l = Math.min(b.x - b.w / 2, b.zone ? b.x + b.zone[0] : 1e9), r = Math.max(b.x + b.w / 2, b.zone ? b.x + b.zone[1] : -1e9); return [l, r]; };
  STATS.bugGaps = {};
  for (const b of objs.filter((o) => o.kind === 'bug')) {
    const [l, r] = ext(b); let min = 1e9;
    for (const a of art) { const gap = Math.max(a.x - a.w / 2 - r, l - (a.x + a.w / 2)); min = Math.min(min, gap); if (gap < 34) warn.push(`bug ${b.ref} ${Math.round(gap)} px from ${a.ref}`); }
    STATS.bugGaps[b.ref] = Math.round(min);
  }
  STATS.warnings = warn;
  return objs;
}

const level = kit.peaks ? solveLevel(kit.peaks) : null;

// ---------- data blob ----------
const DATA = {
  version: 1,
  meta: C.META, hero: C.HERO,
  pillars: C.PILLARS, services, quotes,
  games: games.map(({ cats, items, ...g }) => g),
  photos: C.PHOTOS, stats: C.STATS, teamBody: C.TEAM_BODY, management: { intro: C.MANAGEMENT_INTRO, people: C.MANAGEMENT },
  careers: C.CAREERS, contact: C.CONTACT, underwayLine: C.UNDERWAY_LINE,
  level,
};
const KIT = {
  ready: kit.ready, placeholderPeaks: kit.placeholder,
  images: kitImg,
  sprites: SPR,
  peaks: kit.peaks ? { width: kit.peaks.width, height: kit.peaks.height, ground: kit.peaks.ground, peaks: kit.peaks.peaks, baseCamp: kit.peaks.baseCamp, summit: kit.peaks.summit, surface: kit.peaks.surface || null } : null,
  palette: kit.palette,
  titleBlocks: kit.titleBlocks,
};

// ---------- markup helpers ----------
const spr = (name, s, extra = '', label = '') => {
  const f = F[name];
  const lab = label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"';
  if (!f || !SPR.atlas) return `<i class="spr spr-missing ${extra}" style="--w:16;--h:16;--s:${s}"${lab}></i>`;
  return `<i class="spr ${extra}" style="--x:${f.x};--y:${f.y};--w:${f.w};--h:${f.h};--s:${s}"${lab}></i>`;
};
const platRow = (list, cls) => `<ul class="${cls}" role="list">` + list.map((p) =>
  `<li><img src="${p.icon}" alt="" width="${p.w || 24}" height="${p.h || 24}" decoding="async"${cls.includes('lazy') ? ' loading="lazy"' : ''}><span>${esc(p.name)}</span></li>`).join('') + '</ul>';
const allPlats = C.PLATFORMS.map((p) => ({ icon: 'assets/platforms/' + p.slug + '.webp', name: p.name, w: p.w, h: p.h }));
const gameLink = (g) => `<a href="#log-${g.slug}">${esc(g.title)}</a>`;

function formHTML(prefix, heading) {
  const id = (n) => prefix + '-' + n;
  return `<form class="post-form" id="${id('form')}" novalidate aria-labelledby="${id('h')}">
  <h3 class="form-h" id="${id('h')}">${esc(heading)}</h3>
  <div class="field-row">
    <div class="field"><label for="${id('name')}">Name</label><input id="${id('name')}" name="name" autocomplete="given-name" required></div>
    <div class="field"><label for="${id('surname')}">Surname</label><input id="${id('surname')}" name="surname" autocomplete="family-name"></div>
  </div>
  <div class="field-row">
    <div class="field"><label for="${id('phone')}">Call Number</label><input id="${id('phone')}" name="phone" type="tel" autocomplete="tel"></div>
    <div class="field"><label for="${id('email')}">Email Address</label><input id="${id('email')}" name="email" type="email" autocomplete="email" required></div>
  </div>
  <div class="field"><label for="${id('reason')}">Reason For Contact</label><select id="${id('reason')}" name="reason"><option value="">Choose a reason</option>${C.CONTACT.reasons.map((r) => `<option${r.includes('trial') ? ' data-trial' : ''}>${esc(r)}</option>`).join('')}</select></div>
  <div class="field"><label for="${id('comment')}">Comment</label><textarea id="${id('comment')}" name="comment" rows="4"></textarea></div>
  <p class="form-error" id="${id('err')}" role="alert" hidden></p>
  <button class="btn btn-red" type="submit">Submit Your Request</button>
  <div class="form-done" id="${id('done')}" role="status" tabindex="-1" hidden>
    <p class="form-done-h">Request ready</p>
    <p>This preview does not send anything. On the live site, your request goes to the Six Peaks team.</p>
  </div>
</form>`;
}
function detailsHTML(prefix) {
  return `<dl class="details">
  <div><dt>Head Office</dt><dd>${esc(C.CONTACT.office)}</dd></div>
  <div><dt>Phone</dt><dd><span class="sel" id="${prefix}-phone-v">${esc(C.CONTACT.phone)}</span> <button class="btn btn-mini copy" type="button" data-copy="${prefix}-phone-v" aria-label="Copy phone number">Copy</button></dd></div>
  <div><dt>Email</dt><dd><span class="sel" id="${prefix}-email-v">${esc(C.CONTACT.email)}</span> <button class="btn btn-mini copy" type="button" data-copy="${prefix}-email-v" aria-label="Copy email address">Copy</button></dd></div>
</dl>`;
}

// ---------- manual ----------
function manualHTML() {
  const shipped = games.filter((g) => g.released);
  const pillars = C.PILLARS.map((p, i) => `<li class="pillar">
      ${spr('power_' + p.key, 3, 'pillar-ico')}
      <h3 class="pillar-h"><span class="pillar-peak">Peak ${i + 1}</span> ${esc(p.title)}</h3>
      <p>${esc(p.text)}</p>
    </li>`).join('\n');
  const serviceCards = services.map((s) => `<li class="svc" id="svc-${s.key}">
      <div class="svc-glyph">${spr('bug_' + s.key + '_0', 4, '', '')}</div>
      <div class="svc-body">
        <h3 class="svc-h">${esc(s.name)}</h3>
        <p>${esc(s.text)}</p>
        <p class="svc-bug"><span class="svc-tag">Demo bug</span> <strong>${esc(s.bug)}</strong>: ${esc(s.fault)}</p>
      </div>
    </li>`).join('\n');
  const gameRows = games.map((g) => {
    const plats = g.platforms.map((p) => `<li><img src="${p.icon}" alt="" width="20" height="20" loading="lazy" decoding="async"><span>${esc(p.name)}</span></li>`).join('');
    const credit = `<p class="g-credit">In partnership with <strong>${esc(g.partner)}</strong></p>`;
    if (!g.released) return `<li class="g g-under" id="title-${g.slug}">
      <div class="g-art g-art-under"><img src="${g.logo.src}" alt="${esc(g.logo.alt)}" width="200" height="120" loading="lazy" decoding="async"></div>
      <div class="g-body">
        <p class="g-status"><span class="chip chip-under">Underway</span></p>
        <h3 class="g-h">${esc(g.title)}</h3>
        ${credit}
        <p class="g-one">${esc(g.oneLiner)}</p>
        <p class="g-under-line">${esc(C.UNDERWAY_LINE)}</p>
      </div>
    </li>`;
    return `<li class="g" id="title-${g.slug}">
      <div class="g-art"><img src="${g.poster.src}" alt="${esc(g.title)} poster" width="405" height="687" loading="lazy" decoding="async"></div>
      <div class="g-body">
        <p class="g-status"><span class="chip chip-released">Released</span></p>
        <h3 class="g-h">${esc(g.title)}</h3>
        ${credit}
        <p class="g-one">${esc(g.oneLiner)}</p>
        <h4 class="g-sub">Key Testing Focus</h4>
        <ul class="g-focus" role="list">${g.focus.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        <ul class="g-plats" role="list" aria-label="Platforms">${plats}</ul>
        <p class="g-more"><a class="lnk" href="#log-${g.slug}">See its billboard in the level</a></p>
      </div>
    </li>`;
  }).join('\n');
  const quoteCards = quotes.map((q) => `<li class="q" id="quote-${q.id}">
      <figure>
        <img class="q-logo" src="${q.logoColour.src}" alt="${esc(q.logoColour.alt)}" width="${q.logoColour.w}" height="${q.logoColour.h}" loading="lazy" decoding="async">
        <blockquote><p>“${esc(q.text)}”</p></blockquote>
        <figcaption><strong>${esc(q.name)}</strong>, ${esc(q.role)} <span class="q-studio">(${esc(q.studio)})</span></figcaption>
      </figure>
    </li>`).join('\n');
  const logos = C.PARTNERS.map((p) => { const l = partnerLogo(p.slug, true); return `<li><img src="${l.src}" alt="${esc(l.alt)}" width="${l.w}" height="${l.h}" loading="lazy" decoding="async"></li>`; }).join('');
  const stats = C.STATS.map((s) => `<li class="stat"><p class="stat-fig">${esc(s.figure)}</p><h3 class="stat-h">${esc(s.label)}</h3><p>${esc(s.text)}</p></li>`).join('');
  const mgmt = C.MANAGEMENT.map((m) => `<li class="person">
      <img src="${m.img}" alt="${esc(m.name)}" width="336" height="424" loading="lazy" decoding="async">
      <h4 class="person-h">${esc(m.name)}</h4>
      <p>${esc(m.role)}</p>
      <p><a class="lnk" href="${m.linkedin}" target="_blank" rel="noopener">LinkedIn<span class="sr-only"> profile of ${esc(m.name)} (opens in a new tab)</span></a></p>
    </li>`).join('');
  return `
<section class="m-cover" id="manual-top" aria-labelledby="m-title">
  <div class="m-wrap m-cover-grid">
    <div class="m-cover-copy">
      <p class="kicker">Instruction manual · Game QA Studio · Embedded Game Testing</p>
      <h2 class="m-title" id="m-title">${esc(C.HERO.h1)}</h2>
      <p class="m-lede">${esc(C.HERO.sub)}</p>
      ${C.OFFER.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
      <div class="cta-pair">
        <a class="btn btn-red" href="#m-contact" data-scroll="m-contact">Book a trial</a>
        <a class="btn btn-ink" href="#play">Play the test run</a>
      </div>
    </div>
    <div class="m-side">
    <div class="m-scene" aria-hidden="true">
      <span class="m-scene-sky"></span>
      ${spr('prop_tree_2', 3, 'sc-tree')}${spr('prop_signpost', 3, 'sc-post')}${spr('tester_inspect_0', 6, 'sc-tester')}${spr('fault_clip_ground', 6, 'sc-bug')}${spr('reticle_1', 6, 'sc-ret')}
      <span class="m-scene-ground"></span>
    </div>
    <nav class="m-toc" aria-label="Manual contents">
      <p class="m-toc-h">Contents</p>
      <ol role="list">
        <li><a href="#m-why" data-scroll="m-why">Why Six Peaks</a><span>6 pillars</span></li>
        <li><a href="#m-services" data-scroll="m-services">Services and the bestiary</a><span>8 services</span></li>
        <li><a href="#m-titles" data-scroll="m-titles">Our projects</a><span>17 titles</span></li>
        <li><a href="#m-partners" data-scroll="m-partners">What our partners say</a><span>15 partners</span></li>
        <li><a href="#m-team" data-scroll="m-team">Our dedicated team</a><span>George, Western Cape</span></li>
        <li><a href="#m-careers" data-scroll="m-careers">Careers</a><span>Apply now</span></li>
        <li><a href="#m-contact" data-scroll="m-contact">Contact</a><span>Book a trial</span></li>
      </ol>
      <p class="m-toc-tested">Tested on</p>
      ${platRow(allPlats, 'plat-row plat-ink lazy')}
    </nav>
    </div>
  </div>
</section>

<section class="m-sec" id="m-why" aria-labelledby="m-why-h">
  <div class="m-wrap">
    <header class="m-head"><span class="m-ico">${spr('power_excellent', 3)}</span><p class="kicker">What we offer</p><h2 class="m-h" id="m-why-h">Why Six Peaks</h2>
    <p class="m-intro">Six peaks, six pillars. Each one is a power-up at a summit in the test level.</p></header>
    <ol class="pillars" role="list">
${pillars}
    </ol>
    <figure class="pull">
      <blockquote><p>“${esc(C.PULL_QUOTE.text)}”</p></blockquote>
      <figcaption><strong>${esc(C.PULL_QUOTE.name)}</strong>, ${esc(C.PULL_QUOTE.role)} (${esc(C.PULL_QUOTE.studio)})</figcaption>
    </figure>
  </div>
</section>

<section class="m-sec m-sec-alt" id="m-services" aria-labelledby="m-services-h">
  <div class="m-wrap">
    <header class="m-head"><span class="m-ico">${spr('bug_functional_0', 3)}</span><p class="kicker">Our services</p><h2 class="m-h" id="m-services-h">Services and the bestiary</h2>
    <p class="m-intro">Eight services, eight demo bugs. We planted one of each in our own test level, never in a partner’s game, so you can log them yourself.</p></header>
    <ul class="svcs" role="list">
${serviceCards}
    </ul>
  </div>
</section>

<section class="m-sec" id="m-titles" aria-labelledby="m-titles-h">
  <div class="m-wrap">
    <header class="m-head"><span class="m-ico">${spr('prop_flag_0', 2)}</span><p class="kicker">Our projects · ${games.length} titles</p><h2 class="m-h" id="m-titles-h">Our projects</h2>
    <p class="m-intro">${esc(C.PROJECTS_INTRO)}</p></header>
    <ul class="games" role="list">
${gameRows}
    </ul>
  </div>
</section>

<section class="m-sec m-sec-alt" id="m-partners" aria-labelledby="m-partners-h">
  <div class="m-wrap">
    <header class="m-head"><span class="m-ico">${spr('prop_signpost', 2)}</span><p class="kicker">Our partners · ${C.PARTNERS.length} studios</p><h2 class="m-h" id="m-partners-h">What our partners say</h2></header>
    <ul class="quotes" role="list">
${quoteCards}
    </ul>
    <h3 class="m-h3">Our partners</h3>
    <ul class="logo-wall" role="list">${logos}</ul>
  </div>
</section>

<section class="m-sec" id="m-team" aria-labelledby="m-team-h">
  <div class="m-wrap">
    <header class="m-head"><span class="m-ico">${spr('power_team', 3)}</span><p class="kicker">George, Western Cape</p><h2 class="m-h" id="m-team-h">Our dedicated team</h2></header>
    <ul class="stats" role="list">${stats}</ul>
    <div class="team-grid">
      <figure class="team-photo"><img src="assets/brand/team-1.webp" alt="${esc(C.PHOTOS[0].alt)}" width="1900" height="890" loading="lazy" decoding="async"></figure>
      <div class="team-copy">${C.TEAM_BODY.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </div>
    <h3 class="m-h3">Our management team</h3>
    <p class="m-intro">${esc(C.MANAGEMENT_INTRO)}</p>
    <ul class="people" role="list">${mgmt}</ul>
    <figure class="team-photo team-photo-wide"><img src="assets/brand/team-4.webp" alt="${esc(C.PHOTOS[3].alt)}" width="1900" height="890" loading="lazy" decoding="async"></figure>
  </div>
</section>

<section class="m-sec m-sec-alt" id="m-careers" aria-labelledby="m-careers-h">
  <div class="m-wrap careers">
    <div>
      <header class="m-head"><span class="m-ico">${spr('tester_idle_0', 2)}</span><p class="kicker">Join the team</p><h2 class="m-h" id="m-careers-h">Careers</h2></header>
      ${C.CAREERS.text.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
      <p><a class="btn btn-red" href="${C.CAREERS.url}" target="_blank" rel="noopener">Apply Now<span class="sr-only"> (opens in a new tab)</span></a></p>
    </div>
    <figure class="careers-photo"><img src="assets/brand/vert-10.webp" alt="${esc(C.PHOTOS[4].alt)}" width="864" height="1092" loading="lazy" decoding="async"></figure>
  </div>
</section>

<section class="m-sec" id="m-contact" aria-labelledby="m-contact-h">
  <div class="m-wrap contact">
    <div>
      <header class="m-head"><span class="m-ico">${spr('prop_tent', 2)}</span><p class="kicker">Book a trial</p><h2 class="m-h" id="m-contact-h">Contact</h2></header>
      <p>${esc(C.CONTACT.text)}</p>
      ${detailsHTML('mc')}
    </div>
    ${formHTML('mf', 'Send a request')}
  </div>
</section>`;
}

// ---------- overlay index (every in-world object as a real button) ----------
function indexHTML() {
  if (!level) return '<p class="idx-empty">The level list appears once the level has loaded.</p>';
  const label = (o) => {
    switch (o.kind) {
      case 'bug': { const s = services.find((x) => x.key === o.ref); return `Report demo bug: ${s.bug}, ${o.ref === 'rc' ? 'at the summit' : 'near peak ' + o.near}`; }
      case 'partner': { const q = quotes.find((x) => x.id === o.ref); return `Read sign: ${q.name}, ${q.studio}`; }
      case 'billboard': return `Open title: ${gameBySlug[o.ref].title}, with ${gameBySlug[o.ref].partner}`;
      case 'boarded': return `Underway title: ${gameBySlug[o.ref].title}, with ${gameBySlug[o.ref].partner}`;
      case 'power': return `Peak ${o.ref + 1} power-up: ${C.PILLARS[o.ref].title}`;
      case 'photo': { const p = C.PHOTOS.find((x) => x.id === o.ref); return `Pick up photo: ${p.caption.replace(/\.$/, '')}`; }
      case 'camp': return 'Base camp post: Book a trial';
      case 'flag': return 'Summit flag: run report';
      default: return null;
    }
  };
  const groups = [
    ['Demo bugs', (o) => o.kind === 'bug'], ['Partners', (o) => o.kind === 'partner'], ['Titles', (o) => o.kind === 'billboard' || o.kind === 'boarded'],
    ['Peaks', (o) => o.kind === 'power'], ['Photos', (o) => o.kind === 'photo'], ['Places', (o) => o.kind === 'camp' || o.kind === 'flag'],
  ];
  return groups.map(([h, fn]) => {
    const items = level.objects.filter(fn);
    return `<div class="idx-group"><h3 class="idx-h">${h} <span>(${items.length})</span></h3><ul role="list">` +
      items.map((o) => `<li><button class="idx-btn" type="button" data-obj="${o.id}"><span class="idx-label">${esc(label(o))}</span><span class="idx-state"></span></button></li>`).join('') + '</ul></div>';
  }).join('');
}

function bestiaryHTML() {
  return '<ul class="bestiary" role="list">' + services.map((s) => `<li>${spr('bug_' + s.key + '_0', 3, 'b-glyph')}<span class="b-name">${esc(s.bug)}</span><span class="b-svc">${esc(s.name)}</span></li>`).join('') + '</ul>';
}

// ---------- inject ----------
let html = fs.readFileSync(PAGE, 'utf8');
const put = (name, content) => {
  const re = new RegExp(`<!--a2:${name}-->[\\s\\S]*?<!--/a2:${name}-->`);
  if (!re.test(html)) throw new Error('marker missing: ' + name);
  html = html.replace(re, `<!--a2:${name}-->${content}<!--/a2:${name}-->`);
};
const putJSON = (id, obj) => {
  const re = new RegExp(`(<script type="application/json" id="${id}">)[\\s\\S]*?(</script>)`);
  if (!re.test(html)) throw new Error('json block missing: ' + id);
  const s = JSON.stringify(obj).replace(/</g, '\\u003c');
  html = html.replace(re, (m, a, b) => a + s + b);
};
put('manual', manualHTML());
put('index', indexHTML());
put('bestiary', bestiaryHTML());
put('platforms', platRow(allPlats, 'plat-row'));
put('titlelogo', kitImg['title-logo.png']
  ? `<img class="t-logo-px" id="t-logo-img" src="${kitImg['title-logo.png'].src}" alt="Six Peaks Games" width="${kitImg['title-logo.png'].w * 3}" height="${kitImg['title-logo.png'].h * 3}" decoding="async">`
  : '<img class="t-logo-fallback" id="t-logo-img" src="assets/brand/logo-white.webp" alt="Six Peaks Games" width="1864" height="902" decoding="async">');
put('postform', formHTML('pf', 'Book a trial') + detailsHTML('pc'));
{
  // CSS custom properties for the atlas and the no-JS parallax backdrop (inside the single <style>).
  let css = SPR && SPR.atlas && kit.files['sprites.png'] ? `:root{--atlas:url(${kit.files['sprites.png']});--aw:${SPR.atlas.w};--ah:${SPR.atlas.h}}` : ':root{--aw:1;--ah:1}';
  const layers = ['bg-mid.png', 'bg-far.png', 'sky.png'].filter((f) => kit.files[f]);
  if (layers.length) css += `.game{--bg-layers:${layers.map((f) => 'url(' + kit.files[f] + ')').join(',')};--bg-size:${layers.map(() => 'auto 100%').join(',')};--bg-pos:${layers.map(() => 'left bottom').join(',')}}`;
  const re = /\/\*a2:spritevars\*\/[\s\S]*?\/\*\/a2:spritevars\*\//;
  if (!re.test(html)) throw new Error('css marker missing: spritevars');
  html = html.replace(re, '/*a2:spritevars*/' + css + '/*/a2:spritevars*/');
}
putJSON('a2-data', DATA);
putJSON('a2-kit', KIT);
fs.writeFileSync(PAGE, html);
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`page.html ${kb(Buffer.byteLength(html))} · data ${kb(JSON.stringify(DATA).length)} · kit ${kb(JSON.stringify(KIT).length)} · sprites ${SPR ? Object.keys(F).length : 0} frames · level ${level ? level.objects.length + ' objects' : 'none'}${kit.placeholder ? ' (PLACEHOLDER peaks)' : ''}`);
if (level) {
  console.log('placement:', JSON.stringify(STATS));
  if (STATS.warnings && STATS.warnings.length) console.log('layout warnings:\n  ' + STATS.warnings.join('\n  ')); else if (STATS.warnings) console.log('layout: 0 warnings');
  if (STATS.bugGaps) console.log('bug clearances (px to nearest title/partner art): ' + JSON.stringify(STATS.bugGaps));
  const by = {}; for (const o of level.objects) by[o.kind] = (by[o.kind] || 0) + 1;
  console.log('objects:', JSON.stringify(by));
}
