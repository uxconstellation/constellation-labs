// Direction B build step: data embed + home prerender + copy lint.
// Usage: node tools/b-build.mjs [--strict]
// 1. Reads research/games.json, assets/manifest.json (if present), tools/b-content.mjs.
// 2. Resolves every image path against assets/web (with real pixel dimensions) and records gaps.
// 3. Checks each verbatim string from b-content.mjs against the captured site text.
// 4. Writes <script type="application/json" id="games"> and id="site" between <!--B:DATA--> markers.
// 5. Prerenders the home route by running the page's own template block (/*B:T*/ ... /*/B:T*/) in a VM,
//    so the home route is complete at first paint without JS.
// 6. Lints the output for em dashes, spaced en dashes and banned words.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { site as baseSite, heroes as baseHeroes, VERBATIM, EDITS } from './b-content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = path.join(ROOT, 'direction-b-press-start', 'page.html');
const WEB = path.join(ROOT, 'assets', 'web');
const strict = process.argv.includes('--strict');
const gaps = [];
const notes = [];

// ---------- image dimensions (webp / png / jpeg) ----------
function dims(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (chunk === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L') { const bits = b.readUInt32LE(21); return { w: (bits & 0x3fff) + 1, h: ((bits >>> 14) & 0x3fff) + 1 }; }
  }
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let o = 2;
    while (o < b.length - 9) {
      if (b[o] !== 0xff) { o++; continue; }
      const m = b[o + 1], len = b.readUInt16BE(o + 2);
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: b.readUInt16BE(o + 5), w: b.readUInt16BE(o + 7) };
      o += 2 + len;
    }
  }
  throw new Error('cannot read dimensions: ' + file);
}
// rel: path under assets/web ("games/x/key.webp") or with the "assets/web/" prefix
function asset(rel, label) {
  if (!rel) return null;
  const r = rel.replace(/^assets\/web\//, '').replace(/^assets\//, '');
  const f = path.join(WEB, r);
  if (!fs.existsSync(f)) { gaps.push((label ? label + ': ' : '') + 'assets/web/' + r); return null; }
  const d = dims(f);
  return { src: 'assets/' + r, w: d.w, h: d.h };
}
const firstAsset = (cands, label) => {
  for (const c of cands) { const f = path.join(WEB, c); if (fs.existsSync(f)) return asset(c); }
  gaps.push(label + ': none of ' + cands.join(', '));
  return null;
};

// ---------- inputs ----------
const rawGames = JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'games.json'), 'utf8'));
const manifestPath = path.join(ROOT, 'assets', 'manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null;
if (!manifest) notes.push('assets/manifest.json not found yet');

// ---------- copy normalisation (house law) ----------
const houseDash = (s, where) => {
  let out = s;
  if (/ [–—] /.test(out) || /—/.test(out)) {
    const before = out;
    out = out.replace(/(\d) [–—] (\d)/g, '$1–$2').replace(/ – further details/g, ', further details').replace(/ [–—] /g, ': ').replace(/—/g, ', ');
    if (before !== out) EDITS.push({ where, from: before.slice(0, 90), to: out.slice(0, 90), why: 'house law: no em dash or spaced en dash' });
  }
  return out;
};
const splitParas = s => String(s || '').split(/\n\s*\n/).map(x => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
const stripQuotes = s => s.replace(/^[\s“"”]+/, '').replace(/[\s“"”]+$/, '');

// ---------- platforms ----------
const PLAT = {
  'playstation': { name: 'PlayStation', icon: 'playstation', key: 'ps' },
  'xbox': { name: 'Xbox', icon: 'xbox', key: 'xbox' },
  'nintendo switch': { name: 'Nintendo Switch', icon: 'nintendo', key: 'switch' },
  'nintendo': { name: 'Nintendo Switch', icon: 'nintendo', key: 'switch' },
  'steam': { name: 'Steam', icon: 'steam', key: 'pc' },
  'steam (dlc)': { name: 'Steam', icon: 'steam', key: 'pc' },
  'epic': { name: 'Epic', icon: 'epic', key: 'pc' },
  'ios': { name: 'iOS', icon: 'apple', key: 'mobile' },
  'android': { name: 'Android', icon: 'android', key: 'mobile' },
};
const platIcon = {};
const platIconAsset = id => {
  if (!(id in platIcon)) platIcon[id] = firstAsset([`platforms/${id}.webp`, `platforms/${id}.png`, `platforms/${id}-logo.webp`, `platforms/${id}-icon.webp`], 'platform icon ' + id);
  return platIcon[id];
};

// ---------- partners ----------
const PARTNER_RX = {
  'humble-games': /humble/i, 'auroch-digital': /auroch/i, 'impossible-home': /impossible/i, 'thunderful': /thunderful/i,
  'supercell': /supercell/i, 'powell-group': /powell/i, 'firestoke': /firestoke/i, 'balor-games': /balor/i,
  'torpor-games': /torpor/i, 'hardball': /hardball/i, 'playtonic-friends': /playtonic/i, 'microids': /microids/i,
  'silver-lining': /silver lining/i, 'chuhai-labs': /chuhai|chuchai/i, 'bossa-games': /bossa/i,
};
const PARTNER_FILES = {
  'humble-games': ['humble-games', 'humble'], 'auroch-digital': ['auroch-digital', 'auroch'], 'impossible-home': ['impossible-home', 'impossible-dream', 'impossible'],
  'thunderful': ['thunderful'], 'supercell': ['supercell'], 'powell-group': ['powell-group', 'powell', 'the-powell-group'], 'firestoke': ['firestoke'],
  'balor-games': ['balor-games', 'balor'], 'torpor-games': ['torpor-games', 'torpor'], 'hardball': ['hardball', 'hardball-games'],
  'playtonic-friends': ['playtonic-friends', 'playtonic'], 'microids': ['microids'], 'silver-lining': ['silver-lining', 'silver-lining-interactive'],
  'chuhai-labs': ['chuhai-labs', 'chuhai', 'chuchai'], 'bossa-games': ['bossa-games', 'bossa'],
};
const partnerLogo = id => firstAsset((PARTNER_FILES[id] || [id]).flatMap(n => [`partners/${n}.webp`, `partners/${n}.png`]), 'partner logo ' + id);
const partnerFromUrl = u => { const f = String(u).toLowerCase(); return Object.keys(PARTNER_RX).find(id => PARTNER_RX[id].test(f.replace(/-/g, ' '))) || null; };

// ---------- games ----------
const games = rawGames.map((g, i) => {
  const a = g.assets || {};
  const plat = []; const platKeys = []; const seen = new Set();
  (g.platforms || []).forEach(p => {
    const m = PLAT[String(p).toLowerCase().trim()];
    if (!m) { notes.push(`${g.slug}: unknown platform "${p}"`); return; }
    if (!platKeys.includes(m.key)) platKeys.push(m.key);
    if (seen.has(m.icon)) return; seen.add(m.icon);
    plat.push({ name: m.name, icon: platIconAsset(m.icon) });
  });
  const svcSeen = new Set();
  const services = (g.servicesProvided || []).map(s => ({ category: s.category, items: s.items.filter(it => { const k = s.category + '|' + it; if (svcSeen.has(k)) return false; svcSeen.add(k); return true; }) }));
  const focus = (g.status === 'released' ? (g.card && g.card.keyTestingFocus && g.card.keyTestingFocus.length === 3 ? g.card.keyTestingFocus : g.keyTestingFocus) : []).map(f => houseDash(f, g.slug + ' focus'));
  const reviews = (g.testimonials || []).map((t, k) => {
    const ids = (t.logos || []).map(partnerFromUrl).filter(Boolean);
    const logoId = ids[0] || null;
    return {
      q: splitParas(stripQuotes(t.quote)).map(p => houseDash(p, `${g.slug} testimonial ${k + 1}`)),
      by: houseDash(String(t.attribution || '').replace(/\s+/g, ' ').trim(), g.slug + ' attribution'),
      logo: logoId ? partnerLogo(logoId) : null,
      logoAlt: logoId ? baseSite.partners.find(p => p.id === logoId).name + ' logo' : '',
    };
  });
  const partnerIds = Object.keys(PARTNER_RX).filter(id => PARTNER_RX[id].test([g.partner, g.developer, g.publisher].join(' ')));
  const partnerShort = String(g.partner).replace(/\s*\(.*\)\s*$/, '').trim();
  const leadPartner = Object.keys(PARTNER_RX).find(id => PARTNER_RX[id].test(String(g.partner).replace(/\(.*\)/, '')));
  const out = {
    i, slug: g.slug, title: g.title, oneLiner: houseDash(g.oneLiner, g.slug + ' one-liner'), partner: g.partner, partnerShort, partnerIds,
    publisher: houseDash(g.publisher, g.slug + ' publisher'), developer: houseDash(g.developer, g.slug + ' developer'), gameMode: houseDash(g.gameMode, g.slug + ' game mode'), genre: String(g.genre || '').split('|').map(s => s.trim()).filter(Boolean).join(' · '),
    platforms: g.platforms || [], plat, platKeys, engagementModel: g.engagementModel || [], focus,
    scope: splitParas(g.scope).map(p => houseDash(p, g.slug + ' scope')), services,
    trailer: g.trailerUrl ? { url: g.trailerUrl, title: houseDash(String(g.trailerTitle || 'Trailer').replace(/\s*\|\s*/g, ' · '), g.slug + ' trailer') } : null,
    status: g.status === 'released' ? 'released' : 'underway',
    img: {
      logo: asset(a.logo, g.slug + ' logo'),
      poster: asset(a.poster, g.slug + ' poster'),
      key: g.status === 'released' ? asset(a.key, g.slug + ' key') : (fs.existsSync(path.join(WEB, String(a.key || '').replace(/^assets\/web\//, ''))) ? asset(a.key) : null),
      shots: (a.shots || []).map((s, k) => asset(s, `${g.slug} shot ${k + 1}`)).filter(Boolean),
    },
    reviews,
    partnerLogo: leadPartner ? { ...partnerLogo(leadPartner), alt: baseSite.partners.find(p => p.id === leadPartner).name + ' logo' } : null,
  };
  if (!out.img.key && out.img.shots.length && out.status === 'released') { out.img.key = out.img.shots[0]; notes.push(`${g.slug}: no key.webp, using shot-1 as key art`); }
  return out;
});
const G = Object.fromEntries(games.map(g => [g.slug, g]));

// ---------- services: used-on lists and paired shots ----------
const SVC_MATCH = {
  functional: (c) => /^functional qa$/i.test(c),
  compliance: (c) => /^compliance qa$/i.test(c),
  loc: (c) => /loc/i.test(c),
  bugs: (c) => /bug reporting/i.test(c),
  cases: (c) => /test case/i.test(c),
  usability: (c) => /usability/i.test(c),
  performance: (c, items) => /performance/i.test(c) || items.some(it => /performance testing/i.test(it)),
  rc: (c) => /release (candidate|prep)/i.test(c),
};
// pairing per slot: key art (1900 wide) of titles NOT in the hero rotation, so the page shows more of the catalogue
const PAIR = {
  functional: ['yooka-replaylee'], compliance: ['cattle-country'], loc: ['whimel-academy'], bugs: ['outrage-fight-fest'],
  cases: ['yooka-replaylee', 'cattle-country', 'outrage-fight-fest'], usability: ['service-with-a-shotgun'], performance: ['its-only-money', 'grave-dodgers'], rc: ['grave-dodgers', 'its-only-money'],
};
const heroSlugs = new Set(baseHeroes.map(h => h.slug));
const loadout = {};
const usedPairs = new Set();
const usedBy = Object.fromEntries(baseSite.services.map(s => [s.key, games.filter(g => g.status === 'released' && g.services.some(x => SVC_MATCH[s.key](x.category, x.items))).map(g => g.slug)]));
// assign scarcest slots first so as many slots as possible show a title that is not already in the hero rotation
const order = baseSite.services.map(s => s.key).sort((p, q) => usedBy[p].filter(sl => !heroSlugs.has(sl)).length - usedBy[q].filter(sl => !heroSlugs.has(sl)).length);
order.forEach(key => {
  const used = usedBy[key];
  const ok = sl => used.includes(sl) && G[sl].img.key && !usedPairs.has(sl);
  const slug = (PAIR[key] || []).find(sl => ok(sl) && !heroSlugs.has(sl)) || used.find(sl => ok(sl) && !heroSlugs.has(sl)) || (PAIR[key] || []).find(ok) || used.find(ok) || used[0];
  usedPairs.add(slug);
  loadout[key] = { used, slug, shot: G[slug].img.key };
});

// ---------- site ----------
const heroes = baseHeroes.filter(h => {
  const g = G[h.slug];
  if (!g) { notes.push('hero slug missing: ' + h.slug); return false; }
  if (g.status !== 'released') throw new Error('underway title as hero art: ' + h.slug);
  if (!g.img.key) { gaps.push('hero ' + h.slug + ' has no key art, dropped from rotation'); return false; }
  return true;
});
const PLAT_FILTERS = [['ps', 'PlayStation'], ['xbox', 'Xbox'], ['switch', 'Switch'], ['pc', 'PC'], ['mobile', 'Mobile']].map(([key, name]) => ({ key, name, n: games.filter(g => g.platKeys.includes(key)).length }));
const SITE_PLATFORMS = [['Xbox', 'xbox'], ['PlayStation', 'playstation'], ['Nintendo', 'nintendo'], ['Epic', 'epic'], ['Steam', 'steam'], ['Windows', 'windows'], ['Meta', 'meta'], ['Apple', 'apple'], ['Android', 'android']];
const brand = {
  logo: firstAsset(['brand/logo-white.webp', 'brand/logo-white.png'], 'brand logo'),
  testers: firstAsset(['brand/hero-testers.webp'], 'testers photo'),
  heads: Object.fromEntries(baseSite.crew.team.map(m => [m.photo, firstAsset([`brand/${m.photo}.webp`], 'headshot ' + m.name)])),
};
// group photo with mountains: manifest note wins, else team-3 (rooftop group) as noted in site-content.md
let crewFile = null;
if (manifest) {
  const txt = JSON.stringify(manifest);
  const m = txt.match(/(team-\d)\.webp[^}]{0,400}?mountain|mountain[^}]{0,400}?(team-\d)\.webp/i);
  if (m) crewFile = (m[1] || m[2]);
}
brand.crew = firstAsset([`brand/${crewFile || 'team-3'}.webp`, 'brand/team-3.webp', 'brand/team-1.webp'], 'crew photo');
brand.crewAlt = 'The Six Peaks Games team in George' + (crewFile ? ', with the Outeniqua mountains behind' : '');
if (!crewFile) notes.push('crew photo: manifest did not name the mountain photo; using ' + (brand.crew && brand.crew.src));

const site = {
  ...baseSite,
  contactShort: 'We’d love to discuss how we can support your game!',
  heroes,
  partners: baseSite.partners.map(p => ({ ...p, logo: partnerLogo(p.id), titles: games.filter(g => g.partnerIds.includes(p.id)).map(g => g.slug) })),
  platformIcons: SITE_PLATFORMS.map(([name, id]) => ({ name, icon: platIconAsset(id) })),
  platFilters: PLAT_FILTERS,
  brand,
  loadout,
};
VERBATIM.push(site.contactShort);

// ---------- verbatim check ----------
const norm = s => String(s).replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').replace(/\\\|/g, '|').trim().toLowerCase();
const corpus = norm([
  fs.readFileSync(path.join(ROOT, 'research', 'site-content.md'), 'utf8'),
  ...fs.readdirSync(path.join(ROOT, 'research', 'games')).map(f => fs.readFileSync(path.join(ROOT, 'research', 'games', f), 'utf8')),
  JSON.stringify(rawGames),
].join(' \n '));
const notVerbatim = VERBATIM.filter(s => !corpus.includes(norm(s)));

// ---------- write data + prerender ----------
let page = fs.readFileSync(PAGE, 'utf8');
const json = o => JSON.stringify(o).replace(/</g, '\\u003c').replace(new RegExp(String.fromCharCode(0x2028), 'g'), '\\u2028').replace(new RegExp(String.fromCharCode(0x2029), 'g'), '\\u2029');
const dataBlock = `<!--B:DATA-->\n<script type="application/json" id="games">${json(games)}</script>\n<script type="application/json" id="site">${json(site)}</script>\n<!--/B:DATA-->`;
page = page.replace(/<!--B:DATA-->[\s\S]*?<!--\/B:DATA-->/, dataBlock);
const a = page.indexOf('/*B:T*/'), b = page.indexOf('/*/B:T*/');
if (a < 0 || b < 0) throw new Error('template markers missing');
const code = page.slice(a + 7, b);
const ctx = vm.createContext({ D: { games, site } });
const home = vm.runInContext(`(function(){${code}\nreturn T.home();})()`, ctx);
page = page.replace(/<!--B:HOME-->[\s\S]*?<!--\/B:HOME-->/, () => `<!--B:HOME-->\n${home}\n<!--/B:HOME-->`);
fs.writeFileSync(PAGE, page);

// ---------- lint ----------
const BANNED = ['seamless', 'cutting-edge', 'world-class', 'unleash', 'elevat', 'next-level', 'game-changer', 'revolution', 'supercharg', 'best-in-class'];
const lint = [];
const lines = page.split('\n');
lines.forEach((ln, k) => {
  if (ln.includes('—')) lint.push(`L${k + 1}: em dash`);
  if (/ – /.test(ln)) lint.push(`L${k + 1}: spaced en dash`);
});
// banned words: report hits with context; hits inside testimonial text are verbatim quotes (allowed)
const quoteTexts = norm(JSON.stringify([games.flatMap(g => g.reviews.flatMap(r => r.q)), site.reviews.map(r => r.q), site.pullQuote.q]));
const plain = page.replace(/<script type="application\/json"[\s\S]*?<\/script>/g, '');
const banned = [];
BANNED.forEach(w => {
  const rx = new RegExp('[^\\n]{0,60}' + w.replace('-', '[- ]?') + '[a-z]*[^\\n]{0,40}', 'gi');
  (page.match(rx) || []).forEach(hit => {
    const inQuote = quoteTexts.includes(norm(hit.replace(/<[^>]*>/g, '').trim().slice(10, 50)));
    banned.push(`${w}: ${inQuote ? '(in verbatim quote) ' : ''}…${hit.replace(/\s+/g, ' ').trim()}…`);
  });
});
void plain;

const size = Buffer.byteLength(page);
console.log(`page.html written: ${(size / 1024).toFixed(1)} KB (limit 1024 KB)`);
console.log(`games: ${games.length} (${games.filter(g => g.status === 'released').length} released) · heroes: ${heroes.map(h => h.slug).join(', ')}`);
console.log(`loadout pairs: ${Object.entries(loadout).map(([k, v]) => k + '=' + v.slug + '(' + v.used.length + ')').join(' ')}`);
console.log(`crew photo: ${brand.crew && brand.crew.src}`);
if (notVerbatim.length) { console.log(`\nNOT VERBATIM (${notVerbatim.length}):`); notVerbatim.forEach(s => console.log('  - ' + s.slice(0, 120))); }
else console.log('verbatim check: all ' + VERBATIM.length + ' strings found in captured site text');
if (gaps.length) { console.log(`\nASSET GAPS (${gaps.length}):`); [...new Set(gaps)].forEach(s => console.log('  - ' + s)); }
if (notes.length) { console.log('\nNOTES:'); notes.forEach(s => console.log('  - ' + s)); }
if (lint.length) { console.log(`\nDASH LINT (${lint.length}):`); lint.slice(0, 30).forEach(s => console.log('  - ' + s)); }
else console.log('dash lint: clean');
if (banned.length) { console.log(`\nBANNED-WORD HITS (${banned.length}):`); banned.forEach(s => console.log('  - ' + s.slice(0, 200))); }
console.log(`\nhouse-law edits: ${EDITS.length}`);
fs.writeFileSync(process.env.B_REPORT || path.join(process.env.TMPDIR || '/tmp', 'b-build-report.json'), JSON.stringify({ gaps: [...new Set(gaps)], notes, notVerbatim, lint, banned, edits: EDITS, size }, null, 2));
if (strict && (notVerbatim.length || lint.length)) process.exit(1);
