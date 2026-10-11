
export function isCurrentCalendarMonth(yearMonth: string): boolean {
  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return yearMonth === currentYM;
}

export function getCurrentMonthElapsedDays(): number {
  const now = new Date();
  return Math.min(now.getDate(), 30);
}
import { CrewMemberResource } from './fleetAndCrewData';
import { LaborConfig, TripDispatch } from '../types/logistics';
import { classifyWorkHours, getStoredWorkSchedule } from './colombiaHolidays';
import { computeEmployerCharges, isLoadedOvertimeRate } from '../utils/employerCharges';

/**
 * Novedades diarias que se pueden registrar por persona y por día.
 * Las novedades laborables (con entrada/salida) generan pago; las de
 * incapacidad/vacaciones/permiso/descanso quedan solo como registro.
 */
export type DailyNoveltyType =
  | 'TRABAJO_NORMAL'
  | 'LLEGADA_TARDE'
  | 'SALIDA_TEMPRANO'
  | 'HORAS_EXTRA'
  | 'DOMINGO_TRABAJADO'
  | 'FESTIVO_TRABAJADO'
  | 'INCAPACIDAD'
  | 'VACACIONES'
  | 'PERMISO'
  | 'DESCANSO'
  | 'OTRO';

export const DAILY_NOVELTY_LABELS: Record<DailyNoveltyType, string> = {
  TRABAJO_NORMAL: 'Jornada normal',
  LLEGADA_TARDE: 'Llegada tarde',
  SALIDA_TEMPRANO: 'Salida temprano',
  HORAS_EXTRA: 'Horas extra',
  DOMINGO_TRABAJADO: 'Domingo trabajado',
  FESTIVO_TRABAJADO: 'Festivo trabajado',
  INCAPACIDAD: 'Incapacidad',
  VACACIONES: 'Vacaciones',
  PERMISO: 'Permiso',
  DESCANSO: 'Descanso',
  OTRO: 'Otra novedad'
};

/** Novedades que cuentan como día laborado (con horas de entrada y salida) */
export const WORKED_NOVELTIES: DailyNoveltyType[] = [
  'TRABAJO_NORMAL',
  'LLEGADA_TARDE',
  'SALIDA_TEMPRANO',
  'HORAS_EXTRA',
  'DOMINGO_TRABAJADO',
  'FESTIVO_TRABAJADO',
  'OTRO'
];

/**
 * Registro de asistencia de UN día para UNA persona.
 * El sistema clasifica las horas entre checkIn y checkOut según el CST
 * (ordinarias, nocturnas, extras y festivas) usando el cronograma laboral
 * y el calendario de festivos de Colombia.
 */
export interface DailyAttendanceEntry {
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm (hora de entrada real)
  checkOut?: string; // HH:mm (hora de salida real)
  noveltyType: DailyNoveltyType;
  lateMinutes?: number; // Si llegó tarde: minutos de retraso vs la hora pactada del cronograma
  earlyLeaveMinutes?: number;
  notes?: string; // Observación de la novedad para esa persona
}

export interface StaffAttendanceRecord {
  id: string; // `${yearMonth}_${memberId}`
  yearMonth: string; // 'YYYY-MM', ej: '2026-09'
  memberId: string;
  memberName: string;
  document: string;
  role: 'CONDUCTOR' | 'POLIFUNCIONAL' | 'AUXILIAR' | 'COORDINADOR' | string;
  phone?: string;
  monthlyBaseSalary: number;
  contractSchedule: string; // ej: 'Jornada 42h Semanales · Lun a Sáb'
  attendedFullMonth: boolean; // true = 30 días
  daysWorked: number; // 0 a 30
  noveltyType: 'ASISTENCIA_TOTAL' | 'INCAPACIDAD' | 'VACACIONES' | 'PERMISO' | 'OTRO';
  notes?: string;
  /** Calendario diario del mes: días trabajados con entrada/salida y novedades */
  dailyEntries?: DailyAttendanceEntry[];
}

