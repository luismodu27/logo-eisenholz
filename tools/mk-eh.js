const fs=require('fs');
const wrap=b=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${b}</svg>`;
const G=(b,w=12)=>`<g fill="none" stroke="#000" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${b}</g>`;
const o={};

// 1 LIGADURA (refinada) — E spine + H leg share crossbar
o['1-ligadura']=wrap(G('<path d="M30 22 V78"/><path d="M70 22 V78"/><path d="M30 50 H70"/><path d="M30 22 H52"/><path d="M30 78 H52"/>',12));

// 2 ESPEJO-EH — E + mirrored-E; the H emerges between them (mirror play + EH)
o['2-espejo-eh']=wrap(G('<path d="M28 22 V78"/><path d="M72 22 V78"/><path d="M28 50 H72"/><path d="M28 22 H44"/><path d="M28 78 H44"/><path d="M56 22 H72"/><path d="M56 78 H72"/>',11));

// 3 APILADO — E over H, compact stacked monogram
o['3-apilado']=wrap(G('<path d="M36 20 H64"/><path d="M36 20 V40"/><path d="M36 30 H58"/><path d="M36 40 H64"/><path d="M36 56 V84"/><path d="M64 56 V84"/><path d="M36 70 H64"/>',9));

// 4 NEGATIVO — solid rounded square, EH carved out
o['4-negativo']=wrap('<defs><mask id="m"><rect width="100" height="100" fill="#fff"/><g fill="none" stroke="#000" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M33 34 V66"/><path d="M67 34 V66"/><path d="M33 50 H67"/><path d="M33 34 H50"/><path d="M33 66 H50"/></g></mask></defs><rect x="2" y="2" width="96" height="96" rx="26" fill="#000" mask="url(#m)"/>');

// 5 INTERLOCK — E and H overlap with an over/under weave
o['5-interlock']=wrap(
 G('<path d="M26 26 V74"/><path d="M26 26 H52"/><path d="M26 50 H46"/><path d="M26 74 H52"/>',11)+
 G('<path d="M74 26 V74"/><path d="M52 26 V74"/><path d="M52 50 H74"/>',11)
);

// 6 CÍRCULO — EH inside a ring
o['6-circulo']=wrap('<circle cx="50" cy="50" r="40" fill="none" stroke="#000" stroke-width="9"/>'+G('<path d="M38 38 V62"/><path d="M62 38 V62"/><path d="M38 50 H62"/><path d="M38 38 H52"/><path d="M38 62 H52"/>',8));

// 7 PILL — brand-style: EH from fully-rounded pill bars (matches their letters)
o['7-pill']=wrap('<g fill="#000">'+
 ['M','L'].map(()=>'').join('')+
 '<rect x="26" y="24" width="12" height="52" rx="6"/>'+   // E spine
 '<rect x="26" y="24" width="26" height="12" rx="6"/>'+   // E top
 '<rect x="26" y="44" width="40" height="12" rx="6"/>'+   // shared mid (E mid + H bar)
 '<rect x="26" y="64" width="26" height="12" rx="6"/>'+   // E bottom
 '<rect x="62" y="24" width="12" height="52" rx="6"/>'+   // H right leg
 '</g>');

// 8 SLAB — tall condensed bold EH
o['8-slab']=wrap(G('<path d="M34 18 V82"/><path d="M66 18 V82"/><path d="M34 50 H66"/><path d="M34 18 H54"/><path d="M34 82 H54"/>',16));

// 9 MONOLINE — single continuous elegant stroke E->H
o['9-monoline']=wrap(G('<path d="M52 26 H32 V74 H52 M32 50 H48 M68 26 V74 M68 50 H52"/>',9));

for(const k in o) fs.writeFileSync('eh/'+k+'.svg',o[k]);
console.log('eh built:',Object.keys(o).join(' '));
