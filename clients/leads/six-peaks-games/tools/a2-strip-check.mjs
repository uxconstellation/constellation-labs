// A2 strip check: the publish copy removes everything between /* QA-HOOK:START */ and /* QA-HOOK:END */.
// This builds that stripped copy in direction-a-bug-hunt/.qa-stripped/, runs the official harness on it
// (4 routes, --steps 10), then drives a short keyboard run with no test hook (start, walk, log a bug, list,
// report path, reduced-motion map) and counts console errors. The stripped folder is removed afterwards.
// Usage: node tools/a2-strip-check.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { serve, routeCdn } from './a2-serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'direction-a-bug-hunt', 'page.html');
const REL = 'direction-a-bug-hunt/.qa-stripped';
const DIR = path.join(ROOT, REL);
const src = fs.readFileSync(SRC, 'utf8');
const a = src.indexOf('/* QA-HOOK:START */'), b = src.indexOf('/* QA-HOOK:END */');
if (a < 0 || b < a || src.indexOf('/* QA-HOOK:START */', a + 1) > -1) { console.error('QA-HOOK markers missing or repeated'); process.exit(2); }
const stripped = src.slice(0, a) + src.slice(b + '/* QA-HOOK:END */'.length);
if (stripped.includes('__a2')) { console.error('stripped copy still mentions __a2'); process.exit(2); }
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, 'page.html'), stripped);
fs.symlinkSync('../assets', path.join(DIR, 'assets'));
const out = { removedBytes: src.length - stripped.length };
try {
  // 1. the official harness on the stripped copy
  const log = execFileSync('node', ['qa/shoot.mjs', REL, 'home,play,manual,log-lost-skies', '--steps', '10'], { cwd: ROOT, encoding: 'utf8', timeout: 540000 });
  out.harness = log.trim().split('\n').filter((l) => / shots, /.test(l));
  // 2. a hook-free keyboard run
  const { server, base } = await serve(ROOT);
  const browser = await chromium.launch();
  const errors = [];
  const run = async (opts, fn) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
    await routeCdn(ctx, ROOT);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await fn(page);
    await ctx.close();
  };
  const url = base.replace(/direction-a-bug-hunt\/index\.html$/, REL + '/index.html');
  const steps = [];
  await run({}, async (page) => {
    await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
    steps.push(['hook absent', await page.evaluate(() => typeof window.__a2 === 'undefined')]);
    await page.focus('#b-start'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    await page.focus('#b-begin'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    steps.push(['run started (HUD shown)', await page.evaluate(() => !document.getElementById('hud').hidden && location.hash === '#play')]);
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(2500); await page.keyboard.up('ArrowRight');
    await page.keyboard.press('l'); await page.waitForTimeout(400);
    await page.focus('#index .idx-btn[data-obj="bug-functional"]'); await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
    steps.push(['bug logged from the list (ticket + service card)', await page.evaluate(() => document.querySelectorAll('#tickets .ticket').length === 1 && !!document.querySelector('#dlg-service[open]'))]);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    await page.keyboard.press('l'); await page.waitForTimeout(400);
    await page.focus('#index .idx-btn[data-obj="bug-rc"]'); await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
    await page.keyboard.press('Escape');
    const rep = await page.waitForFunction(() => !!document.querySelector('#dlg-report[open]'), null, { timeout: 10000 }).then(() => true, () => false);
    steps.push(['summit bug -> flag -> run report', rep]);
  });
  await run({ reducedMotion: 'reduce' }, async (page) => {
    await page.goto(url + '#play', { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
    steps.push(['reduced motion: 48 map pins', await page.evaluate(() => document.querySelectorAll('#map .pin').length === 48)]);
  });
  await browser.close(); server.close();
  out.steps = steps.map(([n, v]) => `${v ? 'PASS' : 'FAIL'} ${n}`);
  out.consoleErrors = errors.length; if (errors.length) out.errors = errors.slice(0, 5);
} finally {
  fs.rmSync(DIR, { recursive: true, force: true });
  fs.rmSync(path.join(ROOT, 'qa', 'shots', REL), { recursive: true, force: true });
}
console.log(JSON.stringify(out, null, 2));
process.exit(out.consoleErrors || out.steps.some((s) => s.startsWith('FAIL')) || out.harness.some((l) => !/errors 0, failed 0, axe violations 0/.test(l) || /overflow true/.test(l)) ? 1 : 0);
