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

`src/context/auth-context.jsx` expone `role`, `login(password)` y `logout()`,
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
  pendiente en otra rama. Mientras tanto sus nombres de clase chocan con los de
  PEOTDU (`.header`, `.form-input`, `.modal-overlay`, `.modal-content`): al ser
  CSS global, gana el último import.
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
**`docs/` está en `.gitignore`**: quien clone el repo no los tendrá.

## Mapa base

Esri Light/Dark Gray Canvas, en el visor público y en el institucional. Se dejó
CARTO porque **ahora exige API key** y estampa «API KEY REQUIRED» sobre las
teselas — y Esri lleva el mismo camino, así que no es una apuesta segura: no es
open source ni tiene SLA.

Va **sin la capa `*_Reference`** porque sus topónimos son exónimos en inglés
(«Havana», no «La Habana»); los nombres que quedan vienen horneados en el raster
y no se pueden quitar. Y con `maxNativeZoom: 16`, porque el teselado de Esri no
pasa de z16 y sin eso el mapa se queda en blanco al acercar más.

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
  puede decir «12 activas» y mostrar 8 filas.

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
  tabla que declaraba 4326 con coordenadas proyectadas (ver `CRS_REAL`).
- `public/` pesa cientos de MB de cartografía. Está fuera del watcher de Vite a
  propósito; si lo quitas de `watch.ignored`, el arranque se vuelve lentísimo.

## Mantener este archivo

Cada línea de aquí se paga en todas las sesiones siguientes, y un dato
desactualizado hace más daño que una omisión. Cuando se cierre un cambio que
altere cómo se entiende el proyecto y el usuario pase a otro tema, propón
actualizarlo. El procedimiento está en la skill `actualizar-contexto`.
