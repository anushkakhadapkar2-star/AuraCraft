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

async function updateProduct() {
  // We'll search for the product named "Sunflower Crochet" or similar 
  const q1 = query(collection(db, "products"), where("slug", "==", "single-sunflower-crochet"));
  let querySnapshot = await getDocs(q1);

  if (querySnapshot.empty) {
      console.log("Not found as single-sunflower-crochet, trying crochet-sunflower-bouquet...");
      const q2 = query(collection(db, "products"), where("slug", "==", "crochet-sunflower-bouquet"));
      querySnapshot = await getDocs(q2);
  }

  if (querySnapshot.empty) {
      // Fetch all and find one that includes 'sunflower'
      console.log("Not found by slug. Fetching all products...");
      const all = await getDocs(collection(db, "products"));
      const match = all.docs.find(d => d.data().name.toLowerCase().includes('sunflower'));
      if (match) {
          querySnapshot = { docs: [match], empty: false };
      }
  }
  
  if (querySnapshot.empty) {
    console.log("Product not found at all.");
    process.exit(1);
  }

  const productDoc = querySnapshot.docs[0];
  const docRef = doc(db, "products", productDoc.id);

  await updateDoc(docRef, {
    name: "Red Crochet Lily Wrap",
    slug: "red-crochet-lily-wrap",
    images: [{ url: "/products/crochet_red_lily.jpg", isPrimary: true, order: 1 }],
    updatedAt: new Date().toISOString()
  });

  console.log(`Successfully updated ${productDoc.data().name} to Red Crochet Lily Wrap`);
  process.exit(0);
}

updateProduct().catch(console.error);
