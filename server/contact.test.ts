import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createContactHandler } from './contact.ts';
import { validEmail, validateInquiry } from './contact-validation.ts';

// All upstreams are isolated test doubles. These are not usable credentials or legal text.
const env = {
  CONTACT_ENABLED: 'true',
  CONTACT_DELIVERY_VERIFIED: 'false',
  CONTACT_PRIVACY_APPROVED: 'true',
  CONTACT_ALLOWED_ORIGIN: 'https://preview.example.test',
  CONTACT_FROM_EMAIL: 'contact@sender.example.test',
  CONTACT_TO_EMAIL: 'recipient@example.test',
  RESEND_API_KEY: 'unit-test-only',
  UPSTASH_REDIS_REST_URL: 'https://unit-test.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'unit-test-only',
  CONTACT_HASH_SECRET: 'unit-test-secret-never-used-outside-tests',
  CONTACT_PRIVACY_NOTICE:
    'Texto usado exclusivamente para verificar el contrato en pruebas aisladas; no es un aviso legal publicable.',
  CONTACT_PRIVACY_VERSION: 'test-v1',
  VERCEL: '1',
  VERCEL_ENV: 'preview',
};
const now = 1800000000000;
const inquiry = {
  name: 'Equipo QA',
  email: 'visitor@example.test',
  company: '',
  projectType: 'software',
  message: 'Necesitamos integrar pedidos y sistemas internos.',
  website: '',
  startedAt: now - 5000,
  consent: true,
  privacyVersion: 'test-v1',
};
const request = (body: unknown = inquiry, headers: Record<string, string> = {}) =>
  new Request('https://preview.example.test/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: env.CONTACT_ALLOWED_ORIGIN,
      'x-vercel-forwarded-for': '203.0.113.10',
      'sec-fetch-site': 'same-origin',
      ...headers,
    },
    body: JSON.stringify(body),
  });
function setup(overrides: Record<string, string> = {}, responses: Array<Response | Error> = []) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fetcher: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init: init! });
    const response = responses.shift();
    if (response instanceof Error) throw response;
    return (
      response ??
      Response.json(
        String(url).includes('upstash.io') ? { result: 0 } : { id: 'provider-test-receipt' },
      )
    );
  };
  return { calls, handle: createContactHandler({ ...env, ...overrides }, fetcher, () => now) };
}

