import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  writeBatch,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { UserProfile, FirebaseClientConfig, UserRole } from '../types/auth';
import { DeliveryRoute, VehicleProfile, LaborConfig, TripDispatch } from '../types/logistics';
import { KNOWN_TOLLS, TollStation, getCustomTollStations } from '../data/colombiaTolls';
import { HOGAR_Y_MODA_STORES, HogarYModaStore, getCustomStores, saveCustomStores } from '../data/hogarYModaStores';
import {
  CrewMemberResource,
  FleetVehicleResource,
  AdditionalExpenseConcept,
  getCustomStaff,
  getCustomFleet,
  getCustomExpenses
} from '../data/fleetAndCrewData';

export const DEFAULT_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: "AIzaSyBqn7YzQcpD1gYws53GFuXbVUEb3uElRJM",
  authDomain: "app-empresarial-ffb59.firebaseapp.com",
  projectId: "app-empresarial-ffb59",
  storageBucket: "app-empresarial-ffb59.firebasestorage.app",
  messagingSenderId: "844586659907",
  appId: "1:844586659907:web:4388083833f1c10d78a4f6",
  measurementId: "G-WMWHZBW26S"
};

const FIREBASE_CONFIG_STORAGE_KEY = 'scj_firebase_config';

// Configuración por defecto o cargada desde localStorage / variables de entorno
export const getStoredFirebaseConfig = (): FirebaseClientConfig => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      } catch (e) {}
    }
  }

  // Si existen en variables de entorno VITE_FIREBASE_*
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY && import.meta.env?.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef",
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WMWHZBW26S"
    };
  }

  return DEFAULT_FIREBASE_CONFIG;
};

export const saveFirebaseConfig = (config: FirebaseClientConfig) => {
  localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export const initFirebase = (customConfig?: FirebaseClientConfig | null): { app: FirebaseApp | null; auth: Auth | null; db: Firestore | null } => {
  const config = customConfig || getStoredFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, auth: null, db: null };
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    return { app: appInstance, auth: authInstance, db: dbInstance };
  } catch (error) {
    console.error("Error inicializando Firebase:", error);
    return { app: null, auth: null, db: null };
  }
};

// Inicializar intento inicial
const { auth: initialAuth, db: initialDb } = initFirebase();
export { initialAuth as auth, initialDb as db };

/**
 * Usuarios de Demostración para pruebas inmediatas de roles en el sistema
 */
export const DEMO_USERS: UserProfile[] = [
  {
    uid: 'demo-admin-01',
    email: 'admin@scj.com',
    displayName: 'Carlos Restrepo',
    role: 'admin',
    status: 'approved',
    phone: '+57 312 456 7890',
    company: 'SCJ - Dirección de Operaciones',
    createdAt: '2026-01-15T08:00:00Z',
    lastLoginAt: new Date().toISOString()
  },
  {
    uid: 'demo-dispatcher-02',
    email: 'despacho@scj.com',
    displayName: 'Marta Gómez',
    role: 'dispatcher',
    status: 'approved',
    phone: '+57 310 987 6543',
    company: 'SCJ - Despacho & Flota',
    createdAt: '2026-02-01T08:00:00Z',
    lastLoginAt: new Date().toISOString()
  },
  {
    uid: 'demo-driver-03',
    email: 'conductor@scj.com',
    displayName: 'Jhonatan Morales',
    role: 'driver',
    status: 'approved',
    phone: '+57 315 123 4567',
    company: 'SCJ - Conductor NPR Turbo',
    assignedVehiclePlate: 'WGB-342',
    assignedRouteId: 'SCJ-001',
    createdAt: '2026-02-10T08:00:00Z',
    lastLoginAt: new Date().toISOString()
  },
  {
    uid: 'demo-auditor-04',
    email: 'auditor@scj.com',
    displayName: 'Gloria Valencia',
    role: 'auditor',
    status: 'approved',
    phone: '+57 320 555 1234',
    company: 'SCJ - Auditoría & Control de Gestión',
    createdAt: '2026-03-01T08:00:00Z',
    lastLoginAt: new Date().toISOString()
  }
];

/**
 * Migración y Carga de Todos los Datos de la Aplicación a Cloud Firestore
 * (Rutas, Vehículos, Tiendas Hogar y Moda, Peajes 2026 y Configuración)
 */
