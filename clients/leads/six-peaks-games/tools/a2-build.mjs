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
  if (/^(billboard|sign)-[a-z0-9-]+\.png$/.test(f) || ['sprites.png', 'sky.png', 'bg-far.png', 'bg-mid.png', 'title-logo.png'].includes(f)) {
    kitImg[f] = { src: 'assets/pixel/' + f, ...pngSize(path.join(PIX, f)) };
  }
}
kit.ready = !!(kit.sprites && kit.files['sprites.png']);

// Normalise sprites.json into { frames: { name: {x,y,w,h, ax?, ay?} }, atlas: {w,h} }.
function normSprites(js) {
  if (!js) return null;
  let frames = js.frames || js.sprites || js;
  const out = {};
  const add = (name, f) => {
    if (!f) return;
    const r = f.frame || f.rect || f;
    const x = r.x ?? r[0], y = r.y ?? r[1], w = r.w ?? r.width ?? r[2], h = r.h ?? r.height ?? r[3];
    if ([x, y, w, h].some((v) => typeof v !== 'number')) return;
    const o = { x, y, w, h };
    const piv = f.anchor || f.pivot || f.origin;
    if (piv && typeof piv.x === 'number') { o.ax = piv.x; o.ay = piv.y; }
    for (const k of ['window', 'solid', 'hit', 'note']) if (f[k] !== undefined) o[k] = f[k];
    out[name] = o;
  };
  if (Array.isArray(frames)) frames.forEach((f) => add(f.name || f.filename || f.id, f));
  else for (const [k, v] of Object.entries(frames)) { if (k === 'meta') continue; add(k.replace(/\.png$/, ''), v); }
  const meta = js.meta || {};
  let atlas = meta.size || js.size || null;
  if (kitImg['sprites.png']) atlas = { w: kitImg['sprites.png'].w, h: kitImg['sprites.png'].h };
  return { frames: out, atlas, meta: { ...meta, size: undefined } };
}
const SPR = normSprites(kit.sprites);
const F = SPR ? SPR.frames : {};

