import React, { useState } from 'react';
import { DeliveryRoute } from '../types/logistics';
import { X, UploadCloud, FileText, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface ImportDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRoutes: (routes: DeliveryRoute[]) => void;
}

export const ImportDatabaseModal: React.FC<ImportDatabaseModalProps> = ({
  isOpen,
  onClose,
  onImportRoutes
}) => {
  const [pastedText, setPastedText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const parseData = (raw: string): DeliveryRoute[] => {
    const lines = raw.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) throw new Error("El texto está vacío.");

    // Detect separator: comma, semicolon, tab, pipe
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';
    else if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes('|')) delimiter = '|';

    // Helper to parse line with possible quoted commas
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result.map(s => s.replace(/^"|"$/g, '').trim());
    };

    const header = parseLine(lines[0]).map(h => h.toUpperCase().replace(/\s+/g, '_'));
    const isHeaderRow = header.some(h => 
      h.includes('RUTA') || h.includes('KM') || h.includes('HORA') || h.includes('ID') || h.includes('NOMBRE')
    );

    const dataLines = isHeaderRow ? lines.slice(1) : lines;

    const findColIdx = (aliases: string[]): number => {
      if (!isHeaderRow) return -1;
      return header.findIndex(h => aliases.some(alias => h.includes(alias)));
    };

    const idIdx = findColIdx(['ID_RUTA', 'ID', 'CODIGO']);
    const nameIdx = findColIdx(['NOMBRE_RUTA', 'NOMBRE', 'RUTA', 'DESTINO', 'TRAYECTO']);
    const kmIdx = findColIdx(['KM_POR_ZONA', 'KM', 'KILOMETROS', 'DISTANCIA']);
    const hoursIdx = findColIdx(['HORAS_ESTIMADAS_RUTA', 'HORAS_ESTIMADAS', 'HORAS', 'TIEMPO']);
    const storesIdx = findColIdx(['LOCALES_RELACIONADOS_ID', 'LOCALES', 'STORES', 'PARADAS', 'PUNTOS']);
    const loadingIdx = findColIdx(['TIEMPO_MUERTO_CARGUE_MINS', 'TIEMPO_MUERTO', 'CARGUE', 'MINUTOS_CARGUE']);
    const tollsIdx = findColIdx(['PEAJE', 'PEAJES', 'TOLL', 'VALOR_PEAJE']);
    const zoneIdx = findColIdx(['ZONA', 'REGION', 'DEPARTAMENTO']);

    const routes: DeliveryRoute[] = [];

    dataLines.forEach((line, idx) => {
      const cols = parseLine(line);
      if (cols.length < 2) return;

      const id = idIdx >= 0 && cols[idIdx] ? cols[idIdx] : (cols[0].startsWith('R-') ? cols[0] : `R-${String(idx + 1).padStart(3, '0')}`);
      const name = nameIdx >= 0 && cols[nameIdx] ? cols[nameIdx] : (cols[1] || cols[0]);
      
      const kmVal = kmIdx >= 0 ? parseFloat(cols[kmIdx].replace(/,/g, '.')) : parseFloat(cols[2]?.replace(/,/g, '.') || '0');
      const hoursVal = hoursIdx >= 0 ? parseFloat(cols[hoursIdx].replace(/,/g, '.')) : parseFloat(cols[3]?.replace(/,/g, '.') || '4');
      const loadingVal = loadingIdx >= 0 ? parseInt(cols[loadingIdx]) : parseInt(cols[5] || '120');
      
      let storesList: string[] = ['L-000'];
      if (storesIdx >= 0 && cols[storesIdx]) {
        storesList = cols[storesIdx].split(',').map(s => s.trim()).filter(Boolean);
      } else if (cols[4] && cols[4].includes('L-')) {
        storesList = cols[4].split(',').map(s => s.trim()).filter(Boolean);
      }

      const tollVal = tollsIdx >= 0 ? parseFloat(cols[tollsIdx].replace(/[^0-9]/g, '')) : 0;
      const zoneVal = zoneIdx >= 0 && cols[zoneIdx] ? cols[zoneIdx] : 'Zona de Distribución';

      routes.push({
        id: id.toUpperCase(),
        name: name.toUpperCase(),
        zone: zoneVal,
        km: isNaN(kmVal) ? 50 : kmVal,
        transitHours: isNaN(hoursVal) ? 4 : hoursVal,
        loadingMinutes: isNaN(loadingVal) ? 120 : loadingVal,
        storeIds: storesList.length > 0 ? storesList : ['L-000'],
        tollEstimatedCost: isNaN(tollVal) || tollVal === 0 ? Math.round((kmVal / 100) * 16000) : tollVal,
        tollCount: Math.max(0, Math.round((kmVal / 100))),
        notes: `Importado directamente del archivo/tabla.`
      });
    });

    return routes;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setPastedText(content);
      try {
        const parsed = parseData(content);
        setPreviewCount(parsed.length);
        setErrorMsg(null);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al procesar el archivo.');
        setPreviewCount(null);
      }
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setPastedText(text);
    if (!text.trim()) {
      setPreviewCount(null);
      setErrorMsg(null);
      return;
    }
    try {
      const parsed = parseData(text);
      setPreviewCount(parsed.length);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message);
      setPreviewCount(null);
    }
  };

  const handleConfirmImport = () => {
    try {
      const parsed = parseData(pastedText);
      if (parsed.length === 0) {
        setErrorMsg("No se detectaron rutas válidas.");
        return;
      }
      onImportRoutes(parsed);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al importar los datos.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Importar Base de Datos de Rutas (CSV / Texto / Excel)
              </h2>
              <p className="text-[11px] text-slate-400">
                Pega tu tabla o sube tu archivo CSV para actualizar el sistema inmediatamente
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* File input button */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="font-semibold text-slate-800 block">Subir archivo (.csv o .txt)</span>
              <span className="text-slate-500 text-[11px]">Detecta encabezados y columnas separadas por comas, punto y coma o tabulaciones</span>
            </div>
            <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-lg text-xs transition-colors">
              Examinar archivo
              <input 
                type="file" 
                accept=".csv,.txt" 
                onChange={handleFileUpload}
                className="hidden" 
              />
            </label>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              O pega aquí el texto o contenido de la tabla:
            </label>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="ID_RUTA,NOMBRE_RUTA,KM_POR_ZONA,HORAS_ESTIMADAS_RUTA,LOCALES_RELACIONADOS_ID,TIEMPO_MUERTO_CARGUE_MINS&#10;R-001,SUPIA-RIOSUCIO-ANSERMA,390.0,14.0,&quot;L-000, L-001&quot;,255&#10;..."
              className="w-full p-3 font-mono text-[11px] border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Status / Preview */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {previewCount !== null && (
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">
                  Se detectaron correctamente {previewCount} rutas listas para importar.
                </span>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!previewCount}
              onClick={handleConfirmImport}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Cargar y Recalcular Rutas ({previewCount || 0})
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
