# Especificación de entrega — cartografía y estilos (Geovisor PEOTDU Campeche)

Documento para solicitar la re-exportación de los insumos desde QGIS.
Cubre los dos entregables: los **GeoPackage** con los datos y los **JSON de
simbología** que los acompañan.

Estado al 5 de agosto de 2026: la entrega actual tiene 6 GPKG con 58 capas y 6
JSON de estilo con 108 capas. Los problemas listados abajo se detectaron sobre
esa entrega.

---

## 1. Codificación de caracteres — **crítico**

### El problema

El texto de los GPKG está doblemente codificado. En la entrega actual, `ó`
quedó guardado como la secuencia de bytes de `Ã³`, y en varias capas hubo
**dos y hasta tres vueltas** del mismo error:

| Cómo debe verse | Cómo llegó | Vueltas |
|---|---|---|
| `Vocación` (nombre de columna) | `VocaciÃ³n` | 1 |
| `Estación de pasajeros` | `EstaciÃ³n de pasajeros` | 1 |
| `Champotón` | `ChampotÃƒÂ³n` | 2 |
| `Vegetación` | `VegetaciÃƒÆ'Ã‚Â³n` | 3 |
| `años` | `aÃ\x83Âḟos` | 2, vía ISO-8859-14 |

Esto ocurre cuando una capa se lee con la codificación equivocada al
importarla a QGIS (típicamente un Shapefile o CSV en UTF-8 leído como
Windows-1252, ISO-8859-1 o ISO-8859-14) y luego se guarda al GPKG.

### Por qué importa

No es cosmético. Los JSON de estilo sí traen el texto limpio (`Vocación`), y la
simbología categorizada empareja el valor del estilo contra el valor del dato.
Si no coinciden, **la capa entera se pinta de un solo color**. Con la capa
`C04_Puertos_reg` pasaba exactamente eso: la columna se llamaba `VocaciÃ³n`, el
estilo buscaba `Vocación`, ninguno de los 3 puertos emparejaba y los tres
salían del mismo color.

Afectaba a **19 de 58 capas** y a **341 cadenas de texto**.

### Qué pedir

1. **Todo el texto en UTF-8 real, sin doble codificación**, tanto en los
   *valores* como en los *nombres de columna*.
2. Al importar cualquier Shapefile a QGIS, fijar explícitamente el encoding de
   origen (`Capa → Añadir capa vectorial → Codificación`). Si el `.dbf` trae
   `.cpg`, respetarlo; si no, verificar con qué codificación fue creado antes
   de importar. **No aceptar el valor por defecto sin comprobar.**
3. **Prueba de verificación antes de entregar**: abrir la tabla de atributos en
   QGIS y buscar las cadenas `Ã`, `Â`, `â€`. Si aparece alguna, la capa está
   mal. Debe dar cero resultados en las 58 capas.

### Consecuencia del nuevo Backend

Dado que el script automático de extracción ya no existe y los datos se subirán directamente de QGIS a PostGIS, **ya no hay ninguna red de seguridad que limpie estos caracteres.** Es 100% obligatorio que los datos vengan limpios de origen, de lo contrario la simbología fallará silenciosamente en la base de datos.

---

## 2. Nombres de capa

El visor asocia cada capa con su estilo por nombre. Hay dos nombres en juego y
**tienen que ser idénticos**:

- el **nombre de la tabla** dentro del GPKG,
- el **nombre de la capa en el árbol de QGIS**, que es lo que va al JSON de estilo.

En la entrega actual coinciden en 5 de los 6 módulos. La excepción es
`Mapa_Base`, donde las capas fueron renombradas en el árbol de QGIS quitándoles
el prefijo: la tabla se llama `C04_Municipios` pero el estilo dice `Municipios`.
Eso obligó a meter lógica de adivinación en el frontend, que es frágil.

**Qué pedir:**

1. No renombrar capas en el panel de capas de QGIS. El nombre visible debe ser
   el mismo que el de la tabla.
2. Sin espacios ni guiones en los nombres de tabla. La entrega actual tiene
   `C04_Modelo_Ordenamiento_Territorial_OP_PG_2023_CP copiar` (con espacio, y
   además es un duplicado que debería eliminarse) y
   `C04_Mejoramiento_conectividad_Corredor_Puebla-Progreso_OPMATPG_2023`.
3. Evitar acentos en los nombres de tabla. Funcionan, pero se convierten en
   nombres de archivo y complican el URL-encoding. Preferir
   `C04_Rio_Candelaria...` sobre `C04_Río_Candelaria...`.
