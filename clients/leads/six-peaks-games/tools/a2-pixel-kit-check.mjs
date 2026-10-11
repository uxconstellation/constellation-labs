#!/usr/bin/env node
// Contract check for the Direction A2 pixel kit (assets/web/pixel/). Exits 1 if anything the
// builder codes against is missing or the wrong size. Run: node tools/a2-pixel-kit-check.mjs
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.env.PIXEL_KIT_DIR || join(root, 'assets/web/pixel');
const fails = [];
const need = (ok, msg) => { if (!ok) fails.push(msg); };

function png(p) {
  if (!existsSync(p)) return null;
  const b = readFileSync(p);
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return { bad: true };
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
const range = (n) => Array.from({ length: n }, (_, i) => i);

// --- frames named in the contract, with their required sizes ([w, h], or null = any size)
const want = {};
for (const i of range(2)) want[`tester_idle_${i}`] = [16, 24];
for (const i of range(6)) want[`tester_run_${i}`] = [16, 24];
for (const i of range(2)) want[`tester_jump_${i}`] = [16, 24];
for (const i of range(2)) want[`tester_inspect_${i}`] = [16, 24];
const bugs = ['functional', 'compliance', 'localisation', 'reporting', 'testcase', 'usability', 'performance', 'rc'];
for (const b of bugs) for (const i of range(2)) want[`bug_${b}_${i}`] = [16, 16];
for (const p of ['excellent', 'priced', 'english', 'timezone', 'culture', 'team']) want[`power_${p}`] = [16, 16];
Object.assign(want, {
  prop_signpost: [24, 32], prop_billboard: [80, 44], prop_boarded: [48, 32], prop_polaroid: [12, 14],
  prop_flag_0: [16, 24], prop_flag_1: [16, 24], prop_tent: [32, 24],
  prop_tree_0: null, prop_tree_1: null, prop_tree_2: null, prop_rock_0: null, prop_rock_1: null, prop_crate: null,
  reticle_0: [16, 16], reticle_1: [16, 16],
  tile_grass: [8, 8], tile_dirt: [8, 8], tile_rock: [8, 8], tile_snow: [8, 8], tile_checker: [8, 8],
});
const faults = ['clip_ground', 'wrong_glyph_sign', 'overflow_sign', 'stairs_missing', 'tiny_text_sign', 'typo_flag_sign'];
for (const f of faults) { want[`fault_${f}`] = null; want[`fault_${f}_fixed`] = null; }

// --- sprites.json + sprites.png
const sj = existsSync(join(dir, 'sprites.json')) ? JSON.parse(readFileSync(join(dir, 'sprites.json'), 'utf8')) : null;
need(sj, 'sprites.json missing');
const atlas = png(join(dir, 'sprites.png'));
need(atlas && !atlas.bad, 'sprites.png missing or not a PNG');
if (sj) {
  need(sj.frames && typeof sj.frames === 'object', 'sprites.json: no "frames"');
  need(sj.anims && typeof sj.anims === 'object', 'sprites.json: no "anims"');
  for (const [name, size] of Object.entries(want)) {
    const f = sj.frames?.[name];
    if (!f) { fails.push(`frame missing: ${name}`); continue; }
    for (const k of ['x', 'y', 'w', 'h']) need(Number.isInteger(f[k]), `frame ${name}: ${k} is not an integer`);
    if (size) need(f.w === size[0] && f.h === size[1], `frame ${name}: ${f.w}x${f.h}, contract says ${size[0]}x${size[1]}`);
    if (atlas && !atlas.bad) need(f.x >= 0 && f.y >= 0 && f.x + f.w <= atlas.w && f.y + f.h <= atlas.h, `frame ${name} lies outside sprites.png`);
  }
  for (const f of faults) {
    const a = sj.frames?.[`fault_${f}`], b = sj.frames?.[`fault_${f}_fixed`];
    if (a && b) need(a.w === b.w && a.h === b.h, `fault_${f} and its _fixed twin differ in size`);
  }
  const animsWanted = ['tester_idle', 'tester_run', 'tester_jump', 'tester_inspect', 'prop_flag', 'reticle', ...bugs.map((b) => `bug_${b}`)];
  for (const a of animsWanted) {
    const list = sj.anims?.[a];
    if (!Array.isArray(list) || !list.length) { fails.push(`anim missing: ${a}`); continue; }
    for (const n of list) need(sj.frames?.[n], `anim ${a} names a missing frame: ${n}`);
  }
  need((sj.anims?.tester_run || []).length === 6, 'anim tester_run must have 6 frames');
  const bw = sj.billboardWindow;
  need(bw && bw.w === 72 && bw.h === 30, 'billboardWindow must be {x,y,w:72,h:30}');
  if (bw) need(bw.x >= 0 && bw.y >= 0 && bw.x + bw.w <= 80 && bw.y + bw.h <= 44, 'billboardWindow lies outside the 80x44 frame');
}

// --- palette.json: exactly the DIRECTION-A2 tokens
const palette = {
  night: '#0B0E17', deep: '#141B2B', 'ridge-far': '#3A4A66', 'ridge-mid': '#2A3650', 'ridge-near': '#1B2436',
  snow: '#F2F5F8', 'snow-shade': '#B9C6D6', rock: '#59667A', grass: '#3E8E4E', 'grass-dark': '#245C35',
  wood: '#8A5A3B', 'wood-dark': '#4C3125', paper: '#F3E8D2', ink: '#1A1420', red: '#E02B20',
  'red-light': '#FF6A4D', gold: '#F2B33D', 'sky-dawn': '#F08A5D', magenta: '#FF2BD6', cyan: '#46D9FF', white: '#FFFFFF',
};
const pj = existsSync(join(dir, 'palette.json')) ? JSON.parse(readFileSync(join(dir, 'palette.json'), 'utf8')) : null;
need(pj, 'palette.json missing');
if (pj) {
  need(Object.keys(pj).length === Object.keys(palette).length, `palette.json has ${Object.keys(pj).length} tokens, expected ${Object.keys(palette).length}`);
  for (const [k, v] of Object.entries(palette)) need(String(pj[k]).toUpperCase() === v, `palette token ${k} should be ${v}`);
}

// --- peaks.json
const kj = existsSync(join(dir, 'peaks.json')) ? JSON.parse(readFileSync(join(dir, 'peaks.json'), 'utf8')) : null;
need(kj, 'peaks.json missing');
if (kj) {
  need(Number.isInteger(kj.width) && kj.width >= 3600 && kj.width <= 4000, `peaks.json width ${kj.width} (about 3800 expected)`);
  need(kj.height === 216, 'peaks.json height must be 216');
  need(Array.isArray(kj.ground) && kj.ground.length === kj.width, 'peaks.json ground needs one y per x column');
  need((kj.ground || []).every((y) => Number.isInteger(y) && y >= 0 && y < 216), 'peaks.json ground values must be integers inside 0..215');
  need(Array.isArray(kj.peaks) && kj.peaks.length === 6, 'peaks.json needs six peaks');
  const xs = (kj.peaks || []).map((p) => p.x);
  need(xs.every((x, i) => i === 0 || x > xs[i - 1]), 'peaks must run left to right');
  need(Number.isInteger(kj.baseCamp) && kj.baseCamp < xs[0], 'baseCamp must be an x left of peak 1');
  need(kj.summit === xs[5], 'summit must be peak 6');
  for (const p of kj.peaks || []) need(kj.ground[p.x] === p.y, `peak at x=${p.x}: y ${p.y} is not the ground there`);
}

// --- images
const files = [
  ['sky.png', [384, 216]], ['bg-far.png', null], ['bg-mid.png', null], ['title-logo.png', null], ['style-frame.png', [1536, 864]],
];
for (const [f, size] of files) {
  const s = png(join(dir, f));
  if (!s || s.bad) { fails.push(`${f} missing or not a PNG`); continue; }
  if (size) need(s.w === size[0] && s.h === size[1], `${f} is ${s.w}x${s.h}, expected ${size[0]}x${size[1]}`);
}
for (const f of ['bg-far.png', 'bg-mid.png']) {
  const s = png(join(dir, f));
  if (s && !s.bad) need(s.h === 216 && s.w >= 640 && s.w <= 1024, `${f} should be about 768x216`);
}
const tl = png(join(dir, 'title-logo.png'));
if (tl && !tl.bad) need(tl.w >= 112 && tl.w <= 144, `title-logo.png width ${tl.w} (about 128 expected)`);
const tb = existsSync(join(dir, 'title-logo-blocks.json')) ? JSON.parse(readFileSync(join(dir, 'title-logo-blocks.json'), 'utf8')) : null;
need(tb && Array.isArray(tb.blocks) && tb.blocks.length > 0, 'title-logo-blocks.json missing or has no blocks');

const games = JSON.parse(readFileSync(join(root, 'research/games.json'), 'utf8'));
const shipped = games.filter((g) => g.status === 'released').map((g) => g.slug);
need(shipped.length === 13, `games.json lists ${shipped.length} released titles, the contract expects 13`);
for (const slug of shipped) {
  const s = png(join(dir, `billboard-${slug}.png`));
  if (!s || s.bad) fails.push(`billboard-${slug}.png missing`);
  else need(s.w === 72 && s.h === 30, `billboard-${slug}.png is ${s.w}x${s.h}, expected 72x30`);
}
const partners = [...new Set(readdirSync(join(root, 'assets/web/partners')).filter((f) => f.endsWith('.webp')).map((f) => f.replace('-colour', '').replace('.webp', '')))];
for (const p of partners) {
  const s = png(join(dir, `sign-${p}.png`));
  if (!s || s.bad) fails.push(`sign-${p}.png missing`);
  else need(s.w <= 48 && s.h <= 20, `sign-${p}.png is ${s.w}x${s.h}, too big for the signboard window`);
}
for (const f of readdirSync(dir)) need(!/\.jpe?g$/i.test(f), `JPEG found in the kit: ${f}`);

if (fails.length) {
  console.error(`pixel kit check: ${fails.length} problem(s)`);
  for (const f of fails) console.error('  - ' + f);
  process.exit(1);
}
console.log(`pixel kit check: ok (${Object.keys(want).length} contract frames, ${shipped.length} billboards, ${partners.length} signs, palette, peaks, backgrounds, title, style frame)`);
