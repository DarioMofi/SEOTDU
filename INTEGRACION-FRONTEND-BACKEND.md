# SEOTDU — Histórico de cambios e integración Frontend–Backend

Plataforma: *Sistema Estatal de Ordenamiento Territorial y Desarrollo Urbano* (Campeche) · Etapa 4
Repositorio: `peotdu-campeche` (React 19 + Vite 8 + Tailwind v4 + Leaflet)
Modelo de datos: `ARQUITECTURA-DATOS-SEOTDU.md` (tablas, cardinalidad, identificadores y funciones `api`), adaptado de la *Arquitectura de Datos SESIM*
Última actualización: octubre de 2026

> **Cómo leer este documento.** La sección 1 registra qué cambió en la interfaz y por qué. La sección 2 dice, pieza por pieza, de dónde saca hoy sus datos cada componente y a qué tabla, función o servicio debe conectarse cuando entre el backend (Supabase/PostGIS). La sección 3 dice qué acción del usuario dispara una petición al servidor y cuál no.

---

## 1. Changelog

### Ronda 12 · Resumen del catálogo y anillo exterior (actual)

| Área | Cambio | Archivos |
|---|---|---|
| Catálogo · Resumen | Panel plegable con cifras (instrumentos, vigentes y caducos con %, municipios con instrumento y con PMDU vigente) y barras por tipo (PEOTDU, PMDU, PDU · centro de población, POEL, POEPL), segmentadas en vigente y caduco, con conteo por escala. Responde a la búsqueda y a los filtros. Cada dimensión se cuenta sin su propio filtro, para no quedar en ceros. Un clic en una barra filtra por tipo; un clic en Vigentes o Caducos filtra por vigencia (filtro nuevo `versionSel`). Colores validados para daltonismo: #00876A / #C47F1A. | `components/catalogo/resumen-catalogo.tsx`, `styles/catalogo-resumen.css`, `pages/catalogo.tsx` |
| Inicio · Estructura del PEOTDU | Se quitan los botones «Versión condensada» y «Versión oficial» del final de la sección: ya están bajo la portada del programa. | `seccion-peotdu.tsx` |
| Diagrama del paradigma | El anillo de monitores pasa **afuera de todo**, por encima del de derechos humanos, con su nombre sobre el arco. Las líneas tenues van de cada subsistema a su sector. Aplica en inicio y en el geovisor. | `diagrama-paradigma.tsx`, `paradigma.css`, `geovisor.css` |

### Ronda 11 · Anillo de monitores y depuración de datos

| Área | Cambio | Archivos |
|---|---|---|
| Diagrama del paradigma | **Anillo interior de monitores** entre los subsistemas y las personas: un sector por monitor, con su color e icono, que abarca los subsistemas que lo alimentan, unidos con líneas tenues. Al pasar el cursor se resaltan las líneas y los subsistemas del monitor; con clic se abre el monitor. Debajo hay una leyenda de monitores con nombres legibles. El rótulo de Físico natural pasa arriba del nodo. | `diagrama-paradigma.tsx`, `paradigma.css` |
| Trazabilidad | «Gobernanza institucional» pasa a Institucionalidad y gobernanza (6 temas). Hoja `datos-fuente/vinculos-capa-tema.xlsx` con 26 vínculos propuestos; el script suma solo los validados. | `scripts/extraer-trazabilidad.py` |
| Incidencias | Respaldo para los renglones sin monitor (`R04_*` → Ambiental; «Sistema de ciudades» → Infraestructura · Estrategia): 82 incidencias. | `scripts/extraer-incidencias.py` |
| Larguillo de subsistemas | Cuenta las capas de cualquier monitor y ofrece un botón por monitor. Institucionalidad abre Infraestructura en Desempeño (`moduloInsumos`). | `larguillo-subsistemas.tsx`, `paradigmaPeotdu.ts` |
| Documentación | `ARQUITECTURA-DATOS-SEOTDU.md` v1.2. | — |

### Ronda 10 · Orden único de monitores y cajas por vista

