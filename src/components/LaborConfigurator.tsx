import React, { useState } from 'react';
import { LaborConfig } from '../types/logistics';
import { formatCOP, formatNumber } from '../utils/costCalculator';
import { DEFAULT_LABOR_CONFIG } from '../data/laborDefaults';
import { 
  Users, 
  Clock, 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle2, 
  Calendar,
  Percent,
  TrendingUp,
  Sparkles,
  Save,
  Calculator,
  ArrowRight,
  Info
} from 'lucide-react';

interface LaborConfiguratorProps {
  laborConfig: LaborConfig;
  onUpdateLaborConfig: (newConfig: LaborConfig) => void;
}

export const LaborConfigurator: React.FC<LaborConfiguratorProps> = ({
  laborConfig,
  onUpdateLaborConfig
}) => {
  const [testHours, setTestHours] = useState<number>(14);
  const [annualIncreasePercentage, setAnnualIncreasePercentage] = useState<number>(23); // 23% decretado para 2026
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Cargar valores oficiales Colombia 2026 (exactos según Decreto y screenshot)
  const handleApply2026Official = () => {
    const config2026: LaborConfig = {
      ...DEFAULT_LABOR_CONFIG,
      smmlv: 1750905,
      auxilioTransporteLegal: 249095,
      driverSalary: 2500000,
      helperSalary: 1750905,
      dailyViaticosPerPerson: 85000
    };
    onUpdateLaborConfig(config2026);
    showNotification('Valores oficiales Colombia 2026 aplicados: SMLMV $1.750.905 + Auxilio $249.095 (Total $2.000.000).');
  };

  // Aplicar porcentaje de incremento anual (para cuando cambie cada año: 2027, 2028, etc.)
  const handleApplyAnnualIncrease = () => {
    if (annualIncreasePercentage <= 0) return;
    const factor = 1 + (annualIncreasePercentage / 100);

    const newSmmlv = Math.round((laborConfig.smmlv * factor) / 1000) * 1000;
    const newAux = Math.round((laborConfig.auxilioTransporteLegal * factor) / 1000) * 1000;
    const newDriver = Math.round((laborConfig.driverSalary * factor) / 1000) * 1000;
    const newHelper = Math.round((laborConfig.helperSalary * factor) / 1000) * 1000;
    const newViaticos = Math.round((laborConfig.dailyViaticosPerPerson * factor) / 1000) * 1000;

    const updatedConfig: LaborConfig = {
      ...laborConfig,
      smmlv: newSmmlv,
      auxilioTransporteLegal: newAux,
      driverSalary: newDriver,
      helperSalary: newHelper,
      dailyViaticosPerPerson: newViaticos
    };

    onUpdateLaborConfig(updatedConfig);
    showNotification(`Incremento anual del ${annualIncreasePercentage}% aplicado a salarios, auxilio de transporte y viáticos.`);
  };

  // Restablecer valores
  const handleReset = () => {
    onUpdateLaborConfig(DEFAULT_LABOR_CONFIG);
    showNotification('Valores de nómina restablecidos a la base 2026.');
  };

  // Cálculo del factor prestacional total porcentual
  const prestacionesSum = 
    laborConfig.primaServiciosRate + 
    laborConfig.cesantiasRate + 
    laborConfig.interesesCesantiasRate + 
    laborConfig.vacacionesRate;

  const seguridadSocialSum = 
    laborConfig.pensionRate + 
    (laborConfig.isTaxExemptLey1607 ? 0 : laborConfig.saludRate) + 
    laborConfig.arlRiskLevelRate;

  const parafiscalesSum = 
    laborConfig.cajaCompensacionRate + 
    (laborConfig.isTaxExemptLey1607 ? 0 : (laborConfig.senaRate + laborConfig.icbfRate));

  const totalFactorRate = prestacionesSum + seguridadSocialSum + parafiscalesSum;

  // Total ingreso mínimo mensual legal vigente
  const totalMinimoLegal = laborConfig.smmlv + laborConfig.auxilioTransporteLegal;

  // Simulación de prueba para las horas seleccionadas
  // Usa la MISMA fórmula que costCalculator.ts para garantizar consistencia
  const simRegularHours = Math.min(testHours, laborConfig.standardHoursPerDay);
  const simOvertimeHours = Math.max(0, testHours - laborConfig.standardHoursPerDay);
  const simOvertimeDay = Math.min(simOvertimeHours, 4);
  const simOvertimeNight = Math.max(0, simOvertimeHours - 4);

  // Tarifa horaria ordinaria SCJ (no se deriva del salario mensual)
  const driverHourly = laborConfig.hourlyOrdinaryRate || 8000;
  const driverRegularPay = driverHourly * simRegularHours;
  const driverOvertimePay =
    (simOvertimeDay * (laborConfig.hourlyOvertimeDayRate || 17488)) +
    (simOvertimeNight * (laborConfig.hourlyOvertimeNightRate || 23000));
  const driverBaseDevengado = driverRegularPay + driverOvertimePay;
  const driverAuxTransporte = (laborConfig.auxilioTransporteLegal / 30) * Math.max(1, testHours / 8);
  const driverPrestaciones = (driverBaseDevengado + driverAuxTransporte) * (laborConfig.primaServiciosRate + laborConfig.cesantiasRate + laborConfig.interesesCesantiasRate) + (driverBaseDevengado * laborConfig.vacacionesRate);
  const driverSeguridad = driverBaseDevengado * seguridadSocialSum;
  const driverParafiscales = driverBaseDevengado * parafiscalesSum;
  const driverViaticos = testHours >= laborConfig.viaticosHourThreshold ? laborConfig.dailyViaticosPerPerson : 0;
  const driverTotal = driverBaseDevengado + driverAuxTransporte + driverPrestaciones + driverSeguridad + driverParafiscales + driverViaticos;

  return (
    <div className="space-y-6">
      
      {/* Notificación flotante */}
      {notification && (
        <div className="bg-emerald-800 text-white text-xs px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-200 hover:text-white">✕</button>
        </div>
      )}

      {/* Encabezado */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-600 text-white rounded-lg shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Gestión de Salarios, Tarifas Laborales y Ajustes Anuales (CST)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configura el Salario Mínimo (SMLMV), Auxilio de Transporte, sueldos de tripulación y actualiza fácilmente las tarifas cada año.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleApply2026Official}
            className="px-3.5 py-2 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 border border-emerald-300 shadow-2xs"
            title="Cargar valores oficiales decretados Colombia 2026"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Cargar Oficial 2026 ($2.000.000)</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      {/* BANNER CLAVE: MODO DE ACTUALIZACIÓN ANUAL (CAMBIO CADA AÑO) */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Herramienta de Ajuste e Incremento Anual (Cambio Cada Año)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.2">
                Cuando el gobierno fije el nuevo aumento anual para 2026, 2027 o posteriores, puedes aplicarlo aquí automáticamente en 1 clic.
              </p>
            </div>
          </div>

          <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs flex items-center gap-2 font-mono">
            <span className="text-slate-400 font-sans">Total Mínimo Actual:</span>
            <span className="font-bold text-emerald-400 text-sm">{formatCOP(totalMinimoLegal)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">
                Porcentaje de Incremento Anual Decretado:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-24">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="100"
                  value={annualIncreasePercentage}
                  onChange={(e) => setAnnualIncreasePercentage(parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-7 py-1.5 border border-slate-600 bg-slate-900 rounded-lg font-mono font-bold text-white text-sm text-center"
                />
                <span className="absolute right-2.5 top-1.5 text-slate-400 font-mono font-bold">%</span>
              </div>

              <button
                type="button"
                onClick={handleApplyAnnualIncrease}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <span>Aplicar Incremento a Toda la Nómina</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-800/50 p-3 rounded-xl border border-slate-700/80">
            💡 <strong className="text-slate-200">Vigencia 2026:</strong> El SMLMV subió un 23% fijándose en <strong>$1.750.905</strong> y el auxilio en <strong>$249.095</strong>, sumando exactamente <strong>$2.000.000 COP</strong> mensuales.
          </div>
        </div>
      </div>

      {/* Grid de Configuración Detallada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1: Salarios y Tripulación */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">1. Salarios de la Tripulación</h2>
            </div>
            <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
              Base 2026
            </span>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* SMMLV */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold">
                  Salario Mínimo Legal Vigente (SMLMV)
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Decreto Anual</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="1"
                  value={laborConfig.smmlv}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, smmlv: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm text-slate-900 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Valor oficial 2026: <strong className="text-slate-800">$1.750.905 COP</strong>
              </span>
            </div>

            {/* Auxilio de Transporte */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold">
                  Auxilio de Transporte Legal Mensual
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Obligatorio</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="1"
                  value={laborConfig.auxilioTransporteLegal}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, auxilioTransporteLegal: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm text-slate-900 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px]">
                <span className="text-slate-500">Valor oficial 2026: <strong>$249.095 COP</strong></span>
                <span className="font-bold text-emerald-800 font-mono">Total: {formatCOP(totalMinimoLegal)}</span>
              </div>
            </div>

            {/* Resumen Total Ingreso Mínimo */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wide">
                  Ingreso Total Mensual (Salario + Auxilio)
                </span>
                <span className="text-xs text-emerald-700">Piso mínimo legal por trabajador</span>
              </div>
              <span className="text-base font-bold font-mono text-emerald-900">
                {formatCOP(totalMinimoLegal)}
              </span>
            </div>

            {/* Salario Conductor */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-900 font-bold">
                  Salario Básico Conductor de Reparto
                </label>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => onUpdateLaborConfig({ ...laborConfig, driverSalary: Math.round(laborConfig.smmlv * 1.43) })}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-semibold"
                    title="Ajustar a 1.43 SMMLV"
                  >
                    1.43x SMMLV
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateLaborConfig({ ...laborConfig, driverSalary: Math.round(laborConfig.smmlv * 1.5) })}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-semibold"
                    title="Ajustar a 1.5 SMMLV"
                  >
                    1.5x SMMLV
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="any"
                  value={laborConfig.driverSalary}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, driverSalary: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">
                Equivalente a {(laborConfig.driverSalary / laborConfig.smmlv).toFixed(2)} SMMLV ({formatCOP(laborConfig.driverSalary / laborConfig.monthlyWorkingHours)}/hora ordinaria)
              </span>
            </div>

            {/* Auxiliar de Reparto */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-900 font-bold">
                  Incluir Auxiliar de Reparto / Cargue
                </label>
                <input
                  type="checkbox"
                  checked={laborConfig.hasHelper}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, hasHelper: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>

              {laborConfig.hasHelper && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-600 font-medium">
                      Salario Básico Auxiliar de Logística
                    </label>
                    <button
                      type="button"
                      onClick={() => onUpdateLaborConfig({ ...laborConfig, helperSalary: laborConfig.smmlv })}
                      className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-semibold"
                      title="Ajustar exactamente a 1 SMLMV"
                    >
                      = 1.0x SMLMV
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="any"
                      value={laborConfig.helperSalary}
                      onChange={(e) => onUpdateLaborConfig({ ...laborConfig, helperSalary: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm text-slate-900 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {(laborConfig.helperSalary / laborConfig.smmlv).toFixed(2)} SMMLV ({formatCOP(laborConfig.helperSalary / laborConfig.monthlyWorkingHours)}/hora ordinaria)
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Columna 2: Jornada, Recargos y Viáticos */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">2. Jornada de 8h, Recargos y Viáticos</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Jornada Ordinaria Diaria Máxima
              </label>
              <input
                type="number"
                step="0.5"
                value={laborConfig.standardHoursPerDay}
                onChange={(e) => onUpdateLaborConfig({ ...laborConfig, standardHoursPerDay: parseFloat(e.target.value) || 8 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Límite legal estándar: 8 horas ordinarias de trabajo.
              </span>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Recargo Hora Extra Diurna (+25% CST)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={Math.round(laborConfig.dayOvertimeSurcharge * 100)}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, dayOvertimeSurcharge: (parseFloat(e.target.value) || 25) / 100 })}
                  className="w-full pl-3 pr-7 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">%</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Recargo Hora Extra Nocturna (+75% CST)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={Math.round(laborConfig.nightOvertimeSurcharge * 100)}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, nightOvertimeSurcharge: (parseFloat(e.target.value) || 75) / 100 })}
                  className="w-full pl-3 pr-7 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-slate-900 font-bold mb-1">
                Viáticos / Pernoctación Diaria (Rutas Largas)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="any"
                  value={laborConfig.dailyViaticosPerPerson}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, dailyViaticosPerPerson: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Alimentación y pernoctada en rutas mayores a {laborConfig.viaticosHourThreshold}h.
              </span>
            </div>

            <div className="pt-1">
              <label className="block text-slate-600 font-medium mb-1">
                Dotación y EPP Mensual por Persona
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="any"
                  value={laborConfig.monthlyDotacionPerPerson}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, monthlyDotacionPerPerson: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Columna 3: Parafiscales y Exoneración Ley 1607 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">3. Parafiscales & Seguridad Social</h2>
          </div>

          <div className="space-y-3 text-xs">
            {/* Toggle Ley 1607 */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-emerald-950 block">
                    Exoneración Ley 1607 (Art. 114-1 E.T.)
                  </span>
                  <span className="text-[11px] text-emerald-800 block mt-0.5">
                    Exonera a la empresa de Salud (8.5%), SENA (2%) e ICBF (3%) en sueldos &lt; 10 SMMLV.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={laborConfig.isTaxExemptLey1607}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, isTaxExemptLey1607: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 mt-1"
                />
              </div>
            </div>

            {/* Selector ARL */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Nivel de Riesgo ARL (Transporte de Carga)
              </label>
              <select
                value={laborConfig.arlRiskLevelRate}
                onChange={(e) => onUpdateLaborConfig({ ...laborConfig, arlRiskLevelRate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                <option value={0.02436}>Riesgo III (2.436%) - Distribución Liviana Urbana</option>
                <option value={0.04350}>Riesgo IV (4.350%) - Transporte Carretero Estándar</option>
                <option value={0.06960}>Riesgo V (6.960%) - Carga Pesada o Mercancía Peligrosa</option>
              </select>
            </div>

            {/* Resumen del Factor Total */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Prestaciones (Prima, Cesantías, Vac):</span>
                <span className="font-semibold">{(prestacionesSum * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pensión Empleador:</span>
                <span className="font-semibold">{(laborConfig.pensionRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Salud Empleador:</span>
                <span className="font-semibold">
                  {laborConfig.isTaxExemptLey1607 ? '0.00% (Exento)' : `${(laborConfig.saludRate * 100).toFixed(2)}%`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ARL Empleador:</span>
                <span className="font-semibold">{(laborConfig.arlRiskLevelRate * 100).toFixed(3)}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Caja Compensación:</span>
                <span className="font-semibold">{(laborConfig.cajaCompensacionRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SENA + ICBF:</span>
                <span className="font-semibold">
                  {laborConfig.isTaxExemptLey1607 ? '0.00% (Exento)' : '5.00%'}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-xs">
                <span>Factor Total sobre Salario:</span>
                <span className="text-emerald-800">{(totalFactorRate * 100).toFixed(2)}%</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Columna 4: Tarifas Horarias y Prestaciones (NUEVO - parámetros críticos editables) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Calculator className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-bold text-slate-900">4. Tarifas Horarias y Prestaciones</h2>
        </div>

        <div className="space-y-3 text-xs">
          {/* Tarifa Horaria Ordinaria */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Tarifa Horaria Ordinaria SCJ
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="500"
                value={laborConfig.hourlyOrdinaryRate}
                onChange={(e) => onUpdateLaborConfig({ ...laborConfig, hourlyOrdinaryRate: parseFloat(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Tarifa pactada por viaje (no se deriva del salario mensual).
            </span>
          </div>

          {/* Hora Extra Diurna */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Hora Extra Diurna SCJ
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="500"
                value={laborConfig.hourlyOvertimeDayRate}
                onChange={(e) => onUpdateLaborConfig({ ...laborConfig, hourlyOvertimeDayRate: parseFloat(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Hora Extra Nocturna */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Hora Extra Nocturna SCJ
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="500"
                value={laborConfig.hourlyOvertimeNightRate}
                onChange={(e) => onUpdateLaborConfig({ ...laborConfig, hourlyOvertimeNightRate: parseFloat(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Prestaciones Sociales (CST)
            </div>

            {/* Prima de Servicios */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Prima de Servicios
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={Math.round(laborConfig.primaServiciosRate * 100)}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, primaServiciosRate: (parseFloat(e.target.value) || 0) / 100 })}
                  className="w-full pl-3 pr-7 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Legal: 8.33% (1 mes por año).
              </span>
            </div>

            {/* Cesantías */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Cesantías
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={Math.round(laborConfig.cesantiasRate * 100)}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, cesantiasRate: (parseFloat(e.target.value) || 0) / 100 })}
                  className="w-full pl-3 pr-7 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Legal: 8.33% (1 mes por año).
              </span>
            </div>

            {/* Intereses sobre Cesantías */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Intereses sobre Cesantías
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={Math.round(laborConfig.interesesCesantiasRate * 100)}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, interesesCesantiasRate: (parseFloat(e.target.value) || 0) / 100 })}
                  className="w-full pl-3 pr-7 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Legal: 1% mensual (12% anual).
              </span>
            </div>

            {/* Vacaciones */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Vacaciones
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={Math.round(laborConfig.vacacionesRate * 100)}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, vacacionesRate: (parseFloat(e.target.value) || 0) / 100 })}
                  className="w-full pl-3 pr-7 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Legal: 4.17% (15 días hábiles por año).
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Parafiscales
            </div>

            {/* Caja de Compensación */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Caja de Compensación Familiar
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={Math.round(laborConfig.cajaCompensacionRate * 100)}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, cajaCompensacionRate: (parseFloat(e.target.value) || 0) / 100 })}
                  className="w-full pl-3 pr-7 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Legal: 4.0%.
              </span>
            </div>

            {/* SENA */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                SENA
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={Math.round(laborConfig.senaRate * 100)}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, senaRate: (parseFloat(e.target.value) || 0) / 100 })}
                  className="w-full pl-3 pr-7 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Legal: 2.0%.
              </span>
            </div>

            {/* ICBF */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                ICBF
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={Math.round(laborConfig.icbfRate * 100)}
                  onChange={(e) => onUpdateLaborConfig({ ...laborConfig, icbfRate: (parseFloat(e.target.value) || 0) / 100 })}
                  className="w-full pl-3 pr-7 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Legal: 3.0%.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulador Interactivo de Horas para Verificar Nómina Real */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-700" />
              Simulador en Vivo de Liquidación Laboral por Viaje
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Prueba cómo impactan las 8 horas ordinarias y las horas extras en el costo de nómina con los valores configurados
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-600 font-medium">Horas de la Ruta:</span>
            <input
              type="range"
              min="4"
              max="28"
              step="1"
              value={testHours}
              onChange={(e) => setTestHours(parseInt(e.target.value))}
              className="w-28 accent-emerald-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-900 w-10 text-right">
              {testHours} h
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center font-mono">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-sans block">Horas Ordinarias (8h)</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">
              {simRegularHours} horas
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              salario ordinario
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-sans block">Horas Extras Totales</span>
            <span className="text-lg font-bold text-amber-700 mt-1 block">
              {simOvertimeHours} horas
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              {simOvertimeDay}h diurnas + {simOvertimeNight}h nocturnas
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-sans block">Costo Conductor Liquidado</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">
              {formatCOP(driverTotal)}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              con prestaciones y parafiscales
            </span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950">
            <span className="text-[11px] text-emerald-800 font-sans font-semibold block">
              Total Tripulación ({laborConfig.hasHelper ? '2 Personas' : '1 Conductor'})
            </span>
            <span className="text-xl font-bold text-emerald-900 mt-1 block">
              {formatCOP(laborConfig.hasHelper ? driverTotal * 1.72 : driverTotal)}
            </span>
            <span className="text-[10px] text-emerald-700 font-sans">
              costo real empresa por viaje
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
