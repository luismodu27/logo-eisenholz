// Batch export SVGs to PNG at given widths. Args: name:width:bg ...
const { chromium } = require('playwright');
const fs=require('fs');
(async()=>{
  const jobs=process.argv.slice(2);
  const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  for(const j of jobs){
    const [name,w,bg]=j.split(':');
    const svg=fs.readFileSync(`assets/${name}.svg`,'utf8');
    const vb=svg.match(/viewBox="([\d.\-\s]+)"/)[1].trim().split(/\s+/).map(Number);
    const W=parseInt(w), H=Math.round(W*vb[3]/vb[2]);
    const html=`<!doctype html><meta charset=utf8><style>*{margin:0;padding:0}body{background:${bg&&bg!=='t'?bg:'transparent'}}#w{width:${W}px;height:${H}px}#w svg{width:100%;height:100%;display:block}</style><div id="w">${svg}</div>`;
    const page=await browser.newPage({deviceScaleFactor:1});
    await page.setContent(html,{waitUntil:'networkidle'});
    const out=`exports/png/${name}-${W}${bg&&bg!=='t'?'-bg':''}.png`;
    await (await page.$('#w')).screenshot({path:out,omitBackground:!bg||bg==='t'});
    await page.close();
    console.log(out,`${W}x${H}`);
  }
  await browser.close();
})();
