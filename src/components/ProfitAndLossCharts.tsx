import { FinancialReportModal } from './FinancialReportModal';
import React, { useState, useMemo, useEffect } from 'react';
import { RouteCostBreakdown, DeliveryRoute, VehicleProfile, LaborConfig, TripDispatch } from '../types/logistics';
import { formatCOP, formatNumber } from '../utils/costCalculator';
import { getCustomStaff, CrewMemberResource, saveCustomStaff } from '../data/fleetAndCrewData';
import { useAuth } from '../context/AuthContext';
import { subscribeToStaffFromFirestore } from '../services/firebase';
import { 
  getMonthlyAttendance, 
  saveMonthlyAttendance, 
  markAllFullMonthAttendance, 
  calculateStaffMonthlyEmployerCost, 
  countMemberTripsInMonth,
  StaffAttendanceRecord,
  StaffMonthlyCostBreakdown 
} from '../data/monthlyStaffAttendance';
import { StaffDailyAttendanceModal } from './StaffDailyAttendanceModal';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight, 
  Fuel, 
  Receipt, 
  Wrench,
  Sparkles,
  Truck,
  Calendar,
  AlertCircle,
  Users,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  Scale,
  FileText,
  Info,
  Award,
  HelpCircle,
  X,
  SlidersHorizontal,
  ArrowRight,
  Building2,
  CalendarCheck2,
  Briefcase
} from 'lucide-react';

