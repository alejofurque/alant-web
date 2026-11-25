// Records real scroll and hover interactions (Chrome screencast, encoded by ffmpeg).
// Usage: node docs/qa/creative-direction/record.mjs <baseUrl> <outDir>
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';

const { default: puppeteer } = await import(
  pathToFileURL(
    resolve(
      '.npm-cache/_npx/1722e863ebfd623b/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js',
    ),
  ).href
);
const [base = 'http://127.0.0.1:4212', out = 'docs/qa/creative-direction'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--hide-scrollbars'],
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// Eased wheel-like scrolling so the recording shows what a person sees.
const glide = (page, to, ms) =>
  page.evaluate(
    (to, ms) =>
      new Promise((done) => {
        const from = scrollY;
        const target = Math.min(to, document.documentElement.scrollHeight - innerHeight);
        const t0 = performance.now();
        const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const frame = (now) => {
          const t = Math.min(1, (now - t0) / ms);
          window.scrollTo(0, from + (target - from) * ease(t));
          t < 1 ? requestAnimationFrame(frame) : done();
        };
        requestAnimationFrame(frame);
      }),
    to,
    ms,
  );
const top = (page, selector) =>
  page.evaluate(
    (s) => document.querySelector(s).getBoundingClientRect().top + scrollY - 92,
    selector,
  );

async function record(name, width, height, script, mobile = false) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, isMobile: mobile, hasTouch: mobile });
  const recorder = await page.screencast({ path: `${out}/${name}.webm` });
  await page.goto(base + '/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => (document.documentElement.style.scrollBehavior = 'auto'));
  await script(page);
  await recorder.stop();
  await page.close();
}

const only = process.argv[4];
if (only !== 'mobile')
  await record('desktop-interactions', 1440, 900, async (page) => {
    await wait(2600); // Intro: headline, dimension line and planes rising.
    for (const [x, y] of [
      [1000, 420],
      [1180, 560],
      [880, 640],
    ]) {
      await page.mouse.move(x, y, { steps: 18 });
      await wait(500);
    }
    await page.mouse.move(300, 694, { steps: 12 });
    await wait(700);
    await page.mouse.move(300, 749, { steps: 6 });
    await wait(700);
    for (const id of ['#web', '#sistemas', '#automatizacion']) {
      await glide(page, await top(page, id), 2200);
      await wait(1400);
    }
    await glide(page, await top(page, '#web'), 2400); // Reverse scrubbing.
    await wait(900);
    await glide(page, await top(page, '#soluciones'), 2600);
    await wait(1200);
    await glide(page, await top(page, '#proceso'), 1800);
    await glide(page, (await top(page, '#proceso')) + 600, 1800);
    await wait(800);
    await glide(page, 99999, 2600);
    await wait(1200);
  });

await record(
  'mobile-interactions',
  390,
  844,
  async (page) => {
    await wait(2400);
    for (const y of [700, 1500, 2300, 3400, 5000, 99999]) {
      await glide(page, y, 1600);
      await wait(900);
    }
  },
  true,
);

await browser.close();
console.log('Recorded desktop-interactions.webm and mobile-interactions.webm');
