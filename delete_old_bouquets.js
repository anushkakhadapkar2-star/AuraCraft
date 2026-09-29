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

const namesToDelete = [
  "Autumn Harvest",
  "Miniature Daisy",
  "Patel Rose Bouquet",
  "Pastel Rose Bouquet", // Just in case it was spelled correctly in DB
  "Spring Mix Crochet",
  "Patel Rose Crochet",
  "Pastel Rose Crochet" // Just in case
];

async function deleteProducts() {
  const allProductsSnap = await getDocs(collection(db, "products"));
  let deletedCount = 0;
  
  for (const productDoc of allProductsSnap.docs) {
    const data = productDoc.data();
    
    // Check if the product name partially matches any in our list
    if (data.name) {
      const match = namesToDelete.some(name => data.name.toLowerCase().includes(name.toLowerCase()));
      if (match) {
        console.log(`Deleting product: ${data.name}`);
        await deleteDoc(doc(db, "products", productDoc.id));
        deletedCount++;
      }
    }
  }

  console.log(`Successfully deleted ${deletedCount} products.`);
  process.exit(0);
}

deleteProducts().catch(console.error);
