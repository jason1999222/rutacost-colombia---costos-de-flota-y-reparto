import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft, MapPin } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  onSwitchMode?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('⚠️ [ErrorBoundary] Error capturado en componente:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white border border-rose-200 rounded-2xl p-8 shadow-sm max-w-2xl mx-auto my-6 text-center space-y-4">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {this.props.fallbackTitle || 'Hubo un inconveniente al cargar esta vista'}
            </h2>
            <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
              Se produjo un error al inicializar el componente o el servicio de mapas. Los datos de la flota y rutas están seguros.
            </p>
            {this.state.error && (
              <div className="mt-3 p-3 bg-slate-100 rounded-xl text-left text-xs font-mono text-slate-800 border border-slate-200 max-h-32 overflow-y-auto">
                <span className="font-bold text-rose-700">Detalle del error: </span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reintentar Carga</span>
            </button>

            {this.props.onSwitchMode && (
              <button
                type="button"
                onClick={this.props.onSwitchMode}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Usar OpenStreetMap (Modo Libre)</span>
              </button>
            )}

            {this.props.onReset && (
              <button
                type="button"
                onClick={this.props.onReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Tabla Presupuestal</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
