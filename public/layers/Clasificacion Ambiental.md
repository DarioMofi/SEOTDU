# Monitor ambiental – Campeche

Listado de temas, subtemas y capas utilizadas.

Fuente: Trazabilidad-Ambiental_docx.pdf (SEDUMOP, Gobierno del Estado de Campeche)

Nomenclatura aplicada:
- **Tema** = sección temática del documento original
- **Subtema** = tema del documento original (nombre respectivo: Provincias fisiográficas, Geología, etc.)
- **Capas utilizadas** = nombre exacto tal como aparece en el documento

---

## Tema: Medio físico – Geología, geomorfología y edafología

### Provincias fisiográficas
- C04_MFNProvinciasFisiograficas_INEGI_2023.shp
- C04_MFNSubprovinciasFisiograficas_INEGI_2023.shp

### Geología
- C04_MFNGeología_INEGI_2023

### Geomorfología y topografía
- C04_MFNPrincipalesElevaciones_INEGI_2023
- C04_MFNTopoformas_INEGI_2023

### Edafología
- C04_MFNEdafología_INEGI_2023

---

## Tema: Clima y cambio climático

### Clima
- C04_MFNClima_INEGI_2023

---

## Tema: Recursos hídricos

### Hidrología
- C04_MFNCuencaFuncional_INEGI_2023

---

## Tema: Cobertura vegetal y usos de suelo

### Vegetación y usos de suelo
- C04_MFNUsoSueloVegetación_INEGI_2023

---

## Tema: Biodiversidad y conservación

### Áreas Naturales Protegidas y Sitios Prioritarios para la Conservación
- C04_ADVC_CONANP_CONABIO_2022
- C04_AICAS_CONABIO_2023
- C04_AICONSERVACIONA_CONABIO_2023
- C04_ANPEstatal_CONANP_CONABIO_2022
- C04_ANPFederal_CONANP_CONABIO_2022
- C04_ZNANP_CONANP_2023
- C04_RAMSAR_CONANP_CONABIO_2023
- C04_RAMSARpunto_CONANP_CONABIO_2023
- C04_RHPrioritarias_CONABIO_2004
- C04_RMARPrioritarias_CONABIO_2004
- C04_RMARPrioritarias_CONABIO_2023
- C04_RTPrioritarias_CONABIO_2004
- C04_RTPrioritarias_CONABIO_2023

---

## Tema: Servicios ecosistémicos

### Deforestación y degradación forestal
- C04_DEFORESTACION_INEGI_2021
- R04_PERDIDAARBOREA_OPMATPG_2023
- R04_DIFEREVI_OPMATPG_2023

### Pérdida de la biodiversidad
- R04_ICAPITALNATURA_CONABIO_2018
- R04_IBIODIVERSIDAD_CONABIO_2018
- R04_IIMPACTOANTROPOGENICO_CONABIO_2018
- R04_POTENCIALESPECIESRIESGO_CONABIO_2018
- R04_AMENAZABIODIVERSIDAD_CONABIO_2018

### Erosión y degradación de suelos
- C04_EROSIONSUELO_INEGI_2014
- C04_DEGRADACIONSUELO_INECC_2012

### Disponibilidad de agua en cuencas y acuíferos
- Ninguna

### Producción y disposición final de residuos sólidos
- Ninguna

---

## Notas e inconsistencias detectadas en el documento original

1. **Geología**: la capa se declara como "Desconocido. Probablemente: C04_MFNGeología_INEGI_2023".
2. **Topoformas**: en el cuerpo del texto aparece como `C04MFNTopoformas_INEGI_2023` (sin guion bajo después de C04) y en la tabla resumen como `C04_MFNTopoformas_INEGI_2023`.
3. **Edafología**: en el cuerpo aparece como `C04_MFNEdafología_INEGI_2023` (singular) y en la tabla resumen como `C04_MFNEdafologías_INEGI_2023` (plural).
4. **Producción y disposición final de residuos sólidos**: declara sus propias variables (generación de residuos sólidos urbanos por municipio, concentración de la generación, sitios de disposición e industria de tratamiento), pero las secciones Analítica y Tabla resumen reproducen literalmente el contenido del tema de Disponibilidad de agua. Aparente error de edición.
5. El bloque de Disponibilidad de agua en cuencas y acuíferos aparece duplicado (páginas 20-21).

### Marcas de estatus usadas en el documento

- (1) No se encuentra enlistado en el dataset pero sí se encuentra en el drive
- (2) Archivos incompletos en el drive
- (3) Las capas no están listadas en el dataset ni se encuentran en el drive
- (4) Dos o más conjuntos de archivos con el mismo nombre en el drive
