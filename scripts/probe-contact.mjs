// Funnel check: arrive on / with UTM tags, walk to /prism, press "Book a Prism demo", submit the form.
// Asserts the CTA stays on Labs, the intent is preselected, the payload carries the path, and the page confirms.
import { createRequire } from "node:module";
const require = createRequire("C:/Dev/_refs/design-library/.tools/package.json");
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:8799";
const email = process.argv[3] || "funnel-test@example.com";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
let body = null, reply = null;
p.on("request", (r) => r.url().endsWith("/api/contact") && (body = JSON.parse(r.postData())));
p.on("response", async (r) => r.url().endsWith("/api/contact") && (reply = await r.json().catch(() => null)));
await p.goto(base + "/?utm_source=probe&utm_campaign=funnel-check", { waitUntil: "networkidle" });
await p.getByRole("navigation", { name: "On the bench" }).getByRole("link", { name: /Prism/ }).click();
await p.waitForURL("**/prism"); await p.waitForTimeout(800);
await p.locator(".pp-hero").getByRole("link", { name: /Book a Prism demo/ }).click();
await p.waitForURL("**/contact?intent=prism"); await p.waitForTimeout(800);
const onLabs = new URL(p.url()).origin === new URL(base).origin;
const pressed = await p.getByRole("button", { name: "Book a Prism demo", pressed: true }).count();
await p.getByLabel("Your name").fill("Funnel Test");
await p.getByLabel(/^Email/).fill(email);
await p.getByLabel("Company").fill("Probe Co");
await p.getByLabel("Message").fill("Automated funnel check from the Labs build. Please ignore.");
await p.getByRole("button", { name: /Send to Aldo/ }).click();
await p.waitForTimeout(2500);
const confirmed = await p.getByRole("status").getByText("It's with Aldo").isVisible().catch(() => false);
const checks = {
  stays_on_labs: onLabs,
  intent_preselected: pressed === 1 && body?.intent === "prism",
  from_page: body?.from === "/prism",
  landing: body?.landing === "/",
  utm: /utm_source=probe/.test(body?.utm ?? ""),
  path: body?.pages === "/ > /prism > /contact",
  delivered: reply?.delivered === true,
  confirmed,
};
console.log(JSON.stringify(checks), "reply", JSON.stringify(reply));
await b.close();
process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
