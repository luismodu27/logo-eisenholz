// Builds the faithful monochrome Eisenholz identity system.
// Wordmark = their real logo (vectorized). Isotipo = their exact three-bar "E".
const fs = require('fs');

// ---- source wordmark (traced from official logo) ----
const src = fs.readFileSync('assets/_wordmark-src.svg', 'utf8');
const WM_D = src.match(/<path[^>]*\bd="([^"]+)"/)[1];
const WM_VB = src.match(/viewBox="([^"]+)"/)[1];       // "0 0 3000 303"
const [, , WM_W, WM_H] = WM_VB.split(' ').map(Number);  // 3000 x 303

const BLACK = '#000000';
const WHITE = '#FFFFFF';

const svg = (vb, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">\n${body}\n</svg>\n`;

// exact E-bar ratios measured from the official logo:
//   thickness t, length 5.93t, cap-height 5.62t, bar spacing 2.32t
function eBars(cx, cy, length, fill) {
  const t = length / 5.93, sp = t * 2.32, x0 = cx - length / 2;
  return [cy - sp, cy, cy + sp].map(c =>
    `<rect x="${x0.toFixed(2)}" y="${(c - t / 2).toFixed(2)}" width="${length.toFixed(2)}" height="${t.toFixed(2)}" rx="${(t / 2).toFixed(2)}" fill="${fill}"/>`
  ).join('\n  ');
}

// wordmark as a nested <svg> placed at (x,y) with target height h
function wordmark(x, y, h, fill) {
  const w = h * (WM_W / WM_H);
  return { w, svg: `<svg x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" viewBox="${WM_VB}" overflow="visible"><path d="${WM_D}" fill="${fill}"/></svg>` };
}

// ---- wordmark files ----
fs.writeFileSync('assets/eisenholz-wordmark.svg',       svg(WM_VB, `  <path d="${WM_D}" fill="${BLACK}"/>`));
fs.writeFileSync('assets/eisenholz-wordmark-white.svg', svg(WM_VB, `  <path d="${WM_D}" fill="${WHITE}"/>`));

// ---- isotipo: bare three-bar E (100 box) ----
fs.writeFileSync('assets/eisenholz-isotipo.svg',       svg('0 0 100 100', '  ' + eBars(50, 50, 71.2, BLACK)));
fs.writeFileSync('assets/eisenholz-isotipo-white.svg', svg('0 0 100 100', '  ' + eBars(50, 50, 71.2, WHITE)));

// ---- badge (app-icon): rounded square + E ----
const R = 26;
fs.writeFileSync('assets/eisenholz-badge.svg', svg('0 0 100 100',
  `  <rect x="1" y="1" width="98" height="98" rx="${R}" fill="${BLACK}"/>\n  ${eBars(50, 50, 50, WHITE)}`));
fs.writeFileSync('assets/eisenholz-badge-white.svg', svg('0 0 100 100',
  `  <rect x="1" y="1" width="98" height="98" rx="${R}" fill="${WHITE}"/>\n  ${eBars(50, 50, 50, BLACK)}`));
fs.writeFileSync('assets/favicon.svg', svg('0 0 100 100',
  `  <rect x="1" y="1" width="98" height="98" rx="${R}" fill="${BLACK}"/>\n  ${eBars(50, 50, 50, WHITE)}`));

// ---- horizontal lockup: badge + wordmark ----
function horizontal(fill, badgeFill, eFill) {
  const P = 8, badge = 100, gap = 40, wmH = 60;
  const wy = (badge - wmH) / 2;
  const wm = wordmark(badge + gap, wy, wmH, fill);
  const totalW = badge + gap + wm.w;
  const badgeSvg = `<rect x="1" y="1" width="98" height="98" rx="${R}" fill="${badgeFill}"/>\n  ${eBars(50, 50, 50, eFill)}`;
  return svg(`${-P} ${-P} ${(totalW + 2 * P).toFixed(1)} ${(100 + 2 * P).toFixed(1)}`,
    `  <g>${badgeSvg}</g>\n  ${wm.svg}`);
}
fs.writeFileSync('assets/eisenholz-horizontal.svg',       horizontal(BLACK, BLACK, WHITE));
fs.writeFileSync('assets/eisenholz-horizontal-white.svg', horizontal(WHITE, WHITE, BLACK));

// ---- stacked lockup: badge over wordmark ----
function stacked(fill, badgeFill, eFill) {
  const P = 12, badge = 116, gap = 40, wmH = 52;
  const wm0 = wordmark(0, 0, wmH, fill);
  const W = Math.max(badge, wm0.w);
  const cx = W / 2;
  const badgeX = cx - badge / 2;
  const wm = wordmark(cx - wm0.w / 2, badge + gap, wmH, fill);
  const totalH = badge + gap + wmH;
  const badgeSvg = `<g transform="translate(${badgeX.toFixed(2)},0) scale(${(badge / 100).toFixed(4)})"><rect x="1" y="1" width="98" height="98" rx="${R}" fill="${badgeFill}"/>\n  ${eBars(50, 50, 50, eFill)}</g>`;
  return svg(`${-P} ${-P} ${(W + 2 * P).toFixed(1)} ${(totalH + 2 * P).toFixed(1)}`,
    `  ${badgeSvg}\n  ${wm.svg}`);
}
fs.writeFileSync('assets/eisenholz-stacked.svg',       stacked(BLACK, BLACK, WHITE));
fs.writeFileSync('assets/eisenholz-stacked-white.svg', stacked(WHITE, WHITE, BLACK));

console.log('Identity system written.');
