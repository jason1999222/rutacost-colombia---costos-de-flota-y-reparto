import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  DeliveryRoute,
  VehicleProfile,
  LaborConfig,
  RouteCostBreakdown
} from '../types/logistics';
import { formatCOP, formatNumber, calculateRouteCost } from '../utils/costCalculator';
import { INITIAL_ROUTES } from '../data/initialRoutes';
import {
  COMPANY_FLEET_VEHICLES,
  COMPANY_DRIVERS,
  COMPANY_HELPERS,
  CrewMemberResource,
  FleetVehicleResource,
  AdditionalExpenseConcept,
  getCustomStaff,
  saveCustomStaff,
  resetCustomStaff,
  getCustomFleet,
  saveCustomFleet,
  resetCustomFleet,
  getCustomExpenses,
  saveCustomExpenses,
  resetCustomExpenses
} from '../data/fleetAndCrewData';
import {
  KNOWN_TOLLS,
  TollStation,
  getCustomTollStations,
  saveCustomTollStations,
  resetCustomTollStations,
  updateTollStationTariffs,
  addCustomTollStation,
  removeCustomTollStation,
  recalculateAllRoutesTollCosts
} from '../data/colombiaTolls';
import {
  HOGAR_Y_MODA_STORES,
  HogarYModaStore,
  getCustomStores,
  saveCustomStores,
  resetCustomStores,
  updateStoreCoordinates,
  addCustomStore,
  removeCustomStore,
  CEDI_CALDAS_PORTAL_DEL_SUR
} from '../data/hogarYModaStores';
import {
  saveStoreToFirestore,
  deleteStoreFromFirestore,
  fetchStoresFromFirestore,
  subscribeToStoresFromFirestore,
  saveStoresListToFirestore,
  subscribeToStaffFromFirestore,
  saveStaffListToFirestore,
  deleteStaffMemberFromFirestore,
  subscribeToFleetFromFirestore,
  saveFleetListToFirestore,
  subscribeToExpensesFromFirestore,
  saveExpensesListToFirestore,
  subscribeToTollsFromFirestore,
  saveTollsListToFirestore
} from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import {
  Database,
  Truck,
  Users,
  Fuel,
  Wrench,
  ShieldCheck,
  Plus,
  UploadCloud,
  Download,
  RotateCcw,
  Search,
  Eye,
  Clock,
  DollarSign,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  BadgeAlert,
  HelpCircle,
  TrendingUp,
  MapPin,
  Edit2,
  Save,
  X,
  Trash2,
  RefreshCw,
  Check,
  Sparkles,
  Building2,
  ExternalLink,
  Compass,
  Navigation2
} from 'lucide-react';

interface MasterDataViewerProps {
  routes: DeliveryRoute[];
  vehicles: VehicleProfile[];
  laborConfig: LaborConfig;
  selectedVehicle: VehicleProfile;
  onUpdateRoutes: (routes: DeliveryRoute[]) => void;
  onSelectRouteForDetail: (breakdown: RouteCostBreakdown) => void;
  onEditRoute?: (route: DeliveryRoute) => void;
  onOpenNewRoute: () => void;
  onOpenImportModal: () => void;
  onExportCSV: () => void;
  onNavigateToMaps: () => void;
  onNavigateToLabor?: () => void;
}

export type MasterSubTab = 'budget_scj' | 'fleet_scj' | 'payroll_scj' | 'tolls_scj' | 'stores_scj' | 'additional_scj';