| Área | Cambio | Archivos |
|---|---|---|
| Orden | Ambiental → Social → Infraestructura → Económico → Gobernanza (MOT). El orden sale de una sola constante, `ORDEN_MONITORES`, y lo usan el larguillo de subsistemas, el de monitores (cada monitor conserva su recorte de `Larguillo.png`) y las cajas del geovisor. | `data/paradigmaPeotdu.ts`, `larguillo.tsx`, `module-layer-selector.tsx` |
| Gobernanza | Institucionalidad y gobernanza pasa a la cornisa **Monitor de Gobernanza (MOT)**. Se quitó el caso especial que mandaba sus insumos al monitor Social. El MOT se titula «Gobernanza (MOT)» en el geovisor. | `paradigmaPeotdu.ts`, `appConfig.ts` |
| Mapa Base | Ya no arranca encendido: el módulo inicial es Ambiental. Su caja va al final del menú. | `appConfig.ts` (`DEFAULT_MODULE`), `module-layer-selector.tsx` |
| Cajas por vista | **Desempeño** lista solo capas de diagnóstico con Narrativa y Analítica. **Estrategia** lista solo capas de estrategia y el propio MOT. Al cambiar de vista o de monitor se apagan las capas que dejan de verse. Al entrar sin parámetros se abre Desempeño con el mapa limpio. | `module-layer-selector.tsx` (`visibleEnVista`), `geovisor.tsx` |
| Recuadros retirados | Ya no aparecen las marcas N·A / E, su nota ni los subtítulos de rama dentro de los monitores. Se conservan las estrategias E1–E4 del MOT. | `module-layer-selector.tsx`, `geovisor.tsx`, `geovisor.css` |
| Incidencias | `datos-fuente/Incidencias EN CARTOGRAFIA - SEOTDU.xlsx` → `scripts/extraer-incidencias.py` → `src/data/incidencias-cartografia.json` (69 filas). Cada caja muestra «Capas pendientes de publicar» de su vista, y cada tema del larguillo de subsistemas, las suyas. | `lib/datosPrograma.ts` (`getIncidenciasCartografia`), selector, `larguillo-subsistemas.tsx` |

### Ronda 9 · Larguillo de subsistemas (insumos)

| Área | Cambio | Archivos |
|---|---|---|
| Inicio · Monitores | Segundo larguillo **antes** del de monitores. Las 7 fachadas de `public/Larguillo_2` representan los 7 subsistemas, en orden de monitor. Las **cornisas** de color agrupan las fachadas de cada monitor del diagnóstico: Ambiental = Físico natural · Infraestructura = Urbano-rural, Movilidad · Económico = Económico · Social = Sociodemográfico, Patrimonio, Institucionalidad. Cada **placa** muestra el nombre, la dimensión y el número de temas y de capas en el geovisor. La **banqueta** indica «Desempeño territorial». Cada larguillo lleva su encabezado: Insumos / Salidas. | `components/plataforma/larguillo-subsistemas.tsx`, `larguillo.tsx`, `data/paradigmaPeotdu.ts` (`MONITORES_INSUMOS`, `FACHADAS`), `landing.css` |
| Panel del subsistema | Muestra los temas de diagnóstico agrupados por sección. Cada tema tiene pestañas **Narrativa** y **Analítica**, con el mismo componente que el panel del geovisor (`components/common/contenido-tema.tsx`), y sus capas publicadas. | `contenido-tema.tsx`, `panel-capa.tsx` (refactor) |
| Conexión con el geovisor | Cada capa, el subsistema completo («Encender sus N capas») y cada cornisa abren el geovisor en la rama Desempeño. Parámetros nuevos: `vista`, `subsistema`, `capas=a,b,c`. Con `vista` explícita, la URL manda sobre la vista detectada y solo se encienden capas de esa rama. | `geovisor.tsx`, `module-layer-selector.tsx`, `lib/cartografia.ts` (`getCapasDesempeno`) |
| Institucionalidad y gobernanza | Sus insumos viven en el monitor Social y su salida es el MOT (`moduloInsumos`). En el diagrama del geovisor abre Social en Desempeño y el MOT en Estrategia. | `paradigmaPeotdu.ts` (`moduloDeSubsistema`), `geovisor.tsx` |

### Ronda 8 · Pestañas por rama y diagrama interactivo

