import React from 'react';
import { X, AlertTriangle, Truck } from 'lucide-react';

interface SCJModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  showConfirm?: boolean;
  confirmDisabled?: boolean;
  securityInput?: {
    enabled: boolean;
    expectedValue: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
}

/**
 * Modal personalizado con la imagen corporativa de SCJ.
 * Reemplaza los diálogos nativos del navegador (confirm, prompt, alert).
 */
export const SCJModal: React.FC<SCJModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showConfirm = true,
  confirmDisabled = false,
  securityInput,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (securityInput?.enabled) {
      if (securityInput.value !== securityInput.expectedValue) {
        return;
      }
    }
    onConfirm?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header con branding SCJ */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-4 relative">
          {/* Logo SCJ con vehículo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 40 40" className="w-8 h-8">
                {/* Camión estilizado con letras SCJ */}
                <rect x="4" y="14" width="20" height="12" rx="2" fill="#1e40af"/>
                <rect x="24" y="18" width="10" height="8" rx="1" fill="#3b82f6"/>
                <circle cx="10" cy="28" r="3" fill="#1e293b"/>
                <circle cx="20" cy="28" r="3" fill="#1e293b"/>
                <circle cx="28" cy="28" r="3" fill="#1e293b"/>
                <text x="8" y="23" fontSize="7" fontWeight="bold" fill="white" fontFamily="sans-serif">SCJ</text>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-base tracking-tight">{title}</h3>
              <p className="text-blue-200 text-[10px] font-medium tracking-wide">SCJ · Control de Flota y Reparto</p>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5">
          {children}

          {/* Input de seguridad para acciones irreversibles */}
          {securityInput?.enabled && (
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Para confirmar, escribe exactamente: <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{securityInput.expectedValue}</span>
              </label>
              <input
                type="text"
                value={securityInput.value}
                onChange={(e) => securityInput.onChange(e.target.value)}
                placeholder={securityInput.placeholder || 'Escribe el texto de confirmación...'}
                className={`w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  securityInput.value && securityInput.value !== securityInput.expectedValue
                    ? 'border-rose-300 bg-rose-50'
                    : 'border-slate-300'
                }`}
              />
              {securityInput.value && securityInput.value !== securityInput.expectedValue && (
                <p className="text-[10px] text-rose-600 mt-1 font-medium">El texto no coincide exactamente</p>
              )}
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors"
          >
            {cancelText}
          </button>
          {showConfirm && (
            <button
              onClick={handleConfirm}
              disabled={confirmDisabled || (securityInput?.enabled && securityInput.value !== securityInput.expectedValue)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                confirmDisabled || (securityInput?.enabled && securityInput.value !== securityInput.expectedValue)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20'
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SCJModal;
