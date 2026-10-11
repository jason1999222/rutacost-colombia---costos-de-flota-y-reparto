import { defaultLaborConfig } from './laborDefaults';
/**
 * Calendario Oficial de Días Festivos de Colombia 2026 (Ley 51 de 1983 - Ley Emiliani)
 * y Motor de Cálculo de Horarios Laborales de Lunes a Sábado y Horas Extras
 */
import { LaborConfig } from '../types/logistics';
import { computeEmployerCharges, isLoadedOvertimeRate } from '../utils/employerCharges';

export interface HolidayInfo {
  date: string; // Formato YYYY-MM-DD
  name: string;
  type: 'CIVIL' | 'RELIGIOSO_EMILIANI' | 'PATRIO' | 'LOCAL_CIVICO' | 'PERSONALIZADO';
  description?: string;
}

export interface DailyWorkSchedule {
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado
  dayName: string; // "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
  shortName: string; // "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"
  isEnabled: boolean; // Si es día ordinario laboral
  startTime: string; // "06:00"
  standardHours: number; // Horas ordinarias del día (ej. 8h Lun-Vie, 2h Sábados para completar 42h)
  endTime: string; // "14:00" u "08:00"
}

export interface WorkSchedulePreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  weeklyHours: number;
  schedules: DailyWorkSchedule[];
}

