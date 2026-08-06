# Geovisor PEOTDU Campeche

Prototipo de geovisor territorial para el estado de Campeche. React + Vite +
Tailwind v4 + Leaflet. El servidor de desarrollo corre en el puerto 8443
(`npm run dev`).

El objetivo del prototipo es que el mapa web se vea **igual que en QGIS**. Esa
restricción explica casi todas las decisiones de abajo.

## Estado del proyecto y hacia dónde va

Es un prototipo, pero **no es código desechable**: la intención es que este
frontend sea el de la versión final. Trátalo como código que va a producción, no
como una maqueta. Si algo se hace provisional a propósito, déjalo dicho en un
comentario para que después se distinga lo temporal de lo definitivo.

Lo que sí es provisional es **de dónde salen los datos**. Hoy la cartografía
viaja como GeoJSON estático servido desde `public/layers/`; en la versión final
**las capas serán tablas SQL en Supabase**. Los GeoPackage y el script de
extracción son andamiaje del prototipo y desaparecen con la migración.

Qué implica al diseñar algo nuevo:

- La lógica que no dependa del DOM no debe acoplarse a Leaflet ni a React, para
  que sobreviva a la migración o pueda correr en el servidor. La separación
  entre `qgisSymbology.ts` (puro) y `leafletSymbology.ts` (adaptador) es el
  ejemplo a seguir.
- El acceso a datos conviene que pase por un punto único, para que cambiar
  `fetch('/layers/x.geojson')` por una consulta a Supabase toque un solo lugar.
- La leyenda **se calcula desde la simbología**, no aparte. Cuando las capas
  pasen a tablas SQL, el estilo tiene que viajar con la capa: la geometría se ve
  venir sola, el estilo no, y sin él la leyenda se queda sin de qué construirse.
- Las decisiones de UI, accesibilidad y rendimiento se toman en serio desde
  ahora: esa parte no se va a rehacer.

### Autenticación (planeada, nada implementado aún)

Habrá autenticación con **Supabase Auth** y cuatro tipos de usuario: uno
público y tres institucionales con permisos distintos entre sí.

Qué puede hacer cada perfil institucional todavía no está definido, así que no
lo asumas: pregúntalo antes de diseñar nada que dependa de ello.

Hoy `LoginCard.tsx` es solo maqueta — su `handleSubmit` simula 1.4 s de carga y
no llama a nada. No hay sesión, ni rutas protegidas, ni roles.

## Pipeline de cartografía

```
cartografia/*.gpkg  →  extract_gpkg.py  →  public/layers/*.geojson
public/estilos/*.json  (simbología volcada desde QGIS)
```

- `cartografia/` está **fuera de `public/`** a propósito: Vite copia todo
  `public/` al build, y los ~98 MB de GeoPackage se desplegarían a Vercel sin
  que nadie los use (el navegador no lee SQLite). Está en `.gitignore`.
- `public/layers/` **sí se versiona**: es lo que Vercel sirve.
- `extract_gpkg.py` hace tres cosas además de convertir: reproyecta a EPSG:4326,
  **repara el mojibake** del origen y recorta las coordenadas a 6 decimales.
- Para regenerar: pega los `.gpkg` en `cartografia/`, borra `public/layers/` y
  corre `python extract_gpkg.py`.

### Mojibake

Los GPKG de origen traen texto con doble y triple codificación UTF-8 (`ó` →
`Ã³` → `ÃƒÂ³`), con tres codecs distintos involucrados (`cp1252`, `latin-1` e
`ISO-8859-14`). `normalize_encoding()` lo deshace iterando.

**Importa porque no es cosmético**: la simbología categorizada empareja el valor
del estilo (que sí está limpio) contra el valor del dato. Si no coinciden, la
capa entera se pinta de un solo color.

Queda una cadena irreparable, `El ParaÃíso` en `C04_Loc_rur`: perdió bytes en
origen. No inventarle un valor.

## Traducción de simbología QGIS → web

Dos módulos con una separación deliberada:

- **`src/lib/qgisSymbology.ts`** — traducción pura. No importa Leaflet ni React.
  Este es el corte pensado para la migración: cuando la cartografía se sirva
  desde Supabase, esta función puede correr en el servidor o alimentar un estilo
  MapLibre. **No meterle dependencias del visor.**
- **`src/lib/leafletSymbology.ts`** — adaptador a Leaflet.

`resolveSymbol(simbologia, properties)` devuelve `null` cuando QGIS **no**
dibujaría el elemento (clase con `renderizado: false`, valor sin categoría,
valor fuera de los rangos graduados). Quien llama debe omitirlo, no pintarlo.

