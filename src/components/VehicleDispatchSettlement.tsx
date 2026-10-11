import { defaultLaborConfig } from '../data/laborDefaults';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  TripDispatch,
  DeliveryRoute,
  VehicleProfile,
  LaborConfig,
  RouteCostBreakdown,
  TripIncidentalItem
} from '../types/logistics';
import { calculateRouteCost, formatCOP, formatNumber } from '../utils/costCalculator';
import { getCurrentPeriod, formatPeriod, getAvailablePeriods, isPeriodClosed } from '../utils/periodUtils';
import { getCurrentYear, isYearClosed, generateYearSummary } from '../utils/historicalCalculator';
import { SCJModal } from './SCJModal';
import {
  Truck,
  Users,
  Fuel,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Plus,
  ArrowRight,
  RotateCcw,
  Check,
  TrendingUp,
  TrendingDown,
  Printer,
  Layers,
  Wrench,
  Search,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trash2,
  Edit3,
  Save,
  ExternalLink,
  CloudOff,
  Cloud,
  RefreshCw,
  AlertTriangle,
  Navigation,
  Gauge
} from 'lucide-react';
import { VEHICLE_PROFILES } from '../data/vehicleProfiles';
import {
  COMPANY_FLEET_VEHICLES,
  COMPANY_DRIVERS,
  COMPANY_HELPERS,
  CrewMemberResource,
  FleetVehicleResource,
  getCustomStaff,
  saveCustomStaff,
  getCustomFleet,
  saveCustomFleet
} from '../data/fleetAndCrewData';
import { calculateTripLaborFromSchedule, calculateShiftEmployerCost, isSundayOrColombianHoliday, getStoredWorkSchedule } from '../data/colombiaHolidays';
import { useAuth } from '../context/AuthContext';
import {
  saveDispatchToFirestore,
  deleteDispatchFromFirestore,
  subscribeToDispatchesFromFirestore,
  subscribeToStaffFromFirestore,
  subscribeToFleetFromFirestore
} from '../services/firebase';

interface VehicleDispatchSettlementProps {
  routes: DeliveryRoute[];
  vehicles: VehicleProfile[];
  laborConfig: LaborConfig;
  onOpenNewRoute: () => void;
  onEditRoute?: (route: DeliveryRoute) => void;
  onUpdateRoute?: (route: DeliveryRoute) => void;
  initialDispatchRouteId?: string | null;
  onClearInitialDispatchRouteId?: () => void;
}

