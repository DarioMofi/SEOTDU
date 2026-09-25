# Geovisor PEOTDU Campeche

Prototipo de geovisor territorial para el estado de Campeche. React + Vite +
Tailwind v4 + Leaflet. `npm run dev` levanta en el 5173 (o en `$PORT`).

Ojo con el nombre: el repo y este archivo dicen **PEOTDU** (*Programa*); la
interfaz y el modal de políticas dicen **SEOTDU** (*Sistema*). Está sin decidir.

El objetivo del prototipo es que el mapa web se vea **igual que en QGIS**. Esa
restricción explica casi todas las decisiones de abajo.

## Estado del proyecto y hacia dónde va

Es un prototipo, pero **no es código desechable**: la intención es que este
frontend sea el de la versión final. Trátalo como código que va a producción. Si
algo se hace provisional a propósito, déjalo dicho en un comentario para que
después se distinga lo temporal de lo definitivo.

Lo provisional es **de dónde salen los datos**. Hoy la cartografía viaja como
GeoJSON estático desde `public/layers/`; en la versión final **las capas serán
tablas SQL en Supabase** (PostgreSQL + PostGIS), subidas manualmente y una a una
desde QGIS para controlar la calidad.

Qué implica al diseñar algo nuevo:

- La lógica que no dependa del DOM no debe acoplarse a Leaflet ni a React, para
  que sobreviva a la migración o pueda correr en el servidor. La separación
  entre `qgisSymbology.ts` (puro) y `leafletSymbology.ts` (adaptador) es el
  ejemplo a seguir.
- **Las dependencias apuntan en una sola dirección**: nada en `lib/`, `config/`,
  `data/` ni `context/` importa de `components/`, y no hay ciclos. Es la
  propiedad de la que cuelga que la migración sea acotada; conviene no romperla.
  Se comprueba con
  `grep -rn "components" src/lib/ src/config/ src/data/ src/context/`, que debe
  seguir sin devolver nada.
- El acceso a datos conviene que pase por un punto único (`src/lib/cartografia.ts`),
  para que cambiar `fetch('/layers/x.geojson')` por Supabase toque un solo lugar.
- La leyenda **se calcula desde la simbología**, no aparte. Cuando las capas
  pasen a tablas SQL, el estilo tiene que viajar con la capa: la geometría se ve
  venir sola, el estilo no, y sin él la leyenda se queda sin de qué construirse.
- Las decisiones de UI, accesibilidad y rendimiento se toman en serio desde
  ahora: esa parte no se va a rehacer.

## Perfiles y sesión: maqueta funcional, no autenticación

Hay cuatro tipos de usuario: el público (sin sesión) y tres institucionales —
**administrador** (dictamina), **capturista** (carga) y **auditor** (consulta).

`src/context/auth-context.tsx` expone `role`, `login(password)` y `logout()`,
persistidos en `localStorage` bajo `sim_role`. **El rol lo decide la contraseña**
(`administrador`, `auditor`, `capturista`; cualquier otra cae en capturista).
Eso es maqueta para enseñar el flujo — no valida nada. La autenticación real irá
con **Supabase Auth**.

Dos invariantes que ya costaron un bug cada una:

- **Cerrar sesión tiene que llamar `logout()`, no solo navegar.** Los sidebars
  hacían `navigate('/')` a secas y la sesión seguía viva.
- **`RutaProtegida` redirige a `/`, no a `/login`.** Al limpiarse el rol, el
  guard se dispara *antes* de que corra el `navigate` de quien cerró sesión; si
  apuntara al login, todo cierre de sesión rebotaría ahí.

## El módulo de roles viene de otro proyecto

`components/perfiles/`, `components/bitacora/`, `admin-map-viewer` y
`admin-layout` se trasplantaron del frontend de **SESIM**, otra plataforma del
mismo gobierno. Eso explica sus rarezas:

- Traen **CSS global escrito a mano**, no Tailwind; pasarlos a Tailwind está
  pendiente en otra rama. Mientras tanto quedan dos clases definidas dos veces,
  y al ser CSS global gana el último import: `.form-input` (`index.css` y
  `perfiles/capturista/capturista.css`) y `.header` (`index.css` y
  `geovisor/admin-map-viewer.css`).
- `admin-map-viewer.tsx` importa cinco hojas de estilo, tres de ellas de otros
  roles, así que el CSS de un rol se carga siempre que se carga el visor
  institucional, sea el rol que sea.
