import { RouteCostBreakdown, VehicleProfile, LaborConfig } from '../types/logistics';

export function exportRoutesToCSV(
  breakdowns: RouteCostBreakdown[],
  vehicle: VehicleProfile,
  labor: LaborConfig
) {
  const headers = [
    "ID_RUTA",
    "NOMBRE_RUTA",
    "ZONA",
    "KM_POR_ZONA",
    "HORAS_ESTIMADAS_RUTA",
    "TIEMPO_MUERTO_CARGUE_MINS",
    "HORAS_TOTALES_OPERACION",
    "HORAS_ORDINARIAS_8H",
    "HORAS_EXTRAS",
    "LOCALES_RELACIONADOS",
    "CANTIDAD_LOCALES",
    "CANT_PEAJES",
    "VALOR_PEAJES_COP",
    "COSTO_CONDUCTOR_COP",
    "COSTO_AUXILIAR_COP",
    "COSTO_PERSONAL_TOTAL_COP",
    "COMBUSTIBLE_GALONES",
    "COSTO_COMBUSTIBLE_ACPM_COP",
    "COSTO_ACEITE_LUBRICANTES_COP",
    "COSTO_LLANTAS_NEUMATICOS_COP",
    "COSTO_MANTENIMIENTO_PREVENTIVO_COP",
    "COSTO_LAVADO_ENGRASE_COP",
    "COSTO_FIJO_PRORRATEADO_COP",
    "COSTO_TOTAL_VIAJE_COP",
    "COSTO_POR_KM_COP",
    "COSTO_POR_HORA_COP",
    "COSTO_POR_LOCAL_COP",
    "TARIFA_FLETE_SUGERIDA_MARGEN_20PCT_COP"
  ];

  const rows = breakdowns.map(b => {
    const suggestedTariff20 = b.suggestedFreightTariff(20);

    return [
      `"${b.route.id}"`,
      `"${b.route.name.replace(/"/g, '""')}"`,
      `"${b.route.zone.replace(/"/g, '""')}"`,
      b.route.km.toFixed(1),
      b.route.transitHours.toFixed(1),
      b.route.loadingMinutes,
      b.totalHours.toFixed(2),
      b.regularHours.toFixed(2),
      b.overtimeHours.toFixed(2),
      `"${b.route.storeIds.join(', ')}"`,
      b.route.storeIds.length,
      b.route.tollCount,
      Math.round(b.tollCost),
      Math.round(b.driverCost.total),
      Math.round(b.helperCost.total),
      Math.round(b.totalLaborCost),
      b.fuelGallons.toFixed(2),
      Math.round(b.fuelCost),
      Math.round(b.oilCost),
      Math.round(b.tiresCost),
      Math.round(b.preventiveMaintenanceCost),
      Math.round(b.washingCost),
      Math.round(b.proratedFixedCost),
      Math.round(b.totalTripCost),
      Math.round(b.costPerKm),
      Math.round(b.costPerHour),
      Math.round(b.costPerStore),
      Math.round(suggestedTariff20)
    ].join(',');
  });

  const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Costos_Rutas_Reparto_Colombia_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
