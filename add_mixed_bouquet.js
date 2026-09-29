const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs, query, where } = require('firebase/firestore');
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

const newProduct = {
  name: "Colorful Mixed Crochet Bouquet",
  slug: "colorful-mixed-crochet-bouquet",
  sku: "UP-FLW-005",
  description: "A bright and vibrant collection of crochet sunflowers, tulips, roses, and lilies arranged beautifully. Vase not included.",
  price: 2999,
  discountPrice: 2499,
  status: "ACTIVE",
  isFeatured: true,
  isBestSeller: true,
  isNewArrival: true,
  material: "Cotton Yarn",
  categorySlug: "crochet-flowers",
  images: [{ url: "/products/crochet_mixed_bouquet_vase.png", isPrimary: true, order: 1 }],
  inventory: { currentStock: 8, lowStockThreshold: 2 }
};

async function addProduct() {
  console.log("Fetching Crochet Flowers category...");
  const catQuery = query(collection(db, 'categories'), where("slug", "==", "crochet-flowers"));
  const catSnap = await getDocs(catQuery);
  
  if (catSnap.empty) {
    console.log("Category crochet-flowers not found!");
    process.exit(1);
  }

  const categoryDoc = catSnap.docs[0];
  const categoryId = categoryDoc.id;
  const categoryName = categoryDoc.data().name;

  console.log(`Adding ${newProduct.name}...`);
  const docRef = doc(collection(db, 'products'));
  await setDoc(docRef, {
    ...newProduct,
    categoryId: categoryId,
    categoryName: categoryName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log("Successfully added the new mixed bouquet to Crochet Flowers!");
  process.exit(0);
}

addProduct().catch(console.error);
