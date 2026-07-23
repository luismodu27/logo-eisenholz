// Vectorizes the official Eisenholz logo (reference/eisenholz-logo-oficial.png)
// into a clean SVG. Requires: npm i potrace sharp
// Output: reference/wordmark-traced.svg  +  assets/_wordmark-src.svg
const path = process.env.TRACE_MODULES || '/tmp/trace/node_modules';
const sharp = require(path + '/sharp');
const potrace = require(path + '/potrace');
const fs = require('fs');

(async () => {
  const bmp = await sharp('reference/eisenholz-logo-oficial.png')
    .trim().flatten({ background: '#ffffff' })
    .resize({ width: 3000 })
    .threshold(128).toColourspace('b-w').png().toBuffer();

  potrace.trace(bmp, { turdSize: 100, optCurve: true, optTolerance: 0.2, alphaMax: 1.3, color: '#000000', background: 'transparent' },
    (err, svg) => {
      if (err) { console.error(err); process.exit(1); }
      fs.writeFileSync('reference/wordmark-traced.svg', svg);
      fs.writeFileSync('assets/_wordmark-src.svg', svg);
      console.log('Traced ->', svg.match(/viewBox="[^"]+"/)[0]);
    });
})();
