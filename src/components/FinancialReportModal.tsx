import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Truck, 
  CheckCircle2, 
  Filter, 
  Layers,
  ArrowUpRight,
  TrendingDown,
  Building2,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { TripDispatch, RouteCostBreakdown, VehicleProfile, LaborConfig } from '../types/logistics';
import { formatCOP, formatNumber } from '../utils/costCalculator';

export interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatches?: TripDispatch[];
  breakdowns?: RouteCostBreakdown[];
  selectedVehicle?: VehicleProfile;
  laborConfig?: LaborConfig;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const FinancialReportModal: React.FC<FinancialReportModalProps> = ({
  isOpen,
  onClose,
  dispatches = [],
  breakdowns = [],
  selectedVehicle,
  laborConfig
}) => {
  const [periodMode, setPeriodMode] = useState<'month' | 'range' | 'all'>('month');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(new Date().getMonth());
  const [startDate, setStartDate] = useState<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');

  // Filtrado de Despachos y Viajes
  const filteredData = useMemo(() => {
    let list = [...dispatches];

    // Filtro por vehiculo
    if (vehicleFilter !== 'ALL') {
      list = list.filter(d => 
        (d.vehiclePlate && d.vehiclePlate.toUpperCase() === vehicleFilter.toUpperCase()) ||
        (d.vehicleName && d.vehicleName.toUpperCase() === vehicleFilter.toUpperCase())
      );
    }

    // Filtro por periodo
    if (periodMode === 'month') {
      const ym = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, '0')}`;
      list = list.filter(d => {
        const dateStr = d.departureDate || d.createdAt || '';
        return dateStr.startsWith(ym);
      });
    } else if (periodMode === 'range') {
      list = list.filter(d => {
        const dateStr = (d.departureDate || d.createdAt || '').slice(0, 10);
        if (!dateStr) return false;
        return dateStr >= startDate && dateStr <= endDate;
      });
    }

    // Totales calculados
    let totalCobrado = 0;
    let totalCombustible = 0;
    let totalPeajes = 0;
    let totalManoObra = 0;
    let totalMantenimiento = 0;
    let totalImprevistos = 0;
    let totalKmRecorridos = 0;

    list.forEach(d => {
      // Ingresos cobrados (flete cliente)
      const cobrado = Number(d.plannedFreightCOP || 0);
      totalCobrado += cobrado;

      // Gastos reales liquidados
      const fuel = Number(d.actualFuelCostCOP || d.plannedFuelCOP || 0);
      const tolls = Number(d.actualTollCostCOP || d.plannedTollCOP || 0);
      const labor = Number(d.actualLaborCostCOP || d.plannedLaborCOP || 0);
      const maint = Number(d.actualMaintenanceCostCOP || d.plannedMaintenanceCOP || 0);
      const other = Number((d.actualPerDiemCOP || 0) + (d.actualIncidentalCOP || 0));
      const km = Number(d.actualKm || d.plannedKm || 0);

      totalCombustible += fuel;
      totalPeajes += tolls;
      totalManoObra += labor;
      totalMantenimiento += maint;
      totalImprevistos += other;
      totalKmRecorridos += km;
    });

    // Fallback: si no hay despachos en la BD aun para el periodo, usar rutas presupuestadas para mostrar simulacion
    let isFallback = false;
    if (list.length === 0 && breakdowns.length > 0 && periodMode === 'all') {
      isFallback = true;
      breakdowns.forEach(b => {
        const freight = Math.round(b.totalTripCost * 1.25);
        totalCobrado += freight;
        totalCombustible += b.fuelCost;
        totalPeajes += b.tollCost;
        totalManoObra += b.totalLaborCost;
        totalMantenimiento += b.totalMaintenanceCost;
        totalImprevistos += Math.round(b.totalTripCost * 0.03);
        totalKmRecorridos += b.route.km;
      });
    }

    const totalGastado = totalCombustible + totalPeajes + totalManoObra + totalMantenimiento + totalImprevistos;
    const utilidadNeta = totalCobrado - totalGastado;
    const margenPct = totalCobrado > 0 ? (utilidadNeta / totalCobrado) * 100 : 0;
    const costoPorKm = totalKmRecorridos > 0 ? totalGastado / totalKmRecorridos : 0;

    return {
      trips: list,
      count: list.length > 0 ? list.length : (isFallback ? breakdowns.length : 0),
      isFallback,
      totalCobrado,
      totalGastado,
      totalCombustible,
      totalPeajes,
      totalManoObra,
      totalMantenimiento,
      totalImprevistos,
      utilidadNeta,
      margenPct,
      totalKmRecorridos,
      costoPorKm
    };
  }, [dispatches, breakdowns, periodMode, selectedYear, selectedMonthIndex, startDate, endDate, vehicleFilter]);

  if (!isOpen) return null;

  const periodLabel = periodMode === 'month' 
    ? `${MONTH_NAMES[selectedMonthIndex]} ${selectedYear}`
    : periodMode === 'range' 
      ? `Del ${startDate} al ${endDate}` 
      : 'Histórico Completo';

  // Exportar como HTML standalone con gráficos vectoriales SVG e impresión PDF
  const handleDownloadInteractiveHtml = () => {
    const d = filteredData;
    const fuelPct = ((d.totalCombustible / (d.totalGastado || 1)) * 100).toFixed(1);
    const tollPct = ((d.totalPeajes / (d.totalGastado || 1)) * 100).toFixed(1);
    const laborPct = ((d.totalManoObra / (d.totalGastado || 1)) * 100).toFixed(1);
    const maintPct = ((d.totalMantenimiento / (d.totalGastado || 1)) * 100).toFixed(1);
    const otherPct = ((d.totalImprevistos / (d.totalGastado || 1)) * 100).toFixed(1);

    // Cálculos Donut SVG
    const C = 2 * Math.PI * 65;
    const totG = d.totalGastado || 1;
    const pF = d.totalCombustible / totG;
    const pT = d.totalPeajes / totG;
    const pL = d.totalManoObra / totG;
    const pM = d.totalMantenimiento / totG;
    const pO = d.totalImprevistos / totG;

    const offF = 0;
    const offT = pF;
    const offL = pF + pT;
    const offM = pF + pT + pL;
    const offO = pF + pT + pL + pM;

    // Cálculos Barras SVG
    const maxBar = Math.max(d.totalCobrado, d.totalGastado, Math.abs(d.utilidadNeta), 1000);
    const chartH = 130;
    const hCobrado = Math.max(8, Math.round((d.totalCobrado / maxBar) * chartH));
    const hGastado = Math.max(8, Math.round((d.totalGastado / maxBar) * chartH));
    const hUtilidad = Math.max(8, Math.round((Math.max(0, d.utilidadNeta) / maxBar) * chartH));

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>SCJ - Informe Financiero y Control de Operaciones (${periodLabel})</title>
  <style>
    :root {
      --primary: #1E3A8A;
      --navy: #0F172A;
      --emerald: #10B981;
      --red: #EF4444;
      --amber: #F59E0B;
      --blue: #2563EB;
      --purple: #8B5CF6;
      --slate: #64748B;
      --bg: #F8FAFC;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--navy);
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
      background: #FFFFFF;
      padding: 36px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .top-action-bar {
      background: #0F172A;
      color: #FFFFFF;
      padding: 12px 20px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .print-btn {
      background: #2563EB;
      color: #FFFFFF;
      border: none;
      padding: 9px 18px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }
    .print-btn:hover { background: #1D4ED8; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .title h1 {
      margin: 0;
      font-size: 22px;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .title p {
      margin: 4px 0 0;
      font-size: 13px;
      color: var(--slate);
    }
    .meta-badge {
      background: #EFF6FF;
      color: var(--primary);
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 13px;
      border: 1px solid #BFDBFE;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }
    .kpi-card {
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      background: #F8FAFC;
    }
    .kpi-title {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--slate);
      margin-bottom: 4px;
    }
    .kpi-val {
      font-size: 20px;
      font-weight: 900;
      font-family: monospace;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .chart-box {
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 20px;
      background: #FFFFFF;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .chart-title {
      font-size: 13px;
      font-weight: 800;
      color: var(--navy);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      margin-top: 15px;
    }
    th {
      background: #F1F5F9;
      padding: 10px;
      text-align: left;
      font-weight: 700;
      border-bottom: 2px solid #CBD5E1;
      color: #334155;
    }
    td {
      padding: 9px 10px;
      border-bottom: 1px solid #E2E8F0;
    }
    .num { text-align: right; font-family: monospace; font-weight: 700; }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10.5px;
      font-weight: 800;
    }
    .badge-green { background: #DCFCE7; color: #15803D; }
    .badge-amber { background: #FEF3C7; color: #B45309; }
    .badge-red { background: #FEE2E2; color: #B91C1C; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--slate);
    }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .container { box-shadow: none; padding: 15px; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Barra superior de impresión / PDF (se oculta al imprimir) -->
    <div class="top-action-bar no-print">
      <div style="font-size: 13px; font-weight: 600;">
        🏢 <strong>SCJ Transportes</strong> · Informe Financiero con Gráficos Listos para Guardar
      </div>
      <button onclick="window.print()" class="print-btn">
        🖨️ Imprimir / Guardar en PDF
      </button>
    </div>

    <div class="header">
      <div class="title">
        <h1>📊 SCJ TRANSPORTES - INFORME FINANCIERO DE OPERACIONES</h1>
        <p>Consolidado Oficial de Fletes Cobrados, Gastos Reales de Ruta y Rentabilidad Neta</p>
      </div>
      <div class="meta-badge">Período: ${periodLabel}</div>
    </div>

    <!-- TARJETAS DE INDICADORES (KPIS) -->
    <div class="kpi-grid">
      <div class="kpi-card" style="border-left: 4px solid var(--blue);">
        <div class="kpi-title">Fletes Cobrados (Ingresos)</div>
        <div class="kpi-val" style="color: var(--blue);">${formatCOP(d.totalCobrado)}</div>
        <div style="font-size: 11px; color: var(--slate); margin-top: 4px;">${d.count} Viajes Realizados</div>
      </div>
      <div class="kpi-card" style="border-left: 4px solid var(--red);">
        <div class="kpi-title">Gastos Operativos Totales</div>
        <div class="kpi-val" style="color: var(--red);">${formatCOP(d.totalGastado)}</div>
        <div style="font-size: 11px; color: var(--slate); margin-top: 4px;">ACPM, Peajes, Nómina, Mtto</div>
      </div>
      <div class="kpi-card" style="border-left: 4px solid var(--emerald);">
        <div class="kpi-title">Utilidad Neta Real</div>
        <div class="kpi-val" style="color: ${d.utilidadNeta >= 0 ? 'var(--emerald)' : 'var(--red)'};">
          ${formatCOP(d.utilidadNeta)}
        </div>
        <div style="font-size: 11px; color: var(--slate); margin-top: 4px;">
          Margen Operativo: <strong>${d.margenPct.toFixed(1)}%</strong>
        </div>
      </div>
      <div class="kpi-card" style="border-left: 4px solid var(--purple);">
        <div class="kpi-title">Eficiencia Operativa</div>
        <div class="kpi-val" style="color: var(--purple);">${formatCOP(d.costoPorKm)} /km</div>
        <div style="font-size: 11px; color: var(--slate); margin-top: 4px;">${formatNumber(d.totalKmRecorridos, 0)} km Recorridos</div>
      </div>
    </div>

    <!-- GRAFICOS VECTORIALES SVG DE ALTA DEFINICIÓN -->
    <div class="charts-grid">
      
      <!-- GRÁFICO 1: BARRAS COMPARATIVAS INGRESOS VS GASTOS VS UTILIDAD -->
      <div class="chart-box">
        <div class="chart-title">📊 Comparativa: Ingresos vs Costos vs Utilidad Neta</div>
        <svg viewBox="0 0 380 200" style="width: 100%; height: 180px;">
          <line x1="40" y1="30" x2="360" y2="30" stroke="#F1F5F9" stroke-width="1" />
          <line x1="40" y1="75" x2="360" y2="75" stroke="#F1F5F9" stroke-width="1" />
          <line x1="40" y1="120" x2="360" y2="120" stroke="#F1F5F9" stroke-width="1" />
          <line x1="40" y1="160" x2="360" y2="160" stroke="#CBD5E1" stroke-width="1.5" />

          <!-- Barra Ingresos -->
          <rect x="70" y="${160 - hCobrado}" width="55" height="${hCobrado}" fill="#2563EB" rx="6" />
          <text x="97" y="${152 - hCobrado}" text-anchor="middle" font-size="10" font-weight="bold" fill="#2563EB" font-family="monospace">${formatCOP(d.totalCobrado)}</text>
          <text x="97" y="178" text-anchor="middle" font-size="11" font-weight="bold" fill="#0F172A">Ingresos</text>

          <!-- Barra Gastos -->
          <rect x="165" y="${160 - hGastado}" width="55" height="${hGastado}" fill="#EF4444" rx="6" />
          <text x="192" y="${152 - hGastado}" text-anchor="middle" font-size="10" font-weight="bold" fill="#EF4444" font-family="monospace">${formatCOP(d.totalGastado)}</text>
          <text x="192" y="178" text-anchor="middle" font-size="11" font-weight="bold" fill="#0F172A">Costos</text>

          <!-- Barra Utilidad -->
          <rect x="260" y="${160 - hUtilidad}" width="55" height="${hUtilidad}" fill="#10B981" rx="6" />
          <text x="287" y="${152 - hUtilidad}" text-anchor="middle" font-size="10" font-weight="bold" fill="#10B981" font-family="monospace">${formatCOP(d.utilidadNeta)}</text>
          <text x="287" y="178" text-anchor="middle" font-size="11" font-weight="bold" fill="#0F172A">Utilidad Neta</text>
        </svg>
      </div>

      <!-- GRÁFICO 2: DONUT CIRCULAR VECTORIAL CON LEYENDA -->
      <div class="chart-box">
        <div class="chart-title">🍩 Distribución Porcentual de Rubros de Costo</div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
          
          <!-- SVG Donut -->
          <svg viewBox="0 0 200 200" width="165" height="165" style="display:block; shrink-0;">
            <circle cx="100" cy="100" r="65" fill="transparent" stroke="#2563EB" stroke-width="26" stroke-dasharray="${(pF * C).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-offF * C).toFixed(2)}" transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="65" fill="transparent" stroke="#F59E0B" stroke-width="26" stroke-dasharray="${(pT * C).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-offT * C).toFixed(2)}" transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="65" fill="transparent" stroke="#8B5CF6" stroke-width="26" stroke-dasharray="${(pL * C).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-offL * C).toFixed(2)}" transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="65" fill="transparent" stroke="#10B981" stroke-width="26" stroke-dasharray="${(pM * C).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-offM * C).toFixed(2)}" transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="65" fill="transparent" stroke="#64748B" stroke-width="26" stroke-dasharray="${(pO * C).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-offO * C).toFixed(2)}" transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="48" fill="#FFFFFF" />
            <text x="100" y="93" text-anchor="middle" font-size="10" font-weight="bold" fill="#64748B">TOTAL GASTOS</text>
            <text x="100" y="112" text-anchor="middle" font-size="12" font-weight="900" fill="#0F172A">${formatCOP(d.totalGastado)}</text>
          </svg>

          <!-- Leyenda -->
          <div style="font-size: 11px; flex: 1; space-y: 6px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span style="color:#2563EB; font-weight:bold;">● ACPM (${fuelPct}%):</span> <strong>${formatCOP(d.totalCombustible)}</strong></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span style="color:#F59E0B; font-weight:bold;">● Peajes (${tollPct}%):</span> <strong>${formatCOP(d.totalPeajes)}</strong></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span style="color:#8B5CF6; font-weight:bold;">● Mano Obra (${laborPct}%):</span> <strong>${formatCOP(d.totalManoObra)}</strong></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span style="color:#10B981; font-weight:bold;">● Mtto (${maintPct}%):</span> <strong>${formatCOP(d.totalMantenimiento)}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:#64748B; font-weight:bold;">● Imprevistos (${otherPct}%):</span> <strong>${formatCOP(d.totalImprevistos)}</strong></div>
          </div>

        </div>
      </div>

    </div>

    <!-- TABLA DE DESPACHOS DETALLADA CON BADGES Y BARRAS -->
    <div style="margin-top: 25px;">
      <h3 style="font-size: 14px; margin-bottom: 8px; color:#0F172A; display:flex; justify-content:space-between; align-items:center;">
        <span>Detalle Individual de Despachos & Liquidación</span>
        <span style="font-size: 12px; font-weight: normal; color:#64748B;">${d.count} Registros Procesados</span>
      </h3>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Vehículo</th>
            <th>Conductor / Ruta</th>
            <th class="num">Flete Cobrado</th>
            <th class="num">Costo Operativo</th>
            <th class="num">Utilidad Neta</th>
            <th style="text-align:center;">Rentabilidad</th>
          </tr>
        </thead>
        <tbody>
          ${d.trips.length > 0 ? d.trips.map(t => {
            const cobrado = Number(t.plannedFreightCOP || 0);
            const gastado = Number(t.actualTotalCostCOP || t.plannedTotalCostCOP || 0);
            const ut = cobrado - gastado;
            const mg = cobrado > 0 ? (ut / cobrado) * 100 : 0;
            const badgeClass = mg >= 30 ? 'badge-green' : mg >= 15 ? 'badge-amber' : 'badge-red';
            const badgeText = mg >= 30 ? 'Alta' : mg >= 15 ? 'Normal' : 'Ajustada';

            return `<tr>
              <td>${t.departureDate || (t.createdAt ? t.createdAt.slice(0, 10) : 'N/A')}</td>
              <td><strong>${t.vehiclePlate || 'NPR'}</strong></td>
              <td>${t.driverName || 'Titular'} - ${t.routeName || 'Ruta General'}</td>
              <td class="num" style="color:var(--blue);">${formatCOP(cobrado)}</td>
              <td class="num" style="color:var(--red);">${formatCOP(gastado)}</td>
              <td class="num" style="color:${ut >= 0 ? 'var(--emerald)' : 'var(--red)'};">${formatCOP(ut)}</td>
              <td style="text-align:center;">
                <span class="badge ${badgeClass}">${mg.toFixed(1)}% (${badgeText})</span>
              </td>
            </tr>`;
          }).join('') : '<tr><td colspan="7" style="text-align:center; padding:15px; color:#94A3B8;">No se registraron viajes con liquidación en este rango.</td></tr>'}
        </tbody>
        <tfoot>
          <tr style="background:#F1F5F9; font-weight:bold; border-top:2px solid #CBD5E1;">
            <td colspan="3" style="text-align:right;">TOTALES CONSOLIDADOS:</td>
            <td class="num" style="color:var(--blue); font-size:13px;">${formatCOP(d.totalCobrado)}</td>
            <td class="num" style="color:var(--red); font-size:13px;">${formatCOP(d.totalGastado)}</td>
            <td class="num" style="color:${d.utilidadNeta >= 0 ? 'var(--emerald)' : 'var(--red)'}; font-size:13px;">${formatCOP(d.utilidadNeta)}</td>
            <td style="text-align:center;">
              <span class="badge badge-green" style="font-size:11px;">${d.margenPct.toFixed(1)}% Promedio</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="footer">
      <div>🏢 SCJ Transportes S.A.S. | Software de Control de Operaciones y Flota</div>
      <div>Emisión de Auditoría: ${new Date().toLocaleString('es-CO')}</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SCJ_Informe_Financiero_${periodLabel.replace(/\s+/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Descargar Excel Profesional  // Descargar Excel Profesional con Estilos (.XLS)
  const handleExportExcel = () => {
    const d = filteredData;
    const formatNum = (n: number) => Math.round(Number(n) || 0);

    const excelHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:x="urn:schemas-microsoft-com:office:excel"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="application/vnd.ms-excel; charset=UTF-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>Informe Financiero SCJ</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; color: #0F172A; }
  table { border-collapse: collapse; margin-bottom: 20px; width: 100%; }
  th { background-color: #1E40AF; color: #FFFFFF; font-weight: bold; font-size: 11pt; text-align: center; border: 1px solid #1E3A8A; padding: 10px; }
  td { border: 1px solid #CBD5E1; padding: 8px 10px; font-size: 10.5pt; vertical-align: middle; }
  .title { font-size: 16pt; font-weight: bold; color: #1E3A8A; text-align: left; }
  .subtitle { font-size: 10pt; color: #64748B; font-style: italic; }
  .kpi-header { background-color: #0F172A; color: #FFFFFF; font-weight: bold; font-size: 11pt; padding: 8px; }
  .kpi-label { background-color: #F1F5F9; border: 1px solid #CBD5E1; font-weight: bold; color: #334155; }
  .kpi-val { font-size: 11.5pt; font-weight: bold; color: #0F172A; text-align: right; mso-number-format: "\\$#,##0"; }
  .curr { mso-number-format: "\\$#,##0"; text-align: right; }
  .pct { mso-number-format: "0\\.0%"; text-align: right; }
  .center { text-align: center; }
  .total-row { background-color: #DBEAFE; font-weight: bold; color: #1E3A8A; border-top: 2px solid #1E40AF; }
  .total-row td { font-weight: bold; font-size: 11pt; }
  .zebra { background-color: #F8FAFC; }
</style>
</head>
<body>
  <table>
    <tr>
      <td colspan="13" class="title">SCJ TRANSPORTES S.A.S. - INFORME FINANCIERO Y CONTROL DE COSTOS</td>
    </tr>
    <tr>
      <td colspan="13" class="subtitle">Período: ${periodLabel} | Generado: ${new Date().toLocaleString('es-CO')} | Moneda: COP (Pesos Colombianos)</td>
    </tr>
    <tr><td colspan="13" style="height: 10px; border:none;"></td></tr>
  </table>

  <!-- RESUMEN EJECUTIVO (KPIs) -->
  <table>
    <tr>
      <th colspan="4" class="kpi-header">RESUMEN EJECUTIVO DE INDICADORES (KPIs)</th>
    </tr>
    <tr>
      <td class="kpi-label" style="width: 250px;">Total Fletes Cobrados (Ingresos):</td>
      <td class="kpi-val" style="width: 180px;">${formatNum(d.totalCobrado)}</td>
      <td class="kpi-label" style="width: 250px;">Total Gastos Operativos:</td>
      <td class="kpi-val" style="width: 180px;">${formatNum(d.totalGastado)}</td>
    </tr>
    <tr>
      <td class="kpi-label">Utilidad Neta Real:</td>
      <td class="kpi-val" style="color: #059669;">${formatNum(d.utilidadNeta)}</td>
      <td class="kpi-label">Margen de Rentabilidad Operativa:</td>
      <td class="pct" style="font-weight: bold; color: #059669;">${(d.totalCobrado > 0 ? d.utilidadNeta / d.totalCobrado : 0).toFixed(4)}</td>
    </tr>
    <tr>
      <td class="kpi-label">Combustible ACPM Total:</td>
      <td class="kpi-val">${formatNum(d.totalCombustible)}</td>
      <td class="kpi-label">Peajes en Carretera:</td>
      <td class="kpi-val">${formatNum(d.totalPeajes)}</td>
    </tr>
    <tr>
      <td class="kpi-label">Mano de Obra (Conductores/Auxiliares):</td>
      <td class="kpi-val">${formatNum(d.totalManoObra)}</td>
      <td class="kpi-label">Mantenimiento Estimado SICE-TAC:</td>
      <td class="kpi-val">${formatNum(d.totalMantenimiento)}</td>
    </tr>
    <tr>
      <td class="kpi-label">Viáticos e Imprevistos:</td>
      <td class="kpi-val">${formatNum(d.totalImprevistos)}</td>
      <td class="kpi-label">Despachos Liquidados:</td>
      <td class="center" style="font-weight: bold;">${d.count}</td>
    </tr>
  </table>

  <br/>

  <!-- ANÁLISIS GRÁFICO VISUAL DE COMPOSICIÓN DE GASTOS -->
  <table>
    <tr>
      <th colspan="4" style="background-color: #0F172A; color: #FFFFFF; font-weight: bold; font-size: 11pt; padding: 8px;">
        ANÁLISIS GRÁFICO: DISTRIBUCIÓN PORCENTUAL DE GASTOS
      </th>
    </tr>
    <tr>
      <td style="width: 250px; font-weight: bold; background-color: #EFF6FF; border: 1px solid #CBD5E1;">
        Combustible ACPM (${((d.totalCombustible / (d.totalGastado || 1)) * 100).toFixed(1)}%):
      </td>
      <td style="width: 140px; text-align: right; font-weight: bold; mso-number-format: '\\$#,##0'; border: 1px solid #CBD5E1;">
        ${formatNum(d.totalCombustible)}
      </td>
      <td colspan="2" style="background-color: #FFFFFF; border: 1px solid #CBD5E1; padding: 4px;">
        <div style="background-color: #2563EB; height: 16px; width: ${Math.max(2, Math.min(100, Math.round((d.totalCombustible / (d.totalGastado || 1)) * 100)))}%; border-radius: 3px; color: #FFFFFF; font-size: 9pt; font-weight: bold; text-align: right; padding-right: 4px;">
          ${((d.totalCombustible / (d.totalGastado || 1)) * 100).toFixed(1)}%
        </div>
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #FFFBEB; border: 1px solid #CBD5E1;">
        Peajes en Carretera (${((d.totalPeajes / (d.totalGastado || 1)) * 100).toFixed(1)}%):
      </td>
      <td style="text-align: right; font-weight: bold; mso-number-format: '\\$#,##0'; border: 1px solid #CBD5E1;">
        ${formatNum(d.totalPeajes)}
      </td>
      <td colspan="2" style="background-color: #FFFFFF; border: 1px solid #CBD5E1; padding: 4px;">
        <div style="background-color: #F59E0B; height: 16px; width: ${Math.max(2, Math.min(100, Math.round((d.totalPeajes / (d.totalGastado || 1)) * 100)))}%; border-radius: 3px; color: #FFFFFF; font-size: 9pt; font-weight: bold; text-align: right; padding-right: 4px;">
          ${((d.totalPeajes / (d.totalGastado || 1)) * 100).toFixed(1)}%
        </div>
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #FAF5FF; border: 1px solid #CBD5E1;">
        Mano de Obra / Nómina (${((d.totalManoObra / (d.totalGastado || 1)) * 100).toFixed(1)}%):
      </td>
      <td style="text-align: right; font-weight: bold; mso-number-format: '\\$#,##0'; border: 1px solid #CBD5E1;">
        ${formatNum(d.totalManoObra)}
      </td>
      <td colspan="2" style="background-color: #FFFFFF; border: 1px solid #CBD5E1; padding: 4px;">
        <div style="background-color: #8B5CF6; height: 16px; width: ${Math.max(2, Math.min(100, Math.round((d.totalManoObra / (d.totalGastado || 1)) * 100)))}%; border-radius: 3px; color: #FFFFFF; font-size: 9pt; font-weight: bold; text-align: right; padding-right: 4px;">
          ${((d.totalManoObra / (d.totalGastado || 1)) * 100).toFixed(1)}%
        </div>
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #F0FDF4; border: 1px solid #CBD5E1;">
        Mantenimiento SICE-TAC (${((d.totalMantenimiento / (d.totalGastado || 1)) * 100).toFixed(1)}%):
      </td>
      <td style="text-align: right; font-weight: bold; mso-number-format: '\\$#,##0'; border: 1px solid #CBD5E1;">
        ${formatNum(d.totalMantenimiento)}
      </td>
      <td colspan="2" style="background-color: #FFFFFF; border: 1px solid #CBD5E1; padding: 4px;">
        <div style="background-color: #10B981; height: 16px; width: ${Math.max(2, Math.min(100, Math.round((d.totalMantenimiento / (d.totalGastado || 1)) * 100)))}%; border-radius: 3px; color: #FFFFFF; font-size: 9pt; font-weight: bold; text-align: right; padding-right: 4px;">
          ${((d.totalMantenimiento / (d.totalGastado || 1)) * 100).toFixed(1)}%
        </div>
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #F8FAFC; border: 1px solid #CBD5E1;">
        Viáticos e Imprevistos (${((d.totalImprevistos / (d.totalGastado || 1)) * 100).toFixed(1)}%):
      </td>
      <td style="text-align: right; font-weight: bold; mso-number-format: '\\$#,##0'; border: 1px solid #CBD5E1;">
        ${formatNum(d.totalImprevistos)}
      </td>
      <td colspan="2" style="background-color: #FFFFFF; border: 1px solid #CBD5E1; padding: 4px;">
        <div style="background-color: #64748B; height: 16px; width: ${Math.max(2, Math.min(100, Math.round((d.totalImprevistos / (d.totalGastado || 1)) * 100)))}%; border-radius: 3px; color: #FFFFFF; font-size: 9pt; font-weight: bold; text-align: right; padding-right: 4px;">
          ${((d.totalImprevistos / (d.totalGastado || 1)) * 100).toFixed(1)}%
        </div>
      </td>
    </tr>
  </table>

  <br/>

  <!-- TABLA DE DESPACHOS DETALLADA -->
  <table>
    <thead>
      <tr>
        <th style="width:100px;">Fecha</th>
        <th style="width:90px;">Vehículo</th>
        <th style="width:170px;">Conductor Titular</th>
        <th style="width:230px;">Ruta Oficial</th>
        <th style="width:120px;">Flete Cobrado</th>
        <th style="width:110px;">Combustible ACPM</th>
        <th style="width:100px;">Peajes</th>
        <th style="width:120px;">Mano de Obra</th>
        <th style="width:120px;">Mantenimiento</th>
        <th style="width:110px;">Viáticos / Imprev.</th>
        <th style="width:120px;">Gasto Total</th>
        <th style="width:120px;">Utilidad Neta</th>
        <th style="width:90px;">Margen %</th>
      </tr>
    </thead>
    <tbody>
      ${d.trips.map((t, idx) => {
        const cobrado = formatNum(t.plannedFreightCOP || 0);
        const fuel = formatNum(t.actualFuelCostCOP || t.plannedFuelCOP || 0);
        const tolls = formatNum(t.actualTollCostCOP || t.plannedTollCOP || 0);
        const labor = formatNum(t.actualLaborCostCOP || t.plannedLaborCOP || 0);
        const maint = formatNum(t.actualMaintenanceCostCOP || t.plannedMaintenanceCOP || 0);
        const other = formatNum((t.actualPerDiemCOP || 0) + (t.actualIncidentalCOP || 0));
        const gastado = formatNum(t.actualTotalCostCOP || t.plannedTotalCostCOP || (fuel + tolls + labor + maint + other));
        const ut = cobrado - gastado;
        const mg = cobrado > 0 ? (ut / cobrado) : 0;
        const fecha = t.departureDate || (t.createdAt ? t.createdAt.slice(0, 10) : 'N/A');
        const rowClass = idx % 2 === 1 ? 'zebra' : '';

        return `<tr class="${rowClass}">
          <td class="center">${fecha}</td>
          <td class="center"><strong>${t.vehiclePlate || 'NPR'}</strong></td>
          <td>${t.driverName || 'Titular'}</td>
          <td>${t.routeName || 'Ruta General'}</td>
          <td class="curr">${cobrado}</td>
          <td class="curr">${fuel}</td>
          <td class="curr">${tolls}</td>
          <td class="curr">${labor}</td>
          <td class="curr">${maint}</td>
          <td class="curr">${other}</td>
          <td class="curr">${gastado}</td>
          <td class="curr" style="color: ${ut >= 0 ? '#059669' : '#DC2626'}; font-weight: bold;">${ut}</td>
          <td class="pct">${mg.toFixed(4)}</td>
        </tr>`;
      }).join('')}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="4" style="text-align: right;">TOTALES CONSOLIDADOS:</td>
        <td class="curr">${formatNum(d.totalCobrado)}</td>
        <td class="curr">${formatNum(d.totalCombustible)}</td>
        <td class="curr">${formatNum(d.totalPeajes)}</td>
        <td class="curr">${formatNum(d.totalManoObra)}</td>
        <td class="curr">${formatNum(d.totalMantenimiento)}</td>
        <td class="curr">${formatNum(d.totalImprevistos)}</td>
        <td class="curr">${formatNum(d.totalGastado)}</td>
        <td class="curr" style="color: ${d.utilidadNeta >= 0 ? '#059669' : '#DC2626'}; font-weight: bold;">${formatNum(d.utilidadNeta)}</td>
        <td class="pct">${(d.totalCobrado > 0 ? d.utilidadNeta / d.totalCobrado : 0).toFixed(4)}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;

    const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SCJ_Informe_Financiero_${periodLabel.replace(/\s+/g, '_')}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Exportar a CSV (Compatible 100% con Excel en Español / Windows con punto y coma)
  const handleExportCSV = () => {
    const d = filteredData;
    const formatNum = (n: number) => Math.round(Number(n) || 0);

    // Encabezado con BOM UTF-8 y directiva sep=; para que Excel divida automáticamente las columnas
    let csv = '\uFEFFsep=;\r\n';
    csv += 'Fecha;Vehiculo;Conductor;Ruta;Flete Cobrado COP;Combustible ACPM COP;Peajes COP;Mano Obra COP;Mantenimiento COP;Viaticos e Imprevistos COP;Gasto Operativo Total COP;Utilidad Neta COP;Margen %\r\n';

    d.trips.forEach(t => {
      const cobrado = formatNum(t.plannedFreightCOP || 0);
      const fuel = formatNum(t.actualFuelCostCOP || t.plannedFuelCOP || 0);
      const tolls = formatNum(t.actualTollCostCOP || t.plannedTollCOP || 0);
      const labor = formatNum(t.actualLaborCostCOP || t.plannedLaborCOP || 0);
      const maint = formatNum(t.actualMaintenanceCostCOP || t.plannedMaintenanceCOP || 0);
      const other = formatNum((t.actualPerDiemCOP || 0) + (t.actualIncidentalCOP || 0));
      const gastado = formatNum(t.actualTotalCostCOP || t.plannedTotalCostCOP || (fuel + tolls + labor + maint + other));
      const ut = cobrado - gastado;
      const mg = cobrado > 0 ? ((ut / cobrado) * 100).toFixed(1) : '0.0';
      const dateVal = t.departureDate || (t.createdAt ? t.createdAt.slice(0, 10) : '');

      csv += `"${dateVal}";"${t.vehiclePlate || ''}";"${t.driverName || ''}";"${t.routeName || ''}";${cobrado};${fuel};${tolls};${labor};${maint};${other};${gastado};${ut};${mg}%\r\n`;
    });

    // Fila de totales
    const totMg = d.totalCobrado > 0 ? ((d.utilidadNeta / d.totalCobrado) * 100).toFixed(1) : '0.0';
    csv += `"TOTALES";"";"";"";${formatNum(d.totalCobrado)};${formatNum(d.totalCombustible)};${formatNum(d.totalPeajes)};${formatNum(d.totalManoObra)};${formatNum(d.totalMantenimiento)};${formatNum(d.totalImprevistos)};${formatNum(d.totalGastado)};${formatNum(d.utilidadNeta)};${totMg}%\r\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SCJ_Datos_Financieros_${periodLabel.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const d = filteredData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Encabezado Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Descargar Informe Financiero SCJ
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black rounded-full uppercase">
                  Con Gráficos & Indicadores
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Balance consolidado de fletes cobrados, gastos de ruta y margen neto de ganancia
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros de Período y Flota */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 shrink-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Modalidad de Período */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => setPeriodMode('month')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  periodMode === 'month' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Mes Específico
              </button>
              <button
                type="button"
                onClick={() => setPeriodMode('range')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  periodMode === 'range' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rango de Fechas
              </button>
              <button
                type="button"
                onClick={() => setPeriodMode('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  periodMode === 'all' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Histórico Completo
              </button>
            </div>

            {/* Selector dinámico según modo */}
            {periodMode === 'month' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonthIndex}
                  onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-600"
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i}>{name}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-600"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            )}

            {periodMode === 'range' && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span>Desde:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg shadow-2xs font-mono"
                />
                <span>Hasta:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg shadow-2xs font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Contenido con Scroll: Indicadores y Gráficos */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-900">
          
          {/* Indicadores Principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Fletes Cobrados (Ingresos)</span>
              <span className="text-base font-black text-blue-950 block">{formatCOP(d.totalCobrado)}</span>
              <span className="text-[11px] text-blue-600 block mt-0.5">{d.count} Viajes Registrados</span>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Total Gastos Operativos</span>
              <span className="text-base font-black text-rose-950 block">{formatCOP(d.totalGastado)}</span>
              <span className="text-[11px] text-rose-600 block mt-0.5">Ruta, ACPM, Peajes, Nómina</span>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Utilidad Neta Real</span>
              <span className={`text-base font-black block ${d.utilidadNeta >= 0 ? 'text-emerald-950' : 'text-rose-950'}`}>
                {formatCOP(d.utilidadNeta)}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                Margen: {d.margenPct.toFixed(1)}%
              </span>
            </div>

            <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Costo Promedio / Km</span>
              <span className="text-base font-black text-purple-950 block">{formatCOP(d.costoPorKm)} /km</span>
              <span className="text-[11px] text-purple-600 block mt-0.5">{formatNumber(d.totalKmRecorridos, 0)} km Recorridos</span>
            </div>
          </div>

          {/* Gráficos en Vivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Gráfico 1: Barras Comparativas Vectoriales */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Ingresos vs Costos vs Utilidad</span>
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${d.margenPct >= 25 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                  Margen: {d.margenPct.toFixed(1)}%
                </span>
              </h4>

              {/* Render de barras estilizadas con valores */}
              <div className="py-2">
                <svg viewBox="0 0 320 150" className="w-full h-36">
                  <line x1="30" y1="120" x2="310" y2="120" stroke="#E2E8F0" strokeWidth="1.5" />
                  {(() => {
                    const maxV = Math.max(d.totalCobrado, d.totalGastado, Math.abs(d.utilidadNeta), 1000);
                    const hC = Math.max(8, Math.round((d.totalCobrado / maxV) * 95));
                    const hG = Math.max(8, Math.round((d.totalGastado / maxV) * 95));
                    const hU = Math.max(8, Math.round((Math.max(0, d.utilidadNeta) / maxV) * 95));
                    return (
                      <>
                        <rect x="55" y={120 - hC} width="45" height={hC} fill="#2563EB" rx="4" />
                        <text x="77" y={114 - hC} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#2563EB">{formatCOP(d.totalCobrado)}</text>
                        <text x="77" y="136" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0F172A">Ingresos</text>

                        <rect x="135" y={120 - hG} width="45" height={hG} fill="#EF4444" rx="4" />
                        <text x="157" y={114 - hG} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#EF4444">{formatCOP(d.totalGastado)}</text>
                        <text x="157" y="136" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0F172A">Costos</text>

                        <rect x="215" y={120 - hU} width="45" height={hU} fill="#10B981" rx="4" />
                        <text x="237" y={114 - hU} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#10B981">{formatCOP(d.utilidadNeta)}</text>
                        <text x="237" y="136" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0F172A">Utilidad</text>
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Gráfico 2: Donut Circular de Costos Operativos */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-600" />
                  <span>Composición de Gastos Operativos</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Total: {formatCOP(d.totalGastado)}
                </span>
              </h4>

              <div className="flex items-center justify-between gap-3 py-1">
                {/* Donut SVG circular */}
                {(() => {
                  const C = 2 * Math.PI * 52;
                  const totG = d.totalGastado || 1;
                  const pF = d.totalCombustible / totG;
                  const pT = d.totalPeajes / totG;
                  const pL = d.totalManoObra / totG;
                  const pM = d.totalMantenimiento / totG;
                  const pO = d.totalImprevistos / totG;
                  const offF = 0;
                  const offT = pF;
                  const offL = pF + pT;
                  const offM = pF + pT + pL;
                  const offO = pF + pT + pL + pM;

                  return (
                    <svg viewBox="0 0 140 140" className="w-32 h-32 shrink-0">
                      <circle cx="70" cy="70" r="52" fill="transparent" stroke="#2563EB" strokeWidth="20" strokeDasharray={`${(pF * C).toFixed(2)} ${C.toFixed(2)}`} strokeDashoffset={`${(-offF * C).toFixed(2)}`} transform="rotate(-90 70 70)"/>
                      <circle cx="70" cy="70" r="52" fill="transparent" stroke="#F59E0B" strokeWidth="20" strokeDasharray={`${(pT * C).toFixed(2)} ${C.toFixed(2)}`} strokeDashoffset={`${(-offT * C).toFixed(2)}`} transform="rotate(-90 70 70)"/>
                      <circle cx="70" cy="70" r="52" fill="transparent" stroke="#8B5CF6" strokeWidth="20" strokeDasharray={`${(pL * C).toFixed(2)} ${C.toFixed(2)}`} strokeDashoffset={`${(-offL * C).toFixed(2)}`} transform="rotate(-90 70 70)"/>
                      <circle cx="70" cy="70" r="52" fill="transparent" stroke="#10B981" strokeWidth="20" strokeDasharray={`${(pM * C).toFixed(2)} ${C.toFixed(2)}`} strokeDashoffset={`${(-offM * C).toFixed(2)}`} transform="rotate(-90 70 70)"/>
                      <circle cx="70" cy="70" r="52" fill="transparent" stroke="#64748B" strokeWidth="20" strokeDasharray={`${(pO * C).toFixed(2)} ${C.toFixed(2)}`} strokeDashoffset={`${(-offO * C).toFixed(2)}`} transform="rotate(-90 70 70)"/>
                      <circle cx="70" cy="70" r="38" fill="#FFFFFF" />
                      <text x="70" y="66" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748B">COSTOS</text>
                      <text x="70" y="79" textAnchor="middle" fontSize="9" fontWeight="900" fill="#0F172A">100%</text>
                    </svg>
                  );
                })()}

                {/* Desglose de Leyendas */}
                <div className="space-y-1.5 text-xs flex-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-blue-700 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"/> ACPM:
                    </span>
                    <span className="font-mono font-bold">{formatCOP(d.totalCombustible)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-700 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/> Peajes:
                    </span>
                    <span className="font-mono font-bold">{formatCOP(d.totalPeajes)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-purple-700 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600 inline-block"/> Nómina / Viáticos:
                    </span>
                    <span className="font-mono font-bold">{formatCOP(d.totalManoObra)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"/> Mantenimiento:
                    </span>
                    <span className="font-mono font-bold">{formatCOP(d.totalMantenimiento)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"/> Imprevistos:
                    </span>
                    <span className="font-mono font-bold">{formatCOP(d.totalImprevistos)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Acciones de Descarga */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Período seleccionado: <strong>{periodLabel}</strong> ({d.count} despachos)
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Botón 1: Informe Gráfico Completo .HTML */}
            <button
              type="button"
              onClick={handleDownloadInteractiveHtml}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Descargar informe ejecutivo con gráficos Donut y Barras en alta definición, listo para guardar en PDF"
            >
              <BarChart3 className="w-4 h-4 text-blue-200" />
              <span>Informe con Gráficos (.HTML / PDF)</span>
            </button>

            {/* Botón 2: Excel Profesional con Formato y Barras */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Descargar libro Excel corporativo con formato contable, colores y análisis gráfico de costos"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>Descargar Excel (.XLS)</span>
            </button>

            {/* Botón 3: CSV Separado por Punto y Coma */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Descargar archivo CSV dividido en 13 columnas con punto y coma para Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV Separado</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
