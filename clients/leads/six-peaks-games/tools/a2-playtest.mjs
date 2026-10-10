// A2 play-test: drives a real run with keyboard events and asserts the HUD, the aria-live text,
// focus return, the summit report, the form, and the reduced-motion level map.
// Usage: node tools/a2-playtest.mjs [--headed]
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { wrapPage, serve, routeCdn } from './a2-serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
wrapPage(ROOT);
const { server, base } = await serve(ROOT);
const browser = await chromium.launch({ headless: !process.argv.includes('--headed') });
const results = [];
let failures = 0;
const ok = (name, cond, detail = '') => { results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`); if (!cond) failures++; };

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...opts });
  await routeCdn(ctx, ROOT);
  const page = await ctx.newPage();
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
  page.on('pageerror', (e) => page.errors.push(e.message));
  return { ctx, page };
}
const A = (page) => page.evaluate(() => ({ mode: window.__a2.mode, run: window.__a2.run, near: window.__a2.near, dialog: window.__a2.dialog, player: window.__a2.player }));
const hudText = (page) => page.evaluate(() => document.getElementById('hud-plate').innerText.replace(/\s+/g, ' ').trim());
const live = (page) => page.evaluate(() => document.getElementById('hud-live').textContent);
const active = (page) => page.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.className || a.tagName) : ''; });
// walk right until the tester is near an object id; tap jump when a ledge blocks the way
async function walkTo(page, id, dir = 'ArrowRight', ms = 30000) {
  const t0 = Date.now();
  let lastX = -1, still = 0;
  await page.keyboard.down(dir);
  try {
    while (Date.now() - t0 < ms) {
      const s = await A(page);
      if (s.near === id) break;
      if (s.dialog) { await page.keyboard.up(dir); await page.keyboard.press('Escape'); await page.waitForTimeout(250); await page.keyboard.down(dir); }
      const toast = await page.evaluate(() => !document.getElementById('pola').hidden);
      if (toast) { await page.evaluate(() => document.getElementById('pola-x').click()); await page.focus('#stage'); }
      if (Math.abs(s.player.x - lastX) < 0.5) { if (++still > 2) { await page.keyboard.down('Space'); await page.waitForTimeout(260); await page.keyboard.up('Space'); still = 0; } } else still = 0;
      lastX = s.player.x;
      await page.waitForTimeout(90);
    }
  } finally { await page.keyboard.up(dir); }
  await page.waitForTimeout(150);
  return (await A(page)).near === id;
}

// ------------------------------------------------------------- the run
{
  const { ctx, page } = await newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  ok('title screen shows the H1', await page.evaluate(() => document.getElementById('title-h1').innerText.replace(/\s+/g, ' ').trim()) === 'Beyond standard QA.');
  ok('attract mode is running behind the title', (await A(page)).mode === 'title' && await page.evaluate(() => window.__a2.loop));
  // start with the keyboard: Tab to Start, Enter -> rules, Enter on Begin -> run
  await page.focus('#b-start');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  ok('Start opens the rules', await page.evaluate(() => !document.getElementById('rules').hidden));
  await page.focus('#b-begin');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  let s = await A(page);
  ok('Begin starts the run', s.mode === 'run', 'mode ' + s.mode);
  ok('route is #play', await page.evaluate(() => location.hash) === '#play');
  ok('stage has focus', (await active(page)) === 'stage');
  ok('HUD starts at BUGS 0/8 · MET 0/9 · PEAK 1/6', /BUGS 0\/8 · MET 0\/9 · PEAK 1\/6/.test(await hudText(page)), await hudText(page));
  ok('aria-live announces the start', /Run started at base camp/.test(await live(page)));

  // billboard first: open and close a title card, focus returns
  ok('walk to the It’s Only Money billboard', await walkTo(page, 'billboard-its-only-money'));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1300);
  ok('Enter opens the title card', (await A(page)).dialog === 'dlg-card');
  ok('card shows Key Testing Focus verbatim and the partner', await page.evaluate(() => /Open-World Systems & Gameplay Testing/.test(document.getElementById('card-panel').textContent) && /In partnership with Firestoke/.test(document.getElementById('card-panel').textContent.replace(/\s+/g, ' '))));
  ok('key art resolved to the full image', await page.evaluate(() => !!document.querySelector('#card-art img[src$="key.webp"]')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  ok('focus returns to the stage after the card', (await active(page)) === 'stage', await active(page));

  // partner 1 (base camp)
  ok('walk to the first partner sign', await walkTo(page, 'partner-watson'));
  await page.keyboard.press('e');
  await page.waitForTimeout(500);
  ok('E opens the partner dialogue', (await A(page)).dialog === 'dlg-dialogue');
  ok('quote shows name, role and studio', await page.evaluate(() => { const t = document.getElementById('say-panel').textContent; return /Calum Watson/.test(t) && /Technical Production Manager, Firestoke Games/.test(t); }));
  ok('HUD MET 1/9', /MET 1\/9/.test(await hudText(page)));
  ok('aria-live: met', /Met Calum Watson/.test(await live(page)), await live(page));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  ok('Esc closes the dialogue, focus back on the stage', !(await A(page)).dialog && (await active(page)) === 'stage', await active(page));

  // bug 1
  ok('walk to bug 1 (Clipper)', await walkTo(page, 'bug-functional'));
  await page.keyboard.press('e');
  await page.waitForTimeout(400);
  ok('ticket printed', await page.evaluate(() => document.querySelectorAll('#tickets .ticket').length) === 1);
  ok('ticket text', await page.evaluate(() => /BUG #SP-0001 · DEMO/.test(document.querySelector('#tickets .ticket').textContent.toUpperCase())));
  ok('HUD BUGS 1/8', /BUGS 1\/8/.test(await hudText(page)), await hudText(page));
  ok('aria-live: bug logged', /Bug SP-0001 logged: Clipper, Functional QA/.test(await live(page)), await live(page));
  await page.waitForTimeout(900);
  ok('service card opens with the verbatim service text', (await A(page)).dialog === 'dlg-service' && await page.evaluate(() => /Testing all functional aspects of your game/.test(document.getElementById('svc-panel').textContent)));
  ok('service card lists real titles', await page.evaluate(() => document.querySelectorAll('#svc-panel .svc-titles li').length) >= 1);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // partner 2
  ok('walk to the second partner sign', await walkTo(page, 'partner-scott'));
  await page.keyboard.press('e');
  await page.waitForTimeout(400);
  ok('HUD MET 2/9', /MET 2\/9/.test(await hudText(page)));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // over the first ledge and summit to bug 2 (power-up on the way)
  ok('jump the ledge and reach bug 2 (Wrong Glyph)', await walkTo(page, 'bug-compliance'));
  s = await A(page);
  ok('power-up collected at peak 1', s.run.peaks.includes(0), JSON.stringify(s.run.peaks));
  ok('power-up banner shows the pillar text verbatim', await page.evaluate(() => !document.getElementById('banner').hidden && /Technically Excellent/.test(document.getElementById('banner').textContent) && /AAA leadership and ongoing training/.test(document.getElementById('banner').textContent)));
  ok('HUD PEAK 2/6 after the first summit', /PEAK 2\/6/.test(await hudText(page)), await hudText(page));
  await page.keyboard.press('e'); await page.waitForTimeout(1300); await page.keyboard.press('Escape'); await page.waitForTimeout(250);
  ok('HUD BUGS 2/8', /BUGS 2\/8/.test(await hudText(page)));
  ok('walk on over peak 2 to bug 3 (Overflow)', await walkTo(page, 'bug-localisation', 'ArrowRight', 40000));
  await page.keyboard.press('e'); await page.waitForTimeout(1300); await page.keyboard.press('Escape'); await page.waitForTimeout(250);
  ok('HUD BUGS 3/8', /BUGS 3\/8/.test(await hudText(page)), await hudText(page));
  ok('PEAK 3/6 after the second summit', /PEAK 3\/6/.test(await hudText(page)), await hudText(page));

  // warp to the summit through the list, log the last bug, get the report
  await page.focus('#stage');
  await page.keyboard.press('l');
  await page.waitForTimeout(300);
  ok('L opens the list of every object', await page.evaluate(() => document.getElementById('index').classList.contains('is-open') && document.querySelectorAll('#index .idx-btn').length >= 46));
  await page.focus('#index .idx-btn[data-obj="bug-rc"]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1400);
  ok('list button logs the summit bug', (await A(page)).run.bugs.includes('rc'));
  ok('summit service card', (await A(page)).dialog === 'dlg-service');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(2600);
  s = await A(page);
  ok('run report opens at the summit', s.dialog === 'dlg-report', 'dialog ' + s.dialog);
  { const t = await page.evaluate(() => document.getElementById('report-panel').textContent.replace(/\s+/g, ' ')); ok('report shows counts', /Bugs logged ?4\/8/.test(t) && /Partners met ?[2-9]\/9/.test(t) && /Time/.test(t), t.slice(0, 160)); }
  ok('no "Apply now" door below 8/8', await page.evaluate(() => !/good tester/.test(document.getElementById('report-panel').textContent)));
  await page.click('#report-panel [data-act="book"]');
  await page.waitForTimeout(500);
  ok('Book a trial opens the base camp post form', (await A(page)).dialog === 'dlg-post');
  await page.fill('#pf-name', 'Test');
  await page.fill('#pf-email', 'test@example.com');
  await page.click('#pf-form button[type="submit"]');
  await page.waitForTimeout(400);
  ok('form shows the preview confirmation', await page.evaluate(() => !document.getElementById('pf-done').hidden && /does not send anything/.test(document.getElementById('pf-done').innerText)));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  ok('no console errors in the run', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// ------------------------------------------------------------- 8/8 unlocks the careers door
{
  const { ctx, page } = await newPage();
  await page.goto(base + '#play', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const ids = await page.evaluate(() => window.__a2.objects().filter((o) => o.kind === 'bug' && o.id !== 'bug-rc').map((o) => o.id).concat(['bug-rc']));
  for (const id of ids) {
    await page.evaluate(() => { const i = document.getElementById('index'); i.classList.add('is-open'); });
    await page.evaluate((id_) => document.querySelector(`#index .idx-btn[data-obj="${id_}"]`).click(), id);
    await page.waitForTimeout(1200);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(2200);
  ok('8/8 logged through the list', (await A(page)).run.bugs.length === 8);
  ok('8/8 report offers "You’d make a good tester. Apply now."', await page.evaluate(() => /good tester\. Apply now\./.test(document.getElementById('report-panel').textContent)));
  await ctx.close();
}

