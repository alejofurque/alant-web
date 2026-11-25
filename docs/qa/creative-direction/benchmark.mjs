// Lighthouse (mobile default profile) on two local static builds, three runs each, same settings.
// Usage: node docs/qa/creative-direction/benchmark.mjs <beforeUrl> <afterUrl>
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const cli = '.npm-cache/_npx/1722e863ebfd623b/node_modules/lighthouse/cli/index.js';
const [before, after] = process.argv.slice(2);
mkdirSync('artifacts/creative-direction-benchmark', { recursive: true });
const results = [];
for (let run = 1; run <= 3; run++)
  for (const [variant, url] of [
    ['before', before],
    ['after', after],
  ]) {
    const output = `artifacts/creative-direction-benchmark/${variant}-${run}.json`;
    const p = spawnSync(
      process.execPath,
      [
        cli,
        url,
        '--output=json',
        `--output-path=${output}`,
        '--chrome-flags=--headless',
        '--quiet',
      ],
      { encoding: 'utf8', timeout: 180000 },
    );
    if (p.status !== 0) throw Error(p.stderr || String(p.error));
    const r = JSON.parse(readFileSync(output, 'utf8'));
    const a = r.audits;
    const item = {
      variant,
      run,
      performance: Math.round(r.categories.performance.score * 100),
      accessibility: Math.round(r.categories.accessibility.score * 100),
      bestPractices: Math.round(r.categories['best-practices'].score * 100),
      seo: Math.round(r.categories.seo.score * 100),
      fcpMs: Math.round(a['first-contentful-paint'].numericValue),
      lcpMs: Math.round(a['largest-contentful-paint'].numericValue),
      tbtMs: Math.round(a['total-blocking-time'].numericValue),
      cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(4)),
      transferKb: Math.round(a['total-byte-weight'].numericValue / 1024),
    };
    results.push(item);
    console.log(JSON.stringify(item));
  }
writeFileSync(
  'docs/qa/creative-direction/measurements.json',
  JSON.stringify({ node: process.version, before, after, results }, null, 2),
);
