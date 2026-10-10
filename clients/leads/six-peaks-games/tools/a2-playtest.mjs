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
let printed = false;
process.on('exit', () => { if (!printed) console.log('--- results before the crash ---\n' + results.join('\n')); });
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
  ok('rules heading takes focus at once (no hidden entrance)', (await active(page)) === 'rules-h', await active(page));
  await page.focus('#b-begin');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  let s = await A(page);
  ok('Begin starts the run', s.mode === 'run', 'mode ' + s.mode);
  ok('route is #play', await page.evaluate(() => location.hash) === '#play');
  ok('stage has focus', (await active(page)) === 'stage');
  ok('HUD starts at BUGS 0/8 · MET 0/9 · PEAK 1/6', /BUGS 0\/8 · MET 0\/9 · PEAK 1\/6/.test(await hudText(page)), await hudText(page));
  ok('aria-live announces the start', /Run started at base camp/.test(await live(page)));
  ok('HUD live region is polite and atomic', await page.evaluate(() => { const l = document.getElementById('hud-live'); return l.getAttribute('aria-live') === 'polite' && l.getAttribute('aria-atomic') === 'true'; }));

  // billboard first: open and close a title card, focus returns
  ok('walk to the It’s Only Money billboard', await walkTo(page, 'billboard-its-only-money'));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1300);
  ok('Enter opens the title card', (await A(page)).dialog === 'dlg-card');
  ok('focus moves inside the open card', await page.evaluate(() => document.getElementById('dlg-card').contains(document.activeElement)), await active(page));
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

  // partner 2
  ok('walk to the second partner sign', await walkTo(page, 'partner-scott'));
  await page.keyboard.press('e');
  await page.waitForTimeout(400);
  ok('HUD MET 2/9', /MET 2\/9/.test(await hudText(page)));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // bug 1
  ok('walk to bug 1 (Clipper)', await walkTo(page, 'bug-functional'));
  await page.keyboard.press('e');
  await page.waitForTimeout(400);
  ok('ticket printed', await page.evaluate(() => document.querySelectorAll('#tickets .ticket').length) === 1);
  ok('ticket text', await page.evaluate(() => /BUG #SP-0001 · DEMO/.test(((document.querySelector('#tickets .ticket') || {}).textContent || '').toUpperCase())));
  ok('HUD BUGS 1/8', /BUGS 1\/8/.test(await hudText(page)), await hudText(page));
  ok('aria-live: bug logged', /Bug SP-0001 logged: Clipper, Functional QA/.test(await live(page)), await live(page));
  ok('canvas is role=img with the live run summary (debounced)', await page.waitForFunction(() => { const c = document.getElementById('cv'); return c.getAttribute('role') === 'img' && /Bugs logged 1 of 8, partners met 2 of 9/.test(c.getAttribute('aria-label') || ''); }, null, { timeout: 2500 }).then(() => true, () => false), await page.evaluate(() => document.getElementById('cv').getAttribute('aria-label').slice(0, 120)));
  await page.waitForTimeout(900);
  ok('service card opens with the verbatim service text', (await A(page)).dialog === 'dlg-service' && await page.evaluate(() => /Testing all functional aspects of your game/.test(document.getElementById('svc-panel').textContent)));
  ok('service card lists real titles', await page.evaluate(() => document.querySelectorAll('#svc-panel .svc-titles li').length) >= 1);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

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
  ok('focus moves into the list', await page.evaluate(() => !!(document.activeElement && document.activeElement.closest('#index'))), await active(page));
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

// ============================================================= QA-REPORT-A2 regressions (one per blocker, plus M1 M2 m1 m4)
const fs_ = await import('node:fs');
const axeSrc = fs_.readFileSync(path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
const phone = (w) => ({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

// B1: on a phone, Begin the run brings the run on screen (touch at 390, keyboard at 320)
for (const [w, how] of [[390, 'touch'], [320, 'keyboard']]) {
  const { ctx, page } = await newPage(phone(w));
  await page.goto(base, { waitUntil: 'networkidle' }); await page.waitForTimeout(700);
  if (how === 'touch') { await page.tap('#b-start'); await page.waitForTimeout(500); await page.locator('#b-begin').scrollIntoViewIfNeeded(); await page.tap('#b-begin'); }
  else { await page.focus('#b-start'); await page.keyboard.press('Enter'); await page.waitForTimeout(500); await page.focus('#b-begin'); await page.keyboard.press('Enter'); }
  await page.waitForTimeout(700);
  const r = await page.evaluate(() => { const h = document.getElementById('hud').getBoundingClientRect(), st = document.getElementById('stage').getBoundingClientRect(); return { mode: window.__a2.mode, y: Math.round(scrollY), hud: Math.round(h.top), stTop: Math.round(st.top), stBot: Math.round(st.bottom), vh: innerHeight }; });
  ok(`B1 ${w}px ${how}: Begin shows the HUD and the whole stage`, r.mode === 'run' && r.hud >= -1 && r.stTop >= 0 && r.stBot <= r.vh, JSON.stringify(r));
  await ctx.close();
}

// B2: reduced-motion map pins never overlap (2D, across rows), every target is at least 24x24, axe target-size clean
for (const w of [320, 360, 390]) {
  const { ctx, page } = await newPage({ ...phone(w), reducedMotion: 'reduce' });
  await page.goto(base + '#play', { waitUntil: 'networkidle' }); await page.waitForTimeout(900);
  const m = await page.evaluate(() => {
    const rs = [...document.querySelectorAll('#map .pin')].map((b) => { const r = b.getBoundingClientRect(); return { id: b.dataset.obj, l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY, w: r.width, h: r.height }; });
    let over = 0, small = 0; const pairs = [];
    for (let i = 0; i < rs.length; i++) { if (rs[i].w < 24 || rs[i].h < 24) small++; for (let j = i + 1; j < rs.length; j++) { const a = rs[i], b = rs[j]; if (a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b) { over++; pairs.push(a.id + '|' + b.id); } } }
    // centre hit-test: each pin's centre must land on that pin
    let covered = 0; for (const b of document.querySelectorAll('#map .pin')) { b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (!h || !b.contains(h)) covered++; }
    return { pins: rs.length, over, small, covered, pairs: pairs.slice(0, 4) };
  });
  await page.evaluate(axeSrc);
  const ax = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'rule', values: ['target-size'] } })).violations.length);
  ok(`B2 ${w}px: ${m.pins} map pins, 0 overlapping pairs, 0 under 24x24, 0 centres covered, axe target-size 0`, m.pins === 48 && m.over === 0 && m.small === 0 && m.covered === 0 && ax === 0, JSON.stringify({ ...m, axe: ax }));
  await ctx.close();
}

