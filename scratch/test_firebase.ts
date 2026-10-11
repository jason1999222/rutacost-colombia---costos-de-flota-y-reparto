import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  writeBatch,
  deleteDoc
} from "firebase/firestore";
import { INITIAL_ROUTES } from "../src/data/initialRoutes";
import { HOGAR_Y_MODA_STORES } from "../src/data/hogarYModaStores";
import { KNOWN_TOLLS } from "../src/data/colombiaTolls";
import { VEHICLE_PROFILES } from "../src/data/vehicleProfiles";
import { DEFAULT_LABOR_CONFIG } from "../src/data/laborDefaults";

const firebaseConfig = {
  apiKey: "AIzaSyBqn7YzQcpD1gYws53GFuXbVUEb3uElRJM",
  authDomain: "app-empresarial-ffb59.firebaseapp.com",
  projectId: "app-empresarial-ffb59",
  storageBucket: "app-empresarial-ffb59.firebasestorage.app",
  messagingSenderId: "844586659907",
  appId: "1:844586659907:web:4388083833f1c10d78a4f6",
  measurementId: "G-WMWHZBW26S"
};

async function main() {
  console.log("🔥 Probando conexión con Firebase:", firebaseConfig.projectId);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // 1. Probar lectura de colecciones existentes
    console.log("🔍 Verificando colecciones existentes en Firestore...");
    const routesSnap = await getDocs(collection(db, "routes"));
    console.log(`Documentos previos en 'routes': ${routesSnap.size}`);
    
    // Si hay documentos viejos, eliminarlos para limpiar la base de datos anterior
    if (routesSnap.size > 0) {
      console.log(`🗑️ Eliminando ${routesSnap.size} rutas anteriores...`);
      const deleteBatch = writeBatch(db);
      routesSnap.docs.forEach((d) => deleteBatch.delete(d.ref));
      await deleteBatch.commit();
      console.log("✅ Rutas anteriores eliminadas.");
    }

    // 2. Subir las 37 Rutas Maestras Oficiales de SCJ
    console.log(`🚀 Subiendo ${INITIAL_ROUTES.length} rutas oficiales...`);
    const routesBatch = writeBatch(db);
    INITIAL_ROUTES.forEach((r) => {
      routesBatch.set(doc(db, "routes", r.id), {
        ...r,
        updatedAt: new Date().toISOString()
      });
    });
    await routesBatch.commit();
    console.log("✅ 37 Rutas subidas exitosamente a 'routes'.");

    // 3. Subir Tiendas Hogar y Moda
    console.log(`🏢 Subiendo ${HOGAR_Y_MODA_STORES.length} tiendas Hogar y Moda...`);
    const storesBatch = writeBatch(db);
    HOGAR_Y_MODA_STORES.forEach((s) => {
      storesBatch.set(doc(db, "stores", s.id), {
        ...s,
        updatedAt: new Date().toISOString()
      });
    });
    await storesBatch.commit();
    console.log("✅ Tiendas subidas exitosamente a 'stores'.");

    // 4. Subir Peajes Oficiales 2026
    console.log(`🧾 Subiendo ${KNOWN_TOLLS.length} peajes oficiales de Colombia...`);
    const tollsBatch = writeBatch(db);
    KNOWN_TOLLS.forEach((t) => {
      tollsBatch.set(doc(db, "tolls", t.id), {
        ...t,
        updatedAt: new Date().toISOString()
      });
    });
    await tollsBatch.commit();
    console.log("✅ Peajes subidos exitosamente a 'tolls'.");

    // 5. Subir Vehículos y Configuración
    console.log(`🚛 Subiendo ${VEHICLE_PROFILES.length} perfiles de vehículos...`);
    const vehiclesBatch = writeBatch(db);
    VEHICLE_PROFILES.forEach((v) => {
      vehiclesBatch.set(doc(db, "vehicles", v.id), {
        ...v,
        updatedAt: new Date().toISOString()
      });
    });
    await vehiclesBatch.commit();
    console.log("✅ Vehículos subidos a 'vehicles'.");

    // 6. Configuración salarial y laboral CST
    console.log("⚙️ Guardando configuración de costos y nómina CST en 'settings/labor_and_costs'...");
    await setDoc(doc(db, "settings", "labor_and_costs"), {
      ...DEFAULT_LABOR_CONFIG,
      updatedAt: new Date().toISOString()
    });
    console.log("✅ Configuración guardada.");

    // 7. Usuarios y roles iniciales
    console.log("👤 Creando perfiles de demostración en 'users'...");
    const users = [
      {
        uid: "demo-admin",
        email: "admin@hogarymoda.com",
        displayName: "Carlos Restrepo",
        role: "admin",
        phone: "+57 312 456 7890",
        company: "Hogar y Moda - Dirección de Operaciones",
        createdAt: new Date().toISOString()
      },
      {
        uid: "demo-dispatcher",
        email: "despacho@hogarymoda.com",
        displayName: "Marta Gómez",
        role: "dispatcher",
        phone: "+57 310 987 6543",
        company: "CEDI Caldas - Despacho & Flota",
        createdAt: new Date().toISOString()
      },
      {
        uid: "demo-driver",
        email: "conductor@hogarymoda.com",
        displayName: "Jhonatan Morales",
        role: "driver",
        phone: "+57 315 123 4567",
        company: "Transportes SCJ - Conductor NPR Turbo",
        assignedVehiclePlate: "WGB-342",
        assignedRouteId: "SCJ-001",
        createdAt: new Date().toISOString()
      },
      {
        uid: "demo-auditor",
        email: "auditor@hogarymoda.com",
        displayName: "Gloria Valencia",
        role: "auditor",
        phone: "+57 320 555 1234",
        company: "Auditoría & Control de Gestión",
        createdAt: new Date().toISOString()
      }
    ];

    const usersBatch = writeBatch(db);
    users.forEach((u) => {
      usersBatch.set(doc(db, "users", u.uid), u);
    });
    await usersBatch.commit();
    console.log("✅ Perfiles de usuarios creados en 'users'.");

    console.log("\n🎉 ¡MIGRACIÓN COMPLETA A FIREBASE EXITOSA! 🎉");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Error conectando a Firebase Firestore:", err);
    if (err.code === 'permission-denied') {
      console.log("\n⚠️ NOTA DE REGLAS DE SEGURIDAD:");
      console.log("Las reglas de Cloud Firestore en este proyecto actualmente requieren autenticación o están bloqueadas.");
      console.log("Para permitir la escritura, en Firebase Console ve a 'Firestore Database' > 'Reglas' (Rules) y cámbialas a modo de prueba o desarrollo.");
    }
    process.exit(1);
  }
}

main();
