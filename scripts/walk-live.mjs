// Walks every route on a deployed URL: root rendered, text present, console clean, images decoded.
import { createRequire } from "node:module";
const require = createRequire("C:/Dev/_refs/design-library/.tools/package.json");
const { chromium } = require("playwright");
const base = process.argv[2]; const shot = process.argv[3];
const routes = ["/", "/acre", "/pinpoints", "/prism", "/nod", "/invest", "/build", "/contact", "/no-such-experiment"];
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
let ok = 0;
for (const r of routes) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on("console", (m) => m.type() === "error" && errs.push(m.text())); p.on("pageerror", (e) => errs.push(e.message));
  const res = await p.goto(base + r, { waitUntil: "networkidle" });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((s) => setTimeout(s, 120)); } });
  await p.waitForTimeout(800);
  const s = await p.evaluate(() => { const imgs = [...document.images]; return { kids: document.getElementById("root").children.length, text: document.body.innerText.length, imgs: imgs.length, decoded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length, h1: document.querySelector("h1")?.getAttribute("aria-label") || document.querySelector("h1")?.textContent }; });
  const pass = res.status() === 200 && s.kids > 0 && s.text > 200 && s.decoded === s.imgs && !errs.length;
  if (pass) ok++;
  console.log(`${pass ? "OK  " : "FAIL"} ${r} status ${res.status()} h1 "${s.h1}" imgs ${s.decoded}/${s.imgs} console errors ${errs.length}${errs.length ? " " + errs[0] : ""}`);
  if (r === "/" && shot) { await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(2500); await p.screenshot({ path: shot }); }
  await p.close();
}
console.log(`routes ${ok}/${routes.length}`);
await b.close(); process.exit(ok === routes.length ? 0 : 1);
