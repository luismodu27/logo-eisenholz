// Renders SVG or HTML files to PNG using Playwright + Chromium.
// Usage: NODE_PATH=/opt/node22/lib/node_modules node render.js <input> <output.png> [width] [height] [bg]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [,, input, output, w, h, bg] = process.argv;
  const abs = path.resolve(input);
  const content = fs.readFileSync(abs, 'utf8');
  const isSvg = abs.endsWith('.svg');
  const width = w ? parseInt(w) : null;
  const height = h ? parseInt(h) : null;
  const background = bg || 'transparent';

  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ deviceScaleFactor: 2 });

  if (isSvg) {
    const html = `<!doctype html><html><head><style>
      *{margin:0;padding:0}
      body{background:${background};display:flex;align-items:center;justify-content:center;${width?`width:${width}px;`:''}${height?`height:${height}px;`:''}}
      svg{display:block;${width?`max-width:${width}px;`:''}${height?`max-height:${height}px;`:''}}
    </style></head><body>${content}</body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle' });
  } else {
    await page.goto('file://' + abs, { waitUntil: 'networkidle' });
  }

  if (width && height) {
    await page.setViewportSize({ width, height });
    await page.screenshot({ path: output, omitBackground: background === 'transparent' });
  } else {
    const el = await page.$('svg') || await page.$('body');
    await el.screenshot({ path: output, omitBackground: background === 'transparent' });
  }
  await browser.close();
  console.log('Rendered', output);
})();
