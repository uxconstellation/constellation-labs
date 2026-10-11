// WebGL spike proof: frame sequences per mechanic, frame-time numbers, loop-pause checks,
// reduced-motion and no-WebGL fallbacks, and a short webm.
// Run `node qa/shoot.mjs prototypes/webgl-spike home --steps 6 --no-axe` first (it writes index.html).
// Usage: node tools/spike-proof.mjs [--only frames|perf|fallback|video]
// Output: prototypes/webgl-spike/proof/*.jpg, proof/spike-run.webm, proof/proof.json
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = 'prototypes/webgl-spike';
const OUT = path.join(ROOT, DIR, 'proof');
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const want = (k) => !only || only === k;
const page0 = path.join(ROOT, DIR, 'page.html'), index = path.join(ROOT, DIR, 'index.html');
if (!fs.existsSync(index) || fs.statSync(index).mtimeMs < fs.statSync(page0).mtimeMs) {
  console.error('index.html is missing or older than page.html: run node qa/shoot.mjs ' + DIR + ' home --steps 6 --no-axe first');
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const URL0 = `http://127.0.0.1:${server.address().port}/${DIR}/index.html`;
const browser = await chromium.launch();
const report = { when: new Date().toISOString(), url: URL0, browser: browser.version(), frames: [], runs: {} };

const COUNT_GL = () => {
  const orig = HTMLCanvasElement.prototype.getContext;
  window.__glContexts = 0;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const c = orig.call(this, type, ...rest);
    if (c && /webgl/i.test(type) && !this.__counted) { this.__counted = true; window.__glContexts++; }
    return c;
  };
};
async function vendor(ctx) {
  await ctx.addInitScript(COUNT_GL);
  await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/**', (route) => {
    const u = new URL(route.request().url()).pathname;
    if (u.startsWith('/ajax/libs/gsap/3.12.5/')) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'node_modules/gsap/dist', path.basename(u))) });
    if (u === '/ajax/libs/three.js/r128/three.min.js') return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'node_modules/three/build/three.min.js')) });
    return route.fulfill({ status: 404, body: 'not vendored' });
  });
}
function watch(page, bucket) {
  bucket.errors = []; bucket.failed = [];
  page.on('pageerror', (e) => bucket.errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') bucket.errors.push('console: ' + m.text()); });
  page.on('requestfailed', (r) => bucket.failed.push(r.url() + ' ' + (r.failure()?.errorText || '')));
  page.on('response', (r) => { if (r.status() >= 400) bucket.failed.push(r.status() + ' ' + r.url()); });
}
const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let t0 = 0;
async function shot(page, name, note, clip) {
  const file = path.join(OUT, name + '.jpg');
  await page.screenshot({ path: file, type: 'jpeg', quality: 82, ...(clip ? { clip } : {}) });
  const ms = t0 ? Math.round(performance.now() - t0) : null;
  report.frames.push({ file: path.relative(ROOT, file), note, ms });
  console.log(name.padEnd(34), (ms != null ? ('+' + ms + 'ms').padEnd(10) : ''.padEnd(10)), note);
}
const page_reveal = (pg) => pg.waitForFunction(() => window.__spike.R.reveal.value >= 0.999, null, { timeout: 20000 });
const ready = (page) => page.waitForFunction(() => window.__spike && window.__spike.ready, null, { timeout: 30000 });
const center = async (page, sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
async function scrollLevel(page) {
  await page.evaluate(() => { const r = document.querySelector('#level').getBoundingClientRect(); window.scrollTo(0, r.top + scrollY - 14); });
  await sleep(700);
}
async function rafStats(page, ms) {
  return page.evaluate((dur) => new Promise((res) => {
    const d = []; let last = 0; const end = performance.now() + dur;
    const f0 = window.__spike.perf.frames; window.__spike.perf.reset();
    const step = (t) => { if (last) d.push(t - last); last = t; if (t < end) requestAnimationFrame(step); else {
      const s = d.slice().sort((a, b) => a - b); const avg = d.reduce((a, b) => a + b, 0) / d.length;
      const cpu = window.__spike.perf.cpu.slice().sort((a, b) => a - b);
      res({ samples: d.length, avgMs: +avg.toFixed(2), p50: +s[(s.length * 0.5) | 0].toFixed(2), p95: +s[(s.length * 0.95) | 0].toFixed(2), maxMs: +s[s.length - 1].toFixed(2), fps: +(1000 / avg).toFixed(1),
        renderedFrames: window.__spike.perf.frames - f0, renderCpuAvgMs: cpu.length ? +(cpu.reduce((a, b) => a + b, 0) / cpu.length).toFixed(2) : null, renderCpuP95: cpu.length ? +cpu[(cpu.length * 0.95) | 0].toFixed(2) : null,
        loopRunning: window.__spike.loopRunning, dpr: window.devicePixelRatio, glPixelRatio: window.__spike.GL.renderer ? window.__spike.GL.renderer.getPixelRatio() : null });
    } };
    requestAnimationFrame(step);
  }), ms);
}

/* ---------------- 1. frames: desktop, all three mechanics ---------------- */
if (want('frames')) {
  const ctx = await browser.newContext(DESKTOP);
  await vendor(ctx);
  const page = await ctx.newPage();
  const run = (report.runs.desktop = {});
  watch(page, run);
  await page.mouse.move(1430, 890);
  t0 = performance.now();
  await page.goto(URL0, { waitUntil: 'domcontentloaded' });
  await ready(page);
  const tReady = Math.round(performance.now() - t0);
  console.log('gl ready at +' + tReady + 'ms');
  // Particle assembly + headline decode, captured live as they run.
  const marks = [150, 700, 1300, 2000, 2800, 4300];
  const tr = performance.now();
  for (let i = 0; i < marks.length; i++) {
    const dt = marks[i] - (performance.now() - tr);
    if (dt > 0) await sleep(dt);
    const a = await page.evaluate(() => +window.__spike.P.assemble.value.toFixed(3));
    await shot(page, `01-mark-assemble-${i + 1}`, `particles assembling, uAssemble=${a}`);
  }
  // Cursor repulsion: sweep across the main peak, then hold.
  const slot = await page.evaluate(() => { const r = document.querySelector('#mark-slot').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  for (let i = 0; i <= 12; i++) { await page.mouse.move(slot.x + slot.w * (0.3 + i * 0.016), slot.y + slot.h * 0.45, { steps: 2 }); await sleep(30); }
  await sleep(450);
  await shot(page, '02-mark-repulsion', 'cursor repulsion over the main peak');
  await shot(page, '02-mark-repulsion-crop', 'repulsion close-up', { x: Math.round(slot.x + slot.w * 0.25), y: Math.round(slot.y - 40), width: Math.round(slot.w * 0.5), height: Math.round(slot.h + 80) });
  await page.mouse.move(1430, 890);
  // Scroll-driven explode while the hero is pinned, then reform on the way back up.
  for (const [y, n] of [[220, 1], [460, 2], [675, 3]]) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(1300);
    const e = await page.evaluate(() => +window.__spike.P.explode.value.toFixed(3));
    await shot(page, `03-mark-explode-${n}`, `scrolled ${y}px into the pin, uExplode=${e}`);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1600);
  await shot(page, '03-mark-reform', 'scrolled back to top: mark reformed, uExplode=' + (await page.evaluate(() => +window.__spike.P.explode.value.toFixed(3))));

  // Bug hunt: the playable loop.
  await scrollLevel(page);
  const seam = await center(page, '.hit[data-bug="seam"]');
  await page.mouse.move(seam.x - 160, seam.y - 120, { steps: 4 });
  await sleep(250);
  await shot(page, '04-hunt-aim', 'crosshair reticle in the panel under test');
  await page.mouse.move(seam.x + 40, seam.y, { steps: 6 });
  await sleep(300);
  await shot(page, '04-hunt-lock', 'reticle locks on over the texture seam');
  // A miss first: empty space in the text block.
  const miss = await page.evaluate(() => { const r = document.querySelector('.lv-text').getBoundingClientRect(); return { x: r.left + r.width * 0.75, y: r.top + 8 }; });
  await page.mouse.move(miss.x, miss.y, { steps: 5 });
  await page.mouse.click(miss.x, miss.y);
  await sleep(140);
  await shot(page, '05-hunt-miss', 'miss: grey ring and "No repro"');
  // Hit 1 by mouse.
  await page.mouse.move(seam.x + 40, seam.y, { steps: 5 });
  await page.mouse.click(seam.x + 40, seam.y);
  await sleep(170);
  await shot(page, '06-hunt-hit-1a', 'hit: shockwave, shake, annotation drawing');
  await sleep(600);
  await shot(page, '06-hunt-hit-1b', 'ticket printing, seam snapping back');
  await sleep(900);
  await shot(page, '06-hunt-hit-1c', 'fixed: seam gone, SP tag left, 1/3');
  // Hit 2 by keyboard: from the Hint button, a real Tab press lands on the next live bug.
  await page.evaluate(() => document.querySelector('#hint').focus());
  await page.keyboard.press('Tab');
  await sleep(250);
  run.keyboardFocus = await page.evaluate(() => ({ focused: document.activeElement.getAttribute('aria-label'), focusVisible: document.activeElement.matches(':focus-visible') }));
  await shot(page, '07-hunt-keyboard-focus', 'keyboard: bug reachable as a button with a visible focus ring');
  await page.keyboard.press('Enter');
  await sleep(1300);
  await shot(page, '07-hunt-hit-2', 'keyboard report: letter drops into place, 2/3');
  // Hit 3 by mouse; this clears the level and unlocks the reward.
  const clip = await center(page, '.hit[data-bug="clip"]');
  await page.mouse.move(clip.x, clip.y, { steps: 5 });
  await page.mouse.click(clip.x, clip.y);
  await sleep(420);
  await shot(page, '08-hunt-hit-3', 'third report, counter rolls to 3/3');
  // Reward: wait for the reveal timeline, then step it for a deterministic dissolve sequence.
  await page.waitForFunction(() => window.__spike.reward && window.__spike.reward.tween, null, { timeout: 15000 });
  await sleep(320);
  await page.evaluate(() => { window.__spike.reward.tween.pause(); window.__spike.reward.frozen = true; });
  const art = await page.evaluate(() => { const r = document.querySelector('#reward').getBoundingClientRect(); return { x: Math.max(0, r.left), y: Math.max(0, r.top), width: Math.min(r.width, 1440), height: Math.min(r.height, 900 - Math.max(0, r.top)) }; });
  const steps = [0, 0.2, 0.4, 0.55, 0.7, 0.85, 1];
  for (let i = 0; i < steps.length; i++) {
    await page.evaluate((v) => { window.__spike.R.reveal.value = v; window.__spike.reward.U.uTime.value += 0.07; }, steps[i]);
    await sleep(160);
    await shot(page, `09-reward-reveal-${i + 1}`, `key-art reveal, uReveal=${steps[i]}`, { x: Math.round(art.x), y: Math.round(art.y), width: Math.round(art.width), height: Math.round(art.height) });
  }
  await page.evaluate(() => { window.__spike.reward.frozen = false; window.__spike.reward.tween.play(); });
  await sleep(1500);
  await shot(page, '10-reward-clear', 'level clear: "Good eye. Imagine what our testers find." with Book a trial + Apply now');
  // Distortion + RGB split on the revealed art.
  const ac = await center(page, '#reward-art');
  for (let i = 0; i < 10; i++) { await page.mouse.move(ac.x - 160 + i * 34, ac.y + Math.sin(i) * 30, { steps: 1 }); await sleep(16); }
  await shot(page, '10-reward-cursor', 'cursor distortion and RGB split on the revealed art', { x: Math.round(art.x), y: Math.round(art.y), width: Math.round(art.width), height: Math.round(art.height) });
  // Loop pause checks: park where neither WebGL view is on screen (hero gone above, reward not yet below).
  const gapY = await page.evaluate(() => { const h = document.querySelector('#top').getBoundingClientRect(); return Math.round(h.bottom + scrollY + 60); });
  await page.evaluate((y) => window.scrollTo(0, y), gapY);
  await sleep(600);
  run.gapCheck = await page.evaluate(() => ({ heroBottom: Math.round(document.querySelector('#top').getBoundingClientRect().bottom), rewardTop: Math.round(document.querySelector('#reward-art').getBoundingClientRect().top), vh: innerHeight }));
  const f1 = await page.evaluate(() => window.__spike.perf.frames);
  await sleep(1000);
  const paused = await page.evaluate((f) => ({ loopRunning: window.__spike.loopRunning, framesRenderedInLastSecond: window.__spike.perf.frames - f }), f1);
  await page.evaluate(() => { const r = document.querySelector('#reward').getBoundingClientRect(); window.scrollTo(0, r.top + scrollY - 100); });
  await sleep(600);
  const resumed = await page.evaluate(() => window.__spike.loopRunning);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await sleep(300);
  const hidden = await page.evaluate(() => window.__spike.loopRunning);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  run.loop = { offscreen: paused, resumedWhenRewardVisible: resumed, runningWhileHidden: hidden };
  run.meta = await page.evaluate(() => ({ markSource: window.__spike.markSource, webglContextsCreated: window.__glContexts, contexts: document.querySelectorAll('canvas.gl').length, glPixelRatio: window.__spike.GL.renderer.getPixelRatio(), texW: window.__spike.reward.U.uTexRes.value.x, hunt: window.__spike.hunt.st.state }));
  // Replay: Play again re-locks the reward and plants a fresh set; force the three other bug types for the record.
  await page.evaluate(() => { const r = document.querySelector('#reward').getBoundingClientRect(); window.scrollTo(0, r.top + scrollY - 200); });
  await sleep(400);
  await page.click('#replay');
  await sleep(900);
  run.replay = await page.evaluate(() => ({ state: window.__spike.hunt.st.state, run: window.__spike.hunt.st.run, set: window.__spike.hunt.st.set, rewardLocked: document.querySelector('#reward').classList.contains('is-locked'), hits: document.querySelectorAll('.hit').length }));
  await page.evaluate(() => window.__spike.hunt.reset(['texture', 'tofu', 'seam']));
  await scrollLevel(page);
  await page.mouse.move(700, 300);
  await sleep(500);
  await shot(page, '16-hunt-variant-texture-tofu', 'replay variant: missing texture (portrait) and missing glyph (In-offi?e staff)');
  const tx = await center(page, '.hit[data-bug="texture"]');
  await page.mouse.move(tx.x, tx.y, { steps: 5 });
  await page.mouse.click(tx.x, tx.y);
  await sleep(520);
  await shot(page, '16-hunt-variant-texture-fix', 'missing texture streams back in tile by tile');
  await page.evaluate(() => window.__spike.hunt.reset(['overlap', 'kern', 'texture']));
  await sleep(400);
  const ov = await page.evaluate(() => { const r = document.querySelector('.lv-stats').getBoundingClientRect(); return { x: Math.round(r.left - 10), y: Math.round(r.top - 10), width: Math.round(r.width + 20), height: Math.round(r.height + 20) }; });
  await shot(page, '16-hunt-variant-zfight', 'replay variant: ISO 27001 card z-fighting over its neighbour', ov);
  run.variants = await page.evaluate(() => ({ set: window.__spike.hunt.st.set, run: window.__spike.hunt.st.run }));
  run.glReadyMs = tReady;
  console.log('loop:', JSON.stringify(run.loop), 'meta:', JSON.stringify(run.meta));
  t0 = 0;
  await ctx.close();

  // Mobile: hero, sticky score bar and ticket toast, reward.
  const mctx = await browser.newContext(MOBILE);
  await vendor(mctx);
  const mp = await mctx.newPage();
  const mrun = (report.runs.mobile = {});
  watch(mp, mrun);
  await mp.goto(URL0, { waitUntil: 'domcontentloaded' });
  await ready(mp);
  await sleep(4200);
  await shot(mp, '11-mobile-hero', 'mobile hero, 15k points, assembled');
  mrun.meta = await mp.evaluate(() => ({ dpr: window.devicePixelRatio, glPixelRatio: window.__spike.GL.renderer.getPixelRatio(), canvasPx: [window.__spike.GL.canvas.width, window.__spike.GL.canvas.height], webglContextsCreated: window.__glContexts }));
  await mp.evaluate(() => { const r = document.querySelector('#level').getBoundingClientRect(); window.scrollTo(0, r.top + scrollY - 70); });
  await sleep(700);
  const ms = await center(mp, '.hit[data-bug="seam"]');
  await mp.touchscreen.tap(ms.x, ms.y);
  await sleep(900);
  await shot(mp, '12-mobile-hunt-toast', 'mobile: sticky score bar, ticket toast after a tap');
  for (const k of ['kern', 'clip']) {
    await mp.evaluate((kk) => document.querySelector('.hit[data-bug="' + kk + '"]').scrollIntoView({ block: 'center' }), k);
    await sleep(400);
    const c = await center(mp, `.hit[data-bug="${k}"]`);
    await mp.touchscreen.tap(c.x, c.y);
    await sleep(700);
  }
  await page_reveal(mp);
  await sleep(500);
  await shot(mp, '13-mobile-reward', 'mobile: reward revealed');
  await mctx.close();
}

/* ---------------- 2. perf: rAF deltas over 3 s ---------------- */
if (want('perf')) {
  const ctx = await browser.newContext(DESKTOP);
  await vendor(ctx);
  const page = await ctx.newPage();
  const run = (report.runs.perf = {});
  watch(page, run);
  await page.goto(URL0, { waitUntil: 'domcontentloaded' });
  await ready(page);
  await sleep(4000);
  run.heroIdle = await rafStats(page, 3000);
  const slot = await page.evaluate(() => { const r = document.querySelector('#mark-slot').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.move(slot.x, slot.y);
  const mv = (async () => { for (let i = 0; i < 60; i++) { await page.mouse.move(slot.x + Math.sin(i / 5) * 220, slot.y + Math.cos(i / 7) * 40); await sleep(45); } })();
  run.heroCursor = await rafStats(page, 3000);
  await mv;
  await page.evaluate(() => window.scrollTo(0, 300));
  await sleep(900);
  run.heroExplodeScrubbed = await rafStats(page, 3000);
  // Unlock the reward through the real game, then measure that view alone.
  await page.evaluate(() => { const r = document.querySelector('#level').getBoundingClientRect(); window.scrollTo(0, r.top + scrollY - 14); });
  await sleep(600);
  for (const k of ['seam', 'kern', 'clip']) { await page.evaluate((kk) => document.querySelector('.hit[data-bug="' + kk + '"]').click(), k); await sleep(250); }
  await page_reveal(page);
  await sleep(400);
  run.rewardView = await rafStats(page, 3000);
  await page.evaluate(() => { const h = document.querySelector('#top').getBoundingClientRect(); window.scrollTo(0, h.bottom + scrollY + 60); });
  await sleep(800);
  run.offscreen = await rafStats(page, 2000);
  console.log('perf:', JSON.stringify(run, null, 1));
  await ctx.close();
}

/* ---------------- 3. fallbacks ---------------- */
if (want('fallback')) {
  for (const [key, opts, init] of [
    ['reduced', { ...DESKTOP, reducedMotion: 'reduce' }, null],
    ['nowebgl', DESKTOP, () => { delete window.WebGLRenderingContext; delete window.WebGL2RenderingContext; }],
  ]) {
    const ctx = await browser.newContext(opts);
    await vendor(ctx);
    if (init) await ctx.addInitScript(init);
    const page = await ctx.newPage();
    const run = (report.runs[key] = {});
    watch(page, run);
    await page.goto(URL0, { waitUntil: 'networkidle' });
    await sleep(1200);
    run.state = await page.evaluate(() => ({ cls: document.documentElement.className, three: !!window.THREE, canvases: document.querySelectorAll('canvas.gl').length, markFallbackOpacity: getComputedStyle(document.querySelector('.mark-fallback')).opacity }));
    await shot(page, `14-fallback-${key}-hero`, `${key}: composed static hero (logo mark image + type)`);
    await page.evaluate(() => { const r = document.querySelector('#level').getBoundingClientRect(); window.scrollTo(0, r.top + scrollY - 14); });
    await sleep(400);
    for (const k of ['seam', 'kern', 'clip']) { await page.evaluate((kk) => document.querySelector('.hit[data-bug="' + kk + '"]').click(), k); await sleep(200); }
    await sleep(2600);
    await shot(page, `15-fallback-${key}-reward`, `${key}: game still playable, reward unlocks to the static key art`);
    console.log(key, JSON.stringify(run.state), 'errors', run.errors.length, 'failed', run.failed.length);
    await ctx.close();
  }
}

if (want('fallback')) {
  const ctx = await browser.newContext({ ...DESKTOP, javaScriptEnabled: false });
  const page = await ctx.newPage();
  const run = (report.runs.nojs = {});
  watch(page, run);
  await page.goto(URL0, { waitUntil: 'networkidle' });
  await sleep(600);
  await shot(page, '17-nojs-hero', 'JavaScript off: static hero still composed and readable');
  await page.evaluate(() => { const r = document.querySelector('#level').getBoundingClientRect(); window.scrollTo(0, r.top + scrollY - 120); });
  await sleep(300);
  await shot(page, '17-nojs-hunt', 'JavaScript off: panel shows the first three bugs statically, no-JS note visible');
  console.log('nojs errors', run.errors.length, 'failed', run.failed.length);
  await ctx.close();
}

/* ---------------- 4. video (webm, <= 15 s) ---------------- */
if (want('video')) {
  const vdir = path.join(OUT, '.video-tmp');
  fs.rmSync(vdir, { recursive: true, force: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, recordVideo: { dir: vdir, size: { width: 1280, height: 800 } } });
  await vendor(ctx);
  const page = await ctx.newPage();
  const vt = performance.now();
  const run = (report.runs.video = {});
  watch(page, run);
  await page.mouse.move(1270, 790);
  await page.goto(URL0, { waitUntil: 'domcontentloaded' });
  await ready(page);
  run.readyAtS = +((performance.now() - vt) / 1000).toFixed(2);
  await sleep(3300);
  const slot = await page.evaluate(() => { const r = document.querySelector('#mark-slot').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  for (let i = 0; i <= 20; i++) { await page.mouse.move(slot.x + slot.w * (0.15 + i * 0.035), slot.y + slot.h * (0.5 + Math.sin(i / 3) * 0.2), { steps: 2 }); await sleep(20); }
  await page.mouse.move(1270, 790, { steps: 3 });
  for (let i = 0; i < 11; i++) { await page.mouse.wheel(0, 64); await sleep(60); }
  await sleep(350);
  await page.evaluate(() => { const r = document.querySelector('#level').getBoundingClientRect(); window.scrollTo({ top: r.top + scrollY - 10, behavior: 'smooth' }); });
  await sleep(900);
  for (const k of ['seam', 'kern', 'clip']) {
    const c = await center(page, `.hit[data-bug="${k}"]`);
    const x = c.x + (k === 'seam' ? 60 : 0);
    await page.mouse.move(x, c.y, { steps: 6 });
    await sleep(90);
    await page.mouse.click(x, c.y);
    await sleep(520);
  }
  await page_reveal(page);
  await sleep(600);
  run.scriptMs = Math.round(performance.now() - vt);
  const v = page.video();
  await ctx.close();
  const raw = await v.path();
  const dest = path.join(OUT, 'spike-run.webm');
  const dur = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();
  const rawDur = dur(raw);
  // Start just before WebGL is ready (blank page-load lead-in removed), cap at 14.9 s.
  const lead = Math.max(0, Math.min(run.readyAtS - 0.3, rawDur - 14.9));
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', lead.toFixed(2), '-i', raw, '-t', '14.9', '-c:v', 'libvpx', '-b:v', '2M', '-an', dest]);
  run.rawDurationS = rawDur; run.trimmedLeadS = +lead.toFixed(2); run.durationS = dur(dest); run.bytes = fs.statSync(dest).size;
  fs.rmSync(vdir, { recursive: true, force: true });
  console.log('video:', JSON.stringify(run));
}

await browser.close();
server.close();
const prev = fs.existsSync(path.join(OUT, 'proof.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'proof.json'), 'utf8')) : {};
if (only) { prev.runs = { ...(prev.runs || {}), ...report.runs }; if (report.frames.length) prev.frames = report.frames; prev.when = report.when; prev.browser = report.browser; }
fs.writeFileSync(path.join(OUT, 'proof.json'), JSON.stringify(only ? prev : report, null, 1));
const errs = Object.entries(report.runs).map(([k, r]) => `${k}: errors ${r.errors?.length ?? 0}, failed ${r.failed?.length ?? 0}`);
console.log(errs.join(' | '));
for (const [k, r] of Object.entries(report.runs)) { if (r.errors?.length) console.log(k, r.errors); if (r.failed?.length) console.log(k, r.failed); }
