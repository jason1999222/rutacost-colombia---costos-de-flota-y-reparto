import { LaborConfig } from '../types/logistics';
import { TripDispatch } from '../types/logistics';
import { getCurrentPeriod, getPeriodFromDate } from './periodUtils';

/**
 * Obtiene la configuración laboral correcta para un despacho.
 *
 * - Si el despacho tiene un laborConfigSnapshot, lo usa (datos históricos fieles).
 * - Si no tiene snapshot, usa la configuración actual.
 *
 * Esto garantiza que los cálculos históricos siempre usen los precios de la época.
 */
export function getLaborConfigForDispatch(
  dispatch: TripDispatch,
  currentLaborConfig: LaborConfig
): LaborConfig {
  // Si el despacho tiene snapshot, usarlo (preserva precios históricos)
  if (dispatch.laborConfigSnapshot) {
    return dispatch.laborConfigSnapshot;
  }

  // Si no tiene snapshot, usar la configuración actual
  return currentLaborConfig;
}

/**
 * Obtiene la configuración laboral para un período específico.
 *
 * - Si hay despachos cerrados en ese período, usar su snapshot.
 * - Si no hay snapshot, usar la configuración actual.
 */
export function getLaborConfigForPeriod(
  period: string,
  dispatches: TripDispatch[],
  currentLaborConfig: LaborConfig
): LaborConfig {
  // Buscar despachos en ese período con snapshot
  const periodDispatches = dispatches.filter(d => {
    const dispatchPeriod = d.period || getPeriodFromDate(d.departureDate);
    return dispatchPeriod === period && d.laborConfigSnapshot;
  });

  // Si hay despachos con snapshot en ese período, usar el más reciente
  if (periodDispatches.length > 0) {
    return periodDispatches[0].laborConfigSnapshot!;
  }

  // Si no hay snapshot, usar la configuración actual
  return currentLaborConfig;
}

/**
 * Verifica si un período está cerrado (es anterior al período actual).
 */
export function isPeriodClosed(period: string): boolean {
  const current = getCurrentPeriod();
  return period < current;
}

/**
 * Obtiene el año de un período YYYY-MM.
 */
export function getYearFromPeriod(period: string): number {
  return parseInt(period.split('-')[0], 10);
}

/**
 * Obtiene el año actual.
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Verifica si un año está cerrado (es anterior al año actual).
 */
export function isYearClosed(year: number): boolean {
  return year < getCurrentYear();
}

/**
 * Genera un resumen de cierre de año con estadísticas.
 */
export function generateYearSummary(
  year: number,
  dispatches: TripDispatch[]
): {
  totalDispatches: number;
  liquidated: number;
  pending: number;
  totalKm: number;
  totalFreight: number;
  totalCost: number;
  totalProfit: number;
  marginPct: number;
} {
  const yearDispatches = dispatches.filter(d => {
    const dispatchYear = getYearFromPeriod(d.period || getPeriodFromDate(d.departureDate));
    return dispatchYear === year;
  });

  const liquidated = yearDispatches.filter(d => d.status === 'LIQUIDADO');
  const pending = yearDispatches.filter(d => d.status !== 'LIQUIDADO');

  const totalKm = liquidated.reduce((acc, d) => acc + (d.actualKm || d.plannedKm || 0), 0);
  const totalFreight = liquidated.reduce((acc, d) => acc + (d.plannedFreightCOP || 0), 0);
  const totalCost = liquidated.reduce((acc, d) => acc + (d.actualTotalCostCOP || d.plannedTotalCostCOP || 0), 0);
  const totalProfit = totalFreight - totalCost;
  const marginPct = totalFreight > 0 ? (totalProfit / totalFreight) * 100 : 0;

  return {
    totalDispatches: yearDispatches.length,
    liquidated: liquidated.length,
    pending: pending.length,
    totalKm,
    totalFreight,
    totalCost,
    totalProfit,
    marginPct
  };
}
