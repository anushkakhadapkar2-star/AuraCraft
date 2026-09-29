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

const updates = [
  {
    slug: "single-sunflower-crochet",
    newName: "Crochet Flower Appliques Set",
    newImage: "/products/crochet_flower_appliques.jpg"
  },
  {
    slug: "daisy-chain-crochet",
    newName: "Assorted Crochet Roses Set",
    newImage: "/products/crochet_roses_group.png"
  },
  {
    slug: "knitted-tulip-stem",
    newName: "Pink Crochet Rose Blossom",
    newImage: "/products/crochet_pink_rose.png"
  },
  {
    slug: "lavender-sprig-crochet",
    newName: "Red Crochet Rose Blossom",
    newImage: "/products/crochet_red_rose.png"
  }
];

async function updateProducts() {
  for (const update of updates) {
    const q = query(collection(db, "products"), where("slug", "==", update.slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`Product not found for slug: ${update.slug}`);
      continue;
    }

    const productDoc = querySnapshot.docs[0];
    const docRef = doc(db, "products", productDoc.id);

    await updateDoc(docRef, {
      name: update.newName,
      images: [{ url: update.newImage, isPrimary: true, order: 1 }],
      updatedAt: new Date().toISOString()
    });

    console.log(`Successfully updated ${update.slug} to ${update.newName}`);
  }

  console.log("All requested products have been updated!");
  process.exit(0);
}

updateProducts().catch(console.error);