export const WORK_SCHEDULE_PRESETS: WorkSchedulePreset[] = [
  {
    id: '42h_lun_jue_8_vie_6_sab_4',
    name: 'Jornada 42h: Lun-Jue 8h + Vie 6h + Sáb 4h',
    description: 'Lunes a Jueves 8h, Viernes 6h y Sábados 4h (06:00 a 10:00). Suma exactamente 42 horas semanales sin horas extras.',
    badge: '42h Repartido',
    weeklyHours: 42,
    schedules: [
      { dayOfWeek: 1, dayName: 'Lunes', shortName: 'Lun', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 2, dayName: 'Martes', shortName: 'Mar', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 3, dayName: 'Miércoles', shortName: 'Mié', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 4, dayName: 'Jueves', shortName: 'Jue', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 5, dayName: 'Viernes', shortName: 'Vie', isEnabled: true, startTime: '06:00', standardHours: 6, endTime: '12:00' },
      { dayOfWeek: 6, dayName: 'Sábado', shortName: 'Sáb', isEnabled: true, startTime: '06:00', standardHours: 4, endTime: '10:00' },
      { dayOfWeek: 0, dayName: 'Domingo', shortName: 'Dom', isEnabled: false, startTime: '06:00', standardHours: 0, endTime: '06:00' }
    ]
  },
  {
    id: '42h_lun_vie_8_sab_2',
    name: 'Jornada 42h: Lun-Vie 8h + Sáb 2h',
    description: 'Lunes a Viernes 8 horas (06:00 a 14:00) y Sábados 2 horas (06:00 a 08:00). Suma 42 horas.',
    badge: '42h Semanales',
    weeklyHours: 42,
    schedules: [
      { dayOfWeek: 1, dayName: 'Lunes', shortName: 'Lun', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 2, dayName: 'Martes', shortName: 'Mar', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 3, dayName: 'Miércoles', shortName: 'Mié', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 4, dayName: 'Jueves', shortName: 'Jue', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 5, dayName: 'Viernes', shortName: 'Vie', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 6, dayName: 'Sábado', shortName: 'Sáb', isEnabled: true, startTime: '06:00', standardHours: 2, endTime: '08:00' },
      { dayOfWeek: 0, dayName: 'Domingo', shortName: 'Dom', isEnabled: false, startTime: '06:00', standardHours: 0, endTime: '06:00' }
    ]
  },
  {
    id: '42h_lun_jue_8.5_vie_8',
    name: 'Jornada 42h: 5 Días (Lun-Jue 8.5h + Vie 8h)',
    description: 'Lunes a Jueves 8.5 horas y Viernes 8 horas. Sábados y Domingos descanso.',
    badge: '42h · Sin Sábados',
    weeklyHours: 42,
    schedules: [
      { dayOfWeek: 1, dayName: 'Lunes', shortName: 'Lun', isEnabled: true, startTime: '06:00', standardHours: 8.5, endTime: '14:30' },
      { dayOfWeek: 2, dayName: 'Martes', shortName: 'Mar', isEnabled: true, startTime: '06:00', standardHours: 8.5, endTime: '14:30' },
      { dayOfWeek: 3, dayName: 'Miércoles', shortName: 'Mié', isEnabled: true, startTime: '06:00', standardHours: 8.5, endTime: '14:30' },
      { dayOfWeek: 4, dayName: 'Jueves', shortName: 'Jue', isEnabled: true, startTime: '06:00', standardHours: 8.5, endTime: '14:30' },
      { dayOfWeek: 5, dayName: 'Viernes', shortName: 'Vie', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 6, dayName: 'Sábado', shortName: 'Sáb', isEnabled: false, startTime: '06:00', standardHours: 0, endTime: '06:00' },
      { dayOfWeek: 0, dayName: 'Domingo', shortName: 'Dom', isEnabled: false, startTime: '06:00', standardHours: 0, endTime: '06:00' }
    ]
  },
  {
    id: '42h_uniforme_7h',
    name: 'Jornada 42h: 6 Días Uniforme (7h / día)',
    description: 'Lunes a Sábado 7 horas diarias exactas (06:00 a 13:00). Suma 42 horas.',
    badge: '42h · Uniforme',
    weeklyHours: 42,
    schedules: [
      { dayOfWeek: 1, dayName: 'Lunes', shortName: 'Lun', isEnabled: true, startTime: '06:00', standardHours: 7, endTime: '13:00' },
      { dayOfWeek: 2, dayName: 'Martes', shortName: 'Mar', isEnabled: true, startTime: '06:00', standardHours: 7, endTime: '13:00' },
      { dayOfWeek: 3, dayName: 'Miércoles', shortName: 'Mié', isEnabled: true, startTime: '06:00', standardHours: 7, endTime: '13:00' },
      { dayOfWeek: 4, dayName: 'Jueves', shortName: 'Jue', isEnabled: true, startTime: '06:00', standardHours: 7, endTime: '13:00' },
      { dayOfWeek: 5, dayName: 'Viernes', shortName: 'Vie', isEnabled: true, startTime: '06:00', standardHours: 7, endTime: '13:00' },
      { dayOfWeek: 6, dayName: 'Sábado', shortName: 'Sáb', isEnabled: true, startTime: '06:00', standardHours: 7, endTime: '13:00' },
      { dayOfWeek: 0, dayName: 'Domingo', shortName: 'Dom', isEnabled: false, startTime: '06:00', standardHours: 0, endTime: '06:00' }
    ]
  },
  {
    id: '44h_operativo',
    name: 'Jornada 44h: Lun-Vie 8h + Sáb 4h',
    description: 'Lunes a Viernes 8 horas y Sábados 4 horas (06:00 a 10:00). Suma 44 horas.',
    badge: '44h Semanales',
    weeklyHours: 44,
    schedules: [
      { dayOfWeek: 1, dayName: 'Lunes', shortName: 'Lun', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 2, dayName: 'Martes', shortName: 'Mar', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 3, dayName: 'Miércoles', shortName: 'Mié', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 4, dayName: 'Jueves', shortName: 'Jue', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 5, dayName: 'Viernes', shortName: 'Vie', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 6, dayName: 'Sábado', shortName: 'Sáb', isEnabled: true, startTime: '06:00', standardHours: 4, endTime: '10:00' },
      { dayOfWeek: 0, dayName: 'Domingo', shortName: 'Dom', isEnabled: false, startTime: '06:00', standardHours: 0, endTime: '06:00' }
    ]
  },
  {
    id: '40h_semanal',
    name: 'Jornada 40h: Lun-Vie 8h',
    description: 'Lunes a Viernes 8 horas diarias continuas. Sábados y Domingos descanso.',
    badge: '40h · 5 Días',
    weeklyHours: 40,
    schedules: [
      { dayOfWeek: 1, dayName: 'Lunes', shortName: 'Lun', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 2, dayName: 'Martes', shortName: 'Mar', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 3, dayName: 'Miércoles', shortName: 'Mié', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 4, dayName: 'Jueves', shortName: 'Jue', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 5, dayName: 'Viernes', shortName: 'Vie', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 6, dayName: 'Sábado', shortName: 'Sáb', isEnabled: false, startTime: '06:00', standardHours: 0, endTime: '06:00' },
      { dayOfWeek: 0, dayName: 'Domingo', shortName: 'Dom', isEnabled: false, startTime: '06:00', standardHours: 0, endTime: '06:00' }
    ]
  },
  {
    id: '48h_estandar',
    name: 'Jornada 48h: Lun-Sáb 8h',
    description: 'Lunes a Sábado 8 horas diarias continuas (06:00 a 14:00). Suma 48 horas.',
    badge: '48h Semanales',
    weeklyHours: 48,
    schedules: [
      { dayOfWeek: 1, dayName: 'Lunes', shortName: 'Lun', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 2, dayName: 'Martes', shortName: 'Mar', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 3, dayName: 'Miércoles', shortName: 'Mié', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 4, dayName: 'Jueves', shortName: 'Jue', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 5, dayName: 'Viernes', shortName: 'Vie', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 6, dayName: 'Sábado', shortName: 'Sáb', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
      { dayOfWeek: 0, dayName: 'Domingo', shortName: 'Dom', isEnabled: false, startTime: '06:00', standardHours: 0, endTime: '06:00' }
    ]
  }
];

export interface WorkScheduleConfig {
  shiftName: string; // ej. "Jornada Semanal Operativa"
  workDays: string[]; // ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  standardDailyHours: number; // 8 horas ordinarias de referencia
  normalShiftStartTime: string; // "06:00"
  normalShiftEndTime: string; // "14:00"
  nightHoursStartTime: string; // "21:00"
  nightHoursEndTime: string; // "06:00"
  sundayHolidaySurchargeRate: number; // 0.75 (75% recargo festivo/dominical ordinario)
  dayOvertimeSurchargeRate: number; // 0.25 (25% recargo extra diurna)
  nightOvertimeSurchargeRate: number; // 0.75 (75% recargo extra nocturna)
  nightSurchargeRate?: number; // 0.35 (35% recargo nocturno ordinario)
  sundayHolidayOvertimeDayRate?: number; // 1.00 (100% recargo extra festivo diurno)
  sundayHolidayOvertimeNightRate?: number; // 1.50 (150% recargo extra festivo nocturno)
  weeklyTargetHours?: number; // Meta semanal configurable (ej: 42, 44, 40, 48)
  monthlyWorkingHours?: number; // Divisor mensual de nómina configurable (ej: 210, 220, 240)
  dailySchedules?: DailyWorkSchedule[]; // Configuración por día de la semana
}

export const DEFAULT_WORK_SCHEDULE: WorkScheduleConfig = {
  shiftName: "Jornada Semanal 42h (Lun-Jue 8h + Vie 6h + Sáb 4h)",
  workDays: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  standardDailyHours: 8,
  normalShiftStartTime: "06:00",
  normalShiftEndTime: "14:00",
  nightHoursStartTime: "21:00",
  nightHoursEndTime: "06:00",
  sundayHolidaySurchargeRate: 0.75,
  dayOvertimeSurchargeRate: 0.25,
  nightOvertimeSurchargeRate: 0.75,
  nightSurchargeRate: 0.35,
  sundayHolidayOvertimeDayRate: 1.00,
  sundayHolidayOvertimeNightRate: 1.50,
  weeklyTargetHours: 42,
  monthlyWorkingHours: defaultLaborConfig.monthlyWorkingHours,
  dailySchedules: [
    { dayOfWeek: 1, dayName: 'Lunes', shortName: 'Lun', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
    { dayOfWeek: 2, dayName: 'Martes', shortName: 'Mar', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
    { dayOfWeek: 3, dayName: 'Miércoles', shortName: 'Mié', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
    { dayOfWeek: 4, dayName: 'Jueves', shortName: 'Jue', isEnabled: true, startTime: '06:00', standardHours: 8, endTime: '14:00' },
    { dayOfWeek: 5, dayName: 'Viernes', shortName: 'Vie', isEnabled: true, startTime: '06:00', standardHours: 6, endTime: '12:00' },
    { dayOfWeek: 6, dayName: 'Sábado', shortName: 'Sáb', isEnabled: true, startTime: '06:00', standardHours: 4, endTime: '10:00' },
    { dayOfWeek: 0, dayName: 'Domingo', shortName: 'Dom', isEnabled: false, startTime: '06:00', standardHours: 0, endTime: '06:00' }
  ]
};

export const WORK_SCHEDULE_STORAGE_KEY = 'scj_work_schedule';

/**
 * Obtiene la configuración de jornada de trabajo activa (desde localStorage o valor por defecto)
 */
export function getStoredWorkSchedule(): WorkScheduleConfig {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem(WORK_SCHEDULE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.dailySchedules) && parsed.dailySchedules.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parseando horario almacenado:', e);
      }
    }
  }
  return DEFAULT_WORK_SCHEDULE;
}

/**
 * Guarda y propaga la configuración de jornada laboral
 */
export function saveStoredWorkSchedule(config: WorkScheduleConfig): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(WORK_SCHEDULE_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('scj_work_schedule_updated', { detail: config }));
  }
}

