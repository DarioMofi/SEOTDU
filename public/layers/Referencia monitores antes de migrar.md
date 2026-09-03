# Referencia: cómo se veían los monitores antes de migrar a la entrega nueva

Medido en el geovisor con los archivos sueltos de `public/layers/`, justo antes
de abrir el índice de `cartografia.ts` a todos los mapas del catálogo.

Sirve para comparar después de la migración: si alguna cifra baja, esa capa
dejó de dibujarse y hay que revisarla antes de dar el cambio por bueno.

| Monitor | capas activas | archivos pedidos | entradas de leyenda |
|---|---|---|---|
| Ambiental | 13 | 13 | 37 |
| Social | 11 | 11 | 35 |
| Infraestructura | 14 | 14 | 41 |
| Económico | 9 | 9 | 40 |
| Modelo de Ordenamiento Territorial | 1 | 1 | 36 |
| Mapa Base | 15 | 15 | — |

Mapa Base ya estaba migrado cuando se tomó esta referencia.

Para volver atrás: `MAPAS_MIGRADOS` en `src/lib/cartografia.ts` acota qué mapas
leen de `public/layers/GeoJSON/`. Dejarlo en `['mapa_base']` restaura este
estado.

## Resultado de la migración

Los cinco monitores quedaron **iguales a esta referencia** leyendo ya de
`public/layers/GeoJSON/`. Se verificó archivo por archivo y contando entradas
de leyenda.

Lo que costó encontrarse: al ampliar también `getCapasDisponibles` a todos los
mapas, Ambiental se llenó de capas de Social. La causa es la coincidencia laxa
por sufijo con la que `ModuleLayerSelector` resuelve los nombres del volcado
viejo: con 60 ids acertaba, con 112 empezó a emparejar capas de otro monitor.
Por eso esa lista sigue acotada y solo el índice de URLs abarca el catálogo
completo.
