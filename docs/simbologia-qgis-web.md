# Simbología QGIS → web: reglas resueltas y limitaciones

Detalle de apoyo para `src/lib/qgisSymbology.ts` (traducción pura) y
`src/lib/leafletSymbology.ts` (adaptador a Leaflet). El contrato entre los dos
módulos y los invariantes de la leyenda están en el `CLAUDE.md`; aquí vive lo
que es fácil romper sin darse cuenta.

## Detalles que ya están resueltos y conviene no romper

- Se recorre la **pila completa** de `capas_simbolo`, no solo la primera.
- Unidades: `MM` × 3.7795 y `Point` × 1.3333 (96 dpi). Nunca × 3.
- Los puntos se componen como SVG apilado en un `divIcon`; el caso de un solo
  círculo simple usa `circleMarker` por rendimiento. Consecuencia práctica al
  verificar en el DOM: esos puntos cuentan como `path`, no como
  `.leaflet-marker-icon`.
- Los rangos graduados usan la semántica de QGIS: la primera clase incluye su
  cota inferior, las demás la excluyen.

## Limitaciones conocidas

- **`QgsFontMarkerSymbolLayer`**: varias capas usan glifos de fuentes
  propietarias de ESRI que el navegador no tiene. Se dibuja un disco del color
  correcto como sustituto. Solo se arregla cambiándolos a marcadores SVG en
  QGIS. (Para saber cuáles son hoy, buscar la clase en `public/estilos/`: la
  cifra cambia cada vez que se agrega o se quita un volcado.)
- **Leaflet admite un relleno y un trazo por geometría.** Cuando QGIS apila
  varias capas de relleno en un polígono, hay que aplanarlas. Esto no se arregla
  con datos nuevos: se resolvería migrando a MapLibre.
- El volcado de estilos **no incluye** `subSymbol` (usado por `MarkerLine` y
  `FilledMarker`) ni el campo `enabled`. Se arregla en el script exportador, no
  en los GeoPackage.
- Los `QgsSvgMarkerSymbolLayer` guardan rutas absolutas del equipo autor. Los 4
  SVG en uso están reimplementados a mano en `QGIS_SVG_LIBRARY`, así que no hay
  ningún archivo `.svg` que servir desde `public/`.

Lo que hay que exigirle al equipo que entrega la cartografía está en
[especificacion-entrega-cartografia.md](especificacion-entrega-cartografia.md).