4. Nombres consistentes entre capturas: un mismo prefijo (`C04_`) para todo.
   Hoy conviven `C04_` y `C55_`.

---

## 3. Cobertura: 59 capas tienen estilo pero no tienen datos

Los JSON de estilo describen 108 capas; los GPKG solo traen 49 de ellas. Las
59 restantes se descartan silenciosamente en el visor.

| Módulo | Capas con estilo pero sin datos |
|---|---|
| Infraestructura_Estrategica_Conectividad | 29 |
| Monitor_Ambiental_Climatico | 13 |
| Aptitud_Territorial_Desarrollo_Economico | 7 |
| Bienestar_Social_Demografia | 7 |
| Mapa_Base | 2 (`RNC_2025_SURESTE`, `Loc_urb`) |
| Normatividad_MOT | 1 (el duplicado «copiar») |

**Qué pedir:** que confirmen, capa por capa, cuáles de esas 59 deben incluirse
en el prototipo y cuáles se quedan fuera a propósito. Si se quedan fuera,
conviene sacarlas también del proyecto QGIS antes de exportar el estilo, para
que el JSON no prometa capas que no existen.

La lista completa está al final de este documento.

---

## 4. Simbología: qué se puede reproducir en web y qué no

El visor traduce la simbología de QGIS a SVG. La traducción es fiel para la
mayoría de los tipos de símbolo, pero hay tres que **no se pueden reproducir**
con la información que trae el volcado actual.

### 4.1 Marcadores de fuente (`QgsFontMarkerSymbolLayer`) — no reproducible

8 capas usan glifos de fuentes propietarias de ESRI:

```
ESRI Enviro Hazard Analysis   ESRI Surveyor          ESRI AMFM Electric
ESRI Hazardous Materials      ESRI Enviro Hazard Incident   ESRI IGL Font23
```

El navegador no tiene esas fuentes, así que el glifo no se puede dibujar. Hoy
el visor pinta un disco del color correcto como sustituto, pero **el pictograma
se pierde**.

**Opciones, en orden de preferencia:**

1. **Reemplazar los marcadores de fuente por marcadores SVG en QGIS.** Es lo
   más limpio y lo que recomiendo pedir.
2. Entregar los archivos de fuente (`.ttf`/`.otf`) junto con la licencia que
   permita incrustarlos en un sitio web. Ojo: las fuentes de ESRI vienen con
   ArcGIS y su licencia normalmente **no** permite redistribución web —
   conviene verificarlo antes de asumir esta ruta.
3. Entregar una tabla `glifo → significado` (p. ej. `ESRI Surveyor` + `>` =
   «pozo»), para dibujar iconos equivalentes a mano.

### 4.2 Marcadores SVG (`QgsSvgMarkerSymbolLayer`) — parcialmente reproducible

El volcado guarda la ruta absoluta del equipo del autor:

```
C:/PROGRA~1/QGIS34~1.7/apps/qgis/svg/transport/transport_airport.svg
```

Esa ruta no existe en el servidor. Son 4 archivos distintos, todos de la
librería que trae QGIS, y ya están reimplementados a mano en el visor. Pero
cualquier SVG nuevo que agreguen se va a romper.

**Qué pedir:** que el script de exportación de estilos **incruste el contenido
del SVG en base64** dentro del JSON, igual que ya hace con los rásteres (ver
4.3). Alternativamente, entregar la carpeta de SVG usados y que el JSON guarde
solo el nombre de archivo, sin la ruta absoluta.

### 4.3 Rásteres — sí funcionan

`QgsRasterFillSymbolLayer` y `QgsRasterMarkerSymbolLayer` ya vienen con la
imagen incrustada (`imageFile: 'base64:iVBORw0KGgo…'`) y se reproducen bien.
**Este es el patrón correcto**; pedir que se aplique igual a los SVG.

### 4.4 Sub-símbolos no exportados

`QgsMarkerLineSymbolLayer` (línea con marcadores repetidos, usada en la red
ferroviaria) y `QgsFilledMarkerSymbolLayer` contienen un **sub-símbolo** que
define qué se dibuja. El volcado actual solo guarda la cadencia (`interval`,
`placements`), no el sub-símbolo.

**Qué pedir:** que el script de exportación recorra recursivamente
`symbolLayer.subSymbol()` y lo incluya en el JSON.

### 4.5 Campo `enabled` de cada capa de símbolo

