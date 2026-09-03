# Capas encendidas hoy por monitor

Estado **actual** del geovisor, extraido de `appConfig.MODULES_CONFIG` y de los
volcados en uso. Sirve de referencia para que, al pasar a la entrega nueva de
`public/layers/GeoJSON/`, cada monitor se vea igual al activarlo.

La columna de la derecha es el archivo equivalente en la entrega nueva.
`?` = sin equivalente automatico; hay que confirmarlo a mano.

## Mapa Base  (`mapa_base`)

13 capas encendidas — todas las del volcado que tienen datos

| capa actual | equivalente en la entrega nueva |
|---|---|
| `estatal` | **?** |
| `C04_Municipios` | **?** |
| `C04_BUFER_ESTATAL` | **?** |
| `C04_Puertos_reg` | **?** |
| `C04_Aeropuertos_2012` | `c04_aeropuertos_2012` |
| `C04_estaciones_RFN25` | `c04_estaciones_rfn25` |
| `C04_Loc_rur` | **?** |
| `C04_RFN_2024` | **?** |
| `RNC_2025_SURESTE` | **?** |
| `C04_corr_agua_2003` | `c04_corr_agua_2003` |
| `C04_Loc_urb` | **?** |
| `C04_ANP_2024` | **?** |
| `C04_ZonasMetropolitanas` | **?** |

## Modelo de Ordenamiento Territorial  (`normatividad`)

1 capas encendidas — todas las del volcado que tienen datos

| capa actual | equivalente en la entrega nueva |
|---|---|
| `C04_Modelo_Ordenamiento_Territorial_OP_PG_2023_CP` | `c04_modelo_ordenamiento_territorial_op_pg_2023_cp` |

## Ambiental  (`ambiental`)

12 capas encendidas — todas las del volcado que tienen datos

| capa actual | equivalente en la entrega nueva |
|---|---|
| `C04_Programa_proteccion_tortugas_SEMABICCE_OPMATPG_2023` | `c04_programa_proteccion_tortugas_semabicce_opmatpg_2023` |
| `C04_ADVC_CONANP_CONABIO_2022` | `c04_advc_conanp_conabio_2022` |
| `C04_Red_monitoreo_calidad_aguas_superficiales_CONABIO_2008` | `c04_red_monitoreo_calidad_aguas_superficiales_conabio_2008` |
| `C04_ANP_Estatal_BalamKin_BalamKu_CONABIO_2020` | `c04_anp_estatal_balamkin_balamku_conabio_2020` |
| `C04_ANP_Río_Candelaria_OPMATPG_2023` | `c04_anp_rio_candelaria_opmatpg_2023` |
| `C04_Conservación_y_Restauracion_humedales_CONABIO_2020` | `c04_conservacion_y_restauracion_humedales_conabio_2020` |
| `C04_Pasos_de_fauna_FTM_2023` | `c04_pasos_de_fauna_ftm_2023` |
| `C04_Playas_anidación_tortugas_OPMATPG_2023` | `c04_playas_anidacion_tortugas_opmatpg_2023` |
| `C04_Programa_Captacion_lluvia_Xpujil_INEGI_2020` | `c04_programa_captacion_lluvia_xpujil_inegi_2020` |
| `C04_Programa_saneamiento_cuencas_CONAGUA_2016` | `c04_programa_saneamiento_cuencas_conagua_2016` |
| `C04_Propuesta_Corredor_Balam_Beh_SEMABICCE_2023` | `c04_propuesta_corredor_balam_beh_semabicce_2023` |
| `C04_Propuesta_Corredor_Palizada_SEMABICCE_2023` | `c04_propuesta_corredor_palizada_semabicce_2023` |

## Social  (`social`)

11 capas encendidas — declaradas a mano en `defaultLayers`

| capa actual | equivalente en la entrega nueva |
|---|---|
| `C04_Centros_comunitarios_multiusos_rurales_OPMATPG_2023` | `c04_centros_comunitarios_multiusos_rurales_opmatpg_2023` |
| `C04_Equipamientos_salud_OPMATPG_2023` | `c04_equipamientos_salud_opmatpg_2023` |
| `C04_Hospital_Gneral_Centenario_OPMATPG_2023` | `c04_hospital_gneral_centenario_opmatpg_2023` |
| `C04_Sustitución_materiales_viviendas_tradicionales_INEGI_2020_OPMATPG_2023` | `c04_sustitucion_materiales_viviendas_tradicionales_inegi_2020_opmatpg_2023` |
| `C04_Sustitución_materiales_viviendas_tradicionales_localidades_INEGI_2020_OPMATPG_2023` | `c04_sustitucion_materiales_viviendas_tradicionales_localidades_inegi_2020_opmatpg_2023` |
| `C04_EFPatrimonioInmble_SIC_2023` | `c04_efpatrimonioinmble_sic_2023` |
| `C04_GrupoEtnico_INPI_2020` | `c04_grupoetnico_inpi_2020` |
| `C04_PatrimonioInmaterial_SIC_2023` | `c04_patrimonioinmaterial_sic_2023` |
| `C04_PatrimonioInmaterialIdioma_OPMATPG_2023` | `c04_patrimonioinmaterialidioma_opmatpg_2023` |
| `C04_PatrimonioInmueble_SIC_2023` | `c04_patrimonioinmueble_sic_2023` |
| `C04_ZonasArqueológicas_SIC_2023` | `c04_zonasarqueologicas_sic_2023` |

