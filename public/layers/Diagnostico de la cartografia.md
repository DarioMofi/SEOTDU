# Diagnóstico de la cartografía y los estilos

Revisión de la entrega en `public/layers/GeoJSON/` y de los volcados de
simbología en `public/estilos/JSON_SIMBOLOGIA/`.

**Alcance verificado:** 112 archivos GeoJSON, 113 capas declaradas en los seis
volcados de simbología, y los seis GeoPackage de origen en
`public/layers/Geopaquetes/` (111 capas entre todos).

Cada hallazgo de este documento se comprobó contra el dato, no contra el nombre
del archivo. Donde se afirma que una capa no dibuja, se contó cuántos elementos
quedan fuera.

---

## Resumen

| | |
|---|---|
| Capas con archivo y estilo | 112 |
| Capas con estilo pero **sin dato** | 1 |
| Capas que existen pero **no dibujan nada** | 2 |
| Capas cuyo estilo apunta a un campo con otra caja | 17 |
| Archivos con **texto mal codificado** | 21 |
| Capas del monitor Ambiental **que no se entregaron** | 30 |
| Símbolos que el visor no puede reproducir | 26 |

Lo más urgente son dos cosas: **el bloque de diagnóstico ambiental no existe**
y **21 archivos traen los acentos rotos**. Lo demás son defectos acotados.

---

## 1. Capas que no existen

### 1.1 Monitor Ambiental: falta el bloque de diagnóstico completo

De las **32 capas** que lista `Clasificacion Ambiental.md`, solo existen **2**:
`C04_ADVC_CONANP_CONABIO_2022` y `C04_EROSIONSUELO_INEGI_2014`.

Las otras **30 no están en ninguna parte**. Se verificó por tres vías
independientes:

1. **En los GeoPackage de origen.** `Ambiental.gpkg` contiene exactamente las
   mismas 24 capas que la carpeta GeoJSON, ni una más. Entre los seis
   GeoPackage suman 111 capas y ninguna es de las que pide el documento.
2. **En todo el disco**, buscando por `MFN`, `AICAS`, `RAMSAR`,
   `DEFORESTACION`, `PROVINCIASFISIO`, `TOPOFORMAS`: cero archivos.
3. **En los tres juegos de volcados de simbología.** Si existieran en el
   proyecto de QGIS aparecerían declaradas aunque no tuvieran datos. No
   aparecen.

No faltan capas sueltas al azar: falta **un bloque temático completo y
coherente** —todo el diagnóstico del medio físico—, mientras que lo que sí
existe es casi todo de estrategia. Eso apunta a una entrega pendiente, no a un
extravío. El propio documento lo insinúa en sus marcas de estatus: *«(3) Las
capas no están listadas en el dataset ni se encuentran en el drive»*.

**Consecuencia:** de los seis temas del monitor, cuatro quedarían
completamente vacíos y dos con una sola capa. El monitor Ambiental **no se
puede armar** con la estructura del documento.

#### Medio físico – Geología, geomorfología y edafología (6)

*Provincias fisiográficas*
- `C04_MFNProvinciasFisiograficas_INEGI_2023`
- `C04_MFNSubprovinciasFisiograficas_INEGI_2023`

*Geología*
- `C04_MFNGeología_INEGI_2023`

*Geomorfología y topografía*
- `C04_MFNPrincipalesElevaciones_INEGI_2023`
- `C04_MFNTopoformas_INEGI_2023`

*Edafología*
- `C04_MFNEdafología_INEGI_2023`

#### Clima y cambio climático (1)

*Clima*
- `C04_MFNClima_INEGI_2023`

#### Recursos hídricos (1)

*Hidrología*
- `C04_MFNCuencaFuncional_INEGI_2023`

#### Cobertura vegetal y usos de suelo (1)

*Vegetación y usos de suelo*
- `C04_MFNUsoSueloVegetación_INEGI_2023`

#### Biodiversidad y conservación (12)

*Áreas Naturales Protegidas y Sitios Prioritarios para la Conservación*
- `C04_AICAS_CONABIO_2023`
- `C04_AICONSERVACIONA_CONABIO_2023`
- `C04_ANPEstatal_CONANP_CONABIO_2022`
- `C04_ANPFederal_CONANP_CONABIO_2022`
- `C04_ZNANP_CONANP_2023`
- `C04_RAMSAR_CONANP_CONABIO_2023`
- `C04_RAMSARpunto_CONANP_CONABIO_2023`
- `C04_RHPrioritarias_CONABIO_2004`
- `C04_RMARPrioritarias_CONABIO_2004`
- `C04_RMARPrioritarias_CONABIO_2023`
- `C04_RTPrioritarias_CONABIO_2004`
- `C04_RTPrioritarias_CONABIO_2023`

