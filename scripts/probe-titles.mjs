// Product hero titles must sit on one line and fit their column at every width.
import { createRequire } from "node:module";
const require = createRequire("C:/Dev/_refs/design-library/.tools/package.json");
const { chromium } = require("playwright");
const b = await chromium.launch();
let fails = 0, checks = 0;
for (const w of [320, 360, 375, 390, 414, 768, 1024, 1440, 1920]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  for (const s of ["acre", "pinpoints", "prism", "nod"]) {
    await p.goto("http://localhost:5191/" + s, { waitUntil: "networkidle" }); await p.waitForTimeout(1600);
    const r = await p.evaluate(() => { const h = document.querySelector(".pp-title"); const chars = [...h.querySelectorAll(".pp-ch")].map((c) => c.getBoundingClientRect()); const lines = new Set(chars.map((c) => Math.round(c.top))).size; const right = Math.max(...chars.map((c) => c.right)); return { lines, right, vw: document.documentElement.clientWidth }; });
    checks++;
    if (r.lines !== 1 || r.right > r.vw) { fails++; console.log("fail", s, w, JSON.stringify(r)); }
  }
  await p.close();
}
console.log(`titles checked ${checks}, fails ${fails}`);
await b.close(); process.exit(fails ? 1 : 0);
