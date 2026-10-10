// A2 proof capture: representative frames into direction-a-bug-hunt/proof/ and a <= 20 s webm of a run.
// Usage: node tools/a2-proof.mjs [--only frames|video]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { wrapPage, serve, routeCdn } from './a2-serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'direction-a-bug-hunt', 'proof');
fs.mkdirSync(OUT, { recursive: true });
const only = (() => { const i = process.argv.indexOf('--only'); return i > -1 ? process.argv[i + 1] : ''; })();
wrapPage(ROOT);
const { server, base } = await serve(ROOT);
const browser = await chromium.launch();
const log = [];
const shot = async (page, name, clip) => { const f = path.join(OUT, name); await page.screenshot({ path: f, type: 'jpeg', quality: 86, ...(clip ? { clip } : {}) }); log.push(name); };

async function ctxFor(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...opts });
  await routeCdn(ctx, ROOT);
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
  return { ctx, page };
}
const listGo = (page, id) => page.evaluate((id_) => { const b = document.querySelector(`#index .idx-btn[data-obj="${id_}"]`); b.click(); }, id);
const esc = async (page) => { await page.keyboard.press('Escape'); await page.waitForTimeout(250); };
const closeToasts = (page) => page.evaluate(() => { const p = document.getElementById('pola'); if (!p.hidden) document.getElementById('pola-x').click(); const b = document.getElementById('banner'); if (!b.hidden) document.getElementById('banner-x').click(); });
async function walk(page, ms, key = 'ArrowRight') { await page.focus('#stage'); await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); }

