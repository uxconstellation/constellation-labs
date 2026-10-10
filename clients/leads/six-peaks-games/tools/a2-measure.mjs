// A2 measurements: heading line counts (house law: max 3 lines) at 320/390/768/1024/1440, image bytes the
// home route loads before any interaction (budget 1.5 MB), axe with every dialog open, page size, and the
// contrast of every node axe marks "incomplete" (text over the live canvas, scrims, pseudo-elements), measured
// from real pixels: all text is hidden, the page is screenshotted, and each node's own glyph boxes are compared
// with its text colour, pixel by pixel (WCAG relative luminance; 4.5:1 small text, 3:1 large text).
// Usage: node tools/a2-measure.mjs [--axe-only]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { wrapPage, serve, routeCdn } from './a2-serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
wrapPage(ROOT);
const { server, base } = await serve(ROOT);
const browser = await chromium.launch();
const out = {};
const AXE_ONLY = process.argv.includes('--axe-only');   // skip the heading and image-byte passes

// 1. headings
if (!AXE_ONLY) {
const widths = [320, 390, 768, 1024, 1440];
let measured = 0, worst = 0; const over = [];
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, deviceScaleFactor: 1, isMobile: w < 800, hasTouch: w < 800 });
  await routeCdn(ctx, ROOT);
  const page = await ctx.newPage();
  for (const h of ['', '#manual', '#play']) {
    await page.goto(base + h, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    if (h === '') { await page.click('#b-start').catch(() => {}); await page.waitForTimeout(300); }
    const res = await page.evaluate(() => {
      const r = [];
      for (const el of document.querySelectorAll('h1,h2,h3,[role="heading"]')) {
        const cs = getComputedStyle(el);
        if (el.offsetParent === null && cs.position !== 'fixed') continue;
        const box = el.getBoundingClientRect(); if (!box.width || !box.height) continue;
        if (el.closest('.sr-only') || el.classList.contains('sr-only')) continue;
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
        r.push({ t: el.textContent.trim().slice(0, 60), lines: Math.round(box.height / lh) });
      }
      return r;
    });
    // the title screen H1 and the rules H2 too (they are only visible on #home)
    for (const x of res) { measured++; worst = Math.max(worst, x.lines); if (x.lines > 3) over.push(`${w}px ${h || '#home'}: "${x.t}" ${x.lines} lines`); }
  }
  await ctx.close();
}
out.headings = { measured, worst, over };

