export interface DeliveryRoute {
  id: string; // ej. SCJ-001
  name: string; // ej. SUPIA-RIOSUCIO-ANSERMA
  zone: string; // ej. Eje Cafetero / Caldas
  km: number; // KM POR ZONA CON RETORNO (ej: 386.6)
  transitHours: number; // Tiempo estimado de tránsito en carretera
  loadingMinutes: number; // Tiempo de cargue / descargue en minutos
  storeIds: string[]; // Puntos de entrega / paradas
  tollEstimatedCost: number; // Peajes ida y regreso para NPR (2 ejes) en COP
  tollEstimatedCostNlr?: number; // Peajes ida y regreso para NLR (camioneta) en COP
  tollCount: number; // Cantidad de estaciones de peaje
  tollStations?: string; // Nombres de peajes (ej: "Amagá + La Pintada + Supía")
  freightTariffNpr?: number; // COSTO NPR (Tarifa flete cliente presupuestada NPR)
  freightTariffNlr?: number; // COSTO NLR (Tarifa flete cliente presupuestada NLR)
  viaticosCOP?: number; // Viáticos establecidos por ruta según tabla SCJ
  customFuelRateKmPerGal?: number; // Override de rendimiento de combustible
  notes?: string;
  assignedVehiclePlate?: string;
  assignedDriverName?: string;
  assignedHelperName?: string;
  helpersCount?: number; // Cantidad de auxiliares asignados (0 por defecto en troncal)
  additionalExpensesCOP?: number; // Gastos adicionales (engrase, montallanta, etc.)
  originStoreId?: string; // Bodega o tienda de salida (ej: L-000 para CEDI, u otra bodega para traslados)
  originName?: string; // Nombre descriptivo del punto de salida
}

export interface ProfitabilityValidationConfig {
  targetMarginPercentage: number; // Margen de rentabilidad objetivo (ej. 20%)
  maxAllowedCostPerTrip: number; // Umbral máximo de costo presupuestado por viaje (ej. $900.000 COP)
  benchmarkFreightTariffCOP: number; // Tarifa o flete de referencia comercial
  isEnabled: boolean; // Si la validación visual condicional está activa
}

export interface VehicleMaintenanceConfig {
  // 1. Aceite y Lubricantes
  oilChangeIntervalKm: number; // Intervalo de cambio de aceite (ej: 8.000 km)
  oilGallonsPerChange: number; // Galones de aceite requeridos (ej: 3.5 gal)
  oilPricePerGallon: number; // Precio por galón de aceite 15W40 (ej: $95.000 COP)
  oilFilterPrice: number; // Filtro de aceite motor (ej: $65.000 COP)
  fuelFilterPrice: number; // Filtro trampa de combustible / ACPM (ej: $85.000 COP)
  airFilterPrice: number; // Filtro de aire (ej: $90.000 COP)
  laborOilChangeCost: number; // Mano de obra cambio lubricantes (ej: $35.000 COP)

  // 2. Llantas y Neumáticos
  tireQuantity: number; // Cantidad de llantas activas (ej: 6 llantas)
  newTirePrice: number; // Costo por llanta nueva (ej: $850.000 COP)
  newTireLifeKm: number; // Vida útil de llanta nueva (ej: 85.000 km)
  retreadCount: number; // Cantidad de reencauches permitidos (ej: 1)
  retreadPrice: number; // Costo de reencauche unitario (ej: $420.000 COP)
  retreadLifeKm: number; // Vida útil adicional por reencauche (ej: 45.000 km)
  alignmentBalancingIntervalKm: number; // Intervalo alineación y balanceo (ej: 15.000 km)
  alignmentBalancingCost: number; // Costo alineación/balanceo (ej: $140.000 COP)

  // 3. Sistema de Frenos y Embrague (Preventivo)
  brakeBandsChangeKm: number; // Intervalo cambio bandas/pastillas de freno (ej: 35.000 km)
  brakeBandsCost: number; // Costo bandas + rectificación tambores (ej: $680.000 COP)
  clutchKitKm: number; // Intervalo kit de embrague (prensa, disco, balinera) (ej: 120.000 km)
  clutchKitCost: number; // Costo embrague + mano de obra (ej: $1.450.000 COP)
  suspensionMaintenanceKm: number; // Amortiguadores, terminales, bujes (ej: 45.000 km)
  suspensionMaintenanceCost: number; // Costo suspensión y rodamientos (ej: $850.000 COP)

  // 4. Mantenimiento Correctivo / Provisión de Imprevistos en Carretera
  correctiveReservePerKm: number; // Provisión por km para mangueras, alternador, turbo, fugas (ej: $75 COP/km)

