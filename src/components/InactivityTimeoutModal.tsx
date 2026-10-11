import React from 'react';
import { ShieldAlert, Clock, LogOut, CheckCircle2 } from 'lucide-react';

interface InactivityTimeoutModalProps {
  isOpen: boolean;
  secondsLeft: number;
  onExtend: () => void;
  onLogout: () => void;
}

export const InactivityTimeoutModal: React.FC<InactivityTimeoutModalProps> = ({
  isOpen,
  secondsLeft,
  onExtend,
  onLogout
}) => {
  if (!isOpen) return null;

  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / 60) * 100));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-black/90 text-white relative overflow-hidden">
        
        {/* Glow de advertencia superior */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
        <div 
          className="absolute top-0 left-0 h-1.5 bg-amber-400 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-black text-amber-300 uppercase tracking-wider">
              Control de Seguridad
            </span>
            <h3 className="text-lg font-black text-white mt-1">
              ¿Sigues ahí? Tu sesión va a expirar
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          Por protección de la información corporativa de <strong>SCJ Transportes</strong>, las sesiones se cierran automáticamente tras 15 minutos sin actividad.
        </p>

        {/* Contador Central */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-300 text-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Cierre automático en:</span>
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-black text-amber-400 tracking-wider">
              {String(secondsLeft).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400 font-sans font-semibold">seg</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onExtend}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Continuar Trabajando</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Salir</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-4 font-medium">
          Mover el cursor o presionar cualquier tecla también mantiene tu sesión activa.
        </p>
      </div>
    </div>
  );
};
