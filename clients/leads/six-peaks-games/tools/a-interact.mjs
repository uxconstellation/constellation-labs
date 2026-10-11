// Direction A interaction checks: routing + history, filters, form, copy, carousel, menu, reduced motion.
// Usage: node tools/a-interact.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  const t = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.js': 'text/javascript' }[path.extname(f)] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': t }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const URL0 = `http://127.0.0.1:${server.address().port}/direction-a-ascent/index.html`;
const b = await chromium.launch();
const results = [];
const ok = (name, cond, extra = '') => { results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`); };
async function ctxFor(opts) {
  const ctx = await b.newContext(opts);
  await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/gsap/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'node_modules/gsap/dist', path.basename(new URL(route.request().url()).pathname))) }));
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  return ctx;
}
const wait = (p, ms) => p.waitForTimeout(ms);
// Desktop
{
  const ctx = await ctxFor({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL0, { waitUntil: 'networkidle' }); await wait(p, 2500);
  ok('home h1', (await p.textContent('h1:visible')).includes('Beyond'));
  await p.click('.topnav a[href="#logbook"]'); await wait(p, 1600);
  ok('nav Games -> logbook route', (await p.evaluate(() => location.hash)) === '#logbook' && (await p.textContent('[data-view="page"] h1')).includes('logbook'), await p.title());
  ok('aria-current on Games', (await p.getAttribute('.topnav a[href="#logbook"]', 'aria-current')) === 'page');
  await p.click('.filter[data-filter="certification"]'); await wait(p, 400);
  const vis = await p.$$eval('.lbk-row', (rs) => rs.filter((r) => !r.hidden).map((r) => r.querySelector('h3').textContent));
  ok('filter certification', vis.length > 0 && vis.length < 17, vis.join(', '));
  await p.click('.filter[data-filter="all"]'); await wait(p, 300);
  await p.click('.lbk-row h3 a[href="#log-suzerain"]'); await wait(p, 1600);
  ok('row -> log page', (await p.evaluate(() => location.hash)) === '#log-suzerain' && (await p.title()).includes('Suzerain'), await p.title());
  ok('log page focus on h1', await p.evaluate(() => document.activeElement && document.activeElement.tagName === 'H1'));
  ok('scrolled to top on route change', (await p.evaluate(() => scrollY)) < 5);
  await p.goBack(); await wait(p, 1600);
  ok('back -> logbook', (await p.evaluate(() => location.hash)) === '#logbook' && (await p.isVisible('.filters')));
  await p.goBack(); await wait(p, 1600);
  ok('back -> home', await p.isVisible('#hero-title'));
  await p.goForward(); await wait(p, 1600);
  ok('forward -> logbook', (await p.evaluate(() => location.hash)) === '#logbook');
  await p.goto(URL0 + '#log-witchs-bakery'); await wait(p, 1800);
  const uw = await p.textContent('[data-view="page"]');
  ok('underway log: no art, no focus claims', !(await p.$('[data-view="page"] .log-art')) && uw.includes('Project underway, further details on release.') && !uw.includes('Key testing focus'));
  await p.click('.trial-band a[href="#basecamp"]'); await wait(p, 2200);
  const bcTop = await p.evaluate(() => document.getElementById('basecamp').getBoundingClientRect().top);
  ok('trial band -> home base camp', Math.abs(bcTop) < 40, 'top=' + Math.round(bcTop));
  await p.fill('#f-name', 'Ada'); await p.fill('#f-surname', 'Lovelace'); await p.fill('#f-email', 'ada@example.com');
  await p.click('#trial-form button[type="submit"]'); await wait(p, 300);
  const note = await p.isVisible('#form-note');
  ok('form submit shows preview note', note && (await p.textContent('#form-note')).includes('nothing leaves this page'));
  await p.click('.copy[data-copy="#c-email"]'); await wait(p, 300);
  const lbl = await p.textContent('.copy[data-copy="#c-email"]');
  ok('copy button responds', /Copied|Selected/.test(lbl), lbl.trim());
  await p.evaluate(() => document.getElementById('reports').scrollIntoView()); await wait(p, 600);
  await p.click('.rep-next'); await wait(p, 900);
  ok('reports next', (await p.textContent('.rep-count')).replace(/\s+/g,' ').trim() === '2 / 9');
  await p.click('.rep-prev'); await p.click('.rep-prev'); await wait(p, 900);
  ok('reports prev wraps', (await p.textContent('.rep-count')).replace(/\s+/g,' ').trim() === '9 / 9');
  const railTicks = await p.$$eval('.rail-tick', (t) => t.length);
  ok('rail ticks on home', railTicks === 8, String(railTicks));
  await p.click('.rail-tick[data-i="1"]'); await wait(p, 2200);
  ok('rail tick jumps to route', await p.evaluate(() => { const r = document.getElementById('route').getBoundingClientRect(); return r.top < 60 && r.bottom > 0; }));
  ok('desktop: no page errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}
// Mobile menu + keyboard
{
  const ctx = await ctxFor({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(URL0, { waitUntil: 'networkidle' }); await wait(p, 2200);
  await p.click('.menu-btn'); await wait(p, 900);
  ok('menu opens', await p.isVisible('#menu'));
  ok('menu focus inside', await p.evaluate(() => document.getElementById('menu').contains(document.activeElement)));
  await p.keyboard.press('Escape'); await wait(p, 300);
  ok('Esc closes menu + focus returns', !(await p.isVisible('#menu')) && (await p.evaluate(() => document.activeElement.classList.contains('menu-btn'))));
  await p.click('.menu-btn'); await wait(p, 700); await p.click('#menu a[href="#team"]'); await wait(p, 2000);
  const tTop = await p.evaluate(() => document.getElementById('team').getBoundingClientRect().top);
  ok('menu link scrolls to team', Math.abs(tTop) < 60 && !(await p.isVisible('#menu')), 'top=' + Math.round(tTop));
  ok('marquee runs on mobile', await p.evaluate(() => document.querySelector('.mq').classList.contains('is-running')));
  ok('mobile: no page errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}
// Reduced motion: everything static and visible
{
  const ctx = await ctxFor({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(URL0, { waitUntil: 'networkidle' }); await wait(p, 1500);
  const st = await p.evaluate(() => ({
    intro: document.documentElement.classList.contains('intro'),
    pinned: !!document.querySelector('.is-pinned'),
    pillarsVisible: [...document.querySelectorAll('.pillar')].every((x) => getComputedStyle(x).visibility === 'visible' && getComputedStyle(x).opacity === '1'),
    cardsVisible: [...document.querySelectorAll('.wp')].every((x) => getComputedStyle(x).visibility === 'visible' && getComputedStyle(x).opacity === '1'),
    marquee: document.querySelector('.mq').classList.contains('is-running'),
    quoteBtn: document.querySelector('.hq-toggle').textContent,
    flag: getComputedStyle(document.querySelector('.hero .flag')).visibility,
  }));
  ok('reduced: no intro hiding', !st.intro && st.flag === 'visible');
  ok('reduced: no pins', !st.pinned);
  ok('reduced: all pillars + camps visible', st.pillarsVisible && st.cardsVisible);
  ok('reduced: marquee static, quotes paused', !st.marquee && /Play/.test(st.quoteBtn));
  ok('reduced: no page errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}
// No JS: home content complete at rest
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(URL0, { waitUntil: 'networkidle' }); await wait(p, 800);
  const st = await p.evaluate(() => ({
    h1: getComputedStyle(document.querySelector('.hero-title .line > span')).visibility,
    reports: [...document.querySelectorAll('.report')].filter((x) => getComputedStyle(x).visibility === 'visible').length,
    chapters: document.querySelectorAll('.chapter img').length,
    pillars: [...document.querySelectorAll('.pillar')].filter((x) => getComputedStyle(x).visibility === 'visible').length,
  }));
  ok('no-JS: hero, 9 reports, 5 chapters, 6 pillars visible', st.h1 === 'visible' && st.reports === 9 && st.chapters >= 5 && st.pillars === 6, JSON.stringify(st));
  await ctx.close();
}
await b.close(); server.close();
console.log(results.join('\n'));
console.log(results.filter((r) => r.startsWith('FAIL')).length + ' failing of ' + results.length);
