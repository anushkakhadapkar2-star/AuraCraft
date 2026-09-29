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

async function deleteProduct() {
  const allProductsSnap = await getDocs(collection(db, "products"));
  
  let deletedCount = 0;
  for (const productDoc of allProductsSnap.docs) {
    const data = productDoc.data();
    if (data.name && data.name.includes("Sunflower Crochet")) {
      console.log(`Found product to delete: ${data.name} (ID: ${productDoc.id})`);
      await deleteDoc(doc(db, "products", productDoc.id));
      deletedCount++;
    }
  }

  if (deletedCount === 0) {
    console.log("No products found matching 'Sunflower Crochet'.");
  } else {
    console.log(`Successfully deleted ${deletedCount} products.`);
  }
  
  process.exit(0);
}

deleteProduct().catch(console.error);
