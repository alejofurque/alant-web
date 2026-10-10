import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { composeEmail, validEmail, validateInquiry } from './contact-validation.ts';

type Environment = Record<string, string | undefined>;
type Fetch = typeof globalThis.fetch;
const MAX_BODY = 24 * 1024;
const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extra,
    },
  });

function configuration(env: Environment) {
  try {
    const origin = new URL(env.CONTACT_ALLOWED_ORIGIN ?? '');
    const redis = new URL(env.UPSTASH_REDIS_REST_URL ?? '');
    const local = env.VERCEL !== '1' && ['localhost', '127.0.0.1'].includes(origin.hostname);
    const from = env.CONTACT_FROM_EMAIL ?? '';
    const to = env.CONTACT_TO_EMAIL ?? '';
    const notice = env.CONTACT_PRIVACY_NOTICE?.trim() ?? '';
    const version = env.CONTACT_PRIVACY_VERSION ?? '';
    if (
      env.CONTACT_ENABLED !== 'true' ||
      env.CONTACT_PRIVACY_APPROVED !== 'true' ||
      (env.VERCEL_ENV === 'production' && env.CONTACT_DELIVERY_VERIFIED !== 'true') ||
      (!local && origin.protocol !== 'https:') ||
      origin.origin !== env.CONTACT_ALLOWED_ORIGIN ||
      redis.protocol !== 'https:' ||
      !redis.hostname.endsWith('.upstash.io') ||
      redis.username ||
      redis.password ||
      redis.search ||
      redis.hash ||
      redis.pathname !== '/' ||
      !env.UPSTASH_REDIS_REST_TOKEN ||
      !env.RESEND_API_KEY ||
      (env.CONTACT_HASH_SECRET?.length ?? 0) < 32 ||
      !validEmail(from) ||
      !validEmail(to) ||
      /@(gmail\.com|googlemail\.com|outlook\.com|hotmail\.com|yahoo\.com)$/i.test(from) ||
      from.toLowerCase() === to.toLowerCase() ||
      (env.VERCEL_ENV === 'production' && from.toLowerCase().endsWith('@resend.dev')) ||
      notice.length < 80 ||
      notice.length > 6000 ||
      !/^[a-zA-Z0-9._-]{1,64}$/.test(version)
    )
      return null;
    return { origin: origin.origin, redis: redis.origin, from, to, notice, version };
  } catch {
    return null;
  }
}

// Count and expire atomically, across all function instances. No raw IP/email in Redis.
export const RATE_SCRIPT = `
local retry = 0
for i, key in ipairs(KEYS) do
  local limit = tonumber(ARGV[(i-1)*2+1])
  local ttl = tonumber(ARGV[(i-1)*2+2])
  local count = redis.call('INCR', key)
  if count == 1 then redis.call('EXPIRE', key, ttl) end
  if count > limit then retry = math.max(retry, ttl, redis.call('TTL', key)) end
end
return retry`;

// Aggregate IPv6 clients by /64 so rotating interface addresses cannot bypass the limit.
function ipBucket(ip: string): string {
  if (isIP(ip) === 4) return ip;
  const [left, right = ''] = ip.toLowerCase().split('::');
  const start = left ? left.split(':') : [];
  const end = right ? right.split(':') : [];
  return (
    [...start, ...Array(Math.max(0, 8 - start.length - end.length)).fill('0'), ...end]
      .slice(0, 4)
      .map((part: string) => Number.parseInt(part, 16).toString(16))
      .join(':') + '::/64'
  );
}

async function readBody(request: Request): Promise<unknown> {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) throw new Error('size');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) {
        await reader.cancel();
        throw new Error('size');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

export function createContactHandler(
  env: Environment,
  fetcher: Fetch = globalThis.fetch,
  now = Date.now,
) {
  return async (request: Request): Promise<Response> => {
    if (!['GET', 'POST'].includes(request.method))
      return json(405, { error: 'method' }, { Allow: 'GET, POST' });
    const config = configuration(env);
    if (request.method === 'GET')
      return json(
        200,
        config
          ? {
              enabled: true,
              privacyNotice: config.notice,
              privacyVersion: config.version,
            }
          : { enabled: false },
      );
    if (!config) return json(503, { error: 'unavailable' });
    if (
      request.headers.get('origin') !== config.origin ||
      (request.headers.has('sec-fetch-site') &&
        request.headers.get('sec-fetch-site') !== 'same-origin')
    )
      return json(403, { error: 'origin' });
    if (
      !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(
        request.headers.get('content-type') ?? '',
      )
    )
      return json(415, { error: 'content_type' });
    if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY)
      return json(413, { error: 'size' });

    // Trust this header only on Vercel, where the platform overwrites it.
    const ip =
      env.VERCEL === '1' ? (request.headers.get('x-vercel-forwarded-for') ?? '') : '127.0.0.1';
    if (!isIP(ip)) return json(503, { error: 'unavailable' });
    const hash = (value: string) =>
      createHmac('sha256', env.CONTACT_HASH_SECRET!).update(value).digest('hex');
    const prefix = `alant:contact:${env.VERCEL_ENV ?? 'development'}`;
    const rateLimit = async (limits: Array<[string, number, number]>) => {
      const response = await fetcher(config.redis, {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(3000),
        headers: {
          Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          'EVAL',
          RATE_SCRIPT,
          limits.length,
          ...limits.map(([key]) => `${prefix}:${key}`),
          ...limits.flatMap(([, limit, ttl]) => [limit, ttl]),
        ]),
      });
      if (!response.ok) throw new Error('limiter');
      const data = (await response.json()) as { result?: unknown; error?: unknown };
      if (
        data.error ||
        typeof data.result !== 'number' ||
        !Number.isInteger(data.result) ||
        data.result < 0
      )
        throw new Error('limiter');
      return data.result;
    };
    try {
      const retry = await rateLimit([[`ip:${hash(ipBucket(ip))}`, 10, 900]]);
      if (retry) return json(429, { error: 'rate_limited' }, { 'Retry-After': String(retry) });
      let raw: unknown;
      try {
        raw = await readBody(request);
      } catch (error) {
        return json(error instanceof Error && error.message === 'size' ? 413 : 400, {
          error: 'invalid',
        });
      }
      const inquiry = validateInquiry(raw, config.version, now());
      if (!inquiry) return json(400, { error: 'invalid' });
      const recipientRetry = await rateLimit([
        [`email:${hash(inquiry.email.toLowerCase())}`, 3, 3600],
        ['global', 30, 3600],
      ]);
      if (recipientRetry)
        return json(429, { error: 'rate_limited' }, { 'Retry-After': String(recipientRetry) });
      const email = composeEmail(inquiry, config.from, config.to);
      // Same normalized message => same key, including retries after ambiguous network failure.
      // Resend retains the receipt for 24h; this also covers double-clicks and page reloads.
      const response = await fetcher('https://api.resend.com/emails', {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(8000),
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `alant-contact/${hash(JSON.stringify(email))}`,
        },
        body: JSON.stringify(email),
      });
      if (!response.ok) return json(502, { error: 'delivery_unconfirmed' });
      const receipt = (await response.json()) as { id?: unknown };
      if (typeof receipt.id !== 'string' || !receipt.id.trim())
        return json(502, { error: 'delivery_unconfirmed' });
      return json(200, { accepted: true, receiptId: receipt.id });
    } catch {
      // Never log the payload, recipient, IP, credentials, or upstream response body.
      return json(503, { error: 'unavailable' });
    }
  };
}
