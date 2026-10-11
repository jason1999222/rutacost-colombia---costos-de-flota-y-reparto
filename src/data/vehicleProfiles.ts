import { VehicleProfile, VehicleMaintenanceConfig } from '../types/logistics';

export const DEFAULT_NPR_MAINTENANCE: VehicleMaintenanceConfig = {
  // 1. Aceite y Lubricantes
  oilChangeIntervalKm: 8000,
  oilGallonsPerChange: 3.5,
  oilPricePerGallon: 95000, // 15W40
  oilFilterPrice: 65000,
  fuelFilterPrice: 85000, // Filtro trampa y combustible
  airFilterPrice: 90000,
  laborOilChangeCost: 35000,

  // 2. Llantas
  tireQuantity: 6,
  newTirePrice: 850000, // 215/75 R17.5
  newTireLifeKm: 85000,
  retreadCount: 1,
  retreadPrice: 420000,
  retreadLifeKm: 45000,
  alignmentBalancingIntervalKm: 15000,
  alignmentBalancingCost: 140000,

  // 3. Preventivo Mecánico
  brakeBandsChangeKm: 35000,
  brakeBandsCost: 680000,
  clutchKitKm: 120000,
  clutchKitCost: 1450000,
  suspensionMaintenanceKm: 45000,
  suspensionMaintenanceCost: 850000,

  // 4. Correctivo / Imprevistos
  correctiveReservePerKm: 75,

  // 5. Lavado y Engrase
  washingCostPerService: 35000,
  washingIntervalKm: 800,
  greasingChassisCost: 30000,
  greasingIntervalKm: 2500,

  // 6. Costos Fijos
  soatAnnual: 1450000,
  rtmAnnual: 420000,
  insuranceAnnual: 4500000,
  taxesAnnual: 1200000,
  gpsMonthly: 85000,
  parkingMonthly: 250000,
  adminMonthly: 350000
};

export const DEFAULT_NLR_MAINTENANCE: VehicleMaintenanceConfig = {
  oilChangeIntervalKm: 8000,
  oilGallonsPerChange: 2.5,
  oilPricePerGallon: 95000,
  oilFilterPrice: 50000,
  fuelFilterPrice: 70000,
  airFilterPrice: 75000,
  laborOilChangeCost: 30000,

  tireQuantity: 6,
  newTirePrice: 580000, // 195/75 R16
  newTireLifeKm: 75000,
  retreadCount: 1,
  retreadPrice: 320000,
  retreadLifeKm: 40000,
  alignmentBalancingIntervalKm: 15000,
  alignmentBalancingCost: 110000,

  brakeBandsChangeKm: 35000,
  brakeBandsCost: 520000,
  clutchKitKm: 120000,
  clutchKitCost: 1150000,
  suspensionMaintenanceKm: 45000,
  suspensionMaintenanceCost: 700000,

  correctiveReservePerKm: 55,

  washingCostPerService: 30000,
  washingIntervalKm: 800,
  greasingChassisCost: 25000,
  greasingIntervalKm: 2500,

  soatAnnual: 1250000,
  rtmAnnual: 390000,
  insuranceAnnual: 3800000,
  taxesAnnual: 950000,
  gpsMonthly: 85000,
  parkingMonthly: 220000,
  adminMonthly: 300000
};

export const DEFAULT_NKR_MAINTENANCE: VehicleMaintenanceConfig = {
  oilChangeIntervalKm: 8000,
  oilGallonsPerChange: 3.0,
  oilPricePerGallon: 95000,
  oilFilterPrice: 55000,
  fuelFilterPrice: 75000,
  airFilterPrice: 80000,
  laborOilChangeCost: 32000,

  tireQuantity: 6,
  newTirePrice: 720000,
  newTireLifeKm: 80000,
  retreadCount: 1,
  retreadPrice: 380000,
  retreadLifeKm: 42000,
  alignmentBalancingIntervalKm: 15000,
  alignmentBalancingCost: 125000,

  brakeBandsChangeKm: 35000,
  brakeBandsCost: 600000,
  clutchKitKm: 120000,
  clutchKitCost: 1300000,
  suspensionMaintenanceKm: 45000,
  suspensionMaintenanceCost: 780000,

  correctiveReservePerKm: 65,

  washingCostPerService: 32000,
  washingIntervalKm: 800,
  greasingChassisCost: 28000,
  greasingIntervalKm: 2500,

  soatAnnual: 1350000,
  rtmAnnual: 410000,
  insuranceAnnual: 4100000,
  taxesAnnual: 1050000,
  gpsMonthly: 85000,
  parkingMonthly: 230000,
  adminMonthly: 320000
};

