import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  CalendarDays,
  Clock,
  Save,
  Sparkles,
  Trash2,
  AlertTriangle,
  Moon,
  Sun,
  SunMoon,
  BadgeCheck
} from 'lucide-react';
import { formatCOP } from '../utils/costCalculator';
import {
  StaffAttendanceRecord,
  DailyAttendanceEntry,
  DailyNoveltyType,
  DAILY_NOVELTY_LABELS,
  WORKED_NOVELTIES,
  getMonthDates,
  computeLateMinutes,
  syncRecordWithDailyEntries,
  calculateStaffMonthlyEmployerCost,
  getMemberHourlyRates,
  timeToMinutes
} from '../data/monthlyStaffAttendance';
import {
  isColombianHoliday,
  getStoredWorkSchedule,
  WorkScheduleConfig,
  DailyWorkSchedule
} from '../data/colombiaHolidays';
import { LaborConfig } from '../types/logistics';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ALL_NOVELTIES: DailyNoveltyType[] = [
  'TRABAJO_NORMAL', 'LLEGADA_TARDE', 'SALIDA_TEMPRANO', 'HORAS_EXTRA',
  'DOMINGO_TRABAJADO', 'FESTIVO_TRABAJADO', 'INCAPACIDAD', 'VACACIONES',
  'PERMISO', 'DESCANSO', 'OTRO'
];

interface StaffDailyAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: StaffAttendanceRecord | null;
  yearMonth: string; // YYYY-MM
  laborConfig: LaborConfig;
  onSave: (memberId: string, updates: Partial<StaffAttendanceRecord>) => void;
}

