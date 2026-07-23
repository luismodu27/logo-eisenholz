# Eisenholz — Identidad de Marca

Sistema de marca profesional para **Eisenholz**, empresa mexicana de tecnología
industrial (semiconductores, e-mobility, realidad mixta e inteligencia artificial),
con sede en Hermosillo, Sonora.

> **Industria · Inteligencia · Futuro**

Este sistema **respeta la identidad real** de Eisenholz: su logotipo tipográfico
techno, monolínea y monocromático. El logotipo maestro está vectorizado a partir de
su logo oficial, y se le suma un **símbolo original (monograma EH)** construido en el
mismo lenguaje.

## La identidad

El nombre une dos palabras alemanas: **Eisen** (hierro) y **Holz** (madera).

- **Símbolo EH** — el isotipo funde la **E** y la **H**, iniciales de *Eisen* y
  *Holz*. Comparten el asta izquierda y la barra central: un monograma geométrico
  que resume el nombre. Sirve para favicon, app y redes.
- **Simetría E ↔ Z** — en el logotipo, la "E" (inicio) y la "Z" espejada (final)
  hacen eco entre sí: una simetría deliberada que encierra la palabra *EisenholZ*.
- **Estilo** — techno, geométrico, de trazo constante (monolínea) y terminaciones
  totalmente redondeadas.

## Color — monocromático

| Token | Hex | Uso |
|------|------|-----|
| Negro | `#0A0A0A` | Color primario. Logotipo sobre fondos claros |
| Blanco | `#FFFFFF` | Reversa. Logotipo sobre fondos oscuros o de color |

Sin degradados ni colores adicionales. En fondos de color o fotografía se usa el
negro o el blanco sólido, nunca un tono intermedio.

## Entregables

### `assets/` — vectores maestros (SVG)

| Archivo | Descripción |
|--------|-------------|
| `eisenholz-wordmark.svg` / `-white.svg` | Logotipo (su logo real, vectorizado) |
| `eisenholz-horizontal.svg` / `-white.svg` | Lockup horizontal (badge + logotipo) |
| `eisenholz-stacked.svg` / `-white.svg` | Lockup vertical |
| `eisenholz-badge.svg` / `-white.svg` | Isotipo en contenedor (app icon) |
| `eisenholz-isotipo.svg` / `-white.svg` | Isotipo suelto — monograma EH |
| `favicon.svg` | Favicon vectorial |

Todo va **convertido a trazos**: los SVG no dependen de ninguna fuente instalada.

### `exports/png/` — PNG listos para usar

Exportaciones transparentes en varios tamaños, incluyendo un set de favicon
(16/32/48/180/512 px) y el logotipo/lockups a alta resolución.

### `docs/brand-guidelines.html`

Manual de identidad autocontenido: identidad, sistema, espacio de respeto, tamaños
mínimos, color y usos incorrectos. Se abre directamente en el navegador.

### `reference/`

Logo oficial descargado de eisenholz.com.mx y su versión vectorizada — la fuente de
verdad de la que parte todo el sistema.

## Uso correcto

- Respeta un **espacio de respeto** alrededor del logotipo igual a la altura de una
  barra de la "E".
- **Tamaño mínimo:** isotipo 16 px; logotipo 120 px de ancho.
- Elige la versión **reversa** (blanco) sobre fondos oscuros o de color.
- **Nunca** deformes, rotes, reduzcas el contraste ni apliques sombras/efectos.

## Reproducir / regenerar

```bash
# vectorizar el logo oficial (requiere: npm i potrace sharp)
#   -> genera reference/wordmark-traced.svg
node tools/trace-wordmark.js

# construir todo el sistema a partir del logotipo vectorizado
node tools/build-identity.js     # todos los SVG (logotipo, isotipo, badge, lockups)
node tools/build-guide.js        # manual de identidad HTML
node tools/export-png.js eisenholz-badge:512:t   # PNG (nombre:ancho:fondo)
```

- `tools/build-identity.js` — reconstruye el sistema desde el logotipo vectorizado y
  el monograma EH (geometría definida en el propio script).
- `tools/build-guide.js` — arma el manual de identidad (gráficos embebidos).
- `tools/export-png.js` / `render*.js` — rasterizan SVG/HTML con Chromium (Playwright).