| Área | Cambio | Archivos |
|---|---|---|
| Panel lateral | Las pestañas dependen de la rama de la capa, leída del árbol de capas. **Desempeño territorial** muestra solo Narrativa y Analítica, con los temas de diagnóstico de la trazabilidad modular. **Estrategia territorial** muestra solo Estrategia (Estrategia-indicadores y Proyecto-seguimiento). Las capas sin rama (Mapa Base) muestran lo que tengan. El panel se abre solo si la capa tiene contenido para su rama. | `panel-capa.tsx`, `geovisor.tsx`, `lib/datosPrograma.ts` (`pestanasDeVista`, `completaEnVista`, `tieneContenido`) |
| Marca en la capa | Desempeño muestra **N·A** y Estrategia muestra **E**. Rellena = panel completo; letra gris = pestaña sin datos. Aparece en todas las capas de ambas ramas. Resultado: 24 de 50 capas de Desempeño y 38 de 41 de Estrategia están completas. | `module-layer-selector.tsx` (`MarcaPanel`, `onVistasCapas`) |
| Diagrama en el geovisor | Etiqueta «Interactivo» en el encabezado, instrucción de uso arriba del diagrama y un pulso breve de los nodos al aparecer (se omite con *prefers-reduced-motion*). | `diagrama-paradigma.tsx`, `paradigma.css`, `geovisor.tsx` |
| Escala | La barra, las distancias y el denominador están centrados en su recuadro. | `geovisor.css` |

### Ronda 7 · Ajustes al paradigma

| Área | Cambio | Archivos |
|---|---|---|
| Nomenclatura | «Estructuración territorial» pasa a **«Estrategia territorial»** en la interfaz, el código (`Vista = 'desempeno' \| 'estrategia'`) y `trazabilidad-temas.json`. | `data/paradigmaPeotdu.ts`, `scripts/extraer-trazabilidad.py` y componentes que usan la vista |
| Escala | La escala gráfica se movió **debajo de la simbología**, en una columna común (`.mapa-pie`, 260 px) con el mismo recuadro, título y sombra. Se desplaza junto con la simbología cuando se abre el panel lateral. | `map-viewer.tsx` (prop `leyenda`), `geovisor.tsx`, `geovisor.css` |
| Completitud del panel | Marca **N·A·E** junto a cada capa: letras en turquesa = pestaña con contenido, en gris = falta; marca rellena = las tres completas. Nota explicativa bajo el diagrama. El panel lista primero los temas de la vista vigente. | `lib/datosPrograma.ts` (`getCompletitudCapas`, `esCompleta`), `module-layer-selector.tsx`, `panel-capa.tsx` |

Resultado: 30 capas tienen las tres pestañas y todas están en **Estrategia territorial** (también en el árbol del MOT). En Desempeño territorial, 24 capas tienen Narrativa y Analítica, pero ninguna tiene Estrategia, porque *Estrategia-indicadores* y *Proyecto-seguimiento* solo citan capas de estrategia.

### Ronda 6 · Paradigma del PEOTDU como eje de navegación

