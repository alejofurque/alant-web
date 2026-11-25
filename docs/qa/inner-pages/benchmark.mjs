// Lighthouse (mobile default profile) for the inner pages, previous vs new build, two runs each.
// Usage: node docs/qa/inner-pages/benchmark.mjs <beforeBase> <afterBase>
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const cli = '.npm-cache/_npx/1722e863ebfd623b/node_modules/lighthouse/cli/index.js';
const [before, after] = process.argv.slice(2);
mkdirSync('artifacts/inner-pages-benchmark', { recursive: true });
const results = [];
for (const path of ['/servicios', '/estudio', '/contacto'])
  for (let run = 1; run <= 2; run++)
    for (const [variant, base] of [
      ['before', before],
      ['after', after],
    ]) {
      const output = `artifacts/inner-pages-benchmark/${variant}${path.replace('/', '-')}-${run}.json`;
      const p = spawnSync(
        process.execPath,
        [
          cli,
          base + path,
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
        path,
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
  'docs/qa/inner-pages/measurements.json',
  JSON.stringify({ node: process.version, before, after, results }, null, 2),
);
