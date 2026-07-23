const fs=require('fs');
const wrap=b=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${b}</svg>`;
const G=(b,w=12)=>`<g fill="none" stroke="#000" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${b}</g>`;

// ---- A · Monograma EH ----
const A={
 'EH Fusión':wrap(G('<path d="M29 22 V78"/><path d="M71 22 V78"/><path d="M29 50 H71"/><path d="M29 22 H51"/><path d="M29 78 H51"/>',13)),
 'EH Bloque':wrap(G('<path d="M24 22 V78"/><path d="M50 22 V78"/><path d="M76 22 V78"/><path d="M24 22 H50"/><path d="M24 78 H50"/><path d="M24 50 H76"/>',13)),
 'EH Pilares':wrap(G('<path d="M28 20 V80"/><path d="M72 20 V80"/><path d="M28 34 H56"/><path d="M28 50 H72"/><path d="M28 66 H56"/>',12)),
 'EH Negativo':wrap('<defs><mask id="eh"><rect width="100" height="100" fill="#fff"/><g fill="none" stroke="#000" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M34 32 V68"/><path d="M66 32 V68"/><path d="M34 50 H66"/><path d="M34 32 H52"/><path d="M34 68 H52"/></g></mask></defs><rect x="2" y="2" width="96" height="96" rx="26" fill="#000" mask="url(#eh)"/>'),
};
// ---- B · Juego E<->Z ----
const B={
 'Espejo':wrap(G('<path d="M31 25 H69"/><path d="M31 75 H69"/><path d="M33 28 L67 72"/><path d="M67 28 L33 72"/>',12.5)),
 'Fusión Z':wrap(G('<path d="M30 26 H70"/><path d="M30 74 H70"/><path d="M34 30 L66 70"/>',13)),
 'Z protagonista':wrap(G('<path d="M32 26 H68 L32 74 H68"/>',14)),
 'Doble-Z':wrap(G('<path d="M30 26 H70 L30 50 H70"/><path d="M70 74 H30 L70 50 H30"/>',12)),
};
// ---- C · Pictórico conceptual ----
const C={
 'Dualidad H+M':wrap(G('<path d="M40 18 V82"/><path d="M60 24 C40 34 40 66 60 76"/>',13)),
 'Realidad Mixta':wrap('<rect x="20" y="26" width="46" height="46" rx="14" fill="none" stroke="#000" stroke-width="11"/><rect x="36" y="30" width="46" height="46" rx="14" fill="none" stroke="#000" stroke-width="11"/>'),
};
// ---- D · Construcción variada ----
const D={
 'Isométrico':wrap(G('<path d="M50 16 L82 34 L82 66 L50 84 L18 66 L18 34 Z"/><path d="M18 34 L50 52 L82 34"/><path d="M50 52 L50 84"/>',10)),
 'Matriz':wrap((()=>{let s='';for(let r=0;r<3;r++)for(let c=0;c<3;c++){const x=26+c*20,y=26+r*20,on=(r===c);s+=`<rect x="${x-7}" y="${y-7}" width="14" height="14" rx="4" fill="${on?'#000':'none'}" stroke="#000" stroke-width="${on?0:5}"/>`;}return s;})()),
 'Grano':wrap([[24,40],[38,66],[52,26],[66,58],[80,46]].map(([x,h])=>`<rect x="${x-5}" y="${50-h/2}" width="10" height="${h}" rx="5" fill="#000"/>`).join('')),
 'Circuito':wrap(G('<path d="M50 50 H26 M50 50 V26 M50 50 H74 V74"/>',9)+'<circle cx="50" cy="50" r="8"/><circle cx="26" cy="50" r="5"/><circle cx="50" cy="26" r="5"/><circle cx="74" cy="74" r="5"/>'),
 'Energía':wrap('<path d="M58 14 L30 52 L47 52 L42 86 L72 44 L54 44 Z" fill="#000"/>'),
 'Capas':wrap('<rect x="20" y="20" width="60" height="60" rx="20" fill="none" stroke="#000" stroke-width="9"/><rect x="32" y="32" width="36" height="36" rx="12" fill="none" stroke="#000" stroke-width="9"/><rect x="44" y="44" width="12" height="12" rx="4" fill="#000"/>'),
 'Corte':wrap('<defs><clipPath id="rs"><rect x="14" y="14" width="72" height="72" rx="22"/></clipPath></defs><g clip-path="url(#rs)"><rect x="14" y="14" width="72" height="72" fill="#000"/><path d="M2 60 L60 2 L74 2 L2 74 Z" fill="#fff"/><path d="M30 98 L98 30 L98 44 L44 98 Z" fill="#fff"/></g>'),
 'Onda':wrap(G('<path d="M16 50 Q33 20 50 50 T84 50"/>',12)),
 'Avance':wrap('<rect x="16" y="16" width="68" height="68" rx="22" fill="none" stroke="#000" stroke-width="9"/>'+G('<path d="M40 34 L58 50 L40 66"/>',11)),
};

const groups=[
 ['A · Monograma de letras — EH (Eisen + Holz)',A],
 ['B · Juego E ↔ Z — simetría de los extremos de EisenholZ',B],
 ['C · Pictórico conceptual — qué es la empresa',C],
 ['D · Construcción variada — estilos distintos',D],
];
const sec=([title,obj])=>{
 const cells=Object.entries(obj).map(([name,svg])=>`<div class=c><div class=art>${svg}</div><div class=lb>${name}</div></div>`).join('');
 return `<div class=sec><div class=h>${title}</div><div class=grid>${cells}</div></div>`;
};
const css=`*{margin:0;box-sizing:border-box}body{font-family:system-ui;background:#ececeb;padding:26px;color:#111}
h1{font:800 20px system-ui;max-width:1080px;margin:0 auto 6px}.subtitle{max-width:1080px;margin:0 auto 24px;color:#777;font-size:13px}
.sec{max-width:1080px;margin:0 auto 22px;background:#fff;border:1px solid #e4e4e2;border-radius:14px;overflow:hidden}
.h{font:800 13px system-ui;letter-spacing:.02em;padding:14px 18px;background:#111;color:#fff}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#eee}
.c{background:#fff;padding:20px 12px 12px;display:flex;flex-direction:column;align-items:center;gap:10px}
.art{width:84px;height:84px}.art svg{width:100%;height:100%}
.lb{font:600 12px system-ui;color:#333;text-align:center}`;
fs.writeFileSync('proofs/master.html',`<!doctype html><meta charset=utf8><style>${css}</style><h1>Eisenholz — Todas las opciones por enfoque creativo</h1><div class=subtitle>Todo monocromático, en el estilo de la marca. Los símbolos acompañan a tu logotipo real (no lo reemplazan).</div>${groups.map(sec).join('')}`);
console.log('master built');