#### Servicios ecosistémicos (9)

*Deforestación y degradación forestal*
- `C04_DEFORESTACION_INEGI_2021`
- `R04_PERDIDAARBOREA_OPMATPG_2023`
- `R04_DIFEREVI_OPMATPG_2023`

*Pérdida de la biodiversidad*
- `R04_ICAPITALNATURA_CONABIO_2018`
- `R04_IBIODIVERSIDAD_CONABIO_2018`
- `R04_IIMPACTOANTROPOGENICO_CONABIO_2018`
- `R04_POTENCIALESPECIESRIESGO_CONABIO_2018`
- `R04_AMENAZABIODIVERSIDAD_CONABIO_2018`

*Erosión y degradación de suelos*
- `C04_DEGRADACIONSUELO_INECC_2012`

> Los subtemas *Disponibilidad de agua en cuencas y acuíferos* y *Producción y
> disposición final de residuos sólidos* no declaran capas en el documento.

### 1.2 Modelo de Ordenamiento Territorial

De las 42 capas que lista `Clasificacion MOT.md` faltan dos:

- **`C04_Sustitución_materiales_paredes_viviendas_OPMATPG_2023`** (E3, línea
  3.3). No existe en ninguna de las dos generaciones ni en los GeoPackage.
- **`C04_Programa_abastecimiento_agua_localidades_Tren_Maya_OPMATPG_2023`**
  (E4, línea 4.2). **Tiene estilo pero nunca ha tenido geometría**: es la única
  capa declarada en un volcado sin archivo correspondiente. Ya venía así desde
  antes de esta entrega.

---

## 2. Capas que existen pero no dibujan nada

Son el peor tipo de defecto: el archivo se descarga, la capa aparece en el
menú, el interruptor responde, la leyenda se ve — **y el mapa queda vacío, sin
un solo error en consola.**

### 2.1 `C04_Puntos_Int_IMT_INEGI_2024` — 0 de 1,234 puntos

Dos problemas superpuestos:

1. **Usa un renderizador por reglas** (`RuleRenderer`). El visor solo traduce
   `singleSymbol`, `categorized` y `graduated`. El propio volcado lo advierte:
   *«RuleRenderer: visor solo entiende singleSymbol/categorized/graduated»*.
2. **Aunque se implementara, seguiría sin dibujar.** Sus reglas filtran por
   `CLASE = 'Aeropuerto' | 'Puerto' | 'Pista Aérea'`, pero en el dato ese campo
   contiene *Lugar de Esparcimiento* (444), *Lugar de Culto* (193),
   *Cementerio* (118), *Estación de Abastecimiento de Combustible* (83),
   *Atractivo Turístico* (59)… **El estilo y el dato no corresponden**: son de
   cosechas distintas.

*Qué se necesita:* reasignarle un estilo acorde a su contenido real, o
sustituir el dato. Como es una capa de puntos de interés general, lo natural
sería categorizarla por `clase`.

### 2.2 `C04_ConcentracionGeneracionResiduos_INEGI_PEPGIRSSU_2020` — 0 de 2,762

El estilo clasifica por **`GEN__kg_d`** (dos guiones bajos) y el dato trae
**`gen_kg_d`** (uno solo). No es un problema de mayúsculas: es otro nombre.

Además su clasificación graduada incluye un **rango vacío**: `150.0 – 150.0`.

*Qué se necesita:* corregir el nombre del campo en el estilo y revisar los
cortes de la graduación.

---

## 3. Los nombres de campo cambiaron de caja al exportar

**17 capas** tienen un estilo que clasifica por un campo en MAYÚSCULAS
(`G_URBANO`, `TIPO_OD`, `POB1`, `CNDICON`, `ADMINISTRA`…) mientras el GeoJSON
lo exporta en minúsculas (`g_urbano`, `tipo_od`, `pob1`…).

El visor ya lo tolera —busca el campo ignorando la caja—, así que **hoy no
rompe nada**. Se documenta porque explica un episodio que costó encontrar: al
integrar la entrega, **7 de las 19 capas del Mapa Base dibujaban cero
elementos** y el mapa se veía casi vacío, sin errores.