// 2. image bytes before interaction (home), desktop and mobile
for (const dev of [{ name: 'desktop', viewport: { width: 1440, height: 900 } }, { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]) {
  const ctx = await browser.newContext(dev);
  await routeCdn(ctx, ROOT);
  const page = await ctx.newPage();
  const imgs = [];
  page.on('response', async (r) => { const ty = r.headers()['content-type'] || ''; if (ty.startsWith('image/')) { try { const b = await r.body(); imgs.push({ url: r.url().replace(/^.*\/assets\//, 'assets/'), bytes: b.length }); } catch (e) {} } });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  const total = imgs.reduce((s, x) => s + x.bytes, 0);
  out['images_' + dev.name] = { requests: imgs.length, kb: Math.round(total / 1024), largest: imgs.sort((a, b) => b.bytes - a.bytes).slice(0, 5).map((x) => `${x.url} ${Math.round(x.bytes / 1024)} KB`) };
  await ctx.close();
}
}
// contrast from pixels for the nodes axe cannot decide. Motion is frozen (game loop, GSAP, CSS animations);
// screenshot A hides all text, screenshot B shows only the audited nodes' own text. Pixels that differ are the
// glyphs actually drawn; A at those pixels is the real background under them (scrims, canvas, dither, overlaps).
async function freeze(page, on) {
  await page.evaluate((on_) => {
    if (on_) {
      Object.defineProperty(document, 'hidden', { get: () => true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      if (window.gsap) window.gsap.globalTimeline.pause();
      const st = document.createElement('style'); st.setAttribute('data-a2-freeze', '');
      st.textContent = '*,*::before,*::after{animation-play-state:paused!important;transition:none!important}';
      document.head.appendChild(st);
    } else {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
      if (window.gsap) window.gsap.globalTimeline.resume();
      document.querySelectorAll('style[data-a2-freeze]').forEach((n) => n.remove());
    }
  }, on);
}
async function sampleContrast(page, sels) {
  await freeze(page, true);
  try {
    const info = await page.evaluate((sels_) => sels_.map((sel, idx) => {
      const el = document.querySelector(sel); if (!el) return { sel, skip: 'not found' };
      const cs = getComputedStyle(el);
      if (cs.visibility !== 'visible') return { sel, skip: 'not rendered (visibility)' };
      let op = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
      if (op < 0.05) return { sel, skip: 'not rendered (opacity 0)' };
      const field = el.matches('input,textarea,select');
      if (field && !el.value && 'value' in el && el.tagName !== 'SELECT') { el.dataset.a2Val = '1'; el.value = 'Sample text 0123'; }
      const rects = [];
      const clip = (q) => { const x = Math.max(0, q.left), y = Math.max(0, q.top), x1 = Math.min(innerWidth, q.right), y1 = Math.min(innerHeight, q.bottom); return x1 - x > 1 && y1 - y > 1 ? { x, y, x1, y1 } : null; };
      if (field) { const b = el.getBoundingClientRect(); const q = clip({ left: b.left + 2, top: b.top + 2, right: b.right - 18, bottom: b.bottom - 2 }); if (q) rects.push(q); }
      else for (const t of el.childNodes) {
        if (t.nodeType !== 3 || !t.textContent.trim()) continue;
        const r = document.createRange(); r.selectNodeContents(t);
        for (const q of r.getClientRects()) { const c = clip(q); if (c) rects.push(c); }
      }
      if (!rects.length) return { sel, skip: 'off-screen (or no own text)' };
      const hit = rects.some((q) => { const h = document.elementFromPoint((q.x + q.x1) / 2, (q.y + q.y1) / 2); return h && (h === el || el.contains(h)); });
      const c = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      c.clearRect(0, 0, 1, 1); c.fillStyle = '#000'; c.fillStyle = cs.color; c.fillRect(0, 0, 1, 1);
      const [R, G, B, A] = c.getImageData(0, 0, 1, 1).data;
      el.setAttribute('data-a2-k', String(idx)); el.style.setProperty('--a2-col', cs.color);
      const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight, 10) || 400;
      return { sel, k: idx, rects, hit, color: [R, G, B, (A / 255) * op], need: fs >= 24 || (fs >= 18.66 && fw >= 700) ? 3 : 4.5 };
    }), sels);
    const live = info.filter((n) => !n.skip);
    if (!live.length) return info.map((n) => ({ sel: n.sel, skip: n.skip }));
    const hide = await page.addStyleTag({ content: '*,*::before,*::after,*::placeholder{color:transparent!important;-webkit-text-fill-color:transparent!important;caret-color:transparent!important}' });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const a = (await page.screenshot({ type: 'png' })).toString('base64');
    // nodes whose glyph boxes overlap are shown in separate screenshots, so every glyph pixel has one owner
    const touch = (r1, r2) => r1.some((p_) => r2.some((q) => p_.x < q.x1 + 2 && q.x < p_.x1 + 2 && p_.y < q.y1 + 2 && q.y < p_.y1 + 2));
    const groups = [];
    for (const n of live) { let g = groups.find((G) => G.every((m) => !touch(m.rects, n.rects))); if (!g) { g = []; groups.push(g); } g.push(n); n.group = groups.indexOf(g); }
    const bs = [];
    for (const g of groups) {
      const show = await page.addStyleTag({ content: g.map((n) => `[data-a2-k="${n.k}"]`).join(',') + '{color:var(--a2-col)!important;-webkit-text-fill-color:var(--a2-col)!important}' });
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      bs.push((await page.screenshot({ type: 'png' })).toString('base64'));
      await show.evaluate((n) => n.remove());
    }
    await hide.evaluate((n) => n.remove());
    const res = await page.evaluate(async ({ a_, bs_, info_ }) => {
      const load = async (s_) => { const img = new Image(); img.src = 'data:image/png;base64,' + s_; await img.decode(); const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight; const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0); return cx; };
      const A = await load(a_), Bs = []; for (const b_ of bs_) Bs.push(await load(b_));
      const k = A.canvas.width / innerWidth;
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      return info_.map((n) => {
        if (n.skip) return { sel: n.sel, skip: n.skip };
        const B = Bs[n.group];
        const ratios = [];
        let area = 0;
        for (const q of n.rects) {
          const x0 = Math.floor(q.x * k), y0 = Math.floor(q.y * k), w = Math.max(1, Math.floor((q.x1 - q.x) * k)), h = Math.max(1, Math.floor((q.y1 - q.y) * k));
          const da = A.getImageData(x0, y0, w, h).data, db = B.getImageData(x0, y0, w, h).data;
          area += w * h;
          for (let i = 0; i < da.length; i += 4) {
            if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) < 24) continue;   // not a glyph pixel
            const al = n.color[3];
            const l1 = L(n.color[0] * al + da[i] * (1 - al), n.color[1] * al + da[i + 1] * (1 - al), n.color[2] * al + da[i + 2] * (1 - al)), l2 = L(da[i], da[i + 1], da[i + 2]);
            ratios.push((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
          }
        }
        if (ratios.length < 6) return { sel: n.sel, skip: n.hit ? 'no glyphs drawn (check by eye)' : 'covered by another layer' };
        ratios.sort((x, y) => x - y);
        return { sel: n.sel, need: n.need, min: ratios[0], p2: ratios[Math.floor(ratios.length * 0.02)], px: ratios.length, area };
      });
    }, { a_: a, bs_: bs, info_: info.map((n) => { const m = live.find((x) => x.sel === n.sel && x.k === n.k); return m ? { ...n, group: m.group } : n; }) });
    return res;
  } finally {
    await page.evaluate(() => {
      document.querySelectorAll('[data-a2-k]').forEach((el) => { el.removeAttribute('data-a2-k'); el.style.removeProperty('--a2-col'); });
      document.querySelectorAll('[data-a2-val]').forEach((el) => { el.value = ''; delete el.dataset.a2Val; });
    });
    await freeze(page, false);
  }
}

// 3. axe with every dialog open (desktop and mobile), plus the rules screen and the open list
{
  const axeSrc = fs.readFileSync(path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
  const res = [];
  for (const dev of [{ name: 'desktop', viewport: { width: 1440, height: 900 } }, { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]) {
    const ctx = await browser.newContext(dev);
    await routeCdn(ctx, ROOT);
    const page = await ctx.newPage();
    const run = async (label, samples = 1) => {
      await page.waitForTimeout(700);
      await page.evaluate(axeSrc);
      const r = await page.evaluate(async () => { const x = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }); const cc = x.incomplete.find((i) => i.id === 'color-contrast'); return { v: x.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(' ')}`), passes: x.passes.length, nodes: x.passes.reduce((s, p) => s + p.nodes.length, 0), inc: x.incomplete.map((i) => i.id + ' ' + i.nodes.length), ccTargets: cc ? cc.nodes.map((n) => n.target[0]) : [] }; });
      let contrast = null;
      if (r.ccTargets.length) {
        const all = [];
        for (let k = 0; k < samples; k++) { if (k) await page.waitForTimeout(1100); all.push(await sampleContrast(page, r.ccTargets)); }
        // worst case per node across the samples
        const per = new Map(), skipped = new Map();
        for (const list of all) for (const n of list) {
          if (n.skip) { if (!per.has(n.sel)) skipped.set(n.sel, n.skip); continue; }
          skipped.delete(n.sel);
          const q = per.get(n.sel);
          if (!q) per.set(n.sel, { ...n }); else { q.min = Math.min(q.min, n.min); q.p2 = Math.min(q.p2, n.p2); }
        }
        const nodes = [...per.values()];
        const fails = nodes.filter((n) => n.p2 < n.need);
        const worst = nodes.slice().sort((a, b) => a.p2 / a.need - b.p2 / b.need)[0];
        const why = {}; for (const v of skipped.values()) why[v] = (why[v] || 0) + 1;
        contrast = { measured: nodes.length, of: r.ccTargets.length, samples, fails: fails.map((n) => `${n.sel} p2 ${n.p2.toFixed(2)}:1 (min ${n.min.toFixed(2)}) < ${n.need}`), worst: worst ? `${worst.sel} p2 ${worst.p2.toFixed(2)}:1, min ${worst.min.toFixed(2)}:1 (needs ${worst.need})` : '', skipped: Object.entries(why).map(([k, v]) => `${v} ${k}`).join(', '), eyeCheck: [...skipped].filter(([, v]) => /check by eye/.test(v)).map(([k]) => k) };
      }
      if (contrast && contrast.fails.length && process.env.A2_SHOTS) await page.screenshot({ path: path.join(process.env.A2_SHOTS, `contrast-${dev.name}-${label.replace(/\W+/g, '-')}.png`) });
      res.push({ dev: dev.name, label, violations: r.v, passes: r.passes, nodes: r.nodes, incomplete: r.inc, contrast });
    };
    const go = async (id) => { await page.click('#b-list'); await page.waitForTimeout(300); await page.click(`#index .idx-btn[data-obj="${id}"]`); };
    const esc = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(300); };
    await page.goto(base, { waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
    await run('title screen (live attract canvas)', 3);
    await page.click('#b-start'); await run('rules screen');
    await page.goto(base + '#play', { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
    await page.click('#b-help'); await run('help dialog'); await esc();
    await page.click('#b-book'); await run('post dialog (form)'); await page.click('#pf-form button[type="submit"]'); await run('post form error state'); await esc();
    await go('billboard-lost-skies'); await page.waitForTimeout(1200); await run('title card'); await esc();
    await go('boarded-king-of-tokyo'); await run('underway card'); await esc();
    await go('partner-allum'); await page.waitForTimeout(2600); await run('partner dialogue'); await esc();
    await go('bug-usability'); await page.waitForTimeout(1200); await run('service card (tiny text)'); await esc();
    await go('photo-rooftop'); await run('polaroid card'); await esc();
    await go('power-timezone'); await run('power-up banner'); 
    await page.click('#banner-x').catch(() => {}); await page.click('#b-list'); await run('object list open'); await page.click('#index-x');
    await go('bug-rc'); await page.waitForTimeout(1200); await esc();
    await page.waitForFunction(() => window.__a2.dialog === 'dlg-report', null, { timeout: 10000 }); await page.waitForTimeout(1200); await run('run report');
    await esc(); await page.focus('#stage'); await page.waitForTimeout(300); await run('run HUD over the live canvas', 3);
    await page.goto(base + '#manual', { waitUntil: 'networkidle' }); await run('manual (top)');
    await page.evaluate(() => document.getElementById('mf-comment').scrollIntoView({ block: 'center' })); await run('manual (contact form)');
    await ctx.close();
  }
  out.dialogsAxe = res.map((r) => `${r.dev} ${r.label}: ${r.violations.length} violations (${r.passes} rules, ${r.nodes} nodes)${r.violations.length ? ' ' + r.violations.join('; ') : ''}${r.incomplete.length ? ' · incomplete: ' + r.incomplete.join(', ') : ''}`);
  out.contrastSampled = res.filter((r) => r.contrast).map((r) => `${r.dev} ${r.label}: ${r.contrast.measured - r.contrast.fails.length}/${r.contrast.measured} drawn nodes pass of ${r.contrast.of} incomplete (${r.contrast.samples} sample${r.contrast.samples > 1 ? 's' : ''})${r.contrast.worst ? '; worst ' + r.contrast.worst : ''}${r.contrast.skipped ? '; not drawn: ' + r.contrast.skipped : ''}${r.contrast.eyeCheck.length ? ' [' + r.contrast.eyeCheck.join(', ') + ']' : ''}${r.contrast.fails.length ? ' · FAIL ' + r.contrast.fails.join('; ') : ''}`);
}
out.pageHtmlKB = Math.round(fs.statSync(path.join(ROOT, 'direction-a-bug-hunt', 'page.html')).size / 1024);
await browser.close();
server.close();
console.log(JSON.stringify(out, null, 2));