export async function uploadAllDataToFirestore(
  routes: DeliveryRoute[],
  vehicles: VehicleProfile[],
  laborConfig: LaborConfig,
  onProgress?: (msg: string) => void
): Promise<{
  success: boolean;
  message: string;
  count: {
    routes: number;
    tolls: number;
    stores: number;
    vehicles: number;
    dispatches: number;
    staff: number;
    fleet: number;
    expenses: number;
  }
}> {
  const { db } = initFirebase();
  if (!db) {
    throw new Error("No hay conexión activa con Firebase Firestore. Configura tus credenciales de Firebase primero.");
  }

  if (onProgress) onProgress("Iniciando conexión con Firebase Firestore...");

  // 1. Guardar Rutas Logísticas
  if (onProgress) onProgress(`Subiendo ${routes.length} rutas logísticas a la colección 'routes'...`);
  const batchRoutes = writeBatch(db);
  routes.forEach(route => {
    const routeRef = doc(db, 'routes', route.id);
    batchRoutes.set(routeRef, {
      ...route,
      syncedAt: new Date().toISOString()
    });
  });
  await batchRoutes.commit();

  // 2. Guardar Perfiles de Vehículos
  if (onProgress) onProgress(`Subiendo ${vehicles.length} perfiles de vehículos a 'vehicles'...`);
  const batchVehicles = writeBatch(db);
  vehicles.forEach(vehicle => {
    const vRef = doc(db, 'vehicles', vehicle.id);
    batchVehicles.set(vRef, {
      ...vehicle,
      syncedAt: new Date().toISOString()
    });
  });
  await batchVehicles.commit();

  // 3. Guardar Locales Hogar y Moda
  const allStores = getCustomStores();
  if (onProgress) onProgress(`Subiendo ${allStores.length} tiendas de Hogar y Moda a 'stores'...`);
  const batchStores = writeBatch(db);
  allStores.forEach(store => {
    const sRef = doc(db, 'stores', store.id);
    batchStores.set(sRef, {
      ...store,
      syncedAt: new Date().toISOString()
    });
  });
  await batchStores.commit();

  // 4. Guardar Catálogo Oficial de Peajes 2026
  const allTolls = getCustomTollStations();
  if (onProgress) onProgress(`Subiendo ${allTolls.length} peajes oficiales de Colombia a 'tolls'...`);
  const batchTolls = writeBatch(db);
  allTolls.forEach(toll => {
    const tRef = doc(db, 'tolls', toll.id);
    const tsRef = doc(db, 'toll_stations', toll.id);
    batchTolls.set(tRef, { ...toll, syncedAt: new Date().toISOString() });
    batchTolls.set(tsRef, { ...toll, syncedAt: new Date().toISOString() });
  });
  await batchTolls.commit();

  // 5. Guardar Configuración de Mano de Obra y Parámetros
  if (onProgress) onProgress("Guardando parámetros de nómina CST y costos fijos...");
  const settingsRef = doc(db, 'settings', 'labor_and_costs');
  await setDoc(settingsRef, {
    ...laborConfig,
    updatedAt: new Date().toISOString()
  });

  // 6. Guardar Salidas y Despachos de Vehículos ('dispatches')
  let dispatchesUploaded = 0;
  try {
    const rawDispatches = typeof localStorage !== 'undefined' ? localStorage.getItem('rutacost_dispatches') : null;
    if (rawDispatches) {
      const dispatches: TripDispatch[] = JSON.parse(rawDispatches).filter((d: any) => Boolean(d && d.id));
      if (dispatches.length > 0) {
        if (onProgress) onProgress(`Subiendo ${dispatches.length} salidas/despachos a la colección 'dispatches'...`);
        const batchDispatches = writeBatch(db);
        dispatches.forEach(d => {
          const dRef = doc(db, 'dispatches', d.id);
          batchDispatches.set(dRef, sanitizeForFirestore({ ...d, syncedAt: new Date().toISOString() }), { merge: true });
        });
        await batchDispatches.commit();
        dispatchesUploaded = dispatches.length;
      }
    }
  } catch (e) {
    console.warn("Aviso subiendo despachos a Firestore:", e);
  }

  // 7. Guardar Nómina de Tripulación ('conductores')
  let staffUploaded = 0;
  try {
    const staff = getCustomStaff();
    if (staff.length > 0) {
      if (onProgress) onProgress(`Subiendo ${staff.length} colaboradores a 'conductores'...`);
      const batchStaff = writeBatch(db);
      staff.forEach(s => {
        batchStaff.set(doc(db, 'conductores', s.id), sanitizeForFirestore({ ...s, syncedAt: new Date().toISOString() }), { merge: true });
      });
      await batchStaff.commit();
      staffUploaded = staff.length;
    }
  } catch (e) {
    console.warn("Aviso subiendo nómina a Firestore:", e);
  }

  // 8. Guardar Flota Operativa Real SCJ ('fleet_units')
  let fleetUploaded = 0;
  try {
    const fleet = getCustomFleet();
    if (fleet.length > 0) {
      if (onProgress) onProgress(`Subiendo ${fleet.length} camiones de flota a 'fleet_units'...`);
      const batchFleet = writeBatch(db);
      fleet.forEach(f => {
        const id = (f as any).id || f.plate;
        batchFleet.set(doc(db, 'fleet_units', id), sanitizeForFirestore({ ...f, syncedAt: new Date().toISOString() }), { merge: true });
      });
      await batchFleet.commit();
      fleetUploaded = fleet.length;
    }
  } catch (e) {
    console.warn("Aviso subiendo flota a Firestore:", e);
  }

  // 9. Guardar Conceptos de Gastos Adicionales ('expense_concepts')
  let expensesUploaded = 0;
  try {
    const expenses = getCustomExpenses();
    if (expenses.length > 0) {
      if (onProgress) onProgress(`Subiendo ${expenses.length} conceptos de gastos a 'expense_concepts'...`);
      const batchExp = writeBatch(db);
      expenses.forEach(e => {
        batchExp.set(doc(db, 'expense_concepts', e.id), sanitizeForFirestore({ ...e, syncedAt: new Date().toISOString() }), { merge: true });
      });
      await batchExp.commit();
      expensesUploaded = expenses.length;
    }
  } catch (e) {
    console.warn("Aviso subiendo gastos a Firestore:", e);
  }

  if (onProgress) onProgress("¡Migración y sincronización completada exitosamente en Firebase!");

  return {
    success: true,
    message: "Base de datos completa (rutas, salidas, nómina, flota, tiendas y peajes) cargada exitosamente en Cloud Firestore",
    count: {
      routes: routes.length,
      vehicles: vehicles.length,
      stores: allStores.length,
      tolls: allTolls.length,
      dispatches: dispatchesUploaded,
      staff: staffUploaded,
      fleet: fleetUploaded,
      expenses: expensesUploaded
    }
  };
}

/**
 * Guarda o actualiza las coordenadas y datos de una tienda en Cloud Firestore
 */
export async function saveStoreToFirestore(store: HogarYModaStore): Promise<void> {
  const { db } = initFirebase();
  if (!db) return;
  try {
    const sRef = doc(db, 'stores', store.id);
    await setDoc(sRef, {
      ...store,
      lat: Number(store.lat),
      lng: Number(store.lng),
      dischargeMinutes: Number(store.dischargeMinutes || 45),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.error(`Error guardando tienda ${store.id} en Firestore:`, e);
    throw e;
  }
}

/**
 * Elimina una tienda de Cloud Firestore
 */
export async function deleteStoreFromFirestore(storeId: string): Promise<void> {
  const { db } = initFirebase();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'stores', storeId));
  } catch (e) {
    console.error(`Error eliminando tienda ${storeId} de Firestore:`, e);
    throw e;
  }
}

/**
 * Carga la lista más actualizada de tiendas y coordenadas desde Firestore
 */
export async function fetchStoresFromFirestore(): Promise<HogarYModaStore[]> {
  const { db } = initFirebase();
  if (!db) return getCustomStores();
  try {
    const snap = await getDocs(collection(db, 'stores'));
    if (!snap.empty) {
      const loaded: HogarYModaStore[] = [];
      snap.forEach(d => {
        const data = d.data();
        loaded.push({
          id: data.id || d.id,
          name: data.name || '',
          municipality: data.municipality || '',
          lat: Number(data.lat),
          lng: Number(data.lng),
          dischargeMinutes: Number(data.dischargeMinutes || 45),
          isOriginWarehouse: Boolean(data.isOriginWarehouse),
          address: data.address || '',
          phone: data.phone || '',
          contactPerson: data.contactPerson || '',
          notes: data.notes || '',
          updatedAt: data.updatedAt
        });
      });
      loaded.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      saveCustomStores(loaded);
      return loaded;
    }
  } catch (e) {
    console.error("Error al consultar tiendas desde Firestore:", e);
  }
  return getCustomStores();
}

/**
 * Guarda o actualiza un lote completo de tiendas en Cloud Firestore
 */
