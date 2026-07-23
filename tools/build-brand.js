// Master build: emits the full Eisenholz logo system from shared geometry.
const opentype = require(process.env.OPENTYPE_PATH || "opentype.js"); // npm i opentype.js
const fs = require('fs');
const path = require('path');

const OUT = 'assets';
// ---- Brand tokens ----
const NAVY = '#0E2740';   // Eisen — steel/iron
const COPPER = '#C77B3C'; // Holz/conductor — copper warmth
const PAPER = '#F5F3EF';  // off-white
const INK_DARK = '#0A1A2E'; // dark bg reference

// ---- Shared geometry (100x100 icon box) ----
const HEX = '50,7 86,28.5 86,71.5 50,93 14,71.5 14,28.5';
const E_OPEN = 'M38 34 h24 v8 h-16 v16 h16 v8 h-24 Z';           // spine + top + bottom (middle open)
const E_FULL = 'M38 34 h24 v8 h-16 v8 h16 v8 h-16 v8 h16 v8 h-24 Z'; // all 3 arms (mono)
const COPPER_BAR = '<rect x="38" y="46" width="24" height="8" fill="'+COPPER+'"/>';

const svg = (vb, body, extra='') =>
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${extra}>\n${body}\n</svg>\n`;

// hexagon with rounded corners via same-color stroke
const hex = (fill) =>
  `<polygon points="${HEX}" fill="${fill}" stroke="${fill}" stroke-width="6" stroke-linejoin="round"`;

// ---- ICON: full color (navy hex, knockout E, copper bar) ----
function iconColor(id){
  return svg('0 0 100 100',
`  <defs><mask id="${id}"><rect width="100" height="100" fill="#fff"/><path d="${E_OPEN}" fill="#000"/></mask></defs>
  ${hex(NAVY)} mask="url(#${id})"/>
  ${COPPER_BAR}`);
}
// ---- ICON: reversed (paper hex, navy E, copper bar) for dark bg ----
function iconReversed(){
  return svg('0 0 100 100',
`  ${hex(PAPER)}/>
  <path d="${E_OPEN}" fill="${NAVY}"/>
  ${COPPER_BAR}`);
}
// ---- ICON: mono (single ink, knockout full E) ----
function iconMono(ink, id){
  return svg('0 0 100 100',
`  <defs><mask id="${id}"><rect width="100" height="100" fill="#fff"/><path d="${E_FULL}" fill="#000"/></mask></defs>
  ${hex(ink)} mask="url(#${id})"/>`);
}

// ---- Wordmark path ----
// Build each glyph at x=0 and offset its path commands manually. Passing a large
// x into opentype getPath() triggers a precision bug that emits NaN coordinates.
function wordmark(fontFile, text, size, trackEm){
  const buf = fs.readFileSync(path.join('assets/fonts', fontFile));
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset+buf.byteLength));
  const tracking = trackEm*size;
  let x=0; const cmds=[];
  const r = n => Math.round(n*1000)/1000;
  for(const g of font.stringToGlyphs(text)){
    const p = g.getPath(0,0,size);
    for(const c of p.commands){
      const o={type:c.type};
      if('x'  in c){o.x =r(c.x +x); o.y =r(c.y);}
      if('x1' in c){o.x1=r(c.x1+x); o.y1=r(c.y1);}
      if('x2' in c){o.x2=r(c.x2+x); o.y2=r(c.y2);}
      cmds.push(o);
    }
    x += (g.advanceWidth/font.unitsPerEm)*size + tracking;
  }
  const d = cmds.map(c=>{
    switch(c.type){
      case 'M': return `M${c.x} ${c.y}`;
      case 'L': return `L${c.x} ${c.y}`;
      case 'C': return `C${c.x1} ${c.y1} ${c.x2} ${c.y2} ${c.x} ${c.y}`;
      case 'Q': return `Q${c.x1} ${c.y1} ${c.x} ${c.y}`;
      case 'Z': return 'Z';
    }
  }).join('');
  const capH = (font.tables.os2?.sCapHeight || font.ascender*0.7)*(size/font.unitsPerEm);
  return { d, width:+(x-tracking).toFixed(2), capHeight:+capH.toFixed(2) };
}

const WM = wordmark('Montserrat-600.ttf','EISENHOLZ',100,0.09);
const WM_CAP = WM.capHeight; // ~70
// wordmark-only svg (baseline at 0, caps from -capH..0) -> viewBox y = -capH
function wordmarkSVG(fill){
  const pad=6;
  return svg(`0 ${-WM_CAP-pad} ${WM.width} ${WM_CAP+pad*2}`,
    `  <path d="${WM.d}" fill="${fill}"/>`);
}

// ---- Horizontal lockup ----
function horizontal(markFill, wordFill, markSVGInner, forDark){
  const markBox=100, gap=34;
  const wmH = 56; const wmScale = wmH/WM_CAP; const wmW = WM.width*wmScale;
  const total = markBox+gap+wmW;
  const wy = 50 + wmH/2; // baseline so caps center on 50
  const P = 14; // clear-space padding
  return svg(`${-P} ${-P} ${(total+2*P).toFixed(1)} ${(100+2*P).toFixed(1)}`,
`  <g>${markSVGInner}</g>
  <g transform="translate(${markBox+gap}, ${wy.toFixed(2)}) scale(${wmScale.toFixed(4)})">
    <path d="${WM.d}" fill="${wordFill}"/>
  </g>`);
}

// ---- Stacked lockup (mark centered above wordmark + tagline) ----
function stacked(wordFill, tagFill, markInner){
  const wmH=30; const wmScale=wmH/WM_CAP; const wmW=WM.width*wmScale;
  // tagline
  const tag = wordmark('Montserrat-500.ttf','INDUSTRIA · INTELIGENCIA · FUTURO',100,0.16);
  const tagH=8.2; const tagScale=tagH/tag.capHeight; const tagW=tag.width*tagScale;
  const W = Math.max(100, wmW, tagW) + 8; // include tagline width + breathing room
  const cx = W/2;
  const markSize=104; const markX=cx-markSize/2;
  const gap1=26, gap2=15;
  const wmY = markSize+gap1;      // wordmark cap-top
  const tagY = wmY+wmH+gap2;      // tagline cap-top
  const totalH = tagY+tagH+4;
  const P = 20; // clear-space padding
  return svg(`${-P} ${-P} ${(W+2*P).toFixed(1)} ${(totalH+2*P).toFixed(1)}`,
`  <g transform="translate(${markX.toFixed(2)},0) scale(${(markSize/100).toFixed(4)})">${markInner}</g>
  <g transform="translate(${(cx-wmW/2).toFixed(2)}, ${(wmY+wmH).toFixed(2)}) scale(${wmScale.toFixed(4)})"><path d="${WM.d}" fill="${wordFill}"/></g>
  <g transform="translate(${(cx-tagW/2).toFixed(2)}, ${(tagY+tagH).toFixed(2)}) scale(${tagScale.toFixed(4)})"><path d="${tag.d}" fill="${tagFill}"/></g>`);
}

// strip outer <svg> to reuse an icon's inner drawing (with unique mask id)
const inner = (full) => full.replace(/<svg[^>]*>\n?/,'').replace(/<\/svg>\n?/,'');

// ===== EMIT =====
const files = {};
files['eisenholz-icon.svg']              = iconColor('m1');
files['eisenholz-icon-reversed.svg']     = iconReversed();
files['eisenholz-icon-mono-navy.svg']    = iconMono(NAVY,'mn');
files['eisenholz-icon-mono-white.svg']   = iconMono('#FFFFFF','mw');
files['eisenholz-wordmark.svg']          = wordmarkSVG(NAVY);
files['eisenholz-wordmark-white.svg']    = wordmarkSVG(PAPER);
files['eisenholz-horizontal.svg']        = horizontal(NAVY,NAVY, inner(iconColor('h1')), false);
files['eisenholz-horizontal-reversed.svg']= horizontal(PAPER,PAPER, inner(iconReversed()), true);
files['eisenholz-stacked.svg']           = stacked(NAVY,COPPER, inner(iconColor('s1')));
files['eisenholz-stacked-reversed.svg']  = stacked(PAPER,COPPER, inner(iconReversed()));

for(const [name,content] of Object.entries(files)){
  fs.writeFileSync(path.join(OUT,name),content);
  console.log('wrote',name);
}
