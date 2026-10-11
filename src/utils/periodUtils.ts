/**
 * Utilidades para manejo de períodos de cierre mensual.
 *
 * Cada despacho pertenece a un período (YYYY-MM). Al cerrar un mes,
 * los despachos de ese período quedan archivados y se preservan
 * los precios (laborConfigSnapshot) que estaban vigentes en esa época.
 */

/**
 * Obtiene el período actual en formato YYYY-MM
 */
export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Obtiene el período anterior en formato YYYY-MM
 */
export function getPreviousPeriod(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 2, 1); // mes - 2 porque getMonth() es 0-indexed
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Formatea un período YYYY-MM para mostrar (ej: "Enero 2026")
 */
export function formatPeriod(period: string): string {
  if (!period || !period.includes('-')) return period;

  const [year, month] = period.split('-').map(Number);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const monthName = monthNames[month - 1] || 'Mes';
  return `${monthName} ${year}`;
}

/**
 * Obtiene la lista de períodos disponibles a partir de una lista de despachos.
 * Ordenados del más reciente al más antiguo.
 */
export function getAvailablePeriods(departureDates: string[]): string[] {
  const periods = new Set<string>();

  departureDates.forEach(date => {
    if (date && date.length >= 7) {
      periods.add(date.substring(0, 7)); // YYYY-MM
    }
  });

  return Array.from(periods).sort((a, b) => b.localeCompare(a));
}

/**
 * Verifica si un período está cerrado.
 * Un período está cerrado si es anterior al período actual.
 */
export function isPeriodClosed(period: string): boolean {
  const current = getCurrentPeriod();
  return period < current;
}

/**
 * Obtiene el período de una fecha YYYY-MM-DD
 */
export function getPeriodFromDate(date: string): string {
  if (!date || date.length < 7) return '';
  return date.substring(0, 7);
}

/**
 * Genera una lista de períodos entre dos fechas (inclusive).
 * Útil para llenar el selector de filtros.
 */
export function getPeriodsBetween(startPeriod: string, endPeriod: string): string[] {
  const periods: string[] = [];
  let current = startPeriod;

  while (current <= endPeriod) {
    periods.push(current);
    current = getNextPeriod(current);
  }

  return periods;
}

/**
 * Obtiene el siguiente período en formato YYYY-MM
 */
export function getNextPeriod(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month, 1); // mes es 1-indexado aquí
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
