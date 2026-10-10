// Static production preview with the same contact handler as Vercel. Local QA only.
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import contact from '../api/contact.ts';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist/alant-web/browser');
// Test the prerender fallback without loading Angular or any animation code.
const staticOnly = process.argv.includes('--static-only');
const port = staticOnly ? 4201 : 4200;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml; charset=utf-8',
};
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/api/contact' && !staticOnly) {
      const response = await contact.fetch(
        new Request(`http://127.0.0.1:${port}/api/contact`, {
          method: req.method,
          headers: req.headers,
          ...(req.method !== 'GET' && req.method !== 'HEAD'
            ? { body: Readable.toWeb(req), duplex: 'half' }
            : {}),
        }),
      );
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    const source = await readFile(file);
    const content =
      staticOnly && extname(file) === '.html'
        ? source.toString().replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        : source;
    res.writeHead(200, {
      'Content-Type': mime[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(content);
  } catch {
    try {
      const source = await readFile(resolve(root, '404.html'), 'utf8');
      const content = staticOnly
        ? source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        : source;
      res
        .writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
        .end(content);
    } catch {
      res
        .writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        .end('Página no encontrada.');
    }
  }
}).listen(port, '127.0.0.1', () =>
  console.log(`ALANT ${staticOnly ? 'static-only ' : ''}preview: http://127.0.0.1:${port}`),
);
