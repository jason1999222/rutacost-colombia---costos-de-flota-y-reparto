import React, { useState } from 'react';
import { DeliveryRoute, VehicleProfile, LaborConfig, RouteCostBreakdown } from '../types/logistics';
import { calculateRouteCost, formatCOP, formatNumber } from '../utils/costCalculator';
import {
  Navigation,
  MapPin,
  AlertTriangle,
  Clock,
  Fuel,
  DollarSign,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

interface RouteTrafficAnalyzerProps {
  routes: DeliveryRoute[];
  selectedVehicle: VehicleProfile;
  laborConfig: LaborConfig;
  onUpdateRoute: (updatedRoute: DeliveryRoute) => void;
  onOpenImportModal: () => void;
}

export type TrafficCondition = 'NORMAL' | 'MODERATE' | 'HEAVY' | 'DETOUR' | 'RAIN';

export const RouteTrafficAnalyzer: React.FC<RouteTrafficAnalyzerProps> = ({
  routes,
  selectedVehicle,
  laborConfig,
  onUpdateRoute,
  onOpenImportModal
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const [trafficCondition, setTrafficCondition] = useState<TrafficCondition>('HEAVY');
  const [newStoreInput, setNewStoreInput] = useState<string>('');

  const currentRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  // Factores de impacto según condición de tráfico
  const trafficFactors: Record<TrafficCondition, {
    name: string;
    timeMultiplier: number;
    fuelMultiplier: number;
    kmMultiplier: number;
    description: string;
    badgeColor: string;
  }> = {
    NORMAL: {
      name: "Tráfico Fluido (Nominal)",
      timeMultiplier: 1.0,
      fuelMultiplier: 1.0,
      kmMultiplier: 1.0,
      description: "Velocidad constante y vías despejadas.",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200"
    },
    MODERATE: {
      name: "Tráfico Moderado (+15% tiempo)",
      timeMultiplier: 1.15,
      fuelMultiplier: 1.08,
      kmMultiplier: 1.0,
      description: "Retrasos en ingresos urbanos o pasos peatonales intermunicipales.",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200"
    },
    HEAVY: {
      name: "Congestión Pesada / Hora Pico (+35% tiempo)",
      timeMultiplier: 1.35,
      fuelMultiplier: 1.22,
      kmMultiplier: 1.0,
      description: "Trancón prolongado, marcha lenta en ralentí y frenadas frecuentes.",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200"
    },
    DETOUR: {
      name: "Derrumbe / Cierre con Desvío (+55% tiempo, +20% km)",
      timeMultiplier: 1.55,
      fuelMultiplier: 1.35,
      kmMultiplier: 1.20,
      description: "Novedad en calzada carretera que obliga a tomar ruta alterna o esperar paso a un carril.",
      badgeColor: "bg-red-50 text-red-800 border-red-200"
    },
    RAIN: {
      name: "Lluvia Torrencial / Pavimento Mojado (+25% tiempo)",
      timeMultiplier: 1.25,
      fuelMultiplier: 1.12,
      kmMultiplier: 1.0,
      description: "Reducción de velocidad preventiva por neblina o calzada resbaladiza.",
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200"
    }
  };

  if (!currentRoute) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4 shadow-2xs">
        <Navigation className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">No hay rutas cargadas para analizar</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Carga una base de datos o crea una ruta para analizar condiciones de tráfico y reordenar puntos de entrega.
        </p>
        <button
          onClick={onOpenImportModal}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
        >
          Cargar Base de Datos
        </button>
      </div>
    );
  }

  const factor = trafficFactors[trafficCondition];

  // Cálculo Nominal (Base)
  const baselineBreakdown = calculateRouteCost(currentRoute, selectedVehicle, laborConfig);

  // Cálculo Afectado por Tráfico y Novedades
  const adjustedRoute: DeliveryRoute = {
    ...currentRoute,
    km: currentRoute.km * factor.kmMultiplier,
    transitHours: currentRoute.transitHours * factor.timeMultiplier,
    // Mayor consumo de combustible por ralentí / frenadas
    customFuelRateKmPerGal: currentRoute.customFuelRateKmPerGal
      ? (currentRoute.customFuelRateKmPerGal / factor.fuelMultiplier)
      : (selectedVehicle.kmPerGallon / factor.fuelMultiplier)
  };

  const trafficBreakdown = calculateRouteCost(adjustedRoute, selectedVehicle, laborConfig);

  const costDelta = trafficBreakdown.totalTripCost - baselineBreakdown.totalTripCost;
  const hoursDelta = trafficBreakdown.totalHours - baselineBreakdown.totalHours;
  const fuelDelta = trafficBreakdown.fuelCost - baselineBreakdown.fuelCost;
  const laborDelta = trafficBreakdown.totalLaborCost - baselineBreakdown.totalLaborCost;

  // Manejo de reordenamiento de puntos / locales
  const handleMoveStore = (index: number, direction: 'UP' | 'DOWN') => {
    const stores = [...currentRoute.storeIds];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stores.length) return;

    const temp = stores[index];
    stores[index] = stores[targetIdx];
    stores[targetIdx] = temp;

    const updated = { ...currentRoute, storeIds: stores };
    onUpdateRoute(updated);
  };

  const handleAddStore = () => {
    if (!newStoreInput.trim()) return;
    const stores = [...currentRoute.storeIds, newStoreInput.trim().toUpperCase()];
    // Agregar un punto suma ~30-45 mins de cargue/descargue
    const updated = {
      ...currentRoute,
      storeIds: stores,
      loadingMinutes: currentRoute.loadingMinutes + 35
    };
    onUpdateRoute(updated);
    setNewStoreInput('');
  };

  const handleRemoveStore = (index: number) => {
    if (currentRoute.storeIds.length <= 1) return;
    const stores = currentRoute.storeIds.filter((_, i) => i !== index);
    const updated = {
      ...currentRoute,
      storeIds: stores,
      loadingMinutes: Math.max(30, currentRoute.loadingMinutes - 35)
    };
    onUpdateRoute(updated);
  };

  // URL para abrir Google Maps en vivo
  const generateGoogleMapsUrl = () => {
    const cleanDestination = encodeURIComponent(currentRoute.name.split('-').pop()?.trim() || currentRoute.name);
    const origin = encodeURIComponent("Medellin, Colombia");
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${cleanDestination}+Colombia&travelmode=driving`;
  };

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Análisis de Tráfico, Puntos de Entrega y Novedades en Ruta
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Evalúa el impacto financiero inmediato generado por congestión vehicular, obras viales o cambios
              en la secuencia de entrega de los locales.
            </p>
          </div>

          {/* Selector de Ruta activa */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-600 font-medium">Ruta a Evaluar:</span>
            <select
              value={currentRoute.id}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-600"
            >
              {routes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selector de Condición de Tráfico / Novedad */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Condición de Tráfico o Incidencia en Carretera
            </h2>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded border font-semibold ${factor.badgeColor}`}>
            {factor.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
          {(Object.keys(trafficFactors) as TrafficCondition[]).map(condKey => {
            const item = trafficFactors[condKey];
            const isSelected = trafficCondition === condKey;

            return (
              <button
                key={condKey}
                onClick={() => setTrafficCondition(condKey)}
                className={`p-3 rounded-lg text-left border transition-all text-xs ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-slate-900">{item.name.split('(')[0]}</div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                  {item.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparativa de Impacto: Nominal vs Tráfico Real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Tarjeta de Impacto Financiero y Sobrecosto */}
        <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                Sobrecosto por Tráfico & Novedades
              </span>
              <h3 className="text-base font-bold text-white">
                {currentRoute.name} ({factor.name.split('(')[0]})
              </h3>
            </div>

            <a
              href={generateGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-400 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Abrir mapa en Google Maps con vista de tráfico satelital en vivo"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver en Google Maps</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-sans block">Costo Nominal (Normal)</span>
              <span className="text-xl font-bold text-slate-300 mt-1 block">
                {formatCOP(baselineBreakdown.totalTripCost)}
              </span>
              <span className="text-[11px] text-slate-500 font-sans">
                {baselineBreakdown.totalHours.toFixed(1)}h operativas
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-sans block">Costo con Incidencia</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">
                {formatCOP(trafficBreakdown.totalTripCost)}
              </span>
              <span className="text-[11px] text-amber-300/70 font-sans">
                {trafficBreakdown.totalHours.toFixed(1)}h operativas
              </span>
            </div>
          </div>

          {/* Variación Detallada */}
          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 text-xs font-mono space-y-2">
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-sans text-slate-400">Retraso en tiempo de viaje:</span>
              <span className="text-amber-400 font-bold">+{hoursDelta.toFixed(1)} horas</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-sans text-slate-400">Sobrecosto en Nómina (Horas Extras):</span>
              <span className="text-amber-400 font-bold">+{formatCOP(laborDelta)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-sans text-slate-400">Combustible extra (ralentí / desvío):</span>
              <span className="text-amber-400 font-bold">+{formatCOP(fuelDelta)}</span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-white text-sm font-bold">
              <span className="font-sans text-emerald-400">Sobrecosto Total Neto:</span>
              <span className="text-emerald-400">+{formatCOP(costDelta)} ({((costDelta / baselineBreakdown.totalTripCost) * 100).toFixed(1)}%)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            * El sobrecosto contempla que el conductor y auxiliar acumulan más horas extras diurnas (+25%) o nocturnas (+75%)
            según el Código Sustantivo del Trabajo colombiano cuando el tráfico se congestiona.
          </p>
        </div>

        {/* Gestor y Reordenador de Puntos / Locales de Entrega */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                Secuencia de Puntos de Entrega ({currentRoute.storeIds.length} Locales)
              </h3>
              <p className="text-xs text-slate-500">
                Cambia el orden de visita de los locales para simular rutas lógicas de entrega
              </p>
            </div>
            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {currentRoute.loadingMinutes} min cargue
            </span>
          </div>

          {/* Lista de Puntos Reordenables */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            {currentRoute.storeIds.map((storeId, idx) => (
              <div
                key={`${storeId}-${idx}`}
                className="py-2 px-3 flex items-center justify-between hover:bg-slate-50 text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] font-mono">
                    {idx + 1}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {storeId}
                  </span>
                  {idx === 0 && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                      Punto Origen / Bodega
                    </span>
                  )}
                  {idx === currentRoute.storeIds.length - 1 && idx > 0 && (
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
                      Última Parada
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveStore(idx, 'UP')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded"
                    title="Subir en la secuencia de entrega"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveStore(idx, 'DOWN')}
                    disabled={idx === currentRoute.storeIds.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded"
                    title="Bajar en la secuencia de entrega"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveStore(idx)}
                    disabled={currentRoute.storeIds.length <= 1}
                    className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded"
                    title="Eliminar punto de entrega"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario para agregar punto */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Código nuevo local (ej. L-052)..."
              value={newStoreInput}
              onChange={(e) => setNewStoreInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStore()}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            <button
              onClick={handleAddStore}
              disabled={!newStoreInput.trim()}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar Parada
            </button>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex justify-between items-center font-mono">
            <span>Costo imputado por parada con tráfico:</span>
            <strong className="text-slate-900 font-bold">{formatCOP(trafficBreakdown.costPerStore)}</strong>
          </div>
        </div>

      </div>

    </div>
  );
};
