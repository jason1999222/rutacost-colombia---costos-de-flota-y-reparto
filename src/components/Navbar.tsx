import React from 'react';
import {
  BarChart3,
  Navigation,
  Database,
  Layers,
  Calculator,
  Lock,
  Users,
  RefreshCw,
  Truck,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_DEFINITIONS } from '../types/auth';
import { subscribeToAutoSyncStatus, BackgroundSyncStatus } from '../services/firebase';

export type AppNavTab = 'dispatch' | 'routes' | 'calc_basis' | 'database' | 'charts';

interface NavbarProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  routeCount?: number;
  onOpenNewRoute: () => void;
  onOpenImportModal: () => void;
  onClearRoutes: () => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
  onOpenLoginModal?: () => void;
  onOpenProfileModal?: () => void;
  onOpenFirebaseModal?: () => void;
  onOpenUserManagement?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onPrintReport,
  onOpenLoginModal,
  onOpenProfileModal,
  onOpenFirebaseModal,
  onOpenUserManagement,
}) => {
  const { currentUser, userRole, permissions, isFirebaseConnected, pendingUsersCount, logout } = useAuth();
  const roleDef = ROLE_DEFINITIONS[userRole];

  const [autoSync, setAutoSync] = React.useState<BackgroundSyncStatus | null>(null);

  React.useEffect(() => {
    if (!isFirebaseConnected) return;
    const unsub = subscribeToAutoSyncStatus((status) => {
      setAutoSync(status);
    });
    return () => unsub();
  }, [isFirebaseConnected]);

  const navItems: { key: AppNavTab; label: string; icon: React.ReactNode; visible: boolean }[] = [
    {
      key: 'dispatch',
      label: 'Despachos',
      icon: <Layers className="w-4 h-4 shrink-0" />,
      visible: permissions.canViewDispatch || userRole === 'admin',
    },
    {
      key: 'routes',
      label: 'Rutas',
      icon: <Navigation className="w-4 h-4 shrink-0" />,
      visible: permissions.canViewRoutes || userRole === 'admin',
    },
    {
      key: 'calc_basis',
      label: 'Cálculo',
      icon: <Calculator className="w-4 h-4 shrink-0" />,
      visible: permissions.canViewCalcBasis || userRole === 'admin',
    },
    {
      key: 'database',
      label: 'Datos',
      icon: <Database className="w-4 h-4 shrink-0" />,
      visible: permissions.canViewDatabase || userRole === 'admin',
    },
    {
      key: 'charts',
      label: 'Gastos',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
      visible: permissions.canViewPnl || userRole === 'admin',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs no-print">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 gap-2">

          {/* Logo SCJ compacto */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm select-none">
              <svg viewBox="0 0 40 40" className="w-7 h-7">
                <rect x="4" y="14" width="20" height="12" rx="2" fill="white"/>
                <rect x="24" y="18" width="10" height="8" rx="1" fill="white" opacity="0.8"/>
                <circle cx="10" cy="28" r="3" fill="white"/>
                <circle cx="20" cy="28" r="3" fill="white"/>
                <circle cx="28" cy="28" r="3" fill="white"/>
                <text x="8" y="23" fontSize="7" fontWeight="bold" fill="#1e40af" fontFamily="sans-serif">SCJ</text>
              </svg>
            </div>
            <div className="leading-tight">
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900">
                SCJ <span className="text-blue-600 font-extrabold">Flota & Despachos</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Operador Logístico de Transporte
              </span>
            </div>
          </div>

          {/* Navegación Principal compacta */}
          <nav className="flex items-center gap-0.5 flex-1 justify-center min-w-0 overflow-x-auto no-scrollbar">
            {navItems.filter(item => item.visible).map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-all duration-150 flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  activeTab === item.key
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100/80'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Acciones: Informes + Usuarios + Firebase + Perfil */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Descargar Informes con Gráficos */}
            <button
              type="button"
              onClick={onPrintReport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-900 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Descargar informe financiero consolidado con gráficos vectoriales, KPIs y filtros de fecha"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Descargar Informes</span>
            </button>

            {/* Gestión de Usuarios (Admin) */}
            {(permissions.canManageUsers || userRole === 'admin' || userRole === 'manager') && (
              <button
                type="button"
                onClick={onOpenUserManagement}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Usuarios</span>
                {pendingUsersCount > 0 && (
                  <span className="px-1 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full animate-pulse">
                    {pendingUsersCount}
                  </span>
                )}
              </button>
            )}

            {/* Estado Firebase */}
            <button
              type="button"
              onClick={onOpenFirebaseModal}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                isFirebaseConnected
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
              <span className="hidden md:inline">Firebase</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            </button>

            {/* Indicador Auto-Sync */}
            {isFirebaseConnected && (
              <div
                className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-[10px] font-medium text-emerald-900 cursor-help select-none"
                title={autoSync?.message || 'Autosincronización activa cada 20 segundos'}
              >
                <RefreshCw className={`w-3 h-3 text-emerald-600 ${autoSync?.state === 'syncing' ? 'animate-spin' : ''}`} />
                <span className="font-mono font-bold">
                  {autoSync?.state === 'syncing' ? 'Sync...' : 'Auto-Sync'}
                </span>
              </div>
            )}

            {/* Perfil de Usuario */}
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={onOpenProfileModal}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center uppercase">
                    {currentUser.displayName.slice(0, 2)}
                  </div>
                  <div className="text-left hidden lg:block leading-tight">
                    <div className="text-[11px] font-bold text-slate-800 truncate max-w-[80px]">
                      {currentUser.displayName.split(' ')[0]}
                    </div>
                    <div className="text-[9px] text-slate-500">
                      {roleDef.label.split(' ')[0]}
                    </div>
                  </div>
                </button>

                {/* Botón Salir / Cerrar Sesión */}
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Cerrar sesión y volver al portal de acceso seguro"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden xl:inline">Salir</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
