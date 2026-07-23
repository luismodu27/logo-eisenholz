const fs = require('fs');
const R = n => fs.readFileSync('assets/' + n, 'utf8');
const WM = R('eisenholz-wordmark.svg');
const WM_W = R('eisenholz-wordmark-white.svg');
const ISO = R('eisenholz-isotipo.svg');
const BADGE = R('eisenholz-badge.svg');
const BADGE_W = R('eisenholz-badge-white.svg');
const HOR = R('eisenholz-horizontal.svg');
const HOR_W = R('eisenholz-horizontal-white.svg');
const STK = R('eisenholz-stacked.svg');
const DESC = R('eisenholz-lockup-descriptor.svg');
const DESC_W = R('eisenholz-lockup-descriptor-white.svg');

const tick = `<svg class="tick" viewBox="0 0 100 100" aria-hidden="true"><rect x="8" y="20" width="84" height="16" rx="8"/><rect x="8" y="42" width="84" height="16" rx="8"/><rect x="8" y="64" width="84" height="16" rx="8"/></svg>`;

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#F4F4F2; --surface:#ffffff; --fg:#0a0a0a; --muted:#6b6b6b;
  --line:rgba(0,0,0,.12); --line-2:rgba(0,0,0,.24); --ink:#0a0a0a; --paper:#F4F4F2;
}
@media(prefers-color-scheme:dark){:root{
  --bg:#0a0a0a; --surface:#151515; --fg:#f2f2f2; --muted:#9a9a9a;
  --line:rgba(255,255,255,.14); --line-2:rgba(255,255,255,.26);
}}
:root[data-theme="light"]{--bg:#F4F4F2;--surface:#fff;--fg:#0a0a0a;--muted:#6b6b6b;--line:rgba(0,0,0,.12);--line-2:rgba(0,0,0,.24)}
:root[data-theme="dark"]{--bg:#0a0a0a;--surface:#151515;--fg:#f2f2f2;--muted:#9a9a9a;--line:rgba(255,255,255,.14);--line-2:rgba(255,255,255,.26)}
html{-webkit-text-size-adjust:100%}
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--bg);color:var(--fg);line-height:1.6;-webkit-font-smoothing:antialiased}
svg{display:block}
.wrap{max-width:1080px;margin:0 auto;padding:0 28px}
.eyebrow{display:flex;align-items:center;gap:11px;font-size:11.5px;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:var(--fg)}
.tick{width:15px;height:15px;fill:var(--fg);flex:none}
h1,h2,h3{font-weight:700;line-height:1.1;text-wrap:balance;letter-spacing:-.01em}
p{max-width:64ch;color:var(--muted)}