| Área | Cambio | Archivos |
|---|---|---|
| Inicio · Monitores | Diagrama circular del PEOTDU (Ilustración 1, sin flechas amarillas) después del título «Monitores». Anillos: Derechos humanos e interseccionalidad → Cuenca → Entorno → 3 dimensiones → 7 subsistemas → Personas. Al pasar el cursor o enfocar con teclado aparece una tarjeta que explica **Estructura**, **Desarrollo** y **Gobernanza territorial**. Clic en un subsistema abre su monitor. | `components/common/diagrama-paradigma.tsx`, `data/paradigmaPeotdu.ts`, `styles/paradigma.css`, `components/plataforma/larguillo.tsx` |
| Geovisor · Navegación | Botón **«Volver a los Monitores»** arriba a la izquierda del mapa → `/#monitores` (la portada hace scroll al título). | `pages/geovisor.tsx`, `pages/landing-page.tsx` |
| Geovisor · Panel radial | El mismo diagrama en modo *control*, plegable, arriba de la lista de capas. El subsistema elegido actúa como **filtro maestro**: abre su monitor. Los controles laterales cambian la vista: **← Desempeño territorial** (insumos, diagnóstico 2024) y **Estrategia territorial →** (salidas: estrategias y proyectos). Al cambiar de vista se apagan las capas de las ramas ocultas. | `pages/geovisor.tsx`, `components/geovisor/module-layer-selector.tsx` |
| Geovisor · Panel lateral | Nuevo `PanelCapa` (cajón derecho) con pestañas **Narrativa**, **Analítica** (KPI + gráficas de barras/columnas con tabla alternativa) y **Estrategia** (solo si hay datos). Se abre al seleccionar un elemento en el mapa o con el botón «i» de la capa; **no** al solo encender una capa. Reemplaza a `PanelEstrategia` (archivo sin uso, se puede borrar). | `components/geovisor/panel-capa.tsx`, `components/geovisor/grafica-barras.tsx` |
| Geovisor · Escala | Escala gráfica dinámica abajo al centro: barra con distancia redonda (1/2/5 × 10ⁿ), denominador 1:N a 96 dpi y zona UTM del centro del mapa (Campeche: 15Q). Se recalcula en cada `zoom`/`move`. | `lib/escalaMapa.ts`, `components/geovisor/map-viewer.tsx` |
| Datos | Extracción de *Trazabilidad modular-SEOTDU.docx* → `public/datos/trazabilidad-temas.json` (61 temas, 56 con capas ligadas, 12 con series graficables). | `scripts/extraer-trazabilidad.py`, `lib/datosPrograma.ts` |
| Textos | Reparación de nombres con doble codificación UTF-8 («ChampotÃ³n» → «Champotón») antes de mostrarlos. | `lib/textoLegible.ts` |
| Color | Paleta institucional: turquesa `#2E8C8A` (Estructura), azul `#2C5D86` (Desarrollo), acento cálido `#D2873A` (Gobernanza); gráficas divergentes turquesa (+) / terracota `#C46A2B` (−). | `data/paradigmaPeotdu.ts`, `styles/*.css` |

**Decisión provisional:** agrupación de los 7 subsistemas en dimensiones (Estructura = Físico natural, Urbano-rural, Movilidad · Desarrollo = Sociodemográfico, Económico, Patrimonio · Gobernanza = Institucionalidad y gobernanza). Está marcada en código para confirmarse con el equipo del PEOTDU.

### Ronda 5 · Panel solo al seleccionar
- El panel de estrategia dejó de abrirse al encender una capa; solo al hacer clic en un elemento del mapa (prop `onElementSelect`).

### Ronda 4 · Popup y llegada desde proyectos
- Popup con una sola pestaña, «Información específica».
- Desde un proyecto del monitor (`/geovisor?modulo=…&capa=…`) se enciende solo esa capa y se muestra su simbología (prop `initialLayer`; corregida la carrera con la activación asíncrona del módulo).

### Ronda 3 · Observaciones con Excel
- Consulta de elementos con varias capas encendidas (antes solo la capa superior); capas fijas no interactivas.
- Proyectos de los monitores desde *Proyecto-seguimiento.xlsx* (32 proyectos) con botón «Ver en el geovisor».
- Fila de *Estrategia-indicadores.xlsx* en panel junto a la simbología.
- Botón «Ver publicación» en el catálogo desde *Ficha-tecnica.xlsx* (23 de 34 instrumentos).
- Script único `scripts/actualizar-datos.py` → `public/datos/*.json`; lectura por un solo punto: `src/lib/datosPrograma.ts`.

### Ronda 2 · Prompts estructurados Etapa 4
- Portada con imagen y mosaico «Campeche a través del tiempo»; panel de datos territoriales; mapa municipal clicable.
- «¿Qué es el sistema?»: esquema SVG de relaciones, mosaico de actividades, pirámide Federal/Estatal/Municipal con fundamento jurídico y matriz de vinculación.
- PEOTDU: 5 puntos, portada oficial, estructura en 5 fases y 10 capítulos con enlaces al PDF.
- Monitores: bloque introductorio.
- Geovisor: rótulos de localidades por zoom con anticolisión, resumen de manzanas al pasar el cursor, limpieza de nombres y campos (`textoLegible.ts`).

### Ronda 1 · Identidad
- Título «Sistema Estatal de Ordenamiento Territorial y Desarrollo Urbano» (sin siglas) y subtítulo centrado «Infraestructura pública digital».

---

## 2. Matriz de conexión Frontend–Backend

