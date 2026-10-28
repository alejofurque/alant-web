import { readFile, stat, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const root = resolve('dist/alant-web/browser');
const configuration = JSON.parse(await readFile('src/app/core/publication.json', 'utf8'));
const manifest = JSON.parse(await readFile(resolve(root, '../prerendered-routes.json'), 'utf8'));
const paths = ['/', '/servicios', '/estudio', '/contacto', '/404'];
for (const file of await readdir(root, { recursive: true })) {
  if (!/\.(html|js|json|txt)$/.test(file)) continue;
  const content = await readFile(resolve(root, file), 'utf8');
  assert.ok(
    !/alantdeveloper@gmail\.com|alejofurque15@gmail\.com|RESEND_API_KEY|UPSTASH_REDIS_REST_TOKEN/.test(
      content,
    ),
    `${file}: private contact configuration leaked`,
  );
}
assert.deepEqual(Object.keys(manifest.routes).sort(), [...paths].sort());
const pages = new Map();
for (const path of paths) {
  const html = await readFile(resolve(root, `.${path}`, 'index.html'), 'utf8');
  const document = new JSDOM(html).window.document;
  // Prevent a silent i18n fallback from discarding the prerendered root on startup.
  const appRoot = document.querySelector('app-root');
  assert.ok(appRoot?.hasAttribute('ngh'), `${path}: missing root hydration metadata`);
  assert.equal(appRoot.hasAttribute('ngskiphydration'), false, `${path}: root skips hydration`);
  pages.set(path, document);
  assert.equal(document.documentElement.lang, 'es');
  for (const selector of [
    'h1',
    'main',
    'app-header',
    'app-footer',
    'meta[name="description"]',
    'meta[property="og:title"]',
    'meta[property="og:description"]',
  ]) {
    assert.equal(document.querySelectorAll(selector).length, 1, `${path}: ${selector}`);
  }
  assert.match(document.title, /ALANT/);
  assert.ok(document.querySelector('meta[name="description"]').content.length > 40);
  assert.equal(document.querySelector('meta[property="og:title"]').content, document.title);
  assert.equal(document.querySelector('link[hreflang="en"]'), null);
  assert.equal(document.querySelector('nav a[href*="proyectos"]'), null);
  assert.equal(document.querySelector('img[src*="precision-mint-board"]'), null);
  assert.equal(
    document.querySelector('meta[name="robots"]').content,
    configuration.indexable && path !== '/404' ? 'index, follow' : 'noindex, nofollow',
  );
  const canonical = document.querySelector('link[rel="canonical"]');
  if (configuration.origin && path !== '/404')
    assert.equal(canonical.href, new URL(path, configuration.origin).href);
  else assert.equal(canonical, null);
  const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
  assert.equal(new Set(ids).size, ids.length, `${path}: duplicate IDs`);
  assert.equal(document.querySelector('.skip-link').getAttribute('href'), `${path}#contenido`);
}
const titles = [...pages.values()].map((document) => document.title);
assert.equal(new Set(titles).size, paths.length);
const descriptions = [...pages.values()].map(
  (document) => document.querySelector('meta[name="description"]').content,
);
assert.equal(new Set(descriptions).size, paths.length);
let links = 0;
for (const [path, document] of pages) {
  for (const link of document.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href');
    assert.notEqual(href, '#');
    assert.ok(!href.startsWith('mailto:'), 'Private recipient must not be published');
    const url = new URL(href, 'https://test.invalid/');
    assert.equal(url.origin, 'https://test.invalid');
    const target = pages.get(url.pathname);
    if (target && url.hash)
      assert.ok(
        target.getElementById(decodeURIComponent(url.hash.slice(1))),
        `${path}: missing anchor ${href}`,
      );
    else if (!target)
      assert.ok(
        (await stat(resolve(root, `.${url.pathname}`))).isFile(),
        `${path}: missing ${href}`,
      );
    links++;
  }
}
const home = pages.get('/');
for (const path of ['/servicios']) {
  const previews = [...pages.get(path).querySelectorAll('app-solution-preview')];
  assert.equal(previews.length, 3, `${path}: three conceptual solution previews`);
  for (const preview of previews) {
    assert.match(preview.textContent, /Interfaz conceptual/);
    assert.ok(preview.querySelector('figcaption')?.textContent.trim());
    assert.equal(
      preview.querySelector('button, input, a'),
      null,
      'Conceptual UI must not imply working controls',
    );
  }
}
assert.equal(home.querySelector('app-projects, #proyectos, app-project-card'), null);
assert.ok(!home.body.textContent.includes('Portfolio en preparación'));
assert.equal(home.querySelectorAll('app-pliegue .plate').length, 3);
assert.equal(home.querySelector('app-pliegue button, app-pliegue a'), null);
assert.equal(home.querySelector('.hero-footer button').disabled, true);
assert.match(home.querySelector('h1').textContent, /Software.*Automatización.*Diseño digital/s);
assert.equal(home.querySelector('.hero-copy a').getAttribute('href'), '/contacto');
assert.equal(home.querySelectorAll('#soluciones article').length, 3);
for (const service of ['Sistemas de gestión', 'Conectamos herramientas', 'Páginas profesionales'])
  assert.ok(home.querySelector('#soluciones').textContent.includes(service));
assert.equal(home.querySelector('.closing a').getAttribute('href'), '/contacto');
for (const id of ['inicio', 'servicios', 'soluciones', 'proceso', 'contacto'])
  assert.ok(home.getElementById(id));
assert.equal(
  home.querySelector('app-blueprint, app-system-diagram, app-order-panel, .story-enhanced'),
  null,
);
const contact = pages.get('/contacto');
assert.equal(contact.querySelector('fieldset').disabled, true);
assert.equal(contact.querySelector('button[type="submit"]').disabled, true);
assert.ok(contact.querySelector('a[download][href="/consulta-alant.txt"]'));
assert.match(contact.querySelector('#form-availability').textContent, /no envía información/);
for (const field of contact.querySelectorAll('input, textarea, select'))
  assert.ok(contact.querySelector(`label[for="${field.id}"]`));
assert.ok((await stat(resolve(root, '404.html'))).isFile());
const robots = await readFile(resolve(root, 'robots.txt'), 'utf8');
if (!configuration.indexable) {
  assert.match(robots, /Disallow: \//);
  await assert.rejects(stat(resolve(root, 'sitemap.xml')));
} else {
  assert.match(robots, /Sitemap:/);
  const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, 4);
  assert.ok(!sitemap.includes('/404'));
}
console.log(
  `SSG verified: ${paths.length} routes, ${links} local links, unique metadata, disabled form, private recipient, motion fallback and publication assets.`,
);
