// Direction B probe: open a route in Chromium (same wrapper + local GSAP as qa/shoot.mjs) and run checks or captures.
// Usage:
//   node tools/b-probe.mjs overflow <hash> [mobile|desktop]       list elements wider than the viewport
//   node tools/b-probe.mjs heroes [mobile|desktop] <outdir>        capture every hero slide after its checkpoints type in
//   node tools/b-probe.mjs shot <hash> <mobile|desktop> <out.jpg> [scrollY|#selector] [waitMs] [--reduced]
//   node tools/b-probe.mjs eval <hash> <mobile|desktop> "<js expression>"
//   node tools/b-probe.mjs act <hash> <mobile|desktop> <out.jpg> "<async js>" [waitMs] [--reduced]
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Same skeleton as qa/shoot.mjs wrap() (copied: importing shoot.mjs would run the harness).
const wrap = content => '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' +
  '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}' +
  'body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>' +
  '</head><body>\n' + content + '\n</body></html>\n';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = 'direction-b-press-start';
const [mode, ...rest] = process.argv.slice(2);

fs.writeFileSync(path.join(ROOT, DIR, 'index.html'), wrap(fs.readFileSync(path.join(ROOT, DIR, 'page.html'), 'utf8')));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname); const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/${DIR}/index.html`;
const DEV = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const browser = await chromium.launch();
async function open(hash, dev, extra = {}) {
  const ctx = await browser.newContext({ ...DEV[dev], ...extra });
  await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/gsap/**', route => route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'node_modules', 'gsap', 'dist', path.basename(new URL(route.request().url()).pathname))) }));
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(base + (hash && hash !== 'home' ? '#' + hash : ''), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  return { ctx, page, errs };
}
try {
  if (mode === 'overflow') {
    const [hash = 'home', dev = 'mobile'] = rest;
    const { page } = await open(hash, dev);
    const out = await page.evaluate(() => {
      const W = document.documentElement.clientWidth, hits = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > W + 1 || r.left < -1)) hits.push({ el: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) });
      });
      return { W, sw: document.documentElement.scrollWidth, hits: hits.slice(0, 40) };
    });
    console.log(JSON.stringify(out, null, 1));
  } else if (mode === 'heroes') {
    const [dev = 'desktop', outdir = '.'] = rest;
    fs.mkdirSync(outdir, { recursive: true });
    const { page, errs } = await open('home', dev);
    const n = await page.$$eval('.rr', els => els.length);
    for (let i = 0; i < n; i++) {
      if (i) await page.click(`.rr[data-go="${i}"]`);
      await page.waitForTimeout(i ? 3600 : 2600);
      await page.mouse.move(5, 5);
      const f = path.join(outdir, `hero-${dev}-${i}.jpg`);
      await page.screenshot({ path: f, type: 'jpeg', quality: 80 });
      const info = await page.evaluate(() => [...document.querySelectorAll('.cp')].map(c => ({ hidden: c.hidden, flip: c.classList.contains('cp--flip'), t: c.querySelector('.cp__txt').textContent })));
      console.log(f, JSON.stringify(info));
    }
    if (errs.length) console.log('ERRORS', errs);
  } else if (mode === 'shot') {
    const [hash, dev, out, where, wait = '1200', flag] = rest;
    const { page, errs } = await open(hash, dev, flag === '--reduced' ? { reducedMotion: 'reduce' } : {});
    if (where && where.startsWith('#')) await page.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'start', behavior: 'instant' }), where);
    else if (where) await page.evaluate(y => window.scrollTo({ top: Number(y), behavior: 'instant' }), where);
    await page.waitForTimeout(Number(wait));
    await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
    console.log(out, errs.length ? 'ERRORS ' + errs.join(' | ') : 'ok');
  } else if (mode === 'act') {
    // act <hash> <dev> <out.jpg> "<async js run in page before the capture>" [waitMs] [--reduced]
    const [hash, dev, out, js, wait = '900', flag] = rest;
    const { page, errs } = await open(hash, dev, flag === '--reduced' ? { reducedMotion: 'reduce' } : {});
    const r = await page.evaluate(`(async () => { ${js} })()`);
    await page.waitForTimeout(Number(wait));
    await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
    console.log(out, r === undefined ? '' : JSON.stringify(r), errs.length ? 'ERRORS ' + errs.join(' | ') : 'ok');
  } else if (mode === 'eval') {
    const [hash, dev, expr] = rest;
    const { page, errs } = await open(hash, dev);
    console.log(JSON.stringify(await page.evaluate(expr), null, 1));
    if (errs.length) console.log('ERRORS', errs);
  } else {
    console.log('modes: overflow | heroes | shot | eval');
  }
} finally {
  await browser.close(); server.close();
}