Capas afectadas: `c00_rfn_artf_2024`, `c04_centralidadeconomica_ce_denue_2019`,
`c04_erosionsuelo_inegi_2014`, `c04_estaciones_rfn25`,
`c04_iresilienciacambioclimatico_opmatpg_2023`, `c04_localidades_iter_inegi_2020`,
`c04_localidades_rurales_2024`, `c04_muneconomicas_ce_inegi_2019`,
`c04_scince_localidad_urbana_inegi_2020`, `c04_scince_manzana_inegi_2020`,
`c04_sequialx_opmatpg_2023`, `c04_sequiamx_opmatpg_2023`, `c04_ttrop_noaa_2023`,
`c04_vivienda_iter_inegi_2020`, `c04_modelo_ordenamiento_territorial_op_pg_2023_cp`,
`c04_programa_reconversion_productiva_agropecuaria_sda_2023`,
`c04_red_regional_imt_inegi_2024`.

*Recomendación:* que la exportación conserve el nombre original del campo. Es
la causa raíz y evita depender de una compensación en el visor.

---

## 4. Texto mal codificado (mojibake)

**21 de los 112 archivos** traen los acentos rotos. No es un detalle estético:
son nombres de localidad que el usuario lee en los popups y en las etiquetas.

| archivo | ocurrencias | ejemplos |
|---|---|---|
| `c04_localidades_iter_inegi_2020` | 397 | `LÃ¡zaro CÃ¡rdenas`, `Adolfo LÃ³pez Mateos` |
| `c04_advc_conanp_conabio_2022` | 90 | `Tierras de Uso ComÃÂẃn` |
| `c04_patrimonioinmaterial_sic_2023` | 17 | `BolonchÃ©n de RejÃ³n`, `CalkinÃ­` |
| `c04_estaciones_rfn25` | 12 | `XcÃ¡n`, `EscÃ¡rcega` |
| `c04_efpatrimonioinmble_sic_2023` | 11 | `EstaciÃ³n HecelchakÃ¡n` |
| `c04_equipamientos_salud_opmatpg_2023` | 4 | `BolonchÃ©n de RejÃ³n, HopelchÃ©n` |
| `c04_anp_estatal_balamkin_balamku_conabio_2020` | 4 | `Zona Sujeta a ConservaciÃ³n EcolÃ³gica` |
| …y 14 archivos más | | |

*(Conteo sobre los primeros 600 KB de cada archivo; en los grandes puede
haber más.)*

Un caso llega a estar **doblemente codificado** (`ComÃÂẃn`), lo que indica
que el texto pasó dos veces por la misma conversión equivocada.

*Qué se necesita:* exportar declarando UTF-8. Vale la pena señalar que el
pipeline anterior del proyecto reparaba este defecto automáticamente; al
retirarse, reapareció.

---

## 5. Símbolos que el visor no puede reproducir

### 5.1 SVG guardados en el lugar equivocado (4 símbolos, 2 capas)

En `C04_EstacionesTM_SEDATU_2024` y `C04_Puntos_Int_IMT_INEGI_2024`, el
exportador dejó `props.name` **vacío** y metió el SVG completo, en base64,
**dentro del texto de una alerta** que dice «SVG no encontrado».

El dibujo está completo y es recuperable —se comprobó decodificándolo—, pero
ningún visor lo va a buscar ahí. Sin eso, el marcador cae a un punto de
respaldo.

### 5.2 SVG que el visor no tiene (2 capas)

| capa | SVG que pide |
|---|---|
| `C04_ZonasArqueologicas_SIC_2023` | `poi_peak.svg` |
| `C04_EAdmin1_INEGI_2023` | `religion=christian.svg` |

Son iconos de la biblioteca de QGIS que no viajan en el volcado. Se dibujan
como un disco del color declarado.

> Nota: `religion=christian.svg` para una capa de *Equipamiento Administrativo*
> parece un símbolo mal asignado en el proyecto de QGIS.

### 5.3 Fuentes tipográficas de ESRI (20 símbolos, 12 capas)

El volcado las marca como *«no reproducible en web»*. Son glifos de fuentes
propietarias de ESRI que no existen en el navegador.

| fuente | símbolos | capas |
|---|---|---|
| ESRI Enviro Hazard Analysis | 10 | 4 |
| ESRI Hazardous Materials | 3 | 2 |
| ESRI Surveyor | 3 | 3 |
| ESRI Enviro Hazard Incident | 2 | 1 |
| ESRI AMFM Electric | 1 | 1 |
| ESRI IGL Font23 | 1 | 1 |

Capas afectadas: centros de abasto, PTAR, equipamientos de salud, sustitución
de materiales, transporte de carga, residuos sólidos, producción de arroz,
corredor Puebla-Progreso, núcleos lecheros, planta de biocombustible, hospital
Centenario y parque industrial textil.

