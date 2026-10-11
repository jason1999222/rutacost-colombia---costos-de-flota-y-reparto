import React, { useState } from 'react';
import { RouteCostBreakdown, LaborConfig } from '../types/logistics';
import { formatCOP, formatNumber } from '../utils/costCalculator';
import {
  X,
  Printer,
  Truck,
  Users,
  Fuel,
  Wrench,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Store,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface RouteDetailModalProps {
  breakdown: RouteCostBreakdown;
  laborConfig: LaborConfig;
  onClose: () => void;
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({
  breakdown,
  laborConfig,
  onClose
}) => {
  const [targetMargin, setTargetMargin] = useState<number>(20);
  const { route, vehicle } = breakdown;

  const suggestedTariff = breakdown.suggestedFreightTariff(targetMargin);
  const projectedMarginCOP = suggestedTariff - breakdown.totalTripCost;

  const npr = breakdown.nprComparison;
  const nlr = breakdown.nlrComparison;
  const nlrMoreProfitable = nlr && npr && nlr.netProfitCOP > npr.netProfitCOP;
  const profitDiff = nlr && npr ? Math.abs(nlr.netProfitCOP - npr.netProfitCOP) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">

        {/* Header del Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-mono font-bold">
              {route.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {route.name}
                </h2>
                <span className="text-xs bg-slate-800 text-blue-400 px-2 py-0.5 rounded font-medium border border-slate-700">
                  {route.zone}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ficha Presupuestal SCJ Oficial & Liquidación Operativa SICE-TAC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="Imprimir remisión de liquidación"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir Ficha</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido Scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">

          {/* Tarjetas Resumen de Datos Operativos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block">Km con Retorno</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {formatNumber(route.km, 1)} km
              </span>
              <span className="text-[10px] text-slate-400 block">Ida y vuelta completa</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Tiempo Operativo Total</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {breakdown.totalHours.toFixed(1)} h
              </span>
              <span className="text-[10px] text-slate-500 block">
                {route.transitHours}h ruta + {route.loadingMinutes}m cargue
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Vehículo Evaluado</span>
              <span className="text-sm font-semibold text-slate-900 truncate block">
                {vehicle.name}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {vehicle.category} • {vehicle.kmPerGallon} km/gal
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Costo Total Liquidado</span>
              <span className="text-lg font-bold text-blue-900 font-mono">
                {formatCOP(breakdown.totalTripCost)}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {formatCOP(breakdown.costPerKm)}/km
              </span>
            </div>
          </div>

          {/* Tarjeta de Comparativa Oficial SCJ: NPR vs NLR */}
          {npr && nlr && (
            <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-700" />
                  <h3 className="text-sm font-bold text-blue-950">
                    Comparativa Inteligente de Rentabilidad: Camión NPR vs NLR
                  </h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  nlrMoreProfitable
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Recomendado: {nlrMoreProfitable ? 'Camión NLR' : 'Camión NPR'} (+{formatCOP(profitDiff, true)} margen)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-mono text-xs">
                {/* Columna NPR */}
                <div className={`p-3.5 rounded-xl border ${!nlrMoreProfitable ? 'bg-white border-blue-400 shadow-xs' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-900 text-sm">Opción NPR (Turbo 4.8T)</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px]">2 Ejes</span>
                  </div>
                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-sans">Flete Presupuestado (Ingreso):</span>
                      <span className="font-bold text-blue-950">{formatCOP(npr.freightTariff)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans">Peajes Ida y Retorno:</span>
                      <span>{formatCOP(npr.tollCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans">Combustible ACPM (22.5 km/gal):</span>
                      <span>{formatCOP(npr.fuelCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans">Mantenimiento SICE-TAC:</span>
                      <span>{formatCOP(npr.maintenanceCost)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                      <span className="font-sans">Costo Total NPR:</span>
                      <span>{formatCOP(npr.totalCost)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-1 font-bold text-sm text-blue-900">
                      <span className="font-sans">Utilidad Neta ($ COP):</span>
                      <span>{formatCOP(npr.netProfitCOP)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs text-blue-800">
                      <span className="font-sans">Margen de Ganancia:</span>
                      <span>{npr.profitMarginPct.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Columna NLR */}
                <div className={`p-3.5 rounded-xl border ${nlrMoreProfitable ? 'bg-white border-sky-400 shadow-xs' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sky-900 text-sm">Opción NLR (Camioneta 3.0T)</span>
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold rounded text-[10px]">Liviano</span>
                  </div>
                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-sans">Flete Presupuestado (Ingreso):</span>
                      <span className="font-bold text-sky-950">{formatCOP(nlr.freightTariff)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans">Peajes Ida y Retorno:</span>
                      <span>{formatCOP(nlr.tollCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans">Combustible ACPM (31.0 km/gal):</span>
                      <span>{formatCOP(nlr.fuelCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans">Mantenimiento SICE-TAC:</span>
                      <span>{formatCOP(nlr.maintenanceCost)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                      <span className="font-sans">Costo Total NLR:</span>
                      <span>{formatCOP(nlr.totalCost)}</span>
                    </div>
                    <div className="flex justify-between border-t border-sky-200 pt-1 font-bold text-sm text-sky-900">
                      <span className="font-sans">Utilidad Neta ($ COP):</span>
                      <span>{formatCOP(nlr.netProfitCOP)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs text-sky-800">
                      <span className="font-sans">Margen de Ganancia:</span>
                      <span>{nlr.profitMarginPct.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección 1: Liquidación de Personal y Parafiscales (CST Colombia) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-amber-50/80 px-4 py-3 border-b border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-800" />
                <h3 className="text-sm font-bold text-amber-950">
                  1. Liquidación de Nómina, Horas Extras y Parafiscales (CST & SCJ)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-900">
                Subtotal Personal: {formatCOP(breakdown.totalLaborCost)}
              </span>
            </div>

            <div className="p-4 space-y-4">
              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  Tarifas horarias SCJ: <strong>Hora Ordinaria: $8.000 COP</strong> (hasta 8h). Exceso liquidado como horas extras:
                  <strong> {breakdown.overtimeHours.toFixed(1)} horas</strong>
                  ({breakdown.overtimeDayHours.toFixed(1)}h diurnas @ <strong>$17.488 COP</strong> y {breakdown.overtimeNightHours.toFixed(1)}h nocturnas @ <strong>$23.000 COP</strong>).
                </p>
                {route.viaticosCOP !== undefined && route.viaticosCOP > 0 && (
                  <p className="text-amber-800 font-medium">
                    · Viático fijado en Matriz SCJ para esta ruta: <strong>{formatCOP(route.viaticosCOP)}</strong>.
                  </p>
                )}
                {laborConfig.isTaxExemptLey1607 && (
                  <p className="text-emerald-800">
                    · Beneficio tributario <strong>Ley 1607 / Art. 114-1 E.T.</strong>: Exoneración de aportes patronales a Salud (8.5%), SENA (2%) e ICBF (3%) para trabajadores con salario &lt;10 SMMLV.
                  </p>
                )}
              </div>

              {/* Tabla de Conductor vs Auxiliar */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                      <th className="py-2 px-3">Rubro Laboral</th>
                      <th className="py-2 px-3 text-right">Conductor / Polifuncional</th>
                      <th className="py-2 px-3 text-right">Auxiliar de Reparto</th>
                      <th className="py-2 px-3 text-right font-bold">Total Rubro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="py-2 px-3 font-sans">Sueldo Ordinario (8h @ $8.000/h)</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.driverCost.baseSalaryForTrip)}</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.helperCost.baseSalaryForTrip)}</td>
                      <td className="py-2 px-3 text-right font-bold">{formatCOP(breakdown.driverCost.baseSalaryForTrip + breakdown.helperCost.baseSalaryForTrip)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans">Horas Extras Diurnas ($17.488) y Nocturnas ($23.000)</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.driverCost.overtimePay)}</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.helperCost.overtimePay)}</td>
                      <td className="py-2 px-3 text-right font-bold">{formatCOP(breakdown.driverCost.overtimePay + breakdown.helperCost.overtimePay)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans">Auxilio de Transporte Legal</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.driverCost.auxilioTransporte)}</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.helperCost.auxilioTransporte)}</td>
                      <td className="py-2 px-3 text-right font-bold">{formatCOP(breakdown.driverCost.auxilioTransporte + breakdown.helperCost.auxilioTransporte)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans">Viáticos de Alimentación y Pernoctación</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.driverCost.viaticos)}</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.helperCost.viaticos)}</td>
                      <td className="py-2 px-3 text-right font-bold">{formatCOP(breakdown.driverCost.viaticos + breakdown.helperCost.viaticos)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans">Prestaciones Sociales (Prima, Cesantías, Int., Vacaciones)</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.driverCost.prestaciones)}</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.helperCost.prestaciones)}</td>
                      <td className="py-2 px-3 text-right font-bold">{formatCOP(breakdown.driverCost.prestaciones + breakdown.helperCost.prestaciones)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans">Seguridad Social Empleador (Pensión 12% + ARL Riesgo IV 4.35%)</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.driverCost.seguridadSocial)}</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.helperCost.seguridadSocial)}</td>
                      <td className="py-2 px-3 text-right font-bold">{formatCOP(breakdown.driverCost.seguridadSocial + breakdown.helperCost.seguridadSocial)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans">Aportes Parafiscales (Caja de Compensación 4%)</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.driverCost.parafiscales)}</td>
                      <td className="py-2 px-3 text-right">{formatCOP(breakdown.helperCost.parafiscales)}</td>
                      <td className="py-2 px-3 text-right font-bold">{formatCOP(breakdown.driverCost.parafiscales + breakdown.helperCost.parafiscales)}</td>
                    </tr>
                    <tr className="bg-amber-50/40 font-bold text-slate-900 border-t border-amber-200">
                      <td className="py-2 px-3 font-sans">Total Mano de Obra</td>
                      <td className="py-2 px-3 text-right text-amber-900">{formatCOP(breakdown.driverCost.total)}</td>
                      <td className="py-2 px-3 text-right text-amber-900">{formatCOP(breakdown.helperCost.total)}</td>
                      <td className="py-2 px-3 text-right text-amber-950 font-mono text-sm">{formatCOP(breakdown.totalLaborCost)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sección 2: Mantenimiento SICE-TAC y Combustible ACPM */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-blue-50/80 px-4 py-3 border-b border-blue-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-800" />
                <h3 className="text-sm font-bold text-blue-950">
                  2. Costos de Combustible ACPM, Desgaste y Mantenimiento SICE-TAC
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-blue-900">
                Subtotal Vehículo: {formatCOP(breakdown.totalVehicleVariableCost + breakdown.proratedFixedCost)}
              </span>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-sans text-slate-600 mb-1">
                    <Fuel className="w-3.5 h-3.5 text-blue-600" />
                    <span>Combustible (ACPM)</span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {formatCOP(breakdown.fuelCost)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans block mt-0.5">
                    {formatNumber(breakdown.fuelGallons, 1)} galones ({vehicle.kmPerGallon} km/gal @ {formatCOP(vehicle.fuelPricePerGallon)}/gal)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-sans text-slate-600 mb-1">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    <span>Aceite Motor y Filtros</span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {formatCOP(breakdown.oilCost)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans block mt-0.5">
                    {formatCOP(vehicle.oilCostPerKm)}/km (15W40 + filtros aire, combustible, aceite)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-sans text-slate-600 mb-1">
                    <Truck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Desgaste de Llantas</span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {formatCOP(breakdown.tiresCost)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans block mt-0.5">
                    {formatCOP(vehicle.tiresCostPerKm)}/km (juego de llantas + reencauche + alineación)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-sans text-slate-600 mb-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mantenimiento Preventivo</span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {formatCOP(breakdown.preventiveMaintenanceCost)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans block mt-0.5">
                    {formatCOP(vehicle.preventiveMaintenancePerKm)}/km (frenos, bandas, embrague, suspensión)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-sans text-slate-600 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Lavado, Engrase y Alistamiento</span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {formatCOP(breakdown.washingCost)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans block mt-0.5">
                    {formatCOP(vehicle.washingAndGreasingPerKm)}/km (crucetas, cardán, chasis)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-sans text-slate-600 mb-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span>Costos Fijos Documentales</span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {formatCOP(breakdown.proratedFixedCost)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans block mt-0.5">
                    SOAT, RTM, Pólizas Contractual/Extracontractual, GPS
                  </span>
                </div>

              </div>

              {/* Subtotal de Mantenimiento Consolidado */}
              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-700" />
                  <span className="font-sans font-bold text-blue-950">
                    Total Inversión en Mantenimiento y Desgaste:
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 font-sans">
                    ({formatCOP(vehicle.totalMaintenancePerKm)}/km)
                  </span>
                  <span className="text-sm font-bold text-blue-950">
                    {formatCOP(breakdown.totalMaintenanceCost)}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Sección 3: Peajes Viales */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-purple-50/80 px-4 py-3 border-b border-purple-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-800" />
                <h3 className="text-sm font-bold text-purple-950">
                  3. Peajes Viales Oficiales 2026
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-purple-900">
                Total Peajes: {formatCOP(breakdown.tollCost)}
              </span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="text-slate-800 font-semibold">
                  {route.tollCount > 0 ? `${route.tollCount} casillas de peaje (ida y retorno)` : 'Recorrido sin estaciones de peaje'}
                </p>
                {route.tollStations && (
                  <p className="text-slate-600 mt-1">
                    Estaciones consideradas: <strong className="text-slate-900">{route.tollStations}</strong>
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tarifas oficiales reguladas 2026 para {vehicle.category === 'NLR' ? 'NLR (Camioneta)' : 'NPR (2 Ejes)'}.
                </p>
              </div>
              <div className="font-mono text-lg font-bold text-purple-950">
                {formatCOP(breakdown.tollCost)}
              </div>
            </div>
          </div>

          {/* Sección 4: Tarifador de Flete & Margen Comercial */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  Tarifador de Flete & Margen de Rentabilidad
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Flete presupuestado en matriz: <strong>{formatCOP(breakdown.freightTariff)}</strong> • Margen actual: <strong>{breakdown.profitPercentage.toFixed(1)}%</strong>
                </p>
              </div>

              {/* Slider de Margen */}
              <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-300 font-medium">Margen Objetivo:</span>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(parseInt(e.target.value))}
                  className="w-24 accent-blue-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-blue-400 w-9 text-right">
                  {targetMargin}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 font-sans block">Costo Operativo Total</span>
                <span className="text-xl font-bold text-slate-200 mt-1 block">
                  {formatCOP(breakdown.totalTripCost)}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  {formatCOP(breakdown.costPerKm)}/km
                </span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 font-sans block">Utilidad al {targetMargin}%</span>
                <span className="text-xl font-bold text-blue-400 mt-1 block">
                  +{formatCOP(projectedMarginCOP)}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  beneficio neto proyectado
                </span>
              </div>

              <div className="bg-blue-950/70 p-3 rounded-lg border border-blue-500/50">
                <span className="text-xs text-blue-300 font-sans font-semibold block">
                  Flete Sugerido al Cliente
                </span>
                <span className="text-2xl font-bold text-blue-400 mt-1 block">
                  {formatCOP(suggestedTariff)}
                </span>
                <span className="text-[10px] text-blue-200/70 font-sans">
                  tarifa comercial recomendada
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer del Modal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Cálculo verificado con normativa laboral CST, matriz SCJ y Sistema SICE-TAC MinTransporte.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>

      </div>
    </div>
  );
};
