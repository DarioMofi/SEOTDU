/**
 * Servicio de acceso a datos espaciales y configuración de capas.
 * Centraliza las peticiones para facilitar la futura migración a un backend (ej. Supabase/PostgreSQL).
 */

/**
 * Obtiene la geometría (GeoJSON) de una capa específica.
 */
export async function getCapaGeoJSON(layerId: string): Promise<any> {
  const res = await fetch(`/layers/${layerId}.geojson`);
  if (!res.ok) throw new Error(`GeoJSON no encontrado para ${layerId}`);
  return res.json();
}

/**
 * Obtiene la lista de IDs de capas disponibles.
 */
export async function getCapasDisponibles(): Promise<string[]> {
  const res = await fetch('/layers/available.json');
  if (!res.ok) throw new Error('No se pudo cargar la lista de capas disponibles');
  return res.json();
}

/**
 * Obtiene la configuración de simbología para un módulo o archivo específico.
 */
export async function getEstiloModulo(archivo: string): Promise<any> {
  const res = await fetch(`/estilos/${archivo}`);
  if (!res.ok) throw new Error(`Estilo no encontrado: ${archivo}`);
  return res.json();
}
