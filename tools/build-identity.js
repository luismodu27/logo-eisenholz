// Builds the Eisenholz identity system.
// Wordmark = their real logo (vectorized). Symbol = EH monogram (Eisen + Holz).
const fs = require('fs');

const src = fs.readFileSync('assets/_wordmark-src.svg', 'utf8');
const WM_D = src.match(/<path[^>]*\bd="([^"]+)"/)[1];
const WM_VB = src.match(/viewBox="([^"]+)"/)[1];
const [, , WM_W, WM_H] = WM_VB.split(' ').map(Number);

const BLACK = '#000000';
const WHITE = '#FFFFFF';

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

console.log('Identity system (EH monogram) written.');
