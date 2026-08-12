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

Habrá autenticación con **Supabase Auth** y cuatro tipos de usuario: uno público
y tres institucionales con permisos distintos entre sí. Qué puede hacer cada
perfil institucional todavía no está definido, así que no lo asumas: pregúntalo
antes de diseñar nada que dependa de ello.

Hoy `LoginCard.tsx` es solo maqueta — su `handleSubmit` no llama a nada. No hay
sesión, ni rutas protegidas, ni roles.

## Pipeline de cartografía (Actualizado para Migración a Backend)

Anteriormente, existía un script llamado `extract_gpkg.py` y una carpeta `cartografia/` que convertían los archivos `.gpkg` de QGIS en los archivos `.geojson` que hoy viven en `public/layers/`. 

**Estos elementos de andamiaje fueron eliminados** del repositorio como paso previo a la migración hacia Supabase (PostgreSQL + PostGIS). 
- El nuevo flujo de trabajo requiere que la cartografía se suba manualmente y 1 a 1 desde QGIS hacia la base de datos de Supabase, para garantizar control de calidad.
- Los archivos `.geojson` en `public/layers/` y `available.json` se conservan **solo temporalmente** para que el visor siga funcionando mientras se conecta el backend.
- Para consultar el historial de los defectos que el script reparaba (mojibake, etc.), consultar [docs/pipeline-cartografia.md](docs/pipeline-cartografia.md), ya que esas limpiezas ahora deberán realizarse manualmente o en la base de datos.

## Volcados de simbología: hay dos generaciones

`public/estilos/*.json` es el volcado **viejo** (árbol anidado por grupos);
`public/estilos/nuevos/<módulo>/` es el **nuevo** (plano, con `nombre_tabla`).
`ModuleLayerSelector` lee los dos y ninguno reemplaza al otro: el nuevo trae más
capas pero **dejó de exportar la forma del marcador, el desplazamiento y el
ángulo**, así que varios módulos se quedan en el viejo a propósito. `stylesFrom`
deja que un volcado aporte el árbol y el orden mientras otro conserva la
simbología; Mapa Base lo usa así.

En el repo **solo quedan los volcados que algún módulo carga**: migrar otro
módulo al formato nuevo exige volver a exportarlo desde QGIS.

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
resueltas que es fácil romper sin darse cuenta (conversión de unidades,
composición de puntos, semántica de los rangos graduados) y las limitaciones
conocidas de Leaflet y del volcado. Para lo que hay que exigirle al equipo que
entrega la cartografía, ver
[docs/especificacion-entrega-cartografia.md](docs/especificacion-entrega-cartografia.md).

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

Los volcados describen muchas más capas de las que traen los GeoPackage; el resto
se descarta con `available.json`. No es un bug del frontend.

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

## Mantener este archivo

Cada línea de aquí se paga en todas las sesiones siguientes, y un dato
desactualizado hace más daño que una omisión. Cuando se cierre un cambio que
altere cómo se entiende el proyecto y el usuario pase a otro tema, propón
actualizarlo. El procedimiento está en la skill `actualizar-contexto`.

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
- Si una capa **no se ve y la consola está limpia**, sospecha del CRS antes que
  del render: mira la primera coordenada de su GeoJSON. Ya pasó una vez con una
  tabla que declaraba 4326 con coordenadas proyectadas (ver `CRS_REAL`).
