const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

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

// Leer las 37 rutas originales de initialRoutes.ts
const initialRoutesFile = fs.readFileSync(path.join(__dirname, '../src/data/initialRoutes.ts'), 'utf8');

// Extraer id y tollStations de cada ruta
const regex = /id:\s*['"](SCJ-\d+)['"][\s\S]*?tollStations:\s*['"]([^'"]+)['"]/g;
const routeTollsMap = new Map();
let m;
while ((m = regex.exec(initialRoutesFile)) !== null) {
  routeTollsMap.set(m[1], m[2]);
}

console.log(`Encontradas ${routeTollsMap.size} rutas con peajes en initialRoutes.ts`);

async function fixRoutesInFirestore() {
  for (const [id, tollStations] of routeTollsMap.entries()) {
    await setDoc(doc(db, 'routes', id), {
      tollStations: tollStations,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`✓ Ruta ${id} reparada con tollStations: "${tollStations}"`);
  }
  console.log("✅ ¡Todas las 37 rutas en Firestore reparadas con sus tollStations correctos!");
}

fixRoutesInFirestore().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
