// Direction A QA probe: horizontal overflow culprits, heading line counts at 390px,
// and any element whose computed opacity is 0 while it holds text. Read-only.
// Usage: node tools/a-probe.mjs <hash> [width] [height]
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = process.argv[2] || 'home', W = +(process.argv[3] || 390), H = +(process.argv[4] || 844);
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  const t = { '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.js': 'text/javascript' }[path.extname(f)] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': t }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/gsap/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'node_modules/gsap/dist', path.basename(new URL(route.request().url()).pathname))) }));
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:${server.address().port}/direction-a-ascent/index.html` + (hash === 'home' ? '' : '#' + hash), { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const out = await p.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const over = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > vw + 1 && getComputedStyle(el).position !== 'fixed') {
      let clipped = false;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'hidden' || o === 'clip') { clipped = true; break; } }
      if (!clipped) over.push(el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') + ' right=' + Math.round(r.right));
    }
  }
  const heads = [...document.querySelectorAll('h1,h2,h3,.statement')].filter((h) => h.offsetParent && h.textContent.trim()).map((h) => {
    const fs = parseFloat(getComputedStyle(h).fontSize);
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    const tops = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width > 1) tops.push(r.top);
    }
    tops.sort((a, b) => a - b);
    let lines = 0, last = -1e9;
    for (const t of tops) { if (t - last > fs * 0.5) { lines++; last = t; } }
    return { t: h.textContent.trim().slice(0, 48), lines };
  });
  const over3 = heads.filter((x) => x.lines > 3);
  return { vw, scrollW: document.documentElement.scrollWidth, over: over.slice(0, 25), headings: heads.length, maxLines: Math.max(...heads.map((x) => x.lines)), over3 };
});
console.log(JSON.stringify(out, null, 1));
await b.close(); server.close();