export async function saveStoresListToFirestore(stores: HogarYModaStore[]): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    const batch = writeBatch(db);
    const existing = await getDocs(collection(db, 'stores'));
    const newIds = new Set(stores.map(s => s.id));
    existing.docs.forEach(d => {
      if (!newIds.has(d.id)) batch.delete(d.ref);
    });
    stores.forEach(s => {
      batch.set(doc(db, 'stores', s.id), {
        ...s,
        lat: Number(s.lat),
        lng: Number(s.lng),
        dischargeMinutes: Number(s.dischargeMinutes || 45),
        syncedAt: new Date().toISOString()
      }, { merge: true });
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.error('Error guardando tiendas en Firestore:', e);
    return false;
  }
}

/**
 * Suscripción en Tiempo Real a las tiendas Hogar y Moda en Cloud Firestore
 */
export function subscribeToStoresFromFirestore(
  onUpdate: (stores: HogarYModaStore[]) => void,
  onError?: (error: any) => void
): (() => void) | null {
  const { db } = initFirebase();
  if (!db) return null;
  try {
    return onSnapshot(collection(db, 'stores'), (snap) => {
      const stores: HogarYModaStore[] = [];
      snap.forEach(d => {
        const data = d.data();
        stores.push({
          id: data.id || d.id,
          name: data.name || '',
          municipality: data.municipality || '',
          lat: Number(data.lat),
          lng: Number(data.lng),
          dischargeMinutes: Number(data.dischargeMinutes || 45),
          isOriginWarehouse: Boolean(data.isOriginWarehouse),
          address: data.address || '',
          phone: data.phone || '',
          contactPerson: data.contactPerson || '',
          notes: data.notes || '',
          updatedAt: data.updatedAt
        });
      });
      stores.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      saveCustomStores(stores);
      onUpdate(stores);
    }, (err) => {
      console.warn("Aviso suscripción stores Firestore:", err);
      if (onError) onError(err);
    });
  } catch (e) {
    console.error("Error configurando listener de stores:", e);
    return null;
  }
}

/**
 * Guarda o actualiza una ruta en Cloud Firestore
 * Sanitiza valores undefined para evitar errores de Firestore
 */
export async function saveRouteToFirestore(route: DeliveryRoute): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    const rRef = doc(db, 'routes', route.id);
    const rawData = {
      id: route.id,
      name: route.name || '',
      zone: route.zone || 'Antioquia',
      km: Number(route.km) || 0,
      transitHours: Number(route.transitHours) || 0,
      loadingMinutes: Number(route.loadingMinutes) || 0,
      storeIds: Array.isArray(route.storeIds) ? route.storeIds : [],
      tollEstimatedCost: Number(route.tollEstimatedCost) || 0,
      tollEstimatedCostNlr: Number(route.tollEstimatedCostNlr !== undefined ? route.tollEstimatedCostNlr : route.tollEstimatedCost) || 0,
      tollCount: Number(route.tollCount) || 0,
      freightTariffNpr: Number(route.freightTariffNpr) || 0,
      freightTariffNlr: Number(route.freightTariffNlr) || 0,
      viaticosCOP: Number(route.viaticosCOP) || 0,
      additionalExpensesCOP: Number(route.additionalExpensesCOP) || 0,
      notes: route.notes || '',
      assignedVehiclePlate: route.assignedVehiclePlate || '',
      assignedDriverName: route.assignedDriverName || '',
      assignedHelperName: route.assignedHelperName || '',
      tollStations: typeof route.tollStations === 'string'
        ? route.tollStations
        : (Array.isArray(route.tollStations) ? (route.tollStations as any[]).join(' + ') : (route.tollStations || '')),
      customFuelRateKmPerGal: route.customFuelRateKmPerGal ? Number(route.customFuelRateKmPerGal) : null,
      updatedAt: new Date().toISOString()
    };
    const cleaned = sanitizeForFirestore(rawData);
    await setDoc(rRef, cleaned, { merge: true });
    return true;
  } catch (e) {
    console.error(`Error guardando ruta ${route.id} en Firestore:`, e);
    return false;
  }
}

/**
 * Elimina una ruta de Cloud Firestore
 */
export async function deleteRouteFromFirestore(routeId: string): Promise<void> {
  const { db } = initFirebase();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'routes', routeId));
  } catch (e) {
    console.error(`Error eliminando ruta ${routeId} de Firestore:`, e);
  }
}

/**
 * Carga las rutas desde Cloud Firestore si están disponibles
 */
export async function fetchRoutesFromFirestore(): Promise<DeliveryRoute[] | null> {
  const { db } = initFirebase();
  if (!db) return null;
  try {
    const snap = await getDocs(collection(db, 'routes'));
    if (!snap.empty) {
      const routes: DeliveryRoute[] = [];
      snap.forEach(d => {
        const data = d.data();
        routes.push({
          id: data.id || d.id,
          name: data.name || '',
          zone: data.zone || 'Antioquia',
          km: Number(data.km) || 0,
          transitHours: Number(data.transitHours) || 0,
          loadingMinutes: Number(data.loadingMinutes) || 0,
          storeIds: Array.isArray(data.storeIds) ? data.storeIds : [],
          tollEstimatedCost: Number(data.tollEstimatedCost) || 0,
          tollEstimatedCostNlr: Number(data.tollEstimatedCostNlr !== undefined ? data.tollEstimatedCostNlr : data.tollEstimatedCost) || 0,
          tollCount: Number(data.tollCount) || 0,
          tollStations: typeof data.tollStations === 'string'
            ? data.tollStations
            : (Array.isArray(data.tollStations) ? data.tollStations.join(' + ') : (data.tollStations || undefined)),
          freightTariffNpr: Number(data.freightTariffNpr) || undefined,
          freightTariffNlr: Number(data.freightTariffNlr) || undefined,
          viaticosCOP: Number(data.viaticosCOP) || 0,
          additionalExpensesCOP: Number(data.additionalExpensesCOP) || 0,
          notes: data.notes || undefined,
          assignedVehiclePlate: data.assignedVehiclePlate || undefined,
          assignedDriverName: data.assignedDriverName || undefined,
          assignedHelperName: data.assignedHelperName || undefined
        });
      });
      routes.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      return routes;
    }
  } catch (e) {
    console.error("Error al consultar rutas desde Firestore:", e);
  }
  return null;
}

/**
 * Suscripción en Tiempo Real a la colección 'routes' de Cloud Firestore.
 * Notifica automáticamente a todos los usuarios conectados cuando un compañero agrega, edita o elimina una ruta.
 */
