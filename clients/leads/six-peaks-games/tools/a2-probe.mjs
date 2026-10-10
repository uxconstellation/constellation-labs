// A2 probe: serve the project, open direction-a-bug-hunt at a hash, optionally run steps, screenshot, print errors.
// Usage: node tools/a2-probe.mjs <hash> <out.jpg> [--w 1440 --h 900] [--mobile] [--rm] [--steps '<js returning a promise>']
//   steps run in Node with (page, sleep) in scope, e.g. --steps "await page.keyboard.down('ArrowRight'); await sleep(1500)"
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { wrapPage } from './a2-serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const hash = args[0] || 'home';
const out = args[1] || '/tmp/a2.jpg';
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const W = Number(opt('w', 1440)), H = Number(opt('h', 900));
const mobile = args.includes('--mobile');
const rm = args.includes('--rm');
const steps = opt('steps', '');
wrapPage(ROOT);
const { server, base } = await serve(ROOT);
const browser = await chromium.launch();
const ctx = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: rm ? 'reduce' : 'no-preference' } : { viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: rm ? 'reduce' : 'no-preference' });
await routeCdn(ctx, ROOT);
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('requestfailed', (r) => errors.push('failed: ' + r.url()));
page.on('response', (r) => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
await page.goto(base + (hash === 'home' ? '' : '#' + hash), { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const sleep = (ms) => page.waitForTimeout(ms);
if (steps) { const fn = new Function('page', 'sleep', `return (async () => { ${steps} })();`); const r = await fn(page, sleep); if (r !== undefined) console.log('steps ->', typeof r === 'string' ? r : JSON.stringify(r)); }
await page.screenshot({ path: out, type: 'jpeg', quality: 80 });
const st = await page.evaluate(() => (window.__a2 ? { mode: window.__a2.mode, run: window.__a2.run, player: window.__a2.player, view: window.__a2.view, near: window.__a2.near, dialog: window.__a2.dialog, loop: window.__a2.loop } : null));
console.log(JSON.stringify(st));
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
server.close();

async function serve(root) {
  const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
  const s = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const f = path.join(root, p);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => s.listen(0, '127.0.0.1', r));
  return { server: s, base: `http://127.0.0.1:${s.address().port}/direction-a-bug-hunt/index.html` };
}
async function routeCdn(c, root) {
  await c.route('https://cdnjs.cloudflare.com/ajax/libs/gsap/**', async (route) => {
    const file = path.join(root, 'node_modules', 'gsap', 'dist', path.basename(new URL(route.request().url()).pathname));
    if (fs.existsSync(file)) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
    return route.fulfill({ status: 404, body: 'no' });
  });
}