*Qué se necesita:* sustituirlos en QGIS por marcadores SVG o formas simples.

### 5.4 Colores que se confunden entre sí

`C04_EstacionesTM_SEDATU_2024` venía con el pictograma en **negro puro**
(`0,0,0`) y contorno casi negro, sobre un mapa donde los aeropuertos son azul
oscuro (`8,48,107`) y las estaciones ferroviarias gris (`74,74,74`). Tres
marcadores oscuros indistinguibles entre sí.

---

## 6. Defectos en las clasificaciones

### 6.1 Categorías declaradas que el dato no tiene (4 capas)

| capa | categoría sin datos |
|---|---|
| `c04_scince_localidad_urbana_inegi_2020` | `Sin dato` |
| `c04_sequialx_opmatpg_2023` | `None` |
| `c04_sequiamx_opmatpg_2023` | `None` |
| `c04_ttrop_noaa_2023` | `None` |

Aparecen en la leyenda aunque no se dibuje ni un elemento con ese valor. Las
tres marcadas como `None` son además una categoría sin nombre.

### 6.2 Valores del dato sin categoría en el estilo

`c04_estaciones_rfn25` tiene **4 elementos de 54** cuyos valores de `TIPO_OD`
no están en el estilo y por lo tanto no se dibujan: *Terminal de carga* (1),
*Puerto Ferroviario Fronterizo* (1) y *Puerto Ferroviario Marítimo* (2).

### 6.3 Categorías apagadas a propósito

No son defectos, pero conviene saberlo porque explican mapas «incompletos»:

- `C04_Aeropuertos_2012` dibuja **13 de 35**: la categoría *Civil terrestre
  (Mayor)* (22 elementos) está desactivada en QGIS.
- `C04_estaciones_RFN25` dibuja **34 de 54**: la categoría *Patio* (16) está
  desactivada.

### 6.4 Capa sin ningún atributo descriptivo

`C04_CESC_OPMATPG_2023` son 145 polígonos cuyo único campo propio es `fid`.
Ni el nombre de la capa ni el dato permiten saber qué representan. Su relleno
además es transparente, así que en el mapa se ve como un contorno negro fino
que puede confundirse con curvas de nivel.

---

## 7. Peso de los archivos

### 7.1 Capas pesadas

| MB | mapa | capa |
|---|---|---|
| 93.4 | Mapa Base | `c04_red_regional_imt_inegi_2024` |
| 33.3 | Mapa Base | `c04_scince_manzana_inegi_2020` |
| 27.8 | Mapa Base | `c04_cuerpos_agua_inegi_2024` |
| 22.6 | Mapa Base | `c04_cesc_opmatpg_2023` |
| 12.6 | Mapa Base | `c00_rfn_artf_2024` |
| 12.3 | Ambiental | `c04_conservacion_y_restauracion_humedales_conabio_2020` |
| 9.2 | Económico | `c04_programa_reconversion_productiva_agropecuaria_sda_2023` |
| 8.4 | MOT | `c04_modelo_ordenamiento_territorial_op_pg_2023_cp` |
| 6.3 | Infraestructura | `c04_escobertura1ernivel_clues_opmatpg_2023` |

Encender las 19 capas del Mapa Base a la vez son **207 MB**, unos 30 segundos
y medio giga de memoria en el navegador. Las cuatro primeras de la tabla suman
177 de esos 207 MB.

### 7.2 La causa no es la geometría, son los metadatos

La entrega agrega a **cada elemento** unas 14 columnas de metadatos —`titulo`,
`tipo_dato`, `categoria`, `tema_subgrupo`, `denominacion_oficial`,
`instrumento_vigencia`, `fuente_custodio`, `proyeccion_original`…— repetidas
idénticas en todos los registros de la capa.

Comparando la misma capa en las dos generaciones:

| capa | antes | ahora | factor | campos |
|---|---|---|---|---|
| `C04_ANP_2024` → `c00_anp_conanp_2025` | 0.04 MB | 1.4 MB | **×36** | 18 → 39 |
| `C04_Loc_rur` → `c04_localidades_rurales_2024` | 0.3 MB | 3.1 MB | **×10** | 26 → 41 |
| `RNC_2025_SURESTE` → `c04_red_regional_imt_inegi_2024` | 31 MB | 93.4 MB | **×3** | 10 → 34 |