// B3: the HUD plate never clips, at 320/360/390, at the start and in the Launch zone
for (const w of [320, 360, 390]) {
  const { ctx, page } = await newPage(phone(w));
  await page.goto(base + '#play', { waitUntil: 'networkidle' }); await page.waitForTimeout(700);
  const fit = () => page.evaluate(() => { const p = document.getElementById('hud-plate'), pr = p.getBoundingClientRect(); const kids = [...p.children].filter((c) => !c.hidden && getComputedStyle(c).display !== 'none'); const out = kids.filter((c) => { const r = c.getBoundingClientRect(); return r.left < pr.left - 0.5 || r.right > pr.right + 0.5 || r.top < pr.top - 0.5 || r.bottom > pr.bottom + 0.5; }).map((c) => c.id || c.className); return { sw: p.scrollWidth, cw: p.clientWidth, out, launch: !document.getElementById('hc-launch').hidden }; });
  const a = await fit();
  await page.evaluate(() => window.__a2.warp(window.__a2.objects().find((o) => o.id === 'bug-rc').x - 10)); await page.waitForTimeout(600);
  const b = await fit();
  ok(`B3 ${w}px: HUD plate holds all its items, at the start and with LAUNCH showing`, a.sw <= a.cw && !a.out.length && b.launch && b.sw <= b.cw && !b.out.length, JSON.stringify({ a, b }));
  await ctx.close();
}