export const VehicleDispatchSettlement: React.FC<VehicleDispatchSettlementProps> = ({
  routes,
  vehicles,
  laborConfig,
  onOpenNewRoute,
  onEditRoute,
  onUpdateRoute,
  initialDispatchRouteId,
  onClearInitialDispatchRouteId
}) => {
  // Auth context para saber si hay conexión Firebase activa
  const { isFirebaseConnected } = useAuth();
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Lista de despachos con persistencia en localStorage
  const [dispatches, setDispatches] = useState<TripDispatch[]>(() => {
    const saved = localStorage.getItem('rutacost_dispatches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(d => Boolean(d && d.id));
        }
      } catch (e) {}
    }
    return [];
  });

  // ============================================================
  // SYNC EN TIEMPO REAL CON FIRESTORE
  // Suscripción onSnapshot: cuando un compañero registra una
  // salida, retorno o liquidación, aparece de inmediato en TODOS
  // los usuarios conectados sin recargar la página.
  // ============================================================
  const dispatchSyncRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isFirebaseConnected) return;
    setIsSyncingCloud(true);

    const unsubscribe = subscribeToDispatchesFromFirestore((cloudDispatches) => {
      setIsSyncingCloud(false);
      setDispatches(prev => {
        const cloudIds = new Set(cloudDispatches.map(c => c.id));

        // Preservar solo registros locales creados offline que nunca han sido sincronizados (sin syncedAt)
        const unSyncedLocals = prev.filter(d => Boolean(d && d.id && !cloudIds.has(d.id) && !d.syncedAt));

        // Subir automáticamente a Firestore los registros offline nuevos
        unSyncedLocals.forEach(localDispatch => {
          saveDispatchToFirestore(localDispatch).catch(err =>
            console.warn('Aviso subida automática despacho local:', err)
          );
        });

        // Combinar datos canónicos de Firestore con borradores locales no subidos
        const merged = [...cloudDispatches, ...unSyncedLocals]
          .filter(d => Boolean(d && d.id))
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        localStorage.setItem('rutacost_dispatches', JSON.stringify(merged));
        return merged;
      });
    }, (err) => {
      console.warn("Aviso suscripción despachos:", err);
      setIsSyncingCloud(false);
    });

    dispatchSyncRef.current = unsubscribe || null;
    return () => {
      if (dispatchSyncRef.current) dispatchSyncRef.current();
    };
  }, [isFirebaseConnected]);

  // Forzar sincronización manual de todas las salidas locales hacia Cloud Firestore
  const handleForceSyncDispatches = async () => {
    if (!isFirebaseConnected) {
      alert("No hay conexión con Firebase. Conéctate primero desde el botón de Firebase en la barra superior.");
      return;
    }
    setIsManualSyncing(true);
    setSyncFeedback(null);
    try {
      let count = 0;
      for (const d of dispatches) {
        if (d && d.id) {
          await saveDispatchToFirestore(d);
          count++;
        }
      }
      setSyncFeedback(`✅ ¡${count} salidas subidas y sincronizadas en Cloud Firestore!`);
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch (e: any) {
      setSyncFeedback(`⚠️ Error: ${e?.message || e}`);
      setTimeout(() => setSyncFeedback(null), 6000);
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Guardar en localStorage (y en Firestore si hay conexión)
  const saveDispatches = (newDispatches: TripDispatch[], changedDispatch?: TripDispatch, deletedId?: string) => {
    setDispatches(newDispatches);
    localStorage.setItem('rutacost_dispatches', JSON.stringify(newDispatches));
    // Sincronizar con Firestore si está conectado
    if (isFirebaseConnected) {
      if (changedDispatch) {
        saveDispatchToFirestore(changedDispatch).catch(e => console.warn('Aviso sync despacho:', e));
      }
      if (deletedId) {
        deleteDispatchFromFirestore(deletedId).catch(e => console.warn('Aviso borrar despacho:', e));
      }
    }
  };

  // Modales
  const [isNewDispatchOpen, setIsNewDispatchOpen] = useState<boolean>(false);
  const [selectedDispatchForSettlement, setSelectedDispatchForSettlement] = useState<TripDispatch | null>(null);
  const [selectedDispatchForView, setSelectedDispatchForView] = useState<TripDispatch | null>(null);
  const [editingDispatch, setEditingDispatch] = useState<TripDispatch | null>(null);
  const [editActiveTab, setEditActiveTab] = useState<'departure' | 'settlement'>('departure');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('flat');
  const [vehicleFilter, setVehicleFilter] = useState<string>('TODOS');
  const [expandedVehiclePlates, setExpandedVehiclePlates] = useState<Record<string, boolean>>({});
  const [periodFilter, setPeriodFilter] = useState<string>('ALL'); // 'ALL' o 'YYYY-MM'
  const [showPeriodSelector, setShowPeriodSelector] = useState<boolean>(false);

  // Estado del modal de cierre de mes personalizado
  const [showCloseMonthModal, setShowCloseMonthModal] = useState<boolean>(false);
  const [closeMonthConfirmText, setCloseMonthConfirmText] = useState<string>('');

  // Estado del modal de cierre de año
  const [showCloseYearModal, setShowCloseYearModal] = useState<boolean>(false);
  const [closeYearConfirmText, setCloseYearConfirmText] = useState<string>('');

  // Banner de nuevo año (muestra alerta si el año actual no coincide con el último despacho)
  const [showNewYearBanner, setShowNewYearBanner] = useState<boolean>(() => {
    const currentYear = getCurrentYear();
    const lastDispatchYear = dispatches.length > 0
      ? Math.max(...dispatches.map(d => parseInt((d.period || d.departureDate?.substring(0, 7) || '0').split('-')[0], 10)))
      : currentYear;
    return currentYear > lastDispatchYear;
  });

  // Formulario completo de Edición de Despacho / Viaje
  const [editDispatchForm, setEditDispatchForm] = useState({
    id: '',
    manifestNumber: '',
    status: 'LIQUIDADO' as 'EN_TRANSITO' | 'LIQUIDADO',
    vehiclePlate: '',
    vehicleId: '',
    driverName: '',
    driverDocument: '',
    helpersCount: 1,
    helperNames: '',
    routeId: '',
    departureDate: '',
    departureTime: '',
    departureOdometer: 0,
    advancePaymentCOP: 0,
    cargoDescription: '',

    // Retorno y liquidación
    returnDate: '',
    returnTime: '',
    arrivalOdometer: 0,
    fuelMode: 'BY_KM' as 'BY_KM' | 'MANUAL',
    fuelKmPerGallon: 13.5,
    actualFuelPricePerGallon: 10560,
    actualFuelGallons: 0,
    actualFuelCostCOP: 0,
    fuelPaidWithAdvance: false,
    actualTollCount: 4,
    actualTollCostCOP: 0,
    actualPerDiemCOP: 0,
    actualHoursWorked: 0,
    incidentalsList: [] as TripIncidentalItem[],
    incidentalNotes: '',
    generalNotes: ''
  });

  // Recursos actualmente en ruta activa (despachos en tránsito o programados)
  const activeDispatches = useMemo(() => {
    return dispatches.filter(d => d.status === 'EN_TRANSITO' || d.status === 'PROGRAMADO');
  }, [dispatches]);

  // Mapa de placas ocupadas (en ruta física)
  const busyPlatesMap = useMemo(() => {
    const map = new Map<string, TripDispatch>();
    activeDispatches.forEach(d => {
      if (d.vehiclePlate) {
        map.set(d.vehiclePlate.toUpperCase().trim(), d);
      }
    });
    return map;
  }, [activeDispatches]);

  // Mapa de conductores ocupados (en ruta física)
  const busyDriversMap = useMemo(() => {
    const map = new Map<string, TripDispatch>();
    activeDispatches.forEach(d => {
      if (d.driverName) {
        map.set(d.driverName.trim().toLowerCase(), d);
      }
    });
    return map;
  }, [activeDispatches]);

  // Mapa de auxiliares ocupados (en ruta física)
  const busyHelpersMap = useMemo(() => {
    const map = new Map<string, TripDispatch>();
    activeDispatches.forEach(d => {
      if (d.helperNames) {
        map.set(d.helperNames.trim().toLowerCase(), d);
      }
    });
    return map;
  }, [activeDispatches]);

  // Funciones auxiliares para obtener la fecha y hora EXACTA LOCAL del equipo del usuario
  const getLocalCurrentDate = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getLocalCurrentTime = (): string => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  // Flota y personal reactivos y persistentes desde Base de Datos y Cloud Firestore
  const [activeStaffList, setActiveStaffList] = useState<CrewMemberResource[]>(() => getCustomStaff());
  const [activeFleetList, setActiveFleetList] = useState<FleetVehicleResource[]>(() => getCustomFleet());

  useEffect(() => {
    const handleStaff = () => setActiveStaffList(getCustomStaff());
    const handleFleet = () => setActiveFleetList(getCustomFleet());
    window.addEventListener('scj_staff_updated', handleStaff);
    window.addEventListener('scj_fleet_updated', handleFleet);

    let unsubStaff: (() => void) | null = null;
    let unsubFleet: (() => void) | null = null;

    if (isFirebaseConnected) {
      unsubStaff = subscribeToStaffFromFirestore((cloudStaff) => {
        if (cloudStaff && cloudStaff.length > 0) {
          setActiveStaffList(cloudStaff);
          saveCustomStaff(cloudStaff);
        }
      });

      unsubFleet = subscribeToFleetFromFirestore((cloudFleet) => {
        if (cloudFleet && cloudFleet.length > 0) {
          setActiveFleetList(cloudFleet);
          saveCustomFleet(cloudFleet);
        }
      });
    }

    return () => {
      window.removeEventListener('scj_staff_updated', handleStaff);
      window.removeEventListener('scj_fleet_updated', handleFleet);
      if (unsubStaff) unsubStaff();
      if (unsubFleet) unsubFleet();
    };
  }, [isFirebaseConnected]);

  const activeDrivers = useMemo(() => {
    return activeStaffList.filter(s => s.role === 'CONDUCTOR' || s.role === 'POLIFUNCIONAL' || s.role === 'COORDINADOR');
  }, [activeStaffList]);

  const activeHelpers = useMemo(() => {
    return activeStaffList.filter(s => s.role === 'AUXILIAR' || s.role === 'POLIFUNCIONAL');
  }, [activeStaffList]);

  // Formulario de Nuevo Despacho (Salida) con valores predeterminados 100% reales de la empresa y hora/fecha local del equipo
  const [newDispatchForm, setNewDispatchForm] = useState(() => {
    const customFleet = getCustomFleet();
    const customStaff = getCustomStaff();
    const firstDriver = customStaff.find(s => s.role === 'CONDUCTOR' || s.role === 'POLIFUNCIONAL') || customStaff[0];
    const firstHelper = customStaff.find(s => s.role === 'AUXILIAR') || customStaff[1];

    return {
      manifestNumber: `MAN-${Math.floor(1000 + Math.random() * 9000)}`,
      vehiclePlate: customFleet[0]?.plate || 'GTX052',
      vehicleId: vehicles[0]?.id || 'npr-c2-turbo',
      driverName: firstDriver?.name || 'Jose Ibañez',
      driverDocument: firstDriver?.document || '1.129.517.122',
      helpersCount: 1,
      helperNames: firstHelper?.name || 'Jair Gamboa',
      routeId: routes[0]?.id || 'SCJ-001',
      departureDate: getLocalCurrentDate(),
      departureTime: getLocalCurrentTime(),
      departureOdometer: 142500,
      advancePaymentCOP: routes[0]?.viaticosCOP || 50000,
      cargoDescription: 'Distribución y entrega oficial de mercancía SCJ'
    };
  });

  // Helper que detecta con precisión el perfil del vehículo (NPR vs NLR) según placa, tipo y flota
  const getVehicleProfileForPlate = useCallback((plate: string, vehId?: string): VehicleProfile => {
    const cleanPlate = plate ? plate.toUpperCase().trim() : '';
    const fleetVeh = activeFleetList.find(fv => fv.plate.toUpperCase().trim() === cleanPlate);
    const isNlr = fleetVeh?.vehicleType === 'NLR' ||
                  fleetVeh?.vehicleProfileId?.toLowerCase().includes('nlr') ||
                  cleanPlate.includes('NLR') ||
                  (vehId && vehId.toLowerCase().includes('nlr'));

    // 1. Intentar buscar por ID coincidente
    let matched = vehicles.find(v => v.id === vehId);
    if (!matched && fleetVeh?.vehicleProfileId) {
      matched = vehicles.find(v => v.id === fleetVeh.vehicleProfileId);
    }
    // 2. Si no coincide o la categoría no concuerda con el tipo de vehículo detectado
    if (!matched || (isNlr && matched.category !== 'NLR') || (!isNlr && matched.category === 'NLR')) {
      matched = vehicles.find(v => isNlr ? v.category === 'NLR' : v.category === 'NPR');
    }
    // 3. Fallback a VEHICLE_PROFILES estáticos
    if (!matched) {
      matched = isNlr
        ? (VEHICLE_PROFILES.find(v => v.category === 'NLR') || VEHICLE_PROFILES[1])
        : (VEHICLE_PROFILES.find(v => v.category === 'NPR') || VEHICLE_PROFILES[0]);
    }
    return matched;
  }, [activeFleetList, vehicles]);

  // Helper para saber si un despacho corresponde a un camión NLR
  const isDispatchNlr = useCallback((dispatch: TripDispatch) => {
    const cleanPlate = dispatch.vehiclePlate ? dispatch.vehiclePlate.toUpperCase().trim() : '';
    const fleetVeh = activeFleetList.find(fv => fv.plate.toUpperCase().trim() === cleanPlate);
    return fleetVeh?.vehicleType === 'NLR' ||
           fleetVeh?.vehicleProfileId?.toLowerCase().includes('nlr') ||
           cleanPlate.includes('NLR') ||
           (dispatch.vehicleId && dispatch.vehicleId.toLowerCase().includes('nlr'));
  }, [activeFleetList]);

  // Estado para edición directa de parámetros de la ruta seleccionada en el modal de despacho
  const [isEditingSelectedRoute, setIsEditingSelectedRoute] = useState<boolean>(false);
  const [editingRouteForm, setEditingRouteForm] = useState<{
    km: number;
    tollCount: number;
    tollEstimatedCost: number;
    tollEstimatedCostNlr: number;
    viaticosCOP: number;
    freightTariffNpr: number;
    freightTariffNlr: number;
    name: string;
  }>({
    km: 0,
    tollCount: 0,
    tollEstimatedCost: 0,
    tollEstimatedCostNlr: 0,
    viaticosCOP: 0,
    freightTariffNpr: 0,
    freightTariffNlr: 0,
    name: ''
  });

  // Ruta seleccionada actualmente en el despacho
  const currentSelectedRoute = useMemo(() => {
    return routes.find(r => r.id === newDispatchForm.routeId) || routes[0];
  }, [routes, newDispatchForm.routeId]);

  const handleStartEditingRoute = () => {
    if (currentSelectedRoute) {
      setEditingRouteForm({
        km: currentSelectedRoute.km || 0,
        tollCount: currentSelectedRoute.tollCount || 0,
        tollEstimatedCost: currentSelectedRoute.tollEstimatedCost || 0,
        tollEstimatedCostNlr: currentSelectedRoute.tollEstimatedCostNlr !== undefined ? currentSelectedRoute.tollEstimatedCostNlr : currentSelectedRoute.tollEstimatedCost || 0,
        viaticosCOP: currentSelectedRoute.viaticosCOP || 0,
        freightTariffNpr: currentSelectedRoute.freightTariffNpr || 0,
        freightTariffNlr: currentSelectedRoute.freightTariffNlr || currentSelectedRoute.freightTariffNpr || 0,
        name: currentSelectedRoute.name || ''
      });
      setIsEditingSelectedRoute(true);
    }
  };

  const handleSaveInlineRoute = () => {
    if (!currentSelectedRoute) return;
    const updated: DeliveryRoute = {
      ...currentSelectedRoute,
      name: editingRouteForm.name,
      km: Number(editingRouteForm.km) || 0,
      tollCount: Number(editingRouteForm.tollCount) || 0,
      tollEstimatedCost: Number(editingRouteForm.tollEstimatedCost) || 0,
      tollEstimatedCostNlr: Number(editingRouteForm.tollEstimatedCostNlr) || 0,
      viaticosCOP: Number(editingRouteForm.viaticosCOP) || 0,
      freightTariffNpr: Number(editingRouteForm.freightTariffNpr) || 0,
      freightTariffNlr: Number(editingRouteForm.freightTariffNlr) || 0
    };
    if (onUpdateRoute) {
      onUpdateRoute(updated);
    }
    // Sincronizar anticipo con el nuevo viático si fue modificado
    setNewDispatchForm(prev => ({
      ...prev,
      advancePaymentCOP: updated.viaticosCOP || prev.advancePaymentCOP
    }));
    setIsEditingSelectedRoute(false);
  };

  // Handler para abrir nuevo despacho seleccionando automáticamente recursos disponibles en patio y fecha/hora local del equipo
  const handleOpenNewDispatch = () => {
    const availVeh = activeFleetList.find(v => !busyPlatesMap.has(v.plate.toUpperCase().trim()));
    const availDrv = activeDrivers.find(d => !busyDriversMap.has(d.name.trim().toLowerCase()));
    const availHlp = activeHelpers.find(h => !busyHelpersMap.has(h.name.trim().toLowerCase()));

    const selPlate = availVeh?.plate || activeFleetList[0]?.plate || 'GTX052';
    const prof = getVehicleProfileForPlate(selPlate, availVeh?.vehicleProfileId);
    const selRoute = routes[0];

    setIsEditingSelectedRoute(false);
    setNewDispatchForm(prev => ({
      ...prev,
      manifestNumber: `MAN-${Math.floor(1000 + Math.random() * 9000)}`,
      vehiclePlate: selPlate,
      vehicleId: prof.id,
      driverName: availDrv?.name || activeDrivers[0]?.name || prev.driverName,
      driverDocument: availDrv?.document || activeDrivers[0]?.document || prev.driverDocument,
      helperNames: availHlp?.name || activeHelpers[0]?.name || prev.helperNames,
      departureDate: getLocalCurrentDate(),
      departureTime: getLocalCurrentTime(),
      departureOdometer: 142500,
      advancePaymentCOP: selRoute?.viaticosCOP || 50000,
      routeId: selRoute?.id || 'SCJ-001'
    }));
    setIsNewDispatchOpen(true);
  };

  // Handler para abrir despacho pre-seleccionando un camión específico de la flota
  const handleOpenNewDispatchForPlate = (plate: string) => {
    const targetVeh = activeFleetList.find(v => v.plate.toUpperCase().trim() === plate.toUpperCase().trim());
    const availDrv = activeDrivers.find(d => !busyDriversMap.has(d.name.trim().toLowerCase()));
    const availHlp = activeHelpers.find(h => !busyHelpersMap.has(h.name.trim().toLowerCase()));
    const prof = getVehicleProfileForPlate(plate, targetVeh?.vehicleProfileId);
    const selRoute = routes[0];

    setIsEditingSelectedRoute(false);
    setNewDispatchForm(prev => ({
      ...prev,
      manifestNumber: `MAN-${Math.floor(1000 + Math.random() * 9000)}`,
      vehiclePlate: plate,
      vehicleId: prof.id,
      driverName: availDrv?.name || activeDrivers[0]?.name || prev.driverName,
      driverDocument: availDrv?.document || activeDrivers[0]?.document || prev.driverDocument,
      helperNames: availHlp?.name || activeHelpers[0]?.name || prev.helperNames,
      departureDate: getLocalCurrentDate(),
      departureTime: getLocalCurrentTime(),
      departureOdometer: 142500,
      advancePaymentCOP: selRoute?.viaticosCOP || 50000,
      routeId: selRoute?.id || 'SCJ-001'
    }));
    setIsNewDispatchOpen(true);
  };

  // Verificación de disponibilidad de recursos seleccionados
  const isSelectedVehicleBusy = Boolean(newDispatchForm.vehiclePlate && busyPlatesMap.has(newDispatchForm.vehiclePlate.toUpperCase().trim()));
  const busyVehicleTrip = newDispatchForm.vehiclePlate ? busyPlatesMap.get(newDispatchForm.vehiclePlate.toUpperCase().trim()) : null;

  const isSelectedDriverBusy = Boolean(newDispatchForm.driverName && busyDriversMap.has(newDispatchForm.driverName.trim().toLowerCase()));
  const busyDriverTrip = newDispatchForm.driverName ? busyDriversMap.get(newDispatchForm.driverName.trim().toLowerCase()) : null;

  const isSelectedHelperBusy = Boolean(
    newDispatchForm.helpersCount > 0 &&
    newDispatchForm.helperNames &&
    busyHelpersMap.has(newDispatchForm.helperNames.trim().toLowerCase())
  );
  const busyHelperTrip = (newDispatchForm.helpersCount > 0 && newDispatchForm.helperNames)
    ? busyHelpersMap.get(newDispatchForm.helperNames.trim().toLowerCase())
    : null;

  const hasBusyResource = isSelectedVehicleBusy || isSelectedDriverBusy || isSelectedHelperBusy;

  // Si proviene del Mapa con una ruta seleccionada para despachar
  useEffect(() => {
    if (initialDispatchRouteId) {
      const foundRoute = routes.find(r => r.id === initialDispatchRouteId);
      if (foundRoute) {
        setNewDispatchForm(prev => ({
          ...prev,
          routeId: foundRoute.id,
          advancePaymentCOP: foundRoute.viaticosCOP || prev.advancePaymentCOP,
          departureDate: getLocalCurrentDate(),
          departureTime: getLocalCurrentTime()
        }));
      }
      setIsNewDispatchOpen(true);
      if (onClearInitialDispatchRouteId) {
        onClearInitialDispatchRouteId();
      }
    }
  }, [initialDispatchRouteId, routes, onClearInitialDispatchRouteId]);

  // Formulario de Entrada y Liquidación Real (con soporte para combustible por km y variantes editables)
  const [settlementForm, setSettlementForm] = useState({
    returnDate: getLocalCurrentDate(),
    returnTime: getLocalCurrentTime(),
    arrivalOdometer: 0,

    // Combustible: Modo por km rodados vs manual con factura
    fuelMode: 'BY_KM' as 'BY_KM' | 'MANUAL',
    fuelKmPerGallon: 13.5,
    actualFuelPricePerGallon: 10560,
    actualFuelGallons: 0,
    actualFuelCostCOP: 0,
    fuelPaidWithAdvance: false, // true = descontar del efectivo del conductor; false = pagado a crédito con chip EDS

    // Peajes reales editables (con base teórica de la ruta visible)
    actualTollCount: 4,
    actualTollCostCOP: 0,

    // Viáticos reales editables (con base teórica de la ruta visible)
    actualPerDiemCOP: 0,

    // Horas reales de jornada
    actualHoursWorked: 0,

    // Imprevistos, Gastos Adicionales y Bonos en Ruta (Lista dinámica concepto enfrente, valor al otro lado)
    incidentalsList: [] as TripIncidentalItem[],
    actualIncidentalCOP: 0,
    incidentalNotes: '',
    generalNotes: ''
  });

  // Operaciones de gestión sobre la lista dinámica de imprevistos/bonos
  const handleAddIncidental = (concept: string = '', amount: number = 0) => {
    const newItem: TripIncidentalItem = {
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      concept,
      amountCOP: amount
    };
    setSettlementForm(prev => {
      const updatedList = [...prev.incidentalsList, newItem];
      const sum = updatedList.reduce((acc, item) => acc + (Number(item.amountCOP) || 0), 0);
      return {
        ...prev,
        incidentalsList: updatedList,
        actualIncidentalCOP: sum
      };
    });
  };

  const handleUpdateIncidental = (id: string, field: 'concept' | 'amountCOP', value: any) => {
    setSettlementForm(prev => {
      const updatedList = prev.incidentalsList.map(item => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === 'amountCOP' ? (Number(value) || 0) : value
          };
        }
        return item;
      });
      const sum = updatedList.reduce((acc, item) => acc + (Number(item.amountCOP) || 0), 0);
      return {
        ...prev,
        incidentalsList: updatedList,
        actualIncidentalCOP: sum
      };
    });
  };

  const handleRemoveIncidental = (id: string) => {
    setSettlementForm(prev => {
      const updatedList = prev.incidentalsList.filter(item => item.id !== id);
      const sum = updatedList.reduce((acc, item) => acc + (Number(item.amountCOP) || 0), 0);
      return {
        ...prev,
        incidentalsList: updatedList,
        actualIncidentalCOP: sum
      };
    });
  };

  // Calcular presupuesto base para el nuevo despacho según tipo de vehículo (NPR vs NLR)
  const plannedBudget = useMemo(() => {
    const selectedRoute = routes.find(r => r.id === newDispatchForm.routeId) || routes[0];
    const selectedVeh = getVehicleProfileForPlate(newDispatchForm.vehiclePlate, newDispatchForm.vehicleId);

    if (!selectedRoute || !selectedVeh) {
      return {
        plannedKm: 100,
        plannedHours: 4,
        plannedFuelCOP: 100000,
        plannedTollCOP: 30000,
        plannedLaborCOP: 150000,
        plannedMaintenanceCOP: 45000,
        plannedFixedCOP: 60000,
        plannedTotalCostCOP: 385000,
        plannedFreightCOP: 500000,
        plannedNetProfitCOP: 115000,
        plannedMarginPct: 23,
        vehicleCategory: 'NPR' as const,
        vehicleName: 'Camión NPR'
      };
    }

    // Para nuevos despachos, usar siempre la configuración actual
    const b = calculateRouteCost(selectedRoute, selectedVeh, laborConfig);
    const isNlr = selectedVeh.category === 'NLR' || selectedVeh.category === 'NHR';

    // Tarifa flete real según la categoría del camión seleccionado (NLR vs NPR)
    const plannedFreight = b.freightTariff || (isNlr
      ? (selectedRoute.freightTariffNlr || selectedRoute.freightTariffNpr || 0)
      : (selectedRoute.freightTariffNpr || selectedRoute.freightTariffNlr || 0));

    const plannedNetProfit = plannedFreight > 0 ? plannedFreight - b.totalTripCost : 0;
    const plannedMarginPct = plannedFreight > 0 ? (plannedNetProfit / plannedFreight) * 100 : 0;

    return {
      plannedKm: selectedRoute.km,
      plannedHours: b.totalHours,
      plannedFuelCOP: b.fuelCost,
      plannedTollCOP: b.tollCost,
      plannedLaborCOP: b.totalLaborCost,
      plannedMaintenanceCOP: b.totalMaintenanceCost,
      plannedFixedCOP: b.proratedFixedCost,
      plannedTotalCostCOP: b.totalTripCost,
      plannedFreightCOP: plannedFreight,
      plannedNetProfitCOP: plannedNetProfit,
      plannedMarginPct,
      vehicleCategory: selectedVeh.category,
      vehicleName: selectedVeh.name
    };
  }, [newDispatchForm.routeId, newDispatchForm.vehiclePlate, newDispatchForm.vehicleId, routes, getVehicleProfileForPlate, laborConfig]);

  // Manejar creación de despacho (Salida)
  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasBusyResource) {
      alert('No es posible despachar: Uno o más recursos (camión, conductor o auxiliar) ya se encuentran en una ruta activa sin retornar al CEDI.');
      return;
    }
    const route = routes.find(r => r.id === newDispatchForm.routeId) || routes[0];
    const veh = getVehicleProfileForPlate(newDispatchForm.vehiclePlate, newDispatchForm.vehicleId);

    // Generar ID consecutivo seguro basado en el número más alto existente para evitar cualquier sobreescritura o colisión
    const existingNumbers = dispatches
      .map(d => {
        const match = d.id?.match(/^DESP-(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n) && n > 0);

    // Separar números de la secuencia incremental regular (evitando los IDs aleatorios heredados >= 300)
    const threshold = Math.max(200, dispatches.length + 100);
    const sequentialNumbers = existingNumbers.filter(n => n <= threshold);
    const maxSequential = sequentialNumbers.length > 0 ? Math.max(...sequentialNumbers) : 0;

    let candidateNumber = Math.max(maxSequential + 1, dispatches.length + 1);

    // Garantizar que no colisione con absolutamente NINGÚN ID existente (ni secuencial ni heredado)
    while (dispatches.some(d => d.id === `DESP-${String(candidateNumber).padStart(4, '0')}`)) {
      candidateNumber++;
    }

    const nextDispatchId = `DESP-${String(candidateNumber).padStart(4, '0')}`;
    const newDispatch: TripDispatch = {
      id: nextDispatchId,
      manifestNumber: newDispatchForm.manifestNumber,
      createdAt: new Date().toISOString(),
      departureDate: newDispatchForm.departureDate,
      departureTime: newDispatchForm.departureTime,
      status: 'EN_TRANSITO',
      period: getCurrentPeriod(),
      laborConfigSnapshot: { ...laborConfig },
      vehicleId: veh.id,
      vehiclePlate: newDispatchForm.vehiclePlate,
      vehicleName: veh.name,
      driverName: newDispatchForm.driverName,
      driverDocument: newDispatchForm.driverDocument,
      helpersCount: newDispatchForm.helpersCount,
      helperNames: newDispatchForm.helperNames,
      routeId: route?.id || 'CUSTOM',
      routeName: route?.name || 'Ruta Personalizada',
      storesCount: route?.storeIds?.length || 3,
      cargoDescription: newDispatchForm.cargoDescription,
      plannedKm: plannedBudget.plannedKm,
      plannedHours: plannedBudget.plannedHours,
      plannedFuelCOP: plannedBudget.plannedFuelCOP,
      plannedTollCOP: plannedBudget.plannedTollCOP,
      plannedLaborCOP: plannedBudget.plannedLaborCOP,
      plannedMaintenanceCOP: plannedBudget.plannedMaintenanceCOP,
      plannedFixedCOP: plannedBudget.plannedFixedCOP,
      plannedTotalCostCOP: plannedBudget.plannedTotalCostCOP,
      plannedFreightCOP: plannedBudget.plannedFreightCOP,
      departureOdometer: Number(newDispatchForm.departureOdometer),
      advancePaymentCOP: Number(newDispatchForm.advancePaymentCOP)
    };

    saveDispatches([newDispatch, ...dispatches], newDispatch);
    setIsNewDispatchOpen(false);
  };

  // Abrir modal de retorno y liquidación (cargando bases teóricas de peajes, combustible por km, viáticos e imprevistos)
  const handleOpenSettlement = (dispatch: TripDispatch) => {
    setSelectedDispatchForSettlement(dispatch);
    const expectedArrivalOdo = dispatch.departureOdometer + dispatch.plannedKm;

    const veh = vehicles.find(v => v.id === dispatch.vehicleId) || vehicles[0];
    const kmPerGal = veh?.kmPerGallon || 13.5;
    const fuelPrice = veh?.fuelPricePerGallon || 10560;
    const estGallons = Math.round((dispatch.plannedKm / kmPerGal) * 10) / 10;
    const estFuelCost = Math.round(estGallons * fuelPrice);

    const routeObj = routes.find(r => r.id === dispatch.routeId);
    const plannedViaticos = routeObj?.viaticosCOP || dispatch.advancePaymentCOP || 50000;
    const plannedToll = dispatch.plannedTollCOP || routeObj?.tollEstimatedCost || 0;
    const plannedTollCount = routeObj?.tollCount || 4;

    // Cargar imprevistos previos si ya existían o inicializar lista
    let initialIncidentals: TripIncidentalItem[] = [];
    if (dispatch.actualIncidentalsList && dispatch.actualIncidentalsList.length > 0) {
      initialIncidentals = [...dispatch.actualIncidentalsList];
    } else if (dispatch.actualIncidentalCOP && dispatch.actualIncidentalCOP > 0) {
      initialIncidentals = [{
        id: `inc-${Date.now()}`,
        concept: dispatch.incidentalNotes || 'Imprevistos en ruta',
        amountCOP: dispatch.actualIncidentalCOP
      }];
    }

    const initialIncidentalTotal = initialIncidentals.reduce((acc, item) => acc + (Number(item.amountCOP) || 0), 0);

    setSettlementForm({
      returnDate: getLocalCurrentDate(),
      returnTime: getLocalCurrentTime(),
      arrivalOdometer: expectedArrivalOdo,
      fuelMode: 'BY_KM',
      fuelKmPerGallon: kmPerGal,
      actualFuelPricePerGallon: fuelPrice,
      actualFuelGallons: estGallons,
      actualFuelCostCOP: estFuelCost,
      fuelPaidWithAdvance: false,
      actualTollCount: plannedTollCount,
      actualTollCostCOP: plannedToll,
      actualHoursWorked: dispatch.plannedHours,
      actualPerDiemCOP: plannedViaticos,
      actualIncidentalCOP: initialIncidentalTotal,
      incidentalsList: initialIncidentals,
      incidentalNotes: dispatch.incidentalNotes || '',
      generalNotes: dispatch.notes || ''
    });
  };

  // Confirmar liquidación real
  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispatchForSettlement) return;

    const dispatch = selectedDispatchForSettlement;
    const actualKm = Math.max(1, settlementForm.arrivalOdometer - dispatch.departureOdometer);

    // Si el modo es BY_KM, se computa exactamente por kilometraje recorrido y rendimiento del camión
    let actualFuelCost = 0;
    let actualFuelGal = 0;
    if (settlementForm.fuelMode === 'BY_KM') {
      const kpg = settlementForm.fuelKmPerGallon > 0 ? settlementForm.fuelKmPerGallon : 13.5;
      actualFuelGal = Math.round((actualKm / kpg) * 10) / 10;
      actualFuelCost = Math.round(actualFuelGal * settlementForm.actualFuelPricePerGallon);
    } else {
      actualFuelGal = settlementForm.actualFuelGallons;
      actualFuelCost = settlementForm.actualFuelCostCOP > 0
        ? settlementForm.actualFuelCostCOP
        : Math.round(actualFuelGal * settlementForm.actualFuelPricePerGallon);
    }

    const veh = getVehicleProfileForPlate(dispatch.vehiclePlate, dispatch.vehicleId);
    const maintPerKm = veh?.totalMaintenancePerKm || (isDispatchNlr(dispatch) ? 247 : 326);
    const actualMaintenanceCost = actualKm * maintPerKm;

    // Cálculo legal de mano de obra según horario lun-sáb, recargos y calendario festivos Colombia 2026
    const activeSchedule = getStoredWorkSchedule();
    const driverShiftLabor = calculateTripLaborFromSchedule(
      dispatch.departureDate,
      dispatch.departureTime,
      settlementForm.returnDate,
      settlementForm.returnTime,
      laborConfig.hourlyOrdinaryRate || 8000,
      laborConfig.hourlyOvertimeDayRate || 17488,
      laborConfig.hourlyOvertimeNightRate || 23000,
      activeSchedule,
      laborConfig.auxilioTransporteLegal || defaultLaborConfig.auxilioTransporteLegal
    );

    let helperShiftLaborTotal = 0;
    const hasTripHelper = (dispatch.helpersCount && dispatch.helpersCount > 0) || laborConfig.hasHelper;
    if (hasTripHelper) {
      const helperHourlyOrd = laborConfig.helperHourlyOrdinaryRate || Math.round((laborConfig.helperSalary || defaultLaborConfig.smmlv) / (laborConfig.monthlyWorkingHours || defaultLaborConfig.monthlyWorkingHours));
      const helperDayExt = laborConfig.helperOvertimeDayRate || Math.round(helperHourlyOrd * (1 + (activeSchedule.dayOvertimeSurchargeRate ?? 0.25)));
      const helperNightExt = laborConfig.helperOvertimeNightRate || Math.round(helperHourlyOrd * (1 + (activeSchedule.nightOvertimeSurchargeRate ?? 0.75)));
      const helperShift = calculateTripLaborFromSchedule(
        dispatch.departureDate,
        dispatch.departureTime,
        settlementForm.returnDate,
        settlementForm.returnTime,
        helperHourlyOrd,
        helperDayExt,
        helperNightExt,
        activeSchedule,
        laborConfig.auxilioTransporteLegal || defaultLaborConfig.auxilioTransporteLegal
      );
      helperShiftLaborTotal = calculateShiftEmployerCost(helperShift, laborConfig, {
        monthlySalary: laborConfig.helperSalary || defaultLaborConfig.smmlv,
        hourlyOrdRate: helperHourlyOrd,
        dayExtRate: helperDayExt,
        nightExtRate: helperNightExt,
        arlRate: laborConfig.arlRiskLevelRateHelper || laborConfig.arlRiskLevelRate
      }).totalEmployerCostCOP * (dispatch.helpersCount || 1);
    }

    // Costo patronal completo del turno (devengado + prestaciones + seguridad social +
    // parafiscales + auxilio + dotación), con las tarifas de la base de datos y las
    // bases legales correctas. Así la liquidación real es comparable con el
    // presupuesto (misma metodología de costo empresa).
    const driverShiftEmployerCost = calculateShiftEmployerCost(driverShiftLabor, laborConfig, {
      monthlySalary: laborConfig.driverSalary || 2200000,
      hourlyOrdRate: laborConfig.hourlyOrdinaryRate || 8000,
      dayExtRate: laborConfig.hourlyOvertimeDayRate || 17488,
      nightExtRate: laborConfig.hourlyOvertimeNightRate || 23000,
      arlRate: laborConfig.arlRiskLevelRate
    });
    const totalShiftLaborCOP = driverShiftEmployerCost.totalEmployerCostCOP + helperShiftLaborTotal;

    const hoursRatio = settlementForm.actualHoursWorked > 0 && dispatch.plannedHours > 0
      ? settlementForm.actualHoursWorked / dispatch.plannedHours
      : 1;

    const actualLaborCost = totalShiftLaborCOP > 0
      ? totalShiftLaborCOP
      : Math.round(dispatch.plannedLaborCOP * Math.min(2.0, Math.max(0.8, hoursRatio)));

    const actualFixedCost = dispatch.plannedFixedCOP;

    // Suma exacta de imprevistos, adicionales y bonos agregados dinámicamente
    const totalIncidentals = settlementForm.incidentalsList.reduce((acc, item) => acc + (Number(item.amountCOP) || 0), 0);

    // Gasto total real del viaje
    const actualTotalCost =
      actualFuelCost +
      settlementForm.actualTollCostCOP +
      actualLaborCost +
      actualMaintenanceCost +
      actualFixedCost +
      settlementForm.actualPerDiemCOP +
      totalIncidentals;

    // Variación vs Presupuesto (Positivo = Sobrecosto, Negativo = Ahorro)
    const costVariance = actualTotalCost - dispatch.plannedTotalCostCOP;

    // Saldo del conductor: Anticipo - Gastos directos de bolsillo
    const driverFuelExpense = settlementForm.fuelPaidWithAdvance ? actualFuelCost : 0;
    const driverExpenses = driverFuelExpense + settlementForm.actualTollCostCOP + settlementForm.actualPerDiemCOP + totalIncidentals;
    const driverBalance = dispatch.advancePaymentCOP - driverExpenses;

    // Rentabilidad real de la ruta según tarifa del tipo de vehículo
    const routeItem = routes.find(r => r.id === dispatch.routeId);
    const isNlrTrip = isDispatchNlr(dispatch);
    const defaultFreight = isNlrTrip
      ? (routeItem?.freightTariffNlr || routeItem?.freightTariffNpr || 0)
      : (routeItem?.freightTariffNpr || routeItem?.freightTariffNlr || 0);
    const plannedFreight = dispatch.plannedFreightCOP && dispatch.plannedFreightCOP > 0
      ? dispatch.plannedFreightCOP
      : defaultFreight;
    const actualNetProfit = plannedFreight > 0 ? plannedFreight - actualTotalCost : 0;
    const actualMarginPct = plannedFreight > 0 ? (actualNetProfit / plannedFreight) * 100 : 0;
    const holidayCheck = isSundayOrColombianHoliday(dispatch.departureDate);

    // Descripción consolidada de imprevistos y bonos
    const autoIncidentalNote = settlementForm.incidentalsList.length > 0
      ? settlementForm.incidentalsList.map(i => `${i.concept}: ${formatCOP(i.amountCOP)}`).join('; ')
      : settlementForm.incidentalNotes;

    const updatedDispatch: TripDispatch = {
      ...dispatch,
      status: 'LIQUIDADO',
      returnDate: settlementForm.returnDate,
      returnTime: settlementForm.returnTime,
      arrivalOdometer: settlementForm.arrivalOdometer,
      actualKm,
      actualFuelGallons: actualFuelGal,
      actualFuelPricePerGallon: settlementForm.actualFuelPricePerGallon,
      actualFuelCostCOP: actualFuelCost,
      actualTollCount: settlementForm.actualTollCount,
      actualTollCostCOP: settlementForm.actualTollCostCOP,
      actualHoursWorked: settlementForm.actualHoursWorked,
      actualPerDiemCOP: settlementForm.actualPerDiemCOP,
      actualIncidentalCOP: totalIncidentals,
      actualIncidentalsList: settlementForm.incidentalsList,
      incidentalNotes: autoIncidentalNote,
      actualLaborCostCOP: actualLaborCost,
      actualMaintenanceCostCOP: actualMaintenanceCost,
      actualFixedCostCOP: actualFixedCost,
      actualTotalCostCOP: actualTotalCost,
      plannedFreightCOP: plannedFreight,
      actualNetProfitCOP: actualNetProfit,
      actualMarginPct: actualMarginPct,
      isHolidayTrip: holidayCheck.isSpecial,
      costVarianceCOP: costVariance,
      driverBalanceCOP: driverBalance,
      settledAt: new Date().toISOString(),
      notes: settlementForm.generalNotes
    };

    saveDispatches(dispatches.map(d => d.id === dispatch.id ? updatedDispatch : d), updatedDispatch);
    setSelectedDispatchForSettlement(null);
  };

  // Abrir modal de edición integral de un despacho (para modificar datos de salida o liquidación)
  const handleOpenEditDispatch = (dispatch: TripDispatch) => {
    const veh = vehicles.find(v => v.id === dispatch.vehicleId) || vehicles[0];
    const kmPerGal = veh?.kmPerGallon || 13.5;
    const fuelPrice = dispatch.actualFuelPricePerGallon || veh?.fuelPricePerGallon || 10560;

    let incidentals: TripIncidentalItem[] = [];
    if (dispatch.actualIncidentalsList && dispatch.actualIncidentalsList.length > 0) {
      incidentals = [...dispatch.actualIncidentalsList];
    } else if (dispatch.actualIncidentalCOP && dispatch.actualIncidentalCOP > 0) {
      incidentals = [{
        id: `inc-${Date.now()}`,
        concept: dispatch.incidentalNotes || 'Imprevistos en ruta',
        amountCOP: dispatch.actualIncidentalCOP
      }];
    }

    setEditDispatchForm({
      id: dispatch.id,
      manifestNumber: dispatch.manifestNumber,
      status: dispatch.status === 'EN_TRANSITO' ? 'EN_TRANSITO' : 'LIQUIDADO',
      vehiclePlate: dispatch.vehiclePlate,
      vehicleId: dispatch.vehicleId,
      driverName: dispatch.driverName,
      driverDocument: dispatch.driverDocument || '',
      helpersCount: dispatch.helpersCount,
      helperNames: dispatch.helperNames || '',
      routeId: dispatch.routeId,
      departureDate: dispatch.departureDate,
      departureTime: dispatch.departureTime,
      departureOdometer: dispatch.departureOdometer,
      advancePaymentCOP: dispatch.advancePaymentCOP,
      cargoDescription: dispatch.cargoDescription || 'Distribución y entrega oficial de mercancía SCJ',

      returnDate: dispatch.returnDate || getLocalCurrentDate(),
      returnTime: dispatch.returnTime || getLocalCurrentTime(),
      arrivalOdometer: dispatch.arrivalOdometer || (dispatch.departureOdometer + dispatch.plannedKm),
      fuelMode: (dispatch.actualFuelGallons && dispatch.actualFuelGallons > 0 && dispatch.actualFuelCostCOP) ? 'MANUAL' : 'BY_KM',
      fuelKmPerGallon: kmPerGal,
      actualFuelPricePerGallon: fuelPrice,
      actualFuelGallons: dispatch.actualFuelGallons || Math.round(((dispatch.actualKm || dispatch.plannedKm) / kmPerGal) * 10) / 10,
      actualFuelCostCOP: dispatch.actualFuelCostCOP || 0,
      fuelPaidWithAdvance: false,
      actualTollCount: dispatch.actualTollCount || 4,
      actualTollCostCOP: dispatch.actualTollCostCOP || dispatch.plannedTollCOP || 0,
      actualPerDiemCOP: dispatch.actualPerDiemCOP || dispatch.advancePaymentCOP || 0,
      actualHoursWorked: dispatch.actualHoursWorked || dispatch.plannedHours,
      incidentalsList: incidentals,
      incidentalNotes: dispatch.incidentalNotes || '',
      generalNotes: dispatch.notes || ''
    });

    setEditActiveTab(dispatch.status === 'LIQUIDADO' ? 'settlement' : 'departure');
    setEditingDispatch(dispatch);
  };

  // Guardar cambios del despacho editado
  const handleSaveEditedDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDispatch) return;

    const route = routes.find(r => r.id === editDispatchForm.routeId) || routes[0];
    const veh = getVehicleProfileForPlate(editDispatchForm.vehiclePlate, editDispatchForm.vehicleId);
    const isNlr = veh.category === 'NLR' || veh.category === 'NHR';
    const b = calculateRouteCost(route, veh, laborConfig);

    const plannedKm = route.km;
    const plannedHours = b.totalHours;
    const plannedFuelCOP = b.fuelCost;
    const plannedTollCOP = b.tollCost;
    const plannedLaborCOP = b.totalLaborCost;
    const plannedMaintenanceCOP = b.totalMaintenanceCost;
    const plannedFixedCOP = b.proratedFixedCost;
    const plannedTotalCostCOP = b.totalTripCost;
    const plannedFreight = isNlr
      ? (route.freightTariffNlr || route.freightTariffNpr || 0)
      : (route.freightTariffNpr || route.freightTariffNlr || 0);

    if (editDispatchForm.status === 'EN_TRANSITO') {
      const updated: TripDispatch = {
        ...editingDispatch,
        manifestNumber: editDispatchForm.manifestNumber,
        status: 'EN_TRANSITO',
        vehiclePlate: editDispatchForm.vehiclePlate,
        vehicleId: editDispatchForm.vehicleId,
        vehicleName: veh.name,
        driverName: editDispatchForm.driverName,
        driverDocument: editDispatchForm.driverDocument,
        helpersCount: editDispatchForm.helpersCount,
        helperNames: editDispatchForm.helperNames,
        routeId: route.id,
        routeName: route.name,
        storesCount: route.storeIds?.length || 3,
        cargoDescription: editDispatchForm.cargoDescription,
        departureDate: editDispatchForm.departureDate,
        departureTime: editDispatchForm.departureTime,
        departureOdometer: Number(editDispatchForm.departureOdometer),
        advancePaymentCOP: Number(editDispatchForm.advancePaymentCOP),
        plannedKm,
        plannedHours,
        plannedFuelCOP,
        plannedTollCOP,
        plannedLaborCOP,
        plannedMaintenanceCOP,
        plannedFixedCOP,
        plannedTotalCostCOP,
        plannedFreightCOP: plannedFreight,
        // Limpiar retorno si se reabre el viaje a tránsito
        returnDate: undefined,
        returnTime: undefined,
        arrivalOdometer: undefined,
        actualKm: undefined,
        actualFuelGallons: undefined,
        actualFuelCostCOP: undefined,
        actualTollCostCOP: undefined,
        actualPerDiemCOP: undefined,
        actualIncidentalCOP: undefined,
        actualIncidentalsList: undefined,
        actualLaborCostCOP: undefined,
        actualMaintenanceCostCOP: undefined,
        actualFixedCostCOP: undefined,
        actualTotalCostCOP: undefined,
        actualNetProfitCOP: undefined,
        actualMarginPct: undefined,
        costVarianceCOP: undefined,
        driverBalanceCOP: undefined,
        settledAt: undefined
      };

      saveDispatches(dispatches.map(d => d.id === editingDispatch.id ? updated : d), updated);
      if (selectedDispatchForView?.id === editingDispatch.id) {
        setSelectedDispatchForView(null);
      }
      setEditingDispatch(null);
      return;
    }

    // Si está LIQUIDADO: recalcular costos reales
    const depOdo = Number(editDispatchForm.departureOdometer);
    const arrOdo = Math.max(depOdo + 1, Number(editDispatchForm.arrivalOdometer));
    const actualKm = Math.max(1, arrOdo - depOdo);

    let actualFuelCost = 0;
    let actualFuelGal = 0;
    if (editDispatchForm.fuelMode === 'BY_KM') {
      const kpg = editDispatchForm.fuelKmPerGallon > 0 ? editDispatchForm.fuelKmPerGallon : 13.5;
      actualFuelGal = Math.round((actualKm / kpg) * 10) / 10;
      actualFuelCost = Math.round(actualFuelGal * editDispatchForm.actualFuelPricePerGallon);
    } else {
      actualFuelGal = editDispatchForm.actualFuelGallons;
      actualFuelCost = editDispatchForm.actualFuelCostCOP > 0
        ? editDispatchForm.actualFuelCostCOP
        : Math.round(actualFuelGal * editDispatchForm.actualFuelPricePerGallon);
    }

    const maintPerKm = veh?.totalMaintenancePerKm || (isNlr ? 247 : 326);
    const actualMaintenanceCost = actualKm * maintPerKm;

    const activeSchedule = getStoredWorkSchedule();
    const driverShiftLabor = calculateTripLaborFromSchedule(
      editDispatchForm.departureDate,
      editDispatchForm.departureTime,
      editDispatchForm.returnDate,
      editDispatchForm.returnTime,
      laborConfig.hourlyOrdinaryRate || 8000,
      laborConfig.hourlyOvertimeDayRate || 17488,
      laborConfig.hourlyOvertimeNightRate || 23000,
      activeSchedule,
      laborConfig.auxilioTransporteLegal || defaultLaborConfig.auxilioTransporteLegal
    );

    let helperShiftLaborTotal = 0;
    const hasTripHelper = (editDispatchForm.helpersCount && editDispatchForm.helpersCount > 0) || laborConfig.hasHelper;
    if (hasTripHelper) {
      const helperHourlyOrd = laborConfig.helperHourlyOrdinaryRate || Math.round((laborConfig.helperSalary || defaultLaborConfig.smmlv) / (laborConfig.monthlyWorkingHours || defaultLaborConfig.monthlyWorkingHours));
      const helperDayExt = laborConfig.helperOvertimeDayRate || Math.round(helperHourlyOrd * (1 + (activeSchedule.dayOvertimeSurchargeRate ?? 0.25)));
      const helperNightExt = laborConfig.helperOvertimeNightRate || Math.round(helperHourlyOrd * (1 + (activeSchedule.nightOvertimeSurchargeRate ?? 0.75)));
      const helperShift = calculateTripLaborFromSchedule(
        editDispatchForm.departureDate,
        editDispatchForm.departureTime,
        editDispatchForm.returnDate,
        editDispatchForm.returnTime,
        helperHourlyOrd,
        helperDayExt,
        helperNightExt,
        activeSchedule,
        laborConfig.auxilioTransporteLegal || defaultLaborConfig.auxilioTransporteLegal
      );
      helperShiftLaborTotal = calculateShiftEmployerCost(helperShift, laborConfig, {
        monthlySalary: laborConfig.helperSalary || defaultLaborConfig.smmlv,
        hourlyOrdRate: helperHourlyOrd,
        dayExtRate: helperDayExt,
        nightExtRate: helperNightExt,
        arlRate: laborConfig.arlRiskLevelRateHelper || laborConfig.arlRiskLevelRate
      }).totalEmployerCostCOP * (editDispatchForm.helpersCount || 1);
    }

    // Costo patronal completo del turno (devengado + cargos patronales), con las
    // tarifas de la base de datos: comparable con el presupuesto del despacho.
    const driverShiftEmployerCost = calculateShiftEmployerCost(driverShiftLabor, laborConfig, {
      monthlySalary: laborConfig.driverSalary || 2200000,
      hourlyOrdRate: laborConfig.hourlyOrdinaryRate || 8000,
      dayExtRate: laborConfig.hourlyOvertimeDayRate || 17488,
      nightExtRate: laborConfig.hourlyOvertimeNightRate || 23000,
      arlRate: laborConfig.arlRiskLevelRate
    });
    const totalShiftLaborCOP = driverShiftEmployerCost.totalEmployerCostCOP + helperShiftLaborTotal;

    const hoursRatio = editDispatchForm.actualHoursWorked > 0 && plannedHours > 0
      ? editDispatchForm.actualHoursWorked / plannedHours
      : 1;

    const actualLaborCost = totalShiftLaborCOP > 0
      ? totalShiftLaborCOP
      : Math.round(plannedLaborCOP * Math.min(2.0, Math.max(0.8, hoursRatio)));

    const actualFixedCost = plannedFixedCOP;
    const totalIncidentals = editDispatchForm.incidentalsList.reduce((acc, item) => acc + (Number(item.amountCOP) || 0), 0);

    const actualTotalCost =
      actualFuelCost +
      Number(editDispatchForm.actualTollCostCOP) +
      actualLaborCost +
      actualMaintenanceCost +
      actualFixedCost +
      Number(editDispatchForm.actualPerDiemCOP) +
      totalIncidentals;

    const costVariance = actualTotalCost - plannedTotalCostCOP;
    const driverFuelExpense = editDispatchForm.fuelPaidWithAdvance ? actualFuelCost : 0;
    const driverExpenses = driverFuelExpense + Number(editDispatchForm.actualTollCostCOP) + Number(editDispatchForm.actualPerDiemCOP) + totalIncidentals;
    const driverBalance = Number(editDispatchForm.advancePaymentCOP) - driverExpenses;

    const actualNetProfit = plannedFreight > 0 ? plannedFreight - actualTotalCost : 0;
    const actualMarginPct = plannedFreight > 0 ? (actualNetProfit / plannedFreight) * 100 : 0;
    const holidayCheck = isSundayOrColombianHoliday(editDispatchForm.departureDate);

    const autoIncidentalNote = editDispatchForm.incidentalsList.length > 0
      ? editDispatchForm.incidentalsList.map(i => `${i.concept}: ${formatCOP(i.amountCOP)}`).join('; ')
      : editDispatchForm.incidentalNotes;

    const updated: TripDispatch = {
      ...editingDispatch,
      manifestNumber: editDispatchForm.manifestNumber,
      status: 'LIQUIDADO',
      vehiclePlate: editDispatchForm.vehiclePlate,
      vehicleId: editDispatchForm.vehicleId,
      vehicleName: veh.name,
      driverName: editDispatchForm.driverName,
      driverDocument: editDispatchForm.driverDocument,
      helpersCount: editDispatchForm.helpersCount,
      helperNames: editDispatchForm.helperNames,
      routeId: route.id,
      routeName: route.name,
      storesCount: route.storeIds?.length || 3,
      cargoDescription: editDispatchForm.cargoDescription,
      departureDate: editDispatchForm.departureDate,
      departureTime: editDispatchForm.departureTime,
      departureOdometer: depOdo,
      advancePaymentCOP: Number(editDispatchForm.advancePaymentCOP),
      plannedKm,
      plannedHours,
      plannedFuelCOP,
      plannedTollCOP,
      plannedLaborCOP,
      plannedMaintenanceCOP,
      plannedFixedCOP,
      plannedTotalCostCOP,
      plannedFreightCOP: plannedFreight,

      returnDate: editDispatchForm.returnDate,
      returnTime: editDispatchForm.returnTime,
      arrivalOdometer: arrOdo,
      actualKm,
      actualFuelGallons: actualFuelGal,
      actualFuelPricePerGallon: editDispatchForm.actualFuelPricePerGallon,
      actualFuelCostCOP: actualFuelCost,
      actualTollCount: editDispatchForm.actualTollCount,
      actualTollCostCOP: Number(editDispatchForm.actualTollCostCOP),
      actualHoursWorked: Number(editDispatchForm.actualHoursWorked),
      actualPerDiemCOP: Number(editDispatchForm.actualPerDiemCOP),
      actualIncidentalCOP: totalIncidentals,
      actualIncidentalsList: editDispatchForm.incidentalsList,
      incidentalNotes: autoIncidentalNote,
      actualLaborCostCOP: actualLaborCost,
      actualMaintenanceCostCOP: actualMaintenanceCost,
      actualFixedCostCOP: actualFixedCost,
      actualTotalCostCOP: actualTotalCost,
      actualNetProfitCOP: actualNetProfit,
      actualMarginPct: actualMarginPct,
      isHolidayTrip: holidayCheck.isSpecial,
      holidayName: holidayCheck.label,
      costVarianceCOP: costVariance,
      driverBalanceCOP: driverBalance,
      settledAt: editingDispatch.settledAt || new Date().toISOString(),
      notes: editDispatchForm.generalNotes
    };

    saveDispatches(dispatches.map(d => d.id === editingDispatch.id ? updated : d), updated);
    if (selectedDispatchForView?.id === editingDispatch.id) {
      setSelectedDispatchForView(updated);
    }
    setEditingDispatch(null);
  };

  // Eliminar un despacho con confirmación
  const handleDeleteDispatch = (dispatchId: string) => {
    const target = dispatches.find(d => d.id === dispatchId);
    if (!target) return;
    const ok = window.confirm(
      `¿Deseas eliminar permanentemente el registro ${target.id} (Manifiesto: ${target.manifestNumber})?\n\n` +
      `• Camión: ${target.vehiclePlate}\n` +
      `• Conductor: ${target.driverName}\n` +
      `• Ruta: ${target.routeName}\n` +
      `• Estado: ${target.status}\n\n` +
      `Si este camión o conductor estaban en ruta activa, quedarán liberados inmediatamente para nuevos despachos.`
    );
    if (ok) {
      const updated = dispatches.filter(d => d.id !== dispatchId);
      saveDispatches(updated, undefined, dispatchId);
      if (selectedDispatchForView?.id === dispatchId) {
        setSelectedDispatchForView(null);
      }
      if (selectedDispatchForSettlement?.id === dispatchId) {
        setSelectedDispatchForSettlement(null);
      }
      if (editingDispatch?.id === dispatchId) {
        setEditingDispatch(null);
      }
    }
  };

  // Helper de imprevistos para el modal de edición
  const handleEditAddIncidental = (concept: string = '', amount: number = 0) => {
    const newItem: TripIncidentalItem = {
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      concept,
      amountCOP: amount
    };
    setEditDispatchForm(prev => ({
      ...prev,
      incidentalsList: [...prev.incidentalsList, newItem]
    }));
  };

  const handleEditUpdateIncidental = (id: string, field: 'concept' | 'amountCOP', value: any) => {
    setEditDispatchForm(prev => ({
      ...prev,
      incidentalsList: prev.incidentalsList.map(item => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === 'amountCOP' ? (Number(value) || 0) : value
          };
        }
        return item;
      })
    }));
  };

  const handleEditRemoveIncidental = (id: string) => {
    setEditDispatchForm(prev => ({
      ...prev,
      incidentalsList: prev.incidentalsList.filter(item => item.id !== id)
    }));
  };

  // Filtrado de la tabla de despachos (por estado, por camión, por período y por texto)
  const filteredDispatches = useMemo(() => {
    return dispatches.filter(d => {
      const matchesStatus = statusFilter === 'TODOS' || d.status === statusFilter;
      const matchesVehicle = vehicleFilter === 'TODOS' || d.vehiclePlate.toUpperCase().trim() === vehicleFilter.toUpperCase().trim();
      const matchesSearch = searchTerm === '' ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.manifestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.routeName.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por período (mes de cierre)
      let matchesPeriod = true;
      if (periodFilter !== 'ALL') {
        const dispatchPeriod = d.period || d.departureDate?.substring(0, 7) || '';
        matchesPeriod = dispatchPeriod === periodFilter;
      }

      return matchesStatus && matchesVehicle && matchesSearch && matchesPeriod;
    });
  }, [dispatches, statusFilter, vehicleFilter, searchTerm, periodFilter]);

  // Períodos disponibles para el filtro (obtenidos de los despachos existentes)
  const availablePeriods = useMemo(() => {
    const periods = getAvailablePeriods(dispatches.map(d => d.departureDate || ''));
    // Si no hay períodos, mostrar al menos el actual
    if (periods.length === 0) {
      return [getCurrentPeriod()];
    }
    return periods;
  }, [dispatches]);

  // Resumen Métrico de los Despachos Liquidados
  const metrics = useMemo(() => {
    const liquidated = dispatches.filter(d => d.status === 'LIQUIDADO');
    const totalKm = liquidated.reduce((acc, d) => acc + (d.actualKm || 0), 0);
    const totalFuelCOP = liquidated.reduce((acc, d) => acc + (d.actualFuelCostCOP || 0), 0);
    const totalCostCOP = liquidated.reduce((acc, d) => acc + (d.actualTotalCostCOP || 0), 0);
    const totalPlannedCOP = liquidated.reduce((acc, d) => acc + d.plannedTotalCostCOP, 0);
    const totalVarianceCOP = totalCostCOP - totalPlannedCOP;

    const totalFreightCOP = liquidated.reduce((acc, d) => {
      if (d.plannedFreightCOP && d.plannedFreightCOP > 0) return acc + d.plannedFreightCOP;
      const r = routes.find(rt => rt.id === d.routeId);
      const isNlr = isDispatchNlr(d);
      const f = isNlr
        ? (r?.freightTariffNlr || r?.freightTariffNpr || 0)
        : (r?.freightTariffNpr || r?.freightTariffNlr || 0);
      return acc + f;
    }, 0);

    const totalNetProfitCOP = totalFreightCOP - totalCostCOP;
    const profitMarginPct = totalFreightCOP > 0 ? (totalNetProfitCOP / totalFreightCOP) * 100 : 0;

    return {
      totalDispatches: dispatches.length,
      inTransit: dispatches.filter(d => d.status === 'EN_TRANSITO').length,
      liquidatedCount: liquidated.length,
      totalKm,
      totalFuelCOP,
      totalCostCOP,
      totalPlannedCOP,
      totalVarianceCOP,
      totalFreightCOP,
      totalNetProfitCOP,
      profitMarginPct
    };
  }, [dispatches, routes, isDispatchNlr]);

  // Agrupación y desglose de despachos por cada camión de la flota
  const vehicleGroups = useMemo(() => {
    const knownPlates = new Set<string>();
    const groups: Array<{
      plate: string;
      name: string;
      vehicleType: string;
      capacityTons: number;
      isBusy: boolean;
      busyTrip?: TripDispatch | null;
      dispatches: TripDispatch[];
      totalTrips: number;
      inTransitCount: number;
      liquidatedCount: number;
      totalKm: number;
      totalFreightCOP: number;
      totalCostCOP: number;
      totalNetProfitCOP: number;
      marginPct: number;
    }> = [];

    // 1. Vehículos de la flota oficial
    activeFleetList.forEach(fv => {
      const p = fv.plate.toUpperCase().trim();
      knownPlates.add(p);

      // Si hay filtro de vehículo aplicado y no coincide, omitir
      if (vehicleFilter !== 'TODOS' && vehicleFilter.toUpperCase().trim() !== p) {
        return;
      }

      const vehDispatches = filteredDispatches.filter(d => d.vehiclePlate.toUpperCase().trim() === p);
      const isBusy = busyPlatesMap.has(p);
      const busyTrip = isBusy ? busyPlatesMap.get(p) : null;

      const inTransitCount = vehDispatches.filter(d => d.status === 'EN_TRANSITO').length;
      const liquidatedCount = vehDispatches.filter(d => d.status === 'LIQUIDADO').length;
      const totalKm = vehDispatches.reduce((acc, d) => acc + (d.actualKm || d.plannedKm || 0), 0);

      const totalFreightCOP = vehDispatches.reduce((acc, d) => {
        if (d.plannedFreightCOP && d.plannedFreightCOP > 0) return acc + d.plannedFreightCOP;
        const r = routes.find(rt => rt.id === d.routeId);
        const f = fv.vehicleType === 'NLR'
          ? (r?.freightTariffNlr || r?.freightTariffNpr || 0)
          : (r?.freightTariffNpr || r?.freightTariffNlr || 0);
        return acc + f;
      }, 0);

      const totalCostCOP = vehDispatches.reduce((acc, d) => acc + (d.actualTotalCostCOP || d.plannedTotalCostCOP || 0), 0);
      const totalNetProfitCOP = totalFreightCOP - totalCostCOP;
      const marginPct = totalFreightCOP > 0 ? (totalNetProfitCOP / totalFreightCOP) * 100 : 0;

      groups.push({
        plate: fv.plate,
        name: fv.name,
        vehicleType: fv.vehicleType,
        capacityTons: fv.capacityTons,
        isBusy,
        busyTrip,
        dispatches: vehDispatches,
        totalTrips: vehDispatches.length,
        inTransitCount,
        liquidatedCount,
        totalKm,
        totalFreightCOP,
        totalCostCOP,
        totalNetProfitCOP,
        marginPct
      });
    });

    // 2. Otros camiones no registrados en plantilla que tengan viajes
    dispatches.forEach(d => {
      const p = d.vehiclePlate.toUpperCase().trim();
      if (!knownPlates.has(p)) {
        knownPlates.add(p);
        if (vehicleFilter !== 'TODOS' && vehicleFilter.toUpperCase().trim() !== p) {
          return;
        }
        const vehDispatches = filteredDispatches.filter(x => x.vehiclePlate.toUpperCase().trim() === p);
        if (vehDispatches.length === 0 && (searchTerm !== '' || statusFilter !== 'TODOS')) return;

        const isBusy = busyPlatesMap.has(p);
        const busyTrip = isBusy ? busyPlatesMap.get(p) : null;
        const inTransitCount = vehDispatches.filter(x => x.status === 'EN_TRANSITO').length;
        const liquidatedCount = vehDispatches.filter(x => x.status === 'LIQUIDADO').length;
        const totalKm = vehDispatches.reduce((acc, x) => acc + (x.actualKm || x.plannedKm || 0), 0);
        const isNlr = isDispatchNlr(d);
        const totalFreightCOP = vehDispatches.reduce((acc, x) => {
          if (x.plannedFreightCOP && x.plannedFreightCOP > 0) return acc + x.plannedFreightCOP;
          const r = routes.find(rt => rt.id === x.routeId);
          const f = isNlr
            ? (r?.freightTariffNlr || r?.freightTariffNpr || 0)
            : (r?.freightTariffNpr || r?.freightTariffNlr || 0);
          return acc + f;
        }, 0);
        const totalCostCOP = vehDispatches.reduce((acc, x) => acc + (x.actualTotalCostCOP || x.plannedTotalCostCOP || 0), 0);
        const totalNetProfitCOP = totalFreightCOP - totalCostCOP;
        const marginPct = totalFreightCOP > 0 ? (totalNetProfitCOP / totalFreightCOP) * 100 : 0;

        groups.push({
          plate: d.vehiclePlate,
          name: d.vehicleName || 'Vehículo Adicional',
          vehicleType: isNlr ? 'NLR' : 'NPR',
          capacityTons: isNlr ? 3.0 : 4.5,
          isBusy,
          busyTrip,
          dispatches: vehDispatches,
          totalTrips: vehDispatches.length,
          inTransitCount,
          liquidatedCount,
          totalKm,
          totalFreightCOP,
          totalCostCOP,
          totalNetProfitCOP,
          marginPct
        });
      }
    });

    return groups;
  }, [activeFleetList, filteredDispatches, dispatches, vehicleFilter, busyPlatesMap, routes, isDispatchNlr, searchTerm, statusFilter]);

  const toggleVehicleExpand = (plate: string) => {
    setExpandedVehiclePlates(prev => ({
      ...prev,
      [plate]: prev[plate] === undefined ? false : !prev[plate]
    }));
  };

  // Disponibilidad de flota y tripulación en patio CEDI
  const yardAvailability = useMemo(() => {
    const totalVehicles = activeFleetList.length;
    const availableVehicles = activeFleetList.filter(v => !busyPlatesMap.has(v.plate.toUpperCase().trim())).length;
    const busyVehicles = totalVehicles - availableVehicles;

    const totalDrivers = activeDrivers.length;
    const availableDrivers = activeDrivers.filter(d => !busyDriversMap.has(d.name.trim().toLowerCase())).length;
    const busyDrivers = totalDrivers - availableDrivers;

    const totalHelpers = activeHelpers.length;
    const availableHelpers = activeHelpers.filter(h => !busyHelpersMap.has(h.name.trim().toLowerCase())).length;
    const busyHelpers = totalHelpers - availableHelpers;

    return {
      totalVehicles,
      availableVehicles,
      busyVehicles,
      totalDrivers,
      availableDrivers,
      busyDrivers,
      totalHelpers,
      availableHelpers,
      busyHelpers
    };
  }, [busyPlatesMap, busyDriversMap, busyHelpersMap, activeFleetList, activeDrivers, activeHelpers]);

  return (
    <div className="space-y-6">

      {/* Cabecera Principal y Métricas */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm shadow-blue-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Control de Despachos y Liquidación Real por Viaje
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registro de salida del CEDI (odómetro y anticipo) y entrada de retorno (odómetro final, combustible y peajes reales vs presupuesto).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isFirebaseConnected ? (
              <span className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sincronización automática activa</span>
              </span>
            ) : (
              <span className="px-3 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5">
                <CloudOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Modo Local</span>
              </span>
            )}

            <button
              onClick={() => {
                setCloseMonthConfirmText('');
                setShowCloseMonthModal(true);
              }}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Cerrar el mes actual y archivar los despachos con sus precios históricos"
            >
              <Calendar className="w-4 h-4" />
              <span>Cerrar Mes ({formatPeriod(getCurrentPeriod())})</span>
            </button>

            <button
              onClick={() => {
                setCloseYearConfirmText('');
                setShowCloseYearModal(true);
              }}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Cerrar el año actual y archivar todos los despachos del año"
            >
              <Calendar className="w-4 h-4" />
              <span>Cerrar Año ({getCurrentYear()})</span>
            </button>

            <button
              onClick={handleOpenNewDispatch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs shadow-blue-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Salida de Vehículo (Despacho)</span>
            </button>
          </div>
        </div>

        {syncFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* 4 Tarjetas de Métricas Clave (con Flete Facturado y Ganancia Neta Real) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 font-mono">
            <span className="text-[11px] text-slate-500 font-sans block">Despachos Registrados</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{metrics.totalDispatches}</span>
              <span className="text-xs text-amber-700 font-sans font-semibold">({metrics.inTransit} en ruta)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">Flota Oficial SCJ ({yardAvailability.totalVehicles} camiones)</span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 font-mono">
            <span className="text-[11px] text-slate-500 font-sans block">Km Reales Rodados</span>
            <span className="text-2xl font-bold text-slate-900 block mt-1">
              {formatNumber(metrics.totalKm, 0)} km
            </span>
            <span className="text-[10px] text-slate-400 font-sans">Por odómetro verificado en patio</span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 font-mono">
            <span className="text-[11px] text-slate-500 font-sans block">Flete Facturado (Ingresos)</span>
            <span className="text-xl font-bold text-emerald-800 block mt-1">
              {formatCOP(metrics.totalFreightCOP)}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-emerald-700 font-sans font-bold">
                Ganancia Neta: {formatCOP(metrics.totalNetProfitCOP)}
              </span>
              <span className="text-[9px] text-slate-400">({metrics.profitMarginPct.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 font-mono">
            <span className="text-[11px] text-slate-500 font-sans block">Gasto Real Liquidado</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-blue-900">{formatCOP(metrics.totalCostCOP)}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {metrics.totalVarianceCOP <= 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span className={`text-[10px] font-sans font-bold ${metrics.totalVarianceCOP <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {metrics.totalVarianceCOP <= 0 ? 'Ahorro ' : 'Sobrecosto '}{formatCOP(Math.abs(metrics.totalVarianceCOP))}
              </span>
            </div>
          </div>
        </div>

        {/* Tira Informativa de Disponibilidad Física en Patio CEDI */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Disponibilidad Física en Patio CEDI Caldas:</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-600">Camiones:</span>
              <span className="font-mono font-bold text-slate-900">
                {yardAvailability.availableVehicles}/{yardAvailability.totalVehicles}
              </span>
              <span className="text-[10px] text-slate-400">
                ({yardAvailability.busyVehicles > 0 ? `${yardAvailability.busyVehicles} en ruta` : 'todos en patio'})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-600">Conductores:</span>
              <span className="font-mono font-bold text-slate-900">
                {yardAvailability.availableDrivers}/{yardAvailability.totalDrivers}
              </span>
              <span className="text-[10px] text-slate-400">
                ({yardAvailability.busyDrivers > 0 ? `${yardAvailability.busyDrivers} en ruta` : 'todos en patio'})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-slate-600">Auxiliares:</span>
              <span className="font-mono font-bold text-slate-900">
                {yardAvailability.availableHelpers}/{yardAvailability.totalHelpers}
              </span>
              <span className="text-[10px] text-slate-400">
                ({yardAvailability.busyHelpers > 0 ? `${yardAvailability.busyHelpers} en ruta` : 'todos en patio'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Filtros, Vistas y Búsqueda */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

          {/* Selector de Modo de Vista: Vista Plana vs Desglose por Vehículo */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('flat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'flat'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mostrar todos los despachos en una lista continua"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Todos los Registros</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grouped'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Agrupar y desglosar despachos y rentabilidad por cada camión de la flota"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Desglosar por Vehículo</span>
              </button>
            </div>

            {/* Filtros de Estado */}
            <div className="flex items-center gap-1 flex-wrap">
              {['TODOS', 'EN_TRANSITO', 'LIQUIDADO'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === status
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  {status === 'TODOS' && 'Todos los Estados'}
                  {status === 'EN_TRANSITO' && '🚚 En Tránsito'}
                  {status === 'LIQUIDADO' && '📜 Liquidados'}
                </button>
              ))}

              {/* Filtro por Período (Mes) */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => setShowPeriodSelector(!showPeriodSelector)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    periodFilter !== 'ALL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                  title="Filtrar por mes de cierre"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {periodFilter === 'ALL' ? 'Todos los Meses' : formatPeriod(periodFilter)}
                </button>

                {showPeriodSelector && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 min-w-[180px] overflow-hidden">
                    <button
                      onClick={() => { setPeriodFilter('ALL'); setShowPeriodSelector(false); }}
                      className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors ${
                        periodFilter === 'ALL' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                      }`}
                    >
                      Todos los Meses
                    </button>
                    {availablePeriods.map(period => (
                      <button
                        key={period}
                        onClick={() => { setPeriodFilter(period); setShowPeriodSelector(false); }}
                        className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between ${
                          periodFilter === period ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                        }`}
                      >
                        <span>{formatPeriod(period)}</span>
                        {isPeriodClosed(period) && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold">
                            CERRADO
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Búsqueda y Selector Rápido de Vehículo */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-52">
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="TODOS">Flota Completa (Todos)</option>
                {activeFleetList.map(v => (
                  <option key={v.plate} value={v.plate}>
                    {v.plate} — {v.name} ({v.vehicleType})
                  </option>
                ))}
              </select>
              <Truck className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por placa, chofer o ruta..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Tira de chips rápidos de camiones de la flota */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Filtrar móvil:</span>
          <button
            type="button"
            onClick={() => setVehicleFilter('TODOS')}
            className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
              vehicleFilter === 'TODOS'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            TODOS ({activeFleetList.length})
          </button>
          {activeFleetList.map(v => {
            const isSelected = vehicleFilter === v.plate;
            const tripCount = dispatches.filter(d => d.vehiclePlate.toUpperCase().trim() === v.plate.toUpperCase().trim()).length;
            const isBusy = busyPlatesMap.has(v.plate.toUpperCase().trim());
            return (
              <button
                key={v.plate}
                type="button"
                onClick={() => setVehicleFilter(isSelected ? 'TODOS' : v.plate)}
                className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 border cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 hover:bg-blue-50 border-slate-200'
                }`}
              >
                <span>{v.plate}</span>
                <span className={`text-[9px] px-1 rounded ${
                  isSelected ? 'bg-blue-800 text-white' : v.vehicleType === 'NLR' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {v.vehicleType}
                </span>
                <span className="text-[10px] text-slate-400">({tripCount})</span>
                {isBusy && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="En ruta" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Renderizado de Fila de Despacho (Reutilizable para tabla corrida y agrupada) */}
      {(() => {
        const renderDispatchRow = (dispatch: TripDispatch) => {
          const isNlr = isDispatchNlr(dispatch);
          const routeObj = routes.find(r => r.id === dispatch.routeId);
          const effectiveFreight = dispatch.plannedFreightCOP && dispatch.plannedFreightCOP > 0
            ? dispatch.plannedFreightCOP
            : (isNlr
              ? (routeObj?.freightTariffNlr || routeObj?.freightTariffNpr || 0)
              : (routeObj?.freightTariffNpr || routeObj?.freightTariffNlr || 0));

          const estProfit = dispatch.status === 'LIQUIDADO'
            ? (dispatch.actualNetProfitCOP !== undefined ? dispatch.actualNetProfitCOP : (effectiveFreight - (dispatch.actualTotalCostCOP || 0)))
            : (effectiveFreight - dispatch.plannedTotalCostCOP);
          const estMargin = effectiveFreight > 0 ? (estProfit / effectiveFreight) * 100 : 0;

          return (
            <tr key={dispatch.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-3 font-mono font-bold text-slate-900">
                {dispatch.id}
                <span className="text-[10px] text-slate-500 font-mono block">
                  {dispatch.manifestNumber}
                </span>
              </td>

              <td className="py-3 px-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded font-mono font-bold text-[10px]">
                    {dispatch.vehiclePlate}
                  </span>
                  <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                    isNlr ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {isNlr ? 'NLR' : 'NPR'}
                  </span>
                  <span className="font-semibold text-slate-900 truncate max-w-[120px]">
                    {dispatch.driverName}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  {dispatch.vehicleName} {dispatch.helpersCount > 0 ? `+ ${dispatch.helpersCount} aux` : ''}
                </span>
              </td>

              <td className="py-3 px-3">
                <span className="font-semibold text-slate-900 block truncate max-w-xs">
                  {dispatch.routeName}
                </span>
                <span className="text-[10px] text-slate-400">
                  {dispatch.storesCount} tiendas • Anticipo: {formatCOP(dispatch.advancePaymentCOP)}
                </span>
              </td>

              <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                <div>Sal: {dispatch.departureDate} {dispatch.departureTime}</div>
                {dispatch.returnDate ? (
                  <div className="text-emerald-700">Ret: {dispatch.returnDate} {dispatch.returnTime}</div>
                ) : (
                  <div className="text-amber-600 italic">En tránsito...</div>
                )}
              </td>

              <td className="py-3 px-3 text-right font-mono">
                {dispatch.status === 'LIQUIDADO' ? (
                  <div>
                    <span className="font-bold text-slate-900">{formatNumber(dispatch.actualKm || 0, 0)} km</span>
                    <span className="text-[10px] text-slate-400 block">
                      {formatNumber(dispatch.departureOdometer, 0)} → {formatNumber(dispatch.arrivalOdometer || 0, 0)}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-600">{formatNumber(dispatch.plannedKm, 0)} km teóricos</span>
                    <span className="text-[10px] text-slate-400 block">Ini: {formatNumber(dispatch.departureOdometer, 0)}</span>
                  </div>
                )}
              </td>

              <td className="py-3 px-3 text-right font-mono">
                <span className="text-slate-900 font-bold block">{formatCOP(dispatch.plannedTotalCostCOP)}</span>
                <span className="text-[10px] text-blue-700 font-sans block">
                  Flete ({isNlr ? 'NLR' : 'NPR'}): {formatCOP(effectiveFreight)}
                </span>
              </td>

              <td className="py-3 px-3 text-right font-mono">
                {dispatch.status === 'LIQUIDADO' ? (
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {formatCOP(dispatch.actualTotalCostCOP || 0)}
                    </span>
                    <span className={`text-[10px] block font-bold ${estProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      Ganancia: {formatCOP(estProfit)} ({estMargin.toFixed(1)}%)
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-400 italic text-[11px] block">Pendiente retorno</span>
                    <span className="text-[10px] text-blue-600 block">
                      Est. Gan: {formatCOP(estProfit)} ({estMargin.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </td>

              <td className="py-3 px-3 text-center">
                {dispatch.status === 'EN_TRANSITO' && (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    En Tránsito
                  </span>
                )}
                {dispatch.status === 'LIQUIDADO' && (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-700" />
                    Liquidado
                  </span>
                )}
              </td>

              <td className="py-3 px-3 text-center">
                <div className="flex items-center justify-center gap-1.5 flex-nowrap">
                  {dispatch.status === 'EN_TRANSITO' ? (
                    <button
                      onClick={() => handleOpenSettlement(dispatch)}
                      className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer"
                      title="Registrar retorno al CEDI y liquidar caso"
                    >
                      <span>Cerrar Caso</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedDispatchForView(dispatch)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-300 transition-colors shrink-0 cursor-pointer"
                      title="Ver liquidación final con ganancia neta y balance del conductor"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>Ver Liquidación</span>
                    </button>
                  )}

                  {/* Botón Editar Registro */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditDispatch(dispatch)}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-300 transition-colors shadow-2xs shrink-0 flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title="Editar datos de este despacho, odómetro o gastos reales"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Editar</span>
                  </button>

                  {/* Botón Eliminar Registro */}
                  <button
                    type="button"
                    onClick={() => handleDeleteDispatch(dispatch.id)}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-300 transition-colors shadow-2xs shrink-0 flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title="Eliminar este registro permanentemente"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </td>
            </tr>
          );
        };

        // VISTA 1: VISTA PLANA CONTINUA (TODOS LOS REGISTROS)
        if (viewMode === 'flat') {
          return (
            <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200/80">
                      <th className="py-3 px-3">Planilla / Despacho</th>
                      <th className="py-3 px-3">Vehículo & Conductor</th>
                      <th className="py-3 px-3">Ruta Asignada</th>
                      <th className="py-3 px-3">Salida & Retorno</th>
                      <th className="py-3 px-3 text-right">Odómetro (Km)</th>
                      <th className="py-3 px-3 text-right">Presupuesto</th>
                      <th className="py-3 px-3 text-right">Liquidación Real</th>
                      <th className="py-3 px-3 text-center">Estado</th>
                      <th className="py-3 px-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDispatches.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 px-4 text-center">
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
                              <Truck className="w-6 h-6" />
                            </div>
                            <div className="text-sm font-bold text-slate-800">
                              {statusFilter === 'EN_TRANSITO' && 'No hay camiones en tránsito en este momento'}
                              {statusFilter === 'LIQUIDADO' && 'No hay viajes cerrados en el historial'}
                              {statusFilter === 'TODOS' && 'No hay despachos registrados actualmente'}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {statusFilter === 'EN_TRANSITO' && 'Para autorizar una salida de la flota, registrar el odómetro inicial y entregar el anticipo al conductor, pulsa el botón a continuación.'}
                              {statusFilter === 'LIQUIDADO' && 'Cuando un camión retorne de ruta y se liquide su caso con odómetro final, combustible y peajes, quedará guardado permanentemente aquí.'}
                              {statusFilter === 'TODOS' && 'El sistema está listo para operar exclusivamente con los datos reales del archivo Excel: la flota vehicular y el personal activo de nómina. Registra la primera operación real.'}
                            </p>
                            <button
                              onClick={handleOpenNewDispatch}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs shadow-blue-500/20 transition-colors cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Registrar Salida de Vehículo (Despacho)</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredDispatches.map(renderDispatchRow)
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        // VISTA 2: AGRUPADA Y DESGLOSADA POR VEHÍCULO
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span>
                Mostrando desglose individual para <strong>{vehicleGroups.length} camiones</strong> de la flota:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allOpen: Record<string, boolean> = {};
                    vehicleGroups.forEach(g => { allOpen[g.plate] = true; });
                    setExpandedVehiclePlates(allOpen);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Expandir Todos
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    const allClosed: Record<string, boolean> = {};
                    vehicleGroups.forEach(g => { allClosed[g.plate] = false; });
                    setExpandedVehiclePlates(allClosed);
                  }}
                  className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Colapsar Todos
                </button>
              </div>
            </div>

            {vehicleGroups.map(group => {
              const isExpanded = expandedVehiclePlates[group.plate] !== false;
              const isNlr = group.vehicleType === 'NLR';

              return (
                <div
                  key={group.plate}
                  className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden transition-all"
                >
                  {/* Encabezado del Camión */}
                  <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-mono font-black text-sm tracking-wide shadow-2xs">
                          {group.plate}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isNlr ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}>
                          {isNlr ? '🚐 NLR (Liviano / 3.0 Ton)' : '🚚 NPR (Turbo / 4.5 Ton)'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{group.name}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          {group.isBusy ? (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              <span>En ruta activa: Manifiesto <strong>{group.busyTrip?.manifestNumber}</strong> ({group.busyTrip?.routeName})</span>
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Disponible en patio CEDI Caldas</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones y Resumen Rápido */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleOpenNewDispatchForPlate(group.plate)}
                        disabled={group.isBusy}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          group.isBusy
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                        title={group.isBusy ? 'Camión en tránsito: debe retornar antes de despacharse nuevamente' : `Programar nueva salida para el camión ${group.plate}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{group.isBusy ? 'En Ruta Activa' : 'Nueva Salida'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleVehicleExpand(group.plate)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title={isExpanded ? 'Colapsar detalles de este camión' : 'Ver viajes y liquidaciones de este camión'}
                      >
                        <span>{group.dispatches.length} viajes</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Fila de Métricas Consolidadas del Camión */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-white border-b border-slate-100 text-xs font-mono">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 font-sans block">Viajes Registrados:</span>
                      <span className="font-bold text-slate-900 text-sm">{group.totalTrips}</span>
                      <span className="text-[9px] text-slate-400 font-sans block">
                        {group.inTransitCount > 0 ? `${group.inTransitCount} en ruta · ` : ''}{group.liquidatedCount} cerrados
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 font-sans block">Km Rodados:</span>
                      <span className="font-bold text-slate-900 text-sm">{formatNumber(group.totalKm, 0)} km</span>
                      <span className="text-[9px] text-slate-400 font-sans block">Odómetro acumulado</span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 font-sans block">Fletes Facturados ({isNlr ? 'NLR' : 'NPR'}):</span>
                      <span className="font-bold text-blue-900 text-sm">{formatCOP(group.totalFreightCOP)}</span>
                      <span className="text-[9px] text-slate-400 font-sans block">Tarifa comercial cliente</span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 font-sans block">Costos Operativos:</span>
                      <span className="font-bold text-rose-800 text-sm">{formatCOP(group.totalCostCOP)}</span>
                      <span className="text-[9px] text-slate-400 font-sans block">ACPM + peajes + mano obra</span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-500 font-sans block">Ganancia Neta:</span>
                      <span className={`font-bold text-sm block ${group.totalNetProfitCOP >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatCOP(group.totalNetProfitCOP)}
                      </span>
                      <span className="text-[9px] text-emerald-700 font-bold font-sans block">
                        {group.marginPct.toFixed(1)}% Margen
                      </span>
                    </div>
                  </div>

                  {/* Tabla Expandible de Despachos de este Camión */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      {group.dispatches.length === 0 ? (
                        <div className="py-6 px-4 text-center bg-slate-50/40 text-xs text-slate-500">
                          <p className="font-medium text-slate-700">No hay despachos registrados para el camión {group.plate} con los filtros activos.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Puedes registrar una salida asignándole una ruta y tripulación de nómina.</p>
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs border-collapse font-sans">
                          <thead>
                            <tr className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200/80">
                              <th className="py-2.5 px-3">Planilla / Despacho</th>
                              <th className="py-2.5 px-3">Vehículo & Conductor</th>
                              <th className="py-2.5 px-3">Ruta Asignada</th>
                              <th className="py-2.5 px-3">Salida & Retorno</th>
                              <th className="py-2.5 px-3 text-right">Odómetro (Km)</th>
                              <th className="py-2.5 px-3 text-right">Presupuesto</th>
                              <th className="py-2.5 px-3 text-right">Liquidación Real</th>
                              <th className="py-2.5 px-3 text-center">Estado</th>
                              <th className="py-2.5 px-3 text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.dispatches.map(renderDispatchRow)}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* MODAL 1: REGISTRAR NUEVO DESPACHO (SALIDA) */}
      {isNewDispatchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-700" />
                  Registro de Salidas de SCJ
                </h2>
                <p className="text-xs text-slate-500">
                  Asigna camión, tripulación, ruta y registra el odómetro inicial de salida.
                </p>
              </div>
              <button onClick={() => setIsNewDispatchOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-4 text-xs">
              {/* Sección 1: Información del Viaje */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Información del Viaje
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nº Manifiesto / Remisión:</label>
                    <input
                      type="text"
                      required
                      value={newDispatchForm.manifestNumber}
                      onChange={(e) => setNewDispatchForm({ ...newDispatchForm, manifestNumber: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">Fecha de Salida:</label>
                      <button
                        type="button"
                        onClick={() => setNewDispatchForm(prev => ({ ...prev, departureDate: getLocalCurrentDate() }))}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                      >
                        Hoy
                      </button>
                    </div>
                    <input
                      type="date"
                      required
                      value={newDispatchForm.departureDate}
                      onChange={(e) => setNewDispatchForm({ ...newDispatchForm, departureDate: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">Hora de Salida:</label>
                      <button
                        type="button"
                        onClick={() => setNewDispatchForm(prev => ({ ...prev, departureTime: getLocalCurrentTime() }))}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                      >
                        Ahora
                      </button>
                    </div>
                    <input
                      type="time"
                      required
                      value={newDispatchForm.departureTime}
                      onChange={(e) => setNewDispatchForm({ ...newDispatchForm, departureTime: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Vehículo */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  Vehículo
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">Seleccionar Camión:</label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {yardAvailability.availableVehicles}/{yardAvailability.totalVehicles} en patio
                      </span>
                    </div>
                    <select
                      value={newDispatchForm.vehiclePlate}
                      onChange={(e) => {
                        const plate = e.target.value;
                        const found = activeFleetList.find(fv => fv.plate.toUpperCase().trim() === plate.toUpperCase().trim());
                        if (found) {
                          const isFoundNlr = found.vehicleType === 'NLR' || (found.vehicleProfileId && found.vehicleProfileId.toLowerCase().includes('nlr'));
                          setNewDispatchForm({
                            ...newDispatchForm,
                            vehiclePlate: found.plate,
                            vehicleId: found.vehicleProfileId || (isFoundNlr ? 'nlr-camioneta' : 'npr-c2-turbo')
                          });
                        } else {
                          setNewDispatchForm({ ...newDispatchForm, vehiclePlate: plate });
                        }
                      }}
                      className={`w-full px-3 py-1.5 border rounded-lg font-medium text-slate-900 ${
                        isSelectedVehicleBusy
                          ? 'border-rose-400 bg-rose-50/80 text-rose-950'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {activeFleetList.map(v => {
                        const isBusy = busyPlatesMap.has(v.plate.toUpperCase().trim());
                        const busyTrip = isBusy ? busyPlatesMap.get(v.plate.toUpperCase().trim()) : null;
                        const typeLabel = v.vehicleType || (v.plate.includes('NLR') ? 'NLR' : 'NPR');
                        const tons = v.capacityTons || (typeLabel === 'NLR' ? 3.0 : 4.5);
                        return (
                          <option key={v.plate} value={v.plate} disabled={isBusy}>
                            {isBusy
                              ? `[EN RUTA] ${v.plate} — ${v.name}`
                              : `[DISPONIBLE] ${v.plate} — ${v.name} [${typeLabel} · ${tons} Ton]`}
                          </option>
                        );
                      })}
                      <option value="OTRO">-- Otro Vehículo Personalizado --</option>
                    </select>
                    {isSelectedVehicleBusy && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Camión no disponible: En ruta activa <strong>{busyVehicleTrip?.manifestNumber}</strong> ({busyVehicleTrip?.routeName}).</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Placa Confirmada:</label>
                    <input
                      type="text"
                      required
                      value={newDispatchForm.vehiclePlate}
                      onChange={(e) => {
                        const pl = e.target.value.toUpperCase();
                        const found = activeFleetList.find(fv => fv.plate.toUpperCase().trim() === pl.trim());
                        if (found) {
                          const isFoundNlr = found.vehicleType === 'NLR' || (found.vehicleProfileId && found.vehicleProfileId.toLowerCase().includes('nlr'));
                          setNewDispatchForm({
                            ...newDispatchForm,
                            vehiclePlate: pl,
                            vehicleId: found.vehicleProfileId || (isFoundNlr ? 'nlr-camioneta' : 'npr-c2-turbo')
                          });
                        } else {
                          setNewDispatchForm({ ...newDispatchForm, vehiclePlate: pl });
                        }
                      }}
                      placeholder="Ej: GTX052"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold uppercase"
                    />
                    <div className="flex items-center justify-between text-[10px] mt-1">
                      <span className="text-slate-400">Identificador físico del camión</span>
                      <span className={`font-bold px-1.5 py-0.2 rounded ${
                        plannedBudget.vehicleCategory === 'NLR'
                          ? 'text-amber-800 bg-amber-100/80 border border-amber-200'
                          : 'text-blue-800 bg-blue-100/80 border border-blue-200'
                      }`}>
                        {plannedBudget.vehicleCategory === 'NLR' ? 'Perfil: NLR Liviano (31 km/gal)' : 'Perfil: NPR Turbo (22.5 km/gal)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 3: Tripulación */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Tripulación
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">Conductor:</label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {yardAvailability.availableDrivers}/{yardAvailability.totalDrivers} disp.
                      </span>
                    </div>
                    <select
                      value={newDispatchForm.driverName}
                      onChange={(e) => {
                        const name = e.target.value;
                        const foundDrv = activeDrivers.find(d => d.name === name);
                        setNewDispatchForm({
                          ...newDispatchForm,
                          driverName: name,
                          driverDocument: foundDrv?.document || ''
                        });
                      }}
                      className={`w-full px-3 py-1.5 border rounded-lg font-medium text-slate-900 ${
                        isSelectedDriverBusy
                          ? 'border-rose-400 bg-rose-50/80 text-rose-950'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {activeDrivers.map(d => {
                        const isBusy = busyDriversMap.has(d.name.trim().toLowerCase());
                        return (
                          <option key={d.id} value={d.name} disabled={isBusy}>
                            {isBusy ? `[EN RUTA] ${d.name}` : `[DISPONIBLE] ${d.name} (CC ${d.document})`}
                          </option>
                        );
                      })}
                    </select>
                    {isSelectedDriverBusy && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Conductor no disponible: En ruta activa <strong>{busyDriverTrip?.manifestNumber}</strong>.</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Auxiliares:</label>
                    <select
                      value={newDispatchForm.helpersCount}
                      onChange={(e) => setNewDispatchForm({ ...newDispatchForm, helpersCount: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value={1}>1 Auxiliar</option>
                      <option value={0}>0 Auxiliares</option>
                      <option value={2}>2 Auxiliares</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">Auxiliar:</label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {yardAvailability.availableHelpers}/{yardAvailability.totalHelpers} disp.
                      </span>
                    </div>
                    <select
                      value={newDispatchForm.helperNames}
                      onChange={(e) => setNewDispatchForm({ ...newDispatchForm, helperNames: e.target.value })}
                      className={`w-full px-3 py-1.5 border rounded-lg font-medium text-slate-900 ${
                        isSelectedHelperBusy
                          ? 'border-rose-400 bg-rose-50/80 text-rose-950'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {activeHelpers.map(h => {
                        const isBusy = busyHelpersMap.has(h.name.trim().toLowerCase());
                        return (
                          <option key={h.id} value={h.name} disabled={isBusy}>
                            {isBusy ? `[EN RUTA] ${h.name}` : `[DISPONIBLE] ${h.name} (CC ${h.document})`}
                          </option>
                        );
                      })}
                      <option value="">Ninguno</option>
                    </select>
                    {isSelectedHelperBusy && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Auxiliar no disponible: En ruta activa <strong>{busyHelperTrip?.manifestNumber}</strong>.</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 4: Ruta */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  Ruta Asignada
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="font-semibold text-slate-700">Ruta Maestra:</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isEditingSelectedRoute) {
                          handleStartEditingRoute();
                        } else {
                          setIsEditingSelectedRoute(false);
                        }
                      }}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-300 text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-amber-700" />
                      <span>{isEditingSelectedRoute ? 'Ocultar Edición' : 'Editar Datos'}</span>
                    </button>
                    {onEditRoute && currentSelectedRoute && (
                      <button
                        type="button"
                        onClick={() => onEditRoute(currentSelectedRoute)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                        <span className="hidden sm:inline">Editor Maestro</span>
                      </button>
                    )}
                  </div>
                </div>
                <select
                  value={newDispatchForm.routeId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const foundRoute = routes.find(r => r.id === selId);
                    setNewDispatchForm({
                      ...newDispatchForm,
                      routeId: selId,
                      advancePaymentCOP: foundRoute?.viaticosCOP || newDispatchForm.advancePaymentCOP
                    });
                    if (isEditingSelectedRoute && foundRoute) {
                      setEditingRouteForm({
                        km: foundRoute.km || 0,
                        tollCount: foundRoute.tollCount || 0,
                        tollEstimatedCost: foundRoute.tollEstimatedCost || 0,
                        tollEstimatedCostNlr: foundRoute.tollEstimatedCostNlr !== undefined ? foundRoute.tollEstimatedCostNlr : foundRoute.tollEstimatedCost || 0,
                        viaticosCOP: foundRoute.viaticosCOP || 0,
                        freightTariffNpr: foundRoute.freightTariffNpr || 0,
                        freightTariffNlr: foundRoute.freightTariffNlr || foundRoute.freightTariffNpr || 0,
                        name: foundRoute.name || ''
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 bg-white focus:ring-1 focus:ring-blue-600"
                >
                  {routes.map(r => {
                    const isNlrSel = plannedBudget.vehicleCategory === 'NLR';
                    const activeFreight = isNlrSel
                      ? (r.freightTariffNlr || r.freightTariffNpr || 0)
                      : (r.freightTariffNpr || r.freightTariffNlr || 0);
                    const nprF = r.freightTariffNpr || 0;
                    const nlrF = r.freightTariffNlr || 0;
                    const hasDiff = nprF > 0 && nlrF > 0 && nprF !== nlrF;
                    return (
                      <option key={r.id} value={r.id}>
                        {r.id}: {r.name} ({r.km} km, flete {plannedBudget.vehicleCategory}: {formatCOP(activeFreight)}, viático: {formatCOP(r.viaticosCOP || 0)}){hasDiff ? ` [NPR: ${formatCOP(nprF)} | NLR: ${formatCOP(nlrF)}]` : ''}
                      </option>
                    );
                  })}
                </select>

                {/* Panel de Edición Rápida de la Ruta Seleccionada */}
                {isEditingSelectedRoute && currentSelectedRoute && (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3 animate-in fade-in duration-150 shadow-xs">
                    <div className="flex items-center justify-between border-b border-amber-200/90 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                        <Edit3 className="w-4 h-4 text-amber-700" />
                        <span>Edición Rápida de Ruta: <strong className="font-mono text-amber-900">{currentSelectedRoute.id}</strong></span>
                      </div>
                      <span className="text-[10px] text-amber-800 font-medium">
                        Actualiza valores para este despacho y la matriz general
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Nombre / Trayecto de la Ruta:</label>
                        <input
                          type="text"
                          value={editingRouteForm.name}
                          onChange={(e) => setEditingRouteForm({ ...editingRouteForm, name: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Distancia Total (Km):</label>
                        <input
                          type="number"
                          min={1}
                          value={editingRouteForm.km}
                          onChange={(e) => setEditingRouteForm({ ...editingRouteForm, km: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold bg-white text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-purple-800 block mb-1">Viáticos Oficiales Ruta ($ COP):</label>
                        <input
                          type="number"
                          step={5000}
                          value={editingRouteForm.viaticosCOP}
                          onChange={(e) => setEditingRouteForm({ ...editingRouteForm, viaticosCOP: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 border border-purple-300 rounded-lg font-mono font-bold text-purple-900 bg-white"
                        />
                      </div>

                      {/* Parámetros para Camión NPR */}
                      <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 space-y-2">
                        <span className="text-[10px] font-bold text-blue-900 uppercase block tracking-wider">🚚 Valores para Camión NPR (Turbo C2)</span>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">Tarifa Flete NPR ($ COP):</label>
                          <input
                            type="number"
                            step={10000}
                            value={editingRouteForm.freightTariffNpr}
                            onChange={(e) => setEditingRouteForm({ ...editingRouteForm, freightTariffNpr: Number(e.target.value) })}
                            className="w-full px-2 py-1 border border-blue-300 rounded font-mono font-bold text-blue-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">Peajes NPR ($ COP):</label>
                          <input
                            type="number"
                            step={1000}
                            value={editingRouteForm.tollEstimatedCost}
                            onChange={(e) => setEditingRouteForm({ ...editingRouteForm, tollEstimatedCost: Number(e.target.value) })}
                            className="w-full px-2 py-1 border border-blue-300 rounded font-mono font-bold text-blue-900 bg-white"
                          />
                        </div>
                      </div>

                      {/* Parámetros para Camión NLR */}
                      <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 space-y-2">
                        <span className="text-[10px] font-bold text-amber-900 uppercase block tracking-wider">🚐 Valores para Camión NLR (Liviano C1)</span>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">Tarifa Flete NLR ($ COP):</label>
                          <input
                            type="number"
                            step={10000}
                            value={editingRouteForm.freightTariffNlr}
                            onChange={(e) => setEditingRouteForm({ ...editingRouteForm, freightTariffNlr: Number(e.target.value) })}
                            className="w-full px-2 py-1 border border-amber-300 rounded font-mono font-bold text-amber-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">Peajes NLR ($ COP):</label>
                          <input
                            type="number"
                            step={1000}
                            value={editingRouteForm.tollEstimatedCostNlr}
                            onChange={(e) => setEditingRouteForm({ ...editingRouteForm, tollEstimatedCostNlr: Number(e.target.value) })}
                            className="w-full px-2 py-1 border border-amber-300 rounded font-mono font-bold text-amber-900 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                      <button
                        type="button"
                        onClick={() => setIsEditingSelectedRoute(false)}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs"
                      >
                        Cerrar sin guardar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveInlineRoute}
                        className="px-3.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar Cambios en Ruta</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 5: Odómetro y Anticipo */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  Odómetro y Anticipo
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Odómetro de Salida (Km):</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newDispatchForm.departureOdometer}
                      onChange={(e) => setNewDispatchForm({ ...newDispatchForm, departureOdometer: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-base text-slate-900 focus:ring-1 focus:ring-blue-600"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Lectura verificada en tablero al salir de la portería CEDI</span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Anticipo Entregado al Conductor (COP):</label>
                    <input
                      type="number"
                      step={10000}
                      required
                      value={newDispatchForm.advancePaymentCOP}
                      onChange={(e) => setNewDispatchForm({ ...newDispatchForm, advancePaymentCOP: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-base text-blue-900 focus:ring-1 focus:ring-blue-600"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Cubre peajes, ACPM y viáticos oficiales de la ruta</span>
                  </div>
                </div>
              </div>

              {/* Resumen Completo del Presupuesto y Ganancia Teórica (Diferenciado NPR vs NLR) */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3 font-mono border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="font-sans font-bold text-slate-200">Presupuesto y Rentabilidad Teórica:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      plannedBudget.vehicleCategory === 'NLR'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {plannedBudget.vehicleCategory === 'NLR' ? '🚐 Vehículo: NLR Liviano' : '🚚 Vehículo: NPR Turbo C2'}
                    </span>
                  </div>
                </div>

                {/* 3 Tarjetas Financieras Clave */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80">
                    <span className="text-[10px] text-blue-300 font-sans block">Flete / Ingreso ({plannedBudget.vehicleCategory}):</span>
                    <span className="font-bold text-blue-400 text-base block">{formatCOP(plannedBudget.plannedFreightCOP)}</span>
                    <span className="text-[9px] text-slate-400 font-sans block">Tarifa comercial asignada</span>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80">
                    <span className="text-[10px] text-rose-300 font-sans block">Costo Operativo Teórico:</span>
                    <span className="font-bold text-rose-300 text-base block">{formatCOP(plannedBudget.plannedTotalCostCOP)}</span>
                    <span className="text-[9px] text-slate-400 font-sans block">ACPM + peajes + nómina</span>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80">
                    <span className="text-[10px] text-emerald-300 font-sans block">Ganancia Neta Teórica:</span>
                    <span className={`font-bold text-base block ${plannedBudget.plannedNetProfitCOP >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCOP(plannedBudget.plannedNetProfitCOP)}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold font-sans block">
                      {plannedBudget.plannedMarginPct.toFixed(1)}% Margen Proyectado
                    </span>
                  </div>
                </div>

                {/* Desglose de Costos de la Ruta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                  <div>Km Ruta: <span className="font-bold text-white">{plannedBudget.plannedKm} km</span></div>
                  <div>Combustible: <span className="font-bold text-white">{formatCOP(plannedBudget.plannedFuelCOP)}</span> <span className="text-[9px] text-slate-400">({plannedBudget.vehicleCategory === 'NLR' ? '31 km/gal' : '22.5 km/gal'})</span></div>
                  <div>Peajes: <span className="font-bold text-white">{formatCOP(plannedBudget.plannedTollCOP)}</span></div>
                  <div>Tripulación: <span className="font-bold text-white">{formatCOP(plannedBudget.plannedLaborCOP)}</span></div>
                </div>

                {/* Banner Comparativo si la ruta tiene ambas tarifas */}
                {currentSelectedRoute && (currentSelectedRoute.freightTariffNpr || 0) > 0 && (currentSelectedRoute.freightTariffNlr || 0) > 0 && currentSelectedRoute.freightTariffNpr !== currentSelectedRoute.freightTariffNlr && (
                  <div className="p-2 bg-slate-800/60 rounded-lg border border-slate-700 text-[10px] text-slate-300 flex items-center justify-between font-sans flex-wrap gap-1">
                    <span>💡 <strong>Comparativa de Fletes SCJ para esta ruta:</strong></span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className={plannedBudget.vehicleCategory === 'NPR' ? 'text-blue-300 font-bold underline' : 'text-slate-400'}>
                        NPR: {formatCOP(currentSelectedRoute.freightTariffNpr || 0)}
                      </span>
                      <span>·</span>
                      <span className={plannedBudget.vehicleCategory === 'NLR' ? 'text-amber-300 font-bold underline' : 'text-slate-400'}>
                        NLR: {formatCOP(currentSelectedRoute.freightTariffNlr || 0)}
                      </span>
                      <span className="text-slate-400 font-sans">
                        (Dif: {formatCOP(Math.abs((currentSelectedRoute.freightTariffNpr || 0) - (currentSelectedRoute.freightTariffNlr || 0)))})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Banner de Bloqueo por Recursos Físicamente Ocupados */}
              {hasBusyResource && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Bloqueo de Despacho: Uno o más recursos seleccionados no están disponibles físicamente en el CEDI</span>
                  </div>
                  <ul className="text-[11px] text-rose-700 list-disc list-inside space-y-0.5 pl-1">
                    {isSelectedVehicleBusy && (
                      <li>
                        Camión <strong>{newDispatchForm.vehiclePlate}</strong> se encuentra en tránsito en el viaje <strong>{busyVehicleTrip?.id} ({busyVehicleTrip?.manifestNumber})</strong> hacia <em>{busyVehicleTrip?.routeName}</em>.
                      </li>
                    )}
                    {isSelectedDriverBusy && (
                      <li>
                        Conductor <strong>{newDispatchForm.driverName}</strong> está en ruta activa en el manifiesto <strong>{busyDriverTrip?.manifestNumber}</strong>.
                      </li>
                    )}
                    {isSelectedHelperBusy && (
                      <li>
                        Auxiliar <strong>{newDispatchForm.helperNames}</strong> está en ruta activa en el manifiesto <strong>{busyHelperTrip?.manifestNumber}</strong>.
                      </li>
                    )}
                  </ul>
                  <p className="text-[10px] text-rose-600 italic pt-1 border-t border-rose-200/60">
                    Deben retornar al CEDI y liquidar su caso con odómetro final para quedar habilitados nuevamente en el patio.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewDispatchOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={hasBusyResource}
                  className={`px-5 py-2 rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5 ${
                    hasBusyResource
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                  title={hasBusyResource ? 'No se puede despachar: Hay recursos ocupados en ruta' : 'Autorizar salida'}
                >
                  <Check className="w-4 h-4" />
                  <span>{hasBusyResource ? 'Recurso No Disponible Físicamente' : 'Registrar Salida y Generar Planilla'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR ENTRADA Y LIQUIDAR GASTO REAL */}
      {selectedDispatchForSettlement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  Registro de Entrada y Liquidación de Gasto Real
                </h2>
                <p className="text-xs text-slate-500">
                  Planilla: <span className="font-mono font-bold text-slate-800">{selectedDispatchForSettlement.id} ({selectedDispatchForSettlement.manifestNumber})</span> • Placa: <span className="font-mono font-bold">{selectedDispatchForSettlement.vehiclePlate}</span>
                </p>
              </div>
              <button onClick={() => setSelectedDispatchForSettlement(null)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>

            <form onSubmit={handleConfirmSettlement} className="space-y-4 text-xs">

              {/* Fechas y Odómetro de Entrada */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha de Retorno:</label>
                  <input
                    type="date"
                    required
                    value={settlementForm.returnDate}
                    onChange={(e) => setSettlementForm({ ...settlementForm, returnDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hora de Retorno:</label>
                  <input
                    type="time"
                    required
                    value={settlementForm.returnTime}
                    onChange={(e) => setSettlementForm({ ...settlementForm, returnTime: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Horas Reales de Jornada:</label>
                  <input
                    type="number"
                    step={0.5}
                    required
                    value={settlementForm.actualHoursWorked}
                    onChange={(e) => setSettlementForm({ ...settlementForm, actualHoursWorked: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Odómetro Final y Cálculo de Km Reales */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <span className="text-slate-500 text-[11px] block">Odómetro Salida:</span>
                  <span className="font-mono font-bold text-slate-800 text-base">
                    {formatNumber(selectedDispatchForSettlement.departureOdometer, 0)} km
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Odómetro Entrada (Final):</label>
                  <input
                    type="number"
                    required
                    min={selectedDispatchForSettlement.departureOdometer}
                    value={settlementForm.arrivalOdometer}
                    onChange={(e) => setSettlementForm({ ...settlementForm, arrivalOdometer: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-base text-slate-900 bg-white"
                  />
                </div>

                <div className="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-800 font-semibold block">Km Reales Recorridos:</span>
                  <span className="text-xl font-bold font-mono text-blue-950 block">
                    {Math.max(0, settlementForm.arrivalOdometer - selectedDispatchForSettlement.departureOdometer)} km
                  </span>
                  <span className="text-[10px] text-blue-700 font-sans">
                    vs {selectedDispatchForSettlement.plannedKm} km presupuestados
                  </span>
                </div>
              </div>

              {/* Combustible Real: Por Kilómetro Rodado o Factura EDS */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        Combustible ACPM — Liquidación por Kilometraje Rodado
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Cálculo técnico automático del consumo según odómetro y rendimiento del camión
                      </p>
                    </div>
                  </div>

                  {/* Selector de Modo */}
                  <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setSettlementForm({ ...settlementForm, fuelMode: 'BY_KM' })}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        settlementForm.fuelMode === 'BY_KM'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ⚡ Por Km Rodados ({settlementForm.fuelKmPerGallon} km/gal)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettlementForm({ ...settlementForm, fuelMode: 'MANUAL' })}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        settlementForm.fuelMode === 'MANUAL'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🧾 Factura EDS Manual
                    </button>
                  </div>
                </div>

                {settlementForm.fuelMode === 'BY_KM' ? (
                  <div className="space-y-2">
                    {(() => {
                      const km = Math.max(1, settlementForm.arrivalOdometer - selectedDispatchForSettlement.departureOdometer);
                      const kpg = settlementForm.fuelKmPerGallon > 0 ? settlementForm.fuelKmPerGallon : 13.5;
                      const estGal = Math.round((km / kpg) * 10) / 10;
                      const estCost = Math.round(estGal * settlementForm.actualFuelPricePerGallon);
                      return (
                        <>
                          <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                            <div>
                              <span className="text-[10px] text-blue-800 font-sans font-semibold block">
                                Consumo Estimado por Kilometraje:
                              </span>
                              <div className="text-sm font-bold text-blue-950 flex items-center gap-2 mt-0.5">
                                <span>{km} km rodados</span>
                                <span className="text-slate-400">÷</span>
                                <span>{kpg} km/gal</span>
                                <span className="text-slate-400">=</span>
                                <span className="text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                                  {estGal} galones ACPM
                                </span>
                              </div>
                            </div>
                            <div className="sm:text-right">
                              <span className="text-[10px] text-slate-500 font-sans block">Costo Total ACPM Calculado:</span>
                              <span className="text-base font-extrabold text-blue-900 block">
                                {formatCOP(estCost)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-sans">
                                @{formatCOP(settlementForm.actualFuelPricePerGallon)}/galón
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                                Rendimiento Vehículo (km/gal):
                              </label>
                              <input
                                type="number"
                                step={0.1}
                                min={1}
                                value={settlementForm.fuelKmPerGallon}
                                onChange={(e) => setSettlementForm({ ...settlementForm, fuelKmPerGallon: Number(e.target.value) })}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs bg-white"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                                Precio ACPM Oficial ($/galón):
                              </label>
                              <input
                                type="number"
                                step={100}
                                value={settlementForm.actualFuelPricePerGallon}
                                onChange={(e) => setSettlementForm({ ...settlementForm, actualFuelPricePerGallon: Number(e.target.value) })}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs bg-white"
                              />
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Galones en Factura EDS:</label>
                      <input
                        type="number"
                        step={0.5}
                        value={settlementForm.actualFuelGallons}
                        onChange={(e) => {
                          const gals = Number(e.target.value);
                          setSettlementForm({
                            ...settlementForm,
                            actualFuelGallons: gals,
                            actualFuelCostCOP: gals * settlementForm.actualFuelPricePerGallon
                          });
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Total Pagado en Estación (COP):</label>
                      <input
                        type="number"
                        step={1000}
                        value={settlementForm.actualFuelCostCOP}
                        onChange={(e) => setSettlementForm({ ...settlementForm, actualFuelCostCOP: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-blue-700 bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Checkbox de pago de combustible */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settlementForm.fuelPaidWithAdvance}
                      onChange={(e) => setSettlementForm({ ...settlementForm, fuelPaidWithAdvance: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">
                        Combustible pagado en EFECTIVO por el conductor con el anticipo
                      </span>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        {settlementForm.fuelPaidWithAdvance
                          ? '✓ Se descontará del saldo del conductor en el cuadre final de caja.'
                          : '○ Desmarcado: Pagado con Chip EDS / Crédito Corporativo SCJ (No se descuenta del efectivo del conductor).'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Peajes Reales y Viáticos Reales: Variables Editables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Peajes Reales */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      <span>Peajes Nacionales Reales (Variante)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const routeObj = routes.find(r => r.id === selectedDispatchForSettlement.routeId);
                        const plannedToll = selectedDispatchForSettlement.plannedTollCOP || routeObj?.tollEstimatedCost || 0;
                        const plannedCount = routeObj?.tollCount || 4;
                        setSettlementForm({
                          ...settlementForm,
                          actualTollCount: plannedCount,
                          actualTollCostCOP: plannedToll
                        });
                      }}
                      className="text-[10px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                      title="Restaurar valores de la base teórica de la ruta"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restaurar Base</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] bg-amber-50/70 p-2 rounded-lg border border-amber-200/80">
                    <span className="text-amber-900">
                      Base Teórica: <strong>{selectedDispatchForSettlement.plannedTollCOP ? formatCOP(selectedDispatchForSettlement.plannedTollCOP) : '$0'}</strong>
                    </span>
                    {(() => {
                      const diff = settlementForm.actualTollCostCOP - selectedDispatchForSettlement.plannedTollCOP;
                      if (diff > 0) {
                        return <span className="text-rose-700 font-bold font-mono">+{formatCOP(diff)} Sobrecosto</span>;
                      } else if (diff < 0) {
                        return <span className="text-emerald-700 font-bold font-mono">-{formatCOP(Math.abs(diff))} Ahorro</span>;
                      }
                      return <span className="text-blue-700 font-bold">✓ Coincide con base</span>;
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Cantidad de Peajes:</label>
                      <input
                        type="number"
                        min={0}
                        value={settlementForm.actualTollCount}
                        onChange={(e) => setSettlementForm({ ...settlementForm, actualTollCount: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono bg-white focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Total Peajes Pagados (COP):</label>
                      <input
                        type="number"
                        step={1000}
                        required
                        value={settlementForm.actualTollCostCOP}
                        onChange={(e) => setSettlementForm({ ...settlementForm, actualTollCostCOP: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-amber-800 bg-white focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Viáticos Reales */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      <span>Viáticos de Ruta Reales (Variante)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const routeObj = routes.find(r => r.id === selectedDispatchForSettlement.routeId);
                        const plannedViaticos = routeObj?.viaticosCOP || selectedDispatchForSettlement.advancePaymentCOP || 50000;
                        setSettlementForm({
                          ...settlementForm,
                          actualPerDiemCOP: plannedViaticos
                        });
                      }}
                      className="text-[10px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                      title="Restaurar viático teórico de la ruta"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restaurar Base</span>
                    </button>
                  </div>

                  {(() => {
                    const routeObj = routes.find(r => r.id === selectedDispatchForSettlement.routeId);
                    const plannedViaticos = routeObj?.viaticosCOP || selectedDispatchForSettlement.advancePaymentCOP || 50000;
                    const diff = settlementForm.actualPerDiemCOP - plannedViaticos;
                    return (
                      <div className="flex items-center justify-between text-[11px] bg-purple-50/70 p-2 rounded-lg border border-purple-200/80">
                        <span className="text-purple-900">
                          Base Teórica: <strong>{formatCOP(plannedViaticos)}</strong>
                        </span>
                        {diff > 0 ? (
                          <span className="text-rose-700 font-bold font-mono">+{formatCOP(diff)} Adicional</span>
                        ) : diff < 0 ? (
                          <span className="text-emerald-700 font-bold font-mono">-{formatCOP(Math.abs(diff))} Ahorro</span>
                        ) : (
                          <span className="text-purple-700 font-bold">✓ Coincide con base</span>
                        )}
                      </div>
                    );
                  })()}

                  <div className="pt-1">
                    <label className="text-[11px] text-slate-600 block mb-1">
                      Viáticos Reales Gastados (Alimentación / Hospedaje) (COP):
                    </label>
                    <input
                      type="number"
                      step={5000}
                      value={settlementForm.actualPerDiemCOP}
                      onChange={(e) => setSettlementForm({ ...settlementForm, actualPerDiemCOP: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-purple-900 bg-white focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Gastos Menores, Imprevistos y Bonos: Lista Dinámica de 2 Columnas (Concepto Enfrente y Valor al Otro Lado) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-slate-700" />
                      <span>Imprevistos, Gastos Adicionales y Bonos en Ruta</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Escribe el tipo de gasto enfrente y el valor al otro lado. Agrega múltiples gastos que sumen al total.
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                    <span className="text-[10px] font-semibold text-emerald-800">Total Sumado:</span>
                    <span className="font-mono font-bold text-sm text-emerald-900">
                      {formatCOP(settlementForm.incidentalsList.reduce((acc, item) => acc + (Number(item.amountCOP) || 0), 0))}
                    </span>
                  </div>
                </div>

                {/* Atajos Rápidos */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-semibold mr-0.5">Sugerencias:</span>
                  <button
                    type="button"
                    onClick={() => handleAddIncidental('Despinche llanta', 25000)}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold border border-slate-300 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-2.5 h-2.5 text-blue-600" />
                    <span>+ Despinche ($25k)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddIncidental('Báscula carretera', 10000)}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold border border-slate-300 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-2.5 h-2.5 text-blue-600" />
                    <span>+ Báscula ($10k)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddIncidental('Bono conductor cumplimiento', 50000)}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-emerald-800 rounded-md text-[10px] font-bold border border-emerald-300 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-2.5 h-2.5 text-emerald-600" />
                    <span>+ Bono Conductor ($50k)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddIncidental('Cargue / Descargue adicional', 35000)}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold border border-slate-300 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-2.5 h-2.5 text-purple-600" />
                    <span>+ Cargue/Descargue ($35k)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddIncidental('Parqueadero / Lavada nocturna', 20000)}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold border border-slate-300 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-2.5 h-2.5 text-amber-600" />
                    <span>+ Lavada/Parqueo ($20k)</span>
                  </button>
                  {settlementForm.incidentalsList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSettlementForm(prev => ({ ...prev, incidentalsList: [], actualIncidentalCOP: 0 }))}
                      className="px-2 py-0.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-600 rounded-md text-[10px] font-semibold transition-colors"
                      title="Limpiar todos los gastos"
                    >
                      ↺ Borrar Todos
                    </button>
                  )}
                </div>

                {/* Lista Dinámica: Concepto Enfrente | Valor al Otro Lado */}
                <div className="space-y-2 pt-1">
                  {settlementForm.incidentalsList.length === 0 ? (
                    <div className="p-3 bg-white border border-dashed border-slate-300 rounded-xl text-center space-y-1">
                      <p className="text-xs text-slate-500">
                        No hay gastos imprevistos, adicionales ni bonos registrados para este viaje ($0 COP).
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAddIncidental('', 0)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 border border-blue-200 transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Gasto / Imprevisto / Bono</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 px-1 uppercase tracking-wider">
                        <div className="col-span-7 sm:col-span-7">Tipo de Gasto / Imprevisto / Bono (Enfrente)</div>
                        <div className="col-span-4 sm:col-span-4 text-right">Valor ($ COP) (Al otro lado)</div>
                        <div className="col-span-1 sm:col-span-1 text-center">Quitar</div>
                      </div>

                      {settlementForm.incidentalsList.map((item, index) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all"
                        >
                          {/* ENFRENTE: Tipo de gasto / concepto */}
                          <div className="col-span-7 sm:col-span-7">
                            <input
                              type="text"
                              required
                              value={item.concept}
                              onChange={(e) => handleUpdateIncidental(item.id, 'concept', e.target.value)}
                              placeholder={`Ej: Despinche, Bono conductor, Báscula ${index + 1}...`}
                              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium text-slate-900"
                            />
                          </div>

                          {/* AL OTRO LADO: Valor en pesos COP */}
                          <div className="col-span-4 sm:col-span-4">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1 text-slate-400 font-mono text-xs">$</span>
                              <input
                                type="number"
                                min={0}
                                step={1000}
                                required
                                value={item.amountCOP}
                                onChange={(e) => handleUpdateIncidental(item.id, 'amountCOP', e.target.value)}
                                className="w-full pl-6 pr-2 py-1 text-xs border border-slate-300 rounded-lg font-mono font-bold text-right text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
                              />
                            </div>
                          </div>

                          {/* ACCIÓN: Eliminar */}
                          <div className="col-span-1 sm:col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveIncidental(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Eliminar este gasto"
                            >
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddIncidental('', 0)}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 border border-blue-200 transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Agregar Otro Gasto o Bono</span>
                        </button>

                        <span className="text-xs text-slate-600 font-mono">
                          {settlementForm.incidentalsList.length} {settlementForm.incidentalsList.length === 1 ? 'ítem sumado' : 'ítems sumados'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notas adicionales */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="text-[11px] text-slate-600 block mb-1">Notas u observaciones adicionales (Opcional):</label>
                  <input
                    type="text"
                    value={settlementForm.incidentalNotes}
                    onChange={(e) => setSettlementForm({ ...settlementForm, incidentalNotes: e.target.value })}
                    placeholder="Ej: Aprobado por jefatura de transporte o novedades de carretera"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              {/* Liquidación en Vivo del Caso */}
              {selectedDispatchForSettlement && (() => {
                const currentKm = Math.max(1, settlementForm.arrivalOdometer - selectedDispatchForSettlement.departureOdometer);

                let currentFuel = 0;
                if (settlementForm.fuelMode === 'BY_KM') {
                  const kpg = settlementForm.fuelKmPerGallon > 0 ? settlementForm.fuelKmPerGallon : 13.5;
                  const gals = Math.round((currentKm / kpg) * 10) / 10;
                  currentFuel = Math.round(gals * settlementForm.actualFuelPricePerGallon);
                } else {
                  currentFuel = settlementForm.actualFuelCostCOP > 0
                    ? settlementForm.actualFuelCostCOP
                    : Math.round(settlementForm.actualFuelGallons * settlementForm.actualFuelPricePerGallon);
                }

                const activeSchedule = getStoredWorkSchedule();
                const driverLabor = calculateTripLaborFromSchedule(
                  selectedDispatchForSettlement.departureDate,
                  selectedDispatchForSettlement.departureTime,
                  settlementForm.returnDate,
                  settlementForm.returnTime,
                  laborConfig.hourlyOrdinaryRate || 8000,
                  laborConfig.hourlyOvertimeDayRate || 17488,
                  laborConfig.hourlyOvertimeNightRate || 23000,
                  activeSchedule,
                  laborConfig.auxilioTransporteLegal || defaultLaborConfig.auxilioTransporteLegal
                );

                let helperLaborTotal = 0;
                const hasTripHelper = (selectedDispatchForSettlement.helpersCount && selectedDispatchForSettlement.helpersCount > 0) || laborConfig.hasHelper;
                if (hasTripHelper) {
                  const helperHourlyOrd = laborConfig.helperHourlyOrdinaryRate || Math.round((laborConfig.helperSalary || defaultLaborConfig.smmlv) / (laborConfig.monthlyWorkingHours || defaultLaborConfig.monthlyWorkingHours));
                  const helperDayExt = laborConfig.helperOvertimeDayRate || Math.round(helperHourlyOrd * (1 + (activeSchedule.dayOvertimeSurchargeRate ?? 0.25)));
                  const helperNightExt = laborConfig.helperOvertimeNightRate || Math.round(helperHourlyOrd * (1 + (activeSchedule.nightOvertimeSurchargeRate ?? 0.75)));
                  const helperShift = calculateTripLaborFromSchedule(
                    selectedDispatchForSettlement.departureDate,
                    selectedDispatchForSettlement.departureTime,
                    settlementForm.returnDate,
                    settlementForm.returnTime,
                    helperHourlyOrd,
                    helperDayExt,
                    helperNightExt,
                    activeSchedule,
                    laborConfig.auxilioTransporteLegal || defaultLaborConfig.auxilioTransporteLegal
                  );
                  helperLaborTotal = helperShift.totalLaborCalculatedCOP * (selectedDispatchForSettlement.helpersCount || 1);
                }

                const currentLaborTotalCOP = driverLabor.totalLaborCalculatedCOP + helperLaborTotal;

                const veh = vehicles.find(v => v.id === selectedDispatchForSettlement.vehicleId);
                const currentMaint = currentKm * (veh?.totalMaintenancePerKm || 450);
                const currentTotalCost =
                  currentFuel +
                  settlementForm.actualTollCostCOP +
                  currentLaborTotalCOP +
                  currentMaint +
                  settlementForm.actualPerDiemCOP +
                  settlementForm.actualIncidentalCOP +
                  selectedDispatchForSettlement.plannedFixedCOP;

                const routeObj = routes.find(r => r.id === selectedDispatchForSettlement.routeId);
                const isNlrTrip = isDispatchNlr(selectedDispatchForSettlement);
                const currentFreight = selectedDispatchForSettlement.plannedFreightCOP || (isNlrTrip
                  ? (routeObj?.freightTariffNlr || routeObj?.freightTariffNpr || 0)
                  : (routeObj?.freightTariffNpr || routeObj?.freightTariffNlr || 0));
                const currentProfit = currentFreight > 0 ? currentFreight - currentTotalCost : 0;
                const currentMargin = currentFreight > 0 ? (currentProfit / currentFreight) * 100 : 0;

                const driverFuelExpense = settlementForm.fuelPaidWithAdvance ? currentFuel : 0;
                const driverDirect = driverFuelExpense + settlementForm.actualTollCostCOP + settlementForm.actualPerDiemCOP + settlementForm.actualIncidentalCOP;
                const driverBal = selectedDispatchForSettlement.advancePaymentCOP - driverDirect;

                return (
                  <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                      <span className="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>Liquidación Total Calculada del Caso (En Vivo)</span>
                      </span>
                      <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                        {driverLabor.isSundayOrHoliday ? `⚠️ ${driverLabor.holidayName} (+75% Festivo)` : 'Turno Ordinario Lun-Sáb'}
                      </span>
                    </div>

                    {/* Tarifa activa aplicada al caso */}
                    <div className="text-[10px] text-blue-800 bg-white/80 p-2 rounded-lg border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-2xs">
                      <div>
                        <strong>Tarifas aplicadas:</strong> Conductor H.O. {formatCOP(laborConfig.hourlyOrdinaryRate || 8000)}/h · H.E.D. {formatCOP(laborConfig.hourlyOvertimeDayRate || 17488)}/h · H.E.N. {formatCOP(laborConfig.hourlyOvertimeNightRate || 23000)}/h
                      </div>
                      <span className="font-bold text-blue-950 shrink-0">
                        {hasTripHelper ? `Tripulación: Conductor + Auxiliar (${formatCOP(laborConfig.helperHourlyOrdinaryRate || 8338)}/h)` : 'Tripulación: 1 Conductor'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block">Mano de Obra CST:</span>
                        <span className="font-bold text-slate-900">{formatCOP(currentLaborTotalCOP)}</span>
                        <span className="text-[9px] text-slate-400 block">{driverLabor.totalHours}h laboradas</span>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block">Gasto Total Real:</span>
                        <span className="font-bold text-rose-700">{formatCOP(currentTotalCost)}</span>
                        <span className="text-[9px] text-slate-400 block">{currentKm} km rodados</span>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block">Ganancia Neta Real:</span>
                        <span className={`font-bold ${currentProfit >= 0 ? 'text-blue-900' : 'text-rose-700'}`}>
                          {formatCOP(currentProfit)}
                        </span>
                        <span className="text-[9px] text-blue-700 font-bold block">{currentMargin.toFixed(1)}% margen</span>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block">Cuadre del Conductor:</span>
                        <span className={`font-bold ${driverBal >= 0 ? 'text-blue-800' : 'text-amber-800'}`}>
                          {formatCOP(Math.abs(driverBal))}
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          {driverBal >= 0 ? '🟢 Devuelve al CEDI' : '🟡 Empresa le reembolsa'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDispatchForSettlement(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs shadow-blue-500/20 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cerrar el Caso y Guardar en Historial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VER DETALLE / PLANILLA FORMAL DE LIQUIDACIÓN */}
      {selectedDispatchForView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] text-blue-800 font-bold bg-blue-100 px-2 py-0.5 rounded-full font-mono">
                  {selectedDispatchForView.id}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  Planilla Oficial de Liquidación de Viaje
                </h2>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditDispatch(selectedDispatchForView);
                  }}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold text-xs flex items-center gap-1 border border-amber-300 transition-colors shadow-2xs"
                  title="Editar los datos y gastos de esta liquidación"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDispatch(selectedDispatchForView.id)}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-xs flex items-center gap-1 border border-rose-200 transition-colors shadow-2xs"
                  title="Eliminar este registro"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs flex items-center gap-1 border border-slate-300"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button onClick={() => setSelectedDispatchForView(null)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
              </div>
            </div>

            {/* Datos Generales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Manifiesto / Remisión:</span>
                <span className="font-mono font-bold text-slate-900">{selectedDispatchForView.manifestNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Vehículo & Placa:</span>
                <span className="font-mono font-bold text-slate-900">{selectedDispatchForView.vehiclePlate}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Conductor:</span>
                <span className="font-bold text-slate-900 truncate block">{selectedDispatchForView.driverName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Auxiliar:</span>
                <span className="font-medium text-slate-700 truncate block">{selectedDispatchForView.helperNames || 'N/A'}</span>
              </div>
            </div>

            {/* Comparativa Lado a Lado: Presupuesto vs Real */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-900 text-white p-3 flex items-center justify-between font-mono">
                <span className="font-sans font-bold">Auditoría Financiera: Presupuestado vs Gasto Real</span>
                <span className="text-xs text-blue-400">{selectedDispatchForView.routeName}</span>
              </div>

              <div className="p-4 space-y-3 font-mono">
                <div className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-2 font-sans font-bold text-slate-600 text-[11px]">
                  <div>Rubro Operacional</div>
                  <div className="text-right">Presupuestado</div>
                  <div className="text-right">Gasto Real</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-sans text-slate-700">Distancia Recorrida:</div>
                  <div className="text-right text-slate-600">{selectedDispatchForView.plannedKm} km</div>
                  <div className="text-right font-bold text-slate-900">{selectedDispatchForView.actualKm} km</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-sans text-slate-700">Combustible ACPM:</div>
                  <div className="text-right text-slate-600">{formatCOP(selectedDispatchForView.plannedFuelCOP)}</div>
                  <div className="text-right font-bold text-blue-700">{formatCOP(selectedDispatchForView.actualFuelCostCOP || 0)}</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-sans text-slate-700">Peajes Nacionales:</div>
                  <div className="text-right text-slate-600">{formatCOP(selectedDispatchForView.plannedTollCOP)}</div>
                  <div className="text-right font-bold text-amber-800">{formatCOP(selectedDispatchForView.actualTollCostCOP || 0)}</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-sans text-slate-700">Nómina y Horas Extras:</div>
                  <div className="text-right text-slate-600">{formatCOP(selectedDispatchForView.plannedLaborCOP)}</div>
                  <div className="text-right font-bold text-slate-800">{formatCOP(selectedDispatchForView.actualLaborCostCOP || 0)}</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-sans text-slate-700">Mantenimiento y Llantas:</div>
                  <div className="text-right text-slate-600">{formatCOP(selectedDispatchForView.plannedMaintenanceCOP)}</div>
                  <div className="text-right font-bold text-slate-800">{formatCOP(selectedDispatchForView.actualMaintenanceCostCOP || 0)}</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-sans text-slate-700">Viáticos de Ruta:</div>
                  <div className="text-right text-slate-600">
                    {formatCOP(routes.find(r => r.id === selectedDispatchForView.routeId)?.viaticosCOP || selectedDispatchForView.advancePaymentCOP || 0)}
                  </div>
                  <div className="text-right font-bold text-purple-800">
                    {formatCOP(selectedDispatchForView.actualPerDiemCOP || 0)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-sans text-slate-700">Imprevistos, Adicionales y Bonos:</div>
                  <div className="text-right text-slate-600">$0</div>
                  <div className="text-right font-bold text-emerald-800">
                    {formatCOP(selectedDispatchForView.actualIncidentalCOP || 0)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t-2 border-slate-200 font-bold text-sm">
                  <div className="font-sans text-slate-900">GASTO TOTAL VIAJE:</div>
                  <div className="text-right text-slate-600">{formatCOP(selectedDispatchForView.plannedTotalCostCOP)}</div>
                  <div className="text-right text-blue-900">{formatCOP(selectedDispatchForView.actualTotalCostCOP || 0)}</div>
                </div>
              </div>

              {/* Detalle Desglosado de Imprevistos, Gastos Adicionales y Bonos */}
              {selectedDispatchForView.actualIncidentalsList && selectedDispatchForView.actualIncidentalsList.length > 0 && (
                <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-slate-700" />
                      <span>Desglose de Imprevistos y Bonos Registrados:</span>
                    </span>
                    <span className="font-mono text-emerald-800">
                      Total: {formatCOP(selectedDispatchForView.actualIncidentalCOP || 0)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedDispatchForView.actualIncidentalsList.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
                      >
                        <span className="text-slate-800 font-medium truncate max-w-[200px]">
                          • {item.concept || 'Gasto adicional'}
                        </span>
                        <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">
                          {formatCOP(item.amountCOP)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Liquidación de Anticipo del Conductor */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Liquidación del Anticipo Entregado al Conductor:</span>
                <span className="font-mono text-blue-900">{formatCOP(selectedDispatchForView.advancePaymentCOP)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gastos de bolsillo reportados (ACPM + Peajes + Viáticos):</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCOP(
                    (selectedDispatchForView.actualFuelCostCOP || 0) +
                    (selectedDispatchForView.actualTollCostCOP || 0) +
                    (selectedDispatchForView.actualPerDiemCOP || 0) +
                    (selectedDispatchForView.actualIncidentalCOP || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">
                  {(selectedDispatchForView.driverBalanceCOP || 0) >= 0
                    ? 'Saldo a reintegrar a la empresa (Efectivo sobrante):'
                    : 'Saldo a reembolsar al conductor (Gastó de su bolsillo):'}
                </span>
                <span className={`font-mono text-sm font-bold ${
                  (selectedDispatchForView.driverBalanceCOP || 0) >= 0 ? 'text-blue-700' : 'text-rose-700'
                }`}>
                  {formatCOP(Math.abs(selectedDispatchForView.driverBalanceCOP || 0))}
                </span>
              </div>
            </div>

            {/* Rentabilidad y Ganancia Neta Real */}
            <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Flete Facturado (Ingreso):</span>
                <span className="font-bold text-slate-900 text-sm">{formatCOP(selectedDispatchForView.plannedFreightCOP || 0)}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Utilidad Neta Real del Viaje:</span>
                <span className={`text-base font-extrabold ${((selectedDispatchForView.actualNetProfitCOP || 0) >= 0) ? 'text-blue-900' : 'text-rose-700'}`}>
                  {formatCOP(selectedDispatchForView.actualNetProfitCOP || 0)}
                </span>
                <span className="text-[10px] font-bold text-blue-700 block">
                  {((selectedDispatchForView.actualMarginPct || 0)).toFixed(1)}% Margen de Ganancia
                </span>
              </div>
            </div>

            {/* Firmas para Control y Archivo Físico */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t border-slate-400 pt-2">
                <span className="font-bold text-slate-800 block">Firma del Despachador</span>
                <span className="text-[10px] text-slate-500">CEDI Caldas — Operaciones SCJ</span>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <span className="font-bold text-slate-800 block">Firma del Conductor</span>
                <span className="text-[10px] text-slate-500">{selectedDispatchForView.driverName} (CC {selectedDispatchForView.driverDocument || 'Verificado'})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDITAR REGISTRO DE DESPACHO / VIAJE */}
      {editingDispatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">

            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono font-bold text-[10px]">
                    {editDispatchForm.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    editDispatchForm.status === 'EN_TRANSITO'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {editDispatchForm.status === 'EN_TRANSITO' ? '🚚 En Tránsito' : '✅ Liquidado'}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-600" />
                  Editar Registro de Despacho y Liquidación
                </h2>
                <p className="text-xs text-slate-500">
                  Modifica cualquier dato de salida, tripulación, odómetros o rubros reales de gasto.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingDispatch(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Selector de Pestañas y Estado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditActiveTab('departure')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    editActiveTab === 'departure'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>1. Salida & Tripulación</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditActiveTab('settlement')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    editActiveTab === 'settlement'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>2. Retorno & Gastos Reales</span>
                </button>
              </div>

              {/* Selector de Estado */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] text-slate-500 font-semibold">Estado del viaje:</span>
                <select
                  value={editDispatchForm.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as 'EN_TRANSITO' | 'LIQUIDADO';
                    setEditDispatchForm(prev => ({ ...prev, status: newStatus }));
                    if (newStatus === 'LIQUIDADO') {
                      setEditActiveTab('settlement');
                    }
                  }}
                  className="px-2.5 py-1 border border-slate-300 rounded-lg font-bold text-xs bg-slate-50 text-slate-900"
                >
                  <option value="EN_TRANSITO">🚚 En Tránsito (Activo)</option>
                  <option value="LIQUIDADO">✅ Liquidado (Cerrado)</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleSaveEditedDispatch} className="space-y-4 text-xs">

              {/* TAB 1: DATOS DE SALIDA */}
              {editActiveTab === 'departure' && (
                <div className="space-y-3 animate-in fade-in duration-150">

                  {/* Manifiesto y Fechas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nº Manifiesto / Remisión:</label>
                      <input
                        type="text"
                        required
                        value={editDispatchForm.manifestNumber}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, manifestNumber: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700">Fecha de Salida:</label>
                        <button
                          type="button"
                          onClick={() => setEditDispatchForm(prev => ({ ...prev, departureDate: getLocalCurrentDate() }))}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                        >
                          Hoy
                        </button>
                      </div>
                      <input
                        type="date"
                        required
                        value={editDispatchForm.departureDate}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, departureDate: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700">Hora de Salida:</label>
                        <button
                          type="button"
                          onClick={() => setEditDispatchForm(prev => ({ ...prev, departureTime: getLocalCurrentTime() }))}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                        >
                          Ahora
                        </button>
                      </div>
                      <input
                        type="time"
                        required
                        value={editDispatchForm.departureTime}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, departureTime: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Vehículo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Camión de la Flota:</label>
                      <select
                        value={editDispatchForm.vehiclePlate}
                        onChange={(e) => {
                          const plate = e.target.value;
                          const found = activeFleetList.find(fv => fv.plate === plate);
                          setEditDispatchForm({
                            ...editDispatchForm,
                            vehiclePlate: plate,
                            vehicleId: found?.vehicleProfileId || editDispatchForm.vehicleId
                          });
                        }}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-medium bg-slate-50"
                      >
                        {activeFleetList.map(v => (
                          <option key={v.plate} value={v.plate}>
                            {v.plate} — {v.name} ({v.capacityTons} Ton)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Placa Confirmada:</label>
                      <input
                        type="text"
                        required
                        value={editDispatchForm.vehiclePlate}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, vehiclePlate: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold uppercase"
                      />
                    </div>
                  </div>

                  {/* Tripulación */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Conductor (Nómina):</label>
                      <select
                        value={editDispatchForm.driverName}
                        onChange={(e) => {
                          const name = e.target.value;
                          const drv = activeDrivers.find(d => d.name === name);
                          setEditDispatchForm({
                            ...editDispatchForm,
                            driverName: name,
                            driverDocument: drv?.document || editDispatchForm.driverDocument
                          });
                        }}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-medium bg-slate-50"
                      >
                        {activeDrivers.map(d => (
                          <option key={d.id} value={d.name}>
                            {d.name} (CC {d.document})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Auxiliares de Reparto:</label>
                      <select
                        value={editDispatchForm.helpersCount}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, helpersCount: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      >
                        <option value={1}>1 Auxiliar de logística</option>
                        <option value={0}>0 Auxiliares (Solo conductor)</option>
                        <option value={2}>2 Auxiliares</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Auxiliar Asignado:</label>
                      <select
                        value={editDispatchForm.helperNames}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, helperNames: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-medium bg-slate-50"
                      >
                        {activeHelpers.map(h => (
                          <option key={h.id} value={h.name}>
                            {h.name} (CC {h.document})
                          </option>
                        ))}
                        <option value="">Ninguno</option>
                      </select>
                    </div>
                  </div>

                  {/* Ruta Asignada */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Ruta Asignada:</label>
                    <select
                      value={editDispatchForm.routeId}
                      onChange={(e) => {
                        const selId = e.target.value;
                        const r = routes.find(rt => rt.id === selId);
                        setEditDispatchForm({
                          ...editDispatchForm,
                          routeId: selId,
                          advancePaymentCOP: r?.viaticosCOP || editDispatchForm.advancePaymentCOP
                        });
                      }}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-medium bg-slate-50"
                    >
                      {routes.map(r => {
                        const isNlrEdit = editDispatchForm.vehiclePlate ? (
                          activeFleetList.find(fv => fv.plate.toUpperCase().trim() === editDispatchForm.vehiclePlate.toUpperCase().trim())?.vehicleType === 'NLR' ||
                          editDispatchForm.vehiclePlate.toUpperCase().includes('NLR')
                        ) : false;
                        const freight = isNlrEdit ? (r.freightTariffNlr || r.freightTariffNpr || 0) : (r.freightTariffNpr || r.freightTariffNlr || 0);
                        return (
                          <option key={r.id} value={r.id}>
                            {r.id}: {r.name} ({r.km} km, flete {isNlrEdit ? 'NLR' : 'NPR'}: {formatCOP(freight)})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Odómetro inicial y anticipo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-800 block mb-1">Odómetro de Salida (Km inicial):</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={editDispatchForm.departureOdometer}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, departureOdometer: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold bg-white text-base"
                      />
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="font-bold text-slate-800 block mb-1">Anticipo Entregado (COP):</label>
                      <input
                        type="number"
                        step={5000}
                        required
                        value={editDispatchForm.advancePaymentCOP}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, advancePaymentCOP: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold bg-white text-blue-900 text-base"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DATOS DE RETORNO Y GASTOS REALES */}
              {editActiveTab === 'settlement' && (
                <div className="space-y-3 animate-in fade-in duration-150">

                  {/* Fechas de Retorno y Horas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700">Fecha de Retorno:</label>
                        <button
                          type="button"
                          onClick={() => setEditDispatchForm(prev => ({ ...prev, returnDate: getLocalCurrentDate() }))}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                        >
                          Hoy
                        </button>
                      </div>
                      <input
                        type="date"
                        required
                        value={editDispatchForm.returnDate}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, returnDate: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700">Hora de Retorno:</label>
                        <button
                          type="button"
                          onClick={() => setEditDispatchForm(prev => ({ ...prev, returnTime: getLocalCurrentTime() }))}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                        >
                          Ahora
                        </button>
                      </div>
                      <input
                        type="time"
                        required
                        value={editDispatchForm.returnTime}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, returnTime: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Horas Trabajadas de Turno:</label>
                      <input
                        type="number"
                        step={0.5}
                        required
                        value={editDispatchForm.actualHoursWorked}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, actualHoursWorked: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Odómetros y Km Reales */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Odómetro Salida:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatNumber(editDispatchForm.departureOdometer, 0)} km
                      </span>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Odómetro Entrada (Final):</label>
                      <input
                        type="number"
                        required
                        min={editDispatchForm.departureOdometer}
                        value={editDispatchForm.arrivalOdometer}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, arrivalOdometer: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold bg-white text-base"
                      />
                    </div>

                    <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                      <span className="text-[10px] text-blue-800 font-semibold block">Km Reales Calculados:</span>
                      <span className="text-lg font-bold font-mono text-blue-950 block">
                        {Math.max(0, editDispatchForm.arrivalOdometer - editDispatchForm.departureOdometer)} km
                      </span>
                    </div>
                  </div>

                  {/* Combustible Real */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-blue-600" />
                        <span>Combustible ACPM Liquidado</span>
                      </span>
                      <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setEditDispatchForm(prev => ({ ...prev, fuelMode: 'BY_KM' }))}
                          className={`px-2 py-0.5 rounded ${editDispatchForm.fuelMode === 'BY_KM' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                        >
                          Por Km
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditDispatchForm(prev => ({ ...prev, fuelMode: 'MANUAL' }))}
                          className={`px-2 py-0.5 rounded ${editDispatchForm.fuelMode === 'MANUAL' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                        >
                          Factura EDS
                        </button>
                      </div>
                    </div>

                    {editDispatchForm.fuelMode === 'BY_KM' ? (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] text-slate-600 block mb-1">Rendimiento (km/galón):</label>
                          <input
                            type="number"
                            step={0.1}
                            value={editDispatchForm.fuelKmPerGallon}
                            onChange={(e) => setEditDispatchForm({ ...editDispatchForm, fuelKmPerGallon: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-600 block mb-1">Precio ACPM ($/galón):</label>
                          <input
                            type="number"
                            step={100}
                            value={editDispatchForm.actualFuelPricePerGallon}
                            onChange={(e) => setEditDispatchForm({ ...editDispatchForm, actualFuelPricePerGallon: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] text-slate-600 block mb-1">Galones Facturados:</label>
                          <input
                            type="number"
                            step={0.5}
                            value={editDispatchForm.actualFuelGallons}
                            onChange={(e) => setEditDispatchForm({ ...editDispatchForm, actualFuelGallons: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-600 block mb-1">Total Pagado en Estación (COP):</label>
                          <input
                            type="number"
                            step={1000}
                            value={editDispatchForm.actualFuelCostCOP}
                            onChange={(e) => setEditDispatchForm({ ...editDispatchForm, actualFuelCostCOP: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-blue-900 bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Peajes y Viáticos Reales */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                        <span>Peajes Reales Pagados (COP):</span>
                      </label>
                      <input
                        type="number"
                        step={1000}
                        required
                        value={editDispatchForm.actualTollCostCOP}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, actualTollCostCOP: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-amber-900 bg-white"
                      />
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                        <span>Viáticos Reales (Alimentación / Hotel) (COP):</span>
                      </label>
                      <input
                        type="number"
                        step={5000}
                        required
                        value={editDispatchForm.actualPerDiemCOP}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, actualPerDiemCOP: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-purple-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Imprevistos, Gastos Adicionales y Bonos (2 Columnas Dinámicas) */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-slate-700" />
                        <span>Imprevistos, Gastos Adicionales y Bonos</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-800 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                        Total: {formatCOP(editDispatchForm.incidentalsList.reduce((acc, item) => acc + (Number(item.amountCOP) || 0), 0))}
                      </span>
                    </div>

                    {/* Chips rápidos en edición */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleEditAddIncidental('Despinche llanta', 25000)}
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-300"
                      >
                        + Despinche ($25k)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditAddIncidental('Báscula', 10000)}
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-300"
                      >
                        + Báscula ($10k)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditAddIncidental('Bono conductor cumplimiento', 50000)}
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 text-emerald-800 rounded text-[10px] font-bold border border-emerald-300"
                      >
                        + Bono Conductor ($50k)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditAddIncidental('Cargue / Descargue', 35000)}
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-300"
                      >
                        + Cargue ($35k)
                      </button>
                    </div>

                    {/* Filas dinámicas */}
                    <div className="space-y-1.5 pt-1">
                      {editDispatchForm.incidentalsList.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-white p-1.5 rounded-lg border border-slate-200">
                          <div className="col-span-7">
                            <input
                              type="text"
                              required
                              value={item.concept}
                              onChange={(e) => handleEditUpdateIncidental(item.id, 'concept', e.target.value)}
                              placeholder="Concepto / Tipo de gasto..."
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-medium"
                            />
                          </div>
                          <div className="col-span-4">
                            <input
                              type="number"
                              min={0}
                              step={1000}
                              required
                              value={item.amountCOP}
                              onChange={(e) => handleEditUpdateIncidental(item.id, 'amountCOP', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono font-bold text-right"
                            />
                          </div>
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleEditRemoveIncidental(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleEditAddIncidental('', 0)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-bold inline-flex items-center gap-1 border border-blue-200"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Agregar Gasto / Bono</span>
                      </button>
                    </div>

                    <div className="pt-1">
                      <label className="text-[10px] text-slate-500 block mb-0.5">Observaciones adicionales:</label>
                      <input
                        type="text"
                        value={editDispatchForm.incidentalNotes}
                        onChange={(e) => setEditDispatchForm({ ...editDispatchForm, incidentalNotes: e.target.value })}
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                        placeholder="Novedades de ruta..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleDeleteDispatch(editDispatchForm.id)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Eliminar Registro</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDispatch(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios en el Registro</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERSONALIZADO: CIERRE DE MES */}
      <SCJModal
        isOpen={showCloseMonthModal}
        onClose={() => setShowCloseMonthModal(false)}
        onConfirm={() => {
          const currentPeriod = getCurrentPeriod();
          const updatedDispatches = dispatches.map(d => {
            const dispatchPeriod = d.period || d.departureDate?.substring(0, 7) || '';
            if (dispatchPeriod === currentPeriod) {
              return { ...d, period: currentPeriod, laborConfigSnapshot: d.laborConfigSnapshot || { ...laborConfig } };
            }
            return d;
          });
          saveDispatches(updatedDispatches);
          setPeriodFilter(currentPeriod);
          setShowCloseMonthModal(false);
        }}
        title="Cierre de Mes"
        confirmText="Confirmar Cierre"
        securityInput={{
          enabled: true,
          expectedValue: `CERRAR ${getCurrentPeriod()}`,
          value: closeMonthConfirmText,
          onChange: setCloseMonthConfirmText,
          placeholder: `Escribe CERRAR ${getCurrentPeriod()} para confirmar`,
        }}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 text-sm">CIERRE DE MES - ACCIÓN IRREVERSIBLE</p>
              <p className="text-xs text-amber-800 mt-1">
                Estás a punto de cerrar el mes de <strong>{formatPeriod(getCurrentPeriod())}</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-700">
            <p>Se archivarán los despachos del período:</p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 ml-2">
              <li><strong>{dispatches.filter(d => (d.period || d.departureDate?.substring(0, 7)) === getCurrentPeriod() && d.status === 'LIQUIDADO').length}</strong> liquidados</li>
              <li><strong>{dispatches.filter(d => (d.period || d.departureDate?.substring(0, 7)) === getCurrentPeriod() && d.status !== 'LIQUIDADO').length}</strong> pendientes</li>
            </ul>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-800">
              <strong>Nota:</strong> Los precios de la época quedarán preservados en cada despacho mediante el snapshot de configuración laboral.
            </p>
          </div>
        </div>
      </SCJModal>

      {/* MODAL PERSONALIZADO: CIERRE DE AÑO */}
      <SCJModal
        isOpen={showCloseYearModal}
        onClose={() => setShowCloseYearModal(false)}
        onConfirm={() => {
          const currentYear = getCurrentYear();
          const yearDispatches = dispatches.filter(d => {
            const dispatchYear = parseInt((d.period || d.departureDate?.substring(0, 7) || '0').split('-')[0], 10);
            return dispatchYear === currentYear;
          });

          // Guardar snapshot de todos los despachos del año
          const updatedDispatches = dispatches.map(d => {
            const dispatchYear = parseInt((d.period || d.departureDate?.substring(0, 7) || '0').split('-')[0], 10);
            if (dispatchYear === currentYear) {
              return { ...d, laborConfigSnapshot: d.laborConfigSnapshot || { ...laborConfig } };
            }
            return d;
          });

          saveDispatches(updatedDispatches);
          setShowCloseYearModal(false);
          alert(`Año ${currentYear} cerrado exitosamente. Se archivaron ${yearDispatches.length} despachos con sus precios históricos preservados.`);
        }}
        title="Cierre de Año"
        confirmText="Confirmar Cierre de Año"
        securityInput={{
          enabled: true,
          expectedValue: `CERRAR AÑO ${getCurrentYear()}`,
          value: closeYearConfirmText,
          onChange: setCloseYearConfirmText,
          placeholder: `Escribe CERRAR AÑO ${getCurrentYear()} para confirmar`,
        }}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900 text-sm">CIERRE DE AÑO - ACCIÓN IRREVERSIBLE</p>
              <p className="text-xs text-rose-800 mt-1">
                Estás a punto de cerrar el año <strong>{getCurrentYear()}</strong>.
              </p>
            </div>
          </div>

          {(() => {
            const summary = generateYearSummary(getCurrentYear(), dispatches);
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-500 font-sans">Despachos Totales</p>
                    <p className="text-lg font-bold text-slate-900">{summary.totalDispatches}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-500 font-sans">Liquidados</p>
                    <p className="text-lg font-bold text-emerald-700">{summary.liquidated}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-500 font-sans">Km Totales</p>
                    <p className="text-lg font-bold text-slate-900">{formatNumber(summary.totalKm, 0)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-500 font-sans">Margen</p>
                    <p className={`text-lg font-bold ${summary.marginPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {summary.marginPct.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs text-blue-800">
                    <strong>Nota:</strong> Al cerrar el año, todos los despachos quedarán archivados con sus precios históricos preservados.
                    Para el nuevo año, recuerda actualizar los parámetros en la sección "Base de Cálculo".
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </SCJModal>

      {/* BANNER DE NUEVO AÑO */}
      {showNewYearBanner && (
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm">¡Nuevo Año {getCurrentYear()}!</p>
              <p className="text-xs text-blue-100 mt-1">
                Recuerda actualizar los parámetros para el nuevo año:
              </p>
              <ul className="text-xs text-blue-100 mt-2 space-y-1 list-disc list-inside">
                <li>Salario Mínimo (SMLMV)</li>
                <li>Auxilio de Transporte</li>
                <li>Salarios de tripulación</li>
                <li>Viáticos y dotación</li>
              </ul>
              <button
                onClick={() => setShowNewYearBanner(false)}
                className="mt-3 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
              >
                Entendido, ir a Base de Cálculo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