/** Detalle de horas clasificadas CST calculadas desde el calendario diario */
export interface StaffHoursDetail {
  // Horas por categoría CST (sumadas de todos los días registrados)
  hodHours: number; // Ordinaria diurna
  honHours: number; // Ordinaria nocturna (+35%)
  hedHours: number; // Extra diurna (+25%)
  henHours: number; // Extra nocturna (+75%)
  hdfHours: number; // Dominical/festivo ordinario (+75%)
  hdfnHours: number; // Dominical/festivo nocturno (+110%)
  hefdHours: number; // Extra festiva diurna (200%)
  hefnHours: number; // Extra festiva nocturna (250%)
  totalHours: number;

  // Pagos en COP
  nightSurchargeCOP: number; // Incremento +35% de horas nocturnas ordinarias
  holidaySurchargeCOP: number; // Incremento +75% de dominicales/festivos ordinarios
  holidayNightSurchargeCOP: number; // Incremento +110% de festivos nocturnos ordinarios
  extrasCOP: number; // Horas extras completas a tarifas de la base de datos
  extrasAreLoaded: boolean; // true si las tarifas de extras ya traen factor prestacional

  // Novedades del mes registradas en la persona
  lateMinutesTotal: number;
  novedades: {
    date: string;
    noveltyType: DailyNoveltyType;
    lateMinutes?: number;
    notes?: string;
  }[];
}

export interface StaffMonthlyCostBreakdown {
  memberId: string;
  memberName: string;
  document: string;
  role: string;
  monthlyBaseSalary: number;
  contractSchedule: string;
  daysWorked: number;
  attendedFullMonth: boolean;
  noveltyType: string;
  notes?: string;
  
  // Devengado
  baseDevengado: number;
  auxilioTransporte: number;
  totalDevengado: number;

  // Prestaciones Sociales (CST)
  cesantias: number;
  interesesCesantias: number;
  primaServicios: number;
  vacaciones: number;
  totalPrestaciones: number;

  // Seguridad Social Empleador
  pension: number;
  salud: number;
  arl: number;
  arlRate: number;
  totalSeguridadSocial: number;

  // Parafiscales Empleador
  cajaCompensacion: number;
  sena: number;
  icbf: number;
  totalParafiscales: number;

  // Dotación
  dotacion: number;

  // Total Costo Empresa
  totalEmployerMonthlyCost: number;
  effectiveDailyCost: number;
  
  // Operación en Carretera
  tripsCompleted: number;

  // Detalle de horas CST (solo cuando hay calendario diario registrado)
  hoursDetail?: StaffHoursDetail;
}

const STORAGE_KEY = 'rutacost_monthly_attendance_v1';

/**
 * Obtiene el salario base pactado según rol o configuración
 */
export function getMemberDefaultBaseSalary(member: CrewMemberResource, laborConfig: LaborConfig): number {
  if (member.monthlyBaseSalary && member.monthlyBaseSalary > 0) {
    return member.monthlyBaseSalary;
  }
  const cleanRole = (member.role || '').toUpperCase();
  if (cleanRole === 'COORDINADOR') {
    return 2600000; // Salario estándar de Coordinador de Despacho y Logística
  }
  if (cleanRole === 'AUXILIAR') {
    return laborConfig.helperSalary || laborConfig.smmlv || 1750905;
  }
  // Conductor / Polifuncional
  return laborConfig.driverSalary || laborConfig.smmlv || 1750905;
}

/**
 * Tarifas horarias por persona según la base de datos de la empresa:
 * - Respeta las tarifas específicas del miembro (hourlyOrdinaryRate, etc.).
 * - Si el miembro no tiene tarifas propias, usa las del rol (conductor o auxiliar)
 *   de la configuración laboral (matriz SCJ).
 * - Para salario personalizado, escala las tarifas de recargo proporcionalmente.
 */
export interface MemberHourlyRates {
  ordinary: number;
  nightOrdinary: number; // HON 135%
  holidayOrdinary: number; // HDF 175%
  holidayNightOrdinary: number; // HDFN 210%
  dayExt: number; // HED
  nightExt: number; // HEN
  holidayDayExt: number; // HEFD 200%
  holidayNightExt: number; // HEFN 250%
  nightSurcharge: number; // 0.35
  sundaySurcharge: number; // 0.75
}

