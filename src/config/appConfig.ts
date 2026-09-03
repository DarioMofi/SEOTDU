// src/config/appConfig.ts

export const appConfig = {
  // Cada módulo es el mapa base de su propio tema: solo uno puede estar activo
  // a la vez, y al activarlo se encienden todas sus capas. Este es el que
  // arranca encendido.
  DEFAULT_MODULE: 'mapa_base',

  // Capas que se dibujan junto con su módulo pero NO aparecen en el menú: el
  // usuario no las puede apagar por separado. Se encienden y se apagan con el
  // módulo que las contiene.
  FIXED_LAYERS: [
    'C04_corr_agua_2003',
    'C04_estaciones_RFN25',
    'C04_Puertos_reg',
    'C04_Aeropuertos_2012',
    'estatal',
    'C04_BUFER_ESTATAL',
    'C04_Municipios'
  ],

  // Nombres del árbol de QGIS que no coinciden con la tabla real del
  // GeoPackage. Son defectos de la cartografía de origen: en cuanto los
  // corrijan allá, estas entradas se borran.
  TABLE_ALIASES: {
    // El estilo escribe la capa con guion; la tabla la trae con guion bajo.
    'C04_Mejoramiento_conectividad_Corredor_Puebla-Progreso_OPMATPG_2023':
      'C04_Mejoramiento_conectividad_Corredor_Puebla_Progreso_OPMATPG_2023'
  } as Record<string, string>,

  // Diccionario para cambiar los nombres técnicos por nombres amigables en el menú
  LAYER_ALIASES: {
    'C04_Municipios': 'Límites Municipales',
    'C04_Loc_rur': 'Localidades Rurales',
    'C04_Loc_urb': 'Localidades Urbanas',
    'C04_RFN_2024': 'Red Ferroviaria Nacional',
    'C04_ANP_2024': 'Áreas Naturales Protegidas',
    'C04_ZonasMetropolitanas': 'Zonas Metropolitanas'
  } as Record<string, string>,

  // Configuración de módulos y sus JSON.
  //
  // `defaultLayers` lista las capas que se encienden al activar el módulo, y
  // debe reflejar las que están marcadas en el proyecto QGIS. El resto sigue
  // apareciendo en el menú, apagado. Sin `defaultLayers` se encienden todas.
  //
  // Hace falta declararlo a mano porque el volcado exporta `visible_qgis` con
  // la visibilidad *efectiva*: como al exportar solo hay un módulo encendido,
  // todas las capas de los demás salen en `false` y el dato es inservible.
  MODULES_CONFIG: [
    {
      id: 'mapa_base',
      title: 'Mapa Base',
      colorClass: 'text-slate-600 bg-slate-50 border-slate-200',
      themeColor: '#475569',
      themeBg: 'rgba(71, 85, 105, 0.02)',
      themeHover: 'rgba(71, 85, 105, 0.04)',
      // Primer módulo servido por la entrega nueva de `public/layers/GeoJSON/`.
      // Su simbología viene completa en un solo volcado, así que ya no hace
      // falta `stylesFrom` para rescatar la forma del marcador del volcado
      // viejo. El ruteo del GeoJSON lo resuelve `cartografia.ts`.
      file: 'JSON_SIMBOLOGIA/00_Mapa_Base.json',
      // Las 15 capas que se encienden al activar el módulo. Quedan fuera las
      // cuatro pesadas —red regional, manzanas, cuerpos de agua y CESC— que
      // suman 177 de los 207 MB del mapa base y tardan ~30 s en dibujarse.
      // Siguen en el menú, apagadas, para encenderlas a voluntad.
      defaultLayers: [
        'c04_lim_edo_2024_inegi_2024',
        'c04_municipios_inegi_2024',
        'c00_bufer_estatal_inegi_2024_2026',
        'c00_rfn_artf_2024',
        'c04_aeropuertos_2012',
        'c04_estaciones_rfn25',
        'c04_puntos_int_imt_inegi_2024',
        'c04_estacionestm_sedatu_2024',
        'c00_zonasmetropolitanas_conapo_2020',
        'c04_scince_localidad_urbana_inegi_2020',
        'c04_localidades_rurales_2024',
        'c04_corr_agua_2003',
        'c00_anp_conanp_2025',
        'c00_rpt_conabio_2008',
        'c04_areaboscosa_inegi_2018'
      ],
      icon: 'mapa_base' // Manejaremos el render del SVG dinámico en el componente
    },
    {
      id: 'normatividad',
      title: 'Modelo de Ordenamiento Territorial',
      colorClass: 'text-slate-600 bg-slate-50 border-slate-200',
      themeColor: '#1C334E',
      themeBg: 'rgba(71, 85, 105, 0.02)',
      themeHover: 'rgba(71, 85, 105, 0.04)',
      file: 'Normatividad_MOT.json',
      icon: 'normatividad'
    },
    {
      id: 'ambiental',
      title: 'Ambiental',
      colorClass: 'text-green-600 bg-green-50 border-green-200',
      themeColor: '#77923B',
      themeBg: 'rgba(122, 209, 9, 0.02)',
      themeHover: 'rgba(83, 168, 13, 0.02)',
      file: 'Monitor_Ambiental_Climatico.json',
      icon: 'ambiental',
      // Grupos de capas: el menú las trata como una sola entrada para acotar la
      // interacción. El switch y la opacidad del grupo aplican a todas sus
      // capas a la vez, y las capas dejan de tener control propio.
      //
      // No son `FIXED_LAYERS`: se dibujan y se apagan con el grupo, no con el
      // módulo. La leyenda no cambia — sigue saliendo la simbología de cada
      // capa por separado, porque se calcula desde las capas dibujadas.
      //
      // Una capa que no esté aquí conserva su card individual.
      groups: [
        {
          id: 'ambiental_programas',
          label: 'Programas',
          layers: [
            'C04_Programa_Captacion_lluvia_Xpujil_INEGI_2020',
            'C04_Programa_proteccion_tortugas_SEMABICCE_OPMATPG_2023',
            'C04_Programa_saneamiento_cuencas_CONAGUA_2016'
          ]
        },
        {
          id: 'ambiental_anp',
          label: 'Áreas Naturales Protegidas (ANP)',
          layers: [
            'C04_ANP_Río_Candelaria_OPMATPG_2023',
            'C04_ANP_Estatal_BalamKin_BalamKu_CONABIO_2020'
          ]
        },
        {
          id: 'ambiental_corredores',
          label: 'Propuestas de Corredores',
          layers: [
            'C04_Propuesta_Corredor_Palizada_SEMABICCE_2023',
            'C04_Propuesta_Corredor_Balam_Beh_SEMABICCE_2023'
          ]
        }
      ]
    },
    {
      id: 'social',
      title: 'Social',
      colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
      themeColor: '#006FC0',
      themeBg: 'rgba(37, 99, 235, 0.02)',
      themeHover: 'rgba(37, 99, 235, 0.04)',
      // Primer módulo migrado al volcado nuevo de QGIS (carpeta `nuevos/`).
      // Los demás siguen con el volcado viejo hasta que se validen uno a uno.
      file: 'nuevos/02_Modulo_Social/02_Bienestar_Social_Demografia_simbologia.json',
      // Las 11 capas marcadas en el proyecto QGIS. `PobAfromexicana` está en el
      // estilo pero desmarcada, así que no se enciende ni se extrae su GeoJSON.
      defaultLayers: [
        'C04_Centros_comunitarios_multiusos_rurales_OPMATPG_2023',
        'C04_Equipamientos_salud_OPMATPG_2023',
        'C04_Hospital_Gneral_Centenario_OPMATPG_2023',
        'C04_Sustitución_materiales_viviendas_tradicionales_INEGI_2020_OPMATPG_2023',
        'C04_Sustitución_materiales_viviendas_tradicionales_localidades_INEGI_2020_OPMATPG_2023',
        'C04_EFPatrimonioInmble_SIC_2023',
        'C04_GrupoEtnico_INPI_2020',
        'C04_PatrimonioInmaterial_SIC_2023',
        'C04_PatrimonioInmaterialIdioma_OPMATPG_2023',
        'C04_PatrimonioInmueble_SIC_2023',
        'C04_ZonasArqueológicas_SIC_2023'
      ],
      icon: 'social',
      // Ver el comentario de `groups` en el módulo ambiental.
      groups: [
        {
          id: 'social_sustitucion',
          label: 'Sustitución de materiales en viviendas tradicionales',
          layers: [
            'C04_Sustitución_materiales_viviendas_tradicionales_INEGI_2020_OPMATPG_2023',
            'C04_Sustitución_materiales_viviendas_tradicionales_localidades_INEGI_2020_OPMATPG_2023'
          ]
        },
        {
          id: 'social_patrimonio',
          label: 'Patrimoniales',
          layers: [
            'C04_PatrimonioInmueble_SIC_2023',
            'C04_PatrimonioInmaterialIdioma_OPMATPG_2023',
            'C04_EFPatrimonioInmble_SIC_2023',
            'C04_PatrimonioInmaterial_SIC_2023'
          ]
        },
        {
          id: 'social_salud',
          label: 'Equipamiento de salud',
          layers: [
            'C04_Equipamientos_salud_OPMATPG_2023',
            'C04_Hospital_Gneral_Centenario_OPMATPG_2023'
          ]
        }
      ]
    },
    {
      id: 'infraestructura',
      title: 'Infraestructura',
      colorClass: 'text-orange-600 bg-orange-50 border-orange-200',
      themeColor: '#C00000',
      themeBg: 'rgba(234, 88, 12, 0.02)',
      themeHover: 'rgba(234, 88, 12, 0.04)',
      // Se queda en el volcado viejo a propósito: el nuevo no exporta la forma
      // del marcador ni su desplazamiento, y aquí eso se nota — la estrella de
      // las subestaciones, los cuadrados del fortalecimiento energético y los
      // octágonos del parque industrial se volverían círculos.
      file: 'Infraestructura_Estrategica_Conectividad.json',
      icon: 'infraestructura',
      // Grupo E4 completo (las 14 marcadas en QGIS) más lo que se alcanza a ver
      // marcado de 07_SUR. El resto de 07_SUR está cortado en la captura, así
      // que se deja apagado hasta poder confirmarlo.
      defaultLayers: [
        'C04_Ampliacion_red_electrica_OPMATPG_2023',
        'C04_Construcción_centrales_y_subestaciones_eléctricas_OPMATPG_2023',
        'C04_Construcción_ciclovía_Hopelchén_OPMATPG_2023',
        'C04_Construcción_libramientos_carreteros_OPMATPG_2023',
        'C04_Construcción_PTAR_OPMATPG_2023',
        'C04_Estudio_de_ingenierías_basicas_para_transporte_de_carga_OPMATPG_2023',
        'C04_Estudio_de_preinversion_Tren_Ligero_OPMATPG_2023',
        'C04_Fortalecimiento_energético_INEGI_2020',
        'C04_Industria_Planta_Biocombustible_OPMATPG_2023',
        'C04_Manejo_integral_residuos_sólidos_INEGI_2022_OPMATPG_2023',
        'C04_Mejoramiento_conectividad_Corredor_Puebla_Progreso_OPMATPG_2023',
        'C04_Parque_Industrial_Textil_OPMATPG_2023',
        'C04_Transporte_fluvial_rÍo_Palizada_INEGI_2008',
        'C04_DerechosDeViaLineasDeTransmisionElectrica_Geocomunes_2023',
        // Marcadas en QGIS pero sin datos en ningún GeoPackage; se listan para
        // que se enciendan solas en cuanto lleguen.
        'C04_Programa_abastecimiento_agua_localidades_Tren_Maya_OPMATPG_2023',
        'C04_DerechosDeViaGasoductos_CENEGAS_2019',
        'C04_Vivienda_ITER_INEGI_2020'
      ],
      // Ver el comentario de `groups` en el módulo ambiental.
      groups: [
        {
          id: 'infra_construccion',
          label: 'Construcción',
          layers: [
            'C04_Construcción_centrales_y_subestaciones_eléctricas_OPMATPG_2023',
            'C04_Construcción_ciclovía_Hopelchén_OPMATPG_2023',
            'C04_Construcción_libramientos_carreteros_OPMATPG_2023',
            'C04_Construcción_PTAR_OPMATPG_2023'
          ]
        },
        {
          id: 'infra_estudios',
          label: 'Estudios de campo',
          layers: [
            'C04_Estudio_de_ingenierías_basicas_para_transporte_de_carga_OPMATPG_2023',
            'C04_Estudio_de_preinversion_Tren_Ligero_OPMATPG_2023'
          ]
        },
        {
          id: 'infra_electrica',
          label: 'Eléctrica',
          layers: [
            'C04_DerechosDeViaLineasDeTransmisionElectrica_Geocomunes_2023',
            'C04_Fortalecimiento_energético_INEGI_2020',
            'C04_Ampliacion_red_electrica_OPMATPG_2023'
          ]
        }
      ]
    },
    {
      id: 'aptitud',
      title: 'Económico',
      colorClass: 'text-purple-600 bg-purple-50 border-purple-200',
      themeColor: '#FFC000',
      themeBg: 'rgba(147, 51, 234, 0.02)',
      themeHover: 'rgba(147, 51, 234, 0.04)',
      file: 'Aptitud_Territorial_Desarrollo_Economico.json',
      icon: 'aptitud',
      // Solo el grupo E2. En QGIS el grupo 03_ECONOMICO está entero
      // desmarcado, así que sus 7 capas no se encienden aunque lleguen datos.
      defaultLayers: [
        'C04_Centros_abasto_por_región_OPMATPG_2023',
        'C04_Circuitos_turisticos_SICM_2020_OPMATPG_2023',
        'C04_Construcción_centro_innovacion_tec_SDA_2023',
        'C04_Construccion_infraestructura_hidroagricola_SDA_2023',
        'C04_Desarrollo_energías_alternativas_OPMATPG_2023',
        'C04_Equipamiento_apicola_DENUE_2020_OPMATPG_2023',
        'C04_Infraestructura_produccion_arroz_SDA_2023',
        'C04_Nucleos_lecheros_SDA_2023',
        'C04_Programa_reconversión_productiva_agropecuaria_SDA_2023'
      ],
      // Ver el comentario de `groups` en el módulo ambiental.
      groups: [
        {
          id: 'aptitud_construccion',
          label: 'Construcción',
          layers: [
            'C04_Construcción_centro_innovacion_tec_SDA_2023',
            'C04_Construccion_infraestructura_hidroagricola_SDA_2023'
          ]
        }
      ]
    }
  ]
}