export function subscribeToRoutesFromFirestore(
  onRoutesUpdate: (routes: DeliveryRoute[]) => void,
  onError?: (error: any) => void
): (() => void) | null {
  const { db } = initFirebase();
  if (!db) return null;

  try {
    const q = collection(db, 'routes');
    const unsubscribe = onSnapshot(q, (snap) => {
      const routes: DeliveryRoute[] = [];
      snap.forEach(d => {
        const data = d.data();
        routes.push({
          id: data.id || d.id,
          name: data.name || '',
          zone: data.zone || 'Antioquia',
          km: Number(data.km) || 0,
          transitHours: Number(data.transitHours) || 0,
          loadingMinutes: Number(data.loadingMinutes) || 0,
          storeIds: Array.isArray(data.storeIds) ? data.storeIds : [],
          tollEstimatedCost: Number(data.tollEstimatedCost) || 0,
          tollEstimatedCostNlr: Number(data.tollEstimatedCostNlr !== undefined ? data.tollEstimatedCostNlr : data.tollEstimatedCost) || 0,
          tollCount: Number(data.tollCount) || 0,
          tollStations: typeof data.tollStations === 'string'
            ? data.tollStations
            : (Array.isArray(data.tollStations) ? data.tollStations.join(' + ') : (data.tollStations || undefined)),
          freightTariffNpr: Number(data.freightTariffNpr) || undefined,
          freightTariffNlr: Number(data.freightTariffNlr) || undefined,
          viaticosCOP: Number(data.viaticosCOP) || 0,
          additionalExpensesCOP: Number(data.additionalExpensesCOP) || 0,
          notes: data.notes || undefined,
          assignedVehiclePlate: data.assignedVehiclePlate || undefined,
          assignedDriverName: data.assignedDriverName || undefined,
          assignedHelperName: data.assignedHelperName || undefined
        });
      });
      routes.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      onRoutesUpdate(routes);
    }, (err) => {
      console.warn("Aviso en suscripción en tiempo real de rutas Firestore:", err);
      if (onError) onError(err);
    });

    return unsubscribe;
  } catch (e) {
    console.error("Error configurando listener en tiempo real de rutas:", e);
    return null;
  }
}

/**
 * Sincroniza todas las rutas locales hacia Cloud Firestore.
 * Sube automáticamente cualquier ruta creada o editada localmente que aún no esté en la nube.
 */
export async function syncAllRoutesToFirestore(localRoutes: DeliveryRoute[]): Promise<{ uploaded: number; failed: number }> {
  const { db } = initFirebase();
  if (!db || !localRoutes || localRoutes.length === 0) return { uploaded: 0, failed: 0 };

  let uploaded = 0;
  let failed = 0;

  for (const r of localRoutes) {
    const success = await saveRouteToFirestore(r);
    if (success) {
      uploaded++;
    } else {
      failed++;
    }
  }

  return { uploaded, failed };
}

/**
 * Verifica si un correo pertenece al Superadministrador Principal
 */
export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return clean === 'jacson.munoz@gmail.com' ||
         clean === 'jacson.munozsotelo@gmail.com' ||
         clean === 'admin@hogarymoda.com';
};

/**
 * Remueve recursivamente todas las propiedades con valor 'undefined' para cumplir con las reglas de Firestore
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        result[key] = sanitizeForFirestore(val);
      } else {
        result[key] = val;
      }
    }
  }
  return result;
}

/**
 * Carga todos los usuarios registrados desde Cloud Firestore
 */
export async function fetchAllUsersFromFirestore(): Promise<UserProfile[]> {
  const { db } = initFirebase();
  if (!db) return DEMO_USERS;
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      const users: UserProfile[] = [];
      snap.forEach(d => {
        const data = d.data();
        const email = (data.email || '').toLowerCase().trim();
        const isSuperAdmin = isSuperAdminEmail(email);

        users.push({
          uid: data.uid || d.id,
          email: data.email || '',
          displayName: data.displayName || 'Colaborador SCJ',
          role: isSuperAdmin ? 'admin' : (data.role || 'dispatcher'),
          status: isSuperAdmin ? 'approved' : (data.status || 'approved'),
          phone: data.phone || '',
          company: data.company || 'SCJ',
          assignedVehiclePlate: data.assignedVehiclePlate || undefined,
          assignedRouteId: data.assignedRouteId || undefined,
          customPermissions: data.customPermissions || undefined,
          approvedBy: data.approvedBy || undefined,
          approvedByName: data.approvedByName || undefined,
          approvedAt: data.approvedAt || undefined,
          createdAt: data.createdAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt || undefined
        });
      });
      // Ordenar: pendientes primero, luego por fecha de creación descendente
      users.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
      return users;
    }
  } catch (e) {
    console.error("Error consultando usuarios desde Firestore:", e);
  }
  return DEMO_USERS;
}

/**
 * Actualiza los datos, rol o estado de aprobación de un usuario en Cloud Firestore
 */
export async function updateUserInFirestore(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const { db } = initFirebase();
  if (!db) return;
  try {
    const uRef = doc(db, 'users', uid);
    const cleaned = sanitizeForFirestore(updates);
    await setDoc(uRef, {
      ...cleaned,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.error(`Error actualizando usuario ${uid} en Firestore:`, e);
    throw e;
  }
}

/**
 * Elimina un usuario de Cloud Firestore
 */
export async function deleteUserFromFirestore(uid: string): Promise<void> {
  const { db } = initFirebase();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (e) {
    console.error(`Error eliminando usuario ${uid} de Firestore:`, e);
    throw e;
  }
}

// ==========================================
// SINCRONIZACIÓN EN TIEMPO REAL DE DESPACHOS
// Colección: 'dispatches' — documento por despacho
// ==========================================

export async function saveDispatchToFirestore(dispatch: TripDispatch): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    const cleaned = sanitizeForFirestore({ ...dispatch, syncedAt: new Date().toISOString() });
    await setDoc(doc(db, 'dispatches', dispatch.id), cleaned, { merge: true });
    return true;
  } catch (e) {
    console.error(`Error guardando despacho ${dispatch.id} en Firestore:`, e);
    return false;
  }
}

export async function deleteDispatchFromFirestore(dispatchId: string): Promise<void> {
  const { db } = initFirebase();
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'dispatches', dispatchId));
  } catch (e) {
    console.error(`Error eliminando despacho ${dispatchId} de Firestore:`, e);
  }
}

export function subscribeToDispatchesFromFirestore(
  onDispatchesUpdate: (dispatches: TripDispatch[]) => void,
  onError?: (error: any) => void
): (() => void) | null {
  const { db } = initFirebase();
  if (!db) return null;
  try {
    return onSnapshot(collection(db, 'dispatches'), (snap) => {
      const dispatches: TripDispatch[] = [];
      snap.forEach(d => dispatches.push(d.data() as TripDispatch));
      dispatches.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onDispatchesUpdate(dispatches);
    }, (err) => {
      console.warn('Aviso suscripción despachos Firestore:', err);
      if (onError) onError(err);
    });
  } catch (e) {
    console.error('Error configurando listener de despachos:', e);
    return null;
  }
}