  // 5. Lavado, Engrase y Alistamiento
  washingCostPerService: number; // Costo lavado de carrocería y desinfección furgón (ej: $35.000 COP)
  washingIntervalKm: number; // Frecuencia de lavado en km (ej: cada 800 km)
  greasingChassisCost: number; // Engrase de crucetas, cardán, chasis (ej: $30.000 COP)
  greasingIntervalKm: number; // Frecuencia engrase en km (ej: cada 2.500 km)

  // 6. Costos Fijos Documentales y Operativos
  soatAnnual: number; // SOAT anual obligatorio (ej: $1.450.000 COP)
  rtmAnnual: number; // Revisión Técnico-Mecánica (ej: $420.000 COP)
  insuranceAnnual: number; // Póliza todo riesgo / RCE y RCC (ej: $4.500.000 COP)
  taxesAnnual: number; // Impuesto vehicular anual (ej: $1.200.000 COP)
  gpsMonthly: number; // Telemetría satelital GPS mensual (ej: $85.000 COP)
  parkingMonthly: number; // Parqueadero mensual (ej: $250.000 COP)
  adminMonthly: number; // Administración y habilitación de empresa (ej: $350.000 COP)
}

export type VehicleCategoryType = 'NPR' | 'NLR' | 'NKR' | 'NHR' | 'C2_LIVIANO' | 'C2_PESADO' | 'FURGON_URBANO';

export interface VehicleProfile {
  id: string;
  name: string;
  category: VehicleCategoryType;
  description: string;
  payloadTons: number;
  fuelType: 'ACPM' | 'GASOLINA';
  kmPerGallon: number;
  fuelPricePerGallon: number; // COP por galón (ej. ACPM $10.800)
  
  // Costos por kilómetro (Mantenimiento y Desgaste)
  oilCostPerKm: number; // Aceite motor + filtros prorrateado por km
  tiresCostPerKm: number; // Desgaste juego de llantas por km
  preventiveMaintenancePerKm: number; // Frenos, suspensión, embrague, filtros por km
  correctiveMaintenancePerKm: number; // Fondo de imprevistos correctivos por km
  washingAndGreasingPerKm: number; // Lavado, engrase, alistamiento por km
  totalMaintenancePerKm: number; // Suma de todos los mantenimientos por km
  
  // Costos Fijos Diarios Prorrateados
  dailyFixedCost: number; // SOAT, RTM, Seguros contractuales/extracontractuales, impuestos, depreciación
  vehicleValue: number; // Valor comercial para cálculo de depreciación

  // Configuración técnica editable detallada
  maintenanceConfig?: VehicleMaintenanceConfig;
}

export interface LaborConfig {
  smmlv: number; // Salario mínimo legal vigente (ej: 1,750,905 COP)
  auxilioTransporteLegal: number; // Auxilio de transporte mensual legal (ej: 249,095 COP)
  
  // Tarifas Horarias Oficiales SCJ
  hourlyOrdinaryRate: number; // Hora ordinaria ($8.000 COP)
  hourlyOvertimeDayRate: number; // Hora extra diurna ($17.488 COP)
  hourlyOvertimeNightRate: number; // Hora extra nocturna ($23.000 COP)
  
  // Conductor
  driverSalary: number; // Salario básico mensual conductor
  driverOvertimeAllowed: boolean;
  
  // Auxiliar
  hasHelper: boolean;
  helperSalary: number; // Salario básico mensual auxiliar
  helperHourlyOrdinaryRate?: number; // Hora ordinaria auxiliar (ej: $7.295 o $8.000 COP)
  helperOvertimeDayRate?: number; // Hora extra diurna auxiliar
  helperOvertimeNightRate?: number; // Hora extra nocturna auxiliar
  arlRiskLevelRateHelper?: number; // Tasa ARL auxiliar (ej: 2.436% o 4.35%)
  
  // Jornada y Turno Fijo
  standardHoursPerDay: number; // 8 horas legales
  monthlyWorkingHours: number; // 210 horas / mes base legal Ley 2101 (42h semanales)
  fixedShiftStartTime?: string; // Hora fija de entrada (ej: "06:00")
  fixedShiftEndTime?: string; // Hora fija de salida (ej: "14:00")
  
  // Recargos Horas Extras y Franjas CST (Código Sustantivo del Trabajo)
  dayOvertimeSurcharge: number; // 25% (0.25)
  nightOvertimeSurcharge: number; // 75% (0.75)
  nightSurchargeRate?: number; // Recargo nocturno ordinario: 35% (0.35)
  sundayHolidaySurchargeRate?: number; // Recargo dominical / festivo ordinario: 75% (0.75)
  holidayOvertimeDaySurchargeRate?: number; // Hora extra festiva diurna: 100% (Factor 2.00)
  holidayOvertimeNightSurchargeRate?: number; // Hora extra festiva nocturna: 150% (Factor 2.50)
  