interface ProfitAndLossChartsProps {
  breakdowns: RouteCostBreakdown[];
  selectedVehicle: VehicleProfile;
  laborConfig: LaborConfig;
  dispatches?: TripDispatch[];
  onSelectRouteDetail?: (breakdown: RouteCostBreakdown) => void;
  onNavigateToDispatch?: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const ProfitAndLossCharts: React.FC<ProfitAndLossChartsProps> = ({
  breakdowns,
  selectedVehicle,
  laborConfig,
  dispatches = [],
  onSelectRouteDetail,
  onNavigateToDispatch
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'top_profit' | 'low_margin'>('all');
  
  // 4 Vistas Principales: Despachos Reales, Control de Asistencia y Nómina, Balance Consolidado, Matriz Presupuestal
  const [viewScope, setViewScope] = useState<'payroll_attendance' | 'consolidated_pnl' | 'real_trips' | 'budget'>('payroll_attendance');

  // Estado del Modal de Informes Financieros con Gráficos
  const [isFinancialReportOpen, setIsFinancialReportOpen] = useState<boolean>(false);

  // Estado del Mes para Asistencia y Nómina (por defecto: Mes actual)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(new Date().getMonth());
  const selectedYearMonth = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, '0')}`;
  
  // Modo Progresivo Día a Día para el mes en curso
  const isCurrentMonth = selectedYear === new Date().getFullYear() && selectedMonthIndex === new Date().getMonth();
  const elapsedDays = Math.min(new Date().getDate(), 30);
  const [isProratedDayByDay, setIsProratedDayByDay] = useState<boolean>(true);

  // Lista de personal reactiva y persistente
  const [staffList, setStaffList] = useState<CrewMemberResource[]>(() => getCustomStaff());

  // Registros de Asistencia del mes (progresivo día a día para mes en curso)
  const [attendanceRecords, setAttendanceRecords] = useState<StaffAttendanceRecord[]>(() => {
    const raw = getMonthlyAttendance(selectedYearMonth, staffList, laborConfig);
    if (isCurrentMonth && isProratedDayByDay) {
      return raw.map(r => ({
        ...r,
        daysWorked: Math.min(r.daysWorked, elapsedDays),
        attendedFullMonth: elapsedDays >= 30,
        notes: `Acumulado al día ${elapsedDays} de 30 transcurridos`
      }));
    }
    return raw;
  });

  // Filtros de Asistencia
  const [attendanceRoleFilter, setAttendanceRoleFilter] = useState<'all' | 'CONDUCTOR' | 'AUXILIAR' | 'COORDINADOR'>('all');
  const [attendanceTripFilter, setAttendanceTripFilter] = useState<'all' | 'with_trips' | 'zero_trips'>('all');
  const [attendanceSearch, setAttendanceSearch] = useState<string>('');
  const [attendanceViewMode, setAttendanceViewMode] = useState<'cards' | 'table'>('cards');

  // Modal para detalle de liquidación CST de un colaborador
  const [selectedStaffBreakdown, setSelectedStaffBreakdown] = useState<StaffMonthlyCostBreakdown | null>(null);

  // Modal del calendario diario de asistencia (días, horas y novedades)
  const [dailyEditMember, setDailyEditMember] = useState<StaffAttendanceRecord | null>(null);

  const { isFirebaseConnected } = useAuth();

  // Escuchar cambios de personal y actualizar asistencia (local y Cloud Firestore)
  useEffect(() => {
    const handleStaffUpdate = () => {
      const freshStaff = getCustomStaff();
      setStaffList(freshStaff);
      setAttendanceRecords(getMonthlyAttendance(selectedYearMonth, freshStaff, laborConfig));
    };
    window.addEventListener('scj_staff_updated', handleStaffUpdate);

    let unsubStaff: (() => void) | null = null;
    if (isFirebaseConnected) {
      unsubStaff = subscribeToStaffFromFirestore((cloudStaff) => {
        if (cloudStaff && cloudStaff.length > 0) {
          setStaffList(cloudStaff);
          saveCustomStaff(cloudStaff);
          setAttendanceRecords(getMonthlyAttendance(selectedYearMonth, cloudStaff, laborConfig));
        }
      });
    }

    return () => {
      window.removeEventListener('scj_staff_updated', handleStaffUpdate);
      if (unsubStaff) unsubStaff();
    };
  }, [selectedYearMonth, laborConfig, isFirebaseConnected]);

  // Recargar asistencia al cambiar mes o año (con soporte progresivo día a día)
  useEffect(() => {
    const recs = getMonthlyAttendance(selectedYearMonth, staffList, laborConfig);
    if (isCurrentMonth && isProratedDayByDay) {
      setAttendanceRecords(recs.map(r => ({
        ...r,
        daysWorked: Math.min(r.daysWorked, elapsedDays),
        attendedFullMonth: elapsedDays >= 30,
        notes: `Acumulado al día ${elapsedDays} de 30 transcurridos`
      })));
    } else {
      setAttendanceRecords(recs);
    }
  }, [selectedYearMonth, isCurrentMonth, isProratedDayByDay, elapsedDays]);

  // Manejador para navegar meses
  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonthIndex(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonthIndex(m => m + 1);
    }
  };

  // Guardar y sincronizar cambios en un registro de asistencia
  const handleUpdateRecord = (memberId: string, updates: Partial<StaffAttendanceRecord>) => {
    const updated = attendanceRecords.map(r => {
      if (r.memberId === memberId) {
        const next = { ...r, ...updates };
        if (updates.attendedFullMonth !== undefined) {
          next.daysWorked = updates.attendedFullMonth ? 30 : (updates.daysWorked ?? 20);
        }
        if (updates.daysWorked !== undefined) {
          next.attendedFullMonth = Number(updates.daysWorked) >= 30;
        }
        return next;
      }
      return r;
    });
    setAttendanceRecords(updated);
    saveMonthlyAttendance(selectedYearMonth, updated);
  };

  // Marcar a todo el personal como "Asistió mes completo (30 días)"
  const handleMarkAllFullMonth = () => {
    const updated = markAllFullMonthAttendance(selectedYearMonth, staffList, laborConfig);
    setAttendanceRecords(updated);
  };

  // 1. Cálculos consolidados presupuestales (Matriz SCJ)
  const totalRoutesCount = breakdowns.length;
  const totalRevenue = breakdowns.reduce((acc, b) => acc + (b.route.freightTariffNpr || b.route.freightTariffNlr || 0), 0);
  const totalExpenses = breakdowns.reduce((acc, b) => acc + b.totalTripCost, 0);
  const totalNetProfit = totalRevenue - totalExpenses;
  const averageMarginPct = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

  // Desglose de gastos presupuestales
  const totalFuel = breakdowns.reduce((acc, b) => acc + b.fuelCost, 0);
  const totalLabor = breakdowns.reduce((acc, b) => acc + b.totalLaborCost, 0);
  const totalTolls = breakdowns.reduce((acc, b) => acc + b.tollCost, 0);
  const totalMaint = breakdowns.reduce((acc, b) => acc + b.totalMaintenanceCost, 0);
  const totalPerDiem = breakdowns.reduce((acc, b) => acc + (b.route.viaticosCOP || 0), 0);

  // Porcentajes presupuestales
  const fuelSharePct = totalExpenses > 0 ? (totalFuel / totalExpenses) * 100 : 0;
  const laborSharePct = totalExpenses > 0 ? (totalLabor / totalExpenses) * 100 : 0;
  const tollsSharePct = totalExpenses > 0 ? (totalTolls / totalExpenses) * 100 : 0;
  const maintSharePct = totalExpenses > 0 ? (totalMaint / totalExpenses) * 100 : 0;
  const perDiemSharePct = totalExpenses > 0 ? (totalPerDiem / totalExpenses) * 100 : 0;

  // 2. Despachos cerrados reales
  const settledDispatches = useMemo(() => {
    return dispatches.filter(d => d.status === 'LIQUIDADO');
  }, [dispatches]);

  // Despachos cerrados correspondientes al mes seleccionado
  const monthSettledDispatches = useMemo(() => {
    return settledDispatches.filter(d => {
      return d.departureDate ? d.departureDate.startsWith(selectedYearMonth) : true;
    });
  }, [settledDispatches, selectedYearMonth]);

  const realTripsTotalRevenue = useMemo(() => {
    return settledDispatches.reduce((acc, d) => acc + (d.plannedFreightCOP || 0), 0);
  }, [settledDispatches]);

  const realTripsTotalExpenses = useMemo(() => {
    return settledDispatches.reduce((acc, d) => acc + (d.actualTotalCostCOP || 0), 0);
  }, [settledDispatches]);

  const realTripsTotalBudget = useMemo(() => {
    return settledDispatches.reduce((acc, d) => acc + (d.plannedTotalCostCOP || 0), 0);
  }, [settledDispatches]);

  const realTripsTotalNetProfit = realTripsTotalRevenue - realTripsTotalExpenses;
  const realTripsMarginPct = realTripsTotalRevenue > 0 ? (realTripsTotalNetProfit / realTripsTotalRevenue) * 100 : 0;
  const realTripsVariance = realTripsTotalExpenses - realTripsTotalBudget;

  // Desglose de gastos reales
  const realFuel = settledDispatches.reduce((acc, d) => acc + (d.actualFuelCostCOP || 0), 0);
  const realTolls = settledDispatches.reduce((acc, d) => acc + (d.actualTollCostCOP || 0), 0);
  const realLabor = settledDispatches.reduce((acc, d) => acc + (d.actualLaborCostCOP || d.plannedLaborCOP || 0), 0);
  const realViaticos = settledDispatches.reduce((acc, d) => acc + (d.actualPerDiemCOP || 0), 0);
  const realIncidentals = settledDispatches.reduce((acc, d) => acc + (d.actualIncidentalCOP || 0), 0);

  // 3. Cálculos de Asistencia y Nómina Mensual de Personal
  const monthlyStaffCalculations = useMemo<StaffMonthlyCostBreakdown[]>(() => {
    return attendanceRecords.map(rec => {
      const trips = countMemberTripsInMonth(
        { name: rec.memberName, id: rec.memberId },
        selectedYearMonth,
        settledDispatches
      );
      return calculateStaffMonthlyEmployerCost(rec, laborConfig, trips);
    });
  }, [attendanceRecords, laborConfig, selectedYearMonth, settledDispatches]);

  // Totales de Nómina del Mes
  const payrollTotals = useMemo(() => {
    const totalStaff = monthlyStaffCalculations.length;
    const fullMonthAttended = monthlyStaffCalculations.filter(c => c.attendedFullMonth).length;
    const withTrips = monthlyStaffCalculations.filter(c => c.tripsCompleted > 0).length;
    const zeroTrips = totalStaff - withTrips;

    const totalBaseDevengado = monthlyStaffCalculations.reduce((acc, c) => acc + c.baseDevengado, 0);
    const totalAuxilio = monthlyStaffCalculations.reduce((acc, c) => acc + c.auxilioTransporte, 0);
    const totalPrestaciones = monthlyStaffCalculations.reduce((acc, c) => acc + c.totalPrestaciones, 0);
    const totalSeguridadSocial = monthlyStaffCalculations.reduce((acc, c) => acc + c.totalSeguridadSocial, 0);
    const totalParafiscales = monthlyStaffCalculations.reduce((acc, c) => acc + c.totalParafiscales, 0);
    const totalDotacion = monthlyStaffCalculations.reduce((acc, c) => acc + c.dotacion, 0);
    const totalEmployerPayrollCost = monthlyStaffCalculations.reduce((acc, c) => acc + c.totalEmployerMonthlyCost, 0);

    // Totales por roles
    const driversPayroll = monthlyStaffCalculations
      .filter(c => c.role === 'CONDUCTOR' || c.role === 'POLIFUNCIONAL')
      .reduce((acc, c) => acc + c.totalEmployerMonthlyCost, 0);

    const helpersPayroll = monthlyStaffCalculations
      .filter(c => c.role === 'AUXILIAR')
      .reduce((acc, c) => acc + c.totalEmployerMonthlyCost, 0);

    const coordinatorsPayroll = monthlyStaffCalculations
      .filter(c => c.role === 'COORDINADOR')
      .reduce((acc, c) => acc + c.totalEmployerMonthlyCost, 0);

    return {
      totalStaff,
      fullMonthAttended,
      withTrips,
      zeroTrips,
      totalBaseDevengado,
      totalAuxilio,
      totalPrestaciones,
      totalSeguridadSocial,
      totalParafiscales,
      totalDotacion,
      totalEmployerPayrollCost,
      driversPayroll,
      helpersPayroll,
      coordinatorsPayroll
    };
  }, [monthlyStaffCalculations]);

  // Filtrado de la lista de asistencia
  const filteredStaffCalculations = useMemo(() => {
    return monthlyStaffCalculations.filter(c => {
      // Filtro de rol
      if (attendanceRoleFilter !== 'all') {
        const r = (c.role || '').toUpperCase();
        if (attendanceRoleFilter === 'CONDUCTOR' && r !== 'CONDUCTOR' && r !== 'POLIFUNCIONAL') return false;
        if (attendanceRoleFilter === 'AUXILIAR' && r !== 'AUXILIAR') return false;
        if (attendanceRoleFilter === 'COORDINADOR' && r !== 'COORDINADOR') return false;
      }
      // Filtro de viajes
      if (attendanceTripFilter === 'with_trips' && c.tripsCompleted === 0) return false;
      if (attendanceTripFilter === 'zero_trips' && c.tripsCompleted > 0) return false;
      // Filtro de búsqueda
      if (attendanceSearch.trim()) {
        const q = attendanceSearch.toLowerCase();
        return c.memberName.toLowerCase().includes(q) || c.document.includes(q);
      }
      return true;
    });
  }, [monthlyStaffCalculations, attendanceRoleFilter, attendanceTripFilter, attendanceSearch]);

  // 4. Cálculos para el Balance Consolidado del Mes (P&L Consolidado)
  const monthFreightRevenue = useMemo(() => {
    return monthSettledDispatches.reduce((acc, d) => acc + (d.plannedFreightCOP || 0), 0);
  }, [monthSettledDispatches]);

  const monthFuelCost = useMemo(() => {
    return monthSettledDispatches.reduce((acc, d) => acc + (d.actualFuelCostCOP || 0), 0);
  }, [monthSettledDispatches]);

  const monthTollCost = useMemo(() => {
    return monthSettledDispatches.reduce((acc, d) => acc + (d.actualTollCostCOP || 0), 0);
  }, [monthSettledDispatches]);

  const monthPerDiemCost = useMemo(() => {
    return monthSettledDispatches.reduce((acc, d) => acc + (d.actualPerDiemCOP || 0), 0);
  }, [monthSettledDispatches]);

  const monthIncidentalCost = useMemo(() => {
    return monthSettledDispatches.reduce((acc, d) => acc + (d.actualIncidentalCOP || 0), 0);
  }, [monthSettledDispatches]);

  const monthVariableTripCost = monthFuelCost + monthTollCost + monthPerDiemCost + monthIncidentalCost;
  const monthGrossTransportProfit = monthFreightRevenue - monthVariableTripCost;
  const monthFixedStaffPayroll = payrollTotals.totalEmployerPayrollCost;
  const monthNetOperatingProfit = monthGrossTransportProfit - monthFixedStaffPayroll;
  const monthConsolidatedMarginPct = monthFreightRevenue > 0 ? (monthNetOperatingProfit / monthFreightRevenue) * 100 : 0;

  // Rutas presupuestales
  const routesWithFinancials = useMemo(() => {
    return breakdowns.map(b => {
      const revenue = b.route.freightTariffNpr || b.route.freightTariffNlr || 0;
      const expense = b.totalTripCost;
      const profit = revenue - expense;
      const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;
      return {
        ...b,
        revenue,
        expense,
        profit,
        marginPct
      };
    });
  }, [breakdowns]);

  const profitableRoutesCount = routesWithFinancials.filter(r => r.profit > 0).length;

  const displayedRoutes = useMemo(() => {
    const sorted = [...routesWithFinancials];
    if (filterMode === 'top_profit') {
      return sorted.sort((a, b) => b.profit - a.profit).slice(0, 15);
    }
    if (filterMode === 'low_margin') {
      return sorted.sort((a, b) => a.marginPct - b.marginPct).slice(0, 15);
    }
    return sorted;
  }, [routesWithFinancials, filterMode]);

  const maxBarValue = useMemo(() => {
    return Math.max(...displayedRoutes.map(r => Math.max(r.revenue, r.expense)), 1000000);
  }, [displayedRoutes]);

  return (
    <div className="space-y-6">
      
      {/* Banner Principal de Rendimiento Financiero SCJ */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3 h-3 text-blue-600" />
                {viewScope === 'payroll_attendance' && 'Control de Asistencia & Nómina Mensual'}
                {viewScope === 'consolidated_pnl' && 'Balance General Consolidado (P&L del Mes)'}
                {viewScope === 'real_trips' && 'Operación y Despachos Reales'}
                {viewScope === 'budget' && 'Matriz Presupuestal Referencial'}
              </span>
              <span className="text-xs text-slate-400 font-medium">· Gastos, Nómina & Ganancias SCJ</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shadow-blue-500/20 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span>Gastos, Nómina & Ganancias</span>
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              {viewScope === 'payroll_attendance' &&
                'Marca la asistencia mensual del personal activo (conductores, auxiliares y coordinadores). Así no hayan realizado viajes en carretera, con su horario de trabajo cumplido se calcula su costo básico patronal de nómina.'}
              {viewScope === 'consolidated_pnl' &&
                'Estado de resultados consolidado: Ingresos por fletes cobrados frente a los gastos variables de ruta y la nómina básica fija de todo el personal activo.'}
              {viewScope === 'real_trips' &&
                'Balance financiero de fletes cobrados frente a los gastos reales liquidados en carretera (combustible tanqueado, peajes, viáticos e imprevistos).'}
              {viewScope === 'budget' &&
                'Proyección teórica presupuestada para la red de rutas oficiales SCJ frente a fletes clientes (combustible ACPM, peajes vigentes, nómina CST y mantenimiento SICE-TAC).'}
            </p>
          </div>

          {/* Selector de las 4 Vistas */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setIsFinancialReportOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
              title="Descargar informe financiero consolidado con gráficos vectoriales y filtros de fecha"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Descargar Informe con Gráficos</span>
            </button>

            <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 border border-slate-200/70 shrink-0">
            <button
              onClick={() => setViewScope('payroll_attendance')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewScope === 'payroll_attendance'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Control Asistencia & Nómina</span>
            </button>

            <button
              onClick={() => setViewScope('consolidated_pnl')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewScope === 'consolidated_pnl'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Balance Consolidado P&L</span>
            </button>

            <button
              onClick={() => setViewScope('real_trips')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewScope === 'real_trips'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Despachos Reales ({settledDispatches.length})</span>
            </button>

            <button
              onClick={() => setViewScope('budget')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewScope === 'budget'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Presupuesto Referencial ({totalRoutesCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* ========================================================================= */}
      {/* VISTA 1: CONTROL DE ASISTENCIA & NÓMINA MENSUAL DE PERSONAL               */}
      {/* ========================================================================= */}
      {viewScope === 'payroll_attendance' && (
        <div className="space-y-6">
          
          {/* Barra Superior de Control de Mes y Acciones Globales */}
          <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-blue-950 flex items-center gap-2">
                  Cálculo Progresivo de Nómina
                  {isCurrentMonth && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase">
                      Mes en Curso (Día {elapsedDays} de 30)
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isProratedDayByDay && isCurrentMonth
                    ? `Calculando devengado acumulado a la fecha de hoy (${elapsedDays} de 30 días). No liquida el mes completo hasta que finalice.`
                    : 'Calculando liquidación proyectada sobre el mes completo (30 días estándar CST).'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsProratedDayByDay(true);
                  if (isCurrentMonth) {
                    setAttendanceRecords(prev => prev.map(r => ({
                      ...r,
                      daysWorked: elapsedDays,
                      attendedFullMonth: elapsedDays >= 30,
                      notes: `Acumulado al día ${elapsedDays}`
                    })));
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isProratedDayByDay && isCurrentMonth
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                📅 Acumulado Día a Día (Día {elapsedDays})
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProratedDayByDay(false);
                  setAttendanceRecords(prev => prev.map(r => ({
                    ...r,
                    daysWorked: 30,
                    attendedFullMonth: true,
                    notes: 'Asistencia completa 30 días'
                  })));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isProratedDayByDay || !isCurrentMonth
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                🎯 Proyección Mes Completo (30 Días)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Navegador de Mes / Calendario */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/70 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Período de Nómina</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    title="Mes Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-base font-extrabold text-slate-900 min-w-[150px] text-center">
                    {MONTH_NAMES[selectedMonthIndex]} {selectedYear}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    title="Mes Siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Aviso Explicativo del Cálculo */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-4 py-2.5 max-w-xl text-xs text-blue-900 leading-snug">
              <span className="font-bold flex items-center gap-1.5 text-blue-950 mb-0.5">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                Cálculo de Nómina Básica por Horario y Asistencia
              </span>
              Al final del mes, así el conductor o coordinador <strong>no haya hecho viajes en carretera</strong>, por su horario pactado y estar activo se calcula su costo básico de nómina completo.
            </div>

            {/* Acciones Rápidas */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllFullMonth}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Marca a todos los colaboradores con 30 días de asistencia"
              >
                <Check className="w-4 h-4" />
                <span>Marcar Todos Asistieron Mes Completo (30 d)</span>
              </button>
            </div>
          </div>

          {/* Tarjetas KPI de Nómina del Mes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plantilla Activa</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{payrollTotals.totalStaff} <span className="text-xs font-medium text-slate-500">colaboradores</span></div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>{payrollTotals.fullMonthAttended} con mes completo (30d)</span>
                <span className="font-bold text-blue-700">
                  {((payrollTotals.fullMonthAttended / Math.max(1, payrollTotals.totalStaff)) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actividad en Carretera</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-950">
                {payrollTotals.withTrips} <span className="text-xs font-normal text-slate-500">con viajes</span> · {payrollTotals.zeroTrips} <span className="text-xs font-normal text-slate-500">en base/patio</span>
              </div>
              <span className="text-[11px] text-purple-700 font-semibold block mt-1">
                {payrollTotals.zeroTrips} en coordinación o standby generan costo básico
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Costo Básico Nómina Fija</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-800">{formatCOP(payrollTotals.totalEmployerPayrollCost)}</div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Total costo patronal empresa para {MONTH_NAMES[selectedMonthIndex]}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Promedio por Colaborador</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {formatCOP(payrollTotals.totalStaff > 0 ? payrollTotals.totalEmployerPayrollCost / payrollTotals.totalStaff : 0)}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Incluye sueldo, auxilio, prestaciones y seguridad social
              </span>
            </div>

          </div>

          {/* Barra de Distribución Legal CST de la Nómina */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Composición de Cargas Patronales de Nómina ({formatCOP(payrollTotals.totalEmployerPayrollCost)})
              </h3>
              <div className="text-xs text-slate-500">
                Conductores: <strong>{formatCOP(payrollTotals.driversPayroll)}</strong> · Auxiliares: <strong>{formatCOP(payrollTotals.helpersPayroll)}</strong> · Coordinación: <strong>{formatCOP(payrollTotals.coordinatorsPayroll)}</strong>
              </div>
            </div>

            {/* Segmentos visuales */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
              <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                <span className="text-[10px] font-bold text-blue-900 uppercase block">Sueldos Básicos</span>
                <span className="text-xs font-black text-blue-950">{formatCOP(payrollTotals.totalBaseDevengado)}</span>
              </div>
              <div className="p-2.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl">
                <span className="text-[10px] font-bold text-indigo-900 uppercase block">Auxilio Transporte</span>
                <span className="text-xs font-black text-indigo-950">{formatCOP(payrollTotals.totalAuxilio)}</span>
              </div>
              <div className="p-2.5 bg-purple-50/70 border border-purple-200/80 rounded-xl">
                <span className="text-[10px] font-bold text-purple-900 uppercase block">Prestaciones CST</span>
                <span className="text-xs font-black text-purple-950">{formatCOP(payrollTotals.totalPrestaciones)}</span>
              </div>
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-900 uppercase block">Seguridad Social</span>
                <span className="text-xs font-black text-emerald-950">{formatCOP(payrollTotals.totalSeguridadSocial)}</span>
              </div>
              <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">Parafiscales (Caja)</span>
                <span className="text-xs font-black text-amber-950">{formatCOP(payrollTotals.totalParafiscales)}</span>
              </div>
              <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-700 uppercase block">Dotación Legal</span>
                <span className="text-xs font-black text-slate-900">{formatCOP(payrollTotals.totalDotacion)}</span>
              </div>
            </div>
          </div>

          {/* Filtros de Lista y Buscador */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Filtros por Rol */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">Filtrar:</span>
              <button
                onClick={() => setAttendanceRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  attendanceRoleFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todos ({monthlyStaffCalculations.length})
              </button>
              <button
                onClick={() => setAttendanceRoleFilter('CONDUCTOR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  attendanceRoleFilter === 'CONDUCTOR'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Conductores ({monthlyStaffCalculations.filter(c => c.role === 'CONDUCTOR' || c.role === 'POLIFUNCIONAL').length})
              </button>
              <button
                onClick={() => setAttendanceRoleFilter('AUXILIAR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  attendanceRoleFilter === 'AUXILIAR'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Auxiliares ({monthlyStaffCalculations.filter(c => c.role === 'AUXILIAR').length})
              </button>
              <button
                onClick={() => setAttendanceRoleFilter('COORDINADOR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  attendanceRoleFilter === 'COORDINADOR'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Coordinador ({monthlyStaffCalculations.filter(c => c.role === 'COORDINADOR').length})
              </button>
            </div>

            {/* Filtro por viajes y búsqueda */}
            <div className="flex items-center gap-2">
              <select
                value={attendanceTripFilter}
                onChange={(e) => setAttendanceTripFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados de viaje</option>
                <option value="zero_trips">0 viajes (En patio / standby / coordinación)</option>
                <option value="with_trips">Con viajes en el mes</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar colaborador o cédula..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                />
              </div>

              {/* Botón modo vista (Tarjetas vs Tabla) */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                <button
                  onClick={() => setAttendanceViewMode('cards')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    attendanceViewMode === 'cards' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-500'
                  }`}
                  title="Vista Tarjetas"
                >
                  Tarjetas
                </button>
                <button
                  onClick={() => setAttendanceViewMode('table')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    attendanceViewMode === 'table' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-500'
                  }`}
                  title="Vista Tabla"
                >
                  Tabla
                </button>
              </div>

            </div>

          </div>

          {/* VISTA TARJETAS: CALENDARIO DE ASISTENCIA Y COSTO BÁSICO POR COLABORADOR */}
          {attendanceViewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaffCalculations.map((item) => {
                const isCoordinator = (item.role || '').toUpperCase() === 'COORDINADOR';
                const isHelper = (item.role || '').toUpperCase() === 'AUXILIAR';

                return (
                  <div
                    key={item.memberId}
                    className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-sm ${
                      item.attendedFullMonth 
                        ? 'border-slate-200 hover:border-blue-300' 
                        : 'border-amber-200 bg-amber-50/15'
                    }`}
                  >
                    {/* Encabezado del Colaborador */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-black text-slate-900 tracking-tight">
                              {item.memberName}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${
                              isCoordinator
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : isHelper
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}>
                              {item.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            CC {item.document}
                          </span>
                        </div>

                        {/* Badge de Viajes en el Mes */}
                        <div className="shrink-0 text-right">
                          {item.tripsCompleted > 0 ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-extrabold flex items-center gap-1">
                              <Truck className="w-3 h-3 text-emerald-600" />
                              {item.tripsCompleted} {item.tripsCompleted === 1 ? 'viaje' : 'viajes'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center gap-1" title="Sin viajes en carretera este mes">
                              <Briefcase className="w-3 h-3 text-slate-500" />
                              0 viajes (Standby)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Horario de Trabajo Asignado */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-800">Horario Asignado:</span>
                        </div>
                        <span className="font-bold text-slate-900 text-[11px]">
                          {item.contractSchedule || 'Jornada 42h (Lun - Sáb)'}
                        </span>
                      </div>
                    </div>

                    {/* CONTROL TIPO CALENDARIO DE ASISTENCIA */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      
                      {/* Switch de Asistencia Mes Completo */}
                      <div className="flex items-center justify-between bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 block">
                            ¿Asistió todo el mes a trabajar?
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {item.attendedFullMonth ? 'Asistencia completa (30 días de nómina)' : `${item.daysWorked} días liquidados`}
                          </span>
                        </div>

                        <button
                          onClick={() => handleUpdateRecord(item.memberId, { attendedFullMonth: !item.attendedFullMonth })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            item.attendedFullMonth
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {item.attendedFullMonth ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>SÍ (30d)</span>
                            </>
                          ) : (
                            <span>NO (Parcial)</span>
                          )}
                        </button>
                      </div>

                      {/* Contador / Ajuste de días asistidos (si no asistió mes completo o si desea editar) */}
                      {!item.attendedFullMonth && (
                        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950">Días laborados en el mes:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateRecord(item.memberId, { daysWorked: Math.max(0, item.daysWorked - 1) })}
                                className="w-6 h-6 rounded-md bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold flex items-center justify-center cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-black text-sm text-amber-950 min-w-[24px] text-center">
                                {item.daysWorked}
                              </span>
                              <button
                                onClick={() => handleUpdateRecord(item.memberId, { daysWorked: Math.min(30, item.daysWorked + 1) })}
                                className="w-6 h-6 rounded-md bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold flex items-center justify-center cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Botones de ajuste rápido */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              onClick={() => handleUpdateRecord(item.memberId, { daysWorked: 15 })}
                              className="px-2 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 text-[10px] font-bold rounded text-amber-900"
                            >
                              15 días (Quincena)
                            </button>
                            <button
                              onClick={() => handleUpdateRecord(item.memberId, { daysWorked: 20 })}
                              className="px-2 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 text-[10px] font-bold rounded text-amber-900"
                            >
                              20 días
                            </button>
                            <button
                              onClick={() => handleUpdateRecord(item.memberId, { daysWorked: 30, attendedFullMonth: true })}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded"
                            >
                              Restablecer a 30d
                            </button>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Desglose Económico del Costo Básico Mensual de este Colaborador */}
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Sueldo Base Devengado:</span>
                        <span className="font-bold text-slate-800">{formatCOP(item.baseDevengado)}</span>
                      </div>
                      {item.auxilioTransporte > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Auxilio de Transporte:</span>
                          <span className="font-bold text-slate-800">{formatCOP(item.auxilioTransporte)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Prestaciones Sociales CST:</span>
                        <span className="font-bold text-purple-900">+{formatCOP(item.totalPrestaciones)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Seguridad Social Patronal:</span>
                        <span className="font-bold text-emerald-900">+{formatCOP(item.totalSeguridadSocial)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Parafiscales & Dotación:</span>
                        <span className="font-bold text-amber-900">+{formatCOP(item.totalParafiscales + item.dotacion)}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                            Costo Básico Empresa
                          </span>
                          <span className="text-base font-black text-slate-900">
                            {formatCOP(item.totalEmployerMonthlyCost)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setDailyEditMember(attendanceRecords.find(r => r.memberId === item.memberId) || null)}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 text-emerald-700 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                            title="Registrar día por día: entrada, salida, horas extras, festivas y novedades (llegada tarde, etc.)"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Días y Horas</span>
                          </button>
                          <button
                            onClick={() => setSelectedStaffBreakdown(item)}
                            className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-700 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Ver Detalle CST</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mensaje cuando no tiene viajes */}
                    {item.tripsCompleted === 0 && (
                      <div className="text-[10px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200/60 leading-tight">
                        💡 Este personal no realizó viajes este mes, pero por su contrato activo y horario genera su costo básico de nómina.
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          ) : (
            /* VISTA TABLA: PLANILLA CONSOLIDADA DE ASISTENCIA Y NÓMINA */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-3 px-3">Colaborador / Cédula</th>
                    <th className="py-3 px-3">Rol / Cargo</th>
                    <th className="py-3 px-3">Horario Pactado</th>
                    <th className="py-3 px-3 text-center">Viajes Mes</th>
                    <th className="py-3 px-3 text-center">Asistió Todo el Mes</th>
                    <th className="py-3 px-3 text-center">Días Liq.</th>
                    <th className="py-3 px-3 text-right">Sueldo Base</th>
                    <th className="py-3 px-3 text-right">Prestaciones</th>
                    <th className="py-3 px-3 text-right">Seg. Social</th>
                    <th className="py-3 px-3 text-right">Costo Total Empresa</th>
                    <th className="py-3 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaffCalculations.map((item) => (
                    <tr key={item.memberId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.memberName}</div>
                        <div className="text-[10px] font-mono text-slate-400">CC {item.document}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.role === 'COORDINADOR' ? 'bg-emerald-100 text-emerald-900' : item.role === 'AUXILIAR' ? 'bg-purple-100 text-purple-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {item.contractSchedule || 'Jornada 42h (Lun - Sáb)'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {item.tripsCompleted > 0 ? (
                          <span className="text-emerald-700">{item.tripsCompleted} viajes</span>
                        ) : (
                          <span className="text-slate-400 font-normal">0 viajes</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleUpdateRecord(item.memberId, { attendedFullMonth: !item.attendedFullMonth })}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-black cursor-pointer transition-all ${
                            item.attendedFullMonth
                              ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          }`}
                        >
                          {item.attendedFullMonth ? 'SÍ (30d)' : 'PARCIAL'}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                        {item.daysWorked} d
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                        {formatCOP(item.baseDevengado)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-purple-900 font-medium">
                        {formatCOP(item.totalPrestaciones)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-900 font-medium">
                        {formatCOP(item.totalSeguridadSocial)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        {formatCOP(item.totalEmployerMonthlyCost)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedStaffBreakdown(item)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-bold"
                        >
                          Ver CST
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: BALANCE GENERAL CONSOLIDADO (P&L DEL MES)                        */}
      {/* ========================================================================= */}
      {viewScope === 'consolidated_pnl' && (
        <div className="space-y-6">
          
          {/* Banner de Mes y Explicación del P&L Consolidado */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Período de Análisis Financiero</div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Estado de Resultados Consolidado · {MONTH_NAMES[selectedMonthIndex]} {selectedYear}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Resta de los fletes cobrados los gastos directos de carretera y la <strong>nómina básica completa del personal activo</strong> ({payrollTotals.totalStaff} colaboradores), hayan o no realizado viajes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700"
              >
                ◀ Mes Anterior
              </button>
              <button
                onClick={handleNextMonth}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700"
              >
                Mes Siguiente ▶
              </button>
            </div>
          </div>

          {/* Tarjetas KPI Consolidado del Mes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Fletes Facturados (Mes)</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-blue-950">{formatCOP(monthFreightRevenue)}</div>
              <span className="text-[11px] text-slate-400 block mt-1">
                {monthSettledDispatches.length} despachos liquidados en {MONTH_NAMES[selectedMonthIndex]}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Gastos Variables de Ruta</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Fuel className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-800">{formatCOP(monthVariableTripCost)}</div>
              <span className="text-[11px] text-slate-400 block mt-1">
                ACPM, peajes, viáticos e imprevistos de ruta
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">3. Nómina Fija Personal Activo</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-950">{formatCOP(monthFixedStaffPayroll)}</div>
              <span className="text-[11px] text-slate-400 block mt-1">
                {payrollTotals.totalStaff} colaboradores (conductores, auxiliares y coord.)
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">4. Utilidad Neta Real Mes</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  monthNetOperatingProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl font-black ${
                monthNetOperatingProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {monthNetOperatingProfit >= 0 ? `+${formatCOP(monthNetOperatingProfit)}` : formatCOP(monthNetOperatingProfit)}
              </div>
              <span className={`text-[11px] font-bold block mt-1 ${
                monthNetOperatingProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                Margen neto consolidado: {monthConsolidatedMarginPct.toFixed(1)}%
              </span>
            </div>

          </div>

          {/* Estado de Resultados en Formato Cascada (P&L Breakdown) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
              <FileText className="w-4 h-4 text-blue-600" />
              Estructura Detallada del Balance Mensual (P&L Consolidado)
            </h3>

            <div className="space-y-2 text-xs">
              {/* Ingresos */}
              <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl font-bold text-blue-950">
                <span className="text-sm">(=) INGRESOS POR FLETES (Despachos Reales Liquidados)</span>
                <span className="text-base font-black">{formatCOP(monthFreightRevenue)}</span>
              </div>

              {/* Menos Gastos Variables */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200/60">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>(-) GASTOS VARIABLES DIRECTOS DE CARRETERA:</span>
                  <span className="text-rose-700 font-extrabold">-{formatCOP(monthVariableTripCost)}</span>
                </div>
                <div className="pl-4 space-y-1 text-slate-500 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>· Combustible ACPM Real Tanqueado:</span>
                    <span>{formatCOP(monthFuelCost)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>· Peajes Reales Pagados en Carretera:</span>
                    <span>{formatCOP(monthTollCost)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>· Viáticos y Pernoctadas Entregadas:</span>
                    <span>{formatCOP(monthPerDiemCost)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>· Imprevistos en Vía (Engrase, Báscula, Despinche):</span>
                    <span>{formatCOP(monthIncidentalCost)}</span>
                  </div>
                </div>
              </div>

              {/* Margen de Transporte */}
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl font-extrabold text-slate-900">
                <span>(=) UTILIDAD OPERATIVA DE TRANSPORTE EN RUTA (Fletes - Gastos Carretera):</span>
                <span className={monthGrossTransportProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}>
                  {formatCOP(monthGrossTransportProfit)}
                </span>
              </div>

              {/* Menos Nómina Fija */}
              <div className="p-3 bg-purple-50/60 rounded-xl space-y-2 border border-purple-200/70">
                <div className="flex items-center justify-between font-bold text-purple-950">
                  <span>(-) NÓMINA BÁSICA FIJA DEL PERSONAL ACTIVO ({payrollTotals.totalStaff} Colaboradores):</span>
                  <span className="text-rose-700 font-extrabold">-{formatCOP(monthFixedStaffPayroll)}</span>
                </div>
                <div className="pl-4 space-y-1 text-purple-900 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>· Nómina Fija Conductores y Polifuncionales ({monthlyStaffCalculations.filter(c => c.role === 'CONDUCTOR' || c.role === 'POLIFUNCIONAL').length}):</span>
                    <span>{formatCOP(payrollTotals.driversPayroll)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>· Nómina Fija Auxiliares de Reparto ({monthlyStaffCalculations.filter(c => c.role === 'AUXILIAR').length}):</span>
                    <span>{formatCOP(payrollTotals.helpersPayroll)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>· Nómina Fija Coordinación & Patio Logístico ({monthlyStaffCalculations.filter(c => c.role === 'COORDINADOR').length}):</span>
                    <span>{formatCOP(payrollTotals.coordinatorsPayroll)}</span>
                  </div>
                  <div className="text-[10px] text-purple-700 italic pt-1">
                    * Incluye salarios devengados, auxilio legal de transporte, prestaciones sociales (cesantías, intereses, primas, vacaciones), seguridad social (pensión, salud, ARL), parafiscales y dotación de ley.
                  </div>
                </div>
              </div>

              {/* Utilidad Neta Real */}
              <div className={`flex items-center justify-between p-4 rounded-xl font-black text-sm sm:text-base border ${
                monthNetOperatingProfit >= 0 
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-300' 
                  : 'bg-rose-50 text-rose-950 border-rose-300'
              }`}>
                <div className="space-y-0.5">
                  <span className="block">(=) UTILIDAD NETA REAL DEL MES (EBITDA Operativo Flota SCJ)</span>
                  <span className="text-xs font-semibold opacity-80 block">
                    Resultado neto después de cubrir toda la nómina fija y los gastos de operación
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-black ${monthNetOperatingProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {monthNetOperatingProfit >= 0 ? `+${formatCOP(monthNetOperatingProfit)}` : formatCOP(monthNetOperatingProfit)}
                  </span>
                  <span className="block text-xs font-bold opacity-90">
                    Margen Neto: {monthConsolidatedMarginPct.toFixed(1)}%
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: DESPACHOS REALES LIQUIDADOS                                      */}
      {/* ========================================================================= */}
      {viewScope === 'real_trips' && (
        <div className="space-y-6">
          
          {/* Tarjetas KPI para Despachos Reales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flete Liquidado</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-extrabold text-slate-900">{formatCOP(realTripsTotalRevenue)}</div>
              <span className="text-[11px] text-slate-400 block mt-1">
                {settledDispatches.length} viajes liquidados
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gastos Reales Totales</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-extrabold text-slate-800">{formatCOP(realTripsTotalExpenses)}</div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Combustible, peajes e imprevistos reales
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ganancia Neta Real</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${realTripsTotalNetProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-xl font-extrabold ${realTripsTotalNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {realTripsTotalNetProfit >= 0 ? `+${formatCOP(realTripsTotalNetProfit)}` : formatCOP(realTripsTotalNetProfit)}
              </div>
              <span className={`text-[11px] font-semibold block mt-1 ${realTripsTotalNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                Margen real: {realTripsMarginPct.toFixed(1)}%
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Desviación vs Presupuesto</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${realTripsVariance <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {realTripsVariance <= 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>
              </div>
              <div className={`text-xl font-extrabold ${realTripsVariance <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {realTripsVariance <= 0 ? `-${formatCOP(Math.abs(realTripsVariance))}` : `+${formatCOP(realTripsVariance)}`}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {realTripsVariance <= 0 ? 'Ahorro frente al presupuesto' : 'Sobrecosto frente al presupuesto'}
              </span>
            </div>

          </div>

          {/* Gráfica de Desglose Real de Gastos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
              <PieChart className="w-5 h-5 text-blue-600" />
              Composición de Gastos Reales en Carretera ({formatCOP(realTripsTotalExpenses)})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <div className="text-xs font-bold text-amber-950 mb-0.5">Combustible ACPM</div>
                <div className="text-sm font-extrabold text-amber-900">{formatCOP(realFuel)}</div>
              </div>
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl">
                <div className="text-xs font-bold text-sky-950 mb-0.5">Peajes Oficiales</div>
                <div className="text-sm font-extrabold text-sky-900">{formatCOP(realTolls)}</div>
              </div>
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                <div className="text-xs font-bold text-indigo-950 mb-0.5">Mano de Obra Viaje</div>
                <div className="text-sm font-extrabold text-indigo-900">{formatCOP(realLabor)}</div>
              </div>
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                <div className="text-xs font-bold text-purple-950 mb-0.5">Viáticos de Ruta</div>
                <div className="text-sm font-extrabold text-purple-900">{formatCOP(realViaticos)}</div>
              </div>
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl">
                <div className="text-xs font-bold text-slate-900 mb-0.5">Imprevistos en Vía</div>
                <div className="text-sm font-extrabold text-slate-800">{formatCOP(realIncidentals)}</div>
              </div>
            </div>
          </div>

          {/* Tabla de Despachos Reales */}
          {settledDispatches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No hay despachos cerrados y liquidados aún</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Cuando finalices y liquides viajes en el módulo de Despachos, aparecerán aquí con sus costos de combustible, peajes y viáticos reales.
              </p>
              {onNavigateToDispatch && (
                <button
                  onClick={onNavigateToDispatch}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Ir al Módulo de Despachos & Entradas
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                Historial de Despachos Liquidados ({settledDispatches.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                      <th className="py-2.5 px-3">Planilla / ID</th>
                      <th className="py-2.5 px-3">Ruta / Destino</th>
                      <th className="py-2.5 px-3">Vehículo / Conductor</th>
                      <th className="py-2.5 px-3 text-right">Flete Facturado</th>
                      <th className="py-2.5 px-3 text-right">Gasto Presupuesto</th>
                      <th className="py-2.5 px-3 text-right">Gasto Real</th>
                      <th className="py-2.5 px-3 text-right">Desviación</th>
                      <th className="py-2.5 px-3 text-right">Ganancia Neta</th>
                      <th className="py-2.5 px-3 text-center">Margen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {settledDispatches.map((d) => {
                      const flete = d.plannedFreightCOP || 0;
                      const plannedCost = d.plannedTotalCostCOP || 0;
                      const actualCost = d.actualTotalCostCOP || 0;
                      const variance = actualCost - plannedCost;
                      const profit = flete - actualCost;
                      const marginPct = flete > 0 ? (profit / flete) * 100 : 0;
                      const isAhorro = variance <= 0;

                      return (
                        <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{d.manifestNumber}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{d.routeName}</td>
                          <td className="py-2.5 px-3 text-slate-600">
                            <span className="font-mono font-bold text-slate-800">{d.vehiclePlate}</span> · {d.driverName}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-blue-900">{formatCOP(flete)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">{formatCOP(plannedCost)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCOP(actualCost)}</td>
                          <td className="py-2.5 px-3 text-right font-semibold">
                            <span className={isAhorro ? 'text-emerald-700' : 'text-rose-700'}>
                              {isAhorro ? `-${formatCOP(Math.abs(variance))}` : `+${formatCOP(variance)}`}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold">
                            <span className={profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                              {profit >= 0 ? `+${formatCOP(profit)}` : formatCOP(profit)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              marginPct >= 15 ? 'bg-emerald-100 text-emerald-900' : marginPct >= 0 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                            }`}>
                              {marginPct.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 4: MATRIZ PRESUPUESTAL REFERENCIAL DE RUTAS                         */}
      {/* ========================================================================= */}
      {viewScope === 'budget' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flete Facturado</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-extrabold text-slate-900">{formatCOP(totalRevenue)}</div>
              <span className="text-[11px] text-slate-400 block mt-1">Presupuesto total para {totalRoutesCount} rutas</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gastos Totales de Ruta</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-extrabold text-slate-800">{formatCOP(totalExpenses)}</div>
              <span className="text-[11px] text-slate-400 block mt-1">Combustible, peajes, nómina y SICE-TAC</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ganancia Neta Total</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${totalNetProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-xl font-extrabold ${totalNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {totalNetProfit >= 0 ? `+${formatCOP(totalNetProfit)}` : formatCOP(totalNetProfit)}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                Margen promedio de flota: +{averageMarginPct.toFixed(1)}%
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eficiencia de Flota</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-extrabold text-purple-900">
                {profitableRoutesCount} / {totalRoutesCount} <span className="text-xs font-normal text-slate-500">rutas</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {((profitableRoutesCount / Math.max(1, totalRoutesCount)) * 100).toFixed(0)}% con utilidad neta positiva
              </span>
            </div>

          </div>

          {/* Gráfica de Composición de Gastos Operativos Presupuestales */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
              <PieChart className="w-5 h-5 text-blue-600" />
              Estructura Consolidada de Gastos Operativos Presupuestales ({formatCOP(totalExpenses)})
            </h3>

            <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: `${laborSharePct}%` }} className="bg-indigo-600 hover:opacity-90 transition-all" title={`Mano de Obra: ${laborSharePct.toFixed(1)}%`} />
              <div style={{ width: `${fuelSharePct}%` }} className="bg-amber-500 hover:opacity-90 transition-all" title={`Combustible: ${fuelSharePct.toFixed(1)}%`} />
              <div style={{ width: `${maintSharePct}%` }} className="bg-slate-700 hover:opacity-90 transition-all" title={`Mantenimiento: ${maintSharePct.toFixed(1)}%`} />
              <div style={{ width: `${perDiemSharePct}%` }} className="bg-purple-500 hover:opacity-90 transition-all" title={`Viáticos: ${perDiemSharePct.toFixed(1)}%`} />
              <div style={{ width: `${tollsSharePct}%` }} className="bg-sky-500 hover:opacity-90 transition-all" title={`Peajes: ${tollsSharePct.toFixed(1)}%`} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                <div className="text-xs font-bold text-indigo-950 mb-0.5">Mano de Obra (SCJ)</div>
                <div className="text-sm font-extrabold text-indigo-900">{laborSharePct.toFixed(1)}%</div>
                <span className="text-[11px] text-indigo-700">{formatCOP(totalLabor)}</span>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <div className="text-xs font-bold text-amber-950 mb-0.5">Combustible ACPM</div>
                <div className="text-sm font-extrabold text-amber-900">{fuelSharePct.toFixed(1)}%</div>
                <span className="text-[11px] text-amber-700">{formatCOP(totalFuel)}</span>
              </div>
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl">
                <div className="text-xs font-bold text-slate-900 mb-0.5">Mtto SICE-TAC</div>
                <div className="text-sm font-extrabold text-slate-800">{maintSharePct.toFixed(1)}%</div>
                <span className="text-[11px] text-slate-600">{formatCOP(totalMaint)}</span>
              </div>
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                <div className="text-xs font-bold text-purple-950 mb-0.5">Viáticos de Ruta</div>
                <div className="text-sm font-extrabold text-purple-900">{perDiemSharePct.toFixed(1)}%</div>
                <span className="text-[11px] text-purple-700">{formatCOP(totalPerDiem)}</span>
              </div>
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl">
                <div className="text-xs font-bold text-sky-950 mb-0.5">Peajes Oficiales</div>
                <div className="text-sm font-extrabold text-sky-900">{tollsSharePct.toFixed(1)}%</div>
                <span className="text-[11px] text-sky-700">{formatCOP(totalTolls)}</span>
              </div>
            </div>
          </div>

          {/* Gráfica Comparativa de Barras Presupuestales */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Comparativa de Flete (Ingreso) vs Gastos Presupuestados
              </h3>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterMode === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Todas ({totalRoutesCount})
                </button>
                <button
                  onClick={() => setFilterMode('top_profit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterMode === 'top_profit' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Top Mayor Ganancia
                </button>
                <button
                  onClick={() => setFilterMode('low_margin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterMode === 'low_margin' ? 'bg-white text-rose-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Menor Margen
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2">
              {displayedRoutes.map((item) => {
                const revBarWidth = Math.min(100, Math.max(8, (item.revenue / maxBarValue) * 100));
                const expBarWidth = Math.min(100, Math.max(8, (item.expense / maxBarValue) * 100));

                return (
                  <div key={item.route.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all space-y-2 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-extrabold text-[10px] rounded">
                          {item.route.id}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{item.route.name}</span>
                        <span className="text-[11px] text-slate-500">({item.route.km} km · {item.route.zone})</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-extrabold ${item.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {item.profit >= 0 ? `+${formatCOP(item.profit)}` : formatCOP(item.profit)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">({item.marginPct.toFixed(1)}%)</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="w-16 text-slate-400 font-semibold shrink-0">Flete:</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div style={{ width: `${revBarWidth}%` }} className="bg-blue-600 h-full rounded-full" />
                        </div>
                        <span className="font-bold text-slate-900 w-24 text-right">{formatCOP(item.revenue)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="w-16 text-slate-400 font-semibold shrink-0">Gastos:</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div style={{ width: `${expBarWidth}%` }} className="bg-slate-400 h-full rounded-full" />
                        </div>
                        <span className="font-bold text-slate-700 w-24 text-right">{formatCOP(item.expense)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETALLADO DE LIQUIDACIÓN PATRONAL CST DEL COLABORADOR               */}
      {/* ========================================================================= */}
      {/* Modal del calendario diario de asistencia: días trabajados, horas y novedades por persona */}
      {dailyEditMember && (
        <StaffDailyAttendanceModal
          isOpen={!!dailyEditMember}
          onClose={() => setDailyEditMember(null)}
          record={dailyEditMember}
          yearMonth={selectedYearMonth}
          laborConfig={laborConfig}
          onSave={handleUpdateRecord}
        />
      )}

      {selectedStaffBreakdown && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
            
            {/* Header del Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-black rounded uppercase">
                    {selectedStaffBreakdown.role}
                  </span>
                  <span className="text-xs text-slate-400">CC {selectedStaffBreakdown.document}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedStaffBreakdown.memberName}
                </h3>
                <p className="text-xs text-slate-500">
                  Liquidación Patronal CST · {MONTH_NAMES[selectedMonthIndex]} {selectedYear} ({selectedStaffBreakdown.daysWorked} días laborados)
                </p>
              </div>
              <button
                onClick={() => setSelectedStaffBreakdown(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen de Horario y Viajes */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Horario Asignado</span>
                <span className="font-bold text-slate-900">{selectedStaffBreakdown.contractSchedule || 'Jornada 42h (Lun - Sáb)'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Actividad en Carretera</span>
                <span className="font-bold text-slate-900">
                  {selectedStaffBreakdown.tripsCompleted > 0 
                    ? `${selectedStaffBreakdown.tripsCompleted} despachos liquidados` 
                    : '0 viajes (Activo en base / patio / standby)'}
                </span>
              </div>
            </div>

            {/* Desglose Detallado Rubro por Rubro */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 text-xs">
              
              {/* Devengado */}
              <div className="p-3 bg-blue-50/50 rounded-xl space-y-1.5 border border-blue-200/60">
                <span className="font-bold text-blue-950 text-xs block">1. Devengado Mensual</span>
                <div className="flex justify-between text-slate-600">
                  <span>· Sueldo Básico Pactado:</span>
                  <span className="font-mono text-slate-800">{formatCOP(selectedStaffBreakdown.monthlyBaseSalary)} / mes</span>
                </div>
                <div className="flex justify-between text-slate-800 font-semibold">
                  <span>· Sueldo Devengado ({selectedStaffBreakdown.daysWorked} días):</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.baseDevengado)}</span>
                </div>
                {selectedStaffBreakdown.auxilioTransporte > 0 && (
                  <div className="flex justify-between text-indigo-900 font-semibold">
                    <span>· Auxilio Legal de Transporte (&le; 2 SMMLV):</span>
                    <span className="font-mono">{formatCOP(selectedStaffBreakdown.auxilioTransporte)}</span>
                  </div>
                )}
                <div className="pt-1 border-t border-blue-200 flex justify-between font-black text-blue-950">
                  <span>Total Devengado:</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.totalDevengado)}</span>
                </div>
              </div>

              {/* Detalle de horas clasificadas CST desde el calendario diario */}
              {selectedStaffBreakdown.hoursDetail && (
                <div className="p-3 bg-white rounded-xl space-y-2 border border-emerald-200">
                  <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Calendario diario · Horas clasificadas CST ({selectedStaffBreakdown.hoursDetail.totalHours}h)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] text-center">
                    <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-500">HOD</div>
                      <div className="font-black text-slate-900 text-xs">{selectedStaffBreakdown.hoursDetail.hodHours}h</div>
                    </div>
                    <div className="p-1.5 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="font-bold text-indigo-500">HON +35%</div>
                      <div className="font-black text-indigo-900 text-xs">{selectedStaffBreakdown.hoursDetail.honHours}h</div>
                    </div>
                    <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="font-bold text-amber-600">HED +25%</div>
                      <div className="font-black text-amber-900 text-xs">{selectedStaffBreakdown.hoursDetail.hedHours}h</div>
                    </div>
                    <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-300">
                      <div className="font-bold text-slate-600">HEN +75%</div>
                      <div className="font-black text-slate-900 text-xs">{selectedStaffBreakdown.hoursDetail.henHours}h</div>
                    </div>
                    <div className="p-1.5 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="font-bold text-purple-600">HDF +75%</div>
                      <div className="font-black text-purple-900 text-xs">{selectedStaffBreakdown.hoursDetail.hdfHours}h</div>
                    </div>
                    <div className="p-1.5 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="font-bold text-purple-600">HDFN +110%</div>
                      <div className="font-black text-purple-900 text-xs">{selectedStaffBreakdown.hoursDetail.hdfnHours}h</div>
                    </div>
                    <div className="p-1.5 bg-purple-100 rounded-lg border border-purple-300">
                      <div className="font-bold text-purple-700">HEFD 200%</div>
                      <div className="font-black text-purple-900 text-xs">{selectedStaffBreakdown.hoursDetail.hefdHours}h</div>
                    </div>
                    <div className="p-1.5 bg-purple-100 rounded-lg border border-purple-300">
                      <div className="font-bold text-purple-700">HEFN 250%</div>
                      <div className="font-black text-purple-900 text-xs">{selectedStaffBreakdown.hoursDetail.hefnHours}h</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-600">
                    <span>Recargo nocturno: <strong className="font-mono">{formatCOP(selectedStaffBreakdown.hoursDetail.nightSurchargeCOP)}</strong></span>
                    <span>Recargo dominical/festivo: <strong className="font-mono">{formatCOP(selectedStaffBreakdown.hoursDetail.holidaySurchargeCOP + selectedStaffBreakdown.hoursDetail.holidayNightSurchargeCOP)}</strong></span>
                    <span>Horas extras (BD): <strong className="font-mono">{formatCOP(selectedStaffBreakdown.hoursDetail.extrasCOP)}</strong></span>
                  </div>
                  {selectedStaffBreakdown.hoursDetail.lateMinutesTotal > 0 && (
                    <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3" />
                      <strong>{selectedStaffBreakdown.hoursDetail.lateMinutesTotal} min de llegada tarde</strong> registrados en el mes
                    </div>
                  )}
                  {selectedStaffBreakdown.hoursDetail.novedades.length > 0 && (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedStaffBreakdown.hoursDetail.novedades.map((n, i) => (
                        <div key={i} className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 flex items-center justify-between gap-2">
                          <span className="font-bold">{n.date.slice(8)} {MONTH_NAMES[selectedMonthIndex]?.slice(0, 3)} · {n.noveltyType}</span>
                          <span className="text-slate-500 truncate">{n.notes || (n.lateMinutes ? `${n.lateMinutes} min tarde` : '')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Prestaciones Sociales */}
              <div className="p-3 bg-purple-50/50 rounded-xl space-y-1.5 border border-purple-200/60">
                <span className="font-bold text-purple-950 text-xs block">2. Prestaciones Sociales (CST)</span>
                <div className="flex justify-between text-slate-600">
                  <span>· Cesantías (8.33% devengado salarial):</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.cesantias)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>· Intereses sobre Cesantías (1.0% mensual):</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.interesesCesantias)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>· Prima de Servicios (8.33% devengado + auxilio):</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.primaServicios)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>· Vacaciones de Ley (4.17% sueldo base):</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.vacaciones)}</span>
                </div>
                <div className="pt-1 border-t border-purple-200 flex justify-between font-black text-purple-950">
                  <span>Total Prestaciones Sociales:</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.totalPrestaciones)}</span>
                </div>
              </div>

              {/* Seguridad Social Patronal */}
              <div className="p-3 bg-emerald-50/50 rounded-xl space-y-1.5 border border-emerald-200/60">
                <span className="font-bold text-emerald-950 text-xs block">3. Seguridad Social Patronal</span>
                <div className="flex justify-between text-slate-600">
                  <span>· Pensión Empleador (12.0%):</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.pension)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>· Salud Empleador (Exonerado Art. 114-1 E.T. o 8.5%):</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.salud)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>· ARL (Tasa {(selectedStaffBreakdown.arlRate * 100).toFixed(3)}%):</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.arl)}</span>
                </div>
                <div className="pt-1 border-t border-emerald-200 flex justify-between font-black text-emerald-950">
                  <span>Total Seguridad Social:</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.totalSeguridadSocial)}</span>
                </div>
              </div>

              {/* Parafiscales & Dotación */}
              <div className="p-3 bg-amber-50/50 rounded-xl space-y-1.5 border border-amber-200/60">
                <span className="font-bold text-amber-950 text-xs block">4. Parafiscales & Dotación</span>
                <div className="flex justify-between text-slate-600">
                  <span>· Caja de Compensación Familiar (4.0%):</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.cajaCompensacion)}</span>
                </div>
                {selectedStaffBreakdown.dotacion > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>· Dotación Legal Mensual:</span>
                    <span className="font-mono">{formatCOP(selectedStaffBreakdown.dotacion)}</span>
                  </div>
                )}
                <div className="pt-1 border-t border-amber-200 flex justify-between font-black text-amber-950">
                  <span>Total Parafiscales & Dotación:</span>
                  <span className="font-mono">{formatCOP(selectedStaffBreakdown.totalParafiscales + selectedStaffBreakdown.dotacion)}</span>
                </div>
              </div>

            </div>

            {/* Total Costo Empleador Mensual */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Costo Total Básico Patronal Mensual
                </span>
                <span className="text-xl font-black text-emerald-400">
                  {formatCOP(selectedStaffBreakdown.totalEmployerMonthlyCost)}
                </span>
              </div>
              <div className="text-right text-xs text-slate-300">
                <div>Costo diario efectivo: <strong>{formatCOP(selectedStaffBreakdown.effectiveDailyCost)} / día</strong></div>
                <div className="text-[10px] text-slate-400">Base {selectedStaffBreakdown.daysWorked} días laborados</div>
              </div>
            </div>

            {/* Botón Cerrar */}
            <div className="pt-1">
              <button
                onClick={() => setSelectedStaffBreakdown(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>

          </div>
        </div>
      )}
      {/* Modal de Descarga de Informes Financieros con Gráficos y Filtros */}
      <FinancialReportModal
        isOpen={isFinancialReportOpen}
        onClose={() => setIsFinancialReportOpen(false)}
        dispatches={dispatches}
        breakdowns={breakdowns}
        selectedVehicle={selectedVehicle}
        laborConfig={laborConfig}
      />
    </div>
  );
};
