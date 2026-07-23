const fs=require('fs');
const wrap=b=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n${b}\n</svg>\n`;
const S=(d,w=11,extra='')=>`<path d="${d}" fill="none" stroke="#000" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const F=d=>`<path d="${d}" fill="#000"/>`;
const R=(x,y,w,h,r)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#000"/>`;
const RO=(x,y,w,h,r,sw=10)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="#000" stroke-width="${sw}"/>`;
const out={};

// 1 ISOMÉTRICO — cube (depth / material block / MR)
out['1-cubo']=wrap([
 S('M50 16 L82 34 L82 66 L50 84 L18 66 L18 34 Z',10),
 S('M18 34 L50 52 L82 34',10),
 S('M50 52 L50 84',10)
].join('\n'));

// 2 MATRIZ — 3x3 chip array, diagonal highlighted
out['2-matriz']=wrap((()=>{let s='';for(let r=0;r<3;r++)for(let c=0;c<3;c++){const x=26+c*20,y=26+r*20;const on=(r===c);s+=`<rect x="${x-7}" y="${y-7}" width="14" height="14" rx="4" fill="${on?'#000':'none'}" stroke="#000" stroke-width="${on?0:5}"/>`;}return s;})());

// 3 GRANO — vertical bars of varying height (wood grain / equalizer / signal)
out['3-grano']=wrap([[24,40],[38,66],[52,26],[66,58],[80,46]].map(([x,h])=>`<rect x="${x-5}" y="${50-h/2}" width="10" height="${h}" rx="5" fill="#000"/>`).join('\n'));

// 4 CIRCUITO — central node + orthogonal traces with end nodes
out['4-circuito']=wrap([
 S('M50 50 H26 M50 50 V26 M50 50 H74 V74',9),
 `<circle cx="50" cy="50" r="8" fill="#000"/>`,
 `<circle cx="26" cy="50" r="5" fill="#000"/><circle cx="50" cy="26" r="5" fill="#000"/><circle cx="74" cy="74" r="5" fill="#000"/>`
].join('\n'));

// 5 ENERGÍA — bold forward bolt (electromovilidad)
out['5-energia']=wrap(F('M58 14 L30 52 L47 52 L42 86 L72 44 L54 44 Z'));

// 6 CAPAS — 3 concentric rounded squares (aperture / MR / depth)
out['6-capas']=wrap([RO(20,20,60,60,20,9),RO(32,32,36,36,12,9),R(44,44,12,12,4)].join('\n'));

// 7 CORTE — solid rounded square split by a diagonal gap (iron/wood duality)
out['7-corte']=wrap(`<defs><clipPath id="rs"><rect x="14" y="14" width="72" height="72" rx="22"/></clipPath></defs>
<g clip-path="url(#rs)"><rect x="14" y="14" width="72" height="72" fill="#000"/>
<path d="M2 60 L60 2 L74 2 L2 74 Z" fill="#fff"/><path d="M30 98 L98 30 L98 44 L44 98 Z" fill="#fff"/></g>`);

// 8 ONDA — bold pulse/sine wave (AI / signal)
out['8-onda']=wrap(S('M16 50 Q33 20 50 50 T84 50',12));

// 9 FLECHA — faceted forward chevrons in a rounded frame (motion/future)
out['9-flecha']=wrap([RO(16,16,68,68,22,9),S('M40 34 L58 50 L40 66',11)].join('\n'));

for(const k in out) fs.writeFileSync('v2/'+k+'.svg',out[k]);
console.log('v2 built:',Object.keys(out).join(' '));