// ==========================================
// SINCRONIZACIÓN EN TIEMPO REAL DE NÓMINA
// Colección: 'conductores' — un documento por colaborador (igual que routes/stores)
// ==========================================

function cleanPayloadForFirestore<T>(data: T): any {
  if (data === null || data === undefined) return null;
  return JSON.parse(JSON.stringify(data, (_, v) => (v === undefined ? null : v)));
}

export async function saveStaffListToFirestore(staff: CrewMemberResource[]): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    const batch = writeBatch(db);
    // Primero limpiar los que ya no están
    const existing = await getDocs(collection(db, 'conductores'));
    const existingIds = new Set(existing.docs.map(d => d.id));
    const newIds = new Set(staff.map(s => s.id));
    existing.docs.forEach(d => {
      if (!newIds.has(d.id)) batch.delete(d.ref);
    });
    // Guardar los actuales
    staff.forEach(s => {
      const clean = cleanPayloadForFirestore({ ...s, syncedAt: new Date().toISOString() });
      batch.set(doc(db, 'conductores', s.id), clean, { merge: true });
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.error('Error guardando nómina en Firestore:', e);
    return false;
  }
}

export function subscribeToStaffFromFirestore(
  onUpdate: (staff: CrewMemberResource[]) => void,
  onError?: (error: any) => void
): (() => void) | null {
  const { db } = initFirebase();
  if (!db) return null;
  try {
    return onSnapshot(collection(db, 'conductores'), (snap) => {
      if (snap.empty) return;
      const staff: CrewMemberResource[] = [];
      snap.forEach(d => staff.push(d.data() as CrewMemberResource));
      if (staff.length > 0) onUpdate(staff);
    }, (err) => {
      console.warn('Aviso suscripción conductores Firestore:', err);
      if (onError) onError(err);
    });
  } catch (e) {
    console.error('Error configurando listener de conductores:', e);
    return null;
  }
}

// ==========================================
// SINCRONIZACIÓN EN TIEMPO REAL DE FLOTA OPERATIVA
// Colección: 'fleet_units' — un documento por vehículo
// ==========================================

export async function saveFleetListToFirestore(fleet: FleetVehicleResource[]): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    const batch = writeBatch(db);
    const existing = await getDocs(collection(db, 'fleet_units'));
    const newIds = new Set(fleet.map(f => (f as any).id || f.plate));
    existing.docs.forEach(d => {
      if (!newIds.has(d.id)) batch.delete(d.ref);
    });
    fleet.forEach(f => {
      const id = (f as any).id || f.plate;
      const clean = cleanPayloadForFirestore({ ...f, id, syncedAt: new Date().toISOString() });
      batch.set(doc(db, 'fleet_units', id), clean, { merge: true });
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.error('Error guardando flota en Firestore:', e);
    return false;
  }
}

export function subscribeToFleetFromFirestore(
  onUpdate: (fleet: FleetVehicleResource[]) => void,
  onError?: (error: any) => void
): (() => void) | null {
  const { db } = initFirebase();
  if (!db) return null;
  try {
    return onSnapshot(collection(db, 'fleet_units'), (snap) => {
      if (snap.empty) return;
      const fleet: FleetVehicleResource[] = [];
      snap.forEach(d => {
        const data = d.data();
        fleet.push({
          ...data,
          plate: data.plate || d.id
        } as FleetVehicleResource);
      });
      if (fleet.length > 0) onUpdate(fleet);
    }, (err) => {
      console.warn('Aviso suscripción fleet_units Firestore:', err);
      if (onError) onError(err);
    });
  } catch (e) {
    console.error('Error configurando listener de flota:', e);
    return null;
  }
}

// ==========================================
// SINCRONIZACIÓN EN TIEMPO REAL DE GASTOS ADICIONALES
// Colección: 'expense_concepts' — un documento por concepto
// ==========================================

export async function saveExpensesListToFirestore(expenses: AdditionalExpenseConcept[]): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    const batch = writeBatch(db);
    const existing = await getDocs(collection(db, 'expense_concepts'));
    const newIds = new Set(expenses.map(e => e.id));
    existing.docs.forEach(d => {
      if (!newIds.has(d.id)) batch.delete(d.ref);
    });
    expenses.forEach(e => {
      batch.set(doc(db, 'expense_concepts', e.id), { ...e, syncedAt: new Date().toISOString() }, { merge: true });
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.error('Error guardando gastos en Firestore:', e);
    return false;
  }
}

export function subscribeToExpensesFromFirestore(
  onUpdate: (expenses: AdditionalExpenseConcept[]) => void,
  onError?: (error: any) => void
): (() => void) | null {
  const { db } = initFirebase();
  if (!db) return null;
  try {
    return onSnapshot(collection(db, 'expense_concepts'), (snap) => {
      const expenses: AdditionalExpenseConcept[] = [];
      snap.forEach(d => expenses.push(d.data() as AdditionalExpenseConcept));
      onUpdate(expenses);
    }, (err) => {
      console.warn('Aviso suscripción expense_concepts Firestore:', err);
      if (onError) onError(err);
    });
  } catch (e) {
    console.error('Error configurando listener de gastos:', e);
    return null;
  }
}

// ==========================================
// SINCRONIZACIÓN EN TIEMPO REAL DE PEAJES
// Colección: 'toll_stations' — un documento por estación
// ==========================================

export async function saveTollsListToFirestore(tolls: TollStation[]): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    const batch = writeBatch(db);
    const existing = await getDocs(collection(db, 'toll_stations'));
    const newIds = new Set(tolls.map(t => t.id));
    existing.docs.forEach(d => {
      if (!newIds.has(d.id)) batch.delete(d.ref);
    });
    tolls.forEach(t => {
      batch.set(doc(db, 'toll_stations', t.id), { ...t, syncedAt: new Date().toISOString() }, { merge: true });
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.error('Error guardando peajes en Firestore:', e);
    return false;
  }
}

export function subscribeToTollsFromFirestore(
  onUpdate: (tolls: TollStation[]) => void,
  onError?: (error: any) => void
): (() => void) | null {
  const { db } = initFirebase();
  if (!db) return null;
  try {
    return onSnapshot(collection(db, 'toll_stations'), (snap) => {
      const tolls: TollStation[] = [];
      snap.forEach(d => tolls.push(d.data() as TollStation));
      onUpdate(tolls);
    }, (err) => {
      console.warn('Aviso suscripción toll_stations Firestore:', err);
      if (onError) onError(err);
    });
  } catch (e) {
    console.error('Error configurando listener de peajes:', e);
    return null;
  }
}

