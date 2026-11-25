// Local QA captures with the Chrome already installed and the puppeteer-core in the npx cache.
// Usage: node docs/qa/creative-direction/capture.mjs <baseUrl> <outDir> [shots|states]
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
const [base = 'http://127.0.0.1:4210', out = 'artifacts/qa', mode = 'shots'] =
  process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--hide-scrollbars', '--force-color-profile=srgb'],
});
const errors = [];

async function open(width, height, { reduced = false, mobile = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
  });
  if (reduced)
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  page.on(
    'console',
    (m) => ['error', 'warn'].includes(m.type()) && errors.push(`${width}: ${m.text()}`),
  );
  page.on('pageerror', (e) => errors.push(`${width}: ${e.message}`));
  await page.goto(base + '/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => (document.documentElement.style.scrollBehavior = 'auto'));
  await new Promise((r) => setTimeout(r, 1800));
  return page;
}
async function scrollTo(page, target) {
  await page.evaluate((t) => {
    let y =
      typeof t === 'number'
        ? t
        : document.querySelector(t).getBoundingClientRect().top +
          scrollY -
          (t.startsWith('#') ? 92 : 0);
    // Small steps let ScrollTrigger scrub through every intermediate state.
    y = Math.min(y, document.documentElement.scrollHeight - innerHeight);
    return new Promise((done) => {
      const step = () => {
        const d = y - scrollY;
        if (Math.abs(d) < 2) return done(window.scrollTo(0, y));
        window.scrollBy(0, Math.sign(d) * Math.min(Math.abs(d), 60));
        requestAnimationFrame(step);
      };
      step();
    });
  }, target);
  await new Promise((r) => setTimeout(r, 1300));
}
async function shot(page, name, full = false) {
  await page.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 86, fullPage: full });
}

if (mode === 'shots') {
  const desktop = await open(1440, 900);
  await shot(desktop, 'desktop-hero');
  for (const id of ['web', 'sistemas', 'automatizacion', 'soluciones', 'proceso']) {
    await scrollTo(desktop, `#${id}`);
    await shot(desktop, `desktop-${id}`);
  }
  await scrollTo(desktop, 99999);
  await shot(desktop, 'desktop-closing');
  await desktop.close();

  const laptop = await open(1366, 768);
  await shot(laptop, 'laptop-1366-hero');
  await scrollTo(laptop, '#sistemas');
  await shot(laptop, 'laptop-1366-sistemas');
  await laptop.close();

  const tablet = await open(768, 1024, { mobile: true });
  await shot(tablet, 'tablet-hero');
  await shot(tablet, 'tablet-full', true);
  await tablet.close();

  for (const width of [390, 360]) {
    const phone = await open(width, 844, { mobile: true });
    await shot(phone, `mobile-${width}-hero`);
    await scrollTo(phone, 700);
    await shot(phone, `mobile-${width}-stage`);
    for (const id of ['web', 'sistemas', 'soluciones', 'proceso', 'contacto']) {
      await scrollTo(phone, `#${id}`);
      await shot(phone, `mobile-${width}-${id}`);
    }
    await shot(phone, `mobile-${width}-full`, true);
    const overflow = await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (overflow > 0) errors.push(`${width}: horizontal overflow ${overflow}px`);
    await phone.close();
  }

  const reduced = await open(1440, 900, { reduced: true });
  await scrollTo(reduced, '#sistemas');
  await shot(reduced, 'desktop-reduced-sistemas');
  await reduced.close();
}

if (mode === 'states') {
  const page = await open(1440, 900);
  const report = [];
  for (const target of [0, '#web', '#sistemas', '#automatizacion', '#sistemas', 0]) {
    await scrollTo(page, target);
    report.push(
      await page.evaluate(() => ({
        y: Math.round(scrollY),
        state: document.querySelector('.stage').dataset.state,
        scrubbed: document.querySelector('.stage').classList.contains('is-scrubbed'),
        web: getComputedStyle(document.querySelector('.space .plane-web')).opacity,
        system: getComputedStyle(document.querySelector('.space .plane-system')).opacity,
        flow: getComputedStyle(document.querySelector('.space .plane-flow')).opacity,
      })),
    );
  }
  console.log(JSON.stringify(report, null, 1));
}

await browser.close();
console.log(
  errors.length ? `Console issues:\n${errors.join('\n')}` : 'No console errors or overflow.',
);
