import {
  DeliveryRoute,
  VehicleProfile,
  LaborConfig,
  RouteCostBreakdown,
  RouteVehicleComparison
} from '../types/logistics';
import { getStoredWorkSchedule } from '../data/colombiaHolidays';
import { computeEmployerCharges, isLoadedOvertimeRate } from './employerCharges';

/**
 * Estimación de horas por franja horaria de reloj para el presupuesto de ruta.
 *
 * La ruta es una plantilla sin fecha (no aplica calendario de festivos), pero sí
 * se puede estimar cómo caen las horas en el reloj: partiendo de la hora de
 * inicio pactada (cronograma laboral), las primeras `standardHours` son
 * ordinarias (diurna o nocturna según la hora del reloj) y el excedente es
 * hora extra (diurna o nocturna según la hora del reloj). Franja nocturna
 * legal: 21:00 a 06:00 (configurable en el cronograma).
 */
export function splitHoursByClock(
  totalHours: number,
  startTime: string,
  standardHours: number,
  nightStartHour: number = 21,
  nightEndHour: number = 6
): { regularDay: number; regularNight: number; otDay: number; otNight: number } {
  const res = { regularDay: 0, regularNight: 0, otDay: 0, otNight: 0 };
  const parts = (startTime || '06:00').split(':').map(Number);
  let cursor = ((isNaN(parts[0]) ? 6 : parts[0]) + (isNaN(parts[1]) ? 0 : parts[1] / 60));
  let ordinaryLeft = Math.max(0, standardHours);
  let remaining = Math.max(0, totalHours);

  let guard = 0;
  while (remaining > 0.001 && guard++ < 10000) {
    const step = Math.min(0.1, remaining);
    const hour = ((cursor % 24) + 24) % 24;
    const isNight = nightStartHour > nightEndHour
      ? (hour >= nightStartHour || hour < nightEndHour)
      : (hour >= nightStartHour && hour < nightEndHour);
    if (ordinaryLeft > 0) {
      const take = Math.min(step, ordinaryLeft);
      if (isNight) res.regularNight += take; else res.regularDay += take;
      ordinaryLeft -= take;
      remaining -= take;
      cursor += take;
    } else {
      if (isNight) res.otNight += step; else res.otDay += step;
      remaining -= step;
      cursor += step;
    }
  }
  const r1 = (v: number) => Math.round(v * 10) / 10;
  return {
    regularDay: r1(res.regularDay),
    regularNight: r1(res.regularNight),
    otDay: r1(res.otDay),
    otNight: r1(res.otNight)
  };
}

