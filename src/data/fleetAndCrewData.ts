import { TripDispatch, FleetVehicleUnit } from '../types/logistics';

export interface FleetVehicleResource {
  plate: string;
  name: string;
  vehicleProfileId: string;
  vehicleType: 'NPR' | 'NLR' | 'NKR' | 'NHR' | 'SENCILLO';
  modelYear?: number;
  capacityTons: number;
  fuelEfficiencyKmPerGal?: number;
  maintenanceCostPerKm?: number;
  assignedDriverName?: string;
  tecnoStatus?: 'VIGENTE' | 'POR_VENCER' | 'VENCIDO';
  soatStatus?: 'VIGENTE' | 'POR_VENCER' | 'VENCIDO';
  soatExpiry?: string;
  rtmExpiry?: string;
}

export interface CrewMemberResource {
  id: string;
  name: string;
  document: string;
  role: 'POLIFUNCIONAL' | 'AUXILIAR' | 'CONDUCTOR' | 'COORDINADOR' | string;
  phone?: string;
  monthlyBaseSalary?: number;
  hourlyOrdinaryRate?: number;
  hourlyOvertimeDayRate?: number;
  hourlyOvertimeNightRate?: number;
  status?: 'ACTIVO' | 'INACTIVO' | 'VACACIONES';
}

export interface AdditionalExpenseConcept {
  id: string;
  tipo: string;
  descripcion: string;
  valorSugerido: number;
  unidad: string;
}

/**
 * Plantilla Vehicular Oficial de la Flota SCJ Colombia
 * Fuente: Hoja "PLANTILLA VEHICULAR" de SCJ PRESUPUESTO REALIZAR.xlsx
 * Incluye los 9 vehículos operativos, tipo de carrocería, modelo y capacidades.
 */
export const COMPANY_FLEET_VEHICLES: FleetVehicleResource[] = [
  {
    plate: 'GTX052',
    name: 'MAXIMO (NPR Turbo)',
    vehicleProfileId: 'npr-c2-turbo',
    vehicleType: 'NPR',
    capacityTons: 4.5,
    tecnoStatus: 'VIGENTE',
    soatStatus: 'VIGENTE'
  },
  {
    plate: 'ESQ742',
    name: 'MARCO POLO (NPR Turbo 2022)',
    vehicleProfileId: 'npr-c2-turbo',
    vehicleType: 'NPR',
    modelYear: 2022,
    capacityTons: 4.8,
    tecnoStatus: 'VIGENTE',
    soatStatus: 'VIGENTE'
  },
  {
    plate: 'ESQ294',
    name: 'GOLIAT (NPR Turbo 2019)',
    vehicleProfileId: 'npr-c2-turbo',
    vehicleType: 'NPR',
    modelYear: 2019,
    capacityTons: 4.5,
    tecnoStatus: 'VIGENTE',
    soatStatus: 'VIGENTE'
  },
  {
    plate: 'JYY249',
    name: 'ZEUSS (NPR Liviano)',
    vehicleProfileId: 'npr-c2-turbo',
    vehicleType: 'NPR',
    capacityTons: 3.8,
    tecnoStatus: 'VIGENTE',
    soatStatus: 'VIGENTE'
  },
  {
    plate: 'PUN774',
    name: 'ORION (NLR Liviano)',
    vehicleProfileId: 'nlr-camioneta',
    vehicleType: 'NLR',
    capacityTons: 3.0,
    tecnoStatus: 'VIGENTE',
    soatStatus: 'VIGENTE'
  },
  {
    plate: 'PUN276',
    name: 'FENIX (NLR Liviano)',
    vehicleProfileId: 'nlr-camioneta',
    vehicleType: 'NLR',
    capacityTons: 3.0,
    tecnoStatus: 'VIGENTE',
    soatStatus: 'VIGENTE'
  },
  {
    plate: 'LKN995',
    name: 'PERSEO (NLR Liviano)',
    vehicleProfileId: 'nlr-camioneta',
    vehicleType: 'NLR',
    capacityTons: 3.0,
    tecnoStatus: 'VIGENTE',
    soatStatus: 'VIGENTE'
  },
  {
    plate: 'JYX457',
    name: 'TITAN (NLR Liviano 2022)',
    vehicleProfileId: 'nlr-camioneta',
    vehicleType: 'NLR',
    modelYear: 2022,
    capacityTons: 2.2,
    tecnoStatus: 'VIGENTE',
    soatStatus: 'VIGENTE'
  },
  {
    plate: 'NNM737',
    name: 'HERMES (NLR Liviano)',
    vehicleProfileId: 'nlr-camioneta',
    vehicleType: 'NLR',
    capacityTons: 3.0,
    tecnoStatus: 'VIGENTE',
    soatStatus: 'VIGENTE'
  }
];

