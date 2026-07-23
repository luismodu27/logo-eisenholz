const fs=require('fs');
const R=n=>fs.readFileSync('assets/'+n,'utf8');
const f600=fs.readFileSync('/tmp/f600.b64','utf8').trim();
const f500=fs.readFileSync('/tmp/f500.b64','utf8').trim();

const ICON=R('eisenholz-icon.svg');
const ICON_REV=R('eisenholz-icon-reversed.svg');
const ICON_MONO=R('eisenholz-icon-mono-navy.svg');
const ICON_MONOW=R('eisenholz-icon-mono-white.svg');
const HORIZ=R('eisenholz-horizontal.svg');
const HORIZ_REV=R('eisenholz-horizontal-reversed.svg');
const STACK=R('eisenholz-stacked.svg');
const WORD=R('eisenholz-wordmark.svg');

const hexTick=`<svg class="tick" viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,7 86,28.5 86,71.5 50,93 14,71.5 14,28.5" fill="none" stroke="currentColor" stroke-width="9"/></svg>`;

const CSS=`
@font-face{font-family:'EH Mont';font-weight:600;font-style:normal;font-display:swap;src:url(data:font/ttf;base64,${f600}) format('truetype');}
@font-face{font-family:'EH Mont';font-weight:500;font-style:normal;font-display:swap;src:url(data:font/ttf;base64,${f500}) format('truetype');}
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --steel:#0E2740; --copper:#C77B3C; --paper:#F5F3EF; --ink:#0A1A2E;
  --bg:#F5F3EF; --bg-2:#efece5; --surface:#ffffff; --fg:#0E2740; --muted:#5b6b7d;
  --line:rgba(14,39,64,.14); --line-strong:rgba(14,39,64,.28); --accent:#C77B3C;
  --hero-bg:#0A1A2E; --hero-fg:#F5F3EF;
}
@media (prefers-color-scheme:dark){:root{
  --bg:#0A1A2E; --bg-2:#0c2036; --surface:#102943; --fg:#EAE7E0; --muted:#8ea1b5;
  --line:rgba(234,231,224,.14); --line-strong:rgba(234,231,224,.26); --accent:#D8975B;
  --hero-bg:#081524; --hero-fg:#F5F3EF;
}}
:root[data-theme="light"]{
  --bg:#F5F3EF; --bg-2:#efece5; --surface:#ffffff; --fg:#0E2740; --muted:#5b6b7d;
  --line:rgba(14,39,64,.14); --line-strong:rgba(14,39,64,.28); --accent:#C77B3C;
  --hero-bg:#0A1A2E; --hero-fg:#F5F3EF;
}
:root[data-theme="dark"]{
  --bg:#0A1A2E; --bg-2:#0c2036; --surface:#102943; --fg:#EAE7E0; --muted:#8ea1b5;
  --line:rgba(234,231,224,.14); --line-strong:rgba(234,231,224,.26); --accent:#D8975B;
  --hero-bg:#081524; --hero-fg:#F5F3EF;
}
html{-webkit-text-size-adjust:100%}
body{font-family:'EH Mont',system-ui,sans-serif;font-weight:500;background:var(--bg);color:var(--fg);line-height:1.6;
  -webkit-font-smoothing:antialiased;letter-spacing:.005em}
.wrap{max-width:1120px;margin:0 auto;padding:0 28px}
svg{display:block}
.eyebrow{font-size:12px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:var(--accent);display:flex;align-items:center;gap:10px}
.tick{width:13px;height:13px;color:var(--accent);flex:none}
h1,h2,h3{font-weight:600;text-wrap:balance;letter-spacing:-.01em;line-height:1.12}
p{max-width:62ch}
.muted{color:var(--muted)}

/* HERO */
.hero{background:var(--hero-bg);color:var(--hero-fg);position:relative;overflow:hidden;border-bottom:1px solid var(--line-strong)}
.hero .inner{max-width:1120px;margin:0 auto;padding:88px 28px 76px;position:relative;z-index:2}
.hero .kicker{color:var(--copper);font-size:12px;font-weight:600;letter-spacing:.32em;text-transform:uppercase}
.hero-logo{margin:30px 0 40px}
.hero-logo svg{height:78px;width:auto}
.hero h1{font-size:clamp(30px,5vw,52px);max-width:16ch;color:var(--hero-fg)}
.hero .lede{color:#b9c5d3;margin-top:20px;font-size:clamp(15px,1.6vw,18px);max-width:52ch}
.hexfield{position:absolute;inset:0;z-index:1;opacity:.5}
.meta-row{display:flex;flex-wrap:wrap;gap:12px 34px;margin-top:40px;font-size:12.5px;color:#9fb0c1;letter-spacing:.04em}
.meta-row b{color:var(--copper);font-weight:600}

/* SECTION */
section{padding:74px 0}
section+section{border-top:1px solid var(--line)}
.sec-head{display:flex;flex-direction:column;gap:14px;margin-bottom:38px}
.sec-head h2{font-size:clamp(22px,3vw,30px)}
.sec-head p{color:var(--muted);font-size:15.5px}

/* concept */
.concept{display:grid;grid-template-columns:300px 1fr;gap:52px;align-items:center}
@media(max-width:760px){.concept{grid-template-columns:1fr;gap:32px}}
.concept .art{background:var(--bg-2);border:1px solid var(--line);border-radius:16px;padding:40px;display:flex;align-items:center;justify-content:center}
.concept .art svg{width:190px;height:190px}
.legend{display:flex;flex-direction:column;gap:22px;margin-top:6px}
.legend .item{display:flex;gap:14px;align-items:flex-start}
.chip{width:14px;height:14px;border-radius:4px;flex:none;margin-top:5px}
.legend h3{font-size:15px;margin-bottom:2px}
.legend p{font-size:14px;color:var(--muted)}

/* logo grid */
.grid{display:grid;gap:22px}
.g2{grid-template-columns:1fr 1fr}
.g3{grid-template-columns:repeat(3,1fr)}
.g4{grid-template-columns:repeat(4,1fr)}
@media(max-width:820px){.g3,.g4{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.g2,.g3,.g4{grid-template-columns:1fr}}
.tile{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--surface)}
.tile .stage{height:180px;display:flex;align-items:center;justify-content:center;padding:30px}
.tile .stage.light{background:var(--paper)}
.tile .stage.dark{background:var(--ink)}
.tile .stage.white{background:#fff}
.tile .stage.copper{background:var(--copper)}
.tile .stage svg{max-width:100%;max-height:100%}
.tile .cap{font-size:12px;color:var(--muted);padding:11px 15px;border-top:1px solid var(--line);display:flex;justify-content:space-between;letter-spacing:.02em}
.tile .cap b{color:var(--fg);font-weight:600}

/* clear space + min size */
.util{display:grid;grid-template-columns:1fr 1fr;gap:22px}
@media(max-width:760px){.util{grid-template-columns:1fr}}
.panel{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:26px}
.panel h3{font-size:14px;font-weight:600;margin-bottom:18px;letter-spacing:.02em}
.cs{position:relative;background:var(--bg-2);border-radius:10px;padding:34px;display:flex;align-items:center;justify-content:center}
.cs .box{position:relative;padding:34px}
.cs .box:before{content:"";position:absolute;inset:0;border:1px dashed var(--line-strong);border-radius:6px}
.cs .box:after{content:"E";position:absolute;top:-9px;left:-9px;width:18px;height:18px;font-size:11px;color:var(--accent);display:flex;align-items:center;justify-content:center;background:var(--bg-2);font-weight:600}
.cs .box svg{height:56px;width:auto;position:relative}
.minrow{display:flex;align-items:flex-end;gap:30px;flex-wrap:wrap;justify-content:center;padding:14px 0}
.minrow .m{display:flex;flex-direction:column;align-items:center;gap:10px}
.minrow .m .d{font-size:11px;color:var(--muted)}
.minrow .m svg{width:100%;height:100%}

/* color */
.swatches{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
@media(max-width:820px){.swatches{grid-template-columns:1fr 1fr}}
.sw{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--surface)}
.sw .fill{height:132px;display:flex;align-items:flex-end;padding:14px}
.sw .fill .hx{font-size:12px;font-weight:600;letter-spacing:.06em}
.sw .body{padding:14px 16px}
.sw .body .nm{font-size:14px;font-weight:600}
.sw .body .use{font-size:12px;color:var(--muted);margin-top:3px;line-height:1.5}
.sw .body .vals{font-size:11px;color:var(--muted);margin-top:8px;font-variant-numeric:tabular-nums;letter-spacing:.02em}

/* type */
.type{display:grid;grid-template-columns:230px 1fr;gap:44px;align-items:start}
@media(max-width:760px){.type{grid-template-columns:1fr;gap:28px}}
.aa{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:26px;text-align:center}
.aa .big{font-size:120px;font-weight:600;line-height:1;color:var(--fg)}
.aa .set{font-size:13px;color:var(--muted);letter-spacing:.14em;margin-top:14px;word-spacing:2px}
.aa .fam{margin-top:16px;font-size:12px;color:var(--accent);font-weight:600;letter-spacing:.16em;text-transform:uppercase}
.scale{display:flex;flex-direction:column;gap:2px}
.scale .r{display:flex;align-items:baseline;gap:20px;padding:14px 0;border-bottom:1px solid var(--line)}
.scale .r .lab{width:96px;flex:none;font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase}
.scale .r .spec{font-weight:600;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.scale .r .d{font-size:120px}.scale .r .h1{font-size:44px}.scale .r .h2{font-size:30px}
.scale .r .bd{font-size:17px;font-weight:500}.scale .r .cap{font-size:12px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:var(--accent)}

/* misuse */
.dont{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
@media(max-width:820px){.dont{grid-template-columns:1fr 1fr}}
.dont .d{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--surface)}
.dont .d .stage{height:130px;background:var(--paper);display:flex;align-items:center;justify-content:center;position:relative}
.dont .d .stage svg{height:56px;width:auto}
.dont .d .stage.dk{background:var(--ink)}
.dont .d .x{position:absolute;top:8px;right:10px;color:#c0392b;font-weight:700;font-size:16px}
.dont .d .cap{font-size:12px;color:var(--muted);padding:11px 14px;border-top:1px solid var(--line)}
.stretch svg{transform:scaleX(1.5)}
.rotate svg{transform:rotate(-13deg)}
.recolor svg{filter:hue-rotate(115deg) saturate(1.5)}
.shadow svg{filter:drop-shadow(3px 4px 3px rgba(0,0,0,.5))}

footer{padding:52px 0 64px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}
footer .fl{display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;align-items:center}
footer svg{height:24px;width:auto;opacity:.9}
@media(prefers-reduced-motion:no-preference){
  .reveal{opacity:0;transform:translateY(14px);animation:rise .7s cubic-bezier(.2,.7,.2,1) forwards}
  @keyframes rise{to{opacity:1;transform:none}}
}
`;