  // Tarifas Horarias Específicas Conductor
  hourlyNightRate?: number; // Hora nocturna ordinaria (+35%)
  hourlyHolidayRate?: number; // Hora festiva ordinaria (+75%)
  hourlyHolidayNightRate?: number; // Hora festiva nocturna ordinaria (+110%)
  hourlyHolidayOvertimeDayRate?: number; // Hora extra festiva diurna (Factor 2.00)
  hourlyHolidayOvertimeNightRate?: number; // Hora extra festiva nocturna (Factor 2.50)
  
  // Tarifas Horarias Específicas Auxiliar
  helperHourlyNightRate?: number;
  helperHourlyHolidayRate?: number;
  helperHourlyHolidayNightRate?: number;
  helperHourlyHolidayOvertimeDayRate?: number;
  helperHourlyHolidayOvertimeNightRate?: number;
  
  // Viáticos y Pernoctación para rutas largas (>16h)
  dailyViaticosPerPerson: number; // Alimentación y pernoctación diaria (ej: $75,000 COP)
  viaticosHourThreshold: number; // A partir de cuántas horas se activa viático (ej: 16 horas)
  
  // Factor Prestacional y Parafiscales (% sobre devengado)
  primaServiciosRate: number; // 8.33%
  cesantiasRate: number; // 8.33%
  interesesCesantiasRate: number; // 1.00%
  vacacionesRate: number; // 4.17%
  
  // Seguridad Social Empleador
  pensionRate: number; // 12.0%
  saludRate: number; // 8.5%
  arlRiskLevelRate: number; // 4.35% (Riesgo IV - Transporte de carga)
  
  // Parafiscales
  cajaCompensacionRate: number; // 4.0%
  senaRate: number; // 2.0%
  icbfRate: number; // 3.0%
  
  // Beneficio Tributario Ley 1607 / Art 114-1 E.T. (Exoneración Salud, SENA, ICBF)
  isTaxExemptLey1607: boolean;
  
  // Dotación mensual estimada por trabajador
  monthlyDotacionPerPerson: number; // Ej: $75,000 COP/mes
}

export interface RouteVehicleComparison {
  vehicleCategory: 'NPR' | 'NLR';
  freightTariff: number;
  tollCost: number;
  fuelCost: number;
  fuelGallons: number;
  maintenanceCost: number;
  laborCost: number;
  fixedCost: number;
  totalCost: number;
  netProfitCOP: number;
  profitMarginPct: number;
  expensePct: number;
  isMoreProfitable: boolean;
}

export interface RouteCostBreakdown {
  route: DeliveryRoute;
  vehicle: VehicleProfile;
  totalHours: number; // transit + loading/60
  regularHours: number; // hasta 8 horas
  overtimeHours: number; // exceso de 8 horas
  overtimeDayHours: number;
  overtimeNightHours: number;
  viaticosDays: number;
  
  // Costos de Personal Desglosados
  driverCost: {
    baseSalaryForTrip: number;
    auxilioTransporte: number;
    overtimePay: number;
    viaticos: number;
    prestaciones: number;
    seguridadSocial: number;
    parafiscales: number;
    dotacion: number;
    total: number;
  };
  
  helperCost: {
    baseSalaryForTrip: number;
    auxilioTransporte: number;
    overtimePay: number;
    viaticos: number;
    prestaciones: number;
    seguridadSocial: number;
    parafiscales: number;
    dotacion: number;
    total: number;
  };
  
  totalLaborCost: number;
  
  // Costos Variables de Vehículo y Mantenimiento
  fuelGallons: number;
  fuelCost: number;
  oilCost: number;
  tiresCost: number;
  preventiveMaintenanceCost: number;
  correctiveMaintenanceCost: number;
  washingCost: number;
  totalMaintenanceCost: number; // Suma de aceite + llantas + preventivo + correctivo + lavado
  totalVehicleVariableCost: number; // combustible + totalMaintenanceCost
  
  // Peajes, Viáticos y Adicionales
  tollCost: number;
  viaticosCost: number;
  additionalExpensesCost: number;
  
  // Costos Fijos Prorrateados
  proratedFixedCost: number;
  
  // Totales de la Ruta
  totalTripCost: number;
  costPerKm: number;
  costPerHour: number;
  costPerStore: number;
  
  // Métricas Financieras y Presupuesto SCJ
  freightTariff: number; // Tarifa o flete presupuestado cliente para este vehículo
  expensePercentage: number; // % GASTO (Costo Total / Flete * 100)
  profitPercentage: number; // % GANANCIA ((Flete - Costo Total) / Flete * 100)
  netProfitCOP: number; // Utilidad neta (Flete - Costo Total)
  
