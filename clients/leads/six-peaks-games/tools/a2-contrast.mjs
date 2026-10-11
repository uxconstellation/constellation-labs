// A2 contrast sampler for the nodes axe marks "incomplete" (text over the live canvas, scrims, pseudo-elements,
// overlapping layers). Used by tools/a2-measure.mjs.
// contrast from pixels for the nodes axe cannot decide. Motion is frozen (game loop, GSAP, CSS animations);
// screenshot A hides all text. Then the audited nodes' own text is drawn twice, once in pure black and once in
// pure white (border colours locked; nodes whose glyph boxes overlap go into separate shots). Only real glyph
// pixels flip between the two key shots, so raster noise, same-coloured borders and other layers drop out, and
// even very faint text is found. A at those pixels is the real background under the glyphs (scrims, canvas,
// dither, overlapping layers); the node's real colour (times its opacity) is compared with it, pixel by pixel.
export async function freeze(page, on) {
  await page.evaluate((on_) => {
    if (on_) {
      // hold every requestAnimationFrame callback (confetti, glyph bursts, GSAP's ticker) until release
      window.__a2raf = window.requestAnimationFrame; window.__a2q = [];
      window.requestAnimationFrame = (cb) => { window.__a2q.push(cb); return 0; };
      Object.defineProperty(document, 'hidden', { get: () => true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      if (window.gsap) window.gsap.globalTimeline.pause();
      const st = document.createElement('style'); st.setAttribute('data-a2-freeze', '');
      st.textContent = '*,*::before,*::after{animation-play-state:paused!important;transition:none!important}';
      document.head.appendChild(st);
    } else {
      if (window.__a2raf) { window.requestAnimationFrame = window.__a2raf; const q = window.__a2q || []; window.__a2raf = null; window.__a2q = []; q.forEach((cb) => window.requestAnimationFrame(cb)); }
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
      if (window.gsap) window.gsap.globalTimeline.resume();
      document.querySelectorAll('style[data-a2-freeze]').forEach((n) => n.remove());
    }
  }, on);
}
export async function sampleContrast(page, sels) {
  sels = [...new Set(sels)];
  await freeze(page, true);
  try {
    const info = await page.evaluate((sels_) => sels_.map((sel, idx) => {
      const el = document.querySelector(sel); if (!el) return { sel, skip: 'not found' };
      const cs = getComputedStyle(el);
      if (cs.visibility !== 'visible') return { sel, skip: 'not rendered (visibility)' };
      let op = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
      if (op < 0.05) return { sel, skip: 'not rendered (opacity 0)' };
      const field = el.matches('input,textarea,select');
      if (field && !el.value && 'value' in el && el.tagName !== 'SELECT') { el.dataset.a2Val = '1'; el.value = 'Sample text 0123'; }
      const rects = [];
      const clip = (q) => { const x = Math.max(0, q.left), y = Math.max(0, q.top), x1 = Math.min(innerWidth, q.right), y1 = Math.min(innerHeight, q.bottom); return x1 - x > 1 && y1 - y > 1 ? { x, y, x1, y1 } : null; };
      if (field) { const b = el.getBoundingClientRect(); const q = clip({ left: b.left + 2, top: b.top + 2, right: b.right - 18, bottom: b.bottom - 2 }); if (q) rects.push(q); }
      else for (const t of el.childNodes) {
        if (t.nodeType !== 3 || !t.textContent.trim()) continue;
        const r = document.createRange(); r.selectNodeContents(t);
        for (const q of r.getClientRects()) { const c = clip(q); if (c) rects.push(c); }
      }
      if (!rects.length) return { sel, skip: 'off-screen (or no own text)' };
      const hit = rects.some((q) => { const h = document.elementFromPoint((q.x + q.x1) / 2, (q.y + q.y1) / 2); return h && (h === el || el.contains(h)); });
      const c = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      c.clearRect(0, 0, 1, 1); c.fillStyle = '#000'; c.fillStyle = cs.color; c.fillRect(0, 0, 1, 1);
      const [R, G, B, A] = c.getImageData(0, 0, 1, 1).data;
      el.setAttribute('data-a2-k', String(idx));
      for (const [v, side] of [['--a2-btc', 'Top'], ['--a2-brc', 'Right'], ['--a2-bbc', 'Bottom'], ['--a2-blc', 'Left']]) el.style.setProperty(v, cs[`border${side}Color`]);
      const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight, 10) || 400;
      return { sel, k: idx, rects, hit, color: [R, G, B, (A / 255) * op], need: fs >= 24 || (fs >= 18.66 && fw >= 700) ? 3 : 4.5 };
    }), sels);
    const live = info.filter((n) => !n.skip);
    if (!live.length) return info.map((n) => ({ sel: n.sel, skip: n.skip }));
    const hide = await page.addStyleTag({ content: '*,*::before,*::after,*::placeholder{color:transparent!important;-webkit-text-fill-color:transparent!important;caret-color:transparent!important}' });
    await page.evaluate(() => new Promise((r) => { const raf = window.__a2raf || window.requestAnimationFrame; raf(() => raf(r)); }));
    const a = (await page.screenshot({ type: 'png' })).toString('base64');
    // nodes whose glyph boxes overlap are shown in separate screenshots, so every glyph pixel has one owner
    const touch = (r1, r2) => r1.some((p_) => r2.some((q) => p_.x < q.x1 + 2 && q.x < p_.x1 + 2 && p_.y < q.y1 + 2 && q.y < p_.y1 + 2));
    const groups = [];
    for (const n of live) { let g = groups.find((G) => G.every((m) => !touch(m.rects, n.rects))); if (!g) { g = []; groups.push(g); } g.push(n); n.group = groups.indexOf(g); }
    const bs = [];
    for (const g of groups) {
      const pair = [];
      for (const key of ['#000', '#fff']) {
        const show = await page.addStyleTag({ content: g.map((n) => `[data-a2-k="${n.k}"]`).join(',') + `{color:${key}!important;-webkit-text-fill-color:${key}!important;text-decoration-color:${key}!important;border-top-color:var(--a2-btc)!important;border-right-color:var(--a2-brc)!important;border-bottom-color:var(--a2-bbc)!important;border-left-color:var(--a2-blc)!important}` });
        await page.evaluate(() => new Promise((r) => { const raf = window.__a2raf || window.requestAnimationFrame; raf(() => raf(r)); }));
        pair.push((await page.screenshot({ type: 'png' })).toString('base64'));
        await show.evaluate((n) => n.remove());
      }
      bs.push(pair);
    }
    await hide.evaluate((n) => n.remove());
    if (process.env.A2_DEBUG_DIR) { const fs = await import('node:fs'); fs.writeFileSync(`${process.env.A2_DEBUG_DIR}/a.png`, Buffer.from(a, 'base64')); bs.forEach((pr, gi) => pr.forEach((b_, ki) => fs.writeFileSync(`${process.env.A2_DEBUG_DIR}/k${gi}-${ki}.png`, Buffer.from(b_, 'base64')))); fs.writeFileSync(`${process.env.A2_DEBUG_DIR}/info.json`, JSON.stringify(info, null, 1)); }
    const res = await page.evaluate(async ({ a_, bs_, info_ }) => {
      const load = async (s_) => { const img = new Image(); img.src = 'data:image/png;base64,' + s_; await img.decode(); const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight; const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0); return cx; };
      const A = await load(a_), Bs = []; for (const [k1, k2] of bs_) Bs.push([await load(k1), await load(k2)]);
      const k = A.canvas.width / innerWidth;
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      return info_.map((n) => {
        if (n.skip) return { sel: n.sel, skip: n.skip };
        const [K1, K2] = Bs[n.group];
        const ratios = [];
        let area = 0;
        for (const q of n.rects) {
          const x0 = Math.floor(q.x * k), y0 = Math.floor(q.y * k), w = Math.max(1, Math.floor((q.x1 - q.x) * k)), h = Math.max(1, Math.floor((q.y1 - q.y) * k));
          const da = A.getImageData(x0, y0, w, h).data, d1 = K1.getImageData(x0, y0, w, h).data, d2 = K2.getImageData(x0, y0, w, h).data;
          area += w * h;
          for (let i = 0; i < da.length; i += 4) {
            // a glyph pixel flips between the black and the white key (at least ~40% glyph coverage)
            if (Math.abs(d1[i] - d2[i]) + Math.abs(d1[i + 1] - d2[i + 1]) + Math.abs(d1[i + 2] - d2[i + 2]) < 300) continue;
            const al = n.color[3];
            const l1 = L(n.color[0] * al + da[i] * (1 - al), n.color[1] * al + da[i + 1] * (1 - al), n.color[2] * al + da[i + 2] * (1 - al)), l2 = L(da[i], da[i + 1], da[i + 2]);
            ratios.push((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
          }
        }
        if (ratios.length < 6) return { sel: n.sel, skip: n.hit ? 'no glyphs drawn (check by eye)' : 'covered by another layer' };
        ratios.sort((x, y) => x - y);
        return { sel: n.sel, need: n.need, min: ratios[0], p2: ratios[Math.floor(ratios.length * 0.02)], px: ratios.length, area };
      });
    }, { a_: a, bs_: bs, info_: info.map((n) => { const m = live.find((x) => x.sel === n.sel && x.k === n.k); return m ? { ...n, group: m.group } : n; }) });
    return res;
  } finally {
    await page.evaluate(() => {
      document.querySelectorAll('[data-a2-k]').forEach((el) => { el.removeAttribute('data-a2-k'); for (const v of ['--a2-btc', '--a2-brc', '--a2-bbc', '--a2-blc']) el.style.removeProperty(v); });
      document.querySelectorAll('[data-a2-val]').forEach((el) => { el.value = ''; delete el.dataset.a2Val; });
    });
    await freeze(page, false);
  }
}

