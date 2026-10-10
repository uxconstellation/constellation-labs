// QA harness for the direction prototypes.
// Wraps <dir>/page.html in the same skeleton the Artifact host adds at publish time,
// writes <dir>/index.html (standalone copy), serves the project over http, then for each
// route hash: viewport screenshots down the page (desktop 1440x900, mobile 390x844),
// console + page errors, horizontal-overflow check, and an axe-core WCAG 2.2 AA run.
//
// Usage: node qa/shoot.mjs <dir> [hash1,hash2,...] [--steps N] [--no-axe]
//   e.g. node qa/shoot.mjs direction-a-ascent home,game-lost-skies --steps 10
// Output: qa/shots/<dir>/<hash>-<device>-sNN.jpg and qa/shots/<dir>/report.json
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const dir = args[0];
if (!dir) { console.error('usage: node qa/shoot.mjs <dir> [hashes] [--steps N] [--no-axe]'); process.exit(2); }
const hashes = (args[1] && !args[1].startsWith('--') ? args[1] : 'home').split(',').filter(Boolean);
const stepsArg = args.indexOf('--steps');
const STEPS = stepsArg > -1 ? Number(args[stepsArg + 1]) : 8;
const AXE = !args.includes('--no-axe');

// 1. Wrap page.html exactly like the Artifact skeleton.
export function wrap(content) {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' +
    '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}' +
    'body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>' +
    '</head><body>\n' + content + '\n</body></html>\n';
}
const src = path.join(ROOT, dir, 'page.html');
if (!fs.existsSync(src)) { console.error('missing ' + src); process.exit(2); }
fs.writeFileSync(path.join(ROOT, dir, 'index.html'), wrap(fs.readFileSync(src, 'utf8')));

// 2. Static server over the project root (follows the assets symlink).
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('404 ' + p); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/${dir}/index.html`;

// 3. Browser. cdnjs is blocked from this container, so serve pinned GSAP files locally.
const GSAP_DIST = path.join(ROOT, 'node_modules', 'gsap', 'dist');
const browser = await chromium.launch();
const outDir = path.join(ROOT, 'qa', 'shots', dir);
fs.mkdirSync(outDir, { recursive: true });
const report = { dir, base, when: new Date().toISOString(), runs: [] };
const DEVICES = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];

for (const dev of DEVICES) {
  const ctx = await browser.newContext({ viewport: dev.viewport, deviceScaleFactor: dev.deviceScaleFactor, isMobile: dev.isMobile, hasTouch: dev.hasTouch });
  await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/gsap/**', async route => {
    const file = path.join(GSAP_DIST, path.basename(new URL(route.request().url()).pathname));
    if (fs.existsSync(file)) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
    return route.fulfill({ status: 404, body: 'not vendored: ' + file });
  });
  for (const h of hashes) {
    const page = await ctx.newPage();
    const errors = [];
    const failed = [];
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('requestfailed', r => failed.push(r.url() + ' ' + (r.failure()?.errorText || '')));
    page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
    const url = base + (h === 'home' ? '' : '#' + h);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    const run = { hash: h, device: dev.name, url, shots: [], errors, failed };
    const metrics = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      title: document.title,
      fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight).filter((v, i, a) => a.indexOf(v) === i),
    }));
    run.metrics = metrics;
    run.horizontalOverflow = metrics.scrollWidth > metrics.clientWidth + 1;
    const vh = dev.viewport.height;
    const maxY = Math.max(0, metrics.scrollHeight - vh);
    const n = Math.min(STEPS, Math.ceil(maxY / vh) + 1);
    for (let i = 0; i < n; i++) {
      const y = n === 1 ? 0 : Math.round((maxY * i) / (n - 1));
      await page.evaluate(yy => window.scrollTo(0, yy), y);
      await page.waitForTimeout(900);
      const file = path.join(outDir, `${h}-${dev.name}-s${String(i).padStart(2, '0')}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 72 });
      run.shots.push(path.relative(ROOT, file));
    }
    if (AXE) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      await page.addScriptTag({ path: path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js') });
      const axe = await page.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
        return {
          passes: r.passes.length,
          passNodes: r.passes.reduce((s, p) => s + p.nodes.length, 0),
          incomplete: r.incomplete.length,
          violations: r.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, first: v.nodes[0]?.target?.join(' '), summary: v.nodes[0]?.failureSummary?.slice(0, 220) })),
        };
      });
      run.axe = axe;
    }
    report.runs.push(run);
    console.log(`${dev.name} #${h}: ${run.shots.length} shots, height ${metrics.scrollHeight}, overflow ${run.horizontalOverflow}, errors ${errors.length}, failed ${failed.length}` +
      (run.axe ? `, axe violations ${run.axe.violations.length} (rules passed ${run.axe.passes}, nodes ${run.axe.passNodes})` : ''));
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server.close();
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log('report: ' + path.relative(ROOT, path.join(outDir, 'report.json')));
