# Estrategias, Líneas Estratégicas y Capas (.gpkg)

Fuente: Dataset.xlsx — hoja `Estrategias_Acciones`

Jerarquía aplicada: **Estrategia** (columna `pk - Estrategia`) → **Línea Estratégica** → **Capas** (columna `Archivo (.gpkg)`, nombres exactos, sin modificar).

Total de capas: 42

---

## Estrategia: E1_Selva_tierra_y_agua

*(13 capas)*

### Línea estratégica 1.1 Protección y recualificación de la biodiversidad y los servicios ecosistémicos

- C04_ANP_Estatal_BalamKin_BalamKu_CONABIO_2020
- C04_ANP_Río_Candelaria_OPMATPG_2023
- C04_Pasos_de_fauna_FTM_2023
- C04_Playas_anidación_tortugas_OPMATPG_2023
- C04_Río_Candelaria_INEGI_2008_OPMATPG_2023
- C04_Programa_proteccion_tortugas_SEMABICCE_OPMATPG_2023

### Línea estratégica 1.2 Reforestación y restauración de los recursos ambientales

- C04_Conservación_y_Restauracion_humedales_CONABIO_2020
- C04_Propuesta_Corredor_Balam_Beh_SEMABICCE_2023
- C04_Propuesta_Corredor_Norte_SEMABICCE_2023
- C04_Propuesta_Corredor_Palizada_SEMABICCE_2023

### Línea estratégica 1.3 Cuidado y uso respetuoso del agua

- C04_Programa_Captacion_lluvia_Xpujil_INEGI_2020
- C04_Programa_saneamiento_cuencas_CONAGUA_2016
- C04_Red_monitoreo_calidad_aguas_superficiales_CONABIO_2008

---

## Estrategia: E2_Campo, mar y turismo biocultural

*(9 capas)*

### Línea estratégica 2.1 Emprendimiento rural y aprovechamiento económico sostenible

- C04_Centros_abasto_por_región_OPMATPG_2023
- C04_Construcción_centro_innovacion_tec_SDA_2023
- C04_Construccion_infraestructura_hidroagricola_SDA_2023
- C04_Desarrollo_energías_alternativas_OPMATPG_2023
- C04_Equipamiento_apicola_DENUE_2020_OPMATPG_2023
- C04_Infraestructura_produccion_arroz_SDA_2023
- C04_Nucleos_lecheros_SDA_2023
- C04_Programa_reconversión_productiva_agropecuaria_SDA_2023

### Línea estratégica 2.3 Turismo biocultural, incluyente y social

- C04_Circuitos_turisticos_SICM_2020_OPMATPG_2023

---

## Estrategia: E3_Comunidades, hogar y bienestar

*(6 capas)*

### Línea estratégica 3.1 Justicia socioespacial y acceso a oportunidades de desarrollo

- C04_Centros_comunitarios_multiusos_rurales_OPMATPG_2023
- C04_Equipamientos_salud_OPMATPG_2023
- C04_Hospital_Gneral_Centenario_OPMATPG_2023

### Línea estratégica 3.3 Fortalecimiento del acceso a una vivienda adecuada

- C04_Sustitución_materiales_paredes_viviendas_OPMATPG_2023
- C04_Sustitución_materiales_viviendas_tradicionales_INEGI_2020_OPMATPG_2023
- C04_Sustitución_materiales_viviendas_tradicionales_localidades_INEGI_2020_OPMATPG_2023

---

## Estrategia: E4_Integración territorial, desarrollo urbano e industria

*(14 capas)*

### Línea estratégica 1.3 Cuidado y uso respetuoso del agua

- C04_Construcción_PTAR_OPMATPG_2023

### Línea estratégica 2.1 Emprendimiento rural y aprovechamiento económico sostenible

- C04_Industria_Planta_Biocombustible_OPMATPG_2023
- C04_Parque_Industrial_Textil_OPMATPG_2023

### Línea estratégica 4.1 Conectividad y transporte

- C04_Estudio_de_ingenierías_basicas_para_transporte_de_carga_OPMATPG_2023

### Línea estratégica 4.2 Desarrollo urbano, servicios básicos e infraestructura

- C04_Ampliacion_red_electrica_OPMATPG_2023
- C04_Construcción_centrales_y_subestaciones_eléctricas_OPMATPG_2023
- C04_Construcción_ciclovía_Hopelchén_OPMATPG_2023
- C04_Construcción_libramientos_carreteros_OPMATPG_2023
- C04_Estudio_de_preinversion_Tren_Ligero_OPMATPG_2023
- C04_Fortalecimiento_energético_INEGI_2020
- C04_Manejo_integral_residuos_sólidos_INEGI_2022_OPMATPG_2023
- C04_Mejoramiento_conectividad_Corredor_Puebla-Progreso_OPMATPG_2023
- C04_Programa_abastecimiento_agua_localidades_Tren_Maya_OPMATPG_2023
- C04_Transporte_fluvial_rÍo_Palizada_INEGI_2008

---

## Notas

- Las 42 capas son únicas; no hay nombres de archivo repetidos en la hoja.
- La estrategia **E4_Integración territorial, desarrollo urbano e industria** contiene tres capas asignadas a líneas estratégicas que numéricamente pertenecen a otras estrategias:
  - `Línea estratégica 1.3 Cuidado y uso respetuoso del agua` → C04_Construcción_PTAR_OPMATPG_2023
  - `Línea estratégica 2.1 Emprendimiento rural y aprovechamiento económico sostenible` → C04_Industria_Planta_Biocombustible_OPMATPG_2023 y C04_Parque_Industrial_Textil_OPMATPG_2023
  Conviene verificar si es intencional o un error de captura.
- La hoja solo registra nueve líneas estratégicas (1.1, 1.2, 1.3, 2.1, 2.3, 3.1, 3.3, 4.1, 4.2). La numeración tiene huecos (2.2, 3.2), por lo que puede haber líneas del programa sin capas asociadas en este dataset.
- Se conservan tal cual las particularidades de escritura de los nombres originales, por ejemplo `C04_Transporte_fluvial_rÍo_Palizada_INEGI_2008` (con Í mayúscula) y `C04_Hospital_Gneral_Centenario_OPMATPG_2023` ("Gneral").
