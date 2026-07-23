const fs=require('fs');
const P=(x,y)=>`${(+x).toFixed(2)} ${(+y).toFixed(2)}`;
// arc path centered cx,cy radius r from deg a0->a1 (SVG y-down); rounded via caps on stroke
function arc(cx,cy,r,a0,a1){
  const rad=d=>d*Math.PI/180;
  const x0=cx+r*Math.cos(rad(a0)),y0=cy+r*Math.sin(rad(a0));
  const x1=cx+r*Math.cos(rad(a1)),y1=cy+r*Math.sin(rad(a1));
  const large=Math.abs(a1-a0)>180?1:0, sweep=a1>a0?1:0;
  return `M${P(x0,y0)} A ${r} ${r} 0 ${large} ${sweep} ${P(x1,y1)}`;
}
const wrap=(body)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n${body}\n</svg>\n`;
const S=(d,w=12)=>`<path d="${d}" fill="none" stroke="#000" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// A — NUCLEO/SEÑAL: node + concentric signal/growth arcs (semiconductor · AI · señal)
{
 const cx=34,cy=66;
 const body=[
   arc(cx,cy,20,-82,2),arc(cx,cy,33,-82,2),arc(cx,cy,46,-82,2)
 ].map(d=>S(d,11)).join('\n')+`\n<circle cx="${cx}" cy="${cy}" r="8" fill="#000"/>`;
 fs.writeFileSync('creativo/A-senal.svg',wrap(body));
}
// B — DUALIDAD: iron beam (straight) + wood curve (organic hook) interlocked
{
 const body=[
   S('M40 18 V82',13),                        // iron vertical beam
   S('M60 24 C40 34 40 66 60 76',13)          // wood curve embracing it
 ].join('\n');
 fs.writeFileSync('creativo/B-dualidad.svg',wrap(body));
}
// C — CONVERGENCIA: three rounded strokes meeting at a central node (3 áreas -> 1)
{
 const cx=50,cy=52,node=8;
 const body=[
   S(`M20 22 C 34 34 42 42 ${cx-2} ${cy-2}`,11),
   S(`M80 22 C 66 34 58 42 ${cx+2} ${cy-2}`,11),
   S(`M50 86 L ${cx} ${cy+6}`,11)
 ].join('\n')+`\n<circle cx="${cx}" cy="${cy}" r="${node}" fill="#000"/>`;
 fs.writeFileSync('creativo/C-convergencia.svg',wrap(body));
}
// D — ÓRBITA: node + orbit ring (electromovilidad · energía · futuro)
{
 const body=[
   `<ellipse cx="50" cy="50" rx="42" ry="20" fill="none" stroke="#000" stroke-width="10" transform="rotate(-28 50 50)"/>`,
   `<circle cx="50" cy="50" r="11" fill="#000"/>`
 ].join('\n');
 fs.writeFileSync('creativo/D-orbita.svg',wrap(body));
}
// E — REALIDAD MIXTA: two overlapping rounded frames (planes) = mixing realities
{
 const body=[
   `<rect x="20" y="26" width="46" height="46" rx="14" fill="none" stroke="#000" stroke-width="11"/>`,
   `<rect x="36" y="30" width="46" height="46" rx="14" fill="none" stroke="#000" stroke-width="11"/>`
 ].join('\n');
 fs.writeFileSync('creativo/E-mixta.svg',wrap(body));
}
// F — CHIP: semiconductor die — rounded square + pins + core
{
 const body=[
   `<rect x="30" y="30" width="40" height="40" rx="13" fill="none" stroke="#000" stroke-width="11"/>`,
   S('M50 14 V30 M50 70 V86 M14 50 H30 M70 50 H86',10),
   `<circle cx="50" cy="50" r="7" fill="#000"/>`
 ].join('\n');
 fs.writeFileSync('creativo/F-chip.svg',wrap(body));
}
console.log('creativo built');