En QGIS cada capa de un símbolo se puede apagar con una casilla. El volcado no
guarda ese estado, así que el visor dibuja capas que en QGIS están ocultas.

**Qué pedir:** incluir `enabled` en `capas_simbolo`.

### 4.6 Lo que sí se está respetando bien

Para que no lo cambien sin querer, esto ya funciona y depende de que el volcado
lo siga incluyendo:

- `renderizado` por categoría (clases apagadas en la leyenda). Gracias a esto el
  visor muestra 13 de 35 aeropuertos y 34 de 54 estaciones, igual que QGIS.
- `opacidad` a nivel de símbolo.
- Unidades (`size_unit`, `line_width_unit`): hoy solo se usan `MM` y `Point`, y
  ambas se convierten con exactitud. **Evitar `MapUnit`**, que depende de la
  escala y no tiene equivalente estático en web.
- `outline_style: 'no'` (borde apagado).
- Pilas de varias capas de símbolo: se componen completas en los puntos.

---

## 5. Lo que el volcado de estilos NO captura y hay que decidir aparte

Si alguno de estos aspectos es importante para el visor, hay que pedirlo
explícitamente porque hoy no viaja en el JSON:

- **Etiquetas** (`labeling`): ninguna capa lleva etiquetas al visor.
- **Visibilidad por escala** (mostrar una capa solo entre 1:50 000 y 1:250 000).
- **Orden de las capas** en el árbol de QGIS y estado encendido/apagado inicial.
- **Renderizadores por reglas** (`RuleRenderer`). Hoy no se usa ninguno, y el
  visor solo entiende `singleSymbol`, `categorizedSymbol` y `graduatedSymbol`.
  Si se agrega uno por reglas, no se va a dibujar.
- **Modos de fusión** (`blend mode`) y efectos de dibujo.
- **`campo_clasificacion` como expresión**: hoy todos son nombres de campo
  simples. Si alguien clasifica por una expresión (`"a" || "b"`), el visor no la
  puede evaluar.

---

## 6. Datos: geometría, proyección y tamaño

- **CRS**: los 6 GPKG ya vienen en **EPSG:4326**, que es lo correcto para web.
  Mantenerlo. (Si el análisis se hace en UTM 14N / EPSG:32614, reproyectar a
  4326 al exportar.)
- **Geometrías válidas**: correr `Vectorial → Herramientas de geometría →
  Comprobar validez` y corregir antes de entregar. Los polígonos con
  auto-intersecciones se dibujan mal en SVG.
- **Tamaño**: la entrega actual genera 76 MB de GeoJSON (16.5 MB comprimidos,
  que es lo que descarga el usuario). El pipeline ya recorta las coordenadas a
  6 decimales —unos 11 cm— y compacta la salida; sin eso serían 134 MB.
  La capa más pesada es `C04_SCINCE_Manzana_INEGI_2020` con 22 MB y 11 322
  polígonos: aunque viaje comprimida, parsearla bloquea el hilo principal.
  Para reducirla en origen conviene **simplificar la geometría** a una
  tolerancia acorde a la escala de visualización (`Vectorial → Herramientas de
  geometría → Simplificar`), que baja el peso sin pérdida visible.
- **Sin columnas basura**: hoy viajan `fid`, `OBJECTID`, `Shape_Area`,
  `Shape_Leng`, `es_sliver`. Ocupan espacio y aparecen en los popups.

---

## 7. Checklist de aceptación

Antes de dar por buena una entrega:

- [ ] Buscar `Ã`, `Â`, `â€` en todas las tablas de atributos → **cero resultados**
- [ ] Nombre de capa en el árbol de QGIS == nombre de la tabla en el GPKG, en las 6 capturas
- [ ] Sin espacios ni guiones en nombres de tabla; sin duplicados tipo «copiar»
- [ ] Todas las capas del JSON de estilo existen en algún GPKG
- [ ] Todas las capas en EPSG:4326
- [ ] Geometrías válidas
- [ ] Sin `QgsFontMarkerSymbolLayer` con fuentes ESRI (o fuentes entregadas con licencia)
- [ ] SVG incrustados en base64, sin rutas absolutas
- [ ] Sub-símbolos (`subSymbol`) y campo `enabled` presentes en el JSON
- [ ] Unidades en `MM` o `Point`, nunca `MapUnit`

---

## Anexo — Capas con estilo pero sin datos

