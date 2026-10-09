// Viewport screenshots down each route, letting scroll motion play.
// Usage: node scripts/shots.mjs <baseUrl> <outDir> [route,route] [widths e.g. 1440,390]
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire("C:/Dev/_refs/design-library/.tools/package.json");
const { chromium } = require("playwright");
const [base = "http://localhost:5191", out = "shots", routesArg = "/", widthsArg = "1440,390"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const w of widthsArg.split(",").map(Number)) {
  const h = w < 800 ? 844 : 900;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  for (const r of routesArg.split(",")) {
    await p.goto(base + r, { waitUntil: "networkidle" });
    await p.waitForTimeout(2600);
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    const name = (r === "/" ? "home" : r.slice(1)) + "-" + w;
    let i = 0;
    for (let y = 0; y < total; y += Math.round(h * 0.85)) {
      await p.evaluate((y) => window.scrollTo(0, y), y);
      await p.waitForTimeout(1300);
      await p.screenshot({ path: `${out}/${name}-${String(i++).padStart(2, "0")}.png` });
    }
    const card = await p.$("#bench [data-slug] a");
    if (card && w > 800) {
      await card.scrollIntoViewIfNeeded();
      await p.waitForTimeout(800);
      const bb = await card.boundingBox();
      await p.mouse.move(bb.x + bb.width * 0.7, bb.y + bb.height * 0.3);
      await p.waitForTimeout(2600);
      await p.screenshot({ path: `${out}/${name}-hover.png` });
    }
    console.log(name, "frames", i, "height", total, errs.length ? "ERRORS " + errs.join(" | ") : "no errors");
    errs.length = 0;
  }
  await ctx.close();
}
await b.close();