// ==========================================
// SINCRONIZACIÓN EN TIEMPO REAL DE CONFIG LABORAL
// Documento: 'settings/labor_and_costs'
// ==========================================

export async function saveLaborConfigToFirestore(config: LaborConfig): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    await setDoc(doc(db, 'settings', 'labor_and_costs'),
      { ...sanitizeForFirestore(config as any), updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return true;
  } catch (e) {
    console.error('Error guardando config laboral en Firestore:', e);
    return false;
  }
}

export function subscribeToLaborConfigFromFirestore(
  onUpdate: (config: LaborConfig) => void,
  onError?: (error: any) => void
): (() => void) | null {
  const { db } = initFirebase();
  if (!db) return null;
  try {
    return onSnapshot(doc(db, 'settings', 'labor_and_costs'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as LaborConfig;
        if (data && typeof data.hourlyOrdinaryRate === 'number') onUpdate(data);
      }
    }, (err) => {
      console.warn('Aviso suscripción laborConfig Firestore:', err);
      if (onError) onError(err);
    });
  } catch (e) {
    console.error('Error configurando listener de laborConfig:', e);
    return null;
  }
}

// ==========================================
// SINCRONIZACIÓN EN TIEMPO REAL DE PERFILES DE VEHÍCULOS
// Colección: 'vehicles' — un documento por perfil (NPR, NLR, etc.)
// ==========================================

export async function saveVehicleToFirestore(vehicle: VehicleProfile): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    await setDoc(doc(db, 'vehicles', vehicle.id), sanitizeForFirestore({ ...vehicle, syncedAt: new Date().toISOString() }), { merge: true });
    return true;
  } catch (e) {
    console.error(`Error guardando perfil de vehículo ${vehicle.id} en Firestore:`, e);
    return false;
  }
}

export async function saveVehiclesListToFirestore(vehicles: VehicleProfile[]): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    const batch = writeBatch(db);
    vehicles.forEach(v => {
      batch.set(doc(db, 'vehicles', v.id), sanitizeForFirestore({ ...v, syncedAt: new Date().toISOString() }), { merge: true });
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.error('Error guardando vehículos en Firestore:', e);
    return false;
  }
}

export function subscribeToVehiclesFromFirestore(
  onUpdate: (vehicles: VehicleProfile[]) => void,
  onError?: (error: any) => void
): (() => void) | null {
  const { db } = initFirebase();
  if (!db) return null;
  try {
    return onSnapshot(collection(db, 'vehicles'), (snap) => {
      if (!snap.empty) {
        const list: VehicleProfile[] = [];
        snap.forEach(d => list.push(d.data() as VehicleProfile));
        onUpdate(list);
      }
    }, (err) => {
      console.warn('Aviso suscripción vehicles Firestore:', err);
      if (onError) onError(err);
    });
  } catch (e) {
    console.error('Error configurando listener de vehicles:', e);
    return null;
  }
}

// ==========================================
// MIGRACIÓN: Sube TODO el localStorage a Firestore
// Para que los datos previos del compañero queden en la nube.
// Llama esto desde cualquier usuario con datos locales que quiera compartirlos.
// ==========================================

export async function uploadLocalDataToFirestore(
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; details: string }> {
  const { db } = initFirebase();
  if (!db) return { success: false, details: 'Sin conexión a Firestore.' };

  const results: string[] = [];

  try {
    // 1. Despachos locales (los más importantes para el compañero)
    const rawDispatches = localStorage.getItem('rutacost_dispatches');
    if (rawDispatches) {
      const dispatches: TripDispatch[] = JSON.parse(rawDispatches).filter(
        (d: any) => Boolean(d && d.id)
      );
      if (dispatches.length > 0) {
        if (onProgress) onProgress(`Subiendo ${dispatches.length} despachos...`);
        const batch = writeBatch(db);
        dispatches.forEach(d => {
          batch.set(doc(db, 'dispatches', d.id),
            sanitizeForFirestore({ ...d, syncedAt: new Date().toISOString() }),
            { merge: true }
          );
        });
        await batch.commit();
        results.push(`✅ ${dispatches.length} despachos`);
      }
    }

    // 2. Nómina (conductores)
    const staff = getCustomStaff();
    if (staff.length > 0) {
      if (onProgress) onProgress(`Subiendo ${staff.length} colaboradores...`);
      const batch = writeBatch(db);
      staff.forEach(s => {
        batch.set(doc(db, 'conductores', s.id), { ...s, syncedAt: new Date().toISOString() }, { merge: true });
      });
      await batch.commit();
      results.push(`✅ ${staff.length} colaboradores`);
    }

    // 3. Flota operativa
    const fleet = getCustomFleet();
    if (fleet.length > 0) {
      if (onProgress) onProgress(`Subiendo ${fleet.length} vehículos...`);
      const batch = writeBatch(db);
      fleet.forEach(f => {
        const id = (f as any).id || f.plate;
        batch.set(doc(db, 'fleet_units', id), { ...f, syncedAt: new Date().toISOString() }, { merge: true });
      });
      await batch.commit();
      results.push(`✅ ${fleet.length} vehículos de flota`);
    }

    // 4. Gastos adicionales
    const expenses = getCustomExpenses();
    if (expenses.length > 0) {
      if (onProgress) onProgress(`Subiendo ${expenses.length} conceptos de gastos...`);
      const batch = writeBatch(db);
      expenses.forEach(e => {
        batch.set(doc(db, 'expense_concepts', e.id), { ...e, syncedAt: new Date().toISOString() }, { merge: true });
      });
      await batch.commit();
      results.push(`✅ ${expenses.length} conceptos de gastos`);
    }

    // 5. Peajes personalizados
    const tolls = getCustomTollStations();
    if (tolls.length > 0) {
      if (onProgress) onProgress(`Subiendo ${tolls.length} peajes...`);
      const batch = writeBatch(db);
      tolls.forEach(t => {
        batch.set(doc(db, 'toll_stations', t.id), { ...t, syncedAt: new Date().toISOString() }, { merge: true });
      });
      await batch.commit();
      results.push(`✅ ${tolls.length} peajes`);
    }

    // 6. Tiendas Hogar y Moda
    const stores = getCustomStores();
    if (stores.length > 0) {
      if (onProgress) onProgress(`Subiendo ${stores.length} tiendas...`);
      const batch = writeBatch(db);
      stores.forEach(st => {
        batch.set(doc(db, 'stores', st.id), sanitizeForFirestore({ ...st, syncedAt: new Date().toISOString() }), { merge: true });
      });
      await batch.commit();
      results.push(`✅ ${stores.length} tiendas`);
    }

    // 7. Rutas oficiales
    const rawRoutes = localStorage.getItem('rutacost_routes');
    if (rawRoutes) {
      const routes: DeliveryRoute[] = JSON.parse(rawRoutes);
      if (routes.length > 0) {
        if (onProgress) onProgress(`Subiendo ${routes.length} rutas...`);
        const batch = writeBatch(db);
        routes.forEach(r => {
          batch.set(doc(db, 'routes', r.id), sanitizeForFirestore({ ...r, syncedAt: new Date().toISOString() }), { merge: true });
        });
        await batch.commit();
        results.push(`✅ ${routes.length} rutas`);
      }
    }

    // 8. Parámetros laborales (CST)
    const rawLabor = localStorage.getItem('rutacost_labor');
    if (rawLabor) {
      const labor: LaborConfig = JSON.parse(rawLabor);
      if (labor && labor.smmlv) {
        await setDoc(doc(db, 'settings', 'labor_and_costs'), sanitizeForFirestore({ ...labor, syncedAt: new Date().toISOString() }), { merge: true });
        results.push('✅ Parámetros laborales');
      }
    }

    const summary = results.length > 0
      ? results.join(' | ')
      : 'No había datos locales para subir.';

    if (onProgress) onProgress('¡Sincronización completada!');
    return { success: true, details: summary };

  } catch (e: any) {
    console.error('Error en migración local→Firestore:', e);
    return { success: false, details: `Error: ${e?.message || e}` };
  }
}

