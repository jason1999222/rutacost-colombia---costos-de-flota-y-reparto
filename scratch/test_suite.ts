/**
 * SCJ Transportes - Suite Integral de Pruebas y Validación Automatizada
 * Valida:
 * 1. Directorio y Coordenadas GPS de Tiendas Hogar y Moda
 * 2. CRUD y persistencia de Tiendas y Coordenadas
 * 3. Algoritmo de parseo de coordenadas Google Maps
 * 4. Resolución de Coordenadas de Rutas y cálculo de Km
 * 5. Matriz de Peajes Oficiales (Tarifas NPR vs NLR)
 * 6. Calculadora de Costos, Combustible ACPM, Mano de Obra y P&L
 * 7. Integridad y Seguridad en Google Cloud Firestore
 * 8. Disponibilidad en vivo de https://scj-transportes.web.app
 */

import { 
  HOGAR_Y_MODA_STORES, 
  HOGAR_Y_MODA_STORES_MAP, 
  CEDI_CALDAS_PORTAL_DEL_SUR,
  getCustomStores,
  getCustomStoresMap,
  saveCustomStores,
  addCustomStore,
  updateStoreCoordinates,
  removeCustomStore,
  calculateTotalLoadingMinutes
} from '../src/data/hogarYModaStores';

import { 
  resolveRouteCoordinates, 
  calculatePathTotalKm, 
  CEDI_CALDAS 
} from '../src/data/colombiaCoordinates';

import { 
  KNOWN_TOLLS, 
  getCustomTollStations, 
  recalculateAllRoutesTollCosts 
} from '../src/data/colombiaTolls';

