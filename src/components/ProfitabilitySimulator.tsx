import React, { useState } from 'react';
import { RouteCostBreakdown, VehicleProfile, LaborConfig, DeliveryRoute } from '../types/logistics';
import { calculateRouteCost, formatCOP, formatNumber } from '../utils/costCalculator';
import { 
  DollarSign, 
  Calculator, 
  TrendingUp, 
  Layers, 
  Truck, 
  Calendar, 
  Store, 
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';

interface ProfitabilitySimulatorProps {
  breakdowns: RouteCostBreakdown[];
  selectedVehicle: VehicleProfile;
  laborConfig: LaborConfig;
}

export const ProfitabilitySimulator: React.FC<ProfitabilitySimulatorProps> = ({
  breakdowns,
  selectedVehicle,
  laborConfig
}) => {
  // Frecuencia mensual global por ruta (ej. 4 despachos por mes por ruta)
  const [globalTripsPerMonth, setGlobalTripsPerMonth] = useState<number>(4);
  const [targetMargin, setTargetMargin] = useState<number>(20);

  // Cotizador rápido de nuevo viaje spot
  const [spotKm, setSpotKm] = useState<number>(350);
  const [spotTransitHours, setSpotTransitHours] = useState<number>(12);
  const [spotLoadingMins, setSpotLoadingMins] = useState<number>(180);
  const [spotTolls, setSpotTolls] = useState<number>(55000);
  const [spotStops, setSpotStops] = useState<number>(3);
  const [spotMargin, setSpotMargin] = useState<number>(20);

  // Cálculo mensual de toda la red
  const monthlyTotalKm = breakdowns.reduce((acc, b) => acc + (b.route.km * globalTripsPerMonth), 0);
  const monthlyTotalLabor = breakdowns.reduce((acc, b) => acc + (b.totalLaborCost * globalTripsPerMonth), 0);
  const monthlyTotalFuel = breakdowns.reduce((acc, b) => acc + (b.fuelCost * globalTripsPerMonth), 0);
  const monthlyTotalMaint = breakdowns.reduce(
    (acc, b) => acc + ((b.oilCost + b.tiresCost + b.preventiveMaintenanceCost + b.washingCost) * globalTripsPerMonth), 
    0
  );
  const monthlyTotalTolls = breakdowns.reduce((acc, b) => acc + (b.tollCost * globalTripsPerMonth), 0);
  const monthlyTotalFixed = breakdowns.reduce((acc, b) => acc + (b.proratedFixedCost * globalTripsPerMonth), 0);
  const monthlyGrandTotal = monthlyTotalLabor + monthlyTotalFuel + monthlyTotalMaint + monthlyTotalTolls + monthlyTotalFixed;
  const monthlySuggestedBilling = targetMargin < 100 
    ? monthlyGrandTotal / (1 - targetMargin / 100) 
    : monthlyGrandTotal * 1.5;
  const monthlyNetProfit = monthlySuggestedBilling - monthlyGrandTotal;

  // Cálculo viaje spot
  const spotRouteObj: DeliveryRoute = {
    id: "SPOT-01",
    name: "VIAJE PERSONALIZADO / SPOT",
    zone: "Ruta Ocasional",
    km: spotKm,
    transitHours: spotTransitHours,
    loadingMinutes: spotLoadingMins,
    storeIds: Array.from({ length: spotStops }, (_, i) => `PARADA-${i + 1}`),
    tollEstimatedCost: spotTolls,
    tollCount: 3
  };

  const spotBreakdown = calculateRouteCost(spotRouteObj, selectedVehicle, laborConfig);
  const spotSuggestedTariff = spotBreakdown.suggestedFreightTariff(spotMargin);
  const spotNetMargin = spotSuggestedTariff - spotBreakdown.totalTripCost;

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Simulador de Rentabilidad, Fletes y Presupuesto Mensual
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Proyecta el presupuesto mensual total de la flota de reparto o calcula al instante 
              la tarifa de flete comercial y utilidad deseada para cualquier viaje spot.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-600 font-medium">Despachos / Mes por Ruta:</span>
            <input
              type="number"
              min="1"
              max="30"
              value={globalTripsPerMonth}
              onChange={(e) => setGlobalTripsPerMonth(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 text-xs font-mono font-bold text-center border border-slate-300 rounded bg-white"
            />
          </div>
        </div>
      </div>

      {/* Tarjetas de Proyección Mensual de la Flota */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              Proyección Operativa Consolidada
            </span>
            <h2 className="text-lg font-bold text-white">
              Presupuesto Mensual de Flota ({breakdowns.length} rutas × {globalTripsPerMonth} viajes = {breakdowns.length * globalTripsPerMonth} despachos)
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400 font-medium">Margen Objetivo:</span>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={targetMargin}
              onChange={(e) => setTargetMargin(parseInt(e.target.value))}
              className="w-20 accent-emerald-500"
            />
            <span className="font-mono font-bold text-emerald-400 w-8 text-right">
              {targetMargin}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/80">
            <span className="text-xs text-slate-400 font-sans block">Kilometraje Mensual Total</span>
            <span className="text-2xl font-bold text-white mt-1 block">
              {formatNumber(monthlyTotalKm, 0)} km
            </span>
            <span className="text-[11px] text-slate-500 font-sans">
              red de transporte activa
            </span>
          </div>

          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/80">
            <span className="text-xs text-slate-400 font-sans block">Costo Operativo Total / Mes</span>
            <span className="text-2xl font-bold text-slate-200 mt-1 block">
              {formatCOP(monthlyGrandTotal, true)}
            </span>
            <span className="text-[11px] text-slate-500 font-sans">
              {formatCOP(monthlyGrandTotal)}
            </span>
          </div>

          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/80">
            <span className="text-xs text-slate-400 font-sans block">Utilidad Bruta Proyectada</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">
              +{formatCOP(monthlyNetProfit, true)}
            </span>
            <span className="text-[11px] text-emerald-300/70 font-sans">
              margen del {targetMargin}%
            </span>
          </div>

          <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-500/40">
            <span className="text-xs text-emerald-300 font-sans font-semibold block">
              Facturación / Tarifa Mensual
            </span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">
              {formatCOP(monthlySuggestedBilling, true)}
            </span>
            <span className="text-[11px] text-emerald-200/70 font-sans">
              ingreso sugerido de la flota
            </span>
          </div>
        </div>

        {/* Detalle de rubros mensuales */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs font-mono border-t border-slate-800">
          <div className="p-2.5 bg-slate-800/50 rounded-lg">
            <span className="text-slate-400 font-sans text-[11px] block">Nómina & Parafiscales</span>
            <span className="font-bold text-amber-400 mt-1 block">{formatCOP(monthlyTotalLabor, true)}</span>
          </div>
          <div className="p-2.5 bg-slate-800/50 rounded-lg">
            <span className="text-slate-400 font-sans text-[11px] block">Combustible ACPM</span>
            <span className="font-bold text-emerald-400 mt-1 block">{formatCOP(monthlyTotalFuel, true)}</span>
          </div>
          <div className="p-2.5 bg-slate-800/50 rounded-lg">
            <span className="text-slate-400 font-sans text-[11px] block">Mantenimiento & Llantas</span>
            <span className="font-bold text-blue-400 mt-1 block">{formatCOP(monthlyTotalMaint, true)}</span>
          </div>
          <div className="p-2.5 bg-slate-800/50 rounded-lg">
            <span className="text-slate-400 font-sans text-[11px] block">Peajes Totales</span>
            <span className="font-bold text-purple-400 mt-1 block">{formatCOP(monthlyTotalTolls, true)}</span>
          </div>
          <div className="p-2.5 bg-slate-800/50 rounded-lg">
            <span className="text-slate-400 font-sans text-[11px] block">Costos Fijos & Pólizas</span>
            <span className="font-bold text-slate-300 mt-1 block">{formatCOP(monthlyTotalFixed, true)}</span>
          </div>
        </div>
      </div>

      {/* Cotizador de Viaje Spot / Flete Ocasional */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Calculator className="w-5 h-5 text-emerald-700" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Cotizador Rápido de Flete / Viaje Spot
            </h2>
            <p className="text-xs text-slate-500">
              Ingresa los parámetros de cualquier viaje eventual para obtener la estructura de costos y tarifa sugerida
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Kilómetros Totales
            </label>
            <input
              type="number"
              step="10"
              value={spotKm}
              onChange={(e) => setSpotKm(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Horas Tránsito en Ruta
            </label>
            <input
              type="number"
              step="0.5"
              value={spotTransitHours}
              onChange={(e) => setSpotTransitHours(Math.max(0.5, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Minutos Cargue / Descargue
            </label>
            <input
              type="number"
              step="15"
              value={spotLoadingMins}
              onChange={(e) => setSpotLoadingMins(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Costo Peajes Estimado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400">$</span>
              <input
                type="number"
                step="5000"
                value={spotTolls}
                onChange={(e) => setSpotTolls(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Margen de Utilidad Deseado
            </label>
            <div className="relative">
              <input
                type="number"
                min="5"
                max="50"
                value={spotMargin}
                onChange={(e) => setSpotMargin(Math.max(5, parseInt(e.target.value) || 20))}
                className="w-full pl-3 pr-7 py-2 border border-slate-300 rounded-lg font-mono font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400">%</span>
            </div>
          </div>
        </div>

        {/* Resultado del Cotizador Spot */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-center">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-sans block">Tiempo Total Viaje</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">
                {spotBreakdown.totalHours.toFixed(1)} horas
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                {spotBreakdown.overtimeHours > 0 ? `+${spotBreakdown.overtimeHours.toFixed(1)}h extras` : '8h ordinarias'}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-sans block">Costo Total Liquidado</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">
                {formatCOP(spotBreakdown.totalTripCost)}
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                {formatCOP(spotBreakdown.costPerKm)}/km
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-sans block">Ganancia Neta ({spotMargin}%)</span>
              <span className="text-lg font-bold text-emerald-700 mt-1 block">
                +{formatCOP(spotNetMargin)}
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                utilidad esperada
              </span>
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-950">
              <span className="text-xs text-emerald-800 font-sans font-semibold block">
                Tarifa Flete a Cotizar
              </span>
              <span className="text-xl font-bold text-emerald-900 mt-1 block">
                {formatCOP(spotSuggestedTariff)}
              </span>
              <span className="text-[11px] text-emerald-700 font-sans">
                precio al cliente
              </span>
            </div>
          </div>

          {/* Desglose rápido del viaje spot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono border-t border-slate-200 pt-3 text-slate-600">
            <div>Personal (8h + extras + paraf.): <strong className="text-slate-800">{formatCOP(spotBreakdown.totalLaborCost)}</strong></div>
            <div>Combustible ACPM: <strong className="text-slate-800">{formatCOP(spotBreakdown.fuelCost)}</strong> ({spotBreakdown.fuelGallons.toFixed(1)} gal)</div>
            <div>Mantenimiento + Llantas: <strong className="text-slate-800">{formatCOP(spotBreakdown.oilCost + spotBreakdown.tiresCost + spotBreakdown.preventiveMaintenanceCost)}</strong></div>
            <div>Peajes + Fijos: <strong className="text-slate-800">{formatCOP(spotBreakdown.tollCost + spotBreakdown.proratedFixedCost)}</strong></div>
          </div>
        </div>

      </div>

    </div>
  );
};
