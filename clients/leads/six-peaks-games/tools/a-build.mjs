#!/usr/bin/env node
// Direction A (The Ascent) build helper.
// Regenerates the marked regions of direction-a-ascent/page.html:
//   <!--gen:NAME--> ... <!--/gen:NAME-->
// from research/games.json, the files in assets/web/ and the seeded ridge generator.
// Copy stays verbatim; the only edits are house-law punctuation (no em dashes, no
// spaced en dashes) and de-duplicated service items. Missing assets are skipped and
// listed as gaps, never replaced by a drawing.
// Usage: node tools/a-build.mjs [--check]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as R from './a-ridges.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = path.join(ROOT, 'direction-a-ascent', 'page.html');
const WEB = path.join(ROOT, 'assets', 'web');
const GAMES = JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'games.json'), 'utf8'));
const MANIFEST_FILE = path.join(ROOT, 'assets', 'manifest.json');
const MANIFEST = fs.existsSync(MANIFEST_FILE) ? JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8')) : null;
const gaps = new Set();

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// House law: no em dashes, no spaced en dashes. Ranges keep an unspaced en dash.
export function clean(s) {
  return String(s ?? '')
    .replace(/(\d)\s*[–-]\s*(\d)/g, '$1–$2')
    .replace(/\s+[–—]\s+/g, ': ')
    .replace(/\s*—\s*/g, ', ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}
const pipes = (s) => clean(s).split('|').map((x) => x.trim()).filter(Boolean);
const stripQuotes = (s) => clean(s).replace(/^[“"]+/, '').replace(/[”"]+$/, '').trim();
const endStop = (s) => (/[.!?”]$/.test(s) ? s : s + '.');

function dims(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const c = b.toString('ascii', 12, 16);
    if (c === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (c === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (c === 'VP8L') { const v = b.readUInt32LE(21); return { w: (v & 0x3fff) + 1, h: ((v >> 14) & 0x3fff) + 1 }; }
  }
  if (b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1], len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + len;
    }
  }
  return null;
}
// page-relative path (assets/...) -> {src,w,h} or null
function asset(rel) {
  if (!rel) return null;
  const pageRel = rel.replace(/^assets\/web\//, 'assets/');
  const file = path.join(WEB, pageRel.replace(/^assets\//, ''));
  if (!fs.existsSync(file)) { gaps.add(pageRel); return null; }
  const d = dims(file);
  return d ? { src: pageRel, w: d.w, h: d.h } : null;
}
function img(a, alt, o = {}) {
  if (!a) return '';
  const attrs = [`src="${a.src}"`, `alt="${esc(alt)}"`, `width="${a.w}"`, `height="${a.h}"`];
  if (o.cls) attrs.push(`class="${o.cls}"`);
  if (o.lazy) attrs.push('loading="lazy"', 'decoding="async"');
  if (o.eager) attrs.push('fetchpriority="high"');
  if (o.hidden) attrs.push('aria-hidden="true"');
  return `<img ${attrs.join(' ')}>`;
}
function listDir(sub) {
  const d = path.join(WEB, sub);
  return fs.existsSync(d) ? fs.readdirSync(d).sort() : [];
}

// ---------- games ----------
const NAME_FIX = { 'boltgun-2': 'Warhammer 40,000: Boltgun 2' };
const PARTNER_SHORT = (p) => clean(p).replace(/\s*\(.*\)\s*$/, '');
const PLATFORM = {
  playstation: { name: 'PlayStation', icon: 'playstation' }, xbox: { name: 'Xbox', icon: 'xbox' },
  'nintendo switch': { name: 'Nintendo Switch', icon: 'nintendo' }, steam: { name: 'Steam', icon: 'steam' },
  'steam (dlc)': { name: 'Steam (DLC)', icon: 'steam' }, epic: { name: 'Epic', icon: 'epic' },
  ios: { name: 'iOS', icon: 'apple' }, android: { name: 'Android', icon: 'android' },
};
const platformOf = (p) => PLATFORM[clean(p).toLowerCase()] || { name: clean(p), icon: null };

// Partner logos (white) on disk, matched loosely by name.
const PARTNER_FILES = listDir('partners').filter((f) => /\.(webp|png)$/.test(f) && !/colou?r/i.test(f));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
function partnerLogo(name) {
  const key = norm(name.replace(/^the\s+/i, ''));
  const aliases = { impossiblehome: ['impossibledream', 'impossiblehome'], playtonicfriends: ['playtonicfriends', 'playtonic'], playtonic: ['playtonic', 'playtonicfriends'], hardballgames: ['hardball'], firestokegames: ['firestoke'], silverlininginteractive: ['silverlining', 'silverlininginteractive'], chuhailabs: ['chuhailabs', 'chuhai', 'chuchai'], powellgroup: ['powellgroup', 'powell', 'thepowellgroup'], bossagames: ['bossagames', 'bossa'], humblegames: ['humblegames', 'humble'], balorgames: ['balorgames', 'balor'], aurochdigital: ['aurochdigital', 'auroch'], torporgames: ['torporgames', 'torpor'] };
  const cands = aliases[key] || [key];
  for (const c of cands) {
    const f = PARTNER_FILES.find((f) => norm(f.replace(/\.(webp|png)$/, '').replace(/-?white$/, '')) === c);
    if (f) return asset('assets/partners/' + f);
  }
  for (const c of cands) {
    const f = PARTNER_FILES.find((f) => norm(f).startsWith(c));
    if (f) return asset('assets/partners/' + f);
  }
  gaps.add('partner logo: ' + name);
  return null;
}
const PARTNER_LOGO_NAME = {
  'The Powell Group (Humble Games now Balor Games)': 'Powell Group', 'The Powell Group & Balor Games': 'Powell Group',
  'Playtonic Friends': 'Playtonic Friends', Thunderful: 'Thunderful', 'Torpor Games': 'Torpor Games', Microids: 'Microids',
  'Impossible Home': 'Impossible Home', Hardball: 'Hardball', 'Silver Lining Interactive': 'Silver Lining Interactive',
  'Chuhai Labs': 'Chuhai Labs', Firestoke: 'Firestoke', 'Auroch Digital': 'Auroch Digital',
};

function filterTags(g) {
  const t = [];
  const text = [g.gameMode, g.genre, g.oneLiner, ...(g.card?.keyTestingFocus || [])].join(' ');
  const desc = (g.scope || '').split(/\n\n/)[0];
  if (/co-?op|multiplayer|\d\s*[–-]\s*\d\s*player/i.test(text)) t.push('multiplayer');
  if (g.status === 'released' && /certification|compliance/i.test((g.card?.keyTestingFocus || []).join(' '))) t.push('certification');
  if (/narrative|visual novel/i.test(text + ' ' + desc)) t.push('narrative');
  if (/cozy|wholesome/i.test(text)) t.push('cozy');
  return t;
}

function parseAttribution(a) {
  // "Dani Allum Lead Producer (The Powell Group / Humble)" and variants: keep verbatim text,
  // split only where the site's own punctuation makes it unambiguous.
  return clean(a).replace(/^(\S+ \S+)-(?=[A-Z])/, '$1, ').replace(/^(\S+ [^\s,]+) (?=[A-Z][a-z])/, '$1, ');
}

const G = GAMES.map((g) => {
  const released = g.status === 'released';
  const a = g.assets || {};
  const title = NAME_FIX[g.slug] || clean(g.title);
  const services = (g.servicesProvided || []).map((s) => ({ c: clean(s.category), items: [...new Set(s.items.map(clean))] }));
  const shots = (a.shots || []).map(asset).filter(Boolean);
  return {
    slug: g.slug, title, released,
    partner: clean(g.card?.partner || g.partner), partnerShort: PARTNER_SHORT(g.card?.partner || g.partner),
    oneLiner: clean(g.card?.oneLiner || g.oneLiner),
    focus: released ? (g.card?.keyTestingFocus || g.keyTestingFocus || []).map(clean) : [],
    scope: (g.scope || '').split(/\n\n+/).map(clean).filter(Boolean).map(endStop),
    publisher: clean(g.publisher), developer: clean(g.developer), mode: pipes(g.gameMode), genre: pipes(g.genre),
    platforms: (g.platforms || []).map(platformOf), model: (g.engagementModel || []).map(clean),
    services, trailer: g.trailerUrl ? { url: g.trailerUrl, title: clean(String(g.trailerTitle || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')) } : null,
    testimonials: released ? (g.testimonials || []).map((t) => ({ q: stripQuotes(t.quote).split(/\n\n+/).map((p) => p.trim()).filter(Boolean), by: parseAttribution(t.attribution) })) : [],
    tags: filterTags(g),
    logo: asset(a.logo), poster: asset(a.poster), key: asset(a.key), shots,
    partnerLogo: partnerLogo(PARTNER_LOGO_NAME[clean(g.card?.partner || g.partner)] || PARTNER_SHORT(g.partner)),
    raw: g,
  };
});
const BY = Object.fromEntries(G.map((g) => [g.slug, g]));

// ---------- verbatim site copy (research/site-content.md) ----------
const SERVICES = {
  'Functional QA': 'Testing all functional aspects of your game, including core gameplay systems, UI, progression, saves, integrations, and edge cases, to ensure stable, polished, and release-ready builds throughout development.',
  'Compliance QA': 'Validating platform-holder requirements, including TRCs, TCRs, and Lotchecks standards, across console and storefront submissions, reducing certification risk and preventing costly resubmissions.',
  'Functional Localisation QA': 'Testing the functional implementation of localised content, ensuring text displays correctly, fits within UI constraints, renders properly, and follows regional formatting standards without technical defects.',
  'Bug Reporting & Environment Management': 'Providing clear, reproducible bugs with strong evidence and prioritisation, while keeping test environments, builds, accounts, and permissions organised for smooth delivery.',
  'Test Case Management': 'Designing and maintaining structured test suites to ensure consistent coverage across features, platforms, and releases, helping teams track progress and reduce regression risk.',
  'Usability Testing': 'Evaluating gameplay flow, readability, onboarding, accessibility considerations, and UI clarity to identify friction points and improve the overall player experience.',
  'Performance Testing': 'Identifying crashes, frame rate instability, memory and load issues, and other stability risks, validating smooth performance across consoles, mobile devices, and representative PC configurations.',
  'Release Candidate Oversight': 'Running final pass validation, regression checks, and sign-off support on your RC builds to confirm launch readiness and minimise day-one issues.',
};

// The seven camps. Chips cite verbatim evidence from each game's data and the
// build fails if the evidence is not in that game's focus or services list.
const CAMPS = [
  { id: 'base', stage: 'Base camp', phase: 'Pre-production', services: ['Test Case Management'],
    chips: [['yooka-replaylee', 'Multi-Level Test Coverage'], ['lost-skies', 'Content Coverage & Regression'], ['whimel-academy', 'Ending & Asset Combination Coverage']] },
  { id: 'alpha', stage: 'Camp I', phase: 'Alpha', services: ['Functional QA', 'Bug Reporting & Environment Management'],
    chips: [['wild-blue-skies', 'Core Gameplay Testing'], ['town-of-zoz', 'Gameplay Systems & Progression'], ['its-only-money', 'Open-World Systems & Gameplay Testing']] },
  { id: 'beta', stage: 'Camp II', phase: 'Beta', services: ['Performance Testing', 'Usability Testing'],
    chips: [['grave-dodgers', 'Soak Testing'], ['outrage-fight-fest', 'Multiplayer Sync & Stability'], ['god-breakers', 'Multiplayer Network & Crossplay']] },
  { id: 'loc', stage: 'Camp III', phase: 'Localisation', services: ['Functional Localisation QA'],
    chips: [['suzerain', 'Text Display & UI Localization Testing'], ['wild-blue-skies', 'Gameplay-Critical Localization Testing'], ['its-only-money', 'Layout, Formatting & Language Presentation Testing']] },
  { id: 'cert', stage: 'Camp IV', phase: 'Certification', services: ['Compliance QA'],
    chips: [['wild-blue-skies', 'Console Compliance & Certification'], ['town-of-zoz', 'Platform Compliance & Certification'], ['cattle-country', 'Platform Compliance & Stability']] },
  { id: 'launch', stage: 'Summit', phase: 'Launch', services: ['Release Candidate Oversight'],
    chips: [['service-with-a-shotgun', 'Full-Game Progression & Gold Master Support'], ['god-breakers', 'Final Build & Submission Validation'], ['lost-skies', 'Release Readiness & Risk Oversight']] },
  { id: 'next', stage: 'The next peak', phase: 'Post-launch and DLC', services: [], custom: { h: 'DLC, editions and live issues', p: 'DLC, editions and community bug investigation.' },
    chips: [['lil-gator', 'DLC Mechanics & Console Certification'], ['whimel-academy', 'Community Bug Investigation'], ['suzerain', 'Exploratory Testing & Player Issue Investigation']] },
];
for (const c of CAMPS) for (const [slug, ev] of c.chips) {
  const g = BY[slug];
  const hay = [...g.focus, ...g.services.flatMap((s) => s.items)].map((x) => x.toLowerCase());
  if (!g.released || !hay.includes(ev.toLowerCase())) throw new Error(`camp ${c.id}: evidence "${ev}" not found for ${slug}`);
}

const HOME_TESTIMONIALS = [
  { q: 'The Six Peaks team integrated well into our team and never felt like a separate entity. From start to finish they owned the QA process for us, were both super professional, enthusiastic and also fed back like genuine players of the game. Having them on board made the game better.', name: 'Anthony Kyne', role: 'Head of Studio', studio: 'Bossa Games', logo: 'Bossa Games' },
  { q: 'Responsiveness and enthusiasm has encapsulated the Six Peaks experience from first contact to final delivery. I highly recommend them as an outsourcing partner for your titles!', name: 'Liam Wales', role: 'Publishing Producer', studio: 'Playtonic', logo: 'Playtonic Friends' },
  { q: 'Six Peaks were enthusiastic and knowledgeable from day one, working to a reliably high standard. Timezone alignment is a bonus, and English as a first language means nuanced instructions are understood first time.', name: 'Dean Scott', role: 'Senior External Producer', studio: 'Thunderful', logo: 'Thunderful' },
  { q: 'The team at Six Peaks provided professional, thorough QA services for Service with a Shotgun. They were highly knowledgeable, finding critical bugs we would have missed and helping to significantly improve the final product’s quality. Working with them was seamless, with clear communication and detailed reports delivered on time.', name: 'Daniel Fraser', role: 'Producer', studio: 'Silver Lining Interactive', logo: 'Silver Lining Interactive' },
  { q: 'The entire QA team at Six Peaks quickly became an invaluable extension of the Wild Blue Skies development team, and it’s hard to imagine the project’s success without their involvement. Their contributions consistently exceeded expectations. Six Peaks set a new benchmark for what we look for in a quality assurance partner.', name: 'Zach Aikman', role: 'Technical Director', studio: 'Chuhai Labs', logo: 'Chuhai Labs' },
  { q: 'Six Peaks Games professional, English-speaking teams are committed to excellence, consistently elevating our projects with their keen attention to detail and dedication. They have far exceeded our expectations in every regard.', name: 'Dani Allum', role: 'Lead Producer', studio: 'The Powell Group/Humble Games', logo: 'Powell Group' },
  { q: 'Six Peaks showed a degree of technical expertise that is hard to find in external QA vendors. They quickly became a core part of our QA operations and could be relied on not just to hunt bugs, but critically also be arbiters of game quality, healthy development processes, integration with production, and build and release management.', name: 'Dylan Harfoot', role: 'QA Manager', studio: 'Hardball Games', logo: 'Hardball' },
  { q: 'Working with Six Peaks is just like adding more members to your internal team. They integrated seamlessly with us at Hardball and were consistently excellent in every discipline.', name: 'Jason Avent', role: 'CEO', studio: 'Hardball Games', logo: 'Hardball' },
  { q: 'Partnering with Six Peaks Games for QA on ‘It’s Only Money’ was instrumental in our success. Their attention to detail and commitment to quality significantly enhanced our project, ensuring a flawless final product.', name: 'Calum Watson', role: 'Technical Production Manager', studio: 'Firestoke Games', logo: 'Firestoke' },
];
const PARTNERS = ['Humble Games', 'Auroch Digital', 'Impossible Home', 'Thunderful', 'Supercell', 'The Powell Group', 'Firestoke', 'Balor Games', 'Torpor Games', 'Hardball', 'Playtonic Friends', 'Microids', 'Silver Lining Interactive', 'Chuhai Labs', 'Bossa Games'];
const PLATFORM_STRIP = [['xbox', 'Xbox'], ['playstation', 'PlayStation'], ['nintendo', 'Nintendo'], ['epic', 'Epic Games'], ['steam', 'Steam'], ['windows', 'Windows'], ['meta', 'Meta'], ['apple', 'Apple'], ['android', 'Android']];
// Featured summits (released only), chosen from qa/asset-contact-sheet.jpg: five partners, five genres,
// key art that holds a 21:9 band. Focal x% keeps the subject in frame on the 4:5 mobile crop.
const FEATURED = ['lost-skies', 'god-breakers', 'suzerain', 'lil-gator', 'outrage-fight-fest'];
const FOCAL = { 'lost-skies': 36, 'god-breakers': 46, suzerain: 50, 'lil-gator': 66, 'outrage-fight-fest': 56, 'wild-blue-skies': 62, 'cattle-country': 64, 'service-with-a-shotgun': 72, 'its-only-money': 44, 'yooka-replaylee': 46 };

// ---------- SVG: the range ----------
const RIDGE_COLORS = ['var(--ridge-1)', 'var(--ridge-2)', 'var(--ridge-3)', 'var(--ridge-4)', 'var(--ridge-5)', 'var(--ridge-6)'];
function rangeMarkup(prefix = 'h') {
  const crests = R.allCrests();
  const out = [];
  R.RIDGES.forEach((r, i) => {
    const pts = crests[i];
    const fill = R.fillD(pts);
    let fog = '';
    if (i < 5) {
      const m = R.meanCrest(i + 1);
      fog = `<clipPath id="${prefix}c${r.id}"><path d="${fill}"/></clipPath>` +
        `<rect class="fogband" clip-path="url(#${prefix}c${r.id})" x="0" y="${Math.round(m - 200)}" width="${R.VB.w}" height="250" fill="url(#${prefix}fog)"/>`;
    }
    out.push(`<div class="ridge" data-depth="${r.id}"><div class="ridge-move"><svg viewBox="0 0 ${R.VB.w} ${R.VB.h}" preserveAspectRatio="xMidYMax meet" focusable="false">` +
      (i === 0 ? `<defs><linearGradient id="${prefix}fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A6ABB5" stop-opacity="0"/><stop offset=".8" stop-color="#A6ABB5" stop-opacity=".14"/><stop offset="1" stop-color="#A6ABB5" stop-opacity=".05"/></linearGradient></defs>` : '') +
      `<path d="${fill}" style="fill:${RIDGE_COLORS[i]}"/>${fog}` +
      `<path class="crest" d="${R.crestD(pts)}" pathLength="1" style="stroke:var(--fog);stroke-opacity:${(0.12 + i * 0.025).toFixed(3)}"/>` +
      `</svg></div></div>`);
  });
  return out;
}
function heroRange() {
  const layers = rangeMarkup('h');
  const np = R.nextPeak();
  const camps = R.ROUTE_CAMPS.map((i) => `<circle class="camp" cx="${R.ROUTE[i][0]}" cy="${R.ROUTE[i][1]}" r="7"/>`).join('');
  const route = `<div class="ridge ridge-route" data-depth="3"><div class="ridge-move"><svg viewBox="0 0 ${R.VB.w} ${R.VB.h}" preserveAspectRatio="xMidYMax meet" focusable="false">` +
    `<defs><mask id="hroute-mask" maskUnits="userSpaceOnUse" x="0" y="-200" width="${R.VB.w}" height="${R.VB.h + 400}"><path class="route-mask" d="${R.routeD()}" pathLength="1" fill="none" stroke="#fff" stroke-width="18" stroke-linejoin="round"/></mask></defs>` +
    `<path class="next-line" d="M${R.SUMMIT.x} ${R.SUMMIT.y}L${np[0]} ${np[1]}"/>` +
    `<path class="route-line" d="${R.routeD()}" mask="url(#hroute-mask)"/>${camps}` +
    `<circle class="summit-ring" cx="${R.SUMMIT.x}" cy="${R.SUMMIT.y}" r="120"/>` +
    `<g class="flag" transform="translate(${R.SUMMIT.x} ${R.SUMMIT.y})"><path class="flag-pole" d="M0 0V-70"/><path class="flag-cloth" d="M0 -70L52 -57L0 -44Z"/></g>` +
    `</svg></div></div>`;
  // DOM order far -> near, with the route riding on the summit ridge's depth but drawn on top.
  return layers.join('') + route;
}
function basecampRange() {
  // A quieter, wider (8:1) copy of the skyline for the dawn horizon at base camp (fills only),
  // drawn from the same seeded ridges so the summit and flag match the hero.
  const X0 = -1400, X1 = R.VB.w + 1400, bottom = R.VB.h + 40;
  const d = (pts) => R.crestD(pts) + `L${X1} ${bottom}L${X0} ${bottom}Z`;
  return `<svg viewBox="${X0} 0 ${X1 - X0} ${R.VB.h}" preserveAspectRatio="xMidYMax meet" focusable="false">` +
    R.RIDGES.map((r, i) => `<path d="${d(R.crestPoints(r, X0, X1))}" style="fill:${RIDGE_COLORS[i]}"/>`).join('') +
    `<g class="bc-flag" transform="translate(${R.SUMMIT.x} ${R.SUMMIT.y})"><path class="flag-pole" d="M0 0V-70"/><path class="flag-cloth" d="M0 -70L52 -57L0 -44Z"/></g>` +
    `<circle class="bc-ring" cx="${R.SUMMIT.x}" cy="${R.SUMMIT.y}" r="120"/></svg>`;
}
function glyphDefs() {
  const g = R.glyphMarkup();
  return `<svg class="sprite" aria-hidden="true" focusable="false" width="0" height="0"><defs><g id="glyph6">${g.paths}${g.peaks}</g></defs></svg>`;
}
function glyphUse(active, cls = 'glyph') {
  const g = R.glyphMarkup();
  const style = active ? ` style="--g${active}:var(--route-hi);--gw${active}:2.4px;--f${active}:1"` : '';
  return `<svg class="${cls}" viewBox="${g.vb}" aria-hidden="true" focusable="false"${style}><use href="#glyph6"/></svg>`;
}
function glyphBig() {
  const g = R.glyphMarkup();
  // Inline copy (not <use>) so GSAP can tween the custom properties on the root.
  return `<svg class="glyph-big" viewBox="${g.vb}" aria-hidden="true" focusable="false" style="--g1:var(--route-hi);--gw1:2.4px;--f1:1">${g.paths}${g.peaks}</svg>`;
}

// ---------- HTML regions ----------
function testedOn() {
  return PLATFORM_STRIP.map(([f, n]) => {
    const a = asset(`assets/platforms/${f}.webp`);
    return a ? `<li>${img(a, n)}</li>` : `<li class="txt">${esc(n)}</li>`;
  }).join('');
}
function chip(slug, ev) {
  const g = BY[slug];
  return `<li><a class="chip" href="#log-${slug}"><span class="chip-t">${esc(g.title)}</span><span class="chip-m">with ${esc(g.partnerShort)}</span><span class="chip-e">${esc(ev)}</span></a></li>`;
}
function routeCards() {
  return CAMPS.map((c, i) => {
    const body = c.services.length
      ? c.services.map((s) => `<h3>${esc(s)}</h3><p>${esc(SERVICES[s])}</p>`).join('')
      : `<h3>${esc(c.custom.h)}</h3><p>${esc(c.custom.p)}</p>`;
    return `<li class="wp" id="wp-${c.id}" data-wp="${i}"><svg class="wp-strip" aria-hidden="true" focusable="false"></svg>` +
      `<p class="wp-label mono"><span class="wp-stage">${esc(c.stage)}</span> · ${esc(c.phase)}</p>${body}` +
      `<p class="wp-with mono">Climbed with</p><ul class="chips">${c.chips.map(([s, e]) => chip(s, e)).join('')}</ul></li>`;
  }).join('');
}
function routeSteps() {
  return CAMPS.map((c, i) => `<li data-step="${i}"><span class="tick"></span>${esc(c.stage)}</li>`).join('');
}
function platformIcons(g, withNames) {
  return `<ul class="plats">${g.platforms.map((p) => {
    const a = p.icon ? asset(`assets/platforms/${p.icon}.webp`) : null;
    return `<li>${a ? img(a, withNames ? '' : p.name, { lazy: true, hidden: withNames }) : ''}${withNames ? `<span>${esc(p.name)}</span>` : (a ? '' : `<span>${esc(p.name)}</span>`)}</li>`;
  }).join('')}</ul>`;
}
function summits() {
  return FEATURED.map((slug, i) => {
    const g = BY[slug];
    const art = g.key || g.shots[0] || g.poster;
    const logo = g.logo ? img(g.logo, `${g.title} logo`, { lazy: true }) : `<span class="chapter-name display">${esc(g.title)}</span>`;
    return `<article class="chapter" id="summit-${slug}" aria-labelledby="ch-${slug}">` +
      `<div class="chapter-art" style="--fx:${FOCAL[slug] ?? 50}%">${art ? img(art, `${g.title} key art`, { lazy: true }) : ''}<div class="chapter-fog" aria-hidden="true"></div></div>` +
      `<div class="chapter-body wrap"><div class="chapter-head"><p class="mono eyebrow chapter-status">Summit reached</p><h3 class="chapter-logo" id="ch-${slug}">${logo}</h3>` +
      `<p class="chapter-one">${esc(g.oneLiner)}</p><a class="link-arrow" href="#log-${slug}">Read the expedition log<span class="sr">: ${esc(g.title)}</span></a></div>` +
      `<dl class="spec"><div><dt class="mono">Partner</dt><dd>${esc(g.partner)}</dd></div><div><dt class="mono">Genre</dt><dd>${esc(g.genre.join(' · '))}</dd></div>` +
      `<div><dt class="mono">Platforms</dt><dd>${platformIcons(g, false)}</dd></div>` +
      `<div class="spec-focus"><dt class="mono">Key testing focus</dt><dd><ul>${g.focus.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></dd></div></dl></div></article>`;
  }).join('');
}
function logbookGrid() {
  const tile = (g) => {
    const thumb = g.poster;
    return `<li class="lb-tile${g.released ? '' : ' is-underway'}"><a href="#log-${g.slug}"><span class="lb-thumb">${thumb ? img(thumb, `${g.title} poster`, { lazy: true }) : ''}</span>` +
      `<span class="lb-meta"><span class="lb-title">${esc(g.title)}</span><span class="lb-partner">with ${esc(g.partnerShort)}</span>${g.released ? '' : '<span class="mono lb-chip">In progress</span>'}</span></a></li>`;
  };
  const rel = G.filter((g) => g.released), up = G.filter((g) => !g.released);
  return { rel: rel.map(tile).join(''), up: up.map(tile).join('') };
}
function reports() {
  return HOME_TESTIMONIALS.map((t, i) => {
    const logo = partnerLogo(t.logo);
    return `<figure class="report${i === 0 ? ' is-active' : ''}" data-i="${i}"><p class="report-head mono">Field report · ${esc(t.studio)}</p>` +
      `<blockquote><p>${esc(t.q)}</p></blockquote><figcaption><span class="report-who"><strong>${esc(t.name)}</strong><span>${esc(t.role)}, ${esc(t.studio)}</span></span>` +
      `${logo ? img(logo, `${t.studio} logo`, { lazy: true, cls: 'report-logo' }) : ''}</figcaption></figure>`;
  }).join('');
}
function partners() {
  const items = PARTNERS.map((n) => ({ n, a: partnerLogo(n) }));
  const li = (p, dup) => `<li${dup ? ' class="dup" aria-hidden="true"' : ''}>${p.a ? img(p.a, dup ? '' : `${p.n} logo`, { lazy: true, cls: p.a.w === p.a.h ? 'sq' : '' }) : `<span>${esc(p.n)}</span>`}</li>`;
  const rowA = items.slice(0, 8), rowB = items.slice(8);
  const row = (r) => `<div class="mq-row"><ul class="mq-track">${r.map((p) => li(p, false)).join('')}${r.map((p) => li(p, true)).join('')}</ul></div>`;
  return row(rowA) + row(rowB);
}
function brand(rel) { return asset(rel); }
function teamPhoto() {
  // assets/manifest.json: team-1 is the core team on the rooftop with the Outeniqua range directly behind.
  const a = brand('assets/brand/team-1.webp');
  return a ? img(a, 'The Six Peaks core team on the studio rooftop in George, with the Outeniqua range behind', { lazy: true }) : '';
}
const MANAGERS = [
  ['Jason Ried', 'Founder & CEO', 'headshot-jason-ried', 'https://www.linkedin.com/in/jasonried/'],
  ['Jason Avent', 'Founder & Non-Exec Director', 'headshot-jason-avent', 'https://www.linkedin.com/in/jason-avent-171898/'],
  ['Louise Ried', 'Business Development Director', 'headshot-louise-ried', 'https://www.linkedin.com/in/louise-ried-six-peaks/'],
  ['Callan Schroder', 'QA Manager', 'headshot-callan-schroder', 'https://www.linkedin.com/in/callan-schroder-17a260222/'],
];
function managers() {
  return MANAGERS.map(([n, r, f, url]) => {
    const a = brand(`assets/brand/${f}.webp`);
    return `<li class="mgr">${a ? `<span class="mgr-photo">${img(a, `${n}, ${r}`, { lazy: true })}</span>` : ''}<h3>${esc(n)}</h3><p class="mono">${esc(r)}</p>` +
      `<a class="mgr-in" href="${url}" target="_blank" rel="noopener">LinkedIn<span class="sr">: ${esc(n)} (opens in a new tab)</span></a></li>`;
  }).join('');
}
function careersPhoto() {
  const a = brand('assets/brand/vert-9.webp') || brand('assets/brand/vert-10.webp') || brand('assets/brand/vert-4.webp');
  return a ? img(a, 'A Six Peaks tester at work in the studio', { lazy: true }) : '';
}
function logoImg(h) {
  const a = brand('assets/brand/logo-white.webp') || brand('assets/brand/logo-white.png');
  if (!a) return '<span class="brand-txt">Six Peaks Games</span>';
  const w = Math.round((a.w / a.h) * h);
  return `<img src="${a.src}" alt="Six Peaks Games logo" width="${w}" height="${h}">`;
}

// ---------- runtime data (logbook + log routes) ----------
function runtimeData() {
  const pick = (a) => (a ? [a.src, a.w, a.h] : null);
  const games = G.map((g) => ({
    slug: g.slug, title: g.title, released: g.released, partner: g.partner, partnerShort: g.partnerShort, oneLiner: g.oneLiner,
    focus: g.focus, scope: g.released ? g.scope : [], publisher: g.publisher, developer: g.developer, mode: g.mode, genre: g.genre,
    platforms: g.platforms.map((p) => [p.name, p.icon && asset(`assets/platforms/${p.icon}.webp`) ? `assets/platforms/${p.icon}.webp` : null]),
    model: g.model, services: g.released ? g.services : [], trailer: g.released ? g.trailer : null, testimonials: g.testimonials, tags: g.tags,
    img: { logo: pick(g.logo), poster: pick(g.poster), key: g.released ? pick(g.key) : null, shots: g.released ? g.shots.map(pick) : [] },
    partnerLogo: pick(g.partnerLogo), fx: FOCAL[g.slug] ?? 50,
  }));
  const json = JSON.stringify({ games, camps: CAMPS.map((c) => c.stage) });
  return json.replace(/</g, '\\u003c');
}

// ---------- apply ----------
function region(html, name, content) {
  const re = new RegExp(`(<!--gen:${name}-->)[\\s\\S]*?(<!--/gen:${name}-->)`, 'g');
  if (!new RegExp(`<!--gen:${name}-->`).test(html)) { console.warn('  (no region ' + name + ')'); return html; }
  return html.replace(re, (m, a, b) => a + content + b);
}
let html = fs.readFileSync(PAGE, 'utf8');
const lb = logbookGrid();
const regions = {
  'logo-40': logoImg(40), 'logo-56': logoImg(56), sprite: glyphDefs(), range: heroRange(), 'tested-on': testedOn(),
  'route-cards': routeCards(), 'route-steps': routeSteps(), 'glyph-big': glyphBig(),
  'glyph-1': glyphUse(1), 'glyph-2': glyphUse(2), 'glyph-3': glyphUse(3), 'glyph-4': glyphUse(4), 'glyph-5': glyphUse(5), 'glyph-6': glyphUse(6),
  'glyph-rail': glyphUse(0, 'rail-glyph'), summits: summits(), 'lb-released': lb.rel, 'lb-underway': lb.up,
  'team-photo': teamPhoto(), managers: managers(), reports: reports(), partners: partners(), 'careers-photo': careersPhoto(),
  'basecamp-range': basecampRange(), data: `<script type="application/json" id="games">${runtimeData()}</script>`,
};
for (const [k, v] of Object.entries(regions)) html = region(html, k, v);
if (!process.argv.includes('--check')) fs.writeFileSync(PAGE, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`page.html ${kb} KB; regions ${Object.keys(regions).length}; games ${G.length}; partner files ${PARTNER_FILES.length}`);
if (gaps.size) console.log('asset gaps (' + gaps.size + '):\n  ' + [...gaps].join('\n  '));
