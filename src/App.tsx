import { FinancialReportModal } from './components/FinancialReportModal';
import React, { useState, useMemo, lazy, Suspense } from 'react';
import { DeliveryRoute, VehicleProfile, LaborConfig, RouteCostBreakdown, TripDispatch } from './types/logistics';
import { INITIAL_ROUTES } from './data/initialRoutes';
import { VEHICLE_PROFILES } from './data/vehicleProfiles';
import { DEFAULT_LABOR_CONFIG } from './data/laborDefaults';
import { calculateRouteCost } from './utils/costCalculator';
import { exportRoutesToCSV } from './utils/exportUtils';

import { Navbar, AppNavTab } from './components/Navbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PrintReportView } from './components/PrintReportView';
import { ModuleFallback } from './components/ModuleFallback';

/*
 * Code-splitting: cada modulo se descarga unicamente cuando el usuario lo abre.
 * Antes los 14 componentes pesados viajaban en el bundle inicial (1.86 MB / 465 KB gzip).
 *
 * Todos los componentes usan named export, por eso se envuelve cada import
 * dinamico en `.then(m => ({ default: m.X }))`.
 *
 * NOTA: los modales se montan de forma condicional, por lo que su codigo se
 * descarga unicamente al abrirlos.
 */
const RouteTable = lazy(() => import('./components/RouteTable').then(m => ({ default: m.RouteTable })));
const GoogleMapsRouteViewer = lazy(() => import('./components/GoogleMapsRouteViewer').then(m => ({ default: m.GoogleMapsRouteViewer })));
const MasterDataViewer = lazy(() => import('./components/MasterDataViewer').then(m => ({ default: m.MasterDataViewer })));
const VehicleDispatchSettlement = lazy(() => import('./components/VehicleDispatchSettlement').then(m => ({ default: m.VehicleDispatchSettlement })));
const CalculationBasisConfig = lazy(() => import('./components/CalculationBasisConfig').then(m => ({ default: m.CalculationBasisConfig })));
const ProfitAndLossCharts = lazy(() => import('./components/ProfitAndLossCharts').then(m => ({ default: m.ProfitAndLossCharts })));
const AuthPortal = lazy(() => import('./components/AuthPortal').then(m => ({ default: m.AuthPortal })));
const PendingApprovalScreen = lazy(() => import('./components/PendingApprovalScreen').then(m => ({ default: m.PendingApprovalScreen })));
const RouteDetailModal = lazy(() => import('./components/RouteDetailModal').then(m => ({ default: m.RouteDetailModal })));
const RouteFormModal = lazy(() => import('./components/RouteFormModal').then(m => ({ default: m.RouteFormModal })));
const ImportDatabaseModal = lazy(() => import('./components/ImportDatabaseModal').then(m => ({ default: m.ImportDatabaseModal })));
const UserProfileModal = lazy(() => import('./components/UserProfileModal').then(m => ({ default: m.UserProfileModal })));
const UserManagementModal = lazy(() => import('./components/UserManagementModal').then(m => ({ default: m.UserManagementModal })));
const FirebaseSyncModal = lazy(() => import('./components/FirebaseSyncModal').then(m => ({ default: m.FirebaseSyncModal })));
import { useAuth } from './context/AuthContext';
import {
  fetchStoresFromFirestore,
  saveRouteToFirestore,
  deleteRouteFromFirestore,
  fetchRoutesFromFirestore,
  subscribeToRoutesFromFirestore,
  syncAllRoutesToFirestore,
  saveLaborConfigToFirestore,
  subscribeToLaborConfigFromFirestore,
  saveVehicleToFirestore,
  subscribeToVehiclesFromFirestore,
  startBackgroundAutoSync
} from './services/firebase';
import { FileSpreadsheet, Navigation, Layers, Plus, UploadCloud, Truck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { InactivityTimeoutModal } from './components/InactivityTimeoutModal';

export default function App() {
  // Estado de las rutas maestras de SCJ o carga lo guardado
  const [routes, setRoutes] = useState<DeliveryRoute[]>(() => {
    const saved = localStorage.getItem('rutacost_routes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id?.startsWith('SCJ-')) return parsed;
      } catch (e) {
        console.error("Error cargando rutas locales:", e);
      }
    }
    return INITIAL_ROUTES;
  });

  // Estado de los vehículos de la flota SCJ
  const [vehicles, setVehicles] = useState<VehicleProfile[]>(() => {
    const saved = localStorage.getItem('rutacost_vehicles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id === 'npr-c2-turbo') return parsed;
      } catch (e) {
        console.error("Error al cargar vehículos guardados:", e);
      }
    }
    return VEHICLE_PROFILES;
  });

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleProfile>(() => {
    return vehicles[0] || VEHICLE_PROFILES[0];
  });

  // Configuración de mano de obra y horas extras CST
  const [laborConfig, setLaborConfig] = useState<LaborConfig>(() => {
    const saved = localStorage.getItem('rutacost_labor') || localStorage.getItem('scj_labor_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && typeof parsed.hourlyOrdinaryRate === 'number' && parsed.hourlyOrdinaryRate > 0) {
          return { ...DEFAULT_LABOR_CONFIG, ...parsed };
        }
      } catch (e) {}
    }
    return DEFAULT_LABOR_CONFIG;
  });

  // Escuchar actualizaciones globales de laborConfig
  React.useEffect(() => {
    const handleLaborUpdated = (e: any) => {
      if (e.detail) {
        setLaborConfig(e.detail);
      }
    };
    window.addEventListener('scj_labor_config_updated', handleLaborUpdated);
    return () => window.removeEventListener('scj_labor_config_updated', handleLaborUpdated);
  }, []);

  // Navegación principal en 5 módulos limpios y funcionales
  const [activeTab, setActiveTab] = useState<AppNavTab>('dispatch');

  // Modo de visualización en Rutas (Tabla Presupuestal vs Google Maps)
  const [routesViewMode, setRoutesViewMode] = useState<'table' | 'map'>('table');
  const [selectedMapRouteId, setSelectedMapRouteId] = useState<string | null>(null);
  const [pendingDispatchRouteId, setPendingDispatchRouteId] = useState<string | null>(null);

  // Modales
  const [selectedBreakdownForModal, setSelectedBreakdownForModal] = useState<RouteCostBreakdown | null>(null);
  const [isRouteFormOpen, setIsRouteFormOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [editingRoute, setEditingRoute] = useState<DeliveryRoute | null>(null);

  // Sistema de Autenticación, Perfiles y Firebase
  const {
    currentUser,
    userRole,
    permissions,
    isFirebaseConnected,
    authLoading,
    refreshCurrentUser,
    logout,
    inactivityWarning,
    inactivitySecondsLeft,
    extendSession
  } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);
  const [isFinancialReportOpen, setIsFinancialReportOpen] = useState<boolean>(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState<boolean>(false);
  const [isSyncingRoutes, setIsSyncingRoutes] = useState<boolean>(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  // Sincronizar tiendas y rutas en TIEMPO REAL desde Cloud Firestore
  React.useEffect(() => {
    if (isFirebaseConnected) {
      // 1. Sincronizar tiendas
      fetchStoresFromFirestore().catch(() => {});

      // 2. Subir rutas locales en segundo plano para asegurar que cualquier ruta creada previamente suba a la nube
      try {
        const rawLocal = localStorage.getItem('rutacost_routes');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            syncAllRoutesToFirestore(parsed).catch(err => {
              console.warn("Aviso al sincronizar rutas locales hacia la nube:", err);
            });
          }
        }
      } catch (e) {}

      // 3. Suscripción en TIEMPO REAL oficial (onSnapshot):
      // Cuando un compañero crea, edita o elimina una ruta, aparece de inmediato en vivo para todos
      const unsubRoutes = subscribeToRoutesFromFirestore((cloudRoutes) => {
        if (cloudRoutes && cloudRoutes.length > 0) {
          setRoutes(cloudRoutes);
          localStorage.setItem('rutacost_routes', JSON.stringify(cloudRoutes));
        }
      });

      // 4. Suscripción en TIEMPO REAL a parámetros laborales y costos fijos:
      const unsubLabor = subscribeToLaborConfigFromFirestore((cloudLabor) => {
        if (cloudLabor && cloudLabor.hourlyOrdinaryRate) {
          setLaborConfig(prev => ({ ...prev, ...cloudLabor }));
          localStorage.setItem('rutacost_labor', JSON.stringify(cloudLabor));
        }
      });

      // 5. Suscripción en TIEMPO REAL a perfiles de vehículos:
      const unsubVehicles = subscribeToVehiclesFromFirestore((cloudVehicles) => {
        if (cloudVehicles && cloudVehicles.length > 0) {
          setVehicles(cloudVehicles);
          localStorage.setItem('rutacost_vehicles', JSON.stringify(cloudVehicles));
        }
      });

      // 6. Iniciar Autosincronización forzada en segundo plano cada 20 segundos
      const stopAutoSync = startBackgroundAutoSync(20);

      return () => {
        if (unsubRoutes) unsubRoutes();
        if (unsubLabor) unsubLabor();
        if (unsubVehicles) unsubVehicles();
        if (stopAutoSync) stopAutoSync();
      };
    }
  }, [isFirebaseConnected]);

  // Función manual para forzar sincronización con la nube (Cloud Firestore)
  const handleManualSyncRoutes = async () => {
    setIsSyncingRoutes(true);
    setSyncStatusMessage('Sincronizando rutas con Cloud Firestore en tiempo real...');
    try {
      // Subir rutas locales actuales
      await syncAllRoutesToFirestore(routes);
      // Descargar rutas actualizadas desde la nube
      const cloudRoutes = await fetchRoutesFromFirestore();
      if (cloudRoutes && cloudRoutes.length > 0) {
        setRoutes(prev => {
          const map = new Map(prev.map(r => [r.id, r]));
          cloudRoutes.forEach(cr => {
            map.set(cr.id, { ...(map.get(cr.id) || {}), ...cr });
          });
          const merged = Array.from(map.values());
          localStorage.setItem('rutacost_routes', JSON.stringify(merged));
          return merged;
        });
        setSyncStatusMessage(`Sincronización completada exitosamente: ${cloudRoutes.length} rutas compartidas en la nube.`);
      } else {
        setSyncStatusMessage('Rutas locales sincronizadas exitosamente en la nube.');
      }
    } catch (e) {
      console.error("Error forzando sincronización de rutas:", e);
      setSyncStatusMessage('Aviso de conexión: trabajando con copia local de rutas.');
    } finally {
      setIsSyncingRoutes(false);
      setTimeout(() => setSyncStatusMessage(null), 4500);
    }
  };

  // Guardar en localStorage cuando cambien las rutas
  const updateRoutesState = (updater: DeliveryRoute[] | ((prev: DeliveryRoute[]) => DeliveryRoute[])) => {
    setRoutes(prev => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('rutacost_routes', JSON.stringify(nextVal));
      return nextVal;
    });
  };

  // Cálculo en vivo y sincronizado de costos para cada ruta
  const breakdowns = useMemo<RouteCostBreakdown[]>(() => {
    return routes.map(r => calculateRouteCost(r, selectedVehicle, laborConfig));
  }, [routes, selectedVehicle, laborConfig]);

  // Si hay un modal abierto, actualizar su desglose con los estados en vivo
  const currentModalBreakdown = useMemo(() => {
    if (!selectedBreakdownForModal) return null;
    const currentRoute = routes.find(r => r.id === selectedBreakdownForModal.route.id) || selectedBreakdownForModal.route;
    return calculateRouteCost(currentRoute, selectedVehicle, laborConfig);
  }, [selectedBreakdownForModal, routes, selectedVehicle, laborConfig]);

  // Despachos cerrados para análisis financiero
  const savedDispatches = useMemo<TripDispatch[]>(() => {
    try {
      const raw = localStorage.getItem('rutacost_dispatches');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }, [activeTab]);

  // Actualizaciones inline rápidas
  const handleUpdateInlineKm = (routeId: string, newKm: number) => {
    updateRoutesState(prev => {
      const updated = prev.map(r => r.id === routeId ? { ...r, km: newKm } : r);
      const target = updated.find(r => r.id === routeId);
      if (target && isFirebaseConnected) saveRouteToFirestore(target).catch(() => {});
      return updated;
    });
  };

  const handleUpdateInlineToll = (routeId: string, newToll: number) => {
    updateRoutesState(prev => {
      const updated = prev.map(r => r.id === routeId ? { ...r, tollEstimatedCost: newToll } : r);
      const target = updated.find(r => r.id === routeId);
      if (target && isFirebaseConnected) saveRouteToFirestore(target).catch(() => {});
      return updated;
    });
  };

  // Limpiar todas las rutas
  const handleClearRoutes = () => {
    updateRoutesState([]);
  };

  // Guardar ruta nueva o modificada (persiste en LocalStorage y Cloud Firestore)
  const handleSaveRoute = async (savedRoute: DeliveryRoute) => {
    updateRoutesState(prev => {
      const exists = prev.some(r => r.id === savedRoute.id);
      if (exists) {
        return prev.map(r => r.id === savedRoute.id ? savedRoute : r);
      }
      return [...prev, savedRoute];
    });

    // Guardar en Cloud Firestore y notificar
    try {
      const ok = await saveRouteToFirestore(savedRoute);
      if (ok) {
        setSyncStatusMessage(`Ruta "${savedRoute.id} - ${savedRoute.name}" compartida en la nube para todo el equipo.`);
        setTimeout(() => setSyncStatusMessage(null), 4000);
      }
    } catch (err) {
      console.warn("Aviso al guardar ruta en Firestore:", err);
    }
  };

  // Importar lote de rutas
  const handleImportRoutes = (importedRoutes: DeliveryRoute[]) => {
    updateRoutesState(importedRoutes);
    if (isFirebaseConnected && importedRoutes.length > 0) {
      syncAllRoutesToFirestore(importedRoutes).catch(() => {});
    }
    setActiveTab('routes');
  };

  // Actualizar vehículo y persistir en localStorage y Firestore
  const handleUpdateVehicle = (updatedVehicle: VehicleProfile) => {
    setVehicles(prev => {
      const nextVehicles = prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v);
      localStorage.setItem('rutacost_vehicles', JSON.stringify(nextVehicles));
      return nextVehicles;
    });

    if (selectedVehicle.id === updatedVehicle.id) {
      setSelectedVehicle(updatedVehicle);
    }

    if (isFirebaseConnected) {
      saveVehicleToFirestore(updatedVehicle).catch(() => {});
    }
  };

  // Actualizar configuración laboral y persistir en localStorage y Firestore
  const handleUpdateLaborConfig = (updatedLabor: LaborConfig) => {
    setLaborConfig(updatedLabor);
    localStorage.setItem('rutacost_labor', JSON.stringify(updatedLabor));
    if (isFirebaseConnected) {
      saveLaborConfigToFirestore(updatedLabor).catch(() => {});
    }
  };

  // Exportar a CSV / Excel
  const handleExportCSV = () => {
    exportRoutesToCSV(breakdowns, selectedVehicle, laborConfig);
  };

  // Abrir modal de informes consolidados con gráficos, KPIs y filtros
  const handlePrintReport = () => {
    setIsFinancialReportOpen(true);
  };

  // Restaurar la matriz maestra oficial de rutas de SCJ
  const handleRestoreScjRoutes = () => {
    updateRoutesState(INITIAL_ROUTES);
  };

  // Generar próximo ID para nueva ruta
  const nextRouteId = useMemo(() => {
    const numbers = routes
      .map(r => parseInt(r.id.replace('SCJ-', '').replace('R-', '')) || 0)
      .filter(n => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `SCJ-${String(maxNum + 1).padStart(3, '0')}`;
  }, [routes]);

  // Redireccionar si el rol o permisos granulares del usuario no le permiten ver la pestaña activa
  React.useEffect(() => {
    if (currentUser && currentUser.status === 'approved') {
      if (activeTab === 'dispatch' && !permissions.canViewDispatch && userRole !== 'admin') {
        if (permissions.canViewRoutes) setActiveTab('routes');
        else if (permissions.canViewDatabase) setActiveTab('database');
        else if (permissions.canViewCalcBasis) setActiveTab('calc_basis');
        else if (permissions.canViewPnl) setActiveTab('charts');
      } else if (activeTab === 'routes' && !permissions.canViewRoutes && userRole !== 'admin') {
        if (permissions.canViewDispatch) setActiveTab('dispatch');
        else if (permissions.canViewDatabase) setActiveTab('database');
      } else if (activeTab === 'calc_basis' && !permissions.canViewCalcBasis && userRole !== 'admin') {
        setActiveTab('routes');
      } else if (activeTab === 'database' && !permissions.canViewDatabase && userRole !== 'admin') {
        setActiveTab('routes');
      } else if (activeTab === 'charts' && !permissions.canViewPnl && userRole !== 'admin') {
        setActiveTab('routes');
      }
    }
  }, [permissions, userRole, activeTab, currentUser]);

  // 1. Pantalla de carga mientras Firebase verifica si hay sesión activa
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-600/30 animate-pulse relative z-10">
          <Truck className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300 relative z-10">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <span>Verificando credenciales en Firebase...</span>
        </div>
      </div>
    );
  }

  // 2. Portal de Acceso Dedicado: Si no hay usuario autenticado, renderizar ÚNICAMENTE el portal
  // No se renderiza de fondo ninguna ruta, despacho, tabla ni información de la empresa
  if (!currentUser) {
    return (
      <Suspense fallback={<ModuleFallback label="Cargando portal de acceso..." minHeight="100vh" />}>
        <AuthPortal
          onOpenFirebaseConfig={() => setIsFirebaseModalOpen(true)}
        />
      </Suspense>
    );
  }

  // 3. Pantalla Corporativa de Espera de Autorización: Si la cuenta está en estado 'pending' o 'rejected'
  // Bloquea totalmente el acceso al sistema hasta que un Administrador o Gerente la autorice
  if (currentUser.status !== 'approved') {
    return (
      <Suspense fallback={<ModuleFallback label="Cargando estado de autorizacion..." minHeight="100vh" />}>
        <PendingApprovalScreen
          user={currentUser}
          onRefreshStatus={refreshCurrentUser}
          onLogout={logout}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">

      {/* Barra de Navegación Superior con 5 Módulos Esenciales */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        routeCount={routes.length}
        onOpenNewRoute={() => {
          setEditingRoute(null);
          setIsRouteFormOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onClearRoutes={handleClearRoutes}
        onExportCSV={handleExportCSV}
        onPrintReport={handlePrintReport}
        onOpenLoginModal={() => setIsProfileModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">

        {/* Banner Especial para Modo Conductor */}
        {userRole === 'driver' && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                  <span>Modo Conductor Activo · {currentUser?.displayName}</span>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">
                    {currentUser?.assignedVehiclePlate || 'NPR Turbo'}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-0.5">
                  Ruta asignada: <strong>{currentUser?.assignedRouteId || 'SCJ-001'}</strong>. Consulta la secuencia de paradas, peajes en efectivo y activa la navegación GPS.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('routes');
                  setRoutesViewMode('map');
                  setSelectedMapRouteId(currentUser?.assignedRouteId || 'SCJ-001');
                }}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Ver Mi Ruta en GPS</span>
              </button>
            </div>
          </div>
        )}

        {/* Banner de Carga de Rutas SCJ si la base se encuentra vacía */}
        {routes.length === 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold text-[10px] rounded uppercase tracking-wide">
                Base Vacía
              </span>
              <div className="text-xs text-blue-950">
                No tienes rutas registradas actualmente. ¿Deseas cargar la <strong>Matriz Maestra Oficial de SCJ con fletes, peajes y viáticos</strong>?
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRestoreScjRoutes}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Cargar Matriz Maestra Oficial</span>
              </button>
            </div>
          </div>
        )}

        {/* 1. MÓDULO: DESPACHOS Y ENTRADAS */}
        {activeTab === 'dispatch' && (
          <Suspense fallback={<ModuleFallback label="Cargando despachos y liquidacion vehicular..." />}>
            <VehicleDispatchSettlement
              routes={routes}
              vehicles={vehicles}
              laborConfig={laborConfig}
              onOpenNewRoute={() => {
                setEditingRoute(null);
                setIsRouteFormOpen(true);
              }}
              onEditRoute={(r) => {
                setEditingRoute(r);
                setIsRouteFormOpen(true);
              }}
              onUpdateRoute={handleSaveRoute}
              initialDispatchRouteId={pendingDispatchRouteId}
              onClearInitialDispatchRouteId={() => setPendingDispatchRouteId(null)}
            />
          </Suspense>
        )}

        {/* 2. MÓDULO: RUTAS & MAPA (TABLA PRESUPUESTAL + GOOGLE MAPS) */}
        {activeTab === 'routes' && (
          <div className="space-y-4">

            {/* Cabecera con selector Tabla vs Mapa de Google Maps */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  Rutas & Corredores Viales SCJ ({routes.length} Rutas)
                </h1>
                <p className="text-xs text-slate-500">
                  {routesViewMode === 'table'
                    ? 'Cálculo operativo y financiero en tiempo real. Selecciona el mapa para ver los corredores viales.'
                    : 'Visualización interactiva y georreferenciación de rutas sobre la red vial con Google Maps.'}
                </p>
              </div>

              {/* Botón Selector: Tabla vs Mapa */}
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                  <button
                    onClick={() => setRoutesViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      routesViewMode === 'table'
                        ? 'bg-white text-blue-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tabla Presupuestal</span>
                  </button>

                  <button
                    onClick={() => setRoutesViewMode('map')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      routesViewMode === 'map'
                        ? 'bg-white text-blue-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mapa Google Maps</span>
                  </button>
                </div>

                {/* Botón Sincronizar Nube (Cloud Firestore) */}
                <button
                  onClick={handleManualSyncRoutes}
                  disabled={isSyncingRoutes}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                  title="Sincronizar rutas con Cloud Firestore para descargar rutas agregadas por compañeros"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRoutes ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
                  <span className="hidden sm:inline">{isSyncingRoutes ? 'Sincronizando...' : 'Sincronizar Nube'}</span>
                </button>

                <button
                  onClick={() => {
                    setEditingRoute(null);
                    setIsRouteFormOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Nueva Ruta</span>
                </button>
              </div>
            </div>

            {/* Banner de estado de sincronización */}
            {syncStatusMessage && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncStatusMessage}</span>
                </div>
                <button onClick={() => setSyncStatusMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer">✕</button>
              </div>
            )}

            {/* Renderizado condicional según modo seleccionado */}
            {routesViewMode === 'table' ? (
              <Suspense fallback={<ModuleFallback label="Cargando tabla presupuestal..." />}>
                <RouteTable
                  breakdowns={breakdowns}
                  onSelectRouteDetail={(b) => setSelectedBreakdownForModal(b)}
                  onEditRoute={(r) => {
                    setEditingRoute(r);
                    setIsRouteFormOpen(true);
                  }}
                  onUpdateInlineKm={handleUpdateInlineKm}
                  onUpdateInlineToll={handleUpdateInlineToll}
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                  onOpenNewRoute={() => {
                    setEditingRoute(null);
                    setIsRouteFormOpen(true);
                  }}
                  onOpenMapRoute={(route) => {
                    if (route) {
                      setSelectedMapRouteId(route.id);
                    }
                    setRoutesViewMode('map');
                  }}
                />
              </Suspense>
            ) : (
              <ErrorBoundary
                fallbackTitle="Inconveniente al cargar el módulo cartográfico"
                onReset={() => setRoutesViewMode('table')}
              >
                <Suspense fallback={<ModuleFallback label="Cargando modulo cartografico..." minHeight="32rem" />}>
                  <GoogleMapsRouteViewer
                    routes={routes}
                    selectedVehicle={selectedVehicle}
                    vehicles={vehicles}
                    laborConfig={laborConfig}
                    onUpdateRoute={handleSaveRoute}
                    onOpenImportModal={() => setIsImportModalOpen(true)}
                    initialRouteId={selectedMapRouteId}
                    onNavigateToDispatch={(routeId) => {
                      setPendingDispatchRouteId(routeId);
                      setActiveTab('dispatch');
                    }}
                  />
                </Suspense>
              </ErrorBoundary>
            )}

          </div>
        )}

        {/* 3. MÓDULO: BASE DE CÁLCULO & CALENDARIO */}
        {activeTab === 'calc_basis' && (
          <Suspense fallback={<ModuleFallback label="Cargando base de calculo y calendario..." />}>
            <CalculationBasisConfig
              laborConfig={laborConfig}
              onUpdateLaborConfig={handleUpdateLaborConfig}
              selectedVehicle={selectedVehicle}
              vehicles={vehicles}
              onUpdateVehicle={handleUpdateVehicle}
            />
          </Suspense>
        )}

        {/* 4. MÓDULO: BASE DE DATOS (PERSONAL Y VEHÍCULOS) */}
        {activeTab === 'database' && (
          <Suspense fallback={<ModuleFallback label="Cargando base de datos..." />}>
            <MasterDataViewer
              routes={routes}
              vehicles={vehicles}
              laborConfig={laborConfig}
              selectedVehicle={selectedVehicle}
              onUpdateRoutes={updateRoutesState}
              onSelectRouteForDetail={(b) => setSelectedBreakdownForModal(b)}
              onEditRoute={(r) => {
                setEditingRoute(r);
                setIsRouteFormOpen(true);
              }}
              onOpenNewRoute={() => {
                setEditingRoute(null);
                setIsRouteFormOpen(true);
              }}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onExportCSV={handleExportCSV}
              onNavigateToMaps={() => {
                setActiveTab('routes');
                setRoutesViewMode('map');
              }}
              onNavigateToLabor={() => setActiveTab('calc_basis')}
            />
          </Suspense>
        )}

        {/* 5. MÓDULO: GRÁFICAS DE GANANCIAS VS GASTOS */}
        {activeTab === 'charts' && (
          <Suspense fallback={<ModuleFallback label="Cargando graficas de ganancias vs gastos..." />}>
            <ProfitAndLossCharts
              breakdowns={breakdowns}
              selectedVehicle={selectedVehicle}
              laborConfig={laborConfig}
              dispatches={savedDispatches}
              onSelectRouteDetail={(b) => setSelectedBreakdownForModal(b)}
              onNavigateToDispatch={() => setActiveTab('dispatch')}
            />
          </Suspense>
        )}

      </main>

      {/* Footer corporativo */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            SCJ · Control de Flota, Despachos y Reparto | Operador Logístico Independiente
          </span>
          <span className="text-slate-400">
            Normativa Laboral CST & Metodología SICE-TAC MinTransporte
          </span>
        </div>
      </footer>

      {/*
        Modales: se montan solo cuando estan abiertos, de modo que su codigo se
        descarga en ese instante y no al arrancar la aplicacion.
      */}
      <Suspense fallback={null}>
        {/* Modal de Desglose Detallado de Ruta */}
        {currentModalBreakdown && (
          <RouteDetailModal
            breakdown={currentModalBreakdown}
            laborConfig={laborConfig}
            onClose={() => setSelectedBreakdownForModal(null)}
          />
        )}

        {/* Modal de Formulario de Ruta (Nueva / Edición) */}
        {isRouteFormOpen && (
          <RouteFormModal
            isOpen={isRouteFormOpen}
            onClose={() => setIsRouteFormOpen(false)}
            onSaveRoute={handleSaveRoute}
            initialRoute={editingRoute}
            nextId={nextRouteId}
          />
        )}

        {/* Modal de Importación Masiva de Base de Datos */}
        {isImportModalOpen && (
          <ImportDatabaseModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImportRoutes={handleImportRoutes}
          />
        )}

        {/* Modal de Perfil de Usuario y Roles */}
        {isProfileModalOpen && (
          <UserProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onOpenLoginModal={() => setIsProfileModalOpen(false)}
            onOpenFirebaseConfig={() => setIsFirebaseModalOpen(true)}
            onOpenUserManagement={() => setIsUserManagementOpen(true)}
          />
        )}

        {/* Modal de Gestión de Usuarios y Permisos (Solo Admin o Manager) */}
        {isUserManagementOpen && (
          <UserManagementModal
            isOpen={isUserManagementOpen}
            onClose={() => setIsUserManagementOpen(false)}
          />
        )}

        {/* Modal de Conexión, Guía de Borrado y Carga a Firebase Firestore */}
        {isFirebaseModalOpen && (
          <FirebaseSyncModal
            isOpen={isFirebaseModalOpen}
            onClose={() => setIsFirebaseModalOpen(false)}
            routes={routes}
            vehicles={vehicles}
            laborConfig={laborConfig}
          />
        )}
      </Suspense>

      {/* Modal de Informes Financieros con Gráficos, KPIs y Filtros */}
      <FinancialReportModal
        isOpen={isFinancialReportOpen}
        onClose={() => setIsFinancialReportOpen(false)}
        dispatches={savedDispatches}
        breakdowns={breakdowns}
        selectedVehicle={selectedVehicle}
        laborConfig={laborConfig}
      />

      {/* Vista especial de Impresión / Guardado PDF (ligera, siempre montada) */}
      <PrintReportView
        breakdowns={breakdowns}
        selectedVehicle={selectedVehicle}
        laborConfig={laborConfig}
      />

      {/* Modal de Advertencia de Expiración de Sesión por Inactividad */}
      <InactivityTimeoutModal
        isOpen={inactivityWarning}
        secondsLeft={inactivitySecondsLeft}
        onExtend={extendSession}
        onLogout={logout}
      />

    </div>
  );
}
