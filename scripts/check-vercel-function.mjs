// Optional packaging audit. Install @vercel/node outside the project; see docs/FIX-VERCEL-FUNCTION.md.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
assert.ok(process.argv[2], 'Pass the temporary node_modules directory containing @vercel/node');
const require = createRequire(import.meta.url);
const toolRoot = resolve(process.argv[2]);
const { build } = require(join(toolRoot, '@vercel/node'));
const { FileBlob } = require(join(toolRoot, '@vercel/build-utils'));
const builderVersion = require(join(toolRoot, '@vercel/node/package.json')).version;
const artifacts = join(root, 'artifacts');
await mkdir(artifacts, { recursive: true });
const audit = await mkdtemp(join(artifacts, 'vercel-function-'));
const workPath = join(audit, 'input');
await mkdir(workPath);

// Explicit source allowlist: never copy .env, credentials, or frontend assets.
const files = {};
for (const name of [
  'api/contact.ts',
  'api/tsconfig.json',
  'server/contact.ts',
  'server/contact-validation.ts',
  'server/tsconfig.json',
  'package.json',
  'tsconfig.json',
]) {
  files[name] = new FileBlob({ data: await readFile(join(root, name)) });
}
const config = JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8'));
assert.ok(config.functions['api/contact.ts']);
const { output } = await build({
  files,
  entrypoint: 'api/contact.ts',
  workPath,
  considerBuildCommand: true,
  config: {
    ...config.functions['api/contact.ts'],
    zeroConfig: true,
    // Dependencies are native Node APIs. Angular is built separately by npm run build.
    projectSettings: { installCommand: '', buildCommand: 'node --version' },
  },
});
const artifact = join(audit, 'contact.func');
for (const [name, file] of Object.entries(output.files)) {
  const destination = join(artifact, name);
  await mkdir(dirname(destination), { recursive: true });
  const blob = await FileBlob.fromStream({ stream: file.toStream() });
  await writeFile(destination, blob.data);
}
const manifest = {
  builder: `@vercel/node@${builderVersion}`,
  runtime: output.runtime,
  handler: output.handler.replaceAll('\\', '/'),
  files: Object.keys(output.files)
    .map((name) => name.replaceAll('\\', '/'))
    .sort(),
};
await writeFile(join(audit, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
const result = spawnSync(
  process.execPath,
  [join(root, 'scripts/check-function.mjs'), '--artifact', artifact],
  { cwd: root, stdio: 'inherit' },
);
if (result.error) throw result.error;
assert.equal(result.status, 0, 'Vercel artifact failed isolated Node smoke tests');
console.log(`Inspected artifact retained at: ${artifact}`);