// ---------- games ----------
const gamesRaw = readJSON(path.join(ROOT, 'research', 'games.json'));
const partnerName = Object.fromEntries(C.PARTNERS.map((p) => [p.slug, p.name]));
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
    logo: { src: g.assets.logo, alt: (C.TITLE_FIX[g.slug] || g.title) + ' logo' },
    poster: { src: g.assets.poster, w: 405, h: 687 },
    key: released ? { src: g.assets.key, w: 1900, h: 792 } : null,
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
  partner: () => fw('signpost', 22), photo: () => 14, billboard: () => fw('billboard', 84), boarded: () => fw('boarded', 52),
  bug: (k) => ({ functional: 24, compliance: fw('fault_compliance', 30), localisation: fw('fault_localisation', 40), reporting: 20,
    testcase: fw('fault_testcase', 72), usability: fw('fault_usability', 30), performance: 96, rc: 30 }[k] || 28),
};
function solveLevel(pk) {
  const W = pk.width, H = pk.height || 216, ground = pk.ground;
  const gy = (x) => ground[Math.max(0, Math.min(W - 1, Math.round(x)))];
  const peaks = pk.peaks.map((p, i) => ({ i, x: p.x, y: p.y ?? gy(p.x) }));
  const base = pk.baseCamp || { x: 96, y: gy(96) };
  const summit = pk.summit || peaks[peaks.length - 1];
  const start = base.x + 84, end = summit.x - 36;
  // free intervals between reserved zones (peak tops +-22, summit zone)
  const reserved = peaks.map((p) => [p.x - 22, p.x + 22]).concat([[summit.x - 60, W]]);
  // assign each non-power object to the gap before its peak, as listed in ROUTE
  const groups = []; let cur = [];
  for (const r of ROUTE) { if (r.kind === 'power') { groups.push(cur); cur = []; } else cur.push(r); }
  if (cur.length) groups[groups.length - 1] = groups[groups.length - 1].concat(cur);
  const objs = [];
  const bounds = [];
  for (let g = 0; g < groups.length; g++) {
    const a = g === 0 ? start : peaks[g - 1].x + 26;
    const b = g < peaks.length ? peaks[g].x - 26 : end;
    bounds.push([a, b]);
  }
  // spill: if a gap is too crowded move items forward/back so each gap has room
  const need = (list) => list.reduce((s, r) => s + FOOT[r.kind](r.ref) + 30, 0);
  for (let pass = 0; pass < 6; pass++) {
    for (let g = 0; g < groups.length; g++) {
      const [a, b] = bounds[g];
      while (groups[g].length > 1 && need(groups[g]) > (b - a)) {
        const nx = g + 1 < groups.length && need(groups[g + 1]) < bounds[g + 1][1] - bounds[g + 1][0] - 60 ? g + 1 : (g > 0 ? g - 1 : -1);
        if (nx < 0) break;
        if (nx > g) groups[nx].unshift(groups[g].pop()); else groups[nx].push(groups[g].shift());
      }
    }
  }
  const slopeAt = (x0, w) => { let mn = 1e9, mx = -1e9; for (let x = Math.round(x0 - w / 2); x <= Math.round(x0 + w / 2); x++) { const v = gy(x); mn = Math.min(mn, v); mx = Math.max(mx, v); } return mx - mn; };
  for (let g = 0; g < groups.length; g++) {
    const [a, b] = bounds[g]; const list = groups[g]; if (!list.length) continue;
    const total = list.reduce((s, r) => s + FOOT[r.kind](r.ref), 0);
    const gap = Math.max(18, ((b - a) - total) / (list.length + 1));
    let x = a + gap;
    for (const r of list) {
      const w = FOOT[r.kind](r.ref);
      let cx = x + w / 2;
      // nudge toward flatter ground within +-14 px, staying in the gap
      let best = cx, bs = slopeAt(cx, w);
      for (let d = -14; d <= 14; d += 2) { const c = cx + d; if (c - w / 2 < a || c + w / 2 > b) continue; const s = slopeAt(c, w) + Math.abs(d) * 0.08; if (s < bs) { bs = s; best = c; } }
      cx = Math.round(best);
      objs.push({ kind: r.kind, ref: r.ref, x: cx, w, gap: g });
      x += w + gap;
    }
  }
  for (const p of peaks) objs.push({ kind: 'power', ref: p.i, x: p.x, w: 16, gap: p.i });
  objs.push({ kind: 'bug', ref: 'rc', x: Math.round(summit.x - 30), w: 30, gap: 5, summit: true });
  objs.push({ kind: 'flag', ref: 'summit', x: Math.round(summit.x), w: 16, gap: 5 });
  objs.push({ kind: 'camp', ref: 'tent', x: Math.round(base.x), w: 40, gap: 0 });
  objs.push({ kind: 'campsign', ref: 'basecamp', x: Math.round(base.x + 44), w: 30, gap: 0 });
  objs.sort((p, q) => p.x - q.x);
  // ids + nearest peak label (for button names such as "near peak 2")
  const near = (x) => { let bi = 0, bd = 1e9; peaks.forEach((p, i) => { const d = Math.abs(p.x - x); if (d < bd) { bd = d; bi = i; } }); return bi + 1; };
  const idOf = (o) => o.kind === 'power' ? 'power-' + C.PILLARS[o.ref].key : o.kind + '-' + o.ref;
  for (const o of objs) { o.id = idOf(o); o.y = gy(o.x); o.near = near(o.x); }
  return { width: W, height: H, base: { x: base.x, y: base.y ?? gy(base.x) }, summit: { x: summit.x, y: summit.y ?? gy(summit.x) }, peaks, objects: objs };
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
  peaks: kit.peaks ? { width: kit.peaks.width, height: kit.peaks.height, ground: kit.peaks.ground, peaks: kit.peaks.peaks, baseCamp: kit.peaks.baseCamp, summit: kit.peaks.summit } : null,
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
</section>

<section class="m-sec" id="m-why" aria-labelledby="m-why-h">
  <div class="m-wrap">
    <header class="m-head"><p class="kicker">What we offer</p><h2 class="m-h" id="m-why-h">Why Six Peaks</h2>
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
    <header class="m-head"><p class="kicker">Our services</p><h2 class="m-h" id="m-services-h">Services and the bestiary</h2>
    <p class="m-intro">Eight services, eight demo bugs. We planted one of each in our own test level, never in a partner’s game, so you can log them yourself.</p></header>
    <ul class="svcs" role="list">
${serviceCards}
    </ul>
  </div>
</section>

<section class="m-sec" id="m-titles" aria-labelledby="m-titles-h">
  <div class="m-wrap">
    <header class="m-head"><p class="kicker">Our projects · ${games.length} titles</p><h2 class="m-h" id="m-titles-h">Our projects</h2>
    <p class="m-intro">${esc(C.PROJECTS_INTRO)}</p></header>
    <ul class="games" role="list">
${gameRows}
    </ul>
  </div>
</section>

<section class="m-sec m-sec-alt" id="m-partners" aria-labelledby="m-partners-h">
  <div class="m-wrap">
    <header class="m-head"><p class="kicker">Our partners · ${C.PARTNERS.length} studios</p><h2 class="m-h" id="m-partners-h">What our partners say</h2></header>
    <ul class="quotes" role="list">
${quoteCards}
    </ul>
    <h3 class="m-h3">Our partners</h3>
    <ul class="logo-wall" role="list">${logos}</ul>
  </div>
</section>

<section class="m-sec" id="m-team" aria-labelledby="m-team-h">
  <div class="m-wrap">
    <header class="m-head"><p class="kicker">George, Western Cape</p><h2 class="m-h" id="m-team-h">Our dedicated team</h2></header>
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
      <header class="m-head"><p class="kicker">Join the team</p><h2 class="m-h" id="m-careers-h">Careers</h2></header>
      ${C.CAREERS.text.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
      <p><a class="btn btn-red" href="${C.CAREERS.url}" target="_blank" rel="noopener">Apply Now<span class="sr-only"> (opens in a new tab)</span></a></p>
    </div>
    <figure class="careers-photo"><img src="assets/brand/vert-10.webp" alt="${esc(C.PHOTOS[4].alt)}" width="864" height="1092" loading="lazy" decoding="async"></figure>
  </div>
</section>

<section class="m-sec" id="m-contact" aria-labelledby="m-contact-h">
  <div class="m-wrap contact">
    <div>
      <header class="m-head"><p class="kicker">Book a trial</p><h2 class="m-h" id="m-contact-h">Contact</h2></header>
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
      items.map((o) => `<li><button class="idx-btn" type="button" data-obj="${o.id}"><span class="idx-label">${esc(label(o))}</span><span class="idx-state" aria-hidden="true"></span></button></li>`).join('') + '</ul></div>';
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
put('postform', formHTML('pf', 'Book a trial') + detailsHTML('pc'));
put('spritevars', SPR && SPR.atlas && kit.files['sprites.png']
  ? `<style id="a2-sprite-vars">:root{--atlas:url(${kit.files['sprites.png']});--aw:${SPR.atlas.w};--ah:${SPR.atlas.h}}</style>` : '<style id="a2-sprite-vars">:root{--aw:1;--ah:1}</style>');
putJSON('a2-data', DATA);
putJSON('a2-kit', KIT);
fs.writeFileSync(PAGE, html);
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`page.html ${kb(Buffer.byteLength(html))} · data ${kb(JSON.stringify(DATA).length)} · kit ${kb(JSON.stringify(KIT).length)} · sprites ${SPR ? Object.keys(F).length : 0} frames · level ${level ? level.objects.length + ' objects' : 'none'}${kit.placeholder ? ' (PLACEHOLDER peaks)' : ''}`);
if (level) {
  const by = {}; for (const o of level.objects) by[o.kind] = (by[o.kind] || 0) + 1;
  console.log('objects:', JSON.stringify(by));
}
