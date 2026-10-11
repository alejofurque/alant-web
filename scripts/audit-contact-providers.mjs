// Authorized diagnostics only. Never sends emails or changes contact activation flags.
// --limiter uses isolated, expiring Redis keys, never live rate-limit counters.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { randomUUID } from 'node:crypto';
import { RATE_SCRIPT } from '../server/contact.ts';
const env = parseEnv(await readFile('.env', 'utf8'));
const result = {
  auditedAt: new Date().toISOString(),
  credentialSource: 'local .env; not proof of deployed Production variables',
};
try {
  const url = new URL(env.UPSTASH_REDIS_REST_URL);
  if (
    url.protocol !== 'https:' ||
    !url.hostname.endsWith('.upstash.io') ||
    url.username ||
    url.password ||
    url.search
  )
    throw new Error('invalid-host');
  const command = async (body) => {
    const response = await fetch(url.origin, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return { status: response.status, result: data.result, error: Boolean(data.error) };
  };
  const ping = await command(['PING']);
  result.redis = { status: ping.status, pong: ping.result === 'PONG', error: ping.error };
  if (ping.result === 'PONG' && process.argv.includes('--limiter')) {
    const key = `alant:audit:${randomUUID()}`;
    const values = [];
    for (let i = 0; i < 3; i++)
      values.push((await command(['EVAL', RATE_SCRIPT, 1, key, 2, 30])).result);
    const ttl = await command(['TTL', key]);
    result.redis.limiter = {
      values,
      ttl: ttl.result,
      passed:
        values[0] === 0 && values[1] === 0 && values[2] > 0 && ttl.result > 0 && ttl.result <= 30,
    };
  }
} catch (error) {
  result.redis = { error: error.cause?.code ?? error.name };
}
for (const resource of ['domains', 'emails']) {
  try {
    const response = await fetch(`https://api.resend.com/${resource}`, {
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
    });
    const data = await response.json();
    const report = {
      status: response.status,
      errorType: response.ok ? null : (data.name ?? 'provider-error'),
    };
    if (response.ok && resource === 'domains') {
      const senderDomain = env.CONTACT_FROM_EMAIL?.split('@')[1];
      const match = data.data?.find((item) => item.name === senderDomain);
      Object.assign(report, {
        senderDomainListed: Boolean(match),
        senderDomainStatus: match?.status ?? null,
      });
    }
    if (response.ok && resource === 'emails') {
      const matches = (data.data ?? []).filter(
        (item) =>
          item.to?.includes(env.CONTACT_TO_EMAIL) && item.subject?.startsWith('Consulta ALANT'),
      );
      Object.assign(report, {
        matchingInquiriesInPage: matches.length,
        deliveryEvents: matches.map((item) => item.last_event),
        morePages: Boolean(data.has_more),
      });
    }
    result[resource] = report;
  } catch (error) {
    result[resource] = { error: error.cause?.code ?? error.name };
  }
}
await mkdir('docs/qa/production-audit', { recursive: true });
await writeFile('docs/qa/production-audit/providers.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
