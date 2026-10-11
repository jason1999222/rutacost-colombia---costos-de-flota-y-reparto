import { toast } from 'sonner';
import { defaultLaborConfig } from '../data/laborDefaults';
import React, { useState, useEffect } from 'react';
import {
  Fuel,
  Wrench,
  Receipt,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ShieldCheck,
  Info,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Sliders,
  DollarSign,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Search,
  Edit2,
  X,
  Users,
  Truck,
  Scale,
  Building2,
  Percent,
  Settings
} from 'lucide-react';
import {
  COLOMBIA_HOLIDAYS_2026,
  DEFAULT_WORK_SCHEDULE,
  WorkScheduleConfig,
  DailyWorkSchedule,
  getStoredWorkSchedule,
  saveStoredWorkSchedule,
  HolidayInfo,
  getCustomHolidays,
  addCustomHoliday,
  removeCustomHoliday,
  resetCustomHolidays,
  isColombianHoliday,
  isSundayDate,
  isSundayOrColombianHoliday,
  calculateTripLaborFromSchedule,
  CalculatedTripShiftBreakdown
} from '../data/colombiaHolidays';
import {
  KNOWN_TOLLS,
  TollStation,
  getCustomTollStations,
  saveCustomTollStations,
  resetCustomTollStations
} from '../data/colombiaTolls';
import { formatCOP } from '../utils/costCalculator';
import { LaborConfig, VehicleProfile } from '../types/logistics';

interface CalculationBasisConfigProps {
  laborConfig: LaborConfig;
  onUpdateLaborConfig: (newLabor: LaborConfig) => void;
  selectedVehicle: VehicleProfile;
  vehicles?: VehicleProfile[];
  onUpdateVehicle?: (newVehicle: VehicleProfile) => void;
}

type BasisTab = 'schedule_and_overtime' | 'holidays_calendar' | 'fuel_and_maintenance' | 'tolls_2026' | 'labor_tester';

