import { VehicleMaintenanceConfig, VehicleProfile } from '../types/logistics';

export interface ComputedMaintenanceRates {
  oilCostPerKm: number;
  tiresCostPerKm: number;
  preventiveMaintenancePerKm: number;
  correctiveMaintenancePerKm: number;
  washingAndGreasingPerKm: number;
  totalMaintenancePerKm: number;
  dailyFixedCost: number;
}

/**
 * Calcula con precisión milimétrica los costos por kilómetro
 * de lubricación, llantas, preventivo, correctivo, lavado y costos fijos.
 */
export function computeMaintenanceRates(config: VehicleMaintenanceConfig): ComputedMaintenanceRates {
  // 1. Aceite y Lubricantes
  // (galones * precio + filtro aceite + filtro combustible + filtro aire + mano de obra) / intervalo
  const oilChangeTotalCost =
    (config.oilGallonsPerChange * config.oilPricePerGallon) +
    config.oilFilterPrice +
    config.fuelFilterPrice +
    config.airFilterPrice +
    config.laborOilChangeCost;

  const oilCostPerKm = config.oilChangeIntervalKm > 0
    ? (oilChangeTotalCost / config.oilChangeIntervalKm)
    : 0;

  // 2. Llantas y Neumáticos
  // Vida total considerando vida útil original + reencauches
  const totalTireLifeKm = config.newTireLifeKm + (config.retreadCount * config.retreadLifeKm);
  const costPerTireTotal = config.newTirePrice + (config.retreadCount * config.retreadPrice);

  const tiresBasePerKm = totalTireLifeKm > 0
    ? ((costPerTireTotal * config.tireQuantity) / totalTireLifeKm)
    : 0;

  const alignmentPerKm = config.alignmentBalancingIntervalKm > 0
    ? (config.alignmentBalancingCost / config.alignmentBalancingIntervalKm)
    : 0;

  const tiresCostPerKm = tiresBasePerKm + alignmentPerKm;

  // 3. Preventivo Mecánico (Frenos, Embrague, Suspensión)
  const brakesPerKm = config.brakeBandsChangeKm > 0
    ? (config.brakeBandsCost / config.brakeBandsChangeKm)
    : 0;

  const clutchPerKm = config.clutchKitKm > 0
    ? (config.clutchKitCost / config.clutchKitKm)
    : 0;

  const suspensionPerKm = config.suspensionMaintenanceKm > 0
    ? (config.suspensionMaintenanceCost / config.suspensionMaintenanceKm)
    : 0;

  const preventiveMaintenancePerKm = brakesPerKm + clutchPerKm + suspensionPerKm;

  // 4. Mantenimiento Correctivo / Provisión de Imprevistos
  const correctiveMaintenancePerKm = config.correctiveReservePerKm;

  // 5. Lavado y Engrase
  const washPerKm = config.washingIntervalKm > 0
    ? (config.washingCostPerService / config.washingIntervalKm)
    : 0;

  const greasePerKm = config.greasingIntervalKm > 0
    ? (config.greasingChassisCost / config.greasingIntervalKm)
    : 0;

  const washingAndGreasingPerKm = washPerKm + greasePerKm;

  // 6. Costos Fijos Diarios
  const annualTotal =
    config.soatAnnual +
    config.rtmAnnual +
    config.insuranceAnnual +
    config.taxesAnnual;

  const monthlyTotal =
    config.gpsMonthly +
    config.parkingMonthly +
    config.adminMonthly;

  const dailyFixedCost = Math.round((annualTotal / 365) + (monthlyTotal / 30));

  const totalMaintenancePerKm =
    oilCostPerKm +
    tiresCostPerKm +
    preventiveMaintenancePerKm +
    correctiveMaintenancePerKm +
    washingAndGreasingPerKm;

  return {
    oilCostPerKm: Math.round(oilCostPerKm * 10) / 10,
    tiresCostPerKm: Math.round(tiresCostPerKm * 10) / 10,
    preventiveMaintenancePerKm: Math.round(preventiveMaintenancePerKm * 10) / 10,
    correctiveMaintenancePerKm: Math.round(correctiveMaintenancePerKm * 10) / 10,
    washingAndGreasingPerKm: Math.round(washingAndGreasingPerKm * 10) / 10,
    totalMaintenancePerKm: Math.round(totalMaintenancePerKm * 10) / 10,
    dailyFixedCost
  };
}

/**
 * Actualiza un perfil de vehículo sincronizando las tarifas calculadas
 */
export function syncVehicleProfileWithMaintenance(profile: VehicleProfile): VehicleProfile {
  if (!profile.maintenanceConfig) return profile;

  const rates = computeMaintenanceRates(profile.maintenanceConfig);
  return {
    ...profile,
    oilCostPerKm: rates.oilCostPerKm,
    tiresCostPerKm: rates.tiresCostPerKm,
    preventiveMaintenancePerKm: rates.preventiveMaintenancePerKm,
    correctiveMaintenancePerKm: rates.correctiveMaintenancePerKm,
    washingAndGreasingPerKm: rates.washingAndGreasingPerKm,
    totalMaintenancePerKm: rates.totalMaintenancePerKm,
    dailyFixedCost: rates.dailyFixedCost
  };
}
