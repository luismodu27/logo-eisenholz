# Del dibujo a lápiz a la foto

Tres versiones generadas a partir del mismo escaneo, cada una con su script.

| Archivo | Qué es |
|---|---|
| `original.png` | Escaneo del dibujo a lápiz |
| `version-color.png` | Coloreado plano tipo cel, conservando el trazo |
| `version-render.png` | Render con materiales, luz e iluminación volumétrica |
| `version-hiperrealista.png` | Imagen fotorrealista generada con Stable Diffusion + ControlNet |

## 1. Color plano — `colorize.py`

1. **Line art**: se estima la iluminación del papel con un filtro de máximo +
   desenfoque gaussiano y se divide la imagen por ella; el papel queda blanco puro
   y se conserva todo el tono del grafito.
2. **Silueta**: relleno por inundación desde los bordes.
3. **Regiones**: polígonos aproximados por prenda usados como marcadores de un
   *watershed* sobre el mapa de grafito, de forma que los límites de color se
   ajustan solos a las líneas del lápiz.
4. **Composición**: color plano por región y el lápiz en modo multiplicar.

## 2. Render con materiales — `realism.py` (+ `geom.py`)

- **Separación línea/sombreado**: un filtro de mediana quita los trazos finos y
  deja el tono ancho. El tono se usa como modelado de la forma y las líneas pasan
  a ser pliegues y costuras.
- **Normales e iluminación**: del campo de tono se deriva un mapa de alturas y de
  ahí las normales; sobre eso, luz principal cálida, relleno frío, contraluz de
  borde y especular por material (Blinn-Phong).
- **Texturas procedurales**: sarga vaquera, lona, jersey de algodón, grano de
  piel, mechones de pelo, goma.
- **Acabado de cámara**: fondo de estudio, sombra de contacto, curva filmica,
  bloom, viñeteado y grano.

## 3. Fotorrealista — `generate.py`

Stable Diffusion 1.5 (checkpoint fotorrealista *Realistic Vision V6.0*) con
**ControlNet lineart** condicionado por el line art extraído del propio dibujo,
todo en CPU. La estructura, la pose y la ropa salen del dibujo; el fotorrealismo
lo pone el modelo.

1. Pase base a 512×816 con ControlNet (la pose y el encuadre quedan fijados por
   el dibujo) partiendo del render del paso 2, que ya aporta paleta y fondo.
2. Pase de escalado a 1.5× con baja intensidad, para detalle.
3. Pases locales de detalle sobre cara y las dos manos, recortando la zona,
   regenerándola a 512×512 y reintegrándola con máscara difuminada.

### Vestuario

Chaqueta de campaña de algodón verde oliva · camiseta de algodón blanca · chapas
militares · **guantes de piel negros sin dedos en ambas manos** · cinturón de
cuero marrón · vaqueros anchos azul medio · zapatillas de piel negras con suela
de goma crema · bolsa de lona al hombro.

> La mano derecha va **fuera del bolsillo**, colgando delante del muslo, con el
> mismo guante sin dedos que la izquierda: el guante cubre el dorso y la muñeca y
> los dedos quedan al aire. En el line art que alimenta a ControlNet se añaden
> los trazos del corte del guante, la costura de los nudillos y la correa de
> muñeca para que quede definido.

## Regenerar

```bash
pip install pillow numpy scipy scikit-image torch diffusers transformers accelerate
python3 dibujo/colorize.py     # color plano
python3 dibujo/realism.py      # render con materiales
python3 dibujo/generate.py     # fotorrealista (CPU: ~30 min, descarga ~6 GB de modelos)
```