export function getMemberHourlyRates(
  member: {
    role?: string;
    monthlyBaseSalary?: number;
    hourlyOrdinaryRate?: number;
    hourlyOvertimeDayRate?: number;
    hourlyOvertimeNightRate?: number;
  },
  laborConfig: LaborConfig
): MemberHourlyRates {
  const cleanRole = (member.role || '').toUpperCase();
  const isHelper = cleanRole === 'AUXILIAR';
  const isDriver = cleanRole === 'CONDUCTOR' || cleanRole === 'POLIFUNCIONAL';

  const nightSurcharge = laborConfig.nightSurchargeRate ?? 0.35;
  const sundaySurcharge = laborConfig.sundayHolidaySurchargeRate ?? 0.75;
  const dayExtSurcharge = laborConfig.dayOvertimeSurcharge ?? 0.25;
  const nightExtSurcharge = laborConfig.nightOvertimeSurcharge ?? 0.75;

  // Hora ordinaria de referencia del rol según la BD
  const roleOrdinary = isHelper
    ? (laborConfig.helperHourlyOrdinaryRate || (laborConfig.helperSalary || laborConfig.smmlv || 1750905) / (laborConfig.monthlyWorkingHours || 210))
    : (laborConfig.hourlyOrdinaryRate || 8000);

  // Hora ordinaria efectiva de la persona (tarifa propia o derivada del salario)
  const ordinary = member.hourlyOrdinaryRate
    || (isDriver || isHelper
      ? roleOrdinary
      : ((member.monthlyBaseSalary || laborConfig.smmlv || 1750905) / (laborConfig.monthlyWorkingHours || 210)));
  const scale = roleOrdinary > 0 ? ordinary / roleOrdinary : 1;

  // Tarifas de recargo de la BD (escaladas si la persona tiene tarifa propia)
  const dbNight = isHelper ? laborConfig.helperHourlyNightRate : laborConfig.hourlyNightRate;
  const dbHoliday = isHelper ? laborConfig.helperHourlyHolidayRate : laborConfig.hourlyHolidayRate;
  const dbHolidayNight = isHelper ? laborConfig.helperHourlyHolidayNightRate : laborConfig.hourlyHolidayNightRate;

  const dayExt = member.hourlyOvertimeDayRate
    || (isHelper ? laborConfig.helperOvertimeDayRate : laborConfig.hourlyOvertimeDayRate)
    || ordinary * (1 + dayExtSurcharge);
  const nightExt = member.hourlyOvertimeNightRate
    || (isHelper ? laborConfig.helperOvertimeNightRate : laborConfig.hourlyOvertimeNightRate)
    || ordinary * (1 + nightExtSurcharge);
  const holidayDayExt = (isHelper ? laborConfig.helperHourlyHolidayOvertimeDayRate : laborConfig.hourlyHolidayOvertimeDayRate)
    || ordinary * 2.0;
  const holidayNightExt = (isHelper ? laborConfig.helperHourlyHolidayOvertimeNightRate : laborConfig.hourlyHolidayOvertimeNightRate)
    || ordinary * 2.5;

  return {
    ordinary,
    nightOrdinary: dbNight ? dbNight * scale : ordinary * (1 + nightSurcharge),
    holidayOrdinary: dbHoliday ? dbHoliday * scale : ordinary * (1 + sundaySurcharge),
    holidayNightOrdinary: dbHolidayNight ? dbHolidayNight * scale : ordinary * (1 + sundaySurcharge + nightSurcharge),
    dayExt,
    nightExt,
    holidayDayExt,
    holidayNightExt,
    nightSurcharge,
    sundaySurcharge
  };
}

/**
 * Tasa ARL según el rol (Riesgo IV carga 4.35%, Riesgo III auxiliar, II coordinación)
 */
