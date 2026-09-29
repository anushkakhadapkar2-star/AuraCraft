const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, collection, query, where, getDocs } = require('firebase/firestore');
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

async function undoProduct() {
  const q = query(collection(db, "products"), where("slug", "==", "crochet-sunflower-bouquet"));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    console.log("Product crochet-sunflower-bouquet not found.");
    process.exit(1);
  }

  const productDoc = querySnapshot.docs[0];
  const docRef = doc(db, "products", productDoc.id);

  await updateDoc(docRef, {
    name: "Crochet Sunflower Bouquet",
    images: [{ url: "/products/crochet_sunflower.jpg", isPrimary: true, order: 1 }],
    updatedAt: new Date().toISOString()
  });

  console.log("Successfully reverted Yellow Crochet Lily Bouquet back to Crochet Sunflower Bouquet");
  process.exit(0);
}

undoProduct().catch(console.error);
