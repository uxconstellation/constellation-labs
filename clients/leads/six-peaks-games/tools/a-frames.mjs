// Direction A review frames: screenshot chosen scroll positions (pinned states, section starts).
// Usage: node tools/a-frames.mjs <hash> <desktop|mobile> "<sel>[+N vh]" ... [--out name]
//   e.g. node tools/a-frames.mjs home desktop "#route+120vh" "#why+150vh" "#basecamp"
// Positions are measured at scrollY=0 (before any pin engages). Output: qa/shots/direction-a-ascent/frames/
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const [hash, device] = args;
const outArg = args.indexOf('--out');
const prefix = outArg > -1 ? args[outArg + 1] : hash;
const targets = args.slice(2).filter((a, i, arr) => a !== '--out' && arr[i - 1] !== '--out');
const DEV = device === 'mobile'
  ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
  : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const reduce = args.includes('--reduce');
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  const t = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.js': 'text/javascript' }[path.extname(f)] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': t }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const b = await chromium.launch();
const ctx = await b.newContext({ ...DEV, reducedMotion: reduce ? 'reduce' : 'no-preference' });
await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/gsap/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'node_modules/gsap/dist', path.basename(new URL(route.request().url()).pathname))) }));
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await p.goto(`http://127.0.0.1:${server.address().port}/direction-a-ascent/index.html` + (hash === 'home' ? '' : '#' + hash), { waitUntil: 'networkidle' });
await p.waitForTimeout(2600);
const outDir = path.join(ROOT, 'qa', 'shots', 'direction-a-ascent', 'frames');
fs.mkdirSync(outDir, { recursive: true });
const ys = await p.evaluate((list) => list.map((t) => {
  if (t.startsWith('y=')) return +t.slice(2);
  const m = t.match(/^(.*?)(?:\+(-?[\d.]+)vh)?$/);
  const el = document.querySelector(m[1]);
  if (!el) return null;
  return Math.round(el.getBoundingClientRect().top + scrollY + (m[2] ? (+m[2] / 100) * innerHeight : 0));
}), targets);
let i = 0;
for (const y of ys) {
  const name = `${prefix}-${device}-f${String(i).padStart(2, '0')}.jpg`;
  if (y == null) { console.log('missing target', targets[i]); i++; continue; }
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(1600);
  await p.screenshot({ path: path.join(outDir, name), type: 'jpeg', quality: 80 });
  console.log(name, targets[i], 'y=' + y);
  i++;
}
if (errors.length) console.log('errors:', errors);
await b.close(); server.close();
