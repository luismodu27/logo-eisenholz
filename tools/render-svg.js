// Reliable single-SVG -> PNG at a target pixel width, preserving aspect. Transparent unless bg given.
const { chromium } = require('playwright');
const fs=require('fs');
(async()=>{
  const [,, input, output, pxw, bg] = process.argv;
  const svg = fs.readFileSync(input,'utf8');
  const vb = svg.match(/viewBox="([\d.\-\s]+)"/)[1].trim().split(/\s+/).map(Number);
  const ratio = vb[2]/vb[3];
  const W = parseInt(pxw||'800'); const H = Math.round(W/ratio);
  const html=`<!doctype html><meta charset=utf8><style>*{margin:0;padding:0}
    body{background:${bg||'transparent'}}
    #wrap{width:${W}px;height:${H}px}#wrap svg{width:100%;height:100%;display:block}</style>
    <div id="wrap">${svg}</div>`;
  const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const page=await browser.newPage({deviceScaleFactor:2});
  await page.setContent(html,{waitUntil:'networkidle'});
  const el=await page.$('#wrap');
  await el.screenshot({path:output, omitBackground:!bg});
  await browser.close();
  console.log('rendered',output,`${W}x${H}`);
})();
