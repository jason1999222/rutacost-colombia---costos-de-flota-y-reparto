import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const config = {
  apiKey: "AIzaSyBqn7YzQcpD1gYws53GFuXbVUEb3uElRJM",
  authDomain: "app-empresarial-ffb59.firebaseapp.com",
  projectId: "app-empresarial-ffb59",
  storageBucket: "app-empresarial-ffb59.firebasestorage.app",
  messagingSenderId: "844586659907",
  appId: "1:844586659907:web:4388083833f1c10d78a4f6"
};

const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'users'));
  console.log(`Found ${snap.size} users in Firestore.`);
  for (const d of snap.docs) {
    const data = d.data();
    console.log(`User: ${d.id} | Email: ${data.email} | Company: "${data.company}"`);
    if (!data.company || data.company.includes('Hogar y Moda') || data.company !== 'SCJ') {
      console.log(`Updating company for ${data.email} to "SCJ"...`);
      await updateDoc(doc(db, 'users', d.id), { company: 'SCJ' });
    }
  }
  console.log("Finished updating Firestore users.");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