/**
 * Nómina Oficial de Tripulaciones y Operadores SCJ
 * Fuente: Hoja "NOMINA SCJ" de SCJ PRESUPUESTO REALIZAR.xlsx
 * Incluye colaboradores polifuncionales (conductores-operadores) y auxiliares con sus documentos.
 */
export const COMPANY_DRIVERS: CrewMemberResource[] = [
  { id: 'SCJ-P01', name: 'Jose Ibañez', document: '1.129.517.122', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P02', name: 'Yuther Ospina', document: '1.036.631.581', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P03', name: 'Manuel Andrés Giraldo', document: '1.036.668.352', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P04', name: 'Juan Manuel Atehortua', document: '1.037.612.441', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P05', name: 'Yadir Correa', document: '1.036.985.120', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P06', name: 'Julian Jimenez', document: '1.015.278.100', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P07', name: 'Estiben Mora', document: '1.022.144.668', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P08', name: 'Guillermo Padilla', document: '1.017.229.262', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P09', name: 'Yorman Gómez', document: '1.035.774.891', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P10', name: 'Juan David Correa', document: '1.038.798.490', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P11', name: 'Gabriel Ramirez', document: '1.042.444.913', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P12', name: 'Jose Miguel Restrepo', document: '1.022.142.762', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P13', name: 'Wilder Monsalve', document: '1.020.455.981', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P14', name: 'Fredy Castañeda', document: '71.398.245', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P15', name: 'Leiderson Zapata', document: '1.038.411.230', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-P16', name: 'Duver Arango', document: '1.017.654.321', role: 'POLIFUNCIONAL' }
];

export const COMPANY_HELPERS: CrewMemberResource[] = [
  { id: 'SCJ-A01', name: 'Jair Gamboa', document: '1.128.725.334', role: 'AUXILIAR' },
  { id: 'SCJ-A02', name: 'Brayan Pareja', document: '1.152.463.211', role: 'AUXILIAR' },
  { id: 'SCJ-A03', name: 'Wilder Monsalve', document: '1.020.455.981', role: 'POLIFUNCIONAL' },
  { id: 'SCJ-A04', name: 'Fredy Castañeda', document: '71.398.245', role: 'POLIFUNCIONAL' }
];

export const COMPANY_COORDINATORS: CrewMemberResource[] = [
  {
    id: 'SCJ-C01',
    name: 'Carlos Mario Restrepo',
    document: '71.234.890',
    role: 'COORDINADOR',
    phone: '300 456 7890',
    monthlyBaseSalary: 2600000,
    hourlyOrdinaryRate: 11818,
    hourlyOvertimeDayRate: 14773,
    hourlyOvertimeNightRate: 20682,
    status: 'ACTIVO'
  }
];

export interface InTransitResourceStatus {
  isInTransit: boolean;
  activeDispatchId?: string;
  manifestNumber?: string;
  routeName?: string;
  departureTime?: string;
}

// Obtener estado de un vehículo según despachos activos
export function getVehicleTransitStatus(plate: string, dispatches: TripDispatch[]): InTransitResourceStatus {
  if (!plate) return { isInTransit: false };
  const cleanPlate = plate.trim().toUpperCase();
  const activeDispatch = dispatches.find(d =>
    (d.status === 'EN_TRANSITO' || d.status === 'PROGRAMADO') &&
    d.vehiclePlate.trim().toUpperCase() === cleanPlate
  );

  if (activeDispatch) {
    return {
      isInTransit: true,
      activeDispatchId: activeDispatch.id,
      manifestNumber: activeDispatch.manifestNumber,
      routeName: activeDispatch.routeName,
      departureTime: `${activeDispatch.departureDate} ${activeDispatch.departureTime}`
    };
  }
  return { isInTransit: false };
}

// Obtener estado de un conductor según despachos activos
export function getDriverTransitStatus(driverName: string, dispatches: TripDispatch[]): InTransitResourceStatus {
  if (!driverName) return { isInTransit: false };
  const cleanName = driverName.trim().toLowerCase();
  const activeDispatch = dispatches.find(d =>
    (d.status === 'EN_TRANSITO' || d.status === 'PROGRAMADO') &&
    d.driverName.trim().toLowerCase() === cleanName
  );

  if (activeDispatch) {
    return {
      isInTransit: true,
      activeDispatchId: activeDispatch.id,
      manifestNumber: activeDispatch.manifestNumber,
      routeName: activeDispatch.routeName,
      departureTime: `${activeDispatch.departureDate} ${activeDispatch.departureTime}`
    };
  }
  return { isInTransit: false };
}

// Obtener estado de un auxiliar según despachos activos
export function getHelperTransitStatus(helperName: string, dispatches: TripDispatch[]): InTransitResourceStatus {
  if (!helperName) return { isInTransit: false };
  const cleanName = helperName.trim().toLowerCase();
  const activeDispatch = dispatches.find(d =>
    (d.status === 'EN_TRANSITO' || d.status === 'PROGRAMADO') &&
    d.helperNames && d.helperNames.trim().toLowerCase().includes(cleanName)
  );

  if (activeDispatch) {
    return {
      isInTransit: true,
      activeDispatchId: activeDispatch.id,
      manifestNumber: activeDispatch.manifestNumber,
      routeName: activeDispatch.routeName,
      departureTime: `${activeDispatch.departureDate} ${activeDispatch.departureTime}`
    };
  }
  return { isInTransit: false };
}

/**
 * Catálogo Base de Gastos Adicionales y Operativos SCJ
 * Fuente: Hoja "GASTOS ADICIONALES" de SCJ PRESUPUESTO REALIZAR.xlsx
 */
export const DEFAULT_ADDITIONAL_EXPENSES: AdditionalExpenseConcept[] = [
  { id: 'GA-01', tipo: 'ENGRASE', descripcion: 'Engrase de chasis, crucetas y transmisión en carretera', valorSugerido: 35000, unidad: 'Por servicio' },
  { id: 'GA-02', tipo: 'HOTEL / PERNOCTADA', descripcion: 'Hospedaje por pernoctación en ruta lejana (Urabá, Montería, Santanderes)', valorSugerido: 70000, unidad: 'Por noche/persona' },
  { id: 'GA-03', tipo: 'ALIMENTACION', descripcion: 'Alimentación en ruta intermunicipal de más de 12 horas', valorSugerido: 30000, unidad: 'Por comida/día' },
  { id: 'GA-04', tipo: 'MONTALLANTA', descripcion: 'Despinche, parche y calibración de neumáticos en ruta', valorSugerido: 25000, unidad: 'Por servicio' },
  { id: 'GA-05', tipo: 'VIATICO EXTRA', descripcion: 'Reserva para imprevistos en vía (bloqueos, esperas prolongadas)', valorSugerido: 40000, unidad: 'Por evento' },
  { id: 'GA-06', tipo: 'DESPINCHE', descripcion: 'Reparación de pinchazo de emergencia en carretera', valorSugerido: 25000, unidad: 'Por llanta' },
  { id: 'GA-07', tipo: 'BONO DE OPERACIÓN', descripcion: 'Bono o incentivo acordado por cumplimiento de ruta especial', valorSugerido: 50000, unidad: 'Por viaje' },
  { id: 'GA-08', tipo: 'BÁSCULA / PESAJE', descripcion: 'Pesaje en báscula carretera o peaje', valorSugerido: 15000, unidad: 'Por pesaje' },
  { id: 'GA-09', tipo: 'PARQUEADERO NOCTURNO', descripcion: 'Custodia segura del vehículo y carga en pernoctada', valorSugerido: 20000, unidad: 'Por noche' }
];

// --- GESTIÓN PERSISTENTE DE PERSONAL (NÓMINA) ---
export function getCustomStaff(): CrewMemberResource[] {
  try {
    const raw = localStorage.getItem('rutacost_staff');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {}
  return COMPANY_DRIVERS.concat(COMPANY_HELPERS).concat(COMPANY_COORDINATORS).map(c => ({
    ...c,
    hourlyOrdinaryRate: c.role === 'COORDINADOR' ? 11818 : 8000,
    hourlyOvertimeDayRate: c.role === 'COORDINADOR' ? 14773 : 17488,
    hourlyOvertimeNightRate: c.role === 'COORDINADOR' ? 20682 : 23000,
    monthlyBaseSalary: c.monthlyBaseSalary || (c.role === 'COORDINADOR' ? 2600000 : 1750905),
    status: 'ACTIVO' as const
  }));
}

export function saveCustomStaff(staff: CrewMemberResource[]): void {
  localStorage.setItem('rutacost_staff', JSON.stringify(staff));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('scj_staff_updated'));
  }
}