function getArlRateForRole(role: string, laborConfig: LaborConfig): number {
  const cleanRole = (role || '').toUpperCase();
  if (cleanRole === 'AUXILIAR') {
    return laborConfig.arlRiskLevelRateHelper || 0.02436;
  }
  if (cleanRole === 'COORDINADOR') {
    return 0.01044; // Riesgo II Coordinación y Supervisión en Centro Logístico / Patio
  }
  return laborConfig.arlRiskLevelRate || 0.0435;
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/**
 * Calcula el desglose detallado de costo mensual patronal según el CST de Colombia.
 *
 * Si la persona tiene calendario diario registrado (dailyEntries con entrada y
 * salida), el cálculo es exacto: se clasifica cada día según el CST (ordinarias
 * diurnas/nocturnas, extras y festivas) usando el cronograma y el calendario de
 * festivos, y se pagan los recargos y extras correspondientes según las tarifas
 * de la base de datos.
 *
 * Si no hay calendario diario, se usa la estimación proporcional por días.
 */
export function calculateStaffMonthlyEmployerCost(
  record: StaffAttendanceRecord,
  laborConfig: LaborConfig,
  tripsCount: number = 0
): StaffMonthlyCostBreakdown {
  const dailyEntries = (record.dailyEntries || []).filter(e => e && e.date);
  const workedEntries = dailyEntries.filter(
    e => WORKED_NOVELTIES.includes(e.noveltyType) && e.checkIn && e.checkOut
  );

  // ===== MODO CALENDARIO DIARIO (exacto por horas CST) =====
  if (workedEntries.length > 0) {
    return calculateMonthlyCostFromDailyEntries(
      record,
      laborConfig,
      workedEntries,
      dailyEntries,
      tripsCount
    );
  }

  // ===== MODO SIMPLE: estimación proporcional por días =====
  const days = Math.max(0, Math.min(30, Number(record.daysWorked) || 0));
  const baseSalary = Number(record.monthlyBaseSalary) || 1750905;
  const smmlv = laborConfig.smmlv || 1750905;
  const auxLegal = laborConfig.auxilioTransporteLegal || 249095;

  // 1. Sueldo Devengado
  const baseDevengado = Math.round((baseSalary / 30) * days);

  // 2. Auxilio de Transporte (si el salario mensual base no supera 2 SMMLV)
  const getsAuxilio = baseSalary <= (smmlv * 2);
  const auxilioTransporte = getsAuxilio ? Math.round((auxLegal / 30) * days) : 0;
  const totalDevengado = baseDevengado + auxilioTransporte;

  // 3. Cargos patronales con bases legales correctas:
  // - Cesantías e intereses: base salarial SIN auxilio (Art. 307 CST)
  // - Prima: incluye el auxilio de transporte (práctica legal ≤ 2 SMMLV)
  // - Vacaciones: base salarial sin auxilio
  const arlRate = getArlRateForRole(record.role, laborConfig);
  const charges = computeEmployerCharges({
    salariedBase: baseDevengado,
    auxilioTransporte,
    monthlySalary: baseSalary,
    arlRate,
    labor: laborConfig,
    proratedDays: days,
    applyDotacion: true
  });

  const totalEmployerMonthlyCost =
    baseDevengado + auxilioTransporte + charges.totalPrestaciones +
    charges.totalSeguridadSocial + charges.totalParafiscales + charges.dotacion;
  const effectiveDailyCost = days > 0 ? Math.round(totalEmployerMonthlyCost / days) : 0;

  return {
    memberId: record.memberId,
    memberName: record.memberName,
    document: record.document,
    role: record.role,
    monthlyBaseSalary: baseSalary,
    contractSchedule: record.contractSchedule,
    daysWorked: days,
    attendedFullMonth: record.attendedFullMonth,
    noveltyType: record.noveltyType,
    notes: record.notes,
    baseDevengado,
    auxilioTransporte,
    totalDevengado,
    cesantias: charges.cesantias,
    interesesCesantias: charges.interesesCesantias,
    primaServicios: charges.primaServicios,
    vacaciones: charges.vacaciones,
    totalPrestaciones: charges.totalPrestaciones,
    pension: charges.pension,
    salud: charges.salud,
    arl: charges.arl,
    arlRate,
    totalSeguridadSocial: charges.totalSeguridadSocial,
    cajaCompensacion: charges.cajaCompensacion,
    sena: charges.sena,
    icbf: charges.icbf,
    totalParafiscales: charges.totalParafiscales,
    dotacion: charges.dotacion,
    totalEmployerMonthlyCost,
    effectiveDailyCost,
    tripsCompleted: tripsCount
  };
}

/**
 * Cálculo exacto del costo mensual patronal a partir del calendario diario
 * de la persona (días con entrada y salida registradas).
 *
 * Metodología de nómina colombiana:
 * - Sueldo proporcional: (salario / 30) × días trabajados (paga el 100% de la
 *   jornada ordinaria de cada día).
 * - Recargos salariales (incrementos sobre la hora ordinaria, ya que el 100%
 *   está en el sueldo): nocturno +35%, dominical/festivo +75%, festivo
 *   nocturno +110%.
 * - Horas extras: se pagan COMPLETAS además del sueldo, con las tarifas de la
 *   base de datos (si la tarifa trae factor prestacional, no se le suman
 *   cargos patronales encima para evitar doble conteo).
 * - Aunque el día sea domingo o festivo (normalmente de descanso), si la
 *   persona trabajó, se liquida con el recargo dominical correcto; solo el
 *   excedente de 8h es extra festiva.
 */
function calculateMonthlyCostFromDailyEntries(
  record: StaffAttendanceRecord,
  laborConfig: LaborConfig,
  workedEntries: DailyAttendanceEntry[],
  allEntries: DailyAttendanceEntry[],
  tripsCount: number
): StaffMonthlyCostBreakdown {
  const smmlv = laborConfig.smmlv || 1750905;
  const auxLegal = laborConfig.auxilioTransporteLegal || 249095;
  const baseSalary = Number(record.monthlyBaseSalary) || 1750905;
  const schedule = getStoredWorkSchedule();
  const rates = getMemberHourlyRates(record, laborConfig);

  // Días trabajados = días con entrada y salida registradas
  const days = workedEntries.length;
  const baseDevengado = Math.round((baseSalary / 30) * days);

  // Clasificar las horas de cada día registrado según el CST
  let hod = 0, hon = 0, hed = 0, hen = 0, hdf = 0, hdfn = 0, hefd = 0, hefn = 0;
  for (const e of workedEntries) {
    // Jornada que cruza medianoche: la salida se registra como hora del día siguiente
    const crossesMidnight = timeToMinutes(e.checkOut!) <= timeToMinutes(e.checkIn!);
    const endDate = crossesMidnight ? nextDayDate(e.date) : e.date;
    const cls = classifyWorkHours(e.date, e.checkIn!, endDate, e.checkOut!, schedule);
    hod += cls.regularHours;
    hon += cls.nightRegularHours;
    hed += cls.daytimeOvertimeHours;
    hen += cls.nighttimeOvertimeHours;
    hdf += cls.sundayHolidayRegularHours;
    hdfn += cls.sundayHolidayNightHours;
    hefd += cls.sundayHolidayDayOvertimeHours;
    hefn += cls.sundayHolidayNightOvertimeHours;
  }
  hod = r1(hod); hon = r1(hon); hed = r1(hed); hen = r1(hen);
  hdf = r1(hdf); hdfn = r1(hdfn); hefd = r1(hefd); hefn = r1(hefn);
  const totalHours = r1(hod + hon + hed + hen + hdf + hdfn + hefd + hefn);

  // Recargos salariales: SOLO el incremento sobre la hora ordinaria
  // (el 100% de la jornada ordinaria ya está pagado en el sueldo proporcional)
  const nightSurchargeCOP = Math.round(hon * rates.ordinary * rates.nightSurcharge);
  const holidaySurchargeCOP = Math.round(hdf * rates.ordinary * rates.sundaySurcharge);
  const holidayNightSurchargeCOP = Math.round(hdfn * rates.ordinary * (rates.sundaySurcharge + rates.nightSurcharge));
  const surchargesCOP = nightSurchargeCOP + holidaySurchargeCOP + holidayNightSurchargeCOP;

  // Horas extras: pago completo adicional al sueldo, con tarifas de la BD
  const extrasCOP = Math.round(
    (hed * rates.dayExt) +
    (hen * rates.nightExt) +
    (hefd * rates.holidayDayExt) +
    (hefn * rates.holidayNightExt)
  );
  const extrasAreLoaded =
    isLoadedOvertimeRate(rates.dayExt, rates.ordinary, laborConfig.dayOvertimeSurcharge ?? 0.25) ||
    isLoadedOvertimeRate(rates.nightExt, rates.ordinary, laborConfig.nightOvertimeSurcharge ?? 0.75);

  // Auxilio de transporte (≤ 2 SMMLV), proporcional a los días trabajados
  const getsAuxilio = baseSalary <= (smmlv * 2);
  const auxilioTransporte = getsAuxilio ? Math.round((auxLegal / 30) * days) : 0;

  // Cargos patronales sobre la base salarial
  const arlRate = getArlRateForRole(record.role, laborConfig);
  const salariedBase = baseDevengado + surchargesCOP + (extrasAreLoaded ? 0 : extrasCOP);
  const charges = computeEmployerCharges({
    salariedBase,
    auxilioTransporte,
    monthlySalary: baseSalary,
    arlRate,
    labor: laborConfig,
    proratedDays: days,
    applyDotacion: true
  });

  const totalDevengado = baseDevengado + surchargesCOP + extrasCOP + auxilioTransporte;
  const totalEmployerMonthlyCost = totalDevengado + charges.totalCharges;
  const effectiveDailyCost = days > 0 ? Math.round(totalEmployerMonthlyCost / days) : 0;

  // Novedades registradas de la persona en el mes (llegadas tarde, etc.)
  const novedades = allEntries
    .filter(e => e.noveltyType !== 'TRABAJO_NORMAL' && e.noveltyType !== 'DESCANSO')
    .map(e => ({
      date: e.date,
      noveltyType: e.noveltyType,
      lateMinutes: e.lateMinutes,
      notes: e.notes
    }));
  const lateMinutesTotal = allEntries.reduce((acc, e) => acc + (Number(e.lateMinutes) || 0), 0);

  return {
    memberId: record.memberId,
    memberName: record.memberName,
    document: record.document,
    role: record.role,
    monthlyBaseSalary: baseSalary,
    contractSchedule: record.contractSchedule,
    daysWorked: days,
    attendedFullMonth: days >= 30,
    noveltyType: record.noveltyType,
    notes: record.notes,
    baseDevengado,
    auxilioTransporte,
    totalDevengado,
    cesantias: charges.cesantias,
    interesesCesantias: charges.interesesCesantias,
    primaServicios: charges.primaServicios,
    vacaciones: charges.vacaciones,
    totalPrestaciones: charges.totalPrestaciones,
    pension: charges.pension,
    salud: charges.salud,
    arl: charges.arl,
    arlRate,
    totalSeguridadSocial: charges.totalSeguridadSocial,
    cajaCompensacion: charges.cajaCompensacion,
    sena: charges.sena,
    icbf: charges.icbf,
    totalParafiscales: charges.totalParafiscales,
    dotacion: charges.dotacion,
    totalEmployerMonthlyCost,
    effectiveDailyCost,
    tripsCompleted: tripsCount,
    hoursDetail: {
      hodHours: hod,
      honHours: hon,
      hedHours: hed,
      henHours: hen,
      hdfHours: hdf,
      hdfnHours: hdfn,
      hefdHours: hefd,
      hefnHours: hefn,
      totalHours,
      nightSurchargeCOP,
      holidaySurchargeCOP,
      holidayNightSurchargeCOP,
      extrasCOP,
      extrasAreLoaded,
      lateMinutesTotal,
      novedades
    }
  };
}

/** Utilidades de tiempo HH:mm */
export function timeToMinutes(hhmm: string): number {
  const parts = (hhmm || '00:00').split(':').map(Number);
  return ((parts[0] || 0) * 60) + (parts[1] || 0);
}

function nextDayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const next = new Date(y, (m || 1) - 1, d);
  next.setDate(next.getDate() + 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
}

/**
 * Sincroniza los campos de resumen (daysWorked / attendedFullMonth) de un
 * registro a partir de su calendario diario.
 */
export function syncRecordWithDailyEntries(record: StaffAttendanceRecord): StaffAttendanceRecord {
  if (!record.dailyEntries || record.dailyEntries.length === 0) {
    return record;
  }
  const workedDays = record.dailyEntries.filter(
    e => WORKED_NOVELTIES.includes(e.noveltyType) && e.checkIn && e.checkOut
  ).length;
  return {
    ...record,
    daysWorked: Math.min(30, workedDays),
    attendedFullMonth: workedDays >= 30
  };
}

/**
 * Lista de fechas YYYY-MM-DD de un mes (YYYY-MM)
 */
export function getMonthDates(yearMonth: string): string[] {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return [];
  const lastDay = new Date(year, month, 0).getDate();
  const dates: string[] = [];
  for (let d = 1; d <= lastDay; d++) {
    dates.push(`${yearMonth}-${String(d).padStart(2, '0')}`);
  }
  return dates;
}

/**
 * Calcula los minutos de retraso de una entrada contra la hora pactada del
 * cronograma para ese día de la semana. Retorna 0 si llegó a tiempo o antes.
 */
export function computeLateMinutes(
  date: string,
  checkIn: string,
  schedule = getStoredWorkSchedule()
): number {
  if (!date || !checkIn) return 0;
  const parts = date.split('-').map(Number);
  if (parts.length < 3) return 0;
  const jsDate = new Date(parts[0], (parts[1] || 1) - 1, parts[2]);
  const dayOfWeek = jsDate.getDay();

  const dayConfig = schedule.dailySchedules?.find(d => d.dayOfWeek === dayOfWeek);
  if (!dayConfig || !dayConfig.isEnabled) return 0;

  const scheduled = dayConfig.startTime.split(':').map(Number);
  const actual = checkIn.split(':').map(Number);
  const schedMin = (scheduled[0] || 0) * 60 + (scheduled[1] || 0);
  const actualMin = (actual[0] || 0) * 60 + (actual[1] || 0);
  return Math.max(0, actualMin - schedMin);
}

/**
 * Carga todos los registros guardados en localStorage
 */
function loadAllStoredAttendance(): Record<string, StaffAttendanceRecord[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error al cargar asistencia:', e);
  }
  return {};
}

