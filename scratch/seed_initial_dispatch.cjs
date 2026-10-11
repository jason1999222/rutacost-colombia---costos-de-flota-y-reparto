const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBqn7YzQcpD1gYws53GFuXbVUEb3uElRJM",
  authDomain: "app-empresarial-ffb59.firebaseapp.com",
  projectId: "app-empresarial-ffb59",
  storageBucket: "app-empresarial-ffb59.firebasestorage.app",
  messagingSenderId: "844586659907",
  appId: "1:844586659907:web:4388083833f1c10d78a4f6",
  measurementId: "G-WMWHZBW26S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDispatch() {
  const initialDispatch = {
    id: "DESP-2026-001",
    manifestNumber: "MAN-2026-001",
    createdAt: new Date().toISOString(),
    departureDate: "2026-09-25",
    departureTime: "06:00",
    returnDate: "2026-09-25",
    returnTime: "16:30",
    status: "LIQUIDADO",
    vehicleId: "npr-c2-turbo",
    vehiclePlate: "GTX052",
    vehicleName: "NPR Turbo C2 (Estacas)",
    driverName: "Jose Ibañez",
    driverDocument: "1.129.517.122",
    helpersCount: 1,
    helperNames: "Jair Gamboa",
    routeId: "SCJ-001",
    routeName: "Caldas - Rionegro - La Ceja - Marinilla",
    storesCount: 4,
    cargoDescription: "Despacho oficial de mercancía Hogar y Moda",
    plannedKm: 135,
    plannedHours: 9.5,
    plannedFuelCOP: 95040,
    plannedTollCOP: 48000,
    plannedLaborCOP: 148500,
    plannedMaintenanceCOP: 33750,
    plannedFixedCOP: 42000,
    plannedTotalCostCOP: 367290,
    departureOdometer: 142500,
    advancePaymentCOP: 180000,
    arrivalOdometer: 142638,
    actualKm: 138,
    actualFuelGallons: 10.2,
    actualFuelPricePerGallon: 10560,
    actualFuelCostCOP: 107712,
    actualTollCount: 4,
    actualTollCostCOP: 48000,
    actualHoursWorked: 10,
    actualOvertimeHours: 2,
    actualPerDiemCOP: 50000,
    actualIncidentalCOP: 15000,
    actualIncidentalsList: [
      { id: "inc-01", concept: "Pesaje en báscula", amountCOP: 15000 }
    ],
    incidentalNotes: "Pesaje obligatorio en peaje",
    plannedFreightCOP: 520000,
    actualLaborCostCOP: 155000,
    actualMaintenanceCostCOP: 34500,
    actualFixedCostCOP: 42000,
    actualTotalCostCOP: 402212,
    actualNetProfitCOP: 117788,
    actualMarginPct: 22.65,
    costVarianceCOP: 34922,
    driverBalanceCOP: -40712,
    settledAt: new Date().toISOString(),
    notes: "Ruta de prueba oficial inicial registrada en CEDI Caldas",
    syncedAt: new Date().toISOString()
  };

  await setDoc(doc(db, "dispatches", initialDispatch.id), initialDispatch, { merge: true });
  console.log("✅ Despacho oficial 'DESP-2026-001' (MAN-2026-001) guardado con éxito en Firestore!");
}

seedDispatch().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
