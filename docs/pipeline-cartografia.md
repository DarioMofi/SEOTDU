# Pipeline de cartografía: detalle operativo

Detalle de apoyo para `extract_gpkg.py`. El esquema general y las razones de la
estructura de carpetas están en el `CLAUDE.md`; aquí vive el procedimiento y los
defectos del origen que el script tapa.

## Qué se extrae de dónde

- Los `.gpkg` de la raíz de `cartografia/` se vuelcan **enteros**: son los
  paquetes por módulo temático.
- `cartografia/pendientes/` es un banco de cartografía suelta del que solo se
  toma lo listado en `POOL_LAYERS`. Volcarlo completo metería en los módulos
  decenas de capas que el proyecto QGIS no tiene encendidas, y el visor las
  dibujaría todas. Se va llenando capa por capa, validando contra el proyecto
  QGIS.
- `catp50s3gw` queda fuera a propósito: son ~208 000 elementos y ~450 MB como
  GeoJSON. Habría que simplificarla en QGIS o servirla como teselas antes de
  poder incluirla.
- El paquete del Mapa Base trae cada capa **duplicada, con y sin el prefijo
  `C04_`**. Se toma la variante que de verdad tiene registros y el CRS bien
  declarado; no siempre es la misma (ver `CRS_REAL` abajo).

## Regenerar

```bash
rm -rf public/layers && python extract_gpkg.py
```

El script salta lo que ya existe en `public/layers/`, así que correrlo sin borrar
nada es idempotente: solo rellena lo que falte y reescribe `available.json`.

## Cómo se quita una capa del visor

`available.json` es la compuerta: una capa desaparece del visor cuando **no tiene
GeoJSON**, no cuando se edita el volcado de estilos (el estilo puede seguir
declarándola sin problema).

1. Borra su archivo de `public/layers/`.
2. Agrégala a `EXCLUIDAS` en `extract_gpkg.py`. Sin este paso la próxima
   extracción la revive, porque los `.gpkg` de módulo se vuelcan enteros.
3. Corre el script para que reescriba `available.json`.

## Defectos de la cartografía de origen

Las dos listas de `extract_gpkg.py` existen solo para taparlos y se borran cuando
los corrijan en origen. Cada entrada lleva escrito su motivo.

### `EXCLUIDAS`

Tablas que están en un `.gpkg` de módulo pero no deben llegar al visor: o ningún
volcado de estilos las declara, o son una variante antigua de una capa que QGIS
ya sustituyó por otra más completa.

### `CRS_REAL`

Tablas que **declaran EPSG:4326 con las coordenadas todavía proyectadas**. La
copia prefijada con `C04_` se relabeló sin reproyectar; su propio campo
`proyeccion_actual` llega a afirmar `EPSG:4326`.

Es una trampa cara: geopandas se cree la etiqueta, no reproyecta, y la capa
aterriza a millones de grados del mapa. Leaflet crea sus `<path>` pero ninguno
cae nunca en la vista, y **no hay error en consola**. Para diagnosticarlo, mirar
la primera coordenada del GeoJSON: si son números de seis o siete cifras, no está
en 4326.

Para confirmar el CRS verdadero, comparar contra la variante sin prefijo del
mismo paquete, que suele declararlo bien. Se conserva la tabla prefijada porque
es la enriquecida: trae campos de metadatos que la otra no.

## Mojibake

Los GPKG de origen traen texto con doble y triple codificación UTF-8 (`ó` →
`Ã³` → `ÃƒÂ³`), con tres codecs distintos involucrados (`cp1252`, `latin-1` e
`ISO-8859-14`). `normalize_encoding()` lo deshace iterando hasta que el texto
deja de tener marcadores sospechosos, y cuando la cadena es de codificación
mixta, token por token.

**No es cosmético**: la simbología categorizada empareja el valor del estilo (que
sí está limpio) contra el valor del dato. Si no coinciden, la capa entera se
pinta de un solo color.

Queda una cadena irreparable, `El ParaÃíso` en `C04_Loc_rur`: perdió bytes en
origen. No inventarle un valor.
