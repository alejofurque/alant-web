import { readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve('dist/alant-web/browser');
const config = JSON.parse(await readFile('src/app/core/publication.json', 'utf8'));
const manifest = JSON.parse(await readFile(resolve(root, '../prerendered-routes.json'), 'utf8'));
const paths = Object.keys(manifest.routes).filter((path) => path !== '/404');
if (config.origin) {
  const origin = new URL(config.origin);
  if (
    origin.protocol !== 'https:' ||
    origin.origin !== config.origin ||
    origin.username ||
    origin.password
  ) {
    throw new Error(
      'Publication origin must be a confirmed HTTPS origin without a path or trailing slash.',
    );
  }
}
if (config.indexable && !config.origin)
  throw new Error('Indexing requires a confirmed public origin.');
await copyFile(resolve(root, '404/index.html'), resolve(root, '404.html'));
if (config.indexable) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${config.origin}${path}</loc></url>`).join('\n')}\n</urlset>\n`;
  await writeFile(resolve(root, 'sitemap.xml'), xml);
  await writeFile(
    resolve(root, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${config.origin}/sitemap.xml\n`,
  );
} else {
  await writeFile(resolve(root, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  await rm(resolve(root, 'sitemap.xml'), { force: true });
}
console.log(
  `Publication assets: ${paths.length} corporate pages; indexing ${config.indexable ? 'enabled' : 'disabled'}; 404.html ready.`,
);