/**
 * 18 Días Festivos Oficiales de Colombia para el Año 2026 (Base de referencia)
 */
export const COLOMBIA_HOLIDAYS_2026: HolidayInfo[] = [
  { date: '2026-01-01', name: 'Año Nuevo', type: 'CIVIL', description: 'Festivo cívico nacional' },
  { date: '2026-01-12', name: 'Día de los Reyes Magos', type: 'RELIGIOSO_EMILIANI', description: 'Trasladado al lunes (Ley Emiliani)' },
  { date: '2026-03-23', name: 'Día de San José', type: 'RELIGIOSO_EMILIANI', description: 'Trasladado al lunes (Ley Emiliani)' },
  { date: '2026-04-02', name: 'Jueves Santo', type: 'RELIGIOSO_EMILIANI', description: 'Semana Santa' },
  { date: '2026-04-03', name: 'Viernes Santo', type: 'RELIGIOSO_EMILIANI', description: 'Semana Santa' },
  { date: '2026-05-01', name: 'Día del Trabajo', type: 'CIVIL', description: 'Día internacional del trabajo' },
  { date: '2026-05-18', name: 'Ascensión del Señor', type: 'RELIGIOSO_EMILIANI', description: 'Trasladado al lunes (Ley Emiliani)' },
  { date: '2026-06-08', name: 'Corpus Christi', type: 'RELIGIOSO_EMILIANI', description: 'Trasladado al lunes (Ley Emiliani)' },
  { date: '2026-06-15', name: 'Sagrado Corazón de Jesús', type: 'RELIGIOSO_EMILIANI', description: 'Trasladado al lunes (Ley Emiliani)' },
  { date: '2026-06-29', name: 'San Pedro y San Pablo', type: 'RELIGIOSO_EMILIANI', description: 'Trasladado al lunes (Ley Emiliani)' },
  { date: '2026-07-20', name: 'Día de la Independencia', type: 'PATRIO', description: 'Fiesta patria colombiana' },
  { date: '2026-08-07', name: 'Batalla de Boyacá', type: 'PATRIO', description: 'Fiesta patria colombiana' },
  { date: '2026-08-17', name: 'La Asunción de la Virgen', type: 'RELIGIOSO_EMILIANI', description: 'Trasladado al lunes (Ley Emiliani)' },
  { date: '2026-10-12', name: 'Día de la Raza', type: 'CIVIL', description: 'Trasladado al lunes (Ley Emiliani)' },
  { date: '2026-11-02', name: 'Día de Todos los Santos', type: 'RELIGIOSO_EMILIANI', description: 'Trasladado al lunes (Ley Emiliani)' },
  { date: '2026-11-16', name: 'Independencia de Cartagena', type: 'PATRIO', description: 'Trasladado al lunes (Ley Emiliani)' },
  { date: '2026-12-08', name: 'Inmaculada Concepción', type: 'RELIGIOSO_EMILIANI', description: 'Día de las velitas' },
  { date: '2026-12-25', name: 'Navidad', type: 'RELIGIOSO_EMILIANI', description: 'Natividad del Señor' }
];

