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

## 3. Fotorrealista — `pipeline/`

Stable Diffusion 1.5 (checkpoint fotorrealista *Realistic Vision V6.0*) con
**ControlNet lineart** condicionado por el line art extraído del propio dibujo,
todo en CPU. La estructura, la pose y la ropa salen del dibujo; el fotorrealismo
lo pone el modelo.

Se ejecutó en cuatro etapas encadenadas, cada una sobre la salida de la anterior
(`pipeline/`, en este orden). `generate.py` en la raíz reúne las dos primeras.

1. `gen.py` — pase base a 512×816 con ControlNet. La pose y el encuadre quedan
   fijados por el dibujo; parte del render del paso 2, que ya aporta paleta y fondo.
2. `refine.py` — escalado a 1.5× con baja intensidad y pases locales de detalle
   sobre cara y manos, recortando la zona, regenerándola a 512×512 y
   reintegrándola con máscara difuminada.
3. `hands.py` — inpainting enmascarado de ambas manos. Las máscaras salen de las
   regiones del propio dibujo (`geom.py`), no de una caja a ojo.
4. `finish.py` — el guante sin dedos de la mano derecha se construye
   geométricamente sobre la mano fotográfica (recoloreado que conserva la
   luminancia, más el corte de los nudillos y la correa de muñeca) y el modelo
   solo lo armoniza a baja intensidad; después, limpieza procedural del fondo por
   extrapolación del propio fondo fuera de la silueta.

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
                               # las etapas 3 y 4 están en dibujo/pipeline/
```

## Qué salió bien y qué no

El pase fotorrealista respeta la pose, el encuadre, el vestuario y el bolso del
dibujo. La mano izquierda salió con el guante sin dedos limpio a la primera.

La mano derecha costó: el line art de esa zona está muy cargado (funda, correas,
cinturón) y ControlNet la deformaba. Ni el prompt ni el inpainting conseguían un
guante *sin dedos* — el modelo insistía en cerrarlo. La solución fue dejar de
pedírselo al modelo y construir el guante a mano sobre la mano ya fotográfica.
Funciona a tamaño completo, pero **de cerca los dedos de esa mano siguen algo
blandos**: es la limitación conocida de esta versión.
