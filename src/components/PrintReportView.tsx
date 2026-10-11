import React from 'react';
import { RouteCostBreakdown, VehicleProfile, LaborConfig } from '../types/logistics';
import { formatCOP, formatNumber } from '../utils/costCalculator';

interface PrintReportViewProps {
  breakdowns: RouteCostBreakdown[];
  selectedVehicle: VehicleProfile;
  laborConfig: LaborConfig;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  breakdowns,
  selectedVehicle,
  laborConfig
}) => {
  const totalKm = breakdowns.reduce((acc, b) => acc + b.route.km, 0);
  const totalTripCostSum = breakdowns.reduce((acc, b) => acc + b.totalTripCost, 0);
  const avgCostPerKm = totalKm > 0 ? totalTripCostSum / totalKm : 0;

  return (
    <div className="print-only hidden p-8 bg-white text-black font-sans">
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">
            SCJ · Informe Oficial de Liquidación de Costos de Transporte y Reparto
          </h1>
          <p className="text-xs text-gray-700 mt-1">
            Bases Técnicas SICE-TAC MinTransporte Colombia & Código Sustantivo del Trabajo (CST)
          </p>
        </div>
        <div className="text-right text-xs">
          <div>Fecha: {new Date().toLocaleDateString('es-CO')}</div>
          <div>Vehículo: {selectedVehicle.name}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 p-4 border border-gray-300 rounded mb-6 text-xs">
        <div>
          <span className="text-gray-500 block">Total Rutas Auditadas</span>
          <strong className="text-base">{breakdowns.length}</strong>
        </div>
        <div>
          <span className="text-gray-500 block">Kilometraje Red Total</span>
          <strong className="text-base">{formatNumber(totalKm, 0)} km</strong>
        </div>
        <div>
          <span className="text-gray-500 block">Costo Medio / Km (CPK)</span>
          <strong className="text-base">{formatCOP(avgCostPerKm)}</strong>
        </div>
        <div>
          <span className="text-gray-500 block">Inversión Red Completa</span>
          <strong className="text-base">{formatCOP(totalTripCostSum)}</strong>
        </div>
      </div>

      <table className="w-full text-[10px] text-left border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-400 font-bold">
            <th className="p-1.5 border border-gray-300">ID</th>
            <th className="p-1.5 border border-gray-300">Ruta / Corredor</th>
            <th className="p-1.5 border border-gray-300 text-right">Km</th>
            <th className="p-1.5 border border-gray-300 text-right">Horas</th>
            <th className="p-1.5 border border-gray-300 text-right">Peajes</th>
            <th className="p-1.5 border border-gray-300 text-right">Personal</th>
            <th className="p-1.5 border border-gray-300 text-right">Combustible</th>
            <th className="p-1.5 border border-gray-300 text-right">Mantenim.+Llantas</th>
            <th className="p-1.5 border border-gray-300 text-right">Costo Total</th>
            <th className="p-1.5 border border-gray-300 text-right">CPK</th>
            <th className="p-1.5 border border-gray-300 text-right">Tarifa +20%</th>
          </tr>
        </thead>
        <tbody>
          {breakdowns.map((b) => (
            <tr key={b.route.id} className="border-b border-gray-200">
              <td className="p-1.5 border border-gray-300 font-mono font-bold">{b.route.id}</td>
              <td className="p-1.5 border border-gray-300 font-semibold">{b.route.name}</td>
              <td className="p-1.5 border border-gray-300 text-right font-mono">{b.route.km}</td>
              <td className="p-1.5 border border-gray-300 text-right font-mono">{b.totalHours.toFixed(1)}</td>
              <td className="p-1.5 border border-gray-300 text-right font-mono">{formatCOP(b.tollCost)}</td>
              <td className="p-1.5 border border-gray-300 text-right font-mono">{formatCOP(b.totalLaborCost)}</td>
              <td className="p-1.5 border border-gray-300 text-right font-mono">{formatCOP(b.fuelCost)}</td>
              <td className="p-1.5 border border-gray-300 text-right font-mono">{formatCOP(b.oilCost + b.tiresCost + b.preventiveMaintenanceCost)}</td>
              <td className="p-1.5 border border-gray-300 text-right font-mono font-bold">{formatCOP(b.totalTripCost)}</td>
              <td className="p-1.5 border border-gray-300 text-right font-mono">{formatCOP(b.costPerKm)}</td>
              <td className="p-1.5 border border-gray-300 text-right font-mono font-bold">{formatCOP(b.suggestedFreightTariff(20))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 pt-4 border-t border-gray-300 text-[10px] text-gray-500 flex justify-between">
        <span>SCJ · Sistema de Control de Flota y Reparto</span>
        <span>Aprobado por Dirección de Operaciones & Finanzas SCJ</span>
      </div>
    </div>
  );
};