  // Comparativa instantánea NPR vs NLR
  nprComparison?: RouteVehicleComparison;
  nlrComparison?: RouteVehicleComparison;

  // Rentabilidad sugerida (con margen objetivo, ej: 20%)
  suggestedFreightTariff: (marginPercentage: number) => number;
}

export interface FleetVehicleUnit {
  id: string;
  plate: string;
  name: string;
  vehicleProfileId: string;
  modelYear?: number;
  vehicleType: 'NPR' | 'NLR' | 'NKR' | 'NHR' | 'SENCILLO';
  driverName: string;
  helperName?: string;
  assignedRouteId?: string;
  status: 'DISPONIBLE' | 'EN_RUTA' | 'MANTENIMIENTO';
  tecnoStatus?: 'VIGENTE' | 'POR_VENCER' | 'VENCIDO';
  soatStatus?: 'VIGENTE' | 'POR_VENCER' | 'VENCIDO';
}

export interface TripIncidentalItem {
  id: string;
  concept: string; // Tipo de gasto: "Despinche", "Báscula", "Bono", "Parqueadero", "Cargue", etc.
  amountCOP: number; // Valor en COP
}

export interface TripDispatch {
  id: string; // ej: DESP-001
  manifestNumber: string; // ej: MAN-2026-042
  createdAt: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  returnDate?: string;
  returnTime?: string;
  status: 'PROGRAMADO' | 'EN_TRANSITO' | 'RETORNADO' | 'LIQUIDADO';
  period?: string; // YYYY-MM - Período de cierre mensual (ej: "2026-01")
  laborConfigSnapshot?: LaborConfig; // Snapshot de precios al momento de crear el despacho

  // Vehículo y Tripulación
  vehicleId: string;
  vehiclePlate: string;
  vehicleName: string;
  driverName: string;
  driverDocument?: string;
  helpersCount: number;
  helperNames?: string;

  // Ruta y Carga
  routeId: string;
  routeName: string;
  storesCount: number;
  cargoDescription?: string;

  // Presupuesto Teórico Base (Calculado a partir de las tablas maestras)
  plannedKm: number;
  plannedHours: number;
  plannedFuelCOP: number;
  plannedTollCOP: number;
  plannedLaborCOP: number;
  plannedMaintenanceCOP: number;
  plannedFixedCOP: number;
  plannedTotalCostCOP: number;

  // Control de Salida
  departureOdometer: number; // Km Odómetro inicial al salir del CEDI
  advancePaymentCOP: number; // Anticipo en dinero entregado al conductor para gastos de ruta

  // Control de Entrada (Al regresar al CEDI)
  arrivalOdometer?: number; // Km Odómetro final al entrar al CEDI
  actualKm?: number; // Odómetro llegada - Odómetro salida
  actualFuelGallons?: number; // Galones de ACPM tanqueados reales
  actualFuelPricePerGallon?: number;
  actualFuelCostCOP?: number; // Total pagado en combustible
  actualTollCount?: number;
  actualTollCostCOP?: number; // Total pagado en peajes
  actualHoursWorked?: number; // Horas reales de viaje + descargue
  actualOvertimeHours?: number; // Horas extras reales
  actualPerDiemCOP?: number; // Viáticos de alimentación y pernoctada reales
  actualIncidentalCOP?: number; // Total gastos menores (despinche, parqueadero, lavado, engrase, bonos)
  actualIncidentalsList?: TripIncidentalItem[]; // Lista detallada de imprevistos y bonos con concepto y valor
  incidentalNotes?: string;

  // Liquidación Real Calculada
  plannedFreightCOP?: number; // Flete facturado de la ruta (ingreso)
  actualLaborCostCOP?: number;
  actualMaintenanceCostCOP?: number;
  actualFixedCostCOP?: number;
  actualTotalCostCOP?: number;
  actualNetProfitCOP?: number; // plannedFreightCOP - actualTotalCostCOP (Ganancia neta real)
  actualMarginPct?: number; // (actualNetProfitCOP / plannedFreightCOP) * 100
  isHolidayTrip?: boolean; // Si salió en domingo o festivo nacional
  holidayName?: string; // Nombre del día festivo si aplica
  costVarianceCOP?: number; // actualTotalCost - plannedTotalCost (Negativo: Ahorro, Positivo: Sobrecosto)
  driverBalanceCOP?: number; // advancePayment - (combustible + peajes + viaticos + imprevistos)
  settledAt?: string;
  syncedAt?: string;
  notes?: string;
}