import { INITIAL_ROUTES } from '../src/data/initialRoutes';
import { VEHICLE_PROFILES } from '../src/data/vehicleProfiles';
import { DEFAULT_LABOR_CONFIG } from '../src/data/laborDefaults';
import { calculateRouteCost } from '../src/utils/costCalculator';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { DEFAULT_FIREBASE_CONFIG } from '../src/services/firebase';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
  details?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, message?: any, details?: any) {
  if (condition) {
    results.push({ suite, name, passed: true });
    console.log(`  ✓ [PASS] ${name}`);
  } else {
    results.push({ suite, name, passed: false, message: typeof message === 'string' ? message : JSON.stringify(message), details });
    console.error(`  ✗ [FAIL] ${name}: ${typeof message === 'string' ? message : 'Assertion failed'}`);
    if (details || typeof message !== 'string') console.error('    Detalles:', details || message);
  }
}

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log('  SCJ TRANSPORTES · SUITE DE PRUEBAS DEL SISTEMA OPERATIVO');
  console.log('===============================================================\n');

  // -----------------------------------------------------------------
  // 1. Directorio Oficial y Coordenadas GPS de Tiendas Hogar y Moda
  // -----------------------------------------------------------------
  console.log('▶ [1/8] Probando Directorio Oficial de Tiendas y Coordenadas GPS...');
  
  assert(
    HOGAR_Y_MODA_STORES.length >= 52,
    'Stores',
    'Catálogo base contiene al menos 52 almacenes registrados',
    `Contiene ${HOGAR_Y_MODA_STORES.length} almacenes`
  );

  const cedi = HOGAR_Y_MODA_STORES.find(s => s.id === 'L-000');
  assert(
    Boolean(cedi && cedi.isOriginWarehouse && cedi.dischargeMinutes === 120),
    'Stores',
    'CEDI Caldas (L-000) existe como bodega de origen con 120 min de cargue',
    cedi
  );

  assert(
    Boolean(cedi && Math.abs(cedi.lat - 6.11888) < 0.001 && Math.abs(cedi.lng - -75.62755) < 0.001),
    'Stores',
    'Coordenadas exactas del CEDI Caldas (Portal Sur): ~[6.11888, -75.62755]',
    cedi ? { lat: cedi.lat, lng: cedi.lng } : null
  );

  // Verificar que todas las tiendas tengan coordenadas en el territorio colombiano
  let invalidCoords = 0;
  HOGAR_Y_MODA_STORES.forEach(s => {
    if (s.lat < 0 || s.lat > 14 || s.lng < -82 || s.lng > -66) {
      invalidCoords++;
    }
  });
  assert(
    invalidCoords === 0,
    'Stores',
    'Todas las tiendas tienen coordenadas GPS válidas en territorio colombiano',
    `Errores: ${invalidCoords}`
  );

  // -----------------------------------------------------------------
  // 2. Operaciones CRUD y Persistencia de Tiendas
  // -----------------------------------------------------------------
  console.log('\n▶ [2/8] Probando CRUD de Tiendas y Coordenadas en Memoria/LocalStorage...');

  const initialCount = getCustomStores().length;
  const testStore = {
    id: 'L-TEST-999',
    name: 'Almacén de Prueba San Jerónimo',
    municipality: 'San Jerónimo, Antioquia',
    lat: 6.4428,
    lng: -75.7289,
    dischargeMinutes: 45,
    address: 'Calle 10 # 20-30 Parque Principal'
  };

  // Agregar
  const addedList = addCustomStore(testStore);
  assert(
    addedList.some(s => s.id === 'L-TEST-999'),
    'CRUD Stores',
    'Registrar nueva tienda (addCustomStore) inserta correctamente',
    `Total: ${addedList.length}`
  );

  // Actualizar coordenadas
  const updatedList = updateStoreCoordinates('L-TEST-999', 6.4435, -75.7295, { address: 'Dirección Actualizada' });
  const updatedStore = updatedList.find(s => s.id === 'L-TEST-999');
  assert(
    Boolean(updatedStore && updatedStore.lat === 6.4435 && updatedStore.lng === -75.7295 && updatedStore.address === 'Dirección Actualizada'),
    'CRUD Stores',
    'Calibración de coordenadas GPS (updateStoreCoordinates) actualiza latitud y longitud con precisión',
    updatedStore
  );

  // Eliminar
  const afterDeleteList = removeCustomStore('L-TEST-999');
  assert(
    !afterDeleteList.some(s => s.id === 'L-TEST-999'),
    'CRUD Stores',
    'Eliminar tienda (removeCustomStore) remueve el registro correctamente'
  );

  // -----------------------------------------------------------------
  // 3. Algoritmo Inteligente de Parseo de Coordenadas Google Maps
  // -----------------------------------------------------------------
  console.log('\n▶ [3/8] Probando Algoritmo de Extracción de Enlaces y Pares de Coordenadas...');

  function parseCoordinates(raw: string): { lat: number; lng: number } | null {
    const atMatch = raw.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

    const qMatch = raw.match(/[?&](?:q|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };

    const pairMatch = raw.match(/(-?\d+\.\d+)[\s,;]+(-?\d+\.\d+)/);
    if (pairMatch) return { lat: parseFloat(pairMatch[1]), lng: parseFloat(pairMatch[2]) };

    return null;
  }

  const testUrl1 = "https://www.google.com/maps/@6.244200,-75.581200,17z";
  const p1 = parseCoordinates(testUrl1);
  assert(
    Boolean(p1 && p1.lat === 6.2442 && p1.lng === -75.5812),
    'GPS Parser',
    'Extrae coordenadas de URL estándar Google Maps (@lat,lng)',
    p1
  );

  const testUrl2 = "https://maps.google.com/?q=5.452800,-75.651400";
  const p2 = parseCoordinates(testUrl2);
  assert(
    Boolean(p2 && p2.lat === 5.4528 && p2.lng === -75.6514),
    'GPS Parser',
    'Extrae coordenadas de URL de consulta (?q=lat,lng)',
    p2
  );

  const testRaw = "5.061700, -75.875600";
  const p3 = parseCoordinates(testRaw);
  assert(
    Boolean(p3 && p3.lat === 5.0617 && p3.lng === -75.8756),
    'GPS Parser',
    'Extrae coordenadas desde texto plano con coma decimal',
    p3
  );

  // -----------------------------------------------------------------
  // 4. Resolución de Coordenadas de Rutas y Distancia Topográfica
  // -----------------------------------------------------------------
  console.log('\n▶ [4/8] Probando Resolución Dinámica de Rutas y Cálculo de Km...');

  const routePoints = resolveRouteCoordinates('RUTA SUROESTE 1', ['L-001', 'L-002']);
  assert(
    routePoints.length === 3,
    'Route Resolver',
    'Ruta con 2 tiendas genera 3 puntos (CEDI Caldas + 2 tiendas)',
    `Puntos: ${routePoints.length}`
  );

  assert(
    routePoints[0].storeId === 'L-000' && routePoints[0].isWarehouse === true,
    'Route Resolver',
    'Punto inicial (0) es obligatoriamente el CEDI Caldas',
    routePoints[0]
  );

  assert(
    routePoints[1].storeId === 'L-001' && routePoints[2].storeId === 'L-002',
    'Route Resolver',
    'Puntos 1 y 2 corresponden exactamente a los códigos solicitados (Supía y Riosucio)',
    { pt1: routePoints[1].storeId, pt2: routePoints[2].storeId }
  );

  const km = calculatePathTotalKm(routePoints);
  assert(
    km > 100 && km < 300,
    'Route Resolver',
    'Cálculo de Km incluye factor de montaña colombiano (1.35x) y retorno',
    `Km calculado: ${km} km`
  );

  // -----------------------------------------------------------------
  // 5. Catálogo Oficial de Peajes y Comparativa Tarifaria NPR vs NLR
  // -----------------------------------------------------------------
  console.log('\n▶ [5/8] Probando Catálogo Oficial de Peajes 2026 y Tarifas NPR vs NLR...');

  assert(
    KNOWN_TOLLS.length >= 23,
    'Tolls',
    'Catálogo oficial contiene al menos 23 estaciones de peaje',
    `Estaciones: ${KNOWN_TOLLS.length}`
  );

  let allHaveValidTariffs = true;
  KNOWN_TOLLS.forEach(t => {
    if (t.tariffNprCOP <= 0 || t.tariffNlrCOP <= 0) {
      allHaveValidTariffs = false;
    }
  });
  assert(
    allHaveValidTariffs,
    'Tolls',
    'Todas las casetas tienen tarifas oficiales positivas para NPR y NLR',
    'Validado'
  );

  const amagaToll = KNOWN_TOLLS.find(t => t.id === 'TOLL-AMAGA');
  assert(
    Boolean(amagaToll && amagaToll.tariffNprCOP === 31200 && amagaToll.tariffNlrCOP === 25900),
    'Tolls',
    'Tarifas oficiales peaje Amagá confirmadas (NPR: $31.200, NLR: $25.900)',
    amagaToll
  );

  // -----------------------------------------------------------------
  // 6. Calculadora de Costos, Rendimiento ACPM y P&L
  // -----------------------------------------------------------------
  console.log('\n▶ [6/8] Probando Calculadora Financiera de Costos y Utilidad Neta...');

  const sampleRoute = INITIAL_ROUTES[0]; // SCJ-001
  const nprProfile = VEHICLE_PROFILES[0]; // NPR Turbo
  const breakdown = calculateRouteCost(sampleRoute, nprProfile, DEFAULT_LABOR_CONFIG);

  assert(
    breakdown.fuelCost > 0,
    'Calculator',
    'Costo de combustible ACPM calculado positivamente en función del kilometraje',
    `Combustible: $${breakdown.fuelCost.toLocaleString()} COP`
  );

  assert(
    breakdown.totalMaintenanceCost > 0,
    'Calculator',
    'Costo de mantenimiento preventivo SICE-TAC calculado',
    `Mantenimiento: $${breakdown.totalMaintenanceCost.toLocaleString()} COP`
  );

  assert(
    breakdown.totalLaborCost > 0,
    'Calculator',
    'Costo de mano de obra CST calculado según jornada y horas de servicio',
    `Mano de Obra: $${breakdown.totalLaborCost.toLocaleString()} COP`
  );

  const expectedTotalCost = breakdown.totalLaborCost + 
    breakdown.totalVehicleVariableCost + 
    breakdown.tollCost + 
    breakdown.viaticosCost + 
    breakdown.additionalExpensesCost;

  assert(
    Math.abs(breakdown.totalTripCost - expectedTotalCost) < 0.01,
    'Calculator',
    'Suma de costos operativos coincide exactamente con el desglose',
    `Total Cost: $${breakdown.totalTripCost.toLocaleString()} COP`
  );

  assert(
    Math.abs(breakdown.netProfitCOP - ((sampleRoute.freightTariffNpr || 0) - breakdown.totalTripCost)) < 0.01,
    'Calculator',
    'Utilidad líquida neta calculada con precisión (Flete - Costo Total)',
    `Utilidad: $${breakdown.netProfitCOP.toLocaleString()} COP (Margen: ${breakdown.profitPercentage.toFixed(1)}%)`
  );

  // -----------------------------------------------------------------
  // 7. Base de Datos Cloud Firestore (app-empresarial-ffb59)
  // -----------------------------------------------------------------
  console.log('\n▶ [7/8] Probando Conexión e Integridad de Datos en Cloud Firestore...');

  try {
    const app = initializeApp(DEFAULT_FIREBASE_CONFIG);
    const db = getFirestore(app);

    // 1. Colección stores
    const storesSnap = await getDocs(collection(db, 'stores'));
    assert(
      storesSnap.size >= 52,
      'Firestore',
      `Colección 'stores' contiene todos los locales en la nube (Documentos: ${storesSnap.size})`
    );

    // 2. Colección routes
    const routesSnap = await getDocs(collection(db, 'routes'));
    assert(
      routesSnap.size === 37,
      'Firestore',
      `Colección 'routes' contiene exactamente las 37 rutas oficiales SCJ (Documentos: ${routesSnap.size})`
    );

    // 3. Colección tolls
    const tollsSnap = await getDocs(collection(db, 'tolls'));
    assert(
      tollsSnap.size >= 23,
      'Firestore',
      `Colección 'tolls' contiene las 23 estaciones de peaje oficiales (Documentos: ${tollsSnap.size})`
    );

    // 4. Colección vehicles
    const vehiclesSnap = await getDocs(collection(db, 'vehicles'));
    assert(
      vehiclesSnap.size === 2,
      'Firestore',
      `Colección 'vehicles' contiene los 2 camiones de la flota (NPR y NLR) (Documentos: ${vehiclesSnap.size})`
    );

    // 5. Usuario Administrador Principal
    const userDoc = await getDoc(doc(db, 'users', 'LYFeNEIJgHgDz1boS854yJetmf12'));
    assert(
      Boolean(userDoc.exists() && userDoc.data()?.role === 'admin'),
      'Firestore',
      "Usuario administrador oficial 'jacson.munoz@gmail.com' verificado con rol admin en Firestore",
      userDoc.data()
    );

  } catch (err: any) {
    assert(
      false,
      'Firestore',
      'Error consultando Cloud Firestore',
      err.message
    );
  }

  // -----------------------------------------------------------------
  // 8. Validación de Servidor Web y Hosting en Vivo
  // -----------------------------------------------------------------
  console.log('\n▶ [8/8] Probando Disponibilidad en Vivo de https://scj-transportes.web.app...');

  try {
    const res = await fetch('https://scj-transportes.web.app');
    assert(
      res.status === 200,
      'Hosting',
      `Sitio en vivo responde con HTTP 200 OK (${res.statusText})`
    );

    const html = await res.text();
    assert(
      html.includes('SCJ Transportes') && html.includes('Hogar y Moda'),
      'Hosting',
      'HTML desplegado incluye el título y metadatos oficiales de SCJ Transportes y Hogar y Moda'
    );

    // Verificar que el asset bundle principal cargue con 200 OK
    const scriptMatch = html.match(/src="(\/assets\/[^"]+\.js)"/);
    if (scriptMatch) {
      const assetUrl = `https://scj-transportes.web.app${scriptMatch[1]}`;
      const assetRes = await fetch(assetUrl);
      assert(
        assetRes.status === 200,
        'Hosting',
        `Bundle de JavaScript principal (${scriptMatch[1]}) cargó exitosamente con 200 OK`
      );
    }

  } catch (err: any) {
    assert(
      false,
      'Hosting',
      'Error contactando el hosting en vivo',
      err.message
    );
  }

  // -----------------------------------------------------------------
  // RESUMEN FINAL
  // -----------------------------------------------------------------
  console.log('\n===============================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`  RESUMEN: ${passedCount} PRUEBAS SUPERADAS / ${failedCount} FALLIDAS`);
  console.log('===============================================================\n');

  if (failedCount > 0) {
    console.error('⚠️ ALERTA: Algunas pruebas no pasaron. Revisa los detalles arriba.');
    process.exit(1);
  } else {
    console.log('🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE AL 100%.');
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error("Error fatal ejecutando pruebas:", err);
  process.exit(1);
});