- Usa **Leaflet declarativo** (`react-leaflet`), al contrario que el visor
  público, que lo usa imperativo. Son dos modelos mentales para el mismo
  problema; no comparten selector de fondo, zoom ni medición. Hoy no molesta
  porque no dibuja cartografía real — es una maqueta de interacción, no una
  segunda implementación terminada.
- **Sus datos son mock en el estado del componente.** `admin-map-viewer` no hace
  ningún `fetch`, y `catalogo-prueba.json` son catálogos de muestra: los
  definitivos vendrán del backend.
- Su header quedó fuera. **Hay un solo header**, el de PEOTDU, que con sesión
  pasa a blanco con iconos grises (`.header--sesion`).
- Las alturas de `admin.css` van en `height: 100%`, no en `calc(100vh - Xpx)`:
  la versión de SESIM restaba una altura de header fija y dejaba una franja al
  fondo.

## Datos y simbología: hay generaciones conviviendo

**El visor usa la vieja.** En uso: los `.geojson` sueltos de `public/layers/`
filtrados por `available.json`, con los volcados `public/estilos/*.json` (árbol
anidado) y `public/estilos/nuevos/<módulo>/` (plano, con `nombre_tabla`).

**Preparada y sin conectar:** `public/layers/GeoJSON/` descrita por
`public/layers/catalogo.json`, con su simbología en
`public/estilos/JSON_SIMBOLOGIA/` (un archivo por mapa). La clasificación por
ejes del catálogo se dedujo de los prefijos de carpeta y **está por confirmar**.

De los dos volcados en uso ninguno reemplaza al otro: el nuevo trae más capas
pero **dejó de exportar la forma del marcador, el desplazamiento y el ángulo**,
así que varios módulos se quedan en el viejo a propósito. `stylesFrom` deja que
un volcado aporte el árbol y el orden mientras otro conserva la simbología;
Mapa Base lo usa así.

`qgisSymbology.ts` acepta los dos esquemas de campos (`tipo`/`propiedades` y
`clase`/`props`). Lo que **no** entiende es `RuleRenderer`: una capa con ese
renderizador no se dibuja ni sale en la leyenda, **sin error en consola**. Se
resuelve cambiándola a categorizada en QGIS.

Como las dos generaciones nombran distinto la misma capa (la nueva bajó los
nombres a minúscula y sin acentos), los ids se comparan **normalizados**. Y
`norm()` está **duplicada** en `lib/cartografia.ts` y en
`module-layer-selector.tsx`: son dos copias de la regla que decide si dos ids son
el mismo, así que **si se cambia una hay que cambiar la otra**. Todo esto —
`norm()`, `TABLE_ALIASES`, las excepciones por peso — es deuda con fecha de
caducidad: en SQL el id es la llave primaria y se borra.

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
capa sin necesitar los datos y aplica los mismos descartes, así que lo que el
mapa no pinta tampoco se lista. Su muestra la dibuja `toSwatchSvg`, que vive en
el adaptador porque las tramas de relleno inyectan `<pattern>` en el documento.

**Nunca una tabla de colores en paralelo.** La leyenda ya se rompió así una vez:
sus ids escritos a mano dejaron de coincidir con los de las capas y el recuadro
desapareció entero, sin error en consola.

**Antes de tocar la simbología** lee
[docs/simbologia-qgis-web.md](docs/simbologia-qgis-web.md): tiene las reglas ya
resueltas que es fácil romper sin darse cuenta y las limitaciones conocidas de
Leaflet y del volcado. Para lo que hay que exigirle a quien entrega la
cartografía, ver
[docs/especificacion-entrega-cartografia.md](docs/especificacion-entrega-cartografia.md).

Para la arquitectura completa —lenguajes y por qué, reparto de componentes, y qué
cambia con el backend— ver
[docs/arquitectura-frontend.md](docs/arquitectura-frontend.md), que además lleva
la deuda técnica conocida y los comandos para verificar cada afirmación.

**`docs/` está en `.gitignore`** por decisión del proyecto: quien clone el repo
no los tendrá y se comparten a mano.

## Mapa base

Esri Light/Dark Gray Canvas, en el visor público y en el institucional. Se dejó
CARTO porque **ahora exige API key** y estampa «API KEY REQUIRED» sobre las
teselas — y Esri lleva el mismo camino, así que no es una apuesta segura: no es
open source ni tiene SLA.

