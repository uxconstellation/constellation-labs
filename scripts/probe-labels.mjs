// Asserts the hero orbit labels stay inside the viewport across a full orbit sample.
import { createRequire } from "node:module";
const require = createRequire("C:/Dev/_refs/design-library/.tools/package.json");
const { chromium } = require("playwright");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:5191/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
let checks = 0, bad = 0;
for (let s = 0; s < 20; s++) {
  const r = await p.evaluate(() => [...document.querySelectorAll("[data-orbit-label]")].map((e) => { const b = e.getBoundingClientRect(); return [b.left, b.right]; }));
  for (const [l, rr] of r) { checks++; if (l < 0 || rr > 1440) bad++; }
  // jump the orbit forward by waiting
  await p.waitForTimeout(3200);
}
console.log(`labels checked ${checks}, outside viewport ${bad}`);
await b.close();
process.exit(bad || !checks ? 1 : 0);
