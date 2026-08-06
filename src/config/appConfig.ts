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
    'C04_Aeropuertos_2012'
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
      file: 'Mapa_Base.json',
      icon: 'mapa_base' // Manejaremos el render del SVG dinámico en el componente
    },
    {
      id: 'ambiental',
      title: 'Medio Ambiente',
      colorClass: 'text-green-600 bg-green-50 border-green-200',
      file: 'Monitor_Ambiental_Climatico.json',
      icon: 'ambiental'
    },
    {
      id: 'social',
      title: 'Socio Demográfico',
      colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
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
      icon: 'social'
    },
    {
      id: 'infraestructura',
      title: 'Infraestructura',
      colorClass: 'text-orange-600 bg-orange-50 border-orange-200',
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
      ]
    },
    {
      id: 'aptitud',
      title: 'Aptitud Territorial',
      colorClass: 'text-purple-600 bg-purple-50 border-purple-200',
      file: 'Aptitud_Territorial_Desarrollo_Economico.json',
      icon: 'aptitud'
    },
    {
      id: 'normatividad',
      title: 'Normatividad / Gestión',
      colorClass: 'text-slate-600 bg-slate-50 border-slate-200',
      file: 'Normatividad_MOT.json',
      icon: 'normatividad'
    }
  ]
}