Va **sin la capa `*_Reference`** porque sus topónimos son exónimos en inglés
(«Havana», no «La Habana»); los nombres que quedan vienen horneados en el raster
y no se pueden quitar ni desde las capas ni desde la exportación de QGIS. Y con
`maxNativeZoom: 16`, porque el teselado de Esri no pasa de z16 y sin eso el mapa
se queda en blanco al acercar más.

Ojo con el nombre: **«mapa base» son dos cosas distintas.** El *módulo*
`mapa_base` se configura en `appConfig.ts` como cualquier otro; el *fondo de
teselas* está escrito a mano en `map-viewer.tsx` y, por separado, en
`admin-map-viewer.tsx`. Cambiar de proveedor obliga hoy a editar dos archivos —
deberían estar en `appConfig`.

El visor institucional además ofrece **teselas de Google** (`mt1.google.com/vt`),
un extremo no documentado ni licenciado para producción. Conviene retirarlo
antes de publicar.

Toda la plataforma trabaja en **EPSG:4326** y así lo declara al usuario
(`login-card.tsx`, y el modal de carga solo acepta 4326). **El visor no
reproyecta**: la reproyección es responsabilidad de quien entrega la cartografía.

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

Los volcados describen muchas más capas de las que hay en disco; el resto se
descarta con `available.json`. No es un bug del frontend.

`visible_qgis` **no sirve** para deducir qué capas arrancan encendidas: los
volcados se exportaron con un solo módulo activo, así que las demás salen todas
en `false`. Por eso `defaultLayers` se declara a mano.

### Grupos de capas

`MODULES_CONFIG[].groups` convierte varias capas en **una sola fila** del menú,
para acotar la interacción del usuario. El switch, la opacidad y las flechas
actúan sobre el bloque completo y sus capas dejan de tener control propio.
Agregar un grupo es solo declararlo: `ModuleLayerSelector` trabaja contra
*entradas* (capa suelta o grupo), no contra capas.

No es lo mismo que `FIXED_LAYERS`: un grupo sí aparece en el menú y sí se puede
apagar.

- La leyenda **no cambia**: sigue listando cada capa con su simbología, porque se
  calcula desde las capas dibujadas y no desde el menú.
- Un grupo se vuelve un **bloque contiguo** en el orden de dibujo, en la posición
  de su capa más alta. Hace falta para que las flechas signifiquen algo, pero
  desvía el orden del árbol de QGIS: antes de agrupar capas dispersas, comprueba
  que la que sube no tape a las que quedan debajo (un relleno sólido sí; un
  punto, una línea fina o una trama, no).
- El contador del encabezado cuenta **capas dibujadas**, no filas: un módulo
## Catálogo de Instrumentos Normativos

Módulo de consulta documental territorial (`/catalogo`, implementado en `src/pages/catalogo.tsx` y estilizado en `src/styles/catalogo.css`). Hoy funciona con datos en memoria desde `src/data/instrumentosData.ts` y archivos locales en `public/Instrumentos/`.

### Acervo documental y nomenclatura de archivos
- **Universo de datos**: 34 instrumentos totales derivados de `public/Dataset (1).xlsx`.
- **Instrumentos caducos**: 2 registros sin documento oficial (`PDU-CAN-CAM-2000` y `PDU-PAL-CAM-2000`), marcados con `linkPdf: null` (en UI: «PDF en digitalización»).
- **Instrumentos vigentes**: 32 registros con archivo PDF físico disponible en `public/Instrumentos/`. Incluye `PDU-CHAM-CAM-2005` integrado y vinculado.
- **Nomenclatura canónica**: Todos los archivos se renombraron de sus nombres heterogéneos originales a su clave oficial `{id}.pdf` (ej. `PDU-ESC-CAM-2004.pdf`, `PEOTDU-CAM-2023.pdf`, `PMDU-CAM-CAM-2020.pdf`).