function addMinutes(hhmm: string, minutes: number): string {
  const total = timeToMinutes(hhmm) + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface DayMeta {
  date: string;
  dayNumber: number;
  dayOfWeek: number;
  holidayName?: string;
  dayConfig?: DailyWorkSchedule;
}

export const StaffDailyAttendanceModal: React.FC<StaffDailyAttendanceModalProps> = ({
  isOpen,
  onClose,
  record,
  yearMonth,
  laborConfig,
  onSave
}) => {
  const [entries, setEntries] = useState<DailyAttendanceEntry[]>([]);
  const schedule: WorkScheduleConfig = useMemo(() => getStoredWorkSchedule(), [isOpen]);

  const daysMeta: DayMeta[] = useMemo(() => {
    if (!isOpen) return [];
    return getMonthDates(yearMonth).map(date => {
      const [y, m, d] = date.split('-').map(Number);
      const js = new Date(y, m - 1, d);
      const holiday = isColombianHoliday(date);
      const dayConfig = schedule.dailySchedules?.find(dd => dd.dayOfWeek === js.getDay());
      return {
        date,
        dayNumber: d,
        dayOfWeek: js.getDay(),
        holidayName: holiday.isHoliday ? holiday.holidayName : undefined,
        dayConfig
      };
    });
  }, [yearMonth, isOpen, schedule]);

  // Cargar entradas existentes al abrir
  useEffect(() => {
    if (isOpen && record) {
      const existing = record.dailyEntries || [];
      const map = new Map(existing.map(e => [e.date, e]));
      // Construir la lista completa del mes preservando lo registrado
      const full = getMonthDates(yearMonth).map(date => {
        if (map.has(date)) return map.get(date)!;
        const meta = daysMeta.find(d => d.date === date);
        if (meta?.dayConfig?.isEnabled) {
          return {
            date,
            checkIn: meta.dayConfig.startTime,
            checkOut: addMinutes(meta.dayConfig.startTime, (meta.dayConfig.standardHours || 8) * 60),
            noveltyType: 'TRABAJO_NORMAL' as DailyNoveltyType,
            lateMinutes: 0
          };
        }
        return { date, noveltyType: 'DESCANSO' as DailyNoveltyType };
      });
      setEntries(full);
    }
  }, [isOpen, record?.id, yearMonth]);

  if (!isOpen || !record) return null;

  const rates = getMemberHourlyRates(record, laborConfig);

  // ===== Actualizadores =====
  const updateEntry = (date: string, updates: Partial<DailyAttendanceEntry>) => {
    setEntries(prev => prev.map(e => {
      if (e.date !== date) return e;
      const next: DailyAttendanceEntry = { ...e, ...updates };
      // Detectar llegada tarde automáticamente contra el cronograma del día
      if (updates.checkIn !== undefined && next.checkIn) {
        const late = computeLateMinutes(date, next.checkIn, schedule);
        next.lateMinutes = late;
        if (late > 0 && (e.noveltyType === 'TRABAJO_NORMAL' || e.noveltyType === 'LLEGADA_TARDE' || e.noveltyType === 'SALIDA_TEMPRANO')) {
          next.noveltyType = 'LLEGADA_TARDE';
        } else if (late === 0 && e.noveltyType === 'LLEGADA_TARDE') {
          next.noveltyType = 'TRABAJO_NORMAL';
        }
      }
      if (next.noveltyType === 'LLEGADA_TARDE' && next.lateMinutes && next.lateMinutes > 0 && !next.notes) {
        next.notes = `Llegó ${next.lateMinutes} min tarde`;
      }
      return next;
    }));
  };

  // ===== Resumen en vivo =====
  const liveRecord: StaffAttendanceRecord = useMemo(() => {
    const base: StaffAttendanceRecord = { ...record, dailyEntries: entries };
    return syncRecordWithDailyEntries(base);
  }, [record, entries]);

  const liveBreakdown = useMemo(
    () => calculateStaffMonthlyEmployerCost(liveRecord, laborConfig, 0),
    [liveRecord, laborConfig]
  );
  const hd = liveBreakdown.hoursDetail;

  const workedCount = entries.filter(
    e => WORKED_NOVELTIES.includes(e.noveltyType) && e.checkIn && e.checkOut
  ).length;
  const novedadesCount = entries.filter(
    e => e.noveltyType !== 'TRABAJO_NORMAL' && e.noveltyType !== 'DESCANSO' && e.noveltyType !== 'OTRO'
  ).length;
  const lateTotal = entries.reduce((acc, e) => acc + (Number(e.lateMinutes) || 0), 0);

  const handleSave = () => {
    const synced = syncRecordWithDailyEntries({ ...record, dailyEntries: entries });
    onSave(record.memberId, {
      dailyEntries: entries,
      daysWorked: synced.daysWorked,
      attendedFullMonth: synced.attendedFullMonth
    });
    onClose();
  };

  const handleClear = () => {
    if (confirm('¿Borrar el calendario diario de esta persona? El cálculo volverá al modo simple por días trabajados.')) {
      onSave(record.memberId, { dailyEntries: undefined });
      onClose();
    }
  };

  const handleGenerateFromSchedule = () => {
    const full = daysMeta.map(meta => {
      if (meta.dayConfig?.isEnabled) {
        return {
          date: meta.date,
          checkIn: meta.dayConfig.startTime,
          checkOut: addMinutes(meta.dayConfig.startTime, (meta.dayConfig.standardHours || 8) * 60),
          noveltyType: (meta.holidayName ? 'FESTIVO_TRABAJADO' : 'TRABAJO_NORMAL') as DailyNoveltyType,
          lateMinutes: 0,
          notes: meta.holidayName
        };
      }
      return { date: meta.date, noveltyType: 'DESCANSO' as DailyNoveltyType, notes: meta.holidayName };
    });
    setEntries(full);
  };

  const [yearNum, monthNum] = yearMonth.split('-').map(Number);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Cabecera */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center shadow-lg">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div className="pr-8">
              <h3 className="font-bold text-lg text-white">
                Calendario Diario · {record.memberName}
              </h3>
              <p className="text-xs text-slate-300">
                {MONTH_NAMES[(monthNum || 1) - 1]} {yearNum} · {record.role} · CC {record.document}
                {' · '}Hora ordinaria {formatCOP(rates.ordinary)} · Extra diurna {formatCOP(rates.dayExt)} · Extra nocturna {formatCOP(rates.nightExt)}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 max-w-3xl">
            Registra la entrada y salida real de cada día. El sistema clasifica las horas según el CST
            (ordinarias, nocturnas +35%, dominicales/festivas +75% y extras) con el cronograma laboral y el
            calendario de festivos. Si alguien trabajó un domingo o festivo, queda liquidado con su recargo.
          </p>
        </div>

        {/* Barra de acciones */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleGenerateFromSchedule}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Llena el mes con las horas pactadas del cronograma; luego ajusta días reales"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generar según cronograma</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Borrar calendario</span>
          </button>
          <span className="ml-auto text-slate-500 flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
            {workedCount} días con jornada registrada
            {lateTotal > 0 && (
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {lateTotal} min de retraso
              </span>
            )}
          </span>
        </div>

        {/* Tabla de días */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                  <th className="px-2 py-2 text-left">Día</th>
                  <th className="px-2 py-2 text-left">Tipo de día</th>
                  <th className="px-2 py-2 text-left">Entrada</th>
                  <th className="px-2 py-2 text-left">Salida</th>
                  <th className="px-2 py-2 text-left">Novedad</th>
                  <th className="px-2 py-2 text-left">Observación</th>
                </tr>
              </thead>
              <tbody>
                {daysMeta.map(meta => {
                  const entry = entries.find(e => e.date === meta.date) || { date: meta.date, noveltyType: 'DESCANSO' as DailyNoveltyType };
                  const isWorkable = Boolean(meta.dayConfig?.isEnabled);
                  const isRest = !isWorkable;
                  const crossesMidnight = Boolean(entry.checkIn && entry.checkOut && timeToMinutes(entry.checkOut) <= timeToMinutes(entry.checkIn));
                  const late = Number(entry.lateMinutes) || 0;

                  return (
                    <tr
                      key={meta.date}
                      className={`border-t border-slate-100 ${
                        meta.holidayName
                          ? 'bg-purple-50/70'
                          : isRest
                            ? 'bg-slate-50/60'
                            : 'bg-white'
                      } hover:bg-blue-50/40 transition-colors`}
                    >
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{meta.dayNumber}</span>
                        <span className="ml-1 text-slate-400">{WEEKDAYS_SHORT[meta.dayOfWeek]}</span>
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        {meta.holidayName ? (
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[10px]">
                            🎉 {meta.holidayName}
                          </span>
                        ) : isRest ? (
                          <span className="text-slate-400 text-[10px]">Descanso</span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">
                            {meta.dayConfig?.startTime} · {meta.dayConfig?.standardHours}h
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="time"
                          value={entry.checkIn || ''}
                          onChange={ev => updateEntry(meta.date, { checkIn: ev.target.value || undefined })}
                          className="px-1.5 py-1 border border-slate-300 rounded-lg text-[11px] font-mono bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none w-[92px]"
                        />
                        {late > 0 && (
                          <div className="text-[9px] text-amber-700 font-bold mt-0.5">+{late} min tarde</div>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="time"
                          value={entry.checkOut || ''}
                          onChange={ev => updateEntry(meta.date, { checkOut: ev.target.value || undefined })}
                          className="px-1.5 py-1 border border-slate-300 rounded-lg text-[11px] font-mono bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none w-[92px]"
                        />
                        {crossesMidnight && (
                          <div className="text-[9px] text-blue-700 font-bold mt-0.5">Cruza medianoche → día sig.</div>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <select
                          value={entry.noveltyType}
                          onChange={ev => updateEntry(meta.date, { noveltyType: ev.target.value as DailyNoveltyType })}
                          className={`px-1.5 py-1 border rounded-lg text-[10px] font-bold bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                            entry.noveltyType === 'LLEGADA_TARDE'
                              ? 'border-amber-300 text-amber-800'
                              : entry.noveltyType === 'DOMINGO_TRABAJADO' || entry.noveltyType === 'FESTIVO_TRABAJADO'
                                ? 'border-purple-300 text-purple-800'
                                : entry.noveltyType === 'INCAPACIDAD' || entry.noveltyType === 'VACACIONES' || entry.noveltyType === 'PERMISO'
                                  ? 'border-rose-200 text-rose-700'
                                  : 'border-slate-300 text-slate-700'
                          }`}
                        >
                          {ALL_NOVELTIES.map(n => (
                            <option key={n} value={n}>{DAILY_NOVELTY_LABELS[n]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          value={entry.notes || ''}
                          onChange={ev => updateEntry(meta.date, { notes: ev.target.value })}
                          placeholder="Observación de la novedad..."
                          className="px-1.5 py-1 border border-slate-200 rounded-lg text-[10px] bg-white w-full min-w-[140px] focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen en vivo del mes */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 space-y-3">
          {hd ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-[10px]">
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-slate-500 font-bold"><Sun className="w-3 h-3" />HOD</div>
                  <div className="font-black text-slate-900 text-sm">{hd.hodHours}h</div>
                  <div className="text-slate-400">Ordinaria</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-indigo-200">
                  <div className="flex items-center justify-center gap-1 text-indigo-500 font-bold"><Moon className="w-3 h-3" />HON</div>
                  <div className="font-black text-indigo-900 text-sm">{hd.honHours}h</div>
                  <div className="text-slate-400">Nocturna +35%</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-amber-200">
                  <div className="flex items-center justify-center gap-1 text-amber-600 font-bold"><Clock className="w-3 h-3" />HED</div>
                  <div className="font-black text-amber-900 text-sm">{hd.hedHours}h</div>
                  <div className="text-slate-400">Extra diurna</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-300">
                  <div className="flex items-center justify-center gap-1 text-slate-600 font-bold"><SunMoon className="w-3 h-3" />HEN</div>
                  <div className="font-black text-slate-900 text-sm">{hd.henHours}h</div>
                  <div className="text-slate-400">Extra nocturna</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-purple-200">
                  <div className="text-purple-500 font-bold">HDF</div>
                  <div className="font-black text-purple-900 text-sm">{hd.hdfHours}h</div>
                  <div className="text-slate-400">Festiva +75%</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-purple-200">
                  <div className="text-purple-500 font-bold">HDFN</div>
                  <div className="font-black text-purple-900 text-sm">{hd.hdfnHours}h</div>
                  <div className="text-slate-400">Fest. nocturna</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-purple-300">
                  <div className="text-purple-600 font-bold">HEFD</div>
                  <div className="font-black text-purple-900 text-sm">{hd.hefdHours}h</div>
                  <div className="text-slate-400">Extra festiva</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-purple-300">
                  <div className="text-purple-600 font-bold">HEFN</div>
                  <div className="font-black text-purple-900 text-sm">{hd.hefnHours}h</div>
                  <div className="text-slate-400">Extra fest. noct.</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-slate-700 bg-white rounded-xl border border-slate-200 px-3 py-2">
                <span>Recargo nocturno: <strong className="font-mono">{formatCOP(hd.nightSurchargeCOP)}</strong></span>
                <span>Recargo dominical/festivo: <strong className="font-mono">{formatCOP(hd.holidaySurchargeCOP + hd.holidayNightSurchargeCOP)}</strong></span>
                <span>Horas extras: <strong className="font-mono">{formatCOP(hd.extrasCOP)}</strong>
                  <span className="text-[9px] text-slate-400 ml-1">
                    {hd.extrasAreLoaded ? '(tarifas BD con factor prestacional)' : '(con cargos patronales)'}
                  </span>
                </span>
                {novedadesCount > 0 && (
                  <span className="text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {novedadesCount} novedades registradas
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-gradient-to-r from-blue-950 to-slate-900 text-white rounded-xl px-4 py-2.5">
                <span className="font-semibold">
                  Costo empresa estimado del mes ({liveBreakdown.daysWorked} días · {hd.totalHours}h clasificadas)
                </span>
                <span className="font-black text-lg font-mono">{formatCOP(liveBreakdown.totalEmployerMonthlyCost)}</span>
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-500 text-center py-2">
              Sin jornadas registradas: el cálculo del mes usará el modo simple por días trabajados ({liveBreakdown.daysWorked} días).
            </div>
          )}
        </div>

        {/* Pie: guardar / cancelar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200/60 rounded-xl font-bold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/25 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Calendario del Mes</span>
          </button>
        </div>

      </div>
    </div>
  );
};
