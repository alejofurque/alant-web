// Verify emitted ESM in isolation: native TS execution would hide missing .ts imports.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const script = fileURLToPath(import.meta.url);
const root = resolve(dirname(script), '..');

function run(args, options = {}) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, 'Function artifact validation failed');
}

if (process.argv[2] === '--probe') {
  const artifact = resolve(process.argv[3]);
  // Neither credentials nor a TS loader are available in this fresh process.
  const httpFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error('External network access is forbidden in the artifact smoke test');
  };
  const { default: contact } = await import(pathToFileURL(join(artifact, 'api/contact.js')));
  const server = createServer(async (req, res) => {
    try {
      const response = await contact.fetch(
        new Request('https://alant.example.test/api/contact', { method: req.method }),
      );
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
    } catch {
      res.writeHead(500).end();
    }
  });
  // The OS chooses an unused port. Never use or interfere with port 4200.
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  try {
    const url = `http://127.0.0.1:${server.address().port}/api/contact`;
    for (const [method, status, body] of [
      ['GET', 200, { enabled: false }],
      ['POST', 503, { error: 'unavailable' }],
      ['DELETE', 405, { error: 'method' }],
    ]) {
      const response = await httpFetch(url, { method });
      assert.equal(response.status, status);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), body);
      console.log(`Function artifact: ${method} /api/contact -> ${status} (expected)`);
    }
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
  }
} else {
  // Optionally inspect the actual extracted Vercel artifact using the same checks.
  const external = process.argv[2] === '--artifact';
  const artifact = external
    ? resolve(process.argv[3])
    : await mkdtemp(join(tmpdir(), 'alant-contact-'));
  try {
    if (!external) {
      run([
        join(root, 'node_modules/typescript/bin/tsc'),
        '-p',
        'api/tsconfig.json',
        '--outDir',
        artifact,
      ]);
      await writeFile(join(artifact, 'package.json'), '{"type":"module"}\n');
    }
    for (const name of ['api/contact.js', 'server/contact.js', 'server/contact-validation.js']) {
      const code = await readFile(join(artifact, name), 'utf8');
      assert.doesNotMatch(code, /(?:from\s*|import\s*\()\s*['"][^'"]+\.ts['"]/);
    }
    const files = await readdir(artifact, { recursive: true });
    assert.ok(
      !files.some((name) => /\.[cm]?tsx?$/.test(name)),
      'Artifact must not rely on TS sources',
    );
    const env = {
      CONTACT_ENABLED: 'false',
      VERCEL: '1',
      VERCEL_ENV: 'production',
    };
    for (const key of ['SystemRoot', 'PATH', 'TEMP', 'TMP']) {
      if (process.env[key]) env[key] = process.env[key];
    }
    run(['--no-experimental-strip-types', script, '--probe', artifact], { env });
  } finally {
    if (!external) {
      assert.equal(dirname(artifact), resolve(tmpdir()));
      assert.ok(basename(artifact).startsWith('alant-contact-'));
      await rm(artifact, { recursive: true, force: true });
    }
  }
}
