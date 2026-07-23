// Builds the Eisenholz identity system.
// Wordmark = their real logo (vectorized). Symbol = EH monogram (Eisen + Holz).
// Descriptor = "SEMICONDUCTORES - ELECTROMOVILIDAD - MRX" in Chakra Petch (matches
// the official lockup); converted to outlines so deliverables need no font.
const fs = require('fs');
const opentype = require(process.env.OPENTYPE_PATH || 'opentype.js'); // npm i opentype.js

const src = fs.readFileSync('assets/_wordmark-src.svg', 'utf8');
const WM_D = src.match(/<path[^>]*\bd="([^"]+)"/)[1];
const WM_VB = src.match(/viewBox="([^"]+)"/)[1];
const [, , WM_W, WM_H] = WM_VB.split(' ').map(Number);

const BLACK = '#000000';
const WHITE = '#FFFFFF';

// text -> outline path (glyphs built at x=0 and offset manually to avoid opentype's
// large-x NaN bug). Returns { d, width, capHeight } at the given font size.
function textPath(fontFile, text, size, trackEm) {
  const buf = fs.readFileSync('assets/fonts/' + fontFile);
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const tr = trackEm * size; let x = 0; const cmds = [];
  const r = n => Math.round(n * 1000) / 1000;
  for (const g of font.stringToGlyphs(text)) {
    for (const c of g.getPath(0, 0, size).commands) {
      const o = { type: c.type };
      if ('x' in c) { o.x = r(c.x + x); o.y = r(c.y); }
      if ('x1' in c) { o.x1 = r(c.x1 + x); o.y1 = r(c.y1); }
      if ('x2' in c) { o.x2 = r(c.x2 + x); o.y2 = r(c.y2); }
      cmds.push(o);
    }
    x += (g.advanceWidth / font.unitsPerEm) * size + tr;
  }
  const d = cmds.map(c => c.type === 'M' ? `M${c.x} ${c.y}` : c.type === 'L' ? `L${c.x} ${c.y}` :
    c.type === 'C' ? `C${c.x1} ${c.y1} ${c.x2} ${c.y2} ${c.x} ${c.y}` :
    c.type === 'Q' ? `Q${c.x1} ${c.y1} ${c.x} ${c.y}` : 'Z').join('');
  const capH = (font.tables.os2?.sCapHeight || font.ascender * 0.7) * (size / font.unitsPerEm);
  return { d, width: +(x - tr).toFixed(2), capHeight: +capH.toFixed(2) };
}
const DESCRIPTOR = 'SEMICONDUCTORES - ELECTROMOVILIDAD - MRX';

