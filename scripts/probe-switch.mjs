// The Prism and Nod switches must visibly move their knob and recolour their track when toggled.
import { createRequire } from "node:module";
const require = createRequire("C:/Dev/_refs/design-library/.tools/package.json");
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:5191"; const out = process.argv[3];
const b = await chromium.launch();
let fails = 0;
for (const [slug, name] of [["prism", /Prism/], ["nod", /Open to chat|Working quietly/]]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`${base}/${slug}`, { waitUntil: "networkidle" });
  const sw = p.locator("#try").getByRole("switch", { name });
  await sw.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  const read = () => sw.evaluate((el) => { const knob = el.querySelector("[data-knob]"); const track = knob.parentElement; return { checked: el.getAttribute("aria-checked"), knobX: Math.round(knob.getBoundingClientRect().left - track.getBoundingClientRect().left), knobW: Math.round(knob.getBoundingClientRect().width), track: getComputedStyle(track).backgroundColor, trackW: Math.round(track.getBoundingClientRect().width) }; });
  const a = await read(); if (out) await sw.screenshot({ path: `${out}/${slug}-switch-a.png` });
  await sw.click(); await p.waitForTimeout(900);
  const c = await read(); if (out) await sw.screenshot({ path: `${out}/${slug}-switch-b.png` });
  const inside = (s) => s.knobX >= 0 && s.knobX + s.knobW <= s.trackW;
  const ok = a.checked !== c.checked && Math.abs(a.knobX - c.knobX) >= 15 && a.track !== c.track && inside(a) && inside(c);
  if (!ok) fails++;
  console.log(slug, ok ? "OK" : "FAIL", JSON.stringify(a), "->", JSON.stringify(c));
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