Convenciones: **Hoy** = archivo estático servido desde `public/`. **Destino** = objeto del esquema SESIM (tablas en `public`, funciones y vistas en `api`, expuestas por PostgREST/Supabase como `/rest/v1/rpc/<función>` o `/rest/v1/<vista>`). Los IDs se comparan siempre con `norm()` (sin acentos, minúsculas, solo `[a-z0-9]`), igual que en `scripts/*.py` y en el §4 del modelo SESIM.

Toda petición nueva debe pasar por **un solo punto de acceso** (`src/lib/datosPrograma.ts` para datos alfanuméricos y `src/lib/cartografia.ts` para geometría). Así el cambio a Supabase toca dos archivos y ningún componente.

### 2.1 Menú radial (subsistemas × vista)

| Elemento de UI | Parámetros | Hoy | Destino (backend) |
|---|---|---|---|
| Nodo de subsistema (7) | `subsistema` → `modulo` (`ambiental`, `infraestructura`, `aptitud`, `social`, `normatividad`) | Constante `SUBSISTEMAS` en `data/paradigmaPeotdu.ts`; el módulo se carga de `/estilos/<modulo>.json` con `getEstiloModulo()` | `GET /rest/v1/rpc/fn_capas_por_subsistema?p_subsistema=<id>&p_vista=<vista>` → lista de `capa` (id, titulo, tipo_geometria, grupos, metadatos_extra) **sin geometría**. Requiere agregar a `capa` las columnas `subsistema` y `vista` (o una tabla puente `capa_subsistema`), porque hoy `grupos`/`nomenclatura` no distinguen los 7 subsistemas. |
| Control «← Desempeño territorial» | `vista = 'desempeno'` | Filtra ramas del árbol cuyo rótulo coincide con `/desempe/i` | Mismo RPC con `p_vista='desempeno'`. Correspondencia sugerida: capas con `id_instrumento` de diagnóstico y `nomenclatura` tipo `D-*`. |
| Control «Estrategia territorial →» | `vista = 'estrategia'` | Ramas restantes (estrategias, proyectos, MOT) | `p_vista='estrategia'`: capas de estrategia (`nomenclatura` tipo `2TPP`, `E*`) y proyectos ligados a `instrumento_origen`. |
| Catálogo de dimensiones y textos de ayuda | — | `DIMENSIONES`, `ANILLOS` en `paradigmaPeotdu.ts` | Puede quedarse estático (texto rector del PEOTDU). Si se quiere editable: tabla Macro `dimension_peotdu` ligada a `eje_tematico`. |
| Disponibilidad de capas | — | `/layers/available.json` + `/layers/catalogo.json` | `GET /rest/v1/capa?activo=eq.true&estatus=eq.vigente_publico&select=id,titulo,…` |

### 2.2 Panel lateral (`PanelCapa`)

| Pestaña / bloque | Dato que muestra | Hoy | Destino (backend) |
|---|---|---|---|
| Encabezado | Subsistema · vista, título de la capa, sección | `trazabilidad-temas.json` (`monitor`, `seccion`, `subsistema`, `vista`) | `capa` + `fn_trazabilidad_normativa` (F01) para eje, sector, fuente e instrumento |
| Chips de tema | Temas que usan la capa | `temasDeCapa(todos, layerId)` | Tabla nueva `tema_trazabilidad` + puente `tema_capa (id_tema, id_capa)` — mismo patrón que `capa_indicador` |
| **Narrativa** | Descripción y narrativa del tema | `trazabilidad-temas.json` → `descripcion`, `narrativa` | `tema_trazabilidad.descripcion`, `.narrativa` (texto rico). Sugerido: campo `version_documento` para rastrear de qué edición del Word sale. |
| **Analítica** · KPI | Cifras clave del tema | `analitica` (viñetas «Título: texto») | `fn_indicadores_de_capa` (F07) → `indicador` + última `medicion_indicador` en estado `vigente_publico`; semáforo con `fn_semaforo` (F04) |
| **Analítica** · gráficas | Series categóricas o por año | `series[]` extraídas del Word | `v_serie_indicador` (F02) para tendencia por periodo; `v_cubo_mediciones` (F13) para cortes por municipio/eje; `fn_tasa_por_poblacion` (F03) para normalizar por habitante |
| **Analítica** · territorio | (próximo) conteo de elementos por municipio | — | `v_capa_por_municipio` (F08) filtrado por `id_capa` y, si se seleccionó un elemento, por su `capa_vector.id_unidad` |
| **Estrategia** | Fila de estrategia-indicador y seguimiento de proyecto | `estrategia-indicadores.json`, `proyectos-seguimiento.json` vía `indicadoresDeCapa` / `proyectosDeCapa` | `indicador_instrumento` + `matriz_instrumento` + `instrumento_origen`; proyectos en tabla nueva `proyecto` ligada a `capa` e `instrumento_origen` |
| Nota de fuente | Origen de los datos | Texto fijo «PEOTDU Campeche 2023, trazabilidad modular» | `fuente_informacion` vía F01 |
| Popup del elemento | Atributos del elemento | `feature.properties` del GeoJSON ya cargado (sin petición) | `capa_vector` (`nombre`, `clasif`, `fecha_dato`, `propiedades` jsonb) — viene en la misma respuesta geoespacial |