const svg = (vb, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">\n${body}\n</svg>\n`;

// EH monogram (Eisen + Holz) — E and H share the left spine + central crossbar.
// Monoline, rounded caps, bold weight to match the wordmark's letterforms.
function ehMark(color, sw = 13) {
  return `<g fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M29 22 V78"/><path d="M71 22 V78"/><path d="M29 50 H71"/><path d="M29 22 H51"/><path d="M29 78 H51"/></g>`;
}
// EH scaled/positioned inside a 100 box (transform scales stroke too)
function ehScaled(color, scale, tx, ty, sw = 13) {
  return `<g transform="translate(${tx},${ty}) scale(${scale})">${ehMark(color, sw)}</g>`;
}

// wordmark as nested <svg> at (x,y) with target height h
function wordmark(x, y, h, fill) {
  const w = h * (WM_W / WM_H);
  return { w, svg: `<svg x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" viewBox="${WM_VB}" overflow="visible"><path d="${WM_D}" fill="${fill}"/></svg>` };
}

const R = 26; // badge corner radius
const badge = (bg, eColor) => `<rect x="1" y="1" width="98" height="98" rx="${R}" fill="${bg}"/>\n  ${ehScaled(eColor, 0.62, 19, 19, 13)}`;

// ---- wordmark ----
fs.writeFileSync('assets/eisenholz-wordmark.svg',       svg(WM_VB, `  <path d="${WM_D}" fill="${BLACK}"/>`));
fs.writeFileSync('assets/eisenholz-wordmark-white.svg', svg(WM_VB, `  <path d="${WM_D}" fill="${WHITE}"/>`));

// ---- isotipo (bare EH monogram) ----
fs.writeFileSync('assets/eisenholz-isotipo.svg',       svg('0 0 100 100', '  ' + ehMark(BLACK)));
fs.writeFileSync('assets/eisenholz-isotipo-white.svg', svg('0 0 100 100', '  ' + ehMark(WHITE)));

// ---- badge (app icon) ----
fs.writeFileSync('assets/eisenholz-badge.svg',       svg('0 0 100 100', '  ' + badge(BLACK, WHITE)));
fs.writeFileSync('assets/eisenholz-badge-white.svg', svg('0 0 100 100', '  ' + badge(WHITE, BLACK)));
fs.writeFileSync('assets/favicon.svg',               svg('0 0 100 100', '  ' + badge(BLACK, WHITE)));

// ---- horizontal lockup: badge + wordmark ----
function horizontal(fill, bg, eColor) {
  const P = 8, box = 100, gap = 40, wmH = 60;
  const wy = (box - wmH) / 2;
  const wm = wordmark(box + gap, wy, wmH, fill);
  const total = box + gap + wm.w;
  return svg(`${-P} ${-P} ${(total + 2 * P).toFixed(1)} ${(100 + 2 * P).toFixed(1)}`,
    `  <g>${badge(bg, eColor)}</g>\n  ${wm.svg}`);
}
fs.writeFileSync('assets/eisenholz-horizontal.svg',       horizontal(BLACK, BLACK, WHITE));
fs.writeFileSync('assets/eisenholz-horizontal-white.svg', horizontal(WHITE, WHITE, BLACK));

// ---- stacked lockup: badge over wordmark ----
function stacked(fill, bg, eColor) {
  const P = 12, box = 116, gap = 40, wmH = 52;
  const wm0 = wordmark(0, 0, wmH, fill);
  const W = Math.max(box, wm0.w), cx = W / 2;
  const bScale = box / 100, bX = cx - box / 2;
  const wm = wordmark(cx - wm0.w / 2, box + gap, wmH, fill);
  const totalH = box + gap + wmH;
  const badgeG = `<g transform="translate(${bX.toFixed(2)},0) scale(${bScale.toFixed(4)})">${badge(bg, eColor)}</g>`;
  return svg(`${-P} ${-P} ${(W + 2 * P).toFixed(1)} ${(totalH + 2 * P).toFixed(1)}`,
    `  ${badgeG}\n  ${wm.svg}`);
}
fs.writeFileSync('assets/eisenholz-stacked.svg',       stacked(BLACK, BLACK, WHITE));
fs.writeFileSync('assets/eisenholz-stacked-white.svg', stacked(WHITE, WHITE, BLACK));

// ---- OFFICIAL descriptor lockup: wordmark + "SEMICONDUCTORES - ELECTROMOVILIDAD - MRX" ----
function descriptorLockup(fill) {
  const P = 10;
  const desc = textPath('ChakraPetch-500.ttf', DESCRIPTOR, 100, 0.14);
  const targetW = WM_W * 0.995;                 // descriptor spans ~full wordmark width
  const dScale = targetW / desc.width;
  const dCap = desc.capHeight * dScale;
  const gap = WM_H * 0.42;                       // space under the wordmark
  const dX = (WM_W - targetW) / 2;              // center
  const dY = WM_H + gap + dCap;                  // baseline
  const totalH = WM_H + gap + dCap;
  return svg(`${-P} ${-P} ${(WM_W + 2 * P).toFixed(1)} ${(totalH + 2 * P).toFixed(1)}`,
    `  <path d="${WM_D}" fill="${fill}"/>\n` +
    `  <g transform="translate(${dX.toFixed(2)}, ${dY.toFixed(2)}) scale(${dScale.toFixed(5)})"><path d="${desc.d}" fill="${fill}"/></g>`);
}
fs.writeFileSync('assets/eisenholz-lockup-descriptor.svg',       descriptorLockup(BLACK));
fs.writeFileSync('assets/eisenholz-lockup-descriptor-white.svg', descriptorLockup(WHITE));

console.log('Identity system (EH monogram + official descriptor) written.');