### Optimización de peso para Git y despliegue
- La carpeta original sumaba 1.85 GB con PDFs escaneados de hasta 644 MB (incompatibles con el límite de 100 MB por archivo de GitHub).
- Se ejecutó compresión por lotes con `PyMuPDF` (`fitz`) + `Pillow` (script en `scratch/compress_all.py`), recomprimiendo páginas ráster a 150 DPI / JPEG 65-70% con limpieza de streams y garbage collection.
- **Resultado**: Reducción a 754 MB totales (-1.01 GB ahorrado, -58%). **0 archivos superan 100 MB** (el más pesado pasó de 644 MB a 89 MB).
- **Para producción**: Los PDFs deben migrarse a un bucket de almacenamiento de objetos (Supabase Storage o Cloudflare R2 / S3) y la carpeta `public/Instrumentos/` debe añadirse a `.gitignore` para no inflar el historial de Git ni saturar el límite de build estático en Vercel.

### Decisiones de interfaz y componentes
- **Tarjetas (`.instrument-card`)**: Los botones «Ver ficha técnica» y «Descargar PDF» se agrupan a la derecha dentro de `.instrument-actions-group` al interior de `.instrument-meta-grid`. Se eliminó el bloque inferior `.instrument-card-actions`.
- **Estilo de botón de descarga**: Gris claro en reposo (`#f3f4f6`, borde `var(--border-color)` y texto `var(--c-gray-dk)`), pasando a rojo guinda (`var(--c-guinda)`) con texto e icono blancos en `:hover`.
- **Modal de ficha técnica (`.catalogo-modal-body`)**: Se retiró el botón secundario inactivo (`.modal-doc-btn--secondary`) y se unificó la acción de descarga como «Descargar PDF» (`.modal-doc-btn--primary`), manteniendo el mismo comportamiento de descarga directa (`download`) y estilo gris con hover guinda.
- **Filtros laterales (`.catalogo-sidebar`)**: Ordenados verticalmente como Escala → Tipo de Instrumento → Vigencia → Año de Publicación (menú desplegable en la parte inferior). La búsqueda en el encabezado filtra por nombre/id (excluye municipios) y el filtro de municipios se maneja mediante selector desplegable compacto contiguo.

## Convenciones

- Comentarios y textos de UI **en español**.
- Los comentarios explican el *porqué*, no el *qué*. Si algo parece raro pero
  es intencional (una semántica de QGIS, un límite de Leaflet), decirlo.
- **Nombres de archivo en minúsculas y kebab-case** en `components/`, `pages/` y
  `context/`. `lib/`, `data/` y `config/` conservan camelCase porque sus nombres
  están citados en este archivo y en `docs/`.
- Cambios quirúrgicos: no refactorizar de paso lo que nadie pidió tocar.
- Verificar de verdad antes de dar algo por terminado. Para el mapa eso
  significa levantar el visor y contar elementos en el DOM, no asumir que
  compiló. Varios bugs de este proyecto solo aparecieron así.

## Trampas del entorno

- **Windows no distingue mayúsculas y Linux sí.** Un import con la caja
  equivocada compila aquí y truena en el deploy. Ya pasó dos veces. Al verificar
  un renombrado, compara los nombres exactos contra el disco: `Path.resolve()`
  de Python normaliza la caja y da falsos OK.
- `React.StrictMode` está activo: los efectos corren dos veces. Las capas de
  Leaflet cacheadas en refs deben limpiarse en el cleanup del mapa, y los
  `fetch` deben verificar que el mapa siga vivo antes de añadir nada.
- Los marcadores de punto se componen **una sola vez** al crear la capa. Por eso
  `MapViewer` no dibuja una capa hasta conocer su simbología.
- Si una capa **no se ve y la consola está limpia**, sospecha del CRS antes que
  del render: mira la primera coordenada de su GeoJSON. Ya pasó una vez con una
  tabla que declaraba 4326 con coordenadas proyectadas.
- **`AGENTS.md` en la raíz está obsoleto** y contradice a este archivo: describe
  el proyecto como `figma-make-app`, cita `src/App.tsx` (hoy `src/app.tsx`), un
  `.mise.toml` que no existe y un servidor en el 8443. Pendiente de borrar.
- `public/` pesa cientos de MB de cartografía. Está fuera del watcher de Vite a
  propósito; si lo quitas de `watch.ignored`, el arranque se vuelve lentísimo.

## Mantener este archivo

Cada línea de aquí se paga en todas las sesiones siguientes, y un dato
desactualizado hace más daño que una omisión. Cuando se cierre un cambio que
altere cómo se entiende el proyecto y el usuario pase a otro tema, propón
actualizarlo. El procedimiento está en la skill `actualizar-contexto`.