export const MasterDataViewer: React.FC<MasterDataViewerProps> = ({
  routes,
  vehicles,
  laborConfig,
  selectedVehicle,
  onUpdateRoutes,
  onSelectRouteForDetail,
  onEditRoute,
  onOpenNewRoute,
  onOpenImportModal,
  onExportCSV,
  onNavigateToMaps,
  onNavigateToLabor
}) => {
  const [activeSubTab, setActiveSubTab] = useState<MasterSubTab>('payroll_scj');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // --- GESTIÓN Y EDICIÓN DE TARIFAS DE PEAJES ---
  const [tollStations, setTollStations] = useState<TollStation[]>(() => getCustomTollStations());
  const [editingTollId, setEditingTollId] = useState<string | null>(null);
  const [editTariffForm, setEditTariffForm] = useState<{
    tariffCOP: number;
    tariffNprCOP: number;
    tariffNlrCOP: number;
    tariffHeavyMaxCOP: number;
    name: string;
    corridor: string;
    department: string;
  }>({
    tariffCOP: 0,
    tariffNprCOP: 0,
    tariffNlrCOP: 0,
    tariffHeavyMaxCOP: 0,
    name: '',
    corridor: '',
    department: '',
  });
  const [tollSearchTerm, setTollSearchTerm] = useState<string>('');
  const [autoRecalculateRoutes, setAutoRecalculateRoutes] = useState<boolean>(true);
  const [isAddingNewToll, setIsAddingNewToll] = useState<boolean>(false);
  const [newTollForm, setNewTollForm] = useState<{
    name: string;
    corridor: string;
    department: string;
    municipality: string;
    lat: number;
    lng: number;
    tariffCOP: number;
    tariffNprCOP: number;
    tariffNlrCOP: number;
    tariffHeavyMaxCOP: number;
  }>({
    name: '',
    corridor: '',
    department: 'Antioquia',
    municipality: '',
    lat: 6.2,
    lng: -75.5,
    tariffCOP: 15000,
    tariffNprCOP: 22000,
    tariffNlrCOP: 15000,
    tariffHeavyMaxCOP: 75000,
  });

  // Escuchar eventos globales de sincronización de peajes entre componentes
  useEffect(() => {
    const handleTollsUpdated = () => {
      setTollStations(getCustomTollStations());
    };
    window.addEventListener('scj_tolls_updated', handleTollsUpdated);
    return () => window.removeEventListener('scj_tolls_updated', handleTollsUpdated);
  }, []);

  // ============================================================
  // SYNC EN TIEMPO REAL CON FIRESTORE — DATOS MAESTROS
  // Cuando cualquier compañero modifica la nómina, la flota,
  // los gastos o los peajes, todos los usuarios lo ven al instante.
  // ============================================================
  const { isFirebaseConnected } = useAuth();
  const masterSyncUnsubs = useRef<Array<(() => void)>>([]);

  useEffect(() => {
    if (!isFirebaseConnected) return;

    // Limpiar suscripciones anteriores
    masterSyncUnsubs.current.forEach(u => u());
    masterSyncUnsubs.current = [];

    // 1. NÓMINA en tiempo real
    const unsubStaff = subscribeToStaffFromFirestore((cloudStaff) => {
      if (cloudStaff) {
        saveCustomStaff(cloudStaff);
        setStaffList(cloudStaff);
        window.dispatchEvent(new Event('scj_staff_updated'));
      }
    });
    if (unsubStaff) masterSyncUnsubs.current.push(unsubStaff);

    // 2. FLOTA en tiempo real
    const unsubFleet = subscribeToFleetFromFirestore((cloudFleet) => {
      if (cloudFleet) {
        saveCustomFleet(cloudFleet);
        setFleetList(cloudFleet);
        window.dispatchEvent(new Event('scj_fleet_updated'));
      }
    });
    if (unsubFleet) masterSyncUnsubs.current.push(unsubFleet);

    // 3. GASTOS ADICIONALES en tiempo real
    const unsubExpenses = subscribeToExpensesFromFirestore((cloudExpenses) => {
      if (cloudExpenses) {
        saveCustomExpenses(cloudExpenses);
        setExpensesList(cloudExpenses);
        window.dispatchEvent(new Event('scj_expenses_updated'));
      }
    });
    if (unsubExpenses) masterSyncUnsubs.current.push(unsubExpenses);

    // 4. PEAJES en tiempo real
    const unsubTolls = subscribeToTollsFromFirestore((cloudTolls) => {
      if (cloudTolls) {
        saveCustomTollStations(cloudTolls);
        setTollStations(cloudTolls);
        window.dispatchEvent(new Event('scj_tolls_updated'));
      }
    });
    if (unsubTolls) masterSyncUnsubs.current.push(unsubTolls);

    // 5. TIENDAS HOGAR Y MODA en tiempo real
    const unsubStores = subscribeToStoresFromFirestore((cloudStores) => {
      if (cloudStores) {
        saveCustomStores(cloudStores);
        setStoresList(cloudStores);
        window.dispatchEvent(new Event('scj_stores_updated'));
      }
    });
    if (unsubStores) masterSyncUnsubs.current.push(unsubStores);

    return () => {
      masterSyncUnsubs.current.forEach(u => u());
      masterSyncUnsubs.current = [];
    };
  }, [isFirebaseConnected]);

  const handleStartEditToll = (toll: TollStation) => {
    setEditingTollId(toll.id);
    setEditTariffForm({
      tariffCOP: toll.tariffCOP,
      tariffNprCOP: toll.tariffNprCOP,
      tariffNlrCOP: toll.tariffNlrCOP,
      tariffHeavyMaxCOP: toll.tariffHeavyMaxCOP,
      name: toll.name,
      corridor: toll.corridor,
      department: toll.department,
    });
  };

  const handleCancelEditToll = () => {
    setEditingTollId(null);
  };

  const handleSaveEditToll = (tollId: string) => {
    const updated = updateTollStationTariffs(tollId, {
      tariffCOP: Number(editTariffForm.tariffCOP) || 0,
      tariffNprCOP: Number(editTariffForm.tariffNprCOP) || 0,
      tariffNlrCOP: Number(editTariffForm.tariffNlrCOP) || 0,
      tariffHeavyMaxCOP: Number(editTariffForm.tariffHeavyMaxCOP) || 0,
    });
    setTollStations(updated);
    setEditingTollId(null);
    if (isFirebaseConnected) saveTollsListToFirestore(updated).catch(() => {});

    if (autoRecalculateRoutes && onUpdateRoutes) {
      const recalculated = recalculateAllRoutesTollCosts(routes, updated);
      onUpdateRoutes(recalculated);
      showNotification(`Tarifa de "${editTariffForm.name || 'peaje'}" guardada (NPR: ${formatCOP(Number(editTariffForm.tariffNprCOP))}, NLR: ${formatCOP(Number(editTariffForm.tariffNlrCOP))}). Costo de peajes en todas las rutas actualizado en vivo.`);
    } else {
      showNotification(`Tarifa de "${editTariffForm.name || 'peaje'}" guardada exitosamente.`);
    }
  };

  const handleResetTolls = () => {
    if (window.confirm('¿Desea restablecer todas las tarifas de peajes al catálogo oficial 2026? Se revertirán las tarifas editadas manualmente.')) {
      const defaults = resetCustomTollStations();
      setTollStations(defaults);
      if (isFirebaseConnected) saveTollsListToFirestore(defaults).catch(() => {});
      if (autoRecalculateRoutes && onUpdateRoutes) {
        const recalculated = recalculateAllRoutesTollCosts(routes, defaults);
        onUpdateRoutes(recalculated);
      }
      showNotification('Tarifas oficiales de peajes 2026 restablecidas exitosamente.');
    }
  };

  const handleSyncRoutesTolls = () => {
    if (onUpdateRoutes) {
      const recalculated = recalculateAllRoutesTollCosts(routes, tollStations);
      onUpdateRoutes(recalculated);
      showNotification(`Sincronización completa: Se actualizaron los peajes en las ${routes.length} rutas según las tarifas vigentes.`);
    }
  };

  const handleCreateNewToll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTollForm.name.trim()) return;
    const cleanId = `TOLL-${newTollForm.name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, '-')}`;
    const newStation: TollStation = {
      id: cleanId,
      name: newTollForm.name.trim(),
      corridor: newTollForm.corridor.trim() || 'Corredor Vial Nacional',
      department: newTollForm.department.trim() || 'Antioquia',
      municipality: newTollForm.municipality.trim() || undefined,
      lat: Number(newTollForm.lat) || 6.2,
      lng: Number(newTollForm.lng) || -75.5,
      tariffCOP: Number(newTollForm.tariffCOP) || 0,
      tariffNprCOP: Number(newTollForm.tariffNprCOP) || 0,
      tariffNlrCOP: Number(newTollForm.tariffNlrCOP) || 0,
      tariffHeavyMaxCOP: Number(newTollForm.tariffHeavyMaxCOP) || 0,
    };
    const updated = addCustomTollStation(newStation);
    setTollStations(updated);
    if (isFirebaseConnected) saveTollsListToFirestore(updated).catch(() => {});
    setIsAddingNewToll(false);
    setNewTollForm({
      name: '',
      corridor: '',
      department: 'Antioquia',
      municipality: '',
      lat: 6.2,
      lng: -75.5,
      tariffCOP: 15000,
      tariffNprCOP: 22000,
      tariffNlrCOP: 15000,
      tariffHeavyMaxCOP: 75000,
    });
    if (autoRecalculateRoutes && onUpdateRoutes) {
      const recalculated = recalculateAllRoutesTollCosts(routes, updated);
      onUpdateRoutes(recalculated);
    }
    showNotification(`Estación "${newStation.name}" agregada con éxito al catálogo.`);
  };

  const handleDeleteCustomToll = (tollId: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar la estación de peaje "${name}"?`)) {
      const updated = removeCustomTollStation(tollId);
      setTollStations(updated);
      if (isFirebaseConnected) saveTollsListToFirestore(updated).catch(() => {});
      if (autoRecalculateRoutes && onUpdateRoutes) {
        const recalculated = recalculateAllRoutesTollCosts(routes, updated);
        onUpdateRoutes(recalculated);
      }
      showNotification(`Estación "${name}" eliminada.`);
    }
  };

  const filteredTollStations = useMemo(() => {
    if (!tollSearchTerm.trim()) return tollStations;
    const term = tollSearchTerm.toLowerCase();
    return tollStations.filter(t =>
      t.name.toLowerCase().includes(term) ||
      t.corridor.toLowerCase().includes(term) ||
      t.department.toLowerCase().includes(term) ||
      (t.municipality && t.municipality.toLowerCase().includes(term))
    );
  }, [tollStations, tollSearchTerm]);

  // --- GESTIÓN Y EDICIÓN DE TIENDAS HOGAR Y MODA Y COORDENADAS GPS ---
  const [storesList, setStoresList] = useState<HogarYModaStore[]>(() => getCustomStores());
  const [storeSearchTerm, setStoreSearchTerm] = useState<string>('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('TODOS');
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [isAddingNewStore, setIsAddingNewStore] = useState<boolean>(false);
  const [isSyncingFirestoreStores, setIsSyncingFirestoreStores] = useState<boolean>(false);
  const [pasteCoordInput, setPasteCoordInput] = useState<string>('');

  const [storeForm, setStoreForm] = useState<{
    id: string;
    name: string;
    municipality: string;
    address: string;
    lat: number;
    lng: number;
    dischargeMinutes: number;
    phone: string;
    contactPerson: string;
    notes: string;
  }>({
    id: '',
    name: '',
    municipality: '',
    address: '',
    lat: 6.2,
    lng: -75.5,
    dischargeMinutes: 45,
    phone: '',
    contactPerson: '',
    notes: ''
  });

  // Escuchar eventos globales de sincronización de tiendas entre componentes
  useEffect(() => {
    const handleStoresUpdated = () => {
      setStoresList(getCustomStores());
    };
    window.addEventListener('scj_stores_updated', handleStoresUpdated);
    return () => window.removeEventListener('scj_stores_updated', handleStoresUpdated);
  }, []);

  const handleParseCoordinatesFromText = (raw: string) => {
    setPasteCoordInput(raw);
    if (!raw.trim()) return;

    // Caso 1: URL de Google Maps con @lat,lng
    const atMatch = raw.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (atMatch) {
      setStoreForm(prev => ({
        ...prev,
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2])
      }));
      return;
    }

    // Caso 2: URL de Google Maps con ?q=lat,lng o destination=lat,lng
    const qMatch = raw.match(/[?&](?:q|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (qMatch) {
      setStoreForm(prev => ({
        ...prev,
        lat: parseFloat(qMatch[1]),
        lng: parseFloat(qMatch[2])
      }));
      return;
    }

    // Caso 3: Dos números decimales separados por coma, espacio o punto y coma
    const pairMatch = raw.match(/(-?\d+\.\d+)[\s,;]+(-?\d+\.\d+)/);
    if (pairMatch) {
      setStoreForm(prev => ({
        ...prev,
        lat: parseFloat(pairMatch[1]),
        lng: parseFloat(pairMatch[2])
      }));
      return;
    }
  };

  const handleStartEditStore = (store: HogarYModaStore) => {
    setEditingStoreId(store.id);
    setIsAddingNewStore(false);
    setPasteCoordInput(`${store.lat}, ${store.lng}`);
    setStoreForm({
      id: store.id,
      name: store.name,
      municipality: store.municipality,
      address: store.address || '',
      lat: store.lat,
      lng: store.lng,
      dischargeMinutes: store.dischargeMinutes || 45,
      phone: store.phone || '',
      contactPerson: store.contactPerson || '',
      notes: store.notes || ''
    });
  };

  const handleStartAddNewStore = () => {
    const existingNums = storesList
      .map(s => {
        const m = s.id.match(/^L-(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 53;
    const nextId = `L-${String(nextNum).padStart(3, '0')}`;

    setIsAddingNewStore(true);
    setEditingStoreId(nextId);
    setPasteCoordInput('');
    setStoreForm({
      id: nextId,
      name: '',
      municipality: 'Medellín, Antioquia',
      address: '',
      lat: 6.2442,
      lng: -75.5812,
      dischargeMinutes: 45,
      phone: '',
      contactPerson: '',
      notes: ''
    });
  };

  const handleCancelEditStore = () => {
    setEditingStoreId(null);
    setIsAddingNewStore(false);
  };

  const handleSaveStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeForm.id.trim() || !storeForm.name.trim()) {
      alert('Ingresa el código y el nombre del punto de entrega.');
      return;
    }

    const cleanId = storeForm.id.trim().toUpperCase();
    const updatedStore: HogarYModaStore = {
      id: cleanId,
      name: storeForm.name.trim(),
      municipality: storeForm.municipality.trim() || 'Colombia',
      address: storeForm.address.trim() || undefined,
      lat: Number(storeForm.lat),
      lng: Number(storeForm.lng),
      dischargeMinutes: Number(storeForm.dischargeMinutes) || 45,
      isOriginWarehouse: cleanId === 'L-000',
      phone: storeForm.phone.trim() || undefined,
      contactPerson: storeForm.contactPerson.trim() || undefined,
      notes: storeForm.notes.trim() || undefined,
      updatedAt: new Date().toISOString()
    };

    const updated = addCustomStore(updatedStore);
    setStoresList(updated);
    setEditingStoreId(null);
    setIsAddingNewStore(false);

    try {
      await saveStoreToFirestore(updatedStore);
      showNotification(`📍 Coordenadas de "${updatedStore.name}" (${updatedStore.id}) guardadas en Firestore y sincronizadas con el mapa.`);
    } catch (err) {
      showNotification(`📍 Coordenadas de "${updatedStore.name}" guardadas localmente y en el mapa.`);
    }
  };

  const handleDeleteStore = async (storeId: string, storeName: string) => {
    if (storeId === 'L-000') {
      alert('El CEDI Caldas - Portal Industrial del Sur es el origen logístico principal de SCJ y no se puede eliminar.');
      return;
    }
    if (window.confirm(`¿Seguro que deseas eliminar la tienda "${storeName}" (${storeId}) de la base de datos y Firestore?`)) {
      const updated = removeCustomStore(storeId);
      setStoresList(updated);
      try {
        await deleteStoreFromFirestore(storeId);
        showNotification(`Tienda "${storeName}" eliminada de Firestore y base de datos.`);
      } catch (err) {
        showNotification(`Tienda "${storeName}" eliminada de la base de datos local.`);
      }
    }
  };

  const handleSyncFirestoreStores = async () => {
    setIsSyncingFirestoreStores(true);
    try {
      const cloud = await fetchStoresFromFirestore();
      setStoresList(cloud);
      showNotification(`Sincronización exitosa: ${cloud.length} tiendas cargadas desde Cloud Firestore.`);
    } catch (err) {
      showNotification('Error al consultar tiendas desde Firestore.');
    } finally {
      setIsSyncingFirestoreStores(false);
    }
  };

  const handleResetDefaultStores = () => {
    if (window.confirm('¿Restablecer el directorio oficial de tiendas Hogar y Moda? Se revertirán las coordenadas manuales a los valores oficiales.')) {
      const defaults = resetCustomStores();
      setStoresList(defaults);
      showNotification('Directorio de tiendas restablecido con éxito.');
    }
  };

  // Departamentos presentes en el catálogo para el filtro
  const availableDepartments = useMemo(() => {
    const deps = new Set<string>();
    storesList.forEach(s => {
      const parts = s.municipality.split(',');
      if (parts.length > 1) {
        const dep = parts[parts.length - 1].replace(/\(.*\)/, '').trim();
        if (dep) deps.add(dep);
      }
    });
    return Array.from(deps).sort();
  }, [storesList]);

  // Lista filtrada de tiendas
  const filteredStores = useMemo(() => {
    let list = storesList;
    if (selectedDepartmentFilter !== 'TODOS') {
      list = list.filter(s =>
        s.municipality.toLowerCase().includes(selectedDepartmentFilter.toLowerCase())
      );
    }
    if (storeSearchTerm.trim()) {
      const q = storeSearchTerm.toLowerCase();
      list = list.filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.municipality.toLowerCase().includes(q) ||
        (s.address && s.address.toLowerCase().includes(q))
      );
    }
    return list;
  }, [storesList, selectedDepartmentFilter, storeSearchTerm]);

  // Cargar base maestra inicial oficial de SCJ
  const handleLoadMasterRoutes = () => {
    onUpdateRoutes(INITIAL_ROUTES);
    showNotification('Base maestra oficial SCJ restaurada con éxito (matriz oficial con fletes, peajes y viáticos).');
  };

  // Desgloses de costos calculados en vivo para las rutas
  const routeBreakdowns = useMemo(() => {
    return routes.map(route => ({
      route,
      breakdown: calculateRouteCost(route, selectedVehicle, laborConfig)
    }));
  }, [routes, selectedVehicle, laborConfig]);

  // Filtro de rutas
  const filteredRoutes = useMemo(() => {
    if (!searchTerm.trim()) return routeBreakdowns;
    const term = searchTerm.toLowerCase();
    return routeBreakdowns.filter(({ route }) =>
      route.id.toLowerCase().includes(term) ||
      route.name.toLowerCase().includes(term) ||
      route.zone.toLowerCase().includes(term)
    );
  }, [routeBreakdowns, searchTerm]);

  // Totales consolidados de la matriz
  const masterTotals = useMemo(() => {
    let totalNpr = 0;
    let totalNlr = 0;
    let totalKm = 0;
    let totalTollsNpr = 0;
    let totalTollsNlr = 0;
    let totalViaticos = 0;
    let totalAcpm = 0;
    let totalMtto = 0;
    let totalCost = 0;
    let totalProfit = 0;

    filteredRoutes.forEach(({ route, breakdown }) => {
      totalNpr += route.freightTariffNpr || 0;
      totalNlr += route.freightTariffNlr || 0;
      totalKm += route.km;
      totalTollsNpr += route.tollEstimatedCost || 0;
      totalTollsNlr += (route.tollEstimatedCostNlr !== undefined ? route.tollEstimatedCostNlr : route.tollEstimatedCost) || 0;
      totalViaticos += route.viaticosCOP || 0;
      totalAcpm += breakdown.fuelCost;
      totalMtto += breakdown.totalMaintenanceCost;
      totalCost += breakdown.totalTripCost;
      totalProfit += breakdown.netProfitCOP;
    });

    const avgMargin = totalNpr > 0 ? (totalProfit / totalNpr) * 100 : 0;

    return {
      totalNpr,
      totalNlr,
      totalKm,
      totalTollsNpr,
      totalTollsNlr,
      totalViaticos,
      totalAcpm,
      totalMtto,
      totalCost,
      totalProfit,
      avgMargin
    };
  }, [filteredRoutes]);

  // ==========================================
  // 1. GESTIÓN Y EDICIÓN DE PERSONAL (NÓMINA)
  // ==========================================
  const [staffList, setStaffList] = useState<CrewMemberResource[]>(() => getCustomStaff());
  const [staffSearchTerm, setStaffSearchTerm] = useState<string>('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState<{
    name: string;
    document: string;
    role: 'CONDUCTOR' | 'AUXILIAR' | 'POLIFUNCIONAL' | 'COORDINADOR';
    phone: string;
    monthlyBaseSalary: number;
    hasTransportAllowance: boolean;
    arlRiskLevel: 'I' | 'II' | 'III' | 'IV' | 'V';
    eps: string;
    afp: string;
    hourlyOrdinaryRate: number;
    hourlyOvertimeDayRate: number;
    hourlyOvertimeNightRate: number;
    status: 'ACTIVO' | 'INACTIVO' | 'VACACIONES';
  }>({
    name: '',
    document: '',
    role: 'POLIFUNCIONAL',
    phone: '',
    monthlyBaseSalary: 1850000,
    hasTransportAllowance: true,
    arlRiskLevel: 'IV',
    eps: 'SURA',
    afp: 'PROTECCIÓN',
    hourlyOrdinaryRate: 8000,
    hourlyOvertimeDayRate: 17488,
    hourlyOvertimeNightRate: 23000,
    status: 'ACTIVO'
  });

  // ==========================================
  // 2. GESTIÓN Y EDICIÓN DE FLOTA VEHICULAR
  // ==========================================
  const [fleetList, setFleetList] = useState<FleetVehicleResource[]>(() => getCustomFleet());
  const [fleetSearchTerm, setFleetSearchTerm] = useState<string>('');
  const [isFleetModalOpen, setIsFleetModalOpen] = useState<boolean>(false);
  const [editingFleetPlate, setEditingFleetPlate] = useState<string | null>(null);
  const [fleetForm, setFleetForm] = useState<{
    plate: string;
    name: string;
    vehicleType: 'NPR' | 'NLR' | 'NKR' | 'NHR' | 'SENCILLO';
    capacityTons: number;
    modelYear: number;
    fuelEfficiencyKmPerGal: number;
    maintenanceCostPerKm: number;
    assignedDriverName: string;
    soatExpiry: string;
    rtmExpiry: string;
  }>({
    plate: '',
    name: '',
    vehicleType: 'NPR',
    capacityTons: 4.8,
    modelYear: 2024,
    fuelEfficiencyKmPerGal: 22.5,
    maintenanceCostPerKm: 326,
    assignedDriverName: '',
    soatExpiry: 'Vigente',
    rtmExpiry: 'Vigente'
  });

  // ==========================================
  // 3. GESTIÓN Y EDICIÓN DE GASTOS ADICIONALES
  // ==========================================
  const [expensesList, setExpensesList] = useState<AdditionalExpenseConcept[]>(() => getCustomExpenses());
  const [expenseSearchTerm, setExpenseSearchTerm] = useState<string>('');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState<{
    tipo: string;
    descripcion: string;
    valorSugerido: number;
    unidad: string;
  }>({
    tipo: '',
    descripcion: '',
    valorSugerido: 25000,
    unidad: 'Por servicio'
  });

  // Sincronización global reactiva con eventos de almacenamiento
  useEffect(() => {
    const handleStaffUpdated = () => setStaffList(getCustomStaff());
    const handleFleetUpdated = () => setFleetList(getCustomFleet());
    const handleExpensesUpdated = () => setExpensesList(getCustomExpenses());

    window.addEventListener('scj_staff_updated', handleStaffUpdated);
    window.addEventListener('scj_fleet_updated', handleFleetUpdated);
    window.addEventListener('scj_expenses_updated', handleExpensesUpdated);

    return () => {
      window.removeEventListener('scj_staff_updated', handleStaffUpdated);
      window.removeEventListener('scj_fleet_updated', handleFleetUpdated);
      window.removeEventListener('scj_expenses_updated', handleExpensesUpdated);
    };
  }, []);

  // Handlers Nómina
  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffForm({
      name: '',
      document: '',
      role: 'POLIFUNCIONAL',
      phone: '',
      monthlyBaseSalary: 1850000,
      hasTransportAllowance: true,
      arlRiskLevel: 'IV',
      eps: 'SURA',
      afp: 'PROTECCIÓN',
      hourlyOrdinaryRate: 8000,
      hourlyOvertimeDayRate: 17488,
      hourlyOvertimeNightRate: 23000,
      status: 'ACTIVO'
    });
    setIsStaffModalOpen(true);
  };

  const handleStartEditStaff = (staff: CrewMemberResource) => {
    setEditingStaffId(staff.id);
    const defSal = staff.role === 'COORDINADOR' ? 2600000 : (staff.role === 'AUXILIAR' ? (laborConfig.helperSalary || 1750905) : (laborConfig.driverSalary || 1750905));
    setStaffForm({
      name: staff.name,
      document: staff.document,
      role: (staff.role as any) || 'POLIFUNCIONAL',
      phone: staff.phone || '',
      monthlyBaseSalary: staff.monthlyBaseSalary || defSal,
      hasTransportAllowance: (staff as any).hasTransportAllowance !== false,
      arlRiskLevel: (staff as any).arlRiskLevel || (staff.role === 'AUXILIAR' ? 'III' : 'IV'),
      eps: (staff as any).eps || 'SURA',
      afp: (staff as any).afp || 'PROTECCIÓN',
      hourlyOrdinaryRate: staff.hourlyOrdinaryRate || 8000,
      hourlyOvertimeDayRate: staff.hourlyOvertimeDayRate || 17488,
      hourlyOvertimeNightRate: staff.hourlyOvertimeNightRate || 23000,
      status: staff.status || 'ACTIVO'
    });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.document.trim()) {
      alert('Ingresa el nombre completo y número de cédula.');
      return;
    }

    let updated: CrewMemberResource[];
    const isHelper = staffForm.role === 'AUXILIAR';
    const ordRate = isHelper ? (laborConfig.helperHourlyOrdinaryRate || 8338) : (laborConfig.hourlyOrdinaryRate || 8000);
    const dayExt = isHelper ? (laborConfig.helperOvertimeDayRate || 10423) : (laborConfig.hourlyOvertimeDayRate || 17488);
    const nightExt = isHelper ? (laborConfig.helperOvertimeNightRate || 14592) : (laborConfig.hourlyOvertimeNightRate || 23000);
    const baseSal = Number(staffForm.monthlyBaseSalary) || 1750905;

    if (editingStaffId) {
      updated = staffList.map(s => s.id === editingStaffId ? {
        ...s,
        name: staffForm.name.trim(),
        document: staffForm.document.trim(),
        role: staffForm.role,
        phone: staffForm.phone.trim() || '',
        monthlyBaseSalary: baseSal,
        hasTransportAllowance: staffForm.hasTransportAllowance,
        arlRiskLevel: staffForm.arlRiskLevel,
        eps: staffForm.eps.trim() || 'SURA',
        afp: staffForm.afp.trim() || 'PROTECCIÓN',
        hourlyOrdinaryRate: ordRate,
        hourlyOvertimeDayRate: dayExt,
        hourlyOvertimeNightRate: nightExt,
        status: staffForm.status
      } as any : s);
      showNotification(`Colaborador "${staffForm.name}" actualizado y sincronizado.`);
    } else {
      const newId = `SCJ-P${Date.now().toString().slice(-4)}`;
      const newMember: any = {
        id: newId,
        name: staffForm.name.trim(),
        document: staffForm.document.trim(),
        role: staffForm.role,
        phone: staffForm.phone.trim() || '',
        monthlyBaseSalary: baseSal,
        hasTransportAllowance: staffForm.hasTransportAllowance,
        arlRiskLevel: staffForm.arlRiskLevel,
        eps: staffForm.eps.trim() || 'SURA',
        afp: staffForm.afp.trim() || 'PROTECCIÓN',
        hourlyOrdinaryRate: ordRate,
        hourlyOvertimeDayRate: dayExt,
        hourlyOvertimeNightRate: nightExt,
        status: staffForm.status
      };
      updated = [newMember, ...staffList];
      showNotification(`Colaborador "${staffForm.name}" agregado a la nómina.`);
    }

    saveCustomStaff(updated);
    setStaffList(updated);
    if (isFirebaseConnected) {
      try {
        await saveStaffListToFirestore(updated);
      } catch (err) {
        console.warn('Error guardando en Firestore:', err);
      }
    }
    setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar a "${name}" de la nómina oficial?`)) {
      const updated = staffList.filter(s => s.id !== id);
      saveCustomStaff(updated);
      setStaffList(updated);
      if (isFirebaseConnected) {
        try {
          await deleteStaffMemberFromFirestore(id);
          await saveStaffListToFirestore(updated);
        } catch (e) {
          console.warn('Error eliminando colaborador en Firestore:', e);
        }
      }
      showNotification(`Colaborador "${name}" eliminado de la nómina permanentemente.`);
    }
  };

  const handleResetStaff = () => {
    if (window.confirm('¿Restablecer la nómina al listado oficial de colaboradores SCJ?')) {
      const defaults = resetCustomStaff();
      setStaffList(defaults);
      if (isFirebaseConnected) saveStaffListToFirestore(defaults).catch(() => {});
      showNotification('Nómina oficial restablecida.');
    }
  };

  // Handlers Flota
  const handleOpenAddFleet = () => {
    setEditingFleetPlate(null);
    setFleetForm({
      plate: '',
      name: '',
      vehicleType: 'NPR',
      capacityTons: 4.8,
      modelYear: 2024,
      fuelEfficiencyKmPerGal: 22.5,
      maintenanceCostPerKm: 326,
      assignedDriverName: '',
      soatExpiry: 'Vigente',
      rtmExpiry: 'Vigente'
    });
    setIsFleetModalOpen(true);
  };

  const handleStartEditFleet = (veh: FleetVehicleResource) => {
    setEditingFleetPlate(veh.plate);
    setFleetForm({
      plate: veh.plate,
      name: veh.name,
      vehicleType: veh.vehicleType,
      capacityTons: veh.capacityTons,
      modelYear: veh.modelYear || 2024,
      fuelEfficiencyKmPerGal: veh.fuelEfficiencyKmPerGal || (veh.vehicleType === 'NLR' ? 31.0 : 22.5),
      maintenanceCostPerKm: veh.maintenanceCostPerKm || (veh.vehicleType === 'NLR' ? 247 : 326),
      assignedDriverName: veh.assignedDriverName || '',
      soatExpiry: veh.soatExpiry || 'Vigente',
      rtmExpiry: veh.rtmExpiry || 'Vigente'
    });
    setIsFleetModalOpen(true);
  };

  const handleSaveFleet = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = fleetForm.plate.trim().toUpperCase();
    if (!cleanPlate || !fleetForm.name.trim()) {
      alert('Ingresa la placa y el nombre del camión.');
      return;
    }

    let updated: FleetVehicleResource[];
    if (editingFleetPlate) {
      updated = fleetList.map(f => f.plate.toUpperCase() === editingFleetPlate.toUpperCase() ? {
        ...f,
        plate: cleanPlate,
        name: fleetForm.name.trim(),
        vehicleType: fleetForm.vehicleType,
        capacityTons: Number(fleetForm.capacityTons) || 4.8,
        modelYear: Number(fleetForm.modelYear) || 2024,
        fuelEfficiencyKmPerGal: Number(fleetForm.fuelEfficiencyKmPerGal) || 22.5,
        maintenanceCostPerKm: Number(fleetForm.maintenanceCostPerKm) || 326,
        assignedDriverName: fleetForm.assignedDriverName.trim() || '',
        soatExpiry: fleetForm.soatExpiry.trim() || 'Vigente',
        rtmExpiry: fleetForm.rtmExpiry.trim() || 'Vigente'
      } : f);
      showNotification(`Camión ${cleanPlate} actualizado correctamente.`);
    } else {
      const newUnit: FleetVehicleResource = {
        plate: cleanPlate,
        vehicleProfileId: 'perfil_' + fleetForm.vehicleType.toLowerCase(),
        name: fleetForm.name.trim(),
        vehicleType: fleetForm.vehicleType,
        capacityTons: Number(fleetForm.capacityTons) || 4.8,
        modelYear: Number(fleetForm.modelYear) || 2024,
        fuelEfficiencyKmPerGal: Number(fleetForm.fuelEfficiencyKmPerGal) || 22.5,
        maintenanceCostPerKm: Number(fleetForm.maintenanceCostPerKm) || 326,
        assignedDriverName: fleetForm.assignedDriverName.trim() || '',
        soatExpiry: fleetForm.soatExpiry.trim() || 'Vigente',
        rtmExpiry: fleetForm.rtmExpiry.trim() || 'Vigente'
      };
      updated = [newUnit, ...fleetList];
      showNotification(`Camión ${cleanPlate} añadido a la flota.`);
    }

    saveCustomFleet(updated);
    setFleetList(updated);
    if (isFirebaseConnected) {
      try {
        await saveFleetListToFirestore(updated);
      } catch (err) {
        console.warn('Error guardando flota Firestore:', err);
      }
    }
    setIsFleetModalOpen(false);
  };

  const handleDeleteFleet = (plate: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el vehículo ${plate} (${name}) de la flota?`)) {
      const updated = fleetList.filter(f => f.plate.toUpperCase() !== plate.toUpperCase());
      saveCustomFleet(updated);
      setFleetList(updated);
      if (isFirebaseConnected) saveFleetListToFirestore(updated).catch(() => {});
      showNotification(`Vehículo "${plate}" eliminado de la flota.`);
    }
  };

  const handleResetFleet = () => {
    if (window.confirm('¿Restablecer la plantilla vehicular al listado oficial de la flota SCJ?')) {
      const defaults = resetCustomFleet();
      setFleetList(defaults);
      if (isFirebaseConnected) saveFleetListToFirestore(defaults).catch(() => {});
      showNotification('Plantilla vehicular restablecida con éxito.');
    }
  };

  // Handlers Gastos Adicionales
  const handleOpenAddExpense = () => {
    setEditingExpenseId(null);
    setExpenseForm({
      tipo: '',
      descripcion: '',
      valorSugerido: 25000,
      unidad: 'Por servicio'
    });
    setIsExpenseModalOpen(true);
  };

  const handleStartEditExpense = (item: AdditionalExpenseConcept) => {
    setEditingExpenseId(item.id);
    setExpenseForm({
      tipo: item.tipo,
      descripcion: item.descripcion,
      valorSugerido: item.valorSugerido,
      unidad: item.unidad
    });
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.tipo.trim()) {
      alert('Ingresa el tipo o nombre del gasto.');
      return;
    }

    let updated: AdditionalExpenseConcept[];
    if (editingExpenseId) {
      updated = expensesList.map(e => e.id === editingExpenseId ? {
        ...e,
        tipo: expenseForm.tipo.trim().toUpperCase(),
        descripcion: expenseForm.descripcion.trim(),
        valorSugerido: Number(expenseForm.valorSugerido) || 0,
        unidad: expenseForm.unidad.trim() || 'Por servicio'
      } : e);
      showNotification(`Concepto de gasto "${expenseForm.tipo}" actualizado.`);
    } else {
      const newId = `GA-${Date.now().toString().slice(-4)}`;
      const newExpense: AdditionalExpenseConcept = {
        id: newId,
        tipo: expenseForm.tipo.trim().toUpperCase(),
        descripcion: expenseForm.descripcion.trim(),
        valorSugerido: Number(expenseForm.valorSugerido) || 0,
        unidad: expenseForm.unidad.trim() || 'Por servicio'
      };
      updated = [...expensesList, newExpense];
      showNotification(`Concepto "${expenseForm.tipo}" agregado al catálogo.`);
    }

    saveCustomExpenses(updated);
    setExpensesList(updated);
    if (isFirebaseConnected) saveExpensesListToFirestore(updated).catch(() => {});
    setIsExpenseModalOpen(false);
  };

  const handleDeleteExpense = (id: string, tipo: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el concepto de gasto "${tipo}"?`)) {
      const updated = expensesList.filter(e => e.id !== id);
      saveCustomExpenses(updated);
      setExpensesList(updated);
      if (isFirebaseConnected) saveExpensesListToFirestore(updated).catch(() => {});
      showNotification(`Concepto "${tipo}" eliminado.`);
    }
  };

  const handleResetExpenses = () => {
    if (window.confirm('¿Restablecer el catálogo de gastos adicionales a los valores sugeridos iniciales?')) {
      const defaults = resetCustomExpenses();
      setExpensesList(defaults);
      if (isFirebaseConnected) saveExpensesListToFirestore(defaults).catch(() => {});
      showNotification('Catálogo de gastos restablecido.');
    }
  };

  // Handler Eliminar Ruta de la Matriz Base
  const handleDeleteRoute = (route: DeliveryRoute) => {
    if (window.confirm(`¿Seguro que deseas eliminar la ruta "${route.id} - ${route.name}" del catálogo base?`)) {
      const updatedRoutes = routes.filter(r => r.id !== route.id);
      onUpdateRoutes(updatedRoutes);
      showNotification(`Ruta "${route.id}" eliminada del catálogo.`);
    }
  };

  // Filtros de listas
  const filteredStaff = useMemo(() => {
    if (!staffSearchTerm.trim()) return staffList;
    const term = staffSearchTerm.toLowerCase();
    return staffList.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.document.toLowerCase().includes(term) ||
      s.role.toLowerCase().includes(term)
    );
  }, [staffList, staffSearchTerm]);

  const filteredFleet = useMemo(() => {
    if (!fleetSearchTerm.trim()) return fleetList;
    const term = fleetSearchTerm.toLowerCase();
    return fleetList.filter(f =>
      f.plate.toLowerCase().includes(term) ||
      f.name.toLowerCase().includes(term) ||
      f.vehicleType.toLowerCase().includes(term) ||
      (f.assignedDriverName && f.assignedDriverName.toLowerCase().includes(term))
    );
  }, [fleetList, fleetSearchTerm]);

  const filteredExpenses = useMemo(() => {
    if (!expenseSearchTerm.trim()) return expensesList;
    const term = expenseSearchTerm.toLowerCase();
    return expensesList.filter(e =>
      e.tipo.toLowerCase().includes(term) ||
      e.descripcion.toLowerCase().includes(term) ||
      e.unidad.toLowerCase().includes(term)
    );
  }, [expensesList, expenseSearchTerm]);

  return (
    <div className="space-y-4">

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-medium">{notification}</span>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded uppercase tracking-wider">
                SCJ Transportes · Tablas Maestras
              </span>
              <span className="text-xs text-slate-400">
                Operador Logístico Independiente · SCJ
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tablas Maestras y Parámetros Operativos SCJ
            </h1>
            <p className="text-xs text-slate-500">
              Datos oficiales de flota SCJ, personal, rutas, tarifas de peajes 2026 y directorio georreferenciado de tiendas Hogar y Moda.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleLoadMasterRoutes}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
              title="Restaurar la matriz maestra oficial de rutas"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restaurar Matriz Maestra Oficial</span>
            </button>

            <button
              onClick={onExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar Excel / CSV</span>
            </button>

            <button
              onClick={onOpenNewRoute}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Ruta</span>
            </button>
          </div>
        </div>

        {/* Sub-Navegación de Tablas Maestras */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveSubTab('payroll_scj')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'payroll_scj'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1. Nómina & Personal ({staffList.length} Colaboradores)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('fleet_scj')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'fleet_scj'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>2. Plantilla Vehicular ({fleetList.length} Camiones)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('budget_scj')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'budget_scj'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>3. Catálogo de Rutas Base ({routes.length} Rutas)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tolls_scj')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'tolls_scj'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>4. Peajes Registrados ({tollStations.length} Estaciones)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('stores_scj')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'stores_scj'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>5. Tiendas Hogar y Moda & GPS ({storesList.length} Locales)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('additional_scj')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'additional_scj'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>6. Gastos Adicionales ({expensesList.length} Conceptos)</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: MATRIZ PRESUPUESTAL SCJ */}
      {activeSubTab === 'budget_scj' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar rutas por nombre o zona..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenNewRoute}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Ruta & Configurar Flete</span>
              </button>
              <div className="text-xs text-slate-500">
                Mostrando <strong className="text-slate-800">{filteredRoutes.length}</strong> de {routes.length} rutas
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">POS / Destino Vial</th>
                    <th className="py-3 px-3 text-right bg-blue-50 text-blue-950 font-bold" title="Flete cobrado al cliente para camión NPR Turbo">Flete NPR</th>
                    <th className="py-3 px-3 text-right bg-sky-50 text-sky-950 font-bold" title="Flete cobrado al cliente para camioneta NLR">Flete NLR</th>
                    <th className="py-3 px-3 text-right">Km Retorno</th>
                    <th className="py-3 px-3 text-right">Peajes NPR</th>
                    <th className="py-3 px-3 text-right">Peajes NLR</th>
                    <th className="py-3 px-3 text-right">Viáticos</th>
                    <th className="py-3 px-3 text-right">ACPM Est.</th>
                    <th className="py-3 px-3 text-right">Mtto. Est.</th>
                    <th className="py-3 px-3 text-right bg-slate-100 font-bold text-slate-900">Costo Total</th>
                    <th className="py-3 px-3 text-right font-bold text-emerald-800">Utilidad</th>
                    <th className="py-3 px-3 text-center">% Ganancia</th>
                    <th className="py-3 px-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredRoutes.map(({ route, breakdown }) => (
                    <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-700">{route.id}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-bold text-slate-900">{route.name}</div>
                        <div className="text-[10px] text-slate-400">{route.zone}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-900 bg-blue-50/20">
                        {route.freightTariffNpr ? formatCOP(route.freightTariffNpr) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-sky-900 bg-sky-50/20">
                        {route.freightTariffNlr ? formatCOP(route.freightTariffNlr) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">{formatNumber(route.km, 1)} km</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatCOP(route.tollEstimatedCost)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatCOP(route.tollEstimatedCostNlr || route.tollEstimatedCost)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatCOP(route.viaticosCOP || 0)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatCOP(breakdown.fuelCost)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatCOP(breakdown.totalMaintenanceCost)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 bg-slate-50">{formatCOP(breakdown.totalTripCost)}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${breakdown.netProfitCOP < 0 ? 'text-rose-700' : 'text-emerald-800'}`}>
                        {formatCOP(breakdown.netProfitCOP)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          breakdown.profitPercentage >= 15 ? 'bg-emerald-100 text-emerald-800' : breakdown.profitPercentage > 0 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {breakdown.profitPercentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {onEditRoute && (
                            <button
                              onClick={() => onEditRoute(route)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                              title="Configurar y editar fletes, viáticos, peajes y paradas de esta ruta"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectRouteForDetail(breakdown)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Ver desglose detallado de costos y planilla"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoute(route)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar ruta del catálogo base"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-mono font-bold text-xs select-none">
                    <td colSpan={2} className="py-3 px-3 font-sans">
                      TOTAL CONSOLIDADO ({filteredRoutes.length} RUTAS)
                    </td>
                    <td className="py-3 px-3 text-right text-blue-300 bg-slate-800">
                      {formatCOP(masterTotals.totalNpr, true)}
                    </td>
                    <td className="py-3 px-3 text-right text-sky-300 bg-slate-800">
                      {formatCOP(masterTotals.totalNlr, true)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-200">
                      {formatNumber(masterTotals.totalKm, 1)} km
                    </td>
                    <td className="py-3 px-3 text-right text-blue-300">
                      {formatCOP(masterTotals.totalTollsNpr, true)}
                    </td>
                    <td className="py-3 px-3 text-right text-sky-300">
                      {formatCOP(masterTotals.totalTollsNlr, true)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {formatCOP(masterTotals.totalViaticos, true)}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-300">
                      {formatCOP(masterTotals.totalAcpm, true)}
                    </td>
                    <td className="py-3 px-3 text-right text-cyan-300">
                      {formatCOP(masterTotals.totalMtto, true)}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-400 font-black bg-slate-800">
                      {formatCOP(masterTotals.totalCost, true)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-black bg-slate-800">
                      {formatCOP(masterTotals.totalProfit, true)}
                    </td>
                    <td className="py-3 px-3 text-center text-emerald-400 font-black">
                      {masterTotals.avgMargin.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 font-normal">
                      —
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PLANTILLA VEHICULAR SCJ */}
      {activeSubTab === 'fleet_scj' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-amber-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
                  <span>Plantilla Vehicular SCJ</span>
                  <span className="text-[10px] bg-amber-200/70 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                    {fleetList.length} Unidades Registradas
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Gestiona la flota de camiones y camionetas de la empresa. Puedes <strong>agregar nuevos vehículos</strong>, editar rendimientos de ACPM, costo de mantenimiento por km, conductor asignado, o eliminar unidades.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={handleResetFleet}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Restablecer flota oficial inicial"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Restablecer Flota</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAddFleet}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Vehículo</span>
              </button>
            </div>
          </div>

          {/* Buscador de flota */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={fleetSearchTerm}
              onChange={(e) => setFleetSearchTerm(e.target.value)}
              placeholder="Buscar vehículo por placa, nombre, tipo (NPR, NLR) o conductor asignado..."
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {fleetSearchTerm && (
              <button onClick={() => setFleetSearchTerm('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grid de Vehículos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredFleet.map((veh) => {
              const isNpr = veh.vehicleType === 'NPR';
              const isNlr = veh.vehicleType === 'NLR';

              return (
                <div key={veh.plate} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 bg-slate-900 text-white rounded font-mono font-bold text-sm tracking-wider">
                        {veh.plate}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          isNpr ? 'bg-blue-100 text-blue-800' : isNlr ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {veh.vehicleType} ({veh.capacityTons} Ton)
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mb-1">{veh.name}</h3>
                    <div className="text-xs text-slate-500 mb-3">
                      {veh.modelYear ? `Modelo ${veh.modelYear} • ` : ''}Capacidad: {veh.capacityTons} Toneladas
                      {veh.assignedDriverName ? ` • Conductor: ${veh.assignedDriverName}` : ''}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rendimiento ACPM:</span>
                        <span className="font-semibold text-slate-800">{veh.fuelEfficiencyKmPerGal || (isNlr ? 31.0 : 22.5)} km/gal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mantenimiento SICE-TAC:</span>
                        <span className="font-semibold text-slate-800">${formatNumber(veh.maintenanceCostPerKm || (isNlr ? 247 : 326))} / km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Técnico-Mecánica (RTM):</span>
                        <span className="font-semibold text-emerald-700">{veh.rtmExpiry || 'Vigente ✓'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Póliza SOAT:</span>
                        <span className="font-semibold text-emerald-700">{veh.soatExpiry || 'Vigente ✓'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 border-t border-slate-100 mt-4 pt-3">
                    <button
                      type="button"
                      onClick={() => handleStartEditFleet(veh)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFleet(veh.plate, veh.name)}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: NOMINA SCJ */}
      {activeSubTab === 'payroll_scj' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-blue-950 flex items-center gap-2">
                  <span>Nómina y Colaboradores Oficiales SCJ</span>
                  <span className="text-[10px] bg-blue-200/70 text-blue-900 font-extrabold px-2 py-0.5 rounded-full">
                    {staffList.length} Colaboradores
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Directorio del personal operativo. Tarifas base: Hora Ordinaria: <strong>$8.000 COP</strong> | HED: <strong>$17.488 COP</strong> | HEN: <strong>$23.000 COP</strong>.
                  Puedes <strong>agregar nuevo personal</strong>, modificar cargos, teléfonos, tarifas individuales o dar de baja registros.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {onNavigateToLabor && (
                <button
                  type="button"
                  onClick={onNavigateToLabor}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Configurador CST
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenAddStaff}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Colaborador</span>
              </button>
            </div>
          </div>

          {/* Buscador de personal */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={staffSearchTerm}
              onChange={(e) => setStaffSearchTerm(e.target.value)}
              placeholder="Buscar colaborador por nombre, número de cédula o cargo..."
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {staffSearchTerm && (
              <button onClick={() => setStaffSearchTerm('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Nombre Completo</th>
                  <th className="py-3 px-3">Cédula de Ciudadanía</th>
                  <th className="py-3 px-3">Cargo / Rol</th>
                  <th className="py-3 px-3">Teléfono / Celular</th>
                  <th className="py-3 px-3">Régimen de Tarifa (Nómina)</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredStaff.map((worker, idx) => {
                  const isHelper = worker.role === 'AUXILIAR';
                  const activeHourly = isHelper
                    ? (laborConfig.helperHourlyOrdinaryRate || 8338)
                    : (laborConfig.hourlyOrdinaryRate || 8000);

                  return (
                    <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{worker.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{worker.document}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          worker.role === 'POLIFUNCIONAL'
                            ? 'bg-purple-100 text-purple-800'
                            : worker.role === 'CONDUCTOR'
                            ? 'bg-blue-100 text-blue-800'
                            : worker.role === 'AUXILIAR'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {worker.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{worker.phone || '—'}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            isHelper
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-blue-50 text-blue-900 border-blue-200'
                          }`} title="Tarifa vinculada automáticamente desde la Base de Cálculo">
                            <span>{isHelper ? 'Tarifa Auxiliar' : 'Tarifa Conductor'}</span>
                            <span className="font-mono font-bold text-slate-700">({formatCOP(activeHourly)}/h)</span>
                          </span>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Base: <strong className="text-slate-800">{formatCOP(worker.monthlyBaseSalary || (isHelper ? 1750905 : 1850000))}</strong>
                          </div>
                        </div>
                      </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 font-bold text-[10px] rounded-full ${
                        worker.status === 'INACTIVO'
                          ? 'bg-slate-100 text-slate-600'
                          : worker.status === 'VACACIONES'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {worker.status || 'ACTIVO'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditStaff(worker)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar colaborador"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(worker.id, worker.name)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar colaborador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: TARIFAS PEAJES 2026 - TOTALMENTE EDITABLES */}
      {activeSubTab === 'tolls_scj' && (
        <div className="space-y-4">
          {/* Banner explicativo */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-blue-950 flex items-center gap-2">
                  <span>Catálogo de Tarifas de Peajes Editables (INVIAS y Concesiones)</span>
                  <span className="text-[10px] bg-blue-200/70 text-blue-900 font-extrabold px-2 py-0.5 rounded-full">
                    {tollStations.length} Estaciones
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Si el Ministerio de Transporte o las concesionarias (Covipacífico, Pacífico Tres, Vías del Nus, Devimed) aumentan el costo de un peaje,
                  puedes <strong>editar su valor directamente con el botón de lápiz</strong>. Todas las rutas de la red y análisis de costos se recalculan en tiempo real.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={handleSyncRoutesTolls}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shadow-blue-500/20 cursor-pointer"
                title="Recalcular costos de peajes de todas las rutas de la matriz según las tarifas vigentes"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sincronizar Red de Rutas</span>
              </button>
            </div>
          </div>

          {/* Barra de Controles y Búsqueda */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por peaje, concesión, departamento o municipio..."
                  value={tollSearchTerm}
                  onChange={(e) => setTollSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden transition-all"
                />
                {tollSearchTerm && (
                  <button
                    onClick={() => setTollSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer select-none bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={autoRecalculateRoutes}
                  onChange={(e) => setAutoRecalculateRoutes(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Actualizar rutas asociadas al guardar</span>
              </label>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddingNewToll(!isAddingNewToll)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isAddingNewToll
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-500/20'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingNewToll ? 'Cerrar Registro' : '+ Nueva Estación'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetTolls}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Restablecer tarifas oficiales 2026 de SCJ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Oficiales</span>
              </button>
            </div>
          </div>

          {/* Formulario para agregar una nueva estación */}
          {isAddingNewToll && (
            <form onSubmit={handleCreateNewToll} className="bg-emerald-50/60 border-2 border-emerald-300 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Registrar Nueva Estación de Peaje en Colombia
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingNewToll(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre de la Estación *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Peaje Andes / Primavera"
                    value={newTollForm.name}
                    onChange={(e) => setNewTollForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Corredor Vial / Concesión *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pacífico 1 / Vías del Nus"
                    value={newTollForm.corridor}
                    onChange={(e) => setNewTollForm(prev => ({ ...prev, corridor: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Departamento</label>
                  <input
                    type="text"
                    placeholder="Ej. Antioquia, Caldas, Tolima"
                    value={newTollForm.department}
                    onChange={(e) => setNewTollForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Municipio</label>
                  <input
                    type="text"
                    placeholder="Ej. Caldas, Santa Bárbara"
                    value={newTollForm.municipality}
                    onChange={(e) => setNewTollForm(prev => ({ ...prev, municipality: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarifa Categoría I ($ COP) *</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={newTollForm.tariffCOP}
                    onChange={(e) => setNewTollForm(prev => ({ ...prev, tariffCOP: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white font-mono focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="bg-blue-100/40 p-2.5 rounded-xl border border-blue-200">
                  <label className="font-bold text-blue-950 block mb-1">Tarifa Camión NPR - 2 Ejes ($ COP) *</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={newTollForm.tariffNprCOP}
                    onChange={(e) => setNewTollForm(prev => ({ ...prev, tariffNprCOP: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 rounded-lg border-2 border-blue-500 bg-white font-mono font-bold text-blue-900 focus:outline-hidden"
                  />
                </div>

                <div className="bg-sky-100/40 p-2.5 rounded-xl border border-sky-200">
                  <label className="font-bold text-sky-950 block mb-1">Tarifa Camioneta NLR ($ COP) *</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={newTollForm.tariffNlrCOP}
                    onChange={(e) => setNewTollForm(prev => ({ ...prev, tariffNlrCOP: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 rounded-lg border-2 border-sky-500 bg-white font-mono font-bold text-sky-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarifa Carga Pesada VII ($ COP)</label>
                  <input
                    type="number"
                    step="100"
                    value={newTollForm.tariffHeavyMaxCOP}
                    onChange={(e) => setNewTollForm(prev => ({ ...prev, tariffHeavyMaxCOP: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white font-mono focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200">
                <button
                  type="button"
                  onClick={() => setIsAddingNewToll(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar e Integrar al Sistema</span>
                </button>
              </div>
            </form>
          )}

          {/* Tabla de Peajes con Edición Inline */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-3 px-3">Estación de Peaje</th>
                    <th className="py-3 px-3">Corredor Vial</th>
                    <th className="py-3 px-3">Departamento</th>
                    <th className="py-3 px-3 text-right">Categoría I</th>
                    <th className="py-3 px-3 text-right bg-blue-50 text-blue-950 font-bold border-x border-blue-200">NPR - 2 Ejes</th>
                    <th className="py-3 px-3 text-right bg-sky-50 text-sky-950 font-bold border-r border-sky-200">NLR - Camioneta</th>
                    <th className="py-3 px-3 text-right">Carga Pesada (VII)</th>
                    <th className="py-3 px-3 text-center w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredTollStations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                        No se encontraron peajes que coincidan con <strong>"{tollSearchTerm}"</strong>.
                      </td>
                    </tr>
                  ) : (
                    filteredTollStations.map((toll) => {
                      const isEditing = editingTollId === toll.id;
                      const isCustom = !KNOWN_TOLLS.some(k => k.id === toll.id);

                      return (
                        <tr
                          key={toll.id}
                          className={`transition-colors ${
                            isEditing
                              ? 'bg-amber-50/70 border-y-2 border-amber-300'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>{toll.name}</span>
                              {isCustom && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                  Nuevo
                                </span>
                              )}
                              {isEditing && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 animate-pulse">
                                  Editando
                                </span>
                              )}
                            </div>
                            {toll.municipality && (
                              <div className="text-[10px] text-slate-400 font-normal">{toll.municipality}</div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 font-sans text-slate-600">{toll.corridor}</td>
                          <td className="py-2.5 px-3 font-sans text-slate-500">{toll.department}</td>

                          {/* Categoría I */}
                          <td className="py-2.5 px-3 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                step="100"
                                min="0"
                                value={editTariffForm.tariffCOP}
                                onChange={(e) => setEditTariffForm(prev => ({ ...prev, tariffCOP: Number(e.target.value) }))}
                                className="w-24 px-2 py-1 text-right text-xs font-mono font-bold rounded-lg border border-slate-300 bg-white focus:border-blue-600 focus:outline-hidden"
                              />
                            ) : (
                              <span className="text-slate-600">{formatCOP(toll.tariffCOP)}</span>
                            )}
                          </td>

                          {/* NPR - 2 Ejes */}
                          <td className="py-2.5 px-3 text-right bg-blue-50/30 border-x border-blue-100">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <input
                                  type="number"
                                  step="100"
                                  min="0"
                                  value={editTariffForm.tariffNprCOP}
                                  onChange={(e) => setEditTariffForm(prev => ({ ...prev, tariffNprCOP: Number(e.target.value) }))}
                                  className="w-28 px-2 py-1 text-right text-xs font-mono font-extrabold text-blue-950 bg-white rounded-lg border-2 border-blue-600 focus:outline-hidden shadow-2xs"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <span className="font-extrabold text-blue-900">{formatCOP(toll.tariffNprCOP)}</span>
                            )}
                          </td>

                          {/* NLR - Camioneta */}
                          <td className="py-2.5 px-3 text-right bg-sky-50/30 border-r border-sky-100">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <input
                                  type="number"
                                  step="100"
                                  min="0"
                                  value={editTariffForm.tariffNlrCOP}
                                  onChange={(e) => setEditTariffForm(prev => ({ ...prev, tariffNlrCOP: Number(e.target.value) }))}
                                  className="w-28 px-2 py-1 text-right text-xs font-mono font-bold text-sky-950 bg-white rounded-lg border-2 border-sky-600 focus:outline-hidden shadow-2xs"
                                />
                              </div>
                            ) : (
                              <span className="font-bold text-sky-900">{formatCOP(toll.tariffNlrCOP)}</span>
                            )}
                          </td>

                          {/* Carga Pesada */}
                          <td className="py-2.5 px-3 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                step="100"
                                min="0"
                                value={editTariffForm.tariffHeavyMaxCOP}
                                onChange={(e) => setEditTariffForm(prev => ({ ...prev, tariffHeavyMaxCOP: Number(e.target.value) }))}
                                className="w-24 px-2 py-1 text-right text-xs font-mono rounded-lg border border-slate-300 bg-white focus:border-blue-600 focus:outline-hidden"
                              />
                            ) : (
                              <span className="text-slate-500">{formatCOP(toll.tariffHeavyMaxCOP)}</span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="py-2.5 px-3 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1.5 font-sans">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditToll(toll.id)}
                                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                                  title="Guardar nueva tarifa"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditToll}
                                  className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                  title="Cancelar edición"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1 font-sans">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditToll(toll)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  title="Editar valores de este peaje"
                                >
                                  <Edit2 className="w-3 h-3 text-blue-600" />
                                  <span>Editar</span>
                                </button>
                                {isCustom && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCustomToll(toll.id, toll.name)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Eliminar este peaje personalizado"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Barra de pie con promedios y resumen */}
            <div className="bg-slate-50 border-t border-slate-200 p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-800">
                  Mostrando {filteredTollStations.length} de {tollStations.length} estaciones
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  Promedio NPR: <strong className="text-blue-900 font-mono">{formatCOP(Math.round(tollStations.reduce((a, b) => a + (b.tariffNprCOP || 0), 0) / (tollStations.length || 1)))}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  Promedio NLR: <strong className="text-sky-900 font-mono">{formatCOP(Math.round(tollStations.reduce((a, b) => a + (b.tariffNlrCOP || 0), 0) / (tollStations.length || 1)))}</strong>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Edición en caliente: sincronizada con GPS, Google Maps y la matriz de rutas.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: TIENDAS HOGAR Y MODA & COORDENADAS GPS */}
      {activeSubTab === 'stores_scj' && (
        <div className="space-y-4">

          {/* Banner de Contexto SCJ -> Hogar y Moda */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-sm border border-blue-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
                  SCJ Transportes · Directorio Georreferenciado
                </span>
                <span className="text-[11px] text-slate-300">
                  SCJ · Operador Logístico Independiente
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>Almacenes Hogar y Moda & Coordenadas GPS Oficiales</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Registra o calibra las coordenadas geográficas exactas (WGS84) de cada tienda para que el camión llegue al punto exacto. Los cambios se guardan en <strong>Cloud Firestore</strong> y actualizan inmediatamente el mapa de Google Maps.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                type="button"
                onClick={handleSyncFirestoreStores}
                disabled={isSyncingFirestoreStores}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Sincronizar catálogo con las últimas coordenadas de Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFirestoreStores ? 'animate-spin text-blue-300' : 'text-slate-300'}`} />
                <span>{isSyncingFirestoreStores ? 'Sincronizando...' : 'Sincronizar Firestore'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaultStores}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Revertir a las coordenadas oficiales de Hogar y Moda"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                <span>Restaurar Base</span>
              </button>

              <button
                type="button"
                onClick={handleStartAddNewStore}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Nueva Tienda</span>
              </button>
            </div>
          </div>

          {/* Estadísticas de Locales y CEDI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Total Puntos de Entrega</span>
              <div className="text-xl font-black text-slate-900 mt-1 font-mono flex items-center gap-1.5">
                <span>{storesList.length}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">locales</span>
              </div>
              <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">Red nacional activa</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Bodega Central (Origen)</span>
              <div className="text-xs font-black text-slate-900 mt-1.5 truncate">
                CEDI Caldas (Portal Sur)
              </div>
              <span className="text-[10px] text-slate-500 block truncate mt-0.5">Cra 47 #100 Sur - 40</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Departamentos Cubiertos</span>
              <div className="text-xl font-black text-indigo-700 mt-1 font-mono flex items-center gap-1.5">
                <span>{availableDepartments.length}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">regiones</span>
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">Antioquia, Caldas, Valle...</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Precisión GPS en Mapa</span>
              <div className="text-xl font-black text-emerald-700 mt-1 font-mono flex items-center gap-1.5">
                <span>100%</span>
                <span className="text-xs text-slate-400 font-sans font-normal">WGS84</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Lat/Lng decimal exacta</span>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={storeSearchTerm}
                onChange={(e) => setStoreSearchTerm(e.target.value)}
                placeholder="Buscar por código (ej: L-001), municipio, nombre o dirección..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {storeSearchTerm && (
                <button
                  type="button"
                  onClick={() => setStoreSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">Departamento:</label>
              <select
                value={selectedDepartmentFilter}
                onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="TODOS">Todos los Departamentos ({storesList.length})</option>
                {availableDepartments.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={onNavigateToMaps}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                title="Abrir el visor interactivo de Google Maps"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Ver Mapa Interactivo</span>
              </button>
            </div>
          </div>

          {/* Tabla de Tiendas y Coordenadas GPS */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-3">Nombre del Almacén</th>
                    <th className="py-3 px-3">Municipio y Depto</th>
                    <th className="py-3 px-3">Dirección Física / Referencia</th>
                    <th className="py-3 px-3">Coordenadas GPS (WGS84)</th>
                    <th className="py-3 px-3 text-center">Descargue</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStores.map((store) => {
                    const isCedi = store.id === 'L-000';
                    return (
                      <tr
                        key={store.id}
                        className={`hover:bg-blue-50/40 transition-colors ${
                          isCedi ? 'bg-blue-50/30 font-semibold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            isCedi
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}>
                            {store.id}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{store.name}</span>
                            {isCedi && (
                              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                                Bodega Central
                              </span>
                            )}
                          </div>
                          {store.phone && (
                            <span className="text-[10px] text-slate-400 font-normal block">
                              Tel: {store.phone} {store.contactPerson ? `· ${store.contactPerson}` : ''}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {store.municipality}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate" title={store.address || 'Sin dirección física registrada'}>
                          {store.address || (
                            <span className="text-slate-300 italic">No especificada</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">
                            <Compass className="w-3 h-3 text-blue-600" />
                            <span>{store.lat.toFixed(5)}, {store.lng.toFixed(5)}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold font-mono text-[11px]">
                            {store.dischargeMinutes} min
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`https://www.google.com/maps?q=${store.lat},${store.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title={`Abrir ubicación exacta de ${store.name} en Google Maps`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleStartEditStore(store)}
                              className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                              title="Modificar coordenadas exactas o dirección"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Editar GPS</span>
                            </button>
                            {!isCedi && (
                              <button
                                type="button"
                                onClick={() => handleDeleteStore(store.id, store.name)}
                                className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar tienda del directorio"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredStores.length === 0 && (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Building2 className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No se encontraron tiendas que coincidan con la búsqueda.</p>
                <button
                  type="button"
                  onClick={() => { setStoreSearchTerm(''); setSelectedDepartmentFilter('TODOS'); }}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Restablecer filtros
                </button>
              </div>
            )}

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-semibold text-slate-700">
                Mostrando {filteredStores.length} de {storesList.length} puntos de entrega georreferenciados
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Las coordenadas se inyectan en tiempo real en los algoritmos de ruta y en Google Maps.</span>
              </span>
            </div>
          </div>

          {/* Modal / Formulario Flotante de Registro y Edición de Coordenadas */}
          {editingStoreId && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-6">

                {/* Cabecera del Modal */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white tracking-tight">
                        {isAddingNewStore ? 'Registrar Nueva Tienda / Punto de Entrega' : 'Calibrar Coordenadas GPS de Tienda'}
                      </h3>
                      <p className="text-xs text-slate-300">
                        Hogar y Moda S.A.S. · Flota SCJ Transportes
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEditStore}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSaveStoreSubmit} className="p-5 space-y-4 text-xs">

                  {/* Fila 1: Código y Nombre */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Código de Tienda *
                      </label>
                      <input
                        type="text"
                        value={storeForm.id}
                        onChange={(e) => setStoreForm(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                        disabled={!isAddingNewStore && storeForm.id === 'L-000'}
                        required
                        placeholder="Ej: L-053"
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">
                        Nombre Oficial del Almacén *
                      </label>
                      <input
                        type="text"
                        value={storeForm.name}
                        onChange={(e) => setStoreForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="Ej: Hogar y Moda San Jerónimo"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fila 2: Municipio y Tiempo de Descargue */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">
                        Municipio y Departamento *
                      </label>
                      <input
                        type="text"
                        value={storeForm.municipality}
                        onChange={(e) => setStoreForm(prev => ({ ...prev, municipality: e.target.value }))}
                        required
                        placeholder="Ej: San Jerónimo, Antioquia"
                        className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Descargue (min)
                      </label>
                      <select
                        value={storeForm.dischargeMinutes}
                        onChange={(e) => setStoreForm(prev => ({ ...prev, dischargeMinutes: Number(e.target.value) }))}
                        className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min (Estándar)</option>
                        <option value={60}>60 min (1 hora)</option>
                        <option value={90}>90 min (1.5 horas)</option>
                        <option value={120}>120 min (CEDI Caldas)</option>
                      </select>
                    </div>
                  </div>

                  {/* Fila 3: Dirección Física */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Dirección Física o Referencia Exacta
                    </label>
                    <input
                      type="text"
                      value={storeForm.address}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Ej: Cra 11 # 19-32 frente al Parque Principal"
                      className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  {/* CAJA INTELIGENTE DE COORDENADAS GPS */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs">
                        <Compass className="w-4 h-4 text-blue-700" />
                        <span>Coordenadas Geográficas GPS (WGS84)</span>
                      </div>
                      <span className="text-[10px] text-blue-700 font-semibold">
                        Sincronización en vivo con Google Maps
                      </span>
                    </div>

                    {/* Pegado Rápido Inteligente */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Pegar enlace de Google Maps o coordenadas (Auto-extracción):
                      </label>
                      <input
                        type="text"
                        value={pasteCoordInput}
                        onChange={(e) => handleParseCoordinatesFromText(e.target.value)}
                        placeholder="Ej: 5.452800, -75.651400 o pega https://maps.google.com/?q=..."
                        className="w-full p-2 bg-white border border-blue-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Inputs de Latitud y Longitud */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Latitud Decimal (Norte: +) *
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={storeForm.lat}
                          onChange={(e) => setStoreForm(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                          required
                          placeholder="Ej: 5.452800"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Longitud Decimal (Oeste: -) *
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={storeForm.lng}
                          onChange={(e) => setStoreForm(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                          required
                          placeholder="Ej: -75.651400"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Botón de Verificación en Google Maps */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">
                        Haz clic para validar el punto en el mapa oficial:
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${storeForm.lat},${storeForm.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-3 h-3 text-blue-600" />
                        <span>Verificar Punto en Google Maps</span>
                      </a>
                    </div>
                  </div>

                  {/* Fila 4: Teléfono y Contacto */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Teléfono del Local
                      </label>
                      <input
                        type="text"
                        value={storeForm.phone}
                        onChange={(e) => setStoreForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Ej: (604) 845-1234"
                        className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Administrador o Contacto
                      </label>
                      <input
                        type="text"
                        value={storeForm.contactPerson}
                        onChange={(e) => setStoreForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                        placeholder="Ej: Administrador de Tienda"
                        className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fila 5: Observaciones para Conductor */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Instrucciones de Acceso Vehicular (Flota SCJ)
                    </label>
                    <textarea
                      rows={2}
                      value={storeForm.notes}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Ej: Bahía de descargue estrecha. Ingresar en retroceso con ayudante. Restricción de cargue después de las 11:00 am."
                      className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleCancelEditStore}
                      className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm shadow-blue-500/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar en Firestore y Base de Datos</span>
                    </button>
                  </div>

                </form>

              </div>
            </div>
          )}

        </div>
      )}

      {/* SUBTAB 6: GASTOS ADICIONALES Y OPERATIVOS */}
      {activeSubTab === 'additional_scj' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 text-xs text-purple-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-purple-500/20">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-purple-950 flex items-center gap-2">
                  <span>Catálogo de Gastos Adicionales y Operativos SCJ</span>
                  <span className="text-[10px] bg-purple-200/70 text-purple-900 font-extrabold px-2 py-0.5 rounded-full">
                    {expensesList.length} Conceptos
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Conceptos de gastos operativos en ruta (engrase, montallanta, pernoctadas, básculas, viáticos adicionales).
                  Puedes <strong>crear nuevos gastos</strong>, ajustar los valores sugeridos o eliminar conceptos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={handleResetExpenses}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Restablecer conceptos originales de gastos"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Restablecer Gastos</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAddExpense}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-xs shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Concepto de Gasto</span>
              </button>
            </div>
          </div>

          {/* Buscador de gastos */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={expenseSearchTerm}
              onChange={(e) => setExpenseSearchTerm(e.target.value)}
              placeholder="Buscar gasto por tipo, descripción o unidad..."
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {expenseSearchTerm && (
              <button onClick={() => setExpenseSearchTerm('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExpenses.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-purple-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">{item.tipo}</span>
                    <span className="font-mono font-bold text-purple-700 text-sm">{formatCOP(item.valorSugerido)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{item.descripcion}</p>
                  <div className="text-[10px] text-slate-400 font-mono">Unidad de cómputo: {item.unidad}</div>
                </div>

                <div className="flex items-center justify-end gap-1.5 border-t border-slate-100 mt-3 pt-2.5">
                  <button
                    type="button"
                    onClick={() => handleStartEditExpense(item)}
                    className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(item.id, item.tipo)}
                    className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Fórmula del Gasto Operativo SCJ</h3>
            <p className="text-xs text-slate-600">
              De acuerdo con la hoja <strong>"gasto operativo scj"</strong>, el costo total operativo de cada ruta se integra por cuatro factores fundamentales:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <div className="font-bold text-slate-800">1. Combustible ACPM</div>
                <div className="text-[11px] text-slate-500 mt-1">Km recorridos x Consumo galón según perfil</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <div className="font-bold text-slate-800">2. Peajes Ida y Regreso</div>
                <div className="text-[11px] text-slate-500 mt-1">Tarifa oficial 2026 NPR vs NLR por estación</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <div className="font-bold text-slate-800">3. Horas Laboradas</div>
                <div className="text-[11px] text-slate-500 mt-1">Ordinarias ($8.000) + Extras ($17.488 / $23.000) + CST</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <div className="font-bold text-slate-800">4. Viáticos de Ruta</div>
                <div className="text-[11px] text-slate-500 mt-1">Pernoctada y alimentación fijada en matriz</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRAR / EDITAR COLABORADOR DE NÓMINA */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingStaffId ? 'Editar Colaborador / Nómina SCJ' : 'Registrar Nuevo Colaborador SCJ'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="flex flex-col flex-1 overflow-hidden min-h-0 text-xs">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pr-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    placeholder="Ej: Carlos Alberto Gómez"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Cédula de Ciudadanía *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.document}
                    onChange={(e) => setStaffForm({ ...staffForm, document: e.target.value })}
                    placeholder="Ej: 1.036.789.123"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Cargo / Especialidad *</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="POLIFUNCIONAL">POLIFUNCIONAL (Conduce y Descarga)</option>
                    <option value="CONDUCTOR">CONDUCTOR (Transporte y Manifiesto)</option>
                    <option value="AUXILIAR">AUXILIAR (Cargue y Descargue)</option>
                    <option value="COORDINADOR">COORDINADOR (Logística y Despacho)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Teléfono / Celular</label>
                  <input
                    type="text"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    placeholder="Ej: 300 123 4567"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Estado Operativo</label>
                  <select
                    value={staffForm.status}
                    onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="ACTIVO">🟢 ACTIVO (Disponible)</option>
                    <option value="VACACIONES">🟡 VACACIONES</option>
                    <option value="INACTIVO">🔴 INACTIVO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sueldo Base Mensual (COP) *</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={staffForm.monthlyBaseSalary}
                    onChange={(e) => setStaffForm({ ...staffForm, monthlyBaseSalary: Number(e.target.value) || 0 })}
                    placeholder="Ej: 1750905"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">¿Aplica Auxilio de Transporte? *</label>
                  <select
                    value={staffForm.hasTransportAllowance ? 'true' : 'false'}
                    onChange={(e) => setStaffForm({ ...staffForm, hasTransportAllowance: e.target.value === 'true' })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="true">Sí Aplica (+{formatCOP(laborConfig.auxilioTransporteLegal || 249095)})</option>
                    <option value="false">No Aplica ($0)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nivel de Riesgo ARL *</label>
                  <select
                    value={staffForm.arlRiskLevel}
                    onChange={(e) => setStaffForm({ ...staffForm, arlRiskLevel: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="I">Nivel I - 0.522% (Administrativo)</option>
                    <option value="II">Nivel II - 1.044%</option>
                    <option value="III">Nivel III - 2.436% (Auxiliar / Bodega)</option>
                    <option value="IV">Nivel IV - 4.350% (Conductor Carretera)</option>
                    <option value="V">Nivel V - 6.960% (Alto Riesgo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">EPS (Entidad de Salud)</label>
                  <input
                    type="text"
                    value={staffForm.eps}
                    onChange={(e) => setStaffForm({ ...staffForm, eps: e.target.value })}
                    placeholder="Ej: SURA, Sanitas, Compensar"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fondo de Pensión (AFP)</label>
                  <input
                    type="text"
                    value={staffForm.afp}
                    onChange={(e) => setStaffForm({ ...staffForm, afp: e.target.value })}
                    placeholder="Ej: Protección, Porvenir, Colpensiones"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cálculo en Vivo del Costo Empresa y Valor Hora */}
              {(() => {
                const base = Number(staffForm.monthlyBaseSalary) || 1750905;
                const aux = staffForm.hasTransportAllowance ? Number(laborConfig.auxilioTransporteLegal || 249095) : 0;
                const arlPct = staffForm.arlRiskLevel === 'V' ? 0.0696 : staffForm.arlRiskLevel === 'IV' ? 0.0435 : staffForm.arlRiskLevel === 'III' ? 0.02436 : staffForm.arlRiskLevel === 'II' ? 0.01044 : 0.00522;
                const ssPara = base * (0.12 + 0.085 + arlPct + 0.04 + 0.02 + 0.03);
                const prest = (base + aux) * (0.0833 + 0.0833 + 0.01) + (base * 0.0417);
                const totalEmp = Math.round(base + aux + ssPara + prest);
                const valorHora = Math.round(totalEmp / (laborConfig.monthlyWorkingHours || 210));

                return (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-blue-950 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Cálculo en Vivo de Costo Nómina Empresa:
                      </span>
                      <span className="text-sm font-black text-blue-900 font-mono">
                        {formatCOP(totalEmp)} /mes
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1 border-t border-blue-200/60">
                      <div>Base: <strong>{formatCOP(base)}</strong></div>
                      <div>Auxilio: <strong>{formatCOP(aux)}</strong></div>
                      <div>Valor Hora Real: <strong>{formatCOP(valorHora)}/h</strong></div>
                    </div>
                  </div>
                );
              })()}
<div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-950 text-xs">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Régimen Salarial Centralizado (Base de Cálculo):</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Este colaborador aplica automáticamente la <strong>{staffForm.role === 'AUXILIAR' ? 'Tarifa Maestra de Auxiliar' : 'Tarifa Maestra de Conductor'}</strong> configurada globalmente ({formatCOP(staffForm.role === 'AUXILIAR' ? (laborConfig.helperHourlyOrdinaryRate || 8338) : (laborConfig.hourlyOrdinaryRate || 8000))}/h con sus respectivos recargos de extras). No requieres digitar tarifas individuales duplicadas.
                </p>
              </div>

              </div>

              <div className="flex items-center justify-end gap-2 p-3 sm:p-4 border-t border-slate-200 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm shadow-blue-500/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar en Nómina</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR / EDITAR VEHÍCULO DE FLOTA */}
      {isFleetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingFleetPlate ? `Editar Vehículo ${editingFleetPlate}` : 'Registrar Nuevo Vehículo en Flota SCJ'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFleetModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFleet} className="flex flex-col flex-1 overflow-hidden min-h-0 text-xs">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pr-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Placa Oficial *</label>
                  <input
                    type="text"
                    required
                    maxLength={7}
                    value={fleetForm.plate}
                    onChange={(e) => setFleetForm({ ...fleetForm, plate: e.target.value.toUpperCase() })}
                    placeholder="Ej: GTX052"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold tracking-widest uppercase focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tipo de Vehículo *</label>
                  <select
                    value={fleetForm.vehicleType}
                    onChange={(e) => {
                      const vt = (e.target.value === 'TURBO' ? 'NPR' : e.target.value) as 'NPR' | 'NLR' | 'NKR' | 'NHR' | 'SENCILLO';
                      setFleetForm({
                        ...fleetForm,
                        vehicleType: vt,
                        capacityTons: vt === 'NLR' ? 3.0 : vt === 'NKR' ? 3.5 : vt === 'NHR' ? 2.5 : 4.8,
                        fuelEfficiencyKmPerGal: vt === 'NLR' ? 31.0 : vt === 'NHR' ? 34.0 : 22.5,
                        maintenanceCostPerKm: vt === 'NLR' ? 247 : vt === 'NHR' ? 210 : 326
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  >
                    <option value="NPR">NPR Turbo (4.8 Toneladas)</option>
                    <option value="NLR">NLR Camioneta (3.0 Toneladas)</option>
                    <option value="NKR">NKR Mediano (3.5 Toneladas)</option>
                    <option value="NHR">NHR Liviano (2.5 Toneladas)</option>
                    <option value="TURBO">Turbo 2 Ejes General</option>
                    <option value="SENCILLO">Camión Sencillo 2 Ejes</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Nombre / Identificador del Vehículo *</label>
                  <input
                    type="text"
                    required
                    value={fleetForm.name}
                    onChange={(e) => setFleetForm({ ...fleetForm, name: e.target.value })}
                    placeholder="Ej: NPR Turbo #1 CEDI Caldas"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Capacidad Carga (Ton)</label>
                  <input
                    type="number"
                    step="any"
                    value={fleetForm.capacityTons}
                    onChange={(e) => setFleetForm({ ...fleetForm, capacityTons: Number(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Modelo / Año</label>
                  <input
                    type="number"
                    value={fleetForm.modelYear}
                    onChange={(e) => setFleetForm({ ...fleetForm, modelYear: Number(e.target.value) || 2024 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rendimiento ACPM (km/gal)</label>
                  <input
                    type="number"
                    step="any"
                    value={fleetForm.fuelEfficiencyKmPerGal}
                    onChange={(e) => setFleetForm({ ...fleetForm, fuelEfficiencyKmPerGal: Number(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mantenimiento SICE-TAC ($/km)</label>
                  <input
                    type="number"
                    value={fleetForm.maintenanceCostPerKm}
                    onChange={(e) => setFleetForm({ ...fleetForm, maintenanceCostPerKm: Number(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Conductor Habitual Asignado</label>
                  <select
                    value={fleetForm.assignedDriverName}
                    onChange={(e) => setFleetForm({ ...fleetForm, assignedDriverName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-900 bg-white"
                  >
                    <option value="">-- Sin conductor fijo asignado --</option>
                    {staffList.filter(s => s.role === 'CONDUCTOR' || s.role === 'POLIFUNCIONAL').map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Póliza SOAT</label>
                  <input
                    type="text"
                    value={fleetForm.soatExpiry}
                    onChange={(e) => setFleetForm({ ...fleetForm, soatExpiry: e.target.value })}
                    placeholder="Vigente ✓"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Técnico-Mecánica (RTM)</label>
                  <input
                    type="text"
                    value={fleetForm.rtmExpiry}
                    onChange={(e) => setFleetForm({ ...fleetForm, rtmExpiry: e.target.value })}
                    placeholder="Vigente ✓"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              </div>

              <div className="flex items-center justify-end gap-2 p-3 sm:p-4 border-t border-slate-200 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFleetModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-sm shadow-amber-500/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Vehículo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRAR / EDITAR CONCEPTO DE GASTO ADICIONAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-purple-900 via-pink-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingExpenseId ? 'Editar Concepto de Gasto Operativo' : 'Registrar Nuevo Concepto de Gasto'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="flex flex-col flex-1 overflow-hidden min-h-0 text-xs">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pr-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre / Tipo de Gasto *</label>
                <input
                  type="text"
                  required
                  value={expenseForm.tipo}
                  onChange={(e) => setExpenseForm({ ...expenseForm, tipo: e.target.value.toUpperCase() })}
                  placeholder="Ej: BÁSCULA, ENGRASE, PARQUEADERO"
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold uppercase focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Valor Sugerido de Referencia ($ COP) *</label>
                <input
                  type="number"
                  required
                  value={expenseForm.valorSugerido}
                  onChange={(e) => setExpenseForm({ ...expenseForm, valorSugerido: Number(e.target.value) || 0 })}
                  placeholder="Ej: 35000"
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Unidad de Cómputo</label>
                <input
                  type="text"
                  value={expenseForm.unidad}
                  onChange={(e) => setExpenseForm({ ...expenseForm, unidad: e.target.value })}
                  placeholder="Ej: Por servicio, Por noche/persona, Por pesaje"
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Descripción Operativa</label>
                <textarea
                  rows={3}
                  value={expenseForm.descripcion}
                  onChange={(e) => setExpenseForm({ ...expenseForm, descripcion: e.target.value })}
                  placeholder="Detalle de cuándo y cómo se aplica este gasto en la operación..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              </div>

              <div className="flex items-center justify-end gap-2 p-3 sm:p-4 border-t border-slate-200 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-sm shadow-purple-500/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Concepto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