## Infraestructura  (`infraestructura`)

17 capas encendidas — declaradas a mano en `defaultLayers`

| capa actual | equivalente en la entrega nueva |
|---|---|
| `C04_Ampliacion_red_electrica_OPMATPG_2023` | `c04_ampliacion_red_electrica_opmatpg_2023` |
| `C04_Construcción_centrales_y_subestaciones_eléctricas_OPMATPG_2023` | `c04_construccion_centrales_y_subestaciones_electricas_opmatpg_2023` |
| `C04_Construcción_ciclovía_Hopelchén_OPMATPG_2023` | `c04_construccion_ciclovia_hopelchen_opmatpg_2023` |
| `C04_Construcción_libramientos_carreteros_OPMATPG_2023` | `c04_construccion_libramientos_carreteros_opmatpg_2023` |
| `C04_Construcción_PTAR_OPMATPG_2023` | `c04_construccion_ptar_opmatpg_2023` |
| `C04_Estudio_de_ingenierías_basicas_para_transporte_de_carga_OPMATPG_2023` | `c04_estudio_de_ingenierias_basicas_para_transporte_de_carga_opmatpg_2023` |
| `C04_Estudio_de_preinversion_Tren_Ligero_OPMATPG_2023` | `c04_estudio_de_preinversion_tren_ligero_opmatpg_2023` |
| `C04_Fortalecimiento_energético_INEGI_2020` | `c04_fortalecimiento_energetico_inegi_2020` |
| `C04_Industria_Planta_Biocombustible_OPMATPG_2023` | `c04_industria_planta_biocombustible_opmatpg_2023` |
| `C04_Manejo_integral_residuos_sólidos_INEGI_2022_OPMATPG_2023` | `c04_manejo_integral_residuos_solidos_inegi_2022_opmatpg_2023` |
| `C04_Mejoramiento_conectividad_Corredor_Puebla_Progreso_OPMATPG_2023` | **?** |
| `C04_Parque_Industrial_Textil_OPMATPG_2023` | `c04_parque_industrial_textil_opmatpg_2023` |
| `C04_Transporte_fluvial_rÍo_Palizada_INEGI_2008` | `c04_transporte_fluvial_rio_palizada_inegi_2008` |
| `C04_DerechosDeViaLineasDeTransmisionElectrica_Geocomunes_2023` | `c04_derechosdevialineasdetransmisionelectrica_geocomunes_2023` |
| `C04_Programa_abastecimiento_agua_localidades_Tren_Maya_OPMATPG_2023` | **?** |
| `C04_DerechosDeViaGasoductos_CENEGAS_2019` | `c04_derechosdeviagasoductos_cenegas_2019` |
| `C04_Vivienda_ITER_INEGI_2020` | `c04_vivienda_iter_inegi_2020` |

## Económico  (`aptitud`)

9 capas encendidas — declaradas a mano en `defaultLayers`

| capa actual | equivalente en la entrega nueva |
|---|---|
| `C04_Centros_abasto_por_región_OPMATPG_2023` | `c04_centros_abasto_por_region_opmatpg_2023` |
| `C04_Circuitos_turisticos_SICM_2020_OPMATPG_2023` | `c04_circuitos_turisticos_sicm_2020_opmatpg_2023` |
| `C04_Construcción_centro_innovacion_tec_SDA_2023` | `c04_construccion_centro_innovacion_tec_sda_2023` |
| `C04_Construccion_infraestructura_hidroagricola_SDA_2023` | `c04_construccion_infraestructura_hidroagricola_sda_2023` |
| `C04_Desarrollo_energías_alternativas_OPMATPG_2023` | `c04_desarrollo_energias_alternativas_opmatpg_2023` |
| `C04_Equipamiento_apicola_DENUE_2020_OPMATPG_2023` | `c04_equipamiento_apicola_denue_2020_opmatpg_2023` |
| `C04_Infraestructura_produccion_arroz_SDA_2023` | `c04_infraestructura_produccion_arroz_sda_2023` |
| `C04_Nucleos_lecheros_SDA_2023` | `c04_nucleos_lecheros_sda_2023` |
| `C04_Programa_reconversión_productiva_agropecuaria_SDA_2023` | `c04_programa_reconversion_productiva_agropecuaria_sda_2023` |

## Capas fijas (`FIXED_LAYERS`)

Se dibujan junto con su monitor y no aparecen en el menu.

- `C04_corr_agua_2003` -> `c04_corr_agua_2003`
- `C04_estaciones_RFN25` -> `c04_estaciones_rfn25`
- `C04_Puertos_reg` -> **?**
- `C04_Aeropuertos_2012` -> `c04_aeropuertos_2012`
- `estatal` -> **?**
- `C04_BUFER_ESTATAL` -> **?**
- `C04_Municipios` -> **?**
