import React, { useState, useEffect } from 'react';
import { VehicleProfile, VehicleMaintenanceConfig } from '../types/logistics';
import { formatCOP, formatNumber } from '../utils/costCalculator';
import {
  computeMaintenanceRates,
  syncVehicleProfileWithMaintenance
} from '../utils/maintenanceCalculator';
import { VEHICLE_PROFILES } from '../data/vehicleProfiles';
import {
  Truck,
  Wrench,
  Fuel,
  Disc,
  ShieldCheck,
  Clock,
  RotateCcw,
  Check,
  Info,
  Layers,
  Save,
  AlertTriangle,
  Sliders,
  DollarSign,
  Sparkles,
  Download,
  Upload
} from 'lucide-react';

interface VehicleConfiguratorProps {
  selectedVehicle: VehicleProfile;
  vehicles: VehicleProfile[];
  onSelectVehicle: (vehicle: VehicleProfile) => void;
  onUpdateVehicle: (vehicle: VehicleProfile) => void;
}

export const VehicleConfigurator: React.FC<VehicleConfiguratorProps> = ({
  selectedVehicle,
  vehicles,
  onSelectVehicle,
  onUpdateVehicle
}) => {
  const [activeProfile, setActiveProfile] = useState<VehicleProfile>(selectedVehicle);
  const [activeSection, setActiveSection] = useState<'maintenance' | 'fuel' | 'fixed'>('maintenance');
  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  useEffect(() => {
    setActiveProfile(selectedVehicle);
  }, [selectedVehicle]);

  // Manejo de cambios en campos directos del perfil
  const handleDirectFieldChange = (field: keyof VehicleProfile, value: any) => {
    const updated = { ...activeProfile, [field]: value };
    setActiveProfile(updated);
    onUpdateVehicle(updated);
  };

  // Manejo de cambios en parámetros detallados de mantenimiento
  const handleMaintenanceConfigChange = (field: keyof VehicleMaintenanceConfig, value: number) => {
    if (!activeProfile.maintenanceConfig) return;

    const updatedConfig: VehicleMaintenanceConfig = {
      ...activeProfile.maintenanceConfig,
      [field]: Math.max(0, value)
    };

    const computed = computeMaintenanceRates(updatedConfig);
    const updatedProfile: VehicleProfile = {
      ...activeProfile,
      maintenanceConfig: updatedConfig,
      oilCostPerKm: computed.oilCostPerKm,
      tiresCostPerKm: computed.tiresCostPerKm,
      preventiveMaintenancePerKm: computed.preventiveMaintenancePerKm,
      correctiveMaintenancePerKm: computed.correctiveMaintenancePerKm,
      washingAndGreasingPerKm: computed.washingAndGreasingPerKm,
      totalMaintenancePerKm: computed.totalMaintenancePerKm,
      dailyFixedCost: computed.dailyFixedCost
    };

    setActiveProfile(updatedProfile);
    onUpdateVehicle(updatedProfile);
  };

  // Guardar y notificar
  const handleSaveNotification = () => {
    onUpdateVehicle(activeProfile);
    setSaveAlert(`¡Parámetros de "${activeProfile.name}" guardados y aplicados a todas las liquidaciones!`);
    setTimeout(() => setSaveAlert(null), 4000);
  };

  // Restablecer a los valores por defecto oficiales de SICE-TAC
  const handleResetToProfile = (profileId: string) => {
    const defaultProfile = VEHICLE_PROFILES.find(v => v.id === profileId);
    if (defaultProfile) {
      setActiveProfile(defaultProfile);
      onUpdateVehicle(defaultProfile);
      onSelectVehicle(defaultProfile);
      setSaveAlert(`Valores oficiales SICE-TAC restaurados para ${defaultProfile.name}.`);
      setTimeout(() => setSaveAlert(null), 3000);
    }
  };

  const mConfig = activeProfile.maintenanceConfig;

  const fuelCostPerKm = activeProfile.kmPerGallon > 0
    ? activeProfile.fuelPricePerGallon / activeProfile.kmPerGallon
    : 0;

  const totalMaintenancePerKm =
    activeProfile.oilCostPerKm +
    activeProfile.tiresCostPerKm +
    activeProfile.preventiveMaintenancePerKm +
    (activeProfile.correctiveMaintenancePerKm || 0) +
    activeProfile.washingAndGreasingPerKm;

  const totalVariableCostPerKm = fuelCostPerKm + totalMaintenancePerKm;

  return (
    <div className="space-y-6">

      {/* Alerta de guardado */}
      {saveAlert && (
        <div className="bg-emerald-700 text-white text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold">{saveAlert}</span>
          </div>
          <button onClick={() => setSaveAlert(null)} className="text-emerald-200 hover:text-white text-xs">
            Cerrar
          </button>
        </div>
      )}

      {/* Encabezado y Selector de Perfiles de Vehículos */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Configuración de Mantenimiento y Parámetros Técnicos de Flota
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Todos los rubros son 100% editables y configurables: lubricantes, llantas, sistema de frenos y embrague,
              provisión para imprevistos en vía, lavado y costos fijos de rodamiento.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start shrink-0">
            <button
              onClick={handleSaveNotification}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
            <button
              onClick={() => handleResetToProfile(activeProfile.id)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              title="Restablece los parámetros recomendados según la matriz SICE-TAC"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Restablecer SICE-TAC
            </button>
          </div>
        </div>

        {/* Selector de Vehículo Activo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {vehicles.map((v) => {
            const isSelected = activeProfile.id === v.id;
            const maintPerKm = v.oilCostPerKm + v.tiresCostPerKm + v.preventiveMaintenancePerKm + (v.correctiveMaintenancePerKm || 0) + v.washingAndGreasingPerKm;

            return (
              <div
                key={v.id}
                onClick={() => {
                  setActiveProfile(v);
                  onSelectVehicle(v);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{v.name}</span>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {v.description}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500">Mantenimiento:</span>
                  <span className="font-bold text-emerald-800">
                    {formatCOP(maintPerKm)} / km
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pestañas de Subsecciones */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveSection('maintenance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSection === 'maintenance'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Mantenimiento & Desgaste ({formatCOP(totalMaintenancePerKm)}/km)
          </button>
          <button
            onClick={() => setActiveSection('fuel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSection === 'fuel'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            Combustible ACPM ({formatCOP(fuelCostPerKm)}/km)
          </button>
          <button
            onClick={() => setActiveSection('fixed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSection === 'fixed'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Costos Fijos Diarios ({formatCOP(activeProfile.dailyFixedCost)}/día)
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: MANTENIMIENTO DETALLADO (Todos los rubros editables) */}
      {activeSection === 'maintenance' && (
        <div className="space-y-6">

          {/* Ficha Resumen de Mantenimiento por Km */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-emerald-400 font-bold block font-sans">
                  Tarifa Consolidada de Mantenimiento y Desgaste:
                </span>
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5 block">
                  {formatCOP(totalMaintenancePerKm)} por Kilómetro Rodado
                </span>
              </div>
              <div className="text-xs text-slate-400 font-sans">
                Vehículo: <strong className="text-white">{activeProfile.name.split('(')[0]}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 font-sans block text-[11px]">1. Aceite y Filtros</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{formatCOP(activeProfile.oilCostPerKm)}/km</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 font-sans block text-[11px]">2. Llantas y Balanceo</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{formatCOP(activeProfile.tiresCostPerKm)}/km</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 font-sans block text-[11px]">3. Frenos y Embrague</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{formatCOP(activeProfile.preventiveMaintenancePerKm)}/km</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 font-sans block text-[11px]">4. Provisión Imprevistos</span>
                <span className="text-amber-400 font-bold text-sm mt-0.5 block">{formatCOP(activeProfile.correctiveMaintenancePerKm || 0)}/km</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 font-sans block text-[11px]">5. Lavado y Engrase</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{formatCOP(activeProfile.washingAndGreasingPerKm)}/km</span>
              </div>
            </div>
          </div>

          {/* Grid de Formularios de Configuración de Mantenimiento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Tarjeta 1: Aceite, Lubricantes y Filtros */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Disc className="w-4 h-4 text-emerald-700" />
                  <h2 className="text-sm font-bold text-slate-900">1. Aceite y Lubricantes</h2>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {formatCOP(activeProfile.oilCostPerKm)} / km
                </span>
              </div>

              {mConfig ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Intervalo de Cambio (Km)
                      </label>
                      <input
                        type="number"
                        step="500"
                        value={mConfig.oilChangeIntervalKm}
                        onChange={(e) => handleMaintenanceConfigChange('oilChangeIntervalKm', parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Galones de Aceite
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={mConfig.oilGallonsPerChange}
                        onChange={(e) => handleMaintenanceConfigChange('oilGallonsPerChange', parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Precio Galón Aceite 15W40 ($)
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={mConfig.oilPricePerGallon}
                        onChange={(e) => handleMaintenanceConfigChange('oilPricePerGallon', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Filtro de Aceite Motor ($)
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={mConfig.oilFilterPrice}
                        onChange={(e) => handleMaintenanceConfigChange('oilFilterPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Filtro Trampa / ACPM ($)
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={mConfig.fuelFilterPrice}
                        onChange={(e) => handleMaintenanceConfigChange('fuelFilterPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Filtro de Aire Motor ($)
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={mConfig.airFilterPrice}
                        onChange={(e) => handleMaintenanceConfigChange('airFilterPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Mano de Obra Cambio Lubricantes ($)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={mConfig.laborOilChangeCost}
                      onChange={(e) => handleMaintenanceConfigChange('laborOilChangeCost', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] font-mono text-emerald-950 flex justify-between items-center">
                    <span>Costo total por cada cambio:</span>
                    <strong className="font-bold text-emerald-900">
                      {formatCOP(
                        (mConfig.oilGallonsPerChange * mConfig.oilPricePerGallon) +
                        mConfig.oilFilterPrice +
                        mConfig.fuelFilterPrice +
                        mConfig.airFilterPrice +
                        mConfig.laborOilChangeCost
                      )}
                    </strong>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Tarjeta 2: Llantas, Neumáticos y Reencauche */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-700" />
                  <h2 className="text-sm font-bold text-slate-900">2. Llantas y Neumáticos</h2>
                </div>
                <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                  {formatCOP(activeProfile.tiresCostPerKm)} / km
                </span>
              </div>

              {mConfig ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Cantidad de Llantas del Vehículo
                      </label>
                      <input
                        type="number"
                        value={mConfig.tireQuantity}
                        onChange={(e) => handleMaintenanceConfigChange('tireQuantity', parseInt(e.target.value) || 4)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Precio Llanta Nueva ($)
                      </label>
                      <input
                        type="number"
                        step="10000"
                        value={mConfig.newTirePrice}
                        onChange={(e) => handleMaintenanceConfigChange('newTirePrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Vida Útil Llanta Nueva (Km)
                      </label>
                      <input
                        type="number"
                        step="5000"
                        value={mConfig.newTireLifeKm}
                        onChange={(e) => handleMaintenanceConfigChange('newTireLifeKm', parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Reencauches Permitidos
                      </label>
                      <input
                        type="number"
                        value={mConfig.retreadCount}
                        onChange={(e) => handleMaintenanceConfigChange('retreadCount', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Costo de Reencauche ($)
                      </label>
                      <input
                        type="number"
                        step="10000"
                        value={mConfig.retreadPrice}
                        onChange={(e) => handleMaintenanceConfigChange('retreadPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Km Adicionales por Reencauche
                      </label>
                      <input
                        type="number"
                        step="5000"
                        value={mConfig.retreadLifeKm}
                        onChange={(e) => handleMaintenanceConfigChange('retreadLifeKm', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Alineación/Balanceo ($)
                      </label>
                      <input
                        type="number"
                        step="5000"
                        value={mConfig.alignmentBalancingCost}
                        onChange={(e) => handleMaintenanceConfigChange('alignmentBalancingCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Frecuencia Alineación (Km)
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={mConfig.alignmentBalancingIntervalKm}
                        onChange={(e) => handleMaintenanceConfigChange('alignmentBalancingIntervalKm', parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Tarjeta 3: Mecánica Preventiva (Frenos, Embrague, Suspensión) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-700" />
                  <h2 className="text-sm font-bold text-slate-900">3. Frenos, Embrague & Suspensión</h2>
                </div>
                <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                  {formatCOP(activeProfile.preventiveMaintenancePerKm)} / km
                </span>
              </div>

              {mConfig ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Cambio Bandas/Pastillas Freno ($)
                      </label>
                      <input
                        type="number"
                        step="10000"
                        value={mConfig.brakeBandsCost}
                        onChange={(e) => handleMaintenanceConfigChange('brakeBandsCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Frecuencia Frenos (Km)
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={mConfig.brakeBandsChangeKm}
                        onChange={(e) => handleMaintenanceConfigChange('brakeBandsChangeKm', parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Kit de Embrague Completo ($)
                      </label>
                      <input
                        type="number"
                        step="50000"
                        value={mConfig.clutchKitCost}
                        onChange={(e) => handleMaintenanceConfigChange('clutchKitCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Frecuencia Embrague (Km)
                      </label>
                      <input
                        type="number"
                        step="5000"
                        value={mConfig.clutchKitKm}
                        onChange={(e) => handleMaintenanceConfigChange('clutchKitKm', parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Suspensión, Terminales y Bujes ($)
                      </label>
                      <input
                        type="number"
                        step="20000"
                        value={mConfig.suspensionMaintenanceCost}
                        onChange={(e) => handleMaintenanceConfigChange('suspensionMaintenanceCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Frecuencia Suspensión (Km)
                      </label>
                      <input
                        type="number"
                        step="5000"
                        value={mConfig.suspensionMaintenanceKm}
                        onChange={(e) => handleMaintenanceConfigChange('suspensionMaintenanceKm', parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Tarjeta 4: Correctivo / Imprevistos & Lavado */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-900">4. Imprevistos, Lavado & Engrase</h2>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  {formatCOP((activeProfile.correctiveMaintenancePerKm || 0) + activeProfile.washingAndGreasingPerKm)} / km
                </span>
              </div>

              {mConfig ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-900 font-bold mb-1">
                      Fondo de Mantenimiento Correctivo / Imprevistos en Vía ($ / Km)
                    </label>
                    <input
                      type="number"
                      step="5"
                      value={mConfig.correctiveReservePerKm}
                      onChange={(e) => handleMaintenanceConfigChange('correctiveReservePerKm', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Provisión para fallas mecánicas fortuitas: mangueras rotas, correas, alternador, motor de arranque, turbo y refrigeración.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Lavado y Desinfección ($)
                      </label>
                      <input
                        type="number"
                        step="2000"
                        value={mConfig.washingCostPerService}
                        onChange={(e) => handleMaintenanceConfigChange('washingCostPerService', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Frecuencia Lavado (Km)
                      </label>
                      <input
                        type="number"
                        step="100"
                        value={mConfig.washingIntervalKm}
                        onChange={(e) => handleMaintenanceConfigChange('washingIntervalKm', parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Engrase de Crucetas/Cardán ($)
                      </label>
                      <input
                        type="number"
                        step="2000"
                        value={mConfig.greasingChassisCost}
                        onChange={(e) => handleMaintenanceConfigChange('greasingChassisCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Frecuencia Engrase (Km)
                      </label>
                      <input
                        type="number"
                        step="500"
                        value={mConfig.greasingIntervalKm}
                        onChange={(e) => handleMaintenanceConfigChange('greasingIntervalKm', parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

          </div>

          {/* Tabla de Simulación de Mantenimiento Acumulado */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700" />
                Matriz de Gasto Acumulado en Mantenimiento según Distancia Rodada
              </h3>
              <span className="text-xs font-mono font-bold text-slate-700">
                Total Mantenimiento: {formatCOP(totalMaintenancePerKm)}/km
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold font-sans">
                    <th className="py-2.5 px-3">Recorrido</th>
                    <th className="py-2.5 px-3 text-right">Aceite & Filtros</th>
                    <th className="py-2.5 px-3 text-right">Llantas & Balanceo</th>
                    <th className="py-2.5 px-3 text-right">Frenos & Embrague</th>
                    <th className="py-2.5 px-3 text-right">Imprevistos</th>
                    <th className="py-2.5 px-3 text-right">Lavado/Engrase</th>
                    <th className="py-2.5 px-3 text-right font-bold text-emerald-950">Gasto Total Mantenimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {[250, 500, 1000, 3000, 5000, 10000, 50000].map(km => (
                    <tr key={km} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold font-sans text-slate-900">{formatNumber(km, 0)} km</td>
                      <td className="py-2 px-3 text-right text-slate-700">{formatCOP(activeProfile.oilCostPerKm * km)}</td>
                      <td className="py-2 px-3 text-right text-slate-700">{formatCOP(activeProfile.tiresCostPerKm * km)}</td>
                      <td className="py-2 px-3 text-right text-slate-700">{formatCOP(activeProfile.preventiveMaintenancePerKm * km)}</td>
                      <td className="py-2 px-3 text-right text-amber-700">{formatCOP((activeProfile.correctiveMaintenancePerKm || 0) * km)}</td>
                      <td className="py-2 px-3 text-right text-slate-700">{formatCOP(activeProfile.washingAndGreasingPerKm * km)}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-950 bg-emerald-50/50">
                        {formatCOP(totalMaintenancePerKm * km)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SECCIÓN 2: COMBUSTIBLE (ACPM) */}
      {activeSection === 'fuel' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Fuel className="w-5 h-5 text-emerald-700" />
                Parámetros de Rendimiento de Combustible (ACPM)
              </h2>
              <p className="text-xs text-slate-500">
                Define el rendimiento real en carretera según el peso de la carga y el precio regulado del galón en Colombia
              </p>
            </div>
            <span className="text-sm font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg">
              {formatCOP(fuelCostPerKm)} / km
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs max-w-2xl">
            <div>
              <label className="block text-slate-900 font-bold mb-1">
                Rendimiento de Combustible (Km / Galón)
              </label>
              <input
                type="number"
                step="0.5"
                value={activeProfile.kmPerGallon}
                onChange={(e) => handleDirectFieldChange('kmPerGallon', parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Promedio camión liviano cargado en topografía colombiana: 22 a 26 km/galón. Sencillo pesado: 13 a 16 km/galón.
              </span>
            </div>

            <div>
              <label className="block text-slate-900 font-bold mb-1">
                Precio por Galón de ACPM (COP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400">$</span>
                <input
                  type="number"
                  step="100"
                  value={activeProfile.fuelPricePerGallon}
                  onChange={(e) => handleDirectFieldChange('fuelPricePerGallon', parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Precio promedio regulado en estaciones de servicio Colombia (Biodiésel B10/B12).
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono space-y-1 max-w-2xl">
            <span className="font-sans font-bold text-slate-900 block">Fórmula de Liquidación de Combustible:</span>
            <p>
              {formatCOP(activeProfile.fuelPricePerGallon)} / {activeProfile.kmPerGallon} km/gal = <strong className="text-emerald-800">{formatCOP(fuelCostPerKm)}</strong> por cada kilómetro recorrido.
            </p>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: COSTOS FIJOS (SOAT, RTM, PÓLIZAS, IMPUESTOS) */}
      {activeSection === 'fixed' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                Costos Fijos Documentales y Operativos Prorrateados
              </h2>
              <p className="text-xs text-slate-500">
                Prorrateo diario de obligaciones legales (SOAT, RTM, pólizas contractuales/extracontractuales, GPS y parqueadero)
              </p>
            </div>
            <span className="text-sm font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
              {formatCOP(activeProfile.dailyFixedCost)} / día
            </span>
          </div>

          {mConfig ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">SOAT Anual Obligatorio ($)</label>
                <input
                  type="number"
                  step="10000"
                  value={mConfig.soatAnnual}
                  onChange={(e) => handleMaintenanceConfigChange('soatAnnual', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Revisión Técnico-Mecánica (RTM) ($)</label>
                <input
                  type="number"
                  step="10000"
                  value={mConfig.rtmAnnual}
                  onChange={(e) => handleMaintenanceConfigChange('rtmAnnual', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Seguros Todo Riesgo / RCE y RCC ($)</label>
                <input
                  type="number"
                  step="50000"
                  value={mConfig.insuranceAnnual}
                  onChange={(e) => handleMaintenanceConfigChange('insuranceAnnual', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Impuesto Vehicular Anual ($)</label>
                <input
                  type="number"
                  step="20000"
                  value={mConfig.taxesAnnual}
                  onChange={(e) => handleMaintenanceConfigChange('taxesAnnual', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">GPS y Telemetría Satelital Mensual ($)</label>
                <input
                  type="number"
                  step="5000"
                  value={mConfig.gpsMonthly}
                  onChange={(e) => handleMaintenanceConfigChange('gpsMonthly', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Parqueadero Nocturno Mensual ($)</label>
                <input
                  type="number"
                  step="10000"
                  value={mConfig.parkingMonthly}
                  onChange={(e) => handleMaintenanceConfigChange('parkingMonthly', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Gastos de Administración Mensual ($)</label>
                <input
                  type="number"
                  step="10000"
                  value={mConfig.adminMonthly}
                  onChange={(e) => handleMaintenanceConfigChange('adminMonthly', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Costo Fijo Diario Override ($)</label>
                <input
                  type="number"
                  step="1000"
                  value={activeProfile.dailyFixedCost}
                  onChange={(e) => handleDirectFieldChange('dailyFixedCost', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-slate-50"
                />
              </div>
            </div>
          ) : null}
        </div>
      )}

    </div>
  );
};