export function calculateRouteCost(
  route: DeliveryRoute,
  vehicle: VehicleProfile,
  labor: LaborConfig
): RouteCostBreakdown {
  // En la matriz SCJ, route.transitHours contiene la duración total estimada de la ruta (HORAS_ESTIMADAS_RUTA)
  const totalHours = route.transitHours > 0
    ? route.transitHours
    : (route.km > 0 ? Math.max(2.5, Math.round((route.km / 35) * 10) / 10) + ((route.loadingMinutes || 120) / 60) : 8.0);
  const loadingHours = Math.min((route.loadingMinutes || 120) / 60, totalHours);
  const transitHours = Math.max(0, totalHours - loadingHours);

  // ============================================================
  // DISTRIBUCIÓN DE HORAS POR FRANJA HORARIA DE RELOJ (CST)
  // En lugar de asumir arbitrariamente que "las primeras 4 horas
  // extras son diurnas", se simula la jornada desde la hora de
  // inicio pactada y cada tramo se clasifica según el reloj:
  // - Las primeras standardHoursPerDay son ordinarias (diurna/nocturna)
  // - El excedente es extra (diurna/nocturna)
  // (La ruta es plantilla sin fecha: los festivos se liquidan con el
  //  despacho real o el calendario de asistencia, no en el presupuesto)
  // ============================================================
  const activeSchedule = getStoredWorkSchedule();
  const nightStartParts = (activeSchedule.nightHoursStartTime || '21:00').split(':').map(Number);
  const nightEndParts = (activeSchedule.nightHoursEndTime || '06:00').split(':').map(Number);
  const scheduleStartTime = labor.fixedShiftStartTime || activeSchedule.normalShiftStartTime || '06:00';
  const hourSplit = splitHoursByClock(
    totalHours,
    scheduleStartTime,
    labor.standardHoursPerDay || 8.0,
    (nightStartParts[0] || 21) + (nightStartParts[1] || 0) / 60,
    (nightEndParts[0] || 6) + (nightEndParts[1] || 0) / 60
  );

  const regularHours = hourSplit.regularDay + hourSplit.regularNight;
  const overtimeHours = hourSplit.otDay + hourSplit.otNight;
  const overtimeDayHours = hourSplit.otDay;
  const overtimeNightHours = hourSplit.otNight;

  // Días de duración y viáticos
  const vehicleDays = Math.max(1, Math.round((totalHours / 12) * 10) / 10);
  const viaticosDays = totalHours >= (labor.viaticosHourThreshold || 14.0)
    ? Math.max(1, Math.ceil(totalHours / 20))
    : 0;

  // Cantidad de auxiliares asignados a la ruta (los auxiliares también reciben viáticos)
  const helpersAssignedCount = (route.helpersCount && route.helpersCount > 0)
    ? route.helpersCount
    : (labor.hasHelper ? 1 : 0);

  // ============================================================
  // 1. NÓMINA / MANO DE OBRA — CONDUCTOR
  // ============================================================
  const hourlyOrdRate = labor.hourlyOrdinaryRate || 8000;
  const hourlyNightOrdRate = labor.hourlyNightRate || hourlyOrdRate * (1 + (labor.nightSurchargeRate ?? 0.35));
  const hourlyDayExtRate = labor.hourlyOvertimeDayRate || 17488;
  const hourlyNightExtRate = labor.hourlyOvertimeNightRate || 23000;

  // Pago ordinario (diurno al valor hora pactado; nocturno con recargo +35%)
  const driverRegularPay = (hourSplit.regularDay * hourlyOrdRate) + (hourSplit.regularNight * hourlyNightOrdRate);
  // Horas extras a la tarifa de la base de datos SCJ
  const driverOvertimePay = (overtimeDayHours * hourlyDayExtRate) + (overtimeNightHours * hourlyNightExtRate);
  const driverBaseDevengado = driverRegularPay + driverOvertimePay;

  // Auxilio de Transporte (solo para salarios hasta 2 SMMLV, proporcional al viaje)
  const isDriverAuxilio = (labor.driverSalary || labor.smmlv) <= (labor.smmlv * 2);
  const driverTripAuxilio = isDriverAuxilio
    ? (labor.auxilioTransporteLegal / 30) * Math.max(1, totalHours / 8)
    : 0;

  // Cargos patronales (prestaciones + seguridad social + parafiscales + dotación):
  // - Se aplican sobre la parte SALARIAL (horas ordinarias con sus recargos).
  // - Las horas extras solo generan cargos si su tarifa NO trae factor
  //   prestacional (las tarifas SCJ $17.488 / $23.000 ya lo incluyen).
  const driverExtrasLoaded =
    isLoadedOvertimeRate(hourlyDayExtRate, hourlyOrdRate, labor.dayOvertimeSurcharge ?? 0.25) ||
    isLoadedOvertimeRate(hourlyNightExtRate, hourlyOrdRate, labor.nightOvertimeSurcharge ?? 0.75);
  const driverCharges = computeEmployerCharges({
    salariedBase: driverRegularPay + (driverExtrasLoaded ? 0 : driverOvertimePay),
    auxilioTransporte: driverTripAuxilio,
    monthlySalary: labor.driverSalary,
    arlRate: labor.arlRiskLevelRate,
    labor,
    proratedDays: Math.max(1, totalHours / 8)
  });
  const driverDotacion = driverCharges.dotacion;
  const driverPrestaciones = driverCharges.totalPrestaciones;
  const driverSeguridadSocial = driverCharges.totalSeguridadSocial;
  const driverParafiscales = driverCharges.totalParafiscales;

  // Viáticos por persona (si la ruta trae viático fijo de la matriz SCJ, se respeta;
  // si no, se calcula por días de pernoctación)
  const perPersonViatico = (route.viaticosCOP !== undefined && route.viaticosCOP > 0)
    ? route.viaticosCOP
    : (viaticosDays * labor.dailyViaticosPerPerson);
  const driverViaticos = perPersonViatico;

  // Costo laboral del conductor (SIN viáticos: los viáticos no son salario,
  // se registran como partida aparte del viaje y se suman una sola vez).
  const driverTotal = driverBaseDevengado
    + driverTripAuxilio
    + driverPrestaciones
    + driverSeguridadSocial
    + driverParafiscales
    + driverDotacion;

  const driverCost = {
    baseSalaryForTrip: driverRegularPay,
    auxilioTransporte: driverTripAuxilio,
    overtimePay: driverOvertimePay,
    viaticos: driverViaticos,
    prestaciones: driverPrestaciones,
    seguridadSocial: driverSeguridadSocial,
    parafiscales: driverParafiscales,
    dotacion: driverDotacion,
    total: driverTotal
  };

  // ============================================================
  // AUXILIAR (solo si la ruta o el despacho tiene auxiliar asignado)
  // Con las mismas reglas del conductor: auxilio con verificación 2 SMMLV,
  // exención Ley 1607 verificando salario, viáticos por persona y cargos
  // patronales solo si sus tarifas de extras no vienen cargadas.
  // ============================================================
  let helperCost = {
    baseSalaryForTrip: 0,
    auxilioTransporte: 0,
    overtimePay: 0,
    viaticos: 0,
    prestaciones: 0,
    seguridadSocial: 0,
    parafiscales: 0,
    dotacion: 0,
    total: 0
  };

  if (helpersAssignedCount > 0) {
    const helperHourly = labor.helperHourlyOrdinaryRate || ((labor.helperSalary || labor.smmlv) / (labor.monthlyWorkingHours || 210));
    const helperNightOrd = labor.helperHourlyNightRate || helperHourly * (1 + (labor.nightSurchargeRate ?? 0.35));
    const helperOvertimeDay = labor.helperOvertimeDayRate || (helperHourly * (1 + labor.dayOvertimeSurcharge));
    const helperOvertimeNight = labor.helperOvertimeNightRate || (helperHourly * (1 + labor.nightOvertimeSurcharge));

    const helperRegularPay = (hourSplit.regularDay * helperHourly) + (hourSplit.regularNight * helperNightOrd);
    const helperOvertimePay = (overtimeDayHours * helperOvertimeDay) + (overtimeNightHours * helperOvertimeNight);
    const helperBase = helperRegularPay + helperOvertimePay;

    // Auxilio de transporte con la misma regla del conductor (≤ 2 SMMLV)
    const helperMonthlySalary = labor.helperSalary || labor.smmlv;
    const isHelperAuxilio = helperMonthlySalary <= (labor.smmlv * 2);
    const helperAuxilio = isHelperAuxilio
      ? (labor.auxilioTransporteLegal / 30) * Math.max(1, totalHours / 8)
      : 0;

    // Tarifas de extras del auxiliar: si no vienen cargadas con factor
    // prestacional, sí generan cargos patronales (ej. $10.422 = recargo puro)
    const helperExtrasLoaded =
      isLoadedOvertimeRate(helperOvertimeDay, helperHourly, labor.dayOvertimeSurcharge) ||
      isLoadedOvertimeRate(helperOvertimeNight, helperHourly, labor.nightOvertimeSurcharge);
    const helperCharges = computeEmployerCharges({
      salariedBase: helperRegularPay + (helperExtrasLoaded ? 0 : helperOvertimePay),
      auxilioTransporte: helperAuxilio,
      monthlySalary: helperMonthlySalary,
      arlRate: labor.arlRiskLevelRateHelper || labor.arlRiskLevelRate,
      labor,
      proratedDays: Math.max(1, totalHours / 8)
    });

    // El auxiliar también recibe viáticos en ruta (por persona)
    const helperViaticos = perPersonViatico * helpersAssignedCount;
    const helperTotal = helperBase + helperAuxilio + helperCharges.totalCharges;

    helperCost = {
      baseSalaryForTrip: helperRegularPay,
      auxilioTransporte: helperAuxilio,
      overtimePay: helperOvertimePay,
      viaticos: helperViaticos,
      prestaciones: helperCharges.totalPrestaciones,
      seguridadSocial: helperCharges.totalSeguridadSocial,
      parafiscales: helperCharges.totalParafiscales,
      dotacion: helperCharges.dotacion,
      total: helperTotal
    };
  }

  const totalLaborCost = driverCost.total + helperCost.total;

  // 2. Costos Variables del Vehículo (Combustible ACPM y Mantenimiento SICE-TAC)
  const isNlrOrNhr = vehicle.category === 'NLR' || vehicle.category === 'NHR';
  const effectiveKmPerGal = route.customFuelRateKmPerGal || vehicle.kmPerGallon || (isNlrOrNhr ? 31.0 : 22.5);
  const effectiveKm = route.km > 0 ? route.km : 1;
  const fuelGallons = route.km > 0 ? (route.km / effectiveKmPerGal) : 0;
  const fuelCost = fuelGallons * (vehicle.fuelPricePerGallon || 10800);

  // Mantenimiento por Km
  const oilCost = route.km * (vehicle.oilCostPerKm || 0);
  const tiresCost = route.km * (vehicle.tiresCostPerKm || 0);
  const preventiveMaintenanceCost = route.km * (vehicle.preventiveMaintenancePerKm || 0);
  const correctiveMaintenanceCost = route.km * (vehicle.correctiveMaintenancePerKm || 0);
  const washingCost = route.km * (vehicle.washingAndGreasingPerKm || 0);
  const totalMaintenanceCost = oilCost + tiresCost + preventiveMaintenanceCost + correctiveMaintenanceCost + washingCost;
  const totalVehicleVariableCost = fuelCost + totalMaintenanceCost;

  // 3. Peajes (según categoría NPR vs NLR)
  let tollCost = route.tollEstimatedCost || 0;
  if (isNlrOrNhr && route.tollEstimatedCostNlr !== undefined && route.tollEstimatedCostNlr >= 0) {
    tollCost = route.tollEstimatedCostNlr;
  }

  // 4. Viáticos y Gastos Adicionales
  // Viáticos de TODA la tripulación (conductor + auxiliares), por persona.
  // Se suman UNA sola vez al costo total (antes se contaban doble).
  const viaticosCost = perPersonViatico * (1 + helpersAssignedCount);
  const additionalExpensesCost = route.additionalExpensesCOP || 0;

  // 5. Costos Fijos Diarios Prorrateados (informativo de costo de propiedad)
  const proratedFixedCost = vehicleDays * (vehicle.dailyFixedCost || 52000);

  // 6. Costo Total Operativo Directo del Viaje (Metodología Oficial SCJ)
  const totalTripCost = totalLaborCost + totalVehicleVariableCost + tollCost + viaticosCost + additionalExpensesCost;

  const costPerKm = totalTripCost / effectiveKm;
  const costPerHour = totalTripCost / Math.max(0.5, totalHours);
  const costPerStore = totalTripCost / Math.max(1, route.storeIds?.length || 1);

  // 7. Flete Cobrado / Presupuestado y Métricas Financieras
  let freightTariff = 0;
  if (isNlrOrNhr && route.freightTariffNlr && route.freightTariffNlr > 0) {
    freightTariff = route.freightTariffNlr;
  } else if (!isNlrOrNhr && route.freightTariffNpr && route.freightTariffNpr > 0) {
    freightTariff = route.freightTariffNpr;
  } else {
    freightTariff = route.freightTariffNpr || route.freightTariffNlr || (totalTripCost * 1.25);
  }

  const netProfitCOP = freightTariff - totalTripCost;
  const expensePercentage = freightTariff > 0 ? (totalTripCost / freightTariff) * 100 : 0;
  const profitPercentage = freightTariff > 0 ? (netProfitCOP / freightTariff) * 100 : 0;

  // 8. Comparativa Inteligente NPR vs NLR
  const buildComparison = (type: 'NPR' | 'NLR'): RouteVehicleComparison => {
    const isNlr = type === 'NLR';
    const compTariff = (isNlr ? route.freightTariffNlr : route.freightTariffNpr) || freightTariff;
    const compToll = isNlr
      ? (route.tollEstimatedCostNlr !== undefined ? route.tollEstimatedCostNlr : route.tollEstimatedCost)
      : route.tollEstimatedCost;
    const compKmPerGal = isNlr ? 31.0 : 22.5;
    const compGallons = route.km > 0 ? (route.km / compKmPerGal) : 0;
    const compFuelCost = compGallons * (vehicle.fuelPricePerGallon || 10800);
    const compMaintCost = route.km * (isNlr ? 247.0 : 326.0);
    const compFixedCost = vehicleDays * (isNlr ? 38000 : 52000);
    const compTotalCost = totalLaborCost + compFuelCost + compMaintCost + compToll + viaticosCost + additionalExpensesCost;
    const compNetProfit = compTariff - compTotalCost;
    const compMarginPct = compTariff > 0 ? (compNetProfit / compTariff) * 100 : 0;
    const compExpensePct = compTariff > 0 ? (compTotalCost / compTariff) * 100 : 0;

    return {
      vehicleCategory: type,
      freightTariff: compTariff,
      tollCost: compToll,
      fuelCost: compFuelCost,
      fuelGallons: compGallons,
      maintenanceCost: compMaintCost,
      laborCost: totalLaborCost,
      fixedCost: compFixedCost,
      totalCost: compTotalCost,
      netProfitCOP: compNetProfit,
      profitMarginPct: compMarginPct,
      expensePct: compExpensePct,
      isMoreProfitable: false // Asignado luego
    };
  };

  const nprComp = buildComparison('NPR');
  const nlrComp = buildComparison('NLR');
  if (nlrComp.netProfitCOP > nprComp.netProfitCOP) {
    nlrComp.isMoreProfitable = true;
  } else {
    nprComp.isMoreProfitable = true;
  }

  return {
    route,
    vehicle,
    totalHours,
    regularHours,
    overtimeHours,
    overtimeDayHours,
    overtimeNightHours,
    viaticosDays,
    driverCost,
    helperCost,
    totalLaborCost,
    fuelGallons,
    fuelCost,
    oilCost,
    tiresCost,
    preventiveMaintenanceCost,
    correctiveMaintenanceCost,
    washingCost,
    totalMaintenanceCost,
    totalVehicleVariableCost,
    tollCost,
    viaticosCost,
    additionalExpensesCost,
    proratedFixedCost,
    totalTripCost,
    costPerKm,
    costPerHour,
    costPerStore,
    freightTariff,
    expensePercentage,
    profitPercentage,
    netProfitCOP,
    nprComparison: nprComp,
    nlrComparison: nlrComp,
    suggestedFreightTariff: (marginPercentage: number) => {
      const margin = Math.min(90, Math.max(0, marginPercentage)) / 100;
      return margin < 1 ? totalTripCost / (1 - margin) : totalTripCost * 1.5;
    }
  };
}

// Formateador de moneda colombiana (COP)
export function formatCOP(amount: number, compact: boolean = false): string {
  if (compact && Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (compact && Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

// Formateador decimal
export function formatNumber(val: number, decimals: number = 1): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(val);
}
