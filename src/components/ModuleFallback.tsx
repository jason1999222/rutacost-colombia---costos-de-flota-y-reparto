import React from 'react';
import { Loader2 } from 'lucide-react';

interface ModuleFallbackProps {
  /** Texto corto que explica qué se está descargando. */
  label?: string;
  /** Altura mínima del placeholder para evitar saltos de layout (CSS). */
  minHeight?: string;
}

/**
 * Placeholder mostrado mientras se descarga un modulo pesado via `React.lazy`.
 *
 * Antes del code-splitting, los ~14 modulos (mapas, liquidacion, graficas, base
 * de datos) viajaban todos dentro del bundle inicial. Este componente permite
 * pintar la pantalla de inmediato y cargar cada modulo bajo demanda.
 */
export const ModuleFallback: React.FC<ModuleFallbackProps> = ({
  label = 'Cargando modulo...',
  minHeight = '18rem',
}) => {
  return (
    <div
      className="w-full flex flex-col items-center justify-center gap-3 text-center"
      style={{ minHeight }}
      role="status"
      aria-live="polite"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-bold text-slate-700">{label}</p>
        <p className="text-[11px] text-slate-500">
          Descargando componentes...
        </p>
      </div>

      {/* Barra de progreso indeterminada para dar sensacion de avance. */}
      <div className="w-40 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-blue-600 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default ModuleFallback;