export const HOLIDAYS_STORAGE_KEY = 'scj_custom_holidays';

/**
 * Obtiene la lista activa de festivos (desde localStorage o los oficiales de 2026)
 */
export function getCustomHolidays(): HolidayInfo[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem(HOLIDAYS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => a.date.localeCompare(b.date));
        }
      } catch (e) {
        console.error('Error cargando festivos personalizados:', e);
      }
    }
  }
  return COLOMBIA_HOLIDAYS_2026;
}

/**
 * Guarda y propaga la lista de festivos personalizados en localStorage
 */
export function saveCustomHolidays(holidays: HolidayInfo[]): void {
  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(sorted));
    window.dispatchEvent(new CustomEvent('scj_holidays_updated', { detail: sorted }));
  }
}

/**
 * Restablece los 18 festivos oficiales colombianos de 2026
 */
export function resetCustomHolidays(): HolidayInfo[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(HOLIDAYS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('scj_holidays_updated', { detail: COLOMBIA_HOLIDAYS_2026 }));
  }
  return COLOMBIA_HOLIDAYS_2026;
}

/**
 * Agrega un nuevo festivo (valida que la fecha no esté duplicada)
 */
export function addCustomHoliday(holiday: HolidayInfo): HolidayInfo[] {
  const current = getCustomHolidays();
  const cleanDate = holiday.date.trim().slice(0, 10);
  const filtered = current.filter(h => h.date !== cleanDate);
  const updated = [...filtered, { ...holiday, date: cleanDate }].sort((a, b) => a.date.localeCompare(b.date));
  saveCustomHolidays(updated);
  return updated;
}

/**
 * Elimina un festivo por su fecha (YYYY-MM-DD)
 */
export function removeCustomHoliday(dateStr: string): HolidayInfo[] {
  const cleanDate = dateStr.trim().slice(0, 10);
  const current = getCustomHolidays();
  const updated = current.filter(h => h.date !== cleanDate);
  saveCustomHolidays(updated);
  return updated;
}

/**
 * Verifica si una fecha específica (YYYY-MM-DD) es día festivo oficial en Colombia
 */
export function isColombianHoliday(dateStr: string, customList?: HolidayInfo[]): { isHoliday: boolean; holidayName?: string } {
  if (!dateStr) return { isHoliday: false };
  const cleanDate = dateStr.trim().slice(0, 10);
  const list = customList || getCustomHolidays();
  const found = list.find(h => h.date === cleanDate);
  if (found) {
    return { isHoliday: true, holidayName: found.name };
  }
  return { isHoliday: false };
}

/**
 * Verifica si una fecha es Domingo (en zona horaria local o UTC)
 */
export function isSundayDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length < 3) return false;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.getDay() === 0;
}

/**
 * Verifica si es día dominical o festivo en Colombia
 */
export function isSundayOrColombianHoliday(dateStr: string, customList?: HolidayInfo[]): { isSpecial: boolean; label?: string } {
  const holidayCheck = isColombianHoliday(dateStr, customList);
  if (holidayCheck.isHoliday) {
    return { isSpecial: true, label: `Festivo: ${holidayCheck.holidayName}` };
  }
  if (isSundayDate(dateStr)) {
    return { isSpecial: true, label: 'Domingo (Descanso legal)' };
  }
  return { isSpecial: false };
}

export interface CalculatedTripShiftBreakdown {
  totalHours: number;

  // 1. Horas Ordinarias (Lun-Sáb)
  regularHours: number; // HOD: Hora Ordinaria Diurna (06:00 - 21:00)
  nightRegularHours: number; // HON: Hora Ordinaria Nocturna (+35% CST Art. 168 num 1) (21:00 - 06:00)

  // 2. Horas Extras Ordinarias (Lun-Sáb)
  daytimeOvertimeHours: number; // HED: Hora Extra Diurna (+25% CST Art. 168 num 2)
  nighttimeOvertimeHours: number; // HEN: Hora Extra Nocturna (+75% CST Art. 168 num 3)

  // 3. Horas Dominicales o Festivas Ordinarias
  sundayHolidayRegularHours: number; // HDF: Hora Festiva Ordinaria Diurna (+75% CST Art. 179)
  sundayHolidayNightHours: number; // HDFN: Hora Festiva Ordinaria Nocturna (+110% = 75% + 35%)

