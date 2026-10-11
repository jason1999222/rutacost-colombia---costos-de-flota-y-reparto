const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBqn7YzQcpD1gYws53GFuXbVUEb3uElRJM",
  authDomain: "app-empresarial-ffb59.firebaseapp.com",
  projectId: "app-empresarial-ffb59",
  storageBucket: "app-empresarial-ffb59.firebasestorage.app",
  messagingSenderId: "844586659907",
  appId: "1:844586659907:web:4388083833f1c10d78a4f6"
};

async function checkAll() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const collectionsToCheck = [
    'dispatches',
    'conductores',
    'fleet_units',
    'expense_concepts',
    'toll_stations',
    'stores',
    'routes',
    'vehicles'
  ];

  console.log('--- REVISIÓN DE COLECCIONES EN FIRESTORE ---');
  for (const colName of collectionsToCheck) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`✅ Colección '${colName}': ${snap.size} documentos online`);
    } catch (e) {
      console.error(`❌ Error en '${colName}':`, e.message);
    }
  }

  try {
    const laborDoc = await getDoc(doc(db, 'settings', 'labor_and_costs'));
    if (laborDoc.exists()) {
      console.log(`✅ Documento 'settings/labor_and_costs': EXISTE (smmlv: $${laborDoc.data().smmlv?.toLocaleString('es-CO')}, hora ordinaria: $${laborDoc.data().hourlyOrdinaryRate?.toLocaleString('es-CO')})`);
    } else {
      console.log(`⚠️ Documento 'settings/labor_and_costs': No encontrado aún.`);
    }
  } catch (e) {
    console.error("❌ Error en 'settings/labor_and_costs':", e.message);
  }

  process.exit(0);
}

checkAll();
