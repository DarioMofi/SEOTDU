# Migración de Fichas Técnicas al Backend (SQL)

Este documento detalla la estrategia de migración para la lógica de la pestaña "Información" del Geovisor (fichas técnicas individuales de capa y resúmenes de mapa) una vez que el backend en **PostgreSQL/Supabase** esté implementado.

## 1. El Problema del Enfoque Actual

Actualmente (agosto 2026), para mostrar quién es la institución responsable o cuál es el instrumento normativo de las capas, el frontend realiza lo siguiente:
1. Detecta qué capas están activas (`activeLayers`).
2. Descarga de forma asíncrona sus archivos GeoJSON.
3. Extrae los atributos del *primer polígono o punto* (`features[0].properties`) asumiendo que esa información describe a toda la capa.
4. Aplica lógica de limpieza en el frontend (ej. quitar ", 2020", agrupar nombres).

**¿Por qué es insostenible?**
- **Bloqueo por Red y Memoria:** Se obliga al cliente a descargar geometrías pesadas (megabytes de coordenadas) solo para leer texto (metadatos).
- **Redundancia:** En un archivo GeoJSON con 10,000 polígonos, el texto "INEGI" o "Programa de Ordenamiento..." se repite 10,000 veces, ocupando espacio innecesario.
- **Acoplamiento:** El frontend hace trabajo pesado de limpieza (Regex, deduplicación) que debería ser responsabilidad de la calidad de los datos en origen.

---

## 2. Nuevo Modelo de Base de Datos (SQL)

Dado que toda esta información tiene una naturaleza normativa y describe a la capa en su conjunto (no a una geometría en particular), **se extraerá del componente espacial y pasará a ser parte del catálogo relacional.**

Como se acordó, la base de datos se organizará en esquemas. En el esquema normativo (o donde resida el catálogo), la tabla `capa` (mencionada en `backend_migration_guide.md`) se expandirá con las siguientes columnas descriptivas:

```sql
CREATE TABLE esquema_normativo.capa (
  id TEXT PRIMARY KEY,
  modulo_id TEXT REFERENCES modulo(id),
  etiqueta TEXT NOT NULL,
  orden INT NOT NULL,
  encendida BOOLEAN DEFAULT false,
  -- Nuevos campos de Metadatos extraídos de los GeoJSON originales:
  denominacion_oficial TEXT,
  instrumento_vigencia TEXT,
  responsable_institucional TEXT,
  fecha_actualizacion TEXT,
  cobertura_territorial TEXT,
  -- Geometría y estilos
  style_qml TEXT,
  geometria TEXT
);
```

### Impacto en la Ingesta de Datos (QGIS a PostGIS)
Al subir los datos a PostGIS, el operador deberá:
1. Rellenar estas 5 columnas a nivel de catálogo.
2. (Recomendado) Eliminar esas 5 columnas de las tablas espaciales de los polígonos para aligerar radicalmente las respuestas de la base de datos y el tamaño del vector tile / GeoJSON.
3. Estandarizar desde origen los nombres (ej. subir "INEGI" uniformemente en vez de arrastrar "INEGI, 2020", "INEGI,2020", quitando la responsabilidad del regex al frontend).

---

## 3. Estrategia de Refactorización en el Frontend

Una vez que el catálogo de la API devuelva las capas junto con sus metadatos (ej. consumiendo la vista o tabla `capa` en Supabase vía `/rest/v1/capa`), la refactorización en React eliminará por completo los tiempos de carga en la pestaña de Información.

### Cambios a realizar:

1. **Catálogo en Memoria:**
   En lugar de que `ModuleLayerSelector.tsx` lea un `available.json` plano, consumirá la tabla `capa`. Toda la metadata (responsables, instrumentos) ya vendrá incluida en el arreglo de capas disponibles desde el inicio de la sesión.

2. **Refactorización en `SidebarControl.tsx`:**
   Se eliminará el `Promise.all(activeLayers.map(...))` y todos los estados de `isLoadingMetadata` o `isLoadingModuleMetadata`.

3. **Nuevo Flujo Síncrono:**
   El frontend ya tendrá el catálogo en memoria. El cálculo de las instituciones involucradas se volverá instantáneo, pasando de esto:

   ```typescript
   // Lógica Actual (Lenta, Asíncrona)
   Promise.all(activeLayers.map(layerId => getCapaGeoJSON(layerId)))
     .then(results => /* leer features[0] y deduplicar */)
   ```

   A esto:

   ```typescript
   // Lógica Futura (Inmediata, Síncrona)
   // Suponiendo un contexto o prop `catalogoCapas` con la data de Supabase:
   const capasActivas = catalogoCapas.filter(capa => activeLayers.includes(capa.id));
   
   // Deduplicar directamente de los atributos de la capa
   const instrumentos = Array.from(new Set(capasActivas.map(c => c.instrumento_vigencia).filter(Boolean))).sort();
   const instituciones = Array.from(new Set(capasActivas.map(c => c.responsable_institucional).filter(Boolean))).sort();
   
   setModuleMetadata({ instrumentos, instituciones });
   ```

## Conclusión

Migrar esta lógica al catálogo SQL logrará un acoplamiento perfecto de responsabilidades: 
* La **Base de datos** almacenará el dato normalizado 1 sola vez en el catálogo.
* El **Backend (API)** transmitirá solo cadenas de texto ligeras al cargar el mapa.
* El **Frontend (React)** será de reacción inmediata, renderizando la pestaña de Información en 0 milisegundos sin depender de la carga de megabytes de polígonos.

---

## 4. Unificación de Vistas y Supresión de Ficha Territorial

En el rediseño reciente del frontend (en `SidebarControl.tsx`), se eliminó la sección redundante de "Ficha Territorial" que aparecía al filtrar por un municipio, consolidando la visualización en dos componentes modulares que se inyectan sin importar el estado del filtro:

1. **Estadística Descriptiva**
2. **Información del Mapa** (Instituciones responsables e Instrumentos normativos)

### Impacto en la Migración

Al usar la misma función renderizadora (`renderInformacionMapa()`) tanto en la vista general (escala estatal) como en la ficha del municipio, la arquitectura del backend se simplifica aún más:
* El panel "Información del Mapa" simplemente se alimentará de forma reactiva de los metadatos de las capas actualmente prendidas, independientemente del polígono o municipio enfocado.
* No habrá necesidad de crear endpoints de metadatos separados ni duplicar atributos descriptivos normativos dentro de las tablas espaciales municipales. El estado global del catálogo dominará la UI de forma predecible.