export const CalculationBasisConfig: React.FC<CalculationBasisConfigProps> = ({
  laborConfig,
  onUpdateLaborConfig,
  selectedVehicle,
  vehicles = [],
  onUpdateVehicle
}) => {
  const [activeTab, setActiveTab] = useState<BasisTab>('schedule_and_overtime');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Horario de Trabajo Editable y Persistente con Distribución Día por Día
  const [scheduleConfig, setScheduleConfig] = useState<WorkScheduleConfig>(() => {
    return getStoredWorkSchedule();
  });

  // Cálculo de hora de fin a partir de hora de inicio y duración ordinaria
  const computeEndTime = (startTime: string, hours: number): string => {
    if (!startTime) return '14:00';
    const [hStr, mStr] = startTime.split(':');
    let h = parseInt(hStr, 10) || 6;
    let m = parseInt(mStr, 10) || 0;
    const totalMinutes = h * 60 + m + Math.round((Number(hours) || 0) * 60);
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  // Cambiar configuración de un día específico
  const handleDayScheduleChange = (dayOfWeek: number, field: keyof DailyWorkSchedule, value: any) => {
    const currentList = scheduleConfig.dailySchedules && scheduleConfig.dailySchedules.length > 0
      ? scheduleConfig.dailySchedules
      : (DEFAULT_WORK_SCHEDULE.dailySchedules || []);
    const updatedList = currentList.map(item => {
      if (item.dayOfWeek === dayOfWeek) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'startTime' || field === 'standardHours') {
          const st = field === 'startTime' ? value : updatedItem.startTime;
          const hrs = field === 'standardHours' ? Number(value) : updatedItem.standardHours;
          updatedItem.endTime = computeEndTime(st, hrs);
        }
        return updatedItem;
      }
      return item;
    });
    const updatedConfig: WorkScheduleConfig = {
      ...scheduleConfig,
      dailySchedules: updatedList
    };
    setScheduleConfig(updatedConfig);
    saveStoredWorkSchedule(updatedConfig);
  };

  // Handlers de Parametrización Manual de Horarios y Recargos
  const handleWeeklyTargetHoursChange = (targetHours: number) => {
    const val = Number(targetHours) || 42;
    const updated: WorkScheduleConfig = {
      ...scheduleConfig,
      weeklyTargetHours: val
    };
    setScheduleConfig(updated);
    saveStoredWorkSchedule(updated);
  };

  // Sincronización múltiple centralizada y reactiva de cualquier parámetro de nómina y costos laborales
  const updateLaborMultipleFields = (updates: Partial<typeof laborForm>) => {
    setLaborForm(prev => {
      const next = { ...prev, ...updates };

      const mHrs = Number(next.monthlyWorkingHours) || defaultLaborConfig.monthlyWorkingHours;
      const dayExtFactor = 1 + (scheduleConfig.dayOvertimeSurchargeRate ?? 0.25);
      const nightExtFactor = 1 + (scheduleConfig.nightOvertimeSurchargeRate ?? 0.75);
      const nightOrdFactor = 1 + (scheduleConfig.nightSurchargeRate ?? 0.35);
      const sunHolFactor = 1 + (scheduleConfig.sundayHolidaySurchargeRate ?? 0.75);
      const sunHolNightFactor = 1 + (scheduleConfig.sundayHolidaySurchargeRate ?? 0.75) + (scheduleConfig.nightSurchargeRate ?? 0.35);
      const sunHolDayExtFactor = 1 + (scheduleConfig.sundayHolidayOvertimeDayRate ?? 1.00);
      const sunHolNightExtFactor = 1 + (scheduleConfig.sundayHolidayOvertimeNightRate ?? 1.50);

      // Si cambió el sueldo o el divisor y no se pasó una tarifa explícita, recalcular H.O., H.E.D. y H.E.N.
      if (('driverSalary' in updates || 'monthlyWorkingHours' in updates) && !('hourlyOrdinaryRate' in updates)) {
        const dSal = Number(next.driverSalary) || 0;
        const newOrd = Math.round(dSal / mHrs);
        next.hourlyOrdinaryRate = newOrd;
        if (!('hourlyOvertimeDayRate' in updates)) next.hourlyOvertimeDayRate = Math.round(newOrd * dayExtFactor);
        if (!('hourlyOvertimeNightRate' in updates)) next.hourlyOvertimeNightRate = Math.round(newOrd * nightExtFactor);
      }

      if (('helperSalary' in updates || 'monthlyWorkingHours' in updates) && !('helperHourlyOrdinaryRate' in updates)) {
        const hSal = Number(next.helperSalary) || 0;
        const newOrd = Math.round(hSal / mHrs);
        next.helperHourlyOrdinaryRate = newOrd;
        if (!('helperOvertimeDayRate' in updates)) next.helperOvertimeDayRate = Math.round(newOrd * dayExtFactor);
        if (!('helperOvertimeNightRate' in updates)) next.helperOvertimeNightRate = Math.round(newOrd * nightExtFactor);
      }

      const ordRate = Number(next.hourlyOrdinaryRate) || 0;
      const helperOrdRate = Number(next.helperHourlyOrdinaryRate) || 0;

      const updatedLaborConfig: LaborConfig = {
        ...laborConfig,
        // Conductor
        driverSalary: Number(next.driverSalary),
        hourlyOrdinaryRate: ordRate,
        hourlyOvertimeDayRate: Number(next.hourlyOvertimeDayRate),
        hourlyOvertimeNightRate: Number(next.hourlyOvertimeNightRate),
        hourlyNightRate: Math.round(ordRate * nightOrdFactor),
        hourlyHolidayRate: Math.round(ordRate * sunHolFactor),
        hourlyHolidayNightRate: Math.round(ordRate * sunHolNightFactor),
        hourlyHolidayOvertimeDayRate: Math.round(ordRate * sunHolDayExtFactor),
        hourlyHolidayOvertimeNightRate: Math.round(ordRate * sunHolNightExtFactor),
        arlRiskLevelRate: Number(next.arlRiskLevelRate),

        // Auxiliar
        hasHelper: Boolean(next.hasHelper),
        helperSalary: Number(next.helperSalary),
        helperHourlyOrdinaryRate: helperOrdRate,
        helperOvertimeDayRate: Number(next.helperOvertimeDayRate),
        helperOvertimeNightRate: Number(next.helperOvertimeNightRate),
        helperHourlyNightRate: Math.round(helperOrdRate * nightOrdFactor),
        helperHourlyHolidayRate: Math.round(helperOrdRate * sunHolFactor),
        helperHourlyHolidayNightRate: Math.round(helperOrdRate * sunHolNightFactor),
        helperHourlyHolidayOvertimeDayRate: Math.round(helperOrdRate * sunHolDayExtFactor),
        helperHourlyHolidayOvertimeNightRate: Math.round(helperOrdRate * sunHolNightExtFactor),
        arlRiskLevelRateHelper: Number(next.arlRiskLevelRateHelper),

        // Parámetros Legales Generales
        smmlv: Number(next.smmlv),
        auxilioTransporteLegal: Number(next.auxilioTransporteLegal),
        dailyViaticosPerPerson: Number(next.dailyViaticosPerPerson),
        standardHoursPerDay: Number(next.standardHoursPerDay),
        monthlyWorkingHours: mHrs,
        monthlyDotacionPerPerson: Number(next.monthlyDotacionPerPerson),
        fixedShiftStartTime: scheduleConfig.normalShiftStartTime,
        fixedShiftEndTime: scheduleConfig.normalShiftEndTime,

        // Fiscales y Prestacionales
        isTaxExemptLey1607: Boolean(next.isTaxExemptLey1607),
        primaServiciosRate: Number(next.primaServiciosRate),
        cesantiasRate: Number(next.cesantiasRate),
        interesesCesantiasRate: Number(next.interesesCesantiasRate),
        vacacionesRate: Number(next.vacacionesRate),
        pensionRate: Number(next.pensionRate),
        saludRate: Number(next.saludRate),
        cajaCompensacionRate: Number(next.cajaCompensacionRate),
        senaRate: Number(next.senaRate),
        icbfRate: Number(next.icbfRate),

        // Recargos
        dayOvertimeSurcharge: scheduleConfig.dayOvertimeSurchargeRate ?? 0.25,
        nightOvertimeSurcharge: scheduleConfig.nightOvertimeSurchargeRate ?? 0.75,
        nightSurchargeRate: scheduleConfig.nightSurchargeRate ?? 0.35,
        sundayHolidaySurchargeRate: scheduleConfig.sundayHolidaySurchargeRate ?? 0.75,
        holidayOvertimeDaySurchargeRate: scheduleConfig.sundayHolidayOvertimeDayRate ?? 1.00,
        holidayOvertimeNightSurchargeRate: scheduleConfig.sundayHolidayOvertimeNightRate ?? 1.50
      };

      onUpdateLaborConfig(updatedLaborConfig);
      localStorage.setItem('scj_labor_config', JSON.stringify(updatedLaborConfig));
      localStorage.setItem('rutacost_labor', JSON.stringify(updatedLaborConfig));
      window.dispatchEvent(new CustomEvent('scj_labor_config_updated', { detail: updatedLaborConfig }));

      return next;
    });
  };

  // Actualización reactiva e inmediata de cualquier campo individual laboral y fiscal
  const updateLaborField = (field: keyof typeof laborForm, value: any) => {
    updateLaborMultipleFields({ [field]: value });
  };

  const handleMonthlyWorkingHoursChange = (hours: number) => {
    const val = Number(hours) || defaultLaborConfig.monthlyWorkingHours;
    const updated: WorkScheduleConfig = {
      ...scheduleConfig,
      monthlyWorkingHours: val
    };
    setScheduleConfig(updated);
    saveStoredWorkSchedule(updated);
    updateLaborMultipleFields({ monthlyWorkingHours: val });
  };

  const handleAutoCalculateDivisor = () => {
    const target = Number(scheduleConfig.weeklyTargetHours) || 42;
    const calculatedDivisor = Math.round((target / 6) * 30);
    handleMonthlyWorkingHoursChange(calculatedDivisor);
    showToast(`✓ Divisor mensual actualizado a ${calculatedDivisor} h/mes según jornada de ${target}h semanales (( ${target} ÷ 6 ) × 30).`);
  };

  const handleSurchargePercentChange = (
    field: 'dayOvertimeSurchargeRate' | 'nightOvertimeSurchargeRate' | 'nightSurchargeRate' | 'sundayHolidaySurchargeRate' | 'sundayHolidayOvertimeDayRate' | 'sundayHolidayOvertimeNightRate',
    percent: number
  ) => {
    const rate = (Number(percent) || 0) / 100;
    const updated: WorkScheduleConfig = {
      ...scheduleConfig,
      [field]: rate
    };
    setScheduleConfig(updated);
    saveStoredWorkSchedule(updated);

    let newDayExtraDriver = laborForm.hourlyOvertimeDayRate;
    let newDayExtraHelper = laborForm.helperOvertimeDayRate;
    let newNightExtraDriver = laborForm.hourlyOvertimeNightRate;
    let newNightExtraHelper = laborForm.helperOvertimeNightRate;

    if (field === 'dayOvertimeSurchargeRate') {
      const dayFactor = 1 + rate;
      newDayExtraDriver = Math.round((Number(laborForm.hourlyOrdinaryRate) || 0) * dayFactor);
      newDayExtraHelper = Math.round((Number(laborForm.helperHourlyOrdinaryRate) || 0) * dayFactor);
      setLaborForm(prev => ({
        ...prev,
        hourlyOvertimeDayRate: newDayExtraDriver,
        helperOvertimeDayRate: newDayExtraHelper
      }));
    } else if (field === 'nightOvertimeSurchargeRate') {
      const nightFactor = 1 + rate;
      newNightExtraDriver = Math.round((Number(laborForm.hourlyOrdinaryRate) || 0) * nightFactor);
      newNightExtraHelper = Math.round((Number(laborForm.helperHourlyOrdinaryRate) || 0) * nightFactor);
      setLaborForm(prev => ({
        ...prev,
        hourlyOvertimeNightRate: newNightExtraDriver,
        helperOvertimeNightRate: newNightExtraHelper
      }));
    }

    const updatedLaborConfig: LaborConfig = {
      ...laborConfig,
      dayOvertimeSurcharge: updated.dayOvertimeSurchargeRate ?? 0.25,
      nightOvertimeSurcharge: updated.nightOvertimeSurchargeRate ?? 0.75,
      nightSurchargeRate: updated.nightSurchargeRate ?? 0.35,
      sundayHolidaySurchargeRate: updated.sundayHolidaySurchargeRate ?? 0.75,
      holidayOvertimeDaySurchargeRate: updated.sundayHolidayOvertimeDayRate ?? 1.00,
      holidayOvertimeNightSurchargeRate: updated.sundayHolidayOvertimeNightRate ?? 1.50,
      hourlyOvertimeDayRate: newDayExtraDriver,
      helperOvertimeDayRate: newDayExtraHelper,
      hourlyOvertimeNightRate: newNightExtraDriver,
      helperOvertimeNightRate: newNightExtraHelper
    };
    onUpdateLaborConfig(updatedLaborConfig);
    localStorage.setItem('scj_work_schedule', JSON.stringify(updated));
    localStorage.setItem('scj_labor_config', JSON.stringify(updatedLaborConfig));
    localStorage.setItem('rutacost_labor', JSON.stringify(updatedLaborConfig));
    window.dispatchEvent(new CustomEvent('scj_labor_config_updated', { detail: updatedLaborConfig }));
  };

  const handleNightWindowChange = (field: 'nightHoursStartTime' | 'nightHoursEndTime', val: string) => {
    const updated: WorkScheduleConfig = {
      ...scheduleConfig,
      [field]: val
    };
    setScheduleConfig(updated);
    saveStoredWorkSchedule(updated);
  };

  // Guardar exclusivamente el horario de trabajo y parámetros
  const handleSaveScheduleOnly = () => {
    saveStoredWorkSchedule(scheduleConfig);
    if (laborForm.monthlyWorkingHours && laborConfig.monthlyWorkingHours !== Number(laborForm.monthlyWorkingHours)) {
      onUpdateLaborConfig({
        ...laborConfig,
        monthlyWorkingHours: Number(laborForm.monthlyWorkingHours)
      });
    }
    showToast('✓ Parámetros de jornada, horas semanales y recargos guardados con éxito.');
  };

  // Suma total de horas ordinarias programadas en la semana
  const weeklyScheduledHours = Math.round(
    (((scheduleConfig.dailySchedules && scheduleConfig.dailySchedules.length > 0)
      ? scheduleConfig.dailySchedules
      : (DEFAULT_WORK_SCHEDULE.dailySchedules || [])
    ).reduce((acc, d) => {
      return acc + (d.isEnabled ? (Number(d.standardHours) || 0) : 0);
    }, 0)) * 10
  ) / 10;

  // 2. Parámetros Laborales, Conductor, Auxiliar y Gastos Fiscales Editables
  const [laborForm, setLaborForm] = useState({
    // Conductor
    driverSalary: laborConfig.driverSalary || 2200000,
    hourlyOrdinaryRate: laborConfig.hourlyOrdinaryRate || 8000,
    hourlyOvertimeDayRate: laborConfig.hourlyOvertimeDayRate || 17488,
    hourlyOvertimeNightRate: laborConfig.hourlyOvertimeNightRate || 23000,
    arlRiskLevelRate: laborConfig.arlRiskLevelRate || 0.0435,

    // Auxiliar
    hasHelper: laborConfig.hasHelper !== undefined ? laborConfig.hasHelper : false,
    helperSalary: laborConfig.helperSalary || defaultLaborConfig.smmlv,
    helperHourlyOrdinaryRate: laborConfig.helperHourlyOrdinaryRate || Math.round((laborConfig.helperSalary || defaultLaborConfig.smmlv) / (laborConfig.monthlyWorkingHours || defaultLaborConfig.monthlyWorkingHours)),
    helperOvertimeDayRate: laborConfig.helperOvertimeDayRate || Math.round(((laborConfig.helperSalary || defaultLaborConfig.smmlv) / (laborConfig.monthlyWorkingHours || defaultLaborConfig.monthlyWorkingHours)) * 1.25),
    helperOvertimeNightRate: laborConfig.helperOvertimeNightRate || Math.round(((laborConfig.helperSalary || defaultLaborConfig.smmlv) / (laborConfig.monthlyWorkingHours || defaultLaborConfig.monthlyWorkingHours)) * 1.75),
    arlRiskLevelRateHelper: laborConfig.arlRiskLevelRateHelper || 0.02436,

    // Parámetros Legales Generales Colombia 2026 (Ley 2101 de 2021: 42h semanales -> 210h/mes)
    smmlv: laborConfig.smmlv || defaultLaborConfig.smmlv,
    auxilioTransporteLegal: laborConfig.auxilioTransporteLegal || defaultLaborConfig.auxilioTransporteLegal,
    dailyViaticosPerPerson: laborConfig.dailyViaticosPerPerson || 50000,
    standardHoursPerDay: laborConfig.standardHoursPerDay || 8.0,
    monthlyWorkingHours: laborConfig.monthlyWorkingHours === 240 ? defaultLaborConfig.monthlyWorkingHours : (laborConfig.monthlyWorkingHours || defaultLaborConfig.monthlyWorkingHours),
    monthlyDotacionPerPerson: laborConfig.monthlyDotacionPerPerson || 65000,

    // Beneficio Tributario Ley 1607 / Art. 114-1 E.T. (Exoneración Salud 8.5%, SENA 2%, ICBF 3%)
    isTaxExemptLey1607: laborConfig.isTaxExemptLey1607 !== undefined ? laborConfig.isTaxExemptLey1607 : true,

    // Tasas Prestaciones Sociales CST
    primaServiciosRate: laborConfig.primaServiciosRate || 0.0833,
    cesantiasRate: laborConfig.cesantiasRate || 0.0833,
    interesesCesantiasRate: laborConfig.interesesCesantiasRate || 0.0100,
    vacacionesRate: laborConfig.vacacionesRate || 0.0417,

    // Tasas Seguridad Social Empleador
    pensionRate: laborConfig.pensionRate || 0.1200,
    saludRate: laborConfig.saludRate || 0.0850,

    // Tasas Parafiscales
    cajaCompensacionRate: laborConfig.cajaCompensacionRate || 0.0400,
    senaRate: laborConfig.senaRate || 0.0200,
    icbfRate: laborConfig.icbfRate || 0.0300
  });

  // Sincronizar laborForm si laborConfig cambia externamente
  useEffect(() => {
    setLaborForm(prev => ({
      ...prev,
      driverSalary: laborConfig.driverSalary || 2200000,
      hourlyOrdinaryRate: laborConfig.hourlyOrdinaryRate || 8000,
      hourlyOvertimeDayRate: laborConfig.hourlyOvertimeDayRate || 17488,
      hourlyOvertimeNightRate: laborConfig.hourlyOvertimeNightRate || 23000,
      arlRiskLevelRate: laborConfig.arlRiskLevelRate || 0.0435,
      hasHelper: laborConfig.hasHelper !== undefined ? laborConfig.hasHelper : false,
      helperSalary: laborConfig.helperSalary || defaultLaborConfig.smmlv,
      helperHourlyOrdinaryRate: laborConfig.helperHourlyOrdinaryRate || Math.round((laborConfig.helperSalary || defaultLaborConfig.smmlv) / (laborConfig.monthlyWorkingHours || defaultLaborConfig.monthlyWorkingHours)),
      helperOvertimeDayRate: laborConfig.helperOvertimeDayRate || Math.round(((laborConfig.helperSalary || defaultLaborConfig.smmlv) / (laborConfig.monthlyWorkingHours || defaultLaborConfig.monthlyWorkingHours)) * 1.25),
      helperOvertimeNightRate: laborConfig.helperOvertimeNightRate || Math.round(((laborConfig.helperSalary || defaultLaborConfig.smmlv) / (laborConfig.monthlyWorkingHours || defaultLaborConfig.monthlyWorkingHours)) * 1.75),
      arlRiskLevelRateHelper: laborConfig.arlRiskLevelRateHelper || 0.02436,
      smmlv: laborConfig.smmlv || defaultLaborConfig.smmlv,
      auxilioTransporteLegal: laborConfig.auxilioTransporteLegal || defaultLaborConfig.auxilioTransporteLegal,
      dailyViaticosPerPerson: laborConfig.dailyViaticosPerPerson || 50000,
      standardHoursPerDay: laborConfig.standardHoursPerDay || 8.0,
      monthlyWorkingHours: laborConfig.monthlyWorkingHours || defaultLaborConfig.monthlyWorkingHours,
      monthlyDotacionPerPerson: laborConfig.monthlyDotacionPerPerson || 65000,
      isTaxExemptLey1607: laborConfig.isTaxExemptLey1607 !== undefined ? laborConfig.isTaxExemptLey1607 : true,
      primaServiciosRate: laborConfig.primaServiciosRate || 0.0833,
      cesantiasRate: laborConfig.cesantiasRate || 0.0833,
      interesesCesantiasRate: laborConfig.interesesCesantiasRate || 0.0100,
      vacacionesRate: laborConfig.vacacionesRate || 0.0417,
      pensionRate: laborConfig.pensionRate || 0.1200,
      saludRate: laborConfig.saludRate || 0.0850,
      cajaCompensacionRate: laborConfig.cajaCompensacionRate || 0.0400,
      senaRate: laborConfig.senaRate || 0.0200,
      icbfRate: laborConfig.icbfRate || 0.0300
    }));
  }, [laborConfig]);

  // Funciones de Cálculo Automático y Reactivo de Horas con Difusión Global Inmediata
  const handleDriverOrdinaryRateChange = (newOrd: number) => {
    const dayExtFactor = 1 + (scheduleConfig.dayOvertimeSurchargeRate ?? 0.25);
    const nightExtFactor = 1 + (scheduleConfig.nightOvertimeSurchargeRate ?? 0.75);
    updateLaborMultipleFields({
      hourlyOrdinaryRate: newOrd,
      hourlyOvertimeDayRate: Math.round(newOrd * dayExtFactor),
      hourlyOvertimeNightRate: Math.round(newOrd * nightExtFactor)
    });
  };

  const handleHelperOrdinaryRateChange = (newOrd: number) => {
    const dayExtFactor = 1 + (scheduleConfig.dayOvertimeSurchargeRate ?? 0.25);
    const nightExtFactor = 1 + (scheduleConfig.nightOvertimeSurchargeRate ?? 0.75);
    updateLaborMultipleFields({
      helperHourlyOrdinaryRate: newOrd,
      helperOvertimeDayRate: Math.round(newOrd * dayExtFactor),
      helperOvertimeNightRate: Math.round(newOrd * nightExtFactor)
    });
  };

  const handleAutoCalculateDriverHourly = () => {
    const monthlyHrs = Number(laborForm.monthlyWorkingHours) || defaultLaborConfig.monthlyWorkingHours;
    const baseOrd = Math.round(Number(laborForm.driverSalary) / monthlyHrs);
    const dayExtFactor = 1 + (scheduleConfig.dayOvertimeSurchargeRate ?? 0.25);
    const nightExtFactor = 1 + (scheduleConfig.nightOvertimeSurchargeRate ?? 0.75);
    const dayExtPct = Math.round((scheduleConfig.dayOvertimeSurchargeRate ?? 0.25) * 100);
    const nightExtPct = Math.round((scheduleConfig.nightOvertimeSurchargeRate ?? 0.75) * 100);

    updateLaborMultipleFields({
      hourlyOrdinaryRate: baseOrd,
      hourlyOvertimeDayRate: Math.round(baseOrd * dayExtFactor),
      hourlyOvertimeNightRate: Math.round(baseOrd * nightExtFactor)
    });
    showToast(`✓ Tarifas calculadas para conductor (${monthlyHrs}h/mes): $${baseOrd.toLocaleString('es-CO')}/h (H.O.) | $${Math.round(baseOrd * dayExtFactor).toLocaleString('es-CO')}/h (H.E.D. +${dayExtPct}%) | $${Math.round(baseOrd * nightExtFactor).toLocaleString('es-CO')}/h (H.E.N. +${nightExtPct}%).`);
  };

  const handleApplyScjOfficialDriver = () => {
    updateLaborMultipleFields({
      hourlyOrdinaryRate: 10476,
      hourlyOvertimeDayRate: 13095,
      hourlyOvertimeNightRate: 18333
    });
    showToast('✓ Tarifas de referencia aplicadas al conductor ($10.476 / $13.095 / $18.333).');
  };

  const handleAutoCalculateHelperHourly = () => {
    const monthlyHrs = Number(laborForm.monthlyWorkingHours) || defaultLaborConfig.monthlyWorkingHours;
    const baseOrd = Math.round(Number(laborForm.helperSalary) / monthlyHrs);
    const dayExtFactor = 1 + (scheduleConfig.dayOvertimeSurchargeRate ?? 0.25);
    const nightExtFactor = 1 + (scheduleConfig.nightOvertimeSurchargeRate ?? 0.75);
    const dayExtPct = Math.round((scheduleConfig.dayOvertimeSurchargeRate ?? 0.25) * 100);
    const nightExtPct = Math.round((scheduleConfig.nightOvertimeSurchargeRate ?? 0.75) * 100);

    updateLaborMultipleFields({
      helperHourlyOrdinaryRate: baseOrd,
      helperOvertimeDayRate: Math.round(baseOrd * dayExtFactor),
      helperOvertimeNightRate: Math.round(baseOrd * nightExtFactor)
    });
    showToast(`✓ Tarifas calculadas para auxiliar (${monthlyHrs}h/mes): $${baseOrd.toLocaleString('es-CO')}/h (H.O.) | $${Math.round(baseOrd * dayExtFactor).toLocaleString('es-CO')}/h (H.E.D. +${dayExtPct}%) | $${Math.round(baseOrd * nightExtFactor).toLocaleString('es-CO')}/h (H.E.N. +${nightExtPct}%).`);
  };

  const handleApplySmmlv2026 = () => {
    const monthlyHrs = Number(laborForm.monthlyWorkingHours) || defaultLaborConfig.monthlyWorkingHours;
    const baseOrd = Math.round(defaultLaborConfig.smmlv / monthlyHrs);
    const dayExtFactor = 1 + (scheduleConfig.dayOvertimeSurchargeRate ?? 0.25);
    const nightExtFactor = 1 + (scheduleConfig.nightOvertimeSurchargeRate ?? 0.75);

    updateLaborMultipleFields({
      smmlv: defaultLaborConfig.smmlv,
      auxilioTransporteLegal: defaultLaborConfig.auxilioTransporteLegal,
      monthlyWorkingHours: monthlyHrs,
      helperSalary: defaultLaborConfig.helperSalary,
      helperHourlyOrdinaryRate: baseOrd,
      helperOvertimeDayRate: Math.round(baseOrd * dayExtFactor),
      helperOvertimeNightRate: Math.round(baseOrd * nightExtFactor)
    });
    showToast(`✓ Base SMMLV $1.750.905 aplicada con divisor de ${monthlyHrs}h/mes -> H.O. $${baseOrd.toLocaleString('es-CO')}/h.`);
  };

  // Guardar Parámetros Laborales y Horarios
  const handleSaveLabor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: LaborConfig = {
      ...laborConfig,
      // Conductor
      driverSalary: Number(laborForm.driverSalary),
      hourlyOrdinaryRate: Number(laborForm.hourlyOrdinaryRate),
      hourlyOvertimeDayRate: Number(laborForm.hourlyOvertimeDayRate),
      hourlyOvertimeNightRate: Number(laborForm.hourlyOvertimeNightRate),
      arlRiskLevelRate: Number(laborForm.arlRiskLevelRate),

      // Auxiliar
      hasHelper: Boolean(laborForm.hasHelper),
      helperSalary: Number(laborForm.helperSalary),
      helperHourlyOrdinaryRate: Number(laborForm.helperHourlyOrdinaryRate),
      helperOvertimeDayRate: Number(laborForm.helperOvertimeDayRate),
      helperOvertimeNightRate: Number(laborForm.helperOvertimeNightRate),
      arlRiskLevelRateHelper: Number(laborForm.arlRiskLevelRateHelper),

      // Generales y Jornada
      smmlv: Number(laborForm.smmlv),
      auxilioTransporteLegal: Number(laborForm.auxilioTransporteLegal),
      dailyViaticosPerPerson: Number(laborForm.dailyViaticosPerPerson),
      standardHoursPerDay: Number(laborForm.standardHoursPerDay),
      monthlyWorkingHours: Number(laborForm.monthlyWorkingHours),
      monthlyDotacionPerPerson: Number(laborForm.monthlyDotacionPerPerson),
      fixedShiftStartTime: scheduleConfig.normalShiftStartTime,
      fixedShiftEndTime: scheduleConfig.normalShiftEndTime,

      // Fiscales y Prestacionales
      isTaxExemptLey1607: Boolean(laborForm.isTaxExemptLey1607),
      primaServiciosRate: Number(laborForm.primaServiciosRate),
      cesantiasRate: Number(laborForm.cesantiasRate),
      interesesCesantiasRate: Number(laborForm.interesesCesantiasRate),
      vacacionesRate: Number(laborForm.vacacionesRate),
      pensionRate: Number(laborForm.pensionRate),
      saludRate: Number(laborForm.saludRate),
      cajaCompensacionRate: Number(laborForm.cajaCompensacionRate),
      senaRate: Number(laborForm.senaRate),
      icbfRate: Number(laborForm.icbfRate)
    };
    onUpdateLaborConfig(updated);
    localStorage.setItem('scj_work_schedule', JSON.stringify(scheduleConfig));
    localStorage.setItem('scj_labor_config', JSON.stringify(updated));
    localStorage.setItem('rutacost_labor', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('scj_labor_config_updated', { detail: updated }));
    showToast('✓ Horarios de turno fijo, tarifas de nómina y gastos fiscales guardados y sincronizados en rutas y despachos.');
  };

  // 3. Combustible y Mantenimientos Editables
  const nprProfile = vehicles.find(v => v.category === 'NPR') || selectedVehicle;
  const nlrProfile = vehicles.find(v => v.category === 'NLR') || selectedVehicle;

  const [fuelPrice, setFuelPrice] = useState<number>(selectedVehicle.fuelPricePerGallon || 10800);
  const [nprKmPerGal, setNprKmPerGal] = useState<number>(nprProfile.kmPerGallon || 22.5);
  const [nlrKmPerGal, setNlrKmPerGal] = useState<number>(nlrProfile.kmPerGallon || 31.0);
  const [nprMaintenancePerKm, setNprMaintenancePerKm] = useState<number>(nprProfile.totalMaintenancePerKm || 326);
  const [nlrMaintenancePerKm, setNlrMaintenancePerKm] = useState<number>(nlrProfile.totalMaintenancePerKm || 247);
  const [nprFixedDaily, setNprFixedDaily] = useState<number>(nprProfile.dailyFixedCost || 52000);
  const [nlrFixedDaily, setNlrFixedDaily] = useState<number>(nlrProfile.dailyFixedCost || 38000);

  // Guardar Combustible y Mantenimientos
  const handleSaveFuelAndMaintenance = () => {
    if (onUpdateVehicle) {
      if (nprProfile) {
        onUpdateVehicle({
          ...nprProfile,
          fuelPricePerGallon: fuelPrice,
          kmPerGallon: nprKmPerGal,
          totalMaintenancePerKm: nprMaintenancePerKm,
          dailyFixedCost: nprFixedDaily
        });
      }
      if (nlrProfile) {
        onUpdateVehicle({
          ...nlrProfile,
          fuelPricePerGallon: fuelPrice,
          kmPerGallon: nlrKmPerGal,
          totalMaintenancePerKm: nlrMaintenancePerKm,
          dailyFixedCost: nlrFixedDaily
        });
      }
    }
    showToast('✓ Tarifas de combustible ACPM y mantenimiento SICE-TAC actualizadas.');
  };

  // 4. Catálogo de Peajes Editable y Persistente
  const [tollStations, setTollStations] = useState<TollStation[]>(() => getCustomTollStations());

  useEffect(() => {
    const handleTollsUpdate = () => {
      setTollStations(getCustomTollStations());
    };
    window.addEventListener('scj_tolls_updated', handleTollsUpdate);
    return () => window.removeEventListener('scj_tolls_updated', handleTollsUpdate);
  }, []);

  const [tollSearchTerm, setTollSearchTerm] = useState('');
  const [isAddingToll, setIsAddingToll] = useState(false);
  const [newTollForm, setNewTollForm] = useState({
    name: '',
    corridor: '',
    department: 'Antioquia',
    tariffNprCOP: 25000,
    tariffNlrCOP: 20000
  });

  // Guardar peajes usando la utilidad global centralizada
  const saveTollStations = (newTolls: TollStation[]) => {
    setTollStations(newTolls);
    saveCustomTollStations(newTolls);
    showToast('✓ Catálogo de peajes actualizado y guardado.');
  };

  const handleUpdateTollTariff = (tollId: string, field: 'tariffNprCOP' | 'tariffNlrCOP', value: number) => {
    const updated = tollStations.map(t => {
      if (t.id === tollId) {
        return { ...t, [field]: value };
      }
      return t;
    });
    saveTollStations(updated);
  };

  const handleAddNewToll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTollForm.name.trim()) return;
    const newToll: TollStation = {
      id: `TOLL-${Date.now().toString().slice(-4)}`,
      name: newTollForm.name.trim(),
      corridor: newTollForm.corridor.trim() || 'Corredor Vial Nacional',
      department: newTollForm.department.trim(),
      lat: 6.2442,
      lng: -75.5812,
      tariffCOP: Number(newTollForm.tariffNlrCOP),
      tariffNlrCOP: Number(newTollForm.tariffNlrCOP),
      tariffNprCOP: Number(newTollForm.tariffNprCOP),
      tariffHeavyMaxCOP: Number(newTollForm.tariffNprCOP) * 3
    };
    saveTollStations([...tollStations, newToll]);
    setIsAddingToll(false);
    setNewTollForm({
      name: '',
      corridor: '',
      department: 'Antioquia',
      tariffNprCOP: 25000,
      tariffNlrCOP: 20000
    });
  };

  const handleRestoreTolls = () => {
    if (window.confirm('¿Deseas restablecer las tarifas oficiales de peajes 2026?')) {
      const defs = resetCustomTollStations();
      setTollStations(defs);
      showToast('✓ Tarifas oficiales de peajes 2026 restablecidas.');
    }
  };

  const filteredTolls = tollStations.filter(t =>
    t.name.toLowerCase().includes(tollSearchTerm.toLowerCase()) ||
    t.corridor.toLowerCase().includes(tollSearchTerm.toLowerCase()) ||
    t.department.toLowerCase().includes(tollSearchTerm.toLowerCase())
  );

  // 4.1. Calendario de Festivos Dinámico y Editable
  const [holidays, setHolidays] = useState<HolidayInfo[]>(() => getCustomHolidays());
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [holidaySearchTerm, setHolidaySearchTerm] = useState('');
  const [newHolidayForm, setNewHolidayForm] = useState<{
    date: string;
    name: string;
    type: 'CIVIL' | 'RELIGIOSO_EMILIANI' | 'PATRIO' | 'LOCAL_CIVICO' | 'PERSONALIZADO';
    description: string;
  }>({
    date: '2026-08-01',
    name: '',
    type: 'LOCAL_CIVICO',
    description: ''
  });

  useEffect(() => {
    const handleHolidaysUpdate = (e: any) => {
      if (e.detail) {
        setHolidays(e.detail);
      } else {
        setHolidays(getCustomHolidays());
      }
    };
    window.addEventListener('scj_holidays_updated', handleHolidaysUpdate);
    return () => window.removeEventListener('scj_holidays_updated', handleHolidaysUpdate);
  }, []);

  const handleAddNewHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayForm.date || !newHolidayForm.name.trim()) {
      toast.error('Por favor ingresa la fecha y el nombre del día festivo.');
      return;
    }

    const updated = addCustomHoliday({
      date: newHolidayForm.date,
      name: newHolidayForm.name.trim(),
      type: newHolidayForm.type,
      description: newHolidayForm.description.trim() || 'Festivo configurado en SCJ'
    });
    setHolidays(updated);
    setIsAddingHoliday(false);
    const addedName = newHolidayForm.name.trim();
    const addedDate = newHolidayForm.date;
    setNewHolidayForm({
      date: '2026-08-01',
      name: '',
      type: 'LOCAL_CIVICO',
      description: ''
    });
    showToast(`✓ Día festivo "${addedName}" agregado para el ${addedDate}.`);
  };

  const handleRemoveHoliday = (date: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el día festivo "${name}" (${date}) del calendario?`)) {
      const updated = removeCustomHoliday(date);
      setHolidays(updated);
      showToast(`✓ Festivo "${name}" (${date}) eliminado del calendario.`);
    }
  };

  const handleResetHolidays = () => {
    if (window.confirm('¿Deseas restablecer los 18 días festivos oficiales de Colombia para 2026?')) {
      const updated = resetCustomHolidays();
      setHolidays(updated);
      showToast('✓ Se han restablecido los 18 festivos oficiales de Colombia 2026.');
    }
  };

  const filteredHolidays = holidays.filter(h =>
    h.name.toLowerCase().includes(holidaySearchTerm.toLowerCase()) ||
    h.date.includes(holidaySearchTerm) ||
    (h.description && h.description.toLowerCase().includes(holidaySearchTerm.toLowerCase()))
  );

  // 5. Probador de liquidación de turno interactivo
  const [testDate, setTestDate] = useState<string>('2026-04-02'); // Jueves Santo
  const [testStartTime, setTestStartTime] = useState<string>('06:00');
  const [testEndTime, setTestEndTime] = useState<string>('19:30');

  // --- CÁLCULO EN VIVO DE GASTOS FISCALES Y PRESTACIONALES (CST COLOMBIA) ---
  const smmlvVal = Number(laborForm.smmlv) || defaultLaborConfig.smmlv;
  const auxTransporteVal = Number(laborForm.auxilioTransporteLegal) || defaultLaborConfig.auxilioTransporteLegal;
  const monthlyHoursVal = Number(laborForm.monthlyWorkingHours) || defaultLaborConfig.monthlyWorkingHours;

  // 1. Conductor
  const driverSal = Number(laborForm.driverSalary) || 0;
  const driverHasAux = driverSal <= (smmlvVal * 2);
  const driverAux = driverHasAux ? auxTransporteVal : 0;
  const driverPrestBase = driverSal + driverAux;

  const driverPrima = Math.round(driverPrestBase * Number(laborForm.primaServiciosRate));
  const driverCesantias = Math.round(driverPrestBase * Number(laborForm.cesantiasRate));
  const driverIntereses = Math.round(driverCesantias * Number(laborForm.interesesCesantiasRate));
  const driverVacaciones = Math.round(driverSal * Number(laborForm.vacacionesRate));
  const driverSubtotalPrestaciones = driverPrima + driverCesantias + driverIntereses + driverVacaciones;

  const driverPension = Math.round(driverSal * Number(laborForm.pensionRate));
  const driverSalud = (laborForm.isTaxExemptLey1607 && driverSal < (smmlvVal * 10)) ? 0 : Math.round(driverSal * Number(laborForm.saludRate));
  const driverArl = Math.round(driverSal * Number(laborForm.arlRiskLevelRate));
  const driverSubtotalSeguridad = driverPension + driverSalud + driverArl;

  const driverCaja = Math.round(driverSal * Number(laborForm.cajaCompensacionRate));
  const driverSena = (laborForm.isTaxExemptLey1607 && driverSal < (smmlvVal * 10)) ? 0 : Math.round(driverSal * Number(laborForm.senaRate));
  const driverIcbf = (laborForm.isTaxExemptLey1607 && driverSal < (smmlvVal * 10)) ? 0 : Math.round(driverSal * Number(laborForm.icbfRate));
  const driverSubtotalParafiscales = driverCaja + driverSena + driverIcbf;

  const driverDotacion = Number(laborForm.monthlyDotacionPerPerson) || 0;
  const driverCostoTotalEmpresa = driverSal + driverAux + driverSubtotalPrestaciones + driverSubtotalSeguridad + driverSubtotalParafiscales + driverDotacion;
  const driverFactorPrestacional = driverSal > 0 ? ((driverCostoTotalEmpresa - driverSal) / driverSal) * 100 : 0;
  const driverCostoRealHora = Math.round(driverCostoTotalEmpresa / monthlyHoursVal);

  // 2. Auxiliar
  const helperSal = Number(laborForm.helperSalary) || 0;
  const helperHasAux = helperSal <= (smmlvVal * 2);
  const helperAux = (laborForm.hasHelper && helperHasAux) ? auxTransporteVal : 0;
  const helperPrestBase = helperSal + helperAux;

  const helperPrima = laborForm.hasHelper ? Math.round(helperPrestBase * Number(laborForm.primaServiciosRate)) : 0;
  const helperCesantias = laborForm.hasHelper ? Math.round(helperPrestBase * Number(laborForm.cesantiasRate)) : 0;
  const helperIntereses = laborForm.hasHelper ? Math.round(helperCesantias * Number(laborForm.interesesCesantiasRate)) : 0;
  const helperVacaciones = laborForm.hasHelper ? Math.round(helperSal * Number(laborForm.vacacionesRate)) : 0;
  const helperSubtotalPrestaciones = helperPrima + helperCesantias + helperIntereses + helperVacaciones;

  const helperPension = laborForm.hasHelper ? Math.round(helperSal * Number(laborForm.pensionRate)) : 0;
  const helperSalud = (laborForm.hasHelper && !(laborForm.isTaxExemptLey1607 && helperSal < (smmlvVal * 10))) ? Math.round(helperSal * Number(laborForm.saludRate)) : 0;
  const helperArl = laborForm.hasHelper ? Math.round(helperSal * Number(laborForm.arlRiskLevelRateHelper)) : 0;
  const helperSubtotalSeguridad = helperPension + helperSalud + helperArl;

  const helperCaja = laborForm.hasHelper ? Math.round(helperSal * Number(laborForm.cajaCompensacionRate)) : 0;
  const helperSena = (laborForm.hasHelper && !(laborForm.isTaxExemptLey1607 && helperSal < (smmlvVal * 10))) ? Math.round(helperSal * Number(laborForm.senaRate)) : 0;
  const helperIcbf = (laborForm.hasHelper && !(laborForm.isTaxExemptLey1607 && helperSal < (smmlvVal * 10))) ? Math.round(helperSal * Number(laborForm.icbfRate)) : 0;
  const helperSubtotalParafiscales = helperCaja + helperSena + helperIcbf;

  const helperDotacion = laborForm.hasHelper ? (Number(laborForm.monthlyDotacionPerPerson) || 0) : 0;
  const helperCostoTotalEmpresa = laborForm.hasHelper ? (helperSal + helperAux + helperSubtotalPrestaciones + helperSubtotalSeguridad + helperSubtotalParafiscales + helperDotacion) : 0;
  const helperFactorPrestacional = helperSal > 0 ? ((helperCostoTotalEmpresa - helperSal) / helperSal) * 100 : 0;
  const helperCostoRealHora = laborForm.hasHelper ? Math.round(helperCostoTotalEmpresa / monthlyHoursVal) : 0;

  // 3. Totales Cuadrilla
  const cuadrillaTotalSalario = driverSal + (laborForm.hasHelper ? helperSal : 0);
  const cuadrillaTotalAuxilio = driverAux + helperAux;
  const cuadrillaTotalPrestaciones = driverSubtotalPrestaciones + helperSubtotalPrestaciones;
  const cuadrillaTotalSeguridad = driverSubtotalSeguridad + helperSubtotalSeguridad;
  const cuadrillaTotalParafiscales = driverSubtotalParafiscales + helperSubtotalParafiscales;
  const cuadrillaTotalDotacion = driverDotacion + helperDotacion;
  const cuadrillaCostoTotalEmpresa = driverCostoTotalEmpresa + helperCostoTotalEmpresa;
  const cuadrillaCostoRealHora = driverCostoRealHora + helperCostoRealHora;

  // Cálculo en vivo del probador de turno con los valores del formulario
  const testLaborBreakdown: CalculatedTripShiftBreakdown = calculateTripLaborFromSchedule(
    testDate,
    testStartTime,
    testDate,
    testEndTime,
    laborForm.hourlyOrdinaryRate || 8000,
    laborForm.hourlyOvertimeDayRate || 17488,
    laborForm.hourlyOvertimeNightRate || 23000,
    scheduleConfig,
    Number(laborForm.auxilioTransporteLegal) || defaultLaborConfig.auxilioTransporteLegal
  );

  return (
    <div className="space-y-6">

      {/* Toast Notification Flotante */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Encabezado descriptivo SCJ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Parámetros Maestros & Normativa 2026
              </span>
              <span className="text-xs text-slate-400 font-medium">· CST, SICE-TAC y Peajes Editables</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shadow-blue-500/20 shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <span>Base de Cálculo del Sistema</span>
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Fórmulas y parámetros maestros totalmente editables para adaptar el sistema a cambios futuros:
              precios de ACPM, desgaste SICE-TAC, tarifas de peajes por estación, horas extras CST y calendario laboral.
            </p>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-right shrink-0">
            <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block">Cálculo en vivo</span>
            <span className="text-sm font-black text-blue-900 block">
              ACPM: {formatCOP(fuelPrice)} / gal
            </span>
            <span className="text-xs text-blue-700 font-medium block">
              Hora Ord: {formatCOP(laborForm.hourlyOrdinaryRate)}/h
            </span>
          </div>
        </div>

        {/* Pestañas internas de la Base de Cálculo */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('schedule_and_overtime')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'schedule_and_overtime'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20 font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>1. Horarios & Tarifas de Nómina CST</span>
          </button>

          <button
            onClick={() => setActiveTab('fuel_and_maintenance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'fuel_and_maintenance'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20 font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span>2. Combustible ACPM & Mtto SICE-TAC</span>
          </button>

          <button
            onClick={() => setActiveTab('tolls_2026')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'tolls_2026'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20 font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>3. Tarifas Peajes por Estación ({tollStations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('holidays_calendar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'holidays_calendar'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20 font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>4. Calendario Festivos Colombia ({holidays.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('labor_tester')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'labor_tester'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20 font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>5. Simulador de Turno CST</span>
          </button>
        </div>
      </div>

      {/* 1. HORARIO LUNES A SÁBADO Y TARIFAS DE NÓMINA (EDITABLES) */}
      {activeTab === 'schedule_and_overtime' && (
        <form onSubmit={handleSaveLabor} className="space-y-6">

          {/* Banner Resumen Métricas Clave */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-blue-50/80 border border-blue-200/90 rounded-xl">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Turno Fijo Operativo</span>
              <span className="text-base font-black text-blue-950 block">
                {scheduleConfig.normalShiftStartTime} — {scheduleConfig.normalShiftEndTime}
              </span>
              <span className="text-[10px] text-blue-600 block">Jornada 8h / Lunes a Sábado</span>
            </div>

            <div className="p-3.5 bg-sky-50/80 border border-sky-200/90 rounded-xl">
              <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">Hora Ordinaria Conductor</span>
              <span className="text-base font-black text-sky-950 block">
                {formatCOP(laborForm.hourlyOrdinaryRate)}/h
              </span>
              <span className="text-[10px] text-sky-600 block">Base mensual: {formatCOP(laborForm.driverSalary)}</span>
            </div>

            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Hora Ordinaria Auxiliar</span>
              <span className="text-base font-black text-emerald-950 block">
                {laborForm.hasHelper ? `${formatCOP(laborForm.helperHourlyOrdinaryRate)}/h` : 'No asignado'}
              </span>
              <span className="text-[10px] text-emerald-600 block">
                {laborForm.hasHelper ? `Base SMMLV: ${formatCOP(laborForm.helperSalary)}` : 'Auxiliar inactivo'}
              </span>
            </div>

            <div className="p-3.5 bg-purple-50/80 border border-purple-200/90 rounded-xl">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Costo Cuadrilla Empresa</span>
              <span className="text-base font-black text-purple-950 block">
                {formatCOP(cuadrillaCostoTotalEmpresa)}
              </span>
              <span className="text-[10px] text-purple-600 block">
                {laborForm.isTaxExemptLey1607 ? 'Exonerado Ley 1607 (-13.5%)' : 'Régimen Pleno CST'}
              </span>
            </div>
          </div>

          {/* SECCIÓN 1: CONFIGURACIÓN DE HORARIOS POR DÍA Y JORNADA SEMANAL (PARAMETRIZABLE) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shadow-blue-500/20 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base">
                      Distribución de Horarios de Trabajo y Jornada Semanal
                    </h3>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-extrabold uppercase">
                      Meta: {scheduleConfig.weeklyTargetHours || 42} Horas Semanales
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Personaliza libremente la hora de entrada y la duración del turno ordinario para cada día de la semana.
                    Las horas asignadas a cada día activo constituyen su jornada ordinaria regular (por ejemplo: Lunes a Jueves 8h, Viernes 6h y Sábado 4h = 42h).
                  </p>
                </div>
              </div>

              {/* Botón Guardar Horario */}
              <button
                type="button"
                onClick={handleSaveScheduleOnly}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer self-start md:self-auto"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Distribución Semanal</span>
              </button>
            </div>

            {/* TARJETA RESUMEN EN TIEMPO REAL DEL HORARIO PROGRAMADO */}
            {(() => {
              const target = Number(scheduleConfig.weeklyTargetHours) || 42;
              const matches = weeklyScheduledHours === target;
              const exceeds = weeklyScheduledHours > target;

              return (
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  matches
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : exceeds
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-blue-50/80 border-blue-200 text-blue-950'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                      matches ? 'bg-emerald-600' : exceeds ? 'bg-amber-600' : 'bg-blue-600'
                    }`}>
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wide">
                          Total Ordinario Semanal Programado:
                        </span>
                        <span className="font-mono font-black text-sm">
                          {weeklyScheduledHours} horas / {target}h objetivo
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {matches ? (
                          <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                            Cumple con exactitud el objetivo de {target} horas semanales ordinarias. No hay horas extras programadas.
                          </span>
                        ) : exceeds ? (
                          <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 inline" />
                            Supera las {target} horas configuradas por {(weeklyScheduledHours - target).toFixed(1)} horas semanales.
                          </span>
                        ) : (
                          <span className="text-blue-800 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline" />
                            Jornada semanal de {weeklyScheduledHours} horas ordinarias programadas (faltan {(target - weeklyScheduledHours).toFixed(1)}h para el objetivo de {target}h).
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="bg-white/90 border border-slate-200 px-3 py-1.5 rounded-lg text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Divisor Mensual</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        {laborForm.monthlyWorkingHours} horas/mes
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* MATRIZ DÍA A DÍA (7 DÍAS: LUNES A DOMINGO) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  Configuración Detallada por Día (Lunes a Domingo):
                </h4>
                <span className="text-[11px] text-slate-400">
                  Cada día activo computa sus horas ordinarias programadas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                {(scheduleConfig.dailySchedules || DEFAULT_WORK_SCHEDULE.dailySchedules || []).map((day) => {
                  const isSunday = day.dayOfWeek === 0;

                  return (
                    <div
                      key={day.dayOfWeek}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                        !day.isEnabled
                          ? 'bg-slate-100/80 border-slate-200 text-slate-400 opacity-80'
                          : isSunday
                          ? 'bg-purple-50/60 border-purple-200'
                          : 'bg-white border-slate-200 shadow-2xs hover:border-blue-300'
                      }`}
                    >
                      {/* Cabecera del día */}
                      <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-200/70">
                        <div>
                          <span className="text-xs font-black text-slate-900 block">
                            {day.dayName}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {day.shortName}
                          </span>
                        </div>

                        {/* Toggle Día Habilitado */}
                        <label className="flex items-center gap-1.5 cursor-pointer" title={day.isEnabled ? 'Día laboral ordinario' : 'Día de descanso legal'}>
                          <input
                            type="checkbox"
                            checked={day.isEnabled}
                            onChange={(e) => handleDayScheduleChange(day.dayOfWeek, 'isEnabled', e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span className={`text-[10px] font-extrabold ${day.isEnabled ? 'text-blue-700' : 'text-slate-400'}`}>
                            {day.isEnabled ? 'Activo' : 'Descanso'}
                          </span>
                        </label>
                      </div>

                      {/* Configuración de horas del día si está habilitado */}
                      {day.isEnabled ? (
                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                              Entrada
                            </label>
                            <input
                              type="time"
                              value={day.startTime || '06:00'}
                              onChange={(e) => handleDayScheduleChange(day.dayOfWeek, 'startTime', e.target.value)}
                              className="w-full px-2 py-1 text-xs font-bold text-blue-900 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                              Horas Ord.
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="12"
                              value={day.standardHours}
                              onChange={(e) => handleDayScheduleChange(day.dayOfWeek, 'standardHours', Number(e.target.value))}
                              className="w-full px-2 py-1 text-xs font-bold text-slate-900 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                              Salida Ord.
                            </label>
                            <div className="px-2 py-1 text-xs font-mono font-bold bg-slate-100 text-slate-800 rounded-md border border-slate-200">
                              {day.endTime || computeEndTime(day.startTime, day.standardHours)}
                            </div>
                          </div>

                          {/* Badge explicativo del turno ordinario */}
                          <div className="pt-1">
                            <div className="p-1.5 bg-blue-50/80 border border-blue-100 text-blue-900 rounded text-[9px] font-semibold text-center leading-tight">
                              Turno: {day.startTime || '06:00'} a {day.endTime || computeEndTime(day.startTime, day.standardHours)} ({day.standardHours}h)
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 block">
                            Día de Descanso
                          </span>
                          <span className="text-[9px] text-slate-400 block leading-tight">
                            {isSunday
                              ? 'Descanso dominical'
                              : 'Día no laboral ordinario'
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PANEL DE PARAMETRIZACIÓN MANUAL DE VARIABLES Y RECARGOS (100% CONFIGURABLE) */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      Parámetros Generales de Jornada y Porcentajes de Recargos (Manual y Editable)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Modifica libremente las horas semanales objetivo, divisor mensual, franja nocturna y los porcentajes de horas extras y festivos.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveScheduleOnly}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Parámetros</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Jornada Semanal Objetivo */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      Horas Semanales Totales
                    </label>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      Objetivo
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="20"
                      max="60"
                      value={scheduleConfig.weeklyTargetHours || 42}
                      onChange={(e) => handleWeeklyTargetHoursChange(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold text-blue-900 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold">horas/sem</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Meta semanal a cumplir (ej. 42, 44, 46, 48 o 40).
                  </span>
                </div>

                {/* 2. Divisor Mensual */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      Divisor Mensual de Nómina
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoCalculateDivisor}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                      title="Calcula ((Horas Semanales ÷ 6) × 30)"
                    >
                      Auto-calcular
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="100"
                      max="300"
                      value={laborForm.monthlyWorkingHours}
                      onChange={(e) => handleMonthlyWorkingHoursChange(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold">horas/mes</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleMonthlyWorkingHoursChange(defaultLaborConfig.monthlyWorkingHours)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border cursor-pointer ${laborForm.monthlyWorkingHours === defaultLaborConfig.monthlyWorkingHours ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                      {defaultLaborConfig.monthlyWorkingHours} h
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMonthlyWorkingHoursChange(220)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border cursor-pointer ${laborForm.monthlyWorkingHours === 220 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                      220 h
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMonthlyWorkingHoursChange(240)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border cursor-pointer ${laborForm.monthlyWorkingHours === 240 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                      240 h
                    </button>
                  </div>
                </div>

                {/* 3. Franja Nocturna Inicio */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Inicio Franja Nocturna
                  </label>
                  <input
                    type="time"
                    value={scheduleConfig.nightHoursStartTime || '21:00'}
                    onChange={(e) => handleNightWindowChange('nightHoursStartTime', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold text-indigo-900 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-indigo-50/20"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Por defecto 21:00 (o 19:00 si aplica reforma).
                  </span>
                </div>

                {/* 4. Franja Nocturna Fin */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Fin Franja Nocturna
                  </label>
                  <input
                    type="time"
                    value={scheduleConfig.nightHoursEndTime || '06:00'}
                    onChange={(e) => handleNightWindowChange('nightHoursEndTime', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold text-indigo-900 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-indigo-50/20"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Por defecto 06:00 a.m. del día siguiente.
                  </span>
                </div>
              </div>

              {/* Sub-Panel: Porcentajes de Recargos */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-blue-600" />
                    Porcentajes de Recargos y Horas Extras (Editables):
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Ajusta los porcentajes de recargo según normatividad vigente o futuros cambios
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {/* Recargo Extra Diurno */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block truncate" title="Recargo Hora Extra Diurna">
                      H. Extra Diurna
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="300"
                        value={Math.round((scheduleConfig.dayOvertimeSurchargeRate ?? 0.25) * 100)}
                        onChange={(e) => handleSurchargePercentChange('dayOvertimeSurchargeRate', Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs font-bold text-slate-900 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="absolute right-2 top-1 text-[10px] text-slate-400 font-bold">%</span>
                    </div>
                    <span className="text-[9px] text-blue-600 block font-medium">
                      Factor x{(1 + (scheduleConfig.dayOvertimeSurchargeRate ?? 0.25)).toFixed(2)}
                    </span>
                  </div>

                  {/* Recargo Extra Nocturno */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block truncate" title="Recargo Hora Extra Nocturna">
                      H. Extra Nocturna
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="300"
                        value={Math.round((scheduleConfig.nightOvertimeSurchargeRate ?? 0.75) * 100)}
                        onChange={(e) => handleSurchargePercentChange('nightOvertimeSurchargeRate', Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs font-bold text-slate-900 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="absolute right-2 top-1 text-[10px] text-slate-400 font-bold">%</span>
                    </div>
                    <span className="text-[9px] text-indigo-600 block font-medium">
                      Factor x{(1 + (scheduleConfig.nightOvertimeSurchargeRate ?? 0.75)).toFixed(2)}
                    </span>
                  </div>

                  {/* Recargo Nocturno Ordinario */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block truncate" title="Recargo Ordinario Nocturno">
                      Rec. Nocturno Ord.
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="300"
                        value={Math.round((scheduleConfig.nightSurchargeRate ?? 0.35) * 100)}
                        onChange={(e) => handleSurchargePercentChange('nightSurchargeRate', Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs font-bold text-slate-900 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="absolute right-2 top-1 text-[10px] text-slate-400 font-bold">%</span>
                    </div>
                    <span className="text-[9px] text-purple-600 block font-medium">
                      Factor x{(1 + (scheduleConfig.nightSurchargeRate ?? 0.35)).toFixed(2)}
                    </span>
                  </div>

                  {/* Recargo Dominical / Festivo Ordinario */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block truncate" title="Recargo Festivo / Dominical Ordinario">
                      Festivo Ordinario
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="300"
                        value={Math.round((scheduleConfig.sundayHolidaySurchargeRate ?? 0.75) * 100)}
                        onChange={(e) => handleSurchargePercentChange('sundayHolidaySurchargeRate', Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs font-bold text-slate-900 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="absolute right-2 top-1 text-[10px] text-slate-400 font-bold">%</span>
                    </div>
                    <span className="text-[9px] text-amber-700 block font-medium">
                      Factor x{(1 + (scheduleConfig.sundayHolidaySurchargeRate ?? 0.75)).toFixed(2)}
                    </span>
                  </div>

                  {/* Recargo Extra Festivo Diurno */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block truncate" title="Recargo Extra Festivo Diurno">
                      Extra Festiva Diurna
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="300"
                        value={Math.round((scheduleConfig.sundayHolidayOvertimeDayRate ?? 1.00) * 100)}
                        onChange={(e) => handleSurchargePercentChange('sundayHolidayOvertimeDayRate', Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs font-bold text-slate-900 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="absolute right-2 top-1 text-[10px] text-slate-400 font-bold">%</span>
                    </div>
                    <span className="text-[9px] text-rose-600 block font-medium">
                      Factor x{(1 + (scheduleConfig.sundayHolidayOvertimeDayRate ?? 1.00)).toFixed(2)}
                    </span>
                  </div>

                  {/* Recargo Extra Festivo Nocturno */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block truncate" title="Recargo Extra Festivo Nocturno">
                      Extra Festiva Noct.
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="300"
                        value={Math.round((scheduleConfig.sundayHolidayOvertimeNightRate ?? 1.50) * 100)}
                        onChange={(e) => handleSurchargePercentChange('sundayHolidayOvertimeNightRate', Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs font-bold text-slate-900 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="absolute right-2 top-1 text-[10px] text-slate-400 font-bold">%</span>
                    </div>
                    <span className="text-[9px] text-purple-700 block font-medium">
                      Factor x{(1 + (scheduleConfig.sundayHolidayOvertimeNightRate ?? 1.50)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: CONFIGURACIÓN DIFERENCIADA CONDUCTOR VS AUXILIAR */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* TARJETA 1: CONDUCTOR / POLIFUNCIONAL */}
            <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-bl-full pointer-events-none -mr-8 -mt-8" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shadow-blue-500/20">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Conductor / Conductor-Polifuncional</h3>
                    <p className="text-xs text-slate-500">Tarifas y salarios para el operador del vehículo</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px] uppercase">
                  Conductor
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Salario Básico Mensual (COP)
                    </label>
                    <span className="text-[10px] text-blue-700 font-semibold">
                      {(driverSal / smmlvVal).toFixed(2)} SMMLV
                    </span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={laborForm.driverSalary}
                    onChange={(e) => updateLaborField('driverSalary', Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Hora Ordinaria (H.O.)</label>
                    <input
                      type="number"
                      value={laborForm.hourlyOrdinaryRate}
                      onChange={(e) => handleDriverOrdinaryRateChange(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-blue-900 border border-blue-300 rounded-lg bg-blue-50/40"
                    />
                    <span className="text-[9px] text-blue-600 font-semibold block mt-0.5">8h iniciales · Suma extras</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-600 block truncate">Extra Diurna (H.E.D.)</label>
                      <button
                        type="button"
                        onClick={() => handleDriverOrdinaryRateChange(laborForm.hourlyOrdinaryRate)}
                        className="text-[9px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                        title="Recalcular con el recargo activo de la jornada"
                      >
                        Auto
                      </button>
                    </div>
                    <input
                      type="number"
                      value={laborForm.hourlyOvertimeDayRate}
                      onChange={(e) => updateLaborField('hourlyOvertimeDayRate', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-blue-900 border border-blue-300 rounded-lg bg-blue-50/40"
                    />
                    <span className="text-[9px] text-blue-700 font-bold block mt-0.5">
                      +{Math.round((scheduleConfig.dayOvertimeSurchargeRate ?? 0.25) * 100)}% ({formatCOP(Math.round(laborForm.hourlyOrdinaryRate * (1 + (scheduleConfig.dayOvertimeSurchargeRate ?? 0.25)))).replace('COP', '').trim()})
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-600 block truncate">Extra Nocturna (H.E.N.)</label>
                      <button
                        type="button"
                        onClick={() => handleDriverOrdinaryRateChange(laborForm.hourlyOrdinaryRate)}
                        className="text-[9px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                        title="Recalcular con el recargo nocturno activo"
                      >
                        Auto
                      </button>
                    </div>
                    <input
                      type="number"
                      value={laborForm.hourlyOvertimeNightRate}
                      onChange={(e) => updateLaborField('hourlyOvertimeNightRate', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-indigo-900 border border-indigo-300 rounded-lg bg-indigo-50/40"
                    />
                    <span className="text-[9px] text-indigo-700 font-bold block mt-0.5">
                      +{Math.round((scheduleConfig.nightOvertimeSurchargeRate ?? 0.75) * 100)}% ({formatCOP(Math.round(laborForm.hourlyOrdinaryRate * (1 + (scheduleConfig.nightOvertimeSurchargeRate ?? 0.75)))).replace('COP', '').trim()})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Nivel Riesgo ARL</label>
                    <select
                      value={laborForm.arlRiskLevelRate}
                      onChange={(e) => updateLaborField('arlRiskLevelRate', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value={0.0435}>Riesgo IV - 4.350% (Carga Carretera)</option>
                      <option value={0.0696}>Riesgo V - 6.960% (Alto Riesgo)</option>
                      <option value={0.02436}>Riesgo III - 2.436% (Urbano)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Viático Diario Base</label>
                    <input
                      type="number"
                      step="any"
                      value={laborForm.dailyViaticosPerPerson}
                      onChange={(e) => updateLaborField('dailyViaticosPerPerson', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                {/* Acciones Rápidas Conductor */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleAutoCalculateDriverHourly}
                    className="flex-1 py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-colors text-center"
                    title="Calcula H.O. dividiendo el sueldo entre las {defaultLaborConfig.monthlyWorkingHours}h mensuales legales"
                  >
                    Auto-calcular por hora ({formatCOP(Math.round(driverSal / monthlyHoursVal))}/h)
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyScjOfficialDriver}
                    className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
                    title="Restablece tarifas oficiales SCJ: $8.000 / $17.488 / $23.000"
                  >
                    Tarifas SCJ
                  </button>
                </div>

                {/* Resumen al pie del Conductor */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-700 font-semibold uppercase block">Costo Empresa Mes Conductor</span>
                    <span className="font-black text-blue-950 text-sm">{formatCOP(driverCostoTotalEmpresa)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-blue-700 font-semibold uppercase block">Costo Real / Hora</span>
                    <span className="font-black text-blue-950 text-sm">{formatCOP(driverCostoRealHora)} / h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TARJETA 2: AUXILIAR DE REPARTO */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full pointer-events-none -mr-8 -mt-8" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shadow-emerald-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Auxiliar de Reparto / Ayudante</h3>
                    <p className="text-xs text-slate-500">Tarifas y salarios para cuadrilla de cargue y descargue</p>
                  </div>
                </div>

                {/* Switch de inclusión del auxiliar */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={laborForm.hasHelper}
                    onChange={(e) => updateLaborField('hasHelper', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className={`text-[11px] font-bold ${laborForm.hasHelper ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {laborForm.hasHelper ? 'Activo en Rutas' : 'Sin Auxiliar'}
                  </span>
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Salario Básico Mensual Auxiliar (COP)
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {(helperSal / smmlvVal).toFixed(2)} SMMLV (Mínimo Legal)
                    </span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={laborForm.helperSalary}
                    onChange={(e) => updateLaborField('helperSalary', Number(e.target.value))}
                    disabled={!laborForm.hasHelper}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Hora Ordinaria (H.O.)</label>
                    <input
                      type="number"
                      value={laborForm.helperHourlyOrdinaryRate}
                      onChange={(e) => handleHelperOrdinaryRateChange(Number(e.target.value))}
                      disabled={!laborForm.hasHelper}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-emerald-900 border border-emerald-300 rounded-lg bg-emerald-50/40 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">8h diurnas · Suma extras</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-600 block truncate">Extra Diurna (H.E.D.)</label>
                      <button
                        type="button"
                        onClick={() => handleHelperOrdinaryRateChange(laborForm.helperHourlyOrdinaryRate)}
                        disabled={!laborForm.hasHelper}
                        className="text-[9px] text-emerald-600 hover:text-emerald-800 font-bold underline cursor-pointer disabled:opacity-40"
                        title="Recalcular con el recargo activo de la jornada"
                      >
                        Auto
                      </button>
                    </div>
                    <input
                      type="number"
                      value={laborForm.helperOvertimeDayRate}
                      onChange={(e) => updateLaborField('helperOvertimeDayRate', Number(e.target.value))}
                      disabled={!laborForm.hasHelper}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-emerald-900 border border-emerald-300 rounded-lg bg-emerald-50/40 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                      +{Math.round((scheduleConfig.dayOvertimeSurchargeRate ?? 0.25) * 100)}% ({formatCOP(Math.round(laborForm.helperHourlyOrdinaryRate * (1 + (scheduleConfig.dayOvertimeSurchargeRate ?? 0.25)))).replace('COP', '').trim()})
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-600 block truncate">Extra Nocturna (H.E.N.)</label>
                      <button
                        type="button"
                        onClick={() => handleHelperOrdinaryRateChange(laborForm.helperHourlyOrdinaryRate)}
                        disabled={!laborForm.hasHelper}
                        className="text-[9px] text-teal-600 hover:text-teal-800 font-bold underline cursor-pointer disabled:opacity-40"
                        title="Recalcular con el recargo nocturno activo"
                      >
                        Auto
                      </button>
                    </div>
                    <input
                      type="number"
                      value={laborForm.helperOvertimeNightRate}
                      onChange={(e) => updateLaborField('helperOvertimeNightRate', Number(e.target.value))}
                      disabled={!laborForm.hasHelper}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-teal-900 border border-teal-300 rounded-lg bg-teal-50/40 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <span className="text-[9px] text-teal-700 font-bold block mt-0.5">
                      +{Math.round((scheduleConfig.nightOvertimeSurchargeRate ?? 0.75) * 100)}% ({formatCOP(Math.round(laborForm.helperHourlyOrdinaryRate * (1 + (scheduleConfig.nightOvertimeSurchargeRate ?? 0.75)))).replace('COP', '').trim()})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Nivel Riesgo ARL</label>
                    <select
                      value={laborForm.arlRiskLevelRateHelper}
                      onChange={(e) => updateLaborField('arlRiskLevelRateHelper', Number(e.target.value))}
                      disabled={!laborForm.hasHelper}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100"
                    >
                      <option value={0.02436}>Riesgo III - 2.436% (Bodega / Reparto)</option>
                      <option value={0.0435}>Riesgo IV - 4.350% (Ruta Carretera)</option>
                      <option value={0.01044}>Riesgo II - 1.044% (Liviano)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Dotación & EPP Mes</label>
                    <input
                      type="number"
                      step="any"
                      value={laborForm.monthlyDotacionPerPerson}
                      onChange={(e) => updateLaborField('monthlyDotacionPerPerson', Number(e.target.value))}
                      disabled={!laborForm.hasHelper}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>

                {/* Acciones Rápidas Auxiliar */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleAutoCalculateHelperHourly}
                    disabled={!laborForm.hasHelper}
                    className="flex-1 py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold transition-colors text-center disabled:opacity-50"
                  >
                    Auto-calcular por hora ({formatCOP(Math.round(helperSal / monthlyHoursVal))}/h)
                  </button>
                  <button
                    type="button"
                    onClick={handleApplySmmlv2026}
                    disabled={!laborForm.hasHelper}
                    className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50"
                  >
                    Base SMMLV 2026
                  </button>
                </div>

                {/* Resumen al pie del Auxiliar */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Costo Empresa Mes Auxiliar</span>
                    <span className="font-black text-emerald-950 text-sm">
                      {laborForm.hasHelper ? formatCOP(helperCostoTotalEmpresa) : '$0 (Inactivo)'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Costo Real / Hora</span>
                    <span className="font-black text-emerald-950 text-sm">
                      {laborForm.hasHelper ? `${formatCOP(helperCostoRealHora)} / h` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* BANNER INFORMATIVO: IMPACTO DIRECTO EN RUTAS Y DESPACHOS */}
          <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 rounded-2xl border border-blue-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <span>Aplicación Inmediata en Rutas y Liquidaciones de Vehículos</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">100% Sincronizado</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Al digitar la <strong className="text-blue-900">Hora Ordinaria (H.O.)</strong>, las tarifas de <strong className="text-blue-900">Extra Diurna (+{Math.round((scheduleConfig.dayOvertimeSurchargeRate ?? 0.25) * 100)}%)</strong> y <strong className="text-indigo-900">Extra Nocturna (+{Math.round((scheduleConfig.nightOvertimeSurchargeRate ?? 0.75) * 100)}%)</strong> se suman y recalculan al instante. Al guardar, se actualizan el presupuesto de toda la red de rutas y la liquidación real del viaje de cada vehículo en tránsito.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveLabor}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar y Aplicar en Rutas</span>
              </button>
            </div>
          </div>

          {/* TABLA MAESTRA DE TARIFAS HORARIAS & RECARGOS (DINÁMICA Y PARAMETRIZABLE) */}
          {(() => {
            const nightStart = scheduleConfig.nightHoursStartTime || '21:00';
            const nightEnd = scheduleConfig.nightHoursEndTime || '06:00';

            const dayExtPct = Math.round((scheduleConfig.dayOvertimeSurchargeRate ?? 0.25) * 100);
            const nightExtPct = Math.round((scheduleConfig.nightOvertimeSurchargeRate ?? 0.75) * 100);
            const nightOrdPct = Math.round((scheduleConfig.nightSurchargeRate ?? 0.35) * 100);
            const sunHolOrdPct = Math.round((scheduleConfig.sundayHolidaySurchargeRate ?? 0.75) * 100);
            const sunHolNightOrdPct = sunHolOrdPct + nightOrdPct;
            const sunHolDayExtPct = Math.round((scheduleConfig.sundayHolidayOvertimeDayRate ?? 1.00) * 100);
            const sunHolNightExtPct = Math.round((scheduleConfig.sundayHolidayOvertimeNightRate ?? 1.50) * 100);

            const dayExtMult = 1 + (scheduleConfig.dayOvertimeSurchargeRate ?? 0.25);
            const nightExtMult = 1 + (scheduleConfig.nightOvertimeSurchargeRate ?? 0.75);
            const nightOrdMult = 1 + (scheduleConfig.nightSurchargeRate ?? 0.35);
            const sunHolOrdMult = 1 + (scheduleConfig.sundayHolidaySurchargeRate ?? 0.75);
            const sunHolNightOrdMult = 1 + (scheduleConfig.sundayHolidaySurchargeRate ?? 0.75) + (scheduleConfig.nightSurchargeRate ?? 0.35);
            const sunHolDayExtMult = 1 + (scheduleConfig.sundayHolidayOvertimeDayRate ?? 1.00);
            const sunHolNightExtMult = 1 + (scheduleConfig.sundayHolidayOvertimeNightRate ?? 1.50);

            const monthlyDivisor = Number(laborForm.monthlyWorkingHours) || defaultLaborConfig.monthlyWorkingHours;
            const auxBaseHourly = Math.round(smmlvVal / monthlyDivisor);
            const driverBaseHourly = Math.round(driverSal / monthlyDivisor);

            return (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shadow-blue-500/20">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        Tabla Maestra Oficial de Tarifas Horarias & Recargos
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-extrabold uppercase">
                          JORNADA: {scheduleConfig.weeklyTargetHours || 42}H (DIVISOR {monthlyDivisor}H/MES)
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Cálculo automático para todas las modalidades según los parámetros configurados manualmente.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplySmmlv2026}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Recalcular con SMMLV $1.750.905
                    </button>
                  </div>
                </div>

                {/* Tabla Detallada */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <th className="py-2.5 px-3">Modalidad / Concepto Legal</th>
                        <th className="py-2.5 px-3">Franja / Horario</th>
                        <th className="py-2.5 px-2 text-center">Recargo Configurado</th>
                        <th className="py-2.5 px-2 text-center">Factor Multiplicador</th>
                        <th className="py-2.5 px-3 text-right text-emerald-800 bg-emerald-50/40">
                          Auxiliar ({smmlvVal === defaultLaborConfig.smmlv ? `SMMLV ${defaultLaborConfig.smmlv.toLocaleString("es-CO")}` : formatCOP(smmlvVal)})
                        </th>
                        <th className="py-2.5 px-3 text-right text-blue-800 bg-blue-50/40">
                          Conductor ({formatCOP(driverSal)})
                        </th>
                        <th className="py-2.5 px-3 text-slate-500">Fundamento Legal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">

                      {/* 1. Hora Ordinaria Diurna */}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          1. Hora Ordinaria Diurna (H.O.D.)
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-600">{nightEnd} a {nightStart} (jornada ordinaria)</td>
                        <td className="py-2.5 px-2 text-center text-slate-700 font-bold">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-bold">Base (0%)</span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-900">1.00</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-900 bg-emerald-50/20">
                          {formatCOP(auxBaseHourly)} / h
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/20">
                          {formatCOP(driverBaseHourly)} / h
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">Art. 161 y 168 CST</td>
                      </tr>

                      {/* 2. Hora Nocturna Ordinaria */}
                      <tr className="hover:bg-indigo-50/40 transition-colors bg-indigo-50/10">
                        <td className="py-2.5 px-3 font-sans font-bold text-indigo-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          2. Hora Nocturna Ordinaria (H.O.N.)
                        </td>
                        <td className="py-2.5 px-3 font-sans text-indigo-900">{nightStart} a {nightEnd} (en turno ordinario)</td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200/80 font-bold text-indigo-700 text-xs shadow-2xs hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
                            <span>+</span>
                            <input
                              type="number"
                              min={0}
                              max={500}
                              step={1}
                              value={nightOrdPct}
                              onChange={(e) => handleSurchargePercentChange('nightSurchargeRate', Number(e.target.value))}
                              className="w-8 text-center bg-transparent border-0 p-0 text-xs font-bold text-indigo-700 focus:outline-none focus:text-indigo-900"
                              title="Modificar recargo nocturno ordinario (%)"
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-indigo-900">{nightOrdMult.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-900 bg-emerald-50/20">
                          {formatCOP(Math.round(auxBaseHourly * nightOrdMult))} / h
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/20">
                          {formatCOP(Math.round(driverBaseHourly * nightOrdMult))} / h
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">Art. 168 numeral 1 CST</td>
                      </tr>

                      {/* 3. Hora Extra Diurna */}
                      <tr className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-sans font-bold text-blue-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          3. Hora Extra Diurna (H.E.D.)
                        </td>
                        <td className="py-2.5 px-3 font-sans text-blue-900">Exceso diario en franja diurna ({nightEnd} a {nightStart})</td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 font-bold text-blue-700 text-xs shadow-2xs hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                            <span>+</span>
                            <input
                              type="number"
                              min={0}
                              max={500}
                              step={1}
                              value={dayExtPct}
                              onChange={(e) => handleSurchargePercentChange('dayOvertimeSurchargeRate', Number(e.target.value))}
                              className="w-8 text-center bg-transparent border-0 p-0 text-xs font-bold text-blue-700 focus:outline-none focus:text-blue-900"
                              title="Modificar recargo hora extra diurna (%)"
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-blue-900">{dayExtMult.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-900 bg-emerald-50/20">
                          {formatCOP(Math.round(auxBaseHourly * dayExtMult))} / h
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/20">
                          {formatCOP(Math.round(driverBaseHourly * dayExtMult))} / h
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">Art. 168 numeral 2 CST</td>
                      </tr>

                      {/* 4. Hora Extra Nocturna */}
                      <tr className="hover:bg-purple-50/40 transition-colors bg-purple-50/10">
                        <td className="py-2.5 px-3 font-sans font-bold text-purple-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          4. Hora Extra Nocturna (H.E.N.)
                        </td>
                        <td className="py-2.5 px-3 font-sans text-purple-900">Exceso diario en franja nocturna ({nightStart} a {nightEnd})</td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200/80 font-bold text-purple-700 text-xs shadow-2xs hover:border-purple-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 focus-within:bg-white transition-all">
                            <span>+</span>
                            <input
                              type="number"
                              min={0}
                              max={500}
                              step={1}
                              value={nightExtPct}
                              onChange={(e) => handleSurchargePercentChange('nightOvertimeSurchargeRate', Number(e.target.value))}
                              className="w-8 text-center bg-transparent border-0 p-0 text-xs font-bold text-purple-700 focus:outline-none focus:text-purple-900"
                              title="Modificar recargo hora extra nocturna (%)"
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-purple-900">{nightExtMult.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-900 bg-emerald-50/20">
                          {formatCOP(Math.round(auxBaseHourly * nightExtMult))} / h
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/20">
                          {formatCOP(Math.round(driverBaseHourly * nightExtMult))} / h
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">Art. 168 numeral 3 CST</td>
                      </tr>

                      {/* 5. Hora Festiva / Dominical Diurna Ordinaria */}
                      <tr className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-sans font-bold text-amber-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          5. Festiva / Dominical Diurna (H.D.F.)
                        </td>
                        <td className="py-2.5 px-3 font-sans text-amber-900">Domingo / Festivo en jornada ordinaria</td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200/80 font-bold text-amber-700 text-xs shadow-2xs hover:border-amber-400 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 focus-within:bg-white transition-all">
                            <span>+</span>
                            <input
                              type="number"
                              min={0}
                              max={500}
                              step={1}
                              value={sunHolOrdPct}
                              onChange={(e) => handleSurchargePercentChange('sundayHolidaySurchargeRate', Number(e.target.value))}
                              className="w-8 text-center bg-transparent border-0 p-0 text-xs font-bold text-amber-700 focus:outline-none focus:text-amber-900"
                              title="Modificar recargo dominical/festivo ordinario (%)"
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-amber-900">{sunHolOrdMult.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-900 bg-emerald-50/20">
                          {formatCOP(Math.round(auxBaseHourly * sunHolOrdMult))} / h
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/20">
                          {formatCOP(Math.round(driverBaseHourly * sunHolOrdMult))} / h
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">Art. 179 CST</td>
                      </tr>

                      {/* 6. Hora Festiva / Dominical Nocturna Ordinaria */}
                      <tr className="hover:bg-orange-50/40 transition-colors bg-orange-50/10">
                        <td className="py-2.5 px-3 font-sans font-bold text-orange-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          6. Festiva / Dominical Nocturna (H.D.F.N.)
                        </td>
                        <td className="py-2.5 px-3 font-sans text-orange-900">Domingo / Festivo de {nightStart} a {nightEnd}</td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200/80 font-bold text-orange-700 text-xs shadow-2xs hover:border-orange-400 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 focus-within:bg-white transition-all">
                            <span>+</span>
                            <input
                              type="number"
                              min={0}
                              max={500}
                              step={1}
                              value={sunHolNightOrdPct}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                handleSurchargePercentChange('sundayHolidaySurchargeRate', Math.max(0, val - nightOrdPct));
                              }}
                              className="w-9 text-center bg-transparent border-0 p-0 text-xs font-bold text-orange-700 focus:outline-none focus:text-orange-900"
                              title="Modificar recargo festivo nocturno ordinario (%)"
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-orange-900">{sunHolNightOrdMult.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-900 bg-emerald-50/20">
                          {formatCOP(Math.round(auxBaseHourly * sunHolNightOrdMult))} / h
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/20">
                          {formatCOP(Math.round(driverBaseHourly * sunHolNightOrdMult))} / h
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">Art. 168 y 179 CST</td>
                      </tr>

                      {/* 7. Hora Extra Festiva Diurna */}
                      <tr className="hover:bg-rose-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-sans font-bold text-rose-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          7. Extra Festiva Diurna (H.E.F.D.)
                        </td>
                        <td className="py-2.5 px-3 font-sans text-rose-900">Exceso de jornada en Domingo/Festivo diurno</td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200/80 font-bold text-rose-700 text-xs shadow-2xs hover:border-rose-400 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500 focus-within:bg-white transition-all">
                            <span>+</span>
                            <input
                              type="number"
                              min={0}
                              max={500}
                              step={1}
                              value={sunHolDayExtPct}
                              onChange={(e) => handleSurchargePercentChange('sundayHolidayOvertimeDayRate', Number(e.target.value))}
                              className="w-9 text-center bg-transparent border-0 p-0 text-xs font-bold text-rose-700 focus:outline-none focus:text-rose-900"
                              title="Modificar recargo hora extra festiva diurna (%)"
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-rose-900">{sunHolDayExtMult.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-900 bg-emerald-50/20">
                          {formatCOP(Math.round(auxBaseHourly * sunHolDayExtMult))} / h
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/20">
                          {formatCOP(Math.round(driverBaseHourly * sunHolDayExtMult))} / h
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">Art. 168 numeral 4 CST</td>
                      </tr>

                      {/* 8. Hora Extra Festiva Nocturna */}
                      <tr className="hover:bg-red-50/40 transition-colors bg-red-50/15">
                        <td className="py-2.5 px-3 font-sans font-bold text-red-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-600" />
                          8. Extra Festiva Nocturna (H.E.F.N.)
                        </td>
                        <td className="py-2.5 px-3 font-sans text-red-900">Exceso de jornada en Domingo/Festivo nocturno</td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-lg bg-red-50 border border-red-200/80 font-bold text-red-700 text-xs shadow-2xs hover:border-red-400 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 focus-within:bg-white transition-all">
                            <span>+</span>
                            <input
                              type="number"
                              min={0}
                              max={500}
                              step={1}
                              value={sunHolNightExtPct}
                              onChange={(e) => handleSurchargePercentChange('sundayHolidayOvertimeNightRate', Number(e.target.value))}
                              className="w-9 text-center bg-transparent border-0 p-0 text-xs font-bold text-red-700 focus:outline-none focus:text-red-900"
                              title="Modificar recargo hora extra festiva nocturna (%)"
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-red-900">{sunHolNightExtMult.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-900 bg-emerald-50/20">
                          {formatCOP(Math.round(auxBaseHourly * sunHolNightExtMult))} / h
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/20">
                          {formatCOP(Math.round(driverBaseHourly * sunHolNightExtMult))} / h
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">Art. 168 numeral 4 CST</td>
                      </tr>

                      {/* 9. Auxilio Legal de Transporte */}
                      <tr className="bg-emerald-50/50 hover:bg-emerald-50 transition-colors border-t-2 border-emerald-300">
                        <td className="py-2.5 px-3 font-sans font-bold text-emerald-950 flex items-center gap-1.5">
                          <span>🚌</span>
                          Auxilio Legal de Transporte (Ley 15/1959)
                        </td>
                        <td className="py-2.5 px-3 font-sans text-emerald-900">Hasta 2 SMMLV ({formatCOP(smmlvVal * 2).replace('COP', '').trim()} COP)</td>
                        <td className="py-2.5 px-2 text-center text-emerald-700 font-bold">Obligatorio</td>
                        <td className="py-2.5 px-2 text-center font-bold text-emerald-900">Mensual</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-950">
                          {formatCOP(laborForm.auxilioTransporteLegal)} / mes
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-950">
                          {driverSal <= (smmlvVal * 2) ? `${formatCOP(laborForm.auxilioTransporteLegal)} / mes` : 'Excede 2 SMMLV'}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-emerald-800 text-[10px]">
                          {formatCOP(Math.round(laborForm.auxilioTransporteLegal / 30))} / día ({formatCOP(Math.round((laborForm.auxilioTransporteLegal / 30) / 8))} / h)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Fórmula del Divisor Mensual y Valor Hora:</strong> Con el divisor actual configurado en <strong>{monthlyDivisor} horas/mes</strong>, el valor de 1 hora ordinaria base para un salario mínimo de <strong>{formatCOP(smmlvVal)}</strong> es de <strong>{formatCOP(auxBaseHourly)}/h</strong> (<code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold font-mono">Salario ÷ {monthlyDivisor}h</code>). Puedes modificar el divisor o las horas semanales en cualquier momento desde el panel superior.
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SECCIÓN 3: CALCULADORA Y DESGLOSE COMPLETO DE GASTOS FISCALES & PRESTACIONALES */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs shadow-purple-500/20">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    Liquidación de Gastos Fiscales, Seguridad Social & Parafiscales (CST Colombia)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cálculo pormenorizado en tiempo real de todas las cargas legales a cargo de la empresa (Prestaciones 21.83%, Seguridad Social y Parafiscales).
                  </p>
                </div>
              </div>

              {/* Toggle Beneficio Ley 1607 / Art. 114-1 E.T. */}
              <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl flex items-center gap-3 shrink-0">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={laborForm.isTaxExemptLey1607}
                    onChange={(e) => updateLaborField('isTaxExemptLey1607', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-xs font-black text-purple-950 block">
                      Beneficio Tributario Ley 1607 / Art. 114-1 E.T.
                    </span>
                    <span className="text-[10px] text-purple-700 block">
                      {laborForm.isTaxExemptLey1607
                        ? '✓ EXONERADO: Salud (8.5%), SENA (2%) e ICBF (3%) = $0 (Ahorro 13.5%)'
                        : '✗ RÉGIMEN PLENO: Se liquidan Salud 8.5%, SENA 2% e ICBF 3%'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Parámetros Legales Base */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">SMMLV Oficial 2026</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={laborForm.smmlv}
                    onChange={(e) => updateLaborField('smmlv', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-purple-500"
                  />
                  <span className="text-[11px] text-slate-400 font-mono">COP</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Auxilio Legal de Transporte</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={laborForm.auxilioTransporteLegal}
                    onChange={(e) => updateLaborField('auxilioTransporteLegal', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-purple-500"
                  />
                  <span className="text-[11px] text-slate-400 font-mono">COP</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Tope Auxilio de Transporte</label>
                <div className="text-xs font-extrabold text-blue-900 py-1.5 px-2 bg-blue-50/80 rounded-lg border border-blue-200">
                  Hasta 2 SMMLV: {formatCOP(smmlvVal * 2)}
                </div>
              </div>
            </div>

            {/* TABLA COMPARATIVA FISCAL EN TIEMPO REAL */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Concepto Legal CST</th>
                    <th className="py-2.5 px-2 text-center">% Tasa Legal</th>
                    <th className="py-2.5 px-3 text-right bg-blue-50/50 text-blue-950 font-bold">
                      Conductor ({formatCOP(driverSal)})
                    </th>
                    <th className="py-2.5 px-3 text-right bg-emerald-50/50 text-emerald-950 font-bold">
                      Auxiliar {laborForm.hasHelper ? `(${formatCOP(helperSal)})` : '(Inactivo)'}
                    </th>
                    <th className="py-2.5 px-3 text-right bg-purple-50/50 text-purple-950 font-black">
                      Total Cuadrilla / Mes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">

                  {/* GRUPO I: DEVENGADO BÁSICO Y AUXILIO */}
                  <tr className="bg-slate-50/60 font-sans font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                    <td colSpan={5} className="py-1.5 px-3">I. Remuneración Básico Mensual & Auxilio</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-900">Salario Básico Mensual</td>
                    <td className="py-2 px-2 text-center text-slate-500 font-semibold">100.0%</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-slate-400 font-normal">$</span>
                        <input
                          type="number"
                          step={10000}
                          value={laborForm.driverSalary}
                          onChange={(e) => updateLaborField('driverSalary', Number(e.target.value))}
                          className="w-28 text-right px-1.5 py-0.5 text-xs font-bold text-slate-900 border border-slate-200 rounded focus:border-blue-500 focus:bg-white bg-slate-50/50"
                          title="Modificar salario básico mensual del conductor"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {laborForm.hasHelper ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400 font-normal">$</span>
                          <input
                            type="number"
                            step={10000}
                            value={laborForm.helperSalary}
                            onChange={(e) => updateLaborField('helperSalary', Number(e.target.value))}
                            className="w-28 text-right px-1.5 py-0.5 text-xs font-bold text-slate-900 border border-slate-200 rounded focus:border-emerald-500 focus:bg-white bg-slate-50/50"
                            title="Modificar salario básico mensual del auxiliar"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-400">$0</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-black text-slate-950 bg-slate-50">{formatCOP(cuadrillaTotalSalario)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">
                      Auxilio Legal de Transporte (Ley 15 de 1959)
                      <span className="text-[10px] text-slate-400 block font-normal">Aplica si devenga ≤ 2 SMMLV. Base para prestaciones</span>
                    </td>
                    <td className="py-2 px-2 text-center text-slate-500">Fijo</td>
                    <td className="py-2 px-3 text-right text-blue-900 font-semibold">{formatCOP(driverAux)}</td>
                    <td className="py-2 px-3 text-right text-emerald-900 font-semibold">{formatCOP(helperAux)}</td>
                    <td className="py-2 px-3 text-right font-bold text-purple-900 bg-purple-50/20">{formatCOP(cuadrillaTotalAuxilio)}</td>
                  </tr>

                  {/* GRUPO II: PRESTACIONES SOCIALES LEGALES */}
                  <tr className="bg-slate-50/60 font-sans font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                    <td colSpan={5} className="py-1.5 px-3">
                      II. Prestaciones Sociales a Cargo del Empleador ({((Number(laborForm.primaServiciosRate) + Number(laborForm.cesantiasRate) + Number(laborForm.interesesCesantiasRate) + Number(laborForm.vacacionesRate)) * 100).toFixed(2)}%)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Prima de Servicios (Art. 306 CST)</td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 text-xs shadow-2xs hover:border-slate-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={Number(((laborForm.primaServiciosRate || 0.0833) * 100).toFixed(2))}
                          onChange={(e) => updateLaborField('primaServiciosRate', (Number(e.target.value) || 0) / 100)}
                          className="w-12 text-center bg-transparent border-0 p-0 text-xs font-semibold text-slate-700 focus:outline-none focus:text-slate-900"
                          title="Modificar porcentaje legal de prima de servicios"
                        />
                        <span className="text-slate-400 text-[11px]">%</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(driverPrima)}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(helperPrima)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 bg-slate-50">{formatCOP(driverPrima + helperPrima)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Cesantías (Art. 249 CST)</td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 text-xs shadow-2xs hover:border-slate-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={Number(((laborForm.cesantiasRate || 0.0833) * 100).toFixed(2))}
                          onChange={(e) => updateLaborField('cesantiasRate', (Number(e.target.value) || 0) / 100)}
                          className="w-12 text-center bg-transparent border-0 p-0 text-xs font-semibold text-slate-700 focus:outline-none focus:text-slate-900"
                          title="Modificar porcentaje legal de cesantías"
                        />
                        <span className="text-slate-400 text-[11px]">%</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(driverCesantias)}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(helperCesantias)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 bg-slate-50">{formatCOP(driverCesantias + helperCesantias)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Intereses sobre Cesantías (Ley 52 de 1975)</td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 text-xs shadow-2xs hover:border-slate-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={Number(((laborForm.interesesCesantiasRate || 0.0100) * 100).toFixed(2))}
                          onChange={(e) => updateLaborField('interesesCesantiasRate', (Number(e.target.value) || 0) / 100)}
                          className="w-12 text-center bg-transparent border-0 p-0 text-xs font-semibold text-slate-700 focus:outline-none focus:text-slate-900"
                          title="Modificar porcentaje legal mensual de intereses de cesantías"
                        />
                        <span className="text-slate-400 text-[11px]">%</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(driverIntereses)}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(helperIntereses)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 bg-slate-50">{formatCOP(driverIntereses + helperIntereses)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Vacaciones (Art. 186 CST - 15 días hábiles/año)</td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 text-xs shadow-2xs hover:border-slate-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={Number(((laborForm.vacacionesRate || 0.0417) * 100).toFixed(2))}
                          onChange={(e) => updateLaborField('vacacionesRate', (Number(e.target.value) || 0) / 100)}
                          className="w-12 text-center bg-transparent border-0 p-0 text-xs font-semibold text-slate-700 focus:outline-none focus:text-slate-900"
                          title="Modificar porcentaje legal de vacaciones"
                        />
                        <span className="text-slate-400 text-[11px]">%</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(driverVacaciones)}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(helperVacaciones)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 bg-slate-50">{formatCOP(driverVacaciones + helperVacaciones)}</td>
                  </tr>
                  <tr className="bg-blue-50/20 font-bold">
                    <td className="py-2 px-3 font-sans text-blue-950">Subtotal Prestaciones Sociales</td>
                    <td className="py-2 px-2 text-center text-blue-800 font-extrabold">
                      {((Number(laborForm.primaServiciosRate) + Number(laborForm.cesantiasRate) + Number(laborForm.interesesCesantiasRate) + Number(laborForm.vacacionesRate)) * 100).toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right text-blue-900">{formatCOP(driverSubtotalPrestaciones)}</td>
                    <td className="py-2 px-3 text-right text-emerald-900">{formatCOP(helperSubtotalPrestaciones)}</td>
                    <td className="py-2 px-3 text-right text-purple-950 bg-purple-50/40">{formatCOP(cuadrillaTotalPrestaciones)}</td>
                  </tr>

                  {/* GRUPO III: SEGURIDAD SOCIAL EMPLEADOR */}
                  <tr className="bg-slate-50/60 font-sans font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                    <td colSpan={5} className="py-1.5 px-3">III. Seguridad Social a Cargo del Empleador</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Pensión Empleador (Ley 100 de 1993)</td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 text-xs shadow-2xs hover:border-slate-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={Number(((laborForm.pensionRate || 0.1200) * 100).toFixed(2))}
                          onChange={(e) => updateLaborField('pensionRate', (Number(e.target.value) || 0) / 100)}
                          className="w-12 text-center bg-transparent border-0 p-0 text-xs font-semibold text-slate-700 focus:outline-none focus:text-slate-900"
                          title="Modificar tasa legal de pensión empleador"
                        />
                        <span className="text-slate-400 text-[11px]">%</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(driverPension)}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(helperPension)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 bg-slate-50">{formatCOP(driverPension + helperPension)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">
                      Salud Empleador
                      {laborForm.isTaxExemptLey1607 && (
                        <span className="text-[10px] text-emerald-600 font-bold block">✓ Exonerado por Ley 1607 (Art. 114-1 E.T.)</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      {laborForm.isTaxExemptLey1607 ? (
                        <span className="text-emerald-700 font-bold px-2 py-0.5 bg-emerald-50 rounded">0.0%</span>
                      ) : (
                        <div className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 text-xs shadow-2xs hover:border-slate-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={Number(((laborForm.saludRate || 0.0850) * 100).toFixed(2))}
                            onChange={(e) => updateLaborField('saludRate', (Number(e.target.value) || 0) / 100)}
                            className="w-12 text-center bg-transparent border-0 p-0 text-xs font-semibold text-slate-700 focus:outline-none focus:text-slate-900"
                            title="Modificar tasa legal de salud empleador"
                          />
                          <span className="text-slate-400 text-[11px]">%</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(driverSalud)}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(helperSalud)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 bg-slate-50">{formatCOP(driverSalud + helperSalud)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">
                      Riesgos Laborales ARL (Conductor: Riesgo IV / Auxiliar: Riesgo III)
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="inline-flex items-center px-1 py-0.5 rounded bg-white border border-slate-200 shadow-2xs" title="Tasa ARL Conductor (%)">
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            max="100"
                            value={Number(((laborForm.arlRiskLevelRate || 0.0435) * 100).toFixed(3))}
                            onChange={(e) => updateLaborField('arlRiskLevelRate', (Number(e.target.value) || 0) / 100)}
                            className="w-13 text-center bg-transparent border-0 p-0 text-[11px] font-semibold text-slate-700 focus:outline-none focus:text-slate-900"
                          />
                          <span className="text-slate-400 text-[10px]">%</span>
                        </div>
                        <span className="text-slate-300">/</span>
                        <div className="inline-flex items-center px-1 py-0.5 rounded bg-white border border-slate-200 shadow-2xs" title="Tasa ARL Auxiliar (%)">
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            max="100"
                            value={Number(((laborForm.arlRiskLevelRateHelper || 0.02436) * 100).toFixed(3))}
                            onChange={(e) => updateLaborField('arlRiskLevelRateHelper', (Number(e.target.value) || 0) / 100)}
                            className="w-13 text-center bg-transparent border-0 p-0 text-[11px] font-semibold text-slate-700 focus:outline-none focus:text-slate-900"
                          />
                          <span className="text-slate-400 text-[10px]">%</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(driverArl)}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(helperArl)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 bg-slate-50">{formatCOP(driverArl + helperArl)}</td>
                  </tr>
                  <tr className="bg-sky-50/20 font-bold">
                    <td className="py-2 px-3 font-sans text-sky-950">Subtotal Seguridad Social Empleador</td>
                    <td className="py-2 px-2 text-center text-sky-800 font-extrabold">
                      {((Number(laborForm.pensionRate) + (laborForm.isTaxExemptLey1607 ? 0 : Number(laborForm.saludRate)) + Number(laborForm.arlRiskLevelRate)) * 100).toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right text-blue-900">{formatCOP(driverSubtotalSeguridad)}</td>
                    <td className="py-2 px-3 text-right text-emerald-900">{formatCOP(helperSubtotalSeguridad)}</td>
                    <td className="py-2 px-3 text-right text-purple-950 bg-purple-50/40">{formatCOP(cuadrillaTotalSeguridad)}</td>
                  </tr>

                  {/* GRUPO IV: APORTES PARAFISCALES */}
                  <tr className="bg-slate-50/60 font-sans font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                    <td colSpan={5} className="py-1.5 px-3">IV. Aportes Parafiscales</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Caja de Compensación Familiar (Comfama / Comfenalco)</td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 text-xs shadow-2xs hover:border-slate-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={Number(((laborForm.cajaCompensacionRate || 0.0400) * 100).toFixed(2))}
                          onChange={(e) => updateLaborField('cajaCompensacionRate', (Number(e.target.value) || 0) / 100)}
                          className="w-12 text-center bg-transparent border-0 p-0 text-xs font-semibold text-slate-700 focus:outline-none focus:text-slate-900"
                          title="Modificar porcentaje legal de caja de compensación familiar"
                        />
                        <span className="text-slate-400 text-[11px]">%</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(driverCaja)}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(helperCaja)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 bg-slate-50">{formatCOP(driverCaja + helperCaja)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">
                      SENA
                      {laborForm.isTaxExemptLey1607 && <span className="text-[10px] text-emerald-600 font-bold block">✓ Exonerado Ley 1607</span>}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      {laborForm.isTaxExemptLey1607 ? (
                        <span className="text-emerald-700 font-bold px-2 py-0.5 bg-emerald-50 rounded">0.0%</span>
                      ) : (
                        <div className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 text-xs shadow-2xs hover:border-slate-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={Number(((laborForm.senaRate || 0.0200) * 100).toFixed(2))}
                            onChange={(e) => updateLaborField('senaRate', (Number(e.target.value) || 0) / 100)}
                            className="w-12 text-center bg-transparent border-0 p-0 text-xs font-semibold text-slate-700 focus:outline-none focus:text-slate-900"
                            title="Modificar porcentaje legal de aporte al SENA"
                          />
                          <span className="text-slate-400 text-[11px]">%</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(driverSena)}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(helperSena)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 bg-slate-50">{formatCOP(driverSena + helperSena)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">
                      ICBF
                      {laborForm.isTaxExemptLey1607 && <span className="text-[10px] text-emerald-600 font-bold block">✓ Exonerado Ley 1607</span>}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      {laborForm.isTaxExemptLey1607 ? (
                        <span className="text-emerald-700 font-bold px-2 py-0.5 bg-emerald-50 rounded">0.0%</span>
                      ) : (
                        <div className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 text-xs shadow-2xs hover:border-slate-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={Number(((laborForm.icbfRate || 0.0300) * 100).toFixed(2))}
                            onChange={(e) => updateLaborField('icbfRate', (Number(e.target.value) || 0) / 100)}
                            className="w-12 text-center bg-transparent border-0 p-0 text-xs font-semibold text-slate-700 focus:outline-none focus:text-slate-900"
                            title="Modificar porcentaje legal de aporte al ICBF"
                          />
                          <span className="text-slate-400 text-[11px]">%</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(driverIcbf)}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(helperIcbf)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 bg-slate-50">{formatCOP(driverIcbf + helperIcbf)}</td>
                  </tr>
                  <tr className="bg-amber-50/20 font-bold">
                    <td className="py-2 px-3 font-sans text-amber-950">Subtotal Aportes Parafiscales</td>
                    <td className="py-2 px-2 text-center text-amber-800 font-extrabold">
                      {((Number(laborForm.cajaCompensacionRate) + (laborForm.isTaxExemptLey1607 ? 0 : (Number(laborForm.senaRate) + Number(laborForm.icbfRate)))) * 100).toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right text-blue-900">{formatCOP(driverSubtotalParafiscales)}</td>
                    <td className="py-2 px-3 text-right text-emerald-900">{formatCOP(helperSubtotalParafiscales)}</td>
                    <td className="py-2 px-3 text-right text-purple-950 bg-purple-50/40">{formatCOP(cuadrillaTotalParafiscales)}</td>
                  </tr>

                  {/* GRUPO V: DOTACIÓN Y EPP */}
                  <tr className="bg-slate-50/60 font-sans font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                    <td colSpan={5} className="py-1.5 px-3">V. Dotación Legal & Elementos de Protección Personal (EPP)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Dotación Calzado y Uniforme (3 entregas/año prorrateadas)</td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 text-xs shadow-2xs hover:border-slate-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                        <span className="text-slate-400 text-[10px]">$</span>
                        <input
                          type="number"
                          step={1000}
                          value={laborForm.monthlyDotacionPerPerson}
                          onChange={(e) => updateLaborField('monthlyDotacionPerPerson', Number(e.target.value))}
                          className="w-16 text-center bg-transparent border-0 p-0 text-xs font-semibold text-slate-700 focus:outline-none focus:text-slate-900"
                          title="Modificar dotación mensual por persona"
                        />
                        <span className="text-slate-400 text-[10px]">/mes</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(driverDotacion)}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{formatCOP(helperDotacion)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 bg-slate-50">{formatCOP(cuadrillaTotalDotacion)}</td>
                  </tr>
                </tbody>

                {/* FOOTER TOTALIZADOR CONSOLIDADO */}
                <tfoot>
                  <tr className="bg-slate-900 text-white font-mono font-bold text-xs select-none">
                    <td className="py-3 px-3 font-sans">
                      COSTO TOTAL MENSUAL EMPRESA (COP)
                    </td>
                    <td className="py-3 px-2 text-center text-amber-400 font-sans">
                      Factor Real
                    </td>
                    <td className="py-3 px-3 text-right text-blue-300 bg-slate-800">
                      {formatCOP(driverCostoTotalEmpresa)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-300 bg-slate-800">
                      {laborForm.hasHelper ? formatCOP(helperCostoTotalEmpresa) : '$0'}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-300 bg-slate-950 font-black">
                      {formatCOP(cuadrillaCostoTotalEmpresa)}
                    </td>
                  </tr>

                  <tr className="bg-slate-800 text-slate-200 font-mono text-[11px]">
                    <td className="py-2.5 px-3 font-sans font-bold">
                      FACTOR PRESTACIONAL EFECTIVO (%)
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-400 font-mono">
                      —
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-200 font-bold">
                      +{driverFactorPrestacional.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-200 font-bold">
                      {laborForm.hasHelper ? `+${helperFactorPrestacional.toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-200 font-bold bg-slate-900">
                      +{(((cuadrillaCostoTotalEmpresa - cuadrillaTotalSalario) / (cuadrillaTotalSalario || 1)) * 100).toFixed(1)}% Promedio
                    </td>
                  </tr>

                  <tr className="bg-slate-900 text-white font-mono text-xs border-t border-slate-700">
                    <td className="py-2.5 px-3 font-sans font-bold text-amber-400">
                      COSTO REAL POR HORA EFECTIVA ({monthlyHoursVal}h/mes)
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-400 font-mono">
                      $/h
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-300 font-extrabold bg-slate-800">
                      {formatCOP(driverCostoRealHora)} / h
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-300 font-extrabold bg-slate-800">
                      {laborForm.hasHelper ? `${formatCOP(helperCostoRealHora)} / h` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-400 font-black bg-slate-950">
                      {formatCOP(cuadrillaCostoRealHora)} / h
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* BOTÓN DE GUARDADO PRINCIPAL */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Al guardar, los nuevos horarios y tarifas recalculan inmediatamente todas las rutas registradas y los despachos.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleApplySmmlv2026}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer 2026</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-none py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-colors shadow-sm flex items-center justify-center gap-2 shadow-blue-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Parámetros de Horarios, Nómina y Fiscales</span>
                </button>
              </div>
            </div>

          </div>

        </form>
      )}

      {/* 2. COMBUSTIBLE ACPM Y MANTENIMIENTOS SICE-TAC (EDITABLES) */}
      {activeTab === 'fuel_and_maintenance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Tarjeta ACPM */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Combustible ACPM (Diésel)</h3>
                  <p className="text-xs text-slate-500">Tarifa por galón y rendimientos operativos</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Precio por Galón ACPM (COP)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={fuelPrice}
                      onChange={(e) => setFuelPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-500">COP/gal</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Actualiza este valor cuando MinMinas o Ecopetrol modifiquen el precio del galón</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Camión NPR (2 Ejes / 4.8T)</span>
                    <label className="text-[10px] text-slate-500 block">Rendimiento (km/gal):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={nprKmPerGal}
                      onChange={(e) => setNprKmPerGal(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-blue-900 bg-white"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Costo estimado: {formatCOP(Math.round(fuelPrice / (nprKmPerGal || 22.5)))} / km
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Camión NLR (Liviano / 3.0T)</span>
                    <label className="text-[10px] text-slate-500 block">Rendimiento (km/gal):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={nlrKmPerGal}
                      onChange={(e) => setNlrKmPerGal(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-blue-900 bg-white"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Costo estimado: {formatCOP(Math.round(fuelPrice / (nlrKmPerGal || 31.0)))} / km
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta Mantenimientos SICE-TAC */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Mantenimientos y Desgaste (SICE-TAC)</h3>
                  <p className="text-xs text-slate-500">Tarifas de desgaste por kilómetro recorrido</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Mantenimiento NPR por Km:</span>
                    <span className="text-xs font-bold text-blue-900">{formatCOP(nprMaintenancePerKm)}/km</span>
                  </div>
                  <input
                    type="number"
                    value={nprMaintenancePerKm}
                    onChange={(e) => setNprMaintenancePerKm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-slate-800 bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Incluye: Llantas ($68/km), Aceite ($76/km), Preventivo ($51/km), Correctivo ($75/km), Lavado/Engrase ($56/km)</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Mantenimiento NLR por Km:</span>
                    <span className="text-xs font-bold text-blue-900">{formatCOP(nlrMaintenancePerKm)}/km</span>
                  </div>
                  <input
                    type="number"
                    value={nlrMaintenancePerKm}
                    onChange={(e) => setNlrMaintenancePerKm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-slate-800 bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Incluye: Llantas ($48/km), Aceite ($55/km), Preventivo ($42/km), Correctivo ($55/km), Lavado/Engrase ($47/km)</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveFuelAndMaintenance}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Tarifas de Combustible y Mantenimientos</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. CATÁLOGO DE PEAJES 2026 (EDITABLE Y EXTENSIBLE) */}
      {activeTab === 'tolls_2026' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  Tarifas Oficiales de Peajes por Estación
                </h3>
                <p className="text-xs text-slate-500">
                  Valores editables directamente para adaptar a futuros aumentos de tarifas de Invías y concesiones viales.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsAddingToll(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Peaje</span>
                </button>

                <button
                  onClick={handleRestoreTolls}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Restablecer tarifas oficiales iniciales 2026"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restaurar Oficiales</span>
                </button>
              </div>
            </div>

            {/* Formulario de Agregar Nuevo Peaje */}
            {isAddingToll && (
              <form onSubmit={handleAddNewToll} className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 uppercase">Nueva Estación de Peaje</span>
                  <button type="button" onClick={() => setIsAddingToll(false)} className="text-xs text-slate-500 hover:text-slate-800">
                    Cancelar
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Nombre del Peaje</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Peaje Guarne"
                      value={newTollForm.name}
                      onChange={(e) => setNewTollForm({ ...newTollForm, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Concesión / Vía</label>
                    <input
                      type="text"
                      placeholder="Ej: Autopista Medellín - Bogotá"
                      value={newTollForm.corridor}
                      onChange={(e) => setNewTollForm({ ...newTollForm, corridor: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Departamento</label>
                    <input
                      type="text"
                      placeholder="Ej: Antioquia"
                      value={newTollForm.department}
                      onChange={(e) => setNewTollForm({ ...newTollForm, department: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tarifa NPR (Cat II)</label>
                    <input
                      type="number"
                      required
                      value={newTollForm.tariffNprCOP}
                      onChange={(e) => setNewTollForm({ ...newTollForm, tariffNprCOP: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tarifa NLR (Cat I)</label>
                    <input
                      type="number"
                      required
                      value={newTollForm.tariffNlrCOP}
                      onChange={(e) => setNewTollForm({ ...newTollForm, tariffNlrCOP: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Guardar Peaje
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Barra de Búsqueda */}
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar estación de peaje..."
                value={tollSearchTerm}
                onChange={(e) => setTollSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            {/* Tabla de Peajes con Edición Directa */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Estación de Peaje</th>
                    <th className="py-2.5 px-3">Concesión / Vía</th>
                    <th className="py-2.5 px-3">Ubicación</th>
                    <th className="py-2.5 px-3 text-right">Tarifa NPR 2 Ejes (COP)</th>
                    <th className="py-2.5 px-3 text-right">Tarifa NLR Camioneta (COP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTolls.map((toll) => (
                    <tr key={toll.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-900">{toll.name}</td>
                      <td className="py-2 px-3 text-slate-600">{toll.corridor}</td>
                      <td className="py-2 px-3 text-slate-500">{toll.department}</td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400 text-[10px]">$</span>
                          <input
                            type="number"
                            step="100"
                            value={toll.tariffNprCOP || 16000}
                            onChange={(e) => handleUpdateTollTariff(toll.id, 'tariffNprCOP', Number(e.target.value))}
                            className="w-28 px-2 py-1 text-right font-extrabold text-blue-900 border border-slate-300 rounded focus:border-blue-600 bg-white"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400 text-[10px]">$</span>
                          <input
                            type="number"
                            step="100"
                            value={toll.tariffNlrCOP || toll.tariffCOP || 12000}
                            onChange={(e) => handleUpdateTollTariff(toll.id, 'tariffNlrCOP', Number(e.target.value))}
                            className="w-28 px-2 py-1 text-right font-semibold text-slate-800 border border-slate-300 rounded focus:border-blue-600 bg-white"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              💡 <strong>Nota Operativa:</strong> Al editar las casillas de tarifas de peajes, los valores se guardan automáticamente en la memoria del sistema para las consultas y cálculos futuros.
            </div>
          </div>
        </div>
      )}

      {/* 4. CALENDARIO FESTIVOS COLOMBIA EDITABLE */}
      {activeTab === 'holidays_calendar' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-purple-600" />
                  Calendario de Festivos Oficiales Colombia
                </h3>
                <p className="text-xs text-slate-500">
                  Días con recargo del 75% obligatorio por Código Sustantivo del Trabajo (Ley Emiliani y Fiestas Cívicas). Puedes agregar días festivos cívicos o quitar días según la operación de SCJ.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar festivo o fecha..."
                    value={holidaySearchTerm}
                    onChange={(e) => setHolidaySearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-600 focus:outline-hidden w-44 sm:w-52"
                  />
                  {holidaySearchTerm && (
                    <button
                      onClick={() => setHolidaySearchTerm('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingHoliday(!isAddingHoliday)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shadow-purple-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingHoliday ? 'Cerrar' : '+ Agregar Festivo'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetHolidays}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Restablecer los 18 festivos oficiales colombianos de 2026"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer (18)</span>
                </button>

                <span className="px-3 py-1.5 bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold shrink-0">
                  {holidays.length} Días Festivos Activos
                </span>
              </div>
            </div>

            {/* Formulario para agregar nuevo día festivo */}
            {isAddingHoliday && (
              <form onSubmit={handleAddNewHoliday} className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50/50 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                  <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-purple-600" />
                    Nuevo Día Festivo en el Calendario
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingHoliday(false)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Fecha del Festivo *</label>
                    <input
                      type="date"
                      required
                      value={newHolidayForm.date}
                      onChange={(e) => setNewHolidayForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-purple-200 bg-white font-mono focus:border-purple-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre del Festivo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Feria de las Flores, Aniversario SCJ"
                      value={newHolidayForm.name}
                      onChange={(e) => setNewHolidayForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-purple-200 bg-white focus:border-purple-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Tipo de Festivo</label>
                    <select
                      value={newHolidayForm.type}
                      onChange={(e) => setNewHolidayForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-purple-200 bg-white focus:border-purple-600 focus:outline-hidden"
                    >
                      <option value="LOCAL_CIVICO">Festivo Local / Cívico</option>
                      <option value="PERSONALIZADO">Personalizado Empresa SCJ</option>
                      <option value="CIVIL">Festivo Civil Nacional</option>
                      <option value="RELIGIOSO_EMILIANI">Religioso (Ley Emiliani)</option>
                      <option value="PATRIO">Fiesta Patria</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Descripción / Motivo</label>
                    <input
                      type="text"
                      placeholder="Ej. Cierre comercial y recargo operativo"
                      value={newHolidayForm.description}
                      onChange={(e) => setNewHolidayForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-purple-200 bg-white focus:border-purple-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingHoliday(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs shadow-purple-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Festivo en Calendario</span>
                  </button>
                </div>
              </form>
            )}

            {/* Listado en cuadrícula de festivos */}
            {filteredHolidays.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-sm font-semibold text-slate-600">No se encontraron días festivos con ese criterio.</p>
                <button
                  type="button"
                  onClick={handleResetHolidays}
                  className="px-3.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer los 18 festivos oficiales 2026</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
                {filteredHolidays.map((h) => {
                  const dateParts = h.date.split('-');
                  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                  const monthIndex = parseInt(dateParts[1], 10) - 1;
                  const monthStr = monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : dateParts[1];
                  const dayStr = dateParts[2] || '01';
                  const isCustom = h.type === 'LOCAL_CIVICO' || h.type === 'PERSONALIZADO';

                  return (
                    <div
                      key={h.date}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 bg-white group relative ${
                        isCustom
                          ? 'border-purple-300 hover:border-purple-400 hover:bg-purple-50/30 shadow-2xs'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/20'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-950 flex flex-col items-center justify-center shrink-0 border border-purple-200">
                        <span className="text-[10px] uppercase font-bold text-purple-700 leading-none">{monthStr}</span>
                        <span className="text-base font-extrabold leading-tight">{dayStr}</span>
                      </div>

                      <div className="min-w-0 flex-1 pr-6">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate block">
                            {h.name}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 shrink-0">
                            +75%
                          </span>
                          {isCustom && (
                            <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                              Personalizado
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {h.description || 'Festivo nacional'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {h.date} · {
                            h.type === 'RELIGIOSO_EMILIANI' ? 'Ley Emiliani (Lunes)' :
                            h.type === 'PATRIO' ? 'Fiesta Patria' :
                            h.type === 'LOCAL_CIVICO' ? 'Festivo Local' :
                            h.type === 'PERSONALIZADO' ? 'Personalizado Empresa' :
                            'Festivo Cívico'
                          }
                        </span>
                      </div>

                      {/* Botón para quitar el día festivo */}
                      <button
                        type="button"
                        onClick={() => handleRemoveHoliday(h.date, h.name)}
                        className="absolute top-2.5 right-2.5 p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title={`Quitar festivo "${h.name}" (${h.date})`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Nota legal */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong>Sincronización Total con Despachos:</strong> Cuando agregas o quitas un día festivo en este calendario,
                el sistema lo guarda en memoria y lo aplica automáticamente en la liquidación de despachos y cálculo de horas laborales,
                liquidando el recargo legal del 75% (Art. 179 CST) en las fechas configuradas.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SIMULADOR DE LIQUIDACIÓN DE TURNO */}
      {activeTab === 'labor_tester' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Simulador Interactivo de Liquidación de Mano de Obra
            </h3>
            <p className="text-xs text-slate-500">
              Ingresa una fecha y horario para verificar cómo el motor clasifica las horas ordinarias, extras diurnas, extras nocturnas y el recargo dominical/festivo en tiempo real con las tarifas actuales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Fecha del Despacho</label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white"
              />
              {(() => {
                const testDayOfWeek = new Date(`${testDate}T12:00:00`).getDay();
                const dayConfig = (scheduleConfig.dailySchedules || DEFAULT_WORK_SCHEDULE.dailySchedules || []).find(d => d.dayOfWeek === testDayOfWeek);
                const isShortDay = dayConfig && dayConfig.standardHours <= 4 && dayConfig.standardHours > 0;

                return (
                  <div className="mt-1.5 space-y-1">
                    <span className="text-[11px] text-purple-700 font-bold block">
                      {testLaborBreakdown.isSundayOrHoliday
                        ? `⚠️ ${testLaborBreakdown.holidayName || 'Día Festivo / Dominical (+75%)'}`
                        : `Día de la Semana: ${dayConfig?.dayName || 'Ordinario'}`}
                    </span>
                    <span className={`text-[10px] font-semibold block px-2 py-1 rounded leading-tight ${
                      isShortDay
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {dayConfig?.isEnabled
                        ? `Jornada: ${dayConfig.standardHours}h ordinarias (${dayConfig.startTime} a ${dayConfig.endTime || computeEndTime(dayConfig.startTime, dayConfig.standardHours)}). Extras aplican tras superar ${dayConfig.standardHours}h.`
                        : 'Día de descanso legal. Todo el tiempo laborado computa como horas suplementarias o festivas.'
                      }
                    </span>
                  </div>
                );
              })()}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Hora de Salida</label>
              <input
                type="time"
                value={testStartTime}
                onChange={(e) => setTestStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Hora de Llegada</label>
              <input
                type="time"
                value={testEndTime}
                onChange={(e) => setTestEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Resultado de la Simulación */}
          <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-200">
              <div>
                <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wide block">
                  Liquidación Oficial de Turno de Ruta (CST & Ley 2101)
                </span>
                <span className="text-[11px] text-blue-700 font-medium">
                  Duración Total: <strong className="font-mono">{testLaborBreakdown.totalHours} horas</strong> · Jornada base 42h ({defaultLaborConfig.monthlyWorkingHours}h/mes)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-blue-700 font-bold uppercase block">Total Mano de Obra + Auxilio</span>
                <span className="text-lg font-black text-blue-900">
                  {formatCOP(testLaborBreakdown.totalLaborCalculatedCOP + testLaborBreakdown.auxilioTransporteTripCOP)}
                </span>
              </div>
            </div>

            {/* Resumen Superior */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-white rounded-lg border border-blue-100">
                <span className="text-[10px] text-slate-500 block">Total Horas</span>
                <span className="text-base font-bold text-slate-900">{testLaborBreakdown.totalHours} h</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-blue-100">
                <span className="text-[10px] text-slate-500 block">Mano de Obra (Horas)</span>
                <span className="text-base font-bold text-blue-800">{formatCOP(testLaborBreakdown.totalLaborCalculatedCOP)}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                <span className="text-[10px] text-emerald-700 block">Auxilio Transporte Proporcional</span>
                <span className="text-base font-bold text-emerald-800">{formatCOP(testLaborBreakdown.auxilioTransporteTripCOP)}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                <span className="text-[10px] text-purple-700 block">Día de Operación</span>
                <span className="text-xs font-bold text-purple-900 truncate block">
                  {testLaborBreakdown.isSundayOrHoliday ? '⚠️ Domingo / Festivo' : 'Día Ordinario (Lun-Sáb)'}
                </span>
              </div>
            </div>

            {/* Desglose Detallado de las 8 Modalidades de Horas CST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">

              {/* 1. Ordinaria Diurna */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-800">1. Ordinaria Diurna (HOD)</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">100%</span>
                </div>
                <span className="text-sm font-black text-slate-900 block">{formatCOP(testLaborBreakdown.regularPayCOP)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {testLaborBreakdown.regularHours}h a ${laborForm.hourlyOrdinaryRate?.toLocaleString('es-CO')}/h
                </span>
              </div>

              {/* 2. Ordinaria Nocturna */}
              <div className="bg-white p-3 rounded-lg border border-indigo-200 bg-indigo-50/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-indigo-900">2. Ordinaria Nocturna (HON)</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">+35%</span>
                </div>
                <span className="text-sm font-black text-indigo-900 block">{formatCOP(testLaborBreakdown.nightRegularPayCOP)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {testLaborBreakdown.nightRegularHours}h a ${Math.round(laborForm.hourlyOrdinaryRate * 1.35).toLocaleString('es-CO')}/h
                </span>
              </div>

              {/* 3. Extra Diurna */}
              <div className="bg-white p-3 rounded-lg border border-blue-200 bg-blue-50/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-blue-900">3. Extra Diurna (HED)</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">+25%</span>
                </div>
                <span className="text-sm font-black text-blue-900 block">{formatCOP(testLaborBreakdown.dayOvertimePayCOP)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {testLaborBreakdown.daytimeOvertimeHours}h a ${laborForm.hourlyOvertimeDayRate?.toLocaleString('es-CO')}/h
                </span>
              </div>

              {/* 4. Extra Nocturna */}
              <div className="bg-white p-3 rounded-lg border border-purple-200 bg-purple-50/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-purple-900">4. Extra Nocturna (HEN)</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">+75%</span>
                </div>
                <span className="text-sm font-black text-purple-900 block">{formatCOP(testLaborBreakdown.nightOvertimePayCOP)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {testLaborBreakdown.nighttimeOvertimeHours}h a ${laborForm.hourlyOvertimeNightRate?.toLocaleString('es-CO')}/h
                </span>
              </div>

              {/* 5. Festiva Diurna Ordinaria */}
              <div className="bg-white p-3 rounded-lg border border-amber-200 bg-amber-50/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-amber-900">5. Festiva Diurna (HDF)</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">+75%</span>
                </div>
                <span className="text-sm font-black text-amber-900 block">{formatCOP(testLaborBreakdown.sundayHolidayRegularPayCOP)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {testLaborBreakdown.sundayHolidayRegularHours}h a ${Math.round(laborForm.hourlyOrdinaryRate * 1.75).toLocaleString('es-CO')}/h
                </span>
              </div>

              {/* 6. Festiva Nocturna Ordinaria */}
              <div className="bg-white p-3 rounded-lg border border-orange-200 bg-orange-50/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-orange-900">6. Festiva Nocturna (HDFN)</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">+110%</span>
                </div>
                <span className="text-sm font-black text-orange-900 block">{formatCOP(testLaborBreakdown.sundayHolidayNightPayCOP)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {testLaborBreakdown.sundayHolidayNightHours}h a ${Math.round(laborForm.hourlyOrdinaryRate * 2.10).toLocaleString('es-CO')}/h
                </span>
              </div>

              {/* 7. Extra Festiva Diurna */}
              <div className="bg-white p-3 rounded-lg border border-rose-200 bg-rose-50/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-rose-900">7. Extra Festiva Diurna (HEFD)</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">200%</span>
                </div>
                <span className="text-sm font-black text-rose-900 block">{formatCOP(testLaborBreakdown.sundayHolidayDayOvertimePayCOP)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {testLaborBreakdown.sundayHolidayDayOvertimeHours}h a ${Math.round(laborForm.hourlyOrdinaryRate * 2.00).toLocaleString('es-CO')}/h
                </span>
              </div>

              {/* 8. Extra Festiva Nocturna */}
              <div className="bg-white p-3 rounded-lg border border-red-300 bg-red-50/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-red-950">8. Extra Festiva Nocturna (HEFN)</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-800">250%</span>
                </div>
                <span className="text-sm font-black text-red-900 block">{formatCOP(testLaborBreakdown.sundayHolidayNightOvertimePayCOP)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {testLaborBreakdown.sundayHolidayNightOvertimeHours}h a ${Math.round(laborForm.hourlyOrdinaryRate * 2.50).toLocaleString('es-CO')}/h
                </span>
              </div>

            </div>

            {/* Auxilio de Transporte Proporcional */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  🚌
                </div>
                <div>
                  <span className="font-bold text-emerald-950 block">Auxilio Legal de Transporte Proporcional al Viaje</span>
                  <span className="text-[10px] text-emerald-700">
                    Ley 15 de 1959 · Tarifa mensual: {formatCOP(laborForm.auxilioTransporteLegal)} · Diario: {formatCOP(Math.round(laborForm.auxilioTransporteLegal / 30))} (Jornada {testLaborBreakdown.totalHours}h)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Liquidado Viaje</span>
                <span className="font-black text-emerald-950 text-sm">{formatCOP(testLaborBreakdown.auxilioTransporteTripCOP)}</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