  // 4. Horas Extras Dominicales o Festivas
  sundayHolidayDayOvertimeHours: number; // HEFD: Hora Extra Festiva Diurna (Factor 2.00 / 200% CST Art. 168 num 4)
  sundayHolidayNightOvertimeHours: number; // HEFN: Hora Extra Festiva Nocturna (Factor 2.50 / 250% CST Art. 168 num 4)

  // Totales acumulados para compatibilidad
  sundayHolidayHours: number; // Total horas en domingo o festivo
  isSundayOrHoliday: boolean;
  holidayName?: string;

  // Liquidación en Pesos (COP)
  regularPayCOP: number;
  nightRegularPayCOP: number;
  dayOvertimePayCOP: number;
  nightOvertimePayCOP: number;
  sundayHolidayRegularPayCOP: number;
  sundayHolidayNightPayCOP: number;
  sundayHolidayDayOvertimePayCOP: number;
  sundayHolidayNightOvertimePayCOP: number;
  sundayHolidayPayCOP: number; // Total devengado dominical/festivo

  // Auxilio de Transporte Proporcional
  auxilioTransporteTripCOP: number; // Auxilio legal de transporte ($249.095 mensual / $8.303 día)

  totalLaborCalculatedCOP: number; // Total devengado de mano de obra
}

/**
 * Clasificación pura de horas trabajadas entre dos momentos (fecha + hora) según el CST,
 * el cronograma laboral configurado y el calendario de festivos de Colombia.
 * No calcula dinero; solo cuántas horas caen en cada categoría.
 */
export interface HourClassification {
  totalHours: number;
  regularHours: number;             // HOD: Hora Ordinaria Diurna (06:00 - 21:00)
  nightRegularHours: number;        // HON: Hora Ordinaria Nocturna (+35%)
  daytimeOvertimeHours: number;     // HED: Hora Extra Diurna (+25%)
  nighttimeOvertimeHours: number;   // HEN: Hora Extra Nocturna (+75%)
  sundayHolidayRegularHours: number;   // HDF: Dominical/Festivo Ordinario (+75%)
  sundayHolidayNightHours: number;     // HDFN: Dominical/Festivo Nocturno (+110%)
  sundayHolidayDayOvertimeHours: number;    // HEFD: Extra Festiva Diurna (200%)
  sundayHolidayNightOvertimeHours: number; // HEFN: Extra Festiva Nocturna (250%)
}

/**
 * Clasifica las horas trabajadas entre dos momentos (fecha + hora) según el CST,
 * el cronograma laboral configurado (dailySchedules) y el calendario de festivos.
 *
 * Reglas clave:
 * - Respeta el tope de horas ordinarias por día de la semana (dailySchedules).
 * - Domingo o festivo: aunque el cronograma lo marque como día de descanso,
 *   si la persona trabajó, las primeras horas (hasta el tope del día, o 8h si es
 *   descanso) pagan como dominical/festivo ordinario (HDF/HDFN) y solo el
 *   excedente es extra festiva (HEFD/HEFN).
 * - Día ordinario no habilitado en el cronograma: todo el tiempo cuenta como extra.
 * - Muestreo en tramos de 30 minutos con tramo final parcial (no infla horas).
 */
