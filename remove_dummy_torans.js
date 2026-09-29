const { initializeApp } = require('firebase/app');
const { getFirestore, doc, deleteDoc, collection, getDocs } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dummySlugs = [
  "golden-bells-toran",
  "boho-fringe-door-hanging",
  "mango-leaf-crochet-toran",
  "multicolor-rangoli-hanging"
];

async function removeDummies() {
  const allProductsSnap = await getDocs(collection(db, "products"));
  let deletedCount = 0;
  
  for (const productDoc of allProductsSnap.docs) {
    const data = productDoc.data();
    if (dummySlugs.includes(data.slug)) {
      console.log(`Deleting dummy product: ${data.name}`);
      await deleteDoc(doc(db, "products", productDoc.id));
      deletedCount++;
    }
  }

  console.log(`Successfully deleted ${deletedCount} dummy products.`);
  process.exit(0);
}

removeDummies().catch(console.error);
