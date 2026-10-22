// Indicadores estadísticos del panel de inicio (Fase 0 del hero).
//
// Fuentes:
// - Población urbana por municipio: Censo de Población y Vivienda 2020 (INEGI),
//   sumada desde la capa C04_Loc_urb (SCINCE 2020). Localidad urbana = 2,500 hab. o más.
// - Población rural municipal = población municipal − población urbana.
// - Totales estatales y PIB: PEOTDU Campeche 2023 (apartados 4.x Sistema urbano-rural
//   y 5.3.1 Panorama económico, con datos de INEGI).
//
// PROVISIONAL: los campos en `null` no tienen todavía fuente oficial cargada y la UI
// los muestra como «Por confirmar». Cuando existan, basta con llenarlos aquí.
//   - anioCreacion de los municipios fundadores (decretos de erección).
//   - pibParticipacionEstatal por municipio (p. ej. Valor Agregado Censal Bruto,
//     Censos Económicos INEGI, como aproximación del PIB municipal).
//
// Ojo con Dzitbalché y Seybaplaya: se crearon en 2019 y el Censo 2020 aún los
// trata con la geografía anterior (Calkiní y Champotón). Sus cifras urbanas se
// asignaron por localidad; las de población municipal son las del inventario
// existente en campecheSilhouetteSvg.ts.

export interface IndicadoresMunicipio {
  /** Número de localidades urbanas (2,500 hab. o más) */
  localidadesUrbanas: number
  /** Población que vive en localidades urbanas */
  poblacionUrbana: number
  /** Población que vive en localidades rurales (total municipal − urbana) */
  poblacionRural: number
  /** Año del decreto de creación del municipio */
  anioCreacion: number | null
  /** Municipio del que se segregó, si aplica */
  segregadoDe?: string
  /** Participación del municipio en la economía estatal (%) */
  pibParticipacionEstatal: number | null
}

export const INDICADORES_ESTADO = {
  anioCreacion: 1863,
  creacionDetalle: 'Erigido como Estado Libre y Soberano por decreto del 29 de abril de 1863.',
  localidadesUrbanas: 33,
  poblacionUrbana: 696_587,
  localidadesRurales: 1_922,
  poblacionRural: 231_776,
  poblacionTotal: 928_363,
  pibParticipacionNacional: 2.7,
  pibAnio: 2021,
  pibMillonesPesos: 462_352.56,
  fuente: 'INEGI, Censo de Población y Vivienda 2020; PIB por Entidad Federativa 2021 (vía PEOTDU 2023).',
}

export const INDICADORES_MUNICIPIOS: Record<string, IndicadoresMunicipio> = {
  calakmul:    { localidadesUrbanas: 1, poblacionUrbana: 5_729,   poblacionRural: 26_021, anioCreacion: 1996, pibParticipacionEstatal: null },
  calkini:     { localidadesUrbanas: 4, poblacionUrbana: 32_363,  poblacionRural: 23_787, anioCreacion: null, pibParticipacionEstatal: null },
  campeche:    { localidadesUrbanas: 4, poblacionUrbana: 267_558, poblacionRural: 26_519, anioCreacion: null, pibParticipacionEstatal: null },
  candelaria:  { localidadesUrbanas: 1, poblacionUrbana: 11_121,  poblacionRural: 32_749, anioCreacion: 1998, segregadoDe: 'Carmen', pibParticipacionEstatal: null },
  carmen:      { localidadesUrbanas: 6, poblacionUrbana: 219_186, poblacionRural: 29_659, anioCreacion: null, pibParticipacionEstatal: null },
  champoton:   { localidadesUrbanas: 5, poblacionUrbana: 48_846,  poblacionRural: 29_324, anioCreacion: null, pibParticipacionEstatal: null },
  dzitbalche:  { localidadesUrbanas: 1, poblacionUrbana: 13_208,  poblacionRural: 3_176,  anioCreacion: 2019, segregadoDe: 'Calkiní', pibParticipacionEstatal: null },
  escarcega:   { localidadesUrbanas: 2, poblacionUrbana: 35_338,  poblacionRural: 24_636, anioCreacion: 1990, segregadoDe: 'Champotón', pibParticipacionEstatal: null },
  hecelchakan: { localidadesUrbanas: 2, poblacionUrbana: 21_026,  poblacionRural: 10_970, anioCreacion: null, pibParticipacionEstatal: null },
  hopelchen:   { localidadesUrbanas: 3, poblacionUrbana: 15_852,  poblacionRural: 24_288, anioCreacion: null, pibParticipacionEstatal: null },
  palizada:    { localidadesUrbanas: 1, poblacionUrbana: 3_485,   poblacionRural: 5_198,  anioCreacion: null, pibParticipacionEstatal: null },
  seybaplaya:  { localidadesUrbanas: 2, poblacionUrbana: 14_127,  poblacionRural: 1_167,  anioCreacion: 2019, segregadoDe: 'Champotón', pibParticipacionEstatal: null },
  tenabo:      { localidadesUrbanas: 1, poblacionUrbana: 8_748,   poblacionRural: 2_704,  anioCreacion: null, pibParticipacionEstatal: null },
}

export const formatoMiles = (n: number) => n.toLocaleString('es-MX')
export const porcentaje = (parte: number, total: number) =>
  total > 0 ? `${Math.round((parte / total) * 100)}%` : '—'
