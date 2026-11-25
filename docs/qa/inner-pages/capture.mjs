// Inner pages QA: full pages (static), section views with motion, console errors and overflow.
// Usage: node docs/qa/inner-pages/capture.mjs <baseUrl> <outDir> [prefix]
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const { default: puppeteer } = await import(
  pathToFileURL(
    resolve(
      '.npm-cache/_npx/1722e863ebfd623b/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js',
    ),
  ).href
);
const [base = 'http://127.0.0.1:4212', out = 'docs/qa/inner-pages', prefix = ''] =
  process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--hide-scrollbars', '--force-color-profile=srgb'],
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const report = { errors: [], overflow: [] };
const pages = { servicios: '/servicios', estudio: '/estudio', contacto: '/contacto' };

async function open(path, width, height, { reduced = false, mobile = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, isMobile: mobile, hasTouch: mobile });
  if (reduced)
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  page.on('console', (m) => {
    if (['error', 'warn'].includes(m.type())) report.errors.push(`${path} ${width}: ${m.text()}`);
  });
  page.on('pageerror', (e) => report.errors.push(`${path} ${width}: ${e.message}`));
  await page.goto(base + path, { waitUntil: 'networkidle0' });
  await page.evaluate(() => (document.documentElement.style.scrollBehavior = 'auto'));
  await wait(1600);
  return page;
}
// Walk the page in small steps so deferred blocks load and scroll effects pass every state.
const walk = (page, to) =>
  page.evaluate(
    (to) =>
      new Promise((done) => {
        const target = Math.min(to, document.documentElement.scrollHeight - innerHeight);
        const step = () => {
          const d = target - scrollY;
          if (Math.abs(d) < 2) return done(window.scrollTo(0, target));
          window.scrollBy(0, Math.sign(d) * Math.min(Math.abs(d), 80));
          requestAnimationFrame(step);
        };
        step();
      }),
    to,
  );
const topOf = (page, selector, offset = 76) =>
  page.evaluate(
    (s, o) => document.querySelector(s).getBoundingClientRect().top + scrollY - o,
    selector,
    offset,
  );

for (const [name, path] of Object.entries(pages)) {
  // Full page, reduced motion: the static composition every visitor can rely on.
  for (const [label, width, height, mobile] of [
    ['desktop', 1440, 900, false],
    ['mobile', 390, 844, true],
  ]) {
    const page = await open(path, width, height, { reduced: true, mobile });
    await walk(page, 1e6);
    await wait(500);
    await walk(page, 0);
    await page.screenshot({
      path: `${out}/${prefix}${name}-${label}-full.jpg`,
      fullPage: true,
      type: 'jpeg',
      quality: 78,
    });
    await page.screenshot({
      path: `${out}/${prefix}${name}-${label}-hero.jpg`,
      type: 'jpeg',
      quality: 85,
    });
    await page.close();
  }
  // Overflow sweep.
  for (const width of [1440, 1366, 768, 390, 360]) {
    const page = await open(path, width, 900, { mobile: width < 768 });
    await walk(page, 1e6);
    const extra = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (extra > 0) report.overflow.push(`${path} ${width}: +${extra}px`);
    await page.close();
  }
}

if (!prefix) {
  // Section views with motion active.
  const page = await open('/servicios', 1440, 900);
  for (const id of ['web', 'software', 'automatizacion']) {
    const y = await topOf(page, `#${id}`);
    await walk(page, y - 380);
    await page.screenshot({
      path: `${out}/servicios-${id}-entering.jpg`,
      type: 'jpeg',
      quality: 85,
    });
    await walk(page, y + 120);
    await wait(900);
    await page.screenshot({ path: `${out}/servicios-${id}.jpg`, type: 'jpeg', quality: 85 });
  }
  await page.close();
  const studio = await open('/estudio', 1440, 900);
  await walk(studio, await topOf(studio, '.perspective', 0));
  await wait(2200);
  await studio.screenshot({ path: `${out}/estudio-plano.jpg`, type: 'jpeg', quality: 85 });
  await studio.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