export function classifyWorkHours(
  departureDate: string,
  departureTime: string,
  returnDate: string,
  returnTime: string,
  schedule?: WorkScheduleConfig
): HourClassification {
  // Parsing de fechas y horas
  const startDateTimeStr = `${departureDate}T${departureTime || '06:00'}:00`;
  const endDateTimeStr = `${returnDate || departureDate}T${returnTime || '18:00'}:00`;

  let start = new Date(startDateTimeStr);
  let end = new Date(endDateTimeStr);

  if (isNaN(start.getTime())) {
    start = new Date(`${departureDate}T06:00:00`);
  }
  if (isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
    end = new Date(start.getTime() + (8 * 3600 * 1000)); // 8 horas por defecto
  }

  const diffMs = end.getTime() - start.getTime();
  const totalHours = Math.max(0.5, Math.round((diffMs / (3600 * 1000)) * 10) / 10);

  const activeSchedule = schedule || getStoredWorkSchedule();

  // Parsing dinámico de franja nocturna configurable
  let nightStartHour = 21;
  if (activeSchedule.nightHoursStartTime) {
    const parts = activeSchedule.nightHoursStartTime.split(':').map(Number);
    nightStartHour = (parts[0] || 21) + ((parts[1] || 0) / 60);
  }
  let nightEndHour = 6;
  if (activeSchedule.nightHoursEndTime) {
    const parts = activeSchedule.nightHoursEndTime.split(':').map(Number);
    nightEndHour = (parts[0] || 6) + ((parts[1] || 0) / 60);
  }

  let regularHours = 0;
  let nightRegularHours = 0;
  let daytimeOvertimeHours = 0;
  let nighttimeOvertimeHours = 0;
  let sundayHolidayRegularHours = 0;
  let sundayHolidayNightHours = 0;
  let sundayHolidayDayOvertimeHours = 0;
  let sundayHolidayNightOvertimeHours = 0;

  // Registro de horas laboradas por fecha calendario para respetar el tope de cada día
  const dailyHoursWorkedMap = new Map<string, number>();
  let curMs = start.getTime();
  const endMs = end.getTime();
  const fullStepMs = 30 * 60 * 1000;

  while (curMs < endMs) {
    // Tramo de 30 minutos, o el tramo parcial final (para no inflar horas)
    const remainingMs = endMs - curMs;
    const stepMs = Math.min(fullStepMs, remainingMs);
    const stepHours = stepMs / (3600 * 1000);

    const curDate = new Date(curMs);
    const y = curDate.getFullYear();
    const m = String(curDate.getMonth() + 1).padStart(2, '0');
    const d = String(curDate.getDate()).padStart(2, '0');
    const curDateStr = `${y}-${m}-${d}`;
    const curDayOfWeek = curDate.getDay(); // 0 = Dom, 1 = Lun, ..., 6 = Sáb

    const isStepHolidayOrSunday = isSundayOrColombianHoliday(curDateStr).isSpecial;

    // Franja horaria: Nocturna según configuración activa
    const hourVal = curDate.getHours() + (curDate.getMinutes() / 60);
    const isNightHour = (nightStartHour > nightEndHour)
      ? (hourVal >= nightStartHour || hourVal < nightEndHour)
      : (hourVal >= nightStartHour && hourVal < nightEndHour);

    // Tope de horas ordinarias para este día específico de la semana
    let dailyStandardLimit = activeSchedule.standardDailyHours || 8.0;
    let isDayActive = true;

    if (activeSchedule.dailySchedules && activeSchedule.dailySchedules.length > 0) {
      const dayConfig = activeSchedule.dailySchedules.find(item => item.dayOfWeek === curDayOfWeek);
      if (dayConfig) {
        isDayActive = dayConfig.isEnabled;
        dailyStandardLimit = isDayActive ? (Number(dayConfig.standardHours) || 0) : 0;
      }
    }

    const dayHoursAcc = dailyHoursWorkedMap.get(curDateStr) || 0;

    if (isStepHolidayOrSunday) {
      // Domingo / festivo: hasta el tope del día (o 8h si es descanso) es
      // dominical ordinario con recargo; el excedente es extra festiva.
      const sundayOvertimeThreshold = isDayActive ? dailyStandardLimit : 8.0;
      const isSundayOvertime = dayHoursAcc >= sundayOvertimeThreshold;
      if (!isSundayOvertime) {
        if (isNightHour) {
          sundayHolidayNightHours += stepHours;
        } else {
          sundayHolidayRegularHours += stepHours;
        }
      } else {
        if (isNightHour) {
          sundayHolidayNightOvertimeHours += stepHours;
        } else {
          sundayHolidayDayOvertimeHours += stepHours;
        }
      }
    } else {
      // Día ordinario: hasta el tope del día es ordinario; el excedente es extra.
      // Si el día no está habilitado en el cronograma, todo cuenta como extra.
      const isOvertimeHour = dayHoursAcc >= dailyStandardLimit || !isDayActive;
      if (!isOvertimeHour) {
        if (isNightHour) {
          nightRegularHours += stepHours;
        } else {
          regularHours += stepHours;
        }
      } else {
        if (isNightHour) {
          nighttimeOvertimeHours += stepHours;
        } else {
          daytimeOvertimeHours += stepHours;
        }
      }
    }

    dailyHoursWorkedMap.set(curDateStr, dayHoursAcc + stepHours);
    curMs += stepMs;
  }

  return {
    totalHours,
    regularHours: Math.round(regularHours * 10) / 10,
    nightRegularHours: Math.round(nightRegularHours * 10) / 10,
    daytimeOvertimeHours: Math.round(daytimeOvertimeHours * 10) / 10,
    nighttimeOvertimeHours: Math.round(nighttimeOvertimeHours * 10) / 10,
    sundayHolidayRegularHours: Math.round(sundayHolidayRegularHours * 10) / 10,
    sundayHolidayNightHours: Math.round(sundayHolidayNightHours * 10) / 10,
    sundayHolidayDayOvertimeHours: Math.round(sundayHolidayDayOvertimeHours * 10) / 10,
    sundayHolidayNightOvertimeHours: Math.round(sundayHolidayNightOvertimeHours * 10) / 10
  };
}

/**
 * Calcula con precisión legal la liquidación de horas trabajadas para un viaje específico
 * según la fecha y hora de salida, fecha y hora de llegada, horario normal lun-sáb y calendario de festivos.
 * Discrimina las 8 categorías del Código Sustantivo del Trabajo de Colombia (CST) y Ley 2101:
 * - Hora Ordinaria Diurna (HOD: 100%)
 * - Hora Ordinaria Nocturna con recargo (HON: +35% = 135%)
 * - Hora Extra Diurna (HED: +25% = 125%)
 * - Hora Extra Nocturna (HEN: +75% = 175%)
 * - Hora Festiva/Dominical Diurna Ordinaria (HDF: +75% = 175%)
 * - Hora Festiva/Dominical Nocturna Ordinaria (HDFN: +110% = 210%)
 * - Hora Extra Festiva Diurna (HEFD: +100% = 200%)
 * - Hora Extra Festiva Nocturna (HEFN: +150% = 250%)
 * - Auxilio Legal de Transporte proporcional ($8.303 COP/día)
 */
