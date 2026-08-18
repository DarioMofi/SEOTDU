# Migración de Filtro Espacial a Backend (Supabase / PostGIS)

Actualmente, el visor web utiliza un **"filtro visual"** (una máscara de polígono invertido) para tapar las capas que están fuera del municipio seleccionado. Esto significa que el navegador sigue descargando, procesando y renderizando la cartografía completa del estado.

Para la migración de cartografía al backend con **Supabase** y la extensión **PostGIS**, el enfoque cambiará radicalmente: pasaremos de un filtro visual a un **recorte de datos (clipping) real en la base de datos**.

## Arquitectura de la Solución

### 1. Endpoint RPC en Supabase
En la base de datos PostgreSQL, se creará una función `RPC` (Remote Procedure Call) que recibirá dos parámetros:
- `p_capa`: El nombre o ID de la capa a consultar (ej. "uso_suelo").
- `p_municipio_id`: El ID del municipio seleccionado (ej. "carmen").

### 2. Recorte Espacial con `ST_Intersection`
La función RPC utilizará PostGIS para evaluar la intersección espacial entre la geometría de la capa y el límite del municipio.

> **Importante:** No usaremos `ST_Intersects` (solo filtrar), sino `ST_Intersection` (recortar).
> Si un polígono de uso de suelo cruza la frontera del municipio, `ST_Intersection` cortará el polígono por la mitad, devolviendo *únicamente* la porción que está dentro del municipio.

**Ejemplo del SQL de la función:**
```sql
CREATE OR REPLACE FUNCTION get_capa_filtrada(p_capa text, p_municipio_id text DEFAULT NULL)
RETURNS json AS $$
DECLARE
  v_limite geometry;
BEGIN
  -- 1. Obtener la geometría del municipio seleccionado
  IF p_municipio_id IS NOT NULL THEN
    SELECT geom INTO v_limite FROM limites_municipales WHERE id = p_municipio_id;
  END IF;

  RETURN (
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'features', COALESCE(json_agg(
        json_build_object(
          'type', 'Feature',
          'properties', c.properties,
          -- 2. Recortar la geometría (clip) a los límites del municipio
          'geometry', ST_AsGeoJSON(
            CASE 
              WHEN v_limite IS NOT NULL THEN ST_Intersection(c.geom, v_limite)
              ELSE c.geom
            END
          )::json
        )
      ), '[]'::json)
    )
    FROM capas c
    WHERE c.layer_id = p_capa
    AND (v_limite IS NULL OR ST_Intersects(c.geom, v_limite))
  );
END;
$$ LANGUAGE plpgsql;
```

### 3. Modificaciones en el Frontend

Una vez implementada la función en Supabase, el frontend simplificará su código:

1. **Eliminar el código de máscara visual**: Se eliminará el bloque que crea el polígono invertido y los paneles (`maskPane`) en `MapViewer.tsx`.
2. **Actualizar el Servicio**: En `src/lib/cartografia.ts`, la función `getCapaGeoJSON` se conectará a Supabase en lugar de leer archivos locales:
   ```typescript
   export async function getCapaGeoJSON(layerId: string, municipioId?: string): Promise<any> {
     const { data, error } = await supabase.rpc('get_capa_filtrada', { 
       p_capa: layerId, 
       p_municipio_id: municipioId 
     });
     if (error) throw error;
     return data;
   }
   ```
3. **Forzar recarga en el Mapa**: En `MapViewer.tsx`, el `useEffect` que carga las capas reaccionará al cambio de `selectedFeature`, forzando a vaciar las capas viejas y hacer peticiones nuevas con el ID del municipio.

## Beneficios del Backend

*   **Rendimiento Drástico:** El navegador solo descargará kilobytes de información en lugar de megabytes. Si la capa del estado pesa 50MB, recortarla a un municipio pequeño devolverá solo unos cuantos kilobytes.
*   **Seguridad e Integridad:** Los datos fuera del municipio simplemente no existirán en la memoria del navegador.
*   **Simplicidad de UI:** Al no usar máscaras visuales ni jugar con los z-indexes del mapa, se evitan problemas de clics fantasmas en marcadores tapados visualmente.

### 4. Cálculo de Estadística Descriptiva en Backend (Nuevo)

Con la reciente adición del módulo de "Estadística Descriptiva" en el panel lateral (`SidebarControl.tsx`), será necesario calcular estos agregados reales en el backend mediante **PostGIS** en lugar de generarlos en el cliente.

Para alimentar las gráficas (ej. uso de suelo y zonificación), se recomienda crear funciones RPC específicas que devuelvan los cálculos de área total:

**Ejemplo de SQL para Estadísticas de Área:**
```sql
CREATE OR REPLACE FUNCTION get_estadistica_uso_suelo(p_municipio_id text DEFAULT NULL)
RETURNS json AS $$
DECLARE
  v_limite geometry;
BEGIN
  -- 1. Obtener la geometría del municipio (o nulo para todo el estado)
  IF p_municipio_id IS NOT NULL THEN
    SELECT geom INTO v_limite FROM limites_municipales WHERE id = p_municipio_id;
  END IF;

  RETURN (
    SELECT json_agg(
      json_build_object(
        'categoria', uso_suelo,
        -- Calcular superficie en Hectáreas usando el área de la intersección
        'superficie_ha', sum(
          ST_Area(
            CASE 
              WHEN v_limite IS NOT NULL THEN ST_Intersection(geom, v_limite)
              ELSE geom
            END::geography
          )
        ) / 10000
      )
    )
    FROM capas
    WHERE layer_id = 'uso_suelo'
    AND (v_limite IS NULL OR ST_Intersects(geom, v_limite))
    GROUP BY uso_suelo
  );
END;
$$ LANGUAGE plpgsql;
```

**Impacto en Frontend:**
- El componente `SidebarControl.tsx` pasará de tener variables `barVals` y `pieVals` simuladas por un algoritmo hash, a disparar una petición asíncrona hacia Supabase pasándole el ID del municipio seleccionado (o `null` si la escala es Estatal).
- Las gráficas SVG se renderizarán directamente sobre este flujo de datos verídico calculando los porcentajes exactos (`superficie_ha / total_ha * 100`).
