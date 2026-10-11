// Prints the Artifact `files` map for a direction: every assets/... path the page references
// (markup, inline CSS, embedded JSON), mapped to its real file under assets/web/.
// Usage: node tools/publish-map.mjs <direction-dir>   (run from the project root)
import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2];
const html = fs.readFileSync(path.join(dir, 'page.html'), 'utf8');
const refs = new Set(html.match(/assets\/[A-Za-z0-9_\-./]+\.(?:webp|png|jpe?g|svg)/g) || []);
const map = {}; const missing = [];
for (const r of [...refs].sort()) {
  const src = path.join('assets/web', r.slice('assets/'.length));
  if (fs.existsSync(src)) map[r] = path.join('clients/leads/six-peaks-games', src); else missing.push(r);
}
let bytes = 0; for (const s of Object.values(map)) bytes += fs.statSync(path.join('..', '..', '..', s)).size;
console.error(`${dir}: ${Object.keys(map).length} files, ${(bytes / 1048576).toFixed(1)} MB, missing ${missing.length}${missing.length ? ': ' + missing.join(', ') : ''}`);
console.log(JSON.stringify(map));