export function calculateTripLaborFromSchedule(
  departureDate: string,
  departureTime: string,
  returnDate: string,
  returnTime: string,
  hourlyOrdRate: number = 8338,
  hourlyDayExtRate: number = 10422,
  hourlyNightExtRate: number = 14591,
  schedule?: WorkScheduleConfig,
  auxilioTransporteLegal: number = defaultLaborConfig.auxilioTransporteLegal
): CalculatedTripShiftBreakdown {
  const activeSchedule = schedule || getStoredWorkSchedule();

  // Datos del día inicial de despacho
  const specialDayInfo = isSundayOrColombianHoliday(departureDate);
  const isSpecial = specialDayInfo.isSpecial;

  // Clasificación de horas por franja CST (motor compartido con la asistencia diaria)
  const cls = classifyWorkHours(departureDate, departureTime, returnDate, returnTime, schedule);
  const {
    totalHours,
    regularHours,
    nightRegularHours,
    daytimeOvertimeHours,
    nighttimeOvertimeHours,
    sundayHolidayRegularHours,
    sundayHolidayNightHours,
    sundayHolidayDayOvertimeHours,
    sundayHolidayNightOvertimeHours
  } = cls;

  const totalSundayHolidayHours = Math.round((
    sundayHolidayRegularHours +
    sundayHolidayNightHours +
    sundayHolidayDayOvertimeHours +
    sundayHolidayNightOvertimeHours
  ) * 10) / 10;

    // Liquidación monetaria CST en Pesos Colombianos (COP) según porcentajes parametrizados
  const baseOrd = hourlyOrdRate || 8338;
  const regularPayCOP = Math.round(regularHours * baseOrd);

  // Factores y porcentajes de recargo parametrizables
  const nightSurcharge = activeSchedule.nightSurchargeRate !== undefined ? activeSchedule.nightSurchargeRate : 0.35;
  const dayExtSurcharge = activeSchedule.dayOvertimeSurchargeRate !== undefined ? activeSchedule.dayOvertimeSurchargeRate : 0.25;
  const nightExtSurcharge = activeSchedule.nightOvertimeSurchargeRate !== undefined ? activeSchedule.nightOvertimeSurchargeRate : 0.75;
  const sunHolSurcharge = activeSchedule.sundayHolidaySurchargeRate !== undefined ? activeSchedule.sundayHolidaySurchargeRate : 0.75;
  const sunHolDayExtSurcharge = activeSchedule.sundayHolidayOvertimeDayRate !== undefined ? activeSchedule.sundayHolidayOvertimeDayRate : 1.00;
  const sunHolNightExtSurcharge = activeSchedule.sundayHolidayOvertimeNightRate !== undefined ? activeSchedule.sundayHolidayOvertimeNightRate : 1.50;

  // Recargo nocturno ordinario
  const nightRegularPayCOP = Math.round(nightRegularHours * (baseOrd * (1 + nightSurcharge)));

  // Horas Extras Ordinarias Diurna y Nocturna
  const dayOvertimePayCOP = Math.round(daytimeOvertimeHours * (hourlyDayExtRate > 0 ? hourlyDayExtRate : (baseOrd * (1 + dayExtSurcharge))));
  const nightOvertimePayCOP = Math.round(nighttimeOvertimeHours * (hourlyNightExtRate > 0 ? hourlyNightExtRate : (baseOrd * (1 + nightExtSurcharge))));

  // Dominical / Festivo Ordinario Diurno y Nocturno
  const sundayHolidayRegularPayCOP = Math.round(sundayHolidayRegularHours * (baseOrd * (1 + sunHolSurcharge)));
  const sundayHolidayNightPayCOP = Math.round(sundayHolidayNightHours * (baseOrd * (1 + sunHolSurcharge + nightSurcharge)));

  // Horas Extras Dominicales/Festivas: Diurna y Nocturna
  const sundayHolidayDayOvertimePayCOP = Math.round(sundayHolidayDayOvertimeHours * (baseOrd * (1 + sunHolDayExtSurcharge)));
  const sundayHolidayNightOvertimePayCOP = Math.round(sundayHolidayNightOvertimeHours * (baseOrd * (1 + sunHolNightExtSurcharge)));

  const sundayHolidayPayCOP =
    sundayHolidayRegularPayCOP +
    sundayHolidayNightPayCOP +
    sundayHolidayDayOvertimePayCOP +
    sundayHolidayNightOvertimePayCOP;

  // Auxilio de Transporte Proporcional: $249.095 / 30 = $8.303,17 COP/día (base 8 horas)
  const dailyAux = auxilioTransporteLegal > 0 ? (auxilioTransporteLegal / 30) : (defaultLaborConfig.auxilioTransporteLegal / 30);
  const auxilioTransporteTripCOP = Math.round(dailyAux * Math.max(1, totalHours / 8));

  const totalLaborCalculatedCOP =
    regularPayCOP +
    nightRegularPayCOP +
    dayOvertimePayCOP +
    nightOvertimePayCOP +
    sundayHolidayPayCOP;

  return {
    totalHours,
    regularHours,
    nightRegularHours,
    daytimeOvertimeHours,
    nighttimeOvertimeHours,
    sundayHolidayRegularHours,
    sundayHolidayNightHours,
    sundayHolidayDayOvertimeHours,
    sundayHolidayNightOvertimeHours,
    sundayHolidayHours: totalSundayHolidayHours,
    isSundayOrHoliday: isSpecial || totalSundayHolidayHours > 0,
    holidayName: specialDayInfo.label,
    regularPayCOP,
    nightRegularPayCOP,
    dayOvertimePayCOP,
    nightOvertimePayCOP,
    sundayHolidayRegularPayCOP,
    sundayHolidayNightPayCOP,
    sundayHolidayDayOvertimePayCOP,
    sundayHolidayNightOvertimePayCOP,
    sundayHolidayPayCOP,
    auxilioTransporteTripCOP,
    totalLaborCalculatedCOP
  };
}

