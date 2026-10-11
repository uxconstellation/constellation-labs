// WebGL spike probe: serve the project, open prototypes/webgl-spike/index.html, run a snippet.
// Usage: node tools/spike-probe.mjs <desktop|mobile> [--reduce] [--wait ms] -- '<js expression returning JSON-able>'
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const dev = args[0] || 'desktop';
const reduce = args.includes('--reduce');
const wi = args.indexOf('--wait');
const waitMs = wi > -1 ? +args[wi + 1] : 2500;
const js = args[args.indexOf('--') + 1];
const TYPES = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const DEV = dev === 'mobile' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const b = await chromium.launch();
const ctx = await b.newContext({ ...DEV, reducedMotion: reduce ? 'reduce' : 'no-preference' });
const VEND = { gsap: path.join(ROOT, 'node_modules/gsap/dist'), three: path.join(ROOT, 'node_modules/three/build/three.min.js') };
await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/**', (route) => {
  const u = new URL(route.request().url()).pathname;
  if (u.startsWith('/ajax/libs/gsap/3.12.5/')) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(VEND.gsap, path.basename(u))) });
  if (u === '/ajax/libs/three.js/r128/three.min.js') return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(VEND.three) });
  return route.fulfill({ status: 404, body: 'not vendored' });
});
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
await p.goto(`http://127.0.0.1:${server.address().port}/prototypes/webgl-spike/index.html`, { waitUntil: 'networkidle' });
await p.waitForTimeout(waitMs);
const out = await p.evaluate(js);
console.log(JSON.stringify(out, null, 1));
if (errs.length) console.log('console:', errs);
await b.close(); server.close();
