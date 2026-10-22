// Nombre de las 33 localidades urbanas de Campeche por clave geoestadística
// (entidad + municipio + localidad, 9 dígitos). Generado desde
// public/layers/C04_Loc_urb.geojson (INEGI, Censo 2020).
//
// Hace falta porque la capa nueva de localidades urbanas
// (c04_scince_localidad_urbana_inegi_2020) y la de manzanas no traen el nombre,
// solo la clave. PROVISIONAL: en SQL será un JOIN con el catálogo de localidades.
export const LOCALIDADES_URBANAS: Record<string, string> = {
  '040010001': 'Calkiní',
  '040010003': 'Bacabchén',
  '040010004': 'Bécal',
  '040010007': 'Dzitbalché',
  '040010008': 'Nunkiní',
  '040020001': 'San Francisco de Campeche',
  '040020077': 'Chiná',
  '040020087': 'Lerma',
  '040020465': 'Los Laureles',
  '040030001': 'Ciudad del Carmen',
  '040030005': 'Nuevo Progreso',
  '040030006': 'Atasta',
  '040030101': 'San Antonio Cárdenas',
  '040030199': 'Isla Aguada',
  '040030614': 'Sabancuy',
  '040040001': 'Champotón',
  '040040036': 'Sihochac',
  '040040091': 'Ley Federal de Reforma Agraria',
  '040040432': 'Carrillo Puerto',
  '040040564': 'Santo Domingo Kesté',
  '040050001': 'Hecelchakán',
  '040050007': 'Pomuch',
  '040060001': 'Hopelchén',
  '040060003': 'Bolonchén de Rejón',
  '040060023': 'Vicente Guerrero',
  '040070001': 'Palizada',
  '040080001': 'Tenabo',
  '040090001': 'Escárcega',
  '040090002': 'División del Norte',
  '040100001': 'Xpujil',
  '040110001': 'Candelaria',
  '040120001': 'Seybaplaya',
  '040120055': 'Villa Madero',
}
