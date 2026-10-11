// Direction A contrast sampler for text that sits on imagery or SVG (axe reports those as "incomplete").
// For each scroll target: record every visible text box and its colour, hide all text, screenshot the
// bare background, then measure the 95th-percentile background luminance behind each box (worst case for
// light text) and report WCAG ratios below 4.5:1 (3:1 for large text).
// Usage: node tools/a-contrast.mjs <hash> <desktop|mobile> "<sel>[+N vh]" ...
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [hash, device, ...targets] = process.argv.slice(2);
const DEV = device === 'mobile'
  ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }
  : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  const t = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.js': 'text/javascript' }[path.extname(f)] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': t }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const b = await chromium.launch();
const ctx = await b.newContext(DEV);
await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/gsap/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'node_modules/gsap/dist', path.basename(new URL(route.request().url()).pathname))) }));
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:${server.address().port}/direction-a-ascent/index.html` + (hash === 'home' ? '' : '#' + hash), { waitUntil: 'networkidle' });
await p.waitForTimeout(2600);
const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'a-contrast-'));
const ys = await p.evaluate((list) => list.map((t) => {
  const m = t.match(/^(.*?)(?:\+(-?[\d.]+)vh)?$/); const el = document.querySelector(m[1]);
  return el ? Math.round(el.getBoundingClientRect().top + scrollY + (m[2] ? (+m[2] / 100) * innerHeight : 0)) : null;
}), targets.length ? targets : ['body']);
let fails = 0, checked = 0;
for (let i = 0; i < ys.length; i++) {
  if (ys[i] == null) { console.log('missing', targets[i]); continue; }
  await p.evaluate((y) => window.scrollTo(0, y), ys[i]);
  await p.waitForTimeout(1500);
  const boxes = await p.evaluate(() => {
    const out = [];
    const vw = innerWidth, vh = innerHeight;
    for (const el of document.querySelectorAll('body *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own) continue;
      const cs = getComputedStyle(el);
      if (el.closest('.sr') || cs.visibility !== 'visible' || +cs.opacity === 0 || el.closest('[aria-hidden="true"]') && !el.closest('.corner')) continue;
      let o = el, op = 1; while (o && o !== document.body) { op *= +getComputedStyle(o).opacity; o = o.parentElement; }
      if (op < 0.5) continue;
      // Measure the text itself (union of its text-node rects), not the element's block box.
      let r = null;
      for (const n of el.childNodes) {
        if (n.nodeType !== 3 || !n.textContent.trim()) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const q of rg.getClientRects()) {
          r = r ? { left: Math.min(r.left, q.left), top: Math.min(r.top, q.top), right: Math.max(r.right, q.right), bottom: Math.max(r.bottom, q.bottom) } : { left: q.left, top: q.top, right: q.right, bottom: q.bottom };
        }
      }
      if (!r) continue;
      const bar = document.getElementById('topbar'); const barB = bar ? bar.getBoundingClientRect().bottom : 0;
      if (!el.closest('#topbar') && r.top < barB) continue; // scrolled under the fixed bar
      r.width = r.right - r.left; r.height = r.bottom - r.top;
      if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) continue;
      const m = cs.color.match(/[\d.]+/g).map(Number);
      const size = parseFloat(cs.fontSize), weight = +cs.fontWeight;
      out.push({ t: el.textContent.trim().slice(0, 40), c: m.slice(0, 3), large: size >= 24 || (size >= 18.66 && weight >= 700),
        x: Math.max(0, r.left), y: Math.max(0, r.top), w: Math.min(vw, r.right) - Math.max(0, r.left), h: Math.min(vh, r.bottom) - Math.max(0, r.top) });
    }
    const st = document.createElement('style'); st.id = 'a-hide';
    st.textContent = '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-decoration-color:transparent!important;caret-color:transparent!important}';
    document.head.appendChild(st);
    return out;
  });
  await p.waitForTimeout(150);
  const shot = path.join(tmp, `bg-${i}.png`);
  await p.screenshot({ path: shot });
  await p.evaluate(() => document.getElementById('a-hide').remove());
  fs.writeFileSync(path.join(tmp, `boxes-${i}.json`), JSON.stringify(boxes));
  const py = `
import json,sys
from PIL import Image
im=Image.open(sys.argv[1]).convert('RGB'); bx=json.load(open(sys.argv[2]))
def lin(c):
    c=c/255.0
    return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def L(rgb): return 0.2126*lin(rgb[0])+0.7152*lin(rgb[1])+0.0722*lin(rgb[2])
out=[]
for b in bx:
    x,y,w,h=int(b['x']),int(b['y']),max(1,int(b['w'])),max(1,int(b['h']))
    crop=im.crop((x,y,min(im.width,x+w),min(im.height,y+h)))
    px=list(crop.get_flattened_data()) if hasattr(crop,"get_flattened_data") else list(crop.getdata())
    if not px: continue
    ls=sorted(L(p) for p in px)
    lt=L(b['c'])
    if lt>=0.18: lb=ls[int(len(ls)*0.95)-1 if len(ls)>1 else 0]; r=(lt+0.05)/(lb+0.05)
    else: lb=ls[int(len(ls)*0.05)]; r=(lb+0.05)/(lt+0.05)
    need=3.0 if b['large'] else 4.5
    out.append((round(r,2),need,b['t']))
print(json.dumps(out))
`;
  const res = JSON.parse(execFileSync('python3', ['-c', py, shot, path.join(tmp, `boxes-${i}.json`)]).toString());
  checked += res.length;
  const bad = res.filter(([r, need]) => r < need);
  fails += bad.length;
  console.log(`${targets[i] || 'top'}: ${res.length} text boxes, ${bad.length} below threshold`);
  for (const [r, need, t] of bad) console.log(`   ${r} < ${need}  "${t}"`);
}
console.log(`checked ${checked} text boxes, ${fails} below threshold`);
await b.close(); server.close();
