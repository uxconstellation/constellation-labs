// Blocker probes for the liquid grounds:
// 1) /invest hero CTAs are the topmost element at their centre (not covered by the disc)
// 2) body copy on the ink liquid sheets keeps >= 4.5:1 against the brightest pixel behind it
import { createRequire } from "node:module";
const require = createRequire("C:/Dev/_refs/design-library/.tools/package.json");
const { chromium } = require("playwright");
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05); };
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
let fails = 0, checks = 0;
for (const w of [390, 768, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto("http://localhost:5191/invest", { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  for (const label of ["Talk to Aldo", "See the portfolio"]) {
    const ok = await p.evaluate((label) => {
      const a = [...document.querySelectorAll("section a")].find((x) => x.textContent.includes(label));
      const r = a.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!t && a.contains(t);
    }, label);
    checks++; if (!ok) { fails++; console.log("covered CTA", label, w); }
  }
  for (const route of ["/", "/invest"]) {
    await p.goto("http://localhost:5191" + route, { waitUntil: "networkidle" });
    await p.waitForTimeout(1500);
    const els = await p.$$("li.bg-ink p, li.bg-ink span.num");
    for (const el of els) {
      await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(1300);
      const box = await el.boundingBox(); if (!box) continue;
      const color = await el.evaluate((e) => { const c = getComputedStyle(e).color.match(/[\d.]+/g).map(Number); e.dataset.c = e.style.color; e.style.color = "transparent"; return c; });
      const png = await p.screenshot({ clip: box });
      await el.evaluate((e) => { e.style.color = e.dataset.c || ""; });
      // brightest background pixel under the text box
      // decode the PNG in the page and return its pixels
      const data = await p.evaluate(async (b64) => {
        const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
        const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
        const x = c.getContext("2d"); x.drawImage(img, 0, 0); return Array.from(x.getImageData(0, 0, c.width, c.height).data);
      }, png.toString("base64"));
      let best = [0, 0, 0], bl = -1;
      for (let i = 0; i < data.length; i += 4) { const px = [data[i], data[i + 1], data[i + 2]]; const L = lum(px); if (L > bl) { bl = L; best = px; } }
      const a = color[3] ?? 1;
      const fg = color.slice(0, 3).map((c, i) => c * a + best[i] * (1 - a));
      const r = ratio(fg, best); checks++;
      const big = (await el.evaluate((e) => parseFloat(getComputedStyle(e).fontSize))) >= 24;
      if (r < (big ? 3 : 4.5)) { fails++; console.log("low contrast", route, w, r.toFixed(2), (await el.innerText()).slice(0, 40)); }
    }
  }
  await p.close();
}
console.log(`checks ${checks}, fails ${fails}`);
await b.close();
process.exit(fails || !checks ? 1 : 0);