// ==========================================
// OPERACIONES UNITARIAS DIRECTAS (AL AGREGAR, EDITAR O BORRAR)
// ==========================================

export async function saveStaffMemberToFirestore(member: CrewMemberResource): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    const clean = cleanPayloadForFirestore({ ...member, syncedAt: new Date().toISOString() });
    await setDoc(doc(db, 'conductores', member.id), clean, { merge: true });
    return true;
  } catch (e) {
    console.error('Error guardando colaborador en Firestore:', e);
    return false;
  }
}

export async function deleteStaffMemberFromFirestore(id: string): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    await deleteDoc(doc(db, 'conductores', id));
    return true;
  } catch (e) {
    console.error('Error eliminando colaborador de Firestore:', e);
    return false;
  }
}

export async function saveFleetUnitToFirestore(unit: FleetVehicleResource): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    const id = (unit as any).id || unit.plate;
    const clean = cleanPayloadForFirestore({ ...unit, id, syncedAt: new Date().toISOString() });
    await setDoc(doc(db, 'fleet_units', id), clean, { merge: true });
    return true;
  } catch (e) {
    console.error('Error guardando vehículo de flota en Firestore:', e);
    return false;
  }
}

export async function deleteFleetUnitFromFirestore(plate: string): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    await deleteDoc(doc(db, 'fleet_units', plate));
    return true;
  } catch (e) {
    console.error('Error eliminando vehículo de flota en Firestore:', e);
    return false;
  }
}

export async function saveExpenseConceptToFirestore(concept: AdditionalExpenseConcept): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    await setDoc(doc(db, 'expense_concepts', concept.id), { ...concept, syncedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (e) {
    console.error('Error guardando concepto de gasto en Firestore:', e);
    return false;
  }
}

export async function deleteExpenseConceptFromFirestore(id: string): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    await deleteDoc(doc(db, 'expense_concepts', id));
    return true;
  } catch (e) {
    console.error('Error eliminando concepto de gasto en Firestore:', e);
    return false;
  }
}

export async function saveTollStationToFirestore(toll: TollStation): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    await setDoc(doc(db, 'toll_stations', toll.id), { ...toll, syncedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (e) {
    console.error('Error guardando peaje en Firestore:', e);
    return false;
  }
}

export async function deleteTollStationFromFirestore(id: string): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    await deleteDoc(doc(db, 'toll_stations', id));
    return true;
  } catch (e) {
    console.error('Error eliminando peaje en Firestore:', e);
    return false;
  }
}

