import React, { useState, useMemo } from 'react';
import { RouteCostBreakdown, DeliveryRoute, ProfitabilityValidationConfig } from '../types/logistics';
import { formatCOP, formatNumber } from '../utils/costCalculator';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Edit3, 
  Clock, 
  MapPin, 
  AlertCircle,
  X, 
  UploadCloud, 
  Plus, 
  AlertTriangle, 
  Calculator, 
  Truck, 
  Layers, 
  FileSpreadsheet, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';

interface RouteTableProps {
  breakdowns: RouteCostBreakdown[];
  profitabilityConfig?: ProfitabilityValidationConfig;
  onSelectRouteDetail: (breakdown: RouteCostBreakdown) => void;
  onEditRoute: (route: DeliveryRoute) => void;
  onUpdateInlineKm: (routeId: string, newKm: number) => void;
  onUpdateInlineToll: (routeId: string, newToll: number) => void;
  onOpenImportModal?: () => void;
  onOpenNewRoute?: () => void;
  onNavigateToSimulator?: () => void;
  onOpenMapRoute?: (route: DeliveryRoute) => void;
}

type ViewMode = 'operative' | 'presupuesto_scj' | 'npr_vs_nlr';

export const RouteTable: React.FC<RouteTableProps> = ({
  breakdowns,
  profitabilityConfig = {
    targetMarginPercentage: 20,
    maxAllowedCostPerTrip: 900000,
    benchmarkFreightTariffCOP: 1150000,
    isEnabled: true
  },
  onSelectRouteDetail,
  onEditRoute,
  onUpdateInlineKm,
  onUpdateInlineToll,
  onOpenImportModal,
  onOpenNewRoute,
  onNavigateToSimulator,
  onOpenMapRoute
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [onlyUnprofitable, setOnlyUnprofitable] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('presupuesto_scj');
  const [tableVehicleMode, setTableVehicleMode] = useState<'NPR' | 'NLR'>('NPR');
  const [sortField, setSortField] = useState<'id' | 'name' | 'km' | 'totalHours' | 'totalCost' | 'costPerKm' | 'profit' | 'margin'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Inline edit states
  const [editingKmId, setEditingKmId] = useState<string | null>(null);
  const [tempKm, setTempKm] = useState<number>(0);
  
  const [editingTollId, setEditingTollId] = useState<string | null>(null);
  const [tempToll, setTempToll] = useState<number>(0);

  // Umbral de costo configurado en el simulador
  const maxCostThreshold = profitabilityConfig.maxAllowedCostPerTrip > 0 
    ? profitabilityConfig.maxAllowedCostPerTrip 
    : 900000;

  // Rutas que superan el margen o tienen rentabilidad negativa
  const unprofitableRoutes = useMemo(() => {
    return breakdowns.filter(b => b.profitPercentage < 10 || (profitabilityConfig.isEnabled && b.totalTripCost > maxCostThreshold));
  }, [breakdowns, profitabilityConfig.isEnabled, maxCostThreshold]);

  // Lista única de zonas para filtrado
  const zones = useMemo(() => {
    const set = new Set<string>();
    breakdowns.forEach(b => set.add(b.route.zone));
    return Array.from(set).sort();
  }, [breakdowns]);

  // Filtrado y ordenamiento
  const filteredAndSorted = useMemo(() => {
    return breakdowns
      .filter((b) => {
        const matchesSearch = 
          b.route.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.route.zone.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesZone = selectedZone === 'ALL' || b.route.zone === selectedZone;
        const matchesProfitability = !onlyUnprofitable || b.profitPercentage < 10;

        return matchesSearch && matchesZone && matchesProfitability;
      })
      .sort((a, b) => {
        let valA: any = a.route.id;
        let valB: any = b.route.id;

        if (sortField === 'name') {
          valA = a.route.name;
          valB = b.route.name;
        } else if (sortField === 'km') {
          valA = a.route.km;
          valB = b.route.km;
        } else if (sortField === 'totalHours') {
          valA = a.totalHours;
          valB = b.totalHours;
        } else if (sortField === 'totalCost') {
          valA = a.totalTripCost;
          valB = b.totalTripCost;
        } else if (sortField === 'costPerKm') {
          valA = a.costPerKm;
          valB = b.costPerKm;
        } else if (sortField === 'profit') {
          valA = a.netProfitCOP;
          valB = b.netProfitCOP;
        } else if (sortField === 'margin') {
          valA = a.profitPercentage;
          valB = b.profitPercentage;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [breakdowns, searchTerm, selectedZone, sortField, sortOrder, onlyUnprofitable]);

  // Totales consolidados de la tabla presupuestal SCJ
  const tableTotals = useMemo(() => {
    let totalFreightNpr = 0;
    let totalFreightNlr = 0;
    let totalKmFiltered = 0;
    let totalFuelGalFiltered = 0;
    let totalAcpmFiltered = 0;
    let totalHoFiltered = 0;
    let totalHedFiltered = 0;
    let totalHenFiltered = 0;
    let totalViaticosFiltered = 0;
    let totalParafiscalesFiltered = 0;
    let totalTollsNprFiltered = 0;
    let totalTollsNlrFiltered = 0;
    let totalMttoFiltered = 0;
    let totalOperatingCostFiltered = 0;
    let totalNetProfitFiltered = 0;

    filteredAndSorted.forEach(b => {
      const isNpr = tableVehicleMode === 'NPR';
      const comp = (isNpr ? b.nprComparison : b.nlrComparison) || {
        vehicleCategory: isNpr ? 'NPR' : 'NLR',
        freightTariff: isNpr ? (b.route.freightTariffNpr || 0) : (b.route.freightTariffNlr || 0),
        tollCost: b.tollCost,
        fuelCost: b.fuelCost,
        fuelGallons: b.fuelGallons,
        maintenanceCost: b.totalMaintenanceCost,
        laborCost: b.totalLaborCost,
        fixedCost: b.proratedFixedCost,
        totalCost: b.totalTripCost,
        netProfitCOP: b.netProfitCOP,
        profitMarginPct: b.profitPercentage,
        expensePct: b.expensePercentage,
        isMoreProfitable: false
      };
      totalFreightNpr += b.route.freightTariffNpr || 0;
      totalFreightNlr += b.route.freightTariffNlr || 0;
      totalKmFiltered += b.route.km;
      totalFuelGalFiltered += comp.fuelGallons;
      totalAcpmFiltered += comp.fuelCost;
      totalHoFiltered += b.regularHours * 8000;
      totalHedFiltered += b.overtimeDayHours * 17488;
      totalHenFiltered += b.overtimeNightHours * 23000;
      totalViaticosFiltered += b.viaticosCost;
      totalParafiscalesFiltered += b.driverCost.prestaciones + b.driverCost.seguridadSocial + b.driverCost.parafiscales;
      totalTollsNprFiltered += b.route.tollEstimatedCost || 0;
      totalTollsNlrFiltered += (b.route.tollEstimatedCostNlr !== undefined ? b.route.tollEstimatedCostNlr : b.route.tollEstimatedCost) || 0;
      totalMttoFiltered += comp.maintenanceCost;
      totalOperatingCostFiltered += comp.totalCost;
      totalNetProfitFiltered += comp.netProfitCOP;
    });

    const activeTotalFreight = tableVehicleMode === 'NPR' ? totalFreightNpr : totalFreightNlr;
    const avgExpensePct = activeTotalFreight > 0 ? (totalOperatingCostFiltered / activeTotalFreight) * 100 : 0;
    const avgProfitMarginPct = activeTotalFreight > 0 ? (totalNetProfitFiltered / activeTotalFreight) * 100 : 0;

    return {
      totalFreightNpr,
      totalFreightNlr,
      totalKmFiltered,
      totalFuelGalFiltered,
      totalAcpmFiltered,
      totalHoFiltered,
      totalHedFiltered,
      totalHenFiltered,
      totalViaticosFiltered,
      totalParafiscalesFiltered,
      totalTollsNprFiltered,
      totalTollsNlrFiltered,
      totalMttoFiltered,
      totalOperatingCostFiltered,
      totalNetProfitFiltered,
      avgExpensePct,
      avgProfitMarginPct
    };
  }, [filteredAndSorted, tableVehicleMode]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSaveKm = (id: string) => {
    if (!isNaN(tempKm) && tempKm >= 0) {
      onUpdateInlineKm(id, tempKm);
    }
    setEditingKmId(null);
  };

  const handleSaveToll = (id: string) => {
    if (!isNaN(tempToll) && tempToll >= 0) {
      onUpdateInlineToll(id, tempToll);
    }
    setEditingTollId(null);
  };

  if (breakdowns.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4 shadow-2xs">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <UploadCloud className="w-6 h-6 text-blue-600" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">
            No hay rutas cargadas actualmente
          </h3>
          <p className="text-xs text-slate-500">
            La base de datos está vacía. Puedes restaurar la base oficial SCJ o cargar tu propio archivo.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Cargar Base de Datos
            </button>
          )}
          {onOpenNewRoute && (
            <button
              onClick={onOpenNewRoute}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Crear Ruta Manualmente
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Selector de Modo de Vista y Barra de Filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        
        {/* Pestañas de Modo de Vista */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('presupuesto_scj')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'presupuesto_scj'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>Rutas & Tarifas Base SCJ</span>
            </button>

            <button
              onClick={() => setViewMode('npr_vs_nlr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'npr_vs_nlr'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-blue-700" />
              <span>Comparativa NPR vs NLR</span>
            </button>

            <button
              onClick={() => setViewMode('operative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'operative'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-700" />
              <span>Desglose Operativo Detallado</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'presupuesto_scj' && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 px-1.5 hidden sm:inline">Calcular gastos con:</span>
                <button
                  type="button"
                  onClick={() => setTableVehicleMode('NPR')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    tableVehicleMode === 'NPR'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Calcular combustible, peajes y mantenimiento con perfil de Camión Turbo NPR 4.8T"
                >
                  NPR Turbo (4.8T)
                </button>
                <button
                  type="button"
                  onClick={() => setTableVehicleMode('NLR')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    tableVehicleMode === 'NLR'
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Calcular combustible, peajes y mantenimiento con perfil de Camioneta NLR 3.0T"
                >
                  NLR Camioneta (3.0T)
                </button>
              </div>
            )}
            <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs rounded-lg flex items-center gap-1.5 hidden md:flex">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              {breakdowns[0]?.vehicle.name}
            </span>
          </div>
        </div>

        {/* Buscador y Selector de Zona */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Input de Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ruta o zona (ej. Supía, Urrao, Apartadó, Guarne)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Selector de Zona */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-xs text-slate-500 font-medium">Zona:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="ALL">Todas las Zonas ({breakdowns.length} rutas)</option>
              {zones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Resumen y Filtro de Rentabilidad */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Mostrando <span className="font-semibold text-slate-800">{filteredAndSorted.length}</span> de {breakdowns.length} rutas oficiales
            </span>

            <div className="flex items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={() => setOnlyUnprofitable(false)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  !onlyUnprofitable 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({breakdowns.length})
              </button>

              <button
                type="button"
                onClick={() => setOnlyUnprofitable(true)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  onlyUnprofitable 
                    ? 'bg-rose-700 text-white shadow-xs' 
                    : unprofitableRoutes.length > 0
                      ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>Margen Bajo / Alerta ({unprofitableRoutes.length})</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Margen &gt; 15%
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Margen 5-15%
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Margen &lt; 5%
            </span>
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          
          {/* VISTA 1: MATRIZ PRESUPUESTAL SCJ (OFICIAL DE EXCEL) */}
          {viewMode === 'presupuesto_scj' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-semibold select-none">
                  <th onClick={() => handleSort('id')} className="py-3 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                    POS / Destino de Reparto
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap bg-blue-50 text-blue-950 font-bold border-l border-blue-200">
                    Costo NPR (Flete)
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap bg-sky-50 text-sky-950 font-bold border-l border-sky-200">
                    Costo NLR (Flete)
                  </th>
                  <th onClick={() => handleSort('km')} className="py-3 px-3 cursor-pointer text-right hover:text-slate-900 whitespace-nowrap">
                    Km Retorno
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap bg-amber-50/50 text-amber-950">
                    Consumo ACPM
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap text-slate-600">
                    H.O. (8h)
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap text-amber-700">
                    H.E.D. ($17.488)
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap text-purple-700">
                    H.E.N. ($23.000)
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap text-slate-700">
                    Viáticos SCJ
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap text-slate-500 text-[11px]" title="Factor prestacional y parafiscales CST incluidos en la tarifa pactada de horas extras ($17.488 / $23.000)">
                    Parafiscales (Inc)
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap text-blue-800">
                    Peajes NPR
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap text-sky-800">
                    Peajes NLR
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap text-slate-700">
                    Mtto. SICE-TAC
                  </th>
                  <th onClick={() => handleSort('totalCost')} className="py-3 px-3 cursor-pointer text-right hover:text-slate-900 whitespace-nowrap bg-slate-200 font-bold text-slate-950 border-l border-slate-300">
                    Total Gastos
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap font-bold text-slate-800">
                    % Gasto
                  </th>
                  <th onClick={() => handleSort('margin')} className="py-3 px-3 cursor-pointer text-center hover:text-slate-900 whitespace-nowrap font-bold">
                    % Ganancia
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap font-bold text-slate-900">
                    Utilidad Neta
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">
                    Planilla
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredAndSorted.map((b) => {
                  const isNpr = tableVehicleMode === 'NPR';
                  const comp = (isNpr ? b.nprComparison : b.nlrComparison) || {
                    vehicleCategory: isNpr ? 'NPR' : 'NLR',
                    freightTariff: isNpr ? (b.route.freightTariffNpr || 0) : (b.route.freightTariffNlr || 0),
                    tollCost: b.tollCost,
                    fuelCost: b.fuelCost,
                    fuelGallons: b.fuelGallons,
                    maintenanceCost: b.totalMaintenanceCost,
                    laborCost: b.totalLaborCost,
                    fixedCost: b.proratedFixedCost,
                    totalCost: b.totalTripCost,
                    netProfitCOP: b.netProfitCOP,
                    profitMarginPct: b.profitPercentage,
                    expensePct: b.expensePercentage,
                    isMoreProfitable: false
                  };
                  const activeFreight = isNpr ? (b.route.freightTariffNpr || 0) : (b.route.freightTariffNlr || 0);
                  const fuelGallons = comp.fuelGallons;
                  const fuelCost = comp.fuelCost;
                  const regularHoursPay = b.regularHours * 8000;
                  const dayOvertimeCost = b.overtimeDayHours * 17488;
                  const nightOvertimeCost = b.overtimeNightHours * 23000;
                  const viaticos = b.viaticosCost;
                  const parafiscalesTotal = b.driverCost.prestaciones + b.driverCost.seguridadSocial + b.driverCost.parafiscales;
                  const tollCostNpr = b.route.tollEstimatedCost || 0;
                  const tollCostNlr = (b.route.tollEstimatedCostNlr !== undefined ? b.route.tollEstimatedCostNlr : b.route.tollEstimatedCost) || 0;
                  const activeMtto = comp.maintenanceCost;
                  const totalOperatingCost = comp.totalCost;
                  const netProfit = comp.netProfitCOP;
                  const marginPct = comp.profitMarginPct;
                  const expensePct = comp.expensePct;

                  const isLoss = netProfit < 0;
                  const isLowMargin = marginPct >= 0 && marginPct < 10;
                  const isHealthy = marginPct >= 15;

                  return (
                    <tr key={b.route.id} className="hover:bg-slate-50/90 transition-colors">
                      {/* POS / Ruta (Sticky column) */}
                      <td className="py-2.5 px-3 font-sans sticky left-0 bg-white z-10 border-r border-slate-200 shadow-2xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {b.route.id}
                          </span>
                          <span className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs block" title={b.route.name}>
                            {b.route.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">
                          {b.route.zone} {b.route.tollStations ? `• Peajes: ${b.route.tollStations}` : ''}
                        </div>
                      </td>

                      {/* Costo NPR (Flete) */}
                      <td className="py-2.5 px-3 text-right font-bold text-blue-900 bg-blue-50/20 border-l border-blue-100">
                        {b.route.freightTariffNpr ? formatCOP(b.route.freightTariffNpr) : '-'}
                      </td>

                      {/* Costo NLR (Flete) */}
                      <td className="py-2.5 px-3 text-right font-bold text-sky-900 bg-sky-50/20 border-l border-sky-100">
                        {b.route.freightTariffNlr ? formatCOP(b.route.freightTariffNlr) : '-'}
                      </td>

                      {/* Km Retorno (Editable) */}
                      <td className="py-2.5 px-3 text-right">
                        {editingKmId === b.route.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              value={tempKm}
                              onChange={(e) => setTempKm(parseFloat(e.target.value))}
                              className="w-16 px-1 py-0.5 text-xs text-right border border-blue-500 rounded font-mono"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveKm(b.route.id);
                                if (e.key === 'Escape') setEditingKmId(null);
                              }}
                            />
                            <button onClick={() => handleSaveKm(b.route.id)} className="text-blue-700 font-bold px-1">✓</button>
                          </div>
                        ) : (
                          <span 
                            onClick={() => { setEditingKmId(b.route.id); setTempKm(b.route.km); }}
                            className="cursor-pointer hover:underline text-slate-800 font-semibold"
                            title="Clic para editar km de retorno"
                          >
                            {formatNumber(b.route.km, 1)} km
                          </span>
                        )}
                      </td>

                      {/* Consumo ACPM */}
                      <td className="py-2.5 px-3 text-right bg-amber-50/20">
                        <div className="font-bold text-amber-950">{formatCOP(fuelCost)}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{fuelGallons.toFixed(1)} gal</div>
                      </td>

                      {/* H.O. ($8.000) */}
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        <div>{formatCOP(regularHoursPay)}</div>
                        <div className="text-[10px] text-slate-400">8h ord</div>
                      </td>

                      {/* H.E.D. ($17.488) */}
                      <td className="py-2.5 px-3 text-right text-amber-700">
                        {dayOvertimeCost > 0 ? (
                          <>
                            <div className="font-semibold">{formatCOP(dayOvertimeCost)}</div>
                            <div className="text-[10px] text-amber-600">+{b.overtimeDayHours.toFixed(1)}h</div>
                          </>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* H.E.N. ($23.000) */}
                      <td className="py-2.5 px-3 text-right text-purple-700">
                        {nightOvertimeCost > 0 ? (
                          <>
                            <div className="font-semibold">{formatCOP(nightOvertimeCost)}</div>
                            <div className="text-[10px] text-purple-600">+{b.overtimeNightHours.toFixed(1)}h</div>
                          </>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Viáticos SCJ */}
                      <td className="py-2.5 px-3 text-right text-slate-800">
                        {viaticos > 0 ? (
                          <span className="font-bold text-slate-800">{formatCOP(viaticos)}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Parafiscales CST (Informativo / Incluido en tarifa) */}
                      <td className="py-2.5 px-3 text-right text-slate-400 font-normal text-[11px]" title="Factor prestacional y parafiscales CST incluidos en el costo pactado de H.E. ($17.488 / $23.000)">
                        {formatCOP(parafiscalesTotal)}
                      </td>

                      {/* Peajes NPR */}
                      <td className="py-2.5 px-3 text-right text-blue-900 font-medium">
                        {tollCostNpr > 0 ? formatCOP(tollCostNpr) : <span className="text-slate-300">$0</span>}
                      </td>

                      {/* Peajes NLR */}
                      <td className="py-2.5 px-3 text-right text-sky-900 font-medium">
                        {tollCostNlr > 0 ? formatCOP(tollCostNlr) : <span className="text-slate-300">$0</span>}
                      </td>

                      {/* Mantenimiento SICE-TAC */}
                      <td className="py-2.5 px-3 text-right text-slate-700 font-medium">
                        {formatCOP(activeMtto)}
                      </td>

                      {/* Total Gastos Operativos */}
                      <td className="py-2.5 px-3 text-right font-bold text-slate-950 bg-slate-100 border-l border-slate-200">
                        {formatCOP(totalOperatingCost)}
                      </td>

                      {/* % Gasto */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-slate-700 font-medium">
                          {expensePct.toFixed(1)}%
                        </span>
                      </td>

                      {/* % Ganancia */}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                          isLoss 
                            ? 'bg-rose-100 text-rose-800' 
                            : isLowMargin 
                              ? 'bg-amber-100 text-amber-900' 
                              : isHealthy 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-slate-100 text-slate-700'
                        }`}>
                          {marginPct.toFixed(1)}%
                        </span>
                      </td>

                      {/* Utilidad Neta */}
                      <td className={`py-2.5 px-3 text-right font-bold ${isLoss ? 'text-rose-700' : 'text-emerald-800'}`}>
                        {formatCOP(netProfit)}
                      </td>

                      {/* Detalle / Planilla & Mapa */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {onEditRoute && (
                            <button
                              onClick={() => onEditRoute(b.route)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                              title="Configurar y editar fletes, viáticos, peajes y paradas de esta ruta"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onOpenMapRoute && (
                            <button
                              onClick={() => onOpenMapRoute(b.route)}
                              className="p-1.5 text-slate-500 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                              title="Ver trazado y peajes en Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectRouteDetail(b)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="Ver desglose completo de costos y planilla"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Fila de Totales Consolidados (Resumen Global) */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-mono font-bold text-xs select-none">
                  <td className="py-3 px-3 sticky left-0 bg-slate-900 z-10 border-r border-slate-800 font-sans tracking-wide">
                    TOTAL CONSOLIDADO ({filteredAndSorted.length} RUTAS)
                  </td>
                  <td className="py-3 px-3 text-right text-blue-300 bg-slate-800/80">
                    {formatCOP(tableTotals.totalFreightNpr, true)}
                  </td>
                  <td className="py-3 px-3 text-right text-sky-300 bg-slate-800/80">
                    {formatCOP(tableTotals.totalFreightNlr, true)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-200">
                    {formatNumber(tableTotals.totalKmFiltered, 1)} km
                  </td>
                  <td className="py-3 px-3 text-right text-amber-300">
                    <div>{formatCOP(tableTotals.totalAcpmFiltered, true)}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{tableTotals.totalFuelGalFiltered.toFixed(1)} gal</div>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {formatCOP(tableTotals.totalHoFiltered, true)}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-300">
                    {formatCOP(tableTotals.totalHedFiltered, true)}
                  </td>
                  <td className="py-3 px-3 text-right text-purple-300">
                    {formatCOP(tableTotals.totalHenFiltered, true)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {formatCOP(tableTotals.totalViaticosFiltered, true)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {formatCOP(tableTotals.totalParafiscalesFiltered, true)}
                  </td>
                  <td className="py-3 px-3 text-right text-blue-300">
                    {formatCOP(tableTotals.totalTollsNprFiltered, true)}
                  </td>
                  <td className="py-3 px-3 text-right text-sky-300">
                    {formatCOP(tableTotals.totalTollsNlrFiltered, true)}
                  </td>
                  <td className="py-3 px-3 text-right text-cyan-300">
                    {formatCOP(tableTotals.totalMttoFiltered, true)}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-400 text-sm font-black bg-slate-800">
                    {formatCOP(tableTotals.totalOperatingCostFiltered, true)}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300 font-bold">
                    {tableTotals.avgExpensePct.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-center text-emerald-400 text-sm font-black">
                    {tableTotals.avgProfitMarginPct.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 text-sm font-black bg-slate-800">
                    {formatCOP(tableTotals.totalNetProfitFiltered, true)}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500 font-normal">
                    —
                  </td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* VISTA 2: COMPARATIVA INTELIGENTE NPR vs NLR */}
          {viewMode === 'npr_vs_nlr' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold select-none">
                  <th className="py-3 px-3 whitespace-nowrap">ID / POS Ruta</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Km Retorno</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap bg-blue-50 text-blue-950 font-bold border-l border-blue-200">
                    Flete NPR
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap bg-blue-50 text-blue-950">
                    Peajes NPR
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap bg-blue-50 text-blue-950">
                    Costo Total NPR
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap bg-blue-50 text-blue-950 font-bold">
                    Margen NPR
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap bg-sky-50 text-sky-950 font-bold border-l border-sky-200">
                    Flete NLR
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap bg-sky-50 text-sky-950">
                    Peajes NLR
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap bg-sky-50 text-sky-950">
                    Costo Total NLR
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap bg-sky-50 text-sky-950 font-bold">
                    Margen NLR
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap bg-purple-50 text-purple-950 font-bold border-l border-purple-200">
                    Vehículo Recomendado
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredAndSorted.map((b) => {
                  const npr = b.nprComparison;
                  const nlr = b.nlrComparison;
                  const nlrMoreProfitable = nlr && npr && nlr.netProfitCOP > npr.netProfitCOP;
                  const profitDiff = nlr && npr ? Math.abs(nlr.netProfitCOP - npr.netProfitCOP) : 0;

                  return (
                    <tr key={b.route.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-bold text-slate-900">{b.route.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{b.route.id} • {b.route.zone}</div>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {formatNumber(b.route.km, 1)} km
                      </td>

                      {/* NPR */}
                      <td className="py-2.5 px-3 text-right font-bold text-blue-900 bg-blue-50/20 border-l border-blue-100">
                        {npr ? formatCOP(npr.freightTariff) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 bg-blue-50/20">
                        {npr ? formatCOP(npr.tollCost) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800 bg-blue-50/20">
                        {npr ? formatCOP(npr.totalCost) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-950 bg-blue-50/20">
                        {npr ? `${npr.profitMarginPct.toFixed(1)}%` : '-'}
                        <div className="text-[10px] text-slate-500 font-normal">
                          {npr ? formatCOP(npr.netProfitCOP, true) : ''}
                        </div>
                      </td>

                      {/* NLR */}
                      <td className="py-2.5 px-3 text-right font-bold text-sky-900 bg-sky-50/20 border-l border-sky-100">
                        {nlr ? formatCOP(nlr.freightTariff) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 bg-sky-50/20">
                        {nlr ? formatCOP(nlr.tollCost) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800 bg-sky-50/20">
                        {nlr ? formatCOP(nlr.totalCost) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-sky-950 bg-sky-50/20">
                        {nlr ? `${nlr.profitMarginPct.toFixed(1)}%` : '-'}
                        <div className="text-[10px] text-slate-500 font-normal">
                          {nlr ? formatCOP(nlr.netProfitCOP, true) : ''}
                        </div>
                      </td>

                      {/* RECOMENDACIÓN */}
                      <td className="py-2.5 px-3 text-center border-l border-blue-100 bg-blue-50/10">
                        {nlrMoreProfitable ? (
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold text-[10px] rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-sky-700" />
                            Mejor NLR (+{formatCOP(profitDiff, true)})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-blue-700" />
                            Mejor NPR (+{formatCOP(profitDiff, true)})
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onSelectRouteDetail(b)}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 rounded"
                        >
                          Analizar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* VISTA 3: DESGLOSE OPERATIVO DETALLADO */}
          {viewMode === 'operative' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold select-none">
                  <th onClick={() => handleSort('id')} className="py-3 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap">ID</th>
                  <th onClick={() => handleSort('name')} className="py-3 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap">Ruta / Corredor</th>
                  <th onClick={() => handleSort('km')} className="py-3 px-3 cursor-pointer text-right hover:text-slate-900 whitespace-nowrap">Km</th>
                  <th onClick={() => handleSort('totalHours')} className="py-3 px-3 cursor-pointer text-right hover:text-slate-900 whitespace-nowrap">Tiempo</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Peajes</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Personal CST</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Combustible ACPM</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap bg-blue-50/50 text-blue-950 font-bold">Mantenimiento SICE-TAC</th>
                  <th onClick={() => handleSort('totalCost')} className="py-3 px-3 cursor-pointer text-right hover:text-slate-900 whitespace-nowrap bg-slate-100 font-bold text-slate-900">Costo Total</th>
                  <th onClick={() => handleSort('costPerKm')} className="py-3 px-3 cursor-pointer text-right hover:text-slate-900 whitespace-nowrap">CPK ($/km)</th>
                  <th onClick={() => handleSort('margin')} className="py-3 px-3 cursor-pointer text-center hover:text-slate-900 whitespace-nowrap">Margen %</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredAndSorted.map((b) => (
                  <tr key={b.route.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{b.route.id}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-bold text-slate-900 truncate max-w-xs">{b.route.name}</div>
                      <div className="text-[11px] text-slate-500">{b.route.zone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right">{formatNumber(b.route.km, 1)} km</td>
                    <td className="py-2.5 px-3 text-right">{b.totalHours.toFixed(1)} h</td>
                    <td className="py-2.5 px-3 text-right">{formatCOP(b.tollCost)}</td>
                    <td className="py-2.5 px-3 text-right">{formatCOP(b.totalLaborCost)}</td>
                    <td className="py-2.5 px-3 text-right">{formatCOP(b.fuelCost)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-900 bg-blue-50/20">{formatCOP(b.totalMaintenanceCost)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 bg-slate-50">{formatCOP(b.totalTripCost)}</td>
                    <td className="py-2.5 px-3 text-right">{formatCOP(b.costPerKm)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        b.profitPercentage >= 15 ? 'bg-emerald-100 text-emerald-800' : b.profitPercentage > 0 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {b.profitPercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onSelectRouteDetail(b)}
                        className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                        title="Ver desglose"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  );
};
