// Direction B accessibility fix-round checks (B1 reflow, B2 focus not obscured, B3 HUD contrast) + visual diff snapshots.
// Serves any page.html variant in memory at /direction-b-press-start/__page.html so a frozen baseline can be re-shot.
// Usage:
//   node tools/b-a11y.mjs snap <outdir> [--src <page.html>]       full-page reduced-motion shots: home, library, game-lost-skies (1440 wide)
//   node tools/b-a11y.mjs occlusion [--src <page.html>]            tab through every stop at 390x844, 720x450, 1024x768, 1280x720, 1440x900
//   node tools/b-a11y.mjs contrast [--src <page.html>]             pixel-sampled contrast of small text over key art: 6 hero slides + 13 shipped dossiers
//                                                                   (median background luminance inside each text rect, text hidden for the sample)
//   node tools/b-a11y.mjs reflow [--src <page.html>]               scrollWidth at 390 for every route (fast check; the harness is the gate)
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = 'direction-b-press-start';
const args = process.argv.slice(2);
const mode = args[0];
const srcIdx = args.indexOf('--src');
const SRC = srcIdx > -1 ? path.resolve(args[srcIdx + 1]) : path.join(ROOT, DIR, 'page.html');
// Same skeleton as qa/shoot.mjs wrap() (copied: importing shoot.mjs would run the harness).
const wrap = content => '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' +
  '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}' +
  'body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>' +
  '</head><body>\n' + content + '\n</body></html>\n';