**Aptitud_Territorial_Desarrollo_Economico** (7)
`C04_Instalaciones_CNH_2023`, `C04_PozosAguasProfundas_CNH_2023`,
`C04_PozosAguasSomeras_CNH_2023`, `C04_PozosZonaCuencasSE_CNH_2023`,
`C04_TerminalAlmacenamiento_CNH_2023`, `C04_MunEconomicas_CE_INEGI_2019`,
`C04_CentralidadEconomica_CE_DENUE_2019`

**Bienestar_Social_Demografia** (7)
`C04_EFPatrimonioInmble_SIC_2023`, `C04_GrupoEtnico_INPI_2020`,
`C04_PatrimonioInmaterial_SIC_2023`, `C04_PatrimonioInmaterialIdioma_OPMATPG_2023`,
`C04_PatrimonioInmueble_SIC_2023`, `C04_ZonasArqueológicas_SIC_2023`,
`C04_PobAfromexicana_INEGI_2020`

**Infraestructura_Estrategica_Conectividad** (29)
`C04_Mejoramiento_conectividad_Corredor_Puebla-Progreso_OPMATPG_2023`,
`C04_Programa_abastecimiento_agua_localidades_Tren_Maya_OPMATPG_2023`,
`C04_EAdmin1_INEGI_2023`, `C04_EAdmin2_INEGI_2023`, `C04_EComercio_INEGI_2023`,
`C04_EEMediaSuperior_INEE_OPMATPG_2023`, `C04_EESuperior_DENUE_OPMATPG_2023`,
`C04_ES1erNivel_CLUES_OPMATPG_2023`, `C04_ES2doNivel_CLUES_OPMATPG_2023`,
`C04_ES3erNivel_CLUES_OPMATPG_2023`, `C04_DerechosDeViaGasoductos_CENEGAS_2019`,
`C04_DerechosDeViaLineasDeTransmisionElectrica_Geocomunes_2023`,
`C55_RelacionRuralCdsOrden1_DFI_OPMATPG_2023`,
`C04_EEAsignacionMediaSuperior_DFI_OPMATPG_2023`,
`C04_EEAsignacionSuperior_DFI_OPMATPG_2023`,
`C04_ESAsignacion1erNivel_CLUES_OPMATPG_2023`,
`C04_ESAsignacion2doNivel_CLUES_OPMATPG_2023`,
`C55_RelacionRuralCdsOrden3_DFI_OPMATPG_2023`,
`C55_RelacionUrbanaCdsOrden1_DFI_OPMATPG_2023`,
`C55_RelacionUrbanaCdsOrden3_DFI_OPMATPG_2023`,
`C55_TPartRelacionRuralCdsOrden1_DFI_OPMATPG_2023`,
`C55_TPartRelacionUrbanaCdsOrden1_DFI_OPMATPG_2023`,
`C04_RelacionUrbRuralEstTM_FONATUR_OPMATPG_2023`,
`C04_ESAsignacion3erNivel_CLUES_OPMATPG_2023`,
`C04_ESCobertura1erNivel_CLUES_OPMATPG_2023`,
`C04_ESCobertura2doNivel_CLUES_OPMATPG_2023`,
`C04_ESCobertura3erNivel_CLUES_OPMATPG_2023`,
`C04_TelecomunicacionesVivienda_INEGI_2020`, `C04_Vivienda_ITER_INEGI_2020`

**Mapa_Base** (2)
`RNC_2025_SURESTE`, `Loc_urb`

**Monitor_Ambiental_Climatico** (13)
`C04_Propuesta_Corredor_Norte_SEMABICCE_2023`,
`02_SOCIODEMOGRAFICO — C04_Localidades_ITER_INEGI_2020`,
`C04_IndustriaTratamientoResiduos_INEGI_DENUE_2023`,
`C04_SitiosDispResiduos__INEGI_PEPGIRSSU_2020`,
`C04_ConcentraciónGeneraciónResiduos_INEGI_PEPGIRSSU_2020`,
`C04_TTROP_NOAA_2023`, `C04_CESC_OPMATPG_2023`, `C04_EROSIONSUELO_INEGI_2014`,
`C04_KARST_CENAPRED_2023`, `C04_IRESILIENCIACAMBIOCLIMATICO_OPMATPG_2023`,
`C04_SEQUIALX_OPMATPG_2023`, `C04_SEQUIAMX_OPMATPG_2023`,
`C04_GeneraciónResiduosMun_INEGI_PEPGIRSSU_2020`

**Normatividad_MOT** (1)
`C04_Modelo_Ordenamiento_Territorial_OP_PG_2023_CP copiar`
