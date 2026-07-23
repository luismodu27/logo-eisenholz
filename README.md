# Eisenholz — Identidad de Marca

Sistema de logotipo profesional para **Eisenholz**, empresa mexicana de tecnología
industrial (semiconductores, e-mobility, realidad mixta e inteligencia artificial),
con sede en Hermosillo, Sonora.

> **Industria · Inteligencia · Futuro**

## El concepto

El nombre une dos palabras alemanas: **Eisen** (hierro) y **Holz** (madera). El
logotipo traduce esa dualidad a un símbolo:

- **Hexágono en acero** — el *die* de un semiconductor y una tuerca hexagonal a la
  vez: ingeniería, estructura y solidez industrial (*Eisen*).
- **Barra central de cobre** — el brazo medio de la **E** es cobre: el conductor que
  da vida al chip y, al mismo tiempo, la calidez de la madera (*Holz*).
- **La E que avanza** — sus brazos apuntan al frente: movimiento, e-mobility y una
  marca orientada al futuro.

Una letra, dos materiales, una historia — legible desde una valla hasta un favicon de 24 px.

## Paleta

| Token | Hex | Uso |
|------|------|-----|
| Eisen Steel | `#0E2740` | Color primario: símbolo, titulares, fondos |
| Holz Copper | `#C77B3C` | Acento: barra conductora, detalles, lema |
| Paper | `#F5F3EF` | Fondo claro / reversa del símbolo |
| Ink | `#0A1A2E` | Fondo oscuro para reversa y UI |

## Tipografía

**Montserrat** (SIL Open Font License) — geométrica sans de trazo constante.
SemiBold (600) para titulares y el logotipo; Medium (500) para texto y lema. Los
archivos de origen están en [`assets/fonts/`](assets/fonts). En los SVG entregables
el logotipo va **convertido a trazos**, por lo que no dependen de la fuente instalada.

## Entregables

### `assets/` — vectores maestros (SVG)

| Archivo | Descripción |
|--------|-------------|
| `eisenholz-horizontal.svg` | Lockup horizontal (primario) |
| `eisenholz-horizontal-reversed.svg` | Horizontal para fondos oscuros |
| `eisenholz-stacked.svg` | Vertical + lema |
| `eisenholz-stacked-reversed.svg` | Vertical para fondos oscuros |
| `eisenholz-icon.svg` | Isotipo a color |
| `eisenholz-icon-reversed.svg` | Isotipo para fondos oscuros |
| `eisenholz-icon-mono-navy.svg` | Isotipo monocromo (una tinta) |
| `eisenholz-icon-mono-white.svg` | Isotipo monocromo en blanco |
| `eisenholz-wordmark.svg` / `-white.svg` | Solo logotipo |
| `favicon.svg` | Favicon vectorial |

### `exports/png/` — PNG listos para usar

Exportaciones transparentes en varios tamaños, incluyendo un set de favicon
(16/32/48/180/512 px) y app icons a 256/512/1024 px.

### `docs/brand-guidelines.html`

Manual de identidad autocontenido (fuentes y gráficos embebidos): concepto,
sistema de logotipos, espacio de respeto, tamaños mínimos, paleta, tipografía y
usos incorrectos. Se abre directamente en el navegador.

## Uso correcto

- Respeta un **espacio de respeto** alrededor del logotipo igual a la altura de la
  **E** del símbolo.
- **Tamaño mínimo:** isotipo 24 px; lockup horizontal 120 px de ancho.
- Elige la versión **reversa** sobre fondos oscuros o de color.
- **Nunca** deformes, rotes, recolorees ni apliques sombras/efectos al logotipo, ni
  lo recrees con otra tipografía.

## Reproducir / regenerar

Todo el sistema se genera a partir de una geometría compartida, de modo que cualquier
ajuste se propaga a todas las versiones de forma consistente.

```bash
export NODE_PATH=/opt/node22/lib/node_modules   # ubicación de playwright / opentype.js
node tools/build-brand.js     # regenera todos los SVG
node tools/build-guide.js     # regenera el manual HTML
node tools/export-png.js eisenholz-icon:512:t   # exporta PNG (nombre:ancho:fondo)
```

- `tools/build-brand.js` — construye cada SVG desde constantes de geometría y convierte
  el logotipo a trazos con `opentype.js`.
- `tools/build-guide.js` — arma el manual de identidad con fuentes y gráficos embebidos.
- `tools/export-png.js` / `render*.js` — rasterizan SVG/HTML a PNG con Chromium (Playwright).

---

Tipografía Montserrat © The Montserrat Project, bajo SIL Open Font License 1.1.