Regla de publicación: el frontend público **solo** debe leer mediciones en estado `vigente_publico` (§1.6 SESIM). Conviene que las vistas `api.*` ya apliquen ese filtro para que la interfaz no dependa de recordarlo.

### 2.3 Servicios geoespaciales

| Necesidad | Hoy | Destino recomendado | Alternativas |
|---|---|---|---|
| Geometría de una capa | `getCapaGeoJSON(id)` → GeoJSON completo por capa (`/layers/…`), dibujado en canvas | **Teselas vectoriales (MVT)** desde PostGIS `capa_vector` con Martin o pg_tileserv: `/{id_capa}/{z}/{x}/{y}.pbf`. Con 490 224 elementos, bajar la capa completa no escala. | **GeoServer** WFS (`GetFeature` con `BBOX` y `propertyName`) para consulta y descarga; WMS (`GetMap`) para capas raster o muy densas. **Mapbox** o **ArcGIS** solo como mapa base o si se contrata hospedaje. |
| Estilo y simbología | `/estilos/<modulo>.json` (volcado de QGIS) | Tabla o campo `capa.metadatos_extra.estilo` (JSON) o SLD en GeoServer | Estilos Mapbox GL |
| Clic en elemento | Hit-test local de Leaflet sobre el GeoJSON | Con MVT: hit-test local sobre la tesela. Con WMS: `GetFeatureInfo`. | — |
| Sistema de referencia | Visualización EPSG:3857 (Web Mercator); datos en EPSG:4326 | Servir en 4326/3857; `capa.srid_origen` (6372, 32615, 6365…) se reproyecta en la base, no en el navegador | — |
| **Escala gráfica / UTM** | Calculada en el cliente: metros por píxel en el centro (`map.distance` entre dos píxeles) → `barraEscala()`, `denominadorEscala()` (96 dpi), `zonaUTM()`. **No hace peticiones.** | Sincronizar con `capa.metadatos_extra.denominador_escala` / `escala_nominal`: si el denominador actual es menor que el nominal de una capa encendida, avisar «escala mayor que la de captura». En GeoServer, los `MinScaleDenominator`/`MaxScaleDenominator` del SLD deben usar los mismos denominadores para que lo que se dibuja coincida con lo que marca la escala. | — |
| Rótulos de localidades | `localidadesUrbanas.ts` + reglas de zoom | `unidad_territorial` (nivel, `pob_tot`) + `unidad_territorial_geom` (centroides) | — |

---

## 3. Flujo de estados

### 3.1 Estado de la interfaz

```
Portada (/)
 ├─ hover / foco en dimensión ............ tarjeta de ayuda (local)
 ├─ clic en subsistema ................... abre monitor (local)
 └─ «Ver en el geovisor» ................. /geovisor?modulo=M&capa=C
                                              │
Geovisor  { subsistema, vista, módulo, capasActivas, capaSeleccionada, panelAbierto, escala }
 ├─ clic en nodo radial .......... subsistema, módulo
 ├─ ← / → ......................... vista; apaga capas de ramas ocultas
 ├─ casilla de capa .............. capasActivas
 ├─ zoom / arrastre .............. escala, rótulos
 ├─ clic en elemento ............. popup + capaSeleccionada → panelAbierto
 ├─ botón «i» .................... capaSeleccionada → panelAbierto
 ├─ pestañas del panel ........... pestaña (local)
 └─ «Volver a los Monitores» ..... /#monitores
```