/**
 * Guarda los registros del mes
 */
export function saveMonthlyAttendance(yearMonth: string, records: StaffAttendanceRecord[]): void {
  try {
    const all = loadAllStoredAttendance();
    all[yearMonth] = records;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('scj_attendance_updated', { detail: { yearMonth } }));
    }
  } catch (e) {
    console.error('Error al guardar asistencia:', e);
  }
}

/**
 * Obtiene la asistencia del mes. Si no existe para ese mes, la inicializa con todos los colaboradores activos
 * marcados por defecto como "Asistió mes completo (30 días)".
 */
export function getMonthlyAttendance(
  yearMonth: string,
  staffList: CrewMemberResource[],
  laborConfig: LaborConfig
): StaffAttendanceRecord[] {
  const all = loadAllStoredAttendance();
  const existing = all[yearMonth];

  // Filtramos personal activo
  const activeStaff = staffList.filter(s => (s.status || 'ACTIVO') === 'ACTIVO');

  if (existing && Array.isArray(existing) && existing.length > 0) {
    // Si se añadieron nuevos colaboradores a la plantilla, los unificamos
    const existingMap = new Map(existing.map(r => [r.memberId, r]));
    const merged: StaffAttendanceRecord[] = [];

    activeStaff.forEach(member => {
      if (existingMap.has(member.id)) {
        const r = existingMap.get(member.id)!;
        merged.push({
          ...r,
          memberName: member.name, // Mantener nombre actualizado
          role: member.role,
          document: member.document,
          phone: member.phone || r.phone
        });
      } else {
        // Colaborador nuevo
        merged.push({
          id: `${yearMonth}_${member.id}`,
          yearMonth,
          memberId: member.id,
          memberName: member.name,
          document: member.document,
          role: member.role,
          phone: member.phone,
          monthlyBaseSalary: getMemberDefaultBaseSalary(member, laborConfig),
          contractSchedule: 'Jornada 42h Semanales (Lun - Sáb)',
          attendedFullMonth: !isCurrentCalendarMonth(yearMonth) || getCurrentMonthElapsedDays() >= 30,
          daysWorked: isCurrentCalendarMonth(yearMonth) ? getCurrentMonthElapsedDays() : 30,
          noveltyType: 'ASISTENCIA_TOTAL',
          notes: isCurrentCalendarMonth(yearMonth) ? `Acumulado día a día (${getCurrentMonthElapsedDays()} de 30 días transcurridos)` : ''
        });
      }
    });
    return merged;
  }

  // Inicializar por primera vez: si es el mes actual, calcular progresivo día a día
  const isCurrent = isCurrentCalendarMonth(yearMonth);
  const elapsed = isCurrent ? getCurrentMonthElapsedDays() : 30;
  const initialized: StaffAttendanceRecord[] = activeStaff.map(member => ({
    id: `${yearMonth}_${member.id}`,
    yearMonth,
    memberId: member.id,
    memberName: member.name,
    document: member.document,
    role: member.role,
    phone: member.phone,
    monthlyBaseSalary: getMemberDefaultBaseSalary(member, laborConfig),
    contractSchedule: 'Jornada 42h Semanales (Lun - Sáb)',
    attendedFullMonth: !isCurrent || elapsed >= 30,
    daysWorked: elapsed,
    noveltyType: 'ASISTENCIA_TOTAL',
    notes: isCurrent ? `Acumulado al día ${elapsed} de 30 transcurridos` : 'Asistencia completa 30 días'
  }));

  saveMonthlyAttendance(yearMonth, initialized);
  return initialized;
}