/**
 * Resultado del costo patronal completo de un turno/trabajo clasificado.
 * Complementa calculateTripLaborFromSchedule con los cargos del empleador
 * (prestaciones, seguridad social, parafiscales y dotación), de modo que la
 * liquidación real sea comparable con el presupuesto (misma metodología).
 */
export interface ShiftEmployerCost {
  hoursBreakdown: CalculatedTripShiftBreakdown;
  ordinaryPayCOP: number;      // HOD + HON + HDF + HDFN (salarial: genera cargos patronales)
  extrasPayCOP: number;        // HED + HEN + HEFD + HEFN (según tarifas de la base de datos)
  auxilioTransporteCOP: number;
  devengadoCOP: number;        // ordinary + extras + auxilio
  prestacionesCOP: number;
  seguridadSocialCOP: number;
  parafiscalesCOP: number;
  dotacionCOP: number;
  totalEmployerCostCOP: number; // devengado + todos los cargos patronales
  extrasAreLoaded: boolean;     // true si las tarifas de extras ya traen factor prestacional
}

/**
 * Calcula el costo patronal TOTAL de un turno ya clasificado por
 * calculateTripLaborFromSchedule, agregando los cargos del empleador con las
 * bases legales correctas:
 * - Prestaciones/SSO/parafiscales sobre la parte salarial del devengado.
 * - Las horas extras solo generan cargos cuando su tarifa NO viene "cargada"
 *   con factor prestacional (si ya lo trae, sería doble conteo).
 * - Auxilio de transporte solo si el salario mensual es hasta 2 SMMLV.
 */
export function calculateShiftEmployerCost(
  shift: CalculatedTripShiftBreakdown,
  labor: LaborConfig,
  opts: {
    monthlySalary: number;
    hourlyOrdRate: number;
    dayExtRate: number;
    nightExtRate: number;
    arlRate?: number;
  }
): ShiftEmployerCost {
  const smmlv = labor.smmlv || defaultLaborConfig.smmlv;

  // Parte salarial del devengado (ordinarias + recargos ordinarios y festivos)
  const ordinaryPayCOP =
    shift.regularPayCOP +
    shift.nightRegularPayCOP +
    shift.sundayHolidayRegularPayCOP +
    shift.sundayHolidayNightPayCOP;

  // Horas extras (se pagan aparte, con las tarifas de la base de datos)
  const extrasPayCOP =
    shift.dayOvertimePayCOP +
    shift.nightOvertimePayCOP +
    shift.sundayHolidayDayOvertimePayCOP +
    shift.sundayHolidayNightOvertimePayCOP;

  // Detección de tarifas "cargadas" (factor prestacional incluido en la BD)
  const extrasAreLoaded =
    isLoadedOvertimeRate(opts.dayExtRate, opts.hourlyOrdRate, 0.25) ||
    isLoadedOvertimeRate(opts.nightExtRate, opts.hourlyOrdRate, 0.75);

  // Auxilio de transporte: solo para salarios hasta 2 SMMLV
  const auxilioTransporteCOP =
    opts.monthlySalary <= (smmlv * 2) ? shift.auxilioTransporteTripCOP : 0;

  const charges = computeEmployerCharges({
    salariedBase: ordinaryPayCOP + (extrasAreLoaded ? 0 : extrasPayCOP),
    auxilioTransporte: auxilioTransporteCOP,
    monthlySalary: opts.monthlySalary,
    arlRate: opts.arlRate ?? labor.arlRiskLevelRate,
    labor,
    proratedDays: Math.max(1, shift.totalHours / 8),
    applyDotacion: true
  });

  const devengadoCOP = ordinaryPayCOP + extrasPayCOP + auxilioTransporteCOP;
  const totalEmployerCostCOP = devengadoCOP + charges.totalCharges;

  return {
    hoursBreakdown: shift,
    ordinaryPayCOP,
    extrasPayCOP,
    auxilioTransporteCOP,
    devengadoCOP,
    prestacionesCOP: charges.totalPrestaciones,
    seguridadSocialCOP: charges.totalSeguridadSocial,
    parafiscalesCOP: charges.totalParafiscales,
    dotacionCOP: charges.dotacion,
    totalEmployerCostCOP,
    extrasAreLoaded
  };
}
