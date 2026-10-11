// Read-only deployment/configuration audit. Never prints credentials or sends email.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { JSDOM } from 'jsdom';
import { createContactHandler } from '../server/contact.ts';

const env = parseEnv(await readFile('.env', 'utf8').catch(() => ''));
const keys = [
  'RESEND_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'CONTACT_HASH_SECRET',
  'CONTACT_FROM_EMAIL',
  'CONTACT_TO_EMAIL',
  'CONTACT_ALLOWED_ORIGIN',
  'CONTACT_PRIVACY_NOTICE',
  'CONTACT_PRIVACY_VERSION',
];
const result = {
  auditedAt: new Date().toISOString(),
  localOnly: {
    present: Object.fromEntries(keys.map((key) => [key, Boolean(env[key]?.trim())])),
    flags: Object.fromEntries(
      ['CONTACT_ENABLED', 'CONTACT_DELIVERY_VERIFIED', 'CONTACT_PRIVACY_APPROVED'].map((key) => [
        key,
        ['true', 'false'].includes(env[key]) ? env[key] : 'missing-or-invalid',
      ]),
    ),
    originMatchesProduction: env.CONTACT_ALLOWED_ORIGIN === 'https://alantapp.com',
    recipientMatchesRequested: env.CONTACT_TO_EMAIL === 'alejofurque15@gmail.com',
    privacyNoticeLength: (env.CONTACT_PRIVACY_NOTICE ?? '').length,
    productionGate: await (
      await createContactHandler({ ...env, VERCEL: '1', VERCEL_ENV: 'production' })(
        new Request('https://alantapp.com/api/contact'),
      )
    )
      .json()
      .then((value) => ({ enabled: value.enabled })),
  },
  public: [],
};
if (process.argv.includes('--network')) {
  for (const url of [
    'http://alantapp.com/',
    'http://www.alantapp.com/',
    'https://www.alantapp.com/',
    'https://alantapp.com/',
    'https://alantapp.com/servicios',
    'https://alantapp.com/estudio',
    'https://alantapp.com/contacto',
    'https://alantapp.com/ruta-inexistente-auditoria',
    'https://alantapp.com/robots.txt',
    'https://alantapp.com/sitemap.xml',
    'https://alantapp.com/api/contact',
  ]) {
    try {
      const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(12000) });
      const record = {
        url,
        status: response.status,
        location: response.headers.get('location'),
        server: response.headers.get('server'),
        cache: response.headers.get('cache-control'),
        hsts: response.headers.get('strict-transport-security'),
      };
      if (response.status === 200 && response.headers.get('content-type')?.includes('text/html')) {
        const doc = new JSDOM(await response.text()).window.document;
        Object.assign(record, {
          title: doc.title,
          canonical: doc.querySelector('link[rel="canonical"]')?.href ?? null,
          robots: doc.querySelector('meta[name="robots"]')?.content ?? null,
          projectsVisible: Boolean(doc.querySelector('#proyectos')),
          h1Count: doc.querySelectorAll('h1').length,
        });
      } else if (
        url.endsWith('/api/contact') &&
        response.headers.get('content-type')?.includes('json')
      ) {
        const data = await response.json();
        record.contact = {
          enabled: data.enabled,
          privacyVersion: data.privacyVersion,
          privacyNotice: data.privacyNotice,
        };
      } else if (/\/(robots\.txt|sitemap\.xml)$/.test(url) && response.status === 200)
        record.body = await response.text();
      result.public.push(record);
    } catch (error) {
      result.public.push({ url, error: error.cause?.code ?? error.name });
    }
  }
}
await mkdir('docs/qa/production-audit', { recursive: true });
await writeFile('docs/qa/production-audit/deployment.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
