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
const services = pages.get('/servicios');
const serviceIds = ['web', 'software', 'automatizacion'];
assert.deepEqual(
  [...services.querySelectorAll('section.svc')].map((section) => section.id),
  serviceIds,
);
assert.deepEqual(
  [...services.querySelectorAll('.glance-card')].map((a) => a.getAttribute('href')),
  serviceIds.map((id) => `/servicios#${id}`),
);
for (const id of serviceIds) {
  const section = services.getElementById(id);
  assert.equal(section.querySelector('.cta-solid').getAttribute('href'), `/contacto?tipo=${id}`);
  const plate = section.querySelector('.plate');
  assert.equal(plate.getAttribute('aria-hidden'), 'true');
  assert.match(plate.textContent, /Interfaz conceptual/);
  assert.equal(
    plate.querySelector('a, button, input'),
    null,
    'Conceptual UI must not imply controls',
  );
}
assert.equal(services.querySelectorAll('.faq details').length, 4);
const studio = pages.get('/estudio');
assert.match(studio.querySelector('.blueprint figcaption').textContent, /Esquema ilustrativo/);
assert.equal(studio.querySelectorAll('#proceso .steps li').length, 4);
assert.deepEqual(
  [...home.querySelectorAll('.service-more')].map((a) => a.getAttribute('href')),
  serviceIds.map((id) => `/servicios#${id}`),
);
assert.equal(home.querySelector('app-projects, #proyectos, app-project-card'), null);
assert.ok(!home.body.textContent.includes('Portfolio en preparación'));
assert.equal(home.querySelectorAll('.space app-plane').length, 3);
for (const plane of home.querySelectorAll('app-plane')) {
  assert.equal(plane.getAttribute('aria-hidden'), 'true');
  assert.equal(plane.querySelector('a, button, input'), null);
}
assert.match(home.querySelector('.stage-note').textContent, /Interfaces conceptuales/);
// Escultura 3D del hero: imagen fija prerenderizada, decorativa, y Three.js fuera de la carga inicial.
const escultura = home.querySelector('.hero app-escultura');
assert.equal(escultura?.getAttribute('aria-hidden'), 'true');
assert.equal(escultura.querySelector('img.poster').getAttribute('alt'), '');
for (const src of [
  '/escultura/alant-a-600.webp',
  '/escultura/alant-a-800.webp',
  '/escultura/alant-a-1200.webp',
])
  assert.ok((await stat(resolve(root, `.${src}`))).isFile(), `missing ${src}`);
const indexHome = await readFile(resolve(root, 'index.html'), 'utf8');
for (const archivo of await readdir(root)) {
  if (!/^chunk-.*.js$/.test(archivo)) continue;
  if ((await readFile(resolve(root, archivo), 'utf8')).includes('WebGLRenderer'))
    assert.ok(
      !indexHome.includes(archivo),
      `Three.js (${archivo}) must not load with the initial HTML`,
    );
}
assert.equal(home.querySelector('app-motion-toggle button').style.visibility, 'hidden');
assert.match(home.querySelector('h1').textContent, /Software hecho\s+a medida/);
assert.equal(home.querySelector('.hero .cta').getAttribute('href'), '/contacto');
assert.deepEqual(
  [...home.querySelectorAll('.needs a')].map((a) => a.getAttribute('href')),
  ['/#web', '/#sistemas', '/#automatizacion'],
);
assert.equal(home.querySelectorAll('#servicios .service').length, 3);
for (const service of ['Sistemas de gestión', 'Sitios corporativos', 'Integración entre sistemas'])
  assert.ok(home.querySelector('#servicios').textContent.includes(service));
assert.equal(home.querySelectorAll('#soluciones .index-col').length, 3);
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