### 3.2 Qué evento dispara una petición

| Evento | Cambio de estado | Peticiones **hoy** | Peticiones **destino** |
|---|---|---|---|
| Entrar al geovisor (con o sin `?modulo&capa`) | módulo inicial; `vista='estrategia'` si viene `capa` | `available.json`, `catalogo.json`, `/estilos/<modulo>.json`, GeoJSON de capas activas | `capa` (catálogo ligero) + `fn_capas_por_subsistema`; teselas del viewport |
| Clic en nodo del radial | `subsistema`, `moduloSolicitado` | `/estilos/<modulo>.json` solo la primera vez; GeoJSON de capas que se enciendan | `fn_capas_por_subsistema(p_subsistema, p_vista)` |
| Cambiar vista (← / →) | `vista`; se apagan capas ocultas | Ninguna para apagar; GeoJSON si el usuario enciende otra | Mismo RPC con otro `p_vista` (o filtrar en cliente si ya se trajo todo el subsistema) |
| Encender capa | `capasActivas` | GeoJSON completo de la capa (sin caché propia; depende de la caché HTTP del navegador) | Teselas MVT de esa capa en el viewport |
| Apagar capa | `capasActivas` | Ninguna | Ninguna |
| Zoom / arrastre | `escala`, rótulos | **Ninguna** | Teselas nuevas del viewport (la escala sigue sin petición) |
| Clic en elemento | popup, `capaSeleccionada`, panel abierto | Primer uso: `trazabilidad-temas.json`, `estrategia-indicadores.json`, `proyectos-seguimiento.json` (luego caché) | `fn_indicadores_de_capa`, `tema_capa`, opcional `v_capa_por_municipio` por `id_unidad` |
| Botón «i» de la capa | `capaSeleccionada`, panel abierto | Igual que la fila anterior | Igual |
| Cambiar pestaña del panel | pestaña | Ninguna | **Analítica** carga perezosa: `v_serie_indicador` / `v_cubo_mediciones` solo al abrirla |
| Cerrar panel | panel cerrado | Ninguna | Ninguna |
| Selector de municipio / pestaña «Información» | municipio seleccionado | GeoJSON de las capas activas para calcular estadísticas (`sidebar-control.tsx`) | `v_capa_por_municipio` (F08) y `v_cubo_mediciones` (F13) con `p_unidad`: el servidor agrega y el navegador no descarga geometría |
| «Volver a los Monitores» | navegación | Ninguna (portada estática) | Ninguna |

### 3.3 Reglas para mantener el flujo

1. **Caché por sesión.** `datosPrograma.ts` guarda cada promesa y un segundo clic no repite la petición; `cartografia.ts` solo cachea el índice del catálogo, no los GeoJSON. Con Supabase, aplicar la misma caché a ambos (o usar TanStack Query).
2. **Referencias vivas en Leaflet.** Los manejadores del mapa leen `activeLayersRef`, no el estado capturado, para no dibujar una capa que ya se apagó mientras llegaba su GeoJSON.
3. **El panel nunca se abre al encender una capa**; solo con selección explícita (elemento o «i»).
4. **La escala es puramente de cliente**; cualquier servicio de mapas debe respetar los mismos denominadores.

---

## 4. Pendientes de backend

- Columnas `subsistema` y `vista` en `capa` (o tabla puente) para el RPC del radial.
- Tablas `tema_trazabilidad`, `tema_capa` y `proyecto`; migrar los JSON de `public/datos/`.
- Vistas `api.*` filtradas a `vigente_publico`.
- Servidor de teselas vectoriales sobre `capa_vector`.
- Confirmar la agrupación de subsistemas por dimensión.
- Solo 12 de 61 temas tienen series graficables en el Word; el resto mostrará KPI en texto hasta que haya `medicion_indicador`.

## 5. Mantenimiento de datos (mientras no hay backend)

```
python scripts/actualizar-datos.py        # Excel → proyectos, estrategia-indicadores, publicaciones
python scripts/extraer-trazabilidad.py    # Word de trazabilidad → trazabilidad-temas.json
```

Después de agregar archivos a `public/`, reiniciar `npm run dev`: Vite no detecta archivos nuevos en caliente.
