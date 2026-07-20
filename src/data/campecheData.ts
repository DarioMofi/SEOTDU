export interface MunicipioProperties {
  id: string;
  nombre: string;
  cabecera: string;
  superficie: string;
  poblacion: string;
  usoSuelo: string;
  colorUso: string;
  zonificacion: string;
  colorZonif: string;
  anp: string;
  colorAnp: string;
  detalles: string;
  escalaReferencia: 'Estatal' | 'Metropolitana' | 'Intermunicipal' | 'Municipal' | 'Local';
  instrumentoNormativo: string;
  responsable: string;
  fechaActualizacion: string;
  vigencia: string;
}

export interface MunicipioGeoJSON {
  type: 'Feature';
  properties: MunicipioProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export const CAMPECHE_GEOJSON: { type: 'FeatureCollection'; features: MunicipioGeoJSON[] } = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'carmen',
        nombre: 'Carmen',
        cabecera: 'Ciudad del Carmen',
        superficie: '15,573.9 km²',
        poblacion: '248,845 hab.',
        usoSuelo: 'Urbano e Industrial',
        colorUso: '#d97706',
        zonificacion: 'Zona de Desarrollo Industrial y Portuario',
        colorZonif: '#dc2626',
        anp: 'APFF Laguna de Términos',
        colorAnp: '#16a34a',
        detalles: 'Principal centro económico petrolero de la región. Cuenta con ecosistemas costeros frágiles y áreas de manglares protegidos.',
        escalaReferencia: 'Municipal',
        instrumentoNormativo: 'PDU Carmen 2020-2040',
        responsable: 'H. Ayuntamiento de Carmen',
        fechaActualizacion: '2024-03-15',
        vigencia: '2020-2040'
      },
      geometry: { type: 'Polygon', coordinates: [[[-92.3, 18.3], [-91.4, 18.0], [-91.2, 18.6], [-91.8, 19.0], [-92.5, 18.8], [-92.3, 18.3]]] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'campeche',
        nombre: 'Campeche',
        cabecera: 'San Francisco de Campeche',
        superficie: '3,244.1 km²',
        poblacion: '294,077 hab.',
        usoSuelo: 'Urbano y de Servicios',
        colorUso: '#4f46e5',
        zonificacion: 'Zona de Crecimiento Urbano y Conservación Histórica',
        colorZonif: '#2563eb',
        anp: 'Ninguna',
        colorAnp: '#9ca3af',
        detalles: 'Capital del estado y sede de los poderes. Zona de alto valor patrimonial histórico con designación de la UNESCO.',
        escalaReferencia: 'Estatal',
        instrumentoNormativo: 'PEOTDU Campeche 2023-2053',
        responsable: 'Gobierno del Estado de Campeche',
        fechaActualizacion: '2023-11-20',
        vigencia: '2023-2053'
      },
      geometry: { type: 'Polygon', coordinates: [[[-90.7, 19.6], [-90.3, 19.5], [-90.2, 19.9], [-90.6, 20.0], [-90.8, 19.8], [-90.7, 19.6]]] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'calakmul',
        nombre: 'Calakmul',
        cabecera: 'Xpujil',
        superficie: '13,839.1 km²',
        poblacion: '31,750 hab.',
        usoSuelo: 'Conservación y Forestal',
        colorUso: '#15803d',
        zonificacion: 'Zona de Conservación Ecológica y Amortiguamiento',
        colorZonif: '#059669',
        anp: 'Reserva de la Biósfera Calakmul',
        colorAnp: '#14532d',
        detalles: 'Alberga la reserva de selva tropical más grande de México. Riqueza arqueológica maya invaluable y alta biodiversidad.',
        escalaReferencia: 'Intermunicipal',
        instrumentoNormativo: 'POE Calakmul-Escárcega 2021',
        responsable: 'SEDATU / Gobierno del Estado',
        fechaActualizacion: '2021-06-10',
        vigencia: '2021-2041'
      },
      geometry: { type: 'Polygon', coordinates: [[[-90.2, 18.0], [-89.1, 18.0], [-89.0, 19.2], [-90.0, 19.2], [-90.2, 18.0]]] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'candelaria',
        nombre: 'Candelaria',
        cabecera: 'Candelaria',
        superficie: '5,562.9 km²',
        poblacion: '43,870 hab.',
        usoSuelo: 'Agrícola y Pecuario',
        colorUso: '#ca8a04',
        zonificacion: 'Zona de Aprovechamiento Silvoagropecuario',
        colorZonif: '#854d0e',
        anp: 'Ninguna',
        colorAnp: '#9ca3af',
        detalles: 'Región con importante actividad ganadera y agrícola, surcada por el Río Candelaria. Zonas de transición ecológica.',
        escalaReferencia: 'Municipal',
        instrumentoNormativo: 'PDU Candelaria 2019-2039',
        responsable: 'H. Ayuntamiento de Candelaria',
        fechaActualizacion: '2022-09-01',
        vigencia: '2019-2039'
      },
      geometry: { type: 'Polygon', coordinates: [[[-91.3, 18.0], [-90.2, 18.0], [-90.3, 18.6], [-91.2, 18.6], [-91.3, 18.0]]] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'hopelchen',
        nombre: 'Hopelchén',
        cabecera: 'Hopelchén',
        superficie: '11,600.3 km²',
        poblacion: '40,140 hab.',
        usoSuelo: 'Agrícola e Industrial',
        colorUso: '#ca8a04',
        zonificacion: 'Zona de Producción Agrícola Sostenible',
        colorZonif: '#d97706',
        anp: 'Reserva de la Biósfera Calakmul (Porción Norte)',
        colorAnp: '#14532d',
        detalles: 'Municipio caracterizado por agricultura mecanizada y asentamientos tradicionales. Zonas críticas de recarga acuífera.',
        escalaReferencia: 'Local',
        instrumentoNormativo: 'PDU Hopelchén 2018-2038',
        responsable: 'H. Ayuntamiento de Hopelchén',
        fechaActualizacion: '2023-01-15',
        vigencia: '2018-2038'
      },
      geometry: { type: 'Polygon', coordinates: [[[-90.0, 19.2], [-89.0, 19.2], [-89.0, 20.2], [-89.8, 20.2], [-90.2, 19.9], [-90.0, 19.2]]] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'champoton',
        nombre: 'Champotón',
        cabecera: 'Champotón',
        superficie: '6,085.6 km²',
        poblacion: '78,170 hab.',
        usoSuelo: 'Mixto (Agrícola y Costero)',
        colorUso: '#06b6d4',
        zonificacion: 'Zona de Desarrollo Turístico Sustentable y Pesquero',
        colorZonif: '#0891b2',
        anp: 'Zona de Protección Forestal y Refugio de Fauna',
        colorAnp: '#16a34a',
        detalles: 'Importante puerto pesquero e histórico. Cuenta con desarrollo de caña de azúcar y potencial de turismo de bajo impacto.',
        escalaReferencia: 'Metropolitana',
        instrumentoNormativo: 'PMD Champotón 2022-2042',
        responsable: 'H. Ayuntamiento de Champotón',
        fechaActualizacion: '2022-05-30',
        vigencia: '2022-2042'
      },
      geometry: { type: 'Polygon', coordinates: [[[-90.8, 19.0], [-90.2, 18.6], [-90.0, 19.2], [-90.2, 19.5], [-90.7, 19.6], [-90.8, 19.0]]] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'calkini',
        nombre: 'Calkiní',
        cabecera: 'Calkiní',
        superficie: '2,089.4 km²',
        poblacion: '56,150 hab.',
        usoSuelo: 'Agrícola y Artesanal',
        colorUso: '#ca8a04',
        zonificacion: 'Zona de Desarrollo Cultural y Agrícola',
        colorZonif: '#d97706',
        anp: 'Reserva de la Biósfera Los Petenes',
        colorAnp: '#16a34a',
        detalles: 'Conocido como la Atenas del Camino Real. Centro de producción artesanal de sombreros de jipi y actividad agrícola.',
        escalaReferencia: 'Municipal',
        instrumentoNormativo: 'PDU Calkiní 2021-2041',
        responsable: 'H. Ayuntamiento de Calkiní',
        fechaActualizacion: '2023-04-10',
        vigencia: '2021-2041'
      },
      geometry: { type: 'Polygon', coordinates: [[[-90.5, 20.3], [-90.0, 20.3], [-90.0, 20.6], [-90.5, 20.6], [-90.5, 20.3]]] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'escarcega',
        nombre: 'Escárcega',
        cabecera: 'Escárcega',
        superficie: '4,783.3 km²',
        poblacion: '59,974 hab.',
        usoSuelo: 'Logístico e Industrial',
        colorUso: '#7c3aed',
        zonificacion: 'Nodo Logístico y Multimodal',
        colorZonif: '#6d28d9',
        anp: 'Ninguna',
        colorAnp: '#9ca3af',
        detalles: 'Corazón vial y ferroviario del estado de Campeche. Cruce de carreteras troncales federales y estación principal del Tren Maya.',
        escalaReferencia: 'Intermunicipal',
        instrumentoNormativo: 'POE Calakmul-Escárcega 2021',
        responsable: 'H. Ayuntamiento de Escárcega',
        fechaActualizacion: '2022-08-18',
        vigencia: '2021-2041'
      },
      geometry: { type: 'Polygon', coordinates: [[[-90.8, 18.4], [-90.3, 18.4], [-90.3, 18.8], [-90.8, 18.8], [-90.8, 18.4]]] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'hecelchakan',
        nombre: 'Hecelchakán',
        cabecera: 'Hecelchakán',
        superficie: '1,294.9 km²',
        poblacion: '31,996 hab.',
        usoSuelo: 'Agrícola y Tradicional',
        colorUso: '#ca8a04',
        zonificacion: 'Zona Agrícola de Sostenibilidad Comunitaria',
        colorZonif: '#854d0e',
        anp: 'Reserva de la Biósfera Los Petenes (Zona Este)',
        colorAnp: '#16a34a',
        detalles: 'Municipio maya de la región Camino Real, rico en tradiciones culinarias, producción agrícola y patrimonio cultural.',
        escalaReferencia: 'Municipal',
        instrumentoNormativo: 'PDU Hecelchakán 2020-2040',
        responsable: 'H. Ayuntamiento de Hecelchakán',
        fechaActualizacion: '2022-11-05',
        vigencia: '2020-2040'
      },
      geometry: { type: 'Polygon', coordinates: [[[-90.3, 20.0], [-90.0, 20.0], [-90.0, 20.3], [-90.3, 20.3], [-90.3, 20.0]]] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'palizada',
        nombre: 'Palizada',
        cabecera: 'Palizada',
        superficie: '2,143.2 km²',
        poblacion: '8,683 hab.',
        usoSuelo: 'Conservación y Turístico',
        colorUso: '#06b6d4',
        zonificacion: 'Pueblo Mágico y Protección de Cuenca',
        colorZonif: '#0891b2',
        anp: 'APFF Laguna de Términos (Cuenca Palizada)',
        colorAnp: '#14532d',
        detalles: 'Único Pueblo Mágico de Campeche, rodeado por el Río Palizada. Zona de alta sensibilidad fluvial y belleza paisajística.',
        escalaReferencia: 'Local',
        instrumentoNormativo: 'PDU Palizada 2019-2039',
        responsable: 'H. Ayuntamiento de Palizada',
        fechaActualizacion: '2023-02-28',
        vigencia: '2019-2039'
      },
      geometry: { type: 'Polygon', coordinates: [[[-92.1, 18.1], [-91.7, 18.1], [-91.7, 18.5], [-92.1, 18.5], [-92.1, 18.1]]] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'tenabo',
        nombre: 'Tenabo',
        cabecera: 'Tenabo',
        superficie: '1,061.6 km²',
        poblacion: '11,452 hab.',
        usoSuelo: 'Agrícola y Cítricos',
        colorUso: '#ca8a04',
        zonificacion: 'Zona de Producción Citrícola y Agropecuaria',
        colorZonif: '#d97706',
        anp: 'Ninguna',
        colorAnp: '#9ca3af',
        detalles: 'Importante centro citrícola del norte del estado. Asentamiento tradicional en el eje vial Campeche-Mérida.',
        escalaReferencia: 'Local',
        instrumentoNormativo: 'PDU Tenabo 2021-2041',
        responsable: 'H. Ayuntamiento de Tenabo',
        fechaActualizacion: '2022-04-12',
        vigencia: '2021-2041'
      },
      geometry: { type: 'Polygon', coordinates: [[[-90.4, 19.9], [-90.1, 19.9], [-90.1, 20.2], [-90.4, 20.2], [-90.4, 19.9]]] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'seybaplaya',
        nombre: 'Seybaplaya',
        cabecera: 'Seybaplaya',
        superficie: '289.1 km²',
        poblacion: '15,294 hab.',
        usoSuelo: 'Portuario e Industrial',
        colorUso: '#d97706',
        zonificacion: 'Zona Portuaria y de Servicios Marítimos',
        colorZonif: '#dc2626',
        anp: 'Ninguna',
        colorAnp: '#9ca3af',
        detalles: 'Municipio de reciente creación con recinto portuario en rápida expansión comercial y logística costera.',
        escalaReferencia: 'Municipal',
        instrumentoNormativo: 'PDU Seybaplaya 2022-2042',
        responsable: 'H. Ayuntamiento de Seybaplaya',
        fechaActualizacion: '2023-08-20',
        vigencia: '2022-2042'
      },
      geometry: { type: 'Polygon', coordinates: [[[-90.7, 19.5], [-90.5, 19.5], [-90.5, 19.7], [-90.7, 19.7], [-90.7, 19.5]]] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'dzitbalche',
        nombre: 'Dzitbalché',
        cabecera: 'Dzitbalché',
        superficie: '366.8 km²',
        poblacion: '16,384 hab.',
        usoSuelo: 'Agrícola y Forestal',
        colorUso: '#ca8a04',
        zonificacion: 'Zona de Preservación Cultural Maya y Agricultura',
        colorZonif: '#854d0e',
        anp: 'Ninguna',
        colorAnp: '#9ca3af',
        detalles: 'Nuevo municipio de gran relevancia histórica maya (Cantar de los Cantares de Dzitbalché) y vocación silvoagropecuaria.',
        escalaReferencia: 'Local',
        instrumentoNormativo: 'PDU Dzitbalché 2023-2043',
        responsable: 'H. Ayuntamiento de Dzitbalché',
        fechaActualizacion: '2023-09-15',
        vigencia: '2023-2043'
      },
      geometry: { type: 'Polygon', coordinates: [[[-90.2, 20.2], [-89.9, 20.2], [-89.9, 20.4], [-90.2, 20.4], [-90.2, 20.2]]] }
    }
  ]
};