export async function saveMonthlyAttendanceToFirestore(yearMonth: string, records: any[]): Promise<boolean> {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    await setDoc(doc(db, 'attendance', yearMonth), {
      yearMonth,
      records: records.map(r => sanitizeForFirestore(r)),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('Error guardando asistencia en Firestore:', e);
    return false;
  }
}

export function subscribeToAttendanceFromFirestore(
  onUpdate: (attendanceMap: Record<string, any[]>) => void,
  onError?: (error: any) => void
): (() => void) | null {
  const { db } = initFirebase();
  if (!db) return null;
  try {
    return onSnapshot(collection(db, 'attendance'), (snap) => {
      const map: Record<string, any[]> = {};
      snap.forEach(d => {
        const data = d.data();
        if (data.records && Array.isArray(data.records)) {
          map[d.id] = data.records;
        }
      });
      onUpdate(map);
    }, (err) => {
      console.warn('Aviso suscripción attendance Firestore:', err);
      if (onError) onError(err);
    });
  } catch (e) {
    console.error('Error configurando listener de attendance:', e);
    return null;
  }
}

// ==========================================
// MOTOR DE AUTOSINCRONIZACIÓN EN SEGUNDO PLANO (CADA N SEGUNDOS)
// Garantiza que cualquier cambio hecho en otra pestaña/persona se sincronice
// y que cualquier borrador o registro local pendiente suba forzadamente a Firestore.
// ==========================================

export type BackgroundSyncState = 'idle' | 'syncing' | 'synced' | 'error';

export interface BackgroundSyncStatus {
  state: BackgroundSyncState;
  lastSyncTime: Date | null;
  syncedCount: number;
  message: string;
}

let backgroundSyncTimer: any = null;
let isAutoSyncRunning = false;
const syncStatusListeners = new Set<(status: BackgroundSyncStatus) => void>();
let currentSyncStatus: BackgroundSyncStatus = {
  state: 'idle',
  lastSyncTime: null,
  syncedCount: 0,
  message: 'Autosincronización en espera'
};

export function subscribeToAutoSyncStatus(callback: (status: BackgroundSyncStatus) => void): () => void {
  syncStatusListeners.add(callback);
  callback(currentSyncStatus);
  return () => syncStatusListeners.delete(callback);
}

function notifySyncStatus(status: BackgroundSyncStatus) {
  currentSyncStatus = status;
  syncStatusListeners.forEach(cb => {
    try { cb(status); } catch (e) {}
  });
}

export async function pushUnsyncedLocalDataToFirestore(): Promise<{ uploaded: number; error?: any }> {
  if (isAutoSyncRunning) return { uploaded: 0 };
  const { db } = initFirebase();
  if (!db) return { uploaded: 0 };

  isAutoSyncRunning = true;
  notifySyncStatus({
    state: 'syncing',
    lastSyncTime: currentSyncStatus.lastSyncTime,
    syncedCount: currentSyncStatus.syncedCount,
    message: 'Sincronizando cambios en segundo plano con Cloud Firestore...'
  });

  let totalUploaded = 0;
  try {
    // 1. Salidas y despachos pendientes de subir o actualizar
    const rawDispatches = typeof localStorage !== 'undefined' ? localStorage.getItem('rutacost_dispatches') : null;
    if (rawDispatches) {
      try {
        const dispatches: TripDispatch[] = JSON.parse(rawDispatches);
        if (Array.isArray(dispatches)) {
          let updatedAny = false;
          for (const d of dispatches) {
            if (d && d.id && !d.syncedAt) {
              await saveDispatchToFirestore(d);
              d.syncedAt = new Date().toISOString();
              updatedAny = true;
              totalUploaded++;
            }
          }
          if (updatedAny) {
            localStorage.setItem('rutacost_dispatches', JSON.stringify(dispatches));
          }
        }
      } catch (e) {}
    }

    // 2. Rutas que no tengan syncedAt
    const rawRoutes = typeof localStorage !== 'undefined' ? localStorage.getItem('rutacost_routes') : null;
    if (rawRoutes) {
      try {
        const routes: DeliveryRoute[] = JSON.parse(rawRoutes);
        if (Array.isArray(routes)) {
          let updatedAny = false;
          for (const r of routes) {
            if (r && r.id && !(r as any).syncedAt) {
              await saveRouteToFirestore(r);
              (r as any).syncedAt = new Date().toISOString();
              updatedAny = true;
              totalUploaded++;
            }
          }
          if (updatedAny) {
            localStorage.setItem('rutacost_routes', JSON.stringify(routes));
          }
        }
      } catch (e) {}
    }

    // 3. Asistencia mensual
    const rawAttendance = typeof localStorage !== 'undefined' ? localStorage.getItem('rutacost_monthly_attendance_v1') : null;
    if (rawAttendance) {
      try {
        const attendanceMap = JSON.parse(rawAttendance);
        for (const [yearMonth, records] of Object.entries(attendanceMap)) {
          if (Array.isArray(records) && records.length > 0) {
            await setDoc(doc(db, 'attendance', yearMonth), {
              yearMonth,
              records: records.map((r: any) => sanitizeForFirestore(r)),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        }
      } catch (e) {}
    }

    // 4. Nómina (conductores y auxiliares pendientes)
    const rawStaff = typeof localStorage !== 'undefined' ? localStorage.getItem('rutacost_staff') : null;
    if (rawStaff) {
      try {
        const staff: CrewMemberResource[] = JSON.parse(rawStaff);
        if (Array.isArray(staff)) {
          for (const s of staff) {
            if (s && s.id && !(s as any).syncedAt) {
              await setDoc(doc(db, 'conductores', s.id), { ...s, syncedAt: new Date().toISOString() }, { merge: true });
              (s as any).syncedAt = new Date().toISOString();
              totalUploaded++;
            }
          }
        }
      } catch (e) {}
    }

    // 5. Flota operativa pendiente
    const rawFleet = typeof localStorage !== 'undefined' ? localStorage.getItem('rutacost_fleet_units') : null;
    if (rawFleet) {
      try {
        const fleet: FleetVehicleResource[] = JSON.parse(rawFleet);
        if (Array.isArray(fleet)) {
          for (const f of fleet) {
            const id = (f as any).id || f.plate;
            if (id && !(f as any).syncedAt) {
              await setDoc(doc(db, 'fleet_units', id), { ...f, id, syncedAt: new Date().toISOString() }, { merge: true });
              (f as any).syncedAt = new Date().toISOString();
              totalUploaded++;
            }
          }
        }
      } catch (e) {}
    }

    // 6. Jornadas y Festivos de Colombia
    const rawSchedule = typeof localStorage !== 'undefined' ? localStorage.getItem('rutacost_work_schedule') : null;
    if (rawSchedule) {
      try {
        const sched = JSON.parse(rawSchedule);
        if (sched && sched.type) {
          await setDoc(doc(db, 'settings', 'work_schedule'), sanitizeForFirestore({ ...sched, syncedAt: new Date().toISOString() }), { merge: true });
        }
      } catch (e) {}
    }

    const rawHolidays = typeof localStorage !== 'undefined' ? localStorage.getItem('rutacost_custom_holidays') : null;
    if (rawHolidays) {
      try {
        const hols = JSON.parse(rawHolidays);
        if (Array.isArray(hols)) {
          await setDoc(doc(db, 'settings', 'holidays'), { list: hols, syncedAt: new Date().toISOString() }, { merge: true });
        }
      } catch (e) {}
    }

    notifySyncStatus({
      state: 'synced',
      lastSyncTime: new Date(),
      syncedCount: totalUploaded,
      message: totalUploaded > 0
        ? `✅ Autosincronizados ${totalUploaded} registros con Cloud Firestore`
        : '🟢 En sincronía perfecta con Cloud Firestore'
    });

    return { uploaded: totalUploaded };
  } catch (err: any) {
    console.warn('Aviso en autosincronización en segundo plano:', err);
    notifySyncStatus({
      state: 'error',
      lastSyncTime: currentSyncStatus.lastSyncTime,
      syncedCount: currentSyncStatus.syncedCount,
      message: `Error sincronizando: ${err?.message || err}`
    });
    return { uploaded: totalUploaded, error: err };
  } finally {
    isAutoSyncRunning = false;
  }
}

/**
 * Inicia el loop de autosincronización forzada en segundo plano cada N segundos (por defecto 20s).
 * Devuelve una función para detenerlo al desmontar la app.
 */
export function startBackgroundAutoSync(intervalSeconds: number = 20): () => void {
  if (backgroundSyncTimer) {
    clearInterval(backgroundSyncTimer);
  }

  // Primera ejecución rápida tras 2 segundos para no bloquear la carga inicial
  const firstTimeout = setTimeout(() => {
    pushUnsyncedLocalDataToFirestore().catch(() => {});
  }, 2000);

  // Intervalo regular en segundo plano
  backgroundSyncTimer = setInterval(() => {
    pushUnsyncedLocalDataToFirestore().catch(() => {});
  }, Math.max(10, intervalSeconds) * 1000);

  return () => {
    clearTimeout(firstTimeout);
    if (backgroundSyncTimer) {
      clearInterval(backgroundSyncTimer);
      backgroundSyncTimer = null;
    }
  };
}