test('missing configuration disables GET and POST without any network call', async () => {
  for (const key of [
    'CONTACT_ENABLED',
    'CONTACT_PRIVACY_APPROVED',
    'CONTACT_TO_EMAIL',
    'CONTACT_FROM_EMAIL',
    'RESEND_API_KEY',
    'UPSTASH_REDIS_REST_TOKEN',
    'CONTACT_HASH_SECRET',
    'CONTACT_PRIVACY_NOTICE',
    'CONTACT_PRIVACY_VERSION',
    'CONTACT_ALLOWED_ORIGIN',
  ]) {
    const { handle, calls } = setup({ [key]: '' });
    assert.deepEqual(
      await (await handle(new Request('https://preview.example.test/api/contact'))).json(),
      { enabled: false },
    );
    assert.equal((await handle(request())).status, 503);
    assert.equal(calls.length, 0);
  }
});
test('public configuration reveals only readiness and approved privacy copy', async () => {
  const { handle, calls } = setup();
  const response = await handle(new Request('https://preview.example.test/api/contact'));
  assert.deepEqual(await response.json(), {
    enabled: true,
    privacyNotice: env.CONTACT_PRIVACY_NOTICE,
    privacyVersion: 'test-v1',
  });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(calls.length, 0);
});
test('production requires a confirmed delivery and disallows sandbox or Gmail senders', async () => {
  for (const overrides of [
    { VERCEL_ENV: 'production' },
    { CONTACT_FROM_EMAIL: 'someone@gmail.com' },
    {
      VERCEL_ENV: 'production',
      CONTACT_DELIVERY_VERIFIED: 'true',
      CONTACT_FROM_EMAIL: 'onboarding@resend.dev',
    },
  ] as Record<string, string>[])
    assert.equal((await setup(overrides).handle(request())).status, 503);
  assert.equal(
    (await setup({ VERCEL_ENV: 'production', CONTACT_DELIVERY_VERIFIED: 'true' }).handle(request()))
      .status,
    200,
  );
});
test('rejects methods, foreign/missing origins and non-JSON requests', async () => {
  const { handle, calls } = setup();
  assert.equal(
    (await handle(new Request('https://preview.example.test/api/contact', { method: 'DELETE' })))
      .status,
    405,
  );
  for (const headers of [
    { Origin: '' },
    { Origin: 'https://evil.example.test' },
    { 'sec-fetch-site': 'cross-site' },
  ] as Record<string, string>[])
    assert.equal((await handle(request(inquiry, headers))).status, 403);
  assert.equal((await handle(request(inquiry, { 'Content-Type': 'text/plain' }))).status, 415);
  assert.equal(calls.length, 0);
});
test('does not trust spoofed fallback IP headers on Vercel', async () => {
  const { handle, calls } = setup();
  assert.equal(
    (
      await handle(
        request(inquiry, { 'x-vercel-forwarded-for': '', 'x-forwarded-for': '203.0.113.5' }),
      )
    ).status,
    503,
  );
  assert.equal(calls.length, 0);
});
test('enforces byte size with and without content-length and rejects malformed JSON', async () => {
  const { handle, calls } = setup();
  assert.equal((await handle(request(inquiry, { 'Content-Length': '30000' }))).status, 413);
  assert.equal(calls.length, 0);
  assert.equal((await handle(request({ ...inquiry, message: 'x'.repeat(25000) }))).status, 413);
  const broken = request();
  assert.equal(
    (await handle(new Request(broken.url, { method: 'POST', headers: broken.headers, body: '{' })))
      .status,
    400,
  );
  assert.ok(calls.every((call) => call.url.includes('upstash.io')));
});
test('validates bounds, types, honeypot, consent, notice version and timing on server', async () => {
  for (const invalid of [
    null,
    [],
    { ...inquiry, name: ' ' },
    { ...inquiry, name: 'A\r\nB' },
    { ...inquiry, email: 'a@example.test\r\nBcc: victim@example.test' },
    { ...inquiry, company: 'x'.repeat(161) },
    { ...inquiry, message: 'short' },
    { ...inquiry, message: 'x'.repeat(4001) },
    { ...inquiry, projectType: '__proto__' },
    { ...inquiry, website: 'https://spam.example.test' },
    { ...inquiry, consent: false },
    { ...inquiry, consent: 'true' },
    { ...inquiry, privacyVersion: 'old' },
    { ...inquiry, startedAt: now },
    { ...inquiry, startedAt: now + 100 },
    { ...inquiry, startedAt: now - 86400001 },
    { ...inquiry, to: 'attacker@example.test' },
  ]) {
    const { handle, calls } = setup();
    assert.equal((await handle(request(invalid))).status, 400);
    assert.equal(calls.length, 1);
  }
  assert.ok(validateInquiry(inquiry, 'test-v1', now));
  assert.ok(validEmail('name+tag@example.test'));
  assert.equal(validEmail('a..b@example.test'), false);
  assert.equal(validEmail('Name <name@example.test>'), false);
});
test('limits IP attempts across instances and never sends when blocked', async () => {
  const { handle, calls } = setup({}, [Response.json({ result: 900 })]);
  const response = await handle(request());
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '900');
  assert.equal(calls.length, 1);
  const command = JSON.parse(calls[0].init.body as string);
  assert.equal(command[0], 'EVAL');
  assert.deepEqual(command.slice(-2), [10, 900]);
  assert.ok(!JSON.stringify(command).includes('203.0.113.10'));
});
test('email and global limits are checked atomically before Resend', async () => {
  const { handle, calls } = setup({}, [
    Response.json({ result: 0 }),
    Response.json({ result: 3600 }),
  ]);
  assert.equal((await handle(request())).status, 429);
  assert.equal(calls.length, 2);
  const command = JSON.parse(calls[1].init.body as string);
  assert.equal(command[2], 2);
  assert.deepEqual(command.slice(-4), [3, 3600, 30, 3600]);
  assert.ok(!JSON.stringify(command).includes(inquiry.email));
});
test('fails closed when Redis is unavailable or returns invalid data', async () => {
  for (const response of [
    new Error('Timeout'),
    new Response('', { status: 503 }),
    Response.json({ error: 'ERR' }),
    Response.json({ result: '0' }),
  ]) {
    const { handle, calls } = setup({}, [response]);
    assert.equal((await handle(request())).status, 503);
    assert.equal(calls.length, 1);
  }
});
test('structured email escapes HTML, uses server recipient/sender and visitor Reply-To', async () => {
  const { handle, calls } = setup();
  const response = await handle(
    request({ ...inquiry, name: '<b>QA</b>', message: '<script>alert(1)</script>\nSegunda línea' }),
  );
  assert.deepEqual(await response.json(), { accepted: true, receiptId: 'provider-test-receipt' });
  const payload = JSON.parse(calls[2].init.body as string);
  assert.equal(payload.from, `ALANT <${env.CONTACT_FROM_EMAIL}>`);
  assert.deepEqual(payload.to, [env.CONTACT_TO_EMAIL]);
  assert.equal(payload.reply_to, inquiry.email);
  assert.ok(!payload.html.includes('<script>'));
  assert.ok(payload.html.includes('&lt;script&gt;'));
  assert.ok(payload.text.includes('Segunda línea'));
  assert.ok(payload.text.includes('Aviso test-v1'));
});
test('retry and duplicate content use one provider idempotency key, edits use another', async () => {
  const { handle, calls } = setup();
  await handle(request());
  await handle(request({ ...inquiry, startedAt: now - 10000 }));
  await handle(request({ ...inquiry, message: inquiry.message + ' Más contexto.' }));
  const keys = calls
    .filter((call) => call.url.includes('resend.com'))
    .map((call) => new Headers(call.init.headers).get('Idempotency-Key'));
  assert.equal(keys[0], keys[1]);
  assert.notEqual(keys[0], keys[2]);
  assert.match(keys[0]!, /^alant-contact\/[a-f0-9]{64}$/);
});
test('provider errors/timeouts/empty IDs never return a success receipt or leak detail', async () => {
  for (const provider of [
    new Error('secret timeout'),
    Response.json({ message: 'secret' }, { status: 422 }),
    Response.json({}),
    Response.json({ id: '' }),
    new Response('not json'),
  ]) {
    const { handle } = setup({}, [
      Response.json({ result: 0 }),
      Response.json({ result: 0 }),
      provider,
    ]);
    const response = await handle(request());
    assert.ok(response.status >= 500);
    const data = await response.json();
    assert.equal(data.accepted, undefined);
    assert.ok(!JSON.stringify(data).includes('secret'));
  }
});
test('IPv6 privacy-address rotation shares a /64 rate bucket', async () => {
  const { handle, calls } = setup();
  for (const ip of ['2001:db8:abcd:12::1', '2001:0db8:abcd:0012:ffff:1:2:3'])
    await handle(request(inquiry, { 'x-vercel-forwarded-for': ip }));
  assert.equal(
    JSON.parse(calls[0].init.body as string)[3],
    JSON.parse(calls[3].init.body as string)[3],
  );
});
