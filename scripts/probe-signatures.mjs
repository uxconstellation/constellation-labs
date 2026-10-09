// Drives each product page's "Try it" experiment end to end and screenshots the final state.
import { createRequire } from "node:module";
const require = createRequire("C:/Dev/_refs/design-library/.tools/package.json");
const { chromium } = require("playwright");
const out = process.argv[2] || "sig";
const W = Number(process.argv[3] || 1440);
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: W, height: W < 800 ? 844 : 900 } });
const errs = []; p.on("pageerror", (e) => errs.push(e.message));
const results = [];
const go = async (slug) => { await p.goto(`http://localhost:5191/${slug}`, { waitUntil: "networkidle" }); await p.waitForTimeout(1200); await p.locator("#try-title").scrollIntoViewIfNeeded(); await p.waitForTimeout(900); };

await go("pinpoints");
const site = p.locator('[aria-label="Drop a pin on the website"]');
await site.click({ position: { x: 120, y: 120 } });
await p.waitForTimeout(600);
await p.locator('[aria-label="Headline, editable after you drop a pin"]').fill?.("").catch(() => {});
await p.locator('[aria-label="Headline, editable after you drop a pin"]').click();
await p.keyboard.press("Control+A"); await p.keyboard.type("Book a table tonight.");
await p.locator('button[aria-label="Orange"]').click();
await p.getByRole("button", { name: /Send suggestion/ }).click();
await p.waitForTimeout(500);
await p.getByRole("button", { name: "Approve" }).click();
await p.waitForTimeout(600);
results.push(["pinpoints", await p.getByText("The site's code was never touched").isVisible()]);
await p.screenshot({ path: `${out}/pinpoints-${W}.png` });

await go("prism");
await p.getByRole("switch", { name: /Prism/ }).click();
await p.locator('h3[aria-label="Headline"]').click();
await p.keyboard.press("End"); await p.keyboard.type(" Sourdough at sunrise.");
await p.getByRole("button", { name: "Swap image" }).click();
await p.getByRole("button", { name: "Publish" }).click();
await p.waitForTimeout(500);
results.push(["prism", (await p.getByText(/0 lines changed in the code/).isVisible()) && (await p.getByText("Published ✓").isVisible())]);
await p.screenshot({ path: `${out}/prism-${W}.png` });

await go("nod");
await p.locator("li", { hasText: "Sam" }).getByRole("button", { name: "Nod" }).click();
await p.waitForTimeout(2600);
results.push(["nod", await p.getByRole("status").getByText("You and Sam").isVisible()]);
await p.screenshot({ path: `${out}/nod-${W}.png` });

await go("acre");
let acreMid = false;
const box = await p.locator("#try-title").evaluate((e) => e.closest("section").getBoundingClientRect().top + window.scrollY);
for (let i = 1; i <= 12; i++) { await p.evaluate((y) => window.scrollTo(0, y), box + i * 450); await p.waitForTimeout(250); if (i === 6) { await p.waitForTimeout(700); await p.screenshot({ path: `${out}/acre-mid-${W}.png` }); acreMid = await p.evaluate(() => { const e = [...document.querySelectorAll("p")].find((x) => x.textContent === "Scroll to run the deal"); if (!e) return false; const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }); } }
await p.waitForTimeout(800);
results.push(["acre", acreMid && await p.getByText("Keys collected").isVisible()]);
await p.screenshot({ path: `${out}/acre-${W}.png` });

console.log(results.map(([k, v]) => `${k}:${v ? "PASS" : "FAIL"}`).join(" "), errs.length ? "ERRORS " + errs.join(" | ") : "no errors");
await b.close();
process.exit(results.every(([, v]) => v) && !errs.length ? 0 : 1);