const HTML = wrap(fs.readFileSync(SRC, 'utf8'));
const TYPES = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === `/${DIR}/__page.html`) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(HTML); return; }
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/${DIR}/__page.html`;
const browser = await chromium.launch();
const GSAP = path.join(ROOT, 'node_modules', 'gsap', 'dist');
async function open(hash, vp, opts = {}) {
  const mobile = vp.width < 600;
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: opts.dpr || 1, isMobile: mobile, hasTouch: mobile, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
  await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/gsap/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(GSAP, path.basename(new URL(r.request().url()).pathname))) }));
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(BASE + (hash && hash !== 'home' ? '#' + hash : ''), { waitUntil: 'networkidle' });
  await page.waitForTimeout(opts.wait || 1200);
  return { ctx, page, errs };
}
const GAMES = JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'games.json'), 'utf8'));
const SHIPPED = GAMES.filter(g => g.status === 'released').map(g => g.slug);
const ALL = GAMES.map(g => g.slug);
// Minimal PNG decoder for Playwright screenshots (8-bit, non-interlaced, colour types 0/2/4/6); returns RGB bytes.
function decodePNG(buf) {
  let o = 8, w = 0, h = 0, depth = 0, ctype = 0; const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o), type = buf.toString('ascii', o + 4, o + 8), data = buf.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; ctype = data[9]; if (data[12]) throw new Error('interlaced PNG'); }
    else if (type === 'IDAT') idat.push(data); else if (type === 'IEND') break;
    o += 12 + len;
  }
  if (depth !== 8) throw new Error('PNG bit depth ' + depth);
  const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[ctype]; if (!bpp) throw new Error('PNG colour type ' + ctype);
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, rgb = Buffer.alloc(w * h * 3);
  let prev = Buffer.alloc(stride), p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p++], line = Buffer.from(raw.subarray(p, p + stride)); p += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? line[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[x] = v & 255;
    }
    for (let x = 0; x < w; x++) { const s = x * bpp, d = (y * w + x) * 3; if (bpp >= 3) { rgb[d] = line[s]; rgb[d + 1] = line[s + 1]; rgb[d + 2] = line[s + 2]; } else { rgb[d] = rgb[d + 1] = rgb[d + 2] = line[s]; } }
    prev = line;
  }
  return { w, h, rgb };
}
const lum = (r, g, b) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

try {
  if (mode === 'snap') {
    const out = path.resolve(args[1]); fs.mkdirSync(out, { recursive: true });
    for (const hash of ['home', 'library', 'game-lost-skies']) {
      const { ctx, page, errs } = await open(hash, { width: 1440, height: 900 }, { reduced: true, wait: 1500 });
      // load every lazy image, then return to the top
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += 700) { await page.evaluate(yy => window.scrollTo({ top: yy, behavior: 'instant' }), y); await page.waitForTimeout(120); }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForLoadState('networkidle'); await page.waitForTimeout(900);
      const f = path.join(out, `${hash}.png`);
      await page.screenshot({ path: f, fullPage: true });
      console.log(f, errs.length ? 'ERRORS ' + errs.join(' | ') : 'ok');
      await ctx.close();
    }
  } else if (mode === 'occlusion') {
    const VPS = [['390x844', 390, 844], ['720x450', 720, 450], ['1024x768', 1024, 768], ['1280x720', 1280, 720], ['1440x900', 1440, 900]];
    const summary = [];
    for (const [name, w, h] of VPS) {
      const { ctx, page } = await open('home', { width: w, height: h }, { wait: 1500 });
      // keep the hero still while tabbing (rotation would move focus targets); pausing is a user control on the page
      await page.evaluate(() => { const b = document.querySelector('[data-hero-pause]'); if (b) b.click(); });
      await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
      const stops = [];
      for (let n = 0; n < 160; n++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(60);
        const s = await page.evaluate(() => {
          const el = document.activeElement; if (!el || el === document.body) return { body: true };
          const r = el.getBoundingClientRect();
          const bars = [['top', document.querySelector('.top')], ['mbar', document.querySelector('.mbar')], ['hints', document.querySelector('.hints')]];
          let cover = 0, by = '';
          for (const [k, b] of bars) {
            if (!b || el.closest('.top, .mbar, .hints') === b) continue;
            const cs = getComputedStyle(b); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            const z = Number(getComputedStyle(el).zIndex) || 0; if (el.matches('.skip') && z > 60) continue; // the skip link stacks above the top bar
            const q = b.getBoundingClientRect();
            const ix = Math.max(0, Math.min(r.right, q.right) - Math.max(r.left, q.left)), iy = Math.max(0, Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top));
            const c = r.width && r.height ? Math.round(100 * ix * iy / (r.width * r.height)) : 0;
            if (c > cover) { cover = c; by = k; }
          }
          const vis = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
          return { tag: el.tagName.toLowerCase(), name: (el.getAttribute('aria-label') || el.textContent || el.id || '').replace(/\s+/g, ' ').trim().slice(0, 48), y: Math.round(r.top), h: Math.round(r.height), cover, by, vis, key: el.tagName + '|' + (el.id || '') + '|' + (el.getAttribute('href') || '') + '|' + (el.textContent || '').trim().slice(0, 30) + '|' + Math.round(r.left) };
        });
        if (s.body) continue;
        if (stops.length && s.key === stops[0].key) break; // cycled back to the first stop
        stops.push(s);
      }
      const full = stops.filter(s => s.cover >= 100), part = stops.filter(s => s.cover > 0 && s.cover < 100);
      summary.push({ vp: name, stops: stops.length, full: full.length, partial: part.length, maxPartial: Math.max(0, ...part.map(s => s.cover)) });
      console.log(`${name}: ${stops.length} stops, fully hidden ${full.length}, partly hidden ${part.length} (max ${Math.max(0, ...part.map(s => s.cover))}%)`);
      full.forEach(s => console.log(`   FULL by ${s.by}: ${s.tag} "${s.name}" y=${s.y}`));
      part.filter(s => s.cover >= (process.env.B_ALLPART ? 1 : 50)).forEach(s => console.log(`   part ${s.cover}% by ${s.by}: ${s.tag} "${s.name}" y=${s.y} h=${s.h}`));
      await ctx.close();
    }
    fs.writeFileSync(process.env.B_OUT || '/dev/null', JSON.stringify(summary));
  } else if (mode === 'contrast') {
    // Small text over key art: for every text rect, the median relative luminance of the background pixels (screenshot
    // taken with the measured text made transparent) against the text colour; same idea as the qa-verifier's method.
    const SEL_HERO = ['.tv__statustxt', '.hero__with', '.hero__credit', '.top__nav a', '.top__rec', '.hero__tools .switch', '.hero__copy .eyebrow', '.hero__sub', '.recent__label .mono', '.rr__t', '.rr__p', '.cp__txt', '.cp__ok'];
    const SEL_DZ = ['.tv__statustxt', '.top__nav a', '.top__rec', '.dz-crumb', '.dz-one', '.dz-meta .mono', '.dz-focus li span', '.dz-hero .btn--ghost'];
    const rows = [];
    async function measure(page, label, sels) {
      const boxes = await page.evaluate(sels => {
        const res = [];
        sels.forEach(sel => document.querySelectorAll(sel).forEach(el => {
          const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[hidden]')) return;
          const rects = []; const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          let t; while ((t = walker.nextNode())) { if (!t.textContent.trim()) continue; const p = t.parentElement; const pcs = getComputedStyle(p); if (pcs.display === 'none' || p.closest('.sr-only')) continue; const rg = document.createRange(); rg.selectNodeContents(t); [...rg.getClientRects()].forEach(r => { if (r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight) rects.push({ x: r.left, y: r.top, w: r.width, h: r.height, color: pcs.color, size: parseFloat(pcs.fontSize), weight: Number(pcs.fontWeight) }); }); }
          if (rects.length) res.push({ sel, text: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), rects });
        }));
        return res;
      }, sels);
      await page.addStyleTag({ content: sels.map(s => `${s}, ${s} *`).join(',') + '{color:transparent!important;-webkit-text-fill-color:transparent!important}' });
      await page.waitForTimeout(150);
      const img = decodePNG(await page.screenshot({ type: 'png' }));
      boxes.forEach(b => {
        const L = [];
        b.rects.forEach(r => { for (let y = Math.max(0, Math.floor(r.y)); y < Math.min(img.h, Math.ceil(r.y + r.h)); y++) for (let x = Math.max(0, Math.floor(r.x)); x < Math.min(img.w, Math.ceil(r.x + r.w)); x++) { const k = (y * img.w + x) * 3; L.push(lum(img.rgb[k], img.rgb[k + 1], img.rgb[k + 2])); } });
        if (!L.length) return;
        L.sort((p, q) => p - q);
        const c = b.rects[0].color.match(/[\d.]+/g).map(Number), cr = ratio(lum(c[0], c[1], c[2]), L[L.length >> 1]);
        const need = b.rects[0].size >= 24 || (b.rects[0].size >= 18.66 && b.rects[0].weight >= 700) ? 3 : 4.5;
        rows.push({ where: label, sel: b.sel, text: b.text, ratio: Math.round(cr * 100) / 100, need, pass: cr >= need });
      });
    }
    const freeze = page => page.evaluate(() => { if (window.gsap) window.gsap.globalTimeline.pause(); });
    for (let s = 0; s < 6; s++) {
      const { ctx, page } = await open('home', { width: 1440, height: 900 }, { wait: 1200 });
      await page.evaluate(() => document.querySelector('[data-hero-pause]').click());
      if (s) await page.evaluate(k => document.querySelector(`.rr[data-go="${k}"]`).click(), s);
      await page.waitForTimeout(3400); await freeze(page);
      await measure(page, 'hero ' + await page.evaluate(() => document.querySelector('.rr[aria-current="true"] .rr__t').textContent), SEL_HERO);
      await ctx.close();
    }
    for (const slug of SHIPPED) {
      const { ctx, page } = await open('game-' + slug, { width: 1440, height: 900 }, { wait: 2600 });
      await freeze(page);
      await measure(page, 'dossier ' + slug, SEL_DZ);
      await ctx.close();
    }
    const fails = rows.filter(r => !r.pass);
    console.log(`measured ${rows.length} text boxes over imagery in ${new Set(rows.map(r => r.where)).size} states (6 hero slides + ${SHIPPED.length} shipped dossiers); below threshold: ${fails.length}`);
    fails.sort((p, q) => p.ratio - q.ratio).forEach(f => console.log(`   FAIL ${f.ratio}:1 (need ${f.need}) ${f.where} | ${f.sel} | "${f.text}"`));
    const by = {}; rows.forEach(r => { (by[r.sel] = by[r.sel] || []).push(r); });
    Object.entries(by).forEach(([k, v]) => { const m = v.reduce((p, q) => (q.ratio < p.ratio ? q : p)); console.log(`   ${k.padEnd(24)} min ${m.ratio.toFixed(2)} (${m.where})  n=${v.length}`); });
    if (process.env.B_OUT) fs.writeFileSync(process.env.B_OUT, JSON.stringify(rows, null, 1));
  } else if (mode === 'reflow') {
    for (const hash of ['home', 'library', ...ALL.map(s => 'game-' + s)]) {
      const { ctx, page } = await open(hash, { width: 390, height: 844 }, { wait: 900 });
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      console.log(`${hash.padEnd(30)} scrollWidth ${m.sw} / ${m.cw}${m.sw > m.cw + 1 ? '  OVERFLOW' : ''}`);
      await ctx.close();
    }
  } else console.log('modes: snap | occlusion | contrast | reflow');
} finally { await browser.close(); server.close(); }
