// Shared helpers for the A2 tools: wrap page.html exactly like qa/shoot.mjs (the Artifact skeleton),
// serve the project root over http, and serve pinned GSAP locally (cdnjs is blocked in this container).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export function wrap(content) {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' +
    '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}' +
    'body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>' +
    '</head><body>\n' + content + '\n</body></html>\n';
}
export function wrapPage(root, dir = 'direction-a-bug-hunt') {
  fs.writeFileSync(path.join(root, dir, 'index.html'), wrap(fs.readFileSync(path.join(root, dir, 'page.html'), 'utf8')));
}
export async function serve(root, dir = 'direction-a-bug-hunt') {
  const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
  const bytes = { total: 0, images: 0, list: [] };
  const s = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const f = path.join(root, p);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => s.listen(0, '127.0.0.1', r));
  return { server: s, base: `http://127.0.0.1:${s.address().port}/${dir}/index.html` };
}
export async function routeCdn(ctx, root) {
  await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/gsap/**', async (route) => {
    const file = path.join(root, 'node_modules', 'gsap', 'dist', path.basename(new URL(route.request().url()).pathname));
    if (fs.existsSync(file)) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
    return route.fulfill({ status: 404, body: 'not vendored' });
  });
}