.hero{background:var(--ink);color:#fff;border-bottom:1px solid var(--line-2)}
:root[data-theme="dark"] .hero{background:#000}
@media(prefers-color-scheme:dark){.hero{background:#000}}
.hero .in{max-width:1080px;margin:0 auto;padding:74px 28px 66px}
.hero .k{font-size:11.5px;font-weight:700;letter-spacing:.34em;text-transform:uppercase;color:#cfcfcf}
.hero .logo{margin:38px 0 8px}
.hero .logo svg{width:min(560px,86%);height:auto}
.hero .sub{margin-top:30px;color:#b9b9b9;font-size:clamp(15px,1.7vw,18px);max-width:52ch}
.metas{display:flex;flex-wrap:wrap;gap:10px 30px;margin-top:34px;font-size:12.5px;color:#9a9a9a;letter-spacing:.03em}
.metas b{color:#fff;font-weight:700}

section{padding:70px 0}
section+section{border-top:1px solid var(--line)}
.head{display:flex;flex-direction:column;gap:14px;margin-bottom:36px}
.head h2{font-size:clamp(22px,3vw,30px)}
.head p{font-size:15.5px}

.concept{display:grid;grid-template-columns:280px 1fr;gap:48px;align-items:center}
@media(max-width:760px){.concept{grid-template-columns:1fr;gap:30px}}
.concept .art{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:46px;display:flex;align-items:center;justify-content:center}
.concept .art svg{width:100%;height:auto}
.legend{display:flex;flex-direction:column;gap:20px}
.legend .it{display:flex;gap:14px}
.legend .n{font-weight:700;font-size:14px;letter-spacing:.02em;min-width:74px;flex:none;color:var(--fg)}
.legend p{font-size:14px}

.grid{display:grid;gap:20px}
.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:repeat(3,1fr)}
@media(max-width:820px){.g3{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.g2,.g3{grid-template-columns:1fr}}
.tile{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--surface)}
.tile .st{height:172px;display:flex;align-items:center;justify-content:center;padding:30px}
.tile .st.k{background:#0a0a0a}.tile .st.w{background:#fff}.tile .st.p{background:var(--paper)}
.tile .st svg{max-width:100%;max-height:100%}
.tile .cap{font-size:12px;color:var(--muted);padding:11px 15px;border-top:1px solid var(--line);display:flex;justify-content:space-between}
.tile .cap b{color:var(--fg);font-weight:700}

.util{display:grid;grid-template-columns:1fr 1fr;gap:20px}
@media(max-width:760px){.util{grid-template-columns:1fr}}
.panel{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:26px}
.panel h3{font-size:13px;letter-spacing:.03em;margin-bottom:18px}
.cs{background:var(--paper);border-radius:10px;padding:34px;display:flex;justify-content:center}
.cs .b{position:relative;padding:30px}
.cs .b:before{content:"";position:absolute;inset:0;border:1px dashed var(--line-2);border-radius:6px}
.cs .b svg{height:60px;width:auto}
.mins{display:flex;align-items:flex-end;gap:26px;justify-content:center;flex-wrap:wrap;padding:8px 0}
.mins .m{display:flex;flex-direction:column;align-items:center;gap:9px}
.mins .m .d{font-size:11px;color:var(--muted)}

.sw{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.sw .c{border:1px solid var(--line);border-radius:14px;overflow:hidden}
.sw .f{height:120px;display:flex;align-items:flex-end;padding:14px}
.sw .f .h{font-size:12px;font-weight:700;letter-spacing:.05em}
.sw .bd{padding:13px 16px}.sw .bd .nm{font-weight:700;font-size:14px}.sw .bd .u{font-size:12px;color:var(--muted);margin-top:3px}

.dont{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:820px){.dont{grid-template-columns:1fr 1fr}}
.dont .d{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--surface)}
.dont .d .st{height:120px;background:var(--paper);display:flex;align-items:center;justify-content:center;position:relative}
.dont .d .st svg{height:48px;width:auto}
.dont .d .x{position:absolute;top:8px;right:11px;color:#c0392b;font-weight:800;font-size:15px}
.dont .d .cap{font-size:12px;color:var(--muted);padding:10px 13px;border-top:1px solid var(--line)}
.str svg{transform:scaleX(1.5)}.rot svg{transform:rotate(-12deg)}
.out svg{opacity:.45}.sh svg{filter:drop-shadow(3px 4px 2px rgba(0,0,0,.5))}

footer{padding:46px 0 60px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}
footer .fl{display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;align-items:center}
footer .lm svg{height:22px;width:auto}
@media(prefers-reduced-motion:no-preference){.rev{opacity:0;transform:translateY(12px);animation:r .7s cubic-bezier(.2,.7,.2,1) forwards}@keyframes r{to{opacity:1;transform:none}}}
`;

const BODY = `
<header class="hero">
  <div class="in">
    <div class="k">Manual de Identidad</div>
    <div class="logo rev">${WM_W}</div>
    <p class="sub">Eisenholz — <i>Eisen</i> (hierro) + <i>Holz</i> (madera). Empresa mexicana de tecnología industrial: semiconductores, e-mobility, realidad mixta e inteligencia artificial.</p>
    <div class="metas">
      <span><b>Origen</b> &nbsp;Hermosillo, Sonora</span>
      <span><b>Áreas</b> &nbsp;Semiconductores · Electromovilidad · MRX</span>
      <span><b>Estilo</b> &nbsp;Techno monolínea · Monocromático</span>
    </div>
  </div>
</header>

<main class="wrap">
  <section>
    <div class="head">
      <div class="eyebrow">${tick} Identidad</div>
      <h2>Logotipo techno + monograma EH</h2>
      <p>La marca es un <b>logotipo tipográfico</b> de carácter techno —geométrico, monolínea y de terminaciones redondeadas— acompañado de un <b>símbolo EH</b> construido en el mismo lenguaje.</p>
    </div>
    <div class="concept">
      <div class="art">${BADGE}</div>
      <div class="legend">
        <div class="it"><div class="n">EH</div><p>El símbolo funde <b>E</b> y <b>H</b> — las iniciales de <i>Eisen</i> (hierro) y <i>Holz</i> (madera). Comparten el asta y la barra central: un monograma geométrico que resume el nombre.</p></div>
        <div class="it"><div class="n">E ↔ Z</div><p>En el logotipo, la "E" (inicio) y la "Z" espejada (final) hacen eco entre sí: una simetría deliberada que encierra la palabra <i>EisenholZ</i> completa.</p></div>
        <div class="it"><div class="n">Color</div><p>Monocromático: negro puro sobre claro, blanco sobre oscuro. Sin degradados ni colores adicionales.</p></div>
      </div>
    </div>
  </section>

  <section>
    <div class="head">
      <div class="eyebrow">${tick} El sistema</div>
      <h2>Logotipo, isotipo y lockups</h2>
      <p>El logotipo es autosuficiente. Bajo él, el descriptor <b>Semiconductores · Electromovilidad · MRX</b> se compone en <b>Chakra Petch</b> (techno de esquinas achaflanadas), la tipografía de apoyo. El isotipo —el monograma EH— sirve para favicon, app y redes.</p>
    </div>
    <div class="tile" style="margin-bottom:20px"><div class="st w" style="height:210px">${DESC}</div><div class="cap"><b>Lockup oficial</b><span>logotipo + descriptor</span></div></div>
    <div class="grid g2" style="margin-bottom:20px">
      <div class="tile"><div class="st w">${HOR}</div><div class="cap"><b>Horizontal</b><span>badge + logotipo</span></div></div>
      <div class="tile"><div class="st k">${HOR_W}</div><div class="cap"><b>Horizontal</b><span>reversa</span></div></div>
    </div>
    <div class="grid g3">
      <div class="tile"><div class="st w">${STK}</div><div class="cap"><b>Vertical</b><span>badge + logotipo</span></div></div>
      <div class="tile"><div class="st w">${BADGE}</div><div class="cap"><b>Isotipo</b><span>badge</span></div></div>
      <div class="tile"><div class="st p">${R('eisenholz-wordmark.svg')}</div><div class="cap"><b>Logotipo</b><span>solo</span></div></div>
    </div>
  </section>

  <section>
    <div class="head">
      <div class="eyebrow">${tick} Aire y tamaños</div>
      <h2>Espacio de respeto y tamaño mínimo</h2>
      <p>Deja alrededor del logotipo un margen igual a la altura de una barra de la "E". No lo uses por debajo de los tamaños mínimos.</p>
    </div>
    <div class="util">
      <div class="panel"><h3>ESPACIO DE RESPETO</h3><div class="cs"><div class="b">${WM}</div></div></div>
      <div class="panel"><h3>TAMAÑO MÍNIMO</h3><div class="mins">
        <div class="m"><div style="width:96px;height:96px">${BADGE}</div><div class="d">Isotipo · 16 px</div></div>
        <div class="m"><div style="width:230px">${WM}</div><div class="d">Logotipo · 120 px ancho</div></div>
      </div></div>
    </div>
  </section>

  <section>
    <div class="head">
      <div class="eyebrow">${tick} Color</div>
      <h2>Monocromático</h2>
      <p>La identidad vive en blanco y negro. Elige la versión según el contraste del fondo; en fondos de color o fotografía, usa el negro o el blanco sólido, nunca un tono intermedio.</p>
    </div>
    <div class="sw">
      <div class="c"><div class="f" style="background:#0a0a0a;color:#fff"><span class="h">#0A0A0A</span></div><div class="bd"><div class="nm">Negro</div><div class="u">Color primario. Logotipo sobre fondos claros.</div></div></div>
      <div class="c"><div class="f" style="background:#fff;color:#0a0a0a;border-bottom:1px solid var(--line)"><span class="h">#FFFFFF</span></div><div class="bd"><div class="nm">Blanco</div><div class="u">Reversa. Logotipo sobre fondos oscuros o de color.</div></div></div>
    </div>
  </section>

  <section>
    <div class="head">
      <div class="eyebrow">${tick} Uso incorrecto</div>
      <h2>Lo que nunca se hace</h2>
      <p>Mantén el logotipo tal como está. Evita estas alteraciones.</p>
    </div>
    <div class="dont">
      <div class="d"><div class="st str"><span class="x">✕</span>${WM}</div><div class="cap">No deformar ni estirar.</div></div>
      <div class="d"><div class="st rot"><span class="x">✕</span>${WM}</div><div class="cap">No rotar ni inclinar.</div></div>
      <div class="d"><div class="st out"><span class="x">✕</span>${WM}</div><div class="cap">No reducir el contraste.</div></div>
      <div class="d"><div class="st sh"><span class="x">✕</span>${WM}</div><div class="cap">No agregar sombras ni efectos.</div></div>
    </div>
  </section>
</main>

<footer class="wrap">
  <div class="fl">
    <div class="lm">${WM}</div>
    <div>eisenholz.com.mx · Hermosillo, Sonora</div>
  </div>
</footer>
`;

const STYLE = `<style>${CSS}</style>`;
fs.writeFileSync('/tmp/claude-0/-home-user-logo-eisenholz/2a7a26f4-410a-5c11-815c-f3d1c45694ca/scratchpad/brand-guidelines.html',
  `<title>Eisenholz — Manual de Identidad</title>\n${STYLE}\n${BODY}`);
fs.writeFileSync('docs/brand-guidelines.html',
  `<!doctype html><html lang="es"><head><meta charset="utf8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Eisenholz — Manual de Identidad</title>${STYLE}</head><body>${BODY}</body></html>`);
console.log('guide written');