export const DEFAULT_NHR_MAINTENANCE: VehicleMaintenanceConfig = {
  oilChangeIntervalKm: 7000,
  oilGallonsPerChange: 2.2,
  oilPricePerGallon: 95000,
  oilFilterPrice: 45000,
  fuelFilterPrice: 65000,
  airFilterPrice: 65000,
  laborOilChangeCost: 30000,

  tireQuantity: 4,
  newTirePrice: 480000,
  newTireLifeKm: 65000,
  retreadCount: 0,
  retreadPrice: 0,
  retreadLifeKm: 0,
  alignmentBalancingIntervalKm: 12000,
  alignmentBalancingCost: 90000,

  brakeBandsChangeKm: 30000,
  brakeBandsCost: 450000,
  clutchKitKm: 100000,
  clutchKitCost: 950000,
  suspensionMaintenanceKm: 40000,
  suspensionMaintenanceCost: 650000,

  correctiveReservePerKm: 50,

  washingCostPerService: 25000,
  washingIntervalKm: 700,
  greasingChassisCost: 20000,
  greasingIntervalKm: 3000,

  soatAnnual: 1100000,
  rtmAnnual: 380000,
  insuranceAnnual: 3200000,
  taxesAnnual: 850000,
  gpsMonthly: 75000,
  parkingMonthly: 200000,
  adminMonthly: 250000
};

export const DEFAULT_SENCILLO_MAINTENANCE: VehicleMaintenanceConfig = {
  oilChangeIntervalKm: 10000,
  oilGallonsPerChange: 6.0,
  oilPricePerGallon: 95000,
  oilFilterPrice: 95000,
  fuelFilterPrice: 125000,
  airFilterPrice: 130000,
  laborOilChangeCost: 45000,

  tireQuantity: 6,
  newTirePrice: 1450000, // 295/80 R22.5
  newTireLifeKm: 95000,
  retreadCount: 1,
  retreadPrice: 650000,
  retreadLifeKm: 50000,
  alignmentBalancingIntervalKm: 15000,
  alignmentBalancingCost: 180000,

  brakeBandsChangeKm: 40000,
  brakeBandsCost: 950000,
  clutchKitKm: 140000,
  clutchKitCost: 2200000,
  suspensionMaintenanceKm: 50000,
  suspensionMaintenanceCost: 1200000,

  correctiveReservePerKm: 95,

  washingCostPerService: 45000,
  washingIntervalKm: 800,
  greasingChassisCost: 40000,
  greasingIntervalKm: 2500,

  soatAnnual: 1950000,
  rtmAnnual: 480000,
  insuranceAnnual: 6500000,
  taxesAnnual: 1800000,
  gpsMonthly: 95000,
  parkingMonthly: 300000,
  adminMonthly: 450000
};

export const VEHICLE_PROFILES: VehicleProfile[] = [
  {
    id: "npr-c2-turbo",
    name: "Camión NPR (2 Ejes / Turbo)",
    category: "NPR",
    description: "Configuración estándar de la flota SCJ (Móviles: GTX052, ESQ742, ESQ294, JYY249). 2 ejes, mayor capacidad volumétrica y tonelaje.",
    payloadTons: 4.8,
    fuelType: "ACPM",
    kmPerGallon: 22.5,
    fuelPricePerGallon: 10800,

    oilCostPerKm: 76.0,
    tiresCostPerKm: 68.0,
    preventiveMaintenancePerKm: 51.0,
    correctiveMaintenancePerKm: 75.0,
    washingAndGreasingPerKm: 56.0,
    totalMaintenancePerKm: 326.0,

    dailyFixedCost: 52000,
    vehicleValue: 145000000,
    maintenanceConfig: DEFAULT_NPR_MAINTENANCE
  },
  {
    id: "nlr-camioneta",
    name: "Camión NLR (Liviano / Camioneta)",
    category: "NLR",
    description: "Vehículo ágil de reparto SCJ (Móviles: PUN774, PUN276, LKN995, JYX457, NNM737). Menor tarifa de peaje y menor consumo de ACPM.",
    payloadTons: 3.0,
    fuelType: "ACPM",
    kmPerGallon: 31.0,
    fuelPricePerGallon: 10800,

    oilCostPerKm: 55.0,
    tiresCostPerKm: 48.0,
    preventiveMaintenancePerKm: 42.0,
    correctiveMaintenancePerKm: 55.0,
    washingAndGreasingPerKm: 47.0,
    totalMaintenancePerKm: 247.0,

    dailyFixedCost: 38000,
    vehicleValue: 110000000,
    maintenanceConfig: DEFAULT_NLR_MAINTENANCE
  }
];