El caso de la red regional es el más claro: **mismo dato exacto** —76,897
tramos, misma geometría, mismos campos originales— pero triplicado de tamaño
por metadatos repetidos 76,897 veces.

*Recomendación:* esos metadatos describen **la capa**, no cada elemento. Su
lugar natural es el catálogo, no el GeoJSON. Sacarlos reduciría la entrega a
una fracción de su peso sin perder información.

---

## 8. Problemas de estructura y clasificación

### 8.1 Líneas estratégicas cruzadas en el MOT

`Clasificacion MOT.md` coloca tres capas bajo la estrategia **E4** cuyos
números de línea pertenecen a otras estrategias:

| línea | capa | estrategia que sugiere el número |
|---|---|---|
| 1.3 Cuidado y uso respetuoso del agua | `C04_Construcción_PTAR_OPMATPG_2023` | E1 |
| 2.1 Emprendimiento rural | `C04_Industria_Planta_Biocombustible_OPMATPG_2023` | E2 |
| 2.1 Emprendimiento rural | `C04_Parque_Industrial_Textil_OPMATPG_2023` | E2 |

Implementarlo literal haría que la línea «1.3 Cuidado y uso del agua»
apareciera colgando de E1 **y** de E4, con capas distintas en cada una.

*Resuelto en el visor* reasignando cada capa a la estrategia que le
corresponde por su número de línea, pero **convendría corregirlo en el dataset
de origen**.

### 8.2 Huecos en la numeración de líneas

El dataset solo registra nueve líneas (1.1, 1.2, 1.3, 2.1, 2.3, 3.1, 3.3, 4.1,
4.2). Faltan **2.2 y 3.2**. Puede que existan en el programa y no tengan capas
asignadas todavía.

### 8.3 `visible_qgis` no sirve para saber qué se enciende

Los volcados exportan ese campo con la visibilidad **efectiva** al momento de
exportar. Como se exportó con un solo módulo encendido, las capas de los demás
salen todas en `false`: 18 visibles en Mapa Base y **0 en los otros cinco
monitores**.

Por eso las capas que arrancan encendidas se declaran a mano en el visor.

### 8.4 Una capa apagada en QGIS no se exportó

`C00_ZonasMetropolitanas_CONAPO_2020` tiene estilo pero no venía en la entrega.
Es la única capa de Mapa Base con `visible_qgis: false`: estaba apagada en
QGIS y por eso no se exportó. Se recuperó de la generación anterior, cuyo
archivo resultó compatible.

---

## 9. Nombres inconsistentes

| capa | problema |
|---|---|
| `C04_Mejoramiento_conectividad_Corredor_Puebla-Progreso` | El estilo la nombra con guion; el archivo nuevo es `..._puebla_a_progreso_...`, con una **«a» de más**. Ya venía desde la generación anterior y requiere un alias en el visor. |
| `BUFER_ESTATAL` | El estilo la nombraba sin prefijo ni fuente ni año, contra la convención del resto de la entrega. |
| `C03_bufer_estatal_inegi_2024_2026` | Traía prefijo `C03` cuando su contenido son los **cuatro estados vecinos** (Chiapas, Quintana Roo, Tabasco, Yucatán) y no Campeche. La convención de la entrega usa `c00_` para lo multiestatal. |
| `C04_Hospital_Gneral_Centenario` | Dice «Gneral» en vez de «General». Se conserva porque cambiarlo rompería las referencias. |
| `C04_Transporte_fluvial_rÍo_Palizada` | «rÍo» con la I mayúscula a media palabra. |

---

## 10. Prioridades sugeridas

**Bloqueantes**

1. Entregar las **30 capas del diagnóstico ambiental**. Sin ellas el monitor
   Ambiental no se puede construir con la estructura acordada.
2. Corregir la **codificación de texto** en los 21 archivos afectados.

**Importantes**

3. Reasignar el estilo de `Puntos_Int_IMT` y corregir el campo de
   `ConcentracionGeneracionResiduos`: hoy son 3,996 elementos que no se
   dibujan.
4. Sacar los **metadatos repetidos** del GeoJSON al catálogo. Es la palanca
   más grande sobre el peso y el tiempo de carga.
5. Sustituir los **20 símbolos con fuentes ESRI** por marcadores reproducibles
   en web.

**Convenientes**

6. Conservar la caja original de los nombres de campo al exportar.
7. Guardar los SVG en `props.name` y no en el texto de una alerta.
8. Corregir las líneas cruzadas de E4 en el dataset del MOT.
9. Entregar las 2 capas faltantes del MOT.
10. Documentar qué representa `CESC` o darle atributos.