export function resetCustomStaff(): CrewMemberResource[] {
  const defaults = COMPANY_DRIVERS.concat(COMPANY_HELPERS).concat(COMPANY_COORDINATORS).map(c => ({
    ...c,
    hourlyOrdinaryRate: c.role === 'COORDINADOR' ? 11818 : 8000,
    hourlyOvertimeDayRate: c.role === 'COORDINADOR' ? 14773 : 17488,
    hourlyOvertimeNightRate: c.role === 'COORDINADOR' ? 20682 : 23000,
    monthlyBaseSalary: c.monthlyBaseSalary || (c.role === 'COORDINADOR' ? 2600000 : 1750905),
    status: 'ACTIVO' as const
  }));
  saveCustomStaff(defaults);
  return defaults;
}

// --- GESTIÓN PERSISTENTE DE FLOTA VEHICULAR ---
export function getCustomFleet(): FleetVehicleResource[] {
  try {
    const raw = localStorage.getItem('rutacost_fleet_units');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return COMPANY_FLEET_VEHICLES.map(v => ({
    ...v,
    fuelEfficiencyKmPerGal: v.vehicleType === 'NLR' ? 31.0 : 22.5,
    maintenanceCostPerKm: v.vehicleType === 'NLR' ? 247 : 326
  }));
}

export function saveCustomFleet(fleet: FleetVehicleResource[]): void {
  localStorage.setItem('rutacost_fleet_units', JSON.stringify(fleet));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('scj_fleet_updated'));
  }
}

export function resetCustomFleet(): FleetVehicleResource[] {
  const defaults = COMPANY_FLEET_VEHICLES.map(v => ({
    ...v,
    fuelEfficiencyKmPerGal: v.vehicleType === 'NLR' ? 31.0 : 22.5,
    maintenanceCostPerKm: v.vehicleType === 'NLR' ? 247 : 326
  }));
  saveCustomFleet(defaults);
  return defaults;
}

// --- GESTIÓN PERSISTENTE DE GASTOS ADICIONALES ---
export function getCustomExpenses(): AdditionalExpenseConcept[] {
  try {
    const raw = localStorage.getItem('rutacost_additional_expenses');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_ADDITIONAL_EXPENSES;
}

export function saveCustomExpenses(expenses: AdditionalExpenseConcept[]): void {
  localStorage.setItem('rutacost_additional_expenses', JSON.stringify(expenses));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('scj_expenses_updated'));
  }
}

export function resetCustomExpenses(): AdditionalExpenseConcept[] {
  const defaults = DEFAULT_ADDITIONAL_EXPENSES;
  saveCustomExpenses(defaults);
  return defaults;
}