`resolveLegend(simbologia)` es su contraparte: lista **todas** las clases de la
capa sin necesitar los datos, y aplica los mismos descartes, así que lo que el
mapa no pinta tampoco se lista. Su muestra la dibuja `toSwatchSvg`, que vive en
el adaptador y no en el módulo puro porque las tramas de relleno inyectan
`<pattern>` en el documento.

**Nunca una tabla de colores en paralelo.** La leyenda ya se rompió así una vez:
sus ids escritos a mano dejaron de coincidir con los de las capas y el recuadro
desapareció entero, sin error en consola.

Detalles que ya están resueltos y conviene no romper:

- Se recorre la **pila completa** de `capas_simbolo`, no solo la primera.
- Unidades: `MM` × 3.7795 y `Point` × 1.3333 (96 dpi). Nunca × 3.
- Los puntos se componen como SVG apilado en un `divIcon`; el caso de un solo
  círculo simple usa `circleMarker` por rendimiento.
- Los rangos graduados usan la semántica de QGIS: la primera clase incluye su
  cota inferior, las demás la excluyen.

### Limitaciones conocidas

- **`QgsFontMarkerSymbolLayer`**: 8 capas usan glifos de fuentes propietarias de
  ESRI que el navegador no tiene. Se dibuja un disco del color correcto como
  sustituto. Solo se arregla cambiándolos a marcadores SVG en QGIS.
- **Leaflet admite un relleno y un trazo por geometría.** Cuando QGIS apila
  varias capas de relleno en un polígono, hay que aplanarlas. Esto no se
  arregla con datos nuevos: se resolvería migrando a MapLibre.
- El volcado de estilos **no incluye** `subSymbol` (usado por `MarkerLine` y
  `FilledMarker`) ni el campo `enabled`. Se arregla en el script exportador,
  no en los GeoPackage.
- Los `QgsSvgMarkerSymbolLayer` guardan rutas absolutas del equipo autor. Los 4
  SVG en uso están reimplementados a mano en `QGIS_SVG_LIBRARY`.

Ver [docs/especificacion-entrega-cartografia.md](docs/especificacion-entrega-cartografia.md)
para lo que hay que exigirle al equipo que entrega la cartografía.

## Modelo de módulos

Cada módulo **es el mapa base de su propio tema**: solo puede haber uno activo a
la vez.

- Clic en otro módulo → lo activa (enciende todas sus capas, apaga las del
  anterior) y lo expande.
- Clic en el módulo ya activo → solo abre/cierra el acordeón, no toca capas.
- `appConfig.FIXED_LAYERS` no aparecen en el menú y no se pueden apagar por
  separado, pero **se encienden y apagan junto con su módulo** — y sí salen en
  la leyenda, porque se dibujan.
- `appConfig.DEFAULT_MODULE` define cuál arranca encendido.
- `activeModule` y `expandedModule` son estados distintos en
  `ModuleLayerSelector`. No volver a fusionarlos.

Los estilos describen 108 capas pero los GeoPackage solo traen 49; el resto se
descarta con `available.json`. No es un bug del frontend.

## Mantener este archivo

Este archivo es lo único que hereda una conversación nueva, así que envejecer mal
le cuesta caro al proyecto.

Cuando se cierre un cambio que altere cómo se entiende el proyecto —arquitectura,
estructura de carpetas, el pipeline de cartografía, una convención o una
limitación nueva— y el usuario indique que ya funciona o que pasa a otro tema,
propón actualizarlo antes de seguir. El procedimiento está en la skill
`actualizar-contexto`.

## Convenciones

- Comentarios y textos de UI **en español**.
- Los comentarios explican el *porqué*, no el *qué*. Si algo parece raro pero
  es intencional (una semántica de QGIS, un límite de Leaflet), decirlo.
- Cambios quirúrgicos: no refactorizar de paso lo que nadie pidió tocar.
- Verificar de verdad antes de dar algo por terminado. Para el mapa eso
  significa levantar el visor y contar elementos en el DOM, no asumir que
  compiló. Varios bugs de este proyecto solo aparecieron así.

## Trampas del entorno

- `React.StrictMode` está activo: los efectos corren dos veces. Las capas de
  Leaflet cacheadas en refs deben limpiarse en el cleanup del mapa, y los
  `fetch` deben verificar que el mapa siga vivo antes de añadir nada.
- Los marcadores de punto se componen **una sola vez** al crear la capa. Por eso
  `MapViewer` no dibuja una capa hasta conocer su simbología.
- `pandas` 3.x usa el dtype `str`, no `object`. Filtrar por `object` en
  `extract_gpkg.py` descarta silenciosamente todas las columnas de texto.
