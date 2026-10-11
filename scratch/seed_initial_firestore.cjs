const { initializeApp } = require('firebase/app');
const { getFirestore, collection, writeBatch, doc, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBqn7YzQcpD1gYws53GFuXbVUEb3uElRJM",
  authDomain: "app-empresarial-ffb59.firebaseapp.com",
  projectId: "app-empresarial-ffb59",
  storageBucket: "app-empresarial-ffb59.firebasestorage.app",
  messagingSenderId: "844586659907",
  appId: "1:844586659907:web:4388083833f1c10d78a4f6"
};

const FLEET_UNITS = [
  { plate: 'GTX052', name: 'MAXIMO (NPR Turbo)', vehicleProfileId: 'npr-c2-turbo', vehicleType: 'NPR', capacityTons: 4.5, fuelEfficiencyKmPerGal: 22.5, maintenanceCostPerKm: 326, tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
  { plate: 'ESQ742', name: 'MARCO POLO (NPR Turbo 2022)', vehicleProfileId: 'npr-c2-turbo', vehicleType: 'NPR', modelYear: 2022, capacityTons: 4.8, fuelEfficiencyKmPerGal: 22.5, maintenanceCostPerKm: 326, tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
  { plate: 'ESQ294', name: 'GOLIAT (NPR Turbo 2019)', vehicleProfileId: 'npr-c2-turbo', vehicleType: 'NPR', modelYear: 2019, capacityTons: 4.5, fuelEfficiencyKmPerGal: 22.5, maintenanceCostPerKm: 326, tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
  { plate: 'JYY249', name: 'ZEUSS (NPR Liviano)', vehicleProfileId: 'npr-c2-turbo', vehicleType: 'NPR', capacityTons: 3.8, fuelEfficiencyKmPerGal: 22.5, maintenanceCostPerKm: 326, tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
  { plate: 'PUN774', name: 'ORION (NLR Liviano)', vehicleProfileId: 'nlr-camioneta', vehicleType: 'NLR', capacityTons: 3.0, fuelEfficiencyKmPerGal: 31.0, maintenanceCostPerKm: 247, tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
  { plate: 'PUN276', name: 'FENIX (NLR Liviano)', vehicleProfileId: 'nlr-camioneta', vehicleType: 'NLR', capacityTons: 3.0, fuelEfficiencyKmPerGal: 31.0, maintenanceCostPerKm: 247, tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
  { plate: 'LKN995', name: 'PERSEO (NLR Liviano)', vehicleProfileId: 'nlr-camioneta', vehicleType: 'NLR', capacityTons: 3.0, fuelEfficiencyKmPerGal: 31.0, maintenanceCostPerKm: 247, tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
  { plate: 'JYX457', name: 'TITAN (NLR Liviano 2022)', vehicleProfileId: 'nlr-camioneta', vehicleType: 'NLR', modelYear: 2022, capacityTons: 2.2, fuelEfficiencyKmPerGal: 31.0, maintenanceCostPerKm: 247, tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' },
  { plate: 'WLL377', name: 'PEGASO (NLR Liviano 2023)', vehicleProfileId: 'nlr-camioneta', vehicleType: 'NLR', modelYear: 2023, capacityTons: 2.8, fuelEfficiencyKmPerGal: 31.0, maintenanceCostPerKm: 247, tecnoStatus: 'VIGENTE', soatStatus: 'VIGENTE' }
];

const EXPENSES = [
  { id: 'EXP-CARGUE-NOCT', tipo: 'CARGUE EXTRAORDINARIO', descripcion: 'Cuadrilla de cargue nocturno en CEDI Caldas', valorSugerido: 45000, unidad: 'Por viaje' },
  { id: 'EXP-DESCARGUE-ESP', tipo: 'MANIPULACIÓN ESPECIAL', descripcion: 'Descargue en local sin rampa o acceso difícil', valorSugerido: 35000, unidad: 'Por almacén' },
  { id: 'EXP-PARQUEADERO', tipo: 'PERNOCTA / PARQUEADERO', descripcion: 'Estadía nocturna vigilada en ruta foránea', valorSugerido: 25000, unidad: 'Por noche' },
  { id: 'EXP-LAVADO-VIAJE', tipo: 'LAVADO OPERATIVO', descripcion: 'Lavado a presión de furgón tras viaje lluvioso', valorSugerido: 30000, unidad: 'Por servicio' },
  { id: 'EXP-IMPREVISTO', tipo: 'FONDO DE CONTINGENCIA', descripcion: 'Respaldo para desvíos viales o peajes temporales', valorSugerido: 50000, unidad: 'Por ruta' }
];

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('--- SUBIENDO FLOTA Y GASTOS A FIRESTORE ---');
  
  // 1. Fleet
  const batchFleet = writeBatch(db);
  FLEET_UNITS.forEach(f => {
    batchFleet.set(doc(db, 'fleet_units', f.plate), { ...f, id: f.plate, syncedAt: new Date().toISOString() }, { merge: true });
  });
  await batchFleet.commit();
  console.log(`✅ ${FLEET_UNITS.length} camiones subidos a 'fleet_units'`);

  // 2. Expenses
  const batchExp = writeBatch(db);
  EXPENSES.forEach(e => {
    batchExp.set(doc(db, 'expense_concepts', e.id), { ...e, syncedAt: new Date().toISOString() }, { merge: true });
  });
  await batchExp.commit();
  console.log(`✅ ${EXPENSES.length} conceptos subidos a 'expense_concepts'`);

  // 3. Toll stations (copiar de 'tolls' a 'toll_stations')
  const tollsSnap = await getDocs(collection(db, 'tolls'));
  if (!tollsSnap.empty) {
    const batchTolls = writeBatch(db);
    tollsSnap.forEach(d => {
      batchTolls.set(doc(db, 'toll_stations', d.id), { ...d.data(), syncedAt: new Date().toISOString() }, { merge: true });
    });
    await batchTolls.commit();
    console.log(`✅ ${tollsSnap.size} peajes sincronizados en 'toll_stations'`);
  }

  process.exit(0);
}

seed();