// decorative hex field for hero (canvas would be heavier; a few inline hexes, quiet)
const hexField=`<svg class="hexfield" viewBox="0 0 1200 460" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
  <g fill="none" stroke="#C77B3C" stroke-width="1.4" opacity="0.5">
   ${[0,1,2,3].map(r=>[0,1,2,3,4].map(c=>{const s=72,x=760+c*s*1.5,y=40+r*s*1.72+(c%2?s*0.86:0);return `<polygon points="${x},${y-s/1.6} ${x+s*0.7},${y-s/3.2} ${x+s*0.7},${y+s/3.2} ${x},${y+s/1.6} ${x-s*0.7},${y+s/3.2} ${x-s*0.7},${y-s/3.2}"/>`;}).join('')).join('')}
  </g></svg>`;

const BODY=`
<header class="hero">
  ${hexField}
  <div class="inner">
    <div class="kicker">Identidad de Marca · Manual</div>
    <div class="hero-logo reveal">${HORIZ_REV}</div>
    <h1>Hierro y madera. Precisión industrial e inteligencia que conducen al futuro.</h1>
    <p class="lede">Eisenholz une la fuerza del hierro (<i>Eisen</i>) con la calidez de la madera (<i>Holz</i>): una empresa mexicana de semiconductores, e-mobility, realidad mixta e inteligencia artificial. Este manual define cómo se construye y se usa su marca.</p>
    <div class="meta-row">
      <span><b>Sector</b> &nbsp;Tecnología industrial</span>
      <span><b>Origen</b> &nbsp;Hermosillo, Sonora</span>
      <span><b>Lema</b> &nbsp;Industria · Inteligencia · Futuro</span>
    </div>
  </div>
</header>

<main class="wrap">
  <section>
    <div class="sec-head">
      <div class="eyebrow">${hexTick} El concepto</div>
      <h2>Una letra, dos materiales, una historia</h2>
      <p>El símbolo es una <b>E</b> monograma alojada en un hexágono —el troquel de un chip y la cabeza de un tornillo a la vez—. El cuerpo en acero es el hierro; la barra central en cobre es el conductor: el material que da vida al semiconductor y, a la vez, el calor de la madera.</p>
    </div>
    <div class="concept">
      <div class="art">${ICON}</div>
      <div class="legend">
        <div class="item"><span class="chip" style="background:var(--steel)"></span><div><h3>Hexágono — Eisen / Industria</h3><p>Evoca el die de un semiconductor y una tuerca hexagonal: estructura, ingeniería y solidez.</p></div></div>
        <div class="item"><span class="chip" style="background:var(--copper)"></span><div><h3>Barra de cobre — Holz / Conducción</h3><p>El brazo central de la E es cobre: el conductor del chip y la calidez de la madera en un solo trazo.</p></div></div>
        <div class="item"><span class="chip" style="background:var(--muted)"></span><div><h3>La E que avanza</h3><p>Sus brazos apuntan al frente: movimiento, e-mobility y una marca orientada al futuro.</p></div></div>
      </div>
    </div>
  </section>

  <section>
    <div class="sec-head">
      <div class="eyebrow">${hexTick} El sistema</div>
      <h2>Lockups y versiones</h2>
      <p>Cuatro construcciones oficiales. Elige la versión según el fondo y el espacio disponible; nunca recrees el logotipo con otra tipografía o proporción.</p>
    </div>
    <div class="grid g2" style="margin-bottom:22px">
      <div class="tile"><div class="stage light">${HORIZ}</div><div class="cap"><b>Horizontal</b><span>primaria</span></div></div>
      <div class="tile"><div class="stage dark">${HORIZ_REV}</div><div class="cap"><b>Horizontal</b><span>reversa</span></div></div>
    </div>
    <div class="grid g4">
      <div class="tile"><div class="stage light">${STACK}</div><div class="cap"><b>Vertical</b><span>+ lema</span></div></div>
      <div class="tile"><div class="stage light">${ICON}</div><div class="cap"><b>Isotipo</b><span>color</span></div></div>
      <div class="tile"><div class="stage dark">${ICON_REV}</div><div class="cap"><b>Isotipo</b><span>reversa</span></div></div>
      <div class="tile"><div class="stage light">${WORD}</div><div class="cap"><b>Logotipo</b><span>solo</span></div></div>
    </div>
  </section>

  <section>
    <div class="sec-head">
      <div class="eyebrow">${hexTick} Aire y tamaños</div>
      <h2>Espacio de respeto y tamaño mínimo</h2>
      <p>Reserva alrededor del logotipo un margen igual a la altura de la <b>E</b> del símbolo. No lo uses por debajo de los tamaños mínimos: por debajo el detalle se pierde.</p>
    </div>
    <div class="util">
      <div class="panel"><h3>Espacio de respeto</h3>
        <div class="cs"><div class="box">${HORIZ}</div></div>
      </div>
      <div class="panel"><h3>Tamaño mínimo de uso</h3>
        <div class="minrow">
          <div class="m"><div style="width:120px;height:120px">${ICON}</div><div class="d">Isotipo · 24&nbsp;px</div></div>
          <div class="m"><div style="width:230px;height:auto">${HORIZ}</div><div class="d">Horizontal · 120&nbsp;px de ancho</div></div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="sec-head">
      <div class="eyebrow">${hexTick} Color</div>
      <h2>Paleta</h2>
      <p>Dos protagonistas —acero y cobre— sobre neutros cálidos. El cobre es acento: se reserva para detalles, nunca para grandes superficies de texto.</p>
    </div>
    <div class="swatches">
      <div class="sw"><div class="fill" style="background:#0E2740;color:#F5F3EF"><span class="hx">#0E2740</span></div><div class="body"><div class="nm">Eisen Steel</div><div class="use">Color primario. Símbolo, titulares, fondos.</div><div class="vals">RGB 14·39·64 &nbsp;·&nbsp; CMYK 78·61·36·38</div></div></div>
      <div class="sw"><div class="fill" style="background:#C77B3C;color:#1a1206"><span class="hx">#C77B3C</span></div><div class="body"><div class="nm">Holz Copper</div><div class="use">Acento. Barra conductora, detalles, lema.</div><div class="vals">RGB 199·123·60 &nbsp;·&nbsp; CMYK 18·56·85·5</div></div></div>
      <div class="sw"><div class="fill" style="background:#F5F3EF;color:#0E2740;border-bottom:1px solid var(--line)"><span class="hx">#F5F3EF</span></div><div class="body"><div class="nm">Paper</div><div class="use">Fondo claro y reversa del símbolo.</div><div class="vals">RGB 245·243·239 &nbsp;·&nbsp; CMYK 3·2·5·0</div></div></div>
      <div class="sw"><div class="fill" style="background:#0A1A2E;color:#F5F3EF"><span class="hx">#0A1A2E</span></div><div class="body"><div class="nm">Ink</div><div class="use">Fondo oscuro para reversa y UI.</div><div class="vals">RGB 10·26·46 &nbsp;·&nbsp; CMYK 84·66·41·54</div></div></div>
    </div>
  </section>

  <section>
    <div class="sec-head">
      <div class="eyebrow">${hexTick} Tipografía</div>
      <h2>Montserrat</h2>
      <p>Una geométrica sans de trazo constante: técnica, moderna y legible. Titulares en SemiBold; texto en Medium; etiquetas en mayúsculas con interletraje amplio.</p>
    </div>
    <div class="type">
      <div class="aa">
        <div class="big">Ee</div>
        <div class="set">ABCDEFGHIJKLM<br>NOPQRSTUVWXYZ<br>0123456789</div>
        <div class="fam">Montserrat</div>
      </div>
      <div class="scale">
        <div class="r"><span class="lab">Display</span><span class="spec d">Eisenholz</span></div>
        <div class="r"><span class="lab">Título</span><span class="spec h1">Industria e inteligencia</span></div>
        <div class="r"><span class="lab">Subtítulo</span><span class="spec h2">Tecnología para el futuro</span></div>
        <div class="r"><span class="lab">Cuerpo</span><span class="spec bd">Semiconductores, e-mobility, realidad mixta e IA.</span></div>
        <div class="r"><span class="lab">Etiqueta</span><span class="spec cap">Industria · Inteligencia · Futuro</span></div>
      </div>
    </div>
  </section>

  <section>
    <div class="sec-head">
      <div class="eyebrow">${hexTick} Uso incorrecto</div>
      <h2>Lo que nunca se hace</h2>
      <p>La consistencia protege la marca. Evita estas alteraciones del logotipo.</p>
    </div>
    <div class="dont">
      <div class="d"><div class="stage stretch"><span class="x">✕</span>${ICON}</div><div class="cap">No deformar ni estirar.</div></div>
      <div class="d"><div class="stage rotate"><span class="x">✕</span>${ICON}</div><div class="cap">No rotar ni inclinar.</div></div>
      <div class="d"><div class="stage recolor"><span class="x">✕</span>${ICON}</div><div class="cap">No cambiar los colores.</div></div>
      <div class="d"><div class="stage shadow"><span class="x">✕</span>${ICON}</div><div class="cap">No agregar sombras ni efectos.</div></div>
    </div>
  </section>
</main>

<footer class="wrap">
  <div class="fl">
    <div>${ICON_MONO.replace('<svg','<svg style="height:26px;width:26px;display:inline-block;vertical-align:middle"')} &nbsp; <span>Eisenholz · Manual de identidad</span></div>
    <div>eisenholz.com.mx · Hermosillo, Sonora</div>
  </div>
</footer>
`;

const STYLE=`<style>${CSS}</style>`;
// artifact fragment (no html/head/body)
fs.writeFileSync('/tmp/claude-0/-home-user-logo-eisenholz/2a7a26f4-410a-5c11-815c-f3d1c45694ca/scratchpad/brand-guidelines.html',
  `<title>Eisenholz — Manual de Identidad</title>\n${STYLE}\n${BODY}`);
// standalone for repo
fs.writeFileSync('docs/brand-guidelines.html',
  `<!doctype html><html lang="es"><head><meta charset="utf8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Eisenholz — Manual de Identidad</title>${STYLE}</head><body>${BODY}</body></html>`);
console.log('guide written (artifact fragment + repo standalone)');
