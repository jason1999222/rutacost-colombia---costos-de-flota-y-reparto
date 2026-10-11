import React, { useState } from 'react';
import {
  FleetVehicleUnit,
  DeliveryRoute,
  VehicleProfile,
  LaborConfig,
  RouteCostBreakdown
} from '../types/logistics';
import { calculateRouteCost, formatCOP, formatNumber } from '../utils/costCalculator';
import {
  Truck,
  Users,
  Fuel,
  Wrench,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';

interface DailyFleetDispatcherProps {
  routes: DeliveryRoute[];
  vehicles: VehicleProfile[];
  laborConfig: LaborConfig;
  onOpenImportModal: () => void;
}

export const DailyFleetDispatcher: React.FC<DailyFleetDispatcherProps> = ({
  routes,
  vehicles,
  laborConfig,
  onOpenImportModal
}) => {
  // Configuración de vehículos operativos de la flota SCJ
  const [fleetUnits, setFleetUnits] = useState<FleetVehicleUnit[]>([
    { id: 'SCJ-V01', plate: 'GTX052', name: 'MAXIMO (NPR Turbo)', vehicleType: 'NPR', modelYear: 2020, driverName: 'Jose Ibañez', helperName: 'Jair Gamboa', vehicleProfileId: 'npr-c2-turbo', assignedRouteId: routes[0]?.id || '', status: 'EN_RUTA', tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
    { id: 'SCJ-V02', plate: 'ESQ742', name: 'MARCO POLO (NPR Turbo 2022)', vehicleType: 'NPR', modelYear: 2022, driverName: 'Yuther Ospina', helperName: 'Brayan Pareja', vehicleProfileId: 'npr-c2-turbo', assignedRouteId: routes[1]?.id || '', status: 'EN_RUTA', tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
    { id: 'SCJ-V03', plate: 'ESQ294', name: 'GOLIAT (NPR Turbo 2019)', vehicleType: 'NPR', modelYear: 2019, driverName: 'Manuel Andrés Giraldo', helperName: 'Wilder Monsalve', vehicleProfileId: 'npr-c2-turbo', assignedRouteId: routes[2]?.id || '', status: 'EN_RUTA', tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
    { id: 'SCJ-V04', plate: 'JYY249', name: 'ZEUSS (NPR Liviano)', vehicleType: 'NPR', modelYear: 2021, driverName: 'Juan Manuel Atehortua', helperName: 'Fredy Castañeda', vehicleProfileId: 'npr-c2-turbo', assignedRouteId: routes[3]?.id || '', status: 'EN_RUTA', tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
    { id: 'SCJ-V05', plate: 'PUN774', name: 'ORION (NLR Liviano)', vehicleType: 'NLR', modelYear: 2021, driverName: 'Julian Jimenez', helperName: 'Jair Gamboa', vehicleProfileId: 'nlr-camioneta', assignedRouteId: routes[4]?.id || '', status: 'EN_RUTA', tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
    { id: 'SCJ-V06', plate: 'PUN276', name: 'FENIX (NLR Liviano)', vehicleType: 'NLR', modelYear: 2020, driverName: 'Estiben Mora', helperName: 'Brayan Pareja', vehicleProfileId: 'nlr-camioneta', assignedRouteId: routes[5]?.id || '', status: 'EN_RUTA', tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
    { id: 'SCJ-V07', plate: 'LKN995', name: 'PERSEO (NLR Liviano)', vehicleType: 'NLR', modelYear: 2021, driverName: 'Guillermo Padilla', helperName: 'Wilder Monsalve', vehicleProfileId: 'nlr-camioneta', assignedRouteId: routes[6]?.id || '', status: 'EN_RUTA', tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
    { id: 'SCJ-V08', plate: 'JYX457', name: 'TITAN (NLR Liviano 2022)', vehicleType: 'NLR', modelYear: 2022, driverName: 'Juan David Correa', helperName: 'Fredy Castañeda', vehicleProfileId: 'nlr-camioneta', assignedRouteId: routes[7]?.id || '', status: 'EN_RUTA', tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
    { id: 'SCJ-V09', plate: 'NNM737', name: 'HERMES (NLR Liviano)', vehicleType: 'NLR', modelYear: 2020, driverName: 'Gabriel Ramirez', helperName: 'Jair Gamboa', vehicleProfileId: 'nlr-camioneta', assignedRouteId: routes[8]?.id || '', status: 'EN_RUTA', tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' }
  ]);

  const [workingDaysPerMonth, setWorkingDaysPerMonth] = useState<number>(26); // 26 días laborales estándar

  // Actualizar asignación de un vehículo
  const handleAssignRoute = (unitId: string, routeId: string) => {
    setFleetUnits(prev => prev.map(u => u.id === unitId ? { ...u, assignedRouteId: routeId } : u));
  };

  const handleUpdateUnit = (unitId: string, field: keyof FleetVehicleUnit, value: any) => {
    setFleetUnits(prev => prev.map(u => u.id === unitId ? { ...u, [field]: value } : u));
  };

  // Cálculo individual para cada vehículo asignado en el día
  const dailyDispatches = fleetUnits.map(unit => {
    const route = routes.find(r => r.id === unit.assignedRouteId);
    const profile = vehicles.find(v => v.id === unit.vehicleProfileId) || vehicles[0];

    if (!route) {
      return {
        unit,
        route: null,
        breakdown: null
      };
    }

    const breakdown = calculateRouteCost(route, profile, laborConfig);
    return {
      unit,
      route,
      breakdown
    };
  });

  // Totales Diarios de la Flota Operativa
  const activeDispatches = dailyDispatches.filter(d => d.breakdown !== null);
  const totalDailyKm = activeDispatches.reduce((acc, d) => acc + (d.breakdown?.route.km || 0), 0);
  const totalDailyFuelCOP = activeDispatches.reduce((acc, d) => acc + (d.breakdown?.fuelCost || 0), 0);
  const totalDailyGallons = activeDispatches.reduce((acc, d) => acc + (d.breakdown?.fuelGallons || 0), 0);
  const totalDailyLaborCOP = activeDispatches.reduce((acc, d) => acc + (d.breakdown?.totalLaborCost || 0), 0);
  const totalDailyTollsCOP = activeDispatches.reduce((acc, d) => acc + (d.breakdown?.tollCost || 0), 0);
  const totalDailyMaintCOP = activeDispatches.reduce((acc, d) => {
    const b = d.breakdown;
    if (!b) return acc;
    return acc + b.oilCost + b.tiresCost + b.preventiveMaintenanceCost + b.washingCost;
  }, 0);
  const totalDailyFixedCOP = activeDispatches.reduce((acc, d) => acc + (d.breakdown?.proratedFixedCost || 0), 0);

  const grandTotalDaily = totalDailyFuelCOP + totalDailyLaborCOP + totalDailyTollsCOP + totalDailyMaintCOP + totalDailyFixedCOP;
  const projectedMonthlyFleetCost = grandTotalDaily * workingDaysPerMonth;

  // Auditoría y cálculo de consumo de API de Google Maps con la flota
  const googleMonthlyQueriesEst = fleetUnits.length * 10 * workingDaysPerMonth;
  const googleFreeTierAllowance = 28500; // Equivalente a los $200 USD de crédito gratis mensual
  const googleQuotaPercentage = (googleMonthlyQueriesEst / googleFreeTierAllowance) * 100;

  return (
    <div className="space-y-6">

      {/* Encabezado Principal */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Operación Diaria de Flota
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Despacho Diario y Liquidación de Flota
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Diseñado para coordinar y costear la operación diaria de la flota vehicular:
              control de nómina de tripulaciones con horas ordinarias y extras, combustible ACPM,
              desgaste acumulado de llantas y aceite, peajes y cuota de Google Maps.
            </p>
          </div>

          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-right shrink-0">
            <span className="text-xs text-slate-400 block font-sans">Flota Activa:</span>
            <span className="text-base font-bold text-emerald-400 font-mono">{activeDispatches.length} / {fleetUnits.length} Vehículos</span>
          </div>
        </div>
      </div>

      {/* Banner de Viabilidad Google Maps con la Flota */}
      <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-5 text-emerald-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700/60 flex items-center justify-center text-white shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Monitoreo de Consumo con Google Maps</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                  100% VIABLE Y GRATIS ($0 USD)
                </span>
              </h2>
              <p className="text-xs text-emerald-200/80 mt-1 max-w-3xl leading-relaxed">
                <strong>Sí, funciona perfectamente.</strong> Google Cloud otorga a cada cuenta <strong>$200 USD mensuales de crédito gratuito</strong> (~28.500 cargas de mapa).
                Con la flota vehicular operando a diario (incluso consultando el mapa y tráfico hasta 10 veces al día por vehículo),
                consumirás apenas <strong>~1.560 cargas al mes ({googleQuotaPercentage.toFixed(1)}% del cupo gratuito)</strong>.
                El costo mensual de Google Maps es <strong>$0 COP / $0 USD</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Consumo de Cuota Gratuita */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-emerald-500/20 space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300 font-sans">Consumo estimado de la flota ({googleMonthlyQueriesEst} consultas/mes):</span>
            <span className="text-emerald-400 font-bold">{googleQuotaPercentage.toFixed(1)}% de tu cupo gratis</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${googleQuotaPercentage}%` }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Tarjetas de Resumen Consolidado Diario (Flota Activa) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">

        {/* KPI 1: Costo Total Diario */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 font-sans">Costo Total Flota / Día</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCOP(grandTotalDaily)}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-sans flex justify-between">
            <span>{activeDispatches.length} vehículos despachados</span>
            <span className="font-semibold text-slate-700 font-mono">
              {formatCOP(activeDispatches.length > 0 ? grandTotalDaily / activeDispatches.length : 0)} / carro
            </span>
          </div>
        </div>

        {/* KPI 2: Nómina Diaria 6 Tripulaciones */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 font-sans">Nómina del Día (6 Equipos)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCOP(totalDailyLaborCOP)}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-sans flex justify-between">
            <span>{activeDispatches.length} conductores {laborConfig.hasHelper ? `+ ${activeDispatches.length} auxiliares` : ''}</span>
            <span className="font-semibold text-amber-800 font-mono">
              8h + extras + parafiscales
            </span>
          </div>
        </div>

        {/* KPI 3: Combustible ACPM Diario */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 font-sans">Combustible ACPM / Día</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCOP(totalDailyFuelCOP)}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-sans flex justify-between">
            <span>{formatNumber(totalDailyGallons, 1)} galones consumidos</span>
            <span className="font-semibold text-blue-800 font-mono">
              {formatNumber(totalDailyKm, 0)} km totales
            </span>
          </div>
        </div>

        {/* KPI 4: Proyección Mensual (26 días) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 font-sans">Presupuesto Mensual ({workingDaysPerMonth}d)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCOP(projectedMonthlyFleetCost, true)}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-sans flex justify-between">
            <span>{activeDispatches.length} vehículos activos</span>
            <span className="font-semibold text-purple-800 font-mono">
              {formatCOP(projectedMonthlyFleetCost)}
            </span>
          </div>
        </div>

      </div>

      {/* Matriz de Despacho y Asignación de Vehículos */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-700" />
              Asignación Diaria de Rutas a la Flota
            </h2>
            <p className="text-xs text-slate-500">
              Selecciona la ruta asignada a cada carro para el despacho de hoy. Los costos operativos se liquidan en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-sans">
            <span className="text-slate-600 font-medium">Días Laborales/Mes:</span>
            <input
              type="number"
              min="1"
              max="31"
              value={workingDaysPerMonth}
              onChange={(e) => setWorkingDaysPerMonth(Math.max(1, parseInt(e.target.value) || 26))}
              className="w-14 px-2 py-0.5 text-xs font-mono font-bold text-center border border-slate-300 rounded bg-white"
            />
          </div>
        </div>

        {routes.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="text-xs text-slate-600">
              Aún no tienes rutas en la base de datos para asignar a los vehículos de la flota.
            </p>
            <button
              onClick={onOpenImportModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              Cargar Base de Datos de Rutas
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold font-sans">
                  <th className="py-3 px-3">Vehículo / Placa</th>
                  <th className="py-3 px-3">Tripulación Asignada</th>
                  <th className="py-3 px-3">Tipo de Vehículo</th>
                  <th className="py-3 px-3">Ruta Asignada Hoy</th>
                  <th className="py-3 px-3 text-right">Km Ruta</th>
                  <th className="py-3 px-3 text-right">Horas (Ruta+Cargue)</th>
                  <th className="py-3 px-3 text-right">Combustible</th>
                  <th className="py-3 px-3 text-right">Nómina Hoy</th>
                  <th className="py-3 px-3 text-right">Peajes</th>
                  <th className="py-3 px-3 text-right font-bold">Costo Hoy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {dailyDispatches.map(({ unit, route, breakdown }, idx) => (
                  <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors">

                    {/* Vehículo y Placa */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{unit.plate}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{unit.name}</div>
                    </td>

                    {/* Tripulación */}
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-800">{unit.driverName}</div>
                      {unit.helperName && (
                        <div className="text-[10px] text-slate-500">Aux: {unit.helperName}</div>
                      )}
                    </td>

                    {/* Perfil Vehicular */}
                    <td className="py-3 px-3 font-sans">
                      <select
                        value={unit.vehicleProfileId}
                        onChange={(e) => handleUpdateUnit(unit.id, 'vehicleProfileId', e.target.value)}
                        className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium"
                      >
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.name.split('(')[0]}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Ruta Asignada */}
                    <td className="py-3 px-3 font-sans">
                      <select
                        value={unit.assignedRouteId || ''}
                        onChange={(e) => handleAssignRoute(unit.id, e.target.value)}
                        className="text-xs bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-900 max-w-[200px] truncate"
                      >
                        <option value="">-- Sin Asignar --</option>
                        {routes.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.id}: {r.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Kilómetros */}
                    <td className="py-3 px-3 text-right">
                      {route ? `${formatNumber(route.km, 0)} km` : '-'}
                    </td>

                    {/* Horas */}
                    <td className="py-3 px-3 text-right font-sans">
                      {breakdown ? (
                        <div>
                          <span className="font-mono font-bold text-slate-900">{breakdown.totalHours.toFixed(1)} h</span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {breakdown.overtimeHours > 0 ? `(+${breakdown.overtimeHours.toFixed(1)}h ext)` : '8h ord'}
                          </span>
                        </div>
                      ) : '-'}
                    </td>

                    {/* Combustible */}
                    <td className="py-3 px-3 text-right">
                      {breakdown ? (
                        <div>
                          <span className="font-semibold text-blue-900">{formatCOP(breakdown.fuelCost)}</span>
                          <span className="text-[10px] text-slate-400 block">{formatNumber(breakdown.fuelGallons, 1)} gal</span>
                        </div>
                      ) : '-'}
                    </td>

                    {/* Nómina */}
                    <td className="py-3 px-3 text-right">
                      {breakdown ? (
                        <span className="font-semibold text-amber-900">{formatCOP(breakdown.totalLaborCost)}</span>
                      ) : '-'}
                    </td>

                    {/* Peajes */}
                    <td className="py-3 px-3 text-right">
                      {breakdown ? formatCOP(breakdown.tollCost) : '-'}
                    </td>

                    {/* Total Hoy */}
                    <td className="py-3 px-3 text-right bg-emerald-50/40">
                      {breakdown ? (
                        <span className="text-sm font-bold text-emerald-950 font-mono">
                          {formatCOP(breakdown.totalTripCost)}
                        </span>
                      ) : '-'}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
