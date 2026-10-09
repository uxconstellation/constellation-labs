// Asserts visible hero orbit labels stay inside the viewport and uncovered across a full orbit sample.
import { createRequire } from "node:module";
const require = createRequire("C:/Dev/_refs/design-library/.tools/package.json");
const { chromium } = require("playwright");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:5191/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
let checks = 0, bad = 0;
for (let s = 0; s < 20; s++) {
  // A visible label must sit inside the viewport and be the topmost thing at its centre.
  const r = await p.evaluate(() => [...document.querySelectorAll("[data-orbit-label]")]
    .filter((e) => parseFloat(getComputedStyle(e).opacity) > 0.5)
    .map((e) => {
      // labels are pointer-events:none, which elementFromPoint skips; lift that while testing
      e.style.pointerEvents = "auto";
      const b = e.getBoundingClientRect();
      const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      e.style.pointerEvents = "";
      return [b.left, b.right, !!top && e.contains(top), top ? (top.className?.baseVal ?? top.className).toString().slice(0, 60) + " " + top.tagName : "none"];
    }));
  for (const [l, rr, onTop, who] of r) { checks++; if (l < 0 || rr > 1440 || !onTop) { bad++; console.log("fail", Math.round(l), Math.round(rr), who); } }
  // jump the orbit forward by waiting
  await p.waitForTimeout(3200);
}
console.log(`labels checked ${checks}, off-screen or covered ${bad}`);
await b.close();
process.exit(bad || !checks ? 1 : 0);