// ------------------------------------------------------------- routes
{
  const { ctx, page } = await newPage();
  await page.goto(base + '#log-lost-skies', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  ok('#log-lost-skies opens that title card', (await A(page)).dialog === 'dlg-card' && await page.evaluate(() => /Lost Skies/.test(document.getElementById('card-panel').innerText)));
  await page.goto(base + '#manual', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  ok('#manual shows the manual alone', await page.evaluate(() => getComputedStyle(document.getElementById('game')).display === 'none' && document.getElementById('m-title').getAttribute('aria-level') === '1'));
  ok('no console errors on routes', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// ------------------------------------------------------------- reduced motion: the static level map
{
  const { ctx, page } = await newPage({ reducedMotion: 'reduce' });
  await page.goto(base + '#play', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => ({ mode: window.__a2.mode, mapVisible: !document.getElementById('map').hidden, pins: document.querySelectorAll('#map .pin').length, objects: window.__a2.objects().filter((o) => o.kind !== 'campsign').length, loop: window.__a2.loop }));
  ok('reduced motion shows the level map', m.mode === 'map' && m.mapVisible, JSON.stringify(m));
  ok('every object is a pin button on the map', m.pins === m.objects && m.pins >= 47, `${m.pins} pins / ${m.objects} objects`);
  ok('no animation loop under reduced motion', m.loop === false);
  await page.click('#map .pin[data-obj="billboard-lost-skies"]');
  await page.waitForTimeout(500);
  ok('a map pin opens the same card', (await A(page)).dialog === 'dlg-card');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok('focus returns to the pin', await page.evaluate(() => document.activeElement && document.activeElement.dataset.obj === 'billboard-lost-skies'));
  ok('no console errors (reduced motion)', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

await browser.close();
server.close();
console.log(results.join('\n'));
console.log(`\n${results.length - failures}/${results.length} checks passed`);
process.exit(failures ? 1 : 0);
