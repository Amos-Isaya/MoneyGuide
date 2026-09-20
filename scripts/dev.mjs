// A local adapter for the same handler Vercel runs; no runtime dependencies.
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from '../api/moneyguide.js';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const files = new Map([['/', ['index.html', 'text/html']]]);
for (const name of ['index', 'dashboard', 'module', 'certificate', 'account']) files.set(`/${name}.html`, [`${name}.html`, 'text/html']);
// Only public asset directories are served; never expose environment or API source files.
for (const directory of ['css', 'js', 'assets']) {
  for (const entry of await readdir(new URL('../' + directory + '/', import.meta.url), { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !types[extname(entry.name)]) continue;
    const filename = relative(fileURLToPath(new URL('../', import.meta.url)), entry.parentPath + '/' + entry.name).replaceAll('\\', '/');
    files.set('/' + filename, [filename, types[extname(entry.name)]]);
  }
}
createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (path === '/api/moneyguide') return await handler(req, res);
    const file = files.get(path);
    if (!file || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(404); return res.end('Not found'); }
    const data = await readFile(new URL('../' + file[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': file[1] + '; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { console.error('[MoneyGuide server] REQUEST_FAILED'); res.writeHead(500); res.end('Unable to load MoneyGuide.'); }
}).listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
  console.log('MoneyGuide: http://localhost:' + (process.env.PORT || 3000));
  if (!process.env.NVIDIA_API_KEY?.trim() || process.env.NVIDIA_API_KEY === 'replace_with_your_nvidia_api_key') console.warn('[MoneyGuide AI] AI_NOT_CONFIGURED: set NVIDIA_API_KEY in .env.local and restart.');
});
