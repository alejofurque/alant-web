// Genera la imagen fija del hero desde la escena 3D real, con fondo transparente.
// Uso: node scripts/qa/poster-escultura.mjs http://127.0.0.1:4212 <salida.png>
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { default: puppeteer } = await import(
  pathToFileURL(
    resolve(
      '.npm-cache/_npx/1722e863ebfd623b/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js',
    ),
  ).href
);
const [base = 'http://127.0.0.1:4212', salida = 'poster.png'] = process.argv.slice(2);
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--hide-scrollbars', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'],
});
const p = await b.newPage();
const errores = [];
p.on(
  'console',
  (m) =>
    ['error', 'warn'].includes(m.type()) && !m.text().includes('X4122') && errores.push(m.text()),
);
p.on('pageerror', (e) => errores.push(e.message));
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await p.goto(base + '/', { waitUntil: 'networkidle0' });
await p.waitForSelector('app-escultura canvas.visible', { timeout: 20000 });
await new Promise((r) => setTimeout(r, 2500));
await p.addStyleTag({
  content: `html, body, app-root, main, app-home, app-showcase, .hero, app-escultura { background: transparent !important; }
            app-escultura::before, app-escultura .nota { display: none !important; }`,
});
const lienzo = await p.$('app-escultura canvas');
await lienzo.screenshot({ path: salida, omitBackground: true });
await b.close();
console.log(JSON.stringify({ salida, errores }));
