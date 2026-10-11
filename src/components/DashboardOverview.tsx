import React from 'react';
import { RouteCostBreakdown, VehicleProfile, LaborConfig } from '../types/logistics';
import { formatCOP, formatNumber } from '../utils/costCalculator';
import { 
  TrendingUp, 
  Clock, 
  MapPin, 
  Fuel, 
  Users, 
  Wrench, 
  ReceiptText, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Info,
  UploadCloud
} from 'lucide-react';

interface DashboardOverviewProps {
  breakdowns: RouteCostBreakdown[];
  selectedVehicle: VehicleProfile;
  laborConfig: LaborConfig;
  onSelectRouteDetail: (breakdown: RouteCostBreakdown) => void;
  onNavigateToRoutes: () => void;
  onOpenImportModal?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  breakdowns,
  selectedVehicle,
  laborConfig,
  onSelectRouteDetail,
  onNavigateToRoutes,
  onOpenImportModal
}) => {
  // Cálculos agregados de la flota
  const totalRoutes = breakdowns.length;
  const totalKm = breakdowns.reduce((acc, b) => acc + b.route.km, 0);
  const totalTripCostSum = breakdowns.reduce((acc, b) => acc + b.totalTripCost, 0);
  const avgTripCost = totalRoutes > 0 ? totalTripCostSum / totalRoutes : 0;
  const avgCostPerKm = totalKm > 0 ? totalTripCostSum / totalKm : 0;
  
  const totalLaborSum = breakdowns.reduce((acc, b) => acc + b.totalLaborCost, 0);
  const totalFuelSum = breakdowns.reduce((acc, b) => acc + b.fuelCost, 0);
  const totalMaintenanceSum = breakdowns.reduce(
    (acc, b) => acc + b.oilCost + b.tiresCost + b.preventiveMaintenanceCost + b.washingCost, 
    0
  );
  const totalTollsSum = breakdowns.reduce((acc, b) => acc + b.tollCost, 0);
  const totalFixedSum = breakdowns.reduce((acc, b) => acc + b.proratedFixedCost, 0);
  
  const totalLoadingHours = breakdowns.reduce((acc, b) => acc + (b.route.loadingMinutes / 60), 0);
  const totalTransitHours = breakdowns.reduce((acc, b) => acc + b.route.transitHours, 0);
  
  // Porcentajes de la estructura de costos
  const laborPct = totalTripCostSum > 0 ? (totalLaborSum / totalTripCostSum) * 100 : 0;
  const fuelPct = totalTripCostSum > 0 ? (totalFuelSum / totalTripCostSum) * 100 : 0;
  const maintPct = totalTripCostSum > 0 ? (totalMaintenanceSum / totalTripCostSum) * 100 : 0;
  const tollsPct = totalTripCostSum > 0 ? (totalTollsSum / totalTripCostSum) * 100 : 0;
  const fixedPct = totalTripCostSum > 0 ? (totalFixedSum / totalTripCostSum) * 100 : 0;

  // Ordenar rutas por costo total (Top 5 más costosas y Top 5 más económicas)
  const sortedByCost = [...breakdowns].sort((a, b) => b.totalTripCost - a.totalTripCost);
  const topCostRoutes = sortedByCost.slice(0, 5);
  const lowestCostRoutes = [...breakdowns].sort((a, b) => a.totalTripCost - b.totalTripCost).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Banner Informativo de Bases Financieras SICE-TAC */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Bases Oficiales de Transporte Colombia
            </span>
            <span className="text-xs text-slate-400">· CST Art. 168 & SICE-TAC MinTransporte</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Matriz de Costeo Real para Rutas de Reparto
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl">
            Medición integral: personal (conductor + auxiliar, jornada de 8h, horas extras y parafiscales completos), 
            desgaste de aceite, llantas, mantenimiento por km, combustible ACPM y peajes reales de la red vial nacional.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-right">
            <span className="text-xs text-slate-400 block">Vehículo Activo</span>
            <span className="text-sm font-semibold text-emerald-400 truncate block">
              {selectedVehicle.name}
            </span>
          </div>
        </div>
      </div>

      {totalRoutes === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Base de Datos Vacía
            </h2>
            <p className="text-xs text-slate-500">
              Se ha limpiado la base anterior. Carga tu nuevo archivo CSV o pega tus datos para que el sistema procese y mida los costos en vivo.
            </p>
          </div>
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Cargar Nueva Base de Datos
            </button>
          )}
        </div>
      )}

      {totalRoutes > 0 && (
        <>
          {/* Grid de KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Costo Promedio por Viaje */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Costo Promedio / Viaje</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {formatCOP(avgTripCost)}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>En base a {totalRoutes} rutas</span>
            <span className="font-semibold text-slate-700 font-mono">
              Total red: {formatCOP(totalTripCostSum, true)}
            </span>
          </div>
        </div>

        {/* KPI 2: Costo Promedio por Kilómetro (CPK) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Costo Medio por Km (CPK)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {formatCOP(avgCostPerKm)}
            </span>
            <span className="text-xs text-slate-500 ml-1">/ km</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Distancia red total</span>
            <span className="font-semibold text-slate-700 font-mono">
              {formatNumber(totalKm, 0)} km
            </span>
          </div>
        </div>

        {/* KPI 3: Gasto Personal & Parafiscales */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Participación Nómina</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {laborPct.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 ml-1">del costo total</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Conductor {laborConfig.hasHelper ? '+ Auxiliar' : ''}</span>
            <span className="font-semibold text-slate-700 font-mono">
              {laborConfig.isTaxExemptLey1607 ? 'Exon. Ley 1607' : '100% Parafiscales'}
            </span>
          </div>
        </div>

        {/* KPI 4: Horas Operativas & Cargue */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tiempos Muertos de Cargue</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {formatNumber(totalLoadingHours, 1)} h
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>En ruta: {formatNumber(totalTransitHours, 0)} h</span>
            <span className="font-semibold text-purple-700 font-mono">
              {((totalLoadingHours / (totalTransitHours + totalLoadingHours)) * 100).toFixed(0)}% espera
            </span>
          </div>
        </div>

      </div>

      {/* Desglose Estructural del Costo Operativo de Transporte */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Estructura Ponderada de Costos de Transporte
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Desglose integral de rubros sobre el total de la operación logística de reparto
              </p>
            </div>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
              Base: {selectedVehicle.name}
            </span>
          </div>

          {/* Barra de Distribución Porcentual */}
          <div className="mt-4 h-4 rounded-lg overflow-hidden flex bg-slate-100 shadow-inner">
            <div 
              style={{ width: `${laborPct}%` }} 
              className="bg-amber-600 transition-all duration-300 relative group"
              title={`Personal & Parafiscales: ${laborPct.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${fuelPct}%` }} 
              className="bg-emerald-600 transition-all duration-300"
              title={`Combustible ACPM: ${fuelPct.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${maintPct}%` }} 
              className="bg-blue-600 transition-all duration-300"
              title={`Mantenimiento & Llantas: ${maintPct.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${tollsPct}%` }} 
              className="bg-purple-600 transition-all duration-300"
              title={`Peajes: ${tollsPct.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${fixedPct}%` }} 
              className="bg-slate-500 transition-all duration-300"
              title={`Costos Fijos & Depreciación: ${fixedPct.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Leyenda y Rubros con Detalle Financiero */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          
          <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-amber-600 inline-block" />
              <span className="text-xs font-bold text-amber-900">Personal & Nómina</span>
            </div>
            <div className="mt-2 text-lg font-bold text-slate-900 font-mono">
              {laborPct.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600 font-mono mt-0.5">
              {formatCOP(totalLaborSum, true)}
            </div>
            <span className="text-[11px] text-amber-800 block mt-1 leading-tight">
              8h ordinarias + Extras diurnas/nocturnas + Parafiscales + ARL + Prestaciones + Viáticos.
            </span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
              <span className="text-xs font-bold text-emerald-900">Combustible ACPM</span>
            </div>
            <div className="mt-2 text-lg font-bold text-slate-900 font-mono">
              {fuelPct.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600 font-mono mt-0.5">
              {formatCOP(totalFuelSum, true)}
            </div>
            <span className="text-[11px] text-emerald-800 block mt-1 leading-tight">
              {selectedVehicle.kmPerGallon} km/galón a {formatCOP(selectedVehicle.fuelPricePerGallon)}/gal.
            </span>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
              <span className="text-xs font-bold text-blue-900">Mantenimiento & Llantas</span>
            </div>
            <div className="mt-2 text-lg font-bold text-slate-900 font-mono">
              {maintPct.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600 font-mono mt-0.5">
              {formatCOP(totalMaintenanceSum, true)}
            </div>
            <span className="text-[11px] text-blue-800 block mt-1 leading-tight">
              Aceite ({formatCOP(selectedVehicle.oilCostPerKm)}/km) + Llantas ({formatCOP(selectedVehicle.tiresCostPerKm)}/km) + Preventivo.
            </span>
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-200/70 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-purple-600 inline-block" />
              <span className="text-xs font-bold text-purple-900">Peajes Viales</span>
            </div>
            <div className="mt-2 text-lg font-bold text-slate-900 font-mono">
              {tollsPct.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600 font-mono mt-0.5">
              {formatCOP(totalTollsSum, true)}
            </div>
            <span className="text-[11px] text-purple-800 block mt-1 leading-tight">
              Casillas Invías / ANI según corredor geográfico de reparto.
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-slate-500 inline-block" />
              <span className="text-xs font-bold text-slate-800">Costos Fijos / Día</span>
            </div>
            <div className="mt-2 text-lg font-bold text-slate-900 font-mono">
              {fixedPct.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600 font-mono mt-0.5">
              {formatCOP(totalFixedSum, true)}
            </div>
            <span className="text-[11px] text-slate-600 block mt-1 leading-tight">
              SOAT, RTM, Pólizas de Carga, Seguros, Impuestos y Depreciación.
            </span>
          </div>

        </div>
      </div>

      {/* Dos Columnas: Rutas Más Costosas vs Más Económicas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Rutas Más Exigentes / Costosas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Rutas de Mayor Inversión Operativa
              </h3>
              <span className="text-xs text-slate-500">
                Largas distancias y alta intensidad de horas logísticas
              </span>
            </div>
            <button
              onClick={onNavigateToRoutes}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {topCostRoutes.map((b) => (
              <div 
                key={b.route.id}
                onClick={() => onSelectRouteDetail(b)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {b.route.id}
                    </span>
                    <span className="text-xs font-medium text-slate-900 truncate max-w-[180px] sm:max-w-xs">
                      {b.route.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{b.route.km} km</span>
                    <span>·</span>
                    <span>{b.totalHours.toFixed(1)} horas</span>
                    <span>·</span>
                    <span>{b.route.storeIds.length} locales</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    {formatCOP(b.totalTripCost)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {formatCOP(b.costPerKm)}/km
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Rutas Más Económicas / Cortas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Rutas de Menor Inversión / Urbanas
              </h3>
              <span className="text-xs text-slate-500">
                Recorridos locales y menor consumo de combustible
              </span>
            </div>
            <button
              onClick={onNavigateToRoutes}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {lowestCostRoutes.map((b) => (
              <div 
                key={b.route.id}
                onClick={() => onSelectRouteDetail(b)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {b.route.id}
                    </span>
                    <span className="text-xs font-medium text-slate-900 truncate max-w-[180px] sm:max-w-xs">
                      {b.route.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{b.route.km} km</span>
                    <span>·</span>
                    <span>{b.totalHours.toFixed(1)} horas</span>
                    <span>·</span>
                    <span>{b.route.storeIds.length} locales</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    {formatCOP(b.totalTripCost)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {formatCOP(b.costPerKm)}/km
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Ficha Técnica Rápida del Vehículo y Costos por Kilómetro */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Bases Financieras Unitarias por Kilómetro Recorrido ({selectedVehicle.name})
            </h3>
          </div>
          <span className="text-xs text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 font-mono">
            SICE-TAC MinTransporte
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Combustible (ACPM)</span>
            <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
              {formatCOP(selectedVehicle.fuelPricePerGallon / selectedVehicle.kmPerGallon)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">por km</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Aceite & Filtros</span>
            <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
              {formatCOP(selectedVehicle.oilCostPerKm)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">por km</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Desgaste Llantas</span>
            <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
              {formatCOP(selectedVehicle.tiresCostPerKm)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">por km</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Mantenim. Preventivo</span>
            <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
              {formatCOP(selectedVehicle.preventiveMaintenancePerKm)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">por km</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Lavado y Engrase</span>
            <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
              {formatCOP(selectedVehicle.washingAndGreasingPerKm)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">por km</span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 text-emerald-950">
            <span className="text-[11px] text-emerald-800 font-semibold block">Total Variable / Km</span>
            <span className="text-sm font-bold text-emerald-900 font-mono mt-1 block">
              {formatCOP(
                (selectedVehicle.fuelPricePerGallon / selectedVehicle.kmPerGallon) +
                selectedVehicle.oilCostPerKm +
                selectedVehicle.tiresCostPerKm +
                selectedVehicle.preventiveMaintenancePerKm +
                selectedVehicle.washingAndGreasingPerKm
              )}
            </span>
            <span className="text-[10px] text-emerald-700 font-mono">por km rodado</span>
          </div>
        </div>
      </div>
      </>
      )}

    </div>
  );
};