// B4: the mobile "Tested on" strip names every platform in the accessibility tree
{
  const { ctx, page } = await newPage(phone(390));
  await page.goto(base, { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
  const snap = await page.locator('.t-tested .plat-row').ariaSnapshot();
  const names = ['Xbox', 'PlayStation', 'Nintendo', 'Epic', 'Steam', 'Windows', 'Meta', 'Apple', 'Android'];
  const found = names.filter((n) => snap.includes(n)).length;
  ok(`B4 390px: "Tested on" exposes ${found}/9 platform names`, found === 9, snap.replace(/\s+/g, ' ').slice(0, 160));
  await ctx.close();
}

// B5: keys are not captured while focus is on <body> in the manual
{
  const { ctx, page } = await newPage();
  await page.goto(base + '#play', { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector('#manual p').scrollIntoView({ block: 'center' })); await page.waitForTimeout(300);
  await page.click('#manual p', { position: { x: 4, y: 4 } }); await page.waitForTimeout(200);
  const st0 = await page.evaluate(() => ({ y: scrollY, a: document.activeElement.tagName }));
  await page.keyboard.press('Space'); await page.waitForTimeout(400);
  const y1 = await page.evaluate(() => scrollY);
  await page.keyboard.press('ArrowUp'); await page.waitForTimeout(400);
  const y2 = await page.evaluate(() => scrollY);
  await page.keyboard.press('l'); await page.waitForTimeout(400);
  const r = await page.evaluate(() => ({ y: scrollY, list: document.getElementById('index').classList.contains('is-open'), x: window.__a2.player.x }));
  ok('B5 body focus in the manual: Space and ArrowUp scroll, L opens nothing, the tester does not move', st0.a === 'BODY' && y1 > st0.y && y2 < y1 && !r.list && Math.abs(r.y - y2) < 2, JSON.stringify({ st0, y1, y2, r }));
  // and with the stage in view, body focus still plays (click the level, then keys move the tester)
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
  await page.mouse.click(700, 500); await page.evaluate(() => document.activeElement.blur()); await page.waitForTimeout(100);
  const x0 = await page.evaluate(() => window.__a2.player.x);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(500); await page.keyboard.up('ArrowRight');
  const x1 = await page.evaluate(() => window.__a2.player.x);
  ok('B5 body focus with the level in view still runs the tester', x1 > x0 + 10, `${x0} -> ${x1}`);
  await ctx.close();
}

// B6: every demo bug (the Stutter zone included) keeps 34+ world px from title and partner art
{
  const { ctx, page } = await newPage();
  await page.goto(base + '#play', { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
  const g = await page.evaluate(() => {
    const objs = window.__a2.objects(); const art = objs.filter((o) => ['billboard', 'boarded', 'partner'].includes(o.kind)).map((o) => window.__a2.rect(o.id));
    return objs.filter((o) => o.kind === 'bug').map((o) => { const r = window.__a2.rect(o.id); let l = r.x, rr = r.x + r.w; if (o.zone) { l = Math.min(l, o.x + o.zone[0]); rr = Math.max(rr, o.x + o.zone[1]); } let min = 1e9; for (const a of art) min = Math.min(min, Math.max(a.x - rr, l - (a.x + a.w))); return { id: o.id, gap: Math.round(min) }; });
  });
  const okN = g.filter((x) => x.gap >= 34).length;
  ok(`B6 demo bugs 34+ px clear of title/partner art: ${okN}/${g.length}`, okN === g.length && g.length === 8, g.map((x) => `${x.id.replace('bug-', '')} ${x.gap}`).join(', '));
  await ctx.close();
}

// M1, M2, m1, m4: every object's dialog at 320 and 390 (through the list): headings at most 3 lines, Close clear of
// kicker and headings, report stamp clear of the figures, the typed quote hidden from assistive tech
for (const w of [320, 390]) {
  const { ctx, page } = await newPage(phone(w));
  await page.goto(base + '#play', { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
  const ids = await page.evaluate(() => window.__a2.objects().filter((o) => !['campsign', 'power', 'flag'].includes(o.kind) && o.id !== 'bug-rc').map((o) => o.id));
  let dialogs = 0, heads = 0, over3 = [], crowd = [], typed = 0, typedOk = 0;
  for (const id of ids) {
    await page.evaluate((id_) => { document.getElementById('index').classList.add('is-open'); document.querySelector(`#index .idx-btn[data-obj="${id_}"]`).click(); }, id);
    await page.waitForTimeout(id.startsWith('bug-') ? 1300 : 450);
    const m = await page.evaluate(() => {
      const dl = document.querySelector('dialog[open]'); if (!dl) return null;
      const x = dl.querySelector('.dlg-x'); const xr = x && x.getBoundingClientRect();
      const hs = [...dl.querySelectorAll('h2,h3,.dlg-k')].filter((h) => h.offsetParent).map((h) => { const r = h.getBoundingClientRect(); const cs = getComputedStyle(h); const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2; const isH = /^H/.test(h.tagName); return { t: h.textContent.trim().slice(0, 40), isH, lines: isH ? Math.round(r.height / lh) : 0, hitX: !!xr && r.left < xr.right && xr.left < r.right && r.top < xr.bottom && xr.top < r.bottom }; });
      const tw = dl.querySelector('.say-tw');
      return { id: dl.id, hs, tw: tw ? !!tw.closest('[aria-hidden="true"]') && !!dl.querySelector('.say-q .sr-only') : null };
    });
    if (m) { dialogs++; for (const h of m.hs) { if (h.isH) { heads++; if (h.lines > 3) over3.push(`${id} "${h.t}" ${h.lines}`); } if (h.hitX) crowd.push(`${id} "${h.t}"`); } if (m.tw !== null) { typed++; if (m.tw) typedOk++; } }
    await page.keyboard.press('Escape'); await page.waitForTimeout(250);
  }
  ok(`M2 ${w}px: dialog headings at most 3 lines (${heads - over3.length}/${heads} in ${dialogs} dialogs)`, dialogs >= 40 && !over3.length, over3.join('; '));
  ok(`m1 ${w}px: Close clear of every kicker and heading (${dialogs} dialogs)`, !crowd.length, crowd.slice(0, 5).join('; '));
  ok(`m4 ${w}px: typed quote aria-hidden with a full sr-only copy (${typedOk}/${typed})`, typed === 9 && typedOk === 9);
  // M1: the run report stamp covers no figure or heading
  await page.evaluate(() => { document.getElementById('index').classList.add('is-open'); document.querySelector('#index .idx-btn[data-obj="bug-rc"]').click(); });
  await page.waitForTimeout(1400); await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.__a2.dialog === 'dlg-report', null, { timeout: 10000 }).catch(() => {}); await page.waitForTimeout(1200);
  const st = await page.evaluate(() => { const s_ = document.querySelector('.report-stamp').getBoundingClientRect(); const els = [...document.querySelectorAll('#report-panel .report-rows li, #report-panel .report-rows b, #report-panel h2, #report-panel .dlg-k')]; return els.filter((e) => { const r = e.getBoundingClientRect(); return r.left < s_.right && s_.left < r.right && r.top < s_.bottom && s_.top < r.bottom; }).map((e) => e.textContent.trim().slice(0, 24)); });
  ok(`M1 ${w}px: report stamp covers no figure, row or heading`, !st.length, st.join('; '));
  await ctx.close();
}

// m1 (wide): Close sits clear of the card art at 768 and 1440
for (const w of [768, 1440]) {
  const { ctx, page } = await newPage({ viewport: { width: w, height: 900 } });
  await page.goto(base + '#log-lost-skies', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  const o = await page.evaluate(() => { const x = document.querySelector('#dlg-card .dlg-x').getBoundingClientRect(), a = document.querySelector('#card-art').getBoundingClientRect(); return { gap: Math.round(a.top - x.bottom), hor: a.left < x.right && x.left < a.right }; });
  ok(`m1 ${w}px: Close clear of the card art`, !o.hor || o.gap >= 0, JSON.stringify(o));
  await ctx.close();
}
// m5: on phones the open list leaves the HUD List toggle uncovered, and banners sit above the glyph layer
{
  const { ctx, page } = await newPage(phone(390));
  await page.goto(base + '#play', { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
  await page.tap('#b-list'); await page.waitForTimeout(400);
  const t = await page.evaluate(() => { const b = document.getElementById('b-list').getBoundingClientRect(); const h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); const z = (sel) => +getComputedStyle(document.querySelector(sel)).zIndex; return { open: document.getElementById('index').classList.contains('is-open'), onToggle: !!h && h.closest('#b-list') !== null, fx: z('#fx'), banner: z('#banner'), pola: z('#pola') }; });
  await page.tap('#b-list'); await page.waitForTimeout(300);
  const closed = await page.evaluate(() => !document.getElementById('index').classList.contains('is-open'));
  ok('m5 390px: open list leaves the List toggle reachable (it closes the list); banner and polaroid above the glyph layer', t.open && t.onToggle && closed && t.banner > t.fx && t.pola > t.fx, JSON.stringify({ ...t, closed }));
  await ctx.close();
}

await browser.close();
server.close();
printed = true;
console.log(results.join('\n'));
console.log(`\n${results.length - failures}/${results.length} checks passed`);
process.exit(failures ? 1 : 0);