/**
 * Marca a todo el personal como "Asistió mes completo (30 días)"
 */
export function markAllFullMonthAttendance(
  yearMonth: string,
  staffList: CrewMemberResource[],
  laborConfig: LaborConfig
): StaffAttendanceRecord[] {
  const activeStaff = staffList.filter(s => (s.status || 'ACTIVO') === 'ACTIVO');
  const updated: StaffAttendanceRecord[] = activeStaff.map(member => ({
    id: `${yearMonth}_${member.id}`,
    yearMonth,
    memberId: member.id,
    memberName: member.name,
    document: member.document,
    role: member.role,
    phone: member.phone,
    monthlyBaseSalary: getMemberDefaultBaseSalary(member, laborConfig),
    contractSchedule: 'Jornada 42h Semanales (Lun - Sáb)',
    attendedFullMonth: true,
    daysWorked: 30,
    noveltyType: 'ASISTENCIA_TOTAL',
    notes: 'Asistencia completa 30 días calendario'
  }));

  saveMonthlyAttendance(yearMonth, updated);
  return updated;
}

/**
 * Cuenta la cantidad de viajes liquidados en el mes para un miembro específico
 */
export function countMemberTripsInMonth(
  member: CrewMemberResource | { name: string; id: string },
  yearMonth: string,
  dispatches: TripDispatch[]
): number {
  if (!member || !member.name) return 0;
  const cleanName = member.name.trim().toLowerCase();

  return dispatches.filter(d => {
    // Coincide el mes si tiene departureDate 'YYYY-MM-DD'
    const dateMatch = d.departureDate ? d.departureDate.startsWith(yearMonth) : true;
    if (!dateMatch) return false;

    // Conductor
    const isDriver = d.driverName && d.driverName.trim().toLowerCase() === cleanName;
    // Auxiliar
    const isHelper = d.helperNames && d.helperNames.toLowerCase().includes(cleanName);

    return isDriver || isHelper;
  }).length;
}

export function setAllStaffDaysWorked(
  yearMonth: string,
  days: number,
  staffList: CrewMemberResource[],
  laborConfig: LaborConfig
): StaffAttendanceRecord[] {
  const current = getMonthlyAttendance(yearMonth, staffList, laborConfig);
  const updated = current.map(r => ({
    ...r,
    daysWorked: Math.max(0, Math.min(30, days)),
    attendedFullMonth: days >= 30,
    notes: days < 30 ? `Cálculo ajustado a ${days} días trabajados` : 'Asistencia completa 30 días calendario'
  }));
  saveMonthlyAttendance(yearMonth, updated);
  return updated;
}
