# Versión a color del dibujo

- `original.png` — escaneo del dibujo a lápiz.
- `version-color.png` / `version-color.jpg` — versión coloreada (980×1564).
- `colorize.py` — script que genera la versión a color a partir del original.

## Cómo se hizo

1. **Limpieza del line art**: se estima la iluminación del papel con un filtro de
   máximo + desenfoque gaussiano y se divide la imagen por ella, de modo que el
   papel queda blanco puro y se conserva todo el tono del grafito.
2. **Silueta**: relleno por inundación desde los bordes para separar figura y fondo.
3. **Regiones**: polígonos aproximados por prenda (chaqueta, camiseta, vaqueros,
   pelo, piel, guantes, botas, bolsa…) usados como marcadores de un *watershed*
   sobre el mapa de grafito, de forma que los límites de color se ajustan solos a
   las líneas del lápiz.
4. **Composición**: color plano por región + el lápiz en modo multiplicar, con un
   tono de sombra distinto por material, luz principal arriba a la izquierda,
   sombra de contacto en el suelo y viñeteado cálido.

## Paleta

| Zona | Color |
|---|---|
| Chaqueta / manga | `#6E7357` |
| Cuello de la chaqueta | `#555A43` |
| Camiseta | `#E7E2D6` |
| Vaqueros | `#6E87A9` |
| Cinturón | `#6B4A33` |
| Piel | `#F3C7A6` |
| Pelo | `#2F2C34` |
| Guantes | `#34353C` |
| Botas / suela | `#2B2E35` / `#DFDACC` |
| Bolsa | `#7B6A4C` |

## Regenerar

```bash
pip install pillow numpy scipy scikit-image
python3 dibujo/colorize.py   # desde la raíz del repo
```