if (!only || only === 'frames') {
  // ---------- desktop
  const { ctx, page } = await ctxFor();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200);
  await shot(page, '01-title-attract.jpg');
  await page.click('#b-start'); await page.waitForTimeout(700);
  await shot(page, '02-rules-bestiary.jpg');
  await page.click('#b-begin'); await page.waitForTimeout(600);
  const peaks = await page.evaluate(() => window.__a2.peaks());
  // the run on three different peaks (tester on the climb, HUD live)
  for (const [i, name] of [[0, '03-run-peak-1.jpg'], [2, '04-run-peak-3.jpg'], [4, '05-run-peak-5.jpg']]) {
    await page.evaluate((x) => window.__a2.warp(x), peaks[i] - 120);
    await walk(page, 900);
    await closeToasts(page);
    await page.waitForTimeout(250);
    await shot(page, name);
    await page.evaluate(() => { document.querySelectorAll('dialog[open]').forEach((d) => d.close()); });
  }
  // a ticket printing (mid-feed) and the glyph burst
  await page.evaluate(() => window.__a2.warp(window.__a2.objects().find((o) => o.id === 'bug-compliance').x - 26));
  await page.waitForTimeout(300); await page.focus('#stage');
  await page.keyboard.press('e'); await page.waitForTimeout(430);
  await shot(page, '06-ticket-printing.jpg');
  await page.waitForTimeout(1300);
  await shot(page, '07-service-card.jpg');
  await esc(page);
  // a billboard card resolving from coarse pixels to the release
  await page.evaluate(() => window.__a2.warp(window.__a2.objects().find((o) => o.id === 'billboard-lost-skies').x - 30));
  await page.waitForTimeout(300); await page.focus('#stage');
  await page.keyboard.press('Enter');
  for (let i = 0; i < 40; i++) { const t = await page.evaluate(() => (document.getElementById('card-res') || {}).textContent || ''); if (/12 px|6 px/.test(t)) break; await page.waitForTimeout(25); }
  await shot(page, '08-card-resolving.jpg');
  await page.waitForTimeout(900);
  await shot(page, '09-card-resolved.jpg');
  await esc(page);
  // a partner dialogue
  await page.evaluate(() => window.__a2.warp(window.__a2.objects().find((o) => o.id === 'partner-aikman').x - 18));
  await page.waitForTimeout(300); await page.focus('#stage');
  await page.keyboard.press('e'); await page.waitForTimeout(2800);
  await shot(page, '10-partner-dialogue.jpg');
  await esc(page);
  // the time-zone power-up (live George and London clocks)
  await page.evaluate(() => window.__a2.warp(window.__a2.objects().find((o) => o.id === 'power-timezone').x - 40));
  await walk(page, 650); await page.waitForTimeout(500);
  await shot(page, '11-powerup-timezone.jpg');
  // the summit: log the last regression, raise the flag, run report
  await page.evaluate(() => { const i = document.getElementById('index'); i.classList.add('is-open'); });
  await listGo(page, 'bug-rc'); await page.waitForTimeout(1500);
  await esc(page); await page.waitForTimeout(2600);
  await shot(page, '12-summit-report.jpg');
  await esc(page);
  // the manual
  await page.goto(base + '#manual', { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
  await shot(page, '13-manual-cover.jpg');
  await page.evaluate(() => document.getElementById('m-services').scrollIntoView()); await page.waitForTimeout(700);
  await shot(page, '14-manual-bestiary.jpg');
  await page.evaluate(() => document.getElementById('m-titles').scrollIntoView()); await page.evaluate(() => window.scrollBy(0, 300)); await page.waitForTimeout(900);
  await shot(page, '15-manual-titles.jpg');
  if (page.errors.length) console.log('desktop errors:', page.errors);
  await ctx.close();

  // ---------- reduced motion: the level map
  {
    const { ctx: c2, page: p2 } = await ctxFor({ reducedMotion: 'reduce' });
    await p2.goto(base + '#play', { waitUntil: 'networkidle' }); await p2.waitForTimeout(900);
    await shot(p2, '16-reduced-motion-map.jpg');
    await c2.close();
  }
  // ---------- mobile
  {
    const { ctx: c3, page: p3 } = await ctxFor({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p3.goto(base, { waitUntil: 'networkidle' }); await p3.waitForTimeout(2600);
    await shot(p3, '17-mobile-title.jpg');
    await p3.goto(base + '#play', { waitUntil: 'networkidle' }); await p3.waitForTimeout(700);
    const btn = p3.locator('[data-key=right]');
    await btn.dispatchEvent('pointerdown', { pointerId: 1 }); await p3.waitForTimeout(1600); await btn.dispatchEvent('pointerup', { pointerId: 1 });
    await closeToasts(p3); await p3.waitForTimeout(300);
    await shot(p3, '18-mobile-run.jpg');
    await c3.close();
  }
}

if (!only || only === 'video') {
  const vdir = path.join(OUT, 'video-tmp');
  fs.rmSync(vdir, { recursive: true, force: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: vdir, size: { width: 1280, height: 720 } } });
  await routeCdn(ctx, ROOT);
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);                          // title, attract mode
  await page.click('#b-start'); await page.waitForTimeout(1200);   // rules + bestiary
  await page.click('#b-begin'); await page.waitForTimeout(300);
  await walk(page, 1500);                                    // base camp, first sign
  await closeToasts(page);
  await page.evaluate(() => window.__a2.warp(window.__a2.objects().find((o) => o.id === 'bug-functional').x - 30));
  await walk(page, 250); await page.keyboard.press('e'); await page.waitForTimeout(1500);   // ticket, fix, burst, card
  await esc(page);
  await page.evaluate(() => window.__a2.warp(window.__a2.objects().find((o) => o.id === 'billboard-god-breakers').x - 70));
  await walk(page, 600); await page.keyboard.press('Enter'); await page.waitForTimeout(1500);  // card resolves
  await esc(page);
  const peaks = await page.evaluate(() => window.__a2.peaks());
  await page.evaluate((x) => window.__a2.warp(x), peaks[2] - 110);
  await page.focus('#stage'); await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 6; i++) { await page.waitForTimeout(250); await page.keyboard.press('Space'); }
  await page.keyboard.up('ArrowRight'); await page.waitForTimeout(800);   // climbing, power-up banner
  await page.evaluate(() => { const i = document.getElementById('index'); i.classList.add('is-open'); });
  await listGo(page, 'bug-rc'); await page.waitForTimeout(1300);
  await esc(page); await page.waitForTimeout(2300);                    // flag rises, run report
  await page.close();
  await ctx.close();
  const f = fs.readdirSync(vdir).find((n) => n.endsWith('.webm'));
  if (f) { fs.renameSync(path.join(vdir, f), path.join(OUT, 'run.webm')); log.push('run.webm'); }
  fs.rmSync(vdir, { recursive: true, force: true });
}

await browser.close();
server.close();
console.log(log.join('\n'));
